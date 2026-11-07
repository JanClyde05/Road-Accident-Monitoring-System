import React, { useState } from 'react';
import { CODE_REVIEW_FINDINGS } from '../data/findingsData';
import { CodeReviewFinding, SeverityLevel, SubsystemCategory } from '../types';
import { 
  AlertCircle, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  ExternalLink,
  ShieldAlert,
  Flame,
  Wrench,
  Sparkles
} from 'lucide-react';

interface Props {
  selectedFindingId?: string;
  onSelectFinding: (id: string) => void;
}

export const AuditFindingsList: React.FC<Props> = ({ selectedFindingId, onSelectFinding }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [subsystemFilter, setSubsystemFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFindings = CODE_REVIEW_FINDINGS.filter(f => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (subsystemFilter !== 'all' && f.subsystem !== subsystemFilter) return false;
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return <span className="rounded border border-rose-800/80 bg-rose-950/60 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1"><Flame className="w-3 h-3" /> CRITICAL</span>;
      case 'high':
        return <span className="rounded border border-amber-800/80 bg-amber-950/60 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> HIGH</span>;
      case 'medium':
        return <span className="rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> MEDIUM</span>;
      case 'optimization':
        return <span className="rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1"><Sparkles className="w-3 h-3" /> OPTIMIZATION</span>;
      default:
        return <span className="rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">INFO</span>;
    }
  };

  return (
    <div className="space-y-6" id="findings-section">
      {/* Header & Filter Bar */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Wrench className="h-4 w-4 text-neutral-400" />
              <span>Full Codebase Audit Findings & Fixes</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              Deep inspection of C++ embedded firmware, LoRa protocol headers, LittleFS storage, and serverless ingestion.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mr-1">
              <Filter className="h-3 w-3" />
              <span>Filter:</span>
            </div>

            {/* Severity filter buttons */}
            <div className="flex rounded-lg bg-neutral-950 p-1 border border-neutral-800 text-xs font-mono">
              {(['all', 'critical', 'high', 'medium', 'optimization'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    severityFilter === sev
                      ? 'bg-white text-neutral-950 shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Subsystem filter select */}
            <select
              value={subsystemFilter}
              onChange={(e) => setSubsystemFilter(e.target.value)}
              className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 hover:border-neutral-700 focus:outline-none"
            >
              <option value="all">All Subsystems</option>
              <option value="firmware">Wearable Firmware</option>
              <option value="protocol">LoRa Protocol</option>
              <option value="receiver">Receiver Gateway</option>
              <option value="backend">Cloud Backend</option>
              <option value="hardware">Sensor & Hardware</option>
            </select>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between text-xs font-mono text-neutral-400 pt-3 border-t border-neutral-800">
          <span>Showing <strong className="text-white">{filteredFindings.length}</strong> of <strong className="text-white">{CODE_REVIEW_FINDINGS.length}</strong> audited findings</span>
          <span className="text-neutral-500">repo: JanClyde05/Road-Accident-Monitoring-System</span>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.map((finding) => {
          const isExpanded = selectedFindingId === finding.id;

          return (
            <div
              key={finding.id}
              id={`card-${finding.id}`}
              className={`rounded-xl border transition-all ${
                isExpanded 
                  ? 'border-neutral-600 bg-neutral-900 shadow-sm' 
                  : 'border-neutral-800 bg-neutral-900/90 hover:border-neutral-700'
              }`}
            >
              {/* Card Header (clickable accordion) */}
              <div 
                onClick={() => onSelectFinding(isExpanded ? '' : finding.id)}
                className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-neutral-300 bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded">
                      {finding.id}
                    </span>
                    {getSeverityBadge(finding.severity)}
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300 bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded">
                      {finding.subsystemName}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {finding.file}:{finding.lineRange}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                    {finding.title}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-2 font-medium">
                    {finding.problemSummary}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px] justify-end">
                    {finding.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="rounded bg-neutral-950 border border-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400 font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <div className="rounded p-1.5 text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="border-t border-neutral-800 p-4 sm:p-5 space-y-4 bg-neutral-950/60 rounded-b-xl">
                  {/* Real World Impact Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3.5">
                      <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block mb-1">
                        Technical Root Cause & Impact
                      </span>
                      <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                        {finding.technicalImpact}
                      </p>
                    </div>

                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3.5">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1">
                        Real-World Road Scenario
                      </span>
                      <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                        {finding.realWorldScenario}
                      </p>
                    </div>
                  </div>

                  {/* Side by Side Code Diff: Problem vs Solution */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                        Source Code Analysis & Surgical Patch
                      </h4>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {finding.file}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                      {/* Problem Code Block */}
                      <div className="rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden">
                        <div className="flex items-center justify-between bg-neutral-900 px-3 py-2 border-b border-neutral-800">
                          <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5 uppercase">
                            <Flame className="w-3 h-3 text-rose-500" />
                            Current Code ({finding.lineRange})
                          </span>
                        </div>
                        <pre className="p-3 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed max-h-80">
                          <code>{finding.problemCode}</code>
                        </pre>
                      </div>

                      {/* Solution Code Block */}
                      <div className="rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden">
                        <div className="flex items-center justify-between bg-neutral-900 px-3 py-2 border-b border-neutral-800">
                          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                            <Check className="w-3 h-3 text-emerald-500" />
                            Recommended Engineering Fix
                          </span>
                          <button
                            onClick={() => handleCopy(finding.id, finding.solutionCode)}
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-200 hover:text-white cursor-pointer bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded transition-colors"
                          >
                            {copiedId === finding.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-neutral-400" />
                                <span>Copy Fix</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-80">
                          <code>{finding.solutionCode}</code>
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-neutral-500 mr-1 uppercase font-bold">Categories:</span>
                    {finding.tags.map((tag, idx) => (
                      <span key={idx} className="rounded bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

