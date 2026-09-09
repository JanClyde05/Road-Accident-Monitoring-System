package com.example.ui.screens

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.DirectionsBike
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Policy
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.TwoWheeler
import com.example.ui.components.RamsVehicleIcons
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.model.RiderProfile
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber

@Composable
fun SettingsScreen(
  riderProfile: RiderProfile,
  onSaveProfile: (RiderProfile) -> Unit,
  onOpenDesignRules: () -> Unit = {},
  onOpenCsvDialog: () -> Unit = {},
  onToggleTheme: () -> Unit = {},
  isDarkTheme: Boolean = true
) {
  val context = LocalContext.current
  val clipboard = LocalClipboardManager.current

  var riderName by remember(riderProfile) { mutableStateOf(riderProfile.riderName) }
  var driveLink by remember(riderProfile) { mutableStateOf(riderProfile.driveLink) }
  var selectedCategory by remember(riderProfile) {
    mutableStateOf(riderProfile.userType.ifBlank { "Pedestrian" })
  }
  var generatedToken by remember(riderProfile) { mutableStateOf(riderProfile.token) }
  var emergencyPhone by remember(riderProfile) { mutableStateOf(riderProfile.emergencyContactPhone) }
  var emergencyContactName by remember(riderProfile) { mutableStateOf(riderProfile.emergencyContactName) }
  var bloodType by remember(riderProfile) { mutableStateOf(riderProfile.bloodType) }
  var vehicleModel by remember(riderProfile) { mutableStateOf(riderProfile.vehicleModel) }
  var allergies by remember(riderProfile) { mutableStateOf(riderProfile.allergies) }
  var showNearbyIncidents by remember(riderProfile) { mutableStateOf(riderProfile.showNearbyIncidents) }
  var showCreditsOverlay by remember { mutableStateOf(false) }
  var showPrivacyDialog by remember { mutableStateOf(false) }
  var showTermsDialog by remember { mutableStateOf(false) }
  var showGooglePlayDialog by remember { mutableStateOf(false) }

  Box(modifier = Modifier.fillMaxSize()) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 16.dp, vertical = 12.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // 1. Road User Category Selector
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
      ) {
        Column(modifier = Modifier.padding(16.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = "ROAD USER CATEGORY",
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Black,
                color = Color(0xFFA1A1AA),
                letterSpacing = 1.sp
              )
              Text(
                text = "Select active user role for crash detection logic",
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF71717A),
                fontSize = 11.sp
              )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Surface(
              shape = RoundedCornerShape(4.dp),
              color = Color(0xFF10B981).copy(alpha = 0.15f),
              border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.4f))
            ) {
              Text(
                text = selectedCategory.uppercase(),
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                color = Color(0xFF10B981),
                softWrap = false
              )
            }
          }

          Spacer(modifier = Modifier.height(12.dp))

          // 4x2 Grid of Road User Categories (Philippine classifications)
          Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              CategoryButton(
                title = "Pedestrian",
                subtitle = "Walking / Jogging",
                icon = Icons.Default.DirectionsWalk,
                isSelected = selectedCategory == "Pedestrian",
                modifier = Modifier.weight(1f),
                onClick = {
                  selectedCategory = "Pedestrian"
                  if (riderName.isNotBlank()) {
                    generatedToken = RiderProfile.generateFriendlyToken(riderName, "Pedestrian")
                  }
                }
              )

              CategoryButton(
                title = "Cyclist",
                subtitle = "Bicycle / E-Bike",
                icon = Icons.Default.DirectionsBike,
                isSelected = selectedCategory == "Cyclist",
                modifier = Modifier.weight(1f),
                onClick = {
                  selectedCategory = "Cyclist"
                  if (riderName.isNotBlank()) {
                    generatedToken = RiderProfile.generateFriendlyToken(riderName, "Cyclist")
                  }
                }
              )
            }

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              CategoryButton(
                title = "Motorcycle",
                subtitle = "Motorcycle",
                icon = Icons.Default.TwoWheeler,
                isSelected = selectedCategory == "Motorcycle Rider",
                modifier = Modifier.weight(1f),
                onClick = {
                  selectedCategory = "Motorcycle Rider"
                  if (riderName.isNotBlank()) {
                    generatedToken = RiderProfile.generateFriendlyToken(riderName, "Motorcycle Rider")
                  }
                }
              )

              CategoryButton(
                title = "Tricycle",
                subtitle = "3-Wheeler",
                icon = RamsVehicleIcons.Tricycle,
                isSelected = selectedCategory == "Tricycle",
                modifier = Modifier.weight(1f),
                onClick = {
                  selectedCategory = "Tricycle"
                  if (riderName.isNotBlank()) {
                    generatedToken = RiderProfile.generateFriendlyToken(riderName, "Tricycle")
                  }
                }
              )
            }

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              CategoryButton(
                title = "Car Driver",
                subtitle = "Automobile / SUV",
                icon = Icons.Default.DirectionsCar,
                isSelected = selectedCategory == "Car Driver",
                modifier = Modifier.weight(1f),
                onClick = {
                  selectedCategory = "Car Driver"
                  if (riderName.isNotBlank()) {
                    generatedToken = RiderProfile.generateFriendlyToken(riderName, "Car Driver")
                  }
                }
              )

              CategoryButton(
                title = "Van",
                subtitle = "UV / Minivan",
                icon = RamsVehicleIcons.Van,
                isSelected = selectedCategory == "Van",
                modifier = Modifier.weight(1f),
                onClick = {
                  selectedCategory = "Van"
                  if (riderName.isNotBlank()) {
                    generatedToken = RiderProfile.generateFriendlyToken(riderName, "Van")
                  }
                }
              )
            }

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              CategoryButton(
                title = "Bus",
                subtitle = "Public Bus",
                icon = RamsVehicleIcons.Bus,
                isSelected = selectedCategory == "Bus",
                modifier = Modifier.weight(1f),
                onClick = {
                  selectedCategory = "Bus"
                  if (riderName.isNotBlank()) {
                    generatedToken = RiderProfile.generateFriendlyToken(riderName, "Bus")
                  }
                }
              )

              CategoryButton(
                title = "Truck",
                subtitle = "Cargo / Hauler",
                icon = RamsVehicleIcons.Truck,
                isSelected = selectedCategory == "Truck",
                modifier = Modifier.weight(1f),
                onClick = {
                  selectedCategory = "Truck"
                  if (riderName.isNotBlank()) {
                    generatedToken = RiderProfile.generateFriendlyToken(riderName, "Truck")
                  }
                }
              )
            }
          }
        }
      }

      // 2. Identity & Photo Section
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          Text(
            text = "USER REGISTRATION & IDENTIFICATION",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Black,
            color = Color(0xFFA1A1AA),
            letterSpacing = 1.sp
          )

          // Photo & Name Row
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            // Circular 2x2 Photo Preview Box
            Box(
              modifier = Modifier
                .size(76.dp)
                .clip(CircleShape)
                .border(
                  1.5.dp,
                  if (driveLink.isNotBlank()) Color(0xFF10B981) else Color(0xFF3F3F46),
                  CircleShape
                ),
              contentAlignment = Alignment.Center
            ) {
              val directImgUrl = RiderProfile.formatDirectDriveUrl(driveLink)
              if (directImgUrl.isNotBlank()) {
                AsyncImage(
                  model = directImgUrl,
                  contentDescription = "User Photo",
                  modifier = Modifier.fillMaxSize(),
                  contentScale = ContentScale.Crop
                )
              } else {
                Column(
                  horizontalAlignment = Alignment.CenterHorizontally,
                  verticalArrangement = Arrangement.Center
                ) {
                  Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = null,
                    tint = Color(0xFF71717A),
                    modifier = Modifier.size(28.dp)
                  )
                  Text(
                    text = "NO PHOTO",
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    color = Color(0xFF71717A)
                  )
                }
              }
            }

            // Full Name Input (Placeholder only, empty by default)
            Column(modifier = Modifier.weight(1f)) {
              OutlinedTextField(
                value = riderName,
                onValueChange = {
                  riderName = it
                  generatedToken = RiderProfile.generateFriendlyToken(riderName, selectedCategory)
                },
                label = { Text("Full Name", fontSize = 12.sp) },
                placeholder = { Text("Input your name here", color = Color(0xFF71717A), fontSize = 13.sp) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                  focusedBorderColor = Color(0xFF10B981),
                  unfocusedBorderColor = Color(0xFF27272A)
                )
              )
            }
          }

          // Google Drive 2x2 URL (Placeholder only, empty by default)
          OutlinedTextField(
            value = driveLink,
            onValueChange = { driveLink = it },
            label = { Text("Google Drive 2x2 Photo URL", fontSize = 12.sp) },
            placeholder = { Text("Input you GDrive 2x2 Picture here", color = Color(0xFF71717A), fontSize = 12.sp) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = Color(0xFF10B981),
              unfocusedBorderColor = Color(0xFF27272A)
            )
          )

          // Generated Compact Token Bar
          Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            color = Color(0xFF09090B),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 10.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Column {
                Text(
                  text = "ASSIGNED RESCUE DEVICE TOKEN",
                  fontSize = 9.sp,
                  fontFamily = FontFamily.Monospace,
                  fontWeight = FontWeight.Bold,
                  color = Color(0xFF71717A)
                )
                Text(
                  text = if (generatedToken.isNotBlank()) generatedToken else if (riderName.isNotBlank()) RiderProfile.generateFriendlyToken(riderName, selectedCategory) else "------",
                  fontFamily = FontFamily.Monospace,
                  fontWeight = FontWeight.Black,
                  fontSize = 18.sp,
                  color = Color(0xFF10B981)
                )
              }

              Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                IconButton(
                  onClick = {
                    val activeToken = if (generatedToken.isNotBlank()) generatedToken else RiderProfile.generateFriendlyToken(riderName, selectedCategory)
                    clipboard.setText(AnnotatedString(activeToken))
                    Toast.makeText(context, "[COPIED] $activeToken", Toast.LENGTH_SHORT).show()
                  },
                  modifier = Modifier.size(36.dp)
                ) {
                  Icon(
                    imageVector = Icons.Default.ContentCopy,
                    contentDescription = "Copy Token",
                    tint = Color(0xFFA1A1AA),
                    modifier = Modifier.size(18.dp)
                  )
                }

                IconButton(
                  onClick = {
                    generatedToken = RiderProfile.generateRandomToken()
                    Toast.makeText(context, "[NEW TOKEN] $generatedToken", Toast.LENGTH_SHORT).show()
                  },
                  modifier = Modifier.size(36.dp)
                ) {
                  Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Regenerate Token",
                    tint = Color(0xFFA1A1AA),
                    modifier = Modifier.size(18.dp)
                  )
                }
              }
            }
          }
        }
      }

      // 3. Emergency & Medical Triage (Placeholder only, empty by default)
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
          Text(
            text = "EMERGENCY & MEDICAL TRIAGE",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Black,
            color = Color(0xFFA1A1AA),
            letterSpacing = 1.sp
          )

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            OutlinedTextField(
              value = emergencyPhone,
              onValueChange = { emergencyPhone = it },
              label = { Text("Emergency Phone", fontSize = 11.sp) },
              placeholder = { Text("+63 9...", fontSize = 12.sp, color = Color(0xFF71717A)) },
              singleLine = true,
              modifier = Modifier.weight(1.3f),
              colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFF10B981),
                unfocusedBorderColor = Color(0xFF27272A)
              )
            )

            OutlinedTextField(
              value = bloodType,
              onValueChange = { bloodType = it },
              label = { Text("Blood Type", fontSize = 11.sp) },
              placeholder = { Text("O+, A+, B+...", fontSize = 12.sp, color = Color(0xFF71717A)) },
              singleLine = true,
              modifier = Modifier.weight(0.7f),
              colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFF10B981),
                unfocusedBorderColor = Color(0xFF27272A)
              )
            )
          }

          OutlinedTextField(
            value = emergencyContactName,
            onValueChange = { emergencyContactName = it },
            label = { Text("Emergency Contact Name", fontSize = 11.sp) },
            placeholder = { Text("e.g. Maria Dela Cruz", fontSize = 12.sp, color = Color(0xFF71717A)) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = Color(0xFF10B981),
              unfocusedBorderColor = Color(0xFF27272A)
            )
          )

          OutlinedTextField(
            value = vehicleModel,
            onValueChange = { vehicleModel = it },
            label = { Text("Vehicle / Bicycle Details", fontSize = 11.sp) },
            placeholder = { Text("e.g. Yamaha NMAX 155 (Black)", fontSize = 12.sp, color = Color(0xFF71717A)) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = Color(0xFF10B981),
              unfocusedBorderColor = Color(0xFF27272A)
            )
          )

          OutlinedTextField(
            value = allergies,
            onValueChange = { allergies = it },
            label = { Text("Allergies & Medical Notes", fontSize = 11.sp) },
            placeholder = { Text("e.g. Penicillin, Asthma, None", fontSize = 12.sp, color = Color(0xFF71717A)) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = Color(0xFF10B981),
              unfocusedBorderColor = Color(0xFF27272A)
            )
          )
        }
      }

      // 4. Safety Map Preferences (Nearby Incident Alerts Toggle)
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Text(
            text = "SAFETY MAP PREFERENCES",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Black,
            color = Color(0xFFA1A1AA),
            letterSpacing = 1.sp
          )

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = "Show Nearby Incident Alerts",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
              )
              Text(
                text = "Display emergency crash and accident pins from other road users in your area (Default: OFF)",
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF71717A),
                fontSize = 11.sp
              )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Switch(
              checked = showNearbyIncidents,
              onCheckedChange = { showNearbyIncidents = it },
              colors = SwitchDefaults.colors(
                checkedThumbColor = Color(0xFF10B981),
                checkedTrackColor = Color(0xFF10B981).copy(alpha = 0.3f),
                uncheckedThumbColor = Color(0xFF71717A),
                uncheckedTrackColor = Color(0xFF27272A)
              )
            )
          }
        }
      }

      // 5. Legal & Publishing (Google Play Readiness)
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
          Text(
            text = "LEGAL & PUBLISHING",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Black,
            color = Color(0xFFA1A1AA),
            letterSpacing = 1.sp
          )

          // App Version Info
          Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            color = Color(0xFF09090B),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
          ) {
            Row(
              modifier = Modifier.fillMaxWidth().padding(12.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Column {
                Text("RAMS Safety App", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("Road Accident Monitoring System", fontSize = 10.sp, color = Color(0xFF71717A), fontFamily = FontFamily.Monospace)
              }
              Surface(shape = RoundedCornerShape(4.dp), color = RamsSyncBlue.copy(alpha = 0.15f), border = androidx.compose.foundation.BorderStroke(1.dp, RamsSyncBlue.copy(alpha = 0.4f))) {
                Text("v1.0.0", fontSize = 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = RamsSyncBlue, modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
              }
            }
          }

          // Privacy Policy
          Surface(
            modifier = Modifier
              .fillMaxWidth()
              .clickable { showPrivacyDialog = true },
            shape = RoundedCornerShape(8.dp),
            color = Color(0xFF09090B),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
          ) {
            Row(
              modifier = Modifier.fillMaxWidth().padding(12.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              Icon(Icons.Default.Policy, null, tint = RamsSyncBlue, modifier = Modifier.size(20.dp))
              Column(modifier = Modifier.weight(1f)) {
                Text("Privacy Policy", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("Data collection, storage, and user rights", fontSize = 9.5.sp, color = Color(0xFF71717A))
              }
              Surface(shape = RoundedCornerShape(3.dp), color = RamsSyncBlue.copy(alpha = 0.15f)) {
                Text("READ", fontSize = 7.5.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = RamsSyncBlue, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
              }
            }
          }

          // Terms of Service
          Surface(
            modifier = Modifier
              .fillMaxWidth()
              .clickable { showTermsDialog = true },
            shape = RoundedCornerShape(8.dp),
            color = Color(0xFF09090B),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
          ) {
            Row(
              modifier = Modifier.fillMaxWidth().padding(12.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              Icon(Icons.Default.Gavel, null, tint = RamsSyncBlue, modifier = Modifier.size(20.dp))
              Column(modifier = Modifier.weight(1f)) {
                Text("Terms of Service", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("End-user license agreement and usage terms", fontSize = 9.5.sp, color = Color(0xFF71717A))
              }
              Surface(shape = RoundedCornerShape(3.dp), color = RamsSyncBlue.copy(alpha = 0.15f)) {
                Text("READ", fontSize = 7.5.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = RamsSyncBlue, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
              }
            }
          }

          // Google Play Status
          Surface(
            modifier = Modifier
              .fillMaxWidth()
              .clickable { showGooglePlayDialog = true },
            shape = RoundedCornerShape(8.dp),
            color = Color(0xFF09090B),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
          ) {
            Row(
              modifier = Modifier.fillMaxWidth().padding(12.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              Icon(Icons.Default.FileDownload, null, tint = Color(0xFFA1A1AA), modifier = Modifier.size(20.dp))
              Column(modifier = Modifier.weight(1f)) {
                Text("Google Play Publishing", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("App distribution status and deployment target", fontSize = 9.5.sp, color = Color(0xFF71717A))
              }
              Surface(shape = RoundedCornerShape(3.dp), color = RamsSuccessEmerald.copy(alpha = 0.15f)) {
                Text("SPECS", fontSize = 7.5.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = RamsSuccessEmerald, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
              }
            }
          }
        }
      }


      // 6. Save & Sync Action Button
      Button(
        onClick = {
          if (riderName.isBlank()) {
            Toast.makeText(context, "[ERROR] Please enter road user full name", Toast.LENGTH_SHORT).show()
            return@Button
          }
          val finalToken = if (generatedToken.isNotBlank()) generatedToken else RiderProfile.generateFriendlyToken(riderName, selectedCategory)
          val updated = riderProfile.copy(
            riderName = riderName.trim(),
            driveLink = driveLink.trim(),
            userType = selectedCategory,
            token = finalToken,
            emergencyContactPhone = emergencyPhone.trim(),
            emergencyContactName = emergencyContactName.trim(),
            bloodType = bloodType.trim(),
            vehicleModel = vehicleModel.trim(),
            allergies = allergies.trim(),
            showNearbyIncidents = showNearbyIncidents,
            isLoggedIn = true
          )
          onSaveProfile(updated)
          Toast.makeText(context, "[OK] Settings & Profile Saved", Toast.LENGTH_SHORT).show()
        },
        modifier = Modifier
          .fillMaxWidth()
          .height(50.dp),
        shape = RoundedCornerShape(8.dp),
        colors = ButtonDefaults.buttonColors(
          containerColor = Color(0xFF10B981),
          contentColor = Color.Black
        )
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.Center
        ) {
          Icon(
            imageVector = Icons.Default.CheckCircle,
            contentDescription = null,
            modifier = Modifier.size(20.dp),
            tint = Color.Black
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "SAVE & SYNC SETTINGS",
            fontWeight = FontWeight.Black,
            fontSize = 13.sp,
            letterSpacing = 0.5.sp
          )
        }
      }

      // 7. Credits Button
      Button(
        onClick = { showCreditsOverlay = true },
        modifier = Modifier
          .fillMaxWidth()
          .height(46.dp),
        shape = RoundedCornerShape(8.dp),
        colors = ButtonDefaults.buttonColors(
          containerColor = Color(0xFF18181B),
          contentColor = Color.White
        ),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.Center
        ) {
          Icon(Icons.Default.Groups, null, modifier = Modifier.size(20.dp), tint = RamsSyncBlue)
          Spacer(modifier = Modifier.width(8.dp))
          Text("CREDITS", fontWeight = FontWeight.Black, fontSize = 12.sp, fontFamily = FontFamily.Monospace, letterSpacing = 1.sp)
        }
      }

      // Bottom breathing room
      Spacer(modifier = Modifier.height(16.dp))
    }

    // Credits Overlay
    AnimatedVisibility(
      visible = showCreditsOverlay,
      enter = fadeIn() + slideInVertically { it / 4 },
      exit = fadeOut() + slideOutVertically { it / 4 }
    ) {
      CreditsOverlay(onDismiss = { showCreditsOverlay = false })
    }

    if (showPrivacyDialog) {
      LegalDocumentDialog(
        title = "Privacy Policy",
        subtitle = "Google Play & Statutory Compliance • v1.0.0",
        content = RamsLegalDocuments.PRIVACY_POLICY,
        onDismiss = { showPrivacyDialog = false }
      )
    }

    if (showTermsDialog) {
      LegalDocumentDialog(
        title = "Terms of Service",
        subtitle = "End-User License Agreement • v1.0.0",
        content = RamsLegalDocuments.TERMS_OF_SERVICE,
        onDismiss = { showTermsDialog = false }
      )
    }

    if (showGooglePlayDialog) {
      GooglePlayPublishingDialog(
        onDismiss = { showGooglePlayDialog = false }
      )
    }
  }
}

// ─── Credits Overlay with Team Hierarchy ────────────────────────────────────

@Composable
private fun CreditsOverlay(onDismiss: () -> Unit) {
  Box(
    modifier = Modifier
      .fillMaxSize()
      .background(Color(0xF0050506))
      .clickable(enabled = false) {}
  ) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 20.dp, vertical = 24.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      // Close Button Row
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "PROJECT CREDITS",
          fontSize = 14.sp,
          fontWeight = FontWeight.Black,
          fontFamily = FontFamily.Monospace,
          color = Color.White,
          letterSpacing = 1.sp
        )
        IconButton(onClick = onDismiss, modifier = Modifier.size(36.dp)) {
          Icon(Icons.Default.Close, "Close", tint = Color(0xFFA1A1AA), modifier = Modifier.size(22.dp))
        }
      }

      Spacer(modifier = Modifier.height(8.dp))

      // Project Banner
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = RamsSyncBlue.copy(alpha = 0.08f),
        border = androidx.compose.foundation.BorderStroke(1.dp, RamsSyncBlue.copy(alpha = 0.3f))
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          horizontalAlignment = Alignment.CenterHorizontally,
          verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          Text("RAMS", fontSize = 28.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace, color = RamsSyncBlue, letterSpacing = 4.sp)
          Text("Road Accident Monitoring System", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA1A1AA))
          Text("Danger Monitoring System V2", fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = Color(0xFF71717A))
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // ─── HIERARCHY TREE ───────────────────────────────────────────

      // TIER 1: Adviser
      Text("ADVISER", fontSize = 9.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = RamsWarningAmber, letterSpacing = 1.sp)
      Spacer(modifier = Modifier.height(6.dp))
      TeamMemberCard(
        name = "Engr. May Anne Valencia, Ph.D.",
        role = "Project Adviser — ECE, Ph.D.",
        description = "Academic supervision, ECE research guidance, and doctoral engineering mentorship",
        accentColor = RamsWarningAmber,
        icon = Icons.Default.School
      )

      // Connector line
      Spacer(modifier = Modifier.height(4.dp))
      Box(
        modifier = Modifier
          .width(2.dp)
          .height(24.dp)
          .background(Color(0xFF27272A))
      )
      Spacer(modifier = Modifier.height(4.dp))

      // TIER 2: Lead Developer
      Text("LEAD DEVELOPER", fontSize = 9.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = RamsAlertRed, letterSpacing = 1.sp)
      Spacer(modifier = Modifier.height(6.dp))
      TeamMemberCard(
        name = "Jan Clyde T. Talosig",
        role = "Main Developer — Software & Hardware (ECE)",
        description = "Full-stack system architecture, embedded firmware (ESP32/Arduino), Android & Desktop app development, PCB design, and IoT integration",
        accentColor = RamsAlertRed,
        icon = Icons.Default.Person,
        isLead = true
      )

      // Branch connector: split into two
      Spacer(modifier = Modifier.height(4.dp))
      Box(
        modifier = Modifier
          .width(2.dp)
          .height(16.dp)
          .background(Color(0xFF27272A))
      )

      // Horizontal connector bar
      Box(
        modifier = Modifier
          .fillMaxWidth(0.6f)
          .height(2.dp)
          .background(Color(0xFF27272A))
      )

      // Vertical stubs down
      Row(
        modifier = Modifier.fillMaxWidth(0.6f),
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        Box(modifier = Modifier.width(2.dp).height(16.dp).background(Color(0xFF27272A)))
        Box(modifier = Modifier.width(2.dp).height(16.dp).background(Color(0xFF27272A)))
      }

      Spacer(modifier = Modifier.height(4.dp))

      // TIER 3: Support Members
      Text("SUPPORT TEAM — ECE", fontSize = 9.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = RamsSyncBlue, letterSpacing = 1.sp)
      Spacer(modifier = Modifier.height(6.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        Box(modifier = Modifier.weight(1f)) {
          TeamMemberCard(
            name = "Jake Harvey Lopez",
            role = "Cybersecurity & Legality (ECE)",
            description = "Legal compliance, cyber security audits, penetration testing, and policy",
            accentColor = RamsSyncBlue,
            icon = Icons.Default.Security,
            compact = true
          )
        }
        Box(modifier = Modifier.weight(1f)) {
          TeamMemberCard(
            name = "James Laurence Guzman",
            role = "Research & Documentation (ECE)",
            description = "Papers, presentations, testing, data collection, and time planning",
            accentColor = RamsSyncBlue,
            icon = Icons.Default.Book,
            compact = true
          )
        }
      }

      Spacer(modifier = Modifier.height(24.dp))

      // Institutional credit
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        color = Color(0xFF09090B),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
      ) {
        Column(
          modifier = Modifier.padding(14.dp),
          horizontalAlignment = Alignment.CenterHorizontally,
          verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          Text("A capstone project under the", fontSize = 10.sp, color = Color(0xFF71717A))
          Text("College of Engineering and Architecture", fontSize = 12.sp, fontWeight = FontWeight.Black, color = Color.White, textAlign = TextAlign.Center)
          Text("Cagayan State University — Carig Campus", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA1A1AA), textAlign = TextAlign.Center)
          Text("Department of Electronics Engineering (ECE)", fontSize = 9.5.sp, fontFamily = FontFamily.Monospace, color = RamsSyncBlue, textAlign = TextAlign.Center)
          Spacer(modifier = Modifier.height(2.dp))
          Text("© 2026–2027 RAMS Project Team", fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = Color(0xFF52525B))
        }
      }

      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

@Composable
private fun TeamMemberCard(
  name: String,
  role: String,
  description: String,
  accentColor: Color,
  icon: ImageVector,
  isLead: Boolean = false,
  compact: Boolean = false
) {
  Surface(
    modifier = Modifier.fillMaxWidth(),
    shape = RoundedCornerShape(12.dp),
    color = accentColor.copy(alpha = 0.06f),
    border = androidx.compose.foundation.BorderStroke(1.dp, accentColor.copy(alpha = 0.35f))
  ) {
    Column(
      modifier = Modifier.padding(if (compact) 10.dp else 14.dp),
      verticalArrangement = Arrangement.spacedBy(if (compact) 4.dp else 6.dp)
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        Box(
          modifier = Modifier
            .size(if (compact) 30.dp else 36.dp)
            .clip(CircleShape)
            .background(accentColor.copy(alpha = 0.15f))
            .border(1.dp, accentColor.copy(alpha = 0.5f), CircleShape),
          contentAlignment = Alignment.Center
        ) {
          Icon(icon, null, tint = accentColor, modifier = Modifier.size(if (compact) 16.dp else 18.dp))
        }
        Column {
          Text(
            text = name,
            fontSize = if (compact) 11.sp else 13.sp,
            fontWeight = FontWeight.Black,
            color = Color.White,
            maxLines = if (compact) 2 else 1
          )
          if (isLead) {
            Surface(shape = RoundedCornerShape(3.dp), color = accentColor.copy(alpha = 0.2f)) {
              Text("PROJECT LEAD", fontSize = 7.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = accentColor, modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp))
            }
          }
        }
      }
      Text(role, fontSize = if (compact) 9.sp else 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = accentColor, letterSpacing = 0.3.sp)
      Text(description, fontSize = if (compact) 9.sp else 10.sp, color = Color(0xFF71717A), lineHeight = if (compact) 13.sp else 14.sp)
    }
  }
}

