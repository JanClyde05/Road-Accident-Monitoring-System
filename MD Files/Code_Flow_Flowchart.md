# RAMS — Code Flow Flowchart

> Internal code execution flow for each component of the Road Accident Monitoring System.
> Reference: `Working Code - Do Not Touch/Road-Accident-Monitoring-System-main/`

---

## 1. Wearable Firmware Code Flow (`wearable_withApp/`)

> ESP32-S3 SuperMini + Ra-02 LoRa SX1278 (433MHz) + BLE + Buzzer + NeoPixel

### 1.1 Boot / `setup()` Sequence

```mermaid
flowchart TD
    A["⚡ Power On / Reset"] --> B["Serial.begin(115200)"]
    B --> C["delay(500ms)"]
    C --> D["Print Boot Banner"]
    D --> E["neopixelInit()"]
    E --> F["Set NeoPixel → NEO_CONNECTING\n(Pulsing Cyan)"]
    F --> G["buzzerInit()\nbuzzerSetPattern(BZR_CONFIRM)"]
    G --> H["buttonInit()"]
    H --> I["batteryInit()\n(GPIO2, 100k/100k divider)"]
    I --> J["detectionInit()"]
    J --> K["gpsInit()"]
    K --> L["loraTxInit()\n(SPI: SCK=12, MISO=13, MOSI=11, NSS=10)"]

    L --> M{LoRa Init\nSuccess?}
    M -- Yes --> N["_loraOk = true"]
    M -- No --> O["Set NeoPixel → NEO_ERROR\n(Solid Red)"]
    O --> P["_loraOk = false"]

    N --> Q["btServiceInit()\n(BLE Peripheral - NUS Profile)"]
    P --> Q
    Q --> R["Print: Ready. Connect via BLE"]
    R --> S["→ Enter loop()"]

    style A fill:#1a1a2e,stroke:#e94560,color:#fff
    style S fill:#0f3460,stroke:#16213e,color:#fff
    style M fill:#533483,stroke:#e94560,color:#fff
    style O fill:#e94560,stroke:#fff,color:#fff
```

### 1.2 Main `loop()` Cycle

```mermaid
flowchart TD
    LOOP["🔄 loop() — Every ~5ms"] --> BG["Background Updates:\ngpsUpdate() → buzzerUpdate()\nneopixelUpdate() → btServiceUpdate()\nbatteryUpdate()"]

    BG --> BTN["buttonUpdate()"]
    BTN --> BTNCHK{Button\nPressed?}

    BTNCHK -- No --> LED["NeoPixel State Management"]
    BTNCHK -- Yes --> ALERT_CHK{Active\nAlert?}

    ALERT_CHK -- Yes --> CANCEL["📵 CANCEL FALSE ALARM\ndetectionAcknowledgeAlert()\nbuzzerOff()\nbuzzerSetPattern(BZR_CONFIRM)"]
    CANCEL --> LORA_FA{LoRa OK?}
    LORA_FA -- Yes --> SEND_FA["loraSendFalseAlarm(\n  token, lat, lon\n)"]
    LORA_FA -- No --> BLE_ACK
    SEND_FA --> BLE_ACK["BLE Notify Phone:\nCANCEL_ALERT_ACK"]
    BLE_ACK --> LED

    ALERT_CHK -- No --> CHIRP["🔊 Status Check Chirp\nbuzzerSetPattern(BZR_CONFIRM)\nPrint: Token, BLE, GPS status"]
    CHIRP --> LED

    LED --> LED_CHK{Has Active\nAlert?}
    LED_CHK -- Yes --> SKIP["(Keep NEO_ALERT state)"]
    LED_CHK -- No --> LED_LOGIC{Check\nConditions}

    LED_LOGIC -- "LoRa Failed" --> NEO_ERR["NEO_ERROR\n(Solid Red)"]
    LED_LOGIC -- "BLE Disconnected" --> NEO_CONN["NEO_CONNECTING\n(Pulsing Cyan)"]
    LED_LOGIC -- "BLE Connected" --> NEO_ARM["NEO_ARMED\n(Solid Green)"]

    SKIP --> TEL
    NEO_ERR --> TEL
    NEO_CONN --> TEL
    NEO_ARM --> TEL

    TEL --> TEL_CHK{"LoRa OK?\nBLE Connected?\n30s Elapsed?"}
    TEL_CHK -- Yes --> SEND_TEL["loraSendTelemetry(\n  token, lat, lon, battPct\n)"]
    TEL_CHK -- No --> DELAY["delay(5ms)"]
    SEND_TEL --> DELAY
    DELAY --> LOOP

    style LOOP fill:#1a1a2e,stroke:#e94560,color:#fff
    style CANCEL fill:#e94560,stroke:#fff,color:#fff
    style SEND_TEL fill:#0f3460,stroke:#16213e,color:#fff
```

