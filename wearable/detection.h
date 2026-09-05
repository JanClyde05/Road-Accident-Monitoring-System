/*
 * Road Accident Monitoring System — Accident Detection Logic
 * ============================================================
 * Implements the full detection pipeline from spec §6:
 *   1. Fall FSM (freefall → impact → stillness → confirmed)
 *   2. Skid/slide detection (lateral accel + roll rate)
 *   3. Direct impact (single high-g spike)
 *   4. Environmental (ground shock / wave motion via rolling buffer)
 *
 * All thresholds are defined in config.h as initial literature-based
 * defaults. Run validate_fsm.py against collected data to derive
 * empirically-tuned values, then update config.h constants.
 *
 * The physical button (handled externally) can cancel an active alert.
 */

#ifndef RAMS_DETECTION_H
#define RAMS_DETECTION_H

#include <Arduino.h>
#include "sensors.h"

// ── FSM States ──────────────────────────────────────────────────────────────

enum FallState : uint8_t {
  FS_IDLE,           // Monitoring, no event in progress
  FS_FREEFALL,       // A_m < threshold detected, waiting for sustained duration
  FS_WAIT_IMPACT,    // Freefall confirmed, watching for impact spike
  FS_STILLNESS,      // Impact detected, monitoring for post-impact stillness
  FS_CONFIRMED       // Full sequence complete — fire alert
};

// ── Detection Result ────────────────────────────────────────────────────────
// Returned by detectionUpdate() each loop iteration.
// If triggered==true, the caller should send PKT_ALERT with the given eventType.

struct DetectionResult {
  bool    triggered;    // True if an event was confirmed this iteration
  uint8_t eventType;    // EventType enum value (only valid if triggered==true)
  float   peakAMag;     // Peak A_m that contributed to the detection
};

// Initialize detection state. Call once after sensors are initialized.
void detectionInit();

// Run one detection cycle. Feed the latest sensor reading; the function
// manages all internal state machines and rolling buffers.
// Call this at the sensor's sample rate (~100Hz) for correct timing.
DetectionResult detectionUpdate(const SensorData& data);

// Reset all detection state (FSM back to IDLE, clear buffers).
// Called when the user cancels an alert via the physical button.
void detectionReset();

// Return the current FSM state (for NeoPixel/buzzer status feedback).
FallState detectionGetFallState();

// Returns true if any detection path has an active (unacknowledged) event.
bool detectionHasActiveAlert();

// Mark the current alert as acknowledged (button press cancel).
void detectionAcknowledgeAlert();

#endif // RAMS_DETECTION_H
