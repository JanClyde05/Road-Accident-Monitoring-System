package com.example.model

enum class ImuCategory(val displayName: String, val badgeColorHex: Long) {
    POSITIVE("Accident Event", 0xFFEF4444),
    NEGATIVE("ADL / False-Positive Filter", 0xFF10B981)
}

enum class ImuClassType(
    val id: String,
    val displayName: String,
    val category: ImuCategory,
    val description: String,
    val defaultDurationSec: Int,
    val iconName: String
) {
    // Positive Accident Scenarios
    FALL(
        id = "FALL",
        displayName = "Fall",
        category = ImuCategory.POSITIVE,
        description = "Sudden drop/descent followed by sharp ground impact and distinct post-fall angle tilt",
        defaultDurationSec = 6,
        iconName = "PersonalInjury"
    ),
    IMPACT(
        id = "IMPACT",
        displayName = "Impact",
        category = ImuCategory.POSITIVE,
        description = "High-g deceleration collision shockwave, rapid acceleration spike and sharp jerk",
        defaultDurationSec = 5,
        iconName = "FlashOn"
    ),
    SKIDDING(
        id = "SKIDDING",
        displayName = "Skidding",
        category = ImuCategory.POSITIVE,
        description = "Lateral loss of traction, high yaw rate oscillation and unstable lateral acceleration",
        defaultDurationSec = 8,
        iconName = "AltRoute"
    ),

    // Negative ADL / Rejection Scenarios
    WALKING(
        id = "WALKING",
        displayName = "Walking",
        category = ImuCategory.NEGATIVE,
        description = "Rhythmic low-g steps (~1.8-2.0 Hz), regular cyclic acceleration without impact spikes",
        defaultDurationSec = 15,
        iconName = "DirectionsWalk"
    ),
    RUNNING(
        id = "RUNNING",
        displayName = "Running",
        category = ImuCategory.NEGATIVE,
        description = "Higher frequency cyclic steps (~2.5-3.5 Hz) with moderate peak g, periodic pattern",
        defaultDurationSec = 15,
        iconName = "DirectionsRun"
    ),
    JUMPING(
        id = "JUMPING",
        displayName = "Jumping",
        category = ImuCategory.NEGATIVE,
        description = "Vertical launch followed by landing impulse dampening through knees/body flexion",
        defaultDurationSec = 10,
        iconName = "AccessibilityNew"
    ),
    PHONE_FALLING(
        id = "PHONE_FALLING",
        displayName = "Phone Falling",
        category = ImuCategory.NEGATIVE,
        description = "Freefall drop of the device itself (near 0-g during descent) without rider body dynamics",
        defaultDurationSec = 5,
        iconName = "Smartphone"
    ),
    PHONE_SHAKING(
        id = "PHONE_SHAKING",
        displayName = "Phone Shaking",
        category = ImuCategory.NEGATIVE,
        description = "Rapid high-frequency hand tremor or pocket turbulence with zero net displacement",
        defaultDurationSec = 8,
        iconName = "Vibration"
    ),
    NORMAL_VEHICLE_RIDE(
        id = "NORMAL_VEHICLE_RIDE",
        displayName = "Normal Vehicle Ride",
        category = ImuCategory.NEGATIVE,
        description = "Generalized vehicle riding: engine vibration, cruising, road bumps, turning, gentle braking",
        defaultDurationSec = 20,
        iconName = "DirectionsCar"
    );

    val isPositive: Boolean
        get() = category == ImuCategory.POSITIVE
}

data class ImuSamplePoint(
    val timestamp: Long,
    val relTimeMs: Long,
    val ax: Float,
    val ay: Float,
    val az: Float,
    val gx: Float,
    val gy: Float,
    val gz: Float,
    val svm: Float,           // Magnitude in m/s^2: sqrt(ax^2 + ay^2 + az^2)
    val svmG: Float,          // Magnitude in G's (svm / 9.80665)
    val gyroMag: Float,       // Gyro magnitude in rad/s: sqrt(gx^2 + gy^2 + gz^2)
    val jerk: Float,          // Rate of change of acceleration (m/s^3)
    val pitch: Float,         // Pitch angle in degrees
    val roll: Float           // Roll angle in degrees
)

enum class RecordingStatus {
    IDLE,
    COUNTDOWN,
    RECORDING,
    SAVING
}

data class TelemetryLiveState(
    val currentSample: ImuSamplePoint = ImuSamplePoint(
        timestamp = 0L,
        relTimeMs = 0L,
        ax = 0f,
        ay = 9.81f,
        az = 0f,
        gx = 0f,
        gy = 0f,
        gz = 0f,
        svm = 9.81f,
        svmG = 1.0f,
        gyroMag = 0f,
        jerk = 0f,
        pitch = 0f,
        roll = 0f
    ),
    val status: RecordingStatus = RecordingStatus.IDLE,
    val activeClass: ImuClassType = ImuClassType.IMPACT,
    val elapsedMs: Long = 0L,
    val targetDurationSec: Int = 5, // 0 means continuous until manual stop
    val countdownRemaining: Int = 0,
    val recordedSampleCount: Int = 0,
    val samplingRateHz: Float = 50f,
    val peakSvmG: Float = 1.0f,
    val peakGyroMag: Float = 0f,
    val peakJerk: Float = 0f,
    val isBackgroundServiceRunning: Boolean = false
)

data class FeatureVector(
    val sessionId: Long,
    val sessionLabel: String,
    val isAccident: Int, // 1 for Positive, 0 for Negative
    val windowStartMs: Long,
    val windowDurationMs: Long,
    val meanSvmG: Float,
    val maxSvmG: Float,
    val minSvmG: Float,
    val stdSvmG: Float,
    val rmsSvmG: Float,
    val maxGyroMag: Float,
    val meanGyroMag: Float,
    val stdGyroMag: Float,
    val maxJerk: Float,
    val meanJerk: Float,
    val tiltDeltaDeg: Float,
    val signalMagnitudeArea: Float,
    val energySvm: Float,
    val zeroCrossingRate: Float
)
