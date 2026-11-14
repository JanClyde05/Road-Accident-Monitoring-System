"""Plan short silkscreen callouts through unoccupied board space; no CAD writes."""
from pathlib import Path
import json,math,heapq
import numpy as np
import pcbnew as p
from refine_silkscreen import bounding,mark,NX,NY,STEP
R=Path(__file__).resolve().parents[1]
plan=json.loads((R/'reports/silkscreen_refined.json').read_text())
b=p.LoadBoard(str(R/'RAMS_JLC_S3.kicad_pcb'));fps={f.GetReference():f for f in b.GetFootprints()}
xy=lambda x,y:p.VECTOR2I(p.FromMM(x),p.FromMM(y))
for ref,v in plan['labels'].items():
 t=fps[ref].Reference();t.SetTextSize(xy(.55,.55));t.SetTextThickness(p.FromMM(.1));t.SetTextAngle(p.EDA_ANGLE(v['angle'],p.DEGREES_T));t.SetPosition(xy(*v['xy']))
def ring(rect,grid,gap=.1):
 x1,y1,x2,y2=rect
 i1,j1=[round((z-100-gap)/STEP) for z in (x1,y1)]
 i2,j2=[round((z-100+gap)/STEP) for z in (x2,y2)]
 pts=set([(i,j) for i in range(i1,i2+1) for j in [j1,j2]]+[(i,j) for j in range(j1,j2+1) for i in [i1,i2]])
 return [pt for pt in pts if 0<=pt[0]<NX and 0<=pt[1]<NY and not grid[pt]]
leaders={};missing=[]
for side,cu,cy,silk in [('F',p.F_Cu,p.F_CrtYd,p.F_SilkS),('B',p.B_Cu,p.B_CrtYd,p.B_SilkS)]:
 grid=np.zeros((NX,NY),bool);grid[:7,:]=grid[-7:,:]=grid[:,:7]=grid[:,-7:]=True
 bodies={};texts={}
 for ref,f in fps.items():
  courtyard=f.GetCourtyard(cy)
  if courtyard.OutlineCount():
   bodies[ref]=bounding(courtyard.BBox())
   fab=p.B_Fab if side=='B' else p.F_Fab
   shapes=[bounding(g.GetBoundingBox()) for g in f.GraphicalItems() if isinstance(g,p.PCB_SHAPE) and g.GetLayer()==fab]
   if shapes:bodies[ref]=(min(v[0] for v in shapes),min(v[1] for v in shapes),max(v[2] for v in shapes),max(v[3] for v in shapes))
   mark(grid,bodies[ref],.05)
  for pad in f.Pads():
   if pad.IsOnLayer(cu):mark(grid,bounding(pad.GetBoundingBox()),.21)
  for g in f.GraphicalItems():
   if g.GetLayer()==silk:mark(grid,bounding(g.GetBoundingBox()),.1)
  if f.Reference().GetLayer()==silk:
   texts[ref]=bounding(f.Reference().GetEffectiveTextShape().BBox());mark(grid,texts[ref],.1)
 for g in b.GetDrawings():
  if g.GetLayer()==silk:mark(grid,bounding(g.GetBoundingBox()),.1)
 refs=[v['reference'] for v in plan['refinement']['after'] if v['ambiguous'] and v['reference'] in bodies]
 for ref in refs:
  starts=ring(texts[ref],grid,.2);goals=set()
  for gap in [.25,.4,.55]:goals.update(ring(bodies[ref],grid,gap))
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
    if nc>180 or nc>=dist.get(q,math.inf):continue
    dist[q]=nc;previous[q]=pt;heapq.heappush(queue,(nc+math.hypot(q[0]-gx,q[1]-gy),nc,q))
  if finish is None:missing.append(ref);continue
  path=[finish]
  while path[-1] in previous:path.append(previous[path[-1]])
  path.reverse();simple=[path[0]]
  for a,c,d in zip(path,path[1:],path[2:]):
   if (c[0]-a[0],c[1]-a[1])!=(d[0]-c[0],d[1]-c[1]):simple.append(c)
  simple.append(path[-1])
  leaders[ref]={'side':side,'width_mm':.1,'points':[[round(100+x*STEP,3),round(100+y*STEP,3)] for x,y in simple]}
  for i,j in path:grid[max(0,i-3):min(NX,i+4),max(0,j-3):min(NY,j+4)]=True
plan['leaders']=leaders;plan['leader_unrouted']=missing
(R/'reports/silkscreen_final_plan.json').write_text(json.dumps(plan,indent=2)+'\n')
print('Leader paths',leaders,'Unrouted',missing)
