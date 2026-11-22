package com.example.model

data class PingEvent(
  val seq: Long,
  val t0: Long,
  val lat: Double,
  val lon: Double,
  val hasFix: Boolean,
  val intervalMs: Long,
  val ackAt: Long? = null
)
