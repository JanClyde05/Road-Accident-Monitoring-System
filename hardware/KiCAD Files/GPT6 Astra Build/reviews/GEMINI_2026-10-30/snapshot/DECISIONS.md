# User decisions recorded 2026-10-30

## Confirmed by user

| Item | Decision | Impact |
|---|---|---|
| WS2812B package | 5050 SMD (standard) | Use LED_WS2812B_PLCC4_5.0x5.0mm footprint. May not work reliably at 3.3V unless V6 revision. Will proceed and test. |
| Board size | Minimize as small as possible | Target 42x32mm; grow only if EPDC routing rules force it |
| USB-C connector | TYPE-C-31-M-12, must fit EPDC | Convert 0.60mm oval shell slots to 1.0mm round holes for EPDC compliance |
| EPDC castellation | User unsure | **Open: must ask EPDC directly** whether they can assemble WROOM-1 castellated pads. If not, user hand-solders the module. |
| Solder mask | Black board, white silkscreen | EPDC offers black mask (subject to availability) |

## USB-C slot resolution

The TYPE-C-31-M-12 has 4 shell mounting tabs with 0.60mm x 1.2-1.7mm oval slots. EPDC minimum slot is 1.0mm.

**Solution:** Replace oval slots with 1.0mm round plated holes. The shell mounting tabs are wider metallic stakes that will still insert into round 1.0mm holes and provide adequate mechanical anchoring when soldered. The 0.65mm alignment peg holes (NPTH) are above EPDC's 0.40mm minimum and can stay as-is.

This requires a modified USB-C footprint in the local library.
