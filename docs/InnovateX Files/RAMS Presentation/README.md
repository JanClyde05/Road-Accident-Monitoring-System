# RAMS - Road Accident Monitoring System

Extract the offline ZIP, then open **Finals.html** in Chrome or Edge for the six-minute National Finals talk. Open **index.html** for the extended exhibit. The [standalone finals slides](public/presenters/RAMS%20InnovateX%202026%20National%20Finals%20Slides.pdf) can also be projected or submitted as a PDF. The exhibit runs from disk, including the fonts, incident films, app captures and motion traces. WebGL 2 enables the interactive terrain, relay camera moves and board inspection. Local images cover browsers without WebGL or video playback.

## Presenting

Use the program selector to choose the **15-chapter walkthrough** (17 minutes 30 seconds) or the **11-chapter finals talk** (6 minutes). Advance with the arrow keys, a clicker or the on-screen controls. **F** toggles fullscreen, **N** opens the current chapter’s field notes, **I** opens the index and **Esc** closes a dialog. Chapter timings are rehearsal cues. The finals schedule reserves another four minutes for the physical prototype and five for questions.

The five names follow the research manuscript cover. The speaking assignments are proposed for rehearsal.

The [AI Use Disclosure Statement](public/presenters/RAMS%20AI%20Use%20Disclosure.pdf) describes the development work documented in Antigravity, the hardware handoff and the preparation of the finals materials.

Open **Field notes → Presenter script** for the current chapter and route. The [printable script](public/presenters/RAMS%20Presenter%20Script.pdf) and [editable Word copy](public/presenters/RAMS%20Presenter%20Script.docx) contain the six-minute talk, the extended walkthrough and additional interaction cues. Stage directions appear in bold above the spoken lines.

| Presenter | What to show in the full exhibit |
| --- | --- |
| Ernest John Galace | Open on the road corridor. Introduce the research team, the Philippine context and the question of who reports an unwitnessed crash. |
| Precious Nina Garcia | Follow the wearer as they pair the device. Compare a motorcycle slide, a two-car collision, a pedestrian strike and a fall while walking. Pause or scrub each illustration, then inspect the Android app. |
| April Ann Palattao | Compare acceleration during ordinary and accident-like movement. Inspect eleven generated motion families, the public dataset catalog and the labeled-session calibration example. |
| Stephanie Ranjo | Try a RAMS AI example, flip the fabricated SuperMini carrier and the four-layer RAMS Wearable, then follow the packet through Bluetooth, LoRa and USB. |
| Jan Clyde Talosig | Select a map pin, open the registered rider and inspect their incident history. Compare the classifier replay with its subtype errors, then close with what a field trial needs to measure. |

## Evidence

The detection chapter plots five fixtures from the Android benchmarks, including the fall and dropped-phone cases. The motion atlas plots the base trace for each of the eleven families and identifies the generated variations. The calibration example evaluates the CSV import rule on two selected fixture peaks. Its output applies to that pair. Public fall and activity datasets appear in the project’s reference catalog. The packaged benchmark inputs are generated profiles. IMU Studio provides a separate path for collecting labeled handset sessions.

The Android dismissal handler records a count and reason, updates the local incident and requests a cancellation. The classifier can consult existing learned motion profiles below 6 g. Creating a profile uses a separate function which the current dismissal handler does not call.

The walking fall is an illustration. The packaged synthetic Fall fixture represents a separate event, a rider going over the handlebars at 42 km/h. Individual fixtures and their returned subtypes appear in the replay record.

RAMS AI’s examples trace device-state questions, voice normalization and local retrieval to their application sources. The mobile and Windows galleries use project interface captures with their provenance in the [app exhibit record](public/apps/sources.md). All interactions in the exhibit run locally. The illustrated incidents explain the reporting workflow and do not provide accident-detection measurements.

The [replay record](verification/replay-output.tsv) covers 121 precomputed feature vectors evaluated by the compiled Android classifier on a desktop JVM. Its header records the source, compiled class and fixture-list hashes. The [verification script](verification/replay.py) rebuilds and reruns the classifier from the project checkout. The benchmark does not measure raw sensor acquisition, BLE or LoRa performance, handset placement or field accuracy.

The [hardware record](public/hardware/sources.md) traces each exhibit to its carrier layout, component references and fabrication status. The SuperMini model reconstructs two unavailable module bodies using the manuscript’s component images. The RAMS Wearable model depicts the normal-population assembly of the custom SMD design. The manuscript and original CAD remain in the project checkout.

## Development

The presentation uses Three.js 0.187.0 and a local esbuild bundle. From this directory inside the RAMS repository, run `npm ci` once, then `npm run build` after a source change. Run `python build_finals_slides.py` to print the slide master with local Chrome or Edge. Run `python pack.py` after building to replace the offline ZIP in the parent directory. `npm start` serves the site on loopback at port 8765. The prebuilt HTML also opens directly from disk.

## Visual references and credits

The road scene uses mesh-surface scan points, an animated scan band and a camera-space raindrop refraction pass. The two effect guides describe the techniques. [Point-cloud scan](https://github.com/MengTo/Skills/blob/main/agent-skills/game-development/build-point-cloud-scan/SKILL.md) · [Lens raindrops](https://github.com/MengTo/Skills/blob/main/agent-skills/game-development/build-lens-raindrops/SKILL.md)

The atmosphere and camera direction reference the requested Three.js experiences. The RAMS scene geometry, radio visualization and presentation interface were created for this exhibit. [Threejs-Punk Drive](https://www.threejspunk.com/) · [Three.js Conference](https://github.com/ektogamat/threejs-conference)

The [road sequence credits](public/scenarios/sources.md) identify the models, environment material and render assets. The Philippine coastline is derived from [Natural Earth](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/). The 2011 and 2021 national road-death totals are attributed to PSA in the [2023 WHO and DOTr release](https://www.who.int/philippines/news/detail/31-05-2023-department-of-transportation--world-health-organization-launch-philippine-road-safety-action-plan-2023-2028). The desktop map credits its OpenStreetMap base in the [app exhibit record](public/apps/sources.md).

The presentation includes the RAMS project logo, local Plus Jakarta Sans and IBM Plex Mono fonts, and the Three.js runtime. Their open-source licenses accompany the assets. [Three.js license](assets/three-license.txt) · [Plus Jakarta Sans license](public/fonts/jakarta-license.txt) · [IBM Plex Mono license](public/fonts/plex-license.txt)
