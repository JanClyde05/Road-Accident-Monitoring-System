/*
 * Road Accident Monitoring System — WebSocket Stream
 * =====================================================
 * 100Hz JSON streaming of IMU data over WebSocket.
 * No on-device buffering — each sample is sent immediately.
 */

#ifndef RAMS_WS_STREAM_H
#define RAMS_WS_STREAM_H

#include <Arduino.h>
#include "imu_read.h"

void wsStreamInit();
void wsStreamUpdate();    // Call in loop() for WebSocket event processing
bool wsStreamIsConnected();

// Set the trial metadata (sent with every sample)
void wsStreamSetTrial(const String& trialId, const String& label);

// Send a single IMU sample. Call at 100Hz.
void wsStreamSendSample(const IMUSample& sample, uint32_t timestampMs);

#endif // RAMS_WS_STREAM_H
