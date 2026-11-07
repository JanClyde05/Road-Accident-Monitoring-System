package com.example.ai

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import com.example.MainActivity
import org.json.JSONObject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.Locale
import java.util.UUID

import kotlinx.coroutines.withContext

/**
 * Conversational message model for Voice Chat with RAMS.
 */
data class VoiceChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val sender: String, // "USER" or "RAMS"
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Voice-Activated Safety Abort & Conversational AI Companion Engine for RAMS.
 *
 * State machine:
 *   DORMANT -> LISTENING_FOR_WAKE_WORD -> (hear "Hey RAMS") -> AWAITING_COMMAND
 *   -> HEARING_SPEECH -> COMMAND_SPOTTED (cancel) or CHATTING (query)
 *   -> back to LISTENING_FOR_WAKE_WORD
 *
 * Key design rules:
 *   - SpeechRecognizer runs on Main thread only, one instance at a time.
 *   - A restart guard prevents concurrent restart calls from racing.
 *   - TTS pauses the recognizer; it resumes after TTS finishes via UtteranceProgressListener.
 *   - RAMS only speaks when explicitly called or during alarm prompt. Never unprompted.
 *   - Cancel commands are checked FIRST regardless of stage ("rams stop" works globally).
 *   - The init{} does NOT auto-start the recognizer. Call startListeningForCancel() explicitly.
 */
