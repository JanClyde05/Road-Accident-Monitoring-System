# RAMS Execution Plan

**Purpose.** This is the ordered, executable instruction set for the RAMS fixes
discussed in the 2026-11-18 planning session. Any agent (OpenCode, Codex,
Antigravity, or a human) can pick this file up and continue without reading the
transcript.

**Authority.** `AGENTS.md` wins over this file. `INCIDENT_LEDGER.md` wins over
any assumption here about what is already known. If this file and the code
disagree, the code is correct and this file needs an edit.

**Baseline.** Commit `33543d4`. Gate: 14 FAIL / 11 WARN / 2 PASS.

---

## 1. Read order

Read these first, in this order, before touching anything:

| # | File | Why |
|---|---|---|
| 1 | `AGENTS.md` | Name authority, ponytail ladder, verification gate |
| 2 | `docs/agent/INCIDENT_LEDGER.md` | Every defect is already numbered |
| 3 | `docs/agent/LESSONS.md` | Do not repeat L-01 through L-16 |
| 4 | `.agents/rules/00-rams-invariants.md` | Machine-checked constraints |
| 5 | This file | Order of work |
| 6 | The stage-specific plan | Detail for that stage |

Stage plans: `CONNECTIVITY_FIX_PLAN.md`, `BLE_STABILITY_PLAN.md`,
`ROOT_REORG_PLAN.md`, `AI_TOOLING_MATRIX.md`, `HARDWARE_REVISION_PLAN.md`.

---

## 2. Status board

Update this table whenever a stage changes state. It is the single source of
truth for "where are we".

| Stage | Work | State | Gate |
|---|---|---|---|
| A | Rename hygiene | **DONE** 2026-11-18 | `check_invariants.py --filter DOC` |
| B | Android responsiveness | **DONE** 2026-11-19 | `compileDebugKotlin` PASS; PERF-01..03 blocked on device |
| C1 | Station ping ingest, store, distance, latency | **DONE** 2026-11-19 | RNG-002, RNG-003 PASS; RNG-07 blocked on device |
| C2 | Station panel, station config, `--ping` window | **DONE** 2026-11-19 | desktop build PASS |
| C3 | Receiver JSON parity | **DONE** 2026-11-19 | receiver build PASS (1,315,395 B / 3,145,728) |
| C4 | Phone ACK, ping log, popup, settings text | **DONE** 2026-11-19 | `compileDebugKotlin` PASS |
| C5 | Wi-Fi ping upload (optional) | DEFERRED | `huge_app` partition |
| C6 | Field sweep | BLOCKED on hardware | sweep table filled |
| D | Receiver backend discovery | **DONE** 2026-11-19 | FW-001..FW-009 PASS; receiver build PASS |
| E | BLE stability | **DONE** 2026-11-19 | AND-001..AND-008 PASS; wearable 672,071 B; Android PASS |
| F | Root reorg + doc fixes | **DONE** 2026-11-19 | DOC-001, DOC-003, REPO-002 PASS; DOC-005 PASS |
| G | Wearable battery sense + Rev L1 single-sided board | BLOCKED on measurements M1-M2 | `HW-01..HW-12` in `HARDWARE_REVISION_PLAN.md` |

Stage G is hardware. It does not gate stages B through F and is not gated by
them. The prototype rework (G3) is the only part that can finish before the
competition.

State values: `DONE`, `IN PROGRESS`, `NOT STARTED`, `DEFERRED`, `BLOCKED`.

---

## 3. Preflight rules

Non-negotiable. Violating one of these invalidates the work even if the tests
pass.

1. **Zero emoji** in code, docs, UI strings, commit messages. `DESIGN_RULES.md`.
2. **Retired names.** `Danger Monitoring System`, `Danger Monitoring System V2`,
   `DMS V2` must not appear in new content. Leave them inside `hardware/`,
   `archive/`, and historical logs; those are records.
3. **Safety invariants.** Do not change LoRa timings, BLE GATT ordering, sensor
   sampling rate, or crash thresholds to make a test easier.
4. **Re-verify anchors.** Every `file:line` in this document was correct at
   `33543d4`. Confirm with `git grep -n` before editing; line numbers drift.
5. **One stage per commit.** Do not bundle B with C. The gate must show which
   stage moved.
6. **PowerShell 5.1 BOM.** `Set-Content -Encoding UTF8` writes a BOM and breaks
   commit subjects (L-13). Use
   `[System.IO.File]::WriteAllText($p, $text, New-Object System.Text.UTF8Encoding($false))`.
7. **arduino-cli.** `--build-path <temp>` hangs on this machine. Use the default
   sketch build directory.
8. **C# language level.** The desktop compiles with
   `C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe`, which is **C# 5**.
   No `?.`, no `$"..."`, no `nameof`, no expression-bodied members. The existing
   `Program.cs` has zero of these; keep it that way.
9. **Do not weaken a check.** If a check cannot pass, record an accepted risk in
   `INCIDENT_LEDGER.md`.

---

## 4. Stage A - Rename hygiene (verify only)

Already applied in the working tree. Confirm, do not redo.

```powershell
git grep -n -I "Danger Monitoring System V2" -- DIRECTORY_MAP.md 00_SYSTEM_ARCHITECTURE.md AGENTS.md docs/agent apps/new_ai_applications/README.md apps/planned_rework/README.md
```

Expected: only `AGENTS.md` line 9, the intentional "retired names" declaration.

Also confirmed already correct:
- `AGENTS.md` Section 3 anchor URLs point at `Road Accident Monitoring System`.
- `SettingsScreen.kt:1906` renders `"Road Accident Monitoring System"`.
- `docs/agent/VERIFICATION_LOG.md:6` root line.

Do not regenerate `VERIFICATION_LOG.md` by hand. It is produced by
`scripts/verify/check_invariants.py --md docs/agent/VERIFICATION_LOG.md`.

---

## 5. Stage B - Android responsiveness

### B.0 Capture the baseline first

Without this number the fix cannot be claimed.

```powershell
adb shell dumpsys gfxinfo com.aistudio.rams.wkqmzb reset
# rotate the phone and drive the map screen for 60 s
adb shell dumpsys gfxinfo com.aistudio.rams.wkqmzb framestats > docs/agent/performance-baseline.txt
```

