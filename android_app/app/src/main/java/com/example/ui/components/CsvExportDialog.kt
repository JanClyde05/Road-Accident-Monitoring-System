package com.example.ui.components

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FiberManualRecord
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material.icons.filled.MergeType
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.export.CsvExportManager
import com.example.model.ImuCalibration
import com.example.ui.theme.IconImportData
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber

@Composable
fun CsvExportDialog(
  csvManager: CsvExportManager,
  isRecording: Boolean,
  recordedCount: Int,
  onToggleRecording: () -> Unit,
  onExportCsv: () -> Unit,
  onClearLogs: () -> Unit,
  onImportCsv: (Uri, String) -> Unit = { _, _ -> },
  onMergeImported: () -> Unit = {},
  onClearImported: () -> Unit = {},
  initialTab: String = "EXPORT",
  onDismiss: () -> Unit
) {
  val previewRows = csvManager.getPreviewRows(25)
  val importedCount by csvManager.importedCount.collectAsStateWithLifecycle()
  val importedFileName by csvManager.importedFileName.collectAsStateWithLifecycle()
  val importError by csvManager.importError.collectAsStateWithLifecycle()
  val calibration by csvManager.calibrationState.collectAsStateWithLifecycle()
  val importedPreviewRows = csvManager.getImportedPreviewRows(25)
  val context = LocalContext.current

  // Active tab: EXPORT or IMPORT
  var activeTab by remember(initialTab) { mutableStateOf(initialTab) }

  // File picker launcher for CSV import
  val csvPickerLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.OpenDocument()
  ) { uri: Uri? ->
    uri?.let {
      // Extract filename from URI
      val cursor = context.contentResolver.query(it, null, null, null, null)
      var name = "imported.csv"
      cursor?.use { c ->
        if (c.moveToFirst()) {
          val idx = c.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
          if (idx >= 0) name = c.getString(idx) ?: "imported.csv"
        }
      }
      onImportCsv(it, name)
    }
  }

  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxWidth(0.95f)
        .clip(RoundedCornerShape(8.dp))
        .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
        .testTag("csv_export_dialog"),
      color = MaterialTheme.colorScheme.surface
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(16.dp)
      ) {
        // Header
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = if (activeTab == "EXPORT") Icons.Default.FileDownload else Icons.Default.FileUpload,
              contentDescription = null,
              tint = if (activeTab == "EXPORT") RamsSyncBlue else IconImportData,
              modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "CSV SENSOR TELEMETRY",
              style = MaterialTheme.typography.titleMedium,
              color = MaterialTheme.colorScheme.onSurface
            )
          }

          IconButton(onClick = onDismiss) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurface)
          }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Tab Switcher: EXPORT | IMPORT
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(0.dp)
        ) {
          TabButton(
            label = "EXPORT",
            isSelected = activeTab == "EXPORT",
            color = RamsSyncBlue,
            modifier = Modifier.weight(1f),
            onClick = { activeTab = "EXPORT" }
          )
          TabButton(
            label = "IMPORT",
            isSelected = activeTab == "IMPORT",
            color = IconImportData,
            badgeCount = importedCount,
            modifier = Modifier.weight(1f),
            onClick = { activeTab = "IMPORT" }
          )
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (activeTab == "EXPORT") {
          // === EXPORT TAB ===
          ExportTabContent(
            isRecording = isRecording,
            recordedCount = recordedCount,
            previewRows = previewRows,
            onToggleRecording = onToggleRecording,
            onExportCsv = onExportCsv,
            onClearLogs = onClearLogs,
            onDismiss = onDismiss
          )
        } else {
          // === IMPORT TAB ===
          ImportTabContent(
            importedCount = importedCount,
            importedFileName = importedFileName,
            importError = importError,
            calibration = calibration,
            importedPreviewRows = importedPreviewRows,
            onPickFile = { csvPickerLauncher.launch(arrayOf("text/csv", "text/comma-separated-values", "text/*", "*/*")) },
            onMergeImported = onMergeImported,
            onClearImported = onClearImported,
            onDismiss = onDismiss
          )
        }
      }
    }
  }
}

@Composable
private fun TabButton(
  label: String,
  isSelected: Boolean,
  color: Color,
  modifier: Modifier = Modifier,
  badgeCount: Int = 0,
  onClick: () -> Unit
) {
  Surface(
    modifier = modifier
      .clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp))
      .clickable { onClick() },
    color = if (isSelected) color.copy(alpha = 0.15f) else Color.Transparent,
    border = if (isSelected) androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.4f))
             else androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
  ) {
    Row(
      modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
      horizontalArrangement = Arrangement.Center,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = label,
        fontFamily = FontFamily.Monospace,
        fontWeight = if (isSelected) FontWeight.Black else FontWeight.Medium,
        fontSize = 11.sp,
        color = if (isSelected) color else Color(0xFF71717A)
      )
      if (badgeCount > 0) {
        Spacer(modifier = Modifier.width(6.dp))
        Surface(
          shape = RoundedCornerShape(3.dp),
          color = color.copy(alpha = 0.25f)
        ) {
          Text(
            text = "$badgeCount",
            modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp),
            fontSize = 8.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            color = color
          )
        }
      }
    }
  }
}

