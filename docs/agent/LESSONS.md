# Lessons

Durable rules distilled from the incident ledger. A lesson is only worth writing
if it changes the next decision. Each one is tied to a check or to a test that
cannot be automated.

## The learning loop

```
signal  ->  incident  ->  lesson  ->  check  ->  fix  ->  verify  ->  retire
```

- `signal`: something observable in a log, a build, or a hash. Not an impression.
- `incident`: one row in `INCIDENT_LEDGER.md` with an `INC-` number.
- `lesson`: the general rule this incident teaches. It goes here.
- `check`: an automated gate when the defect is statically visible. Otherwise the
  entry says which runtime test covers it.
- `verify`: `scripts/verify/verify_all.ps1`, recorded in
  `docs/agent/verification-log.jsonl`.
- `retire`: a check is removed only when the architecture makes the defect
  impossible, not when it becomes inconvenient.

Rules for the loop:

1. A red check is never silenced by editing the check. Fix the code or record an
   accepted risk in the ledger.
2. Every new incident adds a lesson. Every lesson either adds a check or states
   why automation is blind to it.
3. The ledger is append-only. Supersede, never delete.
4. Model, dataset, and hardware findings also go to `MEMORY_MAP.md`, per the
   repository logging directive. This file is about engineering behavior, not
   model specifications.

## Lessons

### L-01 - A default that can be wrong is worse than no default

The receiver compiled a LAN address as the only way to find its backend. It was
right for exactly one network. A compile-time fallback is acceptable only when it
is empty by default and the runtime path is validated.

Enforced by FW-001, FW-002.

### L-02 - If a value changes per deployment, it is data, not a constant

IP, port, and host all change without a code change. They belong in NVS, a
discovery reply, or a form field. Anything else guarantees a reflash.

Enforced by FW-003, FW-004, FW-005.

### L-03 - "Connected" is not "delivering"

Two independent failure classes were hiding behind one symptom. The BLE link can
be up while the data path is dead. Instrument the write path, not just the
connection state.

Enforced by AND-002; metrics in `BLE_STABILITY_PLAN.md`, section 5.

### L-04 - Ordering bugs look like hardware bugs

Starting the stream before `onMtuChanged` turned a 694-byte frame into 35 writes.
That reads as "the ESP32 cannot handle 10 Hz" and sends you shopping for a new
module. Check negotiation order before blaming the radio.

Enforced by AND-001 and test BLE-01.

### L-05 - Fire-and-forget writes need an owner

`writeCharacteristic` returning false is the API telling you the operation was
refused. Ignoring the return value converts a protocol error into silent data
loss. Every write needs a completion gate and a timeout.

Enforced by AND-002.

### L-06 - When two radios share a controller, serialize the scans

Classic inquiry during a BLE session is not "extra load"; it is a different
physical sweep. Scan on one transport, stop before connecting.

Enforced by AND-007.

### L-07 - Ownership must outlive the UI

A connection owned by a ViewModel dies with the screen. The foreground service is
the right lifetime anchor, and it must actually own the session, not just hold a
wake lock.

Enforced by AND-006, AND-008.

### L-08 - One source of truth, verified by hash

Identical files in two places are duplicates today and divergent tomorrow. The
checker compares hashes instead of trusting filenames.

Enforced by DOC-001 (documents), REPO-002 (applicationId), REPO-003 (desktop
entry point).

### L-09 - A launcher that depends on the caller's working directory is broken

`cd /d "%~dp0.."` plus `call script.bat` works only from the directory the author
happened to use. Resolve paths explicitly with `%~dp0`, and keep the root free of
scripts.

Enforced by DOC-002, DOC-003.

### L-10 - Measure the budget before adding the module

The receiver had 6 KB free and already reported 99 percent. A plan that ignores
the partition table ships a link error. Check the headroom first, then pick the
partition.

Enforced by FW-009.

### L-11 - Backward compatibility is cheaper than a new message type

Sending the profile on a 30-second cadence inside the existing frame keeps old
firmware working. A `PROFILE` type would have been cleaner and would have
silently dropped rider identity on every unit that had not been reflashed.

Recorded in `BLE_STABILITY_PLAN.md`, cause 1.

### L-12 - Fix the tree the build actually uses

Two Android trees shared one applicationId. Any fix applied to the copy would
have compiled, passed review, and never reached a phone. Find the canonical tree
before the first edit.

Enforced by REPO-002.

### L-13 - Windows PowerShell 5.1 poisons every UTF-8 write with a BOM

`Out-File -Encoding utf8` and `Set-Content -Encoding UTF8` emit EF BB BF. Git
then stores the BOM as part of the first line, so a commit subject begins with
an invisible character and every TOML or JSON consumer sees a parse error that
points nowhere useful. Use `[System.IO.File]::WriteAllText` with
`UTF8Encoding($false)` for any file another tool must read.

