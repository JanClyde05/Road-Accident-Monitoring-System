import React, { useState, useMemo } from 'react';
import { EventData, formatTimestamp } from '../types';
import { Radio, Search, ShieldAlert, Activity, Battery, MapPin, UserCheck, Truck, ChevronRight } from 'lucide-react';

interface EventSidebarProps {
  events: EventData[];
  selectedEvent: EventData | null;
  onEventSelect: (event: EventData) => void;
  onOpenProfile?: (event: EventData) => void;
}

interface RegisteredRiderUnit {
  key: string;
  token: string;
  riderName: string;
  vehicleModel: string;
  plateNumber: string;
  contactNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType: string;
  allergies: string;
  photoUrl?: string;
  activeAlert: EventData | null;
  latestEvent: EventData;
  eventsCount: number;
  lat: number;
  lon: number;
  isLastKnownLocation: boolean;
  battery: number;
  statusLabel: string;
  isAlert: boolean;
  isRescued: boolean;
}

export default function RAMSEventSidebar({ events, selectedEvent, onEventSelect, onOpenProfile }: EventSidebarProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Group events into unique genuine registered riders
  const registeredRiders = useMemo(() => {
    const groups = new Map<string, EventData[]>();

    for (const e of events) {
      const token = (e.deviceToken || '').trim();
      const name = (e.riderName || '').trim();

      // Discard simulated test devices and fake identities
      if (
        token.startsWith('RAMS-SIM-') ||
        name === 'Jane Doe' ||
        name === 'Officer Ramirez' ||
        name === 'Simulated Device'
      ) {
        continue;
      }

      const key = token || name;
      if (!key) continue;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(e);
    }

    const units: RegisteredRiderUnit[] = [];

    groups.forEach((userEvents, key) => {
      const sorted = [...userEvents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const activeAlert = sorted.find(
        (e) => e.type === 'alert' && e.status !== 'RESCUED' && e.status !== 'rescued'
      ) || null;

      const latest = activeAlert || sorted[0];
      if (!latest) return;

      // Extract coordinates with fallback to last known valid GPS
      let lat = latest.lat;
      let lon = latest.lon;
      let isLastKnown = false;

      if (!lat || !lon || (lat === 0 && lon === 0)) {
        const lastValid = sorted.find(
          (e) => e.lat && e.lon && (e.lat !== 0 || e.lon !== 0)
        );
        if (lastValid) {
          lat = lastValid.lat;
          lon = lastValid.lon;
          isLastKnown = true;
        } else {
          lat = 17.6132;
          lon = 121.7270;
        }
      }

      const isRescued = sorted.some((e) => e.status === 'RESCUED' || e.status === 'rescued') && !activeAlert;
      const isAlert = Boolean(activeAlert);

      let statusLabel = 'UPLINK ONLINE';
      if (isAlert) {
        statusLabel = 'CRITICAL ALERT';
      } else if (isRescued) {
        statusLabel = 'RESCUED / CLEARED';
      }

      units.push({
        key,
        token: latest.deviceToken || key,
        riderName: latest.riderName || latest.deviceName || key,
        vehicleModel: latest.vehicleModel || 'Registered Vehicle',
        plateNumber: latest.plateNumber || 'EMERGENCY',
        contactNumber: latest.contactNumber || '',
        emergencyContactName: latest.emergencyContactName || '',
        emergencyContactPhone: latest.emergencyContactPhone || '',
        bloodType: latest.bloodType || 'N/A',
        allergies: latest.allergies || 'None',
        photoUrl: latest.photoUrl,
        activeAlert,
        latestEvent: {
          ...latest,
          lat,
          lon,
          isLastKnownLocation: isLastKnown
        },
        eventsCount: sorted.length,
        lat,
        lon,
        isLastKnownLocation: isLastKnown,
        battery: latest.battPct ?? 100,
        statusLabel,
        isAlert,
        isRescued
      });
    });

    // Sort: Active alerts first, then newest activity
    return units.sort((a, b) => {
      if (a.isAlert && !b.isAlert) return -1;
      if (!a.isAlert && b.isAlert) return 1;
      return new Date(b.latestEvent.createdAt).getTime() - new Date(a.latestEvent.createdAt).getTime();
    });
  }, [events]);

  const displayedRiders = useMemo(() => {
    return registeredRiders.filter((r) => {
      if (filterType === 'alert' && !r.isAlert) return false;
      if (filterType === 'rescued' && !r.isRescued) return false;
      if (filterType === 'active' && (r.isAlert || r.isRescued)) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.riderName.toLowerCase().includes(q) ||
          r.token.toLowerCase().includes(q) ||
          r.vehicleModel.toLowerCase().includes(q) ||
          r.plateNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [registeredRiders, filterType, searchQuery]);

  return (
    <aside className="w-full md:w-[380px] lg:w-[410px] h-full flex flex-col border-l border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md z-30 transition-colors overflow-hidden">
      
      {/* Sidebar Header & Filters */}
      <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-xs font-black uppercase tracking-tight text-neutral-900 dark:text-neutral-100">
              Registered Riders & Wearable Units
            </h2>
          </div>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900">
            {displayedRiders.length} ACTIVE
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="FILTER BY RIDER, VEHICLE, OR TOKEN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-medium rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'ALL UNITS' },
            { id: 'alert', label: 'ALERTS' },
            { id: 'active', label: 'NORMAL' },
            { id: 'rescued', label: 'CLEARED' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors border ${
                filterType === tab.id
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800 hover:border-neutral-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Registered Riders List */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-2.5">
        {displayedRiders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Radio className="w-8 h-8 text-neutral-400 dark:text-neutral-600 mb-2 stroke-[1.5]" />
            <p className="text-xs font-bold font-mono uppercase text-neutral-700 dark:text-neutral-300">
              No Registered Units Match
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-1 max-w-[220px]">
              Registered wearable devices will display here automatically with live telemetry status.
            </p>
          </div>
        ) : (
          displayedRiders.map((rider) => {
            const isSelected =
              selectedEvent?.deviceToken === rider.token ||
              selectedEvent?.riderName === rider.riderName;

            return (
              <div
                key={rider.key}
                onClick={() => {
                  onEventSelect(rider.latestEvent);
                  onOpenProfile?.(rider.latestEvent);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                  rider.isAlert
                    ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/25 shadow-sm ring-1 ring-rose-500/40'
                    : isSelected
                    ? 'border-neutral-950 dark:border-white bg-neutral-100/90 dark:bg-neutral-900/90 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Rider Header Row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center p-0.5 flex-shrink-0 overflow-hidden">
                      <img
                        referrerPolicy="no-referrer"
                        src={rider.photoUrl || '/logo.png'}
                        alt={rider.riderName}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = '/logo.png';
                        }}
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-900 ${
                          rider.isAlert ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="font-extrabold text-xs uppercase tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                        {rider.riderName}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1 truncate">
                        <Truck className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                        <span>{rider.vehicleModel}</span>
                        <span>•</span>
                        <span className="font-bold text-neutral-600 dark:text-neutral-300">{rider.token}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                        rider.isAlert
                          ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-900 animate-pulse'
                          : rider.isRescued
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-900'
                          : 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-900'
                      }`}
                    >
                      {rider.statusLabel}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventSelect(rider.latestEvent);
                        onOpenProfile?.(rider.latestEvent);
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      title="Open Rider Profile & Events"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Telemetry Metrics & Location Summary */}
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Battery className="w-3 h-3" />
                      {rider.battery}%
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {rider.lat.toFixed(4)}, {rider.lon.toFixed(4)}
                      {rider.isLastKnownLocation && (
                        <span className="text-[7.5px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-900">
                          LAST FIX
                        </span>
                      )}
                    </span>
                  </div>

                  <span className="font-bold text-[9.5px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                    {rider.eventsCount} EVENT{rider.eventsCount !== 1 ? 'S' : ''}
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
