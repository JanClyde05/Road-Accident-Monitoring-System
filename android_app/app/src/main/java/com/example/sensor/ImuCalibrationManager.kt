package com.example.sensor

import android.content.Context
import android.content.SharedPreferences
import com.example.model.ImuCalibration
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject
import java.io.BufferedReader
import java.io.StringReader
import java.util.Locale
import kotlin.math.max

/**
 * Manages dynamic IMU calibration profiles derived from processed datasets
 * exported by RAMS IMU Studio.
 *
 * Defaults:
 * - isCalibrated = false
 * - All thresholds = 0f
 * No hardcoded thresholds are applied until the user imports data.
 * Correlation of positive (crash) and negative (phone falling, walking, etc.)
 * data establishes the baseline thresholds for false-alarm rejection and
 * accident classification.
 */
class ImuCalibrationManager(private val context: Context) {

  private val prefs: SharedPreferences =
    context.getSharedPreferences("rams_imu_calibration_prefs", Context.MODE_PRIVATE)

  private val _calibrationState = MutableStateFlow(loadPersistedCalibration())
  val calibrationState: StateFlow<ImuCalibration> = _calibrationState.asStateFlow()

  private fun loadPersistedCalibration(): ImuCalibration {
    val isCalibrated = prefs.getBoolean("is_calibrated", false)
    if (!isCalibrated) {
      return ImuCalibration()
    }
    return ImuCalibration(
      isCalibrated = true,
      sourceName = prefs.getString("source_name", "IMU Studio Calibrated") ?: "IMU Studio Calibrated",
      crashThresholdG = prefs.getFloat("crash_threshold_g", 0f),
      maxNegativeG = prefs.getFloat("max_negative_g", 0f),
      phoneFallMaxG = prefs.getFloat("phone_fall_max_g", 0f),
      adlMaxG = prefs.getFloat("adl_max_g", 0f),
      minAccidentG = prefs.getFloat("min_accident_g", 0f),
      minTiltDeltaDeg = prefs.getFloat("min_tilt_delta_deg", 0f),
      minGyroMagRads = prefs.getFloat("min_gyro_mag_rads", 0f),
      minJerkMps3 = prefs.getFloat("min_jerk_mps3", 0f),
      adlShakeFilterActive = prefs.getBoolean("adl_shake_filter_active", true),
      totalSamplesImported = prefs.getInt("total_samples", 0),
      totalSessionsImported = prefs.getInt("total_sessions", 0),
      calibratedAtMs = prefs.getLong("calibrated_at_ms", 0L),
      falseAlarmsPreventedCount = prefs.getInt("false_alarms_prevented", 0),
      lastSuppressedReason = prefs.getString("last_suppressed_reason", null)
    )
  }

  private fun persistCalibration(cal: ImuCalibration) {
    prefs.edit()
      .putBoolean("is_calibrated", cal.isCalibrated)
      .putString("source_name", cal.sourceName)
      .putFloat("crash_threshold_g", cal.crashThresholdG)
      .putFloat("max_negative_g", cal.maxNegativeG)
      .putFloat("phone_fall_max_g", cal.phoneFallMaxG)
      .putFloat("adl_max_g", cal.adlMaxG)
      .putFloat("min_accident_g", cal.minAccidentG)
      .putFloat("min_tilt_delta_deg", cal.minTiltDeltaDeg)
      .putFloat("min_gyro_mag_rads", cal.minGyroMagRads)
      .putFloat("min_jerk_mps3", cal.minJerkMps3)
      .putBoolean("adl_shake_filter_active", cal.adlShakeFilterActive)
      .putInt("total_samples", cal.totalSamplesImported)
      .putInt("total_sessions", cal.totalSessionsImported)
      .putLong("calibrated_at_ms", cal.calibratedAtMs)
      .putInt("false_alarms_prevented", cal.falseAlarmsPreventedCount)
      .putString("last_suppressed_reason", cal.lastSuppressedReason)
      .apply()
    _calibrationState.value = cal
  }

