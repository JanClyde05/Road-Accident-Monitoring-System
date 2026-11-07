# RAMS Mistakes & Learned Fixes Registry

**Road Accident Monitoring System (RAMS)**  
*Subsystem: AI Integration & Applications Rework*  
*Standard: Zero-Emoji Technical Guardrail Register*

---

## Purpose & Protocol

In mission-critical life-safety systems such as RAMS, architectural mistakes can lead to delayed rescue dispatches, false alarms, system deadlocks, or device battery exhaustion. This document serves as the permanent institutional memory of previous engineering mistakes, technical bottlenecks discovered during research, their root causes, and mandatory implementation rules to prevent recurrence.

Every developer and AI agent working on this repository must consult this registry before modifying any AI, sensor, voice, or dispatch components.

---

## 1. Edge AI & Sensor Processing Mistakes

### Mistake 1.1: Attempting to Stream High-Frequency Raw IMU Numerical Floats Directly into an LLM
* **Context**: Direct prompt feeding of 50Hz-100Hz 6-axis accelerometer and gyroscope floats into a language model prompt.
* **Failure Mode**:
  1. A 1-second sample at 50Hz generates 300 floating-point numbers. Tokenizers convert every float (e.g., `-3.1415`) into 3 to 5 tokens, yielding 1,200+ tokens per second.
  2. Autoregressive inference on a mobile CPU/NPU takes between 800ms and 4,500ms per step.
  3. Real-time crash detection requires decision latency under 15ms. The app suffers severe UI thread lag, thermal throttling, and misses the 5-second collision cancellation window entirely.
* **Root Cause**: LLMs are autoregressive semantic sequence models, not digital signal processing (DSP) filters or temporal feature classifiers.
* **Mandatory Learned Fix**:
  - Enforce a **Dual-Tier Hierarchical AI Architecture**:
    - **Tier 1 (High-Speed Edge Classifier - Sub-5ms)**: Use LiteRT (TensorFlow Lite) or ONNX Runtime Mobile running a lightweight 1D-CNN or Random Forest classifier on mathematically extracted sliding-window statistical features (`meanSvmG`, `maxJerk`, `tiltDeltaDeg`, `energySvm`, `zeroCrossingRate`). Memory footprint: < 5MB RAM.
    - **Tier 2 (On-Device SLM / LLM - Contextual Reasoning Engine)**: Activate the small language model (e.g., SmolLM2-135M or Qwen2.5-0.5B) *only upon* a Tier 1 trigger or for post-incident diagnostics. Feed a concise 40-token structured telemetry summary to generate clinical risk classification and automated emergency dispatch text.

---

### Mistake 1.2: Hardcoding Static G-Force Thresholds Leading to False Alarms
* **Context**: Setting fixed thresholds (e.g., `svm > 3.0g = CRASH`).
* **Failure Mode**:
  - Dropping the smartphone on a couch or floor produces shock peaks exceeding 4.5g without any vehicular velocity or persistent tilt, triggering emergency SMS dispatches to contacts.
  - Normal mountain bike or scooter riding over speed bumps produces brief 2.8g-3.2g spikes.
* **Root Cause**: Reliance on single-axis or instantaneous scalar magnitude without temporal multi-stage confirmation (Freefall -> Impact Spike -> Angular Tilt -> Post-Impact Immobility).
* **Mandatory Learned Fix**:
  - Replicate the empirical multi-stage FSM state machine established in `firmware/wearable_withApp/` and validated in `validation/validate_fsm.py`.
  - Train the Tier 1 AI model using both positive crash datasets and negative Activity of Daily Living (ADL) datasets (`PHONE_FALLING`, `PHONE_SHAKING`, `JUMPING`, `NORMAL_VEHICLE_RIDE`) sourced directly from `apps/imu_studio_app/`.

---

