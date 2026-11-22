"""One-shot RF width correction after official JLC calculator review."""
from pathlib import Path
import hashlib,json
import pcbnew as p
R=Path(__file__).resolve().parents[1]
f=R/'RAMS_JLC_S3.kicad_pcb'
sha=lambda:hashlib.sha256(f.read_bytes()).hexdigest()
before=sha()
assert before==json.loads((R/'reports/fab_mask_edit.json').read_text())['after_sha256']
b=p.LoadBoard(str(f));changes=[]
for t in b.GetTracks():
    if isinstance(t,p.PCB_VIA) or t.GetNetname() not in ['RF_MATCH','ANT_TUNE','ANT_FEED']:continue
    assert t.GetWidth()==p.FromMM(.18)
    changes.append({'uuid':t.m_Uuid.AsString(),'net':t.GetNetname(),'from_mm':.18,'to_mm':.15})
    t.SetWidth(p.FromMM(.15))
assert len(changes)==34,len(changes)
p.SaveBoard(str(f),b)
(R/'reports/fab_rf_edit.json').write_text(json.dumps({'before_sha256':before,'after_sha256':sha(),'changes':changes,'reason':'Official JLC coated-coplanar calculator: .15mm gives 48.52 ohm, vs .18mm 44.51 ohm. Same centreline/endpoints; antenna keepout part remains antenna matching geometry, not a uniform 50 ohm line.'},indent=2)+'\n')
print('Updated 34 RF segments from .18 to .15 mm; ground refill and audits required.')
