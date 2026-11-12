package com.example.viewmodel

import android.annotation.SuppressLint
import android.app.Application
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.ai.RamsAppActionHandler
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
import com.example.ai.DeveloperTrainingSuite
import com.example.ai.SensorAiInferenceEngine
import com.example.ai.VoiceAlarmCanceler
import com.example.audio.AlarmSoundEngine
import com.example.connectivity.Esp32ConnectionManager
import com.example.export.CsvExportManager
import com.example.model.AccidentClassification
import com.example.model.ConnectionType
import com.example.model.DeviceLinkStatus
import com.example.model.GpsData
import com.example.model.ImuData
import com.example.model.IncidentEvent
import com.example.model.IncidentType
import com.example.model.RiderProfile
import com.example.sensor.PhoneSensorEngine
import com.example.sync.Esp32SyncEngine
import com.example.sync.Esp32SyncStatus
import com.example.sync.SyncTransport
import kotlinx.coroutines.Job
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.isActive
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

class RamsViewModel(application: Application) : AndroidViewModel(application) {

  // Phone Physical Hardware Sensors
  val phoneSensorEngine = PhoneSensorEngine(application.applicationContext, viewModelScope)

  // Wearable Sync & Emergency Uplink Engine (WebSocket / TCP / Bluetooth Classic & BLE)
  val esp32SyncEngine = Esp32SyncEngine(viewModelScope, application.applicationContext)

  // Internal Fallback manager
  private val simulatedConnectionManager = Esp32ConnectionManager(viewModelScope)

  // CSV Logger & Exporter
  val csvExportManager = CsvExportManager(application.applicationContext)

  // Intelligent Edge AI Engine (Dual-Tier LiteRT + SLM Reasoning for IECEP Nationals)
  val sensorAiEngine = SensorAiInferenceEngine(application.applicationContext, viewModelScope)

  // Live telemetry and status snapshot provider for RAMS Voice AI Assistant
  val systemContext: com.example.ai.RamsSystemContext
    get() {
      val gps = gpsState.value
      val imu = imuState.value
      val link = linkStatus.value
      val profile = _riderProfile.value
      val aiResult = sensorAiEngine.tier1ResultFlow.value
      return com.example.ai.RamsSystemContext(
        speedKmh = gps.speedKmh,
        liveG = imu.aMag,
        peakG = _peakAMag.value,
        latitude = gps.latitude,
        longitude = gps.longitude,
        locationAddress = gps.locationAddress,
        hasGpsFix = gps.hasFix,
        isWearableConnected = link.isConnected,
        wearableName = link.bluetoothName ?: "RAMS Wearable",
        wearableBatteryPct = link.batteryPct,
        riderName = profile.riderName,
        userType = profile.userType,
        plateNumber = profile.plateNumber,
        vehicleModel = profile.vehicleModel,
        bloodType = profile.bloodType,
        allergies = profile.allergies,
        emergencyContactName = profile.emergencyContactName,
        emergencyContactPhone = profile.emergencyContactPhone,
        token = profile.token,
        aiMotionProfile = aiResult?.motionProfile?.displayName ?: "Resting Upright",
        aiConfidence = aiResult?.confidence ?: 0.99f,
        isAlarmActive = _isAlarmActive.value,
        alarmCountdownSec = _alarmCountdownSeconds.value
      )
    }

  // Offline Custom Wake-Word & Online Conversational AI Assistant
  val voiceAlarmCanceler = VoiceAlarmCanceler(
    context = application.applicationContext,
    scope = viewModelScope,
    getSystemContext = { systemContext },
    onAlarmCancelledByVoice = { _, _ -> cancelFalseAlarm() }
  )

  // Distilled Knowledge Base accessors (Gemini-teaches-RAMS pipeline)
  fun getDistilledSampleCount(): Int = voiceAlarmCanceler.assistantEngine.getDistilledSampleCount()
  fun getDistilledSamples() = voiceAlarmCanceler.assistantEngine.getDistilledSamples()
  fun exportDistilledKnowledgeJson(): String = voiceAlarmCanceler.assistantEngine.exportDistilledKnowledgeJson()

  // Emergency Siren & Vibration Audio Engine (Continuous loop until canceled)
  val alarmSoundEngine = AlarmSoundEngine(application.applicationContext)

  // Active Emergency Alarm State
  private val _isAlarmActive = MutableStateFlow(false)
  val isAlarmActive: StateFlow<Boolean> = _isAlarmActive.asStateFlow()

  private val _alarmCountdownSeconds = MutableStateFlow(0)
  val alarmCountdownSeconds: StateFlow<Int> = _alarmCountdownSeconds.asStateFlow()

  private var alarmCountdownJob: Job? = null

  // In-App Developer Training Suite (Ground Truth Data Collector & Simulation Mode)
  val devTrainingSuite = DeveloperTrainingSuite(application.applicationContext, viewModelScope)

  // Master AI classification toggle
  private val _aiClassificationEnabled = MutableStateFlow(true)
  val aiClassificationEnabled: StateFlow<Boolean> = _aiClassificationEnabled.asStateFlow()

  fun setAiClassificationEnabled(enabled: Boolean) {
    _aiClassificationEnabled.value = enabled
  }

