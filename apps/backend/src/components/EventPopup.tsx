/*
 * Road Accident Monitoring System — Event Popup
 * ================================================
 * Profile card shown when clicking a map pin.
 * Displays: photo, name, token, timestamp, location, event type.
 */

import { EventData, getStatusLabel, getMarkerColor, formatTimestamp, classifyAccident } from '../types';

interface EventPopupProps {
  event: EventData;
}

export default function EventPopup({ event }: EventPopupProps) {
  const color = getMarkerColor(event);
  const statusLabel = getStatusLabel(event);
  const classification = classifyAccident(event);

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

      <div style={{ marginBottom: '8px', padding: '6px 8px', borderRadius: '6px', background: '#27272a', border: '1px solid #3f3f46' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span className={`event-card-badge badge-${event.type}`} style={{ fontWeight: 800 }}>
            {classification.label}
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#a1a1aa' }}>
            {classification.severity}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#d4d4d8', lineHeight: 1.4 }}>
          {classification.description}
        </div>
      </div>

      <div className="popup-detail">
        <span className="popup-detail-label">Event</span>
        <span className="popup-detail-value">{event.title}</span>
      </div>

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
