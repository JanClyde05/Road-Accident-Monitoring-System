package com.example.ui.screens

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Addchart
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
import com.example.data.db.SampleEntity
import com.example.data.db.SessionEntity
import com.example.model.ImuClassType
import com.example.model.ImuSamplePoint
import com.example.ui.MainViewModel
import com.example.ui.components.OscilloscopeCanvas
import com.example.ui.theme.AccidentRed
import com.example.ui.theme.AccidentRedIcon
import com.example.ui.theme.IconDelete
import com.example.ui.theme.IconExportShare
import com.example.ui.theme.IconSeed
import com.example.ui.theme.MonoBorder
import com.example.ui.theme.MonoBorderLight
import com.example.ui.theme.MonoLightGray
import com.example.ui.theme.MonoMediumGray
import com.example.ui.theme.MonoMutedGray
import com.example.ui.theme.MonoWhite
import com.example.ui.theme.NormalGreenIcon
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.TextMuted
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun DatasetVaultScreen(
    viewModel: MainViewModel,
    sessions: List<SessionEntity>,
    selectedDetail: Pair<SessionEntity, List<SampleEntity>>?,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var filterType by remember { mutableStateOf("ALL") } // "ALL", "POSITIVE", "NEGATIVE"
    var showClearConfirmDialog by remember { mutableStateOf(false) }

    val filteredSessions = remember(sessions, filterType) {
        when (filterType) {
            "POSITIVE" -> sessions.filter { it.isPositive }
            "NEGATIVE" -> sessions.filter { !it.isPositive }
            else -> sessions
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(14.dp)
            .testTag("dataset_vault_screen")
    ) {
        // Top Toolbar & Stats in Monochrome with Custom Colored Action Icons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "DATASET VAULT & BACKUPS",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 1.2.sp,
                        fontWeight = FontWeight.Bold
                    ),
                    color = MonoMediumGray
                )
                Text(
                    text = "${sessions.size} Trials Recorded",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold
                    ),
                    color = MonoWhite
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                OutlinedButton(
                    onClick = { viewModel.seedCalibratedData() },
                    shape = RoundedCornerShape(6.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MonoBorderLight),
                    modifier = Modifier.testTag("seed_baseline_button")
                ) {
                    // Seed icon has custom royal purple color
                    Icon(
                        imageVector = Icons.Default.Addchart,
                        contentDescription = null,
                        modifier = Modifier.size(15.dp),
                        tint = IconSeed
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Seed 9 Classes", fontSize = 11.sp, color = MonoWhite)
                }

                if (sessions.isNotEmpty()) {
                    IconButton(
                        onClick = { showClearConfirmDialog = true },
                        modifier = Modifier.testTag("clear_all_button")
                    ) {
                        // Clear All trash can icon has custom crimson red color
                        Icon(
                            imageVector = Icons.Default.DeleteSweep,
                            contentDescription = "Clear All",
                            tint = IconDelete
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Batch export toolbar with custom colored export icons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { viewModel.exportAllRawSessions(context) },
                modifier = Modifier
                    .weight(1f)
                    .height(42.dp)
                    .testTag("export_all_raw_button"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF1E1E1E),
                    contentColor = MonoWhite
                ),
                border = androidx.compose.foundation.BorderStroke(1.dp, MonoBorder),
                shape = RoundedCornerShape(6.dp)
            ) {
                // Export icon in custom cyan
                Icon(
                    imageVector = Icons.Default.FileDownload,
                    contentDescription = null,
                    tint = IconExportShare,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text("Export Raw CSV", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }

            Button(
                onClick = { viewModel.exportFeatureDataset(context) },
                modifier = Modifier
                    .weight(1f)
                    .height(42.dp)
                    .testTag("export_feature_csv_vault"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MonoWhite,
                    contentColor = Color.Black
                ),
                shape = RoundedCornerShape(6.dp)
            ) {
                // Share icon in custom cyan
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = null,
                    tint = Color.Black,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text("Export ML Dataset", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Filter chips row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FilterChip(
                selected = filterType == "ALL",
                onClick = { filterType = "ALL" },
                label = { Text("All (${sessions.size})", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFF2B2B2B),
                    selectedLabelColor = MonoWhite,
                    containerColor = Color(0xFF111111),
                    labelColor = MonoMediumGray
                ),
                border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = filterType == "ALL",
                    borderColor = if (filterType == "ALL") MonoWhite else MonoBorder
                )
            )
            FilterChip(
                selected = filterType == "POSITIVE",
                onClick = { filterType = "POSITIVE" },
                label = { Text("Accidents (${sessions.count { it.isPositive }})", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFF2B2B2B),
                    selectedLabelColor = MonoWhite,
                    containerColor = Color(0xFF111111),
                    labelColor = MonoMediumGray
                ),
                border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = filterType == "POSITIVE",
                    borderColor = if (filterType == "POSITIVE") MonoWhite else MonoBorder
                )
            )
            FilterChip(
                selected = filterType == "NEGATIVE",
                onClick = { filterType = "NEGATIVE" },
                label = { Text("ADL Controls (${sessions.count { !it.isPositive }})", fontSize = 11.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFF2B2B2B),
                    selectedLabelColor = MonoWhite,
                    containerColor = Color(0xFF111111),
                    labelColor = MonoMediumGray
                ),
                border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = filterType == "NEGATIVE",
                    borderColor = if (filterType == "NEGATIVE") MonoWhite else MonoBorder
                )
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Session list
        if (filteredSessions.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(SurfaceDark)
                    .border(1.dp, MonoBorder, RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "No records in this category",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MonoMediumGray
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Tap 'Seed 9 Classes' above or record new trials in Monitor tab",
                        style = MaterialTheme.typography.bodySmall,
                        color = MonoMutedGray
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredSessions, key = { it.id }) { session ->
                    SessionRowCardWithColoredIcons(
                        session = session,
                        onSelect = { viewModel.selectSessionForDetail(session) },
                        onExport = { viewModel.exportSingleSession(context, session.id) },
                        onDelete = { viewModel.deleteSession(session.id) }
                    )
                }
            }
        }
    }

    // Detail Modal / Waveform Replay
    if (selectedDetail != null) {
        val (session, sampleList) = selectedDetail
        val samplePoints = remember(sampleList) {
            sampleList.map { s ->
                ImuSamplePoint(
                    timestamp = s.timestampMs,
                    relTimeMs = s.relTimeMs,
                    ax = s.ax,
                    ay = s.ay,
                    az = s.az,
                    gx = s.gx,
                    gy = s.gy,
                    gz = s.gz,
                    svm = s.svm,
                    svmG = s.svmG,
                    gyroMag = s.gyroMag,
                    jerk = s.jerk,
                    pitch = s.pitch,
                    roll = s.roll
                )
            }
        }

        AlertDialog(
            onDismissRequest = { viewModel.clearSessionDetail() },
            containerColor = Color(0xFF121212),
            title = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        val classType = try {
                            ImuClassType.valueOf(session.labelId)
                        } catch (e: Exception) {
                            ImuClassType.IMPACT
                        }
                        Icon(
                            imageVector = getIconForClass(classType),
                            contentDescription = null,
                            tint = if (session.isPositive) AccidentRedIcon else NormalGreenIcon,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Trial #${session.id}: ${session.displayName}",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MonoWhite
                        )
                    }
                    IconButton(onClick = { viewModel.clearSessionDetail() }) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = IconDelete)
                    }
                }
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    OscilloscopeCanvas(
                        samples = samplePoints,
                        title = "TELEMETRY REPLAY (${sampleList.size} SAMPLES)",
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(170.dp)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Peak: ${String.format(Locale.US, "%.2f", session.peakSvmG)}G",
                            style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold),
                            color = MonoWhite
                        )
                        Text(
                            text = "Avg: ${String.format(Locale.US, "%.2f", session.avgSvmG)}G",
                            style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
                            color = MonoMediumGray
                        )
                        Text(
                            text = "Peak Gyro: ${String.format(Locale.US, "%.2f", session.peakGyroMag)}",
                            style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
                            color = MonoLightGray
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Duration: ${session.durationMs / 1000f}s | Rate: ${String.format(Locale.US, "%.0f", session.samplingRateHz)} Hz",
                        style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
                        color = MonoMutedGray
                    )

                    if (session.notes.isNotBlank()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Note: ${session.notes}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MonoMediumGray
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.exportSingleSession(context, session.id)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MonoWhite, contentColor = Color.Black),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Icon(imageVector = Icons.Default.Share, contentDescription = null, tint = IconExportShare, modifier = Modifier.size(15.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Export CSV")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        viewModel.deleteSession(session.id)
                    }
                ) {
                    Text("Delete", color = IconDelete)
                }
            }
        )
    }

    // Confirmation dialog for clearing all sessions
    if (showClearConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showClearConfirmDialog = false },
            containerColor = Color(0xFF141414),
            title = { Text("Clear All Sessions?", color = MonoWhite) },
            text = { Text("This will permanently remove all raw telemetry records and feature samples.", color = MonoMediumGray) },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteAllSessions()
                        showClearConfirmDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = IconDelete, contentColor = MonoWhite),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text("Clear All")
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearConfirmDialog = false }) {
                    Text("Cancel", color = MonoMediumGray)
                }
            }
        )
    }
}

