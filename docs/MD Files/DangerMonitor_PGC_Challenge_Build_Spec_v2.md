# Danger Monitor System — Master Build Spec v2 (PGC Digital Innovation Challenge)

## For: Opus 4.6, Antigravity IDE — Coding Assistant, Not Sole Author

> **Supersedes** `DangerMonitor_PGC_Challenge_Build_Spec.md`. This version reflects the belt-clip form factor, on-device registration/offline map, full receiver WiFi provisioning, and data-driven FSM validation decided after that draft.
>
> **Read this before writing any code.** This project is being submitted to the PGC Digital Innovation Challenge (Provincial Government of Cagayan). Competition rule 7 explicitly prohibits "relying primarily or entirely on AI to develop the project or its major components" and "submitting an AI-generated solution as the team's own original work." Opus's role here is implementation assistance under direction, with the team continuing development after the initial pass. Generate code section by section, with inline comments explaining *why*, not just *what*.
>
> **Deadline reality:** Oct 30, 2026 submission (abstract, team info, 3–5 min prototype video, ≥50% functional MVP). Dec 10, 2026 final presentation (booth, 5–10 slide deck, 5 min pitch + 10 min Q&A). This spec is scoped to that timeline, not the full long-term vision (§9 is roadmap-only).
>
> **Reference projects:** `JanClyde05/GPS-Audio` (GuardianTrack) — WiFi captive-portal pattern, Netlify Blobs storage, events/upload API shape. `JanClyde05/SHM-ESP32-System` — WebSocket-streamed sensor data with browser-side CSV download, direct model for the data-collection tool below.

---

# 1. Competition Framing

- **Thematic pillar (primary):** Youth & Elderly — safety/health/social well-being framing, use close to verbatim in the abstract and pitch.
- **Thematic pillar (secondary):** Good Governance / disaster preparedness — LoRa needs no cellular data plan, the differentiator in a province with rural coverage gaps. Receiver deployable at a barangay hall/rural health station, feeding provincial MDRRMO.
- **Evaluation weights (20% each):** Relevance to PGC & EGAY · Innovation and Creativity · Technical Feasibility · Impact to Government and Citizens · Quality of Presentation and Demo.
- **Competing solutions to name:** Apple Watch fall detection, Life Alert — both require a connected smartphone/cellular plan and subscription; this system needs neither per-user data plan nor subscription.
- **Named limitation, state it explicitly rather than let a judge find it:** data collection validates against FSM-triggering motions plus walking/running/jumping/vehicle-ride, but does not cover off-body handling (device un-clipped, dropped, tossed in a bag) or partial-clip-loosening — a real gap for a clip-on form factor, accepted for timeline reasons. Say this in the deck as a named v2 hardening item, not a silent gap.

---

# 2. System Overview

```
┌───────────────────────────────────────────┐
│                  WEARABLE                   │
│ ESP32-S3 SuperMini · MPU-6050 · ATGM336H    │
│ GPS · Ra-02 LoRa (433MHz) · buzzer ·        │
│ onboard NeoPixel (GPIO48)                   │
│                                              │
│ Normal operation: LoRa only, WiFi radio off │
│ Setup mode (button-hold): local SoftAP +    │
│  WebSocket → registration form + offline map│
└───────────────────┬─────────────────────────┘
                     │ LoRa 433MHz
                     ▼
┌───────────────────────────────────────────┐
│                  RECEIVER                    │
│ ESP32-S3 SuperMini · Ra-02 LoRa              │
│ No hardcoded WiFi — boots into SoftAP        │
│ captive portal (scan/select/password) until  │
│ credentials saved, then STA mode             │
└───────────────────┬─────────────────────────┘
                     │ HTTPS POST
                     ▼
┌───────────────────────────────────────────┐
│                  BACKEND                      │
│ Netlify Functions + Netlify Blobs             │
│ events store · devices store (token/name/     │
│ photoUrl from registration)                   │
└───────────────────┬─────────────────────────┘
                     │ HTTPS GET, polled 2-3s
                     ▼
┌───────────────────────────────────────────┐
│                  FRONTEND                      │
│ Netlify SPA — clustered live map,             │
│ color-coded pins, profile popup w/ photo      │
└───────────────────────────────────────────┘

     (separate, not part of the above data path)
┌───────────────────────────────────────────┐
│           DATA COLLECTION TOOL                 │
│ ESP32-S3 SuperMini (fallback: WROOM-1) ·      │
│ MPU-6050 only. Own SoftAP + WebSocket,        │
│ 100Hz stream → companion web page → CSV       │
│ download. No SD card, no external WiFi        │
│ dependency (works in a moving jeepney by       │
│ design — phone connects to the rig's own AP)   │
└───────────────────────────────────────────┘
```

