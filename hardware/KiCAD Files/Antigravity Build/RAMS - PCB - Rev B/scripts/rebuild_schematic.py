"""Regenerate a spaced Rev B schematic from the reviewed board pin map."""
from pathlib import Path
import importlib.util,json,copy,re
from uuid import uuid4
from sexpr import loads,dumps,child,children,h,q,unq,prop

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT.parent/'RAMS - PCB'
spec=importlib.util.spec_from_file_location('original_renderer',SOURCE/'scripts/generate_rams_schematic.py')
g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
g.CUSTOM_SYM_FILE=str(ROOT/'lib/rams.kicad_sym')
original=loads((SOURCE/'RAMS - PCB.kicad_sch').read_text(encoding='utf-8-sig'))
original_symbols={unq(prop(s,'Reference')[2]):s for s in children(original,'symbol')}
root_uuid=unq(child(original,'uuid')[1])
components=json.loads((ROOT/'review/corrected_components.json').read_text())

# Update project-local DW01A definition to the documented NC pin, not an invented TD input.
custom=loads((ROOT/'lib/rams.kicad_sym').read_text(encoding='utf-8-sig'))
dw=next(s for s in children(custom,'symbol') if unq(s[1])=='DW01A')
for unit in children(dw,'symbol'):
    for pin in children(unit,'pin'):
        if unq(child(pin,'number')[1])=='4':child(pin,'name')[1]=q('NC');pin[1]='no_connect'
(ROOT/'lib/rams.kicad_sym').write_text(dumps(custom)+'\n',encoding='utf-8')

lib_content,pin_defs=g.build_all_symbols()
lib=loads('(lib_symbols '+lib_content+')')
# Use explicit local resolved definitions for inherited standard symbols. The old
# renderer flattens inheritance; name them locally so library comparison stays exact.
resolved={}
for libid in ['Regulator_Linear:AP2112K-3.3','Transistor_BJT:BC817','Diode:1N4148W','Diode:SS14']:
    sym=next(t for t in children(lib,'symbol') if unq(t[1])==libid)
    name=libid.split(':')[1];resolved[libid]='rams:'+name
    sym[1]=q(resolved[libid]);local=copy.deepcopy(sym);local[1]=q(name)
    custom=[t for t in custom if not(h(t)=='symbol' and unq(t[1])==name)]
    custom.append(local);pin_defs[resolved[libid]]=pin_defs[libid]
antenna=copy.deepcopy(next(s for s in children(lib,'symbol') if unq(s[1])=='Device:Antenna_Chip'))
antenna[1]=q('rams:Antenna_B100')
for unit in children(antenna,'symbol'):
    unit[1]=q(unq(unit[1]).replace('Antenna_Chip','Antenna_B100'))
    for pin in children(unit,'pin'):
        if unq(child(pin,'number')[1])=='2':child(pin,'name')[1]=q('NC');pin[1]='passive'
lib.append(antenna)
pin_defs['rams:Antenna_B100']=g.parse_pins_robust(dumps(antenna))
local_ant=copy.deepcopy(antenna);local_ant[1]=q('Antenna_B100')
custom=[s for s in custom if not(isinstance(s,list) and h(s)=='symbol' and unq(s[1])=='Antenna_B100')]
custom.append(local_ant)
(ROOT/'lib/rams.kicad_sym').write_text(dumps(custom)+'\n',encoding='utf-8')

s=g.CleanSchematic(root_uuid,'RAMS - PCB',pin_defs)
s.add_banner('RAMS WEARABLE — REV B ENGINEERING DRAFT',20,17,3)
s.add_banner('Part confirmation and hardware validation required before fabrication',20,25,1.5)

