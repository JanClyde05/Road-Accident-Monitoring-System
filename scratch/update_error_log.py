with open('docs/MD Files/RAMS_ERROR_LOG_AND_FIXES.md', 'r', encoding='utf-8') as f:
    content = f.read()

anchor = "### Feature 15:"
idx = content.find(anchor)
if idx == -1:
    print("ERROR: Anchor not found")
    exit(1)

# Keep everything before Feature 15
before_f15 = content[:idx]

f15_and_new = """### Feature 15: Deep Kinematic Differentiation Engine for Motorcycle High-Speed Wind Flutter & Full 121-Trial Benchmark Suite
- **Subsystem**: Sensor AI Inference & Clinical Validation (`SensorAiInferenceEngine.kt`, `AiSuiteScreen.kt`, `motion_benchmarks/`)
- **Description**: Mathematical kinematic differentiator that distinguishes high-speed jacket flutter, pothole traversal, speed bumps, smartphone drops, and pedestrian activity from true vehicular collision and loss of traction, backed by a comprehensive 121-trial research dataset.
- **Key Components**:
  1. **Canonical Kinematic Rules**: Differentiates 10 motion profiles using 14-parameter IMU tensors, tilt delta, jerk, and pre-event velocity, achieving 100.0% accuracy (121 passed, 0 failed) across the entire benchmark suite.
  2. **Motorcycle Wind Flutter Benchmark Datasets**: 11 new benchmark files (`benchmark_motorcycle_wind_flutter.json` through `_10.json`) capturing realistic 45-59 km/h aerodynamic oscillations (2.8G to 4.5G flutter, 8-15° upright tilt, 20 Hz zero-crossing rate).
  3. **Full Benchmark Runner**: Upgraded `runFullBenchmarkEvaluation()` to dynamically discover and validate all 121 benchmark trials in `motion_benchmarks/`, reporting overall accuracy and false alarm suppression rates directly in the AI Guard UI.

---

### Bug 29: Single-Digit Token Purging in Offline Distillation Lookup & Math Stripping
- **Subsystem**: Conversational AI Engine & Knowledge Distillation (`RamsAiAssistantEngine.kt`)
- **Severity**: HIGH (Offline Voice Intelligence Recall Failure)
- **Symptoms**: When running offline, asking basic arithmetic queries such as *"what is 1 + 1"* or *"1+1"* resulted in RAMS responding with *"I'm still learning that topic and don't have an exact answer yet"*, but switching to online mode allowed Gemini to answer immediately.
- **Root Cause**:
  1. In `normalizeQueryKey()`, the token filter was defined as `.filter { it.length > 1 && it !in FILLER_WORDS }`. This purged all single-character tokens, completely destroying single-digit numbers like "1", "2", "3", etc.
  2. The input sanitization regex `replaceAll("[^a-z0-9\\\\s]", " ")` stripped mathematical symbols (`+`, `-`, `*`, `/`, `=`) before tokenization, transforming `"1+1"` into `"1 1"`, which the length filter then dropped entirely into an empty string key `""`.
  3. Offline RAMS lacked a deterministic arithmetic evaluator to resolve mathematical questions without requiring pre-cached synthetic Q&A pairs.
- **Files Modified**: `apps/android_app/app/src/main/java/com/example/ai/RamsAiAssistantEngine.kt`
- **Resolution**:
  1. Updated `normalizeQueryKey()` to substitute mathematical symbols with their natural language spoken words (`+` -> `plus`, `-` -> `minus`, `*` -> `times`, `/` -> `divided by`) prior to regex stripping.
  2. Modified token retention filter: `.filter { token.isNotBlank() && (token.length > 1 || token.all { it.isDigit() }) && token !in FILLER_WORDS }`, preserving single-digit numeric tokens.
  3. Added `evaluateBasicMathExpression(query: String): String?` supporting arithmetic operators (`+`, `-`, `*`, `/`, `%`), spoken English number words (`zero` through `twenty`), and Tagalog number words (`isa` through `sampu`), returning exact answers (e.g., `"1 plus 1 is 2."`) in Step 5C before cache lookup.
- **Prevention Directive**: Never filter out single-character tokens without explicitly preserving numeric digits. Replace mathematical and scientific operators with their phonetic spoken words before applying punctuation removal regexes.

---

### Feature 16: Adaptive Motion Mistake Learning, Deterministic Arithmetic Evaluator & Autonomous Knowledge Distillation Compaction
- **Subsystem**: Sensor AI Inference, Conversational AI & Storage Lifecycle (`SensorAiInferenceEngine.kt`, `RamsAiAssistantEngine.kt`, `RamsAppActionHandler.kt`, `RamsViewModel.kt`, `AiSuiteScreen.kt`)
- **Description**: Self-healing closed-loop intelligence system that autonomously captures IMU waveforms upon false-alarm dismissal, registers personalized suppression templates, performs deterministic on-device arithmetic, and compacts learned motion waveforms and conversational memory.
- **Key Components**:
  1. **Adaptive False Alarm Pattern Learning (`SensorAiInferenceEngine.kt`)**: When a rider dismisses an alarm via the mobile app, voice abort ("cancel alarm", "stop", "I am safe"), or wearable physical button, `learnFalseAlarmPattern()` captures the 14-parameter IMU tensor and registers a `LearnedMotionPattern`. In subsequent evaluation windows, `findMatchingLearnedPattern()` suppresses matching vibrations (`dG <= 0.65`, `dTilt <= 14°`, `dGyro <= 35 deg/s`).
  2. **Catastrophic Impact Safety Invariant**: True vehicular crashes (`maxSvmG >= 6.0G`) are permanently barred from being learned or suppressed (`learnFalseAlarmPattern` returns null and `findMatchingLearnedPattern` returns null if `f.maxSvmG >= 6.0f`), guaranteeing life-safety invariants are never bypassed.
  3. **Dual-Path Caching for Online Intelligence**: All online Gemini answers are automatically logged to `rams_conversations.jsonl` and persisted to both `distilledKnowledgeCache` (JSONL) and `dynamicLearnedPatterns` (JSON) for immediate offline recall.
  4. **Autonomous Motion & Knowledge Compaction**: Clusters near-duplicate motion profiles (incrementing occurrence counters and capping at 40), deduplicates distilled knowledge entries by normalized key (capping at 400), and prunes conversations beyond 200 turns using atomic temporary file renames. Triggered via voice command ("compact data", "auto compact", "optimize storage"), UI button in Advanced Diagnostics, or automatically every 25 online query learning cycles.
  5. **Dynamic UI Diagnostics Integration (`AiSuiteScreen.kt`)**: Added live `ADAPTIVE MISTAKE LEARNING & COMPACTION` card displaying real-time counts of learned false alarm profiles and distilled knowledge Q&A pairs with an interactive `AUTO-COMPACT DATA & CACHE` action button.

## 3. Master Prevention Guidelines

| Category | Golden Rule |
| :--- | :--- |
| **Speech Lifecycle** | Never destroy SpeechRecognizer in tight loops; use `cancel()` and manage single-instance state. |
| **Acoustic Noise** | Set speech silence timeouts to ≥2500ms for vehicular safety applications. |
| **Locale Handling** | Use regional language tags (`en-PH`, `fil-PH`) to support Taglish dialect switching. |
| **Intent Safety** | Emergency cancel and regulatory consumer-defense intents MUST precede general wayfinding. |
| **UI Scrims** | Overlays must never intercept touches outside their bounded cards. |
| **Hardware Layout**| Never route PCB traces before verifying physical pin 1 on transceiver footprints. |
| **Audio-Mic Sequencing** | UI audio feedback (tones, chimes) must complete before speech recognition `startListening()` is invoked. |
| **Voice Pipeline Filtering** | In two-stage wake-then-command pipelines, always filter the wake word from command-stage input. |
| **AI Fallback Hygiene** | Fallback responses must never contain state-dependent nag messages or unsolicited hardware warnings. |
| **Background Coroutines** | Idle background loops must throttle to >= 500ms when UI is not visible. |
| **Location Polling** | GPS intervals below 1s require explicit justification; 1.5s is adequate for vehicle safety apps. |
| **BLE Reconnect** | Always implement exponential backoff with hard attempt ceiling; enter passive idle after exhaustion. |
| **Acoustic Siren Ducking** | Pre-alarm sirens must duck to <= 0.20f with >= 1500ms silent gaps to prevent mic clipping during voice cancellation. |
| **Wind Flutter Protection** | Upright vehicular cruising (speed >= 25 km/h, roll < 40°) requires >= 6.0G shock before triggering crash alarm. |
| **Online API Latency** | Cloud APIs must enforce <= 1500ms timeouts and fall back immediately to offline edge cognition without cascading. |
| **Token Filter Preservation**| Token sanitization must never discard single-character numeric digits; replace math symbols with spoken words prior to regex stripping. |
| **Adaptive Learning Invariant**| Motion mistake learning must strictly prohibit suppressing shocks >= 6.0G to ensure catastrophic collisions are never ignored. |
| **Storage Compaction Atomicity**| Cache and conversation compaction operations must write to a temporary file before atomic renaming to prevent data loss. |
"""

new_content = before_f15 + f15_and_new
with open('docs/MD Files/RAMS_ERROR_LOG_AND_FIXES.md', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(new_content)
print("SUCCESS: Rewrote Feature 15, Bug 29, Feature 16 and Guidelines.")
