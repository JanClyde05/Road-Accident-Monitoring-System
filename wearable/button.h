/*
 * Road Accident Monitoring System — Button Handler
 * ===================================================
 * Debounced tactile button with short-press and long-press detection.
 *
 * Short press: toggle false-alarm / re-arm during active alert.
 * Long press (3s hold): enter or exit setup mode.
 */

#ifndef RAMS_BUTTON_H
#define RAMS_BUTTON_H

#include <Arduino.h>

enum ButtonEvent : uint8_t {
  BTN_NONE,         // No event this cycle
  BTN_SHORT_PRESS,  // Momentary press — false alarm / re-arm toggle
  BTN_LONG_PRESS    // Held ≥3 seconds — enter/exit setup mode
};

// Initialize button GPIO with internal pull-up.
void buttonInit();

// Poll the button state. Call once per loop() iteration.
// Returns BTN_NONE if no event, otherwise the detected event type.
ButtonEvent buttonUpdate();

#endif // RAMS_BUTTON_H
