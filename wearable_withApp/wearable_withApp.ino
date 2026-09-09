/*
 * Road Accident Monitoring System — Wearable Main Sketch
 * ========================================================
 * ESP32-S3 SuperMini belt-clip wearable for accident detection.
 *
 * Two operating modes:
 *   ARMED  — WiFi off, sensors active, LoRa TX, detection FSM running.
 *            Periodic telemetry packets sent every 30s.
 *   SETUP  — SoftAP on, WebSocket active, serves registration page +
 *            offline map with live GPS pin. Detection is paused.
 *            Entered via button long-press.
 *
 * Physical button behavior:
 *   Short press during active alert → cancel alert (PKT_FALSE_ALARM)
 *   Short press while disarmed     → re-arm (resume detection)
 *   Long press (3s)                → toggle between armed/setup modes
 *
 * Module dependency order:
 *   config.h → sensors → gps → detection → lora_tx → button → buzzer →
 *   neopixel → registration → local_ap → offline_map → wearable.ino
 *
 * GitHub: https://github.com/JanClyde05/Road-Accident-Monitoring-System
 */

#include "config.h"
#include "sensors.h"
#include "gps.h"
#include "detection.h"
#include "lora_tx.h"
#include "button.h"
#include "buzzer.h"
#include "neopixel.h"
#include "local_ap.h"
#include "registration.h"
#include "offline_map.h"
#include "../shared/protocol.h"

// ── Operating Modes ─────────────────────────────────────────────────────────

enum WearableMode : uint8_t {
  MODE_ARMED,  // Normal operation: detect accidents, TX telemetry
  MODE_SETUP   // Setup mode: SoftAP + registration + offline map
};

static WearableMode _mode = MODE_ARMED;
static uint32_t _lastTelemetryMs = 0;
static uint32_t _lastGPSBroadcastMs = 0;
static bool _sensorsOk = false;
static bool _loraOk = false;

// ── Battery Reading ─────────────────────────────────────────────────────────
// ESP32-S3 SuperMini has an onboard LiPo charger but no dedicated battery
// ADC circuit. This is a rough estimate using the onboard ADC — accuracy
// depends on the specific board's voltage divider (if present).

static uint8_t _readBattery() {
  // TODO: Calibrate against your specific board. Many SuperMini clones
  // don't expose a battery voltage pin. Return 0 if unavailable.
  return 0;
}

// ── Mode Transitions ────────────────────────────────────────────────────────

static void _enterSetupMode() {
  Serial.println(F("\n═══ ENTERING SETUP MODE ═══"));
  _mode = MODE_SETUP;

  // Start SoftAP + WebSocket
  localApStart();

  // Update visual/audio feedback
  neopixelSetState(NEO_SETUP);
  buzzerSetPattern(BZR_SETUP_ENTER);

  // Pause detection (but keep sensors reading for GPS)
  detectionReset();
}

static void _exitSetupMode() {
  Serial.println(F("\n═══ EXITING SETUP MODE ═══"));

  // Stop WiFi completely
  localApStop();

  _mode = MODE_ARMED;

  // Resume detection
  detectionReset();

  // Update visual/audio feedback
  neopixelSetState(gpsHasFix() ? NEO_ARMED : NEO_GPS_ACQUIRING);
  buzzerSetPattern(BZR_SETUP_EXIT);

  Serial.println(F("[WEARABLE] Armed and monitoring"));
}

// ── Setup ───────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(SERIAL_BAUD);
  delay(500);

  Serial.println(F("\n╔══════════════════════════════════════════════╗"));
  Serial.println(F("║   Road Accident Monitoring System — Wearable  ║"));
  Serial.println(F("║   PGC Digital Innovation Challenge 2026       ║"));
  Serial.println(F("╚══════════════════════════════════════════════╝\n"));

  // Initialize subsystems in dependency order
  neopixelInit();
  neopixelSetState(NEO_CONNECTING);  // Show "initializing" during boot

  buttonInit();
  buzzerInit();

  // Seed random number generator for token generation
  randomSeed(analogRead(0) ^ millis());

  // Load any existing registration from NVS
  registrationInit();

  // Initialize IMU
  _sensorsOk = sensorsInit();
  if (_sensorsOk) {
    Serial.println(F("[WEARABLE] Calibrating sensors — keep device still..."));
    sensorsCalibrate(200);
    detectionInit();
  } else {
    Serial.println(F("[WEARABLE] [ERROR] IMU init failed! Detection disabled."));
    neopixelSetState(NEO_ERROR);
  }

  // Initialize GPS
  gpsInit();

  // Initialize LoRa
  _loraOk = loraTxInit();
  if (!_loraOk) {
    Serial.println(F("[WEARABLE] [ERROR] LoRa init failed! Transmit disabled."));
  }

  // Set offline map bounds (Tuguegarao City area default)
  // Replace these with your actual map image's GPS corner coordinates
  offlineMapSetBounds(
    17.625f,   // top latitude
    121.715f,  // left longitude
    17.600f,   // bottom latitude
    121.740f,  // right longitude
    800, 600   // image dimensions in pixels
  );

  // Boot into appropriate mode:
  // If not yet registered, automatically boot into setup mode so RAMS_Setup SSID appears immediately!
  if (!registrationIsRegistered()) {
    Serial.println(F("\n[WEARABLE] Device not registered — automatically starting SETUP mode (RAMS_Setup)"));
    _enterSetupMode();
  } else {
    _mode = MODE_ARMED;
    neopixelSetState(NEO_GPS_ACQUIRING);  // Start with GPS acquiring
    Serial.printf("\n[WEARABLE] Boot complete — registered as '%s' (token: %s)\n",
                  registrationGetName().c_str(),
                  registrationGetToken().c_str());
    Serial.println(F("[WEARABLE] Long-press button (3s) anytime to toggle setup mode"));
  }
}

