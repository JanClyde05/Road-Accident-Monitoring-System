"""Bind current native sources to completed reports, with independent invariants."""
from pathlib import Path
from datetime import datetime
import hashlib,json,csv,shutil
import pcbnew as p
r=Path(__file__).resolve().parents[1]; repo=r.parents[3]
sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
board=r/'RAMS_JLC_S3.kicad_pcb';digest=sha(board);b=p.LoadBoard(str(board))
fps={f.GetReference():f for f in b.GetFootprints()}
spec=json.loads((r/'circuit_spec.json').read_text());parts={c['ref']:c for c in spec['components'] if c['footprint']}
assert set(parts)==set(fps) and len(fps)==90
readability=json.loads((r/'reports/readability_validation.json').read_text())
assert readability['board_sha256']==digest
model_inventory={}
def bounds(bb):return [p.ToMM(x) for x in (bb.GetX(),bb.GetY(),bb.GetRight(),bb.GetBottom())]
bodies=[]
for ref,f in fps.items():
 shapes=[bounds(g.GetBoundingBox()) for g in f.GraphicalItems() if isinstance(g,p.PCB_SHAPE) and g.GetLayer()==(p.B_Fab if f.IsFlipped() else p.F_Fab)]
 if shapes:bodies.append((ref,f.IsFlipped(),[min(v[0] for v in shapes),min(v[1] for v in shapes),max(v[2] for v in shapes),max(v[3] for v in shapes)]))
for ref,f in fps.items():
 assert f.Reference().IsVisible(),ref
 assert f.Reference().GetTextSize().y==p.FromMM(.45 if ref=='C13' else .55),ref
 assert f.Reference().GetTextThickness()==p.FromMM(.10),ref
 a=bounds(f.Reference().GetEffectiveTextShape().BBox())
 for other,side,c in bodies:
  assert side!=f.IsFlipped() or min(a[2],c[2])<=max(a[0],c[0]) or min(a[3],c[3])<=max(a[1],c[1]),('Reference/body overlap',ref,other)
 paths=[]
 for model in f.Models():
  filename=model.m_Filename.replace('${KIPRJMOD}',str(r))
  for version in [9,10]:filename=filename.replace('${KICAD'+str(version)+'_3DMODEL_DIR}',r'C:/Program Files/KiCad/10.0/share/kicad/3dmodels')
  asset=Path(filename);assert asset.is_file(),(ref,filename)
  paths.append({'path':model.m_Filename,'sha256':sha(asset)})
 assert bool(paths)==(not ref.startswith('TP')),ref
 model_inventory[ref]=paths
(r/'reports/model_inventory.json').write_text(json.dumps({'board_sha256':digest,'physical_positions_with_models':82,'test_pads_without_models':8,'models':model_inventory},indent=2)+'\n')
for item in json.loads((r/'lib/3d/model_manifest.json').read_text())['attachments']:
 assert sha(r/'lib/3d'/item['file'])==item['sha256'],item['reference']
connected=0
for ref,f in fps.items():
 assert f.GetValue()==parts[ref]['value'],ref
 for q in f.Pads():
  number=q.GetNumber()
  if not number:continue
  net=parts[ref]['pins'].get(number)
  if net is None:assert q.GetNetCode()==0 or q.GetNetname().startswith('unconnected-'),(ref,number,q.GetNetname())
  else:assert q.GetNetname()==net,(ref,number,q.GetNetname(),net);connected+=1
assert connected==253,connected
qfn=[q for q in fps['U1'].Pads() if q.GetNumber() and 1<=int(q.GetNumber())<=56]
lf=p.FootprintLoad(str(r/'lib/RAMS_JLC.pretty'),'ESP32-S3FH4R2_QFN56_EP5p7')
lp={q.GetNumber():q for q in lf.Pads() if q.GetNumber()}
for q in qfn:
 assert sorted([q.GetSize().x,q.GetSize().y])==[p.FromMM(.25),p.FromMM(.8)]
 assert q.GetSize()==lp[q.GetNumber()].GetSize()
 assert q.GetPosition()-fps['U1'].GetPosition()==lp[q.GetNumber()].GetPosition()
 assert q.GetLocalSolderPasteMargin()==p.FromMM(-.025)
 assert q.GetSolderMaskExpansion(p.F_Mask)==0
