package com.example.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.example.MainActivity
import com.example.R
import com.example.data.db.AppDatabase
import com.example.data.repository.DatasetRepository
import com.example.model.ImuClassType
import com.example.model.ImuSamplePoint
import com.example.model.RecordingStatus
import com.example.model.TelemetryLiveState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.concurrent.ConcurrentLinkedQueue
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.sqrt

class ImuCollectorService : Service(), SensorEventListener {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var tickerJob: Job? = null

    private lateinit var sensorManager: SensorManager
    private var accelerometer: Sensor? = null
    private var gyroscope: Sensor? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private lateinit var repository: DatasetRepository

    private var activeClassType: ImuClassType = ImuClassType.IMPACT
    private var targetDurationSec: Int = 5
    private var sessionStartTime: Long = 0L

    private val recordedSamples = mutableListOf<ImuSamplePoint>()
    private var lastAx = 0f
    private var lastAy = 9.81f
    private var lastAz = 0f
    private var lastGx = 0f
    private var lastGy = 0f
    private var lastGz = 0f
    private var lastNanos = 0L
    private var lastSvm = 9.81f

    private var peakSvmG = 1.0f
    private var peakGyro = 0f
    private var peakJerk = 0f

    companion object {
        const val CHANNEL_ID = "rams_imu_recorder_channel"
        const val NOTIFICATION_ID = 1001

        const val ACTION_START = "com.example.rams.ACTION_START"
        const val ACTION_STOP = "com.example.rams.ACTION_STOP"
        const val EXTRA_CLASS_TYPE = "EXTRA_CLASS_TYPE"
        const val EXTRA_DURATION_SEC = "EXTRA_DURATION_SEC"

        // Shared observable state across service and UI
        private val _serviceState = MutableStateFlow(TelemetryLiveState())
        val serviceState: StateFlow<TelemetryLiveState> = _serviceState.asStateFlow()

        // Real-time ring buffer for live waveform canvas
        val liveRingBuffer = ConcurrentLinkedQueue<ImuSamplePoint>()
        private const val MAX_RING_SIZE = 120

        fun pushToRingBuffer(sample: ImuSamplePoint) {
            liveRingBuffer.add(sample)
            while (liveRingBuffer.size > MAX_RING_SIZE) {
                liveRingBuffer.poll()
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        gyroscope = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)

        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "RAMS:ImuStreamWakeLock")

        val db = AppDatabase.getInstance(applicationContext)
        repository = DatasetRepository(db)

        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: return START_NOT_STICKY

        when (action) {
            ACTION_START -> {
                val classTypeName = intent.getStringExtra(EXTRA_CLASS_TYPE) ?: ImuClassType.IMPACT.name
                activeClassType = try {
                    ImuClassType.valueOf(classTypeName)
                } catch (e: Exception) {
                    ImuClassType.IMPACT
                }
                targetDurationSec = intent.getIntExtra(EXTRA_DURATION_SEC, activeClassType.defaultDurationSec)
                startRecording()
            }
            ACTION_STOP -> {
                stopRecordingAndSave()
            }
        }

        return START_STICKY
    }

