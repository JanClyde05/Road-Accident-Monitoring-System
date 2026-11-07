# GEMINI Build review — 30 October 2026

**Verdict: not ready for fabrication or assembly.** The main board is unrouted, the schematic and board disagree substantially, the current checks use rules below the supplied DOST limits, and the design substitutes a WROOM module for the owner's purchased bare ESP32-S3FH4R2. The separate routing-test board also fails checks and the DOST track-width requirement.

This is a read-only review of a saved snapshot captured at **19:29:20 Asia/Manila**. The source folder is `hardware/KiCAD Files/Antigravity Build/RAMS Wearable - PCB/GEMINI Build`. No original CAD, circuit specification, generator or firmware was edited. Review copies, reports and previews are in this directory. Files open in KiCad may contain unsaved edits that are outside this review.

## 1. WROOM, the ceramic antenna, and DOST

The owner clarified during this review: **the intended MCU is the purchased bare S3 chip, with the purchased ceramic antenna; do not silently substitute WROOM-1.**

The earlier Rev C plan introduced WROOM-1 to avoid the bare chip's fine-pitch fabrication problem. That is an architectural alternative requiring a different purchased component. It is not a footprint correction or a way to use the already purchased bare chip on this board.

WROOM-1 has an integrated PCB antenna and 40 MHz crystal. Its normal carrier interface does not expose the bare chip's RF feed for attaching the loose B100 antenna. Thus the purchased ceramic antenna would be **unused in this WROOM-1 design**, not defective or useless in general. WROOM-1U is a different variant with an external antenna connector; it is not an automatic solution for a loose ceramic antenna. The specified WROOM-1-N4 also has no PSRAM in its ordering-table entry, contrary to the JSON description claiming 2 MB. [Espressif module datasheet v1.8, sections 1.1–1.2 and schematics](https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf).

The bare chip remains a valid design architecture, but **the existing land pattern cannot be called compatible with DOST's supplied process**. The original bare-chip footprint has 0.4 mm pitch and 0.2 mm-wide adjacent pads, leaving 0.2 mm gaps. The supplied Annex requires 0.254 mm minimum pattern space and 0.30 mm minimum pattern width. Board enlargement or hand soldering does not change those pad gaps. The current USB footprint has the same 0.20 mm gap conflict, so replacing only the MCU never solved all DOST problems.

DOST's supplied Citizen's Charter explicitly lists QFP/QFN assembly. The older claim that DOST simply forbids all QFN is wrong. Assembly service availability does **not** prove that this exact copper geometry can be fabricated. The precise conclusion is: the default supplied fabrication rules do not support the existing fine-pitch pattern; an exact-feature written exception, a capable fine-pitch fabricator, or a separately fabricated bare-chip daughterboard is needed. No supplier was contacted in this review. Source pages and measured original geometry are retained in [the DOST constraints chapter](../../03_DOST_FABRICATION_CONSTRAINTS.md).

## 2. Fresh checks and their limits

KiCad CLI/pcbnew version: **10.0.6**. DRC used zone refill in memory, without saving either original or snapshot board. All severity categories were requested, and the main-board run included schematic parity.

| Artifact / check | Result | Interpretation |
|---|---|---|
| Main `RAMS_RevC.kicad_pcb` | 68 footprints; **0 routed track segments**, 43 vias | Placed objects and ground zones do not make a complete circuit |
| Main schematic ERC | **0 errors, 0 warnings** | A narrow ERC pass; does not establish actual part numbers, numeric footprint mapping or board parity |
| Main PCB with stored rules | **99 unconnected-item errors**, 100 silkscreen warnings | Required routing remains absent |
| Main schematic/PCB parity | **279 warnings**: 165 net conflicts, 110 footprint/symbol mismatches, 1 field mismatch, 3 extra footprints | Includes naming/library/field differences as well as real endpoint/value conflicts; not 279 independent electrical failures |
| Main PCB with diagnostic DOST minima | **19 copper-clearance errors**, 99 unconnected items, 103 warnings | Restoring the supplied 0.254 mm spacing exposes USB pad gaps hidden by relaxed rules |
| `build/RAMS_RevC_route_test.kicad_pcb` | 510 track segments, 59 vias | Separate candidate; not the main board identified by the README |
| Route-test DRC with its own project settings | **91 errors + 100 warnings**, plus **29 unconnected items** | Errors: 66 track-width, 21 starved-thermal and 4 hole-clearance findings; schematic parity was not run on this differently named candidate |
| Route-test independent width inventory | 444 segments at **0.20 mm**, 66 at **0.15 mm** | **All 510 segments are below DOST's supplied 0.30 mm minimum**, including segments not flagged by the route-test's relaxed 0.20 mm minimum |

