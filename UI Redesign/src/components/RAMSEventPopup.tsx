import React, { useState } from 'react';
import { EventData, getStatusLabel, formatTimestamp } from '../types';
import { 
  Activity, 
  Battery, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Copy, 
  Check, 
  Cpu, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';

interface EventPopupProps {
  event: EventData;
  onOpenProfile?: () => void;
}

export default function RAMSEventPopup({ event, onOpenProfile }: EventPopupProps) {
  const [copied, setCopied] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const statusLabel = getStatusLabel(event);

  const getBadgeStyle = () => {
    switch (event.type) {
      case 'alert':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-900';
      case 'test':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-900';
      case 'false_alarm':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-900';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-900';
    }
  };

  const handleCopyCoords = (e: React.MouseEvent) => {
    e.stopPropagation();
    const coordStr = `${event.lat.toFixed(5)}, ${event.lon.toFixed(5)}`;
    navigator.clipboard.writeText(coordStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Profile display name: user registration name or device identification
  const registeredName = event.deviceName || 'Registered Wearable Unit';
  const deviceToken = event.deviceToken || event.id.substring(0, 8).toUpperCase();

  return (
    <div className="p-4 w-[285px] sm:w-[310px] font-sans text-neutral-900 dark:text-neutral-100 select-none">
      
      {/* Wearable Profile Header */}
      <div className="flex items-start gap-3 pb-3.5 border-b border-neutral-200 dark:border-neutral-800">
        
        {/* Profile Photo / Wearable Emblem */}
        <div className="relative flex-shrink-0">
          {event.photoUrl && !imageFailed ? (
            <img
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-lg object-cover border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 shadow-xs"
              src={event.photoUrl}
              alt={registeredName}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center p-1 shadow-xs">
              <img
                src="/logo.png"
                alt="RAMS Emblem"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.endsWith('/logo.png')) {
                    target.src = '/logo.jpg';
                  }
                }}
              />
            </div>
          )}
          <span 
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center ${
              event.type === 'alert' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
            }`}
            title={event.type === 'alert' ? 'Active Alert Broadcast' : 'Wearable Armed'}
          />
        </div>

        {/* Profile Identity Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-black uppercase tracking-tight truncate text-neutral-950 dark:text-white" title={registeredName}>
              {registeredName}
            </span>
            <UserCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
            <Cpu className="w-3 h-3 flex-shrink-0" />
            <span className="font-bold">{deviceToken}</span>
            <span>•</span>
            <span className="uppercase text-[9px] px-1 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              BELT CLIP
            </span>
          </div>
        </div>
      </div>

      {/* Incident Status Banner */}
      <div className="py-2.5 flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800/80">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${getBadgeStyle()}`}>
          {event.type === 'alert' && <ShieldAlert className="w-3 h-3 text-rose-500" />}
          {statusLabel}
        </span>
        {event.eventTypeName && (
          <span className="text-[10px] font-mono font-semibold uppercase text-neutral-500 dark:text-neutral-400 truncate max-w-[130px]" title={event.eventTypeName}>
            {event.eventTypeName}
          </span>
        )}
      </div>

      {/* Event Title */}
      <div className="py-2">
        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">
          {event.title}
        </p>
      </div>

      {/* Structured Telemetry Data Grid */}
      <div className="space-y-1.5 text-xs pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
        
        {/* Peak G-Force */}
        {event.aMag !== undefined && event.aMag > 0 && (
          <div className="flex items-center justify-between py-0.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
              <Activity className="w-3 h-3 text-rose-500" />
              Peak Impact
            </span>
            <span className="font-mono text-xs font-bold text-neutral-950 dark:text-white px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              {event.aMag.toFixed(2)}g
            </span>
          </div>
        )}

        {/* Battery Telemetry */}
        {event.battPct !== undefined && event.battPct > 0 && (
          <div className="flex items-center justify-between py-0.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
              <Battery className="w-3 h-3 text-emerald-500" />
              LiPo Battery
            </span>
            <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
              {event.battPct}%
            </span>
          </div>
        )}

        {/* High-Precision GPS Coordinates with Copy Action */}
        <div className="flex items-center justify-between py-0.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
            <MapPin className="w-3 h-3 text-blue-500" />
            Coordinates
          </span>
          <button
            onClick={handleCopyCoords}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors"
            title="Copy coordinates"
          >
            <span>{event.lat.toFixed(5)}, {event.lon.toFixed(5)}</span>
            {copied ? (
              <Check className="w-2.5 h-2.5 text-emerald-500" />
            ) : (
              <Copy className="w-2.5 h-2.5 text-neutral-400" />
            )}
          </button>
        </div>

        {/* Recorded Timestamp */}
        <div className="flex items-center justify-between py-0.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
            <Clock className="w-3 h-3 text-neutral-400" />
            Timestamp
          </span>
          <span className="font-mono text-[10px] text-neutral-600 dark:text-neutral-400">
            {formatTimestamp(event.createdAt)}
          </span>
        </div>

      </div>

    </div>
  );
}
