#!/usr/bin/env python3
"""
RAMS Standalone Phone Number QR Code Generator
===============================================
Zero-external-dependency script (pure Python standard library).
Extracts contact numbers from incidents.json and registrations.json,
generates SVG QR codes with "tel:<phone>" URIs for instant 1-tap dialing
by emergency responders, and compiles an emergency rescuer card directory HTML.
"""

import os
import sys
import json
import re

# Galois field tables for GF(256) with primitive polynomial 0x11D (285)
GF_EXP = [0] * 512
GF_LOG = [0] * 256
x = 1
for i in range(255):
    GF_EXP[i] = x
    GF_EXP[i + 255] = x
    GF_LOG[x] = i
    x <<= 1
    if x & 0x100:
        x ^= 0x11D

def gf_mul(x, y):
    if x == 0 or y == 0:
        return 0
    return GF_EXP[GF_LOG[x] + GF_LOG[y]]

def rs_generator_poly(ec_len):
    g = [1]
    for i in range(ec_len):
        ng = [0] * (len(g) + 1)
        factor = GF_EXP[i]
        for j in range(len(g)):
            ng[j] ^= gf_mul(g[j], factor)
            ng[j + 1] ^= g[j]
        g = ng
    return g

def rs_encode(data_bytes, ec_len):
    gen = rs_generator_poly(ec_len)
    res = [0] * (len(data_bytes) + ec_len)
    for i in range(len(data_bytes)):
        res[i] = data_bytes[i]
    for i in range(len(data_bytes)):
        coef = res[i]
        if coef != 0:
            for j in range(len(gen)):
                res[i + j] ^= gf_mul(gen[j], coef)
    return res[len(data_bytes):]

# QR Version 1 (21x21) capacity: 17 data codewords (ECC Level M = 10 EC codewords, total 26)
# QR Version 2 (25x25) capacity: 32 data codewords (ECC Level M = 16 EC codewords, total 44)
# QR Version 3 (29x29) capacity: 53 data codewords (ECC Level M = 26 EC codewords, total 70)

