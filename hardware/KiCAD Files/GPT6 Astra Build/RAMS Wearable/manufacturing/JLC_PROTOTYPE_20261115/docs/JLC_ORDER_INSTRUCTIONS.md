# RAMS J2 — first prototype fabrication

Prepared 2026-11-15 for the **42 × 32 mm, four-layer ESP32-S3FH4R2/AP2112 board**. This is the linear-regulator version; no buck/boost converter. Order files are in `manufacturing/JLC_PROTOTYPE_20261115/`. Source hashes and validation status are recorded in `reports/final_validation_manifest.json`; exported-artwork checks are in `reports/EXPORT_VALIDATION.json`.

## Files to use

- **Bare PCB:** `RAMS_J2_JLC_BARE_BOARD.zip`. Contains four copper layers, two masks, two legends, outline, separate plated/nonplated drills and the Gerber job file. Upload this ZIP to the PCB service.
- **Recommended initial stencil:** `RAMS_J2_TOP_STENCIL_FIRST_POWER.zip`. Top paste only; omits R30 charge-enable link, LED1, hand-soldered buzzer and bottom Ra-02.
- `RAMS_J2_TOP_STENCIL_NORMAL_AFTER_QUALIFICATION.zip` is an alternative for later builds after battery/LED qualification. It includes R30 and LED1. **Do not combine the two stencil variants.** One stencil is sufficient for the first batch; fit the staged small parts later by hand.
- `drawings/` contains the four-page schematic and distinct assembly/pad maps, top/bottom, at 1:1 and 4:1. Print 1:1 at actual size, then measure the 42 × 32 mm outline before using it for stock-fit checks.

The large complete-project ZIP is an archive for you, not the PCB upload. Derived `PASTE_ONLY.kicad_pcb` files are stencil sources, not replacement boards.

## PCB order settings

| Setting | Selection |
|---|---|
| Product / quantity | Bare FR-4 PCB; first prototype batch, e.g. 5 boards; no JLC assembly |
| Layers / size | 4; 42 × 32 mm; single board, routed outline |
| Thickness / exact stackup | Nominal 1.6 mm; **JLC04161H-3313** (published finished nominal 1.56 mm ±10%); no stackup substitution |
| Copper | Outer 1 oz, inner 0.5 oz |
| Mask / legend | Green mask, white legend; **high-precision characters** (0.8 mm minimum height, 0.10 mm stroke) |
| Finish | ENIG, for flat fine-pitch lands |
| Impedance | Controlled impedance enabled; top RF 50 Ω ±10%; USB differential 90 Ω ±10%; see details below |
| Vias | Ordinary tenting per supplied masks; U1's nine 0.20 mm ground vias top covered / bottom open; no ink plugging or paid filled/capped process in this design |
| Electrical test | Retain the supplier's electrical test |
| Board marking | Current no-mark default; do not add an order-number placeholder or optional serial-number service |
| Production files | **Confirm Production File = Yes**; inspect final copper, mask, legend, outline and drills before approval |

The high-precision legend option is required for the selected 78 printed references. Twelve dense references are retained in the complete assembly drawings; RST/BOOT still identify the buttons and all eight test pads are labeled. If the order form does not offer it, obtain confirmation for these dimensions before payment/production; the standard 1.0/0.15 mm process is not interchangeable. No current price or delivery date is promised.

[JLC's current marking instructions](https://jlcpcb.com/help/article/how-to-mark-on-pcb), updated May 22, 2026, state that default order-number printing ended in May 2026. The former `JLCJLCJLCJLC` placeholder is obsolete; no extra board area or removal service is needed for that default.

RF uniform runs use 0.15 mm width with nominal ≥0.15 mm side-ground clearance, reference In1 ground. USB uses 0.15 mm width / 0.15 mm pair gap, reference In1 for top and In2 for bottom. The official JLC calculator results and sensitivity are in `FAB_IMPEDANCE_20261114.md`. Matching pads, vias, connector branches and the antenna's intentional no-ground region are discontinuities, not uniform transmission-line coupons. Do not change the antenna keepout to enforce a uniform-impedance claim there.

Suggested PCB remark (copy with the settings above):

> Use JLC04161H-3313, outer 1 oz / inner 0.5 oz. High-precision white characters: minimum 0.8 mm height / 0.10 mm stroke. U1 EP uses intentional solder-mask-defined windows: preserve all 16 chamfered F.Mask openings and mask webs exactly; do not enlarge to one full EP opening. Nine 0.20 mm vias in U1 EP must remain top masked and bottom open per Gerbers; no ink/epoxy fill specified. Preserve 0.15 mm QFN perimeter mask webs. Impedance: 50 ohm RF, 90 ohm differential USB, tolerance +/-10%; confirm before changing artwork or stackup. Supply production files for customer confirmation.

## Stencil order settings

Use **top side only, 0.10 mm stainless steel**, an unframed size suitable for your printing holder. Select one stencil ZIP above. Request **exact 1:1 reproduction of the submitted paste apertures, without automatic aperture optimization**. Preserve U1's sixteen chamfered windows and stage omissions. Do not add bottom Ra-02 or buzzer apertures. Review the production stencil preview before approval. No panel rails or assembly tooling holes have been added to the board.

## What fabrication readiness means here

The final report covers native ERC/DRC/parity, selected supplier geometry, mask/paste, source invariants, exact parts alternatives, source hashes and export checks. Production-file confirmation is the ordinary final supplier step; no files have been uploaded, approved or ordered by this work.

Order a small first batch. Electrical operation is still unmeasured: follow `ASSEMBLY_AND_BRINGUP.md`. Use the approved BOM choices or verify owned equivalents before placement. Inspect mask tents before paste printing; ordinary tenting is not guaranteed filled-via sealing. Record the actual paste alloy/profile and check board temperature on the heatbed. Hand-solder buzzer and bottom Ra-02 afterward.

LED1 and R30 remain absent for first power. The bought LED's exact revision and low-voltage behavior need checking before fitting; the circuit already translates GPIO48 to its raw LED supply. R30 enables nominal 100 mA charging only after the cell specification/polarity checks. These staged assembly checks do not imply that an untested board will have no problems.

Sources: [JLC stackups/calculator](https://jlcpcb.com/impedance), [high-precision character limits](https://jlcpcb.com/blog/character-design-specifications), [mask-defined-pad ordering](https://jlcpcb.com/help/article/how-to-order-boards-with-solder-mask-defined-pads), [stencil capabilities](https://jlcpcb.com/capabilities/pcb-stencil-manufacturing). Detailed evidence and calculations accompany the project.
