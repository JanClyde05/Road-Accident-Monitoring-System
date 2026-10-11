/*
 * Road Accident Monitoring System — Button Handler
 * ===================================================
 * Debounced tactile button (GPIO0 onboard button).
 * Pressing cancels an active alert or produces a confirmation chirp.
 */

#ifndef RAMS_BUTTON_H
#define RAMS_BUTTON_H

#include <Arduino.h>

enum ButtonEvent : uint8_t {
  BTN_NONE,
  BTN_PRESSED
};

void buttonInit();
ButtonEvent buttonUpdate();

#endif // RAMS_BUTTON_H
