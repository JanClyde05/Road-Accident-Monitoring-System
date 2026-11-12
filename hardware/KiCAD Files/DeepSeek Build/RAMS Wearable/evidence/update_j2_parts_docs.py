"""Refresh documentation/BOM from the J2 circuit only; never writes CAD or firmware."""
from pathlib import Path
import csv
import hashlib
import json
import shutil

base = Path(__file__).resolve().parents[1]
docs = base / 'docs'
archive = base / 'verification/superseded_buckboost_20261109/docs'
archive.mkdir(parents=True, exist_ok=True)
names = ['BOM_PROCUREMENT.csv', 'ASSEMBLY_AND_BRINGUP.md', 'PARTS_AND_FIRMWARE.md']
for name in names:
    if not (archive / name).exists():
        shutil.copy2(docs / name, archive / name)

spec_bytes = (base / 'circuit_spec.json').read_bytes()
digest = hashlib.sha256(spec_bytes).hexdigest()
spec = json.loads(spec_bytes)
assert spec['revision'] == 'J2 LDO engineering', 'Review newer revision before generating'
components = [c for c in spec['components'] if c['footprint']]
old = {}
with (archive / 'BOM_PROCUREMENT.csv').open(encoding='utf-8-sig', newline='') as f:
    for row in csv.DictReader(f):
        for ref in row['References'].split():
            old[ref] = row

