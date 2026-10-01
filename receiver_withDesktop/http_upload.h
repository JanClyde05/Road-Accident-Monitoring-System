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

// Upload a rider profile packet to the backend. Returns true on HTTP 200/201.
// Sends full identification, vehicle, medical, and emergency contact data.
bool httpUploadRiderProfile(const char* deviceToken,
                            const char* riderName, const char* plate,
                            const char* contact,   const char* blood,
                            const char* category,  const char* emergencyPhone,
                            const char* emergencyContactName = nullptr,
                            const char* vehicleModel = nullptr,
                            const char* allergies = nullptr,
                            const char* photoUrl = nullptr);

#endif // RAMS_HTTP_UPLOAD_H
