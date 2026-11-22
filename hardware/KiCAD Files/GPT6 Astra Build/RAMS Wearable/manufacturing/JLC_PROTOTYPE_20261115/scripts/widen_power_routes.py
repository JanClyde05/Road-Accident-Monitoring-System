"""Increase DC supply trace widths where existing copper permits; preserve backup.

Uses actual KiCad copper shapes. Zone refill and native DRC are required after
this step. Width alone does not validate the complete load or thermal budget.
"""
from pathlib import Path
from datetime import datetime
import pcbnew as p,json,shutil,collections
r=Path(__file__).resolve().parents[1];src=r/'RAMS_JLC_S3.kicad_pcb';run=r/'verification'/('power_width_'+datetime.now().strftime('%Y%m%d_%H%M%S'));run.mkdir();shutil.copy2(src,run/src.name)
b=p.LoadBoard(str(src));tracks=list(b.GetTracks());pads=[a for f in b.GetFootprints() for a in f.Pads()]
power={'+3V3','SYS_IN','B_PLUS','B_MINUS','VBUS','FET_DRAIN','LORA_VDD','VDD_RF','CHG_IN','LED_PWR'}
changed=[];stats=collections.defaultdict(lambda:collections.defaultdict(float))
for t in tracks:
 if isinstance(t,p.PCB_VIA) or t.GetNetname() not in power:continue
 layer=t.GetLayer();net=t.GetNetname();old=p.ToMM(t.GetWidth());selected=old
 for width in [.7,.5,.35,.25,.2,.18]:
  if width<=old:continue
  a,z=t.GetStart(),t.GetEnd();points=[(p.ToMM(q.x),p.ToMM(q.y)) for q in [a,z]]
  if any(min(x-100,142-x,y-100,132-y)<.26+width/2 for x,y in points):continue
  shape=p.SHAPE_SEGMENT(a,z,p.FromMM(width));hit=False
  for other in tracks:
   if other.GetNetname()==net:continue
   if not isinstance(other,p.PCB_VIA) and other.GetLayer()!=layer:continue
   if shape.Collide(other.GetEffectiveShape(layer),p.FromMM(.16)):hit=True;break
  if hit:continue
  for pad in pads:
   if not pad.IsOnLayer(layer) or pad.GetNetname()==net:continue
   clearance=.26 if pad.GetAttribute()==p.PAD_ATTRIB_NPTH else .16
   if shape.Collide(pad.GetEffectiveShape(layer),p.FromMM(clearance)):hit=True;break
  if not hit:selected=width;break
 if selected>old:
  t.SetWidth(p.FromMM(selected));changed.append({'uuid':t.m_Uuid.AsString(),'net':net,'layer':b.GetLayerName(layer),'length_mm':p.ToMM(t.GetLength()),'old_mm':old,'new_mm':selected})
 stats[net][str(round(selected,3))]+=p.ToMM(t.GetLength())
assert p.SaveBoard(str(src),b)
(run/'width_changes.json').write_text(json.dumps({'changes':changed,'total_length_by_width_mm':stats},indent=2)+'\n')
print('Widened',len(changed),'DC supply segments;',run)
