"""Read-only electrical and physical invariants for the presentation-only edit.

Canonical native netlists omit generated timestamps and net numbers. Board
comparison keeps every track, via, pad, courtyard, keepout and filled polygon;
only reference-field presentation, model attachments and silk leaders may vary.
"""
from pathlib import Path
import hashlib,json,subprocess,xml.etree.ElementTree as ET
from schematic_helpers import parse_sexpr,children,child
R=Path(__file__).resolve().parents[1]
BASE=R/'verification/readability_before_20261112_213559'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def canonical_board(path):
 t=parse_sexpr(path.read_text(encoding='utf-8'))
 fps={}
 for f in children(t,'footprint'):
  ref=next(a[2] for a in children(f,'property') if a[1]=='Reference')
  fps[ref]=[n for n in f if not (isinstance(n,list) and
     (n[0]=='model' or (n[0]=='property' and n[1]=='Reference')))]
 # UUID order is immaterial; content and exact geometry must remain identical.
 root={tag:sorted([json.dumps(n) for n in children(t,tag)]) for tag in
       ['segment','arc','via','zone','net','setup','layers','general']}
 root['footprints']=fps
 root['edges']=[g for g in children(t,'gr_line') if child(g,'layer')[1]=='Edge.Cuts']
 return root
before=canonical_board(BASE/'RAMS_JLC_S3.kicad_pcb')
after=canonical_board(R/'RAMS_JLC_S3.kicad_pcb')
assert before==after,'Non-presentation board content changed'
def canonical_netlist(path):
 t=ET.parse(path).getroot()
 comps={c.attrib['ref']:{k:c.findtext(k) for k in ['value','footprint','tstamps']} for c in t.findall('components/comp')}
 nets={n.attrib['name']:sorted((v.attrib['ref'],v.attrib['pin'],v.attrib.get('pinfunction'),v.attrib.get('pintype')) for v in n.findall('node')) for n in t.findall('nets/net')}
 return comps,nets
net=R/'reports/readability_netlist.xml'
subprocess.run([r'C:/Program Files/KiCad/10.0/bin/kicad-cli.exe','sch','export','netlist','--format','kicadxml','--output',str(net),str(R/'RAMS_JLC_S3.kicad_sch')],check=True)
a=canonical_netlist(BASE/'before_netlist.xml');b=canonical_netlist(net)
assert a==b,'Electrical netlist changed'
report={'date':'2026-11-13','board_sha256':sha(R/'RAMS_JLC_S3.kicad_pcb'),
 'before_board_sha256':sha(BASE/'RAMS_JLC_S3.kicad_pcb'),
 'unchanged':['all tracks/vias','all pads and nets','component placement/rotation/side','courtyards and footprint geometry','zones/keepouts/filled copper','board outline/stack/setup','component values/footprints/UUIDs','canonical schematic component/pin/net assignments'],
 'components':len(b[0]),'nets':len(b[1]),'schematic_sha256':{p.name:sha(p) for p in R.glob('*.kicad_sch')},
 'netlist_sha256':sha(net),'status':'Presentation-only invariants passed; native ERC/DRC and visual QA required separately'}
(R/'reports/readability_validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
