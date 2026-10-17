package com.example.export

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.example.model.CsvLogSample
import com.example.model.GpsData
import com.example.model.ImuCalibration
import com.example.model.ImuData
import com.example.sensor.ImuCalibrationManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.BufferedReader
import java.io.File
import java.io.FileWriter
import java.io.InputStreamReader
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CsvExportManager(private val context: Context) {

  val imuCalibrationManager = ImuCalibrationManager(context)
  val calibrationState: StateFlow<ImuCalibration> = imuCalibrationManager.calibrationState

  private val _isRecording = MutableStateFlow(false)
  val isRecording: StateFlow<Boolean> = _isRecording.asStateFlow()

  private val _recordedCount = MutableStateFlow(0)
  val recordedCount: StateFlow<Int> = _recordedCount.asStateFlow()

  private val _recordingStartTime = MutableStateFlow(0L)
  val recordingStartTime: StateFlow<Long> = _recordingStartTime.asStateFlow()

  // Import state
  private val _importedCount = MutableStateFlow(0)
  val importedCount: StateFlow<Int> = _importedCount.asStateFlow()

  private val _importedFileName = MutableStateFlow("")
  val importedFileName: StateFlow<String> = _importedFileName.asStateFlow()

  private val _importError = MutableStateFlow("")
  val importError: StateFlow<String> = _importError.asStateFlow()

  private val importedSamples = mutableListOf<CsvLogSample>()

  private val samples = mutableListOf<CsvLogSample>()

  fun startRecording() {
    samples.clear()
    _recordedCount.value = 0
    _recordingStartTime.value = System.currentTimeMillis()
    _isRecording.value = true
  }

  fun stopRecording() {
    _isRecording.value = false
  }

  fun recordSample(gps: GpsData, imu: ImuData, battPct: Int) {
    if (!_isRecording.value) return
    val sample = CsvLogSample(
      timestamp = System.currentTimeMillis(),
      lat = gps.latitude,
      lon = gps.longitude,
      alt = gps.altitudeMeters,
      speed = gps.speedKmh,
      satellites = gps.satellites,
      accelX = imu.accelX,
      accelY = imu.accelY,
      accelZ = imu.accelZ,
      aMag = imu.aMag,
      gyroX = imu.gyroX,
      gyroY = imu.gyroY,
      gyroZ = imu.gyroZ,
      pitch = imu.pitchDegrees,
      roll = imu.rollDegrees,
      battPct = battPct,
      isAlert = imu.isShockAlert
    )
    samples.add(sample)
    _recordedCount.value = samples.size
  }

  fun generateCsvContent(): String {
    val builder = StringBuilder()
    builder.append("# RAMS - Road Accident Monitoring System Sensor Log\n")
    builder.append("# Device: RAMS Wearable Safety System (6-DOF IMU + GNSS)\n")
    builder.append("# Generated: ${SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date())}\n")
    builder.append(CsvLogSample.CSV_HEADER).append("\n")
    for (sample in samples) {
      builder.append(sample.toCsvRow()).append("\n")
    }
    return builder.toString()
  }

  fun getPreviewRows(limit: Int = 30): List<String> {
    val preview = mutableListOf<String>()
    preview.add(CsvLogSample.CSV_HEADER)
    for (i in 0 until minOf(limit, samples.size)) {
      preview.add(samples[i].toCsvRow())
    }
    return preview
  }

  fun shareCsv() {
    val csvText = generateCsvContent()
    try {
      val fileName = "RAMS_Sensor_Log_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())}.csv"
      val cacheFile = File(context.cacheDir, fileName)
      FileWriter(cacheFile).use { it.write(csvText) }

      val uri = FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        cacheFile
      )

      val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/csv"
        putExtra(Intent.EXTRA_STREAM, uri)
        putExtra(Intent.EXTRA_SUBJECT, "RAMS ESP32 Sensor Telemetry Log")
        putExtra(Intent.EXTRA_TEXT, "Sensor telemetry recording containing ${samples.size} samples.")
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }
      val chooser = Intent.createChooser(intent, "Export & Share Sensor CSV")
      chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(chooser)
    } catch (e: Exception) {
      // Fallback to plain text share if FileProvider is not configured
      val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, "RAMS ESP32 Sensor Log")
        putExtra(Intent.EXTRA_TEXT, csvText)
      }
      val chooser = Intent.createChooser(intent, "Share RAMS Sensor CSV")
      chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(chooser)
    }
  }

  fun clearLogs() {
    samples.clear()
    _recordedCount.value = 0
    _isRecording.value = false
  }

  // --- CSV Import from IMU Studio ---

  /**
   * Imports a CSV file from a content URI (e.g. from Android file picker).
   * Supports both RAMS native CSV and IMU Studio exported CSV formats.
   * Returns the number of successfully parsed rows.
   */
  fun importCsvFromUri(uri: Uri, fileName: String = "imported.csv"): Int {
    _importError.value = ""
    importedSamples.clear()
    _importedFileName.value = fileName

    try {
      val inputStream = context.contentResolver.openInputStream(uri)
        ?: run {
          _importError.value = "Could not open file"
          _importedCount.value = 0
          return 0
        }

      val reader = BufferedReader(InputStreamReader(inputStream))
      val lines = mutableListOf<String>()
      var line: String? = reader.readLine()
      while (line != null) {
        lines.add(line)
        line = reader.readLine()
      }
      reader.close()

      // Find header line (skip comment lines starting with #)
      var headerIdx = -1
      for (i in lines.indices) {
        val trimmed = lines[i].trim()
        if (trimmed.isBlank() || trimmed.startsWith("#")) continue
        // Check if this line looks like a header (contains alpha chars, not pure numbers)
        if (trimmed.contains("accel", ignoreCase = true) ||
            trimmed.contains("gyro", ignoreCase = true) ||
            trimmed.contains("latitude", ignoreCase = true) ||
            trimmed.contains("timestamp", ignoreCase = true) ||
            trimmed.contains("epoch", ignoreCase = true) ||
            trimmed.contains("datetime", ignoreCase = true)) {
          headerIdx = i
          break
        }
      }

      if (headerIdx < 0) {
        _importError.value = "No CSV header found. Expected columns: accel_x, gyro_x, latitude, etc."
        _importedCount.value = 0
        return 0
      }

      val headers = lines[headerIdx].split(",").map { it.trim().lowercase() }

      // Build column index map (flexible matching)
      fun findCol(vararg candidates: String): Int {
        for (c in candidates) {
          val idx = headers.indexOfFirst { it.contains(c) }
          if (idx >= 0) return idx
        }
        return -1
      }

      val colEpoch = findCol("epoch_ms", "epoch", "timestamp_ms")
      val colDatetime = findCol("datetime", "date_time", "time")
      val colLat = findCol("latitude", "lat")
      val colLon = findCol("longitude", "lon", "lng")
      val colAlt = findCol("altitude", "alt")
      val colSpeed = findCol("speed_kmh", "speed")
      val colSat = findCol("satellite", "sat")
      val colAx = findCol("accel_x", "ax")
      val colAy = findCol("accel_y", "ay")
      val colAz = findCol("accel_z", "az")
      val colAmag = findCol("amag", "a_mag", "svm")
      val colGx = findCol("gyro_x", "gx")
      val colGy = findCol("gyro_y", "gy")
      val colGz = findCol("gyro_z", "gz")
      val colPitch = findCol("pitch")
      val colRoll = findCol("roll")
      val colBatt = findCol("batt", "battery")
      val colAlert = findCol("alert", "is_alert", "shock")

      // Parse data rows
      val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS", Locale.US)
      val sdfShort = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US)
      var parsed = 0

      for (i in (headerIdx + 1) until lines.size) {
        val row = lines[i].trim()
        if (row.isBlank() || row.startsWith("#")) continue

        val cols = row.split(",").map { it.trim() }
        if (cols.size < 4) continue // Minimum viable columns

        try {
          // Parse timestamp
          val epochMs: Long = when {
            colEpoch >= 0 && colEpoch < cols.size -> cols[colEpoch].toLongOrNull() ?: System.currentTimeMillis()
            colDatetime >= 0 && colDatetime < cols.size -> {
              try { sdf.parse(cols[colDatetime])?.time ?: sdfShort.parse(cols[colDatetime])?.time ?: 0L }
              catch (_: Exception) { System.currentTimeMillis() }
            }
            else -> System.currentTimeMillis()
          }

          fun safeFloat(idx: Int, default: Float = 0f): Float {
            if (idx < 0 || idx >= cols.size) return default
            return cols[idx].toFloatOrNull() ?: default
          }

          fun safeDouble(idx: Int, default: Double = 0.0): Double {
            if (idx < 0 || idx >= cols.size) return default
            return cols[idx].toDoubleOrNull() ?: default
          }

          fun safeInt(idx: Int, default: Int = 0): Int {
            if (idx < 0 || idx >= cols.size) return default
            return cols[idx].toIntOrNull() ?: default
          }

          fun safeBool(idx: Int, default: Boolean = false): Boolean {
            if (idx < 0 || idx >= cols.size) return default
            val v = cols[idx].lowercase()
            return v == "true" || v == "1" || v == "yes"
          }

          val ax = safeFloat(colAx)
          val ay = safeFloat(colAy)
          val az = safeFloat(colAz, 1.0f)
          val computedAmag = kotlin.math.sqrt(ax * ax + ay * ay + az * az)

          val sample = CsvLogSample(
            timestamp = epochMs,
            lat = safeDouble(colLat),
            lon = safeDouble(colLon),
            alt = safeFloat(colAlt),
            speed = safeFloat(colSpeed),
            satellites = safeInt(colSat),
            accelX = ax,
            accelY = ay,
            accelZ = az,
            aMag = if (colAmag >= 0) safeFloat(colAmag, computedAmag) else computedAmag,
            gyroX = safeFloat(colGx),
            gyroY = safeFloat(colGy),
            gyroZ = safeFloat(colGz),
            pitch = safeFloat(colPitch),
            roll = safeFloat(colRoll),
            battPct = safeInt(colBatt, 100),
            isAlert = safeBool(colAlert)
          )
          importedSamples.add(sample)
          parsed++
        } catch (_: Exception) {
          // Skip malformed rows silently
        }
      }

      _importedCount.value = parsed

      if (parsed > 0) {
        // Feed dataset to ImuCalibrationManager for calibrated crash threshold and ADL false-alarm filtering
        try {
          imuCalibrationManager.importData(fileName, lines.joinToString("\n"))
        } catch (_: Exception) {}
      }

      if (parsed == 0) {
        _importError.value = "No valid data rows could be parsed from $fileName"
      }

      return parsed
    } catch (e: Exception) {
      _importError.value = "Import failed: ${e.message}"
      _importedCount.value = 0
      return 0
    }
  }

  /** Merge imported samples into the active recording buffer for unified preview/export. */
  fun mergeImportedToRecording() {
    if (importedSamples.isEmpty()) return
    samples.addAll(importedSamples)
    _recordedCount.value = samples.size
  }

  fun getImportedPreviewRows(limit: Int = 30): List<String> {
    val preview = mutableListOf<String>()
    preview.add(CsvLogSample.CSV_HEADER)
    for (i in 0 until minOf(limit, importedSamples.size)) {
      preview.add(importedSamples[i].toCsvRow())
    }
    return preview
  }

  fun getImportedSamples(): List<CsvLogSample> = importedSamples.toList()

  fun clearImportedData() {
    importedSamples.clear()
    _importedCount.value = 0
    _importedFileName.value = ""
    _importError.value = ""
  }
}
