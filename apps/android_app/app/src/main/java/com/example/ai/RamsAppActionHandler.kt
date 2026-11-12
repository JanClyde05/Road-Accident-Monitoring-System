package com.example.ai

/**
 * Interface empowering RAMS Voice AI to directly execute commands and alter parameters
 * within the application (Category change, Navigation tabs, Calibration, Recording, Wearable).
 *
 * Strict Zero-Emoji compliance.
 */
interface RamsAppActionHandler {
    fun setTransitCategory(category: String): Boolean
    fun navigateToTab(tabName: String): Boolean
    fun toggleDarkMode(): Boolean
    fun zeroImuCalibration(): Boolean
    fun toggleCsvRecording(): Boolean
    fun cancelEmergencyAlarm(): Boolean
    fun reconnectWearable(): Boolean
    fun triggerSimulation(): Boolean
    fun saveLearnedVoicePattern(query: String, response: String)
    fun pinAndRouteToLocation(locationQuery: String): Boolean = false
    fun clearMapRoute(): Boolean = false
    fun compactMotionData(): Int = 0
}

