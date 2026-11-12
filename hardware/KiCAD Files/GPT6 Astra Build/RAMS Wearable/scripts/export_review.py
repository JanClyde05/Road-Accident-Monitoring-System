"""Export an identity-checked engineering package; never change active CAD."""
from pathlib import Path
import hashlib, json, shutil, subprocess, sys, zipfile
import pcbnew as p

R = Path(__file__).resolve().parents[1]
CLI = Path(sys.executable).with_name('kicad-cli.exe')
OUT = R / 'manufacturing/ENGINEERING_REVIEW_20261112'
manifest = json.loads((R / 'reports/final_validation_manifest.json').read_text())
sha = lambda f: hashlib.sha256(f.read_bytes()).hexdigest()
for section in ['source_sha256', 'report_sha256']:
    for name, digest in manifest[section].items():
        assert sha(R / name) == digest, f'Stale validation: {name}'
drc = json.loads((R / 'reports/final_drc.json').read_text())
erc = json.loads((R / 'reports/final_erc.json').read_text())
assert not any(drc[k] for k in ['violations','unconnected_items','schematic_parity','ignored_checks'])
assert not erc['ignored_checks'] and not any(s['violations'] for s in erc['sheets'])
assert not OUT.exists(), f'Retain previous package; choose a new output directory: {OUT}'
OUT.mkdir(parents=True)
source = OUT / 'source'; source.mkdir()
for name in manifest['source_sha256']:
    dest = source / name; dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(R / name, dest)
shutil.copy2(R / 'README.md', OUT / 'PROJECT_README.md')
shutil.copytree(R / 'docs', OUT / 'docs')
shutil.copytree(R / 'scripts', OUT / 'scripts', ignore=shutil.ignore_patterns('__pycache__'))
shutil.copytree(R / 'previews/final', OUT / 'previews')
shutil.copytree(R / 'evidence/sources', OUT / 'evidence/sources')
for name in ['final_validation_manifest.json','FINAL_VALIDATION.md','final_drc.json','final_erc.json','power_paths_final.json']:
    dest = OUT / 'reports' / name; dest.parent.mkdir(exist_ok=True)
    shutil.copy2(R / 'reports' / name, dest)
