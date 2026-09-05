/*
 * Road Accident Monitoring System — Data Logger Main Sketch
 * ============================================================
 * Standalone ESP32-S3 + MPU-6050 data collection rig.
 *
 * Creates its own WiFi hotspot ("RAMS_DataLog") so the companion
 * phone/laptop connects directly — works with zero external network
 * dependency, including inside a moving jeepney or tricycle.
 *
 * 100Hz IMU streaming over WebSocket to the companion web page,
 * which accumulates data client-side and offers CSV download.
 *
 * Pin map (spec §7.2):
 *   I2C SDA = GPIO8, SCL = GPIO9
 *   Trial-marker button = GPIO2
 *
 * GitHub: https://github.com/JanClyde05/Road-Accident-Monitoring-System
 */

#include "imu_read.h"
#include "ws_stream.h"
#include "../shared/logo_data.h"
#include <WiFi.h>
#include <WebServer.h>
#include <LittleFS.h>

// ── Configuration ───────────────────────────────────────────────────────────

#define IMU_SDA       8
#define IMU_SCL       9
#define BUTTON_PIN    2
#define AP_SSID       "RAMS_DataLog"
#define SAMPLE_INTERVAL_US  10000  // 10ms = 100Hz

// ── State ───────────────────────────────────────────────────────────────────

static WebServer _httpServer(80);
static uint32_t _lastSampleUs = 0;
static uint32_t _sampleCount = 0;
static bool _streaming = true;
static bool _lastButtonState = HIGH;
static uint32_t _trialNum = 1;

// ── Companion Web Page (served from LittleFS or inline fallback) ────────────

