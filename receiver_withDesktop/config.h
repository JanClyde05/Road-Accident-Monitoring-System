/*
 * Road Accident Monitoring System — Receiver Configuration
 * ==========================================================
 * Pin map, backend URL, and timing constants for the receiver unit.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  BEFORE FLASHING:                                                │
 * │  1. Update BACKEND_URL to your Netlify site                     │
 * │  2. Confirm SX1278 logic levels match SuperMini I/O              │
 * └──────────────────────────────────────────────────────────────────┘
 */

#ifndef RAMS_RECEIVER_CONFIG_H
#define RAMS_RECEIVER_CONFIG_H

// ── SPI — Ra-02 LoRa (SX1278) ──────────────────────────────────────────────
// Pin assignments for ESP32-S3 SuperMini (only GPIOs 1–13 available).
#define LORA_NSS_PIN      10
#define LORA_SCK_PIN      12
#define LORA_MISO_PIN     13
#define LORA_MOSI_PIN     11
#define LORA_RST_PIN      9     // ESP32-S3 SuperMini pin (available: 1 to 13)
#define LORA_DIO0_PIN     8     // ESP32-S3 SuperMini pin (available: 1 to 13)

// ── NeoPixel — Onboard status RGB LED (WS2812B) ─────────────────────────────
#define NEOPIXEL_PIN      48
#define NEOPIXEL_COUNT    1

// ── Legacy Status LED ───────────────────────────────────────────────────────
// Optional external LED on GPIO2.
#define STATUS_LED_PIN    2

// ── Wi-Fi (Captive Portal Provisioning) ─────────────────────────────────────
// No hardcoded WiFi. Boots into SoftAP captive portal if no saved creds.
#define WIFI_AP_SSID            "RAMS_Receiver_Setup"
#define WIFI_CONNECT_TIMEOUT_MS 15000
#define WIFI_RETRY_INTERVAL_MS  30000

// ── Backend API ─────────────────────────────────────────────────────────────

// --- OPTION A: Desktop App LAN Bridge (Port 8888) ---
#define BACKEND_URL       "http://192.168.123.7:8888"

// --- OPTION B: Production Netlify ---
//#define BACKEND_URL       "https://road-accident-monitoring-system.netlify.app"

#define UPLOAD_ENDPOINT   "/api/upload"

// ── Upload Retry ────────────────────────────────────────────────────────────
#define UPLOAD_RETRY_INTERVAL_MS  60000
#define UPLOAD_MAX_RETRIES        5
#define HTTP_TIMEOUT_MS           15000

// ── NVS ─────────────────────────────────────────────────────────────────────
#define NVS_NAMESPACE     "rams_rx"

// ── System ──────────────────────────────────────────────────────────────────
#define SERIAL_BAUD       115200

#endif // RAMS_RECEIVER_CONFIG_H
