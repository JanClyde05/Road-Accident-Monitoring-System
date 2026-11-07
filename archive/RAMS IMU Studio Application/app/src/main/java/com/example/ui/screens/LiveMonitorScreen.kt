package com.example.ui.screens

import android.content.Context
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.ui.res.painterResource
import com.example.R
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessibilityNew
import androidx.compose.material.icons.filled.AltRoute
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.DirectionsRun
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.FiberManualRecord
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.PersonalInjury
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Vibration
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ImuCategory
import com.example.model.ImuClassType
import com.example.model.RecordingStatus
import com.example.model.TelemetryLiveState
import com.example.service.ImuCollectorService
import com.example.ui.MainViewModel
import com.example.ui.components.OscilloscopeCanvas
import com.example.ui.components.TelemetryHud
import com.example.ui.theme.AccidentRedIcon
import com.example.ui.theme.BorderSubtle
import com.example.ui.theme.MonoBorder
import com.example.ui.theme.MonoBorderLight
import com.example.ui.theme.MonoDarkGray
import com.example.ui.theme.MonoLightGray
import com.example.ui.theme.MonoMediumGray
import com.example.ui.theme.MonoMutedGray
import com.example.ui.theme.MonoWhite
import com.example.ui.theme.NormalGreenIcon
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.SurfaceVariantDark
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun LiveMonitorScreen(
    viewModel: MainViewModel,
    telemetryState: TelemetryLiveState,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var showGyroScope by remember { mutableStateOf(false) }
    val ringSamples = remember(telemetryState.currentSample) {
        ImuCollectorService.liveRingBuffer.toList().ifEmpty {
            viewModel.sensorManager.recentSamplesRingBuffer.toList()
        }
    }

    val isRecording = telemetryState.status == RecordingStatus.RECORDING
    val isCountdown = telemetryState.status == RecordingStatus.COUNTDOWN

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(14.dp)
            .testTag("live_monitor_screen")
    ) {
        // App banner with official project logo & system status in Monochrome
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Official Project Logo
                Image(
                    painter = painterResource(id = R.drawable.rams_project_logo),
                    contentDescription = "RAMS Logo",
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .border(1.dp, MonoBorder, RoundedCornerShape(8.dp))
                )

                Spacer(modifier = Modifier.width(10.dp))

                Column {
                    Text(
                        text = "ROAD ACCIDENT MONITORING SYSTEM",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.2.sp,
                            fontWeight = FontWeight.Bold,
                            fontSize = 9.sp
                        ),
                        color = MonoMediumGray
                    )
                    Text(
                        text = "IMU Telemetry Collector",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = MonoWhite
                    )
                }
            }

            // Monochrome Mode indicator pill
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(if (isRecording) MonoWhite else Color(0xFF141414))
                    .border(
                        1.dp,
                        if (isRecording) MonoWhite else MonoBorder,
                        RoundedCornerShape(16.dp)
                    )
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(if (isRecording) Color.Black else MonoWhite)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (isRecording) "RECORDING" else "IDLE",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        ),
                        color = if (isRecording) Color.Black else MonoWhite
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Real-Time Oscilloscope Waveform Canvas in Monochrome
        OscilloscopeCanvas(
            samples = ringSamples,
            showGyroscope = showGyroScope,
            title = if (!showGyroScope) "ACCELEROMETER STREAM (m/s²)" else "GYROSCOPE STREAM (rad/s)",
            modifier = Modifier
                .fillMaxWidth()
                .height(185.dp)
        )

        // Waveform toggle button row in Monochrome
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.End
        ) {
            FilterChip(
                selected = !showGyroScope,
                onClick = { showGyroScope = false },
                label = { Text("Accel X/Y/Z + SVM", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFF262626),
                    selectedLabelColor = MonoWhite,
                    containerColor = Color(0xFF0F0F0F),
                    labelColor = MonoMediumGray
                ),
                border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = !showGyroScope,
                    borderColor = if (!showGyroScope) MonoWhite else MonoBorder
                )
            )
            Spacer(modifier = Modifier.width(6.dp))
            FilterChip(
                selected = showGyroScope,
                onClick = { showGyroScope = true },
                label = { Text("Gyroscope", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFF262626),
                    selectedLabelColor = MonoWhite,
                    containerColor = Color(0xFF0F0F0F),
                    labelColor = MonoMediumGray
                ),
                border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = showGyroScope,
                    borderColor = if (showGyroScope) MonoWhite else MonoBorder
                )
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Telemetry Digital HUD
        TelemetryHud(state = telemetryState)

        Spacer(modifier = Modifier.height(14.dp))

        // Target Label Selection Matrix
        Text(
            text = "SELECT EVENT LABEL TO RECORD",
            style = MaterialTheme.typography.labelMedium.copy(
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.2.sp
            ),
            color = MonoMediumGray
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Positive Accident Section - custom icons retain native RED color
        Text(
            text = "Accident Events (Positive Class)",
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.Bold
            ),
            color = MonoWhite
        )
        Spacer(modifier = Modifier.height(4.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            ImuClassType.values().filter { it.category == ImuCategory.POSITIVE }.forEach { type ->
                MonochromeClassBadgeChip(
                    type = type,
                    isSelected = telemetryState.activeClass == type,
                    onClick = { viewModel.selectClass(type) }
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Negative ADL Rejection Section - custom icons retain native NEON GREEN color
        Text(
            text = "ADL & False-Positive Filters (Negative Class)",
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.Bold
            ),
            color = MonoWhite
        )
        Spacer(modifier = Modifier.height(4.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            ImuClassType.values().filter { it.category == ImuCategory.NEGATIVE }.forEach { type ->
                MonochromeClassBadgeChip(
                    type = type,
                    isSelected = telemetryState.activeClass == type,
                    onClick = { viewModel.selectClass(type) }
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Active Class Description Card (Monochrome surface, icon retains native color)
        val active = telemetryState.activeClass
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = SurfaceVariantDark
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, MonoBorder),
            shape = RoundedCornerShape(8.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Native icon color preserved
                Icon(
                    imageVector = getIconForClass(active),
                    contentDescription = null,
                    tint = if (active.isPositive) AccidentRedIcon else NormalGreenIcon,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = active.displayName,
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold
                            ),
                            color = MonoWhite
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(3.dp))
                                .background(Color(0xFF262626))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = if (active.isPositive) "ACCIDENT POSITIVE" else "ADL CONTROL",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                ),
                                color = MonoLightGray
                            )
                        }
                    }
                    Text(
                        text = active.description,
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                        color = MonoMediumGray
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Duration selector pills in Monochrome
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "TRIAL DURATION:",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                ),
                color = MonoMediumGray
            )

            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                listOf(5, 10, 15, 30, 0).forEach { sec ->
                    val label = if (sec == 0) "Free" else "${sec}s"
                    val isSelected = telemetryState.targetDurationSec == sec
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(if (isSelected) MonoWhite else Color(0xFF121212))
                            .border(1.dp, if (isSelected) MonoWhite else MonoBorder, RoundedCornerShape(4.dp))
                            .clickable { viewModel.setTargetDuration(sec) }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = label,
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontFamily = FontFamily.Monospace,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            ),
                            color = if (isSelected) Color.Black else MonoMediumGray
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Primary Record Trigger Button in Monochrome Black & White
        Button(
            onClick = {
                if (isRecording) {
                    viewModel.stopRecording(context)
                } else {
                    viewModel.startRecording(context, useCountdown = true)
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp)
                .testTag("record_toggle_button"),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isRecording) Color(0xFF1E1E1E) else MonoWhite,
                contentColor = if (isRecording) MonoWhite else Color.Black
            ),
            border = if (isRecording) androidx.compose.foundation.BorderStroke(1.5.dp, MonoWhite) else null,
            shape = RoundedCornerShape(8.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                if (isCountdown) {
                    Text(
                        text = "STARTING IN ${telemetryState.countdownRemaining}...",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            fontFamily = FontFamily.Monospace
                        )
                    )
                } else if (isRecording) {
                    Icon(
                        imageVector = Icons.Default.Stop,
                        contentDescription = null,
                        tint = AccidentRedIcon,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    val sec = telemetryState.elapsedMs / 1000
                    Text(
                        text = "STOP & SAVE RECORDING (${sec}s / ${telemetryState.recordedSampleCount} pts)",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            fontFamily = FontFamily.Monospace
                        )
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.FiberManualRecord,
                        contentDescription = null,
                        tint = AccidentRedIcon,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "RECORD [${telemetryState.activeClass.displayName.uppercase()}] TRIAL",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            fontFamily = FontFamily.Monospace
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Monochrome helper text
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "✓ Continuous Foreground Service: records in background when minimized or locked",
                style = MaterialTheme.typography.bodySmall.copy(
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                ),
                color = MonoMutedGray
            )
        }
    }
}

