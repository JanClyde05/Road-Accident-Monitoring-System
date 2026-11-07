/*
 * Road Accident Monitoring System — NVS Store Implementation
 * ============================================================
 * Uses ESP32 Preferences library to persist WiFi credentials
 * across power cycles. Credentials are provisioned via the
 * captive portal on first boot.
 */

#include "nvs_store.h"
#include "config.h"
#include <Preferences.h>

static Preferences _prefs;

void nvsStoreInit() {
  _prefs.begin(NVS_NAMESPACE, false);
  Serial.println(F("[NVS] Store initialized"));
}

bool nvsHasWifiCreds() {
  return _prefs.getString("wifi_ssid", "").length() > 0;
}

String nvsGetWifiSsid() {
  return _prefs.getString("wifi_ssid", "");
}

String nvsGetWifiPass() {
  return _prefs.getString("wifi_pass", "");
}

void nvsSaveWifi(const String& ssid, const String& pass) {
  _prefs.putString("wifi_ssid", ssid);
  _prefs.putString("wifi_pass", pass);
  Serial.print(F("[NVS] Saved WiFi credentials for "));
  Serial.println(ssid);
}

void nvsClearWifi() {
  _prefs.remove("wifi_ssid");
  _prefs.remove("wifi_pass");
  Serial.println(F("[NVS] WiFi credentials cleared"));
}
