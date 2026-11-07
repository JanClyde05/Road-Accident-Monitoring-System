import re

path1 = r"C:\Program Files\KiCad\10.0\share\kicad\footprints\RF_Antenna.pretty\Johanson_2450AT18x100.kicad_mod"
with open(path1, "r", encoding="utf-8") as f:
    text1 = f.read()
print("Johanson_2450AT18x100 pads:")
for line in text1.splitlines():
    if "(pad " in line:
        print(" ", line.strip())

path2 = r"C:\Program Files\KiCad\10.0\share\kicad\footprints\RF_Antenna.pretty\Johanson_2450AT18x100_2400-2500Mhz.kicad_mod"
with open(path2, "r", encoding="utf-8") as f:
    text2 = f.read()
print("\nJohanson_2450AT18x100_2400-2500Mhz pads:")
for line in text2.splitlines():
    if "(pad " in line:
        print(" ", line.strip())
