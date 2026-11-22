import { station } from './station.js';

const app = 'apps/android_app/app/src/main';
const kotlin = app + '/java/com/example';
const desk = 'apps/new_ai_applications/desktop_ai_app';
const archive = 'archive/duplicates/mobile_ai_app_2026-11/rams_live_screen.png';
const record = 'docs/InnovateX Files/RAMS Presentation/public/apps/sources.md';

export const appChapters = [
  {
    id: 'mobile',
    title: 'Mobile app',
    kicker: 'The rider’s interface',
    headline: 'What the rider sees',
    summary:
      'The Android companion reads the phone’s movement and location. The rider can check the wireless link, inspect a jolt and use a spoken command while the phone stays in a pocket.',
    notes: [
      {
        title: 'Pair the hardware',
        text: 'The Wearable screen lists discovered and bonded devices and offers controls for connecting, sending an SOS and cancelling a false alarm. A BLE connection links the phone to the physical radio carrier.',
      },
      {
        title: 'Read the motion',
        text: 'The Telemetry screen displays acceleration magnitude and the session peak. Its diagnostics reveal individual sensor axes. The plotted value is an observation; the classification pipeline uses additional features and the rider’s speed context.',
      },
      {
        title: 'Use the companion',
        text: 'The archive contains an earlier capture of the hands-free wake overlay. The current recognizer and command router are documented in the RAMS AI chapter. The application uses the handset’s speech service and can speak the result with text-to-speech.',
      },
    ],
    sources: [
      { label: 'Android app navigation', path: kotlin + '/MainActivity.kt' },
      { label: 'Wearable pairing screen', path: kotlin + '/ui/screens/WearableScreen.kt' },
      { label: 'Phone telemetry screen', path: kotlin + '/ui/screens/TelemetryScreen.kt' },
      { label: 'Archived Android voice overlay capture', path: archive },
      { label: 'App capture notes', path: record },
    ],
  },
  {
    id: 'assistant',
    title: 'RAMS AI',
    kicker: 'Voice and personal assistance',
    headline: 'What happens after “Hey RAMS”?',
    summary:
      'RAMS listens for a wake phrase in the phone’s speech transcript. It can change a rider setting, answer from the device’s current state or recall a saved answer.',
    notes: [
      {
        title: 'Where the voice data came from',
        text: 'The packaged JSON describes 32 wake prefixes, 55 written variants of RAMS, 30 slurred forms and 78 base cancel phrases. The loader builds spaced and joined prefix/name combinations. Android produces candidate text; RAMS applies phrase rules and fuzzy comparisons. These counts describe text entries. The historical methodology also describes recording conditions, but the APK’s text resources cannot establish a recorded-audio trial size or voice accuracy.',
      },
      {
        title: 'How RAMS gets a personal answer',
        text: 'Device-state queries read current values such as wearable connectivity, role or speed. The phrase “lakad ako” contains the walking keyword and can select the Pedestrian category. A recognized cancel instruction has its own safety action. These guarded actions have a direct path through app code.',
      },
      {
        title: 'What Gemini contributes',
        text: 'The shipped Q&A file has 1,655 distinct normalized keys. Every packaged row carries the RAMS-AutoTrain-Corpus-v3.2 source label, matching the local template generator. For eligible unanswered queries the Android app can request a Gemini answer when a network connection and configured service are available. Successfully returned answers can be saved on the phone and recalled offline by normalized query key. Local response rules handle further cases.',
      },
      {
        title: 'Inspect one stored record',
        text: 'The packaged question “what is sensor fusion” is stored under “fusion sensor”. Its response describes the accelerometer’s gravitational reference and the gyroscope’s responsiveness. The language resource can repeat that answer from storage. Corpus size counts available answers; it does not measure their correctness.',
      },
      {
        title: 'What the training evidence supports',
        text: 'The motion classifier, speech recognizer and knowledge cache perform different jobs. The repository contains model specification labels, including RAMS-1.8B-Edge. The demonstrated assistant path uses stored text, live context, app actions and optional remote answers. The checked Android assets contain no independently verified 1.8B weight checkpoint or acoustic-training run.',
      },
    ],
    sources: [
      { label: 'Voice patterns and command resources', path: app + '/assets/voice_wake_patterns.json' },
      {
        label: 'Android speech recognition and command dispatch',
        path: kotlin + '/ai/VoiceAlarmCanceler.kt',
      },
      {
        label: 'Assistant routing, Gemini requests and local cache',
        path: kotlin + '/ai/RamsAiAssistantEngine.kt',
      },
      { label: 'Bundled Q&A records', path: app + '/assets/rams_distilled_knowledge.jsonl' },
      { label: 'Corpus generator', path: 'scripts/train_rams_ai.py' },
      {
        label: 'Historical Gemini-era voice methodology',
        path: 'docs/MD Files/RAMS_AI_TRAINING_METHODOLOGY.md',
      },
    ],
  },
  {
    id: 'desktop',
    title: 'Rescuer desk',
    kicker: 'The operator’s interface',
    headline: 'What reaches the rescue desk',
    summary:
      'Select a map pin at the Windows station, open its registered rider and read their incident history. The three fictional records show how an operator can follow an alert from a location to a person.',
    notes: [
      {
        title: 'Open the station view',
        text: 'Select Lina’s red pin, open her rider profile and choose Incident history. The station groups events by device, prioritizes an unresolved alert for its pin and looks up the rider’s matching records. The timeline includes a crash alert, an earlier cancellation and registration. These captures use three fictional people and seven scripted events.',
      },
      {
        title: 'Inspect radio diagnostics',
        text: 'The separate ping window exposes station configuration, reception history and CSV export for field sampling. Its airtime estimate is a calculated model. Measured delivery and end-to-end delay need timestamped samples.',
      },
      {
        title: 'Review incident patterns',
        text: 'The Windows spatial analysis uses Haversine distances and DBSCAN on incident coordinates. The default neighborhood is 150 metres with a three-point density criterion. A cluster describes recorded incidents. It does not predict an individual rider’s next crash. The reporting code also provides an optional local Ollama path and a structured fallback.',
      },
    ],
    sources: [
      { label: 'Windows USB serial and event ingestion', path: desk + '/Program.cs' },
      { label: 'Shipping rescuer dashboard', path: desk + '/www/index.html' },
      { label: 'One station pin per wearable', path: 'apps/backend/src/components/RAMSMapView.tsx' },
      { label: 'Rider profile and chronological event history', path: 'apps/backend/src/components/RAMSWearableProfileOverlay.tsx' },
      { label: 'Station and field diagnostics', path: desk + '/www/ping.html' },
      { label: 'Spatial clustering implementation', path: desk + '/HotspotPredictor.cs' },
      { label: 'Report generator and fallback', path: desk + '/DesktopAiReportGenerator.cs' },
      { label: 'App capture notes', path: record },
    ],
  },
];

