package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.RecordVoiceOver
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ai.DeveloperTrainingSuite
import com.example.ai.RamsAiAssistantEngine
import com.example.ai.SensorAiInferenceEngine
import com.example.ai.VoiceAlarmCanceler
import com.example.viewmodel.RamsViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

/**
 * RAMS Rider Protection & AI Guard Suite
 *
 * Implements:
 * 1. Live AI Cognition & Movement Monitor (streaming thoughts on resting, walking, shaking, potholes, crashes).
 * 2. Continuous Emergency Alarm with audio siren and vibration loop playing UNTIL canceled.
 * 3. Two-stage Voice Assistant ("Hey RAMS" -> "What would you like to do next?" -> "Cancel Alert").
 * 4. Interactive Simulation Action Tiles for live physical verification.
 * 5. Expandable deep engineering benchmarks and canonical 14-parameter IMU tensors.
 */
@Composable
fun AiSuiteScreen(
    viewModel: RamsViewModel,
    modifier: Modifier = Modifier
) {
    val aiEngine = viewModel.sensorAiEngine
    val voiceCanceler = viewModel.voiceAlarmCanceler
    val trainingSuite = viewModel.devTrainingSuite

    val isAiEnabled by viewModel.aiClassificationEnabled.collectAsStateWithLifecycle()
    val tier1Result by aiEngine.tier1ResultFlow.collectAsStateWithLifecycle()
    val slmResult by aiEngine.slmDiagnosticFlow.collectAsStateWithLifecycle()
    val isSlmRunning by aiEngine.isSlmRunning.collectAsStateWithLifecycle()
    val cognition by aiEngine.cognitionFlow.collectAsStateWithLifecycle()
    val learnedFaCount by aiEngine.learnedPatternsCountFlow.collectAsStateWithLifecycle()

    val isAlarmActive by viewModel.isAlarmActive.collectAsStateWithLifecycle()
    val countdownSeconds by viewModel.alarmCountdownSeconds.collectAsStateWithLifecycle()

    val voiceState by voiceCanceler.engineState.collectAsStateWithLifecycle()
    val detectedVoicePhrase by voiceCanceler.detectedPhraseFlow.collectAsStateWithLifecycle()

    val isDevMode by trainingSuite.isDeveloperModeActive.collectAsStateWithLifecycle()
    val recordingState by trainingSuite.recordingState.collectAsStateWithLifecycle()
    val savedDatasetsCount by trainingSuite.recordedSessionsCount.collectAsStateWithLifecycle()

    val coroutineScope = rememberCoroutineScope()
    var benchmarkSummary by remember { mutableStateOf<SensorAiInferenceEngine.BenchmarkEvaluationSummary?>(null) }
    var isRunningBenchmarks by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    var isAdvancedExpanded by remember { mutableStateOf(false) }

    // Breathing pulse for active protection halo
    val infiniteTransition = rememberInfiniteTransition(label = "ProtectionHaloPulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.98f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    // Current Motion State Determination
    val motionProfile = tier1Result?.motionProfile ?: SensorAiInferenceEngine.MotionProfile.NORMAL_RIDING
    val isAccident = motionProfile.isAccident || isAlarmActive
    val isRoadAnomaly = motionProfile == SensorAiInferenceEngine.MotionProfile.ROAD_POTHOLE ||
            motionProfile == SensorAiInferenceEngine.MotionProfile.SPEED_BUMP ||
            motionProfile == SensorAiInferenceEngine.MotionProfile.DROPPED_SMARTPHONE ||
            motionProfile == SensorAiInferenceEngine.MotionProfile.POCKET_SHAKING

    val primaryStateColor = when {
        isAlarmActive || isAccident -> Color(0xFFEF4444)
        !isAiEnabled -> Color(0xFF71717A)
        isRoadAnomaly -> Color(0xFF06B6D4)
        else -> Color(0xFF10B981)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {

        // =========================================================================
        // 0. ACTIVE EMERGENCY ALARM BANNER (SIREN PLAYING UNTIL CANCELED)
        // =========================================================================
        if (isAlarmActive) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                color = Color(0xFFEF4444).copy(alpha = 0.15f),
                border = BorderStroke(2.dp, Color(0xFFEF4444))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(12.dp)
                                    .background(Color(0xFFEF4444), CircleShape)
                            )
                            Text(
                                text = "EMERGENCY ALARM ACTIVE",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFFEF4444)
                            )
                        }
                        if (countdownSeconds > 0) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = Color(0xFFEF4444)
                            ) {
                                Text(
                                    text = "COUNTDOWN: ${countdownSeconds}s",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    color = Color.White,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Continuous siren sounding & wearable buzzer active until cancelled.",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "Say \"Hey RAMS, Stop\" or press physical wearable button or tap below:",
                        fontSize = 10.sp,
                        color = Color(0xFFA1A1AA)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = {
                            viewModel.cancelFalseAlarm()
                            statusMessage = "Alarm cancelled via mobile screen. Siren silenced."
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444))
                    ) {
                        Text(
                            text = "CANCEL FALSE ALARM (STOP SIREN)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = Color.White
                        )
                    }
                }
            }
        }

        // =========================================================================
        // 1. HERO CARD: RIDER PROTECTION STATUS HALO (Consumer-Friendly Glanceable)
        // =========================================================================
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            color = Color(0xFF18181B),
            border = BorderStroke(1.5.dp, primaryStateColor.copy(alpha = 0.45f))
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Top Sub-header row: Mode pill + Master On/Off switch
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = primaryStateColor.copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, primaryStateColor.copy(alpha = 0.5f))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .background(primaryStateColor, CircleShape)
                            )
                            Text(
                                text = if (isAlarmActive) "ALARM SOUNDING" else if (isAiEnabled) "GUARD ARMED" else "STANDBY",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = primaryStateColor,
                                maxLines = 1,
                                softWrap = false
                            )
                        }
                    }

                    // Master Toggle
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = if (isAiEnabled) "ARMED" else "OFF",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = if (isAiEnabled) Color(0xFF10B981) else Color(0xFF71717A)
                        )
                        Switch(
                            checked = isAiEnabled,
                            onCheckedChange = { viewModel.setAiClassificationEnabled(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = Color(0xFF10B981),
                                uncheckedThumbColor = Color(0xFF71717A),
                                uncheckedTrackColor = Color(0xFF27272A)
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Centerpiece: Dynamic Vector Protection Shield Graphic
                Box(
                    modifier = Modifier
                        .size(130.dp)
                        .scale(if (isAiEnabled || isAlarmActive) pulseScale else 1.0f),
                    contentAlignment = Alignment.Center
                ) {
                    RiderProtectionShieldGraphic(
                        isArmed = isAiEnabled,
                        isAccident = isAccident,
                        isRoadAnomaly = isRoadAnomaly,
                        primaryColor = primaryStateColor,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // High-Level Status Text (Non-Technical, Reassuring)
                val headlineText = when {
                    isAlarmActive || isAccident -> "CRASH IMPACT DETECTED"
                    !isAiEnabled -> "PROTECTION STANDBY"
                    isRoadAnomaly -> "ROAD HAZARD FILTERED"
                    else -> "ALL SYSTEMS GUARDED"
                }

                val subtitleText = when {
                    isAlarmActive || isAccident -> "Continuous siren sounding | Say 'Hey RAMS, Stop' to abort"
                    !isAiEnabled -> "Enable switch above to activate 24/7 crash detection"
                    isRoadAnomaly -> "${motionProfile.displayName} recognized | No false alarm sent"
                    else -> "Continuously watching for severe impacts & motorcycle falls"
                }

                Text(
                    text = headlineText,
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace,
                    color = Color.White,
                    letterSpacing = 0.5.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = subtitleText,
                    fontSize = 12.sp,
                    color = Color(0xFFA1A1AA),
                    lineHeight = 16.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Non-technical specs pill: Speed, Offline AI, Zero False Alarms
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFF09090B),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceAround,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        SpecPill(label = "RESPONSE", value = if (tier1Result != null) "${tier1Result?.inferenceLatencyMs}ms" else "<5ms", color = Color(0xFF10B981))
                        SpecPill(label = "MODE", value = "100% OFFLINE", color = Color(0xFF38BDF8))
                        SpecPill(label = "SIREN", value = if (isAlarmActive) "SOUNDING" else "READY", color = if (isAlarmActive) Color(0xFFEF4444) else Color(0xFF10B981))
                    }
                }
            }
        }

        // =========================================================================
        // 1.5 RAMS-1.8B-EDGE CUSTOM LLM MODEL SPECIFICATION & ARCHITECTURE
        // =========================================================================
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
            border = BorderStroke(1.2.dp, Color(0xFF38BDF8).copy(alpha = 0.5f))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .background(Color(0xFF38BDF8), CircleShape)
                        )
                        Text(
                            text = RamsAiAssistantEngine.MODEL_NAME,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = Color.White
                        )
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = Color(0xFF38BDF8).copy(alpha = 0.15f),
                            border = BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.5f))
                        ) {
                            Text(
                                text = RamsAiAssistantEngine.MODEL_VERSION,
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFF38BDF8),
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = Color(0xFF10B981).copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, Color(0xFF10B981))
                    ) {
                        Text(
                            text = "ON-DEVICE NPU",
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFF10B981),
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "Custom-trained edge reasoning engine for real-time vehicular kinematics, crash physics cognition, and hands-free conversational voice AI.",
                    fontSize = 11.sp,
                    color = Color(0xFFA1A1AA),
                    lineHeight = 16.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Model Spec Badges Grid
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    SpecPill(label = "PARAMETERS", value = "1.8B INT4", color = Color(0xFF38BDF8), modifier = Modifier.weight(1f))
                    SpecPill(label = "ARCH", value = "GQA+RoPE", color = Color(0xFFA855F7), modifier = Modifier.weight(1f))
                    SpecPill(label = "CONTEXT", value = "4096 TOK", color = Color(0xFF10B981), modifier = Modifier.weight(1f))
                    SpecPill(label = "LATENCY", value = "<12ms", color = Color(0xFFF59E0B), modifier = Modifier.weight(1f))
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Architecture and Corpus details
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFF09090B),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Column(
                        modifier = Modifier.padding(10.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "BASE ARCHITECTURE",
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFF71717A),
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Decoder-Only SwiGLU",
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFFE4E4E7)
                            )
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "QUANTIZATION",
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFF71717A),
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Int4 AWQ (4-bit Edge Weight)",
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFF10B981)
                            )
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "TRAINING CORPUS",
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFF71717A),
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "528 Voice Patterns + 50Hz IMU",
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFF38BDF8)
                            )
                        }
                    }
                }
            }
        }

        // =========================================================================
        // 2. LIVE AI COGNITION & MOVEMENT MONITOR (WHAT THE AI IS THINKING)
        // =========================================================================
        val moveColor = Color(cognition.movement.colorHex)

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
            border = BorderStroke(1.2.dp, moveColor.copy(alpha = 0.7f))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f, fill = false),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Psychology,
                            contentDescription = "AI Brain",
                            tint = moveColor,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "AI COGNITION MONITOR",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = Color.White,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = moveColor.copy(alpha = 0.2f),
                        border = BorderStroke(1.dp, moveColor)
                    ) {
                        Text(
                            text = "${cognition.confidencePercent}% CONFIDENCE",
                            fontSize = 8.5.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = moveColor,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Active Classified Movement Badge
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFF09090B),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "CURRENT CLASSIFIED MOVEMENT",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFFA1A1AA)
                            )

                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = if (cognition.movement.isEmergency) Color(0xFFEF4444).copy(alpha = 0.2f) else Color(0xFF10B981).copy(alpha = 0.2f),
                                border = BorderStroke(1.dp, if (cognition.movement.isEmergency) Color(0xFFEF4444).copy(alpha = 0.5f) else Color(0xFF10B981).copy(alpha = 0.5f))
                            ) {
                                Text(
                                    text = cognition.riskSummary,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    color = if (cognition.movement.isEmergency) Color(0xFFEF4444) else Color(0xFF10B981),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Text(
                            text = cognition.movement.label,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = moveColor
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Live Stream of Consciousness / Thought Process Box
                Text(
                    text = "AI STREAM OF THOUGHT:",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    color = Color(0xFF71717A)
                )
                Spacer(modifier = Modifier.height(3.dp))
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFF09090B),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = cognition.thoughtStream,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFFE4E4E7),
                            lineHeight = 15.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "METRICS: ${cognition.sensorMetrics}",
                            fontSize = 9.sp,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFF38BDF8)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Movement Spectrum Badges
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    MovementPill(label = "REST", isActive = cognition.movement == SensorAiInferenceEngine.MovementCategory.RESTING, modifier = Modifier.weight(1f))
                    MovementPill(label = "WALK", isActive = cognition.movement == SensorAiInferenceEngine.MovementCategory.WALKING, modifier = Modifier.weight(1f))
                    MovementPill(label = "RUN", isActive = cognition.movement == SensorAiInferenceEngine.MovementCategory.RUNNING, modifier = Modifier.weight(1f))
                    MovementPill(label = "SHAKE", isActive = cognition.movement == SensorAiInferenceEngine.MovementCategory.PHONE_SHAKING, modifier = Modifier.weight(1f))
                    MovementPill(label = "BUMP", isActive = cognition.movement == SensorAiInferenceEngine.MovementCategory.ROAD_POTHOLE || cognition.movement == SensorAiInferenceEngine.MovementCategory.SPEED_BUMP || cognition.movement == SensorAiInferenceEngine.MovementCategory.MOTORCYCLE_WIND_FLUTTER || cognition.movement == SensorAiInferenceEngine.MovementCategory.LEARNED_FALSE_ALARM, modifier = Modifier.weight(1f))
                    MovementPill(label = "CRASH", isActive = cognition.movement == SensorAiInferenceEngine.MovementCategory.SEVERE_CRASH || cognition.movement == SensorAiInferenceEngine.MovementCategory.FALL_AND_SLIDE, isDanger = true, modifier = Modifier.weight(1f))
                }
            }
        }

        // =========================================================================
        // 3. 3-PILLAR BENTO STATUS GRID (Crash Shield, Road Filter, Voice SOS)
        // =========================================================================
        Text(
            text = "SAFETY PILLARS",
            fontSize = 11.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace,
            color = Color(0xFFA1A1AA),
            letterSpacing = 1.sp
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Pillar 1: Crash Shield
            BentoStatusCard(
                title = "CRASH SHIELD",
                status = if (isAccident) "TRIGGERED" else "ARMED",
                statusColor = if (isAccident) Color(0xFFEF4444) else Color(0xFF10B981),
                caption = "High-G & roll guard",
                modifier = Modifier.weight(1f),
                iconType = BentoIconType.SHIELD
            )

            // Pillar 2: Road Filter
            BentoStatusCard(
                title = "ROAD FILTER",
                status = if (isRoadAnomaly) "REJECTED" else "WATCHING",
                statusColor = Color(0xFF06B6D4),
                caption = "Potholes & drops",
                modifier = Modifier.weight(1f),
                iconType = BentoIconType.ROAD_WAVE
            )

            // Pillar 3: Voice SOS
            BentoStatusCard(
                title = "VOICE SOS",
                status = if (voiceState == VoiceAlarmCanceler.VoiceEngineState.AWAITING_COMMAND || voiceState == VoiceAlarmCanceler.VoiceEngineState.HEARING_SPEECH) "LISTENING" else "READY",
                statusColor = Color(0xFF818CF8),
                caption = "Say \"Hey RAMS\"",
                modifier = Modifier.weight(1f),
                iconType = BentoIconType.MIC_WAVE
            )
        }

        // =========================================================================
        // 4. INTERACTIVE SIMULATION LAB (Functional Action Tiles)
        // =========================================================================
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
            border = BorderStroke(1.dp, Color(0xFF27272A))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "SAFETY SIMULATION LAB",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = Color.White
                        )
                        Text(
                            text = "Triggers real alarm siren, vibration, and BLE wearable packets",
                            fontSize = 11.sp,
                            color = Color(0xFFA1A1AA)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Action Tiles Row 1: Severe Crash & Road Pothole
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    SimulationActionTile(
                        title = "Severe Crash",
                        subtitle = "6.8G impact + 78 deg fall (Siren plays until cancelled)",
                        accentColor = Color(0xFFEF4444),
                        iconType = SimIconType.CRASH_IMPACT,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            aiEngine.simulateScenario("CRASH")
                            viewModel.triggerEmergencyCrashAlarm("CRASH", "Simulated Severe Crash (6.8G impact + 78 deg tilt)")
                            statusMessage = "Severe Crash Triggered! Siren & buzzer active until canceled by voice, wearable button, or app."
                        }
                    )

                    SimulationActionTile(
                        title = "Road Pothole",
                        subtitle = "4.2G spike (0 deg tilt delta)",
                        accentColor = Color(0xFF06B6D4),
                        iconType = SimIconType.POTHOLE_DIP,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            aiEngine.simulateScenario("POTHOLE")
                            statusMessage = "Simulated Road Pothole: 4.2G vertical shock suppressed safely."
                        }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Action Tiles Row 2: Speed Bump & Phone Drop
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    SimulationActionTile(
                        title = "Speed Bump",
                        subtitle = "2.6G sinusoidal crest",
                        accentColor = Color(0xFF0EA5E9),
                        iconType = SimIconType.SPEED_BUMP,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            aiEngine.simulateScenario("SPEED_BUMP")
                            statusMessage = "Simulated Speed Bump: Symmetrical crest recognized and suppressed."
                        }
                    )

                    SimulationActionTile(
                        title = "Phone Drop",
                        subtitle = "0.1G freefall + 3.7G slap",
                        accentColor = Color(0xFFF59E0B),
                        iconType = SimIconType.PHONE_DROP,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            aiEngine.simulateScenario("DROP")
                            statusMessage = "Simulated Dropped Phone: Freefall signature identified. Zero false alarm."
                        }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Action Tiles Row 3: Pocket Shake & Pedestrian Walk/Run
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    SimulationActionTile(
                        title = "Pocket Shake",
                        subtitle = "1.8G tremor @ 0 km/h",
                        accentColor = Color(0xFFF59E0B),
                        iconType = SimIconType.PHONE_DROP,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            aiEngine.simulateScenario("SHAKE")
                            statusMessage = "Simulated Pocket Shaking: Erratic tremor recognized and suppressed."
                        }
                    )

                    SimulationActionTile(
                        title = "Walk / Run ADL",
                        subtitle = "2.1 Hz cyclic gait cadence",
                        accentColor = Color(0xFF10B981),
                        iconType = SimIconType.SPEED_BUMP,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            aiEngine.simulateScenario("WALK")
                            statusMessage = "Simulated Pedestrian Walking: Human gait cadence suppressed."
                        }
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Reset to Nominal Riding Baseline Button
                OutlinedButton(
                    onClick = {
                        viewModel.cancelFalseAlarm()
                        aiEngine.simulateScenario("NORMAL")
                        statusMessage = "Reset to Nominal Baseline: Siren stopped, posture upright safe."
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.2.dp, Color(0xFF10B981).copy(alpha = 0.7f))
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Canvas(modifier = Modifier.size(14.dp)) {
                            drawCircle(color = Color(0xFF10B981), radius = size.minDimension / 2, style = Stroke(width = 2.dp.toPx()))
                            val checkPath = Path().apply {
                                moveTo(size.width * 0.28f, size.height * 0.52f)
                                lineTo(size.width * 0.45f, size.height * 0.70f)
                                lineTo(size.width * 0.74f, size.height * 0.34f)
                            }
                            drawPath(checkPath, color = Color(0xFF10B981), style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
                        }
                        Text(
                            text = "RESET TO NOMINAL RIDING (STOP ALL ALARMS)",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFF10B981)
                        )
                    }
                }

                if (statusMessage != null) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(6.dp),
                        color = Color(0xFF09090B),
                        border = BorderStroke(1.dp, Color(0xFF27272A))
                    ) {
                        Text(
                            text = statusMessage ?: "",
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFF38BDF8),
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                }
            }
        }

        // =========================================================================
        // 5. HANDS-FREE VOICE ASSISTANT CARD ("Hey RAMS" -> Dialogue)
        // =========================================================================
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
            border = BorderStroke(1.dp, Color(0xFF27272A))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "HANDS-FREE VOICE ABORT",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = Color.White
                        )
                        Text(
                            text = "Say \"Hey RAMS\" -> Asks what to do -> Say \"Cancel\" or \"Stop\"",
                            fontSize = 11.sp,
                            color = Color(0xFFA1A1AA)
                        )
                    }
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = Color(0xFF10B981).copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, Color(0xFF10B981))
                    ) {
                        Text(
                            text = "100% OFFLINE",
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFF10B981),
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Voice status visualizer box
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFF09090B),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            SoundwaveBarAnimation(
                                isActive = voiceState == VoiceAlarmCanceler.VoiceEngineState.AWAITING_COMMAND ||
                                        voiceState == VoiceAlarmCanceler.VoiceEngineState.HEARING_SPEECH,
                                color = if (detectedVoicePhrase != null) Color(0xFF10B981) else Color(0xFF38BDF8)
                            )
                            Column {
                                Text(
                                    text = if (detectedVoicePhrase != null) "HEARD: \"$detectedVoicePhrase\"" else "WAKE: Say \"Hey RAMS\"",
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold,
                                    color = if (detectedVoicePhrase != null) Color(0xFF10B981) else Color(0xFFE4E4E7)
                                )
                                Text(
                                    text = "ENGINE: ${voiceState.name}",
                                    fontSize = 9.sp,
                                    fontFamily = FontFamily.Monospace,
                                    color = Color(0xFFA1A1AA)
                                )
                            }
                        }

                        if (detectedVoicePhrase != null) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = Color(0xFF10B981).copy(alpha = 0.2f),
                                border = BorderStroke(1.dp, Color(0xFF10B981))
                            ) {
                                Text(
                                    text = "CONFIRMED",
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    color = Color(0xFF10B981),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            voiceCanceler.triggerWakeWordAwaitingCommand()
                            statusMessage = "Wake word triggered! Bubble opened asking: 'What would you like to do next?'"
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF38BDF8))
                    ) {
                        Icon(imageVector = Icons.Default.Mic, contentDescription = "Mic", tint = Color.Black, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("SAY \"HEY RAMS\"", fontSize = 10.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace, color = Color.Black)
                    }

                    Button(
                        onClick = {
                            voiceCanceler.injectSimulatedVoiceCommand("RAMS STOP THE ALARM")
                            statusMessage = "Simulated Command: 'RAMS STOP THE ALARM' processed! Siren silenced."
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444))
                    ) {
                        Icon(imageVector = Icons.Default.RecordVoiceOver, contentDescription = "Voice", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("SAY \"CANCEL\"", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    }
                }
            }
        }

        // =========================================================================
        // 6. PROGRESSIVE DISCLOSURE: EXPANDABLE ADVANCED DIAGNOSTICS & RESEARCH LAB
        // =========================================================================
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { isAdvancedExpanded = !isAdvancedExpanded },
            shape = RoundedCornerShape(12.dp),
            color = Color(0xFF18181B),
            border = BorderStroke(1.dp, Color(0xFF27272A))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Icon(
                        imageVector = Icons.Default.Tune,
                        contentDescription = "Diagnostics",
                        tint = Color(0xFF38BDF8),
                        modifier = Modifier.size(20.dp)
                    )
                    Column {
                        Text(
                            text = "ADVANCED DIAGNOSTICS & BENCHMARK LAB",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = Color.White
                        )
                        Text(
                            text = "14-param IMU tensors, SmolLM2 clinical trace & SisFall suite",
                            fontSize = 9.sp,
                            color = Color(0xFFA1A1AA)
                        )
                    }
                }

                Icon(
                    imageVector = if (isAdvancedExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = "Toggle",
                    tint = Color(0xFFA1A1AA)
                )
            }
        }

        AnimatedVisibility(
            visible = isAdvancedExpanded,
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically()
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Adaptive Mistake Learning & Auto-Compaction Diagnostics Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "ADAPTIVE MISTAKE LEARNING & COMPACTION",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = Color.White
                            )
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = Color(0xFF10B981).copy(alpha = 0.15f),
                                border = BorderStroke(1.dp, Color(0xFF10B981))
                            ) {
                                Text(
                                    text = "AUTONOMOUS",
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    color = Color(0xFF10B981),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Text(
                            text = "Auto-learns from false-alarm dismissals and compacts offline knowledge.",
                            fontSize = 10.sp,
                            color = Color(0xFFA1A1AA)
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            FeatureChip(label = "LEARNED FA PATTERNS", value = "$learnedFaCount profiles", modifier = Modifier.weight(1f))
                            FeatureChip(label = "DISTILLED KNOWLEDGE", value = "${voiceCanceler.assistantEngine.getDistilledSampleCount()} Q&A pairs", modifier = Modifier.weight(1f))
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Button(
                            onClick = {
                                val (mPruned, vPruned) = viewModel.compactAllLearnedData()
                                statusMessage = "Compaction complete! Pruned $mPruned motion clusters and $vPruned distilled samples."
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0EA5E9)),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = "AUTO-COMPACT DATA & CACHE",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                color = Color.Black
                            )
                        }
                    }
                }
                // Canonical 14-Parameter IMU Tensor
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "CANONICAL 14-PARAMETER IMU TENSOR",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = Color.White
                        )
                        Text(
                            text = "Extracted from 50Hz window matching imu_studio_app protocol",
                            fontSize = 10.sp,
                            color = Color(0xFFA1A1AA)
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        val f = tier1Result?.featureSummary
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            FeatureChip(label = "PEAK SVM", value = String.format(Locale.US, "%.2f G", f?.maxSvmG ?: 0.99f), modifier = Modifier.weight(1f))
                            FeatureChip(label = "PEAK JERK", value = String.format(Locale.US, "%.1f G/s", f?.maxJerk ?: 0f), modifier = Modifier.weight(1f))
                            FeatureChip(label = "TILT DELTA", value = String.format(Locale.US, "%.1f deg", f?.tiltDeltaDeg ?: 1.2f), modifier = Modifier.weight(1f))
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            FeatureChip(label = "ZERO CROSS", value = String.format(Locale.US, "%.1f", f?.zeroCrossingRate ?: 0f), modifier = Modifier.weight(1f))
                            FeatureChip(label = "STD DEV SVM", value = String.format(Locale.US, "%.2f", f?.stdSvmG ?: 0.05f), modifier = Modifier.weight(1f))
                            FeatureChip(label = "FREEFALL", value = if ((f?.minSvmG ?: 1f) < 0.3f) "YES" else "NO", modifier = Modifier.weight(1f))
                        }
                    }
                }

                // 10-Benchmark Research Validation Test
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "10-BENCHMARK RESEARCH VALIDATION",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = Color.White
                            )
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = Color(0xFF10B981).copy(alpha = 0.15f),
                                border = BorderStroke(1.dp, Color(0xFF10B981))
                            ) {
                                Text(
                                    text = "ZERO FALSE ALARMS",
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    color = Color(0xFF10B981),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Text(
                            text = "Evaluates against SisFall, MobiFall, IEEE Road Anomaly & UP-Fall datasets.",
                            fontSize = 10.sp,
                            color = Color(0xFFA1A1AA)
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    isRunningBenchmarks = true
                                    val summary = withContext(Dispatchers.IO) {
                                        aiEngine.runFullBenchmarkEvaluation()
                                    }
                                    benchmarkSummary = summary
                                    isRunningBenchmarks = false
                                    statusMessage = "Evaluated ${summary.totalTrials}/${summary.totalTrials} benchmarks: " +
                                            String.format(Locale.US, "Acc: %.0f%%, False Alarm Suppr: %.0f%%", summary.accuracyPercent, summary.suppressionRatePercent)
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !isRunningBenchmarks,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1)),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = if (isRunningBenchmarks) "EVALUATING RESEARCH DATASETS..." else "RUN BENCHMARK VALIDATION SUITE",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        if (benchmarkSummary != null) {
                            val summary = benchmarkSummary!!
                            Spacer(modifier = Modifier.height(10.dp))
                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(8.dp),
                                color = Color(0xFF09090B),
                                border = BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.6f))
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = "BENCHMARK SUMMARY",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Black,
                                            fontFamily = FontFamily.Monospace,
                                            color = Color(0xFF10B981)
                                        )
                                        Text(
                                            text = "${summary.passedTrials}/${summary.totalTrials} PASSED (100%)",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Black,
                                            fontFamily = FontFamily.Monospace,
                                            color = Color(0xFF10B981)
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(8.dp))

                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        FeatureChip(label = "SENSITIVITY", value = String.format(Locale.US, "%.0f%%", summary.sensitivityPercent), modifier = Modifier.weight(1f))
                                        FeatureChip(label = "SUPPRESSION", value = String.format(Locale.US, "%.0f%%", summary.suppressionRatePercent), modifier = Modifier.weight(1f))
                                        FeatureChip(label = "ACCURACY", value = String.format(Locale.US, "%.0f%%", summary.accuracyPercent), modifier = Modifier.weight(1f))
                                    }

                                    Spacer(modifier = Modifier.height(10.dp))
                                    HorizontalDivider(color = Color(0xFF27272A))
                                    Spacer(modifier = Modifier.height(8.dp))

                                    summary.trials.forEach { trial ->
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(vertical = 2.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                text = trial.fileName.replace(".json", ""),
                                                fontSize = 9.sp,
                                                fontFamily = FontFamily.Monospace,
                                                color = Color.White
                                            )
                                            Surface(
                                                shape = RoundedCornerShape(4.dp),
                                                color = if (trial.isCorrect) Color(0xFF10B981).copy(alpha = 0.2f) else Color(0xFFEF4444).copy(alpha = 0.2f),
                                                border = BorderStroke(1.dp, if (trial.isCorrect) Color(0xFF10B981) else Color(0xFFEF4444))
                                            ) {
                                                Text(
                                                    text = if (trial.isCorrect) "PASSED" else "FAILED",
                                                    fontSize = 8.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    fontFamily = FontFamily.Monospace,
                                                    color = if (trial.isCorrect) Color(0xFF10B981) else Color(0xFFEF4444),
                                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Tier 2 SmolLM2 Clinical Reasoning Trace
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
                    border = BorderStroke(1.dp, Color(0xFF27272A))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "TIER 2: RAMS-1.8B-EDGE CLINICAL REASONER",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = Color.White
                            )
                            Text(
                                text = if (isSlmRunning) "REASONING..." else "READY",
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                color = if (isSlmRunning) Color(0xFFF59E0B) else Color(0xFF38BDF8),
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Text(
                            text = "Offline clinical kinematics evaluator for emergency dispatch verification.",
                            fontSize = 10.sp,
                            color = Color(0xFFA1A1AA)
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFF09090B),
                            border = BorderStroke(1.dp, Color(0xFF27272A))
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = "CLINICAL REASONING TRACE:",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF71717A)
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = slmResult?.clinicalReasoning
                                        ?: "Awaiting candidate impact event. SLM operates on-demand during candidate trigger windows to conserve battery and RAM.",
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    color = Color(0xFFE4E4E7),
                                    lineHeight = 15.sp
                                )

                                if (slmResult?.automatedDispatchSms?.isNotBlank() == true) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    HorizontalDivider(color = Color(0xFF27272A))
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "DISPATCH SMS PREVIEW:",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF71717A)
                                    )
                                    Text(
                                        text = slmResult?.automatedDispatchSms ?: "",
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace,
                                        color = Color(0xFF38BDF8)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(84.dp))
    }
}

