package com.example.ui.screens

import android.annotation.SuppressLint
import android.bluetooth.BluetoothDevice
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material.icons.filled.BluetoothConnected
import androidx.compose.material.icons.filled.BluetoothSearching
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Emergency
import androidx.compose.material.icons.filled.Radio
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
import androidx.compose.runtime.derivedStateOf
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
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue

private enum class SimpleConnectionTab {
  BLUETOOTH,
  WIFI
}

/**
 * Lightweight data holder for Bluetooth device info.
 * Avoids repeated SecurityException-prone BluetoothDevice.name calls during recomposition.
 */
private data class CachedBtDevice(
  val address: String,
  val displayName: String,
  val isRamsWearable: Boolean,
  val device: BluetoothDevice
)

@SuppressLint("MissingPermission")
private fun BluetoothDevice.toCached(): CachedBtDevice {
  val name = try { this.name?.ifBlank { null } } catch (_: SecurityException) { null }
  val displayName = name ?: "Bluetooth Device"
  val isRams = name?.contains("RAMS", ignoreCase = true) == true ||
      name?.contains("Wearable", ignoreCase = true) == true
  return CachedBtDevice(address = this.address, displayName = displayName, isRamsWearable = isRams, device = this)
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
  bondedDevices: List<BluetoothDevice> = emptyList(),
  isScanningBluetooth: Boolean = false,
  isBluetoothEnabled: Boolean = true,
  onStartBluetoothScan: () -> Unit = {},
  onStopBluetoothScan: () -> Unit = {},
  onConnectDevice: (BluetoothDevice) -> Unit = {},
  onRequestEnableBluetooth: () -> Unit = {},
  onTriggerEmergencySOS: () -> Unit = {},
  onCancelFalseAlarm: () -> Unit = {}
) {
  val context = LocalContext.current
  var activeTab by remember { mutableStateOf(SimpleConnectionTab.BLUETOOTH) }
  var ipInput by remember { mutableStateOf(syncStatus.esp32Ip.ifBlank { "192.168.4.1" }) }

  val isConnected = syncStatus.isSyncActive
  val statusColor = if (isConnected) RamsSuccessEmerald else Color(0xFF71717A)

  // Cache device info once per list change to avoid repeated BT API calls during recomposition
  val cachedDiscovered by remember(discoveredDevices) {
    derivedStateOf { discoveredDevices.map { it.toCached() } }
  }
  val cachedBonded by remember(bondedDevices) {
    derivedStateOf { bondedDevices.map { it.toCached() } }
  }

  // Find priority RAMS wearable once
  val priorityTarget by remember(cachedDiscovered, cachedBonded) {
    derivedStateOf {
      (cachedDiscovered + cachedBonded).distinctBy { it.address }.firstOrNull { it.isRamsWearable }
    }
  }

  // Use LazyColumn as the root scrolling container for efficient device list rendering
  LazyColumn(
    modifier = Modifier
      .fillMaxSize()
      .padding(horizontal = 16.dp),
    contentPadding = PaddingValues(vertical = 14.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {

    // Bluetooth OFF Banner
    if (!isBluetoothEnabled) {
      item(key = "bt_off_banner") {
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
    }

    // 1. Clean Wearable Status Card
    item(key = "status_card") {
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
    }

    // 2. Simple Tab Selector: Bluetooth vs Wi-Fi
    item(key = "tab_selector") {
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
              Icon(Icons.Default.Bluetooth, null, tint = if (isBtSelected) RamsSyncBlue else Color(0xFF71717A), modifier = Modifier.size(18.dp))
              Spacer(modifier = Modifier.width(8.dp))
              Text("BLUETOOTH", fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = if (isBtSelected) Color.White else Color(0xFF71717A))
            }
          }

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
              Icon(Icons.Default.Wifi, null, tint = if (isWifiSelected) RamsSyncBlue else Color(0xFF71717A), modifier = Modifier.size(18.dp))
              Spacer(modifier = Modifier.width(8.dp))
              Text("WI-FI", fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = if (isWifiSelected) Color.White else Color(0xFF71717A))
            }
          }
        }
      }
    }

    // 3. Tab Content
    when (activeTab) {
      SimpleConnectionTab.BLUETOOTH -> {
        // Scan Button
        item(key = "bt_scan_btn") {
          Button(
            onClick = { if (isScanningBluetooth) onStopBluetoothScan() else onStartBluetoothScan() },
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(
              containerColor = Color(0xFF18181B),
              contentColor = if (isScanningBluetooth) RamsAlertRed else Color.White
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, if (isScanningBluetooth) RamsAlertRed.copy(alpha = 0.5f) else Color(0xFF27272A)),
            modifier = Modifier.fillMaxWidth().height(48.dp)
          ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
              if (isScanningBluetooth) {
                CircularProgressIndicator(modifier = Modifier.size(16.dp), color = RamsAlertRed, strokeWidth = 2.dp)
                Spacer(modifier = Modifier.width(10.dp))
                Text("SEARCHING FOR WEARABLE...", fontWeight = FontWeight.Black, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
              } else {
                Icon(Icons.Default.BluetoothSearching, null, tint = RamsSyncBlue, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(10.dp))
                Text("SCAN FOR WEARABLE", fontWeight = FontWeight.Black, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
              }
            }
          }
        }

        // Priority Match Card
        val target = priorityTarget
        if (target != null) {
          item(key = "priority_match_${target.address}") {
            val isTargetConnected = isConnected && syncStatus.btDeviceName == target.displayName
            Surface(
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp),
              color = RamsSuccessEmerald.copy(alpha = 0.10f),
              border = androidx.compose.foundation.BorderStroke(1.5.dp, RamsSuccessEmerald.copy(alpha = 0.7f))
            ) {
              Row(
                modifier = Modifier.fillMaxWidth().padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(12.dp),
                  modifier = Modifier.weight(1f)
                ) {
                  Box(
                    modifier = Modifier.size(38.dp).clip(CircleShape).background(RamsSuccessEmerald.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                  ) {
                    Icon(Icons.Default.Bluetooth, null, tint = RamsSuccessEmerald, modifier = Modifier.size(20.dp))
                  }
                  Column {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                      Text(target.displayName, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Black, fontSize = 12.5.sp, color = Color.White)
                      Surface(shape = RoundedCornerShape(4.dp), color = RamsSuccessEmerald.copy(alpha = 0.2f)) {
                        Text("PRIORITY MATCH", fontSize = 8.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = RamsSuccessEmerald, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                      }
                    }
                    Text("${target.address} • Ready to sync", fontSize = 9.5.sp, fontFamily = FontFamily.Monospace, color = RamsSuccessEmerald)
                  }
                }
                Button(
                  onClick = { onConnectDevice(target.device) },
                  shape = RoundedCornerShape(8.dp),
                  colors = ButtonDefaults.buttonColors(
                    containerColor = if (isTargetConnected) Color(0xFF27272A) else RamsSuccessEmerald,
                    contentColor = if (isTargetConnected) Color.White else Color.Black
                  ),
                  modifier = Modifier.height(36.dp)
                ) {
                  Text(if (isTargetConnected) "CONNECTED" else "CONNECT", fontWeight = FontWeight.Black, fontSize = 11.sp)
                }
              }
            }
          }
        }

        // Discovered Nearby header
        item(key = "discovered_header") {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text("DISCOVERED NEARBY (${cachedDiscovered.size})", fontSize = 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = Color(0xFF71717A), letterSpacing = 0.5.sp)
            if (isScanningBluetooth) {
              Text("SCANNING...", fontSize = 9.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = RamsAlertRed, letterSpacing = 0.5.sp)
            }
          }
        }

        // Empty state or device list
        if (cachedDiscovered.isEmpty()) {
          item(key = "discovered_empty") {
            Surface(
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(10.dp),
              color = Color(0xFF09090B),
              border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
            ) {
              Row(
                modifier = Modifier.fillMaxWidth().padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
              ) {
                if (isScanningBluetooth) {
                  CircularProgressIndicator(modifier = Modifier.size(16.dp), color = RamsAlertRed, strokeWidth = 2.dp)
                  Text("Searching nearby for all Bluetooth & BLE devices...", fontSize = 11.sp, color = Color(0xFFA1A1AA))
                } else {
                  Icon(Icons.Default.Bluetooth, null, tint = Color(0xFF71717A), modifier = Modifier.size(20.dp))
                  Text("No nearby devices discovered. Tap SCAN FOR WEARABLE above.", fontSize = 11.sp, color = Color(0xFF71717A))
                }
              }
            }
          }
        } else {
          items(items = cachedDiscovered, key = { "disc_${it.address}" }) { cached ->
            DiscoveredDeviceCard(
              cached = cached,
              isConnected = isConnected && syncStatus.btDeviceName == cached.displayName,
              onConnect = { onConnectDevice(cached.device) }
            )
          }
        }

        // Paired / Saved Devices header + list
        if (cachedBonded.isNotEmpty()) {
          item(key = "bonded_header") {
            Text("SAVED PHONE DEVICES (${cachedBonded.size})", fontSize = 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = Color(0xFF71717A), letterSpacing = 0.5.sp)
          }

          items(items = cachedBonded, key = { "bond_${it.address}" }) { cached ->
            BondedDeviceCard(
              cached = cached,
              isConnected = isConnected && syncStatus.btDeviceName == cached.displayName,
              onConnect = { onConnectDevice(cached.device) }
            )
          }
        }
      }

      SimpleConnectionTab.WIFI -> {
        item(key = "wifi_panel") {
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
                Text("SAFETY WEARABLE WI-FI SYNC", fontSize = 11.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace, color = Color(0xFFA1A1AA), letterSpacing = 0.5.sp)
                Text("Connect phone to the Wearable Wi-Fi network, then tap Connect.", fontSize = 11.5.sp, color = Color(0xFF71717A))
              }

              OutlinedTextField(
                value = ipInput,
                onValueChange = { ipInput = it },
                label = { Text("Wearable IP Address", fontSize = 11.sp) },
                placeholder = { Text("192.168.4.1", fontSize = 12.sp) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = RamsSyncBlue, unfocusedBorderColor = Color(0xFF27272A))
              )

              Button(
                onClick = {
                  val targetIp = ipInput.trim().ifBlank { "192.168.4.1" }
                  syncEngine.startWifiSync(ip = targetIp, port = 8080, getGps = { gps }, getImu = { imu }, getRiderProfile = { riderProfile })
                  Toast.makeText(context, "Connecting to Wearable at $targetIp...", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.fillMaxWidth().height(46.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF18181B), contentColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
              ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
                  Icon(Icons.Default.Wifi, null, tint = RamsSyncBlue, modifier = Modifier.size(18.dp))
                  Spacer(modifier = Modifier.width(8.dp))
                  Text("CONNECT VIA WI-FI", fontWeight = FontWeight.Black, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                }
              }
            }
          }
        }
      }
    }

    // Spacer
    item(key = "controls_spacer") { Spacer(modifier = Modifier.height(6.dp)) }

    // 4. Safety Wearable Device Controls
    item(key = "controls_header") {
      Text("SAFETY WEARABLE DEVICE CONTROLS", fontSize = 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = Color(0xFF71717A), letterSpacing = 0.5.sp)
    }

    item(key = "btn_cancel_alarm") {
      Button(
        onClick = {
          onCancelFalseAlarm()
          Toast.makeText(context, "False Alarm Dismissed — Stop Signal Sent to Wearable", Toast.LENGTH_SHORT).show()
        },
        modifier = Modifier.fillMaxWidth().height(46.dp),
        shape = RoundedCornerShape(10.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF18181B), contentColor = RamsSuccessEmerald),
        border = androidx.compose.foundation.BorderStroke(1.dp, RamsSuccessEmerald.copy(alpha = 0.6f))
      ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
          Icon(Icons.Default.CheckCircle, null, tint = RamsSuccessEmerald, modifier = Modifier.size(18.dp))
          Spacer(modifier = Modifier.width(8.dp))
          Text("CANCEL FALSE ALARM (DISMISS BUZZER)", fontWeight = FontWeight.Black, fontSize = 11.sp, fontFamily = FontFamily.Monospace, letterSpacing = 0.5.sp)
        }
      }
    }

    item(key = "btn_emergency_sos") {
      Button(
        onClick = {
          syncEngine.sendEmergencyCrashPacket(gps, imu, riderProfile)
          onTriggerEmergencySOS()
          Toast.makeText(context, "Emergency SOS Alert Broadcasted!", Toast.LENGTH_LONG).show()
        },
        modifier = Modifier.fillMaxWidth().height(48.dp),
        shape = RoundedCornerShape(10.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF18181B), contentColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, RamsAlertRed.copy(alpha = 0.5f))
      ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
          Icon(Icons.Default.Emergency, null, tint = RamsAlertRed, modifier = Modifier.size(18.dp))
          Spacer(modifier = Modifier.width(8.dp))
          Text("TRIGGER EMERGENCY SOS BROADCAST", fontWeight = FontWeight.Black, fontSize = 11.5.sp, fontFamily = FontFamily.Monospace, letterSpacing = 0.5.sp)
        }
      }
    }
  }
}

