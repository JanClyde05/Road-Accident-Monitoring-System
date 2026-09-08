/*
 * Road Accident Monitoring System — WiFi Manager Implementation
 * ================================================================
 * Captive portal provisioning adapted from GuardianTrack.
 * Uses LittleFS for serving the setup page (data/ folder) and
 * ESPAsyncWebServer for non-blocking request handling.
 *
 * Flow:
 *   1. Boot → try NVS-saved WiFi
 *   2. Fail → start SoftAP "RAMS_Receiver_Setup" + captive portal
 *   3. User picks network from scan results, enters password
 *   4. Connect attempt in AP_STA mode (portal stays alive during attempt)
 *   5. Success → save creds to NVS, stop AP, enter STA mode
 *   6. Connection lost later → auto-reconnect, fallback to AP mode
 */

#include "wifi_manager.h"
#include "config.h"
#include "nvs_store.h"
#include "local_queue.h"
#include "../shared/logo_data.h"
#include <WiFi.h>
#include <DNSServer.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include <esp_wifi.h>

// ── Internal State ──────────────────────────────────────────────────────────

static WifiState _state = WIFI_DISCONNECTED;
static DNSServer _dnsServer;
static AsyncWebServer _server(80);
static bool _apActive = false;
static bool _serverStarted = false;

// Pending connection from portal POST
static String _pendingSsid;
static String _pendingPass;
static bool _pendingConnect = false;
static bool _pendingConnectResult = false;
static bool _pendingConnectDone = false;

// ── Forward Declarations ────────────────────────────────────────────────────

static bool    _tryConnect(const String& ssid, const String& pass, unsigned long timeoutMs);
static void    _startAP();
static void    _stopAP();
static void    _setupRoutes();
static void    _setState(WifiState newState);
static String  _scanNetworksJson();

// ── Public API ──────────────────────────────────────────────────────────────

void wifiManagerInit() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);

  // Initialize LittleFS for captive portal assets
  if (!LittleFS.begin(true)) {
    Serial.println(F("[WIFI] LittleFS mount failed!"));
  }

  // 1. Try NVS-saved credentials
  if (nvsHasWifiCreds()) {
    String ssid = nvsGetWifiSsid();
    String pass = nvsGetWifiPass();
    Serial.print(F("[WIFI] Trying saved network: "));
    Serial.println(ssid);
    _setState(WIFI_CONNECTING);

    if (_tryConnect(ssid, pass, WIFI_CONNECT_TIMEOUT_MS)) {
      Serial.println(F("[WIFI] Connected to saved network!"));
      _setState(WIFI_CONNECTED);
      return;
    }
    Serial.println(F("[WIFI] Saved network failed"));
  }

  // 2. Fall back to SoftAP + captive portal
  Serial.println(F("[WIFI] No saved credentials or connection failed — starting AP"));
  _startAP();
}

void wifiManagerUpdate() {
  // Process DNS in AP mode (captive portal redirect)
  if (_apActive) {
    _dnsServer.processNextRequest();
  }

  // Handle pending connection attempts
  if (_pendingConnect) {
    _pendingConnect = false;
    _setState(WIFI_CONNECTING);

    WiFi.mode(WIFI_AP_STA);

    bool success = _tryConnect(_pendingSsid, _pendingPass, WIFI_CONNECT_TIMEOUT_MS);

    _pendingConnectResult = success;
    _pendingConnectDone = true;

    if (success) {
      Serial.print(F("[WIFI] Connected via portal to: "));
      Serial.println(_pendingSsid);
      nvsSaveWifi(_pendingSsid, _pendingPass);

      delay(1000);  // Let status response reach the client
      _stopAP();
      _setState(WIFI_CONNECTED);
    } else {
      Serial.println(F("[WIFI] Portal connection attempt failed"));
      WiFi.mode(WIFI_AP);
      WiFi.softAP(WIFI_AP_SSID);
      _setState(WIFI_AP_MODE);
    }
  }

  // Monitor connection health
  if (_state == WIFI_CONNECTED && WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[WIFI] Connection lost, attempting reconnect..."));
    _setState(WIFI_CONNECTING);

    WiFi.reconnect();
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - start) < WIFI_CONNECT_TIMEOUT_MS) {
      delay(100);
    }

    if (WiFi.status() == WL_CONNECTED) {
      _setState(WIFI_CONNECTED);
    } else {
      Serial.println(F("[WIFI] Reconnect failed, entering AP mode"));
      _startAP();
    }
  }
}

