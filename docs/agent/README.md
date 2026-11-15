# Agent Engineering System

Plans, checks, and records that keep the RAMS fixes honest across OpenCode,
Codex, and Antigravity.

Start here when you are about to change firmware, the Android app, or the
repository layout.

## Documents

| Document | Use it when |
| --- | --- |
| [`CONNECTIVITY_FIX_PLAN.md`](CONNECTIVITY_FIX_PLAN.md) | The receiver cannot reach the desktop after an IP or port change |
| [`BLE_STABILITY_PLAN.md`](BLE_STABILITY_PLAN.md) | The phone and wearable keep disconnecting, or telemetry stalls while "connected" |
| [`ROOT_REORG_PLAN.md`](ROOT_REORG_PLAN.md) | Moving scripts, removing duplicates, repairing links |
| [`AI_TOOLING_MATRIX.md`](AI_TOOLING_MATRIX.md) | Installing skills or MCP servers for any agent |
| [`INCIDENT_LEDGER.md`](INCIDENT_LEDGER.md) | Recording a defect, or checking whether one is already known |
| [`LESSONS.md`](LESSONS.md) | Before proposing an approach that resembles a past mistake |
| [`VERIFICATION_LOG.md`](VERIFICATION_LOG.md) | Generated snapshot; do not edit |
| [`verification-log.jsonl`](verification-log.jsonl) | Append-only run history |

## Runbook

```powershell
# static invariants, about 3 seconds
python scripts/verify/check_invariants.py

# invariants plus every build, about 6-10 minutes on a cold cache
powershell scripts/verify/verify_all.ps1 -Build all

# one subsystem
powershell scripts/verify/verify_all.ps1 -Build receiver
```

Exit codes: `0` pass, `1` at least one FAIL (or a requested build failed).

Regenerate the markdown snapshot after a fix:

```powershell
python scripts/verify/check_invariants.py --md docs/agent/VERIFICATION_LOG.md
```

## Baseline

Recorded on 2026-11-15 against commit `1d04dbd`, before any fix:

| Area | FAIL | WARN | PASS |
| --- | --- | --- | --- |
| Receiver connectivity | 5 | 1 | 0 |
| Wearable BLE | 1 | 2 | 0 |
| Android BLE | 5 | 3 | 0 |
| Repository | 3 | 4 | 2 |
| Secrets | 0 | 0 | 1 |
| **Total** | **14** | **10** | **3** |

Every FAIL is intentional. A checker that passes on a broken tree is decoration.
The expected sequence is: implement a stage, re-run, watch that stage's checks
turn green, leave the rest red.

The WARN total is checkout-dependent by one. The main checkout carries an
untracked `Working Code - Do Not Touch/` at the root, so `REPO-001` reports WARN
there and PASS in the clean worktree. The 14 FAIL set is identical in both.

## What "verified" means here

1. The invariant check passes for the area you touched.
2. The relevant build compiles from a clean shell.
3. The acceptance test for that stage was run on hardware, or is explicitly
   listed as pending with a reason.
4. The run is appended to `verification-log.jsonl`.

Static checks cannot see call ordering across coroutines, GATT client counts, or
radio behavior. Those are covered by the test tables in the plans (`BLE-01`
through `BLE-08`, `NET-01` through `NET-07`) and require an ESP32-S3 and an
Android phone.

## Definition of done

- `python scripts/verify/check_invariants.py` reports zero FAIL.
- `verify_all.ps1 -Build all` passes, including the receiver at its final
  partition scheme.
- The acceptance matrix for each plan has been executed and recorded.
- No document exists in two places, and no two trees build the same
  applicationId.
- `SEC-001` passes with real MCP configs installed.

## Adding a check

Add it to `scripts/verify/check_invariants.py` with a stable `AREA-NNN` id, a
severity, a `fix` anchor into one of these documents, and evidence as
`path:line`. Then reference it from the incident and the lesson.

Checks are written to fail on the defect, not to describe the ideal. If a check
cannot express the defect without a parser for a specific file format, prefer a
runtime test entry in the plan over a brittle regex.

## Handoff

- Physical verification is blocked until an ESP32-S3 receiver, a wearable, and an
  Android phone are on the bench.
- The main checkout (`D:\Antigravity\Projects\Danger Monitoring System V2`) has
  pre-existing uncommitted hardware changes. Port these artifacts additively; do
  not run a bulk move there without a fresh `git status`.
- Tooling installs are dry-run by default. Nothing in this folder writes to the
  user profile without `-Apply`.
