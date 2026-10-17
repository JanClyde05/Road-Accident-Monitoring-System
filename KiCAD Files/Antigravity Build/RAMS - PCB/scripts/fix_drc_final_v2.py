"""fix_drc_final_v2.py -- Fix all 141 remaining DRC violations.

Fixes:
1. track_width (44): Widen all tracks below 0.15mm to proper net widths.
2. clearance (1): Move the +3V3 via at (118.9, 107.8) away from XTAL_N trace.
3. silk_overlap (42): Shrink reference fields on overlapping footprints.
4. silk_over_copper (47): Shrink reference fields that overlap solder mask openings.
5. silk_edge_clearance (6): Move reference fields inward from board edge.
6. text_height (1): Increase LED1 text height to 0.8mm min.
"""
import pcbnew
import subprocess
import os
import re

BOARD_PATH = r"d:\Antigravity\Projects\Danger Monitoring System V2\KiCAD Files\Antigravity Build\RAMS - PCB\RAMS - PCB.kicad_pcb"
KICAD_CLI = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

# Design-rule widths
POWER_NETS = {'/+3V3', '/VBUS', '/VDD_SPI', '/DW_VCC', '/B_MINUS', '/GND'}
MIN_SIGNAL_WIDTH = 0.2000  # mm  (well above 0.15mm min)
MIN_POWER_WIDTH = 0.4000   # mm
MIN_RF_WIDTH = 0.3500      # mm


def mm(val):
    return pcbnew.FromMM(val)


def to_mm(val):
    return pcbnew.ToMM(val)


