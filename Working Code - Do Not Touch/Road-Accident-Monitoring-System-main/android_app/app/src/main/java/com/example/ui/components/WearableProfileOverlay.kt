package com.example.ui.components

import android.content.Intent
import android.net.Uri
import android.widget.Toast
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Emergency
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Sensors
import androidx.compose.material.icons.filled.TwoWheeler
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.model.IncidentEvent
import com.example.model.IncidentType
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber
import java.util.Locale

@Composable
fun WearableProfileOverlay(
  event: IncidentEvent,
  onDismiss: () -> Unit
) {
  val clipboard = LocalClipboardManager.current
  val context = LocalContext.current

  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxWidth(0.95f)
        .clip(RoundedCornerShape(8.dp))
        .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
        .testTag("wearable_profile_dialog"),
      color = MaterialTheme.colorScheme.surface
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .verticalScroll(rememberScrollState())
          .padding(16.dp)
      ) {
        // Modal Header
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Default.Emergency,
              contentDescription = null,
              tint = if (event.type == IncidentType.ALERT) RamsAlertRed else RamsSyncBlue,
              modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Column {
              Text(
                text = "WEARABLE UNIT PROFILE",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface
              )
              Text(
                text = event.deviceToken,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                color = RamsSyncBlue
              )
            }
          }

          IconButton(onClick = onDismiss) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurface)
          }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Status Banner
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(4.dp))
            .background(
              if (event.type == IncidentType.ALERT) RamsAlertRed.copy(alpha = 0.12f)
              else MaterialTheme.colorScheme.surfaceVariant
            )
            .border(
              1.dp,
              if (event.type == IncidentType.ALERT) RamsAlertRed else MaterialTheme.colorScheme.outline,
              RoundedCornerShape(4.dp)
            )
            .padding(10.dp)
        ) {
          Column {
            Text(
              text = event.title,
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp,
              color = if (event.type == IncidentType.ALERT) RamsAlertRed else MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = String.format(Locale.US, "Recorded at %s • aMag: %.2fG • Spd: %.1f km/h", event.formattedTime(), event.aMag, event.speedKmh),
              fontFamily = FontFamily.Monospace,
              fontSize = 9.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Quick Actions Row
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Button(
            onClick = {
              val coords = String.format(Locale.US, "%.6f, %.6f", event.lat, event.lon)
              clipboard.setText(AnnotatedString(coords))
              Toast.makeText(context, "Coordinates copied: $coords", Toast.LENGTH_SHORT).show()
            },
            modifier = Modifier.weight(1f),
            colors = ButtonDefaults.buttonColors(containerColor = RamsSyncBlue)
          ) {
            Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(14.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text("COPY GPS", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
          }

          Button(
            onClick = {
              val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${event.emergencyContactPhone}"))
              intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
              try { context.startActivity(intent) } catch (_: Exception) {}
            },
            modifier = Modifier.weight(1f),
            colors = ButtonDefaults.buttonColors(containerColor = RamsAlertRed)
          ) {
            Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(14.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text("CALL SOS", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Section 1: Medical & Rider Info
        SectionHeader(title = "MEDICAL & RIDER IDENTITY", icon = Icons.Default.HealthAndSafety)
        Spacer(modifier = Modifier.height(8.dp))
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp),
          verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          InfoRow(label = "RIDER NAME", value = event.riderName)
          InfoRow(label = "ROLE / COURIER", value = event.riderRole)
          InfoRow(label = "BLOOD TYPE", value = event.bloodType, valueColor = RamsAlertRed)
          InfoRow(label = "KNOWN ALLERGIES", value = event.allergies, valueColor = RamsWarningAmber)
          InfoRow(label = "EMERGENCY CONTACT", value = "${event.emergencyContactName} (${event.emergencyRelationship})")
          InfoRow(label = "CONTACT PHONE", value = event.emergencyContactPhone, valueColor = RamsSyncBlue)
        }

        Spacer(modifier = Modifier.height(12.dp))
        HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
        Spacer(modifier = Modifier.height(12.dp))

        // Section 2: Vehicle & Hardware Spec
        SectionHeader(title = "VEHICLE & SENSOR HARDWARE", icon = Icons.Default.TwoWheeler)
        Spacer(modifier = Modifier.height(8.dp))
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp),
          verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          InfoRow(label = "VEHICLE MODEL", value = event.vehicleModel)
          InfoRow(label = "PLATE NUMBER", value = event.plateNumber)
          InfoRow(label = "HARDWARE UNIT", value = event.formFactor)
          InfoRow(label = "FIRMWARE VER", value = event.firmware)
          InfoRow(label = "BATTERY STATUS", value = "${event.batteryPct}% (LiPo 3.7V)", valueColor = RamsSuccessEmerald)
        }

        Spacer(modifier = Modifier.height(12.dp))
        HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
        Spacer(modifier = Modifier.height(12.dp))

        // Section 3: Telemetry Incident Details
        SectionHeader(title = "IMPACT TELEMETRY & LOCATION", icon = Icons.Default.Sensors)
        Spacer(modifier = Modifier.height(8.dp))
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp),
          verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          InfoRow(label = "INCIDENT ID", value = event.id)
          InfoRow(label = "LOCATION", value = event.locationAddress)
          InfoRow(label = "COORDINATES", value = String.format(Locale.US, "%.6f° N, %.6f° E", event.lat, event.lon))
          InfoRow(label = "PEAK G-FORCE", value = String.format(Locale.US, "%.2f G", event.aMag), valueColor = RamsAlertRed)
          InfoRow(label = "EST. SPEED", value = String.format(Locale.US, "%.1f km/h", event.speedKmh))
          if (event.notes.isNotEmpty()) {
            InfoRow(label = "NOTES", value = event.notes)
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedButton(
          onClick = onDismiss,
          modifier = Modifier.fillMaxWidth()
        ) {
          Text("DISMISS OVERLAY", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
        }
      }
    }
  }
}

@Composable
private fun SectionHeader(title: String, icon: ImageVector) {
  Row(verticalAlignment = Alignment.CenterVertically) {
    Icon(
      imageVector = icon,
      contentDescription = null,
      tint = RamsSyncBlue,
      modifier = Modifier.size(14.dp)
    )
    Spacer(modifier = Modifier.width(6.dp))
    Text(
      text = title,
      style = MaterialTheme.typography.labelSmall,
      color = MaterialTheme.colorScheme.onSurfaceVariant
    )
  }
}

@Composable
private fun InfoRow(
  label: String,
  value: String,
  valueColor: Color = MaterialTheme.colorScheme.onSurface
) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.Top
  ) {
    Text(
      text = label,
      fontFamily = FontFamily.Monospace,
      fontWeight = FontWeight.Bold,
      fontSize = 9.sp,
      color = MaterialTheme.colorScheme.onSurfaceVariant,
      modifier = Modifier.weight(0.9f)
    )
    Text(
      text = value,
      fontFamily = FontFamily.Monospace,
      fontWeight = FontWeight.Bold,
      fontSize = 10.sp,
      color = valueColor,
      modifier = Modifier.weight(1.1f)
    )
  }
}
