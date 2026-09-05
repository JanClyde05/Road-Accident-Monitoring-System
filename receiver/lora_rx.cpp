/*
 * Road Accident Monitoring System — LoRa Receiver Implementation
 * =================================================================
 * Listens for LoRa packets on 433MHz, reads the first byte to determine
 * the packet type, then deserializes into the matching struct from
 * protocol.h and forwards to httpUploadEvent() or local queue.
 *
 * Uses the same SPI pin assignment and radio settings as the wearable
 * transmitter for hardware commonality.
 */

#include "lora_rx.h"
#include "config.h"
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
    case PKT_TELEMETRY:   return "telemetry";
    case PKT_ALERT:       return "alert";
    case PKT_FALSE_ALARM: return "false_alarm";
    case PKT_TEST:        return "test";
    case PKT_REGISTER:    return "register";
    default: return "unknown";
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

bool loraRxInit() {
  _loraSPI.begin(LORA_SCK_PIN, LORA_MISO_PIN, LORA_MOSI_PIN, LORA_NSS_PIN);
  LoRa.setSPI(_loraSPI);
  LoRa.setPins(LORA_NSS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    Serial.println(F("[LORA-RX] SX1278 init failed! Check wiring."));
    return false;
  }

  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BANDWIDTH);
  LoRa.setCodingRate4(LORA_CODING_RATE);
  LoRa.setSyncWord(LORA_SYNC_WORD);
  LoRa.enableCrc();

  // Put radio into continuous receive mode
  LoRa.receive();

  Serial.println(F("[LORA-RX] LoRa receiver initialized, listening..."));
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

  if (bytesRead < (int)sizeof(PacketHeader)) {
    Serial.printf("[LORA-RX] Packet too short (%d bytes), ignoring\n", bytesRead);
    return false;
  }

  // Extract packet type from the first byte
  uint8_t packetType = buf[0];
  Serial.printf("[LORA-RX] Received %d bytes, type=%s, RSSI=%d, SNR=%.1f\n",
                bytesRead, _packetTypeName(packetType), rssi, snr);

  // Extract device token from header (bytes 1-8)
  char token[9] = {0};
  memcpy(token, buf + 1, 8);

  // Deserialize and forward based on packet type
  bool uploaded = false;

  switch (packetType) {
    case PKT_TELEMETRY: {
      if (bytesRead < (int)sizeof(TelemetryPacket)) break;
      TelemetryPacket* pkt = (TelemetryPacket*)buf;
      Serial.printf("[LORA-RX] TELEMETRY token=%s lat=%.6f lon=%.6f batt=%d%%\n",
                    token, pkt->latitude, pkt->longitude, pkt->batteryPct);

      if (wifiIsConnected()) {
        uploaded = httpUploadEvent(token, "telemetry", pkt->latitude, pkt->longitude,
                                  0, pkt->batteryPct, 0.0f, nullptr, nullptr);
      }
      if (!uploaded) {
        localQueueAdd(token, "telemetry", pkt->latitude, pkt->longitude,
                      0, pkt->batteryPct, 0.0f, nullptr, nullptr);
      }
      break;
    }

    case PKT_ALERT: {
      if (bytesRead < (int)sizeof(AlertPacket)) break;
      AlertPacket* pkt = (AlertPacket*)buf;
      Serial.printf("[LORA-RX] ⚠ ALERT token=%s type=%s lat=%.6f lon=%.6f aMag=%.2f\n",
                    token, _eventTypeName(pkt->eventType),
                    pkt->latitude, pkt->longitude, pkt->aMag);

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
      Serial.printf("[LORA-RX] FALSE ALARM token=%s lat=%.6f lon=%.6f\n",
                    token, pkt->latitude, pkt->longitude);

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

    case PKT_TEST: {
      if (bytesRead < (int)sizeof(AlertPacket)) break;
      AlertPacket* pkt = (AlertPacket*)buf;
      Serial.printf("[LORA-RX] TEST token=%s lat=%.6f lon=%.6f\n",
                    token, pkt->latitude, pkt->longitude);

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

      Serial.printf("[LORA-RX] REGISTER token=%s name='%s'\n", token, name);

      if (wifiIsConnected()) {
        uploaded = httpUploadEvent(token, "register", 0, 0,
                                  0, 0, 0.0f, name, photoUrl);
      }
      if (!uploaded) {
        localQueueAdd(token, "register", 0, 0, 0, 0, 0.0f, name, photoUrl);
      }
      break;
    }

    default:
      Serial.printf("[LORA-RX] Unknown packet type %d, ignoring\n", packetType);
      break;
  }

  return true;
}
