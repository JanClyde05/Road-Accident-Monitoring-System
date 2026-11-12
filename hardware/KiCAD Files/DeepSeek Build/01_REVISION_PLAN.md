# Comprehensive revision plan

## 1. Objective and boundaries

Deliver a functioning, reviewable RAMS wearable design with a readable schematic, a PCB that fits the chosen manufacturing process, and an explicit reconciliation to owned parts. Favor reuse and low additional expense, but preserve power integrity, RF performance, protection behavior, firmware contracts, and assembly access. The present deliverable is instructions only; no CAD or firmware changes are made by this plan.

The historic 42 × 32 mm outline and the later GEMINI 48 × 38 mm outline are candidates, not newly confirmed owner requirements. Minimize dimensions only after physical part geometry, antenna clearance, enclosure access, and the manufacturing rules are proven feasible. Do not promise the old outline before placement analysis.

Keep the ordered Rev A ZIP immutable. A new design cannot correct copper already manufactured. Any later salvage assessment must be a separate measured rework plan, with a component-specific assembly sequence and current-limited bring-up.

## 2. Resolve the architecture conflict first

The owned bare ESP32-S3FH4R2 requires fine-pitch escape routing and a correct exposed-pad footprint. EPDC's supplied minimum pattern width and spacing are substantially coarser. Hand soldering does not solve a copper geometry limitation. Increasing the board outline also does not increase the spacing between adjacent IC pads. See chapter 03 for the numeric feasibility check.

Evaluate these alternatives with actual package and supplier evidence:

| Route | Reuse | New requirements / tradeoffs | Decision condition |
|---|---|---|---|
| A. Fine-pitch main PCB using owned bare MCU | Reuses MCU, crystal, chip antenna and relevant support parts | Fabricator with verified fine-pitch rules, suitable via process, reflow/stencil capability, and RF stackup; may differ from supplied DOST process | Choose only if owner accepts another capable process or EPDC gives written geometry-specific capability beyond the supplied Annex |
| B. DOST carrier plus a fine-pitch daughterboard using owned MCU | Reuses MCU and chip antenna on a separately fabricated radio/MCU subassembly | Additional PCB/interconnect, reflow, mechanical height, power/ground interfaces, and RF verification; daughterboard still needs a capable supplier | Viable when DOST carrier is desired and reuse justifies the extra assembly and cost |
| C. DOST carrier plus purchased ESP32-S3 module | Reuses suitable power, LoRa, indicator, switch and passive parts | Module purchase and verified memory/GPIO variant; bare MCU, external crystal and chip antenna generally remain unused | Viable only after exact module geometry, exposed pad, keepout, pin availability and EPDC feasibility are checked |

There is no honest unconditional solution combining strict use of every purchased part, the original small outline, and the default supplied EPDC process. Preserve unused parts as inventory, not “missing” items or hidden substitutions. Estimate the total extra cost of PCB, assembly, interconnects, stencil and rework; do not compare only the module purchase price.

For route C, distinguish WROOM-1 integrated antenna from WROOM-1U external antenna connector and each memory suffix. Never retain the bare-chip RF/crystal/power network on arbitrary module pins. Never connect a second chip antenna to a module without an explicit manufacturer-supported RF interface. A module's castellated terminals are existing component terminals; that does not itself require castellated edges on the carrier PCB.

## 3. Dependency-ordered work packages

### P0: Freeze inputs and scope

1. Read the root instructions, directory map, current wearable `config.h`, `battery.h`, and protocol. Read chapter 07's conflict ledger before trusting any prior plan.
2. Record absolute paths and SHA-256 for CAD, local libraries, circuit definitions, generators, inventory, firmware contracts, and vendor sources. Identify other active generation processes; coordinate through the owner before touching their outputs.
3. Create `implementation/` under this handoff folder or another explicitly designated new working folder. Keep local project libraries and deterministic scripts there. Do not overwrite Rev A/B/C or GEMINI Build.
4. Record requirements: phone-assisted wearable; radio bands and intended peripherals; battery and runtime target; assembled quantity; connector access; minimum acceptable indication; assembly method. An unresolved requirement must be tagged, not guessed.

