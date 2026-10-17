# Road Accident Monitoring System (RAMS)

**A real-time highway emergency detection and dispatch system using wearable IoT sensors, long-range LoRa radio, and a standalone Windows command center.**

RAMS detects road accidents in real time using smartphone-grade 100Hz inertial measurement, broadcasts emergency alerts over 433MHz LoRa radio links that bypass cellular network outages, and delivers live incident telemetry to a standalone Windows rescuer desktop application for immediate dispatch response.

---

## System Architecture

```
  Android Phone                ESP32-S3 Wearable           ESP32-S3 Receiver          Windows Desktop
  (Sensor Engine)              (BLE-to-LoRa Relay)         (Base Station)             (Command Center)
 +-----------------+         +-------------------+       +-------------------+      +--------------------+
 | 100Hz Fused IMU |--BLE--->| BLE GATT Server   |       | SX1278 LoRa RX    |      | Embedded HTTP      |
 | Dual-Band GNSS  |  GATT   | (0xFFE0/0xFFE1)   |       | (433MHz, SF9)     |      | Server (C#)        |
 | Crash Detection |         |                   |       |                   |      |                    |
 | Rider Profile   |         | SX1278 LoRa TX    |=====>>| JSON Serial Out   |--USB->| Serial COM Listener|
 | Google Drive CDN|         | (433MHz, SF9)     | LoRa  | Wi-Fi HTTP POST   |--LAN->| LAN TCP Bridge     |
 +-----------------+         +-------------------+       +-------------------+      |                    |
                              NeoPixel + Buzzer            NeoPixel Status           | React Dashboard    |
                              False-Alarm Button                                     | Leaflet Radar Map  |
                                                                                     | Edge App Mode      |
                                                                                     +--------------------+
```

### Data Flow

1. **Phone** captures 100Hz IMU kinematics + dual-band GNSS position + rider credentials
2. **BLE GATT** streams chunked JSON packets (20-240B MTU) to the wearable
3. **Wearable** relays via 433MHz LoRa to the receiver (up to several kilometers range)
4. **Receiver** outputs JSON over USB Serial and/or Wi-Fi HTTP POST to the desktop
5. **Desktop** ingests, enriches with cached rider profiles and photos, persists to JSON, and renders on a tactical Leaflet map

---

## Hardware Bill of Materials

### Wearable Node

| Component | Model | Purpose |
|:---|:---|:---|
| Microcontroller | ESP32-S3 SuperMini | BLE GATT server + SPI LoRa host |
| LoRa Radio | SX1278 Ra-02 (433MHz) | Long-range packet transmission |
| LED | WS2812B NeoPixel (1x) | Status indicator (Blue/Green/Red/Amber) |
| Buzzer | Active Piezo Buzzer | Audible SOS alert |
| Button | Tactile Push Button | False-alarm cancellation (GPIO0) |
| Power | 3.7V LiPo Battery | Portable operation |

### Receiver Base Station

| Component | Model | Purpose |
|:---|:---|:---|
| Microcontroller | ESP32-S3 SuperMini | SPI LoRa host + Wi-Fi + USB Serial |
| LoRa Radio | SX1278 Ra-02 (433MHz) | Long-range packet reception |
| LED | WS2812B NeoPixel (1x) | Connection status indicator |
| Power | USB-C (from Desktop PC) | Powered by host computer |

### Wiring Table (Both Nodes)

| Signal | ESP32-S3 Pin | SX1278 Pin |
|:---|:---|:---|
| NSS (CS) | GPIO 10 | NSS |
| SCK | GPIO 12 | SCK |
| MISO | GPIO 13 | MISO |
| MOSI | GPIO 11 | MOSI |
| RST | GPIO 9 | RST |
| DIO0 (IRQ) | GPIO 8 | DIO0 |

**Wearable additional pins:** NeoPixel = GPIO 48, Buzzer = GPIO 1, Button = GPIO 0

---

## Software Subsystems

### 1. Android Companion App (`android_app/`)

Native Kotlin application built with Android Jetpack Compose Material 3.

