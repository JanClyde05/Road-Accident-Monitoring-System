package com.example.ui.components

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lan
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SettingsInputAntenna
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.model.DeviceLinkStatus
import com.example.ui.theme.RamsSyncBlue

@Composable
fun ConnectionConfigDialog(
  linkStatus: DeviceLinkStatus,
  onConnectWebSocket: (wsUrl: String) -> Unit,
  onConnectWifi: (ip: String, port: Int) -> Unit,
  onConnectBluetooth: (mac: String, name: String) -> Unit,
  onStartSimulation: () -> Unit,
  onDismiss: () -> Unit
) {
  var selectedTab by remember { mutableStateOf("WEBSOCKET") }

  var wsUrl by remember { mutableStateOf(linkStatus.wsUrl) }
  var wifiIp by remember { mutableStateOf(linkStatus.ipAddress) }
  var wifiPort by remember { mutableStateOf(linkStatus.port.toString()) }

  var btMac by remember { mutableStateOf(linkStatus.bluetoothMac) }
  var btName by remember { mutableStateOf(linkStatus.bluetoothName) }

  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxWidth(0.95f)
        .clip(RoundedCornerShape(8.dp))
        .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
        .testTag("connection_config_dialog"),
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
              imageVector = Icons.Default.SettingsInputAntenna,
              contentDescription = null,
              tint = RamsSyncBlue,
              modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Column {
              Text(
                text = "ESP32 + LORA HARDWARE UPLINK",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface
              )
              Text(
                text = "MIGRATE PHONE SENSORS → ESP32 WEBSOCKET & LORA",
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

        Spacer(modifier = Modifier.height(12.dp))

        // Connection Mode Selector (3 Tabs: WEBSOCKET, WIFI, BLUETOOTH)
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          // WEBSOCKET Tab
          Box(
            modifier = Modifier
              .weight(1.2f)
              .clip(RoundedCornerShape(4.dp))
              .background(if (selectedTab == "WEBSOCKET") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
              .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp))
              .clickable { selectedTab = "WEBSOCKET" }
              .padding(vertical = 8.dp),
            contentAlignment = Alignment.Center
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                Icons.Default.Sync,
                contentDescription = null,
                modifier = Modifier.size(13.dp),
                tint = if (selectedTab == "WEBSOCKET") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "WEBSOCKET",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp,
                color = if (selectedTab == "WEBSOCKET") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }

          // WIFI SOCKET Tab
          Box(
            modifier = Modifier
              .weight(1f)
              .clip(RoundedCornerShape(4.dp))
              .background(if (selectedTab == "WIFI") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
              .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp))
              .clickable { selectedTab = "WIFI" }
              .padding(vertical = 8.dp),
            contentAlignment = Alignment.Center
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                Icons.Default.Wifi,
                contentDescription = null,
                modifier = Modifier.size(13.dp),
                tint = if (selectedTab == "WIFI") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "WIFI TCP",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp,
                color = if (selectedTab == "WIFI") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }

          // BLUETOOTH Tab
          Box(
            modifier = Modifier
              .weight(1f)
              .clip(RoundedCornerShape(4.dp))
              .background(if (selectedTab == "BT") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
              .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp))
              .clickable { selectedTab = "BT" }
              .padding(vertical = 8.dp),
            contentAlignment = Alignment.Center
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                Icons.Default.Bluetooth,
                contentDescription = null,
                modifier = Modifier.size(13.dp),
                tint = if (selectedTab == "BT") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "BT SPP",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp,
                color = if (selectedTab == "BT") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (selectedTab == "WEBSOCKET") {
          // WebSocket Configuration Form
          Text(
            text = "ESP32 WEBSOCKET SERVER URL",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 9.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
          Spacer(modifier = Modifier.height(6.dp))
          OutlinedTextField(
            value = wsUrl,
            onValueChange = { wsUrl = it },
            label = { Text("WebSocket URL (ws://ip:port/ws)", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
          )

          Spacer(modifier = Modifier.height(14.dp))

          Button(
            onClick = {
              onConnectWebSocket(wsUrl)
              onDismiss()
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
          ) {
            Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "CONNECT WEBSOCKET STREAMING",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp
            )
          }
        } else if (selectedTab == "WIFI") {
          // WiFi TCP Socket Form
          Text(
            text = "ESP32 SOFTAP OR LAN IP & PORT",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 9.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
          Spacer(modifier = Modifier.height(6.dp))
          OutlinedTextField(
            value = wifiIp,
            onValueChange = { wifiIp = it },
            label = { Text("ESP32 IPv4 Address", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
          )

          Spacer(modifier = Modifier.height(8.dp))

          OutlinedTextField(
            value = wifiPort,
            onValueChange = { wifiPort = it },
            label = { Text("TCP Port (default 8080)", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
          )

          Spacer(modifier = Modifier.height(14.dp))

          Button(
            onClick = {
              val portNum = wifiPort.toIntOrNull() ?: 8080
              onConnectWifi(wifiIp, portNum)
              onDismiss()
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
          ) {
            Text(
              text = "START WIFI TELEMETRY SYNC",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp
            )
          }
        } else {
          // Bluetooth SPP Form
          Text(
            text = "BLUETOOTH CLASSIC (SPP RFCOMM)",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 9.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
          Spacer(modifier = Modifier.height(6.dp))
          OutlinedTextField(
            value = btName,
            onValueChange = { btName = it },
            label = { Text("Device Name (e.g. ESP32_RAMS_LORA)", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
          )

          Spacer(modifier = Modifier.height(8.dp))

          OutlinedTextField(
            value = btMac,
            onValueChange = { btMac = it },
            label = { Text("MAC Address (XX:XX:XX:XX:XX:XX)", fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
          )

          Spacer(modifier = Modifier.height(14.dp))

          Button(
            onClick = {
              onConnectBluetooth(btMac, btName)
              onDismiss()
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
          ) {
            Text(
              text = "PAIR & STREAM BLUETOOTH",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp
            )
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // LoRa & Netlify Uplink Payload Preview
        Text(
          text = "WEBSOCKET / LORA PAYLOAD (WITH RESCUER TOKEN)",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 9.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(6.dp))
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(4.dp))
            .background(Color(0xFF09090B))
            .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp))
            .padding(10.dp)
        ) {
          Text(
            text = """{"type":"TELEMETRY","token":"${linkStatus.deviceToken}","rider":"Elena Dela Cruz","plate":"NCR-8821","t":17257482910,"lat":17.613210,"lon":121.727040,"spd":42.5,"ax":0.08,"ay":-0.12,"az":0.99,"amag":1.01,"shock":0}""",
            fontFamily = FontFamily.Monospace,
            fontSize = 8.sp,
            lineHeight = 12.sp,
            color = Color(0xFFFAFAFA)
          )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Standalone Highway Simulation Option
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Button(
            onClick = {
              onStartSimulation()
              onDismiss()
            },
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
          ) {
            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurface)
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = "SIMULATE HIGHWAY RUN",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp,
              color = MaterialTheme.colorScheme.onSurface
            )
          }

          Button(
            onClick = onDismiss,
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
          ) {
            Text(
              text = "CLOSE",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp,
              color = MaterialTheme.colorScheme.onSurface
            )
          }
        }
      }
    }
  }
}
