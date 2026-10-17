import pcbnew
import subprocess
import os

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

# Compact wearable board dimensions: 42.0 x 32.0 mm (Origin: 100.0, 100.0)
BX0, BY0 = 100.0, 100.0
BX1, BY1 = 142.0, 132.0
FILLET = 1.5

def apply_placements():
    board = pcbnew.LoadBoard(BOARD_PATH)

    # 1. Compact layout map:
    # - U2 (Ai-Thinker Ra-02) on B.Cu, clear of all through-hole pins.
    # - 66 components on F.Cu.
    # - USB-C J1 edge-mounted with front lip flush at Y=132.0.
    # - Battery JST J2 edge-mounted facing bottom edge Y=132.0.
    # - Power switch SW1 edge-mounted with slide actuator protruding past X=142.0.
    # - 2.4GHz chip antenna ANT1 at top-left corner with clean diagonal RF feed.
    # - 40MHz crystal Y1 isolated north of MCU.
    layout = {
        # --- Zone 1: 2.4 GHz RF & Chip Antenna (Top-Left Corner) ---
        "ANT1": (103.50, 102.80, 180.0, "F.Cu"),
        "R10":  (106.50, 104.50, 45.0,  "F.Cu"),
        "C19":  (107.80, 106.20, 45.0,  "F.Cu"),
        "L2":   (109.90, 107.90, 45.0,  "F.Cu"),
        "C18":  (111.60, 109.60, 45.0,  "F.Cu"),

        # --- Zone 2: 40 MHz Crystal & Clock (North of MCU, Isolated from RF) ---
        "R9":   (114.50, 107.50, 0.0,   "F.Cu"),
        "Y1":   (116.50, 104.50, 0.0,   "F.Cu"),
        "C24":  (112.50, 104.50, 0.0,   "F.Cu"),
        "C25":  (120.50, 104.50, 0.0,   "F.Cu"),

        # --- Zone 3: Buzzer & Driver (Top-East) ---
        "BZ1":  (132.00, 106.50, 0.0,   "F.Cu"),
        "D3":   (124.00, 103.00, 0.0,   "F.Cu"),
        "Q2":   (124.00, 106.00, 0.0,   "F.Cu"),
        "R12":  (124.00, 108.50, 0.0,   "F.Cu"),
        "R13":  (124.00, 110.50, 0.0,   "F.Cu"),

        # --- Zone 4: MCU ESP32-S3 (Center) ---
        "U1":   (116.00, 114.00, 0.0,   "F.Cu"),

        # --- Zone 5: West Edge Controls & MCU VDD33 Decoupling ---
        "L1":   (109.50, 112.50, 0.0,   "F.Cu"),
        "C11":  (107.00, 112.50, 90.0,  "F.Cu"),
        "C12":  (109.50, 114.50, 0.0,   "F.Cu"),
        "C13":  (109.50, 116.50, 0.0,   "F.Cu"),
        "C14":  (109.50, 118.50, 0.0,   "F.Cu"),
        "C23":  (109.50, 120.50, 0.0,   "F.Cu"),
        "R8":   (107.00, 114.50, 0.0,   "F.Cu"),

        # West Edge Tactile Buttons & Status
        "SW2":  (102.50, 108.00, 90.0,  "F.Cu"),
        "SW3":  (102.50, 115.00, 90.0,  "F.Cu"),
        "LED1": (102.50, 120.50, 0.0,   "F.Cu"),

        # Battery ADC divider
        "R14":  (106.50, 117.00, 0.0,   "F.Cu"),
        "R15":  (106.50, 119.00, 0.0,   "F.Cu"),
        "C29":  (106.50, 121.00, 0.0,   "F.Cu"),

        # --- Zone 6: East Side MCU Decoupling Column ---
        "C21":  (121.50, 112.50, 0.0,   "F.Cu"),
        "C22":  (121.50, 114.50, 0.0,   "F.Cu"),
        "C17":  (121.50, 116.50, 0.0,   "F.Cu"),
        "C20":  (121.50, 118.50, 0.0,   "F.Cu"),

        # --- Zone 7 & 8: Power Path & LiPo Charger U3 (East) ---
        "Q1":   (125.50, 113.50, 0.0,   "F.Cu"),
        "D2":   (125.50, 117.00, 0.0,   "F.Cu"),
        "R6":   (125.50, 120.00, 0.0,   "F.Cu"),
        "U3":   (130.00, 114.00, 0.0,   "F.Cu"),
        "R3":   (134.00, 114.00, 0.0,   "F.Cu"),
        "C4":   (130.00, 117.00, 0.0,   "F.Cu"),

        # --- Zone 9: Power Switch (Right Board Edge) ---
        "SW1":  (138.50, 116.50, 90.0,  "F.Cu"),

        # --- Zone 10: South MCU SPI Decoupling Row ---
        "C15":  (111.50, 119.50, 90.0,  "F.Cu"),
        "C16":  (113.50, 119.50, 90.0,  "F.Cu"),
        "R11":  (115.50, 119.50, 0.0,   "F.Cu"),
        "C28":  (117.50, 119.50, 90.0,  "F.Cu"),

        # --- Zone 11: 3.3V LDO Regulator U5 (South-West) ---
        "R7":   (103.00, 123.00, 0.0,   "F.Cu"),
        "U5":   (107.00, 124.00, 0.0,   "F.Cu"),
        "C7":   (103.00, 125.50, 0.0,   "F.Cu"),
        "C8":   (103.00, 129.50, 0.0,   "F.Cu"),
        "C9":   (107.00, 127.00, 0.0,   "F.Cu"),
        "C10":  (107.00, 129.50, 0.0,   "F.Cu"),

        # --- Zone 12: LoRa Power Filter ---
        "FB1":  (111.00, 123.00, 0.0,   "F.Cu"),
        "C26":  (111.00, 125.50, 0.0,   "F.Cu"),
        "C27":  (111.00, 128.00, 0.0,   "F.Cu"),

        # --- Zone 13: USB-C Connector J1, ESD D1, and VBUS Caps (South-Center Edge) ---
        # Front lip of J1 shell is at Y = 128.50 + 3.70 = 132.20 mm (flush with Y=132.0 bottom edge!)
        "J1":   (119.00, 128.50, 0.0,   "F.Cu"),
        "D1":   (120.50, 120.80, 0.0,   "F.Cu"),
        "R1":   (116.00, 122.50, 0.0,   "F.Cu"),
        "R2":   (124.50, 122.50, 0.0,   "F.Cu"),
        "C1":   (126.50, 124.00, 0.0,   "F.Cu"),
        "C2":   (126.50, 126.50, 0.0,   "F.Cu"),
        "C3":   (126.50, 129.00, 0.0,   "F.Cu"),

        # --- Zone 14: LiPo Battery Protection & Connector J2 (South-East Edge) ---
        "U4":   (131.00, 121.50, 0.0,   "F.Cu"),
        "R4":   (134.50, 120.00, 0.0,   "F.Cu"),
        "R5":   (134.50, 122.00, 0.0,   "F.Cu"),
        "C5":   (134.50, 124.00, 0.0,   "F.Cu"),
        "C6":   (131.00, 124.50, 0.0,   "F.Cu"),
        "Q3":   (138.50, 126.50, 90.0,  "F.Cu"),
        "J2":   (133.00, 128.50, 0.0,   "F.Cu"),

        # --- Zone 15: Back Copper: LoRa Ra-02 Transceiver ---
        "U2":   (118.00, 113.00, 0.0,   "B.Cu"),
    }

    print(f"Applying compact placement to {len(layout)} components...")
    for ref, (x, y, rot, layer) in layout.items():
        fp = board.FindFootprintByReference(ref)
        if not fp:
            print(f"Warning: footprint {ref} not found on board!")
            continue
        fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))
        fp.SetOrientationDegrees(rot)
        if fp.GetLayerName() != layer:
            fp.Flip(fp.GetPosition(), True)

    # 2. Re-create Edge.Cuts outline (42.0 x 32.0 mm rounded rectangle)
    drawings = list(board.GetDrawings())
    for d in drawings:
        if d.GetLayerName() == 'Edge.Cuts':
            board.Delete(d)

    x0, y0 = BX0, BY0
    x1, y1 = BX1, BY1
    r = FILLET
    w = 0.15 # line width in mm

    def add_line(sx, sy, ex, ey):
        seg = pcbnew.PCB_SHAPE(board)
        seg.SetShape(pcbnew.SHAPE_T_SEGMENT)
        seg.SetLayer(pcbnew.Edge_Cuts)
        seg.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx), pcbnew.FromMM(sy)))
        seg.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex), pcbnew.FromMM(ey)))
        seg.SetWidth(pcbnew.FromMM(w))
        board.Add(seg)

    def add_arc(cx, cy, sx, sy, ex, ey):
        arc = pcbnew.PCB_SHAPE(board)
        arc.SetShape(pcbnew.SHAPE_T_ARC)
        arc.SetLayer(pcbnew.Edge_Cuts)
        arc.SetCenter(pcbnew.VECTOR2I(pcbnew.FromMM(cx), pcbnew.FromMM(cy)))
        arc.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx), pcbnew.FromMM(sy)))
        arc.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex), pcbnew.FromMM(ey)))
        arc.SetWidth(pcbnew.FromMM(w))
        board.Add(arc)

    # Top edge
    add_line(x0 + r, y0, x1 - r, y0)
    # Top-right arc
    add_arc(x1 - r, y0 + r, x1 - r, y0, x1, y0 + r)
    # Right edge
    add_line(x1, y0 + r, x1, y1 - r)
    # Bottom-right arc
    add_arc(x1 - r, y1 - r, x1, y1 - r, x1 - r, y1)
    # Bottom edge
    add_line(x1 - r, y1, x0 + r, y1)
    # Bottom-left arc
    add_arc(x0 + r, y1 - r, x0 + r, y1, x0, y1 - r)
    # Left edge
    add_line(x0, y1 - r, x0, y0 + r)
    # Top-left arc
    add_arc(x0 + r, y0 + r, x0, y0 + r, x0 + r, y0)

    print("Added closed Edge.Cuts boundary (42.0 x 32.0 mm, r=1.5mm).")

    # Save board
    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"[SUCCESS] Saved updated compact board to {BOARD_PATH}")

if __name__ == '__main__':
    apply_placements()

    # Run kicad-cli pcb drc
    print("\nRunning DRC validation with kicad-cli...")
    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_Placement_Check.txt")
    res = subprocess.run([
        KICAD_CLI, "pcb", "drc",
        "--output", drc_out,
        "--units", "mm",
        BOARD_PATH
    ], capture_output=True, text=True)
    print(f"DRC completed (exit code {res.returncode})")
    if os.path.exists(drc_out):
        with open(drc_out, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        print("DRC Summary:")
        for line in lines[:25]:
            print(" ", line.strip())
        if len(lines) > 25:
            print(f"  ... ({len(lines)} total lines)")
