// RAMS Wearable PCB - GPIO Pin Map
// Source: SPEC section 7, matching prototype firmware
// Date: 2026-10-13, Rev 0.1
#pragma once

#define PIN_BOOT        0   // BOOT / alarm cancel (strapping pin)
#define PIN_BUZZER      1   // Active buzzer via NPN driver
#define PIN_VBAT_SENSE  2   // Battery voltage divider ADC1
#define PIN_LORA_DIO0   8   // Ra-02 DIO0 interrupt
#define PIN_LORA_RST    9   // Ra-02 RESET
#define PIN_LORA_NSS    10  // Ra-02 NSS chip select
#define PIN_LORA_MOSI   11  // SPI MOSI
#define PIN_LORA_SCK    12  // SPI SCK
#define PIN_LORA_MISO   13  // SPI MISO
#define PIN_USB_DN      19  // USB D-
#define PIN_USB_DP      20  // USB D+
#define PIN_LED         48  // SK6805-EC15 DIN