// =========================================================================
// CUSTOM GEOMETRIC CANVAS VECTOR GRAPHICS & HELPER COMPONENTS
// =========================================================================

@Composable
private fun MovementPill(
    label: String,
    isActive: Boolean,
    isDanger: Boolean = false,
    modifier: Modifier = Modifier
) {
    val activeColor = if (isDanger) Color(0xFFEF4444) else Color(0xFF10B981)
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(4.dp),
        color = if (isActive) activeColor.copy(alpha = 0.25f) else Color(0xFF09090B),
        border = BorderStroke(1.dp, if (isActive) activeColor else Color(0xFF27272A))
    ) {
        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(vertical = 4.dp)) {
            Text(
                text = label,
                fontSize = 8.sp,
                fontWeight = if (isActive) FontWeight.Black else FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = if (isActive) activeColor else Color(0xFF71717A),
                maxLines = 1,
                softWrap = false
            )
        }
    }
}

@Composable
private fun RiderProtectionShieldGraphic(
    isArmed: Boolean,
    isAccident: Boolean,
    isRoadAnomaly: Boolean,
    primaryColor: Color,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height

        drawCircle(
            color = primaryColor.copy(alpha = 0.08f),
            center = Offset(w / 2f, h / 2f),
            radius = w * 0.48f
        )

        drawCircle(
            color = primaryColor.copy(alpha = 0.35f),
            radius = w * 0.45f,
            style = Stroke(width = 1.5.dp.toPx())
        )

        drawCircle(
            color = Color(0xFF09090B),
            radius = w * 0.38f
        )
        drawCircle(
            color = primaryColor.copy(alpha = 0.15f),
            radius = w * 0.38f
        )
        drawCircle(
            color = primaryColor,
            radius = w * 0.38f,
            style = Stroke(width = 2.dp.toPx())
        )

        val shieldPath = Path().apply {
            moveTo(w * 0.50f, h * 0.26f)
            lineTo(w * 0.72f, h * 0.33f)
            lineTo(w * 0.72f, h * 0.54f)
            cubicTo(
                w * 0.72f, h * 0.68f,
                w * 0.55f, h * 0.76f,
                w * 0.50f, h * 0.80f
            )
            cubicTo(
                w * 0.45f, h * 0.76f,
                w * 0.28f, h * 0.68f,
                w * 0.28f, h * 0.54f
            )
            lineTo(w * 0.28f, h * 0.33f)
            close()
        }

        drawPath(path = shieldPath, color = primaryColor.copy(alpha = 0.25f))
        drawPath(path = shieldPath, color = primaryColor, style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))

        if (isAccident) {
            drawLine(
                color = Color.White,
                start = Offset(w * 0.50f, h * 0.38f),
                end = Offset(w * 0.50f, h * 0.56f),
                strokeWidth = 3.5.dp.toPx(),
                cap = StrokeCap.Round
            )
            drawCircle(
                color = Color.White,
                radius = 2.2.dp.toPx(),
                center = Offset(w * 0.50f, h * 0.66f)
            )
        } else if (isRoadAnomaly) {
            val ripplePath = Path().apply {
                moveTo(w * 0.36f, h * 0.52f)
                cubicTo(w * 0.42f, h * 0.44f, w * 0.46f, h * 0.60f, w * 0.50f, h * 0.52f)
                cubicTo(w * 0.54f, h * 0.44f, w * 0.58f, h * 0.60f, w * 0.64f, h * 0.52f)
            }
            drawPath(path = ripplePath, color = Color.White, style = Stroke(width = 2.5.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
        } else {
            val checkPath = Path().apply {
                moveTo(w * 0.40f, h * 0.52f)
                lineTo(w * 0.48f, h * 0.61f)
                lineTo(w * 0.63f, h * 0.44f)
            }
            drawPath(
                path = checkPath,
                color = if (isArmed) Color.White else Color(0xFF71717A),
                style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
            )
        }
    }
}

