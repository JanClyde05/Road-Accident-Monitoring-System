# RAMS - Road Accident Monitoring System: System Architecture Guide

RAMS is a phone-assisted accident detection and LoRa dispatch system. The Android
application owns every inertial and GNSS sensor. The wearable is a BLE-to-LoRa
relay: it carries no IMU and no GPS receiver, and it does not run a motion
detection state machine of its own.

For the per-file index see [`DIRECTORY_MAP.md`](DIRECTORY_MAP.md). For module and
memory relationships see [`MEMORY_MAP.md`](MEMORY_MAP.md). For UI and
documentation style rules see [`DESIGN_RULES.md`](DESIGN_RULES.md).

---

## 1. How a Packet Is Produced

1. The phone registers `TYPE_ACCELEROMETER`, `TYPE_GYROSCOPE`, `TYPE_GRAVITY`,
   `TYPE_MAGNETIC_FIELD` and `TYPE_ROTATION_VECTOR` at `SENSOR_DELAY_GAME`
   (~50 Hz) and listens to the `GPS_PROVIDER`, `NETWORK_PROVIDER` and
   `PASSIVE_PROVIDER` location streams.
2. `SensorAiInferenceEngine` builds the 14-parameter kinematic window and decides
   whether the window is a crash, a pothole, a drop, or normal riding.
3. The phone writes JSON frames to the wearable over BLE Nordic UART Service
   (`6E400001-B5A3-F393-E0A9-E50E24DCCA9E`, write characteristic
   `6E400002-...`, notify characteristic `6E400003-...`).
4. The wearable stores the latest fix, raises or clears its alert state, sounds
   the buzzer, renders the NeoPixel status, and transmits the packed struct over
   the SX1278 at 433 MHz.
5. The base station receiver decodes the packet and forwards it over USB serial
   (`RAMS_PKT:...`) and over the local Wi-Fi TCP/HTTP bridge.
6. The Windows rescuer application ingests the serial or LAN stream, triages the
   incident, and drives the radar map and the klaxon.

Nothing in that chain requires the wearable to sense motion. Its only inputs are
BLE frames, the physical button, and its own battery divider.

---

## 2. System Generation Comparison

| Dimension | Generation 1: OG hardware baseline (retired) | Generation 2: Phone-assisted relay (current) |
| :--- | :--- | :--- |
| **Motion sensor** | Dedicated MPU-6050 I2C breakout on the wearable | Android `SensorManager` accel/gyro/gravity/mag/rotation-vector at ~50 Hz |
| **Location sensor** | ATGM336H GPS breakout on the wearable | Android `LocationManager` GPS + network + passive providers |
| **Detection logic** | On-wearable 100 Hz FSM in `sensors.cpp` and `gps.cpp` | On-phone feature extractor plus LiteRT 1D-CNN classifier |
| **Wearable payload** | IMU, GPS, LoRa, buzzer, NeoPixel, charging | LoRa, buzzer, NeoPixel, charging, battery divider |
| **Rider interface** | SoftAP captive portal at `192.168.4.1` | Native Android Jetpack Compose application |
| **Rescuer interface** | Netlify cloud dashboard | Standalone Windows executable (`RAMS_Rescuer_Desktop.exe`) |
| **LoRa ingestion** | Cloud Netlify function (`/api/upload`) | Local LAN POST plus direct USB serial |
| **BOM cost** | High (MCU + GPS + IMU + battery + charging) | Low (ESP32-S3 board + SX1278 module + battery + charging) |

Generation 1 artifacts are preserved for the record under `archive/` and
`prototypes/`. They describe hardware that is no longer built. Do not treat a
Generation 1 file, or a document derived from one, as a description of the
current system.

The one surviving MPU-6050 in the repository is
[`firmware/data_logger_standalone/`](firmware/data_logger_standalone/), a separate
serial data-collection rig used to record training data. It is not part of the
wearable and it is not flashed to the relay board.

---

## 3. Repository Layout

```
Road Accident Monitoring System/
|
+-- AGENTS.md                       Operating rules for human and AI contributors
+-- DIRECTORY_MAP.md                Master navigation and per-file index
+-- 00_SYSTEM_ARCHITECTURE.md       This document
+-- MEMORY_MAP.md                   Technical memory map and module graph
+-- DESIGN_RULES.md                 UI/UX design system and zero-emoji rules
|
+-- .agents/                        Machine-checked rules and shared skills
+-- AI Skills/                      Portable copy of the agent skill definitions
|
+-- firmware/
|   +-- wearable_withApp/           ESP32-S3 relay: BLE NUS, LoRa TX, buzzer, NeoPixel
|   +-- receiver_withDesktop/       Base station: LoRa RX, USB serial, LAN bridge
|   +-- shared/                     protocol.h packet structs and shared helpers
|   +-- data_logger_standalone/     Separate MPU-6050 training-data rig
|
+-- apps/
|   +-- android_app/                Native Android app: sensors, GNSS, edge AI, BLE
|   +-- desktop_app/                Windows rescuer station (C# server + web UI)
|   +-- backend/                    Netlify serverless mirror and public map
|   +-- imu_studio_app/             Standalone IMU calibration and capture app
|   +-- new_ai_applications/        Model assets, datasets, desktop AI twin
|   +-- planned_rework/             Unimplemented design notes
|   +-- *.bat                       Build and launch wrappers
|
+-- hardware/KiCAD Files/
|   +-- Antigravity Build/RAMS - PCB - Rev C/   Current EPDC-compliant board
|   +-- Antigravity Build/RAMS - PCB/           Rev A JLCPCB baseline
|   +-- Antigravity Build/RAMS - PCB - Rev B/   Superseded revision
|   +-- Antigravity Build/RAMS Wearable - PCB/  Wearable carrier board
|   +-- Antigravity Build/Receiver - PCB/       Base station board
|   +-- Claude Build/ DeepSeek Build/ GPT6 Astra Build/ PCB Gemma4 Build/ Manual Build/
|
+-- docs/
|   +-- agent/                      Execution plans, incident ledger, lessons
|   +-- MD Files/                   Architecture notes, flowcharts, knowledge graph
|   +-- RAMS/                       Obsidian knowledge vault
|   +-- Datasheets/ Design Review/ For PCB Ordering - DOST/
|   +-- InnovateX Files/ Pictures/ Parts List I Currently Have/
|
+-- manufacturing/                  Fabrication outputs and artwork
+-- tools/                          Tooling installers, including tools/ai-tooling/
+-- scripts/verify/                 Invariant checks and build verification gates
+-- validation/                     Algorithm validators and battery/NeoPixel tests
+-- prototypes/                     Simulators and UI experiments
+-- archive/                        Preserved legacy clones and backups
+-- scratch/                        Disposable working files
+-- Working Code - Do Not Touch/    Frozen reference snapshots
```

