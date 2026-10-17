# JLCPCB Order Package -- RAMS PCB

## Package Contents

| # | File | Description | JLCPCB Upload Target |
|---|------|-------------|---------------------|
| 1 | `1_GERBERS_RAMS_PCB.zip` | RS-274X Gerber layers + Excellon drill files | **jlcpcb.com > "Add Gerber File"** (drag & drop) |
| 2 | `2_BOM_RAMS_PCB.csv` | Clean, grouped Bill of Materials with 100% verified LCSC Part #s | **SMT Assembly > "Add BOM File"** |
| 3 | `3_CPL_RAMS_PCB.csv` | Pick & Place centroids with JLCPCB rotation offsets applied | **SMT Assembly > "Add CPL File"** |

---

## Step-by-Step Ordering Instructions

1. Go to **https://cart.jlcpcb.com/quote**
2. **Drag & drop** `1_GERBERS_RAMS_PCB.zip` into the quote box.
3. JLCPCB will auto-detect the board dimensions (**42.0 mm x 32.0 mm**), **2 Layers**.
4. Set PCB specifications:
   - **Base Material**: FR-4
   - **Layers**: 2
   - **Dimensions**: 42.0 x 32.0 mm
   - **PCB Thickness**: 1.6 mm
   - **Surface Finish**: HASL (standard) or LeadFree HASL
   - **Copper Weight**: 1 oz
   - **Silkscreen / Solder Mask**: Green / White (or your preferred color)
5. Under **SMT Assembly**, toggle **ON**:
   - **Assemble Side**: **Top Side** (All SMT parts are located on Top F.Cu)
   - **Tooling Holes**: Added by JLCPCB
   - **Quantity**: Select how many assembled boards you want (e.g., 5 pcs)
6. Click **Next** to proceed to the SMT Parts Upload:
   - Upload `2_BOM_RAMS_PCB.csv` as your BOM.
   - Upload `3_CPL_RAMS_PCB.csv` as your CPL (Pick and Place).
7. Review Part Matching:
   - All grouped lines will match automatically because exact LCSC part numbers are pre-filled.
   - **LED1** (SK6805-EC20, `C2890036`) is now included in Economic PCBA assembly.
   - Notice: **ANT1** (Johanson 2450AT18D0100E) and **U2** (Ai-Thinker-Ra-02 on Bottom) are intentionally excluded from Top SMT assembly because they are hand-soldered post-assembly.
8. Verify the 3D / 2D placement preview to confirm component orientations match silkscreen.
9. Save to Cart and checkout.

---

## Component Sourcing Notes

- **Basic vs. Extended Parts**: Many common passives (100nF, 10uF, 1uF, 1k, 10k, 100k, 0R, 5.1k, AO3401A, KMR2 switches) are standard **Basic** parts on JLCPCB (no feeder setup fee).
- **RF Matching**: L1 (2nH Murata `C18216`), L2 (2.4nH Sunlord `C22727`), C18 (2.7pF `C1561`), C19 (2.4pF Fenghua `C48346`) are verified high-frequency RF components.
- **Bulk Capacitors**: C8 and C10 use TDK 47µF 10V 0805 MLCC (`C76636`) for robust LoRa transmit sag buffering.
- **Battery Protection**: U4 uses DW01A (`C42380662`) and Q3 uses dual N-FET FS8205A SOT-23-6 (`C908265`).
- **Full Parts List**: See [`PARTS_LIST_FOR_ORDERING.md`](PARTS_LIST_FOR_ORDERING.md) for complete BOM with quantities and sourcing notes.
