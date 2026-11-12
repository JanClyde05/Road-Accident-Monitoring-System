# J2 engineering review package — not a fabrication release

This is the 42 × 32 mm, four-layer AP2112 version. No buck/boost converter.
No order or upload has been made. Read docs/JLC_MANUFACTURING_REVIEW.md and
docs/ASSEMBLY_AND_BRINGUP.md before using these files.

- source/: unchanged, hash-checked native KiCad project and local libraries.
- bare_board/: four copper layers, two masks, two legends, outline, separate
  plated/nonplated Excellon drills, drill maps/report. No assembly purchase implied.
- drawings/: four-page schematic, readable assembly and separate numbered pad maps,
  top/bottom at 1:1 and 4:1.
  Print 1:1 at actual size (no fit-to-page); verify the 42 × 32 mm outline.
- stencils/first_power/: top paste excludes R30, LED1, BZ1 and bottom Ra-02.
- stencils/normal_after_qualification/: top paste includes R30 and LED1.
  Both omit hand-soldered BZ1 and Ra-02. PASTE_ONLY boards are derived artwork
  sources, not replacement fabrication PCBs. Use only the selected .gtp file.
- docs/BOM_PROCUREMENT.csv: owned/procure/qualification notes and staged assembly.
- reports/: zero native CAD findings and their exact sources; physical tests open.
- previews/: copper, mask, paste, legend and assembly plots; incomplete illustrative
  3D models. The absent 3D bodies do not mean those components are omitted.

Proposed fabrication: JLC04161H-3313, 1.6 mm, four layers, outer 1 oz / inner
0.5 oz, green mask, white legend, ENIG. Proposed stencil: 0.10 mm, reproduce
reviewed paste apertures 1:1. Supplier must confirm final impedance and process.
Do not substitute stackup or use the former two-layer prototype order settings.

Open before release: RF/USB impedance review; actual connector/switch/buzzer,
protection MOSFET and LED fit/identity; selected paste and QFN thermal-via
soldering process. Battery/charger, power/temperature, USB, ADC, LED timing,
oscillator and RF performance require assembled-board measurements.
CAD checks and renders are not a claim of working hardware.
