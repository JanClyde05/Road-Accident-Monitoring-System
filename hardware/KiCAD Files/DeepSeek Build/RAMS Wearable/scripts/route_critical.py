"""Deterministic single-layer pathfinder for reviewed critical connections.

Conservative pad bounding boxes and track capsules form obstacles. This routes
geometry only; native DRC plus electrical/return-path review are separate gates.
"""
import heapq,json,math
from pathlib import Path
import numpy as np
import pcbnew as p
ROOT=Path(__file__).resolve().parents[1]
B=p.LoadBoard(str(ROOT/'RAMS_JLC_S3.kicad_pcb'))
STEP=.05; X0=100.;Y0=100.; NX=841;NY=641
PADS={}; obstacles=[]
for fp in B.GetFootprints():
    for pad in fp.Pads():
        n=pad.GetNumber()
        if n and (fp.GetReference(),n) not in PADS:PADS[fp.GetReference(),n]=pad
        if pad.IsOnLayer(p.F_Cu):obstacles.append(pad)

def coord(pa):return np.array([p.ToMM(pa.GetPosition().x),p.ToMM(pa.GetPosition().y)])
def grid(pt):return tuple(int(round((v-b)/STEP)) for v,b in zip(pt,[X0,Y0]))
def real(q):return np.array([X0+q[0]*STEP,Y0+q[1]*STEP])
routes=[]; traces=[]

def raster(net,width):
    a=np.zeros((NX,NY),dtype=bool);a[:6,:]=True;a[-6:,:]=True;a[:,:6]=True;a[:,-6:]=True
    d=.155+width/2+.015
    for pa in obstacles:
        if pa.GetNetname()==net:continue
        bb=pa.GetBoundingBox();x1=p.ToMM(bb.GetX())-d;y1=p.ToMM(bb.GetY())-d;x2=p.ToMM(bb.GetRight())+d;y2=p.ToMM(bb.GetBottom())+d
        i1,j1=grid((x1,y1));i2,j2=grid((x2,y2));a[max(0,i1):min(NX,i2+1),max(0,j1):min(NY,j2+1)]=True
    for other,start,end,w in traces:
        if other==net:continue
        radius=.155+(w+width)/2+.025
        lo=np.minimum(start,end)-radius;hi=np.maximum(start,end)+radius
        i1,j1=grid(lo);i2,j2=grid(hi);i1=max(0,i1);j1=max(0,j1);i2=min(NX-1,i2);j2=min(NY-1,j2)
        xx,yy=np.meshgrid(X0+np.arange(i1,i2+1)*STEP,Y0+np.arange(j1,j2+1)*STEP,indexing='ij')
        vx,vy=end-start;length=vx*vx+vy*vy
        t=np.clip(((xx-start[0])*vx+(yy-start[1])*vy)/max(length,1e-15),0,1)
        a[i1:i2+1,j1:j2+1]|=(xx-start[0]-t*vx)**2+(yy-start[1]-t*vy)**2<radius**2
    # All front copper in the antenna corner is restricted to its feed line.
    if net!='ANT_FEED':a[:131,:131]=True
    return a

def astar(a,start,end):
    start=grid(start);end=grid(end)
    if a[start] or a[end]:return None
    queue=[(0,0,start)];best={start:0};parent={}
    steps=[(1,0,1),(-1,0,1),(0,1,1),(0,-1,1),(1,1,1.414214),(1,-1,1.414214),(-1,1,1.414214),(-1,-1,1.414214)]
    while queue:
        _,cost,node=heapq.heappop(queue)
        if cost>best[node]:continue
        if node==end:
            path=[node]
            while node!=start:node=parent[node];path.append(node)
            return list(reversed(path))
        for dx,dy,weight in steps:
            q=node[0]+dx,node[1]+dy
            if not(0<=q[0]<NX and 0<=q[1]<NY) or a[q]:continue
            if dx and dy and (a[node[0]+dx,node[1]] or a[node[0],node[1]+dy]):continue
            v=cost+weight
            if v>=best.get(q,1e20):continue
            best[q]=v;parent[q]=node
            ddx=abs(q[0]-end[0]);ddy=abs(q[1]-end[1]);h=max(ddx,ddy)+.414214*min(ddx,ddy)
            heapq.heappush(queue,(v+h,v,q))
    return None

