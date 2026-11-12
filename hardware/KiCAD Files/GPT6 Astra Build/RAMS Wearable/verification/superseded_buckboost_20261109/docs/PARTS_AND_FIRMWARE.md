# JLCPCB wearable: parts and firmware contract

> **SUPERSEDED SELECTIONS — 2026-11-09:** The owner requires a simpler 3.3 V design integrating the working Supermini functions and a passive buzzer. Buck-boost, 3.45 V, PUI active-buzzer and associated purchases below are withdrawn. Read `SIMPLIFICATION_20261109.md`; reusable pin/geometry evidence must be rechecked against the revised circuit.

Prepared 2026-11-08, Asia/Manila. This is the new bare ESP32-S3FH4R2 design. Original Rev A/B/C and DOST work are references only. No purchases or supplier submissions were performed.

## Owner inputs and procurement rule

- Owner selected JLCPCB, bare S3, a maximum 42 x 32 mm board, top-side heatbed reflow and bottom-side Ra-02 hand soldering.
- Available battery choices are single-cell 3.7 V LiPo, 500 mAh and 1000 mAh. Exact cell model, permitted charge current, discharge rating, dimensions and harness polarity still need checking.
- Use matching owned parts where their identity and dimensions are established. Buy the selected exact part when the stock is unidentified or incompatible. A generic Shopee title does not establish equivalence; no stock quantity below is a physical count.
- Prototype assembly uses a verified LTC4054ES5-4.2, provisionally 100 mA with 10 kOhm PROG. This is nominally 0.2C for 500 mAh or 0.1C for 1000 mAh, but the cell's own charge rating remains controlling. The unknown LTH7-marked inventory is not automatically the selected IC.
- The new LED must be the specified WS2812B V6 compatible with the selected rail, rather than an assumed revision of the owned DC5V stock. See the main circuit/BOM for its exact selected variant and voltage limits.

## Exact mechanical and timing selections

