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

## JLCPCB J2 battery profile (2026-11-09)

Build all sketch C++ files with `-DRAMS_JLC_S3_J2` for the AP2112-based J2 PCB.
This selects its 30 kΩ/10 kΩ divider on GPIO2, DMN2056U-7 isolation FET with its
gate tied to 3V3, and 1 nF filter. The board requires no GPIO to enable sensing.
The profile averages 16 calibrated `analogReadMilliVolts()` samples and multiplies
by four: 750/900/1050 mV at the ADC means 3.00/3.60/4.20 V at the battery.
GPIO2 uses `ADC_2_5db`; Espressif specifies a 0–1250 mV range for ESP32-S3 at this
attenuation. The existing five-second update interval and smoothing remain unchanged.
[Espressif ADC API](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html)

Arduino-ESP32 3.3.5 creates its calibration handle using the global attenuation
setting. It also requires the ADC pin to be attached before per-pin configuration.
The J2 initialization therefore sets the global default to 2.5 dB, performs one
discarded raw read to attach GPIO2, then configures the pin. GPIO2 is currently the
only ADC channel in this firmware; review this initialization if another ADC input
is added. Without the build define, the existing SuperMini raw ADC conversion and
100 kΩ/100 kΩ divider behavior remain unchanged.

The percentage is an approximate voltage-based indicator, not a cell protection
cutoff. Confirm the assembled board's reported voltage against a meter at 3.0,
3.6 and 4.2 V. Radio and packet behavior remain unchanged.

The same J2 define selects a one-pixel RMT sender for the new WS2812B-2020.
It retains the existing brightness, GRB buffer and status animation. At 10 MHz,
zero is 300 ns high / 1000 ns low, one is 700 ns high / 600 ns low, and each
frame ends with 300 us low reset. The default Supermini uses the original
Adafruit sender. These targets match the checked 2020 V1.3/V6 references;
received LED identity, supply range and the actual waveform still need bench
qualification. The GPIO48 signal passes through the new PCB's U6 translator.

Run the host calculation/behavior check from the repository root with an installed
C++17 compiler:

```powershell
python validation/test_battery_profiles.py --cxx 'D:/CLion 2025.2.1/bin/mingw/bin/g++.exe'
python validation/test_neopixel_j2.py --cxx 'D:/CLion 2025.2.1/bin/mingw/bin/g++.exe'
```

It compiles the actual battery implementation for both profiles, supplies fake ADC
samples, and checks conversion, sample averaging, attenuation initialization and
the existing update interval/filter. It does not measure hardware accuracy.
