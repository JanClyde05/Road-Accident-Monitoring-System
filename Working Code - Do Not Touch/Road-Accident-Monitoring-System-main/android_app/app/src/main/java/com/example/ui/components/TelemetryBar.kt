package com.example.ui.components

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.GpsFixed
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.DeviceLinkStatus
import com.example.model.GpsData
import com.example.model.ImuData
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber
import java.util.Locale

@Composable
fun TelemetryBar(
  gps: GpsData,
  imu: ImuData,
  linkStatus: DeviceLinkStatus,
  peakAMag: Float,
  onResetPeakG: () -> Unit,
  modifier: Modifier = Modifier
) {
  val clipboardManager = LocalClipboardManager.current
  val context = LocalContext.current

  Column(
    modifier = modifier
      .fillMaxWidth()
      .testTag("telemetry_bar_column"),
    verticalArrangement = Arrangement.spacedBy(8.dp)
  ) {
    // ROW 1: Real Phone GPS & Ground Speed (Modular Unnested Layout)
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      // Panel 1: GPS Fix & Precision Coordinates
      Surface(
        modifier = Modifier
          .weight(1.3f)
          .clip(RoundedCornerShape(8.dp))
          .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
          .clickable {
            val coords = String.format(Locale.US, "%.6f, %.6f", gps.latitude, gps.longitude)
            clipboardManager.setText(AnnotatedString(coords))
            Toast.makeText(context, "GPS Coordinates Copied", Toast.LENGTH_SHORT).show()
          },
        color = MaterialTheme.colorScheme.surface
      ) {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = Icons.Default.GpsFixed,
                contentDescription = null,
                tint = RamsSyncBlue,
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = "PHONE GPS POSITION",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
            Icon(
              imageVector = Icons.Default.ContentCopy,
              contentDescription = "Copy GPS",
              tint = MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier.size(12.dp)
            )
          }

          Spacer(modifier = Modifier.height(8.dp))

          // Tabular Coordinates
          Text(
            text = String.format(Locale.US, "LAT %9.6f°", gps.latitude),
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurface
          )
          Text(
            text = String.format(Locale.US, "LON %9.6f°", gps.longitude),
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurface
          )

          Spacer(modifier = Modifier.height(6.dp))

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text(
              text = String.format(Locale.US, "ALT %.1fm", gps.altitudeMeters),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
              text = String.format(Locale.US, "ACC ±%.1fm", gps.accuracyMeters),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      }

      // Panel 2: Real Ground Speed & Bearing
      Surface(
        modifier = Modifier
          .weight(0.9f)
          .clip(RoundedCornerShape(8.dp))
          .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp)),
        color = MaterialTheme.colorScheme.surface
      ) {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
          verticalArrangement = Arrangement.SpaceBetween
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Default.Speed,
              contentDescription = null,
              tint = MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "GROUND SPEED",
              style = MaterialTheme.typography.labelSmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }

          Spacer(modifier = Modifier.height(4.dp))

          // Big Display Typography for Speed
          Row(verticalAlignment = Alignment.Bottom) {
            Text(
              text = String.format(Locale.US, "%.1f", gps.speedKmh),
              style = MaterialTheme.typography.displayLarge,
              color = MaterialTheme.colorScheme.onSurface,
              fontWeight = FontWeight.Black
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = "KM/H",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier.padding(bottom = 6.dp)
            )
          }

          Spacer(modifier = Modifier.height(4.dp))

          Text(
            text = String.format(Locale.US, "HDG %03.0f°", gps.headingDegrees),
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 10.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }
    }

    // ROW 2: Phone IMU 6-Axis Motion & Acceleration Magnitude (aMag)
    Surface(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(8.dp))
        .border(
          1.dp,
          if (imu.isShockAlert) RamsAlertRed else MaterialTheme.colorScheme.outline,
          RoundedCornerShape(8.dp)
        ),
      color = MaterialTheme.colorScheme.surface
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(16.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(
                  when {
                    imu.aMag >= 3.0f -> RamsAlertRed
                    imu.aMag >= 2.0f -> RamsWarningAmber
                    else -> RamsSuccessEmerald
                  }
                )
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "PHONE IMU ACCELEROMETER & GYRO",
              style = MaterialTheme.typography.labelSmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }

          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.clickable { onResetPeakG() }
          ) {
            Text(
              text = String.format(Locale.US, "PEAK %.2fG", peakAMag),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp,
              color = if (peakAMag > 2.5f) RamsAlertRed else MaterialTheme.colorScheme.onSurface
            )
          }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Large G-Force Readout
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text(
              text = "ACCEL MAGNITUDE",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Row(verticalAlignment = Alignment.Bottom) {
              Text(
                text = String.format(Locale.US, "%.2f", imu.aMag),
                style = MaterialTheme.typography.displayLarge,
                color = when {
                  imu.aMag >= 3.0f -> RamsAlertRed
                  imu.aMag >= 2.0f -> RamsWarningAmber
                  else -> MaterialTheme.colorScheme.onSurface
                },
                fontWeight = FontWeight.Black
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "G",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 6.dp)
              )
            }
          }

          // 3-Axis Values
          Column(horizontalAlignment = Alignment.End) {
            Text(
              text = String.format(Locale.US, "AX %+5.2f  AY %+5.2f", imu.accelX, imu.accelY),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp,
              color = MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = String.format(Locale.US, "AZ %+5.2f G", imu.accelZ),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp,
              color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
              text = String.format(Locale.US, "GX %+4.0f  GY %+4.0f  GZ %+4.0f °/s", imu.gyroX, imu.gyroY, imu.gyroZ),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }

        if (imu.isShockAlert) {
          Spacer(modifier = Modifier.height(6.dp))
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .clip(RoundedCornerShape(4.dp))
              .background(RamsAlertRed.copy(alpha = 0.15f))
              .border(1.dp, RamsAlertRed, RoundedCornerShape(4.dp))
              .padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(
              imageVector = Icons.Default.Warning,
              contentDescription = null,
              tint = RamsAlertRed,
              modifier = Modifier.size(12.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "ACCIDENT IMPACT SHOCK (>3.0G) — BROADCASTING TO EMERGENCY UPLINK",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = RamsAlertRed
            )
          }
        }
      }
    }

    // ROW 3: Wearable Uplink Sync Status Strip
    Surface(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(8.dp))
        .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp)),
      color = MaterialTheme.colorScheme.surface
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.Sync,
            contentDescription = null,
            tint = RamsSyncBlue,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Column {
            Text(
              text = "RAMS SAFETY WEARABLE UPLINK",
              style = MaterialTheme.typography.labelSmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
              text = if (linkStatus.isConnected) "STREAMING TO ${linkStatus.ipAddress}:${linkStatus.port}" else "WEARABLE LINK STANDBY",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp,
              color = MaterialTheme.colorScheme.onSurface
            )
          }
        }

        Column(horizontalAlignment = Alignment.End) {
          Text(
            text = "${linkStatus.packetRateHz} HZ UPDATE",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 10.sp,
            color = RamsSuccessEmerald
          )
          Text(
            text = "SAFETY UPLINK READY",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 9.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }
    }
  }
}
