/*
 * Road Accident Monitoring System — Local Queue Implementation
 * ==============================================================
 * Persists JSON event payloads to LittleFS when WiFi is unavailable.
 * Each queued item is a .json file containing the full upload payload.
 * Periodically retries uploads when WiFi reconnects.
 *
 * Queue capacity: 10 items max (limited by flash space).
 * When full: drops oldest item to make room.
 */

#include "local_queue.h"
#include "config.h"
#include "http_upload.h"
#include "wifi_manager.h"
#include <LittleFS.h>
#include <ArduinoJson.h>

#define QUEUE_DIR    "/queue"
#define MAX_QUEUED   10

static uint32_t _lastRetryMs = 0;
static uint8_t  _queueCount  = 0;
static bool     _fsReady     = false;

// ── Helpers ─────────────────────────────────────────────────────────────────

static String _filePath(uint8_t idx) {
  return String(QUEUE_DIR) + "/" + String(idx) + ".json";
}

static void _recount() {
  _queueCount = 0;
  if (!_fsReady) return;
  for (uint8_t i = 0; i < MAX_QUEUED; i++) {
    if (LittleFS.exists(_filePath(i))) {
      _queueCount++;
    }
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

void localQueueInit() {
  _fsReady = LittleFS.begin(false);
  if (!_fsReady) {
    Serial.println(F("[QUEUE] LittleFS not available, offline retry queue disabled"));
    return;
  }
  if (!LittleFS.exists(QUEUE_DIR)) {
    LittleFS.mkdir(QUEUE_DIR);
  }
  _recount();
  Serial.printf("[QUEUE] Initialized, %u pending items\n", _queueCount);
}

bool localQueueAdd(const char* deviceToken, const char* packetType,
                   float lat, float lon, uint8_t eventType,
                   uint8_t battPct, float aMag,
                   const char* name, const char* photoUrl) {

  if (!_fsReady) return false;

  // Find an empty slot
  int slot = -1;
  for (uint8_t i = 0; i < MAX_QUEUED; i++) {
    if (!LittleFS.exists(_filePath(i))) {
      slot = i;
      break;
    }
  }

  if (slot < 0) {
    // Queue full — drop oldest (slot 0) and shift
    Serial.println(F("[QUEUE] Queue full! Dropping oldest..."));
    LittleFS.remove(_filePath(0));
    for (uint8_t i = 1; i < MAX_QUEUED; i++) {
      if (LittleFS.exists(_filePath(i))) {
        LittleFS.rename(_filePath(i), _filePath(i - 1));
      }
    }
    slot = _queueCount - 1;
    if (slot < 0) slot = 0;
  }

  // Build JSON payload
  JsonDocument doc;
  doc["deviceToken"] = deviceToken;
  doc["packetType"] = packetType;
  doc["lat"] = lat;
  doc["lon"] = lon;
  doc["eventType"] = eventType;
  doc["battPct"] = battPct;
  doc["aMag"] = aMag;
  doc["timestamp"] = millis();
  if (name) doc["name"] = name;
  if (photoUrl) doc["driveLinkConverted"] = photoUrl;

  // Write to file
  File f = LittleFS.open(_filePath(slot), "w");
  if (!f) {
    Serial.println(F("[QUEUE] Failed to write queue file!"));
    return false;
  }
  serializeJson(doc, f);
  f.close();

  _recount();
  Serial.printf("[QUEUE] Queued item %d (%s). Total: %u\n",
                slot, packetType, _queueCount);
  return true;
}

bool localQueueAddRiderProfile(const char* deviceToken, const char* name,
                              const char* plate, const char* contact,
                              const char* blood, const char* category,
                              const char* emergencyPhone,
                              const char* emergencyContactName,
                              const char* vehicleModel,
                              const char* allergies,
                              const char* photoUrl) {
  if (!_fsReady) return false;

  // Find an empty slot
  int slot = -1;
  for (uint8_t i = 0; i < MAX_QUEUED; i++) {
    if (!LittleFS.exists(_filePath(i))) {
      slot = i;
      break;
    }
  }

  if (slot < 0) {
    // Queue full — drop oldest (slot 0) and shift
    Serial.println(F("[QUEUE] Queue full! Dropping oldest for rider profile..."));
    LittleFS.remove(_filePath(0));
    for (uint8_t i = 1; i < MAX_QUEUED; i++) {
      if (LittleFS.exists(_filePath(i))) {
        LittleFS.rename(_filePath(i), _filePath(i - 1));
      }
    }
    slot = _queueCount - 1;
    if (slot < 0) slot = 0;
  }

  // Build JSON payload for rider profile
  JsonDocument doc;
  doc["deviceToken"] = deviceToken;
  doc["packetType"] = "rider_profile";
  doc["name"] = name;
  doc["plate"] = plate;
  doc["contact"] = contact;
  doc["blood"] = blood;
  doc["category"] = category;
  doc["emergencyPhone"] = emergencyPhone;
  if (emergencyContactName && strlen(emergencyContactName) > 0) doc["emergencyContactName"] = emergencyContactName;
  if (vehicleModel && strlen(vehicleModel) > 0) doc["vehicleModel"] = vehicleModel;
  if (allergies && strlen(allergies) > 0) doc["allergies"] = allergies;
  if (photoUrl && strlen(photoUrl) > 0) doc["photoUrl"] = photoUrl;
  doc["timestamp"] = millis();

  // Write to file
  File f = LittleFS.open(_filePath(slot), "w");
  if (!f) {
    Serial.println(F("[QUEUE] Failed to write rider profile queue file!"));
    return false;
  }
  serializeJson(doc, f);
  f.close();

  _recount();
  Serial.printf("[QUEUE] Queued rider profile item %d. Total: %u\n", slot, _queueCount);
  return true;
}

void localQueueUpdate() {
  if (_queueCount == 0) return;
  if (!wifiIsConnected()) return;
  if (millis() - _lastRetryMs < UPLOAD_RETRY_INTERVAL_MS) return;

  _lastRetryMs = millis();
  Serial.printf("[QUEUE] Retrying %u queued uploads...\n", _queueCount);

  for (uint8_t i = 0; i < MAX_QUEUED; i++) {
    if (!LittleFS.exists(_filePath(i))) continue;

    // Read the JSON payload
    File f = LittleFS.open(_filePath(i), "r");
    if (!f) continue;

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, f);
    f.close();

    if (err) {
      Serial.printf("[QUEUE] Item %d has invalid JSON, removing\n", i);
      LittleFS.remove(_filePath(i));
      continue;
    }

    const char* token = doc["deviceToken"] | "";
    const char* pType = doc["packetType"] | "";
    bool success = false;

    if (strcmp(pType, "rider_profile") == 0) {
      const char* name = doc["name"] | "";
      const char* plate = doc["plate"] | "";
      const char* contact = doc["contact"] | "";
      const char* blood = doc["blood"] | "";
      const char* category = doc["category"] | "";
      const char* emergencyPhone = doc["emergencyPhone"] | "";
      const char* emerName = doc["emergencyContactName"] | "";
      const char* vehicle = doc["vehicleModel"] | "";
      const char* allergies = doc["allergies"] | "";
      const char* photo = doc["photoUrl"] | "";
      success = httpUploadRiderProfile(token, name, plate, contact, blood, category, emergencyPhone,
                                      emerName, vehicle, allergies, photo);
    } else {
      // Extract fields and attempt upload for normal event
      float lat = doc["lat"] | 0.0f;
      float lon = doc["lon"] | 0.0f;
      uint8_t eventType = doc["eventType"] | 0;
      uint8_t battPct = doc["battPct"] | 0;
      float aMag = doc["aMag"] | 0.0f;
      const char* name = doc["name"] | (const char*)nullptr;
      const char* photoUrl = doc["driveLinkConverted"] | (const char*)nullptr;

      success = httpUploadEvent(token, pType, lat, lon,
                                     eventType, battPct, aMag,
                                     name, photoUrl);
    }

    if (success) {
      LittleFS.remove(_filePath(i));
      Serial.printf("[QUEUE] Item %d (%s) uploaded and removed\n", i, pType);
    } else {
      Serial.printf("[QUEUE] Item %d (%s) retry failed\n", i, pType);
      // Don't purge on failure — will retry next cycle
    }
  }

  _recount();
}

uint8_t localQueueCount() {
  return _queueCount;
}

void localQueueClear() {
  for (uint8_t i = 0; i < MAX_QUEUED; i++) {
    if (LittleFS.exists(_filePath(i))) {
      LittleFS.remove(_filePath(i));
    }
  }
  _recount();
  Serial.println(F("[QUEUE] All queued items cleared"));
}
