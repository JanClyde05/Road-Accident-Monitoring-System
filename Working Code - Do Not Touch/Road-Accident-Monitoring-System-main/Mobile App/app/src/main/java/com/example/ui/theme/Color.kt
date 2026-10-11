package com.example.ui.theme

import androidx.compose.ui.graphics.Color

// Focused Monochromatic Palette & Contrast Control (Zinc/Slate 50–950)
// Deep Canvas & Surfaces
val ZincDeepCanvasDark = Color(0xFF09090B)       // Zinc 950 Deep Canvas
val ZincSurfaceBaseDark = Color(0xFF18181B)      // Zinc 900 Surface Base
val ZincElevatedLayerDark = Color(0xFF27272A)    // Zinc 800 Elevated Layer
val ZincBorderHairlineDark = Color(0xFF27272A)   // 1px Hair-line Border
val ZincBorderSubtleDark = Color(0xFF3F3F46)     // Zinc 700 Border Accent

val ZincDeepCanvasLight = Color(0xFFFFFFFF)     // Clean White Canvas
val ZincSurfaceBaseLight = Color(0xFFFAFAFA)    // Zinc 50 Surface Base
val ZincElevatedLayerLight = Color(0xFFF4F4F5)  // Zinc 100 Elevated Layer
val ZincBorderHairlineLight = Color(0xFFE4E4E7) // Zinc 200 Hair-line Border
val ZincBorderSubtleLight = Color(0xFFD4D4D8)   // Zinc 300 Border Accent

// Ink & Typography Contrast (WCAG AA >= 4.5:1)
val ZincInkHighContrastDark = Color(0xFFFAFAFA)  // High contrast white text
val ZincInkMutedDark = Color(0xFFA1A1AA)         // Zinc 400 Muted text
val ZincInkTertiaryDark = Color(0xFF71717A)      // Zinc 500 Subtitle text

val ZincInkHighContrastLight = Color(0xFF09090B) // High contrast black text
val ZincInkMutedLight = Color(0xFF52525B)        // Zinc 600 Muted text
val ZincInkTertiaryLight = Color(0xFFA1A1AA)     // Zinc 400 Subtitle text

// Strict Semantic Accents (No fluorescent or neon glows)
val RamsAlertRed = Color(0xFFDC2626)             // Crash / Emergency Red
val RamsAlertRedMuted = Color(0xFF7F1D1D)
val RamsWarningAmber = Color(0xFFD97706)         // Diagnostics / Shock Amber
val RamsSuccessEmerald = Color(0xFF059669)       // Link OK / Cleared Emerald
val RamsSyncBlue = Color(0xFF2563EB)             // ESP32 Sync / GPS Blue
