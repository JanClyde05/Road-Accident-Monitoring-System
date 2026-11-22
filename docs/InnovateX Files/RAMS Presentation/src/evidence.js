const android = 'apps/android_app/app/src/main/java/com/example';
const benchmarks = 'apps/android_app/app/src/main/assets/motion_benchmarks';
const innovateX = 'docs/InnovateX Files';
const paper =
  innovateX +
  '/Real Research Paper for InnovateX/RAMS_InnovateX_2026_Research_Paper_Working_Draft.docx';
const wearableCad = 'hardware/KiCAD Files/GPT6 Astra Build/RAMS Wearable';

export const chapters = [
  {
    id: 'overview',
    title: 'Overview',
    kicker: 'The research question',
    headline: 'When a rider cannot call for help',
    summary:
      'Can a phone recognize crash-like motion, and can a wearable carry that report to a nearby station when cellular service is unavailable?',
    notes: [
      {
        title: 'Start with the rider',
        text: 'Picture a rider hitting a pothole. The phone feels a sharp jolt, but the rider keeps moving. Now picture a fall on the same road. We need to decide which motion deserves an alert and give that alert a way out.',
      },
      {
        title: 'Follow one report',
        text: 'The phone supplies motion and location. A paired wearable carries the event over radio. At the receiving station, an operator can open the incident. We will follow those steps and show which parts we can test with the evidence in hand.',
      },
      {
        title: 'State the objectives',
        text: 'The research asks whether the motion rules distinguish accident-like events from ordinary activity, and whether a paired wearable can deliver the resulting report to a receiver. The potential benefit is a second reporting route for a rider who cannot make a call.',
      },
    ],
    sources: [
      { label: 'InnovateX research working paper', path: paper },
      { label: 'Phone-assisted wearable configuration', path: 'firmware/wearable_withApp/config.h' },
    ],
  },
  {
    id: 'detection',
    title: 'Detection',
    kicker: 'Reading the motion',
    headline: 'A pothole can produce a 4.18 g shock',
    summary:
      'In the scripted pothole, the phone finishes almost level. In the impact example, its orientation changes sharply. Acceleration alone misses that distinction.',
    notes: [
      {
        title: 'Read the traces',
        text: 'Both examples cover 50 samples at 20 ms intervals. The pothole reaches 4.18 g with 0.2° of combined pitch and roll change. The impact reaches 8.50 g with 154.5° of combined change. Those angles describe the change in sensor orientation from the first sample to the last.',
      },
      {
        title: 'Explain the decision',
        text: 'On Android, accelerometer, gyroscope and location readings give the classifier a rolling window of motion and an estimate of speed. Its rules look for combinations of shock, rotation and tilt. The 50 Hz timing shown here belongs to the synthetic files. Actual handset timing depends on the sensor callbacks.',
      },
    ],
    sources: [
      { label: 'Scripted pothole trace', path: benchmarks + '/benchmark_pothole.json' },
      { label: 'Scripted impact trace', path: benchmarks + '/benchmark_impact.json' },
      { label: 'Scripted fall trace', path: benchmarks + '/benchmark_fall.json' },
      { label: 'Android motion classifier', path: android + '/ai/SensorAiInferenceEngine.kt' },
      { label: 'Phone sensor input', path: android + '/sensor/PhoneSensorEngine.kt' },
    ],
  },
  {
    id: 'calibration',
    title: 'Calibration',
    kicker: 'Data and adaptation',
    headline: 'How the phone learns a threshold',
    summary:
      'Labeled sessions can tune the motion thresholds. The team also generated 121 synthetic traces to exercise the decision rules across 11 scenarios.',
    notes: [
      {
        title: 'Where the traces came from',
        text: 'Public datasets such as SisFall and MobiFall appear in the research directory as references. The files bundled with the current Android app contain locally generated motion profiles. Each scenario has 11 examples. Together they contain 33 accident-labeled and 88 benign traces, with 6,050 sample rows.',
      },
      {
        title: 'What calibration does',
        text: 'The app can record and label a phone session, export it and import labeled feature data. For a CSV import it compares peaks by session. When the lowest accident peak exceeds the highest benign peak, their midpoint becomes the acceleration threshold. Overlapping ranges use the lowest accident peak. This is data-calibrated classification with explicit rules.',
      },
      {
        title: 'Where the other training assets fit',
        text: 'The build script also generates assistant questions and answers from text templates and expands written variants of voice commands. The bundled knowledge file contains 1,655 entries. Motion detection uses calibrated thresholds and kinematic rules, so the size of the text collection says nothing about crash-detection accuracy.',
      },
    ],
    sources: [
      { label: 'Motion profile generator', path: 'scripts/generate_benchmark_motion_datasets.py' },
      { label: 'Synthetic variation and text generator', path: 'scripts/train_rams_ai.py' },
      {
        label: 'Labeled session import and calibration',
        path: android + '/sensor/ImuCalibrationManager.kt',
      },
      { label: 'Recording and export', path: android + '/ai/DeveloperTrainingSuite.kt' },
      { label: 'Rider dismissal and cancel-message handler', path: android + '/viewmodel/RamsViewModel.kt' },
      { label: 'Saved motion profiles and matching limits', path: android + '/ai/SensorAiInferenceEngine.kt' },
      { label: 'Public dataset reference directory', path: 'docs/FREE_MOTION_DATASETS_DIRECTORY.md' },
    ],
  },
  {
    id: 'hardware',
    title: 'Hardware',
    kicker: 'Two generations of the wearable',
    headline: 'One wearable, two board designs',
    summary:
      'The fabricated prototype carries an ESP32-S3 SuperMini module. The RAMS Wearable places an ESP32-S3 chip directly on a 42 × 32 mm, four-layer PCB.',
    notes: [
      {
        title: 'Show the fabricated prototype',
        text: 'Identify the SuperMini development module on the hand-built board, then the Ra-02 radio and buzzer. The phone supplies the motion and location data over Bluetooth Low Energy. The wearable gives the rider a physical cancel button and the system a radio link.',
      },
      {
        title: 'Show the custom SMD design',
        text: 'The RAMS Wearable integrates the ESP32-S3FH4R2, an AP2112 linear regulator and battery measurement. The Ra-02 radio sits on the underside. The project contains the routed KiCad board, assembly drawings and first-prototype fabrication files. Electrical operation of this revision awaits an assembled first article.',
      },
    ],
    sources: [
      { label: 'SuperMini prototype netlist review', path: 'docs/agent/HARDWARE_REVISION_PLAN.md' },
      { label: 'RAMS Wearable design and manufacturing status', path: wearableCad + '/README.md', displayPath: 'RAMS Wearable / README.md' },
      { label: 'Custom SMD board layout', path: wearableCad + '/RAMS_JLC_S3.kicad_pcb', displayPath: 'RAMS Wearable / RAMS_JLC_S3.kicad_pcb' },
      {
        label: 'Exhibit geometry, component photographs and model sources',
        path: innovateX + '/RAMS Presentation/public/hardware/sources.md',
      },
    ],
  },
  {
    id: 'relay',
    title: 'Alert relay',
    kicker: 'The radio path',
    headline: 'What travels in 26 bytes',
    summary:
      'The wearable sends a compact alert over 433 MHz LoRa. A receiver within radio reach can pass the event to the Windows station over USB.',
    notes: [
      {
        title: 'Follow the handoff',
        text: 'First, the Android app sends its classified event and location to the SuperMini over BLE. The wearable transmits through the Ra-02. The receiver decodes the radio message and forwards it to the station. This local route can operate without a cellular connection.',
      },
      {
        title: 'Read the payload',
        text: 'The packed alert contains the packet type, device token, send-time counter, coordinates, event type and peak acceleration. Rider details travel in a separate profile packet. The station can also receive a false-alarm message when the rider cancels. The alert payload is 26 bytes before radio overhead.',
      },
      {
        title: 'Explain the radio settings',
        text: 'The default firmware configuration uses spreading factor 9, 125 kHz bandwidth and coding rate 4/5. The illustrated mast represents a receiver in range. Its position and the road geometry are illustrative. Actual coverage depends on the installation.',
      },
    ],
    sources: [
      { label: 'Packed alert and radio settings', path: 'firmware/shared/protocol.h' },
      { label: 'Wearable radio transmitter', path: 'firmware/wearable_withApp/lora_tx.cpp' },
      { label: 'Station radio receiver', path: 'firmware/receiver_withDesktop/lora_rx.cpp' },
      {
        label: 'Windows station USB serial ingestion',
        path: 'apps/new_ai_applications/desktop_ai_app/Program.cs',
      },
    ],
  },
  {
    id: 'validation',
    title: 'Validation',
    kicker: 'Evidence and next tests',
    headline: 'Take the next test off the screen',
    summary:
      'The Android classifier matched all 33 accident flags and 88 benign flags in the synthetic replay. It gave some motions the wrong subtype. Field performance remains an open question.',
    notes: [
      {
        title: 'State what the replay tests',
        text: 'We ran the compiled Android classification function on a desktop JVM, using the stored features from all 121 fixtures and an empty learned profile. Its alarm decision agreed with all 33 accident labels and all 88 benign labels. All 11 scripted potholes received the benign wind-flutter subtype. This test starts after feature extraction and covers the binary alarm decision only.',
      },
      {
        title: 'Describe the next trial',
        text: 'Label safe, controlled motions and keep complete trials together. Tune on development trials, freeze the settings, then count missed events and false alarms on held-out trials. For the radio test, count messages sent and received at each marked position and measure elapsed time from phone event to station receipt with synchronized clocks.',
      },
      {
        title: 'Hand over to the demonstration',
        text: 'The finals schedule allows six minutes for the research talk, four for the prototype and five for questions. Pair the phone and wearable, show a clearly identified test event, and follow it to the receiving station. Use the defense to discuss the traces, the board and the evidence still needed.',
      },
    ],
    sources: [
      { label: 'Research objectives and evaluation plan', path: paper },
      {
        label: 'JVM replay results for every fixture',
        path: innovateX + '/RAMS Presentation/verification/replay-output.tsv',
      },
      { label: 'Runtime benchmark evaluation', path: android + '/ai/SensorAiInferenceEngine.kt' },
      { label: 'Field sweep status', path: 'docs/agent/EXECUTION_PLAN.md' },
      {
        label: 'InnovateX competition guidelines, page 9',
        path: innovateX + '/Competition Guidelines/ESAC-2026_Competition-Guidelines_InnovateX.pdf',
      },
    ],
  },
];