Record p50 / p90 / p99 frame time and janky-frame percentage at the top of
`docs/agent/PERFORMANCE_PLAN.md` (create that file in this stage).

### B.1 Verified cause

`yawDegrees` is published at the sensor rate and pushed across the WebView JS
bridge on every tick.

| Evidence | Line |
|---|---|
| 6 sensors registered at `SENSOR_DELAY_GAME` (~20 ms, 50 Hz) | `PhoneSensorEngine.kt:181-197` |
| `imuState` combines the sensor flow with `SharingStarted.Eagerly` | `RamsViewModel.kt:168-174` |
| `LaunchedEffect(heading, imu.beamAperture, isOfflineMode)` | `RamsMapView.kt:196` |
| `heading` = `imu.yawDegrees` | `RamsMapView.kt:150` |
| JS writes `beam.style.transform` per call | `assets/leaflet/map.html:262-268` |

Two secondary causes, both cheap to fix:

| Evidence | Line | Effect |
|---|---|---|
| One `LaunchedEffect` keyed on GPS **and** events calls `setNearbyIncidents` | `RamsMapView.kt:174` | all nearby markers cleared and rebuilt every GPS fix |
| `panTo(..., {animate:true, duration:0.5})` on every fix | `map.html:463-466` | 500 ms animation restarted every 1000 ms |

**Correction to the original diagnosis:** `beamAperture` is not a noise source.
`computeBeamAperture()` (`PhoneSensorEngine.kt:125-136`) returns one of
`22 / 28 / 50 / 85 / 110`, so it changes only on a threshold crossing. The
`setAttribute('d', ...)` SVG rewrite at `map.html:230-237` is rare. Do not spend
effort there.

### B.2 Edit 1 - derive a UI-rate heading flow

In `RamsViewModel.kt`, immediately after `imuState` (ends line 174):

```kotlin
private fun angularDelta(a: Float, b: Float): Float {
  var d = (a - b) % 360f
  if (d > 180f) d -= 360f
  if (d < -180f) d += 360f
  return kotlin.math.abs(d)
}

val mapHeading: StateFlow<Float> = imuState
  .map { it.yawDegrees }
  .distinctUntilChanged { a, b -> angularDelta(a, b) < 2.0f }
  .sample(100L)
  .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), 0f)

val mapBeamAperture: StateFlow<Float> = imuState
  .map { it.beamAperture }
  .distinctUntilChanged()
  .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), 28f)
```

Imports needed: `kotlinx.coroutines.flow.map`, `distinctUntilChanged`, `sample`,
`SharingStarted`. Add `@OptIn(FlowPreview::class)` on the class if `sample`
warns.

### B.3 Edit 2 - stop passing `ImuData` through the screen tree

`MapScreen.kt:37` replace

```kotlin
  imu: ImuData = ImuData(),
```

with

```kotlin
  headingDeg: Float = 0f,
  beamAperture: Float = 28f,
```

`MapScreen.kt:52` becomes

```kotlin
  val activeHeading = if (headingDeg != 0f) headingDeg else gps.headingDegrees
```

`MapScreen.kt:62-71` passes `headingDeg = headingDeg, beamAperture = beamAperture`
instead of `imu = imu`.

`MainActivity.kt` call site (search `MapScreen(`) passes the two collected flows
instead of `imu`.

### B.4 Edit 3 - split the position and incident effects

`RamsMapView.kt:132-141` signature: replace `imu: ImuData = ImuData(),` with
`headingDeg: Float = 0f, beamAperture: Float = 28f,`. Delete the local `heading`
val at line 150; use `headingDeg` directly.

Replace the effect at lines 174-185 with two effects:

```kotlin
  val nearbyJson = remember(events, showNearby) {
    filterActiveAccidentsJson(events, showNearby)
  }

  LaunchedEffect(gps.latitude, gps.longitude, headingDeg, showNearby, isOfflineMode) {
    if (!isOfflineMode && webViewRef != null) {
      val lat = if (gps.hasFix) gps.latitude else 17.6132
      val lon = if (gps.hasFix) gps.longitude else 121.7270
      webViewRef?.evaluateJavascript(
        "if(window.updateUserPos){ window.updateUserPos($lat, $lon, $headingDeg, $showNearby); }", null)
    }
  }

  LaunchedEffect(nearbyJson, isOfflineMode) {
    if (!isOfflineMode && webViewRef != null) {
      webViewRef?.evaluateJavascript(
        "if(window.setNearbyIncidents){ window.setNearbyIncidents($nearbyJson); }", null)
    }
  }
```

`remember` needs `androidx.compose.runtime.remember` (usually already imported).

### B.5 Edit 4 - gate the offline animation

Move `rememberInfiniteTransition`, `pulseRadius` and `pulseAlpha`
(`RamsMapView.kt:153-171`) inside the offline `else` branch at `:296`, so the
animation only exists when it is drawn.

### B.6 Edit 5 - `Eagerly` to `WhileSubscribed`

`RamsViewModel.kt:174`: `SharingStarted.Eagerly` -> `SharingStarted.WhileSubscribed(5_000)`.

Before committing, confirm nothing outside the UI collects `imuState` while the
activity is stopped. `phoneSensorEngine.crashTriggerFlow` (`:905`) is an
independent flow and is unaffected. If a non-UI consumer does depend on
`imuState`, give it a direct subscription to `phoneSensorEngine.phoneImuState`
and keep the UI flow `WhileSubscribed`.

### B.7 Edit 6 - stop restarting the pan animation

`assets/leaflet/map.html:463-466`. Only pan when the user has not interacted and
the displacement exceeds 5 m; use `animate:false` for small moves.

```js
if (!isUserPanning || (Date.now() - lastUserPanTime > 45000)) {
  isUserPanning = false;
  var dy = Math.abs(lat - currentLat), dx = Math.abs(lon - currentLon);
  map.panTo([lat, lon], { animate: (dy > 0.00005 || dx > 0.00005), duration: 0.5 });
}
```

`currentLat` / `currentLon` are updated at the top of `updateUserPos`, so capture
the previous values before overwriting them, or compare against the marker's
current position with `userMarker.getLatLng()`.

