const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const graphicsDir = path.join(__dirname, 'graphics');
if (!fs.existsSync(graphicsDir)) {
  fs.mkdirSync(graphicsDir, { recursive: true });
}

// 1. MASTER SYSTEM FLOWCHART
const systemFlowchartMaster = `flowchart TD
    %% STAGE 1: SENSING
    subgraph STAGE1["STAGE 1: INPUT ACQUISITION & SENSING"]
        GPS_SAT["Multi-GNSS Satellites\\n(GPS / BeiDou Constellation)"]
        PHYS_MOTION["Physical Motion / Crash Event\\n(G-Force Shock & Tilt Angle)"]
        RIDER_IN["Rider Physical Interaction\\n(SOS Button / Phone UI)"]

        PHONE_IMU[/"Smartphone 100Hz IMU\\n(Accelerometer & Gyroscope)"/]
        PHONE_GPS[/"Smartphone Dual-Band GNSS\\n(Sub-meter Lat / Lon Stream)"/]
        WEAR_BTN[/"Wearable Physical Pushbutton\\n(GPIO 5 Debounced Interrupt)"/]

        PHYS_MOTION --> PHONE_IMU
        GPS_SAT --> PHONE_GPS
        RIDER_IN --> WEAR_BTN
    end

    %% STAGE 2: WEARABLE
    subgraph STAGE2["STAGE 2: WEARABLE ON-PERSON NODE (ESP32-S3)"]
        BLE_LINK[/"BLE Nordic UART Service (NUS)\\n(2.4GHz High-Speed Wireless)"/]
        PHONE_GPS --> BLE_LINK
        PHONE_IMU --> BLE_LINK

        MCU_WEAR["ESP32-S3 Wearable Core\\n• Real-Time FSM Crash Classifier\\n• Periodic 30s Telemetry Engine\\n• False Alarm Grace Window Manager"]
        BLE_LINK --> MCU_WEAR
        WEAR_BTN --> MCU_WEAR

        BZR_ALARM>"Active Buzzer Siren (GPIO 4)\\nAudible Pre-Alert Warning"]
        NEO_RING>"WS2812B NeoPixel Ring (GPIO 48)\\nVisual State & Red Strobe Indicator"]
        MCU_WEAR --> BZR_ALARM
        MCU_WEAR --> NEO_RING

        LORA_TX["Ra-02 LoRa SX1278 Transmitter\\n(SPI: SCK=12, MISO=13, MOSI=11, NSS=10)"]
        MCU_WEAR --> LORA_TX
    end

    %% STAGE 3: RF TELEMETRY
    subgraph STAGE3["STAGE 3: WIRELESS RF TELEMETRY CHANNEL"]
        LORA_CH[/"433 MHz Chirp Spread Spectrum (CSS)\\nBW=125kHz | SF=9 | CR=4/5 | Power=17dBm\\nLong-Range Penetration (No Cellular Needed)"/]
        LORA_TX --> LORA_CH
    end

    %% STAGE 4: BASE STATION
    subgraph STAGE4["STAGE 4: BASE STATION RECEIVER GATEWAY (ESP32-S3)"]
        LORA_RX["Ra-02 LoRa SX1278 Receiver\\n(SPI: NSS=10, RST=9, DIO0=8)"]
        LORA_CH --> LORA_RX

        MCU_RX["ESP32-S3 Base Station Controller\\n• Binary Packet Demodulator\\n• WiFi & LittleFS Queue Manager"]
        LORA_RX --> MCU_RX

        FS_QUEUE[("LittleFS Non-Volatile Flash\\nOffline Queue Buffer (Max 64 Alerts)")]
        NVS_STORE[("NVS EEPROM Storage\\nSaved WiFi Credentials & Config")]
        MCU_RX <--> FS_QUEUE
        MCU_RX <--> NVS_STORE

        RX_LED>"NeoPixel Status Indicator (GPIO 48)\\nBlue=Flash, Red=Alert, Green=Online"]
        MCU_RX --> RX_LED
    end

    %% STAGE 5: INGESTION
    subgraph STAGE5["STAGE 5: DUAL INGESTION PATHWAYS"]
        USB_TETHER[/"Hardware USB-CDC Serial Stream\\n115200 Baud JSON Output (0ms Latency)"/]
        WIFI_LAN[/"Local WiFi LAN Network\\nHTTP POST :8080/api/upload | TCP :8888"/]
        MCU_RX --> USB_TETHER
        MCU_RX --> WIFI_LAN
    end

    %% STAGE 6: DISPATCH
    subgraph STAGE6["STAGE 6: RESCUER COMMAND CENTER & TRIAGE"]
        PC_APP["RAMS Rescuer Desktop App (.exe)\\n• C# Multi-Threaded Engine\\n• Background Serial COM Scanner\\n• Embedded HTTP Server"]
        USB_TETHER --> PC_APP
        WIFI_LAN --> PC_APP

        DB_INC[("incidents.json\\nActive & Archived Incidents")]
        DB_REG[("registrations.json\\nRider Medical Dossiers")]
        PC_APP <--> DB_INC
        PC_APP <--> DB_REG

        RADAR_UI>"Tactical Rescuer Radar Dashboard\\n• Real-Time GPS Pinpoint Map\\n• Emergency Audio Siren Strobe\\n• Blood Type, Allergies & Emergency Contacts"]
        PC_APP --> RADAR_UI

        RESCUER_ACTION[/"Emergency Rescuer Dispatch\\n(Ambulance Deployment / Case Resolution)"/]
        RADAR_UI --> RESCUER_ACTION
    end

    style STAGE1 fill:#1e293b,stroke:#475569,stroke-width:2px,color:#fff
    style STAGE2 fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style STAGE3 fill:#311042,stroke:#a855f7,stroke-width:2px,color:#fff
    style STAGE4 fill:#1e1e38,stroke:#6366f1,stroke-width:2px,color:#fff
    style STAGE5 fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff
    style STAGE6 fill:#18181b,stroke:#ef4444,stroke-width:2px,color:#fff
`;

