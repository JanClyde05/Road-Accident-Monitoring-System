package com.example

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.Radio
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.ConnectionConfigDialog
import com.example.ui.components.CsvExportDialog
import com.example.ui.components.DesignRulesDialog
import com.example.ui.components.RamsHeader
import com.example.ui.components.RiderLoginDialog
import com.example.ui.components.WearableProfileOverlay
import com.example.ui.screens.MapScreen
import com.example.ui.screens.SettingsScreen
import com.example.ui.screens.TelemetryScreen
import com.example.ui.screens.WearableScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.viewmodel.RamsViewModel
import java.util.Locale

enum class RamsNavTab(
  val title: String,
  val icon: ImageVector
) {
  TELEMETRY("Telemetry", Icons.Default.ShowChart),
  MAP("Map", Icons.Default.Navigation),
  WEARABLE("Wearable", Icons.Default.Radio),
  SETTINGS("Settings", Icons.Default.Settings)
}

class MainActivity : ComponentActivity() {
  private val viewModel: RamsViewModel by viewModels()
  private val initialTabState = mutableStateOf(RamsNavTab.TELEMETRY)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    handleIntent(intent)
    enableEdgeToEdge()
    setContent {
      val isDarkTheme by viewModel.isDarkTheme.collectAsStateWithLifecycle()

      MyApplicationTheme(darkTheme = isDarkTheme) {
        RamsDashboardScreen(
          viewModel = viewModel,
          initialTab = initialTabState.value
        )
      }
    }
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    handleIntent(intent)
  }

  private fun handleIntent(intent: Intent?) {
    val tabName = intent?.getStringExtra("tab")?.uppercase() ?: return
    try {
      initialTabState.value = RamsNavTab.valueOf(tabName)
    } catch (_: Exception) {}
  }
}

