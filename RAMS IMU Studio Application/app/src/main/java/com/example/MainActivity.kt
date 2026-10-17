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
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.AppTab
import com.example.ui.MainViewModel
import com.example.ui.screens.CorrelationStudioScreen
import com.example.ui.screens.DatasetVaultScreen
import com.example.ui.screens.LiveMonitorScreen
import com.example.ui.screens.LoadingScreen
import com.example.ui.screens.SystemInfoScreen
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.IconNavAnalytics
import com.example.ui.theme.IconNavStorage
import com.example.ui.theme.IconNavTimeline
import com.example.ui.theme.IconNavTune
import com.example.ui.theme.MonoMediumGray
import com.example.ui.theme.MonoMutedGray
import com.example.ui.theme.MonoWhite
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                // Request notification permission on Android 13+ (API 33+) for foreground service
                val notifLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestPermission()
                ) { /* no-op outcome */ }

                LaunchedEffect(Unit) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        notifLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                    }
                }

                // 7-second buffer loading screen on app launch
                var isBufferLoading by remember { mutableStateOf(true) }

                Crossfade(targetState = isBufferLoading, label = "screen_transition") { loading ->
                    if (loading) {
                        LoadingScreen(
                            onFinished = { isBufferLoading = false }
                        )
                    } else {
                        RamsAppContent(viewModel = viewModel)
                    }
                }
            }
        }
    }
}

@Composable
fun RamsAppContent(viewModel: MainViewModel) {
    val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()
    val telemetryState by viewModel.liveTelemetryState.collectAsStateWithLifecycle()
    val sessions by viewModel.allSessions.collectAsStateWithLifecycle()
    val correlationReport by viewModel.correlationReport.collectAsStateWithLifecycle()
    val isAnalyzing by viewModel.isAnalyzingFeatures.collectAsStateWithLifecycle()
    val selectedDetail by viewModel.selectedSessionDetail.collectAsStateWithLifecycle()
    val statusToast by viewModel.statusToast.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(statusToast) {
        statusToast?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.dismissToast()
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = BackgroundDark,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            // Navigation Bar with custom colored icons correlated to each screen function
            NavigationBar(
                modifier = Modifier
                    .windowInsetsPadding(WindowInsets.navigationBars)
                    .testTag("main_navigation_bar"),
                containerColor = SurfaceDark,
                contentColor = TextPrimary,
                tonalElevation = 0.dp
            ) {
                // 1. Live Monitor: Electric Cyan icon
                NavigationBarItem(
                    selected = currentTab == AppTab.LIVE_MONITOR,
                    onClick = { viewModel.setTab(AppTab.LIVE_MONITOR) },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Timeline,
                            contentDescription = "Live Monitor",
                            tint = if (currentTab == AppTab.LIVE_MONITOR) IconNavTimeline else IconNavTimeline.copy(alpha = 0.6f)
                        )
                    },
                    label = {
                        Text(
                            text = "Monitor",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontFamily = FontFamily.Monospace,
                                fontSize = 10.sp
                            )
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = IconNavTimeline,
                        selectedTextColor = MonoWhite,
                        indicatorColor = Color(0xFF222222),
                        unselectedIconColor = IconNavTimeline.copy(alpha = 0.6f),
                        unselectedTextColor = MonoMutedGray
                    ),
                    modifier = Modifier.testTag("nav_item_live")
                )

                // 2. Correlation Studio: Royal Purple icon
                NavigationBarItem(
                    selected = currentTab == AppTab.CORRELATION_STUDIO,
                    onClick = { viewModel.setTab(AppTab.CORRELATION_STUDIO) },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Analytics,
                            contentDescription = "Correlation",
                            tint = if (currentTab == AppTab.CORRELATION_STUDIO) IconNavAnalytics else IconNavAnalytics.copy(alpha = 0.6f)
                        )
                    },
                    label = {
                        Text(
                            text = "Correlation",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontFamily = FontFamily.Monospace,
                                fontSize = 10.sp
                            )
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = IconNavAnalytics,
                        selectedTextColor = MonoWhite,
                        indicatorColor = Color(0xFF222222),
                        unselectedIconColor = IconNavAnalytics.copy(alpha = 0.6f),
                        unselectedTextColor = MonoMutedGray
                    ),
                    modifier = Modifier.testTag("nav_item_correlation")
                )

                // 3. Datasets Vault: Emerald Green icon
                NavigationBarItem(
                    selected = currentTab == AppTab.DATASETS,
                    onClick = { viewModel.setTab(AppTab.DATASETS) },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Storage,
                            contentDescription = "Datasets",
                            tint = if (currentTab == AppTab.DATASETS) IconNavStorage else IconNavStorage.copy(alpha = 0.6f)
                        )
                    },
                    label = {
                        Text(
                            text = "Vault (${sessions.size})",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontFamily = FontFamily.Monospace,
                                fontSize = 10.sp
                            )
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = IconNavStorage,
                        selectedTextColor = MonoWhite,
                        indicatorColor = Color(0xFF222222),
                        unselectedIconColor = IconNavStorage.copy(alpha = 0.6f),
                        unselectedTextColor = MonoMutedGray
                    ),
                    modifier = Modifier.testTag("nav_item_datasets")
                )

                // 4. Diagnostics: Warm Amber icon
                NavigationBarItem(
                    selected = currentTab == AppTab.SETTINGS,
                    onClick = { viewModel.setTab(AppTab.SETTINGS) },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Tune,
                            contentDescription = "Sensors & Specs",
                            tint = if (currentTab == AppTab.SETTINGS) IconNavTune else IconNavTune.copy(alpha = 0.6f)
                        )
                    },
                    label = {
                        Text(
                            text = "Diagnostics",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontFamily = FontFamily.Monospace,
                                fontSize = 10.sp
                            )
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = IconNavTune,
                        selectedTextColor = MonoWhite,
                        indicatorColor = Color(0xFF222222),
                        unselectedIconColor = IconNavTune.copy(alpha = 0.6f),
                        unselectedTextColor = MonoMutedGray
                    ),
                    modifier = Modifier.testTag("nav_item_settings")
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(BackgroundDark)
        ) {
            when (currentTab) {
                AppTab.LIVE_MONITOR -> {
                    LiveMonitorScreen(
                        viewModel = viewModel,
                        telemetryState = telemetryState
                    )
                }
                AppTab.CORRELATION_STUDIO -> {
                    CorrelationStudioScreen(
                        viewModel = viewModel,
                        report = correlationReport,
                        isLoading = isAnalyzing
                    )
                }
                AppTab.DATASETS -> {
                    DatasetVaultScreen(
                        viewModel = viewModel,
                        sessions = sessions,
                        selectedDetail = selectedDetail
                    )
                }
                AppTab.SETTINGS -> {
                    SystemInfoScreen(
                        viewModel = viewModel
                    )
                }
            }
        }
    }
}
