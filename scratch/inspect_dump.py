import xml.etree.ElementTree as ET

tree = ET.parse(r'C:\Users\Jan Clyde Talosig\.gemini\antigravity\brain\d276f060-999c-4c88-9da3-6e3566edb6c3\map_dump3.xml')
for n in tree.iter():
    t = n.attrib.get('text')
    cd = n.attrib.get('content-desc')
    if t or cd:
        print(f"text: '{t}' | desc: '{cd}' | bounds: {n.attrib.get('bounds')}")
