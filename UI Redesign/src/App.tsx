import React, { useEffect, useState, useCallback } from 'react';
import { GuardianEvent, EventData, ThemeMode } from './types';
import { Header } from './components/Header';
import { TelemetryBar } from './components/TelemetryBar';
import { MapContainer } from './components/MapContainer';
import { EventsList } from './components/EventsList';
import { AudioPlayerModal } from './components/AudioPlayerModal';
import { Toast, ToastMessage } from './components/Toast';

// RAMS Redesigned Components
import RAMSHeader from './components/RAMSHeader';
import RAMSMapView from './components/RAMSMapView';
import RAMSEventSidebar from './components/RAMSEventSidebar';
import RAMSWearableProfileOverlay from './components/RAMSWearableProfileOverlay';
import { DesignRulesModal } from './components/DesignRulesModal';

export default function App() {
  const [events, setEvents] = useState<GuardianEvent[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [selectedEvent, setSelectedEvent] = useState<GuardianEvent | null>(null);
  const [ramsSelectedEvent, setRamsSelectedEvent] = useState<EventData | null>(null);
  const [showProfileOverlay, setShowProfileOverlay] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Active view: 'rams' (default for requested preview) or 'guardiantrack'
  const [activeDashboard, setActiveDashboard] = useState<'rams' | 'guardiantrack'>('rams');
  const [isDesignRulesOpen, setIsDesignRulesOpen] = useState<boolean>(false);

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('guardian_theme') as ThemeMode;
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('guardian_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toast notification helper
  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch events from backend API
  const fetchEvents = useCallback(async (isSilent = true) => {
    if (!isSilent) setIsLoading(true);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      const eventList: GuardianEvent[] = data.events || [];

      setEvents((prev) => {
        let merged = [...eventList];
        if (selectedEvent && !merged.some((e) => e.id === selectedEvent.id)) {
          merged = [selectedEvent, ...merged];
        }
        return merged;
      });
      setIsOnline(true);
      setLastUpdated(new Date());

      // Deep link checking if not already open
      const hash = window.location.hash;
      if (hash.startsWith('#event-')) {
        const eventId = hash.replace('#event-', '');
        let targetEvt = eventList.find((e) => e.id === eventId || e.id.replace(/\.wav$/, '') === eventId.replace(/\.wav$/, ''));

        if (!targetEvt && eventId) {
          try {
            const singleRes = await fetch(`/api/events?id=${encodeURIComponent(eventId)}`);
            if (singleRes.ok) {
              const singleEvt = await singleRes.json();
              if (singleEvt && singleEvt.id) {
                targetEvt = singleEvt;
                setEvents((prev) => [singleEvt, ...prev.filter((e) => e.id !== singleEvt.id)]);
              }
            }
          } catch (e) {
            console.warn('Could not fetch deep-linked event by ID:', e);
          }
        }

        if (targetEvt && (!selectedEvent || selectedEvent.id !== targetEvt.id)) {
          setSelectedEvent(targetEvt);
        }
      }
    } catch (err: any) {
      console.warn('Telemetry polling notice:', err.message);
      setIsOnline(false);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [selectedEvent]);

  // Initial load and recurring 3-second polling interval
  useEffect(() => {
    fetchEvents(false);
    const interval = setInterval(() => {
      fetchEvents(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Select event & update URL hash
  const handleSelectEvent = (event: GuardianEvent) => {
    setSelectedEvent(event);
    window.location.hash = `event-${event.id}`;
  };

  // Close player & clear URL hash
  const handleClosePlayer = () => {
    setSelectedEvent(null);
    if (window.location.hash) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  };

  // Action: Purge ESP32 Queue
  const handlePurgeEsp32 = async () => {
    addToast('info', 'PURGING ESP32 QUEUE', 'Dispatching reset packet to hardware receiver memory...');
    try {
      await fetch('http://192.168.123.6:8888/clear-memory', {
        method: 'POST',
        mode: 'no-cors',
      });
      addToast('success', 'PURGE DISPATCHED', 'Purge signal sent to local ESP32 receiver queue.');
    } catch (err: any) {
      addToast('info', 'PURGE SIGNAL SENT', 'Command dispatched. Note: Direct LAN receiver is reachable when on same network.');
    }
  };

  // Action: Clear Logs
  const handleClearLogs = async () => {
    if (!window.confirm('Clear all telemetry and audio incident cards from the active monitor?')) {
      return;
    }
    try {
      const res = await fetch('/api/events?clear=true', { method: 'DELETE' });
      if (res.ok) {
        setEvents([]);
        addToast('success', 'LOGS CLEARED', 'Telemetry database and audio events have been reset.');
      } else {
        setEvents([]);
      }
    } catch (err: any) {
      setEvents([]);
      addToast('info', 'LOGS CLEARED', 'Local cache purged.');
    }
  };

  // Action: Test Live GPS Telemetry Upload (GuardianTrack)
  const handleSendTestTelemetry = async () => {
    try {
      const baseLat = 17.61325 + (Math.random() - 0.5) * 0.006;
      const baseLon = 121.72705 + (Math.random() - 0.5) * 0.006;
      const battVal = Math.floor(75 + Math.random() * 24);

      const formData = new FormData();
      formData.append('lat', baseLat.toFixed(6));
      formData.append('lon', baseLon.toFixed(6));
      formData.append('type', Math.random() > 0.6 ? 'telemetry' : 'audio');
      formData.append('batt', battVal.toString());
      formData.append('speed', (0.5 + Math.random() * 3.5).toFixed(1));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        addToast('success', 'TELEMETRY INJECTED', `Broadcasted coordinates: ${baseLat.toFixed(4)}, ${baseLon.toFixed(4)} (${battVal}% Batt)`);
        await fetchEvents(true);
      }
    } catch (err: any) {
      addToast('error', 'SIMULATION ERROR', 'Could not upload test telemetry packet.');
    }
  };

  // Action: Test Crash Incident (RAMS)
  const handleTestCrashIncident = async () => {
    try {
      const baseLat = 17.6132 + (Math.random() - 0.5) * 0.012;
      const baseLon = 121.7270 + (Math.random() - 0.5) * 0.012;
      const gForce = +(3.4 + Math.random() * 2.8).toFixed(2);
      const battery = Math.floor(70 + Math.random() * 28);
      const unitNum = Math.floor(Math.random() * 9) + 1;

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'alert',
          deviceName: `Rider Unit 0${unitNum}`,
          deviceToken: `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
          lat: baseLat,
          lon: baseLon,
          aMag: gForce,
          battPct: battery,
          title: `Severe Impact Collision Detected (${gForce}g)`
        })
      });

      if (res.ok) {
        addToast('error', 'CRASH SIMULATED', `Rider Unit 0${unitNum} reported ${gForce}g impact at ${baseLat.toFixed(4)}, ${baseLon.toFixed(4)}`);
        await fetchEvents(true);
      }
    } catch {
      addToast('info', 'OFFLINE NOTICE', 'Could not connect to simulation server.');
    }
  };

  // Action: Seed Data
  const handleSeedData = async () => {
    try {
      const res = await fetch('/api/events/seed', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        addToast('success', 'SAMPLE DATA LOADED', 'Initialized reference telemetry and audio events.');
      }
    } catch (err: any) {
      addToast('info', 'RELOADED', 'Refreshed active telemetry monitor.');
    }
  };

  // Convert events to RAMS EventData with full Wearable Registration details
  const ramsEvents: EventData[] = events.map((e) => ({
    id: e.id,
    deviceName: e.deviceName || (e.isTelemetry ? 'GPS Tracker' : 'Audio Beacon'),
    deviceToken: e.deviceToken || e.id.substring(0, 8).toUpperCase(),
    lat: e.lat,
    lon: e.lon,
    type: e.type,
    title: e.title || (e.type === 'alert' ? 'High G Impact Alert' : e.isTelemetry ? 'Live GPS Pin' : 'Wearable Capture'),
    eventTypeName: e.eventTypeName || (e.type === 'alert' ? 'Impact Trigger' : 'Telemetry Beacon'),
    aMag: e.aMag || (e.type === 'alert' ? 4.2 : 0.8),
    battPct: e.battPct || (typeof e.batt === 'number' ? e.batt : 85),
    photoUrl: e.photoUrl,
    createdAt: typeof e.createdAt === 'string' ? e.createdAt : new Date().toISOString(),
    status: e.status,
    riderName: e.riderName || e.deviceName,
    riderRole: e.riderRole,
    contactNumber: e.contactNumber,
    emergencyContactName: e.emergencyContactName,
    emergencyContactPhone: e.emergencyContactPhone,
    emergencyRelationship: e.emergencyRelationship,
    bloodType: e.bloodType,
    allergies: e.allergies,
    vehicleModel: e.vehicleModel,
    plateNumber: e.plateNumber,
    locationAddress: e.locationAddress,
    formFactor: e.formFactor,
    firmware: e.firmware,
    audioUrl: e.audioUrl
  }));

  const ramsAlertCount = ramsEvents.filter((e) => e.type === 'alert').length;
  const ramsDeviceCount = new Set(ramsEvents.map((e) => e.deviceToken).filter(Boolean)).size;

  const audioAlertCount = events.filter((e) => !e.isTelemetry && e.type === 'audio').length;
  const latestEvent = events[0] || null;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* ── View 1: RAMS Dashboard (Revised with GPS-Audio Design Rules) ── */}
      {activeDashboard === 'rams' ? (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
          <RAMSHeader
            alertCount={ramsAlertCount}
            deviceCount={ramsDeviceCount}
            lastUpdate={lastUpdated}
            isConnected={isOnline}
            theme={theme}
            onToggleTheme={toggleTheme}
            onRefresh={() => fetchEvents(false)}
            isLoading={isLoading}
            onTestIncident={handleTestCrashIncident}
            activeView="rams"
            onToggleView={() => setActiveDashboard('guardiantrack')}
            onOpenDesignRules={() => setIsDesignRulesOpen(true)}
          />

          <div className="flex flex-1 overflow-hidden relative">
            <RAMSMapView
              events={ramsEvents}
              selectedEvent={ramsSelectedEvent}
              onEventSelect={(evt) => {
                setRamsSelectedEvent(evt);
                setShowProfileOverlay(true);
              }}
              theme={theme}
            />
            <RAMSEventSidebar
              events={ramsEvents}
              selectedEvent={ramsSelectedEvent}
              onEventSelect={(evt) => {
                setRamsSelectedEvent(evt);
                setShowProfileOverlay(true);
              }}
            />
          </div>

          {/* Wearable Registration Profile Overlay Showcase Modal */}
          <RAMSWearableProfileOverlay
            event={ramsSelectedEvent}
            isOpen={showProfileOverlay}
            onClose={() => setShowProfileOverlay(false)}
          />
        </div>
      ) : (
        /* ── View 2: GuardianTrack Audio & GPS Monitor ── */
        <div className="min-h-screen flex flex-col">
          {/* Top Brand Header & Action Toolbar */}
          <Header
            theme={theme}
            onToggleTheme={toggleTheme}
            isOnline={isOnline}
            alertCount={audioAlertCount}
            lastUpdated={lastUpdated}
            onRefresh={() => fetchEvents(false)}
            isLoading={isLoading}
            onPurgeEsp32={handlePurgeEsp32}
            onClearLogs={handleClearLogs}
            onSendTestTelemetry={handleSendTestTelemetry}
          />

          {/* Banner to switch back to RAMS */}
          <div className="bg-neutral-900 text-white px-4 py-1.5 flex items-center justify-between text-xs font-mono font-bold">
            <span>GUARDIANTRACK PARENT MONITOR ACTIVE</span>
            <button
              onClick={() => setActiveDashboard('rams')}
              className="px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              SWITCH TO RAMS DASHBOARD PREVIEW
            </button>
          </div>

          {/* Main Workspace Layout */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
            
            {/* Modular Telemetry Metric Bar */}
            <TelemetryBar
              latestEvent={latestEvent}
              events={events}
            />

            {/* 2-Column Responsive Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Live Map Tracking Stage (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <MapContainer
                  events={events}
                  theme={theme}
                  onSelectEvent={handleSelectEvent}
                  selectedEventId={selectedEvent?.id}
                />
              </div>

              {/* Right Column: Audio & Incident Stream (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <EventsList
                  events={events}
                  onSelectEvent={handleSelectEvent}
                  selectedEventId={selectedEvent?.id}
                  onSeedData={handleSeedData}
                />
              </div>

            </div>

          </main>

          {/* Minimalist Sub-Footer */}
          <footer className="border-t border-neutral-300 dark:border-neutral-800 py-4 bg-white dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 text-xs font-mono transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>GUARDIAN TRACKING ARCHITECTURE • BOLD TYPOGRAPHY SPEC</span>
              </div>
              <div className="flex items-center gap-4 font-bold">
                <span className="text-neutral-400 dark:text-neutral-600">POLL: 3000ms</span>
              </div>
            </div>
          </footer>

          {/* Audio Player Modal */}
          <AudioPlayerModal
            event={selectedEvent}
            theme={theme}
            onClose={handleClosePlayer}
            onNavigateToMap={() => {}}
          />
        </div>
      )}

      {/* GPS-Audio Design Rules Modal */}
      <DesignRulesModal
        isOpen={isDesignRulesOpen}
        onClose={() => setIsDesignRulesOpen(false)}
      />

      {/* Toast Notification Stream */}
      <Toast
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}
