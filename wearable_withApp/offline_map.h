/*
 * Road Accident Monitoring System — Offline Map
 * ================================================
 * Serves a static map page during setup mode. The map is a pre-captured
 * local-area image stored in flash (PROGMEM), with a live GPS pin
 * positioned via pixel-offset math.
 *
 * Fully offline in both directions: no internet on the wearable or
 * the phone viewing it. GPS coordinates come from the wearable's own
 * ATGM336H, pushed to the map page via WebSocket.
 */

#ifndef RAMS_OFFLINE_MAP_H
#define RAMS_OFFLINE_MAP_H

#include <Arduino.h>

// Generate the full HTML page for the offline map viewer.
// This embeds the map image as a base64 data URI (from map_image.h)
// and includes the WebSocket client JS for live pin updates.
String offlineMapGetHTML();

// Convert GPS coordinates to pixel offsets within the map image.
// Uses linear interpolation between the four known corner coordinates
// and the image's pixel dimensions.
// Returns true if the coordinate falls within the map bounds.
bool offlineMapGPSToPixel(float lat, float lon, int& pixelX, int& pixelY);

// Set the map bounds (GPS coordinates of the image corners).
// Must be called once during init with the actual coordinates
// corresponding to the map image edges.
void offlineMapSetBounds(float topLat, float leftLon, float bottomLat, float rightLon,
                         int imageWidth, int imageHeight);

#endif // RAMS_OFFLINE_MAP_H
