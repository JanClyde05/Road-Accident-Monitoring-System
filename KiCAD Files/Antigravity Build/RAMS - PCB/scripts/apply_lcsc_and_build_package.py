"""apply_lcsc_and_build_package.py -- Assign verified LCSC part numbers directly to PCB footprints,
normalize values for clean JLCPCB BOM grouping, and regenerate the order package.
"""
import os
import csv
import re
import zipfile
import subprocess
import pcbnew

PROJECT_DIR = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB"
BOARD_PATH = os.path.join(PROJECT_DIR, "RAMS - PCB.kicad_pcb")
KICAD_CLI = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"
PACKAGE_DIR = os.path.join(PROJECT_DIR, "JLCPCB_ORDER_PACKAGE")
TRANSFORMS_PATH = r"C:\Users\Jan Clyde Talosig\Documents\KiCad\10.0\3rdparty\plugins\com_github_bennymeg_JLC-Plugin-for-KiCad\transformations.csv"

# Definitive, verified component mapping for all RAMS components
COMPONENT_DATA = {
    # Ref: (Normalized Value, LCSC Part #, ExcludeFromSMT)
    "ANT1": ("2450AT18D0100E", "", True),                   # Hand-solder / Mouser
    "BZ1":  ("SMD-9650-3327", "C42420997", False),
    "C1":   ("10uF", "C19702", False),
    "C2":   ("0.1uF", "C1525", False),
    "C3":   ("1uF", "C52923", False),
    "C4":   ("4.7uF", "C19666", False),
    "C5":   ("0.1uF", "C1525", False),
    "C6":   ("0.1uF", "C1525", False),
    "C7":   ("10uF", "C19702", False),
    "C8":   ("47uF", "C76636", False),                     # 47uF 10V 0805 MLCC
    "C9":   ("10uF", "C19702", False),
    "C10":  ("47uF", "C76636", False),                     # 47uF 10V 0805 MLCC
    "C11":  ("10uF", "C19702", False),
    "C12":  ("1uF", "C52923", False),
    "C13":  ("0.1uF", "C1525", False),
    "C14":  ("0.1uF", "C1525", False),
    "C15":  ("0.1uF", "C1525", False),
    "C16":  ("0.1uF", "C1525", False),
    "C17":  ("1uF", "C52923", False),
    "C18":  ("2.7pF", "C1561", False),
    "C19":  ("2.4pF", "C48346", False),                    # Fenghua 2.4pF 0402 (0402CG2R4C500NT)
    "C20":  ("0.1uF", "C1525", False),
    "C21":  ("10nF", "C1524", False),
    "C22":  ("1uF", "C52923", False),
    "C23":  ("1uF", "C52923", False),
    "C24":  ("12pF", "C1547", False),
    "C25":  ("12pF", "C1547", False),
    "C26":  ("10uF", "C19702", False),
    "C27":  ("0.1uF", "C1525", False),
    "C28":  ("0.1uF", "C1525", False),
    "C29":  ("0.1uF", "C1525", False),
    "D1":   ("USBLC6-2SC6", "C7519", False),
    "D2":   ("SS14W", "C2909920", False),                  # SOD-123FL Schottky 1A 40V
    "D3":   ("1N4148W", "C81598", False),
    "FB1":  ("FerriteBead", "C1017", False),
    "J1":   ("TYPE-C-31-M-12", "C165948", False),
    "J2":   ("SM02B-SRSS-TB", "C160402", False),
    "L1":   ("2nH", "C18216", False),                      # Murata LQG15HS2N0S02D RF inductor
    "L2":   ("2.4nH", "C22727", False),                    # Sunlord SDCL1005C2N4STDF RF inductor
    "LED1": ("SK6805-EC20", "C2890036", False),            # In-stock, Economic PCBA compatible
    "Q1":   ("AO3401A", "C15127", False),
    "Q2":   ("BC817-25", "C908259", False),                # SOT-23 NPN Transistor
    "Q3":   ("FS8205A", "C908265", False),                 # FS8205A SOT-23-6 Dual N-MOSFET (C908265 in stock: 16k+)
    "R1":   ("5.1k", "C25905", False),
    "R2":   ("5.1k", "C25905", False),
    "R3":   ("4.02k", "C43251", False),                    # Uni-Royal 4.02k 1% 0402 (0402WGF4021TCE)
    "R4":   ("330R", "C105875", False),
    "R5":   ("1k", "C11702", False),
    "R6":   ("100k", "C25741", False),
    "R7":   ("100k", "C25741", False),
    "R8":   ("10k", "C25744", False),
    "R9":   ("22R", "C114765", False),
    "R10":  ("0R", "C17168", False),
    "R11":  ("33R", "C138002", False),
    "R12":  ("1k", "C11702", False),
    "R13":  ("100k", "C25741", False),
    "R14":  ("330k", "C25778", False),
    "R15":  ("180k", "C138046", False),
    "SW1":  ("MSK12C02", "C431540", False),
    "SW2":  ("KMR2", "C318884", False),                    # Unified KMR2 tactile switch
    "SW3":  ("KMR2", "C318884", False),
    "U1":   ("ESP32-S3FH4R2", "C3013940", False),
    "U2":   ("Ai-Thinker-Ra-02", "", True),                # B.Cu Hand-solder / module
    "U3":   ("LTH7R", "C668215", False),                   # UMW TP4054 SOT-23-5 Li-Ion Charger
    "U4":   ("DW01A", "C42380662", False),                 # Slkor DW01A SOT-23-6 Batt Protection
    "U5":   ("AP2112K-3.3", "C51118", False),
    "Y1":   ("40MHz", "C426988", False),
}

