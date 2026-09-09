/*
 * Road Accident Monitoring System — IMU Sensor Implementation
 * =============================================================
 * MPU-6050 driver using Wire library (I2C).
 *
 * Calibration approach: average N stationary samples to find the
 * zero-g offset for each accel axis (expecting 0,0,1g when level)
 * and the zero-rate offset for each gyro axis. These offsets are
 * subtracted from every subsequent read.
 *
 * The same read/calibrate logic is replicated in the data_logger's
 * imu_read.cpp so that collected training data and production
 * firmware use identical sensor math.
 */

#include "sensors.h"
#include "config.h"
#include <Wire.h>

// ── MPU-6050 Register Addresses ─────────────────────────────────────────────
#define MPU_ADDR        0x68
#define MPU_WHO_AM_I    0x75
#define MPU_PWR_MGMT_1  0x6B
#define MPU_ACCEL_CONFIG 0x1C
#define MPU_GYRO_CONFIG  0x1A
#define MPU_SMPLRT_DIV   0x19
#define MPU_CONFIG       0x1A
#define MPU_ACCEL_XOUT_H 0x3B

// ── Scale Factors ───────────────────────────────────────────────────────────
// ±2g range: 16384 LSB/g.  ±250°/s range: 131 LSB/(°/s).
// These match MPU-6050 default power-on config (FS_SEL=0, AFS_SEL=0).
#define ACCEL_SCALE  16384.0f
#define GYRO_SCALE   131.0f

// ── Internal State ──────────────────────────────────────────────────────────
static bool _initialized = false;

// Calibration offsets — subtracted from raw readings
static float _axOff = 0, _ayOff = 0, _azOff = 0;
static float _gxOff = 0, _gyOff = 0, _gzOff = 0;

// ── I2C Helpers ─────────────────────────────────────────────────────────────

static void _writeReg(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

static uint8_t _readReg(uint8_t reg) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)1);
  return Wire.read();
}

// ── Public API ──────────────────────────────────────────────────────────────

bool sensorsInit() {
  Wire.begin(IMU_SDA_PIN, IMU_SCL_PIN);
  Wire.setClock(400000);  // 400kHz Fast Mode

  // Verify the chip is present by reading WHO_AM_I (should return 0x68)
  uint8_t whoami = _readReg(MPU_WHO_AM_I);
  if (whoami != 0x68) {
    Serial.printf("[SENSORS] MPU-6050 not found! WHO_AM_I=0x%02X\n", whoami);
    return false;
  }

  // Wake up the MPU-6050 (clear sleep bit) and select PLL with X-axis gyro
  // as the clock source — more stable than the internal RC oscillator.
  _writeReg(MPU_PWR_MGMT_1, 0x01);
  delay(50);

  // Set sample rate divider: sample rate = 1kHz / (1+div) = 100Hz at div=9
  _writeReg(MPU_SMPLRT_DIV, 9);

  // DLPF config: bandwidth ~44Hz (smooth enough for fall detection,
  // fast enough to capture impact spikes)
  _writeReg(MPU_CONFIG, 0x03);

  // Accel range: ±2g (AFS_SEL=0) — maximum sensitivity for detecting
  // subtle freefall phases. Direct impacts above 2g will saturate,
  // but the FSM only needs to know "above threshold," not exact magnitude.
  // If saturation causes false negatives on impact detection, change to ±4g.
  _writeReg(MPU_ACCEL_CONFIG, 0x00);

  // Gyro range: ±500°/s (FS_SEL=1) — wide enough for skid detection's
  // 330°/s threshold with headroom.
  _writeReg(0x1B, 0x08);  // Register 0x1B = GYRO_CONFIG, 0x08 = FS_SEL=1

  _initialized = true;
  Serial.println(F("[SENSORS] MPU-6050 initialized (±2g, ±500°/s, 100Hz)"));
  return true;
}

