"""Focused regression checks for inheritance, deterministic paths and native loading."""
import json
from pathlib import Path
import subprocess
import tempfile
import xml.etree.ElementTree as ET

from schematic_helpers import SymbolLibrary, parse_sexpr, sexpr, write_schematics


def main():
    parsed = parse_sexpr('(root (value "quoted (text) \\\"ok\\\""))')
    assert parse_sexpr(sexpr(parsed)) == parsed
    base = Path(__file__).resolve().parent
    with tempfile.TemporaryDirectory(prefix="schematic_check_", dir=base) as name:
        folder = Path(name).resolve()
        assert folder.parent == base  # All temporary creation/cleanup stays in scripts.
        custom = '''(kicad_symbol_lib (version 20251024) (generator "kicad_symbol_editor")
        (symbol "Base" (property "Value" "Base" (at 0 0 0))
          (symbol "Base_1_1" (pin passive line (at 0 0 0) (length 2.54)
          (name "P" (effects (font (size 1 1)))) (number "1" (effects (font (size 1 1)))))))
        (symbol "Derived" (extends "Base") (property "Value" "Derived" (at 0 0 0))))'''
        (folder / "Check.kicad_sym").write_text(custom, encoding="utf-8")
        lib = SymbolLibrary({"Check": "Check.kicad_sym"}, folder)
        symbol, pins = lib.load("Check:Derived")
        assert pins[0]["number"] == "1" and "Derived_1_1" in sexpr(symbol)
        assert '(property "Value" "Derived"' in sexpr(symbol)
        spec = {"sheets": [{"id": "a", "title": "A"}, {"id": "b", "title": "B"}],
                "components": [{"lib_id": "Device:R", "ref": "R1", "value": "10k", "footprint": "Resistor_SMD:R_0603_1608Metric", "pins": {"1": "NET_A", "2": "GND"}, "sheet": "a", "x": 40, "y": 50},
                               {"lib_id": "Device:R", "ref": "R2", "value": "10k", "footprint": "Resistor_SMD:R_0603_1608Metric", "pins": {"1": "NET_A", "2": "GND"}, "sheet": "b", "x": 40, "y": 50, "rotation": 90}]}
        first = write_schematics(spec, folder, "Check")
        content = (folder / "Check_a.kicad_sch").read_bytes()
        assert write_schematics(spec, folder, "Check") == first
        assert content == (folder / "Check_a.kicad_sch").read_bytes()
        cli = Path(r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe")
        if cli.exists():
            result = subprocess.run([str(cli), "sch", "export", "netlist", "--format", "kicadxml", "--output", str(folder / "net.xml"), str(folder / "Check.kicad_sch")], text=True, capture_output=True)
            assert result.returncode == 0, result.stdout + result.stderr
            netlist = ET.parse(folder / "net.xml").getroot()
            expected = {("R1", "1"), ("R2", "1")}
            net_a = [n for n in netlist.findall("nets/net") if n.attrib["name"] == "NET_A"]
            assert len(net_a) == 1 and {(n.attrib["ref"], n.attrib["pin"]) for n in net_a[0]} == expected
            for component in netlist.findall("components/comp"):
                reference = component.attrib["ref"]
                path = component.find("sheetpath").attrib["tstamps"] + component.find("tstamps").text
                assert path == first[reference]["path"], (path, first[reference])
            result = subprocess.run([str(cli), "sch", "erc", "--format", "json", "--output", str(folder / "erc.json"), str(folder / "Check.kicad_sch")], text=True, capture_output=True)
            assert result.returncode == 0, result.stdout + result.stderr
            report = json.loads((folder / "erc.json").read_text())
            findings = [v for s in report.get("sheets", []) for v in s.get("violations", [])]
            print("Native ERC findings:", [(v.get("type"), v.get("severity")) for v in findings])
            assert not findings, findings
        spec["components"][0]["pins"].pop("1")
        try:
            write_schematics(spec, folder, "Check")
            assert False, "Missing pin must fail"
        except ValueError as e:
            assert "missing" in str(e)
        assert content == (folder / "Check_a.kicad_sch").read_bytes()
    print("PASS: inheritance, deterministic output, pin validation, cross-sheet nets, native netlist paths/ERC")


if __name__ == "__main__":
    main()
