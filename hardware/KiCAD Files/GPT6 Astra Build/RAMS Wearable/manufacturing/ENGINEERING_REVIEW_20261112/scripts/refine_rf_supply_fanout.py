"""Local RF supply placement correction and explicit GPIO escape candidates."""
from pathlib import Path
from datetime import datetime
import json,shutil
import pcbnew as p
ROOT=Path(__file__).resolve().parents[1];target=ROOT/'RAMS_JLC_S3.kicad_pcb'
run=ROOT/'verification'/('rf_fanout_'+datetime.now().strftime('%Y%m%d_%H%M%S'));run.mkdir()
shutil.copy2(target,run/target.name);b=p.LoadBoard(str(target));fps={f.GetReference():f for f in b.GetFootprints()}
def xy(x,y):return p.VECTOR2I(p.FromMM(x),p.FromMM(y))
def coords(v):return [p.ToMM(v.x),p.ToMM(v.y)]
def pad(ref,num):return next(a for a in fps[ref].Pads() if a.GetNumber()==num)
c11_vdd=coords(pad('C11','1').GetPosition())
changes=[]
old_l1=[a.GetPosition() for a in fps['L1'].Pads()]
for t in list(b.GetTracks()):
 remove=t.GetNetname()=='VDD_RF'
 if t.GetNetname()=='GND':
  points=[t.GetPosition()] if isinstance(t,p.PCB_VIA) else [t.GetStart(),t.GetEnd()]
  if any(107.5<p.ToMM(q.x)<110.4 and 110.5<p.ToMM(q.y)<113.0 for q in points):remove=True
 if not isinstance(t,p.PCB_VIA) and t.GetNetname()=='+3V3' and any(q==v for q in [t.GetStart(),t.GetEnd()] for v in old_l1):remove=True
 if remove:changes.append({'removed':t.m_Uuid.AsString(),'net':t.GetNetname()});b.Remove(t)
overrides=json.loads((ROOT/'placement_overrides.json').read_text())
for ref,x,y,rotation in [('L1',106.5,111.4,270),('C12',108.8,111.,180),('C13',108.8,112.1,180)]:
 fps[ref].SetPosition(xy(x,y));fps[ref].SetOrientationDegrees(rotation);overrides[ref]=[x,y,rotation]
def route(net,points,width=.15):
 for start,end in zip(points,points[1:]):
  t=p.PCB_TRACK(b);t.SetStart(xy(*start));t.SetEnd(xy(*end));t.SetWidth(p.FromMM(width));t.SetLayer(p.F_Cu);t.SetNet(b.FindNet(net));t.SetLocked(True);b.Add(t)
 changes.append({'net':net,'points':points,'width':width})
def via(net,at):
 v=p.PCB_VIA(b);v.SetPosition(xy(*at));v.SetWidth(p.FromMM(.45));v.SetDrill(p.FromMM(.2));v.SetViaType(p.VIATYPE_THROUGH);v.SetLayerPair(p.F_Cu,p.B_Cu);v.SetNet(b.FindNet(net));b.Add(v);changes.append({'net':net,'via':at})
route('VDD_RF',[[111.55,110.2],[111.55,109.8],[110.15,109.8],[110.15,110.4],[109.55,111.0],[109.28,111.0]])
route('VDD_RF',[[109.28,111.0],[109.28,112.1]],.25)
route('VDD_RF',[[109.28,112.1],[109.28,112.75],c11_vdd],.25)
fanouts=[('MCU_EN',[[111.55,110.6],[110.8,110.6],[110.7,110.5],[110.65,110.5]]),
 ('BOOT_BTN',[[111.55,111.0],[110.1,111.0],[109.95,111.15]]),
 ('BUZZER_CTRL',[[111.55,111.4],[110.55,111.4],[110.3,111.65]]),
 ('VBAT_SENSE',[[111.55,111.8],[110.85,111.8],[110.85,112.15],[109.95,112.15]])]
for net,points in fanouts:route(net,points);via(net,points[-1])
for start,at in [([108.32,111.0],[108.32,110.2]),([108.32,112.1],[107.65,112.7])]:
 route('GND',[start,at],.2);via('GND',at)
p.SaveBoard(str(target),b);(ROOT/'placement_overrides.json').write_text(json.dumps(overrides,indent=2)+'\n')
(run/'changes.json').write_text(json.dumps(changes,indent=2)+'\n');print(run)
