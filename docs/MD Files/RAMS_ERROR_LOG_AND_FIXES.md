# RAMS Master Engineering Error Log & Prevention Directives
===============================================================================
Author: RAMS Research & Development Team
Affiliation: IECEP National Student Summit & Edge AI Innovation Competition (DOST-ASTI Collaboration)
Document Version: 2.5-RevC
Last Updated: November 2026
Safety Criticality: HIGH (Life-Safety Telemetry & Road Crash Mitigation)

---

## 1. Overview & Architectural Integrity Protocol
This document serves as the permanent, authoritative ledger of all software defects, IPC race conditions, hardware footprint mismatches, and algorithmic edge cases encountered during the design, implementation, and deployment of the Road Accident Monitoring System (RAMS).

Every entry documents:
1. **Defect Signature & Symptoms**
2. **Underlying Root Cause (Memory, IPC, Binder, Kinematics, Firmware)**
3. **Modified Source Files & Exact Diff Locations**
4. **Permanent Engineering Resolution**
5. **Strict Prevention Directives & Architectural Invariants**

---

## 2. Comprehensive Defect Ledger

### Bug 01: SpeechRecognizer IPC Binder Death on Rapid Restart
- **Subsystem**: Android Voice AI (`VoiceAlarmCanceler.kt`)
- **Severity**: CRITICAL (System Unresponsiveness)
- **Symptoms**: After several voice queries or continuous background listening, RAMS completely stopped responding to voice commands or mic taps. Android Logcat reported `DeadObjectException` from `android.os.BinderProxy`.
- **Root Cause**: The application invoked `speechRecognizer.destroy()` followed immediately by `SpeechRecognizer.createSpeechRecognizer()`. On Android 13/14 (API 33/34), tearing down and recreating the remote IPC binder to `com.google.android.tts/GoogleTTSRecognitionService` causes socket descriptor leaks and binder death when the Google Speech service process has not finished releasing internal audio capture buffers.
- **Files Modified**: `apps/android_app/app/src/main/java/com/example/ai/VoiceAlarmCanceler.kt`
- **Resolution**: Replaced the destructive tear-down cycle with an in-place session reset:
  ```kotlin
  val existing = speechRecognizer
  if (existing != null) {
      try {
          existing.cancel()
          existing.startListening(intent)
          return@post
      } catch (t: Throwable) {
          // Fall back to recreation only if cancel() throws
      }
  }
  ```
- **Prevention Directive**: Never call `.destroy()` on Android system service proxies in loop cycles. Always call `.cancel()` to flush pending recognition buffers, followed by `.startListening()`. Enforce a minimum 2000ms cooldown guard between catastrophic service reinstantiations.

---

### Bug 02: Premature Voice Recognition Cutoff on Rider Queries
- **Subsystem**: Android Speech Pipeline (`VoiceAlarmCanceler.kt`)
- **Severity**: HIGH (Degraded User Experience)
- **Symptoms**: When a motorcycle rider spoke a query such as *"How do I go to SM City?"*, RAMS cut off listening halfway through the sentence (e.g., capturing only *"How do"*), causing unrecognized intent failures.
- **Root Cause**: The default speech recognizer silence timeouts were set too aggressively:
  - `SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS` was set to 1500 ms.
  - `SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS` was set to 1000 ms.
  - `SPEECH_INPUT_MINIMUM_LENGTH_MILLIS` was set to 400 ms.
  In noisy road environments (wind buffeting, motorcycle exhaust, helmet muffling), natural rider pauses between syllables triggered premature end-of-speech detections.
- **Files Modified**: `apps/android_app/app/src/main/java/com/example/ai/VoiceAlarmCanceler.kt`
- **Resolution**: Calibrated silence lengths to allow conversational pauses:
  ```kotlin
  putExtra("android.speech.extras.SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS", 3000L)
  putExtra("android.speech.extras.SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS", 2500L)
  putExtra("android.speech.extras.SPEECH_INPUT_MINIMUM_LENGTH_MILLIS", 1000L)
  ```
- **Prevention Directive**: Calibrate speech endpoints for acoustic degradation typical of moving vehicles. Silence timeouts must never be set below 2500ms when operating in vehicular safety contexts.

---

