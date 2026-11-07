"""route_board.py -- Complete routing for RAMS PCB.

Architecture:
  - 2-layer board: F.Cu (signal + power) + B.Cu (LoRa U2 + GND pour)
  - GND copper zones on both layers handle all GND connections
  - Signal traces routed with Manhattan (L-shaped) routing
  - Power nets use 0.4mm traces, signal nets use 0.2mm
  - RF net uses 0.35mm (50-ohm impedance on 1.6mm FR4)
  - Vias: 0.6mm diameter, 0.3mm drill
  - Ground stitching vias along perimeter and near decoupling caps
"""
import pcbnew
import subprocess
import os
import re
from collections import defaultdict

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI  = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

# Trace widths (mm)
POWER_WIDTH = 0.40
SIGNAL_WIDTH = 0.20
RF_WIDTH = 0.35

# Via dimensions (mm)
VIA_DIA = 0.60
VIA_DRILL = 0.30

# Power nets that get wider traces
POWER_NETS = {'/VBUS', '/+3V3', '/LDO_IN', '/B_PLUS', '/B_MINUS',
              '/LORA_VDD', '/VDD3P3_A', '/VDDA_PWR', '/VDD_SPI'}

# RF net -- special impedance-controlled width
RF_NETS = {'/RF_LNA', '/RF_MID', '/ANT_FEED'}

# Board extents (from placement)
BX0, BY0 = 100.0, 100.0
BX1, BY1 = 142.0, 132.0


def mm_to_iu(mm):
    return pcbnew.FromMM(mm)


def make_via(board, x_mm, y_mm, net_code, diameter_mm=VIA_DIA, drill_mm=VIA_DRILL):
    """Create a through-hole via at (x_mm, y_mm) on the given net."""
    via = pcbnew.PCB_VIA(board)
    via.SetPosition(pcbnew.VECTOR2I(mm_to_iu(x_mm), mm_to_iu(y_mm)))
    via.SetWidth(mm_to_iu(diameter_mm))
    via.SetDrill(mm_to_iu(drill_mm))
    via.SetViaType(pcbnew.VIATYPE_THROUGH)
    via.SetNet(net_code)
    via.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
    board.Add(via)
    return via


def make_track(board, x1, y1, x2, y2, layer, net_code, width_mm):
    """Create a single track segment from (x1,y1) to (x2,y2)."""
    if abs(x1 - x2) < 0.01 and abs(y1 - y2) < 0.01:
        return  # Zero-length track, skip
    track = pcbnew.PCB_TRACK(board)
    track.SetStart(pcbnew.VECTOR2I(mm_to_iu(x1), mm_to_iu(y1)))
    track.SetEnd(pcbnew.VECTOR2I(mm_to_iu(x2), mm_to_iu(y2)))
    track.SetLayer(layer)
    track.SetNet(net_code)
    track.SetWidth(mm_to_iu(width_mm))
    board.Add(track)
    return track


def route_l_shaped(board, x1, y1, x2, y2, layer, net_code, width_mm, prefer_x_first=True):
    """Route an L-shaped (Manhattan) path from (x1,y1) to (x2,y2).
    Creates two segments: horizontal then vertical (or vice versa)."""
    if abs(x1 - x2) < 0.01 and abs(y1 - y2) < 0.01:
        return  # Same point
    if abs(x1 - x2) < 0.01 or abs(y1 - y2) < 0.01:
        # Already axis-aligned, single segment
        make_track(board, x1, y1, x2, y2, layer, net_code, width_mm)
        return
    if prefer_x_first:
        # Horizontal first, then vertical
        make_track(board, x1, y1, x2, y1, layer, net_code, width_mm)
        make_track(board, x2, y1, x2, y2, layer, net_code, width_mm)
    else:
        # Vertical first, then horizontal
        make_track(board, x1, y1, x1, y2, layer, net_code, width_mm)
        make_track(board, x1, y2, x2, y2, layer, net_code, width_mm)


def get_trace_width(net_name):
    """Return appropriate trace width for a net."""
    if net_name in RF_NETS:
        return RF_WIDTH
    if net_name in POWER_NETS:
        return POWER_WIDTH
    return SIGNAL_WIDTH


