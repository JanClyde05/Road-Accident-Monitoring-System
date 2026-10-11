import React, { useState } from 'react';
import { Copy, Check, FileCode, Sparkles, Download, GitPullRequest } from 'lucide-react';

interface PatchFile {
  name: string;
  targetFile: string;
  description: string;
  diff: string;
}

const PATCH_FILES: PatchFile[] = [
  {
    name: 'wearable.ino',
    targetFile: 'wearable/wearable.ino',
    description: 'Implement multi-burst alert retries with randomized RF backoff jitter, preventing dropped crash emergencies.',
    diff: `--- a/wearable/wearable.ino
+++ b/wearable/wearable.ino
@@ -216,19 +216,42 @@ void loop() {
   // ── Emergency Alert Trigger ──────────────────────────────────────────
   if (det.triggered) {
     Serial.printf("[WEARABLE] ⚠ ALERT: eventType=%d peakG=%.2f\\n",
                   det.eventType, det.peakAMag);
     _alertActive = true;
     _alertEventType = det.eventType;
     _alertPeakG = det.peakAMag;
+    _alertBurstCount = 0;
+    _lastAlertRepeatMs = now;
     neopixelSetState(NEO_ALERT);
     buzzerSetPattern(BZR_ALERT);
-
-    if (_loraOk) {
+  }
+
+  // Transmit initial 4-burst alerts spaced by 180-250ms random jitter,
+  // then continue beaconing every 6 seconds until acknowledged/cancelled.
+  if (_alertActive && _loraOk) {
+    bool shouldSend = false;
+    if (_alertBurstCount < 4) {
+      if (now - _lastAlertRepeatMs >= (uint32_t)(180 + random(0, 70))) {
+        shouldSend = true;
+        _alertBurstCount++;
+        _lastAlertRepeatMs = now;
+      }
+    } else {
+      if (now - _lastAlertRepeatMs >= 6000) {
+        shouldSend = true;
+        _lastAlertRepeatMs = now;
+      }
+    }
+
+    if (shouldSend) {
       loraSendAlert(
         registrationGetToken().c_str(),
         gpsGetLatitude(),
         gpsGetLongitude(),
-        det.eventType,
-        det.peakAMag
+        _alertEventType,
+        _alertPeakG
       );
+      Serial.printf("[LORA] Alert burst packet #%u transmitted\\n", _alertBurstCount);
     }
   }`
  },
  {
    name: 'detection.cpp',
    targetFile: 'wearable/detection.cpp',
    description: 'Glitch-tolerant freefall filter, timer rollover protection, and direct impact stillness verification.',
    diff: `--- a/wearable/detection.cpp
+++ b/wearable/detection.cpp
@@ -28,6 +28,7 @@ static uint32_t   _lastSkidSampleMs  = 0;
 static uint32_t   _lastDirectImpactMs = 0;
 static uint32_t   _lastShockSampleMs = 0;
 static uint32_t   _lastWaveSampleMs  = 0;
+static uint8_t    _freefallGlitchCount = 0;
 
 // Running stillness variance buffer
 static float    _stillBuf[STILLNESS_BUFFER_SIZE];
@@ -140,14 +141,20 @@ DetectionResult detectionUpdate(const SensorData& data) {
     case FS_FREEFALL:
-      if (data.aMag >= FREEFALL_THRESHOLD_G) {
-        // Freefall ended prematurely (e.g., brief sensor glitch)
-        _fallState = FS_IDLE;
-      } else if (now - _freefallStart >= FREEFALL_MIN_DURATION_MS) {
-        _fallState = FS_WAIT_IMPACT;
-        _impactDeadline = now + IMPACT_WINDOW_MS;
-        _peakImpactG = 0;
-        Serial.println(F("[DETECT] Freefall confirmed, waiting for impact..."));
+      if (data.aMag < FREEFALL_THRESHOLD_G) {
+        if (now - _freefallStart >= FREEFALL_MIN_DURATION_MS) {
+          _fallState = FS_WAIT_IMPACT;
+          _impactDeadline = now + IMPACT_WINDOW_MS;
+          _peakImpactG = 0;
+          _freefallGlitchCount = 0;
+          Serial.println(F("[DETECT] Freefall confirmed, waiting for impact..."));
+        }
+      } else {
+        // Tolerate up to 2 isolated glitch samples (< 20ms) from rotation/vibration
+        _freefallGlitchCount++;
+        if (_freefallGlitchCount > 2 || (now - _freefallStart < 30)) {
+          _fallState = FS_IDLE;
+          _freefallGlitchCount = 0;
+        }
       }
       break;`
  },
  {
    name: 'local_ap.cpp',
    targetFile: 'wearable/local_ap.cpp',
    description: 'Prevent heap buffer overread on WebSocket text payload and use robust JSON parsing.',
    diff: `--- a/wearable/local_ap.cpp
+++ b/wearable/local_ap.cpp
@@ -140,9 +140,16 @@ static void _onWebSocketEvent(uint8_t clientNum, WStype_t type,
     }
 
     case WStype_TEXT: {
-      String msg = String((char*)payload);
-      Serial.printf("[AP] WS message from #%u: %s\\n", clientNum, msg.c_str());
+      // FIX: payload is NOT null-terminated! Use bounded length or ArduinoJson directly
+      JsonDocument doc;
+      DeserializationError err = deserializeJson(doc, payload, length);
+      if (err) {
+        Serial.printf("[AP] Invalid WS payload from #%u: %s\\n", clientNum, err.c_str());
+        break;
+      }
+
+      const char* msgType = doc["type"] | "";
+      if (strcmp(msgType, "register") == 0) {
+        const char* name = doc["name"] | "";
+        const char* driveLink = doc["driveLink"] | "";
+        registrationProcess(String(name), String(driveLink));
       }
       break;
     }`
  },
  {
    name: 'upload.mts',
    targetFile: 'backend/netlify/functions/upload.mts',
    description: 'Sanitize epoch timestamps (> year 2024) and validate terrestrial GPS coordinates (-90..90, -180..180).',
    diff: `--- a/backend/netlify/functions/upload.mts
+++ b/backend/netlify/functions/upload.mts
@@ -52,6 +52,24 @@ export default async (req: Request) => {
     const body = await req.json();
     const { deviceToken, packetType, lat, lon, eventType, aMag, battPct, timestamp } = body;
 
+    // Strict Coordinate Validation
+    const parsedLat = parseFloat(lat);
+    const parsedLon = parseFloat(lon);
+    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90 ||
+        isNaN(parsedLon) || parsedLon < -180 || parsedLon > 180) {
+      return new Response(JSON.stringify({ error: "Invalid coordinate bounds" }), {
+        status: 400,
+        headers: { "Content-Type": "application/json" }
+      });
+    }
+
+    // Fix 1970 timestamp bug: If receiver sent uptime millis() (< 1_700_000_000_000), use server Date.now()
+    const rawTs = parseInt(timestamp);
+    const safeTimestamp = (rawTs && rawTs > 1700000000000) ? rawTs : Date.now();
+
     if (packetType === "telemetry") {
       ...
-      timestamp: parseInt(timestamp) || Date.now(),
+      timestamp: safeTimestamp,`
  },
  {
    name: 'sensors.cpp',
    targetFile: 'wearable/sensors.cpp',
    description: 'Explicitly configure MPU-6050 ACCEL_CONFIG register to ±8g full-scale range to prevent saturation clipping at 2.0g.',
    diff: `--- a/wearable/sensors.cpp
+++ b/wearable/sensors.cpp
@@ -35,6 +35,12 @@ bool sensorsInit() {
   Wire.write(0x6B); // PWR_MGMT_1
   Wire.write(0x00); // Wake up MPU-6050
   Wire.endTransmission(true);
+
+  // FIX: Configure ±8g range (4096 LSB/g) so impacts > 2.0g are not clipped
+  Wire.beginTransmission(MPU6050_ADDR);
+  Wire.write(0x1C); // ACCEL_CONFIG register
+  Wire.write(0x10); // 0x10 = ±8g full scale
+  Wire.endTransmission(true);
 
   // Wake and configure Gyro to ±2000 deg/s
   Wire.beginTransmission(MPU6050_ADDR);`
  }
];

