/*
 * Road Accident Monitoring System — Buzzer Driver Implementation
 * ================================================================
 * Non-blocking pattern playback for an active buzzer (GPIO-driven).
 * Active buzzer: HIGH = sound, LOW = silence. No PWM/frequency needed.
 *
 * Patterns are defined as arrays of on/off durations. The update()
 * function advances through the pattern based on elapsed time.
 */

#include "buzzer.h"
#include "config.h"

// Pattern format: array of durations in ms, alternating ON/OFF starting with ON.
// Terminated by 0. Pattern repeats from the beginning when complete.

// Alert: 200ms on, 200ms off, repeating — urgent pulsing
static const uint16_t _patAlert[] = { 200, 200, 0 };

// Confirm: single 100ms chirp, then silence
static const uint16_t _patConfirm[] = { 100, 0 };

// Setup enter: two chirps (100 on, 80 off, 100 on, then done)
static const uint16_t _patSetupEnter[] = { 100, 80, 100, 0 };

// Setup exit: three chirps
static const uint16_t _patSetupExit[] = { 80, 60, 80, 60, 80, 0 };

static BuzzerPattern _currentPattern = BZR_OFF;
static const uint16_t* _patData = nullptr;
static uint8_t  _patIdx = 0;
static uint32_t _stepStart = 0;
static bool     _isOn = false;
static bool     _oneShot = false;  // True for non-repeating patterns

void buzzerInit() {
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.printf("[BUZZER] Initialized on GPIO%d\n", BUZZER_PIN);
}

void buzzerSetPattern(BuzzerPattern pattern) {
  if (pattern == _currentPattern && pattern != BZR_CONFIRM) return;

  _currentPattern = pattern;
  _patIdx = 0;
  _stepStart = millis();
  _isOn = false;
  _oneShot = false;

  switch (pattern) {
    case BZR_ALERT:
      _patData = _patAlert;
      break;
    case BZR_CONFIRM:
      _patData = _patConfirm;
      _oneShot = true;
      break;
    case BZR_SETUP_ENTER:
      _patData = _patSetupEnter;
      _oneShot = true;
      break;
    case BZR_SETUP_EXIT:
      _patData = _patSetupExit;
      _oneShot = true;
      break;
    default:
      _patData = nullptr;
      digitalWrite(BUZZER_PIN, LOW);
      return;
  }

  // Start the first step (ON)
  _isOn = true;
  digitalWrite(BUZZER_PIN, HIGH);
}

void buzzerUpdate() {
  if (!_patData || _currentPattern == BZR_OFF) return;

  uint32_t now = millis();
  uint16_t stepDuration = _patData[_patIdx];

  // If we've reached the terminator (0), either repeat or stop
  if (stepDuration == 0) {
    if (_oneShot) {
      buzzerOff();
      return;
    }
    // Loop back to start for repeating patterns
    _patIdx = 0;
    _stepStart = now;
    _isOn = true;
    digitalWrite(BUZZER_PIN, HIGH);
    return;
  }

  // Check if the current step's duration has elapsed
  if (now - _stepStart >= stepDuration) {
    _patIdx++;
    _stepStart = now;
    _isOn = !_isOn;
    digitalWrite(BUZZER_PIN, _isOn ? HIGH : LOW);
  }
}

void buzzerOff() {
  _currentPattern = BZR_OFF;
  _patData = nullptr;
  _isOn = false;
  digitalWrite(BUZZER_PIN, LOW);
}
