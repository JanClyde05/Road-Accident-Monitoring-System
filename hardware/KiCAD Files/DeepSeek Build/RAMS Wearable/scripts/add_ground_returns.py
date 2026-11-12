"""Place explicit GND return vias close to pads using native shape collision tests."""
import json,math
from pathlib import Path
import pcbnew as p
ROOT=Path(__file__).resolve().parents[1]
b=p.LoadBoard(str(ROOT/'RAMS_JLC_S3.kicad_pcb'))
mm=p.FromMM
pads=[pa for fp in b.GetFootprints() for pa in fp.Pads()]
tracks=list(b.GetTracks())
other=[pa for pa in pads if pa.GetNetname()!='GND']+ [t for t in tracks if t.GetNetname()!='GND']
def pt(x,y):return p.VECTOR2I(mm(x),mm(y))
returns=[];missing=[]
used=[(p.ToMM(t.GetPosition().x),p.ToMM(t.GetPosition().y)) for t in tracks if isinstance(t,p.PCB_VIA)]
for pa in pads:
    if pa.GetNetname()!='GND' or pa.GetAttribute()==p.PAD_ATTRIB_PTH:continue
    ref=pa.GetParentFootprint().GetReference();number=pa.GetNumber()
    if (ref=='U1' and number=='57') or (ref=='U5' and number=='15'):continue
    center=pa.GetPosition();cx=p.ToMM(center.x);cy=p.ToMM(center.y)
    layer=p.B_Cu if pa.IsOnLayer(p.B_Cu) and not pa.IsOnLayer(p.F_Cu) else p.F_Cu
    candidates=[]
    for radius in [.7,.85,1.,1.2,1.4,1.6,2.0]:
        for deg in range(0,360,45):
            x=round(cx+radius*math.cos(math.radians(deg)),3);y=round(cy+radius*math.sin(math.radians(deg)),3)
            if not(100.55<x<141.45 and 100.55<y<131.45):continue
            if x<106.8 and y<106.8:continue
            if any(math.hypot(x-vx,y-vy)<.52 for vx,vy in used):continue
            v=pt(x,y)
            # Keep via holes out of all solder lands, including the pad being joined.
            if any(q.IsOnLayer(lay) and q.GetEffectiveShape(lay).Collide(v,mm(.18)) for q in pads for lay in [p.F_Cu,p.B_Cu]):continue
            seg=p.SEG(center,v)
            bad=False
            for q in other:
                if isinstance(q,p.PAD):
                    for lay in [p.F_Cu,p.B_Cu]:
                        if q.IsOnLayer(lay) and q.GetEffectiveShape(lay).Collide(v,mm(.40)):bad=True;break
                    if q.IsOnLayer(layer) and q.GetEffectiveShape(layer).Collide(seg,mm(.26)):bad=True
                else:
                    if q.GetEffectiveShape().Collide(v,mm(.40)):bad=True
                    if q.GetLayer()==layer and q.GetEffectiveShape().Collide(seg,mm(.26)):bad=True
                if bad:break
            if not bad:candidates.append((radius,x,y))
        if candidates:break
    if candidates:
        _,x,y=min(candidates);returns.append([ref,number,x,y,cx,cy,'B_Cu' if layer==p.B_Cu else 'F_Cu']);used.append((x,y))
    else:missing.append(ref+'.'+number)
(ROOT/'ground_vias.json').write_text(json.dumps(returns,indent=2)+'\n')
(ROOT/'verification/baseline/ground_return_candidates.json').write_text(json.dumps({'explicit_returns':len(returns),'zone_only_pending_check':missing},indent=2)+'\n')
print('Explicit near-pad ground returns',len(returns),'zone-only pending check',missing)
