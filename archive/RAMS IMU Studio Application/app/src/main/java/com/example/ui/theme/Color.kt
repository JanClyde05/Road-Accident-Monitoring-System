package com.example.ui.theme

import androidx.compose.ui.graphics.Color

// Pure Monochrome Black & White Palette (Desktop companion aesthetic)
val BackgroundDark = Color(0xFF000000)      // Pure OLED Black
val SurfaceDark = Color(0xFF0D0D0D)         // Deep Monochrome Surface
val SurfaceVariantDark = Color(0xFF171717)  // Elevated Monochrome Card
val SurfaceElevatedDark = Color(0xFF242424) // Highest Elevation Monochrome

// Monochrome Grayscale Tones
val MonoWhite = Color(0xFFFFFFFF)
val MonoOffWhite = Color(0xFFF0F0F0)
val MonoLightGray = Color(0xFFD4D4D4)
val MonoMediumGray = Color(0xFFA3A3A3)
val MonoMutedGray = Color(0xFF737373)
val MonoDarkGray = Color(0xFF404040)
val MonoBorder = Color(0xFF262626)
val MonoBorderLight = Color(0xFF383838)

// CUSTOM ICON PALETTE (Intentional, correlated color coding across all icons)
// 1. Event Profile Icons:
val AccidentRed = Color(0xFFEF4444)
val AccidentRedIcon = Color(0xFFFF3B30) // Red for Fall, Impact, Skidding
val NormalGreen = Color(0xFF10B981)
val NormalGreenIcon = Color(0xFF00E676) // Neon Green for Walking, Running, Jumping, Phone Fall, Phone Shake, Normal Ride

// 2. Navigation Bar Icons:
val IconNavTimeline = Color(0xFF00E5FF)  // Electric Cyan for Live Stream Monitor
val IconNavAnalytics = Color(0xFFA855F7) // Royal Purple for Correlation Studio
val IconNavStorage = Color(0xFF10B981)   // Emerald Green for Datasets Vault
val IconNavTune = Color(0xFFF59E0B)      // Warm Amber for Hardware Diagnostics

// 3. Action & Utility Icons:
val IconExportShare = Color(0xFF00E5FF)  // Cyan for Share & CSV Export
val IconExportRules = Color(0xFFF59E0B)  // Amber for Rules JSON Export
val IconDelete = Color(0xFFEF4444)       // Crimson Red for Trash / Delete
val IconSeed = Color(0xFFA855F7)         // Violet for Seed Baseline Trials
val IconRefresh = Color(0xFF00E5FF)      // Cyan for Recalculate / Refresh
val IconSensorAccel = Color(0xFF00E5FF)  // Cyan for Accelerometer hardware
val IconSensorGyro = Color(0xFFA855F7)   // Purple for Gyroscope hardware
val IconShield = Color(0xFF10B981)       // Green for Background Security Shield
val IconSpeed = Color(0xFFFF5252)        // Red for G-Force Acceleration Speed
val IconJerk = Color(0xFFF59E0B)         // Amber for Jerk rate
val IconTilt = Color(0xFF10B981)         // Emerald for Orientation & Tilt
val IconRotation = Color(0xFF38BDF8)     // Sky Blue for Gyro rotation meter

// VIBRANT IMU SENSOR WAVEFORM TRACE COLORS (Universally correlated telemetry axes)
val WaveAx = Color(0xFFFF3B30)      // Red for X-axis Acceleration
val WaveAy = Color(0xFF00E676)      // Green for Y-axis Acceleration
val WaveAz = Color(0xFF2979FF)      // Electric Blue for Z-axis Acceleration
val WaveSvm = Color(0xFFFFEA00)     // Solar Yellow for SVM Total Acceleration Magnitude

val WaveGx = Color(0xFFFF5252)      // Coral Red for X Gyroscope
val WaveGy = Color(0xFF69F0AE)      // Mint Green for Y Gyroscope
val WaveGz = Color(0xFF40C4FF)      // Cyan Blue for Z Gyroscope
val WaveGyroMag = Color(0xFFFFD600) // Gold for Gyro Total Magnitude

// General Text & Chrome (Strictly Black & White Monochrome)
val TextPrimary = Color(0xFFFFFFFF)
val TextSecondary = Color(0xFFA3A3A3)
val TextMuted = Color(0xFF737373)
val BorderSubtle = Color(0xFF262626)
val BorderActive = Color(0xFFFFFFFF)
