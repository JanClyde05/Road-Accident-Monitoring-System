"""Read-only visible glyph, clearance, body and owner-selection checks."""
from pathlib import Path
import hashlib,json
import pcbnew as p
from review_fab_legend import character_gaps
from finalize_fab_legend import bounds,box_distance
R=Path(__file__).resolve().parents[1];path=R/'RAMS_JLC_S3.kicad_pcb'
sha=lambda:hashlib.sha256(path.read_bytes()).hexdigest()
digest=sha();b=p.LoadBoard(str(path));fps={f.GetReference():f for f in b.GetFootprints()}
selection=json.loads((R/'reports/fab_label_selection.json').read_text())
omitted=set(selection['assembly_drawing_only_references'])
texts={r:f.Reference() for r,f in fps.items() if f.Reference().IsVisible()}
assert set(fps)-set(texts)==omitted
visible=len(texts)
gaps={}
for ref,t in texts.items():
 angle=t.GetTextAngle().AsDegrees();t.SetTextAngle(p.EDA_ANGLE(0,p.DEGREES_T))
 gaps[ref]=character_gaps(t);t.SetTextAngle(p.EDA_ANGLE(angle,p.DEGREES_T))
 assert min(gaps[ref])>.15,(ref,gaps[ref])
texts.update({g.GetText():g for g in b.GetDrawings() if isinstance(g,p.PCB_TEXT) and g.GetLayer() in [p.F_SilkS,p.B_SilkS]})
shapes={r:t.GetEffectiveTextShape() for r,t in texts.items()}
obstacles=[];bodies=[]
for ref,f in fps.items():
 side=p.B_SilkS if f.IsFlipped() else p.F_SilkS
 fab=p.B_Fab if f.IsFlipped() else p.F_Fab
 boxes=[bounds(g.GetEffectiveShape()) for g in f.GraphicalItems() if isinstance(g,p.PCB_SHAPE) and g.GetLayer()==fab]
 if boxes:bodies.append((side,(min(q[0] for q in boxes),min(q[1] for q in boxes),max(q[2] for q in boxes),max(q[3] for q in boxes)),ref))
 for g in f.GraphicalItems():
  if g.GetLayer() in [p.F_SilkS,p.B_SilkS]:obstacles.append((g.GetLayer(),g.GetEffectiveShape(),'graphic '+ref,.15))
 for q in f.Pads():
  for cu,sl in [(p.F_Cu,p.F_SilkS),(p.B_Cu,p.B_SilkS)]:
   if q.IsOnLayer(cu):obstacles.append((sl,q.GetEffectiveShape(cu),'pad '+ref+'.'+q.GetNumber(),.15))
for g in b.GetDrawings():
 if isinstance(g,p.PCB_SHAPE) and g.GetLayer() in [p.F_SilkS,p.B_SilkS]:obstacles.append((g.GetLayer(),g.GetEffectiveShape(),'board graphic',.15))
minimum=10.;minedge=10.
for name,s in shapes.items():
 t=texts[name];bb=bounds(s);side=t.GetLayer()
 assert t.GetTextSize().y>=p.FromMM(.8) and t.GetTextThickness()>=p.FromMM(.1),name
 edge=min(bb[0]-100,bb[1]-100,142-bb[2],132-bb[3]);minedge=min(minedge,edge);assert edge>=.25,(name,edge)
 for os,ob,ref in bodies:
  assert side!=os or min(bb[2],ob[2])<=max(bb[0],ob[0]) or min(bb[3],ob[3])<=max(bb[1],ob[1]),(name,'body',ref)
 for os,o,ref,c in obstacles:
  if side!=os or box_distance(bb,bounds(o))>c:continue
  d=p.ToMM(s.GetClearance(o));minimum=min(minimum,d);assert d>=c-.000002,(name,ref,d)
 for other,o in shapes.items():
  if name>=other or side!=texts[other].GetLayer() or box_distance(bb,bounds(o))>.15:continue
  d=p.ToMM(s.GetClearance(o));minimum=min(minimum,d);assert d>=.15-.000002,(name,other,d)
assert sha()==digest
report={'date':'2026-11-15','board_sha256':digest,'visible_references':visible,'assembly_drawing_only_references':sorted(omitted),'height_min_mm':.8,'stroke_min_mm':.1,'character_gaps_mm':gaps,'minimum_inter_character_gap_mm':min(min(v) for v in gaps.values()),'minimum_edge_mm':minedge,'body_overlaps':0,'silk_pad_or_silk_collisions':0,'positions':{r:{'xy_mm':[p.ToMM(t.GetPosition().x),p.ToMM(t.GetPosition().y)],'angle':t.GetTextAngle().AsDegrees(),'size_mm':[p.ToMM(t.GetTextSize().x),p.ToMM(t.GetTextSize().y)]} for r,t in texts.items()},'owner_decision':selection['owner_decision']}
(R/'reports/fab_label_validation.json').write_text(json.dumps(report,indent=2)+'\n')
print('Printable labels passed',visible,'references; minimum character gap',report['minimum_inter_character_gap_mm'])
