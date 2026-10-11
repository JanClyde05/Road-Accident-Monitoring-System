/*
 * Road Accident Monitoring System — Alert Detection State
 * ==========================================================
 * Tracks active crash / emergency alerts triggered either by
 * the companion smartphone app via BLE or internal events.
 */

#ifndef RAMS_DETECTION_H
#define RAMS_DETECTION_H

#include <Arduino.h>
#include "../shared/protocol.h"

// Initialize detection state
void detectionInit();

// Reset detection state (clear active alerts)
void detectionReset();

// Returns true if an alert is currently active and unacknowledged
bool detectionHasActiveAlert();

// Mark the current alert as acknowledged (e.g. physical button press or phone cancellation)
void detectionAcknowledgeAlert();

// Trigger an alert (called when phone app detects shock/crash via BLE)
void detectionTriggerAlert(uint8_t eventType, float peakAMag);

// Get current active alert event type (e.g., EVT_FALL, EVT_SKID, EVT_DIRECT_IMPACT)
uint8_t detectionGetEventType();

// Get current active alert peak acceleration (g)
float detectionGetPeakAMag();

#endif // RAMS_DETECTION_H
