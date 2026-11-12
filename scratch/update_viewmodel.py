import os

path = r"d:\Antigravity\Projects\Danger Monitoring System V2\apps\android_app\app\src\main\java\com\example\viewmodel\RamsViewModel.kt"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add compactMotionData to appActionHandler
old_handler = """    override fun clearMapRoute(): Boolean {
      this@RamsViewModel.clearMapRoute()
      return true
    }
  }"""

new_handler = """    override fun clearMapRoute(): Boolean {
      this@RamsViewModel.clearMapRoute()
      return true
    }

    override fun compactMotionData(): Int {
      return sensorAiEngine.autoCompactLearnedPatterns()
    }
  }"""

assert old_handler in content, "old_handler not found"
content = content.replace(old_handler, new_handler)

# 2. Update cancelFalseAlarm to learn the movement pattern
old_cancel = """    csvExportManager.imuCalibrationManager.recordFalseAlarmSuppressed("False alarm dismissed by rider via mobile app / voice command / wearable physical button")
    val currentRider = _riderProfile.value"""

new_cancel = """    val learnedPattern = sensorAiEngine.learnFalseAlarmPattern(
      speedKmh = gpsState.value.speedKmh,
      notes = "Dismissed by rider via mobile app / voice command / wearable physical button"
    )
    if (learnedPattern != null) {
      csvExportManager.imuCalibrationManager.recordFalseAlarmSuppressed(
        "Adaptive AI learned false alarm #${learnedPattern.id} (Peak %.2fG, %.1f° tilt, %.0f km/h, seen %dx)".format(
          learnedPattern.maxSvmG, learnedPattern.tiltDeltaDeg, learnedPattern.preSpeedKmh, learnedPattern.occurrences
        )
      )
    } else {
      csvExportManager.imuCalibrationManager.recordFalseAlarmSuppressed("False alarm dismissed by rider via mobile app / voice command / wearable physical button")
    }
    val currentRider = _riderProfile.value"""

assert old_cancel in content, "old_cancel not found"
content = content.replace(old_cancel, new_cancel)

# 3. Expose compactAllLearnedData method
old_clear_map = """  fun clearMapRoute() {
    _destinationRouteFlow.value = null
  }"""

new_clear_map = """  fun clearMapRoute() {
    _destinationRouteFlow.value = null
  }

  fun compactAllLearnedData(): Pair<Int, Int> {
    val motionPruned = sensorAiEngine.autoCompactLearnedPatterns()
    val voicePruned = voiceAlarmCanceler.assistantEngine.autoCompactDistilledKnowledge()
    return Pair(motionPruned, voicePruned)
  }"""

assert old_clear_map in content, "old_clear_map not found"
content = content.replace(old_clear_map, new_clear_map)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated RamsViewModel.kt")

