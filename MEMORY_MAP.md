---
system: Road Accident Monitoring System (RAMS)
version: 2.6
date: 2026-10-17
tags:
  - rams
  - road-safety
  - esp32-s3
  - lora-sx1278
  - ble-gatt
  - websocket-protocol
  - android-jetpack-compose
  - windows-desktop-exe
  - kicad10-pcb
  - auto-route-pipeline
  - obsidian-map
  - graphify-indexed
  - ponytail-optimized
  - icm-jake-van-clief
nodes_count: 72
status: Synchronized with Working Code, Schematic ERC Verified (0 Errors), PCB DRC Verified, and DIY SMT Procurement Matrix
design_system: Bold Typography & Minimalist (Zero-Emoji)
---

# RAMS Master System Memory Map & Graphify Knowledge Base

> **Obsidian Knowledge Graph & Graphify Machine Memory Index**  
> *This file serves as the definitive, zero-token-overhead architectural memory map of the entire RAMS codebase. Any AI agent or developer can navigate this system directly via Obsidian `[[wikilinks]]` without re-scanning files.*

---

## Master System Architecture & Modern Node Ecology

The repository encompasses an integrated hardware-software disaster & highway safety ecosystem:
- **Section 1: Working Code Baseline Snapshot (`Working Code - Do Not Touch/`)**: Golden reference archive preserving verified functional builds and data models.
- **Section 2: Phone-Assisted BLE Wearable Relay (`wearable_withApp/`)**: The ESP32-S3 wearable functions as an ultra-compact body-worn BLE-to-LoRa relay node. All 100Hz IMU fused kinematics, dual-band GNSS, and rider registration credentials originate on the companion smartphone (`android_app/`), streaming to the wearable over BLE GATT (`0xFFE0 / 0xFFE1`).
- **Section 3: Long-Range 433MHz LoRa Uplink**: The wearable broadcasts extended `RiderProfilePacket` (233 bytes) and crash `AlertPacket` payloads across kilometers over 433MHz SX1278 Ra-02 RF links directly to receiver base stations (`receiver_withDesktop/`), completely bypassing cellular network outages.
- **Section 4: Standalone Windows Rescuer Operations Center (`desktop_app/`)**: High-performance local command center with native C# host (`Program.cs`), embedded HTTP ingestion engine, borderless Microsoft Edge app-mode dashboard, persistent JSON storage, and full Google Drive 2x2 photo rendering.
- **Section 5: Ponytail Token Optimization System (`.agents/`)**: Enforces a 7-step senior developer Decision Ladder to prevent token bloat and over-engineering across all AI agent interactions.
- **Section 6: Hardware Engineering & Auto-Routing Pipeline (`KiCAD Files/Antigravity Build/RAMS - PCB/`)**: KiCad 10 production design with verified 0-error schematic ERC, 42.0x32.0mm 2-layer PCB layout with 0 DRC violations, Specctra DSN/SES Freerouting autoroute pipeline (`auto_route_pipeline.py`), and JLCPCB bare board + stencil DIY reflow matrix using Shopee PH components.

---

## 1. Master System Mermaid Visual Graph (Graphify Compatible)