### B.8 Acceptance

| ID | Test | Pass |
|---|---|---|
| PERF-01 | p99 frame time, map screen, rotating | <= 32 ms |
| PERF-02 | `evaluateJavascript` calls per second while rotating | <= 12 |
| PERF-03 | Bench drop test still triggers `handleCrashShockDetected` | fires |

Re-run the `dumpsys gfxinfo` capture and append both numbers to
`PERFORMANCE_PLAN.md`.

---

## 6. Stage C - Range, latency, and ping

### C.0 What already works, and what does not

Works end to end: phone toggle -> BLE JSON -> wearable -> `loraSendPing` ->
LoRa -> receiver `PKT_PING` -> serial JSON.

Does not work:

| # | Defect | Evidence |
|---|---|---|
| C-a | Station has no `LORA_PING` handler | `LORA_PING` absent from `desktop_ai_app` |
| C-b | Ping falls through to the alert branch and rewrites `incidents.json` | `Program.cs:302-312`, `:577-584` |
| C-c | No station position, so no distance | no config exists |
| C-d | `rxMillis` is uptime, not epoch, so latency cannot be computed | `lora_rx.cpp:344` |
| C-e | 7 synchronous `httpUploadEvent` calls inside the RX path, 15 s timeout | `lora_rx.cpp:140` etc. |
| C-f | Receiver uploads `millis()` as `timestamp` | `http_upload.cpp:46` |
| C-g | Phone ignores `PING_ACK` | `Esp32SyncEngine.kt:598-619` |
| C-h | Settings text claims a logger that does not exist | `SettingsScreen.kt:1608` |
| C-i | Ping loop drifts because `delay(3000)` measures from the end of work | `RamsViewModel.kt:1416` |

**C-e forces the architecture.** A 15 s blocking POST inside the LoRa receive
path would drop roughly five pings at a 3 s interval, and could drop an alert.
So the measurement chain runs over **USB serial** first. Wi-Fi ping upload is
Stage C5, optional, and must be asynchronous.

### C.1 The measurement model

```
t0  phone    System.currentTimeMillis()          absolute UTC   in PingPacket.phoneEpochMs
t1  wearable PacketHeader.timestamp              uptime         local only, unused
t2  station  DateTime.UtcNow at ingest           absolute UTC   added by the desktop
```

```
latencyMs = t2 - t0                       the number you asked for
jitterMs  = | (t2[n] - t2[n-1]) - (t0[n] - t0[n-1]) |     skew-independent
airtimeMs = 246.8                         SF9 / BW125 / CR4-5 / 33 bytes, computed
```

`t2 - t0` is valid because both are absolute UTC. It is **not** valid as
`receiverMillis - wearableTimestamp`; those are two uptime counters with
different boot instants. Never write that subtraction.

Guards:

- `latency < 0` -> `clockSkewSuspect = true`, record anyway.
- `latency < airtimeMs` -> `clockSkewSuspect = true`, record anyway.

Airtime arithmetic, for the record:

```
Tsym          = 2^9 / 125000 = 4.096 ms
preamble+sync = 12.25 symbols = 50.18 ms
payload       = 8 + ceil((8*33 - 4*9 + 28 + 16) / 36) * 5 = 48 symbols = 196.61 ms
total         = 246.79 ms
```

Duty cycle: 8.2% at a 3 s interval, 24.7% at 1 Hz. Use burst mode (20 pings at
1 Hz, then idle) for field work. Do not run continuous high-rate pings.

### C.2 Station record contract

`ping-log.jsonl`, one object per line, append-only:

```json
{"v":1,"recvUtc":"2026-11-18T07:12:33.412Z","t2Ms":1763000000338,"via":"serial",
 "token":"ABC123","seq":42,"t0Ms":1763000000000,"airtimeMs":246.8,
 "lat":17.613200,"lon":121.727000,"noFix":false,"rssi":-108,"snr":-6.5,
 "stationLat":17.600000,"stationLon":121.730000,"stationSrc":"manual",
 "distanceM":1470.3,"latencyMs":338,"jitterMs":12,"clockSkewSuspect":false}
```

`distanceM` and `jitterMs` are `null` when not computable.

`station-config.json`:

```json
{"lat":17.600000,"lon":121.730000,"label":"KM 42 marker","source":"manual","accuracyM":null,"updatedUtc":"2026-11-18T07:00:00Z"}
```

### C.3 C-S1 - intercept the ping before the incident path

This is the single most important edit in Stage C. In
`apps/new_ai_applications/desktop_ai_app/Program.cs`, at the top of
`ProcessIncomingPayload` (line 295), immediately after the token extraction at
line 300:

```csharp
            string eventField = ExtractField(payload, "event");
            string token = ExtractField(payload, "deviceToken") ?? ExtractField(payload, "token") ?? "";

            // Benchmark pings are measurements, not incidents. Handle and leave
            // before packet-type resolution so they can never reach SaveIncidents.
            if (eventField != null && eventField.Equals("LORA_PING", StringComparison.OrdinalIgnoreCase))
            {
                RecordPing(payload, "serial", DateTime.UtcNow);
                return;
            }
```

Do not add `"ping"` to the `packetType` chain. A default-branch entry can still
be saved; an early return cannot.

### C.4 C-S2 - append-only ping store

Add fields next to `_registrationsFilePath` (`Program.cs:38`):

```csharp
        private static readonly object _pingLock = new object();
        private static string _pingLogPath;
        private static string _stationConfigPath;
        private static readonly List<string> _pingRing = new List<string>();
        private const int PING_RING_MAX = 200;
        private static readonly Dictionary<string, long[]> _lastPingByToken = new Dictionary<string, long[]>();

        private static double _stationLat = 0.0;
        private static double _stationLon = 0.0;
        private static string _stationLabel = "";
        private static string _stationSource = "unset";
        private static double _stationAccM = -1.0;
```

In `Main` after line 63:

```csharp
                _pingLogPath = Path.Combine(appDir, "ping-log.jsonl");
                _stationConfigPath = Path.Combine(appDir, "station-config.json");
                LoadStationConfig();
```

Rules:

