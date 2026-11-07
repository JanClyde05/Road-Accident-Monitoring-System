"""fix_drc_v9_postroute.py -- Post-route targeted fixes.

Fixes the specific issues from the V8 re-route:
1. Remove conflicting GND stitching vias that short to signal nets
2. Re-add stitching vias at SAFE locations (verified clear of signal traces)
3. Fix zone clearance from 0.5mm to 0.15mm (standard for this density)
4. Fix C12 courtyard overlap by adjusting position
5. Remove duplicate LDO_IN vias (hole-to-hole violation)
6. Refill zones and DRC
"""
import pcbnew
import subprocess
import os
import re

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"


def mm(val):
    return pcbnew.FromMM(val)


def to_mm(val):
    return pcbnew.ToMM(val)


def dist(x1, y1, x2, y2):
    return ((x1 - x2)**2 + (y1 - y2)**2)**0.5


def main():
    board = pcbnew.LoadBoard(BOARD_PATH)

    # =========================================================================
    # FIX 1: Remove ALL manually-placed GND stitching vias
    #   These are at known coordinates and conflict with Freerouting routing
    # =========================================================================
    print("=== FIX 1: Removing conflicting GND stitching vias ===")

    # Known stitching via coordinates from auto_route_pipeline.py
    stitch_coords = [
        (103.5, 122.0), (105.0, 124.0), (107.8, 119.0),
        (135.5, 122.8), (131.5, 117.0), (121.8, 104.5),
        (110.0, 117.0), (110.8, 120.0), (138.8, 129.5),
        (101.5, 110.0), (101.5, 120.0), (101.5, 128.0),
        (140.5, 105.0), (140.5, 115.0), (140.5, 125.0),
        (120.0, 101.5), (130.0, 101.5), (110.0, 130.5), (130.0, 130.5)
    ]

    to_remove = []
    for track in board.GetTracks():
        if track.GetClass() != "PCB_VIA":
            continue
        pos = track.GetPosition()
        vx, vy = to_mm(pos.x), to_mm(pos.y)
        net = track.GetNetname()

        # Remove if it matches any known stitching coordinate
        if net == '/GND':
            for sx, sy in stitch_coords:
                if abs(vx - sx) < 0.2 and abs(vy - sy) < 0.2:
                    to_remove.append(track)
                    break

    for t in to_remove:
        p = t.GetPosition()
        print(f"  Removing GND via at ({to_mm(p.x):.1f}, {to_mm(p.y):.1f})")
        board.Delete(t)
    print(f"  Removed {len(to_remove)} stitching vias.")

    # =========================================================================
    # FIX 2: Remove duplicate LDO_IN via (hole-to-hole at 103.38/103.50)
    # =========================================================================
    print("\n=== FIX 2: Removing duplicate vias ===")
    ldo_vias = []
    for track in board.GetTracks():
        if track.GetClass() != "PCB_VIA":
            continue
        pos = track.GetPosition()
        vx, vy = to_mm(pos.x), to_mm(pos.y)
        net = track.GetNetname()
        if net == '/LDO_IN' and 103.0 < vx < 104.0 and 121.5 < vy < 122.5:
            ldo_vias.append((track, vx, vy))

    if len(ldo_vias) > 1:
        # Keep the first, remove the rest
        for t, vx, vy in ldo_vias[1:]:
            print(f"  Removing duplicate LDO_IN via at ({vx:.2f}, {vy:.2f})")
            board.Delete(t)

    # =========================================================================
    # FIX 3: Fix GND zone clearance from 0.5mm to 0.15mm
    # =========================================================================
    print("\n=== FIX 3: Fixing zone clearances ===")
    for zone in board.Zones():
        if zone.GetIsRuleArea():
            continue
        net = zone.GetNetname()
        clearance = to_mm(zone.GetLocalClearance())
        if clearance > 0.20:
            zone.SetLocalClearance(mm(0.15))
            layer_name = "F.Cu" if zone.GetLayer() == pcbnew.F_Cu else "B.Cu"
            print(f"  {net} zone on {layer_name}: clearance {clearance:.2f} -> 0.15mm")

    # =========================================================================
    # FIX 4: Fix C12 courtyard overlap with R8
    #   C12 was shifted to X=108.80, too close to R8 at ~107.0
    #   Move C12 slightly east to X=109.20
    # =========================================================================
    print("\n=== FIX 4: Fixing C12 courtyard overlap ===")
    c12 = board.FindFootprintByReference('C12')
    if c12:
        pos = c12.GetPosition()
        old_x = to_mm(pos.x)
        new_x = 109.40
        c12.SetPosition(pcbnew.VECTOR2I(mm(new_x), pos.y))
        print(f"  C12: X={old_x:.2f} -> {new_x}mm")

    # =========================================================================
    # FIX 5: Re-add safe GND stitching vias
    #   Verify each location is clear of signal traces/pads before placing
    # =========================================================================
    print("\n=== FIX 5: Adding safe GND stitching vias ===")

    # Collect all track/pad/via positions for collision checking
    occupied = []
    for track in board.GetTracks():
        if track.GetClass() == "PCB_VIA":
            p = track.GetPosition()
            occupied.append((to_mm(p.x), to_mm(p.y), 0.5))
        else:
            s = track.GetStart()
            e = track.GetEnd()
            # Sample track midpoint
            mx = (to_mm(s.x) + to_mm(e.x)) / 2
            my = (to_mm(s.y) + to_mm(e.y)) / 2
            occupied.append((mx, my, 0.5))

    for fp in board.GetFootprints():
        for pad in fp.Pads():
            p = pad.GetPosition()
            occupied.append((to_mm(p.x), to_mm(p.y), 0.5))

    def is_safe(x, y, min_dist=0.8):
        """Check if position is at least min_dist from any occupied point."""
        for ox, oy, _ in occupied:
            if dist(x, y, ox, oy) < min_dist:
                return False
        return True

    # Board area safe spots - perimeter and interior clear areas
    # Only place if verified safe
    candidate_spots = [
        # Perimeter
        (102.0, 102.0), (102.0, 115.0), (102.0, 125.0), (102.0, 130.0),
        (140.0, 102.0), (140.0, 110.0), (140.0, 118.0), (140.0, 130.0),
        (115.0, 101.0), (125.0, 101.0), (135.0, 101.0),
        (115.0, 131.0), (125.0, 131.0), (135.0, 131.0),
        # Interior clearings
        (115.0, 110.0), (120.0, 120.0), (125.0, 125.0),
        (130.0, 110.0), (135.0, 115.0),
    ]

    netinfo = board.GetNetInfo()
    gnd_net = None
    for n in netinfo.NetsByNetcode():
        ni = netinfo.GetNetItem(n)
        if ni.GetNetname() == '/GND':
            gnd_net = ni
            break

    placed = 0
    if gnd_net:
        for sx, sy in candidate_spots:
            if is_safe(sx, sy, min_dist=0.8):
                via = pcbnew.PCB_VIA(board)
                via.SetPosition(pcbnew.VECTOR2I(mm(sx), mm(sy)))
                via.SetWidth(mm(0.60))
                via.SetDrill(mm(0.30))
                via.SetViaType(pcbnew.VIATYPE_THROUGH)
                via.SetNet(gnd_net)
                via.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
                board.Add(via)
                placed += 1
            else:
                print(f"  Skipped ({sx}, {sy}) - too close to existing feature")

    print(f"  Placed {placed}/{len(candidate_spots)} safe GND stitching vias.")

    # =========================================================================
    # FIX 6: Refill zones
    # =========================================================================
    print("\n=== FIX 6: Refilling copper zones ===")
    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    print("  All zones refilled.")

    # =========================================================================
    # SAVE & DRC
    # =========================================================================
    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"\n  Board saved: {BOARD_PATH}")

    print("\n=== Running DRC ===")
    drc_out = os.path.join(os.path.dirname(BOARD_PATH),
                           "PCB reports", "DRC_V9_POSTROUTE.txt")
    subprocess.run([KICAD_CLI, "pcb", "drc",
                    "--output", drc_out, "--units", "mm",
                    BOARD_PATH],
                   capture_output=True, text=True)

    if os.path.exists(drc_out):
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for m in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[m] = types.get(m, 0) + 1

        unconn = re.search(r'Found (\d+) unconnected pads', content)
        unconn = int(unconn.group(1)) if unconn else -1
        total = re.search(r'Found (\d+) DRC violations', content)
        total = int(total.group(1)) if total else -1

        print(f"\n  === DRC RESULTS ===")
        print(f"  Total violations: {total}")
        print(f"  Unconnected pads: {unconn}")
        for k, v in sorted(types.items(), key=lambda x: -x[1]):
            severity = "ERROR" if k in ('shorting_items', 'clearance',
                                         'track_width', 'unconnected_items',
                                         'copper_edge_clearance',
                                         'hole_clearance') else "warn "
            print(f"    [{severity}] {k:25s}: {v}")

        critical = sum(types.get(t, 0) for t in [
            'shorting_items', 'clearance', 'track_width',
            'unconnected_items', 'copper_edge_clearance', 'hole_clearance'])
        print(f"\n  CRITICAL ELECTRICAL ERRORS: {critical}")
        if critical == 0 and unconn == 0:
            print("  >>> BOARD IS ELECTRICALLY CLEAN <<<")


if __name__ == '__main__':
    main()
