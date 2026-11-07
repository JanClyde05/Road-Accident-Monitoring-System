package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val MonochromeDarkColorScheme = darkColorScheme(
    primary = MonoWhite,
    onPrimary = Color.Black,
    primaryContainer = MonoDarkGray,
    onPrimaryContainer = MonoWhite,
    secondary = MonoLightGray,
    onSecondary = Color.Black,
    secondaryContainer = Color(0xFF262626),
    onSecondaryContainer = MonoOffWhite,
    tertiary = MonoMediumGray,
    onTertiary = Color.Black,
    tertiaryContainer = Color(0xFF1F1F1F),
    onTertiaryContainer = MonoLightGray,
    background = BackgroundDark,
    onBackground = MonoWhite,
    surface = SurfaceDark,
    onSurface = MonoWhite,
    surfaceVariant = SurfaceVariantDark,
    onSurfaceVariant = MonoMediumGray,
    outline = MonoBorder,
    outlineVariant = MonoBorderLight
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = true,
    dynamicColor: Boolean = false, // Keep strictly black & white monochrome
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = MonochromeDarkColorScheme,
        typography = Typography,
        content = content
    )
}
