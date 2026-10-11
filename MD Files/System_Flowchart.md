# RAMS — System Flowchart (System Architecture & Data Flow)

> **Road Accident Monitoring System (RAMS)**  
> **Formal System Flowchart for Presentation Slides, Project Documentation, and Defense**  
> *Reference Codebase: `Working Code - Do Not Touch/Road-Accident-Monitoring-System-main/`*  
> *Target Competition/Defense: PGC Digital Innovation Challenge / Capstone Engineering*

---

## 1. Overview & System Flowchart Definition

A **System Flowchart** illustrates the physical flow of data, control signals, and operations across all physical hardware entities, communication channels, storage media, and human interfaces in the entire ecosystem.

### Standard System Flowchart Symbols Used:
- `[/Input / Output / Data/]` — External signals, sensor feeds, user inputs, and transmitted packets.
- `[System Process]` — Microcontroller execution, data transformation, or server computation.
- `[(Direct Access Storage)]` — Non-volatile storage (LittleFS flash, NVS memory, local JSON database).
- `[\Manual Input / Operation/]` — Physical button presses, user UI interactions.
- `>Display / Audio Output]` — NeoPixel illumination, buzzer alarms, tactical map visual alerts.
- `{Decision / Conditional Gateway}` — Hardware/network state evaluation.

---

## 2. Master System Flowchart (End-to-End Hardware & Data Flow)

![Master System Flowchart](graphics/System_Flowchart_Master.png)

> **High-Resolution Formats:**  
> • [Download Vector SVG](graphics/System_Flowchart_Master.svg) *(infinite resolution zoom for posters/slides)*  
> • [Download 300 DPI PNG](graphics/System_Flowchart_Master.png) *(ready for PowerPoint / Canva / Google Slides)*

<details>
<summary><b>Click to View Mermaid Source Code</b></summary>

```mermaid
flowchart TD
    %% ENTITY 1: INPUT SENSORS & USER
    subgraph SENSING_STAGE["STAGE 1: INPUT ACQUISITION & SENSING"]
        GPS_SAT["🛰️ Multi-GNSS Constellation\n(GPS / BeiDou Satellites)"]
        PHYS_ACCEL["🏃 Physical Motion / Crash Event\n(Impact G-Force & Orientation Change)"]
        USER_ACTION["\Rider Physical Input\n(Pushbutton / Phone UI)/"]

        PHONE_IMU["[/Smartphone 100Hz Fused IMU\nAccelerometer & Gyroscope/]"]
        PHONE_GNSS["[/Smartphone Dual-Band GNSS\nSub-meter Coordinate Stream/]"]
        WEARABLE_BTN["[/Wearable Physical Pushbutton\nGPIO 5 Hardware Interrupt/]"]

        PHYS_ACCEL --> PHONE_IMU
        GPS_SAT --> PHONE_GNSS
        USER_ACTION --> WEARABLE_BTN
    end

    %% ENTITY 2: SENSING & WEARABLE PROCESSING
    subgraph WEARABLE_STAGE["STAGE 2: WEARABLE ON-PERSON NODE (ESP32-S3)"]
        BLE_LINK["[/Nordic UART BLE Wireless Link\n2.4GHz ISM Band/]"]
        PHONE_GNSS --> BLE_LINK
        PHONE_IMU --> BLE_LINK

        MCU_WEARABLE["[ESP32-S3 Wearable Firmware\nCrash FSM & Telemetry Engine]"]
        BLE_LINK --> MCU_WEARABLE
        WEARABLE_BTN --> MCU_WEARABLE

        BZR_OUT[">Active Buzzer Audible Alarm\nGPIO 4 High-Decibel Siren]"]
        NEO_OUT[">WS2812B NeoPixel Status LED\nGPIO 48 RGB Color Ring]"]

        MCU_WEARABLE --> BZR_OUT
        MCU_WEARABLE --> NEO_OUT

        LORA_TX_RADIO["[Ra-02 LoRa SX1278 Transmitter\nSPI Bus: MOSI=11, MISO=13, SCK=12, NSS=10]"]
        MCU_WEARABLE --> LORA_TX_RADIO
    end

    %% ENTITY 3: RF TELEMETRY LINK
    subgraph RF_STAGE["STAGE 3: WIRELESS RF TELEMETRY CHANNEL"]
        LORA_RF["[/433 MHz Chirp Spread Spectrum (CSS)\nBW=125kHz, SF=9, CR=4/5, Power=17dBm\nNon-Line-of-Sight Long Range RF Link/]"]
        LORA_TX_RADIO --> LORA_RF
    end

    %% ENTITY 4: BASE STATION RECEIVER GATEWAY
    subgraph GATEWAY_STAGE["STAGE 4: BASE STATION RECEIVER GATEWAY (ESP32-S3)"]
        LORA_RX_RADIO["[Ra-02 LoRa SX1278 Receiver\nSPI Bus: DIO0=8, RST=9, NSS=10]"]
        LORA_RF --> LORA_RX_RADIO

        MCU_RX["[ESP32-S3 Receiver Controller\nPacket Demodulator & Dispatcher]"]
        LORA_RX_RADIO --> MCU_RX

        RX_STORAGE[("[(LittleFS Flash Memory)]\nNon-Volatile Offline FIFO Queue\nMax 64 Incidents Saved")]
        RX_NVS[("[(NVS EEPROM)]\nStored WiFi Credentials & Config")]

        MCU_RX <--> RX_STORAGE
        MCU_RX <--> RX_NVS

        RX_NEO[">NeoPixel Gateway Status Indicator\nBlue=Flash, Red=Alert, Green=Online]"]
        MCU_RX --> RX_NEO
    end

    %% ENTITY 5: INGESTION & DISPATCH
    subgraph TRANSMISSION_STAGE["STAGE 5: DUAL INGESTION CHANNELS"]
        USB_UART["[/Direct Hardware USB-CDC Serial\n115200 Baud JSON Stream/]"]
        WIFI_NET["[/Local WiFi LAN Network\nHTTP POST :8080/api/upload | TCP :8888/]"]

        MCU_RX --> USB_UART
        MCU_RX --> WIFI_NET
    end

    %% ENTITY 6: COMMAND CENTER & STORAGE
    subgraph DISPATCH_STAGE["STAGE 6: DISPATCH COMMAND CENTER & DISPLAY"]
        DESKTOP_SERVER["[RAMS Rescuer Desktop Engine\nC# Multi-Threaded HTTP & Serial Worker]"]
        USB_UART --> DESKTOP_SERVER
        WIFI_NET --> DESKTOP_SERVER

        DB_INCIDENTS[("[(incidents.json)]\nMaster Incident Audit Database")]
        DB_REGISTRATIONS[("[(registrations.json)]\nRider Medical Dossier Registry")]

        DESKTOP_SERVER <--> DB_INCIDENTS
        DESKTOP_SERVER <--> DB_REGISTRATIONS

        DASHBOARD_UI[">Tactical Emergency Radar Map\nMicrosoft Edge App Mode 127.0.0.1:8080\nAudio Siren, Blood Type, Contact & Route Link]"]
        DESKTOP_SERVER --> DASHBOARD_UI

        RESCUER_ACTION["\Emergency Rescuer Action\nDispatches Medical Team / Stands Down/"]
        DASHBOARD_UI --> RESCUER_ACTION
    end

    style SENSING_STAGE fill:#1a1c2e,stroke:#4a5568,color:#fff
    style WEARABLE_STAGE fill:#162447,stroke:#1f4068,color:#fff
    style RF_STAGE fill:#3d1a54,stroke:#7b2cbf,color:#fff
    style GATEWAY_STAGE fill:#1f2937,stroke:#374151,color:#fff
    style TRANSMISSION_STAGE fill:#111827,stroke:#10b981,color:#fff
    style DISPATCH_STAGE fill:#0f172a,stroke:#3b82f6,color:#fff
```
</details>