static const char DATA_PAGE_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>RAMS — Data Collection</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;background:#060913;color:#e0e4f0;padding:16px;min-height:100vh}
    .header-bar{display:flex;align-items:center;gap:12px;margin-bottom:4px}
    .brand-logo{width:36px;height:36px;border-radius:6px;border:1px solid rgba(123,140,255,0.4);object-fit:cover}
    h1{font-size:16px;font-weight:900;letter-spacing:-.025em;text-transform:uppercase;color:#fff}
    .subtitle{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#5c6480;margin-bottom:16px}
    .controls{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
    input,select{padding:10px 12px;background:rgba(10,14,36,0.8);border:1px solid rgba(80,100,220,0.25);
      border-radius:8px;color:#e0e4f0;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none}
    input:focus,select:focus{border-color:#7b8cff}
    .btn{padding:10px 18px;border:none;border-radius:8px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;cursor:pointer;
      transition:transform 0.1s,opacity 0.2s}
    .btn-primary{background:linear-gradient(135deg,#7b8cff,#4a5aff);color:#fff}
    .btn-success{background:linear-gradient(135deg,#22b85c,#34d97f);color:#fff}
    .btn-danger{background:linear-gradient(135deg,#d93434,#ff4057);color:#fff}
    .btn:hover{transform:translateY(-1px)}
    .btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
    .stats{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap}
    .stat{background:rgba(14,18,48,0.85);border:1px solid rgba(80,100,220,0.18);
      border-radius:10px;padding:10px 14px;min-width:100px}
    .stat-label{font-size:9px;font-weight:700;color:#5c6480;text-transform:uppercase;letter-spacing:0.5px}
    .stat-value{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#e0e4f0;margin-top:2px}
    .stat-value.live{color:#34d97f}
    canvas{width:100%;height:200px;background:rgba(14,18,48,0.85);border:1px solid rgba(80,100,220,0.18);
      border-radius:10px;margin-bottom:16px}
    .log{background:rgba(14,18,48,0.6);border:1px solid rgba(80,100,220,0.12);border-radius:8px;
      padding:12px;font-size:11px;font-family:'JetBrains Mono',monospace;color:#9098b8;max-height:120px;overflow-y:auto}
    .connection{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:12px;
      font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;margin-bottom:12px}
    .connected{background:rgba(52,217,127,0.15);color:#34d97f;border:1px solid rgba(52,217,127,0.3)}
    .disconnected{background:rgba(255,64,87,0.15);color:#ff4057;border:1px solid rgba(255,64,87,0.3)}
  </style>
</head>
<body>
  <div class="header-bar">
    <img src="/logo.jpg" class="brand-logo" alt="RAMS Logo">
    <h1>100Hz IMU Data Logger</h1>
  </div>
  <p class="subtitle">Road Accident Monitoring System — Threshold Validation Rig</p>
  <div class="connection disconnected" id="connStatus">● DISCONNECTED</div>

  <div class="controls">
    <input type="text" id="trialId" placeholder="Trial ID (e.g. fall_fwd_01)" style="flex:1;min-width:180px">
    <select id="label">
      <option value="">— Select Label —</option>
      <optgroup label="Positive (Accident)">
        <option value="fall_forward">Fall — Forward</option>
        <option value="fall_backward">Fall — Backward</option>
        <option value="fall_lateral">Fall — Lateral</option>
        <option value="direct_impact">Direct Impact</option>
        <option value="skid_slide">Skid / Slide</option>
      </optgroup>
      <optgroup label="Negative (Normal Activity)">
        <option value="walking">Walking</option>
        <option value="running">Running / Jogging</option>
        <option value="jumping">Jumping</option>
        <option value="vehicle_ride">Vehicle Ride (no accident)</option>
      </optgroup>
    </select>
    <button class="btn btn-primary" id="btnSend" onclick="sendTrialInfo()">Set Trial</button>
  </div>

  <div class="controls">
    <button class="btn btn-success" id="btnDownload" onclick="downloadCSV()" disabled>⬇ Download CSV</button>
    <button class="btn btn-danger" onclick="clearData()">🗑 Clear Data</button>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-label">Samples</div><div class="stat-value live" id="sampleCount">0</div></div>
    <div class="stat"><div class="stat-label">Duration</div><div class="stat-value" id="duration">0.0s</div></div>
    <div class="stat"><div class="stat-label">Rate</div><div class="stat-value" id="rate">0 Hz</div></div>
    <div class="stat"><div class="stat-label">|A|</div><div class="stat-value live" id="aMag">0.00g</div></div>
  </div>

  <canvas id="chart" width="800" height="200"></canvas>
  <div class="log" id="log">Ready. Connect to RAMS_DataLog WiFi, then open this page.</div>

  <script>
    var ws, samples = [], chartData = [], startTime = 0, sampleRate = 0, lastRateCalc = 0, rateCount = 0;
    var canvas = document.getElementById('chart');
    var ctx = canvas.getContext('2d');

    function connectWS() {
      ws = new WebSocket('ws://' + location.hostname + ':81/');
      ws.onopen = function() {
        document.getElementById('connStatus').className = 'connection connected';
        document.getElementById('connStatus').textContent = '● Connected';
        log('WebSocket connected');
      };
      ws.onclose = function() {
        document.getElementById('connStatus').className = 'connection disconnected';
        document.getElementById('connStatus').textContent = '● Disconnected';
        setTimeout(connectWS, 2000);
      };
      ws.onmessage = function(e) {
        try {
          var d = JSON.parse(e.data);
          samples.push(d);
          if (startTime === 0) startTime = d.t_ms;

          // Update stats
          document.getElementById('sampleCount').textContent = samples.length;
          document.getElementById('duration').textContent = ((d.t_ms - startTime) / 1000).toFixed(1) + 's';
          var am = Math.sqrt(d.ax*d.ax + d.ay*d.ay + d.az*d.az);
          document.getElementById('aMag').textContent = am.toFixed(2) + 'g';
          document.getElementById('btnDownload').disabled = samples.length === 0;

          // Rate calculation
          rateCount++;
          var now = Date.now();
          if (now - lastRateCalc >= 1000) {
            sampleRate = rateCount;
            rateCount = 0;
            lastRateCalc = now;
            document.getElementById('rate').textContent = sampleRate + ' Hz';
          }

          // Chart: rolling 200-sample window of A_m
          chartData.push(am);
          if (chartData.length > 200) chartData.shift();
          drawChart();
        } catch(ex) {}
      };
    }

    function drawChart() {
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(80,100,220,0.1)';
      ctx.lineWidth = 1;
      for (var g = 0; g <= 5; g++) {
        var gy = h - (g / 5) * h;
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      // Threshold lines
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,64,87,0.4)'; ctx.beginPath();
      ctx.moveTo(0, h - (0.40/5)*h); ctx.lineTo(w, h - (0.40/5)*h); ctx.stroke(); // freefall
      ctx.strokeStyle = 'rgba(255,176,32,0.4)'; ctx.beginPath();
      ctx.moveTo(0, h - (3.0/5)*h); ctx.lineTo(w, h - (3.0/5)*h); ctx.stroke(); // impact
      ctx.setLineDash([]);

      // Data line
      if (chartData.length < 2) return;
      ctx.strokeStyle = '#7b8cff'; ctx.lineWidth = 2; ctx.beginPath();
      for (var i = 0; i < chartData.length; i++) {
        var x = (i / 200) * w;
        var y = h - Math.min(chartData[i] / 5, 1) * h;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function sendTrialInfo() {
      if (!ws || ws.readyState !== 1) { log('Not connected!'); return; }
      var tid = document.getElementById('trialId').value || 'trial_' + Date.now();
      var lbl = document.getElementById('label').value || 'unlabeled';
      ws.send(JSON.stringify({ trial_id: tid, label: lbl }));
      log('Trial set: id=' + tid + ' label=' + lbl);
    }

    function downloadCSV() {
      if (samples.length === 0) return;
      var header = 'trial_id,label,t_ms,ax,ay,az,gx,gy,gz\n';
      var rows = samples.map(function(s) {
        return [s.trial_id, s.label, s.t_ms,
                s.ax.toFixed(4), s.ay.toFixed(4), s.az.toFixed(4),
                s.gx.toFixed(2), s.gy.toFixed(2), s.gz.toFixed(2)].join(',');
      }).join('\n');
      var blob = new Blob([header + rows], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (samples[0].trial_id || 'data') + '.csv';
      a.click();
      URL.revokeObjectURL(url);
      log('Downloaded ' + samples.length + ' samples as CSV');
    }

    function clearData() {
      samples = []; chartData = []; startTime = 0;
      document.getElementById('sampleCount').textContent = '0';
      document.getElementById('duration').textContent = '0.0s';
      document.getElementById('btnDownload').disabled = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      log('Data cleared');
    }

    function log(msg) {
      var el = document.getElementById('log');
      el.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg + '\n' + el.textContent;
    }

    canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = 200 * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    connectWS();
  </script>
</body>
</html>
)rawliteral";

// ── Setup ───────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println(F("\n╔══════════════════════════════════════════════╗"));
  Serial.println(F("║  RAMS — Motion Data Collection Tool           ║"));
  Serial.println(F("║  100Hz IMU → WebSocket → CSV                 ║"));
  Serial.println(F("╚══════════════════════════════════════════════╝\n"));

  // Button for trial marking
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  // Initialize IMU
  if (!imuInit(IMU_SDA, IMU_SCL)) {
    Serial.println(F("[FATAL] MPU-6050 not found! Check wiring."));
    while (true) delay(1000);  // Halt
  }

  Serial.println(F("[DATA] Calibrating — keep device still..."));
  imuCalibrate(200);

  // Start SoftAP (own hotspot, no external WiFi needed)
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID);
  delay(100);

  IPAddress ip = WiFi.softAPIP();
  Serial.print(F("[DATA] SoftAP started: "));
  Serial.print(AP_SSID);
  Serial.print(F(" → http://"));
  Serial.println(ip);

  // Initialize LittleFS for serving the companion page
  LittleFS.begin(true);

  // HTTP server — serve companion page
  _httpServer.on("/", HTTP_GET, []() {
    if (LittleFS.exists("/index.html")) {
      File f = LittleFS.open("/index.html", "r");
      _httpServer.streamFile(f, "text/html");
      f.close();
    } else {
      _httpServer.send_P(200, "text/html", DATA_PAGE_HTML);
    }
  });

  _httpServer.on("/logo.jpg", HTTP_GET, []() {
    _httpServer.sendHeader("Location", LOGO_BASE64);
    _httpServer.send(302, "text/plain", "");
  });
  _httpServer.begin();

  // WebSocket streaming
  wsStreamInit();

  Serial.println(F("[DATA] Ready! Connect phone to '" AP_SSID "' WiFi, open http://192.168.4.1"));
}

// ── Main Loop ───────────────────────────────────────────────────────────────

void loop() {
  _httpServer.handleClient();
  wsStreamUpdate();

  // Button check — advance trial number on press
  bool btnState = digitalRead(BUTTON_PIN);
  if (btnState == LOW && _lastButtonState == HIGH) {
    _trialNum++;
    String newTrialId = "trial_" + String(_trialNum);
    wsStreamSetTrial(newTrialId, "marker");
    Serial.printf("[DATA] Trial marker #%u\n", _trialNum);
  }
  _lastButtonState = btnState;

  // 100Hz sampling loop (10ms interval)
  uint32_t nowUs = micros();
  if (nowUs - _lastSampleUs >= SAMPLE_INTERVAL_US) {
    _lastSampleUs = nowUs;
    _sampleCount++;

    IMUSample sample = imuRead();
    wsStreamSendSample(sample, millis());
  }
}
