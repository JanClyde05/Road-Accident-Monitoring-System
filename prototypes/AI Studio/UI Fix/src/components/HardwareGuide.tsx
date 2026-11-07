import React from 'react';
import { Cpu, Radio, Battery, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const HardwareGuide: React.FC = () => {
  return (
    <div className="space-y-6" id="hardware-section">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs">
        <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Cpu className="h-4 w-4 text-neutral-400" />
          <span>Hardware Architecture & Field Deployment Guide</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1 font-medium">
          Hardware wiring specifications, RF antenna math, accelerometer range calibration, and power circuit recommendations for road testing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ESP32 Pinout & Bus Mapping */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Cpu className="h-4 w-4 text-neutral-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">ESP32 Microcontroller Pin Mapping</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase text-[10px]">
                  <th className="pb-2">Peripheral</th>
                  <th className="pb-2">Interface</th>
                  <th className="pb-2">ESP32 Pin</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                <tr>
                  <td className="py-2.5 font-bold text-white">MPU-6050 IMU</td>
                  <td className="py-2.5 text-neutral-400">I2C (Wire)</td>
                  <td className="py-2.5 text-neutral-300">SDA: GPIO 4, SCL: GPIO 5</td>
                  <td className="py-2.5 text-emerald-400">Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">ATGM336H GPS</td>
                  <td className="py-2.5 text-neutral-400">UART1</td>
                  <td className="py-2.5 text-neutral-300">RX: GPIO 8, TX: GPIO 9</td>
                  <td className="py-2.5 text-emerald-400">Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">SX1278 LoRa</td>
                  <td className="py-2.5 text-neutral-400">SPI (FSPI)</td>
                  <td className="py-2.5 text-neutral-300">SCK: 12, MISO: 13, MOSI: 11, CS: 10</td>
                  <td className="py-2.5 text-emerald-400">Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">LoRa Control</td>
                  <td className="py-2.5 text-neutral-400">GPIO</td>
                  <td className="py-2.5 text-neutral-300">RST: GPIO 14, DIO0: GPIO 21</td>
                  <td className="py-2.5 text-emerald-400">Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">NeoPixel RGB</td>
                  <td className="py-2.5 text-neutral-400">RMT</td>
                  <td className="py-2.5 text-neutral-300">DIN: GPIO 48</td>
                  <td className="py-2.5 text-emerald-400">Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Buzzer & Button</td>
                  <td className="py-2.5 text-neutral-400">GPIO</td>
                  <td className="py-2.5 text-neutral-300">BZR: GPIO 7, BTN: GPIO 6</td>
                  <td className="py-2.5 text-emerald-400">Verified</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-300 font-mono">
            <strong className="text-white uppercase tracking-wider text-[10px] block mb-0.5">Pin Safety Note:</strong>
            GPIO 0, 2, 12, 15 on ESP32 are strapping pins. The current pinout avoids conflicting strapping lines, ensuring reliable booting across all battery charge states.
          </div>
        </div>

        {/* MPU-6050 Range Saturation & Calibration */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Zap className="h-4 w-4 text-neutral-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Accelerometer Range Saturation Fix</h3>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed font-medium">
            The default hardware scale for MPU-6050 upon wake-up is <strong className="text-white">±2g</strong>. Because vehicular crash events generate peak deceleration of <strong className="text-white">3.0g to 8.0g</strong>, the sensor clips at 2.0g unless register <code className="text-white font-mono">0x1C (ACCEL_CONFIG)</code> is programmed.
          </p>

          <div className="rounded-lg bg-[#09090b] border border-neutral-800 text-neutral-300 p-3 font-mono text-xs space-y-1">
            <div className="text-neutral-500">// Configure ±8g (4,096 LSB/g)</div>
            <div>Wire.beginTransmission(0x68);</div>
            <div>Wire.write(0x1C); <span className="text-neutral-500">// ACCEL_CONFIG</span></div>
            <div>Wire.write(0x10); <span className="text-emerald-400">// 0x10 = ±8g scale</span></div>
            <div>Wire.endTransmission(true);</div>
          </div>

          <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-300 flex items-start gap-2 font-mono">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 uppercase tracking-wider text-[10px] block mb-0.5">Scale Factor:</strong>
              When ±8g is chosen, raw 16-bit integer ADC values must be divided by <code>4096.0f</code> (not <code>16384.0f</code>) to yield true acceleration in g's.
            </div>
          </div>
        </div>

        {/* 433MHz Antenna & RF Propagation */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Radio className="h-4 w-4 text-neutral-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">433MHz LoRa RF & Antenna Tuning</h3>
          </div>

          <div className="space-y-3 text-xs text-neutral-300">
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-1 font-mono">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Quarter-Wave Whip Antenna Length Math:</span>
              <div className="text-white font-bold text-xs py-1">
                L = c / (4 × f) = 299,792,458 / (4 × 433,000,000) = 17.30 cm (6.81 inches)
              </div>
              <p className="text-[11px] text-neutral-400 font-sans font-medium">
                Using wire shorter than 17.3cm or small coiled spring antennas without a ground plane significantly degrades link margin down from 3 km to under 400 meters.
              </p>
            </div>

            <div className="space-y-1 font-mono">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Spreading Factor (SF) Optimization:</span>
              <p className="text-xs text-neutral-400 font-sans font-medium">
                The current code uses <code className="font-mono text-white">SF9, BW 125kHz, CR 4/5</code> (~120ms airtime). This provides an ideal compromise between link budget (-131 dBm sensitivity) and airtime collision vulnerability.
              </p>
            </div>
          </div>
        </div>

        {/* Battery Power & ADC Monitoring */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Battery className="h-4 w-4 text-neutral-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">LiPo Battery ADC Divider Circuit</h3>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed font-medium">
            In <code className="text-white font-mono">wearable/sensors.cpp</code>, <code className="text-white font-mono">_readBattery()</code> currently returns 0. To monitor a 3.7V nominal LiPo battery (4.2V fully charged) using ESP32 3.3V ADC inputs:
          </p>

          <div className="p-3 bg-[#09090b] rounded-lg border border-neutral-800 text-xs font-mono space-y-1 text-neutral-300">
            <div>[BAT+] ──┬── [ 100kΩ ] ──┬── [ ESP32 ADC1 GPIO 1 ]</div>
            <div>             │               │</div>
            <div>         [100nF Cap]     [ 100kΩ ]</div>
            <div>             │               │</div>
            <div>           [GND]           [GND]</div>
          </div>

          <p className="text-xs text-neutral-400 font-medium">
            A 1:2 divider halves 4.2V to 2.1V, safely inside the ESP32 ADC range. The 100nF capacitor filters motor electrical noise.
          </p>
        </div>
      </div>
    </div>
  );
};
