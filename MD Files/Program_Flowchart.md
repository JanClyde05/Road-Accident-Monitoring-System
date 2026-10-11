# RAMS — Program Flowchart (Algorithmic Logic Flow)

> **Road Accident Monitoring System (RAMS)**  
> **Formal Program Flowchart for Firmware & Software Algorithms**  
> *Reference Codebase: `Working Code - Do Not Touch/Road-Accident-Monitoring-System-main/`*  
> *Target Competition/Defense: PGC Digital Innovation Challenge / Capstone Engineering*

---

## 1. Overview & Program Flowchart Definition

A **Program Flowchart** illustrates the detailed, step-by-step algorithmic execution logic within software and firmware source code. It depicts program entry points, variable initialization, iterative loops, decision branching, error handling, subroutines, and termination conditions.

### Standard ANSI / ISO Program Flowchart Symbols Used:
- `([Terminal: Start / End / Return])` — Program or subroutine entry/exit point.
- `{{Preparation / Initialization}}` — Hardware pin setup, memory allocation, variable declaration.
- `[/Input / Output Operation/]` — Reading sensor registers, UART/BLE data reception, packet transmission.
- `[Process / Action]` — Computations, data structure manipulation, mathematical formulas.
- `{Decision / Conditional Branch}` — If/else evaluation, threshold check, status comparison.
- `[[Predefined Process / Subroutine]]` — Encapsulated function or method call.
- `((On-Page Connector))` — Connecting disparate branches cleanly without line tangling.

---

## 2. Wearable Firmware Program Flowchart (`wearable_withApp/`)

![Wearable Firmware Program Flowchart](graphics/Program_Flowchart_Wearable.png)

> **High-Resolution Formats:**  
> • [Download Vector SVG](graphics/Program_Flowchart_Wearable.svg) *(infinite resolution zoom for posters/slides)*  
> • [Download 300 DPI PNG](graphics/Program_Flowchart_Wearable.png) *(ready for PowerPoint / Canva / Google Slides)*

<details>
<summary><b>Click to View Algorithmic Step-by-Step Sub-Flowcharts & Mermaid Code</b></summary>

### 2.1 Boot & Initialization Routine (`setup()`)

```mermaid
flowchart TD
    START(["([START: Wearable Boot])"]) --> INIT_SERIAL["{{Initialize Serial Monitor\n115200 Baud, 500ms delay}}"]
    INIT_SERIAL --> INIT_PINS["{{Initialize GPIO Peripherals\nNeoPixel=48, Buzzer=4, Button=5, Battery=2}}"]
    INIT_PINS --> LED_CYAN["[Set NeoPixel → Pulsing Cyan\n(Boot / Connecting State)]"]
    LED_CYAN --> BZR_BEEP["[[buzzerSetPattern(BZR_CONFIRM)\nSingle audible confirmation beep]]"]
    BZR_BEEP --> INIT_SENSORS["[[detectionInit() & gpsInit()\nSetup sensor buffers & registers]]"]
    
    INIT_SENSORS --> INIT_SPI["{{Configure SPI Bus for LoRa\nSCK=12, MISO=13, MOSI=11, NSS=10}}"]
    INIT_SPI --> CHK_LORA{"LoRa.begin(433E6)\nReturn Success?"}

    CHK_LORA -- "YES" --> LORA_OK["[Set _loraOk = true\nApply Radio Config: SF9, BW125k, CR4/5]"]
    CHK_LORA -- "NO" --> LORA_FAIL["[Set _loraOk = false\nSet NeoPixel → Solid Red (ERROR)]"]

    LORA_OK --> INIT_BLE["[[btServiceInit()\nInit BLE Device 'RAMS Wearable'\nRegister Nordic UART Service NUS]]"]
    LORA_FAIL --> INIT_BLE

    INIT_BLE --> PRINT_READY["[/Serial Print: 'System Ready. Connect Phone via BLE'/]"]
    PRINT_READY --> ENTER_LOOP(["([ENTER: loop()])"])

    style START fill:#1a1c2e,stroke:#3b82f6,color:#fff
    style ENTER_LOOP fill:#10b981,stroke:#059669,color:#fff
    style CHK_LORA fill:#f59e0b,stroke:#d97706,color:#fff
    style LORA_FAIL fill:#ef4444,stroke:#b91c1c,color:#fff
```

