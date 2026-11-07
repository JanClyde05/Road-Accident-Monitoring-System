# Decision ledger and source conflicts

Planning baseline: 30 October 2026, Asia/Manila. Status applies only to the claim in the row. A verified inventory description does not verify received stock, authenticity, operation, or fabrication readiness. Record evidence as `verified`, `partially verified`, `unverified`, `contradicted`, or `not applicable`.

## 1. Requirements and current decisions

| ID | Category / requirement | Current decision or evidence | Status | Closure / acceptance evidence |
|---|---|---|---|---|
| R01 | Owner scope | Comprehensive plans and full instructions only, in this GPT6 Astra Build folder; another AI implements later | verified | Deliver readable linked chapters; no CAD/firmware/order changes |
| R02 | Owner parts preference | Reuse purchased stock where suitable and identify missing items | verified | Final BOM reconciliation to actual inventory; unused stock separated from shortages |
| R03 | Owner manufacturing preference | Consider supplied DOST fabrication limits | verified | Select a feasible process/architecture; document any change of supplier or extra subassembly as a decision, not an assumption |
| R04 | Owner schematic requirement | Correct overlapped/unreadable schematics | verified | Functional sheets rendered and visually reviewed at intended print size, plus electrical checks |
| R05 | Historical order | Original bare boards already ordered; user will solder parts | verified as owner statement | Keep order ZIP unchanged; any salvage instructions are separate from this new-board plan |
| R06 | Current system function | Wearable firmware says phone-assisted GPS/IMU over BLE | verified for inspected code | Confirm same target at implementation; no extra sensor/GNSS design unless scope changes |
| R07 | Quantity, enclosure, runtime | Not fixed by this request; historic outlines are candidates | unverified | Document wearable/receiver allocation, desired prototype count, enclosure and runtime requirements before final BOM/outline |
| R08 | Appearance and connector choices | Older DECISIONS files claim specific choices, but these do not establish actual measured parts or this handoff's final order settings | partially verified | Preserve provenance; reconcile with actual parts and owner requirements when a choice materially affects design |

## 2. Technical decisions and evidence gaps

