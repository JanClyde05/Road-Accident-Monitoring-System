# RAMS: Immersive Presentation Plan

*Research, storyline and build plan · November 17, 2026*

Confidence tags: **\[Certain\]** = read in a source or in your repo this session. **\[Likely\]** = strong inference or my own knowledge, not re-checked today. **\[Guessing\]** = filling a gap; confirm before relying on it.

## 1. Read this first

- **\[Likely\] The 3D has to carry evidence, not mood.** A panel remembers whether your numbers survived questions, not how smooth the camera was. Every 3D moment below is tied to a real measurement or a real screen from your system.
- **\[Likely\] Build one continuous world, not forty 3D slides.** One highway, one camera, four beats. It is cheaper, it looks more professional, and it tells one crash from three sides.
- **\[Likely\] Stylized beats photoreal.** Low-poly (the Kenney kit) is fast and forgiving. Photoreal accident scenes cost days and tend to look uncanny.
- **\[Certain\] Record a fallback.** A live WebGL scene on a venue PC is the main risk. Capture the full run to MP4 and keep it on a USB stick.
- **\[Guessing\] I don’t know your venue, slot length or audience.** I assumed a 10 to 12 minute technical panel (your repo mentions an IECEP Nationals track). If that is wrong, the stack changes.

## 2. What your repo already gives you

- **\[Certain\] Hero hardware.** Custom wearable PCB (Rev C: ESP32-S3, MPU-6050, SX1278 LoRa, WS2812B status LED, buzzer, cancel button, LiPo charging). The kit contains your board as a GLB converted from `manufacturing/ENGINEERING_DRAFT_NOT_FOR_FAB/RAMS_JLC_S3_3D.step`. It is a draft; re-export the final Rev C (section 8).
- **\[Certain\] The full chain to animate.** Phone sensing, BLE, wearable, 433 MHz LoRa (SF9), ESP32-S3 base station, USB or Wi-Fi, then the Windows command center with a Leaflet map, klaxon alerts, triage and a hotspot predictor.
- **\[Certain\] Your differentiators (README).** A LoRa link that survives cellular dropouts; a two-stage crash state machine (freefall, impact, rest, latch); false-alarm suppression for potholes, drops, pocket tremor and walking; a 30 s warning with button and offline “Hey RAMS” voice cancel; a rider medical profile (blood type, allergies, emergency contact) delivered to the rescuer; a store-and-forward queue; a DOST-ASTI EPDC-compliant PCB.
- **\[Certain\] Numbers to reconcile before you present.** The current README says the phone samples at 50 Hz, an earlier README version said 100 Hz, and the wearable’s MPU-6050 runs at 100 Hz. The README also claims 0 ms latency for true accidents, which a panel will read as end-to-end. Pick one set of figures and use it everywhere.
- **\[Likely\] Reuse, don’t mock.** The real React dashboard and the Android app are your best screens. Capture them live or record them; don’t redraw them.

## 3. The story (about 11 minutes)

Eight beats. Timings are \[Guessing\]; scale them to your slot.

1. **Cold open (0:30), one number.** Black screen, engine hum, a single motorcycle light on a dark highway. Counter: more than 3,200 people die on roads every day worldwide, then about 30 per day in the Philippines (11,096 deaths in 2021 divided by 365, my arithmetic). Cut to silence.
2. **The problem (1:30), a crash nobody knows about.** Three broken links shown as three nodes going dark along the road: detection (nobody sees it), communication (no cell signal on rural stretches), response (rescuers lack who, where and how bad). Anchor: post-crash response is the fifth pillar of the Philippine Road Safety Action Plan 2023–2028 \[Certain\].
3. **Impact of the problem (1:00).** PSA road deaths rose 39%, from 7,938 in 2011 to 11,096 in 2021: draw it as a rising 3D road or bar \[Certain\]. Riders of two- and three-wheelers were 53% of Philippine road deaths in WHO’s 2015 report \[Certain, but old data: replace it with the newest WHO country profile\].
4. **Our approach (1:30), RAMS in one frame.** The exploded real PCB, then the four tiers lighting in sequence as one packet travels end to end.
5. **How it works (3:30), three lenses.** See section 4.
6. **Impact of the approach (1:30).** Your own measured results first, a modeled benchmark second (section 5).
7. **Highlights (1:00).** Five lines at most: works offline over LoRa, custom EPDC board, two-tier edge AI with false-alarm suppression, offline voice cancel, the rescuer sees the rider’s medical profile.
8. **Close (0:30).** The same highway, now with the ambulance arriving. One sentence on what is next.

## 4. The three lenses (one world, three cameras)

**Rider lens (about 1:00): “everything looks normal.”**

- Chase camera behind the motorcycle. A HUD shows the wearable LED states (blue connecting, green armed, red SOS) and the phone’s telemetry tab.
- Show what the system carries: name, plate, blood type, allergies, emergency contact.
- Side moment: a pothole spike appears and is suppressed (README thresholds), so the audience sees the system not crying wolf.

