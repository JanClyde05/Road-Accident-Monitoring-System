/*
 * Road Accident Monitoring System — Wearable WebSocket Client
 * =============================================================
 * Dedicated WebSocket client running in the user's browser.
 * Connects directly to ws://<host>:81/ with zero HTTP server dependencies.
 */

var ws;
var wsReady = false;
var activeTab = 'setup';
var accelHistory = [];
var wsPackets = [];

// Canvas context
var canvas = null;
var ctx = null;

// FSM State Labels
var FSM_LABELS = [
  '0: IDLE (ARMED)',
  '1: FREEFALL DETECTED',
  '2: IMPACT SPIKE',
  '3: STILLNESS VERIFY',
  '4: EMERGENCY ALARM'
];

function $(id) {
  return document.getElementById(id);
}

// ── WebSocket Uplink Management ─────────────────────────────────

var mockStreamTimer = null;

function startMockStreamIfOffline() {
  if (mockStreamTimer) return;
  mockStreamTimer = setInterval(function() {
    if (wsReady) return; // Real WebSocket takes precedence
    var t = Date.now() / 1000;
    var ax = Math.sin(t * 2) * 0.15;
    var ay = Math.cos(t * 1.5) * 0.12;
    var az = 1.0 + Math.sin(t * 4) * 0.08;
    var am = Math.sqrt(ax * ax + ay * ay + az * az);
    var gx = Math.sin(t) * 2.5;
    var gy = Math.cos(t) * 1.8;
    var gz = Math.sin(t * 0.5) * 0.9;
    handleIncomingFrame(JSON.stringify({
      type: 'tel',
      ax: ax, ay: ay, az: az,
      gx: gx, gy: gy, gz: gz,
      am: am, fsm: 0
    }), true);
  }, 100);
}

function connectWS() {
  var host = location.hostname || '192.168.4.1';
  var wsUrl = 'ws://' + host + ':81/';
  logPacket('sys', 'Connecting to ' + wsUrl + '...');

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = function() {
      wsReady = true;
      if (mockStreamTimer) { clearInterval(mockStreamTimer); mockStreamTimer = null; }
      $('wsPill').className = 'ws-pill connected';
      $('wsStatusText').textContent = 'WEBSOCKET PORT 81: CONNECTED';
      logPacket('sys', 'Uplink connected to ESP32-S3 WebSocket server (Port 81)');
    };

    ws.onclose = function() {
      wsReady = false;
      $('wsPill').className = 'ws-pill disconnected';
      $('wsStatusText').textContent = 'WEBSOCKET: DISCONNECTED (STANDALONE PREVIEW)';
      logPacket('sys', 'WebSocket disconnected. Running standalone preview...');
      startMockStreamIfOffline();
      setTimeout(connectWS, 4000);
    };

    ws.onerror = function(err) {
      logPacket('sys', 'WebSocket offline (preview mode active)');
      startMockStreamIfOffline();
    };

    ws.onmessage = function(e) {
      handleIncomingFrame(e.data, false);
    };
  } catch(ex) {
    startMockStreamIfOffline();
    setTimeout(connectWS, 4000);
  }
}

// ── Frame Dispatcher ────────────────────────────────────────────

function handleIncomingFrame(rawData, isMock) {
  var now = new Date();
  var timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
  if (!isMock) {
    logPacket('rx', rawData);
  }

  try {
    var data = JSON.parse(rawData);

    // 1. Telemetry Frame
    if (data.type === 'tel') {
      if ($('vax')) $('vax').textContent = data.ax.toFixed(2) + ' g';
      if ($('vay')) $('vay').textContent = data.ay.toFixed(2) + ' g';
      if ($('vaz')) $('vaz').textContent = data.az.toFixed(2) + ' g';

      if ($('vgx')) $('vgx').textContent = data.gx.toFixed(1) + ' °/s';
      if ($('vgy')) $('vgy').textContent = data.gy.toFixed(1) + ' °/s';
      if ($('vgz')) $('vgz').textContent = data.gz.toFixed(1) + ' °/s';

      if ($('vam')) {
        $('vam').textContent = data.am.toFixed(3) + ' g';
        $('vam').style.color = (data.am < 0.4 || data.am > 3.0) ? '#f87171' : '#ffffff';
      }

      if ($('vfsm')) {
        $('vfsm').textContent = FSM_LABELS[data.fsm] || ('STATE ' + data.fsm);
        $('vfsm').className = 'metric-val' + (data.fsm >= 4 ? ' text-rose' : '');
      }

      // Check emergency alarm
      if (data.fsm >= 4) {
        if ($('alertBanner')) $('alertBanner').style.display = 'flex';
      } else {
        if ($('alertBanner')) $('alertBanner').style.display = 'none';
      }

      // Append to waveform history
      accelHistory.push([data.ax, data.ay, data.az]);
      if (accelHistory.length > 100) accelHistory.shift();
      drawWaveform();
    }

    // 2. GPS Frame
    if (data.type === 'gps') {
      if ($('vlat')) $('vlat').textContent = data.fix ? (data.lat.toFixed(4) + '° N') : 'No fix';
      if ($('vlon')) $('vlon').textContent = data.fix ? (data.lon.toFixed(4) + '° E') : '—';
      if ($('vsats')) $('vsats').textContent = data.sats + ' Sats' + (data.fix ? ' (3D)' : '');
      if ($('radarCoords')) {
        $('radarCoords').textContent = data.fix ? ('LAT: ' + data.lat.toFixed(6) + '  LON: ' + data.lon.toFixed(6)) : 'ACQUIRING GPS LOCK...';
      }
    }

    // 3. Registration Result Frame
    if (data.type === 'register_result') {
      var st = $('statusMsg');
      if (data.success) {
        st.className = 'msg-banner ok';
        st.textContent = 'REGISTERED VIA WEBSOCKET! TOKEN: ' + data.token;
        $('registerBtn').disabled = true;
        if ($('tokenDisplay')) $('tokenDisplay').textContent = data.token;
      } else {
        st.className = 'msg-banner err';
        st.textContent = 'ERROR: ' + (data.error || 'Registration failed');
        $('registerBtn').disabled = false;
      }
    }

    // 4. Pong Frame
    if (data.type === 'pong') {
      logPacket('sys', 'Pong received from wearable device');
    }
  } catch(ex) {
    // Non-JSON frame
  }
}