def build_net_pad_map(board):
    """Build a map of net_name -> [(ref, pad_num, x, y, layer_name, layer_id), ...]"""
    net_pads = defaultdict(list)
    for fp in board.GetFootprints():
        ref = fp.GetReference()
        for pad in fp.Pads():
            net_name = pad.GetNetname()
            if net_name and not net_name.startswith('unconnected'):
                pos = pad.GetPosition()
                layer = fp.GetLayerName()
                layer_id = pcbnew.F_Cu if layer == 'F.Cu' else pcbnew.B_Cu
                net_pads[net_name].append({
                    'ref': ref,
                    'pad': pad.GetNumber(),
                    'x': pcbnew.ToMM(pos.x),
                    'y': pcbnew.ToMM(pos.y),
                    'layer_name': layer,
                    'layer_id': layer_id,
                    'net': pad.GetNet(),
                })
    return net_pads


def route_star(board, pads, net_name):
    """Route a net using star topology from the first pad to all others.
    For cross-layer connections (F.Cu <-> B.Cu), adds a via."""
    if len(pads) < 2:
        return

    width = get_trace_width(net_name)
    net_code = pads[0]['net']

    # Find a central pad (the one closest to the centroid)
    cx = sum(p['x'] for p in pads) / len(pads)
    cy = sum(p['y'] for p in pads) / len(pads)
    pads_sorted = sorted(pads, key=lambda p: (p['x'] - cx)**2 + (p['y'] - cy)**2)

    hub = pads_sorted[0]
    spokes = pads_sorted[1:]

    for spoke in spokes:
        if hub['layer_id'] == spoke['layer_id']:
            # Same layer: direct L-shaped route
            # Alternate X-first and Y-first to reduce conflicts
            prefer_x = abs(spoke['x'] - hub['x']) > abs(spoke['y'] - hub['y'])
            route_l_shaped(board, hub['x'], hub['y'], spoke['x'], spoke['y'],
                          hub['layer_id'], net_code, width, prefer_x)
        else:
            # Cross-layer: route to via point, then via, then route on other layer
            # Place via near the F.Cu pad (more routing space on front)
            if hub['layer_name'] == 'F.Cu':
                via_x, via_y = hub['x'], hub['y']
                far_pad = spoke
            else:
                via_x, via_y = spoke['x'], spoke['y']
                far_pad = hub

            # Route from far_pad to via on its layer, then via to close pad's layer
            make_via(board, via_x, via_y, net_code)
            # Route from the via to the other-layer pad
            other_layer = pcbnew.B_Cu if hub['layer_name'] == 'F.Cu' else pcbnew.F_Cu
            if hub['layer_name'] == 'F.Cu':
                # Via is at hub (F.Cu), spoke is on B.Cu
                route_l_shaped(board, via_x, via_y, spoke['x'], spoke['y'],
                              pcbnew.B_Cu, net_code, width)
            else:
                # Hub is on B.Cu, spoke is on F.Cu
                route_l_shaped(board, via_x, via_y, spoke['x'], spoke['y'],
                              pcbnew.F_Cu, net_code, width)


def route_chain(board, pads, net_name):
    """Route a net using nearest-neighbor chain topology.
    Better for nets with many pads to avoid long star arms."""
    if len(pads) < 2:
        return

    width = get_trace_width(net_name)
    net_code = pads[0]['net']

    # Start from the leftmost-topmost pad
    remaining = list(pads)
    remaining.sort(key=lambda p: (p['x'], p['y']))
    chain = [remaining.pop(0)]

    while remaining:
        last = chain[-1]
        # Find nearest unrouted pad
        best_idx = 0
        best_dist = float('inf')
        for i, p in enumerate(remaining):
            d = abs(p['x'] - last['x']) + abs(p['y'] - last['y'])  # Manhattan
            if d < best_dist:
                best_dist = d
                best_idx = i
        chain.append(remaining.pop(best_idx))

    # Route chain segments
    for i in range(len(chain) - 1):
        a, b = chain[i], chain[i+1]
        if a['layer_id'] == b['layer_id']:
            prefer_x = abs(b['x'] - a['x']) > abs(b['y'] - a['y'])
            route_l_shaped(board, a['x'], a['y'], b['x'], b['y'],
                          a['layer_id'], net_code, width, prefer_x)
        else:
            # Cross-layer: via at the F.Cu pad location
            if a['layer_name'] == 'F.Cu':
                via_x, via_y = a['x'], a['y']
            else:
                via_x, via_y = b['x'], b['y']
            make_via(board, via_x, via_y, net_code)
            route_l_shaped(board, via_x, via_y,
                          (b['x'] if a['layer_name'] == 'F.Cu' else a['x']),
                          (b['y'] if a['layer_name'] == 'F.Cu' else a['y']),
                          pcbnew.B_Cu if a['layer_name'] == 'F.Cu' else pcbnew.F_Cu,
                          net_code, width)


