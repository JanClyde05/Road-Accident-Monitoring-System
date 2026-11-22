# RAMS wearable — JLCPCB J2 prototype fabrication

The current design is the **42 × 32 mm, four-layer ESP32-S3FH4R2/AP2112 board**, integrating Ra-02, active buzzer, battery measurement and 1S LiPo power. It uses a linear regulator; the earlier buck/boost candidate is archived. DOST remains deferred.

Start with [JLC order instructions](docs/JLC_ORDER_INSTRUCTIONS.md) and [final validation](reports/FINAL_VALIDATION.md). The fabrication handoff is [JLC_PROTOTYPE_20261115](manufacturing/JLC_PROTOTYPE_20261115/READ_ME_FIRST.md); use its **RAMS_J2_JLC_BARE_BOARD.zip** for bare PCBs and the separate **FIRST_POWER stencil ZIP** for initial assembly. Previous ENGINEERING_REVIEW packages are historical and are not the current order files. No order or upload has been made.

This is a first-prototype fabrication release, not a claim of measured electrical operation. The exact JLC stackup, high-precision legend and intentional mask windows must be preserved in production artwork. Confirm those files before production. Use a small first batch and follow [assembly and bring-up](docs/ASSEMBLY_AND_BRINGUP.md).

The November 15 fabrication changes are limited to:

- **Printable references:** 78 on the board, minimum 0.8 mm height / 0.10 mm stroke, with checked character spacing. Following the owner's choice, twelve dense references remain in complete assembly drawings: C12, C13, C15, C19, C21, C26, C27, L1, L4, R7, SW2, SW3. RST and BOOT still identify the buttons; all eight test pads are labeled. Every component/reference is present in the enlarged assembly and numbered pad maps.
- **ESP32 mask/paste:** sixteen chamfered windows retain continuous 5.7 mm EP copper and nine ground vias. Real top-mask coverage reduces solder wicking; bottom openings remain. Nominal paste coverage is 61.42%. No paid filled-via process is specified.
- **RF widths:** 34 segments narrowed from 0.18 to 0.15 mm, keeping endpoints and routing. Official JLC cross-section results are approximately 48.5 Ω RF and 86.3 Ω differential USB for the close-ground model. USB geometry remains unchanged. Antenna matching still requires first-article tuning.
- **Procurement:** the BOM identifies documented compatible USB, switch, button, protection and buzzer choices; reuse owned stock when it matches. See [parts/assembly review](docs/FAB_PARTS_ASSEMBLY_20261114.md).

All schematic files and the canonical 90-component / 96-net circuit are unchanged. The four boxed teaching pages use the existing three hierarchical sheets; double-click a sheet to enter. Read [learning notes](docs/SCHEMATIC_LEARNING_NOTES.md). All 82 physical positions have resolvable 3D assets; eight test pads intentionally do not. [Model sources](docs/3D_MODEL_SOURCES.md) distinguish exact parts from illustrative package models.

First power fits 80 components; LED1 and charge-enable R30 remain absent. Normal assembly fits 82 after their checks. The unknown-revision WS2812B-2020 runs from switched raw battery/USB power with a GPIO48 level translator; a 3.7 V nominal battery does not establish its full-discharge LED operation. R30 enables nominal 100 mA charging only after cell/polarity checks. Top heatbed assembly precedes iron-soldered buzzer and bottom Ra-02.

The native [KiCad project](RAMS_JLC_S3.kicad_pro) and [PCB](RAMS_JLC_S3.kicad_pcb) are authoritative. Historical construction scripts do not reconstruct the routed board and are guarded against destructive regeneration. Read [script workflow](scripts/README.md). The source-bound fabrication manifest checks circuit identity, native ERC/DRC/parity, filled planes, mask/paste, printable labels, models and firmware source hashes; the export verifier checks actual Gerbers, stencil stages, drawings and ZIP contents.
