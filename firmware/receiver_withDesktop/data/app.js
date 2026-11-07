/*
 * Road Accident Monitoring System — Receiver Captive Portal Logic
 * ==================================================================
 * Handles WiFi network scanning, selection, connection, and status
 * polling. Communicates with the ESPAsyncWebServer endpoints defined
 * in wifi_manager.cpp.
 */

// ── Helpers ────────────────────────────────────────────────────

function $(id) { return document.getElementById(id); }

function showMsg(text, type) {
  var box = $('msgBox');
  box.textContent = text;
  box.className = 'msg ' + (type || 'info');
}

function signalBars(rssi) {
  if (rssi >= -55) return '▂▄▆█';
  if (rssi >= -67) return '▂▄▆░';
  if (rssi >= -75) return '▂▄░░';
  return '▂░░░';
}

// ── Network Scan ───────────────────────────────────────────────

function scanNetworks() {
  var list = $('networks');
  list.innerHTML =
    '<div class="scanning"><div class="spinner"></div><span>Scanning…</span></div>';

  fetch('/scan')
    .then(function (r) { return r.json(); })
    .then(function (nets) {
      if (!nets.length) {
        list.innerHTML =
          '<div class="scanning"><span>No networks found</span></div>';
        return;
      }

      var html = '';
      nets.forEach(function (n) {
        html +=
          '<div class="net-item" onclick="selectNet(\'' +
          n.ssid.replace(/'/g, "\\'") +
          '\')">' +
          '<span class="net-name">' + n.ssid + (n.enc ? ' <span style="font-size:9px;opacity:0.6;font-family:monospace;">[SECURE]</span>' : '') + '</span>' +
          '<span class="net-meta">' +
          '<span class="signal-icon">' + signalBars(n.rssi) + '</span>' +
          '<span>' + n.rssi + ' dBm</span>' +
          '</span></div>';
      });
      list.innerHTML = html;
    })
    .catch(function () {
      list.innerHTML =
        '<div class="scanning"><span>Scan failed — try again</span></div>';
    });
}

function selectNet(ssid) {
  $('ssid').value = ssid;

  // Highlight selection
  var items = document.querySelectorAll('.net-item');
  items.forEach(function (el) {
    el.classList.toggle(
      'selected',
      el.querySelector('.net-name').textContent.replace(' [SECURE]', '').trim() === ssid
    );
  });
}

// ── Connect ────────────────────────────────────────────────────

function doConnect() {
  var ssid = $('ssid').value.trim();
  var pass = $('pass').value;

  if (!ssid) {
    showMsg('Please enter or select a network name.', 'error');
    return;
  }

  var btn = $('btnConnect');
  btn.disabled = true;
  btn.textContent = 'Connecting…';

  setStatus('connecting', 'Connecting to ' + ssid + '…');
  showMsg('Attempting connection — this takes 10-15 seconds…', 'info');

  fetch('/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ssid: ssid, pass: pass }),
  })
    .then(function (r) { return r.json(); })
    .then(function () {
      // Poll /status to track result
      setTimeout(pollStatus, 3000);
    })
    .catch(function () {
      showMsg('Request failed — are you connected to RAMS_Receiver_Setup?', 'error');
      btn.disabled = false;
      btn.textContent = 'Connect';
    });
}

// ── Status Polling ─────────────────────────────────────────────

var pollAttempts = 0;

function pollStatus() {
  pollAttempts++;

  fetch('/status')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.status === 'connected') {
        setStatus('connected', 'Connected — ' + (d.ssid || '') + ' (' + (d.ip || '') + ')');
        showMsg('UPLINK CONNECTED: WiFi connected! Receiver is online.', 'success');
        $('ipAddr').textContent = d.ip || '—';
        $('btnConnect').disabled = false;
        $('btnConnect').textContent = 'Connect';
        pollAttempts = 0;
      } else if (d.connectResult === 'failed') {
        setStatus('disconnected', 'Connection failed');
        showMsg('UPLINK ERROR: Could not connect — check password and try again.', 'error');
        $('btnConnect').disabled = false;
        $('btnConnect').textContent = 'Connect';
        pollAttempts = 0;
      } else if (pollAttempts < 8) {
        setTimeout(pollStatus, 2000);
      } else {
        setStatus('disconnected', 'Timed out');
        showMsg('Connection timed out. Try again.', 'error');
        $('btnConnect').disabled = false;
        $('btnConnect').textContent = 'Connect';
        pollAttempts = 0;
      }
    })
    .catch(function () {
      // Might lose connection to AP during switchover
      if (pollAttempts < 8) {
        setTimeout(pollStatus, 2000);
      } else {
        setStatus('disconnected', 'Lost connection to receiver');
        $('btnConnect').disabled = false;
        $('btnConnect').textContent = 'Connect';
        pollAttempts = 0;
      }
    });
}

function setStatus(state, text) {
  var el = $('connStatus');
  el.className = 'status ' + state;
  $('statusText').textContent = text;
}

// ── Password Toggle ────────────────────────────────────────────

function togglePass() {
  var input = $('pass');
  input.type = input.type === 'password' ? 'text' : 'password';
}

// ── Queue Management ───────────────────────────────────────────

function clearQueue() {
  if (!confirm('Clear all queued event data?')) return;

  fetch('/clear-memory', { method: 'POST' })
    .then(function (r) { return r.json(); })
    .then(function () {
      showMsg('Queue cleared successfully.', 'success');
      $('queueSize').textContent = '0';
    })
    .catch(function () {
      showMsg('Failed to clear queue.', 'error');
    });
}

// ── Init ───────────────────────────────────────────────────────

scanNetworks();

// Initial status check
fetch('/status')
  .then(function (r) { return r.json(); })
  .then(function (d) {
    if (d.status === 'connected') {
      setStatus('connected', 'Connected — ' + (d.ssid || '') + ' (' + (d.ip || '') + ')');
      $('ipAddr').textContent = d.ip || '—';
    }
  })
  .catch(function () { /* ignore */ });
