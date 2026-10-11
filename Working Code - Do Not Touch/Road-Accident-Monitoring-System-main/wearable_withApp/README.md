# RAMS Safety Wearable Firmware (App-Assisted LoRa Beacon)

This firmware runs on the **ESP32-S3 SuperMini** board paired with an **SX1278 (Ra-02) LoRa module**.

## System Overview
- **Companion Phone Link (BLE)**: Connects to the RAMS Android mobile app over Bluetooth Low Energy (Nordic UART Service). The phone continuously streams high-accuracy GPS coordinates, IMU data, and crash/shock alerts to the wearable.
- **Base Station Uplink (LoRa)**: The wearable transmits periodic GPS telemetry pings (every 30s) and immediate crash alerts to the RAMS desktop receiver base station over long-range LoRa (433MHz).
- **Physical False Alarm Cancellation**: If an alert is triggered, pressing the onboard button instantly silences the buzzer, restores normal LED status, transmits a `PKT_FALSE_ALARM` cancellation packet via LoRa to the base station, and informs the mobile app over BLE.
- **No Cellular/SIM Required**: Eliminates high-maintenance SIM cards and mobile data plans.

---

## Hardware Pinout (ESP32-S3 SuperMini)

| Peripheral | Board Pin | Description |
|---|---|---|
| **LoRa NSS (CS)** | `GPIO 10` | SPI Chip Select |
| **LoRa MOSI** | `GPIO 11` | SPI MOSI |
| **LoRa SCK** | `GPIO 12` | SPI Clock |
| **LoRa MISO** | `GPIO 13` | SPI MISO |
| **LoRa RST** | `GPIO 9` | Reset (configurable in config.h) |
| **LoRa DIO0** | `GPIO 8` | Packet Interrupt (configurable in config.h) |
| **Active Buzzer** | `GPIO 1` | High = Beep, Low = Silence |
| **Physical Button** | `GPIO 0` | Onboard Boot/User Button (Active LOW) |
| **Status RGB LED** | `GPIO 48` | Onboard WS2812B NeoPixel |

---

## NeoPixel Status Colors

| Color / Pattern | Meaning |
|---|---|
| 🔵 **Pulsing Cyan** | Advertising BLE — Waiting for Android phone to connect |
| 🟡 **Pulsing Yellow** | Connected to phone — Waiting for GPS fix |
| 🟢 **Solid Green** | **Armed & Monitoring** — Phone connected, valid GPS fix, LoRa active |
| 🔴 **Flashing Red SOS** | **CRASH / EMERGENCY ALERT ACTIVE** (Buzzer pulsing) |
| 🔴 **Solid Red** | LoRa hardware initialization error |

---

## Required Libraries in Arduino IDE

Install via **Tools → Manage Libraries...**:
1. **LoRa** by Sandeep Mistry
2. **Adafruit NeoPixel** by Adafruit
3. **ArduinoJson** by Benoit Blanchon (v6 or v7)

*ESP32 board package (`esp32` by Espressif) includes the built-in BLE library.*

---

## Arduino IDE Board Settings

- **Board**: `ESP32S3 Dev Module` (or `ESP32-S3 SuperMini` if installed)
- **USB CDC On Boot**: `Enabled` (for Serial Monitor output)
- **Flash Size**: `4MB`
- **Partition Scheme**: `Default 4MB with spiffs` (or any standard scheme)