### 2.2 Main Execution Cycle Routine (`loop()`)

```mermaid
flowchart TD
    START_LOOP(["([CYCLE: loop() ~5ms])"]) --> RUN_BG["[[Execute Background Periodic Drivers\ngpsUpdate() → buzzerUpdate()\nneopixelUpdate() → btServiceUpdate()\nbatteryUpdate()]]"]
    
    RUN_BG --> READ_BTN["[/buttonUpdate(): Sample GPIO 5 Pin State/]"]
    READ_BTN --> CHK_BTN{"Button Pressed\n(Debounced State)?"}

    %% Button Branch
    CHK_BTN -- "YES" --> CHK_ALERT_ACTIVE{"Active Emergency\nAlert In Progress?"}
    
    CHK_ALERT_ACTIVE -- "YES" --> DISMISS_ALARM["[[detectionAcknowledgeAlert()]]\n[buzzerOff()]\n[[buzzerSetPattern(BZR_CONFIRM)]]"]
    DISMISS_ALARM --> CHK_LORA_AVAIL{"_loraOk == true?"}
    CHK_LORA_AVAIL -- "YES" --> TX_FA["[[loraSendFalseAlarm(token, lat, lon)]]"]
    CHK_LORA_AVAIL -- "NO" --> BLE_NOTIF
    TX_FA --> BLE_NOTIF["[/BLE Notify Phone: 'CANCEL_ALERT_ACK'/]"]
    BLE_NOTIF --> MANAGE_LED

    CHK_ALERT_ACTIVE -- "NO" --> CHIRP["[[buzzerSetPattern(BZR_CONFIRM)]]\n[/Serial Print Status Check & Battery %/]"]
    CHIRP --> MANAGE_LED

    CHK_BTN -- "NO" --> MANAGE_LED

    %% LED State Machine
    MANAGE_LED{"Current System State?"}
    MANAGE_LED -- "In Active Crash Alert" --> LED_KEEP["[Keep NeoPixel in NEO_ALERT (Red Strobe)]"]
    MANAGE_LED -- "LoRa Radio Failed" --> LED_ERR["[Set NeoPixel → NEO_ERROR (Solid Red)]"]
    MANAGE_LED -- "BLE Not Connected" --> LED_CONN["[Set NeoPixel → NEO_CONNECTING (Pulse Cyan)]"]
    MANAGE_LED -- "BLE Connected & Armed" --> LED_ARM["[Set NeoPixel → NEO_ARMED (Solid Green)]"]

    LED_KEEP --> CHK_TEL_TIMER
    LED_ERR --> CHK_TEL_TIMER
    LED_CONN --> CHK_TEL_TIMER
    LED_ARM --> CHK_TEL_TIMER

    %% Telemetry Timer
    CHK_TEL_TIMER{"_loraOk && BLE Connected\n&& (millis() - lastTel >= 30000)?"}
    CHK_TEL_TIMER -- "YES" --> SEND_TEL["[[loraSendTelemetry(token, lat, lon, battPct)]]\n[Update lastTel = millis()]"]
    CHK_TEL_TIMER -- "NO" --> LOOP_DELAY
    SEND_TEL --> LOOP_DELAY

    LOOP_DELAY["[delay(5ms)]"] --> END_LOOP(["([REPEAT: loop()])"])

    style START_LOOP fill:#1a1c2e,stroke:#3b82f6,color:#fff
    style END_LOOP fill:#10b981,stroke:#059669,color:#fff
    style DISMISS_ALARM fill:#10b981,stroke:#059669,color:#fff
    style CHK_ALERT_ACTIVE fill:#f59e0b,stroke:#d97706,color:#fff
    style CHK_BTN fill:#6366f1,stroke:#4f46e5,color:#fff
```