- **Monochrome High-Contrast Visual Architecture**: Sleek matte-black UI mirroring RAMS IMU Studio with colored functional icons, signal waveforms, and emergency status indicators.
- **100Hz fused IMU** with dynamic crash threshold calibration and 2-second sticky shock latch
- **Dual-Band multi-GNSS** position provider (sub-meter accuracy)
- **BLE GATT client** with MTU-aware chunked transmission (12ms pacing)
- **Rider Profile** with Base62 token generator and Google Drive 2x2 photo CDN formatter
- **Dual EXPORT / IMPORT CSV Telemetry Studio**: Full session logging with real-time import of IMU Studio processed CSV datasets.
- **Dynamic IMU Calibration & False Alarm Cancellation**: Automatically adapts crash shock thresholds and suppresses benign ADL vibrations using imported IMU Studio profiles.
- **4-tab UI**: Telemetry, Map, Wearable, Settings

**Build and install:**
```bash
cd android_app
.\build_and_install.bat
```

### 2. ESP32-S3 Wearable Firmware (`wearable_withApp/`)

Ultra-compact body-worn BLE-to-LoRa relay node.

- **BLE GATT Server** (`0xFFE0 / 0xFFE1`) receives phone telemetry JSON
- **SX1278 LoRa TX** broadcasts packets at 433MHz, SF9, BW125kHz, CR4/5
- **NeoPixel state machine**: Blue (Connecting), Green (Armed), Red (SOS Alert)
- **False-alarm** button on GPIO0 with hardware debounce

**Flash:** Open `wearable_withApp/wearable_withApp.ino` in Arduino IDE and upload to ESP32-S3.

### 3. ESP32-S3 Receiver Firmware (`receiver_withDesktop/`)

Stationary base station that captures LoRa packets.

- **SX1278 LoRa RX** with backward-compatible 101-byte and 233-byte packet decoding
- **USB Serial JSON stream** at 115200 baud for desktop ingestion
- **Wi-Fi HTTP POST** to cloud backup and LAN desktop bridge
- **LittleFS queue** for offline store-and-retry resilience

**Flash:** Open `receiver_withDesktop/receiver_withDesktop.ino` in Arduino IDE and upload to ESP32-S3.  
**Important:** Close the Arduino IDE Serial Monitor after flashing so the desktop app can access the COM port.

### 4. Windows Desktop Command Center (`desktop_app/`)

Standalone native Windows `.exe` with zero external dependencies.

- **Embedded C# HTTP server** with multi-threaded request handling
- **Auto-detecting USB Serial bridge** for direct LoRa base station hardware ingestion
- **LAN TCP bridge** (port 8888) for optional Wi-Fi receiver ingestion
- **Persistent JSON storage** (`registrations.json`, `incidents.json`)
- **Google Drive CDN photo rendering** with `referrerPolicy="no-referrer"` bypass
- **Incident auto-enrichment engine**: retroactively updates all events when rider profile arrives
- **React 19 + Vite dashboard** with Leaflet tactical radar map, animated pins, and emergency triage modals
- **Microsoft Edge App Mode** for borderless fullscreen operation

**Launch:**
```bash
cd desktop_app
.\launch_desktop.bat
```

**Recompile (under 2 seconds):**
```bash
cd desktop_app
.\build_exe.bat
```

### 5. RAMS IMU Studio Application (`RAMS IMU Studio Application/`)

Companion Android inertial analysis & calibration suite:

- **100Hz Real-Time IMU Waveform Monitor**: Multi-channel live visualization for acceleration, angular rate, and orientation angles.
- **Accident vs. ADL Correlation Studio**: Statistical feature extraction and classification rule derivation.
- **Processed CSV & Calibration Rules Engine**: Exports filtered CSV and JSON thresholds for seamless consumption by `android_app/`.
- **Automated USB Installer**: Complete build & deploy pipeline via `build_and_install.bat`.

**Build and install:**
```bash
cd "RAMS IMU Studio Application"
.\build_and_install.bat
```

### 6. Hardware Engineering & Custom Wearable PCB (`KiCAD Files/Antigravity Build/RAMS - PCB/`)

Turnkey custom hardware design for an ultra-compact body-worn sensor relay:

