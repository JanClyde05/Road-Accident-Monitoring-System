# J2 prototype fabrication validation — November 15, 2026

Native KiCad **10.0.6**. PCB SHA256: `cf926980e8fdaecfb1abeb252f0ca73cc0cfbd4e5cad11143fd9a3e0ee21964a`.
Circuit specification SHA256: `bdddbc78828b2d359abed5dccf3ce7d517b007f9fb321221f10c6786891f430c`.

The first-prototype fabrication CAD gate passed. This is the 42 × 32 mm, four-layer AP2112 linear-regulator version. Supplier production-file confirmation and physical operation remain separate. Nothing has been uploaded or ordered.

| Gate | Result |
|---|---|
| Native ERC | Zero findings across four schematic pages; no ignored checks |
| Native DRC / parity | Zero violations, zero unconnected items, zero schematic mismatches; no exclusions or ignored categories |
| Circuit invariants | All four schematic files and canonical 90-component / 96-net circuit unchanged; 253 connected PCB pad occurrences |
| Layout invariants | Component positions/rotations/sides, numbered copper pads, track endpoints/layers/nets, drill geometry, zone boundaries, keepouts and 42 × 32 mm outline unchanged |
| Deliberate changes | 34 RF widths 0.18→0.15 mm; U1 mask/paste/9-via tenting; printable legend; ground refill |
| Routing / return paths | 1,440 segments / 181 vias; dedicated In1 has no tracks and one ground outline; no unexplained sampled reference gaps or antenna-keepout copper intrusions |
| QFN construction | 56 lands 0.80 × 0.25 mm; perimeter paste 0.75 × 0.20 mm; native/library parity; sixteen chamfered EP openings; nine intended 0.20 mm ground drills, top covered / bottom open |
| Mask / paste math | 0.20 mm crosshatch web, 0.15 mm outer mask overlap, 0.1121 mm nominal coverage beyond hole edges, 61.42% EP paste area |
| Printable legend | 78 visible references, minimum 0.8 mm height / 0.10 mm stroke; inter-character white space ≥0.16 mm; no measured glyph/body or glyph/pad collisions; RST/BOOT and all eight test pads labeled |
| Owner's dense-label choice | C12/C13/C15/C19/C21/C26/C27/L1/L4/R7/SW2/SW3 appear in complete assembly drawings; no circuit part removed |
| BOM / assembly | 90 positions = 82 physical components + 8 test pads; 80 first power, 82 after LED/battery qualification; exact documented replacements integrated |
| Models | All 82 physical positions resolve; eight test pads intentionally have no model. Package approximations are documented |
| Firmware | Prior host tests and full J2/SuperMini Arduino-ESP32 3.3.5 builds retained, with all 19 source hashes checked unchanged by the freezer |

DRC rules retain 0.15 mm copper/track and silk clearance, 0.25 mm copper-edge/hole clearance, 0.45/0.20 mm via minima and the selected 0.8/0.10 mm high-precision legend. No rule was hidden to make the report pass. Mask webs and actual inter-character spacing are independent checks in addition to DRC.

RF/USB nominal cross-section calculations are supported by the official JLC calculator: 48.521 Ω RF and 86.289 Ω differential USB with close side ground; 51.072/87.771 Ω without coplanar ground. The published-guide mask/trapezoid sensitivity gives 48.502/86.223 Ω. Antenna matching geometry inside the no-ground corner, pads and transitions are not uniform lines. Use JLC04161H-3313 and controlled-impedance production confirmation; first-article antenna/enclosure tuning remains necessary.

The raw evidence is source-bound: fab_native_validation.json records check commands, sources and report hashes; fab_invariants.json limits permitted edits; fab_label_validation.json checks actual visible strokes; final_geometry/geometry_audit.json checks planes/clearances; fab_impedance_20261114 contains primary calculator results and final mask/geometry audits. final_validation_manifest.json freezes sources, reports, documentation and scripts. EXPORT_VALIDATION.json checks exported mask/paste polygons, full assembly references, drill counts, layer functions and byte-identical upload ZIP contents.

The nine EP drills are intentional; no other SMD copper-land drill intersections or drill/paste-window intersections were found. Ordinary top tenting is a selected low-cost measure, not a filled/capped via or guaranteed void-free joint. Inspect received mask and the fine-pitch print; use the actual solder paste profile and measured heatbed board temperature.

Power-path estimates use nominal resistivity and assumed via plating; they are not rail measurements. Assembled charging/protection, regulator droop/temperature, USB in both orientations, LED range/timing, ADC calibration, oscillator startup and RF/LoRa performance still require the staged bring-up guide. The unknown-revision bought LED and charge-enable link remain DNP for first power. Original Antigravity prototype PCB/schematic/order ZIP identities are checked against the preserved baseline.

Failed packing/DRC candidates and one-shot input backups are retained. No physical hardware result or supplier manufacturing acceptance is claimed by this report.