def generate_qr_matrix(text):
    """Encodes ASCII text into a 2D boolean matrix (True = black, False = white)."""
    text_bytes = text.encode('utf-8')
    data_len = len(text_bytes)
    
    if data_len <= 14:
        version = 1
        size = 21
        total_data_codewords = 16
        ec_codewords = 10
    elif data_len <= 26:
        version = 2
        size = 25
        total_data_codewords = 28
        ec_codewords = 16
    else:
        version = 3
        size = 29
        total_data_codewords = 44
        ec_codewords = 26

    # 1. Byte mode data packaging: Mode indicator 0100 (4 bits) + Character count (8 bits)
    bits = "0100" + f"{data_len:08b}"
    for b in text_bytes:
        bits += f"{b:08b}"
    
    # Terminator (up to 4 zeroes)
    max_bits = total_data_codewords * 8
    bits += "0" * min(4, max(0, max_bits - len(bits)))
    
    # Pad to byte boundary
    if len(bits) % 8 != 0:
        bits += "0" * (8 - (len(bits) % 8))
        
    # Pad bytes alternating 11101100 (236) and 00010001 (17)
    pad_bytes = ["11101100", "00010001"]
    p_idx = 0
    while len(bits) < max_bits:
        bits += pad_bytes[p_idx % 2]
        p_idx += 1

    data_codewords = [int(bits[i:i+8], 2) for i in range(0, len(bits), 8)]
    ec_bytes = rs_encode(data_codewords, ec_codewords)
    final_codewords = data_codewords + ec_bytes

    # 2. Build grid
    grid = [[None] * size for _ in range(size)]
    is_reserved = [[False] * size for _ in range(size)]

    def set_pattern(r_start, c_start, pattern):
        for r, row in enumerate(pattern):
            for c, val in enumerate(row):
                grid[r_start + r][c_start + c] = val
                is_reserved[r_start + r][c_start + c] = True

    # Finder patterns
    finder = [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1],
    ]
    set_pattern(0, 0, finder)
    set_pattern(0, size - 7, finder)
    set_pattern(size - 7, 0, finder)

    # Separators
    for i in range(8):
        for (r, c) in [(7, i), (i, 7), (7, size - 1 - i), (i, size - 8), (size - 8, i), (size - 1 - i, 7)]:
            if 0 <= r < size and 0 <= c < size:
                grid[r][c] = 0
                is_reserved[r][c] = True

    # Alignment pattern for V2 (row 18, col 18) and V3 (row 22, col 22)
    if version == 2:
        align = [
            [1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1]
        ]
        set_pattern(16, 16, align)
    elif version == 3:
        align = [
            [1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1]
        ]
        set_pattern(20, 20, align)

    # Timing patterns
    for i in range(8, size - 8):
        val = 1 if i % 2 == 0 else 0
        grid[6][i] = val
        is_reserved[6][i] = True
        grid[i][6] = val
        is_reserved[i][6] = True

    # Dark module
    grid[4 * version + 9][8] = 1
    is_reserved[4 * version + 9][8] = True

    # Reserve format info areas
    for i in range(9):
        if not is_reserved[8][i]: is_reserved[8][i] = True
        if not is_reserved[i][8]: is_reserved[i][8] = True
    for i in range(8):
        if not is_reserved[8][size - 1 - i]: is_reserved[8][size - 1 - i] = True
        if not is_reserved[size - 1 - i][8]: is_reserved[size - 1 - i][8] = True

    # Place data bits
    codeword_bits = ""
    for cw in final_codewords:
        codeword_bits += f"{cw:08b}"

    bit_idx = 0
    row = size - 1
    col = size - 1
    direction = -1  # up

    while col > 0:
        if col == 6:  # Skip vertical timing pattern column
            col -= 1
        for _ in range(size):
            for c_off in (0, -1):
                c = col + c_off
                r = row
                if not is_reserved[r][c]:
                    b = int(codeword_bits[bit_idx]) if bit_idx < len(codeword_bits) else 0
                    bit_idx += 1
                    # Apply Mask 0: (r + c) % 2 == 0
                    if (r + c) % 2 == 0:
                        b ^= 1
                    grid[r][c] = b
            row += direction
        row -= direction
        direction = -direction
        col -= 2

    # Format info for ECC M (00) + Mask 0 (000) = 00000 -> BCH encoded with mask 101010000010010 = 101010000010010
    format_bits = "101010000010010"
    for i in range(6):
        grid[8][i] = int(format_bits[i])
    grid[8][7] = int(format_bits[6])
    grid[8][8] = int(format_bits[7])
    grid[7][8] = int(format_bits[8])
    for i in range(9, 15):
        grid[14 - i][8] = int(format_bits[i])

    for i in range(8):
        grid[8][size - 1 - i] = int(format_bits[i])
    for i in range(8, 15):
        grid[size - 15 + i][8] = int(format_bits[i])

    return grid

def matrix_to_svg(matrix, box_size=8, border=4):
    """Converts a QR matrix to a crisp vector SVG string."""
    size = len(matrix)
    total_size = (size + 2 * border) * box_size
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_size} {total_size}" width="{total_size}" height="{total_size}">',
        f'<rect width="{total_size}" height="{total_size}" fill="#ffffff"/>'
    ]
    for r, row in enumerate(matrix):
        for c, val in enumerate(row):
            if val:
                x = (c + border) * box_size
                y = (r + border) * box_size
                svg.append(f'<rect x="{x}" y="{y}" width="{box_size}" height="{box_size}" fill="#111827"/>')
    svg.append('</svg>')
    return '\n'.join(svg)

