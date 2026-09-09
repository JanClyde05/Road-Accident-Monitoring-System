package com.example.model

import java.util.Locale
import java.util.UUID

data class RiderProfile(
  val riderName: String = "Elena Dela Cruz",
  val riderId: String = "RIDER-01",
  val plateNumber: String = "NCR-8821",
  val vehicleModel: String = "Yamaha Sniper 155cc",
  val emergencyContactName: String = "Elena Dela Cruz",
  val emergencyContactPhone: String = "+63 928 444 8920",
  val bloodType: String = "O+",
  val token: String = generateDefaultToken(),
  val netlifyHost: String = "https://rams-rescuer.netlify.app",
  val esp32WsUrl: String = "ws://192.168.4.1:81/ws",
  val isLoggedIn: Boolean = true
) {
  fun getNetlifyPindownUrl(lat: Double, lon: Double): String {
    val cleanHost = netlifyHost.trimEnd('/')
    return String.format(
      Locale.US,
      "%s/?token=%s&lat=%.6f&lon=%.6f&rider=%s&plate=%s",
      cleanHost,
      token,
      lat,
      lon,
      riderName.replace(" ", "%20"),
      plateNumber.replace(" ", "%20")
    )
  }

  fun getGoogleMapsUrl(lat: Double, lon: Double): String {
    return String.format(Locale.US, "https://maps.google.com/?q=%.6f,%.6f", lat, lon)
  }

  companion object {
    fun generateDefaultToken(): String {
      val randomHex = UUID.randomUUID().toString().replace("-", "").take(8).uppercase(Locale.US)
      return "RAMS-SEC-$randomHex"
    }

    fun generateNewToken(): String {
      val part1 = UUID.randomUUID().toString().replace("-", "").take(4).uppercase(Locale.US)
      val part2 = UUID.randomUUID().toString().replace("-", "").take(4).uppercase(Locale.US)
      return "RAMS-SEC-$part1-$part2"
    }
  }
}
