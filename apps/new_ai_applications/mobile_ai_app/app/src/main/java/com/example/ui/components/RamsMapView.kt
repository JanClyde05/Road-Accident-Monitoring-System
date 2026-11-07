package com.example.ui.components

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
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
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.material.icons.filled.GpsFixed
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.NearMe
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
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
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.model.GpsData
import com.example.model.ImuData
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

private fun isDeviceOnline(context: Context): Boolean {
  val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
  val net = cm.activeNetwork ?: return false
  val caps = cm.getNetworkCapabilities(net) ?: return false
  return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun RamsMapView(
  gps: GpsData,
  imu: ImuData = ImuData(),
  events: List<IncidentEvent>,
  selectedEvent: IncidentEvent?,
  onSelectEvent: (IncidentEvent) -> Unit,
  riderProfile: RiderProfile? = null,
  onOpenLoginDialog: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  val showNearby = riderProfile?.showNearbyIncidents ?: false
  var isOfflineMode by remember { mutableStateOf(!isDeviceOnline(context)) }
  var webViewRef by remember { mutableStateOf<WebView?>(null) }

  // Prioritize real-time IMU compass orientation, fallback to GPS heading
  val heading = if (imu.yawDegrees != 0f) imu.yawDegrees else gps.headingDegrees

  // Radar pulse animation for offline vector fallback
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

  // Update Leaflet WebView when GPS coordinates, showNearby, or events change
  LaunchedEffect(gps.latitude, gps.longitude, showNearby, events, isOfflineMode) {
    if (!isOfflineMode && webViewRef != null) {
      val lat = if (gps.hasFix) gps.latitude else 17.6132
      val lon = if (gps.hasFix) gps.longitude else 121.7270
      val jsPos = "if(window.updateUserPos){ window.updateUserPos($lat, $lon, $heading, $showNearby); }"
      webViewRef?.evaluateJavascript(jsPos, null)

      val nearbyJsonArray = if (showNearby) {
        events.filter { it.type == IncidentType.ALERT }.joinToString(separator = ",", prefix = "[", postfix = "]") { e ->
          """{"lat":${e.lat},"lon":${e.lon},"title":"${e.title}","token":"${e.deviceToken}"}"""
        }
      } else {
        "[]"
      }
      val jsIncidents = "if(window.setNearbyIncidents){ window.setNearbyIncidents($nearbyJsonArray); }"
      webViewRef?.evaluateJavascript(jsIncidents, null)
    }
  }

  // Update direction beam in real-time when phone rotates
  LaunchedEffect(heading, isOfflineMode) {
    if (!isOfflineMode && webViewRef != null) {
      val jsHdg = "if(window.updateUserHeading){ window.updateUserHeading($heading); }"
      webViewRef?.evaluateJavascript(jsHdg, null)
    }
  }

  Surface(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(8.dp))
      .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
      .testTag("rams_map_view"),
    color = MaterialTheme.colorScheme.surface
  ) {
    Column(modifier = Modifier.fillMaxWidth()) {
      // Map Canvas / WebView Box
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(260.dp)
      ) {
        if (!isOfflineMode) {
          // 1. Live Leaflet Map with Dark Matter Tiles & Direction Beam
          AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
              WebView(ctx).apply {
                webViewRef = this
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = true
                settings.allowContentAccess = true
                settings.cacheMode = WebSettings.LOAD_DEFAULT
                settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                @Suppress("DEPRECATION")
                settings.allowFileAccessFromFileURLs = true
                @Suppress("DEPRECATION")
                settings.allowUniversalAccessFromFileURLs = true
                setBackgroundColor(0xFF09090B.toInt())

                webChromeClient = object : WebChromeClient() {
                  override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    Log.i("RamsMapView", "JS [${consoleMessage?.messageLevel()}]: ${consoleMessage?.message()} (${consoleMessage?.lineNumber()})")
                    return true
                  }
                }

                webViewClient = object : WebViewClient() {
                  override fun onPageFinished(view: WebView?, url: String?) {
                    val initialLat = if (gps.hasFix) gps.latitude else 17.6132
                    val initialLon = if (gps.hasFix) gps.longitude else 121.7270
                    val initialHdg = heading
                    val nearbyJsonArray = if (showNearby) {
                      events.filter { it.type == IncidentType.ALERT }.joinToString(separator = ",", prefix = "[", postfix = "]") { e ->
                        """{"lat":${e.lat},"lon":${e.lon},"title":"${e.title}","token":"${e.deviceToken}"}"""
                      }
                    } else {
                      "[]"
                    }
                    view?.evaluateJavascript("if(window.initMap){ window.initMap($initialLat, $initialLon, $initialHdg, $showNearby, $nearbyJsonArray); }", null)
                  }
                }

                loadUrl("file:///android_asset/leaflet/map.html")
              }
            }
          )
        } else {
          // 2. High-Contrast Tactical Offline Vector Map (Corridor Network)
          Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height
            val centerX = w / 2f
            val centerY = h / 2f

            // Map canvas background
            drawRect(color = Color(0xFF09090B))

            // Grid lines (8pt spatial alignment)
            val gridSize = 24.dp.toPx()
            var x = 0f
            while (x < w) {
              drawLine(Color(0xFF18181B), Offset(x, 0f), Offset(x, h), strokeWidth = 1f)
              x += gridSize
            }
            var y = 0f
            while (y < h) {
              drawLine(Color(0xFF18181B), Offset(0f, y), Offset(w, y), strokeWidth = 1f)
              y += gridSize
            }

            // Cagayan River Blue Ribbon
            val riverPath = Path().apply {
              moveTo(0f, h * 0.75f)
              cubicTo(w * 0.35f, h * 0.70f, w * 0.45f, h * 0.90f, w, h * 0.65f)
            }
            drawPath(path = riverPath, color = Color(0xFF1E3A8A).copy(alpha = 0.5f), style = Stroke(width = 16.dp.toPx(), cap = StrokeCap.Round))
            drawPath(path = riverPath, color = Color(0xFF3B82F6).copy(alpha = 0.8f), style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round))

            // Maharlika Highway Corridor (AH26)
            val highwayPath = Path().apply {
              moveTo(w * 0.15f, 0f)
              cubicTo(w * 0.25f, h * 0.45f, w * 0.65f, h * 0.55f, w * 0.85f, h)
            }
            drawPath(path = highwayPath, color = Color(0xFF27272A), style = Stroke(width = 12.dp.toPx(), cap = StrokeCap.Round))
            drawPath(path = highwayPath, color = Color(0xFFE4E4E7), style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round))

            // Caritan Norte Cross Street
            drawLine(Color(0xFF3F3F46), Offset(0f, centerY), Offset(w, centerY), strokeWidth = 5.dp.toPx())

            // Google Maps-style Direction Beam in Offline Vector Mode
            if (gps.hasFix) {
              rotate(degrees = heading, pivot = Offset(centerX, centerY)) {
                val beamPath = Path().apply {
                  moveTo(centerX, centerY)
                  val rad1 = Math.toRadians(-30.0)
                  val rad2 = Math.toRadians(30.0)
                  val r = 52.dp.toPx()
                  lineTo(centerX + (r * sin(rad1)).toFloat(), centerY - (r * cos(rad1)).toFloat())
                  lineTo(centerX + (r * sin(rad2)).toFloat(), centerY - (r * cos(rad2)).toFloat())
                  close()
                }
                drawPath(path = beamPath, color = RamsSyncBlue.copy(alpha = 0.35f))
              }

              // Pulsing Radar Ring
              drawCircle(
                color = RamsSyncBlue.copy(alpha = pulseAlpha),
                radius = pulseRadius.dp.toPx(),
                center = Offset(centerX, centerY),
                style = Stroke(width = 1.5.dp.toPx())
              )

              // Main User Pin Center Disc
              drawCircle(color = RamsSyncBlue, radius = 9.dp.toPx(), center = Offset(centerX, centerY))
              drawCircle(color = Color.White, radius = 4.dp.toPx(), center = Offset(centerX, centerY))
            }
          }
        }

        // Top Status Header Overlay
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          // Sector / Mode Badge
          Surface(
            shape = RoundedCornerShape(4.dp),
            color = Color(0xEE18181B),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(5.dp)
            ) {
              Box(
                modifier = Modifier
                  .size(6.dp)
                  .background(if (gps.hasFix) RamsSuccessEmerald else RamsWarningAmber, CircleShape)
              )
              Text(
                text = if (gps.hasFix) "LIVE GPS TRACKING" else "ACQUIRING SATELLITES",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp,
                color = Color.White
              )
            }
          }

          // Controls on Right: Recenter only (vector map toggle removed)
          Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {

            // Recenter Button
            Box(
              modifier = Modifier
                .size(28.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Color(0xE618181B))
                .border(1.dp, Color(0xFF27272A), RoundedCornerShape(4.dp))
                .clickable {
                  if (webViewRef != null && !isOfflineMode) {
                    val lat = if (gps.hasFix) gps.latitude else 17.6132
                    val lon = if (gps.hasFix) gps.longitude else 121.7270
                    webViewRef?.evaluateJavascript("if(window.recenterMap){ window.recenterMap($lat, $lon); }", null)
                  }
                },
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Default.GpsFixed,
                contentDescription = "Recenter",
                tint = RamsSyncBlue,
                modifier = Modifier.size(15.dp)
              )
            }
          }
        }

        // Bottom Left Coordinates HUD on Map
        Surface(
          modifier = Modifier
            .align(Alignment.BottomStart)
            .padding(8.dp),
          shape = RoundedCornerShape(4.dp),
          color = Color(0xE609090B),
          border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            Text(
              text = if (gps.hasFix) {
                String.format(Locale.US, "%.5f, %.5f • HDG %03.0f°", gps.latitude, gps.longitude, heading)
              } else {
                String.format(Locale.US, "ACQUIRING FIX • HDG %03.0f°", heading)
              },
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = if (gps.hasFix) RamsSuccessEmerald else RamsWarningAmber
            )
          }
        }
      }

      // Live Map Rescuer Pindown & Dispatch Bar (Clean 2-Row Layout, Zero Netlify Mentions)
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .background(MaterialTheme.colorScheme.surfaceVariant)
          .border(1.dp, MaterialTheme.colorScheme.outline)
          .padding(horizontal = 14.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        // Row 1: Dispatch Radar ID & Subtitle
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .clickable { onOpenLoginDialog() },
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(
                text = "DISPATCH RADAR ID:",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = riderProfile?.token?.ifBlank { "NO TOKEN" } ?: "NO TOKEN",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Black,
                fontSize = 11.sp,
                color = RamsSyncBlue
              )
            }
            Text(
              text = "Autonomous Rescue Dispatch Network Tracking",
              fontFamily = FontFamily.Monospace,
              fontSize = 8.5.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }

        // Row 2: Two Full-Height Action Buttons
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          // Open in Google Maps
          Button(
            onClick = {
              if (gps.hasFix) {
                val geoUri = Uri.parse("geo:${gps.latitude},${gps.longitude}?q=${gps.latitude},${gps.longitude}(RAMS+Emergency+Beacon)")
                val mapIntent = Intent(Intent.ACTION_VIEW, geoUri)
                try {
                  context.startActivity(mapIntent)
                } catch (_: Exception) {
                  val webUri = Uri.parse(riderProfile?.getGoogleMapsUrl(gps.latitude, gps.longitude) ?: "https://maps.google.com/?q=${gps.latitude},${gps.longitude}")
                  context.startActivity(Intent(Intent.ACTION_VIEW, webUri))
                }
              } else {
                Toast.makeText(context, "Cannot navigate: Standby for GPS satellite fix", Toast.LENGTH_SHORT).show()
              }
            },
            colors = ButtonDefaults.buttonColors(
              containerColor = if (gps.hasFix) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
            ),
            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 0.dp),
            modifier = Modifier
              .weight(1f)
              .height(38.dp),
            shape = RoundedCornerShape(6.dp)
          ) {
            Icon(Icons.Default.NearMe, contentDescription = null, modifier = Modifier.size(13.dp))
            Spacer(modifier = Modifier.width(5.dp))
            Text(
              text = "NAVIGATE",
              fontFamily = FontFamily.Monospace,
              fontSize = 9.5.sp,
              fontWeight = FontWeight.Bold,
              maxLines = 1,
              softWrap = false
            )
          }

          // Dispatch Radar button removed — not user-facing
        }
      }
    }
  }
}