The diagnostic copy changed only check settings: minimum clearance/netclass clearances to 0.254 mm, annular-ring minimum to 0.254 mm, track minimum to 0.30 mm, hole minimum to 0.40 mm, copper-edge minimum to 0.30 mm and text stroke minimum to 0.15 mm; its custom override file was replaced with an empty rule set. Unspecified supplier limits were not invented. See `strict_diagnostic_changes.json`. This is a screening check, not full supplier DFM approval.

Raw reports: [ERC](erc.rpt), [main DRC/parity](drc.json), [strict DOST diagnostic](strict_dost_drc.json), [route-test DRC](route_test_drc.json), [native geometry summary](board_summary.json), [exported schematic netlist](schematic.xml), and [source hashes](source_manifest.json).

## 3. Priority findings and required corrections

### P1 — Resolve architecture and source disagreement before further routing

`circuit_spec.json:17–22` selects WROOM-1-N4, describes unsupported PSRAM and claims a Shopee/prototype source that does not match the inventory. The schematic generator separately hard-codes a different circuit instead of consuming the specification's component definitions. Its `SPEC_PATH` declaration is not evidence that it uses that source.

The module, separate ceramic antenna, external crystal and their support network are retained together. The schematic even labels them as preserved for old parity, while the board still carries their independent nets. A disconnected RF network adds no working antenna to WROOM-1. For the owner's intended bare-chip architecture, restore the exact FH4R2 symbol, package/EP/land/paste pattern, required rails, crystal and RF network from verified sources. Do not reuse WROOM pad numbers for the chip. For FH4R2, verify the variant-specific package drawing rather than the old generic EP4×4 footprint. [Espressif chip datasheet v2.2, pin and package sections](https://documentation.espressif.com/esp32-s3_datasheet_en.pdf).

**Closure:** one reviewed bare-chip pin/net contract, actual purchased components reconciled, and a feasible fabrication route before regenerating CAD. A module branch must remain a rejected/default-off alternative unless the owner changes this decision.

### P1 — Battery-protection sense connection is still wrong in the board/spec

The board/spec connect R5 from `DW_CS` to `B_MINUS`; the schematic connects R5 to system `GND`. The protection controller references cell negative internally and needs the intended system-side sense connection across the protection path. Returning both sense/reference to cell negative removes that intended sensing behavior. The existing six-pad Q3 mapping must still be qualified against the unidentified Shopee manufacturer's part, but the wrong R5 endpoint is independently actionable against the documented application circuit. [Referenced DW01A manufacturer datasheet, pin table/application](https://datasheet.lcsc.com/datasheet/pdf/7c412cac0dea0278008492f4ad08dd26.pdf?productCode=C42380662).

**Closure:** verify actual protector/MOSFET variants; correct the common circuit contract; prove `B_MINUS` and protected `GND` are separated except through the intended FET path; rerun endpoint/parity checks and later controlled protection tests. Do not repair only the drawing.

### P1 — Transistor symbol pins do not match physical footprint pad numbers

The schematic generator uses `Device:Q_PMOS` with pin numbers `G/S/D` and `Device:Q_NPN` with `B/C/E` (`build/01_build_schematic_astra.py:331,410`). Their selected SOT-23 footprints use pads `1/2/3`. The exported netlist retains letter-numbered pins, so a correct-looking circuit cannot be transferred reliably to the numeric footprint without a real pin mapping.

Separately, the current PCB has BC817 Q2 pad2 on `BUZZER_NEG` and pad3 on `GND`. Those are reversed for the documented BC817 mapping1=base,2=emitter,3=collector. The latest JSON fixes Q2's mapping, but that fix has not reached the board. [Nexperia BC817 datasheet, Table3](https://assets.nexperia.com/documents/data-sheet/BC817_SER.pdf).

**Closure:** use exact numeric-pin symbols; correct actual PCB pads2/3; inspect Q1 gate/source/drain/body diode independently; synchronize all representations and rerun parity.

