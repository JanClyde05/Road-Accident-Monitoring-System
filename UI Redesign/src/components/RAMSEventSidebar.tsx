import React, { useState, useMemo } from 'react';
import { EventData, getStatusLabel, formatTimestamp, formatDirectDriveUrl, isEventFalseAlarm, isEventRescued, isEventActiveAlert } from '../types';
import { Radio, Search, ShieldAlert, ShieldCheck, Activity, Battery, MapPin, Clock, Navigation, User, Users, ChevronRight } from 'lucide-react';

interface EventSidebarProps {
  events: EventData[];
  selectedEvent: EventData | null;
  onEventSelect: (event: EventData) => void;
  onLocate?: (event: EventData) => void;
}

type ViewDensity = 'cards' | 'compact';

interface PersonGroup {
  key: string;
  name: string;
  token: string;
  photoUrl?: string;
  vehicleModel?: string;
  plateNumber?: string;
  bloodType?: string;
  contactNumber?: string;
  latestEvent: EventData;
  allEvents: EventData[];
  hasActiveAlert: boolean;
  hasFalseAlarm: boolean;
  hasRescued: boolean;
  alertCount: number;
  falseAlarmCount: number;
  rescuedCount: number;
  totalEvents: number;
  maxG: number;
}

export default function RAMSEventSidebar({ events, selectedEvent, onEventSelect, onLocate }: EventSidebarProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [density, setDensity] = useState<ViewDensity>('cards');

  // Group events by Person / Wearable Device so each person appears only once in the sidebar
  const personGroups = useMemo(() => {
    const map = new Map<string, PersonGroup>();

    // Sort newest first
    const sorted = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    for (const ev of sorted) {
      if (ev.type === 'test') continue;
      const name = (ev.riderName || '').toLowerCase().trim();
      const token = (ev.deviceToken || '').toLowerCase().trim();
      const id = (ev.id || '').toLowerCase().trim();
      const title = (ev.title || '').toLowerCase().trim();
      if (name.includes('test') || token.includes('test') || id.includes('test') || title.includes('test')) continue;

      // Group key preference: token > name > id
      const key = (ev.deviceToken && ev.deviceToken.trim()) || (ev.riderName && ev.riderName.trim()) || ev.id;
      if (!key) continue;

      const isFa = isEventFalseAlarm(ev);
      const isRescued = isEventRescued(ev);
      const isAl = isEventActiveAlert(ev);

      if (!map.has(key)) {
        const hasRealName = ev.riderName && 
          !ev.riderName.startsWith('RAMS-') && 
          !ev.riderName.startsWith('Rider RAMS-') &&
          ev.riderName !== ev.deviceToken;
        const displayName = hasRealName ? ev.riderName! : (ev.deviceToken ? `RAMS Node (${ev.deviceToken})` : 'RAMS Wearable Unit');

        map.set(key, {
          key,
          name: displayName,
          token: ev.deviceToken || '',
          photoUrl: ev.photoUrl,
          vehicleModel: ev.vehicleModel,
          plateNumber: ev.plateNumber,
          bloodType: ev.bloodType,
          contactNumber: ev.contactNumber,
          latestEvent: ev,
          allEvents: [ev],
          hasActiveAlert: isAl,
          hasFalseAlarm: isFa,
          hasRescued: isRescued,
          alertCount: isAl ? 1 : 0,
          falseAlarmCount: isFa ? 1 : 0,
          rescuedCount: isRescued ? 1 : 0,
          totalEvents: 1,
          maxG: typeof ev.aMag === 'number' ? ev.aMag : 0
        });
      } else {
        const grp = map.get(key)!;
        grp.allEvents.push(ev);
        grp.totalEvents += 1;
        if (isAl) {
          grp.hasActiveAlert = true;
          grp.alertCount += 1;
        }
        if (isFa) {
          grp.hasFalseAlarm = true;
          grp.falseAlarmCount += 1;
        }
        if (isRescued) {
          grp.hasRescued = true;
          grp.rescuedCount += 1;
        }
        if (typeof ev.aMag === 'number' && ev.aMag > grp.maxG) {
          grp.maxG = ev.aMag;
        }
        // Enrich metadata if missing from latest
        if (!grp.photoUrl && ev.photoUrl) grp.photoUrl = ev.photoUrl;
        if (!grp.vehicleModel && ev.vehicleModel) grp.vehicleModel = ev.vehicleModel;
        if (!grp.plateNumber && ev.plateNumber) grp.plateNumber = ev.plateNumber;
        if (!grp.bloodType && ev.bloodType) grp.bloodType = ev.bloodType;
        if (!grp.contactNumber && ev.contactNumber) grp.contactNumber = ev.contactNumber;

        // Prioritize active alert event as representative
        if (isAl && grp.latestEvent.type !== 'alert') {
          grp.latestEvent = ev;
        }
      }
    }

    // Apply filtering
    return Array.from(map.values()).filter((grp) => {
      if (filterType !== 'all') {
        if (filterType === 'alert') {
          return grp.hasActiveAlert || grp.hasFalseAlarm || grp.hasRescued;
        } else if (filterType === 'telemetry') {
          return !grp.hasActiveAlert;
        }
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          grp.name.toLowerCase().includes(q) ||
          grp.token.toLowerCase().includes(q) ||
          (grp.vehicleModel && grp.vehicleModel.toLowerCase().includes(q)) ||
          (grp.latestEvent.locationAddress && grp.latestEvent.locationAddress.toLowerCase().includes(q))
        );
      }
      return true;
    }).sort((a, b) => {
      // Prioritize active alerts to top
      if (a.hasActiveAlert && !b.hasActiveAlert) return -1;
      if (!a.hasActiveAlert && b.hasActiveAlert) return 1;
      return new Date(b.latestEvent.createdAt).getTime() - new Date(a.latestEvent.createdAt).getTime();
    });
  }, [events, filterType, searchQuery]);

  const activeAlertPersonsCount = personGroups.filter((p) => p.hasActiveAlert).length;
  const telemetryPersonsCount = personGroups.filter((p) => !p.hasActiveAlert).length;

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
            <h2 className="text-xs font-black font-mono tracking-wider uppercase text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Registered Riders & Wearables ({personGroups.length})
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

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors border ${
              filterType === 'all'
                ? 'bg-white text-neutral-950 border-white'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'
            }`}
          >
            All Riders ({personGroups.length})
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
            Alerts ({activeAlertPersonsCount})
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
            Active ({telemetryPersonsCount})
          </button>

          {/* Search */}
          <div className="relative ml-auto min-w-[140px]">
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

      {/* Person Cards Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {personGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <Users className="w-8 h-8 text-neutral-700 mb-2 animate-pulse" />
            <div className="text-xs font-mono font-bold text-neutral-400 uppercase">
              No Riders Detected
            </div>
            <p className="text-[10px] text-neutral-600 mt-1 max-w-xs">
              Waiting for live telemetry or crash reports from registered RAMS wearable devices.
            </p>
          </div>
        ) : (
          personGroups.map((grp) => {
            const ev = grp.latestEvent;
            const isSelected = selectedEvent?.deviceToken === grp.token || selectedEvent?.id === ev.id;
            const hasAlert = grp.hasActiveAlert;
            const isRescued = !hasAlert && grp.hasRescued;
            const isFa = !hasAlert && !isRescued && grp.hasFalseAlarm;

            // Status Badge configuration
            const badge = hasAlert 
              ? { label: 'CRITICAL CRASH ALERT', className: 'bg-rose-950/80 text-rose-300 border-rose-800/80 animate-pulse' }
              : isRescued
              ? { label: 'RESCUED / CLEARED', className: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' }
              : isFa
              ? { label: 'FALSE ALARM (CLEARED)', className: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' }
              : { label: 'ACTIVE MONITORING', className: 'bg-neutral-800 text-neutral-300 border-neutral-700/80' };

            const handleLocateClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (onLocate) onLocate(ev);
              else onEventSelect(ev);
            };

            if (density === 'compact') {
              return (
                <div
                  key={grp.key}
                  onClick={() => onEventSelect(ev)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900/95 border-neutral-500 shadow-md ring-1 ring-neutral-500/40'
                      : 'bg-[#15151b]/90 hover:bg-[#1c1c24] border-neutral-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {grp.photoUrl && grp.photoUrl !== '/logo.png' && grp.photoUrl !== '/logo.jpg' ? (
                          <img
                            referrerPolicy="no-referrer"
                            src={formatDirectDriveUrl(grp.photoUrl)}
                            alt={grp.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <User className="w-4 h-4 text-neutral-400" />
                        )}
                        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-neutral-900 ${
                          hasAlert ? 'bg-rose-500 animate-pulse' : (isRescued || isFa) ? 'bg-emerald-500' : 'bg-sky-500'
                        }`} />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {grp.name}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400 truncate flex items-center gap-1.5">
                          <span>{grp.vehicleModel || 'Motorcycle'}</span>
                          <span>•</span>
                          <span className="text-neutral-500">{grp.allEvents.length} logs</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${badge.className}`}>
                        {badge.label}
                      </span>
                      <button
                        type="button"
                        onClick={handleLocateClick}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                        title="Locate on Map"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Cards Density View (Default & Recommended)
            return (
              <div
                key={grp.key}
                onClick={() => onEventSelect(ev)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-neutral-900/95 border-neutral-500 shadow-xl ring-1 ring-neutral-400/50'
                    : 'bg-[#15151b] hover:bg-[#1a1a22] border-neutral-800/80 shadow-xs'
                }`}
              >
                {/* Left urgency colored stripe */}
                {hasAlert && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 animate-pulse" />
                )}
                {(isRescued || isFa) && !hasAlert && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                )}
                {!hasAlert && !isRescued && !isFa && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}

                <div className="pl-1.5">
                  {/* Top Row: Avatar + Badge + Timestamp */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar with Status Ring */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border overflow-hidden relative ${
                        hasAlert
                          ? 'border-rose-600 bg-rose-950/30'
                          : (isRescued || isFa)
                          ? 'border-emerald-600 bg-emerald-950/30'
                          : 'border-neutral-700 bg-neutral-900'
                      }`}>
                        {grp.photoUrl && grp.photoUrl !== '/logo.png' && grp.photoUrl !== '/logo.jpg' ? (
                          <img
                            referrerPolicy="no-referrer"
                            src={formatDirectDriveUrl(grp.photoUrl)}
                            alt={grp.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <User className="w-5 h-5 text-neutral-400" />
                        )}
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-neutral-950 ${
                          hasAlert ? 'bg-rose-500 animate-pulse' : (isRescued || isFa) ? 'bg-emerald-500' : 'bg-sky-500'
                        }`} />
                      </div>

                      {/* Badge and Token */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400 truncate">
                          TOKEN: <span className="text-neutral-200 font-bold">{grp.token || 'UNREGISTERED'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-500 shrink-0 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatCardTimestamp(ev.createdAt)}
                    </span>
                  </div>

                  {/* Rider Full Name */}
                  <div className="text-[14px] font-black text-white mb-1 truncate flex items-center justify-between">
                    <span>{grp.name}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                  </div>

                  {/* Vehicle & Plate Line */}
                  <div className="text-xs text-neutral-300 font-medium mb-2 flex items-center gap-2">
                    <span>{grp.vehicleModel || 'Motorcycle'}</span>
                    {grp.plateNumber && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {grp.plateNumber}
                      </span>
                    )}
                  </div>

                  {/* Coordinates & Location */}
                  {ev.lat != null && ev.lon != null && (ev.lat !== 0 || ev.lon !== 0) && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 mb-2.5">
                      <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                      <span className="truncate">{ev.lat.toFixed(5)}° N, {ev.lon.toFixed(5)}° E</span>
                    </div>
                  )}

                  {/* Metrics Footer Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/70">
                    <div className="flex items-center gap-2.5 text-[10px] font-mono">
                      {/* Accident Counter */}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold border ${
                        grp.alertCount > 0 
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/60' 
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      }`}>
                        <Activity className="w-3 h-3" />
                        {grp.alertCount} ACCIDENT{grp.alertCount !== 1 ? 'S' : ''}
                      </span>

                      {/* Total Logs */}
                      <span className="text-neutral-500">
                        {grp.allEvents.length} log{grp.allEvents.length !== 1 ? 's' : ''}
                      </span>

                      {/* Battery */}
                      {ev.battPct !== undefined && ev.battPct > 0 && (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <Battery className="w-3 h-3" />
                          {ev.battPct}%
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleLocateClick}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded transition-colors shadow-xs"
                        title="Locate on Map"
                      >
                        <Navigation className="w-3 h-3 text-blue-400" />
                        LOCATE
                      </button>
                    </div>
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
