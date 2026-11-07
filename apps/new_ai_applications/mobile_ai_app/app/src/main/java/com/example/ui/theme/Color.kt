package com.example.ui.theme

import androidx.compose.ui.graphics.Color

// Pure Monochrome Black & White Palette (Copied from IMU Studio companion aesthetic)
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

// Backward-compatible Zinc aliases mapped directly to Monochrome Black & White
val ZincDeepCanvasDark = BackgroundDark
val ZincSurfaceBaseDark = SurfaceDark
val ZincElevatedLayerDark = SurfaceVariantDark
val ZincBorderHairlineDark = MonoBorder
val ZincBorderSubtleDark = MonoBorderLight

val ZincDeepCanvasLight = BackgroundDark
val ZincSurfaceBaseLight = SurfaceDark
val ZincElevatedLayerLight = SurfaceVariantDark
val ZincBorderHairlineLight = MonoBorder
val ZincBorderSubtleLight = MonoBorderLight

val ZincInkHighContrastDark = MonoWhite
val ZincInkMutedDark = MonoMediumGray
val ZincInkTertiaryDark = MonoMutedGray

val ZincInkHighContrastLight = MonoWhite
val ZincInkMutedLight = MonoMediumGray
val ZincInkTertiaryLight = MonoMutedGray

// Semantic Alerts (Only important status text & critical alerts have color)
val RamsAlertRed = Color(0xFFEF4444)             // Crash / Emergency Red
val RamsAlertRedIcon = Color(0xFFFF3B30)         // Vivid Red for Fall, Impact, Skidding
val RamsAlertRedMuted = Color(0xFF7F1D1D)
val RamsWarningAmber = Color(0xFFF59E0B)         // Diagnostics / Shock Amber
val RamsSuccessEmerald = Color(0xFF10B981)       // Link OK / Armed / Cleared
val NormalGreenIcon = Color(0xFF00E676)          // Neon Green for Safe status
val RamsSyncBlue = Color(0xFF00E5FF)             // Electric Cyan for Telemetry & Sync

// CUSTOM ICON PALETTE (Intentional color coding across internal icons)
val IconNavTimeline = Color(0xFF00E5FF)  // Electric Cyan for Live Stream Monitor
val IconNavAnalytics = Color(0xFFA855F7) // Royal Purple for IMU Studio / Calibration
val IconNavStorage = Color(0xFF10B981)   // Emerald Green for Map & Datasets
val IconNavTune = Color(0xFFF59E0B)      // Warm Amber for Wearable & Hardware
val IconExportShare = Color(0xFF00E5FF)  // Cyan for Share & CSV Export
val IconImportData = Color(0xFFA855F7)   // Purple for IMU Studio Import
val IconDelete = Color(0xFFEF4444)       // Crimson Red for Trash / Delete
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
val TextPrimary = MonoWhite
val TextSecondary = MonoMediumGray
val TextMuted = MonoMutedGray
val BorderSubtle = MonoBorder
val BorderActive = MonoWhite
