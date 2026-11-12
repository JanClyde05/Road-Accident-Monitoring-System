with open('MEMORY_MAP.md', 'r', encoding='utf-8') as f:
    content = f.read()

anchor = "15. **Motorcycle Wind Flutter Anti-False-Alarm Engine"
idx = content.find(anchor)
if idx == -1:
    print("ERROR: Anchor 15 not found")
    exit(1)

section_16 = """
16. **Adaptive Motion Mistake Learning, Deterministic Arithmetic Evaluator & Autonomous Knowledge Distillation Compaction**:
    - **Adaptive Motion Mistake Learning Engine (`SensorAiInferenceEngine.kt`, `RamsViewModel.kt`)**: Implemented a self-healing kinematic template system that captures raw 14-parameter IMU tensors when an alarm is dismissed by the rider via mobile UI, hands-free voice abort, or wearable physical button (`learnFalseAlarmPattern()`). Persists learned waveforms to `context.filesDir/learned_motion_patterns.json` and appends full telemetry to `learned_false_alarms_stream.jsonl` for offline retraining. Subsequent evaluation windows (`findMatchingLearnedPattern()`) compare incoming feature vectors against learned templates (SVM tolerance `dG <= 0.65`, tilt tolerance `dTilt <= 14°`, angular velocity tolerance `dGyro <= 35 deg/s`).
    - **Catastrophic Impact Safety Invariant (6.0G Hard Barrier)**: Enforced a strict non-negotiable safety invariant across both template learning and runtime suppression: if `features.maxSvmG >= 6.0f`, template registration is rejected and suppression matching returns `null`. High-energy vehicular crash collisions are mathematically prohibited from being suppressed as false alarms regardless of rider history.
    - **Deterministic Edge Arithmetic Engine (`RamsAiAssistantEngine.kt`)**: Added on-device mathematical expression evaluator (`evaluateBasicMathExpression()`) supporting arithmetic operators (`+`, `-`, `*`, `/`, `%`), spoken English number words (`zero` to `twenty`), and Tagalog words (`isa` to `sampu`). Resolved the single-digit token filtering bug in `normalizeQueryKey()` by converting math symbols into spoken words prior to regex sanitization and preserving numeric characters (`(token.length > 1 || token.all { it.isDigit() })`).
    - **Dual-Path Online Distillation & Conversation Logging (`RamsAiAssistantEngine.kt`)**: Online Gemini reasoning queries and answers are continuously logged to `rams_conversations.jsonl` and mirrored to both `distilledKnowledgeCache` (JSONL) and `dynamicLearnedPatterns` (JSON) to guarantee offline recall across all conversational modes.
    - **Autonomous Multi-Tier Storage Compaction (`SensorAiInferenceEngine.kt`, `RamsAiAssistantEngine.kt`, `RamsAppActionHandler.kt`, `AiSuiteScreen.kt`)**: Autonomous compaction pipeline clusters near-duplicate false-alarm waveforms (merging occurrences and capping at 40 profiles), deduplicates distilled knowledge entries by normalized query key (retaining the richest and newest content, capping at 400 entries), and truncates conversation histories beyond 200 turns using atomic temporary file renames. Triggerable via voice command ("compact data", "auto compact", "optimize storage"), UI button in Advanced Diagnostics, or automatically every 25 online queries.
"""

new_content = content + section_16
with open('MEMORY_MAP.md', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(new_content)
print("SUCCESS: Appended Section 16 to MEMORY_MAP.md")

