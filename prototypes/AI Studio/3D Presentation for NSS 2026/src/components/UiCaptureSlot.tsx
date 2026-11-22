import React from 'react';
import { RotateCcw, Upload } from 'lucide-react';
import { UiCaptureDefinition, UI_CAPTURE_SLOTS } from '../rams/presenterStore';

interface UiCaptureSlotProps {
  lens: 'rider' | 'rescuer';
  activeSlotId: UiCaptureDefinition['id'];
  onSelectSlot: (id: UiCaptureDefinition['id']) => void;
  uploadedImages: Record<string, string>;
  onUploadImage: (id: UiCaptureDefinition['id'], file: File) => void;
  onResetImage: (id: UiCaptureDefinition['id']) => void;
  cellularDropped?: boolean;
  potholeSimActive?: boolean;
}

const SchematicPreview: React.FC<{
  slotId: UiCaptureDefinition['id'];
  cellularDropped?: boolean;
  potholeSimActive?: boolean;
}> = ({ slotId, cellularDropped, potholeSimActive }) => {
  if (slotId === 'android-telemetry') {
    return (
      <svg
        viewBox="0 0 320 200"
        role="img"
        aria-label="Android Companion Telemetry Tab Placeholder Schematic"
        className="w-full h-full bg-[#070b12]"
      >
        <rect x="8" y="8" width="304" height="184" rx="6" fill="#0b111c" stroke="rgba(255,255,255,0.12)" />
        <text x="20" y="27" fill="#2dd4bf" fontSize="9.5" fontFamily="monospace" fontWeight="700">
          ANDROID COMPANION · RAMS EDGE AI
        </text>
        <text x="20" y="42" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          {potholeSimActive
            ? 'AI RISK: LOW (IGNORED) · "HEY RAMS" VOICE STANDBY'
            : 'AI RISK: 1.4% SAFE · PHONE MOTION + GPS → WEARABLE BLE'}
        </text>
        <rect x="20" y="53" width="280" height="62" rx="4" fill="#06090f" stroke="rgba(45,212,191,0.28)" />
        <path
          d={
            potholeSimActive
              ? 'M 28 96 L 90 94 L 118 96 L 130 64 L 142 102 L 175 94 L 288 95'
              : 'M 28 92 Q 70 84, 110 92 T 190 92 T 288 90'
          }
          fill="none"
          stroke={potholeSimActive ? '#f59e0b' : '#2dd4bf'}
          strokeWidth="2.2"
        />
        <text x="28" y="69" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
          {potholeSimActive ? 'BRIEF ROAD BUMP · IGNORED BY RAMS AI' : 'LIVE PHONE MOTION SENSOR · ARMED'}
        </text>
        <rect x="20" y="125" width="134" height="53" rx="4" fill="#0f172a" />
        <text x="30" y="143" fill="#64748b" fontSize="7.5" fontFamily="monospace">GPS LOCK · TUGUEGARAO</text>
        <text x="30" y="161" fill="#f8fafc" fontSize="9.5" fontFamily="monospace">17.6132 N, 121.7270 E</text>
        <rect x="166" y="125" width="134" height="53" rx="4" fill="#0f172a" />
        <text x="176" y="143" fill="#64748b" fontSize="7.5" fontFamily="monospace">OFFLINE VOICE AI</text>
        <text x="176" y="161" fill="#2dd4bf" fontSize="9.5" fontFamily="monospace">&quot;HEY RAMS&quot; READY</text>
      </svg>
    );
  }

  if (slotId === 'cmd-map') {
    return (
      <svg
        viewBox="0 0 360 210"
        role="img"
        aria-label="Command Center Leaflet Map Placeholder Schematic"
        className="w-full h-full bg-[#070b12]"
      >
        <rect x="8" y="8" width="344" height="194" rx="6" fill="#0b111c" stroke="rgba(255,255,255,0.12)" />
        <path d="M 35 165 Q 130 140, 180 105 T 315 55" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
        <path d="M 35 165 Q 130 140, 180 105 T 315 55" fill="none" stroke="#2dd4bf" strokeWidth="2.2" strokeDasharray="5 5" />
        <circle cx="95" cy="145" r="26" fill="rgba(245,158,11,0.14)" stroke="rgba(245,158,11,0.38)" />
        <circle cx="95" cy="145" r="7" fill="#ef4444" />
        <circle cx="95" cy="145" r="15" fill="none" stroke="#ef4444" strokeOpacity="0.5" />
        <text x="122" y="149" fill="#fca5a5" fontSize="8.5" fontFamily="monospace">SOS PIN · CRASH LATCHED</text>
        <circle cx="295" cy="64" r="6" fill="#10b981" />
        <text x="210" y="48" fill="#6ee7b7" fontSize="8.5" fontFamily="monospace">BASE STATION #02</text>
        <rect x="18" y="18" width="234" height="32" rx="4" fill="#111827" stroke="rgba(255,255,255,0.1)" />
        <text x="28" y="37" fill={cellularDropped ? '#10b981' : '#2dd4bf'} fontSize="8.2" fontFamily="monospace" fontWeight="600">
          {cellularDropped ? 'CELL DROPPED · LORA RADIO + AI ACTIVE' : 'LIVE MAP + AI HOTSPOT ZONES · LORA'}
        </text>
      </svg>
    );
  }

  if (slotId === 'cmd-triage') {
    return (
      <svg
        viewBox="0 0 360 210"
        role="img"
        aria-label="Command Center Triage Modal Schematic"
        className="w-full h-full bg-[#070b12]"
      >
        <rect x="8" y="8" width="344" height="194" rx="6" fill="#0b111c" stroke="rgba(255,255,255,0.12)" />
        <text x="24" y="33" fill="#ef4444" fontSize="9.2" fontFamily="monospace" fontWeight="700">
          AI TRIAGE CARD · HIGH CONFIDENCE · LORA ALERT RECEIVED
        </text>
        <rect x="24" y="48" width="66" height="74" rx="4" fill="#111827" stroke="rgba(255,255,255,0.14)" />
        <circle cx="57" cy="76" r="14" fill="#334155" />
        <path d="M 38 112 Q 57 94, 76 112" fill="#334155" />
        <text x="104" y="64" fill="#f8fafc" fontSize="11.5" fontFamily="sans-serif" fontWeight="700">
          Marco Villanueva · Plate NGR-4821
        </text>
        <text x="104" y="83" fill="#f59e0b" fontSize="9.2" fontFamily="monospace">
          Blood Type: O+  |  Allergies: Penicillin, Sulfa
        </text>
        <text x="104" y="102" fill="#2dd4bf" fontSize="8.3" fontFamily="monospace">
          AI Brief: Hard Impact + Rider Motionless
        </text>
        <text x="104" y="119" fill="#94a3b8" fontSize="8.2" fontFamily="monospace">
          ICE: Elena Villanueva (+63 917 555 0194)
        </text>
        <rect x="24" y="138" width="312" height="46" rx="4" fill="#06221b" stroke="rgba(16,185,129,0.4)" />
        <text x="36" y="165" fill="#6ee7b7" fontSize="9" fontFamily="monospace">
          LORA TRIAGE ACTIVE · SIREN TRIGGERED · GPS LOCKED
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 360 210"
      role="img"
      aria-label="Command Center Hotspot Predictor Schematic"
      className="w-full h-full bg-[#070b12]"
    >
      <rect x="8" y="8" width="344" height="194" rx="6" fill="#0b111c" stroke="rgba(255,255,255,0.12)" />
      <text x="24" y="33" fill="#2dd4bf" fontSize="9.5" fontFamily="monospace" fontWeight="700">
        RAMS AI · HOTSPOT PREDICTOR CORRIDOR
      </text>
      <rect x="24" y="48" width="312" height="108" rx="4" fill="#06090f" stroke="rgba(255,255,255,0.08)" />
      <circle cx="96" cy="112" r="26" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeOpacity="0.6" />
      <circle cx="215" cy="88" r="34" fill="rgba(239,68,68,0.22)" stroke="#ef4444" strokeOpacity="0.65" />
      <text x="186" y="92" fill="#fca5a5" fontSize="8" fontFamily="monospace" fontWeight="700">HOTSPOT ZONE</text>
      <circle cx="286" cy="126" r="18" fill="rgba(45,212,191,0.2)" stroke="#2dd4bf" strokeOpacity="0.65" />
      <text x="24" y="178" fill="#94a3b8" fontSize="8.3" fontFamily="monospace">
        KM 42–48 PROVINCIAL CURVE · STANDBY STAGING ZONE
      </text>
    </svg>
  );
};

export const UiCaptureSlot: React.FC<UiCaptureSlotProps> = ({
  lens,
  activeSlotId,
  onSelectSlot,
  uploadedImages,
  onUploadImage,
  onResetImage,
  cellularDropped,
  potholeSimActive,
}) => {
  const slots = UI_CAPTURE_SLOTS.filter((s) => s.lens === lens);
  const current = slots.find((s) => s.id === activeSlotId) ?? slots[0];
  const uploadedUrl = uploadedImages[current.id];

  return (
    <div className="bg-[#0b1018]/92 border border-white/12 rounded-lg overflow-hidden pointer-events-auto">
      {/* Window Header + Interactive Tab Switcher */}
      <div className="px-3.5 py-2 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-medium text-slate-200 truncate max-w-[235px]">
          {current.windowTitle}
        </div>
        <div className="flex items-center gap-1.5">
          {slots.length > 1 && (
            <div className="flex items-center gap-1 bg-[#05070b] p-0.5 rounded-md border border-white/10">
              {slots.map((slot) => {
                const active = slot.id === current.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelectSlot(slot.id)}
                    className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {slot.tabLabel}
                  </button>
                );
              })}
            </div>
          )}

          {uploadedUrl && (
            <button
              type="button"
              onClick={() => onResetImage(current.id)}
              title="Revert to live schematic"
              aria-label="Revert to live schematic"
              className="p-1.5 text-slate-400 hover:text-white rounded bg-[#05070b] border border-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          <label
            title="Replace preview with app screenshot"
            className="p-1.5 text-slate-400 hover:text-amber-300 rounded bg-[#05070b] border border-white/10 transition-colors cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span className="sr-only">Upload UI screenshot</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadImage(current.id, file);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      {/* Capture Frame Viewport */}
      <div className="relative h-[132px] w-full bg-[#05070b]">
        {uploadedUrl ? (
          <img
            src={uploadedUrl}
            alt={current.windowTitle}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain bg-[#05070b]"
          />
        ) : (
          <SchematicPreview
            slotId={current.id}
            cellularDropped={cellularDropped}
            potholeSimActive={potholeSimActive}
          />
        )}
      </div>

      {/* Concise Functional Caption */}
      <div className="px-3.5 py-2 border-t border-white/10">
        <p className="text-[11px] text-slate-400 leading-snug">
          {current.caption}
        </p>
      </div>
    </div>
  );
};