```mermaid
graph TD
    %% Global Design & Rules System
    subgraph Design_System["[[DESIGN_RULES.md]]"]
        DR_ZERO["[[Strict Zero-Emoji Rule]]<br/>Custom SVG Glyphs Only"]
        DR_PIN["[[Custom Map Pin Architecture]]<br/>Teardrop + Animated Radar Ring"]
        DR_TYPO["[[Typography Scale]]<br/>Plus Jakarta Sans 900 + JetBrains Mono 700"]
    end

    %% Ponytail Token Optimization
    subgraph Ponytail_System["[[AGENTS.md]]"]
        PT_SKILL["[[.agents/skills/ponytail/SKILL.md]]<br/>Lazy Senior Dev Mode"]
        PT_RULE["[[.agents/rules/ponytail.md]]<br/>7-Step Decision Ladder"]
        PT_YAGNI["YAGNI & Shortest Diff Principle"]
    end

    %% Master Navigation & Logs Hub
    subgraph Navigation_Hub["[[00_SYSTEM_ARCHITECTURE.md]]"]
        NAV_GUIDE["[[00_SYSTEM_ARCHITECTURE.md]]<br/>System Architecture Guide"]
        NAV_APPS["[[apps/]]<br/>Quick-Launch Shortcut Hub"]
        NAV_LOG1["[[MD Files/2026-10-11_Memory_Sync.md]]<br/>Memory Mapping & Sync Log"]
        NAV_LOG0["[[MD Files/2026-10-03.md]]<br/>Baseline Release Snapshot Log"]
    end

    %% Shared Protocol Layer
    subgraph Shared_Protocol["[[shared/protocol.h]]"]
        PKT_ALERT["AlertPacket (26 Bytes)<br/>lat, lon, eventType, aMag"]
        PKT_TEL["TelemetryPacket (21 Bytes)<br/>lat, lon, battPct"]
        PKT_REG["RegisterPacket (133 Bytes)<br/>name, driveLinkConverted"]
        PKT_PROF["RiderProfilePacket (233 Bytes)<br/>name, plate, phone, blood, cat, emergName, emergPhone, vehicle, allergies, photoUrl"]
        PKT_FALSE["FalseAlarmPacket (21 Bytes)"]
    end

    %% Android App Subsystem (Phone Sensor & Profile Engine)
    subgraph Android_App["[[android_app/]] Companion Mobile Station"]
        A_MAIN["[[MainActivity.kt]]<br/>Jetpack Compose UI (4-Tab Layout)"]
        A_SENS["[[PhoneSensorEngine.kt]]<br/>100Hz IMU (2.5g Trigger, 2s Sticky Shock) + Dual-Band GNSS"]
        A_SYNC["[[Esp32SyncEngine.kt]]<br/>BLE GATT (240B Chunked Pacing) + WebSocket Server"]
        A_PROF["[[RiderProfile.kt]]<br/>Base62 Token + Google Drive 2x2 CDN Formatter"]
        A_LOGIN["[[RiderLoginDialog.kt]]<br/>Quick Rider Sync Dialog"]
        A_SETT["[[SettingsScreen.kt]]<br/>Medical Triage & Highway Category Setup"]
    end

    %% Wearable Relay Subsystem
    subgraph Wearable_System["[[wearable_withApp/wearable_withApp.ino]]"]
        W_BT["[[wearable_withApp/bt_service.cpp]]<br/>BLE GATT Server (FFE0/FFE1) + Throttled LoRa Broadcast"]
        W_NEO["[[wearable_withApp/neopixel.cpp]]<br/>RGB Status (Green: Armed, Red: Alert SOS)"]
        W_DET["[[wearable_withApp/detection.cpp]]<br/>Alert Latch & False-Alarm Cancellation FSM"]
        W_LORA["[[wearable_withApp/lora_tx.cpp]]<br/>SX1278 LoRa TX (433MHz, SF9, BW125k)"]
        W_BTN["[[wearable_withApp/button.cpp]]<br/>GPIO0 Hardware Debounce / False-Alarm Dismiss"]
    end

    %% Receiver Base Station Subsystem
    subgraph Receiver_System["[[receiver_withDesktop/receiver_withDesktop.ino]]"]
      R_LORA["[[receiver_withDesktop/lora_rx.cpp]]<br/>SX1278 LoRa RX (Backward-Compatible 101B/233B Deserializer)"]
      R_QUEUE["[[receiver_withDesktop/local_queue.cpp]]<br/>LittleFS Store-and-Retry Buffer"]
      R_HTTP["[[receiver_withDesktop/http_upload.cpp]]<br/>WiFi HTTPS POST to Cloud / LAN (Port 8888)"]
      R_SER["Serial USB Interface<br/>Standard JSON Stream (115200 Baud)"]
    end

    %% Standalone Desktop Rescuer Station
    subgraph Desktop_App["[[desktop_app/]] Rescuer Operations Center"]
        DT_EXE["[[RAMS_Rescuer_Desktop.exe]]<br/>Native Windows Host + app.ico Icon"]
        DT_CS["[[desktop_app/Program.cs]]<br/>Embedded HTTP Server + Serial Listener + Event Enricher"]
        DT_REG["[[desktop_app/registrations.json]]<br/>Persistent Rider & Photo Cache"]
        DT_INC["[[desktop_app/incidents.json]]<br/>Persistent Accident & Telemetry Database"]
        DT_WWW["[[desktop_app/www/]]<br/>Compiled React Frontend + Leaflet Radar Engine"]
    end

    %% Hardware Engineering & Auto-Routing Subsystem
    subgraph Hardware_PCB["[[KiCAD Files/Antigravity Build/RAMS - PCB/]] Hardware Architecture"]
        HW_SCH["[[RAMS - PCB.kicad_sch]]<br/>Verified Schematic (0 ERC Errors)<br/>LTH7R, DW01A/FS8205A, AP2112K-3.3"]
        HW_PCB["[[RAMS - PCB.kicad_pcb]]<br/>42.0x32.0mm 2-Layer Layout<br/>0 Shorting, 0 Clearance Violations"]
        HW_ROUTE["[[scripts/auto_route_pipeline.py]]<br/>Specctra DSN/SES Freerouting Pipeline<br/>0.15mm Traces, 0.3mm Vias, GND Mesh Stitching"]
        HW_FAB["[[JLCPCB_ORDER_PACKAGE/]]<br/>Gerber/BOM/CPL Turnkey Package<br/>Shopee PH DIY SMT Reflow Matrix"]
    end

    %% Interconnections & Data Flows
    A_SENS -->|100Hz Kinematics + GPS Vectors| A_SYNC
    A_PROF -->|Credentials, Medical Info & GDrive 2x2 Photo| A_SYNC
    A_SYNC -->|BLE GATT JSON Packets| W_BT
    
    W_BT -->|Injected GPS Coordinates| W_DET
    W_BT -->|Emergency Crash Packet| W_LORA
    W_BT -->|30s Throttled Profile Sync| W_LORA
    W_BTN -->|Cancel Event| W_DET
    W_DET -->|Alert / False-Alarm| W_LORA

    W_LORA -.->|433MHz LoRa Radio Transmission| R_LORA
    R_LORA -->|Serial Line JSON (LORA_ALERT, LORA_RIDER_PROFILE)| R_SER
    R_LORA -->|WiFi HTTP POST (Port 8888 Bridge)| R_HTTP

    R_SER -->|USB COM Port Ingestion| DT_CS
    R_HTTP -->|LAN Port 8888 Ingestion| DT_CS
    DT_CS -->|Cache Identity & GDrive CDN Photo| DT_REG
    DT_CS -->|Enrich Active Events with Full Rider Specs| DT_INC
    DT_INC -->|JSON Feed /api/events| DT_WWW
    DT_REG -->|JSON Feed /api/registrations| DT_WWW
    DT_WWW --> DT_EXE

    Design_System -.->|Style Standard| A_MAIN
    Design_System -.->|Style Standard| DT_WWW
    Ponytail_System -.->|Code Optimization| Android_App
    Ponytail_System -.->|Code Optimization| Desktop_App
    HW_ROUTE -->|Autoroutes Layout| HW_PCB
    HW_SCH -->|Netlist & Footprints| HW_PCB
    HW_PCB -.->|Physical Circuit Board Host| Wearable_System
    HW_FAB -.->|Bare PCB & Stencil Tooling| HW_PCB
```

