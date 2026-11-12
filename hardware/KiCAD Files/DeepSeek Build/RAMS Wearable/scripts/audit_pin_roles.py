#!/usr/bin/env python3
"""Audit pin function and direction on the RAMS_JLC_S3 board.

Two checks:

1. ESP32-S3 role check. Every signal net on U1 must sit on a pin that has a
   GPIO function. Power, clock, flash-only and RF pins must not carry signals.
   Pin names come from the local symbol library, so the check follows the part.

2. Translator direction check on U6 (SN74LVC1T45, SOT-23-6). TI SCES515
   Table 4-1 for the DBV package: 1 VCCA, 2 GND, 3 A, 4 B, 5 DIR, 6 VCCB. So
   `B` (pad 4) is the output and must drive the data net, never a supply;
   `DIR` (pad 5) is an input and must be tied to a rail. ERC cannot see this
   class of error because both connections are electrically legal.

Usage:
    python audit_pin_roles.py RAMS_JLC_S3.kicad_pcb lib/RAMS_JLC.kicad_sym

Exit status is 1 when any violation is found, so it can gate a build.
"""
import re
import sys

# Signal-capable pin names. SPICLK_N and SPICLK_P are GPIO48 and GPIO47 on the
# QFN56 package (ESP32-S3 datasheet Table 2-1: pin 36 = GPIO48, pin 37 = GPIO47).
SIGNAL_PIN = re.compile(
    r"^(GPIO\d+(?:/[A-Za-z0-9_+-]+)?"
    r"|SPICLK_[NP]"
    r"|MTCK|MTDO|MTDI|MTMS|U0TXD|U0RXD"
    r"|XTAL_32K_[PN]|CHIP_PU)$"
)
POWER_NETS = {
    "GND", "+3V3", "VBUS", "SYS_IN", "B_PLUS", "B_MINUS", "VDD_RF", "VDD_SPI",
    "LORA_VDD", "LED_PWR", "CHG_IN", "RF_LNA", "RF_MATCH", "ANT_TUNE",
    "ANT_FEED", "XTAL_P", "XTAL_N", "XTAL_P_DRV",
}


def _balanced(text, start):
    depth, i = 0, start
    while i < len(text):
        if text[i] == "(":
            depth += 1
        elif text[i] == ")":
            depth -= 1
            if depth == 0:
                return text[start:i + 1]
        i += 1
    return text[start:]


def symbol_pins(path, symbol):
    """Return {pin_number: pin_name} for one symbol in a .kicad_sym file."""
    text = open(path, encoding="utf-8").read()
    start = text.find('(symbol "%s"' % symbol)
    if start < 0:
        raise SystemExit("symbol %s not found in %s" % (symbol, path))
    end = text.find('\n(symbol "', start + 10)
    body = text[start:end if end > 0 else len(text)]
    pairs = re.findall(
        r'\(pin\s+\w+\s+\w+\s+\(at[^)]*\)\s+\(length[^)]*\)\s*'
        r'\(name\s+"([^"]*)"[\s\S]*?\(number\s+"([^"]*)"',
        body,
    )
    return {num: name for name, num in pairs}


def board_pads(path, ref):
    """Return {pad_number: net_name} for one footprint reference."""
    text = open(path, encoding="utf-8").read()
    for m in re.finditer(r'\(footprint\s+"[^"]*"', text):
        chunk = _balanced(text, m.start())
        if ('(property "Reference" "%s"' % ref) not in chunk:
            continue
        pads = {}
        for pm in re.finditer(r'\(pad\s+"([^"]*)"', chunk):
            block = _balanced(chunk, pm.start())
            net = re.search(r'\(net\s+(?:\d+\s+)?"([^"]*)"\)', block)
            if net and net.group(1):
                pads[pm.group(1)] = net.group(1)
        return pads
    return {}


def check_signal_roles(pads, pins):
    bad = []
    for num, net in pads.items():
        name = pins.get(num, "?")
        if net in POWER_NETS or net.startswith("unconnected-"):
            continue
        if not SIGNAL_PIN.match(name):
            bad.append("pin %-3s %-12s <- %s" % (num, name, net))
    return bad


def check_translator(pads):
    """U6 SN74LVC1T45 DBV: B (pad 4) drives the data net, DIR (pad 5) is a rail."""
    bad = []
    b_net, dir_net = pads.get("4"), pads.get("5")
    if b_net is not None and b_net in POWER_NETS:
        bad.append("U6 pad 4 (B, the output) is on power net %s; it must drive the data net" % b_net)
    if dir_net is not None and dir_net not in POWER_NETS:
        bad.append("U6 pad 5 (DIR, an input) is on signal net %s; it must be tied to a rail" % dir_net)
    return bad


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    board, library = sys.argv[1], sys.argv[2]
    pins = symbol_pins(library, "ESP32-S3FH4R2")

    u1 = board_pads(board, "U1")
    print("U1: %d pads with nets, symbol defines %d pins" % (len(u1), len(pins)))
    problems = ["U1 " + p for p in check_signal_roles(u1, pins)]

    u6 = board_pads(board, "U6")
    if u6:
        print("U6: %s" % ", ".join("%s=%s" % (k, u6[k]) for k in sorted(u6)))
        problems += check_translator(u6)

    if not problems:
        print("OK: pin functions and translator direction are consistent")
        return 0
    print("VIOLATIONS:")
    for p in problems:
        print("   " + p)
    return 1


if __name__ == "__main__":
    sys.exit(main())
