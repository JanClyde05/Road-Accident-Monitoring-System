package com.example

import com.example.analytics.FeatureEngine
import com.example.data.db.SampleEntity
import com.example.data.db.SessionEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class FeatureEngineTest {

    @Test
    fun testFeatureExtractionAndCorrelation() {
        val accidentSession = SessionEntity(
            id = 1L,
            labelId = "IMPACT",
            displayName = "Impact",
            category = "POSITIVE",
            isPositive = true,
            startTime = 1000L,
            durationMs = 2000L,
            sampleCount = 20,
            samplingRateHz = 50f,
            peakSvmG = 4.5f,
            avgSvmG = 1.8f,
            peakGyroMag = 3.2f,
            peakJerk = 55f
        )

        val adlSession = SessionEntity(
            id = 2L,
            labelId = "WALKING",
            displayName = "Walking",
            category = "NEGATIVE",
            isPositive = false,
            startTime = 4000L,
            durationMs = 2000L,
            sampleCount = 20,
            samplingRateHz = 50f,
            peakSvmG = 1.3f,
            avgSvmG = 1.05f,
            peakGyroMag = 0.4f,
            peakJerk = 8f
        )

        val accidentSamples = (0 until 20).map { i ->
            SampleEntity(
                id = i.toLong(),
                sessionId = 1L,
                timestampMs = 1000L + i * 20L,
                relTimeMs = i * 20L,
                ax = 0f,
                ay = if (i == 10) 44.1f else 9.8f, // 4.5G spike at impact
                az = 0f,
                gx = 0f,
                gy = 0f,
                gz = if (i == 10) 3.2f else 0.1f,
                svm = if (i == 10) 44.1f else 9.8f,
                svmG = if (i == 10) 4.5f else 1.0f,
                gyroMag = if (i == 10) 3.2f else 0.1f,
                jerk = if (i == 10) 55f else 2f,
                pitch = 0f,
                roll = 0f
            )
        }

        val adlSamples = (0 until 20).map { i ->
            SampleEntity(
                id = 100L + i.toLong(),
                sessionId = 2L,
                timestampMs = 4000L + i * 20L,
                relTimeMs = i * 20L,
                ax = 0f,
                ay = 9.8f + (i % 2) * 2.0f,
                az = 0f,
                gx = 0.2f,
                gy = 0.1f,
                gz = 0.1f,
                svm = 11.0f,
                svmG = 1.12f,
                gyroMag = 0.25f,
                jerk = 5f,
                pitch = 0f,
                roll = 0f
            )
        }

        val featsAccident = FeatureEngine.extractFeaturesFromSamples(accidentSession, accidentSamples)
        val featsAdl = FeatureEngine.extractFeaturesFromSamples(adlSession, adlSamples)

        assertTrue(featsAccident.isNotEmpty())
        assertTrue(featsAdl.isNotEmpty())
        assertEquals(1, featsAccident.first().isAccident)
        assertEquals(0, featsAdl.first().isAccident)

        val report = FeatureEngine.performCorrelationAnalysis(featsAccident + featsAdl)
        assertNotNull(report)
        assertEquals(2, report.totalSessionsAnalyzed)
        assertTrue(report.recommendedRules.isNotEmpty())

        val shock = report.recommendedRules.first { it.metricKey == "max_svm_g" }
        assertEquals(4.5f, report.classBaselines.minAccidentPeakG, 0.05f)
        assertTrue(shock.thresholdValue > report.classBaselines.maxNegativePeakG)
        assertTrue(shock.thresholdValue < report.classBaselines.minAccidentPeakG)
    }

    @Test
    fun phoneFallPeakBecomesNegativeEnvelopeNotFactoryCutoff() {
        val phoneFall = (0 until 20).map { i ->
            SampleEntity(
                id = i.toLong(),
                sessionId = 10L,
                timestampMs = i * 20L,
                relTimeMs = i * 20L,
                ax = 0f, ay = if (i == 10) 30.4f else 9.8f, az = 0f,
                gx = 0f, gy = 0f, gz = 0.1f,
                svm = if (i == 10) 30.4f else 9.8f,
                svmG = if (i == 10) 3.1f else 1.0f,
                gyroMag = 0.2f,
                jerk = if (i == 10) 20f else 2f,
                pitch = 0f,
                roll = 0f
            )
        }
        val impact = (0 until 20).map { i ->
            SampleEntity(
                id = 100L + i,
                sessionId = 11L,
                timestampMs = i * 20L,
                relTimeMs = i * 20L,
                ax = 0f, ay = if (i == 10) 58.8f else 9.8f, az = 0f,
                gx = 0f, gy = 0f, gz = 4f,
                svm = if (i == 10) 58.8f else 9.8f,
                svmG = if (i == 10) 6.0f else 1.0f,
                gyroMag = if (i == 10) 4f else 0.1f,
                jerk = if (i == 10) 80f else 2f,
                pitch = if (i > 10) 40f else 0f,
                roll = 0f
            )
        }

        val phoneSession = SessionEntity(
            id = 10L, labelId = "PHONE_FALLING", displayName = "Phone Falling",
            category = "NEGATIVE", isPositive = false, startTime = 0L,
            durationMs = 400L, sampleCount = 20, samplingRateHz = 50f,
            peakSvmG = 3.1f, avgSvmG = 1.1f, peakGyroMag = 0.2f, peakJerk = 20f
        )
        val impactSession = SessionEntity(
            id = 11L, labelId = "IMPACT", displayName = "Impact",
            category = "POSITIVE", isPositive = true, startTime = 0L,
            durationMs = 400L, sampleCount = 20, samplingRateHz = 50f,
            peakSvmG = 6.0f, avgSvmG = 1.2f, peakGyroMag = 4f, peakJerk = 80f
        )

        val report = FeatureEngine.performCorrelationAnalysis(
            FeatureEngine.extractFeaturesFromSamples(phoneSession, phoneFall) +
                FeatureEngine.extractFeaturesFromSamples(impactSession, impact)
        )

        assertEquals(3.1f, report.classBaselines.phoneFallPeakG, 0.05f)
        assertEquals(3.1f, report.classBaselines.maxNegativePeakG, 0.05f)
        assertEquals(6.0f, report.classBaselines.minAccidentPeakG, 0.05f)
        assertEquals(4.55f, report.classBaselines.crashSeparationG, 0.1f)
        assertTrue(report.classBaselines.crashSeparationG !in 2.5f..2.5001f)
        assertEquals(4.55f, FeatureEngine.classSeparation(listOf(6.0f), listOf(3.1f)), 0.01f)
    }
}
