/*
 * Road Accident Monitoring System — NVS Store (Receiver)
 * ========================================================
 * Persistent WiFi credential storage via ESP32 Preferences API.
 * Same pattern as GuardianTrack's nvs_store.
 */

#ifndef RAMS_NVS_STORE_H
#define RAMS_NVS_STORE_H

#include <Arduino.h>

void   nvsStoreInit();
bool   nvsHasWifiCreds();
String nvsGetWifiSsid();
String nvsGetWifiPass();
void   nvsSaveWifi(const String& ssid, const String& pass);
void   nvsClearWifi();

void     nvsSaveBackend(const String& host, uint16_t port);
String   nvsGetBackendHost();
uint16_t nvsGetBackendPort();
void     nvsClearBackend();

#endif // RAMS_NVS_STORE_H
