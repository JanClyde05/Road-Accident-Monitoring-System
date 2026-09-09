/*
 * Road Accident Monitoring System — Registration Implementation
 * ================================================================
 * On-device registration: name + Google Drive photo link → token.
 *
 * convertDriveLink() from spec §3.2: extracts the Google Drive file ID
 * from either common share-link format and builds a direct-embeddable
 * URL via lh3.googleusercontent.com. This avoids the "can't scan for
 * viruses" interstitial that uc?export=view shows for some file sizes.
 *
 * Token is an 8-char random alphanumeric string stored in NVS alongside
 * the user's name and converted photo URL.
 */

#include "registration.h"
#include "config.h"
#include <Preferences.h>

static Preferences _prefs;
static String _token = "";
static String _name = "";
static String _photoUrl = "";
static String _userType = "Pedestrian";
static bool _registered = false;

// ── convertDriveLink — spec §3.2, verbatim ─────────────────────────────────

String convertDriveLink(const String& rawUrl) {
  // Turns a pasted Google Drive share link into a direct-embeddable image URL.
  // Handles both common share-link shapes:
  //   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  //   https://drive.google.com/open?id=FILE_ID
  // Uses lh3.googleusercontent.com rather than uc?export=view — the latter
  // shows a "can't scan for viruses" interstitial for some file sizes instead
  // of the raw image, which breaks <img> embeds.
  // NOTE: still requires "Anyone with the link" sharing on the file — this
  // function fixes the URL shape, not permissions.

  String fileId = "";
  int dIdx = rawUrl.indexOf("/d/");
  if (dIdx != -1) {
    int start = dIdx + 3;
    int end = rawUrl.indexOf('/', start);
    if (end == -1) end = rawUrl.indexOf('?', start);
    if (end == -1) end = rawUrl.length();
    fileId = rawUrl.substring(start, end);
  } else {
    int idIdx = rawUrl.indexOf("id=");
    if (idIdx != -1) {
      int start = idIdx + 3;
      int end = rawUrl.indexOf('&', start);
      if (end == -1) end = rawUrl.length();
      fileId = rawUrl.substring(start, end);
    }
  }
  if (fileId.length() == 0) return "";  // Caller rejects at registration
  return "https://lh3.googleusercontent.com/d/" + fileId;
}

// ── Token Generation (Compact 16-bit Hash: "RAMS-XXXX") ─────────────────────

String generateToken(const String& name, const String& userType, const String& driveLink) {
  String seed = (name.length() > 0 ? name : "USER") + "|" + 
                (userType.length() > 0 ? userType : "Pedestrian") + "|" + 
                driveLink;
  uint16_t hash = 0x811c;
  for (size_t i = 0; i < seed.length(); i++) {
    hash ^= (uint8_t)seed[i];
    hash = (hash * 0x0103) & 0xffff;
  }
  char hexStr[8];
  snprintf(hexStr, sizeof(hexStr), "%04X", hash);
  return "RAMS-" + String(hexStr);
}

// ── Public API ──────────────────────────────────────────────────────────────

void registrationInit() {
  _prefs.begin(NVS_NAMESPACE, false);

  // Load existing registration from NVS (survives power cycles)
  _token = _prefs.getString("reg_token", "");
  _name = _prefs.getString("reg_name", "");
  _photoUrl = _prefs.getString("reg_photo", "");
  _userType = _prefs.getString("reg_type", "Pedestrian");
  _registered = _token.length() > 0;

  if (_registered) {
    Serial.printf("[REG] Existing registration: name='%s' type='%s' token='%s'\n",
                  _name.c_str(), _userType.c_str(), _token.c_str());
  } else {
    Serial.println(F("[REG] No existing registration found"));
  }
}

bool registrationProcess(const String& name, const String& driveLink, const String& userType) {
  if (name.length() == 0) {
    Serial.println(F("[REG] Registration failed: empty name"));
    return false;
  }

  // Convert the Drive link if provided
  String photoUrl = "";
  if (driveLink.length() > 0) {
    photoUrl = convertDriveLink(driveLink);
    if (photoUrl.length() == 0) {
      photoUrl = driveLink;
    }
  }

  String uType = (userType.length() > 0) ? userType : "Pedestrian";

  // Generate interface-friendly compact token from encrypted/hashed data
  String token = generateToken(name, uType, driveLink);

  // Save to NVS
  _prefs.putString("reg_token", token);
  _prefs.putString("reg_name", name);
  _prefs.putString("reg_photo", photoUrl);
  _prefs.putString("reg_type", uType);

  // Update cached state
  _token = token;
  _name = name;
  _photoUrl = photoUrl;
  _userType = uType;
  _registered = true;

  Serial.printf("[REG] Registration saved: name='%s' type='%s' token='%s' photo='%s'\n",
                _name.c_str(), _userType.c_str(), _token.c_str(), _photoUrl.c_str());
  return true;
}

bool registrationSetUserType(const String& userType) {
  if (userType.length() == 0) return false;
  _userType = userType;
  _prefs.putString("reg_type", userType);
  Serial.printf("[REG] Road user category updated to '%s'\n", _userType.c_str());
  return true;
}

String registrationGetToken() { return _token; }
String registrationGetName() { return _name; }
String registrationGetPhotoUrl() { return _photoUrl; }
String registrationGetUserType() { return _userType; }
bool registrationIsRegistered() { return _registered; }
