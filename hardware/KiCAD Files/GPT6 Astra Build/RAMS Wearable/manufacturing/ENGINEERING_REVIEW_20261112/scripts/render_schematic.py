"""Native ERC, PDF/SVG exports and PNG previews, bound to source hashes."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
NAME = 'RAMS_JLC_S3'
CLI = Path(r'C:\Program Files\KiCad\10.0\bin\kicad-cli.exe')
INKSCAPE = Path(r'D:\Inkscape\bin\inkscape.com')


def main():
    # Schematics embed symbols/layout; PCB saves can rewrite the shared project.
    source_paths = sorted(ROOT.glob(NAME + '*.kicad_sch')) + [ROOT / 'circuit_spec.json']
    hashes = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in source_paths}
    digest = hashlib.sha256(json.dumps(hashes, sort_keys=True).encode()).hexdigest()[:12]
    reports = ROOT / 'reports' / ('schematic_' + digest)
    previews = ROOT / 'previews/schematic'
    reports.mkdir(parents=True, exist_ok=True)
    previews.mkdir(parents=True, exist_ok=True)
    (reports / 'source_hashes.json').write_text(json.dumps(hashes, indent=2) + '\n')

    def run(args):
        result = subprocess.run([str(a) for a in args], capture_output=True, text=True, timeout=180)
        assert result.returncode == 0, result.stdout + result.stderr
        return result.stdout.strip()

    version = run([CLI, 'version'])
    schematic = ROOT / (NAME + '.kicad_sch')
    run([CLI, 'sch', 'erc', '--format', 'json', '--severity-all', '--output', reports / 'erc.json', schematic])
    erc = json.loads((reports / 'erc.json').read_text())
    findings = [v for sheet in erc['sheets'] for v in sheet['violations']]
    run([CLI, 'sch', 'export', 'pdf', '--output', previews / (NAME + '_schematic.pdf'), schematic])
    svg_dir = reports / 'svg'
    run([CLI, 'sch', 'export', 'svg', '--output', svg_dir, schematic])
    for svg in svg_dir.glob('*.svg'):
        destination = previews / svg.name
        shutil.copyfile(svg, destination)
        run([INKSCAPE, destination, '--export-area-page', '--export-width=2400', '--export-filename=' + str(destination.with_suffix('.png'))])
    poppler = shutil.which('pdftoppm')
    if poppler:
        run([poppler, '-png', '-r', '100', previews / (NAME + '_schematic.pdf'), previews / 'pdf_page'])
    assert all(hashlib.sha256((ROOT / p).read_bytes()).hexdigest() == h for p, h in hashes.items()), 'Sources changed during export; rerun'
    summary = {'kicad_version': version, 'violations': len(findings), 'ignored_checks': erc['ignored_checks'], 'reports': str(reports), 'previews': str(previews)}
    (reports / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
    print(json.dumps(summary))
    assert not findings, findings


if __name__ == '__main__':
    main()
