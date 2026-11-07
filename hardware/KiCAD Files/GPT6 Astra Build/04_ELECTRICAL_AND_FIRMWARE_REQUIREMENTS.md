# Electrical and firmware requirements for the implementing AI

Planning evidence captured 2026-10-30, Asia/Manila. This chapter specifies work and closure tests; it does not certify a circuit, approve substitutions, or report physical testing. Read the parts and DOST chapters before choosing an architecture. All paths below are relative to the repository root unless linked otherwise.

## 1. Establish the architecture before copying any netlist

The purchased bare ESP32-S3FH4R2, a SuperMini development board, and an ESP32-S3-WROOM-1 module are three different physical assemblies. GPIO numbering compatibility does not make their footprints, power inputs, memory options, or support circuits interchangeable.

| Candidate | Consequence | Required decision evidence |
|---|---|---|
| Owned bare FH4R2, custom PCB | Reuses MCU, crystal, ceramic antenna and RF parts; requires exact QFN land pattern, crystal/RF design and capable fabrication/assembly | Resolve DOST fine-pitch feasibility in chapter 03; exact chip marking, assembly capability, final package drawing and supplier exception if applicable |
| Carrier for an owned SuperMini | May reuse an existing assembled board and avoid local fine-pitch fabrication; more board area/height | Verify that this board is actually owned and spare; exact board revision, dimensions, header coordinates, accessible GPIOs, regulator/USB/backfeed topology and antenna keepout |
| New WROOM module | Requires a new, explicitly identified part unless stock is verified; different symbol/pad map and mechanical envelope | Exact ordering code and memory configuration, ownership/procurement decision, module footprint and manufacturer keepout; DOST assembly acceptance if used |

Do not combine these architectures. A WROOM-1 contains its own crystal and PCB antenna. Its carrier must not retain a disconnected bare-chip crystal, VDDA supply pins or a ceramic antenna pretending to connect to an unavailable LNA pin. WROOM-1U instead uses an external antenna connector; this does not directly accept a loose ceramic antenna. The Rev C description of `WROOM-1-N4` as containing 2 MB PSRAM must be checked against the exact ordering table; do not infer PSRAM from the prototype or reuse FH4R2 settings. [Espressif module datasheet v1.8, overview, ordering information and schematics](https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf).

### Current artifacts are evidence, not accepted baselines

Read-only KiCad 10 inspection of the files on this date found:

| Artifact under `hardware/KiCAD Files/Antigravity Build/` | Observed state / limitation |
|---|---|
| `RAMS - PCB/RAMS - PCB.kicad_pcb` | Historical ordered design: 68 footprints, 453 track segments. Known defects remain. Keep it and its order ZIP unchanged. |
| `RAMS - PCB - Rev B/RAMS - PCB.kicad_pcb` | 67 footprints, 476 track segments; partial corrections. MCU EP remains 4 × 4 mm; LED remains the old SK6805 2 mm placeholder. README explicitly says do not fabricate. |
| `RAMS - PCB - Rev C/` | README says schematic wiring/DRC still needed. Native `pcbnew.LoadBoard` returned no board for its PCB in this audit. Diagnose with the target KiCad tool; do not interpret its filename or root directory map as proof of validity. |
| `RAMS Wearable - PCB/GEMINI Build/RAMS_RevC.kicad_pcb` | Loads 68 footprints and 79 vias, but **zero track segments**. Uses WROOM-1 while retaining separate antenna/crystal parts; LED still on +3V3. Existing `build/logs/drc_check.json` contains 211 violations and 230 unconnected items; this historical report is not a fresh final check. |

The GEMINI custom module footprint also contains repeated pad 41 entries whose nets differ, including blank nets; investigate every physical ground pad and internal module ground connection. Its project omits an explicit minimum via annular-ring setting. A grid of vias and a nominal 0.30 mm track rule do not establish connectivity or compliance. Future acceptance must bind reports to final source and rules hashes.

## 2. Required connection contracts

Reference designators below refer to the historical RAMS board. If renumbered, provide an old-to-new mapping. `/GND` is protected system/USB ground; `/B_MINUS` is cell negative. They must not be collapsed into a single net.

