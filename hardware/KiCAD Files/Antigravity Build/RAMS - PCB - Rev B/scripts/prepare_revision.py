"""Build the Rev B working board from the unchanged ordered board; KiCad Python.

This is an engineering draft. LED package/revision and RF validation remain gates.
"""
from pathlib import Path
import json
import pcbnew as k
from sexpr import loads,dumps,h,child,children,prop,q

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'RAMS - PCB'
BOARD = ROOT / 'RAMS - PCB.kicad_pcb'
LIBS = Path(r'C:\Program Files\KiCad\10.0\share\kicad\footprints')
mm = k.FromMM
v = lambda x,y: k.VECTOR2I(mm(x),mm(y))
source_tree=loads((SOURCE/BOARD.name).read_text(encoding='utf-8'))
old=next(fp for fp in children(source_tree,'footprint') if prop(fp,'Reference')[2]=='"Q3"')
new=loads((LIBS/'Package_TO_SOT_SMD.pretty/SOT-23-6.kicad_mod').read_text())
new[1]=q('Package_TO_SOT_SMD:SOT-23-6')
for key in ['version','generator','generator_version','uuid','path','at']:
    n=child(new,key)
    if n:new.remove(n)
for key in ['uuid','path']:
    n=child(old,key)
    if n:new.append(n)
new.append(['at','138.5','126.5','0'])
prop(new,'Reference')[2]=q('Q3');prop(new,'Value')[2]=q('FS8205A')
source_tree[source_tree.index(old)]=new
BOARD.write_text(dumps(source_tree)+'\n',encoding='utf-8')
b = k.LoadBoard(str(BOARD))
f = {p.GetReference():p for p in b.GetFootprints()}

def net(name):
    n = b.FindNet(name)
    if not n:
        n = k.NETINFO_ITEM(b,name); b.Add(n)
    return n

def assign(ref,pin,name):
    for p in f[ref].Pads():
        if p.GetNumber()==str(pin): p.SetNet(net(name))

def replace(ref,lib,name):
    old=f[ref]
    raw=k.PCB_IO_KICAD_SEXPR().FootprintLoad(str(LIBS/(lib+'.pretty')),name)
    new=k.FOOTPRINT.__new__(k.FOOTPRINT)
    new.this=raw  # KiCad 10's Windows plugin wrapper returns an untyped SWIG pointer.
    assert new, (lib,name)
    new.SetReference(ref); new.SetValue(old.GetValue())
    new.SetFPID(k.LIB_ID(lib,name));new.SetPath(old.GetPath())
    new.SetUuid(old.m_Uuid)
    new.SetPosition(old.GetPosition());new.SetOrientation(old.GetOrientation())
    b.Delete(old);b.Add(new);f[ref]=new

def remove_nets(names):
    for t in list(b.GetTracks()):
        if t.GetNetname() in names: b.Delete(t)

def move(ref,x,y,angle=None):
    old=f[ref]; oldpads=[p.GetPosition() for p in old.Pads()]
    # Remove tracks touching old pads; the router reconnects the moved footprint.
    for t in list(b.GetTracks()):
        if any(t.GetStart()==p or t.GetEnd()==p for p in oldpads): b.Delete(t)
    old.SetPosition(v(x,y))
    if angle is not None: old.SetOrientationDegrees(angle)

def via(x,y,name='/GND',diam=.6,drill=.3):
    t=k.PCB_VIA(b);t.SetPosition(v(x,y));t.SetWidth(mm(diam))
    t.SetDrill(mm(drill));t.SetViaType(k.VIATYPE_THROUGH)
    t.SetLayerPair(k.F_Cu,k.B_Cu);t.SetNet(net(name));b.Add(t)
    return t

def track(x1,y1,x2,y2,name,layer=k.F_Cu,width=.25):
    t=k.PCB_TRACK(b);t.SetStart(v(x1,y1));t.SetEnd(v(x2,y2))
    t.SetLayer(layer);t.SetWidth(mm(width));t.SetNet(net(name));b.Add(t)
    return t

