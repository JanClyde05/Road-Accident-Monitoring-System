import pcbnew
import subprocess
import os

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

def run_drc():
    board = pcbnew.LoadBoard(BOARD_PATH)

    layout = {
        # --- RF & 2.4GHz Antenna ---
        "ANT1": (103.50, 102.50, 180.0, "F.Cu"),
        "R10":  (107.00, 102.50, 0.0,   "F.Cu"),
        "C19":  (109.00, 103.00, 90.0,  "F.Cu"),
        "L2":   (111.00, 102.50, 0.0,   "F.Cu"),
        "C18":  (113.00, 103.00, 90.0,  "F.Cu"),

        # --- Crystal & Clock ---
        "R9":   (115.00, 102.50, 0.0,   "F.Cu"),
        "Y1":   (118.50, 103.50, 0.0,   "F.Cu"),
        "C24":  (116.50, 106.50, 0.0,   "F.Cu"),
        "C25":  (120.50, 106.50, 0.0,   "F.Cu"),

        # --- Buzzer & Driver ---
        "BZ1":  (134.00, 106.00, 0.0,   "F.Cu"),
        "D3":   (125.00, 102.50, 0.0,   "F.Cu"),
        "Q2":   (125.00, 105.50, 0.0,   "F.Cu"),
        "R12":  (125.00, 108.50, 0.0,   "F.Cu"),
        "R13":  (125.00, 110.50, 0.0,   "F.Cu"),

        # --- MCU ESP32-S3 ---
        "U1":   (115.00, 112.50, 0.0,   "F.Cu"),

        # --- West Side: Buttons & Decoupling ---
        "SW2":  (103.00, 108.00, 90.0,  "F.Cu"),
        "SW3":  (103.00, 114.50, 90.0,  "F.Cu"),
        "LED1": (103.00, 121.00, 0.0,   "F.Cu"),

        "L1":   (107.00, 106.00, 0.0,   "F.Cu"),
        "C11":  (107.00, 108.50, 90.0,  "F.Cu"),
        "C12":  (109.50, 106.00, 0.0,   "F.Cu"),
        "C13":  (109.50, 107.80, 0.0,   "F.Cu"),
        "C14":  (109.20, 109.60, 0.0,   "F.Cu"),
        "C23":  (109.20, 111.40, 0.0,   "F.Cu"),
        "R8":   (109.20, 113.20, 0.0,   "F.Cu"),

        "R14":  (107.00, 112.00, 0.0,   "F.Cu"),
        "R15":  (107.00, 114.0, 0.0,    "F.Cu"),
        "C29":  (107.00, 116.00, 0.0,   "F.Cu"),

        # --- East Side: Power Path & Decoupling ---
        "C21":  (121.00, 108.50, 0.0,   "F.Cu"),
        "C22":  (121.00, 110.50, 0.0,   "F.Cu"),
        "C17":  (121.00, 112.50, 0.0,   "F.Cu"),
        "C20":  (121.00, 114.50, 0.0,   "F.Cu"),

        "Q1":   (124.50, 113.50, 0.0,   "F.Cu"),
        "D2":   (124.00, 116.00, 0.0,   "F.Cu"),
        "R6":   (121.50, 116.50, 0.0,   "F.Cu"),

        "U3":   (129.50, 114.00, 0.0,   "F.Cu"),
        "R3":   (133.00, 113.00, 0.0,   "F.Cu"),
        "C4":   (133.80, 115.50, 0.0,   "F.Cu"),

        "SW1":  (137.50, 117.00, 90.0,  "F.Cu"),

        # --- South-Center: Decoupling & SPI series ---
        "C15":  (112.50, 118.00, 90.0,  "F.Cu"),
        "C16":  (114.50, 118.00, 90.0,  "F.Cu"),
        "C28":  (116.50, 118.00, 90.0,  "F.Cu"),
        "R11":  (118.50, 118.00, 0.0,   "F.Cu"),

        # --- South-West: LDO & Regulators ---
        "U5":   (110.50, 121.50, 0.0,   "F.Cu"),
        "R7":   (106.50, 119.50, 0.0,   "F.Cu"),
        "C7":   (106.50, 122.00, 0.0,   "F.Cu"),
        "C8":   (106.50, 125.00, 0.0,   "F.Cu"),
        "C9":   (106.50, 128.00, 0.0,   "F.Cu"),
        "C10":  (111.00, 126.50, 0.0,   "F.Cu"),

        # LoRa Power Filter
        "FB1":  (114.00, 121.50, 90.0,  "F.Cu"),
        "C26":  (114.00, 124.50, 90.0,  "F.Cu"),
        "C27":  (114.00, 127.5, 90.0,   "F.Cu"),

        # --- South-Center: USB-C Connector J1 ---
        "J1":   (122.50, 127.00, 0.0,   "F.Cu"),
        "D1":   (122.50, 119.00, 0.0,   "F.Cu"),
        "R1":   (119.50, 119.00, 90.0,  "F.Cu"),
        "R2":   (125.50, 119.00, 90.0,  "F.Cu"),
        "C1":   (115.00, 121.00, 0.0,   "F.Cu"),
        "C2":   (115.00, 123.50, 0.0,   "F.Cu"),
        "C3":   (115.00, 126.00, 0.0,   "F.Cu"),

        # --- South-East: Battery Protection & Connector J2 ---
        "U4":   (130.50, 118.00, 0.0,   "F.Cu"),
        "R4":   (128.00, 118.00, 0.0,   "F.Cu"),
        "R5":   (128.00, 120.00, 0.0,   "F.Cu"),
        "C5":   (130.50, 120.00, 0.0,   "F.Cu"),
        "C6":   (133.00, 120.00, 0.0,   "F.Cu"),
        "Q3":   (130.50, 122.50, 0.0,   "F.Cu"),
        "J2":   (136.50, 126.00, 0.0,   "F.Cu"),

        # --- Back Copper: LoRa Ra-02 ---
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
    print("Saved board with updated placement.")

if __name__ == '__main__':
    run_drc()
    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_Clean_Check.txt")
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
