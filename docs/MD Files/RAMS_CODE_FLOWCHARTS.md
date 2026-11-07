# RAMS Master Code Execution Flowcharts: Function-by-Function Engineering Plan
===============================================================================
Author: RAMS Research & Development Team
Discipline: Computer Engineering / Electronics & Communications Engineering
Document Version: 2.5-RevC
Last Updated: November 2026
Diagram Syntax: Mermaid Specification (flowchart TD)

---

## 1. Overview & Architectural Scope
This document provides the exhaustive, block-by-block, function-by-function program execution flowcharts for the Road Accident Monitoring System (RAMS). Designed according to standard IEEE/ABET Computer Engineering and IT program planning specifications, every diagram details conditional branches, state transitions, IPC handlers, memory allocations, and hardware timers without abstraction shortcuts.

---

## 2. Voice AI State Machine & Wake-Word Event Lifecycle

```mermaid
flowchart TD
    START([System Boot / Service Start]) --> INIT["VoiceAlarmCanceler.init(context)"]
    INIT --> CHECK_PERMS{"Manifest.permission.RECORD_AUDIO Granted?"}
    CHECK_PERMS -- No --> WAIT_PERM["Prompt User Permission Dialog"]
    WAIT_PERM --> CHECK_PERMS
    CHECK_PERMS -- Yes --> BIND_TTS["TextToSpeech.init() & bind UtteranceProgressListener"]
    BIND_TTS --> START_LISTEN["startListeningForCancel()"]
    START_LISTEN --> DORMANT_CHECK{"_engineState == DORMANT?"}
    DORMANT_CHECK -- Yes --> TRANS_LISTEN["_engineState = LISTENING"]
    DORMANT_CHECK -- No --> EVAL_ACTIVE["Maintain Active Session"]
    TRANS_LISTEN --> RESTART_RECOG["restartSpeechRecognizer()"]
    EVAL_ACTIVE --> RESTART_RECOG

    subgraph Recognizer_Session_Guard ["Recognizer Session Controller"]
        RESTART_RECOG --> CHECK_BUSY{"isTtsSpeaking == true OR State == COMMAND_SPOTTED?"}
        CHECK_BUSY -- Yes --> ABORT_RESTART["Abort: Postpone until Audio Hardware Idle"]
        CHECK_BUSY -- No --> COOLDOWN_CHECK{"CurrentTime - LastRestart >= 2000ms?"}
        COOLDOWN_CHECK -- No --> DEFER_RESTART["mainHandler.postDelayed(restartRunnable, remainingMs)"]
        COOLDOWN_CHECK -- Yes --> BUILD_INTENT["Construct RecognizerIntent (en-PH, fil-PH, 3000ms silence)"]
        BUILD_INTENT --> REUSE_RECOG{"speechRecognizer != null?"}
        REUSE_RECOG -- Yes --> TRY_CANCEL["speechRecognizer.cancel()"]
        TRY_CANCEL --> TRY_START["speechRecognizer.startListening(intent)"]
        TRY_START -- Success --> AWAIT_SPEECH["Await OS Audio Ingestion"]
        TRY_START -- Failure / DeadObject --> DESTROY_STALE["speechRecognizer.destroy() -> set null"]
        DESTROY_STALE --> BIND_COMPONENT["getBestRecognitionServiceComponent()"]
        REUSE_RECOG -- No --> BIND_COMPONENT
        BIND_COMPONENT --> CREATE_FRESH["SpeechRecognizer.createSpeechRecognizer(context, component)"]
        CREATE_FRESH --> REG_LISTENER["speechRecognizer.setRecognitionListener()"]
        REG_LISTENER --> FRESH_START["speechRecognizer.startListening(intent)"]
        FRESH_START --> AWAIT_SPEECH
    end

    subgraph Listener_Callbacks ["RecognitionListener Pipeline"]
        AWAIT_SPEECH --> CB_READY["onReadyForSpeech() -> _engineState = LISTENING"]
        AWAIT_SPEECH --> CB_BEGIN["onBeginningOfSpeech() -> _engineState = HEARING"]
        AWAIT_SPEECH --> CB_PARTIAL["onPartialResults(bundle)"]
        AWAIT_SPEECH --> CB_RESULTS["onResults(bundle)"]
        AWAIT_SPEECH --> CB_ERROR["onError(errorCode)"]

        CB_ERROR --> HANDLE_ERR{"errorCode == ERROR_NO_MATCH || ERROR_SPEECH_TIMEOUT?"}
        HANDLE_ERR -- Yes --> RETRY_BURST["scheduleRestart(100ms)"]
        HANDLE_ERR -- No --> CLIENT_ERR{"errorCode == ERROR_RECOGNIZER_BUSY?"}
        CLIENT_ERR -- Yes --> CANCEL_FLUSH["speechRecognizer.cancel() -> scheduleRestart(500ms)"]
        CLIENT_ERR -- No --> RECREATE_BURST["speechRecognizer.destroy() -> scheduleRestart(1500ms)"]

        CB_PARTIAL --> EXTRACT_PARTIAL["Extract ArrayList<String> (RESULTS_RECOGNITION)"]
        EXTRACT_PARTIAL --> MATCH_TRIGGER_PARTIAL["checkMatchesForTrigger(matches, isPartial=true)"]

        CB_RESULTS --> EXTRACT_FINAL["Extract ArrayList<String> (RESULTS_RECOGNITION)"]
        EXTRACT_FINAL --> MATCH_TRIGGER_FINAL["checkMatchesForTrigger(matches, isPartial=false)"]
    end
```