# Required analog rail: join its existing copper and capacitors to the 3.3 V net.
for p in b.GetPads():
    if p.GetNetname()=='/VDDA_PWR': p.SetNet(net('/+3V3'))
for t in b.GetTracks():
    if t.GetNetname()=='/VDDA_PWR': t.SetNet(net('/+3V3'))

# Six-lead FuxinSemi-compatible FS8205A. Seller identity remains an assembly check.
remove_nets({'/DW_OD','/DW_OC','/DW_TD','/B_MINUS'})
for pin,name in {'1':'/B_MINUS','2':'/FET_DRAIN','3':'/GND',
                 '4':'/DW_OC','5':'/FET_DRAIN','6':'/DW_OD'}.items(): assign('Q3',pin,name)
assign('U4','4','unconnected-(U4-NC-Pad4)')
assign('U3','1','unconnected-(U3-CHRG-Pad1)')
f['J1'].SetFPID(k.LIB_ID('rams','USB_C_TYPE_C_31_M_12'))
assign('C6','1','/B_PLUS');assign('C6','2','/B_MINUS')

# ANT1 is the purchased B100 two-terminal antenna. Its anchoring terminal is NC.
f['ANT1'].SetValue('2450AT18B100E')
assign('ANT1','2','unconnected-(ANT1-NC-Pad2)')
# Increase both-layer clearance around the antenna; feed is the only RF conductor.
for z in list(b.Zones()):
    if z.GetIsRuleArea(): b.Delete(z)
for layer in [k.F_Cu,k.B_Cu]:
    z=k.ZONE(b);z.SetLayer(layer);z.SetIsRuleArea(True)
    z.SetDoNotAllowZoneFills(True);z.SetDoNotAllowTracks(False)
    z.SetDoNotAllowPads(False);z.SetDoNotAllowVias(True)
    o=z.Outline();o.NewOutline()
    for x,y in [(100,100),(107.5,100),(107.5,106.5),(100,106.5)]:o.Append(mm(x),mm(y))
    b.Add(z)

# LED data goes to GPIO48, as used by the application firmware.
# Its physical footprint/power are deliberately finalized separately after confirmation.
remove_nets({'/NEO_DATA'})
assign('U1','52','unconnected-(U1-GPIO46-Pad52)')
assign('U1','36','/NEO_DATA')

# Put the VDDA decouplers beside the actual VDDA pins, not the opposite chip edge.
move('C21',113.4,109.0,90)
move('C22',115.0,109.0,90)

# Remove obsolete silk artwork to reserve space for legible revision/assembly markings.
if 'G***' in f: b.Delete(f.pop('G***'))
for fp in b.GetFootprints(): fp.SetLocked(False)

# Keep original routing for unchanged nets. Critical RF/clock traces remain locked.
for t in b.GetTracks():
    t.SetLocked(t.GetNetname() in {'/RF_LNA','/RF_MID','/ANT_FEED','/XTAL_P','/XTAL_N','/XTAL_P_DRV'})

# MCU exposed-pad grounding: 3x3 plated vias in the 4x4mm thermal pad.
# Bottom-layer conflicts are checked and repaired by DRC before release.
for x in (115,116,117):
    for y in (113,114,115):via(x,y)

k.SaveBoard(str(BOARD),b)
components={}
for fp in b.GetFootprints():
    components[fp.GetReference()]={
      'value':fp.GetValue(),'footprint':str(fp.GetFPID().GetLibNickname())+':'+str(fp.GetFPID().GetLibItemName()),
      'fields':{},
      'pads':[{'pin':p.GetNumber(),'net':p.GetNetname()} for p in fp.Pads() if p.GetNumber()]}
(ROOT/'review/corrected_components.json').write_text(json.dumps(components,indent=2),encoding='utf-8')
assert len([p for p in f['Q3'].Pads()])==6
assert all(p.GetNetname()=='/+3V3' for p in f['U1'].Pads() if p.GetNumber() in ('55','56'))
assert next(p for p in f['ANT1'].Pads() if p.GetNumber()=='2').GetNetname().startswith('unconnected-')
print('Prepared Rev B draft:',BOARD)

