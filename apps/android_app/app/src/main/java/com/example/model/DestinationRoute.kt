package com.example.model

/**
 * Represents a planned navigation destination and polyline corridor for RAMS live map routing.
 *
 * Strict Zero-Emoji compliance.
 */
data class DestinationRoute(
  val destinationName: String,
  val destLat: Double,
  val destLon: Double,
  val waypointsJson: String = "[]", // JSON array of [lat, lon] coordinates e.g. "[[17.61,121.72],[17.62,121.73]]"
  val distanceKm: Float = 0f,
  val durationMin: Float = 0f
)

