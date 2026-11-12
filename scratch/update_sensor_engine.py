import os

path = r"d:\Antigravity\Projects\Danger Monitoring System V2\apps\android_app\app\src\main\java\com\example\ai\SensorAiInferenceEngine.kt"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update MotionProfile
old_profile = """        MOTORCYCLE_WIND_FLUTTER("Motorcycle High-Speed Wind Flutter", false, "High-frequency aerodynamic pocket flutter (40-60 km/h) with sustained vehicular momentum and upright posture. FALSE ALARM SUPPRESSED."),
        SEVERE_COLLISION("Severe Crash Collision", true, "Violent collision shockwave (>5.0G) with extreme tilt (>45°) and rapid deceleration. ALARM CONFIRMED."),"""

new_profile = """        MOTORCYCLE_WIND_FLUTTER("Motorcycle High-Speed Wind Flutter", false, "High-frequency aerodynamic pocket flutter (40-60 km/h) with sustained vehicular momentum and upright posture. FALSE ALARM SUPPRESSED."),
        LEARNED_FALSE_ALARM("Learned False Alarm Profile", false, "Motion dynamics match previously dismissed false alarm signature. False alarm safely suppressed by adaptive learning."),
        SEVERE_COLLISION("Severe Crash Collision", true, "Violent collision shockwave (>5.0G) with extreme tilt (>45°) and rapid deceleration. ALARM CONFIRMED."),"""

assert old_profile in content, "old_profile not found"
content = content.replace(old_profile, new_profile)

# 2. Update MovementCategory
old_cat = """        MOTORCYCLE_WIND_FLUTTER("HIGH-SPEED WIND FLUTTER (40-60 KM/H)", false, 0xFF10B981),
        NORMAL_CRUISING("NORMAL CRUISING RIDE", false, 0xFF10B981),"""

new_cat = """        MOTORCYCLE_WIND_FLUTTER("HIGH-SPEED WIND FLUTTER (40-60 KM/H)", false, 0xFF10B981),
        LEARNED_FALSE_ALARM("LEARNED FALSE ALARM PROFILE", false, 0xFF10B981),
        NORMAL_CRUISING("NORMAL CRUISING RIDE", false, 0xFF10B981),"""

assert old_cat in content, "old_cat not found"
content = content.replace(old_cat, new_cat)

# 3. Add LearnedMotionPattern data class before BenchmarkTrialResult
target_data_class = """    data class BenchmarkTrialResult("""
learned_data_class = """    data class LearnedMotionPattern(
        val id: String,
        var timestamp: Long,
        var preSpeedKmh: Float,
        var maxSvmG: Float,
        var minSvmG: Float,
        var meanSvmG: Float,
        var tiltDeltaDeg: Float,
        var maxGyroMag: Float,
        var maxJerk: Float,
        var zeroCrossingRate: Float,
        var occurrences: Int = 1,
        val notes: String = ""
    )

    data class BenchmarkTrialResult("""

assert target_data_class in content, "target_data_class not found"
content = content.replace(target_data_class, learned_data_class)

# 4. Add state flows and properties
target_state_flows = """    private val _benchmarkSummaryFlow = MutableStateFlow<BenchmarkEvaluationSummary?>(null)
    val benchmarkSummaryFlow: StateFlow<BenchmarkEvaluationSummary?> = _benchmarkSummaryFlow.asStateFlow()

    // Listener triggered when a severe crash is identified or simulated"""

new_state_flows = """    private val _benchmarkSummaryFlow = MutableStateFlow<BenchmarkEvaluationSummary?>(null)
    val benchmarkSummaryFlow: StateFlow<BenchmarkEvaluationSummary?> = _benchmarkSummaryFlow.asStateFlow()

    // Adaptive False-Alarm Learning & Auto-Compaction
    private val learnedPatterns = java.util.concurrent.CopyOnWriteArrayList<LearnedMotionPattern>()
    private val _learnedPatternsCountFlow = MutableStateFlow(0)
    val learnedPatternsCountFlow: StateFlow<Int> = _learnedPatternsCountFlow.asStateFlow()

    private var lastEvaluatedFeatures: FeatureVector? = null
    private var lastEvaluatedSpeedKmh: Float = 0f
    private val LEARNED_PATTERNS_FILE = "learned_motion_patterns.json"
    private val LEARNED_STREAM_FILE = "learned_false_alarms_stream.jsonl"

    init {
        loadLearnedMotionPatterns()
    }

    // Listener triggered when a severe crash is identified or simulated"""

