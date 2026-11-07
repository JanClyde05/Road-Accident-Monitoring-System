package com.example.ui.components

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.GpsFixed
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.NearMe
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.GpsData
import com.example.model.IncidentEvent
import com.example.model.IncidentType
import com.example.model.RiderProfile
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber
import java.util.Locale
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun RamsMapView(
  gps: GpsData,
  events: List<IncidentEvent>,
  selectedEvent: IncidentEvent?,
  onSelectEvent: (IncidentEvent) -> Unit,
  riderProfile: RiderProfile? = null,
  onOpenLoginDialog: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  val clipboard = LocalClipboardManager.current
  var zoomLevel by remember { mutableFloatStateOf(1.0f) }

  // Radar pulsing animation for live tracking pin
  val infiniteTransition = rememberInfiniteTransition(label = "RadarPulse")
  val pulseRadius by infiniteTransition.animateFloat(
    initialValue = 6f,
    targetValue = 28f,
    animationSpec = infiniteRepeatable(
      animation = tween(1400, easing = FastOutSlowInEasing),
      repeatMode = RepeatMode.Restart
    ),
    label = "PulseRadius"
  )
  val pulseAlpha by infiniteTransition.animateFloat(
    initialValue = 0.75f,
    targetValue = 0.0f,
    animationSpec = infiniteRepeatable(
      animation = tween(1400, easing = FastOutSlowInEasing),
      repeatMode = RepeatMode.Restart
    ),
    label = "PulseAlpha"
  )

  Surface(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(8.dp))
      .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
      .testTag("rams_map_view"),
    color = MaterialTheme.colorScheme.surface
  ) {
    Column(modifier = Modifier.fillMaxWidth()) {
      // Map Canvas Box
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(230.dp)
      ) {
        // Tactical Road Grid Canvas
        Canvas(modifier = Modifier.fillMaxSize()) {
          val w = size.width
          val h = size.height
          val centerX = w / 2f
          val centerY = h / 2f

          // Map Canvas background
          drawRect(color = Color(0xFF09090B))

          // Grid lines (8pt spatial alignment)
          val gridStep = 32.dp.toPx()
          var gx = 0f
          while (gx < w) {
            drawLine(
              color = Color(0xFF18181B),
              start = Offset(gx, 0f),
              end = Offset(gx, h),
              strokeWidth = 0.8.dp.toPx()
            )
            gx += gridStep
          }
          var gy = 0f
          while (gy < h) {
            drawLine(
              color = Color(0xFF18181B),
              start = Offset(0f, gy),
              end = Offset(w, gy),
              strokeWidth = 0.8.dp.toPx()
            )
            gy += gridStep
          }

          // Maharlika Highway Corridor (Arterial curve)
          val highwayPath = Path().apply {
            moveTo(0f, centerY + 50f * zoomLevel)
            cubicTo(
              w * 0.35f, centerY + 30f * zoomLevel,
              w * 0.55f, centerY - 40f * zoomLevel,
              w, centerY - 60f * zoomLevel
            )
          }

          // Secondary cross-streets
          drawLine(
            color = Color(0xFF27272A),
            start = Offset(w * 0.25f, 0f),
            end = Offset(w * 0.35f, h),
            strokeWidth = 3.dp.toPx()
          )
          drawLine(
            color = Color(0xFF27272A),
            start = Offset(w * 0.65f, 0f),
            end = Offset(w * 0.75f, h),
            strokeWidth = 3.dp.toPx()
          )

          // Arterial Road outline & surface
          drawPath(highwayPath, color = Color(0xFF3F3F46), style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round))
          drawPath(highwayPath, color = Color(0xFF18181B), style = Stroke(width = 5.dp.toPx(), cap = StrokeCap.Round))

          // Center dashed line
          drawPath(
            highwayPath,
            color = Color(0xFF71717A),
            style = Stroke(
              width = 1.5.dp.toPx(),
              pathEffect = androidx.compose.ui.graphics.PathEffect.dashPathEffect(floatArrayOf(12f, 10f), 0f)
            )
          )

          // Live GPS Vehicle Beacon (at centerX, centerY)
          drawCircle(
            color = RamsSyncBlue.copy(alpha = pulseAlpha),
            radius = pulseRadius * 1.5f,
            center = Offset(centerX, centerY)
          )
          drawCircle(
            color = Color(0xFF09090B),
            radius = 7.dp.toPx(),
            center = Offset(centerX, centerY)
          )
          drawCircle(
            color = RamsSyncBlue,
            radius = 5.dp.toPx(),
            center = Offset(centerX, centerY)
          )

          // Heading Direction Needle
          val headingRad = Math.toRadians(gps.headingDegrees.toDouble() - 90.0)
          val arrowLen = 18.dp.toPx()
          val arrowTip = Offset(
            (centerX + cos(headingRad) * arrowLen).toFloat(),
            (centerY + sin(headingRad) * arrowLen).toFloat()
          )
          drawLine(
            color = Color(0xFFFAFAFA),
            start = Offset(centerX, centerY),
            end = arrowTip,
            strokeWidth = 2.dp.toPx(),
            cap = StrokeCap.Round
          )
        }

        // Map Pins Overlay for Incidents
        events.forEachIndexed { index, event ->
          val xFraction = when (index % 4) {
            0 -> 0.28f
            1 -> 0.74f
            2 -> 0.85f
            else -> 0.42f
          }
          val yFraction = when (index % 4) {
            0 -> 0.32f
            1 -> 0.24f
            2 -> 0.72f
            else -> 0.65f
          }

          Box(
            modifier = Modifier
              .fillMaxSize()
              .padding(
                start = (xFraction * 280).dp,
                top = (yFraction * 140).dp
              )
          ) {
            IncidentPinOverlay(
              type = event.type,
              title = event.id.takeLast(5),
              isSelected = selectedEvent?.id == event.id,
              onClick = { onSelectEvent(event) }
            )
          }
        }

        // Top Status Bar: Coordinates & Highway Label
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            modifier = Modifier
              .clip(RoundedCornerShape(4.dp))
              .background(Color(0xE618181B))
              .border(1.dp, Color(0xFF27272A), RoundedCornerShape(4.dp))
              .clickable {
                val coords = String.format(Locale.US, "%.6f, %.6f", gps.latitude, gps.longitude)
                clipboard.setText(AnnotatedString(coords))
                Toast.makeText(context, "Copied coordinates: $coords", Toast.LENGTH_SHORT).show()
              }
              .padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Box(
              modifier = Modifier
                .size(6.dp)
                .clip(CircleShape)
                .background(RamsSyncBlue)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = String.format(Locale.US, "LAT %.5f  LON %.5f", gps.latitude, gps.longitude),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = Color(0xFFFAFAFA)
            )
          }

          Text(
            text = "LIVE RESCUER BEACON",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 9.sp,
            color = RamsSuccessEmerald
          )
        }

        // Bottom Right: Zoom & Recenter Controls
        Row(
          modifier = Modifier
            .align(Alignment.BottomEnd)
            .padding(12.dp),
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          Box(
            modifier = Modifier
              .size(28.dp)
              .clip(RoundedCornerShape(4.dp))
              .background(Color(0xE618181B))
              .border(1.dp, Color(0xFF27272A), RoundedCornerShape(4.dp))
              .clickable { zoomLevel = (zoomLevel + 0.2f).coerceAtMost(2.0f) },
            contentAlignment = Alignment.Center
          ) {
            Icon(Icons.Default.Add, contentDescription = "Zoom In", tint = Color.White, modifier = Modifier.size(14.dp))
          }

          Box(
            modifier = Modifier
              .size(28.dp)
              .clip(RoundedCornerShape(4.dp))
              .background(Color(0xE618181B))
              .border(1.dp, Color(0xFF27272A), RoundedCornerShape(4.dp))
              .clickable { zoomLevel = (zoomLevel - 0.2f).coerceAtLeast(0.6f) },
            contentAlignment = Alignment.Center
          ) {
            Icon(Icons.Default.Remove, contentDescription = "Zoom Out", tint = Color.White, modifier = Modifier.size(14.dp))
          }

          Box(
            modifier = Modifier
              .size(28.dp)
              .clip(RoundedCornerShape(4.dp))
              .background(Color(0xE618181B))
              .border(1.dp, Color(0xFF27272A), RoundedCornerShape(4.dp))
              .clickable { zoomLevel = 1.0f },
            contentAlignment = Alignment.Center
          ) {
            Icon(Icons.Default.GpsFixed, contentDescription = "Recenter", tint = RamsSyncBlue, modifier = Modifier.size(14.dp))
          }
        }
      }

      // Live Map Rescuer Pindown & Dispatch Bar
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .background(MaterialTheme.colorScheme.surfaceVariant)
          .border(1.dp, MaterialTheme.colorScheme.outline)
          .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column(
          modifier = Modifier
            .weight(1f)
            .clickable { onOpenLoginDialog() }
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
              text = "NETLIFY RADAR ID:",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = riderProfile?.token ?: "NO TOKEN",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Black,
              fontSize = 9.sp,
              color = RamsSyncBlue
            )
          }
          Text(
            text = "Rescuers track this unit via Netlify website",
            fontFamily = FontFamily.Monospace,
            fontSize = 8.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }

        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
          // Open in Google Maps
          Button(
            onClick = {
              val geoUri = Uri.parse("geo:${gps.latitude},${gps.longitude}?q=${gps.latitude},${gps.longitude}(RAMS+Emergency+Beacon)")
              val mapIntent = Intent(Intent.ACTION_VIEW, geoUri)
              try {
                context.startActivity(mapIntent)
              } catch (_: Exception) {
                // Fallback to web browser maps
                val webUri = Uri.parse("https://maps.google.com/?q=${gps.latitude},${gps.longitude}")
                context.startActivity(Intent(Intent.ACTION_VIEW, webUri))
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
            modifier = Modifier.height(30.dp)
          ) {
            Icon(Icons.Default.NearMe, contentDescription = null, modifier = Modifier.size(11.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text("NAVIGATE", fontFamily = FontFamily.Monospace, fontSize = 8.sp, fontWeight = FontWeight.Bold)
          }

          // Launch Netlify Web Portal
          Button(
            onClick = {
              val url = riderProfile?.getNetlifyPindownUrl(gps.latitude, gps.longitude)
                ?: "https://rams-rescuer.netlify.app/?lat=${gps.latitude}&lon=${gps.longitude}"
              val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
              try {
                context.startActivity(intent)
              } catch (_: Exception) {
                Toast.makeText(context, "Unable to open browser", Toast.LENGTH_SHORT).show()
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = RamsSyncBlue),
            modifier = Modifier.height(30.dp)
          ) {
            Icon(Icons.Default.OpenInBrowser, contentDescription = null, modifier = Modifier.size(11.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text("NETLIFY", fontFamily = FontFamily.Monospace, fontSize = 8.sp, fontWeight = FontWeight.Bold)
          }
        }
      }
    }
  }
}

@Composable
private fun IncidentPinOverlay(
  type: IncidentType,
  title: String,
  isSelected: Boolean,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val (pinColor, glyph) = when (type) {
    IncidentType.ALERT -> Pair(RamsAlertRed, Icons.Default.Warning)
    IncidentType.TEST -> Pair(RamsWarningAmber, Icons.Default.Build)
    IncidentType.FALSE_ALARM -> Pair(RamsSuccessEmerald, Icons.Default.Shield)
    IncidentType.TELEMETRY -> Pair(RamsSyncBlue, Icons.Default.Navigation)
  }

  Column(
    modifier = modifier.clickable { onClick() },
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    Box(
      modifier = Modifier
        .size(if (isSelected) 28.dp else 22.dp)
        .clip(CircleShape)
        .background(pinColor)
        .border(1.5.dp, Color.White, CircleShape),
      contentAlignment = Alignment.Center
    ) {
      Icon(
        imageVector = glyph,
        contentDescription = title,
        tint = Color.White,
        modifier = Modifier.size(if (isSelected) 14.dp else 11.dp)
      )
    }

    Spacer(modifier = Modifier.height(2.dp))

    Box(
      modifier = Modifier
        .clip(RoundedCornerShape(3.dp))
        .background(Color(0xE618181B))
        .border(1.dp, pinColor, RoundedCornerShape(3.dp))
        .padding(horizontal = 4.dp, vertical = 1.dp)
    ) {
      Text(
        text = title,
        fontSize = 8.sp,
        fontWeight = FontWeight.Bold,
        fontFamily = FontFamily.Monospace,
        color = pinColor
      )
    }
  }
}
