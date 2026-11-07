/*
 * Road Accident Monitoring System — Receiver Main Sketch
 * ========================================================
 * ESP32-S3 SuperMini receiver base station.
 *
 * Boot sequence:
 *   1. Init Onboard NeoPixel (GPIO48) & Legacy Status LED (GPIO2)
 *   2. Init NVS, WiFi manager, LoRa RX (Ra-02 SX1278), local queue, HTTP upload
 *   3. WiFi manager tries saved creds → fallback to captive portal AP
 *   4. Main loop: WiFi update + LoRa RX + queue flush + NeoPixel animation
 *
 * Features & Hardware:
 *   - Ra-02 LoRa on ESP32-S3 SuperMini (NSS:10, MOSI:11, SCK:12, MISO:13, RST:9, DIO0:8)
 *   - Onboard WS2812B NeoPixel RGB LED (GPIO48)
 *   - Real-time LoRa packet decode & JSON serial streaming over USB COM port
 *   - Direct upload to RAMS Rescuer Desktop / Netlify Cloud
 *   - LittleFS offline retry queue buffer
 *
 * GitHub: https://github.com/JanClyde05/Road-Accident-Monitoring-System
 */

#include "config.h"
#include "neopixel.h"
#include "nvs_store.h"
#include "wifi_manager.h"
#include "lora_rx.h"
#include "http_upload.h"
#include "local_queue.h"
#include "../shared/protocol.h"

static bool _loraOk = false;
static uint32_t _lastLedToggle = 0;
static bool _ledState = false;
static uint32_t _lastHeartbeatMs = 0;
static const uint32_t HEARTBEAT_INTERVAL_MS = 15000;

// ── Legacy Status LED Patterns (GPIO2) ──────────────────────────────────────
static void _updateStatusLED() {
  uint32_t now = millis();
  WifiState ws = wifiGetState();

  if (ws == WIFI_CONNECTED && _loraOk) {
    digitalWrite(STATUS_LED_PIN, HIGH);
  } else if (ws == WIFI_CONNECTED) {
    if (now - _lastLedToggle >= 500) {
      _lastLedToggle = now;
      _ledState = !_ledState;
      digitalWrite(STATUS_LED_PIN, _ledState);
    }
  } else if (ws == WIFI_AP_MODE) {
    if (now - _lastLedToggle >= 125) {
      _lastLedToggle = now;
      _ledState = !_ledState;
      digitalWrite(STATUS_LED_PIN, _ledState);
    }
  } else if (ws == WIFI_CONNECTING) {
    if (now - _lastLedToggle >= 250) {
      _lastLedToggle = now;
      _ledState = !_ledState;
      digitalWrite(STATUS_LED_PIN, _ledState);
    }
  } else {
    digitalWrite(STATUS_LED_PIN, LOW);
  }
}

// ── Setup ───────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(SERIAL_BAUD);
  delay(500);

  Serial.println(F("\n╔════════════════════════════════════════════════════════╗"));
  Serial.println(F("║   Road Accident Monitoring System — Receiver Station   ║"));
  Serial.println(F("║   ESP32-S3 SuperMini + Ra-02 LoRa (433MHz Base)       ║"));
  Serial.println(F("╚════════════════════════════════════════════════════════╝\n"));

  // 1. Initialize Visual Indicators
  neopixelInit();
  neopixelSetState(NEO_RX_BOOT);

  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);

  // 2. Initialize NVS
  nvsStoreInit();

  // 3. Initialize LoRa receiver (Ra-02 SX1278) - CRITICAL PRIORITY: must start before network
  Serial.println(F("[RECEIVER] Initializing LoRa Radio (433MHz)..."));
  _loraOk = loraRxInit();
  if (!_loraOk) {
    Serial.println(F("[RECEIVER] [ERROR] LoRa init failed! Check SPI wiring on GPIOs 8, 9, 10, 11, 12, 13."));
    neopixelSetState(NEO_RX_ERROR);
  } else {
    Serial.println(F("[RECEIVER] [OK] LoRa receiver active and listening on 433MHz"));
  }

  // 4. Initialize WiFi (non-blocking captive portal or saved network)
  Serial.println(F("[RECEIVER] Initializing WiFi..."));
  wifiManagerInit();

  // 5. Initialize local queue (LittleFS-backed retry buffer)
  localQueueInit();

  // 6. Initialize HTTP upload client
  httpUploadInit();

  Serial.println(F("\n[RECEIVER] Base station boot complete"));
  Serial.printf("[RECEIVER] WiFi: %s | LoRa: %s | Queue: %d pending\n",
                wifiIsConnected() ? "Connected" : "Not connected",
                _loraOk ? "READY" : "FAILED",
                localQueueCount());

  if (wifiIsConnected()) {
    Serial.print(F("[RECEIVER] Station IP: "));
    Serial.println(wifiGetIP());
    Serial.printf("[RECEIVER] Target Backend: %s\n", BACKEND_URL);
  } else if (wifiGetState() == WIFI_AP_MODE) {
    Serial.printf("[RECEIVER] Captive Portal AP active: Connect to '%s' (IP: 192.168.4.1)\n", WIFI_AP_SSID);
  }
}

// ── Main Loop ───────────────────────────────────────────────────────────────

void loop() {
  uint32_t now = millis();

  // 1. WiFi connection management (captive portal + auto-reconnect)
  wifiManagerUpdate();

  // 2. Check for incoming LoRa packets from wearable
  if (_loraOk) {
    loraRxUpdate();
  }

  // 3. Retry queued uploads when WiFi is available
  localQueueUpdate();

  // 4. Update status visual feedback
  _updateStatusLED();

  // Update onboard NeoPixel state machine (unless in active alert or error)
  if (neopixelGetState() != NEO_RX_ALERT && neopixelGetState() != NEO_RX_ERROR) {
    WifiState ws = wifiGetState();
    if (ws == WIFI_CONNECTED) {
      neopixelSetState(NEO_RX_ONLINE_IDLE);    // Breathing Green: Ready & Online
    } else if (ws == WIFI_AP_MODE) {
      neopixelSetState(NEO_RX_AP_MODE);        // Pulsing Amber: Captive Portal Active
    } else if (ws == WIFI_CONNECTING) {
      neopixelSetState(NEO_RX_CONNECTING);     // Pulsing Cyan: Connecting to WiFi
    } else {
      neopixelSetState(NEO_RX_OFFLINE_IDLE);   // Breathing Yellow: LoRa Listening (Offline Buffer Mode)
    }
  }
  neopixelUpdate();

  // 5. Periodic Heartbeat in Serial Monitor
  if (now - _lastHeartbeatMs >= HEARTBEAT_INTERVAL_MS) {
    _lastHeartbeatMs = now;
    if (_loraOk) {
      Serial.printf("[RECEIVER] Heartbeat: LoRa=LISTENING (433MHz) | WiFi=%s | IP=%s | Queue=%d\n",
                    wifiIsConnected() ? "ONLINE" : "OFFLINE",
                    wifiIsConnected() ? wifiGetIP().c_str() : "0.0.0.0",
                    localQueueCount());
    }
  }

  // Small delay to prevent watchdog starvation
  delay(5);
}
