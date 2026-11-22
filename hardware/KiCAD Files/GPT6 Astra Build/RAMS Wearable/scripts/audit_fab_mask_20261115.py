"""Independent, read-only native mask/paste geometry and library comparison."""
from pathlib import Path
import argparse, hashlib, json, math
import pcbnew as p

R = Path(__file__).resolve().parents[1]
args = argparse.ArgumentParser()
args.add_argument('--output', default='mask_independent_20261115.json', help='Report basename; CAD remains read-only')
name = args.parse_args().output
assert Path(name).name == name and name.endswith('.json')
B = R / 'RAMS_JLC_S3.kicad_pcb'
L = R / 'lib/RAMS_JLC.pretty/ESP32-S3FH4R2_QFN56_EP5p7.kicad_mod'
sha = lambda f: hashlib.sha256(f.read_bytes()).hexdigest()
before = {str(f.relative_to(R)): sha(f) for f in [B, L]}
b = p.LoadBoard(str(B))
u = next(f for f in b.GetFootprints() if f.GetReference() == 'U1')
lib = p.FootprintLoad(str(L.parent), L.stem)
mm = p.ToMM

def record(f):
    out = []
    for q in f.Pads():
        d = q.GetPosition()-f.GetPosition()
        out.append(dict(number=q.GetNumber(), at=[mm(d.x), mm(d.y)],
                        size=[mm(q.GetSize().x), mm(q.GetSize().y)],
                        layers=list(q.GetLayerSet().Seq()), shape=int(q.GetShape()),
                        chamfer_ratio=q.GetChamferRectRatio(), corners=q.GetChamferPositions(),
                        paste_margin_mm=mm(q.GetLocalSolderPasteMargin() or 0),
                        paste_ratio=q.GetLocalSolderPasteMarginRatio() or 0))
    return sorted(out, key=lambda q: json.dumps(q, sort_keys=True))

native, library = record(u), record(lib)
assert native == library, 'Board/library pad construction differs'
mask = [q for q in native if q['layers'] == [p.F_Mask]]
paste = [q for q in native if q['layers'] == [p.F_Paste]]
perimeter = [q for q in native if q['number'].isdigit() and 1 <= int(q['number']) <= 56]
ep = next(q for q in native if q['number'] == '57')
assert len(mask) == len(paste) == 16 and len(perimeter) == 56
assert p.F_Mask not in ep['layers'] and p.F_Paste not in ep['layers']

def polygon(q):
    x, y = q['at']; w, h = q['size']; a=w/2; c=h/2
    d=min(w,h)*q['chamfer_ratio']
    assert q['corners'] == 15 and q['shape'] == int(p.PAD_SHAPE_CHAMFERED_RECT)
    return [(x-a+d,y-c),(x+a-d,y-c),(x+a,y-c+d),(x+a,y+c-d),
            (x+a-d,y+c),(x-a+d,y+c),(x-a,y+c-d),(x-a,y-c+d)]

def distance(point, a, c):
    dx,dy=c[0]-a[0],c[1]-a[1]
    k=max(0,min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(dx*dx+dy*dy)))
    return math.hypot(point[0]-a[0]-k*dx,point[1]-a[1]-k*dy)

def edges(poly): return list(zip(poly,poly[1:]+poly[:1]))
def area(poly): return abs(sum(a[0]*c[1]-a[1]*c[0] for a,c in edges(poly)))/2
def perimeter_length(poly): return sum(math.dist(a,c) for a,c in edges(poly))

holes=[]
for v in b.GetTracks():
    if not isinstance(v,p.PCB_VIA): continue
    d=v.GetPosition()-u.GetPosition(); xy=[mm(d.x),mm(d.y)]
    if max(abs(k) for k in xy) > 1.401: continue
    assert v.GetNetname()=='GND'
    radius=mm(v.GetDrillValue())/2
    edge=min(distance(xy,a,c) for q in mask for a,c in edges(polygon(q)))
    holes.append(dict(at_relative_mm=xy,drill_mm=radius*2,
                      nearest_mask_opening_mm=edge,
                      mask_overlap_beyond_hole_edge_mm=edge-radius,
                      front_tenting=int(v.GetFrontTentingMode()),
                      back_tenting=int(v.GetBackTentingMode())))
assert len(holes)==9
assert all(q['front_tenting']==int(p.TENTING_MODE_TENTED) and q['back_tenting']==int(p.TENTING_MODE_NOT_TENTED) for q in holes)
mask_web=min(distance(v,a,c) for i,q in enumerate(mask) for r in mask[i+1:]
             for v in polygon(q) for a,c in edges(polygon(r)))
paste_inset=min(distance(v,a,c) for q in paste for r in mask if q['at']==r['at']
                for v in polygon(q) for a,c in edges(polygon(r)))
paste_area=sum(area(polygon(q)) for q in paste)
ep_area=math.prod(ep['size'])
outer_border=min(ep['size'][axis]/2-abs(v[axis]) for q in mask for v in polygon(q) for axis in [0,1])
assert all(sorted(q['size'])==[.25,.8] and q['paste_margin_mm']==-.025 and q['paste_ratio']==0 for q in perimeter)
result=dict(kicad=p.GetBuildVersion(),source_sha256=before,board_library_pad_geometry_equal=True,
            mask_windows=mask,paste_windows=paste,perimeter_count=len(perimeter),ep=ep,
            holes=holes,minimum_mask_web_mm=mask_web,minimum_paste_inset_mm=paste_inset,
            outer_mask_border_mm=outer_border,paste_area_mm2=paste_area,
            ep_copper_area_mm2=ep_area,paste_coverage_percent=100*paste_area/ep_area,
            paste_window_area_ratio_0p10_stencil=area(polygon(paste[0]))/(.1*perimeter_length(polygon(paste[0]))),
            perimeter_paste_area_ratio_0p10_stencil=.75*.20/(2*.1*(.75+.20)),
            note='Nominal native polygons only. Tenting is not filled/capped via fabrication or an assembly-yield guarantee.')
assert {str(f.relative_to(R)): sha(f) for f in [B,L]} == before, 'Source changed during audit'
out=R/'reports/fab_impedance_20261114'/name
out.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['mask_windows','paste_windows','ep','holes']},indent=2))
print('minimum hole-edge mask overlap:',min(q['mask_overlap_beyond_hole_edge_mm'] for q in holes))
