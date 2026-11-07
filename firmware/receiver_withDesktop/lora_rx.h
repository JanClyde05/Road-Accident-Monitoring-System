/*
 * Road Accident Monitoring System — LoRa Receiver
 * ==================================================
 * Listens for incoming LoRa packets, deserializes by packet type,
 * and forwards to the HTTP upload module or local queue.
 */

#ifndef RAMS_LORA_RX_H
#define RAMS_LORA_RX_H

#include <Arduino.h>
#include "../shared/protocol.h"

// Initialize LoRa radio in receive mode. Returns false if SX1278 not found.
bool loraRxInit();

// Check for and process any received packet. Call in loop().
// Returns true if a packet was received and processed this cycle.
bool loraRxUpdate();

#endif // RAMS_LORA_RX_H
