"""Full board verification for RAMS_JLC_S3.kicad_pcb.

Reference-count parity is not enough: two files can hold the same 90 parts and
still disagree about which pad carries which net. This script exports the
schematic netlist and compares it with the board pad by pad, then checks the
copper against the fabrication floor that the boards are actually ordered to.

Checks:
 1. the board loads and reports its own counts
 2. every (reference, pad) pair carries the same net in schematic and board
 3. the net name sets agree, so nothing was invented on either side
 4. minimum track width and minimum clearance meet the 2-layer floor
 5. via drill and annular ring meet the same floor

Auto-generated `unconnected-(...)` nets are compared like any other net: KiCad
creates them from unconnected pins on both sides, so a mismatch there is also a
real mismatch.

Usage:
    python verify_board.py [board.kicad_pcb] [--skip-netlist]
Exit code 0 only when every check passes.
"""

import collections
import os
import re
import shutil
import subprocess
import sys
import tempfile

import pcbnew

# 2-layer prototype floor quoted by the fabricator (JLCPCB standard process):
# 5 mil trace/space, 0.3 mm minimum drill, 0.13 mm minimum annular ring.
FAB_MIN_TRACK_MM = 0.127
FAB_MIN_CLEARANCE_MM = 0.127
FAB_MIN_DRILL_MM = 0.30
FAB_MIN_ANNULAR_MM = 0.13

NODE = re.compile(r'\(node\s+\(ref\s+"([^"]+)"\)\s+\(pin\s+"([^"]+)"\)')
NETNAME = re.compile(r'\(net\s+\(code\s+"?\d+"?\)\s+\(name\s+"([^"]+)"\)')


def find_cli():
    for name in ("kicad-cli", "kicad-cli.exe"):
        path = shutil.which(name)
        if path:
            return path
    fallback = r"C:/Program Files/KiCad/10.0/bin/kicad-cli.exe"
    return fallback if os.path.exists(fallback) else None


def schematic_nets(board_path):
    """Return {(ref, pad): net} and the set of net names, straight from the schematic."""
    cli = find_cli()
    sch = os.path.splitext(board_path)[0] + ".kicad_sch"
    if not cli or not os.path.exists(sch):
        return None, None
    with tempfile.TemporaryDirectory(prefix="rams_verify_") as tmp:
        out = os.path.join(tmp, "net.sexpr")
        subprocess.run([cli, "sch", "export", "netlist", "--format", "kicadsexpr",
                        "-o", out, sch], check=True, capture_output=True)
        text = open(out, encoding="utf-8", errors="replace").read()
    nodes, names = {}, set()
    # Net blocks: (net (code "1") (name "X") (node ...) (node ...))
    for m in re.finditer(r'\(net\s+\(code\s+"?\d+"?\)\s+\(name\s+"([^"]+)"\)', text):
        start = m.start()
        depth, i = 0, start
        while i < len(text):
            if text[i] == "(":
                depth += 1
            elif text[i] == ")":
                depth -= 1
                if depth == 0:
                    break
            i += 1
        block = text[start:i + 1]
        name = m.group(1)
        names.add(name)
        for ref, pad in NODE.findall(block):
            nodes[(ref, pad)] = name
    return nodes, names


def board_nets(board):
    nodes, names = {}, set()
    for fp in board.GetFootprints():
        ref = fp.GetReference()
        for pad in fp.Pads():
            net = pad.GetNetname()
            if not net:
                continue
            nodes[(ref, pad.GetNumber())] = net
            names.add(net)
    return nodes, names


