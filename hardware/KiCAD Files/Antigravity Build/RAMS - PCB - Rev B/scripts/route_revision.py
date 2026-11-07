"""Route the changed connections with the already installed Freerouting tool."""
from pathlib import Path
import subprocess,sys,xml.etree.ElementTree as ET
import pcbnew as k
ROOT=Path(__file__).resolve().parents[1]
BOARD=ROOT/'RAMS - PCB.kicad_pcb'
REVIEW=ROOT/'review'
JAVA=Path(r'C:\Program Files\Java\jdk-25.0.4\bin\java.exe')
JAR=Path(r'C:\Users\Jan Clyde Talosig\Documents\KiCad\10.0\3rdparty\plugins\app_freerouting_kicad-plugin\jar\freerouting-2.4.1.jar')
b=k.LoadBoard(str(BOARD))
# Normalize NC net names from the actual generated schematic, not stale cached names.
for n in ET.parse(REVIEW/'schematic.xml').findall('./nets/net'):
    name=n.get('name');ni=b.FindNet(name)
    if not ni:ni=k.NETINFO_ITEM(b,name);b.Add(ni)
    for node in n.findall('node'):
        fp=b.FindFootprintByReference(node.get('ref'))
        if fp:
            for p in fp.Pads():
                if p.GetNumber()==node.get('pin'):p.SetNet(ni)
if '--prepare' in sys.argv:
    # Reroute the power rail around the new thermal via array and nearby VDDA capacitors.
    for t in list(b.GetTracks()):
        if t.GetNetname()=='/+3V3':b.Delete(t)
    # Routing uses all required ground pins, then zone fill is restored independently.
    for z in b.Zones():
        if not z.GetIsRuleArea():z.UnFill()
    k.SaveBoard(str(BOARD),b)
    assert k.ExportSpecctraDSN(b,str(REVIEW/'revision.dsn'))
    print('DSN exported',flush=True)
if '--route' in sys.argv:
    with (REVIEW/'router.log').open('w',encoding='utf-8') as log:
        result=subprocess.run([str(JAVA),'-Dgui.enabled=false','-Djava.awt.headless=true','-jar',str(JAR),
            '-de',str(REVIEW/'revision.dsn'),'-do',str(REVIEW/'revision.ses'),'-mp','15','-mt','1','-us','Hybrid'],stdout=log,stderr=subprocess.STDOUT)
    print('Router exit:',result.returncode,flush=True)
    assert (REVIEW/'revision.ses').exists(), 'Router did not write session'
if '--import' in sys.argv:
    assert k.ImportSpecctraSES(b,str(REVIEW/'revision.ses'))
    k.ZONE_FILLER(b).Fill(b.Zones())
    k.SaveBoard(str(BOARD),b)
    print('Routed board saved',flush=True)
