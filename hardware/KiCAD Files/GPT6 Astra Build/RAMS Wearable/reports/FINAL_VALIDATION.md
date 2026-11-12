# J2 final CAD validation — engineering candidate

Reviewed 2026-11-12, Asia/Manila. Native KiCad **10.0.6**. Scope: the bare
ESP32-S3FH4R2, AP2112, Ra-02, active buzzer and 1S LiPo JLCPCB design.
**CAD validation passed; fabrication release and physical operation remain open.**

The authoritative PCB SHA256 is
`5f86824a9d50f288361d3f8ee4852bda18af880dab9b3da43074a571a8f48ad5`.
Circuit specification SHA256 is
`bdddbc78828b2d359abed5dccf3ce7d517b007f9fb321221f10c6786891f430c`.
Full native/project/library and report hashes are in
[final_validation_manifest.json](final_validation_manifest.json). Reports are
invalid for later edits unless rerun and rebound. Original Antigravity prototype
PCB, schematic and order ZIP hashes still match the starting baseline.

| Gate | Recorded result |
|---|---|
| Native schematic ERC | 0 violations across four pages; no ignored checks |
| Native PCB DRC | 0 violations, 0 unconnected items, 0 schematic parity issues; no ignored checks/exclusions |
| Circuit / BOM / board | 90 footprint positions: 82 components and 8 test pads; 80 initially fitted; R30/LED1 staged |
| Outline / stack | 42 × 32 mm; four copper layers; JLC04161H-3313 target |
| Routing | 1,440 track segments, 181 vias; no tracks on dedicated In1 ground layer |
| USB reference | CC1 moved away; native In2 keepout preserves reference under bottom fanout; no foreign crossing tracks |
| Antenna exclusion | No foreign pads/tracks/vias or copper fill inside the exclusion; 1 µm numerical interior tolerance distinguishes legal boundary contact |
| Drill versus lands/paste | Nine intended U1 exposed-pad thermal drills; no other SMD-land drill intersections; no drill intersects the 16 dedicated paste windows |
| ESP32 lands | All 56 perimeter lands 0.80 × 0.25 mm at 0.40 pitch, paste 0.75 × 0.20; local library/board agree; nominal mask web 0.15 mm |
| Firmware | Actual-source battery/RGB host tests and both full Arduino-ESP32 3.3.5 builds pass; 19 current source hashes match |

DRC uses 0.15 mm copper/track minima, 0.25 mm copper-to-edge and hole clearance,
0.45/0.20 mm minimum via diameter/drill, 1.0 mm legend text, 0.15 mm legend
stroke/clearance. The mask check is independently geometric; the project does
not imply an unconfigured minimum-mask-web rule was checked by DRC.
Project rules retain warnings rather than hiding them. Read raw
[DRC](final_drc.json), [ERC](final_erc.json),
[geometry](final_geometry/geometry_audit.json) and
[firmware](firmware_j2/BUILD_REPORT.md) results for exact scope.

Electrical review independently matched 247 connected schematic pins, 41 NCs
and 253 connected PCB pad occurrences. See
[J2 electrical review](../docs/J2_ELECTRICAL_REVIEW.md), including its current
2026-11-12 section rather than the preserved older snapshots.

USB's total drawn copper sums include both USB-C orientation branches. Excluding
the unused symmetric connector branch and two redundant 0.5 µm pad-centre
segments gives approximately **19.1741 mm per polarity**. This is geometric
track length, not a propagation-delay or impedance measurement. Two through
vias per signal remain. Sampled ground-reference gaps are confined to each
signal's own via antipads and the intentional antenna exclusion; they are not
misrepresented as continuous plane beneath every transition. RF matching and
crystal routes have no sampled plane gaps. In1 ground is one filled outline.

[Power-path estimates](power_paths_final.json) use nominal copper resistivity
at 20 C and an assumed 18 µm via plating. Charging an entire segment when entered
partway overestimates that nominal path; parallel pours are not credited. The
largest illustrated 3V3 endpoint drop is about 90 mV at an assumed 600 mA through
that path. These are neither worst-case guarantees nor thermal/current ratings.
The AP2112 and actual assembled rail still need simultaneous-load measurements.

Visual inspection covers all four copper layers, both masks/legends, top paste,
top/bottom assembly and top/bottom 3D views in `previews/final/`. The review
corrected missing ANT1/Y1 and overlapping test-point/D3 assembly labels. 3D
models are incomplete and illustrative (notably the antenna, crystal, switch,
LED, buzzer and Ra-02); use native lands and measured parts for fit. Four
schematic pages were reviewed during capture, with the final IO/C35 page
rechecked; the source-bound schematic reports record the unchanged page hashes.

Corrections retained in `verification/`: final CC1 reference reroute and dangling
via cleanup; QFN land-width/paste adaptation; assembly-only label correction.
Earlier failed routing/clearance reports and the rejected buck-boost candidate
remain archived. Initial construction scripts are guarded because historical
placement/routing inputs cannot reproduce the final native PCB.

Reproduction uses `kicad-cli sch erc --format json`,
`kicad-cli pcb drc --schematic-parity --format json`, the project's read-only
`audit_layout.py` / `audit_power_paths.py`, and `verify_firmware.py` plus the
two validation host tests. Refill zones after copper changes before DRC;
never run concurrent CAD writers. `export_review.py` requires the matching
manifest and exports from a frozen copy. Export QA is recorded separately.

**Still open:** supplier/field-solver RF and USB impedance confirmation for the
actual stackup; actual-stock package/polarity checks; QFN thermal-via soldering
and paste/heatbed process qualification. After assembly, verify charging and
protection, battery/USB sequencing, rail droop and temperature, ADC transients,
both USB orientations, LED voltage/timing, oscillator startup and RF operation.
The generic WS2812B-2020 revision remains unknown. Its nominal 3.7 V battery
supply does not guarantee operation across discharge. Firmware's preserved
3.55 V percentage endpoint is not shutdown or a measured regulator floor.
No board has been fabricated, powered, flashed or physically tested in this task.
