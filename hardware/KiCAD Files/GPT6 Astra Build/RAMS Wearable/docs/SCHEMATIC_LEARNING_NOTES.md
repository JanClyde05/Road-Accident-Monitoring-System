# J2 schematic learning notes

2026-11-12. Applies to `circuit_spec.json` SHA256
`bdddbc78828b2d359abed5dccf3ce7d517b007f9fb321221f10c6786891f430c`.
These notes explain the existing circuit; they do not change it. Each numbered
card is short enough to adapt beside a boxed schematic section. Values are
nominal unless a limit and its test conditions are explicitly stated.

## Reading the design

Follow conventional current from the positive supply through the load and back
to its return. `B_MINUS` is the cell terminal; `GND` is the protected system
return. Q3 connects them during normal operation. Identical net labels connect
electrically even when no long wire is drawn. A no-connect cross is deliberate.
Reference prefixes identify resistors R, capacitors C, inductors L, ferrite bead
FB, diodes D, transistors Q, ICs/modules U, connectors J, switches SW and test
pads TP. `DNP` means do not populate at the stated assembly stage.

Use the existing three functional sheets as the clickable circuit sections.
Documentation should point to those real circuits. Copying live symbols onto a
second learning sheet would create extra component instances, not a harmless
picture. Native text, boxes and non-electrical arrows can explain flow without
adding connections. The equations below belong beside the real components.

## 01 — USB input, ESD and data damping

**J1, R1/R2, D1, C1/C2, R38/R39**

- J1 brings in USB 5 V and D+/D−. R1/R2 = 5.1 kΩ identify a USB-C sink on either plug orientation; they do not negotiate a USB-PD voltage or grant an arbitrary current budget.
- D1 steers fast ESD transients toward the supply/ground reference. Short return routing matters; this device is not a sustained overvoltage regulator.
- C1 = 1 µF and C2 = 100 nF bypass VBUS locally. R38/R39 = 22 Ω are data-line series damping near the MCU; their role is edge control, not a DC voltage divider.
- Current path: `VBUS → D2 → SYS_IN`; a separate `VBUS → R30 → U3` branch charges the cell. USB data runs through D1 and the series resistors to GPIO19/20. [S1, S2]

## 02 — 4.2 V LiPo charging

**U3, R3, R30, C3/C4**

- U3 LTC4054 charges one 4.2 V Li-ion/LiPo cell using constant current, then constant voltage. R30 is the removable charge link, absent during first power checks.
- `I_CHG ≈ 1000 × 1.0 V / R3 = 0.100 A` for R3 = 10 kΩ. Equivalently `I_CHG(mA) ≈ 1000 / R3(kΩ)`. The IC's 93–107 mA table range excludes extra resistor error.
- C3 = 1 µF bypasses charger input; C4 = 4.7 µF supports its battery-side node. Approximate charger heat is `(VUSB − VBAT) × I_CHG`; 5 V, 3.7 V and 0.1 A give 0.13 W before other losses.
- Nominal 100 mA is 0.2 C for 500 mAh or 0.1 C for 1000 mAh. `capacity/current` gives 5 h or 10 h of ideal constant-current time, **not total charge time**: tapering and actual conditions add time. Confirm the cell's charge rating before fitting R30. [S3]

## 03 — Cell connector and protection

**J2, U4, Q3, R4/R5, C5**

- J2 pin 1 = B_PLUS; pin 2 = B_MINUS. U4 monitors cell voltage and the return-path sense node; Q3's opposing MOSFETs can interrupt the cell return during faults.
- R4 = 100 Ω with C5 = 100 nF filters the protector supply: ideal `τ = RC = 10 µs`, `fc = 1/(2πRC) = 15.9 kHz`. IC loading/parasitics modify that simple model.
- R5 = 1 kΩ is in the sense input path. Do not combine it with C5 as though they formed one RC filter: they are different nets. Protection thresholds/delays belong to the exact U4 device, not a chosen RC cutoff.
- Q3's actual maker/pinout matters. Never bridge B_MINUS to GND with wiring, solder or test-equipment ground; that bypasses this protection. The protection cutoff is not the desired everyday low-battery stopping point. [S4]

