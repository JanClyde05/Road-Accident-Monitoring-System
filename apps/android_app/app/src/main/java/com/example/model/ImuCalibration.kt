package com.example.model

/**
 * Event sub-types matching shared LoRa protocol.h EventType enum:
 * EVT_FALL = 0, EVT_SKID = 1, EVT_DIRECT_IMPACT = 2
 */
enum class AccidentClassification(val eventType: Int, val displayName: String) {
  NONE(-1, "MONITORING ONLY"),
  NEGATIVE_DATA(-1, "NEGATIVE DATA / BENIGN ADL"),
  NEGATIVE_PHONE_DROP(-1, "NEGATIVE DATA / PHONE DROP"),
  FALL(0, "FALL ACCIDENT"),               // EVT_FALL
  SKID(1, "SKID / LOSS OF CONTROL"),      // EVT_SKID
  DIRECT_IMPACT(2, "COLLISION / DIRECT IMPACT") // EVT_DIRECT_IMPACT
}

/**
 * Dynamic baseline thresholds and negative-data bounds derived from
 * processed CSV / JSON correlation data exported by RAMS IMU Studio.
 *
 * By default: isCalibrated = false and thresholds = 0f (no default threshold;
 * crash detection is dormant until calibrated with baseline data).
 */
data class ImuCalibration(
  val isCalibrated: Boolean = false,
  val sourceName: String = "Not Calibrated (Raw Monitoring)",
  val crashThresholdG: Float = 0f,
  val maxNegativeG: Float = 0f,
  val phoneFallMaxG: Float = 0f,
  val adlMaxG: Float = 0f,
  val minAccidentG: Float = 0f,
  val minTiltDeltaDeg: Float = 0f,
  val minGyroMagRads: Float = 0f,
  val minJerkMps3: Float = 0f,
  val adlShakeFilterActive: Boolean = false,
  val totalSamplesImported: Int = 0,
  val totalSessionsImported: Int = 0,
  val calibratedAtMs: Long = 0L,
  val falseAlarmsPreventedCount: Int = 0,
  val lastSuppressedReason: String? = null
) {
  /**
   * Evaluates sensor kinematics against the calibrated baseline:
   * 1. Returns NONE if uncalibrated.
   * 2. Returns NEGATIVE_DATA or NEGATIVE_PHONE_DROP if within negative envelope.
   * 3. Returns classified accident type (FALL, SKID, DIRECT_IMPACT) if exceeding baseline.
   */
  fun classifyMotion(
    aMag: Float,
    tiltDeltaDeg: Float = 0f,
    gyroMagRads: Float = 0f,
    jerkMps3: Float = 0f
  ): AccidentClassification {
    if (!isCalibrated || crashThresholdG <= 0f) {
      return AccidentClassification.NONE
    }

    if (aMag < crashThresholdG) {
      return AccidentClassification.NEGATIVE_DATA
    }

    val benignPosture =
      (minTiltDeltaDeg <= 0f || tiltDeltaDeg < minTiltDeltaDeg) &&
        (minGyroMagRads <= 0f || gyroMagRads < minGyroMagRads)
    if (phoneFallMaxG > 0f && aMag <= phoneFallMaxG && benignPosture) {
      return AccidentClassification.NEGATIVE_PHONE_DROP
    }
    if (maxNegativeG > 0f && aMag <= maxNegativeG && benignPosture) {
      return AccidentClassification.NEGATIVE_DATA
    }

    return when {
      minTiltDeltaDeg > 0f && tiltDeltaDeg >= minTiltDeltaDeg -> {
        AccidentClassification.FALL
      }
      minGyroMagRads > 0f && gyroMagRads >= minGyroMagRads -> {
        AccidentClassification.SKID
      }
      else -> {
        AccidentClassification.DIRECT_IMPACT
      }
    }
  }
}
