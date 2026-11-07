package com.example.sensor

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import androidx.core.content.ContextCompat
import com.example.model.GpsData
import com.example.model.ImuData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlin.math.PI
import kotlin.math.atan2
import kotlin.math.sqrt

class PhoneSensorEngine(
  private val context: Context,
  private val scope: CoroutineScope
) : SensorEventListener, LocationListener {

  companion object {
    private const val GRAVITY_STANDARD = 9.80665f
    private const val RAD_TO_DEG = (180.0 / PI).toFloat()
    private const val CRASH_THRESHOLD_G = 3.2f
  }

  private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
  private val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager

  // Real-time Phone Sensor States
  private val _phoneImuState = MutableStateFlow(ImuData())
  val phoneImuState: StateFlow<ImuData> = _phoneImuState.asStateFlow()

  private val _phoneGpsState = MutableStateFlow(
    GpsData(
      latitude = 17.613210,
      longitude = 121.727040,
      altitudeMeters = 28.4f,
      speedKmh = 0.0f,
      headingDegrees = 0.0f,
      satellites = 8,
      accuracyMeters = 2.5f,
      fixStatus = "PHONE GPS ACTIVE",
      locationAddress = "Maharlika Highway, Tuguegarao City"
    )
  )
  val phoneGpsState: StateFlow<GpsData> = _phoneGpsState.asStateFlow()

  private val _isSensorActive = MutableStateFlow(false)
  val isSensorActive: StateFlow<Boolean> = _isSensorActive.asStateFlow()

  private val _hardwareSensorsDetected = MutableStateFlow(false)
  val hardwareSensorsDetected: StateFlow<Boolean> = _hardwareSensorsDetected.asStateFlow()

  // High-G crash alert notification flow
  private val _crashTriggerFlow = MutableSharedFlow<Pair<GpsData, ImuData>>()
  val crashTriggerFlow: SharedFlow<Pair<GpsData, ImuData>> = _crashTriggerFlow.asSharedFlow()

  // Sensor reading buffers
  private var lastAccelX = 0f
  private var lastAccelY = 0f
  private var lastAccelZ = 1f

  private var lastGyroX = 0f
  private var lastGyroY = 0f
  private var lastGyroZ = 0f

  private val gravityMatrix = FloatArray(9)
  private val magneticMatrix = FloatArray(9)
  private val rotationMatrix = FloatArray(9)
  private val orientationAngles = FloatArray(3)

  private var hasGravity = false
  private var hasMagnetic = false
  private val gravityReading = FloatArray(3)
  private val magneticReading = FloatArray(3)

  fun startSensors() {
    if (sensorManager == null) return

    val accel = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    val gyro = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
    val gravity = sensorManager.getDefaultSensor(Sensor.TYPE_GRAVITY)
    val magnetic = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
    val rotationVector = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)

    _hardwareSensorsDetected.value = (accel != null)

    // Register at SENSOR_DELAY_GAME (~20ms / 50Hz update rate)
    accel?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
    gyro?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
    rotationVector?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
    gravity?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
    magnetic?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }

    startLocationUpdates()
    _isSensorActive.value = true
  }

  fun stopSensors() {
    sensorManager?.unregisterListener(this)
    locationManager?.removeUpdates(this)
    _isSensorActive.value = false
  }

  @SuppressLint("MissingPermission")
  private fun startLocationUpdates() {
    if (locationManager == null) return
    val fineGranted = ContextCompat.checkSelfPermission(
      context,
      android.Manifest.permission.ACCESS_FINE_LOCATION
    ) == PackageManager.PERMISSION_GRANTED

    val coarseGranted = ContextCompat.checkSelfPermission(
      context,
      android.Manifest.permission.ACCESS_COARSE_LOCATION
    ) == PackageManager.PERMISSION_GRANTED

    if (fineGranted || coarseGranted) {
      try {
        if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
          locationManager.requestLocationUpdates(
            LocationManager.GPS_PROVIDER,
            1000L, // 1 second
            1.0f,  // 1 meter
            this
          )
        }
        if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
          locationManager.requestLocationUpdates(
            LocationManager.NETWORK_PROVIDER,
            2000L,
            2.0f,
            this
          )
        }
        // Grab last known location
        val lastGps = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
          ?: locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
        lastGps?.let { onLocationChanged(it) }
      } catch (e: Exception) {
        e.printStackTrace()
      }
    }
  }

  override fun onSensorChanged(event: SensorEvent?) {
    if (event == null) return

    when (event.sensor.type) {
      Sensor.TYPE_ACCELEROMETER -> {
        // Convert m/s^2 to g (standard gravity = 9.80665)
        lastAccelX = event.values[0] / GRAVITY_STANDARD
        lastAccelY = event.values[1] / GRAVITY_STANDARD
        lastAccelZ = event.values[2] / GRAVITY_STANDARD

        // If rotation vector is absent, compute approximate pitch and roll from gravity vector
        val pitchRad = atan2(lastAccelY.toDouble(), sqrt((lastAccelX * lastAccelX + lastAccelZ * lastAccelZ).toDouble())).toFloat()
        val rollRad = atan2(-lastAccelX.toDouble(), lastAccelZ.toDouble()).toFloat()

        val aMag = sqrt(lastAccelX * lastAccelX + lastAccelY * lastAccelY + lastAccelZ * lastAccelZ)

        val updatedImu = _phoneImuState.value.copy(
          accelX = lastAccelX,
          accelY = lastAccelY,
          accelZ = lastAccelZ,
          pitchDegrees = if (!hasGravity) pitchRad * RAD_TO_DEG else _phoneImuState.value.pitchDegrees,
          rollDegrees = if (!hasGravity) rollRad * RAD_TO_DEG else _phoneImuState.value.rollDegrees
        )
        _phoneImuState.value = updatedImu

        // Check for sudden high impact accident shock (> CRASH_THRESHOLD_G)
        if (aMag > CRASH_THRESHOLD_G) {
          scope.launch {
            _crashTriggerFlow.emit(Pair(_phoneGpsState.value, updatedImu))
          }
        }
      }

      Sensor.TYPE_GYROSCOPE -> {
        // Convert rad/s to degrees/s
        lastGyroX = event.values[0] * RAD_TO_DEG
        lastGyroY = event.values[1] * RAD_TO_DEG
        lastGyroZ = event.values[2] * RAD_TO_DEG

        _phoneImuState.value = _phoneImuState.value.copy(
          gyroX = lastGyroX,
          gyroY = lastGyroY,
          gyroZ = lastGyroZ
        )
      }

      Sensor.TYPE_ROTATION_VECTOR -> {
        SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
        SensorManager.getOrientation(rotationMatrix, orientationAngles)
        // orientationAngles[1] = pitch, orientationAngles[2] = roll, orientationAngles[0] = azimuth
        val pitchDeg = orientationAngles[1] * RAD_TO_DEG
        val rollDeg = orientationAngles[2] * RAD_TO_DEG
        val yawDeg = ((orientationAngles[0] * RAD_TO_DEG) + 360f) % 360f

        _phoneImuState.value = _phoneImuState.value.copy(
          pitchDegrees = pitchDeg,
          rollDegrees = rollDeg,
          yawDegrees = yawDeg
        )
      }

      Sensor.TYPE_GRAVITY -> {
        System.arraycopy(event.values, 0, gravityReading, 0, 3)
        hasGravity = true
        updateOrientationIfReady()
      }

      Sensor.TYPE_MAGNETIC_FIELD -> {
        System.arraycopy(event.values, 0, magneticReading, 0, 3)
        hasMagnetic = true
        updateOrientationIfReady()
      }
    }
  }

  private fun updateOrientationIfReady() {
    if (hasGravity && hasMagnetic) {
      val success = SensorManager.getRotationMatrix(
        rotationMatrix,
        null,
        gravityReading,
        magneticReading
      )
      if (success) {
        SensorManager.getOrientation(rotationMatrix, orientationAngles)
        _phoneImuState.value = _phoneImuState.value.copy(
          pitchDegrees = orientationAngles[1] * RAD_TO_DEG,
          rollDegrees = orientationAngles[2] * RAD_TO_DEG,
          yawDegrees = ((orientationAngles[0] * RAD_TO_DEG) + 360f) % 360f
        )
      }
    }
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

  override fun onLocationChanged(location: Location) {
    val speedKmh = location.speed * 3.6f // convert m/s to km/h
    _phoneGpsState.value = _phoneGpsState.value.copy(
      latitude = location.latitude,
      longitude = location.longitude,
      altitudeMeters = location.altitude.toFloat(),
      speedKmh = speedKmh,
      headingDegrees = location.bearing,
      accuracyMeters = location.accuracy,
      fixStatus = "HARDWARE FIX",
      locationAddress = "Lat: %.5f, Lon: %.5f".format(location.latitude, location.longitude)
    )
  }

  @Deprecated("Deprecated in Java")
  override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
  override fun onProviderEnabled(provider: String) {}
  override fun onProviderDisabled(provider: String) {}

  fun injectTestCrashShock() {
    scope.launch {
      val shockImu = ImuData(
        accelX = 3.92f,
        accelY = -4.15f,
        accelZ = 2.80f,
        gyroX = 160.0f,
        gyroY = -110.0f,
        gyroZ = 75.0f,
        pitchDegrees = -42.0f,
        rollDegrees = 75.0f,
        yawDegrees = 115.0f
      )
      _phoneImuState.value = shockImu
      val curGps = _phoneGpsState.value.copy(speedKmh = 0.0f)
      _phoneGpsState.value = curGps
      _crashTriggerFlow.emit(Pair(curGps, shockImu))
    }
  }
}
