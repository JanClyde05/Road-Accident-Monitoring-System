package com.example.ui.screens

import androidx.compose.runtime.Composable
import com.example.model.RiderProfile

@Composable
fun SetupScreen(
  riderProfile: RiderProfile,
  onSaveProfile: (RiderProfile) -> Unit,
  onOpenDesignRules: () -> Unit = {}
) {
  SettingsScreen(
    riderProfile = riderProfile,
    onSaveProfile = onSaveProfile,
    onOpenDesignRules = onOpenDesignRules
  )
}