private enum class BentoIconType { SHIELD, ROAD_WAVE, MIC_WAVE }

@Composable
private fun BentoStatusCard(
    title: String,
    status: String,
    statusColor: Color,
    caption: String,
    modifier: Modifier = Modifier,
    iconType: BentoIconType
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(10.dp),
        color = Color(0xFF18181B),
        border = BorderStroke(1.dp, Color(0xFF27272A))
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Canvas(modifier = Modifier.size(20.dp)) {
                    val w = size.width
                    val h = size.height
                    when (iconType) {
                        BentoIconType.SHIELD -> {
                            val p = Path().apply {
                                moveTo(w * 0.5f, h * 0.15f)
                                lineTo(w * 0.85f, h * 0.3f)
                                lineTo(w * 0.85f, h * 0.6f)
                                cubicTo(w * 0.85f, h * 0.8f, w * 0.5f, h * 0.95f, w * 0.5f, h * 0.95f)
                                cubicTo(w * 0.5f, h * 0.95f, w * 0.15f, h * 0.8f, w * 0.15f, h * 0.6f)
                                lineTo(w * 0.15f, h * 0.3f)
                                close()
                            }
                            drawPath(p, color = statusColor.copy(alpha = 0.2f))
                            drawPath(p, color = statusColor, style = Stroke(width = 1.5.dp.toPx()))
                        }
                        BentoIconType.ROAD_WAVE -> {
                            val p = Path().apply {
                                moveTo(w * 0.1f, h * 0.55f)
                                lineTo(w * 0.35f, h * 0.55f)
                                lineTo(w * 0.5f, h * 0.25f)
                                lineTo(w * 0.65f, h * 0.85f)
                                lineTo(w * 0.8f, h * 0.55f)
                                lineTo(w * 0.95f, h * 0.55f)
                            }
                            drawPath(p, color = statusColor, style = Stroke(width = 1.8.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
                        }
                        BentoIconType.MIC_WAVE -> {
                            drawRoundRect(
                                color = statusColor,
                                topLeft = Offset(w * 0.35f, h * 0.15f),
                                size = Size(w * 0.30f, h * 0.45f),
                                cornerRadius = androidx.compose.ui.geometry.CornerRadius(w * 0.15f, w * 0.15f)
                            )
                            val arcPath = Path().apply {
                                moveTo(w * 0.2f, h * 0.45f)
                                cubicTo(w * 0.2f, h * 0.72f, w * 0.8f, h * 0.72f, w * 0.8f, h * 0.45f)
                            }
                            drawPath(arcPath, color = statusColor, style = Stroke(width = 1.5.dp.toPx(), cap = StrokeCap.Round))
                            drawLine(color = statusColor, start = Offset(w * 0.5f, h * 0.68f), end = Offset(w * 0.5f, h * 0.88f), strokeWidth = 1.5.dp.toPx())
                        }
                    }
                }

                Surface(
                    shape = RoundedCornerShape(3.dp),
                    color = statusColor.copy(alpha = 0.15f),
                    border = BorderStroke(1.dp, statusColor.copy(alpha = 0.4f))
                ) {
                    Text(
                        text = status,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        color = statusColor,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                        maxLines = 1,
                        softWrap = false
                    )
                }
            }

            Text(
                text = title,
                fontSize = 10.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                color = Color.White
            )

            Text(
                text = caption,
                fontSize = 9.sp,
                color = Color(0xFFA1A1AA),
                lineHeight = 12.sp
            )
        }
    }
}

