/*
 * Road Accident Monitoring System — Wearable Bluetooth Service (BLE)
 * ===================================================================
 * BLE GATT peripheral implementation for ESP32-S3.
 */

#include "bt_service.h"
#include "config.h"
#include "detection.h"
#include "buzzer.h"
#include "neopixel.h"
#include "gps.h"
#include "lora_tx.h"
#include "../shared/protocol.h"

#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

static BLEServer* _pServer = nullptr;
static BLECharacteristic* _pTxCharacteristic = nullptr;
static bool _deviceConnected = false;
static bool _oldDeviceConnected = false;
static char _deviceToken[9] = DEFAULT_DEVICE_TOKEN;
static String _rxBuffer = "";

static void _processIncomingMessage(const String& msg);

class RamsServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) override {
    _deviceConnected = true;
    Serial.println(F("\n[BT] Companion Android Phone connected via BLE!"));
    neopixelSetState(NEO_ARMED);
    buzzerSetPattern(BZR_CONFIRM);
  }

  void onDisconnect(BLEServer* pServer) override {
    _deviceConnected = false;
    Serial.println(F("\n[BT] Phone disconnected from BLE"));
    neopixelSetState(NEO_CONNECTING);
  }
};

class RamsRxCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) override {
    String chunk = pCharacteristic->getValue().c_str();
    if (chunk.length() > 0) {
      _rxBuffer += chunk;

      // Resynchronize: If buffer has leading garbage before '{', strip it
      int firstBrace = _rxBuffer.indexOf('{');
      if (firstBrace > 0) {
        _rxBuffer = _rxBuffer.substring(firstBrace);
      }

      // Process any complete messages terminated by newline
      int newlineIdx = _rxBuffer.indexOf('\n');
      while (newlineIdx >= 0) {
        String completeMsg = _rxBuffer.substring(0, newlineIdx);
        _rxBuffer = _rxBuffer.substring(newlineIdx + 1);
        completeMsg.trim();
        if (completeMsg.length() > 0) {
          int bIdx = completeMsg.indexOf('{');
          if (bIdx > 0) {
            completeMsg = completeMsg.substring(bIdx);
          }
          Serial.printf("[BT-RX] Ingested message (%d bytes)\n", completeMsg.length());
          _processIncomingMessage(completeMsg);
        }
        newlineIdx = _rxBuffer.indexOf('\n');
      }

      // If buffer contains a standalone JSON object without newline
      if (_rxBuffer.startsWith("{") && _rxBuffer.endsWith("}")) {
        Serial.printf("[BT-RX] Ingested JSON object (%d bytes)\n", _rxBuffer.length());
        _processIncomingMessage(_rxBuffer);
        _rxBuffer = "";
      }

      // Safety: clear buffer if it grows too large without valid delimiter
      if (_rxBuffer.length() > 2048) {
        _rxBuffer = "";
      }
    }
  }
};

static uint32_t _lastTelemetryPrintMs = 0;
static const uint32_t TELEMETRY_PRINT_INTERVAL_MS = 5000; // Pretty-print every 5s to avoid flooding
static uint32_t _lastProfileBroadcastMs = 0;
static const uint32_t PROFILE_BROADCAST_INTERVAL_MS = 30000; // Broadcast rider profile at most every 30s

