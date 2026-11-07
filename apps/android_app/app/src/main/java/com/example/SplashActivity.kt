package com.example

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@SuppressLint("CustomSplashScreen")
class SplashActivity : ComponentActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    setContent {
      RamsSplashScreen(
        onSplashComplete = {
          navigateToMain()
        }
      )
    }
  }

  private fun navigateToMain() {
    val intent = Intent(this, MainActivity::class.java)
    startActivity(intent)
    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    finish()
  }
}

@Composable
fun RamsSplashScreen(
  onSplashComplete: () -> Unit
) {
  val totalDurationMs = 5000L

  val bootMessages = remember {
    listOf(
      "INITIALIZING TELEMETRY UPLINK...",
      "CALIBRATING GPS & ACCELEROMETER SENSORS...",
      "CONFIGURING BLUETOOTH WEARABLE SYNC...",
      "LOADING MAP TILE CACHE...",
      "CONNECTING EMERGENCY DISPATCH PIPELINE...",
      "PERFORMING MULTI-SENSOR DIAGNOSTICS...",
      "SYSTEM READY"
    )
  }

  var currentMsgIndex by remember { mutableIntStateOf(0) }
  var progressValue by remember { mutableFloatStateOf(0f) }

  // Pulse Ring Animations
  val outerPulse = remember { Animatable(0.85f) }
  val middlePulse = remember { Animatable(0.9f) }
  val innerPulse = remember { Animatable(0.95f) }
  val logoBreathe = remember { Animatable(1.0f) }

  LaunchedEffect(Unit) {
    outerPulse.animateTo(
      targetValue = 1.35f,
      animationSpec = infiniteRepeatable(
        animation = tween(2200, easing = FastOutSlowInEasing),
        repeatMode = RepeatMode.Reverse
      )
    )
  }

  LaunchedEffect(Unit) {
    middlePulse.animateTo(
      targetValue = 1.25f,
      animationSpec = infiniteRepeatable(
        animation = tween(1800, delayMillis = 300, easing = FastOutSlowInEasing),
        repeatMode = RepeatMode.Reverse
      )
    )
  }

  LaunchedEffect(Unit) {
    innerPulse.animateTo(
      targetValue = 1.18f,
      animationSpec = infiniteRepeatable(
        animation = tween(1400, delayMillis = 600, easing = FastOutSlowInEasing),
        repeatMode = RepeatMode.Reverse
      )
    )
  }

  LaunchedEffect(Unit) {
    logoBreathe.animateTo(
      targetValue = 1.04f,
      animationSpec = infiniteRepeatable(
        animation = tween(2000, easing = FastOutSlowInEasing),
        repeatMode = RepeatMode.Reverse
      )
    )
  }

  // Progress Bar & Message Cycling Loop
  LaunchedEffect(Unit) {
    val startTime = System.currentTimeMillis()
    val msgInterval = totalDurationMs / bootMessages.size

    while (true) {
      val elapsed = System.currentTimeMillis() - startTime
      progressValue = (elapsed.toFloat() / totalDurationMs).coerceIn(0f, 1f)

      val msgIdx = ((elapsed / msgInterval).toInt()).coerceIn(0, bootMessages.size - 1)
      currentMsgIndex = msgIdx

      if (elapsed >= totalDurationMs) {
        progressValue = 1f
        currentMsgIndex = bootMessages.size - 1
        delay(350L)
        onSplashComplete()
        break
      }
      delay(30L)
    }
  }

  Box(
    modifier = Modifier
      .fillMaxSize()
      .background(Color(0xFF09090B))
      .clickable(
        interactionSource = remember { MutableInteractionSource() },
        indication = null
      ) {
        // Allow tap-to-skip
        onSplashComplete()
      },
    contentAlignment = Alignment.Center
  ) {
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center,
      modifier = Modifier.padding(horizontal = 24.dp)
    ) {

      // Pulse Rings + Center Logo
      Box(
        modifier = Modifier
          .size(160.dp),
        contentAlignment = Alignment.Center
      ) {
        // Outer Blue Ring
        Box(
          modifier = Modifier
            .size(150.dp)
            .scale(outerPulse.value)
            .border(
              width = 1.5.dp,
              color = Color(0xFF3B82F6).copy(alpha = (1.4f - outerPulse.value).coerceIn(0.1f, 0.4f)),
              shape = CircleShape
            )
        )

        // Middle Red Ring
        Box(
          modifier = Modifier
            .size(134.dp)
            .scale(middlePulse.value)
            .border(
              width = 1.5.dp,
              color = Color(0xFFEF4444).copy(alpha = (1.3f - middlePulse.value).coerceIn(0.15f, 0.5f)),
              shape = CircleShape
            )
        )

        // Inner Emerald Ring
        Box(
          modifier = Modifier
            .size(118.dp)
            .scale(innerPulse.value)
            .border(
              width = 2.dp,
              color = Color(0xFF10B981).copy(alpha = (1.25f - innerPulse.value).coerceIn(0.2f, 0.6f)),
              shape = CircleShape
            )
        )

        // Center Logo Image
        Image(
          painter = painterResource(id = R.drawable.logo),
          contentDescription = "RAMS Logo",
          contentScale = ContentScale.Crop,
          modifier = Modifier
            .size(96.dp)
            .scale(logoBreathe.value)
            .clip(CircleShape)
            .border(2.5.dp, Color(0xFF27272A), CircleShape)
        )
      }

      Spacer(modifier = Modifier.height(28.dp))

      // Status Badge
      Surface(
        shape = RoundedCornerShape(4.dp),
        color = Color(0xFF18181B),
        border = BorderStroke(1.dp, Color(0xFF27272A))
      ) {
        Text(
          text = "OPERATIONS STATION • v2.0",
          fontFamily = FontFamily.Monospace,
          fontSize = 10.sp,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF10B981),
          letterSpacing = 0.8.sp,
          modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        )
      }

      Spacer(modifier = Modifier.height(14.dp))

      // App Title
      Text(
        text = "ROAD ACCIDENT MONITORING SYSTEM",
        color = Color.White,
        fontSize = 14.5.sp,
        fontWeight = FontWeight.Black,
        letterSpacing = 1.2.sp,
        textAlign = TextAlign.Center
      )

      Spacer(modifier = Modifier.height(4.dp))

      // Innovation Challenge Subtitle
      Text(
        text = "PGC DIGITAL INNOVATION CHALLENGE 2026",
        color = Color(0xFF71717A),
        fontFamily = FontFamily.Monospace,
        fontSize = 10.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 0.6.sp,
        textAlign = TextAlign.Center
      )

      Spacer(modifier = Modifier.height(32.dp))

      // Deterministic Progress Bar
      Box(
        modifier = Modifier
          .width(240.dp)
          .height(3.dp)
          .clip(RoundedCornerShape(9999.dp))
          .background(Color(0xFF18181B))
      ) {
        Box(
          modifier = Modifier
            .fillMaxWidth(progressValue)
            .height(3.dp)
            .background(
              Brush.horizontalGradient(
                colors = listOf(
                  Color(0xFF3B82F6),
                  Color(0xFF10B981),
                  Color(0xFFF59E0B),
                  Color(0xFFEF4444)
                )
              )
            )
        )
      }

      Spacer(modifier = Modifier.height(8.dp))

      // Percentage Text
      Text(
        text = "${(progressValue * 100).toInt()}%",
        fontFamily = FontFamily.Monospace,
        fontSize = 9.5.sp,
        fontWeight = FontWeight.Bold,
        color = Color(0xFF52525B),
        letterSpacing = 0.8.sp
      )

      Spacer(modifier = Modifier.height(10.dp))

      // Status Message
      Text(
        text = bootMessages.getOrElse(currentMsgIndex) { "SYSTEM READY" },
        fontFamily = FontFamily.Monospace,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = Color(0xFFA1A1AA),
        letterSpacing = 0.8.sp,
        textAlign = TextAlign.Center
      )
    }

    // Bottom subtle hint
    Text(
      text = "TAP TO SKIP",
      fontFamily = FontFamily.Monospace,
      fontSize = 8.5.sp,
      fontWeight = FontWeight.Medium,
      color = Color(0xFF3F3F46),
      letterSpacing = 1.sp,
      modifier = Modifier
        .align(Alignment.BottomCenter)
        .padding(bottom = 24.dp)
    )
  }
}
