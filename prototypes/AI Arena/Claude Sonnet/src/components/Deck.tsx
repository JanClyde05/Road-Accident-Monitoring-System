"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { DeckScene } from "./scene";
import { ADVISER, REPO_URL, SLIDES, TEAM, TOTAL_SECONDS, type Tone } from "./content";

const TONE: Record<Tone, string> = {
  cyan: "border-cyan-400/50 text-cyan-300",
  crimson: "border-rose-500/60 text-rose-300",
  gold: "border-amber-400/50 text-amber-300",
  emerald: "border-emerald-400/50 text-emerald-300",
  verify: "border-dashed border-amber-300/70 text-amber-200",
};

const mmss = (s: number) => {
  const m = Math.floor(Math.max(0, s) / 60);
  const r = Math.floor(Math.max(0, s) % 60);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

export default function Deck() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<DeckScene | null>(null);
  const [idx, setIdx] = useState(0);
  const [notes, setNotes] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [qr, setQr] = useState("");
  const [gpuFail, setGpuFail] = useState(false);

  useEffect(() => {
    if (!host.current) return;
    try {
      scene.current = new DeckScene(host.current, 0);
    } catch {
      setGpuFail(true);
    }
    return () => {
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  useEffect(() => {
    scene.current?.goTo(idx);
  }, [idx]);

  useEffect(() => {
    QRCode.toDataURL(REPO_URL, { margin: 1, width: 220 }).then(setQr).catch(() => setQr(""));
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const go = useCallback((d: number) => setIdx((i) => Math.max(0, Math.min(SLIDES.length - 1, i + d))), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") setIdx(0);
      else if (e.key === "End") setIdx(SLIDES.length - 1);
      else if (e.key === "n" || e.key === "N") setNotes((v) => !v);
      else if (e.key === "t" || e.key === "T") setRunning((v) => !v);
      else if (e.key === "r" || e.key === "R") {
        setElapsed(0);
        setRunning(false);
      } else if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const s = SLIDES[idx];
  const behind = running && elapsed > s.t1;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#070A12] text-white" style={{ fontFamily: "'Space Grotesk', Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div ref={host} className="absolute inset-0" />
      {gpuFail && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-slate-300">
          WebGL is not available in this browser. Open the deck in Chrome, Edge or Firefox with hardware acceleration on.
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(7,10,18,0.75)_100%)]" />

      {/* top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-5 py-3 font-mono text-[11px] tracking-widest text-slate-400 md:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-500" />
          <span>RAMS · IECEP INNOVATEX 2026</span>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setRunning((v) => !v)}
            className={`rounded border px-2 py-1 transition ${behind ? "border-rose-500 text-rose-300" : "border-slate-600 text-slate-300 hover:border-cyan-400"}`}
            title="T = start/pause · R = reset"
          >
            {running ? "❚❚" : "▶"} {mmss(elapsed)} / {mmss(TOTAL_SECONDS)}
          </button>
          <button onClick={() => setNotes((v) => !v)} className="rounded border border-slate-600 px-2 py-1 text-slate-300 hover:border-cyan-400" title="N">
            NOTES
          </button>
          <button
            onClick={() => (document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen?.())}
            className="hidden rounded border border-slate-600 px-2 py-1 text-slate-300 hover:border-cyan-400 md:block"
            title="F"
          >
            FULLSCREEN
          </button>
          <a href="/RAMS_Research_Paper.pdf" target="_blank" rel="noreferrer" className="rounded border border-cyan-500/60 px-2 py-1 text-cyan-300 hover:bg-cyan-500/10">
            PAPER PDF
          </a>
        </div>
      </div>

      {/* assertion */}
      <div key={s.id} className="deck-in absolute left-5 top-14 max-w-[min(92vw,720px)] md:left-8 md:top-16">
        <div className="mb-2 font-mono text-[11px] tracking-[0.25em] text-cyan-300">
          {s.tag} · {mmss(s.t0)}–{mmss(s.t1)}
        </div>
        <h1 className={`font-bold leading-[1.05] tracking-tight ${s.kind === "hero" ? "text-4xl md:text-6xl" : "text-2xl md:text-4xl"}`}>
          {s.assertion}
        </h1>
        {s.kind === "hero" && s.foot && <p className="mt-4 font-mono text-xs tracking-wide text-slate-400 md:text-sm">{s.foot}</p>}
        {s.kind === "hero" && (
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="rounded border border-cyan-400/50 px-2 py-1 font-mono text-cyan-300">Cagayan State University – Carig Campus</span>
            <span className="rounded border border-slate-600 px-2 py-1 font-mono">College of Engineering · Electronics Engineering</span>
          </div>
        )}
      </div>

      {/* evidence panel */}
      {s.kind !== "hero" && (s.cards || s.table) && (
        <div key={s.id + "p"} className="deck-in absolute bottom-24 right-4 w-[min(94vw,420px)] md:bottom-auto md:right-8 md:top-1/2 md:-translate-y-1/2">
          {s.table && (
            <div className="glass overflow-hidden rounded-xl border border-white/10 text-[12px]">
              <div className="grid grid-cols-[70px_1fr_1fr] bg-white/5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                {s.table.head.map((h, i) => (
                  <div key={i} className="px-3 py-2">
                    {h}
                  </div>
                ))}
              </div>
              {s.table.rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[70px_1fr_1fr] border-t border-white/5">
                  {r.map((c, j) => (
                    <div key={j} className={`px-3 py-2 ${j === 0 ? "font-mono text-[10px] uppercase text-slate-400" : c.includes("[") ? "text-amber-200" : j === 2 ? "text-emerald-300" : "text-amber-100"}`}>
                      {c}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {s.cards && (
            <div className={`grid gap-2 ${s.kind === "closing" ? "grid-cols-3" : s.cards.length > 4 ? "grid-cols-2" : "grid-cols-1"}`}>
              {s.cards.map((c, i) => (
                <div
                  key={c.k}
                  style={{ animationDelay: `${650 + i * 90}ms` }}
                  className={`deck-in glass rounded-xl border-l-4 border px-4 py-3 ${TONE[c.tone ?? "cyan"]}`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest opacity-80">
                    <span>{c.k}</span>
                    {c.tone === "verify" && <span className="rounded bg-amber-300/20 px-1 text-[9px]">VERIFY</span>}
                  </div>
                  <div className="mt-1 text-[13px] leading-snug text-white md:text-sm">{c.v}</div>
                </div>
              ))}
            </div>
          )}
          {s.foot && <p className="mt-2 text-[11px] leading-snug text-slate-400">{s.foot}</p>}
        </div>
      )}

      {/* team footer (hero) */}
      {s.kind === "hero" && (
        <div className="deck-in absolute bottom-20 left-4 right-4 md:left-8 md:right-8">
          <div className="glass grid grid-cols-2 gap-3 rounded-2xl border border-white/10 p-3 md:grid-cols-6">
            {TEAM.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-400/60 bg-cyan-400/10 font-mono text-xs text-cyan-200">{i + 1}</div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold">{m.name}</div>
                  <div className="truncate font-mono text-[9px] text-slate-400">{m.role}</div>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 border-white/10 md:border-l md:pl-3">
              <div className="min-w-0">
                <div className="font-mono text-[9px] uppercase text-slate-400">Adviser</div>
                <div className="truncate text-xs font-semibold">{ADVISER}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* closing QR */}
      {s.kind === "closing" && (
        <div className="deck-in absolute bottom-24 left-5 flex items-end gap-4 md:bottom-28 md:left-8">
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="QR code to the RAMS GitHub repository" className="h-28 w-28 rounded-lg bg-white p-1.5" />
          )}
          <div className="font-mono text-[11px] leading-relaxed text-slate-300">
            <div className="text-cyan-300">REPOSITORY</div>
            <div>JanClyde05/</div>
            <div>Road-Accident-Monitoring-System</div>
            <div className="mt-2 text-slate-500">{TEAM.map((m) => m.name).join(" · ")}</div>
          </div>
        </div>
      )}

      {/* notes */}
      {notes && (
        <div className="glass deck-in absolute bottom-20 left-4 w-[min(92vw,460px)] rounded-xl border border-amber-300/40 p-4 text-sm text-slate-200 md:left-8">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-amber-300">
            Speaker notes · {mmss(s.t0)}–{mmss(s.t1)} ({s.t1 - s.t0}s)
          </div>
          {s.notes}
        </div>
      )}

      {/* progress + nav */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 md:left-8 md:right-8">
        <button onClick={() => go(-1)} disabled={idx === 0} className="rounded-full border border-slate-600 px-3 py-1.5 font-mono text-xs text-slate-300 transition hover:border-cyan-400 disabled:opacity-30">
          ←
        </button>
        <div className="flex flex-1 gap-1">
          {SLIDES.map((sl, i) => (
            <button
              key={sl.id}
              onClick={() => setIdx(i)}
              aria-label={sl.tag}
              title={sl.tag}
              style={{ flexGrow: sl.t1 - sl.t0 }}
              className="group h-5 min-w-0 flex-1"
            >
              <div className={`mt-2 h-1 rounded-full transition-all duration-500 group-hover:h-2 ${i < idx ? "bg-cyan-500/70" : i === idx ? "bg-rose-500" : "bg-slate-700"}`} />
            </button>
          ))}
        </div>
        <span className="hidden font-mono text-[11px] text-slate-500 md:block">
          {String(idx + 1).padStart(2, "0")}/{SLIDES.length} · ← → space · N notes · T timer · F full
        </span>
        <button onClick={() => go(1)} disabled={idx === SLIDES.length - 1} className="rounded-full border border-cyan-500/70 px-3 py-1.5 font-mono text-xs text-cyan-300 transition hover:bg-cyan-500/10 disabled:opacity-30">
          →
        </button>
      </div>
    </div>
  );
}