// ── Main Loop ───────────────────────────────────────────────────────────────

void loop() {
  uint32_t now = millis();

  // Always update these regardless of mode
  gpsUpdate();
  buzzerUpdate();
  neopixelUpdate();

  // ── Button Handling ─────────────────────────────────────────────────────
  ButtonEvent btn = buttonUpdate();

  if (btn == BTN_LONG_PRESS) {
    // Toggle between armed and setup modes
    if (_mode == MODE_ARMED) {
      _enterSetupMode();
    } else {
      _exitSetupMode();
    }
  }

  if (btn == BTN_SHORT_PRESS) {
    if (_mode == MODE_ARMED) {
      if (detectionHasActiveAlert()) {
        // Cancel active alert
        Serial.println(F("[WEARABLE] Button pressed — cancelling alert"));
        detectionAcknowledgeAlert();
        buzzerOff();
        neopixelSetState(NEO_ARMED);
        buzzerSetPattern(BZR_CONFIRM);

        // Send false alarm packet
        if (_loraOk) {
          loraSendFalseAlarm(
            registrationGetToken().c_str(),
            gpsGetLatitude(),
            gpsGetLongitude()
          );
        }
      } else {
        // Confirmation chirp (no state change when already armed and no alert)
        buzzerSetPattern(BZR_CONFIRM);
        Serial.println(F("[WEARABLE] Button pressed — system armed, no active alert"));
      }
    }
  }

  // ── Mode-Specific Logic ─────────────────────────────────────────────────

  if (_mode == MODE_ARMED) {
    // ── Armed Mode: Detection + Telemetry ───────────────────────────────

    // Update GPS status LED
    if (gpsHasFix() && !detectionHasActiveAlert()) {
      static bool _wasAcquiring = true;
      if (_wasAcquiring) {
        neopixelSetState(NEO_ARMED);
        _wasAcquiring = false;
        Serial.printf("[WEARABLE] GPS fix acquired: %.6f, %.6f (%d sats)\n",
                      gpsGetLatitude(), gpsGetLongitude(), gpsGetSatellites());
      }
    }

    // Read sensors and run detection (at sensor rate, ~100Hz via MPU DLPF)
    if (_sensorsOk) {
      SensorData data = sensorsRead();
      DetectionResult det = detectionUpdate(data);

      if (det.triggered) {
        // Detection event confirmed — alert!
        Serial.printf("[WEARABLE] [ALERT] eventType=%d peakG=%.2f\n",
                      det.eventType, det.peakAMag);

        neopixelSetState(NEO_ALERT);
        buzzerSetPattern(BZR_ALERT);

        // Send alert packet via LoRa
        if (_loraOk) {
          loraSendAlert(
            registrationGetToken().c_str(),
            gpsGetLatitude(),
            gpsGetLongitude(),
            det.eventType,
            det.peakAMag
          );
        }
      }
    }

    // ── Periodic Telemetry TX ─────────────────────────────────────────────
    if (_loraOk && now - _lastTelemetryMs >= TELEMETRY_INTERVAL_MS) {
      _lastTelemetryMs = now;

      loraSendTelemetry(
        registrationGetToken().c_str(),
        gpsGetLatitude(),
        gpsGetLongitude(),
        _readBattery()
      );
    }

  } else if (_mode == MODE_SETUP) {
    // ── Setup Mode: SoftAP + WebSocket ──────────────────────────────────

    localApUpdate();

    // Push GPS updates to WebSocket clients every 1 second
    if (now - _lastGPSBroadcastMs >= 1000) {
      _lastGPSBroadcastMs = now;
      localApSendGPS(gpsGetLatitude(), gpsGetLongitude(),
                     gpsGetSatellites(), gpsHasFix());
    }

    // Push telemetry (IMU + FSM) at ~20Hz for the /telemetry dashboard.
    // Detection runs passively (state shown but no alerts fired in setup mode).
    static uint32_t _lastTelBroadcastMs = 0;
    if (_sensorsOk && now - _lastTelBroadcastMs >= 50) {
      _lastTelBroadcastMs = now;
      SensorData data = sensorsRead();

      // Run detection passively — lets the FSM state update for the
      // telemetry page visualization without triggering actual alerts.
      detectionUpdate(data);

      localApSendTelemetry(
        data.ax, data.ay, data.az,
        data.gx, data.gy, data.gz,
        data.aMag, (uint8_t)detectionGetFallState()
      );
    }
  }

  // Small delay to prevent watchdog issues and control loop rate
  delay(5);
}
