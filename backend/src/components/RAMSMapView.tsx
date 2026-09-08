import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import Supercluster from 'supercluster';
import { createRoot } from 'react-dom/client';
import { EventData, ThemeMode, getMarkerColor } from '../types';
import RAMSEventPopup from './RAMSEventPopup';

const DEFAULT_CENTER: [number, number] = [17.6132, 121.7270];
const DEFAULT_ZOOM = 13;

interface MapViewProps {
  events: EventData[];
  selectedEvent: EventData | null;
  onEventSelect: (event: EventData) => void;
  theme: ThemeMode;
  onOpenProfile?: (event: EventData) => void;
}

function createAestheticMarkerIcon(event: EventData, isSelected = false): L.DivIcon {
  const isAlert = event.type === 'alert';
  const isTest = event.type === 'test';
  const isFalseAlarm = event.type === 'false_alarm';

  let pinColor = '#3b82f6';
  let pinShadow = '0 6px 14px rgba(59, 130, 246, 0.45)';
  let glyphSvg = '';

  if (isAlert) {
    pinColor = '#ef4444';
    pinShadow = '0 8px 18px rgba(239, 68, 68, 0.65)';
    // Crash shock / exclamation glyph
    glyphSvg = `
      <path d="M12 7v7" stroke="#ef4444" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="12" cy="17" r="1.4" fill="#ef4444" />
    `;
  } else if (isTest) {
    pinColor = '#f59e0b';
    pinShadow = '0 6px 14px rgba(245, 158, 11, 0.45)';
    // Wrench / tool diagnostic glyph
    glyphSvg = `
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" 
        stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="scale(0.85) translate(2, 2)"/>
    `;
  } else if (isFalseAlarm) {
    pinColor = '#10b981';
    pinShadow = '0 6px 14px rgba(16, 185, 129, 0.45)';
    // Shield check glyph
    glyphSvg = `
      <path d="M8 12l2.5 2.5 5.5-5.5" stroke="#10b981" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    `;
  } else {
    // Navigation / GPS beacon glyph
    glyphSvg = `
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" 
        stroke="#3b82f6" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      <circle cx="12" cy="12" r="2.2" fill="#3b82f6" />
    `;
  }

  const rawLabel = event.riderName || event.deviceName || event.deviceToken || 'UNIT';
  const shortName = rawLabel.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');

  const width = isSelected ? 38 : 32;
  const height = isSelected ? 48 : 42;

  const html = `
    <div class="relative flex flex-col items-center cursor-pointer select-none transition-all duration-200 group ${isSelected ? 'scale-110 z-30' : 'hover:scale-110 hover:-translate-y-1'}" style="width:${width}px;height:${height + 16}px;">
      ${isAlert ? '<div class="pin-radar-ring"></div>' : ''}
      
      <!-- Teardrop Pin Shape -->
      <svg width="${width}" height="${height}" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(${pinShadow});">
        <!-- Pin Base Path with pointer tip -->
        <path d="M18 1C8.611 1 1 8.611 1 18C1 28.5 15.5 42.5 17.2 44.3C17.6 44.8 18.4 44.8 18.8 44.3C20.5 42.5 35 28.5 35 18C35 8.611 27.389 1 18 1Z" 
          fill="${pinColor}" 
          stroke="${isSelected ? '#ffffff' : 'rgba(255,255,255,0.9)'}" 
          stroke-width="${isSelected ? '3' : '2'}"
        />
        <!-- Inner Circular Disc -->
        <circle cx="18" cy="18" r="11" fill="#ffffff" />
        <!-- Centered SVG Icon Glyph -->
        <g transform="translate(6, 6)">
          ${glyphSvg}
        </g>
      </svg>

      <!-- Attached Monospace Label Pill -->
      <div class="absolute -bottom-1 px-1.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wider text-white bg-neutral-900/90 dark:bg-black/90 border border-neutral-700/80 shadow-md whitespace-nowrap pointer-events-none transition-all flex items-center gap-1">
        ${isAlert ? '<span class="text-rose-400 font-black">!</span>' : ''}<span>${shortName}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-styled-pin-marker',
    html,
    iconSize: [width, height + 16],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 2],
  });
}

function createClusterIcon(count: number, color: string): L.DivIcon {
  const bgColors: Record<string, { hex: string; shadow: string }> = {
    red: { hex: '#ef4444', shadow: '0 8px 18px rgba(239, 68, 68, 0.65)' },
    amber: { hex: '#f59e0b', shadow: '0 6px 14px rgba(245, 158, 11, 0.45)' },
    green: { hex: '#10b981', shadow: '0 6px 14px rgba(16, 185, 129, 0.45)' },
    blue: { hex: '#3b82f6', shadow: '0 6px 14px rgba(59, 130, 246, 0.45)' }
  };
  const config = bgColors[color] || bgColors.blue;
  const isRed = color === 'red';

  const width = Math.min(48, 36 + count * 2);
  const height = Math.min(58, 44 + count * 2);

  const html = `
    <div class="relative flex flex-col items-center cursor-pointer select-none transition-all duration-200 group hover:scale-110 hover:-translate-y-1" style="width:${width}px;height:${height + 16}px;">
      ${isRed ? '<div class="pin-radar-ring"></div>' : ''}
      
      <!-- Teardrop Pin Shape for Zoomed Out Cluster Pin -->
      <svg width="${width}" height="${height}" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(${config.shadow});">
        <!-- Pin Base Path with pointer tip -->
        <path d="M18 1C8.611 1 1 8.611 1 18C1 28.5 15.5 42.5 17.2 44.3C17.6 44.8 18.4 44.8 18.8 44.3C20.5 42.5 35 28.5 35 18C35 8.611 27.389 1 18 1Z" 
          fill="${config.hex}" 
          stroke="#ffffff" 
          stroke-width="2.5"
        />
        <!-- Inner White Disc -->
        <circle cx="18" cy="18" r="11" fill="#ffffff" />
        <!-- Centered Cluster Count Number -->
        <text x="18" y="22" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="${config.hex}" text-anchor="middle">
          ${count}
        </text>
      </svg>

      <!-- Attached Monospace Label Pill -->
      <div class="absolute -bottom-1 px-1.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wider text-white bg-neutral-900/90 dark:bg-black/90 border border-neutral-700/80 shadow-md whitespace-nowrap pointer-events-none transition-all">
        ${count} ${count === 1 ? 'UNIT' : 'UNITS'}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-styled-cluster-marker',
    html,
    iconSize: [width, height + 16],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 2],
  });
}

