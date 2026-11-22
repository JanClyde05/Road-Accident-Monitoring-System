import React from 'react';

interface TopBarProps {
  onSelectBeat: (beatIndex: number) => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  zenMode: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSelectBeat,
  isAutoPlaying,
  onToggleAutoPlay,
  zenMode,
}) => {
  if (zenMode) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-8 px-6 sm:px-12 py-3.5 bg-[#05070b]/82 border-b border-white/10">
      {/* Zone 1: Single-element Brand Wordmark */}
      <button
        type="button"
        onClick={() => onSelectBeat(0)}
        className="font-display text-lg font-bold tracking-tight text-slate-50 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        RAMS
      </button>

      {/* Zone 2: 4 concise single-line text links */}
      <nav
        aria-label="Presentation Sections"
        className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300"
      >
        <button
          type="button"
          onClick={() => onSelectBeat(1)}
          className="hover:text-white underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Problem
        </button>
        <button
          type="button"
          onClick={() => onSelectBeat(3)}
          className="hover:text-white underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Hardware
        </button>
        <button
          type="button"
          onClick={() => onSelectBeat(4)}
          className="hover:text-white underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Three Lenses
        </button>
        <button
          type="button"
          onClick={() => onSelectBeat(7)}
          className="hover:text-white underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Impact
        </button>
      </nav>

      {/* Zone 3: Single primary action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onToggleAutoPlay}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isAutoPlaying ? 'Pause Tour' : 'Auto-Play Tour'}
        </button>
      </div>
    </header>
  );
};
