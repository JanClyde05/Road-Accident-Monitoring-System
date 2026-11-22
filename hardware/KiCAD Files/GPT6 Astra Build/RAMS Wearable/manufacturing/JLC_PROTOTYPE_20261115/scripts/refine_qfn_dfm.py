"""One-time JLC land-width correction; preserve native placement and routing."""
from pathlib import Path
from datetime import datetime
import json, shutil
import pcbnew as p

r = Path(__file__).resolve().parents[1]
src = r / 'RAMS_JLC_S3.kicad_pcb'
lib = r / 'lib/RAMS_JLC.pretty'
name = 'ESP32-S3FH4R2_QFN56_EP5p7'
run = r / 'verification' / ('qfn_dfm_' + datetime.now().strftime('%Y%m%d_%H%M%S'))
run.mkdir()
for file in [src, lib / (name + '.kicad_mod')]:
    shutil.copy2(file, run / file.name)
b = p.LoadBoard(str(src))
f = next(f for f in b.GetFootprints() if f.GetReference() == 'U1')
lf = p.FootprintLoad(str(lib), name)
for fp in [f, lf]:
    pads = [q for q in fp.Pads() if q.GetNumber() and 1 <= int(q.GetNumber()) <= 56]
    assert len(pads) == 56
    for q in pads:
        size = q.GetSize()
        assert sorted([size.x, size.y]) in [[p.FromMM(.2), p.FromMM(.8)], [p.FromMM(.25), p.FromMM(.8)]]
        q.SetSize(p.VECTOR2I(p.FromMM(.25) if size.x < size.y else size.x,
                            p.FromMM(.25) if size.y < size.x else size.y))
        q.SetLocalSolderPasteMargin(p.FromMM(-.025))
        q.SetLocalSolderPasteMarginRatio(0.0)
    note = ' JLC DFM: perimeter copper 0.8x0.25, paste 0.75x0.20; unchanged centers, 0.4 pitch.'
    if note not in fp.GetLibDescription():
        fp.SetLibDescription(fp.GetLibDescription() + note)
p.FootprintSave(str(lib), lf)
assert p.SaveBoard(str(src), b)
(run / 'change.json').write_text(json.dumps({'pads':56, 'copper_mm':[.8,.25], 'paste_mm':[.75,.2], 'pitch_mm':.4},indent=2)+'\n')
print(run)
