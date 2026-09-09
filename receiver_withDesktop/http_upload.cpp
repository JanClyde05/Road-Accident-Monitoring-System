/*
 * Road Accident Monitoring System — HTTP Upload Implementation
 * ==============================================================
 * Sends JSON payloads to the Netlify backend via HTTPS POST.
 * Adapted from GuardianTrack's http_upload — switched from multipart
 * audio to JSON body with all event fields.
 *
 * POST /api/upload
 * Body: {
 *   "deviceToken": "ABCD1234",
 *   "packetType": "alert",
 *   "lat": 17.6132, "lon": 121.7270,
 *   "eventType": 0,           // only for alert/test
 *   "battPct": 85,            // only for telemetry
 *   "aMag": 4.5,              // only for alert/test
 *   "name": "Juan",           // only for register
 *   "driveLinkConverted": "https://...",  // only for register
 *   "timestamp": 1234567890
 * }
 */

#include "http_upload.h"
#include "config.h"

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

void httpUploadInit() {
  Serial.println(F("[HTTP] Upload client initialized"));
}

bool httpUploadEvent(const char* deviceToken, const char* packetType,
                     float lat, float lon, uint8_t eventType,
                     uint8_t battPct, float aMag,
                     const char* name, const char* photoUrl) {

  String url = String(BACKEND_URL) + String(UPLOAD_ENDPOINT);
  Serial.printf("[HTTP] Uploading %s event to %s\n", packetType, url.c_str());

  // Build JSON body
  JsonDocument doc;
  doc["deviceToken"] = deviceToken;
  doc["packetType"] = packetType;
  doc["timestamp"] = millis();

  // Include fields based on packet type
  String pType = String(packetType);

  if (pType == "telemetry") {
    doc["lat"] = lat;
    doc["lon"] = lon;
    doc["battPct"] = battPct;
  } else if (pType == "alert" || pType == "test") {
    doc["lat"] = lat;
    doc["lon"] = lon;
    doc["eventType"] = eventType;
    doc["aMag"] = aMag;
  } else if (pType == "false_alarm") {
    doc["lat"] = lat;
    doc["lon"] = lon;
  } else if (pType == "register") {
    if (name) doc["name"] = name;
    if (photoUrl) doc["driveLinkConverted"] = photoUrl;
  }

  String jsonBody;
  serializeJson(doc, jsonBody);

  // Send HTTPS POST
  HTTPClient http;
  http.setTimeout(HTTP_TIMEOUT_MS);
  bool success = false;

  if (url.startsWith("https://")) {
    WiFiClientSecure secureClient;
    secureClient.setInsecure();  // Skip cert verification for Netlify

    if (http.begin(secureClient, url)) {
      http.addHeader("Content-Type", "application/json");

      int httpCode = http.POST(jsonBody);

      if (httpCode == 200 || httpCode == 201) {
        String response = http.getString();
        Serial.printf("[HTTP] Upload success! Code: %d\n", httpCode);
        Serial.printf("[HTTP] Response: %s\n", response.c_str());
        success = true;
      } else {
        Serial.printf("[HTTP] Upload failed! Code: %d\n", httpCode);
        if (httpCode > 0) {
          Serial.printf("[HTTP] Response: %s\n", http.getString().c_str());
        }
      }
      http.end();
    } else {
      Serial.println(F("[HTTP] HTTPS connection init failed!"));
    }
  } else {
    // HTTP (non-secure) for local dev
    WiFiClient plainClient;
    if (http.begin(plainClient, url)) {
      http.addHeader("Content-Type", "application/json");

      int httpCode = http.POST(jsonBody);

      if (httpCode == 200 || httpCode == 201) {
        Serial.printf("[HTTP] Upload success! Code: %d\n", httpCode);
        success = true;
      } else {
        Serial.printf("[HTTP] Upload failed! Code: %d\n", httpCode);
      }
      http.end();
    }
  }

  return success;
}