### 2.3 BLE Incoming Packet & Crash Decision Routine (`bt_service.cpp`)

```mermaid
flowchart TD
    BLE_IN(["([EVENT: BLE RX onWrite() Callback])"]) --> BUF_APPEND["[/Append received byte chunk to _rxBuffer/]"]
    BUF_APPEND --> STRIP_GARBAGE["[Discard any leading noise bytes before '{']"]
    STRIP_GARBAGE --> CHK_MSG{"Buffer contains complete\nJSON message ('\\n' or '{...}')?"}

    CHK_MSG -- "NO" --> CHK_OVERFLOW{"Buffer Size\n> 2048 bytes?"}
    CHK_OVERFLOW -- "YES" --> BUF_CLEAR["[Clear _rxBuffer (Safety Reset)]"]
    CHK_OVERFLOW -- "NO" --> RET_WAIT(["([RETURN: Await Next Packet])"])
    BUF_CLEAR --> RET_WAIT

    CHK_MSG -- "YES" --> PARSE_JSON["[[Deserialize JSON with ArduinoJson]]"]
    PARSE_JSON --> MSG_BRANCH{"Evaluated\nMessage Type?"}

    %% Branch 1: False Alarm Cancellation
    MSG_BRANCH -- "CANCEL_ALERT / DISMISS_FALSE_ALARM" --> CANCEL_ACTION["[[detectionAcknowledgeAlert()]]\n[buzzerOff()]\n[Set NeoPixel → NEO_ARMED (Solid Green)]\n[[loraSendFalseAlarm(token, lat, lon)]]"]
    CANCEL_ACTION --> REPLY_ACK["[/Send BLE TX Characteristic: 'CANCEL_ALERT_ACK'/]"]
    REPLY_ACK --> RET_WAIT

    %% Branch 2: Telemetry & Impact Evaluation
    MSG_BRANCH -- "Telemetry / GPS Stream" --> EXTRACT_GPS["[Extract lat, lon, spd, alt, token]\n[[gpsSetExternalLocation(lat, lon, spd, alt)]]"]
    EXTRACT_GPS --> CHK_PROFILE{"Rider Name Present &&\n(millis() - lastProfile >= 30s)?"}
    CHK_PROFILE -- "YES" --> SEND_PROF["[[loraSendRiderProfile(token, name, plate, blood...)]]\n[Update lastProfile = millis()]"]
    CHK_PROFILE -- "NO" --> CHK_SHOCK
    SEND_PROF --> CHK_SHOCK

    CHK_SHOCK{"Payload shock == 1\nOR type == 'EMERGENCY_ALERT'?"}
    
    %% Shock Detected
    CHK_SHOCK -- "YES" --> CRASH_TRIGGER["🚨 TRIGGER CRASH ALERT\n[[detectionTriggerAlert()]]\n[Set NeoPixel → NEO_ALERT (Red Strobe)]\n[[buzzerSetPattern(BZR_ALERT) - Siren On]]"]
    CRASH_TRIGGER --> LORA_ALERT["[[loraSendAlert(token, lat, lon, aMag, EVENT_CRASH)]]\n[/Print: 'CRASH PACKET EMITTED OVER LORA'/]"]
    LORA_ALERT --> RET_WAIT

    %% Normal Telemetry
    CHK_SHOCK -- "NO" --> RET_WAIT

    %% Branch 3: Ping
    MSG_BRANCH -- "PING" --> PONG["[/Send BLE TX: 'PONG'/]"]
    PONG --> RET_WAIT

    style BLE_IN fill:#1a1c2e,stroke:#3b82f6,color:#fff
    style CRASH_TRIGGER fill:#ef4444,stroke:#b91c1c,color:#fff
    style CANCEL_ACTION fill:#10b981,stroke:#059669,color:#fff
    style CHK_SHOCK fill:#f59e0b,stroke:#d97706,color:#fff
```
</details>

