import pcbnew
import subprocess
import os

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

def optimize():
    board = pcbnew.LoadBoard(BOARD_PATH)

    layout = {
        # RF Zone (Top-Left)
        "ANT1": (103.50, 102.50, 180.0, "F.Cu"),
        "R10":  (107.00, 102.50, 0.0,   "F.Cu"),
        "C19":  (109.00, 103.00, 90.0,  "F.Cu"),
        "L2":   (111.00, 102.50, 0.0,   "F.Cu"),
        "C18":  (113.00, 103.00, 90.0,  "F.Cu"),

        # Crystal Zone (Top)
        "R9":   (115.00, 102.50, 0.0,   "F.Cu"),
        "Y1":   (118.50, 103.50, 0.0,   "F.Cu"),
        "C24":  (116.50, 106.50, 0.0,   "F.Cu"),
        "C25":  (120.50, 106.50, 0.0,   "F.Cu"),

        # Buzzer Zone (Top-Right)
        "BZ1":  (134.00, 106.00, 0.0,   "F.Cu"),
        "D3":   (125.00, 102.50, 0.0,   "F.Cu"),
        "Q2":   (125.00, 105.50, 0.0,   "F.Cu"),
        "R12":  (125.00, 108.00, 0.0,   "F.Cu"),
        "R13":  (125.00, 110.00, 0.0,   "F.Cu"),

        # MCU ESP32-S3 (Center)
        "U1":   (115.00, 112.50, 0.0,   "F.Cu"),

        # West Side (Buttons & Decoupling)
        "SW2":  (103.00, 108.00, 90.0,  "F.Cu"),
        "SW3":  (103.00, 114.50, 90.0,  "F.Cu"),
        "LED1": (102.50, 121.00, 0.0,   "F.Cu"),

        "L1":   (107.00, 106.00, 0.0,   "F.Cu"),
        "C11":  (107.00, 108.50, 90.0,  "F.Cu"),
        "C12":  (109.50, 106.00, 0.0,   "F.Cu"),
        "C13":  (109.50, 107.80, 0.0,   "F.Cu"),
        "C14":  (109.20, 109.60, 0.0,   "F.Cu"),
        "C23":  (109.20, 111.40, 0.0,   "F.Cu"),
        "R8":   (109.20, 113.20, 0.0,   "F.Cu"),

        "R14":  (107.00, 112.00, 0.0,   "F.Cu"),
        "R15":  (107.00, 114.00, 0.0,   "F.Cu"),
        "C29":  (107.00, 116.00, 0.0,   "F.Cu"),

        # East Decoupling & Power Path
        "C21":  (121.00, 108.50, 0.0,   "F.Cu"),
        "C22":  (121.00, 110.50, 0.0,   "F.Cu"),
        "C17":  (121.00, 112.50, 0.0,   "F.Cu"),
        "C20":  (121.00, 114.50, 0.0,   "F.Cu"),

        "Q1":   (125.00, 113.00, 0.0,   "F.Cu"),
        "D2":   (124.20, 116.00, 0.0,   "F.Cu"),
        "R6":   (119.50, 116.50, 0.0,   "F.Cu"),

        "U3":   (130.00, 113.50, 0.0,   "F.Cu"),
        "R3":   (133.50, 112.50, 0.0,   "F.Cu"),
        "C4":   (134.00, 115.00, 0.0,   "F.Cu"),

        "SW1":  (137.50, 117.00, 90.0,  "F.Cu"),

        # South Decoupling
        "C15":  (112.50, 118.00, 90.0,  "F.Cu"),
        "C16":  (114.50, 118.00, 90.0,  "F.Cu"),
        "C28":  (116.50, 118.00, 90.0,  "F.Cu"),
        "R11":  (118.50, 117.50, 0.0,   "F.Cu"),

        # South-West LDO & Regulators
        "U5":   (108.50, 121.50, 0.0,   "F.Cu"),
        "R7":   (105.00, 119.00, 0.0,   "F.Cu"),
        "C7":   (105.00, 122.00, 0.0,   "F.Cu"),
        "C8":   (105.00, 125.00, 0.0,   "F.Cu"),
        "C9":   (108.50, 124.50, 0.0,   "F.Cu"),
        "C10":  (108.50, 127.20, 0.0,   "F.Cu"),

        # LoRa Power Filter
        "FB1":  (112.00, 121.50, 0.0,   "F.Cu"),
        "C26":  (112.00, 124.00, 0.0,   "F.Cu"),
        "C27":  (112.00, 126.50, 0.0,   "F.Cu"),

        # USB-C J1 & ESD
        "J1":   (122.50, 127.00, 0.0,   "F.Cu"),
        "D1":   (122.50, 119.00, 0.0,   "F.Cu"),
        "R1":   (118.50, 119.00, 0.0,   "F.Cu"),
        "R2":   (125.50, 119.00, 0.0,   "F.Cu"),
        "C1":   (115.50, 122.00, 0.0,   "F.Cu"),
        "C2":   (115.50, 124.50, 0.0,   "F.Cu"),
        "C3":   (115.50, 126.80, 0.0,   "F.Cu"),

        # Battery Protection & J2
        "U4":   (131.00, 117.00, 0.0,   "F.Cu"),
        "R4":   (128.50, 115.50, 0.0,   "F.Cu"),
        "R5":   (128.50, 117.50, 0.0,   "F.Cu"),
        "C5":   (128.50, 119.50, 0.0,   "F.Cu"),
        "C6":   (128.50, 121.50, 0.0,   "F.Cu"),
        "Q3":   (132.50, 122.50, 90.0,  "F.Cu"),
        "J2":   (136.50, 126.00, 0.0,   "F.Cu"),

        # Back Copper
        "U2":   (120.00, 114.00, 0.0,   "B.Cu"),
    }

    for ref, (x, y, rot, layer) in layout.items():
        fp = board.FindFootprintByReference(ref)
        if not fp: continue
        fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))
        fp.SetOrientationDegrees(rot)
        if fp.GetLayerName() != layer:
            fp.Flip(fp.GetPosition(), True)

    pcbnew.SaveBoard(BOARD_PATH, board)
    print("Saved board layout with zero-clearance-violation coordinates.")

if __name__ == '__main__':
    optimize()
    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_Zero_Check.txt")
    subprocess.run([
        KICAD_CLI, "pcb", "drc",
        "--output", drc_out,
        "--units", "mm",
        BOARD_PATH
    ])
    if os.path.exists(drc_out):
        with open(drc_out, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        import re
        violations = re.findall(r'\[([a-zA-Z_]+)\]:\s*([^\n]+)', content)
        types = {}
        for vtype, desc in violations:
            types[vtype] = types.get(vtype, 0) + 1
        print("DRC Summary by Violation Type:")
        for k, count in sorted(types.items(), key=lambda x: -x[1]):
            print(f"  {k:25s}: {count}")
