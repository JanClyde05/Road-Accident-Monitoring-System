# Verification gates and return package

All gates below are **OPEN for the future implementation**. This package is a plan and source review. Historic ERC/DRC results do not transfer automatically to a new revision or a changed rule set.

## Gate matrix

| Gate | Must be checked | Required acceptance evidence | Blocking failures |
|---|---|---|---|
| G0: Source and scope | Owner scope, exact paths, revision, hashes, firmware target | Manifest, selected architecture, source/conflict ledger | Ambiguous master, unsupported substitution, overwritten original |
| G1: Parts | Selected MPNs, packages, usable stock and reference allocations | Inventory reconciliation, critical markings/dimensions, manufacturer pin/package references | Unresolved critical package or pinout |
| G2: Fabrication feasibility | Copper features, pad gaps, holes, slots, rings, outline, mask, stackup | Supplier-specific rules, independent geometry checks, written exceptions where needed | Impossible gaps; unverified via process or connector fit; only netclass defaults checked |
| G3: Electrical | Power tree, required rails, protection, logic levels, loads, clock/RF, no-connects | Reviewed pin/net contract and calculations independent of generator; all power states analyzed | Floating rails, gate/sense/polarity errors, supply or logic outside guaranteed limits |
| G4: Schematic | Native opening, references, units, links, ERC, readable pages | Raw ERC, rule settings, inspected renders, critical symbol-to-pad comparison | Unresolved errors, hidden net ambiguity, overlapping labels/symbols |
| G5: Parity and firmware | Schematic/PCB endpoint equality; expected nets; GPIO, memory and divider settings | Native parity and independent pad table; targeted firmware build if changed | Unwired schematic, wrong GPIO, unsupported memory settings, incorrect ADC scaling |
| G6: Layout | Final filled-copper connectivity, routes, return paths, antennas, mechanical access | Full DRC with zero unresolved errors and zero unconnected required nets; independent geometry/connectivity and visual review | Excluded physical violations, ground islands, protection bypass, unrouted nets |
| G7: Assembly | Actual part fit, polarity, placement, paste/reflow process and test access | Assembly drawings, paste review, exposed-pad process, available tools/services | Assumed iron-only assembly for hidden pads, wrong shell-hole fit, no inspection method |
| G8: Exports and independent review | CAM outputs match accepted native source | Fresh Gerber/drill exports, CAM inspection, layer/drill/outline checks, final hashes and reviewer disposition | Stale export, wrong revision, missing drill/outline, unexplained differences |
| G9: Supplier acceptance | Selected process and final geometry | Recorded DFM response/quote tied to exact package, with conditions resolved | Acceptance inferred from a brochure or generic calculation |
| G10: Prototype | Actual power, boot, interfaces, RF, thermal and system behavior | As-built BOM/revision, instruments, limits, raw measurements, failures and corrections | Operation inferred from CAD; unstable power or unverified battery behavior |

**Sequence:** G0–G7 permit final engineering CAM exports for G8 review. G8 and G9 precede fabrication release; supplier submissions and orders still need the owner's explicit instruction. An early annotated feasibility drawing/coupon can be prepared for G2 without pretending it is a final board. G10 follows fabrication and assembly; it cannot be required before a prototype exists. Claims about physical operation remain open until G10.

Review each warning individually. A justified nonfunctional silkscreen waiver is different from ignoring a copper or pinout error. Record every ignored rule category and object exclusion. Renaming an error “warning” does not waive the requirement.

## Independent assertions

Build an expected-endpoint table from chapter 04 and the selected architecture, independently of the generator. At minimum, verify:

- Every required MCU/module supply and ground pin has the intended source and physical return. Account for the bare-chip exposed pad or every module ground pad as applicable.
- No direct copper path joins `B_MINUS` to protected system `GND` around the protection FETs. USB shields, mounting hardware and test equipment must not bypass protection.
- Q3 gates and sources match its exact datasheet; DW01 sense and supply references are correct; charger battery and USB connections are not swapped.
- LED power, DIN/DOUT, GPIO and sequencing match the selected LED variant. A DOUT pad must not be mistaken for DIN.
- USB contacts and ESD channels connect correctly in both plug orientations, with independent CC terminations where required.
- For the discrete B100 branch, feed/NC terminals and the complete antenna keepout are correct. For a module branch, apply that module's antenna/interface contract instead. Each radio has one intended, documented RF path.
- Diode polarity, transistor collector/emitter, power-FET body diode, switch common, battery connector polarity and button contact pairs agree between symbols, footprints and copper.
- Every bypass ground pad has a physical return. Refill zones after the last edit and include actual layer transitions in connectivity analysis.
- Holes and slots use accepted tooling. Copper-bearing PTH pads and vias retain the required annular ring; NPTH locating holes instead need their own fit, clearance and tolerance checks.

