"""One-time F.Fab readability correction; no copper or production legend changes."""
from pathlib import Path
from datetime import datetime
import shutil
import pcbnew as p
r=Path(__file__).resolve().parents[1];file=r/'RAMS_JLC_S3.kicad_pcb'
out=r/'verification'/('assembly_labels_'+datetime.now().strftime('%Y%m%d_%H%M%S'));out.mkdir();shutil.copy2(file,out/file.name)
b=p.LoadBoard(str(file));fps={f.GetReference():f for f in b.GetFootprints()}
for ref in ['ANT1','Y1','D3',*[f'TP{i}' for i in range(1,9)]]:
 f=fps[ref]; texts=[a for a in f.GraphicalItems() if isinstance(a,p.PCB_TEXT) and a.GetText()=='${REFERENCE}' and a.GetLayer()==p.F_Fab]
 assert len(texts)<=1
 if texts:t=texts[0]
 else:
  t=p.PCB_TEXT(f);t.SetText('${REFERENCE}');t.SetLayer(p.F_Fab);f.Add(t)
 t.SetPosition(f.GetPosition());t.SetTextSize(p.VECTOR2I(p.FromMM(.55),p.FromMM(.55)));t.SetTextThickness(p.FromMM(.08))
 t.SetTextAngle(p.EDA_ANGLE(0,p.DEGREES_T))
 if ref=='D3':t.SetPosition(p.VECTOR2I(p.FromMM(140.7),p.FromMM(117)))
assert p.SaveBoard(str(file),b)
print('Updated 11 assembly labels; production copper/mask/paste/legend unchanged',out)