// 2. ROUTINE TELEMETRY VS CRASH ESCALATION
const systemFlowchartRoutineVsCrash = `flowchart TD
    subgraph ROUTINE["ROUTINE MONITORING PATHWAY (Every 30 Seconds)"]
        R1[/"Normal Riding Conditions\\n(Speed, Heading, Battery %, Lat, Lon)"/] --> R2["Wearable Telemetry Scheduler\\n(30s Elapsed & BLE Connected)"]
        R2 --> R3["Build Binary PKT_TELEMETRY (Type 0)"]
        R3 --> R4[/"Transmit via 433MHz LoRa"/]
        R4 --> R5["Receiver Base Station Ingest"]
        R5 --> R6[/"Forward to Desktop Command Center"/]
        R6 --> R7>"Update Radar Live Marker & Battery Indicator"]
    end

    subgraph CRASH["EMERGENCY ACCIDENT ESCALATION PATHWAY"]
        C1[/"Severe Impact Detected (aMag >= 3.5G)\\nOR Sudden Tilt > 65° with Zero Speed"/] --> C2["🚨 TRIGGER 15-SECOND PRE-ALERT GRACE PERIOD\\n• Wearable NeoPixel: Fast Red Strobe\\n• Wearable Buzzer: High-Decibel Pulsed Warning\\n• Smartphone Display: 15s Countdown Dialog"]
        
        C2 --> C3{"Rider Presses\\nCancel Button?"}

        C3 -- "YES (False Alarm / Minor Bump)" --> C4["📵 SUPPRESS FALSE ALARM\\n• Silence Buzzer & Restore Green LED\\n• Transmit PKT_FALSE_ALARM (Type 2)\\n• Desktop marks incident 'FALSE ALARM'"]
        
        C3 -- "NO (Timer Hits 0 / Incapacitated)" --> C5["🚨 CONFIRMED CRASH ESCALATION\\n• Lock Alert State on Hardware\\n• Compile PKT_ALERT (Type 1) + Coordinates\\n• Immediate Emergency 433MHz LoRa Broadcast"]
        
        C5 --> C6["Receiver Base Station Demodulation\\n(Trigger Blue Flash & Red Strobe)"]
        
        C6 --> C7{"Gateway WiFi\\nConnected?"}
        C7 -- "YES" --> C8[/"HTTP POST /api/upload to Command Station"/]
        C7 -- "NO" --> C9[("Save Alert to LittleFS Offline Queue\\n(Auto-drains when WiFi restores)")]
        C9 -. Drains .-> C8
        
        C6 --> C10[/"Direct USB Serial Stream (115200 Baud)"/]
        
        C8 --> C11["Desktop Rescuer Application"]
        C10 --> C11
        
        C11 --> C12>"🚨 TRIGGER DISPATCH ALARM\\n• Play Urgent Emergency Siren Loop\\n• Center Map on Exact GPS Coordinates\\n• Populate Rider Medical Dossier (Blood, Allergies)\\n• Display Route Navigation to Crash Site"]
    end

    style ROUTINE fill:#064e3b,stroke:#059669,stroke-width:2px,color:#fff
    style CRASH fill:#450a0a,stroke:#dc2626,stroke-width:2px,color:#fff
    style C2 fill:#b91c1c,stroke:#fff,color:#fff
    style C4 fill:#047857,stroke:#fff,color:#fff
    style C12 fill:#991b1b,stroke:#fff,color:#fff
`;