### Bug 03: Language Locale Lockout Preventing Tagalog/Taglish Transcription
- **Subsystem**: Speech Ingestion Engine (`VoiceAlarmCanceler.kt`)
- **Severity**: HIGH (Language Incompatibility)
- **Symptoms**: Spoken queries in Tagalog or Taglish (e.g., *"Saan ang SM City"*, *"Magkano pamasahe"*, *"Sinisingil ako ng capacity"*) were transcribed as phonetically mangled English garbage (e.g., *"sun and sm city"*, *"mag cannon pass high"*).
- **Root Cause**: The `RecognizerIntent` had `EXTRA_LANGUAGE` hardcoded to `Locale.US.toLanguageTag()` (`en-US`), causing Google SpeechRecognizer's acoustic model to force English phoneme mappings onto Austronesian language structures.
- **Files Modified**: `apps/android_app/app/src/main/java/com/example/ai/VoiceAlarmCanceler.kt`
- **Resolution**: Switched primary acoustic model to Philippine English (`en-PH`) which naturally supports Taglish code-switching, and added `fil-PH` to `EXTRA_ADDITIONAL_LANGUAGES`:
  ```kotlin
  putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-PH")
  putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "en-PH")
  putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, "en-PH")
  putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", arrayOf("fil-PH", "en-US"))
  ```
- **Prevention Directive**: In multicultural operational deployments, never lock `EXTRA_LANGUAGE` to `en-US`. Use regional multilingual locale tags (`en-PH`) and provide multilingual vocabulary biasing lists.

---

### Bug 04: Intent Staleness on SingleTop Activity Delivery (`onNewIntent`)
- **Subsystem**: Android Lifecycle (`MainActivity.kt`)
- **Severity**: MEDIUM (State Desynchronization)
- **Symptoms**: Injecting synthetic queries via ADB (`adb shell am start --es VOICE_QUERY ...`) worked on the first run, but subsequent queries repeatedly displayed the first query's cached response.
- **Root Cause**: `MainActivity` was launched in `singleTop` mode. When a new intent arrived while the activity was already active, `onNewIntent(intent)` was triggered, but `setIntent(intent)` was omitted. Subsequent reads from `intent.getStringExtra("VOICE_QUERY")` retrieved the stale `getIntent()` bundle from the initial creation.
- **Files Modified**: `apps/android_app/app/src/main/java/com/example/MainActivity.kt`
- **Resolution**: Added explicit `setIntent(intent)` in `onNewIntent()`:
  ```kotlin
  override fun onNewIntent(intent: Intent) {
      super.onNewIntent(intent)
      setIntent(intent) // Fixes intent bundle caching
      handleVoiceQueryIntent(intent)
  }
  ```
- **Prevention Directive**: In every Android Activity utilizing `singleTop` or `singleTask`, the first statement inside `onNewIntent()` must always be `setIntent(intent)`.

---

### Bug 05: Intent Routing Order Collision (Fare vs. Directions)
- **Subsystem**: AI Intent Classification (`RamsAiAssistantEngine.kt`)
- **Severity**: MEDIUM (Logical Ambiguity)
- **Symptoms**: Spoken queries such as *"Sinisingil ako ng capacity sa tricycle papuntang SM City"* triggered the turn-by-turn directions handler to SM City rather than the anti-overcharge scam warning.
- **Root Cause**: The direction intent evaluator was positioned before the tricycle fare evaluator in `generateAssistantResponse()`. Because the query contained the token *"SM City"*, the directions check matched first and exited early with navigational wayfinding.
- **Files Modified**: `apps/android_app/app/src/main/java/com/example/ai/RamsAiAssistantEngine.kt`
- **Resolution**: Re-ordered intent evaluation priority:
  1. Profile / Registration Intents
  2. Weather / Road Surface Telemetry
  3. Live Kinematics (Speed, G-force)
  4. Tricycle Fare & Anti-Capacity Scam Advisory (Evaluated BEFORE Directions)
  5. Wayfinding & Directions
  6. Cloud Gemini Distillation / Offline Fallback
- **Prevention Directive**: Specific consumer-protection and safety-critical intents must strictly take precedence over general navigation and location inquiries.

---

