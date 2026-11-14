"""Plan readable references around real component courtyards; no copper changes.

Candidate placement is conservative rectangular geometry, then native DRC and
visual review decide acceptance. Run without --apply to inspect the plan first.
"""
import json,math,sys,random,shutil,os
from pathlib import Path
from datetime import datetime
import numpy as np
import pcbnew as p
R=Path(__file__).resolve().parents[1];BFILE=R/'RAMS_JLC_S3.kicad_pcb'
b=p.LoadBoard(str(BFILE));fps={f.GetReference():f for f in b.GetFootprints()}
step=.05;nx,ny=841,641
height=float(os.environ.get('RAMS_SILK_HEIGHT','.55'));stroke=.10
xy=lambda x,y:p.VECTOR2I(p.FromMM(x),p.FromMM(y))
mm=p.ToMM
def box(bb):return tuple(map(mm,[bb.GetX(),bb.GetY(),bb.GetRight(),bb.GetBottom()]))
def mark(a,rect,grow=0):
 x1,y1,x2,y2=rect
 i1,j1=[max(0,math.floor((z-100-grow)/step)) for z in (x1,y1)]
 i2,j2=[math.ceil((z-100+grow)/step) for z in (x2,y2)]
 a[i1:min(nx,i2+1),j1:min(ny,j2+1)]=True
def integral(a):return np.pad(a.astype(np.int32),((1,0),(1,0))).cumsum(0).cumsum(1)
def centers(a,wh):
 w,h=wh;ii=integral(a)
 sums=ii[w:,h:]-ii[:-w,h:]-ii[w:,:-h]+ii[:-w,:-h]
 ij=np.argwhere(sums==0)
 ij=ij[(ij[:,0]%2==0)&(ij[:,1]%2==0)]
 return ij+np.array([w/2,h/2])
def text_setup(f,angle=0):
 t=f.Reference();t.SetVisible(True);t.SetLayer(p.B_SilkS if f.IsFlipped() else p.F_SilkS)
 t.SetTextSize(xy(height,height));t.SetTextThickness(p.FromMM(stroke));t.SetTextAngle(p.EDA_ANGLE(angle,p.DEGREES_T));t.SetKeepUpright(False)
 t.SetMirrored(f.IsFlipped())
 t.SetPosition(xy(0,0));return t
bases={};bodies={}
for side,cu,cy,silk in [('F',p.F_Cu,p.F_CrtYd,p.F_SilkS),('B',p.B_Cu,p.B_CrtYd,p.B_SilkS)]:
 a=np.zeros((nx,ny),dtype=bool);a[:8,:]=True;a[-8:,:]=True;a[:,:8]=True;a[:,-8:]=True
 for ref,f in fps.items():
  courtyard=f.GetCourtyard(cy)
  if courtyard.OutlineCount():
   bounds=box(courtyard.BBox());bodies[ref]=bounds
   fab=p.B_Fab if side=='B' else p.F_Fab
   shapes=[box(g.GetBoundingBox()) for g in f.GraphicalItems() if isinstance(g,p.PCB_SHAPE) and g.GetLayer()==fab]
   if shapes:bounds=(min(v[0] for v in shapes),min(v[1] for v in shapes),max(v[2] for v in shapes),max(v[3] for v in shapes))
   mark(a,bounds,.03)
  for q in f.Pads():
   if q.IsOnLayer(cu):mark(a,box(q.GetBoundingBox()),.16)
  for g in f.GraphicalItems():
   if g.GetLayer()==silk:mark(a,box(g.GetBoundingBox()),.05)
 for g in b.GetDrawings():
  if g.GetLayer()==silk:mark(a,box(g.GetBoundingBox()),.05)
 bases[side]=a
 from PIL import Image
 Image.fromarray(np.where(a.T,40,245).astype('uint8')).resize((1682,1282)).save(R/f'reports/silk_free_{side}.png')
 print(side,'free area',np.count_nonzero(~a)*step*step,flush=True)
if '--mask-only' in sys.argv:raise SystemExit(0)
sizes={};initial={}
for ref,f in fps.items():
 side='B' if f.IsFlipped() else 'F';pos=np.array([mm(f.GetPosition().x),mm(f.GetPosition().y)])
 choices=[]
 for angle in [0,90]:
  # Native text layout boxes include unused line/descender metrics. Use actual
  # stroked glyph bounds, plus 0.1mm padding; final native DRC remains mandatory.
  t=text_setup(f,angle);bb=t.GetEffectiveTextShape().BBox();wh=[math.ceil(mm(bb.GetWidth())/step)+2,math.ceil(mm(bb.GetHeight())/step)+2]
  pts=centers(bases[side],wh)*step+100
  distances=np.linalg.norm(pts-pos,axis=1)
  keep=distances<(15 if ref in ['U1','U2','J1','BZ1'] else 9)
  choices.extend((float(d),angle,pt.tolist(),wh) for d,pt in zip(distances[keep],pts[keep]))
  sizes[ref,angle]=wh
 initial[ref]=sorted(choices,key=lambda z:z[0])
