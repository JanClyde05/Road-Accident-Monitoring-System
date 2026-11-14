"""Read-only native layer/assembly previews, with margin for connector overhang."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess, json, hashlib, xml.etree.ElementTree as ET

r=Path(__file__).resolve().parents[1]; board=r/'RAMS_JLC_S3.kicad_pcb'
out=r/'previews/final';out.mkdir(exist_ok=True)
cli=r'C:/Program Files/KiCad/10.0/bin/kicad-cli.exe'
ink=r'D:/Inkscape/bin/inkscape.com'
before=hashlib.sha256(board.read_bytes()).hexdigest()
views={'top_copper':'F.Cu,F.Fab,Edge.Cuts','bottom_copper':'B.Cu,B.Fab,Edge.Cuts',
       'ground_L2':'In1.Cu,Edge.Cuts','signal_L3':'In2.Cu,Edge.Cuts',
       'top_mask':'F.Mask,Edge.Cuts','bottom_mask':'B.Mask,Edge.Cuts',
       'top_silk':'F.SilkS,Edge.Cuts','bottom_silk':'B.SilkS,Edge.Cuts',
       'top_paste':'F.Paste,Edge.Cuts','assembly_top':'F.Fab,Edge.Cuts',
       'assembly_bottom':'B.Fab,Edge.Cuts'}
def export(entry):
 name,layers=entry; svg=out/(name+'.svg');png=out/(name+'.png')
 args=[cli,'pcb','export','svg','--layers',layers,'--mode-single','--fit-page-to-board','--exclude-drawing-sheet','--output',str(svg)]
 if 'bottom' in name:args+=['--mirror']
 args.append(str(board))
 result=subprocess.run(args,capture_output=True,text=True);assert result.returncode==0,result.stderr
 tree=ET.parse(svg);root=tree.getroot();x,y,w,h=map(float,root.attrib['viewBox'].split())
 root.set('viewBox',f'{x-2} {y-2} {w+4} {h+4}');root.set('width',f'{w+4}mm');root.set('height',f'{h+4}mm');tree.write(svg,encoding='utf-8',xml_declaration=True)
 result=subprocess.run([ink,str(svg),'--export-type=png','--export-width=1600','--export-filename='+str(png)],capture_output=True,text=True)
 assert result.returncode==0 and png.exists(),result.stderr
 print(name,flush=True)
with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(export,views.items()))
for side in ['top','bottom']:
 result=subprocess.run([cli,'pcb','render','--output',str(out/(side+'_3d.png')),'--width','1600','--height','1200','--side',side,'--quality','basic',str(board)],capture_output=True,text=True)
 assert result.returncode==0,result.stderr
 print(side+' 3D',flush=True)
assert hashlib.sha256(board.read_bytes()).hexdigest()==before
(out/'source.json').write_text(json.dumps({'board_sha256':before,'note':'Native layer plots; SVG canvas padded 2mm. 82 physical footprint models resolved; generic/illustrative limits in docs/3D_MODEL_SOURCES.md. First-power and derived normal views are not physical fit evidence.','files':{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in out.iterdir() if f.suffix in ['.svg','.png']}},indent=2)+'\n')
