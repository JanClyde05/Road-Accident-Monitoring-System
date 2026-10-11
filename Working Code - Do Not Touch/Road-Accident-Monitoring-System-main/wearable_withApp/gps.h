/*
 * Road Accident Monitoring System — Phone-Assisted GPS Interface
 * ================================================================
 * GPS telemetry is supplied by the connected Android smartphone via BLE.
 */

#ifndef RAMS_GPS_H
#define RAMS_GPS_H

#include <Arduino.h>

void gpsInit();
void gpsUpdate();
float gpsGetLatitude();
float gpsGetLongitude();
bool gpsHasFix();
uint32_t gpsGetAge();
uint8_t gpsGetSatellites();
float gpsGetSpeed();
float gpsGetAltitude();
void gpsSetExternalLocation(float lat, float lon, uint8_t satellites = 10, bool hasFix = true, float speed = 0.0f, float altitude = 0.0f);

#endif // RAMS_GPS_H
