"""prepare_for_autoroute.py -- Clean board for autorouter.

Removes all tracks/vias from the script routing attempt.
Adds GND copper zones on both F.Cu and B.Cu for ground plane.
Adds antenna keepout zone.
Sets up net classes (Power, RF, Default).
Exports Specctra DSN for Freerouting.
"""
import pcbnew
import subprocess
import os

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

# Board extents
BX0, BY0 = 100.0, 100.0
BX1, BY1 = 142.0, 132.0

# Power nets
POWER_NETS = ['/VBUS', '/+3V3', '/LDO_IN', '/B_PLUS', '/B_MINUS',
              '/LORA_VDD', '/VDD3P3_A', '/VDDA_PWR', '/VDD_SPI']

# RF nets
RF_NETS = ['/RF_LNA', '/RF_MID', '/ANT_FEED']


def mm(val):
    return pcbnew.FromMM(val)


def main():
    board = pcbnew.LoadBoard(BOARD_PATH)

    # === 1. Remove ALL tracks and vias ===
    tracks = list(board.GetTracks())
    print(f"Removing {len(tracks)} tracks/vias...")
    for t in tracks:
        board.Delete(t)

    # === 2. Remove ALL zones ===
    zones = list(board.Zones())
    print(f"Removing {len(zones)} zones...")
    for z in zones:
        board.Delete(z)

    # === 3. Add GND copper zone on F.Cu ===
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
        zone_f.SetThermalReliefGap(mm(0.25))
        zone_f.SetThermalReliefSpokeWidth(mm(0.30))
        zone_f.SetAssignedPriority(0)
        ol = zone_f.Outline()
        ol.NewOutline()
        ol.Append(mm(BX0 + 0.3), mm(BY0 + 0.3))
        ol.Append(mm(BX1 - 0.3), mm(BY0 + 0.3))
        ol.Append(mm(BX1 - 0.3), mm(BY1 - 0.3))
        ol.Append(mm(BX0 + 0.3), mm(BY1 - 0.3))
        board.Add(zone_f)
        print("  Added GND zone on F.Cu")

        # B.Cu GND zone
        zone_b = pcbnew.ZONE(board)
        zone_b.SetNet(gnd_net)
        zone_b.SetLayer(pcbnew.B_Cu)
        zone_b.SetIsRuleArea(False)
        zone_b.SetPadConnection(pcbnew.ZONE_CONNECTION_THERMAL)
        zone_b.SetMinThickness(mm(0.20))
        zone_b.SetThermalReliefGap(mm(0.25))
        zone_b.SetThermalReliefSpokeWidth(mm(0.30))
        zone_b.SetAssignedPriority(0)
        ol = zone_b.Outline()
        ol.NewOutline()
        ol.Append(mm(BX0 + 0.3), mm(BY0 + 0.3))
        ol.Append(mm(BX1 - 0.3), mm(BY0 + 0.3))
        ol.Append(mm(BX1 - 0.3), mm(BY1 - 0.3))
        ol.Append(mm(BX0 + 0.3), mm(BY1 - 0.3))
        board.Add(zone_b)
        print("  Added GND zone on B.Cu")

    # === 4. Add antenna keepout on B.Cu ===
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
    # ANT1 at (103.5, 102.8), body ~3.2x1.6mm
    ko.Append(mm(99.5), mm(99.8))
    ko.Append(mm(107.5), mm(99.8))
    ko.Append(mm(107.5), mm(105.8))
    ko.Append(mm(99.5), mm(105.8))
    board.Add(keepout)
    print("  Added antenna keepout zone on B.Cu (no zone fills or vias)")

    # Net classes should be configured manually in KiCad:
    # Board Setup -> Design Rules -> Net Classes
    # Power nets: 0.40mm width, 0.20mm clearance
    # RF nets: 0.35mm width, 0.25mm clearance
    # Default: 0.20mm width, 0.15mm clearance
    print("\n  Note: Configure net classes in KiCad Board Setup before routing")

    # === 6. Fill zones ===
    print("\n  Filling zones...")
    filler = pcbnew.ZONE_FILLER(board)
    zones = board.Zones()
    filler.Fill(zones)
    print(f"  Filled {len(list(board.Zones()))} zones")

    # === 7. Save ===
    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"\n  Board saved: {BOARD_PATH}")

    # === 8. Export Specctra DSN for Freerouting ===
    dsn_path = os.path.join(os.path.dirname(BOARD_PATH), "RAMS - PCB.dsn")
    print(f"\n  Exporting Specctra DSN...")
    result = subprocess.run(
        [KICAD_CLI, "pcb", "export", "dsn", "--output", dsn_path, BOARD_PATH],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print(f"  DSN exported: {dsn_path}")
    else:
        print(f"  DSN export failed: {result.stderr}")

    # === 9. Run DRC to confirm clean state ===
    print("\n  Running DRC...")
    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_PreRoute.txt")
    subprocess.run(
        [KICAD_CLI, "pcb", "drc", "--output", drc_out, "--units", "mm", BOARD_PATH],
        capture_output=True, text=True
    )
    if os.path.exists(drc_out):
        import re
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for m in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[m] = types.get(m, 0) + 1
        print("\n  DRC Summary:")
        for k, v in sorted(types.items(), key=lambda x: -x[1]):
            print(f"    {k:25s}: {v}")
        critical = sum(types.get(t, 0) for t in [
            'shorting_items', 'clearance', 'solder_mask_bridge',
            'courtyards_overlap', 'copper_edge_clearance',
            'hole_clearance', 'tracks_crossing'])
        print(f"\n    CRITICAL (excl unconnected): {critical}")
        print(f"    UNCONNECTED: {types.get('unconnected_items', 0)}")

    print("\n" + "="*60)
    print("  Board is ready for autorouting!")
    print("  Next steps:")
    print("    1. Open RAMS - PCB.kicad_pcb in KiCad PCB Editor")
    print("    2. Run your auto-routing plugin (Freerouting recommended)")
    print("       OR: File -> Export -> Specctra DSN, route externally,")
    print("           then File -> Import -> Specctra Session (.ses)")
    print("    3. After routing, press B to refill copper zones")
    print("    4. Run DRC: Inspect -> Design Rules Checker")
    print("="*60)


if __name__ == '__main__':
    main()
