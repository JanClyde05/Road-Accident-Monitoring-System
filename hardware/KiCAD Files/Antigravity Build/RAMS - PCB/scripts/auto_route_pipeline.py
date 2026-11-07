"""auto_route_pipeline.py -- Automated full routing pipeline for RAMS PCB.

1. Optimizes component channels:
   - Shifts C12, C13, C14 to X=108.80 (opens 3.75mm corridor for U1 pins 5, 6, 7)
   - Rotates R15, C29 by 180 deg to align VBAT_SENSE pads
2. Cleans out previous tracks/vias.
3. Recreates ground zones (F.Cu and B.Cu) and antenna keepout.
4. Exports Specctra DSN using pcbnew.
5. Invokes Freerouting v2.4.1 headless with JDK 25 and -mt 1.
6. Imports Specctra SES into board.
7. Adds GND stitching vias to connect any isolated ground pads directly to B.Cu plane.
8. Refills all copper zones.
9. Runs DRC and prints comprehensive audit report.
"""
import pcbnew
import subprocess
import os
import re

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
PRO_PATH   = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pro"
DSN_PATH   = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS_routed.dsn"
SES_PATH   = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS_routed.ses"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"
JAVA_EXE   = r"C:\Program Files\Java\jdk-25.0.4\bin\java.exe"
FREEROUTE_JAR = r"C:\Users\Jan Clyde Talosig\Documents\KiCad\10.0\3rdparty\plugins\app_freerouting_kicad-plugin\jar\freerouting-2.4.1.jar"

BX0, BY0 = 100.0, 100.0
BX1, BY1 = 142.0, 132.0


def mm(val):
    return pcbnew.FromMM(val)


