/*
 * Road Accident Monitoring System — Data Logger IMU Implementation
 * ==================================================================
 * IDENTICAL sensor math to wearable/sensors.cpp — DO NOT diverge.
 * If you change calibration or conversion in one, change both.
 */

#include "imu_read.h"
#include <Wire.h>

#define MPU_ADDR        0x68
#define MPU_WHO_AM_I    0x75
#define MPU_PWR_MGMT_1  0x6B
#define MPU_SMPLRT_DIV  0x19
#define MPU_CONFIG      0x1A
#define MPU_ACCEL_CONFIG 0x1C
#define MPU_ACCEL_XOUT_H 0x3B

#define ACCEL_SCALE  16384.0f  // ±2g
#define GYRO_SCALE   131.0f    // ±500°/s → register 0x1B = 0x08

static bool _initialized = false;
static float _axOff = 0, _ayOff = 0, _azOff = 0;
static float _gxOff = 0, _gyOff = 0, _gzOff = 0;

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

bool imuInit(uint8_t sdaPin, uint8_t sclPin) {
  Wire.begin(sdaPin, sclPin);
  Wire.setClock(400000);

  uint8_t whoami = _readReg(MPU_WHO_AM_I);
  if (whoami != 0x68) {
    Serial.printf("[IMU] MPU-6050 not found! WHO_AM_I=0x%02X\n", whoami);
    return false;
  }

  _writeReg(MPU_PWR_MGMT_1, 0x01);
  delay(50);
  _writeReg(MPU_SMPLRT_DIV, 9);     // 100Hz
  _writeReg(MPU_CONFIG, 0x03);       // DLPF ~44Hz
  _writeReg(MPU_ACCEL_CONFIG, 0x00); // ±2g
  _writeReg(0x1B, 0x08);            // ±500°/s

  _initialized = true;
  Serial.println(F("[IMU] MPU-6050 initialized (±2g, ±500°/s, 100Hz)"));
  return true;
}

void imuCalibrate(uint16_t samples) {
  if (!_initialized) return;
  Serial.printf("[IMU] Calibrating with %u samples...\n", samples);

  float sAx=0, sAy=0, sAz=0, sGx=0, sGy=0, sGz=0;
  for (uint16_t i = 0; i < samples; i++) {
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(MPU_ACCEL_XOUT_H);
    Wire.endTransmission(false);
    Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)14);

    int16_t rAx = (Wire.read()<<8)|Wire.read();
    int16_t rAy = (Wire.read()<<8)|Wire.read();
    int16_t rAz = (Wire.read()<<8)|Wire.read();
    Wire.read(); Wire.read();
    int16_t rGx = (Wire.read()<<8)|Wire.read();
    int16_t rGy = (Wire.read()<<8)|Wire.read();
    int16_t rGz = (Wire.read()<<8)|Wire.read();

    sAx += rAx/ACCEL_SCALE; sAy += rAy/ACCEL_SCALE; sAz += rAz/ACCEL_SCALE;
    sGx += rGx/GYRO_SCALE;  sGy += rGy/GYRO_SCALE;  sGz += rGz/GYRO_SCALE;
    delay(5);
  }

  _axOff = sAx/samples;
  _ayOff = sAy/samples;
  _azOff = (sAz/samples) - 1.0f;
  _gxOff = sGx/samples;
  _gyOff = sGy/samples;
  _gzOff = sGz/samples;

  Serial.printf("[IMU] Offsets: ax=%.3f ay=%.3f az=%.3f gx=%.2f gy=%.2f gz=%.2f\n",
                _axOff, _ayOff, _azOff, _gxOff, _gyOff, _gzOff);
}

IMUSample imuRead() {
  IMUSample s = {};
  if (!_initialized) return s;

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(MPU_ACCEL_XOUT_H);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)14);

  int16_t rAx = (Wire.read()<<8)|Wire.read();
  int16_t rAy = (Wire.read()<<8)|Wire.read();
  int16_t rAz = (Wire.read()<<8)|Wire.read();
  Wire.read(); Wire.read();
  int16_t rGx = (Wire.read()<<8)|Wire.read();
  int16_t rGy = (Wire.read()<<8)|Wire.read();
  int16_t rGz = (Wire.read()<<8)|Wire.read();

  s.ax = (rAx/ACCEL_SCALE) - _axOff;
  s.ay = (rAy/ACCEL_SCALE) - _ayOff;
  s.az = (rAz/ACCEL_SCALE) - _azOff;
  s.gx = (rGx/GYRO_SCALE) - _gxOff;
  s.gy = (rGy/GYRO_SCALE) - _gyOff;
  s.gz = (rGz/GYRO_SCALE) - _gzOff;
  s.aMag = sqrtf(s.ax*s.ax + s.ay*s.ay + s.az*s.az);
  s.roll  = atan2f(s.ay, s.az) * 57.2958f;
  s.pitch = atan2f(-s.ax, sqrtf(s.ay*s.ay + s.az*s.az)) * 57.2958f;

  return s;
}
