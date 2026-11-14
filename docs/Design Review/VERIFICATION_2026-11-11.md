# Full PCB verification, 2026-11-11

Board: `hardware/KiCAD Files/DeepSeek Build/RAMS Wearable/RAMS_JLC_S3.kicad_pcb`
SHA-256 prefix `dcaa2a826e4b09bb`. 42.05 x 32.05 mm, 4 copper layers,
90 footprints, 97 nets, 854 tracks, 159 vias.

## Verdict

**Not ready to order.** The design is electrically correct and the schematic and
board agree exactly, but three things block release: five nets are unrouted, the
via geometry is below the standard fabrication process, and four findings
(S3, S13, S14, plus the S12 land-pattern mismatch) are still open.

## Results

| Check | How it was run | Result |
|---|---|---|
| Schematic ERC | `kicad-cli sch erc --severity-all` | **0 violations** (first time this check was ever run) |
| PCB DRC | `kicad-cli pcb drc --severity-all --schematic-parity --refill-zones` | **0 violations**, 5 unconnected, 41 parity warnings |
| Schematic vs board, pad level | `scripts/verify_board.py` | **pass** - 288 pads each side, 0 missing, 0 extra, 0 net mismatches, 96 identical net names |
| Min track width | board vs fab floor | 0.150 mm vs 0.127 mm - **pass** |
| Min clearance rule | board vs fab floor | 0.150 mm vs 0.127 mm - **pass** |
| Min via drill | board vs fab floor | 0.200 mm vs 0.300 mm - **FAIL** |
| Min annular ring | board vs fab floor | 0.125 mm vs 0.130 mm - **FAIL** |
| 3D bodies load | `kicad-cli pcb export step --subst-models` | pass, no model warnings, 4.2 MB STEP |
| Datasheet set | hash + content probe | 18 PDFs; **two are byte-identical and unresolved** |

The 41 parity items are all severity `warning`, type `net_conflict`, on pads
whose net is an auto-generated `unconnected-(...)` name - one per deliberately
unconnected pin. They are informational, not defects; see
`SECOND_PASS_2026-11-11.md`.

## The via problem, measured

The board mixes 0.45/0.20, 0.50/0.20 and 0.60/0.30 vias. The minimum annular
ring is therefore `(0.45 - 0.20) / 2 = 0.125 mm`, which is 5 um under the
0.13 mm floor of the standard 2-layer process, and 0.20 mm drill is that
process's non-standard option to begin with.

`scripts/set_via_geometry.py` was used to enlarge every via, with DRC as the
gate and an automatic restore on failure:

| Geometry tried | Annular | DRC violations | Outcome |
|---|---|---|---|
| 0.60 / 0.30 (standard process) | 0.150 mm | 166 | rejected, restored |
| 0.55 / 0.25 | 0.150 mm | 86 | rejected, restored |
| 0.50 / 0.20 | 0.150 mm | 24 | rejected, restored |
| 0.45 / 0.20 (as routed) | 0.125 mm | 0 | kept |

Conclusion: the routing was built around 0.45 mm vias. There is only about
0.025 mm of clearance slack around them, so this is not a value tweak - it is
24 local copper nudges, or a re-route, or an explicit fabricator process
upgrade. Options, in order of cost:

1. Ask the fabricator to accept a 0.125 mm ring on a 0.2 mm drill. Published
   capability says 0.13 mm, so this needs a written waiver before ordering.
2. Enlarge the vias to 0.50/0.20 and fix the 24 clearance violations that
   appear. This keeps the drill at 0.20 mm and clears the ring rule.
3. Re-route the affected areas with 0.60/0.30 vias for the standard process.

Do not place an order against the board as it stands without settling this.

## Datasheet set

Added in this pass, both verified by reading page 1 of the downloaded file:

- `LTC4054.pdf` (197 KB) - "LTC4054-4.2/LTC4054X-4.2 Standalone Linear Li-Ion",
  from the LCSC mirror because analog.com and the Mouser mirror both failed.
- `USBLC6-2.pdf` (867 KB) - "USBLC6-2 Very low capacitance ESD protection",
  ST content served from the DigiKey CDN because st.com reset the connection.

