import React, { useState } from 'react';
import {
  HARDWARE_BOM_NODES,
  HARDWARE_REVISIONS,
  PRESENTATION_BEATS,
  RIDER_MEDICAL_PROFILE,
  SYSTEM_HIGHLIGHTS,
} from '../rams/presentationData';
import {
  AiRiskAssessment,
  HardwareRevision,
  StateMachineResult,
} from '../rams/crashStateMachine';
import { PresenterSlot, UiCaptureDefinition } from '../rams/presenterStore';
import { PresenterRoster } from './PresenterRoster';
import { UiCaptureSlot } from './UiCaptureSlot';

interface EditorialStageProps {
  activeBeatIndex: number;
  zenMode: boolean;
  presenters: PresenterSlot[];
  onChangePresenter: (index: number, nextName: string) => void;
  selectedHardwareId: string;
  onSelectHardware: (id: string) => void;
  hardwareRevision: HardwareRevision;
  onSelectHardwareRevision: (rev: HardwareRevision) => void;
  smdFlipped: boolean;
  onToggleSmdFlip: () => void;
  potholeSimActive: boolean;
  potholeResult: StateMachineResult;
  potholeAiRisk: AiRiskAssessment;
  onTriggerPothole: () => void;
  crashResult: StateMachineResult;
  crashAiRisk: AiRiskAssessment;
  countdownSeconds: number;
  crashCanceled: boolean;
  onCancelCrash: () => void;
  onResetCrash: () => void;
  showPotholeRibbon: boolean;
  onTogglePotholeRibbon: () => void;
  cellularDropped: boolean;
  onToggleCellular: () => void;
  activeRiderCaptureId: UiCaptureDefinition['id'];
  activeRescuerCaptureId: UiCaptureDefinition['id'];
  onSelectRescuerCapture: (id: UiCaptureDefinition['id']) => void;
  uploadedImages: Record<string, string>;
  onUploadImage: (id: UiCaptureDefinition['id'], file: File) => void;
  onResetImage: (id: UiCaptureDefinition['id']) => void;
  onAdvanceBeat: (targetIdx: number) => void;
}

