import { CodeReviewFinding, SystemMetric, ArchitectureNode, FSMScenario } from '../types';

export const SYSTEM_METRICS: SystemMetric[] = [
  {
    category: 'Accident Detection Algorithm',
    score: 72,
    status: 'warning',
    summary: 'FSM state structure is mathematically sound, but freefall noise intolerance and single-spike direct impact cause false negatives and false positives.'
  },
  {
    category: 'Embedded Firmware & Memory Safety',
    score: 68,
    status: 'needs-attention',
    summary: 'Contains a WebSocket buffer overread bug (non-null terminated string), manual JSON parsing, and single-shot unconfirmed LoRa transmissions.'
  },
  {
    category: 'LoRa Protocol & RF Reliability',
    score: 74,
    status: 'good',
    summary: 'Compact binary packed structs fit well within SX1278 limits. Lacks packet sequence numbers, retries/ACKs, and packet integrity signatures.'
  },
  {
    category: 'Receiver & Edge Gateway',
    score: 70,
    status: 'warning',
    summary: 'Flash wear issue in queue file renaming, millis() uptime passed instead of real epoch timestamp, and single-thread blocking HTTP POST.'
  },
  {
    category: 'Cloud Backend & Data Persistence',
    score: 80,
    status: 'good',
    summary: 'Netlify Functions + Blobs implementation is clean and functional, but vulnerable to index race conditions and missing GPS boundary validation.'
  },
  {
    category: 'Frontend & UI Redesign',
    score: 88,
    status: 'excellent',
    summary: 'Rich modern React UI with Leaflet maps, incident filtering, profile drawer, and responsive emergency triage controls.'
  },
  {
    category: 'Data Science & Validation Pipeline',
    score: 92,
    status: 'excellent',
    summary: 'validate_fsm.py is well-architected for tuning thresholds against real CSV data logger traces.'
  }
];

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'wearable',
    title: 'Wearable Unit',
    role: 'Sensor Sampling & Edge Detection',
    hardware: 'ESP32 + MPU-6050 + ATGM336H GPS + Active Buzzer + RGB LED',
    protocolIn: 'I2C (MPU6050 100Hz) & UART (GPS 9600 baud)',
    protocolOut: 'SPI to SX1278 (Ra-02 433MHz LoRa) & SoftAP WebSocket Server',
    latency: '< 10ms processing latency per sample',
    criticalRisks: [
      'Single-shot LoRa alert with 0 retries leads to dropped crash events on packet loss.',
      'A single sample of noise (≥ 0.40g) during 100ms freefall resets FSM to IDLE.',
      'WebSocket buffer overread in local_ap.cpp due to non-null terminated payload.'
    ],
    keyFiles: ['wearable/detection.cpp', 'wearable/wearable.ino', 'wearable/local_ap.cpp', 'wearable/config.h']
  },
  {
    id: 'lora-channel',
    title: 'LoRa 433MHz RF Link',
    role: 'Long-Range Wireless Bridge',
    hardware: 'Ra-02 SX1278 Modules (Wearable TX -> Receiver RX)',
    protocolIn: 'Packed binary C structs (AlertPacket, TelemetryPacket, RegisterPacket)',
    protocolOut: 'Demuxed packet stream at Receiver',
    latency: '~120ms airtime per packet (SF9, BW125kHz, CR4/5)',
    criticalRisks: [
      'No sequence number or replay protection against packet spoofing.',
      'PacketHeader.deviceToken is 8 bytes without guaranteed null-termination.',
      'Comment in lora_tx.cpp claims CRC is disabled while code calls enableCrc().'
    ],
    keyFiles: ['shared/protocol.h', 'wearable/lora_tx.cpp', 'receiver/lora_rx.cpp']
  },
  {
    id: 'receiver',
    title: 'Receiver Base Station',
    role: 'Gateway & Offline Buffering',
    hardware: 'ESP32 Base Station + SX1278 + LittleFS Flash Storage',
    protocolIn: 'LoRa 433MHz continuous RX',
    protocolOut: 'HTTPS POST JSON /api/upload to Cloud Backend',
    latency: '~300ms - 2s upload latency (WiFi dependent)',
    criticalRisks: [
      'Sends millis() instead of Unix epoch timestamp, causing "1970" date displays.',
      'Cascading LittleFS file renames on full queue wear down flash memory prematurely.',
      'HTTPClient.POST runs synchronously on Arduino loop, stalling LoRa reception.'
    ],
    keyFiles: ['receiver/receiver.ino', 'receiver/http_upload.cpp', 'receiver/local_queue.cpp']
  },
  {
    id: 'backend',
    title: 'Cloud Backend & Store',
    role: 'Event Ingestion & Blob Persistence',
    hardware: 'Netlify Serverless Functions / Express Node.js Runtime + Netlify Blobs',
    protocolIn: 'HTTPS POST /api/upload (JSON)',
    protocolOut: 'JSON REST endpoints (/api/events, /api/devices)',
    latency: '< 150ms serverless invocation',
    criticalRisks: [
      'Index race condition in Netlify Blobs store.ts updateEventIndex() on concurrent alerts.',
      'No GPS coordinate range check (-90 to 90 lat, -180 to 180 lon) or token sanitation.',
      'Blindly accepting small numeric timestamp as millisecond epoch.'
    ],
    keyFiles: ['backend/netlify/functions/upload.mts', 'backend/netlify/functions/store.ts', 'UI Redesign/server.ts']
  },
  {
    id: 'dashboard',
    title: 'Operations Dashboard',
    role: 'Triage, Dispatch & Map Visualization',
    hardware: 'Browser Client (Emergency Dispatcher / Barangay Hall Terminal)',
    protocolIn: 'Periodic Polling /api/events every 2.5s (or WebSocket)',
    protocolOut: 'User actions (Acknowledge, Dispatch, Clear, Profile view)',
    latency: 'Interactive UI 60fps',
    criticalRisks: [
      'Polling storm: continuous 2.5s fetch can exhaust Netlify Function free tier quotas.',
      'Timestamp formatting displays NaN or 56-year-old dates if millis() is stored.',
      'Missing audio file buffer cleanup in UI Redesign server.ts.'
    ],
    keyFiles: ['UI Redesign/src/App.tsx', 'UI Redesign/src/components/RAMSMapView.tsx', 'backend/src/App.tsx']
  }
];