// ─── Extracted Device Cards (isolated recomposition) ────────────────────────

@Composable
private fun DiscoveredDeviceCard(
  cached: CachedBtDevice,
  isConnected: Boolean,
  onConnect: () -> Unit
) {
  Surface(
    modifier = Modifier.fillMaxWidth(),
    shape = RoundedCornerShape(10.dp),
    color = MaterialTheme.colorScheme.surface,
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
  ) {
    Row(
      modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 10.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.weight(1f)
      ) {
        Icon(Icons.Default.Bluetooth, null, tint = if (isConnected) RamsSuccessEmerald else RamsSyncBlue, modifier = Modifier.size(18.dp))
        Column {
          Text(cached.displayName, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
          Text(cached.address, fontSize = 9.5.sp, fontFamily = FontFamily.Monospace, color = Color(0xFF71717A))
        }
      }
      Button(
        onClick = onConnect,
        shape = RoundedCornerShape(6.dp),
        colors = ButtonDefaults.buttonColors(
          containerColor = if (isConnected) Color(0xFF27272A) else RamsSyncBlue,
          contentColor = Color.White
        ),
        modifier = Modifier.height(32.dp)
      ) {
        Text(if (isConnected) "CONNECTED" else "CONNECT", fontSize = 10.sp, fontWeight = FontWeight.Bold)
      }
    }
  }
}