---

## 3. Receiver Firmware Program Flowchart (`receiver_withDesktop/`)

![Receiver Firmware Program Flowchart](graphics/Program_Flowchart_Receiver.png)

> **High-Resolution Formats:**  
> • [Download Vector SVG](graphics/Program_Flowchart_Receiver.svg)  
> • [Download 300 DPI PNG](graphics/Program_Flowchart_Receiver.png)

<details>
<summary><b>Click to View Algorithmic Step-by-Step Logic & Mermaid Code</b></summary>

### 3.1 Packet Ingestion & Routing Routine (`loop()`)

```mermaid
flowchart TD
    START_RX(["([CYCLE: Receiver loop() ~5ms])"]) --> RUN_WIFI["[[wifiManagerUpdate(): Handle captive portal & reconn]]"]
    RUN_WIFI --> CHK_LORA_RDY{"_loraOk == true?"}
    
    CHK_LORA_RDY -- "NO" --> CHECK_QUEUE
    CHK_LORA_RDY -- "YES" --> POLL_LORA["[/LoRa.parsePacket(): Check RF FIFO Buffer/]"]

    POLL_LORA --> PKT_AVAIL{"Packet Available\nin LoRa FIFO?"}
    PKT_AVAIL -- "NO" --> CHECK_QUEUE

    %% Packet Decoded
    PKT_AVAIL -- "YES" --> BLINK_BLUE["[[neopixelTriggerPacketFlash(): 80ms Blue Blink]]\n[/LoRa.readBytes(rxBuf, packetLen)/]"]
    BLINK_BLUE --> READ_HEADER["[Extract packetType = rxBuf[0]\nExtract deviceToken = rxBuf[1..8]]"]

    READ_HEADER --> SWITCH_TYPE{"Evaluate\npacketType"}

    %% Type 1: Alert
    SWITCH_TYPE -- "PKT_ALERT (1)" --> HANDLE_ALERT["[Extract lat, lon, aMag, eventType]\n[[neopixelSetAlertState(true): Red Strobe]]\n[/Serial Print Formatted Alert JSON/]"]
    HANDLE_ALERT --> UPLOAD_ALERT{"WiFi Status ==\nCONNECTED?"}
    UPLOAD_ALERT -- "YES" --> HTTP_ALERT["[[httpUploadEvent(alertJson)]]"]
    UPLOAD_ALERT -- "NO" --> QUEUE_ALERT["[[localQueueAdd(alertJson)]]\n[/Buffer to LittleFS Flash Queue/]"]
    HTTP_ALERT --> CHECK_QUEUE
    QUEUE_ALERT --> CHECK_QUEUE

    %% Type 2: False Alarm
    SWITCH_TYPE -- "PKT_FALSE_ALARM (2)" --> HANDLE_FA["[Extract lat, lon]\n[[neopixelTriggerFalseAlarmFlash(): Cyan Blink]]\n[[neopixelClearAlert(): Return to Online Green]]\n[/Serial Print False Alarm JSON/]"]
    HANDLE_FA --> UPLOAD_FA{"WiFi Status ==\nCONNECTED?"}
    UPLOAD_FA -- "YES" --> HTTP_FA["[[httpUploadEvent(faJson)]]"]
    UPLOAD_FA -- "NO" --> QUEUE_FA["[[localQueueAdd(faJson)]]"]
    HTTP_FA --> CHECK_QUEUE
    QUEUE_FA --> CHECK_QUEUE

    %% Type 0: Telemetry
    SWITCH_TYPE -- "PKT_TELEMETRY (0)" --> HANDLE_TEL["[Extract lat, lon, battPct, RSSI, SNR]\n[/Serial Print Telemetry JSON/]"]
    HANDLE_TEL --> UPLOAD_TEL{"WiFi Status ==\nCONNECTED?"}
    UPLOAD_TEL -- "YES" --> HTTP_TEL["[[httpUploadEvent(telJson)]]"]
    UPLOAD_TEL -- "NO" --> DISCARD_TEL["[Skip Queuing (Telemetry is Transient)]"]
    HTTP_TEL --> CHECK_QUEUE
    DISCARD_TEL --> CHECK_QUEUE

    %% Type 6: Rider Profile
    SWITCH_TYPE -- "PKT_RIDER_PROFILE (6)" --> HANDLE_PROF["[Unpack 233-byte profile: name, plate, contact,\nblood, category, emergencyPhone, photoUrl]\n[/Serial Print Profile JSON/]"]
    HANDLE_PROF --> UPLOAD_PROF{"WiFi Status ==\nCONNECTED?"}
    UPLOAD_PROF -- "YES" --> HTTP_PROF["[[httpUploadRiderProfile(profileJson)]]"]
    UPLOAD_PROF -- "NO" --> QUEUE_PROF["[[localQueueAddRiderProfile(profileJson)]]"]
    HTTP_PROF --> CHECK_QUEUE
    QUEUE_PROF --> CHECK_QUEUE

    %% Queue Drain & Heartbeat
    CHECK_QUEUE["[[localQueueUpdate(): If WiFi connected, drain queued items]]"]
    CHECK_QUEUE --> UPDATE_NEO["[[neopixelUpdate(): Refresh NeoPixel & GPIO status LED]]"]
    UPDATE_NEO --> CHK_HB{"millis() - lastHeartbeat\n>= 15000?"}
    CHK_HB -- "YES" --> PRINT_HB["[/Serial Print Heartbeat: LoRa OK, WiFi IP, Queue Count/]\n[Update lastHeartbeat = millis()]"]
    CHK_HB -- "NO" --> DELAY_RX
    PRINT_HB --> DELAY_RX

    DELAY_RX["[delay(5ms)]"] --> END_RX(["([REPEAT: Receiver loop()])"])

    style START_RX fill:#1a1c2e,stroke:#3b82f6,color:#fff
    style END_RX fill:#10b981,stroke:#059669,color:#fff
    style HANDLE_ALERT fill:#ef4444,stroke:#b91c1c,color:#fff
    style HANDLE_FA fill:#10b981,stroke:#059669,color:#fff
    style SWITCH_TYPE fill:#f59e0b,stroke:#d97706,color:#fff
```
</details>

