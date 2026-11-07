with open(r"C:\Program Files\KiCad\10.0\share\kicad\symbols\MCU_Espressif.kicad_sym", 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('(symbol "ESP32-S3_')
print("Snippet:")
print(text[idx:idx+1000])
