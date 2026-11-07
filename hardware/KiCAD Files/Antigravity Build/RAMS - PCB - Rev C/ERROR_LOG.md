# Rev C error log and lessons learned

Records mistakes from Rev A/B and corrective actions for Rev C. Following GPT6 Astra's ERROR_LOG pattern.

## ERR-001: Q3 FS8205A wrong footprint (TSSOP-8 vs SOT-23-6)

**Rev A impact:** Board cannot accept purchased SOT-23-6 part. Wasted PCB area and routing.
**Root cause:** Component symbol/footprint was selected without verifying against the actual purchased part.
**Correction in Rev C:** Use SOT-23-6 footprint. Verified pinout from FuxinSemi C908265 datasheet (SRC-C01).
**Prevention rule:** Every component footprint must be verified against the actual purchased part before schematic entry.

## ERR-002: Q3 FS8205A wrong pinout wiring

**Rev A impact:** Even if an 8-pin FS8205A existed, the board wiring did not match any known pinout. Gates connected to sources, drains connected to ground.
**Root cause:** Pin assignments were assumed or copied from an incorrect reference.
**Correction in Rev C:** Verified SOT-23-6 pinout: S1=1, D1=2(common), S2=3, G2=4, D2=5(common), G1=6. DW01A OD(pin1) drives G1(pin6), DW01A OC(pin3) drives G2(pin4).
**Prevention rule:** Every IC pin assignment must be traced to a specific datasheet page number and verified against web sources.

## ERR-003: VDDA supply not connected

**Rev A impact:** ESP32-S3 analog subsystem unpowered. BLE/WiFi radio, ADC, and analog peripherals cannot function.
**Root cause:** VDDA was treated as a separate supply domain but never connected to the 3.3V source.
**Correction in Rev C:** VDDA_PWR net connects to +3V3 with dedicated 10nF + 1uF decoupling (C21, C22). Explicit in circuit_spec.json.
**Prevention rule:** Every ESP32-S3 power pin group (VDD3P3, VDD3P3_CPU, VDD3P3_RTC, VDD_SPI, VDDA) must have a verified connection to a power source and local decoupling.

## ERR-004: Five disconnected ground regions

**Rev A impact:** Multiple decoupling capacitors had no ground return, making them non-functional. System noise and instability guaranteed.
**Root cause:** 2-layer board ground pour had inadequate stitching vias and routing fragmented the pour into islands.
**Correction in Rev C:** Ground stitching via plan (minimum 20 vias), ground continuity verification as a Gate 3 check, DRC must show zero unconnected GND items.
**Prevention rule:** After zone fill, explicitly verify ground continuity. Every capacitor GND pad must have a direct via or trace to the main ground network within 2mm.

## ERR-005: ANT1 footprint/part mismatch

**Rev A impact:** Board has a 2-pad footprint that doesn't match the terminal assignments of either the D0100 (4-terminal) or B100 (2-terminal) variant.
**Root cause:** Antenna variant was not confirmed before footprint selection. D0100 and B100 have different terminal functions.
**Correction in Rev C:** Confirmed purchased antenna is 2450AT18B100E (B100). Pin 1 = feed, Pin 2 = NC (mechanical anchor only, NOT ground). Correct 3216 land pattern per Johanson datasheet.
**Prevention rule:** Antenna part numbers that differ only by a letter code may have completely different terminal functions. Always verify the exact purchased variant.

## ERR-006: LED GPIO mismatch (GPIO46 vs GPIO48)

**Rev A impact:** LED data line routed to wrong pin. Firmware would not control the LED.
**Root cause:** Pin assignment in schematic did not match firmware config.h.
**Correction in Rev C:** LED1 DIN routed to GPIO48 (WROOM-1 module pin 25). Explicit cross-check in Gate 5.
**Prevention rule:** Before finalizing schematic, cross-reference every GPIO assignment against firmware config.h and document the mapping in circuit_spec.json.

## ERR-007: Design rules violated EPDC manufacturing limits

**Rev A impact:** Board designed with 0.10-0.20mm tracks and 0.30mm via drills, which EPDC cannot fabricate (0.30mm min track, 0.40mm min drill).
**Root cause:** Board was designed for JLCPCB capability, not EPDC. EPDC constraints were not considered during original design.
**Correction in Rev C:** All design rules set to EPDC minimums from the start (EPDC_DESIGN_RULES.md). DRC enforces compliance as Gate 2.
**Prevention rule:** Know the target manufacturer's capabilities before starting layout. Set DRC rules to match those capabilities, not a different fab house.

## ERR-008: QFN-56 bare chip used instead of WROOM-1 module

**Rev A impact:** EPDC cannot assemble grid-array/QFN packages. The QFN-56 also requires more complex routing and a 0.4mm pitch escape pattern.
**Root cause:** Bare ESP32-S3FH4R2 was selected for board density, but the schematic spec and firmware were designed around the WROOM-1 module.
**Correction in Rev C:** Use ESP32-S3-WROOM-1 module with castellated pads at 1.27mm pitch. EPDC can handle this with polyimide stencil.
**Prevention rule:** Target manufacturer assembly capability must be confirmed before selecting component packages.