### Mistake 1.3: Schema Divergence Between IMU Studio and Main Android App
* **Context**: Calculating sensor metrics independently in different apps using divergent formulas.
* **Failure Mode**:
  - `imu_studio_app` computed jerk using discrete differences divided by delta-time, while an earlier prototype used unscaled sample differences, causing trained weights to fail in production.
* **Root Cause**: Lack of a single canonical mathematical library or data contract between apps.
* **Mandatory Learned Fix**:
  - Unify all feature extraction under a single canonical data contract (`FeatureVector`) mirroring `com.example.model.FeatureVector` across both `android_app` and `imu_studio_app`.

---

## 2. Voice Recognition & Wake-Word Mistakes

### Mistake 2.1: Relying on Cloud-Based Speech APIs (e.g., Default Google Assistant) for Safety Cancellation
* **Context**: Calling standard cloud speech services for "Hey Google, Cancel Alarm".
* **Failure Mode**:
  - Riders frequently travel through cellular dead zones (highways, tunnels, mountainous rural roads). When an alarm sounds and the rider shouts "RAMS Stop", the phone displays "Can't reach Google right now", locking the rider out and triggering a false 911 dispatch.
* **Root Cause**: Violation of the offline-first safety invariant.
* **Mandatory Learned Fix**:
  - The voice cancellation engine must be **100% offline, local on-device**.
  - Use an embedded Keyword Spotting (KWS) engine (e.g., Sherpa-ONNX with a dedicated acoustic model under 15MB) loaded directly into app memory.
  - Zero network dependencies permitted for the safety-critical false alarm cancellation loop.

---

### Mistake 2.2: Continuous High-Power Microphone Listening Causing Battery Drain & False Triggers
* **Context**: Keeping the microphone active 24/7 during an entire 4-hour motorcycle ride listening for "Hey RAMS".
* **Failure Mode**:
  1. Wind buffeting at 60 km/h creates broadband acoustic noise, causing false phoneme triggers.
  2. Audio recording and continuous FFT inference drains phone battery within 3 hours.
* **Root Cause**: Unnecessary continuous listening when no hazard exists.
* **Mandatory Learned Fix**:
  - **Gated Listening State Machine**: The microphone audio stream and keyword recognizer must remain **dormant / IDLE** during normal riding.
  - The voice listener is initialized and spun up **ONLY when the alarm state is triggered** (entering the 10-second false alarm countdown window).
  - Once the countdown concludes or is cancelled, the audio record thread is immediately torn down and release-locked.

---

## 3. Desktop Application & Incident Analytics Mistakes

### Mistake 3.1: Synchronous File I/O on UI Thread During LoRa Burst Packet Ingestion
* **Context**: Appending incoming serial packets directly to `incidents.json` on the main HTTP/Serial thread.
* **Failure Mode**:
  - When a base station receives simultaneous emergency packets from multiple riders, disk write contention locks the serial port reader, dropping LoRa packets and freezing the desktop map.
* **Root Cause**: Blocking I/O inside the serial receive callback.
* **Mandatory Learned Fix**:
  - Implement a thread-safe Producer-Consumer pattern using `ConcurrentQueue<IncidentEvent>` in C#.
  - The serial reader pushes raw packets into memory immediately; a dedicated background writer flushes batches to `incidents.json` asynchronously every 500ms.

---

### Mistake 3.2: Unbounded Local LLM Memory Allocations Freezing Emergency Dispatch Desktops
* **Context**: Launching full-size 8B/14B parameter LLMs locally on municipal emergency dispatch PCs.
* **Failure Mode**:
  - Command center PCs in regional offices (e.g., Tuguegarao CDRRMO) often feature integrated Intel GPUs and 8GB-16GB total system RAM. Running an unconstrained 8B model exhausts RAM, triggering Windows page file swapping and freezing dispatch monitors.
