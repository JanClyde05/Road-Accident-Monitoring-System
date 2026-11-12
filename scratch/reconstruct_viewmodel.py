import subprocess

# 1. Get original clean RamsViewModel.kt from b83dc3c
out = subprocess.check_output(['git', 'show', 'b83dc3c:apps/android_app/app/src/main/java/com/example/viewmodel/RamsViewModel.kt'], text=True, encoding='utf-8')

# Ensure CRLF/LF consistency
content = out.replace('\r\n', '\n')

# 2. Add imports
needed_imports = """import com.example.ai.RamsAppActionHandler
import com.example.RamsNavTab
import java.util.Locale
import com.example.service.RamsForegroundService
import com.example.ui.overlay.RamsOverlayManager
import com.example.model.DestinationRoute
import android.location.Geocoder
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import org.json.JSONArray
import org.json.JSONObject
import kotlinx.coroutines.withContext
"""
target_import = "import androidx.lifecycle.viewModelScope\n"
content = content.replace(target_import, target_import + needed_imports)

# 3. Add Voice AI navigation flow, AppActionHandler, Destination Route, and Routing methods
routing_and_actions_code = """
  // Navigation flow triggered by Voice AI
  private val _activeNavTabFlow = MutableStateFlow<RamsNavTab?>(null)
  val activeNavTabFlow: StateFlow<RamsNavTab?> = _activeNavTabFlow.asStateFlow()

  fun consumeNavTab() {
    _activeNavTabFlow.value = null
  }

  // App Action Execution Engine
  val appActionHandler: RamsAppActionHandler = object : RamsAppActionHandler {
    override fun setTransitCategory(category: String): Boolean {
      setUserCategory(category, userInitiated = true)
      return true
    }

    override fun navigateToTab(tabName: String): Boolean {
      return try {
        val tab = RamsNavTab.valueOf(tabName.uppercase(Locale.US))
        _activeNavTabFlow.value = tab
        true
      } catch (_: Exception) {
        false
      }
    }

    override fun toggleDarkMode(): Boolean {
      toggleTheme()
      return true
    }

    override fun zeroImuCalibration(): Boolean {
      csvExportManager.imuCalibrationManager.resetToDefaults()
      phoneSensorEngine.setCrashThreshold(3.5f)
      return true
    }

    override fun toggleCsvRecording(): Boolean {
      toggleRecording()
      return true
    }

    override fun cancelEmergencyAlarm(): Boolean {
      cancelFalseAlarm()
      return true
    }

    override fun reconnectWearable(): Boolean {
      checkAndAutoConnectWearable()
      return true
    }

    override fun triggerSimulation(): Boolean {
      startSimulation()
      return true
    }

    override fun saveLearnedVoicePattern(query: String, response: String) {
      voiceAlarmCanceler.assistantEngine.learnVoicePattern(query, response)
    }

    override fun pinAndRouteToLocation(locationQuery: String): Boolean {
      this@RamsViewModel.pinAndRouteToLocation(locationQuery)
      return true
    }

    override fun clearMapRoute(): Boolean {
      this@RamsViewModel.clearMapRoute()
      return true
    }

    override fun compactMotionData(): Int {
      return sensorAiEngine.autoCompactLearnedPatterns()
    }
  }

  // Destination Navigation & Polyline Routing Flow
  private val _destinationRouteFlow = MutableStateFlow<DestinationRoute?>(null)
  val destinationRouteFlow: StateFlow<DestinationRoute?> = _destinationRouteFlow.asStateFlow()

  fun clearMapRoute() {
    _destinationRouteFlow.value = null
  }

  fun compactAllLearnedData(): Pair<Int, Int> {
    val motionPruned = sensorAiEngine.autoCompactLearnedPatterns()
    val voicePruned = voiceAlarmCanceler.assistantEngine.autoCompactDistilledKnowledge()
    return Pair(motionPruned, voicePruned)
  }

  fun pinAndRouteToLocation(locationQuery: String) {
    viewModelScope.launch(Dispatchers.IO) {
      val (destLat, destLon, resolvedName) = resolveLocationCoordinates(locationQuery)
      val userLat = if (gpsState.value.hasFix) gpsState.value.latitude else 17.6132
      val userLon = if (gpsState.value.hasFix) gpsState.value.longitude else 121.7270

      val route = fetchOsrmRoute(userLat, userLon, destLat, destLon, resolvedName)
      withContext(Dispatchers.Main) {
        _destinationRouteFlow.value = route
        _activeNavTabFlow.value = RamsNavTab.MAP
      }
    }
  }

  private fun resolveLocationCoordinates(query: String): Triple<Double, Double, String> {
    var q = query.lowercase(Locale.US).trim()
    val prefixes = listOf(
      "and route to ", "and route ", "please route to ", "please route ", "route to ", "route ",
      "navigate to ", "navigate ", "directions to ", "direction to ", "take me to ", "show route to ",
      "pin and route to ", "pin to ", "pin ", "go to ", "lead me to ",
      "punta sa ", "punta tayo sa ", "dalhin mo ako sa ", "paano pumunta sa ", "how to go to ",
      "papunta sa ", "papuntang "
    )
    for (p in prefixes) {
      if (q.startsWith(p)) {
        q = q.removePrefix(p).trim()
        break
      }
    }
    val suffixes = listOf(
      " on my map", " on the map", " on my phone", " on map", " on the app",
      " please", " sa mapa", " sa phone", " sa app"
    )
    for (s in suffixes) {
      if (q.endsWith(s)) {
        q = q.removeSuffix(s).trim()
        break
      }
    }
    q = com.example.ai.TuguegaraoOfflineSpatialEngine.normalizeLocalPhonetics(q)

    // 1. Authoritative Tuguegarao Offline Landmark Dictionary (SM City, MCNP, Robinsons, etc.)
    val landmark = com.example.ai.TuguegaraoOfflineSpatialEngine.findTargetLandmark(q)
    if (landmark != null) {
      android.util.Log.i("RAMS_Route", "Resolved landmark via TuguegaraoOfflineSpatialEngine: ${landmark.name} (${landmark.lat}, ${landmark.lon})")
      return Triple(landmark.lat, landmark.lon, landmark.name)
    }

    // 2. Android System Geocoder with Tuguegarao / Cagayan Context
    val candidateQueries = listOf(
      "$q, Tuguegarao City, Cagayan, Philippines",
      "$q, Tuguegarao, Cagayan",
      q
    )
    for (cand in candidateQueries) {
      try {
        val geocoder = Geocoder(getApplication<Application>().applicationContext, Locale.US)
        @Suppress("DEPRECATION")
        val addresses = geocoder.getFromLocationName(cand, 1)
        if (!addresses.isNullOrEmpty()) {
          val addr = addresses[0]
          val name = addr.featureName ?: q.replaceFirstChar { it.uppercase() }
          android.util.Log.i("RAMS_Route", "Resolved address via Geocoder: $name (${addr.latitude}, ${addr.longitude})")
          return Triple(addr.latitude, addr.longitude, name)
        }
      } catch (_: Exception) {}
    }

    // 3. Online OpenStreetMap Nominatim Fallback (Strictly road/place geocoding)
    try {
      val encodedQ = URLEncoder.encode("$q, Tuguegarao, Cagayan", "UTF-8")
      val nomUrl = "https://nominatim.openstreetmap.org/search?q=$encodedQ&format=json&limit=1"
      val conn = URL(nomUrl).openConnection() as HttpURLConnection
      conn.connectTimeout = 4000
      conn.readTimeout = 4000
      conn.setRequestProperty("User-Agent", "RAMS-Road-Safety-Assistant/2.5 (Android)")
      if (conn.responseCode == 200) {
        val res = conn.inputStream.bufferedReader().use { it.readText() }
        val arr = JSONArray(res)
        if (arr.length() > 0) {
          val item = arr.getJSONObject(0)
          val lat = item.getDouble("lat")
          val lon = item.getDouble("lon")
          val name = item.optString("name", q.replaceFirstChar { it.uppercase() })
          android.util.Log.i("RAMS_Route", "Resolved address via OSM Nominatim: $name ($lat, $lon)")
          return Triple(lat, lon, name)
        }
      }
    } catch (_: Exception) {}

    // Fallback: If not found, use Tuguegarao Centro without misleading random offset
    val defaultLat = 17.6132
    val defaultLon = 121.7270
    val label = q.replaceFirstChar { it.uppercase() }
    android.util.Log.w("RAMS_Route", "Location '$q' not matched in dictionary; defaulting to Centro Tuguegarao")
    return Triple(defaultLat, defaultLon, "$label (Centro)")
  }

  private fun fetchOsrmRoute(userLat: Double, userLon: Double, destLat: Double, destLon: Double, label: String): DestinationRoute {
    val endpoints = listOf(
      String.format(Locale.US, "https://router.project-osrm.org/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=full&geometries=geojson", userLon, userLat, destLon, destLat),
      String.format(Locale.US, "https://routing.openstreetmap.de/routed-car/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=full&geometries=geojson", userLon, userLat, destLon, destLat)
    )

    for (urlStr in endpoints) {
      try {
        val conn = URL(urlStr).openConnection() as HttpURLConnection
        conn.connectTimeout = 6000
        conn.readTimeout = 8000
        conn.requestMethod = "GET"
        conn.setRequestProperty("User-Agent", "RAMS-Road-Safety-Assistant/2.5 (Android; DOST-ASTI)")
        conn.setRequestProperty("Accept", "application/json")
        if (conn.responseCode == 200) {
          val jsonStr = conn.inputStream.bufferedReader().use { it.readText() }
          val root = JSONObject(jsonStr)
          val routes = root.optJSONArray("routes")
          if (routes != null && routes.length() > 0) {
            val first = routes.getJSONObject(0)
            val distMeters = first.optDouble("distance", 0.0).toFloat()
            val durationSec = first.optDouble("duration", 0.0).toFloat()
            val geom = first.optJSONObject("geometry")
            val coords = geom?.optJSONArray("coordinates")
            if (coords != null && coords.length() > 0) {
              val polylinePoints = StringBuilder("[")
              for (i in 0 until coords.length()) {
                val pt = coords.getJSONArray(i)
                val lon = pt.getDouble(0)
                val lat = pt.getDouble(1)
                if (i > 0) polylinePoints.append(",")
                polylinePoints.append(String.format(Locale.US, "[%.6f,%.6f]", lat, lon))
              }
              polylinePoints.append("]")
              android.util.Log.i("RAMS_Route", "Resolved ${coords.length()} turn-by-turn road waypoints (${distMeters / 1000f} km) via $urlStr")
              return DestinationRoute(
                destinationName = label,
                destLat = destLat,
                destLon = destLon,
                waypointsJson = polylinePoints.toString(),
                distanceKm = distMeters / 1000f,
                durationMin = durationSec / 60f
              )
            }
          }
        }
      } catch (e: Exception) {
        android.util.Log.w("RAMS_Route", "OSRM request failed ($urlStr): ${e.message}")
      }
    }

    // Offline Tuguegarao arterial road network graph (Dijkstra-routed strictly along streets and highways)
    return generateOfflineTuguegaraoRoadRoute(userLat, userLon, destLat, destLon, label)
  }

  private fun generateOfflineTuguegaraoRoadRoute(userLat: Double, userLon: Double, destLat: Double, destLon: Double, label: String): DestinationRoute {
    val roadNodes = mapOf(
      "csucarig" to Pair(17.65905, 121.75318),
      "carignorte_jct" to Pair(17.65350, 121.74850),
      "cvmc_jct" to Pair(17.65661, 121.74702),
      "caggay_jct" to Pair(17.64500, 121.75000),
      "capitol_jct" to Pair(17.64848, 121.76037),
      "mcnp_jct" to Pair(17.64210, 121.76150),
      "airport_jct" to Pair(17.63800, 121.74100),
      "airport_term" to Pair(17.64374, 121.73407),
      "pengueruyu_jct" to Pair(17.63200, 121.73950),
      "robinsons_tanza" to Pair(17.62806, 121.73350),
      "dondomingo_jct" to Pair(17.62499, 121.73296),
      "smcity_bagay" to Pair(17.62805, 121.71890),
      "caritan_jct" to Pair(17.62200, 121.72200),
      "ucv_balzain" to Pair(17.62402, 121.72871),
      "usl_mabini" to Pair(17.61016, 121.72327),
      "spup_mabini" to Pair(17.61733, 121.72351),
      "smcenter_luna" to Pair(17.61275, 121.72379),
      "cathedral_rizal" to Pair(17.61359, 121.73050),
      "centro_gomez" to Pair(17.61449, 121.72806),
      "buntun_hwy" to Pair(17.61360, 121.70500),
      "buntun_bridge" to Pair(17.61437, 121.68643)
    )

    val roadEdges = listOf(
      Pair("csucarig", "carignorte_jct"),
      Pair("carignorte_jct", "cvmc_jct"),
      Pair("cvmc_jct", "caggay_jct"),
      Pair("caggay_jct", "airport_jct"),
      Pair("airport_jct", "pengueruyu_jct"),
      Pair("pengueruyu_jct", "robinsons_tanza"),
      Pair("robinsons_tanza", "dondomingo_jct"),
      Pair("caggay_jct", "capitol_jct"),
      Pair("capitol_jct", "mcnp_jct"),
      Pair("airport_jct", "airport_term"),
      Pair("carignorte_jct", "smcity_bagay"),
      Pair("smcity_bagay", "caritan_jct"),
      Pair("caritan_jct", "spup_mabini"),
      Pair("dondomingo_jct", "ucv_balzain"),
      Pair("ucv_balzain", "caritan_jct"),
      Pair("dondomingo_jct", "cathedral_rizal"),
      Pair("cathedral_rizal", "centro_gomez"),
      Pair("centro_gomez", "smcenter_luna"),
      Pair("smcenter_luna", "usl_mabini"),
      Pair("smcenter_luna", "spup_mabini"),
      Pair("usl_mabini", "spup_mabini"),
      Pair("spup_mabini", "buntun_hwy"),
      Pair("buntun_hwy", "buntun_bridge")
    )

    fun nodeDist(p1: Pair<Double, Double>, p2: Pair<Double, Double>): Double {
      val dLat = (p2.first - p1.first) * 111.0
      val dLon = (p2.second - p1.second) * 105.0
      return kotlin.math.sqrt(dLat * dLat + dLon * dLon)
    }

    val adj = mutableMapOf<String, MutableList<Pair<String, Double>>>()
    for (k in roadNodes.keys) adj[k] = mutableListOf()
    for (edge in roadEdges) {
      val p1 = roadNodes[edge.first] ?: continue
      val p2 = roadNodes[edge.second] ?: continue
      val d = nodeDist(p1, p2)
      adj[edge.first]?.add(Pair(edge.second, d))
      adj[edge.second]?.add(Pair(edge.first, d))
    }

    val userPt = Pair(userLat, userLon)
    val destPt = Pair(destLat, destLon)
    var startNode = "centro_gomez"
    var minDistStart = Double.MAX_VALUE
    for ((name, pt) in roadNodes) {
      val d = nodeDist(userPt, pt)
      if (d < minDistStart) {
        minDistStart = d
        startNode = name
      }
    }
    var endNode = "centro_gomez"
    var minDistEnd = Double.MAX_VALUE
    for ((name, pt) in roadNodes) {
      val d = nodeDist(destPt, pt)
      if (d < minDistEnd) {
        minDistEnd = d
        endNode = name
      }
    }

    val distances = mutableMapOf<String, Double>()
    val previous = mutableMapOf<String, String>()
    val unvisited = roadNodes.keys.toMutableSet()
    for (k in roadNodes.keys) distances[k] = Double.MAX_VALUE
    distances[startNode] = 0.0

    while (unvisited.isNotEmpty()) {
      val current = unvisited.minByOrNull { distances[it] ?: Double.MAX_VALUE } ?: break
      if (distances[current] == Double.MAX_VALUE || current == endNode) break
      unvisited.remove(current)

      for ((neighbor, weight) in adj[current] ?: emptyList()) {
        if (neighbor in unvisited) {
          val alt = (distances[current] ?: Double.MAX_VALUE) + weight
          if (alt < (distances[neighbor] ?: Double.MAX_VALUE)) {
            distances[neighbor] = alt
            previous[neighbor] = current
          }
        }
      }
    }

    val path = mutableListOf<String>()
    var curr: String? = endNode
    while (curr != null) {
      path.add(0, curr)
      curr = previous[curr]
    }
    if (path.isEmpty() || path[0] != startNode) {
      path.clear()
      path.add(startNode)
      if (startNode != endNode) path.add(endNode)
    }

    val waypoints = mutableListOf<Pair<Double, Double>>()
    waypoints.add(userPt)
    for (nodeName in path) {
      roadNodes[nodeName]?.let { waypoints.add(it) }
    }
    waypoints.add(destPt)

    val sb = StringBuilder("[")
    var totalDistKm = 0f
    for (i in waypoints.indices) {
      if (i > 0) {
        sb.append(",")
        val prev = waypoints[i - 1]
        val c = waypoints[i]
        totalDistKm += nodeDist(prev, c).toFloat()
      }
      sb.append(String.format(Locale.US, "[%.6f,%.6f]", waypoints[i].first, waypoints[i].second))
    }
    sb.append("]")

    val estTimeMin = (totalDistKm / 35.0f * 60.0f).coerceAtLeast(1.0f)
    android.util.Log.i("RAMS_Route", "Synthesized Tuguegarao arterial road route: ${path.joinToString(" -> ")} ($totalDistKm km)")
    return DestinationRoute(
      destinationName = label,
      destLat = destLat,
      destLon = destLon,
      waypointsJson = sb.toString(),
      distanceKm = totalDistKm,
      durationMin = estTimeMin
    )
  }
"""

