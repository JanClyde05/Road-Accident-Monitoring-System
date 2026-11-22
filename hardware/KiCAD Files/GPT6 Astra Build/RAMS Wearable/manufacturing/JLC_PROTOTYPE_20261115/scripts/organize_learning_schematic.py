"""Rearrange saved native electrical islands; add non-electrical teaching cards.

The immutable input backup preserves UUIDs and every wire/label/pin. No live
symbol is copied. Native netlist equality/ERC are required after this edit.
"""
from pathlib import Path
import copy,json
from uuid import uuid5,NAMESPACE_URL
from schematic_helpers import parse_sexpr,sexpr,children,child,Quoted as Q
R=Path(__file__).resolve().parents[1]
BASE=R/'verification/readability_before_20261112_213559'
assert BASE.is_dir()
def uid(s):return str(uuid5(NAMESPACE_URL,'RAMS-J2-learning:'+s))
def graphic(s):return parse_sexpr(s)
def note(key,text,x,y,size=1.05):
 return graphic(f'(text {json.dumps(text,ensure_ascii=False)} (at {x} {y} 0) (effects (font (size {size} {size})) (justify left top)) (uuid "{uid(key)}"))')
def rect(key,x,y,w,h):
 return graphic(f'(rectangle (start {x} {y}) (end {x+w} {y+h}) (stroke (width 0.25) (type default)) (fill (type none)) (uuid "{uid(key)}"))')
def line(key,points,width=.25):
 pts=' '.join(f'(xy {x} {y})' for x,y in points)
 return graphic(f'(polyline (pts {pts}) (stroke (width {width}) (type default)) (fill (type none)) (uuid "{uid(key)}"))')
def arrow(key,x1,y1,x2,y2):
 import math
 a=math.atan2(y2-y1,x2-x1);d=2
 return [line(key,[(x1,y1),(x2,y2)]),line(key+'head',[(x2-d*math.cos(a-.5),y2-d*math.sin(a-.5)),(x2,y2),(x2-d*math.cos(a+.5),y2-d*math.sin(a+.5))])]
cards={}; positions={}
def card(sheet,key,title,box,parts,notes,ny):
 cards.setdefault(sheet,[]).append(dict(key=key,title=title,box=box,notes=notes,ny=ny))
 for ref,x,y in parts:assert ref not in positions;positions[ref]=(x,y)

card('power','usb','01  USB-C INPUT / ESD',(12,18,126,125),[
 ('J1',38.1,66.04),('R1',81.28,43.18),('R2',111.76,43.18),('C1',81.28,76.2),('C2',111.76,76.2),('D1',96.52,106.68)],
 ['R1/R2 5.1k: USB-C sink detection in either orientation; no USB-PD negotiation.',
 'D1 clamps fast ESD; C1/C2 locally bypass VBUS. Keep the ESD return short.',
 'Power: VBUS -> D2 -> SYS_IN. Data: D1 -> R38/R39 -> GPIO19/20 (sheet 4).'],128)
card('power','charger','02  SINGLE-CELL 4.2 V CHARGER',(144,18,126,125),[
 ('R30',175.26,43.18),('U3',180.34,78.74),('R3',246.38,78.74),('C3',168.91,109.22),('C4',238.76,109.22)],
 ['U3: constant-current then constant-voltage charge. C3 input / C4 battery bypass.',
 'I_CHG ~= 1000 x 1 V / 10k = 100 mA (0.2C at 500 mAh; 0.1C at 1000 mAh).',
 'R30 initially DNP. Fit after cell/polarity/rating checks; verify charge and heat.'],128)
card('power','protection','03  CELL CONNECTOR / PROTECTION',(276,18,132,125),[
 ('J2',307.34,43.18),('U4',307.34,78.74),('Q3',375.92,78.74),('R4',297.18,109.22),('R5',337.82,109.22),('C5',375.92,109.22)],
 ['U4 monitors the cell; opposing Q3 MOSFETs interrupt its return during faults.',
 'R4/C5: tau = 100R x 100nF = 10 us; ideal fc = 1/(2*pi*RC) = 15.9 kHz.',
 'R5 is the sense-input resistor. B_MINUS != GND: do not bypass Q3.'],128)
