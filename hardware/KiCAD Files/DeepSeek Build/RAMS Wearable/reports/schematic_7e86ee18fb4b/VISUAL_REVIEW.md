# Schematic render and native validation

Reviewed 8 November 2026, Asia/Manila. This record applies only to the source hashes in `source_hashes.json`; it does not establish PCB routing, assembly or physical operation.

## Result

- KiCad 10.0.6 native ERC: **0 errors, 0 warnings, 0 exclusions, no ignored checks** (`erc.json`).
- Four-page A3 PDF: root index plus power/USB, MCU/RF and LoRa/I-O sheets.
- Native SVG files and 2400-pixel-wide PNGs are in `../../previews/schematic/`; the PDF is `RAMS_JLC_S3_schematic.pdf` there.
- All four PDF pages were independently rasterized with Poppler and visually inspected. The three circuit SVG previews were also inspected after rendering with Inkscape.
- Source hashes were checked again after export; none changed during the final run.

## Corrections checked

Global labels extend outward from symbols. Rotated component fields remain horizontal. Header notes no longer overlay titles. Titles and revision fit the A3 title block. The LoRa sheet title was shortened so it does not touch its upper power labels. Power flags were moved above the test-point rows, clear of the title block. Pins, values and global labels use 1.0 mm text; explanatory notes identify charger isolation, raw cell negative versus protected ground, regulator, battery sense, clock, RF and radio/indicator functions. Default pin stubs remain 3.81 mm and symbol origins are snapped to a 1.27 mm grid.

The power drawing explicitly distinguishes `B_MINUS` and `GND`. R30 has a visible DNP cross and the charger note identifies its initial DNP state. GPIO labels, NC marks and both RF matching stages are visible. The preview exports include all three circuit sheets and the root index.

## Reproduce

Use KiCad's bundled Python 3.11.5 to run `scripts/schematic_helpers.py circuit_spec.json RAMS_JLC_S3`, then `scripts/render_schematic.py` from any working directory with the script's absolute path. Rendering creates a source-hash-specific report folder and refreshes `previews/schematic/` without modifying the PCB or project settings. The helper reads `schematic_positions.json` for drawing-only overrides.

Tools: KiCad CLI 10.0.6, Inkscape 1.4.2, Poppler 26.07.0. `scripts/test_schematic_helpers.py` separately checks parser round-trip, inherited symbols, pin completeness, deterministic UUIDs, cross-sheet connectivity, native netlist paths and a zero-finding ERC fixture.

## Limits

The document is intended for A3 at 100% or vector zoom. A physical print was not made; A4 shrink-to-fit will make dense pin text smaller. Global labels carry connectivity between functional groups, so this is not a single continuous-wire power diagram. These results do not verify manufacturing geometry, circuit performance, charging, RF tuning or physical bring-up. Any subsequent schematic, local-library or ERC-setting change invalidates the associated evidence until rerun.

Previous render/ERC attempts are retained in `../schematic_review_20261108/`, including the earlier generic connector footprint-filter warning fixed in the local connector symbol.