## 04 — USB/battery sharing and the main switch

**D2, Q1, R6, SW1, R7**; LED switch Q5/R41 is explained in card 13.

- USB path: `VBUS → SS14 D2 → SYS_IN`. With USB absent, R6 = 100 kΩ pulls Q1's gate low; Q1 conducts from the battery toward SYS_IN. With USB present, its gate rises and isolates that path.
- Q1's source/drain orientation is intentional: its body diode assists battery startup without providing a forward USB-to-cell bypass. U3 remains the controlled charging path.
- SW1 common is GND. ON grounds LED_GATE while R7 = 100 kΩ enables U5; OFF grounds SYS_EN while R41 turns Q5 off. The slider carries control current, not the radio load.
- A grounded 100 kΩ pull-up draws `I = V/R`: at 4.2 V, 42 µA. OFF disables the main rails but is not a galvanic battery disconnect; charger/protection leakage still exists. [S5]

## 05 — 3.3 V linear regulation and bulk storage

**U5, C7/C10**

- U5 AP2112 produces the 3.3 V rail. It reuses an owned LDO and needs no switching converter. C7/C10 = 10 µF provide local input/output charge and support its transient response.
- `P_LDO ≈ (VSYS − 3.3 V) × I_AVG`. An illustrative 4.7 V input and 250 mA average give 0.35 W. The 600 mA electrical rating does not establish enclosed thermal capability.
- Capacitor support follows `ΔV ≈ ΔI × Δt / Ceff`, plus immediate ESR drop. With an assumed effective 10 µF, a 100 mA deficit lasting 10 µs gives 0.10 V droop. It does **not** cover a long radio burst by itself.
- Ceramic capacitance falls with DC bias and tolerance. Brownout margin requires the regulator, source impedance, layout and all capacitors working together. As the cell falls, available LDO headroom falls; verify the loaded rail instead of treating 3.55 V firmware percentage-zero as a hardware cutoff. [S6]

## 06 — Battery measurement and off-state isolation

**Q4, R15/R16, C29**

- Normal path: `B_PLUS → 30 kΩ R15 → Q4 → ADC node → 10 kΩ R16 → GND`. `VADC = VBAT × 10/(30+10) = VBAT/4`; 4.2 V becomes 1.05 V, drawing 105 µA.
- Q4 gate follows +3V3; its body-diode orientation blocks cell-to-ADC current when the MCU rail is off. R16 discharges the ADC node. Firmware J2 multiplies calibrated ADC millivolts by four.
- Assuming Q4 is fully on, `Rth ≈ 30 kΩ || 10 kΩ = 7.5 kΩ`. With C29 = 1 nF, `τ ≈ 7.5 µs`, `fc ≈ 21.2 kHz`. Independent 1% resistor extremes give a divider gain error of about ±1.5% before ADC error.
- When Q4 turns off, nominal discharge is `R16 × C29 = 10 µs`. This quick discharge is the reason for the small capacitor; it is **not** a 0.2 Hz analog filter for the 5 s reporting interval. Firmware averaging/EMA handles slow display smoothing. Scope actual startup/shutdown transients. [S7]

## 07 — The ESP32-S3 and signal assignments

**U1**

- U1 ESP32-S3FH4R2 is the processor/BLE radio, with 4 MB embedded flash and 2 MB embedded quad PSRAM. Initial firmware uses 4 MB flash with PSRAM disabled for bring-up.
- Phone GPS/IMU data arrives over BLE; the board relays it over LoRa. No separate onboard GPS or IMU was added.
- GPIO0: BOOT/cancel; GPIO1: active buzzer; GPIO2: battery ADC; GPIO8/9: LoRa DIO0/reset; GPIO10/11/12/13: NSS/MOSI/SCK/MISO.
- GPIO19/20: USB D−/D+; GPIO48: RGB data. UART test pads provide another diagnostic/programming path. The exposed pad is electrical ground and a thermal path; its hidden solder joint matters. [S8]

## 08 — MCU supply bypass and RF supply filtering

**L1, C11/C12/C13, C14/C15/C16, C17/C20, C21/C22**