    private fun startRecording() {
        wakeLock?.acquire(30 * 60 * 1000L) // Max 30 mins safety timeout

        recordedSamples.clear()
        sessionStartTime = System.currentTimeMillis()
        peakSvmG = 1.0f
        peakGyro = 0f
        peakJerk = 0f
        lastNanos = 0L

        // Register sensors at fastest / game rate (~50-100Hz)
        accelerometer?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
        }
        gyroscope?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
        }

        val initialNotification = buildNotification("Initializing recorder...", "Preparing IMU sensors")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                initialNotification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            )
        } else {
            startForeground(NOTIFICATION_ID, initialNotification)
        }

        _serviceState.value = _serviceState.value.copy(
            status = RecordingStatus.RECORDING,
            activeClass = activeClassType,
            targetDurationSec = targetDurationSec,
            elapsedMs = 0L,
            recordedSampleCount = 0,
            isBackgroundServiceRunning = true,
            peakSvmG = 1.0f,
            peakGyroMag = 0f,
            peakJerk = 0f
        )

        tickerJob?.cancel()
        tickerJob = serviceScope.launch {
            while (isActive) {
                delay(200)
                val elapsed = System.currentTimeMillis() - sessionStartTime
                val sampleCount = synchronized(recordedSamples) { recordedSamples.size }
                val hz = if (elapsed > 1000) (sampleCount / (elapsed / 1000f)) else 50f

                _serviceState.value = _serviceState.value.copy(
                    elapsedMs = elapsed,
                    recordedSampleCount = sampleCount,
                    samplingRateHz = hz,
                    peakSvmG = peakSvmG,
                    peakGyroMag = peakGyro,
                    peakJerk = peakJerk
                )

                // Update notification text every second
                if (elapsed % 1000 < 250) {
                    val sec = elapsed / 1000
                    val mm = sec / 60
                    val ss = sec % 60
                    val timeStr = String.format("%02d:%02d", mm, ss)
                    val content = "Time: $timeStr | Samples: $sampleCount | Peak: ${String.format("%.2f", peakSvmG)}G"
                    val notif = buildNotification(
                        title = "RAMS: [${activeClassType.displayName}] Recording",
                        text = content
                    )
                    val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    nm.notify(NOTIFICATION_ID, notif)
                }

                // Check auto-stop if target duration reached and duration is non-zero
                if (targetDurationSec > 0 && elapsed >= targetDurationSec * 1000L) {
                    stopRecordingAndSave()
                    break
                }
            }
        }
    }

    private fun stopRecordingAndSave() {
        tickerJob?.cancel()
        sensorManager.unregisterListener(this)
        if (wakeLock?.isHeld == true) {
            wakeLock?.release()
        }

        _serviceState.value = _serviceState.value.copy(
            status = RecordingStatus.SAVING
        )

        serviceScope.launch {
            val samplesCopy: List<ImuSamplePoint>
            synchronized(recordedSamples) {
                samplesCopy = recordedSamples.toList()
            }

            val elapsed = System.currentTimeMillis() - sessionStartTime
            val hz = if (elapsed > 0) (samplesCopy.size / (elapsed / 1000f)) else 50f

            if (samplesCopy.isNotEmpty()) {
                repository.saveRecordedSession(
                    classType = activeClassType,
                    startTime = sessionStartTime,
                    durationMs = elapsed,
                    samples = samplesCopy,
                    samplingRateHz = hz,
                    notes = "Live recorded via IMU Foreground Service"
                )
            }

            _serviceState.value = _serviceState.value.copy(
                status = RecordingStatus.IDLE,
                isBackgroundServiceRunning = false,
                elapsedMs = elapsed,
                recordedSampleCount = samplesCopy.size
            )

            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return

        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                lastAx = event.values[0]
                lastAy = event.values[1]
                lastAz = event.values[2]
            }
            Sensor.TYPE_GYROSCOPE -> {
                lastGx = event.values[0]
                lastGy = event.values[1]
                lastGz = event.values[2]
            }
        }

        val nowNanos = event.timestamp
        val dtSec = if (lastNanos > 0L) {
            ((nowNanos - lastNanos) / 1_000_000_000.0f).coerceIn(0.005f, 0.1f)
        } else {
            0.02f
        }
        lastNanos = nowNanos

        val svm = sqrt(lastAx * lastAx + lastAy * lastAy + lastAz * lastAz)
        val svmG = svm / 9.80665f
        val gyroMag = sqrt(lastGx * lastGx + lastGy * lastGy + lastGz * lastGz)
        val jerk = abs(svm - lastSvm) / dtSec
        lastSvm = svm

        if (svmG > peakSvmG) peakSvmG = svmG
        if (gyroMag > peakGyro) peakGyro = gyroMag
        if (jerk > peakJerk) peakJerk = jerk

        val pitch = (atan2(-lastAx.toDouble(), sqrt((lastAy * lastAy + lastAz * lastAz).toDouble())) * 180.0 / PI).toFloat()
        val roll = (atan2(lastAy.toDouble(), lastAz.toDouble()) * 180.0 / PI).toFloat()

        val relMs = if (sessionStartTime > 0L) System.currentTimeMillis() - sessionStartTime else 0L

        val point = ImuSamplePoint(
            timestamp = System.currentTimeMillis(),
            relTimeMs = relMs,
            ax = lastAx,
            ay = lastAy,
            az = lastAz,
            gx = lastGx,
            gy = lastGy,
            gz = lastGz,
            svm = svm,
            svmG = svmG,
            gyroMag = gyroMag,
            jerk = jerk,
            pitch = pitch,
            roll = roll
        )

        pushToRingBuffer(point)

        if (_serviceState.value.status == RecordingStatus.RECORDING) {
            synchronized(recordedSamples) {
                recordedSamples.add(point)
            }
        }

        _serviceState.value = _serviceState.value.copy(
            currentSample = point
        )
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "RAMS IMU Sensor Stream",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Continuous IMU sensor telemetry recording in the background"
                setShowBadge(false)
            }
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(title: String, text: String): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pLaunch = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, ImuCollectorService::class.java).apply {
            action = ACTION_STOP
        }
        val pStop = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setOngoing(true)
            .setContentIntent(pLaunch)
            .addAction(R.mipmap.ic_launcher, "Stop & Save", pStop)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        sensorManager.unregisterListener(this)
        if (wakeLock?.isHeld == true) {
            wakeLock?.release()
        }
    }
}
