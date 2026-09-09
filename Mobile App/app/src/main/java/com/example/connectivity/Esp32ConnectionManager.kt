package com.example.connectivity

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.Context
import com.example.model.ConnectionType
import com.example.model.DeviceLinkStatus
import com.example.model.GpsData
import com.example.model.ImuData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.InetSocketAddress
import java.net.Socket
import java.util.UUID
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

class Esp32ConnectionManager(
  private val scope: CoroutineScope
) {
  companion object {
    private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")
  }

  private val _gpsState = MutableStateFlow(GpsData())
  val gpsState: StateFlow<GpsData> = _gpsState.asStateFlow()

  private val _imuState = MutableStateFlow(ImuData())
  val imuState: StateFlow<ImuData> = _imuState.asStateFlow()

  private val _linkStatus = MutableStateFlow(DeviceLinkStatus())
  val linkStatus: StateFlow<DeviceLinkStatus> = _linkStatus.asStateFlow()

  private val _crashAlertEvents = MutableSharedFlow<Pair<GpsData, ImuData>>()
  val crashAlertEvents: SharedFlow<Pair<GpsData, ImuData>> = _crashAlertEvents.asSharedFlow()

  private var activeConnectionJob: Job? = null
  private var rawSocket: Socket? = null
  private var btSocket: BluetoothSocket? = null

  // Tuguegarao City road coordinates simulation path
  private val routeWaypoints = listOf(
    Pair(17.613210, 121.727040),
    Pair(17.614100, 121.728200),
    Pair(17.615200, 121.729500),
    Pair(17.616300, 121.730100),
    Pair(17.617500, 121.729200),
    Pair(17.618100, 121.727800),
    Pair(17.617200, 121.726200),
    Pair(17.615500, 121.725500),
    Pair(17.614000, 121.726000)
  )
  private var waypointIndex = 0
  private var progressBetweenWaypoints = 0.0

  init {
    startSimulation()
  }

  fun connectWifi(ip: String, port: Int) {
    disconnect()
    _linkStatus.value = _linkStatus.value.copy(
      connectionType = ConnectionType.WIFI_SOCKET,
      ipAddress = ip,
      port = port,
      isConnected = false
    )

    activeConnectionJob = scope.launch(Dispatchers.IO) {
      try {
        val socket = Socket()
        socket.tcpNoDelay = true // low-latency flag
        socket.connect(InetSocketAddress(ip, port), 4000)
        rawSocket = socket

        _linkStatus.value = _linkStatus.value.copy(isConnected = true)

        val reader = BufferedReader(InputStreamReader(socket.getInputStream()))
        var lastTime = System.currentTimeMillis()
        var packetCounter = 0
        var hzTimer = System.currentTimeMillis()

        while (isActive && !socket.isClosed) {
          val line = reader.readLine() ?: break
          val now = System.currentTimeMillis()
          val ping = (now - lastTime).coerceIn(4L, 95L)
          lastTime = now
          packetCounter++

          if (now - hzTimer >= 1000) {
            _linkStatus.value = _linkStatus.value.copy(
              packetRateHz = packetCounter,
              pingLatencyMs = ping
            )
            packetCounter = 0
            hzTimer = now
          }

          parseIncomingPacket(line)
        }
      } catch (e: Exception) {
        e.printStackTrace()
      } finally {
        _linkStatus.value = _linkStatus.value.copy(isConnected = false)
        try { rawSocket?.close() } catch (_: Exception) {}
      }
    }
  }

  fun connectBluetooth(deviceAddress: String, deviceName: String = "ESP32_RAMS_SENSOR") {
    disconnect()
    _linkStatus.value = _linkStatus.value.copy(
      connectionType = ConnectionType.BLUETOOTH_SPP,
      bluetoothName = deviceName,
      bluetoothMac = deviceAddress,
      isConnected = false
    )

    activeConnectionJob = scope.launch(Dispatchers.IO) {
      try {
        val adapter = BluetoothAdapter.getDefaultAdapter()
        val device: BluetoothDevice? = adapter?.getRemoteDevice(deviceAddress)
        if (device != null) {
          val socket = device.createRfcommSocketToServiceRecord(SPP_UUID)
          socket.connect()
          btSocket = socket
          _linkStatus.value = _linkStatus.value.copy(isConnected = true)

          val reader = BufferedReader(InputStreamReader(socket.inputStream))
          while (isActive && socket.isConnected) {
            val line = reader.readLine() ?: break
            parseIncomingPacket(line)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
      } finally {
        _linkStatus.value = _linkStatus.value.copy(isConnected = false)
        try { btSocket?.close() } catch (_: Exception) {}
      }
    }
  }

  fun startSimulation() {
    disconnect()
    _linkStatus.value = _linkStatus.value.copy(
      connectionType = ConnectionType.SIMULATION,
      isConnected = true,
      pingLatencyMs = 8L,
      packetRateHz = 20
    )

    activeConnectionJob = scope.launch {
      var angle = 0.0
      while (isActive) {
        delay(50L) // 20 Hz streaming rate (50ms interval)

        angle += 0.1
        val noiseX = (Random.nextFloat() - 0.5f) * 0.06f
        val noiseY = (Random.nextFloat() - 0.5f) * 0.06f
        val noiseZ = (Random.nextFloat() - 0.5f) * 0.04f

        // Progress along simulated Tuguegarao GPS route
        progressBetweenWaypoints += 0.008
        if (progressBetweenWaypoints >= 1.0) {
          progressBetweenWaypoints = 0.0
          waypointIndex = (waypointIndex + 1) % routeWaypoints.size
        }
        val currentWp = routeWaypoints[waypointIndex]
        val nextWp = routeWaypoints[(waypointIndex + 1) % routeWaypoints.size]

        val lat = currentWp.first + (nextWp.first - currentWp.first) * progressBetweenWaypoints
        val lon = currentWp.second + (nextWp.second - currentWp.second) * progressBetweenWaypoints

        // Banking lean angle during route curves
        val rollDeg = (sin(angle * 0.5) * 16.0).toFloat()
        val pitchDeg = (cos(angle * 0.3) * 5.0).toFloat()

        val accelX = (sin(angle * 0.5).toFloat() * 0.25f) + noiseX
        val accelY = (sin(angle * 0.3).toFloat() * 0.15f) + noiseY
        val accelZ = 0.98f + noiseZ

        val gyroX = (cos(angle * 0.5).toFloat() * 3.5f) + (Random.nextFloat() - 0.5f) * 0.5f
        val gyroY = (sin(angle * 0.3).toFloat() * 2.0f) + (Random.nextFloat() - 0.5f) * 0.5f
        val gyroZ = (sin(angle * 0.5).toFloat() * 1.5f) + (Random.nextFloat() - 0.5f) * 0.3f

        val spd = 38.0f + (sin(angle * 0.2) * 12.0f).toFloat()

        _gpsState.value = _gpsState.value.copy(
          latitude = lat,
          longitude = lon,
          altitudeMeters = 28.5f + (sin(angle * 0.1) * 3.0f).toFloat(),
          speedKmh = spd.coerceAtLeast(0f),
          headingDegrees = ((angle * 25.0) % 360).toFloat()
        )

        _imuState.value = ImuData(
          accelX = accelX,
          accelY = accelY,
          accelZ = accelZ,
          gyroX = gyroX,
          gyroY = gyroY,
          gyroZ = gyroZ,
          pitchDegrees = pitchDeg,
          rollDegrees = rollDeg,
          yawDegrees = ((angle * 25.0) % 360).toFloat(),
          temperatureCelsius = 32.5f + (sin(angle * 0.05) * 1.2f).toFloat()
        )

        _linkStatus.value = _linkStatus.value.copy(
          lastPacketTimestamp = System.currentTimeMillis()
        )
      }
    }
  }

  fun triggerSimulatedCrash() {
    scope.launch {
      // Simulate extreme shock spike (impact event)
      val shockImu = ImuData(
        accelX = 3.85f,
        accelY = -4.20f,
        accelZ = 2.90f,
        gyroX = 145.0f,
        gyroY = -120.0f,
        gyroZ = 85.0f,
        pitchDegrees = -45.0f,
        rollDegrees = 78.0f,
        yawDegrees = 110.0f
      )
      _imuState.value = shockImu
      val currentGps = _gpsState.value.copy(speedKmh = 0.0f)
      _gpsState.value = currentGps
      _crashAlertEvents.emit(Pair(currentGps, shockImu))

      delay(1500)
      // Return to resting tilted state
      _imuState.value = ImuData(
        accelX = 0.85f,
        accelY = 0.45f,
        accelZ = 0.20f,
        gyroX = 0.0f,
        gyroY = 0.0f,
        gyroZ = 0.0f,
        pitchDegrees = -15.0f,
        rollDegrees = 65.0f
      )
    }
  }

  fun disconnect() {
    activeConnectionJob?.cancel()
    activeConnectionJob = null
    try { rawSocket?.close() } catch (_: Exception) {}
    try { btSocket?.close() } catch (_: Exception) {}
    rawSocket = null
    btSocket = null
    _linkStatus.value = _linkStatus.value.copy(isConnected = false)
  }

  private fun parseIncomingPacket(line: String) {
    val trimmed = line.trim()
    if (trimmed.isEmpty()) return

    try {
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        val json = JSONObject(trimmed)

        val lat = json.optDouble("lat", _gpsState.value.latitude)
        val lon = json.optDouble("lon", _gpsState.value.longitude)
        val spd = json.optDouble("spd", _gpsState.value.speedKmh.toDouble()).toFloat()
        val alt = json.optDouble("alt", _gpsState.value.altitudeMeters.toDouble()).toFloat()
        val heading = json.optDouble("hdg", _gpsState.value.headingDegrees.toDouble()).toFloat()
        val sats = json.optInt("sats", _gpsState.value.satellites)

        val ax = json.optDouble("ax", _imuState.value.accelX.toDouble()).toFloat()
        val ay = json.optDouble("ay", _imuState.value.accelY.toDouble()).toFloat()
        val az = json.optDouble("az", _imuState.value.accelZ.toDouble()).toFloat()

        val gx = json.optDouble("gx", _imuState.value.gyroX.toDouble()).toFloat()
        val gy = json.optDouble("gy", _imuState.value.gyroY.toDouble()).toFloat()
        val gz = json.optDouble("gz", _imuState.value.gyroZ.toDouble()).toFloat()

        val pitch = json.optDouble("pitch", _imuState.value.pitchDegrees.toDouble()).toFloat()
        val roll = json.optDouble("roll", _imuState.value.rollDegrees.toDouble()).toFloat()
        val yaw = json.optDouble("yaw", _imuState.value.yawDegrees.toDouble()).toFloat()

        val batt = json.optInt("batt", _linkStatus.value.batteryPct)
        val volts = json.optDouble("volts", _linkStatus.value.batteryVoltage.toDouble()).toFloat()

        val newGps = _gpsState.value.copy(
          latitude = lat,
          longitude = lon,
          speedKmh = spd,
          altitudeMeters = alt,
          headingDegrees = heading,
          satellites = sats
        )
        val newImu = ImuData(
          accelX = ax,
          accelY = ay,
          accelZ = az,
          gyroX = gx,
          gyroY = gy,
          gyroZ = gz,
          pitchDegrees = pitch,
          rollDegrees = roll,
          yawDegrees = yaw
        )

        _gpsState.value = newGps
        _imuState.value = newImu
        _linkStatus.value = _linkStatus.value.copy(
          batteryPct = batt,
          batteryVoltage = volts,
          lastPacketTimestamp = System.currentTimeMillis()
        )

        if (newImu.isShockAlert) {
          scope.launch { _crashAlertEvents.emit(Pair(newGps, newImu)) }
        }
      } else if (trimmed.startsWith("\$TELEM")) {
        // NMEA / CSV style telemetry: $TELEM,lat,lon,alt,spd,ax,ay,az,gx,gy,gz,batt
        val parts = trimmed.split(",")
        if (parts.size >= 12) {
          val lat = parts[1].toDoubleOrNull() ?: _gpsState.value.latitude
          val lon = parts[2].toDoubleOrNull() ?: _gpsState.value.longitude
          val alt = parts[3].toFloatOrNull() ?: _gpsState.value.altitudeMeters
          val spd = parts[4].toFloatOrNull() ?: _gpsState.value.speedKmh
          val ax = parts[5].toFloatOrNull() ?: _imuState.value.accelX
          val ay = parts[6].toFloatOrNull() ?: _imuState.value.accelY
          val az = parts[7].toFloatOrNull() ?: _imuState.value.accelZ
          val gx = parts[8].toFloatOrNull() ?: _imuState.value.gyroX
          val gy = parts[9].toFloatOrNull() ?: _imuState.value.gyroY
          val gz = parts[10].toFloatOrNull() ?: _imuState.value.gyroZ
          val batt = parts[11].toIntOrNull() ?: _linkStatus.value.batteryPct

          val newGps = _gpsState.value.copy(latitude = lat, longitude = lon, altitudeMeters = alt, speedKmh = spd)
          val newImu = ImuData(accelX = ax, accelY = ay, accelZ = az, gyroX = gx, gyroY = gy, gyroZ = gz)
          _gpsState.value = newGps
          _imuState.value = newImu
          _linkStatus.value = _linkStatus.value.copy(batteryPct = batt)
        }
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }
}
