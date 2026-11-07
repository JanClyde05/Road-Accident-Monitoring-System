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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.layout.ContentScale
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
import coil.compose.AsyncImage
import com.example.model.GpsData
import com.example.model.RiderProfile
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue

@Composable
fun RiderLoginDialog(
  profile: RiderProfile?,
  currentGps: GpsData,
  onSaveProfile: (RiderProfile) -> Unit,
  onGenerateNewToken: () -> Unit = {},
  onDismiss: () -> Unit
) {
  val context = LocalContext.current
  val clipboard = LocalClipboardManager.current

  var riderName by remember { mutableStateOf(profile?.riderName ?: "") }
  var driveLink by remember { mutableStateOf(profile?.driveLink ?: "") }
  var selectedCategory by remember { mutableStateOf(profile?.userType?.ifBlank { "Pedestrian" } ?: "Pedestrian") }
  var generatedToken by remember { mutableStateOf(profile?.token ?: "") }

  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxWidth(0.95f)
        .clip(RoundedCornerShape(12.dp))
        .border(1.dp, Color(0xFF27272A), RoundedCornerShape(12.dp))
        .testTag("rider_login_dialog"),
      color = Color(0xFF121214)
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .verticalScroll(rememberScrollState())
          .padding(20.dp)
      ) {
        // Modal Header with Circular RAMS Emblem
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(Color(0xFF09090B))
                .border(1.5.dp, Color(0xFF52525B), CircleShape),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Default.Shield,
                contentDescription = null,
                tint = RamsSuccessEmerald,
                modifier = Modifier.size(18.dp)
              )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
              Text(
                text = "ROAD USER REGISTRATION",
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Black,
                fontSize = 14.sp,
                letterSpacing = 0.5.sp,
                color = Color.White
              )
              Text(
                text = "WEARABLE HARDWARE & CLOUD SYNC",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp,
                color = Color(0xFFA1A1AA)
              )
            }
          }

          IconButton(onClick = onDismiss) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFFA1A1AA))
          }
        }

        Spacer(modifier = Modifier.height(16.dp))
        HorizontalDivider(color = Color(0xFF27272A), thickness = 1.dp)
        Spacer(modifier = Modifier.height(16.dp))

        // Profile Live Preview Card (Dashed Standbys)
        Surface(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .border(1.dp, Color(0xFF27272A), RoundedCornerShape(10.dp)),
          color = Color(0xFF09090B)
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            // Circular 2x2 Photo Preview Container
            Box(
              modifier = Modifier
                .size(54.dp)
                .clip(CircleShape)
                .background(Color(0xFF18181B))
                .border(1.5.dp, Color(0xFF52525B), CircleShape),
              contentAlignment = Alignment.Center
            ) {
              if (driveLink.isNotBlank()) {
                AsyncImage(
                  model = driveLink,
                  contentDescription = "Profile Preview",
                  modifier = Modifier
                    .size(54.dp)
                    .clip(CircleShape),
                  contentScale = ContentScale.Crop
                )
              } else {
                Text(
                  text = "2x2",
                  fontFamily = FontFamily.Monospace,
                  fontWeight = FontWeight.Bold,
                  fontSize = 11.sp,
                  color = Color(0xFF71717A)
                )
              }
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = if (riderName.isNotBlank()) riderName else "------",
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Black,
                fontSize = 14.sp,
                color = Color.White
              )
              Text(
                text = selectedCategory.uppercase(),
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                color = RamsSyncBlue
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "TOKEN: ${if (generatedToken.isNotBlank()) generatedToken else "------"}",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                color = Color(0xFFA1A1AA)
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Road User Full Name Input
        Text(
          text = "ROAD USER FULL NAME",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 10.sp,
          letterSpacing = 0.6.sp,
          color = Color(0xFFA1A1AA)
        )
        Spacer(modifier = Modifier.height(6.dp))
        OutlinedTextField(
          value = riderName,
          onValueChange = {
            riderName = it
            generatedToken = RiderProfile.generateFriendlyToken(riderName, selectedCategory)
          },
          placeholder = {
            Text("Input your name here", color = Color(0xFF52525B), fontSize = 13.sp)
          },
          modifier = Modifier
            .fillMaxWidth()
            .testTag("input_rider_name"),
          colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White,
            focusedBorderColor = Color.White,
            unfocusedBorderColor = Color(0xFF27272A),
            focusedContainerColor = Color(0xFF18181B),
            unfocusedContainerColor = Color(0xFF18181B)
          ),
          shape = RoundedCornerShape(8.dp),
          singleLine = true
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Google Drive 2x2 Picture Link Input
        Text(
          text = "PHOTO (GOOGLE DRIVE 2X2 PICTURE LINK)",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 10.sp,
          letterSpacing = 0.6.sp,
          color = Color(0xFFA1A1AA)
        )
        Spacer(modifier = Modifier.height(6.dp))
        OutlinedTextField(
          value = driveLink,
          onValueChange = { driveLink = it },
          placeholder = {
            Text("Input you GDrive 2x2 Picture here", color = Color(0xFF52525B), fontSize = 13.sp)
          },
          modifier = Modifier
            .fillMaxWidth()
            .testTag("input_drive_link"),
          colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White,
            focusedBorderColor = Color.White,
            unfocusedBorderColor = Color(0xFF27272A),
            focusedContainerColor = Color(0xFF18181B),
            unfocusedContainerColor = Color(0xFF18181B)
          ),
          shape = RoundedCornerShape(8.dp),
          singleLine = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        // 4-Button Road User Category Switcher
        Text(
          text = "ROAD USER CATEGORY (TOGGLE ANYTIME)",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 10.sp,
          letterSpacing = 0.6.sp,
          color = Color(0xFFA1A1AA)
        )
        Spacer(modifier = Modifier.height(8.dp))

        val categories = RiderProfile.ROAD_USER_CATEGORIES
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
          for (chunk in categories.chunked(2)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              for (cat in chunk) {
                val isSelected = selectedCategory.equals(cat, ignoreCase = true)
                Surface(
                  modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .border(
                      width = 1.dp,
                      color = if (isSelected) Color.White else Color(0xFF27272A),
                      shape = RoundedCornerShape(8.dp)
                    )
                    .clickable {
                      selectedCategory = cat
                      generatedToken = RiderProfile.generateFriendlyToken(riderName, selectedCategory)
                    },
                  color = if (isSelected) Color(0xFF27272A) else Color(0xFF18181B)
                ) {
                  Box(
                    modifier = Modifier
                      .fillMaxWidth()
                      .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                  ) {
                    Text(
                      text = cat.uppercase(),
                      fontFamily = FontFamily.Monospace,
                      fontWeight = FontWeight.Bold,
                      fontSize = 10.sp,
                      letterSpacing = 0.5.sp,
                      color = if (isSelected) Color.White else Color(0xFFA1A1AA)
                    )
                  }
                }
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Deterministic Compact Token Display Card
        Surface(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .border(1.dp, Color(0xFF27272A), RoundedCornerShape(8.dp)),
          color = Color(0xFF09090B)
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
                text = "ENCRYPTED DEVICE TOKEN",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp,
                color = Color(0xFF71717A)
              )
              Text(
                text = if (generatedToken.isNotBlank()) generatedToken else "------",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Black,
                fontSize = 13.sp,
                color = RamsSuccessEmerald
              )
            }

            Row {
              IconButton(
                onClick = {
                  generatedToken = RiderProfile.generateFriendlyToken(riderName, selectedCategory)
                  Toast.makeText(context, "[SEC] Recomputed FNV-1a Hash Token", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.size(32.dp)
              ) {
                Icon(Icons.Default.Refresh, contentDescription = "Regenerate", tint = Color(0xFFA1A1AA), modifier = Modifier.size(16.dp))
              }
              IconButton(
                onClick = {
                  if (generatedToken.isNotBlank()) {
                    clipboard.setText(AnnotatedString(generatedToken))
                    Toast.makeText(context, "Copied Token: $generatedToken", Toast.LENGTH_SHORT).show()
                  }
                },
                modifier = Modifier.size(32.dp)
              ) {
                Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = Color(0xFFA1A1AA), modifier = Modifier.size(16.dp))
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Action Buttons
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Button(
            onClick = {
              if (riderName.isBlank()) {
                Toast.makeText(context, "[ERROR] Please enter road user full name", Toast.LENGTH_SHORT).show()
                return@Button
              }
              val finalToken = if (generatedToken.isNotBlank()) generatedToken else RiderProfile.generateFriendlyToken(riderName, selectedCategory)
              val updatedProfile = (profile ?: RiderProfile()).copy(
                riderName = riderName.trim(),
                driveLink = driveLink.trim(),
                userType = selectedCategory,
                token = finalToken,
                isLoggedIn = true
              )
              onSaveProfile(updatedProfile)
              Toast.makeText(context, "[OK] Profile & Category Synced with Wearable", Toast.LENGTH_SHORT).show()
              onDismiss()
            },
            modifier = Modifier
              .weight(1f)
              .height(46.dp)
              .testTag("btn_save_rider_profile"),
            colors = ButtonDefaults.buttonColors(
              containerColor = Color.White,
              contentColor = Color(0xFF09090B)
            ),
            shape = RoundedCornerShape(8.dp)
          ) {
            Text(
              text = "REGISTER & SYNC DEVICE",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Black,
              fontSize = 11.sp,
              letterSpacing = 0.6.sp
            )
          }
        }
      }
    }
  }
}
