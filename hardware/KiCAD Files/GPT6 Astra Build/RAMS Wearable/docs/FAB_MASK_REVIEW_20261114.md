# ESP32 exposed-pad mask and stencil review

This supersedes the full 5.7 mm exposed-pad mask opening in the November 13 review. Copper, nine 0.20 mm ground drills, component position and electrical nets are unchanged. This is a standard solder-mask design, without paid filled/capped vias.

The ground pad remains continuous 5.7 × 5.7 mm copper. Its top mask now has sixteen 1.20 × 1.20 mm windows, with 0.10 mm corner chamfers, on a 1.40 mm grid. Nine ground holes lie under the mask intersections. The bottom sides of these nine vias are open; other vias retain their original treatment. Sixteen 1.12 mm paste windows with 0.06 mm corner chamfers fit inside the mask windows. Use a 0.10 mm top stencil.

Derived geometry:

- Straight mask web: `1.40 − 1.20 = 0.20 mm` (JLC green-mask minimum 0.10 mm).
- Minimum nominal mask coverage beyond a 0.20 mm hole edge: `(0.10 + 0.10 + 0.10)/sqrt(2) − 0.10 = 0.1121 mm`. The chamfer enlarges the mask over each hole intersection. Equivalent centred covered-circle diameter is 0.4243 mm.
- Outer mask border over the EP copper: `2.85 − (2.10 + 0.60) = 0.15 mm`, exceeding JLC's 0.076 mm minimum overlap for mask-defined pads.
- Paste area: `16 × (1.12² − 2 × 0.06²) = 19.9552 mm²`; copper area `5.70² = 32.49 mm²`; nominal paste coverage **61.42%**.
- Paste inset from mask: 0.04 mm at straight edges, 0.0283 mm at chamfered corners. These are design dimensions, not a guaranteed stencil-registration allowance.
- QFN perimeter apertures remain 0.75 × 0.20 mm; area ratio at 0.10 mm stencil thickness is 0.789.

[Espressif's S3 layout guidance](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/pcb-layout-design.html) recommends at least nine ground-pad vias; all nine are retained. [TI SLUA271C, December 2023, §3.4.1, p7](https://www.ti.com/lit/an/slua271c/slua271c.pdf) describes top-side tenting/crosshatch mask to reduce solder loss, with a covered diameter at least 0.1 mm larger than the hole. It warns of trapped-air voiding with backside tenting. This supports the technique; it does not qualify this particular ESP32 assembly process.

[JLC's mask-defined-pad instructions](https://jlcpcb.com/help/article/how-to-order-boards-with-solder-mask-defined-pads) require identifying intentionally masked copper and inspecting production artwork. Include U1's exact pattern in the PCB remarks and select production-file confirmation; do not allow CAM to reopen the full EP. [JLC's via-covering guidance](https://jlcpcb.com/help/article/pcb-via-covering) distinguishes ordinary tenting from filled/capped vias and does not guarantee a completely sealed tent. Inspect top coverage on received boards before paste printing. This review makes no claim that tenting eliminates voiding or proves hidden-joint quality.

The first script attempt failed before any CAD save because KiCad names the description setter `SetLibDescription`; the preserved input was reused after verifying its hash. Native mask/paste dimensions and final exported artwork require fresh-process checks. Keep the failed-run note so this API mistake is not repeated.


Final verification, November 15: native board/library parity and an independent Gerber-aperture parser confirm all sixteen chamfered mask/paste openings, all nine bottom via openings, 0.1121 mm nominal top coverage beyond the hole and 61.4195% paste coverage. Native ERC/DRC/parity pass without ignored checks. Final source identities are in reports/final_validation_manifest.json; exported geometry results are in reports/EXPORT_VALIDATION.json.
