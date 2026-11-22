package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.ui.theme.RamsAlertRed
import com.example.ui.theme.RamsSuccessEmerald
import com.example.ui.theme.RamsSyncBlue
import com.example.ui.theme.RamsWarningAmber

@Composable
fun DesignRulesDialog(onDismiss: () -> Unit) {
  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxWidth(0.95f)
        .clip(RoundedCornerShape(8.dp))
        .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
        .testTag("design_rules_dialog"),
      color = MaterialTheme.colorScheme.surface
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .verticalScroll(rememberScrollState())
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
              imageVector = Icons.Default.Book,
              contentDescription = null,
              tint = RamsSyncBlue,
              modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Column {
              Text(
                text = "DESIGN SYSTEM SPECIFICATION",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface
              )
              Text(
                text = "BOLD TYPOGRAPHY & MINIMALIST DESIGN SYSTEM",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }

          IconButton(onClick = onDismiss) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurface)
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Rule 1: Bold Typographic Hierarchy & Character
        SpecificationSection(
          number = "01",
          title = "BOLD TYPOGRAPHIC HIERARCHY & CHARACTER",
          summary = "High-contrast weights (Bold 700 to Black 900) establishing confident structure without relying on decorative ornament or visual noise.",
          rules = listOf(
            "Display Scale: Plus Jakarta Sans 900, tracking -0.025em / tight.",
            "Telemetry Scale: JetBrains Mono 700 with tabular figures (0-9).",
            "Hierarchy without noise: Type scale commands layout over containers."
          )
        )

        Spacer(modifier = Modifier.height(12.dp))
        HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
        Spacer(modifier = Modifier.height(12.dp))

        // Rule 2: Modular 8pt Grid & Spatial Mathematics
        SpecificationSection(
          number = "02",
          title = "MODULAR 8PT GRID & SPATIAL MATHEMATICS",
          summary = "All container dimensions, gutters, and paddings adhere strictly to an 8-point base unit scale (8px, 16px, 24px, 32px, 48px).",
          rules = listOf(
            "Outer Padding (≥16dp) matches or exceeds child spacing (8-16dp).",
            "Nested Corner Radius: Inner Radius = Outer Radius - Padding.",
            "Responsive Grid: Single-column fluid layout with modular bento alignment."
          )
        )

        Spacer(modifier = Modifier.height(12.dp))
        HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
        Spacer(modifier = Modifier.height(12.dp))

        // Rule 3: Focused Monochromatic Palette & Contrast Control
        SpecificationSection(
          number = "03",
          title = "FOCUSED MONOCHROMATIC PALETTE",
          summary = "Eliminated artificial rainbow gradients in favor of high-discipline Slate & Zinc monochromatic canvas with purposeful semantic status indicators.",
          rules = listOf(
            "WCAG AA contrast ratio compliance (≥ 4.5:1).",
            "Surface Base (#FAFAFA / #09090B), Deep Canvas (#18181B).",
            "Functional accents: Impact Shock (Red), Wearable Sync (Blue), Normal (Emerald)."
          )
        )

        Spacer(modifier = Modifier.height(12.dp))
        HorizontalDivider(color = MaterialTheme.colorScheme.outline, thickness = 1.dp)
        Spacer(modifier = Modifier.height(12.dp))

        // Rule 4: Anti-Slop Discipline
        SpecificationSection(
          number = "04",
          title = "ANTI-SLOP & STRUCTURAL DISCIPLINE",
          summary = "Strict prohibition against decorative clutter, cards-inside-cards, and fake gradients.",
          rules = listOf(
            "No Nested Containers: Hierarchy is built using subtle hair-line borders (1px solid).",
            "No Visual Gimmicks: Zero decorative emojis, neon glows, or pseudo-futuristic noise.",
            "Single-Line Atomic Badges: Flat compact badges with tabular numerical metrics."
          )
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
          onClick = onDismiss,
          modifier = Modifier.fillMaxWidth(),
          colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
        ) {
          Text(
            text = "CLOSE SPECIFICATION",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            fontSize = 11.sp
          )
        }
      }
    }
  }
}

@Composable
private fun SpecificationSection(
  number: String,
  title: String,
  summary: String,
  rules: List<String>
) {
  Column(
    modifier = Modifier.fillMaxWidth(),
    verticalArrangement = Arrangement.spacedBy(4.dp)
  ) {
    Row(verticalAlignment = Alignment.CenterVertically) {
      Box(
        modifier = Modifier
          .clip(RoundedCornerShape(3.dp))
          .background(MaterialTheme.colorScheme.surfaceVariant)
          .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(3.dp))
          .padding(horizontal = 6.dp, vertical = 2.dp)
      ) {
        Text(
          text = number,
          fontFamily = FontFamily.Monospace,
          fontWeight = FontWeight.Black,
          fontSize = 9.sp,
          color = RamsSyncBlue
        )
      }
      Spacer(modifier = Modifier.width(8.dp))
      Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        color = MaterialTheme.colorScheme.onSurface
      )
    }

    Text(
      text = summary,
      style = MaterialTheme.typography.bodyMedium,
      color = MaterialTheme.colorScheme.onSurfaceVariant
    )

    Spacer(modifier = Modifier.height(2.dp))

    rules.forEach { rule ->
      Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
      ) {
        Box(
          modifier = Modifier
            .padding(top = 6.dp)
            .size(4.dp)
            .clip(CircleShape)
            .background(RamsSyncBlue)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          text = rule,
          fontFamily = FontFamily.Monospace,
          fontSize = 10.sp,
          lineHeight = 14.sp,
          color = MaterialTheme.colorScheme.onSurface
        )
      }
    }
  }
}
