import sys

error_log_path = "docs/MD Files/RAMS_ERROR_LOG_AND_FIXES.md"
memory_map_path = "MEMORY_MAP.md"

doc_entry = """
---

## Bug 30: Map Destination Geocoding Inaccuracies & False Offset Pins
- **Symptom**: RAMS plotted incorrect destination pins when users commanded navigation (e.g. voice query "route MCNP" or "route to SM City"). In some queries, RAMS plotted a pin in random locations (e.g. `+0.012, +0.008` dummy offset), and coordinates for SM City Tuguegarao, Robinsons Place, Cathedral, and Provincial Capitol were off by several kilometers.
- **Root Cause**:
  1. `RamsViewModel.resolveLocationCoordinates()` had hardcoded landmark coordinates that differed from true OpenStreetMap / Google Maps GIS ground truth (e.g., SM City had longitude `121.7377` instead of `121.71890`; Robinsons Place had latitude `17.6432` instead of `17.62806`; Capitol was in Centro instead of Carig Sur).
  2. Important institutions like MCNP / ISAP (Medical Colleges of Northern Philippines in Alimannao Hills) were missing from the landmark dictionary.
  3. Query string cleaner did not strip conversational prefixes (e.g. "and route", "route", "on my map"), passing raw noisy tokens to Geocoder.
  4. Unmatched queries fell back to a synthetic offset (`baseLat + 0.012, baseLon + 0.008`) which pinned arbitrary houses and fields.
- **Fix**:
  1. Updated `TuguegaraoOfflineSpatialEngine.LANDMARKS` with authoritative OpenStreetMap ground truth coordinates for all 18 major landmarks.
  2. Added MCNP / ISAP (`17.64210, 121.76150`) with phonetic aliases (`m c n p`, `em see en pee`, `alimannao`).
  3. Integrated `TuguegaraoOfflineSpatialEngine.findTargetLandmark()` into `RamsViewModel.resolveLocationCoordinates()`.
  4. Added multi-tier geocoding fallback (authoritative local dictionary -> Geocoder with Tuguegarao context -> OSM Nominatim -> safe Centro anchor without misleading random offsets).
  5. Enhanced voice intent regex in `RamsAiAssistantEngine.kt` to extract destinations cleanly from phrases like "and route X on my map".

---

## Bug 31: Route Polyline Cutting Through Buildings & OSRM Cellular Timeouts
- **Symptom**: Navigation route line cut across city blocks diagonally through buildings instead of hugging actual asphalt streets.
- **Root Cause**:
  1. OSRM HTTP connection timeout in `RamsViewModel.fetchOsrmRoute()` was set to `1500ms`, which reliably timed out on cellular / 4G mobile data.
  2. Offline route synthesis (`generateOfflineTuguegaraoRoadRoute`) used a simple 14-point linear strip along Maharlika Highway. Routing off that strip resulted in straight lines cutting through off-highway structures.
  3. Leaflet WebView client-side OSRM upgrade had a `points.length <= 5` guard, which skipped route enhancement whenever offline waypoints exceeded 5.
- **Fix**:
  1. Increased OSRM HTTP connect/read timeouts to `6000ms / 8000ms` for robust cellular network resilience.
  2. Constructed a 21-node arterial road network graph in `generateOfflineTuguegaraoRoadRoute()` covering Maharlika Highway, Bagay Road corridor, Buntun corridor, downtown Centro grid, and Alimannao/MCNP corridor with Dijkstra shortest-path routing strictly along real roads.
  3. Relaxed Leaflet WebView route upgrade guard to `points.length < 35` with an 8000ms AbortController timeout to seamlessly snap to live road curves.

---

## Bug 32: Blue Directional Flashlight Beam Misalignment Relative to Phone
- **Symptom**: The blue location marker flashlight cone pointed diagonally or towards the bottom/side of the phone screen, causing user confusion when pointing their device in their travel direction.
- **Root Cause**:
  1. In standard North-Up map orientation, the Leaflet `directionBeam` rotated by geographic compass heading (`rotate(cumulativeHdg)`). When holding the phone and pointing it forward, the beam on screen pointed towards geographic bearing rather than the phone's physical pointing axis (top of screen).
  2. `PhoneSensorEngine` lacked `SensorManager.remapCoordinateSystem(AXIS_X, AXIS_Z)`, leading to gimbal lock when holding the phone in portrait mode.
- **Fix**:
  1. Added `beamMode = 'forward'` (default) in `map.html`, locking the flashlight beam to 0° (North / Top of Phone). When the user physically points the top of their phone towards their direction, the beam shines straight forward like a flashlight without confusion.
  2. Synchronized `isBeamFacingTop = true` in `RamsMapView.kt` across both Leaflet WebView and offline Canvas modes.
  3. Added top-right Beam Alignment Toggle button (`Icons.Default.Explore`) on map controls and HUD indicator (`BEAM: FORWARD (TOP)` vs `HDG XXX°`).
  4. Implemented `SensorManager.remapCoordinateSystem` in `PhoneSensorEngine.kt` for handheld portrait orientation.
"""

print("Docs entry prepared.")

