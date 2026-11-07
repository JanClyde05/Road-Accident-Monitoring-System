/*
 * Road Accident Monitoring System — LoRa Transmitter Implementation
 * ====================================================================
 * Uses arduino-LoRa library to send packed protocol structs over SX1278.
 */

#include "lora_tx.h"
#include "config.h"
#include <SPI.h>
#include <LoRa.h>

// Custom SPI instance for LoRa module on ESP32-S3 SuperMini
static SPIClass _loraSPI(HSPI);

bool loraTxInit() {
  _loraSPI.begin(LORA_SCK_PIN, LORA_MISO_PIN, LORA_MOSI_PIN, LORA_NSS_PIN);
  LoRa.setSPI(_loraSPI);
  LoRa.setPins(LORA_NSS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    Serial.println(F("[LORA-TX] SX1278 init failed! Check SPI wiring."));
    return false;
  }

  // Apply radio parameters from shared protocol.h
  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BANDWIDTH);
  LoRa.setCodingRate4(LORA_CODING_RATE);
  LoRa.setTxPower(LORA_TX_POWER);
  LoRa.setSyncWord(LORA_SYNC_WORD);
  LoRa.enableCrc();

  Serial.println(F("[LORA-TX] SX1278 433MHz LoRa transmitter ready"));
  return true;
}

static bool _sendPacket(const uint8_t* data, size_t len) {
  LoRa.beginPacket();
  LoRa.write(data, len);
  int result = LoRa.endPacket();

  if (result) {
    Serial.printf("[LORA-TX] Transmitted packet (%u bytes)\n", len);
  } else {
    Serial.println(F("[LORA-TX] Packet transmission failed"));
  }
  return result;
}

static void _fillHeader(PacketHeader& hdr, uint8_t type, const char* token) {
  hdr.packetType = type;
  memset(hdr.deviceToken, 0, sizeof(hdr.deviceToken));
  if (token && strlen(token) > 0) {
    strncpy(hdr.deviceToken, token, sizeof(hdr.deviceToken));
  } else {
    strncpy(hdr.deviceToken, DEFAULT_DEVICE_TOKEN, sizeof(hdr.deviceToken));
  }
  hdr.timestamp = millis();
}

bool loraSendTelemetry(const char* token, float lat, float lon, uint8_t battPct) {
  TelemetryPacket pkt;
  _fillHeader(pkt.header, PKT_TELEMETRY, token);
  pkt.latitude = lat;
  pkt.longitude = lon;
  pkt.batteryPct = battPct;
  return _sendPacket((uint8_t*)&pkt, sizeof(pkt));
}

bool loraSendAlert(const char* token, float lat, float lon, uint8_t eventType, float aMag) {
  AlertPacket pkt;
  _fillHeader(pkt.header, PKT_ALERT, token);
  pkt.latitude = lat;
  pkt.longitude = lon;
  pkt.eventType = eventType;
  pkt.aMag = aMag;
  Serial.printf("[LORA-TX] ALERT sent: type=%d aMag=%.2fg at %.6f,%.6f\n", eventType, aMag, lat, lon);
  return _sendPacket((uint8_t*)&pkt, sizeof(pkt));
}

bool loraSendFalseAlarm(const char* token, float lat, float lon) {
  FalseAlarmPacket pkt;
  _fillHeader(pkt.header, PKT_FALSE_ALARM, token);
  pkt.latitude = lat;
  pkt.longitude = lon;
  Serial.println(F("[LORA-TX] FALSE ALARM sent"));
  return _sendPacket((uint8_t*)&pkt, sizeof(pkt));
}

bool loraSendTest(const char* token, float lat, float lon) {
  AlertPacket pkt;
  _fillHeader(pkt.header, PKT_TEST, token);
  pkt.latitude = lat;
  pkt.longitude = lon;
  pkt.eventType = EVT_FALL;
  pkt.aMag = 5.0f;
  Serial.println(F("[LORA-TX] TEST packet sent"));
  return _sendPacket((uint8_t*)&pkt, sizeof(pkt));
}

bool loraSendRiderProfile(const char* token, const char* name, const char* plate,
                          const char* contact, const char* blood,
                          const char* category, const char* emergencyPhone,
                          const char* emergencyName,
                          const char* vehicleModel,
                          const char* allergies,
                          const char* photoUrl) {
  RiderProfilePacket pkt;
  memset(&pkt, 0, sizeof(pkt));
  _fillHeader(pkt.header, PKT_RIDER_PROFILE, token);

  if (name)           strncpy(pkt.name,           name,           sizeof(pkt.name)           - 1);
  if (plate)          strncpy(pkt.plate,          plate,          sizeof(pkt.plate)          - 1);
  if (contact)        strncpy(pkt.contact,        contact,        sizeof(pkt.contact)        - 1);
  if (blood)          strncpy(pkt.blood,          blood,          sizeof(pkt.blood)          - 1);
  if (category)       strncpy(pkt.category,       category,       sizeof(pkt.category)       - 1);
  if (emergencyPhone) strncpy(pkt.emergencyPhone, emergencyPhone, sizeof(pkt.emergencyPhone) - 1);
  if (emergencyName)  strncpy(pkt.emergencyName,  emergencyName,  sizeof(pkt.emergencyName)  - 1);
  if (vehicleModel)   strncpy(pkt.vehicleModel,   vehicleModel,   sizeof(pkt.vehicleModel)   - 1);
  if (allergies)      strncpy(pkt.allergies,      allergies,      sizeof(pkt.allergies)      - 1);
  if (photoUrl)       strncpy(pkt.photoUrl,       photoUrl,       sizeof(pkt.photoUrl)       - 1);

  Serial.printf("[LORA-TX] RIDER PROFILE sent: name='%s' plate='%s' category='%s' photo='%s'\n",
                pkt.name, pkt.plate, pkt.category, pkt.photoUrl);
  return _sendPacket((uint8_t*)&pkt, sizeof(pkt));
}

bool loraSendRegister(const char* token, const char* name, const char* driveLinkConverted) {
  RegisterPacket pkt;
  memset(&pkt, 0, sizeof(pkt));
  _fillHeader(pkt.header, PKT_REGISTER, token);

  if (name) strncpy(pkt.name, name, sizeof(pkt.name) - 1);
  if (driveLinkConverted) strncpy(pkt.driveLinkConverted, driveLinkConverted, sizeof(pkt.driveLinkConverted) - 1);

  Serial.printf("[LORA-TX] REGISTER sent: name='%s' driveLink='%s'\n", pkt.name, pkt.driveLinkConverted);
  return _sendPacket((uint8_t*)&pkt, sizeof(pkt));
}