---

## 2. Obsidian Wikilink Core Node Index

### Layer 1: Architecture, Navigation & Design Specifications
- **[[00_SYSTEM_ARCHITECTURE.md]]**: Master directory and architectural guide cleanly separating the OG Hardware Baseline and V2 Modern Apps Ecosystem.
- **[[apps/]]**: Quick-launch shortcuts directory containing `Launch_Desktop_Rescuer.bat`, `Build_And_Install_Android_App.bat`, and `README.md`.
- **[[DESIGN_RULES.md]]**: Master architectural UI/UX guidelines:
  - **Prime Directive**: Absolute prohibition of system emojis. Custom vector glyphs only.
  - **Custom Map Pin Design**: Teardrop SVG (`36px x 46px`) + context-colored radial drop shadow + animated expanding radar ring (`.pin-radar-ring`).
  - **Typography**: Plus Jakarta Sans 900 (Display) + JetBrains Mono 700 (Telemetry & Code).
  - **Color Palette**: Dark Slate `#09090b` (Canvas), `#121214` (Surface), `#18181b` (Elevated), `#27272a` (Hairline).
- **[[AGENTS.md]]**: Agent operating guidelines with Ponytail decision ladder rules.
- **[[MD Files/2026-10-11_Memory_Sync.md]]**: Memory sync log and working code validation report.
- **[[MD Files/2026-10-03.md]]**: Historical baseline release log.

