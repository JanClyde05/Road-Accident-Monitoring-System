/*
 * Road Accident Monitoring System — Button Handler Implementation
 * =================================================================
 * Debounced onboard button on GPIO0 (internal pull-up, active LOW).
 */

#include "button.h"
#include "config.h"

static bool     _lastStable = HIGH;
static bool     _lastRaw = HIGH;
static uint32_t _debounceTime = 0;
static bool     _pressed = false;

void buttonInit() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  _lastStable = digitalRead(BUTTON_PIN);
  _lastRaw = _lastStable;
  Serial.printf("[BUTTON] Initialized on GPIO%d (active LOW)\n", BUTTON_PIN);
}

ButtonEvent buttonUpdate() {
  bool currentRaw = digitalRead(BUTTON_PIN);
  uint32_t now = millis();

  // Debounce check
  if (currentRaw != _lastRaw) {
    _debounceTime = now;
    _lastRaw = currentRaw;
  }

  if ((now - _debounceTime) < BUTTON_DEBOUNCE_MS) {
    return BTN_NONE;
  }

  bool stable = currentRaw;

  // Detect falling edge (HIGH -> LOW, button pressed)
  if (stable == LOW && _lastStable == HIGH) {
    _lastStable = stable;
    _pressed = true;
    return BTN_PRESSED;
  }

  // Detect rising edge (LOW -> HIGH, button released)
  if (stable == HIGH && _lastStable == LOW) {
    _lastStable = stable;
    _pressed = false;
    return BTN_NONE;
  }

  _lastStable = stable;
  return BTN_NONE;
}
