/*
 * Road Accident Monitoring System — Local SoftAP Implementation
 * ================================================================
 * Setup-mode WiFi AP + WebSocket + HTTP server.
 *
 * When activated, creates a local WiFi network ("RAMS_Setup") and
 * serves three pages:
 *   /           — Registration form (name + Drive link)
 *   /map        — Offline live map with GPS pin
 *   /telemetry  — Live IMU data, FSM state, GPS + map dashboard
 *
 * WebSocket on port 81 pushes two data types:
 *   {"type":"gps","lat":17.613,"lon":121.727,"sats":6,"fix":true}
 *   {"type":"tel","ax":0.01,"ay":-0.02,"az":1.00,"gx":0.5,"gy":-0.3,"gz":0.1,"am":1.00,"fsm":0}
 *
 * Registration submissions arrive via WebSocket as:
 *   {"type":"register","name":"...","driveLink":"..."}
 *
 * WiFi radio is completely shut down when leaving setup mode.
 */

#include "local_ap.h"
#include "config.h"
#include "registration.h"
#include "offline_map.h"
#include "../shared/logo_data.h"
#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

static WebServer _httpServer(80);
static WebSocketsServer _wsServer(SETUP_WS_PORT);
static bool _active = false;

// ── Registration Page HTML ──────────────────────────────────────────────────
// Inline HTML served from flash — no filesystem dependency for setup mode.

