# Second-pass design verification, 2026-11-11

The 2026-11-10 review found a defect that did not exist because it trusted its
own checking tool (MISTAKE_REGISTER M08). This pass is deliberately independent:
it starts from the board netlist and the vendor documents, not from the earlier
review, and every line below has a measured value on one side and a published
requirement on the other.

Board under test: `RAMS_JLC_S3.kicad_pcb`, SHA-256 prefix `dcaa2a826e4b09bb`
(after the 3D body changes). Schematic/board reference sets match exactly:
90 components each way, no orphans.

## Method

- Dumped every net with reference, pad number and fitted value from the board
  using `pcbnew`, then read the requirement from the datasheet or app note.
- Exported the schematic netlist with `kicad-cli sch export netlist` and diffed
  its component list against the board footprints.
- Pins referenced below are the QFN-56 pads on U1, cross-checked against the
  ESP32-S3 datasheet pin list rather than against any script table.

## Checks

| # | Item | Requirement and source | Board as built | Result |
|---|---|---|---|---|
| 1 | CHIP_PU reset | 10 k to 3.3 V plus 1 uF; the pin has no internal pull-up (ESP32-S3 HDG, reset timing; DS Table 2-13) | R8 10 k to +3V3, C33 1 uF, SW2 to GND, TP6 | pass |
| 2 | Boot strap GPIO0 | External 10 k pull-up, and no capacitor on the net - a cap can hold GPIO0 low and force download boot (HDG strapping pins) | R34 10 k to +3V3, no cap on net `BOOT_BTN`, SW3 to GND | pass |
| 3 | VDD_SPI strap GPIO45 | 0 selects 3.3 V; 1 selects 1.8 V and cannot run the in-package 3.3 V flash (DS Table 3-1) | R35 10 k to GND, pad 51 | pass |
| 4 | Boot strap GPIO46 | Must be 0 at reset; weak internal pull-down (DS Table 3-1) | R36 10 k to GND, pad 52 | pass |
| 5 | USB D+/D- series | 22 or 33 ohm initial value close to the chip (HDG USB section) | R38/R39 22 R on `USB_DP`/`USB_DN` | pass |
| 6 | USB ESD | USBLC6-2 as a flow-through pair: pins 1/6 one line, 3/4 the other, 5 on VBUS | D1 wired exactly so | pass |
| 7 | USB-C sink | 5.1 k on CC1 and CC2 | R1, R2 5.1 k 1 % | pass |
| 8 | VDD_SPI decoupling | 0.1 uF plus 1 uF at the pin; explicitly no large bulk (HDG digital supply) | C20 100 nF, C17 1 uF, pad 29 | pass |
| 9 | In-package flash/PSRAM pins | GPIO26-32 must not carry loads (DS 2.6) | pads 28, 30, 31, 32, 33, 34, 35, 37 have no net | pass |
| 10 | Unused GPIO range | GPIO33-37 are free on a quad-SPI FH4R2, consumed only by octal parts | pads 38-42 have no net | pass |
| 11 | Crystal load | `C = 2 (C_L - C_stray)` = 2 (10 - 4) = 12 pF for a 10 pF ABM8 | C24, C25 12 pF C0G | pass |
| 12 | Crystal series element | 24 nH inductor in XTAL_P to suppress harmonics (HDG clock source) | R9 22 ohm | FAIL, finding S3 |
| 13 | Charge current | `I = 1000 * 1 V / R_PROG[kohm]` = 100 mA at 10 k | R3 10 k 1 %, `CHG_PROG` | pass |
| 14 | Charge input drop | Keep a place for an external R_CC to trade voltage for heat | R30 0 R link from VBUS to `CHG_IN` | pass, option present |
| 15 | Power path | A load on the BAT pin prevents termination: PROG never falls to C/10, so the part floats and re-tops at 4.05 V (LTC4054 p.8 and Note 1) | Q1 PMOS: source `B_PLUS`, drain `SYS_IN`, gate on VBUS with R6 100 k to GND; D2 SS14 from VBUS to `SYS_IN` | pass - the load is off the cell, so termination works |
| 16 | Protector network | VCC through R1 100 ohm to 1.5 k plus C1 0.1 uF, CS through R2 1 k, and no resistor in the B- to VSS path (DW01A typical application) | R4 100 R, C5 100 nF, R5 1 k, U4.6 direct on `B_MINUS` | pass |
| 17 | Protector vs charger | DW01A V_OCP min 4.25 V against LTC4054 float 4.2 V +/-1 % = 4.242 V | 8 mV of margin | RISK, finding S14 |
| 18 | Cell divider | 30 k / 10 k = 0.25x, 105 uA from a 4.2 V cell | Q4 gate sits on +3V3, so the divider is never switched off | defect, finding S8 confirmed |
| 19 | ADC channel | GPIO2 is ADC1_CH1; 2.5 dB attenuation tops out at 1.25 V, above the 1.05 V full-scale reading | U1.7, `VBAT_SENSE`, C29 1 nF | pass |
| 20 | LDO thermal | `P = (V_in - 3.3) * I`, SOT-25 theta_JA = 184 C/W (AP2112 datasheet p.3) | V_in = 4.55 V (5 V USB less SS14) | 250 mA = 0.31 W = +57 C rise |
| 21 | Firmware pin map | `config.h`: buzzer 1, ADC 2, LoRa DIO0 8 / RST 9 / NSS 10 / MOSI 11 / SCK 12 / MISO 13, UART 43/44, NeoPixel 48 | pads 6, 7, 13, 14, 15, 16, 17, 18, 49, 50, 36 | pass, pin for pin |