---

## 4. Desktop Rescuer Application Program Flowchart (`desktop_app/Program.cs`)

![Desktop Rescuer Application Program Flowchart](graphics/Program_Flowchart_Desktop.png)

> **High-Resolution Formats:**  
> • [Download Vector SVG](graphics/Program_Flowchart_Desktop.svg)  
> • [Download 300 DPI PNG](graphics/Program_Flowchart_Desktop.png)

<details>
<summary><b>Click to View Algorithmic Step-by-Step Logic & Mermaid Code</b></summary>

### 4.1 Master Entry Point & Background Worker Init (`Main()`)

```mermaid
flowchart TD
    D_START(["([START: Launch RAMS_Rescuer_Desktop.exe])"]) --> LOAD_DATA["[[LoadRegistrations() from registrations.json]]\n[[LoadIncidents() from incidents.json]]"]
    LOAD_DATA --> THREAD_SERIAL["{{Spawn Background Thread: StartSerialReceiverBridge()\nScans all active COM ports every 2000ms}}"]
    THREAD_SERIAL --> THREAD_LAN["{{Spawn Background Thread: StartLanReceiverBridge()\nStarts TcpListener on 0.0.0.0:8888}}"]
    THREAD_LAN --> FIND_PORT["[Iterate ports 8080 through 8095\nSelect first available TCP port]"]
    FIND_PORT --> START_HTTP["[[StartServer(selectedPort)\nInitialize HttpListener with wildcard + loopback prefixes]]"]
    START_HTTP --> LAUNCH_BROWSER["[[LaunchEdgeApp(http://127.0.0.1:port/)\nExecutes msedge.exe --app=url (Chromeless Mode)\nFallback to Process.Start(url) if Edge missing]]"]
    
    LAUNCH_BROWSER --> KEEP_ALIVE{"Keep-Alive Evaluation\nEvery 1000ms"}
    KEEP_ALIVE -- "_exitRequested == true\nOR browser inactive > 15s" --> CLEANUP["[Stop HttpListener]\n[Stop TCP Listener]\n[Set _serialRunning = false]\n[Close Open COM Ports]"]
    KEEP_ALIVE -- "App Active" --> KEEP_ALIVE
    CLEANUP --> D_END(["([TERMINATE: Process Exit 0])"])

    style D_START fill:#1a1c2e,stroke:#3b82f6,color:#fff
    style D_END fill:#ef4444,stroke:#b91c1c,color:#fff
    style KEEP_ALIVE fill:#f59e0b,stroke:#d97706,color:#fff
```

