# BLE Stability Plan

Why the phone and the wearable keep disconnecting, and what to change so the
link stays up for a full ride.

Status: proposed. Enforced by `FW-006` through `FW-008` and `AND-001` through
`AND-008` in `scripts/verify/check_invariants.py`.

Source tree: all Android citations refer to `apps/android_app`, the canonical
application (219 tracked files, AI assets present, capped reconnect loop). A
second copy exists at `apps/new_ai_applications/mobile_ai_app` (100 tracked
files, missing `rams_distilled_knowledge.jsonl` and `voice_wake_patterns.json`,
older sync engine). Fixing the duplicate instead of the canonical tree is the
single most likely way to ship a build that still disconnects. See
`ROOT_REORG_PLAN.md`, stage 1.

---

## 1. Symptom

Reported behavior: the Android app connects, streams for a short while, drops,
reconnects, drops again. Sometimes it reconnects on its own within seconds;
sometimes it needs a manual tap. Telemetry in the desktop dashboard shows gaps
that do not correlate with LoRa range.

Two distinct failure classes are being conflated by the word "disconnect":

| Class | What the user sees | What is actually broken |
| --- | --- | --- |
| Link drop | "Disconnected (status: 133)" or 8 | Radio/controller: scan contention, advertising gap, GATT client leak |
| Silent stall | Still "connected", dashboard freezes | Data path: dropped writes, oversized frames, MTU race |

Both must be fixed; fixing only one produces the "it works for two minutes"
pattern.

## 2. Measured baseline

A representative telemetry frame was rebuilt from the exact field list in
`buildTelemetryPacket` (`Esp32SyncEngine.kt:954`) using realistic rider data:
202 bytes for sensor-only telemetry, 694 bytes when the profile is included
(456 of those bytes are profile and photo-link data).

At 10 Hz that is 6.9 KB/s of application payload, three ATT writes per frame at
a 247 MTU, and thirty GATT writes per second issued with no acknowledgement.

## 3. Root-cause chain

```
connect
  |
  +-- requestMtu(512) issued, streaming starts in the same callback
  |      negotiatedMtu is still 23 for the first frames
  |      694 B / 20 B = 35 writes, 25 ms apart = 875 ms per frame
  |
  +-- 35 writeCharacteristic() calls, Android allows one in flight
  |      calls 2..35 return false, return value ignored
  |      chunks dropped, JSON truncated, firmware buffer fills with garbage
  |
  +-- no backpressure, no failure counter, no visible error
  |
  +-- reconnect storm: new BluetoothGatt per attempt, old one not closed
  |      client table fills, status 133, more reconnects
  |
  +-- Classic inquiry running while connected
  |      LE controller starved, link supervision timeout
  |
  +-- peripheral not advertising during the gap
         reconnect attempts fail, app backs off, user sees a dead device
```

## 4. Causes and fixes

<a id="cause-1"></a>
### Cause 1 - The profile rides in every 10 Hz frame

Evidence: `Esp32SyncEngine.kt:954-986` serializes 13 profile fields, including
`driveLink` and the derived `photoUrl`, into each telemetry packet.

Mechanism: a 694-byte frame is 3.4 times larger than necessary. Every additional
chunk is another chance to hit the one-outstanding-operation limit described in
Cause 2, and every retransmission costs a connection interval. The firmware only
needs the profile once per 30 seconds; it already throttles the LoRa profile
broadcast at `bt_service.cpp:93` and `:180`.

Fix: include the profile on the first frame after connect and every 30 seconds,
not on every frame.

```kotlin
private var lastProfileSentMs = 0L

private fun buildTelemetryPacket(
    gps: GpsData, imu: ImuData, profile: RiderProfile,
    includeProfile: Boolean
): String = JSONObject().apply {
    put("type", "TEL")
    if (includeProfile) {
        put("token", profile.token)
        put("rider", profile.riderName)
        put("plate", profile.plateNumber)
        put("contact", profile.emergencyContactPhone)
        put("blood", profile.bloodType)
        put("category", profile.userType)
        put("vehicleModel", profile.vehicleModel)
        put("emergencyContactName", profile.emergencyContactName)
        put("emergencyContactPhone", profile.emergencyContactPhone)
        put("emergencyPhone", profile.emergencyContactPhone)
        put("allergies", profile.allergies)
        put("driveLink", profile.driveLink)
        put("photoUrl", RiderProfile.formatDirectDriveUrl(profile.driveLink))
    }
    // sensor fields unchanged
}.toString()
```

