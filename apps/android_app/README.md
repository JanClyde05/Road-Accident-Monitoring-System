# RAMS Android Mobile Companion Application

**Production Edge AI, Hands-Free Voice Companion, BLE GATT Sync, and Multi-Tier Incident Detection**

The RAMS Android Companion App is a native Kotlin application built with Jetpack Compose Material 3. It serves as the primary mobile interface for riders, pedestrians, cyclists, and vehicle operators, providing continuous 50Hz kinematic shock monitoring, dual-tier Edge AI classification, 100% offline conversational voice assistance, and automatic emergency relay.

---

## 1. Directory Structure & Key Entry Points

```
apps/android_app/app/src/main/
├── java/com/example/
│   ├── MainActivity.kt               # Root Activity, Compose navigation host, and background intent router
│   ├── SplashActivity.kt             # Branded startup splash launcher and intent forwarding
│   │
│   ├── ai/                           # Edge Artificial Intelligence & Voice Assistant Engine
│   │   ├── SensorAiInferenceEngine.kt# Dual-tier kinematic feature extractor (50Hz) and false-alarm suppression
│   │   ├── VoiceAlarmCanceler.kt     # Hands-free safety abort engine and on-device "Hey RAMS" recognizer
│   │   ├── RamsAiAssistantEngine.kt  # Personalized, context-aware conversational AI assistant (100% offline)
│   │   └── DeveloperTrainingSuite.kt # In-app ground-truth benchmark runner and scenario simulation engine
│   │
│   ├── audio/                        # Auditory Alert Engines
│   │   └── AlarmSoundEngine.kt       # Continuous high-pitch SOS Morse klaxon and vibration loop
│   │
│   ├── connectivity/                 # Wearable Hardware Interface
│   │   └── Esp32ConnectionManager.kt # Bluetooth LE GATT client (UUID 0xFFE0 / 0xFFE1) and auto-reconnect
│   │
│   ├── export/                       # Data Persistence & Diagnostics
│   │   └── CsvExportManager.kt       # 50Hz raw IMU CSV recorder, session exporter, and calibration manager
│   │
│   ├── model/                        # Domain State & Entity Models
│   │   ├── FeatureVector.kt          # 14-parameter kinematic contract model
│   │   ├── RiderProfile.kt           # User passport (userType, bloodType, plateNumber, emergency contacts)
│   │   ├── IncidentEvent.kt          # Incident log record with classification and GPS coordinates
│   │   └── TelemetryState.kt         # Live GPS and IMU measurement models
│   │
│   ├── sensor/                       # Internal Hardware Sensors
│   │   └── PhoneSensorEngine.kt      # High-rate fused accelerometer/gyroscope reader and deadband orientation
│   │
│   ├── service/                      # Background Execution
│   │   └── RamsForegroundService.kt  # Sticky foreground service guarding microphone, location, and BLE
│   │
│   ├── sync/                         # Hardware Synchronization
│   │   └── Esp32SyncEngine.kt        # Bidirectional LoRa/BLE packet dispatcher (Emergency SOS, Cancel, Telemetry)
│   │
│   ├── ui/                           # Jetpack Compose UI Layer
│   │   ├── components/               # Reusable Modular Widgets
│   │   │   ├── VoiceBubbleOverlay.kt # Translucent Google Assistant / Gemini style voice popup
│   │   │   ├── AttitudeIndicator.kt # Artificial Horizon / Euler pitch & roll attitude display
│   │   │   ├── RamsHeader.kt         # Top status bar, live pill, and avatar launcher
│   │   │   ├── RiderLoginDialog.kt   # Interactive profile editor dialog
│   │   │   └── CsvExportDialog.kt    # CSV session recorder and calibration modal
│   │   └── screens/                  # Top-Level Tab Screens
│   │       ├── TelemetryScreen.kt    # Speedometer, G-force meter, artificial horizon, and emergency button
│   │       ├── MapScreen.kt          # Tactical GPS tracking map with historical accident danger hotspots
│   │       ├── WearableScreen.kt     # Bluetooth scanner, device pairing, and hardware signal diagnostics
│   │       ├── AiSuiteScreen.kt      # Real-time AI Cognition monitor, movement stream, and benchmark trials
│   │       └── SettingsScreen.kt     # Profile management, IMU Studio calibration, and project credits
│   │
│   └── viewmodel/                    # State Architecture
│       └── RamsViewModel.kt          # Central StateFlow repository coordinating sensors, BLE, AI, and audio
│
├── assets/motion_benchmarks/         # Pre-compiled canonical motion benchmark trials (SisFall, Potholes, Drops)
└── AndroidManifest.xml               # Service declarations, <queries> speech filters, and permissions
```

---

## 2. Core Functional Capabilities

### 2.1 Dual-Tier Edge AI Kinematic Inference
* **Continuous 50Hz Ingestion**: Samples the device IMU inside a 50-sample window ($1000\text{ ms}$).
* **14 Canonical Kinematic Parameters**: Computes Peak SVM, Jerk, Tilt Delta, Freefall Minimum, Angular Velocity, and Zero-Crossing Cadence.
* **100% False Alarm Suppression**: Automatically rejects road potholes, speed bumps, pocket vibrations, stationary phone drops, and pedestrian walking/running without firing alarms.
* **Temporal Hysteresis**: Decisive classification filter prevents AI state jitter and second-guessing.

### 2.2 100% Offline Conversational Voice AI ("Hey RAMS")
* **Continuous Wake-Word Listener**: Android On-Device Speech Recognition (`createOnDeviceSpeechRecognizer`) backed by local neural speech models (`com.google.android.as`), operating completely offline.
* **Hands-Free Safety Cancellation (0 ms)**: Safety phrases (`"cancel"`, `"stop"`, `"abort"`, `"i am safe"`, `"i'm ok"`) abort countdowns instantly on partial audio results.
* **Comfortable Conversational Silence Timer (1500 ms)**: Gives the user 1.5 seconds of silence before answering queries, dynamically canceling if speech resumes so sentences are never cut off.
* **Personalized Response Adaptation**: Dynamically tailors every answer to the user's registered `userType` (Motorcycle Rider vs Pedestrian vs Car Driver vs Bicyclist).

### 2.3 Background System Overlay (`SYSTEM_ALERT_WINDOW`)
* Enables RAMS to summon the Assistant Bubble on top of any active application (such as Facebook, Google Maps, or the Home launcher) when "Hey RAMS" is spoken.

### 2.4 Wearable Hardware Integration (BLE GATT)
* Connects via BLE GATT (`0xFFE0` / `0xFFE1`) to the ESP32-S3 Wearable PCB, streaming 100Hz MPU-6050 fall detection flags and battery telemetry.
* Supports bidirectional hardware cancellation: pressing the physical tactile button on the wearable instantly dispatches a cancel packet to the phone app and LoRa network.

---

## 3. Build & Deployment Commands

```bash
# 1. Compile debug APK
cd apps/android_app
.\gradlew.bat assembleDebug

# 2. Install to connected device via ADB
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 3. Grant system alert window (overlay over other apps)
adb shell appops set com.aistudio.rams.wkqmzb SYSTEM_ALERT_WINDOW allow

# 4. Launch application
adb shell am start -n com.aistudio.rams.wkqmzb/com.example.SplashActivity
```