- `lock (_pingLock)`, never `lock (_lock)`.
- `File.AppendAllText(_pingLogPath, line + "\n", new UTF8Encoding(false))`.
- Never touch `_eventsJsonList` or call `SaveIncidents` from this path.

### C.5 C-S3 - `RecordPing`

```csharp
        private static long ToEpochMs(DateTime utc)
        {
            DateTime epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return (long)(utc.ToUniversalTime() - epoch).TotalMilliseconds;
        }

        private static long ParseLong(string s, long fallback)
        {
            long v;
            return long.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out v) ? v : fallback;
        }

        private static double ParseDouble(string s, double fallback)
        {
            double v;
            return double.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out v) ? v : fallback;
        }

        private static void RecordPing(string payload, string via, DateTime recvUtc)
        {
            string token = ExtractField(payload, "token");
            if (string.IsNullOrEmpty(token)) token = ExtractField(payload, "deviceToken");
            if (token == null) token = "";

            long seq    = ParseLong(ExtractField(payload, "seq"), 0L);
            long t0     = ParseLong(ExtractField(payload, "phoneEpoch"), 0L);
            double lat  = ParseDouble(ExtractField(payload, "lat"), 0.0);
            double lon  = ParseDouble(ExtractField(payload, "lon"), 0.0);
            int rssi    = (int)ParseDouble(ExtractField(payload, "rssi"), 0.0);
            double snr  = ParseDouble(ExtractField(payload, "snr"), 0.0);
            double air  = ParseDouble(ExtractField(payload, "airtimeMs"), 0.0);
            if (air <= 0.0) air = 246.8;

            bool noFix = (lat == 0.0 && lon == 0.0);
            long t2 = ToEpochMs(recvUtc);

            long latency = (t0 > 0L) ? (t2 - t0) : -1L;
            bool skew = (latency < 0L) || (latency >= 0L && latency < air);

            double distanceM = -1.0;
            if (!noFix && _stationSource != "unset")
            {
                distanceM = HotspotPredictor.CalculateHaversineDistance(
                    _stationLat, _stationLon, lat, lon);
            }

            double jitterMs = -1.0;
            long[] prev;
            if (_lastPingByToken.TryGetValue(token, out prev))
            {
                jitterMs = Math.Abs((double)((t2 - prev[1]) - (t0 - prev[0])));
            }
            _lastPingByToken[token] = new long[] { t0, t2 };

            StringBuilder sb = new StringBuilder();
            sb.Append("{");
            sb.Append("\"v\":1,");
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"recvUtc\":\"{0}\",", recvUtc.ToString("o"));
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"t2Ms\":{0},", t2);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"via\":\"{0}\",", via);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"token\":\"{0}\",", token.Replace("\"", ""));
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"seq\":{0},", seq);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"t0Ms\":{0},", t0);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"airtimeMs\":{0:F1},", air);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"lat\":{0:F6},\"lon\":{1:F6},", lat, lon);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"noFix\":{0},", noFix ? "true" : "false");
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"rssi\":{0},", rssi);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"snr\":{0:F1},", snr);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"stationLat\":{0:F6},\"stationLon\":{1:F6},", _stationLat, _stationLon);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"stationSrc\":\"{0}\",", _stationSource);
            sb.Append("\"distanceM\":");
            sb.Append(distanceM < 0.0 ? "null" : distanceM.ToString("F1", CultureInfo.InvariantCulture));
            sb.Append(",");
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"latencyMs\":{0},", latency);
            sb.Append("\"jitterMs\":");
            sb.Append(jitterMs < 0.0 ? "null" : jitterMs.ToString("F0", CultureInfo.InvariantCulture));
            sb.Append(",");
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"clockSkewSuspect\":{0}", skew ? "true" : "false");
            sb.Append("}");

            string line = sb.ToString();
            lock (_pingLock)
            {
                File.AppendAllText(_pingLogPath, line + "\n", new UTF8Encoding(false));
                _pingRing.Add(line);
                if (_pingRing.Count > PING_RING_MAX) _pingRing.RemoveAt(0);
            }
            Console.WriteLine("[PING] " + line);
        }
```

Add `using System.Globalization;` to the using block. `HotspotPredictor.CalculateHaversineDistance`
is `public static` at `HotspotPredictor.cs:156`; reuse it, do not write a second
haversine.

### C.6 C-S4 - station config and location

```csharp
        private static void LoadStationConfig()
        {
            try
            {
                if (!File.Exists(_stationConfigPath)) return;
                string text = File.ReadAllText(_stationConfigPath);
                _stationLat = ParseDouble(ExtractField(text, "lat"), 0.0);
                _stationLon = ParseDouble(ExtractField(text, "lon"), 0.0);
                _stationLabel = ExtractField(text, "label") ?? "";
                _stationSource = ExtractField(text, "source") ?? "manual";
                _stationAccM = ParseDouble(ExtractField(text, "accuracyM"), -1.0);
            }
            catch { }
        }

        private static void SaveStationConfig(double lat, double lon, string label,
                                              string source, double accuracyM)
        {
            _stationLat = lat;
            _stationLon = lon;
            _stationLabel = label ?? "";
            _stationSource = source;
            _stationAccM = accuracyM;

            StringBuilder sb = new StringBuilder();
            sb.Append("{");
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"lat\":{0:F6},", lat);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"lon\":{0:F6},", lon);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"label\":\"{0}\",", (label ?? "").Replace("\"", ""));
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"source\":\"{0}\",", source);
            sb.Append("\"accuracyM\":");
            sb.Append(accuracyM < 0 ? "null" : accuracyM.ToString("F0", CultureInfo.InvariantCulture));
            sb.AppendFormat(CultureInfo.InvariantCulture, ",\"updatedUtc\":\"{0}\"", DateTime.UtcNow.ToString("o"));
            sb.Append("}");
            File.WriteAllText(_stationConfigPath, sb.ToString(), new UTF8Encoding(false));
        }
```

Windows location attempt. This requires `/r:System.Device.dll` in
`Build_Desktop_Exe.bat` and `using System.Device.Location;`:

```csharp
        private static string DetectStationLocation(out double lat, out double lon,
                                                    out double accuracyM)
        {
            lat = 0.0; lon = 0.0; accuracyM = -1.0;
            try
            {
                using (GeoCoordinateWatcher watcher =
                       new GeoCoordinateWatcher(GeoPositionAccuracy.High))
                {
                    watcher.MovementThreshold = 0.0;
                    if (!watcher.TryStart(false, TimeSpan.FromSeconds(8)))
                        return "denied";

                    DateTime deadline = DateTime.UtcNow.AddSeconds(8);
                    while (DateTime.UtcNow < deadline)
                    {
                        if (watcher.Status == GeoPositionStatus.Ready) break;
                        Thread.Sleep(200);
                    }

                    GeoCoordinate c = watcher.Position.Location;
                    watcher.Stop();
                    if (c.IsUnknown) return "no-data";

                    accuracyM = c.HorizontalAccuracy;
                    if (accuracyM <= 0 || accuracyM > 50.0) return "too-coarse";

                    lat = c.Latitude;
                    lon = c.Longitude;
                    return "ok";
                }
            }
            catch (Exception ex)
            {
                return "error: " + ex.Message;
            }
        }
```

Expect `no-data`, `denied`, or `too-coarse` on a laptop. **Manual coordinates
are the primary path.** `HorizontalAccuracy` is a radius in metres; reject above
50 m because Wi-Fi positioning is typically 20-100 m and IP-based is kilometres.

Manual parsing must accept `17.6132, 121.7270`, a Google Maps URL containing
`@17.6132,121.7270,17z`, and a `?q=17.6132,121.7270` URL. Extract the first
decimal pair.

### C.7 C-S5 - routes

Add to the dispatch chain in `Program.cs` (after `/api/status`, around line 811):

| Method | Path | Handler |
|---|---|---|
| GET | `/api/ping/recent` | `HandleGetPingRecent(res)` |
| GET | `/api/ping/summary` | `HandleGetPingSummary(res)` |
| GET | `/api/ping/export.csv` | `HandleGetPingCsv(res)` |
| GET | `/api/station` | `HandleGetStation(res)` |
| POST | `/api/station` | `HandlePostStation(req, res)` |
| POST | `/api/station/detect` | `HandleDetectStation(res)` |
| GET | `/api/health` | `{"status":"OK","app":"RAMS","port":N}` |

`/api/health` is also required by Stage D. Add it now.

`GET /api/ping/recent?n=50` returns `{"count":N,"records":[ ... ]}` where each
record is the stored JSON object verbatim. Default `n` 50, cap 200.

`GET /api/ping/summary` aggregates the ring:

```json
{"count":200,"sent":0,"received":200,"lost":0,"lossPct":0.0,
 "latencyP50":312,"latencyP95":480,"latencyMax":912,
 "jitterMean":9.4,"distanceMinM":48.0,"distanceMedianM":240.0,"distanceMaxM":1470.3,
 "rssiMedian":-104,"snrMedian":-4.5,"skewCount":0,"noFixCount":0,
 "firstSeq":1,"lastSeq":200,"lastRecvUtc":"...","station":{"lat":..,"lon":..,"label":"..","source":".."}}
```

Formulas:

- `lost = (lastSeq - firstSeq + 1) - received`, floored at 0, per token.
- `lossPct = lost / (lastSeq - firstSeq + 1) * 100`.
- Latency percentiles: nearest-rank on the sorted non-negative values.
- `jitterMean`: mean of non-null `jitterMs`.
- `distanceMedianM`: median of non-null `distanceM`.
- Aggregate latency **per `via`** if more than one `via` is present. Never mix
  serial and HTTP latency into one number.

`GET /api/ping/export.csv` header:

```
recvUtc,t2Ms,via,token,seq,t0Ms,latencyMs,jitterMs,airtimeMs,lat,lon,noFix,rssi,snr,distanceM,stationLat,stationLon,clockSkewSuspect
```

### C.8 C-S6 - the `--ping` window

`Program.cs:79`:

```csharp
                bool pingWindow = args != null && Array.IndexOf(args, "--ping") >= 0;
                string appUrl = string.Format("http://127.0.0.1:{0}/{1}",
                    _port, pingWindow ? "ping.html" : "");
```

`ServeStaticFile` (`:1612`) already serves any file under `www/`, so
`www/ping.html` needs no route work.

### C.9 C-S7 - `www/ping.html`

A standalone page. Dark theme, zero emoji, monospace for numbers. The main
dashboard is a prebuilt bundle (`www/assets/index-CC4_zyki.js`) with no source in
the repository, so a nav tab there is out of scope. Say so in the page footer so
nobody hunts for a missing tab.

Sections, top to bottom:

1. **Station.** Coordinates, source badge (`manual` / `windows`), accuracy,
   label, `Detect` button, `Edit` button, Google Maps link. Editing requires an
   explicit Save. Never write config silently.
2. **Live.** Last ping: seq, age, latency, jitter, distance, RSSI, SNR, link
   margin (`SNR + 12.5`), path.
3. **Session summary.** Sent, received, lost, loss %, latency p50/p95/max,
   jitter mean, distance min/median/max, first/last seen.
4. **Table.** Last 50 records, newest first, with a skew flag column.
5. **Export.** Link to `/api/ping/export.csv`.

Polling: `/api/ping/recent` every 1000 ms, `/api/ping/summary` every 5000 ms.
On `clockSkewSuspect`, show an amber banner with the measured offset and a
one-line explanation. Never show a suspect number without the flag.

### C.10 C-F1 - receiver JSON parity

`firmware/receiver_withDesktop/lora_rx.cpp:343-344`, inside `case PKT_PING`.
Append `airtimeMs` and `noFix`. No logic change, no wire-format change, so
`PingPacket` stays 33 bytes and old wearables keep working.

```cpp
      bool noFix = (pkt->latitude == 0.0f && pkt->longitude == 0.0f);
      Serial.printf("{\"event\":\"LORA_PING\",\"token\":\"%s\",\"seq\":%lu,"
                    "\"lat\":%.6f,\"lon\":%.6f,\"phoneEpoch\":%llu,"
                    "\"rssi\":%d,\"snr\":%.1f,\"rxMillis\":%lu,"
                    "\"airtimeMs\":246.8,\"noFix\":%s}\n",
                    token, pkt->pingSequence, pkt->latitude, pkt->longitude,
                    pkt->phoneEpochMs, rssi, snr, millis(),
                    noFix ? "true" : "false");
```