// 3. ZERO-CELLULAR RESILIENCE & STORAGE FAILOVER
const systemFlowchartStorageFailover = `flowchart TD
    E1[/"💥 Crash Alert Emitted by Rider Sensing Node"/] --> E2["433MHz LoRa RF Transmission\\n(Zero dependence on mobile towers or data plans)"]
    E2 --> E3["Base Station Receiver Hardware (ESP32-S3)"]

    E3 --> CHK_USB{"Is Gateway Connected\\nvia USB Cable to PC?"}

    %% USB Path
    CHK_USB -- "YES (Physical Tether)" --> P_USB[/"Direct Hardware USB-CDC Serial Stream\\n115200 Baud JSON Packets (0ms Latency)"/]
    P_USB --> D_INGEST["Desktop Rescuer Engine Ingestion"]

    %% Network Path
    CHK_USB -- "NO (Remote Deployment)" --> CHK_WIFI{"Is Gateway WiFi\\nOnline & Reachable?"}
    
    CHK_WIFI -- "YES (Network Available)" --> P_HTTP[/"HTTP POST /api/upload to Desktop IP:8080"/]
    P_HTTP --> D_INGEST

    CHK_WIFI -- "NO (Power/Internet Outage)" --> SAVE_QUEUE[("Save Incident Record to LittleFS Flash\\n(/queue.bin - Non-Volatile Memory)")]
    SAVE_QUEUE --> POLL_DAEMON["Gateway Background Timer Daemon\\n(Polls WiFi status every 10 seconds)"]
    POLL_DAEMON --> CHK_RECON{"WiFi Connection\\nRestored?"}
    
    CHK_RECON -- "NO" --> RETAIN["Retain in Flash (Power-Safe Buffer)"]
    RETAIN --> POLL_DAEMON
    
    CHK_RECON -- "YES" --> FLUSH_QUEUE["Read Queue in FIFO Order\\nPost all backlogged incidents to Server"]
    FLUSH_QUEUE --> P_HTTP

    D_INGEST --> DB_SAVE[("Write Incident to incidents.json\\nCross-reference registrations.json for Medical Data")]
    DB_SAVE --> ALARM_OUT>"🚨 Command Station Audio Siren & Map Strobe\\nImmediate Dispatch Notification"]

    style E1 fill:#b91c1c,stroke:#fff,color:#fff
    style D_INGEST fill:#1e40af,stroke:#fff,color:#fff
    style SAVE_QUEUE fill:#d97706,stroke:#fff,color:#fff
    style ALARM_OUT fill:#991b1b,stroke:#fff,color:#fff
`;

