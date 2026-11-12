# J2 electrical review: AP2112 core

## Current follow-up: 2026-11-09 LED2020 / USB pair swap / 330R

The updated native schematic was independently re-exported with KiCad CLI 10.0.6. **All 228 connected pins match the specification**, including 221 core pins and seven LED/support pins; zero unexpected NC connections. Evidence: `../evidence/j2_led2020_electrical_parity.json` and `j2_led2020_independent_netlist.xml`. Reviewed specification SHA256: `2818413649f66937b466412c084cfa0ebc104ceb87c61187143d99bd9bec48ec`. The earlier evidence below is preserved as a previous snapshot, not the current source hash.

R12 is now **330R**; the conservative base-drive example below supports this value for an assumed 30mA buzzer, subject to the owned buzzer's actual current and collector-voltage check. It is not a 500mA driver guarantee.

D1 now maps 1→USB_DN_CONN, 6→USB_DN_ESD, 3→USB_DP_CONN, 4→USB_DP_ESD, 2→GND and 5→VBUS. [ST USBLC6-2, DS4260 Rev 7, page 1](https://www.st.com/resource/en/datasheet/usblc6-2.pdf) identifies equivalent I/O1 pins 1/6 and I/O2 pins 3/4; no USB polarity is assigned to either pair. Swapping both complete channels is valid. Short connections to the connector, VBUS bypass and ground remain PCB requirements (section 2.3), not inferred from schematic parity.

LED1 now uses the verified WS2812B-2020 reference symbol/land pattern, 1 NC / 2 GND / 3 NEO_DIN / 4 +3V3, and the native **DNP property is present**. Actual generic DC5V stock remains unqualified. See `LED_2020_DECISION.md`; no converter is added. The previous LED exclusion below applies only to its earlier 5050 snapshot.

The earlier zero-ERC result below does not substitute for an ERC run against these updated files. This follow-up did not change CAD or establish assembled operation.

## Previous reviewed snapshot (retained)

Reviewed2026-11-09. Scope: J2 LDO engineering revision, owned active9650 buzzer, charger/protection, bare S3 and ADC. **LED1/R13/C28 are excluded** pending the exact ordered2020 LED. This does not approve the retained LED placeholder or its supply requirements. No CAD, generator or firmware was changed.

## Evidence and result

Independently exported the current native schematic with KiCad CLI10.0.6 to `../evidence/j2_independent_netlist.xml`. All **221 connected core pins match circuit_spec.json**, with zero unexpected connections on intentional NC pins. Eight virtual power flags are omitted from netlist export as expected; an initial diagnostic that counted those virtual symbols is retained separately. Hashes/results: `../evidence/j2_core_electrical_parity.json`.

Reviewed specification SHA256: `b7cadb014b10c29158cfaa385062a776121d528a42f0ea7fce0e381236f14bed`. Existing `verification/baseline/j2_initial_erc.json` reports zero errors/warnings, no ignored checks, KiCad10.0.6,2026-11-09T01:50:54. This review found no contradictory core power pin/net connection in that snapshot. PCB connectivity, thermal behavior and operating waveforms remain separate checks.

## High-risk pin/net checks

| Block | Observed contract and result |
|---|---|
| AP2112 U5 | 1 SYS_IN,2 GND,3 SYS_EN,4 NC,5 +3V3; C7/C10 each10uF. SW1 common2 selects SYS_IN/GND;100k EN pulldown defines the transition state. Correct for selected SOT25 LDO. |
| Battery/USB sharing | Q1 AO3401A1 VBUS gate,2 SYS_IN source,3 B_PLUS drain;100k VBUS pulldown. SS14 cathode1 SYS_IN,anode2 VBUS. Body diode starts battery supply toward SYS_IN; USB raises gate to turn Q1 off. Correct intended orientation. |
| Charger | LTC4054 U3:1 CHRG NC,2 protected GND,3 B_PLUS,4 CHG_IN,5 PROG through10k to GND. About100mA charge setting. R30 connects VBUS to CHG_IN **but is presently DNP**, so default assembly does not charge until R30 is fitted. CHRG may remain NC. |
| Cell protection | DW01A1 OD,2 CS through1k to protected GND,3 OC,4 NC,5 VDD through100R from B_PLUS with100nF to B_MINUS,6 B_MINUS. Fuxin FS8205A1 B_MINUS,2/5 common drains,3 protected GND,4 OC gate,6 OD gate. Matches the exact-maker contracts; no direct B_MINUS/GND bypass in the schematic. |
| Battery ADC | DMN2056U1 gate +3V3,2 source GPIO2/VBAT_SENSE,3 drain VBAT_DIV; B_PLUS→30k→drain; source→10k/1nF→GND. Correct body-diode direction and ratio4.0. Real cell is measured while USB is connected. |
| S3 power | Pins2/3 VDD_RF through L1 from +3V3;20 RTC,46 CPU,55/56 VDDA supplied;57 ground. VDD_SPI29 is separate and locally bypassed by1uF/100nF. No external flash is added for FH4R2. |
| Reset/straps | MCU_EN has10k pull-up and1uF to GND, manual reset to GND. GPIO0 boot/cancel pulled up; GPIO45/46 pulled down. Nominal reset RC is10ms. |
| Ra-02 | VDD3 from filtered3V3; GND1/2/9/16. Reset4, DIO0 5, SPI12/13/14/15 map to intended firmware GPIOs;33R clock series and10k NSS pull-up present. |
| Buzzer | Q2 BC8171 base,2 emitter GND,3 collector BZ_NEG; BZ+ on3V3. R12=1k from GPIO1, R14=100k base pulldown. D3 cathode on3V3,anode on switched negative. Correct active DC-tone topology. |

Primary bases: [AP2112 DS39724 Rev2-2](https://www.diodes.com/datasheet/download/AP2112.pdf), [ADI LTC4054](https://www.analog.com/media/en/technical-documentation/data-sheets/405442xf.pdf), [AO3401A](https://www.aosmd.com/sites/default/files/res/data_sheets/AO3401A.pdf), [DMN2056U DS38480 Rev2-2](https://www.diodes.com/datasheet/download/DMN2056U.pdf), and the exact Slkor/Fuxin PDFs saved in `evidence/sources/`. The stored manufacturer pin maps matter more than the generic part-family name. [Espressif's schematic checklist](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/schematic-checklist.html) supports the10k/1uF reset starting point and requires at least50us power stabilization/reset timing; verify the actual rail and rapid on/off behavior rather than inferring it solely from RC.

## Buzzer base drive

[Nexperia BC817 series Rev8, pages2/5](https://assets.nexperia.com/documents/data-sheet/BC817_SER.pdf) confirms1B/2E/3C. Its500mA collector limit is not a guarantee that a1k GPIO base resistor saturates it at500mA. The quoted maximum saturation voltage test uses500mA collector and50mA base.

At nominal3.3V GPIO and assumed0.8V base junction,1k gives about2.5mA base current, minus the small100k pulldown current. A conservative sizing example at3.0V rail, VOH=0.8VDD and VBE=1.2V gives about1.2mA. With an engineering forced-beta target10, that corresponds to12mA collector current. These assumptions are not a guaranteed low-current saturation model.

**Actionable choice:** retain1k if the actual9650 current and measured collector voltage support it. If designing before that measurement for an assumed30mA active buzzer,330Ohm gives roughly3.64mA base drive under the conservative example, and even a3.6V/330Ohm upper bound is10.91mA GPIO current. This needs only a resistor-value choice, not a new driver IC. The physical acceptance is adequate tone plus low collector voltage/temperature at minimum operating rail. The exact owned buzzer's current is still unknown; do not convert30mA from a different manufacturer's part into its rating.

## Remaining gates

- Resolve the ordered2020 LED separately, then re-run netlist/ERC and total-current review. No LED compatibility is concluded here.
- Apply the ADC multiplier4.0 and calibrated sampling to the intended J2 firmware configuration. Scope ADC/3V3 during power transitions; the1nF discharge calculation is conditional, not a fault-injection guarantee. See `SIMPLIFIED_ADC_POWER_SWITCH.md`.
- Preserve AP2112 dropout/thermal limits from `SIMPLIFIED_POWER_REVIEW.md`: initially characterize operation to3.6V loaded cell voltage and at most250mA average USB load; prove3V3 stays within the S3's3.0-3.6V operating range during simultaneous radio/buzzer demand. Do not treat600mA nameplate capability as guaranteed enclosed continuous USB current.
- Fit R30 after initial polarity/charge checks, or explicitly populate it in the normal-use BOM. Verify actual cell/harness polarity, charge current/termination, protection recovery and USB handover.
- Qualify actual filter/RF passives and effective bypass capacitance, final PCB return paths/routing and native DRC/parity. The crystal22R series choice and RF matching remain initial values requiring startup/RF verification. No assembled operation, RF range or manufacture release is claimed.
