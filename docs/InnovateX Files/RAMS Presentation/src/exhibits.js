import { icon } from './icons.js';
import { inspectBoard } from './board.js';

const traces = __TRACE_DATA__;
const boardSpecs = {
  prototype: {
    name: 'SuperMini carrier',
    label: 'Fabricated prototype',
    description: '50 × 43 mm carrier with an ESP32-S3 SuperMini and a separate Ra-02 radio breakout.',
    credit: 'CAD reconstruction with module photographs',
  },
  'custom-smd': {
    name: 'RAMS Wearable',
    label: 'Custom SMD design',
    description:
      '42 × 32 mm, four copper layers and a directly mounted ESP32-S3FH4R2. Flip the board to inspect the underside radio.',
    credit: 'Fabrication CAD · first article pending',
  },
};
export function detection(panel) {
  let choice = 'pothole';
  let frame = 0;
  const labels = {
    walking: 'Walking',
    pothole: 'Pothole',
    phone_falling: 'Phone drop',
    impact: 'Impact',
    fall: 'Fall',
  };
  function select(name) {
    cancelAnimationFrame(frame);
    frame = 0;
    choice = name;
    const { samples, peak, tilt, speed } = traces[choice];
    const x = (i) => 43 + (i * 480) / 49;
    const y = (g) => 161 - g * 13.4;
    const points = samples.map((row, i) => x(i).toFixed(1) + ',' + y(row[1]).toFixed(1)).join(' ');
    const peakIndex = samples.findIndex((row) => row[1] === Math.max(...samples.map((s) => s[1])));
    panel.innerHTML = `<div class="plate">
      <div class="plate-head trace-head"><strong>Motion trace</strong><div class="segment" aria-label="Select trace">${Object.keys(
        labels,
      )
        .map(
          (s) =>
            '<button data-trace="' +
            s +
            '" aria-pressed="' +
            (s === name) +
            '">' +
            labels[s] +
            '</button>',
        )
        .join('')}</div></div>
      <div class="plot-wrap"><div class="plot-label"><span class="tiny">Acceleration magnitude (g)</span><span class="trace-key">Synthetic fixture</span></div>
      <svg viewBox="0 0 548 193" role="img" aria-label="${name} acceleration over 980 milliseconds, peak ${peak.toFixed(2)} g">
        <defs><linearGradient id="trace-fill" x2="0" y2="1"><stop stop-color="#6fe5dc" stop-opacity=".3"/><stop offset="1" stop-color="#6fe5dc" stop-opacity=".02"/></linearGradient></defs>
        ${[0, 2, 4, 6, 8, 10].map((n) => '<path stroke="#33434d" stroke-dasharray="2 4" d="M43 ' + y(n) + 'h480"/><text x="31" y="' + (y(n) + 4) + '" text-anchor="end">' + n + '</text>').join('')}
        ${[0, 250, 500, 750, 980].map((n) => '<text x="' + (43 + (480 * n) / 980) + '" y="184" text-anchor="middle">' + n + ' ms</text>').join('')}
        <polygon points="43,161 ${points} 523,161" fill="url(#trace-fill)"/>
        <polyline points="${points}" fill="none" stroke="#83ede3" stroke-width="2.6" stroke-linejoin="round"/>
        <line id="cursor" y1="19" y2="161" stroke="#ffbd78" stroke-dasharray="3 4"/><circle id="sample-dot" r="4" fill="#ffc47f" stroke="#16212a" stroke-width="2"/>
      </svg></div>
      <div class="scrub"><button class="small-button" id="trace-play" title="Replay the trace at one quarter speed">Play trace</button><input type="range" min="0" max="49" value="${peakIndex}" aria-label="Inspect motion sample"><output></output></div>
      <div class="stats">${[
        [peak.toFixed(2) + ' g', 'Peak acceleration'],
        [tilt.toFixed(1) + '°', 'Tilt change'],
        [speed + ' km/h', 'Scripted speed'],
      ]
        .map(([a, b]) => '<div class="stat"><b>' + a + '</b><small>' + b + '</small></div>')
        .join('')}</div>
      <div class="plate-foot"><span class="tiny">50 samples · 50 Hz</span><span>Android benchmark fixture</span></div></div>`;
    const range = panel.querySelector('input');
    function inspect() {
      const i = Number(range.value),
        row = samples[i];
      const dot = panel.querySelector('#sample-dot'),
        cursor = panel.querySelector('#cursor');
      dot.setAttribute('cx', x(i));
      dot.setAttribute('cy', y(row[1]));
      cursor.setAttribute('x1', x(i));
      cursor.setAttribute('x2', x(i));
      panel.querySelector('output').textContent = row[0] + ' ms · ' + row[1].toFixed(2) + ' g';
      range.setAttribute('aria-valuetext', row[0] + ' milliseconds, ' + row[1].toFixed(2) + ' g');
    }
    const play = panel.querySelector('#trace-play');
    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      play.textContent = 'Play trace';
    }
    range.oninput = () => {
      stop();
      inspect();
    };
    play.onclick = () => {
      if (frame) {
        stop();
        return;
      }
      const start = performance.now();
      play.textContent = 'Pause trace';
      function tick(now) {
        range.value = String(Math.min(49, Math.floor((now - start) / 80)));
        inspect();
        if (Number(range.value) < 49) frame = requestAnimationFrame(tick);
        else stop();
      }
      frame = requestAnimationFrame(tick);
    };
    inspect();
    panel.querySelectorAll('[data-trace]').forEach((button) => {
      button.onclick = () => {
        select(button.dataset.trace);
        panel.querySelector('[aria-pressed="true"]').focus({ preventScroll: true });
      };
    });
  }
  select(choice);
  return () => cancelAnimationFrame(frame);
}

