"""Plan callouts for displaced references on the verification candidate."""
from pathlib import Path
import json,math,heapq
import numpy as np
import pcbnew as p
from refine_silkscreen import bounding,mark,NX,NY,STEP
R=Path(__file__).resolve().parents[1]
PATH=R/'verification/fab_legend_candidate_20261115/RAMS_JLC_S3.kicad_pcb'
b=p.LoadBoard(str(PATH));fps={f.GetReference():f for f in b.GetFootprints()}
xy=lambda x,y:p.VECTOR2I(p.FromMM(x),p.FromMM(y))
def distance(a,z):return math.hypot(max(a[0]-z[2],z[0]-a[2],0),max(a[1]-z[3],z[1]-a[3],0))
def ring(rect,grid,gap):
 x1,y1,x2,y2=rect
 i1,j1=[round((z-100-gap)/STEP) for z in (x1,y1)]
 i2,j2=[round((z-100+gap)/STEP) for z in (x2,y2)]
 pts=set([(i,j) for i in range(i1,i2+1) for j in [j1,j2]]+[(i,j) for j in range(j1,j2+1) for i in [i1,i2]])
 return [pt for pt in pts if 0<=pt[0]<NX and 0<=pt[1]<NY and not grid[pt]]
leaders={};missing=[];association=[]
for side,cu,fab,silk in [('F',p.F_Cu,p.F_Fab,p.F_SilkS),('B',p.B_Cu,p.B_Fab,p.B_SilkS)]:
 grid=np.zeros((NX,NY),bool);grid[:7,:]=grid[-7:,:]=grid[:,:7]=grid[:,-7:]=True
 bodies={};texts={}
 for ref,f in fps.items():
  if f.Reference().GetLayer()==silk:
   shapes=[bounding(g.GetBoundingBox()) for g in f.GraphicalItems() if isinstance(g,p.PCB_SHAPE) and g.GetLayer()==fab]
   if shapes:bodies[ref]=(min(v[0] for v in shapes),min(v[1] for v in shapes),max(v[2] for v in shapes),max(v[3] for v in shapes))
   else:bodies[ref]=bounding(f.GetCourtyard(p.B_CrtYd if side=='B' else p.F_CrtYd).BBox())
   mark(grid,bodies[ref],.08)
   texts[ref]=bounding(f.Reference().GetEffectiveTextShape().BBox());mark(grid,texts[ref],.21)
  for pad in f.Pads():
   if pad.IsOnLayer(cu):mark(grid,bounding(pad.GetBoundingBox()),.23)
  for g in f.GraphicalItems():
   if g.GetLayer()==silk:mark(grid,bounding(g.GetBoundingBox()),.21)
 for g in b.GetDrawings():
  if g.GetLayer()==silk and isinstance(g,p.PCB_TEXT):mark(grid,bounding(g.GetEffectiveTextShape().BBox()),.21)
 refs=[]
 for ref,a in texts.items():
  own=distance(a,bodies[ref]);others=sorted((distance(a,z),o) for o,z in bodies.items() if o!=ref)
  other=others[0] if others else (own,None)
  ambiguous=own>.9 and own-other[0]>.5
  association.append(dict(ref=ref,own=own,other=other,ambiguous=ambiguous))
  if ambiguous:refs.append(ref)
 for ref in sorted(refs,key=lambda r:-distance(texts[r],bodies[r])):
  starts=ring(texts[ref],grid,.25);goals=set()
  for gap in [.15,.20,.25,.30,.35]:
   for pt in ring(bodies[ref],grid,gap):
    x,y=100+pt[0]*STEP,100+pt[1]*STEP;box=(x,y,x,y)
    own=distance(box,bodies[ref]);others=[distance(box,z) for o,z in bodies.items() if o!=ref]
    if not others or own<min(others)-.05:goals.add(pt)
  if not starts or not goals:missing.append(ref);continue
  gx=sum(v[0] for v in goals)/len(goals);gy=sum(v[1] for v in goals)/len(goals)
  dist={v:0 for v in starts};previous={};queue=[(math.hypot(v[0]-gx,v[1]-gy),0,v) for v in starts];heapq.heapify(queue)
  finish=None;visits=0
  while queue and visits<100000:
   _,cost,pt=heapq.heappop(queue)
   if cost>dist[pt]+1e-9:continue
   if pt in goals:finish=pt;break
   visits+=1
   for dx,dy in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)]:
    q=(pt[0]+dx,pt[1]+dy)
    if not(0<=q[0]<NX and 0<=q[1]<NY) or grid[q]:continue
    if dx and dy and (grid[pt[0]+dx,pt[1]] or grid[pt[0],pt[1]+dy]):continue
    nc=cost+math.hypot(dx,dy)
    if nc>200 or nc>=dist.get(q,math.inf):continue
    dist[q]=nc;previous[q]=pt;heapq.heappush(queue,(nc+math.hypot(q[0]-gx,q[1]-gy),nc,q))
  if finish is None:missing.append(ref);continue
  path=[finish]
  while path[-1] in previous:path.append(previous[path[-1]])
  path.reverse();simple=[path[0]]
  for a,c,d in zip(path,path[1:],path[2:]):
   if (c[0]-a[0],c[1]-a[1])!=(d[0]-c[0],d[1]-c[1]):simple.append(c)
  if path[-1]!=simple[-1]:simple.append(path[-1])
  leaders[ref]={'side':side,'width_mm':.1,'points':[[round(100+x*STEP,3),round(100+y*STEP,3)] for x,y in simple]}
  for i,j in path:grid[max(0,i-5):min(NX,i+6),max(0,j-5):min(NY,j+6)]=True
report={'leaders':leaders,'missing':missing,'association':association}
(R/'reports/fab_leader_plan_20261115.json').write_text(json.dumps(report,indent=2)+'\n')
print('Leaders',leaders,'Missing',missing)
