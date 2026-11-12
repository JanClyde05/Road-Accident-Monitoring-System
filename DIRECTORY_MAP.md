# RAMS Master Directory Map & Navigation Index

**Road Accident Monitoring System (RAMS)**  
*Last Updated: 2026-10-30*  

This document serves as the primary navigation index for the entire project workspace. All subsystems, applications, firmware, hardware CAD files, and documentation have been organized into 6 clear functional domains.

---

## Workspace Directory Tree Overview

```
d:\Antigravity\Projects\Danger Monitoring System V2\
├── firmware/                       # Embedded C/C++ firmware & shared headers
│   ├── wearable_withApp/           # ESP32-S3 Wearable Sensor Unit
│   ├── receiver_withDesktop/       # ESP32 LoRa Base Station Receiver
│   ├── data_logger_standalone/     # ESP32 IMU WebSocket Streamer
│   └── shared/                     # Shared protocol.h packet definitions
│
├── apps/                           # User applications (Mobile, Desktop, Cloud)
│   ├── new_ai_applications/        # Dedicated Standalone AI Applications Suite (Mobile & Desktop)
│   ├── android_app/                # Native Android Kotlin App (Jetpack Compose)
│   ├── desktop_app/                # Windows Rescuer Operations Desktop App (C# / .NET)
│   ├── backend/                    # Netlify Serverless Backend & Live Web Map
│   ├── imu_studio_app/             # Dedicated Android IMU Calibration/Streamer Tool
│   ├── planned_rework/             # Next-Gen AI Integration Rework (IECEP Nationals Track)
│   ├── Build_And_Install_Android_App.bat
│   ├── Launch_Desktop_Rescuer.bat
│   └── Preview_Mobile_App_Web.bat
│
├── hardware/                       # Schematics, PCB layouts & manufacturing
│   └── KiCAD Files/                # KiCad 10 CAD files (Rev A, Rev B, Rev C EPDC)
│
├── docs/                           # Documentation, Obsidian vault & media assets
│   ├── MD Files/                   # System specifications, memory maps & flowcharts
│   ├── RAMS/                       # Obsidian Knowledge Vault (.obsidian, MDF)
│   ├── Pictures/                   # Hardware photos, architecture diagrams & screenshots
│   ├── For PCB Ordering - DOST/    # DOST-ASTI EPDC manufacturing specs, brochures & inquiry
│   └── Parts List I Currently Have/# Component inventory & Shopee purchase breakdown
│
├── prototypes/                     # UI redesigns, simulators & web experiments
│   ├── AI Studio/                  # Google AI Studio export & WearablePortalSimulator
│   └── UI Redesign/                # Modern React/Vite UI Redesign workspace
│
├── archive/                        # Legacy duplicates, stubs & original backups
│   ├── Mobile App/                 # Unbuilt clone of android_app
│   ├── RAMS IMU Studio Application/# Duplicate of imu_studio_app (with zip)
│   ├── receiver/                   # Legacy redirect stub
│   ├── wearable/                   # Legacy redirect stub
│   └── Working Code - Do Not Touch/# Initial GitHub repo archive zip
│
├── validation/                     # Verification scripts & data analysis
│   └── validate_fsm.py             # Empirical Fall/Crash Detection State Machine Validator
│
├── AI Skills/                      # Domain AI skills for PCB design and system workflows
│   └── pcb-design-astra/           # Astra methodology PCB design protocol & validation matrix
│
├── .agents/                        # AI pair programmer persistent rules and skills
│   └── skills/
│       ├── pcb-design-astra/       # Active Astra PCB design skill
│       └── ponytail/               # Ponytail token-optimization skill
├── DIRECTORY_MAP.md                # THIS FILE — Master navigation guide
├── 00_SYSTEM_ARCHITECTURE.md       # Master system architecture & data flow
├── MEMORY_MAP.md                   # Complete system memory map & cross-subsystem anchors
├── DESIGN_RULES.md                 # Zero-emoji UI design guidelines & tokens
├── README.md                       # Main repository overview
├── preview_mobile_app.bat          # 1-click launcher for web preview (port 3000)
└── open_flowcharts.bat             # 1-click launcher for graphical flowchart viewer
```

---

## 1. Embedded Firmware (`firmware/`)

Contains all microcontroller source code written for ESP32 and ESP32-S3 boards.

