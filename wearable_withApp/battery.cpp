/*
 * Road Accident Monitoring System — Battery Monitor Implementation
 * ==================================================================
 * Oversampled ADC reading on GPIO2 through a 100k/100k voltage divider
 * to monitor a 1000mAh LiPo cell being charged via the ESP32-S3
 * SuperMini's onboard TP4056 charging IC.
 *
 * The percentage calculation uses a simple linear mapping from the
 * LiPo discharge curve endpoints (3.0V empty → 4.2V full).
 * A running average filter smooths out ADC jitter.
 */

#include "battery.h"
#include <Arduino.h>

// ── Internal State ──────────────────────────────────────────────────────────

static float    _voltage    = 0.0f;
static uint8_t  _percent    = 0;
static uint32_t _lastUpdate = 0;

// Exponential moving average coefficient (0.0–1.0)
// Lower = smoother but slower response; 0.15 gives ~1s settling at 5s interval
static const float EMA_ALPHA = 0.15f;
static bool _firstReading = true;

// ── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Read the ADC with multi-sample averaging to reduce noise.
 * Returns the raw ADC value (0–4095).
 */
static float _readAdcSmoothed() {
  uint32_t sum = 0;
  for (int i = 0; i < BATTERY_SAMPLE_COUNT; i++) {
    sum += analogRead(BATTERY_ADC_PIN);
    delayMicroseconds(100);  // Brief settle between reads
  }
  return (float)sum / (float)BATTERY_SAMPLE_COUNT;
}

/**
 * Convert raw ADC value to actual battery voltage, accounting for divider.
 */
static float _adcToVoltage(float adcValue) {
  float adcVoltage = (adcValue / BATTERY_ADC_MAX) * BATTERY_VREF;
  return adcVoltage * BATTERY_DIVIDER_RATIO;
}

/**
 * Convert battery voltage to percentage using linear interpolation
 * between empty (3.0V) and full (4.2V).
 */
static uint8_t _voltageToPct(float voltage) {
  if (voltage >= BATTERY_FULL_VOLTAGE) return 100;
  if (voltage <= BATTERY_EMPTY_VOLTAGE) return 0;

  float pct = (voltage - BATTERY_EMPTY_VOLTAGE) /
              (BATTERY_FULL_VOLTAGE - BATTERY_EMPTY_VOLTAGE) * 100.0f;
  return (uint8_t)pct;
}

// ── Public API ──────────────────────────────────────────────────────────────

void batteryInit() {
  // Configure ADC pin
  pinMode(BATTERY_ADC_PIN, INPUT);
  analogSetAttenuation(ADC_11db);   // Full 0–3.3V range
  analogReadResolution(12);         // 12-bit resolution (0–4095)

  // Take initial reading immediately
  float rawAdc = _readAdcSmoothed();
  _voltage = _adcToVoltage(rawAdc);
  _percent = _voltageToPct(_voltage);
  _firstReading = false;
  _lastUpdate = millis();

  Serial.printf("[BATTERY] Init: %.2fV → %d%% (ADC raw: %.0f)\n",
                _voltage, _percent, rawAdc);
}

void batteryUpdate() {
  uint32_t now = millis();
  if (now - _lastUpdate < BATTERY_UPDATE_INTERVAL) return;
  _lastUpdate = now;

  float rawAdc = _readAdcSmoothed();
  float newVoltage = _adcToVoltage(rawAdc);

  // Apply exponential moving average for smooth transitions
  if (_firstReading) {
    _voltage = newVoltage;
    _firstReading = false;
  } else {
    _voltage = (_voltage * (1.0f - EMA_ALPHA)) + (newVoltage * EMA_ALPHA);
  }

  _percent = _voltageToPct(_voltage);
}

uint8_t batteryGetPercent() {
  return _percent;
}

float batteryGetVoltage() {
  return _voltage;
}
