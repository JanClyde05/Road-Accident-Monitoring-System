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
bool loraSendTelemetry(const char* token, float lat, float lon, uint8_t battPct);

// Send an alert packet when the detection FSM confirms an event.
bool loraSendAlert(const char* token, float lat, float lon, uint8_t eventType, float aMag);

// Send a false-alarm packet when the user cancels an active alert.
bool loraSendFalseAlarm(const char* token, float lat, float lon);

// Send a test/simulation packet for demo purposes.
bool loraSendTest(const char* token, float lat, float lon);

// Send a registration packet after setup-mode registration completes.
bool loraSendRegister(const char* token, const char* name, const char* photoUrl);

#endif // RAMS_LORA_TX_H
