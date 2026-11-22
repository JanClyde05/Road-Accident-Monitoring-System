"""Small deterministic KiCad schematic writer; uses installed symbols, no dependencies.

Adapted from the original RAMS CleanSchematic's symbol/stub placement. Electrical
contents come only from the supplied reviewed spec, never from that old generator.
Run: python schematic_helpers.py circuit_spec.json PROJECT_NAME [output_directory]
"""
from __future__ import annotations

import copy
import json
import math
from pathlib import Path
import re
import sys
from uuid import NAMESPACE_URL, uuid5

SYMBOL_DIR = Path(r"C:\Program Files\KiCad\10.0\share\kicad\symbols")


class Quoted(str):
    """A quoted S-expression token; distinguished from an atom on serialization."""


def parse_sexpr(text):
    tokens = re.findall(r'"(?:\\.|[^"\\])*"|[^\s()]+|[()]', text)
    stack, root = [], None
    for token in tokens:
        if token == "(":
            node = []
            if stack:
                stack[-1].append(node)
            elif root is not None:
                raise ValueError("Multiple S-expression roots")
            else:
                root = node
            stack.append(node)
        elif token == ")":
            if not stack:
                raise ValueError("Unbalanced closing parenthesis")
            stack.pop()
        else:
            if not stack:
                raise ValueError("Token outside S-expression")
            if token.startswith('"'):
                # KiCad escapes quote/backslash/newline; preserve other sequences.
                token = Quoted(re.sub(r'\\([\\"nrt])', lambda m: {
                    "n": "\n", "r": "\r", "t": "\t"}.get(m[1], m[1]), token[1:-1]))
            stack[-1].append(token)
    if stack or root is None:
        raise ValueError("Incomplete S-expression")
    return root


def quote(text):
    return json.dumps(str(text), ensure_ascii=False)


def sexpr(node):
    if isinstance(node, list):
        return "(" + " ".join(sexpr(item) for item in node) + ")"
    return quote(node) if isinstance(node, Quoted) else str(node)


def children(node, tag):
    return [x for x in node if isinstance(x, list) and x and x[0] == tag]


def child(node, tag):
    found = children(node, tag)
    if len(found) != 1:
        raise ValueError(f"Expected one {tag}, found {len(found)}")
    return found[0]


def _key(node):
    if node[0] == "property":
        return node[0], node[1]
    if node[0] == "symbol":
        return node[0], node[1].rsplit("_", 2)[1:][0], node[1].rsplit("_", 2)[-1]
    return node[0],


class SymbolLibrary:
    def __init__(self, paths=None, base_dir=None, pin_font=0.8):
        self.paths = paths or {}
        self.base_dir = Path(base_dir or ".")
        self.pin_font = pin_font
        self.libraries, self.cache = {}, {}

    def _library(self, nickname):
        if nickname not in self.libraries:
            path = Path(self.paths.get(nickname, SYMBOL_DIR / f"{nickname}.kicad_sym"))
            if not path.is_absolute():
                path = self.base_dir / path
            tree = parse_sexpr(path.read_text(encoding="utf-8-sig"))
            self.libraries[nickname] = {s[1]: s for s in children(tree, "symbol")}
        return self.libraries[nickname]

    def _flatten(self, nickname, name, active=()):
        if name in active:
            raise ValueError(f"Cyclic symbol inheritance: {active}, {name}")
        library = self._library(nickname)
        if name not in library:
            raise ValueError(f"Missing symbol: {nickname}:{name}")
        own = copy.deepcopy(library[name])
        extends = children(own, "extends")
        if not extends:
            return own
        parent_name = extends[0][1]
        parent = self._flatten(nickname, parent_name, active + (name,))
        replacements = {_key(x): x for x in own[2:] if isinstance(x, list) and x[0] != "extends"}
        inherited = []
        for node in parent[2:]:
            if not isinstance(node, list):
                continue
            replacement = replacements.pop(_key(node), None)
            selected = replacement if replacement is not None else node
            if selected[0] == "symbol":
                selected[1] = Quoted(name + "_" + "_".join(selected[1].rsplit("_", 2)[1:]))
            inherited.append(selected)
        return ["symbol", Quoted(name), *inherited, *replacements.values()]

    def load(self, lib_id, unit=1):
        if (lib_id, unit) in self.cache:
            return self.cache[lib_id, unit]
        nickname, name = lib_id.split(":", 1)
        symbol = self._flatten(nickname, name)
        pins = []
        for part in children(symbol, "symbol"):
            _, unit_id, style = part[1].rsplit("_", 2)
            if int(unit_id) not in (0, unit) or int(style) not in (0, 1):
                continue
            for pin in children(part, "pin"):
                at = child(pin, "at")
                pins.append({"number": str(child(pin, "number")[1]),
                             "name": str(child(pin, "name")[1]),
                             "x": float(at[1]), "y": float(at[2]),
                             "angle": float(at[3]), "type": pin[1]})
                for label in (child(pin, "number"), child(pin, "name")):
                    effects = child(label, "effects")
                    size = child(child(effects, "font"), "size")
                    size[1:] = [str(self.pin_font), str(self.pin_font)]
        if not pins:
            raise ValueError(f"No pins in {lib_id}, unit {unit}")
        symbol[1] = Quoted(lib_id)
        self.cache[lib_id, unit] = symbol, pins
        return symbol, pins