// 4. WEARABLE PROGRAM FLOWCHART
const programFlowchartWearable = `flowchart TD
    W_BOOT(["([START: Wearable Firmware Boot])"]) --> W1["{{Initialize Serial (115200 Baud, 500ms Delay)}}"]
    W1 --> W2["{{Configure GPIO Pins: NeoPixel=48, Buzzer=4, Button=5, Battery=2}}"]
    W2 --> W3["[Set NeoPixel → NEO_CONNECTING (Pulsing Cyan)]"]
    W3 --> W4["[[buzzerSetPattern(BZR_CONFIRM) - Short Chirp]]"]
    W4 --> W5["[[detectionInit() & gpsInit()]]"]
    W5 --> W6["{{Initialize SPI Bus for LoRa (SCK=12, MISO=13, MOSI=11, NSS=10)}}"]
    W6 --> W7{"LoRa.begin(433E6)\\nSuccessful?"}

    W7 -- "YES" --> W8["[Set _loraOk = true\\nConfigure SF9, BW125kHz, CR4/5, Power 17dBm]"]
    W7 -- "NO" --> W9["[Set _loraOk = false\\nSet NeoPixel → NEO_ERROR (Solid Red)]"]

    W8 --> W10["[[btServiceInit() - Start BLE Peripheral 'RAMS Wearable']]"]
    W9 --> W10
    W10 --> W_LOOP(["([ENTER: Main loop() Execution Cycle])"])

    W_LOOP --> L1["[[Execute Background Tasks:\\ngpsUpdate(), buzzerUpdate(), neopixelUpdate(),\\nbtServiceUpdate(), batteryUpdate()]]"]
    L1 --> L2["[/buttonUpdate(): Read & Debounce GPIO 5 Pushbutton/]"]
    L2 --> L3{"Pushbutton\\nPressed?"}

    %% Button Pressed
    L3 -- "YES" --> L4{"Active Crash Alert\\nIn Progress?"}
    L4 -- "YES" --> L5["📵 CANCEL FALSE ALARM\\n[[detectionAcknowledgeAlert()]]\\n[buzzerOff()]\\n[[buzzerSetPattern(BZR_CONFIRM)]]"]
    L5 --> L6{"_loraOk == true?"}
    L6 -- "YES" --> L7["[[loraSendFalseAlarm(token, lat, lon)]]"]
    L6 -- "NO" --> L8
    L7 --> L8["[/BLE Notify Phone: 'CANCEL_ALERT_ACK'/]"]
    L8 --> L9

    L4 -- "NO" --> L10["[[buzzerSetPattern(BZR_CONFIRM)]]\\n[/Serial Print Status & Battery %/]"]
    L10 --> L9

    L3 -- "NO" --> L9{"Evaluate NeoPixel\\nState"}

    %% NeoPixel Logic
    L9 -- "Active Alert" --> N1["[Keep NeoPixel in NEO_ALERT (Red Strobe)]"]
    L9 -- "LoRa Error" --> N2["[Set NeoPixel → NEO_ERROR (Solid Red)]"]
    L9 -- "BLE Disconnected" --> N3["[Set NeoPixel → NEO_CONNECTING (Pulsing Cyan)]"]
    L9 -- "BLE Armed" --> N4["[Set NeoPixel → NEO_ARMED (Solid Green)]"]

    N1 --> T1
    N2 --> T1
    N3 --> T1
    N4 --> T1

    %% Telemetry Timer
    T1{"_loraOk && BLE Connected\\n&& (millis() - lastTel >= 30000)?"}
    T1 -- "YES" --> T2["[[loraSendTelemetry(token, lat, lon, battPct)]]\\n[lastTel = millis()]"]
    T1 -- "NO" --> T3
    T2 --> T3["[delay(5ms)]"]
    T3 --> W_LOOP

    style W_BOOT fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style W_LOOP fill:#065f46,stroke:#10b981,color:#fff
    style L5 fill:#047857,stroke:#fff,color:#fff
    style W9 fill:#b91c1c,stroke:#fff,color:#fff
`;

