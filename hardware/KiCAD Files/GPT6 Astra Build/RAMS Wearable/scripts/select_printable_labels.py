"""Apply the owner's printable-legend + complete assembly-map decision to candidate."""
from pathlib import Path
import json
import pcbnew as p
R=Path(__file__).resolve().parents[1]
path=R/'verification/fab_legend_candidate_20261115/RAMS_JLC_S3.kicad_pcb'
b=p.LoadBoard(str(path));fps={f.GetReference():f for f in b.GetFootprints()}
omit=['L4','C19','C12','C26','C21','C27','C13','C15','R7','L1','SW2','SW3']
for ref in omit:fps[ref].Reference().SetVisible(False)
def move(t,x,y):t.SetPosition(p.VECTOR2I(p.FromMM(x),p.FromMM(y)))
for ref,x,y in [('TP5',122.9,105.4),('TP6',124.4,110.8),('TP7',127.2,110.8),('FB1',125.4,105.8)]:
 t=fps[ref].Reference();move(t,x,y);t.SetTextAngle(p.EDA_ANGLE(0,p.DEGREES_T));t.SetVisible(True)
for g in b.GetDrawings():
 if isinstance(g,p.PCB_TEXT) and g.GetText()=='BOOT':
  move(g,128.835105,102.725);g.SetTextSize(p.VECTOR2I(p.FromMM(.8),p.FromMM(.8)));g.SetTextThickness(p.FromMM(.1));g.SetTextAngle(p.EDA_ANGLE(90,p.DEGREES_T))
# Remove the old L4 leader; L4 is now explicitly in the assembly drawing only.
remove=[g for g in b.GetDrawings() if isinstance(g,p.PCB_SHAPE) and g.GetLayer()==p.F_SilkS and g.GetStart().y==p.FromMM(106.35)]
for g in remove:b.Remove(g)
p.SaveBoard(str(path),b)
(R/'reports/fab_label_selection.json').write_text(json.dumps({'date':'2026-11-15','owner_decision':'Printable on-board labels where they fit, plus a complete labeled assembly drawing for every component','assembly_drawing_only_references':omit,'visible_references':90-len(omit),'note':'Candidate; clearance polish/DRC/visual review required before promotion. RST and BOOT functional labels identify SW2 and SW3.'},indent=2)+'\n')
print('Selected',90-len(omit),'printable references; remaining',len(omit),'in assembly drawings.')
