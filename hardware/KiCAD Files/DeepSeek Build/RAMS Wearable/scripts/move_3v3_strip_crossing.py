"""Move +3V3's B.Cu crossing out of U1's left escape strip.

+3V3 currently crosses the strip on B.Cu on the diagonal
(111.65, 109.50) -> (108.95, 112.20). That diagonal bisects the only area where
the left QFN row has room for vias: every via site north-east of it is within
0.19 mm of the track, and every site south-west of it collides with VDD_RF,
GND or the VBAT_SENSE jog. The same net is reached two millimetres north of the
strip, so the crossing moves up to y 109.50, runs south at x 109.20 (clear of
VDD_RF's B.Cu run and its via at 108.65, 111.25), turns west at y 112.00 above
the GND via at (109.32, 112.60) and rejoins the existing vertex at (108.95, 112.20).

Width stays 0.15 mm, the width +3V3 already uses for its stubs. Netlist
unchanged. DRC-gated: kept only when the saved board reports no violation.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pcbnew as p

ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / 'RAMS_JLC_S3.kicad_pcb'
BAK = ROOT / 'RAMS_JLC_S3.kicad_pcb.bak.pre_3v3_relief'
KICAD = r'C:\Program Files\KiCad\10.0\bin\kicad-cli.exe'

NET = '+3V3'
W = 0.15

OLD = [('B.Cu', (111.65, 109.50), (108.95, 112.20))]
NEW = [
    ('B.Cu', (111.65, 109.50), (109.20, 109.50)),
    ('B.Cu', (109.20, 109.50), (109.20, 112.00)),
    ('B.Cu', (109.20, 112.00), (108.95, 112.00)),
    ('B.Cu', (108.95, 112.00), (108.95, 112.20)),
]


def drc(path):
    out = path.with_suffix('.drc.json')
    subprocess.run([KICAD, 'pcb', 'drc', '--severity-all', '--format', 'json',
                    '--schematic-parity', '--refill-zones', '-o', str(out), str(path)],
                   check=False, capture_output=True)
    return json.loads(out.read_text())


def mm(v):
    return round(p.ToMM(v), 3)


def ends(track):
    a, b = track.GetStart(), track.GetEnd()
    return (mm(a.x), mm(a.y)), (mm(b.x), mm(b.y))


def same(a, b, tol=0.02):
    return abs(a[0] - b[0]) <= tol and abs(a[1] - b[1]) <= tol


def matches(track, layer, p1, p2):
    if track.GetLayerName() != layer:
        return False
    a, b = ends(track)
    return (same(a, p1) and same(b, p2)) or (same(a, p2) and same(b, p1))


def main():
    board = p.LoadBoard(str(BOARD))
    tracks = list(board.GetTracks())
    if any(matches(t, 'B.Cu', (109.20, 109.50), (109.20, 112.00)) for t in tracks):
        print('+3V3 relief already applied; nothing to do')
        return 0

    before = drc(BOARD)
    print('before: violations %d unconnected %d' %
          (len([v for v in before['violations'] if v['severity'] == 'error']),
           len(before['unconnected_items'])))
    shutil.copy2(BOARD, BAK)

    removed, code = 0, None
    for t in tracks:
        if t.GetNetname() != NET or t.Type() == p.PCB_VIA_T:
            continue
        if matches(t, *OLD[0]):
            code = t.GetNetCode()
            board.Remove(t)
            removed += 1
    print('removed %d diagonal segment(s) of %s' % (removed, NET))
    if removed != 1 or code is None:
        print('GEOMETRY MISMATCH: expected one +3V3 B.Cu diagonal')
        shutil.copy2(str(BAK), str(BOARD))
        return 1

    for layer, a, b in NEW:
        t = p.PCB_TRACK(board)
        t.SetStart(p.VECTOR2I(p.FromMM(a[0]), p.FromMM(a[1])))
        t.SetEnd(p.VECTOR2I(p.FromMM(b[0]), p.FromMM(b[1])))
        t.SetWidth(p.FromMM(W))
        t.SetLayer(board.GetLayerID(layer))
        t.SetNetCode(code)
        board.Add(t)

    p.SaveBoard(str(BOARD), board)
    after = drc(BOARD)
    errs = [v for v in after['violations'] if v['severity'] == 'error']
    print('after: violations %d unconnected %d' %
          (len(errs), len(after['unconnected_items'])))
    if errs or len(after['unconnected_items']) > len(before['unconnected_items']):
        for v in errs[:8]:
            print('   ', v['type'], v.get('description'))
        shutil.copy2(str(BAK), str(BOARD))
        print('REVERTED: +3V3 relief introduced errors')
        return 1
    print('ACCEPTED: +3V3 crossing moved to y 109.50 / x 108.95')
    return 0


if __name__ == '__main__':
    sys.exit(main())
