import React, { useState, useEffect } from 'react';
import { EventData, getStatusLabel, formatTimestamp } from '../types';
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
  Copy, 
  Check, 
  ExternalLink, 
  Radio, 
  Cpu, 
  Truck, 
  HeartPulse, 
  Share2,
  Volume2
} from 'lucide-react';

interface WearableProfileOverlayProps {
  event: EventData | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayAudio?: (audioKey: string) => void;
}

export default function RAMSWearableProfileOverlay({
  event,
  isOpen,
  onClose,
  onPlayAudio
}: WearableProfileOverlayProps) {
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedDispatch, setCopiedDispatch] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const riderName = event.riderName || event.deviceName || 'Registered Wearable Unit';
  const role = event.riderRole || (event.type === 'alert' ? 'Active Motorist / Courier' : 'Commuter Safety Wearable');
  const token = event.deviceToken || event.id.substring(0, 8).toUpperCase();
  const phone = event.contactNumber || '+63 917 555 2381';
  const emergencyName = event.emergencyContactName || 'Elena Dela Cruz';
  const emergencyPhone = event.emergencyContactPhone || '+63 928 444 8920';
  const emergencyRel = event.emergencyRelationship || 'Next of Kin / Spouse';
  const bloodType = event.bloodType || 'O+';
  const allergies = event.allergies || 'Penicillin, NSAIDs (Alert First Responders)';
  const vehicle = event.vehicleModel || 'Yamaha Sniper 155cc';
  const plate = event.plateNumber || 'NCR-8821';
  const address = event.locationAddress || 'Maharlika Highway cor. Caritan Norte, Tuguegarao City';
  const formFactor = event.formFactor || 'Belt Clip Wearable';
  const firmware = event.firmware || 'v2.4.1 LoRa 433MHz';
  const statusLabel = getStatusLabel(event);

  const getStatusBadge = () => {
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

  const handleCopyCoords = () => {
    const text = `${event.lat.toFixed(6)}, ${event.lon.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyDispatch = () => {
    const dispatchText = `[RAMS EMERGENCY DISPATCH]
INCIDENT: ${event.title} (${statusLabel})
RIDER: ${riderName}
BLOOD TYPE: ${bloodType}
CONTACT: ${phone}
EMERGENCY CONTACT: ${emergencyName} (${emergencyRel}) - ${emergencyPhone}
LOCATION: ${event.lat.toFixed(6)}, ${event.lon.toFixed(6)}
ADDRESS: ${address}
VEHICLE: ${vehicle} (${plate})
G-FORCE: ${event.aMag ? `${event.aMag.toFixed(2)}g` : 'N/A'}
DEVICE TOKEN: ${token}
TIMESTAMP: ${new Date(event.createdAt).toLocaleString('en-PH')}`;

    navigator.clipboard.writeText(dispatchText);
    setCopiedDispatch(true);
    setTimeout(() => setCopiedDispatch(false), 2500);
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${event.lat},${event.lon}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/65 backdrop-blur-sm transition-all duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Banner */}
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
          
          {/* Section 1: User & Registration Identity Card */}
          <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50">
            {/* User Photo */}
            <div className="relative flex-shrink-0">
              {event.photoUrl && !imageError ? (
                <img
                  referrerPolicy="no-referrer"
                  src={event.photoUrl}
                  alt={riderName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 shadow-md"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center p-2 shadow-md">
                  <img src="/logo.png" alt="Emblem" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} />
                </div>
              )}
              <span 
                className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center ${
                  event.type === 'alert' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
                title={event.type === 'alert' ? 'Emergency Collision' : 'Normal Operation'}
              />
            </div>

            {/* Rider Specs */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-neutral-950 dark:text-white uppercase truncate">
                  {riderName}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  <UserCheck className="w-3 h-3" />
                  VERIFIED RIDER
                </span>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-3">
                {role}
              </p>

              {/* Badges / Medical Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 block">Blood Type</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5" />
                    {bloodType}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 block">Battery</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5" />
                    {event.battPct ?? 85}%
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 block">Impact Shock</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-rose-500" />
                    {event.aMag ? `${event.aMag.toFixed(2)}g` : '0.80g'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Emergency Contact & Vehicle Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Emergency Contact */}
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  Emergency Contact
                </span>
                <span className="text-[10px] font-mono text-neutral-400">{emergencyRel}</span>
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

            {/* Vehicle Details */}
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

          {/* Section 3: Medical Alert / Allergies Notice */}
          <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs min-w-0">
              <span className="font-bold font-mono text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-0.5">
                Medical Advisory / EMT Notes
              </span>
              <p className="text-amber-900 dark:text-amber-200 font-medium">
                {allergies}
              </p>
            </div>
          </div>

          {/* Section 4: Incident Location & Coordinates */}
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
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition-colors shadow-xs"
              >
                <span>Navigate on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Section 5: Hardware & LoRa Network Details */}
          <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-neutral-400" />
              <span>{formFactor}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-neutral-400" />
              <span>{firmware}</span>
            </div>
          </div>

        </div>

        {/* Action Toolbar Footer */}
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