### 1.3 BLE Incoming Message Processing (`bt_service.cpp`)

```mermaid
flowchart TD
    RX["📲 BLE RX Characteristic\nonWrite() Callback"] --> BUF["Append chunk to _rxBuffer"]
    BUF --> STRIP["Strip leading garbage\nbefore first '{'"]
    STRIP --> NL{Contains\n'\\n'?}

    NL -- Yes --> EXTRACT["Extract complete message\n(up to newline)"]
    EXTRACT --> PARSE["_processIncomingMessage(msg)"]
    PARSE --> NL

    NL -- No --> STANDALONE{Starts with '{'\nEnds with '}' ?}
    STANDALONE -- Yes --> PARSE2["_processIncomingMessage(msg)\nClear buffer"]
    STANDALONE -- No --> OVERFLOW{Buffer\n> 2048?}
    OVERFLOW -- Yes --> CLEAR["Clear buffer\n(safety reset)"]
    OVERFLOW -- No --> DONE["Done — wait for\nnext BLE write"]

    PARSE --> MSG_TYPE{"Message\nType?"}

    MSG_TYPE -- "CANCEL_ALERT /\nDISMISS_FALSE_ALARM" --> ACK["detectionAcknowledgeAlert()\nbuzzerOff() → NEO_ARMED\nloraSendFalseAlarm()\nBLE reply: CANCEL_ALERT_ACK"]

    MSG_TYPE -- "Telemetry / GPS\n(contains 'lat':)" --> JSON["Parse JSON with ArduinoJson"]
    JSON --> SYNC_TOKEN["Sync rider token\nfrom 'token' field"]
    SYNC_TOKEN --> UPDATE_GPS["gpsSetExternalLocation(\n  lat, lon, spd, alt\n)"]
    UPDATE_GPS --> PROFILE_CHK{"Rider name set?\n30s since last?"}
    PROFILE_CHK -- Yes --> SEND_PROFILE["loraSendRiderProfile(\n  token, name, plate, contact,\n  blood, category, emergency...\n)"]
    PROFILE_CHK -- No --> SHOCK_CHK

    SEND_PROFILE --> SHOCK_CHK{"shock == 1 ?\nOR type == EMERGENCY?"}
    SHOCK_CHK -- Yes --> CRASH["🚨 CRASH DETECTED!\ndetectionTriggerAlert()\nNEO_ALERT → BZR_ALERT\nloraSendAlert(token, lat, lon, aMag)"]
    SHOCK_CHK -- No --> DONE2["Continue"]

    MSG_TYPE -- "PING" --> PONG["Reply: PONG"]
    MSG_TYPE -- "Unknown" --> LOG["Log unknown message"]

    style RX fill:#533483,stroke:#e94560,color:#fff
    style CRASH fill:#e94560,stroke:#fff,color:#fff
    style SEND_PROFILE fill:#0f3460,stroke:#16213e,color:#fff
```

---

## 2. Receiver Firmware Code Flow (`receiver_withDesktop/`)

> ESP32-S3 SuperMini + Ra-02 LoRa SX1278 (433MHz RX) + WiFi + NeoPixel

