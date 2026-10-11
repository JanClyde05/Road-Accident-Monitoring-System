# RAMS — Whole System Flowchart

> **Road Accident Monitoring System (RAMS) — End-to-End System Architecture & Operational Workflows**  
> *Presentation & System Defense Reference Guide*  
> *Source Codebase: `Working Code - Do Not Touch/Road-Accident-Monitoring-System-main/`*

---

## 1. High-Level System Architecture & Ecosystem Topology

The **Road Accident Monitoring System (RAMS)** is an integrated IoT-RF emergency response network designed to eliminate the fatal delay between a motorcycle or vehicular crash and emergency medical response, particularly in suburban, rural, or cellular dead zones.

```mermaid
flowchart TB
    subgraph SENSING_NODE["🏍️ RIDER SENSING NODE (On-Person / On-Bike)"]
        direction TB
        PHONE["📱 Android Companion App\n• 100Hz Hardware-Fused IMU\n• Multi-GNSS Sub-Meter Location\n• Rider Medical Profile & SOS UI"]
        WEARABLE["⚡ ESP32-S3 Wearable Unit\n• Active Buzzer & NeoPixel Ring\n• Physical False Alarm Button\n• Ra-02 SX1278 LoRa Transmitter (433MHz)\n• BLE Nordic UART Service (NUS)"]
        PHONE <== "BLE (Nordic UART) / 2.4GHz WiFi SoftAP\nTelemetry, GPS & Profile Sync" ==> WEARABLE
    end

    subgraph RF_TRANSMISSION["📡 LONG-RANGE RF LINK (Zero-Cellular Infrastructure)"]
        LORA_AIR["📶 433 MHz LoRa Chirp Spread Spectrum (CSS)\n• Bandwidth: 125 kHz | SF: 9 | CR: 4/5 | Power: 17 dBm\n• Range: Multi-Kilometer Non-Line-of-Sight Coverage"]
    end

    subgraph RECEIVER_GATEWAY["🏢 BASE STATION RECEIVER GATEWAY (Roadside / Emergency Post)"]
        direction TB
        RX_CORE["📥 ESP32-S3 Receiver Unit\n• Ra-02 LoRa Receiver (SPI)\n• NeoPixel Status LED & GPIO Indicator\n• LittleFS Non-Volatile Flash Queue\n• NVS WiFi Credential Manager"]
        AP_PORTAL["📶 WiFi Captive Portal\n'RAMS_Receiver_Setup'\n(Fallback Configuration)"]
        RX_CORE -. "If Unconfigured" .-> AP_PORTAL
    end

    subgraph INGESTION_PATHWAYS["🔀 DUAL INGESTION PATHWAYS"]
        USB_LINK["🔌 USB Serial Direct Tether\n115200 Baud / DTR 8N1\n(Zero-Network Latency)"]
        LAN_LINK["🌐 Local LAN WiFi / TCP\nHTTP POST :8080/api/upload\nTCP Socket Port 8888"]
    end

    subgraph COMMAND_CENTER["🖥️ DISPATCH COMMAND CENTER & RESCUER STATION"]
        direction TB
        DESKTOP_EXE["💻 RAMS Rescuer Desktop App (.exe)\n• Embedded Multi-Threaded HTTP Server\n• Background Serial COM Scanner\n• Local Storage (incidents.json, registrations.json)\n• LAN Wildcard Listener"]
        EDGE_DASHBOARD["🗺️ Rescuer Mission Control Dashboard\n(Edge Chromeless App / Web Browser)\n• Real-Time Incident Map & Siren Strobe\n• Rider Dossier (Blood, Allergies, Contacts)\n• False Alarm Auto-Reconciliation\n• Rescuer Dispatch Status & Audit Log"]
        DESKTOP_EXE <== "Localhost / LAN Loopback" ==> EDGE_DASHBOARD
    end

    WEARABLE ==>|"Binary Packets (Alert, Telemetry, Profile, False Alarm)"| LORA_AIR
    LORA_AIR ==>|"Demodulated RF Signal"| RX_CORE
    RX_CORE ==>|"JSON Telemetry Stream"| USB_LINK
    RX_CORE ==>|"HTTP / TCP Packets"| LAN_LINK
    USB_LINK ==> DESKTOP_EXE
    LAN_LINK ==> DESKTOP_EXE

    style SENSING_NODE fill:#16213e,stroke:#0f3460,stroke-width:2px,color:#fff
    style RF_TRANSMISSION fill:#533483,stroke:#e94560,stroke-width:2px,color:#fff
    style RECEIVER_GATEWAY fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    style INGESTION_PATHWAYS fill:#0f3460,stroke:#533483,stroke-width:2px,color:#fff
    style COMMAND_CENTER fill:#162447,stroke:#1f4068,stroke-width:2px,color:#fff
```

