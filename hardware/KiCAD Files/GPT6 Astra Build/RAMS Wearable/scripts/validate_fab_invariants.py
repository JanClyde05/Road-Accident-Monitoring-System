"""Read-only whitelist comparison against the preserved pre-fabrication source."""
from pathlib import Path
import copy, hashlib, json, subprocess, xml.etree.ElementTree as ET
import pcbnew as p
from schematic_helpers import parse_sexpr, child, children

R=Path(__file__).resolve().parents[1]
BASE=R/'verification/prefab_before_20261114'
sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
board=R/'RAMS_JLC_S3.kicad_pcb'; digest=sha(board)
old=parse_sexpr((BASE/board.name).read_text(encoding='utf-8'))
new=parse_sexpr(board.read_text(encoding='utf-8'))
uid=lambda n:child(n,'uuid')[1]
def without(n,tags):
    return [x for x in n if not (isinstance(x,list) and x[0] in tags)]
def keyed(t,tag):return {uid(n):n for n in children(t,tag)}
changes=json.loads((R/'reports/fab_rf_edit.json').read_text())['changes']
width_changes={a['uuid']:a for a in changes}
for tag in ['segment','arc']:
    a,b=keyed(old,tag),keyed(new,tag)
    assert a.keys()==b.keys(),tag
    for ident,x in a.items():
        y=copy.deepcopy(b[ident])
        if ident in width_changes:
            assert child(x,'width')[1]=='0.18' and child(y,'width')[1]=='0.15'
            child(y,'width')[1]='0.18'
        assert x==y,(tag,ident)
old_vias,new_vias=keyed(old,'via'),keyed(new,'via')
assert old_vias.keys()==new_vias.keys()
tenting_changed=[]
for ident,x in old_vias.items():
    y=new_vias[ident]
    assert without(x,{'tenting'})==without(y,{'tenting'}),ident
    if x!=y:tenting_changed.append(ident)
assert len(tenting_changed)==9,len(tenting_changed)
for tag in ['net','setup','layers','general']:
    assert children(old,tag)==children(new,tag),tag
old_z,new_z=keyed(old,'zone'),keyed(new,'zone')
assert old_z.keys()==new_z.keys()
for ident,z in old_z.items():
    assert without(z,{'filled_polygon'})==without(new_z[ident],{'filled_polygon'}),('zone boundaries/settings',ident)
def other_graphics(t):
    return [x for x in t if isinstance(x,list) and x[0].startswith('gr_') and child(x,'layer')[1] not in ['F.SilkS','B.SilkS']]
assert other_graphics(old)==other_graphics(new),'Non-silk drawing changed'
def fps(t):return {next(x[2] for x in children(f,'property') if x[1]=='Reference'):f for f in children(t,'footprint')}
of,nf=fps(old),fps(new);assert of.keys()==nf.keys() and len(nf)==90
def strip_reference(f):
    return [x for x in f if not (isinstance(x,list) and x[0]=='property' and x[1]=='Reference')]
for ref,f in of.items():
    if ref!='U1':
        assert strip_reference(f)==strip_reference(nf[ref]),('footprint',ref)
        continue
    assert without(strip_reference(f),{'pad','descr'})==without(strip_reference(nf[ref]),{'pad','descr'})
    op,np=keyed(f,'pad'),keyed(nf[ref],'pad');assert set(op)<=set(np)
    added=[v for k,v in np.items() if k not in op];assert len(added)==16
    for q in added:assert q[1]=='' and child(q,'layers')[1:]==['F.Mask']
    for ident,q in op.items():
        n=copy.deepcopy(np[ident])
        if q[1]=='57':
            assert child(n,'layers')[1:]==['F.Cu']
            n[n.index(child(n,'layers'))]=child(q,'layers')
        elif q[1]=='':
            assert child(q,'layers')[1:]==['F.Paste']
            assert child(n,'layers')[1:]==['F.Paste']
            n[3]=q[3]
            n=without(n,{'roundrect_rratio','chamfer_ratio','chamfer'})
        assert n==q,('U1 pad',q[1],ident)

def netlist(path):
    t=ET.parse(path).getroot()
    comps={c.attrib['ref']:{k:c.findtext(k) for k in ['value','footprint','tstamps']} for c in t.findall('components/comp')}
    nets={n.attrib['name']:sorted((v.attrib['ref'],v.attrib['pin'],v.attrib.get('pinfunction'),v.attrib.get('pintype')) for v in n.findall('node')) for n in t.findall('nets/net')}
    return comps,nets
out=R/'reports/fab_netlist.xml'
subprocess.run([r'C:/Program Files/KiCad/10.0/bin/kicad-cli.exe','sch','export','netlist','--format','kicadxml','--output',str(out),str(R/'RAMS_JLC_S3.kicad_sch')],check=True)
before=netlist(BASE/'reports/readability_netlist.xml');after=netlist(out)
assert before==after,'Electrical netlist changed'
assert sha(R/'circuit_spec.json')==sha(BASE/'circuit_spec.json')
for f in BASE.glob('*.kicad_sch'):assert sha(R/f.name)==sha(f),f.name
assert sha(board)==digest
report={'date':'2026-11-15','board_sha256':digest,'baseline_sha256':sha(BASE/board.name),'components':len(after[0]),'nets':len(after[1]),'approved_changes':{'RF_width_segments':len(changes),'U1_EP_via_tenting':len(tenting_changed),'U1_mask_windows_added':16,'U1_paste_windows_chamfered':16,'U1_EP_full_mask_removed':True,'reference_and_board_silkscreen':'presentation only','zone_refill':'fill polygons may respond to RF width; boundaries/settings unchanged'},'unchanged':['canonical circuit/netlist','all schematic files','component placement/rotation/side/value/footprint','all numbered copper lands','all track endpoints/layers/nets, non-RF widths','all drill sizes/positions and via copper','zone boundaries/keepouts/settings','outline/stackup/setup','model attachments'],'schematic_sha256':{f.name:sha(f) for f in R.glob('*.kicad_sch')},'netlist_sha256':sha(out),'status':'Scoped fabrication edits match whitelist; final DRC/geometry/visual checks separate'}
(R/'reports/fab_invariants.json').write_text(json.dumps(report,indent=2)+'\n')
print('Fabrication invariants passed',digest)
