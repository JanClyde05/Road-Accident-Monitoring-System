/*
 * Road Accident Monitoring System — Button Handler Implementation
 * =================================================================
 * Debounced tactile button on GPIO2 (internal pull-up, active LOW).
 *
 * Detection approach: track press duration. On release, if held less
 * than LONG_PRESS threshold → short press. If held beyond threshold →
 * long press fires immediately (don't wait for release, so the user
 * gets immediate feedback via buzzer/LED).
 */

#include "button.h"
#include "config.h"

static bool     _lastStable = HIGH;   // Debounced state (HIGH = released, pulled up)
static bool     _lastRaw = HIGH;
static uint32_t _debounceTime = 0;
static uint32_t _pressStart = 0;
static bool     _pressed = false;
static bool     _longFired = false;   // Prevent repeated long-press events per hold

void buttonInit() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  _lastStable = digitalRead(BUTTON_PIN);
  _lastRaw = _lastStable;
  Serial.printf("[BUTTON] Initialized on GPIO%d (pull-up, active LOW)\n", BUTTON_PIN);
}

ButtonEvent buttonUpdate() {
  bool currentRaw = digitalRead(BUTTON_PIN);
  uint32_t now = millis();

  // Debounce: only accept a state change if it's been stable for DEBOUNCE_MS
  if (currentRaw != _lastRaw) {
    _debounceTime = now;
    _lastRaw = currentRaw;
  }

  if ((now - _debounceTime) < BUTTON_DEBOUNCE_MS) {
    return BTN_NONE;  // Still bouncing
  }

  bool stable = currentRaw;

  // Detect press edge (HIGH → LOW, since active-low with pull-up)
  if (stable == LOW && _lastStable == HIGH) {
    _pressed = true;
    _pressStart = now;
    _longFired = false;
    _lastStable = stable;
    return BTN_NONE;
  }

  // While held: check for long press threshold
  if (_pressed && stable == LOW && !_longFired) {
    if (now - _pressStart >= BUTTON_LONG_PRESS_MS) {
      _longFired = true;
      _lastStable = stable;
      return BTN_LONG_PRESS;
    }
  }

  // Detect release edge (LOW → HIGH)
  if (stable == HIGH && _lastStable == LOW) {
    _lastStable = stable;
    if (_pressed && !_longFired) {
      _pressed = false;
      return BTN_SHORT_PRESS;
    }
    _pressed = false;
    return BTN_NONE;
  }

  _lastStable = stable;
  return BTN_NONE;
}