- **Board Specifications**: 42.0 mm x 32.0 mm, 2-layer FR-4, 1.6mm thickness, 0.15mm standard track width, 0.3mm mechanical drill vias.
- **Core Processing & Radio**: ESP32-S3FH4R2 (QFN-56, 4MB Flash + 2MB PSRAM), Johanson 2450AT18 2.4GHz ceramic chip antenna with <10mm direct 45-degree microstrip feed and dual-layer ground keepout, and bottom-mounted Ai-Thinker Ra-02 (SX1278) 433MHz LoRa module with LC power filtering.
- **Power Management & Safety**:
  - `U3` (LTH7R / TP4054): 500mA Li-Ion linear charger ($249\text{ mA}$ charge rate).
  - Auto Power Multiplexer: `Q1` (AO3401A P-FET) + `D2` (SS14W SOD-123FL Schottky) for seamless, zero-loss battery-to-USB switching.
  - Soft Power Switch: `SW1` (MSK12C02) driving the high-impedance enable pin of `U5` (AP2112K-3.3 600mA LDO with dual 47uF MLCC sag capacitors).
  - Battery Protection: `U4` (DW01A) + `Q3` (FS8205A TSSOP-8 dual N-FET) for low-side over-charge, over-discharge, and short-circuit cutoff.
  - Battery Voltage Monitor: Resistor divider `R14` ($330\text{ k}\Omega$) + `R15` ($180\text{ k}\Omega$) with $0.1\ \mu\text{F}$ noise filter.
- **Automated Autorouting Pipeline**: Headless Specctra DSN/SES Freerouting v2.4.1 execution script (`scripts/auto_route_pipeline.py`) with perimeter ground shield stitching and zone refills.
- **Fabrication & DIY Reflow**:
  - Turnkey Gerber, BOM, and CPL files in `JLCPCB_ORDER_PACKAGE/`.
  - DIY SMT Reflow Option: Bare PCB + Stainless Stencil from JLCPCB (~$15 / ~₱850) paired with Shopee PH components and 2-stage reflow on a Mechanic IX5 Ultra hotplate ($150^\circ\text{C}$ soak / $205^\circ\text{C}$ reflow) using Relife RL-403 ($183^\circ\text{C}$ Sn63Pb37) paste.

---

## LoRa Protocol Specification

All packets are defined in `shared/protocol.h` using `__attribute__((packed))` structs.

### Packet Header (13 bytes) -- present in all packets

| Field | Type | Size | Description |
|:---|:---|:---|:---|
| `packetType` | `uint8_t` | 1B | Packet type enum |
| `deviceToken` | `char[8]` | 8B | Alphanumeric device identifier |
| `timestamp` | `uint32_t` | 4B | `millis()` at send time |

### Packet Types

| Type | ID | Total Size | Key Fields |
|:---|:---|:---|:---|
| `PKT_TELEMETRY` | 0 | 21B | lat, lon, batteryPct |
| `PKT_ALERT` | 1 | 26B | lat, lon, eventType, aMag |
| `PKT_FALSE_ALARM` | 2 | 21B | lat, lon |
| `PKT_TEST` | 3 | -- | Simulation trigger |
| `PKT_REGISTER` | 4 | 133B | name, driveLinkConverted |
| `PKT_USER_TYPE` | 5 | 29B | userType |
| `PKT_RIDER_PROFILE` | 6 | 233B | Full rider identity, vehicle, medical, photo |

### RiderProfilePacket (233 bytes) -- Single Source of Truth

| Field | Size | Description |
|:---|:---|:---|
| `header` | 13B | Packet header |
| `name` | 24B | Rider's full name |
| `plate` | 12B | License plate number |
| `contact` | 16B | Primary phone number |
| `blood` | 4B | Blood type (e.g. "O+") |
| `category` | 16B | Road user category |
| `emergencyPhone` | 16B | Emergency contact phone |
| `emergencyName` | 20B | Emergency contact name |
| `vehicleModel` | 20B | Vehicle make/model |
| `allergies` | 20B | Medical allergies |
| `photoUrl` | 72B | Google Drive CDN direct URL |

### Radio Settings

| Parameter | Value |
|:---|:---|
| Frequency | 433 MHz ISM |
| Spreading Factor | SF9 |
| Bandwidth | 125 kHz |
| Coding Rate | CR 4/5 |
| TX Power | 17 dBm |
| Sync Word | 0x34 |

---

## BLE GATT Service

| UUID | Direction | Purpose |
|:---|:---|:---|
| Service `0xFFE0` | -- | RAMS Telemetry Service |
| Characteristic `0xFFE1` | Phone to Wearable | JSON telemetry, profile sync, crash alerts |