Caught by inspecting the subject bytes of `8f31457`; the amend removed it.

### L-14 - A comment and a UI string are not evidence of a feature

`lora_rx.cpp:342` promised a "Desktop App Ping Monitor" and
`SettingsScreen.kt:1608` promised a logger; neither existed in the desktop
consumer. Verify the consumer, not the producer.

Enforced by RNG-005.

### L-15 - Never measure a millisecond with a blocking network call

A 15 s timeout in the receive path is 60x the window being measured. Pings must
be logged over direct USB serial first, and any Wi-Fi upload path must be
isolated in an asynchronous task that drops stale packets rather than queueing
them.

Enforced by RNG-004.

### L-16 - Before optimising a Compose screen, confirm which field is churning

`beamAperture` looked noisy but is quantized to five discrete values; the cost
was `yawDegrees` alone driving WebView JavaScript bridge evaluations at 50 Hz.
Measure the individual field rate, not the enclosing data class.

Enforced by PERF-001, PERF-002.

### L-17 - A voltage divider must sit between the measured rail and ground

The prototype FCS circuit connected the divider between `+3.3V` and `GND`,
reading 1.65 V at all times regardless of actual cell voltage. A battery divider
must sit between `VBAT` and `GND`. Never connect the top of a battery sense
divider to a regulated output.

Documented in `HARDWARE_REVISION_PLAN.md` and INC-019.

### L-18 - Toolchain type names are exact; watch capitalization across cores

In ESP32 Arduino Core 3.3.5, the UDP socket type is `WiFiUDP` (all caps), not
`WiFiUdp`. Case mismatches cause immediate compile aborts. Always check header
declarations in the active ESP32 framework version before introducing network
classes.

Enforced by receiver compile gate.

### L-19 - Arduino-ESP32 classic BLE lacks NimBLE convenience methods

`pAdvertising->advertiseOnDisconnect(true)` is a NimBLE-only extension and does
not exist in the standard Arduino-ESP32 BLE library. The classic BLE stack
requires re-triggering advertising explicitly in the server's `onDisconnect`
callback via `pServer->startAdvertising()`.

Enforced by FW-006 and wearable compile gate.

### L-20 - Verify link targets against current filenames before committing docs

`RescuerForm.cs` was renamed to `Program.cs` during the AI dashboard rework, but
documentation references remained pointed at the old file, breaking navigation.
Cross-reference checks must validate physical path existence for all documentation
links.

Enforced by DOC-003.

### L-21 - Project name migrations require complete path audits

When renaming a project or workspace directory, all absolute and relative
`file:///` URIs in README and index documentation must be audited and updated.
Leaving retired project names (`Danger Monitoring System V2`) creates 404 links
and violates workspace naming directives.

Enforced by DOC-003 and Project Name Authority rule.

## Corrections made during this audit

These are the mistakes in the analysis itself. Keeping them prevents the same
wrong assumption from being reintroduced.

| Initial assumption | What the evidence showed | Consequence |
| --- | --- | --- |
| The wearable firmware holds the hardcoded backend IP | The wearable talks BLE only; the receiver owns the HTTP upload | The connectivity plan targets `firmware/receiver_withDesktop`, not the wearable |
| The app under test is `apps/new_ai_applications/mobile_ai_app` | That tree is a stale copy; `apps/android_app` has the AI assets and the newer sync engine | All Android citations and checks were retargeted |
| The disconnects are payload saturation | The direct trigger is the MTU ordering race plus ungated writes; payload size amplifies it | Causes are ranked, and the first fix is ordering and flow control, not a lower rate |
| Port 8888 is the desktop UI server | 8888 is a hand-rolled TCP bridge; the UI is loopback-only on 8080-8095 | Health probes and discovery target 8888, and the bridge needs a real `/api/health` route |
| `git status` clean means the worktree matches the deployed code | The main checkout has untracked copies and modified binaries | The reorg plan treats the main checkout as a separate, reviewed step |

## What worked and is being kept

- JSON over BLE. After the fixes a frame is about 202 bytes, one write at a 247
  MTU. A binary protocol would add risk with no measured gain.
- The 30-second profile cadence. It matches the firmware throttle and keeps old
  units working.
- The LoRa profile relay. Identity flows phone to wearable to receiver to desktop
  without a second radio.
- The 8888 ingestion contract. Old receivers keep working while the desktop gains
  discovery.
- The captive portal flow. It stays the recovery path when broadcast is blocked.
- The local upload queue. It already survives a dead backend; the plan only makes
  the backend address recoverable.

## Anti-patterns to reject on sight

- Raising a delay to make a queue drain. It hides the throughput defect.
- Catching an exception and logging nothing. It is how the 8888 bind failure
  stayed invisible.
- Adding a second transport "for compatibility" without removing the first.
- Copying a directory to "keep a backup" in the working tree. Use git.
- Editing a checker to make a red run green.
