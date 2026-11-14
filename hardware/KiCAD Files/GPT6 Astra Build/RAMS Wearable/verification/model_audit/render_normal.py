"""Read-only active-board preview: show LED1/R30 in a private normal-population copy."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import subprocess
import sys
import pcbnew

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'RAMS_JLC_S3.kicad_pcb'
OUT = ROOT / 'previews/final'
PRIVATE = Path(__file__).parent / 'normal_population_preview.kicad_pcb'
CLI = 'C:/Program Files/KiCad/10.0/bin/kicad-cli.exe'
LIB = 'C:/Program Files/KiCad/10.0/share/kicad/3dmodels'

before = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
board = pcbnew.LoadBoard(str(SOURCE))
sys.path.insert(0,str(ROOT/'scripts'))
from apply_models import apply_models
apply_models(board,absolute_paths=True)
population = []
for ref in ('LED1', 'R30'):
    fp = board.FindFootprintByReference(ref)
    population.append({'reference': ref, 'before_attributes': fp.GetAttributes()})
    fp.SetAttributes(fp.GetAttributes() & ~pcbnew.FP_DNP)
for fp in board.GetFootprints():
    for model in fp.Models():
        model.m_Filename = model.m_Filename.replace('${KIPRJMOD}', str(ROOT)).replace('${KICAD10_3DMODEL_DIR}', LIB)
        assert Path(model.m_Filename).is_file(), model.m_Filename
pcbnew.SaveBoard(str(PRIVATE), board)
OUT.mkdir(exist_ok=True)

def render(isometric):
    filename = 'top_3d_normal_isometric.png' if isometric else 'top_3d_normal.png'
    args = [CLI, 'pcb', 'render', '--side', 'top', '--width', '1600', '--height', '1200',
            '--output', str(OUT / filename), '--zoom', '0.95']
    if isometric:
        args += ['--rotate', '-35,0,35']
    result = subprocess.run(args + [str(PRIVATE)], capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    return filename

with ThreadPoolExecutor(max_workers=2) as pool:
    files = list(pool.map(render, (False, True)))
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == before, 'Active PCB changed during preview; regenerate.'
(OUT / 'normal_population_source.json').write_text(json.dumps({
    'source_board_sha256': before,
    'private_board_sha256': hashlib.sha256(PRIVATE.read_bytes()).hexdigest(),
    'note': 'Illustrative normal-population preview only; active PCB/BOM/DNP flags unchanged.',
    'dnp_cleared_only': population,
    'files': {name: hashlib.sha256((OUT / name).read_bytes()).hexdigest() for name in files}
}, indent=2) + '\n')
print(json.dumps({'source_sha256': before, 'rendered': files}))
