/*
 * Road Accident Monitoring System — Map View
 * =============================================
 * react-leaflet + supercluster for clustered, color-coded markers.
 *
 * Color scheme:
 *   Red    = active alert (PKT_ALERT)
 *   Amber  = test event (PKT_TEST)
 *   Green  = false alarm (PKT_FALSE_ALARM)
 *   Blue   = telemetry ping (PKT_TELEMETRY)
 *
 * Clusters show a count badge, colored by the highest-severity event inside.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Supercluster from 'supercluster';
import { EventData, getMarkerColor, getStatusLabel, formatTimestamp } from '../types';
import EventPopup from './EventPopup';

// Default center: Tuguegarao City, Cagayan
const DEFAULT_CENTER: [number, number] = [17.6132, 121.7270];
const DEFAULT_ZOOM = 13;

interface MapViewProps {
  events: EventData[];
  selectedEvent: EventData | null;
  onEventSelect: (event: EventData) => void;
}

// ── Custom Marker Icons ─────────────────────────────────────────────────────

function createMarkerIcon(color: string, size = 18): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="custom-marker marker-${color}" style="width:${size}px;height:${size}px;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createClusterIcon(count: number, color: string, size = 36): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="cluster-marker marker-${color}" style="width:${size}px;height:${size}px;">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Priority for cluster coloring: red > amber > green > blue
const COLOR_PRIORITY: Record<string, number> = { red: 4, amber: 3, green: 2, blue: 1 };

function getHighestSeverityColor(colors: string[]): string {
  let max = 'blue';
  let maxPri = 0;
  for (const c of colors) {
    const pri = COLOR_PRIORITY[c] || 0;
    if (pri > maxPri) { maxPri = pri; max = c; }
  }
  return max;
}

// ── Map Controller (handles flyTo on selection) ─────────────────────────────

function MapController({ selectedEvent }: { selectedEvent: EventData | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedEvent && selectedEvent.lat && selectedEvent.lon) {
      map.flyTo([selectedEvent.lat, selectedEvent.lon], 16, { duration: 1.0 });
    }
  }, [selectedEvent, map]);

  return null;
}

// ── Map Events (tracks bounds/zoom for clustering) ──────────────────────────

function MapEvents({ onMove }: { onMove: (map: L.Map) => void }) {
  const map = useMapEvents({
    moveend: () => onMove(map),
    zoomend: () => onMove(map),
  });

  useEffect(() => {
    onMove(map);
  }, [map, onMove]);

  return null;
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function MapView({ events, selectedEvent, onEventSelect }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);

  // Filter events that have valid GPS coordinates
  const geoEvents = useMemo(
    () => events.filter(e => e.lat && e.lon && (e.lat !== 0 || e.lon !== 0)),
    [events]
  );

  // Build supercluster index
  const cluster = useMemo(() => {
    const sc = new Supercluster({
      radius: 60,
      maxZoom: 17,
    });

    const points = geoEvents.map(event => ({
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

  // Get clusters for current viewport
  const clusters = useMemo(() => {
    if (!bounds) return [];
    const bbox: [number, number, number, number] = [
      bounds[0][1], bounds[0][0], bounds[1][1], bounds[1][0]
    ];
    return cluster.getClusters(bbox, zoom);
  }, [cluster, bounds, zoom]);

  // Update bounds/zoom on map move
  const handleMapMove = (map: L.Map) => {
    const b = map.getBounds();
    setBounds([
      [b.getSouth(), b.getWest()],
      [b.getNorth(), b.getEast()],
    ]);
    setZoom(map.getZoom());
  };

  return (
    <div className="map-container dark-map-tiles">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <MapEvents onMove={handleMapMove} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedEvent={selectedEvent} />

        {clusters.map((feature, idx) => {
          const [lng, lat] = feature.geometry.coordinates;
          const isCluster = feature.properties.cluster;

          if (isCluster) {
            const count = feature.properties.point_count;
            const clusterSize = Math.min(50, 30 + count * 2);

            // Get the color of the highest-severity event in this cluster
            const leaves = cluster.getLeaves(feature.properties.cluster_id, Infinity);
            const colors = leaves.map(l => getMarkerColor(l.properties.event));
            const clusterColor = getHighestSeverityColor(colors);

            return (
              <Marker
                key={`cluster-${feature.properties.cluster_id}`}
                position={[lat, lng]}
                icon={createClusterIcon(count, clusterColor, clusterSize)}
                eventHandlers={{
                  click: () => {
                    const expansionZoom = cluster.getClusterExpansionZoom(feature.properties.cluster_id);
                    mapRef.current?.flyTo([lat, lng], expansionZoom, { duration: 0.5 });
                  },
                }}
              />
            );
          }

          // Individual marker
          const event: EventData = feature.properties.event;
          const color = getMarkerColor(event);

          return (
            <Marker
              key={event.id}
              position={[lat, lng]}
              icon={createMarkerIcon(color, 20)}
              eventHandlers={{
                click: () => onEventSelect(event),
              }}
            >
              <Popup maxWidth={320}>
                <EventPopup event={event} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
