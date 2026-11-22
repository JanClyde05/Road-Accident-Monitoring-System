import React, { useEffect, useRef } from 'react';
import { RotateCcw, Upload, X } from 'lucide-react';
import { RESEARCHED_PRESENTATION_TOOLS } from '../rams/presentationData';
import { UI_CAPTURE_SLOTS, UiCaptureDefinition } from '../rams/presenterStore';

interface PresenterToolsModalProps {
  open: boolean;
  onClose: () => void;
  customThtName?: string | null;
  onUploadThtGlb?: (file: File) => void;
  uploadedImages?: Record<string, string>;
  onUploadImage?: (id: UiCaptureDefinition['id'], file: File) => void;
  onResetImage?: (id: UiCaptureDefinition['id']) => void;
}

export const PresenterToolsModal: React.FC<PresenterToolsModalProps> = ({
  open,
  onClose,
  customThtName,
  onUploadThtGlb,
  uploadedImages = {},
  onUploadImage,
  onResetImage,
}) => {
  const glbInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="presenter-tools-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#05070b]/85 pointer-events-auto"
    >
      <div className="w-full max-w-2xl bg-[#0b1018] border border-white/15 rounded-lg p-6 sm:p-8 shadow-2xl max-h-[88vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="text-xs font-mono-tabular text-amber-400">
              Presenter Setup &amp; Hardware Imports
            </div>
            <h2
              id="presenter-tools-title"
              className="font-display text-2xl font-semibold text-slate-50 mt-1"
            >
              Backstage Media &amp; Hardware Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tools guide"
            className="p-2 rounded-md bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-300 leading-relaxed">
          Load your Self-Built THT PCB 3D export (.GLB) and live Android / Desktop UI screenshots here without cluttering the presentation slides.
        </p>

        {onUploadThtGlb && (
          <div className="mt-4 p-3.5 rounded-md bg-slate-900/80 border border-white/15 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-100">
                Design 01 · Self-Fabricated THT PCB (.GLB / .GLTF)
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                {customThtName
                  ? `Active custom model: ${customThtName}`
                  : 'Export .glb directly from KiCad (File -> Export -> GLB) to replace the THT prototype board live.'}
              </div>
            </div>
            <input
              ref={glbInputRef}
              type="file"
              accept=".glb,.gltf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadThtGlb(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => glbInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Load THT .GLB
            </button>
          </div>
        )}

        {onUploadImage && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-slate-200">
              App &amp; Command Center Screenshot Slots
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {UI_CAPTURE_SLOTS.map((slot) => {
                const uploaded = Boolean(uploadedImages[slot.id]);
                return (
                  <div
                    key={slot.id}
                    className="p-2.5 rounded-md bg-slate-900/70 border border-white/10 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-slate-200 truncate">
                        {slot.windowTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {uploaded ? 'Custom screenshot loaded' : slot.aspectLabel}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {uploaded && onResetImage && (
                        <button
                          type="button"
                          onClick={() => onResetImage(slot.id)}
                          aria-label={`Reset ${slot.tabLabel}`}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                      <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-white/15 text-[11px] text-slate-100 cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>{uploaded ? 'Replace' : 'Load'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUploadImage(slot.id, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5 divide-y divide-white/10 border-t border-b border-white/10">
          {RESEARCHED_PRESENTATION_TOOLS.map((tool) => (
            <div key={tool.name} className="py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-semibold text-slate-100">{tool.name}</div>
                <div className="text-[11px] font-mono-tabular text-slate-400">
                  {tool.category} · {tool.licenseOrTier}
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{tool.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