### 2.1 Boot / `setup()` Sequence

```mermaid
flowchart TD
    A["⚡ Power On / Reset"] --> B["Serial.begin(115200)\ndelay(500ms)"]
    B --> C["Print Boot Banner"]
    C --> D["neopixelInit()\nSet → NEO_RX_BOOT"]
    D --> E["pinMode(STATUS_LED_PIN, OUTPUT)"]
    E --> F["nvsStoreInit()"]
    F --> G["loraRxInit()\n(SPI: NSS=10, RST=9, DIO0=8)"]

    G --> H{LoRa Init\nSuccess?}
    H -- Yes --> I["_loraOk = true\nPrint: LoRa active 433MHz"]
    H -- No --> J["NEO_RX_ERROR\nPrint: Check SPI wiring"]

    I --> K["wifiManagerInit()"]
    J --> K

    K --> K2{"NVS has\nWiFi creds?"}
    K2 -- Yes --> K3["Try saved network\n(15s timeout)"]
    K3 --> K4{Connected?}
    K4 -- Yes --> K5["WIFI_CONNECTED"]
    K4 -- No --> K6["Start SoftAP:\n'RAMS_Receiver_Setup'\n+ Captive Portal"]
    K2 -- No --> K6

    K5 --> L["localQueueInit()\n(LittleFS-backed)"]
    K6 --> L
    L --> M["httpUploadInit()"]
    M --> N["Print: Boot Complete\nWiFi status, LoRa status, Queue count"]
    N --> O["→ Enter loop()"]

    style A fill:#1a1a2e,stroke:#e94560,color:#fff
    style O fill:#0f3460,stroke:#16213e,color:#fff
    style J fill:#e94560,stroke:#fff,color:#fff
    style K6 fill:#e67e22,stroke:#fff,color:#fff
```

### 2.2 Main `loop()` Cycle

