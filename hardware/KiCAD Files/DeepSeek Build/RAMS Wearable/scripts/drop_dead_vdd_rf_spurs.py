"""Remove the dead VDD_RF spurs standing in front of U1's left pad row.

The x = 110.3 branch and the x = 110.0 stub fed nothing: native DRC already
reported both ends as dangling tracks. They are 0.25 mm walls 0.05 mm from the
pad tips, and they are the reason BOOT_BTN and BUZZER_CTRL have no exit lane.

Deleting them leaves the VDD_RF net whole:
  U1.2/U1.3 -> new leg (y = 110.2) -> (109.6, 110.35) -> arm -> (108.7, 110.35)
  -> vertical -> C11, via (108.65, 111.25) -> B.Cu rail -> C12, C13, L1.2.

Gate: no new DRC violation and no net lost, else revert.
"""
import json, shutil, subprocess
from pathlib import Path
import pcbnew as p

ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / 'RAMS_JLC_S3.kicad_pcb'
PROBE = ROOT / 'RAMS_JLC_S3_probe.kicad_pcb'
KICAD = r'C:\Program Files\KiCad\10.0\bin\kicad-cli.exe'
NET = 'VDD_RF'
DROP = [((110.28, 111.0), (110.3, 111.0)),
        ((110.28, 112.1), (110.3, 112.1)),
        ((110.3, 111.75), (110.1, 111.55)),
        ((110.1, 111.5), (110.3, 111.0)),
        ((110.1, 111.55), (110.1, 111.5)),
        ((110.1, 111.5), (110.0, 111.4)),
        ((110.0, 111.4), (110.0, 110.4)),
        ((110.0, 110.4), (109.95, 110.35)),
        ((109.95, 110.35), (108.7, 110.35)),
        ((110.3, 112.1), (110.3, 111.75))]
ADD = [((109.6, 110.35), (108.7, 110.35), 0.25)]


def ends(t):
    a = (round(p.ToMM(t.GetStart().x), 3), round(p.ToMM(t.GetStart().y), 3))
    b = (round(p.ToMM(t.GetEnd().x), 3), round(p.ToMM(t.GetEnd().y), 3))
    return tuple(sorted((a, b)))


def drc(path):
    out = path.with_suffix('.drc.json')
    subprocess.run([KICAD, 'pcb', 'drc', '--severity-all', '--format', 'json',
                    '--schematic-parity', '--refill-zones', '-o', str(out), str(path)],
                   check=False, capture_output=True)
    return json.loads(out.read_text())


def sig(v):
    return (v['type'], tuple(sorted(i['uuid'] for i in v['items'])))


def main():
    board = p.LoadBoard(str(BOARD))
    tracks = [t for t in board.GetTracks() if t.Type() != p.PCB_VIA_T and t.GetNetname() == NET]
    have = {ends(t) for t in tracks}
    wanted = [tuple(sorted(s)) for s in DROP]
    missing = [s for s in DROP if tuple(sorted(s)) not in have]
    if len(missing) == len(DROP):
        print('spurs already gone')
        return 0
    if missing:
        print('expected spur missing', missing)
        return 1

    shutil.copy2(BOARD, BOARD.with_suffix('.kicad_pcb.bak.pre_spur_drop'))
    shutil.copy2(BOARD, PROBE)
    base = drc(PROBE)
    known = {}
    for v in base['violations']:
        known[sig(v)] = known.get(sig(v), 0) + 1

    code = tracks[0].GetNetCode()
    for t in tracks:
        if ends(t) in wanted:
            board.Remove(t)
    for a, b, w in ADD:
        t = p.PCB_TRACK(board)
        t.SetStart(p.VECTOR2I(p.FromMM(a[0]), p.FromMM(a[1])))
        t.SetEnd(p.VECTOR2I(p.FromMM(b[0]), p.FromMM(b[1])))
        t.SetWidth(p.FromMM(w))
        t.SetLayer(p.F_Cu)
        t.SetNetCode(code)
        board.Add(t)
    p.SaveBoard(str(BOARD), board)

    rep = drc(BOARD)
    seen = dict(known)
    new = []
    for v in rep['violations']:
        k = sig(v)
        if seen.get(k, 0):
            seen[k] -= 1
            continue
        new.append(v)
    lost = len(rep['unconnected_items']) > len(base['unconnected_items'])
    PROBE.unlink(missing_ok=True)
    PROBE.with_suffix('.drc.json').unlink(missing_ok=True)
    if new or lost:
        shutil.copy2(BOARD.with_suffix('.kicad_pcb.bak.pre_spur_drop'), BOARD)
        print('REVERTED new violations', len(new), 'lost net', lost)
        for v in new[:6]:
            print('  ', v['type'], v.get('description'))
        return 1
    print('spurs removed; violations', len(rep['violations']),
          'unconnected', len(rep['unconnected_items']),
          'parity', len(rep.get('schematic_parity', [])))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
