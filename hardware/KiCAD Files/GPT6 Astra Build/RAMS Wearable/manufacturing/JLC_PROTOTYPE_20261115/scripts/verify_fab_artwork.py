"""Independent checks on the exported KiCad Gerber apertures and flashes.

Deliberately supports the observed 4.6 absolute-mm, non-region mask/paste
output; rejects a different representation instead of silently skipping it.
"""
import math,re
from itertools import product

def flashes(file):
    data=file.read_text()
    assert '%FSLAX46Y46*%' in data and '%MOMM*%' in data
    assert 'G36*' not in data, 'Region output needs separate polygon verification'
    apertures={int(n):(kind,[float(v) for v in params.split('X')]) for n,kind,params in re.findall(r'%ADD(\d+)([^,]+),([^*]+)\*%',data)}
    active=None;x=y=None;result=[]
    for line in data.splitlines():
        m=re.fullmatch(r'D(\d+)\*',line)
        if m:active=int(m[1]);continue
        m=re.fullmatch(r'(?:X(-?\d+))?(?:Y(-?\d+))?D0([123])\*',line)
        if not m:continue
        if m[1] is not None:x=int(m[1])/1e6
        if m[2] is not None:y=int(m[2])/1e6
        if m[3]=='3':
            assert active in apertures and x is not None and y is not None
            result.append((x,y,*apertures[active]))
    return result

def ep(fl):return [v for v in fl if abs(v[0]-115)<2.85 and abs(v[1]+112)<2.85]
def polygon(f):
    assert f[2]=='Outline8P' and len(f[3])==17 and f[3][-1]==0,f
    return list(zip(f[3][:-1:2],f[3][1:-1:2]))
def area(poly):return abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(poly,poly[1:]+poly[:1])))/2
def point_segment_distance(pt,a,b):
    vx,vy=b[0]-a[0],b[1]-a[1]
    t=max(0,min(1,((pt[0]-a[0])*vx+(pt[1]-a[1])*vy)/(vx*vx+vy*vy)))
    return math.hypot(pt[0]-a[0]-t*vx,pt[1]-a[1]-t*vy)
def check_mask_paste(top,bottom,paste):
    tf,bf,pf=ep(flashes(top)),ep(flashes(bottom)),ep(flashes(paste))
    expected={(round(115+x,4),round(-112+y,4)) for x,y in product([-2.1,-.7,.7,2.1],repeat=2)}
    assert len(tf)==len(pf)==16
    assert {(round(f[0],4),round(f[1],4)) for f in tf}==expected
    assert {(round(f[0],4),round(f[1],4)) for f in pf}==expected
    for collection,half,chamfer in [(tf,.6,.1),(pf,.56,.06)]:
        for f in collection:
            v=polygon(f)
            expected_points={(sx*x,sy*y) for sx,sy in product([-1,1],repeat=2) for x,y in [(half,half-chamfer),(half-chamfer,half)]}
            assert {(round(x,6),round(y,6)) for x,y in v}=={(round(x,6),round(y,6)) for x,y in expected_points},f
    holes={(round(115+x,4),round(-112+y,4)) for x,y in product([-1.4,0,1.4],repeat=2)}
    assert len(bf)==9 and {(round(f[0],4),round(f[1],4)) for f in bf}==holes
    assert all(f[2]=='C' and abs(f[3][0]-.45)<1e-7 for f in bf),bf
    clearance=min(point_segment_distance(h,(f[0]+a[0],f[1]+a[1]),(f[0]+b[0],f[1]+b[1]))-.1 for h in holes for f in tf for a,b in zip(polygon(f),polygon(f)[1:]+polygon(f)[:1]))
    coverage=100*sum(area(polygon(f)) for f in pf)/5.7**2
    assert clearance>.112 and 61.4<coverage<61.5
    return {'mask_windows':16,'paste_windows':16,'bottom_via_openings':9,'minimum_top_mask_overlap_beyond_hole_mm':clearance,'paste_coverage_percent':coverage,'mask_window_side_chamfer_mm':[1.2,.1],'paste_window_side_chamfer_mm':[1.12,.06]}
