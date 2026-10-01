package com.example.sync

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothProfile
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import com.example.model.GpsData
import com.example.model.ImuData
import com.example.model.RiderProfile
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.io.OutputStream
import java.net.InetSocketAddress
import java.net.Socket
import java.util.Locale
import java.util.UUID
import java.util.concurrent.TimeUnit

enum class SyncTransport {
  WEBSOCKET,
  WIFI_TCP,
  BLUETOOTH_SPP,
  STANDALONE_LOGGER
}

data class Esp32SyncStatus(
  val isSyncActive: Boolean = false,
  val isConnecting: Boolean = false,
  val connectingDeviceAddress: String? = null,
  val transport: SyncTransport = SyncTransport.WEBSOCKET,
  val esp32Ip: String = "192.168.4.1",
  val esp32Port: Int = 8080,
  val esp32WsUrl: String = "ws://192.168.4.1:81/ws",
  val btMacAddress: String = "30:AE:A4:78:2A:12",
  val btDeviceName: String = "RAMS Bluetooth Connection",
  val packetsSent: Long = 0L,
  val bytesSent: Long = 0L,
  val syncRateHz: Int = 20,
  val loraReady: Boolean = true,
  val lastTransmittedJson: String = "",
  val statusMessage: String = "Ready to stream IMU & GPS via Safety Wearable Link",
  val loraRssi: Int = -64,
  val loraAckCount: Long = 0L
)