@Composable
private fun CategoryButton(
  title: String,
  subtitle: String,
  icon: ImageVector,
  isSelected: Boolean,
  modifier: Modifier = Modifier,
  onClick: () -> Unit
) {
  val borderColor = if (isSelected) Color(0xFF10B981) else Color(0xFF27272A)
  val bgColor = if (isSelected) Color(0xFF10B981).copy(alpha = 0.12f) else Color(0xFF09090B)
  val iconColor = if (isSelected) Color(0xFF10B981) else Color(0xFF71717A)

  Surface(
    modifier = modifier
      .clip(RoundedCornerShape(8.dp))
      .clickable { onClick() },
    shape = RoundedCornerShape(8.dp),
    color = bgColor,
    border = androidx.compose.foundation.BorderStroke(1.dp, borderColor)
  ) {
    Row(
      modifier = Modifier.padding(horizontal = 10.dp, vertical = 10.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      Icon(
        imageVector = icon,
        contentDescription = null,
        tint = iconColor,
        modifier = Modifier.size(20.dp)
      )
      Column {
        Text(
          text = title,
          fontSize = 12.sp,
          fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
          color = if (isSelected) Color.White else Color(0xFFA1A1AA)
        )
        Text(
          text = subtitle,
          fontSize = 9.sp,
          fontFamily = FontFamily.Monospace,
          color = Color(0xFF71717A)
        )
      }
    }
  }
}

// ─── Legal Document Dialog & Google Play Specs ──────────────────────────────

@Composable
private fun LegalDocumentDialog(
  title: String,
  subtitle: String,
  content: String,
  onDismiss: () -> Unit
) {
  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxWidth(0.92f)
        .fillMaxHeight(0.85f),
      shape = RoundedCornerShape(16.dp),
      color = Color(0xFF121214),
      border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
    ) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(20.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
            Text(subtitle, fontSize = 10.sp, color = RamsSyncBlue, fontFamily = FontFamily.Monospace)
          }
          IconButton(onClick = onDismiss, modifier = Modifier.size(36.dp)) {
            Icon(Icons.Default.Close, "Close", tint = Color(0xFFA1A1AA))
          }
        }

        HorizontalDivider(color = Color(0xFF27272A), modifier = Modifier.padding(vertical = 12.dp))

        Column(
          modifier = Modifier
            .weight(1f)
            .verticalScroll(rememberScrollState()),
          verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Text(
            text = content,
            fontSize = 11.5.sp,
            color = Color(0xFFD4D4D8),
            lineHeight = 17.sp,
            fontFamily = FontFamily.Default
          )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Button(
          onClick = onDismiss,
          modifier = Modifier.fillMaxWidth().height(42.dp),
          shape = RoundedCornerShape(8.dp),
          colors = ButtonDefaults.buttonColors(
            containerColor = RamsSyncBlue,
            contentColor = Color.White
          )
        ) {
          Text("I UNDERSTAND & AGREE", fontWeight = FontWeight.Bold, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
        }
      }
    }
  }
}