@Composable
private fun MonochromeClassBadgeChip(
    type: ImuClassType,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val borderColor = if (isSelected) MonoWhite else MonoBorder
    val bgColor = if (isSelected) Color(0xFF242424) else Color(0xFF0F0F0F)

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(bgColor)
            .border(1.dp, borderColor, RoundedCornerShape(6.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 7.dp)
            .testTag("class_chip_${type.id.lowercase()}")
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            // ONLY CUSTOM ICONS RETAIN THEIR NATIVE COLORS (Red for accidents, neon green for ADL)
            Icon(
                imageVector = getIconForClass(type),
                contentDescription = null,
                tint = if (type.isPositive) AccidentRedIcon else NormalGreenIcon,
                modifier = Modifier.size(15.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = type.displayName,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                    fontSize = 12.sp
                ),
                color = if (isSelected) MonoWhite else MonoMediumGray
            )
        }
    }
}

fun getIconForClass(type: ImuClassType): ImageVector {
    return when (type) {
        ImuClassType.FALL -> Icons.Default.PersonalInjury
        ImuClassType.IMPACT -> Icons.Default.FlashOn
        ImuClassType.SKIDDING -> Icons.Default.AltRoute
        ImuClassType.WALKING -> Icons.Default.DirectionsWalk
        ImuClassType.RUNNING -> Icons.Default.DirectionsRun
        ImuClassType.JUMPING -> Icons.Default.AccessibilityNew
        ImuClassType.PHONE_FALLING -> Icons.Default.Smartphone
        ImuClassType.PHONE_SHAKING -> Icons.Default.Vibration
        ImuClassType.NORMAL_VEHICLE_RIDE -> Icons.Default.DirectionsCar
    }
}
