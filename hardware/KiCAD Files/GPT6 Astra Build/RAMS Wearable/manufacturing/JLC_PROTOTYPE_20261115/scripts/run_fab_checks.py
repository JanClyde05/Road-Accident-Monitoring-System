"""Refill/save and run native DRC/ERC, binding raw reports to exact sources."""
from pathlib import Path
import hashlib,json,subprocess
R=Path(__file__).resolve().parents[1]
CLI=r'C:/Program Files/KiCad/10.0/bin/kicad-cli.exe'
sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
source_files=[*R.glob('*.kicad_sch'),R/'RAMS_JLC_S3.kicad_pro',R/'RAMS_JLC_S3.kicad_dru',R/'fp-lib-table',R/'sym-lib-table',*list((R/'lib/RAMS_JLC.pretty').glob('*.kicad_mod')),R/'lib/RAMS_JLC.kicad_sym']
before={str(f.relative_to(R)).replace('\\','/'):sha(f) for f in source_files}
commands=[]
for args in [
 ['pcb','drc','--format','json','--all-track-errors','--schematic-parity','--severity-all','--exit-code-violations','--refill-zones','--save-board','--output',str(R/'reports/final_drc.json'),str(R/'RAMS_JLC_S3.kicad_pcb')],
 ['sch','erc','--format','json','--severity-all','--exit-code-violations','--output',str(R/'reports/final_erc.json'),str(R/'RAMS_JLC_S3.kicad_sch')]]:
 result=subprocess.run([CLI,*args],capture_output=True,text=True)
 commands.append({'args':args,'exit_code':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
 print(result.stdout,result.stderr,flush=True)
 if result.returncode:
  (R/'reports/fab_native_failed.json').write_text(json.dumps(commands,indent=2)+'\n')
  raise SystemExit(result.returncode)
assert before=={str(f.relative_to(R)).replace('\\','/'):sha(f) for f in source_files},'Check input modified during run'
sources=dict(before);sources['RAMS_JLC_S3.kicad_pcb']=sha(R/'RAMS_JLC_S3.kicad_pcb')
reports={name:sha(R/'reports'/name) for name in ['final_drc.json','final_erc.json']}
(R/'reports/fab_native_validation.json').write_text(json.dumps({'date':'2026-11-15','source_sha256':sources,'report_sha256':reports,'commands':commands},indent=2)+'\n')
print('Native checks passed and source-bound',sources['RAMS_JLC_S3.kicad_pcb'])