card('power','sharing','04  SOURCE SHARING / CONTROL-ONLY SWITCH',(12,148,126,123),[
 ('D2',43.18,175.26),('Q1',83.82,175.26),('R6',114.3,175.26),('SW1',45.72,213.36),('R7',106.68,213.36)],
 ['USB: VBUS -> D2 -> SYS_IN. Battery: B_PLUS -> Q1 -> SYS_IN.',
 'R6 pulls Q1 gate low without USB; USB raises its gate to isolate the cell path.',
 'SW1 ON grounds LED_GATE; OFF grounds SYS_EN. R7/R41 are pull-ups.',
 'Contacts carry control current only: 4.2 V / 100k = 42 uA per grounded pull-up.',
 'OFF disables loads; charging/protection are still connected. Q5/R41: sheet 4.'],241)
card('power','ldo','05  3.3 V LDO / LOCAL BULK CAPACITANCE',(144,148,126,123),[
 ('U5',205.74,182.88),('C7',170.18,220.98),('C10',238.76,220.98)],
 ['U5 reuses the owned linear regulator; C7/C10 support input/output transients.',
 'Heat ~= (VSYS - 3.3 V)*Iavg; example (4.7 - 3.3)*0.25 A = 0.35 W.',
 'Droop ~= deltaI*deltat/Ceff + ESR step; 100mA*10us/10uF = 0.10 V.',
 'This is brief charge support, not guaranteed brownout prevention; DC bias lowers C.',
 'Verify rail sag + temperature. A 600 mA rating is not an enclosed thermal guarantee.'],241)
card('power','adc','06  BATTERY ADC / OFF-STATE ISOLATION',(276,148,132,105),[
 ('Q4',355.6,179.07),('R15',304.8,209.55),('R16',342.9,209.55),('C29',381,209.55)],
 ['VADC = VBAT*10/(30+10) = VBAT/4; 4.2 V -> 1.05 V; divider current 105 uA.',
 'Q4 blocks cell-to-ADC drive when +3V3 is off. R16 discharges the node.',
 'ON: Rth ~= 30k||10k = 7.5k; 1nF gives tau 7.5us, fc 21.2kHz (ideal).',
 'OFF: R16*C29 = 10us. Small C prioritizes safe discharge, not 5s report filtering.',
 'J2 firmware uses calibrated mV x4 + averaging/EMA. Verify actual rail transitions.'],232)

card('mcu','processor','07  ESP32-S3FH4R2 / PIN CONTRACT',(12,18,135,203),[('U1',78.74,119.38)],
 ['4 MB embedded flash + 2 MB quad PSRAM; initial build leaves PSRAM disabled.',
 'Phone GPS/IMU -> BLE -> U1 -> LoRa. No separate GPS/IMU hardware added.',
 'GPIO0 BOOT/cancel; 1 buzzer; 2 ADC; 8/9 LoRa interrupt/reset.',
 'GPIO10/11/12/13 NSS/MOSI/SCK/MISO; 19/20 USB D-/D+; 48 RGB.',
 'Exposed pad 57 is GND and a thermal path; inspect the hidden solder joint.'],199)
card('mcu','bypass','08  LOCAL BYPASS / RF SUPPLY FEED',(153,18,255,83),[
 ('L1',170.18,43.18),('C11',215.9,43.18),('C12',259.08,43.18),('C13',302.26,43.18),('C14',355.6,43.18),
 ('C15',170.18,76.2),('C16',213.36,76.2),('C17',256.54,76.2),('C20',299.72,76.2),('C21',342.9,76.2),('C22',386.08,76.2)],
 ['L1 + C11/C12/C13 feed/bypass VDD_RF; C14 supports main rail; C15/C16 serve CPU/RTC; C21/C22 analog supply.',
 'C17/C20 bypass internally supplied VDD_SPI: do not tie it to +3V3. Ideal |XC|=1/(2*pi*f*C); real ESR/ESL and placement matter.'],92)
