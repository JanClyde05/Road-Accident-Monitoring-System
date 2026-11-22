"""Read-only copper-path resistance estimates; no claim of measured voltage/heat.

Touching native copper items form a graph. Charging each entire segment even
when a path enters midway overestimates that path's nominal series resistance;
parallel copper is not credited. Copper dimensions and plating are nominal.
"""
from pathlib import Path
import pcbnew as p,json,math,hashlib,heapq,sys
r=Path(__file__).resolve().parents[1];file=r/'RAMS_JLC_S3.kicad_pcb';out=Path(sys.argv[1]);b=p.LoadBoard(str(file))
layers=[p.F_Cu,p.In1_Cu,p.In2_Cu,p.B_Cu];pads={(f.GetReference(),a.GetNumber()):a for f in b.GetFootprints() for a in f.Pads() if a.GetNumber()};tracks=list(b.GetTracks())
def copper_layers(item):
 if isinstance(item,p.PCB_VIA):return layers
 if isinstance(item,p.PAD):return [l for l in layers if item.IsOnLayer(l)]
 return [item.GetLayer()]
def resistance(t):
 if isinstance(t,p.PAD):return 0.
 if isinstance(t,p.PCB_VIA):return 1.724e-5*1.6/(math.pi*p.ToMM(t.GetDrillValue())*.018)
 thickness=.035 if t.GetLayer() in [p.F_Cu,p.B_Cu] else .0152
 return 1.724e-5*p.ToMM(t.GetLength())/(p.ToMM(t.GetWidth())*thickness)
jobs=[('VBUS',('J1','A4'),('D2','2'),.6),('SYS_IN',('D2','1'),('U5','1'),.6),('SYS_IN',('Q1','2'),('U5','1'),.6),
 ('+3V3',('U5','5'),('U1','20'),.6),('+3V3',('U5','5'),('U1','46'),.6),('+3V3',('U5','5'),('U1','55'),.6),
 ('+3V3',('U5','5'),('L1','1'),.6),('+3V3',('U5','5'),('FB1','1'),.6),('+3V3',('U5','5'),('BZ1','1'),.6),
 ('VDD_RF',('L1','2'),('U1','2'),.4),('LORA_VDD',('FB1','2'),('U2','3'),.105),
 ('B_PLUS',('J2','1'),('Q1','3'),.6),('B_MINUS',('J2','2'),('Q3','1'),.6),('FET_DRAIN',('Q3','2'),('Q3','5'),.6),
 ('LED_PWR',('Q5','3'),('LED1','4'),.06)]
results=[]
for net in sorted(set(j[0] for j in jobs)):
 objects=[t for t in tracks if t.GetNetname()==net]+[a for a in pads.values() if a.GetNetname()==net]
 widths=[resistance(t) for t in objects];adj=[[] for _ in objects];surfaces=[copper_layers(t) for t in objects]
 shapes=[{l:t.GetEffectiveShape(l) for l in surfaces[k]} for k,t in enumerate(objects)]
 for i in range(len(objects)):
  for j in range(i):
   common=set(surfaces[i])&set(surfaces[j])
   if any(shapes[i][l].Collide(shapes[j][l],2) for l in common):adj[i].append(j);adj[j].append(i)
 index={t.m_Uuid.AsString():i for i,t in enumerate(objects)}
 for name,start,goal,amps in jobs:
  if name!=net:continue
  assert pads[start].GetNetname()==pads[goal].GetNetname()==net,(name,start,goal)
  a=index[pads[start].m_Uuid.AsString()];z=index[pads[goal].m_Uuid.AsString()];best={a:0.};queue=[(0.,a)];parent={}
  while queue:
   value,i=heapq.heappop(queue)
   if value>best[i]:continue
   if i==z:break
   for j in adj[i]:
    candidate=value+widths[j]
    if candidate<best.get(j,float('inf')):best[j]=candidate;parent[j]=i;heapq.heappush(queue,(candidate,j))
  assert z in best,('No copper path',net,start,goal)
  chain=[];i=z
  while i!=a:chain.append(objects[i].m_Uuid.AsString());i=parent[i]
  results.append({'net':net,'from':'.'.join(start),'to':'.'.join(goal),'nominal_path_ohm_overestimate':round(best[z],5),'illustrative_current_A':amps,'nominal_path_drop_mV':round(1000*amps*best[z],2),'path_item_uuids':chain})
report={'board_sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'method':__doc__,'rho_ohm_mm_at_20C':1.724e-5,'nominal_outer_copper_mm':.035,'nominal_inner_copper_mm':.0152,'assumed_via_plating_mm':.018,'results':results}
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2)+'\n')
for row in results:print(row['net'],row['from'],row['to'],row['nominal_path_ohm_overestimate'],'ohm',row['nominal_path_drop_mV'],'mV')