---

## 2. End-to-End Operational Lifecycle Flow

The complete chronological lifecycle of the system from rider prep to emergency resolution:

```mermaid
sequenceDiagram
    autonumber
    actor Rider as 🏍️ Rider
    participant Phone as 📱 Android App
    participant Wearable as ⚡ Wearable ESP32
    participant LoRa as 📡 LoRa 433MHz
    participant Receiver as 📥 Receiver ESP32
    participant Desktop as 🖥️ Desktop Command Center
    actor Rescuer as 🚑 Rescuer / Dispatcher

    %% Phase 1: Pairing & Setup
    rect rgb(24, 32, 54)
    Note over Rider, Desktop: PHASE 1: SYSTEM INITIALIZATION & BLE ARMING
    Rider->>Phone: Open RAMS App, Fill Rider Profile (Blood, Contacts, Plate)
    Phone->>Wearable: BLE Connect (Nordic UART Service)
    Wearable-->>Phone: Confirm Connection (NeoPixel Turns Solid Green)
    Phone->>Wearable: Sync GPS & Rider Profile JSON
    Wearable->>LoRa: loraSendRiderProfile() [233-byte profile packet]
    LoRa->>Receiver: Packet Received & Decoded
    Receiver->>Desktop: Ingest Profile (Serial/HTTP) -> Cache to registrations.json
    end

    %% Phase 2: Cruising Telemetry
    rect rgb(20, 45, 60)
    Note over Rider, Desktop: PHASE 2: ACTIVE MONITORING & TELEMETRY
    loop Every 30 Seconds
        Phone->>Wearable: Send GPS Fix (Lat, Lon, Speed, Altitude)
        Wearable->>LoRa: loraSendTelemetry(Token, Lat, Lon, Battery%)
        LoRa->>Receiver: Forward Telemetry
        Receiver->>Desktop: Update Live Tracking Map
    end
    end

    %% Phase 3: Impact & Pre-Alert Grace Window
    rect rgb(60, 20, 30)
    Note over Rider, Desktop: PHASE 3: IMPACT DETECTION & FALSE ALARM SUPPRESSION
    Rider->>Phone: High-G Crash / Fall Incident Occurs!
    Phone->>Phone: IMU detects aMag > Threshold (or MPU-6050 Shock)
    Phone->>Wearable: BLE Alert Signal (shock=1, aMag)
    Wearable->>Wearable: NeoPixel FLASH RED, Loud Buzzer Alarm Sounds!
    Note over Rider, Wearable: Pre-Alert Grace Period (Rider has opportunity to cancel)
    
    alt Rider Cancels (Minor Drop / False Alarm)
        Rider->>Wearable: Press Physical Hardware Button (or Phone "Cancel" button)
        Wearable->>Wearable: Buzzer Silenced, NeoPixel returns to Armed Green
        Wearable->>Phone: BLE Cancel Ack
        Wearable->>LoRa: loraSendFalseAlarm(Token, Lat, Lon)
        LoRa->>Receiver: False Alarm Packet
        Receiver->>Desktop: Ingest False Alarm Event
        Desktop->>Desktop: Mark Active Incident as "FALSE ALARM / DISMISSED"
    else Grace Period Expires (Unconscious / Real Severe Crash)
        Note over Wearable, Rescuer: CRASH CONFIRMED: IMMEDIATE ESCALATION
        Wearable->>LoRa: loraSendAlert(Token, Lat, Lon, aMag, EventType)
        LoRa->>Receiver: Emergency Packet Transmitted (SF9 433MHz)
        Receiver->>Receiver: NeoPixel Red Strobe, Status LED Rapid Blink
        
        alt WiFi Connected
            Receiver->>Desktop: HTTP POST /api/upload (Immediate Alert)
        else WiFi Down
            Receiver->>Receiver: Buffer Alert to LittleFS Offline Queue
            Note over Receiver: Retries upload until network restores
        end

        Receiver->>Desktop: Serial COM Stream: Raw JSON Alert Packet
        Desktop->>Desktop: Play Siren Alert, Pinpoint GPS Coordinates on Radar Map
        Desktop->>Desktop: Enrich with Rider Medical Profile (Blood type, Emergency contact, Photo)
        Desktop->>Rescuer: Display Priority Alert Screen with Route & Triage Data
        Rescuer->>Desktop: Click "Acknowledge & Dispatch Response Unit"
    end
    end
```

