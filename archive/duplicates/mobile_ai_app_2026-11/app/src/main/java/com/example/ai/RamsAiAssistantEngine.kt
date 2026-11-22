package com.example.ai

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.Locale

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
        val trimmed = query.trim()
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

        if (lower.contains("where am i") || lower.contains("location") || lower.contains("coordinates") || lower.contains("address")) {
            return@withContext if (sys.locationAddress.isNotBlank()) {
                "You are near ${sys.locationAddress}."
            } else if (sys.hasGpsFix) {
                "You are at coordinates latitude %.4f, longitude %.4f.".format(Locale.US, sys.latitude, sys.longitude)
            } else {
                "GPS fix is acquiring. Move under an open sky to establish high-precision satellite lock."
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

        // 6. GENERAL ASSISTANT KNOWLEDGE INTENTS (Online DuckDuckGo / Wikipedia API)
        if (isOnline()) {
            try {
                val instantAnswer = fetchOnlineKnowledge(trimmed)
                if (!instantAnswer.isNullOrBlank()) {
                    return@withContext instantAnswer
                }
            } catch (e: Exception) {
                Log.w(TAG, "Online knowledge fetch error: ${e.message}")
            }
        }

        // 7. OFFLINE INTELLIGENT EXPERT KNOWLEDGE
        return@withContext generateOfflineIntelligentResponse(lower, sys)
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
     * Resilient offline knowledge and conversational response generator.
     */
    private fun generateOfflineIntelligentResponse(lower: String, sys: RamsSystemContext): String {
        val role = sys.userType.lowercase(Locale.US)
        val vehicle = if (sys.vehicleModel.isNotBlank()) sys.vehicleModel else "vehicle"
        val name = if (sys.riderName.isNotBlank()) ", ${sys.riderName}" else ""

        return when {
            lower.contains("who are you") || lower.contains("what is rams") -> {
                "I am RAMS, your Intelligent Multi-Tier Safety Companion. I monitor your 6-axis kinematics in real time to guard you against accidents, provide technical guidance, and suppress false alarms."
            }
            lower.contains("hello") || lower.contains("hi") || lower.contains("hey") -> {
                val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
                val greeting = when {
                    hour < 12 -> "Good morning"
                    hour < 18 -> "Good afternoon"
                    else -> "Good evening"
                }
                "$greeting$name! All safety systems are armed for your role as ${sys.userType}. How can I assist you today?"
            }
            lower.contains("thank") -> {
                "You are welcome$name! Stay alert on the road and stay safe."
            }
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
            lower.contains("countersteering") || lower.contains("counter steering") || lower.contains("how to turn") -> {
                "Countersteering is the physical technique used to turn a two-wheeler at speeds above 15 km/h: gently push forward on the handlebar in the direction you wish to turn to initiate vehicle lean angle."
            }
            lower.contains("abs") || lower.contains("anti lock") || lower.contains("braking") || lower.contains("how to brake") -> {
                "Anti-lock Braking Systems prevent wheels from locking during emergency deceleration, allowing steering control. In emergencies, apply both front and rear brakes firmly in a straight line without grabbing."
            }
            lower.contains("blind spot") || lower.contains("mirror") || lower.contains("lane change") -> {
                "Never linger in vehicle blind spots, particularly heavy trucks. Always perform a quick shoulder check over your chin before initiating any lane transition."
            }
            lower.contains("tire pressure") || lower.contains("psi") || lower.contains("tires") -> {
                "Check tire pressure when cold. Standard underbone and scooter pressures are 29 PSI front and 33 PSI rear. Correct pressure prevents rim pinch flats on potholes and preserves cornering grip."
            }
            lower.contains("chain") || lower.contains("maintenance") -> {
                "Clean and lubricate your motorcycle chain every 500 kilometers with dedicated chain lube. Maintain 20 to 30 millimeters of vertical chain slack to prevent transmission bearing wear."
            }
            lower.contains("pothole") || lower.contains("speed bump") || lower.contains("bump") -> {
                "RAMS Edge AI filters out vertical pothole shocks up to 4.5 G with zero tilt delta, safely suppressing false 911 alarms while keeping critical crash triggers armed."
            }
            lower.contains("help") || lower.contains("commands") || lower.contains("what can you do") -> {
                "You can ask me about your speed, G-force, location, weather, profile details, how to edit your role, where to find credits, or how to connect your Safety Wearable. How can I help?"
            }
            else -> {
                "I am actively guarding your ride as ${sys.userType}. You can ask about your speed, G-force, wearable connection, profile, or say 'Cancel' to abort an alarm."
            }
        }
    }
}