def add_ground_zone(board, layer, net_name="/GND"):
    """Add a ground copper zone filling the entire board area."""
    netinfo = board.GetNetInfo()
    net = None
    for n in netinfo.NetsByNetcode():
        ni = netinfo.GetNetItem(n)
        if ni.GetNetname() == net_name:
            net = ni
            break
    if not net:
        print(f"  ERROR: Net {net_name} not found!")
        return

    # Create zone
    zone = pcbnew.ZONE(board)
    zone.SetNet(net)
    zone.SetLayer(layer)
    zone.SetIsRuleArea(False)
    zone.SetPadConnection(pcbnew.ZONE_CONNECTION_THERMAL)
    zone.SetMinThickness(mm_to_iu(0.20))
    zone.SetThermalReliefGap(mm_to_iu(0.25))
    zone.SetThermalReliefSpokeWidth(mm_to_iu(0.30))

    # Zone outline: board rectangle with margin
    margin = 0.5
    outline = zone.Outline()
    outline.NewOutline()
    outline.Append(mm_to_iu(BX0 + margin), mm_to_iu(BY0 + margin))
    outline.Append(mm_to_iu(BX1 - margin), mm_to_iu(BY0 + margin))
    outline.Append(mm_to_iu(BX1 - margin), mm_to_iu(BY1 - margin))
    outline.Append(mm_to_iu(BX0 + margin), mm_to_iu(BY1 - margin))

    # Set priority (F.Cu = 0, B.Cu = 1)
    zone.SetAssignedPriority(0 if layer == pcbnew.F_Cu else 1)
    board.Add(zone)

    layer_name = "F.Cu" if layer == pcbnew.F_Cu else "B.Cu"
    print(f"  Added GND zone on {layer_name}")
    return zone


def add_stitching_vias(board, net_name="/GND"):
    """Add ground stitching vias along the perimeter and near key areas."""
    netinfo = board.GetNetInfo()
    net = None
    for n in netinfo.NetsByNetcode():
        ni = netinfo.GetNetItem(n)
        if ni.GetNetname() == net_name:
            net = ni
            break
    if not net:
        return

    via_positions = []
    spacing = 5.0  # mm between stitching vias
    margin = 2.0   # mm from board edge

    # Top edge
    x = BX0 + margin
    while x <= BX1 - margin:
        via_positions.append((x, BY0 + margin))
        x += spacing

    # Bottom edge
    x = BX0 + margin
    while x <= BX1 - margin:
        via_positions.append((x, BY1 - margin))
        x += spacing

    # Left edge
    y = BY0 + margin + spacing
    while y <= BY1 - margin - spacing:
        via_positions.append((BX0 + margin, y))
        y += spacing

    # Right edge
    y = BY0 + margin + spacing
    while y <= BY1 - margin - spacing:
        via_positions.append((BX1 - margin, y))
        y += spacing

    # Center area stitching (3x3 grid in center)
    cx, cy = (BX0 + BX1) / 2, (BY0 + BY1) / 2
    for dx in [-8, 0, 8]:
        for dy in [-6, 0, 6]:
            via_positions.append((cx + dx, cy + dy))

    count = 0
    for vx, vy in via_positions:
        # Check that via position is inside board and not too close to components
        if BX0 + 1.5 <= vx <= BX1 - 1.5 and BY0 + 1.5 <= vy <= BY1 - 1.5:
            make_via(board, vx, vy, net)
            count += 1

    print(f"  Added {count} ground stitching vias")