# Place routing_and_actions_code right after _searchQuery declaration
target_search = "  val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()\n"
content = content.replace(target_search, target_search + routing_and_actions_code)

# 4. In init {}, wire up overlay manager and auto category classifier
init_target = """    // Explicitly start background wake-word listener (VoiceAlarmCanceler no longer auto-starts in init{})
    voiceAlarmCanceler.startListeningForCancel(promptDirectly = false)
  }"""

init_replacement = """    // Connect RamsOverlayManager listeners
    RamsOverlayManager.onActionCommandListener = { action ->
      when (action) {
        "CANCEL_ALARM" -> cancelFalseAlarm()
        "SET_CATEGORY_WALK" -> {
          appActionHandler.setTransitCategory("Pedestrian")
          voiceAlarmCanceler.speak("Switched to Pedestrian mode.")
          RamsOverlayManager.showVoiceOverlay("MODE CHANGED", "Switched to Pedestrian mode. Fall detection armed.", VoiceAlarmCanceler.VoiceEngineState.COMMAND_SPOTTED)
        }
        "SET_CATEGORY_MOTORCYCLE" -> {
          appActionHandler.setTransitCategory("Motorcycle Rider")
          voiceAlarmCanceler.speak("Switched to Motorcycle Rider mode.")
          RamsOverlayManager.showVoiceOverlay("MODE CHANGED", "Switched to Motorcycle Rider mode. High-G crash algorithms armed.", VoiceAlarmCanceler.VoiceEngineState.COMMAND_SPOTTED)
        }
        "NAV_MAP" -> appActionHandler.navigateToTab("MAP")
        "NAV_TELEMETRY" -> appActionHandler.navigateToTab("TELEMETRY")
      }
    }

    RamsOverlayManager.onMicTappedListener = {
      voiceAlarmCanceler.restartListeningForCommand()
    }
    RamsOverlayManager.onAlarmCancelledListener = {
      cancelFalseAlarm()
    }

    // Explicitly start background wake-word listener (VoiceAlarmCanceler no longer auto-starts in init{})
    voiceAlarmCanceler.startListeningForCancel(promptDirectly = false)

    // Wire voice category change commands to persist rider profile
    voiceAlarmCanceler.onCategoryChangeRequested = { category, _ ->
      setUserCategory(category, userInitiated = true)
    }

    // Automatic kinematic category classifier (walking vs car vs motorcycle vs bicycle)
    viewModelScope.launch {
      combine(
        sensorAiEngine.cognitionFlow,
        phoneSensorEngine.phoneGpsState
      ) { cognition, gps -> Pair(cognition, gps) }
        .collect { (cognition, gps) ->
          try {
            autoCategoryClassifier.ingestSample(cognition.movement, gps.speedKmh)
          } catch (_: Exception) {}
        }
    }
  }"""