# Stock is the intended source. Verification of identity/rating is not an instruction
# to discard owned parts or buy every named manufacturer again.
meta = {
 'J1': ('GCT USB4105-GF-A geometry; compare owned 16-pin socket', 'OWNED_GEOMETRY_CHECK', 'Order 7 horizontal 16-pin spring-type sockets, 20 pieces; exact MPN absent', 'Compare shell slots, pegs, contacts and pinout with GCT drawing; purchase only if stock differs', 'https://gct.co/files/drawings/usb4105.pdf'),
 'U3': ('LTC4054ES5-4.2 / LTH7 top marking', 'OWNED_NAMED_VERIFY', 'Order 6 LTC4054ES5-4.2/LTH7 ten-pack', 'Reuse matching part; pins 1 CHRG, 2 GND, 3 BAT, 4 VCC, 5 PROG. Leave R30 DNP until cell/harness acceptance', 'https://www.analog.com/media/en/technical-documentation/data-sheets/405442xf.pdf'),
 'U4': ('DW01A SOT23-6; selected Slkor pin contract', 'OWNED_PINOUT_VERIFY', 'Order11 DW01A20pcs; maker unspecified', 'Verify actual maker/pinout/protection thresholds against current circuit; do not substitute by name alone', '../evidence/sources/slkor_dw01a_rev2.pdf'),
 'Q3': ('FS8205A six-pin; selected Fuxin pin contract', 'OWNED_PINOUT_VERIFY', 'Order11 FS8205A SOT23-6 twenty-pack', 'Confirm1S1,2D1,3S2,4G2,5D2,6G1; eight-pin versions are not replacements', ''),
 'Q1': ('AO3401/AO3401A P-channel SOT23', 'OWNED_NAMED_VERIFY', 'Order 12 AO3401 fifty-pack', 'Reuse after checking pins 1 gate, 2 source, 3 drain and ratings; source=SYS_IN, drain=B_PLUS', 'https://www.aosmd.com/sites/default/files/res/data_sheets/AO3401A.pdf'),
 'SW1': ('Owned MSK-12C02', 'OWNED_GEOMETRY_CHECK', 'Order 14 MSK-12C02 ten-pack', 'Reuse; two 0.85 mm peg holes 3 mm apart; pin 2 common; 50 mA rating permits enable control only', 'https://datasheet.lcsc.com/datasheet/pdf/5162155576bfd231c35aa9a893d25c8c.pdf'),
 'U5': ('Diodes AP2112K-3.3TRG1', 'OWNED_NAMED_VERIFY', 'Order 17 AP2112K-3.3TRG1 ten-pack', 'Reuse; pins 1 VIN, 2 GND, 3 EN, 4 NC, 5 VOUT. Measure dropout and USB temperature', 'https://www.diodes.com/datasheet/download/AP2112.pdf'),
 'Q4': ('Diodes DMN2056U-7', 'BUY_NEW', 'Not listed in inventory', 'ADC isolation NMOS: 1 gate=3V3, 2 source=ADC, 3 drain=upper resistor. AO3401 is not a substitute', 'https://www.diodes.com/datasheet/download/DMN2056U.pdf'),
 'BZ1': ('Owned 9650 Active 3V SMD stock', 'OWNED_GEOMETRY_CHECK', 'Order 15 five-pack 9650 Active 3V; owner confirms DC tone', 'Reuse with extended lands; 1 positive, 2 negative; hand-solder after reflow; measure stock fit/current', 'https://en.jlg-sound.com/productshow-46057459.html'),
 'SW2': ('Owned two-pin 3x4x2 mm tactile', 'OWNED_GEOMETRY_CHECK', 'Orders 8/23 small tactile switches; Order 23 explicitly two-pin', 'Reuse no-peg form matching 3.9x3.0 mm body and 5.0 mm terminal span; normally open', 'https://datasheet.lcsc.com/datasheet/pdf/0475ac02febf455ca9ddcfb380b0df0d.pdf'),
 'SW3': ('Owned two-pin 3x4x2 mm tactile', 'OWNED_GEOMETRY_CHECK', 'Orders 8/23 small tactile switches; Order 23 explicitly two-pin', 'Reuse matching form; BOOT/CANCEL pulls GPIO0 low and enters download mode during reset', 'https://datasheet.lcsc.com/datasheet/pdf/0475ac02febf455ca9ddcfb380b0df0d.pdf'),
 'LED1': ('Ordered WS2812B-2020 stock; exact revision and 3.3 V operation unverified', 'DNP_LED_IDENTITY_HOLD', 'Owner ordered WS2812B 2020 DC5V, 100 pieces; exact manufacturer/revision unverified', 'Do not fit initially. Reference pins 1 DO unused, 2 GND, 3 DI, 4 VDD; qualify actual geometry and operation over rail range. No converter added', ''),
 'Y1': ('ABM8-40.000MHZ-10-1-U-T or qualified owned 40 MHz 3225', 'OWNED_PARAMETERS_CHECK', 'Order 13 ten 40 MHz 3225 crystals; CL/ESR unspecified', 'Confirm 10 pF CL, ESR <=35 Ohm, tolerance and pads; otherwise obtain named Abracon. 12 pF loads are tuning starts', 'https://abracon.com/Resonators/abm8.pdf'),
 'U2': ('Ai-Thinker Ra-02 433 MHz SX1278 module', 'OWNED_NAMED_VERIFY', 'Order 21 two Ra-02 modules', 'Reuse one; hand-solder bottom after top reflow; attach 433 MHz antenna before TX', 'https://docs.ai-thinker.com/en/Ra-02/index.html'),
}
fields = ['References','Value','Selected_MPN_or_spec','Footprint','Qty_per_PCB','Qty_fit_initial','Assembly_side','Procurement_status','Stock_evidence','Purchase_or_verification_action','Primary_source','Inventory_source','Source_spec_SHA256']
rows = []
for c in components:
    ref, value = c['ref'], c['value']
    r = dict(old.get(ref, {}))
    r.update(References=ref, Value=value, Footprint=c['footprint'], Qty_per_PCB=1,
             Qty_fit_initial=int(not c.get('dnp', False) and not ref.startswith('TP')),
             Assembly_side=c.get('side','F'), Source_spec_SHA256=digest,
             Inventory_source='docs/Parts List I Currently Have/product_list_expense_breakdown.md')
    if ref in meta:
        for k,v in zip(['Selected_MPN_or_spec','Procurement_status','Stock_evidence','Purchase_or_verification_action','Primary_source'],meta[ref]): r[k]=v
    elif ref.startswith('TP'):
        r.update(Selected_MPN_or_spec='Fabricated copper test pad; no component',Procurement_status='PCB_FEATURE',Stock_evidence='Not applicable',Purchase_or_verification_action='No purchase; keep probe access',Primary_source='')
    elif ref.startswith('R'):
        r.update(Selected_MPN_or_spec=value+'; 0402; >=1/16 W; 1% unless noted',Primary_source='')
        if ref=='R30':
            r.update(Procurement_status='OWNED_DNP',Stock_evidence='Order 15 zero-ohm 0402 hundred-pack',Purchase_or_verification_action='Leave DNP until cell/harness/rating checks; enables 100 mA charger')
        elif value=='33R':
            r.update(Procurement_status='OWNED_VALUE_VERIFY',Stock_evidence='Order 15 33 Ohm 0402 1% hundred-pack',Purchase_or_verification_action='Reuse matching stock')
        else:
            r.update(Procurement_status='BUY_MISSING_VALUE',Stock_evidence='Exact 0402 value not itemized; 0805 kit uses a different package',Purchase_or_verification_action='Obtain stated value/package/tolerance if absent; R15=30k and R16=10k give 4:1 ADC scale')
    elif ref.startswith('C'):
        r.update(Selected_MPN_or_spec=value+'; matching CAD package; check rating/dielectric',Primary_source='')
        if 'C0G' in value:
            owned=value.startswith('12pF')
            r.update(Procurement_status='OWNED_DIELECTRIC_CHECK' if owned else 'BUY_MISSING_RF_VALUE',Stock_evidence='Order 10 12 pF 0402; dielectric unspecified' if owned else 'No matching value itemized; owned 2.4 pF is a different value',Purchase_or_verification_action='Require C0G/NP0 and RF suitability; RF/crystal values are tuning starts')
        elif value.startswith('1nF'):
            r.update(Procurement_status='BUY_MISSING_VALUE',Stock_evidence='1 nF 0402 not itemized',Purchase_or_verification_action='Use 1 nF for C29; do not restore prior 10 nF or 100 nF ADC filter')
        elif value.startswith('10uF') or value.startswith('4.7uF'):
            r.update(Procurement_status='OWNED_VALUE_VERIFY',Stock_evidence='Order 15 '+('10 uF' if value.startswith('10uF') else '4.7 uF')+' 16 V X5R 0603 ten-pack',Purchase_or_verification_action='Reuse matching stock; check DC-bias capacitance; LDO requires >=1 uF effective input/output')
        else:
            r.update(Procurement_status='OWNED_VALUE_VERIFY',Stock_evidence='Order 10 matching 0402 nominal values; rating/dielectric unspecified',Purchase_or_verification_action='Reuse after rating/dielectric check; C33 is 1 uF reset capacitor')
    elif ref in ('L1','L2','L4','L5'):
        owned=ref in ('L1','L2')
        r.update(Selected_MPN_or_spec=value+'; 0402; GHz characteristics required',Procurement_status='OWNED_RF_PARAMETERS_CHECK' if owned else 'BUY_MISSING_RF_VALUE',Stock_evidence='Order 5 generic '+('2.0 nH' if ref=='L1' else '2.4 nH')+' 0402 hundred-pack' if owned else 'No matching value itemized',Purchase_or_verification_action='Verify RF impedance/Q/SRF; L1 also requires >=500 mA current. Exact MPN qualification remains open',Primary_source='')
    assert all(k in r for k in fields), (ref,[k for k in fields if k not in r])
    rows.append({k:r[k] for k in fields})

with (docs / 'BOM_PROCUREMENT.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)

import re
for name in names[1:]:
    p = docs / name
    content = p.read_text(encoding="utf-8")
    content = re.sub(r"Source SHA256: `[0-9a-f]{64}`", "Source SHA256: `"+digest+"`", content)
    p.write_text(content, encoding="utf-8")

manifest={'revision':spec['revision'],'spec_sha256':digest,'footprint_positions':len(rows),'copper_test_pads':sum(r['Procurement_status']=='PCB_FEATURE' for r in rows),'component_positions':sum(r['Procurement_status']!='PCB_FEATURE' for r in rows),'initial_fit':sum(r['Qty_fit_initial'] for r in rows),'dnp':[c['ref'] for c in components if c.get('dnp')],'files':{n:hashlib.sha256((docs/n).read_bytes()).hexdigest() for n in names},'preserved_files':{n:hashlib.sha256((archive/n).read_bytes()).hexdigest() for n in names}}
(base/'evidence/j2_parts_docs_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
assert (base/'circuit_spec.json').read_bytes()==spec_bytes,'Spec changed during generation; rerun'
print(json.dumps(manifest,indent=2))
