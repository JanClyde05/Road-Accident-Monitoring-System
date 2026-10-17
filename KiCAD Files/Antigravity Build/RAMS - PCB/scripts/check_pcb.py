import re
with open(r'RAMS - PCB.kicad_pcb', 'r', encoding='utf-8') as f:
    text = f.read()

fps = re.findall(r'\(footprint\s+"([^"]+)"', text)
print(f"Total footprints on PCB: {len(fps)}")

refs = re.findall(r'\(property\s+"Reference"\s+"([^"]+)"', text)
if not refs:
    refs = re.findall(r'\(fp_text\s+reference\s+"([^"]+)"', text)
print(f"Total references: {len(refs)}")
print("Refs sample:", refs[:30])

nets = re.findall(r'\(net\s+\d+\s+"([^"]+)"\)', text)
print(f"Total nets on PCB: {len(nets)}")
