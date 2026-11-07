package com.example.ui.components

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
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.SettingsInputAntenna
import androidx.compose.material.icons.filled.VpnKey
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.DeviceLinkStatus
import com.example.model.RiderProfile
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber

@Composable
fun RamsHeader(
  linkStatus: DeviceLinkStatus,
  alertCount: Int,
  isRecordingCsv: Boolean,
  recordedCsvCount: Int,
  isDarkTheme: Boolean,
  usePhoneSensors: Boolean,
  riderProfile: RiderProfile?,
  onToggleSensorSource: () -> Unit,
  onToggleTheme: () -> Unit,
  onOpenConnectionDialog: () -> Unit,
  onOpenRiderLogin: () -> Unit,
  onOpenCsvDialog: () -> Unit,
  onOpenDesignRules: () -> Unit,
  onTriggerTestCrash: () -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    modifier = modifier
      .fillMaxWidth()
      .testTag("rams_header_surface"),
    color = MaterialTheme.colorScheme.surface,
    tonalElevation = 0.dp
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
      // 1. Top Bar: Brand Typography & Action Row
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Left: Bold Display Title with Tight Tracking
        Column {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier
                .size(10.dp)
                .clip(CircleShape)
                .background(if (alertCount > 0) RamsAlertRed else RamsSuccessEmerald)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "RAMS MONITOR",
              style = MaterialTheme.typography.titleLarge,
              color = MaterialTheme.colorScheme.onSurface,
              fontWeight = FontWeight.Black,
              letterSpacing = (-0.4).sp
            )
          }
          Text(
            text = "PHONE IMU + GPS → ESP32 WEBSOCKET & LORA",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold
          )
        }

        // Right: Clean Hair-line Action Buttons
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          // Rider Profile & Token Dialog Button
          IconButton(
            onClick = onOpenRiderLogin,
            modifier = Modifier.size(36.dp)
          ) {
            Icon(
              imageVector = Icons.Default.VpnKey,
              contentDescription = "Rider Login & Token Generator",
              tint = RamsSyncBlue,
              modifier = Modifier.size(18.dp)
            )
          }

          // Sensor Source Toggle (Phone Physical Sensors vs Highway Sim)
          IconButton(
            onClick = onToggleSensorSource,
            modifier = Modifier.size(36.dp)
          ) {
            Icon(
              imageVector = Icons.Default.PhoneAndroid,
              contentDescription = "Toggle Phone Physical Sensors",
              tint = if (usePhoneSensors) RamsSyncBlue else MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier.size(18.dp)
            )
          }

          // Test Crash Trigger
          IconButton(
            onClick = onTriggerTestCrash,
            modifier = Modifier.size(36.dp)
          ) {
            Icon(
              imageVector = Icons.Default.Bolt,
              contentDescription = "Test Crash Shock",
              tint = RamsAlertRed,
              modifier = Modifier.size(18.dp)
            )
          }

          // ESP32 Connection Setup
          IconButton(
            onClick = onOpenConnectionDialog,
            modifier = Modifier.size(36.dp)
          ) {
            Icon(
              imageVector = Icons.Default.SettingsInputAntenna,
              contentDescription = "ESP32 Uplink Config",
              tint = MaterialTheme.colorScheme.onSurface,
              modifier = Modifier.size(18.dp)
            )
          }

          // CSV Export Dialog
          IconButton(
            onClick = onOpenCsvDialog,
            modifier = Modifier.size(36.dp)
          ) {
            Icon(
              imageVector = Icons.Default.FileDownload,
              contentDescription = "CSV Logger & Export",
              tint = if (isRecordingCsv) RamsAlertRed else MaterialTheme.colorScheme.onSurface,
              modifier = Modifier.size(18.dp)
            )
          }

          // Design Specification Modal
          IconButton(
            onClick = onOpenDesignRules,
            modifier = Modifier.size(36.dp)
          ) {
            Icon(
              imageVector = Icons.Default.Book,
              contentDescription = "Design System Rules",
              tint = MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier.size(18.dp)
            )
          }

          // Theme Toggle
          IconButton(
            onClick = onToggleTheme,
            modifier = Modifier.size(36.dp)
          ) {
            Icon(
              imageVector = if (isDarkTheme) Icons.Default.LightMode else Icons.Default.DarkMode,
              contentDescription = "Toggle Dark/Light Theme",
              tint = MaterialTheme.colorScheme.onSurface,
              modifier = Modifier.size(18.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // 2. Single-Line Atomic Badges (Zero Tacky Gimmicks, Monochromatic Neutrals)
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Token Identifier Badge
        AtomicBadge(
          label = "TOKEN",
          value = riderProfile?.token?.takeLast(9) ?: "LOGIN",
          accentColor = if (riderProfile?.isLoggedIn == true) RamsSuccessEmerald else RamsWarningAmber,
          modifier = Modifier.clickable { onOpenRiderLogin() }
        )

        // Sensor Source Pill
        AtomicBadge(
          label = if (usePhoneSensors) "PHONE SENSORS" else "SIMULATOR",
          value = if (usePhoneSensors) "HARDWARE 50Hz" else "20Hz ROUTE",
          accentColor = if (usePhoneSensors) RamsSyncBlue else MaterialTheme.colorScheme.onSurfaceVariant
        )

        // ESP32 Uplink Pill
        AtomicBadge(
          label = "ESP32 LORA",
          value = if (linkStatus.isConnected) "SYNC ACTIVE" else "READY",
          accentColor = if (linkStatus.isConnected) RamsSuccessEmerald else RamsWarningAmber
        )

        // CSV Recording Pill
        if (isRecordingCsv) {
          AtomicBadge(
            label = "REC",
            value = "$recordedCsvCount PTS",
            accentColor = RamsAlertRed
          )
        }

        // Crash Alert Count Pill
        if (alertCount > 0) {
          AtomicBadge(
            label = "ALERTS",
            value = "$alertCount CRASH",
            accentColor = RamsAlertRed
          )
        }
      }
    }
  }
}

@Composable
private fun AtomicBadge(
  label: String,
  value: String,
  accentColor: Color,
  modifier: Modifier = Modifier
) {
  Row(
    modifier = modifier
      .clip(RoundedCornerShape(4.dp))
      .background(MaterialTheme.colorScheme.surfaceVariant)
      .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp))
      .padding(horizontal = 8.dp, vertical = 4.dp),
    verticalAlignment = Alignment.CenterVertically
  ) {
    Box(
      modifier = Modifier
        .size(6.dp)
        .clip(CircleShape)
        .background(accentColor)
    )
    Spacer(modifier = Modifier.width(6.dp))
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
