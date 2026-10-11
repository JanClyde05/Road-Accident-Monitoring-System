package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber
import java.util.Locale

@Composable
fun AttitudeIndicator(
  pitch: Float,
  roll: Float,
  yaw: Float,
  accelX: Float,
  accelY: Float,
  accelZ: Float,
  modifier: Modifier = Modifier
) {
  Surface(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(8.dp))
      .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
      .testTag("attitude_indicator_widget"),
    color = MaterialTheme.colorScheme.surface
  ) {
    Column(modifier = Modifier.padding(16.dp)) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "3D ATTITUDE & ARTIFICIAL HORIZON",
          style = MaterialTheme.typography.labelSmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
          text = String.format(Locale.US, "P %+4.1f°  R %+4.1f°  Y %03.0f°", pitch, roll, yaw),
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 10.sp,
          color = MaterialTheme.colorScheme.onSurface
        )
      }

      Spacer(modifier = Modifier.height(12.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Gyroscope Artificial Horizon Display (Canvas)
        Box(
          modifier = Modifier
            .size(136.dp)
            .clip(CircleShape)
            .background(Color(0xFF09090B))
            .border(1.dp, MaterialTheme.colorScheme.outline, CircleShape),
          contentAlignment = Alignment.Center
        ) {
          Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2f, size.height / 2f)
            val radius = size.width / 2f

            val pitchPx = (pitch * 1.5f).coerceIn(-radius * 0.75f, radius * 0.75f)

            rotate(degrees = -roll, pivot = center) {
              // Sky (Subtle Slate Blue)
              drawRect(
                color = Color(0xFF1E293B),
                topLeft = Offset(center.x - radius * 2, center.y - radius * 2 + pitchPx),
                size = androidx.compose.ui.geometry.Size(radius * 4, radius * 2)
              )
              // Ground (Subtle Warm Slate)
              drawRect(
                color = Color(0xFF27272A),
                topLeft = Offset(center.x - radius * 2, center.y + pitchPx),
                size = androidx.compose.ui.geometry.Size(radius * 4, radius * 2)
              )
              // Horizon dividing line
              drawLine(
                color = Color(0xFFFAFAFA),
                start = Offset(center.x - radius * 1.5f, center.y + pitchPx),
                end = Offset(center.x + radius * 1.5f, center.y + pitchPx),
                strokeWidth = 1.5.dp.toPx()
              )

              // Pitch Ladder marks
              val ladderSteps = listOf(-20, -10, 10, 20)
              for (step in ladderSteps) {
                val ladderY = center.y + pitchPx - (step * 1.5f)
                val ladderWidth = if (step % 20 == 0) 20.dp.toPx() else 12.dp.toPx()
                drawLine(
                  color = Color.White.copy(alpha = 0.6f),
                  start = Offset(center.x - ladderWidth, ladderY),
                  end = Offset(center.x + ladderWidth, ladderY),
                  strokeWidth = 1.dp.toPx()
                )
              }
            }

            // Fixed aircraft reticle symbol in center (Amber)
            val reticleColor = RamsWarningAmber
            drawLine(
              color = reticleColor,
              start = Offset(center.x - 26.dp.toPx(), center.y),
              end = Offset(center.x - 8.dp.toPx(), center.y),
              strokeWidth = 2.dp.toPx(),
              cap = StrokeCap.Round
            )
            drawLine(
              color = reticleColor,
              start = Offset(center.x + 8.dp.toPx(), center.y),
              end = Offset(center.x + 26.dp.toPx(), center.y),
              strokeWidth = 2.dp.toPx(),
              cap = StrokeCap.Round
            )
            drawCircle(
              color = reticleColor,
              radius = 2.5.dp.toPx(),
              center = center
            )

            // Outer circular bezel ring
            drawCircle(
              color = Color(0xFF3F3F46),
              radius = radius - 1.dp.toPx(),
              center = center,
              style = Stroke(width = 1.5.dp.toPx())
            )
          }
        }

        // Attitude Metrics & Roll Scale
        Column(
          modifier = Modifier.weight(1f),
          verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text(
              text = "PITCH (NOSE):",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
              text = String.format(Locale.US, "%+5.1f°", pitch),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp,
              color = MaterialTheme.colorScheme.onSurface
            )
          }

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text(
              text = "ROLL (BANK):",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
              text = String.format(Locale.US, "%+5.1f°", roll),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp,
              color = if (kotlin.math.abs(roll) > 55f) RamsAlertRed else MaterialTheme.colorScheme.onSurface
            )
          }

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text(
              text = "YAW (COMPASS):",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
              text = String.format(Locale.US, "%03.0f°", yaw),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp,
              color = MaterialTheme.colorScheme.onSurface
            )
          }

          Spacer(modifier = Modifier.height(4.dp))

          // 3-Axis Instantaneous Vector
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text(
              text = String.format(Locale.US, "X %+.2fg", accelX),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = RamsAlertRed
            )
            Text(
              text = String.format(Locale.US, "Y %+.2fg", accelY),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = RamsSuccessEmerald
            )
            Text(
              text = String.format(Locale.US, "Z %+.2fg", accelZ),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = RamsSyncBlue
            )
          }
        }
      }
    }
  }
}
