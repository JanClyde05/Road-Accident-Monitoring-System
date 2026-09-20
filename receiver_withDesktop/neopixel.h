/*
 * Road Accident Monitoring System — Receiver NeoPixel Status LED
 * ==================================================================
 * Onboard WS2812B RGB LED on ESP32-S3 SuperMini (GPIO48).
 * Provides distinct visual feedback for receiver station states:
 *   - Boot / initialization
 *   - Captive portal AP provisioning mode
 *   - Wi-Fi connecting / connected / offline queue mode
 *   - LoRa packet reception heartbeat
 *   - Emergency crash alert strobe
 *   - False alarm dismissal confirmation
 *   - Hardware error
 */

#ifndef RAMS_RECEIVER_NEOPIXEL_H
#define RAMS_RECEIVER_NEOPIXEL_H

#include <Arduino.h>

enum ReceiverNeoState : uint8_t {
  NEO_RX_OFF,
  NEO_RX_BOOT,              // Cyan/white boot sequence
  NEO_RX_AP_MODE,           // Pulsing amber/magenta — Captive portal active
  NEO_RX_CONNECTING,        // Pulsing cyan — connecting to Wi-Fi
  NEO_RX_ONLINE_IDLE,       // Breathing emerald green — Wi-Fi connected & LoRa listening
  NEO_RX_OFFLINE_IDLE,      // Breathing amber/yellow — LoRa listening, offline buffer mode
  NEO_RX_ALERT,             // Rapid flashing red SOS/strobe — active emergency alert
  NEO_RX_ERROR              // Solid red — hardware/LoRa error
};

void neopixelInit();
void neopixelSetState(ReceiverNeoState state);
ReceiverNeoState neopixelGetState();
void neopixelTriggerPacketFlash();
void neopixelTriggerFalseAlarmFlash();
void neopixelClearAlert();
void neopixelUpdate();
void neopixelOff();

#endif // RAMS_RECEIVER_NEOPIXEL_H