content = content.replace(init_target, init_replacement)

# 5. In triggerEmergencyCrashAlarm, update countdown and overlay
crash_alarm_target = """    // 1. Start continuous audio siren & vibration loop
    alarmSoundEngine.startEmergencyAlarm(viewModelScope)

    // 2. Countdown loop
    alarmCountdownJob?.cancel()
    alarmCountdownJob = viewModelScope.launch {
      for (sec in 10 downTo 1) {
        _alarmCountdownSeconds.value = sec
        delay(1000)
      }
      _alarmCountdownSeconds.value = 0
    }"""

crash_alarm_replacement = """    // 1. Start continuous audio siren & vibration loop in pre-alarm warning mode
    alarmSoundEngine.setCountdownPhase(true)
    alarmSoundEngine.startEmergencyAlarm(viewModelScope)

    // 2. Countdown loop
    alarmCountdownJob?.cancel()
    alarmCountdownJob = viewModelScope.launch {
      for (sec in 10 downTo 1) {
        _alarmCountdownSeconds.value = sec
        RamsOverlayManager.updateAlarmCountdown(sec)
        delay(1000)
      }
      _alarmCountdownSeconds.value = 0
      alarmSoundEngine.setCountdownPhase(false)
    }"""

content = content.replace(crash_alarm_target, crash_alarm_replacement)