```mermaid
flowchart TD
    LOOP["🔄 loop() — Every ~5ms"] --> WIFI["wifiManagerUpdate()\n(Portal + auto-reconnect)"]
    WIFI --> LORA_CHK{LoRa OK?}
    LORA_CHK -- Yes --> LORA_RX["loraRxUpdate()"]
    LORA_CHK -- No --> QUEUE

    LORA_RX --> PKT{Packet\nReceived?}
    PKT -- No --> QUEUE
    PKT -- Yes --> FLASH["neopixelTriggerPacketFlash()\n(Blue blink)"]
    FLASH --> DECODE["Read packetType from buf[0]\nExtract deviceToken from buf[1..8]"]
    DECODE --> TYPE{"Packet\nType?"}

    TYPE -- PKT_ALERT --> ALERT_PROC
    TYPE -- PKT_TELEMETRY --> TEL_PROC
    TYPE -- PKT_FALSE_ALARM --> FA_PROC
    TYPE -- PKT_RIDER_PROFILE --> PROFILE_PROC
    TYPE -- PKT_TEST --> TEST_PROC
    TYPE -- PKT_REGISTER --> REG_PROC
    TYPE -- PKT_USER_TYPE --> UT_PROC

    ALERT_PROC["🚨 ALERT\nNEO_RX_ALERT (Red strobe)\nPrint crash dashboard\nSerial JSON output"]
    TEL_PROC["📡 TELEMETRY\nPrint: token, lat, lon, batt, RSSI\nSerial JSON output"]
    FA_PROC["🟢 FALSE ALARM\nneopixelTriggerFalseAlarmFlash()\nneopixelClearAlert()\nSerial JSON output"]
    PROFILE_PROC["👤 RIDER PROFILE\nExtract all fields\nPrint profile table\nSerial JSON output"]
    TEST_PROC["🧪 TEST DRILL\nNEO_RX_ALERT\nSerial JSON output"]
    REG_PROC["📝 REGISTER\nExtract name, photoUrl\nSerial JSON output"]
    UT_PROC["👤 USER TYPE\nExtract category\nSerial JSON output"]

    ALERT_PROC --> UPLOAD
    TEL_PROC --> UPLOAD_TEL
    FA_PROC --> UPLOAD
    PROFILE_PROC --> UPLOAD_PROF
    TEST_PROC --> UPLOAD
    REG_PROC --> UPLOAD
    UT_PROC --> UPLOAD

    UPLOAD{"WiFi\nConnected?"}
    UPLOAD -- Yes --> HTTP["httpUploadEvent()\nPOST → BACKEND_URL/api/upload"]
    UPLOAD -- No --> LQ["localQueueAdd()\n(LittleFS offline buffer)"]
    HTTP --> HTTP_CHK{Upload\nSuccess?}
    HTTP_CHK -- Yes --> QUEUE
    HTTP_CHK -- No --> LQ

    UPLOAD_TEL{"WiFi\nConnected?"}
    UPLOAD_TEL -- Yes --> HTTP_TEL["httpUploadEvent()\n(Telemetry — no queue fallback)"]
    UPLOAD_TEL -- No --> QUEUE

    UPLOAD_PROF{"WiFi\nConnected?"}
    UPLOAD_PROF -- Yes --> HTTP_PROF["httpUploadRiderProfile()"]
    UPLOAD_PROF -- No --> LQ_PROF["localQueueAddRiderProfile()"]
    HTTP_PROF --> QUEUE
    LQ_PROF --> QUEUE
    HTTP_TEL --> QUEUE

    LQ --> QUEUE
    QUEUE["localQueueUpdate()\n(Retry queued uploads)"]
    QUEUE --> STATUS_LED["_updateStatusLED()\n(GPIO2 blink pattern)"]
    STATUS_LED --> NEO_STATE["NeoPixel State Update\n(Green=Online, Amber=AP,\nCyan=Connecting, Yellow=Offline)"]
    NEO_STATE --> HB{"15s since\nlast heartbeat?"}
    HB -- Yes --> PRINT_HB["Print: Heartbeat\nLoRa, WiFi, IP, Queue"]
    HB -- No --> DELAY["delay(5ms)"]
    PRINT_HB --> DELAY
    DELAY --> LOOP

    style LOOP fill:#1a1a2e,stroke:#e94560,color:#fff
    style ALERT_PROC fill:#e94560,stroke:#fff,color:#fff
    style FA_PROC fill:#27ae60,stroke:#fff,color:#fff
    style HTTP fill:#0f3460,stroke:#16213e,color:#fff
```

---

## 3. Desktop App Code Flow (`desktop_app/Program.cs`)

> C# .NET 4.0 — Standalone WinForms with Embedded HTTP Server + Serial Bridge

### 3.1 Boot / `Main()` Sequence

```mermaid
flowchart TD
    A["🖥️ Launch\nRAMS_Rescuer_Desktop.exe"] --> B["Resolve appDir\n_wwwDir = appDir/www/\n_dataFilePath = incidents.json\n_registrationsFilePath = registrations.json"]
    B --> C["LoadRegistrations()\nLoadIncidents()"]
    C --> D["StartSerialReceiverBridge()\n(Background thread: scan COM ports)"]
    D --> E["StartLanReceiverBridge()\n(TCP listener on port 8888)"]
    E --> F["FindAvailablePort(8080–8095)"]
    F --> G["StartServer(port)\n(HttpListener on 127.0.0.1 + LAN IPs)"]

    G --> G2{"Wildcard\nbinding OK?"}
    G2 -- Yes --> G3["Listening on all interfaces"]
    G2 -- No --> G4["Fallback: loopback only\n(127.0.0.1 + localhost)"]

    G3 --> H
    G4 --> H
    H["LaunchEdgeApp()\n(msedge --app=http://127.0.0.1:PORT/)"]
    H --> I{Edge\nLaunched?}
    I -- No --> I2["Fallback: Process.Start(url)\n(Default browser)"]
    I -- Yes --> J

    I2 --> J["⏳ Main Loop\n(Keep alive while app window open)"]
    J --> ALIVE{"Check every 1s:\n_exitRequested?\nInactive > 15s?\n(after 30s grace)"}
    ALIVE -- "Active" --> J
    ALIVE -- "Exit / Inactive" --> CLEANUP["Cleanup:\n_serialRunning = false\nStop TCP listener\nStop HttpListener"]

    style A fill:#1a1a2e,stroke:#e94560,color:#fff
    style CLEANUP fill:#e94560,stroke:#fff,color:#fff
    style H fill:#0f3460,stroke:#16213e,color:#fff
```