print('Initial unavailable',[r for r,c in initial.items() if not c],flush=True)
best=None
for attempt in range(8):
 rng=random.Random(attempt);occupied={s:a.copy() for s,a in bases.items()};placed={}
 order=sorted(fps,key=lambda ref:len(initial[ref])*(.6+rng.random()*.8))
 for ref in order:
  f=fps[ref];side='B' if f.IsFlipped() else 'F';a=occupied[side]
  options=[]
  for distance,angle,pos,wh in initial[ref]:
   w,h=wh
   i0=round((pos[0]-100)/step-w/2);j0=round((pos[1]-100)/step-h/2)
   if a[i0:i0+w,j0:j0+h].any():continue
   # Prefer horizontal, close labels; random tie-breaking searches packings.
   cost=distance+.15*(angle!=0)
   options.append((cost,angle,pos,wh,i0,j0))
   if len(options)>10:break
  if not options:continue
  cost,angle,pos,wh,i0,j0=min(options)
  occupied[side][i0:i0+wh[0],j0:j0+wh[1]]=True
  placed[ref]={'side':side,'xy':pos,'angle':angle,'distance_mm':round(cost-.15*(angle!=0),3),'box_cells':wh}
 score=(len(placed),-sum(a['distance_mm']**2 for a in placed.values()))
 if best is None or score>best[0]:best=(score,placed);print('Best',attempt,score,flush=True)
 if len(placed)==len(fps) and attempt>=20:break
# Repack crowded references instead of permanently accepting a greedy omission.
# Each candidate already clears pads/bodies. Evicting a label queues it for a
# different free location; a tabu penalty discourages cycling through one gap.
refs=list(fps);candidates={};tabu={}
for ref in refs:
 cs=initial[ref]
 candidates[ref]=cs[:3000]
 tabu[ref]=np.zeros(len(candidates[ref]),dtype=float)
placed=copy_plan={ref:dict(v) for ref,v in best[1].items()};rng=random.Random(185)
for iteration in range(0 if len(best[1])==len(fps) else 6000):
 absent=[ref for ref in refs if ref not in placed]
 ref=rng.choice(absent if absent else refs)
 opts=candidates[ref];side='B' if fps[ref].IsFlipped() else 'F'
 others=[(r,v) for r,v in placed.items() if r!=ref and v['side']==side]
 if not opts:continue
 points=np.array([c[2] for c in opts]);whs=np.array([c[3] for c in opts])*step
 if others:
  otherxy=np.array([v['xy'] for r,v in others]);otherwh=np.array([v['box_cells'] for r,v in others])*step
  collide=(np.abs(points[:,None,:]-otherxy[None,:,:])<(whs[:,None,:]+otherwh[None,:,:])/2+.015).all(axis=2)
  conflicts=collide.sum(axis=1)
 else:collide=np.zeros((len(opts),0),bool);conflicts=np.zeros(len(opts))
 d=np.array([c[0] for c in opts]);rot=np.array([c[1]!=0 for c in opts])
 costs=conflicts*15 + d*.14 + rot*.025 + tabu[ref] + np.array([rng.random()*.5 for _ in opts])
 k=int(costs.argmin());distance,angle,pos,wh=opts[k]
 for j,(other,v) in enumerate(others):
  if collide[k,j]:del placed[other]
 placed[ref]={'side':side,'xy':pos,'angle':angle,'distance_mm':round(distance,3),'box_cells':wh}
 tabu[ref][k]+=1.3
 if iteration%200==0:
  for t in tabu.values():t*=.85
 score=(len(placed),-sum(a['distance_mm']**2 for a in placed.values()))
 if score>best[0]:best=(score,{r:dict(v) for r,v in placed.items()});print('Repack',iteration,score,flush=True)
 if len(placed)==len(fps) and iteration>1200:break
plan={'labels':best[1],'unplaced':sorted(set(fps)-set(best[1])),'height_mm':height,'stroke_mm':stroke,'body_avoidance':'Native Fab outline plus0.03mm; fallback courtyard. Pads expanded0.16mm separately.'}
(R/f'reports/silkscreen_ink_{height}.json').write_text(json.dumps(plan,indent=2)+'\n')
print('UNPLACED',plan['unplaced'],flush=True)
if '--apply' in sys.argv:
 assert not plan['unplaced'],'Do not save incomplete labels'
 backup=R/'verification'/('silkscreen_labels_'+datetime.now().strftime('%Y%m%d_%H%M%S'));backup.mkdir();shutil.copy2(BFILE,backup/BFILE.name)
 for ref,v in plan['labels'].items():
  t=text_setup(fps[ref],v['angle']);t.SetPosition(xy(*v['xy']))
 assert p.SaveBoard(str(BFILE),b)
 print('Saved labels',backup)
