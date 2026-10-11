package com.example.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.GpsData
import com.example.model.ImuData
import com.example.model.IncidentEvent
import com.example.model.RiderProfile
import com.example.ui.components.IncidentStreamSection
import com.example.ui.components.RamsMapView

@Composable
fun MapScreen(
  gps: GpsData,
  imu: ImuData = ImuData(),
  events: List<IncidentEvent>,
  selectedEvent: IncidentEvent?,
  onSelectEvent: (IncidentEvent) -> Unit,
  riderProfile: RiderProfile,
  onOpenLoginDialog: () -> Unit,
  filteredEvents: List<IncidentEvent> = events,
  activeFilter: String = "ALL",
  searchQuery: String = "",
  onFilterChange: (String) -> Unit = {},
  onSearchChange: (String) -> Unit = {}
) {
  val showNearbyIncidents = riderProfile.showNearbyIncidents
  val activeHeading = if (imu.yawDegrees != 0f) imu.yawDegrees else gps.headingDegrees

  Column(
    modifier = Modifier
      .fillMaxSize()
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 16.dp, vertical = 12.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    // 1. Live Interactive Map (Main User Pin + Direction Beam + Offline Fallback)
    RamsMapView(
      gps = gps,
      imu = imu,
      events = events,
      selectedEvent = selectedEvent,
      onSelectEvent = onSelectEvent,
      riderProfile = riderProfile,
      onOpenLoginDialog = onOpenLoginDialog
    )

    // 2. High-Precision GNSS Coordinates & Speed Grid
    Surface(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(12.dp),
      color = MaterialTheme.colorScheme.surface,
      border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
    ) {
      Column(
        modifier = Modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "DUAL-BAND GNSS TELEMETRY",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Black,
            color = Color(0xFFA1A1AA),
            letterSpacing = 1.sp
          )
          Surface(
            shape = RoundedCornerShape(4.dp),
            color = if (gps.hasFix) Color(0xFF10B981).copy(alpha = 0.15f) else Color(0xFFF59E0B).copy(alpha = 0.15f),
            border = androidx.compose.foundation.BorderStroke(
              1.dp,
              if (gps.hasFix) Color(0xFF10B981).copy(alpha = 0.5f) else Color(0xFFF59E0B).copy(alpha = 0.5f)
            )
          ) {
            Text(
              text = if (gps.hasFix) "3D FIX ACQUIRED" else "SEARCHING FIX",
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = if (gps.hasFix) Color(0xFF10B981) else Color(0xFFF59E0B)
            )
          }
        }

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          MetricTile(
            label = "LATITUDE",
            value = if (gps.hasFix) String.format(java.util.Locale.US, "%.6f° N", gps.latitude) else "NO FIX",
            modifier = Modifier.weight(1f)
          )
          MetricTile(
            label = "LONGITUDE",
            value = if (gps.hasFix) String.format(java.util.Locale.US, "%.6f° E", gps.longitude) else "NO FIX",
            modifier = Modifier.weight(1f)
          )
        }

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          MetricTile(
            label = "GROUND SPEED",
            value = String.format(java.util.Locale.US, "%.1f km/h", gps.speedKmh),
            modifier = Modifier.weight(1f)
          )
          MetricTile(
            label = "HEADING",
            value = String.format(java.util.Locale.US, "%03.0f°", activeHeading),
            modifier = Modifier.weight(1f)
          )
          MetricTile(
            label = "SATELLITES",
            value = "${gps.satellites} LOCKED",
            modifier = Modifier.weight(1f)
          )
        }
      }
    }

    // 3. Incident Stream Section (Hidden by default unless enabled in Settings)
    if (showNearbyIncidents) {
      IncidentStreamSection(
        events = filteredEvents,
        activeFilter = activeFilter,
        searchQuery = searchQuery,
        onFilterChange = onFilterChange,
        onSearchChange = onSearchChange,
        onSelectEvent = onSelectEvent
      )
    } else {
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          Text(
            text = "AREA INCIDENT RADAR",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Black,
            color = Color(0xFFA1A1AA),
            letterSpacing = 1.sp
          )
          Text(
            text = "Nearby crash markers and emergency incident alerts are hidden by default. You can enable them anytime in the Settings tab.",
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF71717A),
            fontSize = 11.sp
          )
        }
      }
    }
  }
}

@Composable
private fun MetricTile(
  label: String,
  value: String,
  modifier: Modifier = Modifier
) {
  Surface(
    modifier = modifier,
    shape = RoundedCornerShape(8.dp),
    color = Color(0xFF09090B),
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF27272A))
  ) {
    Column(
      modifier = Modifier.padding(10.dp)
    ) {
      Text(
        text = label,
        fontSize = 9.sp,
        fontWeight = FontWeight.Bold,
        fontFamily = FontFamily.Monospace,
        color = Color(0xFF71717A)
      )
      Text(
        text = value,
        fontSize = 13.sp,
        fontWeight = FontWeight.Black,
        fontFamily = FontFamily.Monospace,
        color = Color.White
      )
    }
  }
}
