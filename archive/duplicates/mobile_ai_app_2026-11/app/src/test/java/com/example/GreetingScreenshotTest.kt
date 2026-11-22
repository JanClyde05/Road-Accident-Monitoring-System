package com.example

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import com.example.model.DeviceLinkStatus
import com.example.model.GpsData
import com.example.model.ImuData
import com.example.ui.components.TelemetryBar
import com.example.ui.theme.MyApplicationTheme
import com.github.takahirom.roborazzi.RobolectricDeviceQualifiers
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = RobolectricDeviceQualifiers.Pixel8, sdk = [36])
class GreetingScreenshotTest {

  @get:Rule val composeTestRule = createComposeRule()

  @Test
  fun telemetry_bar_screenshot() {
    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = true) {
        TelemetryBar(
          gps = GpsData(),
          imu = ImuData(),
          linkStatus = DeviceLinkStatus(),
          peakAMag = 1.02f,
          onResetPeakG = {}
        )
      }
    }

    composeTestRule.onRoot().captureRoboImage(filePath = "src/test/screenshots/telemetry_bar.png")
  }
}
