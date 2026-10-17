"""test_clean_layout.py -- Test layout with clean spacing for all 67 components.
"""
import pcbnew
import subprocess
import os
import re

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

# 50.0 x 40.0 mm board: (100.0, 100.0) to (150.0, 140.0)
BX0, BY0 = 100.0, 100.0
BX1, BY1 = 150.0, 140.0
FILLET = 1.5

ADJUSTMENTS = {
    # 1. Move BZ1 slightly left to give room for SW1
    "BZ1": (136.50, 106.00, 0.0,   "F.Cu"),
    
    # 2. Place SW1 on the top-right board edge
    "SW1": (146.00, 106.00, 90.0,  "F.Cu"),

    # 3. Move C1, C2, C3 to the open space east of J1 (USB VBUS filter)
    "C1":  (130.00, 126.00, 0.0,   "F.Cu"),
    "C2":  (130.00, 128.50, 0.0,   "F.Cu"),
    "C3":  (130.00, 131.00, 0.0,   "F.Cu"),

    # 4. Center U2 on B.Cu so it never touches any PTH pin
    "U2":  (120.00, 114.00, 0.0,   "B.Cu"),
}

def run():
    board = pcbnew.LoadBoard(BOARD_PATH)
    
    for ref, (x, y, rot, layer) in ADJUSTMENTS.items():
        fp = board.FindFootprintByReference(ref)
        if not fp:
            print(f"WARN: {ref} not found")
            continue
        fp.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y)))
        fp.SetOrientationDegrees(rot)
        if fp.GetLayerName() != layer:
            fp.Flip(fp.GetPosition(), True)
            print(f"Flipped {ref} to {layer}")
        print(f"Placed {ref} at ({x}, {y}) on {layer}")

    # Re-draw Edge.Cuts with nice 1.5mm rounded corners
    for d in list(board.GetDrawings()):
        if d.GetLayerName() == 'Edge.Cuts':
            board.Delete(d)
            
    x0, y0, x1, y1, r, w = BX0, BY0, BX1, BY1, FILLET, 0.15
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
    print("Board saved. Running DRC...")

    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_Clean_Test.txt")
    subprocess.run([KICAD_CLI, "pcb", "drc", "--output", drc_out, "--units", "mm", BOARD_PATH])
    
    if os.path.exists(drc_out):
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for m in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[m] = types.get(m, 0) + 1
        print("\n=== DRC Summary ===")
        for k, v in sorted(types.items(), key=lambda x: -x[1]):
            print(f"  {k:25s}: {v}")
        
        critical_types = ['shorting_items', 'clearance', 'solder_mask_bridge', 
                          'courtyards_overlap', 'copper_edge_clearance', 'pth_inside_courtyard']
        crit_count = sum(types.get(ct, 0) for ct in critical_types)
        print(f"\nCRITICAL VIOLATIONS TOTAL: {crit_count}")
        for ct in critical_types:
            if ct in types:
                print(f"\n--- [{ct}] ({types[ct]}) ---")
                for blk in re.findall(r'\['+ct+r'\][^\[]+', content):
                    print(blk.strip()[:300])

if __name__ == '__main__':
    run()
