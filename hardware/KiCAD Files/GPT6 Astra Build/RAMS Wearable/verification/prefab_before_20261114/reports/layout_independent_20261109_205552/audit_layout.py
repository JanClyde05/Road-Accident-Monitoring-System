"""Read-only geometry audit of the adjacent frozen PCB, using installed pcbnew."""
from pathlib import Path
import hashlib,json,math,collections
import pcbnew as p
ROOT=Path(__file__).resolve().parent
FILE=ROOT/'RAMS_JLC_S3.kicad_pcb'
before=hashlib.sha256(FILE.read_bytes()).hexdigest()
b=p.LoadBoard(str(FILE)); fps={f.GetReference():f for f in b.GetFootprints()}
tracks=list(b.GetTracks()); vias=[t for t in tracks if isinstance(t,p.PCB_VIA)]
lines=[t for t in tracks if not isinstance(t,p.PCB_VIA)]
mm=p.ToMM
def xy(v):return [round(mm(v.x),6),round(mm(v.y),6)]
def pad(ref,num):return next(q for q in fps[ref].Pads() if q.GetNumber()==str(num))
def dist(a,c):return math.hypot(a.x-c.x,a.y-c.y)/1e6
def info(t):return {'net':t.GetNetname(),'layer':b.GetLayerName(t.GetLayer()),'start':xy(t.GetStart()),'end':xy(t.GetEnd()),'width_mm':mm(t.GetWidth())}
report={'board_sha256':before,'kicad':p.GetBuildVersion(),'footprints':len(fps),'segments':len(lines),'vias':len(vias)}

