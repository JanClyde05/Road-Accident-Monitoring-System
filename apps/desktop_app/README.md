# RAMS Standalone Desktop Rescuer Application

**Road Accident Monitoring System (RAMS)** — Native Windows Desktop Command & Dispatch Center.

---

## Overview

The **RAMS Rescuer Desktop Application** is a standalone, zero-external-dependency Windows desktop program packaged as `RAMS_Rescuer_Desktop.exe`. It allows emergency rescue dispatchers, hospital triage teams, and mobile incident command vehicles to monitor live road accident telemetry completely offline with **zero reliance on internet connectivity or cloud servers**.

---

## Features

1. **Zero-Dependency Native Windows Executable**:
   - Compiles via Windows built-in C# compiler (`csc.exe` in `Microsoft.NET\Framework64\v4.0.30319`).
   - Requires no Node.js, Python, or external software runtimes to run.
2. **Embedded Multi-Threaded HTTP Server**:
   - Serves the high-performance React/Vite dashboard locally at `http://127.0.0.1:8080`.
   - Automatically finds the next available port if 8080 is already occupied.
3. **Direct LoRa Base Station Ingestion (`/api/upload`)**:
   - The ESP32 LoRa Receiver Base Station can transmit decoded LoRa alerts directly to the desktop computer over local Wi-Fi or Ethernet LAN (`http://<DESKTOP_IP>:8080/api/upload`).
   - Alerts are immediately parsed, saved to `incidents.json`, and displayed on the tactical map in real time.
4. **Persistent Local Incident Storage**:
   - All received accidents and test transmissions are saved to `incidents.json` on disk.
5. **Dedicated Chromeless Application Window**:
   - Launches through Microsoft Edge in dedicated App Mode (`--app=http://...`) without browser address bars, navigation buttons, or tabs.
   - Clean, dark-mode tactical command interface.

---

## File Structure

```
desktop_app/
├── RAMS_Rescuer_Desktop.exe  # Standalone Windows Executable (Ready to run)
├── Program.cs                # C# Native Server & Edge App Host source
├── build_exe.bat             # Recompiles RAMS_Rescuer_Desktop.exe in 1 second
├── launch_desktop.bat        # One-click launcher
├── incidents.json            # Local persistent incident database
├── www/                      # Embedded React/Vite Rescuer Dashboard assets
│   ├── index.html
│   ├── logo.jpg
│   └── assets/               # Pre-bundled JS and CSS
└── README.md                 # This documentation file
```

---

## Quick Start

### 1. Launching the App
Double-click `launch_desktop.bat` or run:
```cmd
RAMS_Rescuer_Desktop.exe
```

### 2. Rebuilding the Executable
If you ever modify `Program.cs`, recompile anytime in 1 second:
```cmd
build_exe.bat
```

### 3. Pointing the ESP32 Receiver to the Desktop App
In `receiver/config.h` or via the receiver captive portal:
```cpp
#define SERVER_HOST "192.168.1.100"  // Your desktop PC's local LAN IP
#define SERVER_PORT 8080
#define SERVER_PATH "/api/upload"
```
The desktop app will receive, log, and display all LoRa emergency packets locally with zero internet delay!