Keep the human-readable `[LORA-RX]` line above it.

Build check:

```powershell
arduino-cli compile --fqbn esp32:esp32:esp32s3 firmware/receiver_withDesktop
```

Budget: 1,304,383 / 1,310,720 bytes (99%, 6,337 free). This change adds a few
hundred bytes. If it does not fit, `PartitionScheme=huge_app` is already
required by `CONNECTIVITY_FIX_PLAN.md`; apply that first.

### C.11 C-P1..C-P6 - phone

**C-P1 - handle `PING_ACK`.** In `Esp32SyncEngine.kt`, `parseIncomingBlePacket`
(`:598-619`) add a branch:

```kotlin
        } else if (json.optString("type") == "PING_ACK") {
          onPingAck?.invoke(json.optLong("seq", -1L))
        }
```

Verify the exact field names the wearable emits at `bt_service.cpp:128` before
committing. Add `var onPingAck: ((Long) -> Unit)? = null` if absent.

**C-P2 - ping event log.** In `RamsViewModel.kt` next to `_pingSequenceCount`
(`:222`):

```kotlin
  data class PingEvent(
    val seq: Long, val t0: Long, val lat: Double, val lon: Double,
    val hasFix: Boolean, val intervalMs: Long, val ackAt: Long?
  )
  private val _pingLog = MutableStateFlow<List<PingEvent>>(emptyList())
  val pingLog: StateFlow<List<PingEvent>> = _pingLog.asStateFlow()
```

Ring of 50. Append on send, patch `ackAt` on ACK.

**C-P3 - drift-free schedule.** Replace `delay(3000L)` (`:1416`):

```kotlin
        var next = android.os.SystemClock.elapsedRealtime() + intervalMs
        while (isActive && _isPingModeActive.value) {
          val started = android.os.SystemClock.elapsedRealtime()
          sendOnce()
          _pingLog.value = (_pingLog.value + PingEvent(/* ... */ started - lastStarted))
            .takeLast(50)
          next += intervalMs
          val wait = next - android.os.SystemClock.elapsedRealtime()
          if (wait > 0) delay(wait) else next = android.os.SystemClock.elapsedRealtime()
        }
```

Log the actual interval, not the intended one. Intentional drift must be
visible; otherwise loop drift is mistaken for network jitter.

**C-P4 - no fix.** Send anyway, because latency is still valid, but record
`hasFix = gps.hasFix`. The receiver derives `noFix` from `0,0` and the station
sets `distanceM:null`. Do not fabricate coordinates.

**C-P5 - popup.** New `PingMonitorDialog.kt`, shown while `isPingModeActive`,
dismissible, reopenable from a status chip. Use `Dialog` with
`DialogProperties(usePlatformDefaultWidth = false)` for a floating card. No map
layout surgery.

| Section | Fields | Source |
|---|---|---|
| Header | `PING MONITOR` + live dot | `isPingModeActive` |
| Counters | sent / acked / failed / no-fix | `_pingLog` |
| Interval | intended, last actual, drift | `PingEvent.intervalMs` |
| Last frame | seq, t0 local time, lat/lon or `NO FIX` | `PingEvent` |
| Feed | last 20, one line each | `_pingLog` |
| Footer | `Station columns require the station panel` | static |

Do **not** show latency, RSSI, SNR, or distance on the phone. Only the station
can know them, and inventing a phone-to-desktop discovery layer to fetch them is
out of scope. This is a locked decision, not an oversight.

**C-P6 - correct the settings text.** `SettingsScreen.kt:1608`:

> "Packets: 3000ms interval | Uplink: BLE GATT -> LoRa 433MHz SX1278 (SF9, BW125)
> Desktop Command Center logs delay (ms), distance (m), RSSI, & SNR."

Replace with:

> "Packets: burst mode, 20 pings per point | Uplink: BLE GATT -> LoRa 433 MHz
> SX1278 (SF9, BW125, 246.8 ms airtime). Station panel logs latency, distance,
> RSSI and SNR."

Build check: `cd apps/android_app && ./gradlew assembleDebug`.

### C.12 C5 - Wi-Fi ping upload (deferred)

Only needed for unattended deployment. Requirements, in order:

1. Must not block `loraRxUpdate()`. Use a FreeRTOS task pinned to core 0 with an
   8-entry ring buffer.
2. Timeout `1500 ms`, not the global `15000 ms`.
3. **Do not** queue failed pings to LittleFS. A ping that arrives late has no
   valid `t2`; backfilling falsifies the latency distribution. Drop it and let
   the sequence gap report the loss.
4. POST to `/api/ping` with `via:"http"`. The station must aggregate HTTP
   latency separately from serial latency.
5. Requires `PartitionScheme=huge_app`.

### C.13 Field sweep

Setup: receiver on USB, station panel open, station position set, phone with a
3D fix, wearable antenna vertical at 1.5 m.

| Point | Distance | Pings |
|---|---|---|
| 1 | 50 m | 20 |
| 2 | 100 m | 20 |
| 3 | 250 m | 20 |
| 4 | 500 m | 20 |
| 5 | 1 km | 20 |
| 6 | 2 km | 20 |
| 7 | first point with > 20% loss | 20 |

Stand still at each point. Do not ping while walking between points. Record
median RSSI, median SNR, and the GPS distance shown by the panel.

Fit `n` in `RSSI = K - 10 n log10(d)`. Sanity: free space `n = 2`, suburban road
`2.7 - 3.5`, obstructed `3.5 - 5`. Report `n`, `R^2`, and the 20%-loss distance.
Refuse the fit below 10 points. Report link margin as `SNR + 12.5` dB.

### C.14 Acceptance