### 3.2 Data Ingestion — Dual Bridge Architecture

```mermaid
flowchart TD
    subgraph USB["🔌 USB Serial Bridge (Auto-Detect)"]
        S1["SerialMonitorWorker\n(scan COM ports every 2s)"]
        S1 --> S2["For each new port:\nSpawn ReadPortWorker thread"]
        S2 --> S3["SerialPort.Open()\n115200, 8N1, DTR=true"]
        S3 --> S4["ReadLine() loop"]
        S4 --> S5{Starts with '{'\nEnds with '}' ?}
        S5 -- Yes --> S6["ProcessIncomingReceiverPacket()"]
        S5 -- No --> S4
    end

    subgraph LAN["📡 LAN TCP Bridge (Port 8888)"]
        L1["TcpListener on 0.0.0.0:8888"]
        L1 --> L2["AcceptTcpClient()"]
        L2 --> L3["HandleLanClient()\n(ThreadPool)"]
        L3 --> L4["Read HTTP POST body"]
        L4 --> L5["ProcessIncomingPayload()"]
    end

    subgraph HTTP["🌐 HTTP Server API"]
        H1["POST /api/upload"]
        H1 --> H2["Read JSON body\nor form fields"]
        H2 --> H3["ProcessIncomingPayload()"]
    end

    S6 --> PROC["ProcessIncomingPayload()"]
    L5 --> PROC
    H3 --> PROC

    style USB fill:#1a1a2e,stroke:#e94560,color:#fff
    style LAN fill:#0f3460,stroke:#16213e,color:#fff
    style HTTP fill:#533483,stroke:#e94560,color:#fff
```

### 3.3 `ProcessIncomingPayload()` — Event Routing

```mermaid
flowchart TD
    ENTRY["ProcessIncomingPayload(\n  payload, defaultPrefix\n)"] --> EXTRACT["Extract fields:\nevent, token, packetType"]

    EXTRACT --> TYPE{"Packet\nType?"}

    TYPE -- "register /\nrider_profile" --> REG["Extract rider fields:\nname, photo, plate, phone,\nblood, vehicle, emergency,\nallergies"]
    REG --> MERGE["Merge with existing\n_registrations[token]\n(preserve non-empty fields)"]
    MERGE --> SAVE_REG["SaveRegistrations()\n→ registrations.json"]
    SAVE_REG --> ENRICH["Enrich existing events:\nUpdate photoUrl, riderName,\nvehicleModel, etc. for\nmatching deviceToken"]
    ENRICH --> SAVE_INC["SaveIncidents()\n→ incidents.json"]

    TYPE -- "user_type" --> UT["Extract category\nUpdate _registrations[token]\nvehicleModel field"]

    TYPE -- "telemetry" --> TEL_VAL{Valid\ncoordinates?\n(not 0,0)}
    TEL_VAL -- No --> DISCARD["Discard\n(no GPS fix)"]
    TEL_VAL -- Yes --> TEL_UPD["Remove old telemetry\nfor same token\nInsert new at position 0"]
    TEL_UPD --> SAVE_T["SaveIncidents()"]

    TYPE -- "false_alarm" --> FA_MATCH["Pass 1: Match by token\nFind ACTIVE ALERT events"]
    FA_MATCH --> FA_FOUND{Token\nMatch?}
    FA_FOUND -- Yes --> FA_UPD["Update status → 'FALSE ALARM'\nUpdate type → 'false_alarm'"]
    FA_FOUND -- No --> FA_RECENT["Pass 2: Cancel most recent\nACTIVE ALERT (any token)"]
    FA_RECENT --> FA_LAST{Found\nany alert?}
    FA_LAST -- Yes --> FA_UPD
    FA_LAST -- No --> FA_NEW["Insert new false_alarm record\n(if valid coordinates)"]
    FA_UPD --> SAVE_FA["SaveIncidents()"]
    FA_NEW --> SAVE_FA

    TYPE -- "alert / test" --> COORD_CHK{Valid\ncoordinates?}
    COORD_CHK -- No --> FALLBACK["Fallback: Use last-known\nlocation for this token"]
    COORD_CHK -- Yes --> BUILD
    FALLBACK --> BUILD["BuildEventFromJsonOrForm()\nGenerate event ID:\n'RAMS-ALERT-yyyyMMdd-HHmmss-fff'"]
    BUILD --> INSERT["Insert at position 0\nof _eventsJsonList"]
    INSERT --> SAVE_A["SaveIncidents()\n→ incidents.json"]

    style ENTRY fill:#1a1a2e,stroke:#e94560,color:#fff
    style DISCARD fill:#95a5a6,stroke:#fff,color:#fff
    style FA_UPD fill:#27ae60,stroke:#fff,color:#fff
    style BUILD fill:#e94560,stroke:#fff,color:#fff
```

