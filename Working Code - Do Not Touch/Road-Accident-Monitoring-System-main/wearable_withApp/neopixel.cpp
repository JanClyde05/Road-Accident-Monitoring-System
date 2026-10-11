/*
 * Road Accident Monitoring System — NeoPixel Status LED Implementation
 * ======================================================================
 * Single onboard NeoPixel (WS2812B) on GPIO48 for visual status feedback.
 * Uses Adafruit NeoPixel library.
 */

#include "neopixel.h"
#include "config.h"
#include <Adafruit_NeoPixel.h>

static Adafruit_NeoPixel _pixel(NEOPIXEL_COUNT, NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);
static NeoPixelState _state = NEO_OFF;
static uint32_t _lastUpdate = 0;
static uint8_t  _animStep = 0;
static uint8_t  _brightness = 40;

static const uint16_t _sosDurations[] = {
  150, 150,
  150, 150,
  150, 300,
  450, 150,
  450, 150,
  450, 300,
  150, 150,
  150, 150,
  150, 600,
  0
};
#define SOS_STEPS 19

void neopixelInit() {
  _pixel.begin();
  _pixel.setBrightness(_brightness);
  _pixel.clear();
  _pixel.show();
  Serial.printf("[NEOPIXEL] Initialized on GPIO%d\n", NEOPIXEL_PIN);
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

    case NEO_CONNECTING: {
      // Pulsing cyan — waiting for phone BLE connection
      uint32_t phase = (now / 8) % 200;
      uint8_t val = (phase < 100) ? phase * 2 : (200 - phase) * 2;
      _pixel.setPixelColor(0, _pixel.Color(0, val, val));
      break;
    }

    case NEO_GPS_ACQUIRING: {
      // Pulsing yellow — phone connected, waiting for GPS fix
      uint32_t phase = (now / 10) % 200;
      uint8_t val = (phase < 100) ? phase * 2 : (200 - phase) * 2;
      _pixel.setPixelColor(0, _pixel.Color(val, val / 2, 0));
      break;
    }

    case NEO_ARMED:
      // Solid green — armed, phone connected, valid GPS
      _pixel.setPixelColor(0, _pixel.Color(0, 180, 0));
      break;

    case NEO_ALERT: {
      // SOS flash pattern in bright red
      if (_sosDurations[_animStep] == 0) {
        _animStep = 0;
        _lastUpdate = now;
      }

      if (now - _lastUpdate >= _sosDurations[_animStep]) {
        _animStep++;
        _lastUpdate = now;
        if (_animStep >= SOS_STEPS) _animStep = 0;
      }

      if (_animStep % 2 == 0) {
        _pixel.setPixelColor(0, _pixel.Color(255, 0, 0));
      } else {
        _pixel.clear();
      }
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
