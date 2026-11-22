# Heatbed assembly review — 16 November 2026

**The existing heatbed approach remains reasonable for a small prototype trial.** Use the frozen FIRST_POWER stencil, confirm the paste and chip moisture history, and measure the thermal cycle on one board before committing the batch. A reflow oven, X-ray machine and RF laboratory are not prerequisites for initial assembly and basic power screening. They also cannot be replaced by a claim that visible joints prove every hidden joint.

This is a read-only review of `manufacturing/JLC_PROTOTYPE_20261115/`. No frozen file, CAD source or manufacturing artwork was changed. Source identities:

| Frozen input | SHA256 |
|---|---|
| `docs/ASSEMBLY_AND_BRINGUP.md` | `17effb1f638e8a36b12302efd6ccf77a2bf531ad95acbb5aab381c7c40697d83` |
| `docs/FAB_MASK_REVIEW_20261114.md` | `6244c56ae88829b6488133a7193e766ff18c34b415245f0451b0ded1d4a70f8e` |
| `docs/BOM_PROCUREMENT.csv` | `b22fc03700dec8fae69de096a3264c441dd34a4df7d2da939f4cc57a6da3122b` |
| `source/RAMS_JLC_S3.kicad_pcb` | `cf926980e8fdaecfb1abeb252f0ca73cc0cfbd4e5cad11143fd9a3e0ee21964a` |

## What is established

