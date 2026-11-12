package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ImuData
import com.example.ui.components.AttitudeIndicator
import com.example.ui.components.ImuWaveformChart
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber
import java.util.Locale

/**
 * User-Friendly Rider Safety Dashboard.
 *
 * Implements high-level abstraction:
 * - Clear, glanceable safety status for riders.
 * - Minimalist G-Force and lean attitude indicators.
 * - Advanced engineering waveforms and raw sensor dumps encapsulated
 *   under an expandable diagnostics toggle.
 */
@Composable
fun TelemetryScreen(
    imu: ImuData,
    imuHistory: List<ImuData>,
    peakG: Float,
    onResetPeakG: () -> Unit,
    onNavigateToAi: (() -> Unit)? = null
) {
    var showAdvancedDiagnostics by remember { mutableStateOf(false) }

    val gForceColor = when {
        imu.aMag >= 3.0f -> RamsAlertRed
        imu.aMag >= 1.6f -> RamsWarningAmber
        else -> RamsSuccessEmerald
    }

    val statusText = when {
        imu.aMag >= 3.0f -> "CRITICAL IMPACT DETECTED"
        imu.aMag >= 1.6f -> "ROAD IMPULSE / CAUTION"
        else -> "ALL SYSTEMS GUARDED"
    }

    val statusSubtitle = when {
        imu.aMag >= 3.0f -> "Emergency SOS beacon active"
        imu.aMag >= 1.6f -> "Filtering non-vehicular false alarms"
        else -> "Watching for crashes and falls | 100% Offline AI"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 14.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // 1. Hero Rider Safety Shield Card (High Abstraction)
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .then(if (onNavigateToAi != null) Modifier.clickable { onNavigateToAi() } else Modifier),
            shape = RoundedCornerShape(16.dp),
            color = Color(0xFF18181B),
            border = BorderStroke(1.dp, Color(0xFF27272A))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Central Glowing Shield Icon
                Box(
                    modifier = Modifier.size(64.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Canvas(modifier = Modifier.size(56.dp)) {
                        val path = Path().apply {
                            val w = size.width
                            val h = size.height
                            moveTo(w * 0.5f, 0f)
                            lineTo(w * 0.95f, h * 0.2f)
                            lineTo(w * 0.95f, h * 0.6f)
                            cubicTo(w * 0.95f, h * 0.85f, w * 0.5f, h, w * 0.5f, h)
                            cubicTo(w * 0.5f, h, w * 0.05f, h * 0.85f, w * 0.05f, h * 0.6f)
                            lineTo(w * 0.05f, h * 0.2f)
                            close()
                        }
                        drawPath(path, color = gForceColor.copy(alpha = 0.15f))
                        drawPath(path, color = gForceColor, style = Stroke(width = 2.dp.toPx()))

                        // Inner checkmark
                        val check = Path().apply {
                            moveTo(size.width * 0.35f, size.height * 0.5f)
                            lineTo(size.width * 0.48f, size.height * 0.63f)
                            lineTo(size.width * 0.68f, size.height * 0.38f)
                        }
                        drawPath(check, color = gForceColor, style = Stroke(width = 2.5.dp.toPx()))
                    }
                }

                Text(
                    text = statusText,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace,
                    color = Color.White,
                    letterSpacing = 0.5.sp
                )

                Text(
                    text = statusSubtitle,
                    fontSize = 11.sp,
                    color = Color(0xFFA1A1AA)
                )
            }
        }

        // 2. Glanceable Rider Metrics Row (G-Force & Session Peak)
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            color = Color(0xFF18181B),
            border = BorderStroke(1.dp, Color(0xFF27272A))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Live G-Force
                Column {
                    Text(
                        text = "LIVE ACCELERATION",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFFA1A1AA)
                    )
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = String.format(Locale.US, "%.2f", imu.aMag),
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = gForceColor
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "G",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFF71717A),
                            modifier = Modifier.padding(bottom = 5.dp)
                        )
                    }
                }

                // Session Peak with Reset
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFF09090B),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "PEAK G",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFF71717A)
                            )
                            Text(
                                text = String.format(Locale.US, "%.2f G", peakG),
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = if (peakG >= 3.0f) RamsAlertRed else Color.White
                            )
                        }
                        IconButton(
                            onClick = onResetPeakG,
                            modifier = Modifier.size(26.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Reset Peak",
                                tint = Color(0xFFA1A1AA),
                                modifier = Modifier.size(15.dp)
                            )
                        }
                    }
                }
            }
        }

        // 3. 3D Attitude Horizon & Lean Angle
        AttitudeIndicator(
            pitch = imu.pitchDegrees,
            roll = imu.rollDegrees,
            yaw = imu.yawDegrees,
            accelX = imu.accelX,
            accelY = imu.accelY,
            accelZ = imu.accelZ
        )

        // 4. Encapsulation: Advanced Diagnostics Accordion (Hidden by default)
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            color = Color(0xFF18181B),
            border = BorderStroke(1.dp, Color(0xFF27272A))
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Header Toggle Button
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showAdvancedDiagnostics = !showAdvancedDiagnostics }
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "ADVANCED SENSOR DIAGNOSTICS",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFFA1A1AA)
                        )
                    }

                    Icon(
                        imageVector = if (showAdvancedDiagnostics) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = "Toggle Diagnostics",
                        tint = Color(0xFFA1A1AA),
                        modifier = Modifier.size(18.dp)
                    )
                }

                // Expandable Section: Oscillogram + 6-Axis Numerical Dynamics
                AnimatedVisibility(
                    visible = showAdvancedDiagnostics,
                    enter = expandVertically() + fadeIn(),
                    exit = shrinkVertically() + fadeOut()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 6.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Oscillogram Waveform
                        ImuWaveformChart(
                            history = imuHistory,
                            latestImu = imu
                        )

                        // 6-Axis Cells
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            MetricCell(label = "AX", value = String.format(Locale.US, "%+.2f", imu.accelX), modifier = Modifier.weight(1f))
                            MetricCell(label = "AY", value = String.format(Locale.US, "%+.2f", imu.accelY), modifier = Modifier.weight(1f))
                            MetricCell(label = "AZ", value = String.format(Locale.US, "%+.2f", imu.accelZ), modifier = Modifier.weight(1f))
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            MetricCell(label = "GX", value = String.format(Locale.US, "%+.1f dps", imu.gyroX), modifier = Modifier.weight(1f))
                            MetricCell(label = "GY", value = String.format(Locale.US, "%+.1f dps", imu.gyroY), modifier = Modifier.weight(1f))
                            MetricCell(label = "GZ", value = String.format(Locale.US, "%+.1f dps", imu.gyroZ), modifier = Modifier.weight(1f))
                        }

                        Spacer(modifier = Modifier.height(4.dp))
                    }
                }
            }
        }

        // Bottom breathing room to scroll above floating Voice AI button
        Spacer(modifier = Modifier.height(88.dp))
    }
}

@Composable
private fun MetricCell(
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(6.dp),
        color = Color(0xFF09090B),
        border = BorderStroke(1.dp, Color(0xFF27272A))
    ) {
        Column(modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp)) {
            Text(
                text = label,
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = Color(0xFF71717A),
                maxLines = 1,
                softWrap = false
            )
            Text(
                text = value,
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                color = Color.White,
                maxLines = 1,
                softWrap = false
            )
        }
    }
}
