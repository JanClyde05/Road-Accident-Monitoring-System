"""Export an identity-checked prototype fabrication package; never change active CAD."""
from pathlib import Path
import hashlib, json, shutil, subprocess, sys, zipfile
import pcbnew as p
from prepare_assembly_drawing import prepare

R = Path(__file__).resolve().parents[1]
CLI = Path(sys.executable).with_name('kicad-cli.exe')
OUT = R / 'manufacturing/JLC_PROTOTYPE_20261115'
manifest = json.loads((R / 'reports/final_validation_manifest.json').read_text())
sha = lambda f: hashlib.sha256(f.read_bytes()).hexdigest()
for section in ['source_sha256', 'report_sha256', 'support_sha256']:
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
shutil.copytree(R / 'previews/schematic', OUT / 'previews/schematic')
shutil.copytree(R / 'evidence/sources', OUT / 'evidence/sources')
for name in manifest['report_sha256']:
    dest = OUT / name; dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(R / name, dest)
shutil.copy2(R/'reports/final_validation_manifest.json',OUT/'reports/final_validation_manifest.json')
shutil.copytree(R/'reports/final_geometry',OUT/'reports/final_geometry',dirs_exist_ok=True)
shutil.copytree(R/'reports/firmware_j2',OUT/'reports/firmware_j2',dirs_exist_ok=True)
shutil.copytree(R/'reports/fab_impedance_20261114',OUT/'reports/fab_impedance_20261114')
for name in ['fab_mask_edit.json','fab_rf_edit.json','fab_legend_spacing_plan_20261114.json']:
    shutil.copy2(R/'reports'/name,OUT/'reports'/name)
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
drawing_board=prepare(board,OUT/'drawing_sources')
run('sch','export','pdf','--output',drawings/'schematic.pdf',source/'RAMS_JLC_S3.kicad_sch')
for side in ['top','bottom']:
    for scale in [1,4]:
        for kind in ['assembly','pad_map']:
            args=['pcb','export','pdf','--layers',('F.Fab' if side=='top' else 'B.Fab')+',Edge.Cuts','--black-and-white','--mode-single','--scale',str(scale),'--output',drawings/f'{kind}_{side}_{scale}x.pdf']
            if kind=='pad_map':args.append('--sketch-pads-on-fab-layers')
            if side=='bottom': args.append('--mirror')
            run(*args,drawing_board)

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

shutil.copy2(R/'docs/JLC_ORDER_INSTRUCTIONS.md',OUT/'READ_ME_FIRST.md')
# Upload ZIPs contain only the selected manufacturing artwork, never native
# sources, review reports or alternate-stage stencil layers.
def artwork_zip(path, files):
    assert not path.exists(),path
    with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED) as z:
        for f in files:z.write(f,f.name)
    with zipfile.ZipFile(path) as z:assert z.testzip() is None
artwork_zip(OUT/'RAMS_J2_JLC_BARE_BOARD.zip',[f for f in fab.iterdir() if f.suffix in ['.gtl','.g1','.g2','.gbl','.gts','.gbs','.gto','.gbo','.gm1','.drl','.gbrjob']])
for stage in ['first_power','normal_after_qualification']:
    artwork_zip(OUT/('RAMS_J2_TOP_STENCIL_'+stage.upper()+'.zip'),list((stencils/stage).glob('*.gtp')))
for section in ['source_sha256','report_sha256','support_sha256']:
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
print('Prototype fabrication package',OUT,'files',len(files),'ZIP SHA256',sha(archive),flush=True)
