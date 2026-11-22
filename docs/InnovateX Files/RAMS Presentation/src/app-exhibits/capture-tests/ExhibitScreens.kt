package com.example.exhibit

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.unit.dp
import com.example.model.*
import com.example.sync.*
import com.example.ui.screens.*
import com.example.ui.theme.MyApplicationTheme
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers="w393dp-h780dp-normal-xxhdpi", sdk=[35], application=android.app.Application::class)
class ExhibitScreens {
  @get:Rule val compose = createComposeRule()
  private fun record(name:String, content:@Composable () -> Unit) {
    compose.mainClock.autoAdvance = false
    compose.setContent {
      MyApplicationTheme(darkTheme=true) {
        Box(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) { content() }
      }
    }
    compose.mainClock.advanceTimeBy(320)
    compose.onRoot().captureRoboImage(filePath=File(System.getenv("RAMS_CAPTURE_PATH"), name+".png").absolutePath)
  }
  @Test fun telemetry() = record("telemetry") {
    TelemetryScreen(imu=ImuData(),imuHistory=emptyList(),peakG=0f,onResetPeakG={})
  }
  @Test fun wearable() = record("wearable") {
    val scope = rememberCoroutineScope()
    WearableScreen(linkStatus=DeviceLinkStatus(),syncStatus=Esp32SyncStatus(),syncEngine=remember { Esp32SyncEngine(scope) },
      gps=GpsData(),imu=ImuData(),riderProfile=RiderProfile())
  }
}