Cadence in the streaming loop:

```kotlin
val now = System.currentTimeMillis()
val withProfile = lastProfileSentMs == 0L || now - lastProfileSentMs >= 30_000L
if (withProfile) lastProfileSentMs = now
val payload = buildTelemetryPacket(gps, imu, profile, withProfile)
```

Why not a new `PROFILE` message type: older firmware ignores unknown types, so a
new type silently drops the profile on units that have not been reflashed. The
conditional-field approach is wire-compatible in both directions. Revisit only
after every field unit runs firmware that understands `PROFILE`.

Expected: 202 bytes steady state, one write per frame at a 247 MTU, 3.4 times
less radio time, and the 30-second profile refresh preserved.

<a id="cause-2"></a>
### Cause 2 - Fire-and-forget writes with no flow control

Evidence: `Esp32SyncEngine.kt:525-543` uses `WRITE_TYPE_NO_RESPONSE`, paces with
`delay(25L)`, and never implements `onCharacteristicWrite`. The return value of
`writeCharacteristic` is discarded.

Mechanism: Android permits a single outstanding GATT operation per client. The
second write in the loop returns `false`; the code does not care. Over a 10 Hz
loop this silently discards most chunks of any multi-chunk frame. The firmware
then reassembles a truncated JSON object, its `_rxBuffer` grows, and at 2048
bytes (`bt_service.cpp:83`) it is cleared wholesale, taking the next valid frame
with it. The link looks alive while the data path is dead.

Fix: acknowledge every write and retry the chunk that was refused.

```kotlin
private val writePermits = Channel<Unit>(Channel.CONFLATED)

override fun onCharacteristicWrite(
    gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic, status: Int
) {
    writePermits.trySend(Unit)
}

private suspend fun writeBleBytes(
    gatt: BluetoothGatt, rx: BluetoothGattCharacteristic, bytes: ByteArray
) {
    val payload = (negotiatedMtu - 3).coerceIn(20, 509)
    var offset = 0
    while (offset < bytes.size) {
        val size = minOf(payload, bytes.size - offset)
        val chunk = bytes.copyOfRange(offset, offset + size)
        writePermits.tryReceive()                    // clear any stale permit
        val accepted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            gatt.writeCharacteristic(rx, chunk, BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT)
        } else {
            rx.value = chunk
            rx.writeType = BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT
            gatt.writeCharacteristic(rx)
        }
        if (!accepted) { delay(10); continue }        // retry the same chunk
        if (withTimeoutOrNull(300) { writePermits.receive() } == null) {
            throw IOException("GATT write timed out at offset $offset")
        }
        offset += size
    }
}
```

`WRITE_TYPE_DEFAULT` costs one acknowledgement per chunk. At one write per 100 ms
and a 30-50 ms connection interval, that is free. Reliability is worth more than
the theoretical throughput of unacknowledged writes.

Also count failures instead of swallowing them, so the dashboard can show
`writeFail` and the next soak test has a number to compare.

<a id="cause-3"></a>
### Cause 3 - Streaming starts before MTU negotiation finishes

Evidence: `onServicesDiscovered` sets `activeBleGatt`, requests MTU 512 at
`:440`, and the latch at `:450` lets `runBleStreamingLoop` start immediately.
`negotiatedMtu` is 23 (`:108`) until `onMtuChanged` fires at `:482`.

Mechanism: the first one to three frames are cut into 20-byte chunks. A 694-byte
frame becomes 35 writes at 25 ms each, 875 ms of work for a 100 ms loop. The
backlog never drains; the controller queue saturates and the link drops.

Fix: wait for the MTU callback, bounded, before the first write.

```kotlin
private var mtuReady: CompletableDeferred<Int>? = null

// in onConnectionStateChange(STATE_CONNECTED)
mtuReady = CompletableDeferred()

override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
    negotiatedMtu = if (status == BluetoothGatt.GATT_SUCCESS) mtu else 23
    mtuReady?.complete(negotiatedMtu)
}

// in onServicesDiscovered, after enabling notifications
gatt.requestMtu(247)
negotiatedMtu = withTimeoutOrNull(1200) { mtuReady?.await() } ?: 23
```

