/*
 * Road Accident Monitoring System — Wearable Configuration
 * ==========================================================
 * ESP32-S3 SuperMini + Ra-02 LoRa (SX1278) + Buzzer + Button + NeoPixel
 * Phone-assisted mode: GPS and IMU telemetry are supplied via BLE from the companion Android app.
 */

#ifndef RAMS_WEARABLE_CONFIG_H
#define RAMS_WEARABLE_CONFIG_H

// ── SPI — Ra-02 LoRa (SX1278) ──────────────────────────────────────────────
#define LORA_NSS_PIN          10
#define LORA_SCK_PIN          12
#define LORA_MISO_PIN         13
#define LORA_MOSI_PIN         11
#define LORA_RST_PIN          9     // ESP32-S3 SuperMini pin (available: 2 to 9)
#define LORA_DIO0_PIN         8     // ESP32-S3 SuperMini pin (available: 2 to 9)

// ── Button — False-alarm dismiss / status chirp ─────────────────────────────
// Onboard Boot/User Button on ESP32-S3 SuperMini (GPIO0, active LOW)
#define BUTTON_PIN            0
#define BUTTON_DEBOUNCE_MS    50

// ── Buzzer — Active buzzer, GPIO-driven ─────────────────────────────────────
#define BUZZER_PIN            1

// ── NeoPixel — Onboard status RGB LED (WS2812B) ─────────────────────────────
#define NEOPIXEL_PIN          48
#define NEOPIXEL_COUNT        1

// ── Bluetooth Low Energy (BLE) ──────────────────────────────────────────────
#define RAMS_BT_DEVICE_NAME   "RAMS Wearable"
#define DEFAULT_DEVICE_TOKEN  "RAMS0001"

// ── System ──────────────────────────────────────────────────────────────────
#define SERIAL_BAUD           115200

#endif // RAMS_WEARABLE_CONFIG_H
