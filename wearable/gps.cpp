/*
 * Road Accident Monitoring System — GPS Implementation
 * ======================================================
 * ATGM336H module on HardwareSerial with TinyGPS++ parsing.
 *
 * Key design choice: last-known-location fallback. If GPS loses fix
 * (indoors, urban canyon), the system continues reporting the last
 * valid position rather than dropping to 0,0. This matters because
 * an accident alert with a stale-but-close location is far more useful
 * than one with no location at all.
 */

#include "gps.h"
#include "config.h"
#include <TinyGPS++.h>
#include <HardwareSerial.h>

static TinyGPSPlus _gps;
static HardwareSerial _gpsSerial(1);  // UART1 on ESP32-S3

// Last-known-good coordinates — persisted across fix dropouts
static float _lastLat = 0.0f;
static float _lastLon = 0.0f;
static bool  _everHadFix = false;

// External GPS from Phone (via WebSocket sync)
static float _extLat = 0.0f;
static float _extLon = 0.0f;
static uint8_t _extSats = 0;
static bool _extHasFix = false;
static uint32_t _extFixTimestamp = 0;

void gpsInit() {
  // Begin UART1 with the GPS module's baud rate.
  // RX/TX pin assignment uses ESP32's flexible UART matrix.
  _gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  Serial.println(F("[GPS] ATGM336H UART initialized"));
  Serial.printf("[GPS] RX=GPIO%d TX=GPIO%d baud=%d\n", GPS_RX_PIN, GPS_TX_PIN, GPS_BAUD);
}

void gpsUpdate() {
  // Feed all available bytes to the TinyGPS++ parser.
  // This must be called frequently — at least once per loop() iteration —
  // so that NMEA sentences aren't missed or split across buffer fills.
  while (_gpsSerial.available()) {
    char c = _gpsSerial.read();
    _gps.encode(c);
  }

  // Update last-known coordinates whenever we get a valid fix
  if (_gps.location.isValid() && _gps.location.isUpdated()) {
    _lastLat = _gps.location.lat();
    _lastLon = _gps.location.lng();
    _everHadFix = true;
  }
}

void gpsSetExternalLocation(float lat, float lon, uint8_t satellites, bool hasFix) {
  _extLat = lat;
  _extLon = lon;
  _extSats = satellites;
  _extHasFix = hasFix;
  _extFixTimestamp = millis();
  if (hasFix) {
    _lastLat = lat;
    _lastLon = lon;
    _everHadFix = true;
  }
}

float gpsGetLatitude() {
  if (_extHasFix && (millis() - _extFixTimestamp < 5000)) {
    return _extLat;
  }
  if (_gps.location.isValid()) {
    return _gps.location.lat();
  }
  return _lastLat;
}

float gpsGetLongitude() {
  if (_extHasFix && (millis() - _extFixTimestamp < 5000)) {
    return _extLon;
  }
  if (_gps.location.isValid()) {
    return _gps.location.lng();
  }
  return _lastLon;
}

bool gpsHasFix() {
  if (_extHasFix && (millis() - _extFixTimestamp < 5000)) {
    return true;
  }
  return _gps.location.isValid() && _gps.location.age() < 5000;
}

uint32_t gpsGetAge() {
  if (_extHasFix && (millis() - _extFixTimestamp < 5000)) {
    return (millis() - _extFixTimestamp);
  }
  return _gps.location.age();
}

uint8_t gpsGetSatellites() {
  if (_extHasFix && (millis() - _extFixTimestamp < 5000)) {
    return _extSats;
  }
  return (uint8_t)_gps.satellites.value();
}
