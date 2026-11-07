"""fix_drc_v3.py -- Final comprehensive DRC-clean placement.

Fixes from v2:
  - C1/C2/C3: moved left of J1 courtyard (x=114.0) to clear J1
  - Q1 + D2 + R13: spaced vertically with 0.5mm courtyard gap
  - SW1: moved east to x=141 to clear BZ1 courtyard
  - Q3: moved up to y=122 to clear J2 courtyard
  - R7: moved right to x=105.5 to clear LED1
  - J2: pushed down to y=131 for Q3 clearance
  - Board expanded to 44x36mm (100,100 -> 144,136)
"""
import pcbnew, subprocess, os, re

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

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
    "BZ1":  (134.00, 106.00, 0.0,   "F.Cu"),  # court R=139.34
    "D3":   (126.00, 102.50, 0.0,   "F.Cu"),
    "Q2":   (126.00, 105.50, 0.0,   "F.Cu"),
    "R12":  (126.00, 108.50, 0.0,   "F.Cu"),
    "R13":  (126.00, 110.00, 0.0,   "F.Cu"),  # court B=110.52, Q1 T must be > 110.52

    # ═══ MCU ESP32-S3 (Center) ═══
    "U1":   (115.00, 113.00, 0.0,   "F.Cu"),

    # ═══ West Side: Buttons, LED, Decoupling ═══
    "SW2":  (102.50, 108.00, 90.0,  "F.Cu"),
    "SW3":  (102.50, 114.50, 90.0,  "F.Cu"),
    "LED1": (101.00, 121.50, 0.0,   "F.Cu"),  # court R ~102.80

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

    # ═══ East Power Path ═══
    "Q1":   (126.00, 111.50, 0.0,   "F.Cu"),  # court T=110.75 -> must be > R13 B=110.52
    "D2":   (126.00, 115.00, 0.0,   "F.Cu"),  # moved down, court T > Q1 B=113.24
    "R6":   (122.00, 118.50, 0.0,   "F.Cu"),

    # ═══ Charge Controller U3 ═══
    "U3":   (131.00, 113.00, 0.0,   "F.Cu"),
    "R3":   (135.00, 112.50, 0.0,   "F.Cu"),
    "C4":   (135.00, 116.50, 0.0,   "F.Cu"),

    # ═══ Power Switch (Far-East, north of BZ1 courtyard) ═══
    "SW1":  (142.00, 115.00, 90.0,  "F.Cu"),  # far enough right to clear BZ1 R=139.34

    # ═══ South-Center: MCU SPI Decoupling ═══
    "C15":  (112.50, 119.50, 90.0,  "F.Cu"),
    "C16":  (114.50, 119.50, 90.0,  "F.Cu"),
    "C28":  (116.50, 119.50, 90.0,  "F.Cu"),
    "R11":  (118.50, 119.50, 0.0,   "F.Cu"),

    # ═══ South-West: LDO & Regulators ═══
    "R7":   (105.50, 119.50, 0.0,   "F.Cu"),  # moved right, R7 L=104.53 > LED1 R=102.80
    "U5":   (110.00, 123.50, 0.0,   "F.Cu"),
    "C7":   (105.50, 124.00, 0.0,   "F.Cu"),
    "C8":   (105.50, 127.00, 0.0,   "F.Cu"),
    "C9":   (110.00, 127.00, 0.0,   "F.Cu"),
    "C10":  (110.00, 130.00, 0.0,   "F.Cu"),

    # ═══ LoRa Power Filter ═══
    "FB1":  (114.00, 123.50, 0.0,   "F.Cu"),
    "C26":  (114.00, 126.00, 0.0,   "F.Cu"),
    "C27":  (114.00, 128.50, 0.0,   "F.Cu"),

    # ═══ USB-C J1 & ESD (South-Center) ═══
    # J1 courtyard: L=115.64, T=124.69, R=126.37, B=134.19 (10.73 x 9.51)
    # C1/C2/C3 must stay left of J1 court L=115.64 -> x < 114.0
    "J1":   (121.00, 130.00, 0.0,   "F.Cu"),
    "D1":   (121.00, 122.00, 0.0,   "F.Cu"),
    "R1":   (115.00, 122.00, 0.0,   "F.Cu"),
    "R2":   (127.00, 122.00, 0.0,   "F.Cu"),
    "C1":   (113.00, 125.00, 0.0,   "F.Cu"),  # was 117.50 -- moved left of J1
    "C2":   (113.00, 128.00, 0.0,   "F.Cu"),  # was 117.50 -- moved left of J1
    "C3":   (113.00, 131.00, 0.0,   "F.Cu"),  # was 117.50 -- moved left of J1

    # ═══ Battery Protection U4 & Connector J2 (South-East) ═══
    "R4":   (128.00, 119.00, 0.0,   "F.Cu"),
    "R5":   (128.00, 121.50, 0.0,   "F.Cu"),
    "U4":   (133.00, 120.00, 0.0,   "F.Cu"),
    "C5":   (128.00, 124.00, 0.0,   "F.Cu"),
    "C6":   (128.00, 126.50, 0.0,   "F.Cu"),
    "Q3":   (138.00, 121.50, 90.0,  "F.Cu"),  # court B=125.40 -- J2 T=126.67, OK!
    "J2":   (138.00, 131.00, 0.0,   "F.Cu"),  # pushed south

    # ═══ Back Copper: LoRa Ra-02 ═══
    "U2":   (122.00, 117.00, 0.0,   "B.Cu"),
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

    # ── Rebuild Edge.Cuts (44 x 36 mm, r=1.5mm) ──
    for d in list(board.GetDrawings()):
        if d.GetLayerName() == 'Edge.Cuts':
            board.Delete(d)

    x0, y0 = 100.0, 100.0
    x1, y1 = 144.0, 136.0
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

    seg(x0+r, y0, x1-r, y0)
    arc(x1-r, y0+r, x1-r, y0, x1, y0+r)
    seg(x1, y0+r, x1, y1-r)
    arc(x1-r, y1-r, x1, y1-r, x1-r, y1)
    seg(x1-r, y1, x0+r, y1)
    arc(x0+r, y1-r, x0+r, y1, x0, y1-r)
    seg(x0, y1-r, x0, y0+r)
    arc(x0+r, y0+r, x0, y0+r, x0+r, y0)

    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"Saved. Board: {x1-x0} x {y1-y0} mm")


if __name__ == '__main__':
    apply()

    # DRC
    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_v3_Fix.txt")
    subprocess.run([KICAD_CLI, "pcb", "drc", "--output", drc_out, "--units", "mm", BOARD_PATH])
    if os.path.exists(drc_out):
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for m in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[m] = types.get(m, 0) + 1
        print("\nDRC Summary:")
        for k, v in sorted(types.items(), key=lambda x: -x[1]):
            print(f"  {k:25s}: {v}")
        total = sum(types.values())
        print(f"  {'TOTAL':25s}: {total}")
        # Show critical
        critical = 0
        for vtype in ['shorting_items','clearance','solder_mask_bridge','courtyards_overlap']:
            if vtype in types:
                critical += types[vtype]
                print(f"\n  [{vtype}] ({types[vtype]}):")
                for block in re.findall(r'\['+vtype+r'\][^\[]+', content):
                    print(f"    {block.strip()[:250]}")
        if critical == 0:
            print("\n  >>> ZERO CRITICAL VIOLATIONS! Ready for autorouting. <<<")
