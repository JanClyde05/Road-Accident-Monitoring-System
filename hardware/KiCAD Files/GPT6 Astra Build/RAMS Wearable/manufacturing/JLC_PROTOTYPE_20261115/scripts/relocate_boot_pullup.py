"""Move the BOOT pull-up out of its enclosed routing pocket; retain sources."""
import pcbnew as p,math,json,shutil
from pathlib import Path
from datetime import datetime
r=Path(__file__).resolve().parents[1];src=r/'RAMS_JLC_S3.kicad_pcb';run=r/'verification'/('boot_pullup_'+datetime.now().strftime('%Y%m%d_%H%M%S'));run.mkdir();shutil.copy2(src,run/src.name)
b=p.LoadBoard(str(src));fps=list(b.GetFootprints());f=next(f for f in fps if f.GetReference()=='R34');old=[(a.GetNetname(),a.GetPosition()) for a in f.Pads()];tracks=list(b.GetTracks())
def rect(fp):
 fp.BuildCourtyardCaches();bb=fp.GetCourtyard(p.F_CrtYd).BBox();return [p.ToMM(z) for z in [bb.GetX(),bb.GetY(),bb.GetRight(),bb.GetBottom()]]
boxes=[rect(g) for g in fps if g!=f and g.IsOnLayer(p.F_Cu)]
pads=[a for g in fps if g!=f for a in g.Pads() if a.IsOnLayer(p.F_Cu)]
candidates=sorted([(dx/5,dy/5,angle) for dx in range(-30,61) for dy in range(-65,41) for angle in [0,90]],key=lambda z:z[0]**2+z[1]**2)
chosen=None
for dx,dy,angle in candidates:
 x,y=110.2+dx,115.3+dy
 if math.hypot(dx,dy)<1.5:continue
 f.SetPosition(p.VECTOR2I(p.FromMM(x),p.FromMM(y)));f.SetOrientationDegrees(angle);q=rect(f)
 if q[0]<106.6 or q[1]<100.3 or q[2]>141.7 or q[3]>131.7:continue
 if any(q[0]<z[2]+.03 and q[2]+.03>z[0] and q[1]<z[3]+.03 and q[3]+.03>z[1] for z in boxes):continue
 collision=False
 for a in f.Pads():
  shape=a.GetEffectiveShape(p.F_Cu)
  for t in tracks:
   if t.GetNetname()==a.GetNetname():continue
   if isinstance(t,p.PCB_VIA) or t.GetLayer()==p.F_Cu:
    if shape.Collide(t.GetEffectiveShape(p.F_Cu),p.FromMM(.16)):collision=True;break
  if collision:break
  if any(a.GetNetname()!=c.GetNetname() and shape.Collide(c.GetEffectiveShape(p.F_Cu),p.FromMM(.16)) for c in pads):collision=True;break
 if not collision:chosen=[round(x,3),round(y,3),angle];break
assert chosen,'No clean local placement'
removed=[]
for t in tracks:
 if isinstance(t,p.PCB_VIA):continue
 if t.GetLayer()==p.F_Cu and any(t.GetNetname()==net and (t.GetStart()==at or t.GetEnd()==at) for net,at in old):removed.append(t.m_Uuid.AsString());b.Remove(t)
report=json.loads((r/'verification/finish_20261110_225140/drc.json').read_text());dangling={i['items'][0]['uuid'] for i in report['violations'] if i['type'] in ['track_dangling','via_dangling']}
for t in list(b.GetTracks()):
 if t.m_Uuid.AsString() in dangling:removed.append(t.m_Uuid.AsString());b.Remove(t)
assert p.SaveBoard(str(src),b)
over=json.loads((r/'placement_overrides.json').read_text());over['R34']=chosen;(r/'placement_overrides.json').write_text(json.dumps(over,indent=2)+'\n');(run/'changes.json').write_text(json.dumps({'R34':chosen,'removed':removed},indent=2)+'\n');print(chosen,run)