* **Root Cause**: Failure to budget hardware specifications of real-world rescuer deployment environments.
* **Mandatory Learned Fix**:
  - Constrain Desktop LLM selection strictly to lightweight, quantized architectures:
    - **Primary**: Llama-3.2-3B-Instruct (Q4_K_M quantization ~2.0 GB RAM) or Qwen2.5-3B-Instruct.
    - **Ultra-low RAM Fallback**: Qwen2.5-1.5B-Instruct (Q4_K_M ~1.1 GB RAM).
  - Enforce explicit context window capping (`num_ctx = 2048`) to eliminate runaway memory expansion.
  - Structure all spatial hotspot clustering using deterministic spatial algorithms (DBSCAN / KDE) in C#/Python *before* feeding structured summaries to the LLM for report generation.

---

## 4. Compilation & UI State Discipline Mistakes

### Mistake 4.1: Conflating Identity Models with Spatial Ephemeral States
* **Context**: Referencing dynamic GPS properties (`locationAddress`) from the static `RiderProfile` identity model in Compose UI code.
* **Failure Mode**: Kotlin compilation failure: `Unresolved reference 'locationAddress'`.
* **Root Cause**: `RiderProfile` holds persistent rider credentials (`riderName`, `plateNumber`, `emergencyContactPhone`), whereas real-time GPS telemetry is held in `GpsData`.
* **Mandatory Learned Fix**: Strictly query GPS coordinates and physical street addresses from `gpsState: StateFlow<GpsData>` or fallback cleanly to static municipal labels.

### Mistake 4.2: Missing Jetpack Compose Text Styling Imports
* **Context**: Utilizing `TextAlign.Center` in composables without explicit import.
* **Failure Mode**: Kotlin compilation error: `Unresolved reference 'TextAlign'`.
* **Root Cause**: Material 3 transitively imports typography, but alignment enums reside in `androidx.compose.ui.text.style.*`.
* **Mandatory Learned Fix**: Always explicitly import `androidx.compose.ui.text.style.TextAlign` when customizing tabular or monospace text alignment.

### Mistake 4.3: Omitting Hidden Dotfiles and Environment Configs During Project Staging
* **Context**: Replicating the Android project into a new standalone directory without copying `.env`, `.env.example`, `gradle.properties`, and `local.properties`.
* **Failure Mode**: Gradle configuration abort: `The file '.env.example' could not be found`.
* **Root Cause**: Standard copy routines often exclude dotfiles by default, causing Secrets Gradle Plugin and Android SDK paths to fail resolution.
* **Mandatory Learned Fix**: Always include all root dotfiles (`.env`, `.env.example`, `.gitignore`, `local.properties`, `gradle.properties`) when replicating or exporting Gradle Android modules.

---

## 5. Engineering Invariants Summary Table

| Subsystem | Previous Trap / Mistake | Mandatory Architectural Rule |
|---|---|---|
| **Mobile AI** | Raw IMU floats streamed to LLM | Dual-tier: Sub-5ms 1D-CNN / TinyML first, SLM/LLM for diagnostics second |
| **Mobile Voice** | Cloud Google Assistant API | Local offline Sherpa-ONNX KWS; active only during 10s countdown window |
| **Voice Permissions** | Missing RECORD_AUDIO & stub loop | Add RECORD_AUDIO to manifest, wire on-device SpeechRecognizer + animated VoiceBubbleOverlay |
| **Visual AI Presence** | AI hidden in backend/settings | Dedicated "EDGE AI" top-level tab + interactive scenario simulator + Desktop AI Radar dock |
| **Data Collection** | Inconsistent labeling across tools | Unified `FeatureVector` schema mirroring `imu_studio_app` |
| **Desktop Hotspots** | Unbounded LLM memory bloat | Deterministic DBSCAN clustering + Quantized 3B LLM (<= 2.0GB RAM) |
| **System Resiliency** | Blocking serial reads on disk write | Non-blocking `ConcurrentQueue` asynchronous batching |
| **Model Scope** | Querying GPS from RiderProfile | Keep telemetry in `GpsData` and identity in `RiderProfile` |
| **Build Pipeline** | Omitting dotfiles during staging | Always copy `.env.example`, `.env`, and `local.properties` |

