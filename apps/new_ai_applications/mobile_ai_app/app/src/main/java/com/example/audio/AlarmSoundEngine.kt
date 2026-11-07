package com.example.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.math.sin

/**
 * High-Urgency International SOS Emergency Distress Beacon Engine for RAMS.
 *
 * Synthesizes the authentic ITU-R Morse Code SOS pattern:
 *   · · ·   — — —   · · ·
 * (3 short bursts, 3 long bursts, 3 short bursts)
 *
 * Loops continuously across high-decibel audio (1000Hz piercing beacon)
 * and haptic vibration until explicitly canceled by:
 * 1. Physical hardware button on the wearable
 * 2. Hands-free voice command ("Hey RAMS, Stop" / "Cancel")
 * 3. In-app Cancel button
 */
class AlarmSoundEngine(private val context: Context) {

    companion object {
        private const val TAG = "RAMS_SOS_Beacon"
        private const val SAMPLE_RATE = 44100
        private const val SOS_FREQUENCY_HZ = 1050.0 // Pierces ambient traffic noise and helmet padding

        // Morse code SOS timing (milliseconds)
        private const val DOT_DURATION_MS = 140L
        private const val DASH_DURATION_MS = 420L
        private const val ELEMENT_GAP_MS = 100L
        private const val LETTER_GAP_MS = 220L
        private const val SEQUENCE_REPEAT_PAUSE_MS = 750L

        // Morse SOS vibration sequence: [delay, on, off, on, off, ...]
        val SOS_VIBRATION_PATTERN = longArrayOf(
            0,
            DOT_DURATION_MS, ELEMENT_GAP_MS,
            DOT_DURATION_MS, ELEMENT_GAP_MS,
            DOT_DURATION_MS, LETTER_GAP_MS,
            DASH_DURATION_MS, ELEMENT_GAP_MS,
            DASH_DURATION_MS, ELEMENT_GAP_MS,
            DASH_DURATION_MS, LETTER_GAP_MS,
            DOT_DURATION_MS, ELEMENT_GAP_MS,
            DOT_DURATION_MS, ELEMENT_GAP_MS,
            DOT_DURATION_MS, SEQUENCE_REPEAT_PAUSE_MS
        )
    }

    private var audioTrack: AudioTrack? = null
    private var toneGenerator: ToneGenerator? = null
    private var sosLoopJob: Job? = null
    @Volatile
    private var isAlarmActive = false

