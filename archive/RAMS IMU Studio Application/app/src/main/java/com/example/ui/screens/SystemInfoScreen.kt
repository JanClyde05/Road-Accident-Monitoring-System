package com.example.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.ui.res.painterResource
import com.example.R
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
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.Sensors
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.MainViewModel
import com.example.ui.theme.IconSensorAccel
import com.example.ui.theme.IconSensorGyro
import com.example.ui.theme.IconShield
import com.example.ui.theme.MonoBorder
import com.example.ui.theme.MonoBorderLight
import com.example.ui.theme.MonoLightGray
import com.example.ui.theme.MonoMediumGray
import com.example.ui.theme.MonoMutedGray
import com.example.ui.theme.MonoWhite
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.SurfaceVariantDark

@Composable
fun SystemInfoScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val sensorManager = viewModel.sensorManager

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(14.dp)
            .testTag("system_info_screen")
    ) {
        // Header in Monochrome
        Text(
            text = "HARDWARE & ARCHITECTURE DIAGNOSTICS",
            style = MaterialTheme.typography.labelSmall.copy(
                fontFamily = FontFamily.Monospace,
                letterSpacing = 1.2.sp,
                fontWeight = FontWeight.Bold
            ),
            color = MonoMediumGray
        )
        Text(
            text = "RAMS Telemetry Collector Specs",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = MonoWhite
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Hardware Sensor Chips with custom colored icons
        Text(
            text = "IMU SENSORS STATUS",
            style = MaterialTheme.typography.labelMedium.copy(
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold
            ),
            color = MonoMediumGray
        )

        Spacer(modifier = Modifier.height(8.dp))

        MonochromeSensorCardWithColorIcon(
            sensorType = "3-Axis Accelerometer",
            sensorName = sensorManager.accelerometerName,
            isAvailable = sensorManager.hasAccelerometer,
            icon = Icons.Default.Sensors,
            iconColor = IconSensorAccel,
            details = "Samples ax, ay, az linear acceleration & gravity (m/s²)"
        )

        Spacer(modifier = Modifier.height(8.dp))

        MonochromeSensorCardWithColorIcon(
            sensorType = "3-Axis Gyroscope",
            sensorName = sensorManager.gyroscopeName,
            isAvailable = sensorManager.hasGyroscope,
            icon = Icons.Default.Memory,
            iconColor = IconSensorGyro,
            details = "Samples gx, gy, gz angular rate & rotational yaw/pitch (rad/s)"
        )

        Spacer(modifier = Modifier.height(16.dp))

        // RAMS Integration Guide with Official Project Logo
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            Image(
                painter = painterResource(id = R.drawable.rams_project_logo),
                contentDescription = "RAMS Project Logo",
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .border(1.dp, MonoBorder, RoundedCornerShape(8.dp))
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = "PROJECT INTEGRATION GUIDELINES",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.1.sp,
                        fontSize = 10.sp
                    ),
                    color = MonoMediumGray
                )
                Text(
                    text = "GitHub: JanClyde05/Road-Accident-Monitoring-System",
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    ),
                    color = MonoWhite
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            border = androidx.compose.foundation.BorderStroke(1.dp, MonoBorder),
            shape = RoundedCornerShape(8.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                MonochromeIntegrationStepItem(
                    stepNumber = "1",
                    title = "Label Collection & Separation",
                    desc = "Collect positive crash scenarios (Fall, Impact, Skidding) and negative ADL controls (Walking, Running, Jumping, Phone Falling, Phone Shaking, Normal Vehicle Ride) under realistic wearable mounting."
                )

                Spacer(modifier = Modifier.height(10.dp))

                MonochromeIntegrationStepItem(
                    stepNumber = "2",
                    title = "Windowed Feature Extraction",
                    desc = "The built-in engine automatically slices continuous streams into 1.0s windows and computes SVM, jerk, tilt delta, RMS, and SMA for zero-noise model training."
                )

                Spacer(modifier = Modifier.height(10.dp))

                MonochromeIntegrationStepItem(
                    stepNumber = "3",
                    title = "False-Positive Rejection Rules",
                    desc = "By correlating negative activities, Phone Shaking is rejected via SMA bounds, Phone Falling via gyro tumble vs human mass damping, and Jumping via post-landing posture recovery."
                )

                Spacer(modifier = Modifier.height(10.dp))

                MonochromeIntegrationStepItem(
                    stepNumber = "4",
                    title = "Direct CSV & JSON Deployment",
                    desc = "Export 'rams_accident_features_ready.csv' to train ML models (Random Forest / SVM / TFLite) or embed 'rams_detection_rules.json' directly into your wearable firmware."
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Background Monitoring Pipeline Spec with colored shield icon
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark),
            border = androidx.compose.foundation.BorderStroke(1.dp, MonoBorder),
            shape = RoundedCornerShape(8.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Custom Emerald Green Shield icon
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = null,
                        tint = IconShield,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Background Execution Architecture",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MonoWhite
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "• Android 14+ Foreground Service with DATA_SYNC type\n" +
                            "• PARTIAL_WAKE_LOCK to prevent CPU sleep during pocket trials\n" +
                            "• Ongoing Notification channel with live sample & G-Force updates\n" +
                            "• High-performance Room batch transactions with memory buffering",
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        lineHeight = 16.sp
                    ),
                    color = MonoMediumGray
                )
            }
        }
    }
}

@Composable
private fun MonochromeSensorCardWithColorIcon(
    sensorType: String,
    sensorName: String,
    isAvailable: Boolean,
    icon: ImageVector,
    iconColor: Color,
    details: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        border = androidx.compose.foundation.BorderStroke(1.dp, MonoBorder),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Custom colored hardware sensor icon
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconColor,
                modifier = Modifier.size(24.dp)
            )

            Spacer(modifier = Modifier.width(10.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = sensorType,
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MonoWhite
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(3.dp))
                            .background(Color(0xFF242424))
                            .padding(horizontal = 5.dp, vertical = 1.dp)
                    ) {
                        Text(
                            text = if (isAvailable) "ONLINE" else "STANDBY",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            ),
                            color = if (isAvailable) MonoWhite else MonoMutedGray
                        )
                    }
                }

                Text(
                    text = sensorName,
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp
                    ),
                    color = MonoMediumGray
                )

                Text(
                    text = details,
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp),
                    color = MonoMutedGray
                )
            }
        }
    }
}

@Composable
private fun MonochromeIntegrationStepItem(stepNumber: String, title: String, desc: String) {
    Row {
        Box(
            modifier = Modifier
                .size(20.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Color(0xFF242424))
                .border(1.dp, MonoBorderLight, RoundedCornerShape(4.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = stepNumber,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp
                ),
                color = MonoWhite
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                color = MonoWhite
            )
            Text(
                text = desc,
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                color = MonoMediumGray
            )
        }
    }
}
