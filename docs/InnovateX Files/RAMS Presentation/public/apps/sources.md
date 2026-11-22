# Application exhibit records

## Rider's phone

The Wearable and Telemetry images are portrait renders of the current Android Jetpack Compose screen functions. The Roborazzi runner uses Android API 35, the app's dark theme, an empty rider profile, disconnected link state and an empty IMU sample history. The telemetry values visible on the screen come from the Kotlin `ImuData()` default constructor. These isolated screen renders omit the navigation shell and handset status bar. They represent the UI in a fixture session. The [capture inputs](../../src/app-exhibits/capture-tests/ExhibitScreens.kt) are included in the development checkout.

The Voice image is a crop of the archived handset screenshot at `archive/duplicates/mobile_ai_app_2026-11/rams_live_screen.png`. It retains the wake overlay. The crop excludes the device token, handset status bar and an example emergency message. Use this image to identify the interaction in that earlier build. The current recognizer delegates speech transcription to Android and processes the transcript in `VoiceAlarmCanceler.kt`.

## Rescuer's Windows station

The browser loaded the HTML, JavaScript and CSS shipped in `apps/new_ai_applications/desktop_ai_app/www`. The map, unit registry, three rider identity cards and three event histories were captured after an isolated local `/api/events` response supplied the seven fictional events in `src/app-exhibits/station-fixtures.json`. The application grouped the events into three units and rendered its own Leaflet markers, registration cards and chronologically sorted history rows. The exhibit places keyboard-accessible selection controls on that fixed map crop. Times are rendered in Philippine Standard Time. Names, device IDs, times, positions, and sensor readings belong to the demonstration.

The displayed streets and buildings are real Carig-area geometry. A small vector extract from the [OpenStreetMap API](https://api.openstreetmap.org/api/0.6/map?bbox=121.742,17.645,121.770,17.666) was drawn under the production pins for an offline map image. The live console ordinarily uses online raster tiles. Map data © OpenStreetMap contributors, distributed under the [Open Database License](https://www.openstreetmap.org/copyright). The capture never contacted a rider, radio receiver or desktop database.

- **Reception** shows the source `ping.html` interface. Its example airtime estimate belongs to the screen's radio model. A field latency claim would require timestamps.
- **Unit registry** crops the populated registered-rider panel from the shipping dashboard. Its event counts match the incident map and profile examples.
- **Hotspots** crops the dashboard's AI Operations Suite. The implementation in `HotspotPredictor.cs` groups stored incident coordinates using Haversine distances and DBSCAN. The default parameters are a 150 m neighborhood and a minimum of three points.

## RAMS AI evidence

The APK's `rams_distilled_knowledge.jsonl` has 1,655 rows and 1,655 distinct normalized keys. Every packaged row has the source label `RAMS-AutoTrain-Corpus-v3.2`. The build script expands domain question and answer templates. The on-device assistant also has a separate mechanism for caching answers returned by Gemini at runtime. It stores the query, its normalized key, the response and context locally. An exact key can be recalled offline.

In `voice_wake_patterns.json`, the base collections contain 32 wake prefixes, 55 written name variants, 30 slurred forms and 78 cancel phrases. The loader in `VoiceAlarmCanceler.kt` combines prefixes and name variants both with and without a space, adds slurred or regional forms, and checks recognized text. The historical methodology's recording profiles and the JSON metadata describe additional ambitions. These text resources establish the implemented phrase inventory. Independent speaker trials would be needed to measure wake or cancellation accuracy.

The archive gives the project identity `RAMS-1.8B-Edge` and a proposed architecture. The implemented paths traced here are Android speech transcription, deterministic action routing, device-context replies, local Q&A retrieval and optional online Gemini calls. No verified 1.8B checkpoint or local neural-weight training run was identified among the Android assets.