@Composable
private fun GooglePlayPublishingDialog(onDismiss: () -> Unit) {
  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxWidth(0.92f)
        .fillMaxHeight(0.85f),
      shape = RoundedCornerShape(16.dp),
      color = Color(0xFF121214),
      border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
    ) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(20.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column(modifier = Modifier.weight(1f)) {
            Text("Google Play Readiness", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
            Text("Store Submission Checklist & Specifications", fontSize = 10.sp, color = RamsSuccessEmerald, fontFamily = FontFamily.Monospace)
          }
          IconButton(onClick = onDismiss, modifier = Modifier.size(36.dp)) {
            Icon(Icons.Default.Close, "Close", tint = Color(0xFFA1A1AA))
          }
        }

        HorizontalDivider(color = Color(0xFF27272A), modifier = Modifier.padding(vertical = 12.dp))

        Column(
          modifier = Modifier
            .weight(1f)
            .verticalScroll(rememberScrollState()),
          verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          PublishingSpecItem(label = "Application ID", value = "com.aistudio.rams.wkqmzb", status = "Configured")
          PublishingSpecItem(label = "Target SDK Level", value = "API 35 (Android 15 — Play Store Requirement)", status = "Ready")
          PublishingSpecItem(label = "Minimum SDK Level", value = "API 24 (Android 7.0 Nougat)", status = "Ready")
          PublishingSpecItem(label = "Version Code / Name", value = "1 (v1.0.0)", status = "Configured")
          PublishingSpecItem(label = "Permissions Disclosure", value = "ACCESS_FINE_LOCATION, BLUETOOTH_SCAN, BLUETOOTH_CONNECT, POST_NOTIFICATIONS", status = "Compliant")
          PublishingSpecItem(label = "Privacy Policy Requirement", value = "In-app readable document & Google Play URL requirement fulfilled", status = "Drafted In-App")
          PublishingSpecItem(label = "App Store Category", value = "Auto & Vehicles / Personal Safety & Travel", status = "Ready")
          PublishingSpecItem(label = "Bundle Target", value = "AAB (Android App Bundle) via .\\gradlew bundleRelease", status = "Ready to Build")
        }

        Spacer(modifier = Modifier.height(12.dp))

        Button(
          onClick = onDismiss,
          modifier = Modifier.fillMaxWidth().height(42.dp),
          shape = RoundedCornerShape(8.dp),
          colors = ButtonDefaults.buttonColors(
            containerColor = RamsSuccessEmerald,
            contentColor = Color.Black
          )
        ) {
          Text("CLOSE SPECIFICATIONS", fontWeight = FontWeight.Black, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
        }
      }
    }
  }
}