def connect(net,left,right,width=.15,maxlen=20):
    first=PADS[left];last=PADS[right];assert first.GetNetname()==last.GetNetname()==net,(net,left,right)
    start,end=coord(first),coord(last)
    blocked=raster(net,width)
    path=astar(blocked,start,end)
    if path is None:raise RuntimeError(f'No front route {net} {left}->{right} width{width}')
    # Compress straight runs, keeping the real pad center at endpoints.
    simplified=[path[0]]
    for i in range(1,len(path)-1):
        before=path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]
        after=path[i+1][0]-path[i][0],path[i+1][1]-path[i][1]
        if before!=after:simplified.append(path[i])
    simplified.append(path[-1])
    points=[start]+[real(q) for q in simplified]+[end]
    points=[z for i,z in enumerate(points) if i==0 or np.linalg.norm(z-points[i-1])>1e-8]
    length=sum(np.linalg.norm(b-a) for a,b in zip(points,points[1:]))
    if length>maxlen:raise RuntimeError(f'Critical detour {net} {left}->{right}: {length:.2f}mm >{maxlen}')
    for a,b in zip(points,points[1:]):traces.append((net,a,b,width))
    routes.append({'net':net,'points':[[round(float(v),4) for v in z] for z in points],'width':width,'endpoints':[left,right],'length_mm':round(length,3)})
    print(f'{net}: {left}->{right}: {length:.2f}mm',flush=True)

# Order preserves RF and oscillator topology; no layer changes in these blocks.
jobs=[
 ('RF_LNA',('U1','1'),('L2','1'),.15,5),
 ('RF_LNA',('L2','1'),('C18','1'),.15,4),
 ('RF_MATCH',('L2','2'),('C19','1'),.18,4),
 ('RF_MATCH',('L2','2'),('C32','1'),.18,5),
 ('ANT_TUNE',('C32','2'),('L4','1'),.18,4),
 ('ANT_TUNE',('L4','1'),('L5','1'),.18,5),
 ('ANT_FEED',('L5','2'),('ANT1','1'),.18,6),
 ('XTAL_P_DRV',('U1','54'),('R9','1'),.15,5),
 ('XTAL_P',('R9','2'),('Y1','1'),.15,6),
 ('XTAL_P',('Y1','1'),('C24','1'),.15,4),
 ('XTAL_N',('U1','53'),('Y1','3'),.15,10),
 ('XTAL_N',('Y1','3'),('C25','1'),.15,4),
 ('+3V3',('U1','55'),('U1','56'),.15,2),
 ('+3V3',('U1','56'),('C21','1'),.15,4),
 ('+3V3',('U1','46'),('C15','1'),.15,4),
 ('+3V3',('U1','20'),('C16','1'),.15,4),
 ('VDD_SPI',('U1','29'),('C17','1'),.15,4),
 ('VDD_SPI',('C17','1'),('C20','1'),.18,4),
 ('VDD_RF',('U1','2'),('U1','3'),.15,2),
 ('VDD_RF',('U1','3'),('C12','1'),.15,4),
 ('VDD_RF',('C12','1'),('C13','1'),.2,4),
 ('VDD_RF',('C13','1'),('C11','1'),.25,7),
 ('VDD_RF',('C11','1'),('L1','2'),.25,7),
 ('SYS_IN',('U5','1'),('C7','1'),.35,7),
 ('+3V3',('U5','5'),('C10','1'),.35,7),
 ('VBAT_SENSE',('Q4','2'),('R16','1'),.15,5),
 ('VBAT_SENSE',('R16','1'),('C29','1'),.15,4),
]

