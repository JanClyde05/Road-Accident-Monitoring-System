"""Reserve L3 ground beneath the bottom USB transition; reroute CC1 separately."""
from pathlib import Path
from datetime import datetime
import pcbnew as p,shutil,json
r=Path(__file__).resolve().parents[1];src=r/'RAMS_JLC_S3.kicad_pcb';run=r/'verification'/('usb_reference_'+datetime.now().strftime('%Y%m%d_%H%M%S'));run.mkdir();shutil.copy2(src,run/src.name);b=p.LoadBoard(str(src))
assert not any(z.GetZoneName()=='USB_REFERENCE_L3' for z in b.Zones())
z=p.ZONE(b);z.SetLayer(p.In2_Cu);z.SetIsRuleArea(True);z.SetZoneName('USB_REFERENCE_L3');z.SetDoNotAllowTracks(True);z.SetDoNotAllowVias(False);z.SetDoNotAllowPads(False);z.SetDoNotAllowFootprints(False);z.SetDoNotAllowZoneFills(False);o=z.Outline();o.NewOutline()
for x,y in [(104.9,123.6),(108.,123.6),(108.,126.9),(104.9,126.9)]:o.Append(p.FromMM(x),p.FromMM(y))
b.Add(z);removed=[]
for t in list(b.GetTracks()):
 if not isinstance(t,p.PCB_VIA) and t.GetNetname()=='CC1' and t.GetLayer()==p.In2_Cu:removed.append(t.m_Uuid.AsString());b.Remove(t)
assert p.SaveBoard(str(src),b);(run/'removed.json').write_text(json.dumps(removed,indent=2)+'\n');print(run,len(removed))
