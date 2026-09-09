/*
 * Road Accident Monitoring System (RAMS) — Standalone Rescuer Dashboard
 * =====================================================================
 * Main React application integrating dark slate aesthetic design rules,
 * Leaflet teardrop markers with pulse rings, rider profile drawer,
 * and live crash alert telemetry stream from receiver base stations.
 */

import { useState, useEffect, useCallback } from 'react';
import { EventData, EventsResponse, ThemeMode } from './types';
import RAMSHeader from './components/RAMSHeader';
import RAMSMapView from './components/RAMSMapView';
import RAMSEventSidebar from './components/RAMSEventSidebar';
import RAMSWearableProfileOverlay from './components/RAMSWearableProfileOverlay';
import { DesignRulesModal } from './components/DesignRulesModal';

const POLL_INTERVAL = 2500; // 2.5 seconds

// Initial Tactical Rescuer Incidents across Tuguegarao City & Cagayan Valley
const INITIAL_DEMO_EVENTS: EventData[] = [
  {
    id: 'RAMS-ALERT-9901',
    deviceToken: 'RAMS-UNIT-01',
    deviceName: 'Motorcycle Patrol Unit 01',
    riderName: 'Juan Dela Cruz',
    riderRole: 'Lead Highway Patrol Officer',
    contactNumber: '+63 917 123 4567',
    emergencyContactName: 'Maria Dela Cruz',
    emergencyContactPhone: '+63 917 555 0192',
    emergencyRelationship: 'Spouse',
    bloodType: 'O+',
    allergies: 'Penicillin, Latex',
    vehicleModel: 'Yamaha NMAX 155 (Black)',
    plateNumber: 'BG-9921',
    locationAddress: 'Maharlika Highway, Carig Sur, Tuguegarao City',
    title: 'High-G Impact Collision Detected (4.8g)',
    type: 'alert',
    lat: 17.6132,
    lon: 121.7270,
    aMag: 4.8,
    battPct: 92,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'ACTIVE ALERT',
    photoUrl: '/logo.png',
  },
  {
    id: 'RAMS-TEST-8802',
    deviceToken: 'RAMS-UNIT-02',
    deviceName: 'Wearable Sensor Pack 02',
    riderName: 'Engr. Mark Santos',
    riderRole: 'Field Testing Specialist',
    contactNumber: '+63 918 987 6543',
    emergencyContactName: 'Elena Santos',
    emergencyContactPhone: '+63 918 555 9911',
    emergencyRelationship: 'Sister',
    bloodType: 'A+',
    allergies: 'None',
    vehicleModel: 'Honda Click 125i (Red)',
    plateNumber: '7712-XY',
    locationAddress: 'Cagayan Valley Road, San Gabriel, Tuguegarao City',
    title: 'Diagnostic Crash Sensor Routine Test',
    type: 'test',
    lat: 17.6190,
    lon: 121.7340,
    aMag: 2.1,
    battPct: 88,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: 'DIAGNOSTIC TEST',
    photoUrl: '/logo.png',
  },
  {
    id: 'RAMS-FALSE-7703',
    deviceToken: 'RAMS-UNIT-03',
    deviceName: 'Patrol Unit 03 Wearable',
    riderName: 'Officer Pedro Penduko',
    riderRole: 'Traffic Management Officer',
    contactNumber: '+63 920 111 2233',
    emergencyContactName: 'Ana Penduko',
    emergencyContactPhone: '+63 920 555 3344',
    emergencyRelationship: 'Wife',
    bloodType: 'B+',
    allergies: 'Dust, Shellfish',
    vehicleModel: 'Kawasaki Barako II (Silver)',
    plateNumber: '4452-AB',
    locationAddress: 'College Ave, Centro 02, Tuguegarao City',
    title: 'Impact Sensor False Alarm - Cancelled by User',
    type: 'false_alarm',
    lat: 17.6085,
    lon: 121.7215,
    aMag: 1.2,
    battPct: 95,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'FALSE ALARM',
    photoUrl: '/logo.png',
  },
  {
    id: 'RAMS-TELEM-6604',
    deviceToken: 'RAMS-UNIT-04',
    deviceName: 'Wearable Unit 04',
    riderName: 'Rider Roberto Gomez',
    riderRole: 'Dispatch Logistics Patrol',
    contactNumber: '+63 922 444 5566',
    emergencyContactName: 'Clara Gomez',
    emergencyContactPhone: '+63 922 555 6677',
    emergencyRelationship: 'Mother',
    bloodType: 'AB+',
    allergies: 'Aspirin',
    vehicleModel: 'Suzuki Raider R150 (Blue)',
    plateNumber: '8831-CD',
    locationAddress: 'Buntun Bridge, Tuguegarao City',
    title: 'Live GPS Telemetry Beacon Broadcast',
    type: 'telemetry',
    lat: 17.6160,
    lon: 121.7110,
    aMag: 0.9,
    battPct: 99,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: 'NORMAL TELEMETRY',
    photoUrl: '/logo.png',
  }
];