Request 247, not 512. The ESP32-S3 and Android both support 247 reliably; asking
for 512 invites a re-negotiation and provides no benefit for 202-byte frames.
Handle `onMtuChanged` for the failure path as well: a failed request must fall
back to 23 and still stream, slowly but correctly.

<a id="cause-4"></a>
### Cause 4 - Reconnect creates clients faster than it closes them

Evidence: `connectBleGatt` (`:342`) calls `device.connectGatt(...)` on each
attempt. `gatt.close()` exists only in the disconnect branch (`:387`) and the
timeout branch (`:518`). `startPersistentBleReconnectLoop` (`:116`) is started
from the disconnect callback, and the 15-second latch can start a second attempt
while the first is still pending.

Mechanism: each leaked `BluetoothGatt` consumes a client slot. Android allows a
small fixed number per app; when exhausted, every connect returns status 133 and
the app loops forever. This is the "reconnects ten times then needs an app
restart" pattern.

Fix: one connection attempt at a time, always close before connect, exponential
backoff with a cap.

```kotlin
private val connectMutex = Mutex()

private suspend fun connectOnce(device: BluetoothDevice, ...): Boolean =
    connectMutex.withLock {
        activeBleGatt?.let { old ->
            runCatching { old.disconnect() }
            runCatching { old.close() }
        }
        activeBleGatt = null
        activeBleRxChar = null
        negotiatedMtu = 23
        mtuReady = CompletableDeferred()
        connectBleGatt(device, ...)      // creates exactly one client
    }
```

Backoff sequence: 500 ms, 1 s, 2 s, 4 s, 8 s, then 8 s steady. Reset to 500 ms
after 30 seconds of uninterrupted streaming. Cancel the reconnect job on manual
disconnect and on `onCleared`.

<a id="cause-5"></a>
### Cause 5 - The wearable stops advertising after a drop

Evidence: `bt_service.cpp:318-322` restarts advertising from `btServiceUpdate()`
only when `!_deviceConnected && _oldDeviceConnected`, with a blocking
`delay(200)` inside the main loop. ESP32 core 3.3.5 supports
`BLEAdvertising::advertiseOnDisconnect(bool)`.

Mechanism: the window between disconnect and the next `btServiceUpdate()` call is
when the phone retries. If the loop is busy with a LoRa transmission, a buzzer
pattern, or the NeoPixel animation, the wearable is invisible for hundreds of
milliseconds. The phone backs off, the user sees "cannot connect", and the unit
looks bricked until the next scan.

Fix: let the BLE stack re-arm advertising, and delete the polling branch.

```cpp
// bt_service.cpp, during service setup
pAdvertising->advertiseOnDisconnect(true);
```

Remove the `_oldDeviceConnected` restart block. Keep `_oldDeviceConnected` only
if another module reads it; otherwise delete the variable. The stack now
advertises the instant the link drops, before user code runs.

Also set connection parameters that survive a busy loop:

```cpp
pAdvertising->setMinPreferred(0x06);   // 7.5 ms
pAdvertising->setMaxPreferred(0x12);   // 22.5 ms
```

<a id="cause-6"></a>
### Cause 6 - Classic inquiry runs while BLE is connected

Evidence: `RamsViewModel.startBluetoothDiscovery()` (`:1033`) calls
`bluetoothAdapter.startDiscovery()` at `:1060` and `leScanner.startScan()` at
`:1109` in the same pass. Nothing cancels inquiry before `connectGatt`.

Mechanism: Classic inquiry is a continuous radio sweep. It shares the antenna
and controller with LE. On many phones it produces exactly the 133/timeout
pattern reported here, and it always reduces LE throughput. Discovery also
auto-connects from the scan callback (`:1084`) without a single-flight guard, so
several results can race into `connectWearableDevice`.

Fix: BLE only, and stop scanning before connecting.

```kotlin
// one transport
if (bluetoothAdapter?.isDiscovering == true) bluetoothAdapter.cancelDiscovery()
leScanner?.startScan(null, settings, leScanCallback)
```

```kotlin
// before connectGatt
runCatching { bluetoothAdapter?.bluetoothLeScanner?.stopScan(leScanCallback) }
runCatching { bluetoothAdapter?.cancelDiscovery() }
```

Keep a `connecting` flag that is set synchronously in the scan callback before
launching the coroutine, so two results cannot both start a connection.

If Classic discovery is still needed for legacy hardware, gate it behind a
debug screen and refuse to run it while `isSyncActive`.

