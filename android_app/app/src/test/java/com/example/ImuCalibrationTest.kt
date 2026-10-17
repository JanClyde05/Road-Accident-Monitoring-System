package com.example

import com.example.model.AccidentClassification
import com.example.model.ImuCalibration
import org.junit.Assert.assertEquals
import org.junit.Test

class ImuCalibrationTest {

  @Test
  fun phoneFallPeakIsRejectedWithoutFactoryGCutoff() {
    val cal = ImuCalibration(
      isCalibrated = true,
      crashThresholdG = 4.55f,
      maxNegativeG = 3.1f,
      phoneFallMaxG = 3.1f,
      minAccidentG = 6.0f,
      minTiltDeltaDeg = 20f,
      minGyroMagRads = 2f
    )
    assertEquals(
      AccidentClassification.NEGATIVE_DATA,
      cal.classifyMotion(aMag = 3.1f, tiltDeltaDeg = 2f, gyroMagRads = 0.2f)
    )
  }

  @Test
  fun overlappingGUsesTiltToKeepRiderFall() {
    val cal = ImuCalibration(
      isCalibrated = true,
      crashThresholdG = 2.8f,
      maxNegativeG = 3.1f,
      phoneFallMaxG = 3.1f,
      minAccidentG = 2.8f,
      minTiltDeltaDeg = 25f,
      minGyroMagRads = 2f
    )
    assertEquals(
      AccidentClassification.NEGATIVE_PHONE_DROP,
      cal.classifyMotion(aMag = 3.1f, tiltDeltaDeg = 4f, gyroMagRads = 0.3f)
    )
    assertEquals(
      AccidentClassification.FALL,
      cal.classifyMotion(aMag = 3.1f, tiltDeltaDeg = 40f, gyroMagRads = 0.3f)
    )
  }

  @Test
  fun uncalibratedDoesNotTreatAnyGAsCrash() {
    val cal = ImuCalibration()
    assertEquals(AccidentClassification.NONE, cal.classifyMotion(aMag = 8f))
  }
}
