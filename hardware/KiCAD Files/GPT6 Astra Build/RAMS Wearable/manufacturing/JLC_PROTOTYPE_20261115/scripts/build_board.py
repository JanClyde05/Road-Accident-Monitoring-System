"""Historical initial-board generator; never overwrite the routed native board.

Critical routes are explicit; later autorouting handles noncritical connections.
Native KiCad DRC and independent checks remain mandatory after every layout edit.
"""
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
from uuid import UUID, uuid5
import pcbnew as p

ROOT = Path(__file__).resolve().parents[1]
NAME = 'RAMS_JLC_S3'
FPDIR = Path(r'C:\Program Files\KiCad\10.0\share\kicad\footprints')
mm=p.FromMM
def xy(x,y):return p.VECTOR2I(mm(x),mm(y))
def pos(obj):
    z=obj.GetPosition();return p.ToMM(z.x),p.ToMM(z.y)

def make_board():
    if (ROOT/(NAME+'.kicad_pcb')).exists():
        raise SystemExit('Refusing to overwrite an existing PCB. See scripts/README.md; use a separate project copy for reconstruction.')
    spec=json.loads((ROOT/'circuit_spec.json').read_text())
    if (ROOT/'placement_overrides.json').exists():
        overrides=json.loads((ROOT/'placement_overrides.json').read_text())
        for c in spec['components']:
            if c['ref'] in overrides:c['pcb_x'],c['pcb_y'],c['pcb_rotation']=overrides[c['ref']]
    manifest=json.loads((ROOT/'schematic_manifest.json').read_text())
    netlist=ET.parse(ROOT/'verification/baseline/netlist.xml').getroot()
    net_pins={}
    for net in netlist.findall('nets/net'):
        for node in net.findall('node'):
            net_pins[node.get('ref'),node.get('pin')]=net.get('name')
    board=p.BOARD();board.SetCopperLayerCount(4)
    board.GetDesignSettings().SetBoardThickness(mm(1.6))
    nets={}
    for name in sorted(set(net_pins.values())):
        net=p.NETINFO_ITEM(board,name);board.Add(net);nets[name]=net
    footprints={}
    for c in spec['components']:
        ref=c['ref']
        if ref.startswith('#'):continue
        lib,name=c['footprint'].split(':')
        path=ROOT/'lib/RAMS_JLC.pretty' if lib=='RAMS_JLC' else FPDIR/(lib+'.pretty')
        fp=p.FootprintLoad(str(path),name)
        if not fp:raise ValueError(f'Missing footprint {c["footprint"]}')
        board.Add(fp);fp.SetReference(ref);fp.SetValue(c['value'])
        fp.SetFPID(p.LIB_ID(lib,name))
        fp.SetPath(p.KIID_PATH(manifest[ref]['path']))
        fp.SetUuid(p.KIID(manifest[ref]['uuid']))
        fp.SetPosition(xy(c['pcb_x'],c['pcb_y']))
        fp.SetOrientationDegrees(c['pcb_rotation'])
        if c.get('side')=='B':fp.Flip(fp.GetPosition(),p.FLIP_DIRECTION_LEFT_RIGHT)
        fp.SetDNP(bool(c.get('dnp')))
        fp.SetExcludedFromBOM(False)
        fp.GetField(p.FIELD_T_DESCRIPTION).SetText(c.get('description',''))
        fp.Value().SetVisible(False)
        fp.Reference().SetTextSize(xy(.65,.65));fp.Reference().SetTextThickness(mm(.1))
        fp.Reference().SetVisible(False) # assembly drawing carries every reference; uncluttered real silk
        expected=set(c['pins'])
        actual={pad.GetNumber() for pad in fp.Pads() if pad.GetNumber()}
        if expected!=(actual-{'MP'}):raise ValueError(f'{ref}: symbol/footprint pads {expected^actual}')
        for pad in fp.Pads():
            n=pad.GetNumber()
            if n and n!='MP':
                netname=net_pins.get((ref,n))
                intended=c['pins'][n]
                if intended and intended!=netname:raise ValueError(f'{ref}.{n}: {intended} != {netname}')
                if netname:pad.SetNet(nets[netname])
        footprints[ref]=fp
    # Original envelope retained; connectors intentionally mate at edges.
    for a,b in [((100,100),(142,100)),((142,100),(142,132)),((142,132),(100,132)),((100,132),(100,100))]:
        line=p.PCB_SHAPE();line.SetShape(p.SHAPE_T_SEGMENT);line.SetStart(xy(*a));line.SetEnd(xy(*b));line.SetLayer(p.Edge_Cuts);line.SetWidth(mm(.05));board.Add(line)
    def pad(ref,n):
        out=[x for x in footprints[ref].Pads() if x.GetNumber()==str(n)]
        if not out:raise ValueError((ref,n))
        return out[0]
    def route(net,points,width=.2,layer=p.F_Cu,lock=True):
        coords=[pos(pad(*a)) if isinstance(a[0],str) else a for a in points]
        for a,b in zip(coords,coords[1:]):
            if a==b:continue
            t=p.PCB_TRACK(board);t.SetStart(xy(*a));t.SetEnd(xy(*b));t.SetWidth(mm(width));t.SetLayer(layer);t.SetNet(nets[net]);t.SetLocked(lock);board.Add(t)
    def via(net,x,y,diam=.6,drill=.3):
        v=p.PCB_VIA(board);v.SetPosition(xy(x,y));v.SetWidth(mm(diam));v.SetDrill(mm(drill));v.SetViaType(p.VIATYPE_THROUGH);v.SetLayerPair(p.F_Cu,p.B_Cu);v.SetNet(nets[net]);board.Add(v);return v
    def zone(layer,net='GND'):
        z=p.ZONE(board);z.SetLayer(layer);z.SetNet(nets[net]);z.SetLocalClearance(mm(.15));z.SetMinThickness(mm(.1));z.SetPadConnection(p.ZONE_CONNECTION_FULL)
        z.SetThermalReliefGap(mm(.2));z.SetThermalReliefSpokeWidth(mm(.25));o=z.Outline();o.NewOutline()
        for x,y in [(100.25,100.25),(141.75,100.25),(141.75,131.75),(100.25,131.75)]:o.Append(mm(x),mm(y))
        board.Add(z)
    # Exact source package-specific thermal vias, in stencil-window gaps.
    cx,cy=pos(footprints['U1'])
    for dx in [-1.4,0,1.4]:
        for dy in [-1.4,0,1.4]:via('GND',cx+dx,cy+dy,.45,.2)
    for layer in [p.F_Cu,p.In1_Cu,p.In2_Cu,p.B_Cu]:zone(layer)
    # Antenna corner no copper on all layers; antenna feed/pads only permitted at top.
    for layer in [p.F_Cu,p.In1_Cu,p.In2_Cu,p.B_Cu]:
        z=p.ZONE(board);z.SetLayer(layer);z.SetIsRuleArea(True);z.SetZoneName('ANTENNA_NO_METAL')
        z.SetDoNotAllowZoneFills(True);z.SetDoNotAllowVias(True)
        z.SetDoNotAllowTracks(layer!=p.F_Cu);z.SetDoNotAllowPads(layer!=p.F_Cu);z.SetDoNotAllowFootprints(layer!=p.F_Cu)
        o=z.Outline();o.NewOutline()
        for x,y in [(99.9,99.9),(106.5,99.9),(106.5,106.5),(99.9,106.5)]:o.Append(mm(x),mm(y))
        board.Add(z)
    # Critical routes added after placement closure, from a separately reviewable list.
    routefile=ROOT/'critical_routes.json'
    if routefile.exists():
        for r in json.loads(routefile.read_text()):
            if 'via' in r:via(r['net'],*r['via'],r.get('diam',.6),r.get('drill',.3))
            else:route(r['net'],r['points'],r.get('width',.2),getattr(p,r.get('layer','F_Cu')))
    # Deliberate continuity contacts are generated only after checking clearance.
    groundfile=ROOT/'ground_vias.json'
    if groundfile.exists():
        for item in json.loads(groundfile.read_text()):
            ref,num,x,y,sx,sy,layername=item;pa=pad(ref,num);assert pa.GetNetname()=='GND'
            # Repeated SH pads have the same number but different positions.
            route('GND',[(sx,sy),(x,y)],.2,getattr(p,layername));via('GND',x,y,.45,.2)
    for txt,x,y,layer,size in [('RAMS J2',131,130.9,p.F_SilkS,.8),('3V3',139.8,112.3,p.F_SilkS,.6),
                             ('BAT +  -',114.3,131.4,p.F_SilkS,.8),('BOOT',125.3,105.1,p.F_SilkS,.6),('RST',118.9,105.1,p.F_SilkS,.6),
                             ('RA-02 433MHz',129.5,123.1,p.B_SilkS,.8)]:
        t=p.PCB_TEXT(board);t.SetText(txt);t.SetPosition(xy(x,y));t.SetLayer(layer);t.SetTextSize(xy(size,size));t.SetTextThickness(mm(.1));t.SetMirrored(layer==p.B_SilkS);board.Add(t)
    p.SaveBoard(str(ROOT/(NAME+'.kicad_pcb')),board)
    # Native layer stackup serialized explicitly so the intended supplier construction travels with CAD.
    target=ROOT/(NAME+'.kicad_pcb');raw=target.read_text()
    stack='''(stackup
      (layer "F.SilkS" (type "Top Silk Screen"))
      (layer "F.Paste" (type "Top Solder Paste"))
      (layer "F.Mask" (type "Top Solder Mask") (thickness 0.01))
      (layer "F.Cu" (type "copper") (thickness 0.035))
      (layer "dielectric 1" (type "prepreg") (thickness 0.0994) (material "3313") (epsilon_r 4.1) (loss_tangent 0.02))
      (layer "In1.Cu" (type "copper") (thickness 0.0152))
      (layer "dielectric 2" (type "core") (thickness 1.265) (material "FR4") (epsilon_r 4.6) (loss_tangent 0.02))
      (layer "In2.Cu" (type "copper") (thickness 0.0152))
      (layer "dielectric 3" (type "prepreg") (thickness 0.0994) (material "3313") (epsilon_r 4.1) (loss_tangent 0.02))
      (layer "B.Cu" (type "copper") (thickness 0.035))
      (layer "B.Mask" (type "Bottom Solder Mask") (thickness 0.01))
      (layer "B.Paste" (type "Bottom Solder Paste"))
      (layer "B.SilkS" (type "Bottom Silk Screen"))
      (copper_finish "ENIG") (dielectric_constraints yes))'''
    raw=raw.replace('(setup\n','(setup\n'+stack+'\n',1);target.write_text(raw)
    assert p.LoadBoard(str(target)) is not None
    # Local library tables include every library used; all project-relative custom paths.
    libs=sorted({c['footprint'].split(':')[0] for c in spec['components'] if c.get('footprint')})
    (ROOT/'fp-lib-table').write_text('(fp_lib_table\n'+'\n'.join(
        f'(lib (name "{lib}") (type "KiCad") (uri "'+('${KIPRJMOD}/lib/RAMS_JLC.pretty' if lib=='RAMS_JLC' else '${KICAD10_FOOTPRINT_DIR}/'+lib+'.pretty')+'") (options "") (descr ""))' for lib in libs)+'\n)')
    (ROOT/'sym-lib-table').write_text('(sym_lib_table (lib (name "RAMS_JLC") (type "KiCad") (uri "${KIPRJMOD}/lib/RAMS_JLC.kicad_sym") (options "") (descr "Verified selected devices")))')
    print('Saved',target, 'footprints=',len(footprints), 'tracks/vias=',len(list(board.GetTracks())))
    return board

if __name__=='__main__':make_board()