**Exit:** source identity and owner requirements recorded; no incompatible architecture silently inherited.

### P1: Audit the physical inventory

1. Use chapter 02 as the worksheet. Count received usable units, not order quantities or assumed pack contents. Separate prototype allocation, receiver allocation, spares and damaged parts.
2. Record markings, seller listing, exact package, dimensions, polarity, pin-1 indicator, and electrical datasheet. A photo is useful but does not prove a silicon variant.
3. Print candidate critical footprints at 1:1 scale and compare actual components. Measure USB shell tabs/pegs, mating face location, tactile terminal continuity, slide-switch common terminal, buzzer pads and height, JST orientation, LED pin orientation, and diode body.
4. For anonymous RF parts/crystal/capacitors, identify electrical properties needed for the role. Replace only where missing evidence prevents a reliable design; list each replacement condition and retain unused stock.

**Exit:** no critical land pattern or polarity is based on a generic seller title. Remaining unknowns explicitly stop the dependent component placement.

### P2: Close fabrication and architecture feasibility

1. Calculate adjacent-pad gaps, track escape room, annular rings, shell hole fit and soldermask assumptions using the exact footprints. Include MCU/module, USB-C, ESD, passives and any sensor, not just tracks.
2. Apply the actual Annex drill set and slot requirements. “Round to a supported drill” is a redesign requiring pin fit and annular-ring checks, not an export trick.
3. Resolve routes A/B/C. Prepare the supplier-question package in chapter 03 without sending it. If a written exception is needed, label the design conditional until obtained.
4. For a carrier/daughterboard split, define power/ground, USB, boot, reset, radio SPI and test interfaces. Keep the MCU crystal and 2.4 GHz RF network together on the radio subassembly; minimize RF transitions.
5. Decide LED supply and logic solution from the confirmed WS2812B limits. Resolve the battery and regulator current/thermal budgets concurrently.

**Exit:** feasible footprint/routing rules and architecture; no outstanding critical electrical incompatibility hidden by a DRC exclusion.

### P3: Capture one electrical source of truth

1. Define an intended pin/net table from primary sources and system requirements. Include every power pin, ground/exposed pad, unused pin, and connector contact.
2. Use a named single-cell power tree with separate raw cell negative `B_MINUS` and protected system ground `GND`. Include charger, power-path behavior, load switch/enable, LED supply and battery measurement.
3. Establish equations and worst-case input conditions for charger current, voltage divider, regulator dissipation, LED level margins, current budget and RF/crystal selection. Typical values alone do not establish a guaranteed margin.
4. Use one canonical circuit definition only if a generator is needed. A check that compares the generator's output to the same incorrect definition is consistency evidence, not independent circuit validation.
5. Update the BOM with actual owned variant, proposed selected MPN, footprint, quantity, source, population/DNP state and evidence status. Retain reference designators where useful but do not identify functions by reference alone.

**Exit:** independent electrical review of the pin/net table, power scenarios and firmware map; architecture-specific unused blocks removed.

### P4: Draw a readable schematic

Prefer several A4/A3 functional sheets over a giant cramped page: (1) USB/input/charging and battery protection, (2) regulated power and monitoring, (3) MCU/boot/clock/RF or module, (4) LoRa, indicator, buzzer and user controls. A compact single page is acceptable only if clearly readable at normal print size.

- Power generally flows left to right, supplies above circuits, returns below. Keep protection current paths visible rather than hiding the topology behind many global labels.
- Show pin numbers, component values, polarities and connector pin-1. Use net labels consistently and explicit no-connect markers only for truly unused terminals.
- Keep critical decouplers with the relevant supply pins in the drawing, even if repeated power pins need a separate unit. Separate the 2.4 GHz antenna from the 433 MHz LoRa antenna clearly.
- Show test points and optional/DNP parts explicitly. Add brief notes for conditional assemblies, protected-ground boundary, cell polarity and firmware-dependent signals.
- Avoid text/wire overlap, wire-through-symbol ambiguity, accidental junctions, labels sitting on unrelated pins, and reference/value text hidden beneath blocks.
- Render every sheet to PDF/SVG and inspect at intended print size. Compare the exported netlist with the independently reviewed pin/net contract, then run ERC with recorded rule settings.