---

## 6. Real-World Field Failures & Rapid Remediation Register

### Mistake 6.1: Voice AI Inoperable Due to Missing Permission & Stubbed Recognizer
* **Context**: User spoke "Hey RAMS" to phone, but nothing happened.
* **Failure Mode**:
  1. `AndroidManifest.xml` lacked `<uses-permission android:name="android.permission.RECORD_AUDIO" />`.
  2. `VoiceAlarmCanceler.kt` PCM processing function unconditionally returned `null`.
  3. No visual indicator or animation showed whether the phone microphone was active or hearing anything.
* **Root Cause**: Incomplete audio capture pipeline setup and lack of animated UI feedback.
* **Mandatory Learned Fix**:
  - Add `android.permission.RECORD_AUDIO` to `AndroidManifest.xml` and request at runtime in `MainActivity.kt`.
  - Wire native on-device `SpeechRecognizer` on `Dispatchers.Main` with fallback to `AudioRecord` RMS tracking.
  - Create `VoiceBubbleOverlay`: An animated, floating Siri/Google Assistant-style popup bubble featuring expanding outer pulse rings, dynamic sound-wave bars reacting in real-time to mic decibels, live transcript readout, and one-tap simulation testing.

### Mistake 6.2: AI Buried in Backend Without Visible Top-Level User Surfaces
* **Context**: User inspected the app and reported "there is no sign of AI integrated, specially on Android".
* **Failure Mode**:
  - AI classification ran silently in the background ViewModel and was only referenced inside deep settings toggles.
  - Desktop served a static React bundle that lacked an obvious AI control button on the top bar.
* **Root Cause**: Architecture-centric thinking rather than judge/evaluator-first user interface design for the IECEP Nationals competition.
* **Mandatory Learned Fix**:
  - Add a dedicated 5th navigation tab `RamsNavTab.AI_SUITE` ("EDGE AI") in `MainActivity.kt`.
  - Implement `AiSuiteScreen.kt`:
    1. Hero IECEP Nationals Dual-Tier Architecture banner.
    2. Live LiteRT 1D-CNN Neural Classifier card showing real-time inference latency (<5ms), confidence bar, and canonical 14-parameter IMU feature contract (`Peak SVM`, `Peak Jerk`, `Tilt Delta`, `Zero Crossing Rate`, `StdDev SVM`).
    3. Interactive scenario test simulator (`[SIMULATE CRASH (6.8G)]`, `[SIMULATE POTHOLE (4.2G)]`, `[SIMULATE PHONE DROP]`).
    4. SmolLM2-135M SLM clinical diagnostic reasoning terminal.
    5. Sherpa-ONNX Voice Wake-Word Canceler with live mic level meter and animated Voice Bubble.
    6. Developer Training Suite for 50Hz ground-truth dataset collection.
  - On Desktop, inject an AI Rescuer Dock pill (`[AI RADAR: 2 HOTSPOTS ACTIVE]`) and slide-out DBSCAN + Local LLM EOC Briefing drawer directly into `index.html`.

### Mistake 6.3: Rapid Destroy and Recreate of SpeechRecognizer Causing IPC Binder Disconnect
* **Context**: Voice AI listening loop restarting continuously during background/idle monitoring.
* **Failure Mode**:
  - Logcat flooded with `SpeechRecognizer: not connected to the recognition service` and `onError 11`.
  - Assistant stopped responding to "Hey RAMS" entirely.
* **Root Cause**:
  - `SpeechRecognizer.destroy()` tears down the asynchronous Android IPC binder with `RecognitionService` (`com.google.android.as`). Reinstantiating immediately before the OS garbage-collects or tears down the prior binder leaves the new instance in an unattached/disconnected dead state.