def main():
    print("=== Step 1: Loading board and optimizing placement ===")
    board = pcbnew.LoadBoard(BOARD_PATH)

    # Clean existing tracks and vias
    tracks = list(board.GetTracks())
    print(f"  Removing {len(tracks)} tracks/vias...")
    for t in tracks:
        board.Delete(t)

    # Clean existing zones
    zones = list(board.Zones())
    print(f"  Removing {len(zones)} zones...")
    for z in zones:
        board.Delete(z)

    # Shift C12, C13, C14 westward to expand U1 escape channel
    for ref in ['C12', 'C13', 'C14']:
        fp = board.FindFootprintByReference(ref)
        if fp:
            pos = fp.GetPosition()
            new_x = mm(108.80)
            fp.SetPosition(pcbnew.VECTOR2I(new_x, pos.y))
            print(f"  Adjusted {ref} to X=108.80mm")

    # Rotate R15 and C29 to 180 deg to align VBAT_SENSE
    for ref in ['R15', 'C29']:
        fp = board.FindFootprintByReference(ref)
        if fp:
            fp.SetOrientation(pcbnew.EDA_ANGLE(180, pcbnew.DEGREES_T))
            print(f"  Rotated {ref} to 180 deg")

    # Recreate GND zones
    netinfo = board.GetNetInfo()
    gnd_net = None
    for n in netinfo.NetsByNetcode():
        ni = netinfo.GetNetItem(n)
        if ni.GetNetname() == '/GND':
            gnd_net = ni
            break

    if gnd_net:
        # F.Cu GND zone
        zone_f = pcbnew.ZONE(board)
        zone_f.SetNet(gnd_net)
        zone_f.SetLayer(pcbnew.F_Cu)
        zone_f.SetIsRuleArea(False)
        zone_f.SetPadConnection(pcbnew.ZONE_CONNECTION_THERMAL)
        zone_f.SetMinThickness(mm(0.20))
        zone_f.SetThermalReliefGap(mm(0.20))
        zone_f.SetThermalReliefSpokeWidth(mm(0.25))
        zone_f.SetAssignedPriority(0)
        ol = zone_f.Outline()
        ol.NewOutline()
        ol.Append(mm(BX0 + 0.3), mm(BY0 + 0.3))
        ol.Append(mm(BX1 - 0.3), mm(BY0 + 0.3))
        ol.Append(mm(BX1 - 0.3), mm(BY1 - 0.3))
        ol.Append(mm(BX0 + 0.3), mm(BY1 - 0.3))
        board.Add(zone_f)

        # B.Cu GND zone
        zone_b = pcbnew.ZONE(board)
        zone_b.SetNet(gnd_net)
        zone_b.SetLayer(pcbnew.B_Cu)
        zone_b.SetIsRuleArea(False)
        zone_b.SetPadConnection(pcbnew.ZONE_CONNECTION_THERMAL)
        zone_b.SetMinThickness(mm(0.20))
        zone_b.SetThermalReliefGap(mm(0.20))
        zone_b.SetThermalReliefSpokeWidth(mm(0.25))
        zone_b.SetAssignedPriority(0)
        ol = zone_b.Outline()
        ol.NewOutline()
        ol.Append(mm(BX0 + 0.3), mm(BY0 + 0.3))
        ol.Append(mm(BX1 - 0.3), mm(BY0 + 0.3))
        ol.Append(mm(BX1 - 0.3), mm(BY1 - 0.3))
        ol.Append(mm(BX0 + 0.3), mm(BY1 - 0.3))
        board.Add(zone_b)
        print("  Added GND zones on F.Cu and B.Cu")

    # Add Antenna keepout on B.Cu
    keepout = pcbnew.ZONE(board)
    keepout.SetIsRuleArea(True)
    keepout.SetDoNotAllowZoneFills(True)
    keepout.SetDoNotAllowTracks(False)
    keepout.SetDoNotAllowPads(False)
    keepout.SetDoNotAllowVias(True)
    keepout.SetDoNotAllowFootprints(False)
    keepout.SetLayer(pcbnew.B_Cu)
    ko = keepout.Outline()
    ko.NewOutline()
    ko.Append(mm(99.5), mm(99.8))
    ko.Append(mm(107.5), mm(99.8))
    ko.Append(mm(107.5), mm(105.8))
    ko.Append(mm(99.5), mm(105.8))
    board.Add(keepout)
    print("  Added antenna keepout on B.Cu")

    # Save board
    pcbnew.SaveBoard(BOARD_PATH, board)
    print("  Board prepped and saved.")

    # Export Specctra DSN
    print("\n=== Step 2: Exporting Specctra DSN ===")
    if os.path.exists(DSN_PATH):
        os.remove(DSN_PATH)
    res = pcbnew.ExportSpecctraDSN(board, DSN_PATH)
    print(f"  Export DSN success: {res} -> {DSN_PATH}")
    if not res or not os.path.exists(DSN_PATH):
        print("  FAILED to export DSN!")
        return

    # Run Freerouting
    print("\n=== Step 3: Running Freerouting headless ===")
    if os.path.exists(SES_PATH):
        os.remove(SES_PATH)

    cmd = [
        JAVA_EXE,
        "-Dgui.enabled=false",
        "-Djava.awt.headless=true",
        "-jar", FREEROUTE_JAR,
        "-de", DSN_PATH,
        "-do", SES_PATH,
        "-mp", "30",
        "-mt", "1",
        "-us", "Hybrid"
    ]
    print("  Command:", " ".join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(f"  Freerouting exit code: {res.returncode}")
    for line in res.stdout.splitlines():
        if "completed" in line.lower() or "score" in line.lower() or "unrouted" in line.lower() or "saved" in line.lower():
            print("   ", line.strip())

    if not os.path.exists(SES_PATH) or os.path.getsize(SES_PATH) == 0:
        print("  ERROR: Freerouting did not generate SES file!")
        return

    print(f"  SES generated successfully: {os.path.getsize(SES_PATH)} bytes")

    # Import SES into board
    print("\n=== Step 4: Importing SES into board ===")
    board = pcbnew.LoadBoard(BOARD_PATH)
    imp_res = pcbnew.ImportSpecctraSES(board, SES_PATH)
    print(f"  Import SES success: {imp_res}")

    # Step 5: Add GND vias for any isolated pads
    print("\n=== Step 5: Adding GND stitching vias ===")
    gnd_via_coords = [
        (103.5, 122.0),  # R7 GND
        (105.0, 124.0),  # U5 GND
        (107.8, 119.0),  # R15/C29 GND
        (135.5, 122.8),  # R5 GND
        (131.5, 117.0),  # C4 GND
        (121.8, 104.5),  # C25 GND
        (110.0, 117.0),  # C12/C13 GND
        (110.8, 120.0),  # C15/C23 GND
        (138.8, 129.5),  # Q3 GND
        # Perimeter shield stitching
        (101.5, 110.0), (101.5, 120.0), (101.5, 128.0),
        (140.5, 105.0), (140.5, 115.0), (140.5, 125.0),
        (120.0, 101.5), (130.0, 101.5), (110.0, 130.5), (130.0, 130.5)
    ]
    v_count = 0
    for vx, vy in gnd_via_coords:
        via = pcbnew.PCB_VIA(board)
        via.SetPosition(pcbnew.VECTOR2I(mm(vx), mm(vy)))
        via.SetWidth(mm(0.60))
        via.SetDrill(mm(0.30))
        via.SetViaType(pcbnew.VIATYPE_THROUGH)
        via.SetNet(gnd_net)
        via.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
        board.Add(via)
        v_count += 1
    print(f"  Added {v_count} GND stitching vias.")

    # Remove any dangling vias that Freerouting might have left
    # (vias not connected to any track)
    # Refill zones
    print("\n=== Step 6: Refilling copper zones ===")
    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    print("  Zones refilled.")

    # Save board
    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"  Saved final board: {BOARD_PATH}")

    # Run DRC
    print("\n=== Step 7: Running KiCad DRC ===")
    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_Final_Routed.txt")
    subprocess.run([KICAD_CLI, "pcb", "drc", "--output", drc_out, "--units", "mm", BOARD_PATH], capture_output=True, text=True)

    if os.path.exists(drc_out):
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for m in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[m] = types.get(m, 0) + 1
        print("\n  === DRC Summary ===")
        for k, v in sorted(types.items(), key=lambda x: -x[1]):
            print(f"    {k:25s}: {v}")

        critical = sum(types.get(t, 0) for t in [
            'shorting_items', 'clearance', 'solder_mask_bridge',
            'courtyards_overlap', 'copper_edge_clearance',
            'hole_clearance', 'track_width'])
        print(f"\n    CRITICAL ELECTRICAL VIOLATIONS: {critical}")
        print(f"    UNCONNECTED ITEMS: {types.get('unconnected_items', 0)}")


if __name__ == '__main__':
    main()
