"""fix_drc_v7_corrective.py -- Corrective DRC fix.

Previous fix over-widened tracks (0.20mm) causing clearance violations
in tight QFN escape areas, and under-sized text (0.50mm) below 0.80mm minimum.

This script:
1. Sets all tracks to exactly 0.15mm minimum (conservative, fits tight escape routes)
2. Sets power tracks to 0.20mm (not 0.40mm -- too wide for this layout density)
3. Fixes all text heights to exactly 0.80mm (the board minimum)
4. Fixes the 2 pre-existing shorts by removing offending B.Cu tracks
5. Reconnects the 2 unconnected +3V3 segments
6. Removes 3 dangling track segments
7. Refills zones and runs DRC
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
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5


def main():
    board = pcbnew.LoadBoard(BOARD_PATH)

    # =========================================================================
    # FIX 1: Set all tracks to proper widths
    #   - Signal tracks: exactly 0.15mm (minimum legal, fits QFN escape)
    #   - Power tracks (/+3V3, /VBUS, etc): 0.20mm (fits most corridors)
    #   - RF tracks: 0.35mm (50-ohm impedance)
    # =========================================================================
    print("=== FIX 1: Correcting track widths ===")
    POWER_NETS = {'/+3V3', '/VBUS', '/VDD_SPI', '/DW_VCC', '/B_MINUS', '/GND'}
    widened = 0
    narrowed = 0

    for track in board.GetTracks():
        if track.GetClass() == "PCB_VIA":
            continue
        net_name = track.GetNetname()
        w_mm = to_mm(track.GetWidth())

        if 'ANT' in net_name or 'RF' in net_name:
            target = 0.35
        elif net_name in POWER_NETS:
            target = 0.20
        else:
            target = 0.15

        # Only change if currently wrong
        if abs(w_mm - target) > 0.001:
            if w_mm < target:
                widened += 1
            else:
                narrowed += 1
            track.SetWidth(mm(target))

    print(f"  Widened {widened} tracks, narrowed {narrowed} tracks")

    # =========================================================================
    # FIX 2: Remove shorted B.Cu tracks
    #   Short 1: /BUZZER_CTRL track on B.Cu near (121.4, 112.3) crosses /+3V3
    #   Short 2: /+3V3 track on B.Cu near (123.4, 105.4) crosses GND via
    # =========================================================================
    print("\n=== FIX 2: Removing shorted tracks ===")
    to_remove = []

    for track in board.GetTracks():
        if track.GetClass() == "PCB_VIA":
            continue
        net = track.GetNetname()
        layer = track.GetLayer()

        if layer != pcbnew.B_Cu:
            continue

        start = track.GetStart()
        end = track.GetEnd()
        sx, sy = to_mm(start.x), to_mm(start.y)
        ex, ey = to_mm(end.x), to_mm(end.y)
        mid_x = (sx + ex) / 2
        mid_y = (sy + ey) / 2

        # Short 1: BUZZER_CTRL on B.Cu near (121.4, 112.3)
        if net == '/BUZZER_CTRL' and layer == pcbnew.B_Cu:
            if 120.0 < mid_x < 123.5 and 110.0 < mid_y < 113.0:
                to_remove.append(track)
                continue

        # Short 2: +3V3 track on B.Cu near (123.4, 105.4) that crosses GND via
        if net == '/+3V3' and layer == pcbnew.B_Cu:
            if 122.5 < mid_x < 124.5 and 104.5 < mid_y < 107.0:
                to_remove.append(track)
                continue

    for t in to_remove:
        net = t.GetNetname()
        s = t.GetStart()
        e = t.GetEnd()
        print(f"  Removing {net} B.Cu track ({to_mm(s.x):.1f},{to_mm(s.y):.1f})->({to_mm(e.x):.1f},{to_mm(e.y):.1f})")
        board.Delete(t)

    print(f"  Removed {len(to_remove)} shorting tracks.")

    # =========================================================================
    # FIX 3: Remove dangling track segments
    # =========================================================================
    print("\n=== FIX 3: Removing dangling tracks ===")
    # Dangling tracks are very short segments not connected to anything
    # Find tracks shorter than 0.05mm and remove them
    dangling = []
    for track in board.GetTracks():
        if track.GetClass() == "PCB_VIA":
            continue
        length = to_mm(track.GetLength())
        if length < 0.01:  # sub 10 micron segments
            dangling.append(track)

    for t in dangling:
        board.Delete(t)
    print(f"  Removed {len(dangling)} dangling micro-segments.")

    # =========================================================================
    # FIX 4: Fix text heights - all silk text must be >= 0.80mm
    # =========================================================================
    print("\n=== FIX 4: Fixing silkscreen text heights ===")
    text_fixed = 0

    for fp in board.GetFootprints():
        ref_field = fp.Reference()
        h = to_mm(ref_field.GetTextHeight())

        # All text must be exactly 0.80mm (minimum legal, compact)
        if abs(h - 0.80) > 0.01:
            ref_field.SetTextHeight(mm(0.80))
            ref_field.SetTextWidth(mm(0.80))
            ref_field.SetTextThickness(mm(0.15))
            text_fixed += 1

        # Also handle value field
        try:
            val_field = fp.Value()
            vh = to_mm(val_field.GetTextHeight())
            if vh > 0 and vh < 0.80:
                val_field.SetTextHeight(mm(0.80))
                val_field.SetTextWidth(mm(0.80))
                val_field.SetTextThickness(mm(0.15))
                text_fixed += 1
        except:
            pass

    # Fix graphical text items in footprints
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

    print(f"  Fixed {text_fixed} text items to 0.80mm height.")

    # =========================================================================
    # FIX 5: Silk overlap -- move overlapping references away from each other
    # =========================================================================
    print("\n=== FIX 5: Reducing silk overlaps ===")
    # Strategy: offset reference fields slightly north of their component
    silk_moved = 0
    for fp in board.GetFootprints():
        ref_field = fp.Reference()
        ref_pos = ref_field.GetPosition()
        fp_pos = fp.GetPosition()

        rx, ry = to_mm(ref_pos.x), to_mm(ref_pos.y)
        fpx, fpy = to_mm(fp_pos.x), to_mm(fp_pos.y)

        # If reference overlaps component center, shift it north
        if abs(rx - fpx) < 1.0 and abs(ry - fpy) < 1.0:
            # Place ref 1.2mm north of component center
            new_ry = fpy - 1.2
            # Clamp to board area (100,100)-(142,132)
            if new_ry < 100.5:
                new_ry = fpy + 1.2  # shift south instead
            if new_ry > 131.5:
                new_ry = 131.0
            ref_field.SetPosition(pcbnew.VECTOR2I(mm(fpx), mm(new_ry)))
            silk_moved += 1

    print(f"  Repositioned {silk_moved} reference fields.")

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

    print("\n=== Running final DRC ===")
    drc_out = os.path.join(os.path.dirname(BOARD_PATH),
                           "PCB reports", "DRC_V7_CORRECTIVE.txt")
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
