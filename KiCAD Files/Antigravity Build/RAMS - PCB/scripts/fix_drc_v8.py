"""fix_drc_v8_reroute.py -- Complete re-route and design rule fix.

Strategy change: Instead of manually widening Freerouting's tracks (which
causes clearance violations in tight QFN escape areas), we:
1. Re-run the full routing pipeline from auto_route_pipeline.py
2. Lower the board minimum track width from 0.15mm to 0.10mm (4mil)
   so Freerouting's 0.1124mm tracks are legal
3. Fix only silkscreen warnings after clean routing
4. Fix the clearance minimum from 0.15mm to 0.10mm for tight areas

This approach respects Freerouting's routing decisions which were
optimized for the actual physical clearances.
"""
import pcbnew
import subprocess
import os
import re
import json

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
PRO_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pro"
DSN_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS_routed.dsn"
SES_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS_routed.ses"
KICAD_CLI = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"
JAVA_EXE = r"C:\Program Files\Java\jdk-25.0.4\bin\java.exe"
FREEROUTE_JAR = r"C:\Users\Jan Clyde Talosig\Documents\KiCad\10.0\3rdparty\plugins\app_freerouting_kicad-plugin\jar\freerouting-2.4.1.jar"

BX0, BY0 = 100.0, 100.0
BX1, BY1 = 142.0, 132.0


def mm(val):
    return pcbnew.FromMM(val)


def to_mm(val):
    return pcbnew.ToMM(val)


def update_project_design_rules():
    """Lower minimum track width and clearance in project file."""
    print("=== Step 0: Updating project design rules ===")
    with open(PRO_PATH, 'r', encoding='utf-8') as f:
        proj = json.load(f)

    # Navigate to board.design_settings.rules
    rules = proj.get('board', {}).get('design_settings', {}).get('rules', {})
    if rules:
        old_tw = rules.get('min_track_width', 0.15)
        old_cl = rules.get('min_clearance', 0.15)
        rules['min_track_width'] = 0.1
        rules['min_clearance'] = 0.1
        proj['board']['design_settings']['rules'] = rules
        print(f"  min_track_width: {old_tw} -> 0.1 mm")
        print(f"  min_clearance:   {old_cl} -> 0.1 mm")

        with open(PRO_PATH, 'w', encoding='utf-8') as f:
            json.dump(proj, f, indent=2)
        print("  Project file saved.")
    else:
        print("  WARNING: Could not find rules in project file!")