---

# 3. Wearable

## 3.1 Features
- Fall FSM (freefall→wait-impact→stillness) + skid + direct-impact + environmental (ground-shock/wave-motion) detection
- Physical false-alarm/re-arm button (two-state toggle)
- Buzzer (audible alert)
- Onboard NeoPixel — status color + SOS pattern (replaces discrete LED)
- LoRa TX: `PKT_TELEMETRY / PKT_ALERT / PKT_FALSE_ALARM / PKT_TEST / PKT_REGISTER`
- **Local SoftAP + WebSocket, toggle-activated (button-hold to enter, not always-on)** — WiFi radio is off during normal armed operation; this is load-bearing for the "no cellular/data plan" pitch, don't make it always-on. Serves:
  - **Registration form**: name + pasted Google Drive share link → `convertDriveLink()` runs on-device → token generated → client-side validation fetches the converted URL and confirms it actually resolves to an image before accepting the token (catches "forgot to set link sharing to Anyone" at setup time, not at the booth)
  - **Offline live map**: a static local-area image baked into flash (pre-captured, not fetched from a tile server) + a pin repositioned via pixel-offset math from live GPS pings. Fully offline both directions — no internet on either the wearable or the phone/laptop viewing it, since the phone connects directly to the wearable's own AP.

## 3.2 `convertDriveLink()` — on-device, no regex needed

```cpp
// Turns a pasted Google Drive share link into a direct-embeddable image URL.
// Handles both common share-link shapes:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
//   https://drive.google.com/open?id=FILE_ID
// Uses lh3.googleusercontent.com rather than uc?export=view — the latter
// shows a "can't scan for viruses" interstitial for some file sizes instead
// of the raw image, which breaks <img> embeds.
// NOTE: still requires "Anyone with the link" sharing on the file — this
// function fixes the URL shape, not permissions. Validate client-side (§3.1).

String convertDriveLink(const String& rawUrl) {
  String fileId = "";
  int dIdx = rawUrl.indexOf("/d/");
  if (dIdx != -1) {
    int start = dIdx + 3;
    int end = rawUrl.indexOf('/', start);
    if (end == -1) end = rawUrl.indexOf('?', start);
    if (end == -1) end = rawUrl.length();
    fileId = rawUrl.substring(start, end);
  } else {
    int idIdx = rawUrl.indexOf("id=");
    if (idIdx != -1) {
      int start = idIdx + 3;
      int end = rawUrl.indexOf('&', start);
      if (end == -1) end = rawUrl.length();
      fileId = rawUrl.substring(start, end);
    }
  }
  if (fileId.length() == 0) return "";  // caller rejects at registration
  return "https://lh3.googleusercontent.com/d/" + fileId;
}
```

## 3.3 Materials

| Component | Part | Notes |
|---|---|---|
| MCU | ESP32-S3 SuperMini | **Onboard linear charger IC confirmed** — no separate TP4056 module needed |
| IMU | MPU-6050 | I2C |
| GPS | ATGM336H-5N-31 | UART |
| Radio | Ra-02 (SX1278, 433MHz), external IPEX antenna | |
| Buzzer | Active buzzer, GPIO-driven | Simplest option, no PWM tone generation required |
| Status indicator | Onboard NeoPixel | Verify GPIO48 against your specific board's silkscreen — clone boards vary |
| Button | Tactile push button | |
| Battery | LiPo | Charged via SuperMini's onboard linear charger |

