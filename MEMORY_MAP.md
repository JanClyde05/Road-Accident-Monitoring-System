---
system: Road Accident Monitoring System (RAMS)
version: 2.2
date: 2026-09-09
tags:
  - rams
  - road-safety
  - esp32-s3
  - lora-sx1278
  - websocket-protocol
  - netlify-blobs
  - android-jetpack-compose
  - windows-desktop-exe
  - obsidian-map
  - graphify-indexed
nodes_count: 50
status: Audited & Production Ready
design_system: Bold Typography & Minimalist (Zero-Emoji)
---

# 🧠 RAMS Master System Memory Map & Graphify Knowledge Base

> **Obsidian Knowledge Graph & Graphify Machine Memory Index**  
> *This file serves as the definitive, zero-token-overhead architectural memory map of the entire RAMS codebase. Any AI agent or developer can navigate this system directly via Obsidian `[[wikilinks]]` without re-scanning files.*

---

## 🗺️ Master System Architecture & Dual-Generation Separation

The repository is organized into two clearly delineated architectural sections (see [[00_SYSTEM_ARCHITECTURE.md]]):
- **Section 1: Original Hardware Baseline (OG Concept)**: Dedicated hardware sensor breakout boards (`MPU-6050`, `ATGM336H` GPS), ESP32 firmware, and captive portal web applications (`wearable/`, `receiver/`, `Mobile App/`, `backend/`, `shared/`). **All original code is 100% preserved.**
- **Section 2: Modern Apps Ecosystem (V2 Software Node System)**: Native client software leveraging smartphones for 100Hz fused IMU + Dual-Band GNSS (`android_app/`) and dedicated Windows command center executable (`desktop_app/`). Quick access available via `[[apps/]]`.

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
        NAV_GUIDE["[[00_SYSTEM_ARCHITECTURE.md]]<br/>Dual-Generation Navigation Guide"]
        NAV_APPS["[[apps/]]<br/>Quick-Launch Shortcut Hub"]
    end

    %% Shared Protocol Layer
    subgraph Shared_Protocol["[[shared/protocol.h]]"]
        PKT_ALERT["AlertPacket (24 Bytes)"]
        PKT_TEL["TelemetryPacket (24 Bytes)"]
        PKT_REG["RegisterPacket (24 Bytes)"]
        PKT_TYPE["UserTypePacket (24 Bytes)"]
    end

    %% Wearable Subsystem
    subgraph Wearable_System["[[wearable/wearable.ino]]"]
        W_SENS["[[wearable/sensors.cpp]]<br/>MPU-6050 100Hz DLPF"]
        W_GPS["[[wearable/gps.cpp]]<br/>ATGM336H GPS (UART1) + Ext Sync"]
        W_DET["[[wearable/detection.cpp]]<br/>FSM: Fall / Skid / Impact / Shock"]
        W_LORA["[[wearable/lora_tx.cpp]]<br/>SX1278 LoRa TX (SPI)"]
        W_WS["[[wearable/local_ap.cpp]]<br/>SoftAP + WebSocket Server"]
        W_REG["[[wearable/registration.cpp]]<br/>FNV-1a Hash Token + NVS Storage"]
        W_BTN["[[wearable/button.cpp]]<br/>GPIO2 Debounced / FSM Cancel"]
        W_DATA["[[wearable/data/]] LittleFS<br/>index.html | app.js | style.css | map.html"]
    end

    %% Receiver Subsystem
    subgraph Receiver_System["[[receiver/receiver.ino]]"]
        R_LORA["[[receiver/lora_rx.cpp]]<br/>SX1278 LoRa RX (SPI)"]
        R_QUEUE["[[receiver/local_queue.cpp]]<br/>LittleFS Store-and-Retry Buffer"]
        R_HTTP["[[receiver/http_upload.cpp]]<br/>WiFiClientSecure HTTPS POST"]
        R_WIFI["[[receiver/wifi_manager.cpp]]<br/>Captive Portal WiFi Setup"]
        R_NVS["[[receiver/nvs_store.cpp]]<br/>Preferences WiFi Creds"]
    end

    %% Cloud Subsystem
    subgraph Netlify_Cloud["[[backend/netlify/]]"]
        N_UP["[[upload.mts]]<br/>POST /api/upload"]
        N_EV["[[events.mts]]<br/>GET /api/events"]
        N_BLOB["[[store.ts]]<br/>Netlify Blobs Store"]
    end

    %% Web Dashboard Subsystem
    subgraph Dashboard_Frontend["[[backend/src/]]"]
        D_APP["[[backend/src/App.tsx]]<br/>2.5s Polling Loop + Map Refresh Invalidation"]
        D_MAP["[[backend/src/components/RAMSMapView.tsx]]<br/>Leaflet + Supercluster (Attribution-Free)"]
        D_POP["[[backend/src/components/RAMSEventPopup.tsx]]<br/>Profile Card + 2x2 Photo View"]
        D_SIDE["[[backend/src/components/RAMSEventSidebar.tsx]]<br/>Emergency Incident Feed (Scroll-Locked)"]
        D_HEAD["[[backend/src/components/RAMSHeader.tsx]]<br/>Custom Window Controls (─ □ ✕)"]
        D_TOKEN["[[backend/src/RAMSDesignTokens.ts]]<br/>Reusable Dark Slate Design Tokens"]
    end

    %% Android App Subsystem (Phone Sensor Migration)
    subgraph Android_App["[[android_app/]] Mobile Application"]
        A_MAIN["[[MainActivity.kt]]<br/>Jetpack Compose UI"]
        A_SENS["[[PhoneSensorEngine.kt]]<br/>100Hz IMU (0.8° Deadband) + GPS"]
        A_SYNC["[[Esp32SyncEngine.kt]]<br/>Dual-Protocol WebSocket / Bluetooth SPP"]
        A_PROF["[[RiderProfile.kt]]<br/>8 Vehicle Classes (Tricycle, Van, Bus, Truck)"]
        A_BUILD["[[build_and_install.bat]]<br/>Automated Windows Build & USB Deploy"]
    end

    %% Desktop App Subsystem (Stand-Alone Rescuer Command Node)
    subgraph Desktop_App["[[desktop_app/]] Rescuer Operations Center"]
        DT_EXE["[[RAMS_Rescuer_Desktop.exe]]<br/>Native Windows Host + app.ico Icon"]
        DT_CS["[[desktop_app/Program.cs]]<br/>Embedded HTTP Server + Registrations Cache"]
        DT_UP["[[desktop_app/Program.cs#POST_/api/upload]]<br/>LoRa Receiver Ingestion & Crash Mechanics"]
        DT_EV["[[desktop_app/Program.cs#GET_/api/events]]<br/>Local JSON Event Feed (incidents.json)"]
        DT_EDGE["[[Microsoft Edge App Mode]]<br/>Borderless Fullscreen + Loading Buffer Splash"]
    end

    %% Interconnections
    A_SENS -->|100Hz IMU + Precision GNSS| A_SYNC
    A_SYNC <-->|Full-Duplex WS Frames (Port 81)| W_WS
    A_PROF -->|Category & Token| A_SYNC
    A_BUILD -.->|Deploys to Phone| A_MAIN

    W_SENS -->|100Hz IMU Data| W_DET
    W_GPS -->|GPS NMEA Vectors| W_DET
    W_DET -->|Confirmed Alarm| W_LORA
    W_REG -->|Compact Token & UserType| W_LORA
    W_DATA -->|LittleFS Web Pages| W_WS

    W_LORA -.->|433MHz LoRa RF Hop| R_LORA
    R_LORA -->|Incoming Packets| R_QUEUE
    R_QUEUE -->|JSON Payloads| R_HTTP

    R_HTTP -->|Cloud HTTPS POST| N_UP
    R_HTTP -->|Local LAN POST /api/upload| DT_UP

    N_UP -->|Persist Event| N_BLOB
    N_BLOB -->|Query Events| N_EV
    N_EV -->|2.5s Poll Loop| D_APP

    DT_UP --> DT_EV
    DT_EV --> DT_EXE
    DT_EXE --> DT_EDGE

    D_APP --> D_MAP
    D_APP --> D_SIDE
    D_APP --> D_HEAD
    D_MAP --> D_POP

    Design_System -.->|Style Standard| W_DATA
    Design_System -.->|Style Standard| D_MAP
    Design_System -.->|Style Standard| A_MAIN
    Design_System -.->|Style Standard| DT_EDGE

    NAV_APPS --> A_BUILD
    NAV_APPS --> DT_EXE
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
- **[[shared/protocol.h]]**: Single source of truth for all binary LoRa packet structures. Packed with `#pragma pack(push, 1)`.
- **[[shared/logo_data.h]]**: Circular RAMS logo bitmap data embedded into ESP32 flash memory.