card('mcu','reset','09  RESET / BOOT / STRAPS',(153,107,128,105),[
 ('R8',172.72,137.16),('C33',215.9,137.16),('R34',170.18,172.72),('R35',215.9,172.72),('R36',254,172.72)],
 ['R8*C33 = 10k*1uF = 10 ms. EN(t)=VDD*(1-exp(-t/tau)); 63% at tau.',
 'Reset release depends on the input threshold and supply ramp, not exactly 10 ms.',
 'R34 holds GPIO0 high; R35/R36 hold GPIO45/46 low while straps are sampled.',
 'Buttons on sheet 4: hold BOOT, tap RESET, release BOOT to enter download.'],195)
card('mcu','crystal','10  40 MHz CLOCK / INITIAL LOADS',(287,107,121,105),[
 ('R9',309.88,137.16),('Y1',365.76,137.16),('C24',320.04,177.8),('C25',375.92,177.8)],
 ['CL ~= C24*C25/(C24+C25)+Cstray = 6pF + assumed 4pF = 10pF.',
 '12pF is an available starting pair; actual stray capacitance is unmeasured.',
 'R9 22R damps/limits drive. It differs from Espressif\'s 24nH starting guidance.',
 'Measure startup, frequency and drive/harmonics; these parts are not tuned yet.'],195)
card('mcu','rf','11  2.4 GHz MATCHING / ANTENNA — STARTING VALUES',(12,225,286,57),[
 ('C18',35.56,246.38),('L2',73.66,246.38),('C19',111.76,246.38),('C32',149.86,246.38),('L4',187.96,246.38),('L5',226.06,246.38),('ANT1',269.24,246.38)],
 ['CLC: 1.5pF / 2.4nH / 1.5pF. Antenna network: 1.2pF series / 2.7nH shunt / 3.3nH series. ANT1 pin2 is intentionally NC.',
 'At 2.4GHz: XL(2.4nH)=36.2R; |XC|(1.5pF)=44.2R (ideal examples, not proof of a 50R match).',
 'Tune with actual board/enclosure/body loading. Keep antenna no-metal area clear; LoRa uses a separate 433MHz antenna.'],268)

card('io','lora','12  Ra-02 / FILTERED SUPPLY / SPI',(12,18,126,143),[
 ('U2',53.34,86.36),('FB1',40.64,43.18),('C26',81.28,43.18),('C27',114.3,43.18),('R11',111.76,86.36),('R37',111.76,121.92)],
 ['FB1 + C26/C27 isolate/bypass radio supply; ferrite Z depends on frequency.',
 'R11 33R damps SCK; R37 10k keeps NSS high/unselected at startup.',
 '433MHz / SF9 / BW125kHz / CR4/5 / 17dBm / sync0x34.',
 'Fit 433MHz antenna before TX. Hand-solder bottom module after top reflow.'],144)
card('io','rgb','13  RGB POWER / DATA LEVEL TRANSLATION',(144,18,146,143),[
 ('Q5',172.72,43.18),('R41',213.36,43.18),('C35',264.16,43.18),('U6',177.8,91.44),('LED1',254,91.44),('R13',238.76,63.5),('R42',160.02,124.46),('R43',200.66,124.46),('C34',238.76,124.46),('C28',274.32,124.46)],
 ['Q5 switches raw SYS_IN; R41 pulls gate off. U6 translates 3.3V GPIO48 to LED_PWR.',
 'C34/C35 bypass both U6 rails; C28 bypasses LED. R13 damps; R42/R43 pull data low.',
 '0 bit H/L=300/1000ns; 1 bit=700/600ns; reset >=300us LOW (J2 RMT profile).',
 'LED1 initially DNP: qualify exact stock voltage/pinout/current. No LED power boost.'],144)
card('io','buzzer','14  ACTIVE BUZZER / NPN DRIVER',(296,18,112,143),[
 ('BZ1',330.2,45.72),('D3',373.38,73.66),('Q2',358.14,109.22),('R12',320.04,88.9),('R14',312.42,124.46)],
 ['Load current: +3V3 -> BZ1 -> Q2 -> GND. GPIO1 supplies base drive.',
 'IB ~= (3.3-0.8)/330 = 7.58mA (assumed VBE). Conservative example:',
 '(2.4-1.2)/330=3.64mA; forced gain10 suggests ~36mA load.',
 'R14 holds OFF; D3 handles inductive transients. Verify actual buzzer current.'],144)
