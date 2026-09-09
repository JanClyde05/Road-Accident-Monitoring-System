package com.example.ui.screens

import android.annotation.SuppressLint
import android.bluetooth.BluetoothDevice
import android.widget.Toast
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
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
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material.icons.filled.BluetoothConnected
import androidx.compose.material.icons.filled.BluetoothSearching
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Emergency
import androidx.compose.material.icons.filled.PowerSettingsNew
import androidx.compose.material.icons.filled.Radio
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.DeviceLinkStatus
import com.example.model.GpsData
import com.example.model.ImuData
import com.example.model.RiderProfile
import com.example.sync.Esp32SyncEngine
import com.example.sync.Esp32SyncStatus
import com.example.sync.SyncTransport
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import java.util.Locale

private enum class SimpleConnectionTab {
  BLUETOOTH,
  WIFI
}

@Composable
fun WearableScreen(
  linkStatus: DeviceLinkStatus,
  syncStatus: Esp32SyncStatus,
  syncEngine: Esp32SyncEngine,
  gps: GpsData,
  imu: ImuData,
  riderProfile: RiderProfile,
  discoveredDevices: List<BluetoothDevice> = emptyList(),
  isScanningBluetooth: Boolean = false,
  isBluetoothEnabled: Boolean = true,
  onStartBluetoothScan: () -> Unit = {},
  onStopBluetoothScan: () -> Unit = {},
  onConnectDevice: (BluetoothDevice) -> Unit = {},
  onRequestEnableBluetooth: () -> Unit = {},
  onTriggerEmergencySOS: () -> Unit = {}
) {
  val context = LocalContext.current
  var activeTab by remember { mutableStateOf(SimpleConnectionTab.BLUETOOTH) }
  var ipInput by remember { mutableStateOf(syncStatus.esp32Ip.ifBlank { "192.168.4.1" }) }

  val isConnected = syncStatus.isSyncActive
  val statusColor = if (isConnected) RamsSuccessEmerald else Color(0xFF71717A)

  Column(
    modifier = Modifier
      .fillMaxSize()
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 16.dp, vertical = 14.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    // Bluetooth OFF Banner
    if (!isBluetoothEnabled) {
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = RamsAlertRed.copy(alpha = 0.10f),
        border = androidx.compose.foundation.BorderStroke(1.dp, RamsAlertRed.copy(alpha = 0.5f))
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(14.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.weight(1f)
          ) {
            Icon(
              imageVector = Icons.Default.Bluetooth,
              contentDescription = null,
              tint = RamsAlertRed,
              modifier = Modifier.size(22.dp)
            )
            Column {
              Text(
                text = "BLUETOOTH IS OFF",
                fontSize = 12.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                color = RamsAlertRed,
                letterSpacing = 0.5.sp
              )
              Text(
                text = "Turn on Bluetooth to scan for your Safety Wearable",
                fontSize = 10.5.sp,
                color = Color(0xFFA1A1AA)
              )
            }
          }
          Button(
            onClick = onRequestEnableBluetooth,
            shape = RoundedCornerShape(8.dp),
            colors = ButtonDefaults.buttonColors(
              containerColor = Color(0xFF18181B),
              contentColor = RamsSyncBlue
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A)),
            modifier = Modifier.height(36.dp)
          ) {
            Text("TURN ON", fontWeight = FontWeight.Black, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
          }
        }
      }
    }
    // 1. Clean Wearable Status Card
    Surface(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(14.dp),
      color = MaterialTheme.colorScheme.surface,
      border = androidx.compose.foundation.BorderStroke(1.dp, if (isConnected) RamsSuccessEmerald.copy(alpha = 0.5f) else Color(0xFF27272A))
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(12.dp),
          modifier = Modifier.weight(1f)
        ) {
          Box(
            modifier = Modifier
              .size(42.dp)
              .clip(CircleShape)
              .background(statusColor.copy(alpha = 0.15f))
              .border(1.5.dp, statusColor.copy(alpha = 0.6f), CircleShape),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = if (isConnected) Icons.Default.CheckCircle else Icons.Default.Radio,
              contentDescription = null,
              tint = statusColor,
              modifier = Modifier.size(22.dp)
            )
          }

          Column {
            Text(
              text = if (isConnected) "WEARABLE CONNECTED" else "NOT CONNECTED",
              fontSize = 13.sp,
              fontWeight = FontWeight.Black,
              color = if (isConnected) RamsSuccessEmerald else Color.White,
              fontFamily = FontFamily.Monospace,
              letterSpacing = 0.5.sp
            )
            Text(
              text = if (isConnected) {
                syncStatus.btDeviceName.ifBlank { "RAMS Safety Wearable" }
              } else {
                "Select Bluetooth or Wi-Fi to sync"
              },
              fontSize = 11.sp,
              color = Color(0xFFA1A1AA)
            )
          }
        }

        if (isConnected) {
          Button(
            onClick = {
              syncEngine.stopSync()
              Toast.makeText(context, "Wearable Disconnected", Toast.LENGTH_SHORT).show()
            },
            shape = RoundedCornerShape(8.dp),
            colors = ButtonDefaults.buttonColors(
              containerColor = RamsAlertRed.copy(alpha = 0.15f),
              contentColor = RamsAlertRed
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, RamsAlertRed.copy(alpha = 0.5f)),
            modifier = Modifier.height(36.dp)
          ) {
            Text("DISCONNECT", fontWeight = FontWeight.Bold, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
          }
        }
      }
    }

    // 2. Simple Tab Selector: Bluetooth vs Wi-Fi
    Surface(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(10.dp),
      color = Color(0xFF09090B),
      border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
      ) {
        // Bluetooth Tab
        val isBtSelected = activeTab == SimpleConnectionTab.BLUETOOTH
        Surface(
          onClick = { activeTab = SimpleConnectionTab.BLUETOOTH },
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(8.dp),
          color = if (isBtSelected) RamsSyncBlue.copy(alpha = 0.18f) else Color.Transparent,
          border = if (isBtSelected) androidx.compose.foundation.BorderStroke(1.dp, RamsSyncBlue.copy(alpha = 0.6f)) else null
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(vertical = 10.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(
              imageVector = Icons.Default.Bluetooth,
              contentDescription = null,
              tint = if (isBtSelected) RamsSyncBlue else Color(0xFF71717A),
              modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "BLUETOOTH",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              fontFamily = FontFamily.Monospace,
              color = if (isBtSelected) Color.White else Color(0xFF71717A)
            )
          }
        }

        // Wi-Fi Tab
        val isWifiSelected = activeTab == SimpleConnectionTab.WIFI
        Surface(
          onClick = { activeTab = SimpleConnectionTab.WIFI },
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(8.dp),
          color = if (isWifiSelected) RamsSyncBlue.copy(alpha = 0.18f) else Color.Transparent,
          border = if (isWifiSelected) androidx.compose.foundation.BorderStroke(1.dp, RamsSyncBlue.copy(alpha = 0.6f)) else null
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(vertical = 10.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(
              imageVector = Icons.Default.Wifi,
              contentDescription = null,
              tint = if (isWifiSelected) RamsSyncBlue else Color(0xFF71717A),
              modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "WI-FI",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              fontFamily = FontFamily.Monospace,
              color = if (isWifiSelected) Color.White else Color(0xFF71717A)
            )
          }
        }
      }
    }

    // 3. Tab Content
    when (activeTab) {
      SimpleConnectionTab.BLUETOOTH -> {
        // Bluetooth Simple UI
        Column(
          modifier = Modifier.fillMaxWidth(),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          // Scan Button — dark slate style
          Button(
            onClick = {
              if (isScanningBluetooth) {
                onStopBluetoothScan()
              } else {
                onStartBluetoothScan()
              }
            },
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(
              containerColor = Color(0xFF18181B),
              contentColor = if (isScanningBluetooth) RamsAlertRed else Color.White
            ),
            border = androidx.compose.foundation.BorderStroke(
              1.dp,
              if (isScanningBluetooth) RamsAlertRed.copy(alpha = 0.5f) else Color(0xFF27272A)
            ),
            modifier = Modifier
              .fillMaxWidth()
              .height(48.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.Center
            ) {
              if (isScanningBluetooth) {
                CircularProgressIndicator(
                  modifier = Modifier.size(16.dp),
                  color = RamsAlertRed,
                  strokeWidth = 2.dp
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                  text = "SEARCHING FOR WEARABLE...",
                  fontWeight = FontWeight.Black,
                  fontSize = 11.sp,
                  fontFamily = FontFamily.Monospace
                )
              } else {
                Icon(
                  Icons.Default.BluetoothSearching,
                  contentDescription = null,
                  tint = RamsSyncBlue,
                  modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                  text = "SCAN FOR WEARABLE",
                  fontWeight = FontWeight.Black,
                  fontSize = 11.sp,
                  fontFamily = FontFamily.Monospace
                )
              }
            }
          }

          // Found RAMS Wearable or Target Device Card
          val targetFound = discoveredDevices.firstOrNull {
            try {
              it.name?.contains("RAMS", ignoreCase = true) == true ||
                it.name?.contains("Wearable", ignoreCase = true) == true
            } catch (_: SecurityException) { false }
          }

          if (targetFound != null) {
            Surface(
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp),
              color = RamsSuccessEmerald.copy(alpha = 0.10f),
              border = androidx.compose.foundation.BorderStroke(1.5.dp, RamsSuccessEmerald.copy(alpha = 0.7f))
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(12.dp),
                  modifier = Modifier.weight(1f)
                ) {
                  Box(
                    modifier = Modifier
                      .size(38.dp)
                      .clip(CircleShape)
                      .background(RamsSuccessEmerald.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                  ) {
                    Icon(
                      imageVector = Icons.Default.Bluetooth,
                      contentDescription = null,
                      tint = RamsSuccessEmerald,
                      modifier = Modifier.size(20.dp)
                    )
                  }
                  Column {
                    Text(
                      text = "RAMS Safety Wearable",
                      fontFamily = FontFamily.Monospace,
                      fontWeight = FontWeight.Black,
                      fontSize = 12.5.sp,
                      color = Color.White
                    )
                    Text(
                      text = "Ready to connect",
                      fontSize = 10.5.sp,
                      color = RamsSuccessEmerald
                    )
                  }
                }

                Button(
                  onClick = { onConnectDevice(targetFound) },
                  shape = RoundedCornerShape(8.dp),
                  colors = ButtonDefaults.buttonColors(
                    containerColor = RamsSuccessEmerald,
                    contentColor = Color.Black
                  ),
                  modifier = Modifier.height(36.dp)
                ) {
                  Text("CONNECT", fontWeight = FontWeight.Black, fontSize = 11.sp)
                }
              }
            }
          } else if (discoveredDevices.isEmpty()) {
            Surface(
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(10.dp),
              color = Color(0xFF09090B),
              border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
            ) {
              Column(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(18.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                Icon(
                  imageVector = Icons.Default.Bluetooth,
                  contentDescription = null,
                  tint = Color(0xFF71717A),
                  modifier = Modifier.size(28.dp)
                )
                Text(
                  text = if (isScanningBluetooth) {
                    "Searching nearby for your Safety Wearable..."
                  } else {
                    "Tap SCAN FOR WEARABLE above to begin"
                  },
                  fontSize = 11.5.sp,
                  color = Color(0xFFA1A1AA)
                )
              }
            }
          } else {
            // Other discovered Bluetooth devices
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
              Text(
                text = "NEARBY DEVICES",
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF71717A),
                letterSpacing = 0.5.sp
              )
              discoveredDevices.take(3).forEach { device ->
                @SuppressLint("MissingPermission")
                val deviceName = try { device.name?.ifBlank { "Safety Wearable Unit" } ?: "Safety Wearable Unit" } catch (_: SecurityException) { "Safety Wearable Unit" }
                Surface(
                  modifier = Modifier.fillMaxWidth(),
                  shape = RoundedCornerShape(10.dp),
                  color = MaterialTheme.colorScheme.surface,
                  border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                  Row(
                    modifier = Modifier
                      .fillMaxWidth()
                      .padding(horizontal = 14.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                  ) {
                    Text(
                      text = deviceName,
                      fontSize = 12.sp,
                      fontWeight = FontWeight.Bold,
                      color = Color.White
                    )
                    Button(
                      onClick = { onConnectDevice(device) },
                      shape = RoundedCornerShape(6.dp),
                      colors = ButtonDefaults.buttonColors(containerColor = RamsSyncBlue),
                      modifier = Modifier.height(32.dp)
                    ) {
                      Text("CONNECT", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                  }
                }
              }
            }
          }
        }
      }

      SimpleConnectionTab.WIFI -> {
        // Wi-Fi Simple UI
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
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
              Text(
                text = "SAFETY WEARABLE WI-FI SYNC",
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                color = Color(0xFFA1A1AA),
                letterSpacing = 0.5.sp
              )
              Text(
                text = "Connect phone to the Wearable Wi-Fi network, then tap Connect.",
                fontSize = 11.5.sp,
                color = Color(0xFF71717A)
              )
            }

            OutlinedTextField(
              value = ipInput,
              onValueChange = { ipInput = it },
              label = { Text("Wearable IP Address", fontSize = 11.sp) },
              placeholder = { Text("192.168.4.1", fontSize = 12.sp) },
              singleLine = true,
              modifier = Modifier.fillMaxWidth(),
              colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = RamsSyncBlue,
                unfocusedBorderColor = Color(0xFF27272A)
              )
            )

            Button(
              onClick = {
                val targetIp = ipInput.trim().ifBlank { "192.168.4.1" }
                syncEngine.startWifiSync(
                  ip = targetIp,
                  port = 8080,
                  getGps = { gps },
                  getImu = { imu },
                  getRiderProfile = { riderProfile }
                )
                Toast.makeText(context, "Connecting to Wearable at $targetIp...", Toast.LENGTH_SHORT).show()
              },
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
                Icon(Icons.Default.Wifi, contentDescription = null, tint = RamsSyncBlue, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                  text = "CONNECT VIA WI-FI",
                  fontWeight = FontWeight.Black,
                  fontSize = 11.sp,
                  fontFamily = FontFamily.Monospace
                )
              }
            }
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(6.dp))

    // 4. Emergency SOS Broadcast Button — dark slate with red glow
    Button(
      onClick = {
        syncEngine.sendEmergencyCrashPacket(gps, imu, riderProfile)
        onTriggerEmergencySOS()
        Toast.makeText(context, "Emergency SOS Alert Broadcasted!", Toast.LENGTH_LONG).show()
      },
      modifier = Modifier
        .fillMaxWidth()
        .height(48.dp),
      shape = RoundedCornerShape(10.dp),
      colors = ButtonDefaults.buttonColors(
        containerColor = Color(0xFF18181B),
        contentColor = Color.White
      ),
      border = androidx.compose.foundation.BorderStroke(1.dp, RamsAlertRed.copy(alpha = 0.5f))
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
      ) {
        Icon(Icons.Default.Emergency, contentDescription = null, tint = RamsAlertRed, modifier = Modifier.size(18.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          text = "TRIGGER EMERGENCY SOS BROADCAST",
          fontWeight = FontWeight.Black,
          fontSize = 11.5.sp,
          fontFamily = FontFamily.Monospace,
          letterSpacing = 0.5.sp
        )
      }
    }
  }
}