static void _processIncomingMessage(const String& msg) {
  // 1. False Alarm Dismissal / Alert Cancellation
  if (msg.indexOf("CANCEL_ALERT") >= 0 || msg.indexOf("DISMISS_FALSE_ALARM") >= 0) {
    Serial.println(F("[BT] Alert cancellation received from phone"));
    detectionAcknowledgeAlert();
    buzzerOff();
    neopixelSetState(NEO_ARMED);
    buzzerSetPattern(BZR_CONFIRM);

    // Broadcast false alarm packet over SX1278 LoRa
    loraSendFalseAlarm(
      _deviceToken,
      gpsGetLatitude(),
      gpsGetLongitude()
    );

    btServiceSendText(F("{\"type\":\"CANCEL_ALERT_ACK\",\"status\":\"OK\"}\n"));
    return;
  }

  // 2. Phone GPS & IMU Telemetry Stream / Emergency Alert
  if (msg.indexOf("\"lat\":") >= 0 || msg.indexOf("TELEMETRY") >= 0 || msg.indexOf("EMERGENCY") >= 0 || msg.indexOf("\"type\":\"TEL\"") >= 0) {
    DynamicJsonDocument doc(3072);
    DeserializationError err = deserializeJson(doc, msg);
    if (!err) {
      // Sync rider token from mobile app
      const char* token = doc["token"] | "";
      if (token && strlen(token) > 0) {
        strncpy(_deviceToken, token, sizeof(_deviceToken) - 1);
        _deviceToken[sizeof(_deviceToken) - 1] = '\0';
      }

      // Extract all fields from phone telemetry
      float lat   = doc["lat"]   | 0.0f;
      float lon   = doc["lon"]   | 0.0f;
      float spd   = doc["spd"]   | 0.0f;
      float alt   = doc["alt"]   | 0.0f;
      float hdg   = doc["hdg"]   | 0.0f;
      float ax    = doc["ax"]    | 0.0f;
      float ay    = doc["ay"]    | 0.0f;
      float az    = doc["az"]    | 0.0f;
      float amag  = doc["amag"]  | 1.0f;
      float gx    = doc["gx"]    | 0.0f;
      float gy    = doc["gy"]    | 0.0f;
      float gz    = doc["gz"]    | 0.0f;
      float pitch = doc["pitch"] | 0.0f;
      float roll  = doc["roll"]  | 0.0f;
      int   shock = doc["shock"] | 0;

      const char* rider     = doc["rider"]   | "";
      const char* plate     = doc["plate"]   | "";
      const char* contact   = doc["contact"] | "";
      const char* blood     = doc["blood"]   | "";
      const char* type      = doc["type"]    | "";
      const char* vehicle   = doc["vehicleModel"] | "";
      const char* emerName  = doc["emergencyContactName"] | "";
      const char* allergies = doc["allergies"] | "";
      const char* photo     = doc["photoUrl"] | doc["driveLink"] | "";

      // Update GPS from phone
      if (lat != 0.0f || lon != 0.0f) {
        gpsSetExternalLocation(lat, lon, 10, true, spd, alt);
      }

      // ── Broadcast rider profile over LoRa to base station (throttled) ─────
      // Ensures rider identity flows: Phone → BLE → Wearable → LoRa → Receiver → Desktop
      uint32_t now = millis();
      if (strlen(rider) > 0 && (now - _lastProfileBroadcastMs >= PROFILE_BROADCAST_INTERVAL_MS)) {
        _lastProfileBroadcastMs = now;
        const char* cat = doc["category"] | (strlen(contact) > 0 ? "Motorcycle" : "");
        const char* emergencyPh = doc["emergencyPhone"] | "";
        loraSendRiderProfile(_deviceToken, rider, plate, contact, blood, cat, emergencyPh,
                             emerName, vehicle, allergies, photo);
      }

      // ── Pretty-print received data to Serial Monitor (throttled) ──────
      if (now - _lastTelemetryPrintMs >= TELEMETRY_PRINT_INTERVAL_MS) {
        _lastTelemetryPrintMs = now;

        Serial.println(F("\n┌────────────────────────────────────────────────────┐"));
        Serial.println(F("│         PHONE → WEARABLE BLE TELEMETRY DATA        │"));
        Serial.println(F("├────────────────────────────────────────────────────┤"));

        // Rider Profile Info
        Serial.println(F("│  ▸ RIDER PROFILE                                   │"));
        Serial.printf( "│    Token    : %-36s │\n", _deviceToken);
        Serial.printf( "│    Name     : %-36s │\n", (strlen(rider) > 0)     ? rider     : "(not set)");
        Serial.printf( "│    Plate    : %-36s │\n", (strlen(plate) > 0)     ? plate     : "(not set)");
        Serial.printf( "│    Contact  : %-36s │\n", (strlen(contact) > 0)   ? contact   : "(not set)");
        Serial.printf( "│    Blood    : %-36s │\n", (strlen(blood) > 0)     ? blood     : "(not set)");
        Serial.printf( "│    Vehicle  : %-36s │\n", (strlen(vehicle) > 0)   ? vehicle   : "(not set)");
        Serial.printf( "│    EmergName: %-36s │\n", (strlen(emerName) > 0)  ? emerName  : "(not set)");
        Serial.printf( "│    Allergies: %-36s │\n", (strlen(allergies) > 0) ? allergies : "(not set)");
        Serial.printf( "│    Photo URL: %-36s │\n", (strlen(photo) > 0)     ? "SET (GDrive 2x2)" : "(not set)");

        Serial.println(F("├────────────────────────────────────────────────────┤"));

        // GPS Data
        Serial.println(F("│  ▸ GPS LOCATION                                    │"));
        Serial.printf( "│    Latitude  : %12.6f°                       │\n", lat);
        Serial.printf( "│    Longitude : %12.6f°                       │\n", lon);
        Serial.printf( "│    Altitude  : %8.1f m                           │\n", alt);
        Serial.printf( "│    Speed     : %8.1f km/h                        │\n", spd);
        Serial.printf( "│    Heading   : %8.1f°                            │\n", hdg);
        Serial.printf( "│    GPS Fix   : %-36s │\n", gpsHasFix() ? "YES (3D Fix)" : "NO (Searching)");

        Serial.println(F("├────────────────────────────────────────────────────┤"));

        // IMU Accelerometer Data
        Serial.println(F("│  ▸ IMU ACCELEROMETER                               │"));
        Serial.printf( "│    Accel X   : %+8.2f g                          │\n", ax);
        Serial.printf( "│    Accel Y   : %+8.2f g                          │\n", ay);
        Serial.printf( "│    Accel Z   : %+8.2f g                          │\n", az);
        Serial.printf( "│    Magnitude : %8.2f g                           │\n", amag);

        Serial.println(F("├────────────────────────────────────────────────────┤"));

        // IMU Gyroscope Data
        Serial.println(F("│  ▸ IMU GYROSCOPE                                   │"));
        Serial.printf( "│    Gyro X    : %+8.1f °/s                        │\n", gx);
        Serial.printf( "│    Gyro Y    : %+8.1f °/s                        │\n", gy);
        Serial.printf( "│    Gyro Z    : %+8.1f °/s                        │\n", gz);
        Serial.printf( "│    Pitch     : %+8.1f°                           │\n", pitch);
        Serial.printf( "│    Roll      : %+8.1f°                           │\n", roll);

        Serial.println(F("├────────────────────────────────────────────────────┤"));

        // Status
        Serial.printf( "│  Shock Alert : %-4s    LoRa: %-22s │\n",
                        shock ? "YES" : "NO",
                        "TX Ready");
        Serial.println(F("└────────────────────────────────────────────────────┘"));
      }

      // Check for Shock / Crash / Emergency detection
      if (shock == 1 || strcmp(type, "EMERGENCY_ALERT") == 0 || strcmp(type, "alert") == 0) {
        Serial.printf("[BT] *** EMERGENCY CRASH ALERT from phone! Peak=%.2fg ***\n", amag);
        detectionTriggerAlert(PKT_ALERT, amag);
        neopixelSetState(NEO_ALERT);
        buzzerSetPattern(BZR_ALERT);
        loraSendAlert(_deviceToken, lat, lon, PKT_ALERT, amag);
      }
    } else {
      Serial.printf("[BT] JSON parse error: %s (len=%d: %.80s)\n", err.c_str(), msg.length(), msg.c_str());
    }
    return;
  }

  // 3. Ping
  if (msg.indexOf("PING") >= 0 || msg.indexOf("ping") >= 0) {
    Serial.println(F("[BT] PING received, replying PONG"));
    btServiceSendText(F("{\"type\":\"PONG\"}\n"));
    return;
  }

  // 4. Unknown message (log it for debugging)
  Serial.printf("[BT] Unknown message received (%d bytes): %.80s%s\n",
                msg.length(), msg.c_str(), msg.length() > 80 ? "..." : "");
}