@Composable
private fun PublishingSpecItem(label: String, value: String, status: String) {
  Surface(
    shape = RoundedCornerShape(8.dp),
    color = Color(0xFF09090B),
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A)),
    modifier = Modifier.fillMaxWidth()
  ) {
    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
      Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Surface(shape = RoundedCornerShape(3.dp), color = RamsSuccessEmerald.copy(alpha = 0.15f)) {
          Text(status, fontSize = 7.5.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = RamsSuccessEmerald, modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp))
        }
      }
      Text(value, fontSize = 9.5.sp, color = Color(0xFFA1A1AA))
    }
  }
}

// ─── Legal Text Documents for Google Play & EULA ───────────────────────────

private object RamsLegalDocuments {
  const val PRIVACY_POLICY = """ROAD ACCIDENT MONITORING SYSTEM (RAMS)
PRIVACY POLICY
Last Updated: September 2026 • Version 1.0.0

1. INTRODUCTION & SCOPE
The Road Accident Monitoring System ("RAMS", "we", "our") is designed to safeguard commuters and riders through real-time accident detection, telemetry monitoring, and emergency response dispatch. This Privacy Policy explains how your information is collected, processed, and protected when using the RAMS mobile application.

2. INFORMATION WE COLLECT
• Location Data (GPS): High-precision latitude, longitude, speed, and altitude are captured during active monitoring sessions to pinpoint incident locations and provide emergency routing for first responders.
• Telemetry & Sensor Data: 3-axis accelerometer and gyroscope readings (IMU) from your connected wearable device are continuously analyzed on-device to identify crash signatures (fall, high-G impact, collision).
• Road User Profile: Name, road user category (Pedestrian, Bicycle, Motorcycle, Tricycle, Car, Truck), emergency contact details (name and phone number), blood type, known allergies, and vehicle model.
• Device & Network Telemetry: Bluetooth MAC addresses, Wi-Fi SoftAP credentials, and LoRa packet transmission status.

3. HOW WE USE YOUR INFORMATION
• Real-Time Crash Detection: Analyzing sensor spikes to trigger automatic rescue alerts.
• Emergency Dispatch: Sending automated SOS packets containing your coordinates and medical info to nearby emergency services and desktop monitoring command stations.
• False Alarm Prevention: Enabling riders to cancel benign triggers before alerting rescue personnel.
• Offline Resilience: Caching telemetry locally on your device when cellular networks are unavailable.

4. DATA STORAGE & RETENTION
All telemetry data is processed locally on-device and transmitted directly to authorized RAMS base stations via LoRa radio or secure local networks. We do not sell, rent, or monetize your personal data with third-party advertisers.

5. PERMISSIONS REQUIRED
• Location (ACCESS_FINE_LOCATION): Required for accident GPS localization.
• Bluetooth (BLUETOOTH_SCAN, BLUETOOTH_CONNECT): Required for ESP32 wearable sensor pairing and real-time telemetry streaming.
• Notifications (POST_NOTIFICATIONS): Required for emergency status alerts and danger warnings.

6. CONTACT & COMPLIANCE
For legal inquiries, data protection questions, or cyber security disclosures:
• Cybersecurity & Legality Lead: Jake Harvey Lopez (ECE)
• Lead Developer: Jan Clyde T. Talosig (ECE)
• Project Adviser: Engr. May Anne Valencia, Ph.D. (ECE)
• College of Engineering and Architecture, Cagayan State University — Carig Campus
• Department of Electronics Engineering"""

