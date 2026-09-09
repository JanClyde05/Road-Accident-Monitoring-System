package com.example.ui.screens

import android.widget.Toast
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.DirectionsBike
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.TwoWheeler
import com.example.ui.components.RamsVehicleIcons
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
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


    // Section 5 removed - Theme switch, CSV Logger, and Design Rules are not user-facing controls


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