const mobileScreens = [
  {
    tab: 'Wearable',
    image: 'android-wearable',
    title: 'Pair the carrier',
    text: 'The Wearable screen shows the link state. The rider scans for the carrier, selects it and can later check whether the two devices are connected.',
    credit: 'Android Compose · disconnected fixture',
  },
  {
    tab: 'Telemetry',
    image: 'android-telemetry',
    title: 'Inspect the movement',
    text: 'The rider sees the current acceleration magnitude and the peak for the session. Advanced diagnostics expose the underlying acceleration and rotation axes.',
    credit: 'Android Compose · empty session',
  },
  {
    tab: 'Voice',
    image: 'android-voice',
    title: 'Use a hands-free command',
    text: 'This earlier phone capture shows the wake overlay and its simulator buttons. The current voice route can interpret a transcript and pass the selected action to the app.',
    credit: 'Archived handset capture · voice overlay crop',
  },
];
const deskScreens = [
  {
    tab: 'Reception',
    image: 'desktop-station',
    title: 'Inspect the receiver link',
    text: 'The station window brings packet reception, propagation measurements and CSV export into one place. The airtime figure on screen is a model estimate.',
    credit: 'Windows station UI · empty fixture',
  },
  {
    tab: 'Unit registry',
    image: 'station-registry',
    title: 'Find a wearable or an alert',
    text: 'The incident dashboard groups the seven demo events into three registered units. Each row shows the device identity, current status and number of events.',
    credit: 'Windows dashboard · fictional units',
  },
  {
    tab: 'Hotspots',
    image: 'desktop-hotspots',
    title: 'Review recurring locations',
    text: 'The spatial analysis groups historical incident coordinates. Its default DBSCAN settings use a 150 m neighborhood and three points.',
    credit: 'Windows AI suite · empty incident history',
  },
];

