# Optional WS2812B-2020 LED decision

**Later 2026-11-09 power decision:** the +3V3/DNP paragraphs below describe the earlier snapshot. The subsequent recommendation is Q5-switched raw battery/USB power and a signal translator; see [LED_RAW_SUPPLY_REVIEW.md](LED_RAW_SUPPLY_REVIEW.md). The reference pinout/footprint findings remain valid. Actual generic-stock voltage, package and current qualification is still open.

Reviewed 2026-11-09. **LED1 is a DNP footprint on +3V3 until the actual ordered LEDs are qualified.** The owner's listing identifies generic 2 × 2 mm, DC 5 V WS2812B-2020 stock, without a verifiable revision. No additional converter is selected. An unpopulated LED does not prevent the core MCU, LoRa, battery measurement or active buzzer from operating.

## Reference symbol and footprint: verified

The installed KiCad 10 symbol `LED:WS2812B-2020` and footprint `LED_SMD:LED_WS2812B-2020_PLCC4_2.0x2.0mm` were compared with Worldsemi's **V1.3, 2019-01-25**, manufacturer document hosted by [Adafruit](https://cdn-shop.adafruit.com/product-files/4684/4684_WS2812B-2020_V1.3_EN.pdf). Page 2 was rendered and visually inspected; evidence is saved below.

| Pad | Reference function | J2 connection | Installed footprint centre at 0° (mm) |
|---|---|---|---|
| 1 | DO | Explicit no-connect | −0.915, −0.550 |
| 2 | GND | GND | −0.915, +0.550 |
| 3 | DI | NEO_DIN | +0.915, +0.550 |
| 4 | VDD | +3V3 | +0.915, −0.550 |

All four lands are 0.70 × 0.70 mm; the horizontal inner gap is 1.13 mm and vertical gap 0.40 mm. These match the reference drawing. The actual drawn body is 2.20 × 2.00 mm. KiCad's zero-degree orientation is rotated 180° relative to the datasheet top view: pad 1 is upper-left in KiCad. Its Fab chamfer identifies that corner. This pin map differs from the previous 5050 symbol; substituting only the footprint would be incorrect.

**This verifies the reference pattern, not the identity or geometry of the received stock.** Inspect the actual polarity mark and package before soldering.

## Supply decision

V1.3 page 3 lists VDD 3.7–5.3 V under its absolute-rating heading and gives VIH minimum 2.7 V at its stated 5 V / 25°C test conditions. The document does not establish operation at 3.3 V. Its input-voltage absolute-rating row is also internally inconsistent with the low-level table; do not use that row to infer power-off injection tolerance. These limitations remain explicit.

Worldsemi's [current V6 product page](https://www.world-semi.com/ws2812-family/223.html) lists a 3.3–5.5 V WS2812B-2020. That does not identify the generic ordered stock as V6, and a nominal 3.3 V rail can fall below 3.3 V with regulator tolerance or battery dropout.

Power and data are separate connections: the ESP32 drives DI; it does not supply the LED through DI. USB VBUS supplies approximately 5 V only while connected. SYS_IN follows the battery when USB is absent, so it can fall below the V1.3 listed supply range. Moving the LED to SYS_IN would not guarantee full battery-range operation and would leave it powered while the main LDO switch is off. Keep the simple switched +3V3/DNP decision.

To populate the optional LED, qualify actual samples for pin orientation, reliable start/reset and colours at the full measured +3V3 range, USB/battery transitions and intended temperature range. Include simultaneous radio/buzzer operation and the LED's measured current in the rail/thermal test. Low-voltage bench success is a project-specific qualification, not a new manufacturer guarantee. If unsuccessful, leave LED1 unpopulated; this decision does not silently substitute a new power architecture.

## Native schematic check and evidence

The regenerated native schematic independently exported through KiCad CLI 10.0.6 confirms LED1's new library, footprint, pin map and **DNP property**. All 228 connected pins, including the seven LED/passive pins, match the reviewed specification; no unexpected connections on intentional NC pins were found. This is schematic consistency, not LED operation or PCB approval.

- `../evidence/j2_led2020_electrical_parity.json` and `j2_led2020_independent_netlist.xml`: reviewed native hashes and connectivity.
- `../evidence/sources/worldsemi_ws2812b_2020_v1_3.pdf`: downloaded primary document, SHA256 `4af8693e601ffee4a361e4a6f5f6815efba0b580541a1321bbf83ed7fb090e3f`.
- `../evidence/sources/worldsemi_2020_package.png`: rendered page 2.
- `../evidence/sources/led_2020_source_manifest.json`: installed-library/reference identities.

No CAD was changed by this independent review; no actual LED was measured.
