import React from 'react';
import { SYSTEM_METRICS, CODE_REVIEW_FINDINGS } from '../data/findingsData';
import { 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface Props {
  onSelectTab: (tab: string) => void;
  onSelectFinding: (id: string) => void;
}

export const ScorecardOverview: React.FC<Props> = ({ onSelectTab, onSelectFinding }) => {
  const criticalCount = CODE_REVIEW_FINDINGS.filter(f => f.severity === 'critical').length;
  const highCount = CODE_REVIEW_FINDINGS.filter(f => f.severity === 'high').length;

  const averageScore = Math.round(
    SYSTEM_METRICS.reduce((acc, m) => acc + m.score, 0) / SYSTEM_METRICS.length
  );

  return (
    <div className="space-y-6" id="overview-section">
      {/* Top Banner Verdict */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-amber-400 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  Engineering Review & Audit Verdict
                </h2>
                <span className="rounded border border-amber-800/80 bg-amber-950/60 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                  Action Required
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-neutral-300 max-w-3xl font-medium">
                The <strong className="text-white">Road Accident Monitoring System (RAMS)</strong> codebase displays an impressive, ambitious architecture connecting embedded IoT edge hardware (ESP32 + MPU-6050 + ATGM336H GPS), 433MHz LoRa wireless bridging, offline queuing, and a modern React dispatch dashboard. However, <strong className="text-white">3 Critical Blockers</strong> (including single-shot LoRa transmissions without retries and non-null-terminated WebSocket parsing) and <strong className="text-white">4 High-Severity Flaws</strong> must be addressed before deployment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('findings')}
              className="inline-flex items-center gap-2 rounded-lg bg-white hover:bg-neutral-200 px-4 py-2 text-xs font-mono font-black uppercase tracking-wider text-neutral-950 shadow-xs transition-colors cursor-pointer"
            >
              <span>Inspect {criticalCount} Critical Fixes</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Tally Chips (8pt Grid Math) */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-neutral-800">
          <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">Overall System Health</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{averageScore}%</span>
              <span className="text-[11px] font-mono font-bold text-amber-400">Grade B-</span>
            </div>
          </div>

          <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block">Critical Blockers</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-rose-400">{criticalCount}</span>
              <span className="text-[11px] font-mono text-neutral-400 font-semibold">Immediate Patch</span>
            </div>
          </div>

          <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">High Risk Issues</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-amber-400">{highCount}</span>
              <span className="text-[11px] font-mono text-neutral-400 font-semibold">Reliability Risks</span>
            </div>
          </div>

          <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">Validated Modules</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-emerald-400">7</span>
              <span className="text-[11px] font-mono text-neutral-400 font-semibold">Production Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subsystem Health Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
            <span>Subsystem Evaluation & Reliability Scorecard</span>
          </h3>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 uppercase">
            7 Subsystems Analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYSTEM_METRICS.map((metric, idx) => {
            const isAlert = metric.status === 'needs-attention';
            const isWarning = metric.status === 'warning';

            return (
              <div 
                key={idx} 
                className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-tight text-white">{metric.category}</span>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isAlert ? 'bg-rose-950/60 text-rose-300 border-rose-800' :
                    isWarning ? 'bg-amber-950/60 text-amber-300 border-amber-800' :
                    'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                  }`}>
                    {metric.score}/100
                  </span>
                </div>

                {/* Score bar */}
                <div className="mt-3 h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/80">
                  <div 
                    className={`h-full rounded-full ${
                      isAlert ? 'bg-rose-500' :
                      isWarning ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-neutral-400 font-medium">
                  {metric.summary}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Priority Action List */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
          <div>
            <h3 className="text-xs font-black uppercase tracking-tight text-white">
              Top 3 Critical Blockers to Resolve Before Competition / Field Testing
            </h3>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
              These issues cause dropped crash packets, device reboots, or false alarms.
            </p>
          </div>
          <button 
            onClick={() => onSelectTab('findings')}
            className="text-xs font-mono font-bold uppercase text-white hover:underline cursor-pointer"
          >
            View All 10 Findings →
          </button>
        </div>

        <div className="divide-y divide-neutral-800/80">
          {CODE_REVIEW_FINDINGS.filter(f => f.severity === 'critical').map(finding => (
            <div key={finding.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded border border-rose-800/80 bg-rose-950/60 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-rose-300">
                    {finding.id}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">{finding.file} ({finding.lineRange})</span>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-tight">
                  {finding.title}
                </h4>
                <p className="text-xs text-neutral-400 max-w-2xl line-clamp-2 font-medium">
                  {finding.technicalImpact}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    onSelectTab('findings');
                    onSelectFinding(finding.id);
                  }}
                  className="rounded-lg border border-neutral-700 bg-neutral-950 hover:bg-neutral-800 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-200 transition-colors cursor-pointer"
                >
                  Inspect Diff & Fix
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Commendations & Strengths */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
        <h3 className="text-xs font-black uppercase tracking-tight text-white flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Major Engineering Strengths in the Codebase</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
            <span className="font-mono text-emerald-400 font-bold block mb-1">Empirical Python FSM Tuning</span>
            <span className="text-neutral-400 leading-relaxed font-medium">
              <code className="text-white">validate_fsm.py</code> allows empirical tuning from real CSV accelerometer data logs rather than relying solely on literature guesswork.
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
            <span className="font-mono text-emerald-400 font-bold block mb-1">Packed Binary Serialization</span>
            <span className="text-neutral-400 leading-relaxed font-medium">
              <code className="text-white">__attribute__((packed))</code> in <code className="text-white">shared/protocol.h</code> ensures deterministic binary serialization without compiler padding overhead.
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex flex-col justify-between">
            <div>
              <span className="font-mono text-emerald-400 font-bold block mb-1">Offline LittleFS Queue</span>
              <span className="text-neutral-400 leading-relaxed font-medium">
                The receiver acknowledges internet dropouts and caches incident JSON files for subsequent retry when Wi-Fi recovers.
              </span>
            </div>
            <button
              onClick={() => onSelectTab('receiver_ui')}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-mono font-bold text-white hover:text-neutral-300 uppercase cursor-pointer"
            >
              <span>Test in Receiver Portal →</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
            <span className="font-mono text-emerald-400 font-bold block mb-1">Direct Google Drive LH3 Thumbnails</span>
            <span className="text-neutral-400 leading-relaxed font-medium">
              <code className="text-white">convertDriveLink()</code> smartly strips Google Drive share URLs into embeddable <code className="text-white">lh3.googleusercontent.com</code> direct image URLs.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

