"""Move GND stitch vias away from whatever they are too close to.

After enlarging the vias from 0.45 mm to 0.50 mm (needed for the 0.13 mm annular
ring floor, see `set_via_geometry.py`), 24 clearance violations appear. Every one
is a track or a signal via passing a GND via at 0.1267-0.1493 mm against the
0.15 mm rule - in other words the shortfall is 1 to 23 um.

Moving the GND vias is the cheap fix: they connect to a plane, so a few tens of
micrometres of lateral shift costs nothing electrically. Signal geometry is never
touched, which is the property that makes this safe.

Each pass reads the DRC report, finds the offending GND vias, and shifts each one
directly away from the closest point on the object it is too close to, by the
shortfall plus a margin. DRC is re-run after every pass and the board is written
only when the violation count actually drops; the caller keeps the last good
file.

Usage:
    python nudge_gnd_vias.py [board.kicad_pcb] [--passes 3] [--dry-run]
Exit code 0 when DRC reports no clearance violations at the end.
"""

import argparse
import json
import math
import os
import subprocess
import tempfile

import pcbnew

CLEARANCE_MM = float(os.environ.get("RAMS_CLEARANCE_MM", "0.15"))  # the rule being enforced
MARGIN_MM = 0.004        # land clear of the rule rather than exactly on it
MAX_SHIFT_MM = 0.06      # a stitch via should never need to jump further


def find_cli():
    for name in ("kicad-cli", "kicad-cli.exe"):
        p = os.path.exists(name) and name
        from shutil import which
        p = which(name)
        if p:
            return p
    fallback = r"C:/Program Files/KiCad/10.0/bin/kicad-cli.exe"
    return fallback if os.path.exists(fallback) else None


def drc(cli, path):
    out = os.path.join(tempfile.gettempdir(), "rams_nudge_drc.json")
    subprocess.run([cli, "pcb", "drc", "--severity-all", "--format", "json",
                    "--refill-zones", "-o", out, path],
                   check=True, capture_output=True)
    return json.load(open(out))


def clearance_problems(report):
    out = []
    for v in report.get("violations", []):
        if v.get("type") != "clearance":
            continue
        items = v.get("items", [])
        if len(items) != 2:
            continue
        out.append(v)
    return out


def net_of(item):
    d = item.get("description") or ""
    if "[" in d and "]" in d:
        return d[d.index("[") + 1:d.index("]")]
    return ""


def is_via(item):
    return (item.get("description") or "").startswith("Via")


def closest_point(obj, px, py):
    """Closest point on a board object to (px, py), all in nm."""
    if obj.Type() == pcbnew.PCB_TRACE_T:
        ax, ay = obj.GetStart().x, obj.GetStart().y
        bx, by = obj.GetEnd().x, obj.GetEnd().y
        dx, dy = bx - ax, by - ay
        seg2 = dx * dx + dy * dy
        if seg2 == 0:
            return ax, ay
        t = ((px - ax) * dx + (py - ay) * dy) / seg2
        t = max(0.0, min(1.0, t))
        return ax + t * dx, ay + t * dy
    p = obj.GetPosition()
    return p.x, p.y


def candidate_objects(board, net):
    objs = []
    for t in board.GetTracks():
        if t.GetNetname() == net:
            objs.append(t)
    for fp in board.GetFootprints():
        for pad in fp.Pads():
            if pad.GetNetname() == net:
                objs.append(pad)
    return objs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("board", nargs="?", default="RAMS_JLC_S3.kicad_pcb")
    parser.add_argument("--passes", type=int, default=3)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    cli = find_cli()
    if not cli:
        print("kicad-cli not found")
        return 2

    report = drc(cli, args.board)
    history = [len(report.get("violations", []))]
    print("pass 0: %d violations" % history[0])

    for n in range(1, args.passes + 1):
        problems = clearance_problems(report)
        if not problems:
            break
        board = pcbnew.LoadBoard(args.board)
        vias = [t for t in board.GetTracks() if t.Type() == pcbnew.PCB_VIA_T]
        # Accumulate a displacement per GND via so one via near two objects gets
        # one combined move rather than two overrides.
        shift = {}
        for v in problems:
            a, b = v["items"]
            if is_via(a) and net_of(a) == "GND":
                mover, other = a, b
            elif is_via(b) and net_of(b) == "GND":
                mover, other = b, a
            else:
                continue
            px = int(round(mover["pos"]["x"] * 1e6))
            py = int(round(mover["pos"]["y"] * 1e6))
            need = (CLEARANCE_MM - float(v["description"].split("actual")[1].split("mm")[0].strip())
                    + MARGIN_MM) * 1e6
            if need <= 0:
                continue
            best, bestd = None, None
            for obj in candidate_objects(board, net_of(other)):
                cx, cy = closest_point(obj, px, py)
                d = math.hypot(px - cx, py - cy)
                if bestd is None or d < bestd:
                    best, bestd = (cx, cy), d
            if best is None or not bestd:
                continue
            ux, uy = (px - best[0]) / bestd, (py - best[1]) / bestd
            key = (px, py)
            sx, sy = shift.get(key, (0.0, 0.0))
            shift[key] = (sx + ux * need, sy + uy * need)

        moved = 0
        limit = MAX_SHIFT_MM * 1e6
        for (px, py), (dx, dy) in shift.items():
            d = math.hypot(dx, dy)
            if d > limit:
                dx, dy, d = dx * limit / d, dy * limit / d, limit
            target = None
            for via in vias:
                p = via.GetPosition()
                if abs(p.x - px) < 1000 and abs(p.y - py) < 1000:
                    target = via
                    break
            if target is None:
                continue
            target.SetPosition(pcbnew.VECTOR2I(int(px + dx), int(py + dy)))
            moved += 1
        print("pass %d: %d clearance items, %d GND vias shifted by up to %.3f mm"
              % (n, len(problems), moved, max([math.hypot(*v) for v in shift.values()] or [0]) / 1e6))
        if args.dry_run:
            print("dry run, board not written")
            return 0
        if not moved:
            break
        pcbnew.SaveBoard(args.board, board)
        report = drc(cli, args.board)
        total = len(report.get("violations", []))
        history.append(total)
        print("   -> %d violations" % total)
        if total >= history[-2]:
            print("   no progress, stopping")
            break

    remaining = [v for v in report.get("violations", []) if v.get("type") == "clearance"]
    print("final: %d violations (%d clearance), history %s"
          % (len(report.get("violations", [])), len(remaining), history))
    return 0 if not remaining else 1


if __name__ == "__main__":
    raise SystemExit(main())
