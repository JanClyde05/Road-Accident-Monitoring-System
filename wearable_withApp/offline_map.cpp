/*
 * Road Accident Monitoring System — Offline Map Implementation
 * ==============================================================
 * Serves a self-contained HTML page with an embedded map image and
 * a GPS pin that moves via WebSocket updates.
 *
 * The map image is a pre-captured satellite/map screenshot stored as
 * a PROGMEM byte array in map_image.h. It's embedded into the HTML
 * as a base64 data URI so the page is completely self-contained with
 * zero external dependencies.
 *
 * GPS-to-pixel math: linear interpolation between known GPS bounds
 * (the lat/lon of the four image corners) and pixel coordinates.
 * This is approximate but sufficient for a small local area.
 */

#include "offline_map.h"
#include "config.h"
#include "map_image.h"

// ── Map Bounds ──────────────────────────────────────────────────────────────
// Default to Tuguegarao City area — replace with your actual map image bounds.

static float _topLat    = 17.625f;
static float _bottomLat = 17.600f;
static float _leftLon   = 121.715f;
static float _rightLon  = 121.740f;
static int   _imgWidth  = 800;
static int   _imgHeight = 600;

void offlineMapSetBounds(float topLat, float leftLon, float bottomLat, float rightLon,
                         int imageWidth, int imageHeight) {
  _topLat = topLat;
  _bottomLat = bottomLat;
  _leftLon = leftLon;
  _rightLon = rightLon;
  _imgWidth = imageWidth;
  _imgHeight = imageHeight;
}

bool offlineMapGPSToPixel(float lat, float lon, int& pixelX, int& pixelY) {
  // Linear interpolation from GPS coordinates to pixel coordinates.
  // This assumes a Mercator-like projection which is reasonable for
  // small areas (a few km) where the Earth's curvature is negligible.

  if (lat > _topLat || lat < _bottomLat || lon < _leftLon || lon > _rightLon) {
    return false;  // Out of bounds
  }

  float latRange = _topLat - _bottomLat;
  float lonRange = _rightLon - _leftLon;

  // Latitude decreases as pixel Y increases (top of image = highest latitude)
  pixelY = (int)((_topLat - lat) / latRange * _imgHeight);
  pixelX = (int)((lon - _leftLon) / lonRange * _imgWidth);

  // Clamp to image bounds
  pixelX = constrain(pixelX, 0, _imgWidth - 1);
  pixelY = constrain(pixelY, 0, _imgHeight - 1);

  return true;
}

