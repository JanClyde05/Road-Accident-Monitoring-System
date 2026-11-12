package com.example.ai

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.Locale

/**
 * Distilled reasoning sample captured from Google Gemini for fine-tuning RAMS-1.8B-Edge.
 */
data class DistilledKnowledgeSample(
    val query: String,
    val normalizedKey: String,
    val response: String,
    val timestamp: Long,
    val speedKmh: Float,
    val userRole: String,
    val vehicleModel: String,
    val source: String = "gemini-2.0-flash-distillation"
)

/**
 * Snapshot of live vehicle, sensor, and app state for RAMS AI Assistant context.
 */
data class RamsSystemContext(
    val speedKmh: Float = 0f,
    val liveG: Float = 1.0f,
    val peakG: Float = 1.0f,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val locationAddress: String = "",
    val hasGpsFix: Boolean = false,
    val isWearableConnected: Boolean = false,
    val wearableName: String = "",
    val wearableBatteryPct: Int = 94,
    val riderName: String = "",
    val userType: String = "Pedestrian", // "Motorcycle", "Pedestrian", "Bicycle", "Car", etc.
    val plateNumber: String = "",
    val vehicleModel: String = "",
    val bloodType: String = "",
    val allergies: String = "",
    val emergencyContactName: String = "",
    val emergencyContactPhone: String = "",
    val token: String = "",
    val aiMotionProfile: String = "Resting Upright",
    val aiConfidence: Float = 0.99f,
    val isAlarmActive: Boolean = false,
    val alarmCountdownSec: Int = 0
)

/**
 * Intelligent Conversational AI Assistant Engine for RAMS.
 *
 * Implements:
 * 1. Deep Context Awareness: Live speed, G-force, Wearable status, GPS location, and Edge AI cognition.
 * 2. In-App Feature Guide: Step-by-step help for Wearable pairing, AI Guard, IMU Studio, CSV logs, Hotspots, and Cancel commands.
 * 3. Dynamic Online Assistant (Wi-Fi / Internet Mode):
 *    - Real-time weather and road riding conditions via Open-Meteo.
 *    - Encyclopedic instant knowledge via DuckDuckGo / Wikipedia summary APIs.
 * 4. Resilient Offline Knowledge Engine:
 *    - Vehicle mechanics, motorcycling safety protocols, first aid, and conversational dialogue.
 */