  // Rider Profile & Registration State (Persisted in SharedPreferences)
  private val _riderProfile = MutableStateFlow(RiderProfile.loadFromPreferences(application.applicationContext))
  val riderProfile: StateFlow<RiderProfile> = _riderProfile.asStateFlow()

  // Nearby Incidents on Map toggle (Default: OFF / false)
  val showNearbyIncidents: StateFlow<Boolean> = _riderProfile.map { it.showNearbyIncidents }
    .stateIn(viewModelScope, SharingStarted.Eagerly, false)

  // Use real phone sensors by default
  private val _usePhoneSensors = MutableStateFlow(true)
  val usePhoneSensors: StateFlow<Boolean> = _usePhoneSensors.asStateFlow()

  // Dynamic active sensor states (Phone Hardware)
  val gpsState: StateFlow<GpsData> = combine(
    _usePhoneSensors,
    phoneSensorEngine.phoneGpsState,
    simulatedConnectionManager.gpsState
  ) { usePhone, phoneGps, simGps ->
    if (usePhone) phoneGps else simGps
  }.stateIn(viewModelScope, SharingStarted.Eagerly, phoneSensorEngine.phoneGpsState.value)

  val imuState: StateFlow<ImuData> = combine(
    _usePhoneSensors,
    phoneSensorEngine.phoneImuState,
    simulatedConnectionManager.imuState
  ) { usePhone, phoneImu, simImu ->
    if (usePhone) phoneImu else simImu
  }.stateIn(viewModelScope, SharingStarted.Eagerly, phoneSensorEngine.phoneImuState.value)

  val linkStatus: StateFlow<DeviceLinkStatus> = combine(
    _usePhoneSensors,
    esp32SyncEngine.syncStatus,
    simulatedConnectionManager.linkStatus,
    _riderProfile
  ) { usePhone, sync, simLink, profile ->
    if (usePhone) {
      val connType = when (sync.transport) {
        SyncTransport.WEBSOCKET -> ConnectionType.WEBSOCKET
        SyncTransport.WIFI_TCP -> ConnectionType.WIFI_SOCKET
        SyncTransport.BLUETOOTH_SPP -> ConnectionType.BLUETOOTH_SPP
        SyncTransport.STANDALONE_LOGGER -> ConnectionType.SIMULATION
      }
      DeviceLinkStatus(
        isConnected = sync.isSyncActive,
        connectionType = connType,
        pingLatencyMs = 8L,
        packetRateHz = sync.syncRateHz,
        batteryPct = 94,
        batteryVoltage = 4.10f,
        deviceToken = profile.token,
        firmwareVersion = "RAMS-SAFETY-CLIENT v3.2",
        ipAddress = sync.esp32Ip,
        port = sync.esp32Port,
        wsUrl = sync.esp32WsUrl,
        bluetoothName = sync.btDeviceName,
        bluetoothMac = sync.btMacAddress
      )
    } else {
      simLink.copy(deviceToken = profile.token)
    }
  }.stateIn(viewModelScope, SharingStarted.Eagerly, DeviceLinkStatus())

  val syncStatus: StateFlow<Esp32SyncStatus> = esp32SyncEngine.syncStatus

  // Waveform buffer for IMU sparklines (last 50 data points)
  private val _imuHistory = MutableStateFlow<List<ImuData>>(emptyList())
  val imuHistory: StateFlow<List<ImuData>> = _imuHistory.asStateFlow()

  // Peak G-force recorder
  private val _peakAMag = MutableStateFlow(1.02f)
  val peakAMag: StateFlow<Float> = _peakAMag.asStateFlow()

  // Benchmark Ping Distance Mode
  private val _isPingModeActive = MutableStateFlow(false)
  val isPingModeActive: StateFlow<Boolean> = _isPingModeActive.asStateFlow()
  private val _pingSequenceCount = MutableStateFlow(0L)
  val pingSequenceCount: StateFlow<Long> = _pingSequenceCount.asStateFlow()
  private var pingBenchmarkJob: Job? = null

  // Incident Events Stream
  private val _events = MutableStateFlow<List<IncidentEvent>>(createInitialEvents())
  val events: StateFlow<List<IncidentEvent>> = _events.asStateFlow()

  // Selected event for Profile Overlay Showcase
  private val _selectedEvent = MutableStateFlow<IncidentEvent?>(null)
  val selectedEvent: StateFlow<IncidentEvent?> = _selectedEvent.asStateFlow()

  // Dialog & Overlay visibility
  private val _showProfileOverlay = MutableStateFlow(false)
  val showProfileOverlay: StateFlow<Boolean> = _showProfileOverlay.asStateFlow()

  private val _showConnectionDialog = MutableStateFlow(false)
  val showConnectionDialog: StateFlow<Boolean> = _showConnectionDialog.asStateFlow()

  private val _showRiderLoginDialog = MutableStateFlow(false)
  val showRiderLoginDialog: StateFlow<Boolean> = _showRiderLoginDialog.asStateFlow()

  private val _showCsvDialog = MutableStateFlow(false)
  val showCsvDialog: StateFlow<Boolean> = _showCsvDialog.asStateFlow()

  private val _csvDialogInitialTab = MutableStateFlow("EXPORT")
  val csvDialogInitialTab: StateFlow<String> = _csvDialogInitialTab.asStateFlow()

