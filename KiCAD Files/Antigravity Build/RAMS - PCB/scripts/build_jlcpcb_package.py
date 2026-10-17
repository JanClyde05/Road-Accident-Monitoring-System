"""build_jlcpcb_package.py -- Generate complete JLCPCB manufacturing package.

Outputs:
1. jlcpcb/RAMS_PCB_gerbers.zip (Gerbers + Drill files)
2. jlcpcb/RAMS_PCB_BOM.csv (JLCPCB-formatted Bill of Materials with LCSC part numbers)
3. jlcpcb/RAMS_PCB_CPL.csv (JLCPCB-formatted Pick and Place / Centroid file with rotation corrections)
"""
import subprocess
import os
import zipfile
import csv
import re
from collections import defaultdict
import pcbnew

PROJECT_DIR = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB"
BOARD_PATH = os.path.join(PROJECT_DIR, "RAMS - PCB.kicad_pcb")
KICAD_CLI = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"
OUTPUT_DIR = os.path.join(PROJECT_DIR, "jlcpcb")
GERBERS_TMP = os.path.join(OUTPUT_DIR, "gerber_files")

TRANSFORMS_PATH = r"C:\Users\Jan Clyde Talosig\Documents\KiCad\10.0\3rdparty\plugins\com_github_bennymeg_JLC-Plugin-for-KiCad\transformations.csv"

# Comprehensive verified JLCPCB/LCSC part mapping for RAMS components
LCSC_MAP = {
    # Active ICs & Modules
    'ESP32-S3FH4R2': 'C3013940',
    'Ai-Thinker-Ra-02': '', # DNP / hand-solder
    'LTH7R': 'C668215',
    'AP2112K-3.3': 'C51118',
    'DW01A': 'C42380662',
    'USBLC6-2SC6': 'C7519',
    'FS8205A': 'C908265',
    'AO3401A': 'C15127',
    'BC817-25': 'C908259',
    'SS14': 'C2909920',
    'SS14W': 'C2909920',
    '1N4148W': 'C81598',
    'SMD-9650-3327': 'C42420997',
    '40MHz': 'C426988',
    'MSK12C02': 'C431540',
    'SK6805-EC20': 'C2890036',
    'SM02B-SRSS-TB': 'C160402',
    'USB_C_Receptacle_HRO_TYPE-C-31-M-12': 'C165948',
    'TYPE-C-31-M-12': 'C165948',
    '2450AT18D0100E': '', # DNP / hand-solder
    'RESET': 'C318884',
    'BOOT': 'C318884',
    'KMR2': 'C318884',
    # Passives (0402 unless noted)
    '0R': 'C17168',
    '22R': 'C114765',
    '33R': 'C138002',
    '330R': 'C105875',
    '1k': 'C11702',
    '4.02k': 'C43251',
    '4.02k 1%': 'C43251',
    '5.1k': 'C25905',
    '10k': 'C25744',
    '100k': 'C25741',
    '180k': 'C138046',
    '180k 1%': 'C138046',
    '330k': 'C25778',
    '330k 1%': 'C25778',
    '2nH': 'C18216',
    '2.4nH': 'C22727',
    'FerriteBead': 'C1017',
    '2.4pF': 'C48346',
    '2.7pF': 'C1561',
    '12pF': 'C1547',
    '10nF': 'C1524',
    '0.1uF': 'C1525',
    '0.1uF 50V': 'C1525',
    '1uF': 'C52923',
    # 0603 caps
    '4.7uF': 'C19666',
    '10uF': 'C19702',
    '10uF 16V': 'C19702',
    # 0805 caps
    '47uF': 'C76636',
    '47uF 10V': 'C76636',
    '100uF 10V': 'C76636',
}