export function calibration(panel) {
  const views = { corpus: 'Dataset', threshold: 'Threshold', feedback: 'Rider feedback', language: 'Language' };
  const examples = __EXAMPLE_DATA__;
  const names = {
    pothole: 'Pothole',
    phone_falling: 'Dropped phone',
    normal_vehicle_ride: 'Normal ride',
    impact: 'Impact',
    fall: 'Fall',
    skidding: 'Skid',
  };
  panel.innerHTML = `<div class="plate"><div class="plate-head"><strong>Calibration lab</strong><div class="segment" aria-label="Calibration exhibits">${Object.entries(
    views,
  )
    .map(([id, label]) => '<button data-lab="' + id + '">' + label + '</button>')
    .join('')}</div></div><div id="lab-body"></div></div>`;
  const body = panel.querySelector('#lab-body');
  function select(tab) {
    panel
      .querySelectorAll('[data-lab]')
      .forEach((btn) => btn.setAttribute('aria-pressed', btn.dataset.lab === tab));
    if (tab === 'corpus')
      body.innerHTML = `
    <div class="corpus-body"><div class="corpus-intro"><b>121</b><span>generated traces</span></div><div class="dataset-bars" aria-label="3 accident and 8 benign scenario families">${Array.from({ length: 11 }, (_, i) => '<span class="' + (i < 3 ? 'pos' : '') + '"></span>').join('')}</div><div class="legend"><span>33 accident-labeled</span><span>88 benign</span></div>
    <ul class="pipeline"><li><b>Research</b><span>SisFall, MobiFall and other public datasets informed the project’s reference catalog.</span></li><li><b>Generate</b><span>Local Python scripts produced 11 scenario families and their variants for the Android app.</span></li><li><b>Extract</b><span>Each trace carries 14 summary features covering acceleration, rotation, jerk and tilt.</span></li></ul>
    </div><div class="plate-foot"><span class="tiny">11 scenarios</span><span>6,050 sample rows</span></div>`;
    if (tab === 'feedback')
      body.innerHTML = `<div class="corpus-body"><div class="corpus-intro"><span class="eyebrow">After a rider cancels</span></div><ul class="pipeline"><li><b>Dismiss</b><span>Android stops the alarm and countdown and records a dismissal reason and count.</span></li><li><b>Correct</b><span>The app updates the local event and requests a separate cancel message through the paired wearable.</span></li><li><b>Learn</b><span>The classifier can match a saved motion profile below 6 g. The current cancellation handler does not save the dismissed motion as a new profile.</span></li></ul></div><div class="plate-foot"><span class="tiny">Android implementation</span><span>Local feedback path</span></div>`;
    if (tab === 'language')
      body.innerHTML = `<div class="corpus-body"><div class="corpus-intro"><b>1,655</b><span>bundled Q&amp;A records</span></div><ul class="pipeline"><li><b>Generate</b><span>The training script expands question and answer templates into an offline knowledge file.</span></li><li><b>Voice</b><span>The command resource lists 32 wake prefixes and 55 written phonetic variants of “RAMS.”</span></li><li><b>Evidence</b><span>These assets document text generation and phrase matching. The motion decision comes from the separate Android classifier.</span></li></ul></div><div class="plate-foot"><span class="tiny">Assistant resources</span><span>Text templates and variants</span></div>`;
    if (tab === 'threshold') {
      const options = (flag) =>
        Object.keys(examples)
          .filter((k) => examples[k].accident === flag)
          .map((k) => '<option value="' + k + '">' + names[k] + '</option>')
          .join('');
      body.innerHTML = `<div class="corpus-body"><div class="example-pair"><label>Benign session<select id="benign">${options(false)}</select></label><label>Accident-labeled session<select id="positive">${options(true)}</select></label></div><div class="calculation"><span class="eyebrow">Illustrative import result</span><div class="corpus-intro"><b id="threshold-g"></b><span>acceleration threshold</span></div><p id="threshold-equation"></p></div><p class="lab-note">This example uses the peaks of two packaged sessions. An actual CSV import considers every labeled session in the file.</p></div><div class="plate-foot"><span class="tiny">Android CSV calibration rule</span><span>Two-fixture example</span></div>`;
      const update = () => {
        const benign = examples[body.querySelector('#benign').value].peak,
          positive = examples[body.querySelector('#positive').value].peak;
        const separated = positive > benign;
        body.querySelector('#threshold-g').textContent =
          (separated ? (positive + benign) / 2 : positive).toFixed(2) + ' g';
        body.querySelector('#threshold-equation').textContent = separated
          ? '(' +
            benign.toFixed(2) +
            ' g + ' +
            positive.toFixed(2) +
            ' g) ÷ 2. The two peaks leave a gap.'
          : 'The benign peak (' +
            benign.toFixed(2) +
            ' g) meets or exceeds the accident peak (' +
            positive.toFixed(2) +
            ' g). The import uses the accident peak.';
      };
      body.querySelectorAll('select').forEach((el) => {
        el.onchange = update;
      });
      update();
    }
  }
  panel.querySelectorAll('[data-lab]').forEach((btn) => {
    btn.onclick = () => select(btn.dataset.lab);
  });
  select('corpus');
}

