# Schematic review: RAMS_JLC_S3 J2 (DeepSeek Build)

Date: 2026-11-10, Asia/Manila. Board under review:
`hardware/KiCAD Files/DeepSeek Build/RAMS Wearable/RAMS_JLC_S3.kicad_pcb`
and its four schematic sheets. Every claim below was checked against a primary
source (downloaded datasheet in `docs/Datasheets/`) or against Espressif's
ESP32-S3 Hardware Design Guidelines. Nothing here is inferred from symbol
names alone.

Severity: **H** blocks correct operation, **M** degrades margin or one feature,
**L** improvement, **OK** verified with no action.

## Findings

| ID | Sev | Finding | Evidence | Required action |
|---|---|---|---|---|
| S1 | OK, retracted | **Withdrawn 2026-11-11: the translator is wired correctly.** An earlier entry here claimed U6 had `B` and `DIR` swapped. The swap was in this review's own pin table, not on the board. TI's DBV pinout is 4 = `B` (output) and 5 = `DIR` (input), so U6.4=`NEO_SHIFT` and U6.5=`+3V3` is exactly the intended A-to-B path with DIR tied high. | TI SCES515 Table 4-1, DBV: 1 VCCA, 2 GND, 3 A, 4 B, 5 DIR, 6 VCCB. Board nets: U6.3=`NEO_DATA`, U6.4=`NEO_SHIFT`, U6.5=`+3V3`, U6.6=`LED_PWR`, R13.1=`NEO_SHIFT`, R13.2=`NEO_DIN`. `scripts/audit_pin_roles.py` was corrected and now exits 0. | None. No spin is needed for the pixel path. LED1 and U6 stay DNP for first bring-up because of S13, not S1. See `MISTAKE_REGISTER.md` M08. |
| S2 | OK | The pixel data line on U1 pin 36 is **correct**. Pin 36 is `SPICLK_N`, which the datasheet lists as **GPIO48**, and firmware drives the pixel on GPIO48. | ESP32-S3 datasheet Table 2-1: pin 36 `GPIO48`, IO MUX F0 `SPICLK_N_DIFF`, F1 `GPIO48 I/O/T`; pin 37 `GPIO47` `SPICLK_P_DIFF`. GPIO47/48 live in the VDD_SPI domain, which is 3.3 V here because GPIO45 is strapped low, so 3.3 V logic levels are correct. | None. GPIO48 has a short power-up glitch, which is harmless for pixel data. Recorded because the raw pin name looks flash-only and invites a false positive. |
| S3 | M | The crystal series element is R9 = 22 ohm. Espressif's reference uses a 24 nH inductor on `XTAL_P` to suppress 40 MHz harmonics reaching the radio. | ESP32-S3 schematic checklist, "External Crystal Clock Source". | Fit 24 nH at R9 (0402), or keep 22 ohm only if crystal start-up amplitude is measured above 500 mV. Either way measure before shipping. |
| S4 | M | Battery ADC filter C29 = 1 nF. Espressif recommends 0.1 uF for ADC inputs. | ESP32-S3 schematic checklist, "ADC". | Accept 1 nF only with the measurement in `CALCULATION_AUDIT.md` showing under 10 mV droop at the sampling node; otherwise raise to 100 nF (bleed through 10 k is 1 ms). |
| S5 | L | No series resistor on `U0TXD` (TP4). Espressif recommends 499 ohm to suppress harmonics. | ESP32-S3 schematic checklist, "UART". | Reserve a 0402 position; not required for bring-up. |
| S6 | H, fixed 2026-11-11 | The reported battery percentage and the actual usable range disagreed. The LDO needs about 3.55 V input to hold 3.3 V, but firmware declared 3.00 V empty, so the unit died while still reporting roughly one third charge. | `AP2112_ldo.pdf` dropout; `CALCULATION_AUDIT.md` C4. | **Applied:** `BATTERY_EMPTY_VOLTAGE` is now 3.55 V, with the mapping comments in `battery.cpp` corrected; `validation/test_battery_profiles.py` expectations updated to the new window (7 % at 3.60 V, 50 % at 3.88 V, 0 % at 3.548 V). The test could not be executed here because no C++ compiler is installed; arithmetic was checked in float32. |
| S7 | H | The build switch `RAMS_JLC_S3_J2` is **never defined** anywhere in the repository, so the firmware compiles the SuperMini path: divider ratio 2.0 against a 30k/10k (ratio 4.0) divider, and uncalibrated ADC counts. Battery voltage reads half of truth. | `grep -rn RAMS_JLC_S3_J2` returns only `#ifdef` uses in `battery.cpp`, `battery.h`, `neopixel.cpp`; no `platformio.ini` exists in `firmware/wearable_withApp`. | Define `RAMS_JLC_S3_J2` in the build (Arduino IDE: Sketch > build flags, or add a build file) before flashing this board. Verify with the test in `BRINGUP_AND_TEST_POINTS.md` T7. |
| S8 | L | The battery divider draws 105 uA continuously (Q4 is permanently on, gate at 3V3), which is a large share of a wearable's sleep budget. | `CALCULATION_AUDIT.md` C1. | Change R15/R16 to 300k/100k at the same ratio to cut the drain to 10.5 uA; footprint and layout are unchanged (both 0402). |
| S9 | L | DW01A over-current trip is about 3 A with the FS8205A pair installed, which is roughly 6C for a small wearable cell. | DW01A `V_CS` 150 mV typ, FS8205A 2 x 25 mOhm. | Confirm the chosen cell tolerates 3 A for the trip delay, or accept that protection is short-circuit only. |
| S10 | OK | VDD_SPI (U1 pin 29) carries only C17 1 uF and C20 100 nF and no external source. This is correct for an FH4R2: at 3.3 V the pin is fed internally from VDD3P3_RTC through 14 ohm, and GPIO45 strapping (R35 pulls it low) selects exactly that 3.3 V mode. | Espressif ESP32-S3 schematic checklist, "Digital Power Supply" and the VDD_SPI voltage table. | None. Keep VDD3P3_RTC (the 3.3 V rail) above 3.0 V in all modes. |
| S11 | OK | Protection chain matches the datasheets exactly: DW01A 1=OD, 2=CS, 3=OC, 4=NC, 5=VCC, 6=GND with GND on the cell negative; FS8205A SOT-23-6 1=S1, 2=D1/D2, 3=S2, 4=G2, 5=D1/D2, 6=G1, so OD drives the cell-side gate and OC the system-side gate. R5 1 k senses CS to system ground, C5 100 nF sits VCC to cell negative. | `DW01A_protection.pdf`, `FS8205A_lcsc.pdf`. | None. This is the topology that previous builds got wrong; it is now right. |
| S12 | M | The LoRa module value is `Ai-Thinker-Ra-02` but the footprint is `RF_Module:Ai-Thinker-Ra-01-LoRa`. | `circuit_spec.json` U2. | Physically compare the ordered Ra-02 board against the land pattern at 1:1 before assembly; pin order matches on both modules but shield and pad extents differ between vendors. |
| S13 | L | `LED_PWR` follows the raw cell (3.0-4.2 V) or USB (4.55 V). WS2812B-2020 needs at least 3.7 V, so the pixel is unreliable over the lower half of the discharge curve. | `WS2812B_led.pdf` supply range. | LED1 is already DNP. Either accept the reduced range or drive the pixel from a regulated 3.3 V rail. |

## What this review deliberately does not claim

- No statement about RF radiated performance, EMC, charging safety with a real
  cell, or enclosure thermal behaviour. Those need measurement.
- No statement that the board is fabrication ready: five nets are still
  unrouted (`00_CONTINUATION_STATUS.md`).
- S3, S4, S6, S7 and S12 are not fixed in this pass; each is recorded with the
  exact change required so it is fixed once, on the next spin. S1 is not in that
  list because it was a false alarm and required no change.
