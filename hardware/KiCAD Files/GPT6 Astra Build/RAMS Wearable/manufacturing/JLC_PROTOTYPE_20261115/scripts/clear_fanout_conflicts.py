"""Reconnect noncritical routes after moving the RF bypass placement."""
from pathlib import Path
from datetime import datetime
import pcbnew as p,json,shutil
r=Path(__file__).resolve().parents[1];s=r/'RAMS_JLC_S3.kicad_pcb';o=r/'verification'/('rf_clearance_'+datetime.now().strftime('%Y%m%d_%H%M%S'));o.mkdir();shutil.copy2(s,o/s.name);b=p.LoadBoard(str(s));removed=[]
# Move placement before deleting route objects (KiCad SWIG proxy lifetime).
for f in b.GetFootprints():
 if f.GetReference()=='L1':
  f.SetPosition(p.VECTOR2I(p.FromMM(105.85),p.FromMM(110.6)));f.SetOrientationDegrees(180)
for t in list(b.GetTracks()):
 uid=t.m_Uuid.AsString();net=t.GetNetname();remove=False
 if net in ['MCU_EN','BOOT_BTN','SYS_EN']:
  if isinstance(t,p.PCB_VIA):
   x=p.ToMM(t.GetPosition().x);y=p.ToMM(t.GetPosition().y)
   remove=not((net=='MCU_EN' and abs(x-110.65)<.001 and abs(y-110.5)<.001) or (net=='BOOT_BTN' and abs(x-109.95)<.001 and abs(y-111.15)<.001))
  else:
   remove=not(t.GetLayer()==p.F_Cu and min(p.ToMM(t.GetStart().x),p.ToMM(t.GetEnd().x))>=109.9 and max(p.ToMM(t.GetStart().x),p.ToMM(t.GetEnd().x))<=111.6 and 110.4<=p.ToMM(t.GetStart().y)<=111.2)
 if uid in ['2154780e-5f8e-4f7e-a8ff-3f2b0c785a93','6d46d3ca-3574-42f4-8f14-cb69f6780822']:remove=True
 if remove:removed.append([uid,net]);b.Remove(t)
for a,z in [([110.15,110.4],[109.28,110.4]),([109.28,110.4],[109.28,111.0])]:
 t=p.PCB_TRACK(b);t.SetStart(p.VECTOR2I(*[p.FromMM(v) for v in a]));t.SetEnd(p.VECTOR2I(*[p.FromMM(v) for v in z]));t.SetWidth(p.FromMM(.15));t.SetLayer(p.F_Cu);t.SetNet(b.FindNet('VDD_RF'));t.SetLocked(True);b.Add(t)
assert p.SaveBoard(str(s),b)
(o/'removed.json').write_text(json.dumps(removed,indent=2));ov=json.loads((r/'placement_overrides.json').read_text());ov['L1']=[105.85,110.6,180];(r/'placement_overrides.json').write_text(json.dumps(ov,indent=2))
check=p.LoadBoard(str(s));f=next(f for f in check.GetFootprints() if f.GetReference()=='L1');assert abs(p.ToMM(f.GetPosition().x)-105.85)<.001
print(o,len(removed),'removed; placement saved and reloaded')
