package com.example.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.connectivity.Esp32ConnectionManager
import com.example.export.CsvExportManager
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
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

class RamsViewModel(application: Application) : AndroidViewModel(application) {

  // Phone Physical Hardware Sensors
  val phoneSensorEngine = PhoneSensorEngine(application.applicationContext, viewModelScope)

  // ESP32 Sync and LoRa Uplink Engine (WebSocket / TCP / Bluetooth)
  val esp32SyncEngine = Esp32SyncEngine(viewModelScope)

  // Fallback / Simulator manager
  private val simulatedConnectionManager = Esp32ConnectionManager(viewModelScope)

  // CSV Logger & Exporter
  val csvExportManager = CsvExportManager(application.applicationContext)

  // Rider Profile & Generated Netlify Token State
  private val _riderProfile = MutableStateFlow(RiderProfile())
  val riderProfile: StateFlow<RiderProfile> = _riderProfile.asStateFlow()

  // Use real phone sensors by default
  private val _usePhoneSensors = MutableStateFlow(true)
  val usePhoneSensors: StateFlow<Boolean> = _usePhoneSensors.asStateFlow()

  // Dynamic active sensor states (Phone Hardware vs. Highway Simulation)
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
        firmwareVersion = "PHONE-SENSOR-WEBSOCKET v3.2",
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

  init {
    // Start phone physical sensors
    phoneSensorEngine.startSensors()

    // Start WebSocket migration sync to ESP32
    esp32SyncEngine.startWebSocketSync(
      wsUrl = _riderProfile.value.esp32WsUrl,
      getGps = { gpsState.value },
      getImu = { imuState.value },
      getRiderProfile = { _riderProfile.value }
    )

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

    // Collect Simulator Crash Alert Events
    viewModelScope.launch {
      simulatedConnectionManager.crashAlertEvents.collect { (gps, imu) ->
        handleCrashShockDetected(gps, imu, "SIMULATED ROAD ACCIDENT SHOCK")
      }
    }
  }

  private fun handleCrashShockDetected(gps: GpsData, imu: ImuData, note: String) {
    val currentRider = _riderProfile.value
    val newAlert = IncidentEvent(
      id = "ALERT-${UUID.randomUUID().toString().substring(0, 6).uppercase()}",
      title = "CRASH IMPACT SENSOR SHOCK (%.2fg)".format(imu.aMag),
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
      locationAddress = "Maharlika Highway cor. Caritan Norte, Tuguegarao City",
      notes = "$note: Peak ${imu.aMag} G shock. Netlify Token: ${currentRider.token}. Transmitted to ESP32 WebSocket & LoRa Gateway."
    )
    _events.value = listOf(newAlert) + _events.value

    // Transmit emergency LoRa broadcast packet to ESP32 WebSocket
    esp32SyncEngine.sendEmergencyCrashPacket(
      gps = gps,
      imu = imu,
      riderProfile = currentRider
    )
  }

  fun toggleSensorSource() {
    _usePhoneSensors.value = !_usePhoneSensors.value
    if (_usePhoneSensors.value) {
      phoneSensorEngine.startSensors()
    }
  }

  fun connectWebSocketSync(wsUrl: String) {
    _riderProfile.value = _riderProfile.value.copy(esp32WsUrl = wsUrl)
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
    esp32SyncEngine.startBluetoothSync(
      mac = mac,
      name = name,
      getGps = { gpsState.value },
      getImu = { imuState.value },
      getRiderProfile = { _riderProfile.value }
    )
    _showConnectionDialog.value = false
  }

  fun saveRiderProfile(profile: RiderProfile) {
    _riderProfile.value = profile
    // Re-trigger sync with new profile token and details
    if (esp32SyncEngine.syncStatus.value.transport == SyncTransport.WEBSOCKET) {
      esp32SyncEngine.startWebSocketSync(
        wsUrl = profile.esp32WsUrl,
        getGps = { gpsState.value },
        getImu = { imuState.value },
        getRiderProfile = { profile }
      )
    }
  }

  fun generateNewToken() {
    val newToken = RiderProfile.generateNewToken()
    _riderProfile.value = _riderProfile.value.copy(token = newToken)
  }

  fun startSimulation() {
    _usePhoneSensors.value = false
    simulatedConnectionManager.startSimulation()
  }

  fun triggerTestCrash() {
    if (_usePhoneSensors.value) {
      phoneSensorEngine.injectTestCrashShock()
    } else {
      simulatedConnectionManager.triggerSimulatedCrash()
    }
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

  fun setCsvDialogVisible(visible: Boolean) {
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

  fun clearLogs() {
    csvExportManager.clearLogs()
  }

  override fun onCleared() {
    super.onCleared()
    phoneSensorEngine.stopSensors()
    esp32SyncEngine.stopSync()
  }

  private fun createInitialEvents(): List<IncidentEvent> {
    val now = System.currentTimeMillis()
    return listOf(
      IncidentEvent(
        id = "EVT-8821-CRASH",
        title = "CRASH IMPACT SENSOR TRIGGER",
        type = IncidentType.ALERT,
        timestamp = now - 180000L,
        lat = 17.613210,
        lon = 121.727040,
        aMag = 3.82f,
        speedKmh = 52.4f,
        batteryPct = 94,
        riderName = "Elena Dela Cruz",
        plateNumber = "NCR-8821",
        vehicleModel = "Yamaha Sniper 155cc",
        deviceToken = "RAMS-SEC-9B82-41A0",
        locationAddress = "Maharlika Highway cor. Caritan Norte, Tuguegarao City",
        notes = "Sudden high-G lateral impact detected on Phone IMU with tilt angle > 70 deg. Netlify Token: RAMS-SEC-9B82-41A0. Synced to ESP32 WebSocket & LoRa."
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
        riderName = "Elena Dela Cruz",
        deviceToken = "RAMS-SEC-9B82-41A0",
        notes = "Phone hardware sensor diagnostic passed: Accelerometer and Gyro OK"
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
        riderName = "Elena Dela Cruz",
        deviceToken = "RAMS-SEC-9B82-41A0",
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
        riderName = "Elena Dela Cruz",
        deviceToken = "RAMS-SEC-9B82-41A0",
        notes = "Normal phone IMU and GPS sync to ESP32 WebSocket & LoRa transmitter"
      )
    )
  }
}