// ── Profile Registration (Pure WebSocket Transmission) ──────────

function doRegister() {
  var name = $('name').value.trim();
  var link = $('driveLink').value.trim();
  var st = $('statusMsg');

  if (!name) {
    st.className = 'msg-banner err';
    st.textContent = 'Road user full name is required.';
    return;
  }

  st.className = 'msg-banner info';
  st.textContent = 'Transmitting registration frame over WebSocket...';
  $('registerBtn').disabled = true;

  var frame = {
    type: 'register',
    name: name,
    driveLink: link
  };

  var payloadStr = JSON.stringify(frame);
  logPacket('tx', payloadStr);

  if (ws && wsReady) {
    ws.send(payloadStr);
  } else {
    // Standalone preview fallback
    setTimeout(function() {
      var mockToken = 'RAMS-' + Math.floor(1000 + Math.random() * 9000);
      handleIncomingFrame(JSON.stringify({
        type: 'register_result',
        success: true,
        token: mockToken
      }), false);
    }, 450);
  }
}

// ── Tab Management ──────────────────────────────────────────────

function switchTab(tabName) {
  activeTab = tabName;
  var tabs = ['setup', 'telemetry', 'map', 'logs'];
  tabs.forEach(function(t) {
    var viewEl = $('view-' + t);
    var btnEl = $('btn-' + t);
    if (viewEl) viewEl.style.display = (t === tabName ? 'block' : 'none');
    if (btnEl) {
      if (t === tabName) btnEl.classList.add('active');
      else btnEl.classList.remove('active');
    }
  });

  if (tabName === 'telemetry') {
    initCanvas();
  }
}

// ── Canvas Waveform Renderer ────────────────────────────────────

function initCanvas() {
  canvas = $('waveformCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = 96;
}

function drawWaveform() {
  if (!ctx || !canvas) return;
  var w = canvas.width;
  var h = canvas.height;

  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, w, h);

  // Baseline
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  if (accelHistory.length < 2) return;

  var step = w / 100;
  var colors = ['#f87171', '#34d399', '#60a5fa']; // X, Y, Z

  for (var axis = 0; axis < 3; axis++) {
    ctx.strokeStyle = colors[axis];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (var i = 0; i < accelHistory.length; i++) {
      var x = i * step;
      var val = accelHistory[i][axis];
      var y = h / 2 - val * (h / 8);
      y = Math.max(2, Math.min(h - 2, y));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// ── Terminal / Protocol Logs ────────────────────────────────────

function logPacket(dir, payload) {
  var now = new Date();
  var timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
  var entry = { time: timeStr, dir: dir, payload: payload };
  wsPackets.unshift(entry);
  if (wsPackets.length > 40) wsPackets.pop();

  var box = $('terminalLogs');
  if (!box) return;

  var html = '';
  wsPackets.forEach(function(p) {
    var dirClass = p.dir === 'tx' ? 'dir-tx' : (p.dir === 'rx' ? 'dir-rx' : 'dir-badge');
    var dirLabel = p.dir === 'tx' ? 'TX ->' : (p.dir === 'rx' ? 'RX <-' : 'SYS');
    html += '<div class="terminal-entry">' +
            '<span style="color:#71717a;flex-shrink:0;">' + p.time + '</span>' +
            '<span class="dir-badge ' + dirClass + '">' + dirLabel + '</span>' +
            '<span style="color:#d4d4d8;word-break:break-all;">' + escapeHtml(p.payload) + '</span>' +
            '</div>';
  });
  box.innerHTML = html;
}

function clearLogs() {
  wsPackets = [];
  var box = $('terminalLogs');
  if (box) box.innerHTML = '<div style="color:#52525b;text-align:center;padding:12px;">Logs cleared.</div>';
}

function sendPing() {
  if (!ws || !wsReady) return;
  var frame = { type: 'ping' };
  var str = JSON.stringify(frame);
  logPacket('tx', str);
  ws.send(str);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Google Drive Link Parsing ───────────────────────────────────

function setupDrivePreview() {
  var input = $('driveLink');
  if (!input) return;

  input.addEventListener('change', function() {
    var link = this.value.trim();
    var img = $('photoPreview');
    var ph = $('photoPlaceholder');
    if (!link) {
      if (img) img.style.display = 'none';
      if (ph) ph.style.display = 'flex';
      return;
    }

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

    if (fid && img) {
      img.src = 'https://lh3.googleusercontent.com/d/' + fid;
      img.style.display = 'block';
      if (ph) ph.style.display = 'none';
      img.onerror = function() {
        img.style.display = 'none';
        if (ph) ph.style.display = 'flex';
      };
    }
  });
}

// ── Initialization ─────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', function() {
  setupDrivePreview();
  initCanvas();
  connectWS();
  window.addEventListener('resize', initCanvas);
});
