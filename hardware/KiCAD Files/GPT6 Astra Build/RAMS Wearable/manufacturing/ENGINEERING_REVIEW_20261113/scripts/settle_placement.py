"""Deterministic small-part placement using actual KiCad courtyard bounds.

This is a placement aid, not an electrical/layout acceptance check. All resulting
locations are persisted for review. Critical nets are manually routed afterwards.
"""
import json, math
from pathlib import Path
import pcbnew as p
ROOT=Path(__file__).resolve().parents[1]
board=p.LoadBoard(str(ROOT/'RAMS_JLC_S3.kicad_pcb'))
if any(not isinstance(t,p.PCB_VIA) for t in board.GetTracks()):
    raise SystemExit('Refusing to regenerate placement inputs from a routed PCB. See scripts/README.md.')
spec=json.loads((ROOT/'circuit_spec.json').read_text())
byref={c['ref']:c for c in spec['components']}
fps={fp.GetReference():fp for fp in board.GetFootprints()}
anchor={'U1':[115,112,0],'Y1':[112.8,103.9,0],'ANT1':[102.6,103.2,180],
 'SW1':[102.5,111.0,270],'SW2':[118.9,102.7,0],'SW3':[125.3,102.7,0],
 'J1':[106.5,129.0,0],'J2':[115.2,128.1,0],'BZ1':[135.3,125,0],'LED1':[136.5,104,0],
 'U5':[124,122.0,0],'U4':[119.92,129.4,90],'Q3':[125.5,129.3,90],
 'D1':[106.5,121.9,90],'D2':[102.2,119.3,90],'U3':[132.5,110.5,0],
 'Q1':[111,121,0],'Q4':[123.8,116.3,0],'Q2':[135,116.8,90],
 'U6':[131.3,103.3,0],'Q5':[136.6,109.4,0],'R13':[134.8,106.5,90],
 'C34':[129,103.2,90],'C28':[138.9,103.8,90],'R41':[136.6,112.1,90],
 'R42':[129.3,109,90],'R43':[138.7,106,90],
 'R38':[117.8,117.3,90],'R39':[116.4,117.3,90],'R11':[111.5,117.0,0],
 'R37':[119.4,119.0,90],
 'C10':[126.8,123.0,270],'C7':[121.2,123.0,90],
 'C14':[109.5,106,90],'C21':[111.2,106.8,90],'C22':[109.8,108.3,90],
 'R9':[112.9,106.825,90],'C15':[116.4,106.7,90],
 'C24':[110.0,103.8,90],'C25':[115.6,103.8,90],
 'C18':[110.2,109.4,90],'L2':[108.9,109.4,180],'C19':[107.6,109.4,90],
 'C32':[107,107.4,90],'L4':[108.3,106.6,0],'L5':[105.5,105.5,90],
 'C12':[109.8,111.0,180],'C13':[109.8,112.1,180], 'C11':[109.2,113.3,0],
 'C16':[114.4,117.0,270],'C17':[120.5,114.0,0],'C20':[120.5,115.2,0],
 'R15':[123,113.8,90],'R16':[126,115.6,90],'C29':[126,117.1,90],
 'R4':[118.0,126.5,0],'C5':[119.6,126.5,90],'R5':[121.0,126.5,90],
 'R35':[118.5,106.4,90],'R36':[117.3,106.4,90],
 'C26':[128,107.2,0],'C27':[130.1,107.2,90],
 'R1':[112.7,123.2,90],'R2':[111.3,123.2,90],'C1':[113.6,122,90],
 'C2':[104.3,122.5,90],'C3':[132.5,108,0],'C4':[129.5,110.2,90],'R3':[133,113,0]}
fixed={'U1','Y1','ANT1','SW1','SW2','SW3','J1','J2','BZ1','LED1','U5','U6','Q5','U4','Q3','D1','D2','U3','Q1','Q4','Q2'}
for ref,fp in fps.items():
    a=anchor.get(ref,[byref[ref]['pcb_x'],byref[ref]['pcb_y'],byref[ref]['pcb_rotation']])
    if fp.GetLayer()==p.B_Cu:continue
    fp.SetPosition(p.VECTOR2I(p.FromMM(a[0]),p.FromMM(a[1])));fp.SetOrientationDegrees(a[2]);fp.BuildCourtyardCaches()

def rect(fp):
    fp.BuildCourtyardCaches();poly=fp.GetCourtyard(p.F_CrtYd)
    bb=poly.BBox() if poly.OutlineCount() else fp.GetBoundingBox(False,False)
    return tuple(p.ToMM(v) for v in [bb.GetX(),bb.GetY(),bb.GetRight(),bb.GetBottom()])
def intersects(a,b,gap=.02):return a[0]<b[2]+gap and a[2]+gap>b[0] and a[1]<b[3]+gap and a[3]+gap>b[1]
placed={};result={};fail=[]
critical=['R38','R39','R11','R37','C2','C34','C28','L2','C18','C19','C32','L4','L5','R9','C24','C25','C15','C12','C13','C11','L1','C21','C22','C14','C16','C17','C20','C7','C10']
order=sorted([r for r in fps if fps[r].GetLayer()==p.F_Cu],key=lambda r:(0 if r in fixed else 1 if r in critical else 2, critical.index(r) if r in critical else -(rect(fps[r])[2]-rect(fps[r])[0])*(rect(fps[r])[3]-rect(fps[r])[1])))
for ref in order:
    fp=fps[ref];base=anchor.get(ref,[byref[ref]['pcb_x'],byref[ref]['pcb_y'],byref[ref]['pcb_rotation']])
    offsets=[(0,0)] if ref in fixed else sorted([(x/5,y/5) for x in range(-30,31) for y in range(-30,31)],key=lambda a:(a[0]**2+a[1]**2,abs(a[1]),abs(a[0]),a))
    valid=False
    for dx,dy in offsets:
        fp.SetPosition(p.VECTOR2I(p.FromMM(base[0]+dx),p.FromMM(base[1]+dy)));box=rect(fp)
        if ref not in {'J1','J2','SW1'} and (box[0]<100.2 or box[1]<100.2 or box[2]>141.8 or box[3]>131.8):continue
        if ref!='ANT1' and intersects(box,(100,100,106.5,106.5),0):continue
        if any(intersects(box,other) for other in placed.values()):continue
        valid=True;break
    if not valid:
        fail.append(ref);fp.SetPosition(p.VECTOR2I(p.FromMM(base[0]),p.FromMM(base[1])));box=rect(fp)
        print('CONFLICT',ref,box,[(r,b) for r,b in placed.items() if intersects(box,b)])
    placed[ref]=box
    result[ref]=[round(p.ToMM(fp.GetPosition().x),3),round(p.ToMM(fp.GetPosition().y),3),base[2]]
    distance=math.hypot(result[ref][0]-byref[ref]['pcb_x'],result[ref][1]-byref[ref]['pcb_y'])
    if distance>2:print(ref,'moved',round(distance,2),'mm ->',result[ref])
assert not fail, f'Fixed/packing conflicts: {fail}'
(ROOT/'placement_overrides.json').write_text(json.dumps(result,indent=2)+'\n')
print('Saved',len(result),'front placements; no courtyard box overlap. Native DRC required.')