### Layer 2: Shared Protocol Layer (`shared/`)
- **[[shared/protocol.h]]**: Single source of truth for all binary LoRa packet structures. Packed with `__attribute__((packed))`.
  - `AlertPacket` (26 bytes): `header` (13B), `latitude` (4B), `longitude` (4B), `eventType` (1B), `aMag` (4B).
  - `TelemetryPacket` (21 bytes): `header` (13B), `latitude` (4B), `longitude` (4B), `batteryPct` (1B).
  - `RiderProfilePacket` (233 bytes): Full identity, vehicle model, emergency contacts, medical triage, and Google Drive 2x2 CDN photo URL.
  - `RegisterPacket` (133 bytes): User name and 96-byte direct photo URL for backward compatibility.
  - `FalseAlarmPacket` (21 bytes): Incident dismissal packet.

### Layer 3: Wearable Sensor & Relay Node (`wearable_withApp/`)
- **[[wearable_withApp/wearable_withApp.ino]]**: Main setup and 100Hz acquisition loop.
- **[[wearable_withApp/bt_service.h]]** & **[[wearable_withApp/bt_service.cpp]]**: ESP32 BLE GATT service (`0xFFE0 / 0xFFE1`). Receives phone telemetry, parses JSON, injects GPS coordinates, and triggers throttled 30s LoRa profile sync.
- **[[wearable_withApp/neopixel.h]]** & **[[wearable_withApp/neopixel.cpp]]**: WS2812B NeoPixel state machine: Blue (Connecting), Green (Armed & Connected), Red (SOS Crash Alert), Amber (Warning/Error).
- **[[wearable_withApp/detection.h]]** & **[[wearable_withApp/detection.cpp]]**: Alert state latch and cancellation FSM.
- **[[wearable_withApp/lora_tx.h]]** & **[[wearable_withApp/lora_tx.cpp]]**: SX1278 LoRa radio transmitter (433MHz, SF9, BW125kHz, CR4/5).
- **[[wearable_withApp/button.h]]** & **[[wearable_withApp/button.cpp]]**: GPIO0 hardware button handler for false-alarm cancellation.

