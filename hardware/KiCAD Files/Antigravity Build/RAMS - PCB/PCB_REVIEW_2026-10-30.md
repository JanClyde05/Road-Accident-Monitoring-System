# Ordered PCB review — 30 October 2026

**Verdict: do not assemble the complete board unchanged.** The ordered design has an unpowered ESP32 supply, disconnected ground regions, and a battery-protection component mismatch. Repairs may make these boards useful, but operation and radio performance remain unproven. This is a design review, not a hardware test or an approved assembly procedure.

The user confirmed bare boards, identified `JLCPCB_ORDER_PACKAGE` as the submitted package, and confirmed that the purchased FS8205A for Q3 has six legs. Its exact manufacturer/pinout and the purchased ANT1 variant have not been confirmed.

## Manufacturing-file identification

- Ordered archive: `JLCPCB_ORDER_PACKAGE/1_GERBERS_RAMS_PCB.zip`
- Archive SHA-256: `0c74cf696dfba11d9b9548588514f9f0b6437286112295032579ac4183284c24`
- Reviewed board: `RAMS - PCB.kicad_pcb`
- Board SHA-256: `cccc6209cfafdab1f8c6d15217eb72f07c533188559bad071022571ead0909b4`
- All eleven files in the ordered ZIP match fresh KiCad 10.0.6 exports after removing Gerber comment records and Excellon comment lines. This includes both copper layers, masks, paste, silkscreens, outline, and both drill files. The comparison retained aperture definitions and drawing/drilling commands.
- The board and ordered package were not modified by this audit. Fresh exports went into a temporary review directory.

## 1. Required ESP32 analog supply is not powered — confirmed

U1 pads 55 and 56 are on `/VDDA_PWR`. The only other pads on that net are C21 pad 1 and C22 pad 1. Both capacitors return to ground; there is no connection from this net to a power source.