crash_prompt_target = """    // 5. Open Voice Assistant bubble asking what to do next
    voiceAlarmCanceler.startListeningForCancel(promptDirectly = true)
  }"""

crash_prompt_replacement = """    // 5. Open Voice Assistant bubble asking what to do next
    voiceAlarmCanceler.startListeningForCancel(promptDirectly = true)
    if (RamsOverlayManager.canDrawOverlays(getApplication<Application>())) {
      RamsOverlayManager.showAlarmOverlay(countdownSeconds = 10)
    }
  }"""

content = content.replace(crash_prompt_target, crash_prompt_replacement)

# 6. In cancelFalseAlarm, hide overlay and learn false alarm pattern
cancel_target = """  fun cancelFalseAlarm() {
    alarmSoundEngine.duckVolume(false)
    alarmSoundEngine.stopEmergencyAlarm()
    alarmCountdownJob?.cancel()
    alarmCountdownJob = null
    _isAlarmActive.value = false
    _alarmCountdownSeconds.value = 0
    voiceAlarmCanceler.setAlarmActiveState(false)

    // Restart wake-word engine so rider can speak immediately after cancelling
    if (voiceAlarmCanceler.isWakeWordActive()) {
      voiceAlarmCanceler.scheduleRestart(600L)
    }

    csvExportManager.imuCalibrationManager.recordFalseAlarmSuppressed("False alarm dismissed by rider via mobile app / voice command / wearable physical button")"""

