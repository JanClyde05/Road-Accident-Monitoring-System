package com.example.analytics

import com.example.data.db.SampleEntity
import com.example.data.db.SessionEntity
import com.example.model.FeatureVector
import kotlin.math.abs
import kotlin.math.pow
import kotlin.math.sqrt

data class FeatureCorrelation(
    val featureName: String,
    val correlationWithAccident: Float, // Pearson r (-1.0 to 1.0)
    val positiveClassMean: Float,
    val negativeClassMean: Float,
    val separationPower: Float          // Absolute difference normalized by pooled standard deviation
)

data class ThresholdRule(
    val ruleName: String,
    val metricKey: String,
    val operator: String, // ">" or "<"
    val thresholdValue: Float,
    val unit: String,
    val description: String,
    val accuracyEstimate: Float
)

data class ClassBaselines(
    val minAccidentPeakG: Float = 0f,
    val maxNegativePeakG: Float = 0f,
    val phoneFallPeakG: Float = 0f,
    val crashSeparationG: Float = 0f,
    val minAccidentJerk: Float = 0f,
    val maxNegativeJerk: Float = 0f,
    val jerkSeparation: Float = 0f,
    val minAccidentGyro: Float = 0f,
    val maxNegativeGyro: Float = 0f,
    val gyroSeparation: Float = 0f,
    val minAccidentTiltDeg: Float = 0f,
    val maxNegativeTiltDeg: Float = 0f,
    val tiltSeparation: Float = 0f
)

data class CorrelationReport(
    val totalSessionsAnalyzed: Int,
    val positiveCount: Int,
    val negativeCount: Int,
    val totalWindowsExtracted: Int,
    val featureCorrelations: List<FeatureCorrelation>,
    val recommendedRules: List<ThresholdRule>,
    val classBaselines: ClassBaselines = ClassBaselines(),
    val executiveSummary: String
)

private data class SessionPeaks(
    val sessionId: Long,
    val label: String,
    val isAccident: Boolean,
    val peakSvmG: Float,
    val peakJerk: Float,
    val peakGyro: Float,
    val peakTiltDeg: Float,
    val peakSma: Float,
    val peakStdSvm: Float,
    val meanZcr: Float
)

object FeatureEngine {

    /**
     * Extracts windowed feature vectors from raw samples of a session.
     * Uses a window of 1.0s (e.g. 50 samples at 50Hz) with 50% overlap.
     */
    fun extractFeaturesFromSamples(
        session: SessionEntity,
        samples: List<SampleEntity>,
        windowSize: Int = 50,
        stepSize: Int = 25
    ): List<FeatureVector> {
        if (samples.isEmpty()) return emptyList()

        val results = mutableListOf<FeatureVector>()
        val n = samples.size

        var startIdx = 0
        while (startIdx < n) {
            val endIdx = minOf(startIdx + windowSize, n)
            val window = samples.subList(startIdx, endIdx)

            if (window.size >= 10) { // Require at least 10 samples for valid statistics
                val vector = computeWindowFeatures(session, window)
                results.add(vector)
            }

            if (endIdx == n) break
            startIdx += stepSize
        }

        // If session was short and produced no windows, compute on entire sample set
        if (results.isEmpty() && samples.isNotEmpty()) {
            results.add(computeWindowFeatures(session, samples))
        }

        return results
    }