| ID | Question / proposed value | Evidence and its boundary | Status | Work blocked / evidence to close |
|---|---|---|---|---|
| D01 | Can the owned bare MCU use the default EPDC process? | Owned FH4R2; measured original 0.20 mm pad gaps vs supplied 0.254 mm spacing; chapter 03 | contradicted for unchanged footprint/default process | Architecture acceptance; exact-land-pattern written capability or a viable carrier/daughterboard/module/other-fab choice |
| D02 | Is WROOM already owned / equivalent? | No WROOM in provided inventory; bare FH4R2 is a different component. Historical SuperMini descriptions do not prove module ownership | contradicted as an inventory equivalence | Module selection and missing-items BOM; exact owned board evidence or deliberate new-part choice |
| D03 | Exact bare-chip package/EP | Manufacturer FH4R2 drawing differs from original EP4x4 geometry; chapters 02/04 | partially verified | Bare-chip footprint and paste/thermal design; verify exact marking and recommended land pattern |
| D04 | USB connector compatibility | Two purchased connector styles have no verified MPN; original board has 0.20 mm gaps and undersized slots/rings | contradicted for unchanged EPDC footprint; physical stock unverified | USB footprint; actual drawings/dimensions and feasible copper/hole arrangement |
| D05 | Q3 six-leg pinout | Six legs/SOT23-6 confirmed; documented FuxinSemi mapping is conditional on actual part | partially verified | Q3 net acceptance/assembly; actual manufacturer/datasheet or qualified identification evidence |
| D06 | DW01 behavior | Referenced datasheet supports NC pin 4 and system-ground sensing; actual seller part identity unresolved | partially verified | Protection acceptance; actual variant thresholds/application, corrected independent net contract and physical tests |
| D07 | WS2812B package | Inventory Order 16 explicitly lists 5050 SMD/DC5V | verified as listing | Footprint physical fit/orientation still required; do not ask package question already answered by inventory unless received part differs |
| D08 | WS2812B 3.3 V operation / supply branch | Silicon version unknown; V6-specific capability cannot transfer to old stock | unverified | LED power/layout acceptance; exact variant operating limits or a validated regulated rail/logic solution |
| D09 | Battery / harness | Housings and board sockets listed; cell and complete harness unspecified | unverified | Charge-current and runtime/polarity acceptance; cell data and actual cable inspection |
| D10 | Charger part / current | Seller title mixes LTC4054/LTH7; owned 4.3 kΩ may set about 233 mA only for matching equation | partially verified | Charger values/thermal design; exact IC equation and cell charge limit, tolerance calculation |
| D11 | 3.3 V power budget | AP2112 available; no established simultaneous-load or thermal margin | unverified | Supply architecture; bounded worst-case loads, dropout/thermal calculation and later transient measurements |
| D12 | Divider / ADC | Stock 330 kΩ 1% + 180 kΩ 5%; firmware ratio 2.0 conflicts with nominal 2.833333 | contradicted for unchanged firmware | Accurate battery reporting; updated chosen ratio, tolerance/filter/settling analysis and calibration |
| D13 | Antenna | Owner confirms 2450AT18B100E; feed/NC reference supports two terminals | partially verified | RF acceptance; exact land pattern, keepout, stackup/feed/tuning and enclosure measurements |
| D14 | Crystal / RF passives | Frequency/nominal values listed; crystal CL/ESR, RF Q/SRF/tolerance unknown | unverified | Bare-chip clock/RF freeze; exact part evidence or qualified replacements, subsequent validation |
| D15 | Discrete/mechanical packages | SS14 inventory SMA contradicts SOD123 assumption; buzzer/switch/USB geometry unresolved | partially verified / contradicted where specified | Final footprints; measured components and pin/polarity drawings |
| D16 | 433 MHz antenna | Ra-02 modules and U.FL receptacles listed; no confirmed antenna/cable | unverified | Complete RF assembly/TX test; actual antenna and connector allocation |
| D17 | Missing resistor values | Several values not explicitly inventoried; 0805 kit contents unknown | unverified | Final buy list; count kit values then compute shortage from selected BOM and board quantity |
| D18 | DOST via/thermal/RF suitability | Annex gives polymer-paste process and no high-current recommendation; no current/thermal/impedance guarantees | partially verified | Process acceptance for high-risk paths; supplier data/representative measurement and revised topology if needed |
| D19 | DOST QFN assembly claim | Charter page 32 includes QFP/QFN; old blanket prohibition contradicts supplied source | contradicted as blanket prohibition | Assess actual assembly separately from fine-pitch fabrication, with exact package/process acceptance |
| D20 | Mask, holes, stackup tolerances | Annex leaves several tolerances unstated | unverified | DFM release; chapter 03 supplier-question answers tied to final geometry |
| D21 | Final source identity / readiness | Rev A defective; Rev B partial; Rev C not native-loadable in audit; GEMINI unrouted in audit | unverified as a release baseline | New implementation, native-loadable final files, fresh complete checks and independent review |
| D22 | Hardware works | No assembled corrected board test occurred in this task | unverified | As-built evidence and staged power/interface/RF/thermal/system tests |

## 3. Conflicts the implementing AI must not inherit

