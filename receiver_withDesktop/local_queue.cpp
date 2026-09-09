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

// ── Helpers ─────────────────────────────────────────────────────────────────

static String _filePath(uint8_t idx) {
  return String(QUEUE_DIR) + "/" + String(idx) + ".json";
}

static void _recount() {
  _queueCount = 0;
  for (uint8_t i = 0; i < MAX_QUEUED; i++) {
    if (LittleFS.exists(_filePath(i))) {
      _queueCount++;
    }
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

void localQueueInit() {
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

    // Extract fields and attempt upload
    const char* token = doc["deviceToken"] | "";
    const char* pType = doc["packetType"] | "";
    float lat = doc["lat"] | 0.0f;
    float lon = doc["lon"] | 0.0f;
    uint8_t eventType = doc["eventType"] | 0;
    uint8_t battPct = doc["battPct"] | 0;
    float aMag = doc["aMag"] | 0.0f;
    const char* name = doc["name"] | (const char*)nullptr;
    const char* photoUrl = doc["driveLinkConverted"] | (const char*)nullptr;

    bool success = httpUploadEvent(token, pType, lat, lon,
                                   eventType, battPct, aMag,
                                   name, photoUrl);

    if (success) {
      LittleFS.remove(_filePath(i));
      Serial.printf("[QUEUE] Item %d uploaded and removed\n", i);
    } else {
      Serial.printf("[QUEUE] Item %d retry failed\n", i);
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
