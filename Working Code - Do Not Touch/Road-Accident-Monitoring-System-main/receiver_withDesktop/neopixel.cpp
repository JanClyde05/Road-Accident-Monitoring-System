/*
 * Road Accident Monitoring System — Receiver NeoPixel Implementation
 * ====================================================================
 * Single onboard NeoPixel (WS2812B) on GPIO48 for visual status feedback.
 * Uses Adafruit NeoPixel library.
 */

#include "neopixel.h"
#include "config.h"
#include <Adafruit_NeoPixel.h>

static Adafruit_NeoPixel _pixel(NEOPIXEL_COUNT, NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);
static ReceiverNeoState _state = NEO_RX_BOOT;
static uint32_t _lastUpdate = 0;
static uint8_t  _animStep = 0;
static uint8_t  _brightness = 40;

// Momentary flash overlay tracking
static uint32_t _packetFlashUntilMs = 0;
static uint32_t _falseAlarmFlashUntilMs = 0;
static uint32_t _alertStartTimeMs = 0;
static const uint32_t ALERT_AUTO_TIMEOUT_MS = 60000; // Demote alert strobe after 60s if not acknowledged

static const uint16_t _sosDurations[] = {
  120, 120,
  120, 120,
  120, 240,
  350, 120,
  350, 120,
  350, 240,
  120, 120,
  120, 120,
  120, 450,
  0
};
#define SOS_STEPS 19

void neopixelInit() {
  _pixel.begin();
  _pixel.setBrightness(_brightness);
  _pixel.clear();
  _pixel.show();
  _state = NEO_RX_BOOT;
  Serial.printf("[NEOPIXEL] Receiver onboard NeoPixel initialized on GPIO%d\n", NEOPIXEL_PIN);
}

void neopixelSetState(ReceiverNeoState state) {
  if (state == _state) return;
  _state = state;
  _animStep = 0;
  _lastUpdate = millis();
  if (state == NEO_RX_ALERT) {
    _alertStartTimeMs = millis();
  }
}

ReceiverNeoState neopixelGetState() {
  return _state;
}

void neopixelTriggerPacketFlash() {
  // Only show packet flash if not in critical alert mode
  if (_state != NEO_RX_ALERT && _state != NEO_RX_ERROR) {
    _packetFlashUntilMs = millis() + 200; // 200ms bright blue flash
  }
}

void neopixelTriggerFalseAlarmFlash() {
  _falseAlarmFlashUntilMs = millis() + 800; // 800ms double green flash
  _alertStartTimeMs = 0;
}

void neopixelClearAlert() {
  if (_state == NEO_RX_ALERT) {
    _state = NEO_RX_ONLINE_IDLE;
  }
  _alertStartTimeMs = 0;
}

void neopixelUpdate() {
  uint32_t now = millis();

  // 1. Check for momentary false alarm confirmation pulse (takes top priority)
  if (now < _falseAlarmFlashUntilMs) {
    uint32_t remaining = _falseAlarmFlashUntilMs - now;
    // Double flash green: (remaining 800..600 ON, 600..400 OFF, 400..200 ON, 200..0 OFF)
    bool onPhase = (remaining > 600) || (remaining > 200 && remaining <= 400);
    if (onPhase) {
      _pixel.setPixelColor(0, _pixel.Color(0, 255, 60)); // Vibrant emerald
    } else {
      _pixel.clear();
    }
    _pixel.show();
    return;
  }

  // 2. Check for momentary packet reception flash (200ms blue beacon)
  if (now < _packetFlashUntilMs) {
    _pixel.setPixelColor(0, _pixel.Color(0, 160, 255)); // Bright sync blue
    _pixel.show();
    return;
  }

  // 3. Main State Machine
  switch (_state) {
    case NEO_RX_OFF:
      _pixel.clear();
      break;

    case NEO_RX_BOOT: {
      // Gentle cyan pulse during boot sequence
      uint32_t phase = (now / 6) % 200;
      uint8_t val = (phase < 100) ? phase * 2 : (200 - phase) * 2;
      _pixel.setPixelColor(0, _pixel.Color(0, val, val));
      break;
    }

    case NEO_RX_AP_MODE: {
      // Pulsing amber/orange — SoftAP captive portal active
      uint32_t phase = (now / 8) % 200;
      uint8_t val = (phase < 100) ? phase * 2 : (200 - phase) * 2;
      _pixel.setPixelColor(0, _pixel.Color(val, (val * 120) / 255, 0));
      break;
    }

    case NEO_RX_CONNECTING: {
      // Pulsing cyan — connecting to Wi-Fi
      uint32_t phase = (now / 7) % 200;
      uint8_t val = (phase < 100) ? phase * 2 : (200 - phase) * 2;
      _pixel.setPixelColor(0, _pixel.Color(0, val / 2, val));
      break;
    }

    case NEO_RX_ONLINE_IDLE: {
      // Subtle breathing emerald green — healthy online reception
      uint32_t phase = (now / 15) % 200;
      uint8_t val = 40 + ((phase < 100) ? phase : (200 - phase));
      _pixel.setPixelColor(0, _pixel.Color(0, val, (val * 40) / 255));
      break;
    }

    case NEO_RX_OFFLINE_IDLE: {
      // Subtle breathing yellow — LoRa listening, offline local queue mode
      uint32_t phase = (now / 15) % 200;
      uint8_t val = 30 + ((phase < 100) ? phase : (200 - phase));
      _pixel.setPixelColor(0, _pixel.Color(val, (val * 80) / 255, 0));
      break;
    }

    case NEO_RX_ALERT: {
      // Auto-demote alert if elapsed past timeout
      if (_alertStartTimeMs > 0 && (now - _alertStartTimeMs > ALERT_AUTO_TIMEOUT_MS)) {
        _state = NEO_RX_ONLINE_IDLE;
        _alertStartTimeMs = 0;
        break;
      }

      // High-intensity SOS red strobe
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

    case NEO_RX_ERROR:
      // Solid bright red
      _pixel.setPixelColor(0, _pixel.Color(255, 0, 0));
      break;
  }

  _pixel.show();
}

void neopixelOff() {
  _state = NEO_RX_OFF;
  _pixel.clear();
  _pixel.show();
}
