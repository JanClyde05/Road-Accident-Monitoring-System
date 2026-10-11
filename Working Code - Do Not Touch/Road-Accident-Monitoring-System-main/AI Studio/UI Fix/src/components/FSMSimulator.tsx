import React, { useState, useMemo } from 'react';
import { DEMO_SCENARIOS } from '../data/findingsData';
import { FSMScenario, FSMSample } from '../types';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Sliders, 
  Info,
  Flame,
  Zap
} from 'lucide-react';

export const FSMSimulator: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DEMO_SCENARIOS[0].id);
  const [freefallThreshold, setFreefallThreshold] = useState<number>(0.40);
  const [impactThreshold, setImpactThreshold] = useState<number>(3.00);
  const [stillnessThreshold, setStillnessThreshold] = useState<number>(0.15);
  const [enableGlitchFilter, setEnableGlitchFilter] = useState<boolean>(false);
  const [customNoiseGlitch, setCustomNoiseGlitch] = useState<boolean>(false);

  const scenario = useMemo(() => {
    return DEMO_SCENARIOS.find(s => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];
  }, [selectedScenarioId]);

  // If custom noise glitch is active on the fall scenario, insert a 10ms 0.48g sample inside freefall
  const activeSamples = useMemo(() => {
    if (!customNoiseGlitch || scenario.id !== 'scen-real-fall') return scenario.samples;
    const copied = JSON.parse(JSON.stringify(scenario.samples)) as FSMSample[];
    // Insert a sensor glitch at 460ms (inside freefall)
    copied.splice(4, 0, {
      timeMs: 460,
      aMag: 0.48, // Noise spike exceeding 0.40g threshold
      ay: 0.08,
      gx: 52.0,
      roll: 28.0,
      pitch: 22.0
    });
    return copied;
  }, [scenario, customNoiseGlitch]);

  // Run simulated FSM evaluation on the samples
  const evaluationResult = useMemo(() => {
    let state = 'IDLE';
    let freefallStart: number | null = null;
    let impactDeadline: number | null = null;
    let stillnessStart: number | null = null;
    let peakImpact = 0;
    let alertFired = false;
    let alertType: string | null = null;
    let glitchCount = 0;
    const history: { timeMs: number; state: string; aMag: number; note?: string }[] = [];

    for (let i = 0; i < activeSamples.length; i++) {
      const s = activeSamples[i];
      const now = s.timeMs;

      // 1. Skid check if idle
      if (state === 'IDLE' && Math.abs(s.ay) > 2.0 && Math.abs(s.gx) > 330) {
        // In real code, needs 200ms sustained
        alertFired = true;
        alertType = 'SKID';
        history.push({ timeMs: now, state: 'SKID_DETECTED', aMag: s.aMag, note: 'Sustained lateral & roll rate' });
        break;
      }

      // 2. Direct impact check if idle
      if (state === 'IDLE' && s.aMag > 4.5) {
        alertFired = true;
        alertType = 'DIRECT_IMPACT';
        history.push({ timeMs: now, state: 'DIRECT_IMPACT', aMag: s.aMag, note: 'Single high-g spike' });
        break;
      }

      // 3. Fall FSM
      switch (state) {
        case 'IDLE':
          if (s.aMag < freefallThreshold) {
            state = 'FREEFALL';
            freefallStart = now;
            glitchCount = 0;
            history.push({ timeMs: now, state: 'FREEFALL', aMag: s.aMag, note: 'Dropped below freefall threshold' });
          }
          break;

        case 'FREEFALL':
          if (s.aMag >= freefallThreshold) {
            if (enableGlitchFilter) {
              glitchCount++;
              if (glitchCount > 2) {
                state = 'IDLE';
                freefallStart = null;
                history.push({ timeMs: now, state: 'IDLE', aMag: s.aMag, note: 'Freefall aborted (excess noise)' });
              } else {
                history.push({ timeMs: now, state: 'FREEFALL', aMag: s.aMag, note: 'Glitch tolerated by filter' });
              }
            } else {
              // Current unpatched firmware resets immediately!
              state = 'IDLE';
              freefallStart = null;
              history.push({ timeMs: now, state: 'IDLE', aMag: s.aMag, note: 'RESET TO IDLE (Unpatched firmware glitch bug)' });
            }
          } else if (freefallStart && (now - freefallStart >= 100)) {
            state = 'WAIT_IMPACT';
            impactDeadline = now + 500;
            peakImpact = s.aMag;
            history.push({ timeMs: now, state: 'WAIT_IMPACT', aMag: s.aMag, note: 'Freefall sustained > 100ms' });
          }
          break;

        case 'WAIT_IMPACT':
          if (s.aMag > peakImpact) peakImpact = s.aMag;
          if (s.aMag > impactThreshold) {
            state = 'STILLNESS';
            stillnessStart = now;
            history.push({ timeMs: now, state: 'STILLNESS', aMag: s.aMag, note: `Impact spike detected (${s.aMag.toFixed(2)}g)` });
          } else if (impactDeadline && now > impactDeadline) {
            state = 'IDLE';
            history.push({ timeMs: now, state: 'IDLE', aMag: s.aMag, note: 'Impact window expired' });
          }
          break;

        case 'STILLNESS':
          // If immobility lasts for 2 seconds
          if (stillnessStart && (now - stillnessStart >= 2000)) {
            state = 'CONFIRMED';
            alertFired = true;
            alertType = 'FALL';
            history.push({ timeMs: now, state: 'CONFIRMED', aMag: s.aMag, note: 'Post-impact immobility confirmed alert!' });
          }
          break;
      }

      if (alertFired) break;
    }

    return {
      finalState: state,
      alertFired,
      alertType,
      peakImpact,
      history
    };
  }, [activeSamples, freefallThreshold, impactThreshold, stillnessThreshold, enableGlitchFilter]);

  // Graph coordinate calculations
  const maxTime = Math.max(...activeSamples.map(s => s.timeMs), 3000);
  const maxG = Math.max(...activeSamples.map(s => s.aMag), 6.0);

  const getX = (t: number) => (t / maxTime) * 600 + 40;
  const getY = (g: number) => 220 - (g / maxG) * 190;

  const pointsString = activeSamples.map(s => `${getX(s.timeMs)},${getY(s.aMag)}`).join(' ');

  return (
    <div className="space-y-6" id="simulator-section">
      {/* Title & Instructions */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-neutral-400" />
              <span>Interactive Detection FSM Algorithm Simulator</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              Replays sensor acceleration curves through the <code className="text-neutral-300 font-mono">wearable/detection.cpp</code> state machine. Test false positive rejection, noise sensitivity, and impact threshold tuning.
            </p>
          </div>

          {/* Scenario Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">Scenario:</span>
            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white focus:outline-none cursor-pointer"
            >
              {DEMO_SCENARIOS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-3.5 text-xs leading-relaxed text-neutral-300 bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-medium">
          <strong className="text-white uppercase font-mono tracking-wider text-[11px]">Scenario Description:</strong> {scenario.description}
        </p>
      </div>

      {/* Main Grid: Controls + Interactive Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sliders & Bug Toggle */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-neutral-400" />
              <span>Algorithm Parameters</span>
            </h3>
            <button
              onClick={() => {
                setFreefallThreshold(0.40);
                setImpactThreshold(3.00);
                setStillnessThreshold(0.15);
                setEnableGlitchFilter(false);
                setCustomNoiseGlitch(false);
              }}
              className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Freefall Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 uppercase tracking-wider text-[11px]">Freefall Threshold</span>
              <span className="font-bold text-white">{freefallThreshold.toFixed(2)}g</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.05"
              value={freefallThreshold}
              onChange={(e) => setFreefallThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="text-[10px] font-mono text-neutral-500 block">Default config.h: 0.40g</span>
          </div>

          {/* Impact Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 uppercase tracking-wider text-[11px]">Impact Threshold</span>
              <span className="font-bold text-white">{impactThreshold.toFixed(2)}g</span>
            </div>
            <input
              type="range"
              min="1.50"
              max="6.00"
              step="0.10"
              value={impactThreshold}
              onChange={(e) => setImpactThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="text-[10px] font-mono text-neutral-500 block">Default config.h: 3.00g</span>
          </div>

          {/* Stillness Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 uppercase tracking-wider text-[11px]">Stillness σ Threshold</span>
              <span className="font-bold text-white">{stillnessThreshold.toFixed(2)}g</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.01"
              value={stillnessThreshold}
              onChange={(e) => setStillnessThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="text-[10px] font-mono text-neutral-500 block">Default config.h: 0.15g</span>
          </div>

          {/* Interactive Bug Demonstration Toggles */}
          <div className="pt-3 border-t border-neutral-800 space-y-2.5">
            <h4 className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Bug Injection & Fix Comparison
            </h4>

            {scenario.id === 'scen-real-fall' && (
              <label className="flex items-start gap-2.5 text-xs text-neutral-300 cursor-pointer p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <input
                  type="checkbox"
                  checked={customNoiseGlitch}
                  onChange={(e) => setCustomNoiseGlitch(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-0"
                />
                <div>
                  <span className="font-mono font-bold text-amber-300 block text-[11px] uppercase tracking-wider">Inject 10ms Vibration Noise (0.48g)</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5 font-medium">Simulates real-world tumble noise during freefall phase.</span>
                </div>
              </label>
            )}

            <label className="flex items-start gap-2.5 text-xs text-neutral-300 cursor-pointer p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <input
                type="checkbox"
                checked={enableGlitchFilter}
                onChange={(e) => setEnableGlitchFilter(e.target.checked)}
                className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-0"
              />
              <div>
                <span className="font-mono font-bold text-emerald-300 block text-[11px] uppercase tracking-wider">Apply Glitch Filter Patch</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5 font-medium">Tolerates up to 2 isolated vibration spikes without resetting to IDLE.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Center & Right Columns: SVG Waveform & FSM State Machine Output */}
        <div className="lg:col-span-2 space-y-4">
          {/* Waveform Card */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Simulated Accelerometer Trace (|A|)
                </span>
                <span className="text-[10px] bg-neutral-950 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">
                  MPU-6050 @ 100Hz
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span>
                  <span>Impact ({impactThreshold.toFixed(1)}g)</span>
                </span>
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="w-2.5 h-0.5 bg-sky-500 inline-block"></span>
                  <span>Freefall ({freefallThreshold.toFixed(2)}g)</span>
                </span>
              </div>
            </div>

            {/* SVG Plot */}
            <div className="w-full overflow-x-auto bg-[#09090b] rounded-lg p-2 border border-neutral-800">
              <svg viewBox="0 0 660 250" className="w-full h-48 select-none">
                {/* Grid Lines */}
                <line x1="40" y1="30" x2="640" y2="30" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="40" y1="80" x2="640" y2="80" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="40" y1="130" x2="640" y2="130" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="40" y1="180" x2="640" y2="180" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="40" y1="220" x2="640" y2="220" stroke="#3f3f46" />

                {/* Y-Axis Labels */}
                <text x="32" y="35" fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">5.0g</text>
                <text x="32" y="85" fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">3.5g</text>
                <text x="32" y="135" fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">2.0g</text>
                <text x="32" y="185" fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">1.0g</text>
                <text x="32" y="224" fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">0g</text>

                {/* Impact Threshold Line */}
                <line 
                  x1="40" 
                  y1={getY(impactThreshold)} 
                  x2="640" 
                  y2={getY(impactThreshold)} 
                  stroke="#f43f5e" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4" 
                />

                {/* Freefall Threshold Line */}
                <line 
                  x1="40" 
                  y1={getY(freefallThreshold)} 
                  x2="640" 
                  y2={getY(freefallThreshold)} 
                  stroke="#38bdf8" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4" 
                />

                {/* Accelerometer Magnitude Curve */}
                <polyline
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  points={pointsString}
                />

                {/* Data Points */}
                {activeSamples.map((s, i) => (
                  <circle
                    key={i}
                    cx={getX(s.timeMs)}
                    cy={getY(s.aMag)}
                    r="3"
                    fill="#34d399"
                    stroke="#09090b"
                    strokeWidth="1"
                  />
                ))}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2 font-mono">
              <span>Time: 0 ms</span>
              <span>1000 ms</span>
              <span>2000 ms</span>
              <span>{maxTime} ms</span>
            </div>
          </div>

          {/* FSM Verdict Box */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Detection Result</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {evaluationResult.alertFired ? (
                    <span className="flex items-center gap-1.5 font-mono font-bold text-sm text-rose-400 uppercase tracking-wider">
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                      ALERT FIRED: {evaluationResult.alertType}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 font-mono font-bold text-sm text-emerald-400 uppercase tracking-wider">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      NO ALERT (FSM Idle / Suppressed)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-400">Final State:</span>
                <span className="font-mono text-xs font-bold bg-neutral-950 border border-neutral-800 px-2 py-1 rounded text-white">
                  {evaluationResult.finalState}
                </span>
              </div>
            </div>

            {/* FSM Execution Trace Log */}
            <div className="mt-4 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">FSM State Transition Log:</span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2 font-mono text-xs">
                {evaluationResult.history.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 bg-neutral-950 p-1.5 rounded border border-neutral-800">
                    <span className="text-neutral-500 shrink-0">{h.timeMs.toString().padStart(4, '0')}ms</span>
                    <span className="font-bold text-white shrink-0">[{h.state}]</span>
                    <span className="text-neutral-300">{h.note} (aMag={h.aMag.toFixed(2)}g)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Commentary */}
            {customNoiseGlitch && !enableGlitchFilter && scenario.id === 'scen-real-fall' && (
              <div className="mt-3 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-200 flex items-start gap-2 font-mono">
                <Flame className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="uppercase">Glitch Bug Confirmed!</strong> A single 10ms sensor noise reading (0.48g) during the freefall phase aborted the entire state machine back to <code className="text-white">FS_IDLE</code>. The real 4.8g crash impact was completely ignored. Enable "Apply Glitch Filter Patch" to test fix.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
