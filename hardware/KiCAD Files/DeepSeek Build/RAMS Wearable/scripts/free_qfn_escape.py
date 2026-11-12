"""Free the U1 left-column fanout (pads 4-7) by relocating C12/C13.

Measured cause: C12 (109.8,111.0) and C13 (109.8,112.1) sat 0.6 mm in front of
U1 pads 5/6/7, forcing a 0.25 mm VDD_RF trunk down the only escape band. The
band is 1.15 mm wide at 0.4 mm pitch, so no legal 0.15/0.15 lane survived.

Fix: move both 0402 bodies left onto the existing x=108.7 VDD_RF trunk (pad 1
lands on the trunk, pad 2 is picked up by the F.Cu GND zone), delete the now
redundant trunk stubs and the dangling In2 diagonals, then let
route_remaining.py reconnect under DRC.

The script refuses to keep the edit if native DRC reports any violation.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pcbnew as p

ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / 'RAMS_JLC_S3.kicad_pcb'
BACKUP = ROOT / 'verification' / 'qfn_escape_backup.kicad_pcb'
KICAD = r'C:\Program Files\KiCad\10.0\bin\kicad-cli.exe'


def mm(v):
    return p.ToMM(v)


def drc(path):
    out = ROOT / 'verification' / 'qfn_escape_drc.json'
    subprocess.run([KICAD, 'pcb', 'drc', '--severity-all', '--format', 'json',
                    '--schematic-parity', '--refill-zones', '-o', str(out), str(path)],
                   check=False, capture_output=True)
    return json.loads(out.read_text())


def hits(bb, x1, y1, x2, y2):
    return not (mm(bb.GetRight()) < x1 or mm(bb.GetX()) > x2 or
                mm(bb.GetBottom()) < y1 or mm(bb.GetY()) > y2)


def main():
    shutil.copy2(BOARD, BACKUP)
    board = p.LoadBoard(str(BOARD))
    moved = []
    for ref, xy in (('C12', (109.18, 110.60)), ('C13', (109.18, 112.10))):
        fp = board.FindFootprintByReference(ref)
        fp.SetOrientationDegrees(0)
        fp.SetPosition(p.VECTOR2I(p.FromMM(xy[0]), p.FromMM(xy[1])))
        moved.append({'ref': ref, 'to': list(xy), 'pads': [(q.GetNumber(), q.GetNetname(),
                      round(mm(q.GetPosition().x), 3), round(mm(q.GetPosition().y), 3))
                      for q in fp.Pads()]})
        print(ref, 'moved ->', xy, moved[-1]['pads'], flush=True)

    removed = []
    for t in list(board.GetTracks()):
        bb = t.GetBoundingBox()
        net = t.GetNetname()
        drop = False
        if net == 'VDD_RF' and not isinstance(t, p.PCB_VIA) and hits(bb, 109.8, 110.25, 110.5, 112.3):
            drop = True
        # Dangling In2 diagonals that dead-end in the band and block via placement.
        if isinstance(t, p.PCB_TRACK) and t.GetLayer() == p.In2_Cu and net in ('MCU_EN', 'BOOT_BTN'):
            drop = True
        # +3V3 B.Cu diagonal cutting the via band.
        if isinstance(t, p.PCB_TRACK) and t.GetLayer() == p.B_Cu and net == '+3V3':
            x1, y1 = mm(t.GetStart().x), mm(t.GetStart().y)
            x2, y2 = mm(t.GetEnd().x), mm(t.GetEnd().y)
            if {round(x1, 2), round(x2, 2)} & {111.65, 108.95}:
                drop = True
        if drop:
            removed.append({'net': net, 'layer': board.GetLayerName(t.GetLayer())
                            if not isinstance(t, p.PCB_VIA) else 'via',
                            'start': [round(mm(t.GetStart().x), 3), round(mm(t.GetStart().y), 3)]
                            if not isinstance(t, p.PCB_VIA) else None,
                            'end': [round(mm(t.GetEnd().x), 3), round(mm(t.GetEnd().y), 3)]
                            if not isinstance(t, p.PCB_VIA) else None})
            board.Remove(t)
    p.SaveBoard(str(BOARD), board)
    report = drc(BOARD)
    print('removed', len(removed), 'items; moved', len(moved), 'caps', flush=True)
    print('DRC violations', len(report['violations']),
          'unconnected', len(report['unconnected_items']), flush=True)
    (ROOT / 'verification' / 'qfn_escape.json').write_text(
        json.dumps({'moved': moved, 'removed': removed,
                    'drc': {'violations': len(report['violations']),
                            'unconnected': len(report['unconnected_items'])}}, indent=2) + '\n')
    if report['violations']:
        for v in report['violations'][:10]:
            print(' ', v['type'], v.get('description'), flush=True)
        shutil.copy2(BACKUP, BOARD)
        print('REVERTED: violations found', flush=True)
        sys.exit(1)
    print('KEPT: layout edit is DRC clean; run route_remaining.py next', flush=True)


if __name__ == '__main__':
    main()
