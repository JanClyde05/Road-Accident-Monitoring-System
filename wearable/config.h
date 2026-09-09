/*
 * Road Accident Monitoring System — Wearable Configuration
 * ==========================================================
 * All pin assignments, detection thresholds, and compile-time options.
 *
 * Pin map from spec §3.4. Thresholds from spec §6 — these are INITIAL
 * literature-based defaults. Run validate_fsm.py against collected data
 * to derive empirically-tuned values, then update these constants.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  BEFORE FLASHING:                                                │
 * │  1. Verify NeoPixel GPIO48 against your board's silkscreen      │
 * │  2. Confirm SX1278 logic levels match SuperMini I/O              │
 * └──────────────────────────────────────────────────────────────────┘
 */

#ifndef RAMS_WEARABLE_CONFIG_H
#define RAMS_WEARABLE_CONFIG_H

// ── I2C — MPU-6050 IMU ─────────────────────────────────────────────────────
#define IMU_SDA_PIN       8
#define IMU_SCL_PIN       9
#define IMU_INT_PIN       4     // MPU-6050 interrupt (data-ready)

// ── UART — ATGM336H GPS ────────────────────────────────────────────────────
#define GPS_RX_PIN        17    // ESP32 RX ← GPS TX
#define GPS_TX_PIN        18    // ESP32 TX → GPS RX
#define GPS_BAUD          9600

// ── SPI — Ra-02 LoRa (SX1278) ──────────────────────────────────────────────
#define LORA_NSS_PIN      10
#define LORA_SCK_PIN      12
#define LORA_MISO_PIN     13
#define LORA_MOSI_PIN     11
#define LORA_RST_PIN      14
#define LORA_DIO0_PIN     16

// ── Button — False-alarm / Re-arm / Setup-mode toggle ───────────────────────
// GPIO2 chosen instead of GPIO0 to avoid boot-strapping conflicts.
//#define BUTTON_PIN        2
#define BUTTON_PIN        0   //Temporary Button since it is onboard
#define BUTTON_DEBOUNCE_MS    50     // Debounce window
#define BUTTON_LONG_PRESS_MS  3000   // Hold duration to enter/exit setup mode

// ── Buzzer — Active buzzer, GPIO-driven ─────────────────────────────────────
// Active buzzer: HIGH = on, LOW = off. No PWM tone generation needed.
#define BUZZER_PIN        1

// ── NeoPixel — Onboard status LED ───────────────────────────────────────────
// Most ESP32-S3 SuperMini clones use GPIO48 for the onboard NeoPixel.
// [NOTE] Verify against your specific board's silkscreen — clone boards vary.
#define NEOPIXEL_PIN      48
#define NEOPIXEL_COUNT    1     // Single onboard LED

// ── Strapping Pins — DO NOT USE ─────────────────────────────────────────────
// GPIO0, GPIO3, GPIO45, GPIO46 — reserved by ESP32-S3 boot process.

// ── SoftAP Configuration (Setup Mode) ───────────────────────────────────────
#define SETUP_AP_SSID     "RAMS_Setup"
#define SETUP_AP_CHANNEL  1
#define SETUP_WS_PORT     81    // WebSocket port for setup-mode communication

// ── Detection Thresholds — INITIAL DEFAULTS ─────────────────────────────────
// These values come from fall-detection literature (spec §6).
// Run validate_fsm.py against collected motion data to derive empirically-
// tuned values. Replace these constants with the script's output.
//
// The "good" outcome is that derived thresholds land CLOSE to these defaults —
// it means "confirmed against local data," not "we guessed wrong."

// Fall FSM thresholds
#define FREEFALL_THRESHOLD_G    0.40f   // A_m below this = freefall phase
#define FREEFALL_MIN_DURATION_MS 100    // Sustained freefall before advancing
#define IMPACT_THRESHOLD_G      3.00f  // A_m above this = impact detected
#define IMPACT_WINDOW_MS        500    // Max time after freefall to detect impact
#define STILLNESS_THRESHOLD_G   0.15f  // σ(A_m) below this = post-impact stillness
#define STILLNESS_DURATION_MS   2000   // Stillness must persist this long to confirm

// Skid/slide detection (FSM must be idle)
#define SKID_LATERAL_G          2.00f  // |ay| threshold
#define SKID_ROLL_RATE_DPS      330.0f // |gx| threshold (degrees/second)
#define SKID_MIN_DURATION_MS    200    // Sustained duration to confirm skid

// Direct impact detection (FSM idle, not mid-skid)
#define DIRECT_IMPACT_G         4.50f  // A_m threshold for single-spike impact
#define DIRECT_IMPACT_DEBOUNCE_MS 5000 // Cooldown between direct-impact events

// Environmental detection (rolling buffer analysis, every 1000ms)
#define ENV_BUFFER_SIZE         50     // Rolling buffer sample count
#define ENV_SAMPLE_INTERVAL_MS  1000   // How often to run environmental analysis
#define ENV_GROUND_SHOCK_ACCEL_STD  0.40f  // σ(A_m) threshold for ground shock
#define ENV_GROUND_SHOCK_ORIENT_STD 10.0f  // σ(roll/pitch) max for ground shock
#define ENV_WAVE_MOTION_ACCEL_STD   0.24f  // σ(A_m) threshold for wave motion
#define ENV_WAVE_MOTION_ORIENT_STD  10.0f  // σ(roll/pitch) min for wave motion

// ── System ──────────────────────────────────────────────────────────────────
#define SERIAL_BAUD       115200

// ── Registration ────────────────────────────────────────────────────────────
#define TOKEN_LENGTH      8     // 8-char alphanumeric device token
#define NVS_NAMESPACE     "rams"

// ── Bluetooth Configuration ────────────────────────────────────────────────
#define RAMS_BT_DEVICE_NAME "RAMS Bluetooth Connection"

#endif // RAMS_WEARABLE_CONFIG_H