### 4.2 Event Processing Algorithm (`ProcessIncomingPayload()`)

```mermaid
flowchart TD
    PAYLOAD_IN(["([INVOKE: ProcessIncomingPayload(payload, defaultPrefix)])"]) --> EXTRACT_KEYS["[Extract payload fields: event, packetType, token, lat, lon]"]
    EXTRACT_KEYS --> BRANCH_EVT{"Evaluate\npacketType / event"}

    %% Profile Ingestion
    BRANCH_EVT -- "rider_profile / register" --> MERGE_PROF["[Extract name, plate, contact, blood, category, emergencyPhone, photoUrl]\n[Merge into _registrations[token] dictionary]\n[[SaveRegistrations() → registrations.json]]"]
    MERGE_PROF --> ENRICH_HIST["[Iterate through _eventsJsonList:\nUpdate riderName, photoUrl, vehicleModel\nfor all historical events matching deviceToken]"]
    ENRICH_HIST --> SAVE_HIST["[[SaveIncidents() → incidents.json]]"]
    SAVE_HIST --> PAYLOAD_RET(["([RETURN: Ingestion Complete])"])

    %% False Alarm Ingestion
    BRANCH_EVT -- "false_alarm" --> MATCH_TOKEN{"Search _eventsJsonList:\nFound active alert with\nmatching deviceToken?"}
    MATCH_TOKEN -- "YES" --> CANCEL_SPECIFIC["[Update incident status → 'FALSE ALARM']\n[Update type → 'false_alarm']"]
    MATCH_TOKEN -- "NO" --> MATCH_RECENT{"Search _eventsJsonList:\nFound ANY recent active\nalert within last 5 mins?"}
    MATCH_RECENT -- "YES" --> CANCEL_RECENT["[Update most recent active alert status → 'FALSE ALARM']"]
    MATCH_RECENT -- "NO" --> INSERT_FA_REC["[Insert new false_alarm event record at index 0]"]
    CANCEL_SPECIFIC --> SAVE_FA["[[SaveIncidents() → incidents.json]]"]
    CANCEL_RECENT --> SAVE_FA
    INSERT_FA_REC --> SAVE_FA
    SAVE_FA --> PAYLOAD_RET

    %% Crash Alert Ingestion
    BRANCH_EVT -- "alert / test" --> CHK_COORDS{"lat != 0.0 &&\nlon != 0.0?"}
    CHK_COORDS -- "NO" --> USE_LAST_KNOWN["[Lookup last-known valid lat/lon for deviceToken\nFallback if available]"]
    CHK_COORDS -- "YES" --> BUILD_ALERT_OBJ
    USE_LAST_KNOWN --> BUILD_ALERT_OBJ["[Generate Unique ID: 'RAMS-ALERT-yyyyMMdd-HHmmss-fff']\n[Hydrate with rider profile from _registrations[token]]\n[Insert new Incident at Index 0 of _eventsJsonList]"]
    BUILD_ALERT_OBJ --> SAVE_ALERT["[[SaveIncidents() → incidents.json]]"]
    SAVE_ALERT --> PAYLOAD_RET

    %% Telemetry Ingestion
    BRANCH_EVT -- "telemetry" --> CHK_TEL_COORDS{"lat != 0.0 &&\nlon != 0.0?"}
    CHK_TEL_COORDS -- "NO" --> DISCARD_TEL["[Discard (No GPS Fix)]"]
    CHK_TEL_COORDS -- "YES" --> DEDUPL_TEL["[Remove previous telemetry record for this token]\n[Insert updated telemetry record at index 0]"]
    DEDUPL_TEL --> SAVE_TEL["[[SaveIncidents() → incidents.json]]"]
    DISCARD_TEL --> PAYLOAD_RET
    SAVE_TEL --> PAYLOAD_RET

    style PAYLOAD_IN fill:#1a1c2e,stroke:#3b82f6,color:#fff
    style PAYLOAD_RET fill:#10b981,stroke:#059669,color:#fff
    style BUILD_ALERT_OBJ fill:#ef4444,stroke:#b91c1c,color:#fff
    style CANCEL_SPECIFIC fill:#10b981,stroke:#059669,color:#fff
    style BRANCH_EVT fill:#f59e0b,stroke:#d97706,color:#fff
```
</details>