**Accident lens (about 1:00): “the data tells the story.”**

- Freeze or slow motion at impact. A 3D ribbon of acceleration magnitude from a real recorded trace, with the state-machine stages (freefall, impact, rest, latch) lighting along it.
- Put the AI risk percentage next to the raw trace, and a pothole trace beside it for contrast.
- Then the 30 s warning: buzzer, red LED, countdown, cancel button or “Hey RAMS”. This is where you explain the latency trade-off honestly.

**Rescuer lens (about 1:30): “they know who, where and how bad.”**

- Top-down camera. The LoRa packet arcs from the crash to the base station and the base LED changes. Then cut to the real command center: klaxon, map pin, triage modal with the rider’s photo and medical profile, ETA.
- Live proof moment: switch off Wi-Fi and cellular on the phone and show the alert still arrives. This is your strongest 20 seconds.
- The ambulance drives in from the base station; the 3D world and the dashboard map show the same route.

A starter for exactly this structure is in the kit (`starter/`): one highway, four camera beats, your real board turning in the first beat.

## 5. Impact of the approach: what you can claim

- **\[Certain\] Do not claim lives saved.** You have no field data. Claim time, coverage and information.
- **\[Certain\] Modeled benchmark.** EU estimates for eCall put response-time reductions at about 40% in urban areas and 50% in the countryside, with at least 4% fewer fatalities. These are estimates for a different system in a different region. Use them as “why faster alerting matters”, labeled as such.
- **Measure these yourself (this is the part that wins):**
  - End-to-end time from impact to alert on the console, on a timestamped video.
  - LoRa range and RSSI on a real road, with packet loss.
  - Detection and false-alarm results from `validation/validate_fsm.py` and your motion datasets.
  - Wearable battery life and total bill of materials.
- **\[Likely\] Latency math to check.** By my calculation (SF9, 125 kHz, CR 4/5, CRC on, 8-symbol preamble, packet sizes from the README table) a 26-byte alert is about 0.2 s on air and the 233-byte rider profile about 1.15 s. Verify with a LoRa airtime calculator or your own timestamps.
- **\[Certain\] An open question only you can answer.** The README doesn’t say whether the alert is sent immediately or only after the 30 s window. State it explicitly: that choice, not the radio, sets your response time.
- **\[Likely\] Expect this question:** “How is this different from phone crash detection and eCall?” Prepare one backup slide: works without cell coverage, wearable independent of the phone, rescuer console with the medical profile, false-alarm rules tuned for motorcycles.

## 6. Tool landscape (what to use for what)

Versions are the current npm releases I checked on November 17, 2026.

**Core build (recommended)**

- **three.js 0.187 (MIT).** The 3D engine, on the same web stack as your React 19 dashboard. \[Certain\]
- **GSAP 3.15 (free “no charge” license).** The director: one timeline drives camera and actors, and you step it with a clicker. \[Certain\]
- **Vite 8.** Dev server and offline build. \[Certain\]
- **React Three Fiber 9.8 + drei 10.7 (MIT).** Pick this over raw three.js if you want your actual dashboard components inside the scene. \[Likely\]
- **Theatre.js 0.7 (core Apache-2.0, studio AGPL-3.0).** A visual keyframe editor for camera and animation. Use the studio while authoring and ship only the exported state; check AGPL before distributing anything. \[Certain on licenses\]
- **glTF-Transform 4.5 and gltfpack 1.3.** Compress GLB files if the scene gets heavy. \[Certain on versions\]

**Authoring and hero assets**

- **KiCad 10 (kicad-cli).** Your best asset. `pcb export glb` gives the board model and `pcb render` gives ray-traced stills with a transparent background. GLB export has had colour problems in some builds, so check it and fall back to the 3D viewer export. \[Certain\]
- **Blender (free).** Clean up the board model, pose the exploded view, stage a cinematic crash, render to MP4. \[Likely\]
- **Spline.** A fast browser 3D editor for hero loops. Free-plan exports carry the Spline logo; check the current paid tiers. Not the right tool for the whole story. \[Certain on the logo\]

**Safe containers and fallbacks**

- **PowerPoint (Microsoft 365).** Accepts GLB models and Morph transitions, so a turning board and simple camera moves work. Use it for the Q&A backup deck. \[Certain\]
- **OBS Studio (free).** Record the live scene to MP4 as the fallback. \[Likely\]
- **DaVinci Resolve (free) and ffmpeg.** Trim, add sound, export. \[Likely\]
- **reveal.js 6 / Slidev 53 (MIT).** HTML slides if you want text slides in the same browser session. \[Certain on versions\]

**Optional upgrades (only if time remains)**