---

## 3. Crash Detection & State Machine Flow

The decision-making hierarchy inside the sensing unit (Phone IMU + Wearable ESP32):

```mermaid
flowchart TD
    START(["🏍️ Normal Riding / Monitoring"]) --> SENSORS["Continuous Sensor Sampling\n• Phone: 100Hz Accelerometer & Gyroscope\n• Wearable: MPU-6050 & External GPS Stream"]
    
    SENSORS --> CALC["Calculate Acceleration Vector Magnitude:\naMag = sqrt(ax² + ay² + az²)\nCalculate Angular Deviation:\nPitch & Roll from Horizontal"]

    CALC --> IMPACT_CHK{"Impact Condition Met?\n• aMag >= 3.5G (High Impact)\n• Sudden Tilt > 65° with Zero Speed\n• Manual SOS Pressed?"}

    IMPACT_CHK -- No --> NORMAL_TEL{"Telemetry Timer\nElapsed (30s)?"}
    NORMAL_TEL -- Yes --> SEND_TEL["Transmit Heartbeat Telemetry\n(GPS, Speed, Battery)"]
    NORMAL_TEL -- No --> SENSORS
    SEND_TEL --> SENSORS

    IMPACT_CHK -- Yes --> PRE_ALERT["🚨 TRIGGER PRE-ALERT SEQUENCE\n• NeoPixel: Strobe Vibrant Red\n• Buzzer: High-Decibel Warning Pattern\n• Phone Display: 15-Second Emergency Countdown"]

    PRE_ALERT --> COUNTDOWN{"Rider Cancels Within\nGrace Period?\n(Wearable Button OR Phone Screen)"}

    COUNTDOWN -- "YES (Button Pressed / Screen Cancelled)" --> DISMISS["📵 SUPPRESS FALSE ALARM\n• Stop Buzzer & Reset NeoPixel\n• Compile PKT_FALSE_ALARM (Type=2)\n• Send LoRa Cancellation Packet\n• Log Event as Resolved False Alarm"]
    DISMISS --> START

    COUNTDOWN -- "NO (Timer Reaches 0 / Rider Incapacitated)" --> LOCK_ALERT["🚨 ACCIDENT CONFIRMED\n• Lock Alert State\n• Read Precision Multi-GNSS Fix (Lat, Lon)\n• Compile Binary PKT_ALERT (Type=1)\n• Transmit over LoRa 433MHz\n• Continuous Beaconing until Dispatch ACK"]

    LOCK_ALERT --> BROADCAST["Radio Broadcast to Rescuer Stations"]

    style START fill:#1b4965,stroke:#62b6cb,color:#fff
    style PRE_ALERT fill:#d90429,stroke:#ef233c,color:#fff
    style DISMISS fill:#2a9d8f,stroke:#264653,color:#fff
    style LOCK_ALERT fill:#7209b7,stroke:#f72585,color:#fff
```

