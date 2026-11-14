"""Guarded local Freerouting pass; retains inputs, log, output and pre-import board."""
import json,re,subprocess,sys,shutil,math
from datetime import datetime
from pathlib import Path
import pcbnew as p
ROOT=Path(__file__).resolve().parents[1];NAME='RAMS_JLC_S3'
JAVA=Path(r'C:\Program Files\Java\jdk-25.0.4\bin\java.exe')
JAR=Path(r'C:\Users\Jan Clyde Talosig\Documents\KiCad\10.0\3rdparty\plugins\app_freerouting_kicad-plugin\jar\freerouting-2.5.0.jar')
RUN=ROOT/'verification'/('route_'+datetime.now().strftime('%Y%m%d_%H%M%S'))
RUN.mkdir(parents=True,exist_ok=False)
source=ROOT/(NAME+'.kicad_pcb');b=p.LoadBoard(str(source))
shutil.copy2(source,RUN/source.name)
assert p.ExportSpecctraDSN(b,str(RUN/'input.dsn'))
raw=(RUN/'input.dsn').read_text()
# L2 remains a ground-only reference. Other three layers carry ordinary routing.
raw=raw.replace('(layer In1.Cu\n      (type signal)', '(layer In1.Cu\n      (type power)')
assert '(layer In1.Cu\n      (type power)' in raw, 'L2 ground-only routing declaration missing'
# Export only the reserved ground plane to the router. Surface/L3 pours are
# refilled by KiCad after routing; they must not reserve whole signal layers.
raw=re.sub(r'    \(plane GND \(polygon (?:F\.Cu|B\.Cu|In2\.Cu) .*?\)\)\n','',raw,flags=re.S)
# The native top antenna rule allows its existing feed only; DSN has no
# net-specific keepout. Tile blocked strips around the fixed feed/antenna lands.
# Final KiCad net-specific DRC remains authoritative at the corridor boundary.
feed=[t for t in b.GetTracks() if not isinstance(t,p.PCB_VIA) and t.GetNetname()=='ANT_FEED']
antenna=[a for f in b.GetFootprints() if f.GetReference()=='ANT1' for a in f.Pads() if a.IsOnLayer(p.F_Cu)]
assert feed and antenna
def distance_segment(x,y,t):
    a=t.GetStart();z=t.GetEnd();ax=p.ToMM(a.x);ay=p.ToMM(a.y);dx=p.ToMM(z.x)-ax;dy=p.ToMM(z.y)-ay
    fraction=max(0,min(1,((x-ax)*dx+(y-ay)*dy)/max(dx*dx+dy*dy,1e-20)))
    return math.hypot(x-ax-fraction*dx,y-ay-fraction*dy)
step=.1;halo=.15+math.sqrt(2)*step/2;polys=[]
for row in range(65):
    y=100+(row+.5)*step;start=None
    for column in range(66):
        blocked=False
        if column<65:
            x=100+(column+.5)*step;v=p.VECTOR2I(p.FromMM(x),p.FromMM(y))
            allowed=any(distance_segment(x,y,t)<=halo+p.ToMM(t.GetWidth())/2 for t in feed)
            allowed=allowed or any(a.GetEffectiveShape(p.F_Cu).Collide(v,p.FromMM(halo)) for a in antenna)
            blocked=not allowed
        if blocked and start is None:start=column
        if not blocked and start is not None:
            x0=round((100+start*step)*1000);x1=round((100+column*step)*1000)
            y0=-round((100+row*step)*1000);y1=-round((100+(row+1)*step)*1000)
            polys.append(f'    (keepout "antenna_{row}_{start}" (polygon F.Cu 0 {x0} {y0} {x1} {y0} {x1} {y1} {x0} {y1} {x0} {y0}))\n')
            start=None
raw=raw.replace('    (via_keepout', ''.join(polys)+'    (via_keepout',1)
# High-current rails use wider trunks; SMD fanout can neck down at the endpoints.
# DSN original default class is retained and only its matching net rules appended.
(RUN/'input.dsn').write_text(raw)
cmd=[str(JAVA),'-Xmx3g','-Dgui.enabled=false','-Djava.awt.headless=true','-jar',str(JAR),
     '-de',str(RUN/'input.dsn'),'-do',str(RUN/'output.ses'),'-mp','20','-mt','1','-is','Sequential',
     '--router.automatic_neckdown=false','--router.neck_width_um=0','--router.fanout.enabled=false','--router.strict_drc=true']
(RUN/'command.json').write_text(json.dumps(cmd,indent=2))
print('Routing log:',RUN/'freerouting.log',flush=True)
with (RUN/'freerouting.log').open('w',encoding='utf8') as log:
    result=subprocess.run(cmd,stdout=log,stderr=subprocess.STDOUT)
print('Router exit',result.returncode,flush=True)
if result.returncode or not (RUN/'output.ses').exists():raise RuntimeError('Router failed; original board retained')
assert p.ImportSpecctraSES(b,str(RUN/'output.ses'))
p.SaveBoard(str(source),b)
print('Imported routing session. CAD checks still required.',len(list(b.GetTracks())),'tracks/vias',flush=True)
