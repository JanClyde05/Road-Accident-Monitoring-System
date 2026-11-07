# RAMS Next-Generation AI Rework Architecture & Implementation Plan

**Road Accident Monitoring System (RAMS)**  
*Project Domain: Embedded Systems, Edge AI, Mobile Telemetry & Emergency Command Operations*  
*Target Competition: IECEP Nationals — AI Integration Track*  
*Standard: Strict Zero-Emoji Technical Architecture Specification*

---

## 1. Executive Summary & IECEP Nationals Mandate

The **Road Accident Monitoring System (RAMS)** is a multi-tier safety platform designed to reduce emergency response times for motorcycle and bicycle riders involved in severe road traffic incidents across Philippine urban and rural corridors.

In accordance with the **IECEP Nationals AI Integration** guidelines, this rework plan details the architectural blueprint and concrete software modules required to transform RAMS from a heuristic-threshold platform into an intelligent, data-driven, adaptive edge-AI safety ecosystem:

1. **On-Device Offline Edge AI (Mobile App)**: Low-RAM, sub-second inference engine capable of running completely offline on standard Android smartphones to accurately classify real road accidents vs false positives (potholes, speed bumps, dropped phones, running/walking).
2. **Offline Custom Wake-Word Voice Control ("RAMS, Cancel Alarm")**: Hands-free false alarm suppression allowing injured or startled riders wearing gloves to abort accidental alerts via local, offline keyword spotting.
3. **In-App Developer Training & Real-World Simulation Mode**: An integrated field testing suite allowing developers and riders to simulate maneuvers, capture real-time 50Hz IMU vectors, apply ground-truth labels (Accident vs False Alarm), and directly calibrate the AI engine using schemas standardized with `imu_studio_app`.
4. **Desktop Command Center AI (Hotspot Prediction & Automated Incident Reporting)**: A localized spatial clustering and LLM analytics suite in the Windows Emergency Operations Center app that analyzes historical LoRa/cloud telemetry, identifies emerging accident blackspots, and drafts structured rescue reports.

---

## 2. Master System AI Architecture

```
+─────────────────────────────────────────────────────────────────────────────+
|                        RAMS RIDER MOBILE APPLICATION                        |
|                                                                             |
|  [Hardware Sensors]     [Wearable BLE Sync]     [Microphone (Gated)]        |
|   50Hz Accel/Gyro        MPU-6050 Telemetry       Offline Audio Stream      |
|          │                       │                         │                |
|          ▼                       ▼                         ▼                |
|  ┌────────────────────────────────────────┐     ┌────────────────────────┐  |
|  |     Sliding Window Feature Extractor   |     |   Sherpa-ONNX Engine   |  |
|  |  (14-Param Canonical FeatureVector)    |     |  Keyword Spotting (KWS)|  |
|  └───────────────────┬────────────────────┘     |   "RAMS Stop/Cancel"   |  |
|                      │                          └───────────┬────────────┘  |
|                      ▼                                      │               |
|  ┌────────────────────────────────────────┐                 │               |
|  |  TIER 1: LiteRT / ONNX 1D-CNN (<5MB)   |                 │               |
|  |  Sub-5ms Fall/Crash/ADL Classifier     |                 │               |
|  └───────────────────┬────────────────────┘                 │               |
|                      │                                      │               |
|            [Crash Triggered > 90%]                          │               |
|                      │                                      │               |
|                      ▼                                      ▼               |
|  ┌────────────────────────────────────────┐     ┌────────────────────────┐  |
|  |  10-Second Countdown Alarm Screen      |<────| Voice Alarm Canceler   |  |
|  |  NeoPixel Flash + Audio Siren          |     | (Instant False Abort)  |  |
|  └───────────────────┬────────────────────┘     └────────────────────────┘  |
|                      │                                                      |
|           [If Not Cancelled in 10s]                                         |
|                      │                                                      |
|                      ▼                                                      |
|  ┌────────────────────────────────────────┐                                 |
|  |  TIER 2: On-Device SLM (SmolLM2 / Qwen)|                                 |
|  |  Clinical Severity & Dispatch Explainer|                                 |
|  └───────────────────┬────────────────────┘                                 |
|                      │                                                      |
|                      ▼                                                      |
|  [Emergency Uplink: SX1278 LoRa Uplink + Cellular SMS + Cloud Dispatch]    |
+──────────────────────┼──────────────────────────────────────────────────────+
                       │ LoRa / Serial / TCP Feed
                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                     RAMS DESKTOP COMMAND CENTER APP                         |
|                                                                             |
|  [Incoming LoRa Packet Ingestion] ────> [incidents.json Local Database]     |
|                                                     │                       |
|                                                     ▼                       |
|  ┌───────────────────────────────────────────────────────────────────────┐  |
|  |           SPATIAL ACCIDENT HOTSPOT PREDICTION ENGINE (C#)             |  |
|  |  - Haversine DBSCAN Spatial Clustering                                |  |
|  |  - Kernel Density Estimation (KDE) Risk Corridors                     |  |
|  |  - Peak G / Velocity Severity Stratification                          |  |
|  └──────────────────────────────────┬────────────────────────────────────┘  |
|                                     │                                       |
|                                     ▼                                       |
|  ┌───────────────────────────────────────────────────────────────────────┐  |
|  |           COMMAND CENTER LOCAL LLM ANALYST (Ollama / ONNX)            |  |
|  |  - Llama-3.2-3B-Instruct / Qwen2.5-3B-Instruct (INT4 Quantized)       |  |
|  |  - Generates Executive Incident Safety Summaries                      |  |
|  |  - CDRRMO / PNP Highway Patrol Group Dispatch Documentation           |  |
|  └───────────────────────────────────────────────────────────────────────┘  |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 3. Directory Layout & Module Index

All planned reworked components are isolated in this dedicated directory structure:

```
d:\Antigravity\Projects\Danger Monitoring System V2\apps\planned_rework\
├── README.md                           # Master Architecture & Roadmap (This file)
├── MISTAKES_AND_FIXES_LOG.md           # Engineering Guardrails & Learned Mistakes Registry
│
├── ai_models_research/                 # Model Benchmarking & Feasibility Studies
│   ├── MOBILE_EDGE_AI_SPEC.md          # On-device Edge SLM/TinyML Comparative Evaluation
│   ├── VOICE_WAKEWORD_SPEC.md          # Offline Sherpa-ONNX "RAMS" Voice Cancellation Engine
│   └── DESKTOP_HOTSPOT_LLM_SPEC.md     # Desktop Hotspot Clustering & Local LLM Specification
│
├── mobile_rework/                      # Android Mobile App AI Implementation Modules
│   ├── SensorAiInferenceEngine.kt      # Dual-Tier TinyML + SLM Classifier Contract
│   ├── VoiceAlarmCanceler.kt           # Offline Custom Wake-Word Speech Listener
│   └── DeveloperTrainingSuite.kt       # In-App Real-World Simulation & Data Collection Mode
│
├── desktop_rework/                     # Desktop Rescuer Operations AI Modules
│   ├── HotspotPredictor.cs             # Spatial DBSCAN & Accident Density Clustering
│   └── DesktopAiReportGenerator.cs     # Local LLM Interface for Emergency Incident Reports
│
└── data_schemas/                       # Canonical Schemas & Contracts
    ├── training_sample_schema.json     # Standardized 14-Param IMU Training Sample Schema
    └── hotspot_report_schema.json      # Structured Output Schema for Hotspot Analysis