void btServiceInit() {
  Serial.println(F("[BT] Initializing BLE for RAMS Wearable..."));

  // Initialize BLE Stack
  BLEDevice::init(RAMS_BT_DEVICE_NAME);
  BLEDevice::setMTU(512);

  // Create GATT Server
  _pServer = BLEDevice::createServer();
  _pServer->setCallbacks(new RamsServerCallbacks());

  // Create Nordic UART Service (NUS)
  BLEService* pService = _pServer->createService(RAMS_NUS_SERVICE_UUID);

  // TX Characteristic (ESP32 -> Phone Notify)
  _pTxCharacteristic = pService->createCharacteristic(
    RAMS_NUS_TX_CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_NOTIFY
  );
  _pTxCharacteristic->addDescriptor(new BLE2902());

  // RX Characteristic (Phone -> ESP32 Write)
  BLECharacteristic* pRxCharacteristic = pService->createCharacteristic(
    RAMS_NUS_RX_CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
  );
  pRxCharacteristic->setCallbacks(new RamsRxCallbacks());

  // Start the service
  pService->start();

  // Start BLE Advertising
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(RAMS_NUS_SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMaxPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.printf("[BT] Advertising BLE as '%s'\n", RAMS_BT_DEVICE_NAME);
}

void btServiceUpdate() {
  // Restart advertising if disconnected
  if (!_deviceConnected && _oldDeviceConnected) {
    delay(200);
    _pServer->startAdvertising();
    Serial.println(F("[BT] Re-started BLE advertising"));
    _oldDeviceConnected = _deviceConnected;
  }
  if (_deviceConnected && !_oldDeviceConnected) {
    _oldDeviceConnected = _deviceConnected;
  }
}

bool btServiceIsConnected() {
  return _deviceConnected;
}

void btServiceSendText(const String& text) {
  if (_deviceConnected && _pTxCharacteristic != nullptr) {
    const uint8_t* data = (const uint8_t*)text.c_str();
    size_t length = text.length();
    size_t offset = 0;
    while (offset < length) {
      size_t chunkSize = (length - offset > 128) ? 128 : (length - offset);
      _pTxCharacteristic->setValue((uint8_t*)(data + offset), chunkSize);
      _pTxCharacteristic->notify();
      offset += chunkSize;
      if (offset < length) delay(5);
    }
  }
}

const char* btServiceGetDeviceToken() {
  return _deviceToken;
}

void btServiceSetDeviceToken(const char* token) {
  if (token && strlen(token) > 0) {
    strncpy(_deviceToken, token, sizeof(_deviceToken) - 1);
    _deviceToken[sizeof(_deviceToken) - 1] = '\0';
  }
}
