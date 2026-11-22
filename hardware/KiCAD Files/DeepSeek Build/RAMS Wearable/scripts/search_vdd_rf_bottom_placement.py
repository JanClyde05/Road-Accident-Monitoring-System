"""Find a legal bottom-side home for C12/C13 plus a VDD_RF via that clears every layer.

Three failures this encodes, all real (2026-11-18):

1. A through via is not a top-layer object. It must clear copper on F.Cu, In1.Cu,
   In2.Cu and B.Cu. A one-layer map missed the In2.Cu `+3V3` and `MCU_EN` tracks
   that the first attempt shorted.
2. Small obstacles vanish between coarse sample points. 0.50 mm vias sat inside a
   0.40 mm grid cell, so the map called "free" a spot where a `SYS_EN` via stands.
   Everything here is exact geometry.
3. Excluding GND from the obstacle set is wrong. The via carries VDD_RF, so a GND
   track needs full clearance from it; excluding GND hid an F.Cu GND track
   0.027 mm away. Each query now excludes only the net it belongs to.
"""

import math
import sys

import pcbnew

BOARD = "RAMS_JLC_S3.kicad_pcb"
CLEAR = 0.15          # search margin; the DRC floor is 0.127
HOLE = 0.25           # board hole-to-hole rule
VIA_R = 0.25          # 0.50 mm via
VIA_DRILL_R = 0.10    # 0.20 mm drill
TRACK_HW = 0.075      # 0.15 mm track


def load():
    b = pcbnew.LoadBoard(BOARD)
    pads, segs, vias = [], [], []
    for fp in b.GetFootprints():
        for p in fp.Pads():
            net = p.GetNetname()
            bb = p.GetBoundingBox()
            r = (bb.GetX() / 1e6, bb.GetY() / 1e6, bb.GetRight() / 1e6, bb.GetBottom() / 1e6)
            for lay, name in ((pcbnew.F_Cu, "F.Cu"), (pcbnew.In1_Cu, "In1.Cu"),
                              (pcbnew.In2_Cu, "In2.Cu"), (pcbnew.B_Cu, "B.Cu")):
                if p.IsOnLayer(lay):
                    pads.append((name, r, net))
    for t in b.GetTracks():
        net = t.GetNetname()
        if t.Type() == pcbnew.PCB_VIA_T:
            q = t.GetPosition()
            vias.append((q.x / 1e6, q.y / 1e6, t.GetWidth(pcbnew.F_Cu) / 2e6, net))
        else:
            s, e = t.GetStart(), t.GetEnd()
            segs.append((t.GetLayerName(), (s.x / 1e6, s.y / 1e6, e.x / 1e6, e.y / 1e6),
                         t.GetWidth() / 2e6, net))
    return b, pads, segs, vias


def d_box(x, y, r):
    return math.hypot(max(r[0] - x, 0, x - r[2]), max(r[1] - y, 0, y - r[3]))


def d_rect_point(r, x, y):
    """Distance from an axis-aligned rect; negative when the point is inside."""
    if r[0] < x < r[2] and r[1] < y < r[3]:
        return -min(x - r[0], r[2] - x, y - r[1], r[3] - y)
    return math.hypot(max(r[0] - x, 0, x - r[2]), max(r[1] - y, 0, y - r[3]))


def d_rect_rect(a, b):
    return math.hypot(max(a[0] - b[2], 0, b[0] - a[2]),
                      max(a[1] - b[3], 0, b[1] - a[3]))


def d_seg(x, y, s):
    ax, ay, bx, by = s
    vx, vy = bx - ax, by - ay
    L = vx * vx + vy * vy
    t = 0 if L == 0 else max(0, min(1, ((x - ax) * vx + (y - ay) * vy) / L))
    return math.hypot(x - ax - t * vx, y - ay - t * vy)


def point_clear(x, y, pads, segs, vias, exclude, layers=None):
    """Clearance of a point (a via centre) from copper not in `exclude`."""
    best = 9.9
    for lay, r, net in pads:
        if net in exclude or (layers and lay not in layers):
            continue
        best = min(best, d_box(x, y, r))
    for lay, s, hw, net in segs:
        if net in exclude or (layers and lay not in layers):
            continue
        best = min(best, d_seg(x, y, s) - hw)
    for vx, vy, vr, net in vias:
        if net in exclude:
            continue
        best = min(best, math.hypot(x - vx, y - vy) - vr)
    return best


