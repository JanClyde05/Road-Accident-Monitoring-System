package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.model.PingEvent
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun PingMonitorDialog(
  isPingActive: Boolean,
  pingLog: List<PingEvent>,
  onDismiss: () -> Unit
) {
  val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.US)
  val sentCount = pingLog.size
  val ackCount = pingLog.count { it.ackAt != null }
  val noFixCount = pingLog.count { !it.hasFix }
  val lastPing = pingLog.firstOrNull()

  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxWidth(0.92f)
        .wrapContentHeight()
        .border(1.dp, Color(0xFF27272A), RoundedCornerShape(12.dp)),
      shape = RoundedCornerShape(12.dp),
      color = Color(0xFF18181B)
    ) {
      Column(
        modifier = Modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        // Header
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Text(
              text = "PING MONITOR",
              fontSize = 13.sp,
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Black,
              color = Color.White
            )
            Surface(
              shape = RoundedCornerShape(4.dp),
              color = if (isPingActive) Color(0xFF22C55E).copy(alpha = 0.2f) else Color(0xFF71717A).copy(alpha = 0.2f)
            ) {
              Text(
                text = if (isPingActive) "LIVE UPLINK" else "STANDBY",
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                fontSize = 9.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                color = if (isPingActive) Color(0xFF4ADE80) else Color(0xFFA1A1AA)
              )
            }
          }

          TextButton(
            onClick = onDismiss,
            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
          ) {
            Text("CLOSE", fontSize = 11.sp, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace)
          }
        }

        // Summary Counters
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          CounterBox("SENT", "$sentCount", Modifier.weight(1f), Color.White)
          CounterBox("ACKED", "$ackCount", Modifier.weight(1f), Color(0xFF4ADE80))
          CounterBox("NO-FIX", "$noFixCount", Modifier.weight(1f), if (noFixCount > 0) Color(0xFFF87171) else Color(0xFFA1A1AA))
        }

        // Latest Packet Details
        if (lastPing != null) {
          Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(6.dp),
            color = Color(0xFF09090B),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
          ) {
            Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(3.dp)) {
              Text(
                text = "LATEST PACKET #${lastPing.seq}",
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF38BDF8)
              )
              Text(
                text = "Timestamp: ${timeFormat.format(Date(lastPing.t0))} UTC | Interval: ${lastPing.intervalMs} ms",
                fontSize = 9.sp,
                fontFamily = FontFamily.Monospace,
                color = Color(0xFFA1A1AA)
              )
              Text(
                text = if (lastPing.hasFix) "GPS: ${String.format(Locale.US, "%.5f, %.5f", lastPing.lat, lastPing.lon)}" else "GPS: NO 3D FIX ACQUIRED",
                fontSize = 9.sp,
                fontFamily = FontFamily.Monospace,
                color = if (lastPing.hasFix) Color.White else Color(0xFFF87171)
              )
              Text(
                text = if (lastPing.ackAt != null) "Wearable ACK: Confirmed via BLE" else "Wearable ACK: Pending...",
                fontSize = 9.sp,
                fontFamily = FontFamily.Monospace,
                color = if (lastPing.ackAt != null) Color(0xFF4ADE80) else Color(0xFFFBBF24)
              )
            }
          }
        }

        // Scrollable Packet History Feed (Last 20)
        Text(
          text = "RECENT PACKET LOG",
          fontSize = 10.sp,
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          color = Color(0xFFA1A1AA)
        )

        LazyColumn(
          modifier = Modifier
            .fillMaxWidth()
            .heightIn(max = 180.dp),
          verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          if (pingLog.isEmpty()) {
            item {
              Text(
                text = "No pings transmitted yet. Toggle Ping Mode to begin.",
                fontSize = 10.sp,
                color = Color(0xFF71717A),
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(vertical = 12.dp)
              )
            }
          } else {
            items(pingLog.take(20)) { item ->
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .background(Color(0xFF09090B), RoundedCornerShape(4.dp))
                  .padding(horizontal = 8.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Text(
                  text = "#${item.seq} ${timeFormat.format(Date(item.t0))}",
                  fontSize = 10.sp,
                  fontFamily = FontFamily.Monospace,
                  color = Color.White
                )
                Text(
                  text = "${item.intervalMs}ms",
                  fontSize = 10.sp,
                  fontFamily = FontFamily.Monospace,
                  color = Color(0xFFA1A1AA)
                )
                Text(
                  text = if (item.ackAt != null) "ACK" else "TX",
                  fontSize = 9.sp,
                  fontFamily = FontFamily.Monospace,
                  fontWeight = FontWeight.Bold,
                  color = if (item.ackAt != null) Color(0xFF4ADE80) else Color(0xFFFBBF24)
                )
              }
            }
          }
        }

        // Footer Note
        Text(
          text = "Note: Distance, RSSI, SNR, and true latency are logged on the Station Panel.",
          fontSize = 9.sp,
          fontFamily = FontFamily.Monospace,
          color = Color(0xFF71717A),
          lineHeight = 12.sp
        )
      }
    }
  }
}

@Composable
private fun CounterBox(label: String, value: String, modifier: Modifier, valColor: Color) {
  Surface(
    modifier = modifier,
    shape = RoundedCornerShape(6.dp),
    color = Color(0xFF09090B),
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
  ) {
    Column(
      modifier = Modifier.padding(8.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Text(label, fontSize = 8.sp, fontFamily = FontFamily.Monospace, color = Color(0xFFA1A1AA))
      Text(value, fontSize = 16.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = valColor)
    }
  }
}