class Esp32SyncEngine(
  private val scope: CoroutineScope,
  private val context: Context? = null
) {
  companion object {
    private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")
    val NUS_SERVICE_UUID: UUID = UUID.fromString("6E400001-B5A3-F393-E0A9-E50E24DCCA9E")
    val NUS_RX_CHAR_UUID: UUID = UUID.fromString("6E400002-B5A3-F393-E0A9-E50E24DCCA9E") // Phone -> ESP32 Write
    val NUS_TX_CHAR_UUID: UUID = UUID.fromString("6E400003-B5A3-F393-E0A9-E50E24DCCA9E") // ESP32 -> Phone Notify
    val CLIENT_CONFIG_DESCRIPTOR_UUID: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")
  }

  private val _syncStatus = MutableStateFlow(Esp32SyncStatus())
  val syncStatus: StateFlow<Esp32SyncStatus> = _syncStatus.asStateFlow()

  private var syncLoopJob: Job? = null
  private var activeSocket: Socket? = null
  private var activeBtSocket: BluetoothSocket? = null
  private var activeBleGatt: BluetoothGatt? = null
  private var activeBleRxChar: BluetoothGattCharacteristic? = null
  private var activeWebSocket: WebSocket? = null
  private var outputStream: OutputStream? = null

  private val okHttpClient: OkHttpClient by lazy {
    OkHttpClient.Builder()
      .connectTimeout(5, TimeUnit.SECONDS)
      .readTimeout(0, TimeUnit.MILLISECONDS)
      .writeTimeout(5, TimeUnit.SECONDS)
      .build()
  }

  private var packetCountAccumulator = 0
  private var bytesAccumulator = 0L
  private var rateTimer = System.currentTimeMillis()
  @Volatile private var isManualDisconnect = false
  @Volatile private var negotiatedMtu = 23
  // Auto-reconnect state for BLE
  private var pendingBleReconnectDevice: BluetoothDevice? = null
  private var pendingBleReconnectGps: (() -> GpsData)? = null
  private var pendingBleReconnectImu: (() -> ImuData)? = null
  private var pendingBleReconnectProfile: (() -> RiderProfile)? = null

  fun startWebSocketSync(
    wsUrl: String,
    getGps: () -> GpsData,
    getImu: () -> ImuData,
    getRiderProfile: () -> RiderProfile
  ) {
    stopSync()
    _syncStatus.value = _syncStatus.value.copy(
      transport = SyncTransport.WEBSOCKET,
      esp32WsUrl = wsUrl,
      statusMessage = "Connecting to WebSocket at $wsUrl..."
    )

    syncLoopJob = scope.launch(Dispatchers.IO) {
      try {
        val request = Request.Builder().url(wsUrl).build()

        activeWebSocket = okHttpClient.newWebSocket(request, object : WebSocketListener() {
          override fun onOpen(webSocket: WebSocket, response: Response) {
            _syncStatus.value = _syncStatus.value.copy(
              isSyncActive = true,
              statusMessage = "WebSocket Connected to ESP32 ($wsUrl)"
            )
          }

          override fun onMessage(webSocket: WebSocket, text: String) {
            try {
              if (text.startsWith("{") && text.endsWith("}")) {
                val json = JSONObject(text)
                val rssi = json.optInt("rssi", _syncStatus.value.loraRssi)
                val ack = json.optBoolean("lora_ack", false)
                if (ack) {
                  _syncStatus.value = _syncStatus.value.copy(
                    loraRssi = rssi,
                    loraAckCount = _syncStatus.value.loraAckCount + 1
                  )
                }
              }
            } catch (_: Exception) {}
          }

          override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
            _syncStatus.value = _syncStatus.value.copy(
              isSyncActive = false,
              statusMessage = "WebSocket Closed ($reason)"
            )
          }

          override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            _syncStatus.value = _syncStatus.value.copy(
              isSyncActive = false,
              statusMessage = "WebSocket Disconnected ($wsUrl)"
            )
          }
        })

        runWebSocketStreamingLoop(getGps, getImu, getRiderProfile)
      } catch (e: Exception) {
        _syncStatus.value = _syncStatus.value.copy(
          isSyncActive = false,
          statusMessage = "WebSocket Connection Failed ($wsUrl)"
        )
      }
    }
  }

  fun startWifiSync(
    ip: String,
    port: Int,
    getGps: () -> GpsData,
    getImu: () -> ImuData,
    getRiderProfile: () -> RiderProfile
  ) {
    stopSync()
    _syncStatus.value = _syncStatus.value.copy(
      transport = SyncTransport.WIFI_TCP,
      esp32Ip = ip,
      esp32Port = port,
      statusMessage = "Connecting to ESP32 at $ip:$port..."
    )

    syncLoopJob = scope.launch(Dispatchers.IO) {
      try {
        val socket = Socket()
        socket.tcpNoDelay = true
        socket.connect(InetSocketAddress(ip, port), 4000)
        activeSocket = socket
        outputStream = socket.getOutputStream()

        _syncStatus.value = _syncStatus.value.copy(
          isSyncActive = true,
          statusMessage = "Syncing Phone IMU & GPS -> ESP32 ($ip:$port)"
        )

        runStreamingLoop(getGps, getImu, getRiderProfile)
      } catch (e: Exception) {
        _syncStatus.value = _syncStatus.value.copy(
          isSyncActive = false,
          statusMessage = "Wi-Fi Connection Failed ($ip:$port)"
        )
      }
    }
  }

  @SuppressLint("MissingPermission")
  fun startBluetoothSync(
    mac: String,
    name: String,
    getGps: () -> GpsData,
    getImu: () -> ImuData,
    getRiderProfile: () -> RiderProfile
  ) {
    stopSync()
    _syncStatus.value = _syncStatus.value.copy(
      transport = SyncTransport.BLUETOOTH_SPP,
      btMacAddress = mac,
      btDeviceName = name,
      isConnecting = true,
      connectingDeviceAddress = mac,
      statusMessage = "Connecting to $name..."
    )

    syncLoopJob = scope.launch(Dispatchers.IO) {
      try {
        val adapter = BluetoothAdapter.getDefaultAdapter()
        try {
          if (adapter?.isDiscovering == true) {
            adapter.cancelDiscovery()
          }
        } catch (_: SecurityException) {}

        val device = adapter?.getRemoteDevice(mac)
        if (device == null) {
          throw IllegalStateException("Bluetooth device not found: $mac")
        }

        // ESP32-S3 uses BLE GATT (NUS profile). Prioritize BLE for RAMS Wearables.
        val isExplicitClassic = device.type == BluetoothDevice.DEVICE_TYPE_CLASSIC
        val isLikelyBle = device.type == BluetoothDevice.DEVICE_TYPE_LE ||
                          device.type == BluetoothDevice.DEVICE_TYPE_UNKNOWN ||
                          device.type == BluetoothDevice.DEVICE_TYPE_DUAL ||
                          name.contains("RAMS", ignoreCase = true) ||
                          name.contains("Wearable", ignoreCase = true) ||
                          name.contains("ESP", ignoreCase = true)

        if (!isExplicitClassic || isLikelyBle) {
          if (context != null) {
            _syncStatus.value = _syncStatus.value.copy(
              statusMessage = "Connecting via BLE GATT ($name)..."
            )
            connectBleGatt(device, getGps, getImu, getRiderProfile)
            return@launch
          }
        }

        // Fallback: Attempt Classic Bluetooth RFCOMM SPP only if device is strictly classic
        try {
          val btSocket = device.createRfcommSocketToServiceRecord(SPP_UUID)
          btSocket.connect()
          activeBtSocket = btSocket
          outputStream = btSocket.outputStream

          _syncStatus.value = _syncStatus.value.copy(
            isSyncActive = true,
            isConnecting = false,
            statusMessage = "Connected to $name via Classic BT SPP"
          )
          runStreamingLoop(getGps, getImu, getRiderProfile)
        } catch (classicEx: Exception) {
          if (context != null) {
            _syncStatus.value = _syncStatus.value.copy(
              statusMessage = "RFCOMM unavailable, connecting via BLE GATT..."
            )
            connectBleGatt(device, getGps, getImu, getRiderProfile)
          } else {
            throw classicEx
          }
        }
      } catch (e: Exception) {
        _syncStatus.value = _syncStatus.value.copy(
          isSyncActive = false,
          isConnecting = false,
          statusMessage = "Bluetooth Failed: ${e.message ?: "Device unreachable"}"
        )
      }
    }
  }

  @SuppressLint("MissingPermission")
  private suspend fun connectBleGatt(
    device: BluetoothDevice,
    getGps: () -> GpsData,
    getImu: () -> ImuData,
    getRiderProfile: () -> RiderProfile
  ) {
    val appContext = context ?: throw IllegalStateException("Context required for BLE GATT connection")
    isManualDisconnect = false
    pendingBleReconnectDevice = device
    pendingBleReconnectGps = getGps
    pendingBleReconnectImu = getImu
    pendingBleReconnectProfile = getRiderProfile
    val connectionLatch = CompletableDeferred<Boolean>()

    val gattCallback = object : BluetoothGattCallback() {
      override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
        if (newState == BluetoothProfile.STATE_CONNECTED) {
          _syncStatus.value = _syncStatus.value.copy(
            statusMessage = "GATT Connected. Discovering services..."
          )
          // Essential for ESP32-S3: 300ms delay on Main Looper before service discovery
          Handler(Looper.getMainLooper()).postDelayed({
            try {
              val ok = gatt.discoverServices()
              if (!ok && !connectionLatch.isCompleted) {
                _syncStatus.value = _syncStatus.value.copy(
                  statusMessage = "Failed to initiate service discovery"
                )
                connectionLatch.complete(false)
              }
            } catch (_: Exception) {
              if (!connectionLatch.isCompleted) connectionLatch.complete(false)
            }
          }, 300)
        } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
          negotiatedMtu = 23
          _syncStatus.value = _syncStatus.value.copy(
            isSyncActive = false,
            isConnecting = false,
            statusMessage = "BLE Disconnected (status: $status)"
          )
          if (!connectionLatch.isCompleted) {
            connectionLatch.complete(false)
          }
          // Auto-reconnect if not a manual disconnect
          if (!isManualDisconnect && pendingBleReconnectDevice != null) {
            _syncStatus.value = _syncStatus.value.copy(
              statusMessage = "BLE Disconnected — Auto-reconnecting in 3s..."
            )
            scope.launch(Dispatchers.IO) {
              delay(3000L)
              if (!isManualDisconnect && pendingBleReconnectDevice != null) {
                try {
                  _syncStatus.value = _syncStatus.value.copy(
                    isConnecting = true,
                    statusMessage = "Auto-reconnecting to BLE device..."
                  )
                  connectBleGatt(
                    pendingBleReconnectDevice!!,
                    pendingBleReconnectGps!!,
                    pendingBleReconnectImu!!,
                    pendingBleReconnectProfile!!
                  )
                } catch (e: Exception) {
                  _syncStatus.value = _syncStatus.value.copy(
                    isConnecting = false,
                    statusMessage = "Auto-reconnect failed: ${e.message}"
                  )
                }
              }
            }
          }
        }
      }

      override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
        if (status == BluetoothGatt.GATT_SUCCESS) {
          var service = gatt.getService(NUS_SERVICE_UUID)
          if (service == null) {
            service = gatt.services.firstOrNull {
              it.uuid.toString().equals(NUS_SERVICE_UUID.toString(), ignoreCase = true)
            }
          }

          if (service != null) {
            activeBleGatt = gatt
            activeBleRxChar = service.getCharacteristic(NUS_RX_CHAR_UUID)
                              ?: service.characteristics.firstOrNull {
                                   it.uuid.toString().equals(NUS_RX_CHAR_UUID.toString(), ignoreCase = true)
                                 }

            val txChar = service.getCharacteristic(NUS_TX_CHAR_UUID)
                         ?: service.characteristics.firstOrNull {
                              it.uuid.toString().equals(NUS_TX_CHAR_UUID.toString(), ignoreCase = true)
                            }

            if (txChar != null) {
              gatt.setCharacteristicNotification(txChar, true)
              val desc = txChar.getDescriptor(CLIENT_CONFIG_DESCRIPTOR_UUID)
              if (desc != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                  gatt.writeDescriptor(desc, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)
                } else {
                  desc.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                  gatt.writeDescriptor(desc)
                }
              }
            }

            // Request MTU 512 for fast telemetry transfer
            try { gatt.requestMtu(512) } catch (_: Exception) {}

            val finalName = try { device.name ?: "RAMS Wearable" } catch (_: SecurityException) { "RAMS Wearable" }
            _syncStatus.value = _syncStatus.value.copy(
              isSyncActive = true,
              isConnecting = false,
              btDeviceName = finalName,
              statusMessage = "Connected to $finalName (BLE NUS Active)"
            )
            if (!connectionLatch.isCompleted) {
              connectionLatch.complete(true)
            }
          } else {
            val found = gatt.services.map { it.uuid.toString() }.joinToString(", ")
            _syncStatus.value = _syncStatus.value.copy(
              isConnecting = false,
              statusMessage = "RAMS NUS service not found. Discovered: $found"
            )
            if (!connectionLatch.isCompleted) {
              connectionLatch.complete(false)
            }
          }
        } else {
          _syncStatus.value = _syncStatus.value.copy(
            isConnecting = false,
            statusMessage = "Service discovery failed with status $status"
          )
          if (!connectionLatch.isCompleted) {
            connectionLatch.complete(false)
          }
        }
      }

      override fun onCharacteristicChanged(
        gatt: BluetoothGatt,
        characteristic: BluetoothGattCharacteristic
      ) {
        val bytes = characteristic.value ?: return
        val text = String(bytes, Charsets.UTF_8)
        parseIncomingBlePacket(text)
      }

      override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
        if (status == BluetoothGatt.GATT_SUCCESS) {
          negotiatedMtu = mtu
        }
      }

      override fun onCharacteristicChanged(
        gatt: BluetoothGatt,
        characteristic: BluetoothGattCharacteristic,
        value: ByteArray
      ) {
        val text = String(value, Charsets.UTF_8)
        parseIncomingBlePacket(text)
      }
    }

    val gatt = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      device.connectGatt(appContext, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
    } else {
      device.connectGatt(appContext, false, gattCallback)
    }
    if (gatt == null) {
      throw IllegalStateException("connectGatt returned null")
    }
    activeBleGatt = gatt

    val connected = withTimeoutOrNull(15000L) { connectionLatch.await() } ?: false
    if (connected) {
      // Store reconnect references for auto-reconnect on disconnect
      pendingBleReconnectDevice = device
      pendingBleReconnectGps = getGps
      pendingBleReconnectImu = getImu
      pendingBleReconnectProfile = getRiderProfile
      runBleStreamingLoop(getGps, getImu, getRiderProfile)
    } else {
      try { gatt.disconnect() } catch (_: Exception) {}
      try { gatt.close() } catch (_: Exception) {}
      activeBleGatt = null
      throw IllegalStateException(_syncStatus.value.statusMessage.ifBlank { "BLE connection timed out after 15s" })
    }
  }

  @SuppressLint("MissingPermission")
  private suspend fun writeBleBytes(gatt: BluetoothGatt, rxChar: BluetoothGattCharacteristic, bytes: ByteArray) {
    val mtuPayload = (negotiatedMtu - 3).coerceIn(20, 509)
    var offset = 0
    while (offset < bytes.size) {
      val chunkSize = Math.min(mtuPayload, bytes.size - offset)
      val chunk = bytes.copyOfRange(offset, offset + chunkSize)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        gatt.writeCharacteristic(rxChar, chunk, BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE)
      } else {
        rxChar.value = chunk
        rxChar.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
        gatt.writeCharacteristic(rxChar)
      }
      offset += chunkSize
      if (offset < bytes.size) {
        delay(25L) // Inter-chunk pacing to avoid BLE buffer congestion
      }
    }
  }

  @SuppressLint("MissingPermission")
  private suspend fun runBleStreamingLoop(
    getGps: () -> GpsData,
    getImu: () -> ImuData,
    getRiderProfile: () -> RiderProfile
  ) {
    rateTimer = System.currentTimeMillis()
    packetCountAccumulator = 0
    bytesAccumulator = 0L

    while (scope.isActive && activeBleGatt != null && activeBleRxChar != null) {
      val gps = getGps()
      val imu = getImu()
      val profile = getRiderProfile()

      val payload = buildTelemetryPacket(gps, imu, profile)
      val bytes = (payload + "\n").toByteArray(Charsets.UTF_8)

      try {
        val gatt = activeBleGatt
        val rx = activeBleRxChar
        if (gatt != null && rx != null) {
          writeBleBytes(gatt, rx, bytes)

          packetCountAccumulator++
          bytesAccumulator += bytes.size

          val now = System.currentTimeMillis()
          if (now - rateTimer >= 1000L) {
            _syncStatus.value = _syncStatus.value.copy(
              packetsSent = _syncStatus.value.packetsSent + packetCountAccumulator,
              bytesSent = _syncStatus.value.bytesSent + bytesAccumulator,
              syncRateHz = packetCountAccumulator,
              lastTransmittedJson = payload
            )
            packetCountAccumulator = 0
            bytesAccumulator = 0L
            rateTimer = now
          }
        }
      } catch (e: Exception) {
        // Log transient error but continue streaming instead of breaking
        _syncStatus.value = _syncStatus.value.copy(
          statusMessage = "BLE write error (retrying): ${e.message}"
        )
        delay(200L) // Brief backoff before retry
        continue
      }

      delay(100L) // 10Hz BLE streaming interval
    }
  }

  private fun parseIncomingBlePacket(text: String) {
    try {
      if (text.startsWith("{") && text.contains("}")) {
        val json = JSONObject(text.trim())
        if (json.optString("type") == "alert") {
          val peakG = json.optDouble("peak", 0.0).toFloat()
          _syncStatus.value = _syncStatus.value.copy(
            statusMessage = "WEARABLE CRASH ALERT: Peak ${peakG}G"
          )
        } else if (json.optString("type") == "CANCEL_ALERT_ACK") {
          _syncStatus.value = _syncStatus.value.copy(
            statusMessage = "Wearable Alert Cancelled (Button Pressed)"
          )
        } else if (json.optString("type") == "tel") {
          _syncStatus.value = _syncStatus.value.copy(
            lastTransmittedJson = text.trim()
          )
        }
      }
    } catch (_: Exception) {}
  }

  fun stopSync() {
    isManualDisconnect = true
    pendingBleReconnectDevice = null
    pendingBleReconnectGps = null
    pendingBleReconnectImu = null
    pendingBleReconnectProfile = null
    syncLoopJob?.cancel()
    syncLoopJob = null
    try { activeWebSocket?.close(1000, "User Stopped") } catch (_: Exception) {}
    try { outputStream?.close() } catch (_: Exception) {}
    try { activeSocket?.close() } catch (_: Exception) {}
    try { activeBtSocket?.close() } catch (_: Exception) {}
    try { activeBleGatt?.disconnect() } catch (_: Exception) {}
    try { activeBleGatt?.close() } catch (_: Exception) {}
    activeWebSocket = null
    outputStream = null
    activeSocket = null
    activeBtSocket = null
    activeBleGatt = null
    activeBleRxChar = null
    _syncStatus.value = _syncStatus.value.copy(
      isSyncActive = false,
      isConnecting = false,
      connectingDeviceAddress = null,
      statusMessage = "Sync stopped"
    )
  }

  fun sendWebSocketPing() {
    activeWebSocket?.send("{\"type\":\"PING\",\"t\":${System.currentTimeMillis()}}")
  }

  private suspend fun runWebSocketStreamingLoop(
    getGps: () -> GpsData,
    getImu: () -> ImuData,
    getRiderProfile: () -> RiderProfile
  ) {
    rateTimer = System.currentTimeMillis()
    packetCountAccumulator = 0
    bytesAccumulator = 0L

    while (scope.isActive) {
      val gps = getGps()
      val imu = getImu()
      val profile = getRiderProfile()

      val payload = buildTelemetryPacket(gps, imu, profile)
      val bytesSize = payload.toByteArray(Charsets.UTF_8).size

      // Send to WebSocket if connected
      activeWebSocket?.send(payload)

      packetCountAccumulator++
      bytesAccumulator += bytesSize

      val now = System.currentTimeMillis()
      if (now - rateTimer >= 1000L) {
        _syncStatus.value = _syncStatus.value.copy(
          packetsSent = _syncStatus.value.packetsSent + packetCountAccumulator,
          bytesSent = _syncStatus.value.bytesSent + bytesAccumulator,
          syncRateHz = packetCountAccumulator,
          lastTransmittedJson = payload
        )
        packetCountAccumulator = 0
        bytesAccumulator = 0L
        rateTimer = now
      }

      delay(50L) // 20Hz update
    }
  }

  private suspend fun runWebSocketSimulatedLoop(
    getGps: () -> GpsData,
    getImu: () -> ImuData,
    getRiderProfile: () -> RiderProfile
  ) {
    rateTimer = System.currentTimeMillis()
    packetCountAccumulator = 0
    bytesAccumulator = 0L

    while (scope.isActive) {
      val gps = getGps()
      val imu = getImu()
      val profile = getRiderProfile()

      val payload = buildTelemetryPacket(gps, imu, profile)
      val bytesSize = payload.toByteArray(Charsets.UTF_8).size

      packetCountAccumulator++
      bytesAccumulator += bytesSize

      val now = System.currentTimeMillis()
      if (now - rateTimer >= 1000L) {
        _syncStatus.value = _syncStatus.value.copy(
          packetsSent = _syncStatus.value.packetsSent + packetCountAccumulator,
          bytesSent = _syncStatus.value.bytesSent + bytesAccumulator,
          syncRateHz = packetCountAccumulator,
          lastTransmittedJson = payload
        )
        packetCountAccumulator = 0
        bytesAccumulator = 0L
        rateTimer = now
      }

      delay(50L) // 20Hz update
    }
  }

  private suspend fun runStreamingLoop(
    getGps: () -> GpsData,
    getImu: () -> ImuData,
    getRiderProfile: () -> RiderProfile
  ) {
    rateTimer = System.currentTimeMillis()
    packetCountAccumulator = 0
    bytesAccumulator = 0L

    while (scope.isActive && outputStream != null) {
      val gps = getGps()
      val imu = getImu()
      val profile = getRiderProfile()

      val payload = buildTelemetryPacket(gps, imu, profile)
      val bytes = (payload + "\n").toByteArray(Charsets.UTF_8)

      try {
        outputStream?.write(bytes)
        outputStream?.flush()

        packetCountAccumulator++
        bytesAccumulator += bytes.size

        val now = System.currentTimeMillis()
        if (now - rateTimer >= 1000L) {
          _syncStatus.value = _syncStatus.value.copy(
            packetsSent = _syncStatus.value.packetsSent + packetCountAccumulator,
            bytesSent = _syncStatus.value.bytesSent + bytesAccumulator,
            syncRateHz = packetCountAccumulator,
            lastTransmittedJson = payload
          )
          packetCountAccumulator = 0
          bytesAccumulator = 0L
          rateTimer = now
        }
      } catch (e: Exception) {
        break
      }

      delay(50L) // 20Hz transmission rate
    }
  }

  private suspend fun runSimulatedStreamingLoop(
    getGps: () -> GpsData,
    getImu: () -> ImuData,
    getRiderProfile: () -> RiderProfile
  ) {
    rateTimer = System.currentTimeMillis()
    packetCountAccumulator = 0
    bytesAccumulator = 0L

    while (scope.isActive) {
      val gps = getGps()
      val imu = getImu()
      val profile = getRiderProfile()

      val payload = buildTelemetryPacket(gps, imu, profile)
      val bytesSize = payload.toByteArray(Charsets.UTF_8).size

      packetCountAccumulator++
      bytesAccumulator += bytesSize

      val now = System.currentTimeMillis()
      if (now - rateTimer >= 1000L) {
        _syncStatus.value = _syncStatus.value.copy(
          packetsSent = _syncStatus.value.packetsSent + packetCountAccumulator,
          bytesSent = _syncStatus.value.bytesSent + bytesAccumulator,
          syncRateHz = packetCountAccumulator,
          lastTransmittedJson = payload
        )
        packetCountAccumulator = 0
        bytesAccumulator = 0L
        rateTimer = now
      }

      delay(50L) // 20Hz update
    }
  }

  fun sendEmergencyCrashPacket(
    gps: GpsData,
    imu: ImuData,
    riderProfile: RiderProfile
  ) {
    scope.launch(Dispatchers.IO) {
      val emergencyJson = JSONObject().apply {
        put("type", "EMERGENCY_ALERT")
        put("shock", 1)
        put("token", riderProfile.token)
        put("rider", riderProfile.riderName)
        put("plate", riderProfile.plateNumber)
        put("contact", riderProfile.emergencyContactPhone)
        put("blood", riderProfile.bloodType)
        put("category", riderProfile.userType)
        put("vehicleModel", riderProfile.vehicleModel)
        put("emergencyContactName", riderProfile.emergencyContactName)
        put("emergencyContactPhone", riderProfile.emergencyContactPhone)
        put("emergencyPhone", riderProfile.emergencyContactPhone)
        put("allergies", riderProfile.allergies)
        put("driveLink", riderProfile.driveLink)
        put("photoUrl", RiderProfile.formatDirectDriveUrl(riderProfile.driveLink))
        put("t", System.currentTimeMillis())
        put("lat", gps.latitude)
        put("lon", gps.longitude)
        put("alt", gps.altitudeMeters)
        put("spd", gps.speedKmh)
        put("amag", imu.aMag)
        put("pitch", imu.pitchDegrees)
        put("roll", imu.rollDegrees)
        put("dispatch_radar", riderProfile.getDispatchRadarUrl(gps.latitude, gps.longitude))
        put("maps_pin", riderProfile.getGoogleMapsUrl(gps.latitude, gps.longitude))
        put("autonomous_broadcast", true)
      }.toString()

      // Send over WebSocket
      activeWebSocket?.send(emergencyJson)

      // Send over Raw Socket / Classic BT if connected
      val bytes = (emergencyJson + "\n").toByteArray(Charsets.UTF_8)
      try {
        outputStream?.write(bytes)
        outputStream?.flush()
      } catch (_: Exception) {}

      // Send over BLE GATT if connected
      val gatt = activeBleGatt
      val rx = activeBleRxChar
      if (gatt != null && rx != null) {
        try {
          writeBleBytes(gatt, rx, bytes)
        } catch (_: Exception) {}
      }

      _syncStatus.value = _syncStatus.value.copy(
        lastTransmittedJson = emergencyJson,
        statusMessage = "EMERGENCY BROADCAST SENT VIA SAFETY WEARABLE UPLINK"
      )
    }
  }

  fun sendCancelAlertPacket(riderProfile: RiderProfile) {
    scope.launch(Dispatchers.IO) {
      val cancelJson = JSONObject().apply {
        put("type", "CANCEL_ALERT")
        put("token", riderProfile.token)
        put("rider", riderProfile.riderName)
        put("plate", riderProfile.plateNumber)
        put("t", System.currentTimeMillis())
        put("action", "DISMISS_FALSE_ALARM")
        put("stop_buzzer", true)
      }.toString()

      // Send over WebSocket
      activeWebSocket?.send(cancelJson)

      // Send over Raw Socket / BT if connected
      val bytes = (cancelJson + "\n").toByteArray(Charsets.UTF_8)
      try {
        outputStream?.write(bytes)
        outputStream?.flush()
      } catch (_: Exception) {}

      // Send over BLE GATT if connected
      val gatt = activeBleGatt
      val rx = activeBleRxChar
      if (gatt != null && rx != null) {
        try {
          writeBleBytes(gatt, rx, bytes)
        } catch (_: Exception) {}
      }

      _syncStatus.value = _syncStatus.value.copy(
        lastTransmittedJson = cancelJson,
        statusMessage = "FALSE ALARM DISMISSED — SIGNAL TRANSMITTED TO WEARABLE"
      )
    }
  }

  private fun buildTelemetryPacket(gps: GpsData, imu: ImuData, profile: RiderProfile): String {
    return JSONObject().apply {
      put("type", "TELEMETRY")
      put("token", profile.token)
      put("rider", profile.riderName)
      put("plate", profile.plateNumber)
      put("contact", profile.emergencyContactPhone)
      put("blood", profile.bloodType)
      put("category", profile.userType)
      put("vehicleModel", profile.vehicleModel)
      put("emergencyContactName", profile.emergencyContactName)
      put("emergencyContactPhone", profile.emergencyContactPhone)
      put("emergencyPhone", profile.emergencyContactPhone)
      put("allergies", profile.allergies)
      put("driveLink", profile.driveLink)
      put("photoUrl", RiderProfile.formatDirectDriveUrl(profile.driveLink))
      put("t", System.currentTimeMillis())
      put("lat", String.format(Locale.US, "%.6f", gps.latitude).toDouble())
      put("lon", String.format(Locale.US, "%.6f", gps.longitude).toDouble())
      put("alt", String.format(Locale.US, "%.1f", gps.altitudeMeters).toFloat())
      put("spd", String.format(Locale.US, "%.1f", gps.speedKmh).toFloat())
      put("hdg", String.format(Locale.US, "%.0f", gps.headingDegrees).toFloat())
      put("ax", String.format(Locale.US, "%.2f", imu.accelX).toFloat())
      put("ay", String.format(Locale.US, "%.2f", imu.accelY).toFloat())
      put("az", String.format(Locale.US, "%.2f", imu.accelZ).toFloat())
      put("amag", String.format(Locale.US, "%.2f", imu.aMag).toFloat())
      put("gx", String.format(Locale.US, "%.1f", imu.gyroX).toFloat())
      put("gy", String.format(Locale.US, "%.1f", imu.gyroY).toFloat())
      put("gz", String.format(Locale.US, "%.1f", imu.gyroZ).toFloat())
      put("pitch", String.format(Locale.US, "%.1f", imu.pitchDegrees).toFloat())
      put("roll", String.format(Locale.US, "%.1f", imu.rollDegrees).toFloat())
      put("shock", if (imu.isShockAlert) 1 else 0)
    }.toString()
  }
}
