import sys

file_path = "apps/android_app/app/src/main/java/com/example/sensor/PhoneSensorEngine.kt"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add remappedMatrix if not present
if "private val remappedMatrix = FloatArray(9)" not in content:
    content = content.replace("private val rotationMatrix = FloatArray(9)", "private val rotationMatrix = FloatArray(9)\n  private val remappedMatrix = FloatArray(9)")

target = """  private fun updateOrientationIfReady() {
    if (hasGravity && hasMagnetic) {
      val success = SensorManager.getRotationMatrix(
        rotationMatrix,
        null,
        gravityReading,
        magneticReading
      )
      if (success) {
        val east = rotationMatrix[1].toDouble()
        val north = rotationMatrix[4].toDouble()
        val azimuth = if (east != 0.0 || north != 0.0) {
          ((Math.toDegrees(atan2(east, north)) + 360.0) % 360.0).toFloat()
        } else {
          SensorManager.getOrientation(rotationMatrix, orientationAngles)
          ((orientationAngles[0] * RAD_TO_DEG) + 360f) % 360f
        }

        SensorManager.getOrientation(rotationMatrix, orientationAngles)
        val rawPitch = orientationAngles[1] * RAD_TO_DEG
        val rawRoll = orientationAngles[2] * RAD_TO_DEG
        smoothedPitch = filterTilt(rawPitch, smoothedPitch)
        smoothedRoll = filterTilt(rawRoll, smoothedRoll)

        _phoneImuState.value = _phoneImuState.value.copy(
          pitchDegrees = smoothedPitch,
          rollDegrees = smoothedRoll,
          yawDegrees = azimuth
        )
      }
    }
  }"""

replacement = """  private fun updateOrientationIfReady() {
    if (hasGravity && hasMagnetic) {
      val success = SensorManager.getRotationMatrix(
        rotationMatrix,
        null,
        gravityReading,
        magneticReading
      )
      if (success) {
        // Remap coordinate system for handheld portrait usage (X=East, Z=North/Top of phone)
        SensorManager.remapCoordinateSystem(
          rotationMatrix,
          SensorManager.AXIS_X,
          SensorManager.AXIS_Z,
          remappedMatrix
        )
        SensorManager.getOrientation(remappedMatrix, orientationAngles)
        val rawAzimuth = ((orientationAngles[0] * RAD_TO_DEG) + 360f) % 360f
        val filteredYaw = filterAzimuth(rawAzimuth)

        SensorManager.getOrientation(rotationMatrix, orientationAngles)
        val rawPitch = orientationAngles[1] * RAD_TO_DEG
        val rawRoll = orientationAngles[2] * RAD_TO_DEG
        smoothedPitch = filterTilt(rawPitch, smoothedPitch)
        smoothedRoll = filterTilt(rawRoll, smoothedRoll)

        _phoneImuState.value = _phoneImuState.value.copy(
          pitchDegrees = smoothedPitch,
          rollDegrees = smoothedRoll,
          yawDegrees = filteredYaw
        )
      }
    }
  }"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced updateOrientationIfReady.")
else:
    print("Could not find target in PhoneSensorEngine.kt")
    sys.exit(1)

with open(file_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("Updated PhoneSensorEngine.kt successfully.")