String offlineMapGetHTML() {
  // Build the HTML page with embedded map image and WebSocket GPS client.
  // The map image from map_image.h is included as a base64 data URI.

  String html = F(R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
  <title>RAMS — Offline Map</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
      background: #09090b; color: #f4f4f5;
      overflow: hidden; height: 100vh;
    }
    .header {
      position: fixed; top: 0; left: 0; right: 0; z-index: 10;
      background: rgba(18, 18, 20, 0.95); backdrop-filter: blur(12px);
      padding: 10px 16px; display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid #27272a;
    }
    .header-brand { display: flex; align-items: center; gap: 10px; }
    .brand-logo { width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #52525b; object-fit: cover; background: #000; padding: 1px; clip-path: circle(50% at 50% 50%); -webkit-clip-path: circle(50% at 50% 50%); }
    .header h1 { font-size: 14px; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase; color: #ffffff; }
    .gps-info { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #8890b0; text-transform: uppercase; }
    .gps-info.has-fix { color: #34d97f; }
    .map-container {
      position: absolute; top: 52px; left: 0; right: 0; bottom: 0;
      overflow: auto; -webkit-overflow-scrolling: touch;
    }
    .map-wrapper { position: relative; display: inline-block; }
    .map-wrapper img { display: block; max-width: none; }
    .pin {
      position: absolute; width: 24px; height: 24px;
      transform: translate(-50%, -100%);
      transition: left 0.5s ease, top 0.5s ease;
      z-index: 5; pointer-events: none;
    }
    .pin-dot {
      width: 14px; height: 14px; background: #ff4057;
      border: 3px solid #fff; border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 64, 87, 0.6);
      position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
    }
    .pin-pulse {
      position: absolute; bottom: -3px; left: 50%; transform: translateX(-50%);
      width: 20px; height: 20px; background: rgba(255, 64, 87, 0.3);
      border-radius: 50%; animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: translateX(-50%) scale(1); opacity: 1; }
      100% { transform: translateX(-50%) scale(3); opacity: 0; }
    }
    .no-fix {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      text-align: center; color: #5c6480; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; text-transform: uppercase;
    }
    .nav-bar {
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
      z-index: 10; display: flex; gap: 8px; background: rgba(18, 18, 20, 0.95);
      padding: 6px 12px; border-radius: 12px; font-family: 'JetBrains Mono', monospace;
      border: 1px solid #27272a; backdrop-filter: blur(8px);
    }
    .nav-bar a {
      color: #f4f4f5; font-size: 11px; font-weight: 700; text-decoration: none; text-transform: uppercase;
      padding: 6px 12px; border-radius: 8px; background: #18181b; border: 1px solid #27272a; transition: border-color .15s;
    }
    .nav-bar a:hover { border-color: #ffffff; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-brand">
      <img src="/logo.jpg" class="brand-logo" alt="RAMS Logo">
      <h1>Offline GPS Map</h1>
    </div>
    <span class="gps-info" id="gpsInfo">Waiting for GPS...</span>
  </div>

  <div class="map-container">
    <div class="map-wrapper" id="mapWrapper">
      <img id="mapImg" alt="Local area map">
      <div class="pin" id="pin" style="display:none;">
        <div class="pin-pulse"></div>
        <div class="pin-dot"></div>
      </div>
    </div>
    <div class="no-fix" id="noFix">Acquiring GPS fix...<br>Move to an open area for better reception.</div>
  </div>

  <div class="nav-bar">
    <a href="/">Registration</a>
    <a href="/telemetry">Telemetry</a>
  </div>

  <script>
    // Map bounds — must match the firmware's offlineMapSetBounds() values
    var MAP_TOP_LAT    = )rawliteral");

  html += String(_topLat, 6);
  html += F(R"rawliteral(;
    var MAP_BOTTOM_LAT = )rawliteral");
  html += String(_bottomLat, 6);
  html += F(R"rawliteral(;
    var MAP_LEFT_LON   = )rawliteral");
  html += String(_leftLon, 6);
  html += F(R"rawliteral(;
    var MAP_RIGHT_LON  = )rawliteral");
  html += String(_rightLon, 6);
  html += F(R"rawliteral(;

    // Set map image — placeholder gray gradient if no real image available
    var mapImg = document.getElementById('mapImg');
    var mapData = ')rawliteral");

  // Embed map image as base64 — for now use a placeholder
  // In production, map_image.h provides MAP_IMAGE_DATA and MAP_IMAGE_SIZE
  // which would be base64-encoded and inserted here.
  // For the placeholder, we generate a simple SVG map.
  html += F("data:image/svg+xml;base64,");
  // Base64 of a simple SVG grid placeholder
  html += F("PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExZTNlIi8+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMDAsMTIwLDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48dGV4dCB4PSI0MDAiIHk9IjMwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0icmdiYSgxMDAsMTIwLDI1NSwwLjMpIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+UmVwbGFjZSB3aXRoIGxvY2FsIGFyZWEgbWFwIGltYWdlPC90ZXh0Pjwvc3ZnPg==");

  html += F(R"rawliteral(';
    mapImg.src = mapData;
    mapImg.onload = function() {
      document.getElementById('mapWrapper').style.width = this.naturalWidth + 'px';
    };

    function gpsToPixel(lat, lon) {
      var img = document.getElementById('mapImg');
      var w = img.naturalWidth || 800;
      var h = img.naturalHeight || 600;
      var latRange = MAP_TOP_LAT - MAP_BOTTOM_LAT;
      var lonRange = MAP_RIGHT_LON - MAP_LEFT_LON;
      var x = (lon - MAP_LEFT_LON) / lonRange * w;
      var y = (MAP_TOP_LAT - lat) / latRange * h;
      return { x: Math.max(0, Math.min(w, x)), y: Math.max(0, Math.min(h, y)) };
    }

    var ws;
    function connectWS() {
      ws = new WebSocket('ws://' + location.hostname + ':81/');
      ws.onclose = function() { setTimeout(connectWS, 2000); };
      ws.onmessage = function(e) {
        try {
          var msg = JSON.parse(e.data);
          if (msg.type === 'gps') {
            var info = document.getElementById('gpsInfo');
            info.textContent = msg.fix
              ? msg.lat.toFixed(6) + ', ' + msg.lon.toFixed(6) + ' (' + msg.sats + ' sats)'
              : 'No fix (' + msg.sats + ' sats)';
            info.className = msg.fix ? 'gps-info has-fix' : 'gps-info';

            if (msg.fix && msg.lat !== 0) {
              var pin = document.getElementById('pin');
              var noFix = document.getElementById('noFix');
              var pos = gpsToPixel(msg.lat, msg.lon);
              pin.style.left = pos.x + 'px';
              pin.style.top = pos.y + 'px';
              pin.style.display = 'block';
              noFix.style.display = 'none';
            }
          }
        } catch(ex) {}
      };
    }
    connectWS();
  </script>
</body>
</html>
)rawliteral");

  return html;
}
