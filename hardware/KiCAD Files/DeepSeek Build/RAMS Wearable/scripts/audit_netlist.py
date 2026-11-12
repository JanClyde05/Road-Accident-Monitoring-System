#!/usr/bin/env python3
"""Read-only netlist auditor for a KiCad 10 .kicad_pcb file.

Usage:
    python audit_netlist.py board.kicad_pcb U6 U1 R13 ...
    python audit_netlist.py board.kicad_pcb --nets VBAT_SENSE NEO_DIN

Prints pad -> net for the requested footprints, or all pads and copper items
on the requested nets. No file is modified.
"""
import re
import sys

PAD = re.compile(r'\(pad\s+"([^"]*)"')
NET = re.compile(r'\(net\s+(?:\d+\s+)?"([^"]*)"\)')


def footprints(text):
    """Yield (reference, chunk) for every top-level footprint block."""
    for m in re.finditer(r'\(footprint\s+"[^"]*"', text):
        depth, i = 0, m.start()
        while i < len(text):
            if text[i] == "(":
                depth += 1
            elif text[i] == ")":
                depth -= 1
                if depth == 0:
                    break
            i += 1
        chunk = text[m.start():i + 1]
        ref = re.search(r'\(property\s+"Reference"\s+"([^"]*)"', chunk)
        if ref:
            yield ref.group(1), chunk


def pad_map(chunk):
    """Return {pad_number: net_name} for one footprint chunk."""
    pads = {}
    for m in PAD.finditer(chunk):
        depth, j = 0, m.start()
        while j < len(chunk):
            if chunk[j] == "(":
                depth += 1
            elif chunk[j] == ")":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        net = NET.search(chunk[m.start():j + 1])
        if net and net.group(1):
            pads[m.group(1)] = net.group(1)
    return pads


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    text = open(sys.argv[1], encoding="utf-8").read()
    args = sys.argv[2:]
    board = {ref: pad_map(chunk) for ref, chunk in footprints(text)}

    if args[0] == "--nets":
        for net in args[1:]:
            pads = sorted((r, n) for r, d in board.items() for n, nn in d.items() if nn == net)
            print("-- %s: %d pads" % (net, len(pads)))
            for r, n in pads:
                print("   %s.%s" % (r, n))
        return 0

    for ref in args:
        pads = board.get(ref)
        if pads is None:
            print("%s: NOT FOUND" % ref)
            continue
        print("-- %s (%d connected pads)" % (ref, len(pads)))
        for num in sorted(pads, key=lambda s: (len(s), s)):
            print("   pad %-3s : %s" % (num, pads[num]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
