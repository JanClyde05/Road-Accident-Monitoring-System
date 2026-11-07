# Road Accident Monitoring System (RAMS)

**Real-Time Highway Incident Detection, LoRa Long-Range Telemetry, Dual-Tier Edge AI, and Rescuer Command Center**

RAMS is an end-to-end, multi-tier emergency response platform engineered for real-time traffic accident detection and immediate rescue dispatch. Designed specifically for highway environments and rural road segments vulnerable to cellular coverage dropouts, RAMS pairs a custom wearable sensor relay node with high-rate inertial shock sensing, off-grid 433MHz LoRa long-range radio broadcast, dual-tier on-device neural edge classification, rider mobile telemetry synchronization, conversational voice AI, and a standalone command-center desktop application.

---

## 1. System Architecture & Information Pipeline

```
  +-------------------------------------------------------------------------------+
  |                             RIDER TIER (MOBILE)                               |
  |  Android Companion App (Kotlin / Jetpack Compose / Edge AI Engine)            |
  |  - 50Hz Continuous Inertial Sensing (Fused Accel/Gyro + Euler Horizon)        |
  |  - Dual-Tier Edge AI: 1D-CNN Kinematic Feature Extractor + SLM Reasoner       |
  |  - 100% Offline On-Device Voice AI Assistant & Wake-Word Canceler ("Hey RAMS")|
  |  - Background System Overlay: Pop-up AI assistant over Facebook / other apps  |
  |  - Dual-Band GNSS Coordinate Acquisition & Offline Hotspot Hazard Density     |
  |  - Medical & Identity Profile Management (Base62 Token, Photo CDN)            |
  |  - Cellular Fallback: Automated SMS Emergency Dispatch & Cloud REST Relay     |
  +---------------------------------------+---------------------------------------+
                                          |
                              BLE GATT (0xFFE0 / 0xFFE1)
                                          |
                                          v
  +-------------------------------------------------------------------------------+
  |                            WEARABLE RELAY TIER                                |
  |  RAMS Custom Wearable PCB (ESP32-S3FH4R2, Rev C EPDC Edition)                 |
  |  - 2-Stage Finite State Machine (Freefall -> Impact Spike -> Rest -> Latch)   |
  |  - On-Board MPU-6050 Motion Engine & Crash Logic (100Hz I2C)                  |
  |  - 30-Second Auditory / Visual Warning & False-Alarm Cancellation Button      |
  |  - WS2812B RGB Status Indication (Armed, SOS Alert, Low Battery)              |
  |  - On-Board Battery Management (TP4054 Charger + DW01A/FS8205A Protection)   |
  +---------------------------------------+---------------------------------------+
                                          |
                        433MHz LoRa Link (SX1278, SF9, CR 4/5)
                                          |
                                          v
  +-------------------------------------------------------------------------------+
  |                         BASE STATION RECEIVER TIER                            |
  |  LoRa Ground Station (ESP32-S3 Base Unit)                                     |
  |  - Continuous 433MHz Carrier Monitoring (SX1278 SPI Interface)               |
  |  - Dual-Stream Output: High-Speed USB Serial & Local Wi-Fi TCP/HTTP Bridge    |
  |  - LittleFS Offline Flash Store-and-Forward Emergency Queue                   |
  +-------------------+---------------------------------------+-------------------+
                      |                                       |
              USB Serial (115200)                      Wi-Fi / LAN TCP (8888)
                      |                                       |
                      +-------------------+-------------------+
                                          v
  +-------------------------------------------------------------------------------+
  |                        COMMAND CENTER & DISPATCH TIER                         |
  |  Windows Rescuer Desktop Application (C# .NET + React 19 / Leaflet Radar)     |
  |  - Zero-Configuration COM Port Auto-Detection & USB Ingestion Engine          |
  |  - Real-Time Incident Triage, Audible Klaxon Alerts, & Priority Queuing       |
  |  - Interactive Tactical Radar Map with Live Marker Tracking & ETA Calculation |
  |  - Spatial Machine Learning Hotspot Predictor & Incident Heatmap              |
  |  - Local JSON Data Persistence (incidents.json, registrations.json)           |
  |  - Netlify Cloud Backend Integration & Public Web Map Mirror                  |
  +-------------------------------------------------------------------------------+
```

---

## 2. Master Navigation Index: Focus Folders & Core Entry Points

This directory routing table allows human engineers and AI agents to locate and navigate every functional subsystem directly:

| Subsystem Domain | Primary Focus Folder | Key Entry Points & Core Files | Role & Capabilities |
|---|---|---|---|
| **Android Mobile App** | [`apps/android_app/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/android_app/) | [`MainActivity.kt`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/android_app/app/src/main/java/com/example/MainActivity.kt)<br>[`RamsViewModel.kt`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/android_app/app/src/main/java/com/example/viewmodel/RamsViewModel.kt)<br>[`AndroidManifest.xml`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/android_app/app/src/main/AndroidManifest.xml) | Production Android Kotlin / Jetpack Compose application. Houses BLE GATT, GPS, real-time telemetry, and foreground service. |
| **Edge AI & Assistant** | [`apps/android_app/.../ai/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/android_app/app/src/main/java/com/example/ai/) | [`SensorAiInferenceEngine.kt`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/android_app/app/src/main/java/com/example/ai/SensorAiInferenceEngine.kt)<br>[`VoiceAlarmCanceler.kt`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/android_app/app/src/main/java/com/example/ai/VoiceAlarmCanceler.kt)<br>[`RamsAiAssistantEngine.kt`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/android_app/app/src/main/java/com/example/ai/RamsAiAssistantEngine.kt) | Dual-tier edge neural model, 100% offline "Hey RAMS" wake-word recognizer, and personalized conversational companion. |
| **Standalone AI Suite** | [`apps/new_ai_applications/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/new_ai_applications/) | [`mobile_ai_app/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/new_ai_applications/mobile_ai_app/)<br>[`ai_resources_and_models/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/new_ai_applications/ai_resources_and_models/)<br>[`FREE_MOTION_DATASETS_DIRECTORY.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/new_ai_applications/ai_resources_and_models/FREE_MOTION_DATASETS_DIRECTORY.md) | Synchronized standalone twin applications, motion benchmark datasets, and 1-click build pipelines. |
| **Wearable Firmware** | [`firmware/wearable_withApp/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/wearable_withApp/) | [`wearable_withApp.ino`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/wearable_withApp/wearable_withApp.ino) | ESP32-S3 firmware with MPU-6050 100Hz FSM, ATGM336H GPS parsing, SX1278 LoRa uplink, BLE GATT server, and WS2812B NeoPixel. |
| **Base Station Firmware** | [`firmware/receiver_withDesktop/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/receiver_withDesktop/) | [`receiver_withDesktop.ino`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/receiver_withDesktop/receiver_withDesktop.ino) | ESP32-S3 base station listening on 433MHz LoRa. Forwards alerts over USB Serial (`RAMS_PKT:...`) and Wi-Fi TCP/HTTP. |
| **Shared RF Protocol** | [`firmware/shared/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/shared/) | [`protocol.h`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/shared/protocol.h) | Canonical C header defining packed binary RF structs (`LoRaAlertPacket`, `TelemetryPacket`), bitmasks, and RF channels. |
| **Command Center Desktop** | [`apps/desktop_app/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/desktop_app/) | [`RescuerForm.cs`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/desktop_app/RescuerForm.cs)<br>[`HotspotPredictor.cs`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/desktop_app/HotspotPredictor.cs)<br>[`www/index.html`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/desktop_app/www/index.html) | Windows Rescuer Operations app (C# .NET / WebView2 + React 19). Handles serial auto-detect, klaxon alerts, and incident triage. |
| **Cloud Web Mirror** | [`apps/backend/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/backend/) | [`src/App.tsx`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/backend/src/App.tsx)<br>[`netlify.toml`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/backend/netlify.toml) | React 19 / Leaflet live dispatch map hosted on Netlify Serverless for supervisor and field hospital visibility. |
| **Hardware & PCB CAD** | [`hardware/KiCAD Files/Antigravity Build/RAMS - PCB - Rev C/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/hardware/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB%20-%20Rev%20C/) | [`RAMS - PCB.kicad_sch`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/hardware/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB%20-%20Rev%20C/RAMS%20-%20PCB.kicad_sch)<br>[`RAMS - PCB.kicad_pcb`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/hardware/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB%20-%20Rev%20C/RAMS%20-%20PCB.kicad_pcb)<br>[`circuit_spec.json`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/hardware/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB%20-%20Rev%20C/circuit_spec.json) | Production Rev C EPDC-compliant PCB CAD (DOST-ASTI EPDC manufacturing rules: 0.3mm trace, 0.4mm drill, 0.95mm via). |
| **Data & Research Docs** | [`docs/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/docs/) | [`FREE_MOTION_DATASETS_DIRECTORY.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/docs/FREE_MOTION_DATASETS_DIRECTORY.md)<br>[`00_SYSTEM_ARCHITECTURE.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/00_SYSTEM_ARCHITECTURE.md)<br>[`MEMORY_MAP.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/MEMORY_MAP.md) | Architectural documentation, dataset directories, validation matrices, and DOST procurement specifications. |

---

## 3. Scientific References, Standards & Open Datasets Used

The design, mathematical formulations, sensor calibration, and physical validation of RAMS are built upon peer-reviewed research, international engineering standards, and public benchmark datasets:

### 3.1 Open-Source Motion Datasets & Kinematic Benchmarks
* **SisFall Dataset** (*Universidad de Antioquia, Colombia*):
  - 4,510 recorded trials across 38 subjects using dual 3-axis accelerometers (ADXL345, MMA8451Q) and ITG3200 gyroscope at 200 Hz.
  - Used to calibrate human fall kinematics, pre-impact freefall boundaries, and post-fall rest posture.
  - Source: [Zenodo 57233](https://zenodo.org/record/57233).
* **MobiFall & MobiAct Dataset** (*Biomedical Informatics & eHealth Laboratory, HMU Greece*):
  - 3,200 trials across 67 participants recording pocket smartphone IMU vectors at 87 Hz.
  - Used to benchmark trouser-pocket smartphone movement during walking, running, stumbling, and vehicle transit.
  - Source: [MobiAct HMU](https://www.bmi.hmu.gr/the-mobiact-dataset/).
* **UP-Fall Detection Dataset** (*Universidad Panamericana, Mexico*):
  - Multi-IMU dataset (waist, wrist, neck, thigh, ankle) at 100 Hz.
  - Used to correlate wrist wearable kinematics against waist/pocket smartphone telemetry.
  - Source: [Zenodo 3739768](https://zenodo.org/record/3739768).
* **IEEE DataPort Road Pothole & Speed Bump Dataset** (*IEEE DataPort*):
  - 50 Hz tri-axial accelerometer & gyroscope recordings from motorcycles and passenger vehicles over road anomalies.
  - Used for **False-Positive Suppression**: establishing the vertical shockwave recovery signature ($>4.0G$ vertical impulse returning to $0^\circ$ upright within 300 ms).
  - Source: [IEEE DataPort Pothole Dataset](https://ieee-dataport.org/open-access/road-pothole-and-bump-dataset).
* **UCI Human Activity Recognition (HAR) Smartphone Dataset** (*UCI ML Repository*):
  - 10,299 instances of 50 Hz waist-mounted smartphone data across walking, stair climbing, sitting, and standing.
  - Used as the nominal Activities of Daily Living (ADL) control group to ensure zero false triggers during pedestrian transit.
  - Source: [UCI HAR Repository](https://archive.ics.uci.edu/dataset/240/human+activity+recognition+using+smartphones).

### 3.2 Hardware Standards & Semiconductor Specifications
* **InvenSense MPU-6050 Motion Processing Unit**:
  - $I^2C$ fast-mode protocol, internal digital low-pass filtering (DLPF 44Hz), $\pm 16g$ accelerometer full-scale, $\pm 2000^\circ/s$ gyroscope range.
* **Semtech SX1278 LoRa Transceiver**:
  - 433MHz ISM physical layer, Spreading Factor 9, 125 kHz Bandwidth, Coding Rate 4/5, $+17\text{ dBm}$ output power, link budget $>148\text{ dB}$.
* **Espressif ESP32-S3FH4R2 Microcontroller**:
  - Dual-core Xtensa LX7 @ 240MHz with vector instructions, 4MB embedded Flash, 2MB embedded PSRAM, Bluetooth 5.0 LE GATT peripheral.
* **DOST-ASTI EPDC PCB Design Rules**:
  - Electronics Product Development Center, Department of Science and Technology, Bicutan, Taguig.
  - Minimum track width: $0.30\text{ mm}$, track clearance: $0.254\text{ mm}$, mechanical drill: $0.40\text{ mm}$, via diameter: $0.95\text{ mm}$.

---

## 4. Production Methodologies & Technical Engineering

### 4.1 Kinematic Feature Extraction Pipeline (14 Canonical Parameters)
RAMS samples the phone's 6-axis IMU (fused accelerometer and calibrated gyroscope) at 50 Hz through a 50-sample sliding window ($1000\text{ ms}$ duration with $200\text{ ms}$ overlap). For each window, the kinematic pipeline computes a 14-parameter feature vector:

$$\text{SVM}_i = \sqrt{a_{x,i}^2 + a_{y,i}^2 + a_{z,i}^2}$$

1. **Mean SVM ($G$)**: Baseline gravitational loading and continuous propulsion.
2. **Peak Shock SVM ($G$)**: Maximum impact impulse ($>4.5G$ for severe collisions; $2.5G\text{--}4.0G$ for road bumps).
3. **Minimum Freefall SVM ($G$)**: Airborne / drop detection ($<0.35G$ signals weightlessness).
4. **SVM Standard Deviation ($G$)**: Roughness and kinematic variance dispersion.
5. **Root Mean Square SVM ($G$)**: Continuous kinetic energy density.
6. **Peak Gyroscope Magnitude ($^\circ/s$)**: Maximum angular tumbling velocity.
7. **Mean Gyroscope Magnitude ($^\circ/s$)**: Sustained angular rotation.
8. **Gyroscope Standard Deviation ($^\circ/s$)**: Rotational stability index.
9. **Maximum Jerk ($G/s$)**: $\max(\|\text{SVM}_i - \text{SVM}_{i-1}\| \times 50)$, measuring shockwave sharpness.
10. **Mean Jerk ($G/s$)**: Continuous rate of acceleration change.
11. **Tilt Delta ($^\circ$)**: $\|\Delta\text{Pitch}\| + \|\Delta\text{Roll}\|$. **The critical discriminator**: genuine crashes rest at $>45^\circ$, while potholes and speed bumps immediately recover to upright ($<5^\circ$).
12. **Signal Magnitude Area (SMA)**: Activity energy normalized over the window.
13. **Spectral Energy (SVM)**: Energy dissipation across the shock window.
14. **Zero-Crossing Rate**: Cyclic cadence used to detect walking ($1.5\text{--}2.0\text{ Hz}$) and running ($2.5\text{--}3.5\text{ Hz}$) while suppressing false alarms.

### 4.2 False Alarm Rejection & Hysteresis Logic
Naive impact detectors trigger 911 alarms whenever a phone is dropped or hits a bump. RAMS enforces strict **zero false-alarm suppression rules**:
* **Potholes & Speed Bumps**: Vertical spike up to $4.5G$ with $\text{Tilt Delta} < 10^\circ$ and immediate recovery $\rightarrow$ `SUPPRESSED: ROAD POTHOLE` (0% Risk).
* **Stationary Phone Drops**: Drop shock up to $3.5G$ at $0\text{ km/h}$ pre-event speed $\rightarrow$ `SUPPRESSED: STATIONARY DROP` (0% Risk).
* **Pocket Tremors & Hand Shakes**: High-frequency gyro tremor without vehicular speed $\rightarrow$ `SUPPRESSED: POCKET VIBRATION` (0% Risk).
* **Pedestrian Gait**: Cyclic zero-crossing rate ($1.2\text{--}3.0\text{ Hz}$) with $1.0G$ baseline $\rightarrow$ `SUPPRESSED: PEDESTRIAN ADL` (0% Risk).
* **Temporal Hysteresis**: Transitions require 3 consecutive matching windows, preventing AI decision flutter, while true accidents trigger immediately ($0\text{ ms}$ latency).

### 4.3 100% Offline Conversational Voice AI & Background Overlay
* **Continuous Microphone Listener**: Android On-Device Speech Recognition (`createOnDeviceSpeechRecognizer`) backed by Android System Intelligence (`com.google.android.as`), operating 100% offline without network connections.
* **Phonetic Normalization**: Strips punctuation and matches phonetic variants (`"Hey RAMS"`, `"Hi RAMS"`, `"Hey Ram"`, `"OK RAMS"`, `"RAMS"`).
* **Background System Overlay (`SYSTEM_ALERT_WINDOW`)**: When the rider says "Hey RAMS" while using Facebook, Google Maps, or browsing the home screen, the app immediately summons the translucent Assistant Bubble over the current screen.
* **Adaptive Conversational Persona**: Personalizes every response to the registered user type (Motorcycle Rider vs Pedestrian vs Car Driver vs Cyclist) using live telemetry, weather, medical tokens, and comprehensive app technical guidance.

---

## 5. Build, Setup & Quick Start Guide

### Prerequisites
* **Android Studio Ladybug (or newer)** with Android SDK 34+.
* **Arduino IDE 2.x** with the ESP32 Board Support Package (by Espressif Systems).
* **Windows 10 / 11** with .NET Framework 4.8+.
* **Node.js 20+** and `npm` (for backend/desktop web builds).
* **KiCad 10** (for schematic review and PCB generation).

### 1-Click Batch Scripts (in `apps/`)
* [`apps/Build_Android_APK.bat`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/Build_Android_APK.bat) — Compiles and packages the native Android APK (`app-debug.apk`).
* [`apps/Launch_Desktop_Rescuer.bat`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/Launch_Desktop_Rescuer.bat) — Launches the Rescuer Command Center Desktop executable.
* [`preview_mobile_app.bat`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/preview_mobile_app.bat) — Runs the browser web preview at port 3000.

---

## 6. Engineering Standards & Design Rules
1. **Zero-Emoji Design Rule ([`DESIGN_RULES.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/DESIGN_RULES.md))**: System UI interfaces, alerts, logs, and commit records strictly prohibit Unicode emojis. All iconography uses precision vector glyphs.
2. **DFM Manufacturing Strictness**: All Rev C PCB designs pass automated Python KiCad rule validation against DOST-ASTI EPDC physical limits without waivers or DRC suppressions.
3. **Safety Timing Invariants**: LoRa airtime constraints, SPI clock speeds (up to 10MHz for SX1278), and BLE notification pacing (12ms) are preserved across all revisions to eliminate packet collision and watchdog resets.