---

## 3. Speech Recognition Priority Routing & Phonetic Normalization

```mermaid
flowchart TD
    MATCH_IN["checkMatchesForTrigger(matches, isPartial)"] --> ITER_MATCHES["Loop Each Candidate String in matches"]
    ITER_MATCHES --> PHON_NORM["TuguegaraoOfflineSpatialEngine.normalizeLocalPhonetics(phrase)"]
    PHON_NORM --> REGEX_NORM["normalizeText(phoneticallyClean)"]
    REGEX_NORM --> CHECK_BLANK{"normalized.isBlank()?"}
    CHECK_BLANK -- Yes --> NEXT_MATCH["Continue Next Candidate"]
    CHECK_BLANK -- No --> EVAL_CANCEL{"Match CANCEL_COMMANDS or CANCEL_REGEX?"}

    subgraph Priority_1_Emergency_Cancel ["Priority 1: Life-Safety Abort"]
        EVAL_CANCEL -- Yes --> SET_DETECTED["_detectedPhraseFlow.value = normalized"]
        SET_DETECTED --> CHECK_ALARM_CTX{"Alarm Countdown Active (>0)?"}
        CHECK_ALARM_CTX -- Yes --> LOG_CANCEL["Log: Critical Voice Cancel Dispatched"]
        LOG_CANCEL --> INVOKE_DISMISS["onEmergencyVoiceDismiss()"]
        INVOKE_DISMISS --> EMIT_FALSE_ALARM["Esp32SyncEngine.sendCancelAlertPacket()"]
        EMIT_FALSE_ALARM --> PLAY_CONFIRM["ToneGenerator: BZR_CONFIRM / TTS Spoken Ack"]
        PLAY_CONFIRM --> RESET_STATE["_engineState = COMMAND_SPOTTED -> DORMANT"]
        CHECK_ALARM_CTX -- No --> RESET_STATE
    end

    subgraph Priority_2_Wake_Word ["Priority 2: Assistant Summoning"]
        EVAL_CANCEL -- No --> CHECK_STAGE{"isAwaitingCommandStage == true?"}
        CHECK_STAGE -- No --> EVAL_WAKE{"checkFuzzyWakeWord(normalized) == true?"}
        EVAL_WAKE -- Yes --> CHECK_INLINE_QUERY{"extractQueryAfterWakeWord(phrase) != empty?"}
        CHECK_INLINE_QUERY -- Yes --> HANDLE_DIRECT_QUERY["handleConversationalQuery(extractedQuery)"]
        CHECK_INLINE_QUERY -- No --> OPEN_BUBBLE["openBubbleUi()"]
        OPEN_BUBBLE --> PLAY_CHIME["playListeningTone() (Dual-frequency ascending beep)"]
        PLAY_CHIME --> ARM_AWAIT["_engineState = AWAITING_COMMAND, isAwaitingCommandStage = true"]
        ARM_AWAIT --> REARM_MIC["restartListeningForCommand()"]
        EVAL_WAKE -- No --> NEXT_MATCH
    end

    subgraph Priority_3_Conversational_Query ["Priority 3: Dialog Execution"]
        CHECK_STAGE -- Yes --> CHECK_IS_PARTIAL{"isPartial == true?"}
        CHECK_IS_PARTIAL -- Yes --> UPDATE_TRANSCRIPT["_liveTranscriptFlow.value = normalized"]
        CHECK_IS_PARTIAL -- No --> ROUTE_QUERY["handleConversationalQuery(normalized)"]
        ROUTE_QUERY --> ASSISTANT_ENGINE["RamsAiAssistantEngine.generateAssistantResponse(query)"]
        ASSISTANT_ENGINE --> SPEAK_RESPONSE["VoiceAlarmCanceler.speak(response)"]
        SPEAK_RESPONSE --> CLOSE_BUBBLE_TIMER["Schedule Bubble Auto-Dismissal"]
    end
```

