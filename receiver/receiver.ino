/*
 * Road Accident Monitoring System — Receiver Main Sketch
 * ========================================================
 * ESP32-S3 SuperMini receiver station.
 *
 * Boot sequence:
 *   1. Init NVS, WiFi manager, LoRa RX, local queue, HTTP upload
 *   2. WiFi manager tries saved creds → fallback to captive portal
 *   3. Main loop: WiFi update + LoRa RX + queue flush + status LED
 *
 * The receiver is a fixed-install device (USB/wall powered), sitting
 * at a barangay hall, rural health station, or monitoring center.
 * It bridges the LoRa network to the internet backbone.
 *
 * GitHub: https://github.com/JanClyde05/Road-Accident-Monitoring-System
 */

#include "config.h"
#include "nvs_store.h"
#include "wifi_manager.h"
#include "lora_rx.h"
#include "http_upload.h"
#include "local_queue.h"
#include "../shared/protocol.h"

static bool _loraOk = false;
static uint32_t _lastLedToggle = 0;
static bool _ledState = false;

// ── Status LED Patterns ─────────────────────────────────────────────────────
// Solid ON = WiFi connected + LoRa OK
// Slow blink (1Hz) = WiFi connected, no LoRa
// Fast blink (4Hz) = AP mode (captive portal active)
// Off = error

static void _updateStatusLED() {
  uint32_t now = millis();
  WifiState ws = wifiGetState();

  if (ws == WIFI_CONNECTED && _loraOk) {
    // Solid on — everything operational
    digitalWrite(STATUS_LED_PIN, HIGH);
  } else if (ws == WIFI_CONNECTED) {
    // Slow blink — WiFi ok but LoRa failed
    if (now - _lastLedToggle >= 500) {
      _lastLedToggle = now;
      _ledState = !_ledState;
      digitalWrite(STATUS_LED_PIN, _ledState);
    }
  } else if (ws == WIFI_AP_MODE) {
    // Fast blink — captive portal active, waiting for WiFi config
    if (now - _lastLedToggle >= 125) {
      _lastLedToggle = now;
      _ledState = !_ledState;
      digitalWrite(STATUS_LED_PIN, _ledState);
    }
  } else if (ws == WIFI_CONNECTING) {
    // Medium blink — connecting
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

  Serial.println(F("\n╔══════════════════════════════════════════════╗"));
  Serial.println(F("║   Road Accident Monitoring System — Receiver  ║"));
  Serial.println(F("║   PGC Digital Innovation Challenge 2026       ║"));
  Serial.println(F("╚══════════════════════════════════════════════╝\n"));

  // Status LED
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);

  // Initialize NVS (must be first — WiFi manager depends on it)
  nvsStoreInit();

  // Initialize WiFi (tries saved creds, fallback to captive portal)
  Serial.println(F("[RECEIVER] Initializing WiFi..."));
  wifiManagerInit();

  // Initialize LoRa receiver
  _loraOk = loraRxInit();
  if (!_loraOk) {
    Serial.println(F("[RECEIVER] ⚠ LoRa init failed! Cannot receive packets."));
  }

  // Initialize local queue (LittleFS-backed retry buffer)
  localQueueInit();

  // Initialize HTTP upload client
  httpUploadInit();

  Serial.println(F("\n[RECEIVER] Boot complete"));
  Serial.printf("[RECEIVER] WiFi: %s | LoRa: %s | Queue: %d pending\n",
                wifiIsConnected() ? "Connected" : "Not connected",
                _loraOk ? "OK" : "FAILED",
                localQueueCount());

  if (wifiIsConnected()) {
    Serial.print(F("[RECEIVER] IP: "));
    Serial.println(wifiGetIP());
    Serial.printf("[RECEIVER] Backend: %s\n", BACKEND_URL);
  }
}

// ── Main Loop ───────────────────────────────────────────────────────────────

void loop() {
  // 1. WiFi connection management (captive portal + auto-reconnect)
  wifiManagerUpdate();

  // 2. Check for incoming LoRa packets
  if (_loraOk) {
    loraRxUpdate();
  }

  // 3. Retry queued uploads when WiFi is available
  localQueueUpdate();

  // 4. Update status LED
  _updateStatusLED();

  // Small delay to prevent watchdog issues
  delay(5);
}
