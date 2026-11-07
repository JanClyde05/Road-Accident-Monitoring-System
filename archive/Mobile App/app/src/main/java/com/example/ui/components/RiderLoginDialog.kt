package com.example.ui.components

import android.content.Intent
import android.net.Uri
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.VpnKey
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.graphics.Color
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
import com.example.model.GpsData
import com.example.model.RiderProfile
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber

@Composable
fun RiderLoginDialog(
  profile: RiderProfile,
  currentGps: GpsData,
  onSaveProfile: (RiderProfile) -> Unit,
  onGenerateNewToken: () -> Unit,
  onDismiss: () -> Unit
) {
  val context = LocalContext.current
  val clipboard = LocalClipboardManager.current

  var riderName by remember { mutableStateOf(profile.riderName) }
  var plateNumber by remember { mutableStateOf(profile.plateNumber) }
  var vehicleModel by remember { mutableStateOf(profile.vehicleModel) }
  var emergencyName by remember { mutableStateOf(profile.emergencyContactName) }
  var emergencyPhone by remember { mutableStateOf(profile.emergencyContactPhone) }
  var bloodType by remember { mutableStateOf(profile.bloodType) }
  var netlifyHost by remember { mutableStateOf(profile.netlifyHost) }
  var esp32WsUrl by remember { mutableStateOf(profile.esp32WsUrl) }

  val bloodTypes = listOf("O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-")

  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxWidth(0.95f)
        .clip(RoundedCornerShape(8.dp))
        .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
        .testTag("rider_login_dialog"),
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
              imageVector = Icons.Default.Security,
              contentDescription = null,
              tint = RamsSyncBlue,
              modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Column {
              Text(
                text = "RIDER AUTHENTICATION & TOKEN",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface
              )
              Text(
                text = "IDENTIFICATION FOR NETLIFY RECEIVER & RESCUERS",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }

          IconButton(onClick = onDismiss) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurface)
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Active Generated Token Card
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(4.dp))
            .background(Color(0xFF09090B))
            .border(1.dp, RamsSyncBlue, RoundedCornerShape(4.dp))
            .padding(12.dp)
        ) {
          Column {
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
                    .background(RamsSuccessEmerald)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                  text = "NETLIFY RECEIVER TOKEN",
                  fontFamily = FontFamily.Monospace,
                  fontWeight = FontWeight.Bold,
                  fontSize = 9.sp,
                  color = RamsSyncBlue
                )
              }

              IconButton(
                onClick = onGenerateNewToken,
                modifier = Modifier.size(24.dp)
              ) {
                Icon(
                  imageVector = Icons.Default.Refresh,
                  contentDescription = "Regenerate Token",
                  tint = Color(0xFFA1A1AA),
                  modifier = Modifier.size(16.dp)
                )
              }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
              text = profile.token,
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Black,
              fontSize = 18.sp,
              color = Color(0xFFFAFAFA),
              letterSpacing = 1.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
              text = "Sent in every WebSocket packet to ESP32 LoRa so rescuers can pindown your position on Netlify.",
              fontFamily = FontFamily.Monospace,
              fontSize = 9.sp,
              lineHeight = 13.sp,
              color = Color(0xFFA1A1AA)
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Token Quick Actions (Copy Token, Test Netlify Link, Share Pin)
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              Button(
                onClick = {
                  clipboard.setText(AnnotatedString(profile.token))
                  Toast.makeText(context, "Token copied: ${profile.token}", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = RamsSyncBlue)
              ) {
                Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(12.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("COPY", fontFamily = FontFamily.Monospace, fontSize = 9.sp, fontWeight = FontWeight.Bold)
              }

              Button(
                onClick = {
                  val url = profile.getNetlifyPindownUrl(currentGps.latitude, currentGps.longitude)
                  val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                  try {
                    context.startActivity(intent)
                  } catch (_: Exception) {
                    Toast.makeText(context, "Could not open browser", Toast.LENGTH_SHORT).show()
                  }
                },
                modifier = Modifier.weight(1.3f),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
              ) {
                Icon(Icons.Default.OpenInBrowser, contentDescription = null, modifier = Modifier.size(12.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("NETLIFY PORTAL", fontFamily = FontFamily.Monospace, fontSize = 9.sp, fontWeight = FontWeight.Bold)
              }

              Button(
                onClick = {
                  val netlifyUrl = profile.getNetlifyPindownUrl(currentGps.latitude, currentGps.longitude)
                  val shareText = "[RAMS EMERGENCY BEACON]\n" +
                    "Rider: ${profile.riderName} (${profile.plateNumber})\n" +
                    "Token: ${profile.token}\n" +
                    "Blood Type: ${profile.bloodType}\n" +
                    "Live Location: ${currentGps.latitude}, ${currentGps.longitude}\n" +
                    "Netlify Radar: $netlifyUrl"

                  val sendIntent = Intent().apply {
                    action = Intent.ACTION_SEND
                    putExtra(Intent.EXTRA_TEXT, shareText)
                    type = "text/plain"
                  }
                  context.startActivity(Intent.createChooser(sendIntent, "Share Rescuer Pindown Token"))
                },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = RamsAlertRed)
              ) {
                Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(12.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("SHARE", fontFamily = FontFamily.Monospace, fontSize = 9.sp, fontWeight = FontWeight.Bold)
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Form Fields Section
        Text(
          text = "RIDER & VEHICLE CREDENTIALS",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 9.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(6.dp))

        OutlinedTextField(
          value = riderName,
          onValueChange = { riderName = it },
          label = { Text("Rider Full Name", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          OutlinedTextField(
            value = plateNumber,
            onValueChange = { plateNumber = it },
            label = { Text("Plate / Unit ID", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
            singleLine = true,
            modifier = Modifier.weight(1f)
          )

          OutlinedTextField(
            value = vehicleModel,
            onValueChange = { vehicleModel = it },
            label = { Text("Vehicle Model", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
            singleLine = true,
            modifier = Modifier.weight(1.2f)
          )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Blood Type Chips
        Text(
          text = "BLOOD TYPE (CRITICAL FOR FIRST RESPONDERS)",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 9.sp,
          color = RamsAlertRed
        )
        Spacer(modifier = Modifier.height(6.dp))
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          bloodTypes.take(4).forEach { b ->
            Box(
              modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(4.dp))
                .background(if (bloodType == b) RamsAlertRed else MaterialTheme.colorScheme.surfaceVariant)
                .border(1.dp, if (bloodType == b) RamsAlertRed else MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp))
                .clickable { bloodType = b }
                .padding(vertical = 6.dp),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = b,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp,
                color = if (bloodType == b) Color.White else MaterialTheme.colorScheme.onSurface
              )
            }
          }
        }
        Spacer(modifier = Modifier.height(6.dp))
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          bloodTypes.drop(4).forEach { b ->
            Box(
              modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(4.dp))
                .background(if (bloodType == b) RamsAlertRed else MaterialTheme.colorScheme.surfaceVariant)
                .border(1.dp, if (bloodType == b) RamsAlertRed else MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp))
                .clickable { bloodType = b }
                .padding(vertical = 6.dp),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = b,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp,
                color = if (bloodType == b) Color.White else MaterialTheme.colorScheme.onSurface
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Emergency Contact
        Text(
          text = "EMERGENCY NOTIFICATION CONTACT",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 9.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(6.dp))
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          OutlinedTextField(
            value = emergencyName,
            onValueChange = { emergencyName = it },
            label = { Text("Contact Name", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
            singleLine = true,
            modifier = Modifier.weight(1f)
          )

          OutlinedTextField(
            value = emergencyPhone,
            onValueChange = { emergencyPhone = it },
            label = { Text("Emergency Phone", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
            singleLine = true,
            modifier = Modifier.weight(1.2f)
          )
        }

        Spacer(modifier = Modifier.height(12.dp))
        HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
        Spacer(modifier = Modifier.height(12.dp))

        // Netlify & WebSocket Configuration
        Text(
          text = "RECEIVER INTEGRATION (NETLIFY & ESP32 WEBSOCKET)",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 9.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(6.dp))

        OutlinedTextField(
          value = netlifyHost,
          onValueChange = { netlifyHost = it },
          label = { Text("Netlify Rescuer Web Portal URL", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
          value = esp32WsUrl,
          onValueChange = { esp32WsUrl = it },
          label = { Text("ESP32 WebSocket Address (ws://...)", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Save and Apply Button
        Button(
          onClick = {
            val updated = profile.copy(
              riderName = riderName,
              plateNumber = plateNumber,
              vehicleModel = vehicleModel,
              emergencyContactName = emergencyName,
              emergencyContactPhone = emergencyPhone,
              bloodType = bloodType,
              netlifyHost = netlifyHost,
              esp32WsUrl = esp32WsUrl,
              isLoggedIn = true
            )
            onSaveProfile(updated)
            Toast.makeText(context, "Rider logged in. Token active: ${updated.token}", Toast.LENGTH_SHORT).show()
            onDismiss()
          },
          modifier = Modifier.fillMaxWidth(),
          colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
        ) {
          Icon(Icons.Default.VpnKey, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "SAVE PROFILE & BROADCAST TOKEN",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 11.sp
          )
        }

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedButton(
          onClick = onDismiss,
          modifier = Modifier.fillMaxWidth()
        ) {
          Text(
            text = "DISMISS",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 10.sp
          )
        }
      }
    }
  }
}
