# J2 battery and RGB profile verification

Refreshed 2026-11-12, Asia/Manila, after detecting the newer 3.55 V battery-percentage
endpoint. The current firmware was preserved. Previous logs/manifests are retained
in `../../verification/firmware_pre_refresh_20261112_025503/firmware_j2/`.

Both complete wearable firmware builds passed with Arduino CLI 1.1.1 and
Arduino-ESP32 3.3.5. No flashing was performed. Exact CLI argument arrays, all
firmware source SHA-256 hashes and generated binary hashes are recorded in
`build_summary.json`; its final `sources_unchanged` check passed.

Reproduce from the repository root:

```powershell
python validation/test_battery_profiles.py --cxx 'D:/CLion 2025.2.1/bin/mingw/bin/g++.exe'
python validation/test_neopixel_j2.py --cxx 'D:/CLion 2025.2.1/bin/mingw/bin/g++.exe'
python 'hardware/KiCAD Files/GPT6 Astra Build/RAMS Wearable/scripts/verify_firmware.py'
```

The target checks use ESP32-S3, 4 MB flash, default 4 MB partition table, hardware
USB CDC enabled and PSRAM disabled. J2 adds `compiler.cpp.extra_flags=-DRAMS_JLC_S3_J2`;
Supermini leaves that property empty. The script uses a separate CLI config pointing
to the installed board package and existing sketch libraries; it does not edit IDE
settings. Build binaries are in the temporary directories named in the manifest.

J2 uses 668355 bytes of flash; Supermini uses 667351 bytes. Both use 33496 bytes
of globals and both target builds exit 0.
Existing warnings concern deprecated ArduinoJson `DynamicJsonDocument`, BLE2902,
and the LoRa library's legacy binary constants. The verified logs contain the exact
warnings and library versions. Battery code produces no compiler warnings.

The host test compiles and executes the actual `battery.cpp` twice with fake ADC
inputs. It verifies J2's calibrated 750/900/1050 mV conversion to 3.0/3.6/4.2 V,
16-sample averaging, initialization order, percentage bounds, five-second update
cadence and existing EMA. It also checks the Supermini raw conversion. Current
percentage checks include 3.60 V mapping to 7%, 3.88 V to 50%, and 3.548 V to 0%,
under the preserved 3.55 V endpoint. That endpoint is a display setting, not a
measured regulator floor or an automatic cell cutoff.
Both cases passed; see `host_tests.log`.

The first invocation, preserved in `jlc_s3_j2_build.log`, failed because an
unnecessary extra include path was quoted incorrectly; the user's IDE config also
contained invalid package-index URLs. The final `*_verified_build.log` files use
correct arguments and isolated configuration. These earlier setup errors are not
firmware failures.

Firmware scope: `battery.h`, `battery.cpp` and a J2-only sender in `neopixel.cpp`,
plus the subsystem README and tests. No packet format, radio, BLE service or buzzer
behavior was changed. GPIO2 is the only ADC channel currently used; the J2 initialization
accounts for Arduino-ESP32 3.3.5's global attenuation-based calibration and the
requirement to attach a channel before configuring per-pin attenuation.

These tests establish calculation behavior and compilation, not hardware accuracy.
After assembly, compare reported voltage against a meter at 3.0, 3.6 and 4.2 V,
and verify power-off isolation/transients. RGB part compatibility remains a separate
pending hardware decision. PSRAM-enabled operation was not exercised.

The final build manifest includes the RGB sender (neopixel.cpp SHA256
`c44a6e7d833cb6df28135b8cbc2803919f7b029d0cd3c5cc4019407ecc07a318`).
All 19 recorded firmware source hashes were rechecked on 2026-11-12 and match.
Both final target builds exit 0. The actual-source RGB host tests also pass for
both profiles: J2 sends GRB bits at 10MHz using 300/1000ns zero, 700/600ns one,
and 300us low reset; Supermini retains the library sender. Tests include bit
order, frame durations, reset, initialization and failure handling. These meet
the checked Worldsemi 2020 V1.3/V6 timing tables; measure DIN after the translator
on the assembled board. No firmware was flashed and no waveform was measured.

The refreshed battery.cpp SHA256 is
`45db64eb190ccd01de7bc4f21f24e900df82dd16c97ed5cd00489169e7a8e222`;
battery.h SHA256 is
`c48552d03dc269882605699ff30debfc7d122aca112881f2bedef5a1a6df6339`.
Both actual-source host suites passed with GCC 13.1.0, with the battery and RGB
outputs in `host_tests.log` and `neopixel_host_tests.log`. This refresh did not
change firmware, tests, pin assignments or protocol behavior.