def _num(n):
    return f"{n:.4f}".rstrip("0").rstrip(".") if n else "0"


def _point(x, y, px, py, angle):
    rad = math.radians(angle)
    return (round(x + px * math.cos(rad) - py * math.sin(rad), 4),
            round(y - px * math.sin(rad) - py * math.cos(rad), 4))


def _effects(size=0.8, justify=None):
    return f'(effects (font (size {size} {size})){" (justify " + justify + ")" if justify else ""})'


def _property(name, value, x, y, hidden=False, justify="left", size=0.8, angle=0):
    return (f'(property {quote(name)} {quote(value)} (at {_num(x)} {_num(y)} {_num(angle)})'
            f'{" (hide yes)" if hidden else ""} {_effects(size, justify)})')


def _component(component, pins, uid, project_name, sheet_path, wire_length, font=0.8):
    ref, lib_id = component["ref"], component["lib_id"]
    x, y, rotation = (float(component[k]) for k in ("x", "y", "rotation"))
    connections = {str(k): v for k, v in component["pins"].items()}
    numbers = {pin["number"] for pin in pins}
    if set(connections) != numbers:
        raise ValueError(f'{ref} pin map: missing={numbers-set(connections)}, unknown={set(connections)-numbers}')
    placed = [_point(x, y, p["x"], p["y"], rotation) for p in pins]
    minimum_y, maximum_y = min(p[1] for p in placed), max(p[1] for p in placed)
    minimum_x = min(p[0] for p in placed)
    passive = len(pins) == 2 and lib_id.startswith(("Device:", "Diode:"))
    ref_x, ref_y, val_x, val_y = minimum_x, minimum_y - 2.54, minimum_x, maximum_y + 2.54
    if passive and rotation % 180 == 0:
        ref_x, ref_y, val_x, val_y = x + 2.54, y - 1.27, x + 2.54, y + 1.27
    elif passive:
        ref_x, ref_y, val_x, val_y = x, y - 2.54, x, y + 2.54
    is_power = ref.startswith("#")
    in_bom = "no" if is_power else "yes"
    identifier = uid(f"component:{ref}")
    lines = [f'(symbol (lib_id {quote(lib_id)}) (at {_num(x)} {_num(y)} {_num(rotation)})',
             f'(unit {component.get("unit", 1)}) (exclude_from_sim no) (in_bom {in_bom})',
             f'(on_board {in_bom}) (dnp {"yes" if component.get("dnp") else "no"}) (uuid {quote(identifier)})',
             _property("Reference", ref, ref_x, ref_y, is_power, angle=rotation, size=font),
             _property("Value", component["value"], val_x, val_y, angle=rotation, size=font),
             _property("Footprint", component.get("footprint", ""), x, y, True),
             _property("Datasheet", component.get("datasheet", ""), x, y, True),
             _property("Description", component.get("description", ""), x, y, True)]
    lines.extend(_property(k, v, x, y, True) for k, v in component.get("properties", {}).items())
    lines.extend(f'(pin {quote(n)} (uuid {quote(uid(f"pin:{ref}:{n}"))}))' for n in sorted(numbers))
    lines += [f'(instances (project {quote(project_name)} (path {quote(sheet_path)} (reference {quote(ref)}) (unit {component.get("unit", 1)}))))', ")"]
    seen = set()
    for pin in pins:
        net = connections[pin["number"]]
        px, py = _point(x, y, pin["x"], pin["y"], rotation)
        if (px, py, net) in seen:
            continue
        seen.add((px, py, net))
        key = f'{ref}:{pin["number"]}'
        if net is None or net in ("", "NC"):
            lines.append(f'(no_connect (at {_num(px)} {_num(py)}) (uuid {quote(uid("nc:"+key))}))')
            continue
        away = (pin["angle"] + rotation + 180) % 360
        rad = math.radians(away)
        length = float(component.get("wire_length", wire_length))
        ex, ey = px + length * math.cos(rad), py - length * math.sin(rad)
        label_angle = int(away)
        lines.append(f'(wire (pts (xy {_num(px)} {_num(py)}) (xy {_num(ex)} {_num(ey)})) (stroke (width 0) (type default)) (uuid {quote(uid("wire:"+key))}))')
        # Global-label text extends away from the symbol, beyond the stub endpoint.
        justification = "left" if label_angle in (0, 90) else "right"
        lines.append(f'(global_label {quote(net)} (shape bidirectional) (at {_num(ex)} {_num(ey)} {label_angle}) {_effects(font, justification)} (uuid {quote(uid("label:"+key))}))')
    return "\n".join(lines), identifier