// 5. RECEIVER PROGRAM FLOWCHART
const programFlowchartReceiver = `flowchart TD
    R_BOOT(["([START: Receiver Firmware Boot])"]) --> R1["{{Initialize Serial 115200 Baud, NeoPixel (GPIO 48), Status LED (GPIO 2)}}"]
    R1 --> R2["[Set NeoPixel → NEO_RX_BOOT (Blue Pulsing)]"]
    R2 --> R3["[[nvsStoreInit(): Read Stored WiFi Credentials]]"]
    R3 --> R4["{{Initialize LoRa Receiver SPI (NSS=10, RST=9, DIO0=8)}}"]
    R4 --> R5{"LoRa.begin(433E6)\\nSuccessful?"}

    R5 -- "YES" --> R6["[Set _loraOk = true\\nConfigure 433MHz, SF9, BW125kHz]"]
    R5 -- "NO" --> R7["[Set _loraOk = false\\nSet NeoPixel → NEO_RX_ERROR (Solid Red)]"]

    R6 --> R8["[[wifiManagerInit()]]"]
    R7 --> R8
    R8 --> R9{"NVS has WiFi\\nCredentials?"}
    R9 -- "YES" --> R10["[Connect to WiFi STA Mode (15s Timeout)]"]
    R9 -- "NO" --> R11["[Launch SoftAP 'RAMS_Receiver_Setup' + Captive Portal]"]
    R10 --> R12{"Connected?"}
    R12 -- "YES" --> R13["[State: WIFI_CONNECTED (Solid Green LED)]"]
    R12 -- "NO" --> R11

    R13 --> R14["[[localQueueInit(): Initialize LittleFS Flash Buffer]]"]
    R11 --> R14
    R14 --> R15["[[httpUploadInit(): Setup HTTP Client]]"]
    R15 --> R_LOOP(["([ENTER: Receiver Main loop()])"])

    R_LOOP --> M1["[[wifiManagerUpdate(): Handle DNS & Auto-Reconnect]]"]
    M1 --> M2{"_loraOk == true?"}
    M2 -- "NO" --> M_QUEUE
    M2 -- "YES" --> M3["[/LoRa.parsePacket(): Check RF FIFO Buffer/]"]

    M3 --> M4{"Packet\\nReceived?"}
    M4 -- "NO" --> M_QUEUE

    M4 -- "YES" --> P1["[[neopixelTriggerPacketFlash(): 80ms Blue Blink]]\\n[/LoRa.readBytes(rxBuf, len)/]"]
    P1 --> P2["[Extract packetType = rxBuf[0]\\nExtract deviceToken = rxBuf[1..8]]"]
    
    P2 --> P_SWITCH{"Evaluate\\npacketType"}

    %% Alert
    P_SWITCH -- "PKT_ALERT (1)" --> A1["🚨 CRASH ALERT DETECTED\\n[[neopixelSetAlertState(true) - Red Strobe]]\\n[/Output Formatted JSON on USB Serial/]"]
    A1 --> A2{"WiFi Status ==\\nCONNECTED?"}
    A2 -- "YES" --> A3["[[httpUploadEvent(alertJson)]]"]
    A2 -- "NO" --> A4["[[localQueueAdd(alertJson)]]\\n[Buffer to LittleFS Flash Queue]"]
    A3 --> M_QUEUE
    A4 --> M_QUEUE

    %% False Alarm
    P_SWITCH -- "PKT_FALSE_ALARM (2)" --> FA1["[[neopixelTriggerFalseAlarmFlash(): Cyan Blink]]\\n[[neopixelClearAlert(): Reset to Online Green]]\\n[/Output Formatted JSON on USB Serial/]"]
    FA1 --> FA2{"WiFi Status ==\\nCONNECTED?"}
    FA2 -- "YES" --> FA3["[[httpUploadEvent(faJson)]]"]
    FA2 -- "NO" --> FA4["[[localQueueAdd(faJson)]]"]
    FA3 --> M_QUEUE
    FA4 --> M_QUEUE

    %% Telemetry
    P_SWITCH -- "PKT_TELEMETRY (0)" --> T1["[/Output Formatted JSON on USB Serial/]\\n[Extract RSSI, SNR, Battery%]"]
    T1 --> T2{"WiFi Status ==\\nCONNECTED?"}
    T2 -- "YES" --> T3["[[httpUploadEvent(telJson)]]"]
    T2 -- "NO" --> T4["[Skip Queue (Transient Telemetry)]"]
    T3 --> M_QUEUE
    T4 --> M_QUEUE

    %% Rider Profile
    P_SWITCH -- "PKT_RIDER_PROFILE (6)" --> PR1["[Unpack 233-Byte Profile:\\nName, Plate, Blood, Contacts, PhotoUrl]\\n[/Output Formatted JSON on USB Serial/]"]
    PR1 --> PR2{"WiFi Status ==\\nCONNECTED?"}
    PR2 -- "YES" --> PR3["[[httpUploadRiderProfile(profJson)]]"]
    PR2 -- "NO" --> PR4["[[localQueueAddRiderProfile(profJson)]]"]
    PR3 --> M_QUEUE
    PR4 --> M_QUEUE

    M_QUEUE["[[localQueueUpdate(): If WiFi connected, drain queued items]]"]
    M_QUEUE --> M_NEO["[[neopixelUpdate(): Refresh status indicator]]"]
    M_NEO --> M_HB{"(millis() - lastHeartbeat)\\n>= 15000?"}
    M_HB -- "YES" --> HB_OUT["[/Serial Print Heartbeat: LoRa, WiFi IP, Queue Count/]\\n[lastHeartbeat = millis()]"]
    M_HB -- "NO" --> M_DELAY
    HB_OUT --> M_DELAY["[delay(5ms)]"]
    M_DELAY --> R_LOOP

    style R_BOOT fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style R_LOOP fill:#065f46,stroke:#10b981,color:#fff
    style A1 fill:#b91c1c,stroke:#fff,color:#fff
    style FA1 fill:#047857,stroke:#fff,color:#fff
`;

