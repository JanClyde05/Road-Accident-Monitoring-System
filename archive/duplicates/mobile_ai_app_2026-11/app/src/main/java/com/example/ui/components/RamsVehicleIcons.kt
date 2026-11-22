package com.example.ui.components

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathFillType
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.unit.dp

/**
 * Custom vehicle category icons for Philippine road classification.
 * Each icon is a 24x24dp vector drawn to match Material icon style.
 */
object RamsVehicleIcons {

  /**
   * Philippine Tricycle — 3-wheeled motorcycle with sidecar cabin.
   */
  val Tricycle: ImageVector by lazy {
    ImageVector.Builder(
      name = "Tricycle",
      defaultWidth = 24.dp,
      defaultHeight = 24.dp,
      viewportWidth = 24f,
      viewportHeight = 24f
    ).apply {
      // Sidecar cabin body
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f,
        strokeLineCap = StrokeCap.Round,
        strokeLineJoin = StrokeJoin.Round
      ) {
        moveTo(3f, 14f)
        lineTo(4f, 10f)
        lineTo(5f, 7f)
        lineTo(12f, 7f)
        lineTo(13f, 10f)
        lineTo(14f, 14f)
        close()
      }
      // Motorcycle frame (right side)
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f,
        strokeLineCap = StrokeCap.Round,
        strokeLineJoin = StrokeJoin.Round
      ) {
        moveTo(14f, 12f)
        lineTo(17f, 9f)
        lineTo(19f, 7f)
        moveTo(17f, 9f)
        lineTo(20f, 12f)
        lineTo(19f, 14f)
        lineTo(15f, 14f)
      }
      // Left wheel
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f,
        strokeLineCap = StrokeCap.Round
      ) {
        moveTo(7.5f, 16f)
        arcTo(2f, 2f, 0f, true, true, 3.5f, 16f)
        arcTo(2f, 2f, 0f, true, true, 7.5f, 16f)
      }
      // Middle wheel
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f,
        strokeLineCap = StrokeCap.Round
      ) {
        moveTo(14f, 16f)
        arcTo(2f, 2f, 0f, true, true, 10f, 16f)
        arcTo(2f, 2f, 0f, true, true, 14f, 16f)
      }
      // Motorcycle wheel
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f,
        strokeLineCap = StrokeCap.Round
      ) {
        moveTo(21f, 16f)
        arcTo(2f, 2f, 0f, true, true, 17f, 16f)
        arcTo(2f, 2f, 0f, true, true, 21f, 16f)
      }
    }.build()
  }

  /**
   * Van — boxy UV Express / minivan silhouette.
   */
  val Van: ImageVector by lazy {
    ImageVector.Builder(
      name = "Van",
      defaultWidth = 24.dp,
      defaultHeight = 24.dp,
      viewportWidth = 24f,
      viewportHeight = 24f
    ).apply {
      // Van body
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f,
        strokeLineCap = StrokeCap.Round,
        strokeLineJoin = StrokeJoin.Round
      ) {
        moveTo(2f, 15f)
        lineTo(2f, 8f)
        lineTo(4f, 6f)
        lineTo(16f, 6f)
        lineTo(20f, 8f)
        lineTo(22f, 10f)
        lineTo(22f, 15f)
        lineTo(2f, 15f)
      }
      // Windshield
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.2f,
        strokeLineCap = StrokeCap.Round,
        strokeLineJoin = StrokeJoin.Round
      ) {
        moveTo(16f, 6.5f)
        lineTo(19f, 8.5f)
        lineTo(19f, 11f)
        lineTo(16f, 11f)
        close()
      }
      // Side windows
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.2f,
        strokeLineCap = StrokeCap.Round,
        strokeLineJoin = StrokeJoin.Round
      ) {
        moveTo(5f, 7f)
        lineTo(5f, 11f)
        lineTo(9f, 11f)
        lineTo(9f, 7f)
        moveTo(10f, 7f)
        lineTo(10f, 11f)
        lineTo(15f, 11f)
        lineTo(15f, 7f)
      }
      // Front wheel
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f
      ) {
        moveTo(8f, 16f)
        arcTo(2f, 2f, 0f, true, true, 4f, 16f)
        arcTo(2f, 2f, 0f, true, true, 8f, 16f)
      }
      // Rear wheel
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f
      ) {
        moveTo(20f, 16f)
        arcTo(2f, 2f, 0f, true, true, 16f, 16f)
        arcTo(2f, 2f, 0f, true, true, 20f, 16f)
      }
    }.build()
  }

  /**
   * Bus — elongated public bus with multiple windows.
   */
  val Bus: ImageVector by lazy {
    ImageVector.Builder(
      name = "Bus",
      defaultWidth = 24.dp,
      defaultHeight = 24.dp,
      viewportWidth = 24f,
      viewportHeight = 24f
    ).apply {
      // Bus body
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f,
        strokeLineCap = StrokeCap.Round,
        strokeLineJoin = StrokeJoin.Round
      ) {
        moveTo(1f, 15f)
        lineTo(1f, 7f)
        lineTo(3f, 5f)
        lineTo(21f, 5f)
        lineTo(23f, 7f)
        lineTo(23f, 15f)
        close()
      }
      // Windows row (4 windows)
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.2f,
        strokeLineCap = StrokeCap.Round,
        strokeLineJoin = StrokeJoin.Round
      ) {
        // Window 1
        moveTo(3f, 7f)
        lineTo(3f, 10.5f)
        lineTo(6f, 10.5f)
        lineTo(6f, 7f)
        // Window 2
        moveTo(7.5f, 7f)
        lineTo(7.5f, 10.5f)
        lineTo(10.5f, 10.5f)
        lineTo(10.5f, 7f)
        // Window 3
        moveTo(12f, 7f)
        lineTo(12f, 10.5f)
        lineTo(15f, 10.5f)
        lineTo(15f, 7f)
        // Windshield
        moveTo(17f, 7f)
        lineTo(17f, 10.5f)
        lineTo(21f, 10.5f)
        lineTo(21f, 7f)
      }
      // Door line
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.2f,
        strokeLineCap = StrokeCap.Round
      ) {
        moveTo(16f, 10.5f)
        lineTo(16f, 15f)
      }
      // Front wheel
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f
      ) {
        moveTo(7f, 16f)
        arcTo(2f, 2f, 0f, true, true, 3f, 16f)
        arcTo(2f, 2f, 0f, true, true, 7f, 16f)
      }
      // Rear wheel
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f
      ) {
        moveTo(21f, 16f)
        arcTo(2f, 2f, 0f, true, true, 17f, 16f)
        arcTo(2f, 2f, 0f, true, true, 21f, 16f)
      }
    }.build()
  }

  /**
   * Truck — cargo truck with cabin and cargo bed.
   */
  val Truck: ImageVector by lazy {
    ImageVector.Builder(
      name = "Truck",
      defaultWidth = 24.dp,
      defaultHeight = 24.dp,
      viewportWidth = 24f,
      viewportHeight = 24f
    ).apply {
      // Cargo bed
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f,
        strokeLineCap = StrokeCap.Round,
        strokeLineJoin = StrokeJoin.Round
      ) {
        moveTo(1f, 7f)
        lineTo(14f, 7f)
        lineTo(14f, 15f)
        lineTo(1f, 15f)
        close()
      }
      // Truck cabin
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f,
        strokeLineCap = StrokeCap.Round,
        strokeLineJoin = StrokeJoin.Round
      ) {
        moveTo(14f, 9f)
        lineTo(19f, 9f)
        lineTo(22f, 12f)
        lineTo(22f, 15f)
        lineTo(14f, 15f)
      }
      // Cabin windshield
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.2f,
        strokeLineCap = StrokeCap.Round,
        strokeLineJoin = StrokeJoin.Round
      ) {
        moveTo(16f, 10f)
        lineTo(18f, 10f)
        lineTo(20f, 12f)
        lineTo(16f, 12f)
        close()
      }
      // Front wheel
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f
      ) {
        moveTo(7f, 16f)
        arcTo(2f, 2f, 0f, true, true, 3f, 16f)
        arcTo(2f, 2f, 0f, true, true, 7f, 16f)
      }
      // Rear wheel
      path(
        fill = null,
        stroke = SolidColor(Color.White),
        strokeLineWidth = 1.8f
      ) {
        moveTo(21f, 16f)
        arcTo(2f, 2f, 0f, true, true, 17f, 16f)
        arcTo(2f, 2f, 0f, true, true, 21f, 16f)
      }
    }.build()
  }
}
