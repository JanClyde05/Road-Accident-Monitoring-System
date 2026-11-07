---
system: Road Accident Monitoring System (RAMS)
version: 2.3
date: 2026-09-21
tags:
  - rams
  - road-safety
  - esp32-s3
  - lora-sx1278
  - ble-gatt
  - websocket-protocol
  - netlify-blobs
  - android-jetpack-compose
  - windows-desktop-exe
  - obsidian-map
  - graphify-indexed
nodes_count: 52
status: Audited & Production Ready
design_system: Bold Typography & Minimalist (Zero-Emoji)
---

# 🧠 RAMS Master System Memory Map & Graphify Knowledge Base

> **Obsidian Knowledge Graph & Graphify Machine Memory Index**  
> *This file serves as the definitive, zero-token-overhead architectural memory map of the entire RAMS codebase. Any AI agent or developer can navigate this system directly via Obsidian `[[wikilinks]]` without re-scanning files.*

---

## 🗺️ Master System Architecture & Modern Node Ecology

The repository encompasses an integrated hardware-software disaster & highway safety ecosystem:
- **Section 1: Original Hardware Baseline (OG Concept)**: Preserved dedicated sensor breakout firmware (`wearable_withApp/`, `receiver_withDesktop/`, `shared/`).
- **Section 2: Phone-Assisted BLE Wearable Relay**: The ESP32-S3 wearable functions as an ultra-compact body-worn BLE-to-LoRa relay node. All 100Hz IMU fused kinematics, dual-band GNSS, and rider registration credentials originate on the companion smartphone (`android_app/`), streaming to the wearable over BLE GATT (`0xFFE0 / 0xFFE1`).
- **Section 3: Long-Range 433MHz LoRa Uplink**: The wearable broadcasts extended `RiderProfilePacket` (233 bytes) and crash `AlertPacket` payloads across kilometers over 433MHz SX1278 Ra-02 RF links directly to receiver base stations, completely bypassing cellular network outages.
- **Section 4: Standalone Windows Rescuer Operations Center (`desktop_app/`)**: High-performance local command center with native C# host (`Program.cs`), embedded HTTP ingestion engine, borderless Microsoft Edge app-mode dashboard, persistent JSON storage, and full Google Drive 2x2 photo rendering.

---

## 🕸️ 1. Master System Mermaid Visual Graph (Graphify Compatible)

```mermaid
graph TD
    %% Global Design System
    subgraph Design_System["[[DESIGN_RULES.md]]"]
        DR_ZERO["[[Strict Zero-Emoji Rule]]<br/>Custom SVG Glyphs Only"]
        DR_PIN["[[Custom Map Pin Architecture]]<br/>Teardrop + Animated Radar Ring"]
        DR_TYPO["[[Typography Scale]]<br/>Plus Jakarta Sans 900 + JetBrains Mono 700"]
    end

    %% Master Navigation & Apps Hub
    subgraph Navigation_Hub["[[00_SYSTEM_ARCHITECTURE.md]]"]
        NAV_GUIDE["[[00_SYSTEM_ARCHITECTURE.md]]<br/>System Architecture Guide"]
        NAV_APPS["[[apps/]]<br/>Quick-Launch Shortcut Hub"]
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
      R_HTTP["[[receiver_withDesktop/http_upload.cpp]]<br/>WiFi HTTPS POST to Cloud / LAN"]
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
    R_LORA -->|WiFi HTTPS POST (Cloud Backup)| R_HTTP

    R_SER -->|USB COM Port Ingestion| DT_CS
    R_HTTP -->|LAN Port 8888 Ingestion| DT_CS
    DT_CS -->|Cache Identity & GDrive CDN Photo| DT_REG
    DT_CS -->|Enrich Active Events with Full Rider Specs| DT_INC
    DT_INC -->|JSON Feed /api/events| DT_WWW
    DT_REG -->|JSON Feed /api/registrations| DT_WWW
    DT_WWW --> DT_EXE

    Design_System -.->|Style Standard| A_MAIN
    Design_System -.->|Style Standard| DT_WWW
```

---

## 🧭 2. Obsidian Wikilink Core Node Index

### Layer 1: Architecture, Navigation & Design Specifications
- **[[00_SYSTEM_ARCHITECTURE.md]]**: Master directory and architectural guide cleanly separating the OG Hardware Baseline and V2 Modern Apps Ecosystem.
- **[[apps/]]**: Quick-launch shortcuts directory containing `Launch_Desktop_Rescuer.bat`, `Build_And_Install_Android_App.bat`, and `README.md`.
- **[[DESIGN_RULES.md]]**: Master architectural UI/UX guidelines:
  - **Prime Directive**: Absolute prohibition of system emojis. Custom vector glyphs only.
  - **Custom Map Pin Design**: Teardrop SVG (`36px x 46px`) + context-colored radial drop shadow + animated expanding radar ring (`.pin-radar-ring`).
  - **Typography**: Plus Jakarta Sans 900 (Display) + JetBrains Mono 700 (Telemetry & Code).
  - **Color Palette**: Dark Slate `#09090b` (Canvas), `#121214` (Surface), `#18181b` (Elevated), `#27272a` (Hairline).

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
- **[[receiver_withDesktop/http_upload.h]]** & **[[receiver_withDesktop/http_upload.cpp]]**: Cloud/LAN HTTP upload engine.
- **[[receiver_withDesktop/local_queue.h]]** & **[[receiver_withDesktop/local_queue.cpp]]**: LittleFS store-and-retry buffer for offline network resilience.