- L1 = 2 nH feeds VDD_RF; C11/C12/C13 = 10 µF/1 µF/100 nF provide local RF-rail charge and bypass. L1 is an RF supply element, not a buck-converter energy-storage inductor.
- C14 = 10 µF supports the main MCU rail. C15/C16 = 100 nF serve CPU/RTC supply pins; C21/C22 = 10 nF/1 µF bypass the analog supply region.
- C17/C20 = 1 µF/100 nF bypass the separate VDD_SPI node. That node is internally supplied; do not short it blindly to +3V3.
- Larger capacitance stores more low-frequency charge; small capacitors placed close to pins shorten high-frequency current loops. `|XC| = 1/(2πfC)` is only the ideal model: ESR, ESL and self-resonance prevent a promise of unlimited high-frequency bypass. [S1, S8]

## 09 — Reset, boot and startup straps

**R8/C33, R34/R35/R36, SW2/SW3**

- R8 = 10 kΩ charges C33 = 1 µF on MCU_EN: nominal `τ = RC = 10 ms`. Ideal step response is `VEN(t)=VDD(1−e^(−t/τ))`; at one τ the node reaches 63.2% of its final value.
- Reset release occurs at the actual input threshold and depends on the rail ramp; it is not guaranteed to occur exactly at 10 ms. SW2 discharges EN for manual reset.
- R34 = 10 kΩ holds GPIO0 high; SW3 grounds it for boot selection/cancel. R35/R36 = 10 kΩ hold GPIO45/46 low at startup. Strap states are sampled around reset, so peripherals must not fight them.
- To enter download mode: hold BOOT, press/release RESET, then release BOOT. These buttons do not require adding another supervisor IC for the present design. [S1, S8]

## 10 — 40 MHz crystal

**Y1, R9, C24/C25**

- Y1 is specified for `CL = 10 pF`. C24/C25 = 12 pF are an initial commercially available load pair, not a measured parasitic fit.
- `CL ≈ C24×C25/(C24+C25)+Cstray = 6 pF + Cstray`. Assuming 4 pF combined stray capacitance gives the target 10 pF.
- R9 = 22 Ω limits/damps the crystal drive path. Crystal startup, drive level and frequency depend on the actual oscillator and layout; this is not a simple RC low-pass design.
- Espressif's current guidance suggests a 24 nH series starting component. The retained 22 Ω choice is a documented deviation requiring startup/frequency/harmonic measurement before acceptance. Do not silently call these loads or R9 tuned. [S1, S9]

## 11 — 2.4 GHz chip matching and antenna

**C18/L2/C19, C32/L4/L5, ANT1**

- Chip-side CLC starting network: C18 = 1.5 pF, L2 = 2.4 nH, C19 = 1.5 pF. Antenna-side starting network: C32 = 1.2 pF series, L4 = 2.7 nH shunt, L5 = 3.3 nH series.
- ANT1 is the 2.4 GHz antenna for the S3; the LoRa module uses a separate 433 MHz antenna. ANT1 pin 2 stays unconnected; its corner no-metal area is intentional.
- At 2.4 GHz, ideal 2.4 nH gives `XL = 2πfL ≈ 36.2 Ω`; ideal 1.5 pF gives `|XC| ≈ 44.2 Ω`. These examples show why tiny values matter, **not** that the network already matches 50 Ω.
- Multiple reactive parts, chip/antenna impedance, pads, traces, enclosure and body loading determine the actual match. Do not assign a single `1/(2πRC)` cutoff. Final RF tuning/impedance verification is still required. [S8, S10]

## 12 — LoRa radio, supply filter and SPI

**U2, FB1, C26/C27, R11/R37**

- U2 Ra-02 is the bottom-side radio module. FB1 feeds its local LORA_VDD; C26 = 10 µF supplies local transient charge and C27 = 100 nF provides close bypass.
- A ferrite bead has frequency-dependent resistive/reactive impedance. Use its impedance/current/DC-resistance curves; the bead and capacitor bank are not an ordinary single-RC filter with a known cutoff.
- R11 = 33 Ω damps SPI clock edges at the driver. R37 = 10 kΩ holds NSS high while the MCU starts, leaving the radio unselected. GPIO9 resets the module; GPIO8 receives its DIO0 interrupt.
- Current firmware: 433 MHz, SF9, 125 kHz bandwidth, coding 4/5, 17 dBm and sync 0x34. Fit a proper 433 MHz antenna before transmitting; hand-solder U2 after top reflow. [S11]

