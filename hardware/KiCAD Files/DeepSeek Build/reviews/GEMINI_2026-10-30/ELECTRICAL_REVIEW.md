# Independent electrical review of GEMINI snapshot

30 October 2026. Read-only review. The root review's 19:29 snapshot is authoritative for these findings. No design or firmware files were modified.

Board SHA-256: `3b3cd5dfd37bc1eb89fa52a72fef844f725ba48c2dcbab6d405219559165fa06`. Circuit-spec SHA-256: `a8dc1ab000e39b2e1dabbea4b1079c93b885eb72f0f0b240a77c54883d1427d0`.

## Release-blocking findings

1. **The schematic power switch shorts the input supply in one position.** `snapshot/RAMS_RevC.kicad_sch:204` and exported XML put SW1.1 on LDO_EN, SW1.2 on LDO_IN, SW1.3 on GND. KiCad's SW_SPDT symbol has common contact pin 2. The 2-to-3 position therefore directly connects LDO_IN to GND. This is a schematic defect, not the same mapping as the board/spec. Correct the intended common/throw mapping against the actual MSK-12C02 before using schematic-to-PCB update. Generator origin: `build/01_build_schematic_astra.py:339`–341.

2. **The schematic and PCB use incompatible transistor pin identifiers.** Q1 has schematic pins G/S/D and Q2 B/C/E, whereas their SOT-23 footprints and board pads are numbered 1/2/3. Exported netlist confirms these are actual identifiers, not display names. The schematic cannot reliably drive those physical pad nets without explicit correct symbols. Sources: schematic lines192/448; generator lines331/410. Use manufacturer-specific numbered symbols. Nexperia's BC817 Table3 states1=B,2=E,3=C: [datasheet](https://assets.nexperia.com/documents/data-sheet/BC817_SER.pdf).

3. **Q2 remains reversed on the PCB despite a corrected circuit specification.** Native board pads:1=BUZZER_BASE,2=BUZZER_NEG,3=GND. The updated spec has2=GND,3=BUZZER_NEG, consistent with BC817. Board reference block starts line5475; spec component begins line641. The later spec edit has not propagated to the PCB. Do not report this as a still-wrong spec or assume the apparently correct schematic drawing proves physical wiring.

4. **Battery-protection sense is wrong in the board/spec but corrected in the schematic.** R5.2 goes to B_MINUS in the board and circuit_spec (component line1013); exported schematic XML has R5.2=GND (schematic line172). The selected DW01 reference senses system-side ground relative to VSS/B_MINUS, so tying both references to B_MINUS defeats sensing across the FET path. Resolve from the exact purchased protector's application circuit; do not regenerate the correct schematic from the wrong spec.

5. **The schematic omits the intended Q1 gate pull-down.** Q1.G is VBUS. The XML VBUS net has only input caps, connector, ESD, charger, diode and Q1; no resistor to GND. R7 instead connects LDO_IN to GND (schematic line224), unlike the intended VBUS pull-down. Battery handoff is thus dependent on undocumented leakage/discharge after USB removal. Restore a deliberately validated gate bias and check every power state.

6. **This is a WROOM carrier, not a board for the owner's bare S3 chips.** U1 value/footprint and physical pad numbering are WROOM-1. WROOM-1 has its own crystal and PCB antenna, so the separate ANT1/crystal network cannot become its RF path. External crystal is explicitly NC in the schematic; its old board nets have no MCU endpoints. The user now explicitly prefers the owned bare S3 architecture. This requires an architecture/footprint/power/RF redesign, not an antenna jumper. [Espressif WROOM datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf) overview and ordering table also distinguish N4 from PSRAM variants; the spec's N4 description claiming2MB PSRAM is unsupported.

7. **Charger and component choices conflict between representations.** Schematic R3=`1.6k (500mA)` in0603 (line118; generator301/304), board/spec=4.3k in0402; schematic D2=SS34 (line197), board/spec=SS14 SMA. The current claim for1.6k must be recalculated for the actual charger; for an IC using1000/R(kΩ) mA it would be625mA, not500mA. Cell and exact charger identity remain unverified. Do not assemble from this schematic BOM.

8. **Battery sensing is two different circuits.** Schematic R13/R14 are100k/100k and R15 is10k LED-DIN pull-down (lines476/481/486); board/spec R14/R15 are330k/180k and R13 is buzzer bias. Firmware ratio2.0 matches the schematic nominal divider but not the board's2.833333. A4.2V cell would nominally be reported as2.965V using that wrong scaling, before ADC error. Fix one contract and all references/values/footprints/firmware consumers together.

9. **LED supply remains unverified.** Both schematic and board put the owned WS2812B5050 on3.3V. Inventory saysDC5V; exact silicon revision is unknown. Older Worldsemi electrical limits do not establish operation there. [Manufacturer datasheet hosted by Adafruit](https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf). Verify variant or design an appropriate rail/logic solution; one LED illuminating is not operating-range evidence.

10. **Wrong LoRa symbol creates an assembly ambiguity.** Schematic U2 is Ra-01, whose pin1 is labelled ANT and tied to GND; board/spec identify owned Ra-02 with pin1GND. If a Ra-01 is assembled from the schematic's BOM, its RF terminal is grounded. Use exact Ra-02 symbol/part evidence, not a module-family approximation. Schematic reference starts line405.

## Current improvements and checks that must not be misreported

- Q3 has the expected conditional Fuxin six-pin mapping in the exported schematic and current PCB/spec:3=S2/GND,4=G2/DW_OC. No confirmed pin3/4 swap was found. Exact Shopee manufacturer still needs identification.
- D2's actual PCB footprint is now SMA, and R3 is now4.3k on the PCB/spec. Old mismatches are fixed there, but not synchronized with the schematic.
- Every numbered physical U1 pad41 in the current board is GND. The earlier missing-net issue on numbered pad41s is no longer present; unnamed footprint objects require their own geometric/assembly interpretation.
- Native board currently contains68 footprints,43 vias and **zero track segments**. It remains an unrouted main-board source. A separate routed test file is not an accepted synchronized master.

## Why the sources diverge

`build/02_build_pcb.py` loads `circuit_spec.json` and assigns pad nets from its component map (source lines31,116,258–269). `build/01_build_schematic_astra.py` separately hard-codes a different circuit and values: Q1 at331, R3 at301, R5 at323, Q2 at410, divider at429–431, RF placeholders at438–442. Updating the spec therefore cannot correct that schematic, and updating the schematic cannot correct the spec. Consolidate a reviewed electrical contract, then regenerate/update both and run endpoint parity; do not merely route the existing wrong nets.

No physical assembly, power, protection, RF or thermal tests were performed. This subreview does not replace the root's complete DRC/DFM report.
