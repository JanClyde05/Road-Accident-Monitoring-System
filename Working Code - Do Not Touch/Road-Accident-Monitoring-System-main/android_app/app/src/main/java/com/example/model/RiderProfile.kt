package com.example.model

import java.util.Locale

data class RiderProfile(
  val riderName: String = "",
  val driveLink: String = "",
  val userType: String = "Pedestrian",
  val token: String = "",
  val dispatchHost: String = "https://rams-backend.netlify.app",
  val wearableWsUrl: String = "ws://192.168.4.1:81/ws",
  val isLoggedIn: Boolean = false,
  val plateNumber: String = "",
  val emergencyContactPhone: String = "",
  val emergencyContactName: String = "",
  val bloodType: String = "",
  val vehicleModel: String = "",
  val allergies: String = "",
  val showNearbyIncidents: Boolean = false
) {
  // Backward compatibility accessors
  val netlifyHost: String get() = dispatchHost
  val esp32WsUrl: String get() = wearableWsUrl

  val category: String
    get() = userType

  val displayName: String
    get() = if (riderName.isBlank()) "------" else riderName

  val displayToken: String
    get() = if (token.isBlank()) "------" else token

  fun getDispatchRadarUrl(lat: Double, lon: Double): String {
    val cleanHost = dispatchHost.trimEnd('/')
    return String.format(
      Locale.US,
      "%s/?token=%s&lat=%.6f&lon=%.6f&name=%s&type=%s",
      cleanHost,
      displayToken,
      lat,
      lon,
      displayName.replace(" ", "%20"),
      userType.replace(" ", "%20")
    )
  }

  // Alias for backward compatibility
  fun getNetlifyPindownUrl(lat: Double, lon: Double): String = getDispatchRadarUrl(lat, lon)

  fun getGoogleMapsUrl(lat: Double, lon: Double): String {
    return String.format(Locale.US, "https://maps.google.com/?q=%.6f,%.6f", lat, lon)
  }

  fun saveToPreferences(context: android.content.Context) {
    val prefs = context.getSharedPreferences(PREFS_NAME, android.content.Context.MODE_PRIVATE)
    prefs.edit()
      .putString("riderName", riderName)
      .putString("driveLink", driveLink)
      .putString("userType", userType)
      .putString("token", token)
      .putString("dispatchHost", dispatchHost)
      .putString("wearableWsUrl", wearableWsUrl)
      .putBoolean("isLoggedIn", isLoggedIn)
      .putString("plateNumber", plateNumber)
      .putString("emergencyContactPhone", emergencyContactPhone)
      .putString("emergencyContactName", emergencyContactName)
      .putString("bloodType", bloodType)
      .putString("vehicleModel", vehicleModel)
      .putString("allergies", allergies)
      .putBoolean("showNearbyIncidents", showNearbyIncidents)
      .apply()
  }

  companion object {
    private const val PREFS_NAME = "rams_rider_profile_prefs"
    private const val BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

    val ROAD_USER_CATEGORIES = listOf(
      "Pedestrian",
      "Cyclist",
      "Motorcycle Rider",
      "Tricycle",
      "Car Driver",
      "Van",
      "Bus",
      "Truck"
    )

    /**
     * Generates a collision-resistant 8-character Base62 alphanumeric token formatted as "RAMS-XXXXXXXX"
     * Supporting hundreds of trillions of unique combinations (62^8 = 2.18 * 10^14) with lowercase, uppercase, and numbers.
     */
    fun generateFriendlyToken(name: String, userType: String): String {
      val seed = "${name.trim()}_${userType.trim()}_${System.nanoTime()}_${(100000..999999).random()}"
      var hash = 0x811c9dc5L
      val prime = 0x01000193L
      for (byte in seed.toByteArray(Charsets.UTF_8)) {
        hash = (hash xor (byte.toLong() and 0xFF)) * prime
      }
      val sb = StringBuilder(8)
      var v = kotlin.math.abs(hash xor (System.currentTimeMillis() shl 16))
      repeat(8) {
        sb.append(BASE62_ALPHABET[(v % BASE62_ALPHABET.length).toInt()])
        v /= BASE62_ALPHABET.length
        if (v == 0L) {
          v = kotlin.math.abs(System.nanoTime() xor (it * 7919L))
        }
      }
      return "RAMS-$sb"
    }

    fun generateNewToken(name: String = "RAMS", userType: String = "Pedestrian"): String {
      return generateFriendlyToken(name, userType)
    }

    fun generateRandomToken(): String {
      val sb = StringBuilder(8)
      repeat(8) {
        sb.append(BASE62_ALPHABET.random())
      }
      return "RAMS-$sb"
    }

    fun loadFromPreferences(context: android.content.Context): RiderProfile {
      val prefs = context.getSharedPreferences(PREFS_NAME, android.content.Context.MODE_PRIVATE)
      return RiderProfile(
        riderName = prefs.getString("riderName", "") ?: "",
        driveLink = prefs.getString("driveLink", "") ?: "",
        userType = prefs.getString("userType", "Pedestrian") ?: "Pedestrian",
        token = prefs.getString("token", "") ?: "",
        dispatchHost = prefs.getString("dispatchHost", "https://rams-backend.netlify.app") ?: "https://rams-backend.netlify.app",
        wearableWsUrl = prefs.getString("wearableWsUrl", "ws://192.168.4.1:81/ws") ?: "ws://192.168.4.1:81/ws",
        isLoggedIn = prefs.getBoolean("isLoggedIn", false),
        plateNumber = prefs.getString("plateNumber", "") ?: "",
        emergencyContactPhone = prefs.getString("emergencyContactPhone", "") ?: "",
        emergencyContactName = prefs.getString("emergencyContactName", "") ?: "",
        bloodType = prefs.getString("bloodType", "") ?: "",
        vehicleModel = prefs.getString("vehicleModel", "") ?: "",
        allergies = prefs.getString("allergies", "") ?: "",
        showNearbyIncidents = prefs.getBoolean("showNearbyIncidents", false)
      )
    }

    fun formatDirectDriveUrl(link: String): String {
      val trimmed = link.trim()
      if (trimmed.isEmpty()) return ""
      val regex = Regex("(?<=/d/|id=)([a-zA-Z0-9_-]+)")
      val match = regex.find(trimmed)
      return if (match != null) {
        "https://lh3.googleusercontent.com/d/${match.value}"
      } else {
        trimmed
      }
    }
  }
}
