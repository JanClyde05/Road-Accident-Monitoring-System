# RAMS Rev B — engineering work in progress

This separate project is being corrected for the user's purchased parts. **Do not fabricate from this directory yet.** The original ordered board and JLCPCB_ORDER_PACKAGE remain unchanged.

Confirmed by the user on 30 October 2026:

- ANT1: Johanson 2450AT18B100E, two-terminal 3216 ceramic antenna.
- Q3: FS8205A / 8205A, SOT-23-6, bought from Shopee. The exact manufacturer remains unknown; the working pinout follows FuxinSemi C908265.
- LED: WS2812B RGB, replacing the original SK6805-EC20. Physical package/module form and silicon revision are awaiting confirmation. The old LED footprint is a temporary placeholder and must not be assembled.

Implemented draft corrections include the missing ESP32 VDDA supply, six-pad Q3 footprint and corrected protection gates, DW01A pin 4 NC, B100 antenna feed/NC assignment, GPIO48 LED data, and a regenerated readable schematic. Routing, ground stitching, and physical checks are ongoing. The first regenerated schematic passed ERC with zero errors/warnings; that alone does not validate the PCB.

The existing parts cannot automatically guarantee a working WS2812B at 3.3 V. [Worldsemi's V6 revision notice](https://www.world-semi.com/web/index.php?classid=22&id=587&lanstr=en&topclassid=19) explicitly adds 3.3 V operation. [The older manufacturer datasheet](https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf) specifies a higher supply and different logic-high requirement. Identify the purchased version before finalizing its supply circuit; do not treat every WS2812B as interchangeable.

Other checks required before fabrication: physical package matches for the Shopee parts; battery charge-current compatibility (nominal 250 mA with 4.02 kΩ PROG resistor); radio feed/ground geometry and matching; complete DRC and schematic/PCB parity; assembly drawing review. Hardware startup, range, thermal behavior, and battery protection will require bench tests after assembly.

Scripts are revision-local and use the installed KiCad 10 and Freerouting tools. `prepare_revision.py` rebuilds from the original board and will overwrite routing changes in this draft; do not rerun it casually. `rebuild_schematic.py` rebuilds from the recorded component map. Files in `review/` are engineering evidence, not an order package. No fabrication ZIP has been released.
