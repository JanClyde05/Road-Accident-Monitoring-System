"""Scoped one-shot U1 mask/paste correction. Preserves input before writing.

Requires KiCad Python. Does not change copper, pins, nets or component positions.
Run subsequent verification in a fresh process.
"""
from pathlib import Path
import hashlib, json, shutil
import pcbnew as p

R = Path(__file__).resolve().parents[1]
BOARD = R / 'RAMS_JLC_S3.kicad_pcb'
EXPECTED = 'd59c7348a7ca82d890a9c0347848d4778a9ddeb140f87ee5ff83a3dc22fd5aa8'
sha = lambda f: hashlib.sha256(f.read_bytes()).hexdigest()
assert sha(BOARD) == EXPECTED, 'Input changed; review rather than replay this one-shot edit'
backup = R / 'verification/prefab_before_20261114'
if backup.exists():
    assert sha(backup / BOARD.name) == EXPECTED
    for name, digest in json.loads((backup/'sha256.json').read_text()).items():
        assert sha(backup/name) == digest, name
else:
    backup.mkdir()
    for f in R.iterdir():
        if f.is_file() and (f.suffix in ['.kicad_pcb', '.kicad_sch', '.kicad_pro', '.kicad_dru'] or f.name in ['circuit_spec.json','fp-lib-table','sym-lib-table','README.md']):
            shutil.copy2(f, backup / f.name)
    for name in ['lib','reports','docs']:
        shutil.copytree(R / name, backup / name)
    (backup / 'sha256.json').write_text(json.dumps({str(f.relative_to(backup)).replace('\\','/'):sha(f) for f in backup.rglob('*') if f.is_file()}, indent=2)+'\n')

def correct(footprint):
    assert footprint.GetOrientationDegrees() == 0
    pads = list(footprint.Pads())
    ep = next(q for q in pads if q.GetNumber() == '57')
    assert ep.GetSize() == p.VECTOR2I(p.FromMM(5.7), p.FromMM(5.7))
    layers = ep.GetLayerSet(); layers.RemoveLayer(p.F_Mask); ep.SetLayerSet(layers)
    paste = [q for q in pads if not q.GetNumber() and q.IsOnLayer(p.F_Paste)]
    assert len(paste) == 16
    for q in paste:
        assert q.GetSize() == p.VECTOR2I(p.FromMM(1.12),p.FromMM(1.12))
        q.SetShape(p.PAD_SHAPE_CHAMFERED_RECT)
        q.SetRoundRectRadiusRatio(0)
        q.SetChamferRectRatio(.06 / 1.12)
        q.SetChamferPositions(15)
        mask = p.PAD(footprint)
        mask.SetNumber(''); mask.SetAttribute(p.PAD_ATTRIB_SMD)
        mask.SetShape(p.PAD_SHAPE_CHAMFERED_RECT)
        mask.SetSize(p.VECTOR2I(p.FromMM(1.2),p.FromMM(1.2)))
        mask.SetPosition(q.GetPosition())
        mask.SetRoundRectRadiusRatio(0)
        mask.SetChamferRectRatio(.1 / 1.2)
        mask.SetChamferPositions(15)
        layers = p.LSET(); layers.AddLayer(p.F_Mask); mask.SetLayerSet(layers)
        footprint.Add(mask)
    footprint.SetLibDescription('ESP32-S3FH4R2 QFN56: EP5.7mm copper; 16x1.2mm chamfered mask windows; 16x1.12mm chamfered paste windows, 61.42% EP paste. Nine board-added 0.20mm GND vias top tented, bottom open. See FAB_MASK_REVIEW_20261114.md.')

b = p.LoadBoard(str(BOARD))
u = next(f for f in b.GetFootprints() if f.GetReference() == 'U1')
correct(u)
vias = []
for v in b.GetTracks():
    if not isinstance(v,p.PCB_VIA): continue
    d = v.GetPosition() - u.GetPosition()
    if abs(d.x) <= p.FromMM(1.401) and abs(d.y) <= p.FromMM(1.401):
        assert v.GetNetname() == 'GND' and v.GetDrillValue() == p.FromMM(.2)
        v.SetFrontTentingMode(p.TENTING_MODE_TENTED)
        v.SetBackTentingMode(p.TENTING_MODE_NOT_TENTED)
        vias.append(v)
assert len(vias) == 9
p.SaveBoard(str(BOARD),b)
lib = R / 'lib/RAMS_JLC.pretty'
fp = p.FootprintLoad(str(lib),'ESP32-S3FH4R2_QFN56_EP5p7')
correct(fp)
p.FootprintSave(str(lib),fp)
(R/'reports/fab_mask_edit.json').write_text(json.dumps({'before_sha256':EXPECTED,'after_sha256':sha(BOARD),'backup':str(backup.relative_to(R)),'ground_vias_top_tented_bottom_open':9,'mask_window_side_mm':1.2,'mask_corner_chamfer_mm':.1,'paste_window_side_mm':1.12,'paste_corner_chamfer_mm':.06,'paste_coverage_percent':100*16*(1.12**2-2*.06**2)/5.7**2},indent=2)+'\n')
print('Saved backed-up U1 mask/paste correction; fresh-process verification required.')
