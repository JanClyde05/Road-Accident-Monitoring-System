"""Join isolated ground copper using clearance-checked through vias.

Native KiCad polygons model copper, including plated layer connections. DRC must
still run afterward; this helper is not a substitute for the manufacturing checks.
"""
from pathlib import Path
import collections,math
import pcbnew as k
ROOT=Path(__file__).resolve().parents[1];P=ROOT/'RAMS - PCB.kicad_pcb'
b=k.LoadBoard(str(P));gnd=b.FindNet('/GND');code=gnd.GetNetCode()
layers=[k.F_Cu,k.B_Cu];mm=k.FromMM
items=list(b.GetPads())+list(b.GetTracks())
copper={};parent={};pads={};obstacles=k.SHAPE_POLY_SET()
for layer in layers:
    poly=k.SHAPE_POLY_SET()
    for z in b.Zones():
        if z.GetNetCode()==code and z.IsOnLayer(layer) and not z.GetIsRuleArea():poly.BooleanAdd(z.GetFilledPolysList(layer))
    for item in items:
        if not item.IsOnLayer(layer):continue
        shape=k.SHAPE_POLY_SET()
        if item.GetNetCode()==code:
            item.TransformShapeToPolygon(shape,layer,0,1000,k.ERROR_INSIDE);poly.BooleanAdd(shape)
        else:
            item.TransformShapeToPolygon(shape,layer,mm(.51),1000,k.ERROR_OUTSIDE);obstacles.BooleanAdd(shape)
    poly.Simplify();copper[layer]=poly
    for i in range(poly.OutlineCount()):parent[(layer,i)]=(layer,i)
def find(a):
    while parent[a]!=a:a=parent[a]
    return a
def union(a,b):parent[find(a)]=find(b)
def at(layer,pos):return [(layer,i) for i in range(copper[layer].OutlineCount()) if copper[layer].Contains(pos,i)]
for item in items:
    if item.GetNetCode()!=code or not isinstance(item,(k.PAD,k.PCB_VIA)):continue
    groups=[n for layer in layers if item.IsOnLayer(layer) for n in at(layer,item.GetPosition())]
    for n in groups[1:]:union(groups[0],n)
    if isinstance(item,k.PAD):pads[item.GetParentFootprint().GetReference()+'.'+item.GetNumber()]=groups
main=find(pads['U1.57'][0]);added=[]
for iteration in range(30):
    groups=collections.defaultdict(list)
    for n in parent:groups[find(n)].append(n)
    if len(groups)==1:break
    best=None
    for group,parts in groups.items():
        if group==find(main):continue
        for layer,index in parts:
            box=copper[layer].Outline(index).BBox()
            for x in range(int(math.ceil(k.ToMM(box.GetX())*4)),int(math.floor(k.ToMM(box.GetRight())*4))+1):
                for y in range(int(math.ceil(k.ToMM(box.GetY())*4)),int(math.floor(k.ToMM(box.GetBottom())*4))+1):
                    px,py=x/4,y/4
                    if not(100.8<px<141.2 and 100.8<py<131.2):continue
                    if px<107.8 and py<106.8:continue
                    p=k.VECTOR2I(mm(px),mm(py))
                    if not copper[layer].Contains(p,index) or obstacles.Contains(p):continue
                    other=[n for n in at(layers[1] if layer==layers[0] else layers[0],p) if find(n)!=group]
                    if not other:continue
                    if any((px-a)**2+(py-bb)**2<.7**2 for a,bb in added):continue
                    existing=[t for t in items if isinstance(t,k.PCB_VIA)]
                    if any((t.GetPosition()-p).EuclideanNorm()<mm(.65) for t in existing):continue
                    best=(p,(layer,index),other[0],px,py);break
                if best:break
            if best:break
        if best:break
    if not best:break
    p,a,other,x,y=best
    via=k.PCB_VIA(b);via.SetPosition(p);via.SetWidth(mm(.6));via.SetDrill(mm(.3))
    via.SetViaType(k.VIATYPE_THROUGH);via.SetLayerPair(k.F_Cu,k.B_Cu);via.SetNet(gnd);b.Add(via)
    union(a,other);added.append((x,y));print('Added ground via',x,y,flush=True)
remaining=collections.defaultdict(list)
for ref,gs in pads.items():
    for g in {find(n) for n in gs}:remaining[g].append(ref)
print('Remaining ground groups',dict(remaining),flush=True)
k.ZONE_FILLER(b).Fill(b.Zones());k.SaveBoard(str(P),b)
print('Added',len(added),'vias; run DRC to verify')
