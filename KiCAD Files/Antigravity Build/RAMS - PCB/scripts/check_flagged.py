import re

with open(r'RAMS - PCB.kicad_sch', 'r', encoding='utf-8') as f:
    text = f.read()

# Find symbols for Q1, Q2, D1, D2, D3, U5, J1
symbols = text.split('(symbol\n')
for s in symbols[1:]:
    ref_m = re.search(r'\(property "Reference" "([^"]+)"', s)
    val_m = re.search(r'\(property "Value" "([^"]+)"', s)
    fp_m = re.search(r'\(property "Footprint" "([^"]+)"', s)
    if ref_m:
        ref = ref_m.group(1)
        if ref in ['Q1', 'Q2', 'D1', 'D2', 'D3', 'U5', 'J1', 'J2']:
            val = val_m.group(1) if val_m else ""
            fp = fp_m.group(1) if fp_m else ""
            pins = re.findall(r'\(pin "([^"]+)"', s)
            print(f"Ref {ref} ({val}) fp={fp} -> Pins in schematic: {pins}")
