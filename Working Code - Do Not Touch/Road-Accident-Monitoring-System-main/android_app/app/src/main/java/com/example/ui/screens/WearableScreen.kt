package com.example.ui.screens

import android.annotation.SuppressLint
import android.bluetooth.BluetoothDevice
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
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
import androidx.compose.ui.text.style.TextOverflow
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
import com.example.ui.theme.ZincBorderHairlineDark
import com.example.ui.theme.ZincDeepCanvasDark
import com.example.ui.theme.ZincElevatedLayerDark
import com.example.ui.theme.ZincInkHighContrastDark
import com.example.ui.theme.ZincInkMutedDark
import com.example.ui.theme.ZincInkTertiaryDark
import com.example.ui.theme.ZincSurfaceBaseDark

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
  val isConnecting = syncStatus.isConnecting

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

  LazyColumn(
    modifier = Modifier
      .fillMaxSize()
      .padding(horizontal = 16.dp),
    contentPadding = PaddingValues(top = 16.dp, bottom = 28.dp),
    verticalArrangement = Arrangement.spacedBy(14.dp)
  ) {

    // ── 1. Bluetooth OFF Banner ──────────────────────────────────────────────
    if (!isBluetoothEnabled) {
      item(key = "bt_off_banner") {
        Surface(
          modifier = Modifier.fillMaxWidth(),
          shape = RoundedCornerShape(12.dp),
          color = RamsAlertRed.copy(alpha = 0.08f),
          border = BorderStroke(1.dp, RamsAlertRed.copy(alpha = 0.5f))
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
                  .background(RamsAlertRed.copy(alpha = 0.18f)),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  imageVector = Icons.Default.Bluetooth,
                  contentDescription = null,
                  tint = RamsAlertRed,
                  modifier = Modifier.size(20.dp)
                )
              }
              Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(2.dp)
              ) {
                Text(
                  text = "BLUETOOTH IS DISABLED",
                  fontSize = 12.sp,
                  fontWeight = FontWeight.Black,
                  fontFamily = FontFamily.Monospace,
                  color = RamsAlertRed,
                  letterSpacing = 0.5.sp,
                  maxLines = 1,
                  softWrap = false,
                  overflow = TextOverflow.Ellipsis
                )
                Text(
                  text = "Turn on Bluetooth to scan & sync your wearable.",
                  fontSize = 11.sp,
                  color = ZincInkMutedDark,
                  maxLines = 2,
                  softWrap = true,
                  overflow = TextOverflow.Ellipsis
                )
              }
            }

            Spacer(modifier = Modifier.width(10.dp))

            Button(
              onClick = onRequestEnableBluetooth,
              shape = RoundedCornerShape(8.dp),
              colors = ButtonDefaults.buttonColors(
                containerColor = ZincElevatedLayerDark,
                contentColor = RamsSyncBlue
              ),
              border = BorderStroke(1.dp, RamsSyncBlue.copy(alpha = 0.5f)),
              contentPadding = PaddingValues(horizontal = 14.dp, vertical = 0.dp),
              modifier = Modifier.height(36.dp)
            ) {
              Text(
                text = "TURN ON",
                fontWeight = FontWeight.Black,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                maxLines = 1,
                softWrap = false
              )
            }
          }
        }
      }
    }

    // ── 2. Wearable Connection Status Card (The Live Hero) ───────────────────
    item(key = "status_card") {
      val cardBorderColor = when {
        isConnected -> RamsSuccessEmerald.copy(alpha = 0.6f)
        isConnecting -> RamsSyncBlue.copy(alpha = 0.6f)
        else -> ZincBorderHairlineDark
      }
      val iconTint = when {
        isConnected -> RamsSuccessEmerald
        isConnecting -> RamsSyncBlue
        else -> ZincInkTertiaryDark
      }

      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        color = ZincSurfaceBaseDark,
        border = BorderStroke(1.dp, cardBorderColor)
      ) {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          // Top Row: Avatar + Device Status Info + Disconnect Action
          Row(
            modifier = Modifier.fillMaxWidth(),
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
                  .background(iconTint.copy(alpha = 0.12f))
                  .border(1.dp, iconTint.copy(alpha = 0.5f), CircleShape),
                contentAlignment = Alignment.Center
              ) {
                if (isConnecting) {
                  CircularProgressIndicator(
                    modifier = Modifier.size(18.dp),
                    color = RamsSyncBlue,
                    strokeWidth = 2.dp
                  )
                } else {
                  Icon(
                    imageVector = if (isConnected) Icons.Default.CheckCircle else Icons.Default.Bluetooth,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(22.dp)
                  )
                }
              }

              Column(
                verticalArrangement = Arrangement.spacedBy(2.dp),
                modifier = Modifier
                  .weight(1f)
                  .fillMaxWidth()
              ) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                  Text(
                    text = when {
                      isConnecting -> "CONNECTING..."
                      isConnected -> "WEARABLE CONNECTED"
                      else -> "NOT CONNECTED"
                    },
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black,
                    color = when {
                      isConnecting -> RamsSyncBlue
                      isConnected -> RamsSuccessEmerald
                      else -> ZincInkHighContrastDark
                    },
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 0.5.sp,
                    maxLines = 1,
                    softWrap = false,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false)
                  )
                  if (isConnected) {
                    Surface(
                      shape = RoundedCornerShape(4.dp),
                      color = RamsSuccessEmerald.copy(alpha = 0.18f)
                    ) {
                      Text(
                        text = "LIVE",
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        color = RamsSuccessEmerald,
                        maxLines = 1,
                        softWrap = false,
                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp)
                      )
                    }
                  }
                }

                Text(
                  text = when {
                    isConnecting -> syncStatus.statusMessage.ifBlank { "Establishing BLE GATT link..." }
                    isConnected -> {
                      val devName = syncStatus.btDeviceName.ifBlank { "RAMS Safety Wearable" }
                      val mac = syncStatus.btMacAddress
                      if (mac.isNotBlank()) "$devName • $mac" else devName
                    }
                    else -> "Pair your ESP32-S3 wearable to stream phone GPS & IMU"
                  },
                  fontSize = 11.sp,
                  color = if (isConnecting) RamsSyncBlue else ZincInkMutedDark,
                  maxLines = 1,
                  softWrap = false,
                  overflow = TextOverflow.Ellipsis
                )
              }
            }

            if (isConnected) {
              Spacer(modifier = Modifier.width(10.dp))
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
                border = BorderStroke(1.dp, RamsAlertRed.copy(alpha = 0.4f)),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp),
                modifier = Modifier.height(34.dp)
              ) {
                Text(
                  text = "DISCONNECT",
                  fontWeight = FontWeight.Black,
                  fontSize = 10.sp,
                  fontFamily = FontFamily.Monospace,
                  maxLines = 1,
                  softWrap = false
                )
              }
            }
          }

          // Bottom Strip (Shown when connected): 3 Robust Telemetry Pills
          if (isConnected) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              TelemetryPill(label = "LINK", value = "BLE GATT", color = RamsSuccessEmerald, modifier = Modifier.weight(1f))
              TelemetryPill(label = "RELAY", value = "LORA 433M", color = RamsSyncBlue, modifier = Modifier.weight(1f))
              TelemetryPill(label = "SYNC", value = "10 Hz", color = Color(0xFFA1A1AA), modifier = Modifier.weight(1f))
            }
          }
        }
      }
    }

    // ── 3. Connected Wearable Controls (Prominent When Connected) ────────────
    if (isConnected) {
      item(key = "active_hardware_controls") {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text(
            text = "SAFETY WEARABLE HARDWARE CONTROLS",
            fontSize = 10.5.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            color = ZincInkMutedDark,
            letterSpacing = 0.5.sp,
            maxLines = 1,
            softWrap = false
          )

          Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            color = ZincSurfaceBaseDark,
            border = BorderStroke(1.dp, ZincBorderHairlineDark)
          ) {
            Column(
              modifier = Modifier.padding(12.dp),
              verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              // Cancel False Alarm Button
              Button(
                onClick = {
                  onCancelFalseAlarm()
                  Toast.makeText(context, "False Alarm Dismissed — Stop Signal Sent to Wearable", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier
                  .fillMaxWidth()
                  .height(44.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                  containerColor = ZincElevatedLayerDark,
                  contentColor = RamsSuccessEmerald
                ),
                border = BorderStroke(1.dp, RamsSuccessEmerald.copy(alpha = 0.5f)),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 0.dp)
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.Center
                ) {
                  Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = RamsSuccessEmerald,
                    modifier = Modifier.size(16.dp)
                  )
                  Spacer(modifier = Modifier.width(8.dp))
                  Text(
                    text = "CANCEL FALSE ALARM (DISMISS BUZZER)",
                    fontWeight = FontWeight.Black,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    maxLines = 1,
                    softWrap = false,
                    overflow = TextOverflow.Ellipsis
                  )
                }
              }

              // Trigger SOS Button
              Button(
                onClick = {
                  syncEngine.sendEmergencyCrashPacket(gps, imu, riderProfile)
                  onTriggerEmergencySOS()
                  Toast.makeText(context, "Emergency SOS Alert Broadcasted!", Toast.LENGTH_LONG).show()
                },
                modifier = Modifier
                  .fillMaxWidth()
                  .height(44.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                  containerColor = RamsAlertRed.copy(alpha = 0.18f),
                  contentColor = Color.White
                ),
                border = BorderStroke(1.dp, RamsAlertRed.copy(alpha = 0.7f)),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 0.dp)
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.Center
                ) {
                  Icon(
                    imageVector = Icons.Default.Emergency,
                    contentDescription = null,
                    tint = RamsAlertRed,
                    modifier = Modifier.size(16.dp)
                  )
                  Spacer(modifier = Modifier.width(8.dp))
                  Text(
                    text = "TRIGGER EMERGENCY SOS OVER LORA",
                    fontWeight = FontWeight.Black,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 0.5.sp,
                    maxLines = 1,
                    softWrap = false,
                    overflow = TextOverflow.Ellipsis
                  )
                }
              }
            }
          }
        }
      }
    }

    // ── 4. Connection Mode Selector (Segmented Bar) ──────────────────────────
    item(key = "tab_selector") {
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        color = ZincDeepCanvasDark,
        border = BorderStroke(1.dp, ZincBorderHairlineDark)
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
            color = if (isBtSelected) RamsSyncBlue.copy(alpha = 0.16f) else Color.Transparent,
            border = if (isBtSelected) BorderStroke(1.dp, RamsSyncBlue.copy(alpha = 0.6f)) else null
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 9.dp),
              horizontalArrangement = Arrangement.Center,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.Bluetooth,
                contentDescription = null,
                tint = if (isBtSelected) RamsSyncBlue else ZincInkTertiaryDark,
                modifier = Modifier.size(16.dp)
              )
              Spacer(modifier = Modifier.width(8.dp))
              Text(
                text = "BLUETOOTH BLE",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = if (isBtSelected) Color.White else ZincInkTertiaryDark,
                maxLines = 1,
                softWrap = false
              )
            }
          }

          val isWifiSelected = activeTab == SimpleConnectionTab.WIFI
          Surface(
            onClick = { activeTab = SimpleConnectionTab.WIFI },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(8.dp),
            color = if (isWifiSelected) RamsSyncBlue.copy(alpha = 0.16f) else Color.Transparent,
            border = if (isWifiSelected) BorderStroke(1.dp, RamsSyncBlue.copy(alpha = 0.6f)) else null
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 9.dp),
              horizontalArrangement = Arrangement.Center,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.Wifi,
                contentDescription = null,
                tint = if (isWifiSelected) RamsSyncBlue else ZincInkTertiaryDark,
                modifier = Modifier.size(16.dp)
              )
              Spacer(modifier = Modifier.width(8.dp))
              Text(
                text = "WI-FI / IP",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = if (isWifiSelected) Color.White else ZincInkTertiaryDark,
                maxLines = 1,
                softWrap = false
              )
            }
          }
        }
      }
    }

    // ── 5. Tab Content ───────────────────────────────────────────────────────
    when (activeTab) {
      SimpleConnectionTab.BLUETOOTH -> {
        // Bluetooth Scan Bar
        item(key = "bt_scan_btn") {
          Button(
            onClick = {
              if (isScanningBluetooth) onStopBluetoothScan() else onStartBluetoothScan()
            },
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(
              containerColor = ZincSurfaceBaseDark,
              contentColor = if (isScanningBluetooth) RamsAlertRed else Color.White
            ),
            border = BorderStroke(
              1.dp,
              if (isScanningBluetooth) RamsAlertRed.copy(alpha = 0.6f) else ZincBorderHairlineDark
            ),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 0.dp),
            modifier = Modifier
              .fillMaxWidth()
              .height(46.dp)
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
                  text = "SEARCHING FOR WEARABLE... TAP TO STOP",
                  fontWeight = FontWeight.Black,
                  fontSize = 11.sp,
                  fontFamily = FontFamily.Monospace,
                  color = RamsAlertRed,
                  maxLines = 1,
                  softWrap = false,
                  overflow = TextOverflow.Ellipsis
                )
              } else {
                Icon(
                  imageVector = Icons.Default.BluetoothSearching,
                  contentDescription = null,
                  tint = RamsSyncBlue,
                  modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                  text = "SCAN FOR WEARABLE & BLE DEVICES",
                  fontWeight = FontWeight.Black,
                  fontSize = 11.sp,
                  fontFamily = FontFamily.Monospace,
                  maxLines = 1,
                  softWrap = false,
                  overflow = TextOverflow.Ellipsis
                )
              }
            }
          }
        }

        // Priority Match Card (Hero Wearable Match)
        val target = priorityTarget
        if (target != null) {
          item(key = "priority_match_${target.address}") {
            val isTargetConnected = isConnected &&
                (syncStatus.btDeviceName == target.displayName || syncStatus.btMacAddress == target.address)
            val isPriorityConnecting = isConnecting && syncStatus.connectingDeviceAddress == target.address

            Surface(
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp),
              color = RamsSuccessEmerald.copy(alpha = 0.08f),
              border = BorderStroke(1.5.dp, RamsSuccessEmerald.copy(alpha = 0.65f))
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
                      .size(40.dp)
                      .clip(RoundedCornerShape(10.dp))
                      .background(RamsSuccessEmerald.copy(alpha = 0.2f))
                      .border(1.dp, RamsSuccessEmerald.copy(alpha = 0.5f), RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                  ) {
                    Icon(
                      imageVector = Icons.Default.BluetoothConnected,
                      contentDescription = null,
                      tint = RamsSuccessEmerald,
                      modifier = Modifier.size(22.dp)
                    )
                  }

                  Column(
                    verticalArrangement = Arrangement.spacedBy(3.dp),
                    modifier = Modifier
                      .weight(1f)
                      .fillMaxWidth()
                  ) {
                    Row(
                      modifier = Modifier.fillMaxWidth(),
                      verticalAlignment = Alignment.CenterVertically,
                      horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                      Text(
                        text = target.displayName,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Black,
                        fontSize = 13.sp,
                        color = Color.White,
                        maxLines = 1,
                        softWrap = false,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = false)
                      )
                      Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = RamsSuccessEmerald.copy(alpha = 0.25f)
                      ) {
                        Text(
                          text = "RAMS WEARABLE",
                          fontSize = 8.5.sp,
                          fontFamily = FontFamily.Monospace,
                          fontWeight = FontWeight.Black,
                          color = RamsSuccessEmerald,
                          maxLines = 1,
                          softWrap = false,
                          modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                      }
                    }

                    Row(
                      modifier = Modifier.fillMaxWidth(),
                      verticalAlignment = Alignment.CenterVertically,
                      horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                      Text(
                        text = target.address,
                        fontSize = 10.5.sp,
                        fontFamily = FontFamily.Monospace,
                        color = ZincInkMutedDark,
                        maxLines = 1,
                        softWrap = false,
                        overflow = TextOverflow.Ellipsis
                      )
                      Text(
                        text = "•",
                        fontSize = 10.5.sp,
                        color = ZincInkTertiaryDark,
                        maxLines = 1,
                        softWrap = false
                      )
                      Text(
                        text = if (isTargetConnected) "Syncing" else "Ready to pair",
                        fontSize = 10.5.sp,
                        fontFamily = FontFamily.Monospace,
                        color = RamsSuccessEmerald,
                        maxLines = 1,
                        softWrap = false
                      )
                    }
                  }
                }

                Spacer(modifier = Modifier.width(10.dp))

                Button(
                  onClick = { onConnectDevice(target.device) },
                  enabled = !isConnecting,
                  shape = RoundedCornerShape(8.dp),
                  colors = ButtonDefaults.buttonColors(
                    containerColor = when {
                      isTargetConnected -> ZincElevatedLayerDark
                      isPriorityConnecting -> RamsSyncBlue
                      else -> RamsSuccessEmerald
                    },
                    contentColor = when {
                      isTargetConnected -> RamsSuccessEmerald
                      isPriorityConnecting -> Color.White
                      else -> Color.Black
                    }
                  ),
                  contentPadding = PaddingValues(horizontal = 14.dp, vertical = 0.dp),
                  modifier = Modifier.height(36.dp)
                ) {
                  if (isPriorityConnecting) {
                    CircularProgressIndicator(
                      modifier = Modifier.size(13.dp),
                      color = Color.White,
                      strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                      text = "SYNCING",
                      fontWeight = FontWeight.Black,
                      fontSize = 10.sp,
                      fontFamily = FontFamily.Monospace,
                      maxLines = 1,
                      softWrap = false
                    )
                  } else {
                    Text(
                      text = if (isTargetConnected) "CONNECTED" else "CONNECT",
                      fontWeight = FontWeight.Black,
                      fontSize = 11.sp,
                      fontFamily = FontFamily.Monospace,
                      maxLines = 1,
                      softWrap = false
                    )
                  }
                }
              }
            }
          }
        }

        // Discovered Devices Header
        item(key = "discovered_header") {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "DISCOVERED NEARBY (${cachedDiscovered.size})",
              fontSize = 10.5.sp,
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              color = ZincInkMutedDark,
              letterSpacing = 0.5.sp,
              maxLines = 1,
              softWrap = false
            )
            if (isScanningBluetooth) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                CircularProgressIndicator(
                  modifier = Modifier.size(10.dp),
                  color = RamsAlertRed,
                  strokeWidth = 1.5.dp
                )
                Text(
                  text = "SCANNING",
                  fontSize = 9.5.sp,
                  fontFamily = FontFamily.Monospace,
                  fontWeight = FontWeight.Black,
                  color = RamsAlertRed,
                  letterSpacing = 0.5.sp,
                  maxLines = 1,
                  softWrap = false
                )
              }
            }
          }
        }

        // Empty State or Discovered Devices List
        if (cachedDiscovered.isEmpty()) {
          item(key = "discovered_empty") {
            Surface(
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(10.dp),
              color = ZincSurfaceBaseDark,
              border = BorderStroke(1.dp, ZincBorderHairlineDark)
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
              ) {
                if (isScanningBluetooth) {
                  CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    color = RamsAlertRed,
                    strokeWidth = 2.dp
                  )
                  Text(
                    text = "Listening for nearby Bluetooth & BLE wearable beacons...",
                    fontSize = 11.5.sp,
                    color = ZincInkMutedDark
                  )
                } else {
                  Icon(
                    imageVector = Icons.Default.Bluetooth,
                    contentDescription = null,
                    tint = ZincInkTertiaryDark,
                    modifier = Modifier.size(18.dp)
                  )
                  Text(
                    text = "No devices found yet. Tap 'SCAN FOR WEARABLE & BLE DEVICES' above.",
                    fontSize = 11.sp,
                    color = ZincInkTertiaryDark
                  )
                }
              }
            }
          }
        } else {
          items(items = cachedDiscovered, key = { "disc_${it.address}" }) { cached ->
            UnifiedDeviceCard(
              cached = cached,
              isConnected = isConnected && (syncStatus.btDeviceName == cached.displayName || syncStatus.btMacAddress == cached.address),
              isConnecting = isConnecting && syncStatus.connectingDeviceAddress == cached.address,
              badgeLabel = if (cached.isRamsWearable) "WEARABLE" else null,
              onConnect = { onConnectDevice(cached.device) }
            )
          }
        }

        // Paired / Bonded Devices
        if (cachedBonded.isNotEmpty()) {
          item(key = "bonded_header") {
            Text(
              text = "SAVED PHONE DEVICES (${cachedBonded.size})",
              fontSize = 10.5.sp,
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              color = ZincInkMutedDark,
              letterSpacing = 0.5.sp,
              maxLines = 1,
              softWrap = false
            )
          }

          items(items = cachedBonded, key = { "bond_${it.address}" }) { cached ->
            UnifiedDeviceCard(
              cached = cached,
              isConnected = isConnected && (syncStatus.btDeviceName == cached.displayName || syncStatus.btMacAddress == cached.address),
              isConnecting = isConnecting && syncStatus.connectingDeviceAddress == cached.address,
              badgeLabel = "PAIRED",
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
            color = ZincSurfaceBaseDark,
            border = BorderStroke(1.dp, ZincBorderHairlineDark)
          ) {
            Column(
              modifier = Modifier.padding(16.dp),
              verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
              Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                  text = "DIRECT WI-FI / TCP SYNC",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Black,
                  fontFamily = FontFamily.Monospace,
                  color = ZincInkHighContrastDark,
                  letterSpacing = 0.5.sp,
                  maxLines = 1,
                  softWrap = false
                )
                Text(
                  text = "Connect phone to wearable Wi-Fi SoftAP, then input IP and connect.",
                  fontSize = 11.5.sp,
                  color = ZincInkMutedDark
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
                  unfocusedBorderColor = ZincBorderHairlineDark
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
                  .height(44.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                  containerColor = ZincElevatedLayerDark,
                  contentColor = Color.White
                ),
                border = BorderStroke(1.dp, RamsSyncBlue.copy(alpha = 0.5f)),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 0.dp)
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.Center
                ) {
                  Icon(
                    imageVector = Icons.Default.Wifi,
                    contentDescription = null,
                    tint = RamsSyncBlue,
                    modifier = Modifier.size(16.dp)
                  )
                  Spacer(modifier = Modifier.width(8.dp))
                  Text(
                    text = "CONNECT VIA WI-FI",
                    fontWeight = FontWeight.Black,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    maxLines = 1,
                    softWrap = false
                  )
                }
              }
            }
          }
        }
      }
    }

    // ── 6. Fallback Offline Emergency Controls (When Disconnected) ───────────
    if (!isConnected) {
      item(key = "offline_controls_header") {
        Spacer(modifier = Modifier.height(4.dp))
        Text(
          text = "OFFLINE EMULATION & EMERGENCY CONTROLS",
          fontSize = 10.5.sp,
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          color = ZincInkTertiaryDark,
          letterSpacing = 0.5.sp,
          maxLines = 1,
          softWrap = false
        )
      }

      item(key = "offline_btn_cancel_alarm") {
        Button(
          onClick = {
            onCancelFalseAlarm()
            Toast.makeText(context, "False Alarm Dismissed", Toast.LENGTH_SHORT).show()
          },
          modifier = Modifier
            .fillMaxWidth()
            .height(44.dp),
          shape = RoundedCornerShape(10.dp),
          colors = ButtonDefaults.buttonColors(
            containerColor = ZincSurfaceBaseDark,
            contentColor = RamsSuccessEmerald
          ),
          border = BorderStroke(1.dp, RamsSuccessEmerald.copy(alpha = 0.4f)),
          contentPadding = PaddingValues(horizontal = 14.dp, vertical = 0.dp)
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
          ) {
            Icon(
              imageVector = Icons.Default.CheckCircle,
              contentDescription = null,
              tint = RamsSuccessEmerald,
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "CANCEL FALSE ALARM",
              fontWeight = FontWeight.Black,
              fontSize = 11.sp,
              fontFamily = FontFamily.Monospace,
              letterSpacing = 0.5.sp,
              maxLines = 1,
              softWrap = false,
              overflow = TextOverflow.Ellipsis
            )
          }
        }
      }

      item(key = "offline_btn_emergency_sos") {
        Button(
          onClick = {
            syncEngine.sendEmergencyCrashPacket(gps, imu, riderProfile)
            onTriggerEmergencySOS()
            Toast.makeText(context, "Emergency SOS Alert Broadcasted!", Toast.LENGTH_LONG).show()
          },
          modifier = Modifier
            .fillMaxWidth()
            .height(44.dp),
          shape = RoundedCornerShape(10.dp),
          colors = ButtonDefaults.buttonColors(
            containerColor = ZincSurfaceBaseDark,
            contentColor = Color.White
          ),
          border = BorderStroke(1.dp, RamsAlertRed.copy(alpha = 0.4f)),
          contentPadding = PaddingValues(horizontal = 14.dp, vertical = 0.dp)
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
          ) {
            Icon(
              imageVector = Icons.Default.Emergency,
              contentDescription = null,
              tint = RamsAlertRed,
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "TRIGGER EMERGENCY SOS BROADCAST",
              fontWeight = FontWeight.Black,
              fontSize = 11.sp,
              fontFamily = FontFamily.Monospace,
              letterSpacing = 0.5.sp,
              maxLines = 1,
              softWrap = false,
              overflow = TextOverflow.Ellipsis
            )
          }
        }
      }
    }
  }
}