# Spacious functional blocks on one A2 sheet. Every connection uses the same reviewed net map.
groups=[
 ('USB-C AND CHARGER',20,40, [('J1',55,83,0),('D1',130,75,0),('U3',190,75,0),
   ('R1',45,135,0),('R2',80,135,0),('C1',115,135,0),('C2',150,135,0),('C3',185,135,0),('R3',220,135,0)]),
 ('BATTERY PROTECTION AND POWER PATH',260,40,[('J2',285,70,0),('U4',340,78,0),('Q3',410,78,0),('Q1',485,78,0),('D2',545,78,90),
   ('R4',280,135,0),('R5',320,135,0),('C5',360,135,0),('C6',400,135,0),('C4',440,135,0),('R6',485,135,0),('SW1',540,135,0)]),
 ('3.3 V REGULATOR AND LORA MODULE',20,180,[('U5',55,212,0),('U2',185,225,0),
   ('R7',35,265,0),('C7',70,265,0),('C8',105,265,0),('C9',35,310,0),('C10',70,310,0),
   ('FB1',125,315,90),('C26',170,315,0),('C27',210,315,0),('R11',205,280,90)]),
 ('ESP32-S3 AND RESET',260,180,[('U1',310,265,0),('R8',370,217,0),('C23',415,217,0),('SW2',465,215,0),('SW3',540,215,0)]),
 ('MCU DECOUPLING',260,340,[('L1',280,370,90),('C11',325,370,0),('C12',360,370,0),('C13',395,370,0),('C14',430,370,0),
   ('C15',465,370,0),('C16',500,370,0),('C17',535,370,0)]),
]
# A custom taller page allows readable 1:1 component labels without dense overlap.
groups.extend([
 ('ANALOG SUPPLY AND CLOCK',20,350,[('C20',40,385,0),('C21',80,385,0),('C22',120,385,0),('Y1',195,385,0),
   ('R9',40,430,90),('C24',95,430,0),('C25',150,430,0)]),
 ('RF AND USER INTERFACE',260,415,[('C18',280,450,0),('L2',325,450,90),('C19',365,450,0),('R10',410,450,90),('ANT1',470,450,0),
   ('LED1',285,505,0),('C28',330,505,0),('BZ1',385,505,0),('Q2',440,505,0),('D3',500,505,90),
   ('R12',280,550,0),('R13',325,550,0),('R14',385,550,0),('R15',430,550,0),('C29',465,550,0)])
])
seen=set()
for title,x,y,placements in groups:
    s.add_banner(title,x,y,2)
    for ref,px,py,rotation in placements:
        assert ref not in seen,ref
        seen.add(ref);c=components[ref];old=original_symbols[ref]
        libid=unq(child(old,'lib_id')[1])
        if ref=='ANT1':libid='rams:Antenna_B100'
        # Regenerate these from actual standard library rather than overridden cached pins.
        if ref=='Q2':libid='Transistor_BJT:BC817'
        libid=resolved.get(libid,libid)
        nets={p['pin']:('NC' if p['net'].startswith('unconnected-') or not p['net'] else p['net'].removeprefix('/')) for p in c['pads']}
        for pin in pin_defs[libid]:nets.setdefault(pin,'NC')
        s.place_component(libid,ref,c['value'],c['footprint'],px,py,rotation,nets)
assert seen==set(components),(set(components)-seen,seen-set(components))
for i,name in enumerate(['GND','B_MINUS','VDD_SPI','VBUS','LDO_IN','DW_VCC','VDD3P3_A','LORA_VDD'],1):
    s.place_pwr_flag(name,30+(i-1)*26,505,i)
s.add_banner('Flags denote supplies through connectors or passive paths; they do not replace copper connections.',20,530,1.2)
s.add_banner('Q3: six-pin FuxinSemi-compatible map; verify the purchased device before assembly.',20,545,1.2)
s.add_banner('LED package/supply pending exact WS2812B identification. Antenna matching requires RF measurement.',20,558,1.2)

root=loads('(kicad_sch (version 20260101) (generator "eeschema") (generator_version "10.0") '
           f'(uuid "{root_uuid}") (paper "A2") '
           '(title_block (title "RAMS Wearable - Rev B DRAFT") (date "2026-10-30") (rev "B-DRAFT") '
           '(comment 1 "Purchased parts revision - not released for fabrication")) '+dumps(lib)+' '+ '\n'.join(s.items)+')')
for sym in children(root,'symbol'):
    ref=unq(prop(sym,'Reference')[2]);old=original_symbols.get(ref)
    if old:
        child(sym,'uuid')[1]=child(old,'uuid')[1]
        oldpins={unq(p[1]):p for p in children(old,'pin')}
        for pin in children(sym,'pin'):
            if unq(pin[1]) in oldpins:child(pin,'uuid')[1]=child(oldpins[unq(pin[1])],'uuid')[1]
    inst=child(sym,'instances');project=child(inst,'project');child(project,'path')[1]=q('/'+root_uuid)
# Compress the intentionally generous draft grid onto standard A2, translating
# each object without distorting symbols or wire lengths within a component.
def translate(node,dy):
    for item in node:
        if isinstance(item,list):
            if h(item) in ('at','xy'):item[2]=str(round(float(item[2])+dy,4))
            else:translate(item,dy)
# Each renderer call emitted a symbol followed by its wires and labels.
dy=0
for item in root[1:]:
    if not isinstance(item,list) or h(item)=='lib_symbols':continue
    if h(item) in ('symbol','text'):
        y=float(child(item,'at')[2]);dy=round(round((y*.68-y)/1.27)*1.27,4)
        if h(item)=='text' and y==17:dy=-2
        if h(item)=='text' and y==25:dy=-3
    if h(item) in ('symbol','text','wire','label','no_connect'):translate(item,dy)
(ROOT/'RAMS - PCB.kicad_sch').write_text(dumps(root)+'\n',encoding='utf-8')
print('Wrote readable Rev B schematic with',len(seen),'components')