| Function | Selected component and footprint | Evidence and stock consequence |
|---|---|---|
| Horizontal USB-C | GCT **USB4105-GF-A**, standard 0.95 mm shell stakes; `Connector_USB:USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal` | [GCT drawing](https://gct.co/files/drawings/usb4105.pdf), revision B4, 2023-12-18, sheet 1. Native footprint pad/slot coordinates checked against drawing. Owned horizontal and vertical generic connectors are unverified alternatives, not substitutions. |
| Power slide | C&K **PCM12SMTR**; `Button_Switch_SMD:SW_SPDT_PCM12` | [Manufacturer PCM datasheet](https://www.ckswitches.com/media/1424/pcm.pdf), 2025-03-14, pages 1-2. Pin 2 common, selected to 1 or 3. Rating 0.3 A at 6 V: use as enable control, not an unbounded combined-load current switch. Owned MSK-12C02 is a different footprint. |
| Reset and boot/cancel | C&K **PTS810SJM250SMTRLFS**; `Button_Switch_SMD:SW_SPST_PTS810` | [Manufacturer PTS810 datasheet](https://www.ckswitches.com/media/1476/pts810.pdf), 2026-02-02, pages 1 and 3. 4.2 x 3.2 mm, 2.5 mm high, 1.6 N, SPST momentary. Manufacturer orderable code Y97LT25B2DBFP. Owned generic two-pin 3 x 4 mm switches are not treated as four-terminal equivalents. |
| Active buzzer | PUI Audio **SMI-1027-TW-3V-R**; `RAMS_JLC:Buzzer_PUI_SMI-1027-TW-3V-R` | [Manufacturer product](https://puiaudio.com/product/indicators/smi-1027-tw-3v-r), [manufacturer PDF](https://api.puiaudio.com/filename/SMI-1027-TW-3V-R.pdf), Rev D revision-table date 2025-01-24, pages 1 and 4. 9.7 x 9.7 x 5 mm, self-driven DC tone, 2-5 V operation, <=30 mA at rated 3 V, >=80 dBA at 10 cm at rated conditions. Unknown 9650 stock remains conditional. The saved PDF filename's older date is not the revision-table date. |
| 40 MHz crystal | Abracon **ABM8-40.000MHZ-10-1-U-T**; `RAMS_JLC:Crystal_Abracon_ABM8_3225` | [Exact manufacturer part page](https://abracon.com/parametric/crystals/ABM8-40.000MHZ-10-1-U-T), [ABM8 datasheet](https://abracon.com/Resonators/abm8.pdf), revised 2020-07-29, pages 1-2. Fundamental, CL 10 pF, ESR <=35 Ohm, initial tolerance +/-10 ppm, stability +/-10 ppm, -10 to +60 C, 3.2 x 2.5 x 0.8 mm. Owned 40 MHz/3225 crystals lack CL/ESR evidence. |

This selects the engineering parts, not a guarantee of current Shopee stock. Verify full MPN and seller-supplied datasheet before buying an alleged equivalent. No fabrication release depends on accepting an unknown generic mechanical part.

### Exact local footprint geometry

Coordinates are millimetres in the unrotated top-side footprint; positive Y is downward. Both custom footprints loaded successfully using installed KiCad 10 `pcbnew.FootprintLoad`.

- **PUI buzzer:** two 1.7 x 1.5 rectangular lands, inner edge gap 8.4, centre separation 9.9. Pad 1 positive at (0, +4.95), pad 2 negative at (0, -4.95). The top-view body has its chamfer at the upper-right. The drawing's side-view polarity mark associates the lower terminal with positive. F.Fab follows the 9.7 mm body; the courtyard includes protruding pads and assembly clearance. Height is 5 mm. No generic 3D model was fabricated.
- **ABM8:** four 1.3 x 1.05 lands with horizontal inner gap 1.0 and vertical inner gap 0.7. Centres: pin 1 (-1.15, +0.875), pin 2 (+1.15, +0.875), pin 3 (+1.15, -0.875), pin 4 (-1.15, -0.875). Pins 1/3 are crystal; pins 2/4 are grounded case. The manufacturer's chamfer can occur at several corners, so the fab chamfer is illustrative rather than a guaranteed physical orientation cue. The installed generic 3225 footprint differs slightly; this local footprint uses the manufacturer's recommended geometry.
- **USB:** 0.30 x 1.15 signal pads at 0.50 pitch, 0.60 x 1.15 power/ground lands; front/rear shell slots are 0.60 x 1.40 and 0.60 x 1.70. Shell columns are 8.64 apart; pegs are 5.78 apart with 0.65 holes. Duplicate A/B power and ground pad positions in the KiCad footprint are intentional; corresponding schematic nets must match. Preserve slotted plated shell retention holes.

For the selected 10 pF crystal, equal 12 pF capacitors imply `CL = 12/2 + Cstray = 6 pF + Cstray`; reaching 10 pF requires approximately 4 pF total parasitic loading. This is a starting assumption, not a guaranteed load match. Confirm startup, drive and RF frequency with the final layout; use manufacturer-qualified C0G loading parts and retain the approved tuning process.

## Inventory reconciliation

The inventory Markdown contains 51 detailed purchasable entries across 25 orders; its headline says 47 variations. Use detailed entries and selected pack quantities, then count usable stock before allocation.

| Recorded owned item | Nominal ordered stock | New-design disposition |
|---|---:|---|
| ESP32-S3FH4R2 | 5 | Reuse if actual marking and condition match; exact FH4R2 package required. |
| Johanson 2450AT18B100E | 5 | Reuse exact B100 ceramic antenna, subject to the RF geometry/tuning contract. |
| Ra-02 | 2 | One per wearable; reserve a receiver module if required. |
| USBLC6-2SC6 | 20 | Reuse matching SOT23-6 protection parts. |
| DW01A / FS8205A six-leg | 20 each | Actual manufacturer/pinout must match selected circuit. Similar names do not establish gate/drain mapping. |
| AO3401 | 50 | Reuse only if selected manufacturer's pinout/electrical limits match. |
| BC817-25 / 1N4148W | 20 / 50 | Reuse matching NPN and SOD123 diode; BC817 is 1 base, 2 emitter, 3 collector. |
| SS14 | 20 | Owned package is SMA/DO-214AC, not SOD123. |
| 3 V 9650 active buzzer | 5 | Conditional; selected exact PUI part avoids undocumented footprint/current. |
| WS2812B 5050/DC5V | 100 | Reserve unless V6 identity and orientation can be established. |
| AP2112 / RT9013 / AMS1117 | 10 / 20 / assorted | Reserve if not selected in final power circuit; ownership does not justify adding them. |
| MPU-6050 | 5 | Reserve; current phone-assisted firmware has no onboard IMU requirement. |
| 10 uF 0603 / 47 uF 0805 | 10 / 10 | Verify ratings and DC-bias capacitance; quantity depends on final BOM. |
| 330 kOhm 1% / 180 kOhm 5% | 100 / 200 | Not the new ADC divider; retain as stock. |
| Generic connectors/switches/crystals | Listed packs | Compare exact drawings before reuse; new design selects named replacements above. |

Unlisted or unverified system items: a correctly wired battery harness, appropriate 433 MHz antenna/cable for each Ra-02, and final enclosure/insulation. The B100 2.4 GHz antenna cannot serve as the LoRa antenna. Missing small resistor values and RF passives must be taken from the final BOM; the 0805 assortment's individual values are not documented.

## Firmware mapping and ADC requirements

Current firmware is `firmware/wearable_withApp`; phone GPS and IMU arrive via BLE. No onboard GPS or MPU-6050 branch is added. Main mapping:

| Signal | GPIO | Bare S3 package pad |
|---|---:|---:|
| Boot / cancel, active low | 0 | 5 |
| Buzzer, high enables DC tone | 1 | 6 |
| Battery ADC | 2 | 7 |
| Ra-02 DIO0 | 8 | 13 |
| Ra-02 reset | 9 | 14 |
| Ra-02 chip select | 10 | 15 |
| Ra-02 MOSI | 11 | 16 |
| Ra-02 SCK | 12 | 17 |
| Ra-02 MISO | 13 | 18 |
| USB D- / D+ | 19 / 20 | 25 / 26 |
| RGB DIN | 48 | 36 |

The new divider is **10 kOhm / 10 kOhm, both 0.1%**, preserving firmware multiplier 2.0. Nominally 4.2 V becomes 2.1 V and draws 210 uA while sensing is enabled. Worst ratio from independent resistor tolerances is approximately 1.998002 to 2.002002; divider-only inferred-voltage error with nominal multiplier is +/-0.1%, before leakage/ADC errors. A 10 nF ADC capacitor sees 5 kOhm Thevenin resistance: tau = 50 us, 5 tau = 250 us. This replaces the initially proposed 100 kOhm/100 kOhm with 100 nF, whose 5 ms discharge could hold the ADC node above a falling MCU supply. Current `setup()` waits 500 ms before initializing peripherals/battery, covering nominal startup settling after MCU reset release.

`battery.cpp` currently uses raw ADC / 4095 x 3.3 V. The ratio match avoids a new scale-factor mismatch but does not calibrate the ESP32-S3 ADC. Hardware commissioning must compare reported voltage with a DMM sweep; calibrated millivolt acquisition is a separately reviewed firmware correction. `BATTERY_EMPTY_VOLTAGE=3.00` is only the percentage endpoint: the firmware has no shutdown at that voltage. Do not count it as battery cutoff protection.

### Switched measurement and reset supervision

The selected high-side sensing switch is TI **TPS22919DCKR**, `Package_TO_SOT_SMD:SOT-363_SC-70-6`. [TI SLVSEN5B](https://www.ti.com/lit/ds/symlink/tps22919.pdf), page 3, confirms 1=IN, 2=GND, 3=ON, 4=NC, 5=QOD, 6=OUT. The native footprint has pins 1/2/3 down the left and 6/5/4 down the right, 0.65 pitch, matching the top-view diagram. IN connects to battery positive referred to protected system GND; OUT feeds the upper 10 kOhm resistor; QOD connects to OUT through R40=100 Ohm; pin 4 stays unconnected. Disabling the switch discharges OUT through this resistor and the internal path, rather than leaving the divider supply floating.

Use **TLV803EA30DBZR** to supervise the system rail and drive MCU_EN plus TPS22919 ON. The `A` is part of the orderable MPN; `TLV803E30DBZR` is incomplete. [TI exact part](https://www.ti.com/product/TLV803E/part-details/TLV803EA30DBZR) and [SLVSES2J](https://www.ti.com/lit/ds/symlink/tlv803e.pdf), sections 6, 7.5, 7.6 and 12.1, establish pin 1 GND, 2 open-drain active-low RESET, 3 VDD for the standard DBZ SOT23 variant. Use `Package_TO_SOT_SMD:SOT-23`; R/V alternate-pinout suffix variants are not interchangeable. No exact installed KiCad symbol was found; the project symbol must use this explicit mapping. Add local 100 nF VDD bypass and the reset pull-up.

Threshold code 30 means **3.08 V**, +/-2% maximum; delay A is 200 ms nominal (130-270 ms). A bounded calculation gives falling threshold 3.0184-3.1416 V. The supervisor's low output is specified down to 0.7 V under its stated load conditions. The existing large 1 uF reset capacitor is unnecessary for the supervisor's startup delay and would lengthen fault assertion; omit it on the shared RESET/ON node or independently review a separate MCU-only RC.

This corrects the rejected PG-control proposal: [TPS63020 section 7.3.4](https://www.ti.com/lit/ds/symlink/tps63020.pdf) monitors average inductor-current limit, not a guaranteed output voltage window in every power state. The supervisor provides a defined voltage threshold. Final acceptance still measures normal rail ramp, switch-off and fault collapse against ADC voltage: the ADC capacitor retains charge, the supervisor and load switch have finite propagation times, and an arbitrarily fast rail short is not proven safe by a threshold calculation alone.

Bounded shutdown estimate: assume 100 uF **effective** rail capacitance, 0.45 A constant discharge load, 50 us supervisor response under its specified overdrive test, and the switch's 6 us typical turnoff. Rail drop during 56 us is `I*t/C = 0.252 V`, leaving 2.766 V from the minimum falling threshold when divider discharge begins. At 50 uF effective, the remaining voltage is 2.514 V. These are conditional engineering estimates; the switch turnoff is not a guaranteed maximum and nominal MLCC capacitance is not effective capacitance. Verify actual biased capacitance, maximum load, on/off/hot-plug waveforms and fault response. Do not approve a GPIO excursion solely because its injection current is small; no guaranteed permissible injection-current allowance was established for this design. The acceptance check is GPIO2 no higher than its powered domain plus 0.3 V, including the turnoff transient.

Preserve radio settings (433 MHz, SF9, 125 kHz bandwidth, coding 4/5, 17 dBm, sync 0x34), packet layouts, debounce and alert timing. Holding GPIO0 low through reset enters the boot/download path; explain that dual use in bring-up instructions. No firmware files were edited by this subtask.

## Evidence and limits

Manufacturer ABM8, PUI, GCT, TPS22919 and TLV803E PDFs are saved in `../evidence/sources/`. ABM8 page 2, PUI page 4, GCT sheet 1 and TPS22919 page 3 were rendered and visually inspected. C&K manufacturer PDFs were read via the web source; direct local download returned access denied, so a local copy is not claimed. Both custom footprints passed native load and pad geometry inspection. No assembled fit, acoustic result, crystal startup, ADC calibration, battery charge acceptance or final-board DRC is claimed by these part-selection checks.
