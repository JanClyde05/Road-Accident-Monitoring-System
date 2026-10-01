/*
 * Road Accident Monitoring System — Wearable Main Firmware
 * ==========================================================
 * ESP32-S3 SuperMini belt-clip wearable with SX1278 LoRa transmitter.
 *
 * Architecture & Features:
 *   - ESP32-S3 SuperMini + Ra-02 LoRa (SX1278 SPI)
 *   - Onboard WS2812B NeoPixel RGB LED (GPIO48)
 *   - Active Buzzer (GPIO1)
 *   - Onboard Physical Button (GPIO0)
 *   - Bluetooth Low Energy (BLE NUS) link with Android companion application
 *   - Receives real-time GPS & IMU crash alerts from phone via BLE
 *   - Relays emergency crash alerts and periodic telemetry over LoRa to receiver base station
 *   - Physical button cancels active alerts (sends false-alarm packet over LoRa + BLE ack)
 *   - No WiFi / SoftAP / NVS registration required
 */

#include "config.h"
#include "detection.h"
#include "gps.h"
#include "lora_tx.h"
#include "button.h"
#include "buzzer.h"
#include "neopixel.h"
#include "bt_service.h"
#include "battery.h"
#include "../shared/protocol.h"

static uint32_t _lastTelemetryMs = 0;
static bool     _loraOk = false;

void setup() {
  Serial.begin(SERIAL_BAUD);
  delay(500);

  Serial.println(F("\n╔════════════════════════════════════════════════════════╗"));
  Serial.println(F("║     Road Accident Monitoring System — Safety Wearable   ║"));
  Serial.println(F("║     ESP32-S3 SuperMini + LoRa (Phone BLE Assisted)     ║"));
  Serial.println(F("╚════════════════════════════════════════════════════════╝\n"));

  // 1. Initialize Visual & Audio Feedback
  neopixelInit();
  neopixelSetState(NEO_CONNECTING);  // Pulsing Cyan: Waiting for Phone BLE

  buzzerInit();
  buzzerSetPattern(BZR_CONFIRM);     // Power-on beep

  // 2. Initialize Physical Button
  buttonInit();

  // 3. Initialize Battery Monitor (100k/100k divider on GPIO2)
  batteryInit();

  // 4. Initialize Detection & GPS subsystem
  detectionInit();
  gpsInit();

  // 5. Initialize LoRa Radio (Ra-02 SX1278)
  _loraOk = loraTxInit();
  if (!_loraOk) {
    Serial.println(F("[WEARABLE] [ERROR] LoRa initialization failed! Check SPI wiring."));
    neopixelSetState(NEO_ERROR);
  }

  // 6. Initialize Bluetooth Low Energy (BLE Peripheral)
  btServiceInit();

  Serial.println(F("[WEARABLE] Ready. Connect mobile app via BLE to start telemetry feed."));
}

void loop() {
  uint32_t now = millis();

  // ── Background Updates ────────────────────────────────────────────────────
  gpsUpdate();
  buzzerUpdate();
  neopixelUpdate();
  btServiceUpdate();
  batteryUpdate();

  // ── Button Event Handling ─────────────────────────────────────────────────
  ButtonEvent btn = buttonUpdate();

  if (btn == BTN_PRESSED) {
    if (detectionHasActiveAlert()) {
      // User pressed the button during an alert: Cancel False Alarm!
      Serial.println(F("[WEARABLE] Button pressed — Cancelling active alert"));
      detectionAcknowledgeAlert();
      buzzerOff();
      buzzerSetPattern(BZR_CONFIRM);

      if (_loraOk) {
        loraSendFalseAlarm(
          btServiceGetDeviceToken(),
          gpsGetLatitude(),
          gpsGetLongitude()
        );
      }

      // Notify connected phone app over BLE
      btServiceSendText(F("{\"type\":\"CANCEL_ALERT_ACK\",\"source\":\"wearable_button\"}\n"));
    } else {
      // Normal click: confirmation chirp to verify device is operational
      buzzerSetPattern(BZR_CONFIRM);
      Serial.printf("[WEARABLE] Status check: Token=%s, BLE=%s, GPS_Fix=%s\n",
                    btServiceGetDeviceToken(),
                    btServiceIsConnected() ? "CONNECTED" : "DISCONNECTED",
                    gpsHasFix() ? "YES" : "NO");
    }
  }

  // ── Status LED State Management ───────────────────────────────────────────
  if (!detectionHasActiveAlert()) {
    if (!_loraOk) {
      neopixelSetState(NEO_ERROR);          // Solid Red: LoRa hardware failure
    } else if (!btServiceIsConnected()) {
      neopixelSetState(NEO_CONNECTING);     // Pulsing Cyan: Advertising BLE, waiting for phone
    } else {
      neopixelSetState(NEO_ARMED);          // Solid Green: Armed, phone connected & operational
    }
  }

  // ── Periodic Telemetry Broadcast via LoRa ─────────────────────────────────
  // Broadcast periodic telemetry beacon whenever phone is connected & radio ready
  if (_loraOk && btServiceIsConnected() && (now - _lastTelemetryMs >= TELEMETRY_INTERVAL_MS)) {
    _lastTelemetryMs = now;

    loraSendTelemetry(
      btServiceGetDeviceToken(),
      gpsGetLatitude(),
      gpsGetLongitude(),
      batteryGetPercent()
    );
  }

  delay(5);
}
