# RAMS Wearable and Receiver — Net-level Schematic Spec v0.1

Prepared for JC. Tags: \[Certain\] = from a datasheet or source file, \[Likely\] = strong inference, \[Guessing\] = placeholder to verify. Pin numbers for the ESP32-S3 power pins come from the hxelec S3P reference schematic. Everything marked VERIFY must be checked against the datasheet when the KiCad symbol is created.

## 0. Decisions locked

- Board: 4-layer, JLC impedance stackup, 30 x 25 mm target, parts on both sides if needed.
- MCU: ESP32-S3FH4R2 (flash and PSRAM in package). No external flash.
- LoRa: Ra-02 module, hand-soldered, KiCad symbol RF\_Module:Ai-Thinker-Ra-02 with footprint RF\_Module:Ai-Thinker-Ra-01-LoRa after a 1:1 print test.
- Battery: 500 mAh class cell, charged at 250 mA. A 10,000 mAh cell also works but charges in about 40 hours at 250 mA \[Likely\].
- Charger: LTH7R. I\_BAT = 1000 / R\_PROG(kOhm) \[Certain, datasheet: 2k gives 465-535 mA, 10k gives 90-130 mA\]. R\_PROG = 4.02 kOhm 1% gives about 249 mA. Dissipation at 250 mA from 5 V into a 3.7 V cell is about 0.33 W \[Certain arithmetic\]; 500 mA would roughly double that in a SOT-23-5 and trigger thermal foldback \[Likely\].
- Protection: DW01A + FS8205A always fitted, in the negative lead.
- Switch: SPDT SMD slide switch (MSK12C02) on the LDO EN pin only.
- Connector: JST-SH 1.0 mm 2-pin (C160402) with a pre-crimped pigtail soldered to the cell's bare wires.
- Buzzer: active 3.3 V SMD, driven by an NPN.
- LED: SK6805-EC15 on GPIO48, powered from 3.3 V (out of its 3.7 V spec, as on the S3P) \[Likely works\].
- No sensor headers. Only the pins listed in section 7 are used. No UART0 pads.

## 1. USB-C and charger (wearable only for the charger)

| Ref | Part | Connections |
| --- | --- | --- |
| J1 | USB-C 16-pin TYPE-C-31-M-12 (C165948) | VBUS to net VBUS. CC1 and CC2 each to GND through 5.1 kOhm. D+ pins to USB\_DP, D- pins to USB\_DN. SBU pins unconnected. Shield to GND. |
| D1 | USBLC6-2SC6 (C7519) (option: USBLC6-2P6 if stocked, saves area) | I/O pins on USB\_DP and USB\_DN, VBUS pin on VBUS, GND to GND. Place within a few mm of J1. |
| C1 | 10 uF, 16 V, 0603 | VBUS to GND at the connector (Espressif asks for 10 uF or more at the power entrance). |
| C2 | 0.1 uF | VBUS to GND. |
| U3 | LTH7R (C841234), SOT-23-5 | VCC to VBUS (input range 4.5-5.5 V, UVLO about 3.4 V). BAT to net B\_PLUS. PROG to R\_PROG then GND. CHRG optional to a charge LED. GND to GND. VERIFY pinout. |
| R\_PROG | 4.02 kOhm 1% | PROG to GND. |
| C3, C4 | 1 uF in on VBUS, 4.7 uF out on B\_PLUS | Close to U3. |
| LED\_CHG (optional) | Small SMD LED + 1 kOhm | From VBUS through the LED and resistor to the CHRG pin. Can be left unfitted. |

## 2. Battery, protection, power path, switch, LDO (wearable only)

| Ref | Part | Connections |
| --- | --- | --- |
| J2 | JST SM02B-SRSS-TB (C160402) | Pin 1 = cell +, to B\_PLUS. Pin 2 = cell -, to B\_MINUS. Mark + on silkscreen. Check polarity of the pigtail with a meter before connecting. |
| U4 | DW01A | VCC to B\_PLUS through 330 Ohm, 0.1 uF from VCC to VSS. VSS to B\_MINUS. OD and OC drive the gates of Q\_P1/Q\_P2. CS to the FS8205A common source through about 1 kOhm. VERIFY values against the DW01A datasheet. |
| Q\_P (FS8205A) | Dual N-FET | In series between B\_MINUS and system GND (the charger and load return through it). VERIFY pin map. |
| Q1 | P-FET, SOT-23 (AO3401A class, VERIFY stock) | Drain to B\_PLUS, source to LDO\_IN, gate to VBUS. 100 kOhm from gate to GND. USB present: gate high, FET off. USB absent: gate low, FET on. Orientation matters: with source on LDO\_IN, the body diode does not back-feed the battery from USB. \[Likely\] |
| D2 | Schottky, SOD-123 (SS14 or B5819W class, VERIFY) | Anode to VBUS, cathode to LDO\_IN. |
| SW3 | MSK12C02 (C431540), SPDT | Common to LDO EN. One throw to LDO\_IN, the other to GND. |
| U5 | AP2112K-3.3TRG1 (C51118), SOT-23-5 | VIN to LDO\_IN, EN to SW3 common, VOUT to net 3V3, GND to GND. 600 mA, 250 mV max dropout. VERIFY pinout. |
| C5, C6 | 10 uF in on LDO\_IN, 10 uF out on 3V3 | Close to U5. Add 1 uF at the load end of 3V3. |

The battery divider (section 6) reads B\_PLUS, so it stays live when SW3 is off and leaks about 8 uA.

## 3. ESP32-S3FH4R2 core (U1)