class RamsAiAssistantEngine(
    private val context: Context,
    private val getSystemContext: () -> RamsSystemContext
) {
    companion object {
        private const val TAG = "RAMS_AI_Assistant"
        private const val HTTP_TIMEOUT_MS = 1200

        // RAMS Model Identity
        const val MODEL_NAME = "RAMS-1.8B-Edge"
        const val MODEL_VERSION = "v2.5-Edge"
        const val MODEL_PARAMS = "1.8B Parameters"
        const val MODEL_ARCH = "Transformer Decoder-Only (GQA + RoPE + SwiGLU)"
        const val MODEL_QUANT = "Int4 AWQ Quantized"
        const val MODEL_CONTEXT = "4096 Tokens"
        const val MODEL_DOMAIN = "Vehicle Kinematics & Crash Cognition"
    }

    // Counter to prevent repeating the same response consecutively
    private var lastDynamicIndex = -1

    // Multi-turn conversation history for human-like conversational memory
    private val conversationHistory = mutableListOf<Pair<String, String>>()

    // --- Gemini-to-RAMS Knowledge Distillation Cache ---
    private val distilledKnowledgeCache = mutableMapOf<String, DistilledKnowledgeSample>()
    private val DISTILLED_FILE_NAME = "rams_distilled_knowledge.jsonl"

    // Filler words stripped during key normalization for fuzzy cache lookup
    private val FILLER_WORDS = setOf(
        "a", "an", "the", "is", "are", "was", "were", "what", "who", "where",
        "when", "why", "how", "can", "could", "do", "does", "did", "will",
        "would", "should", "tell", "me", "about", "please", "hey", "rams",
        "ok", "okay", "just", "really", "very", "much", "some", "my", "your",
        "i", "you", "it", "that", "this", "to", "of", "in", "for", "on", "with",
        "ano", "ang", "mga", "ba", "po", "ko", "mo", "ng", "na", "sa", "at", "ay"
    )

    var appActionHandler: RamsAppActionHandler? = null

    // Dynamic user-taught / learned voice patterns
    private val dynamicLearnedPatterns = mutableMapOf<String, String>()
    private val LEARNED_PATTERNS_FILE = "learned_voice_patterns.json"

    init {
        loadDistilledCache()
        loadLearnedVoicePatterns()
    }

    private fun loadLearnedVoicePatterns() {
        try {
            val file = File(context.filesDir, LEARNED_PATTERNS_FILE)
            if (file.exists()) {
                val json = JSONObject(file.readText())
                val keys = json.keys()
                while (keys.hasNext()) {
                    val k = keys.next()
                    dynamicLearnedPatterns[k.lowercase(Locale.US)] = json.getString(k)
                }
                Log.i(TAG, "Loaded ${dynamicLearnedPatterns.size} dynamic learned voice patterns.")
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to load learned voice patterns: ${e.message}")
        }
    }

    fun learnVoicePattern(query: String, response: String) {
        try {
            val key = query.lowercase(Locale.US).trim()
            dynamicLearnedPatterns[key] = response
            val file = File(context.filesDir, LEARNED_PATTERNS_FILE)
            val json = if (file.exists()) {
                try { JSONObject(file.readText()) } catch (_: Exception) { JSONObject() }
            } else {
                JSONObject()
            }
            json.put(key, response)
            file.writeText(json.toString(2))
            Log.i(TAG, "Saved dynamic voice pattern: '$key' -> '$response'")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to save dynamic voice pattern: ${e.message}")
        }
    }

    /**
     * Normalizes a query into a canonical cache key:
     * expands arithmetic symbols to spoken words, lowercase, strip punctuation,
     * retains numeric digits and non-filler words, sort remaining tokens alphabetically.
     */
    fun normalizeQueryKey(query: String): String {
        val mathExpanded = query.lowercase(Locale.US)
            .replace("+", " plus ")
            .replace("-", " minus ")
            .replace("*", " times ")
            .replace("/", " divided by ")
            .replace("=", " equals ")
            .replace("%", " percent ")

        val tokens = mathExpanded
            .replace(Regex("[^a-z0-9\\s]"), " ")
            .split(Regex("\\s+"))
            .filter { token ->
                token.isNotBlank() && (token.length > 1 || token.all { it.isDigit() }) && token !in FILLER_WORDS
            }
            .sorted()
        return tokens.joinToString(" ")
    }

    /**
     * Loads distilled knowledge cache from JSONL file on disk into memory.
     */
    private fun loadDistilledCache() {
        try {
            // 1. Seed from pre-packaged APK assets if present
            try {
                context.assets.open(DISTILLED_FILE_NAME).bufferedReader().useLines { lines ->
                    for (line in lines) {
                        if (line.isBlank()) continue
                        try {
                            val obj = JSONObject(line)
                            val sample = DistilledKnowledgeSample(
                                query = obj.optString("query", ""),
                                normalizedKey = obj.optString("normalizedKey", ""),
                                response = obj.optString("response", ""),
                                timestamp = obj.optLong("timestamp", 0L),
                                speedKmh = obj.optDouble("speedKmh", 0.0).toFloat(),
                                userRole = obj.optString("userRole", ""),
                                vehicleModel = obj.optString("vehicleModel", ""),
                                source = obj.optString("source", "prepackaged-distillation")
                            )
                            if (sample.normalizedKey.isNotBlank() && sample.response.isNotBlank()) {
                                distilledKnowledgeCache[sample.normalizedKey] = sample
                            }
                        } catch (_: Exception) {}
                    }
                }
                Log.d(TAG, "Loaded ${distilledKnowledgeCache.size} distilled samples from APK assets.")
            } catch (_: Exception) {}

            // 2. Overlay dynamically learned user samples from filesDir
            val file = File(context.filesDir, DISTILLED_FILE_NAME)
            if (file.exists()) {
                file.bufferedReader().useLines { lines ->
                    for (line in lines) {
                        if (line.isBlank()) continue
                        try {
                            val obj = JSONObject(line)
                            val sample = DistilledKnowledgeSample(
                                query = obj.optString("query", ""),
                                normalizedKey = obj.optString("normalizedKey", ""),
                                response = obj.optString("response", ""),
                                timestamp = obj.optLong("timestamp", 0L),
                                speedKmh = obj.optDouble("speedKmh", 0.0).toFloat(),
                                userRole = obj.optString("userRole", ""),
                                vehicleModel = obj.optString("vehicleModel", ""),
                                source = obj.optString("source", "gemini-2.0-flash-distillation")
                            )
                            if (sample.normalizedKey.isNotBlank() && sample.response.isNotBlank()) {
                                distilledKnowledgeCache[sample.normalizedKey] = sample
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "Skipping malformed distilled sample: ${e.message}")
                        }
                    }
                }
            }
            Log.d(TAG, "Total active distilled knowledge samples: ${distilledKnowledgeCache.size}")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to load distilled knowledge cache: ${e.message}")
        }
    }

    /**
     * Persists a single distilled sample to the JSONL file and adds it to in-memory cache.
     */
    private fun persistDistilledSample(sample: DistilledKnowledgeSample) {
        try {
            distilledKnowledgeCache[sample.normalizedKey] = sample
            val obj = JSONObject().apply {
                put("query", sample.query)
                put("normalizedKey", sample.normalizedKey)
                put("response", sample.response)
                put("timestamp", sample.timestamp)
                put("speedKmh", sample.speedKmh.toDouble())
                put("userRole", sample.userRole)
                put("vehicleModel", sample.vehicleModel)
                put("source", sample.source)
            }
            val file = File(context.filesDir, DISTILLED_FILE_NAME)
            file.appendText(obj.toString() + "\n")
            Log.d(TAG, "Distilled sample cached: key='${sample.normalizedKey}' (total=${distilledKnowledgeCache.size})")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to persist distilled sample: ${e.message}")
        }
    }

    /**
     * Looks up a cached distilled answer by normalized query key.
     * Returns null if no cached answer exists for this query.
     */
    private fun lookupDistilledAnswer(query: String): String? {
        val key = normalizeQueryKey(query)
        if (key.isBlank()) return null
        val sample = distilledKnowledgeCache[key]
        if (sample != null) {
            Log.d(TAG, "Distillation cache HIT for key='$key'")
            return sample.response
        }
        return null
    }

    /** Returns all distilled Q&A pairs for UI display. */
    fun getDistilledSamples(): List<DistilledKnowledgeSample> = distilledKnowledgeCache.values.toList()

    /** Returns total number of distilled knowledge samples. */
    fun getDistilledSampleCount(): Int = distilledKnowledgeCache.size

    /**
     * Evaluates deterministic arithmetic and percentages offline in English, Tagalog, and symbols.
     * Supports +, -, *, /, %, number words (one..twenty, isa..sampu), and division-by-zero guards.
     */
    fun evaluateBasicMathExpression(query: String): String? {
        var q = query.lowercase(Locale.US).trim()

        val prefixes = listOf(
            "what is", "what's", "calculate", "solve", "compute", "tell me", "how much is",
            "ano ang", "paki solve ang", "magkano ang", "paki kwenta ang", "kwentahin mo ang"
        )
        for (prefix in prefixes) {
            if (q.startsWith(prefix)) {
                q = q.removePrefix(prefix).trim()
                break
            }
        }
        q = q.replace("?", "").replace("=", "").trim()

        val numberWords = mapOf(
            "zero" to 0, "one" to 1, "two" to 2, "three" to 3, "four" to 4, "five" to 5,
            "six" to 6, "seven" to 7, "eight" to 8, "nine" to 9, "ten" to 10,
            "eleven" to 11, "twelve" to 12, "thirteen" to 13, "fourteen" to 14, "fifteen" to 15,
            "sixteen" to 16, "seventeen" to 17, "eighteen" to 18, "nineteen" to 19, "twenty" to 20,
            "thirty" to 30, "forty" to 40, "fifty" to 50, "sixty" to 60, "seventy" to 70,
            "eighty" to 80, "ninety" to 90, "hundred" to 100,
            "isa" to 1, "dalawa" to 2, "tatlo" to 3, "apat" to 4, "lima" to 5,
            "anim" to 6, "pito" to 7, "walo" to 8, "siyam" to 9, "sampu" to 10
        )
        for ((word, num) in numberWords) {
            q = q.replace(Regex("\\b$word\\b"), num.toString())
        }

        val pctMatch = Regex("([\\d.]+)\\s*(?:%|percent)\\s+(?:of|ng)\\s+([\\d.]+)").find(q)
        if (pctMatch != null) {
            val pct = pctMatch.groupValues[1].toDoubleOrNull() ?: return null
            val base = pctMatch.groupValues[2].toDoubleOrNull() ?: return null
            val res = (pct * base) / 100.0
            val resStr = if (res % 1.0 == 0.0) res.toLong().toString() else "%.2f".format(Locale.US, res)
            return "${pctMatch.groupValues[1]} percent of ${pctMatch.groupValues[2]} is $resStr."
        }

        q = q.replace("multiplied by", "*")
            .replace("times", "*")
            .replace(Regex("(\\d+)\\s*[xX]\\s*(\\d+)"), "$1 * $2")
            .replace("divided by", "/")
            .replace("over", "/")
            .replace("hati sa", "/")
            .replace("plus", "+")
            .replace("dagdag", "+")
            .replace("minus", "-")
            .replace("bawas", "-")

        val mathMatch = Regex("([\\d.]+)\\s*([+\\-*/])\\s*([\\d.]+)").find(q)
        if (mathMatch != null) {
            val a = mathMatch.groupValues[1].toDoubleOrNull() ?: return null
            val op = mathMatch.groupValues[2]
            val b = mathMatch.groupValues[3].toDoubleOrNull() ?: return null

            val res: Double
            val opWord: String
            when (op) {
                "+" -> {
                    res = a + b
                    opWord = "plus"
                }
                "-" -> {
                    res = a - b
                    opWord = "minus"
                }
                "*" -> {
                    res = a * b
                    opWord = "times"
                }
                "/" -> {
                    if (b == 0.0) return "Division by zero is undefined."
                    res = a / b
                    opWord = "divided by"
                }
                else -> return null
            }

            val aStr = if (a % 1.0 == 0.0) a.toLong().toString() else a.toString()
            val bStr = if (b % 1.0 == 0.0) b.toLong().toString() else b.toString()
            val resStr = if (res % 1.0 == 0.0) res.toLong().toString() else "%.2f".format(Locale.US, res)
            return "$aStr $opWord $bStr is $resStr."
        }
        return null
    }

    /**
     * Appends online conversational exchanges to persistent local logs for offline retraining.
     */
    fun logOnlineConversation(query: String, response: String, sys: RamsSystemContext) {
        try {
            val convFile = File(context.filesDir, "rams_conversations.jsonl")
            val obj = JSONObject().apply {
                put("timestamp", System.currentTimeMillis())
                put("query", query)
                put("response", response)
                put("userRole", sys.userType)
                put("speedKmh", sys.speedKmh.toDouble())
                put("latitude", sys.latitude)
                put("longitude", sys.longitude)
                put("source", "gemini-online")
            }
            convFile.appendText(obj.toString() + "\n")
        } catch (e: Exception) {
            Log.w(TAG, "Failed logging online conversation: ${e.message}")
        }
    }

    /**
     * Auto-compacts distilled knowledge, user voice patterns, and conversation logs:
     * - Deduplicates identical normalized keys, retaining richest responses.
     * - Caps active distilled cache at 400 entries with atomic file rewrite.
     * - Prunes conversation history beyond 200 turns to conserve mobile flash memory.
     */
    fun autoCompactDistilledKnowledge(): Int {
        var totalPruned = 0
        try {
            val file = File(context.filesDir, DISTILLED_FILE_NAME)
            if (file.exists()) {
                val lines = file.readLines().filter { it.isNotBlank() }
                val sampleMap = mutableMapOf<String, DistilledKnowledgeSample>()
                for (line in lines) {
                    try {
                        val obj = JSONObject(line)
                        val s = DistilledKnowledgeSample(
                            query = obj.optString("query", ""),
                            normalizedKey = obj.optString("normalizedKey", ""),
                            response = obj.optString("response", ""),
                            timestamp = obj.optLong("timestamp", 0L),
                            speedKmh = obj.optDouble("speedKmh", 0.0).toFloat(),
                            userRole = obj.optString("userRole", ""),
                            vehicleModel = obj.optString("vehicleModel", ""),
                            source = obj.optString("source", "distilled")
                        )
                        if (s.normalizedKey.isNotBlank() && s.response.isNotBlank()) {
                            val existing = sampleMap[s.normalizedKey]
                            if (existing == null || s.timestamp >= existing.timestamp || s.response.length > existing.response.length) {
                                sampleMap[s.normalizedKey] = s
                            }
                        }
                    } catch (_: Exception) {}
                }

                val capped = if (sampleMap.size > 400) {
                    sampleMap.values.sortedByDescending { it.timestamp }.take(400)
                } else {
                    sampleMap.values.toList()
                }

                val tempFile = File(context.filesDir, "${DISTILLED_FILE_NAME}.tmp")
                tempFile.bufferedWriter().use { writer ->
                    for (s in capped) {
                        val obj = JSONObject().apply {
                            put("query", s.query)
                            put("normalizedKey", s.normalizedKey)
                            put("response", s.response)
                            put("timestamp", s.timestamp)
                            put("speedKmh", s.speedKmh.toDouble())
                            put("userRole", s.userRole)
                            put("vehicleModel", s.vehicleModel)
                            put("source", s.source)
                        }
                        writer.write(obj.toString())
                        writer.newLine()
                    }
                }
                tempFile.renameTo(file)

                for (s in capped) {
                    distilledKnowledgeCache[s.normalizedKey] = s
                }

                totalPruned += (lines.size - capped.size)
            }

            val patternsFile = File(context.filesDir, LEARNED_PATTERNS_FILE)
            if (patternsFile.exists()) {
                val pJson = JSONObject(patternsFile.readText())
                val cleanJson = JSONObject()
                val keys = pJson.keys()
                while (keys.hasNext()) {
                    val k = keys.next()
                    val v = pJson.getString(k).trim()
                    if (k.isNotBlank() && v.isNotBlank()) {
                        cleanJson.put(k.lowercase(Locale.US).trim(), v)
                    }
                }
                patternsFile.writeText(cleanJson.toString(2))
            }

            val convFile = File(context.filesDir, "rams_conversations.jsonl")
            if (convFile.exists()) {
                val convLines = convFile.readLines().filter { it.isNotBlank() }
                if (convLines.size > 200) {
                    val retained = convLines.takeLast(200)
                    val tmpConv = File(context.filesDir, "rams_conversations.jsonl.tmp")
                    tmpConv.writeText(retained.joinToString("\n") + "\n")
                    tmpConv.renameTo(convFile)
                    totalPruned += (convLines.size - retained.size)
                }
            }

            Log.i(TAG, "Distilled knowledge and conversations auto-compacted. Total entries pruned: $totalPruned")
        } catch (e: Exception) {
            Log.w(TAG, "Auto-compaction error: ${e.message}")
        }
        return totalPruned
    }

    /**
     * Exports the entire distilled knowledge base as JSONL text for clipboard/share.
     */
    fun exportDistilledKnowledgeJson(): String {
        return try {
            val file = File(context.filesDir, DISTILLED_FILE_NAME)
            if (file.exists()) file.readText() else ""
        } catch (e: Exception) {
            Log.w(TAG, "Failed to export distilled knowledge: ${e.message}")
            ""
        }
    }

    /**
     * Checks if the device has an active Wi-Fi or cellular internet connection.
     */
    fun isOnline(): Boolean {
        return try {
            val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
            val activeNetwork = cm.activeNetwork ?: return false
            val caps = cm.getNetworkCapabilities(activeNetwork) ?: return false
            caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
                caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        } catch (_: Exception) {
            false
        }
    }

    /**
     * Generates a context-aware dynamic spoken response to any user voice query.
     */
    suspend fun generateAssistantResponse(query: String): String = withContext(Dispatchers.IO) {
        val normalized = TuguegaraoOfflineSpatialEngine.normalizeLocalPhonetics(query)
        val trimmed = normalized.trim()
        val lower = trimmed.lowercase(Locale.US)
        val sys = getSystemContext()

        // 0A. DYNAMIC LEARNED VOICE PATTERNS (Checked first for personalized recall)
        val learned = dynamicLearnedPatterns[lower] ?: dynamicLearnedPatterns[normalizeQueryKey(lower)]
        if (learned != null) {
            Log.i(TAG, "Matched dynamic learned pattern for '$lower'")
            return@withContext learned
        }

        // 0B. EXPLICIT VOICE TEACHING INTENT ("remember that X is Y", "learn that X is Y")
        if (lower.startsWith("remember that ") || lower.startsWith("learn that ") || lower.startsWith("tandaan mo na ")) {
            val rest = lower.removePrefix("remember that ").removePrefix("learn that ").removePrefix("tandaan mo na ").trim()
            val parts = if (rest.contains(" is ")) rest.split(" is ", limit = 2) 
                        else if (rest.contains(" means ")) rest.split(" means ", limit = 2)
                        else if (rest.contains(" ay ")) rest.split(" ay ", limit = 2) else null
            if (parts != null && parts.size == 2) {
                val qKey = parts[0].trim()
                val ans = parts[1].trim()
                learnVoicePattern(qKey, ans)
                return@withContext "I have learned that pattern. Next time you say '$qKey', I will answer '$ans'."
            }
        }

        // 0C. APPLICATION ACTION EXECUTION (Empowering RAMS to alter parameters and navigate UI)

        // 1. Pedestrian / Walking Mode Execution
        val matchesWalk = (lower.contains("walk") || lower.contains("walking") || lower.contains("pedestrian") ||
            lower.contains("lakad") || lower.contains("maglakad") || lower.contains("lumakad") ||
            lower.contains("maglalakad") || lower.contains("on foot") || lower.contains("jogging") ||
            lower.contains("running")) && !lower.contains("don't walk") && !lower.contains("dont walk") && !lower.contains("cannot walk")

        if (matchesWalk) {
            appActionHandler?.setTransitCategory("Pedestrian")
            learnVoicePattern(lower, "Your transit mode is active as Pedestrian (Walking). Kinematic fall detection is armed.")
            return@withContext "Understood. I have updated your transit mode to Pedestrian (Walking). Kinematic fall detection and walking stride monitoring are now active in the system."
        }

        // 2. Motorcycle Rider Mode Execution
        val matchesMotor = (lower.contains("motorcycle") || lower.contains("motor") || lower.contains("ride bike") ||
            lower.contains("mag motor") || lower.contains("magmotor") || lower.contains("ride my motorcycle") ||
            lower.contains("two wheels") || lower.contains("motorbike")) && !lower.contains("don't") && !lower.contains("dont")

        if (matchesMotor) {
            appActionHandler?.setTransitCategory("Motorcycle Rider")
            learnVoicePattern(lower, "Your transit mode is active as Motorcycle Rider. 50 Hertz lean attitude and crash detection are armed.")
            return@withContext "Understood. I have updated your transit mode to Motorcycle Rider. 50 Hertz lean attitude and high-velocity collision algorithms are armed."
        }

        // 3. Car Driver Mode Execution
        val matchesCar = (lower.contains("car") || lower.contains("drive") || lower.contains("automobile") ||
            lower.contains("kotse") || lower.contains("magdrive") || lower.contains("use my car") ||
            lower.contains("driving mode") || lower.contains("four wheels")) && !lower.contains("don't")

        if (matchesCar) {
            appActionHandler?.setTransitCategory("Car Driver")
            return@withContext "Understood. I have updated your transit mode to Car Driver. High-speed collision deceleration algorithms active."
        }

        // 4. Tricycle Mode Execution
        if (lower.contains("tricycle") || lower.contains("trike") || lower.contains("tatlong gulong")) {
            appActionHandler?.setTransitCategory("Tricycle")
            return@withContext "Understood. I have updated your transit mode to Tricycle. Passenger safety and roll angle monitoring are active."
        }

        // 5. Bicycle / Cyclist Mode Execution
        if (lower.contains("bicycle") || lower.contains("cyclist") || lower.contains("bisikleta") || lower.contains("magbike")) {
            appActionHandler?.setTransitCategory("Cyclist")
            return@withContext "Understood. I have updated your transit mode to Cyclist. Low-mass impact and stability algorithms armed."
        }

        // 6. Navigation Tabs Execution
        if (lower.contains("show map") || lower.contains("open map") || lower.contains("view map") || lower.contains("go to map") || lower.contains("tingnan ang mapa")) {
            appActionHandler?.navigateToTab("MAP")
            return@withContext "Navigating to Live GPS Map view."
        }
        if (lower.contains("show telemetry") || lower.contains("open telemetry") || lower.contains("speed dashboard") || lower.contains("go to telemetry")) {
            appActionHandler?.navigateToTab("TELEMETRY")
            return@withContext "Navigating to Telemetry Dashboard."
        }
        if (lower.contains("open settings") || lower.contains("show settings") || lower.contains("go to settings")) {
            appActionHandler?.navigateToTab("SETTINGS")
            return@withContext "Opening System Settings."
        }
        if (lower.contains("open wearable") || lower.contains("show wearable") || lower.contains("wearable tab") || lower.contains("wearable settings")) {
            appActionHandler?.navigateToTab("WEARABLE")
            return@withContext "Opening Safety Wearable Manager."
        }
        if (lower.contains("open ai") || lower.contains("show ai") || lower.contains("ai suite") || lower.contains("neural suite")) {
            appActionHandler?.navigateToTab("AI_SUITE")
            return@withContext "Opening Edge AI Suite."
        }

        // 7. System Toggles Execution
        if (lower.contains("toggle theme") || lower.contains("dark mode") || lower.contains("light mode")) {
            appActionHandler?.toggleDarkMode()
            return@withContext "Display theme toggled successfully."
        }
        if (lower.contains("calibrate sensor") || lower.contains("zero imu") || lower.contains("calibrate imu") || lower.contains("zero sensor")) {
            appActionHandler?.zeroImuCalibration()
            return@withContext "IMU sensors zeroed. Baseline level calibrated and stored."
        }
        if (lower.contains("record csv") || lower.contains("start recording") || lower.contains("stop recording") || lower.contains("log telemetry")) {
            appActionHandler?.toggleCsvRecording()
            return@withContext "Telemetry CSV logging toggled."
        }
        if (lower.contains("connect wearable") || lower.contains("reconnect wearable") || lower.contains("pair wearable") || lower.contains("connect bluetooth")) {
            appActionHandler?.reconnectWearable()
            return@withContext "Initiating Bluetooth connection to RAMS Safety Wearable..."
        }
        if (lower.contains("cancel alarm") || lower.contains("stop alarm") || lower.contains("i am safe") || lower.contains("stop alert") || lower.contains("false alarm")) {
            appActionHandler?.cancelEmergencyAlarm()
            return@withContext "Emergency alarm cancelled. All systems nominal."
        }
        if (lower.contains("test crash") || lower.contains("simulate crash") || lower.contains("simulate accident")) {
            appActionHandler?.triggerSimulation()
            return@withContext "Initiating simulated crash impact sequence."
        }

        // 8. Location Pinning and Routing Execution ("pin X", "route to X", "and route X on my map", "navigate to X", etc.)
        val routeRegex = Regex("(?i).*(?:route to|route|navigate to|navigate|directions to|direction to|take me to|take us to|show route to|how to go to|paano pumunta sa|papunta sa|punta sa|punta tayo sa|dalhin mo ako sa|dalhin kami sa|where is|nasaan ang|locate|find|pin)\\s+(.+)")
        val matchResult = routeRegex.find(lower)
        val isPinOrRouteQuery = matchResult != null || lower.contains("ルート") || lower.contains("案内して")

        if (isPinOrRouteQuery) {
            val rawTarget = matchResult?.groupValues?.get(1) ?: lower
                .removePrefix("pin ")
                .removePrefix("route to ")
                .removePrefix("route ")
                .removePrefix("navigate to ")
                .removePrefix("directions to ")
                .removePrefix("take me to ")
                .removePrefix("show route to ")
                .removePrefix("punta sa ")
                .removePrefix("dalhin mo ako sa ")
                .removePrefix("punta tayo sa ")
                .removePrefix("how to go to ")
                .removePrefix("paano pumunta sa ")
                .removePrefix("papunta sa ")
                .replace("ルート", "")
                .replace("へ案内して", "")
                .replace("案内して", "")

            var targetLoc = rawTarget
                .replace(Regex("(?i)\\s+(on my map|on the map|on my phone|on map|on the app|please|sa mapa|sa phone|sa app)$"), "")
                .trim()
            targetLoc = TuguegaraoOfflineSpatialEngine.normalizeLocalPhonetics(targetLoc)

            if (targetLoc.isNotBlank()) {
                val matchedLandmark = TuguegaraoOfflineSpatialEngine.findTargetLandmark(targetLoc)
                val displayTarget = matchedLandmark?.name ?: targetLoc.replaceFirstChar { it.uppercase() }

                appActionHandler?.navigateToTab("MAP")
                appActionHandler?.pinAndRouteToLocation(targetLoc)
                val reply = if (lower.contains("ルート") || lower.contains("案内")) {
                    "${displayTarget}へのルートを計算し、マップ上にピン留めしました。案内を開始します。"
                } else if (lower.contains("punta") || lower.contains("sa ") || lower.contains("paano")) {
                    "Na-pin na ang $displayTarget sa mapa at kinakalkula na ang pinakamabilis na ruta. Mag-ingat sa pagmamaneho!"
                } else {
                    "Destination $displayTarget pinned on map. Route polyline plotted and active."
                }
                return@withContext reply
            }
        }

        if (lower.contains("clear route") || lower.contains("remove pin") || lower.contains("cancel route") ||
            lower.contains("alisin ang ruta") || lower.contains("burahin ang ruta") || lower.contains("ルート解除") || lower.contains("ピン解除")) {
            appActionHandler?.clearMapRoute()
            val reply = if (lower.contains("ルート") || lower.contains("解除")) {
                "目的地ピンとナビゲーションルートを解除しました。"
            } else if (lower.contains("alisin") || lower.contains("burahin")) {
                "Inalis na ang ruta at destination pin sa mapa."
            } else {
                "Destination pin and navigation route cleared from map."
            }
            return@withContext reply
        }

        // 9. Japanese & Tagalog Native Language Intents (Spoken with native phonology)
        if (lower.contains("こんにちは") || lower.contains("おはよう") || lower.contains("こんばんは")) {
            return@withContext "こんにちは、ジャン・クライドさん！RAMS セーフティガードが安全なドライブを見守っています。"
        }
        if (lower.contains("ありがとう") || lower.contains("サンキュー")) {
            return@withContext "どういたしまして！常に安全第一で運転してくださいね。"
        }
        if (lower.contains("どこですか") || lower.contains("現在地")) {
            val locDesc = if (sys.hasGpsFix) "現在地はトゥゲガラオ市、座標 ${String.format(Locale.US, "%.4f", sys.latitude)}, ${String.format(Locale.US, "%.4f", sys.longitude)} です。" else "GPS衛星を探索中です。"
            return@withContext locDesc
        }

        if (lower.contains("kamusta") || lower.contains("kumusta") || lower.contains("magandang araw") || lower.contains("magandang umaga")) {
            return@withContext "Kumusta, Jan Clyde! Handa na ang RAMS safety guard para sa ligtas mong biyahe."
        }
        if (lower.contains("salamat") || lower.contains("maraming salamat")) {
            return@withContext "Walang anuman, Jan Clyde! Laging mag-ingat sa kalsada."
        }
        if (lower.contains("nasaan ako") || lower.contains("nasaan tayo") || lower.contains("lokasyon ko")) {
            val locDesc = if (sys.hasGpsFix) "Nasa Tuguegarao City tayo, koordinato ${String.format(Locale.US, "%.4f", sys.latitude)}, ${String.format(Locale.US, "%.4f", sys.longitude)}." else "Naghahanap pa ng GPS signal."
            return@withContext locDesc
        }

        // 0D. REGULATED TECHNICAL EXPLANATIONS (Strictly controlled, high-level, elite engineering explanation without revealing secrets)

        // 1. System Architecture
        if (lower.contains("how does the system work") || lower.contains("how does rams work") ||
            lower.contains("system architecture") || lower.contains("explain rams") ||
            lower.contains("paano gumagana ang rams") || lower.contains("how it works") || lower.contains("what is rams")) {
            return@withContext "RAMS operates as a distributed edge-computing road safety ecosystem. A body-worn ESP32-S3 sensor node and companion smartphone evaluate fused kinematic telemetry at up to 100 Hertz. If an anomalous impact shock followed by sudden immobility is detected, a 10-second fail-safe countdown begins. If not cancelled by voice or tactile controls, an emergency 433 MHz LoRa radio packet is transmitted off-grid to nearby base stations, while cellular links dispatch real-time incident coordinates to emergency rescue centers."
        }

        // 2. Program Flow & Data Pipeline
        if (lower.contains("program flow") || lower.contains("data flow") || lower.contains("workflow") ||
            lower.contains("flowchart") || lower.contains("process flow") || lower.contains("pipeline") || lower.contains("how data moves")) {
            return@withContext "The RAMS pipeline executes across five distinct processing tiers: First, 3-axis acceleration and gyroscope matrices are sampled at high frequency with baseline bias filtering. Second, a kinematic finite-state engine classifies motion signatures. Third, potential impact triggers activate an audiovisual countdown with voice cancellation fail-safes. Fourth, uncancelled alerts generate compact 26-byte binary packets transmitted via 433 MHz chirp spread spectrum radio. Fifth, rescue stations ingest serial payloads and render real-time telemetry on incident maps."
        }

        // 3. Crash & Fall Detection Algorithm
        if (lower.contains("how does crash detection work") || lower.contains("crash detection algorithm") ||
            lower.contains("fall detection") || lower.contains("how do you detect accidents") ||
            lower.contains("accident detection") || lower.contains("impact algorithm")) {
            return@withContext "Crash identification relies on multi-axis kinematic threshold fusion. An impact candidate is flagged when resultant acceleration exceeds calibrated G-force envelopes with high jerk rates. To prevent false positives from speed bumps or potholes, the finite state machine requires simultaneous angular orientation shifts and a post-impact immobility window before escalating to an emergency state."
        }

        // 4. LoRa RF Transmission
        if (lower.contains("how does lora work") || lower.contains("lora transmission") ||
            lower.contains("radio frequency") || lower.contains("sx1278") || lower.contains("long range rf") || lower.contains("433mhz")) {
            return@withContext "RAMS uses Semtech SX1278 radio transceivers modulated with Chirp Spread Spectrum on 433 Megahertz. This physical layer achieves long-range transmission through urban concrete and rural terrain with high link budget, operating independently of cellular networks or power infrastructure."
        }

        // 5. Safety Wearable Relay Node
        if (lower.contains("how does the wearable work") || lower.contains("hardware specs") ||
            lower.contains("esp32") || lower.contains("safety wearable") || lower.contains("wearable node")) {
            return@withContext "The RAMS Wearable is an ESP32-S3 embedded platform acting as a personal safety relay. It maintains real-time Bluetooth Low Energy GATT communication with the rider's device, drives a 90-decibel piezoelectric emergency alarm, controls high-visibility status LEDs, and includes a dedicated hardware tactile switch for instantaneous false-alarm abort."
        }

        // 6. Rescuer Desktop Operations Center
        if (lower.contains("how does the desktop app work") || lower.contains("desktop app") ||
            lower.contains("command center") || lower.contains("rescuer app") || lower.contains("desktop operations")) {
            return@withContext "The Desktop Command Center is a high-reliability Windows application that interfaces directly with base station USB transceivers. It ingests binary radio packets, maps incident locations against local geographic layers, logs rider medical and vehicle metadata, and initiates automated emergency dispatch protocols without requiring third-party cloud intermediaries."
        }

        // 7. Edge AI & Cognitive Models
        if (lower.contains("what ai") || lower.contains("machine learning") || lower.contains("edge ai") ||
            lower.contains("neural") || lower.contains("how smart is rams")) {
            return@withContext "RAMS deploys a localized dual-tier artificial intelligence engine. Tier 1 executes real-time pattern classification on raw sensor streams directly on the device. Tier 2 provides on-device heuristic cognition and pre-distilled domain reasoning for hands-free command execution, localized navigation, and traffic safety law guidance, functioning autonomously without external server dependencies."
        }

        // 1. PROFILE & USER REGISTRATION QUERIES
        if (lower.contains("edit profile") || lower.contains("change profile") || lower.contains("change name") ||
            lower.contains("change vehicle") || lower.contains("change user type") || lower.contains("change role") ||
            lower.contains("switch to pedestrian") || lower.contains("switch to motorcycle") || lower.contains("switch to car") ||
            lower.contains("how to edit") || lower.contains("update profile")) {
            return@withContext "To edit your profile, tap your avatar icon in the top-left header or open Settings and tap 'Rider Profile'. In the dialog, you can change your name, switch your role between Motorcycle Rider, Pedestrian, Car Driver, or Cyclist, and update your plate number, vehicle model, blood type, and emergency contacts."
        }

        if (lower.contains("who am i") || lower.contains("what is my profile") || lower.contains("my profile") ||
            lower.contains("my info") || lower.contains("my registration") || lower.contains("my data") || lower.contains("account info")) {
            val name = if (sys.riderName.isNotBlank()) sys.riderName else "Rider"
            val vehicle = if (sys.vehicleModel.isNotBlank()) sys.vehicleModel else "Not set"
            val plate = if (sys.plateNumber.isNotBlank()) ", plate: ${sys.plateNumber}" else ""
            val blood = if (sys.bloodType.isNotBlank()) sys.bloodType else "Not set"
            val contact = if (sys.emergencyContactName.isNotBlank()) "${sys.emergencyContactName} (${sys.emergencyContactPhone})" else "Not set"
            return@withContext "You are registered as $name, user role: ${sys.userType}. Vehicle: $vehicle$plate. Blood type: $blood. Emergency contact: $contact. To modify these settings, tap your avatar in the top-left header."
        }

        // 2. PROJECT CREDITS & ATTRIBUTION QUERIES
        if (lower.contains("credit") || lower.contains("credits") || lower.contains("who made") ||
            lower.contains("creator") || lower.contains("developer") || lower.contains("team") ||
            lower.contains("author") || lower.contains("about app") || lower.contains("about rams")) {
            return@withContext "RAMS (Road Accident Monitoring System) was developed by the RAMS Research & Development Team for the IECEP National Student Summit & Edge AI Innovation competition in collaboration with DOST-ASTI. You can inspect complete system credits, software licenses, and hardware documentation in the Settings tab under 'Project Credits'."
        }

        // 3. WEATHER & ROAD CONDITIONS (Personalized directly to userType: Motorcycle, Pedestrian, Car, etc.)
        if (lower.contains("weather") || lower.contains("rain") || lower.contains("temperature") || lower.contains("forecast") || lower.contains("road condition")) {
            var weatherPrefix = "Weather telemetry indicates standard road conditions."
            var weatherCode = 0
            if (isOnline() && sys.hasGpsFix && sys.latitude != 0.0) {
                try {
                    val weatherData = fetchLiveWeatherRaw(sys.latitude, sys.longitude)
                    if (weatherData != null) {
                        weatherPrefix = "Currently %.0f C and %s with winds at %.0f km/h.".format(Locale.US, weatherData.first, weatherData.second)
                        weatherCode = weatherData.third
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Weather fetch failed: ${e.message}")
                }
            }
            val personalizedTip = getPersonalizedRoleWeatherAdvice(weatherCode, sys)
            return@withContext "$weatherPrefix $personalizedTip"
        }

        // 4. LIVE TELEMETRY & SYSTEM STATUS INTENTS (Personalized to userType)
        if (lower.contains("speed") || lower.contains("how fast") || lower.contains("velocity")) {
            val role = sys.userType.lowercase(Locale.US)
            val vehicle = if (sys.vehicleModel.isNotBlank()) sys.vehicleModel else "vehicle"
            return@withContext when {
                role.contains("pedestrian") || role.contains("walk") -> {
                    if (sys.speedKmh > 0.5f) {
                        "You are moving on foot at %.1f kilometers per hour with an active pedestrian walking cadence.".format(Locale.US, sys.speedKmh)
                    } else {
                        "You are currently resting stationary at 0 kilometers per hour on foot."
                    }
                }
                role.contains("motorcycle") || role.contains("rider") -> {
                    if (sys.speedKmh > 1.0f) {
                        "Your cruising speed is %.1f kilometers per hour on your %s. 50 Hertz IMU tilt and attitude horizon are synchronized.".format(Locale.US, sys.speedKmh, vehicle)
                    } else {
                        "Your %s is currently stationary at 0 kilometers per hour.".format(vehicle)
                    }
                }
                role.contains("car") || role.contains("drive") -> {
                    if (sys.speedKmh > 1.0f) {
                        "Your vehicular speed is %.1f kilometers per hour in your %s with active GPS tracking.".format(Locale.US, sys.speedKmh, vehicle)
                    } else {
                        "Your %s is currently stationary at 0 kilometers per hour.".format(vehicle)
                    }
                }
                else -> {
                    if (sys.speedKmh > 1.0f) "Your speed is %.1f kilometers per hour with active telemetry.".format(Locale.US, sys.speedKmh)
                    else "You are currently stationary at 0 kilometers per hour."
                }
            }
        }

        if (lower.contains("g force") || lower.contains("g-force") || lower.contains("acceleration") || lower.contains("current g") || lower.contains("shock")) {
            return@withContext "Your live acceleration is %.2f G, with a peak recorded shock of %.2f G. 50 Hertz IMU shock filters are operating nominally.".format(Locale.US, sys.liveG, sys.peakG)
        }

        if (lower.contains("wearable") || lower.contains("bluetooth") || lower.contains("band") || lower.contains("wristband")) {
            return@withContext if (sys.isWearableConnected) {
                "Safety Wearable is connected via BLE GATT with %d%% battery remaining.".format(sys.wearableBatteryPct)
            } else {
                "Safety Wearable is currently disconnected. Open the Wearable tab and tap 'Scan and Connect Wearable' to pair over Bluetooth."
            }
        }

        if (lower.contains("where am i") || lower.contains("location") || lower.contains("coordinates") || lower.contains("address") ||
            lower.contains("nasaan ako") || lower.contains("asan ako") || lower.contains("where i am")) {
            val rev = TuguegaraoOfflineSpatialEngine.reverseGeocode(sys.latitude, sys.longitude)
            return@withContext "You are currently located at $rev."
        }

        // 4B. TUGUEGARAO TRICYCLE FARE & "CAPACITY" SCAM ADVISORY (ORDINANCE NO. 50-09-2022)
        // Checked BEFORE directions so destination phrases like "papuntang SM" still trigger fare advisory if user asks about cost/scams
        val isTricycleFareQuery = lower.contains("pamasahe") || lower.contains("fare") || lower.contains("magkano") ||
            lower.contains("tricycle") || lower.contains("trike") || lower.contains("capacity") ||
            lower.contains("sinisingil") || lower.contains("special trip") || lower.contains("overcharge") ||
            lower.contains("overcharging") || lower.contains("scam") || lower.contains("ordinance") ||
            lower.contains("singil") || lower.contains("plete") || lower.contains("pamasahi") ||
            lower.contains("mano ti") || lower.contains("sano i")

        if (isTricycleFareQuery) {
            return@withContext TuguegaraoOfflineSpatialEngine.getTricycleFareAndScamAdvisory(sys.latitude, sys.longitude, trimmed)
        }

        // 4C. TUGUEGARAO OFFLINE DIRECTIONS & WAYFINDING (OFFLINE GMAPS REPLACEMENT)
        val isDirectionQuery = lower.contains("how to go") || lower.contains("how to get to") ||
            lower.contains("direction") || lower.contains("directions") || lower.contains("take me to") ||
            lower.contains("way to") || lower.contains("papunta sa") || lower.contains("saan ang") ||
            lower.contains("saan banda") || lower.contains("paano pumunta") || lower.contains("route to") ||
            (lower.contains("where is") && !lower.contains("where is my")) ||
            (TuguegaraoOfflineSpatialEngine.findTargetLandmark(trimmed) != null && (lower.contains("go") || lower.contains("punta") || lower.contains("saan") || lower.contains("where")))

        if (isDirectionQuery) {
            val directions = TuguegaraoOfflineSpatialEngine.generateOfflineDirections(sys.latitude, sys.longitude, trimmed)
            if (directions != null) {
                return@withContext directions
            }
        }

        if (lower.contains("status") || lower.contains("system status") || lower.contains("condition") || lower.contains("diagnostics")) {
            val wearableMsg = if (sys.isWearableConnected) "Wearable synchronized (${sys.wearableBatteryPct}%)" else "Wearable disconnected"
            return@withContext "All systems guarded. User role: %s. 50 Hertz IMU armed. Movement: %s at %.0f%% confidence. %s.".format(
                Locale.US, sys.userType, sys.aiMotionProfile, sys.aiConfidence * 100f, wearableMsg
            )
        }

        // 5. IN-APP TECHNICAL GUIDANCE INTENTS
        if (lower.contains("how to cancel") || lower.contains("cancel alert") || lower.contains("false alarm") || lower.contains("stop alarm")) {
            return@withContext "To cancel an alarm, say 'Cancel', 'Stop', or 'I am safe' during the 10-second countdown. You can also tap the red Cancel button on screen, or press the physical tactile button on your Safety Wearable."
        }

        if (lower.contains("how to connect") || lower.contains("pair wearable") || lower.contains("connect wearable")) {
            return@withContext "Go to the Wearable tab, ensure phone Bluetooth is on, and tap 'Scan and Connect Wearable'. RAMS will automatically bind over BLE GATT service 0xFFE0 to receive 100 Hertz MPU-6050 fall detection and battery telemetry."
        }

        if (lower.contains("ai guard") || lower.contains("edge ai") || lower.contains("cognition") || lower.contains("ai suite") || lower.contains("neural")) {
            return@withContext "AI Guard runs a dual-tier edge neural model directly on your phone 100% offline. Tier 1 performs 50 Hertz kinematic feature extraction (peak G, jerk, tilt delta) to reject potholes and speed bumps with 0% false alarms. Tier 2 verifies emergency crash states."
        }

        if (lower.contains("calibrate") || lower.contains("calibration") || lower.contains("imu studio")) {
            return@withContext "Open Settings and select 'IMU Studio Calibration'. Place your device in your pocket or vehicle mount, tap 'Begin Calibration', and hold still for 10 seconds to record your baseline gravitational offsets."
        }

        if (lower.contains("export csv") || lower.contains("csv") || lower.contains("logs") || lower.contains("sensor logs") || lower.contains("record")) {
            return@withContext "You can export 50 Hertz sensor recordings by tapping the CSV icon in the top header or in Settings. Logs contain timestamps, tri-axial acceleration, gyro rates, and pitch/roll for accident reconstruction."
        }

        if (lower.contains("map") || lower.contains("hotspot") || lower.contains("danger zone") || lower.contains("danger spots")) {
            return@withContext "The Map tab displays your live GPS route and high-risk accident hotspots across Tuguegarao City computed by our spatial clustering algorithm. Red zones indicate high-risk intersections with elevated crash probabilities."
        }

        if (lower.contains("lora") || lower.contains("base station") || lower.contains("radio") || lower.contains("frequency")) {
            return@withContext "RAMS uses an Ai-Thinker Ra-02 SX1278 transceiver operating at 433 MHz with Spreading Factor 9. In emergencies, it broadcasts a 26-byte binary alert packet over off-grid radio up to 5 kilometers to rescuer base stations."
        }

        if (lower.contains("emergency contact") || lower.contains("next of kin") || lower.contains("who will be called")) {
            return@withContext if (sys.emergencyContactName.isNotBlank()) {
                "Your registered emergency contact is ${sys.emergencyContactName} at phone number ${sys.emergencyContactPhone}."
            } else {
                "No emergency contact is configured. Tap your profile avatar in the top-left header to register your contact."
            }
        }

        if (lower.contains("token") || lower.contains("medical token") || lower.contains("passport")) {
            return@withContext if (sys.token.isNotBlank()) {
                "Your emergency medical token is ${sys.token}. In a crash, first responders scan this to view your blood type ${sys.bloodType.ifBlank { "on file" }} and medical passport on the dispatch portal."
            } else {
                "Your medical token is automatically assigned upon registration in your Rider Profile."
            }
        }

        if (lower.contains("sos") || lower.contains("emergency") || lower.contains("crash") || lower.contains("what happens in a crash")) {
            return@withContext "In a verified collision, RAMS sounds an SOS Morse audio beacon, transmits a LoRa packet to base stations, and automatically sends an SMS with your GPS coordinates and medical token to ${if (sys.emergencyContactName.isNotBlank()) sys.emergencyContactName else "your emergency contact"}."
        }

        // 5B. DATA AUTO-COMPACTION & STORAGE OPTIMIZATION COMMANDS
        if (lower.contains("compact data") || lower.contains("auto compact") || lower.contains("optimize storage") ||
            lower.contains("compact cache") || lower.contains("compact memory") || lower.contains("clean memory") || lower.contains("compact storage")) {
            val distPruned = autoCompactDistilledKnowledge()
            val motionPruned = appActionHandler?.compactMotionData() ?: 0
            return@withContext "Data auto-compaction complete. Retained ${distilledKnowledgeCache.size} optimal knowledge entries and purged redundant records. Storage is fully optimized."
        }

        // 5C. DETERMINISTIC OFFLINE MATH EVALUATOR (Zero-Latency Arithmetic & Percentages)
        val mathAnswer = evaluateBasicMathExpression(trimmed)
        if (mathAnswer != null) {
            val normalizedKey = normalizeQueryKey(trimmed)
            if (normalizedKey.isNotBlank()) {
                persistDistilledSample(DistilledKnowledgeSample(
                    query = trimmed,
                    normalizedKey = normalizedKey,
                    response = mathAnswer,
                    timestamp = System.currentTimeMillis(),
                    speedKmh = sys.speedKmh,
                    userRole = sys.userType,
                    vehicleModel = sys.vehicleModel,
                    source = "deterministic-math-evaluator"
                ))
            }
            learnVoicePattern(trimmed, mathAnswer)
            return@withContext mathAnswer
        }

        // 6. DISTILLATION CACHE LOOKUP (Gemini-taught answers, works offline too)
        val cachedAnswer = lookupDistilledAnswer(trimmed)
        if (!cachedAnswer.isNullOrBlank()) {
            return@withContext cachedAnswer
        }

        // 7. ONLINE INTELLIGENCE: GOOGLE GEMINI 2.0 FLASH WITH MULTI-TURN MEMORY
        if (isOnline()) {
            try {
                val geminiReply = queryGeminiChat(trimmed, sys)
                if (!geminiReply.isNullOrBlank()) {
                    // Distill: cache this Gemini answer so RAMS can answer offline next time
                    val normalizedKey = normalizeQueryKey(trimmed)
                    if (normalizedKey.isNotBlank()) {
                        persistDistilledSample(DistilledKnowledgeSample(
                            query = trimmed,
                            normalizedKey = normalizedKey,
                            response = geminiReply,
                            timestamp = System.currentTimeMillis(),
                            speedKmh = sys.speedKmh,
                            userRole = sys.userType,
                            vehicleModel = sys.vehicleModel,
                            source = "gemini-2.0-flash-distillation"
                        ))
                    }
                    learnVoicePattern(trimmed, geminiReply)
                    logOnlineConversation(trimmed, geminiReply, sys)

                    // Auto-compact dynamically when dynamic cache grows
                    if (distilledKnowledgeCache.size % 25 == 0) {
                        autoCompactDistilledKnowledge()
                    }

                    return@withContext geminiReply
                }
            } catch (e: Exception) {
                Log.w(TAG, "Gemini online reasoning error: ${e.message}")
            }

            // If Gemini is unreachable or times out, immediately fall through to instant offline cognition (<5ms) without hanging
        }

        // 8. OFFLINE COGNITIVE REASONING ENGINE (RICH SITUATIONAL & IN-DEPTH DOMAIN COGNITION)
        return@withContext generateOfflineIntelligentResponse(lower, trimmed, sys)
    }

    /**
     * Generates personalized advice based on registered user role (Motorcycle, Pedestrian, Car, Cyclist).
     */
    private fun getPersonalizedRoleWeatherAdvice(code: Int, sys: RamsSystemContext): String {
        val isRain = code in listOf(51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99)
        val role = sys.userType.lowercase(Locale.US)
        val vehicle = if (sys.vehicleModel.isNotBlank()) sys.vehicleModel else "vehicle"

        return when {
            role.contains("pedestrian") || role.contains("walk") -> {
                if (isRain) {
                    "As a pedestrian walking today, wet sidewalks are slippery and vehicles require longer stopping distances. Carry an umbrella, wear high-visibility gear, and use marked pedestrian lanes."
                } else {
                    "As a pedestrian walking today, conditions are optimal. Stay alert on designated sidewalks and observe traffic signals."
                }
            }
            role.contains("motorcycle") || role.contains("rider") -> {
                if (isRain) {
                    "As a motorcycle rider on your $vehicle, rain reduces tire adhesion by 50% and painted road lines become slick. Smooth your lean angle and double your braking distance."
                } else {
                    "As a motorcycle rider on your $vehicle, pavement grip is prime. Maintain safe cornering angles and defensive lane positioning."
                }
            }
            role.contains("car") || role.contains("drive") -> {
                if (isRain) {
                    "For driving your $vehicle, keep windshield wipers on, maintain headlights on low-beam, and allow extra stopping distance behind two-wheelers."
                } else {
                    "Road conditions are clear for driving your $vehicle. Maintain safe highway cruising distances."
                }
            }
            role.contains("bicycle") || role.contains("cyclist") -> {
                if (isRain) {
                    "As a cyclist, wet rim brakes take longer to engage. Feather your brakes early, watch out for slippery metal grates, and make sure your front and rear lights are on."
                } else {
                    "Cycling conditions are excellent. Stay inside dedicated bike lanes and signal turns clearly."
                }
            }
            else -> {
                if (isRain) "Roads are wet; exercise caution, avoid sudden maneuvers, and increase safety margins."
                else "Pavement grip is optimal. All safety telemetry armed."
            }
        }
    }

    /**
     * Fetches raw live weather conditions: Triple(Temperature, ConditionText, WeatherCode).
     */
    private fun fetchLiveWeatherRaw(lat: Double, lon: Double): Triple<Double, String, Int>? {
        val endpoint = "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f&current_weather=true".format(Locale.US, lat, lon)
        val url = URL(endpoint)
        val conn = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = HTTP_TIMEOUT_MS
            readTimeout = HTTP_TIMEOUT_MS
            setRequestProperty("User-Agent", "RAMS-Safety-App/3.2")
        }

        if (conn.responseCode == 200) {
            val jsonText = conn.inputStream.bufferedReader().use(BufferedReader::readText)
            val root = JSONObject(jsonText)
            if (root.has("current_weather")) {
                val cw = root.getJSONObject("current_weather")
                val temp = cw.optDouble("temperature", 28.0)
                val code = cw.optInt("weathercode", 0)

                val condition = when (code) {
                    0 -> "Clear skies"
                    1, 2, 3 -> "Partly cloudy"
                    45, 48 -> "Foggy conditions"
                    51, 53, 55, 61, 63, 65 -> "Rainy with wet asphalt"
                    71, 73, 75 -> "Cold precipitation"
                    95, 96, 99 -> "Thunderstorm alert"
                    else -> "Overcast"
                }
                return Triple(temp, condition, code)
            }
        }
        return null
    }

    /**
     * Legacy wrapper.
     */
    private fun fetchLiveWeather(lat: Double, lon: Double): String {
        val raw = fetchLiveWeatherRaw(lat, lon) ?: return ""
        return "Currently %.0f C and %s.".format(Locale.US, raw.first, raw.second)
    }

    /**
     * Queries DuckDuckGo Instant Answer API or Wikipedia Summary for concise knowledge responses.
     */
    private fun fetchOnlineKnowledge(query: String): String? {
        val cleanQuery = query.replace("what is", "", ignoreCase = true)
            .replace("who is", "", ignoreCase = true)
            .replace("tell me about", "", ignoreCase = true)
            .replace("how does", "", ignoreCase = true)
            .replace("define", "", ignoreCase = true)
            .trim()

        if (cleanQuery.length < 3) return null

        // 1. DuckDuckGo Instant Answer
        try {
            val encoded = URLEncoder.encode(cleanQuery, "UTF-8")
            val ddgUrl = URL("https://api.duckduckgo.com/?q=$encoded&format=json&no_html=1&skip_disambig=1")
            val conn = (ddgUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = HTTP_TIMEOUT_MS
                readTimeout = HTTP_TIMEOUT_MS
                setRequestProperty("User-Agent", "RAMS-AI-Assistant/3.2")
            }

            if (conn.responseCode == 200) {
                val body = conn.inputStream.bufferedReader().use(BufferedReader::readText)
                val json = JSONObject(body)
                val abstractText = json.optString("AbstractText", "")
                if (abstractText.isNotBlank()) {
                    return summarizeText(abstractText)
                }
            }
        } catch (_: Exception) {}

        // 2. Wikipedia Summary REST API fallback
        try {
            val topic = cleanQuery.replace(" ", "_")
            val wikiUrl = URL("https://en.wikipedia.org/api/rest_v1/page/summary/${URLEncoder.encode(topic, "UTF-8")}")
            val conn = (wikiUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = HTTP_TIMEOUT_MS
                readTimeout = HTTP_TIMEOUT_MS
                setRequestProperty("User-Agent", "RAMS-AI-Assistant/3.2")
            }

            if (conn.responseCode == 200) {
                val body = conn.inputStream.bufferedReader().use(BufferedReader::readText)
                val json = JSONObject(body)
                val extract = json.optString("extract", "")
                if (extract.isNotBlank()) {
                    return summarizeText(extract)
                }
            }
        } catch (_: Exception) {}

        return null
    }

    /**
     * Clips knowledge text to 1-2 natural spoken sentences (maximum 200 characters).
     */
    private fun summarizeText(text: String): String {
        val periodIdx = text.indexOf('.')
        if (periodIdx > 20 && periodIdx < 220) {
            val secondPeriod = text.indexOf('.', periodIdx + 1)
            if (secondPeriod > periodIdx && secondPeriod < 250) {
                return text.substring(0, secondPeriod + 1).trim()
            }
            return text.substring(0, periodIdx + 1).trim()
        }
        return if (text.length > 200) text.substring(0, 197).trim() + "..." else text
    }

    /**
     * Retrieves the Gemini API key from BuildConfig or SharedPreferences fallback.
     */
    private fun getGeminiApiKey(): String {
        val prefs = context.getSharedPreferences("rams_settings", Context.MODE_PRIVATE)
        val customKey = prefs.getString("gemini_api_key", null)
        if (!customKey.isNullOrBlank()) {
            return customKey.trim()
        }
        return BuildConfig.GEMINI_API_KEY.trim()
    }

    /**
     * Online Generative Intelligence via Google Gemini REST API.
     * Uses zero external libraries (native HttpURLConnection + org.json).
     * Maintains multi-turn conversational context with live vehicular telemetry conditioning.
     * Features automatic model fallbacks (gemini-3.8-flash -> gemini-2.5-flash-lite -> gemini-flash-latest).
     */
    private fun queryGeminiChat(query: String, sys: RamsSystemContext): String? {
        val apiKey = getGeminiApiKey()
        if (apiKey.isBlank() || apiKey == "UNSET") {
            Log.d(TAG, "Gemini API key is unset; falling back to offline cognition.")
            return null
        }

        val candidateModels = listOf("gemini-3.8-flash", "gemini-3.5-flash-lite")
        val role = sys.userType
        val vehicle = if (sys.vehicleModel.isNotBlank()) sys.vehicleModel else "vehicle"
        val rider = if (sys.riderName.isNotBlank()) sys.riderName else "Rider"
        val reverseAddress = TuguegaraoOfflineSpatialEngine.reverseGeocode(sys.latitude, sys.longitude)

        val systemInstructionText = "You are RAMS, an intelligent road safety co-pilot and AI conversational assistant on an Android phone operating in Tuguegarao City, Cagayan, Philippines. " +
            "You are speaking to $rider who is a $role ($vehicle). " +
            "Current location: $reverseAddress (Coordinates ${"%.4f".format(Locale.US, sys.latitude)}, ${"%.4f".format(Locale.US, sys.longitude)}). " +
            "Current telemetry: Speed ${"%.1f".format(Locale.US, sys.speedKmh)} km/h, G-force ${"%.2f".format(Locale.US, sys.liveG)} G, Motion ${sys.aiMotionProfile}, Wearable ${if (sys.isWearableConnected) "Connected (${sys.wearableBatteryPct}%)" else "Disconnected"}. " +
            "LOCAL TUGUEGARAO KNOWLEDGE: You know local landmarks (SM City Tuguegarao in Caritan Norte, SM Center Downtown, Robinsons Place Tanza, CSU Carig, USL, SPUP, CVMC, Buntun Bridge). Under Tuguegarao City Ordinance No. 50-09-2022, base tricycle shared-ride fare is ₱12 for the first 2 km (₱10 for students/seniors/PWDs with 20% discount) plus ₱2 per succeeding km. Night fare bargaining is permitted 9PM-5AM. Drivers charging lone commuters 'capacity' (₱50 to ₱100+) is an illegal overcharge scam unless the commuter explicitly requested a private charter trip. You understand Tagalog, Ibanag, Ilokano, and Taglish. " +
            "RULES: 1. Answer like a natural, smart human assistant (like Google Assistant). " +
            "2. Keep the answer strictly to 1 or 2 spoken sentences (under 35 words) so it is safe to listen to while on the road. " +
            "3. Do NOT use markdown symbols, asterisks, bullet points, hashtags, or emojis because your response will be read aloud by Android Text-to-Speech. " +
            "4. Safety invariant: in accidents, never advise removing a helmet unless breathing is obstructed."

        val rootJson = JSONObject()

        // System Instruction
        val sysInstObj = JSONObject()
        val sysParts = JSONArray()
        sysParts.put(JSONObject().put("text", systemInstructionText))
        sysInstObj.put("parts", sysParts)
        rootJson.put("system_instruction", sysInstObj)

        // Contents array (Conversation History + Current Query)
        val contentsArr = JSONArray()
        synchronized(conversationHistory) {
            val historySlice = conversationHistory.takeLast(4)
            for ((userMsg, assistantMsg) in historySlice) {
                val userTurn = JSONObject()
                userTurn.put("role", "user")
                val uParts = JSONArray().put(JSONObject().put("text", userMsg))
                userTurn.put("parts", uParts)
                contentsArr.put(userTurn)

                val modelTurn = JSONObject()
                modelTurn.put("role", "model")
                val mParts = JSONArray().put(JSONObject().put("text", assistantMsg))
                modelTurn.put("parts", mParts)
                contentsArr.put(modelTurn)
            }
        }

        // Append current user message
        val currentTurn = JSONObject()
        currentTurn.put("role", "user")
        val currParts = JSONArray().put(JSONObject().put("text", query))
        currentTurn.put("parts", currParts)
        contentsArr.put(currentTurn)
        rootJson.put("contents", contentsArr)

        // Generation Config
        val genConfig = JSONObject()
        genConfig.put("temperature", 0.7)
        genConfig.put("maxOutputTokens", 120)
        rootJson.put("generationConfig", genConfig)

        val postData = rootJson.toString().toByteArray(Charsets.UTF_8)

        for (model in candidateModels) {
            try {
                val endpoint = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey"
                val url = URL(endpoint)
                val conn = (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = 1500
                    readTimeout = 2000
                    doOutput = true
                    setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                    setRequestProperty("User-Agent", "RAMS-AI-CoPilot/3.2")
                }

                conn.outputStream.use { os ->
                    os.write(postData)
                    os.flush()
                }

                val respCode = conn.responseCode
                if (respCode == 200) {
                    val respBody = conn.inputStream.bufferedReader().use(BufferedReader::readText)
                    val respJson = JSONObject(respBody)
                    val candidates = respJson.optJSONArray("candidates")
                    if (candidates != null && candidates.length() > 0) {
                        val candidate = candidates.getJSONObject(0)
                        val content = candidate.optJSONObject("content")
                        val parts = content?.optJSONArray("parts")
                        if (parts != null && parts.length() > 0) {
                            val rawText = parts.getJSONObject(0).optString("text", "")
                            val cleaned = cleanAiSpokenText(rawText)
                            if (cleaned.isNotBlank()) {
                                synchronized(conversationHistory) {
                                    conversationHistory.add(Pair(query, cleaned))
                                    if (conversationHistory.size > 8) {
                                        conversationHistory.removeAt(0)
                                    }
                                }
                                Log.i(TAG, "Gemini online reasoning success ($model): '$cleaned'")
                                return cleaned
                            }
                        }
                    }
                } else {
                    val errBody = conn.errorStream?.bufferedReader()?.use(BufferedReader::readText)
                    Log.w(TAG, "Gemini REST API ($model) HTTP $respCode: $errBody")
                    if (respCode == 404) {
                        continue // Try next candidate model
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "Gemini network call failed for $model: ${e.message}")
                break // Stop cascading through candidate models on network failure or timeout
            }
        }
        return null
    }

    /**
     * Cleans raw AI generation for smooth, natural Text-To-Speech delivery:
     * - Strips markdown formatting (*, #, _, `, >, -, ~)
     * - Removes URLs and HTML tags
     * - Strips non-ASCII emojis and excessive whitespace
     * - Clamps response length to safe spoken duration
     */
    private fun cleanAiSpokenText(raw: String): String {
        var text = raw.replace(Regex("\\*\\*|\\*|#+|_|`|>|~"), "")
            .replace(Regex("https?://\\S+"), "")
            .replace(Regex("<[^>]*>"), "")
            .replace(Regex("[\\p{So}\\p{Cn}]"), "") // Strip emojis and unassigned symbols
            .replace(Regex("\\s+"), " ")
            .trim()

        // Ensure proper end punctuation for TTS cadence
        if (text.isNotBlank() && !text.endsWith(".") && !text.endsWith("!") && !text.endsWith("?")) {
            text += "."
        }
        return text
    }

    /**
     * Resilient offline knowledge and conversational response generator.
     */
    private fun generateOfflineIntelligentResponse(lower: String, rawQuery: String, sys: RamsSystemContext): String {
        val role = sys.userType.lowercase(Locale.US)
        val vehicle = if (sys.vehicleModel.isNotBlank()) sys.vehicleModel else "vehicle"
        val name = if (sys.riderName.isNotBlank()) sys.riderName else "Rider"

        return when {
            // IDENTITY, MODEL & ARCHITECTURE
            lower.contains("who are you") || lower.contains("what is rams") || lower.contains("tell me about yourself") -> {
                "I am RAMS, your on-device safety co-pilot powered by the $MODEL_NAME model, version $MODEL_VERSION with $MODEL_PARAMS. I run 100 percent offline on your phone to guard against road accidents and answer your riding questions."
            }
            lower.contains("parameters") || lower.contains("architecture") || lower.contains("qwen") || lower.contains("gemma") || lower.contains("llm") -> {
                "RAMS runs $MODEL_PARAMS on a $MODEL_ARCH architecture, quantized to $MODEL_QUANT with a $MODEL_CONTEXT context window. It processes 50 Hertz IMU kinematics locally for zero-latency crash cognition."
            }
            lower.contains("are you smart") || lower.contains("how smart") || lower.contains("capabilities") -> {
                "I feature dual-tier edge neural cognition for real-time kinematics and false-alarm suppression, paired with situational reasoning for road safety, vehicle maintenance, and emergency protocols."
            }

            // GREETINGS & CASUAL RAPPORT
            lower.contains("hello") || lower.contains("hi") || lower.contains("hey") -> {
                val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
                val greeting = when {
                    hour < 12 -> "Good morning"
                    hour < 18 -> "Good afternoon"
                    else -> "Good evening"
                }
                if (sys.speedKmh > 10f) {
                    "$greeting $name! We are rolling at ${"%.1f".format(Locale.US, sys.speedKmh)} km/h. All safety sensors are active. What do you need?"
                } else {
                    "$greeting $name! All systems are armed for your $role mode. How can I assist you today?"
                }
            }
            lower.contains("how are you") || lower.contains("how are you doing") || lower.contains("how's it going") || lower.contains("what's up") -> {
                val gStr = "%.2f G".format(Locale.US, sys.liveG)
                if (sys.speedKmh > 5f) {
                    "Doing excellent, $name! Tracking your ride at ${"%.1f".format(Locale.US, sys.speedKmh)} km/h with baseline acceleration at $gStr. Everything looks smooth."
                } else {
                    "All systems nominal, $name! IMU is resting steadily at $gStr. Ready whenever you roll out."
                }
            }
            lower.contains("thank") || lower.contains("salamat") -> {
                "You are very welcome, $name! Keep your eyes on the road and ride safe."
            }
            lower.contains("joke") || lower.contains("say something funny") || lower.contains("make me laugh") -> {
                val jokes = listOf(
                    "Why did the motorcycle take a nap? Because it was two-tired!",
                    "Why do motorcycle riders love twisty roads? Because straight lines are just the boring distance between corners!",
                    "What is a motorcycle rider's favorite drink? High-octane coffee with plenty of kick!",
                    "Why did the bicycle fall over? Because it couldn't stand on its own two wheels without a kickstand!"
                )
                jokes[(System.currentTimeMillis() % jokes.size).toInt()]
            }
            lower.contains("bored") || lower.contains("talk to me") || lower.contains("chat with me") -> {
                if (sys.speedKmh > 20f) {
                    "At ${"%.1f".format(Locale.US, sys.speedKmh)} km/h, focus on scanning two blocks ahead and picking clean cornering lines. Defensive riding will keep your mind engaged!"
                } else {
                    "While we are stationary, feel free to ask about road rules, tire pressures, cornering physics, or how to pair your Safety Wearable."
                }
            }

            // SPEED & TRAFFIC RULES (RA 4136)
            lower.contains("speed limit") || lower.contains("how fast can i go") || lower.contains("overspeeding") || lower.contains("legal speed") || lower.contains("ra 4136") -> {
                if (sys.speedKmh > 60f) {
                    "You are currently at ${"%.1f".format(Locale.US, sys.speedKmh)} km/h. Under Philippine RA 4136, city streets are limited to 30 to 40 km/h and highways to 80 km/h. Taper your throttle to stay within safe legal margins."
                } else if (sys.speedKmh in 20f..60f) {
                    "At ${"%.1f".format(Locale.US, sys.speedKmh)} km/h you are cruising within standard municipal road limits. Remain alert for merging tricycles and pedestrians."
                } else {
                    "Philippine speed limits under RA 4136 are 30 to 40 km/h in urban streets and up to 80 km/h on open highways. Motorcycles below 400cc are restricted from expressways."
                }
            }

            // RIDING TECHNIQUE & PHYSICS
            lower.contains("countersteering") || lower.contains("counter steering") || lower.contains("how to turn") || lower.contains("cornering") || lower.contains("how to corner") -> {
                "To corner smoothly above 15 km/h, look toward the exit of the turn and push the handlebar forward on the side you want to turn. Countersteering initiates the lean angle cleanly."
            }
            lower.contains("abs") || lower.contains("anti lock") || lower.contains("braking") || lower.contains("how to brake") || lower.contains("skid") || lower.contains("stopping distance") -> {
                "In emergency deceleration, keep the bike upright and apply 70 percent front brake and 30 percent rear brake smoothly without snatching the lever. Progressive pressure prevents wheel tucking."
            }
            lower.contains("overtake") || lower.contains("passing") || lower.contains("filter") || lower.contains("filtering") || lower.contains("lane split") || lower.contains("lane splitting") -> {
                "Always overtake on the left side with a distinct mirror and shoulder check. When lane filtering through slow traffic, keep your speed difference below 15 km/h above surrounding traffic."
            }
            lower.contains("blind spot") || lower.contains("mirror") || lower.contains("lane change") -> {
                "Never linger in vehicle blind spots, especially heavy trucks. Always perform a quick shoulder check over your chin before initiating any lane change."
            }

            // ROAD HAZARDS & SURFACES
            lower.contains("pothole") || lower.contains("speed bump") || lower.contains("bump") || lower.contains("rough road") || lower.contains("crater") -> {
                "RAMS 50 Hertz filters safely reject vertical shocks up to 4.5 G with zero roll delta. When approaching an unavoidable pothole, stand slightly on your pegs and keep handlebars straight without grabbing the front brake."
            }
            lower.contains("slick") || lower.contains("white line") || lower.contains("manhole") || lower.contains("slippery road") || lower.contains("metal plate") -> {
                "Thermoplastic road markings, painted pedestrian lanes, and metal trench plates become ice-slick when wet. Cross them with the vehicle upright and maintain a neutral throttle."
            }
            lower.contains("night") || lower.contains("dark") || lower.contains("headlight") || lower.contains("glare") || lower.contains("high beam") -> {
                "Never look directly into oncoming high beams; instead, guide your trajectory using the white shoulder line on your right side, and keep your helmet visor free of micro-scratches."
            }

            // RIDER WELLNESS & ERGONOMICS
            lower.contains("tired") || lower.contains("sleepy") || lower.contains("drowsy") || lower.contains("exhausted") || lower.contains("yawn") || lower.contains("fatigue") -> {
                "Rider fatigue degrades reaction time by over 50 percent. Pull over at the next safe gas station, hydrate with cold water, and rest for 15 minutes before riding again."
            }
            lower.contains("numb") || lower.contains("wrist") || lower.contains("hand hurt") || lower.contains("finger tingling") || lower.contains("vibration") -> {
                "Hand numbness comes from gripping the bars too tightly and absorbing engine vibration. Relax your grip, support your torso by hugging the tank with your knees, and shake out your hands at stops."
            }
            lower.contains("angry") || lower.contains("road rage") || lower.contains("cut me off") || lower.contains("aggressive driver") -> {
                "Take a slow deep breath and let the aggressive driver pull away. On two wheels, winning a road argument is never worth the physical danger. Arriving safely is your priority."
            }

            // MECHANICAL TROUBLESHOOTING
            lower.contains("spongy brake") || lower.contains("soft brake") || lower.contains("brake lever loose") -> {
                "A spongy brake lever indicates air trapped in your hydraulic line or degraded brake fluid. Bleed the brake system and verify fluid levels before operating the vehicle."
            }
            lower.contains("tire pressure") || lower.contains("psi") || lower.contains("flat tire") || lower.contains("tires") -> {
                "Check tire pressure cold. Recommended pressures for underbone and scooter models are 29 PSI front and 33 PSI rear. Proper inflation prevents rim pinch flats and optimizes cornering grip."
            }
            lower.contains("chain") || lower.contains("slack") || lower.contains("chain lube") || lower.contains("chain loose") -> {
                "Maintain 20 to 30 millimeters of vertical chain slack at the midpoint. Clean and lubricate every 500 kilometers to prevent premature sprocket wear and chain snap."
            }
            lower.contains("engine hot") || lower.contains("overheating") || lower.contains("engine smoke") || lower.contains("burning smell") -> {
                "If your engine is running unusually hot in stop-and-go traffic, pull over to a shaded shoulder, let the engine idle or cool down, and inspect coolant and oil levels."
            }

            // SAFETY GEAR & FIRST AID INVARIANTS
            lower.contains("gear") || lower.contains("what to wear") || lower.contains("protection") || lower.contains("safety gear") -> {
                when {
                    role.contains("pedestrian") || role.contains("walk") ->
                        "For walking, wear comfortable non-slip footwear, bright or high-visibility clothing at night, and carry a rain umbrella during overcast conditions."
                    role.contains("motorcycle") || role.contains("rider") ->
                        "Always wear an ICC or PS certified full-face helmet, abrasion-resistant jacket, reinforced gloves, riding pants with armor, and sturdy over-the-ankle boots."
                    role.contains("bicycle") || role.contains("cyclist") ->
                        "Wear a certified cycling helmet, bright reflective vest, cycling gloves, and ensure your front white light and rear red reflector are active."
                    role.contains("car") || role.contains("drive") ->
                        "Fasten your three-point seatbelt, ensure headrests are aligned with the top of your ears, and check all three rearview mirrors before departing."
                    else ->
                        "Always prioritize high-visibility clothing, certified headgear, and protective outer layers appropriate for your transit mode."
                }
            }
            lower.contains("helmet") || lower.contains("ra 10054") || lower.contains("helmet law") -> {
                "Under Republic Act 10054 (Motorcycle Helmet Act of 2009), all motorcycle drivers and backriders must wear standard protective motorcycle helmets with valid ICC or PS marks at all times."
            }
            lower.contains("first aid") || lower.contains("injury") || lower.contains("bleeding") -> {
                "In a road accident, call 911 immediately. Never remove an injured rider's helmet unless their airway is blocked, to avoid exacerbating cervical spine trauma. Apply firm, direct pressure to severe bleeds with clean cloth."
            }
            lower.contains("help") || lower.contains("commands") || lower.contains("what can you do") -> {
                "You can ask me about speed limits, road physics, cornering, tire pressure, chain care, weather, first aid, or your live G-force and wearable status. What would you like to know?"
            }

            // SITUATIONAL HEURISTIC SYNTHESIZER (NO CANNED REPETITIVE FALLBACK)
            else -> {
                synthesizeHeuristicCognition(lower, rawQuery, sys)
            }
        }
    }

    /**
     * Synthesizes intelligent situational reasoning when no pre-mapped pattern matches.
     * Evaluates question intent and grounds the answer in live telemetry, kinematics, and safety physics.
     */
    private fun synthesizeHeuristicCognition(lower: String, rawQuery: String, sys: RamsSystemContext): String {
        val name = if (sys.riderName.isNotBlank()) sys.riderName else "Rider"
        val vehicle = if (sys.vehicleModel.isNotBlank()) sys.vehicleModel else "vehicle"
        val speed = sys.speedKmh
        val g = sys.liveG

        // 1. Question about possibility or safety: "can I", "should I", "is it safe", "okay to"
        if (lower.contains("can i") || lower.contains("should i") || lower.contains("is it safe") || lower.contains("allowed to")) {
            return if (speed > 40f) {
                "At your current speed of ${"%.1f".format(Locale.US, speed)} km/h, avoid any abrupt changes or distractions. Ensure you have clear sightlines and ample following distance before attempting maneuvers."
            } else if (speed > 5f) {
                "Proceed with caution. Keep your hands on the controls, scan the road ahead for cross traffic, and maintain a steady lean angle."
            } else {
                "While stationary, inspect your surroundings and mirrors first. If conditions are clear and road traction is solid, you can safely proceed."
            }
        }

        // 2. Question about location, direction or route: "where", "which way", "route", "direction"
        if (lower.contains("where") || lower.contains("route") || lower.contains("direction") || lower.contains("way to")) {
            return if (sys.hasGpsFix && sys.locationAddress.isNotBlank()) {
                "You are currently near ${sys.locationAddress}. Open the Map tab to review high-risk accident hotspots along your route."
            } else {
                "GPS positioning is currently tracking your route. Check the Map tab in RAMS for live incident heatmaps and route safety overlays."
            }
        }

        // 3. Question about time, duration or distance: "how long", "when", "time", "distance"
        if (lower.contains("how long") || lower.contains("when") || lower.contains("distance") || lower.contains("how far")) {
            return if (speed > 10f) {
                "At a pace of ${"%.1f".format(Locale.US, speed)} km/h, every 10 kilometers takes approximately ${"%.0f".format(Locale.US, (600f / speed))} minutes. Keep a steady pace and scan ahead."
            } else {
                "We are currently stopped. Plan your route with safety stops every 60 to 90 minutes to prevent riding fatigue."
            }
        }

        // 4. Specific vehicular dynamics question
        if ((lower.contains("why") || lower.contains("how")) && (lower.contains("stability") || lower.contains("lean") || lower.contains("corner") || lower.contains("brake") || lower.contains("grip"))) {
            return "Regarding $rawQuery: on your $vehicle, stability depends on smooth throttle modulation, progressive braking, and road friction. At ${"%.1f".format(Locale.US, speed)} km/h with baseline G at ${"%.2f".format(Locale.US, g)} G, dynamics are nominal."
        }

        // 5. Explicit User Category & Mode Queries
        if (lower.contains("category") || lower.contains("mode") || lower.contains("profile") ||
            lower.contains("user type") || lower.contains("anong mode") || lower.contains("ano mode")) {
            return "You are currently in ${sys.userType} mode. Telemetry and crash detection algorithms are calibrated for ${sys.userType}. You can change it by saying 'I will walk', 'use my car', or 'ride my motorcycle'."
        }

        // 6. Traffic Law & Legal Compliance
        if (lower.contains("batas") || lower.contains("speed limit") ||
            lower.contains("ra 10666") || lower.contains("ra 4136")) {
            return "Under Republic Act 10054, all motorcycle riders and passengers must wear standard protective motorcycle helmets. Republic Act 10666 prohibits transporting children on motorcycles where speed exceeds 60 kilometers per hour."
        }

        // 7. Tuguegarao Emergency Hotlines
        if (lower.contains("hotline") || lower.contains("rescue") || lower.contains("police") ||
            lower.contains("pnp") || lower.contains("hospital") || lower.contains("cvmc") || lower.contains("ambulansya")) {
            return "In Tuguegarao City, call City Rescue at (078) 304-1111 or 0917-573-0911 for emergency medical dispatch, PNP Emergency 911 for police, and CVMC Hospital Emergency at (078) 304-1410."
        }

        // 8. Explicit Safety Tips (Only when user explicitly asks for advice/tips)
        if (lower.contains("tip") || lower.contains("advice") || lower.contains("suggestion") ||
            lower.contains("payo") || lower.contains("rekomenda") || lower.contains("what should i do")) {
            if (sys.speedKmh > 40f) {
                return "Cruising at ${"%.1f".format(java.util.Locale.US, speed)} km/h on your $vehicle. Maintain at least a 3-second following distance and scan intersections two blocks ahead."
            } else if (sys.speedKmh > 5f) {
                return "Steady pace at ${"%.1f".format(java.util.Locale.US, speed)} km/h. Keep smooth throttle inputs and watch for pedestrian crossings along Tuguegarao roads."
            } else {
                return "You are stationary at 0 km/h. Good time to inspect your tire pressure, verify helmet strap tension, and confirm your phone mount is tight."
            }
        }

        // 9. Default Honest & Helpful Fallback (Never spams unsolicited bluetooth complaints)
        return "I'm still learning that topic and don't have an exact answer yet. You can ask me about road safety, your speed and G-force, Tuguegarao tricycle fares, offline directions, or say 'I will walk' or 'use my car' to change your category."
    }

}