export const EditorialStage: React.FC<EditorialStageProps> = ({
  activeBeatIndex,
  zenMode,
  presenters,
  onChangePresenter,
  selectedHardwareId,
  onSelectHardware,
  hardwareRevision,
  onSelectHardwareRevision,
  smdFlipped,
  onToggleSmdFlip,
  potholeSimActive,
  potholeResult,
  potholeAiRisk,
  onTriggerPothole,
  crashResult,
  crashAiRisk,
  countdownSeconds,
  crashCanceled,
  onCancelCrash,
  onResetCrash,
  showPotholeRibbon,
  onTogglePotholeRibbon,
  cellularDropped,
  onToggleCellular,
  activeRiderCaptureId,
  activeRescuerCaptureId,
  onSelectRescuerCapture,
  uploadedImages,
  onUploadImage,
  onResetImage,
  onAdvanceBeat,
}) => {
  const [showKicadStill, setShowKicadStill] = useState(false);
  const [showIsoStill, setShowIsoStill] = useState(false);
  const activeRevisionSpec =
    HARDWARE_REVISIONS.find((r) => r.id === hardwareRevision) ?? HARDWARE_REVISIONS[0];

  return (
    <div
      className={`relative z-10 transition-opacity duration-300 ${
        zenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {PRESENTATION_BEATS.map((beat, idx) => {
        const dist = Math.abs(idx - activeBeatIndex);
        const focusOpacity = dist === 0 ? 1 : dist === 1 ? 0.36 : 0.14;
        const translateY = idx === activeBeatIndex ? 0 : idx < activeBeatIndex ? -14 : 14;

        return (
          <section
            key={beat.id}
            id={beat.id}
            aria-label={`Chapter ${beat.indexLabel}: ${beat.chapter}`}
            className={`relative min-h-screen w-full flex items-start px-5 sm:px-12 lg:px-16 pb-32 pointer-events-none ${
              beat.id === 'impact-highlights' || beat.id === 'our-approach'
                ? 'pt-16 sm:pt-16'
                : 'pt-20 sm:pt-24'
            }`}
          >
            {/* Atmospheric directional readability gradient (zero box borders over 3D) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[#05070b]/55 md:bg-transparent md:bg-gradient-to-r md:from-[#05070b]/92 md:via-[#05070b]/52 md:to-transparent lg:w-[62%] pointer-events-none"
            />

            <div
              style={{
                opacity: focusOpacity,
                transform: `translate3d(0, ${translateY}px, 0)`,
              }}
              className="relative w-full max-w-6xl mx-auto transition-all duration-500 ease-out"
            >
              {/* Left Editorial Column — leaves right & center 3D stage unobstructed */}
              <div className="max-w-[500px] pointer-events-auto">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular text-slate-400">
                  <span className="text-amber-400 font-semibold">{beat.indexLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{beat.chapter}</span>
                </div>

                {idx === 0 ? (
                  <h1 className="font-display mt-1.5 text-[clamp(2.35rem,4.6vw,4.0rem)] leading-[1.06] font-bold tracking-tight text-slate-50 text-balance">
                    {beat.title}
                  </h1>
                ) : (
                  <h2 className="font-display mt-1.5 text-[clamp(1.75rem,3.4vw,2.85rem)] leading-[1.08] font-bold tracking-tight text-slate-50 text-balance">
                    {beat.title}
                  </h2>
                )}

                <p className="mt-1.5 text-sm sm:text-base font-medium text-amber-300/95 leading-snug">
                  {beat.subtitle}
                </p>

                <p className="mt-2.5 text-sm leading-relaxed text-slate-300 max-w-[58ch]">
                  {beat.summary}
                </p>

                {/* Hairline Quantified Metrics Row */}
                <div className="mt-2.5 pt-2.5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-2">
                  {beat.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="text-[11px] text-slate-400">{m.label}</div>
                      <div className="font-mono-tabular text-base sm:text-lg font-semibold text-slate-50 mt-0.5">
                        {m.value}
                      </div>
                      <div className="text-[11px] text-slate-400/85 leading-snug mt-0.5">
                        {m.note}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chapter 01: Primary CTA */}
                {beat.id === 'cold-open' && (
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => onAdvanceBeat(1)}
                      className="px-6 py-3 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Begin Presentation
                    </button>
                  </div>
                )}

                {/* Chapter 04: Dual-Revision Hardware Selector */}
                {beat.id === 'our-approach' && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/15 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center p-0.5 rounded-md bg-slate-900/95 border border-white/10">
                        {HARDWARE_REVISIONS.map((rev) => {
                          const isCurrent = rev.id === hardwareRevision;
                          return (
                            <button
                              key={rev.id}
                              type="button"
                              onClick={() => onSelectHardwareRevision(rev.id)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                                isCurrent
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'text-slate-300 hover:text-white'
                              }`}
                            >
                              {rev.shortLabel}
                            </button>
                          );
                        })}
                      </div>

                      {hardwareRevision === 'smd' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={onToggleSmdFlip}
                            className="px-2.5 py-1 rounded bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400/40 text-[11px] font-medium text-cyan-200 whitespace-nowrap cursor-pointer"
                          >
                            {smdFlipped ? 'Show Top Side' : 'Flip Board (Bottom)'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowKicadStill((prev) => !prev)}
                            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-white/15 text-[11px] text-slate-300 whitespace-nowrap cursor-pointer"
                          >
                            {showKicadStill ? '3D Parts' : 'CAD Still'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono-tabular text-emerald-300 shrink-0">
                          Wire-Free Copper PCB
                        </span>
                      )}
                    </div>

                    {hardwareRevision === 'smd' && showKicadStill ? (
                      <div className="rounded border border-white/15 bg-[#080d14] p-2 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                          <span className="truncate">
                            {showIsoStill
                              ? 'Astra Custom SMD · Isometric View'
                              : smdFlipped
                              ? 'Bottom Side · Underside Ra-02 Radio Module'
                              : 'Top Side · ESP32-S3, Buzzer & Battery Port'}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setShowIsoStill((prev) => !prev)}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-cyan-300 cursor-pointer"
                            >
                              {showIsoStill ? 'Top/Bottom' : '3D Iso'}
                            </button>
                            <span className="font-mono-tabular text-cyan-300">42×32mm CAD</span>
                          </div>
                        </div>
                        <img
                          src={
                            showIsoStill
                              ? '/assets/hardware/smd_top_iso_3d.png'
                              : smdFlipped
                              ? '/assets/hardware/smd_bottom_3d.png'
                              : '/assets/hardware/smd_top_3d.png'
                          }
                          alt={
                            showIsoStill
                              ? 'Astra Custom SMD Isometric CAD Render'
                              : smdFlipped
                              ? 'Astra Custom SMD Bottom CAD Render'
                              : 'Astra Custom SMD Top CAD Render'
                          }
                          className="w-full h-44 object-contain rounded bg-white/95"
                        />
                      </div>
                    ) : (
                      <div className="divide-y divide-white/10 border-t border-b border-white/10">
                        {HARDWARE_BOM_NODES.map((node) => {
                          const active = selectedHardwareId === node.id;
                          return (
                            <button
                              key={node.id}
                              type="button"
                              onClick={() => onSelectHardware(node.id)}
                              className={`w-full text-left py-1 px-2 transition-colors flex items-center justify-between gap-2.5 cursor-pointer ${
                                active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.03]'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-[11px] font-semibold truncate ${
                                      active ? 'text-amber-300' : 'text-slate-100'
                                    }`}
                                  >
                                    {node.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 shrink-0">
                                    · {node.role}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 leading-tight truncate">
                                  {node.specs}
                                </div>
                              </div>
                              <span
                                className="text-[10px] font-mono-tabular shrink-0"
                                style={{ color: node.accent }}
                              >
                                {active ? 'Selected' : 'View'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Chapter 05: Rider Lens — Smartphone Sensor Integration & Android Capture */}
                {beat.id === 'lens-rider' && (
                  <div className="mt-5 pt-4 border-t border-white/15 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-slate-400">
                          Active Profile · {RIDER_MEDICAL_PROFILE.userCategory}
                        </div>
                        <div className="text-sm font-semibold text-slate-100 mt-0.5">
                          {RIDER_MEDICAL_PROFILE.riderName} · {RIDER_MEDICAL_PROFILE.plateNumber} · Blood {RIDER_MEDICAL_PROFILE.bloodType}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onTriggerPothole}
                        className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-white/15 text-xs font-semibold text-white transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {potholeSimActive
                          ? 'Reset Road View'
                          : 'Simulate Road Bump'}
                      </button>
                    </div>

                    {potholeSimActive && (
                      <div
                        data-testid="pothole-status"
                        className="py-2 px-3 rounded-md bg-emerald-950/75 border border-emerald-500/40 text-xs"
                      >
                        <div className="font-semibold text-emerald-300 font-mono-tabular">
                          RAMS AI: {potholeResult.finalStage} · {potholeAiRisk.riskPercent}% Crash Likelihood (Ignored)
                        </div>
                        <div className="text-slate-200 mt-0.5">
                          {potholeAiRisk.summary}
                        </div>
                      </div>
                    )}

                    <UiCaptureSlot
                      lens="rider"
                      activeSlotId={activeRiderCaptureId}
                      onSelectSlot={() => {}}
                      uploadedImages={uploadedImages}
                      onUploadImage={onUploadImage}
                      onResetImage={onResetImage}
                      potholeSimActive={potholeSimActive}
                    />
                  </div>
                )}

                {/* Chapter 06: Impact Lens — Crash Detection & 10s Safety Check */}
                {beat.id === 'lens-accident' && (
                  <div className="mt-6 pt-5 border-t border-white/15 space-y-4">
                    <div className="grid grid-cols-2 gap-4 py-3 px-4 rounded-md bg-[#0b1018]/90 border border-white/10">
                      <div>
                        <div className="text-[11px] text-slate-400">
                          RAMS AI Status ({crashCanceled ? 'CANCELED' : `${crashAiRisk.riskPercent}%`})
                        </div>
                        <div
                          data-testid="crash-fsm-stage"
                          className={`font-mono-tabular text-sm font-semibold mt-0.5 ${
                            crashCanceled ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {crashCanceled ? 'CANCELED BY RIDER' : crashResult.finalStage}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">
                          10s Safety Check · Buzzer {crashCanceled ? 'Silenced' : 'Active'}
                        </div>
                        <div className="font-mono-tabular text-sm font-semibold text-slate-100 mt-0.5">
                          {countdownSeconds}s remaining
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={crashCanceled ? onResetCrash : onCancelCrash}
                        className={`px-4 py-2.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          crashCanceled
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-white/15'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        {crashCanceled ? 'Replay Crash Demo' : 'Cancel ("Hey RAMS")'}
                      </button>

                      <button
                        type="button"
                        onClick={onTogglePotholeRibbon}
                        className="px-4 py-2.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-white/15 text-xs font-medium text-slate-200 whitespace-nowrap cursor-pointer"
                      >
                        {showPotholeRibbon ? 'Hide Bump Wave' : 'Compare Road Bump'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Chapter 07: Rescuer Lens — Offline LoRa Proof & Command Center Tabs */}
                {beat.id === 'lens-rescuer' && (
                  <div className="mt-3 pt-3 border-t border-white/15 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={onToggleCellular}
                        className={`px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                          cellularDropped
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                            : 'bg-slate-800 hover:bg-slate-700 border-white/15 text-white'
                        }`}
                      >
                        {cellularDropped
                          ? 'Cell Signal Dropped · LoRa Radio Active'
                          : 'Simulate No Cell Signal'}
                      </button>

                      <div
                        data-testid="rescuer-triage-card"
                        className="px-2.5 py-1.5 rounded bg-slate-950/85 border border-white/10 text-xs font-mono-tabular text-slate-200"
                      >
                        CELL: {cellularDropped ? 'OFFLINE' : 'WEAK'} ·{' '}
                        <span className="text-emerald-400 font-semibold">LORA DELIVERED</span>
                      </div>
                    </div>

                    <UiCaptureSlot
                      lens="rescuer"
                      activeSlotId={activeRescuerCaptureId}
                      onSelectSlot={onSelectRescuerCapture}
                      uploadedImages={uploadedImages}
                      onUploadImage={onUploadImage}
                      onResetImage={onResetImage}
                      cellularDropped={cellularDropped}
                    />
                  </div>
                )}

                {/* Chapter 08: 5 System Highlights */}
                {beat.id === 'impact-highlights' && (
                  <div className="mt-3 pt-3 border-t border-white/15 space-y-2">
                    <div className="text-xs font-medium text-slate-400">
                      Five Core System Highlights
                    </div>
                    <ol className="space-y-1">
                      {SYSTEM_HIGHLIGHTS.map((item) => (
                        <li
                          key={item.index}
                          className="flex items-baseline gap-2.5 text-[11px] leading-snug"
                        >
                          <span className="font-mono-tabular text-amber-400 shrink-0">
                            {item.index}.
                          </span>
                          <div>
                            <span className="font-semibold text-slate-100">{item.title}</span>
                            <span className="text-slate-400"> — {item.detail}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Clean 5-Presenter Roster in Hero & Closing Credits */}
              {beat.id === 'cold-open' && (
                <div className="mt-5 max-w-[520px]">
                  <PresenterRoster
                    presenters={presenters}
                    onChangePresenter={onChangePresenter}
                    editable={true}
                    compact={true}
                    heading="Presentation Team"
                  />
                </div>
              )}

              {beat.id === 'impact-highlights' && (
                <div className="mt-3 max-w-5xl">
                  <PresenterRoster
                    presenters={presenters}
                    editable={false}
                    heading="Presented By"
                  />
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};
