import { chapters as existing } from './evidence.js';
import { appChapters } from './app-exhibits/index.js';

const event = 'docs/InnovateX Files/';
const manuscript =
  event +
  'Draft/ResQTrack_-A-Smartphone-Paired-Wearable-Accident-Detection-and-LoRa-Alert-System-for-Vulnerable-Road-Users-1.pdf';
const paper =
  event + 'Real Research Paper for InnovateX/RAMS_InnovateX_2026_Research_Paper_Working_Draft.docx';
export const whoPH =
  'https://www.who.int/philippines/news/detail/31-05-2023-department-of-transportation--world-health-organization-launch-philippine-road-safety-action-plan-2023-2028';
const corpus = 'apps/android_app/app/src/main/assets/motion_benchmarks/';
const records = {
  paper: { label: 'InnovateX working research paper', path: paper },
  team: { label: 'Five researchers and institution, manuscript cover', path: manuscript },
  who: { label: 'WHO Philippines and DOTr, 31 May 2023, citing PSA', path: whoPH },
  motion: {
    label: 'Android motion rules',
    path: 'apps/android_app/app/src/main/java/com/example/ai/SensorAiInferenceEngine.kt',
  },
  catalog: {
    label: 'RAMS public motion dataset directory',
    path: 'docs/FREE_MOTION_DATASETS_DIRECTORY.md',
  },
  collector: {
    label: 'IMU Studio raw-window and feature export',
    path: 'apps/imu_studio_app/app/src/main/java/com/example/data/export/DatasetExporter.kt',
  },
  generator: {
    label: 'Canonical motion waveform generator',
    path: 'scripts/generate_benchmark_motion_datasets.py',
  },
  variations: {
    label: 'Fixture variations and language asset generation',
    path: 'scripts/train_rams_ai.py',
  },
  wearable: {
    label: 'Phone-assisted wearable firmware',
    path: 'firmware/wearable_withApp/wearable_withApp.ino',
  },
  protocol: { label: 'Wearable and receiver packet contract', path: 'firmware/shared/protocol.h' },
};

// Names follow the manuscript cover. The speaking assignments below are a proposed rehearsal plan.
export const acts = [
  {
    title: 'Research brief',
    speaker: 'Ernest John Galace',
    cue: 'Introduce the people, the reporting gap and the research question.',
    ids: ['overview', 'team', 'problem'],
  },
  {
    title: 'On the road',
    speaker: 'Precious Nina Garcia',
    cue: 'Follow a road user from pairing to the first possible event.',
    ids: ['pairing', 'scenarios', 'mobile'],
  },
  {
    title: 'Motion evidence',
    speaker: 'April Ann Palattao',
    cue: 'Show how the team represents motion, builds fixtures and calibrates thresholds.',
    ids: ['detection', 'datasets', 'calibration'],
  },
  {
    title: 'Field system',
    speaker: 'Stephanie Ranjo',
    cue: 'Demonstrate RAMS AI, compare the boards and follow the radio packet.',
    ids: ['assistant', 'hardware', 'relay'],
  },
  {
    title: 'Station response',
    speaker: 'Jan Clyde Talosig',
    cue: 'Inspect the station, evaluate the evidence and close with the field trial.',
    ids: ['desktop', 'validation', 'impact'],
  },
];

