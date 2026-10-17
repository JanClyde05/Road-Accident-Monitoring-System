package com.example.data.export

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import com.example.analytics.CorrelationReport
import com.example.data.db.SampleEntity
import com.example.data.db.SessionEntity
import com.example.model.FeatureVector
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object DatasetExporter {

    private val dateFormat = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US)

    /**
     * Builds raw CSV string for samples.
     */
    fun generateRawSamplesCsv(session: SessionEntity, samples: List<SampleEntity>): String {
        return buildString {
            // Header
            append("session_id,label,category,is_accident,rel_time_ms,timestamp_ms,ax,ay,az,gx,gy,gz,svm_mps2,svm_g,gyro_mag_rads,jerk_mps3,pitch_deg,roll_deg\n")
            for (s in samples) {
                append("${session.id},")
                append("${session.labelId},")
                append("${session.category},")
                append("${if (session.isPositive) 1 else 0},")
                append("${s.relTimeMs},")
                append("${s.timestampMs},")
                append("${String.format(Locale.US, "%.4f", s.ax)},")
                append("${String.format(Locale.US, "%.4f", s.ay)},")
                append("${String.format(Locale.US, "%.4f", s.az)},")
                append("${String.format(Locale.US, "%.4f", s.gx)},")
                append("${String.format(Locale.US, "%.4f", s.gy)},")
                append("${String.format(Locale.US, "%.4f", s.gz)},")
                append("${String.format(Locale.US, "%.4f", s.svm)},")
                append("${String.format(Locale.US, "%.4f", s.svmG)},")
                append("${String.format(Locale.US, "%.4f", s.gyroMag)},")
                append("${String.format(Locale.US, "%.4f", s.jerk)},")
                append("${String.format(Locale.US, "%.2f", s.pitch)},")
                append("${String.format(Locale.US, "%.2f", s.roll)}\n")
            }
        }
    }

    /**
     * Builds combined raw CSV for multiple sessions.
     */
    fun generateCombinedRawCsv(sessionSamplePairs: List<Pair<SessionEntity, List<SampleEntity>>>): String {
        return buildString {
            append("session_id,label,category,is_accident,rel_time_ms,timestamp_ms,ax,ay,az,gx,gy,gz,svm_mps2,svm_g,gyro_mag_rads,jerk_mps3,pitch_deg,roll_deg\n")
            for ((session, samples) in sessionSamplePairs) {
                for (s in samples) {
                    append("${session.id},")
                    append("${session.labelId},")
                    append("${session.category},")
                    append("${if (session.isPositive) 1 else 0},")
                    append("${s.relTimeMs},")
                    append("${s.timestampMs},")
                    append("${String.format(Locale.US, "%.4f", s.ax)},")
                    append("${String.format(Locale.US, "%.4f", s.ay)},")
                    append("${String.format(Locale.US, "%.4f", s.az)},")
                    append("${String.format(Locale.US, "%.4f", s.gx)},")
                    append("${String.format(Locale.US, "%.4f", s.gy)},")
                    append("${String.format(Locale.US, "%.4f", s.gz)},")
                    append("${String.format(Locale.US, "%.4f", s.svm)},")
                    append("${String.format(Locale.US, "%.4f", s.svmG)},")
                    append("${String.format(Locale.US, "%.4f", s.gyroMag)},")
                    append("${String.format(Locale.US, "%.4f", s.jerk)},")
                    append("${String.format(Locale.US, "%.2f", s.pitch)},")
                    append("${String.format(Locale.US, "%.2f", s.roll)}\n")
                }
            }
        }
    }

    /**
     * Builds the "Data-Ready File" (Feature-engineered CSV) ready for training accident detection models
     * or false-positive rejection filters.
     */
    fun generateFeatureDatasetCsv(features: List<FeatureVector>): String {
        return buildString {
            append("session_id,label,is_accident,window_start_ms,window_duration_ms,mean_svm_g,max_svm_g,min_svm_g,std_svm_g,rms_svm_g,max_gyro_mag,mean_gyro_mag,std_gyro_mag,max_jerk,mean_jerk,tilt_delta_deg,sma,energy_svm,zero_crossing_rate\n")
            for (f in features) {
                append("${f.sessionId},")
                append("${f.sessionLabel},")
                append("${f.isAccident},")
                append("${f.windowStartMs},")
                append("${f.windowDurationMs},")
                append("${String.format(Locale.US, "%.4f", f.meanSvmG)},")
                append("${String.format(Locale.US, "%.4f", f.maxSvmG)},")
                append("${String.format(Locale.US, "%.4f", f.minSvmG)},")
                append("${String.format(Locale.US, "%.4f", f.stdSvmG)},")
                append("${String.format(Locale.US, "%.4f", f.rmsSvmG)},")
                append("${String.format(Locale.US, "%.4f", f.maxGyroMag)},")
                append("${String.format(Locale.US, "%.4f", f.meanGyroMag)},")
                append("${String.format(Locale.US, "%.4f", f.stdGyroMag)},")
                append("${String.format(Locale.US, "%.4f", f.maxJerk)},")
                append("${String.format(Locale.US, "%.4f", f.meanJerk)},")
                append("${String.format(Locale.US, "%.2f", f.tiltDeltaDeg)},")
                append("${String.format(Locale.US, "%.4f", f.signalMagnitudeArea)},")
                append("${String.format(Locale.US, "%.4f", f.energySvm)},")
                append("${String.format(Locale.US, "%.4f", f.zeroCrossingRate)}\n")
            }
        }
    }

    /**
     * Generates a ready-to-deploy JSON rules file for direct embedding into the user's mobile wearable app.
     */
    fun generateWearableRulesJson(report: CorrelationReport): String {
        return buildString {
            append("{\n")
            append("  \"project\": \"Road-Accident-Monitoring-System\",\n")
            append("  \"generated_at\": \"${Date()}\",\n")
            append("  \"version\": \"1.0.0\",\n")
            append("  \"metadata\": {\n")
            append("    \"total_sessions\": ${report.totalSessionsAnalyzed},\n")
            append("    \"positive_accident_windows\": ${report.positiveCount},\n")
            append("    \"negative_adl_windows\": ${report.negativeCount},\n")
            append("    \"total_feature_windows\": ${report.totalWindowsExtracted}\n")
            append("  },\n")
            append("  \"class_baselines\": {\n")
            append("    \"min_accident_peak_g\": ${fmt(report.classBaselines.minAccidentPeakG)},\n")
            append("    \"max_negative_peak_g\": ${fmt(report.classBaselines.maxNegativePeakG)},\n")
            append("    \"phone_fall_peak_g\": ${fmt(report.classBaselines.phoneFallPeakG)},\n")
            append("    \"crash_separation_g\": ${fmt(report.classBaselines.crashSeparationG)},\n")
            append("    \"min_accident_jerk\": ${fmt(report.classBaselines.minAccidentJerk)},\n")
            append("    \"max_negative_jerk\": ${fmt(report.classBaselines.maxNegativeJerk)},\n")
            append("    \"jerk_separation\": ${fmt(report.classBaselines.jerkSeparation)},\n")
            append("    \"min_accident_gyro\": ${fmt(report.classBaselines.minAccidentGyro)},\n")
            append("    \"max_negative_gyro\": ${fmt(report.classBaselines.maxNegativeGyro)},\n")
            append("    \"gyro_separation\": ${fmt(report.classBaselines.gyroSeparation)},\n")
            append("    \"min_accident_tilt_deg\": ${fmt(report.classBaselines.minAccidentTiltDeg)},\n")
            append("    \"max_negative_tilt_deg\": ${fmt(report.classBaselines.maxNegativeTiltDeg)},\n")
            append("    \"tilt_separation\": ${fmt(report.classBaselines.tiltSeparation)}\n")
            append("  },\n")
            append("  \"detection_thresholds\": [\n")
            report.recommendedRules.forEachIndexed { index, rule ->
                append("    {\n")
                append("      \"name\": \"${rule.ruleName}\",\n")
                append("      \"metric\": \"${rule.metricKey}\",\n")
                append("      \"operator\": \"${rule.operator}\",\n")
                append("      \"threshold\": ${String.format(Locale.US, "%.3f", rule.thresholdValue)},\n")
                append("      \"unit\": \"${rule.unit}\",\n")
                append("      \"accuracy_estimate\": ${rule.accuracyEstimate},\n")
                append("      \"description\": \"${rule.description}\"\n")
                append("    }${if (index < report.recommendedRules.size - 1) "," else ""}\n")
            }
            append("  ],\n")
            append("  \"feature_ranking\": [\n")
            report.featureCorrelations.forEachIndexed { index, fc ->
                append("    {\n")
                append("      \"feature\": \"${fc.featureName}\",\n")
                append("      \"correlation_r\": ${String.format(Locale.US, "%.3f", fc.correlationWithAccident)},\n")
                append("      \"accident_mean\": ${String.format(Locale.US, "%.3f", fc.positiveClassMean)},\n")
                append("      \"adl_mean\": ${String.format(Locale.US, "%.3f", fc.negativeClassMean)}\n")
                append("    }${if (index < report.featureCorrelations.size - 1) "," else ""}\n")
            }
            append("  ]\n")
            append("}\n")
        }
    }

    private fun fmt(value: Float): String = String.format(Locale.US, "%.3f", value)

    /**
     * Writes content to a cache file and returns a share Intent.
     */
    fun exportAndShareFile(
        context: Context,
        fileName: String,
        content: String,
        mimeType: String = "text/csv"
    ): Intent {
        val exportDir = File(context.cacheDir, "datasets")
        if (!exportDir.exists()) {
            exportDir.mkdirs()
        }
        val file = File(exportDir, fileName)
        file.writeText(content)

        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = mimeType
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, "RAMS IMU Export: $fileName")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        return Intent.createChooser(intent, "Share $fileName via...")
    }
}
