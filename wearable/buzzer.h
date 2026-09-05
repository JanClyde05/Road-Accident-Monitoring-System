/*
 * Road Accident Monitoring System — Buzzer Driver
 * ==================================================
 * Active buzzer tone patterns for alert feedback.
 * Non-blocking: update() manages timing in the main loop.
 */

#ifndef RAMS_BUZZER_H
#define RAMS_BUZZER_H

#include <Arduino.h>

enum BuzzerPattern : uint8_t {
  BZR_OFF,         // Buzzer silent
  BZR_ALERT,       // Continuous pulsing tone for active alert
  BZR_CONFIRM,     // Short chirp for button acknowledgment
  BZR_SETUP_ENTER, // Double chirp on entering setup mode
  BZR_SETUP_EXIT   // Triple chirp on exiting setup mode
};

void buzzerInit();
void buzzerSetPattern(BuzzerPattern pattern);
void buzzerUpdate();  // Call every loop() iteration
void buzzerOff();     // Immediate silence

#endif // RAMS_BUZZER_H