## 13 — RGB power, voltage translation and data

**LED1, Q5/R41, U6, R13/R42/R43, C28/C34/C35**

- Q5 switches SYS_IN to LED_PWR. R41 = 100 kΩ pulls its gate to its source to turn it off; SW1 grounds the gate to turn it on. This avoids carrying LED load through the small slider.
- U6 translates GPIO48 from +3V3 to the LED supply level; DIR is high for A→B. This is a signal translator, not a power converter. C34/C35 = 100 nF bypass its two rails; C28 = 100 nF bypasses LED1.
- R13 = 33 Ω damps the data edge; R42/R43 = 100 kΩ hold the input/DIN low when undriven. J2 timing: 0 bit = 300/1000 ns high/low, 1 bit = 700/600 ns, reset ≥300 µs low.
- Battery LED power follows the loaded cell minus path losses; USB LED power is VBUS minus D2/path losses. A nominal 3.7 V cell does not guarantee a particular WS2812B revision's minimum voltage. LED1 is initially DNP until actual stock geometry, voltage and current are qualified. [S5, S12]

## 14 — Active buzzer and transistor driver

**BZ1, Q2, R12/R14, D3**

- BZ1 is the owned active DC-tone buzzer. GPIO1 drives Q2 so current flows `+3V3 → BZ1 → Q2 collector/emitter → GND`; the GPIO supplies base drive instead of the full buzzer load.
- R12 = 330 Ω limits base current. Illustrative `IB ≈ (3.3−0.8)/330 = 7.58 mA`; the assumed 0.8 V base-emitter drop varies with current and temperature.
- A conservative sizing example uses VOH = 2.4 V and VBE = 1.2 V: `IB ≈ 3.64 mA`. Forced gain 10 would support roughly 36 mA collector current; this is an engineering example, not the unknown buzzer's measured current or guaranteed saturation.
- R14 = 100 kΩ holds Q2 off while GPIO floats. D3 provides a return path for magnetic load transients when Q2 turns off. Verify adequate tone, low collector voltage and actual current; hand-solder the unqualified-reflow buzzer after reflow. [S13]

## 15 — Test access

**TP1–TP8**

| Pad | Net | Useful check |
|---|---|---|
| TP1 | GND | Protected system reference |
| TP2 | +3V3 | Rail level/droop and sequencing |
| TP3 | B_PLUS | Cell-positive node; interpret relative to the correct return |
| TP4 / TP5 | UART_TX / UART_RX | 3.3 V serial diagnostics; do not drive an unpowered MCU |
| TP6 | MCU_EN | Reset ramp and switch/reset behavior |
| TP7 | BOOT_BTN | Boot/cancel logic state |
| TP8 | SYS_IN | USB/battery handover and LDO input |

The eight pads are copper features, not eight parts to buy. Power flags are ERC
declarations: they tell KiCad where a net is driven; they do not generate power.

## Design lessons and cost/quality decisions

- Keep proven reusable parts when their actual ratings fit. AP2112 and the existing charger/protection/driver architecture replace the rejected converter complexity. The small RF inductors still serve real radio functions.
- Explain the reason for a value before deriving a number. A convenient equation must not invent a design target after the fact: C29 prioritizes discharge timing; RF match values remain starting points.
- Distinguish regulator control from protection, and a firmware percentage display from automatic shutdown. None is interchangeable with the others.
- Treat capacitors as finite charge storage with parasitics. “Helps transient voltage droop” is accurate; “prevents all brownouts” is not.
- Keep exactly one live instance of each circuit. Documentation can use boxes, notes, flow arrows and links to the existing sheets without adding BOM components or changing connectivity.
- Preserve mistakes and corrections in the review record: active versus passive buzzer clarification, raw LED voltage limits, two translator bypass capacitors, QFN land-width correction and the USB reference-area reroute. Retain what passed, then revalidate only what later edits affect.

