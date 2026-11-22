package com.example.ui.screens

import androidx.compose.runtime.Composable
import com.example.model.DeviceLinkStatus
import com.example.model.GpsData
import com.example.model.ImuData
import com.example.model.RiderProfile
import com.example.sync.Esp32SyncEngine
import com.example.sync.Esp32SyncStatus

@Composable
fun UplinkScreen(
  linkStatus: DeviceLinkStatus,
  syncStatus: Esp32SyncStatus,
  syncEngine: Esp32SyncEngine,
  gps: GpsData,
  imu: ImuData,
  riderProfile: RiderProfile,
  onTriggerEmergencyCrash: () -> Unit = {}
) {
  WearableScreen(
    linkStatus = linkStatus,
    syncStatus = syncStatus,
    syncEngine = syncEngine,
    gps = gps,
    imu = imu,
    riderProfile = riderProfile,
    onTriggerEmergencySOS = onTriggerEmergencyCrash
  )
}
