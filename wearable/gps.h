/*
 * Road Accident Monitoring System — GPS Interface
 * ==================================================
 * ATGM336H GPS module via UART + TinyGPS++ parser.
 * Provides last-known-location fallback so the system always has
 * a position to report, even if the GPS briefly loses fix.
 */

#ifndef RAMS_GPS_H
#define RAMS_GPS_H

#include <Arduino.h>

// Initialize GPS UART and parser. Call once in setup().
void gpsInit();

// Feed incoming UART bytes to the parser. Call frequently in loop() —
// TinyGPS++ needs continuous feeding to maintain fix currency.
void gpsUpdate();

// Current or last-known latitude (degrees, WGS84).
// Returns 0.0 if no fix has ever been obtained.
float gpsGetLatitude();

// Current or last-known longitude (degrees, WGS84).
float gpsGetLongitude();

// True if the GPS currently has a valid satellite fix.
bool gpsHasFix();

// Age of the most recent valid fix in milliseconds.
// Large values (>5000) indicate stale data.
uint32_t gpsGetAge();

// Number of satellites used in the current fix.
uint8_t gpsGetSatellites();

#endif // RAMS_GPS_H