| ID | Test | Pass |
|---|---|---|
| RNG-01 | Toggle ping mode, receiver on USB | a row appears within 2 s |
| RNG-02 | 20 pings | exactly 20 new lines in `ping-log.jsonl`; `incidents.json` unchanged |
| RNG-03 | Bench latency | median between 247 and 600 ms |
| RNG-04 | Measured 100 m baseline | distance within 10 m |
| RNG-05 | Phone without fix | `noFix:true`, `distanceM:null` |
| RNG-06 | Stop the phone | station stays up, no crash |
| RNG-07 | 10 minutes at 20 pings/min | no `SaveIncidents`, UI responsive, line count matches |
| RNG-08 | Set desktop clock 5 s ahead | banner appears, rows still written |

---

## 7. Stage D - receiver backend discovery

Detail: `docs/agent/CONNECTIVITY_FIX_PLAN.md`. Order:

1. NVS `last_good_host`, tried first.
2. UDP broadcast on port 8889; the desktop replies with LAN IP and HTTP port.
3. Compile-time fallback, now empty: `config.h:44` becomes `#define BACKEND_URL ""`.
4. Captive-portal field for a manual override.
5. `/api/health` probe before adopting any candidate. Adopt only on HTTP 200.
6. Persist the winner to NVS.

`BACKEND_URL` stops being a location and becomes a last resort. That ends the
reflash loop.

Desktop side already covered by C.7 (`/api/health`). Also fix
`http_upload.cpp:46` (`doc["timestamp"] = millis()`) to send an absolute time,
or drop the field. Uptime is not a timestamp.

---

## 8. Stage E - BLE stability

Detail: `docs/agent/BLE_STABILITY_PLAN.md`, tests `BLE-01..08`. Two constraints
while implementing:

- Profile write cadence stays wire-compatible: on connect, then every 30 s. Do
  not move to event-driven writes until both ends are reflashed together.
- MTU 247, awaited before streaming. `requestMtu(512)` at
  `Esp32SyncEngine.kt:525` is wrong; 247 is the largest value Android accepts
  and the largest the ESP32 grants.

---

## 9. Stage F - reorg and tooling (deferred)

- `docs/agent/ROOT_REORG_PLAN.md` - exact `git mv` commands, duplicate decisions.
- `tools/ai-tooling/install_ai_tooling.ps1` - idempotent; generates
  `opencode.mcp.json`, `codex.mcp.toml`, `antigravity.mcp.json` with 7 servers
  each. Requires `-MergeOpenCode` / `-MergeCodex` to write global configs.

Do this last. It touches many paths and would otherwise rebase a moving target.

---

## 10. Checks to add

Add to `scripts/verify/check_invariants.py`, following the existing
`@check(id, title, severity, fix)` decorator. Each function returns
`(status, detail, evidence_list)`.

```python
DESKTOP_PROGRAM = "apps/new_ai_applications/desktop_ai_app/Program.cs"
LOOPBACK_RX     = "firmware/receiver_withDesktop/lora_rx.cpp"
MAP_VIEW        = "apps/android_app/app/src/main/java/com/example/ui/components/RamsMapView.kt"
VM              = "apps/android_app/app/src/main/java/com/example/viewmodel/RamsViewModel.kt"
SETTINGS        = "apps/android_app/app/src/main/java/com/example/ui/screens/SettingsScreen.kt"


@check("RNG-001", "Station intercepts LORA_PING before the incident fallback", FAIL,
       "docs/agent/EXECUTION_PLAN.md#c3-c-s1---intercept-the-ping-before-the-incident-path")
def _rng001():
    text = read(DESKTOP_PROGRAM)
    if not text:
        return SKIP, "Program.cs not found", []
    handler = text.find('eventField.Equals("LORA_PING"')
    fallback = text.find('string packetType = "alert";')
    if handler < 0:
        return FAIL, "LORA_PING is unhandled; pings fall through to the alert branch.", []
    if fallback >= 0 and handler > fallback:
        return FAIL, "LORA_PING is handled after the packetType default and can still reach SaveIncidents.", []
    return PASS, "LORA_PING is intercepted before packet-type resolution.", [
        evidence(DESKTOP_PROGRAM, 'eventField.Equals("LORA_PING"')]


@check("RNG-002", "Ping handler never touches the incident store", FAIL,
       "docs/agent/EXECUTION_PLAN.md#c4-c-s2---append-only-ping-store")
def _rng002():
    body = block_after(read(DESKTOP_PROGRAM), "private static void RecordPing")
    if not body:
        return FAIL, "RecordPing is missing.", []
    bad = []
    if "SaveIncidents" in body:
        bad.append("SaveIncidents")
    if "_eventsJsonList" in body:
        bad.append("_eventsJsonList")
    if "lock (_lock)" in body:
        bad.append("lock (_lock)")
    if bad:
        return FAIL, "RecordPing reaches the incident path: " + ", ".join(bad), bad
    return PASS, "RecordPing is append-only.", []


@check("RNG-003", "Ping log is separate from the incident file", FAIL,
       "docs/agent/EXECUTION_PLAN.md#c4-c-s2---append-only-ping-store")
def _rng003():
    text = read(DESKTOP_PROGRAM)
    if "_pingLogPath" not in text:
        return FAIL, "No dedicated ping log path.", []
    if "File.AppendAllText(_pingLogPath" not in text:
        return FAIL, "Ping log is not appended.", []
    if "_pingLogPath = _dataFilePath" in text:
        return FAIL, "Ping log aliases the incident store.", []
    return PASS, "Ping log is append-only and separate.", [
        evidence(DESKTOP_PROGRAM, "_pingLogPath =")]


@check("RNG-004", "Ping branch performs no HTTP upload inside the RX path", FAIL,
       "docs/agent/EXECUTION_PLAN.md#c10-c-f1---receiver-json-parity")
def _rng004():
    body = block_after(read(LOOPBACK_RX), "case PKT_PING:")
    if not body:
        return FAIL, "PKT_PING branch not found.", []
    if "httpUploadEvent" in body:
        return FAIL, "Ping is uploaded synchronously inside loraRxUpdate().", [
            evidence(LOOPBACK_RX, "httpUploadEvent")]
    return PASS, "Ping branch is print-only.", []


@check("RNG-005", "Settings does not claim a station logger that does not exist", FAIL,
       "docs/agent/EXECUTION_PLAN.md#c11-c-p1cp6---phone")
def _rng005():
    text = read(SETTINGS)
    if not text:
        return SKIP, "SettingsScreen.kt not found", []
    if "Desktop Command Center logs delay" in text:
        return FAIL, "UI promises a logger the desktop does not implement.", [
            evidence(SETTINGS, "Desktop Command Center logs delay")]
    return PASS, "Settings text matches the implemented pipeline.", []


@check("PERF-001", "Map effect is not keyed on a raw sensor field", FAIL,
       "docs/agent/EXECUTION_PLAN.md#b2-edit-1---derive-a-ui-rate-heading-flow")
def _perf001():
    text = read(MAP_VIEW)
    if not text:
        return SKIP, "RamsMapView.kt not found", []
    hits = []
    for needle in ("LaunchedEffect(heading,", "LaunchedEffect(imu."):
        if needle in text:
            hits.append(evidence(MAP_VIEW, needle))
    if hits:
        return FAIL, "A LaunchedEffect restarts at the sensor rate.", hits
    return PASS, "No effect is keyed directly on a sensor field.", []


@check("PERF-002", "UI IMU flow is not eagerly shared", WARN,
       "docs/agent/EXECUTION_PLAN.md#b6-edit-5---eagerly-to-whilesubscribed")
def _perf002():
    text = read(VM)
    if not text:
        return SKIP, "RamsViewModel.kt not found", []
    idx = text.find("val imuState")
    if idx < 0:
        return FAIL, "imuState not found.", []
    window = text[idx:idx + 600]
    if "SharingStarted.Eagerly" in window:
        return FAIL, "imuState is eagerly shared.", [evidence(VM, "val imuState")]
    return PASS, "imuState stops with the UI.", []
```

