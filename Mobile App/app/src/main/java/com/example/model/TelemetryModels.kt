package com.example.model

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.sqrt

enum class ConnectionType {
  WIFI_SOCKET,
  BLUETOOTH_SPP,
  WEBSOCKET,
  SIMULATION
}

enum class IncidentType {
  ALERT,
  TEST,
  FALSE_ALARM,
  TELEMETRY
}

data class GpsData(
  val latitude: Double = 17.613210,
  val longitude: Double = 121.727040,
  val altitudeMeters: Float = 28.4f,
  val speedKmh: Float = 42.5f,
  val headingDegrees: Float = 45.0f,
  val satellites: Int = 11,
  val accuracyMeters: Float = 1.8f,
  val fixStatus: String = "3D FIX",
  val locationAddress: String = "Maharlika Highway cor. Caritan Norte, Tuguegarao City"
)

data class ImuData(
  val accelX: Float = 0.05f,
  val accelY: Float = -0.12f,
  val accelZ: Float = 0.98f,
  val gyroX: Float = 1.2f,
  val gyroY: Float = -0.5f,
  val gyroZ: Float = 0.1f,
  val pitchDegrees: Float = -3.2f,
  val rollDegrees: Float = 8.5f,
  val yawDegrees: Float = 45.0f,
  val temperatureCelsius: Float = 32.4f
) {
  val aMag: Float
    get() = sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ)

  val isShockAlert: Boolean
    get() = aMag > 2.8f
}

data class DeviceLinkStatus(
  val isConnected: Boolean = true,
  val connectionType: ConnectionType = ConnectionType.SIMULATION,
  val pingLatencyMs: Long = 12L,
  val packetRateHz: Int = 20,
  val batteryPct: Int = 88,
  val batteryVoltage: Float = 3.96f,
  val deviceToken: String = "RAMS-ESP32-8821",
  val firmwareVersion: String = "v2.4.1-ESP32-IMU-GPS",
  val ipAddress: String = "192.168.4.1",
  val port: Int = 8080,
  val wsUrl: String = "ws://192.168.4.1:81/ws",
  val bluetoothName: String = "ESP32_RAMS_SENSOR",
  val bluetoothMac: String = "30:AE:A4:78:2A:12",
  val lastPacketTimestamp: Long = System.currentTimeMillis()
)

data class IncidentEvent(
  val id: String,
  val title: String,
  val type: IncidentType,
  val timestamp: Long = System.currentTimeMillis(),
  val lat: Double,
  val lon: Double,
  val aMag: Float = 1.0f,
  val speedKmh: Float = 0.0f,
  val batteryPct: Int = 85,
  val deviceName: String = "Registered Wearable Unit #01",
  val deviceToken: String = "RAMS-ESP32-8821",
  val riderName: String = "Elena Dela Cruz",
  val riderRole: String = "Active Motorist / Courier",
  val contactNumber: String = "+63 917 555 2381",
  val emergencyContactName: String = "Elena Dela Cruz",
  val emergencyContactPhone: String = "+63 928 444 8920",
  val emergencyRelationship: String = "Next of Kin / Spouse",
  val bloodType: String = "O+",
  val allergies: String = "Penicillin, NSAIDs (Alert First Responders)",
  val vehicleModel: String = "Yamaha Sniper 155cc",
  val plateNumber: String = "NCR-8821",
  val locationAddress: String = "Maharlika Highway cor. Caritan Norte, Tuguegarao City",
  val formFactor: String = "Belt Clip-On Wearable (ESP32 + MPU6050 + NEO-6M)",
  val firmware: String = "v2.4.1-LoRa915 (AES-128)",
  val notes: String = ""
) {
  fun formattedTime(): String {
    val sdf = SimpleDateFormat("hh:mm:ss a", Locale.getDefault())
    return sdf.format(Date(timestamp))
  }
}

data class CsvLogSample(
  val timestamp: Long,
  val lat: Double,
  val lon: Double,
  val alt: Float,
  val speed: Float,
  val satellites: Int,
  val accelX: Float,
  val accelY: Float,
  val accelZ: Float,
  val aMag: Float,
  val gyroX: Float,
  val gyroY: Float,
  val gyroZ: Float,
  val pitch: Float,
  val roll: Float,
  val battPct: Int,
  val isAlert: Boolean
) {
  fun toCsvRow(): String {
    val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS", Locale.US)
    val timeStr = sdf.format(Date(timestamp))
    return "$timeStr,$timestamp,%.6f,%.6f,%.1f,%.1f,%d,%.3f,%.3f,%.3f,%.3f,%.2f,%.2f,%.2f,%.1f,%.1f,%d,%b"
      .format(
        Locale.US,
        lat, lon, alt, speed, satellites,
        accelX, accelY, accelZ, aMag,
        gyroX, gyroY, gyroZ,
        pitch, roll,
        battPct, isAlert
      )
  }

  companion object {
    const val CSV_HEADER = "datetime,epoch_ms,latitude,longitude,altitude_m,speed_kmh,satellites,accel_x_g,accel_y_g,accel_z_g,amag_g,gyro_x_dps,gyro_y_dps,gyro_z_dps,pitch_deg,roll_deg,batt_pct,is_alert"
  }
}
