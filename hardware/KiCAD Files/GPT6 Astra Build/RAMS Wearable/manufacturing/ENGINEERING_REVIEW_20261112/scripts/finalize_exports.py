"""Finalize readable drawings, verify exported files and reseal the review ZIP.

Uses installed pypdf with ordinary Python. Only derived package files are edited.
"""
from pathlib import Path
from datetime import datetime
import hashlib,json,re,shutil,subprocess,zipfile
from pypdf import PdfReader
from pypdf.generic import ContentStream
r=Path(__file__).resolve().parents[1];out=r/'manufacturing/ENGINEERING_REVIEW_20261112'
sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
manifest=json.loads((r/'reports/final_validation_manifest.json').read_text())
for section in ['source_sha256','report_sha256']:
 for name,digest in manifest[section].items():assert sha(r/name)==digest,name
backup=r/'verification'/('export_drawing_review_'+datetime.now().strftime('%Y%m%d_%H%M%S'));backup.mkdir()
shutil.copy2(out.with_suffix('.zip'),backup/out.with_suffix('.zip').name)
shutil.copytree(out/'drawings',backup/'drawings')
cli=r'C:/Program Files/KiCad/10.0/bin/kicad-cli.exe';board=out/'source/RAMS_JLC_S3.kicad_pcb'
commands=json.loads((out/'export_commands.json').read_text())
for side in ['top','bottom']:
 for scale in [1,4]:
  old=out/'drawings'/f'assembly_{side}_{scale}x.pdf'
  shutil.copy2(old,out/'drawings'/f'pad_map_{side}_{scale}x.pdf')
  args=[cli,'pcb','export','pdf','--layers',('F.Fab' if side=='top' else 'B.Fab')+',Edge.Cuts','--black-and-white','--mode-single','--scale',str(scale),'--output',str(old)]
  if side=='bottom':args.append('--mirror')
  args.append(str(board));result=subprocess.run(args,capture_output=True,text=True)
  assert result.returncode==0,result.stderr
  commands.append({'purpose':'Separate readable assembly from numbered pad map','args':args,'exit_code':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
  print(old.name,flush=True)
(out/'export_commands.json').write_text(json.dumps(commands,indent=2)+'\n')
readme=out/'READ_ME_FIRST.md';s=readme.read_text();s=s.replace('- drawings/: four-page schematic, top/bottom assembly at 1:1 and 4:1.','- drawings/: four-page schematic, readable assembly and separate numbered pad maps,\n  top/bottom at 1:1 and 4:1.');readme.write_text(s)
shutil.copy2(r/'scripts/export_review.py',out/'scripts/export_review.py')
shutil.copy2(Path(__file__),out/'scripts/finalize_exports.py')
qa={'date':'2026-11-12','status':'export structure/geometry checks passed; supplier and physical gates remain open','board_sha256':sha(board)}
expected={'.gtl':'Copper,L1,Top','.g1':'Copper,L2,Inr','.g2':'Copper,L3,Inr','.gbl':'Copper,L4,Bot','.gts':'Soldermask,Top','.gbs':'Soldermask,Bot','.gto':'Legend,Top','.gbo':'Legend,Bot','.gm1':'Profile,NP'}
for ext,function in expected.items():
 files=list((out/'bare_board').glob('*'+ext));assert len(files)==1
 data=files[0].read_text();assert 'TF.FileFunction,'+function in data,(ext,function)
 assert data.rstrip().endswith('M02*')
qa['gerber_file_functions']=expected
drill=(out/'bare_board/RAMS_JLC_S3-drill.rpt').read_text();assert 'Total plated holes count 185' in drill and 'Total unplated holes count 4' in drill
assert 'METRIC' in (out/'bare_board/RAMS_JLC_S3-PTH.drl').read_text()
qa['drills']={'plated':185,'nonplated':4,'units':'mm','plated_slots':4}
normal=next((out/'stencils/normal_after_qualification').glob('*.gtp')).read_text();initial=next((out/'stencils/first_power').glob('*.gtp')).read_text()
for ref in ['R30','LED1']:assert f'%TO.C,{ref}*%' in normal and f'%TO.C,{ref}*%' not in initial
for ref in ['BZ1','U2']:assert f'%TO.C,{ref}*%' not in normal and f'%TO.C,{ref}*%' not in initial
assert normal.count('D03*')==285 and initial.count('D03*')==279
qa['top_stencil_flashes']={'normal':285,'first_power':279,'omitted':'2 R30 + 4 LED1 pads; BZ1/Ra02 absent in both'}
pdf_checks={}
for file in (out/'drawings').glob('*.pdf'):
 reader=PdfReader(file);assert len(reader.pages)==(4 if file.name=='schematic.pdf' else 1)
 if file.name=='schematic.pdf':pdf_checks[file.name]={'pages':4};continue
 scale=4 if '_4x' in file.name else 1
 p=reader.pages[0];ops=ContentStream(p.get_contents(),p.pdf).operations
 assert ops[0][1]==b'cm' and abs(float(ops[0][0][0])-.0072)<1e-10
 lengths=[];at=None
 for values,operator in ops:
  if operator==b'm':at=list(map(float,values))
  elif operator==b'l':
   end=list(map(float,values));lengths.append([abs(end[i]-at[i])*.0072 for i in [0,1]]);at=end
 for axis,mm in [(0,42),(1,32)]:
  expected_length=mm*72/25.4*scale
  assert sum(abs(v[axis]-expected_length)<.002 and v[1-axis]<.002 for v in lengths)==2,(file,axis)
 if file.name.startswith('assembly_top'):
  text=p.extract_text();assert all(name in text for name in ['ANT1','Y1','U1','C35','TP6','TP7','D3'])
 pdf_checks[file.name]={'pages':1,'scale':scale,'outline_print_size_mm':[42*scale,32*scale]}
qa['pdf_checks']=pdf_checks
for name,digest in manifest['source_sha256'].items():assert sha(out/'source'/name)==digest,name
for section in ['source_sha256','report_sha256']:
 for name,digest in manifest[section].items():assert sha(r/name)==digest,name
(r/'reports/EXPORT_VALIDATION.json').write_text(json.dumps(qa,indent=2)+'\n')
shutil.copy2(r/'reports/EXPORT_VALIDATION.json',out/'reports/EXPORT_VALIDATION.json')
files={str(f.relative_to(out)).replace('\\','/'):sha(f) for f in out.rglob('*') if f.is_file() and f.name!='SHA256_MANIFEST.json'}
(out/'SHA256_MANIFEST.json').write_text(json.dumps(files,indent=2)+'\n')
archive=out.with_suffix('.zip')
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for f in out.rglob('*'):
  if f.is_file():z.write(f,str(f.relative_to(out)))
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
(r/'reports/review_package_identity.json').write_text(json.dumps({'zip':str(archive.relative_to(r)).replace('\\','/'),'sha256':sha(archive),'files':len(files),'source_board_sha256':sha(board)},indent=2)+'\n')
print('Export QA and ZIP integrity passed',sha(archive),flush=True)