const added = [
  {
    id: 'team',
    title: 'Presenters',
    headline: 'The five researchers behind RAMS',
    summary:
      'The InnovateX manuscript credits five Electronics Engineering researchers from Cagayan State University, Carig Campus. Each presenter takes one part of the journey from road user to receiving station.',
    notes: [
      {
        title: 'Introduce the group',
        text: 'Read the five names in manuscript order. The speaking parts shown here are suggested assignments for rehearsal. They describe the presentation sequence.',
      },
      {
        title: 'Set the question',
        text: 'Ask the audience to imagine an unwitnessed fall. Who can report it if the rider cannot reach the phone?',
      },
    ],
    sources: [records.team, records.paper],
  },
  {
    id: 'problem',
    title: 'Reporting gap',
    headline: 'Who calls when the rider cannot?',
    summary:
      'An injured road user may be unable to call or describe a location. On a road with few witnesses or limited cellular coverage, a receiving station may have no report to act on.',
    notes: [
      {
        title: 'Put the numbers in context',
        text: 'The Philippine Statistics Authority recorded 7,938 road traffic deaths in 2011 and 11,096 in 2021, according to WHO Philippines and DOTr. These are national totals across all road users. They do not identify how many events involved delayed reporting.',
      },
      {
        title: 'Name the engineering problem',
        text: 'A hard jolt alone cannot tell a station what happened. RAMS must decide whether the phone’s motion is unusual, give the rider a way to correct a false alarm and carry useful information across a communications gap.',
      },
      {
        title: 'Hand off to the road user',
        text: 'The next presenter follows the same phone and wearable before, during and after an illustrated incident.',
      },
    ],
    sources: [
      records.who,
      records.paper,
      {
        label: 'Public-domain coastline geometry · Natural Earth 1:50m',
        path: 'https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/',
      },
    ],
  },
  {
    id: 'pairing',
    title: 'Pair the wearable',
    headline: 'The rider carries two parts of one system',
    summary:
      'Before setting out, the rider pairs the Android phone with the wearable over Bluetooth Low Energy. The phone supplies motion and location. The wearable gives that report a radio path.',
    notes: [
      {
        title: 'Guide the pairing scene',
        text: 'The figure and device placement illustrate use. The detailed circuit boards are in the Hardware chapter. Explain which components the rider carries and which device supplies the sensor data.',
      },
      {
        title: 'Distinguish the two links',
        text: 'Pairing establishes a short-range link between phone and wearable. LoRa is the separate link from wearable to the station receiver. A receiver in radio range is still necessary.',
      },
    ],
    sources: [
      records.wearable,
      {
        label: 'Android BLE session manager',
        path: 'apps/android_app/app/src/main/java/com/example/connectivity/Esp32ConnectionManager.kt',
      },
      records.protocol,
    ],
  },
  {
    id: 'scenarios',
    title: 'Road incidents',
    headline: 'Four incidents on the same road',
    summary:
      'Follow a motorcycle slide, a junction collision, a pedestrian strike and a fall on foot. Pause at contact. For each person, ask what a phone in their pocket could actually sense.',
    notes: [
      {
        title: 'Compare the four reconstructions',
        text: 'Look at orientation after the motorcycle slide, the abrupt change of direction at the junction and the pedestrian’s motion during contact. In the fourth scene, a person loses their footing without a vehicle striking them. Compare a carried phone with the separate dropped-phone fixture in Detection.',
      },
      {
        title: 'Keep the evidence clear',
        text: 'These scenes are illustrative. Their animation timing is for explanation. The 121 synthetic fixtures evaluate alarm flags on stored features and provide no measured detection rate for these incident types.',
      },
      {
        title: 'Move into the app',
        text: 'Show the Android interface next. It is the connection between an incident on the road and the information available to the wearable.',
      },
    ],
    sources: [
      records.paper,
      records.motion,
      records.wearable,
      {
        label: 'Illustrated road sequences and model credits',
        path: event + 'RAMS Presentation/public/scenarios/sources.md',
      },
    ],
  },
  {
    id: 'datasets',
    title: 'Data origins',
    headline: 'Where the motion data came from',
    summary:
      'The project contains a public research catalog, locally generated benchmark traces and software for collecting labeled phone sessions. Each serves a different part of development.',
    notes: [
      {
        title: 'Start with the catalog',
        text: 'The project directory names SisFall, MobiFall and MobiAct, UP-Fall, a pothole and speed-bump dataset, UCI smartphone activity recognition and UMAFall. They describe useful falls, ordinary activities and road disturbances. A filename or dataset-origin tag alone cannot establish that a particular recording was imported.',
      },
      {
        title: 'Inspect the files actually used',
        text: 'The Android app bundles 121 generated JSON traces, eleven per scenario family. Each base trace uses a local waveform generator. The training script creates variations. The small charts use the 50 acceleration values in each base file.',
      },
      {
        title: 'Explain how measured sessions enter',
        text: 'IMU Studio can label a session and export both time-stamped inertial readings and windowed features. Android accepts labeled CSV or supported JSON for calibration. A field evaluation needs identifiable sessions with a collection protocol and a held-out split.',
      },
    ],
    sources: [
      records.catalog,
      records.generator,
      records.variations,
      records.collector,
      {
        label: 'Labeled calibration import',
        path: 'apps/android_app/app/src/main/java/com/example/sensor/ImuCalibrationManager.kt',
      },
      { label: 'Base walking fixture', path: corpus + 'benchmark_walking.json' },
    ],
  },
  {
    id: 'impact',
    title: 'Impact',
    headline: 'Give the station a report it can act on',
    summary:
      'For the rider, the aim is a way to report an incident when calling is difficult. For the station, it is a location and event record to review. The next trial must measure how often that handoff succeeds.',
    notes: [
      {
        title: 'Close the reporting gap',
        text: 'Return to the original question. A phone can identify a candidate event, a paired wearable can relay it and an operator can review it. Radio reach, a valid fix and a staffed receiving workflow all matter.',
      },
      {
        title: 'Define a credible impact study',
        text: 'Compare event-to-station time and successful delivery under matched coverage conditions. Count false alerts, missed events, stale or absent locations and operator acknowledgements. Response-time improvements or lives saved require separate evidence.',
      },
      {
        title: 'Hand off to the four-minute prototype demonstration',
        text: 'Show the paired phone and fabricated carrier. Trigger a clearly identified test event and observe what the receiver and station actually receive. Keep the synthetic replay and staged scenes available during the five-minute defense.',
      },
    ],
    sources: [
      records.paper,
      records.protocol,
      { label: 'Connectivity and field sweep plan', path: 'docs/agent/CONNECTIVITY_FIX_PLAN.md' },
      {
        label: 'InnovateX finals presentation and defense, page 9',
        path: event + 'Competition Guidelines/ESAC-2026_Competition-Guidelines_InnovateX.pdf',
      },
    ],
  },
];
const byId = new Map([...existing, ...added, ...appChapters].map((chapter) => [chapter.id, chapter]));
export const fullProgram = acts.flatMap((act, actIndex) =>
  act.ids.map((id) => {
    if (!byId.has(id)) throw new Error('Missing presentation chapter ' + id);
    return { ...byId.get(id), actIndex };
  }),
);
const extendedSeconds = [30, 45, 75, 50, 120, 70, 70, 80, 70, 80, 80, 70, 75, 75, 60];
const shortSeconds = {
  overview: 15,
  team: 15,
  problem: 35,
  scenarios: 35,
  calibration: 55,
  assistant: 35,
  hardware: 35,
  relay: 45,
  desktop: 30,
  validation: 40,
  impact: 20,
};
export function clock(seconds) {
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}
export function program(compact) {
  let time = 0;
  return fullProgram.flatMap((chapter, i) => {
    const duration = compact ? shortSeconds[chapter.id] : extendedSeconds[i];
    if (!duration) return [];
    const start = time;
    time += duration;
    return [{ ...chapter, timing: clock(start) + '–' + clock(time), duration }];
  });
}
