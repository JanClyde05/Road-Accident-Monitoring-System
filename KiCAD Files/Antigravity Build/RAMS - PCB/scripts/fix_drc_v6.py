"""fix_drc_v6.py -- Incremental fixes for remaining 13 critical violations.

Fixes:
  1. C1/C2/C3 -> x=113.5 (left of J1 court L~116.64)
  2. Q3 -> (142.5, 122.5) -- clear of U4 court R~139.1
  3. BZ1 -> (137, 106) + SW1 -> (137, 117) -- stack vertically instead of horizontally
  4. Board -> 50x40mm (100,100)-(150,140) to give edge clearance
"""
import pcbnew, subprocess, os, re

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

FIXES = {
    # Fix C1/C2/C3 vs J1 overlap
    "C1":  (113.50, 126.00, 0.0,   "F.Cu"),
    "C2":  (113.50, 128.50, 0.0,   "F.Cu"),
    "C3":  (113.50, 131.00, 0.0,   "F.Cu"),

    # Fix U4 vs Q3 overlap: move Q3 east
    "Q3":  (143.50, 120.50, 90.0,  "F.Cu"),

    # Fix BZ1/SW1: BZ1 stays, SW1 stacks below it
    "BZ1": (140.00, 106.00, 0.0,   "F.Cu"),
    "SW1": (140.00, 117.50, 90.0,  "F.Cu"),  # below BZ1 court B=111.35

    # Fix J2 (move south for Q3 clearance)
    "J2":  (143.50, 132.00, 0.0,   "F.Cu"),
}

# Board dims
BX0, BY0 = 100.0, 100.0
BX1, BY1 = 150.0, 140.0
FILLET = 1.5

def apply():
    board = pcbnew.LoadBoard(BOARD_PATH)
    for ref, (x, y, rot, layer) in FIXES.items():
        fp = board.FindFootprintByReference(ref)
        if not fp:
            print(f"  WARN: {ref} not found"); continue
        fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))
        fp.SetOrientationDegrees(rot)
        if fp.GetLayerName() != layer:
            fp.Flip(fp.GetPosition(), True)
        print(f"  {ref} -> ({x}, {y})")

    # Rebuild Edge.Cuts
    for d in list(board.GetDrawings()):
        if d.GetLayerName() == 'Edge.Cuts':
            board.Delete(d)
    x0,y0,x1,y1,r,w = BX0,BY0,BX1,BY1,FILLET,0.15
    def seg(sx,sy,ex,ey):
        s=pcbnew.PCB_SHAPE(board);s.SetShape(pcbnew.SHAPE_T_SEGMENT);s.SetLayer(pcbnew.Edge_Cuts)
        s.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx),pcbnew.FromMM(sy)))
        s.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex),pcbnew.FromMM(ey)))
        s.SetWidth(pcbnew.FromMM(w));board.Add(s)
    def arc(cx,cy,sx,sy,ex,ey):
        a=pcbnew.PCB_SHAPE(board);a.SetShape(pcbnew.SHAPE_T_ARC);a.SetLayer(pcbnew.Edge_Cuts)
        a.SetCenter(pcbnew.VECTOR2I(pcbnew.FromMM(cx),pcbnew.FromMM(cy)))
        a.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(sx),pcbnew.FromMM(sy)))
        a.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(ex),pcbnew.FromMM(ey)))
        a.SetWidth(pcbnew.FromMM(w));board.Add(a)
    seg(x0+r,y0,x1-r,y0);arc(x1-r,y0+r,x1-r,y0,x1,y0+r)
    seg(x1,y0+r,x1,y1-r);arc(x1-r,y1-r,x1,y1-r,x1-r,y1)
    seg(x1-r,y1,x0+r,y1);arc(x0+r,y1-r,x0+r,y1,x0,y1-r)
    seg(x0,y1-r,x0,y0+r);arc(x0+r,y0+r,x0,y0+r,x0+r,y0)

    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"Board: {x1-x0} x {y1-y0} mm")

if __name__ == '__main__':
    apply()
    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_v6_Fix.txt")
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
                       'copper_edge_clearance','hole_clearance']:
            if vtype in types:
                critical += types[vtype]
                print(f"\n  [{vtype}] ({types[vtype]}):")
                for block in re.findall(r'\['+vtype+r'\][^\[]+', content):
                    print(f"    {block.strip()[:300]}")
        print(f"\n  CRITICAL: {critical}")
        if critical == 0:
            print("  >>> CLEAN! Ready for autorouting. <<<")
