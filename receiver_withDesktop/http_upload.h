/*
 * Road Accident Monitoring System — HTTP Upload (Receiver)
 * ==========================================================
 * HTTPS POST JSON payloads to the Netlify backend.
 */

#ifndef RAMS_HTTP_UPLOAD_H
#define RAMS_HTTP_UPLOAD_H

#include <Arduino.h>

void httpUploadInit();

// Upload an event to the backend. Returns true on HTTP 200/201.
// name and photoUrl are only used for PKT_REGISTER packets (nullptr otherwise).
bool httpUploadEvent(const char* deviceToken, const char* packetType,
                     float lat, float lon, uint8_t eventType,
                     uint8_t battPct, float aMag,
                     const char* name, const char* photoUrl);

#endif // RAMS_HTTP_UPLOAD_H
