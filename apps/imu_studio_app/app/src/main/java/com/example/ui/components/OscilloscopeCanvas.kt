package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ImuSamplePoint
import com.example.ui.theme.MonoBorder
import com.example.ui.theme.MonoMediumGray
import com.example.ui.theme.MonoWhite
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.WaveAx
import com.example.ui.theme.WaveAy
import com.example.ui.theme.WaveAz
import com.example.ui.theme.WaveGx
import com.example.ui.theme.WaveGy
import com.example.ui.theme.WaveGyroMag
import com.example.ui.theme.WaveGz
import com.example.ui.theme.WaveSvm

@Composable
fun OscilloscopeCanvas(
    samples: List<ImuSamplePoint>,
    modifier: Modifier = Modifier,
    showGyroscope: Boolean = false,
    title: String = "REAL-TIME IMU WAVEFORM"
) {
    val samplePoints = remember(samples) { samples.takeLast(100) }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(SurfaceDark)
            .border(1.dp, MonoBorder, RoundedCornerShape(8.dp))
            .testTag("oscilloscope_canvas_card")
    ) {
        Column(modifier = Modifier.fillMaxSize().padding(10.dp)) {
            // Header bar with channel legend
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium.copy(
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.2.sp
                    ),
                    color = MonoWhite
                )

                Spacer(modifier = Modifier.weight(1f))

                // Custom wave colors in legend
                if (!showGyroscope) {
                    LegendItem("X", WaveAx)
                    Spacer(modifier = Modifier.width(6.dp))
                    LegendItem("Y", WaveAy)
                    Spacer(modifier = Modifier.width(6.dp))
                    LegendItem("Z", WaveAz)
                    Spacer(modifier = Modifier.width(6.dp))
                    LegendItem("SVM", WaveSvm)
                } else {
                    LegendItem("Gx", WaveGx)
                    Spacer(modifier = Modifier.width(6.dp))
                    LegendItem("Gy", WaveGy)
                    Spacer(modifier = Modifier.width(6.dp))
                    LegendItem("Gz", WaveGz)
                    Spacer(modifier = Modifier.width(6.dp))
                    LegendItem("Mag", WaveGyroMag)
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Canvas Waveform Area in Pure Monochrome Black with Vibrant Waves
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color(0xFF000000))
                    .border(1.dp, Color(0xFF1C1C1C), RoundedCornerShape(4.dp))
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val width = size.width
                    val height = size.height
                    val centerY = height / 2f

                    // Subtle monochrome grid lines
                    val gridColor = Color(0xFF1A1A1A)
                    val centerLineColor = Color(0xFF2E2E2E)

                    // Horizontal grid lines
                    val stepY = height / 6f
                    for (i in 1..5) {
                        val y = i * stepY
                        val isCenter = (i == 3)
                        drawLine(
                            color = if (isCenter) centerLineColor else gridColor,
                            start = Offset(0f, y),
                            end = Offset(width, y),
                            strokeWidth = if (isCenter) 1.5f else 1f,
                            pathEffect = if (!isCenter) PathEffect.dashPathEffect(floatArrayOf(4f, 4f), 0f) else null
                        )
                    }

                    // Vertical grid lines (time division)
                    val stepX = width / 8f
                    for (i in 1..7) {
                        val x = i * stepX
                        drawLine(
                            color = gridColor,
                            start = Offset(x, 0f),
                            end = Offset(x, height),
                            strokeWidth = 1f,
                            pathEffect = PathEffect.dashPathEffect(floatArrayOf(3f, 6f), 0f)
                        )
                    }

                    if (samplePoints.size < 2) return@Canvas

                    val maxPoints = 100
                    val dx = width / (maxPoints - 1).toFloat()
                    val startOffsetIndex = maxPoints - samplePoints.size
                    val startX = startOffsetIndex * dx

                    val maxVal = if (!showGyroscope) 35f else 8f // Scale range: ~35 m/s² (~3.5G) or 8 rad/s

                    val pathX = Path()
                    val pathY = Path()
                    val pathZ = Path()
                    val pathMag = Path()

                    samplePoints.forEachIndexed { index, sample ->
                        val xPos = startX + index * dx

                        val vX = if (!showGyroscope) sample.ax else sample.gx
                        val vY = if (!showGyroscope) sample.ay else sample.gy
                        val vZ = if (!showGyroscope) sample.az else sample.gz
                        val vMag = if (!showGyroscope) sample.svm else sample.gyroMag

                        val yX = centerY - (vX / maxVal) * (height * 0.45f)
                        val yY = centerY - (vY / maxVal) * (height * 0.45f)
                        val yZ = centerY - (vZ / maxVal) * (height * 0.45f)
                        val yMag = centerY - (vMag / maxVal) * (height * 0.45f)

                        if (index == 0) {
                            pathX.moveTo(xPos, yX)
                            pathY.moveTo(xPos, yY)
                            pathZ.moveTo(xPos, yZ)
                            pathMag.moveTo(xPos, yMag)
                        } else {
                            pathX.lineTo(xPos, yX)
                            pathY.lineTo(xPos, yY)
                            pathZ.lineTo(xPos, yZ)
                            pathMag.lineTo(xPos, yMag)
                        }
                    }

                    // Draw the custom colored waves on IMU readings
                    val colorX = if (!showGyroscope) WaveAx else WaveGx
                    val colorY = if (!showGyroscope) WaveAy else WaveGy
                    val colorZ = if (!showGyroscope) WaveAz else WaveGz
                    val colorMag = if (!showGyroscope) WaveSvm else WaveGyroMag

                    drawPath(pathX, colorX.copy(alpha = 0.85f), style = Stroke(width = 1.6f))
                    drawPath(pathY, colorY.copy(alpha = 0.85f), style = Stroke(width = 1.6f))
                    drawPath(pathZ, colorZ.copy(alpha = 0.85f), style = Stroke(width = 1.6f))
                    drawPath(pathMag, colorMag, style = Stroke(width = 2.4f))
                }

                // Scale indicator badge at bottom right
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(4.dp)
                        .background(Color(0xFF121212), RoundedCornerShape(3.dp))
                        .border(1.dp, Color(0xFF262626), RoundedCornerShape(3.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = if (!showGyroscope) "Scale: ±3.5G / ±35 m/s²" else "Scale: ±8.0 rad/s",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontSize = 9.sp,
                            fontFamily = FontFamily.Monospace
                        ),
                        color = MonoMediumGray
                    )
                }
            }
        }
    }
}

@Composable
private fun LegendItem(label: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(7.dp)
                .clip(RoundedCornerShape(1.dp))
                .background(color)
        )
        Spacer(modifier = Modifier.width(3.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall.copy(
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold
            ),
            color = color
        )
    }
}
