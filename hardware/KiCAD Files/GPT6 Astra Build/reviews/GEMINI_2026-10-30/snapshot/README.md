# RAMS Wearable PCB -- DOST-ASTI EPDC 2-Layer Build (GEMINI Build)

**Dedicated Working Directory:**  
`hardware/KiCAD Files/Antigravity Build/RAMS Wearable - PCB/GEMINI Build/`

This project is the complete, source-traceable recreation of the RAMS Wearable PCB, strictly engineered to satisfy the manufacturing capabilities of the **DOST-ASTI Electronics Product Development Center (EPDC)** using parts purchased from Shopee.

---

## 1. Project Identity & Status

| Attribute | Specification | Status |
|---|---|---|
| **Target Fabricator** | DOST-ASTI EPDC (Bicutan, Taguig) | Verified against EPDC Design Rules |
| **Layer Count** | 2-Layer (FR4, 1.6 mm, 1 oz Cu) | Enforced |
| **Board Dimensions** | 48.0 mm x 38.0 mm (1.5 mm corner fillets) | Mathematically verified 0 collisions |
| **Total Components** | 68 footprints (SMD + Module + Connectors) | 100% cataloged and placed |
| **Total Nets** | 38 nets | 100% matched to [circuit_spec.json](circuit_spec.json) |
| **KiCad Project** | [RAMS_RevC.kicad_pro](RAMS_RevC.kicad_pro) | Compatible with KiCad 10 |

---

## 2. Directory Structure

```
hardware/KiCAD Files/Antigravity Build/RAMS Wearable - PCB/GEMINI Build/
├── RAMS_RevC.kicad_pro        # Primary KiCad 10 Project File
├── RAMS_RevC.kicad_sch        # Recreated Schematic (68 components, 10 functional blocks)
├── RAMS_RevC.kicad_pcb        # Placement-Verified PCB (0 courtyard overlaps)
├── RAMS_RevC.kicad_prl        # KiCad Project Local settings
├── fp-lib-table               # Footprint Library Table pointing to RAMS_Local.pretty
├── circuit_spec.json          # Master circuit definition & net map (Single Source of Truth)
├── EPDC_DESIGN_RULES.md       # Extracted DOST EPDC fabrication limits
├── BOM_CROSS_REFERENCE.md     # Purchased Shopee parts vs footprint cross-reference
├── DECISIONS.md               # Architectural & engineering decisions log
├── ERROR_LOG.md               # Root cause analysis & fixes from Rev A defects
├── RESEARCH_LEDGER.md         # Component datasheet and pinout citations
├── preliminary_rev_a_imports/ # Archived unplaced initial templates
├── RAMS_Local.pretty/         # Custom DOST-ASTI EPDC compliant footprints
│   ├── ESP32-S3-WROOM-1_EPDC.kicad_mod   # 0.40mm drill thermal vias, clean courtyard
│   ├── USB_C_16P_USB4105_EPDC.kicad_mod  # 1.0mm round PTH shield holes (no small slots)
│   ├── Buzzer_SMD_9650.kicad_mod         # 9.6x5.0mm active buzzer footprint
│   ├── Johanson_2450AT18B100_3216.kicad_mod # 2-terminal 3216 chip antenna
│   └── SW_Tactile_SPST_3x4mm.kicad_mod   # Reset / Boot side-actuated pushbuttons
├── build/                     # Automated Python pipelines (pcbnew API)
│   ├── 01_build_schematic.py  # Generates schematic S-expressions from circuit_spec.json
│   ├── 02_build_pcb.py        # Generates board, zones, keepouts, and safe stitching vias
│   ├── clean_placement.json   # Exact collision-free coordinates for all 68 parts
│   └── logs/                  # Build, DRC, and execution timestamps
└── output/                    # Mirrored generation artifact outputs
```

---

## 3. DOST-ASTI EPDC Manufacturing Compliance

| Rule Category | DOST-ASTI EPDC Requirement | RAMS Rev C Value | Status |
|---|---|---|---|
| Minimum Track Width | $\ge 0.30\text{ mm}$ (12 mil) | $0.30\text{ mm}$ (Signal), $0.50\text{ mm}$ (Power) | Compliant |
| Minimum Track-to-Track Space | $\ge 0.254\text{ mm}$ (10 mil) | $0.254\text{ mm}$ | Compliant |
| Minimum Via Drill Hole | $\ge 0.40\text{ mm}$ (15.7 mil) | $0.40\text{ mm}$ | Compliant |
| Minimum Via Pad Diameter | $\ge 0.95\text{ mm}$ (37.4 mil) | $0.95\text{ mm}$ (Annular ring $\ge 0.275\text{ mm}$) | Compliant |
| Minimum Copper-to-Edge Clearance | $\ge 0.30\text{ mm}$ (12 mil) | $\ge 0.50\text{ mm}$ | Compliant |
| Slotted Holes $< 1.0\text{ mm}$ | Strictly prohibited | Eliminated (USB-C shield converted to $1.0\text{ mm}$ round) | Compliant |
| Thermal Vias in QFN/Module Pads | $\ge 0.40\text{ mm}$ drill | Custom `ESP32-S3-WROOM-1_EPDC` with $4\times 0.40\text{ mm}$ | Compliant |

---

## 4. Key Engineering Corrections from Rev A

1. **MCU Module Transition**: Rev A specified bare QFN-56 `ESP32-S3FH4R2`. EPDC cannot fabricate polyimide stencils for $0.40\text{ mm}$ pitch QFN without automated pick-and-place. Rev C upgraded to `ESP32-S3-WROOM-1` castellated module.
2. **Dual Battery Protection MOSFET**: Fixed reversed/incorrect pinout on `Q3` (FS8205A) from TSSOP-8 to SOT-23-6 ($S_1=1, D_1=2, S_2=3, G_2=4, D_2=5, G_1=6$).
3. **WS2812B GPIO Assignment**: Corrected data line from GPIO46 to GPIO48 to match firmware configuration.
4. **Active Buzzer Subsystem**: Corrected SMD buzzer footprint to `Buzzer_SMD_9650` with driving NPN transistor `Q1` and flyback diode `D2`.
5. **BLE Antenna**: Mapped `ANT1` to 2-terminal feed+NC `Johanson_2450AT18B100_3216` with RF keepout on both copper layers.
6. **Smart Ground Stitching**: Replaced blind grid with pad-aware obstacle-avoidance algorithm (79 safe vias placed).

---

## 5. How to Open & Inspect in KiCad 10

1. Launch KiCad 10.
2. Open Project:
   - Select `hardware/KiCAD Files/Antigravity Build/RAMS Wearable - PCB/GEMINI Build/RAMS_RevC.kicad_pro`
3. Double click **Schematic Editor** (`RAMS_RevC.kicad_sch`) to view the 10 functional blocks.
4. Double click **PCB Editor** (`RAMS_RevC.kicad_pcb`) to inspect the placement, board outline, zones, and stitching vias.
