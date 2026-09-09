/*
 * Road Accident Monitoring System — Local SoftAP + WebSocket (Setup Mode)
 * =========================================================================
 * Provides the wearable's setup-mode network: a local WiFi access point
 * with a WebSocket server. Only active when the user long-presses the
 * button to enter setup mode — WiFi radio is OFF during normal armed
 * operation (this is load-bearing for the "no cellular/data plan" pitch).
 *
 * Serves three pages:
 *   1. Registration form  (/)         — handled by registration.cpp
 *   2. Offline live map   (/map)      — handled by offline_map.cpp
 *   3. Telemetry dashboard (/telemetry) — live IMU, FSM state, GPS + map
 *
 * WebSocket pushes two types of data to connected clients:
 *   GPS:  {"type":"gps","lat":...,"lon":...,"sats":...,"fix":true}
 *   TEL:  {"type":"tel","ax":...,"ay":...,"az":...,"gx":...,"gy":...,"gz":...,"am":...,"fsm":0}
 */

#ifndef RAMS_LOCAL_AP_H
#define RAMS_LOCAL_AP_H

#include <Arduino.h>

// Start the SoftAP and WebSocket server. Call when entering setup mode.
void localApStart();

// Stop the SoftAP and turn off the WiFi radio. Call when exiting setup mode.
void localApStop();

// Process WebSocket events. Call in loop() while setup mode is active.
void localApUpdate();

// Returns true if the AP is currently active.
bool localApIsActive();

// Broadcast a GPS coordinate update to all connected WebSocket clients.
void localApSendGPS(float lat, float lon, uint8_t satellites, bool hasFix);

// Broadcast live telemetry (IMU + FSM state) to all connected WebSocket clients.
// Called at ~20Hz from the main loop during setup mode for live diagnostics.
void localApSendTelemetry(float ax, float ay, float az,
                          float gx, float gy, float gz,
                          float aMag, uint8_t fsmState);

#endif // RAMS_LOCAL_AP_H