| Function | Pin(s) | Parts |
| --- | --- | --- |
| VDD3P3 analog | 2, 3 | From 3V3 through L1 2 nH (0402); at the pins: 10 uF, 1 uF, 2 x 0.1 uF. |
| VDD3P3\_CPU | 46 | 0.1 uF |
| VDD3P3\_RTC | 20 | 0.1 uF |
| VDD\_SPI | 29 | 1 uF + 0.1 uF |
| VDDA | 55, 56 | 10 nF + 1 uF |
| CHIP\_PU (EN) | 4 | 10 kOhm to 3V3, 1 uF to GND, RESET tact switch to GND |
| GPIO0 | 5 | BOOT tact switch to GND (internal pull-up; optional 10 kOhm pull-up pad) |
| XTAL\_P / XTAL\_N | 54 / 53 | Crystal Y1 40 MHz 10 pF ESR per datasheet (JGHC C426988, backup C524770). 12 pF NP0 load caps to GND. 22 Ohm series on XTAL\_P (S3P value); layout pad also fits a 24 nH inductor (Espressif value). |
| GND exposed pad | 57 | Solid ground, vias to the plane. |
| USB | GPIO19 = D-, GPIO20 = D+ | Straight from D1 side, short; optional 22 Ohm series footprints, unfitted. |

All S3P-derived values are \[Likely\] valid for the same chip family; confirm against Espressif's checklist at layout.

## 4. 2.4 GHz antenna (optional but fitted)

ANT1 Johanson 2450AT18D0100E (3.2 x 1.6 mm). LCSC number not yet found.

Chain from the antenna feed: C\_a (NC shunt), R\_a 0 Ohm series, C\_b (NC shunt), then C19 2.4 pF shunt, L2 2.4 nH series, C18 2.7 pF shunt at the LNA\_IN pin (pin 1). These are the S3P values; tune on hardware. Use 0402 for all six so you can rework them by hand. RF trace about 0.183 mm on the top layer over an unbroken In1 ground (S3P value, VERIFY in JLC's impedance calculator). Keep a 4 x 6 mm copper-free keep-out on all layers at the board edge under the antenna.

## 5. LoRa (U2, Ra-02 module)

| Ra-02 pin | Net | ESP32 pin |
| --- | --- | --- |
| VDD | 3V3 | 10 uF + 0.1 uF at the pin |
| GND (4 pads) | GND |  |
| NSS | NSS | GPIO10 |
| MOSI | MOSI | GPIO11 |
| SCK | SCK | GPIO12, with about 33 Ohm series near the chip \[Guessing\] |
| MISO | MISO | GPIO13 |
| RESET | RST | GPIO9 |
| DIO0 | DIO0 | GPIO8 |
| DIO1-DIO5 | unconnected |  |

The module has its own U.FL connector for the 433 MHz antenna. Keep the module's U.FL edge toward a board edge, far from the 2.4 GHz antenna. Supply limit is 3.7 V, so the module must be fed only from the 3.3 V rail.

## 6. Peripherals

| Ref | Part | Connections |
| --- | --- | --- |
| LED1 | SK6805-EC15 (C2890035), 1.5 mm | VDD to 3V3 with 0.1 uF, DIN to GPIO48, DOUT unconnected, GND. |
| BZ1 | Active SMD buzzer SMD-9650-3327 (C42420997), 3.3 V, 30 mA | Positive to 3V3, negative to Q2 collector. |
| Q2 | NPN, BC817-25 class (VERIFY stock) | Emitter to GND, base to GPIO1 through 1 kOhm, 100 kOhm base to GND. |
| D3 | Schottky or 1N4148W | Across BZ1 as flyback (cathode to 3V3). Can be unfitted for a purely electronic active buzzer. |
| R\_DIV1 | 330 kOhm 1% | B\_PLUS to node VBAT\_SENSE. |
| R\_DIV2 | 180 kOhm 1% | VBAT\_SENSE to GND. At 4.2 V the node sits at 1.48 V \[Certain arithmetic\]. |
| C\_ADC | 0.1 uF | VBAT\_SENSE to GND, close to GPIO2. |

GPIO2 connects to VBAT\_SENSE (ADC1 channel). Use the 0-1600 mV attenuation setting in firmware for best accuracy.

## 7. GPIO map (same as your prototype firmware)

| Function | GPIO |
| --- | --- |
| BOOT / alarm cancel | 0 |
| Buzzer driver | 1 |
| Battery sense | 2 |
| LoRa DIO0, RST | 8, 9 |
| LoRa NSS, MOSI, SCK, MISO | 10, 11, 12, 13 |
| USB D-, D+ | 19, 20 |
| NeoPixel | 48 |

## 8. Receiver differences

Remove: charger, protection, power path, slide switch, battery connector, divider, buzzer and driver. Keep: USB-C and its ESD part, CC resistors, ESP32 core, crystal, reset and BOOT, the Ra-02 on the same pins, the SK6805 LED, and the 2.4 GHz antenna as an optional (DNP-able) part. Power: VBUS through Schottky D2 into AP2112K with EN tied to VIN (AP2112K input is rated to 6 V), 3V3 output. Serial to the desktop app runs over the ESP32-S3's native USB (no UART bridge chip).

## 9. Open items before layout

1. Stock check: DW01A, FS8205A, Q1 P-FET, D2/D3 Schottkys, Q2 NPN, tact switches, Johanson antenna LCSC number, USBLC6-2P6 option.
2. VERIFY pinouts: LTH7R, AP2112K, DW01A, FS8205A.
3. 1:1 print test of the Ra-02 footprint.
4. Select JLC impedance stackup and confirm the RF trace width.
5. Check the fit in 30 x 25 mm. If it does not fit, grow the board by about 2 mm before cramming.
6. RF tuning on hardware using RSSI comparison against your SuperMini; the S3P values are the starting point.