class VoiceAlarmCanceler(
    private val context: Context,
    private val scope: CoroutineScope,
    private val getSystemContext: () -> RamsSystemContext = { RamsSystemContext() },
    private val onAlarmCancelledByVoice: (wakeWord: String, confidence: Float) -> Unit
) : TextToSpeech.OnInitListener {

    val assistantEngine = RamsAiAssistantEngine(context, getSystemContext)

    companion object {
        private const val TAG = "RAMS_Voice_AI"
        private const val SAMPLE_RATE_HZ = 16000
        private const val RESTART_DEBOUNCE_MS = 600L

        val WAKE_WORDS = listOf(
            "hey rams",
            "hi rams",
            "hey ram",
            "hi ram",
            "hello rams",
            "hello ram",
            "ok rams",
            "okay rams",
            "ok ram",
            "okay ram",
            "ay rams",
            "hay rams",
            "ey rams",
            "high rams",
            "yo rams",
            "hoy rams",
            "uy rams",
            "halo rams",
            "hey rems",
            "hey roms",
            "hey realms",
            "hey arms",
            "hi arms",
            "hey ran",
            "hi ran",
            "hey rims",
            "hi rims",
            "hey wrap",
            "hi wrap",
            "heyrams",
            "hirams",
            "hairams",
            "hairam",
            "ayrams",
            "airams",
            "hermes",
            "hyram",
            "hyrams",
            "rams ai",
            "rams assistant",
            "rams help",
            "rams"
        )

        private val WAKE_WORD_REGEX = Regex(
            "\\b(h[eaiy]+|hello|halo|ok|okay|yo|hoy|uy|high|ey|ay|ae)\\s*(rams|rhams|ram|rham|roms|rom|rems|rem|rums|rum|arms|arm|ran|runs|rims|rim|wraps|wrap|dance|rance|france)\\b",
            RegexOption.IGNORE_CASE
        )

        private val DIRECT_WAKE_REGEX = Regex(
            "\\b(rams|rhams|ramz|rhamz|raams|rahm|heyrams|hirams|hairams|hairam|airams|ayrams|hyrams|hermes)\\b",
            RegexOption.IGNORE_CASE
        )

        val CANCEL_COMMANDS = listOf(
            "cancel",
            "stop",
            "stop alarm",
            "cancel alarm",
            "stop the alarm",
            "cancel the alarm",
            "stop alert",
            "cancel alert",
            "stop the alert",
            "cancel the alert",
            "rams stop",
            "rams cancel",
            "rams stop the alarm",
            "rams cancel the alarm",
            "rams stop the alert",
            "rams cancel the alert",
            "rams stop alert",
            "dismiss",
            "abort",
            "false alarm",
            "i am ok",
            "im ok",
            "i'm ok",
            "i am safe",
            "im safe",
            "i'm safe",
            "i am fine",
            "im fine",
            "i'm fine",
            "quiet",
            "silence",
            "no alarm",
            "shut up",
            "turn off",
            "end alarm",
            "stop it",
            "cancel please",
            "stop please",
            "ok na",
            "okay na",
            "tama na",
            "tigil",
            "hinto",
            "para",
            "huwag",
            "ayoko",
            "patayin",
            "patayin ang alarm",
            // Homophones frequently transcribed for cancel/stop:
            "cancer",
            "counsel",
            "council",
            "cancle",
            "cancell",
            "cancelar",
            "kansel",
            "consol",
            "console",
            "stub",
            "step"
        )

        private val CANCEL_REGEX = Regex(
            "\\b(cancel|stop|cancer|counsel|council|cancle|cancell|kansel|consol|console|stub|step|quiet|silence|abort|dismiss|false\\s*alarm|im\\s*ok|i'?m\\s*ok|i\\s*am\\s*ok|im\\s*safe|i\\s*am\\s*safe|im\\s*fine|i\\s*am\\s*fine|tama\\s*na|tigil|hinto|para|patayin|shut\\s*up|turn\\s*off)\\b",
            RegexOption.IGNORE_CASE
        )
    }

    enum class VoiceEngineState {
        DORMANT,
        INITIALIZING,
        LISTENING,
        LISTENING_FOR_WAKE_WORD,
        AWAITING_COMMAND,
        HEARING_SPEECH,
        COMMAND_SPOTTED,
        CHATTING,
        ERROR
    }

    private val mainHandler = Handler(Looper.getMainLooper())

    private val _engineState = MutableStateFlow(VoiceEngineState.DORMANT)
    val engineState: StateFlow<VoiceEngineState> = _engineState.asStateFlow()

    private val _detectedPhraseFlow = MutableStateFlow<String?>(null)
    val detectedPhraseFlow: StateFlow<String?> = _detectedPhraseFlow.asStateFlow()

    private val _liveTranscriptFlow = MutableStateFlow("")
    val liveTranscriptFlow: StateFlow<String> = _liveTranscriptFlow.asStateFlow()

    private val _promptMessageFlow = MutableStateFlow("Listening for 'Hey RAMS'...")
    val promptMessageFlow: StateFlow<String> = _promptMessageFlow.asStateFlow()

    private val _audioLevelFlow = MutableStateFlow(0f)
    val audioLevelFlow: StateFlow<Float> = _audioLevelFlow.asStateFlow()

    private val _isBubbleVisible = MutableStateFlow(false)
    val isBubbleVisible: StateFlow<Boolean> = _isBubbleVisible.asStateFlow()

    private val _chatMessagesFlow = MutableStateFlow<List<VoiceChatMessage>>(emptyList())
    val chatMessagesFlow: StateFlow<List<VoiceChatMessage>> = _chatMessagesFlow.asStateFlow()

    private var speechRecognizer: SpeechRecognizer? = null
    private var audioRecordJob: Job? = null
    private var autoDismissJob: Job? = null
    private var pendingQueryJob: Job? = null
    private var isAwaitingCommandStage = false
    private var textToSpeech: TextToSpeech? = null
    private var isTtsReady = false
    private var isAlarmActiveContext = false

    // Restart guard: prevents concurrent SpeechRecognizer restarts from racing
    private var isRestarting = false
    private var lastRestartTimestamp = 0L

    // TTS speaking guard: when true, recognizer is paused so mic doesn't hear TTS playback
    private var isTtsSpeaking = false

    // Watchdog to prevent TTS stuck state from permanently blocking speech recognition
    private val ttsWatchdog = Runnable {
        if (isTtsSpeaking) {
            Log.w(TAG, "TTS watchdog fired! Auto-clearing isTtsSpeaking and resuming microphone.")
            isTtsSpeaking = false
            scheduleRestart(200L)
        }
    }

    // Dynamic voice pattern dataset loaded from voice_wake_patterns.json
    private val dynamicWakeWords = mutableSetOf<String>()
    private val dynamicCancelWords = mutableSetOf<String>()
    private var consecutiveErrorCount = 0

    init {
        loadVoicePatternsFromAssets()
        // Only initialize TTS engine. Do NOT auto-start SpeechRecognizer here.
        // The ViewModel or activity must explicitly call startListeningForCancel().
        try {
            textToSpeech = TextToSpeech(context.applicationContext, this)
        } catch (e: Exception) {
            Log.w(TAG, "TTS Init exception: ${e.message}")
        }
        Log.i(TAG, "VoiceAlarmCanceler initialized. Awaiting explicit start call.")
    }

    private fun loadVoicePatternsFromAssets() {
        try {
            val jsonStr = context.assets.open("voice_wake_patterns.json").bufferedReader().use { it.readText() }
            val root = JSONObject(jsonStr)
            val ds = root.optJSONObject("voice_training_dataset")
            if (ds != null) {
                val prefixes = ds.optJSONArray("wake_prefixes")
                val homophones = ds.optJSONArray("rams_phonetic_homophones")
                val slurs = ds.optJSONArray("slurred_contractions")
                val cancels = ds.optJSONArray("cancel_commands")

                if (slurs != null) {
                    for (i in 0 until slurs.length()) {
                        dynamicWakeWords.add(slurs.getString(i).lowercase(Locale.US))
                    }
                }
                if (prefixes != null && homophones != null) {
                    for (i in 0 until prefixes.length()) {
                        val p = prefixes.getString(i).lowercase(Locale.US)
                        for (j in 0 until homophones.length()) {
                            val h = homophones.getString(j).lowercase(Locale.US)
                            dynamicWakeWords.add("$p $h")
                            dynamicWakeWords.add("$p$h")
                        }
                    }
                }
                val regional = ds.optJSONObject("regional_accent_variations")
                if (regional != null) {
                    val keys = regional.keys()
                    while (keys.hasNext()) {
                        val arr = regional.optJSONArray(keys.next())
                        if (arr != null) {
                            for (i in 0 until arr.length()) {
                                dynamicWakeWords.add(arr.getString(i).lowercase(Locale.US))
                            }
                        }
                    }
                }
                if (cancels != null) {
                    for (i in 0 until cancels.length()) {
                        dynamicCancelWords.add(cancels.getString(i).lowercase(Locale.US))
                    }
                }
                Log.i(TAG, "Loaded training dataset: ${dynamicWakeWords.size} wake combinations, ${dynamicCancelWords.size} cancel variations.")
            }
        } catch (e: Exception) {
            Log.w(TAG, "Could not load voice_wake_patterns.json: ${e.message}")
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            textToSpeech?.language = Locale.US
            isTtsReady = true
            // Register utterance listener so we know when TTS finishes
            textToSpeech?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    isTtsSpeaking = true
                }
                override fun onDone(utteranceId: String?) {
                    isTtsSpeaking = false
                    mainHandler.removeCallbacks(ttsWatchdog)
                    // Resume listening after TTS finishes
                    mainHandler.postDelayed({
                        if (_engineState.value != VoiceEngineState.DORMANT &&
                            _engineState.value != VoiceEngineState.COMMAND_SPOTTED) {
                            scheduleRestart()
                        }
                    }, 300)
                }
                @Deprecated("Deprecated in Java")
                override fun onError(utteranceId: String?) {
                    isTtsSpeaking = false
                    mainHandler.removeCallbacks(ttsWatchdog)
                    mainHandler.postDelayed({
                        if (_engineState.value != VoiceEngineState.DORMANT &&
                            _engineState.value != VoiceEngineState.COMMAND_SPOTTED) {
                            scheduleRestart()
                        }
                    }, 300)
                }
            })
            Log.i(TAG, "TTS engine ready.")
        }
    }

    fun setAlarmActiveState(active: Boolean) {
        isAlarmActiveContext = active
    }

    /**
     * Speaks response aloud. Pauses recognizer first to avoid mic feedback loop.
     * Recognizer resumes automatically via UtteranceProgressListener.onDone().
     */
    fun speak(text: String) {
        if (!isTtsReady || textToSpeech == null) return
        try {
            // Pause recognizer so mic doesn't pick up TTS audio
            isTtsSpeaking = true
            mainHandler.removeCallbacks(ttsWatchdog)
            mainHandler.postDelayed(ttsWatchdog, 3500L)
            mainHandler.post {
                try {
                    speechRecognizer?.stopListening()
                } catch (_: Throwable) {}
            }
            textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "rams_tts_${System.currentTimeMillis()}")
        } catch (e: Exception) {
            Log.w(TAG, "TTS speak failed: ${e.message}")
            isTtsSpeaking = false
            mainHandler.removeCallbacks(ttsWatchdog)
        }
    }

    /**
     * Starts continuous voice recognition.
     * Called explicitly by ViewModel after permissions are granted.
     */
    @SuppressLint("MissingPermission")
    fun startListeningForCancel(promptDirectly: Boolean = false) {
        _detectedPhraseFlow.value = null

        if (promptDirectly) {
            _isBubbleVisible.value = true
            isAwaitingCommandStage = true
            _engineState.value = VoiceEngineState.AWAITING_COMMAND
            if (isAlarmActiveContext) {
                _promptMessageFlow.value = "CRASH ALARM ACTIVE"
                _liveTranscriptFlow.value = "Say 'Cancel', 'Stop', or 'I am OK' to abort"
                // Do NOT speak TTS which pauses the microphone during alarm! Arm mic immediately!
                scheduleRestart(50L)
            } else {
                _promptMessageFlow.value = "What would you like to do next?"
                _liveTranscriptFlow.value = "Say 'Cancel', 'Stop', or ask RAMS anything"
                speak("What would you like to do next?")
            }
        } else {
            isAwaitingCommandStage = false
            _engineState.value = VoiceEngineState.LISTENING_FOR_WAKE_WORD
            _promptMessageFlow.value = "Listening for 'Hey RAMS'..."
            _liveTranscriptFlow.value = "Say 'Hey RAMS' or 'Hi RAMS'"
            // Start recognizer immediately (no TTS to wait for)
            scheduleRestart()
        }

        startRmsPulsingJob()
        Log.i(TAG, "startListeningForCancel(promptDirectly=$promptDirectly)")
    }

    var onDismissBubbleListener: (() -> Unit)? = null
    var onSpeechDetectedListener: ((Boolean) -> Unit)? = null

    /**
     * Called when user says "Hey RAMS" or taps the mic button.
     * Brings the assistant overlay to the foreground over whatever app the user is using.
     */
    fun triggerWakeWordAwaitingCommand() {
        openBubbleUi()

        // Bring RAMS overlay to foreground over Facebook or other active apps
        try {
            val intent = Intent(context, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
                addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                putExtra("OPEN_VOICE_BUBBLE", true)
                putExtra("SUMMONED_FROM_BACKGROUND", true)
            }
            context.startActivity(intent)
            Log.i(TAG, "Summoned RAMS Assistant Bubble over foreground application.")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to launch overlay activity: ${e.message}")
        }
    }

    /**
     * Opens the Assistant bubble UI directly in Compose state without intent loops.
     */
    fun openBubbleUi() {
        if (_engineState.value == VoiceEngineState.COMMAND_SPOTTED) return
        if (_engineState.value == VoiceEngineState.AWAITING_COMMAND && _isBubbleVisible.value) return

        _isBubbleVisible.value = true
        isAwaitingCommandStage = true
        _engineState.value = VoiceEngineState.AWAITING_COMMAND
        _promptMessageFlow.value = "Hi, how can I help you?"
        _liveTranscriptFlow.value = "Say 'Cancel', 'Stop', or ask RAMS anything"
        Log.i(TAG, "Assistant bubble activated -> AWAITING_COMMAND.")

        // Do NOT destroy if already active and listening!
        if (speechRecognizer == null) {
            scheduleRestart(100L)
        }
    }

    private val restartRunnable = Runnable {
        isRestarting = false
        restartSpeechRecognizer()
    }

    private fun normalizeText(text: String): String {
        return text.lowercase(Locale.US)
            .replace(Regex("[^a-z0-9\\s]"), " ")
            .replace(Regex("\\s+"), " ")
            .trim()
    }

    /**
     * Central debounced restart. Prevents concurrent SpeechRecognizer restarts while guaranteeing no restart is dropped.
     */
    fun scheduleRestart(delayMs: Long = 250L) {
        if (isTtsSpeaking) {
            Log.d(TAG, "scheduleRestart: postponed (TTS is currently speaking)")
            return
        }
        if (_engineState.value == VoiceEngineState.DORMANT ||
            _engineState.value == VoiceEngineState.COMMAND_SPOTTED) {
            Log.d(TAG, "scheduleRestart: skipped (state=${_engineState.value})")
            return
        }

        mainHandler.removeCallbacks(restartRunnable)
        val now = System.currentTimeMillis()
        val timeSinceLast = now - lastRestartTimestamp
        val actualDelay = if (timeSinceLast < RESTART_DEBOUNCE_MS) {
            (RESTART_DEBOUNCE_MS - timeSinceLast).coerceAtLeast(delayMs)
        } else {
            delayMs
        }
        mainHandler.postDelayed(restartRunnable, actualDelay)
    }

    private fun restartSpeechRecognizer() {
        mainHandler.post {
            if (_engineState.value == VoiceEngineState.DORMANT ||
                _engineState.value == VoiceEngineState.COMMAND_SPOTTED ||
                isTtsSpeaking) {
                return@post
            }

            lastRestartTimestamp = System.currentTimeMillis()

            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.US.toLanguageTag())
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, Locale.US.toLanguageTag())
                putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, Locale.US.toLanguageTag())
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
                putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
                putExtra("android.speech.extra.PREFER_OFFLINE", true)
                putExtra("android.speech.extras.SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS", 1500L)
                putExtra("android.speech.extras.SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS", 1000L)
                putExtra("android.speech.extras.SPEECH_INPUT_MINIMUM_LENGTH_MILLIS", 400L)
            }

            // Reuse active instance cleanly without tearing down IPC connection
            val existing = speechRecognizer
            if (existing != null) {
                try {
                    existing.stopListening()
                    existing.startListening(intent)
                    Log.d(TAG, "SpeechRecognizer: startListening resumed cleanly (state=${_engineState.value})")
                    return@post
                } catch (t: Throwable) {
                    Log.w(TAG, "Existing recognizer restart failed, recreating fresh: ${t.message}")
                    try {
                        existing.cancel()
                        existing.destroy()
                    } catch (_: Throwable) {}
                    speechRecognizer = null
                }
            }

            try {
                // Use applicationContext to avoid Activity context leaks
                val recognizer = SpeechRecognizer.createSpeechRecognizer(context.applicationContext)
                speechRecognizer = recognizer
                recognizer.setRecognitionListener(createRecognitionListener())
                recognizer.startListening(intent)
                Log.d(TAG, "SpeechRecognizer started listening (state=${_engineState.value})")
            } catch (t: Throwable) {
                Log.e(TAG, "Failed to start SpeechRecognizer", t)
                mainHandler.postDelayed({
                    if (_engineState.value != VoiceEngineState.DORMANT &&
                        _engineState.value != VoiceEngineState.COMMAND_SPOTTED &&
                        !isTtsSpeaking) {
                        scheduleRestart(800L)
                    }
                }, 800L)
            }
        }
    }

    private fun createRecognitionListener(): RecognitionListener {
        return object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                isRestarting = false
                consecutiveErrorCount = 0
                if (!isAwaitingCommandStage) {
                    _engineState.value = VoiceEngineState.LISTENING_FOR_WAKE_WORD
                } else {
                    _engineState.value = VoiceEngineState.AWAITING_COMMAND
                }
            }

            override fun onBeginningOfSpeech() {
                _engineState.value = VoiceEngineState.HEARING_SPEECH
                pendingQueryJob?.cancel()
                pendingQueryJob = null
                onSpeechDetectedListener?.invoke(true)
            }

            override fun onRmsChanged(rmsdB: Float) {
                val normalized = ((rmsdB + 2f) / 12f).coerceIn(0.05f, 1.0f)
                _audioLevelFlow.value = normalized
                if ((isAlarmActiveContext || getSystemContext().isAlarmActive) && normalized > 0.45f) {
                    onSpeechDetectedListener?.invoke(true)
                }
            }

            override fun onBufferReceived(buffer: ByteArray?) {}

            override fun onEndOfSpeech() {
                if (_engineState.value == VoiceEngineState.HEARING_SPEECH) {
                    _liveTranscriptFlow.value = "Analyzing..."
                }
                onSpeechDetectedListener?.invoke(false)
            }

            override fun onError(error: Int) {
                onSpeechDetectedListener?.invoke(false)
                consecutiveErrorCount++
                val errMsg = when (error) {
                    SpeechRecognizer.ERROR_AUDIO -> "ERROR_AUDIO(3)"
                    SpeechRecognizer.ERROR_CLIENT -> "ERROR_CLIENT(5)"
                    SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "ERROR_INSUFFICIENT_PERMISSIONS(9)"
                    SpeechRecognizer.ERROR_NETWORK -> "ERROR_NETWORK(2)"
                    SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "ERROR_NETWORK_TIMEOUT(1)"
                    SpeechRecognizer.ERROR_NO_MATCH -> "ERROR_NO_MATCH(7)"
                    SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "ERROR_RECOGNIZER_BUSY(8)"
                    SpeechRecognizer.ERROR_SERVER -> "ERROR_SERVER(4)"
                    SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "ERROR_SPEECH_TIMEOUT(6)"
                    11 -> "ERROR_SERVER_DISCONNECTED(11)"
                    12 -> "ERROR_LANGUAGE_NOT_SUPPORTED(12)"
                    13 -> "ERROR_LANGUAGE_UNAVAILABLE(13)"
                    14 -> "ERROR_CANNOT_CHECK_SUPPORT(14)"
                    else -> "ERROR_CODE($error)"
                }
                Log.d(TAG, "SpeechRecognizer onError: $errMsg (state=${_engineState.value}, consecutive=$consecutiveErrorCount)")

                if (consecutiveErrorCount >= 3 || error == SpeechRecognizer.ERROR_CLIENT || error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY || error == 11) {
                    try {
                        speechRecognizer?.cancel()
                        speechRecognizer?.destroy()
                    } catch (_: Throwable) {}
                    speechRecognizer = null
                    consecutiveErrorCount = 0
                } else {
                    try {
                        speechRecognizer?.stopListening()
                    } catch (_: Throwable) {}
                }

                val shouldRestart = _engineState.value == VoiceEngineState.LISTENING_FOR_WAKE_WORD ||
                    _engineState.value == VoiceEngineState.AWAITING_COMMAND ||
                    _engineState.value == VoiceEngineState.HEARING_SPEECH

                if (shouldRestart && !isTtsSpeaking) {
                    val delay = when (error) {
                        SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> 650L
                        SpeechRecognizer.ERROR_CLIENT -> 600L
                        SpeechRecognizer.ERROR_NO_MATCH, SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> 250L
                        SpeechRecognizer.ERROR_NETWORK, SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> 450L
                        else -> 400L
                    }
                    scheduleRestart(delay)
                }
            }

            override fun onResults(results: Bundle?) {
                onSpeechDetectedListener?.invoke(false)
                consecutiveErrorCount = 0
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                checkMatchesForTrigger(matches, isPartial = false)

                val shouldRestart = _engineState.value == VoiceEngineState.LISTENING_FOR_WAKE_WORD ||
                    _engineState.value == VoiceEngineState.AWAITING_COMMAND

                if (shouldRestart && !isTtsSpeaking) {
                    scheduleRestart(250L)
                }
            }

            override fun onPartialResults(partialResults: Bundle?) {
                pendingQueryJob?.cancel()
                pendingQueryJob = null
                consecutiveErrorCount = 0

                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    _liveTranscriptFlow.value = matches[0]
                    checkMatchesForTrigger(matches, isPartial = true)
                }
            }

            override fun onEvent(eventType: Int, params: Bundle?) {}
        }
    }

    private fun levenshteinDistance(s1: String, s2: String): Int {
        val dp = Array(s1.length + 1) { IntArray(s2.length + 1) }
        for (i in 0..s1.length) dp[i][0] = i
        for (j in 0..s2.length) dp[0][j] = j
        for (i in 1..s1.length) {
            for (j in 1..s2.length) {
                val cost = if (s1[i - 1] == s2[j - 1]) 0 else 1
                dp[i][j] = minOf(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + cost
                )
            }
        }
        return dp[s1.length][s2.length]
    }

    private fun checkFuzzyWakeWord(text: String): Boolean {
        val tokens = text.split(" ").filter { it.isNotBlank() }
        for (i in tokens.indices) {
            val t1 = tokens[i]
            if (t1 == "rams" || t1 == "ram" || t1 == "rhams" || t1 == "rham" ||
                t1 == "roms" || t1 == "rems" || t1 == "rums" || t1 == "arms" ||
                t1 == "ran" || t1 == "rims" || t1 == "wrams" || t1 == "hermes" ||
                t1 == "hyram" || t1 == "hyrams" || t1 == "airam" || t1 == "airams" ||
                t1 == "heyrams" || t1 == "hirams") {
                return true
            }
            if (levenshteinDistance(t1, "rams") <= 1) return true

            if (i + 1 < tokens.size) {
                val pair = "$t1 ${tokens[i + 1]}"
                if (levenshteinDistance(pair, "hey rams") <= 2 ||
                    levenshteinDistance(pair, "hi rams") <= 2 ||
                    levenshteinDistance(pair, "ok rams") <= 1 ||
                    levenshteinDistance(pair, "yo rams") <= 1 ||
                    levenshteinDistance(pair, "hoy rams") <= 1 ||
                    levenshteinDistance(pair, "ay rams") <= 1 ||
                    levenshteinDistance(pair, "ey rams") <= 1) {
                    return true
                }
            }
        }
        return false
    }

    /**
     * Match priority:
     *   1. CANCEL COMMANDS -- checked FIRST (immediate safety abort even on partial results!)
     *   2. WAKE WORDS -- only if not already in AWAITING_COMMAND stage
     *   3. CONVERSATIONAL QUERY -- ONLY on final results with silence debounce so rider is never cut off!
     */
    private fun checkMatchesForTrigger(matches: List<String>?, isPartial: Boolean) {
        if (matches.isNullOrEmpty()) return

        val isAlarmActiveNow = isAlarmActiveContext || getSystemContext().isAlarmActive

        for (phrase in matches) {
            val normalized = normalizeText(phrase)
            if (normalized.isBlank()) continue

            // 1. CANCEL COMMANDS -- always checked first, even on partial results! Instant safety abort!
            val isCancelWord = CANCEL_COMMANDS.any { cmd -> normalized.contains(cmd) } ||
                dynamicCancelWords.any { cmd -> normalized.contains(cmd) } ||
                CANCEL_REGEX.containsMatchIn(normalized)

            if (isCancelWord) {
                pendingQueryJob?.cancel()
                pendingQueryJob = null

                // If bubble is open (awaiting command) or alarm is actively counting down, cancel immediately!
                if (isAwaitingCommandStage || isAlarmActiveNow) {
                    Log.i(TAG, "Immediate cancel command in active/awaiting stage: '$phrase'")
                    handleSpottedCancelCommand(phrase.uppercase(Locale.US), 0.99f)
                    return
                }
                // If idle background, require "rams" prefix or specific alert phrases
                if (normalized.contains("rams") || normalized.contains("ram") ||
                    normalized.contains("stop alarm") || normalized.contains("cancel alarm") ||
                    normalized.contains("stop alert") || normalized.contains("cancel alert") ||
                    CANCEL_REGEX.containsMatchIn(normalized)) {
                    Log.i(TAG, "Global cancel command detected: '$phrase'")
                    handleSpottedCancelCommand(phrase.uppercase(Locale.US), 0.99f)
                    return
                }
            }

            // 2. WAKE WORDS -- only check if not already awaiting command
            if (!isAwaitingCommandStage) {
                val matchesWakeList = WAKE_WORDS.any { wake -> normalized.contains(wake) } ||
                    dynamicWakeWords.any { wake -> normalized.contains(wake) }
                val matchesWakeRegex = WAKE_WORD_REGEX.containsMatchIn(normalized)
                val matchesDirectWake = DIRECT_WAKE_REGEX.containsMatchIn(normalized)
                val matchesFuzzy = checkFuzzyWakeWord(normalized)

                if (matchesWakeList || matchesWakeRegex || matchesDirectWake || matchesFuzzy) {
                    Log.i(TAG, "Wake word matched ('$phrase' -> '$normalized', fuzzy=$matchesFuzzy)")
                    triggerWakeWordAwaitingCommand()
                    return
                }
            }

            // 3. CONVERSATIONAL QUERY -- NEVER trigger on partial results!
            // Wait for final sentence and give rider 1500ms of comfortable silence so questions are never cut short!
            if (!isPartial && isAwaitingCommandStage && normalized.length > 2) {
                pendingQueryJob?.cancel()
                pendingQueryJob = scope.launch(Dispatchers.Main) {
                    _liveTranscriptFlow.value = "\"$phrase\""
                    _promptMessageFlow.value = "Listening..."
                    delay(1500)
                    handleConversationalQuery(phrase)
                }
                return
            }
        }
    }

    /**
     * Handles dynamic conversational dialogue with RAMS.
     * Queries live telemetry, in-app feature guidance, and online assistant knowledge when connected to the internet.
     */
    private fun handleConversationalQuery(userQuery: String) {
        val userMsg = VoiceChatMessage(sender = "USER", text = userQuery)
        val currentList = _chatMessagesFlow.value.toMutableList().apply { add(userMsg) }
        _chatMessagesFlow.value = currentList
        _promptMessageFlow.value = "Thinking..."
        _liveTranscriptFlow.value = "\"$userQuery\""
        _engineState.value = VoiceEngineState.CHATTING

        scope.launch(Dispatchers.IO) {
            val reply = assistantEngine.generateAssistantResponse(userQuery)
            withContext(Dispatchers.Main) {
                val aiMsg = VoiceChatMessage(sender = "RAMS", text = reply)
                _chatMessagesFlow.value = _chatMessagesFlow.value + aiMsg
                _promptMessageFlow.value = reply
                _liveTranscriptFlow.value = "RAMS: $reply"
                speak(reply)
            }
        }
    }

    private fun handleSpottedCancelCommand(phrase: String, confidence: Float) {
        if (_engineState.value == VoiceEngineState.COMMAND_SPOTTED) return

        _engineState.value = VoiceEngineState.COMMAND_SPOTTED
        _detectedPhraseFlow.value = phrase
        _promptMessageFlow.value = "ALARM CANCELLED HANDS-FREE"
        _liveTranscriptFlow.value = "Command: \"$phrase\""
        Log.i(TAG, "CANCEL COMMAND SPOTTED: '$phrase' (Confidence: $confidence)")

        onSpeechDetectedListener?.invoke(false)

        // Stop recognizer cleanly without thrashing binder
        mainHandler.post {
            try {
                speechRecognizer?.cancel()
                speechRecognizer?.stopListening()
            } catch (_: Exception) {}
        }

        speak("Emergency alarm cancelled. All systems nominal.")

        scope.launch(Dispatchers.Main) {
            onAlarmCancelledByVoice(phrase, confidence)
        }

        // Auto dismiss bubble after 2.5 seconds, then return cleanly to background wake-word listening
        autoDismissJob?.cancel()
        autoDismissJob = scope.launch(Dispatchers.Default) {
            delay(2500)
            dismissBubble()
        }
    }

    private fun startAcousticAudioFallback() {
        isRestarting = false
        audioRecordJob?.cancel()
        audioRecordJob = scope.launch(Dispatchers.IO) {
            val minBuf = AudioRecord.getMinBufferSize(SAMPLE_RATE_HZ, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
            val buf = ShortArray(kotlin.math.max(minBuf, 2048))

            try {
                @SuppressLint("MissingPermission")
                val record = AudioRecord(MediaRecorder.AudioSource.MIC, SAMPLE_RATE_HZ, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, buf.size * 2)
                record.startRecording()

                while (isActive) {
                    val read = record.read(buf, 0, buf.size)
                    if (read > 0) {
                        var sum = 0.0
                        for (i in 0 until read) {
                            val s = buf[i] / 32768.0
                            sum += s * s
                        }
                        val rms = kotlin.math.sqrt(sum / read).toFloat()
                        _audioLevelFlow.value = (rms * 10f).coerceIn(0.05f, 1.0f)
                    }
                    delay(50)
                }

                record.stop()
                record.release()
            } catch (e: Exception) {
                Log.e(TAG, "Acoustic fallback error", e)
            }
        }
    }

    private fun startRmsPulsingJob() {
        scope.launch(Dispatchers.Default) {
            while (isActive) {
                if (_isBubbleVisible.value && _audioLevelFlow.value < 0.1f) {
                    _audioLevelFlow.value = 0.15f + (kotlin.math.sin(System.currentTimeMillis() / 200.0).toFloat() * 0.08f)
                }
                delay(80)
            }
        }
    }

    fun injectSimulatedVoiceCommand(phrase: String = "RAMS STOP") {
        _isBubbleVisible.value = true
        _engineState.value = VoiceEngineState.HEARING_SPEECH
        _promptMessageFlow.value = "Heard: \"$phrase\""
        _liveTranscriptFlow.value = "Processing: \"$phrase\"..."

        scope.launch(Dispatchers.Default) {
            delay(400)
            handleSpottedCancelCommand(phrase, 0.98f)
        }
    }

    /**
     * Dismisses the bubble and returns to background wake-word listening.
     * Does NOT immediately restart recognizer to avoid re-trigger glitch.
     * Uses a debounce delay before resuming background listener.
     */
    fun dismissBubble() {
        pendingQueryJob?.cancel()
        pendingQueryJob = null
        _isBubbleVisible.value = false
        isAwaitingCommandStage = false
        _promptMessageFlow.value = "Listening for 'Hey RAMS'..."
        _chatMessagesFlow.value = emptyList()

        // Stop any active TTS
        try {
            textToSpeech?.stop()
        } catch (_: Exception) {}
        isTtsSpeaking = false

        onDismissBubbleListener?.invoke()

        // Transition to wake-word listening after a debounce
        // This prevents the recognizer from immediately picking up ambient sound as a wake word
        _engineState.value = VoiceEngineState.LISTENING_FOR_WAKE_WORD
        mainHandler.postDelayed({
            if (_engineState.value == VoiceEngineState.LISTENING_FOR_WAKE_WORD) {
                scheduleRestart()
            }
        }, 800)
        Log.i(TAG, "Bubble dismissed. Will resume wake-word listening after debounce.")
    }

    fun stopListening() {
        audioRecordJob?.cancel()
        audioRecordJob = null
        try {
            textToSpeech?.stop()
        } catch (_: Exception) {}
        isTtsSpeaking = false
        mainHandler.post {
            try {
                speechRecognizer?.stopListening()
                speechRecognizer?.destroy()
                speechRecognizer = null
            } catch (_: Exception) {}
        }
        _engineState.value = VoiceEngineState.DORMANT
        Log.i(TAG, "stopListening: All voice resources released.")
    }

    fun resetVoiceState() {
        _engineState.value = VoiceEngineState.LISTENING_FOR_WAKE_WORD
        _detectedPhraseFlow.value = null
        _liveTranscriptFlow.value = ""
        _promptMessageFlow.value = "Listening for 'Hey RAMS'..."
        _audioLevelFlow.value = 0f
        _isBubbleVisible.value = false
        isAwaitingCommandStage = false
        _chatMessagesFlow.value = emptyList()
    }
}