---

## 4. AI Assistant Intent Decision Tree (`generateAssistantResponse`)

```mermaid
flowchart TD
    QUERY_ENTRY["generateAssistantResponse(rawQuery)"] --> DISPATCH_IO["withContext(Dispatchers.IO)"]
    DISPATCH_IO --> NORM_PHONETICS["normalizeLocalPhonetics(rawQuery)"]
    NORM_PHONETICS --> EXTRACT_LOWER["lower = trimmed.lowercase(Locale.US)"]
    EXTRACT_LOWER --> READ_SYS["sys = getSystemContext() (GPS, IMU, Wearable, Rider Profile)"]

    READ_SYS --> BRANCH_PROFILE{"lower contains 'profile', 'vehicle', 'who am i', 'registration'?"}
    BRANCH_PROFILE -- Yes --> RET_PROFILE["Return Rider Credentials / Profile Edit Guidance"]

    BRANCH_PROFILE -- No --> BRANCH_CREDITS{"lower contains 'credit', 'creator', 'team', 'developer'?"}
    BRANCH_CREDITS -- Yes --> RET_CREDITS["Return IECEP Competition & DOST-ASTI Team Attribution"]

    BRANCH_CREDITS -- No --> BRANCH_WEATHER{"lower contains 'weather', 'rain', 'temperature', 'forecast'?"}
    BRANCH_WEATHER -- Yes --> FETCH_WEATHER{"isOnline() && sys.hasGpsFix?"}
    FETCH_WEATHER -- Yes --> API_WEATHER["fetchLiveWeatherRaw(lat, lon) -> OpenMeteo API"]
    FETCH_WEATHER -- No --> OFFLINE_WEATHER["Return Local Heuristic Weather Surface Warning"]
    API_WEATHER --> RET_WEATHER["Return Contextual Surface Friction & Rain Warning"]
    OFFLINE_WEATHER --> RET_WEATHER

    BRANCH_WEATHER -- No --> BRANCH_SPEED{"lower contains 'speed', 'velocity', 'how fast'?"}
    BRANCH_SPEED -- Yes --> FORMAT_SPEED["Format Kinematics: sys.speedKmh & userType Conditioning"]
    FORMAT_SPEED --> RET_SPEED["Return Spoken Speed Telemetry"]

    BRANCH_SPEED -- No --> BRANCH_GFORCE{"lower contains 'g force', 'acceleration', 'shock'?"}
    BRANCH_GFORCE -- Yes --> FORMAT_G["Format Kinematics: sys.liveG & sys.peakG"]
    FORMAT_G --> RET_G["Return Spoken G-force Telemetry"]

    BRANCH_GFORCE -- No --> BRANCH_WEARABLE{"lower contains 'wearable', 'bluetooth', 'band', 'wristband'?"}
    BRANCH_WEARABLE -- Yes --> FORMAT_BLE["Format BLE Connection State & sys.wearableBatteryPct"]
    FORMAT_BLE --> RET_BLE["Return Wearable GATT Link Status"]

    BRANCH_WEARABLE -- No --> BRANCH_LOCATION{"lower contains 'where am i', 'location', 'nasaan ako', 'coordinates'?"}
    BRANCH_LOCATION -- Yes --> GEO_REV["TuguegaraoOfflineSpatialEngine.reverseGeocode(lat, lon)"]
    GEO_REV --> RET_LOC["Return Exact Human-Readable Landmark & Barangay"]

    BRANCH_LOCATION -- No --> BRANCH_FARE{"lower contains 'pamasahe', 'fare', 'capacity', 'sinisingil', 'scam', 'tricycle'?"}
    BRANCH_FARE -- Yes --> FARE_ENGINE["TuguegaraoOfflineSpatialEngine.getTricycleFareAndScamAdvisory(lat, lon, query)"]
    FARE_ENGINE --> RET_FARE["Return Ordinance No. 50-09-2022 Mandate & Anti-Overcharge Citation"]

    BRANCH_FARE -- No --> BRANCH_DIRECTIONS{"lower contains 'how to go', 'direction', 'papunta sa', 'saan ang'?"}
    BRANCH_DIRECTIONS -- Yes --> ROUTE_ENGINE["TuguegaraoOfflineSpatialEngine.generateOfflineDirections(lat, lon, query)"]
    ROUTE_ENGINE --> HAS_ROUTE{"Target Landmark Found in Database?"}
    HAS_ROUTE -- Yes --> RET_DIRECTIONS["Return Distance, Heading, Travel Time & Regulated Fare"]
    HAS_ROUTE -- No --> FALLTHROUGH_CLOUD

    BRANCH_DIRECTIONS -- No --> FALLTHROUGH_CLOUD{"isOnline() && API Key Configured?"}
    FALLTHROUGH_CLOUD -- Yes --> GEMINI_REQ["queryGeminiChat(query, sys) (Gemini 3.8 Flash)"]
    GEMINI_REQ -- Valid Response --> RET_GEMINI["Return Distilled LLM Conversational Speech (<=35 words)"]
    GEMINI_REQ -- Network/API Error --> OFFLINE_FALLBACK["generateOfflineHeuristicResponse(query, sys)"]
    FALLTHROUGH_CLOUD -- No --> OFFLINE_FALLBACK
    OFFLINE_FALLBACK --> RET_OFFLINE["Return Deterministic Local Safe Response"]
```