### Layer 3: Wearable Sensor Node Firmware (`wearable/`)
- **[[wearable/wearable.ino]]**: Main setup and 100Hz acquisition loop.
- **[[wearable/sensors.h]]** & **[[wearable/sensors.cpp]]**: MPU-6050 hardware driver.
- **[[wearable/gps.h]]** & **[[wearable/gps.cpp]]**: ATGM336H hardware GPS driver + `gpsSetExternalLocation(...)` phone telemetry sync.
- **[[wearable/detection.h]]** & **[[wearable/detection.cpp]]**: 5-state Finite State Machine (Freefall, Impact, Stillness, Alarm).
- **[[wearable/lora_tx.h]]** & **[[wearable/lora_tx.cpp]]**: SX1278 LoRa radio transmitter.
- **[[wearable/local_ap.h]]** & **[[wearable/local_ap.cpp]]**: SoftAP + dedicated WebSocket server on TCP port 81. Accepts incoming phone telemetry.
- **[[wearable/registration.h]]** & **[[wearable/registration.cpp]]**: NVS token persistence and FNV-1a generator.

### Layer 4: Original Captive Portal Web App (`Mobile App/` & `wearable/data/`)
- **[[Mobile App/]]**: Original captive portal web application preserved 100% untouched.
- **[[wearable/data/index.html]]**: LittleFS captive portal SPA served by ESP32 SoftAP.
- **[[wearable/data/app.js]]**: WebSocket protocol client running on rider browser.

