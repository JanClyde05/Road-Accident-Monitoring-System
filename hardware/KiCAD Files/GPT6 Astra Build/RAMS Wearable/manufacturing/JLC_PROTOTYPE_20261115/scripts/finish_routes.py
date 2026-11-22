"""Repair the current routed board from a native DRC report, retaining a backup.

Conservative 50um-grid routing is only a candidate generator. Native DRC,
return-path, current and physical checks remain separate acceptance gates.
"""
import heapq, json, math, shutil, sys, os
from datetime import datetime
from pathlib import Path
import numpy as np
import pcbnew as p

ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / 'RAMS_JLC_S3.kicad_pcb'
REPORT = Path(sys.argv[1])
RUN = ROOT / 'verification' / ('finish_' + datetime.now().strftime('%Y%m%d_%H%M%S'))
RUN.mkdir()
shutil.copy2(BOARD, RUN / BOARD.name)
B = p.LoadBoard(str(BOARD))
LAYERS = [p.F_Cu, p.In2_Cu, p.B_Cu]
STEP = float(os.environ.get('RAMS_ROUTE_GRID', '.05'))
NX, NY = round(42/STEP)+1, round(32/STEP)+1
PADS = [a for f in B.GetFootprints() for a in f.Pads()]
ITEMS = {str(a.m_Uuid.AsString()): a for a in list(B.GetTracks()) + PADS}
REPORT_DATA = json.loads(REPORT.read_text())

def mm(v): return p.ToMM(v)
def xy(x, y): return p.VECTOR2I(p.FromMM(float(x)), p.FromMM(float(y)))
def point(v): return np.array([mm(v.x), mm(v.y)])
def grid(v): return tuple(int(round((x - 100) / STEP)) for x in v)
def real(q): return np.array([100 + STEP * q[0], 100 + STEP * q[1]])

def rectangle(a, x1, y1, x2, y2):
    i1, j1 = grid((x1, y1)); i2, j2 = grid((x2, y2))
    a[max(0,i1):min(NX,i2+1),max(0,j1):min(NY,j2+1)] = True

def capsule(a, start, end, radius):
    lo = np.minimum(start,end)-radius; hi = np.maximum(start,end)+radius
    i1,j1 = grid(lo); i2,j2 = grid(hi)
    i1=max(0,i1);j1=max(0,j1);i2=min(NX-1,i2);j2=min(NY-1,j2)
    if i1>i2 or j1>j2: return
    xx,yy=np.meshgrid(100+np.arange(i1,i2+1)*STEP,100+np.arange(j1,j2+1)*STEP,indexing='ij')
    vx,vy=end-start
    t=np.clip(((xx-start[0])*vx+(yy-start[1])*vy)/max(vx*vx+vy*vy,1e-20),0,1)
    a[i1:i2+1,j1:j2+1] |= (xx-start[0]-t*vx)**2+(yy-start[1]-t*vy)**2 <= radius**2

def masks(net, width):
    copper = np.zeros((3,NX,NY), dtype=bool)
    vias = np.zeros((NX,NY), dtype=bool)
    for a in [*copper, vias]:
        edge=round(.4/STEP)
        a[:edge,:]=True; a[-edge:,:]=True; a[:,:edge]=True; a[:,-edge:]=True
        rectangle(a,99,99,106.8,106.8)
    # Keep a ground reference on L3 beneath the short bottom USB fanout.
    rectangle(copper[1],104.9,123.6,108.0,126.9)
    for a in PADS:
        bb=a.GetBoundingBox()
        x1,y1,x2,y2=map(mm,[bb.GetX(),bb.GetY(),bb.GetRight(),bb.GetBottom()])
        other=a.GetNetname()!=net
        # Never place a drill in a solder land, even one on the same net.
        grow=.151+.225 if other else .151+.1
        rectangle(vias,x1-grow,y1-grow,x2+grow,y2+grow)
        if other:
            grow=.151+width/2
            for k,layer in enumerate(LAYERS):
                if a.IsOnLayer(layer):rectangle(copper[k],x1-grow,y1-grow,x2+grow,y2+grow)
        if a.GetDrillSize().x:
            radius=mm(max(a.GetDrillSize().x,a.GetDrillSize().y))/2+.25+.1
            capsule(vias,point(a.GetPosition()),point(a.GetPosition()),radius)
    for t in B.GetTracks():
        if isinstance(t,p.PCB_VIA):
            v=point(t.GetPosition())
            if t.GetNetname()!=net:
                for a in copper:capsule(a,v,v,.151+width/2+mm(t.GetWidth(p.F_Cu))/2)
                capsule(vias,v,v,.151+.225+mm(t.GetWidth(p.F_Cu))/2)
            else:
                capsule(vias,v,v,.25+.1+mm(t.GetDrill())/2)
        elif t.GetNetname()!=net:
            if t.GetLayer() in LAYERS:
                capsule(copper[LAYERS.index(t.GetLayer())],point(t.GetStart()),point(t.GetEnd()),.151+(width+mm(t.GetWidth()))/2)
            capsule(vias,point(t.GetStart()),point(t.GetEnd()),.151+(mm(t.GetWidth())+.45)/2)
    # Existing, aligned same-net through vias already provide legal transitions.
    # Do not require a second nearby hole to use a deliberately placed escape.
    for t in B.GetTracks():
        if isinstance(t,p.PCB_VIA) and t.GetNetname()==net:
            at=point(t.GetPosition());q=grid(at)
            if np.linalg.norm(at-real(q))<.002 and not any(copper[k,q[0],q[1]] for k in range(3)):
                vias[q]=False
    return copper,vias

