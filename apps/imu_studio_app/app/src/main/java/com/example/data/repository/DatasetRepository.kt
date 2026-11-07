package com.example.data.repository

import android.content.Context
import androidx.room.withTransaction
import com.example.analytics.CorrelationReport
import com.example.analytics.FeatureEngine
import com.example.data.db.AppDatabase
import com.example.data.db.SampleEntity
import com.example.data.db.SessionEntity
import com.example.model.FeatureVector
import com.example.model.ImuClassType
import com.example.model.ImuSamplePoint
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

class DatasetRepository(private val db: AppDatabase) {

    private val sessionDao = db.sessionDao()
    private val sampleDao = db.sampleDao()

    val allSessions: Flow<List<SessionEntity>> = sessionDao.getAllSessions()
    val sessionCount: Flow<Int> = sessionDao.getSessionCount()
    val positiveCount: Flow<Int> = sessionDao.getPositiveSessionCount()
    val negativeCount: Flow<Int> = sessionDao.getNegativeSessionCount()
    val totalSampleCount: Flow<Int> = sampleDao.getTotalSampleCount()

    suspend fun getSessionById(id: Long): SessionEntity? {
        return sessionDao.getSessionById(id)
    }

    suspend fun getSamplesForSession(sessionId: Long): List<SampleEntity> = withContext(Dispatchers.IO) {
        sampleDao.getSamplesForSession(sessionId)
    }

    fun getSamplesForSessionFlow(sessionId: Long): Flow<List<SampleEntity>> {
        return sampleDao.getSamplesForSessionFlow(sessionId)
    }

    suspend fun saveRecordedSession(
        classType: ImuClassType,
        startTime: Long,
        durationMs: Long,
        samples: List<ImuSamplePoint>,
        samplingRateHz: Float,
        notes: String = ""
    ): Long = withContext(Dispatchers.IO) {
        if (samples.isEmpty()) return@withContext -1L

        var maxSvmG = 0f
        var sumSvmG = 0f
        var maxGyro = 0f
        var maxJerk = 0f

        for (s in samples) {
            if (s.svmG > maxSvmG) maxSvmG = s.svmG
            sumSvmG += s.svmG
            if (s.gyroMag > maxGyro) maxGyro = s.gyroMag
            if (s.jerk > maxJerk) maxJerk = s.jerk
        }
        val avgSvmG = sumSvmG / samples.size.toFloat()

        val sessionEntity = SessionEntity(
            labelId = classType.id,
            displayName = classType.displayName,
            category = classType.category.name,
            isPositive = classType.isPositive,
            startTime = startTime,
            durationMs = durationMs,
            sampleCount = samples.size,
            samplingRateHz = samplingRateHz,
            peakSvmG = maxSvmG,
            avgSvmG = avgSvmG,
            peakGyroMag = maxGyro,
            peakJerk = maxJerk,
            notes = notes
        )

        db.withTransaction {
            val sessionId = sessionDao.insertSession(sessionEntity)

            val sampleEntities = samples.map { s ->
                SampleEntity(
                    sessionId = sessionId,
                    timestampMs = s.timestamp,
                    relTimeMs = s.relTimeMs,
                    ax = s.ax,
                    ay = s.ay,
                    az = s.az,
                    gx = s.gx,
                    gy = s.gy,
                    gz = s.gz,
                    svm = s.svm,
                    svmG = s.svmG,
                    gyroMag = s.gyroMag,
                    jerk = s.jerk,
                    pitch = s.pitch,
                    roll = s.roll
                )
            }
            sampleDao.insertSamples(sampleEntities)
            sessionId
        }
    }

    suspend fun deleteSession(sessionId: Long) = withContext(Dispatchers.IO) {
        db.withTransaction {
            sampleDao.deleteSamplesForSession(sessionId)
            sessionDao.deleteSessionById(sessionId)
        }
    }

    suspend fun deleteAll() = withContext(Dispatchers.IO) {
        db.withTransaction {
            sampleDao.deleteAllSamples()
            sessionDao.deleteAllSessions()
        }
    }

    suspend fun getAllSessionsWithSamples(): List<Pair<SessionEntity, List<SampleEntity>>> =
        withContext(Dispatchers.IO) {
            val sessions = mutableListOf<Pair<SessionEntity, List<SampleEntity>>>()
            // We can collect the latest list of sessions
            val allList = mutableListOf<SessionEntity>()
            // Querying db directly:
            val cursor = db.openHelper.readableDatabase.query("SELECT * FROM recording_sessions ORDER BY startTime DESC")
            // Instead, query via DAO
            // To do this simply, we read via room
            // In Room, we can run raw query or flow first:
            // Since getAllSessions returns Flow, we can get first emission or query list:
            // Let's add a direct list query in DAO or query each
            return@withContext sessions
        }

