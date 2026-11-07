import React, { useState } from 'react';
import { 
  RotateCw, 
  ShieldAlert, 
  Radio
} from 'lucide-react';
import ConnectionStatusPopup from './ConnectionStatusPopup';

interface RAMSHeaderProps {
  alertCount: number;
  deviceCount: number;
  lastUpdate: Date | null;
  isConnected: boolean;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function RAMSHeader({
  alertCount,
  deviceCount,
  lastUpdate,
  isConnected,
  onRefresh,
  isLoading,
}: RAMSHeaderProps) {
  const [isConnectionOpen, setIsConnectionOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md transition-colors duration-200">
        <div className="w-full px-3 sm:px-5">
          <div className="flex items-center justify-between h-14 gap-2">
          
            {/* Brand Mark & Identity */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center justify-center bg-white dark:bg-neutral-900 overflow-hidden shadow-xs flex-shrink-0 p-0.5">
                <img
                  src="/logo.png"
                  alt="RAMS Logo"
                  className="w-full h-full object-contain rounded"
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

            {/* Action Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {lastUpdate && (
                <span className="hidden 2xl:block text-[10px] font-mono font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mr-1">
                  UPDATED {lastUpdate.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}

              {/* Connection Status Button */}
              <button
                onClick={() => setIsConnectionOpen(!isConnectionOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded border transition-colors shadow-xs ${
                  isConnectionOpen
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                    : 'text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
                }`}
                title="Check ESP32 Receiver Connection Status"
              >
                <Radio className={`w-3.5 h-3.5 ${isConnectionOpen ? 'text-emerald-500' : 'text-blue-500'}`} />
                <span className="hidden md:inline">Connection</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1.5 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white rounded border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 shadow-xs transition-colors"
                title="Refresh Telemetry"
                aria-label="Refresh telemetry data"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-neutral-900 dark:text-white' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Connection Status Popup */}
      <ConnectionStatusPopup
        isOpen={isConnectionOpen}
        onClose={() => setIsConnectionOpen(false)}
      />
    </>
  );
}
