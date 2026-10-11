/*
 * Road Accident Monitoring System — Event Sidebar
 * ==================================================
 * Scrollable event feed, newest first. Each entry shows the device
 * photo/name, timestamp, event type badge, and location.
 * Click to center the map on the event.
 */

import { EventData, getMarkerColor, getStatusLabel, formatTimestamp } from '../types';

interface EventSidebarProps {
  events: EventData[];
  selectedEvent: EventData | null;
  onEventSelect: (event: EventData) => void;
}

export default function EventSidebar({ events, selectedEvent, onEventSelect }: EventSidebarProps) {
  // Filter to events with GPS data, sorted newest first
  const displayEvents = events
    .filter(e => e.lat && e.lon && (e.lat !== 0 || e.lon !== 0))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>📋 Event Feed</h2>
        <span className="count">{displayEvents.length} events</span>
      </div>

      <div className="event-list">
        {displayEvents.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📡</div>
            <p>No events yet.<br />Wearable devices will appear here when they start transmitting.</p>
          </div>
        ) : (
          displayEvents.map(event => {
            const isSelected = selectedEvent?.id === event.id;
            const statusLabel = getStatusLabel(event);

            return (
              <div
                key={event.id}
                className="event-card"
                style={isSelected ? { borderColor: 'var(--border-active)', background: 'var(--bg-card-hover)' } : {}}
                onClick={() => onEventSelect(event)}
              >
                <div className="event-card-header">
                  {event.photoUrl ? (
                    <img
                      className="event-card-photo"
                      src={event.photoUrl}
                      alt={event.deviceName}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        // Replace broken image with placeholder
                        const parent = img.parentElement;
                        if (parent) {
                          img.style.display = 'none';
                          const placeholder = document.createElement('div');
                          placeholder.className = 'event-card-photo-placeholder';
                          placeholder.textContent = (event.deviceName || '?').charAt(0).toUpperCase();
                          parent.insertBefore(placeholder, img);
                        }
                      }}
                    />
                  ) : (
                    <div className="event-card-photo-placeholder">
                      {(event.deviceName || '?').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="event-card-info">
                    <div className="event-card-name">{event.deviceName || event.deviceToken}</div>
                    <div className="event-card-time">{formatTimestamp(event.createdAt)}</div>
                  </div>

                  <span className={`event-card-badge badge-${event.type}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="event-card-title">{event.title}</div>
                <div className="event-card-location">
                  📍 {event.lat.toFixed(6)}, {event.lon.toFixed(6)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
