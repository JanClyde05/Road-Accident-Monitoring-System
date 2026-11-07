"""fix_drc_and_models_v10.py -- Comprehensive fix for DRC & 3D models.

1. Updates Antenna Keepout on BOTH F.Cu and B.Cu (prevents RF detuning, fixes items_not_allowed)
2. Removes 7 orphaned non-GND vias (fixes 4 clearance, 2 hole_clearance, 6 dangling_via warnings)
3. Removes 2 GND vias at (115, 131) and (125, 131) that had clearance issues with /LDO_EN track
4. Connects C12 Pad 1 to track on F.Cu
5. Connects J1 Pad A12 to J1 Pad SH
6. Stitches isolated GND islands / pads to B.Cu ground plane
7. Remaps 3D models to valid standard KiCad 10 models (J1, BZ1, LED1)
8. Refills zones and runs DRC
"""
import pcbnew
import subprocess
import os
import re
import math

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

def mm(val):
    return pcbnew.FromMM(val)

def to_mm(val):
    return pcbnew.ToMM(val)

def main():
    board = pcbnew.LoadBoard(BOARD_PATH)
    netinfo = board.GetNetInfo()
    gnd_net = None
    for n in netinfo.NetsByNetcode():
        ni = netinfo.GetNetItem(n)
        if ni.GetNetname() == '/GND':
            gnd_net = ni
            break

    # =========================================================================
    # 1. ANTENNA KEEPOUT ZONE ON BOTH F.Cu AND B.Cu
    # =========================================================================
    print("=== 1. Updating Antenna Keepout Zone ===")
    # Remove existing keepout zones
    to_del_zones = []
    for zone in board.Zones():
        if zone.GetIsRuleArea():
            to_del_zones.append(zone)
    for z in to_del_zones:
        board.Delete(z)
    print(f"  Removed {len(to_del_zones)} old rule areas.")

    # Create new keepout on both F.Cu and B.Cu
    # Bounds: X from 100.0 to 105.8 mm, Y from 100.0 to 104.5 mm
    # (Covers ANT1 radiating body completely, leaves R10 clear, stops RF capacitive coupling)
    for layer, name in [(pcbnew.F_Cu, "F.Cu"), (pcbnew.B_Cu, "B.Cu")]:
        ko = pcbnew.ZONE(board)
        ko.SetIsRuleArea(True)
        ko.SetDoNotAllowZoneFills(True)
        ko.SetDoNotAllowVias(True)
        ko.SetDoNotAllowTracks(False)      # Allow 50-ohm RF feed track
        ko.SetDoNotAllowFootprints(False)  # Allow ANT1 footprint
        ko.SetDoNotAllowPads(False)        # Allow ANT1 pads
        ko.SetLayer(layer)
        ol = ko.Outline()
        ol.NewOutline()
        ol.Append(mm(100.0), mm(100.0))
        ol.Append(mm(105.8), mm(100.0))
        ol.Append(mm(105.8), mm(104.5))
        ol.Append(mm(100.0), mm(104.5))
        board.Add(ko)
        print(f"  Created antenna keepout on {name}")

    # =========================================================================
    # 2. REMOVE ORPHANED AND CONFLICTING VIAS
    # =========================================================================
    print("\n=== 2. Removing Orphaned & Conflicting Vias ===")
    # Orphaned non-GND vias with 0 connected tracks:
    orphans = [
        (138.80, 129.50), # /DW_OD
        (101.50, 110.00), # /MCU_EN
        (107.80, 119.00), # /MCU_EN
        (121.80, 104.50), # /+3V3
        (140.50, 125.00), # /LDO_EN
        (140.00, 118.00), # /LDO_EN
        (110.00, 130.50), # /LDO_EN
    ]
    # Conflicting GND vias:
    conflicting_gnd = [
        (102.00, 102.00), # inside antenna keepout
        (115.00, 131.00), # clearance with /LDO_EN track
        (125.00, 131.00), # clearance with /LDO_EN track
    ]

    vias_to_remove = []
    for track in board.GetTracks():
        if track.GetClass() == "PCB_VIA":
            p = track.GetPosition()
            vx, vy = to_mm(p.x), to_mm(p.y)
            for ox, oy in orphans:
                if abs(vx - ox) < 0.1 and abs(vy - oy) < 0.1:
                    vias_to_remove.append((track, f"Orphaned {track.GetNetname()} at ({vx:.2f}, {vy:.2f})"))
                    break
            for gx, gy in conflicting_gnd:
                if abs(vx - gx) < 0.1 and abs(vy - gy) < 0.1:
                    vias_to_remove.append((track, f"Conflicting GND via at ({vx:.2f}, {vy:.2f})"))
                    break

    for t, desc in vias_to_remove:
        print(f"  Removing: {desc}")
        board.Delete(t)

    # =========================================================================
    # 3. CONNECT C12 PAD 1 TO TRACK
    # =========================================================================
    print("\n=== 3. Connecting C12 Pad 1 ===")
    vdd3p3_a_net = None
    for n in netinfo.NetsByNetcode():
        ni = netinfo.GetNetItem(n)
        if ni.GetNetname() == '/VDD3P3_A':
            vdd3p3_a_net = ni
            break

    if vdd3p3_a_net:
        seg = pcbnew.PCB_TRACK(board)
        seg.SetStart(pcbnew.VECTOR2I(mm(108.32), mm(114.50)))
        seg.SetEnd(pcbnew.VECTOR2I(mm(108.92), mm(114.50)))
        seg.SetWidth(mm(0.15))
        seg.SetLayer(pcbnew.F_Cu)
        seg.SetNet(vdd3p3_a_net)
        board.Add(seg)
        print("  Added bridge track for C12 Pad 1 on F.Cu")

    # =========================================================================
    # 4. CONNECT J1 PAD A12 TO SHIELD (GND)
    # =========================================================================
    print("\n=== 4. Connecting J1 Pad A12 to Pad SH ===")
    if gnd_net:
        seg_j1 = pcbnew.PCB_TRACK(board)
        seg_j1.SetStart(pcbnew.VECTOR2I(mm(122.25), mm(124.455)))
        seg_j1.SetEnd(pcbnew.VECTOR2I(mm(123.32), mm(125.37)))
        seg_j1.SetWidth(mm(0.25))
        seg_j1.SetLayer(pcbnew.F_Cu)
        seg_j1.SetNet(gnd_net)
        board.Add(seg_j1)
        print("  Added bridge track for J1 Pad A12 -> Pad SH on F.Cu")

    # =========================================================================
    # 5. CONNECT ISOLATED GND ISLANDS / PADS
    # =========================================================================
    print("\n=== 5. Connecting Isolated GND Islands ===")
    # Connect R15 pad 2 (105.99, 119.00) to C29 pad 2 (106.02, 121.00)
    # Both are /GND on F.Cu, straight vertical distance is only 2.0mm!
    # Let's check if (105.99, 119.0) -> (106.02, 121.0) is clear on F.Cu:
    # Actually, R15.2 (105.99, 119.0) can have a via placed at (105.4, 119.2) or track
    if gnd_net:
        # Connect R15 Pad 2 to C29 Pad 2
        t_r15 = pcbnew.PCB_TRACK(board)
        t_r15.SetStart(pcbnew.VECTOR2I(mm(105.99), mm(119.00)))
        t_r15.SetEnd(pcbnew.VECTOR2I(mm(106.02), mm(121.00)))
        t_r15.SetWidth(mm(0.20))
        t_r15.SetLayer(pcbnew.F_Cu)
        t_r15.SetNet(gnd_net)
        board.Add(t_r15)
        print("  Connected R15.2 -> C29.2 on F.Cu")

        # C11 Pad 2 is at (107.00, 111.72). Let's place a GND via nearby at (106.50, 110.20)
        # or connect to nearby ground via
        via_c11 = pcbnew.PCB_VIA(board)
        via_c11.SetPosition(pcbnew.VECTOR2I(mm(106.80), mm(110.80)))
        via_c11.SetWidth(mm(0.50))
        via_c11.SetDrill(mm(0.25))
        via_c11.SetViaType(pcbnew.VIATYPE_THROUGH)
        via_c11.SetNet(gnd_net)
        board.Add(via_c11)

        t_c11 = pcbnew.PCB_TRACK(board)
        t_c11.SetStart(pcbnew.VECTOR2I(mm(107.00), mm(111.72)))
        t_c11.SetEnd(pcbnew.VECTOR2I(mm(106.80), mm(110.80)))
        t_c11.SetWidth(mm(0.20))
        t_c11.SetLayer(pcbnew.F_Cu)
        t_c11.SetNet(gnd_net)
        board.Add(t_c11)
        print("  Connected C11.2 to GND via at (106.80, 110.80)")

        # C28 Pad 2 is at (117.50, 119.02) and D1 Pad 2 is at (119.36, 120.80).
        # Let's connect D1.2 (119.36, 120.80) to C28.2 (117.50, 119.02) and place a GND via at (118.5, 120.0)
        via_d1 = pcbnew.PCB_VIA(board)
        via_d1.SetPosition(pcbnew.VECTOR2I(mm(118.80), mm(120.80)))
        via_d1.SetWidth(mm(0.50))
        via_d1.SetDrill(mm(0.25))
        via_d1.SetViaType(pcbnew.VIATYPE_THROUGH)
        via_d1.SetNet(gnd_net)
        board.Add(via_d1)

        t_d1 = pcbnew.PCB_TRACK(board)
        t_d1.SetStart(pcbnew.VECTOR2I(mm(119.36), mm(120.80)))
        t_d1.SetEnd(pcbnew.VECTOR2I(mm(118.80), mm(120.80)))
        t_d1.SetWidth(mm(0.20))
        t_d1.SetLayer(pcbnew.F_Cu)
        t_d1.SetNet(gnd_net)
        board.Add(t_d1)

        t_c28 = pcbnew.PCB_TRACK(board)
        t_c28.SetStart(pcbnew.VECTOR2I(mm(117.50), mm(119.02)))
        t_c28.SetEnd(pcbnew.VECTOR2I(mm(118.80), mm(120.80)))
        t_c28.SetWidth(mm(0.15))
        t_c28.SetLayer(pcbnew.F_Cu)
        t_c28.SetNet(gnd_net)
        board.Add(t_c28)
        print("  Connected D1.2 and C28.2 to GND via at (118.80, 120.80)")

    # =========================================================================
    # 6. UPDATE 3D MODELS
    # =========================================================================
    print("\n=== 6. Updating 3D Models ===")
    # J1: USB-C 16-pin receptacle
    j1 = board.FindFootprintByReference('J1')
    if j1:
        # Clear existing models and add valid KiCad 10 model
        while len(j1.Models()) > 0:
            j1.Models().pop()
        m = pcbnew.FP_3DMODEL()
        m.m_Filename = "${KICAD10_3DMODEL_DIR}/Connector_USB.3dshapes/USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal.step"
        j1.Models().append(m)
        print("  J1: Assigned USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal.step")

    # BZ1: SMD Buzzer
    bz1 = board.FindFootprintByReference('BZ1')
    if bz1:
        while len(bz1.Models()) > 0:
            bz1.Models().pop()
        m = pcbnew.FP_3DMODEL()
        m.m_Filename = "${KICAD10_3DMODEL_DIR}/Buzzer_Beeper.3dshapes/MagneticBuzzer_CUI_CST-931RP-A.step"
        bz1.Models().append(m)
        print("  BZ1: Assigned MagneticBuzzer_CUI_CST-931RP-A.step")

    # LED1: SK6805 SMD RGB LED
    led1 = board.FindFootprintByReference('LED1')
    if led1:
        while len(led1.Models()) > 0:
            led1.Models().pop()
        m = pcbnew.FP_3DMODEL()
        m.m_Filename = "${KICAD10_3DMODEL_DIR}/LED_SMD.3dshapes/LED_SK6812MINI-E_3.2x2.8mm_P1.5mm_ReverseMount.step"
        led1.Models().append(m)
        print("  LED1: Assigned LED_SK6812MINI-E_3.2x2.8mm_P1.5mm_ReverseMount.step")

    # U2: Ra-01 LoRa module
    u2 = board.FindFootprintByReference('U2')
    if u2:
        while len(u2.Models()) > 0:
            u2.Models().pop()
        m = pcbnew.FP_3DMODEL()
        m.m_Filename = "${KIPRJMOD}/3dmodels/Ai-Thinker-Ra-01-LoRa.step"
        u2.Models().append(m)
        print("  U2: Assigned ${KIPRJMOD}/3dmodels/Ai-Thinker-Ra-01-LoRa.step")

    # =========================================================================
    # 7. REFILL COPPER ZONES
    # =========================================================================
    print("\n=== 7. Refilling copper zones ===")
    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    print("  Zones filled successfully.")

    # Save board
    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"\n  Board saved: {BOARD_PATH}")

    # =========================================================================
    # 8. RUN DRC
    # =========================================================================
    print("\n=== 8. Running DRC ===")
    drc_out = os.path.join(os.path.dirname(BOARD_PATH), "PCB reports", "DRC_V10_POSTROUTE.txt")
    subprocess.run([KICAD_CLI, "pcb", "drc", "--output", drc_out, "--units", "mm", BOARD_PATH],
                   capture_output=True, text=True)

    if os.path.exists(drc_out):
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for match in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[match] = types.get(match, 0) + 1

        unconn = re.search(r'Found (\d+) unconnected pads', content)
        unconn = int(unconn.group(1)) if unconn else -1
        total = re.search(r'Found (\d+) DRC violations', content)
        total = int(total.group(1)) if total else -1

        print(f"\n  === DRC RESULTS V10 ===")
        print(f"  Total violations: {total}")
        print(f"  Unconnected pads: {unconn}")
        for k, v in sorted(types.items(), key=lambda x: -x[1]):
            sev = "ERROR" if k in ('shorting_items', 'clearance', 'track_width',
                                   'unconnected_items', 'copper_edge_clearance',
                                   'hole_clearance') else "warn "
            print(f"    [{sev}] {k:25s}: {v}")

        critical = sum(types.get(t, 0) for t in [
            'shorting_items', 'clearance', 'track_width',
            'unconnected_items', 'copper_edge_clearance', 'hole_clearance'])
        print(f"\n  CRITICAL ELECTRICAL ERRORS: {critical}")
        if critical == 0 and unconn == 0:
            print("  >>> BOARD IS 100% ELECTRICALLY CLEAN! <<<")

if __name__ == '__main__':
    main()