def write_schematics(spec, output_dir, project_name):
    """Write root plus A3 sheets; return a ref->UUID/path mapping for PCB parity.

    All component pins must be listed. null, empty string and NC mean explicit NC.
    Spec may use flat components with a sheet key, or sheet-local components.
    Relative symbol_libraries paths resolve against output_dir.
    """
    output_dir = Path(output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    positions_path = output_dir / "schematic_positions.json"
    positions = json.loads(positions_path.read_text(encoding="utf-8-sig")) if positions_path.exists() else {}
    namespace = uuid5(NAMESPACE_URL, "rams-kicad:" + project_name)
    uid = lambda name: str(uuid5(namespace, name))
    root_uuid = uid("root")
    library = SymbolLibrary(spec.get("symbol_libraries"), output_dir, positions.get("pin_font", spec.get("pin_font", 0.8)))
    sheets = copy.deepcopy(spec["sheets"])
    if isinstance(sheets, dict):
        sheets = [dict(value, id=key) if isinstance(value, dict) else {"id": key, "title": value} for key, value in sheets.items()]
    for sheet in sheets:
        sheet.update(positions.get("sheets", {}).get(sheet["id"], {}))
    flat = spec.get("components", [])
    if isinstance(flat, dict):
        flat = [dict(value, ref=key) for key, value in flat.items()]
    sheet_ids = {sheet["id"] for sheet in sheets}
    if len(sheet_ids) != len(sheets):
        raise ValueError("Duplicate sheet IDs")
    if any(c["sheet"] not in sheet_ids for c in flat):
        raise ValueError("Component assigned to nonexistent sheet")
    manifest, outputs = {}, {}

    def header(uuid, title):
        return [f'(kicad_sch (version 20250114) (generator "eeschema") (uuid {quote(uuid)}) (paper "A3")',
                f'(title_block (title {quote(title)}) (date {quote(spec.get("date", "2026-11-08"))}) (rev {quote(positions.get("revision", spec.get("revision", "A")))}) (company "RAMS"))']

    root = header(root_uuid, spec.get("title", project_name))
    root.append('(lib_symbols)')
    root.append(f'(text {quote(spec.get("title", project_name))} (at 30 30 0) {_effects(2, "left")} (uuid {quote(uid("root-title"))}))')
    root.append(f'(text "Engineering review: confirm BOM, assembly and bring-up gates before fabrication release." (at 30 40 0) {_effects(1.2, "left")} (uuid {quote(uid("root-note"))}))')
    for index, sheet in enumerate(sheets):
        sheet_id = sheet["id"]
        if not re.fullmatch(r"[A-Za-z0-9_-]+", sheet_id):
            raise ValueError("Use filename-safe sheet IDs")
        sheet_uuid = uid("sheet:" + sheet_id)
        sheet_path = "/" + root_uuid + "/" + sheet_uuid
        filename = f"{project_name}_{sheet_id}.kicad_sch"
        components = sheet.get("components", []) + [c for c in flat if c["sheet"] == sheet_id]
        page = header(uid("file:" + sheet_id), sheet.get("title", sheet_id))
        embedded, items = {}, []
        for component in components:
            component = dict(component)
            component.update(positions.get("components", {}).get(component["ref"], {}))
            component.setdefault("rotation", 0)
            # Schematic positions carry no mechanical meaning; keep endpoints on ERC's grid.
            for axis in ("x", "y"):
                component[axis] = round(round(float(component[axis]) / 1.27) * 1.27, 4)
            ref = component["ref"]
            if ref in manifest:
                raise ValueError(f"Duplicate reference: {ref}")
            symbol, pins = library.load(component["lib_id"], component.get("unit", 1))
            embedded[component["lib_id"]] = symbol
            item, identifier = _component(component, pins, uid, project_name, sheet_path, spec.get("wire_length", 3.81), positions.get("field_font", 0.8))
            items.append(item)
            manifest[ref] = {"uuid": identifier, "path": "/" + sheet_uuid + "/" + identifier,
                             "instance_path": sheet_path + "/" + identifier,
                             "sheet_path": sheet_path, "sheet": sheet_id, "lib_id": component["lib_id"]}
        page.append("(lib_symbols\n" + "\n".join(sexpr(embedded[k]) for k in sorted(embedded)) + "\n)")
        title = sheet.get("title", sheet_id)
        page.append(f'(text {quote(title)} (at 20 16 0) {_effects(2, "left")} (uuid {quote(uid("title:"+sheet_id))}))')
        for note_index, note in enumerate(sheet.get("notes", [])):
            page.append(f'(text {quote(note["text"])} (at {note["x"]} {note["y"]} 0) {_effects(note.get("size", 1), "left")} (uuid {quote(uid(f"note:{sheet_id}:{note_index}"))}))')
        page.extend(items)
        page.append('(embedded_fonts no)\n)')
        outputs[filename] = "\n".join(page) + "\n"
        sx, sy = 30 + index * 120, 65
        root.append(f'(sheet (at {sx} {sy}) (size 95 35) (stroke (width 0) (type default)) (fill (color 0 0 0 0)) (uuid {quote(sheet_uuid)})\n'
                    + _property("Sheetname", title, sx, sy-2) + "\n"
                    + _property("Sheetfile", filename, sx, sy+37) + "\n"
                    + f'(instances (project {quote(project_name)} (path {quote("/"+root_uuid)} (page {quote(index+2)}))))\n)')
    root.append('(sheet_instances (path "/" (page "1")))\n(embedded_fonts no)\n)')
    outputs[project_name + ".kicad_sch"] = "\n".join(root) + "\n"
    # Validate every output before the first write, so a bad spec cannot partly replace CAD.
    for content in outputs.values():
        parse_sexpr(content)
    for filename, content in outputs.items():
        (output_dir / filename).write_text(content, encoding="utf-8")
    (output_dir / "schematic_manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return manifest


if __name__ == "__main__":
    if len(sys.argv) not in (3, 4):
        raise SystemExit("Usage: schematic_helpers.py SPEC.json PROJECT_NAME [OUTPUT_DIR]")
    spec_path = Path(sys.argv[1]).resolve()
    specification = json.loads(spec_path.read_text(encoding="utf-8-sig"))
    write_schematics(specification, sys.argv[3] if len(sys.argv) == 4 else spec_path.parent, sys.argv[2])
