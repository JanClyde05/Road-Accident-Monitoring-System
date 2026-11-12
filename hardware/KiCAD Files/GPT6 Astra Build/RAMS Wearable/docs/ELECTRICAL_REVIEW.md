# Electrical review and component evidence

> **SUPERSEDED ARCHITECTURE — 2026-11-09:** The owner rejected the added buck-boost/3.45 V design. This document records the earlier candidate, not the intended revised circuit. Read `SIMPLIFICATION_20261109.md` and the project README before using any selection below. No manufacturing release.

Review date: 2026-11-08, Asia/Manila. Scope: the new JLCPCB bare-chip wearable, maximum 42 x 32 mm, top-side reflow with Ra-02 hand-soldered underneath afterwards. This is an engineering review, not evidence of a working assembled board. The exact historical `Antigravity Build/RAMS - PCB` and its submitted order archive were read without modification. The DOST version is deferred.

The implementation source is `../circuit_spec.json`. This review establishes component contracts; final CAD parity, placement, routing and DRC evidence must be recorded separately against their final hashes. Primary PDFs and their source/hash manifest are in `../evidence/sources/`.

## Decisions and corrections

| Item | Required implementation | Evidence / status |
|---|---|---|
| MCU architecture | Bare **ESP32-S3FH4R2**, 4 MB embedded quad flash and 2 MB embedded quad PSRAM. No external memory or WROOM substitution. | Espressif S3 datasheet v2.2 and hardware checklist; verified part-family contract, received chip identity still physical inspection. |
| MCU power | VDD3P3 pins 2/3 filtered supply; VDD3P3_RTC 20, VDD3P3_CPU 46, VDDA 55/56 supplied; EP57 ground. | The original VDDA net was isolated. New net assignments must all be independently checked. VDD_SPI29 is internally supplied and separately bypassed, not blindly shorted to the main rail. |
| Main regulator | **TPS63020DSJR**, nominal 3.45 V, forced PWM, 1.18 MOhm / 200 kOhm feedback, both 0.1%. | TI SLVS916I pp4,6,8,13,15-16. This replaces the AP2112 whose dropout/thermal limits restrict this load/battery combination. |
| Regulator VINA correction | **Pin1 on REG_VINA with 100 nF to GND; no external tie to SYS_IN.** PS/SYNC13 goes to REG_VINA; switch selects REG_VINA/GND for EN12. VIN10/11 remain SYS_IN. | Verified visually in TI Fig3 p8 (internal resistor VIN to VINA) and Fig7 p13. Revision G explicitly removed the external VIN/VINA link. An earlier review recommendation incorrectly tied them; that recommendation is superseded. A power flag on REG_VINA documents its internal source for ERC, not an external source. |
| Indicator | Exact **Worldsemi WS2812B-V6**, 5050: pin1 VDD, pin2 DOUT NC, pin3 GND, pin4 DIN. GPIO48 is MCU pad36. | Worldsemi V1.1 2025-10-21 pp2-4; manufacturer PDF hosted by TME. V6 supports 3.3 V minimum and threshold 0.55 VDD. Generic owned 5 V WS2812B stock is not interchangeable without identification. |
| Protection | Exact FuxinSemi FS8205A SOT23-6 plus exact Slkor DW01A. Keep B_MINUS distinct from GND. | Manufacturer PDFs; conditional on purchasing/identifying these exact makers. Six leads alone do not establish pinout. |
| Charger | Exact LTC4054ES5-4.2, 10 kOhm PROG for nominal 100 mA; charge link initially DNP pending cell/harness acceptance. | ADI 405442xf p2: 93-107 mA for 10 kOhm under specified conditions. Owner has 500/1000 mAh nominal 3.7 V LiPo, but capacity alone does not certify permitted charge conditions. |
| Battery measurement | Switched equal 10 kOhm / 10 kOhm 0.1% divider, local 10 nF, supervised enable and output discharge. | See PARTS_AND_FIRMWARE.md for exact TPS22919/TLV803E contracts and transient acceptance. Scale factor remains 2.0. ADC calibration remains a physical/firmware commissioning gate. |
| System sensors | Phone-assisted BLE GPS/IMU; no extra local sensor/GNSS circuits. | Current wearable firmware, not the outdated architecture summary. |

## Regulator limits and calculations

`VOUT = VFB * (1 + Rtop/Rbottom) = 0.500 V * (1 + 1.18 Mohm / 0.200 Mohm) = 3.450 V`.