cancel_replacement = """  fun cancelFalseAlarm() {
    RamsOverlayManager.hideOverlay()
    alarmSoundEngine.duckVolume(false)
    alarmSoundEngine.stopEmergencyAlarm()
    alarmCountdownJob?.cancel()
    alarmCountdownJob = null
    _isAlarmActive.value = false
    _alarmCountdownSeconds.value = 0
    voiceAlarmCanceler.setAlarmActiveState(false)

    // Restart wake-word engine so rider can speak immediately after cancelling
    if (voiceAlarmCanceler.isWakeWordActive()) {
      voiceAlarmCanceler.scheduleRestart(600L)
    }

    val learnedPattern = sensorAiEngine.learnFalseAlarmPattern(
      speedKmh = gpsState.value.speedKmh,
      notes = "Dismissed by rider via mobile app / voice command / wearable physical button"
    )
    if (learnedPattern != null) {
      csvExportManager.imuCalibrationManager.recordFalseAlarmSuppressed(
        "Adaptive AI learned false alarm #${learnedPattern.id} (Peak %.2fG, %.1f° tilt, %.0f km/h, seen %dx)".format(
          learnedPattern.maxSvmG, learnedPattern.tiltDeltaDeg, learnedPattern.preSpeedKmh, learnedPattern.occurrences
        )
      )
    } else {
      csvExportManager.imuCalibrationManager.recordFalseAlarmSuppressed("False alarm dismissed by rider via mobile app / voice command / wearable physical button")
    }"""

