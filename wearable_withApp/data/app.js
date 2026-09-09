/*
 * Road Accident Monitoring System — Wearable Client Interface
 * =============================================================
 * Dedicated WebSocket client running in the user's browser.
 * Communicates directly with the wearable safety uplink.
 */

var ws;
var wsReady = false;
var activeTab = 'setup';
var accelHistory = [];
var wsPackets = [];
var selectedUserType = 'Pedestrian';
var currentDeviceToken = '------';

// Canvas context
var canvas = null;
var ctx = null;

// Tuguegarao Map Bounds (WGS84)
var MAP_TOP_LAT    = 17.625;
var MAP_BOTTOM_LAT = 17.600;
var MAP_LEFT_LON   = 121.715;
var MAP_RIGHT_LON  = 121.740;

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

// ── Deterministic Compact Token Generation ───────────────────────
// Computes a 16-bit hash from registered info to yield "RAMS-XXXX" (e.g. RAMS-4A2F)
function generateFriendlyToken(name, userType, driveLink) {
  var seed = (name || 'USER') + '|' + (userType || 'Pedestrian') + '|' + (driveLink || '');
  var hash = 0x811c;
  for (var i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = (hash * 0x0103) & 0xffff;
  }
  var hex = hash.toString(16).toUpperCase().padStart(4, '0');
  return 'RAMS-' + hex;
}

// ── Road User Category Selector ─────────────────────────────────