def sanitize_phone(phone_str):
    """Strips whitespace and ensures format for dialing."""
    if not phone_str:
        return ""
    clean = re.sub(r'[^\d+]', '', phone_str.strip())
    return clean

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    desktop_app_dir = os.path.dirname(script_dir)
    www_dir = os.path.join(desktop_app_dir, "www")
    qr_dir = os.path.join(www_dir, "qrcodes")
    os.makedirs(qr_dir, exist_ok=True)

    registrations_path = os.path.join(desktop_app_dir, "registrations.json")
    incidents_path = os.path.join(desktop_app_dir, "incidents.json")

    entries = []

    # 1. Ingest registrations
    if os.path.exists(registrations_path):
        try:
            with open(registrations_path, "r", encoding="utf-8-sig") as f:
                regs = json.load(f)
                for r in regs:
                    entries.append({
                        "source": "Registration",
                        "rider": r.get("name") or r.get("riderName") or "Registered Rider",
                        "token": r.get("token") or r.get("deviceToken") or "N/A",
                        "plate": r.get("plate") or r.get("plateNumber") or "N/A",
                        "phone": r.get("contact") or r.get("contactNumber") or "",
                        "emergencyName": r.get("emergencyName") or r.get("emergencyContactName") or "Emergency Contact",
                        "emergencyPhone": r.get("emergencyPhone") or r.get("emergencyContactPhone") or "",
                        "blood": r.get("blood") or "N/A",
                        "vehicle": r.get("vehicleModel") or "Motorcycle",
                        "photo": r.get("photoUrl") or r.get("driveLinkConverted") or "/logo.png"
                    })
        except Exception as e:
            print(f"[WARN] Failed to load registrations.json: {e}")

    # 2. Ingest incidents
    if os.path.exists(incidents_path):
        try:
            with open(incidents_path, "r", encoding="utf-8-sig") as f:
                incs = json.load(f)
                for inc in incs:
                    phone = inc.get("contactNumber") or inc.get("phone") or ""
                    em_phone = inc.get("emergencyContactPhone") or inc.get("emergencyPhone") or ""
                    if phone or em_phone:
                        token = inc.get("deviceToken") or "WEARABLE"
                        # Deduplicate by token if already in entries
                        if not any(e["token"] == token and e["rider"] == (inc.get("riderName") or "") for e in entries):
                            entries.append({
                                "source": "Incident",
                                "rider": inc.get("riderName") or "Wearable User",
                                "token": token,
                                "plate": inc.get("plateNumber") or "N/A",
                                "phone": phone,
                                "emergencyName": inc.get("emergencyContactName") or "Emergency Contact",
                                "emergencyPhone": em_phone,
                                "blood": inc.get("bloodType") or "N/A",
                                "vehicle": inc.get("vehicleModel") or "Wearable Unit",
                                "photo": inc.get("photoUrl") or "/logo.png"
                            })
        except Exception as e:
            print(f"[WARN] Failed to load incidents.json: {e}")

    print(f"[INFO] Found {len(entries)} rider profile records. Generating phone dialer QR codes...")

    generated_cards = []

    for idx, e in enumerate(entries):
        clean_primary = sanitize_phone(e["phone"])
        clean_emergency = sanitize_phone(e["emergencyPhone"])

        rider_slug = re.sub(r'[^a-zA-Z0-9]', '_', e["rider"]).lower()
        token_slug = re.sub(r'[^a-zA-Z0-9]', '_', e["token"]).lower()

        primary_qr_rel = None
        emergency_qr_rel = None

        if clean_primary:
            uri = f"tel:{clean_primary}"
            mat = generate_qr_matrix(uri)
            svg_content = matrix_to_svg(mat)
            filename = f"qr_primary_{rider_slug}_{token_slug}.svg"
            filepath = os.path.join(qr_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f_out:
                f_out.write(svg_content)
            primary_qr_rel = f"qrcodes/{filename}"

        if clean_emergency:
            uri = f"tel:{clean_emergency}"
            mat = generate_qr_matrix(uri)
            svg_content = matrix_to_svg(mat)
            filename = f"qr_emergency_{rider_slug}_{token_slug}.svg"
            filepath = os.path.join(qr_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f_out:
                f_out.write(svg_content)
            emergency_qr_rel = f"qrcodes/{filename}"

        generated_cards.append({
            "record": e,
            "primaryQr": primary_qr_rel,
            "emergencyQr": emergency_qr_rel,
            "cleanPrimary": clean_primary,
            "cleanEmergency": clean_emergency
        })

    # Generate standalone Rescuer Emergency Contact Directory HTML
    html_out = os.path.join(www_dir, "phone_qr_directory.html")
    with open(html_out, "w", encoding="utf-8") as f_html:
        f_html.write("""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RAMS Rescuer Emergency Phone Directory & QR Scanner</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    h1 { font-size: 20px; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; margin-bottom: 4px; }
    p.sub { font-size: 13px; color: #94a3b8; margin-top: 0; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; border-bottom: 1px solid #334155; padding-bottom: 12px; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; object-cover: cover; border: 2px solid #38bdf8; background: #0f172a; }
    .name { font-size: 15px; font-weight: bold; text-transform: uppercase; color: #ffffff; }
    .meta { font-size: 11px; font-family: monospace; color: #94a3b8; }
    .qr-row { display: flex; gap: 14px; justify-content: space-around; margin-top: 12px; }
    .qr-box { background: #ffffff; border-radius: 8px; padding: 8px; text-align: center; color: #0f172a; flex: 1; max-width: 140px; }
    .qr-box img { width: 100%; height: auto; display: block; border-radius: 4px; }
    .qr-label { font-size: 9px; font-weight: bold; font-family: monospace; text-transform: uppercase; margin-top: 6px; }
    .qr-num { font-size: 11px; font-family: monospace; font-weight: bold; color: #0284c7; word-break: break-all; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; font-family: monospace; background: #0369a1; color: #ffffff; }
  </style>
</head>
<body>
  <h1>RAMS Instant Emergency Dialer Directory</h1>
  <p class="sub">Point any smartphone camera at a QR code to dial the rider or emergency contact instantly.</p>
  <div class="grid">
""")
        for item in generated_cards:
            r = item["record"]
            p_qr = item["primaryQr"]
            e_qr = item["emergencyQr"]
            f_html.write(f"""
    <div class="card">
      <div class="header">
        <img class="avatar" src="{r['photo']}" alt="{r['rider']}" onerror="this.src='/logo.png'"/>
        <div>
          <div class="name">{r['rider']}</div>
          <div class="meta">{r['vehicle']} • Plate: <span class="badge">{r['plate']}</span> • Token: {r['token']}</div>
          <div class="meta" style="color: #ef4444; font-weight: bold; margin-top: 2px;">Blood: {r['blood']}</div>
        </div>
      </div>
      <div class="qr-row">
""")
            if p_qr and item["cleanPrimary"]:
                f_html.write(f"""
        <div class="qr-box">
          <img src="{p_qr}" alt="Primary Phone QR"/>
          <div class="qr-label">Rider Contact</div>
          <div class="qr-num">{item['cleanPrimary']}</div>
        </div>
""")
            if e_qr and item["cleanEmergency"]:
                f_html.write(f"""
        <div class="qr-box">
          <img src="{e_qr}" alt="Emergency Contact QR"/>
          <div class="qr-label">{r['emergencyName'][:15]}</div>
          <div class="qr-num">{item['cleanEmergency']}</div>
        </div>
""")
            f_html.write("""
      </div>
    </div>
""")
        f_html.write("""
  </div>
</body>
</html>
""")

    print(f"[SUCCESS] Generated QR codes in '{qr_dir}'")
    print(f"[SUCCESS] Standalone rescuer directory created at '{html_out}'")

if __name__ == "__main__":
    main()
