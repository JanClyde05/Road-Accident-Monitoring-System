"""One-time in-place U6 bypass correction; does not rebuild the routed board."""
import json, shutil
from pathlib import Path
from datetime import datetime
import pcbnew as p
ROOT=Path(__file__).resolve().parents[1]
target=ROOT/'RAMS_JLC_S3.kicad_pcb'
run=ROOT/'verification'/('bypass_'+datetime.now().strftime('%Y%m%d_%H%M%S'));run.mkdir()
shutil.copy2(target,run/target.name)
b=p.LoadBoard(str(target));fps={f.GetReference():f for f in b.GetFootprints()}
assert 'C35' not in fps,'This migration has already run'
spec=json.loads((ROOT/'circuit_spec.json').read_text());manifest=json.loads((ROOT/'schematic_manifest.json').read_text())
c=next(c for c in spec['components'] if c['ref']=='C35')
fp=p.FootprintLoad(r'C:/Program Files/KiCad/10.0/share/kicad/footprints/Capacitor_SMD.pretty','C_0402_1005Metric')
b.Add(fp);fp.SetReference('C35');fp.SetValue(c['value']);fp.SetFPID(p.LIB_ID(*c['footprint'].split(':')))
fp.SetPosition(p.VECTOR2I(p.FromMM(134.7),p.FromMM(101.65)))
fp.SetPath(p.KIID_PATH(manifest['C35']['path']));fp.SetUuid(p.KIID(manifest['C35']['uuid']))
fp.Value().SetVisible(False);fp.Reference().SetVisible(False)
fp.Reference().SetTextSize(p.VECTOR2I(p.FromMM(.65),p.FromMM(.65)));fp.Reference().SetTextThickness(p.FromMM(.1))
for a in fp.Pads():a.SetNet(b.FindNet(c['pins'][a.GetNumber()]))
# Remove only segments touching the old bypass pads, preserving all other branches.
old=fps['C34'];removed=[]
for t in list(b.GetTracks()):
 if isinstance(t,p.PCB_VIA) or t.GetLayer()!=p.F_Cu:continue
 for a in old.Pads():
  if t.GetNetname()==a.GetNetname() and any(a.GetEffectiveShape(p.F_Cu).Collide(q) for q in [t.GetStart(),t.GetEnd()]):
   removed.append(str(t.m_Uuid.AsString()));b.Remove(t);break
old.SetPosition(p.VECTOR2I(p.FromMM(130.2),p.FromMM(100.8)));old.SetOrientationDegrees(0)
overrides=json.loads((ROOT/'placement_overrides.json').read_text())
overrides['C34']=[130.2,100.8,0];overrides['C35']=[134.7,101.65,0]
(ROOT/'placement_overrides.json').write_text(json.dumps(overrides,indent=2)+'\n')
p.SaveBoard(str(target),b)
(run/'changes.json').write_text(json.dumps({'C35':overrides['C35'],'C34':overrides['C34'],'removed_touching_segments':removed},indent=2)+'\n')
print('Added C35, moved C34;',len(removed),'old pad-connected segments removed;',run)