    private fun computeWindowFeatures(
        session: SessionEntity,
        window: List<SampleEntity>
    ): FeatureVector {
        val count = window.size.toFloat()

        var sumSvmG = 0f
        var maxSvmG = Float.NEGATIVE_INFINITY
        var minSvmG = Float.POSITIVE_INFINITY
        var sumSquaresSvmG = 0f

        var sumGyro = 0f
        var maxGyro = Float.NEGATIVE_INFINITY

        var sumJerk = 0f
        var maxJerk = Float.NEGATIVE_INFINITY

        var smaSum = 0f
        var zeroCrossings = 0

        val firstSample = window.first()
        val lastSample = window.last()
        val tiltDelta = abs(lastSample.pitch - firstSample.pitch) + abs(lastSample.roll - firstSample.roll)

        var prevVal = window.first().svmG - 1.0f

        for (s in window) {
            val g = s.svmG
            sumSvmG += g
            sumSquaresSvmG += g * g
            if (g > maxSvmG) maxSvmG = g
            if (g < minSvmG) minSvmG = g

            val gyro = s.gyroMag
            sumGyro += gyro
            if (gyro > maxGyro) maxGyro = gyro

            val jerk = s.jerk
            sumJerk += jerk
            if (jerk > maxJerk) maxJerk = jerk

            smaSum += (abs(s.ax) + abs(s.ay) + abs(s.az)) / 9.80665f

            val currentDiff = g - 1.0f
            if ((prevVal < 0f && currentDiff >= 0f) || (prevVal >= 0f && currentDiff < 0f)) {
                zeroCrossings++
            }
            prevVal = currentDiff
        }

        val meanSvmG = sumSvmG / count
        val meanGyro = sumGyro / count
        val meanJerk = sumJerk / count

        // Variance & Standard Deviation
        var varSvm = 0f
        var varGyro = 0f
        for (s in window) {
            varSvm += (s.svmG - meanSvmG).pow(2)
            varGyro += (s.gyroMag - meanGyro).pow(2)
        }
        val stdSvmG = sqrt(varSvm / count)
        val stdGyro = sqrt(varGyro / count)
        val rmsSvmG = sqrt(sumSquaresSvmG / count)

        return FeatureVector(
            sessionId = session.id,
            sessionLabel = session.labelId,
            isAccident = if (session.isPositive) 1 else 0,
            windowStartMs = window.first().relTimeMs,
            windowDurationMs = window.last().relTimeMs - window.first().relTimeMs,
            meanSvmG = meanSvmG,
            maxSvmG = maxSvmG,
            minSvmG = minSvmG,
            stdSvmG = stdSvmG,
            rmsSvmG = rmsSvmG,
            maxGyroMag = maxGyro,
            meanGyroMag = meanGyro,
            stdGyroMag = stdGyro,
            maxJerk = maxJerk,
            meanJerk = meanJerk,
            tiltDeltaDeg = tiltDelta,
            signalMagnitudeArea = smaSum / count,
            energySvm = sumSquaresSvmG / count,
            zeroCrossingRate = zeroCrossings.toFloat() / count
        )
    }

