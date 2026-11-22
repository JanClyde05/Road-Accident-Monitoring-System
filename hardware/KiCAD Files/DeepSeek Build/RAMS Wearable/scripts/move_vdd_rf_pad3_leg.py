"""Move VDD_RF's pad-3 leg out of U1's left-row escape strip.

Pad 3 (VDD_RF, y = 110.2) used to dive from (110.85, 110.2) down to the trunk at
(110.3, 111.0), crossing the escape rows of MCU_EN (pad 4) and BOOT_BTN (pad 5).
That single 0.15 mm leg sealed both pads on every layer: F.Cu blocked by the leg
itself, In2 unreachable without a via that cannot fit, B.Cu crossed by +3V3.

The new leg runs along pad 3's own row (y = 110.2), outside the pad tips, and
joins the horizontal trunk arm at (109.6, 110.35). Connectivity is unchanged.
Accepted only when a fresh native DRC reports no new violation and no net lost.
"""
import json, shutil, subprocess
from pathlib import Path
import pcbnew as p

ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / 'RAMS_JLC_S3.kicad_pcb'
KICAD = r'C:\Program Files\KiCad\10.0\bin\kicad-cli.exe'
NET = 'VDD_RF'
OLD = [((110.85, 110.2), (110.75, 110.3)),
       ((110.75, 110.3), (110.75, 110.55)),
       ((110.75, 110.55), (110.3, 111.0))]
NEW = [((110.85, 110.2), (109.6, 110.2), 0.15),
       ((109.6, 110.2), (109.6, 110.35), 0.15)]


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
    present = {ends(t) for t in board.GetTracks()
               if t.Type() != p.PCB_VIA_T and t.GetNetname() == NET}
    already = all(tuple(sorted(seg)) in present for seg, _, _ in NEW)
    if already:
        print('already moved')
        return 0
    missing = [s for s in OLD if tuple(sorted(s)) not in present]
    if missing:
        print('expected leg not found', missing)
        return 1

    shutil.copy2(BOARD, BOARD.with_suffix('.kicad_pcb.bak.pre_vddrf_leg'))
    base_path = BOARD.with_suffix('.kicad_pcb.bak.pre_vddrf_leg')
    shutil.copy2(base_path, base_path.with_suffix('.probe.kicad_pcb'))
    base = drc(base_path.with_suffix('.probe.kicad_pcb'))
    known = {}
    for v in base['violations']:
        known[sig(v)] = known.get(sig(v), 0) + 1

    code = next(t.GetNetCode() for t in board.GetTracks() if t.GetNetname() == NET)
    for t in [t for t in board.GetTracks()
              if t.Type() != p.PCB_VIA_T and t.GetNetname() == NET and ends(t) in
              [tuple(sorted(s)) for s in OLD]]:
        board.Remove(t)
    for a, b, w in NEW:
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
    if new or lost:
        shutil.copy2(base_path, BOARD)
        print('REVERTED new violations', len(new), 'lost net', lost)
        for v in new[:5]:
            print('  ', v['type'], v.get('description'))
        return 1
    print('moved VDD_RF pad-3 leg; violations', len(rep['violations']),
          'unconnected', len(rep['unconnected_items']),
          'parity', len(rep.get('schematic_parity', [])))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
