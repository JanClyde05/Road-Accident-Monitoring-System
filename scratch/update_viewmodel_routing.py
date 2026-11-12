import sys

file_path = "apps/android_app/app/src/main/java/com/example/viewmodel/RamsViewModel.kt"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add needed imports
if "import java.net.URLEncoder" not in content:
    content = content.replace("import java.net.URL", "import java.net.URL\nimport java.net.URLEncoder\nimport org.json.JSONArray")

# Find the section to replace: from "private fun resolveLocationCoordinates" to end of "generateOfflineTuguegaraoRoadRoute"
start_marker = "  private fun resolveLocationCoordinates(query: String): Triple<Double, Double, String> {"
end_marker = "  val gpsState: StateFlow<GpsData> = combine("

idx_start = content.find(start_marker)
idx_end = content.find(end_marker)

if idx_start == -1 or idx_end == -1:
    print(f"Failed to find markers: idx_start={idx_start}, idx_end={idx_end}")
    sys.exit(1)

new_code = '''  private fun resolveLocationCoordinates(query: String): Triple<Double, Double, String> {
    var q = query.lowercase(Locale.US).trim()
    val prefixes = listOf(
      "and route to ", "and route ", "please route to ", "please route ", "route to ", "route ",
      "navigate to ", "navigate ", "directions to ", "direction to ", "take me to ", "show route to ",
      "pin and route to ", "pin to ", "pin ", "go to ", "lead me to ",
      "punta sa ", "punta tayo sa ", "dalhin mo ako sa ", "paano pumunta sa ", "how to go to ",
      "papunta sa ", "papuntang "
    )
    for (p in prefixes) {
      if (q.startsWith(p)) {
        q = q.removePrefix(p).trim()
        break
      }
    }
    val suffixes = listOf(
      " on my map", " on the map", " on my phone", " on map", " on the app",
      " please", " sa mapa", " sa phone", " sa app"
    )
    for (s in suffixes) {
      if (q.endsWith(s)) {
        q = q.removeSuffix(s).trim()
        break
      }
    }
    q = com.example.ai.TuguegaraoOfflineSpatialEngine.normalizeLocalPhonetics(q)

    // 1. Authoritative Tuguegarao Offline Landmark Dictionary (SM City, MCNP, Robinsons, etc.)
    val landmark = com.example.ai.TuguegaraoOfflineSpatialEngine.findTargetLandmark(q)
    if (landmark != null) {
      android.util.Log.i("RAMS_Route", "Resolved landmark via TuguegaraoOfflineSpatialEngine: ${landmark.name} (${landmark.lat}, ${landmark.lon})")
      return Triple(landmark.lat, landmark.lon, landmark.name)
    }

    // 2. Android System Geocoder with Tuguegarao / Cagayan Context
    val candidateQueries = listOf(
      "$q, Tuguegarao City, Cagayan, Philippines",
      "$q, Tuguegarao, Cagayan",
      q
    )
    for (cand in candidateQueries) {
      try {
        val geocoder = Geocoder(getApplication<Application>().applicationContext, Locale.US)
        @Suppress("DEPRECATION")
        val addresses = geocoder.getFromLocationName(cand, 1)
        if (!addresses.isNullOrEmpty()) {
          val addr = addresses[0]
          val name = addr.featureName ?: q.replaceFirstChar { it.uppercase() }
          android.util.Log.i("RAMS_Route", "Resolved address via Geocoder: $name (${addr.latitude}, ${addr.longitude})")
          return Triple(addr.latitude, addr.longitude, name)
        }
      } catch (_: Exception) {}
    }

    // 3. Online OpenStreetMap Nominatim Fallback (Strictly road/place geocoding)
    try {
      val encodedQ = URLEncoder.encode("$q, Tuguegarao, Cagayan", "UTF-8")
      val nomUrl = "https://nominatim.openstreetmap.org/search?q=$encodedQ&format=json&limit=1"
      val conn = URL(nomUrl).openConnection() as HttpURLConnection
      conn.connectTimeout = 4000
      conn.readTimeout = 4000
      conn.setRequestProperty("User-Agent", "RAMS-Road-Safety-Assistant/2.5 (Android)")
      if (conn.responseCode == 200) {
        val res = conn.inputStream.bufferedReader().use { it.readText() }
        val arr = JSONArray(res)
        if (arr.length() > 0) {
          val item = arr.getJSONObject(0)
          val lat = item.getDouble("lat")
          val lon = item.getDouble("lon")
          val name = item.optString("name", q.replaceFirstChar { it.uppercase() })
          android.util.Log.i("RAMS_Route", "Resolved address via OSM Nominatim: $name ($lat, $lon)")
          return Triple(lat, lon, name)
        }
      }
    } catch (_: Exception) {}

    // Fallback: If not found, use Tuguegarao Centro without misleading random offset
    val defaultLat = 17.6132
    val defaultLon = 121.7270
    val label = q.replaceFirstChar { it.uppercase() }
    android.util.Log.w("RAMS_Route", "Location '$q' not matched in dictionary; defaulting to Centro Tuguegarao")
    return Triple(defaultLat, defaultLon, "$label (Centro)")
  }

  private fun fetchOsrmRoute(userLat: Double, userLon: Double, destLat: Double, destLon: Double, label: String): DestinationRoute {
    val endpoints = listOf(
      String.format(Locale.US, "https://router.project-osrm.org/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=full&geometries=geojson", userLon, userLat, destLon, destLat),
      String.format(Locale.US, "https://routing.openstreetmap.de/routed-car/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=full&geometries=geojson", userLon, userLat, destLon, destLat)
    )

    for (urlStr in endpoints) {
      try {
        val conn = URL(urlStr).openConnection() as HttpURLConnection
        conn.connectTimeout = 6000
        conn.readTimeout = 8000
        conn.requestMethod = "GET"
        conn.setRequestProperty("User-Agent", "RAMS-Road-Safety-Assistant/2.5 (Android; DOST-ASTI)")
        conn.setRequestProperty("Accept", "application/json")
        if (conn.responseCode == 200) {
          val jsonStr = conn.inputStream.bufferedReader().use { it.readText() }
          val root = JSONObject(jsonStr)
          val routes = root.optJSONArray("routes")
          if (routes != null && routes.length() > 0) {
            val first = routes.getJSONObject(0)
            val distMeters = first.optDouble("distance", 0.0).toFloat()
            val durationSec = first.optDouble("duration", 0.0).toFloat()
            val geom = first.optJSONObject("geometry")
            val coords = geom?.optJSONArray("coordinates")
            if (coords != null && coords.length() > 0) {
              val polylinePoints = StringBuilder("[")
              for (i in 0 until coords.length()) {
                val pt = coords.getJSONArray(i)
                val lon = pt.getDouble(0)
                val lat = pt.getDouble(1)
                if (i > 0) polylinePoints.append(",")
                polylinePoints.append(String.format(Locale.US, "[%.6f,%.6f]", lat, lon))
              }
              polylinePoints.append("]")
              android.util.Log.i("RAMS_Route", "Resolved ${coords.length()} turn-by-turn road waypoints (${distMeters / 1000f} km) via $urlStr")
              return DestinationRoute(
                destinationName = label,
                destLat = destLat,
                destLon = destLon,
                waypointsJson = polylinePoints.toString(),
                distanceKm = distMeters / 1000f,
                durationMin = durationSec / 60f
              )
            }
          }
        }
      } catch (e: Exception) {
        android.util.Log.w("RAMS_Route", "OSRM request failed ($urlStr): ${e.message}")
      }
    }

    // Offline Tuguegarao arterial road network graph (Dijkstra-routed strictly along streets and highways)
    return generateOfflineTuguegaraoRoadRoute(userLat, userLon, destLat, destLon, label)
  }

  private fun generateOfflineTuguegaraoRoadRoute(userLat: Double, userLon: Double, destLat: Double, destLon: Double, label: String): DestinationRoute {
    val roadNodes = mapOf(
      "csucarig" to Pair(17.65905, 121.75318),
      "carignorte_jct" to Pair(17.65350, 121.74850),
      "cvmc_jct" to Pair(17.65661, 121.74702),
      "caggay_jct" to Pair(17.64500, 121.75000),
      "capitol_jct" to Pair(17.64848, 121.76037),
      "mcnp_jct" to Pair(17.64210, 121.76150),
      "airport_jct" to Pair(17.63800, 121.74100),
      "airport_term" to Pair(17.64374, 121.73407),
      "pengueruyu_jct" to Pair(17.63200, 121.73950),
      "robinsons_tanza" to Pair(17.62806, 121.73350),
      "dondomingo_jct" to Pair(17.62499, 121.73296),
      "smcity_bagay" to Pair(17.62805, 121.71890),
      "caritan_jct" to Pair(17.62200, 121.72200),
      "ucv_balzain" to Pair(17.62402, 121.72871),
      "usl_mabini" to Pair(17.61016, 121.72327),
      "spup_mabini" to Pair(17.61733, 121.72351),
      "smcenter_luna" to Pair(17.61275, 121.72379),
      "cathedral_rizal" to Pair(17.61359, 121.73050),
      "centro_gomez" to Pair(17.61449, 121.72806),
      "buntun_hwy" to Pair(17.61360, 121.70500),
      "buntun_bridge" to Pair(17.61437, 121.68643)
    )

    val roadEdges = listOf(
      Pair("csucarig", "carignorte_jct"),
      Pair("carignorte_jct", "cvmc_jct"),
      Pair("cvmc_jct", "caggay_jct"),
      Pair("caggay_jct", "airport_jct"),
      Pair("airport_jct", "pengueruyu_jct"),
      Pair("pengueruyu_jct", "robinsons_tanza"),
      Pair("robinsons_tanza", "dondomingo_jct"),
      Pair("caggay_jct", "capitol_jct"),
      Pair("capitol_jct", "mcnp_jct"),
      Pair("airport_jct", "airport_term"),
      Pair("carignorte_jct", "smcity_bagay"),
      Pair("smcity_bagay", "caritan_jct"),
      Pair("caritan_jct", "spup_mabini"),
      Pair("dondomingo_jct", "ucv_balzain"),
      Pair("ucv_balzain", "caritan_jct"),
      Pair("dondomingo_jct", "cathedral_rizal"),
      Pair("cathedral_rizal", "centro_gomez"),
      Pair("centro_gomez", "smcenter_luna"),
      Pair("smcenter_luna", "usl_mabini"),
      Pair("smcenter_luna", "spup_mabini"),
      Pair("usl_mabini", "spup_mabini"),
      Pair("spup_mabini", "buntun_hwy"),
      Pair("buntun_hwy", "buntun_bridge")
    )

    fun nodeDist(p1: Pair<Double, Double>, p2: Pair<Double, Double>): Double {
      val dLat = (p2.first - p1.first) * 111.0
      val dLon = (p2.second - p1.second) * 105.0
      return kotlin.math.sqrt(dLat * dLat + dLon * dLon)
    }

    // Build adjacency list
    val adj = mutableMapOf<String, MutableList<Pair<String, Double>>>()
    for (k in roadNodes.keys) adj[k] = mutableListOf()
    for (edge in roadEdges) {
      val p1 = roadNodes[edge.first] ?: continue
      val p2 = roadNodes[edge.second] ?: continue
      val d = nodeDist(p1, p2)
      adj[edge.first]?.add(Pair(edge.second, d))
      adj[edge.second]?.add(Pair(edge.first, d))
    }

    // Find nearest start and end nodes
    val userPt = Pair(userLat, userLon)
    val destPt = Pair(destLat, destLon)
    var startNode = "centro_gomez"
    var minDistStart = Double.MAX_VALUE
    for ((name, pt) in roadNodes) {
      val d = nodeDist(userPt, pt)
      if (d < minDistStart) {
        minDistStart = d
        startNode = name
      }
    }
    var endNode = "centro_gomez"
    var minDistEnd = Double.MAX_VALUE
    for ((name, pt) in roadNodes) {
      val d = nodeDist(destPt, pt)
      if (d < minDistEnd) {
        minDistEnd = d
        endNode = name
      }
    }

    // Dijkstra shortest path
    val distances = mutableMapOf<String, Double>()
    val previous = mutableMapOf<String, String>()
    val unvisited = roadNodes.keys.toMutableSet()
    for (k in roadNodes.keys) distances[k] = Double.MAX_VALUE
    distances[startNode] = 0.0

    while (unvisited.isNotEmpty()) {
      val current = unvisited.minByOrNull { distances[it] ?: Double.MAX_VALUE } ?: break
      if (distances[current] == Double.MAX_VALUE || current == endNode) break
      unvisited.remove(current)

      for ((neighbor, weight) in adj[current] ?: emptyList()) {
        if (neighbor in unvisited) {
          val alt = (distances[current] ?: Double.MAX_VALUE) + weight
          if (alt < (distances[neighbor] ?: Double.MAX_VALUE)) {
            distances[neighbor] = alt
            previous[neighbor] = current
          }
        }
      }
    }

    // Reconstruct path
    val path = mutableListOf<String>()
    var curr: String? = endNode
    while (curr != null) {
      path.add(0, curr)
      curr = previous[curr]
    }
    if (path.isEmpty() || path[0] != startNode) {
      path.clear()
      path.add(startNode)
      if (startNode != endNode) path.add(endNode)
    }

    val waypoints = mutableListOf<Pair<Double, Double>>()
    waypoints.add(userPt)
    for (nodeName in path) {
      roadNodes[nodeName]?.let { waypoints.add(it) }
    }
    waypoints.add(destPt)

    val sb = StringBuilder("[")
    var totalDistKm = 0f
    for (i in waypoints.indices) {
      if (i > 0) {
        sb.append(",")
        val prev = waypoints[i - 1]
        val c = waypoints[i]
        totalDistKm += nodeDist(prev, c).toFloat()
      }
      sb.append(String.format(Locale.US, "[%.6f,%.6f]", waypoints[i].first, waypoints[i].second))
    }
    sb.append("]")

    val estTimeMin = (totalDistKm / 35.0f * 60.0f).coerceAtLeast(1.0f)
    android.util.Log.i("RAMS_Route", "Synthesized Tuguegarao arterial road route: ${path.joinToString(" -> ")} ($totalDistKm km)")
    return DestinationRoute(
      destinationName = label,
      destLat = destLat,
      destLon = destLon,
      waypointsJson = sb.toString(),
      distanceKm = totalDistKm,
      durationMin = estTimeMin
    )
  }

'''

content = content[:idx_start] + new_code + content[idx_end:]

with open(file_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("Updated RamsViewModel.kt routing successfully.")