### Battery protection: conditional six-pin FS8205A mapping

The following matches the FuxinSemi FS8205A SOT-23-6 reference, **not a guarantee of the unidentified Shopee manufacturer's part**. Close this uncertainty with the seller/manufacturer datasheet or a documented component identification procedure before assembly.

| Component pin | Function | Intended net |
|---|---|---|
| Q3.1 | S1 | B_MINUS |
| Q3.2, Q3.5 | Common drain | FET_DRAIN; neither ground nor a gate-control net |
| Q3.3 | S2 | GND |
| Q3.4 | G2 | DW_OC |
| Q3.6 | G1 | DW_OD |

[FuxinSemi FS8205A v2.1, circuit/pin diagram and SOT-23-6 outline](https://datasheet.lcsc.com/datasheet/pdf/5d5d336ed528176185784e3faf8fb551.pdf?productCode=C908265). Check top-view orientation against footprint numbering, not just the outline.

For the referenced DW01A: pin 1 OD goes to Q3.6; pin 3 OC goes to Q3.4; pin 6 VSS goes to B_MINUS; pin 5 VDD is supplied from B_PLUS through the selected filter resistor, with local decoupling to B_MINUS; pin 2 VM/CS senses **system GND through the sense/filter resistor**; pin 4 is NC. Recheck selected manufacturer's recommended external resistor/capacitor values and thresholds. [Slkor DW01A Rev.2, pin table and typical application](https://datasheet.lcsc.com/datasheet/pdf/7c412cac0dea0278008492f4ad08dd26.pdf?productCode=C42380662).

**Known mistakes to prevent:** Both Rev C and GEMINI `circuit_spec.json` currently tie R5 from DW_CS to B_MINUS. That defeats the intended voltage sensing across the protection FETs. Rev C's prose additionally contradicts its own correct Q3 table by mapping OD/OC to drain pins 5/2. Derive the netlist from the selected datasheet application, not that prose. Never short B_MINUS and GND with a mounting hole, copper pour, test clip, battery cable shield or another board's power connection. Charger and external-load returns must be reviewed against the protection topology.

### Power path, charger and regulator

Preserve the intended function: USB powers the system and charger; battery powers the system when USB is removed; USB is not back-powered; the power switch disables the intended loads; battery protection remains in the current path. Draw a power-state table for USB absent/present, battery absent/present/protected-off, switch off/on, and USB hot-plug.

- Verify AO3401A gate/source/drain using the actual manufacturer's datasheet. The historical intended topology is gate to VBUS with pull-down, source to LDO_IN, drain to B_PLUS; assess its body-diode direction in every state. Do not reverse source/drain merely to make a schematic look conventional.
- SS14 D2: anode VBUS, cathode LDO_IN. Verify the physical cathode marking. Validate USB input voltage, diode drop, reverse leakage and heat with simultaneous radio/LED load.
- U3 charger: identify the LTH7R marking and actual device first. The reference TP4054/LTH7 circuit uses CHRG=1, GND=2, BAT=3, VCC=4, PROG=5. CHRG may be intentionally NC if no status indicator is required. Do not wire it to an unrelated GPIO or rail just to suppress ERC.
- The stock PROG resistor may be 4.3 kΩ rather than 4.02 kΩ. For a charger whose datasheet specifies `I_CHG(mA) = 1000/R_PROG(kΩ)`, these imply approximately 233 mA and 249 mA respectively. This is conditional on the selected IC's equation. Cell capacity, allowed charging rate, chemistry, thermal limit and protection are unresolved until documented; “acceptable” cannot follow from resistor availability alone.
- AP2112K-3.3 SOT25 uses VIN=1, GND=2, EN=3, NC=4, VOUT=5. Its 600 mA rating is not a complete system thermal budget. Keep required input/output capacitance after DC-bias derating and verify EN limits and off-state discharge/backfeeding. [Diodes AP2112 DS39724 Rev.2-2, pin assignments, ratings and application](https://www.diodes.com/datasheet/download/AP2112.pdf).

Produce a worst-case current table for MCU/BLE (and Wi-Fi if enabled), LoRa TX, buzzer, full-white LED, other loads and transient overlap. Compute `P_LDO = (V_IN − 3.3 V) × I_LOAD`; e.g. 4.7 V in at 0.40 A gives **0.56 W**, an illustration, not a prediction. Use real package/copper thermal conditions to establish junction margin. At low battery, available input must exceed 3.3 V plus worst-case regulator, FET, trace and connector drops; otherwise regulation is lost. DW01's emergency undervoltage cutoff is not the normal firmware shutdown target. Record the usable battery range and runtime model, then measure it.

### Bare MCU only: power, footprint and clock

If the bare-chip branch is selected, separately prove every power pin and exposed pad against the exact FH4R2 package. The historical footprint has 0.20 mm-wide leads at 0.40 mm pitch and a **4 × 4 mm pad 57**. Espressif publishes a distinct FH4R2 package drawing (Fig.7-2, printed p.78), with a larger exposed pad than the generic S3 package; use that exact drawing and recommended land-pattern treatment. Do not rename the generic EP4x4 footprint and call it matched. Also verify paste windows, thermal-via treatment and assembly process. [ESP32-S3 datasheet v2.2, package section and consolidated pin table](https://documentation.espressif.com/esp32-s3_datasheet_en.pdf).

Bare-chip VDDA pins 55/56 require the correct supply and local decoupling; the original isolated `/VDDA_PWR` rail cannot remain. VDD_SPI needs variant-specific handling and decoupling; do not blindly strap it to +3V3 because an old drawing lists it as an ordinary input. Espressif describes its internal supply path and simultaneous supply requirements. Establish EN/reset timing and all boot strap states under peripheral power-up. [Espressif schematic checklist, power, reset, flash/PSRAM, clock and straps](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/schematic-checklist.html).

For the purchased 40 MHz crystal, record exact part number, load capacitance, ESR, tolerance, drive limit and pin/case-ground map. Calculate the load using `C_L ≈ C1·C2/(C1+C2) + C_stray`, then review the manufacturer's and Espressif's limits. 12 pF capacitors are not automatically correct because they are in stock. A 33 Ω substitute for a 22 Ω series resistor requires justification and oscillator verification. Keep the loop compact and clear of noisy traces; do not route underneath antenna keepouts or across a broken ground return.

### WS2812B: footprint solved separately from voltage

The inventory identifies 5050/DC5V; exact silicon revision is still unverified. Standard four-pad WS2812B mapping is 1 VDD, 2 DOUT, 3 GND, 4 DIN. The old SK6805 2 mm assignment differs. Verify the purchased LED's corner marking and pad layout, fit a local bypass capacitor and leave unused DOUT explicitly NC. Older manufacturer documentation does not establish reliable 3.3 V supply operation and specifies VIH=0.7×VDD. At 5.0 V that is 3.5 V, above a nominal 3.3 V logic high. [Worldsemi older WS2812B datasheet, pin/electrical tables, manufacturer PDF hosted by Adafruit](https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf).

Worldsemi's V6 announcement explicitly adds 3.3 V operation and changes the threshold; this is evidence for V6, not for every marketplace LED. [Worldsemi V6 upgrade notice, 2025-09-30](https://www.world-semi.com/web/index.php?classid=22&id=587&lanstr=en&topclassid=19).

Resolve one branch before layout: (a) verify an owned variant compatible with the complete 3.3 V operating range; (b) add a suitable regulated LED rail and compatible logic driver, with load, standby, inrush, shutdown and back-power checks; or (c) propose a different indicator with an explicit feature/parts decision. USB-only 5 V does not power the LED in battery use. Raw-cell power also does not automatically meet full-discharge operation. A series resistor alone is not a level shifter. Keep unresolved optional footprints DNP and electrically safe; do not claim the indicator complete while its supply is unresolved.

### Buzzer and transistor

Verify whether the owned buzzer is active electromagnetic or piezo, its rated voltage/current, dimensions, polarity and sound-port clearance. Do not equate a product name with a 9.6 × 6.5 mm footprint. Standard BC817 pin mapping is **1 base, 2 emitter, 3 collector**: emitter to GND, collector to BUZZER_NEG, base through resistor from GPIO1, with an appropriate off-state bias. Rev C and GEMINI specs reverse emitter/collector. [Nexperia BC817 series datasheet, pinning table](https://assets.nexperia.com/documents/data-sheet/BC817_SER.pdf).

Size base drive from the required saturated collector current and GPIO limits. If the buzzer is inductive, clamp anode goes to switched negative and cathode to the positive supply; confirm the owned 1N4148W package and repetitive current/energy suitability. Preserve the active-buzzer firmware behavior unless the hardware type changes explicitly.

## 3. RF, USB and physical connections

For the bare-chip ceramic-antenna branch, 2450AT18B100E is feed pin 1 and **NC pin 2**, not the D0100 four-terminal part. Reproduce the manufacturer's board-edge/no-ground geometry and land pattern before positioning switches, battery, metal shell or bottom-side LoRa module nearby. A keepout that only blocks pours can still contain tracks/pads/components: inspect all layers and enclosure geometry. Keep the 2.4 GHz chip matching network distinct from antenna tuning; retain tuning provisions with values established by design and measurements. [Johanson 2450AT18B100 specification 03/08/2016, mounting/reference board pages](https://www.farnell.com/datasheets/2173873.pdf).

Derive RF transmission-line geometry from the actual DOST stackup, dielectric data, copper and solder mask. Naming a 0.30 mm net class `RF_50R` does not make it 50 Ω. Do not use the 2.4 GHz ceramic antenna as the 433 MHz LoRa antenna. Verify the Ra-02 variant, module orientation, RF connector and separate correctly tuned antenna; establish all module ground pads' connectivity. Include body/enclosure detuning and coexistence in the physical test plan.

USB-C requires independent CC1 and CC2 pull-downs, correct duplicated D+/D− contacts, deliberate SBU NC, ESD device pin mapping and a low-inductance ground path. Verify the actual connector drawing; a 16-pin listing is not a land pattern. The original 0.30 mm pads at 0.50 mm pitch leave only 0.20 mm nominal gap, below a 0.254 mm requirement. Wider shell holes do not solve that. A 1.0 mm round hole is not proven to accept an elongated metal tab: compare maximum tab diagonal, peg positions, board thickness and placement tolerances, then physically fit the part. Never shrink pads or enlarge holes without documenting solderability and minimum annular ring consequences.

USB D− is GPIO19 and D+ GPIO20. Check the complete connector–ESD–series-part–MCU path, pair geometry, continuous reference and both plug orientations. Native USB full speed does not excuse arbitrary routing or an unverified power budget. Determine total USB charger-plus-system demand and source-advertised capability; CC pull-downs alone do not authorize any desired current. Confirm USB-only, battery-only and simultaneous connections without reverse-power paths.

## 4. Firmware contract and battery calibration

Authoritative current code inspected: `firmware/wearable_withApp/config.h`, `battery.h`, `battery.cpp`, `lora_tx.cpp`, `gps.cpp`, `bt_service.cpp`, plus `firmware/shared/protocol.h`. The active implementation is **phone-assisted**: GPS/IMU information arrives over BLE. Do not add a GPS or IMU circuit merely because an older directory map describes one.

| Signal | GPIO | Bare S3 package pad | WROOM-1 module pad, if selected |
|---|---:|---:|---:|
| Boot / cancel button, active low | 0 | 5 | 27 |
| Buzzer control | 1 | 6 | 39 |
| Battery ADC | 2 | 7 | 38 |
| Ra-02 DIO0 | 8 | 13 | 12 |
| Ra-02 RESET | 9 | 14 | 17 |
| Ra-02 NSS | 10 | 15 | 18 |
| Ra-02 MOSI | 11 | 16 | 19 |
| Ra-02 SCK | 12 | 17 | 20 |
| Ra-02 MISO | 13 | 18 | 21 |
| USB D− | 19 | 25 | 13 |
| USB D+ | 20 | 26 | 14 |
| RGB data | 48 | 36 | 25 |

Regenerate this table from the selected exact symbol and datasheet before implementation; do not use GPIO numbers as physical pad numbers. GPIO46 was the historical LED mismatch, not a general claim that GPIO46 is input-only. Verify boot with the cancel button held and released; GPIO0 sharing must be reflected in user instructions.

`battery.h` currently assumes 100 kΩ/100 kΩ and multiplier 2.0. Existing CAD uses 330 kΩ/180 kΩ: multiplier `(330+180)/180 = 2.833333`, ADC node at 4.2 V approximately 1.482 V. Keeping firmware multiplier 2.0 would report approximately **2.965 V for a 4.2 V cell**, before ADC errors. Reconcile the chosen values and voltage ratings, tolerances, leakage and ADC settling. Do not merely change the comment. Use the target ESP32 ADC calibration facility and a measured battery sweep; the present `raw/4095*3.3` model is not a calibrated reference. Review divider leakage or injection into an unpowered MCU, and protected-off conditions. Battery percentage and low-battery shutdown require a characterized cell/load model.

Preserve binary packet sizes, field meanings, LoRa timings and BLE contracts. Current shared settings are 433 MHz, SF9, 125 kHz bandwidth, coding rate 4/5, TX power 17 dBm and sync word 0x34. Read values, not misleading comments about “max” power or sync-word defaults. Any necessary change must update both ends and be tested; regulatory compliance is a separate check, not established by this code.

## 5. Implementable acceptance and bring-up sequence

1. **Before CAD:** close architecture, exact package identity, battery specification, LED supply and DOST feasibility. Create an authoritative pin/net contract reviewed independently of the generator. Record approved substitutions and measured package dimensions.
2. **Schematic:** make readable functional sheets for power/protection, MCU/clock, radio/RF, USB, controls and test points. Show B_MINUS distinctly from GND. No hidden crossings, clipped fields or overlapping symbols. Every NC is intentional. Compare symbols, footprints and netlist endpoints; ERC alone is insufficient.
3. **Layout:** place mechanical/RF/power constraints first; allow board growth rather than violating clearance. Keep bypass loops short, real return paths continuous and antenna exclusions clear on both sides. Verify all ground regions by copper connectivity, not a picture. Include USB shell, battery connector, switch travel, buzzer port, soldering tool and probe access. No arbitrary stitching under pads.
4. **CAD closure:** no unexplained shorts or unconnected required pads; schematic/PCB parity; DOST rules actually active; no blanket rule exclusions; final source hashes bound to raw reports and renders. Explicitly inspect duplicate pads, rotated footprints, solder-mask bridges, passive voltage/package changes, physical shell/tab fit and exposed-pad assembly. Re-check whenever generated sources change.
5. **Unpowered assembly:** inspect polarity/orientation and solder bridges; measure rail resistance and verify B_MINUS/GND are connected only through the intended protection path. Test one assembled unit first. QFN/hidden-ground assembly needs appropriate reflow/inspection facilities; ordinary hand soldering access must not be assumed.
6. **Power stages:** start with an appropriately current-limited bench source and isolated loads; verify charger, LDO, switch and protection behavior against recorded voltage/current/temperature limits before full assembly. Use a suitable battery simulator/electronic load for protection characterization; do not deliberately short or overcharge a real lithium cell. Prevent grounded instruments from bridging B_MINUS to GND.
7. **Digital stages:** verify reset/boot/download and native USB both ways; confirm chip identity, flash/PSRAM configuration, firmware boot logs and repeated power cycles. Add LED/buzzer individually, then SPI/LoRa with its antenna attached. Verify battery ADC calibration and all power-state transitions.
8. **System stages:** simultaneous BLE, LoRa TX, LED and buzzer while logging supply minima, resets, current and temperature at the intended cell voltage range; radio range in the actual enclosure and wearing orientation; phone disconnect/reconnect, false-alarm cancel and receiver packet compatibility. Record measurements, equipment, firmware commit and pass thresholds before calling hardware validated.

Failure rules: stop the dependent stage on a missing manufacturer identity, a geometry/fabrication conflict, uncertain polarity, excessive current, rail collapse or unexplained heating. Preserve the failed data, isolate the cause, revise the design contract, then rerun affected gates. A successful script, clean ERC or visual rendering cannot replace these checks.
