"""Widen the SCK escape between adjacent signal vias, retaining original CAD."""
from pathlib import Path
from datetime import datetime
import json,shutil
import pcbnew as p
ROOT=Path(__file__).resolve().parents[1];target=ROOT/'RAMS_JLC_S3.kicad_pcb'
run=ROOT/'verification'/('fanout_'+datetime.now().strftime('%Y%m%d_%H%M%S'));run.mkdir()
shutil.copy2(target,run/target.name);b=p.LoadBoard(str(target))
v=next(t for t in b.GetTracks() if isinstance(t,p.PCB_VIA) and t.GetNetname()=='LORA_MOSI' and abs(p.ToMM(t.GetPosition().x)-112.7804)<.001)
old=v.GetPosition();new=p.VECTOR2I(p.FromMM(112.63),old.y)
changed=[]
for t in b.GetTracks():
 if isinstance(t,p.PCB_VIA) or t.GetNetname()!=v.GetNetname():continue
 if t.GetStart()==old:t.SetStart(new);changed.append(t.m_Uuid.AsString())
 if t.GetEnd()==old:t.SetEnd(new);changed.append(t.m_Uuid.AsString())
v.SetPosition(new)
spec=json.loads((ROOT/'circuit_spec.json').read_text())
for f in b.GetFootprints():
 if f.GetReference()=='C35':f.GetField(p.FIELD_T_DESCRIPTION).SetText(next(c['description'] for c in spec['components'] if c['ref']=='C35'))
p.SaveBoard(str(target),b);(run/'change.json').write_text(json.dumps({'MOSI_via':[112.63,p.ToMM(new.y)],'attached_tracks':changed},indent=2)+'\n')
print(run)
