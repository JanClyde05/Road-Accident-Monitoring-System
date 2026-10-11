/*
 * Road Accident Monitoring System — Event Popup
 * ================================================
 * Profile card shown when clicking a map pin.
 * Displays: photo, name, token, timestamp, location, event type.
 */

import { EventData, getStatusLabel, getMarkerColor, formatTimestamp } from '../types';

interface EventPopupProps {
  event: EventData;
}

export default function EventPopup({ event }: EventPopupProps) {
  const color = getMarkerColor(event);
  const statusLabel = getStatusLabel(event);

  return (
    <div className="popup-card">
      <div className="popup-card-header">
        {event.photoUrl ? (
          <img
            className="popup-photo"
            src={event.photoUrl}
            alt={event.deviceName}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
            }}
          />
        ) : null}
        <div className="popup-photo-placeholder" style={event.photoUrl ? { display: 'none' } : {}}>
          {(event.deviceName || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="popup-name">{event.deviceName || event.deviceToken}</div>
          <div className="popup-token">Token: {event.deviceToken}</div>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span className={`event-card-badge badge-${event.type}`}>
          {statusLabel}
        </span>
      </div>

      <div className="popup-detail">
        <span className="popup-detail-label">Event</span>
        <span className="popup-detail-value">{event.title}</span>
      </div>

      {event.eventTypeName && (
        <div className="popup-detail">
          <span className="popup-detail-label">Type</span>
          <span className="popup-detail-value">{event.eventTypeName}</span>
        </div>
      )}

      {event.aMag !== undefined && event.aMag > 0 && (
        <div className="popup-detail">
          <span className="popup-detail-label">Peak G</span>
          <span className="popup-detail-value">{event.aMag.toFixed(2)}g</span>
        </div>
      )}

      {event.battPct !== undefined && event.battPct > 0 && (
        <div className="popup-detail">
          <span className="popup-detail-label">Battery</span>
          <span className="popup-detail-value">{event.battPct}%</span>
        </div>
      )}

      <div className="popup-detail">
        <span className="popup-detail-label">Location</span>
        <span className="popup-detail-value" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
          {event.lat.toFixed(6)}, {event.lon.toFixed(6)}
        </span>
      </div>

      <div className="popup-detail">
        <span className="popup-detail-label">Time</span>
        <span className="popup-detail-value">{formatTimestamp(event.createdAt)}</span>
      </div>
    </div>
  );
}
