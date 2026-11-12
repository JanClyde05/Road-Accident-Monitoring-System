"""Reviewed JLCPCB wearable circuit/placement inputs. No earlier CAD is modified."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NAME = 'RAMS_JLC_S3'
components = []
R = 'Resistor_SMD:R_0402_1005Metric'
C = 'Capacitor_SMD:C_0402_1005Metric'
C6 = 'Capacitor_SMD:C_0603_1608Metric'
C8 = 'Capacitor_SMD:C_0805_2012Metric'
SOT3 = 'Package_TO_SOT_SMD:SOT-23'
SOT5 = 'Package_TO_SOT_SMD:SOT-23-5'
SOT6 = 'Package_TO_SOT_SMD:SOT-23-6'
sheet = 'power'

def add(ref, lib, value, fp, pins, sch, pcb, description='', **kw):
    item = dict(ref=ref, lib_id=lib, value=value, footprint=fp,
                pins={str(k):v for k,v in pins.items()}, sheet=sheet,
                x=sch[0], y=sch[1], rotation=sch[2] if len(sch)>2 else 0,
                pcb_x=pcb[0], pcb_y=pcb[1], pcb_rotation=pcb[2] if len(pcb)>2 else 0,
                description=description)
    item.update(kw)
    components.append(item)
    return item

def two(ref, value, n1, n2, sch, pcb, fp=None, **kw):
    lib = {'R':'Device:R','C':'Device:C','L':'Device:L','F':'Device:FerriteBead'}[ref[0]]
    fp = fp or (R if ref[0]=='R' else C if ref[0]=='C' else 'Inductor_SMD:L_0402_1005Metric')
    return add(ref,lib,value,fp,{1:n1,2:n2},sch,pcb,**kw)

# USB power/data, charging and protected battery. Raw cell negative is distinct.
add('J1','Connector:USB_C_Receptacle_USB2.0_16P','USB4105-GF-A',
    'RAMS_JLC:USB_C_Receptacle_GCT4105_NPTH',
    {'A1':'GND','B1':'GND','A12':'GND','B12':'GND','SH':'GND',
     'A4':'VBUS','B4':'VBUS','A9':'VBUS','B9':'VBUS','A5':'CC1','B5':'CC2',
     'A6':'USB_DP_CONN','B6':'USB_DP_CONN','A7':'USB_DN_CONN','B7':'USB_DN_CONN','A8':None,'B8':None},
    (50.8,63.5),(106.5,128.3), 'Exact GCT connector; generic owned USB socket fit is unverified')
two('R1','5.1k 1%','CC1','GND',(88.9,40.64),(111.8,126.2,90))
two('R2','5.1k 1%','CC2','GND',(109.22,40.64),(111.8,128.2,90))
add('D1','Power_Protection:USBLC6-2SC6','USBLC6-2SC6',SOT6,
    {1:'USB_DP_CONN',2:'GND',3:'USB_DN_CONN',4:'USB_DN_ESD',5:'VBUS',6:'USB_DP_ESD'},
    (109.22,83.82),(106.6,122.5,90))
two('C1','1uF 10V X7R','VBUS','GND',(137.16,40.64),(103.0,123.0,90))
two('C2','100nF X7R','VBUS','GND',(157.48,40.64),(109.5,123.1,90))
add('U3','Battery_Management:LTC4054ES5-4.2','LTC4054ES5-4.2','Package_TO_SOT_SMD:TSOT-23-5',
    {1:None,2:'GND',3:'B_PLUS',4:'CHG_IN',5:'CHG_PROG'},(187.96,66.04),(115.0,124.2),
    '100mA nominal; confirm cell charge rating; populate CHG_LINK after battery review')
two('R3','10k 1%','CHG_PROG','GND',(226.06,66.04),(115.0,121.6,90))
two('R30','0R CHG_LINK','VBUS','CHG_IN',(185.42,35.56,90),(113.1,126.7,90),dnp=True)
two('C3','1uF 10V X7R','CHG_IN','GND',(170.18,96.52),(112.6,123.0,90))
two('C4','4.7uF 10V X5R','B_PLUS','GND',(198.12,96.52),(117.7,124.0,90),C6)
add('J2','RAMS_JLC:Battery_JST_SH','SM02B-SRSS-TB',
    'Connector_JST:JST_SH_SM02B-SRSS-TB_1x02-1MP_P1.00mm_Horizontal',
    {1:'B_PLUS',2:'B_MINUS'},(264.16,40.64),(117.0,129.6), 'Verify cable polarity with meter')
add('U4','RAMS_JLC:DW01A_Slkor','DW01A SLKOR',SOT6,
    {1:'DW_OD',2:'DW_CS',3:'DW_OC',4:None,5:'DW_VCC',6:'B_MINUS'},
    (287.02,78.74),(122.0,129.0,90))
add('Q3','RAMS_JLC:FS8205A_Fuxin','FS8205A Fuxin',SOT6,
    {1:'B_MINUS',2:'FET_DRAIN',3:'GND',4:'DW_OC',5:'FET_DRAIN',6:'DW_OD'},
    (355.6,78.74),(126.0,129.1,90))
two('R4','100R','B_PLUS','DW_VCC',(251.46,116.84,90),(120.2,126.4,90))
two('R5','1k','DW_CS','GND',(284.48,116.84,90),(123.4,126.4,90))
two('C5','100nF X7R','DW_VCC','B_MINUS',(317.5,116.84),(121.9,126.4,90))

# USB/battery load sharing; PMOS source deliberately faces SYS_IN.
add('D2','Diode:SS14','SS14 SMA','Diode_SMD:D_SMA',{1:'SYS_IN',2:'VBUS'},
    (43.18,149.86,90),(104.0,118.4,90))
add('Q1','Transistor_FET:AO3401A','AO3401A',SOT3,
    {1:'VBUS',2:'SYS_IN',3:'B_PLUS'},(83.82,152.4),(109.0,118.4),
    'Reverse-oriented PMOS prevents USB from driving cell through body diode')
two('R6','100k','VBUS','GND',(114.3,149.86),(109.0,116.0))
add('SW1','Switch:SW_SPDT','PCM12SMTR','Button_Switch_SMD:SW_SPDT_PCM12',
    {1:'REG_VINA',2:'SYS_EN',3:'GND'},(40.64,200.66),(101.6,111.5,90), 'Enable only; no load current through slider')
two('R7','100k','SYS_EN','GND',(83.82,200.66),(105.2,112.8,90))
add('U5','RAMS_JLC:TPS63020','TPS63020DSJR','RAMS_JLC:TPS63020_DSJ14',
    {1:'REG_VINA',2:'GND',3:'REG_FB',4:'+3V45',5:'+3V45',6:'REG_L2',7:'REG_L2',
     8:'REG_L1',9:'REG_L1',10:'SYS_IN',11:'SYS_IN',12:'SYS_EN',13:'REG_VINA',14:None,15:'GND'},
    (160.02,193.04),(125.0,123.0), 'Forced PWM; 3.45V nominal; no eFuse programming at this voltage')
two('L3','1.5uH XFL4020-152MEC','REG_L1','REG_L2',(157.48,147.32,90),(128.1,123.0,90),
    'Inductor_SMD:L_Coilcraft_XxL4020')
two('C7','10uF 6.3V X5R','SYS_IN','GND',(121.92,238.76),(121.4,121.7,90),C6)
two('C8','10uF 6.3V X5R','SYS_IN','GND',(142.24,238.76),(121.4,123.8,90),C6)
two('C9','100nF X7R','REG_VINA','GND',(162.56,238.76),(123.3,120.0))
two('C10','22uF 6.3V X5R','+3V45','GND',(190.5,238.76),(126.6,119.8,90),C6)
two('C30','22uF 6.3V X5R','+3V45','GND',(213.36,238.76),(129.2,119.8,90),C6)
two('C31','22uF 6.3V X5R','+3V45','GND',(236.22,238.76),(131.4,119.8,90),C6)
two('R31','1.18M 0.1%','+3V45','REG_FB',(228.6,182.88),(124.2,119.5,90))
two('R32','200k 0.1%','REG_FB','GND',(254,182.88),(124.1,117.8,90))
add('U6','Power_Management:TPS22919DCK','TPS22919DCKR','Package_TO_SOT_SMD:SOT-363_SC-70-6',
    {1:'B_PLUS',2:'GND',3:'MCU_EN',4:None,5:'ADC_QOD',6:'VBAT_DIV'},
    (322.58,180.34),(120.0,119.2), 'Voltage-supervisor gated battery sense with output discharge')
two('R15','10k 0.1%','VBAT_DIV','VBAT_SENSE',(302.26,226.06),(119.0,116.8,90))
two('R16','10k 0.1%','VBAT_SENSE','GND',(330.2,226.06),(119.0,115.1,90))
two('C29','10nF X7R','VBAT_SENSE','GND',(358.14,226.06),(118.7,113.4,90))
two('R40','100R','ADC_QOD','VBAT_DIV',(358.14,180.34,90),(121.0,116.7,90))

# MCU, analog supplies, clock and independent chip/antenna matching networks.
sheet='mcu'
pins = {str(i):None for i in range(1,58)}
pins.update({str(k):v for k,v in {1:'RF_LNA',2:'VDD_RF',3:'VDD_RF',4:'MCU_EN',5:'BOOT_BTN',
    6:'BUZZER_CTRL',7:'VBAT_SENSE',13:'LORA_DIO0',14:'LORA_RST',15:'LORA_NSS',16:'LORA_MOSI',
    17:'LORA_SCK',18:'LORA_MISO',20:'+3V45',25:'USB_DN',26:'USB_DP',29:'VDD_SPI',36:'NEO_DATA',
    46:'+3V45',49:'UART_TX',50:'UART_RX',51:'STRAP45',52:'STRAP46',53:'XTAL_N',54:'XTAL_P_DRV',
    55:'+3V45',56:'+3V45',57:'GND'}.items()})
add('U1','RAMS_JLC:ESP32-S3FH4R2','ESP32-S3FH4R2','RAMS_JLC:ESP32-S3FH4R2_QFN56_EP5p7',
    pins,(83.82,139.7),(115.0,112.0), '4MB embedded flash / 2MB embedded quad PSRAM')
two('L1','2.0nH >=500mA','+3V45','VDD_RF',(167.64,43.18,90),(108.0,111.4,90))
two('C11','10uF 10V X5R','VDD_RF','GND',(195.58,43.18),(109.2,113.0,90),C6)
two('C12','1uF X7R','VDD_RF','GND',(218.44,43.18),(110.4,111.0))
two('C13','100nF X7R','VDD_RF','GND',(241.3,43.18),(110.4,112.1))
two('C14','10uF 10V X5R','+3V45','GND',(266.7,43.18),(111.8,107.0),C6)
two('C15','100nF X7R','+3V45','GND',(172.72,78.74),(117.0,107.2))
two('C16','100nF X7R','+3V45','GND',(195.58,78.74),(114.4,117.0,90))
two('C17','1uF X7R','VDD_SPI','GND',(218.44,78.74),(119.7,114.5,90))
two('C20','100nF X7R','VDD_SPI','GND',(241.3,78.74),(121.1,114.5,90))
two('C21','10nF X7R','+3V45','GND',(266.7,78.74),(112.0,107.7))
two('C22','1uF X7R','+3V45','GND',(289.56,78.74),(110.5,107.7))
two('R8','10k','+3V45','MCU_EN',(167.64,114.3),(107.5,113.8,90))
two('R34','10k','+3V45','BOOT_BTN',(218.44,114.3),(111.0,115.5,90))
two('R35','10k','STRAP45','GND',(243.84,114.3),(118.0,106.0))
two('R36','10k','STRAP46','GND',(269.24,114.3),(116.5,106.0))
two('R9','22R','XTAL_P_DRV','XTAL_P',(167.64,154.94,90),(112.9,107.1))
add('Y1','Device:Crystal_GND24_Small','ABM8-40.000MHZ-10-1-U-T','RAMS_JLC:Crystal_Abracon_ABM8_3225',
    {1:'XTAL_P',2:'GND',3:'XTAL_N',4:'GND'},(208.28,154.94),(112.8,103.9),
    'CL10pF; 12pF starting loads assume about4pF stray; validate startup/frequency')
two('C24','12pF C0G','XTAL_P','GND',(187.96,187.96),(110.8,104.2,90))
two('C25','12pF C0G','XTAL_N','GND',(228.6,187.96),(114.9,103.8,90))
two('C18','1.5pF C0G RF','RF_LNA','GND',(167.64,231.14),(110.4,109.0,90))
two('L2','2.4nH RF','RF_LNA','RF_MATCH',(195.58,231.14,90),(109.1,108.9))
two('C19','1.5pF C0G RF','RF_MATCH','GND',(223.52,231.14),(107.8,109.0,90))
two('C32','1.2pF C0G RF','RF_MATCH','ANT_TUNE',(254,231.14,90),(107.0,107.4,90))
two('L4','2.7nH RF','ANT_TUNE','GND',(281.94,231.14),(108.2,106.5))
two('L5','3.3nH RF','ANT_TUNE','ANT_FEED',(309.88,231.14,90),(105.7,105.6,90))
add('ANT1','Device:Antenna_Chip','2450AT18B100E','RAMS_JLC:Johanson_B100_3216',
    {1:'ANT_FEED',2:None},(350.52,231.14),(102.6,103.2,180), 'Pin2 NC; all-layer6.5mmcornerno-metalregion')
add('U7','RAMS_JLC:TLV803EA30','TLV803EA30DBZR',SOT3,
    {1:'GND',2:'MCU_EN',3:'+3V45'},(322.58,116.84),(106.0,114.8),
    '3.08V falling threshold,200ms reset delay; also gates battery ADC sense')
two('C33','100nF X7R','+3V45','GND',(358.14,116.84),(104.3,114.9,90))

sheet='io'
add('U2','RF_Module:Ai-Thinker-Ra-02','Ai-Thinker-Ra-02','RF_Module:Ai-Thinker-Ra-01-LoRa',
    {1:'GND',2:'GND',3:'LORA_VDD',4:'LORA_RST',5:'LORA_DIO0',6:None,7:None,8:None,9:'GND',
     10:None,11:None,12:'LORA_SCK_DEV',13:'LORA_MISO',14:'LORA_MOSI',15:'LORA_NSS',16:'GND'},
    (73.66,83.82),(129.5,111.4,0), 'Bottom hand solder; separate433MHzU.FLantenna',side='B')
two('FB1','MGGB1005M800HT-LF','+3V45','LORA_VDD',(43.18,33.02,90),(126.0,107.0),
    'Inductor_SMD:L_0402_1005Metric')
two('C26','10uF 10V X5R','LORA_VDD','GND',(73.66,33.02),(127.7,107.0),C6)
two('C27','100nF X7R','LORA_VDD','GND',(101.6,33.02),(129.2,107.0))
two('R11','33R','LORA_SCK','LORA_SCK_DEV',(127,73.66,90),(116.0,117.3))
two('R37','10k','+3V45','LORA_NSS',(127,111.76),(117.5,117.3))
add('LED1','LED:WS2812B','WS2812B-V6','LED_SMD:LED_WS2812B_PLCC4_5.0x5.0mm_P3.2mm',
    {1:'+3V45',2:None,3:'GND',4:'NEO_DIN'},(203.2,66.04),(136.5,104.0),
    'ExactV6 required; unidentified5Vstock notaccepted at3.45V')
two('R13','33R','NEO_DATA','NEO_DIN',(167.64,38.1,90),(121.0,110.5,90))
two('C28','100nF X7R','+3V45','GND',(238.76,38.1),(133.0,104.1,90))
add('BZ1','Device:Buzzer','SMI-1027-TW-3V-R','RAMS_JLC:Buzzer_PUI_SMI-1027-TW-3V-R',
    {1:'+3V45',2:'BUZZER_NEG'},(327.66,55.88),(136.0,125.0), 'Active buzzer; selectedrated2..5V')
add('Q2','Transistor_BJT:BC817','BC817-25',SOT3,{1:'BUZZER_BASE',2:'GND',3:'BUZZER_NEG'},
    (325.12,104.14),(135.0,117.2,90))
two('R12','1k','BUZZER_CTRL','BUZZER_BASE',(284.48,96.52,90),(131.7,115.0))
two('R14','100k','BUZZER_BASE','GND',(287.02,129.54),(131.7,116.5))
add('D3','Diode:1N4148W','1N4148W','Diode_SMD:D_SOD-123',{1:'+3V45',2:'BUZZER_NEG'},
    (365.76,78.74),(138.8,117.0,90))
add('SW2','Switch:SW_Push','PTS810 RESET','Button_Switch_SMD:SW_SPST_PTS810',
    {1:'MCU_EN',2:'GND'},(53.34,167.64),(119.5,102.5))
add('SW3','Switch:SW_Push','PTS810 BOOT/CANCEL','Button_Switch_SMD:SW_SPST_PTS810',
    {1:'BOOT_BTN',2:'GND'},(116.84,167.64),(125.0,102.5))
two('R38','22R','USB_DP_ESD','USB_DP',(190.5,167.64,90),(112.5,119.1,90))
two('R39','22R','USB_DN_ESD','USB_DN',(243.84,167.64,90),(114.0,119.1,90))
for i,(name,pos) in enumerate([('GND',(139.8,109.0)),('+3V45',(139.8,111.0)),('B_PLUS',(139.8,113.0)),
    ('UART_TX',(121.4,109.0)),('UART_RX',(122.9,109.0)),('MCU_EN',(124.4,109.0)),
    ('BOOT_BTN',(125.9,109.0)),('SYS_IN',(129.0,129.7))],1):
    add('TP'+str(i),'Connector:TestPoint',name,'TestPoint:TestPoint_Pad_D1.0mm',
        {1:name},(45.72+(i-1)%4*81.28,218.44+(i-1)//4*25.4),pos)

# Flags represent known source paths (connector/FET/passive filter), not invented supplies.
for i,net in enumerate(['GND','B_MINUS','VBUS','CHG_IN','SYS_IN','VDD_RF','LORA_VDD','DW_VCC','REG_VINA'],1):
    add('#FLG'+str(i).zfill(3),'power:PWR_FLAG','PWR_FLAG','',{1:net},
        (20.32+i*33.02,269.24),(0,0))

spec = dict(title='RAMS JLCPCB bare ESP32-S3 wearable',date='2026-11-08',revision='J1 engineering',
    symbol_libraries={'RAMS_JLC':'lib/RAMS_JLC.kicad_sym'},
    sheets=[{'id':'power','title':'USB, protected battery and regulated power','notes':[
        {'x':20,'y':16,'text':'Single cell 4.2V LiPo. CHG_LINK DNP until cell/harness review. System3.45V forced PWM.','size':1.0}]},
        {'id':'mcu','title':'ESP32-S3FH4R2, clock and 2.4GHz RF','notes':[
        {'x':150,'y':16,'text':'RF values are reference starting values; tune on assembled final enclosure.','size':1.0}]},
        {'id':'io','title':'LoRa, indicators, controls and test access','notes':[
        {'x':150,'y':16,'text':'Phone supplies IMU/GPS overBLE. Ra02 bottom hand solder after top reflow.','size':1.0}]}],components=components)

if __name__=='__main__':
    assert len({c['ref'] for c in components})==len(components)
    assert next(c for c in components if c['ref']=='U1')['pins']['36']=='NEO_DATA'
    assert next(c for c in components if c['ref']=='Q3')['pins']['3']=='GND'
    assert next(c for c in components if c['ref']=='U4')['pins']['6']=='B_MINUS'
    (ROOT/'circuit_spec.json').write_text(json.dumps(spec,indent=2)+'\n',encoding='utf8')
    print(f'{len(components)} schematic symbols written; {sum(not c["ref"].startswith("#") for c in components)} board footprints')