export function hardware(panel) {
  let viewer, selected;
  function select(name) {
    viewer?.dispose();
    viewer = null;
    selected = name;
    const data = boardSpecs[name];
    panel.innerHTML = `<div class="plate"><div class="plate-head"><strong>Board inspection</strong><div class="board-switch" aria-label="Choose board"><button data-board="prototype" aria-pressed="${name === 'prototype'}">Prototype</button><button data-board="custom-smd" aria-pressed="${name === 'custom-smd'}">Custom SMD</button></div></div>
    <div class="board-canvas"><img src="public/hardware/${name}.webp" alt="${data.name}, ${data.credit}"></div>
    <div class="board-caption"><span class="eyebrow">${data.label}</span><h3>${data.name}</h3><p>${data.description}</p><small>${data.credit}</small></div>
    <div class="plate-foot"><span id="board-report" aria-live="polite">Loading CAD model…</span><div class="board-actions"><button id="flip" class="small-button" disabled>Flip board</button><button id="reset-board" class="small-button" aria-label="Reset board view" disabled>${icon('reset')}</button></div></div></div>`;
    panel.querySelectorAll('[data-board]').forEach((btn) => {
      btn.onclick = () => {
        if (btn.dataset.board !== selected) {
          select(btn.dataset.board);
          panel.querySelector('[aria-pressed="true"]').focus({ preventScroll: true });
        }
      };
    });
    const report = (message, active) => {
      panel.querySelector('#board-report').textContent = message;
      panel.querySelector('#flip').disabled = !active;
      panel.querySelector('#reset-board').disabled = !active;
    };
    try {
      viewer = inspectBoard(panel.querySelector('.board-canvas'), name, report);
      panel.querySelector('#flip').onclick = () => viewer.flip();
      panel.querySelector('#reset-board').onclick = () => viewer.reset();
    } catch {
      report('CAD still · interactive model unavailable', false);
    }
  }
  select('prototype');
  return () => viewer?.dispose();
}

