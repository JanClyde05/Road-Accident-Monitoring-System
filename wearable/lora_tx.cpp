/*
 * Road Accident Monitoring System — LoRa Transmitter Implementation
 * ====================================================================
 * Uses the arduino-LoRa library (LoRa.h by Sandeep Mistry) to send
 * packed protocol structs over SX1278 at 433MHz.
 *
 * Each send function constructs the appropriate packet struct from
 * protocol.h, then writes the raw bytes into a LoRa packet. The
 * receiver deserializes by reading packetType from the first byte
 * and then interpreting the remaining bytes as the matching struct.
 *
 * SPI pins are configured via LoRa.setSPI() for the non-default
 * pin assignment on the ESP32-S3 SuperMini.
 */

#include "lora_tx.h"
#include "config.h"
#include <SPI.h>
#include <LoRa.h>

// Custom SPI instance for the LoRa module (ESP32-S3 supports multiple SPI buses)
static SPIClass _loraSPI(HSPI);

bool loraTxInit() {
  // Initialize SPI with custom pins (spec §3.4)
  _loraSPI.begin(LORA_SCK_PIN, LORA_MISO_PIN, LORA_MOSI_PIN, LORA_NSS_PIN);
  LoRa.setSPI(_loraSPI);
  LoRa.setPins(LORA_NSS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    Serial.println(F("[LORA-TX] SX1278 init failed! Check wiring."));
    return false;
  }

  // Apply radio settings from protocol.h
  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BANDWIDTH);
  LoRa.setCodingRate4(LORA_CODING_RATE);
  LoRa.setTxPower(LORA_TX_POWER);
  LoRa.setSyncWord(LORA_SYNC_WORD);

  // Disable CRC for minimal overhead (we trust the LoRa PHY's own error detection)
  LoRa.enableCrc();

  Serial.println(F("[LORA-TX] LoRa transmitter initialized"));
  Serial.printf("[LORA-TX] Freq=%.0fMHz SF=%d BW=%.0fkHz CR=4/%d Power=%ddBm\n",
                LORA_FREQUENCY / 1E6, LORA_SF, LORA_BANDWIDTH / 1E3,
                LORA_CODING_RATE, LORA_TX_POWER);
  return true;
}

// ── Internal: send raw bytes as a LoRa packet ──────────────────────────────

static bool _sendPacket(const uint8_t* data, size_t len) {
  LoRa.beginPacket();
  LoRa.write(data, len);
  int result = LoRa.endPacket();

  if (result) {
    Serial.printf("[LORA-TX] Sent %u bytes\n", len);
  } else {
    Serial.println(F("[LORA-TX] Packet send failed!"));
  }
  return result;
}

// ── Internal: fill header fields ────────────────────────────────────────────

static void _fillHeader(PacketHeader& hdr, uint8_t type, const char* token) {
  hdr.packetType = type;
  memset(hdr.deviceToken, 0, sizeof(hdr.deviceToken));
  if (token) {
    strncpy(hdr.deviceToken, token, sizeof(hdr.deviceToken));
  }
  hdr.timestamp = millis();
}

// ── Public Send Functions ───────────────────────────────────────────────────

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
  Serial.printf("[LORA-TX] ALERT type=%d aMag=%.2fg at %.6f,%.6f\n",
                eventType, aMag, lat, lon);
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
  // Test packet reuses AlertPacket with eventType=EVT_FALL and PKT_TEST type
  AlertPacket pkt;
  _fillHeader(pkt.header, PKT_TEST, token);
  pkt.latitude = lat;
  pkt.longitude = lon;
  pkt.eventType = EVT_FALL;  // Simulated fall for demo
  pkt.aMag = 5.0f;           // Simulated peak acceleration
  Serial.println(F("[LORA-TX] TEST packet sent"));
  return _sendPacket((uint8_t*)&pkt, sizeof(pkt));
}

bool loraSendRegister(const char* token, const char* name, const char* photoUrl) {
  RegisterPacket pkt;
  _fillHeader(pkt.header, PKT_REGISTER, token);
  memset(pkt.name, 0, sizeof(pkt.name));
  memset(pkt.driveLinkConverted, 0, sizeof(pkt.driveLinkConverted));
  if (name) strncpy(pkt.name, name, sizeof(pkt.name) - 1);
  if (photoUrl) strncpy(pkt.driveLinkConverted, photoUrl, sizeof(pkt.driveLinkConverted) - 1);
  Serial.printf("[LORA-TX] REGISTER name='%s'\n", pkt.name);
  return _sendPacket((uint8_t*)&pkt, sizeof(pkt));
}