assert target_state_flows in content, "target_state_flows not found"
content = content.replace(target_state_flows, new_state_flows)

# 5. In runTier1Inference, record lastEvaluatedFeatures & add learned pattern match
target_tier1_start = """    fun runTier1Inference(f: FeatureVector, startTimeMs: Long, preSpeedKmh: Float): Tier1Result {
        val isFreefall = f.minSvmG < 0.25f"""

new_tier1_start = """    fun runTier1Inference(f: FeatureVector, startTimeMs: Long, preSpeedKmh: Float): Tier1Result {
        lastEvaluatedFeatures = f
        lastEvaluatedSpeedKmh = preSpeedKmh

        val isFreefall = f.minSvmG < 0.25f"""

assert target_tier1_start in content, "target_tier1_start not found"
content = content.replace(target_tier1_start, new_tier1_start)

target_when = """        when {
            // 1. Severe Vehicular Collision"""

new_when = """        val matchedLearnedFa = if (f.maxSvmG < 6.0f) findMatchingLearnedPattern(f, preSpeedKmh) else null

        when {
            // 0. Adaptive Learned False-Alarm Pattern Suppression (Safety Invariant: maxSvmG < 6.0G)
            matchedLearnedFa != null -> {
                profile = MotionProfile.LEARNED_FALSE_ALARM
                hazard = HazardClass.ADL_FALSE_ALARM
                conf = 0.99f
                category = MovementCategory.LEARNED_FALSE_ALARM
                reason = "Matched learned false-alarm pattern #${matchedLearnedFa.id} (seen ${matchedLearnedFa.occurrences}x, baseline %.2fG). False alarm safely suppressed."
                    .format(Locale.US, matchedLearnedFa.maxSvmG)
                thought = "Kinematic signature matches learned false-alarm pattern #${matchedLearnedFa.id} previously dismissed by rider. Peak %.2fG shock safely suppressed by continuous adaptive learning."
                    .format(Locale.US, f.maxSvmG)
            }
            // 1. Severe Vehicular Collision"""

assert target_when in content, "target_when not found"
content = content.replace(target_when, new_when)

# 6. Add load/save/match/learn/compact methods before simulateScenario
target_methods_anchor = """    /**
     * Interactive scenario simulator for live demonstrations and testing."""