card('io','controls','CONTROLS / USB SERIES DAMPING',(12,167,126,81),[
 ('SW2',43.18,190.5),('SW3',104.14,190.5),('R38',43.18,215.9),('R39',104.14,215.9)],
 ['SW2 grounds MCU_EN; SW3 grounds GPIO0 for boot/cancel.',
 'R38/R39 22R reduce USB edge ringing near the MCU; not a voltage divider.',
 'PCB differential geometry and stackup still need impedance confirmation.'],235)
card('io','test','15  TEST ACCESS / PROTECTED GROUND',(144,167,146,81),[
 (f'TP{i+1}',[165.1,203.2,241.3,279.4][i%4],[190.5,223.52][i//4]) for i in range(8)],
 ['Use TP1/GND as system reference; do not short B_MINUS to GND via instruments.'],243)
card('io','flags','ERC SOURCE DECLARATIONS — SOFTWARE ONLY, NO PARTS TO BUY',(12,254,278,28),[
 (f'#FLG{i+1:03}',25.4+i*30.48,265.43) for i in range(9)],[],278)
card('io','read','HOW TO READ / COST AND QUALITY',(296,167,112,85),[],[
 ['Same global net name = same electrical connection, across all sheets.',
 'Cross on a pin = deliberate no-connect. DNP = staged omission.',
 'Text/boxes/arrows explain the circuit; they are not electrical wires.',
 'Equations use nominal values and stated assumptions; measure real behavior.',
 'Reuse suitable stock. Every added part should earn its cost and board space.',
 'No new electrical components were added for this learning layout.',
 'Full explanations, sources and lessons: docs/SCHEMATIC_LEARNING_NOTES.md.'][i] for i in range(7)],183)

electrical={'symbol','wire','global_label','label','no_connect','junction','bus','bus_entry','hierarchical_label'}
def translate(node,dx,dy):
 if not isinstance(node,list):return
 if node and node[0] in ['at','xy']:
  node[1]=str(round(float(node[1])+dx,4));node[2]=str(round(float(node[2])+dy,4))
 else:
  for n in node:translate(n,dx,dy)
all_refs=[]
for sheet in ['power','mcu','io']:
 file=R/f'RAMS_JLC_S3_{sheet}.kicad_sch';tree=parse_sexpr((BASE/file.name).read_text())
 groups={};current=None
 for node in tree:
  if not isinstance(node,list):continue
  if node[0]=='symbol':
   ref=next(a[2] for a in children(node,'property') if a[1]=='Reference');current=str(ref);groups[current]=[]
  if node[0] in electrical:
   assert current is not None;groups[current].append(node)
 new=[n for n in tree if not isinstance(n,list) or n[0] not in electrical|{'text','text_box','rectangle','polyline'}]
 for ref,group in groups.items():
  assert ref in positions,ref
  at=child(group[0],'at');dx=positions[ref][0]-float(at[1]);dy=positions[ref][1]-float(at[2])
  for node in group:translate(node,dx,dy)
  new.extend(group);all_refs.append(ref)
 for c in cards[sheet]:
  x,y,w,h=c['box'];new.extend([rect(sheet+c['key'],x,y,w,h),note(sheet+c['key']+'title',c['title'],x+2.5,y+2.5,1.3)])
  for i,text in enumerate(c['notes']):new.append(note(sheet+c['key']+str(i),text,x+2.5,c['ny']+i*2.8,1.2))
 file.write_text('('+ '\n'.join(sexpr(n) for n in new)+')\n',encoding='utf-8')
assert len(all_refs)==99 and set(all_refs)==set(positions)

root=R/'RAMS_JLC_S3.kicad_sch';tree=parse_sexpr((BASE/root.name).read_text())
tree=[n for n in tree if not isinstance(n,list) or n[0] not in ['text','rectangle','polyline']]
tree.extend([note('title','RAMS J2 / DESIGN MAP AND LEARNING GUIDE',20,20,2),note('subtitle','42 x 32 mm | bare ESP32-S3 | AP2112 linear supply | one protected LiPo | no buck/boost',20,30,1.3)])
descriptions=[['USB, cell charging and protection','Source sharing + main switch','3.3V regulator + battery ADC'],['Processor / GPIO assignments','Decoupling / reset / crystal','2.4GHz matching and antenna'],['Ra-02 / RGB / active buzzer','Buttons / USB damping / test pads','Firmware and assembly contracts']]
for i,s in enumerate(children(tree,'sheet')):
 x=20+i*130;y=55;old=child(s,'at');dx=x-float(old[1]);dy=y-float(old[2]);translate(s,dx,dy);child(s,'size')[1:]=['118','40']
 for prop in children(s,'property'):
  if prop[1]=='Sheetname':child(child(child(prop,'effects'),'font'),'size')[1:]=['1.3','1.3']
  if prop[1]=='Sheetfile':child(prop,'at')[1:3]=[str(x),str(y+42)]
 for j,t in enumerate(descriptions[i]):tree.append(note('navigation'+str(i)+str(j),t,x+4,y+7+j*8,1.35))
tree.append(note('navigation_help','Double-click a sheet rectangle to enter. Use Leave Sheet / the up-arrow to return. Each real circuit exists once.',20,108,1.2))
tree.append(rect('flowframe',20,125,378,102));tree.append(note('flowtitle','CONVENTIONAL CURRENT / POWER FLOW — GRAPHICS ONLY',24,129,1.5))
nodes=[('usb','USB 5V',27,148,35,15),('diode','D2',76,148,20,15),('system','SYS_IN',111,148,38,15),('ldo','U5 / 3.3V',165,148,43,15),('loads','U1 + LoRa + buzzer',224,148,75,15),('cell','1S LiPo',27,184,35,15),('pmos','Q1',76,184,20,15),('ledswitch','Q5',165,184,43,15),('led','LED1 (raw rail)',224,184,75,15),('charger','R30 + U3 charger',317,148,73,15)]
for key,text,x,y,w,h in nodes:tree.extend([rect(key,x,y,w,h),note(key+'label',text,x+3,y+5,1.3)])
for i,coords in enumerate([(62,155,76,155),(96,155,111,155),(149,155,165,155),(208,155,224,155),(62,191,76,191),(96,191,130,191),(130,191,130,163),(149,155,149,191),(149,191,165,191),(208,191,224,191)]):tree.extend(arrow('flow'+str(i),*coords))
tree.append(note('chargeflow','Separate branch: USB -> R30 -> U3 -> cell\nR30 initially absent for first power checks.',317,173,1.1))
tree.append(note('return','Battery return: loads -> GND -> Q3 -> B_MINUS. Never bridge this protection boundary.\nUSB return: GND -> J1. Bulk capacitors support short transients; regulator/trace/cell performance sets brownout margin.',27,210,1.3))
tree.extend([rect('confidence',20,235,270,47),note('confidence_title','READ THE NUMBERS WITH THEIR CONDITIONS',24,239,1.35),note('confidence_notes','Calculated: divider ratio, nominal RC time/pole, charge-current setting and illustrative heat/droop.\nStarting values: crystal loads / R9 and RF matching. These still need measurement and tuning.\nActual stock: LED voltage range, buzzer current and mechanical fits need qualification.\nFull component notes, equations, sources and lessons: docs/SCHEMATIC_LEARNING_NOTES.md.',24,249,1.3)])
root.write_text('('+ '\n'.join(sexpr(n) for n in tree)+')\n',encoding='utf-8')
(R/'learning_layout.json').write_text(json.dumps({'source_backup':str(BASE.relative_to(R)),'positions':positions,'cards':cards,'notes':'Non-electrical annotations; UUIDs and circuit islands retained. Verify canonical native netlist equality.'},indent=2)+'\n')
print('Updated four native schematic pages; 99 original symbol instances retained.')
