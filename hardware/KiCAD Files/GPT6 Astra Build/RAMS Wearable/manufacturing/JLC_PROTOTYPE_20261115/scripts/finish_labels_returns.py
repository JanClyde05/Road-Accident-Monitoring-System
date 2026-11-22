"""Readable polarity/control labels and local translator capacitor ground vias."""
from pathlib import Path
from datetime import datetime
import pcbnew as p,shutil,json
r=Path(__file__).resolve().parents[1];src=r/'RAMS_JLC_S3.kicad_pcb';run=r/'verification'/('labels_returns_'+datetime.now().strftime('%Y%m%d_%H%M%S'));run.mkdir();shutil.copy2(src,run/src.name);b=p.LoadBoard(str(src))
def xy(x,y):return p.VECTOR2I(p.FromMM(x),p.FromMM(y))
for t in b.GetDrawings():
 if not isinstance(t,p.PCB_TEXT):continue
 if t.GetText()=='RST':t.SetPosition(xy(114.6,101.0))
 if t.GetText()=='BOOT':t.SetPosition(xy(125.3,105.5))
 if t.GetText()=='BAT +  -':t.SetText('+');t.SetPosition(xy(114.8,131.15))
minus=p.PCB_TEXT(b);minus.SetText('-');minus.SetPosition(xy(115.65,131.15));minus.SetLayer(p.F_SilkS);minus.SetTextSize(xy(1.,1.));minus.SetTextThickness(p.FromMM(.15));b.Add(minus)
for f in b.GetFootprints():
 if f.GetReference()=='BZ1':
  for t in f.GraphicalItems():
   if isinstance(t,p.PCB_TEXT) and t.GetText()=='+':t.SetPosition(xy(129.8,121.8))
for start,end in [([130.68,100.8],[131.4,100.8]),([135.18,101.65],[135.18,100.95])]:
 t=p.PCB_TRACK(b);t.SetStart(xy(*start));t.SetEnd(xy(*end));t.SetLayer(p.F_Cu);t.SetWidth(p.FromMM(.2));t.SetNet(b.FindNet('GND'));b.Add(t)
 v=p.PCB_VIA(b);v.SetPosition(xy(*end));v.SetWidth(p.FromMM(.45));v.SetDrill(p.FromMM(.2));v.SetLayerPair(p.F_Cu,p.B_Cu);v.SetViaType(p.VIATYPE_THROUGH);v.SetNet(b.FindNet('GND'));b.Add(v)
assert p.SaveBoard(str(src),b);print(run)