### Bug 06: Missing Phonetic Normalization in AI Assistant Entry Point
- **Subsystem**: Local Dialect Normalization (`RamsAiAssistantEngine.kt`)
- **Severity**: MEDIUM (Phonetic Misses)
- **Symptoms**: Speech input containing *"smct"* was normalized in `VoiceAlarmCanceler.kt`, but direct test queries or programmatic injections bypassed normalization and caused assistant intent misses.
- **Root Cause**: `normalizeLocalPhonetics()` was only executed inside the speech callback listener in `VoiceAlarmCanceler.kt`, leaving `RamsAiAssistantEngine.generateAssistantResponse()` vulnerable when queries originated from text UI, ADB intents, or external broadcasts.
- **Files Modified**: `apps/android_app/app/src/main/java/com/example/ai/RamsAiAssistantEngine.kt`
- **Resolution**: Added `normalizeLocalPhonetics()` at the top of `generateAssistantResponse()`:
  ```kotlin
  val normalized = TuguegaraoOfflineSpatialEngine.normalizeLocalPhonetics(query)
  ```
- **Prevention Directive**: Apply sanitization and normalization pipelines at the boundary of domain engines (defense-in-depth), never relying solely on the UI layer or sensor callback.

---

### Bug 07: TTS Audio Self-Interference & Microphone Loopback
- **Subsystem**: Acoustic Echo Cancellation (`VoiceAlarmCanceler.kt`)
- **Severity**: HIGH (Self-Triggering Alarm Abort / Query Echo)
- **Symptoms**: When RAMS spoke a response via Text-to-Speech (TTS), the microphone picked up the speaker's own output, causing the assistant to transcribe its own spoken words and launch recursive query loops.
- **Root Cause**: Android's `SpeechRecognizer` remained active while `TextToSpeech.speak()` was generating audio through `STREAM_MUSIC`.
- **Files Modified**: `apps/android_app/app/src/main/java/com/example/ai/VoiceAlarmCanceler.kt`
- **Resolution**: Implemented an atomic TTS gatekeeper:
  1. `isTtsSpeaking = true` flag set prior to audio dispatch.
  2. Immediate call to `speechRecognizer?.stopListening()`.
  3. Registered `UtteranceProgressListener` to reset `isTtsSpeaking = false` and resume speech recognition only after the audio utterance completes.
  4. Dynamic watchdog timer (`(text.length * 90L).coerceIn(6000L, 22000L)`) to prevent permanent lockup if TTS audio hardware stalls.
- **Prevention Directive**: In full-duplex voice systems without hardware AEC (Acoustic Echo Cancellation), the speech input state machine must be paused during TTS synthesis and resumed strictly through utterance progress callbacks.

---

### Bug 08: Voice Bubble Touch Event Interception
- **Subsystem**: Jetpack Compose UI (`VoiceBubbleOverlay.kt`)
- **Severity**: MEDIUM (UI Occlusion)
- **Symptoms**: When the conversational bubble overlay was active on screen, the rider could not interact with the Leaflet OpenStreetMap view underneath.
- **Root Cause**: The root `Box` of the overlay filled `Modifier.fillMaxSize()` without specifying pass-through touch pointer properties, capturing all motion events across the entire display.
- **Files Modified**: `apps/android_app/app/src/main/java/com/example/ui/components/VoiceBubbleOverlay.kt`
- **Resolution**: Constrained touch interception strictly to the rendered bubble boundary, allowing gesture events on the map and telemetry cards to pass through unhindered.
- **Prevention Directive**: Full-screen floating UI overlays must constrain click/touch targets to actual visible card geometries, leaving background scrims non-clickable when map panning is required.

---

### Bug 09: SX1278 LoRa PCB Footprint Pin 1 Offset (Rev C)
- **Subsystem**: Hardware / KiCad PCB Layout (`RAMS - PCB - Rev C`)
- **Severity**: CRITICAL (Hardware Non-Functionality)
- **Symptoms**: Assembled prototype wearable PCB failed to establish SPI communications with the SX1278 Ra-02 LoRa transceiver module.
- **Root Cause**: KiCad symbol for the Ra-02 module had Pin 1 (GND) mapped to the top-right rather than top-left due to a 180-degree rotation mismatch between standard SMD header footprints and the Ai-Thinker Ra-02 mechanical drawing.
- **Files Modified**: `hardware/KiCAD Files/Antigravity Build/RAMS - PCB - Rev C/`
- **Resolution**: Re-keyed the Ra-02 schematic symbol, aligned Pin 1 with physical silk-screen chamfer, and verified NSS (GPIO10), SCK (GPIO12), MOSI (GPIO11), MISO (GPIO13), and DIO0 (GPIO14) on ESP32-S3.
- **Prevention Directive**: Every hardware schematic pinout must be verified 1:1 against the physical manufacturer component drawing using digital calipers before routing gerber layers.

