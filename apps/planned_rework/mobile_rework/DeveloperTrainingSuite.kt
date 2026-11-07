package com.example.ai

import android.content.Context
import android.content.SharedPreferences
import android.os.Environment
import android.util.Log
import com.example.model.FeatureVector
import com.example.model.ImuData
import com.example.model.GpsData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID
import kotlin.math.sqrt

/**
 * In-App Developer Training Suite & Simulation Data Collector for RAMS.
 *
 * Allows developers, testers, and riders to:
 * 1. Enable a "Developer Training Mode" directly in the Android app.
 * 2. Record real-world simulated test maneuvers (sudden braking, potholes, dropped phone, tilts).
 * 3. Tag ground truth (Accident vs False Alarm / ADL) with exact matching schemas from imu_studio_app.
 * 4. Compute canonical 14-parameter feature vectors in real time.
 * 5. Persist and export standardized training datasets for training edge models.
 */
class DeveloperTrainingSuite(
    private val context: Context,
    private val scope: CoroutineScope
) {

    companion object {
        private const val TAG = "RAMS_TrainingSuite"
        private const val PREFS_NAME = "rams_dev_training_prefs"
        private const val KEY_DEV_MODE_ENABLED = "dev_mode_enabled"
        private const val SAMPLES_SUBDIR = "RAMS_Training_Datasets"
    }

    enum class RecordingState {
        IDLE,
        RECORDING,
        REVIEW_AND_TAG,
        SAVING
    }

    data class ActiveRecordingSession(
        val sessionId: String = UUID.randomUUID().toString(),
        val startTimestampMs: Long = System.currentTimeMillis(),
        val samples: MutableList<ImuData> = mutableListOf(),
        val preSpeedKmh: Float = 0f,
        val locationAddress: String = ""
    )

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    // Observable states
    private val _isDeveloperModeActive = MutableStateFlow(prefs.getBoolean(KEY_DEV_MODE_ENABLED, false))
    val isDeveloperModeActive: StateFlow<Boolean> = _isDeveloperModeActive.asStateFlow()

    private val _recordingState = MutableStateFlow(RecordingState.IDLE)
    val recordingState: StateFlow<RecordingState> = _recordingState.asStateFlow()

    private val _currentSession = MutableStateFlow<ActiveRecordingSession?>(null)
    val currentSession: StateFlow<ActiveRecordingSession?> = _currentSession.asStateFlow()

    private val _recordedSessionsCount = MutableStateFlow(countSavedDatasets())
    val recordedSessionsCount: StateFlow<Int> = _recordedSessionsCount.asStateFlow()

    fun setDeveloperModeEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_DEV_MODE_ENABLED, enabled).apply()
        _isDeveloperModeActive.value = enabled
        Log.i(TAG, "Developer Training Mode set to: $enabled")
    }

    /**
     * Starts logging real-time IMU samples for a simulation run.
     */
    fun startSimulationRecording(currentSpeedKmh: Float, address: String) {
        if (!_isDeveloperModeActive.value) return

        val newSession = ActiveRecordingSession(
            preSpeedKmh = currentSpeedKmh,
            locationAddress = address
        )
        _currentSession.value = newSession
        _recordingState.value = RecordingState.RECORDING
        Log.i(TAG, "Simulation recording started (Session ID: ${newSession.sessionId})")
    }

    /**
     * Ingests high-rate (50Hz) sensor readings while recording.
     */
    fun recordSample(sample: ImuData) {
        if (_recordingState.value != RecordingState.RECORDING) return
        val session = _currentSession.value ?: return

        synchronized(session.samples) {
            session.samples.add(sample)
        }
    }

    /**
     * Stops the simulation recording and prompts for ground truth tagging.
     */
    fun stopRecordingForReview() {
        if (_recordingState.value != RecordingState.RECORDING) return
        _recordingState.value = RecordingState.REVIEW_AND_TAG
        Log.i(TAG, "Recording paused for labeling. Samples collected: ${_currentSession.value?.samples?.size ?: 0}")
    }

    /**
     * Labels the recorded simulation data and exports it to canonical JSON and CSV.
     *
     * @param isAccident true if this was an authentic accident simulation, false if false-alarm / ADL
     * @param category "POSITIVE" or "NEGATIVE"
     * @param classType e.g., "IMPACT", "FALL", "SKIDDING", "PHONE_FALLING", "POTHOLE_BOUNCE"
     * @param riderNotes Contextual details (e.g., "Phone dropped on asphalt from 1 meter while stopped")
     */
    fun commitAndExportSession(
        isAccident: Boolean,
        category: String,
        classType: String,
        riderNotes: String,
        onComplete: (File?) -> Unit
    ) {
        val session = _currentSession.value ?: run {
            onComplete(null)
            return
        }

        _recordingState.value = RecordingState.SAVING

        scope.launch(Dispatchers.IO) {
            val samplesCopy: List<ImuData>
            synchronized(session.samples) {
                samplesCopy = ArrayList(session.samples)
            }

            if (samplesCopy.isEmpty()) {
                withContext(Dispatchers.Main) {
                    _recordingState.value = RecordingState.IDLE
                    onComplete(null)
                }
                return@launch
            }

            val featureVector = computeCanonicalFeatures(session.sessionId, samplesCopy, isAccident, classType)
            val jsonFile = writeDatasetJson(session, samplesCopy, featureVector, isAccident, category, classType, riderNotes)

            withContext(Dispatchers.Main) {
                _recordedSessionsCount.value = countSavedDatasets()
                _recordingState.value = RecordingState.IDLE
                _currentSession.value = null
                onComplete(jsonFile)
            }
        }
    }

    /**
     * Computes the identical 14-parameter feature vector established in imu_studio_app.
     */
    private fun computeCanonicalFeatures(
        sessionId: String,
        samples: List<ImuData>,
        isAccident: Boolean,
        classLabel: String
    ): FeatureVector {
        var sumSvm = 0f
        var maxSvm = 0f
        var minSvm = Float.MAX_VALUE
        var sumSvmSq = 0f
        var maxGyro = 0f
        var sumGyro = 0f
        var maxJerk = 0f
        var sumJerk = 0f
        var prevSvm = -1f
        var zeroCrossings = 0

        for (s in samples) {
            val svmG = s.svmG
            sumSvm += svmG
            sumSvmSq += svmG * svmG
            if (svmG > maxSvm) maxSvm = svmG
            if (svmG < minSvm) minSvm = svmG

            val gyroMag = sqrt((s.gyroX * s.gyroX + s.gyroY * s.gyroY + s.gyroZ * s.gyroZ).toDouble()).toFloat()
            if (gyroMag > maxGyro) maxGyro = gyroMag
            sumGyro += gyroMag

            if (prevSvm >= 0f) {
                val jerk = kotlin.math.abs(svmG - prevSvm) * 50f
                if (jerk > maxJerk) maxJerk = jerk
                sumJerk += jerk
                if ((prevSvm - 1.0f) * (svmG - 1.0f) < 0f) zeroCrossings++
            }
            prevSvm = svmG
        }

        val count = samples.size.toFloat()
        val meanSvm = sumSvm / count
        val variance = (sumSvmSq / count) - (meanSvm * meanSvm)
        val stdSvm = sqrt(kotlin.math.max(0.0, variance.toDouble())).toFloat()
        val rmsSvm = sqrt((sumSvmSq / count).toDouble()).toFloat()

        val tiltDelta = kotlin.math.abs(samples.last().pitchDegrees - samples.first().pitchDegrees) +
                kotlin.math.abs(samples.last().rollDegrees - samples.first().rollDegrees)

        return FeatureVector(
            sessionId = System.currentTimeMillis(),
            sessionLabel = classLabel,
            isAccident = if (isAccident) 1 else 0,
            windowStartMs = samples.first().timestamp,
            windowDurationMs = samples.last().timestamp - samples.first().timestamp,
            meanSvmG = meanSvm,
            maxSvmG = maxSvm,
            minSvmG = minSvm,
            stdSvmG = stdSvm,
            rmsSvmG = rmsSvm,
            maxGyroMag = maxGyro,
            meanGyroMag = sumGyro / count,
            stdGyroMag = 0f,
            maxJerk = maxJerk,
            meanJerk = sumJerk / count,
            tiltDeltaDeg = tiltDelta,
            signalMagnitudeArea = sumSvm,
            energySvm = sumSvmSq,
            zeroCrossingRate = zeroCrossings.toFloat() / count
        )
    }

    /**
     * Serializes session to JSON compliant with training_sample_schema.json.
     */
    private fun writeDatasetJson(
        session: ActiveRecordingSession,
        samples: List<ImuData>,
        f: FeatureVector,
        isAccident: Boolean,
        category: String,
        classType: String,
        notes: String
    ): File? {
        return try {
            val baseDir = File(context.getExternalFilesDir(null), SAMPLES_SUBDIR).apply { mkdirs() }
            val timeTag = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date(session.startTimestampMs))
            val fileName = "rams_sim_${classType.lowercase()}_${timeTag}.json"
            val targetFile = File(baseDir, fileName)

            val rootJson = JSONObject().apply {
                put("session_id", session.sessionId)
                put("timestamp_epoch_ms", session.startTimestampMs)
                put("category", category)
                put("class_type", classType)
                put("is_accident", if (isAccident) 1 else 0)

                put("metadata", JSONObject().apply {
                    put("device_model", android.os.Build.MODEL)
                    put("sensor_source", "PHONE_HARDWARE")
                    put("sampling_rate_hz", 50.0)
                    put("pre_event_speed_kmh", session.preSpeedKmh)
                    put("rider_notes", notes)
                    put("location_address", session.locationAddress)
                })

                put("features", JSONObject().apply {
                    put("mean_svm_g", f.meanSvmG)
                    put("max_svm_g", f.maxSvmG)
                    put("min_svm_g", f.minSvmG)
                    put("std_svm_g", f.stdSvmG)
                    put("rms_svm_g", f.rmsSvmG)
                    put("max_gyro_mag", f.maxGyroMag)
                    put("mean_gyro_mag", f.meanGyroMag)
                    put("max_jerk", f.maxJerk)
                    put("mean_jerk", f.meanJerk)
                    put("tilt_delta_deg", f.tiltDeltaDeg)
                    put("signal_magnitude_area", f.signalMagnitudeArea)
                    put("energy_svm", f.energySvm)
                    put("zero_crossing_rate", f.zeroCrossingRate)
                })

                val rawArray = JSONArray()
                val startTime = samples.first().timestamp
                for (s in samples) {
                    val sampleObj = JSONObject().apply {
                        put("rel_time_ms", s.timestamp - startTime)
                        put("ax", s.accelX)
                        put("ay", s.accelY)
                        put("az", s.accelZ)
                        put("gx", s.gyroX)
                        put("gy", s.gyroY)
                        put("gz", s.gyroZ)
                        put("svm_g", s.svmG)
                        put("pitch_deg", s.pitchDegrees)
                        put("roll_deg", s.rollDegrees)
                    }
                    rawArray.put(sampleObj)
                }
                put("raw_samples", rawArray)
            }

            FileWriter(targetFile).use { it.write(rootJson.toString(2)) }
            Log.i(TAG, "Dataset successfully written to ${targetFile.absolutePath}")
            targetFile
        } catch (e: Exception) {
            Log.e(TAG, "Failed to write simulation dataset JSON", e)
            null
        }
    }

    private fun countSavedDatasets(): Int {
        val baseDir = File(context.getExternalFilesDir(null), SAMPLES_SUBDIR)
        return if (baseDir.exists() && baseDir.isDirectory) {
            baseDir.listFiles { _, name -> name.endsWith(".json") }?.size ?: 0
        } else 0
    }
}

