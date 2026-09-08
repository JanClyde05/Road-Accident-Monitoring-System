/*
 * Road Accident Monitoring System — Registration Handler
 * ========================================================
 * Handles the setup-mode registration form:
 *   1. User enters name + pastes a Google Drive share link
 *   2. convertDriveLink() extracts the file ID and builds a direct URL
 *   3. Client-side JS validates the converted URL resolves to an image
 *   4. On success: generate 8-char token, store in NVS, send PKT_REGISTER
 *
 * The converted URL uses lh3.googleusercontent.com/d/FILE_ID rather than
 * uc?export=view to avoid the "can't scan for viruses" interstitial.
 */

#ifndef RAMS_REGISTRATION_H
#define RAMS_REGISTRATION_H

#include <Arduino.h>

// Initialize registration subsystem (load existing token from NVS if any).
void registrationInit();

// Convert a Google Drive share link to a direct-embeddable image URL.
// Returns empty string if the link format is unrecognized.
String convertDriveLink(const String& rawUrl);

// Generate a new interface-friendly device token (e.g. RAMS-4A2F).
String generateToken(const String& name = "", const String& userType = "", const String& driveLink = "");

// Process a registration request (called from the WebSocket handler).
// name: user's display name (truncated to 23 chars for protocol)
// driveLink: raw Google Drive share URL (will be converted)
// userType: road user category (Pedestrian, Cyclist, Car Driver, Motorcycle Rider)
// Returns true if registration was saved successfully.
bool registrationProcess(const String& name, const String& driveLink, const String& userType = "Pedestrian");

// Update road user type dynamically anytime
bool registrationSetUserType(const String& userType);

// Get the current device token (empty if not registered).
String registrationGetToken();

// Get the registered user name (empty if not registered).
String registrationGetName();

// Get the converted photo URL (empty if not registered).
String registrationGetPhotoUrl();

// Get the registered road user category.
String registrationGetUserType();

// Returns true if the device has a saved registration.
bool registrationIsRegistered();

#endif // RAMS_REGISTRATION_H