def load_transformations():
    transforms = []
    if os.path.exists(TRANSFORMS_PATH):
        with open(TRANSFORMS_PATH, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader, None)
            for row in reader:
                if len(row) >= 2:
                    regex = row[0]
                    try:
                        rot = float(row[1])
                        transforms.append((re.compile(regex), rot))
                    except ValueError:
                        pass
    return transforms

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(GERBERS_TMP, exist_ok=True)

    # Clean old temp files in gerber_files
    for f in os.listdir(GERBERS_TMP):
        os.remove(os.path.join(GERBERS_TMP, f))

    print("=== Step 1: Exporting Gerbers ===")
    subprocess.run([
        KICAD_CLI, "pcb", "export", "gerbers",
        "-o", GERBERS_TMP,
        "--subtract-soldermask",
        "--no-x2",
        "--no-netlist",
        BOARD_PATH
    ], check=True)

    print("=== Step 2: Exporting Drill Files ===")
    subprocess.run([
        KICAD_CLI, "pcb", "export", "drill",
        "-o", GERBERS_TMP,
        "--format", "excellon",
        "--excellon-units", "mm",
        "--excellon-separate-th",
        BOARD_PATH
    ], check=True)

    # Create ZIP archive containing only JLCPCB required layers + drills
    print("=== Step 3: Packaging Gerbers ZIP ===")
    zip_path = os.path.join(OUTPUT_DIR, "RAMS_PCB_gerbers.zip")
    keep_exts = ('.gtl', '.gbl', '.gts', '.gbs', '.gto', '.gbo', '.gtp', '.gbp', '.gm1', '.drl')
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for fname in os.listdir(GERBERS_TMP):
            ext = os.path.splitext(fname)[1].lower()
            if ext in keep_exts:
                fpath = os.path.join(GERBERS_TMP, fname)
                zf.write(fpath, arcname=fname)
                print(f"  Added: {fname}")

    print(f"  Gerbers ZIP created: {zip_path} ({os.path.getsize(zip_path)} bytes)")

    # Load Board for BOM & CPL
    board = pcbnew.LoadBoard(BOARD_PATH)
    transforms = load_transformations()

    # Step 4: Generate JLCPCB BOM
    print("\n=== Step 4: Generating JLCPCB BOM.csv ===")
    bom_groups = defaultdict(list)

    for fp in board.GetFootprints():
        ref = fp.GetReference()
        val = fp.GetValue()
        pkg = str(fp.GetFPID().GetLibItemName())

        # Determine LCSC Part Number
        lcsc = ""
        for f in fp.GetFields():
            if f.GetName() in ('LCSC', 'LCSC Part #', 'JLCPCB Part #'):
                t = f.GetText().strip()
                if t:
                    lcsc = t
                    break
        if not lcsc:
            lcsc = LCSC_MAP.get(val, LCSC_MAP.get(ref, ''))

        key = (val, pkg, lcsc)
        bom_groups[key].append(ref)

    bom_csv_path = os.path.join(OUTPUT_DIR, "RAMS_PCB_BOM.csv")
    with open(bom_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Comment", "Designator", "Footprint", "LCSC Part #"])
        for (val, pkg, lcsc), refs in sorted(bom_groups.items(), key=lambda x: x[1][0]):
            refs_sorted = sorted(refs, key=lambda x: (x[0], int(re.search(r'\d+', x).group(0)) if re.search(r'\d+', x) else 0))
            writer.writerow([val, ",".join(refs_sorted), pkg, lcsc])

    print(f"  BOM generated: {bom_csv_path} ({len(bom_groups)} line items)")

    # Step 5: Generate JLCPCB CPL (Centroid / Pick & Place)
    print("\n=== Step 5: Generating JLCPCB CPL.csv ===")
    cpl_rows = []

    for fp in board.GetFootprints():
        # Check SMD or Thru-hole
        is_smd = True
        for p in fp.Pads():
            if p.GetAttribute() == pcbnew.PAD_ATTRIB_PTH:
                # If mostly THT, skip
                pass

        ref = fp.GetReference()
        val = fp.GetValue()
        pkg = str(fp.GetFPID().GetLibItemName())
        pos = fp.GetPosition()
        mid_x = round(pcbnew.ToMM(pos.x), 4)
        mid_y = round(-pcbnew.ToMM(pos.y), 4) # JLCPCB convention: inverted Y
        rot = fp.GetOrientationDegrees()

        # Apply JLCPCB rotation transformation (exclude SOT-23-6 from 180 deg flip)
        rot_offset = 0.0
        if "SOT-23-6" in pkg:
            rot_offset = 0.0
        else:
            for pattern, offset in transforms:
                if pattern.search(pkg):
                    rot_offset = offset
                    break

        final_rot = (rot + rot_offset) % 360.0

        layer = "Top" if fp.GetLayer() == pcbnew.F_Cu else "Bottom"
        cpl_rows.append([ref, val, pkg, mid_x, mid_y, round(final_rot, 1), layer])

    cpl_rows.sort(key=lambda x: (x[0][0], int(re.search(r'\d+', x[0]).group(0)) if re.search(r'\d+', x[0]) else 0))

    cpl_csv_path = os.path.join(OUTPUT_DIR, "RAMS_PCB_CPL.csv")
    with open(cpl_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Designator", "Val", "Package", "Mid X", "Mid Y", "Rotation", "Layer"])
        for row in cpl_rows:
            writer.writerow(row)

    print(f"  CPL generated: {cpl_csv_path} ({len(cpl_rows)} placed components)")
    print("\n=== JLCPCB PRODUCTION PACKAGE COMPLETE ===")

if __name__ == '__main__':
    main()