@Composable
private fun SessionRowCardWithColoredIcons(
    session: SessionEntity,
    onSelect: () -> Unit,
    onExport: () -> Unit,
    onDelete: () -> Unit
) {
    val dateStr = remember(session.startTime) {
        SimpleDateFormat("MM/dd HH:mm:ss", Locale.US).format(Date(session.startTime))
    }

    val classType = remember(session.labelId) {
        try {
            ImuClassType.valueOf(session.labelId)
        } catch (e: Exception) {
            ImuClassType.IMPACT
        }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onSelect)
            .testTag("session_item_${session.id}"),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(8.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, MonoBorder)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Event Profile icon in native red or neon green
            Icon(
                imageVector = getIconForClass(classType),
                contentDescription = null,
                tint = if (session.isPositive) AccidentRedIcon else NormalGreenIcon,
                modifier = Modifier.size(24.dp)
            )

            Spacer(modifier = Modifier.width(10.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = session.displayName,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = MonoWhite
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    Text(
                        text = dateStr,
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        ),
                        color = MonoMutedGray
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Peak: ${String.format(Locale.US, "%.2f", session.peakSvmG)}G",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        ),
                        color = MonoLightGray
                    )
                    Text(
                        text = "${session.sampleCount} pts",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp
                        ),
                        color = MonoMediumGray
                    )
                    Text(
                        text = "${session.durationMs / 1000f}s",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp
                        ),
                        color = MonoMediumGray
                    )
                }
            }

            // Custom colored action icons: Share in Cyan, Delete in Crimson Red
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(
                    onClick = onExport,
                    modifier = Modifier.size(34.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Export CSV",
                        tint = IconExportShare,
                        modifier = Modifier.size(17.dp)
                    )
                }

                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(34.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete",
                        tint = IconDelete,
                        modifier = Modifier.size(17.dp)
                    )
                }
            }
        }
    }
}