# Package lands and stencil apertures are checked geometrically, including same-net vias.
overlaps=[];paste=[]
for via in vias:
 for f in fps.values():
  for q in f.Pads():
   if q.GetAttribute()!=p.PAD_ATTRIB_SMD:continue
   layers=[la for la in (p.F_Cu,p.B_Cu) if q.IsOnLayer(la)]
   if layers and q.GetEffectiveShape(layers[0]).Collide(via.GetPosition(),max(0,via.GetDrillValue()//2-1)):
    overlaps.append({'via':xy(via.GetPosition()),'drill_mm':mm(via.GetDrillValue()),'via_net':via.GetNetname(),'pad':f.GetReference()+'.'+q.GetNumber(),'pad_net':q.GetNetname(),'same_net':via.GetNetCode()==q.GetNetCode(),'tented_front':via.IsTented(p.F_Mask),'tented_back':via.IsTented(p.B_Mask),'filled':via.GetPrimaryDrillFilledFlag(),'capped':via.GetPrimaryDrillCappedFlag()})
   if q.IsOnLayer(p.F_Paste) and not q.GetNumber() and q.GetEffectiveShape(p.F_Paste).Collide(via.GetPosition(),max(0,via.GetDrillValue()//2-1)):
    paste.append({'via':xy(via.GetPosition()),'footprint':f.GetReference(),'aperture':xy(q.GetPosition())})
report['via_drill_smd_land_intersections']=overlaps;report['via_drill_paste_only_intersections']=paste

caps=[]
for r,n,cr,cn in [('U6',1,'C34',1),('U6',6,'C28',1),('LED1',4,'C28',1),('U5',1,'C7',1),('U5',5,'C10',1),('U1',2,'C12',1),('U1',3,'C13',1),('U1',20,'C16',1),('U1',46,'C15',1),('U1',55,'C21',1),('U1',56,'C22',1),('U1',29,'C17',1),('U1',29,'C20',1)]:
 a,c=pad(r,n),pad(cr,cn);g=pad(cr,2);gv=[v for v in vias if v.GetNetname()=='GND']
 v=min(gv,key=lambda t:dist(g.GetPosition(),t.GetPosition()))
 caps.append({'supply_pad':r+'.'+str(n),'capacitor':cr,'direct_supply_pad_distance_mm':round(dist(a.GetPosition(),c.GetPosition()),4),'nearest_ground_via_mm':round(dist(g.GetPosition(),v.GetPosition()),4),'ground_via':xy(v.GetPosition())})
report['bypass_geometry']=caps

stats={}
for t in lines:
 name=t.GetNetname();width=round(mm(t.GetWidth()),4);s=stats.setdefault(name,{'length_mm':0,'widths_mm':{},'segments':0})
 length=mm(t.GetLength());s['length_mm']+=length;s['segments']+=1;s['widths_mm'][width]=s['widths_mm'].get(width,0)+length
for name,s in stats.items():
 s['length_mm']=round(s['length_mm'],4);s['widths_mm']={str(k):round(v,4) for k,v in sorted(s['widths_mm'].items())}
report['net_route_statistics']=stats

# Check copper intersecting the actual native antenna exclusion, beyond centreline checks.
antenna=next(z for z in b.Zones() if z.GetIsRuleArea() and z.GetZoneName()=='ANTENNA_NO_METAL' and z.IsOnLayer(p.F_Cu)).Outline()
foreign=[]
for t in tracks:
 if t.GetNetname()=='ANT_FEED' and not isinstance(t,p.PCB_VIA) and t.GetLayer()==p.F_Cu:continue
 if antenna.Collide(t.GetEffectiveShape(t.GetLayer())):foreign.append(info(t))
report['antenna_foreign_tracks_or_vias']=foreign
insidepads=[]
for f in fps.values():
 if f.GetReference()=='ANT1':continue
 for q in f.Pads():
  if not q.GetNumber():continue
  for la in (p.F_Cu,p.In1_Cu,p.In2_Cu,p.B_Cu):
   if q.IsOnLayer(la) and antenna.Collide(q.GetEffectiveShape(la)):
    insidepads.append({'pad':f.GetReference()+'.'+q.GetNumber(),'net':q.GetNetname(),'layer':b.GetLayerName(la)});break
report['antenna_foreign_pads']=insidepads
groundzones=[z for z in b.Zones() if not z.GetIsRuleArea() and z.GetNetname()=='GND']
report['antenna_zone_fill_intersections']=[b.GetLayerName(la) for z in groundzones for la in (p.F_Cu,p.In1_Cu,p.In2_Cu,p.B_Cu) if z.IsOnLayer(la) and antenna.Collide(z.GetFilledPolysList(la))]

# Sample centreline projection over the adjacent reference layer, using cached native fills.
critical={'USB_DP','USB_DN','USB_DP_CONN','USB_DN_CONN','USB_DP_ESD','USB_DN_ESD','RF_LNA','RF_MATCH','ANT_TUNE','ANT_FEED','XTAL_P','XTAL_N','XTAL_P_DRV'}
plane=next(z.GetFilledPolysList(p.In1_Cu) for z in groundzones if z.IsOnLayer(p.In1_Cu))
missing=[]
for t in lines:
 if t.GetNetname() not in critical or t.GetLayer()!=p.F_Cu:continue
 a,c=t.GetStart(),t.GetEnd();count=max(1,math.ceil(mm(t.GetLength())/.1));bad=[]
 for k in range(count+1):
  v=p.VECTOR2I(round(a.x+(c.x-a.x)*k/count),round(a.y+(c.y-a.y)*k/count))
  if not plane.Contains(v):bad.append(xy(v))
 if bad:missing.append({**info(t),'samples_without_In1_GND':bad})
report['critical_FCu_reference_gaps_0p1mm_sampling']=missing
report['critical_other_layer_segments']=[info(t) for t in lines if t.GetNetname() in critical and t.GetLayer()!=p.F_Cu]
report['In1_track_segments']=[info(t) for t in lines if t.GetLayer()==p.In1_Cu]
assert hashlib.sha256(FILE.read_bytes()).hexdigest()==before
(ROOT/'geometry_audit.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['net_route_statistics','critical_FCu_reference_gaps_0p1mm_sampling','via_drill_smd_land_intersections']},indent=2))
print('VIA_PAD_INTERSECTIONS',len(overlaps),'PASTE',len(paste),'REFERENCE_GAP_SEGMENTS',len(missing))