With independent 0.1% resistor limits and TI's 0.495-0.505 V PWM feedback limits, then conservatively adding 0.5% line and 0.5% load regulation, the static envelope is approximately **3.3756-3.5253 V**. Reserving a further +/-50 mV for ripple/transients gives **3.3256-3.5753 V**. This is a budget, not a simulated or measured waveform. Release requires scope evidence over battery, USB hot-plug and simultaneous BLE/LoRa/buzzer/RGB load. Project acceptance target is 3.32-3.58 V; never exceed the MCU's 3.6 V limit or fall below the selected LED's 3.3 V minimum during required operation.

Power-save mode may raise the regulated level by as much as 5% relative to PWM. **PS/SYNC must remain high** for the 3.45 V assembly. Do not ground it to improve runtime without redesigning the rail.

The selected circuit uses 1.5 uH Coilcraft XFL4020-152ME/ML, two 10 uF input and three 22 uF output X5R capacitors. TI's characterized capacitor examples are GRM188R60J106ME84D and GRM188R60J226MEA0L. Datasheet Table1 explicitly accounts for capacitance tolerance and DC-bias reduction in its tested combinations; arbitrary equal-marking substitutes still need an effective-capacitance check. VINA bypass is 100 nF and must not exceed 220 nF. Keep the high-current input/output loops local; join control ground to PGND near the IC, with feedback clear of switching copper.

Espressif datasheet p64 note3 requires VDD3P3_CPU **no higher than 3.3 V while burning eFuses**. Normal firmware flashing is distinct from eFuse programming. The default 3.45 V assembly is not an eFuse-programming configuration. If eFuse work is required, use a documented lower-voltage feedback assembly and measure the rail before programming; do not assume a nominal 3.3 V resistor pair guarantees a maximum of 3.3 V. LED performance is not guaranteed below its rated minimum. No eFuse change is required or authorized by this PCB implementation.

## Exact pin and package contracts

### TPS63020 DSJ14

| Pin | Function | Required connection |
|---|---|---|
| 1 | VINA | REG_VINA; 100 nF to logic GND, internally fed from VIN |
| 2 | GND | Local quiet ground, joined to PGND near IC |
| 3 | FB | 1.18 MOhm to output, 200 kOhm to quiet GND |
| 4,5 | VOUT | +3V45; both physically connected |
| 6,7 | L2 | One end of 1.5 uH inductor |
| 8,9 | L1 | Other end of inductor |
| 10,11 | VIN | SYS_IN; both physically connected |
| 12 | EN | Power-switch selected REG_VINA/GND, defined off state |
| 13 | PS/SYNC | REG_VINA, forced PWM |
| 14 | PG | Optional open-drain status, deliberately NC here |
| 15 in CAD | Exposed PGND | Copper, thermal vias and eight side fingers all GND |

The package is 3 x 4 mm with 0.5 mm pitch. Its custom footprint follows TI land-pattern drawing 4210895-2/E: 0.60 x 0.24 mm signal lands at x +/-1.4 mm, EP 1.58 x 2.85 mm, eight PGND extensions ending at y +/-2.2 mm. It is **not** a generic 1.8 x 2.8 mm EP footprint. Paste uses four 0.66 x 1.25 mm windows plus the narrow extensions, approximately 81% of the complete copper shape. The visible PGND fingers and the center copper share number15. Assembly must wet the exposed pad; those fingers alone do not establish adequate hidden-pad soldering.

### ESP32-S3FH4R2

Espressif datasheet v2.2 Fig7-2, printed p78, gives EP D2/E2 **5.7 mm nominal, 5.6-5.8 mm**; body7 x 7 mm and pitch0.4 mm. The generic original 4 x 4 mm EP is not reused. The local footprint retains native 0.8 x 0.2 mm signal lands at radial center3.45 mm and replaces EP57 with5.7 x5.7 mm. Minimum nominal EP-to-lead-land gap is0.20 mm. Lead numbering remains counterclockwise from upper-left pad1 in top view.

Sixteen 1.12 mm square stencil windows provide61.8% EP paste coverage. Nine board-generated GND vias are planned at local x/y -1.4,0,+1.4 mm, in the paste-window gaps. These are ordinary through vias; treatment/tenting and stencil thickness remain assembly-process checks. No filled/capped via process is claimed. Inspect reflowed hidden joints, QFN bridges and solder-wicking behavior on the first article. The attached generic 3D body is illustrative, not an accurate FH4R2 EP model.

### Cell protection and power path

