/*
 * Road Accident Monitoring System — Battery Monitor
 * ====================================================
 * Default SuperMini: 100k/100k voltage divider on GPIO2.
 * RAMS_JLC_S3_J2: 30k/10k divider, 3V3-gated NMOS isolation and 1nF filter;
 * calibrated ADC millivolts are multiplied by four (4.20V -> 1.05V).
 *
 * Hardware wiring:
 *   VBAT ──[ 100kΩ ]──┬──[ 100kΩ ]── GND
 *                      │
 *                   GPIO2 (ADC)
 *
 * The divider halves the battery voltage, so the ADC reading maps to:
 *   V_battery = V_adc × 2
 *
 * LiPo voltage range (single cell):
 *   Full  = 4.20V
 *   Empty = 3.55V (percentage endpoint; firmware does not disconnect the cell)
 * 3.55V is the 3.3V regulator floor: 3.3V plus the LDO dropout at load. Below it
 * the rail sags and the module resets, so 0% must mean "about to die", not 3.0V.
 *
 * ESP32-S3 ADC: 12-bit (0–4095), default attenuation 11dB → ~0–3.3V range.
 * Since the divider halves the voltage, 4.2V → 2.1V on ADC (well within range).
 */

#ifndef RAMS_BATTERY_H
#define RAMS_BATTERY_H

#include <stdint.h>

// ── Configuration ───────────────────────────────────────────────────────────

#define BATTERY_ADC_PIN          2       // GPIO2 — connected to voltage divider midpoint
#ifdef RAMS_JLC_S3_J2
#define BATTERY_DIVIDER_RATIO    4.0f    // 30k + 10k = divide by 4
#else
#define BATTERY_DIVIDER_RATIO    2.0f    // 100k + 100k = divide by 2
#define BATTERY_VREF             3.3f    // ESP32-S3 ADC reference voltage
#define BATTERY_ADC_MAX          4095.0f // 12-bit ADC maximum value
#endif
#define BATTERY_FULL_VOLTAGE     4.20f   // Fully charged LiPo cell voltage
#define BATTERY_EMPTY_VOLTAGE    3.55f   // Percentage endpoint = 3.3V rail floor, not a protection cutoff
#define BATTERY_SAMPLE_COUNT     16      // Number of ADC samples to average (noise reduction)
#define BATTERY_UPDATE_INTERVAL  5000    // Update battery reading every 5 seconds (ms)

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Initialize the battery ADC pin and take an initial reading.
 */
void batteryInit();

/**
 * Non-blocking update — re-reads battery voltage at BATTERY_UPDATE_INTERVAL.
 * Call this from loop().
 */
void batteryUpdate();

/**
 * Get the current battery percentage (0–100), smoothed and clamped.
 */
uint8_t batteryGetPercent();

/**
 * Get the current battery voltage in volts (for diagnostics).
 */
float batteryGetVoltage();

#endif // RAMS_BATTERY_H