[Espressif's schematic checklist](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/schematic-checklist.html) specifies 3.0–3.6 V for these VDDA pins. Correct operation must not be expected with this rail floating.

**Repair direction:** connect this rail to the appropriate 3.3 V supply, retaining its decoupling. C21/C22 pad 1 provides an accessible connection point without soldering directly to QFN pins. This is a plausible jumper repair, pending physical continuity checks and wire placement. C22 pad 1 is at board coordinates (121.02, 114.50) mm; its adjacent pad 2 is ground. Do not bridge the two capacitor pads.

## 2. Five disconnected ground regions — confirmed in bare-board copper

The existing DRC reports five `unconnected_items` errors despite its separate “0 DRC violations” summary. A second analysis used KiCad's native polygon operations to merge the saved ground fills, pads, tracks, and vias on each copper layer, then joined the layers through plated connections. It found six separate ground components: the main ground and the following five regions.

| Isolated region | Pads attached to that region | Consequence / repair direction |
|---|---|---|
| A | C8.2 | Input bulk capacitor has no ground return; reconnect to main ground. |
| B | C15.2 | MCU decoupling capacitor has no ground return; reconnect. |
| C | C12.2, C13.2, C14.2, C23.2 | Several supply capacitors and the reset-delay capacitor lack their intended ground return; reconnect this shared region. |
| D | C16.2 | MCU decoupling capacitor has no ground return; reconnect. |
| E | C11.2, U2.1, U2.2 | Separate copper region. A fitted Ra-02 module may bridge this through its internal ground, but that must be verified; provide a proper ground connection rather than assuming it. |

U1 exposed pad 57, USB ground, U5 ground, and U2 pads 9/16 belong to the main ground component. These findings concern physical bare-board connectivity, not just differing net labels.

**Repair direction:** short ground jumpers are plausible. Before assembly, measure continuity from every listed pad to USB ground and compare it with the table. Verify again after repair. Component-internal connections are deliberately excluded from the bare-board analysis.

## 3. Q3 battery-protection MOSFET mismatch — confirmed

The ordered copper has an eight-pad `TSSOP-8_4.4x3mm_P0.65mm` footprint. The order BOM specifies FS8205A, LCSC C908265, SOT-23-6. The [FuxinSemi manufacturer datasheet for that BOM item](https://datasheet.lcsc.com/datasheet/pdf/5d5d336ed528176185784e3faf8fb551.pdf?productCode=C908265) describes a six-lead part. The user has now confirmed that the actual purchased Q3 has six legs, so the package mismatch applies to the parts already on hand. It is not a direct fit; do not attempt to align it with six of the eight existing pads.

Selecting an arbitrary eight-lead FS8205A is also insufficient. The [Fortune FS8205A pin assignment](https://www.ic-fortune.com/upload/Download/FS8205A-DS-12_EN.pdf) differs from the board's connections:

| Pad | Ordered board connection | Fortune eight-lead device function |
|---|---|---|
| 1 | GND | Common drains D12 |
| 2 | GND | Source S1 |
| 3 | DW_OD | Source S1 |
| 4 | DW_OC | Gate G1 |
| 5 | B_MINUS | Gate G2 |
| 6 | B_MINUS | Source S2 |
| 7 | Unconnected | Source S2 |
| 8 | Unconnected | Common drains D12 |

In that eight-lead case, for example, board pad 3 drives a source connection instead of a gate. The protection circuit cannot be accepted as correctly wired. The purchased device's exact manufacturer, pinout, and dimensions remain necessary for a detailed repair.

**Repair direction:** the existing six-leg part may be reusable on a correctly wired adapter after its actual pinout is verified. A separately verified battery-protection circuit is another possible repair. Neither repair has been built or tested. Leave Q3 unpopulated pending that decision. Do not connect or charge a Li-ion/LiPo battery through the present circuit, and do not simply short B_MINUS to GND as a permanent workaround: that would bypass the intended protection. USB-only bring-up still requires correcting the other power and ground defects first.

## 4. ANT1 part/footprint incompatibility — conditional on purchased variant

The board value is `2450AT18D0100E`, but its `Johanson_2450AT18x100` footprint has only two large pads. The [Johanson D0100 datasheet](https://www.johansontechnology.com/datasheets/2450AT18D0100001E/2450AT18D0100001E.pdf) specifies four terminals: one feed and three grounds. This is not a compatible two-pad mounting arrangement.

The ordering notes also suggest `2450AT18B100E`. That is a different antenna with feed and NC terminals, as shown in [Johanson's B100 datasheet](https://www.farnell.com/datasheets/2173873.pdf). The two models must not be treated as interchangeable. Confirm the purchased antenna before soldering it. A corrected antenna connection or suitable external antenna may be possible, but matching and range require RF validation. This review does not establish usable BLE/Wi-Fi range.

## 5. LED hardware and firmware disagree — confirmed

- LED1 DIN is routed to U1 pad 52, which is GPIO46 according to the [ESP32-S3 datasheet](https://documentation.espressif.com/esp32-s3_datasheet_en.pdf).
- Both `firmware/pin_map.h` and `wearable_withApp/config.h` specify GPIO48. Firmware built with those settings will not drive the routed LED data line.
- GPIO46 is a strapping pin; preserve the required boot/download state when using it. The current S3 datasheet lists it as I/O, so this review does **not** classify it as input-only.
- LED1 is powered from 3.3 V, below the 3.5 V minimum stated in the [SK6805-EC20 manufacturer datasheet](https://datasheet.lcsc.com/datasheet/pdf/07c49d22a06f35d4be5cf08c9e5213a0.pdf?productCode=C2890036). It may illuminate at 3.3 V, but reliable operation is not guaranteed. Its numbered power/data pad assignments match that datasheet.

## Other checks and limits

The main LoRa SPI/control GPIO mapping agrees with the inspected firmware. USB D+/D− net assignments through D1 agree with the [USBLC6-2SC6 channel pinout](https://www.st.com/resource/en/datasheet/usblc6-2.pdf). The AP2112 regulator's numbered supply/enable connections agree with its [manufacturer pinout](https://www.diodes.com/datasheet/download/AP2112.pdf). These checks do not establish signal integrity, regulator thermal margin, or assembled operation.

D2's board cathode is on LDO_IN and anode on VBUS, consistent with the intended USB supply path. D3's board cathode is on +3V3 and anode on BUZZER_NEG, consistent with the buzzer clamp direction. Schematic-versus-board warnings for these parts should not be interpreted as proof that the board diode orientation is wrong.

The schematic and PCB have substantial discrepancies. A visually tidier schematic alone would not correct the boards in transit, and the schematic should not yet be used as an authoritative assembly wiring guide.

Recommended order of work: verify actual parts; check the bare board with a meter; repair and verify ground/supply continuity; test the regulator with a current-limited supply and battery disconnected; then bring up the MCU, USB programming, LED/buzzer, and radios in stages. Battery charging/protection comes only after its circuit has been corrected and verified. A suitably equipped technician is advisable for the 0.4 mm-pitch QFN and 0402 assembly/rework.

Not checked: physical manufacturing quality, actual purchased part markings, soldering, firmware execution, oscillator startup, RF impedance/range, power transients/temperature, or battery-protection/charging behavior under fault conditions. No claim is made that the listed repairs alone guarantee a fully working board.