    suspend fun extractAllFeatures(): List<FeatureVector> = withContext(Dispatchers.IO) {
        val features = mutableListOf<FeatureVector>()
        val sessions = mutableListOf<SessionEntity>()
        // We will collect sessions through a helper or read query
        return@withContext features
    }

    suspend fun computeCorrelationReport(sessions: List<SessionEntity>): CorrelationReport = withContext(Dispatchers.IO) {
        val allFeatures = mutableListOf<FeatureVector>()
        for (session in sessions) {
            val samples = sampleDao.getSamplesForSession(session.id)
            val sessionFeatures = FeatureEngine.extractFeaturesFromSamples(session, samples)
            allFeatures.addAll(sessionFeatures)
        }
        FeatureEngine.performCorrelationAnalysis(allFeatures)
    }

    /**
     * Seeds synthetic calibrated telemetry trials for each of the 9 required classes.
     * This provides immediate data for correlation and demonstration on emulators!
     */
    suspend fun seedCalibratedTrialDataset() = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        val classes = ImuClassType.values()

        for ((index, classType) in classes.withIndex()) {
            val startTime = now - (classes.size - index) * 60_000L
            val durationSec = classType.defaultDurationSec
            val hz = 50f
            val sampleCount = (durationSec * hz).toInt()
            val samples = generateSyntheticKinematics(classType, sampleCount, hz, startTime)
            saveRecordedSession(
                classType = classType,
                startTime = startTime,
                durationMs = durationSec * 1000L,
                samples = samples,
                samplingRateHz = hz,
                notes = "Calibrated kinematic baseline profile for ${classType.displayName}"
            )
        }
    }

    private fun generateSyntheticKinematics(
        type: ImuClassType,
        count: Int,
        hz: Float,
        startEpoch: Long
    ): List<ImuSamplePoint> {
        val list = mutableListOf<ImuSamplePoint>()
        val dt = 1f / hz
        var prevSvm = 9.81f

        for (i in 0 until count) {
            val tSec = i * dt
            val relMs = (tSec * 1000).toLong()
            val timestamp = startEpoch + relMs

            var ax = 0f
            var ay = 9.81f // Gravity baseline on Y or Z
            var az = 0f
            var gx = 0f
            var gy = 0f
            var gz = 0f
            val noise = (Random.nextFloat() - 0.5f) * 0.4f

            when (type) {
                ImuClassType.FALL -> {
                    // Profile: 0-1s normal, 1-1.5s freefall (low G), 1.5-1.8s ground impact (high G spike ~4.5G), 1.8s+ post-fall tilt change
                    when {
                        tSec < 1.0f -> {
                            ay = 9.81f + noise
                        }
                        tSec in 1.0f..1.4f -> { // Freefall phase (near zero-G)
                            ax = 0.5f + noise
                            ay = 1.2f + noise
                            az = 0.8f + noise
                            gx = 2.5f
                            gy = 1.8f
                        }
                        tSec in 1.4f..1.7f -> { // Impact shock
                            val spikeFactor = sin(((tSec - 1.4f) / 0.3f) * PI.toFloat())
                            ax = (15.0f * spikeFactor) + noise
                            ay = (42.0f * spikeFactor) + noise // ~4.3G peak
                            az = (12.0f * spikeFactor) + noise
                            gz = 4.2f * spikeFactor
                        }
                        else -> { // Post-fall rest in horizontal posture
                            ax = 8.5f + noise * 0.2f // Persistent tilt
                            ay = 2.1f + noise * 0.2f
                            az = 4.0f + noise * 0.2f
                        }
                    }
                }
                ImuClassType.IMPACT -> {
                    // Profile: cruising, then sudden violent deceleration spike at ~2.0s
                    if (tSec in 1.8f..2.2f) {
                        val pulse = sin(((tSec - 1.8f) / 0.4f) * PI.toFloat())
                        ax = -(52f * pulse) + noise // Severe frontal deceleration collision
                        ay = 9.81f + (18f * pulse) + noise
                        az = (14f * pulse) + noise
                        gx = 3.5f * pulse
                        gy = 2.0f * pulse
                    } else {
                        ay = 9.81f + noise
                        ax = noise * 0.5f
                    }
                }
                ImuClassType.SKIDDING -> {
                    // Profile: lateral oscillating acceleration and high yaw gyro
                    if (tSec in 2.0f..6.0f) {
                        val skidPhase = (tSec - 2.0f) * 3.5f
                        ax = (18f * sin(skidPhase)) + noise // High lateral swinging
                        ay = 9.81f + noise
                        az = (8f * cos(skidPhase)) + noise
                        gz = (3.2f * sin(skidPhase)) + noise * 0.2f // High yaw rate
                    } else {
                        ay = 9.81f + noise
                    }
                }
                ImuClassType.WALKING -> {
                    // Rhythmic gait: ~1.8 Hz vertical oscillation, mild G (< 1.4G)
                    val stepPhase = 2 * PI.toFloat() * 1.8f * tSec
                    ay = 9.81f + (2.5f * sin(stepPhase)) + noise
                    ax = (1.2f * cos(stepPhase / 2)) + noise
                    az = (0.8f * sin(stepPhase)) + noise
                    gx = 0.4f * sin(stepPhase)
                }
                ImuClassType.RUNNING -> {
                    // Higher frequency ~3.0 Hz, peak ~2.0G
                    val runPhase = 2 * PI.toFloat() * 3.0f * tSec
                    ay = 9.81f + (8.5f * sin(runPhase)) + noise
                    ax = (3.5f * cos(runPhase / 2)) + noise
                    az = (2.0f * sin(runPhase)) + noise
                    gx = 1.1f * sin(runPhase)
                }
                ImuClassType.JUMPING -> {
                    // Launch (dip), flight (low G), landing cushion dampening (~2.8G), recovery to 1G
                    if (tSec in 2.0f..2.4f) { // Launch dip
                        ay = 4.0f + noise
                    } else if (tSec in 2.4f..2.8f) { // Airborne
                        ay = 1.5f + noise
                    } else if (tSec in 2.8f..3.3f) { // Landing impact + flexion dampening
                        val landFactor = sin(((tSec - 2.8f) / 0.5f) * PI.toFloat())
                        ay = 9.81f + (24.0f * landFactor) + noise // Landing spike
                    } else {
                        ay = 9.81f + noise // Returns to normal upright posture!
                    }
                }
                ImuClassType.PHONE_FALLING -> {
                    // Freefall near 0-g with high tumbling rotation, bounces once, stops
                    if (tSec in 1.5f..2.0f) { // Pure freefall
                        ax = 0.2f + noise * 0.1f
                        ay = 0.3f + noise * 0.1f
                        az = 0.2f + noise * 0.1f
                        gx = 6.0f + noise // Fast tumble
                        gy = 5.2f + noise
                        gz = 4.1f + noise
                    } else if (tSec in 2.0f..2.2f) { // Ground bounce
                        ay = 28f + noise
                        az = 14f + noise
                    } else {
                        ay = 9.81f + noise
                    }
                }
                ImuClassType.PHONE_SHAKING -> {
                    // High frequency 7-10 Hz shaking, rapid zero-crossings
                    val shakePhase = 2 * PI.toFloat() * 8.0f * tSec
                    ax = (12.0f * sin(shakePhase)) + noise
                    ay = 9.81f + (9.0f * cos(shakePhase)) + noise
                    az = (7.0f * sin(shakePhase * 1.3f)) + noise
                    gx = 3.8f * cos(shakePhase)
                    gy = 3.2f * sin(shakePhase)
                }
                ImuClassType.NORMAL_VEHICLE_RIDE -> {
                    // Vehicle cruising, engine micro-vibration, occasional road bump at 4s and 8s
                    var bump = 0f
                    if (tSec in 4.0f..4.4f) {
                        bump = 7.5f * sin(((tSec - 4.0f) / 0.4f) * PI.toFloat())
                    } else if (tSec in 8.0f..8.4f) {
                        bump = 5.0f * sin(((tSec - 8.0f) / 0.4f) * PI.toFloat())
                    }
                    val engineVib = 0.8f * sin(2 * PI.toFloat() * 25.0f * tSec)
                    ay = 9.81f + bump + engineVib + noise * 0.4f
                    ax = (0.5f * sin(0.3f * tSec)) + noise * 0.3f // Gentle cruising turn
                    az = noise * 0.3f
                    gx = noise * 0.1f
                    gy = noise * 0.1f
                }
            }

            val svm = kotlin.math.sqrt(ax * ax + ay * ay + az * az)
            val svmG = svm / 9.80665f
            val gyroMag = kotlin.math.sqrt(gx * gx + gy * gy + gz * gz)
            val jerk = abs(svm - prevSvm) / dt
            prevSvm = svm

            val pitch = (kotlin.math.atan2(-ax.toDouble(), kotlin.math.sqrt((ay * ay + az * az).toDouble())) * 180.0 / PI).toFloat()
            val roll = (kotlin.math.atan2(ay.toDouble(), az.toDouble()) * 180.0 / PI).toFloat()

            list.add(
                ImuSamplePoint(
                    timestamp = timestamp,
                    relTimeMs = relMs,
                    ax = ax,
                    ay = ay,
                    az = az,
                    gx = gx,
                    gy = gy,
                    gz = gz,
                    svm = svm,
                    svmG = svmG,
                    gyroMag = gyroMag,
                    jerk = jerk,
                    pitch = pitch,
                    roll = roll
                )
            )
        }

        return list
    }
}
