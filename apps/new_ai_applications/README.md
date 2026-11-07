# RAMS Next-Generation AI Applications Suite

**Road Accident Monitoring System (RAMS)**  
*Dedicated Distribution & Build Directory for AI-Integrated Applications*  
*Competition Track: IECEP Nationals — Intelligent Edge & AI Integration*  
*Standard: Zero-Emoji Technical Architecture & Operations Guide*

---

## 1. Directory Structure

```
d:\Antigravity\Projects\Danger Monitoring System V2\apps\new_ai_applications\
├── Build_All_Apps.bat                  # 1-Click Master Builder for Both Desktop & Mobile
├── Launch_Desktop_App.bat              # 1-Click Launcher for Desktop AI Command Center
├── Build_Mobile_APK.bat                # 1-Click Compiler for Android AI APK
├── README.md                           # This Documentation & Operations Index
│
├── desktop_ai_app/                     # Standalone Windows Desktop Operations Center
│   ├── RAMS_Rescuer_Desktop.exe        # Precompiled Ready-to-Run Windows Application (62.4 KB)
│   ├── Program.cs                      # Embedded HTTP & LoRa Serial Bridge Server
│   ├── HotspotPredictor.cs             # Haversine DBSCAN Spatial Clustering Engine
│   ├── DesktopAiReportGenerator.cs     # Local LLM Interface for EOC Briefs
│   ├── Build_Desktop_Exe.bat           # 1-Click Native C# Compiler (csc.exe)
│   ├── Launch_Desktop.bat              # 1-Click Launcher
│   ├── incidents.json                  # Persistent Incident Database (74 incidents)
│   ├── registrations.json              # Registered Rider Profiles Database
│   └── www/                            # Web Operations Center Interface (HTML/CSS/JS)
│
├── mobile_ai_app/                      # Native Android Kotlin Application
│   ├── prebuilt_apk/                   # Ready-to-Install Android Packages
│   │   ├── RAMS_Mobile_AI_v2.5.apk     # Prebuilt Debug APK with AI Integration (23.8 MB)
│   │   └── app-debug.apk               # Duplicate release pointer
│   ├── Build_APK.bat                   # 1-Click Gradle APK Compiler
│   ├── Build_And_Install_To_Phone.bat  # 1-Click USB ADB Deployer & Launcher
│   ├── build.gradle.kts                # Project Gradle configuration
│   ├── settings.gradle.kts             # Module definitions
│   ├── gradlew.bat                     # Gradle wrapper
│   └── app/                            # Android Application Source Code
│       ├── build.gradle.kts            # App dependencies & SDK definitions
│       └── src/main/java/com/example/  # Clean Kotlin Source Tree
│           ├── ai/                     # Edge AI, Voice Canceler & Dev Training Suite
│           ├── viewmodel/              # Central State Management (RamsViewModel)
│           ├── ui/                     # Jetpack Compose UI Screens & Components
│           ├── model/                  # Canonical Data Contracts & Feature Vectors
│           ├── sensor/                 # 50Hz Phone Sensor Engines & Filters
│           ├── sync/                   # ESP32 LoRa Wearable BLE Sync Engine
│           ├── connectivity/           # Multi-Transport Communication Manager
│           └── export/                 # CSV & JSON Dataset Logger
│
└── ai_resources_and_models/            # Integrated AI Weights, Schemas & Configs
    ├── voice_models/                   # Offline Voice Recognition Resources
    │   ├── keywords.txt                # "RAMS Cancel Alarm", "RAMS Stop" Phoneme Table
    │   └── sherpa_onnx_kws_config.json # Sherpa-ONNX Audio DSP & Gate Configuration
    ├── edge_ai_models/                 # On-Device Mobile AI Architectures
    │   ├── lite_rt_model_spec.json     # Tier 1 1D-CNN LiteRT Classifier (<5MB RAM)
    │   └── smollm2_135m_slm_spec.json  # Tier 2 SmolLM2-135M Offline SLM Reasoner
    ├── desktop_ai_config/              # Desktop Analytics Configuration
    │   ├── haversine_dbscan_params.json# Hotspot Clustering Parameters & HDI Metric
    │   └── ollama_service_config.json  # Local Ollama LLM Bridge Configuration
    └── schemas/                        # Canonical JSON Validation Schemas
        ├── training_sample_schema.json # 14-Param Sensor Training Sample Contract
        └── hotspot_report_schema.json  # EOC Hotspot Incident Intelligence Schema
```

---

## 2. Quick-Start Guide

### How to Run the Desktop AI App
1. Navigate to [`apps/new_ai_applications/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/new_ai_applications/).
2. Double-click [`Launch_Desktop_App.bat`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/new_ai_applications/Launch_Desktop_App.bat).
3. The application will launch in Microsoft Edge App Mode at `http://127.0.0.1:8080`.
4. AI REST Endpoints are immediately live:
   - `GET http://127.0.0.1:8080/api/ai/hotspots`
   - `GET http://127.0.0.1:8080/api/ai/report`

### How to Install the Mobile AI App
1. **Direct Install (Ready APK)**:  
   Copy [`apps/new_ai_applications/mobile_ai_app/prebuilt_apk/RAMS_Mobile_AI_v2.5.apk`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/new_ai_applications/mobile_ai_app/prebuilt_apk/RAMS_Mobile_AI_v2.5.apk) to your phone and install.
2. **1-Click USB ADB Deploy**:  
   Plug your Android phone into the PC via USB with USB Debugging enabled, then double-click [`apps/new_ai_applications/mobile_ai_app/Build_And_Install_To_Phone.bat`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/new_ai_applications/mobile_ai_app/Build_And_Install_To_Phone.bat).

### How to Rebuild Both Applications
1. Double-click [`apps/new_ai_applications/Build_All_Apps.bat`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/new_ai_applications/Build_All_Apps.bat).
2. The script compiles both the C# executable and the Android APK automatically.

---

## 3. Integrated AI Features Overview

| Subsystem | AI Technology | Operational Role | Offline Capability |
|---|---|---|---|
| **Mobile App (Tier 1)** | LiteRT 1D-CNN (<5MB RAM) | 50Hz sensor classification; suppresses bumps, potholes, and dropped phones | 100% Offline |
| **Mobile App (Tier 2)** | SmolLM2-135M / Qwen2.5-0.5B | Clinical diagnostic verification & automated emergency SMS generation | 100% Offline |
| **Mobile App Voice** | Sherpa-ONNX KWS (<15MB RAM) | Hands-free "RAMS Stop" / "Cancel Alarm" false alarm abort | 100% Offline |
| **Mobile App Training** | Developer Simulation Suite | 50Hz maneuver logger, ground-truth tagging, export to JSON | 100% Offline |
| **Desktop Hotspots** | Haversine DBSCAN | Spatial accident cluster analysis & Hotspot Danger Index calculation | 100% Offline |
| **Desktop Intelligence** | Local LLM (Llama-3.2-3B) | Automated EOC municipal incident intelligence briefs | 100% Offline |