function styleExhibit() {
  if (document.getElementById('app-exhibits-style')) return;
  const link = document.createElement('link');
  link.id = 'app-exhibits-style';
  link.rel = 'stylesheet';
  link.href = 'public/apps/exhibits.css';
  document.head.append(link);
}

function screenGallery(panel, screens, phone) {
  styleExhibit();
  panel.innerHTML = `<div class="plate app-exhibit"><div class="plate-head"><strong>${phone ? 'Android companion' : 'Windows console'}</strong><span class="tiny">${phone ? 'Rider' : 'Operator'} view</span></div>
    <div class="app-tabs" aria-label="Choose a screen"></div>
    <div class="app-gallery ${phone ? 'app-mobile' : 'app-desktop'}"><button class="app-capture" title="Enlarge screen capture"><img alt=""></button><div class="app-caption"><span class="eyebrow"></span><h3></h3><p></p><button class="small-button app-enlarge">Enlarge capture</button></div></div></div>`;
  const tabs = panel.querySelector('.app-tabs'),
    picture = panel.querySelector('.app-capture img');
  const caption = panel.querySelector('.app-caption');
  let active = screens[0],
    zoom;
  const choose = (index) => {
    active = screens[index];
    [...tabs.children].forEach((button, i) => button.setAttribute('aria-pressed', i === index));
    picture.src = 'public/apps/' + active.image + '.webp';
    picture.alt = active.title + ' — ' + active.credit;
    caption.querySelector('.eyebrow').textContent = active.credit;
    caption.querySelector('h3').textContent = active.title;
    caption.querySelector('p').textContent = active.text;
    panel
      .querySelector('.app-capture')
      .classList.toggle('voice-crop', active.image === 'android-voice');
  };
  screens.forEach((item, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.tab;
    button.onclick = () => choose(i);
    tabs.append(button);
  });
  function enlarge() {
    if (zoom?.open) return;
    const opener = document.activeElement;
    zoom = document.createElement('dialog');
    zoom.className = 'screen-zoom';
    zoom.setAttribute('aria-label', active.title);
    zoom.innerHTML =
      '<header><strong></strong><button class="small-button">Close</button></header><img alt=""><p></p>';
    zoom.querySelector('strong').textContent = active.title;
    zoom.querySelector('img').src = picture.src;
    zoom.querySelector('img').alt = picture.alt;
    zoom.querySelector('p').textContent = active.credit;
    zoom.querySelector('button').onclick = () => zoom.close();
    zoom.addEventListener('keydown', (event) => event.stopPropagation());
    zoom.addEventListener('close', () => {
      zoom.remove();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    });
    document.body.append(zoom);
    zoom.showModal();
  }
  panel.querySelector('.app-capture').onclick = enlarge;
  panel.querySelector('.app-enlarge').onclick = enlarge;
  choose(0);
  return () => {
    if (zoom?.open) zoom.close();
  };
}

export const mobile = (panel) => screenGallery(panel, mobileScreens, true);
export const desktop = (panel) => {
  styleExhibit();
  return station(panel, (holder) => screenGallery(holder, deskScreens, false));
};

