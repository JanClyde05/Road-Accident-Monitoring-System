/*
 * Road Accident Monitoring System — Map Image Placeholder
 * =========================================================
 * This file will contain the PROGMEM byte array of a local-area
 * satellite/map screenshot for the offline map viewer.
 *
 * TO USE WITH AN ACTUAL MAP IMAGE:
 *   1. Capture a satellite screenshot of your local area (e.g., from Google Maps)
 *   2. Resize to ≤800x600 pixels (flash space constraint)
 *   3. Save as JPEG (compressed, smaller than PNG for flash)
 *   4. Convert to a C byte array using xxd or a similar tool:
 *        xxd -i map.jpg > map_image.h
 *   5. Replace the placeholder below with the generated array
 *   6. Update the bounds in offline_map.cpp's offlineMapSetBounds() call
 *      to match the GPS coordinates of the image's four corners
 *
 * For now, a minimal placeholder is provided. The offline_map.cpp page
 * falls back to an inline SVG grid when no real image is available.
 */

#ifndef RAMS_MAP_IMAGE_H
#define RAMS_MAP_IMAGE_H

#include <Arduino.h>

// Placeholder: empty image data. Replace with actual map image bytes.
// Example after conversion:
//   const uint8_t MAP_IMAGE_DATA[] PROGMEM = { 0xff, 0xd8, 0xff, 0xe0, ... };
//   const size_t MAP_IMAGE_SIZE = sizeof(MAP_IMAGE_DATA);

const uint8_t MAP_IMAGE_DATA[] PROGMEM = { 0x00 };
const size_t MAP_IMAGE_SIZE = 1;

#endif // RAMS_MAP_IMAGE_H
