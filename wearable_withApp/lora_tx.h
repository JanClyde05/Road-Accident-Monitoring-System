/*
 * Road Accident Monitoring System — LoRa Transmitter
 * =====================================================
 * Sends protocol packets over LoRa using the arduino-LoRa library.
 */

#ifndef RAMS_LORA_TX_H
#define RAMS_LORA_TX_H

#include <Arduino.h>
#include "../shared/protocol.h"

// Initialize LoRa radio (SPI + frequency/SF/BW config).
// Returns false if the SX1278 module isn't responding.
bool loraTxInit();

// Send a telemetry packet with current GPS position and battery level.
bool loraSendTelemetry(const char* token, float lat, float lon, uint8_t battPct = 100);

// Send an alert packet when an accident / crash event occurs.
bool loraSendAlert(const char* token, float lat, float lon, uint8_t eventType, float aMag);

// Send a false-alarm packet when an active alert is cancelled.
bool loraSendFalseAlarm(const char* token, float lat, float lon);

// Send a test packet for bench verification.
bool loraSendTest(const char* token, float lat, float lon);

// Send a rider profile packet with full identification, vehicle, medical, emergency, and photo data.
bool loraSendRiderProfile(const char* token, const char* name, const char* plate,
                          const char* contact, const char* blood,
                          const char* category, const char* emergencyPhone,
                          const char* emergencyName = nullptr,
                          const char* vehicleModel = nullptr,
                          const char* allergies = nullptr,
                          const char* photoUrl = nullptr);

// Send a registration packet with display name and converted Google Drive photo URL
bool loraSendRegister(const char* token, const char* name, const char* driveLinkConverted);

#endif // RAMS_LORA_TX_H
