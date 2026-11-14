# J2 electrical review: AP2112 core

**Current authority:** the final 90-position review dated 2026-11-12 at the end of this file supersedes the earlier snapshots below, including their old SW1, LED-supply and resistor descriptions.

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

## Final 90-position circuit review — 2026-11-12

This independent review covers the final **AP2112 J2 circuit**, not the superseded converter design. No CAD or firmware source was changed by this review. The 90 physical positions are 82 components and eight test pads; R30 and LED1 are omitted only during initial commissioning.

### Source identity and independent parity

KiCad CLI 10.0.6 independently exported all four native schematic sheets to a temporary XML netlist. All **247 connected pin assignments and 41 intentional NC assignments** match `circuit_spec.json`; the export contains 90 components. A separate native `pcbnew` read found all **253 connected physical pad occurrences** on the board match the same specification. Repeated connector pads account for the higher physical count. J2's two additional MP mounting pads are mechanical and unconnected; they are not missing electrical pins. These checks establish pin/net agreement, not routed connectivity or DRC acceptance; those belong to the root's final board reports.

| Reviewed source | SHA-256 |
|---|---|
| circuit_spec.json | `bdddbc78828b2d359abed5dccf3ce7d517b007f9fb321221f10c6786891f430c` |
| RAMS_JLC_S3.kicad_sch | `b6018218cdf231945b0cb6ce147f1b8fb4e1d4bc509e2ee9312967d4426a0837` |
| RAMS_JLC_S3_power.kicad_sch | `b1a052a552f4ff7a6112b94e4dda088f12df9138c8c9a9b0949b9449eac89be4` |
| RAMS_JLC_S3_mcu.kicad_sch | `35645b78e607e14c5c975a4644cff5d0947be90294483c1a02ac29fb2b6d35d1` |
| RAMS_JLC_S3_io.kicad_sch | `d4185ab24f93aa62eaf955612395db1ca800bc078907832ca8cba8098e5cd507` |
| Independent native netlist export | `7cac573fcce86e7fed2c0f45955627e6e963ec1eb97871e79be34eb4353ed163` |

The netlist was exported with `kicad-cli sch export netlist --format kicadxml`; virtual power flags were excluded from the physical-component comparison. Its temporary export hash records this review's result; a fresh export may have a different generation timestamp.

### Current high-risk circuit checks

| Block | Final result |
|---|---|
| Core power and protection | AP2112 pin map, Q1/SS14 load sharing, LTC4054 10k programming resistor, Slkor DW01A and Fuxin FS8205A maps remain as checked above. R30 is initially DNP. B_MINUS and protected GND remain distinct; no schematic bypass was found. Verify exact received protection-device maker/pinout before population. |
| Main switch | SW1 common2 is **GND**, ON1 is LED_GATE and OFF3 is SYS_EN. R7 now pulls EN **up** to SYS_IN; R41 pulls LED_GATE up. The contacts carry control current, not the MCU/LoRa/LED load. The historical switch/pulldown descriptions do not describe this circuit. |
| Raw LED supply | Q5 AO3401A 1G=LED_GATE, 2S=SYS_IN, 3D=LED_PWR. Its off-state body-diode direction blocks source-to-load conduction. LED1 pin4 is LED_PWR, not +3V3. C28 bypasses LED1. This arrangement does not boost the cell. |
| GPIO48 interface | U6 SN74LVC1T45DBVR 1VCCA=+3V3, 2GND, 3A=NEO_DATA, 4B=NEO_SHIFT, 5DIR=+3V3, 6VCCB=LED_PWR. R13=33R feeds DIN; R42/R43=100k define low states. **C34 and C35 separately bypass the two U6 supplies.** Pin assignment and direction match TI SCES515N. |
| ADC | Q4 DMN2056U gate=+3V3, source=VBAT_SENSE, drain=VBAT_DIV retains the correct battery-isolating diode direction. 30k/10k yields nominal divide-by-four; 4.2 V gives 1.05 V. GPIO2 and the J2 firmware ratio agree. |
| Active buzzer | Owned 9650 Active3V, BC817-25 collector switching, 330R base drive and flyback diode match GPIO1 HIGH/LOW firmware. The assumed 30mA sizing example is still not an actual-stock current rating. |
| MCU and interfaces | S3 power/strap/embedded-memory, USB19/20, LoRa8–13, BOOT0 and RGB48 assignments agree with firmware. U1 is FH4R2; the initial 4MB-flash build leaves PSRAM disabled. No external flash, GPS or IMU was added. |

[TI SCES515N, June 2024](https://www.ti.com/lit/ds/symlink/sn74lvc1t45.pdf) supports the selected direction, separate 1.65–5.5 V supplies, sequencing and isolation behavior. It does not guarantee arbitrary board transients. [Espressif's schematic checklist](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/schematic-checklist.html) supports the power-domain/decoupling and reset basis; its supply-sizing recommendation does not replace total-load and thermal measurements.

### Qualification boundary

No new circuit pin/net contradiction was found. The remaining gates are actual-part identity/fit, supplier stackup/impedance and assembly review, followed by physical power/thermal/USB/RF/charging tests. In particular:

- The generic 2020 LED's minimum supply remains unknown. A 3.7 V nominal cell cannot establish reliable RGB operation across discharge. Qualify the received LED on battery and USB before fitting LED1 for normal use.
- The current firmware uses **3.55 V as the battery-percentage zero endpoint**. This is a provisional display setting, not an automatic cutoff or a guaranteed AP2112 operating floor. Retain the initial 3.6 V loaded-cell stop/recharge test target, and raise the accepted minimum if the LED requires it. Regulator headroom depends on load, tolerance and wiring loss.
- Measure +3V3 during simultaneous BLE, LoRa and active-buzzer operation, USB/battery handover and rapid switching; measure U5 and charger temperature in the enclosure. The 600mA regulator label is not a continuous USB thermal guarantee. LED current belongs to the raw input budget, not the LDO output budget.
- Verify the 500/1000mAh cell's polarity, 4.2V charging specification and permitted charge current before R30 is fitted. Then measure nominal 100mA charging, termination and protection recovery.
- Scope GPIO2, both translator rails and LED DIN during start/stop, and verify the J2 RMT timing at DIN. Radio matching and the 22R crystal-series choice remain values to validate on assembled hardware.

Firmware verification is recorded separately in `../reports/firmware_j2/BUILD_REPORT.md` and its source-bound manifest. This review found and preserved a newer battery-endpoint change, then reran both actual-source host suites and both complete Arduino builds on 2026-11-12: all passed and all 19 firmware source hashes remained unchanged during the builds. The previous build records are archived; they are not evidence for the newer source.