    /**
     * Correlates session peak envelopes (not quiet sub-windows) across positive vs negative classes.
     * Wearable baselines come from measured class peaks. No preset G/jerk/gyro/tilt cutoff.
     */
    fun performCorrelationAnalysis(features: List<FeatureVector>): CorrelationReport {
        if (features.isEmpty()) {
            return CorrelationReport(
                totalSessionsAnalyzed = 0,
                positiveCount = 0,
                negativeCount = 0,
                totalWindowsExtracted = 0,
                featureCorrelations = emptyList(),
                recommendedRules = emptyList(),
                executiveSummary = "No recorded sessions yet. Record at least 1 positive and 1 negative trial to generate class baselines."
            )
        }

        val sessions = collapseToSessionPeaks(features)
        val posSessions = sessions.filter { it.isAccident }
        val negSessions = sessions.filter { !it.isAccident }
        val targetList = sessions.map { if (it.isAccident) 1f else 0f }

        val metrics = listOf(
            "Peak Accel (Max SVM G)" to sessions.map { it.peakSvmG },
            "Rate of Jerk (m/s³)" to sessions.map { it.peakJerk },
            "Rotational Yaw/Pitch (Max Gyro)" to sessions.map { it.peakGyro },
            "Angular Tilt Change (deg)" to sessions.map { it.peakTiltDeg },
            "Signal Magnitude Area (SMA)" to sessions.map { it.peakSma },
            "Acceleration Variability (Std SVM)" to sessions.map { it.peakStdSvm },
            "Zero Crossing Rate (ZCR)" to sessions.map { it.meanZcr }
        )

        val correlations = metrics.map { (name, values) ->
            val r = computePearsonCorrelation(values, targetList)
            val posVals = posSessions.map { sessionMetric(it, name) }
            val negVals = negSessions.map { sessionMetric(it, name) }
            val posMean = if (posVals.isNotEmpty()) posVals.average().toFloat() else 0f
            val negMean = if (negVals.isNotEmpty()) negVals.average().toFloat() else 0f

            FeatureCorrelation(
                featureName = name,
                correlationWithAccident = if (r.isNaN()) 0f else r,
                positiveClassMean = posMean,
                negativeClassMean = negMean,
                separationPower = cohensD(posVals, negVals)
            )
        }.sortedByDescending { abs(it.correlationWithAccident) }

        val posG = posSessions.map { it.peakSvmG }
        val negG = negSessions.map { it.peakSvmG }
        val phoneFallG = negSessions
            .filter { isPhoneFallLabel(it.label) }
            .map { it.peakSvmG }

        val posJerk = posSessions.map { it.peakJerk }
        val negJerk = negSessions.map { it.peakJerk }
        val posGyro = posSessions.map { it.peakGyro }
        val negGyro = negSessions.map { it.peakGyro }
        val posTilt = posSessions.map { it.peakTiltDeg }
        val negTilt = negSessions.map { it.peakTiltDeg }

        val crashSep = classSeparation(posG, negG)
        val jerkSep = classSeparation(posJerk, negJerk)
        val gyroSep = classSeparation(posGyro, negGyro)
        val tiltSep = classSeparation(posTilt, negTilt)

        val baselines = ClassBaselines(
            minAccidentPeakG = posG.minOrNull() ?: 0f,
            maxNegativePeakG = negG.maxOrNull() ?: 0f,
            phoneFallPeakG = phoneFallG.maxOrNull() ?: 0f,
            crashSeparationG = crashSep,
            minAccidentJerk = posJerk.minOrNull() ?: 0f,
            maxNegativeJerk = negJerk.maxOrNull() ?: 0f,
            jerkSeparation = jerkSep,
            minAccidentGyro = posGyro.minOrNull() ?: 0f,
            maxNegativeGyro = negGyro.maxOrNull() ?: 0f,
            gyroSeparation = gyroSep,
            minAccidentTiltDeg = posTilt.minOrNull() ?: 0f,
            maxNegativeTiltDeg = negTilt.maxOrNull() ?: 0f,
            tiltSeparation = tiltSep
        )

        val rules = mutableListOf<ThresholdRule>()
        if (crashSep > 0f) {
            rules.add(
                ThresholdRule(
                    ruleName = "Impact Shock Baseline",
                    metricKey = "max_svm_g",
                    operator = ">",
                    thresholdValue = crashSep,
                    unit = "G",
                    description = buildEnvelopeDescription(
                        "Peak G",
                        baselines.minAccidentPeakG,
                        baselines.maxNegativePeakG,
                        baselines.phoneFallPeakG
                    ),
                    accuracyEstimate = separationAccuracy(posG, negG, crashSep)
                )
            )
        }
        if (jerkSep > 0f) {
            rules.add(
                ThresholdRule(
                    ruleName = "Jerk Pulse Baseline",
                    metricKey = "max_jerk",
                    operator = ">",
                    thresholdValue = jerkSep,
                    unit = "m/s³",
                    description = "Accident peak jerk floor vs ADL/phone-drop jerk envelope. No preset cutoff.",
                    accuracyEstimate = separationAccuracy(posJerk, negJerk, jerkSep)
                )
            )
        }
        if (tiltSep > 0f) {
            rules.add(
                ThresholdRule(
                    ruleName = "Posture Tilt Baseline",
                    metricKey = "tilt_delta_deg",
                    operator = ">",
                    thresholdValue = tiltSep,
                    unit = "°",
                    description = "Separates rider-fall posture change from phone drop / pocket shake (low net tilt).",
                    accuracyEstimate = separationAccuracy(posTilt, negTilt, tiltSep)
                )
            )
        }
        if (gyroSep > 0f) {
            rules.add(
                ThresholdRule(
                    ruleName = "Skid / Tumble Gyro Baseline",
                    metricKey = "max_gyro_mag",
                    operator = ">",
                    thresholdValue = gyroSep,
                    unit = "rad/s",
                    description = "Accident rotational peak vs negative-class gyro envelope. No preset cutoff.",
                    accuracyEstimate = separationAccuracy(posGyro, negGyro, gyroSep)
                )
            )
        }

        val summary = buildString {
            append("Class baselines from ${sessions.size} recorded sessions ")
            append("(${posSessions.size} accident vs ${negSessions.size} negative/ADL; ${features.size} windows used only for feature export). ")
            if (baselines.phoneFallPeakG > 0f) {
                append("Phone-falling peak envelope is ${String.format("%.2f", baselines.phoneFallPeakG)} G. ")
            }
            if (baselines.maxNegativePeakG > 0f) {
                append("Negative-class peak G ceiling is ${String.format("%.2f", baselines.maxNegativePeakG)} G. ")
            }
            if (baselines.minAccidentPeakG > 0f) {
                append("Accident-class peak G floor is ${String.format("%.2f", baselines.minAccidentPeakG)} G. ")
            }
            if (crashSep > 0f) {
                append("Wearable shock baseline is ${String.format("%.2f", crashSep)} G from class separation (not a factory G cutoff). ")
            } else {
                append("Shock baseline not armed: need accident-class recordings. ")
            }
            val topFeature = correlations.firstOrNull()
            if (topFeature != null) {
                append("Highest separating metric is '${topFeature.featureName}' (r = ${String.format("%.2f", topFeature.correlationWithAccident)}).")
            }
        }

        return CorrelationReport(
            totalSessionsAnalyzed = sessions.size,
            positiveCount = features.count { it.isAccident == 1 },
            negativeCount = features.count { it.isAccident == 0 },
            totalWindowsExtracted = features.size,
            featureCorrelations = correlations,
            recommendedRules = rules,
            classBaselines = baselines,
            executiveSummary = summary
        )
    }