void sensorsCalibrate(uint16_t samples) {
  if (!_initialized) return;

  Serial.printf("[SENSORS] Calibrating with %u samples (keep device still)...\n", samples);

  float sumAx = 0, sumAy = 0, sumAz = 0;
  float sumGx = 0, sumGy = 0, sumGz = 0;

  for (uint16_t i = 0; i < samples; i++) {
    // Read 14 bytes: accel(6) + temp(2) + gyro(6)
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(MPU_ACCEL_XOUT_H);
    Wire.endTransmission(false);
    Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)14);

    int16_t rawAx = (Wire.read() << 8) | Wire.read();
    int16_t rawAy = (Wire.read() << 8) | Wire.read();
    int16_t rawAz = (Wire.read() << 8) | Wire.read();
    Wire.read(); Wire.read(); // Skip temperature
    int16_t rawGx = (Wire.read() << 8) | Wire.read();
    int16_t rawGy = (Wire.read() << 8) | Wire.read();
    int16_t rawGz = (Wire.read() << 8) | Wire.read();

    sumAx += rawAx / ACCEL_SCALE;
    sumAy += rawAy / ACCEL_SCALE;
    sumAz += rawAz / ACCEL_SCALE;
    sumGx += rawGx / GYRO_SCALE;
    sumGy += rawGy / GYRO_SCALE;
    sumGz += rawGz / GYRO_SCALE;

    delay(5);  // ~200Hz sampling during calibration
  }

  // Accel offsets: expect (0, 0, 1g) when level.
  // Subtract the mean to zero out bias, then add 1g back to Z.
  _axOff = sumAx / samples;
  _ayOff = sumAy / samples;
  _azOff = (sumAz / samples) - 1.0f;  // Z should read 1g at rest

  // Gyro offsets: expect (0, 0, 0) when stationary
  _gxOff = sumGx / samples;
  _gyOff = sumGy / samples;
  _gzOff = sumGz / samples;

  Serial.printf("[SENSORS] Calibration done. Offsets: ax=%.3f ay=%.3f az=%.3f gx=%.2f gy=%.2f gz=%.2f\n",
                _axOff, _ayOff, _azOff, _gxOff, _gyOff, _gzOff);
}

SensorData sensorsRead() {
  SensorData data = {};
  if (!_initialized) return data;

  // Burst-read all 14 bytes in one I2C transaction for consistency
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(MPU_ACCEL_XOUT_H);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)14);

  int16_t rawAx = (Wire.read() << 8) | Wire.read();
  int16_t rawAy = (Wire.read() << 8) | Wire.read();
  int16_t rawAz = (Wire.read() << 8) | Wire.read();
  Wire.read(); Wire.read(); // Skip temperature register
  int16_t rawGx = (Wire.read() << 8) | Wire.read();
  int16_t rawGy = (Wire.read() << 8) | Wire.read();
  int16_t rawGz = (Wire.read() << 8) | Wire.read();

  // Convert to physical units and apply calibration
  data.ax = (rawAx / ACCEL_SCALE) - _axOff;
  data.ay = (rawAy / ACCEL_SCALE) - _ayOff;
  data.az = (rawAz / ACCEL_SCALE) - _azOff;
  data.gx = (rawGx / GYRO_SCALE) - _gxOff;
  data.gy = (rawGy / GYRO_SCALE) - _gyOff;
  data.gz = (rawGz / GYRO_SCALE) - _gzOff;

  // Acceleration magnitude — used by the fall FSM's freefall/impact thresholds
  data.aMag = sqrtf(data.ax * data.ax + data.ay * data.ay + data.az * data.az);

  // Orientation from accelerometer (degrees) — used for environmental detection.
  // atan2 gives tilt angles assuming the only acceleration is gravity.
  // During actual motion these are noisy, but the environmental detector uses
  // their standard deviation over a window, not instantaneous values.
  data.roll  = atan2f(data.ay, data.az) * 57.2958f;  // 180/PI
  data.pitch = atan2f(-data.ax, sqrtf(data.ay * data.ay + data.az * data.az)) * 57.2958f;

  return data;
}

bool sensorsReady() {
  return _initialized;
}
