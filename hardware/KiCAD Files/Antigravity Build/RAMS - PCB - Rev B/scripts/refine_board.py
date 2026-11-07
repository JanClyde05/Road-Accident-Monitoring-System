"""Placement corrections following the first physical DRC pass."""
from pathlib import Path
import pcbnew as k
ROOT=Path(__file__).resolve().parents[1];P=ROOT/'RAMS - PCB.kicad_pcb'
b=k.LoadBoard(str(P));v=lambda x,y:k.VECTOR2I(k.FromMM(x),k.FromMM(y))
for ref,x,y,angle in [('C21',112.9,108,0),('C22',112.9,106.4,0),('R9',116,108,0)]:
    fp=b.FindFootprintByReference(ref);pads=list(fp.Pads())
    for t in list(b.GetTracks()):
        if any(p.HitTest(t.GetStart()) or p.HitTest(t.GetEnd()) for p in pads):b.Delete(t)
    fp.SetPosition(v(x,y));fp.SetOrientationDegrees(angle)
    r=fp.Reference();r.SetTextAngle(k.EDA_ANGLE(0,k.DEGREES_T))
    r.SetTextPos(v(x,y-1));r.SetTextSize(v(.6,.6));r.SetTextThickness(k.FromMM(.1))
# Crystal series resistor moved: reroute both sides; preserve the other crystal leg.
for t in list(b.GetTracks()):
    if t.GetNetname() in ('/XTAL_P','/XTAL_P_DRV'):b.Delete(t)
k.ZONE_FILLER(b).Fill(b.Zones())
k.SaveBoard(str(P),b)
assert k.ExportSpecctraDSN(b,str(ROOT/'review/revision.dsn'))
print('Refined placement and exported rerouting input')