const routes = [
  {
    tab: 'Wake word',
    prompt: '“Hey rhams”',
    nodes: ['Speech', 'Pattern', 'Wake'],
    action: 'The wake phrase opens the command window.',
    hint: 'Android supplies candidate text. RAMS combines 32 prefixes with 55 written name variants, including “rhams.” The matcher also accepts joined forms and close spellings.',
  },
  {
    tab: 'App action',
    prompt: '“Lakad ako”',
    nodes: ['Transcript', 'Walking', 'Profile'],
    action: 'The app switches the user category to Pedestrian.',
    hint: 'The command router recognizes “lakad” as a walking intent. It hands a category change to the app and prepares spoken confirmation.',
  },
  {
    tab: 'Personal reply',
    prompt: '“Is my wearable connected?”',
    nodes: ['Question', 'BLE state', 'Answer'],
    action: 'The response uses the current connection state.',
    hint: 'For a connected wearable the Android handler includes its reported battery percentage. For a disconnected wearable it gives pairing instructions.',
  },
  {
    tab: 'Gemini cache',
    prompt: 'An unanswered question',
    nodes: ['Cache miss', 'Gemini', 'Save key'],
    action: 'A successful online answer can be recalled later.',
    hint: 'The app normalizes a question and checks stored answers. An eligible miss can reach Gemini online. The phone saves the returned answer under its key for offline lookup.',
  },
];
export function assistant(panel) {
  styleExhibit();
  panel.innerHTML = `<div class="plate app-exhibit ai-exhibit"><div class="plate-head"><strong>RAMS AI</strong><span class="tiny">Command walkthrough</span></div><div class="app-tabs" aria-label="Choose an assistant route"></div><div class="ai-case">
    <div class="ai-words"><div class="ai-orb" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div><span class="eyebrow">Example input</span><h3></h3></div></div>
    <div class="ai-route" aria-label="Processing stages"></div><h4></h4><p></p><div class="ai-example"></div></div><div class="plate-foot"><span class="tiny">Bundled knowledge</span><span>1,655 distinct Q&amp;A keys</span></div></div>`;
  const tabs = panel.querySelector('.app-tabs');
  function show(index) {
    const route = routes[index],
      block = panel.querySelector('.ai-case');
    [...tabs.children].forEach((b, i) => b.setAttribute('aria-pressed', index === i));
    block.querySelector('h3').textContent = route.prompt;
    block.querySelector('h4').textContent = route.action;
    block.querySelector('p').textContent = route.hint;
    const nodes = block.querySelector('.ai-route');
    nodes.replaceChildren();
    route.nodes.forEach((item, i) => {
      const node = document.createElement('span');
      node.textContent = item;
      node.style.setProperty('--step', i);
      nodes.append(node);
    });
    const example = block.querySelector('.ai-example');
    example.replaceChildren();
    if (index === 2) {
      example.innerHTML =
        '<label>Example link state <select aria-label="Example wearable connection"><option>Disconnected</option><option>Connected</option></select></label><output></output>';
      const select = example.querySelector('select'),
        output = example.querySelector('output');
      const update = () => {
        output.textContent = select.selectedIndex
          ? 'The phone reports an active BLE link and reads the wearable battery field.'
          : 'The phone reports a disconnected link and directs the rider to the Wearable tab.';
      };
      select.onchange = update;
      update();
    }
    if (index === 3) {
      example.innerHTML =
        '<details><summary>Inspect one packaged Q&amp;A key</summary><p><b>what is sensor fusion</b><br>Stored under <code>fusion sensor</code>. The source answer describes accelerometer and gyroscope behavior.</p></details>';
    }
  }
  routes.forEach((route, i) => {
    const btn = document.createElement('button');
    btn.textContent = route.tab;
    btn.onclick = () => show(i);
    tabs.append(btn);
  });
  show(0);
}
