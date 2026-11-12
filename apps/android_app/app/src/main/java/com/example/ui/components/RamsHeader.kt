package com.example.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.model.DeviceLinkStatus
import com.example.model.RiderProfile
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber
import java.util.Locale

/**
 * Minimalist, User-Friendly Top Header Bar for RAMS.
 *
 * Encapsulates technical complexity behind clean, intuitive visual badges:
 * - Brand logo with dynamic safety alert glow ring.
 * - Rider persona indicator.
 * - Single-tap Wearable connection status pill.
 * - Emergency alert beacon pill (visible only during active events).
 */
@Composable
fun RamsHeader(
    linkStatus: DeviceLinkStatus,
    alertCount: Int,
    isRecordingCsv: Boolean,
    recordedCsvCount: Int,
    isDarkTheme: Boolean,
    usePhoneSensors: Boolean,
    riderProfile: RiderProfile?,
    onToggleSensorSource: () -> Unit = {},
    onToggleTheme: () -> Unit = {},
    onOpenConnectionDialog: () -> Unit = {},
    onOpenRiderLogin: () -> Unit = {},
    onOpenCsvDialog: () -> Unit = {},
    onOpenDesignRules: () -> Unit = {},
    onTriggerTestCrash: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val isWearableConnected = linkStatus.isConnected
    val ringColor = when {
        alertCount > 0 -> RamsAlertRed
        isWearableConnected -> RamsSuccessEmerald
        else -> RamsSyncBlue
    }

    Surface(
        modifier = modifier.fillMaxWidth(),
        color = Color(0xFF18181B),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A)),
        tonalElevation = 0.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left: Authentic App Logo + Clean Title + Category Pill
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.logo),
                    contentDescription = "RAMS Logo",
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .border(1.5.dp, ringColor, CircleShape)
                )

                Spacer(modifier = Modifier.width(10.dp))

                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "RAMS",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = Color.White,
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        val rawCategory = riderProfile?.category?.lowercase(Locale.US)?.trim() ?: ""
                        val (shortLabel, badgeColor) = when {
                            rawCategory.contains("motor") -> Pair("MOTORCYCLE", Color(0xFFF59E0B))
                            rawCategory.contains("pedestrian") || rawCategory.contains("walk") -> Pair("PEDESTRIAN", Color(0xFF10B981))
                            rawCategory.contains("cyclist") || rawCategory.contains("bike") -> Pair("CYCLIST", Color(0xFF06B6D4))
                            rawCategory.contains("car") || rawCategory.contains("drive") -> Pair("CAR DRIVER", Color(0xFF818CF8))
                            else -> Pair(riderProfile?.category?.ifBlank { "RIDER" }?.uppercase(Locale.US) ?: "RIDER", RamsSyncBlue)
                        }
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = badgeColor.copy(alpha = 0.15f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, badgeColor.copy(alpha = 0.5f)),
                            modifier = Modifier.clickable { onOpenRiderLogin() }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(5.dp)
                                        .background(badgeColor, CircleShape)
                                )
                                Text(
                                    text = shortLabel,
                                    fontSize = 8.5.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    color = badgeColor,
                                    maxLines = 1,
                                    softWrap = false
                                )
                            }
                        }
                    }

                    val isWalk = riderProfile?.category?.contains("walk", ignoreCase = true) == true ||
                                 riderProfile?.category?.contains("pedestrian", ignoreCase = true) == true
                    val guardText = if (isWearableConnected) {
                        if (isWalk) "WALK GUARD ACTIVE" else "RIDER GUARD ACTIVE"
                    } else {
                        if (isWalk) "WALK GUARD (PHONE)" else "RIDER GUARD (PHONE)"
                    }
                    Text(
                        text = guardText,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        color = if (isWearableConnected) RamsSuccessEmerald else Color(0xFFA1A1AA),
                        maxLines = 1,
                        softWrap = false
                    )
                }
            }

            // Right: Wearable Connection Pill & Alert Indicator
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                if (alertCount > 0) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = RamsAlertRed.copy(alpha = 0.2f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, RamsAlertRed)
                    ) {
                        Text(
                            text = "ALERT",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = RamsAlertRed,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                        )
                    }
                }

                // Clean Wearable Status Pill (Single Tap opens Wearable pairing tab)
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = if (isWearableConnected) RamsSuccessEmerald.copy(alpha = 0.15f) else Color(0xFF27272A),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isWearableConnected) RamsSuccessEmerald.copy(alpha = 0.5f) else Color(0xFF3F3F46)
                    ),
                    modifier = Modifier.clickable { onOpenConnectionDialog() }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .background(
                                    if (isWearableConnected) RamsSuccessEmerald else RamsWarningAmber,
                                    CircleShape
                                )
                        )
                        Text(
                            text = if (isWearableConnected) "WEARABLE ON" else "WEARABLE LINK",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = if (isWearableConnected) RamsSuccessEmerald else Color(0xFFE4E4E7),
                            maxLines = 1,
                            softWrap = false,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}