<a id="cause-7"></a>
### Cause 7 - BLE ownership dies with the screen

Evidence: `RamsViewModel.kt:65` constructs `Esp32SyncEngine`. `RamsForegroundService`
acquires a wake lock only (`service/RamsForegroundService.kt`), and
`AndroidManifest.xml` declares no `android:name` Application class.

Mechanism: navigating away or letting the system trim the process tears down the
ViewModel, which cancels the streaming scope and disconnects. A foreground
service that does not own the connection cannot keep it alive. The user sees a
drop that correlates with using the map screen.

Fix: move the engine into an application-scoped holder and bind the service to
it.

```kotlin
class RamsApplication : Application() {
    val bleSession by lazy { BleSession(this) }
}
```

```xml
<application android:name=".RamsApplication" ...>
```

`BleSession` owns the scope and the single `Esp32SyncEngine`. The ViewModel
observes its `StateFlow` and forwards commands; it never constructs or cancels
the engine. `RamsForegroundService` calls `session.acquire()` on start and
`session.release()` on stop, so the notification and the connection have the
same lifetime.

The legacy SPP path (`connectivity/Esp32ConnectionManager.kt`, UUID
`00001101-...`) must be deleted or made unreachable. It is a second transport
that cannot talk to the NUS firmware; leaving it in the build is a trap for the
next contributor, and `startSimulation()` is the only caller today.

## 5. Instrumentation

Add these counters to `SyncStatus` and show them on the diagnostics screen. The
soak test is meaningless without numbers.

| Field | Source |
| --- | --- |
| `mtu` | `onMtuChanged` |
| `frameBytes` | payload length |
| `writesOk` / `writesRetried` | `writeBleBytes` |
| `writeTimeouts` | write gate |
| `disconnects` / `lastStatus` | `onConnectionStateChange` |
| `advertisedGapMs` | firmware serial log, connect timestamp minus disconnect timestamp |

Firmware side: log `[BT] disconnect -> advertising` from `onDisconnect` and a
`[BT] overflow` line whenever the RX buffer hits its cap.

## 6. Acceptance tests

| ID | Test | Pass condition |
| --- | --- | --- |
| BLE-01 | 60-minute ride simulation, screen off | Zero disconnects, `writeTimeouts = 0`, frame size ≤ 260 bytes steady state |
| BLE-02 | Background the app for 10 minutes, return | Stream never stops; no reconnect event |
| BLE-03 | Walk out of range for 30 s, return | Reconnect within 5 s, profile fields present, no 133 storm |
| BLE-04 | Toggle Bluetooth off/on | One reconnect attempt chain, backoff visible, success on adapter ready |
| BLE-05 | Open the scan screen while streaming | Link survives; scanning refuses to start |
| BLE-06 | Two reconnect cycles in a row | GATT client count stable, no leak in `dumpsys bluetooth_manager` |
| BLE-07 | Crash alert during streaming | Alert arrives with rider name, photo URL, and location from the last profile frame |
| BLE-08 | Legacy app build against new firmware | Telemetry still parsed; profile refresh still works |

## 7. Rollout order

1. Android: MTU wait, flow control, single-flight reconnect, scan discipline.
   These are independent of the firmware and fix the stall class immediately.
2. Firmware: `advertiseOnDisconnect`, MTU 247, RX overflow counter.
3. Android: application-scoped session and service ownership.
4. Android: remove the SPP path and simulation callers.
5. Profile cadence last, because it changes what the firmware sees and should be
   validated against a unit that has been reflashed.

Each step keeps the wire format compatible with the previous one.

## 8. Non-goals

- Increasing `delay(100L)` to 200 ms. That hides the throughput problem and
  halves the data rate without fixing the dropped chunks.
- Switching to a binary protocol. The JSON frame fits in one write after Causes 1
  and 3 are fixed; a protocol rewrite adds risk with no measured benefit.
- Moving telemetry to notifications. The direction is phone to wearable; notify
  would require an inverted design and firmware changes far beyond this scope.

## 9. Open questions

1. Does the wearable need the photo URL at all, or only the receiver? If the
   wearable only forwards it, the profile frame can shrink further.
2. Should the app keep streaming at 10 Hz when the vehicle is stationary? A
   motion-gated 2 Hz idle rate would cut radio time in traffic without losing
   crash resolution.
