/*
 * Road Accident Monitoring System — Shared LoRa Protocol
 * ========================================================
 * Packet structures shared between wearable (TX) and receiver (RX).
 * This file must be IDENTICAL in both firmware projects.
 *
 * LoRa (SX1278) max payload ≈ 255 bytes at SF9/BW125.
 * Largest packet: RegisterPacket = 13 + 24 + 96 = 133 bytes — well within limit.
 *
 * Radio settings: 433MHz, SF9, BW125kHz, CR4/5.
 * These are the defaults; field-tune once both units are on the bench.
 */

#ifndef RAMS_PROTOCOL_H
#define RAMS_PROTOCOL_H

#include <stdint.h>

// ── Packet Types ────────────────────────────────────────────────────────────
// Each packet starts with a PacketHeader whose first byte identifies the type.

enum PacketType : uint8_t {
  PKT_TELEMETRY   = 0,  // Periodic GPS ping (armed or setup mode)
  PKT_ALERT       = 1,  // Confirmed fall/skid/impact/environmental event
  PKT_FALSE_ALARM = 2,  // Physical-button cancel of an active alert
  PKT_TEST        = 3,  // Simulation/demo-mode trigger (safe, repeatable)
  PKT_REGISTER    = 4   // One-time, sent when setup-mode registration completes
};

// ── Event Sub-Types (for AlertPacket.eventType) ─────────────────────────────

enum EventType : uint8_t {
  EVT_FALL          = 0,  // Full FSM-confirmed fall sequence
  EVT_SKID          = 1,  // Lateral accel + high roll-rate
  EVT_DIRECT_IMPACT = 2,  // Single high-g spike above threshold
  EVT_GROUND_SHOCK  = 3,  // Environmental: high accel variance, low orientation variance
  EVT_WAVE_MOTION   = 4   // Environmental: moderate accel variance + orientation drift
};

// ── Packet Header (13 bytes) ────────────────────────────────────────────────
// Present at the start of every packet. deviceToken is an 8-char alphanumeric
// string generated during on-device registration (null bytes if unregistered).

struct __attribute__((packed)) PacketHeader {
  uint8_t  packetType;       // PacketType enum value
  char     deviceToken[8];   // 8-char device identifier (from registration)
  uint32_t timestamp;        // millis() at send time (for ordering, not absolute clock)
};

// ── Telemetry Packet ────────────────────────────────────────────────────────
// Sent every TELEMETRY_INTERVAL_MS while the wearable is armed.
// Purpose: keep the dashboard's "last known location" current even when
// no accident has occurred.

struct __attribute__((packed)) TelemetryPacket {
  PacketHeader header;       // packetType = PKT_TELEMETRY
  float   latitude;          // Degrees, WGS84
  float   longitude;         // Degrees, WGS84
  uint8_t batteryPct;        // 0–100 (0 if unavailable)
};

// ── Alert Packet ────────────────────────────────────────────────────────────
// Sent when the detection FSM confirms an accident event.
// aMag captures the peak acceleration magnitude that triggered the event,
// useful for severity triage on the dashboard.

struct __attribute__((packed)) AlertPacket {
  PacketHeader header;       // packetType = PKT_ALERT
  float   latitude;
  float   longitude;
  uint8_t eventType;         // EventType enum value
  float   aMag;              // Peak acceleration magnitude (g) at trigger
};

// ── False Alarm Packet ──────────────────────────────────────────────────────
// Sent when the user presses the physical button to cancel an active alert.

struct __attribute__((packed)) FalseAlarmPacket {
  PacketHeader header;       // packetType = PKT_FALSE_ALARM
  float   latitude;
  float   longitude;
};

// ── Register Packet ─────────────────────────────────────────────────────────
// Sent once after the user completes on-device registration via the wearable's
// SoftAP setup page. Contains the user's name and the converted Google Drive
// photo URL (output of convertDriveLink(), not the raw share link).
// 96 chars for the URL fits comfortably under LoRa's practical payload ceiling.

struct __attribute__((packed)) RegisterPacket {
  PacketHeader header;       // packetType = PKT_REGISTER
  char    name[24];          // User's display name (null-terminated, truncated if longer)
  char    driveLinkConverted[96]; // https://lh3.googleusercontent.com/d/FILE_ID
};

// ── Timing Constants ────────────────────────────────────────────────────────

#define TELEMETRY_INTERVAL_MS  30000  // Send GPS telemetry every 30 seconds

// ── LoRa Radio Settings ─────────────────────────────────────────────────────
// Defaults for SX1278 (Ra-02 module). Tune on the bench if needed.

#define LORA_FREQUENCY     433E6   // 433 MHz ISM band
#define LORA_SF            9       // Spreading factor 9 (balance range vs. airtime)
#define LORA_BANDWIDTH     125E3   // 125 kHz bandwidth
#define LORA_CODING_RATE   5       // CR 4/5 (denominator)
#define LORA_TX_POWER      17      // dBm (max for SX1278 without PA_BOOST)
#define LORA_SYNC_WORD     0x34    // Private sync word (avoid 0x12 = LoRaWAN default)

#endif // RAMS_PROTOCOL_H
