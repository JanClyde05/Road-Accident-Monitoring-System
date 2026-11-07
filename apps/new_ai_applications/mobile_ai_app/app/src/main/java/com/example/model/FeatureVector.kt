package com.example.model

/**
 * Standardized 14-parameter feature vector computed over sliding sensor windows,
 * mathematically unified with imu_studio_app.
 */
data class FeatureVector(
    val sessionId: Long = 0L,
    val sessionLabel: String = "",
    val isAccident: Int = 0, // 1 for Positive (Accident), 0 for Negative (ADL)
    val windowStartMs: Long = 0L,
    val windowDurationMs: Long = 1000L,
    val meanSvmG: Float = 1.0f,
    val maxSvmG: Float = 1.0f,
    val minSvmG: Float = 1.0f,
    val stdSvmG: Float = 0.0f,
    val rmsSvmG: Float = 1.0f,
    val maxGyroMag: Float = 0.0f,
    val meanGyroMag: Float = 0.0f,
    val stdGyroMag: Float = 0.0f,
    val maxJerk: Float = 0.0f,
    val meanJerk: Float = 0.0f,
    val tiltDeltaDeg: Float = 0.0f,
    val signalMagnitudeArea: Float = 1.0f,
    val energySvm: Float = 1.0f,
    val zeroCrossingRate: Float = 0.0f
)