### Layer 4: Receiver Base Station (`receiver_withDesktop/`)
- **[[receiver_withDesktop/receiver_withDesktop.ino]]**: Main receiver loop servicing LoRa RX and processing upload retry queues.
- **[[receiver_withDesktop/lora_rx.h]]** & **[[receiver_withDesktop/lora_rx.cpp]]**: Continuous LoRa packet listening. Implements backward-compatible decoding for both legacy 101-byte and extended 233-byte `RiderProfilePacket` payloads. Emits standard JSON lines over USB Serial (`115200` baud).
- **[[receiver_withDesktop/config.h]]**: Configuration parameters including default `BACKEND_URL` (`http://175.16.3.157:8888`).
- **[[receiver_withDesktop/http_upload.h]]** & **[[receiver_withDesktop/http_upload.cpp]]**: Cloud/LAN HTTP upload engine.
- **[[receiver_withDesktop/local_queue.h]]** & **[[receiver_withDesktop/local_queue.cpp]]**: LittleFS store-and-retry buffer for offline network resilience.

### Layer 5: Android Mobile Companion Station (`android_app/`)
- **[[android_app/app/src/main/java/com/example/MainActivity.kt]]**: Master Jetpack Compose Activity with 4-tab `NavigationBar` (`TELEMETRY`, `MAP`, `WEARABLE`, `SETTINGS`) and monochrome high-contrast dark theme.
- **[[android_app/app/src/main/java/com/example/sensor/PhoneSensorEngine.kt]]**: Smartphone 100Hz fused IMU with dynamic crash threshold tuning (`dynamicCrashThresholdG`), 2s sticky shock latch, and multi-provider GPS engine (500ms / 0m).
- **[[android_app/app/src/main/java/com/example/sensor/ImuCalibrationManager.kt]]**: Automated calibration engine calculating data-driven crash thresholds and ADL shake rejection filters from IMU Studio CSV exports.
- **[[android_app/app/src/main/java/com/example/export/CsvExportManager.kt]]**: Dual EXPORT and IMPORT telemetry manager supporting column auto-detection, preview, and dataset merging.
- **[[android_app/app/src/main/java/com/example/ui/components/CsvExportDialog.kt]]**: Monochromatic CSV management dialog with dual EXPORT / IMPORT tabs and live IMU calibration status indicators.
- **[[android_app/app/src/main/java/com/example/sync/Esp32SyncEngine.kt]]**: BLE GATT client with 20-240B MTU chunked transmission and 12ms packet pacing.
- **[[android_app/app/src/main/java/com/example/model/RiderProfile.kt]]**: Base62 friendly token generator (`RAMS-XXXXXXXX`) and Google Drive direct CDN URL converter (`formatDirectDriveUrl`).
- **[[android_app/app/src/main/java/com/example/ui/components/RiderLoginDialog.kt]]**: Rapid rider registration & device synchronization dialog.
- **[[android_app/app/src/main/java/com/example/ui/screens/WearableScreen.kt]]**: BLE scanning, RSSI telemetry, manual LoRa test triggers, false alarm cancellation, and connection state management.
- **[[android_app/app/src/main/java/com/example/ui/screens/SettingsScreen.kt]]**: Complete rider profile settings with medical triage and vehicle credentials.
- **[[android_app/build_and_install.bat]]**: Automated Gradle compilation and ADB USB deployment tool.

### Layer 6: RAMS IMU Studio Application (`RAMS IMU Studio Application/`)
- **[[RAMS IMU Studio Application/app/]]**: Standalone high-rate inertial analysis and calibration suite.
- **[[RAMS IMU Studio Application/build_and_install.bat]]**: Automated ADB probe, APK compilation, and device launch script.
- **Real-Time 100Hz IMU Waveform Monitor**: High-fidelity sparklines for 3-axis accelerometer, gyroscope, tilt angles, and resultant acceleration magnitude.
- **Accident vs. ADL Correlation Studio**: Statistical feature extraction and classification rule derivation.
- **Processed CSV & Calibration Rules Engine**: Exports filtered CSV and JSON thresholds directly ingested by `android_app/` for false alarm cancellation.

