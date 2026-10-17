"""fix_drc_v4.py -- Final placement pass targeting remaining 6 courtyard + pad conflicts.

Fixes:
  C1 -> (109.0, 126.0) -- left of U5 R=112.09, below FB1 B=124.02
  C2 -> (109.0, 128.50) -- left column, clear C27
  C3 -> (109.0, 131.00) -- left column
  R2 -> (129.50, 122.00) -- move right to clear R5
  R13 -> (126.00, 108.00) -- moved up, court B < Q1 T=109.75
  Q3 -> (136.50, 121.50) -- moved left so R < SW1 L=139.50
"""
import pcbnew, subprocess, os, re

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

# Only the components that need adjustment
FIXES = {
    "C1":  (109.00, 126.00, 0.0,  "F.Cu"),
    "C2":  (109.00, 128.50, 0.0,  "F.Cu"),
    "C3":  (109.00, 131.00, 0.0,  "F.Cu"),
    "R2":  (129.50, 122.00, 0.0,  "F.Cu"),
    "R13": (126.00, 108.00, 0.0,  "F.Cu"),
    "Q3":  (136.50, 121.50, 90.0, "F.Cu"),
}

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
    pcbnew.SaveBoard(BOARD_PATH, board)
    print("Saved incremental fixes.")

if __name__ == '__main__':
    apply()
    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_v4_Fix.txt")
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
        for vtype in ['shorting_items','clearance','solder_mask_bridge','courtyards_overlap']:
            if vtype in types:
                critical += types[vtype]
                print(f"\n  [{vtype}] ({types[vtype]}):")
                for block in re.findall(r'\['+vtype+r'\][^\[]+', content):
                    print(f"    {block.strip()[:250]}")
        print(f"\n  CRITICAL TOTAL: {critical}")
        if critical == 0:
            print("  >>> ZERO CRITICAL VIOLATIONS! Board is ready for autorouting. <<<")