// ─── Reusable Components ─────────────────────────────────────────────────────

@Composable
private fun TelemetryPill(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
  Surface(
    modifier = modifier,
    shape = RoundedCornerShape(6.dp),
    color = color.copy(alpha = 0.10f),
    border = BorderStroke(0.5.dp, color.copy(alpha = 0.35f))
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 6.dp, vertical = 6.dp),
      horizontalArrangement = Arrangement.Center,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = "$label: ",
        fontSize = 9.sp,
        fontFamily = FontFamily.Monospace,
        fontWeight = FontWeight.Bold,
        color = color.copy(alpha = 0.8f),
        maxLines = 1,
        softWrap = false
      )
      Text(
        text = value,
        fontSize = 9.sp,
        fontFamily = FontFamily.Monospace,
        fontWeight = FontWeight.Black,
        color = color,
        maxLines = 1,
        softWrap = false
      )
    }
  }
}

@Composable
private fun UnifiedDeviceCard(
  cached: CachedBtDevice,
  isConnected: Boolean,
  isConnecting: Boolean = false,
  badgeLabel: String? = null,
  onConnect: () -> Unit
) {
  val cardBorder = when {
    isConnected -> RamsSuccessEmerald.copy(alpha = 0.6f)
    cached.isRamsWearable -> RamsSuccessEmerald.copy(alpha = 0.35f)
    else -> ZincBorderHairlineDark
  }

  Surface(
    modifier = Modifier.fillMaxWidth(),
    shape = RoundedCornerShape(10.dp),
    color = ZincSurfaceBaseDark,
    border = BorderStroke(1.dp, cardBorder)
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 12.dp, vertical = 10.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.weight(1f)
      ) {
        Box(
          modifier = Modifier
            .size(38.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(
              when {
                isConnected -> RamsSuccessEmerald.copy(alpha = 0.15f)
                cached.isRamsWearable -> RamsSuccessEmerald.copy(alpha = 0.12f)
                else -> ZincElevatedLayerDark
              }
            ),
          contentAlignment = Alignment.Center
        ) {
          Icon(
            imageVector = if (isConnected) Icons.Default.BluetoothConnected else Icons.Default.Bluetooth,
            contentDescription = null,
            tint = when {
              isConnected -> RamsSuccessEmerald
              cached.isRamsWearable -> RamsSuccessEmerald
              else -> RamsSyncBlue
            },
            modifier = Modifier.size(18.dp)
          )
        }

        Column(
          verticalArrangement = Arrangement.spacedBy(2.dp),
          modifier = Modifier
            .weight(1f)
            .fillMaxWidth()
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            Text(
              text = cached.displayName,
              fontSize = 13.sp,
              fontWeight = FontWeight.SemiBold,
              color = Color.White,
              maxLines = 1,
              softWrap = false,
              overflow = TextOverflow.Ellipsis,
              modifier = Modifier.weight(1f, fill = false)
            )
            if (badgeLabel != null) {
              Surface(
                shape = RoundedCornerShape(3.dp),
                color = if (cached.isRamsWearable) RamsSuccessEmerald.copy(alpha = 0.2f) else ZincElevatedLayerDark
              ) {
                Text(
                  text = badgeLabel,
                  fontSize = 8.sp,
                  fontFamily = FontFamily.Monospace,
                  fontWeight = FontWeight.Black,
                  color = if (cached.isRamsWearable) RamsSuccessEmerald else ZincInkMutedDark,
                  maxLines = 1,
                  softWrap = false,
                  modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                )
              }
            }
          }

          Text(
            text = cached.address,
            fontSize = 10.5.sp,
            fontFamily = FontFamily.Monospace,
            color = ZincInkTertiaryDark,
            maxLines = 1,
            softWrap = false,
            overflow = TextOverflow.Ellipsis
          )
        }
      }

      Spacer(modifier = Modifier.width(10.dp))

      Button(
        onClick = onConnect,
        enabled = !isConnecting,
        shape = RoundedCornerShape(6.dp),
        colors = ButtonDefaults.buttonColors(
          containerColor = when {
            isConnected -> ZincElevatedLayerDark
            isConnecting -> RamsSyncBlue
            cached.isRamsWearable -> RamsSuccessEmerald.copy(alpha = 0.18f)
            else -> ZincElevatedLayerDark
          },
          contentColor = when {
            isConnected -> RamsSuccessEmerald
            isConnecting -> Color.White
            cached.isRamsWearable -> RamsSuccessEmerald
            else -> Color.White
          }
        ),
        border = BorderStroke(
          1.dp,
          when {
            isConnected -> RamsSuccessEmerald.copy(alpha = 0.4f)
            cached.isRamsWearable -> RamsSuccessEmerald.copy(alpha = 0.5f)
            else -> ZincBorderHairlineDark
          }
        ),
        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp),
        modifier = Modifier.height(34.dp)
      ) {
        if (isConnecting) {
          CircularProgressIndicator(
            modifier = Modifier.size(12.dp),
            color = Color.White,
            strokeWidth = 1.5.dp
          )
          Spacer(modifier = Modifier.width(5.dp))
          Text(
            text = "SYNCING",
            fontSize = 10.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace,
            maxLines = 1,
            softWrap = false
          )
        } else {
          Text(
            text = if (isConnected) "CONNECTED" else "CONNECT",
            fontSize = 10.5.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace,
            maxLines = 1,
            softWrap = false
          )
        }
      }
    }
  }
}