export const CODE_REVIEW_FINDINGS: CodeReviewFinding[] = [
  {
    id: 'FIND-01',
    title: 'Single-Shot LoRa Alert Transmission Without Retries (Dropped Crash Risk)',
    subsystem: 'firmware',
    subsystemName: 'Wearable Firmware & Emergency Alerting',
    severity: 'critical',
    file: 'wearable/wearable.ino',
    lineRange: 'Lines 216–233',
    problemSummary: 'When an accident is confirmed by the FSM, loraSendAlert() is invoked exactly once. Because LoRa does not provide transport-layer ACKs in this design, any RF packet collision or temporary receiver unavailability causes the alert to be permanently dropped. Simultaneously, _alertActive is set to true, locking the FSM from ever triggering again until manually acknowledged via button.',
    technicalImpact: 'Permanent loss of emergency accident distress signals in real-world road environments with non-zero packet error rates (PER).',
    realWorldScenario: 'A motorcycle rider crashes behind a concrete barrier or outside line-of-sight. The single alert packet suffers an RF collision or bit error. The receiver never receives it, and the wearable enters locked alert state thinking it already notified help. Emergency responders receive no notification.',
    problemCode: `if (det.triggered) {
  Serial.printf("[WEARABLE] ⚠ ALERT: eventType=%d peakG=%.2f\\n",
                det.eventType, det.peakAMag);
  neopixelSetState(NEO_ALERT);
  buzzerSetPattern(BZR_ALERT);

  // BUG: Transmits exactly once with no confirmation or repeated broadcast!
  if (_loraOk) {
    loraSendAlert(
      registrationGetToken().c_str(),
      gpsGetLatitude(),
      gpsGetLongitude(),
      det.eventType,
      det.peakAMag
    );
  }
}`,
    solutionCode: `// Solution: Burst-transmit the critical alert packet multiple times with random jitter,
// and continue periodic alert beaconing every 5 seconds until cancelled.
static uint32_t _lastAlertRepeatMs = 0;
static uint8_t  _alertBurstCount = 0;

if (det.triggered) {
  _alertActive = true;
  _lastAlertRepeatMs = millis();
  _alertBurstCount = 0;
  neopixelSetState(NEO_ALERT);
  buzzerSetPattern(BZR_ALERT);
}

if (_alertActive && _loraOk) {
  // Initial 4-packet burst spaced by 150-250ms random jitter, then every 6s
  bool shouldSend = false;
  if (_alertBurstCount < 4 && (now - _lastAlertRepeatMs >= (180 + random(0, 70)))) {
    shouldSend = true;
    _alertBurstCount++;
    _lastAlertRepeatMs = now;
  } else if (_alertBurstCount >= 4 && (now - _lastAlertRepeatMs >= 6000)) {
    shouldSend = true;
    _lastAlertRepeatMs = now;
  }

  if (shouldSend) {
    loraSendAlert(
      registrationGetToken().c_str(),
      gpsGetLatitude(),
      gpsGetLongitude(),
      _alertEventType,
      _alertPeakG
    );
  }
}`,
    tags: ['Safety Critical', 'Packet Loss', 'LoRa', 'Emergency Protocol']
  },
  {
    id: 'FIND-02',
    title: 'Freefall State Reset on Single Noisy Sample (High False Negative Rate)',
    subsystem: 'firmware',
    subsystemName: 'Edge Accident Detection Engine',
    severity: 'critical',
    file: 'wearable/detection.cpp',
    lineRange: 'Lines 139–153',
    problemSummary: 'In FS_FREEFALL, the condition `if (data.aMag >= FREEFALL_THRESHOLD_G)` immediately aborts the state machine and resets _fallState back to FS_IDLE. At 100Hz with a 100ms requirement, 10 consecutive samples must all be strictly below 0.40g without a single glitch or rotational centrifugal spike.',
    technicalImpact: 'Actual motorcycle crashes where a rider rotates, tumbles, or experiences engine vibration will fail to meet 10 unbroken clean samples, resulting in missed fall detections (false negatives).',
    realWorldScenario: 'A rider is thrown off a motorcycle. As the body tumbles in the air, angular velocity causes accelerometer axes to experience 0.45g centrifugal force for 10ms. The algorithm resets to IDLE immediately, ignoring the devastating 6g impact that arrives 200ms later.',
    problemCode: `case FS_FREEFALL:
  // BUG: A single 10ms sample of sensor noise or centrifugal force resets everything!
  if (data.aMag >= FREEFALL_THRESHOLD_G) {
    // Freefall ended prematurely (e.g., brief sensor glitch)
    _fallState = FS_IDLE;
  } else if (now - _freefallStart >= FREEFALL_MIN_DURATION_MS) {
    _fallState = FS_WAIT_IMPACT;
    _impactDeadline = now + IMPACT_WINDOW_MS;
    _peakImpactG = 0;
    Serial.println(F("[DETECT] Freefall confirmed, waiting for impact..."));
  }
  break;`,
    solutionCode: `// Solution: Use a consecutive sample counter with noise glitch tolerance (leaky bucket).
static uint8_t _freefallGlitchCount = 0;

case FS_FREEFALL:
  if (data.aMag < FREEFALL_THRESHOLD_G) {
    // Valid low-g sample
    if (now - _freefallStart >= FREEFALL_MIN_DURATION_MS) {
      _fallState = FS_WAIT_IMPACT;
      _impactDeadline = now + IMPACT_WINDOW_MS;
      _peakImpactG = 0;
      _freefallGlitchCount = 0;
      Serial.println(F("[DETECT] Freefall confirmed, waiting for impact..."));
    }
  } else {
    // Allow up to 2 isolated glitch samples (< 20ms) before invalidating freefall
    _freefallGlitchCount++;
    if (_freefallGlitchCount > 2 || (now - _freefallStart < 30)) {
      _fallState = FS_IDLE;
      _freefallGlitchCount = 0;
    }
  }
  break;`,
    tags: ['False Negatives', 'FSM', 'Sensor Noise', 'MPU-6050']
  },
  {
    id: 'FIND-03',
    title: 'Heap Buffer Over-Read in WebSocket String Constructor',
    subsystem: 'firmware',
    subsystemName: 'SoftAP & Setup Server',
    severity: 'critical',
    file: 'wearable/local_ap.cpp',
    lineRange: 'Lines 140–146',
    problemSummary: 'In the WebSocketsServer text event handler `_onWebSocketEvent(..., uint8_t* payload, size_t length)`, the code casts `(char*)payload` directly into `String msg = String((char*)payload)`. The WebSocket payload buffer from WebSocketsServer is NOT null-terminated! Passing a raw pointer without the explicit length causes the String constructor to read past the allocated buffer until it happens upon a random 0x00 byte in ESP32 RAM.',
    technicalImpact: 'Heap buffer over-read leading to memory corruption, spontaneous ESP32 Guru Meditation Errors (kernel panics), or memory leakage of sensitive Wi-Fi/NVS secrets over WebSocket responses.',
    realWorldScenario: 'During initial setup or on-device registration over phone browser, typing a device name causes an instant ESP32 reboot loop, locking the user out of the configuration portal.',
    problemCode: `case WStype_TEXT: {
  // BUG: payload is NOT guaranteed to be null-terminated!
  String msg = String((char*)payload);
  Serial.printf("[AP] WS message from #%u: %s\\n", clientNum, msg.c_str());

  // Brittle string matching instead of structured JSON parsing
  if (msg.indexOf("\\"type\\":\\"register\\"") >= 0) {
    ...
  }
}`,
    solutionCode: `case WStype_TEXT: {
  // Fix: Explicitly supply payload length to safely bound string construction
  // or parse directly with ArduinoJson using fixed buffer
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) {
    Serial.printf("[AP] Invalid WS JSON from #%u: %s\\n", clientNum, err.c_str());
    break;
  }

  const char* type = doc["type"] | "";
  if (strcmp(type, "register") == 0) {
    const char* name = doc["name"] | "";
    const char* driveLink = doc["driveLink"] | "";
    bool success = registrationProcess(String(name), String(driveLink));
    ...
  }
}`,
    tags: ['Buffer Overread', 'Memory Safety', 'ESP32 Crash', 'Security']
  },
  {
    id: 'FIND-04',
    title: 'Device Uptime millis() Stored as Unix Epoch (1970 Date Display Bug)',
    subsystem: 'receiver',
    subsystemName: 'Receiver HTTP Upload & Cloud Ingestion',
    severity: 'high',
    file: 'receiver/http_upload.cpp & backend/netlify/functions/upload.mts',
    lineRange: 'http_upload.cpp:45, upload.mts:91 & 147',
    problemSummary: 'The receiver writes `doc["timestamp"] = millis();`, which is only the milliseconds elapsed since the ESP32 receiver was powered on (e.g. 45000 for 45 seconds). The cloud backend does `timestamp: parseInt(timestamp) || Date.now()`. Because 45000 is truthy and not zero, it is accepted as a valid millisecond epoch timestamp, corresponding to January 1, 1970, 00:00:45 UTC.',
    technicalImpact: 'All stored incidents and telemetry records display corrupt dates like "56 years ago" or "1/1/1970", breaking time sorting, incident ordering, and dispatch triage logs.',
    realWorldScenario: 'An accident occurs at 2:30 PM. The dispatcher looks at the incident list sorted by newest timestamp. The newly generated alert sorts to the bottom of the database list as being from 1970, delaying critical emergency response.',
    problemCode: `// In receiver/http_upload.cpp:
doc["timestamp"] = millis(); // BUG: Relative uptime, not UTC epoch!

// In backend/netlify/functions/upload.mts:
// BUG: parseInt(45000) is truthy! Fails back to 1970 instead of Date.now()
timestamp: parseInt(timestamp) || Date.now(),`,
    solutionCode: `// Backend Fix (upload.mts):
// Validate if timestamp is a plausible millisecond Unix epoch (post-2024: > 1,700,000,000,000)
const rawTs = parseInt(timestamp);
const validEpochTimestamp = (rawTs && rawTs > 1700000000000) 
  ? rawTs 
  : Date.now();

// Firmware Fix (receiver with NTP or GPS time sync):
// In receiver.ino, sync time via NTP (configTime) when WiFi connects,
// or forward GPS epoch time extracted from the ATGM336H NMEA sentence ($GPRMC).`,
    tags: ['Date Bug', 'Timestamp', 'Dispatch Log', 'Data Integrity']
  },
  {
    id: 'FIND-05',
    title: 'Direct Impact Detection Lacks Post-Impact Stillness Check (Desk-Drop False Alarm)',
    subsystem: 'firmware',
    subsystemName: 'Accident Detection Pipeline',
    severity: 'high',
    file: 'wearable/detection.cpp',
    lineRange: 'Lines 200–218',
    problemSummary: 'Direct impact detection triggers immediately whenever `data.aMag > DIRECT_IMPACT_G (4.50g)` without requiring any stillness verification or orientation change. While true high-speed vehicle impacts have high g-forces, so do routine everyday movements like jumping down stairs, dropping the wearable onto a hard wooden table, or vigorous sports.',
    technicalImpact: 'Extreme rate of false alarms whenever the rider claps their hands, drops their gear, or encounters harsh road chatter without falling.',
    realWorldScenario: 'A rider takes off their jacket or helmet with the wearable attached and drops it 20 cm onto a wooden table. The impact spike easily reaches 5.5g for 5 milliseconds. An emergency crash alert is dispatched to barangay health stations immediately.',
    problemCode: `// 3. DIRECT IMPACT — FSM idle AND no active skid
if (_fallState == FS_IDLE && !_skidActive) {
  if (data.aMag > DIRECT_IMPACT_G) {
    if (now - _lastDirectImpactMs > DIRECT_IMPACT_DEBOUNCE_MS) {
      _lastDirectImpactMs = now;
      _alertActive = true;
      _alertEventType = EVT_DIRECT_IMPACT;
      _alertPeakG = data.aMag;
      result.triggered = true;
      result.eventType = EVT_DIRECT_IMPACT;
      return result; // Fires immediately with zero post-impact validation!
    }
  }
}`,
    solutionCode: `// Solution: Require direct impact to transition to a short stillness verification window
// (e.g. 1.0 - 1.5 seconds) OR sustained disorientation before confirming.
if (_fallState == FS_IDLE && !_skidActive) {
  if (data.aMag > DIRECT_IMPACT_G) {
    if (now - _lastDirectImpactMs > DIRECT_IMPACT_DEBOUNCE_MS) {
      // Rather than firing instantly, enter a DIRECT_IMPACT_STILLNESS check:
      _fallState = FS_STILLNESS;
      _stillnessStart = now;
      _stillIdx = 0;
      _stillCount = 0;
      _peakImpactG = data.aMag;
      _pendingDirectImpact = true;
      Serial.printf("[DETECT] High-g spike (%.2fg) — verifying post-impact immobility...\\n", data.aMag);
    }
  }
}`,
    tags: ['False Positives', 'Direct Impact', 'Triage Accuracy']
  },
  {
    id: 'FIND-06',
    title: 'Flash Memory Wear & O(N) Degradation in LittleFS Local Queue Renaming',
    subsystem: 'receiver',
    subsystemName: 'Receiver Offline Flash Queue',
    severity: 'medium',
    file: 'receiver/local_queue.cpp',
    lineRange: 'Lines 45–60',
    problemSummary: 'When localQueueAdd() detects a full queue (10 items), it deletes slot 0, then calls LittleFS.rename() in a loop for every remaining file from 1 to 9. On NOR flash memory, LittleFS renames require creating new directory entry metadata and re-copying inode blocks, causing high write amplification and potential file system corruption if power drops during rename.',
    technicalImpact: 'Excessive flash sector wear leading to premature ESP32 flash chip failure in field installations with frequent Wi-Fi outages.',
    realWorldScenario: 'A receiver deployed in a rural health center experiences an 8-hour Wi-Fi dropout. Hundreds of incoming telemetry packets trigger constant flash file renaming, degrading the SPI flash blocks over several months.',
    problemCode: `if (slot < 0) {
  // Queue full — drop oldest (slot 0) and shift
  Serial.println(F("[QUEUE] Queue full! Dropping oldest..."));
  LittleFS.remove(_filePath(0));
  for (uint8_t i = 1; i < MAX_QUEUED; i++) {
    if (LittleFS.exists(_filePath(i))) {
      // BUG: Cascading file renames across physical SPI flash blocks!
      LittleFS.rename(_filePath(i), _filePath(i - 1));
    }
  }
  slot = _queueCount - 1;
}`,
    solutionCode: `// Solution: Circular ring buffer using monotonically increasing head/tail indices.
// Files are named /queue/q_<id>.json. Only 1 file deleted, 1 file written. No renames.
static uint32_t _queueHead = 0; // oldest
static uint32_t _queueTail = 0; // newest

bool localQueueAddCircular(...) {
  if ((_queueTail - _queueHead) >= MAX_QUEUED) {
    // Drop oldest directly by head index
    LittleFS.remove(_circularPath(_queueHead));
    _queueHead++;
  }
  File f = LittleFS.open(_circularPath(_queueTail), "w");
  if (!f) return false;
  serializeJson(doc, f);
  f.close();
  _queueTail++;
  _saveQueueIndicesNVS(_queueHead, _queueTail);
  return true;
}`,
    tags: ['Flash Wear', 'LittleFS', 'Embedded Storage', 'Reliability']
  },
  {
    id: 'FIND-07',
    title: 'Race Condition in Netlify Blobs Index Updating (_index Clobbering)',
    subsystem: 'backend',
    subsystemName: 'Cloud Backend Store',
    severity: 'high',
    file: 'backend/netlify/functions/store.ts',
    lineRange: 'Lines 45–65',
    problemSummary: 'In store.ts, updateEventIndex() executes a non-atomic read-modify-write on the "_index" JSON blob. In a distributed serverless runtime (Netlify Functions / AWS Lambda), two concurrent upload calls invoke getEventIndex(), modify their local array, and save back with store.setJSON("_index", ...). The second write overwrites the first, dropping the first event from the dashboard index.',
    technicalImpact: 'Randomly missing events from the incident list during multi-rider or concurrent event spikes.',
    realWorldScenario: 'During a group ride or road collision involving two motorcycles simultaneously, both devices transmit alerts to the receiver. The receiver uploads both concurrently; the second serverless function overwrites the index blob, hiding the other rider from the dashboard index.',
    problemCode: `export async function updateEventIndex(eventIds: string | string[]) {
  const idsToAdd = Array.isArray(eventIds) ? eventIds : [eventIds];
  // Race condition: concurrent invocations fetch the same stale index
  let index = await getEventIndex();
  for (const id of idsToAdd) {
    index = [id, ...index.filter((existing) => existing !== id)];
  }
  index = index.slice(0, 200);
  memoryIndex = index;
  try {
    const store = getStore("events");
    // Overwrites concurrent writes!
    await store.setJSON("_index", index);
  } catch {}
}`,
    solutionCode: `// Solution: In store.ts, take advantage of Netlify Blobs auto-discovery
// or prefix-based listing (store.list({ prefix: 'evt_' })) rather than relying
// on a single shared index file, or use optimistic locking with conditional etags.
export async function getEventIndex(): Promise<string[]> {
  const store = getStore("events");
  const { blobs } = await store.list({ prefix: "evt_" });
  // Sort by blob modification date or extract timestamp from ID
  return blobs
    .map(b => b.key)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 200);
}`,
    tags: ['Serverless', 'Race Condition', 'Data Loss', 'Netlify Blobs']
  },
  {
    id: 'FIND-08',
    title: 'Missing Input Sanitization & GPS Coordinate Bounds Validation',
    subsystem: 'backend',
    subsystemName: 'API Ingestion Security',
    severity: 'medium',
    file: 'backend/netlify/functions/upload.mts',
    lineRange: 'Lines 50–70',
    problemSummary: 'The upload endpoint parses `lat` and `lon` using `parseFloat()` without verifying that coordinates lie within physical terrestrial boundaries (`-90.0 <= lat <= 90.0` and `-180.0 <= lon <= 180.0`). Additionally, `deviceToken` and user `name` are saved without length or character whitelist validation, allowing stored XSS or map rendering crashes if malicious or malformed packets arrive.',
    technicalImpact: 'Frontend Leaflet map crashes when attempting to render `NaN`, `Infinity`, or out-of-bounds coordinates, white-screening the dispatch dashboard.',
    realWorldScenario: 'An uncalibrated GPS receiver outputs corrupted NMEA data with 9999.99 coordinates. The cloud stores it, and when the dispatcher loads the dashboard, Leaflet throws an unhandled projection exception, rendering the map blank.',
    problemCode: `const {
  deviceToken,
  packetType,
  lat,
  lon,
  eventType,
  ...
} = body;

// BUG: No range checks or NaN/Infinity guards!
const eventData = {
  id: eventId,
  deviceToken,
  type: packetType,
  lat: parseFloat(lat),
  lon: parseFloat(lon),
  ...
};`,
    solutionCode: `// Solution: Enforce strict schema validation on all incoming fields
const parsedLat = Number(lat);
const parsedLon = Number(lon);

if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90 ||
    isNaN(parsedLon) || parsedLon < -180 || parsedLon > 180) {
  return new Response(JSON.stringify({ error: "Invalid GPS coordinates" }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });
}

// Sanitize token: 4-16 alphanumeric characters only
const sanitizedToken = String(deviceToken || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 16);
if (!sanitizedToken) {
  return new Response(JSON.stringify({ error: "Invalid device token" }), { status: 400 });
}`,
    tags: ['Security', 'Input Validation', 'Leaflet Map Crash', 'API Hardening']
  },
  {
    id: 'FIND-09',
    title: 'MPU-6050 Accelerometer Range Saturation at ±2g Default',
    subsystem: 'hardware',
    subsystemName: 'Sensor Hardware & Calibration',
    severity: 'high',
    file: 'wearable/sensors.cpp & wearable/config.h',
    lineRange: 'sensors.cpp:25–40, config.h:45–50',
    problemSummary: 'The MPU-6050 power-on reset full-scale range is ±2g (16,384 LSB/g). The detection algorithm defines `IMPACT_THRESHOLD_G = 3.00g` and `DIRECT_IMPACT_G = 4.50g`. If sensorsInit() does not explicitly configure the `ACCEL_CONFIG` register (0x1C) to ±8g (4,096 LSB/g) or ±16g (2,048 LSB/g), the accelerometer reading clips at 2.0g. Under this condition, an impact of 10g will only read as 2.0g, making it mathematically impossible to trigger an impact or direct impact alert!',
    technicalImpact: 'Total detection failure in the field: the device will never detect impacts above 2g.',
    realWorldScenario: 'A rider crashes at 40 km/h. The impact is 7g, but the sensor registers only 1.99g because the hardware register was left at the default ±2g setting. The FSM never transitions from FS_WAIT_IMPACT to FS_STILLNESS, and resets without an alert.',
    problemCode: `// In wearable/sensors.cpp:
// If initialized using standard Wire without explicitly setting ACCEL_CONFIG register:
Wire.beginTransmission(MPU_ADDR);
Wire.write(0x6B); // PWR_MGMT_1
Wire.write(0);    // Wake up
Wire.endTransmission(true);
// BUG: ACCEL_CONFIG (0x1C) is left at default 0x00 (±2g range)!`,
    solutionCode: `// Fix: Explicitly configure MPU-6050 to ±8g or ±16g range in sensorsInit():
Wire.beginTransmission(MPU_ADDR);
Wire.write(0x1C); // ACCEL_CONFIG register
Wire.write(0x10); // 0x10 = ±8g range (4096 LSB/g), or 0x18 = ±16g (2048 LSB/g)
Wire.endTransmission(true);

// And ensure raw integer conversion matches the scale divisor:
// For ±8g: float ax = (float)raw_ax / 4096.0f;
// For ±16g: float ax = (float)raw_ax / 2048.0f;`,
    tags: ['Hardware Bug', 'MPU-6050', 'Saturation', 'Firmware Driver']
  },
  {
    id: 'FIND-10',
    title: 'O(N) Repeated Standard Deviation Computation Every 10ms',
    subsystem: 'firmware',
    subsystemName: 'Firmware Efficiency & FSM Engine',
    severity: 'optimization',
    file: 'wearable/detection.cpp',
    lineRange: 'Lines 75–95 & 165–175',
    problemSummary: 'In FS_STILLNESS, detectionUpdate() computes the standard deviation of a 200-sample buffer every single cycle at 100Hz (every 10ms). _computeStdDev() runs two separate loops over all 200 floats (sum and variance), resulting in 400 floating-point operations + sqrtf() 100 times per second. This causes CPU throttling and increases battery consumption.',
    technicalImpact: 'Higher battery drain on the wearable unit and potential timing jitter for the 9600-baud GPS UART interrupt queue.',
    realWorldScenario: 'During the 2-second stillness phase, the ESP32 draws peak current, degrading operating battery life from a portable 500mAh LiPo cell.',
    problemCode: `// Runs every 10ms in detectionUpdate():
float sigma = _computeStdDev(_stillBuf, _stillCount);

static float _computeStdDev(const float* buf, uint16_t count) {
  if (count < 2) return 0.0f;
  float sum = 0;
  for (uint16_t i = 0; i < count; i++) sum += buf[i];
  float mean = sum / count;
  float variance = 0;
  for (uint16_t i = 0; i < count; i++) {
    float diff = buf[i] - mean;
    variance += diff * diff;
  }
  return sqrtf(variance / count);
}`,
    solutionCode: `// Solution: Maintain running sum and running sum of squares in O(1) time.
// As a sample is overwritten in the ring buffer:
static float _runningSum = 0.0f;
static float _runningSqSum = 0.0f;

void pushSample(float newSample) {
  float oldSample = _stillBuf[_stillIdx];
  _runningSum += newSample - oldSample;
  _runningSqSum += (newSample * newSample) - (oldSample * oldSample);
  _stillBuf[_stillIdx] = newSample;
  _stillIdx = (_stillIdx + 1) % STILLNESS_BUFFER_SIZE;
}

// O(1) variance calculation: Var = E[X^2] - (E[X])^2
float getStdDev(uint16_t count) {
  if (count < 2) return 0.0f;
  float mean = _runningSum / count;
  float variance = (_runningSqSum / count) - (mean * mean);
  return variance > 0.0f ? sqrtf(variance) : 0.0f;
}`,
    tags: ['Performance', 'Battery Optimization', 'O(1) Math', 'Welford Algorithm']
  }
];

