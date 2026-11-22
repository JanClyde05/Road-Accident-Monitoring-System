package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ai.VoiceAlarmCanceler

/**
 * Google Assistant / Gemini style RAMS Voice AI & Safety Abort Overlay.
 *
 * Features:
 * - Fluid translucent backdrop scrim that dismisses on outside tap.
 * - 4-color signature assistant glowing lightbar (Google Assistant / Gemini style).
 * - Stable, jitter-free animated mic orb with status-driven states (Listening, Hearing, Speaking, Aborted).
 * - Live transcript & dialogue bubble.
 * - Immediate tactile cancel buttons [CANCEL ALARM] and [I AM SAFE].
 */
@Composable
fun VoiceBubbleOverlay(
    voiceCanceler: VoiceAlarmCanceler,
    modifier: Modifier = Modifier
) {
    val isVisible by voiceCanceler.isBubbleVisible.collectAsStateWithLifecycle()
    val engineState by voiceCanceler.engineState.collectAsStateWithLifecycle()
    val liveTranscript by voiceCanceler.liveTranscriptFlow.collectAsStateWithLifecycle()
    val promptMessage by voiceCanceler.promptMessageFlow.collectAsStateWithLifecycle()
    val chatMessages by voiceCanceler.chatMessagesFlow.collectAsStateWithLifecycle()

    AnimatedVisibility(
        visible = isVisible,
        enter = fadeIn(tween(200)),
        exit = fadeOut(tween(200)),
        modifier = modifier.fillMaxSize()
    ) {
        // 1. Semi-transparent backdrop scrim (tap outside to dismiss)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.55f))
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) {
                    voiceCanceler.dismissBubble()
                },
            contentAlignment = Alignment.BottomCenter
        ) {
            // Pulse transition for glowing mic orb
            val infiniteTransition = rememberInfiniteTransition(label = "VoicePulse")
            val pulseScale by infiniteTransition.animateFloat(
                initialValue = 1.0f,
                targetValue = 1.25f,
                animationSpec = infiniteRepeatable(
                    animation = tween(800, easing = FastOutSlowInEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "pulseScale"
            )
            val pulseAlpha by infiniteTransition.animateFloat(
                initialValue = 0.45f,
                targetValue = 0.10f,
                animationSpec = infiniteRepeatable(
                    animation = tween(800, easing = FastOutSlowInEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "pulseAlpha"
            )

            val accentColor = when (engineState) {
                VoiceAlarmCanceler.VoiceEngineState.COMMAND_SPOTTED -> Color(0xFF10B981) // Emerald
                VoiceAlarmCanceler.VoiceEngineState.HEARING_SPEECH -> Color(0xFFF59E0B) // Amber
                VoiceAlarmCanceler.VoiceEngineState.CHATTING -> Color(0xFF38BDF8) // Sky Blue
                else -> Color(0xFF38BDF8) // Standby Cyan
            }

            // 2. Google Assistant Style Bottom Sheet Floating Card
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 12.dp)
                    .animateContentSize()
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) {
                        // Prevent click-through to backdrop
                    },
                shape = RoundedCornerShape(24.dp),
                color = Color(0xFF18181B),
                border = BorderStroke(1.2.dp, Color(0xFF27272A)),
                shadowElevation = 24.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp, vertical = 14.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Assistant Signature 4-Color Glowing Lightbar (Google AI style)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth(0.55f)
                            .height(4.dp)
                            .clip(RoundedCornerShape(2.dp)),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(4.dp)
                                .background(Color(0xFF4285F4), CircleShape) // Blue
                        )
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(4.dp)
                                .background(Color(0xFFEA4335), CircleShape) // Red
                        )
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(4.dp)
                                .background(Color(0xFFFBBC05), CircleShape) // Yellow
                        )
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(4.dp)
                                .background(Color(0xFF34A853), CircleShape) // Green
                        )
                    }

                    // Top Bar: Badge + Listening Pill + Close Button
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = accentColor.copy(alpha = 0.12f),
                            border = BorderStroke(1.dp, accentColor.copy(alpha = 0.4f))
                        ) {
                            Text(
                                text = "RAMS ASSISTANT",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = accentColor,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }

                        val isOnline = remember(isVisible) { voiceCanceler.assistantEngine.isOnline() }
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isOnline) Color(0xFF10B981).copy(alpha = 0.12f) else Color(0xFFF59E0B).copy(alpha = 0.12f),
                            border = BorderStroke(1.dp, if (isOnline) Color(0xFF10B981).copy(alpha = 0.4f) else Color(0xFFF59E0B).copy(alpha = 0.4f))
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .background(if (isOnline) Color(0xFF10B981) else Color(0xFFF59E0B), CircleShape)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = if (isOnline) "ONLINE AI" else "OFFLINE AI",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    color = if (isOnline) Color(0xFF10B981) else Color(0xFFF59E0B)
                                )
                            }
                        }

                        Text(
                            text = when (engineState) {
                                VoiceAlarmCanceler.VoiceEngineState.HEARING_SPEECH -> "HEARING..."
                                VoiceAlarmCanceler.VoiceEngineState.CHATTING -> "RESPONDING..."
                                VoiceAlarmCanceler.VoiceEngineState.COMMAND_SPOTTED -> "ABORT CONFIRMED"
                                else -> "LISTENING"
                            },
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFFA1A1AA)
                        )

                        IconButton(
                            onClick = { voiceCanceler.dismissBubble() },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Close",
                                tint = Color(0xFFA1A1AA),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    // Central Animated Mic Orb
                    Box(
                        modifier = Modifier.size(64.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        // Outer pulsating aura (only pulses when hearing speech to prevent jitter)
                        if (engineState == VoiceAlarmCanceler.VoiceEngineState.HEARING_SPEECH) {
                            Box(
                                modifier = Modifier
                                    .size(64.dp)
                                    .scale(pulseScale)
                                    .background(accentColor.copy(alpha = pulseAlpha), CircleShape)
                            )
                        }

                        // Core icon circle
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .background(
                                    Brush.radialGradient(
                                        listOf(accentColor.copy(alpha = 0.25f), Color(0xFF09090B))
                                    ),
                                    CircleShape
                                )
                                .clip(CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = when (engineState) {
                                    VoiceAlarmCanceler.VoiceEngineState.COMMAND_SPOTTED -> Icons.Default.CheckCircle
                                    VoiceAlarmCanceler.VoiceEngineState.CHATTING -> Icons.Default.GraphicEq
                                    else -> Icons.Default.Mic
                                },
                                contentDescription = "Voice State",
                                tint = accentColor,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }

                    // Main Prompt Message
                    Text(
                        text = promptMessage,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        color = Color.White,
                        textAlign = TextAlign.Center,
                        maxLines = 5,
                        overflow = TextOverflow.Ellipsis
                    )

                    // Sub-Status / Speech Transcript
                    Text(
                        text = "\"$liveTranscript\"",
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFF38BDF8),
                        textAlign = TextAlign.Center,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )

                    // Conversational exchange box (if user is chatting)
                    if (chatMessages.isNotEmpty()) {
                        val lastMsg = chatMessages.last()
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            color = Color(0xFF09090B),
                            border = BorderStroke(1.dp, Color(0xFF27272A))
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.Top
                            ) {
                                Text(
                                    text = if (lastMsg.sender == "USER") "YOU: " else "RAMS: ",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    color = if (lastMsg.sender == "USER") Color(0xFFF59E0B) else Color(0xFF10B981)
                                )
                                Text(
                                    text = lastMsg.text,
                                    fontSize = 10.sp,
                                    color = Color.White,
                                    maxLines = 5,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }

                    // One-Tap Abort Buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = {
                                voiceCanceler.injectSimulatedVoiceCommand("CANCEL ALARM")
                            },
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF27272A),
                                contentColor = Color(0xFFEF4444)
                            ),
                            border = BorderStroke(1.2.dp, Color(0xFFEF4444)),
                            contentPadding = PaddingValues(vertical = 10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = "CANCEL ALARM",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        Button(
                            onClick = {
                                voiceCanceler.injectSimulatedVoiceCommand("I AM SAFE")
                            },
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF27272A),
                                contentColor = Color(0xFF10B981)
                            ),
                            border = BorderStroke(1.2.dp, Color(0xFF10B981)),
                            contentPadding = PaddingValues(vertical = 10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = "I AM SAFE",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                }
            }
        }
    }
}
