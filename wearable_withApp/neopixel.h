/*
 * Road Accident Monitoring System — NeoPixel Status LED
 * =======================================================
 * Onboard NeoPixel (GPIO48) status colors and SOS pattern.
 */

#ifndef RAMS_NEOPIXEL_H
#define RAMS_NEOPIXEL_H

#include <Arduino.h>

enum NeoPixelState : uint8_t {
  NEO_OFF,           // LED off
  NEO_ARMED,         // Solid green — armed, all systems OK
  NEO_GPS_ACQUIRING, // Pulsing yellow — waiting for GPS fix
  NEO_ALERT,         // SOS flash pattern in red (3 short, 3 long, 3 short)
  NEO_SETUP,         // Solid blue — setup mode active
  NEO_CONNECTING,    // Pulsing cyan — connecting/registering
  NEO_ERROR          // Solid red — initialization error
};

void neopixelInit();
void neopixelSetState(NeoPixelState state);
void neopixelUpdate();  // Call every loop() iteration for animations
void neopixelOff();

#endif // RAMS_NEOPIXEL_H
