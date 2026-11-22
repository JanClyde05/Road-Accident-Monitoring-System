import React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  Wrench,
} from 'lucide-react';
import { PRESENTATION_BEATS } from '../rams/presentationData';

interface PresentationDockProps {
  activeBeatIndex: number;
  onSelectBeat: (idx: number) => void;
  explodeFactor: number;
  onChangeExplode: (val: number) => void;
  dockCollapsed: boolean;
  onToggleDock: () => void;
  zenMode: boolean;
  onToggleZen: () => void;
  onOpenToolsModal: () => void;
}

export const PresentationDock: React.FC<PresentationDockProps> = ({
  activeBeatIndex,
  onSelectBeat,
  explodeFactor,
  onChangeExplode,
  dockCollapsed,
  onToggleDock,
  zenMode,
  onToggleZen,
  onOpenToolsModal,
}) => {
  const currentBeat = PRESENTATION_BEATS[activeBeatIndex];

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[min(940px,95vw)] pointer-events-auto">
      {/* Compact Collapse / Zen Toggle Strip */}
      <div className="flex items-center gap-2 mb-1.5">
        <button
          type="button"
          onClick={onToggleDock}
          aria-expanded={!dockCollapsed}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0b1018]/92 border border-white/10 text-[11px] font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {dockCollapsed ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          <span>{dockCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleZen}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0b1018]/92 border border-white/10 text-[11px] font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {zenMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{zenMode ? 'Show Slide Text' : '3D Focus'}</span>
        </button>
      </div>

      {/* Main Collapsible Single-Row Dock */}
      {!dockCollapsed && (
        <div className="w-full bg-[#0b1018]/94 border border-white/12 rounded-lg px-2.5 sm:px-3.5 py-2 shadow-2xl flex items-center justify-between gap-2 sm:gap-3">
          {/* Prev / Next Clicker Stepper */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              aria-label="Previous beat"
              disabled={activeBeatIndex === 0}
              onClick={() => onSelectBeat(Math.max(0, activeBeatIndex - 1))}
              className="p-2 rounded-md bg-slate-800/85 hover:bg-slate-700 disabled:opacity-35 text-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Next beat"
              disabled={activeBeatIndex === PRESENTATION_BEATS.length - 1}
              onClick={() =>
                onSelectBeat(Math.min(PRESENTATION_BEATS.length - 1, activeBeatIndex + 1))
              }
              className="p-2 rounded-md bg-slate-800/85 hover:bg-slate-700 disabled:opacity-35 text-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile compact counter vs Desktop 8 beat buttons */}
          <div className="sm:hidden text-xs font-mono-tabular text-slate-200 whitespace-nowrap">
            {currentBeat.indexLabel} / 0{PRESENTATION_BEATS.length}
          </div>

          <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
            {PRESENTATION_BEATS.map((beat, idx) => {
              const active = idx === activeBeatIndex;
              return (
                <button
                  key={beat.id}
                  type="button"
                  onClick={() => onSelectBeat(idx)}
                  aria-label={`Jump to beat ${beat.indexLabel}: ${beat.chapter}`}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-mono-tabular font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  {beat.indexLabel}
                </button>
              );
            })}
          </div>

          {/* Exploded View Slider + Tools Guide */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/10 shrink-0">
            <label
              htmlFor="hardware-explode-slider"
              className="hidden sm:inline text-[11px] font-medium text-slate-400 whitespace-nowrap"
            >
              PCB Explode
            </label>
            <input
              id="hardware-explode-slider"
              aria-label="PCB Explode"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={explodeFactor}
              onChange={(e) => onChangeExplode(parseFloat(e.target.value))}
              className="rams-slider w-16 sm:w-24"
            />
            <button
              type="button"
              onClick={onOpenToolsModal}
              aria-label="Open presenter tools and export guide"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-white/10 text-[11px] font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Tools</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