---

## 5. 50Hz Sensor Fusion & Emergency Crash Detection Pipeline

```mermaid
flowchart TD
    SENSOR_INT["Hardware Sensor Interrupt (TYPE_ACCELEROMETER & TYPE_GYROSCOPE)"] --> SENSOR_EVENT["PhoneSensorEngine.onSensorChanged(event)"]
    SENSOR_EVENT --> EXTRACT_AXES["Extract Accel(ax, ay, az) & Gyro(gx, gy, gz)"]
    EXTRACT_AXES --> COMPUTE_MAG["aMag = sqrt(ax^2 + ay^2 + az^2) / 9.80665"]
    COMPUTE_MAG --> COMPUTE_ROT["gyroMag = sqrt(gx^2 + gy^2 + gz^2)"]
    COMPUTE_ROT --> BUFFER_FIFO["Push into 50-sample Rolling Window FIFO Buffer"]

    BUFFER_FIFO --> COMPUTE_VAR["Compute 1-second Rolling Variance & Mean Tilt Angle"]
    COMPUTE_VAR --> CHECK_USER_ROLE{"sys.userType Classifier"}

    subgraph Kinematic_Threshold_Matrix ["Role-Adaptive Fall / Skid / Impact FSM"]
        CHECK_USER_ROLE -- "Motorcycle Rider" --> MOTO_CHECKS{"aMag > 4.2G OR (aMag > 2.8G && gyroMag > 4.5 rad/s)?"}
        CHECK_USER_ROLE -- "Pedestrian" --> PED_CHECKS{"aMag > 3.0G && orientationTilt > 65 deg?"}
        CHECK_USER_ROLE -- "Cyclist" --> BIKE_CHECKS{"aMag > 3.5G && gyroMag > 3.8 rad/s?"}
        CHECK_USER_ROLE -- "Car Driver" --> CAR_CHECKS{"aMag > 5.5G (Severe Vehicular Impact Spike)?"}

        MOTO_CHECKS -- Yes --> TRIGGER_FSM["State: POTENTIAL_IMPACT_DETECTED"]
        PED_CHECKS -- Yes --> TRIGGER_FSM
        BIKE_CHECKS -- Yes --> TRIGGER_FSM
        CAR_CHECKS -- Yes --> TRIGGER_FSM

        MOTO_CHECKS -- No --> NORMAL_CADENCE["Update AI Motion Profile (CRUISING / STATIONARY)"]
        PED_CHECKS -- No --> NORMAL_CADENCE
        BIKE_CHECKS -- No --> NORMAL_CADENCE
        CAR_CHECKS -- No --> NORMAL_CADENCE
    end

    TRIGGER_FSM --> POST_IMPACT_STILLNESS{"Check Post-Impact Inactivity (3000ms window: aMag ~= 1.0G, gyro ~= 0)?"}
    POST_IMPACT_STILLNESS -- Confirmed --> ENGAGE_ALARM["engageEmergencyAlarm(peakG, eventType)"]
    POST_IMPACT_STILLNESS -- Rider Resumed Motion --> RESET_FSM["False Positive: Motion Resumed Nominally"]

    subgraph Emergency_Alarm_Countdown ["15-Second Critical Abort Window"]
        ENGAGE_ALARM --> ARM_COUNTDOWN["alarmCountdownSec = 15"]
        ARM_COUNTDOWN --> SIREN_ON["Buzzer / AudioTrack: Pulsed 95dB Sweep Siren"]
        ARM_COUNTDOWN --> VIBRATE_ON["Vibrator: Continuous Emergency Haptic Pulse"]
        ARM_COUNTDOWN --> SUMMON_OVERLAY["Summon Fullscreen Emergency Cancel Screen"]
        ARM_COUNTDOWN --> TICK_LOOP{"Countdown Tick > 0?"}

        TICK_LOOP -- Yes --> WAIT_SEC["delay(1000ms) -> Countdown--"]
        WAIT_SEC --> CHECK_DISMISS{"Physical Button OR Voice Cancel Detected?"}
        CHECK_DISMISS -- Yes --> ABORT_ALERT["Disarm Siren -> Send False Alarm Packet -> Return Normal"]
        CHECK_DISMISS -- No --> TICK_LOOP

        TICK_LOOP -- Timed Out (0s) --> DISPATCH_911["CONFIRMED ACCIDENT DISPATCH"]
        DISPATCH_911 --> LORA_UPLINK["Esp32SyncEngine.sendEmergencyCrashPacket()"]
        DISPATCH_911 --> SMS_DISPATCH["Send Automated Emergency SMS to Next of Kin"]
    end
```

