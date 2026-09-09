package com.example.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Security
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
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
  onToggleSensorSource: () -> Unit = {},
  onToggleTheme: () -> Unit,
  onOpenConnectionDialog: () -> Unit,
  onOpenRiderLogin: () -> Unit,
  onOpenCsvDialog: () -> Unit,
  onOpenDesignRules: () -> Unit = {},
  onTriggerTestCrash: () -> Unit = {},
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
        .padding(horizontal = 16.dp, vertical = 10.dp)
    ) {
      // 1. Top Bar: Brand Typography & Action Row
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Left: Authentic App Logo & Display Title with Category Pill
        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.weight(1f)
        ) {
          Image(
            painter = painterResource(id = R.drawable.logo),
            contentDescription = "RAMS Logo",
            modifier = Modifier
              .size(36.dp)
              .clip(CircleShape)
              .border(1.5.dp, if (alertCount > 0) RamsAlertRed else RamsSyncBlue, CircleShape)
          )
          Spacer(modifier = Modifier.width(10.dp))
          Column(modifier = Modifier.weight(1f)) {
            Text(
              text = "RAMS MONITOR",
              style = MaterialTheme.typography.titleMedium,
              color = MaterialTheme.colorScheme.onSurface,
              fontWeight = FontWeight.Black,
              letterSpacing = (-0.3).sp,
              maxLines = 1
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
              val categoryName = riderProfile?.category?.ifBlank { "PEDESTRIAN" } ?: "PEDESTRIAN"
              Surface(
                shape = RoundedCornerShape(3.dp),
                color = RamsSyncBlue.copy(alpha = 0.15f),
                border = androidx.compose.foundation.BorderStroke(1.dp, RamsSyncBlue.copy(alpha = 0.4f))
              ) {
                Text(
                  text = categoryName.uppercase(java.util.Locale.US),
                  modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp),
                  fontSize = 8.sp,
                  fontWeight = FontWeight.Bold,
                  fontFamily = FontFamily.Monospace,
                  color = RamsSyncBlue,
                  softWrap = false
                )
              }
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = "RAMS SAFETY WEARABLE",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 8.5.sp,
                maxLines = 1
              )
            }
          }
        }

        // Right: Clean status indicator only
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          // Intentionally empty - CSV and Theme controls removed for clean encapsulation
        }
      }

      Spacer(modifier = Modifier.height(8.dp))

      // 2. Horizontally Scrollable Atomic Badges
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Token Identifier Badge
        AtomicBadge(
          label = "TOKEN",
          value = riderProfile?.token?.takeLast(9) ?: "REGISTER",
          accentColor = if (riderProfile?.isLoggedIn == true) RamsSuccessEmerald else RamsWarningAmber,
          modifier = Modifier.clickable { onOpenRiderLogin() }
        )

        // Category Badge
        if (riderProfile?.isLoggedIn == true) {
          AtomicBadge(
            label = "ROLE",
            value = riderProfile.category.uppercase(java.util.Locale.US),
            accentColor = RamsSyncBlue,
            modifier = Modifier.clickable { onOpenRiderLogin() }
          )
        }

        // Sensor Source Pill
        AtomicBadge(
          label = "SENSORS",
          value = if (usePhoneSensors) "HARDWARE 50Hz" else "SIM 20Hz",
          accentColor = if (usePhoneSensors) RamsSyncBlue else MaterialTheme.colorScheme.onSurfaceVariant
        )

        // Wearable Link Pill
        AtomicBadge(
          label = "WEARABLE LINK",
          value = if (linkStatus.isConnected) "LINK ACTIVE" else "STANDBY",
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
            label = "CRASH ALERT",
            value = "$alertCount INCIDENTS",
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
  Surface(
    modifier = modifier,
    shape = RoundedCornerShape(4.dp),
    color = MaterialTheme.colorScheme.surfaceVariant,
    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
  ) {
    Row(
      modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.spacedBy(5.dp)
    ) {
      Box(
        modifier = Modifier
          .size(5.dp)
          .background(accentColor, CircleShape)
      )
      Text(
        text = "$label: $value",
        style = MaterialTheme.typography.labelSmall,
        fontFamily = FontFamily.Monospace,
        fontWeight = FontWeight.Bold,
        fontSize = 9.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        softWrap = false
      )
    }
  }
}