---

## 4. Firmware Subsystems

| Folder | Entry point | Responsibility |
| :--- | :--- | :--- |
| `firmware/wearable_withApp/` | `wearable_withApp.ino` | BLE NUS peripheral, `gps.*` fix cache, `detection.*` alert state, `lora_tx.*` uplink, `battery.*` divider profiles, `buzzer.*`, `button.*`, `neopixel.*` |
| `firmware/receiver_withDesktop/` | `receiver_withDesktop.ino` | SX1278 receive loop, LittleFS store-and-forward queue, USB serial `RAMS_PKT:` output, Wi-Fi TCP/HTTP bridge |
| `firmware/shared/` | `protocol.h` | Packed RF structs, message types, shock flags, channel masks |

`firmware/wearable_withApp/gps.cpp` is a cache, not a parser: `gpsSetExternalLocation()`
is called from the BLE path and `gpsUpdate()` is intentionally empty.
`firmware/wearable_withApp/detection.cpp` is likewise a state holder:
`detectionTriggerAlert()` is called when the phone reports a crash.

---

## 5. Application Subsystems

| Folder | Technology | Responsibility |
| :--- | :--- | :--- |
| `apps/android_app/` | Kotlin, Jetpack Compose, LiteRT | Sensor capture, GNSS, 14-feature extraction, 1D-CNN classification, BLE NUS client, offline voice assistant, foreground service |
| `apps/desktop_app/` | C# .NET, WebView2, React | Embedded HTTP server, serial auto-detect, incident triage, radar map, hotspot prediction |
| `apps/backend/` | React, Leaflet, Netlify | Public dispatch map and cloud relay |
| `apps/imu_studio_app/` | Kotlin, Android | Standalone IMU streaming and calibration utility |
| `apps/new_ai_applications/` | Mixed | Model artifacts, benchmark datasets, desktop AI twin |

The canonical Android tree is `apps/android_app/`. The canonical desktop tree is
`apps/desktop_app/`, wrapped by `apps/Launch_Desktop_Rescuer.bat`.

---

## 6. Quick Launch

| Task | Command or file |
| :--- | :--- |
| Launch desktop rescuer app | `apps\Launch_Desktop_Rescuer.bat` |
| Build and install Android app via USB | `apps\Build_And_Install_Android_App.bat` |
| Build Android APK only | `apps\Build_Android_APK.bat` |
| Preview mobile app in a browser | `apps\Preview_Mobile_App_Web.bat` or `preview_mobile_app.bat` |
| Compile desktop executable | `apps\desktop_app\build_exe.bat` |
| Flash wearable firmware | Open `firmware\wearable_withApp\wearable_withApp.ino` in Arduino IDE |
| Flash receiver firmware | Open `firmware\receiver_withDesktop\receiver_withDesktop.ino` in Arduino IDE |
| Open current wearable PCB | `hardware\KiCAD Files\Antigravity Build\RAMS - PCB - Rev C\RAMS - PCB.kicad_pro` |
| Inspect JLCPCB order package | `hardware\KiCAD Files\Antigravity Build\RAMS - PCB\JLCPCB_ORDER_PACKAGE\` |
| Run automated routing pipeline | `python "hardware\KiCAD Files\Antigravity Build\RAMS - PCB\scripts\auto_route_pipeline.py"` |
| Run rescuer web dev server | `npm run dev` inside `apps\backend\` |
| Run invariant and build gates | `python scripts\verify\check_invariants.py` then `powershell scripts\verify\verify_all.ps1 -Build all` |

---

## 7. Documentation Map

| Document | Purpose |
| :--- | :--- |
| [`DIRECTORY_MAP.md`](DIRECTORY_MAP.md) | Complete file and subsystem index |
| [`MEMORY_MAP.md`](MEMORY_MAP.md) | Technical memory map and module relationships |
| [`docs/agent/README.md`](docs/agent/README.md) | Agent document router and current handoff |
| [`docs/agent/EXECUTION_PLAN.md`](docs/agent/EXECUTION_PLAN.md) | Software execution plan and commit sequence |
| [`docs/agent/HARDWARE_REVISION_PLAN.md`](docs/agent/HARDWARE_REVISION_PLAN.md) | Laser-etched single-sided board revision |
| [`docs/agent/INCIDENT_LEDGER.md`](docs/agent/INCIDENT_LEDGER.md) | Defect ledger with invariant mapping |
| [`docs/agent/LESSONS.md`](docs/agent/LESSONS.md) | Defect classes and the rules they produced |

Documents under `docs/MD Files/`, `archive/`, `prototypes/` and the hardware
build folders are historical records of earlier revisions. They are kept for
traceability and are not updated when the live system changes.