### Layer 5: Receiver Base Station Firmware (`receiver/`)
- **[[receiver/receiver.ino]]**: Main receiver loop polling LoRa RX and processing upload retry queues.
- **[[receiver/lora_rx.h]]** & **[[receiver/lora_rx.cpp]]**: Continuous LoRa packet listening and deserialization.
- **[[receiver/http_upload.h]]** & **[[receiver/http_upload.cpp]]**: Uploads JSON event payloads to emergency server (`/api/upload`).
- **[[receiver/local_queue.h]]** & **[[receiver/local_queue.cpp]]**: LittleFS store-and-retry buffer for offline resilience.

### Layer 6: Netlify Web Dashboard & Reusable Design Library (`backend/`)
- **[[backend/src/RAMSDesignTokens.ts]]**: Centralized design system library containing dark slate color tokens (`#09090b` canvas, `#121214` surface, `#18181b` elevated, `#27272a` hairline), typography, box shadows, and map filter tokens.
- **[[backend/src/App.tsx]]**: Master React dashboard layout. Pure dark mode enforced, test crash & theme toggles removed, dynamic map size invalidation on manual refresh, and document-level overflow locked.
- **[[backend/src/components/RAMSHeader.tsx]]**: Command header with custom window controls (─, □/❐, ✕), real-time uplink status, and hidden developer design rules reference.
- **[[backend/src/components/RAMSMapView.tsx]]**: Leaflet map with Supercluster and custom teardrop pins. Completely attribution-free (`attributionControl: false`, `attribution: ''`) per GPS-Audio specification. Dynamic `refreshTrigger` auto-invalidates map tile cache.
- **[[backend/src/components/RAMSEventSidebar.tsx]]**: Incident stream with `overscroll-contain` and internal scrolling preventing document scroll propagation.
- **[[backend/netlify/functions/upload.mts]]**: Serverless endpoint receiving JSON events from receiver base stations.
- **[[backend/netlify/functions/events.mts]]**: Serverless endpoint returning sorted event logs to dashboard clients.

### Layer 7: Android Mobile App Subsystem (`android_app/`)
- **[[android_app/app/src/main/java/com/example/MainActivity.kt]]**: Master Jetpack Compose Activity with 4-tab `NavigationBar` Scaffold (`TELEMETRY`, `MAP`, `WEARABLE`, `SETTINGS`). Encapsulated UI: dark mode toggle, CSV logger, and Design Rules reference removed from header and settings. Bluetooth enable launcher integrated for TURN ON prompt.
- **[[android_app/app/src/main/java/com/example/ui/screens/TelemetryScreen.kt]]**: Real-time physical G-Force monitoring, 3D attitude horizon, and live IMU waveforms without mock simulations.
- **[[android_app/app/src/main/java/com/example/ui/screens/MapScreen.kt]]** & **[[android_app/app/src/main/assets/leaflet/map.html]]**:
  - Deep monochromatic dark OSM tiles matching web dashboard.
  - Smooth continuous 360° IMU orientation beam (blue flashlight) with angle unwrapping (`cumulativeHdg += delta`) eliminating spin-flip jitter.
  - Adaptive zoom marker: Classic teardrop pin on zoom-out (`zoom < 15`), Google Maps blue puck with flashlight beam on zoom-in (`zoom >= 15`).
  - Dead-center GPS tracking, smooth recentering, and optional nearby accident alert markers.