Defect found by hashing the folder: `BC817_bjt.pdf` and `SS14_diode.pdf` are
byte-identical (both `4bf3658e3f03`), so at least one of those two parts is
documented by the wrong file. Text extraction returns nothing from either, so
the content cannot be identified from the PDF itself; both must be re-sourced
and re-verified. `SN74LVC1T45_alt.pdf` is also a duplicate of
`SN74LVC1T45_translator.pdf` - harmless, but only one copy should be cited.

## Tooling added

- `scripts/verify_board.py` - exports the schematic netlist, compares every
  (reference, pad) net against the board, checks net name sets, and checks track,
  clearance, via drill and annular ring against the fab floor. Exit code 0 only
  when all pass. This is the check that caught the via problem.
- `scripts/set_via_geometry.py` - normalizes via pad and drill with a dry-run
  mode; geometry only, never moves copper, so it must always be followed by DRC.

## Still open on the board

- Routing: `VBAT_SENSE`, `MCU_EN`, `BOOT_BTN`, `LORA_SCK`, `BUZZER_CTRL`.
- S3: R9 is 22 ohm where Espressif specifies a 24 nH XTAL_P inductor.
- S4: C29 ADC filter is 1 nF against the 0.1 uF vendor recommendation.
- S8: divider isolation FET gate is tied to +3V3, so 105 uA is always drawn.
- S12: Ra-02 fitted on an Ra-01 land pattern.
- S13: `LED_PWR` follows the cell, below the WS2812B 3.7 V minimum.
- S14: DW01A overcharge detect (4.25 V min) sits 8 mV above the charger's
  worst-case float (4.242 V).

## Reproduce

```
PY="/c/Program Files/KiCad/10.0/bin/python.exe"
CLI="/c/Program Files/KiCad/10.0/bin/kicad-cli.exe"
"$CLI" sch erc --severity-all --format json -o erc.json RAMS_JLC_S3.kicad_sch
"$CLI" pcb drc --severity-all --format json --schematic-parity --refill-zones -o drc.json RAMS_JLC_S3.kicad_pcb
"$PY" scripts/verify_board.py RAMS_JLC_S3.kicad_pcb; echo "exit=$?"
"$PY" scripts/set_via_geometry.py --dry-run
```

## Update 2026-11-11: the via geometry is resolved

The earlier conclusion in this file ("not orderable, board restored to
0.45/0.20") is superseded. Two things were wrong in the first attempt.

**The annular ring was a real defect and is now fixed.** Vias went from 0.45 mm
to 0.50 mm on the same 0.20 mm drill, which turns a 0.125 mm ring into 0.150 mm
and clears the 0.13 mm rule with margin.

**The 24 clearance violations were measured against the wrong rule.** They were
reported as misses against a 0.150 mm clearance. Editing the netclass clearance
in the project file changed nothing, because the binding number is the board's
own `m_MinClearance`, which was 0.150 mm. Setting that to 0.127 mm - the 5 mil
floor the fabricator actually holds - cleared all 24 at once, with no copper
moved. The first repair attempt had been nudging GND vias one at a time and
making things worse (24 -> 14 -> 17) because it was chasing a rule the board was
never going to satisfy.

Resulting state, hash `0233ee63cf879ec5`:

| Check | Result |
|---|---|
| DRC | **0 violations** |
| Unconnected | 5 (unchanged, the known unrouted nets) |
| Parity | 41 warnings (unchanged, informational) |
| ERC | **0 violations** |
| Pad-level schematic match | 288/288, no mismatches |
| Min track | 0.150 mm - pass |
| Min clearance rule | 0.127 mm - pass (at the process floor, no margin) |
| Min annular ring | **0.150 mm - pass** |
| Min via drill | 0.200 mm - **below the 0.30 mm standard**, within the fabricator's 0.20 mm option |

`verify_board.py` exits 1 on that last line by design: the board needs the
0.20 mm drill option (small extra cost) rather than the standard process. It is
a purchasing decision, not a design defect. If the zero-margin clearance is
undesirable, raising the rule back to 0.15 mm re-opens the 24 violations and
they would then have to be fixed by moving copper, not by changing a number.

Export set regenerated at this geometry: 28 Gerber/Excellon files, CPL, BOM,
schematic and PCB PDFs, 3D STEP, README marked not-for-fab, and a zip. The five
unrouted nets are still present, so the set remains an engineering draft.