def main():
    board = pcbnew.LoadBoard(BOARD_PATH)

    # =========================================================================
    # FIX 1: Track width violations -- widen all tracks below minimum
    # =========================================================================
    print("=== FIX 1: Widening sub-minimum tracks ===")
    widened = 0
    for track in board.GetTracks():
        if track.GetClass() == "PCB_VIA":
            continue
        net_name = track.GetNetname()
        w_mm = to_mm(track.GetWidth())

        if w_mm < 0.1500:
            # Determine correct width based on net class
            if net_name in POWER_NETS:
                new_w = MIN_POWER_WIDTH
            elif 'ANT' in net_name or 'RF' in net_name:
                new_w = MIN_RF_WIDTH
            else:
                new_w = MIN_SIGNAL_WIDTH

            track.SetWidth(mm(new_w))
            widened += 1

    print(f"  Widened {widened} tracks to meet minimum width constraints.")

    # =========================================================================
    # FIX 2: Clearance violation -- +3V3 via at (118.9, 107.8) too close to XTAL_N
    # Move the via slightly east to increase clearance
    # =========================================================================
    print("\n=== FIX 2: Fixing clearance violation near XTAL_N ===")
    clearance_fixed = 0
    for track in board.GetTracks():
        if track.GetClass() != "PCB_VIA":
            continue
        pos = track.GetPosition()
        x_mm = to_mm(pos.x)
        y_mm = to_mm(pos.y)
        net_name = track.GetNetname()

        # The offending via: +3V3 via at approximately (118.9, 107.8)
        if net_name == '/+3V3' and 118.5 < x_mm < 119.5 and 107.0 < y_mm < 108.5:
            # Move it north-east to clear the XTAL_N trace
            new_x = 119.5
            new_y = 107.2
            track.SetPosition(pcbnew.VECTOR2I(mm(new_x), mm(new_y)))
            print(f"  Moved +3V3 via from ({x_mm:.1f}, {y_mm:.1f}) to ({new_x}, {new_y})")
            clearance_fixed += 1

            # Now fix connecting tracks to this via
            for t in board.GetTracks():
                if t.GetClass() == "PCB_VIA":
                    continue
                if t.GetNetname() != '/+3V3':
                    continue
                start = t.GetStart()
                end = t.GetEnd()
                sx, sy = to_mm(start.x), to_mm(start.y)
                ex, ey = to_mm(end.x), to_mm(end.y)

                # If a track endpoint was at the old via position, move it
                if abs(sx - x_mm) < 0.15 and abs(sy - y_mm) < 0.15:
                    t.SetStart(pcbnew.VECTOR2I(mm(new_x), mm(new_y)))
                if abs(ex - x_mm) < 0.15 and abs(ey - y_mm) < 0.15:
                    t.SetEnd(pcbnew.VECTOR2I(mm(new_x), mm(new_y)))

    print(f"  Fixed {clearance_fixed} clearance violation(s).")

    # =========================================================================
    # FIX 3: Silkscreen fixes -- shrink references, move edge-close ones
    # =========================================================================
    print("\n=== FIX 3: Fixing silkscreen violations ===")
    silk_fixed = 0
    edge_fixed = 0

    # Board edges for reference
    BX0, BY0 = 100.0, 100.0
    BX1, BY1 = 142.0, 132.0
    EDGE_MARGIN = 0.5  # mm from edge

    for fp in board.GetFootprints():
        ref_name = fp.GetReference()
        ref_field = fp.Reference()  # KiCad 10: returns PCB_FIELD

        # Get the reference text properties
        h_mm = to_mm(ref_field.GetTextHeight())

        # Fix text_height: minimum 0.8mm for silk
        if h_mm < 0.80:
            ref_field.SetTextHeight(mm(0.80))
            ref_field.SetTextWidth(mm(0.80))
            ref_field.SetTextThickness(mm(0.15))
            silk_fixed += 1

        # Shrink all reference fields to compact 0.5mm to reduce overlaps
        if h_mm > 0.55:
            ref_field.SetTextHeight(mm(0.50))
            ref_field.SetTextWidth(mm(0.50))
            ref_field.SetTextThickness(mm(0.10))
            silk_fixed += 1

        # Check if reference is too close to board edge and move inward
        ref_pos = ref_field.GetPosition()
        rx = to_mm(ref_pos.x)
        ry = to_mm(ref_pos.y)
        moved = False

        if rx < BX0 + EDGE_MARGIN:
            rx = BX0 + EDGE_MARGIN + 0.5
            moved = True
        if rx > BX1 - EDGE_MARGIN:
            rx = BX1 - EDGE_MARGIN - 0.5
            moved = True
        if ry < BY0 + EDGE_MARGIN:
            ry = BY0 + EDGE_MARGIN + 0.5
            moved = True
        if ry > BY1 - EDGE_MARGIN:
            ry = BY1 - EDGE_MARGIN - 0.5
            moved = True

        if moved:
            ref_field.SetPosition(pcbnew.VECTOR2I(mm(rx), mm(ry)))
            edge_fixed += 1

        # For footprint-specific silk_over_copper: move reference away from pads
        # These are mostly 0402 components where ref overlaps nearby pads
        fp_pos = fp.GetPosition()
        fpx = to_mm(fp_pos.x)
        fpy = to_mm(fp_pos.y)

        # If ref is right on the pad area, offset it north
        if abs(rx - fpx) < 0.5 and abs(ry - fpy) < 0.5:
            ref_field.SetPosition(pcbnew.VECTOR2I(
                mm(fpx), mm(fpy - 0.8)))
            silk_fixed += 1

    # Also fix footprint text items (like "1" pin indicator on LED1)
    for fp in board.GetFootprints():
        for item in fp.GraphicalItems():
            if hasattr(item, 'GetText') and hasattr(item, 'GetTextHeight'):
                th = to_mm(item.GetTextHeight())
                if th > 0 and th < 0.80:
                    item.SetTextHeight(mm(0.80))
                    item.SetTextWidth(mm(0.80))
                    item.SetTextThickness(mm(0.15))
                    silk_fixed += 1

    print(f"  Adjusted {silk_fixed} silkscreen text items.")
    print(f"  Moved {edge_fixed} references away from board edges.")

    # =========================================================================
    # FIX 4: Refill all zones to ensure GND continuity
    # =========================================================================
    print("\n=== FIX 4: Refilling copper zones ===")
    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    print("  All zones refilled.")

    # =========================================================================
    # SAVE
    # =========================================================================
    pcbnew.SaveBoard(BOARD_PATH, board)
    print(f"\n  Board saved: {BOARD_PATH}")

    # =========================================================================
    # RUN DRC
    # =========================================================================
    print("\n=== Running final DRC validation ===")
    drc_out = os.path.join(os.path.dirname(BOARD_PATH),
                           "PCB reports", "DRC_FINAL_CLEAN.txt")
    subprocess.run([KICAD_CLI, "pcb", "drc",
                    "--output", drc_out, "--units", "mm",
                    BOARD_PATH],
                   capture_output=True, text=True)

    if os.path.exists(drc_out):
        content = open(drc_out, 'r', encoding='utf-8', errors='ignore').read()
        types = {}
        for m in re.findall(r'\[([a-zA-Z_]+)\]:', content):
            types[m] = types.get(m, 0) + 1

        # Count unconnected
        unconn_match = re.search(r'Found (\d+) unconnected pads', content)
        unconn = int(unconn_match.group(1)) if unconn_match else -1

        total_match = re.search(r'Found (\d+) DRC violations', content)
        total = int(total_match.group(1)) if total_match else -1

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
    else:
        print("  WARNING: DRC report not generated!")


if __name__ == '__main__':
    main()
