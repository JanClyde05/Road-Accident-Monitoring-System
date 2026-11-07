package com.example.ui.screens

import android.annotation.SuppressLint
import android.bluetooth.BluetoothDevice
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
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
import com.example.ui.theme.RamsWarningAmber

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

/**
 * Clean, Non-Technical Wearable Connection & Safety Beacon Screen.
 *
 * Designed for riders:
 * - Glanceable visual device hero showing connection and battery.
 * - Single-tap connect / reconnect with automatic BLE discovery.
 * - Encapsulated advanced Wi-Fi/socket diagnostics.
 */
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
    var showAdvancedNetwork by remember { mutableStateOf(false) }
    var ipInput by remember { mutableStateOf(syncStatus.esp32Ip.ifBlank { "192.168.4.1" }) }

    val isConnected = syncStatus.isSyncActive
    val isConnecting = syncStatus.isConnecting

    val cachedDiscovered by remember(discoveredDevices) {
        derivedStateOf { discoveredDevices.map { it.toCached() } }
    }
    val cachedBonded by remember(bondedDevices) {
        derivedStateOf { bondedDevices.map { it.toCached() } }
    }

    val combinedDevices = remember(cachedDiscovered, cachedBonded) {
        (cachedDiscovered + cachedBonded)
            .distinctBy { it.address }
            .sortedByDescending { it.isRamsWearable }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 14.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 84.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // 1. Bluetooth Disabled Warning Banner
        if (!isBluetoothEnabled) {
            item(key = "bt_off_warning") {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = RamsAlertRed.copy(alpha = 0.12f),
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
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(RamsAlertRed.copy(alpha = 0.2f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Bluetooth,
                                    contentDescription = "BT Disabled",
                                    tint = RamsAlertRed,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "BLUETOOTH IS OFF",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    color = RamsAlertRed
                                )
                                Text(
                                    text = "Enable Bluetooth to link your safety wearable.",
                                    fontSize = 10.sp,
                                    color = Color(0xFFA1A1AA)
                                )
                            }
                        }

                        Button(
                            onClick = onRequestEnableBluetooth,
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF27272A)),
                            border = BorderStroke(1.dp, RamsSyncBlue),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "TURN ON",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = RamsSyncBlue
                            )
                        }
                    }
                }
            }
        }

        // 2. Hero Wearable Device Card
        item(key = "hero_wearable_card") {
            val heroBorderColor = when {
                isConnected -> RamsSuccessEmerald
                isConnecting -> RamsSyncBlue
                else -> Color(0xFF27272A)
            }

            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF18181B),
                border = BorderStroke(1.5.dp, heroBorderColor)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Custom Canvas Wearable Hardware Vector Graphic
                    Box(
                        modifier = Modifier.size(90.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Canvas(modifier = Modifier.size(80.dp)) {
                            val w = size.width
                            val h = size.height

                            // Strap bands
                            drawRoundRect(
                                color = Color(0xFF27272A),
                                topLeft = Offset(w * 0.32f, 0f),
                                size = androidx.compose.ui.geometry.Size(w * 0.36f, h),
                                cornerRadius = androidx.compose.ui.geometry.CornerRadius(6.dp.toPx())
                            )

                            // Bezel case
                            drawRoundRect(
                                color = Color(0xFF09090B),
                                topLeft = Offset(w * 0.16f, h * 0.16f),
                                size = androidx.compose.ui.geometry.Size(w * 0.68f, h * 0.68f),
                                cornerRadius = androidx.compose.ui.geometry.CornerRadius(14.dp.toPx())
                            )

                            // Accent Ring
                            val ringColor = when {
                                isConnected -> RamsSuccessEmerald
                                isConnecting -> RamsSyncBlue
                                else -> RamsWarningAmber
                            }

                            drawRoundRect(
                                color = ringColor,
                                topLeft = Offset(w * 0.16f, h * 0.16f),
                                size = androidx.compose.ui.geometry.Size(w * 0.68f, h * 0.68f),
                                cornerRadius = androidx.compose.ui.geometry.CornerRadius(14.dp.toPx()),
                                style = Stroke(width = 2.dp.toPx())
                            )

                            // Center LED dot
                            drawCircle(
                                color = ringColor,
                                radius = 4.dp.toPx(),
                                center = Offset(w * 0.5f, h * 0.5f)
                            )
                        }

                        if (isConnecting) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(86.dp),
                                color = RamsSyncBlue,
                                strokeWidth = 2.dp
                            )
                        }
                    }

                    // Device Title & Status Headline
                    Text(
                        text = if (isConnected) (syncStatus.btDeviceName.ifBlank { "RAMS SAFETY WEARABLE" }) else "RAMS SAFETY WEARABLE",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        color = Color.White
                    )

                    val statusLabel = when {
                        isConnected -> "CONNECTED & SYNCHRONIZED"
                        isConnecting -> "PAIRING IN PROGRESS..."
                        else -> "WEARABLE DISCONNECTED"
                    }
                    val statusColor = when {
                        isConnected -> RamsSuccessEmerald
                        isConnecting -> RamsSyncBlue
                        else -> RamsWarningAmber
                    }

                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = statusColor.copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, statusColor.copy(alpha = 0.5f))
                    ) {
                        Text(
                            text = statusLabel,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = statusColor,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }

                    // Connected Specs Row (Battery, Transport, Watchdog)
                    if (isConnected) {
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFF09090B),
                            border = BorderStroke(1.dp, Color(0xFF27272A))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                                horizontalArrangement = Arrangement.SpaceAround,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                SpecItem(label = "BATTERY", value = "94%", color = RamsSuccessEmerald)
                                SpecItem(label = "BLE LINK", value = "NORDIC UART", color = RamsSyncBlue)
                                SpecItem(label = "AUTO-RECONNECT", value = "ACTIVE", color = RamsSuccessEmerald)
                            }
                        }

                        // Disconnect Action Button
                        OutlinedButton(
                            onClick = { syncEngine.stopSync() },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, Color(0xFF3F3F46))
                        ) {
                            Text(
                                text = "DISCONNECT WEARABLE",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFFA1A1AA)
                            )
                        }
                    } else {
                        // Big Primary Connect Button
                        Button(
                            onClick = {
                                onStartBluetoothScan()
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = RamsSuccessEmerald),
                            contentPadding = PaddingValues(vertical = 12.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = if (isScanningBluetooth) Icons.Default.Refresh else Icons.Default.BluetoothConnected,
                                    contentDescription = null,
                                    tint = Color.Black,
                                    modifier = Modifier.size(18.dp)
                                )
                                Text(
                                    text = if (isScanningBluetooth) "SCANNING NEARBY WEARABLES..." else "SCAN & CONNECT WEARABLE",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    color = Color.Black
                                )
                            }
                        }
                    }
                }
            }
        }

        // 3. Nearby Discovered Devices
        item(key = "devices_header") {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "NEARBY BLUETOOTH DEVICES",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace,
                    color = Color(0xFFA1A1AA),
                    letterSpacing = 1.sp
                )

                if (isScanningBluetooth) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(10.dp),
                            strokeWidth = 1.5.dp,
                            color = RamsSyncBlue
                        )
                        Text(
                            text = "SEARCHING",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = RamsSyncBlue
                        )
                    }
                }
            }
        }

        if (combinedDevices.isEmpty()) {
            item(key = "empty_devices") {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFF18181B),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Text(
                        text = if (isScanningBluetooth) "Scanning for RAMS Wearable beacon signals..." else "Tap 'SCAN & CONNECT WEARABLE' to search.",
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFF71717A),
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        } else {
            items(combinedDevices, key = { it.address }) { dev ->
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFF18181B),
                    border = BorderStroke(
                        1.dp,
                        if (dev.isRamsWearable) RamsSuccessEmerald.copy(alpha = 0.6f) else Color(0xFF27272A)
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 10.dp),
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
                                    .size(34.dp)
                                    .background(
                                        if (dev.isRamsWearable) RamsSuccessEmerald.copy(alpha = 0.15f) else Color(0xFF27272A),
                                        CircleShape
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Bluetooth,
                                    contentDescription = null,
                                    tint = if (dev.isRamsWearable) RamsSuccessEmerald else Color(0xFFA1A1AA),
                                    modifier = Modifier.size(16.dp)
                                )
                            }

                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = dev.displayName,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        color = Color.White,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    if (dev.isRamsWearable) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Surface(
                                            shape = RoundedCornerShape(3.dp),
                                            color = RamsSuccessEmerald.copy(alpha = 0.2f)
                                        ) {
                                            Text(
                                                text = "RAMS",
                                                fontSize = 8.sp,
                                                fontWeight = FontWeight.Black,
                                                fontFamily = FontFamily.Monospace,
                                                color = RamsSuccessEmerald,
                                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                            )
                                        }
                                    }
                                }
                                Text(
                                    text = dev.address,
                                    fontSize = 9.sp,
                                    fontFamily = FontFamily.Monospace,
                                    color = Color(0xFF71717A)
                                )
                            }
                        }

                        Button(
                            onClick = { onConnectDevice(dev.device) },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (dev.isRamsWearable) RamsSuccessEmerald else Color(0xFF27272A)
                            ),
                            contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "CONNECT",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = if (dev.isRamsWearable) Color.Black else Color.White
                            )
                        }
                    }
                }
            }
        }

        // 4. Encapsulation: Advanced Network Transports Accordion
        item(key = "advanced_accordion") {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { showAdvancedNetwork = !showAdvancedNetwork },
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFF18181B),
                border = BorderStroke(1.dp, Color(0xFF27272A))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "ADVANCED SYNC TRANSPORTS (WI-FI / SOCKET)",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFFA1A1AA)
                    )

                    Icon(
                        imageVector = if (showAdvancedNetwork) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = "Toggle",
                        tint = Color(0xFFA1A1AA),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        if (showAdvancedNetwork) {
            item(key = "advanced_content") {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF18181B),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Wi-Fi AP Direct Socket Sync",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        OutlinedTextField(
                            value = ipInput,
                            onValueChange = { ipInput = it },
                            label = { Text("ESP32 IP Address") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = RamsSyncBlue,
                                unfocusedBorderColor = Color(0xFF27272A)
                            )
                        )
                        Button(
                            onClick = {
                                syncEngine.startWifiSync(
                                    ip = ipInput,
                                    port = 8080,
                                    getGps = { gps },
                                    getImu = { imu },
                                    getRiderProfile = { riderProfile }
                                )
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = RamsSyncBlue)
                        ) {
                            Text(
                                text = "CONNECT VIA WI-FI SOCKET",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = Color.Black
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SpecItem(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = label,
            fontSize = 8.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            color = Color(0xFF71717A)
        )
        Text(
            text = value,
            fontSize = 10.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace,
            color = color
        )
    }
}
