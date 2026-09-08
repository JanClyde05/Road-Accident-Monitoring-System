import React, { useState, useMemo } from 'react';
import { EventData, getStatusLabel, formatTimestamp } from '../types';
import { Radio, Search, ShieldAlert, Activity, Battery, MapPin, UserCheck } from 'lucide-react';

interface EventSidebarProps {
  events: EventData[];
  selectedEvent: EventData | null;
  onEventSelect: (event: EventData) => void;
  onOpenProfile?: (event: EventData) => void;
}

export default function RAMSEventSidebar({ events, selectedEvent, onEventSelect, onOpenProfile }: EventSidebarProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const displayEvents = useMemo(() => {
    return events
      .filter((e) => e.lat && e.lon && (e.lat !== 0 || e.lon !== 0))
      .filter((e) => {
        if (filterType !== 'all' && e.type !== filterType) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            (e.deviceName && e.deviceName.toLowerCase().includes(q)) ||
            (e.deviceToken && e.deviceToken.toLowerCase().includes(q)) ||
            (e.title && e.title.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [events, filterType, searchQuery]);

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900';
      case 'test':
        return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900';
      case 'false_alarm':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900';
    }
  };

  return (
    <aside className="w-full md:w-[380px] lg:w-[410px] h-full flex flex-col border-l border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md z-30 transition-colors">
      
      {/* Sidebar Header & Filters */}
      <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-xs font-black uppercase tracking-tight text-neutral-900 dark:text-neutral-100">
              Live Incident Stream
            </h2>
          </div>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900">
            {displayEvents.length} RECORD{displayEvents.length !== 1 ? 'S' : ''}
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="FILTER BY DEVICE OR TOKEN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-medium rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'alert', 'test', 'telemetry'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors border ${
                filterType === tab
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800 hover:border-neutral-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Event Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {displayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Radio className="w-8 h-8 text-neutral-400 dark:text-neutral-600 mb-2 stroke-[1.5]" />
            <p className="text-xs font-bold font-mono uppercase text-neutral-700 dark:text-neutral-300">
              No Incidents Detected
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-1 max-w-[220px]">
              Wearable sensor packets and GPS coordinates will broadcast here in real time.
            </p>
          </div>
        ) : (
          displayEvents.map((event) => {
            const isSelected = selectedEvent?.id === event.id;
            const statusLabel = getStatusLabel(event);

            return (
              <div
                key={event.id}
                onClick={() => onEventSelect(event)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-neutral-950 dark:border-white bg-neutral-100/90 dark:bg-neutral-900/90 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center p-0.5 flex-shrink-0 overflow-hidden">
                      <img
                        src={event.photoUrl || "/logo.png"}
                        alt={event.deviceName || "RAMS Wearable"}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (img.src.endsWith('/logo.png')) {
                            img.src = '/logo.jpg';
                          } else {
                            img.src = '/logo.png';
                          }
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="font-extrabold text-xs uppercase tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                        {event.deviceName || event.deviceToken}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        {formatTimestamp(event.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${getBadgeClass(event.type)}`}>
                      {statusLabel}
                    </span>
                    {onOpenProfile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProfile(event);
                        }}
                        className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                        title="View Rider Medical & Device Profile"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Event Title */}
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2 truncate">
                  {event.title}
                </div>

                {/* Telemetry Metrics Bar */}
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center gap-3">
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

                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-neutral-500">
                    <MapPin className="w-3 h-3" />
                    {event.lat.toFixed(4)}, {event.lon.toFixed(4)}
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>

    </aside>
  );
}