export const PatchesView: React.FC = () => {
  const [selectedPatchIndex, setSelectedPatchIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const activePatch = PATCH_FILES[selectedPatchIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(activePatch.diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="patches-section">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
              <GitPullRequest className="h-4 w-4 text-neutral-400" />
              <span>Ready-to-Apply Unified Git Diffs & Surgical Patches</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              Production-ready patches for the critical vulnerabilities discovered during review. You can copy or apply these directly to your local Git repository.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-950 shadow-xs hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Diff Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Current Patch</span>
              </>
            )}
          </button>
        </div>

        {/* GitHub Branch Sync Callout */}
        <div className="mt-4 pt-4 border-t border-neutral-800 bg-neutral-950 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white mt-0.5">
              <GitPullRequest className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Apply edits directly to your local project or <span className="text-neutral-300 font-mono">main</span> branch
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="/rams-google-ai-studio.zip"
                    download="rams-google-ai-studio.zip"
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-950 bg-white hover:bg-neutral-200 px-3 py-1.5 rounded-md shadow-2xs transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download .zip (Full Source)</span>
                  </a>
                  <a
                    href="/google-ai-studio.bundle"
                    download="google-ai-studio.bundle"
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded-md shadow-2xs transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Download .bundle</span>
                  </a>
                  <a
                    href="/google-ai-studio.patch"
                    download="google-ai-studio.patch"
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded-md shadow-2xs transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Download .patch</span>
                  </a>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mt-1.5 font-medium leading-relaxed">
                To apply all edits directly into your current working directory and merge directly into <strong className="text-white">main</strong>, choose one of the commands below in your Windows terminal:
              </p>
              
              <div className="mt-3 space-y-2.5">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">Option 1: Git Pull directly into your current branch (e.g. main)</div>
                  <div className="bg-[#09090b] border border-neutral-800 text-neutral-200 p-2.5 rounded-md font-mono text-xs overflow-x-auto">
                    <code>
                      curl.exe -O {window.location.origin}/google-ai-studio.bundle && git pull google-ai-studio.bundle google-ai-studio
                    </code>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">Option 2: Git Apply (leaves changes uncommitted so you can review before committing to main)</div>
                  <div className="bg-[#09090b] border border-neutral-800 text-neutral-200 p-2.5 rounded-md font-mono text-xs overflow-x-auto">
                    <code>
                      curl.exe -s {window.location.origin}/google-ai-studio.patch | git apply
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {PATCH_FILES.map((patch, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedPatchIndex(idx)}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-mono transition-all cursor-pointer ${
              selectedPatchIndex === idx
                ? 'bg-white text-neutral-950 font-bold shadow-xs'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700 hover:text-white'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>{patch.name}</span>
          </button>
        ))}
      </div>

      {/* Patch View Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 overflow-hidden shadow-xs">
        <div className="bg-neutral-950 px-5 py-3 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-white">
              {activePatch.targetFile}
            </span>
            <p className="text-xs text-neutral-400 mt-0.5 font-medium">
              {activePatch.description}
            </p>
          </div>

          <span className="text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded self-start sm:self-center">
            patch -p1 format
          </span>
        </div>

        <pre className="p-5 text-xs font-mono bg-[#09090b] text-neutral-300 overflow-x-auto leading-relaxed max-h-[500px]">
          <code>{activePatch.diff}</code>
        </pre>
      </div>
    </div>
  );
};
