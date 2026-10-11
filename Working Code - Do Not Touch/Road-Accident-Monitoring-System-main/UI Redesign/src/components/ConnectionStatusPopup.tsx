import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Usb, Wifi, Radio, RefreshCw, CheckCircle2, XCircle, Cpu, Globe, HardDrive, Activity, Signal } from 'lucide-react';

interface ReceiverStatus {
  status: string;
  port: number;
  mode: string;
  activeSerialPort: string;
  connectedPorts: string[];
  localIPs: string[];
  eventsCount: number;
  registrationsCount: number;
  timestamp: string;
}

interface ConnectionStatusPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectionStatusPopup({ isOpen, onClose }: ConnectionStatusPopupProps) {
  const [receiverStatus, setReceiverStatus] = useState<ReceiverStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const fetchStatus = useCallback(async () => {
    setIsPolling(true);
    setPollError(null);
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ReceiverStatus = await res.json();
      setReceiverStatus(data);
      setLastPollTime(new Date());
    } catch (err: any) {
      setPollError(err.message || 'Connection failed');
      setReceiverStatus(null);
    } finally {
      setIsPolling(false);
    }
  }, []);

  // Poll every 2 seconds while popup is open
  useEffect(() => {
    if (!isOpen) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [isOpen, fetchStatus]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isServerOnline = receiverStatus?.status === 'ONLINE';
  const hasSerialConnection = receiverStatus?.connectedPorts && receiverStatus.connectedPorts.length > 0;
  const hasLanIPs = receiverStatus?.localIPs && receiverStatus.localIPs.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end pt-[3.75rem] pr-3 pointer-events-none">
      <div
        ref={popupRef}
        className="pointer-events-auto w-[380px] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 shadow-2xl shadow-black/20 dark:shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          animation: 'popupSlideIn 0.2s ease-out forwards',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isServerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-mono font-black uppercase tracking-wider text-neutral-900 dark:text-white">
              Receiver Status
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={isPolling}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 ${isPolling ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">

          {/* Server Status Card */}
          <div className={`rounded-lg border p-3 ${isServerOnline
            ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/30'
            : 'border-rose-200 dark:border-rose-800/60 bg-rose-50/80 dark:bg-rose-950/30'
          }`}>
            <div className="flex items-center gap-2.5 mb-2">
              {isServerOnline
                ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                : <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              }
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isServerOnline
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-rose-700 dark:text-rose-300'
              }`}>
                {isServerOnline ? 'Server Online' : 'Server Offline'}
              </span>
            </div>
            {isServerOnline && receiverStatus && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                  <span className="text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-400">
                    Port {receiverStatus.port}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                  <span className="text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-400">
                    {receiverStatus.eventsCount} Event{receiverStatus.eventsCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                  <span className="text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-400 truncate">
                    {receiverStatus.mode.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                  <span className="text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-400">
                    {receiverStatus.registrationsCount} Device{receiverStatus.registrationsCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
            {pollError && (
              <p className="text-[10px] font-mono text-rose-600 dark:text-rose-400 mt-1.5">
                {pollError}
              </p>
            )}
          </div>

          {/* USB Serial Connection */}
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Usb className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                USB Serial Bridge
              </span>
            </div>

            {hasSerialConnection ? (
              <div className="space-y-1.5">
                {receiverStatus!.connectedPorts.map((port) => (
                  <div key={port} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {port}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600/80 dark:text-emerald-400/60 ml-auto">
                      CONNECTED
                    </span>
                  </div>
                ))}
                {receiverStatus?.activeSerialPort && receiverStatus.activeSerialPort !== 'NONE' && (
                  <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-500 mt-1">
                    Active Port: <span className="text-neutral-700 dark:text-neutral-300 font-bold">{receiverStatus.activeSerialPort}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/50">
                <XCircle className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                <span className="text-[11px] font-mono font-semibold text-neutral-500 dark:text-neutral-400">
                  No USB receiver detected
                </span>
              </div>
            )}

            <div className="mt-2.5 pt-2.5 border-t border-neutral-200/80 dark:border-neutral-700/50">
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-500 leading-relaxed">
                <span className="font-bold text-neutral-600 dark:text-neutral-400">Setup:</span> Connect ESP32 LoRa receiver via USB. The system auto-detects serial ports at 115200 baud, 8N1 with DTR/RTS enabled.
              </p>
            </div>
          </div>

          {/* Wi-Fi / LAN Connection */}
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Wifi className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                Wi-Fi LAN Bridge
              </span>
              <span className="ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50">
                PORT 8888
              </span>
            </div>

            {hasLanIPs ? (
              <div className="space-y-1.5">
                {receiverStatus!.localIPs.map((ip) => (
                  <div key={ip} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50">
                    <Signal className="w-3 h-3 text-violet-500 dark:text-violet-400" />
                    <span className="text-[11px] font-mono font-bold text-violet-700 dark:text-violet-300">
                      {ip}:8888
                    </span>
                    <span className="text-[10px] font-mono text-violet-600/80 dark:text-violet-400/60 ml-auto">
                      LISTENING
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/50">
                <XCircle className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                <span className="text-[11px] font-mono font-semibold text-neutral-500 dark:text-neutral-400">
                  No LAN interface detected
                </span>
              </div>
            )}

            <div className="mt-2.5 pt-2.5 border-t border-neutral-200/80 dark:border-neutral-700/50">
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-500 leading-relaxed">
                <span className="font-bold text-neutral-600 dark:text-neutral-400">Setup:</span> Configure ESP32 sender to POST JSON to the IP above on port 8888. Both devices must be on the same network.
              </p>
            </div>
          </div>

          {/* ESP32 Configuration Reference */}
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Radio className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                ESP32 Config Reference
              </span>
            </div>

            <div className="space-y-2">
              <div className="rounded-md bg-neutral-900 dark:bg-neutral-950 p-2.5 border border-neutral-700">
                <p className="text-[10px] font-mono text-neutral-400 mb-1">// USB Serial (Arduino IDE)</p>
                <p className="text-[10px] font-mono text-emerald-400">Serial.begin(<span className="text-amber-300">115200</span>);</p>
                <p className="text-[10px] font-mono text-emerald-400">Serial.println(<span className="text-amber-300">jsonPayload</span>);</p>
              </div>

              {hasLanIPs && receiverStatus!.localIPs.length > 0 && (
                <div className="rounded-md bg-neutral-900 dark:bg-neutral-950 p-2.5 border border-neutral-700">
                  <p className="text-[10px] font-mono text-neutral-400 mb-1">// Wi-Fi POST to Desktop</p>
                  <p className="text-[10px] font-mono text-violet-400">
                    http.begin(<span className="text-amber-300">"{receiverStatus!.localIPs[0]}:8888"</span>);
                  </p>
                  <p className="text-[10px] font-mono text-violet-400">
                    http.POST(<span className="text-amber-300">jsonPayload</span>);
                  </p>
                </div>
              )}

              <div className="rounded-md bg-neutral-900 dark:bg-neutral-950 p-2.5 border border-neutral-700">
                <p className="text-[10px] font-mono text-neutral-400 mb-1">// Expected JSON format</p>
                <p className="text-[10px] font-mono text-blue-400">{'{'}"event":"CRASH_ALERT",</p>
                <p className="text-[10px] font-mono text-blue-400 pl-2">"lat":17.613, "lon":121.727,</p>
                <p className="text-[10px] font-mono text-blue-400 pl-2">"aMag":4.2, "battPct":85{'}'}</p>
              </div>
            </div>
          </div>

          {/* Last Poll Info */}
          {lastPollTime && (
            <div className="flex items-center justify-center gap-1.5 pt-1 pb-1">
              <span className="text-[9px] font-mono font-semibold text-neutral-400 dark:text-neutral-600 uppercase tracking-wider">
                Last polled: {lastPollTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-semibold text-neutral-400 dark:text-neutral-600 uppercase tracking-wider">
                LIVE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes popupSlideIn {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
