# RAMS Route A: bare ESP32-S3FH4R2 + LoRa + buzzer + battery monitor

Generated KiCad project, 46 x 34 mm, 4 layers, JLCPCB. **Review build: do not order until you have done
`VERIFY_AND_BRINGUP.md` section 1 and 2.**

## Open it

1. Open `RAMS_RouteA.kicad_pro` in KiCad 8 or newer (KiCad 10 is fine). The files are written in KiCad 7 format and are upgraded when you save.
2. Run **ERC** once. I could not: KiCad 7's command line has no ERC. The schematic is generated (every pin carries a
   global net label instead of drawn wires), so expect cosmetic warnings. If ERC reports anything about power pins or
   `PWR_FLAG`, send it to me.
3. Run **DRC**. It should show 0 errors; the project's rules are 0.127 mm clearance, 0.15 mm tracks, 0.45/0.2 mm vias.

## What is on the board

| Block | Parts | Notes |
|---|---|---|
| MCU | U1 ESP32-S3FH4R2 (bare chip), Y1 40 MHz, decoupling, EN RC, BOOT/RESET buttons | Same FH4R2 variant the ESP32-S3 Supermini uses, as far as I know. |
| 2.4 GHz | ANT1 2450AT18B100E, L2, C20, C21, R16 (0R), C22/C23 (DNP) | Matching network in a straight hand-routed line over solid ground. Antenna keep-out on all layers. |
| USB | J1 USB-C, D1 USBLC6, R3/R4 33R, R1/R2 5.1k | Native USB on GPIO19/20. D+ pads are tied on the far side of the connector. |
| Power | U5 AP2112K-3.3, SW1 slide switch (drives EN), Q1 + D2 power path | Battery or USB, no back-feed. |
| Charger and protection | U3 LTH7/LTC4054 (4.3k PROG, about 233 mA), U4 DW01A, Q3 FS8205A, J2 battery | The Supermini has none of this; this is the extra part because of the Li-ion cell. |
| LoRa | U6 Ra-02, **bottom side, hand-soldered** | The standard Ra-02 has an onboard spring antenna; check yours. |
| Indicators | LED1 WS2812B-2020 on 3.3 V, BZ1 active buzzer + Q2 BC817 | |
| Monitor | R14 330k / R15 180k divider to GPIO2 | Ratio 2.833. |
| Test pads | 3V3, GND, VBUS, B+, TX, RX (bottom side) | |

Top side: 64 parts for the hot plate. Bottom side: Ra-02 and 6 test pads.

## Firmware pin map

| Function | GPIO | Pad |
|---|---:|---:|
| BOOT / cancel button (active low) | 0 | 5 |
| Buzzer drive (HIGH = on) | 1 | 6 |
| Battery ADC | 2 | 7 |
| LoRa DIO0 | 8 | 13 |
| LoRa RESET | 9 | 14 |
| LoRa NSS | 10 | 15 |
| LoRa MOSI | 11 | 16 |
| LoRa SCK | 12 | 17 |
| LoRa MISO | 13 | 18 |
| USB D- / D+ | 19 / 20 | 25 / 26 |
| WS2812B data | 48 | 36 |
| UART0 TX / RX (test pads) | 43 / 44 | 49 / 50 |

Firmware changes you need: the battery multiplier is **2.833** `((330k+180k)/180k)`, not 2.0. The charger CHRG pin is not
wired to the MCU. For flashing, hold BOOT while plugging USB.

## Fixes against the Rev A defects

- VDDA (pins 55/56) is powered from 3.3 V with decoupling. VDD_SPI is not tied to 3.3 V and has 0.1 uF + 1 uF.
- DW01A current-sense pin goes to system GND through R8, not to B_MINUS.
- BC817 emitter is on GND, collector on the buzzer.
- LED data is GPIO48. Power switch drives the LDO enable.

## JLCPCB order settings

4 layers, 46.1 x 34.1 mm, 1.6 mm, default 1.6 mm 4-layer stackup (JLC04161H-7628). ENIG is recommended for the 0.4 mm
QFN, HASL is cheaper. Tented vias. Ask for via size 0.2 mm; if the quote adds a surcharge tell me and I will rebuild
with 0.3 mm vias. Order a **top-side stencil only**. Gerbers and drill are in `fabrication/gerbers`. Impedance control is
not needed: the RF line is 0.35 mm wide on the 0.21 mm prepreg, which is my estimate, not a simulation.

## What I checked

- Schematic netlist, PCB pad nets and the design file agree on every pin (43 nets, 0 mismatches, using KiCad's own netlist export).
- DRC with the project rules: **0 errors**. Remaining warnings are silkscreen overlap and "library not found", because my
  environment has no KiCad footprint library table.
- Zone fill, ground plane on L2, second ground pour on L3, 139 vias including ground fan-out for every ground pad.

## What I could not check

- **ERC** (see above).
- **Footprints against your real parts** (biggest risk, see `VERIFY_AND_BRINGUP.md`): USB-C, slide switch, tact switches,
  buzzer, JST socket, Ra-02, ANT1 pads, FS8205A pinout.
- **RF performance.** The matching values come from Espressif's ranges, the keep-out from Johanson's test-board
  dimensions. Nothing was simulated or measured. Expect to tune.
- **Layout quality.** The board was autorouted (Freerouting), then I fixed what it left open by hand. It is DRC-clean but
  has long diagonal tracks, no USB length matching and no signal-integrity review.
- **JLCPCB DFM.** The rule numbers are from their published 4-layer capabilities as I know them. Confirm in their quote.
- Ra-02 antenna keep-out under the module is approximate (no copper pour in the last 2 mm toward the bottom edge).
