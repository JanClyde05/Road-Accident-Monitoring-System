# Fabrication legend review — 2026-11-14

Historical feasibility review. **November 15 resolution:** the owner selected printable labels where they fit plus a complete assembly drawing. The final board has 78 printed references; C12/C13/C15/C19/C21/C26/C27/L1/L4/R7/SW2/SW3 are drawing-only, with RST/BOOT identifying the two buttons. All eight test pads remain printed. See reports/fab_label_validation.json for the final source and passed checks. The experiments below are retained as development evidence. Preserve the 42 × 32 mm board, electrical placement/routing, and all 90 reference identities. No active CAD file was written by this review. The owner wants every reference visible and associated with its component; a remote list is not equivalent to a local reference.

## Supplier evidence and process choice

JLCPCB's [rigid-PCB capability table](https://jlcpcb.com/capabilities/pcb-capabilities) specifies standard legend text height 1.0 mm, stroke 0.15 mm, and pad separation 0.15 mm. Its [character design guidance](https://jlcpcb.com/blog/character-design-specifications) explicitly offers an order-selectable **high-precision** option with 0.8 mm height and 0.10 mm stroke. That guidance also requires more than 0.15 mm separation between characters; it recommends 0.25 mm pad clearance. The separate [silkscreen article](https://jlcpcb.com/blog/pcb-silkscreen) gives 0.8/0.15 mm absolute limits. Sources accessed 2026-11-14.

Therefore, 0.8/0.10 mm is a documented **process-specific option**, not permission to send undersized text through the standard process. A candidate using it must identify high-precision characters in its ordering instructions and satisfy the geometry checks. Availability and price for this order are not established here. No official source supports the present 0.45–0.55 mm character height; no UV-process anecdote overrides those dimensions.

## Current source and checks

Audit source SHA-256: `d59c7348a7ca82d890a9c0347848d4778a9ddeb140f87ee5ff83a3dc22fd5aa8` (`RAMS_JLC_S3.kicad_pcb`). There are 89 front references and one rear reference (U2): 82 physical components plus eight copper test pads. Eighty-nine references use 0.55/0.10 mm; C13 uses 0.45/0.10 mm. BOOT is 0.70/0.10 mm. The L4 leader is 0.10 mm wide. RST, RAMS J2 and RA-02 433MHz are 1.0/0.15 mm; the buzzer + mark is 1.0/0.16 mm.

`readability_drc_6.json` reports zero violations, unconnected items, parity differences and ignored checks under the compact legend rules. This does not establish standard-process legend compliance. The nearest reference ink to the rectangular board edge is C35, 0.39924 mm. A new placement must continue avoiding USB-C shell/alignment holes and both SW1 holes; these are present on the rear too.

The Ra-02 rear courtyard is x=120.205…138.795, y=102.355…120.445 mm (18.59 × 18.09 mm including assembly allowance). The audit's body/pad/other-legend exclusion masks leave approximately 557.15 mm² front and 925.15 mm² rear. Total free area is not the limiting factor: the free regions adjacent to the dense passive clusters are fragmented.

## Bounded native-geometry feasibility experiments

The standalone [review script](../scripts/review_fab_legend.py) loads the PCB without saving it. It reserves native Fab bodies plus 0.03 mm, pad rectangles plus 0.16 mm, actual glyph ink rectangles plus 0.10 mm total padding, existing functional legend at 1.0/0.15 mm, and a 0.4 mm edge inset. Each profile uses twelve deterministic greedy orderings. “Local” means a glyph box no more than 1.5 mm from its component's courtyard. This is an association heuristic; leaders and visual review remain necessary where another part is closer. Failure to pack is **not a proof of impossibility**.

The first experiment used square native fonts and tested collision geometry only:

| Height / stroke (mm) | Local references placed | Placed with displacement allowed | Local essential references |
|---|---:|---:|---:|
| 1.0 / 0.15 | 69/90 | 78/90 | 30/32 |
| 0.8 / 0.15 | 83/90 | 90/90 | 31/32 |
| 0.8 / 0.10 | 86/90 | 90/90 | 32/32 |

The 32 essential references include ICs, transistors, diodes, connectors, switches, antenna/crystal, buzzer, LED, test points and FB1. The four local omissions at 0.8/0.10 are C13, C21, C26 and R36. All candidate positions and omissions are in [the feasibility JSON](../reports/fab_legend_feasibility_20261114.json). **These square-font counts are preliminary: inter-character gap checks below prevent treating all of these candidates as fabrication-compliant.**

## Condensed-font check

Simply squeezing every 0.8 mm-high reference to 0.6–0.7 mm width is not an acceptable shortcut. Native KiCad glyph strokes were projected onto the text axis, including the 0.10 mm ink width, to measure actual white space between characters:

| Font width / height (mm) | C13 character gaps (mm) | SW3 character gaps (mm) |
|---|---|---|
| 0.8 / 0.8 | 0.2048, 0.1667 | 0.1667, 0.1286 |
| 0.7 / 0.8 | 0.1667, 0.1333 | 0.1333, 0.1000 |
| 0.6 / 0.8 | 0.1286, 0.1000 | 0.1000, 0.0714 |

Even square SW3 lettering fails the manufacturer's more-than-0.15 mm gap guidance. The second experiment chooses a separate minimum native width for each reference, maintaining at least 0.16 mm between all characters. It retains 0.8 mm height and 0.10 mm stroke. The resulting candidate must be inspected for recognizable character proportions, actual pad/label clearance and association; passing a numeric gap alone is insufficient.

## Practical resolution order

1. Prefer a high-precision 0.8 mm candidate with verified character gaps, all 90 same-side references, and a few short leaders if they clear pads/bodies/other labels. This preserves the owner’s board size and reference requirement without adding electronics.
2. If the remaining dense references cannot be associated locally, expose that precise list and candidate positions for an owner decision. Do not silently rename references, print them under component bodies, or shrink below published limits.
3. A standard-process alternative keeps local essential references at 1 mm and moves some dense references into a clearly titled rear **TOP COMPONENT LOCATOR**, retaining complete front/back assembly drawings. That is a functional tradeoff: labels on the rear are a locator, not labels on the component side. It needs explicit owner acceptance and a designed locator that maps to component positions; a list of names alone does not solve association. The available rear area makes a locator worth exploring but no 90-entry rear locator has been proven here.

Before applying any candidate, save a source backup; preserve reference identities, component coordinates, copper, pads, holes and outline. Then run native DRC with the selected process dimensions and 0.15 mm pad clearance, check every printed glyph/body/leader in rendered views, and bind the accepted report to the final source hash. Keep the complete assembly drawings even when all printed references fit.

## Lessons retained

- A CAD minimum changed to match small lettering does not certify a supplier process.
- Centroid distance unfairly penalizes large components; courtyard-edge distance is more useful, but visual association is an independent requirement.
- Actual stroked glyph bounds avoid unnecessary displacement; their character gaps still require a separate check.
- A collision-free scatter of names and a rear parts list do not satisfy the request for designated-component labels.
- Keep failed plans and measured limitations. Do not rewrite a provisional packing result as a guaranteed optimum or fabricated result.
