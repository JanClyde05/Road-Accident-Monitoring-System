import pcbnew

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"

board = pcbnew.LoadBoard(BOARD_PATH)

print("=== ALL VIAS ===")
vias = []
for track in board.GetTracks():
    if track.GetClass() == "PCB_VIA":
        pos = track.GetPosition()
        vx, vy = pcbnew.ToMM(pos.x), pcbnew.ToMM(pos.y)
        net = track.GetNetname()
        drill = pcbnew.ToMM(track.GetDrill())
        width = pcbnew.ToMM(track.GetWidth())
        vias.append((vx, vy, net, drill, width, track))

print(f"Total vias: {len(vias)}")
for vx, vy, net, drill, width, t in sorted(vias, key=lambda x: (x[2], x[0])):
    # Check connected tracks
    conn = 0
    for tr in board.GetTracks():
        if tr.GetClass() != "PCB_VIA":
            s = tr.GetStart()
            e = tr.GetEnd()
            if (abs(pcbnew.ToMM(s.x) - vx) < 0.01 and abs(pcbnew.ToMM(s.y) - vy) < 0.01) or \
               (abs(pcbnew.ToMM(e.x) - vx) < 0.01 and abs(pcbnew.ToMM(e.y) - vy) < 0.01):
                conn += 1
    print(f"  Via at ({vx:6.2f}, {vy:6.2f}) Net: {net:15s} d={drill:.2f} w={width:.2f} ConnTracks={conn}")

print("\n=== C12 INFO ===")
c12 = board.FindFootprintByReference('C12')
if c12:
    pos = c12.GetPosition()
    print(f"C12 pos: ({pcbnew.ToMM(pos.x):.2f}, {pcbnew.ToMM(pos.y):.2f})")
    for pad in c12.Pads():
        pp = pad.GetPosition()
        print(f"  Pad {pad.GetName()}: ({pcbnew.ToMM(pp.x):.2f}, {pcbnew.ToMM(pp.y):.2f}) Net: {pad.GetNetname()}")

print("\n=== ZONES ===")
for zone in board.Zones():
    layer = "F.Cu" if zone.GetLayer() == pcbnew.F_Cu else ("B.Cu" if zone.GetLayer() == pcbnew.B_Cu else str(zone.GetLayer()))
    print(f"Zone: Net={zone.GetNetname()} Layer={layer} Clearance={pcbnew.ToMM(zone.GetLocalClearance()):.3f} IsRuleArea={zone.GetIsRuleArea()}")
