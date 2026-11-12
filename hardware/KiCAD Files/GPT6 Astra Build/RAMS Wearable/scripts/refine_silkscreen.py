"""Apply JLC's published 1mm text/0.15mm stroke target; retain original board."""
from pathlib import Path
from datetime import datetime
import pcbnew as p,shutil,json
r=Path(__file__).resolve().parents[1];src=r/'RAMS_JLC_S3.kicad_pcb';run=r/'verification'/('silk_'+datetime.now().strftime('%Y%m%d_%H%M%S'));run.mkdir();shutil.copy2(src,run/src.name);b=p.LoadBoard(str(src));changes=[];remove=[]
for obj in list(b.GetDrawings()):
 if obj.GetLayer() not in [p.F_SilkS,p.B_SilkS]:continue
 if isinstance(obj,p.PCB_TEXT):
  if obj.GetText()=='3V3':remove.append(obj);changes.append('Removed crowded 3V3 label; assembly drawing identifies TP2');continue
  obj.SetTextSize(p.VECTOR2I(p.FromMM(1.),p.FromMM(1.)));obj.SetTextThickness(p.FromMM(.15));changes.append(obj.GetText())
for fp in b.GetFootprints():
 for obj in fp.GraphicalItems():
  if obj.GetLayer() not in [p.F_SilkS,p.B_SilkS]:continue
  if isinstance(obj,p.PCB_SHAPE) and obj.GetWidth()<p.FromMM(.15):obj.SetWidth(p.FromMM(.15))
for obj in remove:b.Remove(obj)
assert p.SaveBoard(str(src),b);(run/'changes.json').write_text(json.dumps(changes,indent=2)+'\n');print(run)
