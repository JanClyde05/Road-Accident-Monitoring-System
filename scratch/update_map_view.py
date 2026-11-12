import sys

file_path = "apps/android_app/app/src/main/java/com/example/ui/components/RamsMapView.kt"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add import if needed
if "import androidx.compose.material.icons.filled.Explore" not in content:
    content = content.replace("import androidx.compose.material.icons.filled.GpsFixed", "import androidx.compose.material.icons.filled.Explore\nimport androidx.compose.material.icons.filled.GpsFixed")

# Add isBeamFacingTop state
target_state = "  var webViewRef by remember { mutableStateOf<WebView?>(null) }"
replacement_state = """  var webViewRef by remember { mutableStateOf<WebView?>(null) }
  var isBeamFacingTop by remember { mutableStateOf(true) }"""

content = content.replace(target_state, replacement_state)

# Add LaunchedEffect for isBeamFacingTop
target_effect = """  // Update direction beam in real-time when phone rotates
  LaunchedEffect(heading, isOfflineMode) {
    if (!isOfflineMode && webViewRef != null) {
      val jsHdg = "if(window.updateUserHeading){ window.updateUserHeading($heading); }"
      webViewRef?.evaluateJavascript(jsHdg, null)
    }
  }"""

replacement_effect = """  // Sync beam mode (Forward / Top of Phone vs Compass) with Leaflet
  LaunchedEffect(isBeamFacingTop, isOfflineMode) {
    if (!isOfflineMode && webViewRef != null) {
      val modeStr = if (isBeamFacingTop) "forward" else "compass"
      webViewRef?.evaluateJavascript("if(window.setBeamMode){ window.setBeamMode('$modeStr'); }", null)
    }
  }

  // Update direction beam in real-time when phone rotates
  LaunchedEffect(heading, isOfflineMode) {
    if (!isOfflineMode && webViewRef != null) {
      val jsHdg = "if(window.updateUserHeading){ window.updateUserHeading($heading); }"
      webViewRef?.evaluateJavascript(jsHdg, null)
    }
  }"""

content = content.replace(target_effect, replacement_effect)

# In onPageFinished, set beam mode
target_page_finished = """                    val nearbyJsonArray = filterActiveAccidentsJson(events, showNearby)
                    view?.evaluateJavascript("if(window.initMap){ window.initMap($initialLat, $initialLon, $initialHdg, $showNearby, $nearbyJsonArray); }", null)"""

replacement_page_finished = """                    val nearbyJsonArray = filterActiveAccidentsJson(events, showNearby)
                    val modeStr = if (isBeamFacingTop) "forward" else "compass"
                    view?.evaluateJavascript("if(window.initMap){ window.initMap($initialLat, $initialLon, $initialHdg, $showNearby, $nearbyJsonArray); if(window.setBeamMode){ window.setBeamMode('$modeStr'); } }", null)"""

content = content.replace(target_page_finished, replacement_page_finished)

# In Canvas offline mode, rotate by 0f if isBeamFacingTop
target_canvas_rotate = "              rotate(degrees = heading, pivot = Offset(centerX, centerY)) {"
replacement_canvas_rotate = "              val beamRotation = if (isBeamFacingTop) 0f else heading\n              rotate(degrees = beamRotation, pivot = Offset(centerX, centerY)) {"

content = content.replace(target_canvas_rotate, replacement_canvas_rotate)

# Add Beam Alignment toggle button next to Recenter button
target_recenter_box = """          // Controls on Right: Recenter only (vector map toggle removed)
          Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {

            // Recenter Button"""

replacement_recenter_box = """          // Controls on Right: Beam Mode & Recenter Buttons
          Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {

            // Beam Alignment Toggle Button (Forward/Top of Phone vs Compass)
            Box(
              modifier = Modifier
                .size(28.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Color(0xE618181B))
                .border(1.dp, if (isBeamFacingTop) RamsSyncBlue else Color(0xFF27272A), RoundedCornerShape(4.dp))
                .clickable {
                  isBeamFacingTop = !isBeamFacingTop
                },
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Default.Explore,
                contentDescription = "Beam Mode",
                tint = if (isBeamFacingTop) RamsSyncBlue else Color(0xFFA1A1AA),
                modifier = Modifier.size(15.dp)
              )
            }

            // Recenter Button"""

content = content.replace(target_recenter_box, replacement_recenter_box)

# Update Bottom Left Coordinates HUD on Map
target_hud = """            Text(
              text = if (gps.hasFix) {
                String.format(Locale.US, "%.5f, %.5f • HDG %03.0f°", gps.latitude, gps.longitude, heading)
              } else {
                String.format(Locale.US, "ACQUIRING FIX • HDG %03.0f°", heading)
              },
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = if (gps.hasFix) RamsSuccessEmerald else RamsWarningAmber
            )"""

replacement_hud = """            val beamLabel = if (isBeamFacingTop) "BEAM: FORWARD (TOP)" else String.format(Locale.US, "HDG %03.0f°", heading)
            Text(
              text = if (gps.hasFix) {
                String.format(Locale.US, "%.5f, %.5f • %s", gps.latitude, gps.longitude, beamLabel)
              } else {
                String.format(Locale.US, "ACQUIRING FIX • %s", beamLabel)
              },
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = if (gps.hasFix) RamsSuccessEmerald else RamsWarningAmber
            )"""

content = content.replace(target_hud, replacement_hud)

with open(file_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("Updated RamsMapView.kt successfully.")