```

---

## 4. Key Subsystem Specifications

### 4.1. Mobile Edge AI (Dual-Tier Pipeline)
- **Problem**: Running an LLM directly on 50Hz raw IMU data requires 1,200+ tokens/sec, causing 3+ second latencies, thermal throttling, and battery collapse.
- **Solution**:
  - **Tier 1 (Sub-5ms TinyML)**: 1D-CNN or LightGBM running via **LiteRT** (formerly TensorFlow Lite) consuming under 5MB RAM. Continuously evaluates sliding 50-sample windows of the 14 standard RAMS features (`svmG`, `jerk`, `gyroMag`, `tiltDeltaDeg`, `energySvm`, `zeroCrossingRate`).
  - **Tier 2 (On-Demand SLM)**: **SmolLM2-135M** or **Qwen2.5-0.5B-Instruct** (quantized via INT4, RAM footprint 80MB-350MB). Activated *only* when Tier 1 detects an anomalous threshold or during countdown to generate structured incident diagnostics.

### 4.2. Voice-Activated Alarm Canceler ("Hey RAMS, Cancel Alarm")
- **Engine**: **Sherpa-ONNX** (Next-Gen Kaldi).
- **Properties**: 100% offline, zero network access required, Apache 2.0 license, memory footprint < 15MB.
- **Power Guardrail**: The microphone is strictly **IDLE** during standard riding. It only powers on for the 10-second duration of the false alarm countdown window, preventing battery drain and wind noise false triggers.

### 4.3. In-App Developer Training Suite
- **Features**:
  - In-app toggle: "Developer Training & Simulation Mode".
  - One-tap simulation recording (e.g., test ride, simulated phone drop, curb jump, sudden brake).
  - Immediate tagging UI: Positive (Accident: Crash, Skid, Impact) vs Negative (ADL: Phone Fall, Phone Shake, Normal Ride, Pothole).
  - Export to CSV/JSON matching `imu_studio_app` for continuous model training and validation.

### 4.4. Desktop Hotspot Predictor & Local LLM Dispatch Analyst
- **Spatial Engine**: Native C# implementation of DBSCAN spatial clustering using Haversine distance, identifying high-density accident clusters within Tuguegarao City road networks.
- **Local LLM**: **Llama-3.2-3B-Instruct** or **Qwen2.5-3B-Instruct** running via local Ollama instance (`http://127.0.0.1:11434`) or ONNX GenAI.
- **Output**: Generates formal incident intelligence logs for municipal rescue teams and infrastructure safety audits.

---

## 5. Verification & Testing Matrix

| Test ID | Subsystem | Validation Procedure | Success Criteria |
|---|---|---|---|
| **V-01** | Mobile Tier 1 AI | Replay test dataset through `SensorAiInferenceEngine` | False alarm rejection > 98%, inference latency < 10ms |
| **V-02** | Voice Wake-Word | Speak "RAMS Stop" under 70dB ambient engine/wind noise | Recognition within 400ms, false alarm aborted |
| **V-03** | Data Acquisition | Record 30-sec riding session in Developer Mode | File matches `training_sample_schema.json` exactly |
| **V-04** | Desktop Hotspot | Run DBSCAN on 50 simulated incidents across Tuguegarao | Correctly identifies clusters at known intersections |
| **V-05** | Desktop LLM | Generate incident report via Local LLM API | Valid markdown report produced in < 3.5s with zero hallucination |