@Composable
private fun BondedDeviceCard(
  cached: CachedBtDevice,
  isConnected: Boolean,
  onConnect: () -> Unit
) {
  Surface(
    modifier = Modifier.fillMaxWidth(),
    shape = RoundedCornerShape(10.dp),
    color = Color(0xFF141416),
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
  ) {
    Row(
      modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 10.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.weight(1f)
      ) {
        Icon(Icons.Default.BluetoothConnected, null, tint = Color(0xFFA1A1AA), modifier = Modifier.size(18.dp))
        Column {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(cached.displayName, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Surface(shape = RoundedCornerShape(3.dp), color = Color(0xFF27272A)) {
              Text("PAIRED", fontSize = 7.5.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = Color(0xFFA1A1AA), modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp))
            }
          }
          Text(cached.address, fontSize = 9.5.sp, fontFamily = FontFamily.Monospace, color = Color(0xFF71717A))
        }
      }
      Button(
        onClick = onConnect,
        shape = RoundedCornerShape(6.dp),
        colors = ButtonDefaults.buttonColors(
          containerColor = Color(0xFF27272A),
          contentColor = if (isConnected) RamsSuccessEmerald else Color.White
        ),
        modifier = Modifier.height(32.dp)
      ) {
        Text(if (isConnected) "CONNECTED" else "CONNECT", fontSize = 10.sp, fontWeight = FontWeight.Bold)
      }
    }
  }
}

