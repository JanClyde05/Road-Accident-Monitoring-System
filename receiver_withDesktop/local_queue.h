/*
 * Road Accident Monitoring System — Local Queue (Receiver)
 * ==========================================================
 * Store-and-retry buffer for failed uploads. Uses LittleFS to persist
 * JSON event payloads when WiFi is down, flushes on reconnect.
 *
 * This is the one reliability feature worth the extra dev time, since
 * a receiver that silently drops an alert during a WiFi hiccup is the
 * failure mode that actually matters.
 *
 * Adapted from GuardianTrack's local_queue — stores JSON instead of WAV+meta.
 */

#ifndef RAMS_LOCAL_QUEUE_H
#define RAMS_LOCAL_QUEUE_H

#include <Arduino.h>

void    localQueueInit();

// Queue an event for later upload. All parameters match httpUploadEvent().
bool    localQueueAdd(const char* deviceToken, const char* packetType,
                      float lat, float lon, uint8_t eventType,
                      uint8_t battPct, float aMag,
                      const char* name, const char* photoUrl);

// Attempt to flush queued items. Call periodically in loop().
void    localQueueUpdate();

uint8_t localQueueCount();
void    localQueueClear();

#endif // RAMS_LOCAL_QUEUE_H
