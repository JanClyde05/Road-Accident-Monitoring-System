import { acts, whoPH } from './program.js';
import { icon } from './icons.js';

export function team(panel) {
  panel.innerHTML = `<section class="people-exhibit"><header><span class="eyebrow">Cagayan State University</span><span class="tiny">Carig Campus</span></header>
  <ul class="people-list">${acts.map((act, i) => `<li style="--delay:${i * 60}ms"><span class="speaker-index">${String(i + 1).padStart(2, '0')}</span><div><strong>${act.speaker}</strong><span>${act.title}</span></div></li>`).join('')}</ul>
  <div class="people-meta"><span>BS Electronics Engineering</span><span>Suggested speaking parts</span></div></section>`;
}

export function problem(panel) {
  panel.innerHTML = `<figure class="national-exhibit"><div class="national-facts">
  <span class="eyebrow">Philippines · 2021</span><strong class="national-number">11,096</strong><p>road traffic deaths recorded nationally</p>
  <div class="death-chart" role="img" aria-label="Registered road traffic deaths, 7,938 in 2011 and 11,096 in 2021">
  <div><span>2011</span><i style="--length:71.54%"></i><b>7,938</b></div><div><span>2021</span><i style="--length:100%"></i><b>11,096</b></div></div>
  <p class="national-note">RAMS addresses the gap between a crash on the road and the first report reaching someone who can act.</p></div>
  <img src="public/philippines.svg" alt="Coastline map of the Philippines">
  <figcaption>Registered deaths · PSA figures reported by WHO Philippines and DOTr, May 2023. <a href="${whoPH}" target="_blank" rel="noopener">Source</a></figcaption></figure>`;
}

const names = {
  fall: 'Fall',
  impact: 'Impact',
  skidding: 'Skid',
  motorcycle_wind_flutter: 'Wind flutter',
  normal_vehicle_ride: 'Normal ride',
  phone_falling: 'Phone drop',
  phone_shaking: 'Phone shake',
  pothole: 'Pothole',
  running: 'Running',
  speed_bump: 'Speed bump',
  walking: 'Walking',
};
const sources = [
  ['SisFall', 'Falls and activities of daily living.', 'https://www.mdpi.com/1424-8220/17/1/198'],
  [
    'MobiFall / MobiAct',
    'Phone movements during falls and daily activities.',
    'https://bmi.hmu.gr/el/the-mobifall-and-mobiact-datasets/',
  ],
  [
    'UP-Fall',
    'Multimodal recordings of falls and ordinary movements.',
    'https://doi.org/10.3390/s19091988',
  ],
  ['Road anomalies', 'Potholes and speed bumps listed in the RAMS research catalog.', ''],
  [
    'UCI smartphone HAR',
    'Daily activities recorded with a waist-mounted phone.',
    'https://archive.ics.uci.edu/dataset/240/human+activity+recognition+using+smartphones',
  ],
  [
    'UMAFall',
    'Wearable and smartphone traces for fall research.',
    'https://doi.org/10.6084/m9.figshare.4214283',
  ],
];
function sparkline(values) {
  const max = 10,
    h = 32,
    w = 112;
  // All eleven traces share one g scale so their peaks remain comparable.
  const p = values
    .map((v, i) =>
      [
        ((i * w) / (values.length - 1)).toFixed(1),
        (h - 2 - (Math.min(max, v) * (h - 4)) / max).toFixed(1),
      ].join(','),
    )
    .join(' ');
  return `<svg viewBox="0 0 112 32" preserveAspectRatio="none" aria-hidden="true"><path d="M0 29h112" stroke="currentColor" opacity=".15"/><polyline points="${p}" fill="none" stroke="currentColor" stroke-width="1.7" vector-effect="non-scaling-stroke"/></svg>`;
}
export function datasets(panel) {
  const tabs = {
    fixtures: 'Packaged traces',
    references: 'Source catalog',
    capture: 'Field collection',
  };
  panel.innerHTML = `<section class="plate source-atlas"><div class="plate-head"><strong>Motion data atlas</strong><span class="tiny">Provenance</span></div><nav class="atlas-tabs" aria-label="Dataset provenance">${Object.entries(
    tabs,
  )
    .map(([k, v]) => '<button data-atlas="' + k + '">' + v + '</button>')
    .join('')}</nav><div class="atlas-content"></div></section>`;
  const body = panel.querySelector('.atlas-content');
  const families = __MOTION_FAMILIES__;
  function show(which) {
    panel
      .querySelectorAll('[data-atlas]')
      .forEach((b) => b.setAttribute('aria-pressed', b.dataset.atlas === which));
    if (which === 'fixtures') {
      const ordered = [...families].sort(
        (a, b) => Number(b.positive) - Number(a.positive) || names[a.name].localeCompare(names[b.name]),
      );
      body.innerHTML = `<div class="family-grid">${ordered.map((f) => `<button data-family="${f.name}" class="family ${f.positive ? 'positive' : ''}" title="Inspect ${names[f.name]}"><span>${names[f.name]}</span>${sparkline(f.samples)}</button>`).join('')}</div><div class="family-details" aria-live="polite"></div>`;
      function detail(name) {
        const f = families.find((v) => v.name === name);
        body
          .querySelectorAll('.family')
          .forEach((b) => b.setAttribute('aria-pressed', b.dataset.family === name));
        body.querySelector('.family-details').innerHTML =
          `<div><b>${names[name]}</b><span>${f.positive ? 'Accident-labeled' : 'Benign'} · ${f.count} files</span></div><div><b>${f.peak.toFixed(2)} g</b><span>Base peak</span></div><div><b>${f.tilt.toFixed(1)}°</b><span>Base tilt change</span></div>`;
      }
      body.querySelectorAll('[data-family]').forEach((b) => {
        b.onclick = () => detail(b.dataset.family);
      });
      detail('walking');
    } else if (which === 'references') {
      body.innerHTML = `<p class="atlas-caption">Research references named by the project. The packaged trial files are generated locally.</p><ul class="catalog-list">${sources.map(([name, desc, url]) => `<li><strong>${url ? '<a href="' + url + '" target="_blank" rel="noopener">' + name + '</a>' : name}</strong><span>${desc}</span></li>`).join('')}</ul>`;
    } else {
      body.innerHTML = `<ol class="capture-list"><li><b>Record a session</b><p>IMU Studio captures timestamped accelerometer and gyroscope samples on the phone.</p></li><li><b>Apply the label</b><p>Keep the activity, session ID and accident flag together so a whole trial can be held out.</p></li><li><b>Export and calibrate</b><p>Export raw rows or windowed features, then import labeled sessions into the calibration manager.</p></li><li><b>Evaluate separately</b><p>Freeze the settings and count missed events and false alarms on different sessions.</p></li></ol>`;
    }
  }
  panel.querySelectorAll('[data-atlas]').forEach((b) => {
    b.onclick = () => show(b.dataset.atlas);
  });
  show('fixtures');
}