const relaySteps = [
  [
    'phone',
    'Phone',
    'The phone supplies motion and position',
    'Android classifies the motion window using acceleration, rotation and speed context. A usable phone location lets the station place the event on a map.',
  ],
  [
    'chip',
    'Wearable',
    'Bluetooth hands the event to the wearable',
    'The paired device receives the event and phone coordinates over BLE. Its firmware starts the local alarm and gives the packed alert to the Ra-02 radio.',
  ],
  [
    'radio',
    'Receiver',
    'Inside the 26-byte LoRa alert',
    'A receiver in range reads the alert type and checks its length before decoding the fields.',
  ],
  [
    'desk',
    'Station',
    'The receiver reports over USB',
    'The receiver writes a LORA_ALERT record to USB serial with the decoded fields and measured signal quality. The Windows operator can review the event.',
  ],
];
const packetFields=[
  ['Header',13,'The first 13 bytes hold the packet type (1), device token (8) and wearable send-time counter (4). The counter measures milliseconds since boot.'],
  ['Latitude',4,'Bytes 14–17 carry the latitude as a 32-bit floating-point value in degrees. The paired phone supplies the location.'],
  ['Longitude',4,'Bytes 18–21 carry longitude in degrees. A usable pair of coordinates lets the station plot a pin.'],
  ['Event',1,'Byte 22 carries the event subtype. The protocol includes fall, skid and direct impact. A cancellation has its own packet type.'],
  ['Peak g',4,'Bytes 23–26 carry peak acceleration magnitude in g. Rider details travel separately in a profile packet.'],
];
export function relay(panel, road) {
  panel.innerHTML = `<div class="plate relay-plate"><div class="relay-top"><span class="eyebrow">Illustrated handoff</span><span class="tiny" id="relay-shot"></span></div><div class="relay-spacer"><img class="relay-still" alt="" hidden></div><div class="relay-nodes" aria-label="Explore the four handoffs">${relaySteps.map(([symbol, label], i) => (i ? '<span class="connector"><b>' + ['', 'BLE', 'LoRa', 'USB'][i] + '</b></span>' : '') + '<button class="relay-node" data-step="' + i + '"><span class="glyph">' + icon(symbol) + '</span>' + label + '</button>').join('')}</div><div class="step-detail"><h3></h3><p aria-live="polite"></p></div><div class="plate-foot"><span id="step-n" class="tiny"></span><button id="handoff" class="small-button"></button></div></div>`;
  const slot=panel.querySelector('.relay-spacer'), terrain=document.getElementById('road');
  const parent=terrain.parentNode, sibling=terrain.nextSibling, previousLabel=terrain.getAttribute('aria-label');
  const still=panel.querySelector('.relay-still');
  if(road)slot.prepend(terrain);
  else {still.hidden=false;terrain.hidden=true;}
  let step = 0;
  function select(i) {
    step = i;
    road?.setRelayStep?.(i);
    const label=relaySteps[i][2];
    panel.querySelector('#relay-shot').textContent=['Android motion','BLE · local','LoRa · 433 MHz','USB · serial'][i];
    if(road)terrain.setAttribute('aria-label',label+'. Enlarged schematic devices in an illustrative landscape.');
    else{still.src='public/relay/'+['phone','wearable','receiver','station'][i]+'.webp';still.alt=label;}
    panel.querySelector('#step-n').textContent = 'Handoff 0' + (i + 1) + ' / 04';
    panel.querySelector('.step-detail h3').textContent = relaySteps[i][2];
    panel.querySelector('.step-detail p').textContent = relaySteps[i][3];
    panel.querySelector('.packet-layout')?.remove();
    if (i === 2) {
      const packet = document.createElement('dl');
      packet.className = 'packet-layout';
      packet.setAttribute('aria-label','Inspect alert fields in wire order');
      function field(index){
        panel.querySelector('.step-detail p').textContent=packetFields[index][2];
        packet.querySelectorAll('button').forEach((btn,k)=>btn.setAttribute('aria-pressed',index===k));
      }
      for (const [index,[name,bytes]] of packetFields.entries()) {
        const group = document.createElement('div'),
          dt = document.createElement('dt'),
          dd = document.createElement('dd'),
          button=document.createElement('button');
        button.textContent=name;button.dataset.field=index;
        button.setAttribute('aria-label',name+', '+bytes+(bytes===1?' byte':' bytes'));
        button.onclick=()=>field(index);
        dt.append(button);
        dd.textContent = bytes + ' B';
        group.append(dt, dd);
        packet.append(group);
      }
      panel.querySelector('.step-detail').append(packet);
      field(0);
    }
    panel.querySelector('#handoff').textContent = i === 3 ? 'Replay handoff' : 'Follow the signal';
    panel.querySelectorAll('.relay-node').forEach((btn) => {
      const current = Number(btn.dataset.step) === i;
      btn.classList.toggle('active', current);
      btn.setAttribute('aria-pressed', current);
    });
  }
  panel.querySelectorAll('[data-step]').forEach((btn) => {
    btn.onclick = () => select(Number(btn.dataset.step));
  });
  panel.querySelector('#handoff').onclick = () => select((step + 1) % 4);
  select(0);
  return ()=>{
    if(road){parent.insertBefore(terrain,sibling);terrain.setAttribute('aria-label',previousLabel);}
    else terrain.hidden=false;
  };
}
export function validation(panel) {
  panel.innerHTML = `<div class="plate"><div class="plate-head"><strong>Validation record</strong><span class="tiny">Synthetic replay</span></div><div class="stats proof-stats"><div class="stat"><b>33 / 33</b><small>Accident flags matched</small></div><div class="stat"><b>88 / 88</b><small>Benign flags matched</small></div></div>
    <div class="proof-list"><article>${icon('check')}<div><h3>Binary alarm decision</h3><p>The compiled Android classifier replayed the stored feature vectors on a desktop JVM.</p></div></article>
    <article class="pending">${icon('focus')}<div><h3>Subtype errors</h3><p>All 11 potholes were labeled as wind flutter. Both labels suppress the alarm.</p></div></article><article class="pending">${icon('radio')}<div><h3>Next field measurements</h3><p>Held-out motion trials, packet delivery at measured distances and end-to-end alert latency.</p></div></article></div>
    <div class="plate-foot"><span class="tiny">Next · prototype demonstration</span><span>4 min</span></div></div>`;
}
