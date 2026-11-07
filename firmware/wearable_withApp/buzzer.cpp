/*
 * Road Accident Monitoring System — Buzzer Driver Implementation
 * ================================================================
 * Non-blocking pattern playback for an active buzzer on GPIO1.
 */

#include "buzzer.h"
#include "config.h"

// Alert: 200ms on, 200ms off, repeating — urgent pulsing
static const uint16_t _patAlert[] = { 200, 200, 0 };

// Confirm: single 80ms chirp, then silence
static const uint16_t _patConfirm[] = { 80, 0 };

static BuzzerPattern _currentPattern = BZR_OFF;
static const uint16_t* _patData = nullptr;
static uint8_t  _patIdx = 0;
static uint32_t _stepStart = 0;
static bool     _isOn = false;
static bool     _oneShot = false;

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

  // If terminator reached (0)
  if (stepDuration == 0) {
    if (_oneShot) {
      buzzerOff();
      return;
    }
    // Loop back for repeating alert
    _patIdx = 0;
    _stepStart = now;
    _isOn = true;
    digitalWrite(BUZZER_PIN, HIGH);
    return;
  }

  // Check elapsed duration
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
