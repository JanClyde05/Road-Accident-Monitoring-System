import os

path = r"d:\Antigravity\Projects\Danger Monitoring System V2\apps\android_app\app\src\main\java\com\example\ui\screens\AiSuiteScreen.kt"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Collect learnedFaCount state
old_cognition = """    val cognition by aiEngine.cognitionFlow.collectAsStateWithLifecycle()"""
new_cognition = """    val cognition by aiEngine.cognitionFlow.collectAsStateWithLifecycle()
    val learnedFaCount by aiEngine.learnedPatternsCountFlow.collectAsStateWithLifecycle()"""

assert old_cognition in content, "old_cognition not found"
content = content.replace(old_cognition, new_cognition)

# 2. Update MovementPill for BUMP
old_bump = """MovementPill(label = "BUMP", isActive = cognition.movement == SensorAiInferenceEngine.MovementCategory.ROAD_POTHOLE || cognition.movement == SensorAiInferenceEngine.MovementCategory.SPEED_BUMP || cognition.movement == SensorAiInferenceEngine.MovementCategory.MOTORCYCLE_WIND_FLUTTER, modifier = Modifier.weight(1f))"""
new_bump = """MovementPill(label = "BUMP", isActive = cognition.movement == SensorAiInferenceEngine.MovementCategory.ROAD_POTHOLE || cognition.movement == SensorAiInferenceEngine.MovementCategory.SPEED_BUMP || cognition.movement == SensorAiInferenceEngine.MovementCategory.MOTORCYCLE_WIND_FLUTTER || cognition.movement == SensorAiInferenceEngine.MovementCategory.LEARNED_FALSE_ALARM, modifier = Modifier.weight(1f))"""

assert old_bump in content, "old_bump not found"
content = content.replace(old_bump, new_bump)

# 3. Add the Adaptive Mistake Learning & Auto-Compaction Diagnostics Card
anchor_advanced = """        AnimatedVisibility(
            visible = isAdvancedExpanded,
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically()
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {"""

new_card_code = """        AnimatedVisibility(
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
                }"""

assert anchor_advanced in content, "anchor_advanced not found"
content = content.replace(anchor_advanced, new_card_code)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated AiSuiteScreen.kt")

