import React, { useState, useEffect, useMemo } from 'react';
import { EventData, getStatusLabel, formatTimestamp, formatDirectDriveUrl, isEventFalseAlarm, isEventRescued, isEventActiveAlert } from '../types';
import { 
  X, 
  UserCheck, 
  Phone, 
  AlertTriangle, 
  Activity, 
  Battery, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  ShieldCheck,
  Copy, 
  Check, 
  ExternalLink, 
  Radio, 
  Cpu, 
  Truck, 
  HeartPulse, 
  Share2,
  User,
  Edit3,
  Save,
  Navigation,
  History,
  Link as LinkIcon
} from 'lucide-react';

interface WearableProfileOverlayProps {
  event: EventData | null;
  allEvents?: EventData[];
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
  onLocateIncident?: (event: EventData) => void;
}

export default function RAMSWearableProfileOverlay({
  event,
  allEvents = [],
  isOpen,
  onClose,
  onProfileUpdated,
  onLocateIncident
}: WearableProfileOverlayProps) {
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedDispatch, setCopiedDispatch] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'alerts' | 'telemetry'>('all');
  
  // Rescue & clearance action state
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Edit Profile Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDriveLink, setEditDriveLink] = useState('');
  const [editVehicle, setEditVehicle] = useState('');
  const [editPlate, setEditPlate] = useState('');
  const [editBlood, setEditBlood] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setImageError(false);
    setIsEditing(false);
    if (event) {
      const hasRealName = event.riderName && 
        !event.riderName.startsWith('RAMS-') && 
        !event.riderName.startsWith('Rider RAMS-') && 
        event.riderName !== event.deviceToken;
      setEditName(hasRealName ? (event.riderName || '') : '');
      setEditDriveLink(event.photoUrl || '');
      setEditVehicle(event.vehicleModel || 'Motorcycle');
      setEditPlate(event.plateNumber || '');
      setEditBlood(event.bloodType || 'O+');
      setEditEmergencyName(event.emergencyContactName || '');
      setEditEmergencyPhone(event.emergencyContactPhone || '');
      setEditAllergies(event.allergies || 'None');
    }
  }, [event]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) setIsEditing(false);
        else onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditing, onClose]);

  // Compute full accident & incident history for this specific person
  const personHistory = useMemo(() => {
    if (!allEvents || !event) return [];
    const token = (event.deviceToken || '').toLowerCase().trim();
    const name = (event.riderName || '').toLowerCase().trim();
    return allEvents
      .filter((e) => {
        if (e.type === 'test') return false;
        const eToken = (e.deviceToken || '').toLowerCase().trim();
        const eName = (e.riderName || '').toLowerCase().trim();
        const tokenMatch = Boolean(token && eToken && (token === eToken || token.includes(eToken) || eToken.includes(token)));
        const nameMatch = Boolean(name && eName && name === eName);
        return tokenMatch || nameMatch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allEvents, event]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'alerts') {
      return personHistory.filter((e) => e.type === 'alert' || isEventFalseAlarm(e));
    } else if (historyFilter === 'telemetry') {
      return personHistory.filter((e) => e.type === 'telemetry');
    }
    return personHistory;
  }, [personHistory, historyFilter]);

  if (!isOpen || !event) return null;

  // Crucial fix: Properly declare address variable to resolve ReferenceError crash
  const address = event.locationAddress || 
    ((Math.abs(event.lat) > 0.0001 || Math.abs(event.lon) > 0.0001) 
      ? `GPS Coordinates: ${event.lat.toFixed(5)}°, ${event.lon.toFixed(5)}°` 
      : 'GPS Signal Unacquired');

  const hasRealName = Boolean(event.riderName && 
    !event.riderName.startsWith('RAMS-') && 
    !event.riderName.startsWith('Rider RAMS-') && 
    !event.riderName.startsWith('DEV-') &&
    event.riderName !== event.deviceToken);

  const displayRiderName = hasRealName ? event.riderName : `Unregistered Rider`;
  const role = event.riderRole || (event.type === 'alert' ? 'Active Motorist / Courier' : 'Commuter Safety Wearable');
  const token = event.deviceToken || 'UNKNOWN';
  const phone = event.contactNumber || '+63 917 555 2381';
  const emergencyName = event.emergencyContactName || 'Dispatch EOC';
  const emergencyPhone = event.emergencyContactPhone || '+63 911 000 0000';
  const emergencyRel = event.emergencyRelationship || 'Emergency Services';
  const bloodType = event.bloodType || 'O+';
  const allergies = event.allergies || 'None';
  const vehicle = event.vehicleModel || 'Motorcycle';
  const plate = event.plateNumber || 'EMERGENCY';
  const isFa = isEventFalseAlarm(event);
  const isRescued = isEventRescued(event);
  const isAlert = isEventActiveAlert(event);
  const statusLabel = getStatusLabel(event);

  const directPhotoUrl = formatDirectDriveUrl(event.photoUrl);

  const getStatusBadge = () => {
    if (isRescued || isFa) {
      return 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/30';
    }
    switch (event.type) {
      case 'alert':
        return 'bg-rose-600 text-white border-rose-500 shadow-rose-900/30';
      case 'test':
        return 'bg-amber-600 text-white border-amber-500 shadow-amber-900/30';
      case 'false_alarm':
        return 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/30';
      default:
        return 'bg-blue-600 text-white border-blue-500 shadow-blue-900/30';
    }
  };

  const handleMarkRescued = async () => {
    if (!event) return;
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/events/rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: event.id, deviceToken: event.deviceToken || token })
      });
      if (!res.ok) {
        await fetch('/api/rescue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: event.id, deviceToken: event.deviceToken || token })
        });
      }
      setActionSuccessMsg('Incident marked as RESCUED!');
      setTimeout(() => setActionSuccessMsg(null), 3000);
      if (onProfileUpdated) onProfileUpdated();
      window.dispatchEvent(new CustomEvent('rams-refresh-events'));
    } catch (err) {
      console.error('Failed to mark rescued:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkFalseAlarm = async () => {
    if (!event) return;
    setIsActionLoading(true);
    try {
      await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'false_alarm', deviceToken: event.deviceToken || token })
      });
      setActionSuccessMsg('Alert marked as FALSE ALARM');
      setTimeout(() => setActionSuccessMsg(null), 3000);
      if (onProfileUpdated) onProfileUpdated();
      window.dispatchEvent(new CustomEvent('rams-refresh-events'));
    } catch (err) {
      console.error('Failed to mark false alarm:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCopyCoords = () => {
    const text = `${event.lat.toFixed(6)}, ${event.lon.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        token: token,
        name: editName.trim(),
        photoUrl: editDriveLink.trim(),
        driveLink: editDriveLink.trim(),
        vehicleModel: editVehicle.trim(),
        plateNumber: editPlate.trim(),
        bloodType: editBlood.trim(),
        emergencyContactName: editEmergencyName.trim(),
        emergencyContactPhone: editEmergencyPhone.trim(),
        allergies: editAllergies.trim()
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsEditing(false);
        if (onProfileUpdated) onProfileUpdated();
        // Trigger a custom event for global refresh
        window.dispatchEvent(new CustomEvent('rams-refresh-events'));
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyDispatch = () => {
    const dispatchText = `[RAMS EMERGENCY DISPATCH]
INCIDENT: ${event.title} (${statusLabel})
RIDER: ${displayRiderName}
TOKEN: ${token}
BLOOD TYPE: ${bloodType}
CONTACT: ${phone}
EMERGENCY CONTACT: ${emergencyName} (${emergencyRel}) - ${emergencyPhone}
LOCATION: ${event.lat.toFixed(6)}, ${event.lon.toFixed(6)}
ADDRESS: ${address}
VEHICLE: ${vehicle} (${plate})
G-FORCE: ${event.aMag ? `${event.aMag.toFixed(2)}g` : 'N/A'}
TIMESTAMP: ${new Date(event.createdAt).toLocaleString('en-PH')}`;

    navigator.clipboard.writeText(dispatchText);
    setCopiedDispatch(true);
    setTimeout(() => setCopiedDispatch(false), 2500);
  };

  const googleMapsNavUrl = `https://www.google.com/maps?q=${event.lat},${event.lon}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/65 backdrop-blur-sm transition-all duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/90 dark:bg-neutral-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center overflow-hidden p-0.5">
              <img src="/logo.png" alt="RAMS" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                Wearable Registration Profile
              </h2>
              <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                TOKEN: {token} • RAMS IOT PROTOCOL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border shadow-xs ${getStatusBadge()}`}>
              {statusLabel}
            </span>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Edit Profile Form Inline Accordion */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="p-4 rounded-xl border border-blue-300 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200 dark:border-blue-900/40">
                <span className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Rider Profile & Google Drive Photo
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-[11px] font-mono text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                    Rider Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Jan Clyde Talosig"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                    Google Drive Photo URL
                  </label>
                  <input
                    type="url"
                    value={editDriveLink}
                    onChange={(e) => setEditDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    value={editVehicle}
                    onChange={(e) => setEditVehicle(e.target.value)}
                    placeholder="e.g. Yamaha Sniper 155"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    value={editPlate}
                    onChange={(e) => setEditPlate(e.target.value)}
                    placeholder="e.g. 123-ABC"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                    Blood Type
                  </label>
                  <input
                    type="text"
                    value={editBlood}
                    onChange={(e) => setEditBlood(e.target.value)}
                    placeholder="e.g. O+, A+"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={editEmergencyName}
                    onChange={(e) => setEditEmergencyName(e.target.value)}
                    placeholder="e.g. Maria Dela Cruz"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editEmergencyPhone}
                    onChange={(e) => setEditEmergencyPhone(e.target.value)}
                    placeholder="+63 912 345 6789"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 mb-1">
                    Allergies & Medical Notes
                  </label>
                  <input
                    type="text"
                    value={editAllergies}
                    onChange={(e) => setEditAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Asthma, None"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          ) : null}

          {/* Incident Clearance & Triage Action Banner */}
          {isAlert && (
            <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 dark:bg-rose-950/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                    Active Emergency Collision Broadcast
                  </h4>
                  <p className="text-[10px] text-rose-600/80 dark:text-rose-400 font-mono">
                    Wearable broadcasting live crash alert. Clear or triage once EMT team responds.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleMarkRescued}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  title="Mark incident as Rescued / Patient cleared"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isActionLoading ? 'Updating...' : 'Mark Rescued'}</span>
                </button>

                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleMarkFalseAlarm}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  title="Cancel active alert as False Alarm"
                >
                  <span>False Alarm</span>
                </button>
              </div>
            </div>
          )}

          {isRescued && (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-bold">INCIDENT RESOLVED:</span>
              <span>Rider marked as RESCUED and secured by dispatch triage team.</span>
            </div>
          )}

          {isFa && !isRescued && (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-bold">STAND DOWN:</span>
              <span>Alert cancelled as FALSE ALARM via wearable device or dispatch.</span>
            </div>
          )}

          {actionSuccessMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold text-center animate-in fade-in">
              ✓ {actionSuccessMsg}
            </div>
          )}

          {/* Section 1: User & Registration Identity Card */}
          <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50">
            {/* User Photo */}
            <div className="relative flex-shrink-0">
              {directPhotoUrl && directPhotoUrl !== '/logo.png' && directPhotoUrl !== '/logo.jpg' && !imageError ? (
                <img
                  referrerPolicy="no-referrer"
                  src={directPhotoUrl}
                  alt={displayRiderName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 shadow-md"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-dashed border-neutral-400 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/80 flex flex-col items-center justify-center p-2 shadow-xs text-neutral-400">
                  <User className="w-8 h-8 text-neutral-400 mb-1" />
                  <span className="text-[9px] font-mono font-bold uppercase text-neutral-500">No Photo</span>
                </div>
              )}
              <span 
                className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center ${
                  (isFa || isRescued) ? 'bg-emerald-500' : (isAlert ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500')
                }`}
                title={isFa ? 'Alert Cancelled (False Alarm)' : (isRescued ? 'Patient Rescued & Cleared' : (isAlert ? 'Emergency Collision' : 'Normal Operation'))}
              />
            </div>

            {/* Rider Specs */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-neutral-950 dark:text-white uppercase truncate">
                    {displayRiderName}
                  </h3>
                  {hasRealName ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      <UserCheck className="w-3 h-3" />
                      VERIFIED RIDER
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      TOKEN: {token}
                    </span>
                  )}
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  {isEditing ? 'Close Edit' : 'Edit Profile'}
                </button>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-3">
                {role}
              </p>

              {/* Badges / Medical Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 block">Blood Type</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5" />
                    {bloodType}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 block">Allergies</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs truncate block mt-0.5" title={allergies}>
                    {allergies}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 block">Battery</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5" />
                    {event.battPct ?? 85}%
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 block">Impact Shock</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-rose-500" />
                    {typeof event.aMag === 'number' && event.aMag > 0 ? `${event.aMag.toFixed(2)}g` : '0.00g'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Registered Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Emergency Contact */}
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  Emergency Contact
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {emergencyRel}
                </span>
              </div>
              <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                {emergencyName}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <a 
                  href={`tel:${emergencyPhone.replace(/\s+/g, '')}`} 
                  className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {emergencyPhone}
                </a>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  PRIMARY
                </span>
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Truck className="w-3 h-3 text-blue-500" />
                  Registered Vehicle
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  {plate}
                </span>
              </div>
              <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                {vehicle}
              </div>
              <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                Rider Contact: {phone}
              </div>
            </div>
          </div>

          {/* Section 2.5: Rider Accident & Incident History Timeline */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    Rider Incident & Accident History
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                    {personHistory.length} Recorded Timeline Events for {displayRiderName.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* History Sub-Filter Pills */}
              <div className="flex items-center gap-1 bg-white dark:bg-neutral-950 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    historyFilter === 'all'
                      ? 'bg-neutral-900 dark:bg-neutral-800 text-white'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  All ({personHistory.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('alerts')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    historyFilter === 'alerts'
                      ? 'bg-rose-600 text-white'
                      : 'text-neutral-500 hover:text-rose-500'
                  }`}
                >
                  Accidents ({personHistory.filter(e => e.type === 'alert' || isEventFalseAlarm(e)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('telemetry')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    historyFilter === 'telemetry'
                      ? 'bg-blue-600 text-white'
                      : 'text-neutral-500 hover:text-blue-500'
                  }`}
                >
                  Pings ({personHistory.filter(e => e.type === 'telemetry').length})
                </button>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-500 font-mono">
                No incident events match the selected filter.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredHistory.map((item) => {
                  const isItemFa = isEventFalseAlarm(item);
                  const isItemRescued = isEventRescued(item);
                  const isItemAlert = isEventActiveAlert(item);
                  const isCurrent = item.id === event.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-lg border transition-all text-xs relative ${
                        isCurrent
                          ? 'ring-1 ring-blue-500/50 bg-blue-50/20 dark:bg-blue-950/20 border-blue-400 dark:border-blue-800'
                          : isItemAlert
                          ? 'bg-rose-950/15 border-rose-800/40 hover:bg-rose-950/25'
                          : (isItemRescued || isItemFa)
                          ? 'bg-emerald-950/15 border-emerald-800/40 hover:bg-emerald-950/25'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            isItemAlert ? 'bg-rose-500 animate-pulse' : (isItemRescued || isItemFa) ? 'bg-emerald-500' : 'bg-sky-500'
                          }`} />
                          <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {item.title || (isItemAlert ? 'Impact Collision Alert' : (isItemRescued ? 'Rescued Collision' : (isItemFa ? 'Impact False Alarm' : 'GPS Beacon')))}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-black uppercase bg-blue-600 text-white">
                              CURRENT
                            </span>
                          )}
                        </div>

                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 border ${
                          isItemAlert
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                            : isItemRescued
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                            : isItemFa
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                            : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}>
                          {isItemAlert ? 'ACCIDENT ALERT' : isItemRescued ? 'RESCUED' : isItemFa ? 'FALSE ALARM' : 'TELEMETRY'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          {new Date(item.createdAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </span>

                        <div className="flex items-center gap-2">
                          {item.aMag !== undefined && item.aMag > 0 && (
                            <span className="text-rose-500 font-bold flex items-center gap-0.5">
                              <Activity className="w-3 h-3" />
                              {item.aMag.toFixed(1)}g
                            </span>
                          )}
                          {item.battPct !== undefined && item.battPct > 0 && (
                            <span className="text-emerald-500 flex items-center gap-0.5">
                              <Battery className="w-3 h-3" />
                              {item.battPct}%
                            </span>
                          )}
                          {item.lat && item.lon && (item.lat !== 0 || item.lon !== 0) && onLocateIncident && (
                            <button
                              type="button"
                              onClick={() => {
                                onLocateIncident(item);
                                onClose();
                              }}
                              className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-blue-600 hover:text-white text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1 font-bold"
                              title="Focus this incident on map"
                            >
                              <Navigation className="w-2.5 h-2.5 text-blue-400" />
                              LOCATE
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Geolocation Coordinates & Nav */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-rose-500" />
                Incident Geolocation
              </span>
              <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimestamp(event.createdAt)}
              </span>
            </div>

            <div className="font-medium text-xs text-neutral-900 dark:text-neutral-100">
              {address}
            </div>

            {Math.abs(event.lat) > 0.0001 || Math.abs(event.lon) > 0.0001 ? (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
                  <span>{event.lat.toFixed(6)}, {event.lon.toFixed(6)}</span>
                  <button
                    onClick={handleCopyCoords}
                    className="p-0.5 hover:text-blue-500 transition-colors ml-1"
                    title="Copy Lat/Lon"
                  >
                    {copiedCoords ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-neutral-400" />}
                  </button>
                </div>

                <a
                  href={googleMapsNavUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Navigate on Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-amber-500 bg-amber-500/10 px-2.5 py-1.5 rounded border border-amber-500/20">
                GPS signal unacquired / waiting for satellite lock
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/90 dark:bg-neutral-900/90 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleCopyDispatch}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold font-mono uppercase tracking-wider transition-colors shadow-xs"
          >
            {copiedDispatch ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>Copied Dispatch Info!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy EMT Dispatch Text</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-bold font-mono uppercase tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
