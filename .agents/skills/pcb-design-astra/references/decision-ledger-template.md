# PCB decision and evidence ledger

Use one row per material requirement, source-dependent decision, unresolved issue, or claim. Keep owner requirements distinct from datasheet requirements, standards, engineering targets, and assumptions. Duplicate the table or move long source notes into separate entries when a row becomes difficult to audit.

| ID | Question / requirement | Category | Decision or current value | Source, revision, exact location | What it supports / does not support | Assumptions and alternatives | Status | Acceptance check / closure evidence | Affected files |
|---|---|---|---|---|---|---|---|---|---|
| D-01 |  |  |  |  |  |  | unverified |  |  |

## Status definitions

- **verified** — the named evidence directly supports the claim at the stated scope.
- **partially verified** — evidence supports a narrower claim or leaves a meaningful condition open.
- **unverified** — evidence has not been obtained or the check has not been run.
- **contradicted** — available evidence conflicts with the stated claim or decision.
- **not applicable** — the check does not apply to this design or task; state why.

## Calculation record

For every high-impact calculation, preserve:

- equation and units;
- each input, its source, tolerance, min/typ/max condition, and date/version;
- operating conditions and omitted effects;
- result and independent recomputation or sanity check;
- what measurement, supplier input, or owner decision would close the remaining gap.

## Change plan record

| Change ID | Proposed change | Reason and supporting source | Files / objects affected | Acceptance criteria | Risks / dependencies | Pre-change identity | Result and rerun evidence |
|---|---|---|---|---|---|---|---|
| C-01 |  |  |  |  |  |  |  |