---

## 4. Multi-Layer Fail-Safe & Network Redundancy Flow

How the system guarantees zero data loss even during complete infrastructure failure:

```mermaid
flowchart TD
    CRASH(["💥 Emergency Alert Generated"]) --> WEARABLE_TX["Wearable LoRa Transmitter\n(Independent of cellular towers / mobile data)"]
    
    WEARABLE_TX --> LORA_AIR["Airborne 433MHz LoRa Packet\nPenetrates foliage, terrain, and weather"]
    
    LORA_AIR --> BASE_STATION["Base Station Gateway Receiver"]
    
    BASE_STATION --> DUAL_INGEST{"Evaluate Gateway Output Channels"}

    %% Path A: Direct USB
    DUAL_INGEST -->|Channel 1: Direct Physical| USB_SERIAL["🔌 USB Serial COM Port\n(Zero Network Dependency)"]
    USB_SERIAL --> DESKTOP_IN["Desktop App Serial Bridge Worker\n(Reads raw JSON line directly)"]

    %% Path B: Local Network / WiFi
    DUAL_INGEST -->|Channel 2: Network| WIFI_STATUS{"Gateway WiFi\nStatus?"}
    
    WIFI_STATUS -- "Connected" --> HTTP_POST["🌐 HTTP POST to /api/upload\nTarget: Desktop LAN IP:8080"]
    HTTP_POST --> DESKTOP_HTTP["Desktop Embedded HTTP Server\nIngests payload instantly"]
    
    WIFI_STATUS -- "Disconnected / Router Down" --> FLASH_QUEUE["💾 LittleFS Non-Volatile Flash Queue\nSave alert to persistent onboard storage\n(Max 64 queued events)"]
    
    FLASH_QUEUE --> RETRY_DAEMON{"WiFi Connection\nRestored?"}
    RETRY_DAEMON -- Yes --> DRAIN_QUEUE["🔄 Drain Queue in FIFO order\nPost all backlogged incidents to Server"]
    RETRY_DAEMON -- No --> KEEP_BUFFER["Retain in Flash Memory\n(Zero loss upon reboot)"]
    DRAIN_QUEUE --> DESKTOP_HTTP

    DESKTOP_IN --> PERSISTENCE["Local Storage Engine\n• Write to incidents.json\n• Cross-reference registrations.json\n• Trigger Map Update & Siren Strobe"]
    DESKTOP_HTTP --> PERSISTENCE

    style CRASH fill:#d90429,stroke:#fff,color:#fff
    style USB_SERIAL fill:#2b9348,stroke:#fff,color:#fff
    style FLASH_QUEUE fill:#e85d04,stroke:#fff,color:#fff
    style PERSISTENCE fill:#0077b6,stroke:#fff,color:#fff
```

---

## 5. Rescuer Command Center & Dispatch Flow

The operational flow on the Rescuer Desktop Application upon receiving an incident:

