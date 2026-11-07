package com.example

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.AttitudeIndicator
import com.example.ui.components.ConnectionConfigDialog
import com.example.ui.components.CsvExportDialog
import com.example.ui.components.DesignRulesDialog
import com.example.ui.components.ImuWaveformChart
import com.example.ui.components.IncidentStreamSection
import com.example.ui.components.RamsHeader
import com.example.ui.components.RamsMapView
import com.example.ui.components.RiderLoginDialog
import com.example.ui.components.TelemetryBar
import com.example.ui.components.WearableProfileOverlay
import com.example.ui.theme.MyApplicationTheme
import com.example.viewmodel.RamsViewModel

class MainActivity : ComponentActivity() {
  private val viewModel: RamsViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      val isDarkTheme by viewModel.isDarkTheme.collectAsStateWithLifecycle()

      MyApplicationTheme(darkTheme = isDarkTheme) {
        RamsDashboardScreen(viewModel = viewModel)
      }
    }
  }
}

@Composable
fun RamsDashboardScreen(
  viewModel: RamsViewModel,
  modifier: Modifier = Modifier
) {
  val gps by viewModel.gpsState.collectAsStateWithLifecycle()
  val imu by viewModel.imuState.collectAsStateWithLifecycle()
  val linkStatus by viewModel.linkStatus.collectAsStateWithLifecycle()
  val imuHistory by viewModel.imuHistory.collectAsStateWithLifecycle()
  val peakG by viewModel.peakAMag.collectAsStateWithLifecycle()
  val filteredEvents by viewModel.filteredEvents.collectAsStateWithLifecycle()
  val allEvents by viewModel.events.collectAsStateWithLifecycle()
  val selectedEvent by viewModel.selectedEvent.collectAsStateWithLifecycle()
  val activeFilter by viewModel.activeFilter.collectAsStateWithLifecycle()
  val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
  val isDarkTheme by viewModel.isDarkTheme.collectAsStateWithLifecycle()
  val usePhoneSensors by viewModel.usePhoneSensors.collectAsStateWithLifecycle()
  val riderProfile by viewModel.riderProfile.collectAsStateWithLifecycle()

  // Permission Launcher for GPS and Bluetooth
  val permissionLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.RequestMultiplePermissions()
  ) { _ ->
    // Permissions handled, sensor listeners automatically register in PhoneSensorEngine
  }

  LaunchedEffect(Unit) {
    val perms = mutableListOf(
      Manifest.permission.ACCESS_FINE_LOCATION,
      Manifest.permission.ACCESS_COARSE_LOCATION
    )
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      perms.add(Manifest.permission.BLUETOOTH_CONNECT)
      perms.add(Manifest.permission.BLUETOOTH_SCAN)
    }
    permissionLauncher.launch(perms.toTypedArray())
  }

  // Modals & Dialogs visibility
  val showProfileOverlay by viewModel.showProfileOverlay.collectAsStateWithLifecycle()
  val showConnectionDialog by viewModel.showConnectionDialog.collectAsStateWithLifecycle()
  val showRiderLoginDialog by viewModel.showRiderLoginDialog.collectAsStateWithLifecycle()
  val showCsvDialog by viewModel.showCsvDialog.collectAsStateWithLifecycle()
  val showDesignRulesDialog by viewModel.showDesignRulesDialog.collectAsStateWithLifecycle()

  val isRecordingCsv by viewModel.csvExportManager.isRecording.collectAsStateWithLifecycle()
  val recordedCsvCount by viewModel.csvExportManager.recordedCount.collectAsStateWithLifecycle()

  val alertCount = allEvents.count { it.type == com.example.model.IncidentType.ALERT }

  Scaffold(
    modifier = modifier
      .fillMaxSize()
      .testTag("rams_main_scaffold"),
    containerColor = MaterialTheme.colorScheme.background,
    topBar = {
      RamsHeader(
        linkStatus = linkStatus,
        alertCount = alertCount,
        isRecordingCsv = isRecordingCsv,
        recordedCsvCount = recordedCsvCount,
        isDarkTheme = isDarkTheme,
        usePhoneSensors = usePhoneSensors,
        riderProfile = riderProfile,
        onToggleSensorSource = { viewModel.toggleSensorSource() },
        onToggleTheme = { viewModel.toggleTheme() },
        onOpenConnectionDialog = { viewModel.setConnectionDialogVisible(true) },
        onOpenRiderLogin = { viewModel.setRiderLoginDialogVisible(true) },
        onOpenCsvDialog = { viewModel.setCsvDialogVisible(true) },
        onOpenDesignRules = { viewModel.setDesignRulesDialogVisible(true) },
        onTriggerTestCrash = { viewModel.triggerTestCrash() }
      )
    }
  ) { innerPadding ->
    BoxWithConstraints(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .background(MaterialTheme.colorScheme.background)
    ) {
      val isWideScreen = maxWidth > 650.dp

      if (isWideScreen) {
        // Two-column modular layout on wide screens / landscape / tablets (Strict 8pt Grid)
        Row(
          modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
          horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
          // Left Column: Telemetry Bar, 3D Horizon, Oscillogram
          Column(
            modifier = Modifier
              .weight(1.1f)
              .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
          ) {
            TelemetryBar(
              gps = gps,
              imu = imu,
              linkStatus = linkStatus,
              peakAMag = peakG,
              onResetPeakG = { viewModel.resetPeakG() }
            )
            AttitudeIndicator(
              pitch = imu.pitchDegrees,
              roll = imu.rollDegrees,
              yaw = imu.yawDegrees,
              accelX = imu.accelX,
              accelY = imu.accelY,
              accelZ = imu.accelZ
            )
            ImuWaveformChart(
              history = imuHistory,
              latestImu = imu
            )
          }

          // Right Column: Tactical Road Map View & Incident Stream
          Column(
            modifier = Modifier
              .weight(1f)
              .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
          ) {
            RamsMapView(
              gps = gps,
              events = allEvents,
              selectedEvent = selectedEvent,
              onSelectEvent = { viewModel.selectEvent(it) },
              riderProfile = riderProfile,
              onOpenLoginDialog = { viewModel.setRiderLoginDialogVisible(true) }
            )
            IncidentStreamSection(
              events = filteredEvents,
              activeFilter = activeFilter,
              searchQuery = searchQuery,
              onFilterChange = { viewModel.setFilter(it) },
              onSearchChange = { viewModel.setSearch(it) },
              onSelectEvent = { viewModel.selectEvent(it) }
            )
          }
        }
      } else {
        // Single Column Vertical Modular Dashboard for Handheld Mobile (Strict 8pt Grid: 16dp outer padding)
        Column(
          modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .widthIn(max = 600.dp),
          verticalArrangement = Arrangement.spacedBy(16.dp),
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          // 1. Modular Telemetry Cards (GPS, Speed, G-Force, Attitude Angles)
          TelemetryBar(
            gps = gps,
            imu = imu,
            linkStatus = linkStatus,
            peakAMag = peakG,
            onResetPeakG = { viewModel.resetPeakG() }
          )

          // 2. 3D Attitude Horizon & Lean Gyro Indicator
          AttitudeIndicator(
            pitch = imu.pitchDegrees,
            roll = imu.rollDegrees,
            yaw = imu.yawDegrees,
            accelX = imu.accelX,
            accelY = imu.accelY,
            accelZ = imu.accelZ
          )

          // 3. Real-Time Oscillogram Sparkline Waveform
          ImuWaveformChart(
            history = imuHistory,
            latestImu = imu
          )

          // 4. Tactical Vector Map Stage with Live Beacon & Incident Pins
          RamsMapView(
            gps = gps,
            events = allEvents,
            selectedEvent = selectedEvent,
            onSelectEvent = { viewModel.selectEvent(it) },
            riderProfile = riderProfile,
            onOpenLoginDialog = { viewModel.setRiderLoginDialogVisible(true) }
          )

          // 5. Live Incident Stream & Search Filter Section
          IncidentStreamSection(
            events = filteredEvents,
            activeFilter = activeFilter,
            searchQuery = searchQuery,
            onFilterChange = { viewModel.setFilter(it) },
            onSearchChange = { viewModel.setSearch(it) },
            onSelectEvent = { viewModel.selectEvent(it) }
          )

          Spacer(modifier = Modifier.height(16.dp))
        }
      }
    }
  }

  // Modals & Dialog Overlays
  if (showProfileOverlay && selectedEvent != null) {
    WearableProfileOverlay(
      event = selectedEvent!!,
      onDismiss = { viewModel.closeProfileOverlay() }
    )
  }

  if (showRiderLoginDialog) {
    RiderLoginDialog(
      profile = riderProfile,
      currentGps = gps,
      onSaveProfile = { viewModel.saveRiderProfile(it) },
      onGenerateNewToken = { viewModel.generateNewToken() },
      onDismiss = { viewModel.setRiderLoginDialogVisible(false) }
    )
  }

  if (showConnectionDialog) {
    ConnectionConfigDialog(
      linkStatus = linkStatus,
      onConnectWebSocket = { wsUrl -> viewModel.connectWebSocketSync(wsUrl) },
      onConnectWifi = { ip, port -> viewModel.connectWifiSync(ip, port) },
      onConnectBluetooth = { mac, name -> viewModel.connectBluetoothSync(mac, name) },
      onStartSimulation = { viewModel.startSimulation() },
      onDismiss = { viewModel.setConnectionDialogVisible(false) }
    )
  }

  if (showCsvDialog) {
    CsvExportDialog(
      csvManager = viewModel.csvExportManager,
      isRecording = isRecordingCsv,
      recordedCount = recordedCsvCount,
      onToggleRecording = { viewModel.toggleRecording() },
      onExportCsv = { viewModel.exportCsv() },
      onClearLogs = { viewModel.clearLogs() },
      onDismiss = { viewModel.setCsvDialogVisible(false) }
    )
  }

  if (showDesignRulesDialog) {
    DesignRulesDialog(
      onDismiss = { viewModel.setDesignRulesDialogVisible(false) }
    )
  }
}