export const DEMO_SCENARIOS: FSMScenario[] = [
  {
    id: 'scen-real-fall',
    name: 'Realistic Motorcycle Fall & Impact',
    description: 'Rider is thrown off bike: 120ms freefall (0.15g) -> 4.8g ground impact -> 2.5s post-impact immobility (low σ).',
    durationMs: 4000,
    expectedResult: 'CONFIRMED',
    samples: [
      { timeMs: 0, aMag: 1.02, ay: 0.1, gx: 5.0, roll: 2.0, pitch: 1.0 },
      { timeMs: 200, aMag: 0.98, ay: 0.05, gx: 3.0, roll: 2.0, pitch: 1.0 },
      { timeMs: 400, aMag: 0.18, ay: 0.02, gx: 45.0, roll: 12.0, pitch: 15.0 }, // Freefall start
      { timeMs: 450, aMag: 0.12, ay: 0.01, gx: 55.0, roll: 25.0, pitch: 20.0 },
      { timeMs: 500, aMag: 0.22, ay: 0.03, gx: 60.0, roll: 40.0, pitch: 35.0 }, // Freefall sustained >100ms
      { timeMs: 540, aMag: 4.85, ay: 1.8, gx: 280.0, roll: 85.0, pitch: 60.0 }, // Impact!
      { timeMs: 600, aMag: 2.10, ay: 0.9, gx: 90.0, roll: 88.0, pitch: 65.0 },
      { timeMs: 700, aMag: 1.05, ay: 0.04, gx: 2.0, roll: 89.0, pitch: 67.0 }, // Stillness begins
      { timeMs: 1200, aMag: 1.01, ay: 0.02, gx: 1.0, roll: 89.2, pitch: 67.1 },
      { timeMs: 1800, aMag: 1.00, ay: 0.01, gx: 0.5, roll: 89.1, pitch: 67.0 },
      { timeMs: 2400, aMag: 1.02, ay: 0.03, gx: 0.8, roll: 89.0, pitch: 67.2 },
      { timeMs: 2800, aMag: 1.01, ay: 0.02, gx: 0.6, roll: 89.1, pitch: 67.1 }  // Confirmed!
    ]
  },
  {
    id: 'scen-pothole',
    name: 'Pothole / Road Speed Bump (No Fall)',
    description: 'Vehicle hits a violent pothole: 2.9g vertical bump without preceding freefall, followed by immediate riding motion.',
    durationMs: 3000,
    expectedResult: 'NO_ALERT',
    samples: [
      { timeMs: 0, aMag: 1.05, ay: 0.05, gx: 8.0, roll: 0.0, pitch: 1.0 },
      { timeMs: 300, aMag: 1.15, ay: 0.12, gx: 14.0, roll: 1.0, pitch: 2.0 },
      { timeMs: 400, aMag: 2.95, ay: 0.45, gx: 45.0, roll: -4.0, pitch: 8.0 }, // Pothole shock
      { timeMs: 450, aMag: 1.85, ay: 0.30, gx: 28.0, roll: 3.0, pitch: -5.0 },
      { timeMs: 600, aMag: 1.25, ay: 0.15, gx: 15.0, roll: 0.5, pitch: 1.2 }, // Continued riding
      { timeMs: 1200, aMag: 1.10, ay: 0.08, gx: 12.0, roll: 1.0, pitch: 1.0 },
      { timeMs: 2000, aMag: 1.08, ay: 0.10, gx: 9.0, roll: -0.5, pitch: 0.8 }
    ]
  },
  {
    id: 'scen-skid',
    name: 'Motorcycle Lateral Skid / Slide',
    description: 'Bike loses rear tire traction: lateral acceleration 2.4g and roll rate 380°/s sustained for > 200ms.',
    durationMs: 3000,
    expectedResult: 'SKID',
    samples: [
      { timeMs: 0, aMag: 1.01, ay: 0.1, gx: 10.0, roll: 5.0, pitch: 0.0 },
      { timeMs: 300, aMag: 1.45, ay: 1.2, gx: 120.0, roll: 25.0, pitch: 2.0 },
      { timeMs: 500, aMag: 2.65, ay: 2.45, gx: 385.0, roll: 65.0, pitch: 4.0 }, // Skid start
      { timeMs: 600, aMag: 2.50, ay: 2.30, gx: 360.0, roll: 75.0, pitch: 5.0 },
      { timeMs: 720, aMag: 2.40, ay: 2.20, gx: 345.0, roll: 80.0, pitch: 6.0 }, // Skid sustained >200ms!
      { timeMs: 900, aMag: 1.80, ay: 1.10, gx: 80.0, roll: 85.0, pitch: 6.0 }
    ]
  },
  {
    id: 'scen-desk-drop',
    name: 'Device Dropped on Table / Clapping',
    description: 'Wearable dropped 15cm onto wooden surface: single sharp 4.9g micro-spike without incapacitation. Tests false positive resistance.',
    durationMs: 3000,
    expectedResult: 'DIRECT_IMPACT',
    samples: [
      { timeMs: 0, aMag: 1.00, ay: 0.02, gx: 1.0, roll: 0.0, pitch: 0.0 },
      { timeMs: 300, aMag: 0.95, ay: 0.05, gx: 4.0, roll: 0.0, pitch: 0.0 },
      { timeMs: 500, aMag: 4.90, ay: 0.80, gx: 25.0, roll: 1.0, pitch: 0.5 }, // 4.9g micro spike
      { timeMs: 520, aMag: 1.10, ay: 0.10, gx: 15.0, roll: 1.0, pitch: 0.5 },
      { timeMs: 800, aMag: 1.00, ay: 0.01, gx: 0.5, roll: 1.0, pitch: 0.5 },
      { timeMs: 1500, aMag: 1.00, ay: 0.01, gx: 0.5, roll: 1.0, pitch: 0.5 }
    ]
  }
];