## Corrections to the earlier records

- **LDO junction temperature.** The 2026-11-10 figure of 96 C rise at 250 mA
  assumed 5 V straight into the regulator. The board has an SS14 in that path,
  so the regulator sees about 4.55 V: 1.25 V x 0.25 A = 0.31 W, +57 C rise,
  T_J about 108 C at 50 C ambient. The 5 V number is still the right one for a
  USB 5 V feed with the diode bypassed.
- **Schematic parity.** The earlier record said 0. Measured today on the
  pristine pre-change board it is 41, all of severity `warning`, all of type
  `net_conflict`, each one a pad whose net is an auto-generated
  `unconnected-(...)` name - that is, exactly one warning per deliberately
  unconnected pin. KiCad regenerates those nets from the schematic, so clearing
  them on the board would be undone by the next update. They are informational.
  Violations remain 0 and unconnected stays 5.
- The `SaveBoard` call used to attach 3D bodies was initially suspected of
  causing that parity change. An A/B on a pristine copy cleared it: the same 41
  appear with and without the save.

## New findings

**N1 / S8 - the divider switch does nothing.** `Q4` (DMN2056U) has gate on
`+3V3`, source on `VBAT_SENSE`, drain on `VBAT_DIV`. With the gate tied to the
rail the FET is on whenever the board is powered, so the 30 k/10 k chain draws
`4.2 V / 40 k = 105 uA` continuously. The header comment in `battery.h` calls
this "3V3-gated NMOS isolation"; it is not isolation, because nothing can turn
it off. Fix is either to drive the gate from a spare GPIO (a track plus firmware,
GPIO33 or GPIO37 are free) or to delete the FET and accept the drain.

**N2 / S14 - protector trip margin.** LTC4054 terminates at 4.2 V +/-1 %, worst
case 4.242 V. The DW01A overcharge detect is 4.25/4.30/4.35 V depending on
vendor, with the low bin only 8 mV above that worst case. If a 4.25 V part is
fitted, the protector can open at the end of charge and the charger then sees the
cell disappear and restarts. Confirm the SLKOR part's threshold before release,
or specify the 4.30 V bin.

**N3 / S3 confirmed from the vendor side.** Espressif's clock guidance is a
24 nH series inductor on XTAL_P, tuned at test. R9 is 22 ohm. A resistor damps
the drive level but does not cancel the harmonic the inductor is there to notch,
so this is not an equivalent substitution.

## 3D bodies

Starting state: 79 model statements, two of which named files that do not exist
in KiCad 10 - `SW_SPDT_Shouhan_MSK12C02.step` and
`LED_WS2812B-2020_PLCC4_2.0x2.0mm.step`. Those two rendered as nothing while
looking configured, and `kicad-cli pcb export step` reported
"Could not add 3D model" for both.

Now:

- **U2** uses the supplied Ra-02 STEP, copied into `3dmodels/` (805 KB) and
  referenced as `${KIPRJMOD}/3dmodels/LoRa_Module_RA-02_AiThinker.step`, so the
  board does not depend on a path outside the project. This body has the IPEX
  connector the stock Ra-01 model lacks.
- **Y1** gains `Crystal_SMD_Abracon_ABM8G-4Pin_3.2x2.5mm.step`, the same
  package family as the ABM8.
- **SW1** and **LED1** had their dangling paths removed rather than pointed at a
  wrong-sized body.
- **ANT1** (Johanson 2450AT18B100E), **BZ1** (9650 buzzer) and **TP1-TP8** stay
  bare: no stock model matches those packages, and nothing in the local library
  does either. The local library contributed the Ra-02 STEP only; its
  SK6805-EC15 and YD-ESP32-S3 files are different parts.

Verification: `kicad-cli pcb export step --subst-models` now completes with no
model warnings and writes a 4.2 MB STEP to
`manufacturing/ENGINEERING_DRAFT_NOT_FOR_FAB/RAMS_JLC_S3_3D.step`.
Bodies are all at rotation zero and were not inspected in the 3D viewer, so do
not quote a mechanical clearance from that file without looking at it.

## Not verified here

- No C++ compiler on this machine, so `validation/` tests are still unrun; the
  battery constants were checked by arithmetic only.
- No RF, no thermal measurement, no 3D viewer inspection.
- Five nets are still unrouted: `VBAT_SENSE`, `MCU_EN`, `BOOT_BTN`, `LORA_SCK`,
  `BUZZER_CTRL`.

## Reproduce

```
PY="/c/Program Files/KiCad/10.0/bin/python.exe"
CLI="/c/Program Files/KiCad/10.0/bin/kicad-cli.exe"
"$PY" scripts/add_3d_models.py --dry-run
"$CLI" pcb drc --severity-all --format json --schematic-parity --refill-zones -o drc.json RAMS_JLC_S3.kicad_pcb
"$CLI" pcb export step --subst-models --output board.step RAMS_JLC_S3.kicad_pcb
```