FuxinSemi FS8205A v2.1: Q3.1 S1=B_MINUS; Q3.2/5 common drains=FET_DRAIN; Q3.3 S2=GND; Q3.4 G2=DW_OC; Q3.6 G1=DW_OD. Slkor DW01A Rev2: U4.1 OD to Q3.6; U4.2 VM through1 kOhm to **GND**; U4.3 OC to Q3.4; U4.4 NC; U4.5 VDD from B_PLUS through100 Ohm and100 nF to B_MINUS; U4.6 VSS=B_MINUS. Never put the VM sense resistor on B_MINUS or bridge cell negative to system ground elsewhere. Both MOSFET common-drain pads must connect in copper.

AO3401A uses gate1, source2, drain3. In the reverse-oriented load-share circuit, source2=SYS_IN and drain3=B_PLUS; gate1=VBUS with100 kOhm to GND. SS14 cathode1=SYS_IN, anode2=VBUS. The body diode therefore permits battery startup toward SYS_IN while blocking the USB-fed SYS_IN from charging the cell through Q1. Verify hot-plug and protection-off states; this topology does not implement USB-C current negotiation. Charger and load returns go to protected GND. BC817 driver is base1, emitter2=GND, collector3=BUZZER_NEG; clamp cathode is positive supply.

## RF and crystal boundary

Keep chip matching and antenna tuning as two separate circuits. Espressif's current schematic checklist gives a starting range of1.2-1.8 pF shunt /2-3 nH series /1.8-1.2 pF shunt. The selected **1.5 pF /2.4 nH /1.5 pF** are midpoint engineering starting values, not an approved board match. Espressif recommends0201; this project's0402 parts are a deliberate reflow/reuse tradeoff. Its layout guidance says the harmonic stub is not required for0402 or larger, but that does not certify the larger-package matching values. RF tuning remains open.

Johanson B100 legacy code maps to2450AT18B0100001E Rev5.0. Pin1 is feed (marked side); pin2 is an electrically isolated mechanical anchor. The land pattern has two0.8 x1.6 mm lands, inner gap2.6 mm and overall span4.2 mm. Its reference corner clearance is **6.5 x6.5 mm**, all copper layers clear except antenna/feed. The13.5 mm dimension belongs to the remainder of the20 mm evaluation-board height, not the clearance. Check actual rotated geometry, opposite-side LoRa metal, enclosure and battery placement against this region.

The B100 evaluation board uses a separate tee:50 Ohm line → series1.2 pF → shunt2.7 nH to GND → series3.3 nH → antenna feed. Johanson explicitly states these values depend on PCB dimensions, thickness, material and surroundings; they are tuning placeholders for this new geometry. Appropriate high-Q RF passives and tuning substitutions must be identified in the purchase list. RF trace width is set from the actual JLCPCB stackup; a net named50 Ohm proves nothing by itself.

The selected40 MHz crystal identity/footprint is documented in PARTS_AND_FIRMWARE.md. With CL10 pF, equal12 pF loads imply Cstray about4 pF via `CL=C1*C2/(C1+C2)+Cstray`; that parasitic value is an assumption. Current Espressif guidance suggests an initial24 nH series component at XTAL_P; the present22 Ohm series resistor is therefore a design deviation requiring startup/frequency/harmonic validation or a reviewed change. Preserve the series footprint. Crystal signal traces have no vias and a continuous ground reference; avoid the regulator inductor and digital traces underneath. Confirm±10 ppm frequency accuracy by an appropriate RF/clock measurement.

## Validation status and open gates

- The two custom high-risk footprints load in KiCad10.0.6 and pass pad-number, EP-size and placement assertions in `scripts/build_verified_library.py`; log `verification/library_build.log`.
- The early native-library attempt failed because KiCad10 lacks the attempted `SetDescription`/footprint-save bindings. The final generator uses native footprint parsing plus deterministic text editing and passed. No historical CAD was altered by those failed attempts.
- Library generation is not full-board ERC/DRC, netlist parity or electrical validation. Use the final project verification records for those results.
- Before fabrication release: final source-bound ERC/DRC/parity, complete connected ground, RF/USB stackup geometry, exact parts/package availability, stencil/process review and placement/mechanical review must close.
- Before claiming operation: first-article supply/current/thermal and fault-state tests, battery/harness/protection/charging acceptance, MCU clock/USB boot in both connector orientations, buzzer/RGB/LoRa/BLE tests, battery ADC calibration and antenna/enclosure measurements must close. No such physical test occurred in this review.
