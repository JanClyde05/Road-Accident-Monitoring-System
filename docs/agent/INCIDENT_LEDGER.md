# Incident Ledger

Append-only record of defects that cost field time. Every entry names the
regression check that would have caught it, or explains why no static check is
possible. Entries are never deleted; a superseded entry gets `Status: superseded`
and a pointer to its replacement.

Status values: `open` (defect present), `fixed` (code changed, check passes),
`accepted` (risk accepted, check downgraded to WARN), `superseded`.

| ID | Title | System | Severity | Status | Check |
| --- | --- | --- | --- | --- | --- |
| INC-001 | Receiver bakes in the desktop LAN address | receiver firmware | high | open | FW-001..FW-005 |
| INC-002 | Rider profile serialized into every 10 Hz frame | android | high | open | AND-003 |
| INC-003 | Fire-and-forget GATT writes with no completion gate | android | critical | open | AND-002 |
| INC-004 | Streaming starts before MTU negotiation completes | android | critical | open | AND-001, FW-007 |
| INC-005 | Reconnect creates GATT clients faster than it closes them | android | high | open | test BLE-06 (runtime) |
| INC-006 | Wearable stops advertising after a drop | wearable firmware | high | open | FW-006 |
| INC-007 | Classic inquiry runs during BLE streaming | android | high | open | AND-007 |
| INC-008 | BLE session dies with the ViewModel | android | medium | open | AND-006, AND-008 |
| INC-009 | Duplicate canonical documents | repository | low | open | DOC-001 |
| INC-010 | Two Android trees share one applicationId | repository | critical | open | REPO-002 |
| INC-011 | Root script sprawl and a dead preview path | repository | medium | open | DOC-002, DOC-003 |
| INC-012 | Receiver app partition is at 99 percent | receiver firmware | medium | open | FW-009 |

---

## INC-001 - Receiver bakes in the desktop LAN address

- Detected: 2026-11-15, static review during the connectivity audit.
- Symptom: after a router or laptop change, uploads fail silently. The local
  queue fills; the dashboard shows nothing. Recovery requires USB access to a
  sealed enclosure.
- Signal: `[HTTP] Uploading ... to http://10.238.240.180:8888/api/upload`
  repeats and fails; `Queue: N pending` grows in the heartbeat line.
- Root cause: `config.h:44` is the only source of the backend address, and
  `http_upload.cpp` concatenates it directly at two call sites. There is no
  runtime override and the portal only collects Wi-Fi credentials.
- Fix: `CONNECTIVITY_FIX_PLAN.md`, stages 1-4.
- Regression check: FW-001 (no compiled private address), FW-002 (resolver used
  at both call sites), FW-003 (NVS cache), FW-004 (portal override), FW-005
  (discovery module present).
- Status: open.

## INC-002 - Rider profile serialized into every 10 Hz frame

- Detected: 2026-11-15, frame reconstruction from `buildTelemetryPacket`.
- Symptom: link degrades under load; telemetry gaps of several seconds.
- Signal: 694-byte frames at 10 Hz; three ATT writes per frame at a 247 MTU.
- Root cause: 13 profile fields plus a derived photo URL are rebuilt on every
  tick, although the firmware forwards the profile at most every 30 seconds
  (`bt_service.cpp:93`, `:180`).
- Fix: `BLE_STABILITY_PLAN.md`, cause 1.
- Regression check: AND-003 counts `profile.` references inside
  `buildTelemetryPacket` and fails on any.
- Status: open.

## INC-003 - Fire-and-forget GATT writes with no completion gate

- Detected: 2026-11-15, review of `writeBleBytes`.
- Symptom: "connected" but the dashboard freezes; occasional disconnect after a
  burst.
- Signal: `writeCharacteristic` return value discarded; no
  `onCharacteristicWrite` callback in the class; fixed 25 ms pacing.
- Root cause: Android allows one outstanding GATT operation per client. Chunks
  two through N return false and are dropped. The firmware reassembles truncated
  JSON and eventually clears its 2048-byte buffer.
- Fix: `BLE_STABILITY_PLAN.md`, cause 2.
- Regression check: AND-002 fails when `WRITE_TYPE_NO_RESPONSE` appears without
  `onCharacteristicWrite`.
- Status: open.

## INC-004 - Streaming starts before MTU negotiation completes

- Detected: 2026-11-15, ordering analysis of `onServicesDiscovered`.
- Symptom: the first seconds after connect are the most likely to drop.
- Signal: `requestMtu(512)` at `:440`, latch completed at `:450`, streaming
  loop launched at `:515`, `negotiatedMtu` still 23 until `onMtuChanged` at
  `:482`.
- Root cause: a 694-byte frame at a 23-byte MTU is 35 writes; at 25 ms pacing
  that is 875 ms of work for a 100 ms loop.
- Fix: `BLE_STABILITY_PLAN.md`, cause 3. Request 247, await the callback with a
  1200 ms bound, fall back to 23 and stream slowly but correctly.
- Regression check: AND-001 (MTU request), FW-007 (firmware MTU preference).
  The ordering itself is covered by test BLE-01.
- Status: open.

## INC-005 - Reconnect creates GATT clients faster than it closes them

- Detected: 2026-11-15, review of the reconnect path.
- Symptom: ten reconnects work, then every attempt returns 133 until the app is
  force-stopped.