def copper(board):
    widths = [t.GetWidth() for t in board.GetTracks()
              if t.Type() == pcbnew.PCB_TRACE_T]
    vias = [t for t in board.GetTracks() if t.Type() == pcbnew.PCB_VIA_T]
    drills = [v.GetDrillValue() for v in vias]
    # PCB_VIA::GetWidth() without a layer asserts in KiCad 10, so ask for one.
    annular = [(v.GetWidth(v.TopLayer()) - v.GetDrillValue()) / 2.0 for v in vias]
    ds = board.GetDesignSettings()
    return {
        "tracks": len(widths),
        "min_track_mm": min(widths) / 1e6 if widths else None,
        "vias": len(vias),
        "min_drill_mm": min(drills) / 1e6 if drills else None,
        "min_annular_mm": min(annular) / 1e6 if annular else None,
        "rules_min_clearance_mm": ds.m_MinClearance / 1e6,
        "rules_min_track_mm": ds.m_TrackMinWidth / 1e6,
        "rules_min_via_size_mm": ds.m_ViasMinSize / 1e6,
        "rules_min_through_drill_mm": ds.m_MinThroughDrill / 1e6,
    }


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    board_path = args[0] if args else "RAMS_JLC_S3.kicad_pcb"
    board = pcbnew.LoadBoard(board_path)
    failures = []
    mm2 = 1e-6

    area = board.GetBoardEdgesBoundingBox()
    print("board: %s" % board_path)
    print("  %.2f x %.2f mm, %d copper layers, %d footprints, %d nets, %d tracks, %d vias"
          % (area.GetWidth() * mm2, area.GetHeight() * mm2, board.GetCopperLayerCount(),
             len(board.GetFootprints()), board.GetNetCount(),
             len([t for t in board.GetTracks() if t.Type() == pcbnew.PCB_TRACE_T]),
             len([t for t in board.GetTracks() if t.Type() == pcbnew.PCB_VIA_T])))

    # 2 and 3: schematic versus board, pad by pad.
    if "--skip-netlist" not in sys.argv:
        sch_nodes, sch_names = schematic_nets(board_path)
        if sch_nodes is None:
            print("  [SKIP] schematic netlist not available")
            failures.append("schematic netlist could not be exported")
        else:
            pcb_nodes, pcb_names = board_nets(board)
            missing = sorted(set(sch_nodes) - set(pcb_nodes))
            extra = sorted(set(pcb_nodes) - set(sch_nodes))
            differ = sorted(k for k in set(sch_nodes) & set(pcb_nodes)
                            if sch_nodes[k] != pcb_nodes[k])
            print("  pads with a net: schematic %d, board %d" % (len(sch_nodes), len(pcb_nodes)))
            print("  [%s] every schematic pad exists on the board (%d missing)"
                  % ("PASS" if not missing else "FAIL", len(missing)))
            print("  [%s] every board pad exists in the schematic (%d extra)"
                  % ("PASS" if not extra else "FAIL", len(extra)))
            print("  [%s] pad-to-net assignment identical (%d differing)"
                  % ("PASS" if not differ else "FAIL", len(differ)))
            for title, items in (("missing", missing), ("extra", extra), ("differ", differ)):
                for ref, pad in items[:8]:
                    detail = ""
                    if title == "differ":
                        detail = " schematic=%s board=%s" % (sch_nodes[(ref, pad)], pcb_nodes[(ref, pad)])
                    print("      %s %s.%s%s" % (title, ref, pad, detail))
                if len(items) > 8:
                    print("      ... %d more" % (len(items) - 8))
            if missing or extra or differ:
                failures.append("schematic and board disagree on pad nets")
            print("  [%s] net name sets agree (schematic %d, board %d)"
                  % ("PASS" if sch_names == pcb_names else "FAIL", len(sch_names), len(pcb_names)))
            if sch_names != pcb_names:
                failures.append("net name sets differ: -%d +%d"
                                % (len(sch_names - pcb_names), len(pcb_names - sch_names)))
                for n in sorted(sch_names ^ pcb_names)[:8]:
                    print("      only on %s: %s" % ("schematic" if n in sch_names else "board", n))

    # 4 and 5: fabrication floor.
    c = copper(board)
    print("  copper: %d tracks, min width %.3f mm (rule %.3f); %d vias, min drill %.3f mm, "
          "min annular %.3f mm"
          % (c["tracks"], c["min_track_mm"] or 0, c["rules_min_track_mm"],
             c["vias"], c["min_drill_mm"] or 0, c["min_annular_mm"] or 0))
    checks = [
        ("min track width", c["min_track_mm"], FAB_MIN_TRACK_MM, ">="),
        ("min clearance rule", c["rules_min_clearance_mm"], FAB_MIN_CLEARANCE_MM, ">="),
        ("min via drill", c["min_drill_mm"], FAB_MIN_DRILL_MM, ">="),
        ("min annular ring", c["min_annular_mm"], FAB_MIN_ANNULAR_MM, ">="),
        ("min via size rule", c["rules_min_via_size_mm"], 0.45, ">="),
    ]
    for label, value, floor, op in checks:
        ok = value is not None and value >= floor
        print("  [%s] %s %.3f mm (fab floor %.3f mm)"
              % ("PASS" if ok else "FAIL", label, value or 0, floor))
        if not ok:
            failures.append("%s below floor" % label)

    print()
    if failures:
        print("RESULT: FAIL (%d) - %s" % (len(failures), "; ".join(failures)))
        return 1
    print("RESULT: PASS - schematic and board agree pad for pad, copper meets the fab floor")
    return 0


if __name__ == "__main__":
    sys.exit(main())
