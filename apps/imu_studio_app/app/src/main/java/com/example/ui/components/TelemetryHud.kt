package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.ScreenRotation
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.TelemetryLiveState
import com.example.ui.theme.AccidentRedIcon
import com.example.ui.theme.IconJerk
import com.example.ui.theme.IconRotation
import com.example.ui.theme.IconSpeed
import com.example.ui.theme.IconTilt
import com.example.ui.theme.MonoBorder
import com.example.ui.theme.MonoMediumGray
import com.example.ui.theme.MonoMutedGray
import com.example.ui.theme.MonoWhite
import com.example.ui.theme.NormalGreenIcon
import com.example.ui.theme.SurfaceDark
import java.util.Locale

@Composable
fun TelemetryHud(
    state: TelemetryLiveState,
    modifier: Modifier = Modifier
) {
    val sample = state.currentSample

    Column(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(SurfaceDark)
            .border(1.dp, MonoBorder, RoundedCornerShape(8.dp))
            .padding(12.dp)
            .testTag("telemetry_hud_panel")
    ) {
        // Top status row with colored status indicator dot
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(7.dp)
                        .clip(CircleShape)
                        .background(if (state.isBackgroundServiceRunning) AccidentRedIcon else NormalGreenIcon)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (state.isBackgroundServiceRunning) "REC ORDER ACTIVE (BKG)" else "IMU STREAM ONLINE",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp
                    ),
                    color = if (state.isBackgroundServiceRunning) AccidentRedIcon else NormalGreenIcon
                )
            }

            Text(
                text = "${String.format(Locale.US, "%.0f", state.samplingRateHz)} Hz | ${state.recordedSampleCount} pts",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp
                ),
                color = MonoMediumGray
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Grid of 4 digital meters with custom colored icons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            HudMeterItem(
                label = "ACCEL SVM",
                value = String.format(Locale.US, "%.2f", sample.svmG),
                unit = "G",
                subText = "Peak: ${String.format(Locale.US, "%.2f", state.peakSvmG)}G",
                icon = Icons.Default.Speed,
                iconColor = IconSpeed,
                modifier = Modifier.weight(1f)
            )

            HudMeterItem(
                label = "ROTATION",
                value = String.format(Locale.US, "%.2f", sample.gyroMag),
                unit = "rad/s",
                subText = "Peak: ${String.format(Locale.US, "%.2f", state.peakGyroMag)}",
                icon = Icons.Default.Sync,
                iconColor = IconRotation,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            HudMeterItem(
                label = "JERK RATE",
                value = String.format(Locale.US, "%.1f", sample.jerk),
                unit = "m/s³",
                subText = "Peak: ${String.format(Locale.US, "%.0f", state.peakJerk)}",
                icon = Icons.Default.ElectricBolt,
                iconColor = IconJerk,
                modifier = Modifier.weight(1f)
            )

            HudMeterItem(
                label = "ORIENTATION",
                value = "${sample.pitch.toInt()}°",
                unit = "PITCH",
                subText = "Roll: ${sample.roll.toInt()}°",
                icon = Icons.Default.ScreenRotation,
                iconColor = IconTilt,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun HudMeterItem(
    label: String,
    value: String,
    unit: String,
    subText: String,
    icon: ImageVector,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(Color(0xFF000000))
            .border(1.dp, MonoBorder, RoundedCornerShape(6.dp))
            .padding(8.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    ),
                    color = MonoMutedGray
                )
                // Custom colored meter icon
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(14.dp)
                )
            }

            Spacer(modifier = Modifier.height(3.dp))

            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = value,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 18.sp
                    ),
                    color = MonoWhite
                )
                Spacer(modifier = Modifier.width(3.dp))
                Text(
                    text = unit,
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontSize = 9.sp,
                        fontFamily = FontFamily.Monospace
                    ),
                    color = MonoMediumGray,
                    modifier = Modifier.padding(bottom = 2.dp)
                )
            }

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = subText,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace
                ),
                color = MonoMutedGray
            )
        }
    }
}
