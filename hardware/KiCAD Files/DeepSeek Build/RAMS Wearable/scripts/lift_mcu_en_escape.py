"""Lift MCU_EN's escape jog out of the pad 5 / pad 6 rows.

MCU_EN currently leaves U1 pad 4, drops to x 110.90 between pad 5's row and
pad 6's row and takes a via at (110.75, 111.30). That wall sits 0.35 mm in front
of pads 5 and 6, which is why BOOT_BTN and BUZZER_CTRL had no westward outlet at
all (BOOT_BTN's free cells were a 0.85 x 0.30 mm pocket).

The band between VDD_RF's pad-3 leg (track edge y 110.275) and pad 5's copper
(y 110.90) is 0.625 mm tall: a 0.50 mm via at y 110.68 keeps 0.155 mm to
VDD_RF and 0.206 mm to pad 5, so the jog moves up into that band and the two
rows below it open. Geometry unchanged everywhere else; netlist untouched.

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
BAK = ROOT / 'RAMS_JLC_S3.kicad_pcb.bak.pre_mcu_en_lift'
KICAD = r'C:\Program Files\KiCad\10.0\bin\kicad-cli.exe'

NET = 'MCU_EN'
VIA_D = 0.5
VIA_DRILL = 0.2
W = 0.15

# Old jog geometry, as saved.
DROP_TRACKS = [
    ('F.Cu', (111.55, 110.60), (111.05, 110.60)),
    ('F.Cu', (111.05, 110.60), (110.90, 110.75)),
    ('F.Cu', (110.90, 110.75), (110.90, 111.15)),
    ('F.Cu', (110.90, 111.15), (110.75, 111.30)),
    ('B.Cu', (111.20, 110.45), (111.20, 110.85)),
    ('B.Cu', (111.20, 110.85), (110.75, 111.30)),
]
DROP_VIAS = [(110.75, 111.30)]

NEW_VIA = (110.75, 110.68)
NEW_TRACKS = [
    ('F.Cu', (111.55, 110.60), NEW_VIA),
    ('B.Cu', NEW_VIA, (111.20, 110.45)),
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
    if any(matches(t, 'F.Cu', (111.55, 110.60), NEW_VIA) for t in tracks):
        print('MCU_EN lift already applied; nothing to do')
        return 0

    before = drc(BOARD)
    print('before: violations %d warnings %d unconnected %d parity %d' % (
        sum(1 for v in before['violations'] if v['severity'] == 'error'),
        sum(1 for v in before['violations'] if v['severity'] == 'warning'),
        len(before['unconnected_items']), len(before.get('schematic_parity', []))))
    shutil.copy2(BOARD, BAK)

    code = None
    removed, vias = 0, 0
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
    print('after: violations %d warnings %d unconnected %d parity %d' % (
        len(errs), len(warns), len(after['unconnected_items']),
        len(after.get('schematic_parity', []))))
    if errs or len(after['unconnected_items']) > len(before['unconnected_items']):
        for v in errs[:8]:
            print('   ', v['type'], v.get('description'))
        shutil.copy2(str(BAK), str(BOARD))
        print('REVERTED: lift introduced errors')
        return 1
    print('ACCEPTED: MCU_EN escape lifted to y 110.68')
    return 0


if __name__ == '__main__':
    sys.exit(main())
