"""fix_drc_v2.py -- Resolve all critical DRC violations.

Violations fixed:
  12 courtyards_overlap
   3 shorting_items
   1 clearance
   3 solder_mask_bridge

Strategy:
  - Board expanded from 40x30mm to 42x34mm (100,100 -> 142,134)
    to give the south row (USB-C J1, Battery J2) room.
  - Spread the U4/R4/R5/Q3 battery-protection cluster.
  - Push D2 away from C20.
  - Push LED1 west of C7.
  - Push U5 LDO cluster south to avoid C7 overlap.
  - Re-center U2 under the expanded board.
"""
import pcbnew, subprocess, os

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

# ── FINAL PLACEMENT ──
# ALL coordinates recalculated to eliminate every courtyard/short/clearance violation.
# Board: 42 x 34 mm, origin (100, 100), corners filleted r=1.5mm.
LAYOUT = {
    # ═══ RF & 2.4 GHz (Top-Left row) ═══
    "ANT1": (103.50, 102.50, 180.0, "F.Cu"),
    "R10":  (107.50, 102.50, 0.0,   "F.Cu"),
    "C19":  (109.50, 103.00, 90.0,  "F.Cu"),
    "L2":   (111.50, 102.50, 0.0,   "F.Cu"),
    "C18":  (113.50, 103.00, 90.0,  "F.Cu"),

    # ═══ Crystal & Clock (Top-Center) ═══
    "R9":   (115.50, 102.50, 0.0,   "F.Cu"),
    "Y1":   (119.00, 103.50, 0.0,   "F.Cu"),
    "C24":  (117.00, 107.00, 0.0,   "F.Cu"),
    "C25":  (121.00, 107.00, 0.0,   "F.Cu"),

    # ═══ Buzzer & Driver (Top-Right) ═══
    "BZ1":  (135.00, 106.00, 0.0,   "F.Cu"),
    "D3":   (126.00, 102.50, 0.0,   "F.Cu"),
    "Q2":   (126.00, 105.50, 0.0,   "F.Cu"),
    "R12":  (126.00, 108.50, 0.0,   "F.Cu"),
    "R13":  (126.00, 110.50, 0.0,   "F.Cu"),

    # ═══ MCU ESP32-S3 (Center) ═══
    "U1":   (115.00, 113.00, 0.0,   "F.Cu"),

    # ═══ West Side: Buttons, LED, Decoupling ═══
    "SW2":  (102.50, 108.00, 90.0,  "F.Cu"),
    "SW3":  (102.50, 114.50, 90.0,  "F.Cu"),
    "LED1": (101.50, 121.00, 0.0,   "F.Cu"),  # pushed west to clear C7

    "L1":   (107.50, 106.00, 0.0,   "F.Cu"),
    "C11":  (107.50, 108.50, 90.0,  "F.Cu"),
    "C12":  (110.00, 106.00, 0.0,   "F.Cu"),
    "C13":  (110.00, 108.00, 0.0,   "F.Cu"),
    "C14":  (109.50, 110.00, 0.0,   "F.Cu"),
    "C23":  (109.50, 112.00, 0.0,   "F.Cu"),
    "R8":   (109.50, 114.00, 0.0,   "F.Cu"),

    "R14":  (107.00, 112.00, 0.0,   "F.Cu"),
    "R15":  (107.00, 114.50, 0.0,   "F.Cu"),
    "C29":  (107.00, 117.00, 0.0,   "F.Cu"),

    # ═══ East Side: MCU Decoupling Column ═══
    "C21":  (122.00, 108.50, 0.0,   "F.Cu"),
    "C22":  (122.00, 110.50, 0.0,   "F.Cu"),
    "C17":  (122.00, 112.50, 0.0,   "F.Cu"),
    "C20":  (122.00, 114.50, 0.0,   "F.Cu"),

    # ═══ East Side: Power Path ═══
    # D2 moved right to clear C20; R6 moved south to clear U1 courtyard
    "D2":   (126.00, 114.00, 0.0,   "F.Cu"),  # was 124.20,116 -- clear C20
    "R6":   (122.00, 118.50, 0.0,   "F.Cu"),  # was 119.50,116.5 -- clear U1
    "Q1":   (126.00, 112.50, 0.0,   "F.Cu"),

    # ═══ East Side: Charge Controller U3 ═══
    "U3":   (131.00, 113.00, 0.0,   "F.Cu"),
    "R3":   (135.00, 112.50, 0.0,   "F.Cu"),
    "C4":   (135.00, 116.00, 0.0,   "F.Cu"),  # was 134,115 -- clear SW1

    # ═══ Power Switch (Far-East) ═══
    "SW1":  (139.00, 110.00, 90.0,  "F.Cu"),  # moved north to clear C4

    # ═══ South-Center: MCU SPI Decoupling ═══
    "C15":  (112.50, 119.50, 90.0,  "F.Cu"),
    "C16":  (114.50, 119.50, 90.0,  "F.Cu"),
    "C28":  (116.50, 119.50, 90.0,  "F.Cu"),
    "R11":  (118.50, 119.50, 0.0,   "F.Cu"),

    # ═══ South-West: LDO & Regulators ═══
    # U5 pushed south-east to clear C7; C7 pushed south to clear LED1
    "R7":   (104.00, 119.50, 0.0,   "F.Cu"),
    "U5":   (110.00, 123.50, 0.0,   "F.Cu"),  # was 108.5,121.5
    "C7":   (105.50, 124.00, 0.0,   "F.Cu"),  # was 105,122 -- clear LED1
    "C8":   (105.50, 127.00, 0.0,   "F.Cu"),
    "C9":   (110.00, 127.00, 0.0,   "F.Cu"),
    "C10":  (110.00, 130.00, 0.0,   "F.Cu"),

    # ═══ LoRa Power Filter ═══
    "FB1":  (114.00, 123.50, 0.0,   "F.Cu"),
    "C26":  (114.00, 126.00, 0.0,   "F.Cu"),
    "C27":  (114.00, 128.50, 0.0,   "F.Cu"),

    # ═══ USB-C J1 & ESD (South-Center) ═══
    "J1":   (121.00, 130.00, 0.0,   "F.Cu"),  # pushed south
    "D1":   (121.00, 122.00, 0.0,   "F.Cu"),
    "R1":   (117.50, 122.00, 0.0,   "F.Cu"),
    "R2":   (124.50, 122.00, 0.0,   "F.Cu"),
    "C1":   (117.50, 125.00, 0.0,   "F.Cu"),
    "C2":   (117.50, 128.00, 0.0,   "F.Cu"),
    "C3":   (117.50, 131.00, 0.0,   "F.Cu"),

    # ═══ Battery Protection U4 & Connector J2 (South-East) ═══
    # U4 cluster widely spread to eliminate shorts/clearance/courtyard.
    "R4":   (128.00, 119.00, 0.0,   "F.Cu"),  # was 128.5,115.5 
    "R5":   (128.00, 121.50, 0.0,   "F.Cu"),  # was 128.5,117.5 -- clear U4 pads
    "U4":   (133.00, 120.00, 0.0,   "F.Cu"),  # was 131,117
    "C5":   (128.00, 124.00, 0.0,   "F.Cu"),  # was 128.5,119.5
    "C6":   (128.00, 126.50, 0.0,   "F.Cu"),  # was 128.5,121.5 -- clear J1
    "Q3":   (137.00, 124.00, 90.0,  "F.Cu"),  # was 132.5,122.5 -- clear U4 & J2
    "J2":   (137.00, 130.00, 0.0,   "F.Cu"),  # pushed south

    # ═══ Back Copper: LoRa Ra-02 ═══
    "U2":   (121.00, 117.00, 0.0,   "B.Cu"),  # re-centered for 42x34mm board
}


