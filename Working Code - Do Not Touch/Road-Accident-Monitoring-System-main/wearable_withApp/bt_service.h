/*
 * Road Accident Monitoring System — Wearable Bluetooth Service (BLE)
 * ===================================================================
 * Bluetooth Low Energy (BLE 5.0) peripheral service for ESP32-S3.
 *
 * Bidirectional communication with the RAMS Android Mobile App:
 *   - Device discovery & advertisement under RAMS_BT_DEVICE_NAME ("RAMS Wearable")
 *   - Standard Nordic UART Service (NUS) GATT profile
 *   - Ingests GPS & IMU telemetry, emergency alerts, and false-alarm cancellations
 *   - Transmits button alert cancellations and acknowledgments back to the phone
 */

#ifndef RAMS_BT_SERVICE_H
#define RAMS_BT_SERVICE_H

#include <Arduino.h>

// Standard Nordic UART Service (NUS) UUIDs
#define RAMS_NUS_SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define RAMS_NUS_RX_CHARACTERISTIC_UUID "6E400002-B5A3-F393-E0A9-E50E24DCCA9E" // Phone -> ESP32 (Write)
#define RAMS_NUS_TX_CHARACTERISTIC_UUID "6E400003-B5A3-F393-E0A9-E50E24DCCA9E" // ESP32 -> Phone (Notify)

// Initialize Bluetooth Low Energy and start peripheral advertising
void btServiceInit();

// Main loop updater — keeps advertising alive after disconnect
void btServiceUpdate();

// Returns true if a phone is actively connected via BLE GATT
bool btServiceIsConnected();

// Broadcast generic JSON / text string over BLE to connected phone
void btServiceSendText(const String& text);

// Device token getters/setters (synced dynamically from companion phone app)
const char* btServiceGetDeviceToken();
void btServiceSetDeviceToken(const char* token);

#endif // RAMS_BT_SERVICE_H
