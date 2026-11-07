# Offline Custom Wake-Word & Voice Cancellation Engine Specification

**Road Accident Monitoring System (RAMS)**  
*Feature: Voice-Activated False Alarm Cancellation ("RAMS, Cancel Alarm")*  
*Standard: Zero-Emoji Technical Architecture & Engine Comparison*

---

## 1. Operational Rationale & Safety Requirements

When a false alarm or minor incident occurs (such as dropping the phone, dropping the bike while stationary, or bumping a curb), RAMS enters a **10-second auditory and visual countdown** before transmitting SX1278 LoRa emergency packets and dispatching SMS alerts.

### The Problem with Physical Buttons During Riding
- Riders wear heavy leather/kevlar riding gloves with zero touch-capacitance.
- The phone is usually locked in a vibrating handlebar mount or tucked inside a zippered jacket pocket.
- Requiring the rider to physically swipe or tap a touchscreen to cancel a false alarm causes panic, distracted riding, or forced false dispatches.

### The Solution: Offline Custom Wake-Word Recognition
The rider can shout:
- **"RAMS, Stop the Alarm"**
- **"RAMS, Cancel"**
- **"Hey RAMS, I'm OK"**

The phone detects the wake phrase and voice intent, instantly aborts the countdown, marks the incident as a suppressed false alarm, and returns to normal monitoring.

---

## 2. Technology Comparison for Offline Android Voice Detection

We evaluated 4 speech recognition architectures against five strict criteria:
1. **100% Offline Execution** (zero network dependency; operates in remote tunnels or highways).
2. **Custom Wake Phrase** (must support "RAMS" or "Hey RAMS", not hardcoded to "Google").
3. **RAM & Battery Footprint** (under 30MB RAM overhead).
4. **License Compatibility** (permissible for academic and commercial use).
5. **Acoustic Noise Resilience** (robust against wind noise, engine rumble, and horn blares).

| Framework | Architecture | Custom Wake Phrase ("RAMS") | Offline Operation | Android App Footprint | Evaluation & Verdict |
|---|---|---|---|---|---|
| **Sherpa-ONNX (Next-Gen Kaldi)** | Transducer / Zipformer / KWS | Supported (Keyword Spotting via Grapheme/Phoneme table) | 100% Offline Native C++/Kotlin | **12 MB** total (Engine + Acoustic model) | **RECOMMENDED PRIMARY**: Apache 2.0 open source, zero licensing keys, blazing fast (< 80ms latency), ultra-low memory. |
| **Vosk Mobile SDK** | Kaldi-based Small Acoustic Model | Supported via Grammar Constrained Decoding | 100% Offline | ~45 MB (Small English model) | **SECONDARY / BACKUP**: Highly reliable, slightly larger binary footprint. |
| **Picovoice Porcupine & Rhino** | Custom neural acoustic model | Supported (Requires custom wake phrase generation on Picovoice Console) | 100% Offline | ~4 MB | Excellent accuracy, but restricted by proprietary API key quotas and commercial licensing tier. |
| **PocketSphinx Android** | Legacy GMM-HMM | Supported via dictionary | 100% Offline | ~18 MB | Poor acoustic noise rejection; susceptible to wind and vehicle vibrations. |

### Recommended Solution: **Sherpa-ONNX Keyword Spotting Engine**
- **Library**: `com.k2fsa.sherpa.onnx:sherpa-onnx:1.10.22`
- **Model**: Pre-trained Zipformer KWS or Whisper-tiny-KWS ONNX model quantized to 8-bit.
- **Custom Keywords Table (`keywords.txt`)**:
  ```
  RAMS cancel alarm
  RAMS stop the alarm
  RAMS stop
  RAMS cancel
  hey RAMS cancel
  I am okay RAMS
  ```

---

## 3. The Power & Battery Conservation State Machine

A critical lesson recorded in `MISTAKES_AND_FIXES_LOG.md` (Mistake 2.2) is that **keeping the microphone open 24/7 during riding exhausts the battery within 3 hours and causes false triggers from wind buffeting**.

Therefore, the RAMS Voice Alarm Canceler implements an event-gated operational lifecycle:

```
                  ┌───────────────────────────────┐
                  │          SYSTEM IDLE          │
                  │   Microphone: OFF / Dormant   │
                  │   Audio Thread: DESTROYED     │
                  │   RAM Allocation: 0 MB        │
                  └──────────────┬────────────────┘
                                 │
                 [Crash Detected by Tier 1 AI]
                                 │
                                 ▼
                  ┌───────────────────────────────┐
                  │    ALARM COUNTDOWN (10s)      │
                  │   AudioRecord: INITIALIZED    │
                  │   Sherpa-ONNX: ACTIVE         │
                  │   Siren: BEEPING              │
                  └──────┬─────────────────┬──────┘
                         │                 │
    ["RAMS Cancel Alarm" Heard]       [10s Timer Expires]
                         │                 │
                         ▼                 ▼
          ┌───────────────────────┐  ┌───────────────────────┐
          │  FALSE ALARM ABORTED  │  │   EMERGENCY DISPATCH  │
          │  AudioRecord: STOPPED │  │  LoRa & SMS Sent      │
          │  Log: Suppressed ADL  │  │  AudioRecord: STOPPED │
          └──────────────┬────────┘  └───────────────────────┘
                         │
                         ▼
                  [Return to IDLE]
```

---

## 4. Audio Preprocessing for High-Noise Helmet / Handlebar Conditions

Motorcycle riders generate 65dB to 85dB of acoustic interference:
1. **Engine Combustion Rumble**: Low frequency (80Hz - 300Hz).
2. **Wind Turbulence**: Broad spectrum (100Hz - 2,500Hz).
3. **Vehicle Exhaust & Tires**: Mid-range frequencies.

### Preprocessing DSP Pipeline (prior to KWS inference)
1. **High-Pass Filter (Butterworth 2nd order)**: Cutoff at 350Hz. Removes motorcycle engine vibration and low-frequency wind pressure waves.
2. **Android Native Acoustic Echo Cancellation (AEC)**: Cancels the sound of the app's own siren/buzzer so the microphone can clearly isolate the rider's voice while the alarm is actively blaring.
3. **Android Native Noise Suppressor (NS)**: Attenuates stationary road noise using hardware DSP.
4. **Confidence Thresholding**: A keyword spot is confirmed only if acoustic confidence exceeds `0.78` and duration matches the expected phoneme envelope (`[rams] [kæn.səl] [əˈlɑrm]`).

