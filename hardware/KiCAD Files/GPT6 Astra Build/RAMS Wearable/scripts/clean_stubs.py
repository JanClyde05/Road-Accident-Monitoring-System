"""Remove native-identified dangling copper, guarding zero-connectivity regressions."""
from pathlib import Path
from datetime import datetime
import subprocess,json,shutil,sys
r=Path(__file__).resolve().parents[1];src=r/'RAMS_JLC_S3.kicad_pcb';run=r/'verification'/('stub_cleanup_'+datetime.now().strftime('%Y%m%d_%H%M%S'));run.mkdir()
cli=r'C:/Program Files/KiCad/10.0/bin/kicad-cli.exe';py=r'C:/Program Files/KiCad/10.0/bin/python.exe'
report=Path(sys.argv[1]);changes=[]
for step in range(15):
 d=json.loads(report.read_text());assert not d['unconnected_items'],'Connectivity is not closed'
 ids=[v['items'][0]['uuid'] for v in d['violations'] if v['type'] in ['track_dangling','via_dangling']]
 if not ids:break
 backup=run/f'pass_{step:02d}.kicad_pcb';shutil.copy2(src,backup)
 code="""import pcbnew as p,json,sys
b=p.LoadBoard(sys.argv[1]);ids=set(json.loads(sys.argv[2]));found=0
for t in list(b.GetTracks()):
 if t.m_Uuid.AsString() in ids:b.Remove(t);found+=1
assert found==len(ids),(found,ids)
assert p.SaveBoard(sys.argv[1],b)
"""
 result=subprocess.run([py,'-c',code,str(src),json.dumps(ids)],capture_output=True,text=True)
 assert result.returncode==0,result.stdout+result.stderr
 subprocess.run([py,str(r/'scripts/project_settings.py')],check=True,capture_output=True)
 report=run/f'pass_{step:02d}.json'
 result=subprocess.run([cli,'pcb','drc','--format','json','--schematic-parity','--output',str(report),str(src)],capture_output=True,text=True)
 assert result.returncode==0,result.stdout+result.stderr
 d=json.loads(report.read_text())
 if d['unconnected_items']:
  shutil.copy2(backup,src);raise RuntimeError(f'Pruning broke connectivity; reverted pass {step}; inspect {report}')
 changes.append({'step':step,'removed':ids,'remaining':len(d['violations'])});print(changes[-1],flush=True)
else:raise RuntimeError('Stub cleanup exceeded 15 guarded passes')
(run/'changes.json').write_text(json.dumps(changes,indent=2)+'\n');print('Cleanup complete',report,flush=True)