def manual(net, points, width=.15, layer='F_Cu'):
    coords=[coord(PADS[tuple(q)]) if isinstance(q[0],str) else np.array(q) for q in points]
    for q in points:
        if isinstance(q[0],str):assert PADS[tuple(q)].GetNetname()==net
    length=sum(np.linalg.norm(b-a) for a,b in zip(coords,coords[1:]))
    for a,b in zip(coords,coords[1:]):traces.append((net,a,b,width))
    routes.append({'net':net,'points':[[round(float(v),5) for v in q] for q in coords],
                   'width':width,'layer':layer,'length_mm':round(float(length),4),'topology':'manual USB; native DRC required'})
    return float(length)

def usb_pair():
    # Type-C duplicate D+/D- lands use equal-length stubs to each merge point.
    # Main span uses .15mm traces/.15mm gap over dedicated L2 GND. Short pad
    # fanouts and matching detour are explicit, not a claim of solved impedance.
    plus_join=(106.75,124.2);minus_join=(106.25,126.4)
    ap=manual('USB_DP_CONN',[('J1','A6'),(106.25,124.2),plus_join])
    bp=manual('USB_DP_CONN',[('J1','B6'),(107.25,124.2),plus_join])
    an=manual('USB_DN_CONN',[('J1','A7'),(106.75,126.4),minus_join])
    bn=manual('USB_DN_CONN',[('J1','B7'),(105.75,126.4),minus_join])
    assert abs(ap-bp)<.001 and abs(an-bn)<.001
    plus_exit=(107.45,124.2);minus_exit=(105.55,124.2)
    for net,points in [('USB_DP_CONN',[plus_join,plus_exit]),('USB_DN_CONN',[minus_join,minus_exit])]:
        for point in points:routes.append({'net':net,'via':list(point),'diam':.5,'drill':.2})
    for point in [(104.9,123.9),(108.1,123.9),(106.25,127.1)]:
        routes.append({'net':'GND','via':list(point),'diam':.5,'drill':.2})
    cp=manual('USB_DP_CONN',[plus_join,plus_exit],layer='B_Cu')+manual('USB_DP_CONN',[plus_exit,('D1','3')])
    cn=manual('USB_DN_CONN',[minus_join,(105.55,125.7),minus_exit],layer='B_Cu')+manual('USB_DN_CONN',[minus_exit,('D1','1')])
    en=manual('USB_DN_ESD',[('D1','6'),(105.55,120.2),(107.3,118.45),(116.1,118.45),(116.4,118.15),('R39','1')])
    chip_p=manual('USB_DP',[('R38','2'),(117.34,116.79),(116.8,116.25),('U1','26')])
    chip_n=manual('USB_DN',[('R39','2'),('U1','25')])
    base=[coord(PADS['D1','4']),np_array(107.45,119.0243),np_array(107.7243,118.75),np_array(117.36,118.75),np_array(117.8,118.31),coord(PADS['R38','1'])]
    ep=sum(np.linalg.norm(b-a) for a,b in zip(base,base[1:]))
    delay=(an+cn+en+chip_n)-(ap+cp+ep+chip_p)
    assert 0<delay<3,delay
    x=107.45+delay/2
    ep=manual('USB_DP_ESD',[('D1','4'),(x,120.7625),(x,119.65),(107.45,119.65),*base[1:]])
    totals={'plus_mm':ap+cp+ep+chip_p,'minus_mm':an+cn+en+chip_n,'pad_branch_symmetry_mm':max(abs(ap-bp),abs(an-bn)),
            'through_vias_per_signal':2,'equal_via_barrel_length_not_in_planar_total_mm':3.2}
    assert abs(totals['plus_mm']-totals['minus_mm'])<.002,totals
    (ROOT/'verification/baseline/usb_geometric_lengths.json').write_text(json.dumps(totals,indent=2)+'\n')
    print('USB geometric pin-center lengths',totals,flush=True)

def np_array(x,y):return np.array([x,y])
if __name__=='__main__':
    failures=[]
    for job in jobs:
        try:connect(*job)
        except RuntimeError as e:failures.append(str(e));print('FAILED',e,flush=True)
    usb_pair()
    (ROOT/'critical_routes.json').write_text(json.dumps(routes,indent=2)+'\n')
    (ROOT/'verification/baseline/critical_route_failures.json').write_text(json.dumps(failures,indent=2))
    print(f'{len(routes)} critical paths; {len(failures)} unresolved')