- **CARLA (0.9.16 per recent coverage) with ScenarioRunner.** An open-source driving simulator with vehicles and pedestrians and scriptable scenes. Needs a strong NVIDIA GPU and days of setup. \[Likely\]
- **MapLibre GL 6.18 + deck.gl 9.4.** A cinematic 3D map and animated packet arcs, if you want more than your Leaflet console. \[Certain on versions\]
- **Remotion 4 / Motion Canvas 3.17.** Programmatic video for data animations. Remotion’s license has conditions; read it. \[Certain on versions, Likely on terms\]
- **AI 3D generators (Tripo, Meshy, Hunyuan3D, TRELLIS).** Quick props such as an ambulance. \[Guessing\] on quality and licenses; check each.

**Asset and sound sources**

- **Kenney (CC0)** is already in the kit. **Quaternius and Poly Haven (CC0).** **Sketchfab:** licenses vary per model, check each. **Mixamo:** character animation, needs an Adobe account. \[Likely\]
- **Sound.** Pros design sound: a heartbeat, a cut to silence at impact, the klaxon, restrained music. Freesound and Pixabay have free libraries; check each file’s license. \[Likely\]

## 7. What I downloaded, and what I couldn’t

- **\[Certain\] In the kit (RAMS-immersive-kit.zip):** 30 GLB models (Kenney city pieces, motorcycle, trucks and an animated character, all CC0, plus your board converted from your own STEP file), a Vite + three.js + GSAP starter, and `tools/export_board.bat` for the final board export.
- **\[Certain\] My sandbox could only reach GitHub, npm and PyPI.** Poly Haven, Sketchfab, Quaternius, Mixamo and Blender are on your list to download yourself.
- **\[Certain\] I could not render the starter.** It compiles, but camera framing and model facing are unverified. The TUNE constants at the top of `starter/src/main.js` are where you fix that.
- **\[Certain\] No ambulance or human rider model came from these sources.** The starter builds a stylized ambulance from primitives; the kit has one animated character you can use for a rescuer or pedestrian.

## 8. Build plan

Day estimates are \[Guessing\] for one person; adjust to your team.

- **Phase 0, decisions (0.5 day).** Venue, hardware, slot length, who presses the clicker. Fix the figures for sampling rate and latency. Decide what you can still measure before the date.
- **Phase 1, assets (1 day).** Run `tools/export_board.bat` for the final Rev C GLB and hero stills. Capture the dashboard and the Android app as screen recordings. Pull one real IMU trace.
- **Phase 2, world (2 to 3 days).** Run the starter, fix the TUNE constants, add the three lenses’ overlays, wire the real IMU trace to the ribbon, add a proper ambulance model.
- **Phase 3, sound and pace (1 day).** Sound design, script, rehearse with a clicker, and cut anything that doesn’t earn its seconds.
- **Phase 4, safety net (0.5 day).** Record the MP4 with OBS, build the backup deck, test on a second machine at 1080p.

**Delivery checklist**

- Build with `npm run build`, serve locally, open in Edge or Chrome app mode, full screen. No internet needed.
- Two copies: the laptop and a USB stick, plus the MP4 fallback.
- Test the projector’s resolution and refresh rate early.
- Credit Kenney and any CC-BY assets on a sources slide.

## 9. Sources

- WHO, Global status report on road safety 2023, news release of 13 December 2023 (1.19 million road deaths per year): https://www.who.int/news/item/13-12-2023-despite-notable-progress-road-safety-remains-urgent-global-issue
- Global News summary of the same report (more than 3,200 deaths per day): https://globalnews.ca/news/10167475/road-safety-traffic-deaths-who/amp/
- WHO Philippines, citing PSA data (7,938 deaths in 2011 to 11,096 in 2021, up 39%; post-crash response as the fifth pillar of the Philippine Road Safety Action Plan 2023–2028): https://www.who.int/philippines/news/detail/31-05-2023-department-of-transportation--world-health-organization-launch-philippine-road-safety-action-plan-2023-2028
- GMA News on WHO’s 2015 report (53% of Philippine road deaths are riders of two- and three-wheelers): https://www.gmanetwork.com/news/lifestyle/healthandwellness/541587/motorcycle-riders-pedestrians-among-top-victims-of-road-accidents-in-phl-who/story
- EUSPA on eCall (40% urban and 50% rural response-time estimates, at least 4% fewer fatalities): https://www.euspa.europa.eu/newsroom-events/news-archive/ecall-emergency-alert-system-launched
- KiCad CLI GLB export flags and the colour issue: https://gitlab.com/kicad/packaging/kicad-cli-docker/-/issues/8
- KiCad ray-traced render from the CLI: https://forum.kicad.info/t/v8-is-so-close-for-making-wiring-diagrams-and-yet-so-far/52819?page=2
- Spline FAQ on free-plan exports: https://docs.spline.design/doc/faq/docJF3WvgXVz
- PowerPoint 3D models with Morph (GLB, Microsoft 365): https://www.cadmicro.com/animatedpsentations-with-solidworks-visualize/
- CARLA 0.9.16 coverage: https://radiancefields.com/carla-adds-nurec-support-with-v0-9-16
- Your repo: https://github.com/JanClyde05/Road-Accident-Monitoring-System
