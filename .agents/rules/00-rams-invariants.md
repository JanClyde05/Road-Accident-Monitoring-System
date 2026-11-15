# RAMS Invariants (Machine-Checked)

These rules are not style preferences. Each one maps to a failure that already
happened in this project, and each one is enforced by a check in
`scripts/verify/check_invariants.py`. A change that breaks a check must either
fix the root cause or amend the ledger in `docs/agent/INCIDENT_LEDGER.md` with a
stated reason. "It compiles" is not verification.

## Networking

1. No private IPv4 address may be compiled into shipped firmware. The receiver
   resolves its backend at runtime (NVS last-good, UDP discovery, portal entry)
   and uses a compile-time value only as a last-resort fallback.
2. Upload code must call `backendBaseUrl()`. It must never concatenate
   `BACKEND_URL` directly, so the resolved host cannot be bypassed by accident.
3. The backend port is data, not a constant. Discovery responses carry host and
   port; changing the desktop port must not require a reflash.

## BLE

4. Telemetry frames stay small and fixed-shape. The rider profile is sent on
   connect and on a slow interval, never inside every 10 Hz frame.
5. Every GATT write is flow-controlled by `onCharacteristicWrite` or an
   equivalent completion gate. Fire-and-forget writes at 10 Hz are forbidden.
6. Requested MTU is 247. Larger requests are unsupported in practice on the
   ESP32-S3 + Android pair and cause silent truncation or write failures.
7. Exactly one GATT client exists per process. Reconnect is single-flight, closes
   the previous client, and backs off exponentially.
8. Classic discovery must never run while a BLE connection or BLE scan is active.
9. The peripheral advertises on disconnect (`advertiseOnDisconnect(true)`), not
   from a polling loop, so a reconnect cannot land in a dead advertising window.
10. BLE ownership outlives an Activity or ViewModel. Streaming is owned by an
    application-scoped session bound to the foreground service.

## Repository

11. One canonical copy of each document. `docs/` wins over a root duplicate.
12. The repository root holds only entry-point documents and directories. Scripts
    live under `scripts/`, launchers under `scripts/launchers/` or
    `tools/launchers/`.
13. Internal links use paths that resolve. Absolute `file:///d:/...` links are
    allowed only when the target exists on the current machine.

## Tooling

14. MCP servers and agent skills are declared once and shared by OpenCode, Codex,
    and Antigravity. Secrets are environment references, never literals in a
    committed config.

## Change Protocol

- Run `python scripts/verify/check_invariants.py` before claiming a fix.
- Run `powershell scripts/verify/verify_all.ps1 -Build all` before a release.
- Every new incident gets an `INC-xxx` entry, a lesson, and either a new check or
  a written justification for why the check cannot be automated.