edges=[a for a in b.GetDrawings() if a.GetLayer()==p.Edge_Cuts]
points=[v for a in edges for v in [a.GetStart(),a.GetEnd()]]
size=[p.ToMM(max(getattr(v,k) for v in points)-min(getattr(v,k) for v in points)) for k in ['x','y']]
assert size==[42.,32.],size
bom=list(csv.DictReader((r/'docs/BOM_PROCUREMENT.csv').open(encoding='utf-8-sig',newline='')))
assert {a['References'] for a in bom}==set(fps)
assert sum(int(a['Qty_fit_initial']) for a in bom)==80
assert sum(int(a['Qty_fit_normal_use_after_qualification']) for a in bom)==82
geo=json.loads((r/'reports/final_geometry/geometry_audit.json').read_text())
assert geo['board_sha256']==digest
for key in ['antenna_foreign_tracks_or_vias','antenna_foreign_pads','antenna_zone_fill_intersections','via_drill_paste_only_intersections','unexplained_reference_gap_samples','USB_reference_foreign_tracks','In1_track_segments']:
 assert not geo[key],key
assert len(geo['via_drill_smd_land_intersections'])==9
assert all(a['pad']=='U1.57' for a in geo['via_drill_smd_land_intersections'])
assert geo['GND_filled_outline_counts']['In1.Cu']==1
assert json.loads((r/'reports/power_paths_final.json').read_text())['board_sha256']==digest
previews=json.loads((r/'previews/final/source.json').read_text());assert previews['board_sha256']==digest
drc=json.loads((r/'reports/final_drc.json').read_text());erc=json.loads((r/'reports/final_erc.json').read_text())
assert all(not drc[k] for k in ['violations','unconnected_items','schematic_parity','ignored_checks'])
assert not erc['ignored_checks'] and all(not s['violations'] for s in erc['sheets'])
pro=json.loads((r/'RAMS_JLC_S3.kicad_pro').read_text())
assert not pro['board']['design_settings']['drc_exclusions']
assert 'ignore' not in pro['board']['design_settings']['rule_severities'].values()
firmware=json.loads((r/'reports/firmware_j2/build_summary.json').read_text())
for name,hashval in firmware['source_hashes'].items():assert sha(repo/name)==hashval,name
assert firmware['sources_unchanged']
original=[]
for item in json.loads((r/'verification/baseline/source_hashes.json').read_text()):
 if item['path'].startswith('hardware/KiCAD Files/Antigravity Build/RAMS - PCB/'):
  assert sha(repo/item['path'])==item['sha256'],item['path'];original.append(item)
files=[*r.glob('*.kicad_pcb'),*r.glob('*.kicad_sch'),r/'RAMS_JLC_S3.kicad_pro',r/'RAMS_JLC_S3.kicad_dru',r/'circuit_spec.json',r/'schematic_manifest.json',r/'learning_layout.json',r/'fp-lib-table',r/'sym-lib-table',*[f for f in (r/'lib').rglob('*') if f.is_file()]]
reports=[r/'reports'/n for n in ['final_drc.json','final_erc.json','FINAL_VALIDATION.md','power_paths_final.json','final_geometry/geometry_audit.json','firmware_j2/build_summary.json','readability_validation.json','model_inventory.json','silkscreen_final_plan.json']]
manifest={'date':'2026-11-13','kicad':p.GetBuildVersion(),'status':'CAD passed with owner-approved small legend; manufacturing and physical gates open','source_sha256':{str(f.relative_to(r)).replace('\\','/'):sha(f) for f in sorted(files)},'report_sha256':{str(f.relative_to(r)).replace('\\','/'):sha(f) for f in reports},'original_reference_unchanged':original,'board_checks':{'connected_pad_occurrences':connected,'outline_mm':size,'QFN_perimeter_pads':len(qfn),'initial_fitted':80,'normal_fitted':82,'visible_references':90,'legend_height_stroke_mm':[.55,.10],'C13_height_mm':.45,'physical_positions_with_models':82},'firmware_source_sha256':firmware['source_hashes']}
assert sha(board)==digest
(r/'reports/final_validation_manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
old=r/'evidence/j2_parts_docs_manifest.json';preserve=r/'verification'/('docs_manifest_'+datetime.now().strftime('%Y%m%d_%H%M%S'));preserve.mkdir();shutil.copy2(old,preserve/old.name)
d=json.loads(old.read_text())
d['files']={name:sha(r/'docs'/name) for name in d['files']};d['refresh_note']='2026-11-13 presentation-only revision, unchanged circuit/copper and firmware; compact legend requires print qualification; physical gates remain open.'
old.write_text(json.dumps(d,indent=2)+'\n')
print('Final identity/invariant checks passed',digest,flush=True)