---

### Bug 10: Inaccurate Tricycle Fare Matrix Citation
- **Subsystem**: Local Legal Intelligence (`TuguegaraoOfflineSpatialEngine.kt`)
- **Severity**: LOW (Informational Inaccuracy)
- **Symptoms**: Anti-overcharge advisory cited non-existent "Ordinance No. 04-2023" and inflated base fares of ₱15/₱12.
- **Root Cause**: Unverified placeholder regulatory data was utilized during initial engine prototyping.
- **Files Modified**: `apps/android_app/app/src/main/java/com/example/ai/TuguegaraoOfflineSpatialEngine.kt`, `apps/android_app/app/src/main/assets/voice_wake_patterns.json`, `apps/android_app/app/src/main/java/com/example/ai/RamsAiAssistantEngine.kt`
- **Resolution**: Aligned all engine references with the official Tuguegarao City Ordinance No. 50-09-2022 (Tricycle Fare Regulation):
  - Base shared-ride fare: ₱12.00 for first 2.0 km (₱10.00 for Students, PWDs, Seniors).
  - Succeeding kilometer rate: +₱2.00/km.
  - Bargaining clause: Permitted strictly between 9:00 PM and 5:00 AM.
  - Reporting authority: TMG / POSO at (078) 304-1111.
- **Prevention Directive**: All civic regulatory facts and emergency contact numbers must be sourced directly from local government legislative records.

---

### Bug 11: SpeechRecognizer ERROR_LANGUAGE_NOT_SUPPORTED(12) on Offline en-PH Request
- **Subsystem**: Android Speech Pipeline (`VoiceAlarmCanceler.kt`)
- **Severity**: HIGH (Silent Speech Ingestion Failure)
- **Symptoms**: When requesting `EXTRA_PREFER_OFFLINE = true` with `en-PH` as primary language on OEM Android devices (Infinix X6851B) without the downloaded Filipino offline speech pack, Google SpeechRecognizer crashed with `ERROR_LANGUAGE_NOT_SUPPORTED(12)` in an infinite restart loop.
- **Root Cause**: Android's on-device speech engine enforces that requested offline language tags must have corresponding local `.obb` or acoustic model files installed on the device partition. If unavailable, it aborts immediately.
- **Files Modified**: `apps/android_app/app/src/main/java/com/example/ai/VoiceAlarmCanceler.kt`
- **Resolution**: Implemented automatic dynamic language fallback:
  ```kotlin
  if (error == 12 || error == 13) {
      Log.w(TAG, "SpeechRecognizer offline language unavailable; falling back to default locale.")
      useFallbackLanguage = true
  }
  ```
  When `useFallbackLanguage` activates, the intent sets `primaryLang = Locale.US.toLanguageTag()` while preserving the `TUGUEGARAO_VOCABULARY_BIASING` array and phonetic normalization pipeline, ensuring Taglish queries are accurately recognized without recognizer stalls.
- **Prevention Directive**: Always couple explicit offline language requests (`EXTRA_PREFER_OFFLINE`) with an automated error-catcher for error codes 12 (`ERROR_LANGUAGE_NOT_SUPPORTED`) and 13 (`ERROR_LANGUAGE_UNAVAILABLE`) that transparently falls back to the system default locale.

---

---

## 3. Master Prevention Guidelines

| Category | Golden Rule |
| :--- | :--- |
| **Speech Lifecycle** | Never destroy SpeechRecognizer in tight loops; use `cancel()` and manage single-instance state. |
| **Acoustic Noise** | Set speech silence timeouts to ≥2500ms for vehicular safety applications. |
| **Locale Handling** | Use regional language tags (`en-PH`, `fil-PH`) to support Taglish dialect switching. |
| **Intent Safety** | Emergency cancel and regulatory consumer-defense intents MUST precede general wayfinding. |
| **UI Scrims** | Overlays must never intercept touches outside their bounded cards. |
| **Hardware Layout**| Never route PCB traces before verifying physical pin 1 on transceiver footprints. |
