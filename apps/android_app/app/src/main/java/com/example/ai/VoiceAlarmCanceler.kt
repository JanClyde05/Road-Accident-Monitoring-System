package com.example.ai

import android.annotation.SuppressLint
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.MediaRecorder
import android.media.ToneGenerator
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognitionService
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.tts.Voice
import android.util.Log
import com.example.MainActivity
import com.example.ui.overlay.RamsOverlayManager
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
    @Volatile
    private var isRecognitionActive = false
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
    private var useFallbackLanguage = false

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
            configureNaturalVoice(currentVoicePreference)
            isTtsReady = true
            // Register utterance listener so we know when TTS finishes
            textToSpeech?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    isTtsSpeaking = true
                }
                override fun onDone(utteranceId: String?) {
                    isTtsSpeaking = false
                    mainHandler.removeCallbacks(ttsWatchdog)
                    // Resume listening after TTS finishes so follow-up commands are heard
                    mainHandler.postDelayed({
                        if (_engineState.value != VoiceEngineState.DORMANT &&
                            _engineState.value != VoiceEngineState.COMMAND_SPOTTED) {
                            if (isAwaitingCommandStage) {
                                _engineState.value = VoiceEngineState.AWAITING_COMMAND
                                _liveTranscriptFlow.value = "Listening for follow-up..."
                                scheduleAutoDismiss(8500L)
                            }
                            scheduleRestart(200L)
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
                            if (isAwaitingCommandStage) {
                                _engineState.value = VoiceEngineState.AWAITING_COMMAND
                            }
                            scheduleRestart(200L)
                        }
                    }, 300)
                }
            })
            Log.i(TAG, "TTS engine ready.")
        }
    }

    var currentVoicePreference: String = "NATURAL_FEMALE"

    fun configureNaturalVoice(preference: String = currentVoicePreference) {
        currentVoicePreference = preference
        val tts = textToSpeech ?: return
        try {
            val available = tts.voices
            if (!available.isNullOrEmpty()) {
                val nonRoboticVoices = available.filter { !it.name.lowercase(Locale.US).contains("seanet") }
                val offlinePool = nonRoboticVoices.filter { !it.isNetworkConnectionRequired }
                val candidatePool = if (offlinePool.isNotEmpty()) offlinePool else nonRoboticVoices

                val bestVoice = when (preference) {
                    "JAPANESE" -> {
                        candidatePool.firstOrNull { v ->
                            val n = v.name.lowercase(Locale.US)
                            (v.locale.language.equals("ja", ignoreCase = true) || n.contains("ja-jp") || n.contains("ja_jp") || n.startsWith("ja-") || n.startsWith("ja_")) && !v.isNetworkConnectionRequired && !n.contains("seanet")
                        } ?: candidatePool.firstOrNull { v ->
                            v.locale.language == "ja" || v.locale == Locale.JAPAN || v.locale == Locale.JAPANESE
                        } ?: candidatePool.firstOrNull { v ->
                            v.locale.language == "en" && !v.isNetworkConnectionRequired
                        }
                    }
                    "PHILIPPINE" -> {
                        candidatePool.firstOrNull { v ->
                            val n = v.name.lowercase(Locale.US)
                            (v.locale.country.equals("PH", ignoreCase = true) || v.locale.language.equals("fil", ignoreCase = true) || v.locale.language.equals("tl", ignoreCase = true) || n.contains("fil-ph") || n.contains("tl-ph") || n.startsWith("fil-") || n.startsWith("fil_")) &&
                            !v.isNetworkConnectionRequired && !n.contains("seanet")
                        } ?: candidatePool.firstOrNull { v ->
                            v.locale.country.equals("PH", ignoreCase = true) || v.locale.language.equals("fil", ignoreCase = true) || v.locale.language.equals("tl", ignoreCase = true)
                        } ?: candidatePool.firstOrNull { v ->
                            v.locale.language == "en" && !v.isNetworkConnectionRequired
                        }
                    }
                    "CRISP_MALE" -> {
                        candidatePool.firstOrNull { v ->
                            val n = v.name.lowercase(Locale.US)
                            (n.contains("male") || n.contains("iol") || n.contains("iob") || n.contains("guy")) &&
                            !n.contains("female") && !n.contains("sfg") && !v.isNetworkConnectionRequired
                        } ?: candidatePool.firstOrNull { v ->
                            val n = v.name.lowercase(Locale.US)
                            (n.contains("male") || n.contains("iol") || n.contains("iob")) && !n.contains("female")
                        } ?: candidatePool.firstOrNull { v ->
                            v.locale.language == "en" && !v.isNetworkConnectionRequired
                        }
                    }
                    else -> { // NATURAL_FEMALE (Default warm assistant)
                        candidatePool.firstOrNull { v ->
                            val n = v.name.lowercase(Locale.US)
                            (n.contains("locomel") || n.contains("sfg") || n.contains("female") || n.contains("tpd")) &&
                            !v.isNetworkConnectionRequired
                        } ?: candidatePool.firstOrNull { v ->
                            !v.isNetworkConnectionRequired && v.quality >= Voice.QUALITY_HIGH && v.locale.language == "en"
                        } ?: candidatePool.firstOrNull { v ->
                            !v.isNetworkConnectionRequired && v.locale.language == "en"
                        } ?: candidatePool.firstOrNull { v ->
                            v.locale.language == "en"
                        }
                    }
                }

                if (bestVoice != null) {
                    try {
                        tts.language = bestVoice.locale
                    } catch (_: Exception) {}
                    tts.voice = bestVoice
                    Log.i(TAG, "Selected natural TTS voice: ${bestVoice.name} (quality=${bestVoice.quality}, locale=${bestVoice.locale}, isNetwork=${bestVoice.isNetworkConnectionRequired})")
                } else {
                    Log.i(TAG, "No specific voice candidate matched; using system default with prosody tuning.")
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Voice configuration exception: ${e.message}")
        }

        // Apply natural acoustic prosody based on selected personality
        try {
            when (preference) {
                "JAPANESE" -> {
                    tts.setPitch(1.08f)
                    tts.setSpeechRate(1.05f)
                }
                "CRISP_MALE" -> {
                    tts.setPitch(0.96f)
                    tts.setSpeechRate(1.04f)
                }
                "PHILIPPINE" -> {
                    tts.setPitch(1.02f)
                    tts.setSpeechRate(1.00f)
                }
                else -> { // NATURAL_FEMALE
                    tts.setPitch(1.05f)
                    tts.setSpeechRate(1.02f)
                }
            }
        } catch (_: Exception) {}
    }

    /**
     * Dynamically selects the authentic native phonetics engine matching the utterance text.
     * Prevents speaking Japanese or Tagalog in an annoying English accent.
     */
    private fun applyVoiceForUtterance(text: String) {
        val tts = textToSpeech ?: return
        val available = tts.voices

        // Detect Japanese: Kana or CJK Kanji characters in text, or user chosen preference
        val isJapanese = currentVoicePreference == "JAPANESE" || text.any { ch ->
            val block = Character.UnicodeBlock.of(ch)
            block == Character.UnicodeBlock.HIRAGANA ||
            block == Character.UnicodeBlock.KATAKANA ||
            block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS
        }

        // Detect Tagalog: Philippine keywords or user chosen preference
        val isTagalog = currentVoicePreference == "PHILIPPINE" ||
            text.contains("Kumusta", ignoreCase = true) ||
            text.contains("salamat", ignoreCase = true) ||
            text.contains("handa na", ignoreCase = true) ||
            text.contains("biyahe", ignoreCase = true) ||
            text.contains("aksidente", ignoreCase = true) ||
            text.contains("saklolo", ignoreCase = true) ||
            text.contains("ingat", ignoreCase = true) ||
            text.contains("ligtas", ignoreCase = true) ||
            text.contains("tulong", ignoreCase = true)

        if (isJapanese) {
            try {
                val jaVoice = available?.firstOrNull { v ->
                    val n = v.name.lowercase(Locale.US)
                    (v.locale.language.equals("ja", ignoreCase = true) || n.contains("ja-jp") || n.contains("ja_jp") || n.startsWith("ja-") || n.startsWith("ja_")) && !v.isNetworkConnectionRequired && !n.contains("seanet")
                } ?: available?.firstOrNull { v ->
                    v.locale.language == "ja" || v.locale == Locale.JAPAN || v.locale == Locale.JAPANESE
                }
                if (jaVoice != null) {
                    tts.language = jaVoice.locale
                    tts.voice = jaVoice
                } else {
                    tts.language = Locale.JAPAN
                }
                tts.setPitch(1.08f)
                tts.setSpeechRate(1.05f)
                Log.d(TAG, "Applied native Japanese phonetics engine for utterance.")
            } catch (e: Exception) {
                Log.w(TAG, "Could not set Japanese voice: ${e.message}")
            }
            return
        }

        if (isTagalog) {
            try {
                val filVoice = available?.firstOrNull { v ->
                    val n = v.name.lowercase(Locale.US)
                    (v.locale.country.equals("PH", ignoreCase = true) || v.locale.language.equals("fil", ignoreCase = true) || v.locale.language.equals("tl", ignoreCase = true) || n.contains("fil-ph") || n.contains("tl-ph") || n.startsWith("fil-") || n.startsWith("fil_")) &&
                    !v.isNetworkConnectionRequired && !n.contains("seanet")
                } ?: available?.firstOrNull { v ->
                    v.locale.country.equals("PH", ignoreCase = true) || v.locale.language.equals("fil", ignoreCase = true) || v.locale.language.equals("tl", ignoreCase = true)
                }
                if (filVoice != null) {
                    tts.language = filVoice.locale
                    tts.voice = filVoice
                } else {
                    tts.language = Locale("fil", "PH")
                }
                tts.setPitch(1.02f)
                tts.setSpeechRate(1.00f)
                Log.d(TAG, "Applied native Filipino/Tagalog phonetics engine for utterance.")
            } catch (e: Exception) {
                Log.w(TAG, "Could not set Tagalog voice: ${e.message}")
            }
            return
        }

        // Standard English engine
        configureNaturalVoice(currentVoicePreference)
    }

    fun setVoicePreference(preference: String) {
        configureNaturalVoice(preference)
    }

    fun handleCategorySwitchDirect(category: String) {
        val announcement = "Switched to $category mode. Safety algorithms updated."
        handleCategoryChangeSpotted(category, announcement)
    }

    fun setAlarmActiveState(active: Boolean) {
        isAlarmActiveContext = active
    }

    /**
     * Speaks response aloud. Pauses recognizer first to avoid mic feedback loop.
     * Recognizer resumes automatically via UtteranceProgressListener.onDone().
     */
    /**
     * Plays a short ascending two-tone cue (like Google Assistant's "ba-ding")
     * to indicate RAMS has entered listening/awaiting-command mode.
     * Uses ToneGenerator on STREAM_NOTIFICATION at low volume to avoid
     * interfering with the speech recognizer microphone session.
     */
    private fun playListeningTone() {
        try {
            val toneGen = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 60) // 60% volume
            toneGen.startTone(ToneGenerator.TONE_PROP_BEEP, 120) // short ascending beep, 120ms
            mainHandler.postDelayed({
                toneGen.startTone(ToneGenerator.TONE_PROP_BEEP2, 100) // second higher beep, 100ms
                mainHandler.postDelayed({ toneGen.release() }, 200)
            }, 150)
            Log.d(TAG, "Listening indicator tone played.")
        } catch (e: Exception) {
            Log.w(TAG, "ToneGenerator failed: ${e.message}")
        }
    }

    fun speak(text: String) {
        if (!isTtsReady || textToSpeech == null) return
        try {
            // Dynamically select native phonetics (Tagalog, Japanese, or English) to eliminate foreign accents
            applyVoiceForUtterance(text)

            // Pause recognizer so mic doesn't pick up TTS audio
            isTtsSpeaking = true
            mainHandler.removeCallbacks(ttsWatchdog)
            val watchdogMs = (text.length * 90L).coerceIn(6000L, 22000L)
            mainHandler.postDelayed(ttsWatchdog, watchdogMs)
            mainHandler.post {
                try {
                    speechRecognizer?.stopListening()
                } catch (_: Throwable) {}
            }
            val params = Bundle().apply {
                putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, AudioManager.STREAM_MUSIC)
            }
            textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, params, "rams_tts_${System.currentTimeMillis()}")
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
            if (_engineState.value == VoiceEngineState.AWAITING_COMMAND && _isBubbleVisible.value) {
                return
            }
            _isBubbleVisible.value = true
            isAwaitingCommandStage = true
            _engineState.value = VoiceEngineState.AWAITING_COMMAND
            if (isAlarmActiveContext) {
                _promptMessageFlow.value = "CRASH ALARM ACTIVE"
                _liveTranscriptFlow.value = "Say 'Cancel', 'Stop', or 'I am OK' to abort"
                onSpeechDetectedListener?.invoke(true)
                scheduleRestart(50L)
            } else {
                _promptMessageFlow.value = "What would you like to do next?"
                _liveTranscriptFlow.value = "Say 'Cancel', 'Stop', or ask RAMS anything"
                speak("What would you like to do next?")
            }
        } else {
            // Guard: If already actively listening or in command stage, DO NOT restart or spam startListening
            if (_engineState.value == VoiceEngineState.LISTENING_FOR_WAKE_WORD ||
                _engineState.value == VoiceEngineState.AWAITING_COMMAND ||
                _engineState.value == VoiceEngineState.HEARING_SPEECH) {
                Log.d(TAG, "Already active in state ${_engineState.value}, ignoring duplicate startListeningForCancel")
                return
            }
            isAwaitingCommandStage = false
            _engineState.value = VoiceEngineState.LISTENING_FOR_WAKE_WORD
            _promptMessageFlow.value = "Listening for 'Hey RAMS'..."
            _liveTranscriptFlow.value = "Say 'Hey RAMS' or 'Hi RAMS'"
            scheduleRestart(150L)
        }

        startRmsPulsingJob()
        Log.i(TAG, "startListeningForCancel(promptDirectly=$promptDirectly, currentState=${_engineState.value})")
    }

    var onCategoryChangeRequested: ((category: String, announcement: String) -> Unit)? = null
    var onDismissBubbleListener: (() -> Unit)? = null
    var onSpeechDetectedListener: ((Boolean) -> Unit)? = null
    var appActionHandler: RamsAppActionHandler? = null
        set(value) {
            field = value
            assistantEngine.appActionHandler = value
        }

    /**
     * Called when user says "Hey RAMS" or taps the mic button.
     * Brings the assistant overlay to the foreground over whatever app the user is using.
     */
    fun triggerWakeWordAwaitingCommand() {
        openBubbleUi()

        if (RamsOverlayManager.canDrawOverlays(context) && !RamsOverlayManager.isAppInForeground) {
            RamsOverlayManager.showVoiceOverlay(
                prompt = "Hi, how can I help you?",
                transcript = "Listening...",
                state = VoiceEngineState.AWAITING_COMMAND
            )
            Log.i(TAG, "Summoned RAMS Floating System Overlay over active apps.")
        } else if (!RamsOverlayManager.isAppInForeground) {
            // Surface heads-up notification allowing direct tap or overlay permission grant
            com.example.service.RamsForegroundService.postHeadsUpNotification(
                context,
                title = "RAMS Cognitive Assistant",
                content = "Listening... Tap to speak or enable display over other apps."
            )
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
    }

    /**
     * Opens the Assistant bubble UI directly in Compose state without intent loops.
     */
    fun openBubbleUi() {
        if (_engineState.value == VoiceEngineState.COMMAND_SPOTTED) return

        autoDismissJob?.cancel()
        _isBubbleVisible.value = true
        isAwaitingCommandStage = true
        _engineState.value = VoiceEngineState.AWAITING_COMMAND
        _promptMessageFlow.value = "Hi, how can I help you?"
        _liveTranscriptFlow.value = "Listening..."
        playListeningTone()
        scheduleAutoDismiss(10000L)
        Log.i(TAG, "Assistant bubble activated -> AWAITING_COMMAND.")

        if (RamsOverlayManager.canDrawOverlays(context) && !RamsOverlayManager.isAppInForeground) {
            RamsOverlayManager.showVoiceOverlay(
                prompt = "Hi, how can I help you?",
                transcript = "Listening...",
                state = VoiceEngineState.AWAITING_COMMAND
            )
        }

        // If recognizer is not currently active, schedule an immediate listening cycle
        if (!isRecognitionActive) {
            scheduleRestart(50L)
        }
    }

    /**
     * Re-arms speech recognition immediately to listen for user command/question.
     * Can be tapped manually on the mic orb or triggered programmatically.
     */
    fun restartListeningForCommand() {
        mainHandler.post {
            pendingQueryJob?.cancel()
            pendingQueryJob = null
            isAwaitingCommandStage = true
            _engineState.value = VoiceEngineState.AWAITING_COMMAND
            _promptMessageFlow.value = "Listening..."
            _liveTranscriptFlow.value = "Say your question or 'Cancel'..."
            if (RamsOverlayManager.canDrawOverlays(context) && !RamsOverlayManager.isAppInForeground) {
                RamsOverlayManager.showVoiceOverlay(
                    prompt = "Listening...",
                    transcript = "Say your question or 'Cancel'...",
                    state = VoiceEngineState.AWAITING_COMMAND
                )
            }
            if (!isRecognitionActive) {
                scheduleRestart(50L)
            } else {
                Log.i(TAG, "restartListeningForCommand: recognizer is already actively capturing speech")
            }
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
            if (textToSpeech?.isSpeaking != true) {
                isTtsSpeaking = false
            } else {
                Log.d(TAG, "scheduleRestart: postponed (TTS is currently speaking)")
                return
            }
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
                _engineState.value == VoiceEngineState.COMMAND_SPOTTED) {
                return@post
            }
            if (isTtsSpeaking) {
                if (textToSpeech?.isSpeaking == true) {
                    return@post
                } else {
                    isTtsSpeaking = false
                }
            }

            // Check RECORD_AUDIO permission before initializing audio track
            val hasRecordAudio = androidx.core.content.ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.RECORD_AUDIO
            ) == android.content.pm.PackageManager.PERMISSION_GRANTED
            if (!hasRecordAudio) {
                Log.w(TAG, "SpeechRecognizer: RECORD_AUDIO permission not granted yet. Retrying in 1.5s.")
                scheduleRestart(1500L)
                return@post
            }

            // Check if Speech Recognition is supported on this device
            if (!SpeechRecognizer.isRecognitionAvailable(context)) {
                Log.w(TAG, "SpeechRecognizer: Recognition is not available on this device.")
                return@post
            }

            lastRestartTimestamp = System.currentTimeMillis()

            val primaryLang = if (useFallbackLanguage) "en-US" else Locale.getDefault().toLanguageTag().ifBlank { "en-US" }
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, primaryLang)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, primaryLang)
                putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", arrayOf("en-US", "en-PH", "fil-PH"))
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
                putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
                putExtra("android.speech.extra.BIASING_STRINGS", TuguegaraoOfflineSpatialEngine.TUGUEGARAO_VOCABULARY_BIASING)
                putExtra("android.speech.extras.SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS", 3000L)
                putExtra("android.speech.extras.SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS", 2500L)
                putExtra("android.speech.extras.SPEECH_INPUT_MINIMUM_LENGTH_MILLIS", 1000L)
            }

            try {
                var recognizer = speechRecognizer
                if (recognizer == null) {
                    // Prefer Google App (full ASR with cloud + offline models) over GoogleTTS (limited offline-only)
                    val googleAppComponent = android.content.ComponentName(
                        "com.google.android.googlequicksearchbox",
                        "com.google.android.voicesearch.serviceapi.GoogleRecognitionService"
                    )
                    val googleAppAvailable = try {
                        context.packageManager.getServiceInfo(googleAppComponent, 0)
                        true
                    } catch (_: Exception) { false }

                    recognizer = if (googleAppAvailable) {
                        Log.i(TAG, "Creating SpeechRecognizer with Google App (GoogleRecognitionService)")
                        SpeechRecognizer.createSpeechRecognizer(context, googleAppComponent)
                    } else {
                        Log.i(TAG, "Google App recognizer unavailable, using system default")
                        SpeechRecognizer.createSpeechRecognizer(context)
                    }
                    recognizer.setRecognitionListener(createRecognitionListener())
                    speechRecognizer = recognizer
                    Log.i(TAG, "SpeechRecognizer instance initialized and listener attached")
                } else {
                    if (isRecognitionActive) {
                        Log.d(TAG, "SpeechRecognizer is already listening, skipping redundant startListening")
                        return@post
                    }
                }
                recognizer.startListening(intent)
                isRecognitionActive = true
                Log.i(TAG, "SpeechRecognizer started listening (state=${_engineState.value})")
            } catch (t: Throwable) {
                Log.e(TAG, "Failed to start SpeechRecognizer, recreating next attempt", t)
                try {
                    speechRecognizer?.destroy()
                } catch (_: Throwable) {}
                speechRecognizer = null
                isRecognitionActive = false
                mainHandler.postDelayed({
                    if (_engineState.value != VoiceEngineState.DORMANT &&
                        _engineState.value != VoiceEngineState.COMMAND_SPOTTED &&
                        !isTtsSpeaking) {
                        scheduleRestart(1000L)
                    }
                }, 1000L)
            }
        }
    }

    private fun createRecognitionListener(): RecognitionListener {
        return object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                isRestarting = false
                consecutiveErrorCount = 0
                isRecognitionActive = true
                if (!isAwaitingCommandStage) {
                    _engineState.value = VoiceEngineState.LISTENING_FOR_WAKE_WORD
                } else {
                    _engineState.value = VoiceEngineState.AWAITING_COMMAND
                }
                Log.i(TAG, "SpeechRecognizer: onReadyForSpeech (state=${_engineState.value})")
            }

            override fun onBeginningOfSpeech() {
                autoDismissJob?.cancel()
                autoDismissJob = null
                _engineState.value = VoiceEngineState.HEARING_SPEECH
                pendingQueryJob?.cancel()
                pendingQueryJob = null
                onSpeechDetectedListener?.invoke(true)
                Log.i(TAG, "SpeechRecognizer: onBeginningOfSpeech (User speaking)")
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
                isRecognitionActive = false
                if (_engineState.value == VoiceEngineState.HEARING_SPEECH) {
                    _liveTranscriptFlow.value = "Analyzing..."
                }
                onSpeechDetectedListener?.invoke(false)
                Log.i(TAG, "SpeechRecognizer: onEndOfSpeech")
            }

            override fun onError(error: Int) {
                isRecognitionActive = false
                onSpeechDetectedListener?.invoke(false)
                val isNormalSilence = error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT
                if (!isNormalSilence) {
                    consecutiveErrorCount++
                } else {
                    consecutiveErrorCount = 0
                }
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
                    10 -> "ERROR_TOO_MANY_REQUESTS(10)"
                    11 -> "ERROR_SERVER_DISCONNECTED(11)"
                    12 -> "ERROR_LANGUAGE_NOT_SUPPORTED(12)"
                    13 -> "ERROR_LANGUAGE_UNAVAILABLE(13)"
                    14 -> "ERROR_CANNOT_CHECK_SUPPORT(14)"
                    else -> "ERROR_CODE($error)"
                }
                Log.i(TAG, "SpeechRecognizer onError: $errMsg (state=${_engineState.value}, consecutive=$consecutiveErrorCount)")

                if (error == 12 || error == 13) {
                    Log.w(TAG, "SpeechRecognizer offline language unavailable; falling back to default locale.")
                    useFallbackLanguage = true
                }

                // If fatal binding failure, too many requests, or busy, destroy instance immediately to rebind cleanly
                if (error == 10 || error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY || consecutiveErrorCount >= 4) {
                    try {
                        speechRecognizer?.cancel()
                        speechRecognizer?.destroy()
                    } catch (_: Throwable) {}
                    speechRecognizer = null
                    consecutiveErrorCount = 0
                }

                val shouldRestart = _engineState.value == VoiceEngineState.LISTENING_FOR_WAKE_WORD ||
                    _engineState.value == VoiceEngineState.AWAITING_COMMAND ||
                    _engineState.value == VoiceEngineState.HEARING_SPEECH

                if (shouldRestart && !isTtsSpeaking) {
                    val delay = when (error) {
                        10 -> 2000L // Backoff for ERROR_TOO_MANY_REQUESTS
                        SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> 1000L
                        SpeechRecognizer.ERROR_CLIENT -> 800L
                        SpeechRecognizer.ERROR_NO_MATCH, SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> 250L
                        SpeechRecognizer.ERROR_NETWORK, SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> 800L
                        else -> 500L
                    }
                    scheduleRestart(delay)
                }
            }

            override fun onResults(results: Bundle?) {
                isRecognitionActive = false
                onSpeechDetectedListener?.invoke(false)
                consecutiveErrorCount = 0
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                Log.i(TAG, "SpeechRecognizer onResults: matches=$matches (state=${_engineState.value})")
                checkMatchesForTrigger(matches, isPartial = false)

                // After final results, revert HEARING_SPEECH back to the correct listening mode
                // so the restart guard below can re-arm the recognizer for the next utterance
                if (_engineState.value == VoiceEngineState.HEARING_SPEECH) {
                    _engineState.value = if (isAwaitingCommandStage)
                        VoiceEngineState.AWAITING_COMMAND
                    else
                        VoiceEngineState.LISTENING_FOR_WAKE_WORD
                    Log.i(TAG, "State reverted from HEARING_SPEECH -> ${_engineState.value} for re-arm")
                }

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
                    val top = matches[0]
                    Log.i(TAG, "SpeechRecognizer onPartialResults: '$top'")
                    _liveTranscriptFlow.value = top
                    if (RamsOverlayManager.canDrawOverlays(context) && !RamsOverlayManager.isAppInForeground) {
                        RamsOverlayManager.updateTranscript(top)
                    }
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
        val rawSquashed = text.replace(" ", "")

        if (rawSquashed.contains("heyrams") || rawSquashed.contains("hirams") ||
            rawSquashed.contains("heirams") || rawSquashed.contains("ayrams") ||
            rawSquashed.contains("eyrams") || rawSquashed.contains("airams") ||
            rawSquashed.contains("hermes") || rawSquashed.contains("hyrams") ||
            rawSquashed.contains("hyram") || rawSquashed.contains("hairams") ||
            rawSquashed.contains("hairam") || rawSquashed.contains("hoyrams") ||
            rawSquashed.contains("oyrams") || rawSquashed.contains("uyrams") ||
            rawSquashed.contains("okrams") || rawSquashed.contains("yoRams") ||
            rawSquashed.contains("hellorams")) {
            return true
        }

        for (i in tokens.indices) {
            val t1 = tokens[i]
            if (t1 == "rams" || t1 == "ram" || t1 == "rhams" || t1 == "rham" ||
                t1 == "roms" || t1 == "rems" || t1 == "rums" || t1 == "arms" ||
                t1 == "ran" || t1 == "rims" || t1 == "wrams" || t1 == "hermes" ||
                t1 == "hyram" || t1 == "hyrams" || t1 == "airam" || t1 == "airams" ||
                t1 == "heyrams" || t1 == "hirams" || t1 == "lamps" || t1 == "ramps" ||
                t1 == "realms" || t1 == "lance" || t1 == "rance" || t1 == "dance" ||
                t1 == "rhymes" || t1 == "rooms" || t1 == "rome" || t1 == "roams" ||
                t1 == "rounds" || t1 == "lambs" || t1 == "rahms" || t1 == "roms" ||
                t1 == "rans" || t1 == "ramps" || t1 == "romps" || t1 == "rems" ||
                t1 == "rams!" || t1 == "rahm" || t1 == "rahms" || t1 == "ramz") {
                return true
            }
            if (levenshteinDistance(t1, "rams") <= 2) return true

            if (i + 1 < tokens.size) {
                val pair = "$t1 ${tokens[i + 1]}"
                if (levenshteinDistance(pair, "hey rams") <= 3 ||
                    levenshteinDistance(pair, "hi rams") <= 3 ||
                    levenshteinDistance(pair, "ok rams") <= 2 ||
                    levenshteinDistance(pair, "yo rams") <= 2 ||
                    levenshteinDistance(pair, "hoy rams") <= 2 ||
                    levenshteinDistance(pair, "ay rams") <= 2 ||
                    levenshteinDistance(pair, "ey rams") <= 2 ||
                    levenshteinDistance(pair, "hai rams") <= 2 ||
                    levenshteinDistance(pair, "hey ram") <= 2 ||
                    levenshteinDistance(pair, "hi ram") <= 2 ||
                    levenshteinDistance(pair, "uy rams") <= 2 ||
                    levenshteinDistance(pair, "oi rams") <= 2 ||
                    levenshteinDistance(pair, "hello rams") <= 3) {
                    return true
                }
            }
        }
        return false
    }

    /**
     * Extracts direct query following a wake word if the user spoke the entire question in one breath.
     * E.g. "Hey RAMS what is my speed" -> "what is my speed"
     */
    private fun extractQueryAfterWakeWord(text: String): String {
        val lower = text.lowercase(Locale.US)
        val wakePrefixes = listOf(
            "hey rams", "hi rams", "hay rams", "ay rams", "ey rams", "hello rams",
            "okay rams", "ok rams", "yo rams", "hoy rams", "uy rams", "oy rams",
            "heirams", "hirams", "hey ram", "hi ram", "rams"
        )
        for (prefix in wakePrefixes) {
            val idx = lower.indexOf(prefix)
            if (idx != -1) {
                val after = text.substring(idx + prefix.length).trim(' ', ',', '?', '.', '!')
                if (after.length > 2) {
                    return after
                }
            }
        }
        return ""
    }

    /**
     * Match priority:
     *   1. CANCEL COMMANDS -- checked FIRST (immediate safety abort even on partial results!)
     *   2. WAKE WORDS -- checked when listening for wake word (with direct question extraction)
     *   3. CONVERSATIONAL QUERY -- processed immediately on final result when in AWAITING_COMMAND stage
     */
    private fun checkCategoryChangeCommand(normalized: String, originalText: String): Pair<String, String>? {
        val lower = normalized.lowercase(Locale.US)

        // 1. Pedestrian / Walking
        val isWalk = (lower.contains("walk") || lower.contains("walking") || lower.contains("pedestrian") ||
            lower.contains("lakad") || lower.contains("maglakad") || lower.contains("lumakad") ||
            lower.contains("maglalakad") || lower.contains("on foot") || lower.contains("jogging") ||
            lower.contains("running")) && !lower.contains("don't walk") && !lower.contains("dont walk")
        if (isWalk) {
            return Pair(
                "Pedestrian",
                "Switched to Pedestrian mode. Safety algorithms calibrated for walking and jogging."
            )
        }

        // 2. Car / Automobile
        val isCar = lower.contains("use my car") || lower.contains("use car") ||
            lower.contains("going to use my car") || lower.contains("i will drive") ||
            lower.contains("car mode") || lower.contains("driving mode") ||
            lower.contains("drive mode") || lower.contains("switch to car") ||
            lower.contains("change to car") || lower.contains("set to car") ||
            lower.contains("automobile mode") || lower.contains("car driver mode") ||
            lower.contains("gamitin ko kotse") || lower.contains("gamitin ang kotse") ||
            lower.contains("magmamaneho ako") || lower.contains("drive car") ||
            lower.contains("four wheels") || lower.contains("sasakyan mode") ||
            lower.contains("gamitin ko sasakyan") || lower.contains("mag kotse")
        if (isCar) {
            return Pair(
                "Car Driver",
                "Switched to Car Driver mode. Kinematic filters calibrated for automobile travel."
            )
        }

        // 3. Motorcycle Rider
        val isMotor = lower.contains("ride my motorcycle") || lower.contains("ride motorcycle") ||
            lower.contains("use my motorcycle") || lower.contains("ride my motor") ||
            lower.contains("use my motor") || lower.contains("motorcycle mode") ||
            lower.contains("motor mode") || lower.contains("switch to motorcycle") ||
            lower.contains("change to motorcycle") || lower.contains("switch to motor") ||
            lower.contains("set to motorcycle") || lower.contains("magmomotor ako") ||
            lower.contains("mag motor ako") || lower.contains("gamitin ko motor") ||
            lower.contains("motor rider") || lower.contains("motorcycle rider mode") ||
            lower.contains("two wheeler") || lower.contains("motorbike mode")
        if (isMotor) {
            return Pair(
                "Motorcycle Rider",
                "Switched to Motorcycle Rider mode. 50 Hertz lean angle and crash detection armed."
            )
        }

        // 4. Bicycle / Cycling
        val isBike = lower.contains("use my bike") || lower.contains("use my bicycle") ||
            lower.contains("ride my bike") || lower.contains("ride my bicycle") ||
            lower.contains("bike mode") || lower.contains("bicycle mode") ||
            lower.contains("cycling mode") || lower.contains("switch to bike") ||
            lower.contains("change to bike") || lower.contains("switch to bicycle") ||
            lower.contains("set to bicycle") || lower.contains("magbibisikleta ako") ||
            lower.contains("mag bike ako") || lower.contains("gamitin ko bike") ||
            lower.contains("gamitin ko bisikleta") || lower.contains("pedal bike") ||
            lower.contains("cyclist mode") || lower.contains("padyak mode") ||
            lower.contains("magpadyak ako")
        if (isBike) {
            return Pair(
                "Cyclist",
                "Switched to Cyclist mode. Fall and impact sensing optimized for cycling."
            )
        }

        return null
    }

    private fun handleCategoryChangeSpotted(category: String, announcement: String) {
        val userMsg = VoiceChatMessage(sender = "USER", text = "Switch mode to $category")
        val currentList = _chatMessagesFlow.value.toMutableList().apply { add(userMsg) }
        val aiMsg = VoiceChatMessage(sender = "RAMS", text = announcement)
        currentList.add(aiMsg)
        _chatMessagesFlow.value = currentList
        _promptMessageFlow.value = announcement
        _liveTranscriptFlow.value = "RAMS: $announcement"
        _engineState.value = VoiceEngineState.CHATTING

        // Keep bubble visible so user sees the confirmation and can issue follow-ups
        _isBubbleVisible.value = true

        RamsOverlayManager.showVoiceOverlay(
            prompt = "CATEGORY SWITCHED",
            transcript = announcement,
            state = VoiceEngineState.COMMAND_SPOTTED
        )
        RamsOverlayManager.scheduleAutoDismiss(8000L)

        // Execute action immediately to persist the new category
        appActionHandler?.setTransitCategory(category)
        onCategoryChangeRequested?.invoke(category, announcement)

        // Speak aloud
        speak(announcement)

        // Wait for TTS to finish speaking, then transition to follow-up listening.
        // Only auto-dismiss after the user has been idle for a generous period.
        autoDismissJob?.cancel()
        isAwaitingCommandStage = true
        autoDismissJob = scope.launch(Dispatchers.Default) {
            // Wait for TTS to finish (poll isTtsSpeaking with a safety ceiling)
            var waitedMs = 0L
            while (isTtsSpeaking && waitedMs < 15000L) {
                delay(200)
                waitedMs += 200
            }
            // After speech finishes, give user time to issue a follow-up command
            delay(6000)
            withContext(Dispatchers.Main) {
                if (_isBubbleVisible.value && !isTtsSpeaking &&
                    (_engineState.value == VoiceEngineState.AWAITING_COMMAND ||
                     _engineState.value == VoiceEngineState.CHATTING)) {
                    Log.i(TAG, "Category switch follow-up timeout. Auto-dismissing bubble.")
                    dismissBubble()
                }
            }
        }
    }

    private fun checkMatchesForTrigger(matches: List<String>?, isPartial: Boolean) {
        if (matches.isNullOrEmpty()) return

        val sys = getSystemContext()
        val isAlarmActiveNow = isAlarmActiveContext || sys.isAlarmActive || sys.alarmCountdownSec > 0

        // Parse and clean all candidate variations provided by the recognizer
        val parsedList = matches.mapNotNull { raw ->
            val phoneticallyClean = TuguegaraoOfflineSpatialEngine.normalizeLocalPhonetics(raw)
            val normalized = normalizeText(phoneticallyClean)
            if (normalized.isNotBlank()) Triple(raw, phoneticallyClean, normalized) else null
        }
        if (parsedList.isEmpty()) return

        // 1. CANCEL COMMANDS -- Check ALL candidate hypotheses first (highest safety priority)
        for ((phrase, _, normalized) in parsedList) {
            val isCancelWord = CANCEL_COMMANDS.any { cmd -> normalized.contains(cmd) } ||
                dynamicCancelWords.any { cmd -> normalized.contains(cmd) } ||
                CANCEL_REGEX.containsMatchIn(normalized) ||
                (isAlarmActiveNow && (
                    normalized.contains("cancel") || normalized.contains("stop") ||
                    normalized.contains("safe") || normalized.contains("false") ||
                    normalized.contains("tigil") || normalized.contains("hinto") ||
                    normalized.contains("para") || normalized.contains("tama") ||
                    normalized.contains("patayin") || normalized.contains("quiet") ||
                    normalized.contains("silence") || normalized.contains("ok") ||
                    normalized.contains("abort") || normalized.contains("dismiss")
                ))

            if (isCancelWord) {
                pendingQueryJob?.cancel()
                pendingQueryJob = null

                if (isAlarmActiveNow || isAwaitingCommandStage) {
                    Log.i(TAG, "Immediate cancel command in active alarm / awaiting stage: '$phrase'")
                    handleSpottedCancelCommand(phrase.uppercase(Locale.US), 0.99f)
                    return
                }

                if (normalized.contains("cancel") || normalized.contains("stop") ||
                    normalized.contains("abort") || normalized.contains("dismiss") ||
                    normalized.contains("false alarm") || normalized.contains("safe") ||
                    normalized.contains("tigil") || normalized.contains("hinto") ||
                    normalized.contains("para") || normalized.contains("tama na")) {
                    Log.i(TAG, "Background cancel/stop command spotted: '$phrase'")
                    handleSpottedCancelCommand(phrase.uppercase(Locale.US), 0.99f)
                    return
                }
            }
        }

        // 2. CATEGORY CHANGE COMMANDS -- Check ALL candidate hypotheses (e.g. 'walk mode' in candidates)
        for ((phrase, phoneticallyClean, normalized) in parsedList) {
            val catSwitch = checkCategoryChangeCommand(normalized, phoneticallyClean)
            if (catSwitch != null) {
                Log.i(TAG, "Category change command spotted: '$phrase' -> ${catSwitch.first}")
                handleCategoryChangeSpotted(catSwitch.first, catSwitch.second)
                return
            }
        }

        // 3. WAKE WORDS -- Check ALL candidates if currently in background wake-word listening
        if (!isAwaitingCommandStage) {
            for ((phrase, phoneticallyClean, normalized) in parsedList) {
                val matchesWakeList = WAKE_WORDS.any { wake -> normalized.contains(wake) } ||
                    dynamicWakeWords.any { wake -> normalized.contains(wake) }
                val matchesWakeRegex = WAKE_WORD_REGEX.containsMatchIn(normalized)
                val matchesDirectWake = DIRECT_WAKE_REGEX.containsMatchIn(normalized)
                val matchesFuzzy = checkFuzzyWakeWord(normalized)

                if (matchesWakeList || matchesWakeRegex || matchesDirectWake || matchesFuzzy) {
                    Log.i(TAG, "Wake word matched ('$phrase' -> '$normalized', fuzzy=$matchesFuzzy)")

                    val directQuery = extractQueryAfterWakeWord(phoneticallyClean)
                    if (directQuery.isNotBlank() && directQuery.length > 2) {
                        Log.i(TAG, "Direct question spotted with wake word: '$directQuery'")
                        openBubbleUi()
                        handleConversationalQuery(directQuery)
                        return
                    }

                    triggerWakeWordAwaitingCommand()
                    return
                }
            }
        }

        // 4. CONVERSATIONAL QUERY in AWAITING_COMMAND stage
        if (isAwaitingCommandStage) {
            // First check if any candidate is a repetition of the wake word
            val isOnlyWakeWord = parsedList.any { (_, phoneticallyClean, normalized) ->
                WAKE_WORDS.any { wake -> normalized == wake } ||
                dynamicWakeWords.any { wake -> normalized == wake } ||
                normalized in listOf("rams", "ram", "hey", "hi", "hello", "hey rams", "hi rams", "ok rams", "okay rams", "halo rams", "hoy rams", "ay rams") ||
                (checkFuzzyWakeWord(normalized) && extractQueryAfterWakeWord(phoneticallyClean).isBlank())
            }

            if (isOnlyWakeWord) {
                val firstPhrase = parsedList.first().first
                Log.i(TAG, "Wake word reinforced in AWAITING_COMMAND stage: '$firstPhrase'")
                playListeningTone()
                _promptMessageFlow.value = "Yes? I'm listening. Ask me anything!"
                _liveTranscriptFlow.value = "Listening..."
                scheduleAutoDismiss(10000L)
                if (!isPartial) {
                    scheduleRestart(150L)
                }
                return
            }

            // Only process conversational query on final (non-partial) speech results
            if (!isPartial) {
                // Find first candidate with meaningful length
                val candidate = parsedList.firstOrNull { it.third.length > 2 }
                if (candidate != null) {
                    val (phrase, phoneticallyClean, _) = candidate
                    val cleanQuery = extractQueryAfterWakeWord(phoneticallyClean).ifBlank { phoneticallyClean }
                    Log.i(TAG, "Conversational query spotted: '$cleanQuery' (raw='$phrase')")
                    pendingQueryJob?.cancel()
                    pendingQueryJob = null
                    handleConversationalQuery(cleanQuery)
                    return
                }
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

        if (RamsOverlayManager.canDrawOverlays(context) && !RamsOverlayManager.isAppInForeground) {
            RamsOverlayManager.showVoiceOverlay(
                prompt = "Thinking...",
                transcript = "\"$userQuery\"",
                state = VoiceEngineState.CHATTING
            )
        }

        // Pause recognizer and halt prior speech while RAMS is reasoning
        mainHandler.post {
            try {
                speechRecognizer?.stopListening()
                textToSpeech?.stop()
            } catch (_: Throwable) {}
        }

        scope.launch(Dispatchers.IO) {
            val reply = assistantEngine.generateAssistantResponse(userQuery)
            withContext(Dispatchers.Main) {
                val aiMsg = VoiceChatMessage(sender = "RAMS", text = reply)
                _chatMessagesFlow.value = _chatMessagesFlow.value + aiMsg
                _promptMessageFlow.value = reply
                _liveTranscriptFlow.value = "RAMS: $reply"
                if (RamsOverlayManager.canDrawOverlays(context)) {
                    RamsOverlayManager.updateResponse(reply)
                }
                speak(reply)
            }
        }
    }

    /**
     * Injects a simulated conversational query for testing or manual prompt dispatch.
     */
    fun injectSimulatedUserQuery(query: String = "What is my speed?") {
        openBubbleUi()
        val normalized = TuguegaraoOfflineSpatialEngine.normalizeLocalPhonetics(query)
        handleConversationalQuery(normalized)
    }

    private fun handleSpottedCancelCommand(phrase: String, confidence: Float) {
        if (_engineState.value == VoiceEngineState.COMMAND_SPOTTED) return

        _engineState.value = VoiceEngineState.COMMAND_SPOTTED
        _detectedPhraseFlow.value = phrase
        _promptMessageFlow.value = "ALARM CANCELLED HANDS-FREE"
        _liveTranscriptFlow.value = "Command: \"$phrase\""
        Log.i(TAG, "CANCEL COMMAND SPOTTED: '$phrase' (Confidence: $confidence)")

        if (RamsOverlayManager.canDrawOverlays(context)) {
            RamsOverlayManager.showVoiceOverlay(
                prompt = "ALARM CANCELLED HANDS-FREE",
                transcript = "Command: \"$phrase\"",
                state = VoiceEngineState.COMMAND_SPOTTED
            )
            RamsOverlayManager.scheduleAutoDismiss(2500L)
        }

        isAlarmActiveContext = false

        // Cancel emergency alarm immediately and synchronously
        try {
            appActionHandler?.cancelEmergencyAlarm()
        } catch (e: Exception) {
            Log.w(TAG, "appActionHandler cancel error: ${e.message}")
        }
        scope.launch(Dispatchers.Main) {
            onAlarmCancelledByVoice(phrase, confidence)
        }

        onSpeechDetectedListener?.invoke(false)

        // Stop recognizer cleanly without thrashing binder
        mainHandler.post {
            try {
                speechRecognizer?.cancel()
                speechRecognizer?.stopListening()
            } catch (_: Exception) {}
        }

        speak("Emergency alarm cancelled. All systems nominal.")

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
                if (_isBubbleVisible.value) {
                    if (_audioLevelFlow.value < 0.1f) {
                        _audioLevelFlow.value = 0.15f + (kotlin.math.sin(System.currentTimeMillis() / 200.0).toFloat() * 0.08f)
                    }
                    delay(80)
                } else {
                    delay(600) // Sleep when bubble is closed to conserve CPU/battery
                }
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
    fun scheduleAutoDismiss(delayMs: Long = 8500L) {
        autoDismissJob?.cancel()
        autoDismissJob = scope.launch(Dispatchers.Default) {
            delay(delayMs)
            withContext(Dispatchers.Main) {
                if (_isBubbleVisible.value && !isTtsSpeaking && _engineState.value == VoiceEngineState.AWAITING_COMMAND) {
                    Log.i(TAG, "Inactivity timeout in AWAITING_COMMAND stage. Auto-dismissing bubble to wake-word mode.")
                    dismissBubble()
                }
            }
        }
    }

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

        RamsOverlayManager.hideOverlay()
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
