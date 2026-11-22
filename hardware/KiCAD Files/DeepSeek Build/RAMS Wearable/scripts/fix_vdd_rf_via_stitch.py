"""Re-centre the VDD_RF via on an existing trunk vertex.

`move_vdd_rf_caps_to_bottom.py` placed the via at (108.700, 111.400), which sits
0.05 mm off the trunk segments ending at x 108.650, so DRC raised
`track_not_centered_on_via` twice. Moving the via to the vertex (108.650, 111.250)
clears both because the two segments then end exactly on its centre.

Deliberately no copper is deleted here. An earlier attempt removed the two 0.02 mm
stubs left at the old cap pads plus the wall segments that fed them; each deletion
just moved the `track_dangling` tip to the neighbouring segment, and the wall chain
only terminates in junctions whose topology has to be re-verified by hand. The
remaining stub warnings are cosmetic dead copper on VDD_RF, which is fully
connected (it never appears in the unconnected list).

Gate: keep the edit only when DRC reports no errors and connectivity still shows
the same five open nets.
"""

import json
import shutil
import subprocess
import sys

import pcbnew

BOARD = "RAMS_JLC_S3.kicad_pcb"
BACKUP = BOARD + ".bak.pre_stitch"
CLI = r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe"
OLD_VIA = (108.700, 111.400)
NEW_VIA = (108.650, 111.250)
RAIL_Y = 109.800
W = 0.15


def mm(v):
    return pcbnew.FromMM(v)


def to_mm(v):
    return v / 1e6


def near(p, q, tol=1e-3):
    return abs(p[0] - q[0]) < tol and abs(p[1] - q[1]) < tol


def main():
    b = pcbnew.LoadBoard(BOARD)
    net = b.FindNet("VDD_RF")
    code = net.GetNetCode()

    moved_via = moved_feed = 0
    for t in list(b.GetTracks()):
        if t.GetNetCode() != code:
            continue
        if t.Type() == pcbnew.PCB_VIA_T:
            if near((to_mm(t.GetPosition().x), to_mm(t.GetPosition().y)), OLD_VIA):
                b.Remove(t)
                moved_via += 1
            continue
        if t.GetLayer() == pcbnew.B_Cu and (
                near((to_mm(t.GetStart().x), to_mm(t.GetStart().y)), OLD_VIA)
                or near((to_mm(t.GetEnd().x), to_mm(t.GetEnd().y)), OLD_VIA)):
            b.Remove(t)
            moved_feed += 1
    print("removed old via %d and its B.Cu feed %d" % (moved_via, moved_feed))

    via = pcbnew.PCB_VIA(b)
    via.SetPosition(pcbnew.VECTOR2I(mm(NEW_VIA[0]), mm(NEW_VIA[1])))
    via.SetWidth(mm(0.50))
    via.SetDrill(mm(0.20))
    via.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
    via.SetNet(net)
    b.Add(via)

    t = pcbnew.PCB_TRACK(b)
    t.SetLayer(pcbnew.B_Cu)
    t.SetStart(pcbnew.VECTOR2I(mm(NEW_VIA[0]), mm(NEW_VIA[1])))
    t.SetEnd(pcbnew.VECTOR2I(mm(NEW_VIA[0]), mm(RAIL_Y)))
    t.SetWidth(mm(W))
    t.SetNet(net)
    b.Add(t)
    print("via and feed rebuilt at (%.3f, %.3f)" % NEW_VIA)

    shutil.copyfile(BOARD, BACKUP)
    pcbnew.ZONE_FILLER(b).Fill(b.Zones())
    b.Save(BOARD)

    out = "reports/stitch_drc.json"
    subprocess.run([CLI, "pcb", "drc", "--severity-all", "--format", "json",
                    "--schematic-parity", "--refill-zones", "-o", out, BOARD],
                   capture_output=True)
    r = json.load(open(out, encoding="utf-8"))
    errs = [v for v in r.get("violations", []) if v.get("severity") == "error"]
    warns = [v for v in r.get("violations", []) if v.get("severity") == "warning"]
    unc = len(r.get("unconnected_items", []))
    print("errors %d   warnings %d   unconnected %d   parity %d"
          % (len(errs), len(warns), unc, len(r.get("schematic_parity", []))))
    for v in warns[:6]:
        print("  WARN %s %s" % (v.get("type"), v.get("description", "")[:60]))
    if errs or unc != 5:
        shutil.copyfile(BACKUP, BOARD)
        print("REVERTED")
        return 1
    print("accepted")
    return 0


if __name__ == "__main__":
    sys.exit(main())
