package com.example.ui.screens

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.ui.res.painterResource
import com.example.R
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessibilityNew
import androidx.compose.material.icons.filled.AltRoute
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.DirectionsRun
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.PersonalInjury
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material.icons.filled.Vibration
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AccidentRedIcon
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.MonoBorder
import com.example.ui.theme.MonoBorderLight
import com.example.ui.theme.MonoLightGray
import com.example.ui.theme.MonoMediumGray
import com.example.ui.theme.MonoMutedGray
import com.example.ui.theme.MonoOffWhite
import com.example.ui.theme.MonoWhite
import com.example.ui.theme.NormalGreenIcon
import kotlinx.coroutines.delay
import java.util.Locale

@Composable
fun LoadingScreen(
    onFinished: () -> Unit,
    modifier: Modifier = Modifier
) {
    val totalBufferDurationMs = 7000L
    var elapsedMs by remember { mutableFloatStateOf(0f) }

    LaunchedEffect(Unit) {
        val intervalMs = 50L
        while (elapsedMs < totalBufferDurationMs) {
            delay(intervalMs)
            elapsedMs = (elapsedMs + intervalMs).coerceAtMost(totalBufferDurationMs.toFloat())
        }
        delay(200) // Brief final settling pause
        onFinished()
    }

    val progress = (elapsedMs / totalBufferDurationMs).coerceIn(0f, 1f)
    val remainingSec = ((totalBufferDurationMs - elapsedMs) / 1000f).coerceAtLeast(0f)

    // Infinite rotation for the radar IMU calibration ring
    val infiniteTransition = rememberInfiniteTransition(label = "gyro_rotation")
    val rotationAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(2400, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "angle"
    )

    val currentStatusText = when {
        elapsedMs < 1400f -> "INITIALIZING 6-AXIS IMU SENSORS & ACCEL STREAM..."
        elapsedMs < 2800f -> "CALIBRATING ZERO-G BASELINE & GYROSCOPE OFFSET..."
        elapsedMs < 4200f -> "PRE-ALLOCATING HIGH-SPEED CIRCULAR RING BUFFERS..."
        elapsedMs < 5600f -> "LOADING ACCIDENT CLASSIFIER & ADL NEGATION FILTERS..."
        elapsedMs < 6800f -> "SYNCHRONIZING DESKTOP MONOCHROME TELEMETRY VAULT..."
        else -> "BUFFER READY. LAUNCHING RAMS TELEMETRY STUDIO..."
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(24.dp)
            .testTag("loading_screen_buffer"),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Rotating Telemetry Radar Scope with Official Logo INSIDE the spinning animation
            Box(
                modifier = Modifier.size(150.dp),
                contentAlignment = Alignment.Center
            ) {
                // Spinning outer radar scope & calibration arcs
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .rotate(rotationAngle)
                ) {
                    val radius = size.minDimension / 2f
                    val center = Offset(size.width / 2f, size.height / 2f)

                    // Outer static guide circle
                    drawCircle(
                        color = Color(0xFF2E2E2E),
                        radius = radius - 4f,
                        style = Stroke(width = 1.5f)
                    )

                    // Concentric mid radar circle
                    drawCircle(
                        color = Color(0xFF1F1F1F),
                        radius = radius * 0.85f,
                        style = Stroke(width = 1f)
                    )

                    // Primary rotating sweep arc (Pure white)
                    drawArc(
                        color = MonoWhite,
                        startAngle = 0f,
                        sweepAngle = 120f,
                        useCenter = false,
                        style = Stroke(width = 3.5f, cap = StrokeCap.Round)
                    )

                    // Secondary trailing sweep arc (Gray)
                    drawArc(
                        color = MonoMediumGray,
                        startAngle = 180f,
                        sweepAngle = 80f,
                        useCenter = false,
                        style = Stroke(width = 2.5f, cap = StrokeCap.Round)
                    )
                }

                // Radar reticle cardinal tick marks
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val radius = size.minDimension / 2f
                    val center = Offset(size.width / 2f, size.height / 2f)
                    val tickLen = 8f

                    // Top tick
                    drawLine(Color(0xFF666666), Offset(center.x, center.y - radius + 4f), Offset(center.x, center.y - radius + 4f + tickLen), strokeWidth = 2f)
                    // Bottom tick
                    drawLine(Color(0xFF666666), Offset(center.x, center.y + radius - 4f - tickLen), Offset(center.x, center.y + radius - 4f), strokeWidth = 2f)
                    // Left tick
                    drawLine(Color(0xFF666666), Offset(center.x - radius + 4f, center.y), Offset(center.x - radius + 4f + tickLen, center.y), strokeWidth = 2f)
                    // Right tick
                    drawLine(Color(0xFF666666), Offset(center.x + radius - 4f - tickLen, center.y), Offset(center.x + radius - 4f, center.y), strokeWidth = 2f)
                }

                // Official Project Logo centered INSIDE the spinning animation
                Image(
                    painter = painterResource(id = R.drawable.rams_project_logo),
                    contentDescription = "RAMS Official Project Logo",
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .border(2.dp, MonoBorderLight, CircleShape)
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Monochrome Headers
            Text(
                text = "ROAD ACCIDENT MONITORING SYSTEM",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 2.sp,
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp
                ),
                color = MonoMediumGray
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "RAMS IMU STUDIO",
                style = MaterialTheme.typography.headlineSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.sp
                ),
                color = MonoWhite
            )

            Text(
                text = "Wearable Companion Buffer Loading",
                style = MaterialTheme.typography.bodySmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp
                ),
                color = MonoMutedGray
            )

            Spacer(modifier = Modifier.height(28.dp))

            // 7-Second Progress Bar
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.85f)
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(Color(0xFF1F1F1F))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(progress)
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp))
                        .background(MonoWhite)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Timer & Percentage readout in Monochrome
            Row(
                modifier = Modifier.fillMaxWidth(0.85f),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "BUFFER: ${String.format(Locale.US, "%.1f", remainingSec)}s",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    ),
                    color = MonoWhite
                )

                Text(
                    text = "${(progress * 100).toInt()}%",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    ),
                    color = MonoMediumGray
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Diagnostic status line
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.92f)
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color(0xFF0F0F0F))
                    .border(1.dp, MonoBorder, RoundedCornerShape(6.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Text(
                    text = currentStatusText,
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        lineHeight = 14.sp
                    ),
                    color = MonoLightGray
                )
            }

            Spacer(modifier = Modifier.height(30.dp))

            // Custom Icons Display (The ONLY elements retaining their native colors per request)
            Text(
                text = "TARGET EVENT PROFILES",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 1.2.sp,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold
                ),
                color = MonoMutedGray
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Accident Positive Icons (Retain Red)
                Icon(
                    imageVector = Icons.Default.PersonalInjury,
                    contentDescription = "Fall",
                    tint = AccidentRedIcon,
                    modifier = Modifier.size(18.dp)
                )
                Icon(
                    imageVector = Icons.Default.FlashOn,
                    contentDescription = "Impact",
                    tint = AccidentRedIcon,
                    modifier = Modifier.size(18.dp)
                )
                Icon(
                    imageVector = Icons.Default.AltRoute,
                    contentDescription = "Skidding",
                    tint = AccidentRedIcon,
                    modifier = Modifier.size(18.dp)
                )

                // Divider in monochrome
                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .height(16.dp)
                        .background(MonoBorder)
                )

                // ADL Negative Icons (Retain Neon Green)
                Icon(
                    imageVector = Icons.Default.DirectionsWalk,
                    contentDescription = "Walking",
                    tint = NormalGreenIcon,
                    modifier = Modifier.size(18.dp)
                )
                Icon(
                    imageVector = Icons.Default.DirectionsRun,
                    contentDescription = "Running",
                    tint = NormalGreenIcon,
                    modifier = Modifier.size(18.dp)
                )
                Icon(
                    imageVector = Icons.Default.AccessibilityNew,
                    contentDescription = "Jumping",
                    tint = NormalGreenIcon,
                    modifier = Modifier.size(18.dp)
                )
                Icon(
                    imageVector = Icons.Default.Smartphone,
                    contentDescription = "Phone Falling",
                    tint = NormalGreenIcon,
                    modifier = Modifier.size(18.dp)
                )
                Icon(
                    imageVector = Icons.Default.Vibration,
                    contentDescription = "Phone Shaking",
                    tint = NormalGreenIcon,
                    modifier = Modifier.size(18.dp)
                )
                Icon(
                    imageVector = Icons.Default.DirectionsCar,
                    contentDescription = "Vehicle",
                    tint = NormalGreenIcon,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Skip button
            OutlinedButton(
                onClick = onFinished,
                shape = RoundedCornerShape(6.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = MonoMediumGray
                ),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF333333)),
                modifier = Modifier.testTag("skip_buffer_button")
            ) {
                Text(
                    text = "SKIP BUFFER (${String.format(Locale.US, "%.0f", remainingSec)}s)",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp
                    ),
                    color = MonoMediumGray
                )
            }
        }
    }
}
