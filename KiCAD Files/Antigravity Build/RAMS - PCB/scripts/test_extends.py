import re

# Check other schematic files in the repo to see how KiCad embeds symbols in lib_symbols
import os
for root, dirs, files in os.walk(r"d:\Antigravity\Projects\Danger Monitoring System V2"):
    for f in files:
        if f.endswith('.kicad_sch') and 'RAMS - PCB' not in root:
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as sch:
                c = sch.read()
                exts = re.findall(r'\(symbol\s+"([^"]+)"\s+\(extends\s+"([^"]+)"\)', c)
                pins_in_ext = []
                for sym_name, ext_name in exts:
                    # check if sym_name has pins directly
                    idx = c.find(f'(symbol "{sym_name}"')
                    pins = '(pin ' in c[idx:idx+3000]
                    pins_in_ext.append((sym_name, ext_name, pins))
                if exts:
                    print(f"File {f}: {len(exts)} extends found:")
                    for s, e, has_p in pins_in_ext[:5]:
                        print(f"  {s} extends {e} (has pins: {has_p})")
                else:
                    print(f"File {f}: 0 extends found (all flattened!)")
