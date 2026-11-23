# Road sequence credits and methods

The five films depict pairing, a motorcycle slide, a two-car collision, a pedestrian strike and a separate fall while walking. They are staged illustrations created for the RAMS exhibit. The chest placement and device enclosure illustrate use. The Hardware chapter identifies the fabricated board and the custom board design.

## People and vehicles

tevy released the four source meshes and their textures under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). The production uses the author's pinned v1 LOD0 files. The rider and pedestrian are poses of the same skinned character. The rider's visor and helmet, the phone, the wearable, the pairing path, the adapted poses and all cinematography were created for this presentation.

| Model by tevy | Use in the exhibit |
| --- | --- |
| [Casual Walker](https://tevy.dev/models/casual-walker) | The authored walk and idle clips supply base motion. Adjusted shoulders, arms, legs and head poses depict pairing, riding and bracing. |
| [Family Sedan](https://tevy.dev/models/family-sedan) | The sedan crosses the junction, comes into contact with the SUV and appears in the pedestrian sequence. |
| [Mid-Size SUV](https://tevy.dev/models/suv) | The second vehicle enters on the intersecting road. |
| [Sport Motorcycle](https://tevy.dev/models/sport-motorcycle) | Wheel rotation follows distance traveled. The bike and rider separate during the slide. |

## Street and lighting

- [Modern Evening Street](https://polyhaven.com/a/modern_evening_street) by Grzegorz Wronkowski supplies the photographed surroundings. The presentation uses an exposure-adjusted, blue-hour crop of the equirectangular panorama.
- [Shanghai Bund](https://polyhaven.com/a/shanghai_bund) by Greg Zaal supplies reflected city lights. The production compresses extreme lamp intensities before filtering the environment for the vehicle materials.
- [Asphalt 04](https://polyhaven.com/a/asphalt_04) supplies the measured surface detail through its color and normal maps. Sergej Majboroda photographed the surface and Jenelle van Heerden processed it.

Poly Haven publishes these assets under [CC0](https://polyhaven.com/license). The junction markings, shopfronts, street lamps and camera compositions were authored for RAMS. Wet-pavement reflection, coloured highlights and camera motion reference [Threejs-Punk Drive](https://www.threejspunk.com/) and [the Three.js Conference project](https://github.com/ektogamat/threejs-conference).

## Motion and rendering

The collision compresses the sedan nose and indents the SUV side using mesh morphs. The visible fragments follow gravity and a damped landing. Velocity declines as the vehicles separate. The people use staged skeletal motion. The choreography, damage and timing have no calibration against a measured crash or a specific supplied motion trace. A physiological injury assessment or collision reconstruction would require separate evidence.

Three.js renders the five sequences at 960 × 416 and 24 frames per second. Native H.264 playback uses the media clock for play, pause, replay and scrubbing. Each MP4 contains a keyframe at least once a second. Each of the fifteen WebP storyboards is a frame from the corresponding sequence. The full exhibit and fallback operate without networking.

The production source, models, maps and render driver are in `src/scenarios/production` in the project checkout. To regenerate, serve the presentation root on loopback, then run `node src/scenarios/production/render.mjs` from that root with FFmpeg, Playwright Core and Chromium available. The renderer accepts `RAMS_PLAYWRIGHT`, `RAMS_CHROME`, `RAMS_FFMPEG` and `RAMS_STUDIO_ORIGIN` for tool and local server locations. The packaged exhibit contains the finished films and needs no production tools.