def load_transformations():
    transforms = []
    if os.path.exists(TRANSFORMS_PATH):
        with open(TRANSFORMS_PATH, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader, None)
            for row in reader:
                if len(row) >= 2:
                    try:
                        transforms.append((re.compile(row[0]), float(row[1])))
                    except Exception:
                        pass
    return transforms

def apply_fields_to_board():
    print("Loading PCB:", BOARD_PATH)
    board = pcbnew.LoadBoard(BOARD_PATH)
    
    updated_count = 0
    for fp in board.GetFootprints():
        ref = fp.GetReference()
        if ref in COMPONENT_DATA:
            val, lcsc, dnp = COMPONENT_DATA[ref]
            fp.SetValue(val)
            if lcsc:
                fp.SetField("LCSC", lcsc)
            if dnp:
                # Mark as exclude from BOM in JLCPCB plugin convention or set field
                fp.SetField("LCSC", "DNP")
            updated_count += 1
            
    board.Save(BOARD_PATH)
    print(f"[OK] Updated {updated_count} footprints in {BOARD_PATH}")

def generate_clean_bom_and_cpl():
    board = pcbnew.LoadBoard(BOARD_PATH)
    transforms = load_transformations()
    
    # 1. Group BOM items
    bom_groups = {} # (value, footprint, lcsc) -> list of refs
    cpl_rows = []
    
    for fp in board.GetFootprints():
        ref = fp.GetReference()
        if ref not in COMPONENT_DATA:
            continue
            
        val, lcsc, dnp = COMPONENT_DATA[ref]
        fp_name = str(fp.GetFPID().GetLibItemName())
        layer_str = "Top" if fp.GetLayer() == pcbnew.F_Cu else "Bottom"
        
        # Don't place DNP items on top-side SMT assembly
        if not dnp:
            key = (val, fp_name, lcsc)
            if key not in bom_groups:
                bom_groups[key] = []
            bom_groups[key].append(ref)
            
            # CPL calculations
            pos = fp.GetPosition()
            x_mm = pcbnew.ToMM(pos.x)
            y_mm = -pcbnew.ToMM(pos.y) # KiCad Y down -> JLCPCB Y up
            
            rot_deg = fp.GetOrientationDegrees()
            # Apply JLC plugin angle offset (exclude SOT-23-6 from 180 deg flip)
            offset = 0.0
            if "SOT-23-6" in fp_name:
                offset = 0.0
            else:
                for regex, angle in transforms:
                    if regex.search(str(fp_name)):
                        offset = angle
                        break
            rot_deg = (rot_deg + offset) % 360.0
            
            cpl_rows.append({
                "Designator": ref,
                "Val": val,
                "Package": fp_name,
                "Mid X": f"{x_mm:.3f}",
                "Mid Y": f"{y_mm:.3f}",
                "Rotation": f"{rot_deg:.1f}",
                "Layer": layer_str
            })
            
    # Write BOM
    os.makedirs(PACKAGE_DIR, exist_ok=True)
    bom_path = os.path.join(PACKAGE_DIR, "2_BOM_RAMS_PCB.csv")
    with open(bom_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Comment", "Designator", "Footprint", "LCSC Part #"])
        
        # Sort groups nicely
        sorted_keys = sorted(bom_groups.keys(), key=lambda k: (k[1], k[0]))
        for val, fp_name, lcsc in sorted_keys:
            refs = sorted(bom_groups[(val, fp_name, lcsc)], key=lambda r: (r[0], int(r[1:]) if r[1:].isdigit() else 999))
            writer.writerow([val, ",".join(refs), fp_name, lcsc])
            
    print(f"[OK] Generated clean BOM: {bom_path} ({len(bom_groups)} grouped rows)")
    
    # Write CPL
    cpl_path = os.path.join(PACKAGE_DIR, "3_CPL_RAMS_PCB.csv")
    with open(cpl_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Designator", "Val", "Package", "Mid X", "Mid Y", "Rotation", "Layer"])
        cpl_rows.sort(key=lambda r: (r["Designator"][0], int(r["Designator"][1:]) if r["Designator"][1:].isdigit() else 999))
        for row in cpl_rows:
            writer.writerow([row["Designator"], row["Val"], row["Package"], row["Mid X"], row["Mid Y"], row["Rotation"], row["Layer"]])
            
    print(f"[OK] Generated clean CPL: {cpl_path} ({len(cpl_rows)} placed components)")

if __name__ == "__main__":
    apply_fields_to_board()
    generate_clean_bom_and_cpl()
