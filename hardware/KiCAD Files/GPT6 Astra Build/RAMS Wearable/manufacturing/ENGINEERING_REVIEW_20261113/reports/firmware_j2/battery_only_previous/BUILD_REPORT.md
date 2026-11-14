# Battery profile verification — 2026-11-09

Both complete wearable firmware builds passed with Arduino CLI 1.1.1 and
Arduino-ESP32 3.3.5. No flashing was performed. Exact CLI argument arrays, all
firmware source SHA-256 hashes and generated binary hashes are recorded in
`build_summary.json`; its final `sources_unchanged` check passed.

Reproduce from the repository root:

```powershell
python validation/test_battery_profiles.py --cxx 'D:/CLion 2025.2.1/bin/mingw/bin/g++.exe'
python 'hardware/KiCAD Files/GPT6 Astra Build/RAMS Wearable/scripts/verify_firmware.py'
```

The target checks use ESP32-S3, 4 MB flash, default 4 MB partition table, hardware
USB CDC enabled and PSRAM disabled. J2 adds `compiler.cpp.extra_flags=-DRAMS_JLC_S3_J2`;
Supermini leaves that property empty. The script uses a separate CLI config pointing
to the installed board package and existing sketch libraries; it does not edit IDE
settings. Build binaries are in the temporary directories named in the manifest.

J2 uses 667971 bytes of flash; Supermini uses 667347 bytes. Both use 33496 bytes
of globals and both target builds exit 0.
Existing warnings concern deprecated ArduinoJson `DynamicJsonDocument`, BLE2902,
and the LoRa library's legacy binary constants. The verified logs contain the exact
warnings and library versions. Battery code produces no compiler warnings.

The host test compiles and executes the actual `battery.cpp` twice with fake ADC
inputs. It verifies J2's calibrated 750/900/1050 mV conversion to 3.0/3.6/4.2 V,
16-sample averaging, initialization order, percentage bounds, five-second update
cadence and existing EMA. It also checks the unchanged Supermini raw conversion.
Both cases passed; see `host_tests.log`.

The first invocation, preserved in `jlc_s3_j2_build.log`, failed because an
unnecessary extra include path was quoted incorrectly; the user's IDE config also
contained invalid package-index URLs. The final `*_verified_build.log` files use
correct arguments and isolated configuration. These earlier setup errors are not
firmware failures.

Firmware scope: only `battery.h` and `battery.cpp` behavior changes, plus the
subsystem README and test. No packet format, radio, BLE service, RGB or buzzer code
was changed. GPIO2 is the only ADC channel currently used; the J2 initialization
accounts for Arduino-ESP32 3.3.5's global attenuation-based calibration and the
requirement to attach a channel before configuring per-pin attenuation.

These tests establish calculation behavior and compilation, not hardware accuracy.
After assembly, compare reported voltage against a meter at 3.0, 3.6 and 4.2 V,
and verify power-off isolation/transients. RGB part compatibility remains a separate
pending hardware decision. PSRAM-enabled operation was not exercised.