bool wifiIsConnected() {
  return _state == WIFI_CONNECTED && WiFi.status() == WL_CONNECTED;
}

String wifiGetIP() {
  if (_state == WIFI_CONNECTED) return WiFi.localIP().toString();
  if (_state == WIFI_AP_MODE)   return WiFi.softAPIP().toString();
  return "0.0.0.0";
}

WifiState wifiGetState() {
  return _state;
}

uint8_t wifiGetChannel() {
  uint8_t primary;
  wifi_second_chan_t second;
  esp_wifi_get_channel(&primary, &second);
  return primary;
}

void wifiStartAP() {
  WiFi.disconnect(true);
  _startAP();
}

void wifiForgetNetwork() {
  nvsClearWifi();
  WiFi.disconnect(true);
  _startAP();
}

// ── Connection Attempt ──────────────────────────────────────────────────────

static bool _tryConnect(const String& ssid, const String& pass, unsigned long timeoutMs) {
  WiFi.disconnect(true);
  delay(100);
  WiFi.begin(ssid.c_str(), pass.c_str());

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < timeoutMs) {
    delay(100);
  }

  return WiFi.status() == WL_CONNECTED;
}

// ── AP Mode ─────────────────────────────────────────────────────────────────

static void _startAP() {
  WiFi.disconnect(true);
  delay(100);
  WiFi.mode(WIFI_AP);
  delay(100);
  WiFi.softAP(WIFI_AP_SSID);
  delay(100);

  IPAddress apIP = WiFi.softAPIP();
  Serial.print(F("[WIFI] AP started: "));
  Serial.print(WIFI_AP_SSID);
  Serial.print(F(" IP: "));
  Serial.println(apIP);

  _dnsServer.start(53, "*", apIP);

  if (!_serverStarted) {
    _setupRoutes();
    _server.begin();
    _serverStarted = true;
    Serial.println(F("[WIFI] Captive portal web server started"));
  }

  _apActive = true;
  _setState(WIFI_AP_MODE);
}

static void _stopAP() {
  _dnsServer.stop();
  _apActive = false;
  WiFi.mode(WIFI_STA);
  Serial.println(F("[WIFI] AP stopped, STA mode active"));
}

// ── Web Server Routes ───────────────────────────────────────────────────────