### Layer 7: Standalone Desktop Rescuer Command Center (`desktop_app/`)
- **[[desktop_app/RAMS_Rescuer_Desktop.exe]]**: Native Windows host application with embedded `app.ico` icon, launching Edge in `--start-fullscreen` borderless mode.
- **[[desktop_app/Program.cs]]**: Multi-threaded C# server with serial COM port listener, dynamic port binding (port 8888), Google Drive CDN converter (`ConvertGoogleDriveUrl`), and incident auto-enrichment engine.
- **[[desktop_app/build_exe.bat]]**: Native C# compilation script using Microsoft .NET Framework `csc.exe`.
- **[[desktop_app/launch_desktop.bat]]**: One-click desktop launcher.
- **[[desktop_app/registrations.json]]**: Local persistent database of registered rider credentials and photos.
- **[[desktop_app/incidents.json]]**: Persistent incident and telemetry log with status tracking (including `FALSE ALARM` and `RESCUED` states).
- **[[desktop_app/www/]]**: High-performance React 19 + Vite dashboard featuring Leaflet maps, animated radar pins, accident cards with `referrerPolicy="no-referrer"` Google Drive photo loading, and comprehensive emergency triage inspection modals.

### Layer 8: Hardware Engineering, Auto-Routing & DIY SMT Assembly (`KiCAD Files/Antigravity Build/RAMS - PCB/`)
- **[[KiCAD Files/Antigravity Build/RAMS - PCB/RAMS - PCB.kicad_sch]]**: Verified production schematic (0 Errors, 4 benign lib_mismatch warnings). Key subsystems:
  - `U3` (`LTH7R` / TP4054): Li-Ion charger with $4.02	ext{ k}\Omega$ resistor ($249	ext{ mA}$ charge current).
  - Power Path: `Q1` (AO3401A P-FET) + `D2` (SS14W SOD-123FL Schottky) automatic USB/Battery multiplexer.
  - Soft Power Switch: `SW1` (MSK12C02) switching the Enable pin of `U5` (AP2112K-3.3 600mA LDO).
  - Battery Protection: `U4` (DW01A) + `Q3` (FS8205A TSSOP-8 dual N-FET) low-side protection.
  - Battery Sensing: Precision resistor divider `R14` ($330	ext{ k}\Omega$) + `R15` ($180	ext{ k}\Omega$) with $0.1\ \mu	ext{F}$ filter.
  - Peripheral Alert Drivers: Piezo buzzer `BZ1` driven by `Q2` (BC817) with `D3` (1N4148W flyback), `LED1` (SK6805-EC20 2020 RGB).
- **[[KiCAD Files/Antigravity Build/RAMS - PCB/RAMS - PCB.kicad_pcb]]**: 42.0 mm x 32.0 mm 2-layer wearable PCB layout:
  - Complete connectivity: 453 track segments, 46 vias (0.3mm drill), 0 shorting items, 0 clearance errors.
  - RF Layout: Johanson 2450AT18 ceramic chip antenna with <10mm 45-degree microstrip feed, pi-matching network, and dual-layer ground keepout.
  - Ra-02 LoRa transceiver mounted on bottom copper with dedicated FB1 LC filtering and solid ground reference.
- **[[KiCAD Files/Antigravity Build/RAMS - PCB/scripts/auto_route_pipeline.py]]**: Headless autoroute and post-processing pipeline:
  - Placement corridor optimization (C12, C13, C14 shifted to X=108.80mm; R15/C29 rotated 180°).
  - Specctra DSN export, automated Freerouting v2.4.1 execution, and SES import.
  - Ground mesh stitching with 10 dedicated GND vias and perimeter shielding vias.
  - Zone refill and automated KiCad CLI DRC verification.