@Composable
private fun ExportTabContent(
  isRecording: Boolean,
  recordedCount: Int,
  previewRows: List<String>,
  onToggleRecording: () -> Unit,
  onExportCsv: () -> Unit,
  onClearLogs: () -> Unit,
  onDismiss: () -> Unit
) {
  Column {
    // Logging Status Banner
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(6.dp))
        .background(
          if (isRecording) RamsAlertRed.copy(alpha = 0.12f)
          else MaterialTheme.colorScheme.surfaceVariant
        )
        .border(
          1.dp,
          if (isRecording) RamsAlertRed else MaterialTheme.colorScheme.outline,
          RoundedCornerShape(6.dp)
        )
        .padding(12.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = if (isRecording) Icons.Default.FiberManualRecord else Icons.Default.Stop,
            contentDescription = null,
            tint = if (isRecording) RamsAlertRed else MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(14.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = if (isRecording) "RECORDING SENSOR STREAM (50Hz)" else "LOGGER IDLE",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 10.sp,
            color = if (isRecording) RamsAlertRed else MaterialTheme.colorScheme.onSurface
          )
        }

        Text(
          text = "$recordedCount SAMPLES",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 10.sp,
          color = if (recordedCount > 0) RamsSuccessEmerald else MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Recording & Export Action Buttons
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      Button(
        onClick = onToggleRecording,
        modifier = Modifier.weight(1f),
        colors = ButtonDefaults.buttonColors(
          containerColor = if (isRecording) RamsAlertRed else RamsSuccessEmerald
        )
      ) {
        Text(
          text = if (isRecording) "STOP LOGGING" else "START RECORDING",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 10.sp
        )
      }

      Button(
        onClick = onExportCsv,
        enabled = recordedCount > 0,
        modifier = Modifier.weight(1f),
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
      ) {
        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text(
          text = "SHARE CSV",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 10.sp
        )
      }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // CSV Live Preview Table
    Text(
      text = "DATASET PREVIEW (${minOf(25, recordedCount)} ROWS)",
      style = MaterialTheme.typography.labelSmall,
      color = MaterialTheme.colorScheme.onSurfaceVariant
    )

    Spacer(modifier = Modifier.height(6.dp))

    Box(
      modifier = Modifier
        .fillMaxWidth()
        .heightIn(max = 160.dp)
        .clip(RoundedCornerShape(4.dp))
        .background(Color(0xFF09090B))
        .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp))
        .horizontalScroll(rememberScrollState())
        .verticalScroll(rememberScrollState())
        .padding(10.dp)
    ) {
      if (previewRows.isEmpty() || recordedCount == 0) {
        Text(
          text = "Press 'START RECORDING' to capture real phone IMU & GPS rows...",
          fontFamily = FontFamily.Monospace,
          fontSize = 9.sp,
          color = Color(0xFF71717A)
        )
      } else {
        Column {
          previewRows.forEachIndexed { idx, row ->
            Text(
              text = row,
              fontFamily = FontFamily.Monospace,
              fontSize = 8.sp,
              color = if (idx == 0) Color(0xFFFAFAFA) else Color(0xFFA1A1AA)
            )
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(12.dp))

    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween
    ) {
      OutlinedButton(
        onClick = onClearLogs,
        enabled = recordedCount > 0
      ) {
        Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text("CLEAR LOGS", fontFamily = FontFamily.Monospace, fontSize = 10.sp)
      }

      Button(
        onClick = onDismiss,
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
      ) {
        Text(
          "DONE",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 10.sp,
          color = MaterialTheme.colorScheme.onSurface
        )
      }
    }
  }
}

