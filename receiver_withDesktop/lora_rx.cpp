/*
 * Road Accident Monitoring System — LoRa Receiver Implementation
 * =================================================================
 * Listens for LoRa packets on 433MHz, reads the first byte to determine
 * the packet type, then deserializes into the matching struct from
 * protocol.h and forwards to httpUploadEvent() or local queue.
 *
 * Uses the same SPI pin assignment and radio settings as the wearable
 * transmitter for hardware commonality.
 *
 * Integrated with onboard NeoPixel (GPIO48) on ESP32-S3 SuperMini for
 * instantaneous visual feedback (packet pulse, alert strobe, false alarm flash).
 */

#include "lora_rx.h"
#include "config.h"
#include "neopixel.h"
#include "http_upload.h"
#include "local_queue.h"
#include "wifi_manager.h"
#include <SPI.h>
#include <LoRa.h>

static SPIClass _loraSPI(HSPI);

// ── Event Type Names (for logging) ──────────────────────────────────────────

static const char* _eventTypeName(uint8_t et) {
  switch (et) {
    case 0: return "fall";
    case 1: return "skid";
    case 2: return "direct_impact";
    case 3: return "ground_shock";
    case 4: return "wave_motion";
    default: return "unknown";
  }
}

static const char* _packetTypeName(uint8_t pt) {
  switch (pt) {
    case PKT_TELEMETRY:     return "telemetry";
    case PKT_ALERT:         return "alert";
    case PKT_FALSE_ALARM:   return "false_alarm";
    case PKT_TEST:          return "test";
    case PKT_REGISTER:      return "register";
    case PKT_USER_TYPE:     return "user_type";
    case PKT_RIDER_PROFILE: return "rider_profile";
    default: return "unknown";
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

bool loraRxInit() {
  _loraSPI.begin(LORA_SCK_PIN, LORA_MISO_PIN, LORA_MOSI_PIN, LORA_NSS_PIN);
  LoRa.setSPI(_loraSPI);
  LoRa.setPins(LORA_NSS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    Serial.println(F("[LORA-RX] SX1278 init failed! Check SPI wiring on ESP32-S3."));
    neopixelSetState(NEO_RX_ERROR);
    return false;
  }

  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BANDWIDTH);
  LoRa.setCodingRate4(LORA_CODING_RATE);
  LoRa.setSyncWord(LORA_SYNC_WORD);
  LoRa.enableCrc();

  // Put radio into continuous receive mode
  LoRa.receive();

  Serial.printf("[LORA-RX] LoRa 433MHz receiver ready on NSS=%d, RST=%d, DIO0=%d\n",
                LORA_NSS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);
  return true;
}

bool loraRxUpdate() {
  int packetSize = LoRa.parsePacket();
  if (packetSize == 0) return false;

  int rssi = LoRa.packetRssi();
  float snr = LoRa.packetSnr();

  // Read the raw bytes into a buffer
  uint8_t buf[256];
  int bytesRead = 0;
  while (LoRa.available() && bytesRead < (int)sizeof(buf)) {
    buf[bytesRead++] = LoRa.read();
  }

  // Re-enter continuous receive mode immediately so no subsequent packets are lost
  LoRa.receive();

  if (bytesRead < (int)sizeof(PacketHeader)) {
    Serial.printf("[LORA-RX] Packet too short (%d bytes), ignoring\n", bytesRead);
    return false;
  }

  // Flash onboard NeoPixel in blue (momentary reception beacon)
  neopixelTriggerPacketFlash();

  // Extract packet type from the first byte
  uint8_t packetType = buf[0];

  // Extract device token from header (bytes 1-8)
  char token[9] = {0};
  memcpy(token, buf + 1, 8);

  bool uploaded = false;

  switch (packetType) {
    case PKT_ALERT: {
      if (bytesRead < (int)sizeof(AlertPacket)) break;
      AlertPacket* pkt = (AlertPacket*)buf;

      // Trigger visual emergency strobe on onboard NeoPixel
      neopixelSetState(NEO_RX_ALERT);

      // Pretty-printed dashboard in Serial Monitor
      Serial.println(F("\n┌────────────────────────────────────────────────────────┐"));
      Serial.println(F("│     🚨 CRITICAL CRASH / IMPACT ALERT RECEIVED! 🚨      │"));
      Serial.println(F("├────────────────────────────────────────────────────────┤"));
      Serial.printf( "│  Device Token  : %-37s │\n", token);
      Serial.printf( "│  Event Type    : %-37s │\n", _eventTypeName(pkt->eventType));
      Serial.printf( "│  Peak Impact   : %6.2f g                              │\n", pkt->aMag);
      Serial.printf( "│  Latitude      : %12.6f°                         │\n", pkt->latitude);
      Serial.printf( "│  Longitude     : %12.6f°                         │\n", pkt->longitude);
      Serial.printf( "│  Signal Level  : RSSI %4d dBm  |  SNR %+5.1f dB        │\n", rssi, snr);
      Serial.printf( "│  Google Maps   : https://maps.google.com/?q=%.6f,%.6f │\n", pkt->latitude, pkt->longitude);
      Serial.println(F("└────────────────────────────────────────────────────────┘"));

      // Standard JSON output over Serial for desktop integration
      Serial.printf("{\"event\":\"LORA_ALERT\",\"token\":\"%s\",\"type\":\"%s\",\"lat\":%.6f,\"lon\":%.6f,\"aMag\":%.2f,\"rssi\":%d,\"snr\":%.1f,\"t\":%lu}\n",
                    token, _eventTypeName(pkt->eventType), pkt->latitude, pkt->longitude, pkt->aMag, rssi, snr, millis());

      if (wifiIsConnected()) {
        uploaded = httpUploadEvent(token, "alert", pkt->latitude, pkt->longitude,
                                  pkt->eventType, 0, pkt->aMag, nullptr, nullptr);
      }
      if (!uploaded) {
        localQueueAdd(token, "alert", pkt->latitude, pkt->longitude,
                      pkt->eventType, 0, pkt->aMag, nullptr, nullptr);
      }
      break;
    }

    case PKT_FALSE_ALARM: {
      if (bytesRead < (int)sizeof(FalseAlarmPacket)) break;
      FalseAlarmPacket* pkt = (FalseAlarmPacket*)buf;

      // Double green flash on NeoPixel & clear alert state
      neopixelTriggerFalseAlarmFlash();
      neopixelClearAlert();

      Serial.println(F("\n┌────────────────────────────────────────────────────────┐"));
      Serial.println(F("│       🟢 FALSE ALARM CANCELLED BY RIDER BUTTON         │"));
      Serial.println(F("├────────────────────────────────────────────────────────┤"));
      Serial.printf( "│  Device Token  : %-37s │\n", token);
      Serial.printf( "│  Coordinates   : %10.6f°, %10.6f°              │\n", pkt->latitude, pkt->longitude);
      Serial.printf( "│  Signal Level  : RSSI %4d dBm  |  SNR %+5.1f dB        │\n", rssi, snr);
      Serial.println(F("│  Status        : Active Alert Cancelled & Cleared      │"));
      Serial.println(F("└────────────────────────────────────────────────────────┘"));

      Serial.printf("{\"event\":\"LORA_FALSE_ALARM\",\"token\":\"%s\",\"lat\":%.6f,\"lon\":%.6f,\"rssi\":%d,\"snr\":%.1f,\"t\":%lu}\n",
                    token, pkt->latitude, pkt->longitude, rssi, snr, millis());

      if (wifiIsConnected()) {
        uploaded = httpUploadEvent(token, "false_alarm", pkt->latitude, pkt->longitude,
                                  0, 0, 0.0f, nullptr, nullptr);
      }
      if (!uploaded) {
        localQueueAdd(token, "false_alarm", pkt->latitude, pkt->longitude,
                      0, 0, 0.0f, nullptr, nullptr);
      }
      break;
    }

    case PKT_TELEMETRY: {
      if (bytesRead < (int)sizeof(TelemetryPacket)) break;
      TelemetryPacket* pkt = (TelemetryPacket*)buf;

      bool hasGpsFix = (abs(pkt->latitude) > 0.0001f || abs(pkt->longitude) > 0.0001f);

      Serial.printf("[LORA-RX] 📡 TELEMETRY | Token: %-8s | Lat: %10.6f | Lon: %10.6f | Batt: %3d%% | RSSI: %4d dBm | SNR: %+4.1f | GPS: %s\n",
                    token, pkt->latitude, pkt->longitude, pkt->batteryPct, rssi, snr, hasGpsFix ? "FIX" : "NO_FIX");

      // Always output JSON over Serial and upload via WiFi for desktop application ingestion
      Serial.printf("{\"event\":\"LORA_TELEMETRY\",\"token\":\"%s\",\"lat\":%.6f,\"lon\":%.6f,\"batt\":%d,\"rssi\":%d,\"snr\":%.1f,\"t\":%lu}\n",
                    token, pkt->latitude, pkt->longitude, pkt->batteryPct, rssi, snr, millis());

      if (wifiIsConnected()) {
        httpUploadEvent(token, "telemetry", pkt->latitude, pkt->longitude,
                        0, pkt->batteryPct, 0.0f, nullptr, nullptr);
      }
      break;
    }

    case PKT_USER_TYPE: {
      if (bytesRead < (int)sizeof(UserTypePacket)) break;
      UserTypePacket* pkt = (UserTypePacket*)buf;
      char uType[17] = {0};
      memcpy(uType, pkt->userType, sizeof(pkt->userType));

      Serial.printf("[LORA-RX] 👤 USER TYPE UPDATE | Token: %-8s | Category: %-16s | RSSI: %4d dBm\n",
                    token, uType, rssi);

      Serial.printf("{\"event\":\"LORA_USER_TYPE\",\"token\":\"%s\",\"category\":\"%s\",\"rssi\":%d,\"snr\":%.1f,\"t\":%lu}\n",
                    token, uType, rssi, snr, millis());

      if (wifiIsConnected()) {
        uploaded = httpUploadEvent(token, "user_type", 0, 0,
                                  0, 0, 0.0f, uType, nullptr);
      }
      if (!uploaded) {
        localQueueAdd(token, "user_type", 0, 0, 0, 0, 0.0f, uType, nullptr);
      }
      break;
    }

    case PKT_TEST: {
      if (bytesRead < (int)sizeof(AlertPacket)) break;
      AlertPacket* pkt = (AlertPacket*)buf;

      neopixelSetState(NEO_RX_ALERT);

      Serial.printf("[LORA-RX] 🧪 TEST DRILL PACKET | Token: %-8s | Lat: %.6f | Lon: %.6f | RSSI: %d dBm\n",
                    token, pkt->latitude, pkt->longitude, rssi);

      Serial.printf("{\"event\":\"LORA_TEST\",\"token\":\"%s\",\"lat\":%.6f,\"lon\":%.6f,\"aMag\":%.2f,\"rssi\":%d,\"snr\":%.1f,\"t\":%lu}\n",
                    token, pkt->latitude, pkt->longitude, pkt->aMag, rssi, snr, millis());

      if (wifiIsConnected()) {
        uploaded = httpUploadEvent(token, "test", pkt->latitude, pkt->longitude,
                                  pkt->eventType, 0, pkt->aMag, nullptr, nullptr);
      }
      if (!uploaded) {
        localQueueAdd(token, "test", pkt->latitude, pkt->longitude,
                      pkt->eventType, 0, pkt->aMag, nullptr, nullptr);
      }
      break;
    }

    case PKT_REGISTER: {
      if (bytesRead < (int)sizeof(RegisterPacket)) break;
      RegisterPacket* pkt = (RegisterPacket*)buf;

      char name[25] = {0};
      char photoUrl[97] = {0};
      memcpy(name, pkt->name, 24);
      memcpy(photoUrl, pkt->driveLinkConverted, 96);

      Serial.printf("[LORA-RX] 📝 REGISTRATION | Token: %-8s | Name: '%s' | RSSI: %d dBm\n",
                    token, name, rssi);

      Serial.printf("{\"event\":\"LORA_REGISTER\",\"token\":\"%s\",\"name\":\"%s\",\"photoUrl\":\"%s\",\"rssi\":%d,\"snr\":%.1f,\"t\":%lu}\n",
                    token, name, photoUrl, rssi, snr, millis());

      if (wifiIsConnected()) {
        uploaded = httpUploadEvent(token, "register", 0, 0,
                                  0, 0, 0.0f, name, photoUrl);
      }
      if (!uploaded) {
        localQueueAdd(token, "register", 0, 0, 0, 0, 0.0f, name, photoUrl);
      }
      break;
    }

    case PKT_RIDER_PROFILE: {
      if (bytesRead < 101) break; // Minimum required for legacy profile
      RiderProfilePacket* pkt = (RiderProfilePacket*)buf;

      // Safely extract null-terminated strings from the packed struct
      char rName[25] = {0};
      char rPlate[13] = {0};
      char rContact[17] = {0};
      char rBlood[5] = {0};
      char rCategory[17] = {0};
      char rEmergency[17] = {0};
      char rEmerName[21] = {0};
      char rVehicle[21] = {0};
      char rAllergies[21] = {0};
      char rPhoto[73] = {0};

      memcpy(rName,      pkt->name,           sizeof(pkt->name));
      memcpy(rPlate,     pkt->plate,          sizeof(pkt->plate));
      memcpy(rContact,   pkt->contact,        sizeof(pkt->contact));
      memcpy(rBlood,     pkt->blood,          sizeof(pkt->blood));
      memcpy(rCategory,  pkt->category,       sizeof(pkt->category));
      memcpy(rEmergency, pkt->emergencyPhone, sizeof(pkt->emergencyPhone));

      // Extract extended fields if transmitted in new packet format
      if (bytesRead >= (int)sizeof(RiderProfilePacket)) {
        memcpy(rEmerName,  pkt->emergencyName, sizeof(pkt->emergencyName));
        memcpy(rVehicle,   pkt->vehicleModel,  sizeof(pkt->vehicleModel));
        memcpy(rAllergies, pkt->allergies,     sizeof(pkt->allergies));
        memcpy(rPhoto,     pkt->photoUrl,      sizeof(pkt->photoUrl));
      }

      // Pretty-printed rider profile in Serial Monitor
      Serial.println(F("\n\xDA\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xBF"));
      Serial.println(F("\xB3   RIDER PROFILE SYNCHRONIZED FROM MOBILE APP       \xB3"));
      Serial.println(F("\xC3\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xB4"));
      Serial.printf( "\xB3  Device Token  : %-37s \xB3\n", token);
      Serial.printf( "\xB3  Rider Name    : %-37s \xB3\n", rName);
      Serial.printf( "\xB3  License Plate : %-37s \xB3\n", rPlate);
      Serial.printf( "\xB3  Contact Phone : %-37s \xB3\n", rContact);
      Serial.printf( "\xB3  Blood Type    : %-37s \xB3\n", rBlood);
      Serial.printf( "\xB3  Vehicle Type  : %-37s \xB3\n", rCategory);
      Serial.printf( "\xB3  Vehicle Model : %-37s \xB3\n", (strlen(rVehicle) > 0) ? rVehicle : "(not set)");
      Serial.printf( "\xB3  Emerg Contact : %-37s \xB3\n", (strlen(rEmerName) > 0) ? rEmerName : "(not set)");
      Serial.printf( "\xB3  Emergency Ph. : %-37s \xB3\n", rEmergency);
      Serial.printf( "\xB3  Allergies     : %-37s \xB3\n", (strlen(rAllergies) > 0) ? rAllergies : "(not set)");
      Serial.printf( "\xB3  Photo Status  : %-37s \xB3\n", (strlen(rPhoto) > 0) ? "GDrive 2x2 Available" : "(not set)");
      Serial.printf( "\xB3  Signal Level  : RSSI %4d dBm  |  SNR %+5.1f dB    \xB3\n", rssi, snr);
      Serial.println(F("\xC0\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xC4\xD9"));

      // Standard JSON output over Serial for desktop integration
      Serial.printf("{\"event\":\"LORA_RIDER_PROFILE\",\"token\":\"%s\",\"name\":\"%s\",\"plate\":\"%s\",\"contact\":\"%s\",\"blood\":\"%s\",\"category\":\"%s\",\"emergencyPhone\":\"%s\",\"emergencyContactName\":\"%s\",\"vehicleModel\":\"%s\",\"allergies\":\"%s\",\"photoUrl\":\"%s\",\"rssi\":%d,\"snr\":%.1f,\"t\":%lu}\n",
                    token, rName, rPlate, rContact, rBlood, rCategory, rEmergency, rEmerName, rVehicle, rAllergies, rPhoto, rssi, snr, millis());

      if (wifiIsConnected()) {
        uploaded = httpUploadRiderProfile(token, rName, rPlate, rContact, rBlood, rCategory, rEmergency);
      }
      if (!uploaded) {
        localQueueAddRiderProfile(token, rName, rPlate, rContact, rBlood, rCategory, rEmergency);
      }
      break;
    }

    default:
      Serial.printf("[LORA-RX] Unknown packet type %d received (%d bytes), ignoring\n", packetType, bytesRead);
      break;
  }

  return true;
}
