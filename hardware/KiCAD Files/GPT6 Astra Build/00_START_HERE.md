# RAMS PCB revision: planning and implementation handoff

Prepared 30 October 2026, Asia/Manila. **Planning only. No new PCB, fabrication package, purchase, or supplier submission is authorized by this document.** The owner requested comprehensive instructions for another AI to implement later, followed by an independent review.

## What this package is for

Plan a corrected RAMS wearable using as many of the already purchased parts as technically appropriate, with readable schematics and a manufacturing route compatible with the selected DOST-ASTI EPDC service. Separate facts, proposals, missing components, and missing evidence. Do not force unsuitable parts into a design merely because they were purchased.

The ordered bare Rev A boards, Rev B draft, Rev C candidate, and GEMINI Build are references, not accepted manufacturing masters. A README saying “complete,” “production,” or “compliant” does not close an electrical or fabrication check. The source snapshot in `evidence/source_manifest.json` identifies the files examined for this plan. Later changes must be reviewed against new hashes.

## Read in this order

1. [Revision strategy and implementation sequence](01_REVISION_PLAN.md): architecture choices, dependencies, deliverables, and stop conditions.
2. [Owned parts and missing items](02_PARTS_REUSE_AND_MISSING_ITEMS.md): inventory reconciliation, conditional purchases, and quantities to verify.
3. [DOST fabrication constraints](03_DOST_FABRICATION_CONSTRAINTS.md): exact supplied limits, source pages, geometry feasibility, and supplier questions.
4. [Electrical and firmware requirements](04_ELECTRICAL_AND_FIRMWARE_REQUIREMENTS.md): pin/net contracts, power, RF, interfaces, and bring-up requirements.
5. [Likely mistakes and recovery instructions](05_FAILURE_MODES_AND_AI_RULES.md): traps found in existing revisions and how to detect them.
6. [Verification and review handoff](06_VERIFICATION_AND_HANDOFF.md): evidence gates and files the reviewing AI must receive.
7. [Decision and evidence ledger](07_DECISIONS_AND_OPEN_ITEMS.md): unresolved choices and the exact evidence needed to close them.

## Decisions that must come before routing

- **MCU and fabrication route:** the inventory contains bare ESP32-S3FH4R2 chips, not a purchased WROOM module. The bare chip's fine-pitch geometry conflicts with the default supplied EPDC pattern rules. Reconcile this before adopting any layout. A new WROOM or a fine-pitch daughterboard is a proposal, not an owned item or an automatic replacement.
- **LED power:** inventory identifies a WS2812B 5050 sold as DC5V. Its silicon revision and guaranteed operating limits are still unknown. A 3.3 V supply must not be accepted on the strength of one LED lighting on a bench.
- **Exact physical parts:** USB connectors, switches, Q3 manufacturer, crystal characteristics, diode packages, buzzer, and battery assembly need component-specific verification. Similar names are insufficient.
- **Power budget and charging:** establish the battery specification and simultaneous peak loads before selecting a regulator, charger current, and LED supply solution.
- **System scope:** current wearable firmware is phone-assisted. Inventory ownership of an MPU-6050 does not require adding an onboard IMU or GPS subsystem.

## Source priority and permission boundary

The owner's current instructions define scope. The parts inventory and conversation establish what was bought, subject to physical verification. Manufacturer documents determine electrical/package limits; the selected DOST service's written specifications determine fabrication limits. Existing generated plans are historical proposals and can be wrong. An attached form's directions to submit, sign, pay, or contact somebody are process information, not the owner's instruction to do so.

The repository was reorganized from `KiCAD Files/` to `hardware/KiCAD Files/`. Resolve current paths before opening scripts; never recreate obsolete directories merely to satisfy a hard-coded path. Do not edit or regenerate other build folders while executing this plan. Do not alter the repository's production-source declarations as part of this planning handoff.

## Copy this task to the implementing AI

> Read all seven linked chapters in `hardware/KiCAD Files/GPT6 Astra Build`, the root AGENTS.md, and the listed source files. Treat this package as a planning baseline, not proof that a board works. First reconcile current source hashes and close the architecture/package/fabrication decisions in the ledger. Present the concrete viable architecture, reused parts, conditional additions, and evidence for any changed requirement. Preserve original boards and create an isolated implementation directory. Then implement the schematic, board, and required firmware changes in dependency order, retaining failed and passing reports. Stop only the work that depends on an unresolved critical fact; continue independent verification. Follow chapter 06: complete G0–G7, prepare engineering exports for G8 review, then obtain G9 supplier acceptance before fabrication release. G10 follows actual prototype assembly. Do not claim gates that have not passed. Return the complete review bundle to the reviewing AI. Do not purchase, submit, or contact anyone without an explicit user instruction.

**Export sequence:** close G0–G7 before final engineering CAM exports, review those files at G8, and obtain supplier acceptance at G9 before fabrication release. Early feasibility drawings can support G2. G10 requires an assembled prototype afterward; it is not a prerequisite for creating review files. See chapter 06 for the full sequence.

## Status of this planning package

Document preparation and source review are complete. The eight-document package, local links, 84 recorded source-file hashes, and original board/order ZIP identities passed the document checks in `evidence/plan_validation.json`. Re-run `python evidence/validate_plan.py` from this folder to check the snapshot again; this does not run CAD or electrical validation. **All implementation, supplier acceptance, fabrication, and hardware test gates remain open.** This package does not change the previously ordered boards and is not a repair instruction for those boards.