@Composable
private fun ImportTabContent(
  importedCount: Int,
  importedFileName: String,
  importError: String,
  calibration: ImuCalibration,
  importedPreviewRows: List<String>,
  onPickFile: () -> Unit,
  onMergeImported: () -> Unit,
  onClearImported: () -> Unit,
  onDismiss: () -> Unit
) {
  Column {
    // Import Status Banner
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(6.dp))
        .background(
          if (importedCount > 0) RamsSuccessEmerald.copy(alpha = 0.10f)
          else if (importError.isNotBlank()) RamsAlertRed.copy(alpha = 0.10f)
          else MaterialTheme.colorScheme.surfaceVariant
        )
        .border(
          1.dp,
          if (importedCount > 0) RamsSuccessEmerald.copy(alpha = 0.5f)
          else if (importError.isNotBlank()) RamsAlertRed.copy(alpha = 0.5f)
          else MaterialTheme.colorScheme.outline,
          RoundedCornerShape(6.dp)
        )
        .padding(12.dp)
    ) {
      Column {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Default.FileUpload,
              contentDescription = null,
              tint = if (importedCount > 0) RamsSuccessEmerald
                     else if (importError.isNotBlank()) RamsAlertRed
                     else IconImportData,
              modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = if (importedCount > 0) "IMPORTED: ${importedFileName}"
                     else if (importError.isNotBlank()) "IMPORT ERROR"
                     else "NO FILE IMPORTED",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp,
              color = if (importedCount > 0) RamsSuccessEmerald
                      else if (importError.isNotBlank()) RamsAlertRed
                      else MaterialTheme.colorScheme.onSurface
            )
          }

          if (importedCount > 0) {
            Text(
              text = "$importedCount ROWS",
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 10.sp,
              color = RamsSuccessEmerald
            )
          }
        }

        if (importError.isNotBlank()) {
          Spacer(modifier = Modifier.height(4.dp))
          Text(
            text = importError,
            fontFamily = FontFamily.Monospace,
            fontSize = 9.sp,
            color = RamsAlertRed
          )
        }
      }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // IMU Studio Calibration & False Alarm Filter Card
    Surface(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(6.dp),
      color = Color(0xFF09090B),
      border = androidx.compose.foundation.BorderStroke(
        1.dp,
        if (calibration.isCalibrated) RamsSuccessEmerald.copy(alpha = 0.6f) else Color(0xFF27272A)
      )
    ) {
      Column(modifier = Modifier.padding(12.dp)) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "IMU MOTION & FALSE-ALARM FILTER",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Black,
            fontSize = 10.sp,
            color = if (calibration.isCalibrated) RamsSuccessEmerald else IconImportData,
            letterSpacing = 0.5.sp
          )
          Text(
            text = if (calibration.isCalibrated) "CALIBRATED (DATA-DRIVEN)" else "RAW MONITORING (NO DEFAULT THRESHOLD)",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 9.sp,
            color = if (calibration.isCalibrated) RamsSuccessEmerald else Color(0xFF71717A)
          )
        }
        Spacer(modifier = Modifier.height(4.dp))
        if (calibration.isCalibrated) {
          Text(
            text = "Profile: ${calibration.sourceName}",
            fontSize = 10.sp,
            fontFamily = FontFamily.Monospace,
            color = Color.White
          )
          Spacer(modifier = Modifier.height(2.dp))
          Text(
            text = "Crash Threshold: %.2fg | Max Negative G: %.2fg (Phone Drop: %.2fg) | Suppressed: %d".format(
              calibration.crashThresholdG,
              calibration.maxNegativeG,
              calibration.phoneFallMaxG,
              calibration.falseAlarmsPreventedCount
            ),
            fontSize = 9.sp,
            fontFamily = FontFamily.Monospace,
            color = Color(0xFFA1A1AA)
          )
        } else {
          Text(
            text = "No default threshold active. The system is in baseline data collection mode. Import processed CSV data from RAMS IMU Studio to establish crash separation thresholds and negative-data false alarm filtering.",
            fontSize = 10.sp,
            color = Color(0xFFA1A1AA),
            lineHeight = 15.sp
          )
        }
      }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Import Actions
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      Button(
        onClick = onPickFile,
        modifier = Modifier.weight(1f),
        colors = ButtonDefaults.buttonColors(containerColor = IconImportData)
      ) {
        Icon(Icons.Default.FileUpload, contentDescription = null, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text(
          text = "SELECT CSV FILE",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 10.sp,
          color = Color.White
        )
      }

      Button(
        onClick = onMergeImported,
        enabled = importedCount > 0,
        modifier = Modifier.weight(1f),
        colors = ButtonDefaults.buttonColors(containerColor = RamsWarningAmber)
      ) {
        Icon(Icons.Default.MergeType, contentDescription = null, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text(
          text = "MERGE DATA",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 10.sp,
          color = Color.Black
        )
      }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Imported CSV Preview
    if (importedCount > 0) {
      Text(
        text = "IMPORTED DATA PREVIEW (${minOf(25, importedCount)} ROWS)",
        style = MaterialTheme.typography.labelSmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant
      )

      Spacer(modifier = Modifier.height(6.dp))

      Box(
        modifier = Modifier
          .fillMaxWidth()
          .heightIn(max = 160.dp)
          .clip(RoundedCornerShape(4.dp))
          .background(Color(0xFF09090B))
          .border(1.dp, IconImportData.copy(alpha = 0.3f), RoundedCornerShape(4.dp))
          .horizontalScroll(rememberScrollState())
          .verticalScroll(rememberScrollState())
          .padding(10.dp)
      ) {
        Column {
          importedPreviewRows.forEachIndexed { idx, row ->
            Text(
              text = row,
              fontFamily = FontFamily.Monospace,
              fontSize = 8.sp,
              color = if (idx == 0) IconImportData else Color(0xFFA1A1AA)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(12.dp))
    }

    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween
    ) {
      OutlinedButton(
        onClick = onClearImported,
        enabled = importedCount > 0
      ) {
        Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text("CLEAR IMPORT", fontFamily = FontFamily.Monospace, fontSize = 10.sp)
      }

      Button(
        onClick = onDismiss,
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
      ) {
        Text(
          "DONE",
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 10.sp,
          color = MaterialTheme.colorScheme.onSurface
        )
      }
    }
  }
}
