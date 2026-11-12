# GEMINI current-build DFM and footprint review

Read-only inspection on 30 October 2026 with pcbnew 10.0.6. No CAD or generator was changed. Board measured: `hardware/KiCAD Files/Antigravity Build/RAMS Wearable - PCB/GEMINI Build/RAMS_RevC.kicad_pcb`, SHA-256 `3b3cd5dfd37bc1eb89fa52a72fef844f725ba48c2dcbab6d405219559165fa06`.

## Findings requiring correction

1. **P1: DOST spacing has been relaxed rather than met.** `RAMS_RevC.kicad_pro:143` uses minimum clearance 0.15 mm, with Default class also 0.15 mm. `RAMS_RevC.kicad_dru:3-5` explicitly permits 0.15 mm inside J1. The supplied DOST Annex requires 0.254 mm pattern spacing. Actual J1 A6/A7 centers are (101.32,117.75)/(101.32,117.25) mm; the 90-degree-rotated pads are 0.30 mm wide along their separation, leaving 0.20 mm. A1/A4 similarly have 0.80 mm pitch and 0.60 mm pad width, leaving 0.20 mm. A rule waiver does not change either gap. Resolve supplier capability or connector/architecture before manufacturing; parent review's stricter-rule DRC quantifies all conflicts.

2. **P1: Selected switch wiring may short the input in one position.** Native board SW1 uses `SW_SPDT_PCM12`, value MSK12C02, with pad1=LDO_EN, pad2=LDO_IN, pad3=GND. A switch with pad2 as common therefore connects LDO_IN directly to GND in its 2–3 position. Verify the actual purchased switch's contact map and independently review the schematic; the intended enable selector would normally switch EN between IN and GND, not switch IN to ground. This is a circuit issue requiring electrical confirmation, not merely a courtyard mismatch.

3. **P2: Annular-ring and silkscreen rules do not encode the supplied process.** `RAMS_RevC.kicad_pro:157` sets minimum via annular width to 0.10 mm versus the Annex's 0.254 mm. Lines46/154 allow 0.10 mm default silk strokes and 0.08 mm text stroke versus the supplied 0.15 mm silkscreen line minimum. Correct global constraints and inspect actual objects; a passing current-rule report cannot establish DOST compliance. Do not infer that every current via fails: a 0.95/0.40 mm nominal via has a 0.275 mm ring and can satisfy the nominal minimum.

4. **P2: USB connector fit and drill selection remain unproven.** The board says TYPE-C-31-M-12 but uses a modified USB4105-named footprint, while inventory only establishes generic horizontal/vertical 16P connector purchases. Current shell pads have 1.0 mm circular drills and 1.6 mm copper diameters, yielding a nominal 0.30 mm ring: this is an improvement and no longer the original small-ring defect. However, no actual stake/peg measurements establish fit. Two NPTH locating holes remain 0.65 mm, absent from the supplied drill list; see local USB footprint lines138–146. Obtain exact geometry and approved finished-hole sizes instead of rounding blindly.

5. **P2: Antenna exclusion areas only prohibit tracks, vias and zone fill.** Four rule areas cover top/bottom copper: discrete antenna rectangle x100.5–105.5/y100.5–105.5 mm and module rectangle x116.5–134.5/y100.3–107.5 mm. Pads and footprints are allowed. Thus these areas alone cannot guarantee the complete no-metal/part keepouts. Compare actual final assembly, both radios, enclosure and battery against the selected antenna/module guide. This is a missing verification, not proof that a particular unmeasured part violates a specific clearance. The redundant standalone antenna with WROOM is addressed in electrical review.

## Current improvements and limits

- Main board contains zero track segments and 43 vias; it is still unrouted. Do not promote placement/courtyard checks to a functioning design.
- D2 now has an SMA footprint, matching the inventory's package class; do not repeat the older SOD-123 mismatch as an unchanged current-board finding.
- Q3 is now a six-pad SOT-23-6 footprint. Exact Shopee manufacturer identity still needs closure.
- All physical module pad41 instances inspected now have GND, correcting the previous blank-net observation.
- U1 bottom-row pads15–26 have 270-degree local rotation. Their listed unrotated 1.5×0.9 mm sizes do not imply overlap at 1.27 mm pitch.
- Board footprint library nicknames are empty in native inspection; verify qualified local-library associations and footprint parity. Native loading alone does not establish library synchronization.

Only targeted geometry and stored rules were inspected here. Parent review supplies fresh ERC/DRC/parity results, circuit findings and source snapshot. No supplier approval, physical fit test, RF measurement or assembly test occurred.
