"""fix_drc_final.py -- Definitive DRC-clean placement.

Strategy: Place every component with >= 0.3mm courtyard gap to all neighbors.
Board: 48 x 38 mm (100,100) -> (148,138), r=1.5mm fillet.

Courtyard sizes from actual footprints (half-widths used for placement):
  Passives 0402/0603: ~1.0 x 0.5 (half: 0.5 x 0.25)
  Passives 0805:      ~1.5 x 0.5 (half: 0.75 x 0.25)
  Passives 1206:      ~1.5 x 0.8 (half: 0.75 x 0.4)
  SOT-23 (Q1,Q2):     ~2.0 x 1.75
  SOT-223 (U3,U4,U5): ~2.1 x 1.75
  QFN-32 (U1):        ~4.15 x 4.15
  Ra-02 (U2):         ~9.3 x 9.05 (B.Cu)
  USB-C (J1):         ~5.35 x 4.75
  JST (J2):           ~2.95 x 3.35
  Buzzer (BZ1):       ~5.35 x 5.35
  Crystal (Y1):       ~2.15 x 1.8
  Switch 6mm (SW1):   ~2.95 x 4.45
  Switch 3x4 (SW2/3): ~1.85 x 2.85
  LED WS2812B:        ~1.8 x 1.5
  Diode (D1):         ~2.1 x 1.75
  Diode (D2/D3):      ~2.4 x 1.2
  Q3 SOT-23:          ~1.8 x 3.9 (90deg)
"""
import pcbnew, subprocess, os, re

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

# Board geometry
BX0, BY0 = 100.0, 100.0
BX1, BY1 = 148.0, 138.0
FILLET = 1.5

# Minimum gap between courtyard edges
GAP = 0.3

