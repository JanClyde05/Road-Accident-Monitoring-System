"""One-time small reference nudges from native DRC; preserve copper and backup."""
from pathlib import Path
from datetime import datetime
import json,shutil
import pcbnew as p
R=Path(__file__).resolve().parents[1];path=R/'RAMS_JLC_S3.kicad_pcb'
backup=R/'verification'/('legend_clearances_'+datetime.now().strftime('%Y%m%d_%H%M%S'));backup.mkdir();shutil.copy2(path,backup/path.name)
planpath=R/'reports/silkscreen_final_plan.json';plan=json.loads(planpath.read_text())
assert 'native_clearance_nudges' not in plan,'One-time adjustment already applied'
b=p.LoadBoard(str(path));fps={f.GetReference():f for f in b.GetFootprints()}
changes={'R4':(0,.025),'C5':(-.05,0),'R1':(-.025,0),'R7':(0,.1),'R6':(0,.05),'R8':(-.025,0),'Q3':(-.05,0),'R3':(.05,0),'C35':(0,-.025),'C10':(.025,0),'C26':(0,-.025),'R42':(-.05,0),'C14':(-.05,0),'SW2':(-.025,0),'C15':(-.025,0),'C25':(-.025,0),'C32':(-.025,0),'SW1':(.025,0)}
for ref,(dx,dy) in changes.items():
 t=fps[ref].Reference();t.SetPosition(t.GetPosition()+p.VECTOR2I(p.FromMM(dx),p.FromMM(dy)))
 plan['labels'][ref]['xy']=[p.ToMM(t.GetPosition().x),p.ToMM(t.GetPosition().y)]
boot=next(g for g in b.GetDrawings() if isinstance(g,p.PCB_TEXT) and g.GetText()=='BOOT')
boot.SetPosition(p.VECTOR2I(p.FromMM(125.3),p.FromMM(105.0)))
plan['functional_text']['BOOT']['xy']=[125.3,105.0]
plan['native_clearance_nudges']={'references':changes,'BOOT':[0,.1],'reason':'Preserved0.15mm silk clearance; failed report readability_drc_3.json retained.'}
p.SaveBoard(str(path),b);planpath.write_text(json.dumps(plan,indent=2)+'\n')
print('Adjusted',len(changes),'reference fields and BOOT; backup',backup)