```mermaid
flowchart TD
    PACKET_IN["📥 New Alert Ingested\n(via USB Serial or HTTP /api/upload)"] --> DEDUPL{"Is this a duplicate\npacket within 5s?"}
    
    DEDUPL -- Yes --> UPDATE_RSSI["Update RSSI & Last Seen Timestamp"]
    DEDUPL -- No --> PARSE_EVT["Build Incident Model\n• Event ID: RAMS-ALERT-yyyyMMdd-HHmmss\n• Lat / Lon Coordinates\n• Impact Magnitude (G-Force)\n• Timestamp"]

    PARSE_EVT --> PROFILE_MATCH{"Device Token Match in\nregistrations.json?"}
    
    PROFILE_MATCH -- "Match Found" --> HYDRATE["🗂️ Enrich Incident with Rider Dossier:\n• Full Name & Photo\n• Blood Type & Allergies\n• Emergency Contact Phone & Name\n• Vehicle Model & Plate Number"]
    PROFILE_MATCH -- "Not Found" --> UNREGISTERED["Mark as 'Unknown Rider / Unregistered Token'\nDisplay raw token on radar"]

    HYDRATE --> UI_UPDATE
    UNREGISTERED --> UI_UPDATE

    UI_UPDATE["🚨 Trigger Dispatch Station Alerts:\n1. Play Urgent Siren Sound Loop\n2. Center Tactical Map on GPS Fix\n3. Flash Incident Banner (RED ALERT)\n4. Generate Quick Route Navigation Link"]

    UI_UPDATE --> RESCUER_ACTION{"Rescuer Triage Action"}

    RESCUER_ACTION --> ACK["🚑 Click 'Dispatch Unit'\n• Status: DISPATCHED\n• Time logged in incidents.json"]
    RESCUER_ACTION --> CALL_CONTACT["📞 Click Emergency Contact Phone Link\nCall relatives / next-of-kin directly"]
    RESCUER_ACTION --> HOSP["🏥 Notify Designated Trauma Center\nSend Blood Type & G-Force telematics"]
    RESCUER_ACTION --> RESOLVE["✅ Click 'Resolve Incident'\n• Status: RESOLVED\n• Archive record to database"]

    style PACKET_IN fill:#1a1a2e,stroke:#e94560,color:#fff
    style HYDRATE fill:#0f3460,stroke:#16213e,color:#fff
    style UI_UPDATE fill:#e94560,stroke:#fff,color:#fff
    style ACK fill:#27ae60,stroke:#fff,color:#fff
```

---

## 6. False Alarm Reconciliation Flow

How accidental triggers (dropping a phone, pothole bump) are cleanly cancelled without wasting municipal emergency resources:

```mermaid
flowchart TD
    ALARM_ACTIVE["🚨 Active Alert Visible on Rescuer Command Center\nStatus: 'CRITICAL / ACTIVE' | Siren Sounding"] --> EVENT_OCCURS["Rider realizes false alarm\n(e.g., dropped device or low-speed slip)"]

    EVENT_OCCURS --> CANCEL_INPUT{"Cancellation Trigger"}
    CANCEL_INPUT -->|Input A| WEARABLE_BTN["Press Wearable Physical Button\n(debounced GPIO pin)"]
    CANCEL_INPUT -->|Input B| PHONE_BTN["Tap 'Cancel Alarm' in Android App\n(sent to ESP32 over BLE)"]

    WEARABLE_BTN --> CANCEL_PROC["Wearable Firmware:\n1. detectionAcknowledgeAlert()\n2. buzzerOff() & NeoPixel → Solid Green\n3. Format PKT_FALSE_ALARM (Type=2)"]
    PHONE_BTN --> CANCEL_PROC

    CANCEL_PROC --> LORA_SEND["loraSendFalseAlarm(token, lat, lon)\nBroadcast via 433MHz LoRa"]

    LORA_SEND --> RX_DECODE["Receiver Base Station:\n1. Decode packetType == PKT_FALSE_ALARM\n2. NeoPixel flashes Green/Cyan Confirmation\n3. Forward to Desktop via Serial & HTTP"]

    RX_DECODE --> DESKTOP_MATCH["Desktop ProcessIncomingPayload():\n• Search _eventsJsonList for matching deviceToken\n• If found, transition Status: 'FALSE ALARM'\n• If not found, cancel most recent active alert"]

    DESKTOP_MATCH --> UI_CLEANUP["🖥️ Desktop Dashboard Updates:\n1. Siren Immediately Silenced\n2. Alert Banner changes to Green/Muted Grey\n3. Map Pin changed to 'False Alarm Resolved'\n4. Dispatchers Notified: 'Response Standdown'"]

    style ALARM_ACTIVE fill:#e94560,stroke:#fff,color:#fff
    style CANCEL_PROC fill:#f39c12,stroke:#fff,color:#fff
    style DESKTOP_MATCH fill:#27ae60,stroke:#fff,color:#fff
    style UI_CLEANUP fill:#2980b9,stroke:#fff,color:#fff
```

