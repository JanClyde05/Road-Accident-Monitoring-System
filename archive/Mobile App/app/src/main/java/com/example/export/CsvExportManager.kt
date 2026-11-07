package com.example.export

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import com.example.model.CsvLogSample
import com.example.model.GpsData
import com.example.model.ImuData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CsvExportManager(private val context: Context) {

  private val _isRecording = MutableStateFlow(false)
  val isRecording: StateFlow<Boolean> = _isRecording.asStateFlow()

  private val _recordedCount = MutableStateFlow(0)
  val recordedCount: StateFlow<Int> = _recordedCount.asStateFlow()

  private val _recordingStartTime = MutableStateFlow(0L)
  val recordingStartTime: StateFlow<Long> = _recordingStartTime.asStateFlow()

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
    builder.append("# Device: ESP32 Wearable (MPU6050 + NEO-6M GPS)\n")
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
}