def rect_clear(r, pads, segs, vias, exclude, layers=None):
    """Clearance of a pad rectangle from copper not in `exclude`."""
    best = 9.9
    for lay, pr, net in pads:
        if net in exclude or (layers and lay not in layers):
            continue
        best = min(best, d_rect_rect(r, pr))
        if best == 0:
            return 0
    for lay, s, hw, net in segs:
        if net in exclude or (layers and lay not in layers):
            continue
        ax, ay, bx, by = s
        bb = (min(ax, bx) - hw, min(ay, by) - hw, max(ax, bx) + hw, max(ay, by) + hw)
        if d_rect_rect(r, bb) - 0.9 > best:
            continue
        n = max(2, int(math.hypot(bx - ax, by - ay) / 0.02))
        for i in range(n + 1):
            t = i / n
            best = min(best, d_rect_point(r, ax + (bx - ax) * t, ay + (by - ay) * t) - hw)
    for vx, vy, vr, net in vias:
        if net in exclude:
            continue
        best = min(best, d_rect_point(r, vx, vy) - vr)
    return best


def main():
    b, pads, segs, vias = load()
    ALL = {"F.Cu", "In1.Cu", "In2.Cu", "B.Cu"}

    cap = next(fp for fp in b.GetFootprints() if fp.GetReference() == "C12")
    sizes = [p.GetSize() for p in cap.Pads()]
    pw = max(s.x for s in sizes) / 1e6
    ph = max(s.y for s in sizes) / 1e6
    xs = [p.GetPosition().x for p in cap.Pads()]
    pitch = abs(xs[0] - xs[1]) / 1e6
    print("0402 pad %.2f x %.2f, centre pitch %.2f" % (pw, ph, pitch))

    hw, hh = pw / 2, ph / 2

    def cap_rects(cx, cy):
        return {"VDD_RF": (cx - hw, cy - hh, cx + hw, cy + hh),
                "GND": (cx - hw, cy + pitch - hh, cx + hw, cy + pitch + hh)}

    def caps_clear(c1, c2):
        """Both caps on B.Cu, the VDD_RF rail through their pad 1s, and each other."""
        worst = 9.9
        for c in (c1, c2):
            for net, r in cap_rects(*c).items():
                worst = min(worst, rect_clear(r, pads, segs, vias, {net}, {"B.Cu"}))
        if worst < CLEAR:
            return worst
        for a in cap_rects(*c1).values():
            for c in cap_rects(*c2).values():
                worst = min(worst, d_rect_rect(a, c))
        lo, hi = min(c1[0], c2[0]) - hw, max(c1[0], c2[0]) + hw
        x = lo
        while x <= hi:
            worst = min(worst, point_clear(x, c1[1], pads, segs, vias,
                                           {"VDD_RF"}, {"B.Cu"}) - TRACK_HW)
            x += 0.02
        return worst

    OFFSETS = ((-2.05, -0.85), (0.85, 2.05), (-2.60, -1.40), (1.40, 2.60))
    DROPS = (1.10, 0.80, 1.40)
    out = []
    vy = 110.40
    while vy <= 111.60:
        vx = 107.40
        while vx <= 109.20:
            vc = point_clear(vx, vy, pads, segs, vias, {"VDD_RF"}, ALL)
            hole = min([math.hypot(vx - a, vy - bb) - r for a, bb, r, n in vias
                        if n not in ("VDD_RF",)] or [9.9]) - VIA_DRILL_R
            if vc >= CLEAR and hole >= HOLE:
                for dx1, dx2 in OFFSETS:
                  for drop in DROPS:
                    c1 = (vx + dx1, vy - drop)   # pad 1 on the rail at vy - drop
                    c2 = (vx + dx2, vy - drop)
                    # vertical feed from the via down to the pad-1 rail
                    c = caps_clear(c1, c2)
                    # the new via is not in the obstacle list yet: test it directly
                    for cc in (c1, c2):
                        for r in cap_rects(*cc).values():
                            c = min(c, d_rect_point(r, vx, vy) - VIA_R)
                    steps = 60
                    for i in range(steps + 1):
                        c = min(c, point_clear(vx, vy - drop * i / steps, pads, segs, vias,
                                               {"VDD_RF"}, {"B.Cu"}) - TRACK_HW)
                    if c >= CLEAR and 104.3 < c1[0] < 112.3 and 104.3 < c2[0] < 112.3:
                        out.append((round(min(vc, c), 3), round(vx, 2), round(vy, 2),
                                    round(c1[0], 2), round(c2[0], 2), round(vy - drop, 2)))
            vx += 0.05
        vy += 0.05
    out.sort(reverse=True)
    print("legal via+pair solutions: %d" % len(out))
    for o in out[:12]:
        print("  margin %.3f  via (%.2f,%.2f)  caps x %.2f / %.2f at pad1 y %.2f"
              % (o[0], o[1], o[2], o[3], o[4], o[5]))
    return 0 if out else 1


if __name__ == "__main__":
    sys.exit(main())
