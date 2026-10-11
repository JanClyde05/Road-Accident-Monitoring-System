package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ImuData
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import java.util.Locale

@Composable
fun ImuWaveformChart(
  history: List<ImuData>,
  latestImu: ImuData,
  modifier: Modifier = Modifier
) {
  var selectedTab by remember { mutableStateOf("ACCEL") }

  Surface(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(8.dp))
      .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
      .testTag("imu_waveform_chart_widget"),
    color = MaterialTheme.colorScheme.surface
  ) {
    Column(modifier = Modifier.padding(16.dp)) {
      // Header & Mode Switch
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column(modifier = Modifier.weight(1f)) {
          Text(
            text = "LIVE IMU OSCILLOGRAM",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
          Text(
            text = "LAST 50 SAMPLES (50Hz)",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 9.sp,
            color = MaterialTheme.colorScheme.onSurface
          )
        }

        Row(
          modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp))
        ) {
          Box(
            modifier = Modifier
              .clickable { selectedTab = "ACCEL" }
              .background(if (selectedTab == "ACCEL") MaterialTheme.colorScheme.primary else Color.Transparent)
              .padding(horizontal = 8.dp, vertical = 4.dp)
          ) {
            Text(
              text = "ACCEL (G)",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              softWrap = false,
              color = if (selectedTab == "ACCEL") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
            )
          }

          Box(
            modifier = Modifier
              .clickable { selectedTab = "GYRO" }
              .background(if (selectedTab == "GYRO") MaterialTheme.colorScheme.primary else Color.Transparent)
              .padding(horizontal = 8.dp, vertical = 4.dp)
          ) {
            Text(
              text = "GYRO (°/s)",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              softWrap = false,
              color = if (selectedTab == "GYRO") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Waveform Canvas Screen
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(100.dp)
          .clip(RoundedCornerShape(4.dp))
          .background(Color(0xFF09090B))
          .border(1.dp, Color(0xFF27272A), RoundedCornerShape(4.dp))
      ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
          val w = size.width
          val h = size.height
          val midY = h / 2f

          // Horizontal Grid lines (center baseline & +/- bounds)
          drawLine(
            color = Color(0xFF27272A),
            start = Offset(0f, midY),
            end = Offset(w, midY),
            strokeWidth = 1.dp.toPx()
          )
          drawLine(
            color = Color(0xFF18181B),
            start = Offset(0f, midY - h * 0.35f),
            end = Offset(w, midY - h * 0.35f),
            strokeWidth = 0.8.dp.toPx()
          )
          drawLine(
            color = Color(0xFF18181B),
            start = Offset(0f, midY + h * 0.35f),
            end = Offset(w, midY + h * 0.35f),
            strokeWidth = 0.8.dp.toPx()
          )

          if (history.size >= 2) {
            val stepX = w / (history.size - 1).coerceAtLeast(1)

            if (selectedTab == "ACCEL") {
              // Scale: -2.0g to +2.0g mapped to canvas height
              val maxG = 2.5f

              fun toY(value: Float): Float {
                val clamped = value.coerceIn(-maxG, maxG)
                return midY - (clamped / maxG) * (h * 0.42f)
              }

              // Path for aMag (White line)
              val pathMag = Path()
              val pathX = Path()
              val pathY = Path()
              val pathZ = Path()

              history.forEachIndexed { i, pt ->
                val x = i * stepX
                val yMag = toY(pt.aMag - 1.0f) // offset by 1g gravity baseline
                val yX = toY(pt.accelX)
                val yY = toY(pt.accelY)
                val yZ = toY(pt.accelZ - 1.0f)

                if (i == 0) {
                  pathMag.moveTo(x, yMag)
                  pathX.moveTo(x, yX)
                  pathY.moveTo(x, yY)
                  pathZ.moveTo(x, yZ)
                } else {
                  pathMag.lineTo(x, yMag)
                  pathX.lineTo(x, yX)
                  pathY.lineTo(x, yY)
                  pathZ.lineTo(x, yZ)
                }
              }

              drawPath(pathX, RamsAlertRed, style = Stroke(width = 1.2.dp.toPx(), cap = StrokeCap.Round))
              drawPath(pathY, RamsSuccessEmerald, style = Stroke(width = 1.2.dp.toPx(), cap = StrokeCap.Round))
              drawPath(pathZ, RamsSyncBlue, style = Stroke(width = 1.2.dp.toPx(), cap = StrokeCap.Round))
              drawPath(pathMag, Color(0xFFFAFAFA), style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round))
            } else {
              // Gyro Scale: -180 deg/s to +180 deg/s
              val maxRate = 180f
              fun toY(value: Float): Float {
                val clamped = value.coerceIn(-maxRate, maxRate)
                return midY - (clamped / maxRate) * (h * 0.42f)
              }

              val pathGx = Path()
              val pathGy = Path()
              val pathGz = Path()

              history.forEachIndexed { i, pt ->
                val x = i * stepX
                val yGx = toY(pt.gyroX)
                val yGy = toY(pt.gyroY)
                val yGz = toY(pt.gyroZ)

                if (i == 0) {
                  pathGx.moveTo(x, yGx)
                  pathGy.moveTo(x, yGy)
                  pathGz.moveTo(x, yGz)
                } else {
                  pathGx.lineTo(x, yGx)
                  pathGy.lineTo(x, yGy)
                  pathGz.lineTo(x, yGz)
                }
              }

              drawPath(pathGx, RamsAlertRed, style = Stroke(width = 1.4.dp.toPx()))
              drawPath(pathGy, RamsSuccessEmerald, style = Stroke(width = 1.4.dp.toPx()))
              drawPath(pathGz, RamsSyncBlue, style = Stroke(width = 1.4.dp.toPx()))
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(8.dp))

      // Clean Monospace Legend
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        if (selectedTab == "ACCEL") {
          WaveformLegendItem("AX", RamsAlertRed, String.format(Locale.US, "%+.2f", latestImu.accelX))
          WaveformLegendItem("AY", RamsSuccessEmerald, String.format(Locale.US, "%+.2f", latestImu.accelY))
          WaveformLegendItem("AZ", RamsSyncBlue, String.format(Locale.US, "%+.2f", latestImu.accelZ))
          WaveformLegendItem("AMAG", Color(0xFFFAFAFA), String.format(Locale.US, "%.2fG", latestImu.aMag))
        } else {
          WaveformLegendItem("WX", RamsAlertRed, String.format(Locale.US, "%+.0f°/s", latestImu.gyroX))
          WaveformLegendItem("WY", RamsSuccessEmerald, String.format(Locale.US, "%+.0f°/s", latestImu.gyroY))
          WaveformLegendItem("WZ", RamsSyncBlue, String.format(Locale.US, "%+.0f°/s", latestImu.gyroZ))
        }
      }
    }
  }
}

@Composable
private fun WaveformLegendItem(label: String, color: Color, value: String) {
  Row(verticalAlignment = Alignment.CenterVertically) {
    Box(
      modifier = Modifier
        .size(6.dp)
        .clip(CircleShape)
        .background(color)
    )
    Spacer(modifier = Modifier.width(4.dp))
    Text(
      text = label,
      fontFamily = FontFamily.Monospace,
      fontWeight = FontWeight.Bold,
      fontSize = 9.sp,
      color = MaterialTheme.colorScheme.onSurfaceVariant
    )
    Spacer(modifier = Modifier.width(4.dp))
    Text(
      text = value,
      fontFamily = FontFamily.Monospace,
      fontWeight = FontWeight.Bold,
      fontSize = 9.sp,
      color = MaterialTheme.colorScheme.onSurface
    )
  }
}
