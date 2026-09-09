package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
  primary = ZincInkHighContrastDark,
  onPrimary = ZincDeepCanvasDark,
  primaryContainer = ZincElevatedLayerDark,
  onPrimaryContainer = ZincInkHighContrastDark,
  secondary = RamsSyncBlue,
  onSecondary = Color.White,
  secondaryContainer = ZincElevatedLayerDark,
  onSecondaryContainer = ZincInkHighContrastDark,
  tertiary = RamsWarningAmber,
  onTertiary = Color.White,
  background = ZincDeepCanvasDark,
  onBackground = ZincInkHighContrastDark,
  surface = ZincSurfaceBaseDark,
  onSurface = ZincInkHighContrastDark,
  surfaceVariant = ZincElevatedLayerDark,
  onSurfaceVariant = ZincInkMutedDark,
  outline = ZincBorderHairlineDark,
  outlineVariant = ZincBorderSubtleDark,
  error = RamsAlertRed,
  onError = Color.White
)

private val LightColorScheme = lightColorScheme(
  primary = ZincInkHighContrastLight,
  onPrimary = Color.White,
  primaryContainer = ZincElevatedLayerLight,
  onPrimaryContainer = ZincInkHighContrastLight,
  secondary = RamsSyncBlue,
  onSecondary = Color.White,
  secondaryContainer = ZincElevatedLayerLight,
  onSecondaryContainer = ZincInkHighContrastLight,
  tertiary = RamsWarningAmber,
  onTertiary = Color.White,
  background = ZincDeepCanvasLight,
  onBackground = ZincInkHighContrastLight,
  surface = ZincSurfaceBaseLight,
  onSurface = ZincInkHighContrastLight,
  surfaceVariant = ZincElevatedLayerLight,
  onSurfaceVariant = ZincInkMutedLight,
  outline = ZincBorderHairlineLight,
  outlineVariant = ZincBorderSubtleLight,
  error = RamsAlertRed,
  onError = Color.White
)

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = true,
  content: @Composable () -> Unit
) {
  val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
  MaterialTheme(
    colorScheme = colorScheme,
    typography = Typography,
    content = content
  )
}