Prefer exact geometry over sampled grids, which can miss narrow shorts or disconnected slivers. Check transformed coordinates and layer membership. Preserve checker inputs, tolerances and limitations.

## Commands and reproducibility

Use the installed KiCad CLI and native APIs. This review used KiCad 10.0.6; record the actual version on the implementing machine. Inspect each subcommand's `--help` before relying on old flags. Typical checks are `sch erc`, `sch export netlist`, `sch export pdf`, `pcb drc` with schematic parity and zone refill where supported, and native Gerber/Excellon exports. No new design was implemented or validated by those commands in this planning task.

Record stdout, stderr, exit code, arguments, version, input hashes and report paths. If zone refill changes the saved board, hash the resulting file and bind downstream reports to it. Use a fresh process for independent checks when shared state could conceal a problem. Do not run generation and verification concurrently on the same file.

Suggested implementation structure:

```text
implementation/
  RAMS_<revision>.kicad_pro/.kicad_sch/.kicad_pcb/.kicad_dru
  fp-lib-table, sym-lib-table, lib/
  scripts/                    # inspected deterministic helpers
  docs/                       # contracts, calculations, decisions
  verification/<run-id>/      # retained reports, settings, hashes, commands
  previews/                   # schematic, board and mechanical reviews
  manufacturing/              # engineering exports, then accepted release
  as-built/                   # real assembly and measurement evidence
```

## Staged physical validation

Set numeric pass/fail limits from selected component requirements before energizing the board. Use a current-limited source and suitable instruments. Grounded clips can accidentally join `B_MINUS` to `GND`; choose appropriate differential or isolated measurements. An ordinary probe can disturb crystal or RF nodes, so document the measurement method and its loading.

1. **Unpowered inspection:** check orientation, bridges and hidden-pad assembly. Compare connector pinout, rail resistance, protection-ground separation and continuity against the circuit. Charging capacitors and semiconductor junctions affect meter readings; a continuity beep alone is not a short diagnosis.
2. **Power subsystem:** use a suitable simulated-cell/controlled-load arrangement before connecting the real LiPo. A generic bench supply may not safely sink charger current. Check USB only, battery only, both present, protected-off states, switch states and hot-plug transitions. Measure reverse current, rails, quiescent draw, charging/termination and temperatures. Use a controlled protection test method rather than deliberately shorting or overcharging a real battery.
3. **MCU minimum configuration:** verify rails, reset/straps and programming recovery before adding radio, LED and buzzer loads. Confirm chip identity, selected flash/PSRAM settings and repeated power cycles. Check native USB or the deliberately selected recovery interface.
4. **Individual loads:** test buzzer, button, all configured LED colors/brightness and sequencing, battery ADC against known voltages, then LoRa with a suitable 433 MHz antenna/load. Confirm module settings agree with the shared protocol.
5. **Combined load:** exercise enabled radios, LED, buzzer and processor concurrently across the intended USB/battery input range. Capture rapid supply transients and average current. Check resets, latch-up, false button events, communication losses and stabilized temperatures under documented enclosure/ambient conditions.
6. **RF and mechanics:** measure BLE and LoRa behavior in the final enclosure, battery position and wearing orientation against an agreed requirement/baseline. Bench connection does not establish range. Check cable insertion loads, switch access, strain relief, board retention and insulation.
7. **System behavior:** test phone-assisted BLE telemetry, packet compatibility, alert acknowledgement/dismissal, boot/reconnect and low-battery behavior in controlled conditions. Startup alone does not validate accident-detection accuracy or field reliability.

Retain failures, isolate causes and rerun affected gates plus dependent regressions. Do not populate every spare MCU or antenna before one prototype passes initial validation.

## Return package for the reviewing AI

Provide the native project and local libraries; selected inventory/BOM; architecture decision; revised pin/net and firmware contracts; source versions; complete ERC/DRC settings and parity reports; independent checks; schematic, board, copper, paste and mechanical previews; source/export hashes; and unresolved issues. Include failed runs and a concise change-to-fix mapping. State whether hardware exists and which measurements were actually performed.

Suggested review request:

> Review this exact revision and these hashes against the GPT6 Astra planning package. Independently identify electrical, fabrication, inventory, schematic, layout, firmware and assembly errors. Do not infer acceptance from the builder's summary. Distinguish verified CAD properties from supplier acceptance and measured hardware performance.

