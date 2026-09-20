import React, { useState, useMemo } from 'react';
import { EventData, getStatusLabel, formatTimestamp, formatDirectDriveUrl } from '../types';
import { Radio, Search, ShieldAlert, Activity, Battery, MapPin, Clock, Navigation } from 'lucide-react';

interface EventSidebarProps {
  events: EventData[];
  selectedEvent: EventData | null;
  onEventSelect: (event: EventData) => void;
}

type ViewDensity = 'cards' | 'compact';

export default function RAMSEventSidebar({ events, selectedEvent, onEventSelect }: EventSidebarProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [density, setDensity] = useState<ViewDensity>('cards');

  const displayEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (e.type === 'test') return false;
        const name = (e.riderName || '').toLowerCase();
        const token = (e.deviceToken || '').toLowerCase();
        const id = (e.id || '').toLowerCase();
        const title = (e.title || '').toLowerCase();
        if (name.includes('test') || token.includes('test') || id.includes('test') || title.includes('test')) return false;
        return true;
      })
      .filter((e) => {
        if (filterType !== 'all') {
          if (filterType === 'alert') {
            return e.type === 'alert';
          } else if (filterType === 'telemetry') {
            return e.type === 'telemetry';
          } else if (filterType === 'register') {
            return e.type === 'register' || e.type === 'rider_profile';
          } else if (e.type !== filterType) {
            return false;
          }
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            (e.deviceName && e.deviceName.toLowerCase().includes(q)) ||
            (e.deviceToken && e.deviceToken.toLowerCase().includes(q)) ||
            (e.riderName && e.riderName.toLowerCase().includes(q)) ||
            (e.title && e.title.toLowerCase().includes(q)) ||
            (e.locationAddress && e.locationAddress.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [events, filterType, searchQuery]);

  const alertCount = events.filter((e) => e.type === 'alert').length;
  const telemetryCount = events.filter((e) => e.type === 'telemetry').length;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'alert':
        return { label: 'EMERGENCY ALERT', className: 'bg-rose-950/80 text-rose-400 border-rose-800/60' };
      case 'telemetry':
        return { label: 'GPS TELEMETRY', className: 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60' };
      case 'false_alarm':
        return { label: 'FALSE ALARM', className: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' };
      case 'register':
      case 'rider_profile':
        return { label: 'RIDER PROFILE', className: 'bg-violet-950/60 text-violet-400 border-violet-800/60' };
      default:
        return { label: 'GPS TELEMETRY', className: 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60' };
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'telemetry':
        return <Radio className="w-4 h-4 text-sky-400" />;
      case 'false_alarm':
        return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
      default:
        return <Radio className="w-4 h-4 text-neutral-300" />;
    }
  };

  const formatCardTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + 
             d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return ts;
    }
  };

  return (
    <aside className="w-full lg:w-[460px] h-full flex flex-col shrink-0 bg-[#0e0e11] border-l border-neutral-800/80 z-20 select-none overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-neutral-800/80 bg-[#121216]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-black font-mono tracking-wider uppercase text-white">
              Incident & Telemetry Stream
            </h2>
          </div>
          
          {/* Density Toggle */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setDensity('cards')}
              className={`px-2 py-0.5 rounded uppercase font-bold transition-colors ${
                density === 'cards' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setDensity('compact')}
              className={`px-2 py-0.5 rounded uppercase font-bold transition-colors ${
                density === 'compact' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Compact
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors border ${
              filterType === 'all'
                ? 'bg-white text-neutral-950 border-white'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'
            }`}
          >
            ALL ({displayEvents.length})
          </button>
          <button
            onClick={() => setFilterType('alert')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors border inline-flex items-center gap-1 ${
              filterType === 'alert'
                ? 'bg-white text-neutral-950 border-white'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            ALERTS ({alertCount})
          </button>
          <button
            onClick={() => setFilterType('telemetry')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors border inline-flex items-center gap-1 ${
              filterType === 'telemetry'
                ? 'bg-white text-neutral-950 border-white'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'
            }`}
          >
            <Radio className="w-3 h-3 text-sky-400" />
            TELEMETRY ({telemetryCount})
          </button>
          {/* Search */}
          <div className="relative ml-auto min-w-[150px]">
            <Search className="w-3 h-3 absolute left-2 top-2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rider..."
              className="w-full pl-6 pr-2 py-0.5 text-[11px] font-mono bg-neutral-900 border border-neutral-800 rounded text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>
        </div>
      </div>

      {/* Events List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {displayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <Radio className="w-8 h-8 text-neutral-700 mb-2 animate-pulse" />
            <div className="text-xs font-mono font-bold text-neutral-400 uppercase">
              No Real Incidents Detected
            </div>
            <p className="text-[10px] text-neutral-600 mt-1 max-w-xs">
              Waiting for live telemetry or crash reports from connected RAMS wearable nodes.
            </p>
          </div>
        ) : (
          displayEvents.map((event) => {
            const isSelected = selectedEvent?.id === event.id;
            const badge = getTypeBadge(event.type);

            // Compute human-readable title/name: don't show raw token as name
            const hasRealName = event.riderName && 
              !event.riderName.startsWith('RAMS-') && 
              !event.riderName.startsWith('Rider RAMS-') &&
              event.riderName !== event.deviceToken;
            const cardTitle = hasRealName ? event.riderName : (event.title || (event.deviceToken ? `RAMS Device (${event.deviceToken})` : 'RAMS Wearable Unit'));

            if (density === 'compact') {
              return (
                <div
                  key={event.id}
                  onClick={() => onEventSelect(event)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900/95 border-neutral-600 shadow-md ring-1 ring-neutral-500/30'
                      : 'bg-[#15151b]/90 hover:bg-[#1c1c24] border-neutral-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {event.photoUrl && event.photoUrl !== '/logo.png' && event.photoUrl !== '/logo.jpg' ? (
                          <img
                            referrerPolicy="no-referrer"
                            src={formatDirectDriveUrl(event.photoUrl)}
                            alt={event.riderName || 'Rider'}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          getIconForType(event.type)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {cardTitle}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-500 truncate">
                          {event.lat.toFixed(4)}°, {event.lon.toFixed(4)}°
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${badge.className}`}>
                        {badge.label}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEventSelect(event); }}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                        title="Locate on Map"
                      >
                        <Navigation className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Cards Density View
            return (
              <div
                key={event.id}
                onClick={() => onEventSelect(event)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-neutral-900/95 border-neutral-500 shadow-lg ring-1 ring-neutral-400/40'
                    : 'bg-[#15151b] hover:bg-[#1a1a22] border-neutral-800/80 shadow-xs'
                }`}
              >
                {/* Left severity indicator stripe for alerts */}
                {event.type === 'alert' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 animate-pulse" />
                )}

                <div className="pl-1">
                  {/* Top Row: Icon + Badge + Timestamp */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Icon Badge */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden ${
                        event.type === 'alert'
                          ? 'bg-neutral-900 border-neutral-700'
                          : 'bg-neutral-900 border-neutral-800'
                      }`}>
                        {event.photoUrl && event.photoUrl !== '/logo.png' && event.photoUrl !== '/logo.jpg' ? (
                          <img
                            referrerPolicy="no-referrer"
                            src={formatDirectDriveUrl(event.photoUrl)}
                            alt={event.riderName || 'Rider'}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          getIconForType(event.type)
                        )}
                      </div>

                      {/* Badge Pill */}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-500 shrink-0 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatCardTimestamp(event.createdAt)}
                    </span>
                  </div>

                  {/* Title / Rider Name */}
                  <div className="text-[13px] font-extrabold text-white mb-1.5 truncate">
                    {cardTitle}
                  </div>

                  {/* Coordinates */}
                  {event.lat != null && event.lon != null && (event.lat !== 0 || event.lon !== 0) && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 mb-2">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      <span>{event.lat.toFixed(6)}° N, {event.lon.toFixed(6)}° E</span>
                    </div>
                  )}

                  {/* Metrics Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-500">
                      {event.aMag !== undefined && event.aMag > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Activity className="w-3 h-3 text-rose-500" />
                          {event.aMag.toFixed(1)}g
                        </span>
                      )}
                      {event.battPct !== undefined && event.battPct > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Battery className="w-3 h-3 text-emerald-500" />
                          {event.battPct}%
                        </span>
                      )}
                    </div>

                    {/* Action Button: Locate on Map */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onEventSelect(event); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded transition-colors shadow-xs"
                    >
                      <Navigation className="w-3 h-3 text-blue-400" />
                      LOCATE
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </aside>
  );
}
