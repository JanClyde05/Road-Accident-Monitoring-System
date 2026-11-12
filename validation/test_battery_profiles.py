"""Compile and exercise the actual battery.cpp with fake ADC samples; no hardware IO."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
STUB = r'''
#pragma once
#include <cassert>
#include <cstdint>
#include <cstdio>
#define INPUT 1
enum adc_attenuation_t { ADC_2_5db, ADC_11db };
inline uint32_t nowMs = 0;
inline unsigned rawReads = 0, mvReads = 0, waits = 0, pinAttenuations = 0;
inline unsigned sample = 0;
inline bool attached = false;
inline adc_attenuation_t globalAttenuation = ADC_11db;
inline void pinMode(int pin, int mode) { assert(pin == 2 && mode == INPUT); }
inline void analogSetAttenuation(adc_attenuation_t a) { globalAttenuation = a; }
inline void analogSetPinAttenuation(int pin, adc_attenuation_t a) {
  assert(pin == 2 && attached && a == ADC_2_5db && globalAttenuation == a);
  ++pinAttenuations;
}
inline void analogReadResolution(int bits) { assert(bits == 12); }
inline uint16_t analogRead(int pin) {
  assert(pin == 2); attached = true; ++rawReads; return sample;
}
inline uint32_t analogReadMilliVolts(int pin) {
  assert(pin == 2 && attached && globalAttenuation == ADC_2_5db);
  assert(pinAttenuations > 0);
  return sample + ((++mvReads % 2) ? -10 : 10);
}
inline void delayMicroseconds(int us) { assert(us == 100); ++waits; }
inline uint32_t millis() { return nowMs; }
struct FakeSerial { template<class... T> void printf(const char*, T...) {} };
inline FakeSerial Serial;
'''
TEST = r'''
#include <cmath>
#include "battery.cpp"
static void closeTo(float actual, float expected) {
  assert(std::fabs(actual - expected) < 0.00001f);
}
int main() {
#ifdef RAMS_JLC_S3_J2
  sample = 1050; // Alternating 1040/1060 mV must average to a 4.20 V cell.
  batteryInit();
  closeTo(batteryGetVoltage(), 4.20f);
  assert(batteryGetPercent() == 100);
  assert(mvReads == 16 && rawReads == 1 && waits == 16);
  sample = 750;
  batteryInit();
  closeTo(batteryGetVoltage(), 3.00f);
  assert(batteryGetPercent() == 0);
  sample = 900;
  batteryInit();
  closeTo(batteryGetVoltage(), 3.60f);
  // 3.60 V is just above the 3.55 V regulator floor, so the window is
  // (3.60 - 3.55) / (4.20 - 3.55) = 7.7 % -> 7 %.
  assert(batteryGetPercent() == 7);
  const unsigned before = mvReads;
  sample = 1050;
  nowMs = 4999;
  batteryUpdate();
  assert(mvReads == before);
  nowMs = 5000;
  batteryUpdate();
  assert(mvReads == before + 16);
  closeTo(batteryGetVoltage(), 3.69f); // Existing 0.15 EMA and 5 s cadence.
  sample = 1200;
  batteryInit();
  assert(batteryGetPercent() == 100);
  sample = 970; // 3.88 V, middle of the usable window: (3.88-3.55)/0.65 = 50.7 %
  batteryInit();
  closeTo(batteryGetVoltage(), 3.88f);
  assert(batteryGetPercent() == 50);
  sample = 887; // 3.548 V, below the regulator floor
  batteryInit();
  assert(batteryGetPercent() == 0 && batteryGetVoltage() > 0.0f);
#else
  sample = 2606;
  batteryInit();
  closeTo(batteryGetVoltage(), (2606.0f / 4095.0f) * 3.3f * 2.0f);
  assert(batteryGetPercent() == 100);
  assert(rawReads == 16 && mvReads == 0 && waits == 16);
  assert(pinAttenuations == 0 && globalAttenuation == ADC_11db);
  sample = 0;
  batteryInit();
  assert(batteryGetVoltage() == 0 && batteryGetPercent() == 0);
#endif
}
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cxx", default=os.environ.get("CXX", shutil.which("g++")))
    args = parser.parse_args()
    if not args.cxx:
        parser.error("provide --cxx with an installed native C++17 compiler")
    compiler = Path(args.cxx).resolve()
    env = dict(os.environ)
    env["PATH"] = str(compiler.parent) + os.pathsep + env.get("PATH", "")
    with tempfile.TemporaryDirectory(prefix="rams_battery_test_") as temp:
        folder = Path(temp)
        (folder / "Arduino.h").write_text(STUB, encoding="utf-8")
        (folder / "test.cpp").write_text(TEST, encoding="utf-8")
        for profile in ("supermini", "jlc_s3_j2"):
            output = folder / (profile + ".exe")
            cmd = [str(compiler), "-std=c++17", "-Wall", "-Wextra", "-Werror",
                   "-I", str(folder), "-I", str(ROOT / "firmware/wearable_withApp"),
                   str(folder / "test.cpp"), "-o", str(output)]
            if profile == "jlc_s3_j2":
                cmd.append("-DRAMS_JLC_S3_J2")
            subprocess.run(cmd, check=True, env=env)
            subprocess.run([str(output)], check=True, env=env)
            print(f"PASS {profile}: actual battery.cpp, sample units, averaging and calibration")


if __name__ == "__main__":
    main()