@Composable
fun RamsDashboardScreen(
  viewModel: RamsViewModel,
  initialTab: RamsNavTab = RamsNavTab.TELEMETRY,
  modifier: Modifier = Modifier
) {
  val gps by viewModel.gpsState.collectAsStateWithLifecycle()
  val imu by viewModel.imuState.collectAsStateWithLifecycle()
  val linkStatus by viewModel.linkStatus.collectAsStateWithLifecycle()
  val syncStatus by viewModel.syncStatus.collectAsStateWithLifecycle()
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
  val discoveredDevices by viewModel.discoveredWearables.collectAsStateWithLifecycle()
  val isScanningBluetooth by viewModel.isScanningBluetooth.collectAsStateWithLifecycle()
  val isBluetoothEnabled by viewModel.isBluetoothEnabled.collectAsStateWithLifecycle()

  var selectedTab by rememberSaveable { mutableStateOf(initialTab) }
  LaunchedEffect(initialTab) {
    selectedTab = initialTab
  }

  // Bluetooth enable launcher
  val bluetoothEnableLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.StartActivityForResult()
  ) { _ ->
    viewModel.refreshBluetoothState()
  }

  // Permission Launcher for GPS and Bluetooth
  val permissionLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.RequestMultiplePermissions()
  ) { _ ->
    // Permissions granted: trigger sensor + GPS updates and Bluetooth query
    viewModel.phoneSensorEngine.startSensors()
    viewModel.phoneSensorEngine.startLocationUpdates()
    viewModel.refreshBluetoothState()
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
    viewModel.phoneSensorEngine.startLocationUpdates()
  }

  // Modals & Dialog Overlays visibility
  val showProfileOverlay by viewModel.showProfileOverlay.collectAsStateWithLifecycle()
  val showConnectionDialog by viewModel.showConnectionDialog.collectAsStateWithLifecycle()
  val showRiderLoginDialog by viewModel.showRiderLoginDialog.collectAsStateWithLifecycle()
  val showCsvDialog by viewModel.showCsvDialog.collectAsStateWithLifecycle()

  val isRecordingCsv by viewModel.csvExportManager.isRecording.collectAsStateWithLifecycle()
  val recordedCsvCount by viewModel.csvExportManager.recordedCount.collectAsStateWithLifecycle()

  val alertCount = allEvents.count { it.type == com.example.model.IncidentType.ALERT }

  Scaffold(
    modifier = modifier
      .fillMaxSize()
      .statusBarsPadding()
      .navigationBarsPadding()
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
        onToggleTheme = { viewModel.toggleTheme() },
        onOpenConnectionDialog = { selectedTab = RamsNavTab.WEARABLE },
        onOpenRiderLogin = { selectedTab = RamsNavTab.SETTINGS },
        onOpenCsvDialog = { viewModel.setCsvDialogVisible(true) }
      )
    },
    bottomBar = {
      Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color(0xFF09090B),
        border = BorderStroke(1.dp, Color(0xFF27272A)),
        tonalElevation = 0.dp
      ) {
        NavigationBar(
          containerColor = Color.Transparent,
          tonalElevation = 0.dp
        ) {
          RamsNavTab.values().forEach { tab ->
            val isSelected = selectedTab == tab
            NavigationBarItem(
              selected = isSelected,
              onClick = { selectedTab = tab },
              icon = {
                BadgedBox(
                  badge = {
                    if (tab == RamsNavTab.WEARABLE && syncStatus.isSyncActive) {
                      Badge(
                        containerColor = RamsSuccessEmerald,
                        modifier = Modifier.size(6.dp)
                      )
                    } else if (tab == RamsNavTab.MAP && alertCount > 0 && riderProfile.showNearbyIncidents) {
                      Badge(containerColor = RamsAlertRed) {
                        Text(
                          text = "$alertCount",
                          fontSize = 9.sp,
                          fontWeight = FontWeight.Bold
                        )
                      }
                    }
                  }
                ) {
                  Icon(
                    imageVector = tab.icon,
                    contentDescription = tab.title,
                    modifier = Modifier.size(20.dp)
                  )
                }
              },
              label = {
                Text(
                  text = tab.title.uppercase(Locale.US),
                  fontSize = 9.sp,
                  fontWeight = if (isSelected) FontWeight.Black else FontWeight.Medium,
                  fontFamily = FontFamily.Monospace,
                  letterSpacing = 0.5.sp
                )
              },
              colors = NavigationBarItemDefaults.colors(
                selectedIconColor = Color.White,
                selectedTextColor = Color.White,
                indicatorColor = Color(0xFF18181B),
                unselectedIconColor = Color(0xFF52525B),
                unselectedTextColor = Color(0xFF52525B)
              )
            )
          }
        }
      }
    }
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .background(MaterialTheme.colorScheme.background)
    ) {
      when (selectedTab) {
        RamsNavTab.TELEMETRY -> {
          TelemetryScreen(
            imu = imu,
            imuHistory = imuHistory,
            peakG = peakG,
            onResetPeakG = { viewModel.resetPeakG() }
          )
        }
        RamsNavTab.MAP -> {
          MapScreen(
            gps = gps,
            imu = imu,
            events = allEvents,
            selectedEvent = selectedEvent,
            onSelectEvent = { viewModel.selectEvent(it) },
            riderProfile = riderProfile,
            onOpenLoginDialog = { selectedTab = RamsNavTab.SETTINGS },
            filteredEvents = filteredEvents,
            activeFilter = activeFilter,
            searchQuery = searchQuery,
            onFilterChange = { viewModel.setFilter(it) },
            onSearchChange = { viewModel.setSearch(it) }
          )
        }
        RamsNavTab.WEARABLE -> {
          WearableScreen(
            linkStatus = linkStatus,
            syncStatus = syncStatus,
            syncEngine = viewModel.esp32SyncEngine,
            gps = gps,
            imu = imu,
            riderProfile = riderProfile,
            discoveredDevices = discoveredDevices,
            isScanningBluetooth = isScanningBluetooth,
            isBluetoothEnabled = isBluetoothEnabled,
            onStartBluetoothScan = { viewModel.startBluetoothDiscovery() },
            onStopBluetoothScan = { viewModel.stopBluetoothDiscovery() },
            onConnectDevice = { viewModel.connectWearableDevice(it) },
            onRequestEnableBluetooth = {
              val enableBtIntent = android.content.Intent(android.bluetooth.BluetoothAdapter.ACTION_REQUEST_ENABLE)
              bluetoothEnableLauncher.launch(enableBtIntent)
            }
          )
        }
        RamsNavTab.SETTINGS -> {
          SettingsScreen(
            riderProfile = riderProfile,
            onSaveProfile = { viewModel.saveRiderProfile(it) },
            onOpenDesignRules = { viewModel.setDesignRulesDialogVisible(true) },
            onOpenCsvDialog = { viewModel.setCsvDialogVisible(true) },
            onToggleTheme = { viewModel.toggleTheme() },
            isDarkTheme = isDarkTheme
          )
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
}