// 6. DESKTOP APP PROGRAM FLOWCHART
const programFlowchartDesktop = `flowchart TD
    D_START(["([START: Launch RAMS_Rescuer_Desktop.exe])"]) --> D1["[[LoadRegistrations() from registrations.json]]\\n[[LoadIncidents() from incidents.json]]"]
    D1 --> D2["{{Spawn Thread: StartSerialReceiverBridge()\\nScans active COM ports every 2000ms}}"]
    D2 --> D3["{{Spawn Thread: StartLanReceiverBridge()\\nStarts TCP Listener on 0.0.0.0:8888}}"]
    D3 --> D4["[Find Available HTTP Port in Range 8080-8095]"]
    D4 --> D5["[[StartServer(port): Initialize HttpListener with Wildcard & Loopback]]"]
    D5 --> D6["[[LaunchEdgeApp(http://127.0.0.1:port/)\\nExecute msedge.exe --app=url (Chromeless Mode)]]"]

    D6 --> D_WATCH{"Watchdog Loop\\nEvery 1000ms"}
    D_WATCH -- "_exitRequested == true\\nOR inactive > 15s" --> D_CLEAN["[Stop HttpListener & TCP Listener]\\n[Set _serialRunning = false]\\n[Close Open COM Ports]"]
    D_WATCH -- "App Active" --> D_WATCH
    D_CLEAN --> D_END(["([TERMINATE: Process Exit 0])"])

    %% INGESTION LOGIC
    subgraph INGESTION["ProcessIncomingPayload(payload, defaultPrefix)"]
        direction TB
        IN_START(["([INVOKE: Incoming Payload Received])"]) --> P1["[Extract keys: event, packetType, token, lat, lon]"]
        P1 --> P_TYPE{"Evaluate\\npacketType"}

        %% Profile
        P_TYPE -- "rider_profile / register" --> R1["[Extract Name, Plate, Blood, Phone, PhotoUrl]\\n[Merge into _registrations[token]]\\n[[SaveRegistrations() → registrations.json]]"]
        R1 --> R2["[Retroactively update all existing events matching token with name & photo]\\n[[SaveIncidents() → incidents.json]]"]

        %% False Alarm
        P_TYPE -- "false_alarm" --> F1{"Search incidents for active alert\\nmatching deviceToken?"}
        F1 -- "YES" --> F2["[Update incident status → 'FALSE ALARM']\\n[Update event type → 'false_alarm']"]
        F1 -- "NO" --> F3{"Any recent active alert\\nwithin 5 minutes?"}
        F3 -- "YES" --> F4["[Update most recent active alert → 'FALSE ALARM']"]
        F3 -- "NO" --> F5["[Insert new false_alarm record at index 0]"]
        F2 --> F_SAVE["[[SaveIncidents() → incidents.json]]"]
        F4 --> F_SAVE
        F5 --> F_SAVE

        %% Alert
        P_TYPE -- "alert / test" --> A1{"lat != 0.0 &&\\nlon != 0.0?"}
        A1 -- "NO" --> A2["[Lookup last-known valid lat/lon for token]"]
        A1 -- "YES" --> A3
        A2 --> A3["[Generate ID: 'RAMS-ALERT-yyyyMMdd-HHmmss-fff']\\n[Hydrate with profile from _registrations[token]]\\n[Insert Incident at Index 0 of _eventsJsonList]"]
        A3 --> A_SAVE["[[SaveIncidents() → incidents.json]]"]

        %% Telemetry
        P_TYPE -- "telemetry" --> T1{"lat != 0.0 &&\\nlon != 0.0?"}
        T1 -- "NO" --> T2["[Discard Telemetry (No Fix)]"]
        T1 -- "YES" --> T3["[Remove previous telemetry for this token]\\n[Insert updated telemetry at index 0]"]
        T3 --> T_SAVE["[[SaveIncidents() → incidents.json]]"]
    end

    style D_START fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D_END fill:#b91c1c,stroke:#fff,color:#fff
    style IN_START fill:#065f46,stroke:#10b981,color:#fff
    style A3 fill:#b91c1c,stroke:#fff,color:#fff
    style F2 fill:#047857,stroke:#fff,color:#fff
`;