  private val _showCsvImportDialog = MutableStateFlow(false)
  val showCsvImportDialog: StateFlow<Boolean> = _showCsvImportDialog.asStateFlow()

  // IMU Studio Calibration State (Dynamic thresholds & false-alarm cancellation)
  val imuCalibration: StateFlow<com.example.model.ImuCalibration> = csvExportManager.calibrationState

  private val _showDesignRulesDialog = MutableStateFlow(false)
  val showDesignRulesDialog: StateFlow<Boolean> = _showDesignRulesDialog.asStateFlow()

  // Theme mode (Dark / Light)
  private val _isDarkTheme = MutableStateFlow(true)
  val isDarkTheme: StateFlow<Boolean> = _isDarkTheme.asStateFlow()

  // Filter & Search
  private val _activeFilter = MutableStateFlow("ALL")
  val activeFilter: StateFlow<String> = _activeFilter.asStateFlow()

  private val _searchQuery = MutableStateFlow("")
  val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

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
    _activeNavTabFlow.value = RamsNavTab.MAP
    viewModelScope.launch(Dispatchers.IO) {
      val (destLat, destLon, resolvedName) = resolveLocationCoordinates(locationQuery)
      android.util.Log.i("RAMS_Route", "pinAndRouteToLocation: '$locationQuery' -> target: $resolvedName ($destLat, $destLon)")
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

  // Bluetooth Wearable Scanner State
  private val bluetoothManager = application.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
  private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager?.adapter

  private val _isBluetoothEnabled = MutableStateFlow(bluetoothAdapter?.isEnabled == true)
  val isBluetoothEnabled: StateFlow<Boolean> = _isBluetoothEnabled.asStateFlow()

  private val _isScanningBluetooth = MutableStateFlow(false)
  val isScanningBluetooth: StateFlow<Boolean> = _isScanningBluetooth.asStateFlow()

  private val _bondedDevices = MutableStateFlow<List<BluetoothDevice>>(emptyList())
  val bondedDevices: StateFlow<List<BluetoothDevice>> = _bondedDevices.asStateFlow()

  private val _discoveredWearables = MutableStateFlow<List<BluetoothDevice>>(emptyList())
  val discoveredWearables: StateFlow<List<BluetoothDevice>> = _discoveredWearables.asStateFlow()

  private var isReceiverRegistered = false
  private var leScanCallback: android.bluetooth.le.ScanCallback? = null
  private var scanCycleCount = 0

  private fun sortWearables(devices: List<BluetoothDevice>): List<BluetoothDevice> {
    return devices.sortedWith(compareByDescending { device ->
      try {
        val name = device.name ?: ""
        name.contains("RAMS", ignoreCase = true) || name.contains("Wearable", ignoreCase = true)
      } catch (_: SecurityException) { false }
    })
  }

  fun refreshBluetoothState() {
    val enabled = bluetoothAdapter?.isEnabled == true
    _isBluetoothEnabled.value = enabled
    if (enabled) {
      queryBondedWearableDevices()
      startBluetoothDiscovery()
    }
  }

  private val bluetoothScanReceiver = object : BroadcastReceiver() {
    @SuppressLint("MissingPermission")
    override fun onReceive(context: Context?, intent: Intent?) {
      when (intent?.action) {
        BluetoothAdapter.ACTION_STATE_CHANGED -> {
          val state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR)
          if (state == BluetoothAdapter.STATE_ON) {
            _isBluetoothEnabled.value = true
            queryBondedWearableDevices()
            startBluetoothDiscovery()
          } else if (state == BluetoothAdapter.STATE_OFF) {
            _isBluetoothEnabled.value = false
            _isScanningBluetooth.value = false
            _discoveredWearables.value = emptyList()
            _bondedDevices.value = emptyList()
          }
        }
        BluetoothDevice.ACTION_FOUND -> {
          val device: BluetoothDevice? = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
          if (device != null) {
            val currentList = _discoveredWearables.value.toMutableList()
            if (!currentList.any { it.address == device.address }) {
              currentList.add(device)
              _discoveredWearables.value = sortWearables(currentList)
            }
          }
        }
        BluetoothAdapter.ACTION_DISCOVERY_FINISHED -> {
          if (_isScanningBluetooth.value && scanCycleCount < 2) {
            scanCycleCount++
            try {
              bluetoothAdapter?.startDiscovery()
            } catch (_: Exception) {
              _isScanningBluetooth.value = false
            }
          } else {
            _isScanningBluetooth.value = false
          }
        }
      }
    }
  }

