"""Snapshot plan inputs once; check local links, source hashes and artifact scope.

Run with --capture once to create source_manifest.json. Subsequent runs verify
the snapshot without replacing it. This is document QA, not electrical/DFM QA.
"""
import hashlib
import json
import re
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
PLAN = HERE.parent
ROOT = PLAN.parents[2]
MANIFEST = HERE / 'source_manifest.json'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def inputs():
    paths = {ROOT / name for name in ('AGENTS.md', 'DIRECTORY_MAP.md', '00_SYSTEM_ARCHITECTURE.md')}
    for folder in ('docs/Parts List I Currently Have', 'docs/For PCB Ordering - DOST'):
        paths.update(p for p in (ROOT / folder).iterdir() if p.is_file())
    for name in ('config.h', 'battery.h', 'battery.cpp', 'lora_tx.cpp', 'gps.cpp', 'bt_service.cpp'):
        paths.add(ROOT / 'firmware/wearable_withApp' / name)
    paths.add(ROOT / 'firmware/shared/protocol.h')
    base = ROOT / 'hardware/KiCAD Files/Antigravity Build'
    for folder in ('RAMS - PCB', 'RAMS - PCB - Rev B', 'RAMS - PCB - Rev C', 'RAMS Wearable - PCB/GEMINI Build'):
        directory = base / folder
        for path in directory.iterdir():
            if path.is_file() and (path.suffix in {'.md', '.json', '.py', '.kicad_pcb', '.kicad_sch', '.kicad_pro', '.kicad_dru'} or path.name in {'fp-lib-table', 'sym-lib-table'}):
                paths.add(path)
        for library in directory.iterdir():
            if library.is_dir() and (library.name == 'lib' or library.suffix == '.pretty'):
                paths.update(p for p in library.rglob('*') if p.is_file() and p.suffix in {'.kicad_mod', '.kicad_sym'})
    paths.add(base / 'RAMS - PCB/JLCPCB_ORDER_PACKAGE/1_GERBERS_RAMS_PCB.zip')
    paths.add(base / 'RAMS - PCB/JLCPCB_ORDER_PACKAGE/PARTS_LIST_FOR_ORDERING.md')
    return sorted(paths)


if '--capture' in sys.argv:
    if MANIFEST.exists():
        raise SystemExit('Snapshot exists. Preserve it; do not silently overwrite provenance.')
    rows = []
    for path in inputs():
        assert path.is_file(), f'Missing source: {path}'
        rows.append({'path': path.relative_to(ROOT).as_posix(), 'bytes': path.stat().st_size, 'sha256': digest(path)})
    snapshot = {'captured_at': datetime.now(timezone(timedelta(hours=8))).isoformat(),
                'scope': 'Planning-input snapshot; listed files are evidence, not all accepted design sources.',
                'repository_root': str(ROOT), 'files': rows}
    MANIFEST.write_text(json.dumps(snapshot, indent=2) + '\n', encoding='utf-8')

assert MANIFEST.exists(), 'Run --capture once first.'
manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
for row in manifest['files']:
    path = ROOT / row['path']
    assert path.is_file() and digest(path) == row['sha256'], f'Source changed: {path}'

expected = {
    'RAMS - PCB.kicad_pcb': 'cccc6209cfafdab1f8c6d15217eb72f07c533188559bad071022571ead0909b4',
    'JLCPCB_ORDER_PACKAGE/1_GERBERS_RAMS_PCB.zip': '0c74cf696dfba11d9b9548588514f9f0b6437286112295032579ac4183284c24',
}
original = ROOT / 'hardware/KiCAD Files/Antigravity Build/RAMS - PCB'
for name, sha in expected.items():
    assert digest(original / name) == sha, f'Original baseline identity changed: {name}'

chapters = sorted(PLAN.glob('[0-9][0-9]_*.md'))
assert len(chapters) == 8, f'Expected start file and seven chapters, got {len(chapters)}'
links = 0
for path in chapters:
    content = path.read_text(encoding='utf-8-sig')
    assert '\ufffd' not in content, f'Invalid text: {path}'
    assert content.count('```') % 2 == 0, f'Unclosed code fence: {path}'
    for target in re.findall(r'\]\(([^)]+)\)', content):
        if target.startswith(('https://', 'http://', '#')):
            continue
        local = unquote(target.strip('<>').split('#', 1)[0])
        assert (path.parent / local).exists(), f'Broken link in {path.name}: {target}'
        links += 1
assert not list(PLAN.rglob('*.kicad_pcb')), 'Unexpected CAD implementation in planning folder'
assert not list(PLAN.rglob('*.kicad_sch')), 'Unexpected schematic implementation in planning folder'
assert not list(PLAN.rglob('*.gbr')), 'Unexpected Gerber implementation in planning folder'

report = {'checked_at': datetime.now(timezone(timedelta(hours=8))).isoformat(),
          'result': 'passed', 'chapters': len(chapters), 'local_markdown_links': links,
          'source_files_matching_snapshot': len(manifest['files']),
          'original_board_and_order_zip': 'match previously recorded SHA-256',
          'scope': 'Document QA only. No fresh complete ERC/DRC, supplier acceptance or physical tests.',
          'chapter_sha256': {p.name: digest(p) for p in chapters}}
(HERE / 'plan_validation.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k != 'chapter_sha256'}, indent=2))
