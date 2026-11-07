import os
p = r"C:\Program Files\KiCad\10.0\share\kicad\symbols\power.kicad_sym"
with open(p, "r", encoding="utf-8", errors="ignore") as f:
    s = f.read()
idx = s.find('(symbol "PWR_FLAG"')
print(s[idx+800:idx+1600])
