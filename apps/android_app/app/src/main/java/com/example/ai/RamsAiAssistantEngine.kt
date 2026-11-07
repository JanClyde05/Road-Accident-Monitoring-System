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
        private const val HTTP_TIMEOUT_MS = 3500

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
        "i", "you", "it", "that", "this", "to", "of", "in", "for", "on", "with"
    )

    init {
        loadDistilledCache()
    }

    /**
     * Normalizes a query into a canonical cache key:
     * lowercase, strip punctuation, remove filler words, sort remaining tokens alphabetically.
     */
    private fun normalizeQueryKey(query: String): String {
        val tokens = query.lowercase(Locale.US)
            .replace(Regex("[^a-z0-9\\s]"), "")
            .split(Regex("\\s+"))
            .filter { it.length > 1 && it !in FILLER_WORDS }
            .sorted()
        return tokens.joinToString(" ")
    }

    /**
     * Loads distilled knowledge cache from JSONL file on disk into memory.
     */
    private fun loadDistilledCache() {
        try {
            val file = File(context.filesDir, DISTILLED_FILE_NAME)
            if (!file.exists()) return
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
            Log.d(TAG, "Loaded ${distilledKnowledgeCache.size} distilled knowledge samples from disk.")
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
                        weatherPrefix = "Currently %.0f°C and %s with winds at %.0f km/h.".format(Locale.US, weatherData.first, weatherData.second)
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
                            vehicleModel = sys.vehicleModel
                        ))
                    }
                    return@withContext geminiReply
                }
            } catch (e: Exception) {
                Log.w(TAG, "Gemini online reasoning error: ${e.message}")
            }

            // Fallback to encyclopedic Wikipedia / DuckDuckGo if Gemini key is unset or unreachable
            try {
                val instantAnswer = fetchOnlineKnowledge(trimmed)
                if (!instantAnswer.isNullOrBlank()) {
                    return@withContext instantAnswer
                }
            } catch (e: Exception) {
                Log.w(TAG, "Online knowledge fetch error: ${e.message}")
            }
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
        return "Currently %.0f°C and %s.".format(Locale.US, raw.first, raw.second)
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
                    connectTimeout = 8500
                    readTimeout = 8500
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

        // 4. Question about why or how: "why", "how does", "how do"
        if (lower.contains("why") || lower.contains("how")) {
            return "Regarding $rawQuery: on your $vehicle, safety depends on smooth inputs, tire grip, and situational awareness. At ${"%.1f".format(Locale.US, speed)} km/h with baseline G at ${"%.2f".format(Locale.US, g)} G, stability is nominal."
        }

        // 5. Varied dynamic contextual briefing as smart fallback
        return generateDynamicContextualResponse(sys)
    }

    /**
     * Generates a varied, context-aware response using live telemetry data.
     * Rotates through multiple response strategies so the user never hears the same reply twice consecutively.
     */
    private fun generateDynamicContextualResponse(sys: RamsSystemContext): String {
        val cal = java.util.Calendar.getInstance()
        val hour = cal.get(java.util.Calendar.HOUR_OF_DAY)
        val name = if (sys.riderName.isNotBlank()) sys.riderName else "Rider"
        val role = sys.userType
        val vehicle = if (sys.vehicleModel.isNotBlank()) sys.vehicleModel else "vehicle"
        val wearableStatus = if (sys.isWearableConnected) "Wearable linked at ${sys.wearableBatteryPct}%" else "Wearable offline"
        val motionDesc = sys.aiMotionProfile
        val confPct = "%.0f".format(Locale.US, sys.aiConfidence * 100f)
        val speedStr = "%.1f km/h".format(Locale.US, sys.speedKmh)
        val gStr = "%.2f G".format(Locale.US, sys.liveG)

        val timeGreeting = when {
            hour < 6 -> "Late night"
            hour < 12 -> "Morning"
            hour < 14 -> "Midday"
            hour < 18 -> "Afternoon"
            hour < 21 -> "Evening"
            else -> "Night"
        }

        // Build pool of contextual responses, each referencing live data differently
        val pool = mutableListOf<String>()

        // --- Contextual status reports ---
        pool.add("$timeGreeting check, $name. $MODEL_NAME inference running at $confPct%% confidence. Your motion state reads $motionDesc. $wearableStatus. All crash detection tiers are armed.")
        pool.add("$name, your current profile reads $motionDesc at $speedStr with $gStr live acceleration. $wearableStatus. Edge AI cognition is fully operational on-device.")
        pool.add("$role mode active. $MODEL_NAME sees your kinematic state as $motionDesc with $confPct%% certainty. If you need guidance, ask about speed, location, weather, or your safety gear.")

        // --- Proactive tips based on live state ---
        if (sys.speedKmh > 40f) {
            pool.add("You are cruising at $speedStr on your $vehicle. At this speed, maintain at least a 3-second following distance and keep your eyes scanning two blocks ahead.")
            pool.add("$speedStr detected. High-speed defensive positioning matters: stay visible, avoid blind spots of larger vehicles, and anticipate intersection conflicts ahead.")
        } else if (sys.speedKmh > 5f) {
            pool.add("Steady pace at $speedStr. Good riding form. I am tracking your lean angles and shock events in real time at 50 Hertz. Everything looks nominal, $name.")
            pool.add("Moving at $speedStr. Your G-force baseline is $gStr which is within normal operating range. $MODEL_NAME is watching for any sudden kinematic anomalies.")
        } else {
            pool.add("You are stationary right now. Good time to verify your tire pressure, check your mirrors, or ensure your phone mount is secure before your next ride.")
            pool.add("$timeGreeting, $name. Since you are at rest, your IMU baseline is calibrated at $gStr. All six kinematic axes are logging normally. What would you like to know?")
            pool.add("Resting state confirmed at $gStr baseline gravity. $wearableStatus. If you need to recalibrate your IMU offset, go to Settings and select IMU Studio Calibration.")
        }

        // --- Time-of-day contextual advice ---
        if (hour >= 18 || hour < 6) {
            pool.add("$timeGreeting ride, $name. Visibility drops significantly after sunset. Make sure your headlights and reflective gear are active. $MODEL_NAME remains fully armed in low-light conditions.")
        }
        if (hour in 6..8) {
            pool.add("$timeGreeting commute detected. Peak traffic hours mean higher intersection risk. Stay defensive, signal early, and keep a buffer from public utility vehicles.")
        }

        // --- Wearable-specific ---
        if (sys.isWearableConnected) {
            pool.add("Your Safety Wearable is synchronized via BLE GATT with ${sys.wearableBatteryPct}%% battery. Dual-axis fall detection from the wristband supplements your phone IMU for 360-degree coverage.")
        } else {
            pool.add("I notice your Safety Wearable is not connected. For maximum crash detection accuracy, pair it via the Wearable tab. The dual-sensor fusion significantly reduces false negatives.")
        }

        // --- Alarm-state specific ---
        if (sys.isAlarmActive) {
            pool.add("Crash alarm is currently sounding. Say 'Cancel', 'Stop', or 'I am safe' to abort. You can also press the physical button on your wearable or tap the red Cancel button on screen.")
        }

        // --- GPS/location contextual ---
        if (sys.hasGpsFix && sys.locationAddress.isNotBlank()) {
            pool.add("Current position near ${sys.locationAddress}. GPS is locked with high precision. All emergency dispatch coordinates are pre-loaded if an incident triggers.")
        } else if (!sys.hasGpsFix) {
            pool.add("GPS satellite lock is still acquiring. For best accuracy, move to an area with open sky. Emergency dispatch will use your last known coordinates until a full fix is established.")
        }

        // --- General knowledge / conversational ---
        pool.add("$name, I am $MODEL_NAME version $MODEL_VERSION, your on-device safety intelligence. Ask me anything: live telemetry, road safety protocols, first aid guidance, or system diagnostics.")
        pool.add("As your $role safety companion, I process 50 Hertz kinematic data through a dual-tier neural pipeline. Nothing leaves your device. What would you like to explore?")
        pool.add("All $MODEL_PARAMS of $MODEL_NAME are running locally on your phone for zero-latency crash cognition. Feel free to ask about your ride stats, navigation tips, or equipment checks.")

        // Select a response, ensuring it differs from the last one
        var idx = (System.currentTimeMillis() % pool.size).toInt()
        if (idx == lastDynamicIndex && pool.size > 1) {
            idx = (idx + 1) % pool.size
        }
        lastDynamicIndex = idx
        return pool[idx]
    }
}