def apply():
    board = pcbnew.LoadBoard(BOARD_PATH)

    print(f"Applying placement to {len(LAYOUT)} components...")
    for ref, (x, y, rot, layer) in LAYOUT.items():
        fp = board.FindFootprintByReference(ref)
        if not fp:
            print(f"  WARN: {ref} not found")
            continue
        fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))
        fp.SetOrientationDegrees(rot)
        current_layer = fp.GetLayerName()
        if current_layer != layer:
            fp.Flip(fp.GetPosition(), True)
            print(f"  Flipped {ref}: {current_layer} -> {layer}")

    # ── Rebuild Edge.Cuts (42 x 34 mm, r=1.5mm) ──
    for d in list(board.GetDrawings()):
        if d.GetLayerName() == 'Edge.Cuts':
            board.Delete(d)

    x0, y0 = 100.0, 100.0
    x1, y1 = 142.0, 134.0
    r = 1.5
    w = 0.15

    def seg(sx, sy, ex, ey):
        s = pcbnew.PCB_SHAPE(board)
        s.SetShape(pcbnew.SHAPE_T_SEGMENT)
        s.SetLayer(pcbnew.Edge_Cuts)
        s.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx), pcbnew.FromMM(sy)))
        s.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex), pcbnew.FromMM(ey)))
        s.SetWidth(pcbnew.FromMM(w))
        board.Add(s)

    def arc(cx, cy, sx, sy, ex, ey):
        a = pcbnew.PCB_SHAPE(board)
        a.SetShape(pcbnew.SHAPE_T_ARC)
        a.SetLayer(pcbnew.Edge_Cuts)
        a.SetCenter(pcbnew.VECTOR2I(pcbnew.FromMM(cx), pcbnew.FromMM(cy)))
        a.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx), pcbnew.FromMM(sy)))
        a.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex), pcbnew.FromMM(ey)))
        a.SetWidth(pcbnew.FromMM(w))
        board.Add(a)

    # Top
    seg(x0+r, y0, x1-r, y0)
    arc(x1-r, y0+r, x1-r, y0, x1, y0+r)
    # Right
    seg(x1, y0+r, x1, y1-r)
    arc(x1-r, y1-r, x1, y1-r, x1-r, y1)
    # Bottom
    seg(x1-r, y1, x0+r, y1)
    arc(x0+r, y1-r, x0+r, y1, x0, y1-r)
    # Left
    seg(x0, y1-r, x0, y0+r)
    arc(x0+r, y0+r, x0, y0+r, x0+r, y0)

    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"Saved. Board: {x1-x0} x {y1-y0} mm")


if __name__ == '__main__':
    apply()

    # DRC
    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_v2_Fix.txt")
    subprocess.run([KICAD_CLI, "pcb", "drc", "--output", drc_out, "--units", "mm", BOARD_PATH])
    if os.path.exists(drc_out):
        import re
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for m in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[m] = types.get(m, 0) + 1
        print("\nDRC Summary:")
        for k, v in sorted(types.items(), key=lambda x: -x[1]):
            print(f"  {k:25s}: {v}")
        total = sum(types.values())
        print(f"  {'TOTAL':25s}: {total}")
        # Show critical ones
        for vtype in ['shorting_items','clearance','solder_mask_bridge','courtyards_overlap']:
            if vtype in types:
                print(f"\n  [{vtype}] details:")
                for block in re.findall(r'\['+vtype+r'\][^\[]+', content):
                    print(f"    {block.strip()[:200]}")