// 7. ANDROID APP PROGRAM FLOWCHART
const programFlowchartAndroid = `flowchart TD
    A_START(["([START: Launch Android Companion App])"]) --> A1["{{Request Runtime Permissions:\\nACCESS_FINE_LOCATION, BLUETOOTH_SCAN,\\nBLUETOOTH_CONNECT, BODY_SENSORS}}"]
    A1 --> A2{"All Permissions\\nGranted?"}
    A2 -- "NO" --> A3["[/Show Permission Dialog/]"]
    A3 --> A1

    A2 -- "YES" --> A4["[[Load Rider Profile from SharedPreferences]]"]
    A4 --> A5["[[Start BLE Scan for 'RAMS Wearable']]"]
    A5 --> A6{"Device\\nFound?"}
    A6 -- "NO" --> A7["[Exponential Backoff Retry]"]
    A7 --> A5

    A6 -- "YES" --> A8["[[BluetoothGatt.connectGatt()]]\\n[Discover Nordic UART Service NUS]"]
    A8 --> A9["{{Register 100Hz Accelerometer & Gyroscope Listener}}\\n{{Start FusedLocationProvider Updates (1Hz)}}"]

    A9 --> A_LOOP{"Continuous Sensor Loop\\n(Every 10ms)"}
    A_LOOP --> S1["[/Read ax, ay, az, gx, gy, gz/]"]
    S1 --> S2["[Compute aMag = sqrt(ax² + ay² + az²)]\\n[Compute Tilt & Orientation Angles]"]
    S2 --> S3{"aMag >= 3.5G\\nOR Tilt > 65° with 0 Speed\\nOR Manual SOS Tapped?"}

    %% Impact
    S3 -- "YES" --> C1["🚨 LAUNCH 15-SECOND PRE-ALERT DIALOG\\n[Sound Urgent Phone Warning Alarm]\\n[/Send BLE TX: {shock:1, type:'PRE_ALERT'}/]"]
    C1 --> C2{"User Tapped\\n'Cancel False Alarm'?"}
    C2 -- "YES" --> C3["[/Send BLE TX: {type:'CANCEL_ALERT'}/]\\n[Dismiss Dialog & Silence Alarm]"]
    C3 --> A_LOOP

    C2 -- "NO (Timer Hits 0)" --> C4["🚨 CONFIRM EMERGENCY CRASH\\n[/Send BLE TX: {shock:1, type:'EMERGENCY_ALERT', aMag: aMag}/]\\n[Show Rescuer Dispatched UI Screen]"]
    C4 --> A_LOOP

    %% Routine Telemetry
    S3 -- "NO" --> T1{"(millis() - lastBleTel)\\n>= 1000ms?"}
    T1 -- "YES" --> T2["[Build JSON: lat, lon, spd, alt, aMag, token, profile]\\n[/Write to BLE NUS RX Characteristic/]\\n[lastBleTel = millis()]"]
    T1 -- "NO" --> A_LOOP
    T2 --> A_LOOP

    style A_START fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C1 fill:#b91c1c,stroke:#fff,color:#fff
    style C3 fill:#047857,stroke:#fff,color:#fff
    style C4 fill:#7f1d1d,stroke:#fff,color:#fff
`;