new_methods = """    private fun loadLearnedMotionPatterns() {
        try {
            val file = java.io.File(context.filesDir, LEARNED_PATTERNS_FILE)
            if (file.exists()) {
                val text = file.readText()
                if (text.isNotBlank()) {
                    val arr = org.json.JSONArray(text)
                    val loaded = ArrayList<LearnedMotionPattern>()
                    for (i in 0 until arr.length()) {
                        val obj = arr.getJSONObject(i)
                        loaded.add(
                            LearnedMotionPattern(
                                id = obj.optString("id", "FA-$i"),
                                timestamp = obj.optLong("timestamp", System.currentTimeMillis()),
                                preSpeedKmh = obj.optDouble("preSpeedKmh", 0.0).toFloat(),
                                maxSvmG = obj.optDouble("maxSvmG", 1.0).toFloat(),
                                minSvmG = obj.optDouble("minSvmG", 1.0).toFloat(),
                                meanSvmG = obj.optDouble("meanSvmG", 1.0).toFloat(),
                                tiltDeltaDeg = obj.optDouble("tiltDeltaDeg", 0.0).toFloat(),
                                maxGyroMag = obj.optDouble("maxGyroMag", 0.0).toFloat(),
                                maxJerk = obj.optDouble("maxJerk", 0.0).toFloat(),
                                zeroCrossingRate = obj.optDouble("zeroCrossingRate", 0.0).toFloat(),
                                occurrences = obj.optInt("occurrences", 1),
                                notes = obj.optString("notes", "")
                            )
                        )
                    }
                    learnedPatterns.clear()
                    learnedPatterns.addAll(loaded)
                    _learnedPatternsCountFlow.value = learnedPatterns.size
                    Log.i(TAG, "Loaded ${learnedPatterns.size} learned false alarm motion patterns.")
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed loading learned motion patterns: ${e.message}")
        }
    }

    fun saveLearnedMotionPatterns() {
        try {
            val arr = org.json.JSONArray()
            for (p in learnedPatterns) {
                val obj = org.json.JSONObject().apply {
                    put("id", p.id)
                    put("timestamp", p.timestamp)
                    put("preSpeedKmh", p.preSpeedKmh.toDouble())
                    put("maxSvmG", p.maxSvmG.toDouble())
                    put("minSvmG", p.minSvmG.toDouble())
                    put("meanSvmG", p.meanSvmG.toDouble())
                    put("tiltDeltaDeg", p.tiltDeltaDeg.toDouble())
                    put("maxGyroMag", p.maxGyroMag.toDouble())
                    put("maxJerk", p.maxJerk.toDouble())
                    put("zeroCrossingRate", p.zeroCrossingRate.toDouble())
                    put("occurrences", p.occurrences)
                    put("notes", p.notes)
                }
                arr.put(obj)
            }
            val tempFile = java.io.File(context.filesDir, "$LEARNED_PATTERNS_FILE.tmp")
            tempFile.writeText(arr.toString(2))
            val targetFile = java.io.File(context.filesDir, LEARNED_PATTERNS_FILE)
            tempFile.renameTo(targetFile)
            _learnedPatternsCountFlow.value = learnedPatterns.size
        } catch (e: Exception) {
            Log.w(TAG, "Failed saving learned motion patterns: ${e.message}")
        }
    }

    fun findMatchingLearnedPattern(f: FeatureVector, speedKmh: Float): LearnedMotionPattern? {
        if (f.maxSvmG >= 6.0f) return null // Strict safety invariant: Catastrophic impacts never suppressed
        for (p in learnedPatterns) {
            val dG = kotlin.math.abs(p.maxSvmG - f.maxSvmG)
            val dTilt = kotlin.math.abs(p.tiltDeltaDeg - f.tiltDeltaDeg)
            val dGyro = kotlin.math.abs(p.maxGyroMag - f.maxGyroMag)
            val speedCompatible = if (p.preSpeedKmh >= 15f) speedKmh >= 10f else speedKmh < 20f

            if (dG <= 0.65f && dTilt <= 14.0f && dGyro <= 35.0f && speedCompatible) {
                return p
            }
        }
        return null
    }

    fun learnFalseAlarmPattern(speedKmh: Float, notes: String = "False alarm dismissed by rider"): LearnedMotionPattern? {
        val f = lastEvaluatedFeatures ?: run {
            val window: List<ImuData>
            synchronized(sampleBuffer) {
                if (sampleBuffer.isEmpty()) return null
                window = ArrayList(sampleBuffer)
            }
            extractFeatures(window, speedKmh)
        }

        // Strict Safety Invariant: Catastrophic collision shockwaves (>= 6.0G) must NEVER be suppressed by learned patterns
        if (f.maxSvmG >= 6.0f) {
            Log.w(TAG, "Safety invariant triggered: ${f.maxSvmG}G shock cannot be registered as false alarm pattern.")
            return null
        }

        val existing = findMatchingLearnedPattern(f, speedKmh)
        val resultPattern: LearnedMotionPattern

        if (existing != null) {
            existing.occurrences++
            existing.maxSvmG = (existing.maxSvmG * 0.7f) + (f.maxSvmG * 0.3f)
            existing.tiltDeltaDeg = (existing.tiltDeltaDeg * 0.7f) + (f.tiltDeltaDeg * 0.3f)
            existing.maxGyroMag = kotlin.math.max(existing.maxGyroMag, f.maxGyroMag)
            existing.timestamp = System.currentTimeMillis()
            resultPattern = existing
            Log.i(TAG, "Updated existing learned false alarm #${existing.id} (seen ${existing.occurrences}x)")
        } else {
            val newId = "FA-${(System.currentTimeMillis() % 100000)}"
            val newP = LearnedMotionPattern(
                id = newId,
                timestamp = System.currentTimeMillis(),
                preSpeedKmh = speedKmh,
                maxSvmG = f.maxSvmG,
                minSvmG = f.minSvmG,
                meanSvmG = f.meanSvmG,
                tiltDeltaDeg = f.tiltDeltaDeg,
                maxGyroMag = f.maxGyroMag,
                maxJerk = f.maxJerk,
                zeroCrossingRate = f.zeroCrossingRate,
                occurrences = 1,
                notes = notes
            )
            learnedPatterns.add(newP)
            resultPattern = newP
            Log.i(TAG, "Learned new false alarm motion pattern #${newId}: Peak ${f.maxSvmG}G, Tilt ${f.tiltDeltaDeg} deg at ${speedKmh} km/h")
        }

        if (learnedPatterns.size > 50) {
            autoCompactLearnedPatterns()
        } else {
            saveLearnedMotionPatterns()
        }

        // Append to persistent stream JSONL with complete 14-parameter tensor for retraining
        try {
            val streamFile = java.io.File(context.filesDir, LEARNED_STREAM_FILE)
            val streamObj = org.json.JSONObject().apply {
                put("id", resultPattern.id)
                put("timestamp", resultPattern.timestamp)
                put("preSpeedKmh", speedKmh.toDouble())
                put("maxSvmG", f.maxSvmG.toDouble())
                put("minSvmG", f.minSvmG.toDouble())
                put("meanSvmG", f.meanSvmG.toDouble())
                put("stdSvmG", f.stdSvmG.toDouble())
                put("rmsSvmG", f.rmsSvmG.toDouble())
                put("maxGyroMag", f.maxGyroMag.toDouble())
                put("maxJerk", f.maxJerk.toDouble())
                put("tiltDeltaDeg", f.tiltDeltaDeg.toDouble())
                put("zeroCrossingRate", f.zeroCrossingRate.toDouble())
                put("occurrences", resultPattern.occurrences)
                put("notes", notes)
            }
            streamFile.appendText(streamObj.toString() + "\\n")
        } catch (_: Exception) {}

        _learnedPatternsCountFlow.value = learnedPatterns.size
        return resultPattern
    }

    fun autoCompactLearnedPatterns(): Int {
        val initialSize = learnedPatterns.size
        if (initialSize <= 1) return 0

        val clustered = ArrayList<LearnedMotionPattern>()
        for (candidate in learnedPatterns) {
            var merged = false
            for (existing in clustered) {
                val dG = kotlin.math.abs(existing.maxSvmG - candidate.maxSvmG)
                val dTilt = kotlin.math.abs(existing.tiltDeltaDeg - candidate.tiltDeltaDeg)
                val dSpeed = kotlin.math.abs(existing.preSpeedKmh - candidate.preSpeedKmh)
                if (dG < 0.7f && dTilt < 14.0f && dSpeed < 15.0f) {
                    val total = existing.occurrences + candidate.occurrences
                    existing.maxSvmG = ((existing.maxSvmG * existing.occurrences) + (candidate.maxSvmG * candidate.occurrences)) / total
                    existing.tiltDeltaDeg = ((existing.tiltDeltaDeg * existing.occurrences) + (candidate.tiltDeltaDeg * candidate.occurrences)) / total
                    existing.maxGyroMag = kotlin.math.max(existing.maxGyroMag, candidate.maxGyroMag)
                    existing.occurrences = total
                    existing.timestamp = kotlin.math.max(existing.timestamp, candidate.timestamp)
                    merged = true
                    break
                }
            }
            if (!merged) {
                clustered.add(candidate.copy())
            }
        }

        val sorted = clustered.sortedWith(
            compareByDescending<LearnedMotionPattern> { it.occurrences }
                .thenByDescending { it.timestamp }
        ).take(40)

        learnedPatterns.clear()
        learnedPatterns.addAll(sorted)
        saveLearnedMotionPatterns()
        _learnedPatternsCountFlow.value = learnedPatterns.size

        val prunedCount = initialSize - learnedPatterns.size
        Log.i(TAG, "Auto-compacted learned motion patterns: $initialSize -> ${learnedPatterns.size} (pruned $prunedCount)")
        return prunedCount
    }

    /**
     * Interactive scenario simulator for live demonstrations and testing."""

assert target_methods_anchor in content, "target_methods_anchor not found"
content = content.replace(target_methods_anchor, new_methods)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated SensorAiInferenceEngine.kt")