    private val vibrator: Vibrator? by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vm?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }

    /**
     * Pre-synthesizes a smooth 1050Hz sine pulse with raised-cosine anti-click envelope.
     */
    private fun generateSinePcm(durationMs: Long, freqHz: Double = SOS_FREQUENCY_HZ): ShortArray {
        val numSamples = ((SAMPLE_RATE * durationMs) / 1000).toInt()
        val buffer = ShortArray(numSamples)
        val rampSamples = (SAMPLE_RATE * 0.005).toInt().coerceAtLeast(1) // 5ms fade in/out to prevent speaker click

        for (i in 0 until numSamples) {
            var envelope = 1.0
            if (i < rampSamples) {
                envelope = (1.0 - Math.cos(Math.PI * i / rampSamples)) / 2.0
            } else if (i > numSamples - rampSamples) {
                envelope = (1.0 - Math.cos(Math.PI * (numSamples - i) / rampSamples)) / 2.0
            }
            val sample = sin(2.0 * Math.PI * i * freqHz / SAMPLE_RATE) * envelope
            buffer[i] = (sample * Short.MAX_VALUE * 0.95).toInt().toShort()
        }
        return buffer
    }

    /**
     * Starts continuous SOS beacon siren audio and vibration pattern.
     */
    fun startEmergencyAlarm(scope: CoroutineScope) {
        if (isAlarmActive) return
        isAlarmActive = true
        Log.i(TAG, "Starting continuous International SOS Distress Beacon (Morse code ··· ——— ···)")

        // 1. Start continuous Morse SOS vibration loop
        try {
            vibrator?.let { v ->
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val effect = VibrationEffect.createWaveform(SOS_VIBRATION_PATTERN, 0) // 0 = loop forever
                    v.vibrate(effect)
                } else {
                    @Suppress("DEPRECATION")
                    v.vibrate(SOS_VIBRATION_PATTERN, 0)
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Haptic vibration failed: ${e.message}")
        }

        // 2. Start high-priority procedural SOS audio loop
        sosLoopJob?.cancel()
        sosLoopJob = scope.launch(Dispatchers.IO) {
            try {
                // Initialize high-priority AudioTrack with USAGE_ALARM
                val minBufferSize = AudioTrack.getMinBufferSize(
                    SAMPLE_RATE,
                    AudioFormat.CHANNEL_OUT_MONO,
                    AudioFormat.ENCODING_PCM_16BIT
                ).coerceAtLeast(4096)

                val audioAttributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()

                val audioFormat = AudioFormat.Builder()
                    .setSampleRate(SAMPLE_RATE)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .build()

                audioTrack = AudioTrack(
                    audioAttributes,
                    audioFormat,
                    minBufferSize * 2,
                    AudioTrack.MODE_STREAM,
                    AudioManager.AUDIO_SESSION_ID_GENERATE
                ).apply { play() }

                val dotPcm = generateSinePcm(DOT_DURATION_MS)
                val dashPcm = generateSinePcm(DASH_DURATION_MS)

                while (isActive && isAlarmActive) {
                    // S: 3 Dots
                    for (i in 0 until 3) {
                        if (!isAlarmActive) break
                        audioTrack?.write(dotPcm, 0, dotPcm.size)
                        delay(DOT_DURATION_MS + ELEMENT_GAP_MS)
                    }
                    delay(LETTER_GAP_MS)

                    // O: 3 Dashes
                    for (i in 0 until 3) {
                        if (!isAlarmActive) break
                        audioTrack?.write(dashPcm, 0, dashPcm.size)
                        delay(DASH_DURATION_MS + ELEMENT_GAP_MS)
                    }
                    delay(LETTER_GAP_MS)

                    // S: 3 Dots
                    for (i in 0 until 3) {
                        if (!isAlarmActive) break
                        audioTrack?.write(dotPcm, 0, dotPcm.size)
                        delay(DOT_DURATION_MS + ELEMENT_GAP_MS)
                    }

                    // Sequence pause before repeating SOS
                    delay(SEQUENCE_REPEAT_PAUSE_MS)
                }
            } catch (e: Exception) {
                Log.w(TAG, "AudioTrack SOS failed, falling back to ToneGenerator: ${e.message}")
                fallbackToneGeneratorLoop()
            }
        }
    }

    private suspend fun fallbackToneGeneratorLoop() {
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_ALARM, 100)
            while (isAlarmActive) {
                // S
                repeat(3) {
                    if (!isAlarmActive) return
                    toneGenerator?.startTone(ToneGenerator.TONE_DTMF_0, DOT_DURATION_MS.toInt())
                    delay(DOT_DURATION_MS + ELEMENT_GAP_MS)
                }
                delay(LETTER_GAP_MS)

                // O
                repeat(3) {
                    if (!isAlarmActive) return
                    toneGenerator?.startTone(ToneGenerator.TONE_DTMF_0, DASH_DURATION_MS.toInt())
                    delay(DASH_DURATION_MS + ELEMENT_GAP_MS)
                }
                delay(LETTER_GAP_MS)

                // S
                repeat(3) {
                    if (!isAlarmActive) return
                    toneGenerator?.startTone(ToneGenerator.TONE_DTMF_0, DOT_DURATION_MS.toInt())
                    delay(DOT_DURATION_MS + ELEMENT_GAP_MS)
                }
                delay(SEQUENCE_REPEAT_PAUSE_MS)
            }
        } catch (te: Exception) {
            Log.e(TAG, "ToneGenerator fallback error: ${te.message}")
        }
    }

    /**
     * Immediately silences the SOS distress beacon, stops vibration, and releases audio resources.
     */
    fun stopEmergencyAlarm() {
        if (!isAlarmActive) return
        Log.i(TAG, "Stopping SOS distress beacon.")
        isAlarmActive = false

        sosLoopJob?.cancel()
        sosLoopJob = null

        try {
            audioTrack?.let { track ->
                track.pause()
                track.flush()
                track.stop()
                track.release()
            }
        } catch (_: Exception) {}
        audioTrack = null

        try {
            toneGenerator?.stopTone()
            toneGenerator?.release()
        } catch (_: Exception) {}
        toneGenerator = null

        try {
            vibrator?.cancel()
        } catch (_: Exception) {}
    }
}