### Layer 5: Android Mobile Companion Station (`android_app/`)
- **[[android_app/app/src/main/java/com/example/MainActivity.kt]]**: Master Jetpack Compose Activity with 4-tab `NavigationBar` (`TELEMETRY`, `MAP`, `WEARABLE`, `SETTINGS`).
- **[[android_app/app/src/main/java/com/example/sensor/PhoneSensorEngine.kt]]**: Smartphone 100Hz fused IMU (2.5g crash threshold, 2s sticky shock latch) and multi-provider GPS engine (500ms / 0m).
- **[[android_app/app/src/main/java/com/example/sync/Esp32SyncEngine.kt]]**: BLE GATT client with 20-240B MTU chunked transmission and 12ms packet pacing.
- **[[android_app/app/src/main/java/com/example/model/RiderProfile.kt]]**: Base62 friendly token generator (`RAMS-XXXXXXXX`) and Google Drive direct CDN URL converter (`formatDirectDriveUrl`).
- **[[android_app/app/src/main/java/com/example/ui/components/RiderLoginDialog.kt]]**: Rapid rider registration & device synchronization dialog.
- **[[android_app/app/src/main/java/com/example/ui/screens/SettingsScreen.kt]]**: Complete rider profile settings with medical triage and vehicle credentials.
- **[[android_app/build_and_install.bat]]**: Automated Gradle compilation and ADB USB deployment tool.

### Layer 6: Standalone Desktop Rescuer Command Center (`desktop_app/`)
- **[[desktop_app/RAMS_Rescuer_Desktop.exe]]**: Native Windows host application with embedded `app.ico` icon, launching Edge in `--start-fullscreen` borderless mode.
- **[[desktop_app/Program.cs]]**: Multi-threaded C# server with serial COM port listener, dynamic port binding (port 8888), Google Drive CDN converter (`ConvertGoogleDriveUrl`), and incident auto-enrichment engine.
- **[[desktop_app/build_exe.bat]]**: Native C# compilation script using Microsoft .NET Framework `csc.exe`.
- **[[desktop_app/launch_desktop.bat]]**: One-click desktop launcher.
- **[[desktop_app/registrations.json]]**: Local persistent database of registered rider credentials and photos.
- **[[desktop_app/incidents.json]]**: Clean, mock-free persistent incident and telemetry log.
- **[[desktop_app/www/]]**: High-performance React 19 + Vite dashboard featuring Leaflet maps, animated radar pins, accident cards with `referrerPolicy="no-referrer"` Google Drive photo loading, and comprehensive emergency triage inspection modals.

---

## ⚡ 3. AI Agent Fast Query Index (Zero-Scan Reference)

| Developer Question | Authoritative File Target | Key Function / Symbol |
| :--- | :--- | :--- |
| **Where is the Google Drive 2x2 URL converted?** | [[desktop_app/Program.cs]] & [[android_app/.../RiderProfile.kt]] | `ConvertGoogleDriveUrl()`, `formatDirectDriveUrl()` |
| **Why must `referrerPolicy="no-referrer"` be used?** | [[UI Redesign/src/components/RAMSEventSidebar.tsx]] | Prevents Google Drive CDN 403 Forbidden blocking |
| **Where is the 233-byte LoRa packet defined?** | [[shared/protocol.h]] | `struct RiderProfilePacket` |
| **Where is the BLE GATT JSON parsed on wearable?** | [[wearable_withApp/bt_service.cpp]] | `_onBleDataReceived()`, `btServiceSendText()` |
| **Where is the crash sensitivity threshold set?** | [[android_app/.../PhoneSensorEngine.kt]] | `CRASH_THRESHOLD_G = 2.5f`, `STICKY_SHOCK_MS = 2000` |
| **Where is the desktop COM port reader implemented?** | [[desktop_app/Program.cs]] | `ListenToSerialPort()`, `ProcessIncomingPayload()` |
| **How to rebuild the Windows Desktop executable?** | [[desktop_app/build_exe.bat]] | `csc.exe /target:winexe /win32icon:app.ico` |
| **Where are the custom SVG teardrop map pins?** | [[UI Redesign/src/components/RAMSMapView.tsx]] | `createAestheticMarkerIcon()` |
