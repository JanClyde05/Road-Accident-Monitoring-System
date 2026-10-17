package com.example.ui

import android.app.Application
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.analytics.CorrelationReport
import com.example.data.db.AppDatabase
import com.example.data.db.SampleEntity
import com.example.data.db.SessionEntity
import com.example.data.export.DatasetExporter
import com.example.data.repository.DatasetRepository
import com.example.model.FeatureVector
import com.example.model.ImuClassType
import com.example.model.ImuSamplePoint
import com.example.model.RecordingStatus
import com.example.model.TelemetryLiveState
import com.example.sensor.ImuSensorManager
import com.example.service.ImuCollectorService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class AppTab(val title: String, val iconName: String) {
    LIVE_MONITOR("Live Monitor", "Timeline"),
    CORRELATION_STUDIO("Correlation Studio", "Analytics"),
    DATASETS("Dataset Vault", "Storage"),
    SETTINGS("Sensors & Info", "Tune")
}

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    private val repository = DatasetRepository(db)
    val sensorManager = ImuSensorManager(application)

    private val vibrator = application.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator

    private val _currentTab = MutableStateFlow(AppTab.LIVE_MONITOR)
    val currentTab: StateFlow<AppTab> = _currentTab.asStateFlow()

    private val _selectedClass = MutableStateFlow(ImuClassType.IMPACT)
    val selectedClass: StateFlow<ImuClassType> = _selectedClass.asStateFlow()

    private val _targetDurationSec = MutableStateFlow(5)
    val targetDurationSec: StateFlow<Int> = _targetDurationSec.asStateFlow()

    private val _countdownRemaining = MutableStateFlow(0)
    val countdownRemaining: StateFlow<Int> = _countdownRemaining.asStateFlow()

    private val _isCountdownActive = MutableStateFlow(false)
    val isCountdownActive: StateFlow<Boolean> = _isCountdownActive.asStateFlow()

    private val _selectedSessionDetail = MutableStateFlow<Pair<SessionEntity, List<SampleEntity>>?>(null)
    val selectedSessionDetail: StateFlow<Pair<SessionEntity, List<SampleEntity>>?> = _selectedSessionDetail.asStateFlow()

    private val _correlationReport = MutableStateFlow(
        CorrelationReport(
            totalSessionsAnalyzed = 0,
            positiveCount = 0,
            negativeCount = 0,
            totalWindowsExtracted = 0,
            featureCorrelations = emptyList(),
            recommendedRules = emptyList(),
            executiveSummary = "Initializing correlation engine..."
        )
    )
    val correlationReport: StateFlow<CorrelationReport> = _correlationReport.asStateFlow()

    private val _isAnalyzingFeatures = MutableStateFlow(false)
    val isAnalyzingFeatures: StateFlow<Boolean> = _isAnalyzingFeatures.asStateFlow()

    private val _statusToast = MutableStateFlow<String?>(null)
    val statusToast: StateFlow<String?> = _statusToast.asStateFlow()

    val allSessions: StateFlow<List<SessionEntity>> = repository.allSessions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val sessionCount: StateFlow<Int> = repository.sessionCount
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val positiveCount: StateFlow<Int> = repository.positiveCount
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val negativeCount: StateFlow<Int> = repository.negativeCount
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val totalSampleCount: StateFlow<Int> = repository.totalSampleCount
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    // Merge service state with local UI state
    val liveTelemetryState: StateFlow<TelemetryLiveState> = combine(
        ImuCollectorService.serviceState,
        sensorManager.latestSample,
        _selectedClass,
        _targetDurationSec,
        _countdownRemaining
    ) { serviceState, sensorSample, chosenClass, duration, countdown ->
        if (serviceState.isBackgroundServiceRunning) {
            serviceState
        } else {
            TelemetryLiveState(
                currentSample = sensorSample,
                status = if (_isCountdownActive.value) RecordingStatus.COUNTDOWN else RecordingStatus.IDLE,
                activeClass = chosenClass,
                targetDurationSec = duration,
                countdownRemaining = countdown,
                isBackgroundServiceRunning = false
            )
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), TelemetryLiveState())

    init {
        sensorManager.startListening()
        // Automatically calculate correlation analysis whenever sessions change
        viewModelScope.launch {
            allSessions.collect { sessions ->
                recomputeCorrelations(sessions)
            }
        }
    }

    fun setTab(tab: AppTab) {
        _currentTab.value = tab
    }

    fun selectClass(classType: ImuClassType) {
        _selectedClass.value = classType
        _targetDurationSec.value = classType.defaultDurationSec
    }

    fun setTargetDuration(seconds: Int) {
        _targetDurationSec.value = seconds
    }

    fun dismissToast() {
        _statusToast.value = null
    }

    fun showToast(msg: String) {
        _statusToast.value = msg
    }

    fun startRecording(context: Context, useCountdown: Boolean = true) {
        if (ImuCollectorService.serviceState.value.isBackgroundServiceRunning) {
            stopRecording(context)
            return
        }

        if (useCountdown) {
            viewModelScope.launch {
                _isCountdownActive.value = true
                for (i in 3 downTo 1) {
                    _countdownRemaining.value = i
                    vibrateHaptic(80)
                    delay(1000)
                }
                _countdownRemaining.value = 0
                _isCountdownActive.value = false
                vibrateHaptic(200)
                launchServiceRecording(context)
            }
        } else {
            vibrateHaptic(150)
            launchServiceRecording(context)
        }
    }

    private fun launchServiceRecording(context: Context) {
        val intent = Intent(context, ImuCollectorService::class.java).apply {
            action = ImuCollectorService.ACTION_START
            putExtra(ImuCollectorService.EXTRA_CLASS_TYPE, _selectedClass.value.name)
            putExtra(ImuCollectorService.EXTRA_DURATION_SEC, _targetDurationSec.value)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
        } else {
            context.startService(intent)
        }
        showToast("Recording started: ${_selectedClass.value.displayName} in background")
    }

    fun stopRecording(context: Context) {
        vibrateHaptic(200)
        val intent = Intent(context, ImuCollectorService::class.java).apply {
            action = ImuCollectorService.ACTION_STOP
        }
        context.startService(intent)
        showToast("Recording stopped and saved to database")
    }

    fun recomputeCorrelations(sessions: List<SessionEntity> = allSessions.value) {
        viewModelScope.launch {
            _isAnalyzingFeatures.value = true
            val report = repository.computeCorrelationReport(sessions)
            _correlationReport.value = report
            _isAnalyzingFeatures.value = false
        }
    }

    fun deleteSession(sessionId: Long) {
        viewModelScope.launch {
            repository.deleteSession(sessionId)
            if (_selectedSessionDetail.value?.first?.id == sessionId) {
                _selectedSessionDetail.value = null
            }
            showToast("Session #$sessionId deleted")
        }
    }

    fun deleteAllSessions() {
        viewModelScope.launch {
            repository.deleteAll()
            _selectedSessionDetail.value = null
            showToast("All sessions cleared")
        }
    }

    fun selectSessionForDetail(session: SessionEntity) {
        viewModelScope.launch {
            val samples = repository.getSamplesForSession(session.id)
            _selectedSessionDetail.value = Pair(session, samples)
        }
    }

    fun clearSessionDetail() {
        _selectedSessionDetail.value = null
    }

    fun seedCalibratedData() {
        viewModelScope.launch {
            showToast("Generating calibrated kinematic baseline sessions...")
            repository.seedCalibratedTrialDataset()
            showToast("Added 9 calibrated trials (Positive: Fall, Impact, Skidding + Negative ADL controls)!")
        }
    }

    fun exportSingleSession(context: Context, sessionId: Long) {
        viewModelScope.launch(Dispatchers.IO) {
            val session = repository.getSessionById(sessionId) ?: return@launch
            val samples = repository.getSamplesForSession(sessionId)
            val csv = DatasetExporter.generateRawSamplesCsv(session, samples)
            val fileName = "rams_session_${session.id}_${session.labelId.lowercase()}.csv"
            withContext(Dispatchers.Main) {
                val shareIntent = DatasetExporter.exportAndShareFile(context, fileName, csv)
                context.startActivity(shareIntent)
            }
        }
    }

    fun exportAllRawSessions(context: Context) {
        viewModelScope.launch(Dispatchers.IO) {
            val sessions = allSessions.value
            if (sessions.isEmpty()) {
                withContext(Dispatchers.Main) { showToast("No sessions to export") }
                return@launch
            }
            val pairs = mutableListOf<Pair<SessionEntity, List<SampleEntity>>>()
            for (s in sessions) {
                val samples = repository.getSamplesForSession(s.id)
                pairs.add(Pair(s, samples))
            }
            val csv = DatasetExporter.generateCombinedRawCsv(pairs)
            val fileName = "rams_all_raw_imu_${SimpleDateFormat("yyyyMMdd_HHmm", Locale.US).format(Date())}.csv"
            withContext(Dispatchers.Main) {
                val shareIntent = DatasetExporter.exportAndShareFile(context, fileName, csv)
                context.startActivity(shareIntent)
            }
        }
    }

    fun exportFeatureDataset(context: Context) {
        viewModelScope.launch(Dispatchers.IO) {
            val sessions = allSessions.value
            if (sessions.isEmpty()) {
                withContext(Dispatchers.Main) { showToast("No sessions to extract features from") }
                return@launch
            }
            val allFeatures = mutableListOf<FeatureVector>()
            for (s in sessions) {
                val samples = repository.getSamplesForSession(s.id)
                val feats = com.example.analytics.FeatureEngine.extractFeaturesFromSamples(s, samples)
                allFeatures.addAll(feats)
            }
            val csv = DatasetExporter.generateFeatureDatasetCsv(allFeatures)
            val fileName = "rams_accident_features_ready_${SimpleDateFormat("yyyyMMdd_HHmm", Locale.US).format(Date())}.csv"
            withContext(Dispatchers.Main) {
                val shareIntent = DatasetExporter.exportAndShareFile(context, fileName, csv)
                context.startActivity(shareIntent)
            }
        }
    }

    fun exportWearableRules(context: Context) {
        val report = _correlationReport.value
        val json = DatasetExporter.generateWearableRulesJson(report)
        val fileName = "rams_detection_rules_${SimpleDateFormat("yyyyMMdd_HHmm", Locale.US).format(Date())}.json"
        val shareIntent = DatasetExporter.exportAndShareFile(context, fileName, json, mimeType = "application/json")
        context.startActivity(shareIntent)
    }

    private fun vibrateHaptic(durationMs: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(durationMs)
            }
        } catch (e: Exception) {
            // Ignore if vibration disallowed
        }
    }

    override fun onCleared() {
        super.onCleared()
        sensorManager.stopListening()
    }
}
