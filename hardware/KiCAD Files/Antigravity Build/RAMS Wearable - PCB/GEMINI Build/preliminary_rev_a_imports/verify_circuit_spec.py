"""
Rev C circuit_spec.json self-check
Verifies internal consistency of the circuit specification.
"""
import json, sys
from collections import Counter

import os
spec_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "circuit_spec.json")

with open(spec_path, "r") as f:
    spec = json.load(f)

errors = []
warnings = []
components = spec["components"]
fw_map = spec["firmware_gpio_map"]
net_summary = spec["net_summary"]

# 1. Count components
print(f"Total components: {len(components)}")

# 2. Check firmware GPIO map against component pin assignments
print("\n--- Firmware GPIO cross-check ---")
for gpio, info in fw_map.items():
    expected_net = info["net"]
    found = False
    for ref, comp in components.items():
        for pad in comp["pads"]:
            if pad.get("net") == expected_net:
                found = True
                break
        if found:
            break
    status = "OK" if found else "MISSING"
    if not found:
        errors.append(f"Firmware {gpio} net {expected_net} not found in any component pad")
    print(f"  {gpio}: net={expected_net} function={info['function']} -> {status}")

# 3. Check all nets have at least 2 connections (except UNCONNECTED and RESERVED)
print("\n--- Net connectivity check ---")
net_counts = Counter()
for ref, comp in components.items():
    for pad in comp["pads"]:
        net = pad.get("net", "NONE")
        if net not in ("UNCONNECTED", "RESERVED_PSRAM", "NONE"):
            net_counts[net] += 1

for net, count in sorted(net_counts.items()):
    if count < 2:
        warnings.append(f"Net {net} has only {count} connection(s)")
        print(f"  WARNING: {net} has {count} connection(s)")

# 4. Check Q3 FS8205A pinout specifically
print("\n--- Q3 FS8205A verification ---")
q3 = components.get("Q3")
if q3:
    expected_q3 = {
        "1": "/B_MINUS",    # S1
        "2": "/Q3_DRAIN",   # D1
        "3": "/GND",        # S2
        "4": "/DW_OC",      # G2
        "5": "/Q3_DRAIN",   # D2
        "6": "/DW_OD"       # G1
    }
    for pad in q3["pads"]:
        pin = pad["pin"]
        actual = pad["net"]
        expected = expected_q3.get(pin, "???")
        status = "OK" if actual == expected else "MISMATCH"
        if status == "MISMATCH":
            errors.append(f"Q3 pin {pin}: expected {expected}, got {actual}")
        print(f"  Pin {pin} ({pad['function']}): {actual} -> {status}")

# 5. Check DW01A pinout
print("\n--- U4 DW01A verification ---")
u4 = components.get("U4")
if u4:
    expected_u4 = {
        "1": "/DW_OD",     # OD
        "2": "/DW_CS",     # CS
        "3": "/DW_OC",     # OC
        "4": "UNCONNECTED", # TD/NC
        "5": "/DW_VCC",    # VCC
        "6": "/B_MINUS"    # VSS
    }
    for pad in u4["pads"]:
        pin = pad["pin"]
        actual = pad["net"]
        expected = expected_u4.get(pin, "???")
        status = "OK" if actual == expected else "MISMATCH"
        if status == "MISMATCH":
            errors.append(f"U4 pin {pin}: expected {expected}, got {actual}")
        print(f"  Pin {pin} ({pad['function']}): {actual} -> {status}")

# 6. Check DW01A-to-Q3 gate connections
print("\n--- DW01A-to-Q3 gate wiring ---")
dw_od_connects = []
dw_oc_connects = []
for ref, comp in components.items():
    for pad in comp["pads"]:
        if pad.get("net") == "/DW_OD":
            dw_od_connects.append(f"{ref}.{pad['pin']}")
        if pad.get("net") == "/DW_OC":
            dw_oc_connects.append(f"{ref}.{pad['pin']}")
print(f"  /DW_OD (over-discharge gate): {dw_od_connects}")
print(f"  /DW_OC (over-charge gate): {dw_oc_connects}")
if "U4.1" not in dw_od_connects or "Q3.6" not in dw_od_connects:
    errors.append("DW01A OD (U4.1) must connect to Q3 G1 (Q3.6) via /DW_OD")
if "U4.3" not in dw_oc_connects or "Q3.4" not in dw_oc_connects:
    errors.append("DW01A OC (U4.3) must connect to Q3 G2 (Q3.4) via /DW_OC")

# 7. Check VDDA is powered (or handled by module)
print("\n--- VDDA power check ---")
vdda_connections = []
for ref, comp in components.items():
    for pad in comp["pads"]:
        if pad.get("net") == "/VDDA_PWR":
            vdda_connections.append(f"{ref}.{pad['pin']}")
print(f"  /VDDA_PWR connections: {vdda_connections}")
if len(vdda_connections) == 0:
    # WROOM-1 module handles VDDA internally - this is expected
    print("  (OK: WROOM-1 module connects VDDA internally. No external connection needed.)")
elif len(vdda_connections) < 2:
    errors.append("VDDA_PWR has insufficient connections -- must connect to +3V3 supply")

# 8. Check LED on GPIO48
print("\n--- LED GPIO48 check ---")
led_din_connections = []
for ref, comp in components.items():
    for pad in comp["pads"]:
        if pad.get("net") == "/LED_DIN":
            led_din_connections.append(f"{ref}.{pad['pin']}")
print(f"  /LED_DIN connections: {led_din_connections}")

# Summary
print(f"\n=== SUMMARY ===")
print(f"Errors: {len(errors)}")
for e in errors:
    print(f"  ERROR: {e}")
print(f"Warnings: {len(warnings)}")
for w in warnings:
    print(f"  WARNING: {w}")

if errors:
    sys.exit(1)
else:
    print("\nCircuit spec self-check PASSED")
