package com.example.data.db

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "recording_sessions")
data class SessionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0L,
    val labelId: String,          // e.g. "FALL", "IMPACT", "WALKING"
    val displayName: String,      // e.g. "Fall", "Impact", "Walking"
    val category: String,         // "POSITIVE" or "NEGATIVE"
    val isPositive: Boolean,
    val startTime: Long,          // Epoch timestamp
    val durationMs: Long,
    val sampleCount: Int,
    val samplingRateHz: Float,
    val peakSvmG: Float,
    val avgSvmG: Float,
    val peakGyroMag: Float,
    val peakJerk: Float,
    val notes: String = ""
)

@Entity(
    tableName = "imu_samples",
    indices = [
        Index(value = ["sessionId"]),
        Index(value = ["sessionId", "relTimeMs"])
    ]
)
data class SampleEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0L,
    val sessionId: Long,
    val timestampMs: Long,
    val relTimeMs: Long,
    val ax: Float,
    val ay: Float,
    val az: Float,
    val gx: Float,
    val gy: Float,
    val gz: Float,
    val svm: Float,
    val svmG: Float,
    val gyroMag: Float,
    val jerk: Float,
    val pitch: Float,
    val roll: Float
)