---

## 6. BLE GATT to SX1278 LoRa Uplink Pipeline

```mermaid
flowchart TD
    PHONE_EVENT["Phone Event (Telemetry / Crash Alert / Cancel / Ping)"] --> BUILD_JSON["Serialize JSON Payload with Rider Token"]
    BUILD_JSON --> CHUNK_BLE["Chunk into 20-byte MTU Slices (if required)"]
    CHUNK_BLE --> WRITE_GATT["writeCharacteristic(RX_CHAR, chunk) via BLE GATT"]
    WRITE_GATT --> WEARABLE_RX["Wearable ESP32-S3: RamsRxCallbacks.onWrite()"]

    WEARABLE_RX --> ASSEMBLE_BUF["Buffer Chunks & Detect Trailing Newline or Full JSON"]
    ASSEMBLE_BUF --> DESERIALIZE["DynamicJsonDocument doc(3072): deserializeJson()"]
    DESERIALIZE --> PARSE_TYPE{"doc['type']"}

    PARSE_TYPE -- "PING" --> HANDLE_PING["Extract seq, lat, lon, phoneEpoch"]
    HANDLE_PING --> PACK_PING_PKT["Construct PingPacket (PKT_PING, 13-byte header, uint64 phoneEpoch)"]
    PACK_PING_PKT --> LORA_TX_PING["loraSendPing() -> LoRa.write(buf, sizeof(PingPacket))"]

    PARSE_TYPE -- "EMERGENCY" / "ALERT" --> HANDLE_ALERT["Extract lat, lon, eventType, peakG"]
    HANDLE_ALERT --> PACK_ALERT_PKT["Construct AlertPacket (PKT_ALERT, aMag, GPS coordinates)"]
    PACK_ALERT_PKT --> LORA_TX_ALERT["loraSendAlert() -> LoRa.write(buf, sizeof(AlertPacket))"]

    PARSE_TYPE -- "CANCEL_ALERT" --> HANDLE_CANCEL["detectionAcknowledgeAlert() & buzzerOff()"]
    HANDLE_CANCEL --> PACK_FALSE_PKT["Construct FalseAlarmPacket (PKT_FALSE_ALARM)"]
    PACK_FALSE_PKT --> LORA_TX_CANCEL["loraSendFalseAlarm() -> LoRa.write(buf, sizeof(FalseAlarmPacket))"]

    PARSE_TYPE -- "TELEMETRY" --> HANDLE_TEL["gpsSetExternalLocation(lat, lon, spd, alt)"]
    HANDLE_TEL --> INTERVAL_TEL{"Interval >= 30,000ms?"}
    INTERVAL_TEL -- Yes --> PACK_TEL_PKT["Construct TelemetryPacket (PKT_TELEMETRY, batteryPct)"]
    PACK_TEL_PKT --> LORA_TX_TEL["loraSendTelemetry() -> LoRa.write(buf, sizeof(TelemetryPacket))"]
    INTERVAL_TEL -- No --> SERIAL_LOG["Serial Pretty Print Telemetry"]

    LORA_TX_PING --> RF_TRANSMIT["SX1278 Ra-02: 433 MHz Air Transmission (SF9, BW125kHz, CR4/5)"]
    LORA_TX_ALERT --> RF_TRANSMIT
    LORA_TX_CANCEL --> RF_TRANSMIT
    LORA_TX_TEL --> RF_TRANSMIT
```