- **[[android_app/app/src/main/java/com/example/ui/screens/WearableScreen.kt]]**: Simple, neat, zero-jargon UI for connecting to the Safety Wearable via clean **Bluetooth** or **Wi-Fi** tabs. Bluetooth-off detection banner with TURN ON prompt. Dark slate (`#18181B`) buttons with `#27272A` borders and colorful glowing icons. Auto-scan on BT enable, RAMS/Wearable device priority sorting, and Emergency SOS broadcast.
- **[[android_app/app/src/main/java/com/example/ui/screens/SettingsScreen.kt]]**: Clean rider profile with 8 Philippine road user categories (Pedestrian, Cyclist, Motorcycle, Tricycle, Car Driver, Van, Bus, Truck). Medical triage config and nearby accident notifications toggle. Section 5 (Theme, CSV, Design Rules) removed for encapsulation.
- **[[android_app/app/src/main/java/com/example/ui/components/RamsHeader.kt]]**: Brand header with authentic app logo and live status badges. Dark mode toggle and CSV logger icon removed for clean encapsulation.
- **[[android_app/app/src/main/java/com/example/sensor/PhoneSensorEngine.kt]]**: Fused 9-axis IMU orientation with moving average low-pass filter (0.8° deadband) and multi-provider GPS engine (500ms / 0m).
- **[[android_app/app/src/main/java/com/example/sync/Esp32SyncEngine.kt]]**: Full-duplex WebSocket, TCP Socket, and Bluetooth SPP uplink engine. `isSyncActive` forced `false` on all failure paths. `cancelDiscovery()` called before RFCOMM to protect A2DP audio streams.
- **[[android_app/app/src/main/res/mipmap-*/ic_launcher.png]]**: Authentic app icon generated from `Pictures/LOGO/LOGO.jpg`.
- **[[android_app/build_and_install.bat]]**: Automated Windows build & USB install script for direct hardware deployment.

### Layer 8: Standalone Desktop Rescuer Application (`desktop_app/`)
- **[[desktop_app/RAMS_Rescuer_Desktop.exe]]**: Native 64-bit Windows executable compiled with embedded `app.ico` icon, launching Edge in `--start-fullscreen` borderless mode with loading buffer splash screen.
- **[[desktop_app/Program.cs]]**: C# native host with embedded multi-threaded HTTP server (`System.Net.HttpListener`), dynamic port binding, direct LoRa receiver ingestion (`/api/upload`), crash mechanics classifier (0: Fall, 1: Skid, 2: Impact, 3: Rollover, 4: Oscillation), and local `registrations.json` cache for rider profiles.
- **[[desktop_app/build_exe.bat]]**: Compiles `RAMS_Rescuer_Desktop.exe` with `/win32icon:app.ico` via `csc.exe` in under 2 seconds.
- **[[desktop_app/launch_desktop.bat]]**: One-click launcher.
- **[[desktop_app/www/index.html]]**: Includes inline `#rams-splash` buffer screen with RAMS logo pulse ring, progress sweep, and smooth auto-fade transition.
- **[[desktop_app/incidents.json]]**: Local persistent incident database.
- **[[desktop_app/registrations.json]]**: Local persistent device and rider registration database.

---

## ⚡ 8. AI Agent Fast Query Index (Zero-Scan Reference)

| Developer Question | Authoritative File Target | Key Function / Symbol |
| :--- | :--- | :--- |
| **Where is the dual-generation architecture guide?** | [[00_SYSTEM_ARCHITECTURE.md]] | Master Navigation Document |
| **Where are the quick-launch app shortcuts?** | [[apps/README.md]] | `Launch_Desktop_Rescuer.bat`, `Build_And_Install_Android_App.bat` |
| **Where is the Standalone Desktop Rescuer App source?**| [[desktop_app/Program.cs]] | `Main()`, `StartServer()`, `HandlePostUpload()` |
| **How to build the Desktop .exe?** | [[desktop_app/build_exe.bat]] | Uses native Windows `csc.exe` |
| **Where is the Android build & USB deploy script?** | [[android_app/build_and_install.bat]] | Automated ADB + Gradle tool |
| **Where is the fall/skid detection logic?** | [[wearable/detection.cpp]] | `detectionUpdate()` |
| **Where are detection thresholds defined?** | [[wearable/config.h]] | `FALL_FREEFALL_G`, `FALL_IMPACT_G` |
| **Where are LoRa packet structs defined?** | [[shared/protocol.h]] | `AlertPacket`, `TelemetryPacket` |
| **How is the compact token generated?** | [[wearable/registration.cpp]] & [[android_app/.../RiderProfile.kt]] | `registrationGenerateToken()`, `generateFriendlyToken()` |
| **Where is the wearable WebSocket handler?** | [[wearable/local_ap.cpp]] | `_onWsEvent()`, `WebSocketsServer` |
| **Where is external GPS injected into wearable?** | [[wearable/gps.cpp]] | `gpsSetExternalLocation()` |
| **Where is the custom teardrop map pin?** | [[backend/src/components/RAMSMapView.tsx]] | `createAestheticMarkerIcon()` |
| **Where are the UI design & zero-emoji rules?**| [[DESIGN_RULES.md]] | Master Design Rules Document |