static void _setupRoutes() {
  // Serve captive portal page
  _server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (LittleFS.exists("/index.html")) {
      request->send(LittleFS, "/index.html", "text/html");
    } else {
      // Inline fallback if LittleFS data isn't uploaded
      String html = F("<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
                      "<title>RAMS Receiver WiFi Setup</title>"
                      "<style>body{font-family:sans-serif;padding:16px;background:#09090b;color:#f4f4f5;display:flex;justify-center;align-items:center;min-height:100vh}"
                      ".card{width:100%;max-width:440px;background:#121214;border:1px solid #27272a;border-radius:16px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,0.5)}"
                      "h2{font-size:15px;font-weight:900;text-transform:uppercase;color:#fff;margin-bottom:4px}"
                      "input,button{display:block;width:100%;margin:10px 0;padding:11px 14px;font-size:13px;font-family:monospace;box-sizing:border-box;"
                      "background:#18181b;border:1px solid #27272a;border-radius:10px;color:#fff}"
                      "button{background:#fff;color:#09090b;font-weight:800;text-transform:uppercase;border:none;cursor:pointer}"
                      ".net{padding:10px 12px;margin:4px 0;border-radius:8px;background:#18181b;border:1px solid #27272a;cursor:pointer;font-family:monospace;font-size:12px}"
                      ".net:hover{background:#27272a;border-color:#fff}</style></head><body><div class='card'>"
                      "<h2>RAMS Receiver Setup</h2>"
                      "<p style='font-family:monospace;font-size:10px;color:#a1a1aa;text-transform:uppercase;'>Road Accident Monitoring System</p>"
                      "<div id='nets' style='margin:12px 0;'>Scanning networks...</div>"
                      "<input type='text' id='ssid' placeholder='WiFi Network (SSID)' required>"
                      "<input type='password' id='pass' placeholder='WiFi Password'>"
                      "<button onclick='doConnect()'>Connect</button>"
                      "<p id='msg' style='font-family:monospace;font-size:11px;margin-top:8px;'></p></div>"
                      "<script>"
                      "fetch('/scan').then(r=>r.json()).then(d=>{"
                      "var h='';d.forEach(n=>{"
                      "h+='<div class=\"net\" onclick=\"document.getElementById(\\'ssid\\').value=\\''+n.ssid+'\\'\">'"
                      "+n.ssid+' ('+n.rssi+'dBm)'+(n.enc?' 🔒':'')+'</div>';});"
                      "document.getElementById('nets').innerHTML=h||'No networks found';});"
                      "function doConnect(){"
                      "var s=document.getElementById('ssid').value,p=document.getElementById('pass').value;"
                      "document.getElementById('msg').textContent='Connecting to '+s+'...';"
                      "fetch('/connect',{method:'POST',headers:{'Content-Type':'application/json'},"
                      "body:JSON.stringify({ssid:s,pass:p})}).then(r=>r.json()).then(d=>{"
                      "document.getElementById('msg').textContent='Connecting... Please wait 15s.';});}"
                      "</script></body></html>");
      request->send(200, "text/html", html);
    }
  });

  _server.serveStatic("/", LittleFS, "/");

  _server.on("/logo.jpg", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (LittleFS.exists("/logo.jpg")) {
      request->send(LittleFS, "/logo.jpg", "image/jpeg");
    } else {
      request->redirect(LOGO_BASE64);
    }
  });

  // Network scan
  _server.on("/scan", HTTP_GET, [](AsyncWebServerRequest *request) {
    String json = _scanNetworksJson();
    request->send(200, "application/json", json);
  });

  // Clear queue
  _server.on("/clear-memory", HTTP_POST, [](AsyncWebServerRequest *request) {
    localQueueClear();
    request->send(200, "application/json", "{\"status\":\"ok\",\"message\":\"Queue cleared\"}");
  });

  // Connect
  _server.on("/connect", HTTP_POST, [](AsyncWebServerRequest *request) {
  }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, data, len);
    if (err) {
      request->send(400, "application/json", "{\"status\":\"error\",\"message\":\"Invalid JSON\"}");
      return;
    }

    String ssid = doc["ssid"] | "";
    String pass = doc["pass"] | "";

    if (ssid.length() == 0) {
      request->send(400, "application/json", "{\"status\":\"error\",\"message\":\"SSID required\"}");
      return;
    }

    _pendingSsid = ssid;
    _pendingPass = pass;
    _pendingConnect = true;
    _pendingConnectDone = false;

    request->send(200, "application/json", "{\"status\":\"connecting\"}");
  });

  // Status
  _server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request) {
    JsonDocument doc;
    doc["state"] = (int)_state;

    switch (_state) {
      case WIFI_CONNECTED:
        doc["status"] = "connected";
        doc["ip"] = WiFi.localIP().toString();
        doc["ssid"] = WiFi.SSID();
        break;
      case WIFI_CONNECTING:
        doc["status"] = "connecting";
        break;
      case WIFI_AP_MODE:
        doc["status"] = "ap_mode";
        break;
      default:
        doc["status"] = "disconnected";
        break;
    }

    if (_pendingConnectDone) {
      doc["connectResult"] = _pendingConnectResult ? "success" : "failed";
    }

    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });

  // Captive portal catch-all
  _server.onNotFound([](AsyncWebServerRequest *request) {
    request->redirect("/");
  });
}

// ── Network Scan ────────────────────────────────────────────────────────────

static String _scanNetworksJson() {
  int n = WiFi.scanNetworks(false, false, false, 300);

  JsonDocument doc;
  JsonArray arr = doc.to<JsonArray>();

  for (int i = 0; i < n && i < 20; i++) {
    JsonObject net = arr.add<JsonObject>();
    net["ssid"] = WiFi.SSID(i);
    net["rssi"] = WiFi.RSSI(i);
    net["enc"]  = (WiFi.encryptionType(i) != WIFI_AUTH_OPEN);
  }

  WiFi.scanDelete();

  String result;
  serializeJson(doc, result);
  return result;
}

static void _setState(WifiState newState) {
  if (newState != _state) {
    _state = newState;
  }
}
