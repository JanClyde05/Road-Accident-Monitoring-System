/*
 * Road Accident Monitoring System — Alert Detection State Implementation
 * =========================================================================
 * Manages active alert status, peak G-force, and event types received
 * from the companion mobile app.
 */

#include "detection.h"

static bool    _alertActive = false;
static uint8_t _alertEventType = 0;
static float   _alertPeakAMag = 0.0f;

void detectionInit() {
  detectionReset();
  Serial.println(F("[DETECT] Alert manager initialized"));
}

void detectionReset() {
  _alertActive = false;
  _alertEventType = 0;
  _alertPeakAMag = 0.0f;
}

bool detectionHasActiveAlert() {
  return _alertActive;
}

void detectionAcknowledgeAlert() {
  _alertActive = false;
  Serial.println(F("[DETECT] Alert acknowledged and cleared"));
}

void detectionTriggerAlert(uint8_t eventType, float peakAMag) {
  _alertActive = true;
  _alertEventType = eventType;
  _alertPeakAMag = peakAMag;
  Serial.printf("[DETECT] Alert triggered! Type=%d, Peak=%.2fg\n", eventType, peakAMag);
}

uint8_t detectionGetEventType() {
  return _alertEventType;
}

float detectionGetPeakAMag() {
  return _alertPeakAMag;
}