---

## 5. Android Companion Application Program Flowchart (`android_app/`)

![Android Companion Application Program Flowchart](graphics/Program_Flowchart_Android.png)

> **High-Resolution Formats:**  
> • [Download Vector SVG](graphics/Program_Flowchart_Android.svg)  
> • [Download 300 DPI PNG](graphics/Program_Flowchart_Android.png)

<details>
<summary><b>Click to View Algorithmic Step-by-Step Logic & Mermaid Code</b></summary>

```mermaid
flowchart TD
    A_START(["([START: Launch Android Companion App])"]) --> REQ_PERMS["{{Request Runtime Permissions:\nACCESS_FINE_LOCATION, BLUETOOTH_SCAN,\nBLUETOOTH_CONNECT, BODY_SENSORS}}"]
    
    REQ_PERMS --> CHK_PERMS{"All Permissions\nGranted?"}
    CHK_PERMS -- "NO" --> SHOW_PERM_RATIONALE["[/Display Permission Rationale Dialog/]"]
    SHOW_PERM_RATIONALE --> REQ_PERMS

    CHK_PERMS -- "YES" --> LOAD_LOCAL_PROF["[[Load Rider Profile from SharedPreferences]]\n[/Display Dashboard UI/]"]
    LOAD_LOCAL_PROF --> SCAN_BLE["[[Start BLE Scan for Name: 'RAMS Wearable']]"]

    SCAN_BLE --> CHK_FOUND{"Device\nDiscovered?"}
    CHK_FOUND -- "NO" --> RETRY_SCAN["[Exponential Backoff & Retry Scan]"]
    RETRY_SCAN --> SCAN_BLE

    CHK_FOUND -- "YES" --> CONNECT_GATT["[[BluetoothGatt.connectGatt()]]\n[Discover Nordic UART Service NUS]"]
    CONNECT_GATT --> START_SENSORS["{{Register 100Hz Accelerometer & Gyroscope Listener}}\n{{Start FusedLocationProviderClient Updates (1Hz)}}"]

    START_SENSORS --> SENSOR_LOOP{"Continuous Sensor Loop\n(Every 10ms)"}
    
    SENSOR_LOOP --> READ_IMU["[/Read ax, ay, az, gx, gy, gz/]"]
    READ_IMU --> CALC_AMAG["[Compute aMag = sqrt(ax² + ay² + az²)]\n[Compute Pitch & Roll from Gravity Vector]"]

    CALC_AMAG --> CHK_SHOCK_THRESH{"aMag >= 3.5G\nOR Tilt > 65° with 0 Speed\nOR Manual SOS Tapped?"}

    %% Impact Detected: Grace Period
    CHK_SHOCK_THRESH -- "YES" --> SHOW_COUNTDOWN["🚨 LAUNCH 15-SECOND PRE-ALERT DIALOG\n[Play Warning Alarm Tone on Phone Speaker]\n[/Send BLE TX: {shock:1, type:'PRE_ALERT'}/]"]
    SHOW_COUNTDOWN --> AWAIT_CANCEL{"User Tapped\n'Cancel False Alarm'?"}

    AWAIT_CANCEL -- "YES (User Cancelled)" --> DISMISS_PHONE["[/Send BLE TX: {type:'CANCEL_ALERT'}/]\n[Dismiss Dialog & Resume Normal Loop]"]
    DISMISS_PHONE --> SENSOR_LOOP

    AWAIT_CANCEL -- "NO (Timer Hits 0)" --> CONFIRM_EMERGENCY["🚨 CONFIRM EMERGENCY ALERT\n[/Send BLE TX: {shock:1, type:'EMERGENCY_ALERT', aMag: aMag}/]\n[Display 'Emergency Dispatched' Status Screen]"]
    CONFIRM_EMERGENCY --> SENSOR_LOOP

    %% Normal Telemetry
    CHK_SHOCK_THRESH -- "NO" --> CHK_TEL_TIMER{"Time Since Last\nBLE Telemetry >= 1000ms?"}
    CHK_TEL_TIMER -- "YES" --> BUILD_TEL_JSON["[Build JSON: lat, lon, spd, alt, aMag, token, profile]\n[/Write to BLE NUS RX Characteristic/]"]
    CHK_TEL_TIMER -- "NO" --> SENSOR_LOOP
    BUILD_TEL_JSON --> SENSOR_LOOP

    style A_START fill:#1a1c2e,stroke:#3b82f6,color:#fff
    style SHOW_COUNTDOWN fill:#ef4444,stroke:#b91c1c,color:#fff
    style DISMISS_PHONE fill:#10b981,stroke:#059669,color:#fff
    style CONFIRM_EMERGENCY fill:#b91c1c,stroke:#fff,color:#fff
    style CHK_SHOCK_THRESH fill:#f59e0b,stroke:#d97706,color:#fff
```
</details>