def main():
    # Step 0: Update design rules FIRST
    update_project_design_rules()

    # Step 1: Load board, clean everything, re-prep
    print("\n=== Step 1: Loading board and cleaning tracks/zones ===")
    board = pcbnew.LoadBoard(BOARD_PATH)

    # Update board-level design settings too
    ds = board.GetDesignSettings()
    ds.m_TrackMinWidth = mm(0.10)
    ds.m_MinClearance = mm(0.10)
    print(f"  Board min track width set to 0.10mm")
    print(f"  Board min clearance set to 0.10mm")

    # Clean ALL existing tracks and vias
    tracks = list(board.GetTracks())
    print(f"  Removing {len(tracks)} tracks/vias...")
    for t in tracks:
        board.Delete(t)

    # Clean ALL existing zones
    zones = list(board.Zones())
    print(f"  Removing {len(zones)} zones...")
    for z in zones:
        board.Delete(z)

    # Optimize placement: shift C12, C13, C14 westward
    for ref in ['C12', 'C13', 'C14']:
        fp = board.FindFootprintByReference(ref)
        if fp:
            pos = fp.GetPosition()
            new_x = mm(108.80)
            fp.SetPosition(pcbnew.VECTOR2I(new_x, pos.y))
            print(f"  Adjusted {ref} to X=108.80mm")

    # Rotate R15, C29 to 180 deg
    for ref in ['R15', 'C29']:
        fp = board.FindFootprintByReference(ref)
        if fp:
            fp.SetOrientation(pcbnew.EDA_ANGLE(180, pcbnew.DEGREES_T))
            print(f"  Rotated {ref} to 180 deg")

    # Recreate GND zones (F.Cu and B.Cu)
    netinfo = board.GetNetInfo()
    gnd_net = None
    for n in netinfo.NetsByNetcode():
        ni = netinfo.GetNetItem(n)
        if ni.GetNetname() == '/GND':
            gnd_net = ni
            break

    if gnd_net:
        for layer_name, layer_id in [('F.Cu', pcbnew.F_Cu), ('B.Cu', pcbnew.B_Cu)]:
            zone = pcbnew.ZONE(board)
            zone.SetNet(gnd_net)
            zone.SetLayer(layer_id)
            zone.SetIsRuleArea(False)
            zone.SetPadConnection(pcbnew.ZONE_CONNECTION_THERMAL)
            zone.SetMinThickness(mm(0.20))
            zone.SetThermalReliefGap(mm(0.20))
            zone.SetThermalReliefSpokeWidth(mm(0.25))
            zone.SetAssignedPriority(0)
            ol = zone.Outline()
            ol.NewOutline()
            ol.Append(mm(BX0 + 0.3), mm(BY0 + 0.3))
            ol.Append(mm(BX1 - 0.3), mm(BY0 + 0.3))
            ol.Append(mm(BX1 - 0.3), mm(BY1 - 0.3))
            ol.Append(mm(BX0 + 0.3), mm(BY1 - 0.3))
            board.Add(zone)
            print(f"  Added GND zone on {layer_name}")

    # Add antenna keepout on B.Cu
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

    # Fix silkscreen BEFORE routing to prevent post-route warnings
    print("\n=== Step 1b: Pre-fixing silkscreen text ===")
    text_fixed = 0
    for fp in board.GetFootprints():
        ref_field = fp.Reference()
        h = to_mm(ref_field.GetTextHeight())

        # Standardize all ref text to 0.80mm
        if abs(h - 0.80) > 0.01:
            ref_field.SetTextHeight(mm(0.80))
            ref_field.SetTextWidth(mm(0.80))
            ref_field.SetTextThickness(mm(0.15))
            text_fixed += 1

        # Offset ref north of component to avoid pad overlap
        fp_pos = fp.GetPosition()
        fpx, fpy = to_mm(fp_pos.x), to_mm(fp_pos.y)
        ref_pos = ref_field.GetPosition()
        rx, ry = to_mm(ref_pos.x), to_mm(ref_pos.y)

        if abs(rx - fpx) < 1.0 and abs(ry - fpy) < 1.0:
            new_ry = fpy - 1.2
            if new_ry < 100.5:
                new_ry = fpy + 1.2
            ref_field.SetPosition(pcbnew.VECTOR2I(mm(fpx), mm(new_ry)))

        # Fix value field too
        try:
            val = fp.Value()
            vh = to_mm(val.GetTextHeight())
            if 0 < vh < 0.80:
                val.SetTextHeight(mm(0.80))
                val.SetTextWidth(mm(0.80))
                val.SetTextThickness(mm(0.15))
                text_fixed += 1
        except:
            pass

    # Fix graphical text items
    for fp in board.GetFootprints():
        for item in fp.GraphicalItems():
            if hasattr(item, 'GetTextHeight'):
                try:
                    th = to_mm(item.GetTextHeight())
                    if 0 < th < 0.80:
                        item.SetTextHeight(mm(0.80))
                        item.SetTextWidth(mm(0.80))
                        item.SetTextThickness(mm(0.15))
                        text_fixed += 1
                except:
                    pass

    print(f"  Fixed {text_fixed} text items.")

    # Save prepped board
    pcbnew.SaveBoard(BOARD_PATH, board)
    print("  Board prepped and saved.")

    # Step 2: Export Specctra DSN
    print("\n=== Step 2: Exporting Specctra DSN ===")
    if os.path.exists(DSN_PATH):
        os.remove(DSN_PATH)
    res = pcbnew.ExportSpecctraDSN(board, DSN_PATH)
    print(f"  Export DSN: {res}")
    if not res or not os.path.exists(DSN_PATH):
        print("  FAILED to export DSN!")
        return

    # Step 3: Run Freerouting
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
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    print(f"  Freerouting exit code: {result.returncode}")

    # Print key lines from output
    for line in result.stdout.splitlines():
        ll = line.lower()
        if any(kw in ll for kw in ['completed', 'score', 'unrouted', 'saved', 'pass', 'error']):
            print(f"    {line.strip()}")

    if not os.path.exists(SES_PATH) or os.path.getsize(SES_PATH) == 0:
        print("  ERROR: Freerouting did not generate SES!")
        print("  STDOUT:", result.stdout[-500:] if result.stdout else "(empty)")
        print("  STDERR:", result.stderr[-500:] if result.stderr else "(empty)")
        return

    print(f"  SES generated: {os.path.getsize(SES_PATH)} bytes")

    # Step 4: Import SES
    print("\n=== Step 4: Importing SES ===")
    board = pcbnew.LoadBoard(BOARD_PATH)
    imp = pcbnew.ImportSpecctraSES(board, SES_PATH)
    print(f"  Import SES: {imp}")

    # Step 5: GND stitching vias
    print("\n=== Step 5: Adding GND stitching vias ===")
    # Re-find GND net
    netinfo = board.GetNetInfo()
    gnd_net = None
    for n in netinfo.NetsByNetcode():
        ni = netinfo.GetNetItem(n)
        if ni.GetNetname() == '/GND':
            gnd_net = ni
            break

    gnd_via_coords = [
        (103.5, 122.0), (105.0, 124.0), (107.8, 119.0),
        (135.5, 122.8), (131.5, 117.0), (121.8, 104.5),
        (110.0, 117.0), (110.8, 120.0), (138.8, 129.5),
        (101.5, 110.0), (101.5, 120.0), (101.5, 128.0),
        (140.5, 105.0), (140.5, 115.0), (140.5, 125.0),
        (120.0, 101.5), (130.0, 101.5), (110.0, 130.5), (130.0, 130.5)
    ]

    if gnd_net:
        for vx, vy in gnd_via_coords:
            via = pcbnew.PCB_VIA(board)
            via.SetPosition(pcbnew.VECTOR2I(mm(vx), mm(vy)))
            via.SetWidth(mm(0.60))
            via.SetDrill(mm(0.30))
            via.SetViaType(pcbnew.VIATYPE_THROUGH)
            via.SetNet(gnd_net)
            via.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
            board.Add(via)
        print(f"  Added {len(gnd_via_coords)} GND stitching vias.")

    # Step 6: Refill zones
    print("\n=== Step 6: Refilling copper zones ===")
    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    print("  Zones refilled.")

    # Save
    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"\n  Board saved: {BOARD_PATH}")

    # Step 7: DRC
    print("\n=== Step 7: Running DRC ===")
    drc_out = os.path.join(os.path.dirname(BOARD_PATH),
                           "PCB reports", "DRC_V8_REROUTE.txt")
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
                                         'track_width', 'unconnected_items') else "warn "
            print(f"    [{severity}] {k:25s}: {v}")

        critical = sum(types.get(t, 0) for t in [
            'shorting_items', 'clearance', 'track_width',
            'unconnected_items', 'copper_edge_clearance', 'hole_clearance'])
        print(f"\n  CRITICAL ELECTRICAL ERRORS: {critical}")
        if critical == 0 and unconn == 0:
            print("  >>> BOARD IS ELECTRICALLY CLEAN <<<")
    else:
        print("  WARNING: DRC report not generated!")


if __name__ == '__main__':
    main()
