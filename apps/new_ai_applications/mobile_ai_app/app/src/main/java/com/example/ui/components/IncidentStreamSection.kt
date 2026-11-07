package com.example.ui.components

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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Radio
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.IncidentEvent
import com.example.model.IncidentType
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber
import java.util.Locale

@Composable
fun IncidentStreamSection(
  events: List<IncidentEvent>,
  activeFilter: String,
  searchQuery: String,
  onFilterChange: (String) -> Unit,
  onSearchChange: (String) -> Unit,
  onSelectEvent: (IncidentEvent) -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(8.dp))
      .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
      .testTag("incident_stream_section"),
    color = MaterialTheme.colorScheme.surface
  ) {
    Column(modifier = Modifier.padding(16.dp)) {
      // Stream Header & Count
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.Radio,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "LIVE INCIDENT STREAM",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }

        Box(
          modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
          Text(
            text = "${events.size} RECORDS",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 9.sp,
            color = MaterialTheme.colorScheme.onSurface
          )
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Search Field (Unnested hair-line input)
      OutlinedTextField(
        value = searchQuery,
        onValueChange = onSearchChange,
        placeholder = {
          Text(
            text = "FILTER BY RIDER, PLATE, OR TOKEN...",
            fontFamily = FontFamily.Monospace,
            fontSize = 10.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        },
        leadingIcon = {
          Icon(
            imageVector = Icons.Default.Search,
            contentDescription = "Search",
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(16.dp)
          )
        },
        singleLine = true,
        modifier = Modifier
          .fillMaxWidth()
          .height(48.dp)
          .testTag("incident_search_input"),
        colors = OutlinedTextFieldDefaults.colors(
          focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
          unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f),
          focusedBorderColor = MaterialTheme.colorScheme.primary,
          unfocusedBorderColor = MaterialTheme.colorScheme.outline
        )
      )

      Spacer(modifier = Modifier.height(10.dp))

      // Filter Tabs (ALL, ALERT, TEST, TELEMETRY)
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        listOf("ALL", "ALERT", "TEST", "TELEMETRY").forEach { tab ->
          val isSelected = activeFilter == tab
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(4.dp))
              .background(
                if (isSelected) MaterialTheme.colorScheme.primary
                else MaterialTheme.colorScheme.surfaceVariant
              )
              .border(
                1.dp,
                if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline,
                RoundedCornerShape(4.dp)
              )
              .clickable { onFilterChange(tab) }
              .padding(horizontal = 8.dp, vertical = 4.dp)
          ) {
            Text(
              text = tab,
              fontFamily = FontFamily.Monospace,
              fontWeight = FontWeight.Bold,
              fontSize = 9.sp,
              color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Unnested Stream Rows with 1px Hair-line Dividers (No nested card containers!)
      Column(modifier = Modifier.fillMaxWidth()) {
        if (events.isEmpty()) {
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .padding(vertical = 16.dp),
            contentAlignment = Alignment.Center
          ) {
            Text(
              text = "NO INCIDENTS MATCHING FILTER",
              fontFamily = FontFamily.Monospace,
              fontSize = 10.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        } else {
          events.take(5).forEachIndexed { index, event ->
            IncidentRowItem(
              event = event,
              onClick = { onSelectEvent(event) }
            )
            if (index < events.take(5).size - 1) {
              HorizontalDivider(
                color = MaterialTheme.colorScheme.outline,
                thickness = 1.dp
              )
            }
          }
        }
      }
    }
  }
}

@Composable
private fun IncidentRowItem(
  event: IncidentEvent,
  onClick: () -> Unit
) {
  val (typeLabel, typeColor) = when (event.type) {
    IncidentType.ALERT -> Pair("CRASH ALERT", RamsAlertRed)
    IncidentType.TEST -> Pair("TEST PIN", RamsWarningAmber)
    IncidentType.FALSE_ALARM -> Pair("FALSE ALARM", RamsSuccessEmerald)
    IncidentType.TELEMETRY -> Pair("TELEMETRY", RamsSyncBlue)
  }

  Row(
    modifier = Modifier
      .fillMaxWidth()
      .clickable { onClick() }
      .padding(vertical = 10.dp)
      .testTag("incident_item_${event.id}"),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.SpaceBetween
  ) {
    Row(
      modifier = Modifier.weight(1f),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Box(
        modifier = Modifier
          .size(8.dp)
          .clip(CircleShape)
          .background(typeColor)
      )
      Spacer(modifier = Modifier.width(10.dp))
      Column {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text(
            text = typeLabel,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 9.sp,
            color = typeColor
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = event.id,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 10.sp,
            color = MaterialTheme.colorScheme.onSurface
          )
        }
        Spacer(modifier = Modifier.height(2.dp))
        Text(
          text = "${event.riderName} • ${event.plateNumber} • ${String.format(Locale.US, "%.1f km/h", event.speedKmh)}",
          fontFamily = FontFamily.Monospace,
          fontSize = 9.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
    }

    Row(verticalAlignment = Alignment.CenterVertically) {
      Column(horizontalAlignment = Alignment.End) {
        Text(
          text = String.format(Locale.US, "%.2f G", event.aMag),
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Bold,
          fontSize = 11.sp,
          color = if (event.aMag >= 3.0f) RamsAlertRed else MaterialTheme.colorScheme.onSurface
        )
        Text(
          text = "SYNCED",
          fontFamily = FontFamily.Monospace,
          fontSize = 8.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
      Spacer(modifier = Modifier.width(6.dp))
      Icon(
        imageVector = Icons.Default.ChevronRight,
        contentDescription = "View Profile",
        tint = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.size(16.dp)
      )
    }
  }
}
