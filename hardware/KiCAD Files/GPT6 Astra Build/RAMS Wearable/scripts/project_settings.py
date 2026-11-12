"""Explicit active JLCPCB settings; no inherited DRC exclusions."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
reference=ROOT.parents[1]/'Antigravity Build/RAMS - PCB/RAMS - PCB.kicad_pro'
project=json.loads(reference.read_text())
settings=project['board']['design_settings']
settings['drc_exclusions']=[]
for key,val in settings.get('rule_severities',{}).items():
    if val=='ignore': settings['rule_severities'][key]='warning'
settings['rules'].update(min_clearance=.15,min_track_width=.15,min_via_diameter=.45,
    min_via_drill=.2,min_through_hole_diameter=.2,min_copper_edge_clearance=.25,
    min_hole_clearance=.25,min_hole_to_hole=.25,min_via_annular_width=.1,
    min_silk_clearance=.15,min_text_height=1.0,min_text_thickness=.15)
settings['track_widths']=[.15,.18,.2,.25,.35,.5,.7]
settings['via_dimensions']=[{'diameter':.45,'drill':.2},{'diameter':.6,'drill':.3}]
settings['diff_pair_dimensions']=[{'width':.15,'gap':.15,'via_gap':.25}]
project['net_settings']={'meta':{'version':4},'classes':[{
    'name':'Default','clearance':.15,'track_width':.15,'via_diameter':.5,'via_drill':.2,
    'microvia_diameter':.3,'microvia_drill':.1,'diff_pair_width':.15,'diff_pair_gap':.15,
    'diff_pair_via_gap':.25,'bus_width':12,'wire_width':6,'line_style':0,
    'pcb_color':'rgba(0, 0, 0, 0.000)','schematic_color':'rgba(0, 0, 0, 0.000)'}],
    'net_colors':None,'netclass_assignments':None,'netclass_patterns':[]}
power=dict(project['net_settings']['classes'][0],name='Power',track_width=.25,via_diameter=.6,via_drill=.3)
project['net_settings']['classes'].append(power)
project['net_settings']['netclass_patterns']=[{'netclass':'Power','pattern':name} for name in ['+3V3','SYS_IN','B_PLUS','B_MINUS','VBUS','FET_DRAIN','LORA_VDD']]
project['meta']={'filename':'RAMS_JLC_S3.kicad_pro','version':1}
project['boards']=[];project['sheets']=[]
if 'erc' in project:
    project['erc']['erc_exclusions']=[]
    for key, value in project['erc'].get('rule_severities', {}).items():
        if value == 'ignore':
            project['erc']['rule_severities'][key] = 'warning'
(ROOT/'RAMS_JLC_S3.kicad_pro').write_text(json.dumps(project,indent=2)+'\n')
(ROOT/'RAMS_JLC_S3.kicad_dru').write_text('''(version 1)
# 4layer JLC04161H-3313; no blanket copper/connection exclusions.
(rule "Copper edge" (constraint edge_clearance (min 0.25mm)))
(rule "Dedicated L2 ground" (condition "A.Type == 'Track' && A.Layer == 'In1.Cu'") (constraint disallow track))
(rule "RF antenna corner" (condition "A.Type == 'Track' && A.insideArea('ANTENNA_NO_METAL') && A.NetName != 'ANT_FEED'") (constraint disallow track))
''')
print('Wrote project rules with no DRC exclusions; ignored categories promoted to warnings.')