  val filteredEvents: StateFlow<List<IncidentEvent>> = combine(
    _events,
    _activeFilter,
    _searchQuery
  ) { eventList, filter, query ->
    eventList.filter { event ->
      val matchesFilter = when (filter) {
        "ALERT" -> event.type == IncidentType.ALERT
        "TEST" -> event.type == IncidentType.TEST
        "TELEMETRY" -> event.type == IncidentType.TELEMETRY
        else -> true
      }
      val matchesQuery = query.isEmpty() ||
          event.riderName.contains(query, ignoreCase = true) ||
          event.deviceToken.contains(query, ignoreCase = true) ||
          event.title.contains(query, ignoreCase = true) ||
          event.plateNumber.contains(query, ignoreCase = true)
      matchesFilter && matchesQuery
    }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), _events.value)

  // User category classification helper
  fun setUserCategory(category: String, userInitiated: Boolean = false) {
    val ctx = getApplication<Application>().applicationContext
    val updated = _riderProfile.value.copy(userType = category)
    _riderProfile.value = updated
    updated.saveToPreferences(ctx)
  }

  private val autoCategoryClassifier = object {
    fun ingestSample(movement: String, speedKmh: Float) {
      val inferred = inferCategoryFromKinematics(movement, speedKmh) ?: return
      val current = _riderProfile.value.userType
      if (!current.equals(inferred, ignoreCase = true)) {
        setUserCategory(inferred, userInitiated = false)
      }
    }

    private fun inferCategoryFromKinematics(movement: String, speedKmh: Float): String? {
      val m = movement.uppercase(java.util.Locale.US)
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

  init {
    // Start phone physical sensors
    phoneSensorEngine.startSensors()

    // Connect AI crash trigger listener to launch continuous alarm & voice abort
    sensorAiEngine.onCrashAlarmTriggerListener = { scenario, reason ->
      triggerEmergencyCrashAlarm(scenario, reason)
    }

    // Connect Wearable physical button press cancel event
    esp32SyncEngine.onWearableCancelRequested = {
      cancelFalseAlarm()
    }

    // Register Bluetooth broadcast receiver
    try {
      val filter = IntentFilter().apply {
        addAction(BluetoothDevice.ACTION_FOUND)
        addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED)
        addAction(BluetoothAdapter.ACTION_STATE_CHANGED)
      }
      application.registerReceiver(bluetoothScanReceiver, filter)
      isReceiverRegistered = true
    } catch (_: Exception) {}

    // Collect IMU to update history buffer, peak G, and CSV logging
    viewModelScope.launch {
      imuState.collect { imu ->
        val currentList = _imuHistory.value.toMutableList()
        if (currentList.size >= 50) currentList.removeAt(0)
        currentList.add(imu)
        _imuHistory.value = currentList

        if (imu.aMag > _peakAMag.value) {
          _peakAMag.value = imu.aMag
        }

        // Record to CSV logger if recording is turned on
        csvExportManager.recordSample(
          gps = gpsState.value,
          imu = imu,
          battPct = 94
        )
      }
    }

    // Collect Real Phone Crash Alert Events
    viewModelScope.launch {
      phoneSensorEngine.crashTriggerFlow.collect { (gps, imu) ->
        handleCrashShockDetected(gps, imu, "PHONE SENSOR IMPACT DETECTED")
      }
    }

    // Stream real-time sensor samples into Edge AI Engine and Developer Training Suite
    viewModelScope.launch {
      combine(phoneSensorEngine.phoneImuState, phoneSensorEngine.phoneGpsState) { imu, gps ->
        Pair(imu, gps.speedKmh)
      }.collect { (imu, speed) ->
        sensorAiEngine.ingestSample(imu, speed)
        if (devTrainingSuite.recordingState.value == DeveloperTrainingSuite.RecordingState.RECORDING) {
          devTrainingSuite.recordSample(imu)
        }
      }
    }

    // Observe dynamic IMU Studio calibration profile for motion threshold & false alarm rejection
    viewModelScope.launch {
      csvExportManager.calibrationState.collect { cal ->
        if (cal.isCalibrated && cal.crashThresholdG > 0f) {
          phoneSensorEngine.setCrashThreshold(cal.crashThresholdG)
        } else {
          phoneSensorEngine.setCrashThreshold(0f)
        }
      }
    }

    // Populate paired Wearable devices on startup if bluetooth is active
    if (bluetoothAdapter?.isEnabled == true) {
      queryBondedWearableDevices()
      startBluetoothDiscovery()
      checkAndAutoConnectWearable()
    }

    // Wire app action handler to Voice AI engine for voice navigation & command execution
    voiceAlarmCanceler.appActionHandler = appActionHandler

    // Connect speech detection listener to siren ducking
    voiceAlarmCanceler.onSpeechDetectedListener = { isSpeaking ->
      if (_isAlarmActive.value) {
        alarmSoundEngine.duckVolume(isSpeaking)
      }
    }

    // Connect RamsOverlayManager listeners
    RamsOverlayManager.onActionChipSelectedListener = { action ->
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
            autoCategoryClassifier.ingestSample(cognition.movement.name, gps.speedKmh)
          } catch (_: Exception) {}
        }
    }
  }

  @SuppressLint("MissingPermission")
  fun checkAndAutoConnectWearable() {
    if (syncStatus.value.isSyncActive || syncStatus.value.isConnecting) return
    val prefs = getApplication<Application>().getSharedPreferences("rams_ble_sync_prefs", Context.MODE_PRIVATE)
    val lastMac = prefs.getString("last_ble_mac", null)
    val lastName = prefs.getString("last_ble_name", "RAMS Wearable")

    if (!lastMac.isNullOrBlank()) {
      android.util.Log.i("RAMS_AutoConnect", "Found saved wearable MAC: $lastMac ($lastName). Initiating auto-connect.")
      connectBluetoothSync(lastMac, lastName ?: "RAMS Wearable")
      return
    }

    // Check bonded devices for any device named RAMS
    val bonded = _bondedDevices.value
    val ramsBonded = bonded.firstOrNull { d ->
      val name = try { d.name ?: "" } catch (_: SecurityException) { "" }
      name.contains("RAMS", ignoreCase = true) || name.contains("Wearable", ignoreCase = true)
    }
    if (ramsBonded != null) {
      android.util.Log.i("RAMS_AutoConnect", "Found bonded RAMS device: ${ramsBonded.address}. Auto-connecting.")
      connectWearableDevice(ramsBonded)
    }
  }

  @SuppressLint("MissingPermission")
  fun queryBondedWearableDevices() {
    try {
      val bonded = bluetoothAdapter?.bondedDevices ?: emptySet()
      _bondedDevices.value = sortWearables(bonded.toList())
      checkAndAutoConnectWearable()
    } catch (_: Exception) {}
  }

  @SuppressLint("MissingPermission")
  fun startBluetoothDiscovery() {
    val app = getApplication<Application>()
    val enabled = bluetoothAdapter?.isEnabled == true
    _isBluetoothEnabled.value = enabled
    if (!enabled) return

    try {
      if (!isReceiverRegistered) {
        val filter = IntentFilter().apply {
          addAction(BluetoothDevice.ACTION_FOUND)
          addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED)
          addAction(BluetoothAdapter.ACTION_STATE_CHANGED)
        }
        app.registerReceiver(bluetoothScanReceiver, filter)
        isReceiverRegistered = true
      }

      // Check bonded devices first
      queryBondedWearableDevices()

      // Reset discovered list and cycle counter for fresh scan
      _discoveredWearables.value = emptyList()
      scanCycleCount = 0

      if (bluetoothAdapter?.isDiscovering == true) {
        bluetoothAdapter.cancelDiscovery()
      }
      val startedDiscovery = bluetoothAdapter?.startDiscovery() ?: false

      // Also start BLE scanner for ESP32-S3 and other BLE peripherals
      val leScanner = bluetoothAdapter?.bluetoothLeScanner
      var startedBle = false
      if (leScanner != null) {
        if (leScanCallback == null) {
          leScanCallback = object : android.bluetooth.le.ScanCallback() {
            override fun onScanResult(callbackType: Int, result: android.bluetooth.le.ScanResult?) {
              result?.device?.let { device ->
                val currentList = _discoveredWearables.value.toMutableList()
                if (!currentList.any { it.address == device.address }) {
                  currentList.add(device)
                  _discoveredWearables.value = sortWearables(currentList)
                }

                // Seamless auto-connect to priority wearable
                if (!syncStatus.value.isSyncActive && !syncStatus.value.isConnecting) {
                  val name = try { device.name ?: "" } catch (_: SecurityException) { "" }
                  val prefs = getApplication<Application>().getSharedPreferences("rams_ble_sync_prefs", Context.MODE_PRIVATE)
                  val lastMac = prefs.getString("last_ble_mac", null)
                  if ((lastMac != null && device.address.equals(lastMac, ignoreCase = true)) ||
                      name.contains("RAMS", ignoreCase = true)) {
                    android.util.Log.i("RAMS_AutoConnect", "Spotted RAMS BLE peripheral: ${device.address}. Auto-connecting.")
                    connectWearableDevice(device)
                  }
                }
              }
            }

            override fun onBatchScanResults(results: MutableList<android.bluetooth.le.ScanResult>?) {
              results?.forEach { result ->
                result.device?.let { device ->
                  val currentList = _discoveredWearables.value.toMutableList()
                  if (!currentList.any { it.address == device.address }) {
                    currentList.add(device)
                    _discoveredWearables.value = sortWearables(currentList)
                  }
                }
              }
            }

            override fun onScanFailed(errorCode: Int) {}
          }
        }
        try {
          val settings = android.bluetooth.le.ScanSettings.Builder()
            .setScanMode(android.bluetooth.le.ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()
          leScanner.startScan(null, settings, leScanCallback)
          startedBle = true
        } catch (_: Exception) {}
      }

      _isScanningBluetooth.value = startedDiscovery || startedBle
    } catch (e: Exception) {
      _isScanningBluetooth.value = false
    }
  }

  @SuppressLint("MissingPermission")
  fun stopBluetoothDiscovery() {
    try {
      scanCycleCount = 99
      if (bluetoothAdapter?.isDiscovering == true) {
        bluetoothAdapter.cancelDiscovery()
      }
      leScanCallback?.let { cb ->
        try {
          bluetoothAdapter?.bluetoothLeScanner?.stopScan(cb)
        } catch (_: Exception) {}
      }
      _isScanningBluetooth.value = false
    } catch (_: Exception) {}
  }

  fun triggerEmergencyCrashAlarm(scenario: String = "CRASH", reason: String = "Severe Impact Shock") {
    _isAlarmActive.value = true
    _alarmCountdownSeconds.value = 10
    voiceAlarmCanceler.setAlarmActiveState(true)

    // 1. Start continuous audio siren & vibration loop in pre-alarm warning mode
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
    }

    // 3. Send emergency BLE packet to Wearable
    val currentRider = _riderProfile.value
    esp32SyncEngine.sendEmergencyCrashPacket(
      gps = gpsState.value,
      imu = imuState.value,
      riderProfile = currentRider,
      eventType = 2,
      eventTypeName = "Severe Crash Collision"
    )

    // 4. Log alert event
    val alertEvent = IncidentEvent(
      id = "ALERT-${System.currentTimeMillis() % 100000}",
      title = "CRASH ALERT: $scenario",
      type = IncidentType.ALERT,
      timestamp = System.currentTimeMillis(),
      lat = gpsState.value.latitude,
      lon = gpsState.value.longitude,
      aMag = imuState.value.aMag,
      speedKmh = gpsState.value.speedKmh,
      batteryPct = 94,
      riderName = currentRider.riderName,
      plateNumber = currentRider.plateNumber,
      deviceToken = currentRider.token,
      vehicleModel = currentRider.vehicleModel,
      locationAddress = gpsState.value.locationAddress.ifBlank { "Location Active" },
      notes = "$reason. Emergency siren playing continuously until canceled by voice, physical button, or app."
    )
    _events.value = listOf(alertEvent) + _events.value

    // 5. Open Voice Assistant bubble asking what to do next
    voiceAlarmCanceler.startListeningForCancel(promptDirectly = true)
    if (RamsOverlayManager.canDrawOverlays(getApplication<Application>())) {
      RamsOverlayManager.showAlarmOverlay(countdownSeconds = 10)
    }
  }

  fun cancelFalseAlarm() {
    alarmSoundEngine.duckVolume(false)
    alarmSoundEngine.stopEmergencyAlarm()
    alarmCountdownJob?.cancel()
    alarmCountdownJob = null
    _isAlarmActive.value = false
    _alarmCountdownSeconds.value = 0
    voiceAlarmCanceler.setAlarmActiveState(false)

    // Only reset voice state if it wasn't already transitioned by voice command
    if (voiceAlarmCanceler.engineState.value != VoiceAlarmCanceler.VoiceEngineState.COMMAND_SPOTTED) {
      voiceAlarmCanceler.resetVoiceState()
      voiceAlarmCanceler.scheduleRestart(600L)
    }

    csvExportManager.imuCalibrationManager.recordFalseAlarmSuppressed("False alarm dismissed by rider via mobile app / voice command / wearable physical button")
    val currentRider = _riderProfile.value
    esp32SyncEngine.sendCancelAlertPacket(currentRider)
    sensorAiEngine.simulateScenario("NORMAL")

    // Update prior active ALERT events for this rider so they are cleared from the active map pins
    _events.value = _events.value.map { evt ->
      if (evt.type == IncidentType.ALERT && (evt.deviceToken == currentRider.token || evt.title.startsWith("CRASH ALERT"))) {
        evt.copy(
          type = IncidentType.FALSE_ALARM,
          title = "${evt.title} [CANCELLED]",
          notes = "${evt.notes} [Cancelled by rider]"
        )
      } else {
        evt
      }
    }

    val cancelEvent = IncidentEvent(
      id = "CLR-${System.currentTimeMillis() % 100000}",
      title = "FALSE ALARM DISMISSED",
      type = IncidentType.FALSE_ALARM,
      timestamp = System.currentTimeMillis(),
      lat = gpsState.value.latitude,
      lon = gpsState.value.longitude,
      aMag = imuState.value.aMag,
      speedKmh = gpsState.value.speedKmh,
      batteryPct = 94,
      riderName = currentRider.riderName,
      plateNumber = currentRider.plateNumber,
      deviceToken = currentRider.token,
      vehicleModel = currentRider.vehicleModel,
      locationAddress = gpsState.value.locationAddress.ifBlank {
        if (gpsState.value.hasFix) "GPS: %.5f, %.5f".format(gpsState.value.latitude, gpsState.value.longitude)
        else "Location Pending (GPS Searching)"
      },
      notes = "False alarm signal cancelled by rider. Siren & buzzer silenced. Normal monitoring resumed."
    )
    _events.value = listOf(cancelEvent) + _events.value
  }

  fun connectWearableDevice(device: BluetoothDevice) {
    stopBluetoothDiscovery()
    @SuppressLint("MissingPermission")
    val deviceName = try { device.name ?: TARGET_WEARABLE_NAME } catch (_: SecurityException) { TARGET_WEARABLE_NAME }
    connectBluetoothSync(device.address, deviceName)
  }

  private fun handleCrashShockDetected(gps: GpsData, imu: ImuData, note: String) {
    // Intelligent Edge AI Evaluation (Dual-Tier Deterministic Kinematic & LiteRT Filter)
    val aiResult = if (_aiClassificationEnabled.value) {
      sensorAiEngine.evaluateCurrentWindowSynchronous(gps.speedKmh)
        ?: sensorAiEngine.tier1ResultFlow.value
    } else {
      null
    }

    if (aiResult != null && !aiResult.motionProfile.isAccident) {
      csvExportManager.imuCalibrationManager.recordFalseAlarmSuppressed(
        "Edge AI: Suppressed %s (%s, %.1f%% conf)".format(
          aiResult.motionProfile.displayName, aiResult.kinematicReason, aiResult.confidence * 100f
        )
      )
      return
    }

    val cal = csvExportManager.calibrationState.value
    // If uncalibrated, no threshold is set: check if confirmed by Edge AI
    if (!cal.isCalibrated || cal.crashThresholdG <= 0f) {
      if (aiResult == null || !aiResult.motionProfile.isAccident || aiResult.confidence < 0.80f) {
        return
      }
    }

    // Classify against dynamic baseline derived from IMU Studio correlation data
    val classification = cal.classifyMotion(
      aMag = imu.aMag,
      tiltDeltaDeg = imu.tiltAngleDeg,
      gyroMagRads = imu.gyroMagRads
    )

    when (classification) {
      AccidentClassification.NONE -> return
      AccidentClassification.NEGATIVE_PHONE_DROP -> {
        csvExportManager.imuCalibrationManager.recordFalseAlarmSuppressed(
          "Phone drop shock (%.2fg) suppressed below calibrated accident envelope (max phone fall baseline: %.2fg)".format(
            imu.aMag, cal.phoneFallMaxG
          )
        )
        return
      }
      AccidentClassification.NEGATIVE_DATA -> {
        csvExportManager.imuCalibrationManager.recordFalseAlarmSuppressed(
          "ADL motion (%.2fg) suppressed below calibrated %.2fg crash threshold".format(
            imu.aMag, cal.crashThresholdG
          )
        )
        return
      }
      AccidentClassification.FALL, AccidentClassification.SKID, AccidentClassification.DIRECT_IMPACT -> {
        // Confirmed accident exceeding negative baseline
      }
    }

    val currentRider = _riderProfile.value
    val eventTypeName = classification.displayName
    val newAlert = IncidentEvent(
      id = "ALERT-${UUID.randomUUID().toString().substring(0, 6).uppercase()}",
      title = "CRASH ALERT: $eventTypeName (%.2fg)".format(imu.aMag),
      type = IncidentType.ALERT,
      timestamp = System.currentTimeMillis(),
      lat = gps.latitude,
      lon = gps.longitude,
      aMag = imu.aMag,
      speedKmh = gps.speedKmh,
      batteryPct = 94,
      riderName = currentRider.riderName,
      plateNumber = currentRider.plateNumber,
      deviceToken = currentRider.token,
      vehicleModel = currentRider.vehicleModel,
      locationAddress = gps.locationAddress.ifBlank {
        if (gps.hasFix) "GPS: %.5f, %.5f".format(gps.latitude, gps.longitude)
        else "Location Pending (GPS Searching)"
      },
      notes = "$note: Classified as $eventTypeName (Peak ${imu.aMag}g shock). Baseline threshold: ${cal.crashThresholdG}g. Dispatched to Rescue Network via Safety Wearable."
    )
    _events.value = listOf(newAlert) + _events.value

    // Activate Hands-Free Voice Alarm Canceler during the countdown window ("Hey RAMS, Cancel Alarm")
    voiceAlarmCanceler.startListeningForCancel()

    // Transmit emergency broadcast packet to Wearable with classified accident type
    esp32SyncEngine.sendEmergencyCrashPacket(
      gps = gps,
      imu = imu,
      riderProfile = currentRider,
      eventType = classification.eventType,
      eventTypeName = classification.displayName
    )
  }

  fun toggleSensorSource() {
    _usePhoneSensors.value = !_usePhoneSensors.value
    if (_usePhoneSensors.value) {
      phoneSensorEngine.startSensors()
    }
  }

  fun toggleNearbyIncidents(show: Boolean) {
    _riderProfile.value = _riderProfile.value.copy(showNearbyIncidents = show)
  }

  fun connectWebSocketSync(wsUrl: String) {
    _riderProfile.value = _riderProfile.value.copy(wearableWsUrl = wsUrl)
    esp32SyncEngine.startWebSocketSync(
      wsUrl = wsUrl,
      getGps = { gpsState.value },
      getImu = { imuState.value },
      getRiderProfile = { _riderProfile.value }
    )
    _showConnectionDialog.value = false
  }

  fun connectWifiSync(ip: String, port: Int) {
    esp32SyncEngine.startWifiSync(
      ip = ip,
      port = port,
      getGps = { gpsState.value },
      getImu = { imuState.value },
      getRiderProfile = { _riderProfile.value }
    )
    _showConnectionDialog.value = false
  }

  fun connectBluetoothSync(mac: String, name: String) {
    stopBluetoothDiscovery()
    esp32SyncEngine.startBluetoothSync(
      mac = mac,
      name = name,
      getGps = { gpsState.value },
      getImu = { imuState.value },
      getRiderProfile = { _riderProfile.value }
    )
    _showConnectionDialog.value = false
  }

  fun togglePingDistanceMode(enabled: Boolean) {
    _isPingModeActive.value = enabled
    pingBenchmarkJob?.cancel()
    pingBenchmarkJob = null

    if (enabled) {
      pingBenchmarkJob = viewModelScope.launch(Dispatchers.IO) {
        while (isActive && _isPingModeActive.value) {
          _pingSequenceCount.value += 1
          val seq = _pingSequenceCount.value
          val gps = gpsState.value
          val profile = _riderProfile.value
          val epoch = System.currentTimeMillis()

          esp32SyncEngine.sendPingBenchmarkPacket(
            token = profile.token,
            lat = gps.latitude,
            lon = gps.longitude,
            seq = seq,
            epoch = epoch
          )
          delay(3000L) // Ping interval: 3 seconds for continuous propagation benchmarking
        }
      }
    }
  }

  fun saveRiderProfile(profile: RiderProfile) {
    _riderProfile.value = profile
    // Persist to SharedPreferences so data survives app restarts
    profile.saveToPreferences(getApplication<Application>().applicationContext)
    voiceAlarmCanceler.setVoicePreference(profile.ttsVoicePreference)
  }

  fun generateNewToken() {
    val newToken = RiderProfile.generateNewToken()
    _riderProfile.value = _riderProfile.value.copy(token = newToken)
  }

  fun startSimulation() {
    _usePhoneSensors.value = false
    simulatedConnectionManager.startSimulation()
  }

  fun resetPeakG() {
    _peakAMag.value = imuState.value.aMag
  }

  fun selectEvent(event: IncidentEvent) {
    _selectedEvent.value = event
    _showProfileOverlay.value = true
  }

  fun closeProfileOverlay() {
    _showProfileOverlay.value = false
  }

  fun setConnectionDialogVisible(visible: Boolean) {
    _showConnectionDialog.value = visible
  }

  fun setRiderLoginDialogVisible(visible: Boolean) {
    _showRiderLoginDialog.value = visible
  }

  fun setCsvDialogVisible(visible: Boolean, initialTab: String = "EXPORT") {
    _csvDialogInitialTab.value = initialTab
    _showCsvDialog.value = visible
  }

  fun setDesignRulesDialogVisible(visible: Boolean) {
    _showDesignRulesDialog.value = visible
  }

  fun toggleTheme() {
    _isDarkTheme.value = !_isDarkTheme.value
  }

  fun setFilter(filter: String) {
    _activeFilter.value = filter
  }

  fun setSearch(query: String) {
    _searchQuery.value = query
  }

  fun toggleRecording() {
    if (csvExportManager.isRecording.value) {
      csvExportManager.stopRecording()
    } else {
      csvExportManager.startRecording()
    }
  }

  fun exportCsv() {
    csvExportManager.shareCsv()
  }

  fun importCsv(uri: android.net.Uri, fileName: String) {
    csvExportManager.importCsvFromUri(uri, fileName)
  }

  fun mergeImportedData() {
    csvExportManager.mergeImportedToRecording()
  }

  fun clearImportedData() {
    csvExportManager.clearImportedData()
  }

  fun setCsvImportDialogVisible(visible: Boolean) {
    _showCsvImportDialog.value = visible
    setCsvDialogVisible(visible, "IMPORT")
  }

  fun clearLogs() {
    csvExportManager.clearLogs()
  }

  override fun onCleared() {
    super.onCleared()
    phoneSensorEngine.stopSensors()
    esp32SyncEngine.stopSync()
    if (isReceiverRegistered) {
      try {
        getApplication<Application>().unregisterReceiver(bluetoothScanReceiver)
      } catch (_: Exception) {}
      isReceiverRegistered = false
    }
  }

  companion object {
    const val TARGET_WEARABLE_NAME = "RAMS Bluetooth Connection"
  }

  private fun createInitialEvents(): List<IncidentEvent> {
    val now = System.currentTimeMillis()
    return listOf(
      IncidentEvent(
        id = "EVT-8821-CRASH",
        title = "RESOLVED ROAD INCIDENT",
        type = IncidentType.FALSE_ALARM,
        timestamp = now - 180000L,
        lat = 17.613210,
        lon = 121.727040,
        aMag = 3.82f,
        speedKmh = 52.4f,
        batteryPct = 94,
        riderName = "Nearby Road Unit",
        plateNumber = "NCR-8821",
        vehicleModel = "Road Vehicle",
        deviceToken = "RAMS-41A0",
        locationAddress = "Maharlika Highway cor. Caritan Norte, Tuguegarao City",
        notes = "Historical incident resolved and cleared by responders. Road sector all clear."
      ),
      IncidentEvent(
        id = "EVT-8821-TEST",
        title = "PRE-TRIP SENSOR CALIBRATION",
        type = IncidentType.TEST,
        timestamp = now - 950000L,
        lat = 17.615200,
        lon = 121.729500,
        aMag = 1.01f,
        speedKmh = 12.0f,
        batteryPct = 96,
        riderName = "Unit Diagnostic",
        deviceToken = "RAMS-41A0",
        notes = "Hardware sensor diagnostic passed: Accelerometer and Gyro OK"
      ),
      IncidentEvent(
        id = "EVT-8821-FALSE",
        title = "POTHOLE SHOCK RESOLVED",
        type = IncidentType.FALSE_ALARM,
        timestamp = now - 1800000L,
        lat = 17.617500,
        lon = 121.729200,
        aMag = 2.15f,
        speedKmh = 38.0f,
        batteryPct = 98,
        riderName = "Nearby Road Unit",
        deviceToken = "RAMS-41A0",
        notes = "Vertical bump without vehicle capsize; cleared by operator confirmation"
      ),
      IncidentEvent(
        id = "EVT-8821-TELEM",
        title = "LIVE TELEMETRY SNAPSHOT",
        type = IncidentType.TELEMETRY,
        timestamp = now - 60000L,
        lat = 17.614100,
        lon = 121.728200,
        aMag = 1.00f,
        speedKmh = 44.5f,
        batteryPct = 94,
        riderName = "Safety Wearable Stream",
        deviceToken = "RAMS-41A0",
        notes = "Normal IMU and GPS sync to Autonomous Safety Gateway"
      )
    )
  }
}
