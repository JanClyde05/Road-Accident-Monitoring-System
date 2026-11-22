#include "backend_resolver.h"
#include "config.h"
#include "nvs_store.h"
#include "wifi_manager.h"
#include <WiFi.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>

static WiFiUDP  _udp;
static String   _host;
static uint16_t _port = 0;
static bool     _fallback = false;
static uint32_t _lastProbeMs = 0;
static uint8_t  _failStreak = 0;
static uint32_t _nonceSeq = 0;

static bool _health(const String& host, uint16_t port) {
  WiFiClient c;
  if (!c.connect(host.c_str(), port, BACKEND_PROBE_TIMEOUT_MS)) return false;
  c.printf("GET %s HTTP/1.1\r\nHost: %s\r\nConnection: close\r\n\r\n",
           BACKEND_HEALTH_PATH, host.c_str());
  uint32_t start = millis();
  while (!c.available() && millis() - start < BACKEND_PROBE_TIMEOUT_MS) delay(5);
  if (!c.available()) { c.stop(); return false; }
  String status = c.readStringUntil('\n');
  c.stop();
  return status.indexOf(" 200") > 0;
}

static bool _adopt(const String& host, uint16_t port, bool persist) {
  if (!_health(host, port)) return false;
  _host = host;
  _port = port;
  _fallback = false;
  _failStreak = 0;
  _lastProbeMs = millis();
  if (persist) nvsSaveBackend(host, port);
  Serial.printf("[NET] Backend resolved to %s:%u\n", host.c_str(), port);
  return true;
}

static bool _discoverOnce() {
  _udp.stop();
  if (!_udp.begin(0)) return false;

  char req[40];
  char nonce[9];
  snprintf(nonce, sizeof(nonce), "%08lx",
           (unsigned long)((++_nonceSeq * 2654435761UL) ^ millis()));
  snprintf(req, sizeof(req), "RAMS_DISCOVER_V1 %s", nonce);

  IPAddress mask = WiFi.subnetMask();
  IPAddress bcast = WiFi.localIP();
  for (int i = 0; i < 4; i++) bcast[i] |= (uint8_t)~mask[i];

  const IPAddress targets[2] = { IPAddress(255, 255, 255, 255), bcast };
  for (int i = 0; i < 2; i++) {
    _udp.beginPacket(targets[i], BACKEND_UDP_PORT /* 8889 */);
    _udp.write((const uint8_t*)req, strlen(req));
    _udp.endPacket();
  }

  bool found = false;
  uint32_t deadline = millis() + BACKEND_DISCOVER_WINDOW_MS;
  char buf[192];
  while (!found && millis() < deadline) {
    int len = _udp.parsePacket();
    if (len > 0 && len < (int)sizeof(buf)) {
      int n = _udp.read(buf, sizeof(buf) - 1);
      buf[n] = 0;
      JsonDocument doc;
      if (deserializeJson(doc, buf) == DeserializationError::Ok
          && doc["svc"] == "rams-desktop"
          && doc["nonce"] == nonce) {
        String host = doc["host"] | "";
        uint16_t port = doc["port"] | 0;
        if (host.isEmpty()) host = _udp.remoteIP().toString();
        found = _adopt(host, port, true);
      }
    }
    delay(5);
  }
  _udp.stop();
  return found;
}

void backendInit() {
  _host = nvsGetBackendHost();
  _port = nvsGetBackendPort();
  if (_host.isEmpty() || _port == 0) {
    _host = ""; _port = 0;
  }
}

bool backendResolve() {
  if (!wifiIsConnected()) return false;
  if (!_host.isEmpty() && _adopt(_host, _port, false)) return true;
  for (int i = 0; i < BACKEND_DISCOVER_TRIES; i++) {
    if (_discoverOnce()) return true;
    delay(120);
  }
  if (strlen(BACKEND_URL_FALLBACK) > 0) {
    String fb = BACKEND_URL_FALLBACK;
    int colon = fb.lastIndexOf(':');
    if (colon > 0) {
      _host = fb.substring(0, colon);
      _port = fb.substring(colon + 1).toInt();
    } else {
      _host = fb;
      _port = 8888;
    }
    _fallback = true;
    Serial.println(F("[NET] Using compile-time fallback"));
    return true;
  }
  Serial.println(F("[NET] Backend unresolved; events stay queued"));
  return false;
}

String backendBaseUrl() {
  if (_host.isEmpty() || _port == 0) return "";
  return "http://" + _host + ":" + String(_port);
}

String backendHost() { return _host; }
uint16_t backendPort() { return _port; }
bool backendUsingFallback() { return _fallback; }

void backendSetManual(const String& hostPort) {
  String v = hostPort;
  v.trim();
  int colon = v.lastIndexOf(':');
  String h = colon > 0 ? v.substring(0, colon) : v;
  uint16_t p = colon > 0 ? v.substring(colon + 1).toInt() : 8888;
  if (h.isEmpty() || p == 0) return;
  _adopt(h, p, true);
}

void backendNoteUpload(bool ok) {
  if (ok) {
    _failStreak = 0;
    _lastProbeMs = millis();
    return;
  }
  if (_failStreak < 255) _failStreak++;
}

void backendTick() {
  if (!wifiIsConnected()) return;
  if (_host.isEmpty()) { backendResolve(); return; }
  uint32_t now = millis();
  if (now - _lastProbeMs < BACKEND_REPROBE_INTERVAL_MS) return;
  _lastProbeMs = now;
  if (_failStreak >= BACKEND_FAIL_THRESHOLD) {
    Serial.println(F("[NET] Backend suspect; rediscovering"));
    _host = "";
    backendResolve();
    return;
  }
  if (_health(_host, _port)) _failStreak = 0;
  else _failStreak++;
}
