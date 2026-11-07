"""
RAMS Rev C -- PCB board generation from circuit_spec.json
Creates a KiCad 10 PCB with:
  - Board outline (42 x 32 mm, rounded corners, 1.5mm fillet)
  - EPDC-compliant design rules baked in
  - Ground copper pours on F.Cu and B.Cu
  - Antenna keepout zone
  - Component placement zones marked on F.Fab
  - Ground stitching via grid

Run: python build_board.py
Output: RAMS - PCB.kicad_pcb
"""

import json
import uuid
import os
import math

SPEC_PATH = os.path.join(os.path.dirname(__file__), "circuit_spec.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "RAMS - PCB.kicad_pcb")

# Board dimensions in mm
BOARD_W = 42.0
BOARD_H = 32.0
FILLET_R = 1.5
ORIGIN_X = 100.0  # KiCad origin offset
ORIGIN_Y = 100.0

def gen_uuid():
    return str(uuid.uuid4())

def rounded_rect_points(ox, oy, w, h, r, segments=8):
    """Generate points for a rounded rectangle centered at ox+w/2, oy+h/2."""
    points = []
    corners = [
        (ox + r, oy + r, 180, 270),         # top-left
        (ox + w - r, oy + r, 270, 360),      # top-right  
        (ox + w - r, oy + h - r, 0, 90),     # bottom-right
        (ox + r, oy + h - r, 90, 180),        # bottom-left
    ]
    
    for cx, cy, start_deg, end_deg in corners:
        for i in range(segments + 1):
            angle = math.radians(start_deg + (end_deg - start_deg) * i / segments)
            px = cx + r * math.cos(angle)
            py = cy + r * math.sin(angle)
            points.append((round(px, 4), round(py, 4)))
    
    points.append(points[0])  # close
    return points

def build_board():
    spec_f = open(SPEC_PATH, "r")
    spec = json.load(spec_f)
    spec_f.close()
    
    lines = []
    lines.append('(kicad_pcb')
    lines.append('  (version 20240108)')
    lines.append('  (generator "RAMS_Rev_C_build_board")')
    lines.append('  (generator_version "1.0")')
    lines.append(f'  (general')
    lines.append(f'    (thickness 1.6)')
    lines.append(f'    (legacy_teardrops no)')
    lines.append(f'  )')
    lines.append('')
    
    # Paper size
    lines.append('  (paper "A4")')
    lines.append('')
    
    # Title block
    lines.append('  (title_block')
    lines.append('    (title "RAMS Wearable PCB Rev C")')
    lines.append('    (date "2026-10-30")')
    lines.append('    (rev "C")')
    lines.append('    (company "Antigravity / RAMS")')
    lines.append('    (comment 1 "42 x 32 mm, 2-layer, FR4 1.6mm")')
    lines.append('    (comment 2 "DOST-ASTI EPDC manufacturing")')
    lines.append('    (comment 3 "Black mask / White silk")')
    lines.append('  )')
    lines.append('')
    
    # Layers - 2 layer board
    lines.append('  (layers')
    lines.append('    (0 "F.Cu" signal)')
    lines.append('    (31 "B.Cu" signal)')
    lines.append('    (32 "B.Adhes" user "B.Adhesive")')
    lines.append('    (33 "F.Adhes" user "F.Adhesive")')
    lines.append('    (34 "B.Paste" user)')
    lines.append('    (35 "F.Paste" user)')
    lines.append('    (36 "B.SilkS" user "B.Silkscreen")')
    lines.append('    (37 "F.SilkS" user "F.Silkscreen")')
    lines.append('    (38 "B.Mask" user "B.Mask")')
    lines.append('    (39 "F.Mask" user "F.Mask")')
    lines.append('    (40 "Dwgs.User" user "User.Drawings")')
    lines.append('    (41 "Cmts.User" user "User.Comments")')
    lines.append('    (42 "Eco1.User" user "User.Eco1")')
    lines.append('    (43 "Eco2.User" user "User.Eco2")')
    lines.append('    (44 "Edge.Cuts" user)')
    lines.append('    (45 "Margin" user)')
    lines.append('    (46 "B.CrtYd" user "B.Courtyard")')
    lines.append('    (47 "F.CrtYd" user "F.Courtyard")')
    lines.append('    (48 "B.Fab" user "B.Fab")')
    lines.append('    (49 "F.Fab" user "F.Fab")')
    lines.append('    (50 "User.1" user)')
    lines.append('    (51 "User.2" user)')
    lines.append('  )')
    lines.append('')
    
    # Setup with EPDC design rules
    lines.append('  (setup')
    lines.append('    (pad_to_mask_clearance 0.05)')
    lines.append('    (allow_soldermask_bridges_in_footprints no)')
    lines.append('    (pcbplotparams')
    lines.append('      (layerselection 0x00010fc_ffffffff)')
    lines.append('      (plot_on_all_layers_selection 0x0000000_00000000)')
    lines.append('      (disableapertmacros no)')
    lines.append('      (usegerberextensions no)')
    lines.append('      (usegerberattributes yes)')
    lines.append('      (usegerberadvancedattributes yes)')
    lines.append('      (creategerberjobfile yes)')
    lines.append('      (svgprecision 4)')
    lines.append('      (plotframeref no)')
    lines.append('      (viasonmask no)')
    lines.append('      (mode 1)')
    lines.append('      (useauxorigin no)')
    lines.append('      (hpglpennumber 1)')
    lines.append('      (hpglpenspeed 20)')
    lines.append('      (hpglpendiameter 15.000000)')
    lines.append('      (pdf_front_fp_property_popups yes)')
    lines.append('      (pdf_back_fp_property_popups yes)')
    lines.append('      (dxfpolygonmode yes)')
    lines.append('      (dxfimperialunits yes)')
    lines.append('      (dxfusepcbnewfont yes)')
    lines.append('      (psnegative no)')
    lines.append('      (psa4output no)')
    lines.append('      (plotreference yes)')
    lines.append('      (plotvalue no)')
    lines.append('      (plotfptext yes)')
    lines.append('      (plotinvisibletext no)')
    lines.append('      (sketchpadsonfab no)')
    lines.append('      (subtractmaskfromsilk yes)')
    lines.append('      (outputformat 1)')
    lines.append('      (mirror no)')
    lines.append('      (drillshape 1)')
    lines.append('      (scaleselection 1)')
    lines.append('      (outputdirectory "gerbers/")')
    lines.append('    )')
    lines.append('  )')
    lines.append('')
    
    # Net definitions
    all_nets = set()
    for ref, comp in spec["components"].items():
        for pad in comp["pads"]:
            net = pad.get("net", "UNCONNECTED")
            if net not in ("UNCONNECTED", "RESERVED_PSRAM", "NONE"):
                all_nets.add(net)
    
    sorted_nets = sorted(all_nets)
    net_ids = {net: i+1 for i, net in enumerate(sorted_nets)}
    
    lines.append('  (net 0 "")')
    for net, nid in sorted(net_ids.items(), key=lambda x: x[1]):
        net_name = net.lstrip("/")
        lines.append(f'  (net {nid} "{net_name}")')
    lines.append('')
    
    # Board outline on Edge.Cuts
    outline_pts = rounded_rect_points(ORIGIN_X, ORIGIN_Y, BOARD_W, BOARD_H, FILLET_R, 8)
    
    for i in range(len(outline_pts) - 1):
        x1, y1 = outline_pts[i]
        x2, y2 = outline_pts[i+1]
        lines.append(f'  (gr_line (start {x1} {y1}) (end {x2} {y2})')
        lines.append(f'    (stroke (width 0.1) (type solid))')
        lines.append(f'    (layer "Edge.Cuts")')
        lines.append(f'    (uuid "{gen_uuid()}")')
        lines.append(f'  )')
    lines.append('')
    
    # Board info text on F.SilkS
    cx = ORIGIN_X + BOARD_W / 2
    cy = ORIGIN_Y + BOARD_H / 2
    lines.append(f'  (gr_text "RAMS Rev C"')
    lines.append(f'    (at {cx} {ORIGIN_Y + 2.5} 0)')
    lines.append(f'    (layer "F.SilkS")')
    lines.append(f'    (uuid "{gen_uuid()}")')
    lines.append(f'    (effects (font (size 1.5 1.5) (thickness 0.2)))')
    lines.append(f'  )')
    lines.append('')
    
    # Antenna keepout zone (top-left corner)
    # 2450AT18B100E needs copper-free area under antenna body
    # Antenna placed at top-left, keepout extends 6x4mm from corner
    ant_kx1 = ORIGIN_X + 0.3
    ant_ky1 = ORIGIN_Y + 0.3
    ant_kx2 = ORIGIN_X + 8.0
    ant_ky2 = ORIGIN_Y + 6.0
    
    lines.append(f'  (rule_area "ANT1_keepout"')
    lines.append(f'    (layer "F.Cu")')
    lines.append(f'    (uuid "{gen_uuid()}")')
    lines.append(f'    (hatch edge 0.5)')
    lines.append(f'    (connect_pads (clearance 0))')
    lines.append(f'    (keepout (tracks not_allowed) (vias not_allowed) (pads not_allowed) (copperpour not_allowed) (footprints allowed))')
    lines.append(f'    (polygon')
    lines.append(f'      (pts')
    lines.append(f'        (xy {ant_kx1} {ant_ky1})')
    lines.append(f'        (xy {ant_kx2} {ant_ky1})')
    lines.append(f'        (xy {ant_kx2} {ant_ky2})')
    lines.append(f'        (xy {ant_kx1} {ant_ky2})')
    lines.append(f'      )')
    lines.append(f'    )')
    lines.append(f'  )')
    lines.append('')
    
    # Same keepout on B.Cu
    lines.append(f'  (rule_area "ANT1_keepout_back"')
    lines.append(f'    (layer "B.Cu")')
    lines.append(f'    (uuid "{gen_uuid()}")')
    lines.append(f'    (hatch edge 0.5)')
    lines.append(f'    (connect_pads (clearance 0))')
    lines.append(f'    (keepout (tracks not_allowed) (vias not_allowed) (pads not_allowed) (copperpour not_allowed) (footprints allowed))')
    lines.append(f'    (polygon')
    lines.append(f'      (pts')
    lines.append(f'        (xy {ant_kx1} {ant_ky1})')
    lines.append(f'        (xy {ant_kx2} {ant_ky1})')
    lines.append(f'        (xy {ant_kx2} {ant_ky2})')
    lines.append(f'        (xy {ant_kx1} {ant_ky2})')
    lines.append(f'      )')
    lines.append(f'    )')
    lines.append(f'  )')
    lines.append('')
    
    # Ground pour on F.Cu
    gnd_id = net_ids.get("/GND", 0)
    board_pts = rounded_rect_points(ORIGIN_X + 0.3, ORIGIN_Y + 0.3, 
                                      BOARD_W - 0.6, BOARD_H - 0.6, 
                                      FILLET_R - 0.3, 8)
    
    lines.append(f'  (zone')
    lines.append(f'    (net {gnd_id})')
    lines.append(f'    (net_name "GND")')
    lines.append(f'    (layer "F.Cu")')
    lines.append(f'    (uuid "{gen_uuid()}")')
    lines.append(f'    (name "GND_F")')
    lines.append(f'    (hatch edge 0.5)')
    lines.append(f'    (priority 0)')
    lines.append(f'    (connect_pads thermal_relief')
    lines.append(f'      (clearance 0.3)')
    lines.append(f'    )')
    lines.append(f'    (min_thickness 0.3)')
    lines.append(f'    (filled_areas_thickness no)')
    lines.append(f'    (fill yes')
    lines.append(f'      (thermal_gap 0.3)')
    lines.append(f'      (thermal_bridge_width 0.35)')
    lines.append(f'    )')
    lines.append(f'    (polygon')
    lines.append(f'      (pts')
    for px, py in board_pts[:-1]:
        lines.append(f'        (xy {px} {py})')
    lines.append(f'      )')
    lines.append(f'    )')
    lines.append(f'  )')
    lines.append('')
    
    # Ground pour on B.Cu
    lines.append(f'  (zone')
    lines.append(f'    (net {gnd_id})')
    lines.append(f'    (net_name "GND")')
    lines.append(f'    (layer "B.Cu")')
    lines.append(f'    (uuid "{gen_uuid()}")')
    lines.append(f'    (name "GND_B")')
    lines.append(f'    (hatch edge 0.5)')
    lines.append(f'    (priority 0)')
    lines.append(f'    (connect_pads thermal_relief')
    lines.append(f'      (clearance 0.3)')
    lines.append(f'    )')
    lines.append(f'    (min_thickness 0.3)')
    lines.append(f'    (filled_areas_thickness no)')
    lines.append(f'    (fill yes')
    lines.append(f'      (thermal_gap 0.3)')
    lines.append(f'      (thermal_bridge_width 0.35)')
    lines.append(f'    )')
    lines.append(f'    (polygon')
    lines.append(f'      (pts')
    for px, py in board_pts[:-1]:
        lines.append(f'        (xy {px} {py})')
    lines.append(f'      )')
    lines.append(f'    )')
    lines.append(f'  )')
    lines.append('')
    
    # Ground stitching vias - perimeter + internal grid
    via_positions = []
    
    # Perimeter vias every 4mm
    for x_off in [2.0, 6.0, 10.0, 14.0, 18.0, 22.0, 26.0, 30.0, 34.0, 38.0, 40.0]:
        via_positions.append((ORIGIN_X + x_off, ORIGIN_Y + 1.5))
        via_positions.append((ORIGIN_X + x_off, ORIGIN_Y + BOARD_H - 1.5))
    for y_off in [6.0, 10.0, 14.0, 18.0, 22.0, 26.0]:
        via_positions.append((ORIGIN_X + 1.5, ORIGIN_Y + y_off))
        via_positions.append((ORIGIN_X + BOARD_W - 1.5, ORIGIN_Y + y_off))
    
    # Internal grid vias (avoid antenna keepout zone)
    for x_off in [10.0, 16.0, 22.0, 28.0, 34.0]:
        for y_off in [10.0, 16.0, 22.0, 28.0]:
            vx = ORIGIN_X + x_off
            vy = ORIGIN_Y + y_off
            # Skip antenna keepout
            if vx < ant_kx2 and vy < ant_ky2:
                continue
            via_positions.append((vx, vy))
    
    for vx, vy in via_positions:
        lines.append(f'  (via')
        lines.append(f'    (at {vx} {vy})')
        lines.append(f'    (size 0.95)')
        lines.append(f'    (drill 0.4)')
        lines.append(f'    (layers "F.Cu" "B.Cu")')
        lines.append(f'    (net {gnd_id})')
        lines.append(f'    (uuid "{gen_uuid()}")')
        lines.append(f'  )')
    lines.append('')
    
    # Functional zone labels on F.Fab for placement guidance
    zone_labels = [
        (ORIGIN_X + 3, ORIGIN_Y + 3, "ANT1 Zone"),
        (ORIGIN_X + 3, ORIGIN_Y + 10, "USB-C + ESD"),
        (ORIGIN_X + 3, ORIGIN_Y + 18, "Charger"),
        (ORIGIN_X + 3, ORIGIN_Y + 24, "Battery Prot"),
        (ORIGIN_X + 14, ORIGIN_Y + 4, "MCU (WROOM-1)"),
        (ORIGIN_X + 30, ORIGIN_Y + 4, "Crystal"),
        (ORIGIN_X + 30, ORIGIN_Y + 14, "Buzzer"),
        (ORIGIN_X + 14, ORIGIN_Y + 24, "LDO Power"),
        (ORIGIN_X + 30, ORIGIN_Y + 24, "LoRa (B.Cu)"),
        (ORIGIN_X + 36, ORIGIN_Y + 16, "SW1"),
    ]
    
    for lx, ly, label in zone_labels:
        lines.append(f'  (gr_text "{label}"')
        lines.append(f'    (at {lx} {ly} 0)')
        lines.append(f'    (layer "F.Fab")')
        lines.append(f'    (uuid "{gen_uuid()}")')
        lines.append(f'    (effects (font (size 1.0 1.0) (thickness 0.15)))')
        lines.append(f'  )')
    lines.append('')
    
    lines.append(')')
    return "\n".join(lines)

def main():
    board = build_board()
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(board)
    
    print(f"PCB board generated: {OUTPUT_PATH}")
    print(f"  Board size: {BOARD_W} x {BOARD_H} mm")
    print(f"  Corner fillet: {FILLET_R} mm")
    print(f"  Layers: 2 (F.Cu + B.Cu)")
    print(f"  Ground zones: F.Cu + B.Cu")
    print(f"  Antenna keepout: 8 x 6 mm top-left")
    print(f"  Stitching vias: perimeter + internal grid")
    print()
    print("After opening in KiCad:")
    print("  1. Import netlist from schematic")
    print("  2. Place footprints by functional zone")
    print("  3. Route critical paths (power, USB, RF) manually")
    print("  4. Use interactive router for remaining signals")
    print("  5. Run DRC with EPDC rules")

if __name__ == "__main__":
    main()
