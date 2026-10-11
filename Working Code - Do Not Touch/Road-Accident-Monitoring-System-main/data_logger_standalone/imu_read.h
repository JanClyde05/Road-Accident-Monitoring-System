/*
 * Road Accident Monitoring System — Data Logger IMU Read
 * ========================================================
 * Same MPU-6050 read/calibrate logic as the wearable's sensors.cpp.
 * Duplicated (not shared) because the data logger is a standalone
 * sketch with its own build — but the math MUST stay identical so
 * collected training data is directly comparable to production.
 */

#ifndef RAMS_IMU_READ_H
#define RAMS_IMU_READ_H

#include <Arduino.h>

struct IMUSample {
  float ax, ay, az;   // Accelerometer (g)
  float gx, gy, gz;   // Gyroscope (°/s)
  float aMag;          // sqrt(ax² + ay² + az²)
  float roll, pitch;   // Degrees
};

bool imuInit(uint8_t sdaPin, uint8_t sclPin);
void imuCalibrate(uint16_t samples = 200);
IMUSample imuRead();

#endif // RAMS_IMU_READ_H