## Sources and deeper checks

The physical acceptance procedure is [ASSEMBLY_AND_BRINGUP.md](ASSEMBLY_AND_BRINGUP.md).
Current circuit review is [J2_ELECTRICAL_REVIEW.md](J2_ELECTRICAL_REVIEW.md);
historical sections in older reviews are not the current netlist authority.

- **S1:** [Espressif ESP32-S3 schematic checklist](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/schematic-checklist.html), power/reset/clock/USB sections; checked 2026-11-12.
- **S2:** [ST USBLC6-2 datasheet](https://www.st.com/resource/en/datasheet/usblc6-2.pdf); [TI USB Type-C and power-delivery use cases, SLYY228](https://www.ti.com/lit/eb/slyy228/slyy228.pdf), simple 5 V sink with 5.1 kΩ Rd on each CC pin. USB wiring is also recorded in the project's reviewed connector/netlist contracts.
- **S3:** [ADI LTC4054-4.2, 405442xf](https://www.analog.com/media/en/technical-documentation/data-sheets/405442xf.pdf), electrical table and charge-current programming/application sections; checked 2026-11-12.
- **S4:** Exact manufacturer PDFs retained at `../evidence/sources/slkor_dw01a_rev2.pdf` and `fuxin_fs8205a_v2_1.pdf`; source URLs/hashes in `electrical_source_manifest.json`. Use those pin maps rather than an unspecified same-name substitute.
- **S5:** [AOS AO3401A Rev 3.1](https://www.aosmd.com/sites/default/files/res/data_sheets/AO3401A.pdf); Shouhan MSK12C02 Rev A/0 in `../evidence/sources/`; current switch topology in [LED_RAW_SUPPLY_REVIEW.md](LED_RAW_SUPPLY_REVIEW.md).
- **S6:** [Diodes AP2112 DS39724 Rev 2-2](https://www.diodes.com/datasheet/download/AP2112.pdf), application circuit, enable, dropout and thermal data; checked 2026-11-12.
- **S7:** [Diodes DMN2056U DS38480 Rev 2-2](https://www.diodes.com/datasheet/download/DMN2056U.pdf); calculations/conditions in [SIMPLIFIED_ADC_POWER_SWITCH.md](SIMPLIFIED_ADC_POWER_SWITCH.md).
- **S8:** [Espressif ESP32-S3 datasheet v2.2](https://documentation.espressif.com/esp32-s3_datasheet_en.pdf), selected FH4R2/package/power/pin contracts; saved local revision in `../evidence/sources/esp32_s3_v2_2.pdf`.
- **S9:** Abracon ABM8 datasheet dated 2020-07-29, local `../evidence/sources/ABM8_20200729.pdf`; selected 40 MHz/CL10 pF part in BOM.
- **S10:** Johanson B100 Rev 5 manufacturer antenna/matching/keepout guidance, local `../evidence/sources/johanson_b100_rev5.pdf`; the final board still needs tuning.
- **S11:** [Ai-Thinker Ra-02 documentation](https://docs.ai-thinker.com/en/Ra-02/index.html); actual firmware radio settings in `firmware/wearable_withApp/config.h`. The ferrite's complete current/impedance suitability remains a part-qualification check; no invented corner frequency is claimed.
- **S12:** [TI SN74LVC1T45 SCES515N](https://www.ti.com/lit/ds/symlink/sn74lvc1t45.pdf); Worldsemi 2020 V1.3 and V6 reference PDFs in `../evidence/sources/`. The generic ordered LED listing does not identify which applies.
- **S13:** [Nexperia BC817 series Rev 8](https://assets.nexperia.com/documents/data-sheet/BC817_SER.pdf); current active-buzzer stock/geometry notes in [OWNED_BUZZER_AND_MECHANICALS.md](OWNED_BUZZER_AND_MECHANICALS.md).

Equations were independently evaluated for the listed nominal values. They do
not replace measured rail/thermal/ADC/LED/clock/RF results. No circuit, footprint,
firmware, part quantity or manufacturing release status changes with these notes.
