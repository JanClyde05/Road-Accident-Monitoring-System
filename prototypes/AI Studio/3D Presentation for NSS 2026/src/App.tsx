import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import { EditorialStage } from './components/EditorialStage';
import { PresentationDock } from './components/PresentationDock';
import { PresenterToolsModal } from './components/PresenterToolsModal';
import { TopBar } from './components/TopBar';
import {
  evaluateCrashStateMachine,
  evaluateEdgeAiRisk,
  generateCrashTrace,
  generatePotholeTrace,
  getBeatFromProgress,
  HardwareRevision,
  RAMS_CANCEL_WINDOW_SECONDS,
} from './rams/crashStateMachine';
import { PRESENTATION_BEATS } from './rams/presentationData';
import {
  loadPresenters,
  PresenterSlot,
  savePresenters,
  UiCaptureDefinition,
} from './rams/presenterStore';
import { RamsSceneController } from './three/RamsSceneController';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<RamsSceneController | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const scrollProgressRef = useRef(0);
  const activeBeatIndexRef = useRef(0);
  const uploadedUrlsRef = useRef<Record<string, string>>({});

  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const [explodeFactor, setExplodeFactor] = useState(0.5);
  const [selectedHardwareId, setSelectedHardwareId] = useState('smartphone');
  const [hardwareRevision, setHardwareRevision] = useState<HardwareRevision>('tht');
  const [smdFlipped, setSmdFlipped] = useState(false);
  const [potholeSimActive, setPotholeSimActive] = useState(false);
  const [cellularDropped, setCellularDropped] = useState(false);
  const [crashCanceled, setCrashCanceled] = useState(false);
  const [showPotholeRibbon, setShowPotholeRibbon] = useState(true);
  const [countdownSeconds, setCountdownSeconds] = useState(RAMS_CANCEL_WINDOW_SECONDS);
  const [dockCollapsed, setDockCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [zenMode, setZenMode] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [customThtName, setCustomThtName] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);

  const [presenters, setPresenters] = useState<PresenterSlot[]>(() => loadPresenters());
  const [activeRescuerCaptureId, setActiveRescuerCaptureId] =
    useState<UiCaptureDefinition['id']>('cmd-map');
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});

  // Evaluate deterministic 50 Hz smartphone IMU traces using pure FSM + RAMS Edge AI
  const potholeTrace = useMemo(() => generatePotholeTrace(160), []);
  const crashTrace = useMemo(() => generateCrashTrace(160), []);
  const potholeResult = useMemo(
    () => evaluateCrashStateMachine(potholeTrace),
    [potholeTrace]
  );
  const crashResult = useMemo(
    () => evaluateCrashStateMachine(crashTrace),
    [crashTrace]
  );
  const potholeAiRisk = useMemo(
    () => evaluateEdgeAiRisk(potholeTrace, potholeResult),
    [potholeTrace, potholeResult]
  );
  const crashAiRisk = useMemo(
    () => evaluateEdgeAiRisk(crashTrace, crashResult),
    [crashTrace, crashResult]
  );

  const activeBeat = PRESENTATION_BEATS[activeBeatIndex];

  const computeSectionProgress = useCallback(() => {
    const anchors = PRESENTATION_BEATS.map((b, i) => {
      const el = document.getElementById(b.id);
      return el ? el.offsetTop : i * window.innerHeight;
    });
    const y = window.scrollY;
    const count = anchors.length;
    if (count <= 1) return 0;
    if (y <= anchors[0]) return 0;

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (y >= maxScroll) return 1;

    for (let i = 0; i < count - 1; i++) {
      const start = anchors[i];
      const end = i === count - 2 ? Math.max(anchors[i + 1], maxScroll) : anchors[i + 1];
      if (y >= start && y <= end) {
        const span = Math.max(1, end - start);
        const local = Math.max(0, Math.min(1, (y - start) / span));
        return (i + local) / (count - 1);
      }
    }
    return 1;
  }, []);

  const syncScrollState = useCallback(() => {
    const nextProgress = computeSectionProgress();
    scrollProgressRef.current = nextProgress;
    controllerRef.current?.setScrollProgress(nextProgress);

    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${nextProgress})`;
    }
    if (mainRef.current) {
      mainRef.current.setAttribute('data-scroll-progress', nextProgress.toFixed(3));
    }

    const interp = getBeatFromProgress(nextProgress, PRESENTATION_BEATS.length);
    const nextBeatIdx = interp.localT > 0.5 ? interp.nextBeatIndex : interp.beatIndex;
    if (nextBeatIdx !== activeBeatIndexRef.current) {
      activeBeatIndexRef.current = nextBeatIdx;
      setActiveBeatIndex(nextBeatIdx);
    }
  }, [computeSectionProgress]);

  const scrollToBeat = useCallback(
    (beatIdx: number) => {
      const clamped = Math.max(0, Math.min(PRESENTATION_BEATS.length - 1, beatIdx));
      const targetBeat = PRESENTATION_BEATS[clamped];
      const el = document.getElementById(targetBeat.id);
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const targetY = el
        ? el.offsetTop
        : (clamped / Math.max(1, PRESENTATION_BEATS.length - 1)) * maxScroll;

      if (lenisRef.current) {
        lenisRef.current.scrollTo(targetY, { immediate: true });
      } else if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else {
        window.scrollTo({ top: targetY, behavior: 'auto' });
      }
      syncScrollState();
    },
    [syncScrollState]
  );

  // Mount Three.js WebGL scene once
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const controller = new RamsSceneController(container, (lost) => {
      setContextLost(lost);
    });
    controllerRef.current = controller;

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  // Revoke any object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(uploadedUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Sync non-scroll React state to Three.js controller without tearing down canvas
  useEffect(() => {
    controllerRef.current?.updateState({
      explodeFactor,
      selectedHardwareId,
      hardwareRevision,
      smdFlipped,
      potholeSimActive,
      cellularDropped,
      crashCanceled,
      showPotholeRibbon,
    });
  }, [
    explodeFactor,
    selectedHardwareId,
    hardwareRevision,
    smdFlipped,
    potholeSimActive,
    cellularDropped,
    crashCanceled,
    showPotholeRibbon,
  ]);

  // Lenis inertial smooth wheel scroll + native scroll fallback (zero React re-renders per pixel)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    lenis.on('scroll', syncScrollState);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    window.addEventListener('scroll', syncScrollState, { passive: true });
    syncScrollState();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', syncScrollState);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [syncScrollState]);

  // Support ?autostart=1 query param to launch auto-tour immediately
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setIsAutoPlaying(true);
    }
  }, []);

  // Keyboard navigation for presenter clickers & shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setIsAutoPlaying(false);
        scrollToBeat(activeBeatIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setIsAutoPlaying(false);
        scrollToBeat(activeBeatIndex - 1);
      } else if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      } else if (e.key === 'z' || e.key === 'Z') {
        setZenMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeBeatIndex, scrollToBeat]);

  // Auto-play presentation mode without React scroll thrash
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = window.setInterval(() => {
      const next = scrollProgressRef.current + 0.0028;
      if (next >= 1) {
        setIsAutoPlaying(false);
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        if (lenisRef.current) {
          lenisRef.current.scrollTo(maxScroll, { immediate: true });
        } else {
          window.scrollTo({ top: maxScroll, behavior: 'auto' });
        }
        syncScrollState();
        return;
      }
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const y = next * maxScroll;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(y, { immediate: true });
      } else {
        window.scrollTo({ top: y, behavior: 'auto' });
      }
      syncScrollState();
    }, 32);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, syncScrollState]);

  // 10-second veto countdown on Chapter 06 (Impact Lens — per RamsViewModel.kt)
  useEffect(() => {
    if (activeBeat.id !== 'lens-accident' || crashCanceled) {
      return;
    }
    const timer = window.setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : RAMS_CANCEL_WINDOW_SECONDS));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeBeat.id, crashCanceled]);

  const handleSelectHardware = (id: string) => {
    setSelectedHardwareId(id);
    setExplodeFactor((prev) => (prev < 0.45 ? 0.72 : prev));
    if (hardwareRevision === 'smd' && id === 'lora') {
      setSmdFlipped(true);
    } else if (hardwareRevision === 'smd' && id !== 'lora' && id !== 'smartphone' && id !== 'rams-ai') {
      setSmdFlipped(false);
    }
  };

  const handleSelectRevision = (rev: HardwareRevision) => {
    setHardwareRevision(rev);
    if (rev === 'tht') {
      setSmdFlipped(false);
    }
  };

  const handleChangePresenter = (index: number, nextName: string) => {
    setPresenters((prev) => {
      const updated = prev.map((slot, i) =>
        i === index ? { ...slot, name: nextName } : slot
      );
      savePresenters(updated);
      return updated;
    });
  };

  const handleUploadImage = (slotId: UiCaptureDefinition['id'], file: File) => {
    const prevUrl = uploadedUrlsRef.current[slotId];
    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    uploadedUrlsRef.current[slotId] = nextUrl;
    setUploadedImages((prev) => ({ ...prev, [slotId]: nextUrl }));
  };

  const handleResetImage = (slotId: UiCaptureDefinition['id']) => {
    const prevUrl = uploadedUrlsRef.current[slotId];
    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
      delete uploadedUrlsRef.current[slotId];
    }
    setUploadedImages((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  };

  const handleUploadThtGlb = (file: File) => {
    const prevUrl = uploadedUrlsRef.current['custom-tht-glb'];
    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    uploadedUrlsRef.current['custom-tht-glb'] = nextUrl;
    setCustomThtName(file.name);
    setHardwareRevision('tht');
    controllerRef.current?.loadCustomThtGlb(nextUrl);
  };

  return (
    <div className="relative min-h-screen bg-[#05070b] text-slate-100">
      {/* Isolated Full-Bleed WebGL Canvas Container */}
      <div
        ref={canvasMountRef}
        className="fixed inset-0 z-0 w-screen h-screen"
        aria-hidden="true"
      />

      {/* Thin top scroll progress hairline (updated directly via ref at 60/120fps) */}
      <div
        ref={progressBarRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-40 h-[2px] bg-amber-400 origin-left"
        style={{ width: '100%', transform: 'scaleX(0)' }}
      />

      {/* WebGL Context Lost Fallback */}
      {contextLost && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#05070b] text-slate-300 text-sm">
          3D WebGL context paused. Restoring hardware visualization…
        </div>
      )}

      {/* Top Navigation Bar */}
      <TopBar
        onSelectBeat={(idx) => {
          setIsAutoPlaying(false);
          scrollToBeat(idx);
        }}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={() => setIsAutoPlaying((prev) => !prev)}
        zenMode={zenMode}
      />

      {/* Full-Bleed Scroll-Choreographed Editorial Stage */}
      <main
        ref={mainRef}
        data-beat-index={activeBeatIndex}
        data-scroll-progress="0.000"
        className="relative z-10"
      >
        <EditorialStage
          activeBeatIndex={activeBeatIndex}
          zenMode={zenMode}
          presenters={presenters}
          onChangePresenter={handleChangePresenter}
          selectedHardwareId={selectedHardwareId}
          onSelectHardware={handleSelectHardware}
          hardwareRevision={hardwareRevision}
          onSelectHardwareRevision={handleSelectRevision}
          smdFlipped={smdFlipped}
          onToggleSmdFlip={() => setSmdFlipped((prev) => !prev)}
          potholeSimActive={potholeSimActive}
          potholeResult={potholeResult}
          potholeAiRisk={potholeAiRisk}
          onTriggerPothole={() => setPotholeSimActive((prev) => !prev)}
          crashResult={crashResult}
          crashAiRisk={crashAiRisk}
          countdownSeconds={countdownSeconds}
          crashCanceled={crashCanceled}
          onCancelCrash={() => setCrashCanceled(true)}
          onResetCrash={() => {
            setCrashCanceled(false);
            setCountdownSeconds(RAMS_CANCEL_WINDOW_SECONDS);
          }}
          showPotholeRibbon={showPotholeRibbon}
          onTogglePotholeRibbon={() => setShowPotholeRibbon((prev) => !prev)}
          cellularDropped={cellularDropped}
          onToggleCellular={() => setCellularDropped((prev) => !prev)}
          activeRiderCaptureId="android-telemetry"
          activeRescuerCaptureId={activeRescuerCaptureId}
          onSelectRescuerCapture={setActiveRescuerCaptureId}
          uploadedImages={uploadedImages}
          onUploadImage={handleUploadImage}
          onResetImage={handleResetImage}
          onAdvanceBeat={(idx) => {
            setIsAutoPlaying(false);
            scrollToBeat(idx);
          }}
        />
      </main>

      {/* Collapsible Bottom Presentation Dock */}
      <PresentationDock
        activeBeatIndex={activeBeatIndex}
        onSelectBeat={(idx) => {
          setIsAutoPlaying(false);
          scrollToBeat(idx);
        }}
        explodeFactor={explodeFactor}
        onChangeExplode={setExplodeFactor}
        dockCollapsed={dockCollapsed}
        onToggleDock={() => setDockCollapsed((prev) => !prev)}
        zenMode={zenMode}
        onToggleZen={() => setZenMode((prev) => !prev)}
        onOpenToolsModal={() => setToolsModalOpen(true)}
      />

      {/* Backstage Media & Hardware Imports Drawer */}
      <PresenterToolsModal
        open={toolsModalOpen}
        onClose={() => setToolsModalOpen(false)}
        customThtName={customThtName}
        onUploadThtGlb={handleUploadThtGlb}
        uploadedImages={uploadedImages}
        onUploadImage={handleUploadImage}
        onResetImage={handleResetImage}
      />
    </div>
  );
}

