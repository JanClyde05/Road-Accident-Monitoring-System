"""Read-only native route/plane dimensions for the J2 impedance review."""
from pathlib import Path
import argparse, hashlib, json, math
import pcbnew as p
R = Path(__file__).resolve().parents[1]
src = R / 'RAMS_JLC_S3.kicad_pcb'
digest = hashlib.sha256(src.read_bytes()).hexdigest()
b = p.LoadBoard(str(src)); mm = p.ToMM
args = argparse.ArgumentParser()
args.add_argument('--output', default='geometry.json', help='Report basename; CAD remains read-only')
name = args.parse_args().output
assert Path(name).name == name and name.endswith('.json')
out = R / 'reports/fab_impedance_20261114'; out.mkdir(exist_ok=True)
tracks = list(b.GetTracks())
lines = [t for t in tracks if not isinstance(t,p.PCB_VIA)]
vias = [t for t in tracks if isinstance(t,p.PCB_VIA)]
rf = {'RF_LNA','RF_MATCH','ANT_TUNE','ANT_FEED'}
usb = {f'USB_{a}{c}' for a in ['DP','DN'] for c in ['','_CONN','_ESD']}
layers = [p.F_Cu,p.In1_Cu,p.In2_Cu,p.B_Cu]
zones = {la:[z.GetFilledPolysList(la) for z in b.Zones() if not z.GetIsRuleArea() and z.GetNetname()=='GND' and z.IsOnLayer(la)] for la in layers}
def vec(x,y): return p.VECTOR2I(round(x*1e6),round(y*1e6))
def xy(v): return [mm(v.x),mm(v.y)]
def gnd(point,layer): return any(s.Contains(point) for s in zones[layer])
def ray(x,y,nx,ny,limit=1):
    for i in range(round(limit/.005)+1):
        d=i*.005
        if gnd(vec(x+nx*d,y+ny*d),p.F_Cu):return round(d,4)
    return None
def info(t):return {'uuid':t.m_Uuid.AsString(),'net':t.GetNetname(),'layer':b.GetLayerName(t.GetLayer()),'width_mm':mm(t.GetWidth()),'length_mm':mm(t.GetLength()),'start':xy(t.GetStart()),'end':xy(t.GetEnd())}
report={'board_sha256':digest,'kicad':p.GetBuildVersion(),'sampling':'lateral ground-fill ray step0.005mm to1mm, critical reference sample step<=0.05mm; copper pads and transitions are not uniform lines','segments':[info(t) for t in lines if t.GetNetname() in rf|usb]}
report['vias']=[{'net':v.GetNetname(),'at':xy(v.GetPosition()),'diameter_mm':mm(v.GetWidth(p.F_Cu)),'drill_mm':mm(v.GetDrillValue())} for v in vias if v.GetNetname() in rf|usb]
report['RF_footprints']=[{'ref':f.GetReference(),'value':f.GetValue(),'at':xy(f.GetPosition()),'rotation':f.GetOrientationDegrees(),'pads':[{'number':q.GetNumber(),'net':q.GetNetname(),'at':xy(q.GetPosition())} for q in f.Pads() if q.GetNumber()]} for f in b.GetFootprints() if any(q.GetNetname() in rf for q in f.Pads())]
report['USB_parallel_span']={'x_range_mm':[107.7243,116.1],'upper_y_mm':118.45,'lower_y_mm':118.75,'width_mm':.15,'pair_edge_gap_mm':.15}
report['USB_parallel_span']['ground_gaps']=[{'x':round(108+i*.1,4),'above_upper_mm':ray(108+i*.1,118.45-.075,0,-1),'below_lower_mm':ray(108+i*.1,118.75+.075,0,1)} for i in range(81)]
ownpads=[q.GetEffectiveShape(p.F_Cu) for f in b.GetFootprints() for q in f.Pads() if q.GetNetname() in rf and q.IsOnLayer(p.F_Cu)]
samples=[]
for t in lines:
    if t.GetNetname() not in rf or mm(t.GetLength())<.1:continue
    a,c=xy(t.GetStart()),xy(t.GetEnd());dx,dy=c[0]-a[0],c[1]-a[1];l=math.hypot(dx,dy);nx,ny=-dy/l,dx/l
    for fraction in [.25,.5,.75]:
        x,y=a[0]+fraction*dx,a[1]+fraction*dy
        if any(q.Collide(vec(x,y)) for q in ownpads):continue
        half=mm(t.GetWidth())/2
        samples.append({'net':t.GetNetname(),'at':[round(x,5),round(y,5)],'width_mm':mm(t.GetWidth()),'left_ground_mm':ray(x+nx*half,y+ny*half,nx,ny),'right_ground_mm':ray(x-nx*half,y-ny*half,-nx,-ny),'In1_reference':gnd(vec(x,y),p.In1_Cu)})
report['RF_nonpad_samples']=samples
report['reference_gaps']=[]
for t in lines:
    if t.GetNetname() not in rf|usb:continue
    la=p.In1_Cu if t.GetLayer()==p.F_Cu else p.In2_Cu
    a,c=xy(t.GetStart()),xy(t.GetEnd());count=max(1,math.ceil(mm(t.GetLength())/.05))
    bad=[]
    for i in range(count+1):
        x,y=a[0]+(c[0]-a[0])*i/count,a[1]+(c[1]-a[1])*i/count
        if not gnd(vec(x,y),la):bad.append([round(x,5),round(y,5)])
    if bad:report['reference_gaps'].append({**info(t),'reference_layer':b.GetLayerName(la),'samples':bad})
assert hashlib.sha256(src.read_bytes()).hexdigest()==digest
(out/name).write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'board_sha256':digest,'segments':len(report['segments']),'RF_nonpad_samples':samples,'USB_ground_gap_ranges':{key:[min(v[key] for v in report['USB_parallel_span']['ground_gaps'] if v[key] is not None),max(v[key] for v in report['USB_parallel_span']['ground_gaps'] if v[key] is not None),sum(v[key] is None for v in report['USB_parallel_span']['ground_gaps'])] for key in ['above_upper_mm','below_lower_mm']},'reference_gap_segments':len(report['reference_gaps'])},indent=2))
