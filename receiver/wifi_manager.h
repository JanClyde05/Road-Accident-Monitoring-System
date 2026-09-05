/*
 * Road Accident Monitoring System — WiFi Manager (Receiver)
 * ============================================================
 * Captive portal provisioning + connection management.
 * Adapted from GuardianTrack's WiFi provisioning module.
 *
 * Pattern:
 *   - Boot: try NVS-saved credentials in STA mode
 *   - If no creds or connection fails: start SoftAP + captive portal
 *   - User connects to AP, selects network, enters password
 *   - Switch to AP_STA while trying connection (keep portal alive)
 *   - On success: save creds to NVS, stop AP, stay in STA mode
 */

#ifndef RAMS_WIFI_MANAGER_H
#define RAMS_WIFI_MANAGER_H

#include <Arduino.h>

enum WifiState : uint8_t {
  WIFI_DISCONNECTED,
  WIFI_CONNECTING,
  WIFI_AP_MODE,
  WIFI_CONNECTED
};

void      wifiManagerInit();
void      wifiManagerUpdate();
bool      wifiIsConnected();
String    wifiGetIP();
WifiState wifiGetState();
uint8_t   wifiGetChannel();
void      wifiStartAP();
void      wifiForgetNetwork();

#endif // RAMS_WIFI_MANAGER_H