const COLOR_PRIORITY: Record<string, number> = { red: 4, amber: 3, green: 2, blue: 1 };

function getHighestSeverityColor(colors: string[]): string {
  let max = 'blue';
  let maxPri = 0;
  for (const c of colors) {
    const pri = COLOR_PRIORITY[c] || 0;
    if (pri > maxPri) {
      maxPri = pri;
      max = c;
    }
  }
  return max;
}

export default function RAMSMapView({ events, selectedEvent, onEventSelect, theme, onOpenProfile }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const geoEvents = useMemo(
    () => events.filter((e) => e.lat && e.lon && (e.lat !== 0 || e.lon !== 0)),
    [events]
  );

  const clusterIndex = useMemo(() => {
    const sc = new Supercluster({
      radius: 60,
      maxZoom: 17,
    });
    const points = geoEvents.map((event) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [event.lon, event.lat],
      },
      properties: { event },
    }));
    sc.load(points);
    return sc;
  }, [geoEvents]);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update clusters and markers on map viewport change or events change
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    const updateMarkers = () => {
      layerGroup.clearLayers();
      const b = map.getBounds();
      const zoom = Math.floor(map.getZoom());
      const bbox: [number, number, number, number] = [
        b.getWest(), b.getSouth(), b.getEast(), b.getNorth()
      ];

      const clusters = clusterIndex.getClusters(bbox, zoom);

      clusters.forEach((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const isCluster = feature.properties.cluster;

        if (isCluster) {
          const count = feature.properties.point_count;
          const clusterSize = Math.min(48, 28 + count * 2);
          const leaves = clusterIndex.getLeaves(feature.properties.cluster_id, Infinity);
          const colors = leaves.map((l: any) => getMarkerColor(l.properties.event));
          const clusterColor = getHighestSeverityColor(colors);

          const marker = L.marker([lat, lng], {
            icon: createClusterIcon(count, clusterColor),
          });

          marker.on('click', () => {
            const expansionZoom = clusterIndex.getClusterExpansionZoom(feature.properties.cluster_id);
            map.flyTo([lat, lng], expansionZoom, { duration: 0.5 });
          });

          layerGroup.addLayer(marker);
        } else {
          const event: EventData = feature.properties.event;
          const isSelected = selectedEvent?.id === event.id;

          const marker = L.marker([lat, lng], {
            icon: createAestheticMarkerIcon(event, isSelected),
            zIndexOffset: isSelected ? 1000 : 10,
          });

          marker.on('click', () => {
            onEventSelect(event);
          });

          // Bind React popup for in-map hover/click tooltip
          const popupDiv = document.createElement('div');
          const root = createRoot(popupDiv);
          root.render(<RAMSEventPopup event={event} onOpenProfile={() => onOpenProfile?.(event)} />);

          marker.bindPopup(popupDiv, {
            className: 'custom-leaflet-popup',
            maxWidth: 320,
          });

          layerGroup.addLayer(marker);
        }
      });
    };

    updateMarkers();

    map.on('moveend', updateMarkers);
    map.on('zoomend', updateMarkers);

    return () => {
      map.off('moveend', updateMarkers);
      map.off('zoomend', updateMarkers);
    };
  }, [clusterIndex, onEventSelect, selectedEvent]);

  // Center on selected event
  useEffect(() => {
    if (selectedEvent && selectedEvent.lat && selectedEvent.lon && mapRef.current) {
      mapRef.current.flyTo([selectedEvent.lat, selectedEvent.lon], 16, { duration: 1.0 });
    }
  }, [selectedEvent]);

  const tilePaneClass = theme === 'dark' ? 'dark-map-tiles' : 'light-map-tiles';

  return (
    <div className={`flex-1 h-full w-full relative min-h-[400px] ${tilePaneClass}`}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