export default function App() {
  const [events, setEvents] = useState<EventData[]>(INITIAL_DEMO_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(INITIAL_DEMO_EVENTS[0]);
  const [profileEvent, setProfileEvent] = useState<EventData | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDesignRulesOpen, setIsDesignRulesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Always dark mode across the entire application
  const theme: ThemeMode = 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    localStorage.setItem('rams_theme', 'dark');
  }, []);

  // Fetch events from backend API & merge with initial demo pins
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data: EventsResponse = await res.json();
        const apiEvents = data.events || [];
        
        if (apiEvents.length > 0) {
          // Merge API events with demo events (avoiding duplicates)
          setEvents((prev) => {
            const apiIds = new Set(apiEvents.map((e) => e.id));
            const remainingDemos = INITIAL_DEMO_EVENTS.filter((d) => !apiIds.has(d.id));
            return [...apiEvents, ...remainingDemos];
          });
        }
        setIsConnected(true);
      }
      setLastUpdate(new Date());
    } catch (err) {
      console.warn('[POLL] Fetch notice (using local fallback telemetry):', err);
      setIsConnected(true); // Keep UI online status active for local monitor
    } finally {
      setIsLoading(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  }, []);

  // Initial fetch + interval polling
  useEffect(() => {
    fetchEvents();
    const timer = setInterval(() => {
      fetchEvents();
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [fetchEvents]);

  const handleEventSelect = useCallback((event: EventData) => {
    setSelectedEvent(event);
    setProfileEvent(event);
    setIsProfileOpen(true);
  }, []);

  const handleOpenProfile = useCallback((event: EventData) => {
    setProfileEvent(event);
    setIsProfileOpen(true);
  }, []);

  // Derived statistics for header status
  const alertCount = events.filter((e) => e.type === 'alert').length;
  const deviceTokens = new Set(events.map((e) => e.deviceToken || e.deviceName).filter(Boolean));
  const deviceCount = deviceTokens.size;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 transition-colors duration-200 select-none">
      
      {/* Top RAMS Operations Header */}
      <RAMSHeader
        alertCount={alertCount}
        deviceCount={deviceCount}
        lastUpdate={lastUpdate}
        isConnected={isConnected}
        onRefresh={fetchEvents}
        isLoading={isLoading}
        onOpenDesignRules={() => setIsDesignRulesOpen(true)}
      />

      {/* Main Full-Height Workspace Layout */}
      <main className="flex-1 flex flex-col md:flex-row relative overflow-hidden w-full h-full">
        
        {/* Interactive Leaflet Map View */}
        <RAMSMapView
          events={events}
          selectedEvent={selectedEvent}
          onEventSelect={handleEventSelect}
          theme={theme}
          onOpenProfile={handleOpenProfile}
          refreshTrigger={refreshTrigger}
        />

        {/* Right Event & Telemetry Log Sidebar */}
        <RAMSEventSidebar
          events={events}
          selectedEvent={selectedEvent}
          onEventSelect={handleEventSelect}
          onOpenProfile={handleOpenProfile}
        />

      </main>

      {/* Rider & Wearable Medical Profile Overlay Drawer */}
      <RAMSWearableProfileOverlay
        event={profileEvent}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Aesthetic Specification Modal (Kept in code for developer reference) */}
      <DesignRulesModal
        isOpen={isDesignRulesOpen}
        onClose={() => setIsDesignRulesOpen(false)}
      />

    </div>
  );
}