---

## 3. Subsystem Data Flow: Normal Telemetry vs. Emergency Crash Incident

![Routine Telemetry vs Emergency Crash Escalation](graphics/System_Flowchart_Routine_vs_Crash.png)

> **High-Resolution Formats:**  
> • [Download Vector SVG](graphics/System_Flowchart_Routine_vs_Crash.svg)  
> • [Download 300 DPI PNG](graphics/System_Flowchart_Routine_vs_Crash.png)

<details>
<summary><b>Click to View Mermaid Source Code</b></summary>

```mermaid
flowchart LR
    subgraph NORMAL_PATH["PATH A: ROUTINE MONITORING (Every 30s)"]
        direction TB
        N_IN["[/GPS Coords + Speed + Battery%/]"] --> N_WEAR["Wearable Packet Builder"]
        N_WEAR --> N_PKT["[/PKT_TELEMETRY (Type 0)/]"]
        N_PKT --> N_RF["LoRa 433MHz Transmission"]
        N_RF --> N_RX["Receiver Base Station"]
        N_RX --> N_SRV["Desktop Server"]
        N_SRV --> N_MAP[">Update Live Marker on Tactical Map]"]
    end

    subgraph CRASH_PATH["PATH B: EMERGENCY ACCIDENT ESCALATION"]
        direction TB
        C_IN["[/High-G Impact (aMag >= 3.5G) / Sudden Tilt/]"] --> C_GRACE["15s Grace Period Countdown\n(Buzzer + Red Flash)"]
        C_GRACE --> C_CHK{"Rider Cancelled?"}
        C_CHK -- Yes --> C_FA["[/PKT_FALSE_ALARM (Type 2)/]"]
        C_CHK -- No --> C_ALERT["[/PKT_ALERT (Type 1)\n+ Lat, Lon, aMag, Token/]"]
        C_ALERT --> C_RF["LoRa 433MHz Emergency Broadcast"]
        C_RF --> C_RX["Receiver Gateway (Strobe Alert)"]
        C_RX --> C_FAIL{"Gateway WiFi Active?"}
        C_FAIL -- Yes --> C_POST["HTTP POST /api/upload"]
        C_FAIL -- No --> C_QUEUE[("Save to LittleFS Queue")]
        C_POST --> C_DSK["Desktop Command Center"]
        C_QUEUE -. Retries .-> C_POST
        C_DSK --> C_SIREN[">Trigger Emergency Siren Loop\nDisplay Medical Dossier & Route]"]
    end

    style NORMAL_PATH fill:#132a13,stroke:#31572c,color:#fff
    style CRASH_PATH fill:#49111c,stroke:#8f1d2c,color:#fff
```
</details>

