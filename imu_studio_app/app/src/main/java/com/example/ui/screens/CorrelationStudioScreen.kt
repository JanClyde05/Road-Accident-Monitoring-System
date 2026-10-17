package com.example.ui.screens

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Rule
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.analytics.CorrelationReport
import com.example.analytics.FeatureCorrelation
import com.example.analytics.ThresholdRule
import com.example.ui.MainViewModel
import com.example.ui.theme.IconExportRules
import com.example.ui.theme.IconExportShare
import com.example.ui.theme.IconNavTune
import com.example.ui.theme.IconRefresh
import com.example.ui.theme.MonoBorder
import com.example.ui.theme.MonoBorderLight
import com.example.ui.theme.MonoLightGray
import com.example.ui.theme.MonoMediumGray
import com.example.ui.theme.MonoMutedGray
import com.example.ui.theme.MonoWhite
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.TextMuted
import java.util.Locale
import kotlin.math.abs

@Composable
fun CorrelationStudioScreen(
    viewModel: MainViewModel,
    report: CorrelationReport,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(14.dp)
            .testTag("correlation_studio_screen")
    ) {
        // Studio header with custom colored refresh icon
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "FEATURE CORRELATION & CLASSIFIER STUDIO",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 1.2.sp,
                        fontWeight = FontWeight.Bold
                    ),
                    color = MonoMediumGray
                )
                Text(
                    text = "Accident vs ADL Rejection Engine",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold
                    ),
                    color = MonoWhite
                )
            }

            OutlinedButton(
                onClick = { viewModel.recomputeCorrelations() },
                shape = RoundedCornerShape(6.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, MonoBorder),
                modifier = Modifier.testTag("recompute_button")
            ) {
                // Custom Cyan Refresh icon
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Recalculate",
                    modifier = Modifier.size(15.dp),
                    tint = IconRefresh
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Recalculate", fontSize = 11.sp, color = MonoWhite)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Dataset Balance Summary Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            border = androidx.compose.foundation.BorderStroke(1.dp, MonoBorder)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = "DATASET BALANCE & SAMPLE WINDOWS",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    ),
                    color = MonoMediumGray
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    MonoBalanceBox(
                        title = "Accident Slices",
                        count = report.positiveCount,
                        label = "Positive Windows",
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    MonoBalanceBox(
                        title = "ADL Rejection",
                        count = report.negativeCount,
                        label = "Negative Controls",
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    MonoBalanceBox(
                        title = "Total Slices",
                        count = report.totalWindowsExtracted,
                        label = "Extracted (1.0s)",
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = report.executiveSummary,
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    ),
                    color = MonoMutedGray
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Feature Correlation Ranking
        Text(
            text = "FEATURE CORRELATION RANKING (PEARSON r)",
            style = MaterialTheme.typography.labelMedium.copy(
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.2.sp
            ),
            color = MonoMediumGray
        )
        Text(
            text = "Features with higher |r| best separate true accidents from false alarms (jumping, phone drops, vehicle bumps)",
            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
            color = MonoMutedGray
        )

        Spacer(modifier = Modifier.height(8.dp))

        if (report.featureCorrelations.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(6.dp))
                    .background(SurfaceDark)
                    .border(1.dp, MonoBorder, RoundedCornerShape(6.dp))
                    .padding(20.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "No correlation data yet",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MonoMediumGray
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = { viewModel.seedCalibratedData() },
                        colors = ButtonDefaults.buttonColors(containerColor = MonoWhite, contentColor = Color.Black),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text("Seed Calibrated Baseline Data")
                    }
                }
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                report.featureCorrelations.forEach { fc ->
                    MonochromeCorrelationRow(item = fc)
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Synthesized Wearable Decision Rules Section with colored rule icon
        Text(
            text = "MOBILE / WEARABLE DETECTION RULES",
            style = MaterialTheme.typography.labelMedium.copy(
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.2.sp
            ),
            color = MonoWhite
        )
        Text(
            text = "Class baselines from recorded peaks (phone-fall envelope, accident floor). No factory G cutoff. Import into the companion Android app.",
            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
            color = MonoMutedGray
        )

        Spacer(modifier = Modifier.height(8.dp))

        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            report.recommendedRules.forEach { rule ->
                MonochromeRuleCard(rule = rule)
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Deployment Export Suite with custom colored icons
        Text(
            text = "DEPLOYMENT EXPORT SUITE",
            style = MaterialTheme.typography.labelMedium.copy(
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold
            ),
            color = MonoMediumGray
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { viewModel.exportFeatureDataset(context) },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
                    .testTag("export_features_button"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MonoWhite,
                    contentColor = Color.Black
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                // Custom Cyan Export Icon
                Icon(
                    imageVector = Icons.Default.FileDownload,
                    contentDescription = null,
                    tint = IconExportShare,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Feature CSV",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                )
            }

            Button(
                onClick = { viewModel.exportWearableRules(context) },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
                    .testTag("export_rules_button"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF1F1F1F),
                    contentColor = MonoWhite
                ),
                border = androidx.compose.foundation.BorderStroke(1.dp, MonoBorderLight),
                shape = RoundedCornerShape(8.dp)
            ) {
                // Custom Amber Rules Code Icon
                Icon(
                    imageVector = Icons.Default.Code,
                    contentDescription = null,
                    tint = IconExportRules,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Rules JSON",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                )
            }
        }
    }
}

@Composable
private fun MonoBalanceBox(
    title: String,
    count: Int,
    label: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(Color(0xFF000000))
            .border(1.dp, MonoBorder, RoundedCornerShape(6.dp))
            .padding(8.dp)
    ) {
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace
                ),
                color = MonoMutedGray
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "$count",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 18.sp
                ),
                color = MonoWhite
            )
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 9.sp),
                color = MonoMediumGray
            )
        }
    }
}