static const char REGISTRATION_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>RAMS — Device Registration</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #060913;
      color: #f4f4f5; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      letter-spacing: -0.01em;
    }
    .card {
      background: #0e1230;
      border: 1px solid #27272a;
      border-radius: 16px; padding: 28px;
      max-width: 440px; width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .brand-header {
      display: flex; align-items: center; justify-content: center;
      gap: 12px; margin-bottom: 6px;
    }
    .brand-logo {
      width: 38px; height: 38px; border-radius: 8px;
      border: 1px solid #3f3f46; object-fit: contain; background: #000; padding: 2px;
    }
    h1 { font-size: 15px; font-weight: 900; letter-spacing: -0.025em; text-transform: uppercase; color: #ffffff; }
    .subtitle { text-align: center; font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #a1a1aa; margin-bottom: 20px; }
    label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #a1a1aa; margin-bottom: 6px; margin-top: 14px; }
    input {
      width: 100%; padding: 11px 14px; font-size: 13px; font-family: 'JetBrains Mono', monospace;
      background: #18181b; border: 1px solid #27272a;
      border-radius: 10px; color: #ffffff; outline: none; transition: border 0.2s;
    }
    input:focus { border-color: #ffffff; }
    .btn {
      display: block; width: 100%; padding: 12px; margin-top: 22px;
      font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; cursor: pointer;
      background: #ffffff; color: #09090b; border: 1px solid #ffffff; border-radius: 10px;
      transition: transform 0.15s, opacity 0.2s;
    }
    .btn:hover { transform: translateY(-1px); background: #e4e4e7; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    #status {
      margin-top: 16px; padding: 10px; border-radius: 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; text-align: center; text-transform: uppercase; display: none;
    }
    .status-ok { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); display: block !important; }
    .status-err { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); display: block !important; }
    .status-loading { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); display: block !important; }
    .nav { text-align: center; margin-top: 20px; font-family: 'JetBrains Mono', monospace; }
    .nav a { color: #f4f4f5; font-size: 11px; font-weight: 700; text-transform: uppercase; text-decoration: none; padding: 6px 12px; border-radius: 8px; border: 1px solid #27272a; background: #18181b; }
    .nav a:hover { border-color: #ffffff; }
    .photo-preview { margin-top: 12px; text-align: center; }
    .photo-preview img {
      max-width: 100px; max-height: 100px; border-radius: 12px;
      border: 1px solid #3f3f46; display: none; margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand-header">
      <img src="data:image/jpeg;base64, )rawliteral" LOGO_DATA R"rawliteral(" id="logoImg" class="brand-logo" alt="RAMS Logo">
      <h1>Road Accident Monitoring</h1>
    </div>
    <p class="subtitle">Wearable Device Registration — Setup Mode</p>

    <label for="name">Rider Full Name</label>
    <input type="text" id="name" placeholder="e.g. Juan Dela Cruz" maxlength="23" required>

    <label for="driveLink">Photo (Google Drive Share Link)</label>
    <input type="url" id="driveLink" placeholder="https://drive.google.com/file/d/.../view?usp=sharing">
    <div class="photo-preview">
      <img id="photoPreview" alt="Photo preview">
    </div>

    <button class="btn" id="registerBtn" onclick="doRegister()">REGISTER DEVICE</button>
    <div id="status"></div>

    <div class="nav"><a href="/map">OFFLINE MAP</a> &nbsp; <a href="/telemetry">LIVE TELEMETRY</a></div>
  </div>

  <script>
    var ws;
    var wsReady = false;

    function connectWS() {
      ws = new WebSocket('ws://' + location.hostname + ':81/');
      ws.onopen = function() { wsReady = true; };
      ws.onclose = function() {
        wsReady = false;
        setTimeout(connectWS, 2000);
      };
      ws.onmessage = function(e) {
        try {
          var msg = JSON.parse(e.data);
          if (msg.type === 'register_result') {
            var st = document.getElementById('status');
            if (msg.success) {
              st.className = 'status-ok';
              st.textContent = 'REGISTERED! TOKEN: ' + msg.token;
              document.getElementById('registerBtn').disabled = true;
            } else {
              st.className = 'status-err';
              st.textContent = 'ERROR: ' + (msg.error || 'Registration failed');
              document.getElementById('registerBtn').disabled = false;
            }
          }
        } catch(ex) {}
      };
    }
    connectWS();

    // Validate the Drive link by trying to load the converted image
    document.getElementById('driveLink').addEventListener('change', function() {
      var link = this.value;
      if (!link) return;
      var img = document.getElementById('photoPreview');
      // Extract file ID client-side for preview
      var fid = '';
      var dIdx = link.indexOf('/d/');
      if (dIdx > -1) {
        var s = dIdx + 3;
        var e = link.indexOf('/', s);
        if (e < 0) e = link.indexOf('?', s);
        if (e < 0) e = link.length;
        fid = link.substring(s, e);
      } else {
        var idIdx = link.indexOf('id=');
        if (idIdx > -1) {
          var s2 = idIdx + 3;
          var e2 = link.indexOf('&', s2);
          if (e2 < 0) e2 = link.length;
          fid = link.substring(s2, e2);
        }
      }
      if (fid) {
        var directUrl = 'https://lh3.googleusercontent.com/d/' + fid;
        img.src = directUrl;
        img.style.display = 'block';
        img.onerror = function() {
          img.style.display = 'none';
          var st = document.getElementById('status');
          st.className = 'status-err';
          st.textContent = 'Photo not accessible. Make sure link sharing is set to "Anyone with the link".';
        };
      }
    });

    function doRegister() {
      var name = document.getElementById('name').value.trim();
      var link = document.getElementById('driveLink').value.trim();
      var st = document.getElementById('status');

      if (!name) { st.className = 'status-err'; st.textContent = 'Name is required.'; return; }
      if (!link) { st.className = 'status-err'; st.textContent = 'Google Drive link is required.'; return; }
      if (!wsReady) { st.className = 'status-err'; st.textContent = 'Not connected. Please wait...'; return; }

      st.className = 'status-loading';
      st.textContent = 'Registering...';
      document.getElementById('registerBtn').disabled = true;

      ws.send(JSON.stringify({ type: 'register', name: name, driveLink: link }));
    }
  </script>
</body>
</html>
)rawliteral";

// ── Telemetry Dashboard Page HTML ───────────────────────────────────────────
// Live diagnostic view — IMU data graphs, FSM state, GPS, and map link.

static const char TELEMETRY_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>RAMS — Live Telemetry</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;background:#060913;color:#e0e4f0;
      padding:16px;min-height:100vh}
    .header-bar{display:flex;align-items:center;gap:12px;margin-bottom:4px}
    .brand-logo{width:36px;height:36px;border-radius:6px;border:1px solid rgba(123,140,255,0.4);object-fit:cover}
    h1{font-size:16px;font-weight:900;letter-spacing:-.025em;text-transform:uppercase;color:#fff}
    .sub{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#5c6480;margin-bottom:12px}
    .conn{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:12px;
      font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;margin-bottom:12px}
    .conn.on{background:rgba(52,217,127,0.15);color:#34d97f;border:1px solid rgba(52,217,127,0.3)}
    .conn.off{background:rgba(255,64,87,0.15);color:#ff4057;border:1px solid rgba(255,64,87,0.3)}
    .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px}
    @media(max-width:500px){.grid{grid-template-columns:1fr 1fr}}
    .card{background:rgba(14,18,48,0.85);border:1px solid rgba(80,100,220,0.18);
      border-radius:10px;padding:10px 12px}
    .card-label{font-size:9px;color:#5c6480;text-transform:uppercase;letter-spacing:.5px;font-weight:700}
    .card-value{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;margin-top:2px}
    .card-unit{font-size:10px;color:#5c6480;font-weight:400}
    .fsm-bar{display:flex;gap:4px;margin-bottom:12px}
    .fsm-state{flex:1;padding:8px 4px;text-align:center;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:10px;
      font-weight:700;letter-spacing:.4px;background:rgba(14,18,48,0.6);
      border:1px solid rgba(80,100,220,0.15);color:#5c6480;transition:all .2s}
    .fsm-state.active{background:rgba(123,140,255,0.2);border-color:#7b8cff;color:#7b8cff}
    .fsm-state.alert{background:rgba(255,64,87,0.2);border-color:#ff4057;color:#ff4057}
    canvas{width:100%;height:140px;background:rgba(14,18,48,0.85);
      border:1px solid rgba(80,100,220,0.18);border-radius:10px;margin-bottom:8px}
    .chart-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#5c6480;margin-bottom:4px}
    .gps-row{display:flex;gap:8px;margin-bottom:12px}
    .gps-row .card{flex:1}
    .nav-row{display:flex;gap:8px;margin-top:8px;font-family:'JetBrains Mono',monospace}
    .nav-link{flex:1;display:block;text-align:center;padding:10px;border-radius:8px;
      font-size:12px;font-weight:700;color:#7b8cff;text-decoration:none;
      border:1px solid rgba(100,120,255,0.25);transition:background .15s}
    .nav-link:hover{background:rgba(74,90,255,0.1)}
  </style>
</head>
<body>
  <div class="header-bar">
    <img src="/logo.jpg" class="brand-logo" alt="RAMS Logo">
    <h1>Live Diagnostic Telemetry</h1>
  </div>
  <p class="sub">Road Accident Monitoring System — Wearable Sensor Stream</p>
  <div class="conn off" id="cs"><span>● UPLINK DISCONNECTED</span></div>

  <!-- FSM State Bar -->
  <div class="fsm-bar">
    <div class="fsm-state" id="fs0">IDLE</div>
    <div class="fsm-state" id="fs1">FREEFALL</div>
    <div class="fsm-state" id="fs2">IMPACT</div>
    <div class="fsm-state" id="fs3">STILL</div>
    <div class="fsm-state" id="fs4">ALERT</div>
  </div>

  <!-- Sensor Cards -->
  <div class="grid">
    <div class="card"><div class="card-label">Accel X</div><div class="card-value" id="vax">—<span class="card-unit"> g</span></div></div>
    <div class="card"><div class="card-label">Accel Y</div><div class="card-value" id="vay">—<span class="card-unit"> g</span></div></div>
    <div class="card"><div class="card-label">Accel Z</div><div class="card-value" id="vaz">—<span class="card-unit"> g</span></div></div>
    <div class="card"><div class="card-label">Gyro X</div><div class="card-value" id="vgx">—<span class="card-unit"> °/s</span></div></div>
    <div class="card"><div class="card-label">Gyro Y</div><div class="card-value" id="vgy">—<span class="card-unit"> °/s</span></div></div>
    <div class="card"><div class="card-label">Gyro Z</div><div class="card-value" id="vgz">—<span class="card-unit"> °/s</span></div></div>
  </div>

  <!-- |A| Magnitude -->
  <div class="card" style="margin-bottom:12px">
    <div class="card-label">Acceleration Magnitude |A|</div>
    <div class="card-value" id="vam" style="font-size:26px;color:#7b8cff">—<span class="card-unit"> g</span></div>
  </div>

  <!-- Accel Chart -->
  <div class="chart-title">Acceleration (g) — rolling 200 samples</div>
  <canvas id="ca" width="800" height="140"></canvas>

  <!-- Gyro Chart -->
  <div class="chart-title">Gyroscope (°/s) — rolling 200 samples</div>
  <canvas id="cg" width="800" height="140"></canvas>

  <!-- GPS -->
  <div class="gps-row">
    <div class="card"><div class="card-label">Latitude</div><div class="card-value" id="vlat">—</div></div>
    <div class="card"><div class="card-label">Longitude</div><div class="card-value" id="vlon">—</div></div>
    <div class="card"><div class="card-label">Satellites</div><div class="card-value" id="vsat">—</div></div>
  </div>

  <!-- Nav -->
  <div class="nav-row">
    <a class="nav-link" href="/">📋 Registration</a>
    <a class="nav-link" href="/map">📍 Offline Map</a>
  </div>

  <script>
    var ws, accelBuf=[], gyroBuf=[], amBuf=[];
    var ca=document.getElementById('ca'), ctxA=ca.getContext('2d');
    var cg=document.getElementById('cg'), ctxG=cg.getContext('2d');
    var dpr=window.devicePixelRatio||1;

    function initCanvas(c,ctx){
      c.width=c.offsetWidth*dpr;c.height=140*dpr;
      ctx.scale(dpr,dpr);
    }
    initCanvas(ca,ctxA); initCanvas(cg,ctxG);

    var FSM_NAMES=['fs0','fs1','fs2','fs3','fs4'];

    function setFSM(state){
      FSM_NAMES.forEach(function(id,i){
        var el=document.getElementById(id);
        el.className='fsm-state'+(i===state?(state>=4?' alert':' active'):'');
      });
    }

    function drawChart(ctx,w,h,data,colors,yMin,yMax){
      ctx.clearRect(0,0,w,h);
      // Grid
      ctx.strokeStyle='rgba(80,100,220,0.1)';ctx.lineWidth=1;
      for(var g=0;g<=4;g++){
        var gy=g/4*h;
        ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke();
      }
      // Zero line
      var zeroY=h*(yMax/(yMax-yMin));
      ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(0,zeroY);ctx.lineTo(w,zeroY);ctx.stroke();
      ctx.setLineDash([]);
      // Data lines
      var N=200;
      for(var c=0;c<colors.length;c++){
        ctx.strokeStyle=colors[c];ctx.lineWidth=1.5;ctx.beginPath();
        for(var i=0;i<data.length;i++){
          var x=i/N*w;
          var v=data[i][c];
          var y=h-((v-yMin)/(yMax-yMin))*h;
          y=Math.max(0,Math.min(h,y));
          if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
    }

    function connectWS(){
      ws=new WebSocket('ws://'+location.hostname+':81/');
      ws.onopen=function(){
        document.getElementById('cs').className='conn on';
        document.getElementById('cs').innerHTML='<span>● Connected</span>';
      };
      ws.onclose=function(){
        document.getElementById('cs').className='conn off';
        document.getElementById('cs').innerHTML='<span>● Disconnected</span>';
        setTimeout(connectWS,2000);
      };
      ws.onmessage=function(e){
        try{
          var d=JSON.parse(e.data);
          if(d.type==='tel'){
            // Update values
            document.getElementById('vax').innerHTML=d.ax.toFixed(3)+'<span class="card-unit"> g</span>';
            document.getElementById('vay').innerHTML=d.ay.toFixed(3)+'<span class="card-unit"> g</span>';
            document.getElementById('vaz').innerHTML=d.az.toFixed(3)+'<span class="card-unit"> g</span>';
            document.getElementById('vgx').innerHTML=d.gx.toFixed(1)+'<span class="card-unit"> °/s</span>';
            document.getElementById('vgy').innerHTML=d.gy.toFixed(1)+'<span class="card-unit"> °/s</span>';
            document.getElementById('vgz').innerHTML=d.gz.toFixed(1)+'<span class="card-unit"> °/s</span>';

            var amColor=d.am<0.4?'#ff4057':d.am>3.0?'#ff4057':'#7b8cff';
            document.getElementById('vam').innerHTML='<span style="color:'+amColor+'">'+d.am.toFixed(3)+'</span><span class="card-unit"> g</span>';

            setFSM(d.fsm);

            // Buffer for charts (keep last 200)
            accelBuf.push([d.ax,d.ay,d.az]);
            gyroBuf.push([d.gx,d.gy,d.gz]);
            if(accelBuf.length>200)accelBuf.shift();
            if(gyroBuf.length>200)gyroBuf.shift();

            var aw=ca.offsetWidth,ah=140;
            drawChart(ctxA,aw,ah,accelBuf,['#ff4057','#34d97f','#7b8cff'],-5,5);
            var gw=cg.offsetWidth,gh=140;
            drawChart(ctxG,gw,gh,gyroBuf,['#ff4057','#34d97f','#7b8cff'],-500,500);
          }
          if(d.type==='gps'){
            document.getElementById('vlat').textContent=d.fix?d.lat.toFixed(6):'No fix';
            document.getElementById('vlon').textContent=d.fix?d.lon.toFixed(6):'—';
            document.getElementById('vsat').textContent=d.sats;
          }
        }catch(ex){}
      };
    }
    connectWS();
  </script>
</body>
</html>
)rawliteral";

// ── WebSocket Event Handler ─────────────────────────────────────────────────

static void _onWebSocketEvent(uint8_t clientNum, WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.printf("[AP] WebSocket client #%u connected\n", clientNum);
      break;

    case WStype_DISCONNECTED:
      Serial.printf("[AP] WebSocket client #%u disconnected\n", clientNum);
      break;

    case WStype_TEXT: {
      // Parse incoming JSON message
      String msg = String((char*)payload);
      Serial.printf("[AP] WS message from #%u: %s\n", clientNum, msg.c_str());

      // Check for registration request
      if (msg.indexOf("\"type\":\"register\"") >= 0) {
        // Extract name and driveLink from JSON (simple parsing, no ArduinoJson dependency)
        String name = "";
        String driveLink = "";

        int nameIdx = msg.indexOf("\"name\":\"");
        if (nameIdx >= 0) {
          int start = nameIdx + 8;
          int end = msg.indexOf("\"", start);
          if (end > start) name = msg.substring(start, end);
        }

        int linkIdx = msg.indexOf("\"driveLink\":\"");
        if (linkIdx >= 0) {
          int start = linkIdx + 13;
          int end = msg.indexOf("\"", start);
          if (end > start) driveLink = msg.substring(start, end);
        }

        // Process registration
        bool success = registrationProcess(name, driveLink);

        // Send result back to client
        String response;
        if (success) {
          String token = registrationGetToken();
          response = "{\"type\":\"register_result\",\"success\":true,\"token\":\"" + token + "\"}";

          // Also send PKT_REGISTER via LoRa so the receiver/backend knows
          String photoUrl = registrationGetPhotoUrl();
          loraSendRegister(token.c_str(), name.c_str(), photoUrl.c_str());
        } else {
          response = "{\"type\":\"register_result\",\"success\":false,\"error\":\"Invalid Drive link or registration failed\"}";
        }
        _wsServer.sendTXT(clientNum, response);
      }
      break;
    }

    default:
      break;
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

void localApStart() {
  if (_active) return;

  // Start SoftAP
  WiFi.mode(WIFI_AP);
  WiFi.softAP(SETUP_AP_SSID, nullptr, SETUP_AP_CHANNEL);
  delay(100);

  IPAddress apIP = WiFi.softAPIP();
  Serial.print(F("[AP] SoftAP started: "));
  Serial.print(SETUP_AP_SSID);
  Serial.print(F(" IP: "));
  Serial.println(apIP);

  // Setup HTTP routes
  _httpServer.on("/", HTTP_GET, []() {
    _httpServer.send_P(200, "text/html", REGISTRATION_HTML);
  });

  _httpServer.on("/map", HTTP_GET, []() {
    String html = offlineMapGetHTML();
    _httpServer.send(200, "text/html", html);
  });

  _httpServer.on("/telemetry", HTTP_GET, []() {
    _httpServer.send_P(200, "text/html", TELEMETRY_HTML);
  });

  _httpServer.on("/logo.jpg", HTTP_GET, []() {
    _httpServer.sendHeader("Location", LOGO_BASE64);
    _httpServer.send(302, "text/plain", "");
  });

  _httpServer.onNotFound([]() {
    _httpServer.sendHeader("Location", "/");
    _httpServer.send(302, "text/plain", "");
  });

  _httpServer.begin();

  // Setup WebSocket
  _wsServer.begin();
  _wsServer.onEvent(_onWebSocketEvent);

  _active = true;
  Serial.println(F("[AP] HTTP + WebSocket server started"));
}

void localApStop() {
  if (!_active) return;

  _wsServer.disconnect();
  _httpServer.close();

  // Fully shut down WiFi radio — critical for the "no data plan" pitch
  WiFi.softAPdisconnect(true);
  WiFi.mode(WIFI_OFF);
  delay(100);

  _active = false;
  Serial.println(F("[AP] SoftAP stopped, WiFi radio OFF"));
}

void localApUpdate() {
  if (!_active) return;
  _httpServer.handleClient();
  _wsServer.loop();
}

bool localApIsActive() {
  return _active;
}

void localApSendGPS(float lat, float lon, uint8_t satellites, bool hasFix) {
  if (!_active) return;

  // Broadcast GPS update to all connected WebSocket clients
  String json = "{\"type\":\"gps\",\"lat\":";
  json += String(lat, 6);
  json += ",\"lon\":";
  json += String(lon, 6);
  json += ",\"sats\":";
  json += String(satellites);
  json += ",\"fix\":";
  json += hasFix ? "true" : "false";
  json += "}";

  _wsServer.broadcastTXT(json);
}

void localApSendTelemetry(float ax, float ay, float az,
                          float gx, float gy, float gz,
                          float aMag, uint8_t fsmState) {
  if (!_active) return;

  // Manual JSON for performance (called at ~20Hz)
  char buf[200];
  snprintf(buf, sizeof(buf),
    "{\"type\":\"tel\",\"ax\":%.3f,\"ay\":%.3f,\"az\":%.3f,"
    "\"gx\":%.1f,\"gy\":%.1f,\"gz\":%.1f,"
    "\"am\":%.3f,\"fsm\":%u}",
    ax, ay, az, gx, gy, gz, aMag, fsmState);

  _wsServer.broadcastTXT(buf);
}
