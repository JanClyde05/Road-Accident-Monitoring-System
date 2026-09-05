/*
 * Road Accident Monitoring System — NeoPixel Status LED Implementation
 * ======================================================================
 * Single onboard NeoPixel (WS2812B) on GPIO48 for visual status feedback.
 * Uses Adafruit NeoPixel library.
 *
 * Color scheme:
 *   Green  — armed, all systems OK
 *   Yellow — GPS acquiring
 *   Red    — active alert (SOS flash pattern)
 *   Blue   — setup mode
 *   Cyan   — connecting/registering
 *   Red solid — error state
 */

#include "neopixel.h"
#include "config.h"
#include <Adafruit_NeoPixel.h>

static Adafruit_NeoPixel _pixel(NEOPIXEL_COUNT, NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);
static NeoPixelState _state = NEO_OFF;
static uint32_t _lastUpdate = 0;
static uint8_t  _animStep = 0;
static uint8_t  _brightness = 40;  // Default brightness (0-255), kept low to save power

// ── SOS Pattern ─────────────────────────────────────────────────────────────
// International Morse SOS: 3 short (dit), 3 long (dah), 3 short (dit)
// Timing: dit=150ms, dah=450ms, gap=150ms, letter-gap=300ms
// Total one cycle ≈ 4.5 seconds

static const uint16_t _sosDurations[] = {
  150, 150,  // dit, gap
  150, 150,  // dit, gap
  150, 300,  // dit, letter-gap
  450, 150,  // dah, gap
  450, 150,  // dah, gap
  450, 300,  // dah, letter-gap
  150, 150,  // dit, gap
  150, 150,  // dit, gap
  150, 600,  // dit, word-gap
  0          // terminator
};
#define SOS_STEPS 19

void neopixelInit() {
  _pixel.begin();
  _pixel.setBrightness(_brightness);
  _pixel.clear();
  _pixel.show();
  Serial.printf("[NEOPIXEL] Initialized on GPIO%d (brightness=%d)\n",
                NEOPIXEL_PIN, _brightness);
}

void neopixelSetState(NeoPixelState state) {
  if (state == _state) return;
  _state = state;
  _animStep = 0;
  _lastUpdate = millis();
}

void neopixelUpdate() {
  uint32_t now = millis();

  switch (_state) {
    case NEO_OFF:
      _pixel.clear();
      break;

    case NEO_ARMED:
      // Solid green — everything is OK
      _pixel.setPixelColor(0, _pixel.Color(0, 180, 0));
      break;

    case NEO_GPS_ACQUIRING: {
      // Pulsing yellow — breathing effect
      uint32_t phase = (now / 10) % 200;  // 2-second cycle
      uint8_t val = (phase < 100) ? phase * 2 : (200 - phase) * 2;
      _pixel.setPixelColor(0, _pixel.Color(val, val / 2, 0));
      break;
    }

    case NEO_ALERT: {
      // SOS flash pattern in red
      // Determine if we're in an ON step (even index) or OFF step (odd index)
      if (_sosDurations[_animStep] == 0) {
        _animStep = 0;  // Loop SOS pattern
        _lastUpdate = now;
      }

      if (now - _lastUpdate >= _sosDurations[_animStep]) {
        _animStep++;
        _lastUpdate = now;
        if (_animStep >= SOS_STEPS) _animStep = 0;
      }

      // Even steps = LED on (red), odd steps = LED off
      if (_animStep % 2 == 0) {
        _pixel.setPixelColor(0, _pixel.Color(255, 0, 0));
      } else {
        _pixel.clear();
      }
      break;
    }

    case NEO_SETUP:
      // Solid blue
      _pixel.setPixelColor(0, _pixel.Color(0, 60, 255));
      break;

    case NEO_CONNECTING: {
      // Pulsing cyan
      uint32_t phase = (now / 8) % 200;
      uint8_t val = (phase < 100) ? phase * 2 : (200 - phase) * 2;
      _pixel.setPixelColor(0, _pixel.Color(0, val, val));
      break;
    }

    case NEO_ERROR:
      // Solid red
      _pixel.setPixelColor(0, _pixel.Color(255, 0, 0));
      break;
  }

  _pixel.show();
}

void neopixelOff() {
  _state = NEO_OFF;
  _pixel.clear();
  _pixel.show();
}
