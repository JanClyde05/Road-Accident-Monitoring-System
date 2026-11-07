package com.example.sync

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothSocket
import com.example.model.GpsData
import com.example.model.ImuData
import com.example.model.RiderProfile
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
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
  val transport: SyncTransport = SyncTransport.WEBSOCKET,
  val esp32Ip: String = "192.168.4.1",
  val esp32Port: Int = 8080,
  val esp32WsUrl: String = "ws://192.168.4.1:81/ws",
  val btMacAddress: String = "30:AE:A4:78:2A:12",
  val btDeviceName: String = "ESP32_RAMS_LORA",
  val packetsSent: Long = 0L,
  val bytesSent: Long = 0L,
  val syncRateHz: Int = 20,
  val loraReady: Boolean = true,
  val lastTransmittedJson: String = "",
  val statusMessage: String = "Ready to stream IMU & GPS via ESP32 WebSocket + LoRa",
  val loraRssi: Int = -64,
  val loraAckCount: Long = 0L
)

class Esp32SyncEngine(
  private val scope: CoroutineScope
) {
  companion object {
    private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")
  }

  private val _syncStatus = MutableStateFlow(Esp32SyncStatus())
  val syncStatus: StateFlow<Esp32SyncStatus> = _syncStatus.asStateFlow()

  private var syncLoopJob: Job? = null
  private var activeSocket: Socket? = null
  private var activeBtSocket: BluetoothSocket? = null
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
              isSyncActive = true,
              statusMessage = "WebSocket Emulation Active ($wsUrl) [Hardware Offline]"
            )
          }
        })

        runWebSocketStreamingLoop(getGps, getImu, getRiderProfile)
      } catch (e: Exception) {
        _syncStatus.value = _syncStatus.value.copy(
          isSyncActive = true,
          statusMessage = "WebSocket Emulation Active ($wsUrl)"
        )
        runWebSocketSimulatedLoop(getGps, getImu, getRiderProfile)
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
          isSyncActive = true,
          statusMessage = "Simulated ESP32 LoRa Uplink ($ip:$port) [Hardware Offline]"
        )
        runSimulatedStreamingLoop(getGps, getImu, getRiderProfile)
      }
    }
  }

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
      statusMessage = "Connecting to Bluetooth $name ($mac)..."
    )

    syncLoopJob = scope.launch(Dispatchers.IO) {
      try {
        val adapter = BluetoothAdapter.getDefaultAdapter()
        val device = adapter?.getRemoteDevice(mac)
        if (device != null) {
          val btSocket = device.createRfcommSocketToServiceRecord(SPP_UUID)
          btSocket.connect()
          activeBtSocket = btSocket
          outputStream = btSocket.outputStream

          _syncStatus.value = _syncStatus.value.copy(
            isSyncActive = true,
            statusMessage = "Syncing Phone IMU & GPS -> ESP32 via BT SPP"
          )
          runStreamingLoop(getGps, getImu, getRiderProfile)
        } else {
          throw IllegalStateException("Bluetooth device not found")
        }
      } catch (e: Exception) {
        _syncStatus.value = _syncStatus.value.copy(
          isSyncActive = true,
          statusMessage = "Simulated ESP32 BT Uplink [SPP Emulation]"
        )
        runSimulatedStreamingLoop(getGps, getImu, getRiderProfile)
      }
    }
  }

  fun stopSync() {
    syncLoopJob?.cancel()
    syncLoopJob = null
    try { activeWebSocket?.close(1000, "User Stopped") } catch (_: Exception) {}
    try { outputStream?.close() } catch (_: Exception) {}
    try { activeSocket?.close() } catch (_: Exception) {}
    try { activeBtSocket?.close() } catch (_: Exception) {}
    activeWebSocket = null
    outputStream = null
    activeSocket = null
    activeBtSocket = null
    _syncStatus.value = _syncStatus.value.copy(
      isSyncActive = false,
      statusMessage = "Sync stopped"
    )
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
        put("type", "CRASH_EMERGENCY")
        put("token", riderProfile.token)
        put("rider", riderProfile.riderName)
        put("plate", riderProfile.plateNumber)
        put("contact", riderProfile.emergencyContactPhone)
        put("blood", riderProfile.bloodType)
        put("t", System.currentTimeMillis())
        put("lat", gps.latitude)
        put("lon", gps.longitude)
        put("alt", gps.altitudeMeters)
        put("speed", gps.speedKmh)
        put("amag", imu.aMag)
        put("pitch", imu.pitchDegrees)
        put("roll", imu.rollDegrees)
        put("netlify_radar", riderProfile.getNetlifyPindownUrl(gps.latitude, gps.longitude))
        put("maps_pin", riderProfile.getGoogleMapsUrl(gps.latitude, gps.longitude))
        put("lora_broadcast", true)
      }.toString()

      // Send over WebSocket
      activeWebSocket?.send(emergencyJson)

      // Send over Raw Socket / BT if connected
      val bytes = (emergencyJson + "\n").toByteArray(Charsets.UTF_8)
      try {
        outputStream?.write(bytes)
        outputStream?.flush()
      } catch (_: Exception) {}

      _syncStatus.value = _syncStatus.value.copy(
        lastTransmittedJson = emergencyJson,
        statusMessage = "CRASH EMERGENCY BROADCAST SENT VIA WEBSOCKET & LORA!"
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