---

## 6. Slide Presentation Notes & Explanations (For Presenter / Defense)

### Slide 1: Program Flowchart Scope & Architecture
> *"Judges and panel members, this Program Flowchart specifies the algorithmic logic across all four software modules: the Wearable Embedded Firmware, the Receiver Gateway Firmware, the Desktop Command Center Engine, and the Android Sensing App. Each component operates asynchronously with rigorous validation and zero-blocking execution loops."*

### Slide 2: Wearable Firmware Algorithm & Crash Verification FSM
> *"Within the wearable node, the execution loop maintains a 5ms clock cycle. When the phone IMU detects an acceleration magnitude exceeding the 3.5G threshold, an interrupt-driven pre-alert is triggered. The program immediately initiates a 15-second grace window, pulsing the red NeoPixel and activating the buzzer. If the rider presses the hardware button or cancels via the smartphone UI, the firmware transitions into false alarm suppression, emits `PKT_FALSE_ALARM`, and resets. Only upon timer expiration without cancellation is `PKT_ALERT` dispatched over the LoRa radio."*

### Slide 3: Base Station Fail-Safe Ingestion Logic
> *"In the receiver gateway, LoRa packet reception takes highest priority. When a packet arrives, the receiver decodes the binary header and extracts the device token. If the base station has an active internet/LAN connection, it performs an immediate HTTP POST to the command server. If local WiFi is disconnected, the program invokes `localQueueAdd()`, safely writing the binary packet to LittleFS non-volatile flash memory. The background daemon continually polls the network and flushes the queue in FIFO sequence as soon as connectivity resumes, guaranteeing zero data loss."*
