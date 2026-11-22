"""Move LORA_SCK_DEV's via east so LORA_SCK can reach U1 pad 17.

R11.1 (LORA_SCK, 110.99, 117.0) and U1.17 (LORA_SCK, 113.2, 115.45) sit in two
separate free pockets 0.25 mm apart. The wall between them is LORA_SCK_DEV, the
other side of the same series resistor: its F.Cu stub runs from R11.2
(112.00, 117.00) north-west to a via at (111.40, 116.25) and then east on B.Cu.

That via only exists to reach B.Cu; the same B.Cu chain passes through
(112.15, 116.25) beside it. Moving the via to (112.10, 116.45) keeps the run on
its own copper (0.70 mm from LORA_NSS's and LORA_MOSI's vias) and clears the
0.25 mm gap the two LORA_SCK pockets need. The 0.30 mm B.Cu stub that fed the old
via position is dropped with it.

DRC-gated: kept only when the saved board reports no violation at all.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pcbnew as p

ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / 'RAMS_JLC_S3.kicad_pcb'
BAK = ROOT / 'RAMS_JLC_S3.kicad_pcb.bak.pre_sck_dev_escape'
KICAD = r'C:\Program Files\KiCad\10.0\bin\kicad-cli.exe'

NET = 'LORA_SCK_DEV'
VIA_D = 0.5
VIA_DRILL = 0.2
W = 0.15

DROP_TRACKS = [
    ('F.Cu', (111.40, 116.25), (111.85, 116.70)),
    ('F.Cu', (111.85, 116.70), (111.85, 116.80)),
    ('F.Cu', (111.85, 116.80), (111.90, 116.85)),
    ('F.Cu', (111.90, 116.85), (111.90, 116.90)),
    ('F.Cu', (111.90, 116.90), (112.00, 117.00)),
    ('B.Cu', (111.40, 116.25), (111.70, 116.25)),
]
DROP_VIAS = [(111.40, 116.25)]

NEW_VIA = (112.10, 116.45)
NEW_TRACKS = [
    ('F.Cu', (112.00, 117.00), NEW_VIA),
    ('B.Cu', NEW_VIA, (112.15, 116.25)),
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
    if any(matches(t, 'F.Cu', (112.00, 117.00), NEW_VIA) for t in tracks):
        print('LORA_SCK_DEV escape already moved; nothing to do')
        return 0

    before = drc(BOARD)
    print('before: violations %d warnings %d unconnected %d' % (
        sum(1 for v in before['violations'] if v['severity'] == 'error'),
        sum(1 for v in before['violations'] if v['severity'] == 'warning'),
        len(before['unconnected_items'])))
    shutil.copy2(BOARD, BAK)

    removed, vias, code = 0, 0, None
    for t in tracks:
        if t.GetNetname() != NET:
            continue
        if t.Type() == p.PCB_VIA_T:
            pos = (mm(t.GetPosition().x), mm(t.GetPosition().y))
            if any(same(pos, q) for q in DROP_VIAS):
                board.Remove(t)
                vias += 1
            continue
        for layer, p1, p2 in DROP_TRACKS:
            if matches(t, layer, p1, p2):
                code = t.GetNetCode()
                board.Remove(t)
                removed += 1
                break
    print('removed %d tracks, %d vias of %s' % (removed, vias, NET))
    if removed != len(DROP_TRACKS) or vias != len(DROP_VIAS) or code is None:
        print('GEOMETRY MISMATCH: expected %d tracks / %d vias' %
              (len(DROP_TRACKS), len(DROP_VIAS)))
        shutil.copy2(str(BAK), str(BOARD))
        return 1

    v = p.PCB_VIA(board)
    v.SetPosition(p.VECTOR2I(p.FromMM(NEW_VIA[0]), p.FromMM(NEW_VIA[1])))
    v.SetWidth(p.FromMM(VIA_D))
    v.SetDrill(p.FromMM(VIA_DRILL))
    v.SetViaType(p.VIATYPE_THROUGH)
    v.SetLayerPair(p.F_Cu, p.B_Cu)
    v.SetNetCode(code)
    board.Add(v)

    for layer, a, b in NEW_TRACKS:
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
    warns = [v for v in after['violations'] if v['severity'] == 'warning']
    print('after: violations %d warnings %d unconnected %d' %
          (len(errs), len(warns), len(after['unconnected_items'])))
    if errs or warns or len(after['unconnected_items']) > len(before['unconnected_items']):
        for v in errs[:8] + warns[:8]:
            print('   ', v['type'], v.get('description'))
        shutil.copy2(str(BAK), str(BOARD))
        print('REVERTED: LORA_SCK_DEV move introduced violations')
        return 1
    print('ACCEPTED: LORA_SCK_DEV via moved to (112.10, 116.45)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