def endpoints(item):
    if isinstance(item,p.PCB_VIA):
        return [(k,*grid(point(item.GetPosition()))) for k in range(3)]
    if isinstance(item,p.PCB_TRACK):
        k=LAYERS.index(item.GetLayer())
        return [(k,*grid(point(v))) for v in [item.GetStart(),item.GetEnd()]]
    return [(k,*grid(point(item.GetPosition()))) for k,l in enumerate(LAYERS) if item.IsOnLayer(l)]

def search(blocked, vias, starts, goals):
    global failed_nodes
    failed_nodes=[]
    starts=[q for q in starts if not blocked[q]]
    goals=[q for q in goals if not blocked[q]]
    if not starts or not goals: return None, 'blocked endpoint'
    target=set(goals)
    def h(q):
        return min(max(abs(q[1]-g[1]),abs(q[2]-g[2]))+.414214*min(abs(q[1]-g[1]),abs(q[2]-g[2]))+(0 if q[0]==g[0] else 12) for g in goals)
    best={q:0 for q in starts};parent={};queue=[(h(q),0,q) for q in starts];heapq.heapify(queue)
    moves=[(1,0,1),(-1,0,1),(0,1,1),(0,-1,1),(1,1,1.414214),(1,-1,1.414214),(-1,1,1.414214),(-1,-1,1.414214)]
    while queue:
        _,cost,q=heapq.heappop(queue)
        if cost>best[q]:continue
        if q in target:
            path=[q]
            while q in parent:q=parent[q];path.append(q)
            return list(reversed(path)),len(best)
        k,i,j=q
        neighbors=[]
        for dx,dy,w in moves:
            n=(k,i+dx,j+dy)
            if not(0<=n[1]<NX and 0<=n[2]<NY) or blocked[n]:continue
            if dx and dy and (blocked[k,i+dx,j] or blocked[k,i,j+dy]):continue
            neighbors.append((n,w))
        if not vias[i,j]:
            for z in range(3):
                if z!=k and not blocked[z,i,j]:neighbors.append(((z,i,j),12))
        for n,w in neighbors:
            value=cost+w
            if value>=best.get(n,1e30):continue
            best[n]=value;parent[n]=q;heapq.heappush(queue,(value+h(n),value,n))
    failed_nodes=list(best)
    return None,len(best)