    private fun collapseToSessionPeaks(features: List<FeatureVector>): List<SessionPeaks> {
        return features.groupBy { it.sessionId }.map { (id, windows) ->
            SessionPeaks(
                sessionId = id,
                label = windows.first().sessionLabel,
                isAccident = windows.first().isAccident == 1,
                peakSvmG = windows.maxOf { it.maxSvmG },
                peakJerk = windows.maxOf { it.maxJerk },
                peakGyro = windows.maxOf { it.maxGyroMag },
                peakTiltDeg = windows.maxOf { it.tiltDeltaDeg },
                peakSma = windows.maxOf { it.signalMagnitudeArea },
                peakStdSvm = windows.maxOf { it.stdSvmG },
                meanZcr = windows.map { it.zeroCrossingRate }.average().toFloat()
            )
        }
    }

    private fun sessionMetric(session: SessionPeaks, name: String): Float {
        return when (name) {
            "Peak Accel (Max SVM G)" -> session.peakSvmG
            "Rate of Jerk (m/s³)" -> session.peakJerk
            "Rotational Yaw/Pitch (Max Gyro)" -> session.peakGyro
            "Angular Tilt Change (deg)" -> session.peakTiltDeg
            "Signal Magnitude Area (SMA)" -> session.peakSma
            "Acceleration Variability (Std SVM)" -> session.peakStdSvm
            "Zero Crossing Rate (ZCR)" -> session.meanZcr
            else -> 0f
        }
    }

    private fun isPhoneFallLabel(label: String): Boolean {
        val l = label.lowercase()
        return l.contains("phone_fall") || l.contains("phone fall") ||
            l.contains("phone_falling") || l == "drop" || l.contains("drop")
    }

    /**
     * Wearable trigger from measured class peaks:
     * - both classes, accident floor above negative ceiling → midpoint
     * - overlap → accident floor (tilt/gyro still reject phone-drop lookalikes)
     * - accident-only → accident floor
     * - negative-only → 0 (do not arm crash alerts)
     */
    internal fun classSeparation(positivePeaks: List<Float>, negativePeaks: List<Float>): Float {
        if (positivePeaks.isEmpty()) return 0f
        val posMin = positivePeaks.min()
        val negMax = negativePeaks.maxOrNull() ?: 0f
        return if (negMax > 0f && posMin > negMax) {
            (negMax + posMin) / 2f
        } else {
            posMin
        }
    }

    private fun cohensD(pos: List<Float>, neg: List<Float>): Float {
        if (pos.isEmpty() || neg.isEmpty()) return 0f
        val posMean = pos.average().toFloat()
        val negMean = neg.average().toFloat()
        val pooled = pooledStd(pos, neg)
        return if (pooled > 0f) abs(posMean - negMean) / pooled else 0f
    }

    private fun pooledStd(a: List<Float>, b: List<Float>): Float {
        val n = a.size + b.size
        if (n < 2) return 0f
        val meanA = a.average()
        val meanB = b.average()
        var ss = 0.0
        for (v in a) ss += (v - meanA) * (v - meanA)
        for (v in b) ss += (v - meanB) * (v - meanB)
        return sqrt((ss / n).toFloat())
    }

    private fun separationAccuracy(pos: List<Float>, neg: List<Float>, threshold: Float): Float {
        if (pos.isEmpty() && neg.isEmpty()) return 0f
        val posHit = pos.count { it > threshold }
        val negHit = neg.count { it <= threshold }
        return (posHit + negHit).toFloat() / (pos.size + neg.size)
    }

    private fun buildEnvelopeDescription(
        metric: String,
        accidentFloor: Float,
        negativeCeiling: Float,
        phoneFallPeak: Float
    ): String {
        return buildString {
            append("$metric class envelope from recordings. ")
            append("Accident floor ${String.format("%.2f", accidentFloor)}. ")
            append("Negative ceiling ${String.format("%.2f", negativeCeiling)}. ")
            if (phoneFallPeak > 0f) {
                append("Phone-falling peak ${String.format("%.2f", phoneFallPeak)}. ")
            }
            append("No factory G cutoff.")
        }
    }

    private fun computePearsonCorrelation(x: List<Float>, y: List<Float>): Float {
        if (x.size != y.size || x.size < 2) return 0f

        val meanX = x.average().toFloat()
        val meanY = y.average().toFloat()

        var numerator = 0f
        var denomX = 0f
        var denomY = 0f

        for (i in x.indices) {
            val diffX = x[i] - meanX
            val diffY = y[i] - meanY
            numerator += diffX * diffY
            denomX += diffX * diffX
            denomY += diffY * diffY
        }

        val denominator = sqrt(denomX * denomY)
        return if (denominator > 0f) (numerator / denominator).coerceIn(-1f, 1f) else 0f
    }
}
