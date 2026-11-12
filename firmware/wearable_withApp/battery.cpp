/*
 * Road Accident Monitoring System — Battery Monitor Implementation
 * ==================================================================
 * Oversampled ADC reading on GPIO2, with divider and calibration selected
 * by the board profile in battery.h.
 *
 * The percentage calculation uses a simple linear mapping from the
 * usable endpoints (3.55V regulator floor → 4.2V full).
 * A running average filter smooths out ADC jitter.
 */

#include "battery.h"
#include <Arduino.h>

// ── Internal State ──────────────────────────────────────────────────────────

static float    _voltage    = 0.0f;
static uint8_t  _percent    = 0;
static uint32_t _lastUpdate = 0;

// Exponential moving average coefficient (0.0–1.0)
// Lower = smoother but slower response; 0.15 gives a ~31s time constant at 5s intervals
static const float EMA_ALPHA = 0.15f;
static bool _firstReading = true;

// ── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Read the ADC with multi-sample averaging to reduce noise.
 * Returns calibrated millivolts for J2, or raw ADC counts for SuperMini.
 */
static float _readAdcSmoothed() {
  uint32_t sum = 0;
  for (int i = 0; i < BATTERY_SAMPLE_COUNT; i++) {
#ifdef RAMS_JLC_S3_J2
    sum += analogReadMilliVolts(BATTERY_ADC_PIN);
#else
    sum += analogRead(BATTERY_ADC_PIN);
#endif
    delayMicroseconds(100);  // Brief settle between reads
  }
  return (float)sum / (float)BATTERY_SAMPLE_COUNT;
}

/**
 * Convert the selected ADC units to battery voltage, accounting for divider.
 */
static float _adcToVoltage(float adcValue) {
#ifdef RAMS_JLC_S3_J2
  float adcVoltage = adcValue / 1000.0f;
#else
  float adcVoltage = (adcValue / BATTERY_ADC_MAX) * BATTERY_VREF;
#endif
  return adcVoltage * BATTERY_DIVIDER_RATIO;
}

/**
 * Convert battery voltage to percentage using linear interpolation
 * between empty (3.55V regulator floor) and full (4.2V).
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
#ifdef RAMS_JLC_S3_J2
  // Core 3.3.5 calibrates with the global setting and needs an attached pin.
  // GPIO2 is the only ADC channel used by this firmware.
  analogSetAttenuation(ADC_2_5db);
  analogRead(BATTERY_ADC_PIN);      // Attach before setting per-pin attenuation
  analogSetPinAttenuation(BATTERY_ADC_PIN, ADC_2_5db); // S3 range: 0–1.25V
#else
  analogSetAttenuation(ADC_11db);   // Full 0–3.3V range
#endif
  analogReadResolution(12);         // 12-bit resolution (0–4095)

  // Take initial reading immediately
  float rawAdc = _readAdcSmoothed();
  _voltage = _adcToVoltage(rawAdc);
  _percent = _voltageToPct(_voltage);
  _firstReading = false;
  _lastUpdate = millis();

#ifdef RAMS_JLC_S3_J2
  Serial.printf("[BATTERY] Init: %.2fV → %d%% (ADC mV: %.0f)\n",
#else
  Serial.printf("[BATTERY] Init: %.2fV → %d%% (ADC raw: %.0f)\n",
#endif
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