def add_path(net, code, path, width):
    lines=[];added_vias=set()
    # Simplify collinear grid steps, preserving every layer transition.
    keep=[path[0]]
    for i in range(1,len(path)-1):
        a,b,c=path[i-1:i+2]
        if a[0]!=b[0] or b[0]!=c[0] or (b[1]-a[1],b[2]-a[2])!=(c[1]-b[1],c[2]-b[2]):keep.append(b)
    keep.append(path[-1])
    for a,b in zip(keep,keep[1:]):
        if a[0]!=b[0]:
            at=tuple(real(a[1:]))
            if at in added_vias:continue
            if any(isinstance(t,p.PCB_VIA) and t.GetNetCode()==code and np.linalg.norm(point(t.GetPosition())-at)<.002 for t in B.GetTracks()):continue
            v=p.PCB_VIA(B);v.SetPosition(xy(*at));v.SetWidth(p.FromMM(.45));v.SetDrill(p.FromMM(.2))
            v.SetViaType(p.VIATYPE_THROUGH);v.SetLayerPair(p.F_Cu,p.B_Cu);v.SetNetCode(code);B.Add(v);added_vias.add(at)
        else:
            start=real(a[1:]);end=real(b[1:])
            if np.linalg.norm(start-end)<1e-8:continue
            t=p.PCB_TRACK(B);t.SetStart(xy(*start));t.SetEnd(xy(*end));t.SetWidth(p.FromMM(width));t.SetLayer(LAYERS[a[0]]);t.SetNetCode(code);B.Add(t)
            lines.append([B.GetLayerName(LAYERS[a[0]]),list(start),list(end),width])
    return {'net':net,'segments':lines,'vias':list(added_vias)}

repairs=[]
for issue in REPORT_DATA['violations']:
    if issue['type']=='track_not_centered_on_via':
        t,v=[ITEMS[a['uuid']] for a in issue['items']]
        at=v.GetPosition()
        delta=[np.linalg.norm(point(t.GetStart())-point(at)),np.linalg.norm(point(t.GetEnd())-point(at))]
        assert min(delta)<.03,delta
        if delta[0]<delta[1]:t.SetStart(at)
        else:t.SetEnd(at)
        repairs.append({'alignment':issue['items'][0]['uuid'],'delta_mm':min(delta)})

def route_order(issue):
    net=ITEMS[issue['items'][0]['uuid']].GetNetname()
    return {'DW_VCC':-2,'LORA_SCK_DEV':-1,'LORA_SCK':2,'DW_CS':3}.get(net,0)

for issue in sorted(REPORT_DATA['unconnected_items'],key=route_order):
    left,right=[ITEMS[a['uuid']] for a in issue['items']]
    net=left.GetNetname();assert net==right.GetNetname()
    if os.environ.get('RAMS_ROUTE_NET') and net!=os.environ['RAMS_ROUTE_NET']:continue
    if net=='LORA_SCK':left,right=right,left
    if net=='BOOT_BTN' and isinstance(right,p.PAD) and right.GetParentFootprint().GetReference()=='R34':left,right=right,left
    width=.15
    print('Routing',net,flush=True)
    blocked,vias=masks(net,width)
    path,status=search(blocked,vias,endpoints(left),endpoints(right))
    if path is None:
        print('FAILED',net,status,flush=True);repairs.append({'failed':net,'status':status})
        if failed_nodes:
            from PIL import Image,ImageDraw
            for k in range(3):
                visited=[(i,j) for z,i,j in failed_nodes if z==k]
                if not visited:continue
                lo=np.min(visited,axis=0)-round(.7/STEP);hi=np.max(visited,axis=0)+round(.7/STEP)
                lo=np.maximum(lo,0);hi=np.minimum(hi,[NX-1,NY-1])
                print(' Reachable',k,real(np.min(visited,axis=0)),real(np.max(visited,axis=0)),flush=True)
                rgb=np.full((NX,NY,3),240,dtype=np.uint8);rgb[blocked[k]]=[30,30,30]
                rgb[(~vias)&(~blocked[k])]=[130,210,130]
                for i,j in visited:rgb[i,j]=[80,120,240]
                im=Image.fromarray(np.transpose(rgb[lo[0]:hi[0]+1,lo[1]:hi[1]+1],(1,0,2))).resize((800,800))
                ImageDraw.Draw(im).text((4,4),f'{net} {k} {real(lo)} -> {real(hi)}',fill='red')
                im.save(RUN/(net.replace('+','')+f'_{k}_blocked.png'))
        continue
    record=add_path(net,left.GetNetCode(),path,width);repairs.append(record)
    print('Routed',net,len(record['segments']),'segments',len(record['vias']),'vias; searched',status,flush=True)

p.SaveBoard(str(BOARD),B)
(RUN/'repairs.json').write_text(json.dumps(repairs,indent=2)+'\n')
print('Saved candidate',BOARD,'Backup/report',RUN,flush=True)