### 3.4 HTTP API Endpoints

```mermaid
flowchart TD
    REQ["Incoming HTTP Request"] --> CORS["Add CORS Headers"]
    CORS --> ROUTE{"Route\nMatching"}

    ROUTE -- "GET /" --> SERVE_HTML["Serve www/index.html"]
    ROUTE -- "GET /assets/*" --> SERVE_ASSET["Serve static file\n(JS, CSS, images)"]
    ROUTE -- "POST /api/upload" --> UPLOAD["ProcessIncomingPayload()\n→ Add/update events"]
    ROUTE -- "GET /api/events" --> EVENTS["Return JSON array\nof all events + registrations"]
    ROUTE -- "GET /api/status" --> STATUS["Return system status:\nport, serial, LAN IPs, events count"]
    ROUTE -- "DELETE /api/events/*" --> DELETE["Delete specific event\nfrom _eventsJsonList"]
    ROUTE -- "POST /api/clear" --> CLEAR["Clear all events\nReset incidents.json"]
    ROUTE -- "/api/exit" --> EXIT["Set _exitRequested = true\nEnvironment.Exit(0)"]

    EVENTS --> POLL["Frontend polls\n/api/events every 2s\nfor real-time dashboard"]

    style REQ fill:#1a1a2e,stroke:#e94560,color:#fff
    style UPLOAD fill:#e94560,stroke:#fff,color:#fff
    style EVENTS fill:#0f3460,stroke:#16213e,color:#fff
```

---

## 4. Android Companion App Code Flow (`android_app/`)

> Kotlin — BLE Central + GPS + IMU Sensors

