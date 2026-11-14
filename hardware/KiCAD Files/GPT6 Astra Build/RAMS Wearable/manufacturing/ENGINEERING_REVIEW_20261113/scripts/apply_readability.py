"""Apply a reviewed complete reference plan and model-only attachments.

No footprint, pad, track, via or zone is moved. The pre-edit board is retained.
Run with KiCad Python. Subsequent edits require DRC and electrical comparison.
"""
from pathlib import Path
from datetime import datetime
import json, shutil
from uuid import uuid5,NAMESPACE_URL
import pcbnew as p
from apply_models import apply_models
R=Path(__file__).resolve().parents[1]
path=R/'RAMS_JLC_S3.kicad_pcb'
plan=json.loads((R/'reports/silkscreen_final_plan.json').read_text())
assert not plan['unplaced']
backup=R/'verification'/('readability_applied_'+datetime.now().strftime('%Y%m%d_%H%M%S'))
backup.mkdir();shutil.copy2(path,backup/path.name)
b=p.LoadBoard(str(path));fps={f.GetReference():f for f in b.GetFootprints()}
assert set(fps)==set(plan['labels'])
for ref,v in plan['labels'].items():
 f=fps[ref];t=f.Reference()
 t.SetVisible(True);t.SetLayer(p.B_SilkS if f.IsFlipped() else p.F_SilkS)
 h=v.get('height_mm',plan['height_mm']);t.SetTextSize(p.VECTOR2I(p.FromMM(h),p.FromMM(h)))
 t.SetTextThickness(p.FromMM(plan['stroke_mm']))
 t.SetTextAngle(p.EDA_ANGLE(v['angle'],p.DEGREES_T));t.SetKeepUpright(False)
 t.SetMirrored(f.IsFlipped());t.SetPosition(p.VECTOR2I(*[p.FromMM(n) for n in v['xy']]))
models=apply_models(b)
for text,edit in plan.get('functional_text',{}).items():
 g=next(g for g in b.GetDrawings() if isinstance(g,p.PCB_TEXT) and g.GetText()==text)
 g.SetPosition(p.VECTOR2I(*[p.FromMM(n) for n in edit['xy']]))
 g.SetTextSize(p.VECTOR2I(p.FromMM(edit['height_mm']),p.FromMM(edit['height_mm'])))
 g.SetTextThickness(p.FromMM(edit['stroke_mm']))
for ref,leader in plan.get('leaders',{}).items():
 for index,(a,z) in enumerate(zip(leader['points'],leader['points'][1:])):
  identifier=str(uuid5(NAMESPACE_URL,f'RAMS-J2-reference-leader:{ref}:{index}'))
  assert identifier not in {g.m_Uuid.AsString() for g in b.GetDrawings()},'Leader already applied'
  g=p.PCB_SHAPE();g.SetShape(p.SHAPE_T_SEGMENT);g.SetLayer(p.F_SilkS if leader['side']=='F' else p.B_SilkS)
  g.SetStart(p.VECTOR2I(*[p.FromMM(n) for n in a]));g.SetEnd(p.VECTOR2I(*[p.FromMM(n) for n in z]));g.SetWidth(p.FromMM(leader['width_mm']))
  g.SetUuid(p.KIID(identifier));b.Add(g)
assert p.SaveBoard(str(path),b)
print('Saved',len(fps),'references and',len(models),'models; backup',backup)
