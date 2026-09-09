import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  ShieldAlert, 
  BookOpen,
  Minus,
  Square,
  Copy,
  X
} from 'lucide-react';

interface RAMSHeaderProps {
  alertCount: number;
  deviceCount: number;
  lastUpdate: Date | null;
  isConnected: boolean;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenDesignRules?: () => void;
}

export default function RAMSHeader({
  alertCount,
  deviceCount,
  lastUpdate,
  isConnected,
  onRefresh,
  isLoading,
  onOpenDesignRules
}: RAMSHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleMinimize = () => {
    // In Edge PWA / App mode, blur focus or window
    window.blur();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleClose = () => {
    try {
      navigator.sendBeacon('/api/exit');
    } catch {
      fetch('/api/exit', { method: 'POST' }).catch(() => {});
    }
    window.close();
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        navigator.sendBeacon('/api/exit');
      } catch {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md transition-colors duration-200 select-none">
      <div className="w-full px-3 sm:px-5">
        <div className="flex items-center justify-between h-14 gap-2">
          
          {/* Brand Mark & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center bg-white dark:bg-neutral-900 overflow-hidden shadow-xs flex-shrink-0 p-0.5">
              <img
                src="/logo.png"
                alt="RAMS Logo"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.endsWith('/logo.png')) {
                    target.src = '/logo.jpg';
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-neutral-950 dark:text-white uppercase truncate">
                  ROAD ACCIDENT MONITORING SYSTEM
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900 tracking-wider">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] font-mono font-semibold tracking-wide uppercase text-neutral-500 dark:text-neutral-400 hidden sm:block">
                PGC DIGITAL INNOVATION CHALLENGE 2026
              </p>
            </div>
          </div>

          {/* Central Status Pill */}
          <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/80 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              {isConnected ? 'UPLINK ONLINE' : 'UPLINK OFFLINE'}
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            {alertCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 tracking-wide">
                <ShieldAlert className="w-3.5 h-3.5" />
                {alertCount} ALERT{alertCount !== 1 ? 'S' : ''}
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 tracking-wide">
                0 ALERTS
              </span>
            )}
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 tracking-wide">
              {deviceCount} DEVICE{deviceCount !== 1 ? 'S' : ''}
            </span>
          </div>

          {/* Action Toolbar & Window Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {lastUpdate && (
              <span className="hidden 2xl:block text-[10px] font-mono font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mr-1">
                UPDATED {lastUpdate.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}

            {/* HIDDEN — Kept in code for developer reference
            <button
              onClick={onOpenDesignRules}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 transition-colors shadow-xs"
              title="Inspect GPS-Audio Aesthetic Design Rules"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden md:inline">Design Rules</span>
            </button>
            */}

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white rounded border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 shadow-xs transition-colors"
              title="Refresh Map & Telemetry"
              aria-label="Refresh telemetry data"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-neutral-900 dark:text-white' : ''}`} />
            </button>

            {/* Custom Window Controls (Minimize, Restore/Maximize, Close) */}
            <div className="flex items-center ml-1 pl-1.5 border-l border-neutral-300 dark:border-neutral-800 gap-1">
              <button
                onClick={handleMinimize}
                className="w-7 h-7 flex items-center justify-center rounded text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                title="Minimize Window"
                aria-label="Minimize"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleToggleFullscreen}
                className="w-7 h-7 flex items-center justify-center rounded text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                title={isFullscreen ? "Restore Down (Exit Fullscreen)" : "Maximize (Fullscreen)"}
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <Copy className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded text-neutral-600 dark:text-neutral-400 hover:text-white hover:bg-rose-600 border border-transparent hover:border-rose-700 transition-colors"
                title="Exit Operations Center"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