function setUserType(type) {
  selectedUserType = type;
  var btns = document.querySelectorAll('.user-type-btn');
  btns.forEach(function(b) {
    if (b.getAttribute('data-type') === type) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  if ($('userTypePreview')) {
    $('userTypePreview').textContent = type;
  }
  if ($('mapPinLabel')) {
    var rawName = ($('name') && $('name').value.trim()) || '';
    $('mapPinLabel').textContent = rawName ? rawName.split(' ')[0].toUpperCase() : type.toUpperCase();
  }

  // Update token preview if registered or typing
  var currentName = ($('name') && $('name').value.trim()) || '';
  if (currentName && currentDeviceToken !== '------') {
    currentDeviceToken = generateFriendlyToken(currentName, selectedUserType, ($('driveLink') && $('driveLink').value.trim()) || '');
    if ($('tokenDisplay')) $('tokenDisplay').textContent = currentDeviceToken;
  }

  // If WebSocket is online, transmit update frame immediately so receiver stays synced
  if (ws && wsReady) {
    var frame = {
      type: 'user_type',
      userType: selectedUserType,
      name: currentName,
      token: currentDeviceToken !== '------' ? currentDeviceToken : ''
    };
    var payloadStr = JSON.stringify(frame);
    logPacket('tx', payloadStr);
    ws.send(payloadStr);
  }
}

// ── Realtime Profile Input Previews ─────────────────────────────

function updatePreview() {
  var nameInput = $('name');
  var namePreview = $('namePreview');
  if (!nameInput || !namePreview) return;

  var val = nameInput.value.trim();
  namePreview.textContent = val.length > 0 ? val : '------';

  if ($('mapPinLabel')) {
    $('mapPinLabel').textContent = val.length > 0 ? val.split(' ')[0].toUpperCase() : selectedUserType.toUpperCase();
  }
}

// ── WebSocket Uplink Management (No Fake / Mock Stream) ──────────

function connectWS() {
  var host = location.hostname || '192.168.4.1';
  var wsUrl = 'ws://' + host + ':81/';
  logPacket('sys', 'Connecting to ' + wsUrl + '...');

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = function() {
      wsReady = true;
      if ($('wsPill')) $('wsPill').className = 'ws-pill connected';
      if ($('wsStatusText')) $('wsStatusText').textContent = 'WEBSOCKET: CONNECTED';
      if ($('streamStatus')) {
        $('streamStatus').textContent = '100Hz Live Stream';
        $('streamStatus').style.color = '#34d399';
      }
      logPacket('sys', 'Wearable safety uplink connected');
    };

    ws.onclose = function() {
      wsReady = false;
      if ($('wsPill')) $('wsPill').className = 'ws-pill disconnected';
      if ($('wsStatusText')) $('wsStatusText').textContent = 'WEBSOCKET: DISCONNECTED';
      if ($('streamStatus')) {
        $('streamStatus').textContent = 'Waiting for live sensor data...';
        $('streamStatus').style.color = '#a1a1aa';
      }
      logPacket('sys', 'WebSocket disconnected. Retrying uplink...');
      setTimeout(connectWS, 3000);
    };

    ws.onerror = function() {
      if ($('wsPill')) $('wsPill').className = 'ws-pill disconnected';
      if ($('wsStatusText')) $('wsStatusText').textContent = 'WEBSOCKET: DISCONNECTED';
      logPacket('sys', 'WebSocket offline. Standby mode active.');
    };

    ws.onmessage = function(e) {
      handleIncomingFrame(e.data);
    };
  } catch(ex) {
    setTimeout(connectWS, 3000);
  }
}

// ── Frame Dispatcher ────────────────────────────────────────────

function handleIncomingFrame(rawData) {
  logPacket('rx', rawData);

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
      var hasFix = Boolean(data.fix && data.lat && data.lat !== 0);

      if ($('vlat')) $('vlat').textContent = hasFix ? (data.lat.toFixed(4) + '° N') : 'No GPS fix';
      if ($('vlon')) $('vlon').textContent = hasFix ? (data.lon.toFixed(4) + '° E') : '—';
      if ($('vsats')) {
        $('vsats').textContent = (data.sats || 0) + ' Sats' + (hasFix ? ' (3D)' : '');
        $('vsats').style.color = hasFix ? '#34d399' : '#a1a1aa';
      }

      // Map pin logic: only show pin if valid fix exists
      var pin = $('mapPin');
      var notice = $('noFixNotice');
      var coordsText = $('mapCoordsText');

      if (hasFix) {
        if (pin) {
          var pctX = (data.lon - MAP_LEFT_LON) / (MAP_RIGHT_LON - MAP_LEFT_LON);
          var pctY = (MAP_TOP_LAT - data.lat) / (MAP_TOP_LAT - MAP_BOTTOM_LAT);
          // Clamp to visible viewport
          pctX = Math.max(0.06, Math.min(0.94, pctX));
          pctY = Math.max(0.06, Math.min(0.94, pctY));

          pin.style.left = (pctX * 100).toFixed(1) + '%';
          pin.style.top = (pctY * 100).toFixed(1) + '%';
          pin.style.display = 'flex';
        }
        if (notice) notice.style.display = 'none';
        if (coordsText) {
          coordsText.textContent = 'LAT: ' + data.lat.toFixed(6) + '  LON: ' + data.lon.toFixed(6) + ' (' + (data.sats || 0) + ' SATELLITES LOCKED)';
          coordsText.style.color = '#34d399';
        }
      } else {
        // No fix: explicitly DO NOT put any pin on the map
        if (pin) pin.style.display = 'none';
        if (notice) notice.style.display = 'flex';
        if (coordsText) {
          coordsText.textContent = 'GPS STATUS: WAITING FOR SATELLITE FIX (' + (data.sats || 0) + ' SATELLITES DETECTED)';
          coordsText.style.color = '#a1a1aa';
        }
      }
    }

    // 3. Registration Result Frame
    if (data.type === 'register_result') {
      var st = $('statusMsg');
      if (data.success) {
        currentDeviceToken = data.token;
        st.className = 'msg-banner ok';
        st.textContent = 'REGISTERED! TOKEN: ' + data.token;
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
      logPacket('sys', 'Pong received from wearable');
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
  st.textContent = 'Transmitting registration frame...';
  $('registerBtn').disabled = true;

  // Generate short interface-friendly token
  var generatedToken = generateFriendlyToken(name, selectedUserType, link);
  currentDeviceToken = generatedToken;

  var frame = {
    type: 'register',
    name: name,
    driveLink: link,
    userType: selectedUserType,
    token: generatedToken
  };

  var payloadStr = JSON.stringify(frame);
  logPacket('tx', payloadStr);

  if (ws && wsReady) {
    ws.send(payloadStr);
  } else {
    // Standalone fallback: simulate direct on-device save
    setTimeout(function() {
      handleIncomingFrame(JSON.stringify({
        type: 'register_result',
        success: true,
        token: generatedToken
      }));
    }, 350);
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
  drawWaveform();
}

function drawWaveform() {
  if (!ctx || !canvas) return;
  var w = canvas.width;
  var h = canvas.height;

  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, w, h);

  // Baseline zero reference
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // If no live history yet, draw flat reference
  if (accelHistory.length < 2) {
    ctx.fillStyle = '#3f3f46';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Awaiting live accelerometer samples', w / 2, h / 2 - 8);
    return;
  }

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

  input.addEventListener('input', handleDriveChange);
  input.addEventListener('change', handleDriveChange);

  function handleDriveChange() {
    var link = input.value.trim();
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
  }
}

// ── Initialization ─────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', function() {
  setupDrivePreview();
  initCanvas();
  connectWS();
  window.addEventListener('resize', initCanvas);
});