const consequences = [
  {
    label: 'Road user',
    symbol: 'phone',
    title: 'A second way to raise an alert',
    text: 'A paired phone and wearable can originate an incident report. The rider can correct a false alarm if able.',
    measure: 'Missed alerts and false alarms per labeled trip.',
  },
  {
    label: 'Receiving station',
    symbol: 'radio',
    title: 'A report with a device identity',
    text: 'Within radio reach, the receiver can pass an event, available coordinates and peak acceleration to the Windows station.',
    measure: 'Delivered packets, valid fixes and event-to-station time.',
  },
  {
    label: 'Response team',
    symbol: 'desk',
    title: 'Information for a human decision',
    text: 'An operator can review the incident and available rider details before coordinating a response through the local workflow.',
    measure: 'Time to acknowledgement and completeness of the report.',
  },
];
export function impact(panel) {
  panel.innerHTML = `<section class="impact-exhibit"><header><span class="eyebrow">Intended impact</span><span class="tiny">From event to review</span></header><div class="impact-route">${consequences.map((c, i) => `<button data-person="${i}"><i>${icon(c.symbol)}</i><span>${c.label}</span></button>`).join('')}</div><div class="consequence" aria-live="polite"></div></section>`;
  function select(i) {
    const c = consequences[i];
    panel
      .querySelectorAll('[data-person]')
      .forEach((b) => b.setAttribute('aria-pressed', Number(b.dataset.person) === i));
    panel.querySelector('.consequence').innerHTML =
      `<h3>${c.title}</h3><p>${c.text}</p><div><span class="eyebrow">Field measure</span><strong>${c.measure}</strong></div>`;
  }
  panel.querySelectorAll('[data-person]').forEach((b) => {
    b.onclick = () => select(Number(b.dataset.person));
  });
  select(0);
}