LAYOUT = {
    # ═══ ZONE A: RF & Antenna (Top-Left, y~102-104) ═══
    "ANT1": (104.00, 102.50, 180.0, "F.Cu"),
    "R10":  (108.50, 102.50, 0.0,   "F.Cu"),
    "C19":  (111.00, 102.50, 90.0,  "F.Cu"),
    "L2":   (113.00, 102.50, 0.0,   "F.Cu"),
    "C18":  (115.00, 102.50, 90.0,  "F.Cu"),

    # ═══ ZONE B: Crystal (Top, y~102-107) ═══
    "R9":   (117.50, 102.50, 0.0,   "F.Cu"),
    "Y1":   (121.00, 103.00, 0.0,   "F.Cu"),
    "C24":  (118.50, 106.00, 0.0,   "F.Cu"),
    "C25":  (123.50, 106.00, 0.0,   "F.Cu"),

    # ═══ ZONE C: Buzzer & Driver (Top-Right, y~102-113) ═══
    "BZ1":  (140.00, 106.00, 0.0,   "F.Cu"),  # 10.7x10.7 courtyard!
    "D3":   (128.00, 102.50, 0.0,   "F.Cu"),
    "Q2":   (128.00, 105.50, 0.0,   "F.Cu"),
    "R12":  (128.00, 109.00, 0.0,   "F.Cu"),
    "R13":  (128.00, 111.00, 0.0,   "F.Cu"),

    # ═══ ZONE D: MCU ESP32-S3 (Center) ═══
    # U1 courtyard: 8.3 x 8.3, centered
    "U1":   (116.00, 114.00, 0.0,   "F.Cu"),

    # ═══ ZONE E: West Buttons & Decoupling ═══
    "SW2":  (103.00, 108.50, 90.0,  "F.Cu"),
    "SW3":  (103.00, 114.50, 90.0,  "F.Cu"),
    "LED1": (102.00, 120.00, 0.0,   "F.Cu"),

    "L1":   (108.00, 106.00, 0.0,   "F.Cu"),
    "C11":  (108.00, 108.50, 90.0,  "F.Cu"),
    "C12":  (110.50, 106.00, 0.0,   "F.Cu"),
    "C13":  (110.50, 108.00, 0.0,   "F.Cu"),
    "C14":  (110.00, 110.50, 0.0,   "F.Cu"),
    "C23":  (110.00, 112.50, 0.0,   "F.Cu"),
    "R8":   (110.00, 114.50, 0.0,   "F.Cu"),

    "R14":  (107.00, 112.00, 0.0,   "F.Cu"),
    "R15":  (107.00, 114.50, 0.0,   "F.Cu"),
    "C29":  (107.00, 117.00, 0.0,   "F.Cu"),

    # ═══ ZONE F: East MCU Decoupling ═══
    "C21":  (123.00, 109.00, 0.0,   "F.Cu"),
    "C22":  (123.00, 111.00, 0.0,   "F.Cu"),
    "C17":  (123.00, 113.00, 0.0,   "F.Cu"),
    "C20":  (123.00, 115.00, 0.0,   "F.Cu"),

    # ═══ ZONE G: East Power Path ═══
    "Q1":   (128.00, 113.50, 0.0,   "F.Cu"),
    "D2":   (128.00, 117.00, 0.0,   "F.Cu"),  # well below Q1 B=115.25
    "R6":   (123.00, 118.00, 0.0,   "F.Cu"),

    # ═══ ZONE H: Charge Controller ═══
    "U3":   (133.00, 113.50, 0.0,   "F.Cu"),
    "R3":   (137.50, 113.50, 0.0,   "F.Cu"),
    "C4":   (133.00, 117.00, 0.0,   "F.Cu"),

    # ═══ ZONE I: Power Switch ═══
    "SW1":  (146.00, 106.00, 90.0,  "F.Cu"),  # far right, clear of BZ1

    # ═══ ZONE J: SPI Decoupling Row ═══
    "C15":  (113.00, 120.00, 90.0,  "F.Cu"),
    "C16":  (115.00, 120.00, 90.0,  "F.Cu"),
    "C28":  (117.00, 120.00, 90.0,  "F.Cu"),
    "R11":  (119.00, 120.00, 0.0,   "F.Cu"),

    # ═══ ZONE K: LDO & Regulators (South-West) ═══
    "R7":   (105.00, 118.00, 0.0,   "F.Cu"),
    "U5":   (108.00, 123.50, 0.0,   "F.Cu"),
    "C7":   (104.00, 123.50, 0.0,   "F.Cu"),
    "C8":   (104.00, 127.00, 0.0,   "F.Cu"),
    "C9":   (108.00, 127.00, 0.0,   "F.Cu"),
    "C10":  (104.00, 130.00, 0.0,   "F.Cu"),

    # ═══ ZONE L: LoRa Power Filter ═══
    "FB1":  (112.00, 123.50, 0.0,   "F.Cu"),
    "C26":  (112.00, 126.00, 0.0,   "F.Cu"),
    "C27":  (112.00, 128.50, 0.0,   "F.Cu"),

    # ═══ ZONE M: USB-C & ESD (South-Center) ═══
    # J1 courtyard: 10.7 x 9.5
    "D1":   (122.00, 122.50, 0.0,   "F.Cu"),
    "R1":   (117.00, 122.50, 0.0,   "F.Cu"),
    "R2":   (127.00, 122.50, 0.0,   "F.Cu"),
    "J1":   (122.00, 131.00, 0.0,   "F.Cu"),  # court top ~126.25
    "C1":   (116.00, 126.00, 0.0,   "F.Cu"),
    "C2":   (116.00, 128.50, 0.0,   "F.Cu"),
    "C3":   (116.00, 131.00, 0.0,   "F.Cu"),

    # ═══ ZONE N: Battery Protection & Connector (South-East) ═══
    "R4":   (130.00, 120.00, 0.0,   "F.Cu"),
    "R5":   (132.50, 120.00, 0.0,   "F.Cu"),
    "U4":   (137.00, 120.00, 0.0,   "F.Cu"),
    "C5":   (130.00, 122.50, 0.0,   "F.Cu"),
    "C6":   (132.50, 122.50, 0.0,   "F.Cu"),
    "Q3":   (140.00, 122.50, 90.0,  "F.Cu"),
    "J2":   (144.50, 131.00, 0.0,   "F.Cu"),

    # ═══ Back Copper: LoRa Ra-02 ═══
    "U2":   (124.00, 119.00, 0.0,   "B.Cu"),
}