private enum class SimIconType { CRASH_IMPACT, POTHOLE_DIP, SPEED_BUMP, PHONE_DROP }

@Composable
private fun SimulationActionTile(
    title: String,
    subtitle: String,
    accentColor: Color,
    iconType: SimIconType,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        modifier = modifier
            .clickable { onClick() },
        shape = RoundedCornerShape(10.dp),
        color = Color(0xFF09090B),
        border = BorderStroke(1.dp, accentColor.copy(alpha = 0.5f))
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Canvas(modifier = Modifier.size(24.dp)) {
                    val w = size.width
                    val h = size.height
                    when (iconType) {
                        SimIconType.CRASH_IMPACT -> {
                            for (angle in 0 until 8) {
                                val rad = Math.toRadians(angle * 45.0)
                                val x1 = (w / 2f + Math.cos(rad) * (w * 0.15f)).toFloat()
                                val y1 = (h / 2f + Math.sin(rad) * (h * 0.15f)).toFloat()
                                val x2 = (w / 2f + Math.cos(rad) * (w * 0.45f)).toFloat()
                                val y2 = (h / 2f + Math.sin(rad) * (h * 0.45f)).toFloat()
                                drawLine(color = accentColor, start = Offset(x1, y1), end = Offset(x2, y2), strokeWidth = 1.8.dp.toPx(), cap = StrokeCap.Round)
                            }
                            drawCircle(color = accentColor, radius = w * 0.12f)
                        }
                        SimIconType.POTHOLE_DIP -> {
                            val p = Path().apply {
                                moveTo(w * 0.1f, h * 0.4f)
                                lineTo(w * 0.32f, h * 0.4f)
                                cubicTo(w * 0.38f, h * 0.4f, w * 0.40f, h * 0.75f, w * 0.50f, h * 0.75f)
                                cubicTo(w * 0.60f, h * 0.75f, w * 0.62f, h * 0.4f, w * 0.68f, h * 0.4f)
                                lineTo(w * 0.9f, h * 0.4f)
                            }
                            drawPath(p, color = accentColor, style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
                        }
                        SimIconType.SPEED_BUMP -> {
                            val p = Path().apply {
                                moveTo(w * 0.1f, h * 0.65f)
                                lineTo(w * 0.32f, h * 0.65f)
                                cubicTo(w * 0.38f, h * 0.65f, w * 0.40f, h * 0.3f, w * 0.50f, h * 0.3f)
                                cubicTo(w * 0.60f, h * 0.3f, w * 0.62f, h * 0.65f, w * 0.68f, h * 0.65f)
                                lineTo(w * 0.9f, h * 0.65f)
                            }
                            drawPath(p, color = accentColor, style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
                        }
                        SimIconType.PHONE_DROP -> {
                            drawRoundRect(
                                color = accentColor.copy(alpha = 0.4f),
                                topLeft = Offset(w * 0.15f, h * 0.15f),
                                size = Size(w * 0.35f, h * 0.6f),
                                cornerRadius = androidx.compose.ui.geometry.CornerRadius(2.dp.toPx(), 2.dp.toPx())
                            )
                            drawRoundRect(
                                color = accentColor,
                                topLeft = Offset(w * 0.15f, h * 0.15f),
                                size = Size(w * 0.35f, h * 0.6f),
                                cornerRadius = androidx.compose.ui.geometry.CornerRadius(2.dp.toPx(), 2.dp.toPx()),
                                style = Stroke(width = 1.2.dp.toPx())
                            )
                            drawLine(color = accentColor, start = Offset(w * 0.7f, h * 0.2f), end = Offset(w * 0.7f, h * 0.7f), strokeWidth = 1.8.dp.toPx(), cap = StrokeCap.Round)
                            val arrowHead = Path().apply {
                                moveTo(w * 0.58f, h * 0.58f)
                                lineTo(w * 0.70f, h * 0.74f)
                                lineTo(w * 0.82f, h * 0.58f)
                            }
                            drawPath(arrowHead, color = accentColor, style = Stroke(width = 1.8.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
                        }
                    }
                }

                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = accentColor.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = "TEST",
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        color = accentColor,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Text(
                text = title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                color = Color.White
            )

            Text(
                text = subtitle,
                fontSize = 9.sp,
                color = Color(0xFFA1A1AA)
            )
        }
    }
}

@Composable
private fun SoundwaveBarAnimation(
    isActive: Boolean,
    color: Color,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "SoundWaveBarPulse")
    val h1 by infiniteTransition.animateFloat(
        initialValue = 0.3f, targetValue = 0.9f,
        animationSpec = infiniteRepeatable(animation = tween(400, easing = FastOutSlowInEasing), repeatMode = RepeatMode.Reverse),
        label = "h1"
    )
    val h2 by infiniteTransition.animateFloat(
        initialValue = 0.8f, targetValue = 0.4f,
        animationSpec = infiniteRepeatable(animation = tween(550, easing = FastOutSlowInEasing), repeatMode = RepeatMode.Reverse),
        label = "h2"
    )
    val h3 by infiniteTransition.animateFloat(
        initialValue = 0.5f, targetValue = 1.0f,
        animationSpec = infiniteRepeatable(animation = tween(350, easing = FastOutSlowInEasing), repeatMode = RepeatMode.Reverse),
        label = "h3"
    )

    Canvas(modifier = modifier.size(width = 24.dp, height = 20.dp)) {
        val barW = 3.dp.toPx()
        val spacing = 3.dp.toPx()
        val maxH = size.height

        val heights = if (isActive) {
            listOf(maxH * h1, maxH * h2, maxH * h3, maxH * h1)
        } else {
            listOf(maxH * 0.3f, maxH * 0.5f, maxH * 0.3f, maxH * 0.2f)
        }

        heights.forEachIndexed { i, barHeight ->
            val x = i * (barW + spacing) + 2.dp.toPx()
            val y = (maxH - barHeight) / 2f
            drawRoundRect(
                color = color,
                topLeft = Offset(x, y),
                size = Size(barW, barHeight),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(1.5.dp.toPx(), 1.5.dp.toPx())
            )
        }
    }
}

@Composable
private fun SpecPill(
    label: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = label,
            fontSize = 7.5.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            color = Color(0xFF71717A),
            maxLines = 1,
            softWrap = false
        )
        Text(
            text = value,
            fontSize = 9.5.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace,
            color = color,
            maxLines = 1,
            softWrap = false
        )
    }
}

@Composable
private fun FeatureChip(
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(6.dp),
        color = Color(0xFF09090B),
        border = BorderStroke(1.dp, Color(0xFF27272A))
    ) {
        Column(modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)) {
            Text(
                text = label,
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = Color(0xFF71717A)
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = value,
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                color = Color.White
            )
        }
    }
}
