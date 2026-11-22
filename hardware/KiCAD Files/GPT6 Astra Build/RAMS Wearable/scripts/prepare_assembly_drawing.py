"""Create a drawing-only copy with SW1's Fab label inside its own body."""
import hashlib,json
import pcbnew as p

def prepare(source,folder):
    folder.mkdir(exist_ok=True)
    digest=hashlib.sha256(source.read_bytes()).hexdigest()
    b=p.LoadBoard(str(source));f=b.FindFootprintByReference('SW1')
    texts=[g for g in f.GraphicalItems() if isinstance(g,p.PCB_TEXT) and g.GetLayer()==p.F_Fab and g.GetText()=='${REFERENCE}']
    assert len(texts)==1
    t=texts[0];t.SetPosition(f.GetPosition());t.SetTextAngle(p.EDA_ANGLE(0,p.DEGREES_T))
    t.SetTextSize(p.VECTOR2I(p.FromMM(.6),p.FromMM(.6)));t.SetTextThickness(p.FromMM(.1))
    target=folder/'ASSEMBLY_ONLY.kicad_pcb';p.SaveBoard(str(target),b)
    assert hashlib.sha256(source.read_bytes()).hexdigest()==digest
    (folder/'source.json').write_text(json.dumps({'source_board_sha256':digest,'derived_board_sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'only_change':'SW1 F.Fab ${REFERENCE} position/font/angle; no fabrication geometry or printed silkscreen changed','purpose':'PDF assembly/pad maps only; never use this board for fabrication'},indent=2)+'\n')
    return target
