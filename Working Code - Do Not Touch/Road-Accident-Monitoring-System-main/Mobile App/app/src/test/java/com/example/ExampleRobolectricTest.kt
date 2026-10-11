package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.model.GpsData
import com.example.model.ImuData
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("RAMS Monitor", appName)
  }

  @Test
  fun `verify imu shock calculation`() {
    val normalImu = ImuData(accelX = 0.05f, accelY = -0.12f, accelZ = 0.98f)
    assertTrue(normalImu.aMag < 1.5f)

    val shockImu = ImuData(accelX = 3.5f, accelY = 2.8f, accelZ = 1.9f)
    assertTrue(shockImu.isShockAlert)
  }
}
