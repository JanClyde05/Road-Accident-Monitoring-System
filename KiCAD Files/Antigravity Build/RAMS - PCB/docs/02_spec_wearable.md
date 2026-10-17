# RAMS Wearable - Schematic Connection Guide v0.1

Use this guide to wire the schematic in KiCad. Net names match the SPEC.

## Section 1: USB-C and Charger

```
J1.VBUS ----+---- C1(10uF) ---- GND
            |---- C2(0.1uF) --- GND
            |---- D1.VBUS (USBLC6-2SC6)
            |---- D2.anode (Schottky SS14) --> cathode = LDO_IN
            |---- U3.VCC (LTH7R pin 4)
            |---- Q1.gate (P-FET) via R_GATE(100k to GND)

J1.CC1 ---- R_CC1(5.1k) ---- GND
J1.CC2 ---- R_CC2(5.1k) ---- GND
J1.D+ ----- D1.I/O1 --------- U1.GPIO20 (USB_DP)
J1.D- ----- D1.I/O2 --------- U1.GPIO19 (USB_DN)
J1.Shield -- GND
```

## Section 2: Battery, Protection, Power Path

```
J2.pin1(+) = B_PLUS
J2.pin2(-) = B_MINUS

U4.VCC(5) ---- R_DW01(330) ---- B_PLUS
U4.VSS(6) ---- B_MINUS
U4.OD(1)  ---- Q_P.G1(pin3)
U4.OC(3)  ---- Q_P.G2(pin4)
U4.CS(2)  ---- R_CS(1k) ---- Q_P.S1(pin1,2) = system GND
U4.TD(4)  ---- C_DW01(0.1uF) ---- B_MINUS
C_DW01b(0.1uF): U4.VCC to U4.VSS

Q_P.S1(1,2) = system GND
Q_P.S2(5,6) = B_MINUS (cell negative)
Q_P.D(7,8)  = internal common drain (connects S1-S2 path)

Q1(P-FET): source = LDO_IN, drain = B_PLUS, gate = VBUS
  R_GATE(100k): gate to GND (turn on when USB absent)

D2(Schottky): anode = VBUS, cathode = LDO_IN

SW1(MSK12C02): common = U5.EN, throw1 = LDO_IN, throw2 = GND

U5(AP2112K-3.3):
  VIN(1) = LDO_IN, EN(3) = SW1.common, GND(2) = GND, VOUT(5) = 3V3
  C_LDO_IN(10uF): LDO_IN to GND
  C_LDO_OUT(10uF): 3V3 to GND
  C_BULK(100uF): LDO_IN to GND (for LoRa TX sag, F3)
  C_3V3_BULK(47uF): 3V3 to GND (F3)

U3(LTH7R):
  VCC(4) = VBUS, BAT(3) = B_PLUS, GND(2) = GND
  PROG(5) ---- R_PROG(4.02k) ---- GND
  CHRG(1) = optional charge LED
  C_CHG_IN(1uF): VBUS to GND (at U3)
  C_CHG_OUT(4.7uF): B_PLUS to GND (at U3)
```

## Section 3: ESP32-S3FH4R2 (U1)

```
VDD3P3 analog (pins 2,3): 3V3 through L1(2nH) then:
  C_VDD1(10uF), C_VDD2(1uF), C_VDD3(0.1uF x2) to GND

VDD3P3_CPU (pin 46): C_CPU(0.1uF) to GND
VDD3P3_RTC (pin 20): C_RTC(0.1uF) to GND
VDD_SPI (pin 29): C_SPI(1uF) + C_SPI2(0.1uF) to GND
VDDA (pins 55,56): C_VDDA1(10nF) + C_VDDA2(1uF) to GND

CHIP_PU/EN (pin 4): R_EN(10k) to 3V3, C_EN(1uF) to GND, SW_RESET to GND
GPIO0 (pin 5): SW_BOOT to GND (internal pull-up)

XTAL_P (pin 54): Y1 pin 1, R_XTAL(22ohm) in series
XTAL_N (pin 53): Y1 pin 3
Y1 load caps: C_XTAL(12pF) each pin to GND

Exposed pad (pin 57): solid GND, thermal vias to In1

GPIO19(D-) = USB_DN, GPIO20(D+) = USB_DP
```

## Section 4: 2.4GHz Antenna

```
ANT1 feed ---- C_A(NC shunt) ---- R_A(0R series) ---- C_B(NC shunt)
  ---- C19(2.4pF shunt) ---- L2(2.4nH series) ---- C18(2.7pF shunt) ---- LNA_IN (U1 pin 1)
All shunt caps to GND. RF trace ~0.183mm, 50 ohm on F.Cu over In1 ground.
```

## Section 5: LoRa Ra-02 (U2)

```
U2.VDD = 3V3 (through FB1 ferrite bead for noise, F4)
  C_RA02(10uF) + C_RA02_2(0.1uF) at the pin to GND
U2.NSS  = GPIO10
U2.MOSI = GPIO11
U2.SCK  = GPIO12 (through R_SCK 33ohm series near MCU)
U2.MISO = GPIO13
U2.RST  = GPIO9
U2.DIO0 = GPIO8
U2.GND (4 pads) = GND
```

## Section 6: Peripherals

```
LED1(SK6805-EC15): VDD = 3V3 + C_LED(0.1uF), DIN = GPIO48, DOUT = NC

BZ1(buzzer): positive = 3V3, negative = Q2.collector
Q2(BC817): emitter = GND, base = GPIO1 via R_BZ(1k), R_BZ2(100k base-GND)

Battery sense:
  B_PLUS ---- R_DIV1(330k) ---- VBAT_SENSE ---- R_DIV2(180k) ---- GND
  C_ADC(0.1uF): VBAT_SENSE to GND
  VBAT_SENSE = GPIO2
```