shutil.copytree(R / 'reports/final_geometry', OUT / 'reports/final_geometry')
shutil.copytree(R / 'reports/firmware_j2', OUT / 'reports/firmware_j2')
board = source / 'RAMS_JLC_S3.kicad_pcb'
commands = []
def run(*args):
    cmd = [str(CLI), *map(str, args)]
    result = subprocess.run(cmd, capture_output=True, text=True)
    commands.append({'args':cmd,'exit_code':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
    (OUT / 'export_commands.json').write_text(json.dumps(commands,indent=2)+'\n')
    assert result.returncode == 0, result.stdout + result.stderr
    print(' '.join(map(str,args[:3])), flush=True)

fab = OUT / 'bare_board'; fab.mkdir()
run('pcb','export','gerbers','--layers','F.Cu,In1.Cu,In2.Cu,B.Cu,F.Mask,B.Mask,F.SilkS,B.SilkS,Edge.Cuts','--subtract-soldermask','--output',str(fab)+'/',board)
run('pcb','export','drill','--format','excellon','--drill-origin','absolute','--excellon-units','mm','--excellon-oval-format','route','--excellon-separate-th','--generate-map','--generate-report','--map-format','pdf','--output',str(fab)+'/',board)
assert len(list(fab.glob('*.drl'))) == 2
assert all(list(fab.glob('*'+ext)) for ext in ['.gtl','.g1','.g2','.gbl','.gts','.gbs','.gto','.gbo','.gm1'])
drawings = OUT / 'drawings'; drawings.mkdir()
run('sch','export','pdf','--output',drawings/'schematic.pdf',source/'RAMS_JLC_S3.kicad_sch')
for side in ['top','bottom']:
    for scale in [1,4]:
        for kind in ['assembly','pad_map']:
            args=['pcb','export','pdf','--layers',('F.Fab' if side=='top' else 'B.Fab')+',Edge.Cuts','--black-and-white','--mode-single','--scale',str(scale),'--output',drawings/f'{kind}_{side}_{scale}x.pdf']
            if kind=='pad_map':args.append('--sketch-pads-on-fab-layers')
            if side=='bottom': args.append('--mirror')
            run(*args,board)

stencils = OUT / 'stencils'; stencils.mkdir()
for stage in ['normal_after_qualification','first_power']:
    folder=stencils/stage; folder.mkdir()
    b=p.LoadBoard(str(board)); fps={f.GetReference():f for f in b.GetFootprints()}
    for ref in ['R30','LED1']:
        fps[ref].SetDNP(False)
        if stage=='first_power':
            for q in fps[ref].Pads():
                layers=q.GetLayerSet(); layers.RemoveLayer(p.F_Paste); q.SetLayerSet(layers)
    assert not any(q.IsOnLayer(p.F_Paste) for q in fps['BZ1'].Pads())
    assert not any(q.IsOnLayer(p.F_Paste) for q in fps['U2'].Pads())
    stage_board=folder/f'{stage}_PASTE_ONLY.kicad_pcb'
    assert p.SaveBoard(str(stage_board),b)
    run('pcb','export','gerbers','--layers','F.Paste','--output',str(folder)+'/',stage_board)
    assert len(list(folder.glob('*.gtp'))) == 1

(OUT/'READ_ME_FIRST.md').write_text('''# J2 engineering review package — not a fabrication release

This is the 42 × 32 mm, four-layer AP2112 version. No buck/boost converter.
No order or upload has been made. Read docs/JLC_MANUFACTURING_REVIEW.md and
docs/ASSEMBLY_AND_BRINGUP.md before using these files.

- source/: unchanged, hash-checked native KiCad project and local libraries.
- bare_board/: four copper layers, two masks, two legends, outline, separate
  plated/nonplated Excellon drills, drill maps/report. No assembly purchase implied.
- drawings/: four-page schematic, separate readable assembly and numbered pad
  maps for top/bottom, each at 1:1 and 4:1.
  Print 1:1 at actual size (no fit-to-page); verify the 42 × 32 mm outline.
- stencils/first_power/: top paste excludes R30, LED1, BZ1 and bottom Ra-02.
- stencils/normal_after_qualification/: top paste includes R30 and LED1.
  Both omit hand-soldered BZ1 and Ra-02. PASTE_ONLY boards are derived artwork
  sources, not replacement fabrication PCBs. Use only the selected .gtp file.
- docs/BOM_PROCUREMENT.csv: owned/procure/qualification notes and staged assembly.
- reports/: zero native CAD findings and their exact sources; physical tests open.
- previews/: copper, mask, paste, legend and assembly plots; incomplete illustrative
  3D models. The absent 3D bodies do not mean those components are omitted.

Proposed fabrication: JLC04161H-3313, 1.6 mm, four layers, outer 1 oz / inner
0.5 oz, green mask, white legend, ENIG. Proposed stencil: 0.10 mm, reproduce
reviewed paste apertures 1:1. Supplier must confirm final impedance and process.
Do not substitute stackup or use the former two-layer prototype order settings.

Open before release: RF/USB impedance review; actual connector/switch/buzzer,
protection MOSFET and LED fit/identity; selected paste and QFN thermal-via
soldering process. Battery/charger, power/temperature, USB, ADC, LED timing,
oscillator and RF performance require assembled-board measurements.
CAD checks and renders are not a claim of working hardware.
''',encoding='utf-8')
for section in ['source_sha256','report_sha256']:
    for name,digest in manifest[section].items():
        assert sha(R/name)==digest, f'Active source changed during export: {name}'
for name,digest in manifest['source_sha256'].items():
    assert sha(source/name)==digest, f'Export modified frozen source: {name}'
files={str(f.relative_to(OUT)).replace('\\','/'):sha(f) for f in OUT.rglob('*') if f.is_file()}
(OUT/'SHA256_MANIFEST.json').write_text(json.dumps(files,indent=2)+'\n')
archive=OUT.with_suffix('.zip')
assert not archive.exists()
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for f in OUT.rglob('*'):
        if f.is_file():z.write(f,str(f.relative_to(OUT)))
print('Review package',OUT,'files',len(files),'ZIP SHA256',sha(archive),flush=True)
