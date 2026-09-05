/*
 * Road Accident Monitoring System — IMU Sensor Interface
 * ========================================================
 * MPU-6050 initialization, calibration, and data reading.
 * Provides calibrated accelerometer (g) and gyroscope (°/s) values
 * plus computed acceleration magnitude for the detection FSM.
 */

#ifndef RAMS_SENSORS_H
#define RAMS_SENSORS_H

#include <Arduino.h>

// Calibrated sensor reading — all values in physical units
struct SensorData {
  float ax, ay, az;   // Accelerometer (g)
  float gx, gy, gz;   // Gyroscope (°/s)
  float aMag;          // Acceleration magnitude: sqrt(ax² + ay² + az²)
  float roll, pitch;   // Orientation angles (degrees), derived from accel
};

// Initialize MPU-6050 over I2C. Returns false if the sensor isn't found.
bool sensorsInit();

// Take a calibration snapshot (device must be stationary and level).
// Averages N samples to compute zero-g offsets for accel and zero-rate
// offsets for gyro. Call once during setup before entering armed mode.
void sensorsCalibrate(uint16_t samples = 200);

// Read one sample from the MPU-6050, apply calibration offsets, and
// compute derived values (magnitude, orientation angles).
SensorData sensorsRead();

// Returns true if the sensor was successfully initialized.
bool sensorsReady();

#endif // RAMS_SENSORS_H