const flowcharts = [
  { name: 'System_Flowchart_Master', mmd: systemFlowchartMaster },
  { name: 'System_Flowchart_Routine_vs_Crash', mmd: systemFlowchartRoutineVsCrash },
  { name: 'System_Flowchart_Storage_Failover', mmd: systemFlowchartStorageFailover },
  { name: 'Program_Flowchart_Wearable', mmd: programFlowchartWearable },
  { name: 'Program_Flowchart_Receiver', mmd: programFlowchartReceiver },
  { name: 'Program_Flowchart_Desktop', mmd: programFlowchartDesktop },
  { name: 'Program_Flowchart_Android', mmd: programFlowchartAndroid }
];

console.log('Writing MMD files and compiling graphical charts...');

for (const fc of flowcharts) {
  const mmdPath = path.join(graphicsDir, `${fc.name}.mmd`);
  const svgPath = path.join(graphicsDir, `${fc.name}.svg`);
  const pngPath = path.join(graphicsDir, `${fc.name}.png`);

  fs.writeFileSync(mmdPath, fc.mmd, 'utf8');
  console.log(`[+] Saved ${fc.name}.mmd`);

  try {
    console.log(`  -> Rendering SVG: ${fc.name}.svg`);
    execSync(`npx -y @mermaid-js/mermaid-cli -i "${mmdPath}" -o "${svgPath}" -b "#0d1117"`, { stdio: 'inherit' });
    console.log(`  -> Rendering PNG (high-res): ${fc.name}.png`);
    execSync(`npx -y @mermaid-js/mermaid-cli -i "${mmdPath}" -o "${pngPath}" -s 2 -b "#0d1117"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`  [!] Error rendering ${fc.name}:`, err.message);
  }
}

console.log('Finished compiling all graphical flowcharts!');
