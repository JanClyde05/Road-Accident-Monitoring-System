package com.example.ui.screens

import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ImuData
import com.example.ui.components.AttitudeIndicator
import com.example.ui.components.ImuWaveformChart

@Composable
fun TelemetryScreen(
  imu: ImuData,
  imuHistory: List<ImuData>,
  peakG: Float,
  onResetPeakG: () -> Unit
) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 16.dp, vertical = 12.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    // 1. Prominent G-Force Magnitude Header Card
    val gForceColor = when {
      imu.aMag >= 3.0f -> Color(0xFFEF4444)
      imu.aMag >= 1.5f -> Color(0xFFF59E0B)
      else -> Color(0xFF10B981)
    }

    Surface(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(12.dp),
      color = MaterialTheme.colorScheme.surface,
      border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text(
            text = "LIVE TOTAL ACCELERATION (G-FORCE)",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Black,
            color = Color(0xFFA1A1AA),
            letterSpacing = 1.sp
          )
          Row(verticalAlignment = Alignment.Bottom) {
            Text(
              text = String.format(java.util.Locale.US, "%.2f", imu.aMag),
              fontSize = 38.sp,
              fontWeight = FontWeight.Black,
              fontFamily = FontFamily.Monospace,
              color = gForceColor
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "g",
              fontSize = 18.sp,
              fontWeight = FontWeight.Bold,
              fontFamily = FontFamily.Monospace,
              color = Color(0xFF71717A),
              modifier = Modifier.padding(bottom = 6.dp)
            )
          }
        }

        // Peak G Pill
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = Color(0xFF09090B),
          border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Column(horizontalAlignment = Alignment.End) {
              Text(
                text = "SESSION PEAK",
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = Color(0xFF71717A)
              )
              Text(
                text = String.format(java.util.Locale.US, "%.2f g", peakG),
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                color = if (peakG >= 3.0f) Color(0xFFEF4444) else Color.White
              )
            }
            IconButton(
              onClick = onResetPeakG,
              modifier = Modifier.size(28.dp)
            ) {
              Icon(
                imageVector = Icons.Default.Refresh,
                contentDescription = "Reset Peak",
                tint = Color(0xFFA1A1AA),
                modifier = Modifier.size(16.dp)
              )
            }
          }
        }
      }
    }

    // 2. Real-Time Oscillogram Sparkline Waveform
    ImuWaveformChart(
      history = imuHistory,
      latestImu = imu
    )

    // 3. 3D Attitude Horizon & Lean Gyro Indicator
    AttitudeIndicator(
      pitch = imu.pitchDegrees,
      roll = imu.rollDegrees,
      yaw = imu.yawDegrees,
      accelX = imu.accelX,
      accelY = imu.accelY,
      accelZ = imu.accelZ
    )

    // 4. Live Vector Telemetry Breakdown (Production Monitoring)
    Surface(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(12.dp),
      color = MaterialTheme.colorScheme.surface,
      border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
    ) {
      Column(
        modifier = Modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "LIVE SENSOR DYNAMICS",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Black,
            color = Color(0xFFA1A1AA),
            letterSpacing = 1.sp
          )
          Surface(
            shape = RoundedCornerShape(4.dp),
            color = Color(0xFF3B82F6).copy(alpha = 0.15f),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF3B82F6).copy(alpha = 0.4f))
          ) {
            Text(
              text = "50Hz STREAM",
              modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = Color(0xFF3B82F6)
            )
          }
        }

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          TelemetryMetricCell(
            label = "ACCEL X",
            value = String.format(java.util.Locale.US, "%+.2f g", imu.accelX),
            modifier = Modifier.weight(1f)
          )
          TelemetryMetricCell(
            label = "ACCEL Y",
            value = String.format(java.util.Locale.US, "%+.2f g", imu.accelY),
            modifier = Modifier.weight(1f)
          )
          TelemetryMetricCell(
            label = "ACCEL Z",
            value = String.format(java.util.Locale.US, "%+.2f g", imu.accelZ),
            modifier = Modifier.weight(1f)
          )
        }

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          TelemetryMetricCell(
            label = "GYRO ROLL",
            value = String.format(java.util.Locale.US, "%+.1f °/s", imu.gyroX),
            modifier = Modifier.weight(1f)
          )
          TelemetryMetricCell(
            label = "GYRO PITCH",
            value = String.format(java.util.Locale.US, "%+.1f °/s", imu.gyroY),
            modifier = Modifier.weight(1f)
          )
          TelemetryMetricCell(
            label = "GYRO YAW",
            value = String.format(java.util.Locale.US, "%+.1f °/s", imu.gyroZ),
            modifier = Modifier.weight(1f)
          )
        }
      }
    }
  }
}

@Composable
private fun TelemetryMetricCell(
  label: String,
  value: String,
  modifier: Modifier = Modifier
) {
  Surface(
    modifier = modifier,
    shape = RoundedCornerShape(8.dp),
    color = Color(0xFF09090B),
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
  ) {
    Column(modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)) {
      Text(
        text = label,
        fontSize = 8.5.sp,
        fontWeight = FontWeight.Bold,
        fontFamily = FontFamily.Monospace,
        color = Color(0xFF71717A)
      )
      Text(
        text = value,
        fontSize = 12.sp,
        fontWeight = FontWeight.Black,
        fontFamily = FontFamily.Monospace,
        color = Color.White
      )
    }
  }
}