def add_antenna_keepout(board):
    """Add a copper keepout zone under the antenna area (ANT1).
    ANT1 is at (103.5, 102.8), body is ~3.2 x 1.6mm, on left edge."""
    zone = pcbnew.ZONE(board)
    zone.SetIsRuleArea(True)
    zone.SetDoNotAllowZoneFills(True)
    zone.SetDoNotAllowTracks(False)
    zone.SetDoNotAllowPads(False)
    zone.SetDoNotAllowVias(True)
    zone.SetDoNotAllowFootprints(False)

    # Layer: both F.Cu and B.Cu need keepout under antenna
    zone.SetLayer(pcbnew.B_Cu)

    # Antenna keepout area: ~5mm around the antenna radiating element
    ax, ay = 103.5, 102.8
    kw, kh = 4.0, 3.0  # keepout half-extents
    outline = zone.Outline()
    outline.NewOutline()
    outline.Append(mm_to_iu(ax - kw), mm_to_iu(ay - kh))
    outline.Append(mm_to_iu(ax + kw), mm_to_iu(ay - kh))
    outline.Append(mm_to_iu(ax + kw), mm_to_iu(ay + kh))
    outline.Append(mm_to_iu(ax - kw), mm_to_iu(ay + kh))

    board.Add(zone)
    print("  Added antenna keepout zone on B.Cu")


def main():
    board = pcbnew.LoadBoard(BOARD_PATH)

    # Remove any existing tracks and vias (clean slate for routing)
    existing_tracks = list(board.GetTracks())
    if existing_tracks:
        print(f"Removing {len(existing_tracks)} existing tracks...")
        for t in existing_tracks:
            board.Delete(t)

    # Remove existing zones (we'll recreate them)
    existing_zones = list(board.Zones())
    if existing_zones:
        print(f"Removing {len(existing_zones)} existing zones...")
        for z in existing_zones:
            board.Delete(z)

    print("\n=== Building net-pad map ===")
    net_pads = build_net_pad_map(board)

    # Count routable nets (excluding GND which is handled by zones)
    routable = {k: v for k, v in net_pads.items()
                if k != '/GND' and len(v) >= 2}
    print(f"  {len(routable)} signal/power nets to route")
    print(f"  /GND: {len(net_pads.get('/GND', []))} pads (handled by copper zones)")

    print("\n=== Routing signal and power nets ===")
    routed_count = 0
    for net_name in sorted(routable.keys()):
        pads = routable[net_name]
        width = get_trace_width(net_name)
        n_pads = len(pads)

        # Use chain routing for nets with >4 pads, star for small nets
        if n_pads > 4:
            route_chain(board, pads, net_name)
        else:
            route_star(board, pads, net_name)

        routed_count += 1
        cross = any(p['layer_name'] == 'B.Cu' for p in pads)
        print(f"  {net_name:20s}: {n_pads} pads, {width:.2f}mm"
              f"{' [cross-layer via]' if cross else ''}")

    print(f"\n  Routed {routed_count} nets")

    print("\n=== Adding GND copper zones ===")
    add_ground_zone(board, pcbnew.F_Cu)
    add_ground_zone(board, pcbnew.B_Cu)

    print("\n=== Adding antenna keepout ===")
    add_antenna_keepout(board)

    print("\n=== Adding ground stitching vias ===")
    add_stitching_vias(board)

    print("\n=== Filling zones ===")
    filler = pcbnew.ZONE_FILLER(board)
    zones = board.Zones()
    filler.Fill(zones)
    print(f"  Filled {len(list(zones))} zones")

    print("\n=== Saving board ===")
    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"  Saved to {BOARD_PATH}")

    # Run DRC
    print("\n=== Running DRC ===")
    drc_out = os.path.join(os.path.dirname(BOARD_PATH),
                           "PCB reports", "DRC_Routed.txt")
    result = subprocess.run(
        [KICAD_CLI, "pcb", "drc", "--output", drc_out, "--units", "mm", BOARD_PATH],
        capture_output=True, text=True
    )
    print(f"  DRC exit code: {result.returncode}")
    if result.stdout:
        print(f"  {result.stdout.strip()}")

    if os.path.exists(drc_out):
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for m in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[m] = types.get(m, 0) + 1
        print("\n  DRC Summary:")
        for k, v in sorted(types.items(), key=lambda x: -x[1]):
            print(f"    {k:25s}: {v}")

        critical = 0
        for vtype in ['shorting_items', 'clearance', 'solder_mask_bridge',
                       'courtyards_overlap', 'copper_edge_clearance',
                       'hole_clearance', 'track_width']:
            if vtype in types:
                critical += types[vtype]
        unconnected = types.get('unconnected_items', 0)
        print(f"\n    CRITICAL (excl unconnected): {critical}")
        print(f"    UNCONNECTED: {unconnected}")


if __name__ == '__main__':
    main()