```mermaid
flowchart TD
    LAUNCH["📱 App Launch\nMainActivity.kt"] --> PERMS["Request Permissions:\nBluetooth, Location, Sensors"]
    PERMS --> PROFILE["Load/Create Rider Profile:\nname, plate, contact, blood,\nvehicle, emergency info"]
    PROFILE --> SCAN["Scan for BLE Device:\n'RAMS Wearable'"]
    SCAN --> CONNECT["Connect BLE\n(Nordic UART Service - NUS)"]

    CONNECT --> CONNECTED{BLE\nConnected?}
    CONNECTED -- No --> RETRY["Retry scan\nwith backoff"]
    CONNECTED -- Yes --> STREAMS["Start Sensor Streams"]

    STREAMS --> GPS_STREAM["📍 GPS Provider\nFused Location Updates"]
    STREAMS --> IMU_STREAM["📐 IMU Sensors\nAccelerometer + Gyroscope"]

    GPS_STREAM --> BUILD_TEL["Build JSON Telemetry:\n{\n  lat, lon, spd, alt, hdg,\n  ax, ay, az, amag,\n  gx, gy, gz, pitch, roll,\n  token, rider, plate, contact,\n  blood, vehicleModel,\n  emergencyContactName,\n  emergencyPhone, allergies,\n  photoUrl\n}"]
    IMU_STREAM --> BUILD_TEL

    BUILD_TEL --> SHOCK_CHK{"Shock\nDetected?\n(amag > threshold)"}
    SHOCK_CHK -- Yes --> ALERT_JSON["Set shock=1 in JSON\ntype='EMERGENCY_ALERT'"]
    SHOCK_CHK -- No --> NORMAL["type='TEL'\n(normal telemetry)"]

    ALERT_JSON --> BLE_TX["BLE TX → Wearable ESP32\n(NUS RX Characteristic)"]
    NORMAL --> BLE_TX

    BLE_TX --> WAIT["Wait for next\nsensor update cycle"]
    WAIT --> GPS_STREAM

    subgraph USER_ACTIONS["User Actions"]
        CANCEL_BTN["🛑 Cancel Alert Button"] --> CANCEL_MSG["BLE Send:\n{type:'CANCEL_ALERT'}"]
        EDIT_PROFILE["✏️ Edit Profile"] --> SAVE["Save to local storage\n+ Include in next telemetry"]
    end

    style LAUNCH fill:#1a1a2e,stroke:#e94560,color:#fff
    style ALERT_JSON fill:#e94560,stroke:#fff,color:#fff
    style BLE_TX fill:#533483,stroke:#e94560,color:#fff
```

---

## 5. Shared LoRa Protocol (`shared/protocol.h`)

### Packet Structure Summary

```mermaid
classDiagram
    class PacketHeader {
        +uint8_t packetType
        +char deviceToken[8]
        +uint32_t timestamp
        13 bytes
    }

    class TelemetryPacket {
        +PacketHeader header
        +float latitude
        +float longitude
        +uint8_t batteryPct
        PKT_TELEMETRY = 0
    }

    class AlertPacket {
        +PacketHeader header
        +float latitude
        +float longitude
        +uint8_t eventType
        +float aMag
        PKT_ALERT = 1
    }

    class FalseAlarmPacket {
        +PacketHeader header
        +float latitude
        +float longitude
        PKT_FALSE_ALARM = 2
    }

    class RegisterPacket {
        +PacketHeader header
        +char name[24]
        +char driveLinkConverted[96]
        PKT_REGISTER = 4
    }

    class UserTypePacket {
        +PacketHeader header
        +char userType[16]
        PKT_USER_TYPE = 5
    }

    class RiderProfilePacket {
        +PacketHeader header
        +char name[24]
        +char plate[12]
        +char contact[16]
        +char blood[4]
        +char category[16]
        +char emergencyPhone[16]
        +char emergencyName[20]
        +char vehicleModel[20]
        +char allergies[20]
        +char photoUrl[72]
        PKT_RIDER_PROFILE = 6 — 233 bytes
    }

    PacketHeader <|-- TelemetryPacket
    PacketHeader <|-- AlertPacket
    PacketHeader <|-- FalseAlarmPacket
    PacketHeader <|-- RegisterPacket
    PacketHeader <|-- UserTypePacket
    PacketHeader <|-- RiderProfilePacket
```

### LoRa Radio Configuration

| Parameter | Value |
|-----------|-------|
| **Frequency** | 433 MHz (ISM Band) |
| **Spreading Factor** | SF9 |
| **Bandwidth** | 125 kHz |
| **Coding Rate** | CR 4/5 |
| **TX Power** | 17 dBm |
| **Sync Word** | 0x34 |
| **CRC** | Enabled |
| **Max Payload** | ~255 bytes |

---

*Generated from the working codebase at `Working Code - Do Not Touch/Road-Accident-Monitoring-System-main/`*
