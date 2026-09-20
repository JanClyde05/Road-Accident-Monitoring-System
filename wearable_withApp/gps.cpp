/*
 * Road Accident Monitoring System — Phone-Assisted GPS Implementation
 * =====================================================================
 * Ingests and stores GPS data received from companion Android app over BLE.
 */

#include "gps.h"

static float    _lat = 0.0f;
static float    _lon = 0.0f;
static float    _speed = 0.0f;
static float    _altitude = 0.0f;
static uint8_t  _satellites = 0;
static bool     _hasFix = false;
static uint32_t _fixTimestamp = 0;

void gpsInit() {
  Serial.println(F("[GPS] Phone-assisted GPS ready"));
}

void gpsUpdate() {
  // GPS coordinates arrive asynchronously via BLE
}

void gpsSetExternalLocation(float lat, float lon, uint8_t satellites, bool hasFix, float speed, float altitude) {
  _lat = lat;
  _lon = lon;
  _satellites = satellites;
  _hasFix = hasFix;
  _speed = speed;
  _altitude = altitude;
  _fixTimestamp = millis();
}

float gpsGetLatitude() {
  return _lat;
}

float gpsGetLongitude() {
  return _lon;
}

bool gpsHasFix() {
  return _hasFix && ((millis() - _fixTimestamp) < 30000);
}

uint32_t gpsGetAge() {
  if (_fixTimestamp == 0) return 999999;
  return millis() - _fixTimestamp;
}

uint8_t gpsGetSatellites() {
  return _satellites;
}

float gpsGetSpeed() {
  return _speed;
}

float gpsGetAltitude() {
  return _altitude;
}
