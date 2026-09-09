# Road Accident Monitoring System (RAMS) — System Architecture Guide

Welcome to the **Road Accident Monitoring System (RAMS)** codebase. This document outlines the two generations of the system and provides a clean directory map for navigating between the **Original Hardware Baseline** and the **Modern Apps Ecosystem**.

---

## 🗺️ High-Level Directory Map

```
Danger Monitoring System V2/
│
├── 00_SYSTEM_ARCHITECTURE.md       ◄── Master Navigation & Architecture Guide (You are here)
├── DESIGN_RULES.md                 ◄── System-wide UI/UX Design System & Zero-Emoji Rules
├── MEMORY_MAP.md                   ◄── Technical Memory Map & Module Relationship Graph
│
├── ═══ SECTION 1: ORIGINAL HARDWARE BASELINE (OG Concept) ═══
│   ├── wearable/                   ◄── ESP32 Wearable Firmware (Original Hardware Sensors)
│   ├── receiver/                   ◄── ESP32 LoRa Base Station Firmware
│   ├── Mobile App/                 ◄── Original Mobile Captive Portal Web Prototype (100% Intact)
│   ├── backend/                    ◄── Original Netlify Cloud Rescuer Web Dashboard (100% Intact)
│   ├── shared/                     ◄── Shared C/C++ Protocol & Logo Header Assets
│   ├── data_logger/                ◄── Serial IMU & Sensor Calibration Suite
│   └── validation/                 ◄── Hardware Verification & Test Data
│
└── ═══ SECTION 2: MODERN APPS ECOSYSTEM (V2 Software Node System) ═══
    ├── android_app/                ◄── Native Android App (Phone 100Hz IMU + Dual-Band GNSS)
    ├── desktop_app/                ◄── Standalone Windows Rescuer Station (.exe)
    └── apps/                       ◄── Unified Apps Hub & Quick-Launch Shortcuts
```

---

## 🏛️ System Generation Comparison

| Dimension | Generation 1: OG Hardware Baseline | Generation 2: Modern Apps Ecosystem |
| :--- | :--- | :--- |
| **Primary Motion Sensor** | Dedicated MPU-6050 I2C breakout board | Smartphone 100Hz hardware-fused IMU |
| **Primary Location Sensor** | ATGM336H GPS breakout module | Smartphone Dual-Band Multi-GNSS (sub-meter) |
| **Rider Interface** | SoftAP Captive Portal (`192.168.4.1`) | Native Android Jetpack Compose Application |
| **Rescuer Interface** | Cloud-hosted Netlify Website | Standalone Windows Executable (`RAMS_Rescuer_Desktop.exe`) |
| **Offline Command Center** | Requires Internet or local Python server | Embedded zero-dependency C# server in `.exe` |
| **Direct LoRa Ingestion** | Cloud Netlify Functions (`/api/upload`) | Local LAN POST directly to desktop PC (`/api/upload`) |
| **Hardware BOM Cost** | High (MCU + GPS + IMU + Battery + Charging) | Low (Lightweight ESP32 MCU + SX1278 LoRa only) |

---

## 📁 Section 1: Original Hardware Baseline (`OG Concept`)

This section contains all original hardware code, firmware, and prototypes. **Every file has been preserved in its original form**:

1. **`wearable/`** (`wearable.ino`):
   - Firmware for the ESP32 wearable unit.
   - Manages MPU-6050 accelerometer, ATGM336H GPS UART, SX1278 LoRa transmitter, active buzzer, and NeoPixel LED ring.
   - Backward compatibility: Contains optional external location injection (`gpsSetExternalLocation`) so it can accept phone telemetry over WiFi SoftAP while retaining full standalone hardware GPS capability.
2. **`receiver/`** (`receiver.ino`):
   - Firmware for the roadside base station receiver.
   - Decodes 433MHz binary LoRa packets, buffers them in LittleFS flash memory, and uploads via HTTP POST to the emergency server.
3. **`Mobile App/`**:
   - Original HTML/CSS/JavaScript mobile captive portal web prototype.
   - Kept 100% original and untouched for historical reference.
4. **`backend/`**:
   - Original Vite + React + TailwindCSS Rescuer Dashboard designed for deployment on Netlify.
5. **`shared/`**:
   - `protocol.h`: Binary packet struct definitions (24-byte LoRa payload, message types, shock flags).
   - `logo_data.h`: Circular RAMS logo bitmap data embedded into ESP32 flash memory.

---

## 📱 Section 2: Modern Apps Ecosystem (`V2 Software System`)

This section contains the new native applications for smartphones and desktop command centers:

### 1. Mobile Android Application (`android_app/`)
- **Technology**: Native Kotlin, Android Jetpack Compose Material 3.
- **Role**: Transforms the rider's phone into a precision sensing and emergency communication node.
- **Sensors**: 100Hz fused hardware accelerometer and gyroscope, precision Dual-Band GNSS location provider.
- **Features**:
  - Offline Tuguegarao tactical vector radar map.
  - 4-category road user switcher (`Pedestrian`, `Cyclist`, `Car Driver`, `Motorcycle Rider`).
  - Automated WebSocket telemetry streaming directly to the ESP32 wearable (`ws://192.168.4.1:81/ws`).
  - High-G impact detection with visual countdown emergency broadcast.
- **Building & Installing**:
  - Run `android_app/build_and_install.bat` to compile and install via USB to your connected phone.

### 2. Standalone Windows Desktop Rescuer Application (`desktop_app/`)
- **Technology**: Standalone native Windows `.exe` executable (`RAMS_Rescuer_Desktop.exe`).
- **Role**: Command & dispatch station for emergency responders, hospital triage, and mobile rescue vehicles.
- **Features**:
  - Embedded multi-threaded HTTP server (`System.Net.HttpListener`).
  - Runs completely offline without internet connectivity.
  - Direct LoRa Base Station Ingestion: ESP32 receiver posts alerts directly to `http://<DESKTOP_IP>:8080/api/upload`.
  - Native chromeless window using Microsoft Edge App Mode (`--app=http://...`).
- **Building & Launching**:
  - Run `desktop_app/launch_desktop.bat` or double-click `desktop_app/RAMS_Rescuer_Desktop.exe`.
  - Recompile anytime in 1 second using `desktop_app/build_exe.bat`.

---

## ⚡ Quick Launch Guide

| Task | Command or File |
| :--- | :--- |
| **Launch Desktop Rescuer App** | Double-click `desktop_app/launch_desktop.bat` or `apps/Launch_Desktop_Rescuer.bat` |
| **Instant Mobile App Web Preview** | Double-click `preview_mobile_app.bat` (Hosts local server & opens AI Studio-style simulator) |
| **Build & Deploy Android App via USB** | Run `android_app/build_and_install.bat` or `apps/Build_And_Install_Android_App.bat` |
| **Compile Desktop .exe** | Run `desktop_app/build_exe.bat` |
| **Flash Wearable Firmware** | Open `wearable/wearable.ino` in Arduino IDE |
| **Flash Receiver Firmware** | Open `receiver/receiver.ino` in Arduino IDE |
| **Run Rescuer Web Dev Server** | Run `npm run dev` inside `backend/` |