def apply():
    board = pcbnew.LoadBoard(BOARD_PATH)

    print(f"Applying {len(LAYOUT)} components...")
    for ref, (x, y, rot, layer) in LAYOUT.items():
        fp = board.FindFootprintByReference(ref)
        if not fp:
            print(f"  WARN: {ref} not found"); continue
        fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))
        fp.SetOrientationDegrees(rot)
        if fp.GetLayerName() != layer:
            fp.Flip(fp.GetPosition(), True)
            print(f"  Flipped {ref} to {layer}")

    # Edge.Cuts
    for d in list(board.GetDrawings()):
        if d.GetLayerName() == 'Edge.Cuts':
            board.Delete(d)

    x0, y0, x1, y1, r, w = BX0, BY0, BX1, BY1, FILLET, 0.15
    def seg(sx,sy,ex,ey):
        s = pcbnew.PCB_SHAPE(board); s.SetShape(pcbnew.SHAPE_T_SEGMENT)
        s.SetLayer(pcbnew.Edge_Cuts)
        s.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx), pcbnew.FromMM(sy)))
        s.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex), pcbnew.FromMM(ey)))
        s.SetWidth(pcbnew.FromMM(w)); board.Add(s)
    def arc(cx,cy,sx,sy,ex,ey):
        a = pcbnew.PCB_SHAPE(board); a.SetShape(pcbnew.SHAPE_T_ARC)
        a.SetLayer(pcbnew.Edge_Cuts)
        a.SetCenter(pcbnew.VECTOR2I(pcbnew.FromMM(cx), pcbnew.FromMM(cy)))
        a.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx), pcbnew.FromMM(sy)))
        a.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex), pcbnew.FromMM(ey)))
        a.SetWidth(pcbnew.FromMM(w)); board.Add(a)

    seg(x0+r,y0,x1-r,y0); arc(x1-r,y0+r,x1-r,y0,x1,y0+r)
    seg(x1,y0+r,x1,y1-r); arc(x1-r,y1-r,x1,y1-r,x1-r,y1)
    seg(x1-r,y1,x0+r,y1); arc(x0+r,y1-r,x0+r,y1,x0,y1-r)
    seg(x0,y1-r,x0,y0+r); arc(x0+r,y0+r,x0,y0+r,x0+r,y0)

    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"Board saved: {x1-x0} x {y1-y0} mm")


if __name__ == '__main__':
    apply()

    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_Final_v5.txt")
    subprocess.run([KICAD_CLI, "pcb", "drc", "--output", drc_out, "--units", "mm", BOARD_PATH])
    if os.path.exists(drc_out):
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for m in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[m] = types.get(m, 0) + 1
        print("\nDRC Summary:")
        for k, v in sorted(types.items(), key=lambda x: -x[1]):
            print(f"  {k:25s}: {v}")
        critical = 0
        for vtype in ['shorting_items','clearance','solder_mask_bridge','courtyards_overlap',
                       'copper_edge_clearance','hole_clearance','npth_inside_courtyard','pth_inside_courtyard']:
            if vtype in types:
                critical += types[vtype]
                print(f"\n  [{vtype}] ({types[vtype]}):")
                for block in re.findall(r'\['+vtype+r'\][^\[]+', content):
                    print(f"    {block.strip()[:300]}")
        print(f"\n  CRITICAL: {critical}")
        if critical == 0:
            print("  >>> CLEAN! Ready for autorouting. <<<")