@Composable
private fun MonochromeCorrelationRow(item: FeatureCorrelation) {
    val r = item.correlationWithAccident
    val absR = abs(r)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(6.dp))
            .background(SurfaceDark)
            .border(1.dp, MonoBorder, RoundedCornerShape(6.dp))
            .padding(10.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = item.featureName,
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    ),
                    color = MonoWhite
                )
                Text(
                    text = "r = ${String.format(Locale.US, "%+.2f", r)}",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.ExtraBold
                    ),
                    color = MonoWhite
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Monochrome visual separation bar
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(5.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Color(0xFF1E1E1E))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(absR.coerceIn(0.05f, 1.0f))
                        .height(5.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(MonoWhite)
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Accident Mean: ${String.format(Locale.US, "%.2f", item.positiveClassMean)}",
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    ),
                    color = MonoLightGray
                )
                Text(
                    text = "ADL Mean: ${String.format(Locale.US, "%.2f", item.negativeClassMean)}",
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    ),
                    color = MonoMediumGray
                )
            }
        }
    }
}

@Composable
private fun MonochromeRuleCard(rule: ThresholdRule) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(6.dp))
            .background(SurfaceDark)
            .border(1.dp, MonoBorder, RoundedCornerShape(6.dp))
            .padding(10.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Custom colored rule icon in amber
                    Icon(
                        imageVector = Icons.Default.Rule,
                        contentDescription = null,
                        tint = IconNavTune,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = rule.ruleName,
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = MonoWhite
                    )
                }

                // Monochrome threshold badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(3.dp))
                        .background(Color(0xFF262626))
                        .border(1.dp, MonoBorderLight, RoundedCornerShape(3.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "${rule.operator} ${String.format(Locale.US, "%.1f", rule.thresholdValue)} ${rule.unit}",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        ),
                        color = MonoWhite
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = rule.description,
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                color = MonoMediumGray
            )
        }
    }
}