| Source conflict | Resolution for this plan |
|---|---|
| Root directory map says Rev C is active production; Rev C README says wiring and checks remain | Navigation labels do not establish release. Review the native file and final-hash evidence |
| Rev C/GEMINI equate SuperMini with WROOM and claim module ownership | Inventory explicitly lists bare FH4R2. Preserve architecture alternatives and list any module as an addition |
| Module N4 description claims 2 MB PSRAM | Validate exact ordering suffix and datasheet; do not infer memory from bare-chip/prototype properties |
| Rev C correct Q3 table is followed by conflicting DW01 gate pins and wrong CS reference | Use actual device application circuit and independently reviewed endpoint table; chapter 04 gives conditional correction |
| Both later circuit specifications reverse BC817 collector/emitter | Verify selected maker pin table, symbol and land-pattern pad numbers before rewriting nets |
| Rev C says EPDC rejects QFN; supplied Charter lists QFN assembly | Separate assembly from fabrication; the geometry conflicts remain independently real |
| Rev C swaps USB slots for 1 mm round holes and calls it solved | Fit the real stakes/pegs and check fine-pitch copper/rings; neither slot length nor an arbitrary circle proves fit |
| Antenna NC described as “or ground”; module plus separate antenna retained | NC remains NC for specified B100. A module follows its own RF architecture; no invented external RF pin |
| Old parts BOM calls SS14W/SOD123, inventory SMA; old LED SK6805, inventory WS2812B 5050 | Purchased package data wins subject to physical verification; redesign pads and nets accordingly |
| Old BOM says 4.02 kΩ; owned 4.3 kΩ; old RF value 2.7 pF absent from stock | Recalculate charge current; validate RF matching separately; do not mark nearby values as exact matches |
| Old schematic netlist, board and firmware disagree | Neither copy becomes automatically authoritative; compare all against current requirement and primary pin/function evidence |
| Historical scripts point at old paths or another repository | Inspect inputs/output guards; use current local paths and deterministic regeneration; never run blindly |
| Populated supplier form looks like a blank template to text extraction | Visual inspection found populated/signed fields. Preserve privacy and obtain blank form if later needed |

## 4. Decision record to complete during implementation

For each change, append a record rather than erasing the original uncertainty:

```text
Decision ID / date / responsible reviewer:
Requirement category: owner / manufacturer / supplier / engineering target / assumption
Question and exact affected references/nets/files:
Alternatives and part-reuse/cost/size consequences:
Selected option and concise rationale:
Primary source URL/file, revision, page/figure, and SHA-256 where local:
What that source proves and does not prove:
Calculation inputs, min/typ/max/tolerances, units, equations and result:
Unresolved conditions and stop condition:
Acceptance method and actual closure evidence:
Pre-change source hashes / final source hashes:
Raw failed reports / corrections / passing rerun reports:
Remaining physical validation:
```

Use engineering judgment to complete reversible design work within the eventual implementation scope. Do not ask for permission merely to read sources, measure CAD, prepare alternatives or repair an authorized isolated design. Ask for missing owner information only when it changes a dependent decision, such as using a different manufacturing route, dropping RGB functionality, or allocating newly purchased modules. This planning task itself does not authorize implementation, purchases or submissions.

## 5. Source map

All paths below are relative to the repository root; hashes are captured in `evidence/source_manifest.json`.

- Owner inventory: `docs/Parts List I Currently Have/product_list_expense_breakdown.md`; matching printable HTML is a presentation of the same record.
- Supplier: all four original PDFs in `docs/For PCB Ordering - DOST/`; document/page references in chapter 03. Do not reproduce the signed sample's personal fields.
- Ordered baseline: `hardware/KiCAD Files/Antigravity Build/RAMS - PCB/`, its `PCB_REVIEW_2026-10-30.md`, local project/rules/libraries and `JLCPCB_ORDER_PACKAGE/1_GERBERS_RAMS_PCB.zip`.
- Incomplete earlier correction: `hardware/KiCAD Files/Antigravity Build/RAMS - PCB - Rev B/` and itsREADME/review reports. Past cleanERC does not validate its remainingPCB/LED/RF state.
- Later candidate: `hardware/KiCAD Files/Antigravity Build/RAMS - PCB - Rev C/`; plan, circuit_spec, BOM cross-reference, decisions, rules and nativeCAD need independent review.
- Other active candidate: `hardware/KiCAD Files/Antigravity Build/RAMS Wearable - PCB/GEMINI Build/`; do not overwrite or run its generators as part of this plan.
- Current hardware/firmware contract: `firmware/wearable_withApp/config.h`, `battery.h`, `battery.cpp`, `lora_tx.cpp`, `gps.cpp`, `bt_service.cpp`, and `firmware/shared/protocol.h`.
- Primary component documents are linked beside technical claims in chapters02/04. Manufacturerdata hosted by a distributor is identified as such; a generic marketplace title cannot establish a pinout or rated operating range.

If a source differs from this snapshot, retain this plan as history, identify exactly what changed, and re-evaluate affected claims. Do not silently claim that an old report validates new geometry.