- **[[KiCAD Files/Antigravity Build/RAMS - PCB/JLCPCB_ORDER_PACKAGE/]]**: Turnkey production & procurement resources:
  - Bare PCB + Stainless Steel Stencil ordering package (~$15 total from JLCPCB).
  - `PARTS_LIST_FOR_ORDERING.md`: Sourcing matrix for Shopee Philippines.
  - Critical Footprint Matches: `FS8205A` (TSSOP-8), `SS14W` (SOD-123FL), `2450AT18B100E` (3216 / 1206), `FB1` (`MGGB1005M800HT-LF` 0402 200mA).
  - DIY SMT Reflow Protocol: Mechanic IX5 Ultra preheater ($150^\circ	ext{C}$ soak $ightarrow$ $205^\circ	ext{C}$ reflow) + Relife RL-403 ($183^\circ	ext{C}$ Sn63Pb37 leaded paste).

---

## 3. AI Agent Fast Query Index (Zero-Scan Reference)

| Developer Question | Authoritative File Target | Key Function / Symbol |
| :--- | :--- | :--- |
| **Where is the Google Drive 2x2 URL converted?** | [[desktop_app/Program.cs]] & [[android_app/.../RiderProfile.kt]] | `ConvertGoogleDriveUrl()`, `formatDirectDriveUrl()` |
| **Why must `referrerPolicy="no-referrer"` be used?** | [[desktop_app/www/]] & [[UI Redesign/.../RAMSEventSidebar.tsx]] | Prevents Google Drive CDN 403 Forbidden blocking |
| **Where is the 233-byte LoRa packet defined?** | [[shared/protocol.h]] | `struct RiderProfilePacket` |
| **Where is the BLE GATT JSON parsed on wearable?** | [[wearable_withApp/bt_service.cpp]] | `_onBleDataReceived()`, `btServiceSendText()` |
| **Where is the crash sensitivity threshold set?** | [[android_app/.../PhoneSensorEngine.kt]] | `CRASH_THRESHOLD_G = 2.5f`, `STICKY_SHOCK_MS = 2000` |
| **Where is the desktop COM port reader implemented?** | [[desktop_app/Program.cs]] | `ListenToSerialPort()`, `ProcessIncomingPayload()` |
| **Where is false alarm cancellation handled on desktop?** | [[desktop_app/Program.cs]] | `ProcessIncomingPayload()`, incident type update |
| **How to rebuild the Windows Desktop executable?** | [[desktop_app/build_exe.bat]] | `csc.exe /target:winexe /win32icon:app.ico` |
| **Where is Ponytail token optimization configured?** | [[.agents/skills/ponytail/SKILL.md]] & [[AGENTS.md]] | 7-step Decision Ladder |
| **Where is ICM (Jake Van Clief protocol) configured?** | [[.agents/rules/icm_methodology.md]] & [[AGENTS.md]] | Interpretable Context Methodology |
| **Where is the JLCPCB manufacturing order package?** | [[KiCAD Files/Antigravity Build/RAMS - PCB/JLCPCB_ORDER_PACKAGE/]] | `1_GERBERS_RAMS_PCB.zip`, `2_BOM_RAMS_PCB.csv`, `3_CPL_RAMS_PCB.csv` |
| **How to optimize KiCad PCB silkscreen and run DRC?** | [[KiCAD Files/Antigravity Build/RAMS - PCB/scripts/optimize_silkscreen.py]] | `kicad-cli pcb drc` |
| **Where is the automated PCB routing pipeline?** | [[KiCAD Files/Antigravity Build/RAMS - PCB/scripts/auto_route_pipeline.py]] | Specctra DSN/SES Freerouting, GND stitching |
| **Where is the Shopee PH DIY SMT parts list & reflow guide?** | [[KiCAD Files/Antigravity Build/RAMS - PCB/JLCPCB_ORDER_PACKAGE/PARTS_LIST_FOR_ORDERING.md]] | IX5 Ultra (150°C/205°C) + Relife RL-403 |
| **Where are the latest KiCad schematic ERC audit logs?** | [[KiCAD Files/Antigravity Build/RAMS - PCB/ERC reports/ERC_current.rpt]] | 0 Errors, 4 benign lib_mismatch warnings |

