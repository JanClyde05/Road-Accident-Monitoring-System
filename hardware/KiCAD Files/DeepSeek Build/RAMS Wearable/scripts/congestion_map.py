"""Print an ASCII occupancy map of a PCB region for routing diagnosis.

Usage: python congestion_map.py X0 Y0 X1 Y1 [STEP] [NET,NET,...]
'#' other-net copper, 's' target-net trace, 'S' target-net pad, 'V' via, '.' free.
"""
import math
import sys

import numpy as np
import pcbnew as p

BOARD = 'RAMS_JLC_S3.kicad_pcb'
x0, y0, x1, y1 = (float(v) for v in sys.argv[1:5])
step = float(sys.argv[5]) if len(sys.argv) > 5 else 0.1
targets = tuple(sys.argv[6].split(',')) if len(sys.argv) > 6 else ()
board = p.LoadBoard(BOARD)
nx = int(round((x1 - x0) / step)) + 1
ny = int(round((y1 - y0) / step)) + 1


def mm(v):
    return p.ToMM(v)


def idx(x, y):
    return (int(round((x - x0) / step)), int(round((y - y0) / step)))


def fill(arr, i1, j1, i2, j2, ch):
    a = max(0, min(nx - 1, min(i1, i2)))
    c = max(0, min(nx - 1, max(i1, i2)))
    d = max(0, min(ny - 1, min(j1, j2)))
    e = max(0, min(ny - 1, max(j1, j2)))
    if a <= c and d <= e:
        arr[a:c + 1, d:e + 1] = ch


def capsule(arr, ax, ay, bx, by, radius, ch):
    length = math.hypot(bx - ax, by - ay)
    n = max(2, int(length / (step / 3)))
    for k in range(n + 1):
        t = k / n
        i, j = idx(ax + (bx - ax) * t, ay + (by - ay) * t)
        r = int(round(radius / step))
        fill(arr, i - r, j - r, i + r, j + r, ch)


for layer_name, layer in (('F.Cu', p.F_Cu), ('In2.Cu', p.In2_Cu), ('B.Cu', p.B_Cu)):
    arr = np.full((nx, ny), '.', dtype='<U1')
    for fp in board.GetFootprints():
        for pad in fp.Pads():
            if not pad.IsOnLayer(layer):
                continue
            bb = pad.GetBoundingBox()
            i1, j1 = idx(mm(bb.GetX()) - 0.225, mm(bb.GetY()) - 0.225)
            i2, j2 = idx(mm(bb.GetRight()) + 0.225, mm(bb.GetBottom()) + 0.225)
            fill(arr, i1, j1, i2, j2, 'S' if pad.GetNetname() in targets else '#')
    for t in board.GetTracks():
        if t.Type() == p.PCB_VIA_T:
            r = mm(t.GetWidth(p.F_Cu)) / 2 + 0.225
            i, j = idx(mm(t.GetPosition().x), mm(t.GetPosition().y))
            rr = int(round(r / step))
            fill(arr, i - rr, j - rr, i + rr, j + rr, 'V')
        elif t.GetLayer() == layer:
            capsule(arr, mm(t.GetStart().x), mm(t.GetStart().y),
                    mm(t.GetEnd().x), mm(t.GetEnd().y),
                    0.225 + mm(t.GetWidth()) / 2,
                    's' if t.GetNetname() in targets else '#')
    print('=== %s  #=other copper  s=target trace  S=target pad  V=via  .=free' % layer_name)
    print('       ' + ''.join(str(i % 10) for i in range(nx)))
    for j in range(ny):
        print('%6.1f %s' % (y0 + j * step, ''.join(arr[i, j] for i in range(nx))))
    print()
