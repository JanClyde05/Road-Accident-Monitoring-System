"""Add the QFN_ESC rule area that scopes this project's 0.10 mm escape rules.

`.kicad_dru` rules "QFN escape width" and "QFN escape clearance" apply only
inside a rule area named QFN_ESC, so the rest of the board keeps the 0.15 mm
track / 0.127 mm clearance rules. The area is a rule area (keepout zone with all
items allowed), the same mechanism the existing ANTENNA_NO_METAL rule uses.

Idempotent: re-running does nothing when the area exists. DRC-gated: the edit is
kept only when the saved board reports no violation at all.
"""
import json
import subprocess
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / 'RAMS_JLC_S3.kicad_pcb'
BAK = ROOT / 'RAMS_JLC_S3.kicad_pcb.bak.pre_escape_rule_area'
KICAD = r'C:\Program Files\KiCad\10.0\bin\kicad-cli.exe'

NAME = 'QFN_ESC'
# U1 left pad row (pads 3-8 at x 111.55, y 110.2-112.65) plus the x 108.2-111.2
# corridor every one of those nets has to cross.
BOX = (108.2, 109.0, 111.2, 113.2)
LAYERS = ['F.Cu', 'In2.Cu', 'B.Cu']


def drc(path):
    out = path.with_suffix('.drc.json')
    subprocess.run([KICAD, 'pcb', 'drc', '--severity-all', '--format', 'json',
                    '--schematic-parity', '--refill-zones', '-o', str(out), str(path)],
                   check=False, capture_output=True)
    return json.loads(out.read_text())


def zone_text():
    x1, y1, x2, y2 = BOX
    layers = ' '.join('"%s"' % layer for layer in LAYERS)
    return (
        '\t(zone\n'
        '\t\t(layers %s)\n'
        '\t\t(uuid "%s")\n'
        '\t\t(name "%s")\n'
        '\t\t(hatch edge 0.5)\n'
        '\t\t(connect_pads\n'
        '\t\t\t(clearance 0)\n'
        '\t\t)\n'
        '\t\t(min_thickness 0.25)\n'
        '\t\t(keepout\n'
        '\t\t\t(tracks allowed)\n'
        '\t\t\t(vias allowed)\n'
        '\t\t\t(pads allowed)\n'
        '\t\t\t(copperpour allowed)\n'
        '\t\t\t(footprints allowed)\n'
        '\t\t)\n'
        '\t\t(placement\n'
        '\t\t\t(enabled no)\n'
        '\t\t\t(sheetname "")\n'
        '\t\t)\n'
        '\t\t(fill\n'
        '\t\t\t(thermal_gap 0.5)\n'
        '\t\t\t(thermal_bridge_width 0.5)\n'
        '\t\t\t(island_removal_mode 0)\n'
        '\t\t)\n'
        '\t\t(polygon\n'
        '\t\t\t(pts\n'
        '\t\t\t\t(xy %g %g) (xy %g %g) (xy %g %g) (xy %g %g)\n'
        '\t\t\t)\n'
        '\t\t)\n'
        '\t)\n'
    ) % (layers, uuid.uuid4(), NAME, x1, y1, x2, y1, x2, y2, x1, y2)


def main():
    raw = BOARD.read_bytes().decode('utf-8')
    if '(name "%s")' % NAME in raw:
        print('QFN_ESC already present; nothing to do')
        return 0
    before = drc(BOARD)
    print('before: violations %d unconnected %d' %
          (len(before['violations']), len(before['unconnected_items'])))
    BAK.write_bytes(raw.encode('utf-8'))

    cut = raw.rstrip().rfind(')')
    body = zone_text()
    if '\r\n' in raw:
        body = body.replace('\n', '\r\n')
    BOARD.write_bytes((raw[:cut] + body + raw[cut:]).encode('utf-8'))

    after = drc(BOARD)
    print('after: violations %d unconnected %d' %
          (len(after['violations']), len(after['unconnected_items'])))
    if after['violations']:
        for v in after['violations'][:8]:
            print('   ', v['type'], v.get('description'))
        BOARD.write_bytes(BAK.read_bytes())
        print('REVERTED: rule area introduced violations')
        return 1
    print('ACCEPTED: QFN_ESC rule area added')
    return 0


if __name__ == '__main__':
    sys.exit(main())