---

## 7. System Hardware Interconnection & Pinout Map

Schematic summary of all physical hardware interfaces across both nodes:

```mermaid
graph LR
    subgraph WEARABLE_NODE["Wearable Node (ESP32-S3 SuperMini)"]
        W_MCU["ESP32-S3"]
        W_LORA["Ra-02 LoRa (SX1278)\n433 MHz"]
        W_NEO["WS2812B NeoPixel\nLED Ring"]
        W_BZR["Active Buzzer"]
        W_BTN["Emergency / Cancel\nPush Button"]
        W_BAT["Battery Voltage Divider\n(100k / 100k)"]

        W_MCU ---|"GPIO 10 (NSS)\nGPIO 12 (SCK)\nGPIO 11 (MOSI)\nGPIO 13 (MISO)"| W_LORA
        W_MCU ---|"GPIO 48"| W_NEO
        W_MCU ---|"GPIO 4"| W_BZR
        W_MCU ---|"GPIO 5"| W_BTN
        W_MCU ---|"GPIO 2 (ADC)"| W_BAT
    end

    subgraph RECEIVER_NODE["Receiver Node (ESP32-S3 SuperMini)"]
        R_MCU["ESP32-S3"]
        R_LORA["Ra-02 LoRa (SX1278)\n433 MHz"]
        R_NEO["WS2812B NeoPixel\nStatus Indicator"]
        R_LED["GPIO Status LED"]
        R_USB["USB-C Hardware Serial\n(115200 Baud)"]

        R_MCU ---|"GPIO 10 (NSS)\nGPIO 9 (RST)\nGPIO 8 (DIO0)\nGPIO 12 (SCK)\nGPIO 11 (MOSI)\nGPIO 13 (MISO)"| R_LORA
        R_MCU ---|"GPIO 48"| R_NEO
        R_MCU ---|"GPIO 2"| R_LED
        R_MCU ---|"Native CDC / UART"| R_USB
    end

    W_LORA -. "Wireless RF (433MHz CSS)" .-> R_LORA
    R_USB ==>|"Raw JSON Packets"| PC["Rescuer PC / Command Station"]
```

---

## 8. Summary Comparison of System Operational States

| System State | Wearable NeoPixel | Wearable Buzzer | Receiver NeoPixel | Desktop Dashboard Status | Rescuer Action Required |
|:---|:---|:---|:---|:---|:---|
| **Boot / Init** | Pulsing Cyan | Single Chirp | Pulsing Blue | Ready / Standby | None (Self-test) |
| **Armed & Cruising** | Solid Green | Silent | Solid Green (Online) | Live Tracking (Normal) | Monitoring routine telemetry |
| **Pre-Alert (Crash Suspected)** | Flashing Red (Fast) | Urgent Strobe Beep | Solid Green | No alert yet (Grace window) | Rider given 15s to cancel |
| **Confirmed Crash Alert** | Strobe Bright Red | Continuous Siren | Strobe Bright Red | **CRITICAL RED ALERT** | **Immediate Medical Dispatch** |
| **False Alarm Cancelled** | Solid Green | Double Confirm Chirp | Strobe Cyan/Green | Muted Grey ("False Alarm") | Stand down response unit |
| **RF / LoRa Disconnected** | Solid Red | Long Error Tone | Solid Yellow (Offline) | Warning: "Node Inactive" | Investigate node signal range |

---

*Generated from verified implementation in `Working Code - Do Not Touch/Road-Accident-Monitoring-System-main/`*