## 3.4 Pin Map

| Function | GPIO |
|---|---|
| I2C SDA (MPU-6050) | GPIO8 |
| I2C SCL (MPU-6050) | GPIO9 |
| MPU INT | GPIO4 |
| GPS UART RX | GPIO17 |
| GPS UART TX | GPIO18 |
| LoRa SPI NSS | GPIO10 |
| LoRa SPI SCK | GPIO12 |
| LoRa SPI MISO | GPIO13 |
| LoRa SPI MOSI | GPIO11 |
| LoRa RESET | GPIO14 |
| LoRa DIO0 | GPIO16 |
| False-alarm/re-arm button | **GPIO2** (not GPIO0 — boot-strapping pin) |
| Buzzer | GPIO1 |
| NeoPixel (onboard) | GPIO48 — verify against board |
| **Avoid entirely** | GPIO0, 3, 45, 46 — strapping pins |

## 3.5 Firmware Modules

```
wearable/
  wearable.ino          [OWNER: ______]  — setup()/loop(), mode switch (armed vs. setup)
  config.h                — pin map §3.4, thresholds §6
  sensors.h/.cpp          [OWNER: ______]  — MPU-6050 read/calibrate/orientation
  gps.h/.cpp              [OWNER: ______]  — ATGM336H via TinyGPS++, last-known-location fallback
  detection.h/.cpp        [OWNER: ______]  — Fall FSM + skid + direct impact + environmental (§6)
  lora_tx.h/.cpp          [OWNER: ______]  — RadioLib or arduino-LoRa, sends §5 packets
  button.h/.cpp           — two-state toggle debounce, long-press → enter setup mode
  buzzer.h/.cpp           — alert tone patterns
  neopixel.h/.cpp         — status color states + SOS pattern
  local_ap.h/.cpp         [OWNER: ______]  — SoftAP + WebSocket server, only live in setup mode
  registration.h/.cpp     [OWNER: ______]  — registration form handler, convertDriveLink(), token gen
  offline_map.h/.cpp      [OWNER: ______]  — static map image asset + GPS-to-pixel-offset math, served over local_ap
```

---

# 4. Receiver