---

## 4. Subsystem Data Flow: Zero-Cellular Resilience & Storage Failover

![Zero-Cellular Resilience & Storage Failover](graphics/System_Flowchart_Storage_Failover.png)

> **High-Resolution Formats:**  
> • [Download Vector SVG](graphics/System_Flowchart_Storage_Failover.svg)  
> • [Download 300 DPI PNG](graphics/System_Flowchart_Storage_Failover.png)

<details>
<summary><b>Click to View Mermaid Source Code</b></summary>

```mermaid
flowchart TD
    ALERT_TRIGGER["[/Emergency Alert Packet Emitted by Wearable/]"] --> LORA_MEDIUM["Airborne LoRa Signal (Zero Tower Dependency)"]
    LORA_MEDIUM --> RX_HARDWARE["Base Station Receiver Hardware"]

    RX_HARDWARE --> CHECK_DIRECT{"USB Cable Plugged\ninto Rescuer PC?"}
    
    CHECK_DIRECT -- "YES (Tethered)" --> SERIAL_DATA["[/Serial JSON Stream over USB-CDC/]"]
    SERIAL_DATA --> PC_INGEST["Instant Desktop Ingest (0ms Network Latency)"]

    CHECK_DIRECT -- "NO (Remote Post)" --> CHECK_WIFI{"Local WiFi / Router\nReachable?"}
    
    CHECK_WIFI -- "YES (WiFi Online)" --> HTTP_REQ["[/HTTP POST /api/upload (Port 8080)/]"]
    HTTP_REQ --> PC_INGEST

    CHECK_WIFI -- "NO (Power/Internet Outage)" --> SAVE_FLASH[("[(LittleFS Non-Volatile Flash)]\nWrite Alert Record to /queue.bin")]
    SAVE_FLASH --> BACKGROUND_TIMER["Timer Daemon (Checks WiFi every 10s)"]
    BACKGROUND_TIMER --> RETRY_CONN{"WiFi Restored?"}
    RETRY_CONN -- "NO" --> SAVE_FLASH
    RETRY_CONN -- "YES" --> READ_FLASH["Read Queue in FIFO Order"]
    READ_FLASH --> HTTP_REQ

    PC_INGEST --> WRITE_DB[("[(incidents.json)]\nAppend to Permanent Storage")]
    WRITE_DB --> UPDATE_GUI[">Real-Time UI Update & Audio Siren Alert]"]

    style ALERT_TRIGGER fill:#b91c1c,stroke:#fff,color:#fff
    style PC_INGEST fill:#1d4ed8,stroke:#fff,color:#fff
    style SAVE_FLASH fill:#d97706,stroke:#fff,color:#fff
    style UPDATE_GUI fill:#059669,stroke:#fff,color:#fff
```
</details>

---

## 5. Slide Presentation Notes & Explanations (For Presenter / Defense)

### Slide 1: System Flowchart Overview
> *"Judges/Panel, this System Flowchart illustrates the end-to-end data lifecycle of the Road Accident Monitoring System across all physical layers. The system is split into six clear stages: Input Acquisition, Wearable Edge Processing, LoRa Telemetry, Base Station Ingestion, Dual Ingestion Channels, and the Rescuer Command Center."*

### Slide 2: Eliminating the Cellular Bottleneck
> *"Unlike commercial smartwatches that depend on an expensive mobile data plan and active cellular towers, RAMS utilizes an onboard 433 MHz LoRa transceiver. Sensor data processed at the edge is packetized and transmitted directly over radio frequency, penetrating foliage and terrain to reach rural health units or roadside rescue posts up to several kilometers away."*

### Slide 3: Dual-Channel Redundancy & Zero Data Loss
> *"At the base station, data redundancy is built into the architecture. In a stationary deployment, the receiver connects directly to the rescuer laptop via USB-CDC serial, ensuring zero network latency. If placed on a high antenna tower, it transmits over WiFi LAN. Should local power or router connectivity fail, an onboard LittleFS non-volatile flash queue buffers all emergency records until reconnection, guaranteeing zero lost accident reports."*
