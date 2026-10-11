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

export default function App() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
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

  // Fetch events strictly from backend API (real Android registrations & LoRa incidents only)
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data: EventsResponse = await res.json();
        const apiEvents = data.events || [];
        setEvents(apiEvents);
        setIsConnected(true);
      }
      setLastUpdate(new Date());
    } catch (err) {
      console.warn('[POLL] Fetch notice:', err);
      setIsConnected(false);
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

  // Immediate refresh on manual action (e.g. marking incident rescued)
  useEffect(() => {
    const handleImmediateRefresh = () => fetchEvents();
    window.addEventListener('rams-refresh-events', handleImmediateRefresh);
    return () => window.removeEventListener('rams-refresh-events', handleImmediateRefresh);
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
