# RAMS Rev C -- engineering work in progress

This directory contains the planning, specification, and initial KiCad project for RAMS Wearable PCB Revision C. **Do not fabricate from this directory yet -- manual schematic wiring and DRC verification are still needed.**

## Status: Phase 2 complete (KiCad project generated)

### Completed
- [x] Phase 1: Circuit Definition
  - Identified all 5 critical defects from Rev A
  - DOST-ASTI EPDC manufacturing constraints extracted
  - 68 components cataloged with verified datasheet pinouts
  - FS8205A SOT-23-6 pinout verified (S1=1, D1=2, S2=3, G2=4, D2=5, G1=6)
  - DW01A, LTH7R, 2450AT18B100E pinouts verified
  - WROOM-1 module internal VDDA confirmed (no external connection needed)
  - Firmware GPIO cross-check passed (12/12 GPIOs match config.h)
  - Self-check script: zero errors
- [x] Phase 2: KiCad Project Creation
  - Project file with EPDC design rules (0.30mm track, 0.254mm space, 0.40mm drill)
  - Structural schematic generated (68 components in 10 functional blocks)
  - PCB board generated (42x32mm, rounded corners, ground zones, antenna keepout)
  - Custom antenna footprint for 2450AT18B100E (3216 2-terminal)
  - Ground stitching via grid on both layers
  - Net classes: Default, Power (0.50mm), RF_50R, USB

### Next: Phase 3 (Manual KiCad work)
- [ ] Open schematic in KiCad, resolve library symbols
- [ ] Wire component pins according to circuit_spec.json net assignments
- [ ] Run ERC, fix errors
- [ ] Import netlist to PCB
- [ ] Place footprints in functional zones
- [ ] Route critical paths (power, USB, RF) manually
- [ ] Route remaining signals with interactive router
- [ ] Run DRC, verify EPDC compliance
- [ ] Generate Gerber + drill files for EPDC

### User decisions recorded
- **WS2812B:** 5050 SMD (standard package)
- **Board size:** Minimize, targeting 42x32mm
- **USB-C:** TYPE-C-31-M-12, shell slots converted to 1.0mm round holes for EPDC
- **Solder mask:** Black board, white silkscreen
- **EPDC castellation:** Open -- user needs to confirm with EPDC

### Key corrections from Rev A
- Q3: SOT-23-6 correct pinout (was TSSOP-8 with wrong wiring)
- ANT1: 2450AT18B100E = 2-terminal feed+NC (correct 3216 footprint)
- LED1: GPIO48 (was GPIO46)
- MCU: WROOM-1 module (was bare QFN-56 incompatible with EPDC)
- All design rules comply with DOST-ASTI EPDC limits
- Ground continuity enforced with stitching via grid

## Files

| File | Purpose |
|---|---|
| [00_REVISION_PLAN.md](00_REVISION_PLAN.md) | Complete revision plan with defects, constraints, verification gates |
| [DECISIONS.md](DECISIONS.md) | User-confirmed design decisions |
| [circuit_spec.json](circuit_spec.json) | Component definitions, pin mappings, net assignments (68 components) |
| [EPDC_DESIGN_RULES.md](EPDC_DESIGN_RULES.md) | KiCad design rules for DOST-ASTI EPDC compliance |
| [RESEARCH_LEDGER.md](RESEARCH_LEDGER.md) | Datasheet source references |
| [ERROR_LOG.md](ERROR_LOG.md) | Documented Rev A mistakes with corrective actions |
| [RAMS - PCB.kicad_pro](RAMS%20-%20PCB.kicad_pro) | KiCad project with EPDC rules and net classes |
| [RAMS - PCB.kicad_sch](RAMS%20-%20PCB.kicad_sch) | Structural schematic (needs manual wiring in KiCad) |
| [RAMS - PCB.kicad_pcb](RAMS%20-%20PCB.kicad_pcb) | PCB board outline, zones, keepouts, stitching vias |
| [RAMS_Local.pretty/](RAMS_Local.pretty/) | Custom footprint library (2450AT18B100E antenna) |
| [build_schematic.py](build_schematic.py) | Schematic generator from circuit_spec.json |
| [build_board.py](build_board.py) | PCB board generator |
| [verify_circuit_spec.py](verify_circuit_spec.py) | Automated circuit spec self-check |
