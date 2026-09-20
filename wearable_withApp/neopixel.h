/*
 * Road Accident Monitoring System — NeoPixel Status LED
 * =======================================================
 * Onboard WS2812B RGB LED on ESP32-S3 SuperMini (GPIO48).
 */

#ifndef RAMS_NEOPIXEL_H
#define RAMS_NEOPIXEL_H

#include <Arduino.h>

enum NeoPixelState : uint8_t {
  NEO_OFF,           // LED off
  NEO_CONNECTING,    // Pulsing cyan — BLE advertising, waiting for phone
  NEO_GPS_ACQUIRING, // Pulsing yellow — phone connected, waiting for GPS fix
  NEO_ARMED,         // Solid green — armed, BLE connected & GPS valid
  NEO_ALERT,         // Flashing red SOS pattern — active crash/shock alert
  NEO_ERROR          // Solid red — hardware/LoRa error
};

void neopixelInit();
void neopixelSetState(NeoPixelState state);
void neopixelUpdate();
void neopixelOff();

#endif // RAMS_NEOPIXEL_H
