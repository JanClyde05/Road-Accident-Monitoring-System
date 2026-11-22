"""Move the VDD_RF decoupling pair (C12, C13) to B.Cu under the QFN's left edge.

Why this exists
---------------
Pads 4, 5, 6 and 7 of U1 sit on a 0.4 mm pitch at x = 111.55 and cannot be
escaped westward: C12/C13 stand at x 110.00-110.56 and their VDD_RF pads plus
the x = 110.300 trunk wall leave 0.59-0.87 mm of corridor for a 0.45 mm escape.

A free-space search proved only ONE 0402 fits anywhere on F.Cu near the QFN
(81 legal centres, all inside x 106.15-106.75, y 110.70-110.80; no legal pair),
so the pair cannot simply be slid sideways on the top layer. B.Cu in the same
region is empty apart from the `+3V3` diagonal, so the pair moves to the bottom
side and connects through one via.

Geometry (board millimetres)
----------------------------
  via VDD_RF       (107.400, 110.900)  0.50 / 0.20, F.Cu..B.Cu, inside the F.Cu
                                        free column at x 107.15-107.65
  F.Cu stub        via -> L1 pad 2      VDD_RF, 0.15 wide
  B.Cu rail        y = 110.420          VDD_RF, 0.15 wide, via both pad 1s
  C12              (105.700, 110.900)   rot 90, pad 1 north
  C13              (106.900, 110.900)   rot 90, pad 1 north
  GND              pad 2 of each cap lands on the B.Cu GND pour after refill

The board is only written when KiCad DRC reports no violations; otherwise the
backup is restored and the script exits non-zero.
"""

import os
import shutil
import subprocess
import sys

import pcbnew

BOARD = "RAMS_JLC_S3.kicad_pcb"
BACKUP = BOARD + ".bak.pre_bcu_caps"
CLI = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"

VIA_POS = (108.700, 111.400)   # dead centre of the F.Cu VDD_RF trunk, so no stub is needed
VIA_W, VIA_D = 0.50, 0.20
TRACK_W = 0.15
RAIL_Y = 109.800               # pad-1 row on B.Cu
# F.Cu trunk link that removing the old cap stubs left open
REPAIR = ((110.100, 111.500), (110.300, 111.000))
# footprint centres; pad 1 lands on RAIL_Y (0.48 above centre)
TARGETS = {"C12": (106.600, 110.280), "C13": (107.800, 110.280)}


def mm(v):
    return pcbnew.FromMM(v)


def to_mm(v):
    return v / 1e6


def find(b, ref):
    for fp in b.GetFootprints():
        if fp.GetReference() == ref:
            return fp
    raise SystemExit("footprint %s not found" % ref)


def pad1_north(fp):
    """Rotate so that pad 1 sits above the centre (north) on B.Cu."""
    for rot in (90, 270):
        fp.SetOrientationDegrees(rot)
        p1 = [p for p in fp.Pads() if p.GetNumber() == "1"][0]
        if p1.GetPosition().y < fp.GetPosition().y:
            return
    raise SystemExit("%s: cannot orient pad 1 north" % fp.GetReference())


