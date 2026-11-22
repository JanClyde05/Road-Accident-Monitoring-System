# Readability and learning revision — 2026-11-13

## Current printable-legend decision — November 15, 2026

The owner explicitly selected printable local labels plus complete assembly drawings after reviewing the dense-board tradeoff. The 42 × 32 mm outline is retained. The current board prints 78 references at minimum 0.8 mm height / 0.10 mm stroke for JLC's high-precision process; native inter-character gaps are at least 0.16 mm. C12/C13/C15/C19/C21/C26/C27/L1/L4/R7/SW2/SW3 are drawing-only. RST/BOOT identify the buttons; all test pads are printed. This supersedes the compact-text exception below. Complete 1:1 and 4:1 assembly/pad maps retain every reference.

The larger-text all-reference candidate packed names but displaced fourteen beyond clear association. Attempted leader routing did not provide clear paths. That candidate and failed DRC are preserved; geometry fit alone was not accepted as useful labeling. Native glyph/pad/silk checks and visual review passed after applying the owner's choice.

Final PDF visual review caught SW1's Fab reference overlapping two nearby passive references. The drawing-only copy now puts SW1 inside its own body; all eight assembly/pad-map PDFs were regenerated. Native source and fabrication artwork were unchanged. Export verification compares the drawing copy against the frozen PCB and permits only that SW1 Fab-text difference, then checks all 89 top references and U2 on the bottom. Text extraction alone had found all references but did not reveal the visual collision; retain both checks.

Two implementation lessons: KiCad's GetTextAngle returns a borrowed mutable object, so save its numeric degrees before temporary rotation in an audit. The first audit's in-memory angle mutation produced a false body overlap; no PCB was saved, and the corrected read-only check passed. Also, preserve battery polarity graphics when removing an obsolete leader: a candidate-only broad removal was caught and all three polarity strokes were restored before promotion.

Three downloaded model hashes differed only because CRLF/LF conversion occurred. Exact archived bytes were restored after bytewise normalized comparison; geometry did not change. A local .gitattributes now protects model byte identities. Keep the hashes and original-file backup rather than silently accepting an unexplained mismatch.

## Historical presentation revision

Owner requirements: retain the 42 × 32 mm outline; use smaller, thinner reference labels instead of enlarging the board; place each label with its component; organize explanatory schematic sections; reuse/download suitable free 3D assets. No new electronic components were needed.

## Schematic navigation and teaching notes

Open `RAMS_JLC_S3.kicad_sch`. The root page is a design map and a non-electrical power-flow diagram. Double-click one of its three sheet rectangles to enter Power/USB, ESP32/RF, or LoRa/IO. Use the up-arrow or Leave Sheet to return. The existing circuits are boxed into functional sections, with notes alongside them. The detailed companion is [SCHEMATIC_LEARNING_NOTES.md](SCHEMATIC_LEARNING_NOTES.md).

The notes distinguish nominal calculations, assumed examples, starting values and measurement requirements. They explain charge current, LDO heating, capacitor transient support, reset timing, ADC divider/filter/discharge, crystal loading, RF reactance, buzzer base drive and LED power/data operation. A bulk capacitor helps brief transients; it does not guarantee that the regulator and battery avoid brownouts.

KiCad's S shortcut adds an electrical hierarchical sheet. Repeating a live circuit would create additional symbol instances, so the learning layout uses the real circuits once, with native text and graphics. Screenshots were unnecessary: native annotations remain sharp and editable. See the [KiCad 10 schematic manual](https://docs.kicad.org/10.0/en/eeschema/eeschema.html#navigating-between-sheets).

`organize_learning_schematic.py` translates complete original symbol/wire/label islands from the preserved pre-edit snapshot. The 99 schematic instances (90 physical positions plus nine power flags), identities and electrical connections are retained. `learning_layout.json` records this presentation layout; the old `schematic_positions.json` remains a historical construction input.

## Compact silkscreen

Reference fields are visible on the component's own side. The owner accepted 0.55 mm text with 0.10 mm strokes to preserve the board envelope. Pad-to-legend clearance remains 0.15 mm; copper and hole rules are unchanged. Labels are checked against bodies, pads, other labels and native DRC, then reviewed in rendered views. The enlarged assembly PDFs remain useful during soldering.

This text is **below JLCPCB's published 1.0 mm height / 0.15 mm stroke minima**. The supplier warns that smaller characters may be unidentifiable. Owner acceptance of smaller CAD lettering is not supplier acceptance or proof of printed legibility. Confirm the legend with the supplier before fabrication; do not enlarge these references automatically over solder lands. Source checked 2026-11-13: [JLCPCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities). The local DRC text minima deliberately reflect the owner choice; no check category is disabled to conceal the difference.

## Models and scope

The model register is [3D_MODEL_SOURCES.md](3D_MODEL_SOURCES.md), with hashes/transforms in `lib/3d/model_manifest.json`. Existing standard KiCad package models remain in use; the missing custom assets are now attached. Ra-02 comes from the owner's local collection. Downloaded switch and LED assets are visualization sources only; their footprints did not replace verified lands. Package approximations and the illustrative buzzer envelope are explicitly identified.

## Lessons and checks

- Hidden Reference fields caused the original missing silkscreen. An assembly-layer label is not a printed board label; inspect the actual F.SilkS/B.SilkS output.
- KiCad text layout bounds include unused line/descender space. The first planner used those oversized rectangles and needlessly displaced labels. The corrected planner uses native stroked-glyph bounds plus explicit padding, followed by independent DRC.
- Collision-free text can still identify the wrong nearby part. The initial automatic packing put some passive references several millimetres away; association requires a separate placement review.
- Schematic translation preserved connectivity but initially created a few label/annotation collisions. Independent review caught the charger, ADC, reset and ERC-flag cases; the layout was corrected and rendered again.
- Unicode text serialized with ASCII escapes appeared literally in native annotations. Preserve Unicode when writing KiCad strings.
- A model filename is not evidence that the asset exists or is centered correctly. Validate file paths, transforms, pin 1 and actual package identity.
- Keep each electrical circuit once. Teach with text/graphics and the existing hierarchy, then compare native netlists after layout changes.
- Preserve working copper, board size and owned suitable parts. Readability and learning improvements do not justify additional circuitry or purchases.

`reports/readability_validation.json` binds the before/after comparison: identical tracks, vias, pads, placements, courtyards, filled copper, keepouts, outline, setup and canonical schematic component/pin/net assignments. Final ERC/DRC, model inventory and rendered previews have separate source records. Previous native files and failed/intermediate plans remain in `verification/` and `reports/`. No physical assembly, fabrication or electrical operation is claimed by this revision.

Compact-label exception: C13 alone uses 0.45 mm height with the same 0.10 mm stroke to fit beside its body between L1 and R7. The other 89 references use 0.55 mm. L4 has a short printed leader pointing toward its component; BOOT is reduced to 0.70 mm to free space for FB1. Pad clearance remains 0.15 mm. See the final native PCB and reports/silkscreen_final_plan.json.

Final legend checks: native DRC found and corrected spacing shortfalls without lowering the 0.15 mm clearance rule. The passing run is readability_drc_6.json. Independent bounds checks found zero intersections between rendered reference strokes and any same-side Fab body envelope. Actual source/report hashes are recorded by freeze_validation.py.