| Directory | Target Hardware | Description | Key Entry Point |
|---|---|---|---|
| [`firmware/wearable_withApp/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/wearable_withApp/) | ESP32-S3 (Wearable) | Wearable unit with MPU-6050 fall/crash detection FSM, ATGM336H GPS parsing, SX1278 LoRa uplink transmission, BLE GATT peripheral telemetry, WS2812B NeoPixel, and active buzzer. | [`wearable_withApp.ino`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/wearable_withApp/wearable_withApp.ino) |
| [`firmware/receiver_withDesktop/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/receiver_withDesktop/) | ESP32 (Base Station) | LoRa receiver station listening on 433MHz. Forwards emergency alerts to the desktop application over USB Serial (`RAMS_PKT:...`) and handles direct Wi-Fi HTTP cloud fallback uploads. | [`receiver_withDesktop.ino`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/receiver_withDesktop/receiver_withDesktop.ino) |
| [`firmware/data_logger_standalone/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/data_logger_standalone/) | ESP32-S3 | Standalone calibration and test logger. Streams raw 100Hz accelerometer and gyroscope vectors over WebSockets for threshold validation. | [`data_logger_standalone.ino`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/data_logger_standalone/data_logger_standalone.ino) |
| [`firmware/shared/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/shared/) | Common C Header | Shared packet protocol specification defining binary payload structs (`LoRaAlertPacket`, `TelemetryPacket`), alert bitmasks, and RF frequency channels. | [`protocol.h`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/firmware/shared/protocol.h) |

---

## 2. Software Applications (`apps/`)

Production-ready client, dashboard, and backend software.

| Subsystem | Tech Stack | Description | Directory |
|---|---|---|---|
| **AI Applications Suite** | Kotlin, C#, LiteRT, Sherpa-ONNX | Dedicated standalone suite containing both the AI Mobile App and AI Desktop Command Center with all needed AI resources and 1-click batch scripts. | [`apps/new_ai_applications/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/new_ai_applications/) |
| **Android Mobile App** | Kotlin, Jetpack Compose, Coroutines | Rider mobile app connecting to the wearable via BLE GATT. Displays live speed, heading, and battery status. Broadcasts GPS coordinates to the cloud backend and triggers automatic SMS/calls during an impact alert. | [`apps/android_app/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/android_app/) |
| **Rescuer Desktop App** | C# (.NET WinForms / WebView2), HTML/JS | Emergency operations center dashboard running on Windows. Reads USB Serial data from the receiver station, plays audible alerts, manages incidents, and plots emergency markers. | [`apps/desktop_app/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/desktop_app/) |
| **Cloud Backend & Map** | Vite, React 19, Leaflet, Netlify Functions | Cloud relay backend and public live dispatch map for tracking rider emergencies in real time across Tuguegarao City. | [`apps/backend/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/backend/) |
| **IMU Studio Mobile Tool** | Kotlin, Jetpack Compose | Specialized diagnostics tool for collecting raw sensor vectors and calibrating IMU sensor offsets. | [`apps/imu_studio_app/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/imu_studio_app/) |
| **Next-Gen AI Rework** | Kotlin, C#, LiteRT, SLM, Sherpa-ONNX | IECEP Nationals AI Integration modules: Dual-tier sensor AI, offline "RAMS" wake-word canceler, in-app developer training suite, and desktop hotspot predictor. | [`apps/planned_rework/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/planned_rework/) |

### Quick Launch Scripts in `apps/`
* [`auto_train_rams.bat`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/auto_train_rams.bat) — 1-Click automated edge AI training pipeline & APK re-baker (synthesizes 2,573 multimodal training entities in <1s).
* [`scripts/train_rams_ai.py`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/scripts/train_rams_ai.py) — Master multi-parameter AI training synthesizer (distilled Q&A, voice wake, 50Hz motion benchmarks).
* [`tools/launchers/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/tools/launchers/) — Dedicated folder containing OpenRouter model switchers (`switch_model.bat/.ps1`), Claude Code CLI wrappers (`claude-or.bat`), and local LLM/PCB assistance tools (`ask_glm.bat`, `ask_pcb.bat`, `start_local_glm_proxy.bat`).
* [`apps/Build_Android_APK.bat`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/Build_Android_APK.bat) — 1-Click compiler for Android APK (`app-debug.apk`) via Gradle.
* [`apps/Build_And_Install_Android_App.bat`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/Build_And_Install_Android_App.bat) — Builds and deploys the Android app to a connected phone over ADB.
* [`apps/Launch_Desktop_Rescuer.bat`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/Launch_Desktop_Rescuer.bat) — Compiles and runs the Rescuer Operations Desktop application.
* [`apps/Preview_Mobile_App_Web.bat`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/Preview_Mobile_App_Web.bat) — Launches the mobile app web preview environment.

---

## 3. Hardware CAD & PCB Design (`hardware/`)

All electronics engineering files, schematics, and manufacturing packages.

| Directory / File | Description |
|---|---|
| `hardware/KiCAD Files/GPT6 Astra Build/RAMS Wearable/` | **JLCPCB J2 routed engineering candidate, 2026-11-12:** bare S3, Ra-02, owned active9650, AP2112 3.3V LDO, ratio4 ADC and switched raw-supply2020RGB/translator. Zero native ERC/DRC/unconnected/parity findings; source-bound review package and staged stencils. NativePCB authoritative; initial generators guarded. Supplier/part-fit/process and physical validation remain open; no manufacturing release. DOST deferred. |
| [`hardware/KiCAD Files/Antigravity Build/RAMS - PCB - Rev C/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/hardware/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB%20-%20Rev%20C/) | **Active Production PCB:** DOST-ASTI EPDC compliant redesign. 2-layer, 42x32mm, 0.3mm min trace, 0.254mm clearance, 1.0mm round USB-C shell holes, corrected FS8205A SOT-23-6 pinout, DW01A protection, and Johanson 2450AT18B100E 3216 ceramic BLE antenna. |
| [`hardware/KiCAD Files/Antigravity Build/RAMS - PCB - Rev B/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/hardware/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB%20-%20Rev%20B/) | Intermediate revision draft (superseded by Rev C). |
| [`hardware/KiCAD Files/Antigravity Build/RAMS - PCB/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/hardware/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB/) | Rev A design (ordered JLCPCB board; documented in `PCB_REVIEW_2026-10-30.md`). |