- Signal: `connectBleGatt` creates a client per attempt; `close()` appears only
  in the disconnect and timeout branches; the 15-second latch can overlap a
  pending attempt.
- Root cause: leaked `BluetoothGatt` clients exhaust the per-app limit.
- Fix: `BLE_STABILITY_PLAN.md`, cause 4. Single-flight mutex, close before
  connect, exponential backoff with a cap.
- Regression check: none static. Runtime verification is test BLE-06
  (`dumpsys bluetooth_manager` client count stable across cycles). A lint rule
  cannot see call ordering across coroutines, and a false positive here would be
  worse than the manual test.
- Status: open.

## INC-006 - Wearable stops advertising after a drop

- Detected: 2026-11-15, firmware review.
- Symptom: "cannot connect" for seconds after a drop, then it works again.
- Signal: advertising restart lives in `btServiceUpdate()` behind
  `_oldDeviceConnected` and a blocking `delay(200)`.
- Root cause: the advertising window depends on main-loop scheduling. LoRa TX,
  buzzer patterns, and NeoPixel animation all delay it.
- Fix: `BLE_STABILITY_PLAN.md`, cause 5. `advertiseOnDisconnect(true)`.
- Regression check: FW-006.
- Status: open.

## INC-007 - Classic inquiry runs during BLE streaming

- Detected: 2026-11-15, review of `startBluetoothDiscovery`.
- Symptom: drops that correlate with opening the scan screen.
- Signal: `startDiscovery()` and `startScan()` in the same function; no
  `cancelDiscovery()` before `connectGatt`.
- Root cause: Classic inquiry competes for the same controller and antenna.
- Fix: `BLE_STABILITY_PLAN.md`, cause 6. BLE-only scanning, stop before connect,
  single-flight auto-connect.
- Regression check: AND-007.
- Status: open.

## INC-008 - BLE session dies with the ViewModel

- Detected: 2026-11-15, ownership review.
- Symptom: drop after navigating away or after the process is trimmed.
- Signal: `Esp32SyncEngine` constructed in `RamsViewModel` (`:65`); the
  foreground service holds only a wake lock; no `android:name` Application class.
- Root cause: the streaming scope is tied to a UI-scoped object.
- Fix: `BLE_STABILITY_PLAN.md`, cause 7. Application-scoped session, service
  binding, delete the SPP path.
- Regression check: AND-006, AND-008, AND-005.
- Status: open.

## INC-009 - Duplicate canonical documents

- Detected: 2026-11-15, hash comparison.
- Symptom: two copies of the methodology log drift; an agent updates the wrong
  one.
- Signal: identical SHA256 `2A4F5EF0...` for the root and `docs/` copies.
- Root cause: a document was copied to the root instead of linked.
- Fix: `ROOT_REORG_PLAN.md`, stage 1.
- Regression check: DOC-001.
- Status: open.

## INC-010 - Two Android trees share one applicationId

- Detected: 2026-11-15, inventory.
- Symptom: a fix compiles, is tested, and never reaches the phone because the
  installed APK came from the other tree.
- Signal: `com.aistudio.rams.wkqmzb` declared in both
  `apps/android_app/app/build.gradle.kts` and
  `apps/new_ai_applications/mobile_ai_app/app/build.gradle.kts`; 219 versus 100
  tracked files; the copy lacks the AI assets and the capped reconnect loop.
- Root cause: an exported copy was kept as a second source of truth.
- Fix: `ROOT_REORG_PLAN.md`, stage 3. Archive the copy, keep `apps/android_app`.
- Regression check: REPO-002.
- Status: open.

## INC-011 - Root script sprawl and a dead preview path

- Detected: 2026-11-15, launcher trace.
- Symptom: `apps/android_app/preview_web.bat` changes into `apps\` and calls a
  script that only exists at the repository root, so the preview never starts
  from that launcher.
- Signal: `cd /d "%~dp0.."` followed by `call preview_mobile_app.bat`.
- Root cause: scripts live at the root and rely on the caller's working
  directory instead of an explicit path.
- Fix: `ROOT_REORG_PLAN.md`, stage 2.
- Regression check: DOC-002 (root script count), DOC-003 (navigation links).
- Status: open.

## INC-012 - Receiver app partition is at 99 percent

- Detected: 2026-11-15, baseline compile.
- Symptom: adding the discovery resolver can overflow flash, and the failure
  looks like a random link error rather than a budget problem.
- Signal: `Sketch uses 1304383 bytes (99%) of program storage space. Maximum is
  1310720 bytes.` That is 6,337 bytes of headroom.
- Root cause: default partition scheme, no OTA in use.
- Fix: `CONNECTIVITY_FIX_PLAN.md`, build budget section. Build and flash with
  `PartitionScheme=huge_app`.
- Regression check: FW-009 (flasher selects a roomier partition).
- Status: open.

---

## Adding an entry

1. Copy the template, assign the next `INC-` number, keep the table row sorted.
2. Fill `Signal` with something a person can grep for in a log, not a feeling.
3. Name the check, or write one sentence explaining why automation cannot see it.
4. Add the corresponding lesson to `LESSONS.md` if the mistake is general.
5. Do not delete. Supersede.