---

## 7. LoRa Receiver Base Station & Desktop Ingestion Pipeline

```mermaid
flowchart TD
    AIR_PACKET["433MHz LoRa Packet Arrives at Base Station Antenna"] --> RX_IRQ["SX1278 DIO0 Interrupt -> LoRa.parsePacket()"]
    RX_IRQ --> READ_BYTES["Read Raw Byte Stream into uint8_t buf[256]"]
    READ_BYTES --> CHECK_LEN{"bytesRead >= sizeof(PacketHeader) (13 bytes)?"}
    CHECK_LEN -- No --> DISCARD["Drop Malformed / Noise Burst Packet"]
    CHECK_LEN -- Yes --> FLASH_LED["neopixelTriggerPacketFlash() (Blue Beacon)"]

    FLASH_LED --> READ_HEADER["Extract packetType = buf[0], token = buf[1..8]"]
    READ_HEADER --> READ_SIGNAL["rssi = LoRa.packetRssi(), snr = LoRa.packetSnr()"]
    READ_SIGNAL --> ROUTE_TYPE{"packetType"}

    ROUTE_TYPE -- PKT_ALERT --> PARSE_ALERT["Cast to AlertPacket*"]
    PARSE_ALERT --> EMIT_ALERT_SERIAL["Serial.printf('{\"event\":\"LORA_ALERT\",\"token\":\"%s\",\"type\":\"%s\",\"lat\":%.6f,\"lon\":%.6f,\"aMag\":%.2f,\"rssi\":%d,\"snr\":%.1f}')"]

    ROUTE_TYPE -- PKT_FALSE_ALARM --> PARSE_FALSE["Cast to FalseAlarmPacket*"]
    PARSE_FALSE --> EMIT_FALSE_SERIAL["Serial.printf('{\"event\":\"LORA_FALSE_ALARM\",\"token\":\"%s\",\"lat\":%.6f,\"lon\":%.6f,\"rssi\":%d,\"snr\":%.1f}')"]

    ROUTE_TYPE -- PKT_PING --> PARSE_PING["Cast to PingPacket*"]
    PARSE_PING --> EMIT_PING_SERIAL["Serial.printf('{\"event\":\"LORA_PING\",\"token\":\"%s\",\"seq\":%lu,\"lat\":%.6f,\"lon\":%.6f,\"phoneEpoch\":%llu,\"rssi\":%d,\"snr\":%.1f}')"]

    ROUTE_TYPE -- PKT_TELEMETRY --> PARSE_TEL["Cast to TelemetryPacket*"]
    PARSE_TEL --> EMIT_TEL_SERIAL["Serial.printf('{\"event\":\"LORA_TELEMETRY\",\"token\":\"%s\",\"lat\":%.6f,\"lon\":%.6f,\"batt\":%d,\"rssi\":%d,\"snr\":%.1f}')"]

    EMIT_ALERT_SERIAL --> USB_CDC["USB Serial Bridge (115200 baud)"]
    EMIT_FALSE_SERIAL --> USB_CDC
    EMIT_PING_SERIAL --> USB_CDC
    EMIT_TEL_SERIAL --> USB_CDC

    USB_CDC --> DESKTOP_IN["Desktop App (Program.cs): ProcessIncomingReceiverPacket()"]
    DESKTOP_IN --> DESKTOP_ROUTE["ProcessIncomingPayload()"]

    subgraph Desktop_Operations_Engine ["Desktop Command & Dispatch Engine"]
        DESKTOP_ROUTE --> CHECK_PAYLOAD_EVENT{"event field"}
        CHECK_PAYLOAD_EVENT -- "LORA_ALERT" --> STORE_INCIDENT["Save to incidents.json & Play Audio Alert Strobe"]
        CHECK_PAYLOAD_EVENT -- "LORA_FALSE_ALARM" --> CLEAR_INCIDENT["Mark Incident RESOLVED / DISMISSED in Store"]
        CHECK_PAYLOAD_EVENT -- "LORA_PING" --> COMPUTE_PING["Calculate Delay: currentEpoch - phoneEpoch, Haversine Distance to Base Station"]
        COMPUTE_PING --> STORE_PING["Store in _pingLogsJsonList (FIFO max 1000)"]
        STORE_INCIDENT --> BROADCAST_WS["Push Update to Embedded React Dashboard via /api/events"]
        CLEAR_INCIDENT --> BROADCAST_WS
        STORE_PING --> SERVE_PING_API["Serve via GET /api/ping-log"]
    end
```