  const val TERMS_OF_SERVICE = """ROAD ACCIDENT MONITORING SYSTEM (RAMS)
TERMS OF SERVICE & END-USER LICENSE AGREEMENT
Last Updated: September 2026 • Version 1.0.0

1. ACCEPTANCE OF TERMS
By installing, registering with, or utilizing the RAMS mobile application ("Application"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not install or use the Application.

2. NATURE OF THE SERVICE
RAMS is an assistive road safety and accident detection research platform developed as a capstone project at the College of Engineering and Architecture, Cagayan State University — Carig Campus by Electronics Engineering (ECE) students under the academic supervision of Engr. May Anne Valencia, Ph.D. It pairs with wearable hardware (ESP32) and LoRa base station receivers to assist in rapid accident identification.

3. IMPORTANT SAFETY & EMERGENCY DISCLAIMER
• ASSISTIVE TOOL ONLY: RAMS is designed to assist riders and emergency responders, but it DOES NOT replace standard emergency services (such as 911, local emergency rescue hotlines, or official traffic police).
• NO GUARANTEE OF TRANSMISSION: Wireless transmission (LoRa, Bluetooth, Wi-Fi, Cellular) is subject to environmental interference, terrain blockage, battery levels, and network coverage. RAMS does not warrant uninterrupted communication under all crash scenarios.
• RIDER RESPONSIBILITY: Users must obey all local traffic laws, wear protective equipment (helmets, protective gear), and operate vehicles prudently regardless of monitoring status.

4. HARDWARE MOUNTING & ACCURACY
Accident detection accuracy relies on proper wearable sensor positioning, stable Bluetooth connectivity, and valid GPS fix. False alarms can occur during sudden drops or aggressive maneuvers; users should utilize the "Cancel False Alarm" control within the configured cancellation countdown window.

5. INTELLECTUAL PROPERTY & ATTRIBUTION
The RAMS software, firmware, and user interfaces are the intellectual property of the RAMS Project Team:
• Project Adviser: Engr. May Anne Valencia, Ph.D. (ECE)
• Lead Developer: Jan Clyde T. Talosig (ECE)
• Cybersecurity & Legality: Jake Harvey Lopez (ECE)
• Research & Documentation: James Laurence Guzman (ECE)
• © 2026–2027 RAMS Project Team • College of Engineering and Architecture, CSU-Carig

6. LIMITATION OF LIABILITY
To the maximum extent permitted by applicable law, the development team and academic institution shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the system during a vehicular incident."""
}