content = content.replace(cancel_target, cancel_replacement)

# 7. In saveRiderProfile, set voice preference
save_profile_target = """  fun saveRiderProfile(profile: RiderProfile) {
    _riderProfile.value = profile
    // Persist to SharedPreferences so data survives app restarts
    profile.saveToPreferences(getApplication<Application>().applicationContext)
  }"""

save_profile_replacement = """  fun saveRiderProfile(profile: RiderProfile) {
    _riderProfile.value = profile
    // Persist to SharedPreferences so data survives app restarts
    profile.saveToPreferences(getApplication<Application>().applicationContext)
    voiceAlarmCanceler.setVoicePreference(profile.ttsVoicePreference)
  }"""

content = content.replace(save_profile_target, save_profile_replacement)

# 8. Add setUserCategory and autoCategoryClassifier if missing
if "fun setUserCategory" not in content:
    cat_code = """
  // User category classification helper
  fun setUserCategory(category: String, userInitiated: Boolean = false) {
    val ctx = getApplication<Application>().applicationContext
    val updated = _riderProfile.value.copy(userType = category)
    _riderProfile.value = updated
    updated.saveToPreferences(ctx)
  }

  val autoCategoryClassifier = object {
    fun ingestSample(movement: String, speedKmh: Float) {
      val inferred = inferCategoryFromKinematics(movement, speedKmh) ?: return
      val current = _riderProfile.value.userType
      if (!current.equals(inferred, ignoreCase = true)) {
        setUserCategory(inferred, userInitiated = false)
      }
    }

    private fun inferCategoryFromKinematics(movement: String, speedKmh: Float): String? {
      val m = movement.uppercase(Locale.US)
      return when {
        speedKmh > 65f -> "Car Driver"
        speedKmh in 25f..65f && (m.contains("LEAN") || m.contains("CORNER") || m.contains("SWERVE")) -> "Motorcycle Rider"
        speedKmh in 8f..28f && (m.contains("PEDAL") || m.contains("BICYCLE")) -> "Cyclist"
        speedKmh in 12f..35f && m.contains("VIBRATION") -> "Tricycle"
        speedKmh < 9f && (m.contains("WALK") || m.contains("STRIDE") || m.contains("STATIONARY") || m.contains("NORMAL")) -> "Pedestrian"
        else -> null
      }
    }
  }
"""
    content = content.replace("  fun saveRiderProfile(profile: RiderProfile)", cat_code + "\n  fun saveRiderProfile(profile: RiderProfile)")

with open("apps/android_app/app/src/main/java/com/example/viewmodel/RamsViewModel.kt", "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("Reconstructed RamsViewModel.kt successfully.")