Packets are MTU-aware chunked (20-240 bytes) with 12ms inter-chunk pacing to prevent BLE stack overflow.

---

## Quick Start

### Prerequisites

- **Arduino IDE** with ESP32-S3 board support
- **Android Studio** with Kotlin and Jetpack Compose
- **Windows 10/11** with Microsoft Edge installed
- **.NET Framework 4.x** (pre-installed on Windows)

### Deployment Steps

1. **Hardware Assembly (Custom PCB or Prototyping Breadboard)**:
   - For custom PCB: Follow `KiCAD Files/Antigravity Build/RAMS - PCB/JLCPCB_ORDER_PACKAGE/PARTS_LIST_FOR_ORDERING.md` to order bare boards + stencil from JLCPCB and reflow using the Mechanic IX5 Ultra.
   - For breadboard testing: Wire an ESP32-S3 SuperMini to an SX1278 Ra-02 module using the wiring table above.

2. **Flash the Wearable**: Open `wearable_withApp/wearable_withApp.ino` in Arduino IDE, select ESP32-S3, and upload.

3. **Flash the Receiver**: Open `receiver_withDesktop/receiver_withDesktop.ino` in Arduino IDE, select ESP32-S3, and upload. **Close the Serial Monitor after flashing.**

4. **Build the Android App**: Run `android_app/build_and_install.bat` with your phone connected via USB.

5. **Launch the Desktop App**: Run `desktop_app/launch_desktop.bat`. The status popup will show USB Serial and Wi-Fi LAN bridge status.

6. **Connect**: Open the Android app, connect to the wearable via BLE. The wearable LED turns solid green when armed.

7. **Monitor**: The desktop tactical map displays live rider positions and incident alerts in real time.

---

## Repository Structure

```
Danger Monitoring System V2/
|-- shared/                     Shared LoRa protocol definitions (protocol.h)
|-- wearable_withApp/           ESP32-S3 wearable firmware (BLE + LoRa TX)
|-- receiver_withDesktop/       ESP32-S3 receiver firmware (LoRa RX + Serial/WiFi)
|-- android_app/                Android Jetpack Compose companion app (100Hz IMU + GNSS)
|-- desktop_app/                Windows desktop command center (C# + React)
|   |-- Program.cs              Embedded HTTP server + serial bridge
|   |-- www/                    Compiled React dashboard assets
|   |-- build_exe.bat           Native C# compiler script
|   |-- launch_desktop.bat      One-click launcher
|-- RAMS IMU Studio Application/ Standalone Android 100Hz IMU calibration & correlation studio
|-- KiCAD Files/                KiCad 10 hardware engineering & manufacturing
|   |-- Antigravity Build/RAMS - PCB/ 42x32mm 2-layer wearable PCB layout & schematics
|       |-- JLCPCB_ORDER_PACKAGE/ Turnkey Gerbers, BOM, CPL & Shopee PH parts matrix
|       |-- scripts/            Automated routing & silkscreen optimization pipelines
|       |-- ERC reports/        Electrical rule check audit logs (0 errors verified)
|-- UI Redesign/                React 19 + Vite dashboard source
|-- Working Code - Do Not Touch/ Golden baseline reference snapshot archive
|-- MD Files/                   Obsidian vault specifications, flowcharts, & memory maps
|-- apps/                       Quick-launch shortcuts & setup runners
|-- .agents/                    Ponytail token optimization rules & skills
|-- AGENTS.md                   Agent operating guidelines & Decision Ladder
|-- DESIGN_RULES.md             UI/UX design system (Zero-Emoji Rule)
|-- MEMORY_MAP.md               Technical knowledge graph & Graphify index
|-- 00_SYSTEM_ARCHITECTURE.md   Architecture navigation guide
```

---

## Design System

The dashboard follows a strict design system defined in `DESIGN_RULES.md`:

- **Zero-Emoji Rule**: No system Unicode emojis. All icons are custom SVG vector glyphs.
- **Typography**: Plus Jakarta Sans 900 (display), JetBrains Mono 700 (telemetry data).
- **Color Palette**: Dark Slate canvas (`#09090b`), Surface (`#121214`), Elevated (`#18181b`).
- **Map Pins**: Custom teardrop SVG (36x46px) with animated radar rings and context-colored radial shadows.

---

## License

This project was developed as a capstone research initiative for highway safety monitoring in the Philippines.
