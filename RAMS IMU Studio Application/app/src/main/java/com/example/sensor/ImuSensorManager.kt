package com.example.sensor

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.example.model.ImuSamplePoint
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.ConcurrentLinkedQueue
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.sqrt

class ImuSensorManager(context: Context) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accelerometer: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val gyroscope: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)

    val hasAccelerometer: Boolean = accelerometer != null
    val hasGyroscope: Boolean = gyroscope != null
    val accelerometerName: String = accelerometer?.name ?: "Virtual/Emulator Accel"
    val gyroscopeName: String = gyroscope?.name ?: "Virtual/Emulator Gyro"

    // Latest sensor readings
    private var lastAx = 0f
    private var lastAy = 9.81f
    private var lastAz = 0f
    private var lastGx = 0f
    private var lastGy = 0f
    private var lastGz = 0f

    private var lastTimestampNanos = 0L
    private var lastSvm = 9.81f

    private val _latestSample = MutableStateFlow(
        ImuSamplePoint(
            timestamp = System.currentTimeMillis(),
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
        )
    )
    val latestSample: StateFlow<ImuSamplePoint> = _latestSample.asStateFlow()

    // Thread-safe ring buffer for real-time oscilloscope visualization
    val recentSamplesRingBuffer = ConcurrentLinkedQueue<ImuSamplePoint>()
    private val maxBufferSize = 120

    private var isListening = false
    var isSimulatedStream = false

    fun startListening(delayUs: Int = SensorManager.SENSOR_DELAY_GAME) {
        if (isListening) return
        isListening = true

        accelerometer?.let {
            sensorManager.registerListener(this, it, delayUs)
        }
        gyroscope?.let {
            sensorManager.registerListener(this, it, delayUs)
        }
    }

    fun stopListening() {
        if (!isListening) return
        isListening = false
        sensorManager.unregisterListener(this)
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
        val dtSec = if (lastTimestampNanos > 0L) {
            ((nowNanos - lastTimestampNanos) / 1_000_000_000.0f).coerceIn(0.005f, 0.1f)
        } else {
            0.02f
        }
        lastTimestampNanos = nowNanos

        val svm = sqrt(lastAx * lastAx + lastAy * lastAy + lastAz * lastAz)
        val svmG = svm / 9.80665f
        val gyroMag = sqrt(lastGx * lastGx + lastGy * lastGy + lastGz * lastGz)
        val jerk = abs(svm - lastSvm) / dtSec
        lastSvm = svm

        val pitch = (atan2(-lastAx.toDouble(), sqrt((lastAy * lastAy + lastAz * lastAz).toDouble())) * 180.0 / PI).toFloat()
        val roll = (atan2(lastAy.toDouble(), lastAz.toDouble()) * 180.0 / PI).toFloat()

        val sample = ImuSamplePoint(
            timestamp = System.currentTimeMillis(),
            relTimeMs = 0L, // Overwritten by active recorder session
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

        _latestSample.value = sample

        recentSamplesRingBuffer.add(sample)
        while (recentSamplesRingBuffer.size > maxBufferSize) {
            recentSamplesRingBuffer.poll()
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // No-op
    }

    /**
     * Injects a generated sample (used when physically testing in an emulator or test workbench)
     */
    fun injectSample(sample: ImuSamplePoint) {
        _latestSample.value = sample
        recentSamplesRingBuffer.add(sample)
        while (recentSamplesRingBuffer.size > maxBufferSize) {
            recentSamplesRingBuffer.poll()
        }
    }
}