- The inventory lists five **ESP32-S3FH4R2** chips, two Ra-02 modules, the relevant passive/component stocks and generic mechanical parts. It does not record solder paste, its storage, a thermometer, current-limited source, or chip dry-pack history. Inventory ownership alone does not establish remaining quantities or exact stock identity.
- The earlier Gemini ordering note names **Mechanic IX5 Ultra + Relife RL-403 Sn63Pb37**, with a 140–150°C soak and 205–210°C reflow step. This is historical project advice, not a measured profile for this four-layer board or confirmation of the equipment now owned.
- A newly located **brand-owner source** confirms [RELIFE RL-403 as a 183°C product with 20–38 µm powder](https://www.exinxun.com/soldering-consumable/rl-403.html). The accessible page does **not** provide a usable ramp/soak/time-above-liquidus/peak/cooling profile. Its generic refrigerated-life marketing claim does not establish the user's syringe expiry or condition. Check the actual label for alloy, batch and storage; do not confuse RL-403 with another suffix/variant.

## S3 moisture handling before heat

[Espressif's chip dry-packing instructions](https://docs.espressif.com/projects/esp-packaging/en/latest/esp32s3/02-dry-packing/index_chip.html) explicitly classify the chips as **MSL 3**. They give **168 hours cumulative floor life at ≤30°C / 60% RH**, and require baking when the humidity card reads above 10% at 23±5°C or floor life has been exceeded. Baking follows IPC/JEDEC J-STD-033, with chips removed from carrier tape.

Record whether the five chips arrived in a sealed moisture-barrier bag with desiccant and humidity card, when it was opened, and subsequent storage. Loose chips or an ordinary resealable bag do not demonstrate dry handling. The seven-day allowance cannot simply be assumed in hotter/more humid conditions. If the history is unknown, arrange a properly controlled dry-out through an equipped lab/repair shop or obtain documented dry-packed replacement stock; buying a drying oven is not the default recommendation. A brief heatbed preheat is not a proven moisture reset. Do not put unidentified carrier tape, a LiPo, or paste in a bake process.

The [S3 datasheet v2.2, Table 5-13, printed p69](https://documentation.espressif.com/esp32-s3_datasheet_en.pdf) describes a reliability qualification involving 125°C/24 h bake, moisture soak and 260°C/20 s reflow exposures. Those are qualification test conditions, **not** a universal drying or RL-403 soldering recipe. Do not aim a leaded-paste build at 260°C merely because that number appears there.

## Stencil and paste check

The frozen **0.10 mm** top stencil is appropriate to trial. Independently recomputed dimensions:

| Feature | Calculation | Result |
|---|---|---:|
| QFN perimeter aperture area ratio | `(0.75 × 0.20) / [2 × 0.10 × (0.75 + 0.20)]` | **0.789** |
| QFN perimeter aperture aspect ratio | `0.20 / 0.10` | **2.0** |
| Exposed-pad paste area | `16 × (1.12² − 2 × 0.06²)` | **19.9552 mm²** |
| Exposed-pad paste coverage | `19.9552 / 5.70²` | **61.4195%** |

These meet the ordinary geometric screening guidance in [TI SLUA271C, §§4.3–4.4](https://www.ti.com/lit/an/slua271c/slua271c.pdf): area ratio above 0.66, aspect ratio above 1.5, and a windowed exposed-pad print. Geometry does not establish actual paste release or solder-joint coverage.

[Indium's powder-selection note](https://www.indium.com/wp-content/uploads/2025/03/Powder-Choice-and-Stencil-Design-Guidelines-APPNOTE-97742-A4-R4-1.pdf) recommends approximately five largest particles across a rectangular opening. For documented Type 4-sized 38 µm powder, `5 × 38 = 190 µm`, fitting the **200 µm** perimeter aperture. Type 3's corresponding 225 µm screen does not fit. This supports trying genuine, usable 20–38 µm RL-403 or another documented Type 4 paste; it does not require costly finer powder automatically.

Inspect the sixteen exposed-pad mask windows and nine covered top holes before printing. Preserve the mask webs: nominal straight web 0.20 mm, outer border 0.15 mm and hole-edge coverage 0.1121 mm. Ordinary tenting is not filled/capped vias. Reject missing/damaged tents for this planned print process; do not compensate by adding a blob beneath U1. Check stencil registration, complete perimeter deposits, all sixteen separate centre deposits and clear inter-pad gaps under magnification. Clean and reprint a smeared print before placing parts.

## Thermal measurement and part handling

[TI SLUA271C §5.2](https://www.ti.com/lit/an/slua271c/slua271c.pdf) bases a reflow profile on actual solder-joint temperature, notes differences between board locations, and calls for thermocouples. For this heatbed, a fine thermocouple secured near U1's solder area and another check at the USB/heavier-copper region give useful inexpensive process evidence. Measure the **package surface** as well when assessing its temperature limit. A probe on the plate, a dangling bead, or the heatbed display does not provide those measurements. Repeated measurements with one probe are possible for an initial trial, but record the different runs and loading; an empty board is not thermally identical to a populated board.

Use the actual paste's supplied process window and the most restrictive fitted-part limits. Record ramp, soak, peak, time above the confirmed alloy's liquidus, and cooling. The old 205–210°C setting remains an unqualified reference; **this review supplies no invented RELIFE time/temperature profile**. Verify that the heatbed can achieve and leave the required window without large overshoot. Turning its heater off does not instantly cool the board. Rehearse handling cold, support the board flat, and avoid flexing or disturbing it while solder solidifies.

Other relevant component evidence:

- [GCT USB4105 product specification A3, §7](https://gct.co/files/specs/usb4105-spec.pdf) documents a convection reflow heat-resistance test with 255°C (−0/+5°C) peak. This supports the named connector's reflow suitability; it is neither the required SnPb peak nor evidence that a generic matching socket uses the same plastic. Check all shell/stake joints after reflow and finish insufficient joints with the iron before plugging a cable in.
- The saved **Shouhan MSK12C02 manufacturer A0 PDF, pp8–9**, documents a 350°C maximum/3 s continuous hand-solder condition and a defined automatic-solder exposure up to 260°C. It also prohibits solvent washing and flux entry through the top. The project contains another Shouhan reference with different repeat-count wording; plan one top reflow, not repeated whole-board reheating. These limits cannot be transferred to an unidentified switch solely from matching dimensions.
- The XUNPU TS-1088 drawing and generic inventory entries do not establish a complete thermal profile for every received button. Verify the actual mechanical part's material/process specification before including it in the top reflow. Where uncertain, accessible switches/connectors can instead be fitted locally by iron after the top cycle, with their pads kept free of paste; record that deviation from the normal 78-part top population. No change to frozen stencil artwork is required.
- **BZ1 remains hand-soldered**, even though the named fallback buzzer has a reflow-capable datasheet. The owner's actual 9650 identity is not established. **U2 Ra-02 remains absent during heatbed work** and is iron-soldered afterward. LED1 and R30 remain absent through initial power checks. Battery and external cables stay disconnected during all soldering.

## Practical first-board sequence

1. **Prepare one board.** Verify its identity and received mask, gather the exact BOM values, compare mechanical stock with the assembly/pad drawings, resolve U1 moisture handling and paste condition. Confirm underside pegs/stakes do not make the board rock on its support.
2. **Trial the print and thermal cycle.** Use a spare board/appropriate sacrificial parts for process setup where available. An empty-board temperature run helps find offsets but does not qualify the fully loaded cycle. Save print photos and the measured time/temperature record. If the paste specification cannot be obtained, label the trial experimental; do not call the historical recipe manufacturer-approved.
3. **Print FIRST_POWER and place top parts.** The frozen BOM has **78 top-reflow components**, excluding BZ1, R30 and LED1. Check U1 pin 1, each small IC orientation, polarized parts and the antenna before heat. Use light placement force and the complete assembly drawing; twelve dense references are intentionally absent from board printing.
4. **Reflow once, cool, inspect.** Record the actual loaded cycle. Check QFN/USB bridges, displaced 0402 parts, unsoldered leads and damaged plastics. Do not flood U1's edges to try to solder its hidden centre. Repair identified defects locally; repeated full-board reheating needs a reviewed moisture/thermal plan.
5. **Iron-solder BZ1 and bottom U2.** Clean only with a method compatible with the fitted parts; keep liquid out of switch/buzzer openings. Support the board by its edges so top parts carry no clamp load. Inspect every Ra-02 castellation, including grounds. Keep the populated bottom off the heatbed thereafter. These two parts bring the initial fitted count to **80**, with R30/LED1 still absent.
6. **Perform unpowered checks, then current-limited USB first power.** Follow the frozen bring-up guide and the separate first-power worksheet. No battery, no R30, no LED1; check rails/shorts/polarity, hold reset for the first rail check, and stop on unexplained current or heat. A USB current display alone is not an adjustable current limiter. Attach the correct 433 MHz antenna before any LoRa transmission.

## Tools and facts still to confirm

| Needed for this step | Minimum useful capability / missing fact |
|---|---|
| Paste | Actual model/alloy, powder range, batch/expiry, storage/open time, and process instructions; keep refrigerated paste sealed while it reaches its specified working condition |
| Heatbed | Actual model, controllable temperature range, stable board support and cooling method |
| Temperature measurement | Fine contact thermocouple and suitable reader; a thermocouple-capable meter may suffice for a recorded trial |
| Placement/inspection | Fine tweezers, good lighting and magnification that clearly resolves 0.4 mm pitch; use existing equipment if adequate |
| Finishing | Temperature-controlled iron, suitable tip, compatible flux, wick, and an edge-support holder |
| First power | DMM plus a verified 5 V source with adjustable current limiting and current readout; borrow a lab supply if needed |
| Moisture handling | U1 packaging/HIC/open-time history; access to a compliant dry-out service if necessary |

Use ventilation for flux fumes and wash hands after leaded-paste handling; keep soldering away from food preparation. Do not prescribe a full equipment shopping list until the owner's existing tools are known.

For **basic screening**, magnified inspection, continuity/resistance checks, measured rails/current, boot/flashing and elementary radio/buzzer operation are useful. They cannot certify U1 exposed-pad voiding or transient limits. A scope is needed later for ADC/rail-transition and LED waveform acceptance; RF matching/range and charging/protection require the planned functional tests. X-ray can resolve hidden-joint uncertainty when diagnosing a suspect board or qualifying repeatable assembly, without making purchase of an X-ray system a first-prototype requirement.

**Open before heating:** paste/thermal trial and U1 dry handling. **Open before first power:** actual stock/polarity checks and a current-limited setup. No physical soldering, temperature, power or functional result has been represented as completed.