**Exit:** readable sheets, correct symbol-pad mappings, no unresolved electrical errors, and reviewed no-connect/power-flag decisions.

### P5: Layout for the actual process

1. Freeze board outline, real stackup, mounting/enclosure interface, layers, edge clearance, holes, and fabrication rules before routing. Netclass names are not physical constraints unless assigned and checked.
2. Place connectors, switches and antennas first; then MCU/module, crystal/RF, power path, decouplers, LoRa and supporting parts. Establish assembly/probe access and component height on both sides.
3. Protect the antenna's complete no-metal region on every relevant layer. Consider the other-side module, ground pours, tracks, mounting hardware, battery, wires, enclosure and the wearer's body. “No pour” alone is not a complete keepout.
4. Route critical paths manually under their constraints before optional autorouting: charger/protection current paths, main power/ground, clock, RF, USB and local bypass loops. Use real stackup inputs for RF/USB geometry; a net named `RF_50R` is not a calculation.
5. Plan a continuous return beneath the chip, crystal and RF. On a two-layer design, a bottom-mounted LoRa module and signal cuts require deliberate review. Enlarge the outline or move parts rather than sacrificing the return path to keep the old size.
6. Add deliberate ground connections. Verify connectivity after zone refill using exact copper objects and actual layer transitions. A pad labelled GND, a grid of vias, or a 3D view does not prove a continuous ground.
7. Recheck thermal-via and paste design against the exact package and EPDC process. Open large holes in exposed pads can wick solder; nominal annular-ring compliance does not establish reflow yield or RF ground quality.

**Exit:** complete routing and final-source validation in chapter 06; no hidden geometric exceptions.

### P6: Reconcile firmware and documentation

Keep LoRa SPI/GPIO, user button, buzzer and LED mappings consistent with current firmware. Resolve battery-divider scaling and ADC calibration. A PCB pin label is a physical package pad number; a firmware GPIO is a different identifier. If a module variant reserves GPIOs for memory, choose valid alternatives and change all consumers deliberately.

Do not modify packet structure, timing, calibration or phone-assisted sensing merely because the PCB changes. Compile the intended firmware variant when hardware-dependent constants change. Document boot recovery and expected LED/buzzer behavior; do not rely on an RGB LED for the only bring-up diagnostic.

**Exit:** hardware-to-firmware contract and targeted build evidence; no unrequested application redesign.

### P7: Review, manufacture, then test as separate gates

Prepare the review bundle from chapter 06. Review the exact Gerber/drill outputs against the native source only after design closure. Supplier DFM acceptance, ordering authority and assembled hardware testing are separate milestones. Fabricate an initial prototype quantity agreed by the owner; validate power and protection before populating all available parts. Record real results, not predictions, before recommending another production run.

## 4. Required implementation deliverables

- Native KiCad project, schematic, board, local symbol/footprint tables and libraries; the exact EDA version.
- BOM and owned/allocated/missing reconciliation; critical package drawings; assembled variant and DNP list.
- Circuit pin/net contract, power/thermal calculations, firmware mapping and selected fabrication rule set.
- Readable schematic PDF; top/bottom/copper/mask/assembly previews; mechanical and keepout drawings.
- Raw ERC/DRC/parity and independent geometry/connectivity reports, with settings, exclusions, timestamps and input hashes.
- Reproducible local commands/scripts with guarded output paths and a documented generation order.
- Decision ledger, retained failures and corrections, remaining unknowns, and measured bring-up plan.
- Manufacturing exports only after the review gates permit them, clearly separated from engineering drafts.