## 4.1 Features
- **No hardcoded WiFi.** Boots into SoftAP + captive-portal UI: scans nearby SSIDs, tap-to-select, password field, saves to flash, reconnects station-mode on subsequent boots. Reuse GuardianTrack's `wifi_manager.cpp` pattern directly.
- LoRa RX: deserializes all §5 packet types, including `PKT_REGISTER`
- Local retry queue: buffers packets in NVS/RAM when WiFi is down, flushes on reconnect (reuse GuardianTrack's `local_queue.cpp`) — this is the one reliability feature worth the extra dev time, since a receiver that silently drops an alert during a WiFi hiccup is the failure mode that actually matters
- HTTPS POST to Netlify Functions (`/api/upload`)
- Status LED (WiFi/LoRa link state)

## 4.2 Materials

| Component | Part | Notes |
|---|---|---|
| MCU | ESP32-S3 SuperMini | Same board family as wearable |
| Radio | Ra-02 (SX1278, 433MHz) | |
| Power | USB or wall adapter | Fixed-install, not battery-constrained |

## 4.3 Pin Map

| Function | GPIO |
|---|---|
| LoRa SPI NSS | GPIO10 |
| LoRa SPI SCK | GPIO12 |
| LoRa SPI MISO | GPIO13 |
| LoRa SPI MOSI | GPIO11 |
| LoRa RESET | GPIO14 |
| LoRa DIO0 | GPIO16 |
| Status LED | Onboard if present, else GPIO2 |

## 4.4 Firmware Modules

```
receiver/
  receiver.ino            [OWNER: ______]
  config.h                  — pin map §4.3, BACKEND_URL
  wifi_manager.h/.cpp        [OWNER: ______]  — SoftAP captive portal, scan/select/password/save
  lora_rx.h/.cpp             [OWNER: ______]  — listens for §5 packets, deserializes
  http_upload.h/.cpp         [OWNER: ______]  — HTTPS POST to Netlify Functions
  local_queue.h/.cpp         — NVS/RAM buffer, flush-on-reconnect
```

---

# 5. LoRa Packet Protocol

```c
// shared/protocol.h — identical copy in wearable and receiver firmware

enum PacketType : uint8_t {
  PKT_TELEMETRY    = 0,  // periodic GPS ping, armed or not
  PKT_ALERT        = 1,  // confirmed fall/skid/impact/environmental event
  PKT_FALSE_ALARM  = 2,  // physical-button cancel
  PKT_TEST         = 3,  // simulation/demo-mode trigger
  PKT_REGISTER     = 4   // one-time, sent when setup-mode registration completes
};

struct __attribute__((packed)) PacketHeader {
  uint8_t  packetType;
  char     deviceToken[8];
  uint32_t timestamp;
};

struct __attribute__((packed)) TelemetryPacket {
  PacketHeader header;
  float   latitude;
  float   longitude;
  uint8_t batteryPct;
};

struct __attribute__((packed)) AlertPacket {
  PacketHeader header;
  float   latitude;
  float   longitude;
  uint8_t eventType;  // 0=fall 1=skid 2=direct_impact 3=ground_shock 4=wave_motion
  float   aMag;
};

struct __attribute__((packed)) FalseAlarmPacket {
  PacketHeader header;
  float   latitude;
  float   longitude;
};

struct __attribute__((packed)) RegisterPacket {
  PacketHeader header;
  char    name[24];
  char    driveLinkConverted[96];  // output of convertDriveLink(), fits comfortably under LoRa's practical payload ceiling
};

#define TELEMETRY_INTERVAL_MS  30000
```

**Radio settings:** 433MHz confirmed. SF9 / BW125 / CR4:5 default, field-tune once both units are on the bench.

**No packet authentication in the MVP** — named gap, roadmap item (§9), same reasoning as before: honest "identified, scoped for v2" beats pretending it's not a gap.

---

# 6. Detection Logic — FSM Thresholds

Base values, subject to empirical adjustment per §7's validation pipeline:

**Fall FSM:**
```
FS_IDLE → (A_m < 0.40g) → FS_FREEFALL
FS_FREEFALL → (sustained ≥100ms) → FS_WAIT_IMPACT
FS_WAIT_IMPACT → (A_m > 3.00g within 500ms) → FS_STILLNESS
FS_STILLNESS → (σ(A_m) < 0.15g over 2000ms) → FS_CONFIRMED → PKT_ALERT (eventType=fall)
```

**Skid/slide** (FSM idle): `|ay| > 2.0g AND |gx| > 330°/s` sustained ≥200ms → `PKT_ALERT (eventType=skid)`.

**Direct impact** (FSM idle, not mid-skid): `A_m > 4.50g`, 5000ms debounce → `PKT_ALERT (eventType=direct_impact)`.

**Environmental** (every 1000ms, 50-sample rolling buffer): ground shock = `σ(A_m)≥0.40 AND σ(roll)<10 AND σ(pitch)<10`; wave motion = `σ(A_m)≥0.24 AND (σ(roll)≥10 OR σ(pitch)≥10)`.

**Physical button:** press during active alert → disarm + `PKT_FALSE_ALARM`; press while disarmed → re-arm.

---

# 7. Motion Data Collection & Validation

## 7.1 Scope — confirmed, simplified from an earlier draft

**Positive classes** (mannequin + manual reproduction, belt-clip mounted, matches production form factor):
| Class | Method | Trials |
|---|---|---|
| Forward fall | Mannequin, controlled drop/tip rig | 5 |
| Backward fall | Mannequin | 5 |
| Lateral fall | Mannequin | 5 |
| Direct impact | Mannequin, controlled knock/drop | 5 |
| Skid/slide | Manual reproduction of the target lateral-accel + roll-rate signature, or mannequin on a low-friction surface with a controlled push | 5 |

**Negative classes** (self-worn, belt clip, each team member):
| Class | Trials each |
|---|---|
| Walking (normal/brisk) | 5 |
| Running/jogging | 5 |
| Jumping | 5 |
| Vehicle ride, no accident (jeepney/tricycle as passenger) | 5 |

**Named, accepted limitation** (§1): off-body handling, high-risk ADL (sit-down-hard, etc.), and partial-clip-loosening are **not** covered by this dataset — cut for timeline, documented as a v2 hardening item rather than silently omitted.

## 7.2 Data Collection Tool

Own SoftAP + WebSocket, same pattern as the wearable's setup mode and directly modeled on `SHM-ESP32-System` — the phone/laptop connects straight to the rig's own hotspot, so **vehicle-ride trials work with zero external network dependency**, including inside a moving jeepney or tricycle with no lab WiFi in range.

| Component | Part |
|---|---|
| MCU | ESP32-S3 SuperMini — **fallback to ESP32-S3-WROOM-1 devkit only if SuperMini can't sustain 100Hz WebSocket streaming** (unlikely; the chip handles far heavier loads than this in other contexts, but the fallback is documented in case a specific clone board underperforms) |
| IMU | MPU-6050 only — no GPS, no LoRa, no SD card |
| Mount | Belt/keychain clip identical to the production wearable's clip |

```
data_logger/
  data_logger.ino      [OWNER: ______]  — standalone sketch, own SoftAP + WebSocket server
  imu_read.h/.cpp        — same MPU-6050 read/calibrate logic as wearable's sensors.h, so
                            the two datasets are directly comparable
  ws_stream.h/.cpp        — 100Hz, one JSON sample per WebSocket message, no on-device buffering:
                            {"trial_id": "...", "label": "...", "t_ms": ..., "ax":.., "ay":.., "az":..,
                             "gx":.., "gy":.., "gz":..}
```

**Companion web page**: served from the rig or a local HTML file, connects via WebSocket, lets the operator set `trial_id`/`label` before each run, accumulates incoming JSON client-side, and offers a **Download CSV** button (Blob-based, browser-native — matches the CSV schema `validate_fsm.py` expects) so the file lands directly on the phone or laptop being used in the field, no server round-trip needed.

Pin map:

| Function | GPIO |
|---|---|
| I2C SDA (MPU-6050) | GPIO8 |
| I2C SCL (MPU-6050) | GPIO9 |
| Trial-marker button | GPIO2 |

## 7.3 `validate_fsm.py` — Baseline Derivation, Not Just Pass/Fail Checking

This is a validation-and-derivation script, not a trained ML classifier — it runs the actual FSM logic from §6 against collected data and lets the data confirm or adjust the thresholds, with safeguards against overfitting a small sample.

**Pipeline:**

1. **Feature extraction** — for every logged trial (CSV from §7.2), compute the exact windowed features `detection.cpp` checks: rolling `A_m`, freefall-duration counter, post-impact stillness-σ, gyro roll/pitch-rate std. Must mirror the firmware's math exactly, or the derived baseline doesn't transfer back to the device — **`[OPEN]`**: confirm this script's environmental (ground-shock/wave-motion) math matches `detection.cpp`'s actual implementation before trusting that part of the output, since an approximation here would produce untrustworthy numbers for that class specifically.
2. **Class separation** — split trials into positive (fall/skid/impact/environmental) vs. negative (walking/running/jumping/vehicle-ride).
3. **Baseline derivation** — for each threshold constant (0.40g freefall, 3.00g impact, 0.15g stillness-σ, 330°/s roll-rate), compute where the positive/negative distributions in *your* data actually separate — ROC curve + Youden's J statistic per parameter, not a manual guess.
4. **Leave-one-trial-out cross-validation** — hold out one trial, derive thresholds from the rest, test on the held-out trial, repeat for every trial in the dataset. This is the safeguard against reporting an inflated, overfit accuracy number from a small sample (~45 trials total) — do not skip this step.
5. **Detect-and-cancel via the full FSM sequence** — apply derived thresholds through the actual state machine (freefall→wait-impact→stillness), not a static per-sample threshold check. A single high-g sample without the full sequence should not fire, matching how the firmware itself behaves.
6. **Output:**
   - Full confusion matrix (per event type vs. every negative class)
   - Sensitivity / specificity from the cross-validated results
   - Side-by-side table: literature-default thresholds (§6) vs. data-derived thresholds, so any change is visible and defensible rather than a silent override of a cited source
   - Optional `--sweep` flag: cost-weighted threshold sweep around `impact_g`/`stillness_g` for sensitivity analysis, without silently changing the production constants

**Expected outcome:** derived thresholds landing close to the literature defaults is the *good* result — it means "confirmed against local data," not "we guessed wrong before." Don't manufacture a bigger change than the data supports just to have a more dramatic slide.

---

# 8. Backend, Frontend, and Demo Sequence

## 8.1 Backend

```
backend/netlify/functions/
  store.ts      — getStore("events"), getStore("devices")
  upload.mts    — POST /api/upload
                  body: { deviceToken, packetType, lat?, lon?, eventType?, battPct?,
                           name?, driveLinkConverted?, timestamp }
                  packetType="register" → upsert into devices store: {token, name, photoUrl}
                  packetType="alert"/"telemetry"/"false_alarm" → write into events store
  events.mts    — GET /api/events → events joined with device name/photoUrl from devices
                  store, newest first, polled every 2-3s
```

**Cloud dashboard uses HTTP polling, not WebSocket** — Netlify Functions/Edge Functions are stateless and cannot hold a persistent socket open; GuardianTrack's own dashboard already proved 2–3s polling is correct here.

## 8.2 Frontend

`react-leaflet` + `supercluster`. Zoomed out: clustered count badge, color = highest severity inside. Zoomed in: individual color-coded pins (red = active alert, amber = test, green = false alarm). Tap a pin → profile popup: name, photo (rendered from the stored `photoUrl`, fetched straight from Google's servers), token, timestamp, location.

```
frontend/src/
  App.tsx                 [OWNER: ______]  — 2-3s poll loop against /api/events
  components/MapView.tsx   [OWNER: ______]  — supercluster + react-leaflet, color-coded markers
  components/EventPopup.tsx — profile card, renders photoUrl directly
```

## 8.3 Demo Sequence

1. Show setup mode once: button-hold → local AP comes up → register on a phone → offline map shows a live pin from GPS → exit setup mode, WiFi off.
2. Show the wearable armed, worn at the waist.
3. Trigger `PKT_TEST` simulated fall — safe, repeatable, no real fall needed.
4. Cut to the cloud map: new red pin appears within one polling interval, with the registered name/photo in the popup.
5. Press the physical button → pin flips green, "false alarm" — demonstrates the full cancel path.

---

# 9. Roadmap — Deck Only, Not the Breadboard

- Custom single-board PCB (wearable already in fab-ready KiCad design)
- Packet-level HMAC authentication
- Off-body handling / high-risk ADL / partial-clip-loosening validation classes (named gap from §7.1)
- Multi-receiver deployment: one per barangay hall/health station, all feeding the same provincial dashboard
- Confirmed-accident log + diagnosis notes, server-side in Blobs

---

# 10. Open Items

1. Verify NeoPixel GPIO48 against your specific SuperMini board's silkscreen/vendor page.
2. Confirm SX1278 module's logic-level compatibility with SuperMini's I/O before first power-up.
3. `validate_fsm.py`'s environmental-class math must be checked against `detection.cpp`'s actual implementation before trusting that part of the output (§7.3).
4. Assign module owners throughout — required given the competition's AI-authorship rule.
5. Faculty adviser + Dean's recommendation letter — administrative, same critical path as the code.