### P1 — Charger instructions conflict and the stated current is incorrect

The schematic and generator (`:301–304`) specify **1.6 kΩ and claim500mA**. The current board/spec use **4.3 kΩ**, matching the purchased value. For the referenced LTC4054 relation, `I_CHG(mA) ≈ 1000 / R_PROG(kΩ)`: 1.6 kΩ implies625mA nominal, while4.3 kΩ implies233mA. Neither the stated500mA nor the conflicting assembly values are acceptable as a build instruction. The exact marketplace charger variant and battery charge limit remain unverified. [ADI/LTC4054 datasheet, programming charge current](https://www.analog.com/media/en/technical-documentation/data-sheets/405442xf.pdf).

**Closure:** identify actual charger and cell, select a permitted current with tolerances/thermal analysis, retain the correct physical resistor footprint/value throughout BOM/schematic/PCB, and correct the note. This finding does not mean the present unrouted board is physically charging a cell at625mA.

### P1 — DOST compliance claims are contradicted by the active rules and geometry

`RAMS_RevC.kicad_pro:143` sets minimum clearance to **0.15 mm** and `:157` sets minimum annular width to **0.10 mm**, below supplied0.254mm limits. The Default netclass uses0.15mm. `RAMS_RevC.kicad_dru:3–9` explicitly relaxes J1 internal clearance and hole clearance to0.15mm. No supplier exception is documented. The independent strict copy finds19 USB copper-clearance failures, each0.20mm instead of0.254mm.

The original main board's0.30mm track default is not useful proof while it has no tracks. The separate route-test contains only0.15/0.20mm routes, so it is not an EPDC-compliant routing solution. Do not weaken rules to reduce the report count. Hole-clearance limits not supplied by DOST need separate clarification; they cannot be inferred from copper spacing alone.

**Closure:** freeze supplier-backed rules and actual connector/MCU land-pattern feasibility, then route. Replacing USB shell slots with circles does not resolve signal-pad spacing or establish physical tab/peg fit.

### P1 — The schematic and PCB cannot serve as interchangeable assembly references

Examples beyond net-name formatting:

| Function | Schematic | PCB/spec or owned parts | Consequence |
|---|---|---|---|
| Battery socket | JST-PH2.0mm vertical | Owned SH1.0mm; board uses SH footprint | Wrong mating connector/footprint if updated from drawing |
| Buzzer transistor | Lettered B/C/E pins | Numeric pads with emitter/collector reversed on PCB | Invalid mapping and incorrect driver wiring |
| Power MOSFET | Lettered G/S/D pins | Numeric SOT23 pads | Invalid pad association |
| Battery sense | R13/R14=100k/100k | Board R14/R15=330k/180k | Different references, endpoints and ADC scaling |
| R15 | LED data10k pull-down | Board180k lower battery-divider resistor | Same reference represents unrelated circuit functions |
| ChargerR3 | 1.6k with500mA note | Board/spec/owned4.3k | Conflicting charge setting |
| D2 | SS34 | Owned/boardSS14 in SMA | Value mismatch despite corrected package |
| D3 | SOD-323 footprint | Purchased1N4148W SOD-123 | Package mismatch |
| LoRa | Ra-01 symbol/footprint; pin1 labelledANT and grounded | Purchased/boardRa-02 | Wrong module contract; not interchangeable by changing text |
| Passives | Generator defaults0603 resistors/caps and0805 bulk | Much owned stock0402,0603 bulk,0805 large caps | Broad footprint divergence |

Some parity messages are only library qualification or label-name differences; these examples are substantive. The schematic's readable block boxes do not establish an electrical source of truth.

**Closure:** build a per-reference value/package/pin/net matrix, choose one canonical definition and generate/update both sides from it. Independently compare that definition to datasheets and inventory; a self-consistency test alone can reproduce an incorrect circuit.

### P1 — WS2812B supply remains unresolved

Both sides power the WS2812B from3.3V. Inventory establishes5050/DC5V, not V6 silicon. Worldsemi's V6 notice specifically adds3.3V operation; it cannot establish that capability for unidentified older stock. LED power, logic threshold, battery discharge range and power sequencing remain open. [Worldsemi V6 announcement](https://www.world-semi.com/web/index.php?classid=22&id=587&lanstr=en&topclassid=19).

**Closure:** verify owned LED version or select a qualified supply/logic solution. Do not mark3.3V operation passed simply because the footprint is now5050 or one sample lights.

### P2 — Battery measurement and other unresolved power conditions

Current firmware uses divider multiplier2.0. The board's330k/180k divider requires nominal2.833333; using2.0 makes an ideal4.2V input read about2.965V before ADC error. The schematic's100k/100k circuit agrees with2.0 but is not the board. Reconcile actual values, tolerances, ADC calibration, input settling and unpowered leakage.

No complete simultaneous-load/dropout/thermal budget was demonstrated for AP2112, radio bursts, LED and buzzer. No cell specification establishes charging limits. These are open engineering gates, not proof of imminent failure. Close them before claiming reliable battery operation.

### P2 — “DNP” text is not a population setting, and visual layout still needs work

The generator's instance function always writes `(dnp no)` (`:252` area). Parts labelled “DNP,” including crystal/filter placeholders, are therefore not reliably excluded from population merely by their value text. State actual population intent and propagate it to the BOM/placement outputs; remove irrelevant module/bare-chip leftovers instead of hiding them with notes.

The rendered schematic improves grouping but still has crowded symbol fields and a lower-right antenna/title-block area with overlapping text and power flags. The board has100 silkscreen findings:53 over copper,41 overlaps and6 clipped by edges. These impair assembly references and contradict the implied finished presentation. Review [the schematic preview](schematic_preview.png) at normal reading scale.

**Closure:** use sufficient sheet space, move title notes/flags, separate pin/value labels, and position board text away from pads/edges. Do not waive all silkscreen findings as a batch.

## 4. Improvements already present

Do not repeat obsolete findings as though unchanged: the current PCB uses the SMA footprint for D2, R3 is4.3k, Q3 is six-pad, the module's numbered pad41 entries now carryGND, and the latest specification corrects Q2's emitter/collector mapping. Those corrections are partial: the board still has the Q2 error and the schematic still differs in several of these areas. The fresh main ERC pass and improved sheet grouping are also real, but narrowly scoped.

## 5. Required next work, in order

1. **Freeze routing and identify one intended circuit.** Record the owner's bareFH4R2 + B100 choice; do not continue the module hybrid.
2. **Resolve fine-pitch fabrication first.** Ask for exact-feature acceptance only when authorized to contact the supplier, or choose a capable fine-pitch supplier/daughterboard path with the owner. Include USB geometry in that decision.
3. **Correct the common electrical definition.** Protection sense, transistor numeric pins, charger/cell, exact physical packages, LED supply, ADC and MCU/RF/clock are priority items.
4. **Rebuild the schematic and board together.** Preserve reference meaning; reconcile the owned-parts BOM. Require parity and independently verified endpoints before routing.
5. **Route under real rules.** Verify physical ground returns, current paths, antenna/clock geometry and mechanical fit. Do not use the route-test tracks as an accepted DOST solution.
6. **Rerun the layered checks in the planning package.** Keep failure history, inspect exported copper/drills, obtain supplier acceptance for final geometry, then test one assembled prototype. No physical operation is claimed by this review.

## 6. Evidence and limits

The snapshot manifest records29 source files, including local libraries and both candidate boards. Main PCB SHA-256: `3b3cd5dfd37bc1eb89fa52a72fef844f725ba48c2dcbab6d405219559165fa06`. Circuit-spec SHA-256: `a8dc1ab000e39b2e1dabbea4b1079c93b885eb72f0f0b240a77c54883d1427d0`.

Checks performed: native board loading/counts, fresh ERC, fresh main-board DRC with parity and zone refill, separate route-test DRC, diagnostic DOST-rule DRC, XML netlist examination, source/library/generator comparison, component/inventory comparisons, and rendered schematic inspection. Reports retain the actual settings and ignored categories. The zero-ERC report still ignores global-label single-use, four-way-junction, SPICE and footprint-filter categories.

Not performed: actual-part measurements, supplier communication/DFM acceptance, final whole-design RF/thermal calculations, hardware assembly/power tests, RF tuning/range or environmental qualification. Physical pinout/manufacturer uncertainty remains for anonymous Shopee components. The findings are sufficient to reject this snapshot for fabrication, but they are not an exhaustive certification of every remaining component or mechanical detail.
