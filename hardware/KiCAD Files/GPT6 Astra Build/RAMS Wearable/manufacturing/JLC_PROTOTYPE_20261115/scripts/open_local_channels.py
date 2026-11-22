"""Remove two noncritical detours that cage unrouted endpoints; preserve backup."""
from pathlib import Path
from datetime import datetime
import json,shutil
import pcbnew as p
ROOT=Path(__file__).resolve().parents[1];target=ROOT/'RAMS_JLC_S3.kicad_pcb'
run=ROOT/'verification'/('local_channels_'+datetime.now().strftime('%Y%m%d_%H%M%S'));run.mkdir()
shutil.copy2(target,run/target.name);b=p.LoadBoard(str(target));removed=[]
# R11's input detours around its unconnected output. DW_CS cages U4 VCC.
# Route the formerly caged destinations first, then reconnect these inputs.
for t in list(b.GetTracks()):
 if t.GetNetname() in ['LORA_SCK','DW_CS']:
  removed.append({'id':t.m_Uuid.AsString(),'net':t.GetNetname()});b.Remove(t)
p.SaveBoard(str(target),b);(run/'removed.json').write_text(json.dumps(removed,indent=2)+'\n')
print(run,len(removed),'items removed')