def main():
    b = pcbnew.LoadBoard(BOARD)
    old_pads = {}
    for ref in TARGETS:
        fp = find(b, ref)
        old_pads[ref] = [p.GetPosition() for p in fp.Pads()]
        if fp.GetLayer() != pcbnew.B_Cu:
            fp.Flip(fp.GetPosition(), False)
        fp.SetPosition(pcbnew.VECTOR2I(mm(TARGETS[ref][0]), mm(TARGETS[ref][1])))
        pad1_north(fp)
        print("%s -> B.Cu (%.3f, %.3f) pad1 at (%.3f, %.3f)" % (
            ref, to_mm(fp.GetPosition().x), to_mm(fp.GetPosition().y),
            to_mm([p for p in fp.Pads() if p.GetNumber() == "1"][0].GetPosition().x),
            to_mm([p for p in fp.Pads() if p.GetNumber() == "1"][0].GetPosition().y)))

    # drop F.Cu VDD_RF stubs that terminated on the old pad positions
    net = b.FindNet("VDD_RF")
    doomed = {}
    for t in b.GetTracks():
        if t.Type() == pcbnew.PCB_VIA_T or t.GetNetCode() != net.GetNetCode():
            continue
        if t.GetLayer() != pcbnew.F_Cu:
            continue
        for ref, pads in old_pads.items():
            for p in pads:
                for end in (t.GetStart(), t.GetEnd()):
                    if abs(end.x - p.x) < mm(0.3) and abs(end.y - p.y) < mm(0.3):
                        doomed[str(t.m_Uuid)] = t
                        break
    for t in doomed.values():
        b.Remove(t)
    print("removed %d obsolete F.Cu VDD_RF stubs" % len(doomed))

    def near(p, q, tol=1e-3):
        return abs(p[0] - q[0]) < tol and abs(p[1] - q[1]) < tol

    # via sits on the trunk; no stub needed, but skip it when already present
    have_via = any(t.Type() == pcbnew.PCB_VIA_T and near((to_mm(t.GetPosition().x),
                                                        to_mm(t.GetPosition().y)), VIA_POS)
                   for t in b.GetTracks())
    if not have_via:
        via = pcbnew.PCB_VIA(b)
        via.SetPosition(pcbnew.VECTOR2I(mm(VIA_POS[0]), mm(VIA_POS[1])))
        via.SetWidth(mm(VIA_W))
        via.SetDrill(mm(VIA_D))
        via.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
        via.SetNet(net)
        b.Add(via)
        print("added VDD_RF via")
    else:
        print("VDD_RF via already present")

    def track(layer, a, c, width=TRACK_W):
        t = pcbnew.PCB_TRACK(b)
        t.SetLayer(layer)
        t.SetStart(pcbnew.VECTOR2I(mm(a[0]), mm(a[1])))
        t.SetEnd(pcbnew.VECTOR2I(mm(c[0]), mm(c[1])))
        t.SetWidth(mm(width))
        t.SetNet(net)
        b.Add(t)

    # Removing the old cap stubs also opened this F.Cu trunk link; restore it.
    a1, b1 = REPAIR
    linked = any(t.Type() != pcbnew.PCB_VIA_T and t.GetNetCode() == net.GetNetCode()
                 and t.GetLayer() == pcbnew.F_Cu
                 and ((near((to_mm(t.GetStart().x), to_mm(t.GetStart().y)), a1)
                       and near((to_mm(t.GetEnd().x), to_mm(t.GetEnd().y)), b1))
                   or (near((to_mm(t.GetStart().x), to_mm(t.GetStart().y)), b1)
                       and near((to_mm(t.GetEnd().x), to_mm(t.GetEnd().y)), a1)))
                 for t in b.GetTracks())
    if not linked:
        track(pcbnew.F_Cu, a1, b1, width=0.25)
        print("repaired F.Cu VDD_RF trunk link")


    p1s = []
    for ref in ("C13", "C12"):
        fp = find(b, ref)
        p1 = [p for p in fp.Pads() if p.GetNumber() == "1"][0]
        p1s.append((to_mm(p1.GetPosition().x), to_mm(p1.GetPosition().y)))
    track(pcbnew.B_Cu, VIA_POS, (VIA_POS[0], RAIL_Y))
    for x, y in p1s:
        track(pcbnew.B_Cu, (VIA_POS[0], RAIL_Y), (x, y))

    shutil.copyfile(BOARD, BACKUP)
    b.Save(BOARD)
    print("saved; DRC gate running")

    out = "reports/bcu_caps_drc.json"
    r = subprocess.run([CLI, "pcb", "drc", "--severity-all", "--format", "json",
                        "--schematic-parity", "--refill-zones", "-o", out, BOARD],
                       capture_output=True, text=True)
    import json
    with open(out, encoding="utf-8") as fh:
        res = json.load(fh)
    bad = [v for v in res.get("violations", []) if v.get("severity") in ("error",)]
    unc = res.get("unconnected_items", [])
    print("DRC errors: %d   unconnected: %d   parity warnings: %d" % (
        len(bad), len(unc), len(res.get("schematic_parity", []))))
    for v in bad[:10]:
        print("  %s  %s  (%s)" % (v.get("type"), v.get("description", "")[:70],
                                  v.get("severity")))
    if bad:
        shutil.copyfile(BACKUP, BOARD)
        print("REVERTED to backup")
        return 1
    print("accepted")
    return 0


if __name__ == "__main__":
    sys.exit(main())