---

## 4. Documentation & Knowledge (`docs/`)

Central documentation hub for architecture, memory layout, and design rationale.

| Folder | Contents |
|---|---|
| [`docs/MD Files/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/docs/MD%20Files/) | Detailed markdown specifications, state machine flowcharts, code documentation, and interactive flowchart viewer ([`RAMS_Flowchart_Viewer.html`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/docs/MD%20Files/RAMS_Flowchart_Viewer.html)). |
| [`docs/RAMS/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/docs/RAMS/) | Obsidian knowledge vault (`.obsidian/`, `MDF/`, `Welcome.md`). |
| [`docs/Pictures/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/docs/Pictures/) | Visual architecture diagrams, hardware photos, and PCB screenshots. |
| [`docs/For PCB Ordering - DOST/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/docs/For%20PCB%20Ordering%20-%20DOST/) | DOST-ASTI EPDC manufacturing rules, capability brochures, citizen's charter, and manufacturing inquiry form. |
| [`docs/Parts List I Currently Have/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/docs/Parts%20List%20I%20Currently%20Have/) | Shopee parts inventory, purchased component list (`product_list_expense_breakdown.md`), and printable HTML view. |

---

## 5. Prototypes & Web Simulators (`prototypes/`)

Experimental implementations, web showcases, and UI simulators.

| Directory | Purpose |
|---|---|
| [`prototypes/AI Studio/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/prototypes/AI%20Studio/) | AI Studio web prototypes and full-duplex wearable & receiver simulators (`WearablePortalSimulator.tsx`). |
| [`prototypes/UI Redesign/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/prototypes/UI%20Redesign/) | Modern web UI redesign workspace with Leaflet map markers and audio playback. |

---

## 6. AI Skills & Development Methodologies (`AI Skills/`, `.agents/skills/`)

Reusable agent skills and hardware design protocols.

| Skill / Protocol | Location | Purpose |
|---|---|---|
| **PCB Design Astra** | [`AI Skills/pcb-design-astra/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/AI%20Skills/pcb-design-astra/) & [`.agents/skills/pcb-design-astra/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/.agents/skills/pcb-design-astra/) | Astra PCB design methodology: evidence-based decision ledgers, validation matrices, programmatic KiCad layout generation, and DFM compliance. |
| **Ponytail** | [`.agents/skills/ponytail/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/.agents/skills/ponytail/) | Lazy senior developer token optimization ladder (YAGNI, reuse, stdlib first, concise diffs). |

---

## 7. Archive (`archive/`)

De-cluttered and preserved for reference. These directories are not part of active builds.

* [`archive/Mobile App/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/archive/Mobile%20App/) — Earlier unbuilt clone of `android_app`.
* [`archive/RAMS IMU Studio Application/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/archive/RAMS%20IMU%20Studio%20Application/) — Duplicate clone of `imu_studio_app` containing `rams-imu-studio.zip`.
* [`archive/receiver/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/archive/receiver/) — Legacy stub redirecting to `receiver_withDesktop`.
* [`archive/wearable/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/archive/wearable/) — Legacy stub redirecting to `wearable_withApp`.
* [`archive/Working Code - Do Not Touch/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/archive/Working%20Code%20-%20Do%20Not%20Touch/) — Original GitHub repository zip archive.

---

## 8. Master System Anchors

* Master Architecture: [`00_SYSTEM_ARCHITECTURE.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/00_SYSTEM_ARCHITECTURE.md)
* Master Memory Map: [`MEMORY_MAP.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/MEMORY_MAP.md)
* Zero-Emoji Design Rules: [`DESIGN_RULES.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/DESIGN_RULES.md)
* Agent Guidelines: [`AGENTS.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/AGENTS.md) & [`GEMINI.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/GEMINI.md)