PERF-003 (the infinite transition) is deliberately **not** a static check.
Detecting "declared inside a conditional branch" reliably needs a Compose
parser; a regex would be brittle and would violate the rule in
`docs/agent/README.md` about preferring runtime tests over fragile patterns.
Cover it with the `dumpsys gfxinfo` measurement instead.

Register the ids in `INCIDENT_LEDGER.md` when you add them. Data-driven checks
must stay red until their fix lands.

---

## 11. Ledger and lessons to append

`docs/agent/INCIDENT_LEDGER.md`, continuing from INC-012:

| ID | Incident | Check |
|---|---|---|
| INC-013 | `LORA_PING` fell through to the alert branch; every ping became an incident and rewrote the 79 KB store | RNG-001, RNG-002, RNG-003 |
| INC-014 | Ping JSON was printed to serial with no station consumer, while a comment and a UI string both promised one | RNG-005 |
| INC-015 | Seven synchronous HTTP uploads inside the LoRa RX path with a 15 s timeout; a slow network can stall reception long enough to drop an alert | RNG-004 |
| INC-016 | Receiver uploaded `millis()` as `timestamp`; events arrived with no usable wall-clock time | (Stage D) |
| INC-017 | `LaunchedEffect` keyed on a 50 Hz sensor field drove `evaluateJavascript` per tick; nearby markers were rebuilt on every GPS fix; the pan animation restarted every second | PERF-001 |
| INC-018 | `rememberInfiniteTransition` declared unconditionally for an animation only drawn offline | manual |

`docs/agent/LESSONS.md`, continuing from L-13:

- **L-14** - A comment and a UI string are not evidence of a feature.
  `lora_rx.cpp:342` promised a "Desktop App Ping Monitor" and
  `SettingsScreen.kt:1608` promised a logger; neither existed. Verify the
  consumer, not the producer.
- **L-15** - Never measure a millisecond with a blocking network call. A 15 s
  timeout in the receive path is 60x the window being measured.
- **L-16** - Before optimising a Compose screen, confirm which field is
  churning. `beamAperture` looked noisy but is quantized to five values; the cost
  was `yawDegrees` alone. Measure the field, not the class.

---

## 12. Commit sequence

One commit per line. Run the gate before each.

| # | Commit subject |
|---|---|
| 1 | `perf(android): decouple map from sensor-rate IMU updates` |
| 2 | `feat(desktop): ingest LoRa ping benchmarks into an append-only log` |
| 3 | `feat(desktop): range and latency station panel` |
| 4 | `feat(receiver): emit airtime and no-fix flags on ping packets` |
| 5 | `feat(android): ping monitor dialog, ACK handling, drift-free schedule` |
| 6 | `fix(receiver): resolve the backend host at runtime` |
| 7 | `fix(android,wearable): BLE reconnect and MTU stability` |
| 8 | `chore(repo): reorganise root scripts and remove duplicate trees` |

Run after each:

```powershell
python scripts/verify/check_invariants.py
powershell scripts/verify/verify_all.ps1 -Build all
```

Append the run to `docs/agent/verification-log.jsonl` via the harness. Do not
hand-edit the log.

---

## 13. Do not do

- Do not lower `SENSOR_DELAY_GAME`. Phone crash detection at 3.5 G depends on it.
- Do not add `PING_ACK` to the LoRa wire format. 33 bytes is deliberate.
- Do not queue failed pings for later upload. A late ping has no valid `t2`.
- Do not mix `via:"serial"` and `via:"http"` latency into one percentile.
- Do not edit `www/assets/index-*.js`. It is a build artifact with no source.
- Do not reuse `_lock` for ping writes.
- Do not put station columns in the phone popup without a discovery layer.
- Do not delete `hardware/`, `archive/`, or `evidence/` content during reorg.
- Do not rewrite `verification-log.jsonl` to hide a regressed run.

---

## 14. Blocked on hardware

| Item | Needs |
|---|---|
| PERF-01..03 | Android phone on `adb` |
| RNG-01..08 | ESP32-S3 receiver, wearable, phone |
| C.13 sweep | Clear line of sight, 2 km, two people |
| BLE-01..08 | Receiver, wearable, phone |
| NET-01..07 | A second host on the LAN, or a router for the subnet test |
| HW-01..HW-07 | Measurements M1 through M6 in `HARDWARE_REVISION_PLAN.md` |
| HW-08..HW-10 | Etched Rev L1 board, hot plate, DMM |
| HW-11..HW-12 | Assembled board, cell, LoRa peer |

Record pending hardware tests as `SKIP (hardware)` in the verification log with
a reason. Never report a hardware test as passed without running it.
