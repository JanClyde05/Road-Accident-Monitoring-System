"""Normalize every via in RAMS_JLC_S3.kicad_pcb to one fabrication geometry.

The board was routed with 0.45 mm vias on a 0.20 mm drill. That is a 0.125 mm
annular ring, which is under the 0.13 mm floor of the standard 2-layer process,
and a 0.20 mm drill is that process's non-standard (extra cost) option anyway.

Default here is 0.60 mm pad on a 0.30 mm drill: 0.15 mm annular ring, standard
drill size, no process upgrade. The script is geometry only - it does not move
anything - so the gate is DRC afterwards: if enlarging the vias breaks
clearance, the run must be reverted rather than accepted.

Usage:
    python set_via_geometry.py [board.kicad_pcb] [--size 0.6] [--drill 0.3] [--dry-run]
Prints the resulting minimum annular ring so the caller can check the floor.
"""

import argparse

import pcbnew


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("board", nargs="?", default="RAMS_JLC_S3.kicad_pcb")
    parser.add_argument("--size", type=float, default=0.6, help="via pad diameter, mm")
    parser.add_argument("--drill", type=float, default=0.3, help="drill diameter, mm")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    size_iu = int(round(args.size * 1e6))
    drill_iu = int(round(args.drill * 1e6))
    if size_iu <= drill_iu:
        parser.error("via pad must be larger than the drill")

    board = pcbnew.LoadBoard(args.board)
    vias = [t for t in board.GetTracks() if t.Type() == pcbnew.PCB_VIA_T]
    if not vias:
        print("no vias found")
        return 1

    before = sorted({(v.GetWidth(v.TopLayer()) / 1e6, v.GetDrillValue() / 1e6) for v in vias})
    for v in vias:
        try:
            v.SetWidth(size_iu)
        except TypeError:
            v.SetWidth(pcbnew.F_Cu, size_iu)
        v.SetDrill(drill_iu)

    annular = (args.size - args.drill) / 2.0
    print("vias: %d" % len(vias))
    print("before (pad, drill): %s" % ", ".join("%.2f/%.2f" % b for b in before))
    print("target: %.2f/%.2f mm, annular %.3f mm" % (args.size, args.drill, annular))
    if annular < 0.13:
        print("WARNING: annular ring under the 0.13 mm floor")
    if args.dry_run:
        print("dry run, board not written")
        return 0
    pcbnew.SaveBoard(args.board, board)
    print("saved %s" % args.board)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