  /**
   * Imports and processes CSV or JSON dataset from IMU Studio.
   */
  fun importData(fileName: String, content: String): Result<ImuCalibration> {
    return try {
      val trimmed = content.trim()
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        parseRulesJson(fileName, trimmed)
      } else {
        parseCsv(fileName, trimmed)
      }
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  private fun parseRulesJson(fileName: String, jsonStr: String): Result<ImuCalibration> {
    val root = JSONObject(jsonStr)
    var crashG = 0f
    var tiltDeg = 0f
    var gyroMag = 0f
    var jerk = 0f

    if (root.has("detection_thresholds")) {
      val arr = root.getJSONArray("detection_thresholds")
      for (i in 0 until arr.length()) {
        val rule = arr.getJSONObject(i)
        val metric = rule.optString("metric", "")
        val threshold = rule.optDouble("threshold", 0.0).toFloat()
        when (metric.lowercase(Locale.US)) {
          "max_svm_g", "svm_g", "svm", "crash_g", "crash_separation_g" -> crashG = threshold
          "tilt_delta_deg", "tilt", "tilt_deg", "tilt_separation" -> tiltDeg = threshold
          "max_gyro_mag", "gyro_mag", "gyro_mag_rads", "gyro_separation" -> gyroMag = threshold
          "max_jerk", "jerk_mps3", "jerk", "jerk_separation" -> jerk = threshold
        }
      }
    }

    val baselines = root.optJSONObject("class_baselines")
    val maxNegative = baselines?.optDouble("max_negative_peak_g", 0.0)?.toFloat() ?: 0f
    val phoneFall = baselines?.optDouble("phone_fall_peak_g", 0.0)?.toFloat() ?: 0f
    val minAccident = baselines?.optDouble("min_accident_peak_g", 0.0)?.toFloat() ?: 0f
    val crashFromBaseline = baselines?.optDouble("crash_separation_g", 0.0)?.toFloat() ?: 0f
    if (crashFromBaseline > 0f) crashG = crashFromBaseline
    if (baselines != null) {
      val t = baselines.optDouble("tilt_separation", 0.0).toFloat()
      val g = baselines.optDouble("gyro_separation", 0.0).toFloat()
      val j = baselines.optDouble("jerk_separation", 0.0).toFloat()
      if (t > 0f) tiltDeg = t
      if (g > 0f) gyroMag = g
      if (j > 0f) jerk = j
    }

    val totalSessions = root.optJSONObject("metadata")?.optInt("total_sessions", 1) ?: 1
    val totalWindows = root.optJSONObject("metadata")?.optInt("total_feature_windows", 100) ?: 100

    val updated = ImuCalibration(
      isCalibrated = crashG > 0f,
      sourceName = fileName,
      crashThresholdG = crashG,
      maxNegativeG = maxNegative,
      phoneFallMaxG = phoneFall,
      adlMaxG = maxNegative,
      minAccidentG = minAccident,
      minTiltDeltaDeg = tiltDeg,
      minGyroMagRads = gyroMag,
      minJerkMps3 = jerk,
      adlShakeFilterActive = crashG > 0f,
      totalSamplesImported = totalWindows,
      totalSessionsImported = totalSessions,
      calibratedAtMs = System.currentTimeMillis()
    )
    persistCalibration(updated)
    return Result.success(updated)
  }

  private fun parseCsv(fileName: String, csvStr: String): Result<ImuCalibration> {
    val reader = BufferedReader(StringReader(csvStr))
    val headerLine = reader.readLine() ?: return Result.failure(IllegalArgumentException("Empty CSV file"))
    val headers = headerLine.split(",").map { it.trim().lowercase(Locale.US) }

    val svmGIdx = headers.indexOfFirst { it == "svm_g" || it == "max_svm_g" }
    val svmIdx = if (svmGIdx >= 0) svmGIdx else headers.indexOfFirst { it == "svm_mps2" || it == "svm" }
    val isAccidentIdx = headers.indexOfFirst { it == "is_accident" }
    val labelIdx = headers.indexOfFirst { it == "label" || it == "label_id" || it == "category" }
    val tiltIdx = headers.indexOfFirst { it == "tilt_delta_deg" || it == "pitch_deg" || it == "roll_deg" }
    val gyroIdx = headers.indexOfFirst { it == "gyro_mag_rads" || it == "max_gyro_mag" || it == "gyro_mag" }
    val jerkIdx = headers.indexOfFirst { it == "jerk_mps3" || it == "max_jerk" || it == "jerk" }
    val sessionIdx = headers.indexOfFirst { it == "session_id" }

    var sampleCount = 0
    val sessionSet = mutableSetOf<String>()

    data class RowAgg(
      var isAccident: Boolean = false,
      var label: String = "",
      var peakSvmG: Float = 0f,
      var peakTilt: Float = 0f,
      var peakGyro: Float = 0f,
      var peakJerk: Float = 0f
    )
    val bySession = mutableMapOf<String, RowAgg>()

    var line: String? = reader.readLine()
    var rowIndex = 0
    while (line != null) {
      if (line.isNotBlank()) {
        val parts = line.split(",")
        sampleCount++
        rowIndex++

        val label = if (labelIdx >= 0 && parts.size > labelIdx) {
          parts[labelIdx].trim().lowercase(Locale.US)
        } else ""

        val isAccident = if (isAccidentIdx >= 0 && parts.size > isAccidentIdx) {
          val accField = parts[isAccidentIdx].trim().lowercase(Locale.US)
          accField == "1" || accField == "true"
        } else {
          label.contains("impact") || label.contains("skid") ||
            (label.contains("fall") && !label.contains("phone"))
        }

        val sessionKey = if (sessionIdx >= 0 && parts.size > sessionIdx) {
          parts[sessionIdx].trim().ifBlank { "${label.ifBlank { "unlabeled" }}|$rowIndex" }
        } else {
          "${label.ifBlank { "unlabeled" }}|${if (isAccident) "pos" else "neg"}"
        }
        sessionSet.add(sessionKey)
        val agg = bySession.getOrPut(sessionKey) { RowAgg() }
        if (label.isNotBlank()) agg.label = label
        if (isAccident) agg.isAccident = true

        val svmVal = if (svmIdx >= 0 && parts.size > svmIdx) {
          parts[svmIdx].trim().toFloatOrNull() ?: 0f
        } else 0f
        val svmInG = if (svmGIdx >= 0) svmVal else (svmVal / 9.80665f)
        if (svmInG > agg.peakSvmG) agg.peakSvmG = svmInG

        if (tiltIdx >= 0 && parts.size > tiltIdx) {
          parts[tiltIdx].trim().toFloatOrNull()?.let { if (it > agg.peakTilt) agg.peakTilt = it }
        }
        if (gyroIdx >= 0 && parts.size > gyroIdx) {
          parts[gyroIdx].trim().toFloatOrNull()?.let { if (it > agg.peakGyro) agg.peakGyro = it }
        }
        if (jerkIdx >= 0 && parts.size > jerkIdx) {
          parts[jerkIdx].trim().toFloatOrNull()?.let { if (it > agg.peakJerk) agg.peakJerk = it }
        }
      }
      line = reader.readLine()
    }

    if (sampleCount == 0) {
      return Result.failure(IllegalArgumentException("No valid CSV data rows found"))
    }

    val accidentPeaks = bySession.values.filter { it.isAccident }.map { it.peakSvmG }.filter { it > 0f }
    val adlPeaks = bySession.values.filter { !it.isAccident }.map { it.peakSvmG }.filter { it > 0f }
    val phoneFallPeaks = bySession.values.filter { agg ->
      !agg.isAccident && (
        agg.label.contains("phone_fall") ||
          agg.label.contains("phone fall") ||
          agg.label.contains("phone_falling") ||
          agg.label.contains("drop")
        )
    }.map { it.peakSvmG }.filter { it > 0f }

    val accidentTilts = bySession.values.filter { it.isAccident }.map { it.peakTilt }.filter { it > 0f }
    val accidentGyros = bySession.values.filter { it.isAccident }.map { it.peakGyro }.filter { it > 0f }
    val accidentJerks = bySession.values.filter { it.isAccident }.map { it.peakJerk }.filter { it > 0f }
    val adlTilts = bySession.values.filter { !it.isAccident }.map { it.peakTilt }
    val adlGyros = bySession.values.filter { !it.isAccident }.map { it.peakGyro }
    val adlJerks = bySession.values.filter { !it.isAccident }.map { it.peakJerk }

    val maxAdl = adlPeaks.maxOrNull() ?: 0f
    val maxPhoneFall = phoneFallPeaks.maxOrNull() ?: 0f
    val maxNegative = max(maxAdl, maxPhoneFall)
    val minAccident = accidentPeaks.minOrNull() ?: 0f

    val computedCrashG = when {
      accidentPeaks.isEmpty() -> 0f
      maxNegative > 0f && minAccident > maxNegative -> (maxNegative + minAccident) / 2.0f
      else -> minAccident
    }

    val computedTilt = classSep(accidentTilts, adlTilts)
    val computedGyro = classSep(accidentGyros, adlGyros)
    val computedJerk = classSep(accidentJerks, adlJerks)

    val updated = ImuCalibration(
      isCalibrated = computedCrashG > 0f,
      sourceName = fileName,
      crashThresholdG = computedCrashG,
      maxNegativeG = maxNegative,
      phoneFallMaxG = maxPhoneFall,
      adlMaxG = maxAdl,
      minAccidentG = minAccident,
      minTiltDeltaDeg = computedTilt,
      minGyroMagRads = computedGyro,
      minJerkMps3 = computedJerk,
      adlShakeFilterActive = computedCrashG > 0f,
      totalSamplesImported = sampleCount,
      totalSessionsImported = max(1, sessionSet.size),
      calibratedAtMs = System.currentTimeMillis()
    )
    persistCalibration(updated)
    return Result.success(updated)
  }

  private fun classSep(positivePeaks: List<Float>, negativePeaks: List<Float>): Float {
    if (positivePeaks.isEmpty()) return 0f
    val posMin = positivePeaks.min()
    val negMax = negativePeaks.maxOrNull() ?: 0f
    return if (negMax > 0f && posMin > negMax) (negMax + posMin) / 2f else posMin
  }

  /**
   * Resets calibration back to uncalibrated baseline (0g, monitoring only).
   */
  fun resetToDefaults() {
    val def = ImuCalibration()
    prefs.edit().clear().apply()
    _calibrationState.value = def
  }

  /**
   * Records a false alarm / negative data instance prevented by the calibrated filter.
   */
  fun recordFalseAlarmSuppressed(reason: String) {
    val current = _calibrationState.value
    val count = current.falseAlarmsPreventedCount + 1
    val updated = current.copy(
      falseAlarmsPreventedCount = count,
      lastSuppressedReason = reason
    )
    prefs.edit()
      .putInt("false_alarms_prevented", count)
      .putString("last_suppressed_reason", reason)
      .apply()
    _calibrationState.value = updated
  }
}