* **Mandatory Learned Fix**:
  - **Reuse Existing Recognizer**: Keep the instance active in memory. Call `recognizer?.startListening(intent)` directly.
  - Recreate the instance *only* on fatal error codes (`ERROR_CLIENT`, `ERROR_RECOGNIZER_BUSY`, code 11).
  - Implement a 350ms exponential backoff delay before re-attaching.

### Mistake 6.4: ConcurrentModificationException on Multi-Threaded Sensor History Iteration
* **Context**: Sliding-window 14-parameter feature extraction in `SensorAiInferenceEngine.kt`.
* **Failure Mode**:
  - Android runtime crash: `java.util.ConcurrentModificationException` at `SensorAiInferenceEngine.kt:712` during `runTier1Inference`.
* **Root Cause**:
  - Background coroutines on `Dispatchers.Default` iterated through `categoryHistory` (a standard `ArrayList`) while incoming 50Hz sensor events concurrently appended new frames on another thread.
* **Mandatory Learned Fix**:
  - Back historical collections strictly with `CopyOnWriteArrayList<MotionCategory>()`.
  - Wrap any manual array copies or snapshot operations in thread-safe locks.

### Mistake 6.5: Android 11+ Package Visibility Hiding SpeechRecognitionService
* **Context**: Deploying on Android 14 (API 34).
* **Failure Mode**:
  - `SpeechRecognizer.isRecognitionAvailable(context)` returned `false` despite Google Speech and Android System Intelligence being present.
* **Root Cause**:
  - Android 11+ package visibility sandbox hides services unless explicitly permitted in `<queries>`.
* **Mandatory Learned Fix**:
  - Declare `<queries><intent><action android:name="android.speech.RecognitionService" /></intent></queries>` inside `AndroidManifest.xml`.

### Mistake 6.6: Static Monolithic Assistant Templates Lacking User Personalization
* **Context**: User asked questions regarding weather, profile information, and technical guidance.
* **Failure Mode**:
  - Assistant repeated the identical static string regardless of context or user category.
* **Root Cause**:
  - `RamsSystemContext` lacked user identity fields (`userType`, `bloodType`, `allergies`, `emergencyContactName`, `emergencyContactPhone`, `token`), preventing the reasoning engine from generating customized answers.
* **Mandatory Learned Fix**:
  - Inject complete user registration context into `RamsAiAssistantEngine`.
  - Implement role-adaptive logic: vary weather, gear, speed, and safety advice dynamically based on user category (Motorcycle vs Pedestrian vs Car vs Cyclist).

### Mistake 6.7: Missing Foreground Summon Capability from Background Apps
* **Context**: User uttered "Hey RAMS" while using Facebook or navigating other apps.
* **Failure Mode**:
  - Audio was heard, but no visual bubble or assistant interface appeared on screen.
* **Root Cause**:
  - Android restricts background activities from launching into the foreground without `SYSTEM_ALERT_WINDOW` permission and `FLAG_ACTIVITY_REORDER_TO_FRONT`.
  - `MainActivity` had `exported="false"` in the manifest.
* **Mandatory Learned Fix**:
  - Add `android.permission.SYSTEM_ALERT_WINDOW` and configure `MainActivity` with `exported="true"` and `launchMode="singleTop"`.
  - In `VoiceAlarmCanceler`, fire `FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_REORDER_TO_FRONT` with `EXTRA_OPEN_VOICE_BUBBLE = true`.
  - Handle auto-dismissal cleanly with `moveTaskToBack(true)` when the bubble is dismissed.

### Mistake 6.8: Trailing Duplicate Blocks in Automated Edits
* **Context**: Automated tool refactoring of Kotlin functions.
* **Failure Mode**:
  - Leftover duplicated function fragments causing compiler syntax errors.
* **Root Cause**:
  - Edit replacements that don't match exact braces leaving orphaned trailing code.
* **Mandatory Learned Fix**:
  - Always verify closing braces, compile immediately via Gradle, and inspect git diffs before declaring completion.



