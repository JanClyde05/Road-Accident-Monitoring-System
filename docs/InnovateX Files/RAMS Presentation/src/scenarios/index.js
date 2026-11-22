import { createWorld } from './world.js';
import { icon } from '../icons.js';

const stories = {
  pairing: {
    label: 'Pairing',
    title: 'Before the trip',
    duration: 10,
    phases: [
      [0, 'Prepare', 'The wearer opens the Android companion with the wearable nearby.'],
      [0.31, 'Connect', 'The phone connects to the wearable over Bluetooth Low Energy.'],
      [0.69, 'Monitor', 'The phone supplies motion and location. The wearable provides the LoRa link.'],
    ],
  },
  motorcycle: {
    label: 'Motorcycle',
    title: 'Motorcycle slide',
    duration: 9,
    phases: [
      [0, 'Approach', 'A rider travels along the corridor with a paired phone and wearable.'],
      [
        0.48,
        'Loss of balance',
        'The motorcycle leans, falls and slides. The rider’s orientation changes with it.',
      ],
      [
        0.76,
        'After the slide',
        'The bike settles. A candidate event can be assessed from the phone’s motion and speed context.',
      ],
    ],
  },
  car: {
    label: 'Car',
    title: 'Junction collision',
    duration: 9,
    phases: [
      [0, 'Approach', 'Two vehicles enter the junction from different directions.'],
      [0.5, 'Contact', 'The vehicles meet at the junction and change course abruptly.'],
      [
        0.72,
        'After contact',
        'The cars slow to a stop. The person carrying the phone may be unable to make a call.',
      ],
    ],
  },
  pedestrian: {
    label: 'Pedestrian',
    title: 'Pedestrian crossing',
    duration: 9,
    phases: [
      [0, 'Approach', 'A pedestrian is crossing while a car approaches the marked lane.'],
      [0.5, 'Contact', 'The vehicle reaches the pedestrian, who loses balance.'],
      [
        0.74,
        'After the fall',
        'The pedestrian’s phone moves with them. The request for help depends on the sensed event and a working link.',
      ],
    ],
  },
};
const css = `
.story-film{--frame-line:#344a54;overflow:hidden}.story-tabs{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end}.story-tabs button,.story-player button{font:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#c4d4da;border:1px solid var(--frame-line);background:#101f28;border-radius:4px;min-height:32px;padding:4px 9px;font-size:12px}.story-tabs button[aria-pressed=true]{color:#95f0e4;background:#193d40;border-color:#547c7c}.story-tabs button:hover,.story-player button:hover{border-color:#78bbb6}.story-cinema{position:relative;isolation:isolate;width:100%;height:clamp(190px,32vh,395px);overflow:hidden;background:#0b171e}.story-cinema canvas,.story-cinema img{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.story-cinema img[hidden],.story-label[hidden]{display:none}.story-anchor,.story-tag{font:10px var(--mono,monospace);text-transform:uppercase;color:#cce4e7;letter-spacing:.055em;line-height:1.3}.story-tag{position:absolute;top:12px;left:14px;z-index:1;background:#0a151edb;padding:5px 8px;border-left:2px solid #81ded5}.story-label{position:absolute;z-index:1;pointer-events:none;transform:translate(1px,-100%);display:flex;align-items:flex-start;color:#9cf2e3}.story-label i{height:19px;width:20px;transform:skewX(-32deg);border-left:1px solid currentColor;border-top:1px solid currentColor;transform-origin:bottom}.story-label b{display:block;position:relative;top:-7px;margin-left:9px;padding:2px 5px;background:#12272bdd;color:#a6f5e8;font:9px var(--mono,monospace);text-transform:uppercase}.story-copy{padding:12px 18px 11px;border-top:1px solid var(--frame-line);min-height:80px}.story-copy h3{font-size:17px;margin:0 0 4px;letter-spacing:-.035em}.story-copy p{font-size:13px;line-height:1.45;color:#b1c4ce;margin:0}.story-player{display:flex;align-items:center;gap:9px;border-top:1px solid var(--frame-line);padding:8px 14px;color:#b5c6cf}.story-player button{min-width:33px;width:33px;min-height:32px;height:32px;padding:7px}.story-player svg{width:15px;height:15px}.story-player input{min-width:45px;flex:1;accent-color:#79e2d7;cursor:pointer}.story-player output{font:11px var(--mono,monospace);white-space:nowrap}.story-film .plate-head{padding:12px 16px}.story-film .plate-head strong{white-space:nowrap}.story-static{padding:0 14px 8px;color:#a2bac7;font:10px var(--mono,monospace)}
@media(max-width:780px){.story-cinema{height:clamp(195px,60vw,285px)}.story-film .plate-head{padding:10px 12px;gap:8px;flex-wrap:wrap}.story-tabs{gap:3px}.story-tabs button{min-height:32px;font-size:11px;padding:4px 7px}.story-copy{min-height:80px;padding:10px 13px}.story-player{padding:6px 10px}.story-tag{font-size:9px;top:9px;left:9px}}
@media(min-width:781px) and (max-height:760px){.story-cinema{height:clamp(175px,30vh,230px)}.story-copy{min-height:66px;padding:8px 15px}.story-film .plate-head{padding:9px 14px}}
`;
function ensureStyle() {
  if (document.getElementById('rams-scenario-style')) return;
  const style = document.createElement('style');
  style.id = 'rams-scenario-style';
  style.textContent = css;
  document.head.append(style);
}
export function scenarios(panel, { initial } = {}) {
  ensureStyle();
  const names =
    initial === 'pairing'
      ? ['pairing']
      : initial
        ? ['motorcycle', 'car', 'pedestrian']
        : Object.keys(stories);
  let id = names.includes(initial) ? initial : names[0],
    fraction = 0,
    playing = false,
    frameId = 0,
    previous = 0,
    world = null,
    phaseIndex = -1,
    closed = false;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  panel.innerHTML = `<div class="plate story-film"><div class="plate-head"><strong>${initial === 'pairing' ? 'Wearer setup' : 'Road scenarios'}</strong>${names.length > 1 ? '<div class="story-tabs" aria-label="Choose a scenario">' + names.map((name) => '<button data-story="' + name + '">' + stories[name].label + '</button>').join('') + '</div>' : '<span class="tiny">Bluetooth Low Energy</span>'}</div><div class="story-cinema" role="img"><img hidden alt=""><div class="story-tag"></div><div class="story-label" hidden><i></i><b></b></div></div><div class="story-copy"><h3></h3><p></p></div><div class="story-player"><button data-action="play" aria-label="Play scenario"></button><button data-action="restart" aria-label="Replay scenario" title="Replay scenario">${icon('reset')}</button><input aria-label="Scenario timeline" type="range" min="0" max="100" step="1" value="0"><output></output></div></div>`;
  const film = panel.querySelector('.story-film'),
    cinema = film.querySelector('.story-cinema'),
    image = cinema.querySelector('img'),
    label = film.querySelector('.story-label'),
    tag = film.querySelector('.story-tag'),
    playButton = film.querySelector('[data-action=play]'),
    range = film.querySelector('input'),
    time = film.querySelector('output');
  const buttons = film.querySelectorAll('[data-story]'),
    clock = (n) => '0:' + String(Math.floor(n)).padStart(2, '0');
  const setAnchor = (x, y, text) => {
    label.hidden = x === null;
    if (x !== null) {
      label.style.left = x * 100 + '%';
      label.style.top = y * 100 + '%';
      label.querySelector('b').textContent = text;
    }
  };
  try {
    world = createWorld(cinema, setAnchor);
  } catch {
    image.hidden = false;
    setAnchor(null);
  }
  function draw() {
    const { duration, phases } = stories[id];
    const i = phases.findLastIndex(([start]) => fraction + 1e-6 >= start);
    if (i !== phaseIndex) {
      phaseIndex = i;
      film.querySelector('.story-copy h3').textContent = phases[i][1];
      film.querySelector('.story-copy p').textContent = phases[i][2];
      cinema.setAttribute('aria-label', stories[id].title + '. ' + phases[i][2]);
      if (!world) image.src = 'public/scenarios/' + id + '-' + i + '.webp';
    }
    world?.frame(id, fraction);
    range.value = Math.round(fraction * 100);
    time.textContent = clock(fraction * duration) + ' / ' + clock(duration);
    range.setAttribute('aria-valuetext', phases[i][1] + ', ' + clock(duration * fraction));
  }
  function playback(value) {
    playing = value;
    cancelAnimationFrame(frameId);
    previous = 0;
    playButton.innerHTML = icon(value ? 'pause' : fraction >= 1 ? 'reset' : 'play');
    playButton.setAttribute(
      'aria-label',
      value ? 'Pause scenario' : fraction >= 1 ? 'Replay scenario from start' : 'Play scenario',
    );
    playButton.title = playButton.getAttribute('aria-label');
    if (value) frameId = requestAnimationFrame(tick);
  }
  function tick(now) {
    if (closed || !playing) return;
    if (document.hidden || document.querySelector('dialog[open]')) {
      previous = 0;
      frameId = requestAnimationFrame(tick);
      return;
    }
    if (previous)
      fraction = Math.min(1, fraction + Math.min(0.1, (now - previous) / 1000) / stories[id].duration);
    previous = now;
    draw();
    if (fraction >= 1) playback(false);
    else frameId = requestAnimationFrame(tick);
  }
  function select(name) {
    id = name;
    fraction = 0;
    phaseIndex = -1;
    buttons.forEach((button) => button.setAttribute('aria-pressed', button.dataset.story === id));
    tag.textContent = world ? 'Illustrative sequence' : 'Illustrated storyboard';
    draw();
    playback(!reduce.matches && !!world);
  }
  function toggle() {
    if (fraction >= 1) fraction = 0;
    playback(!playing);
    draw();
  }
  playButton.onclick = toggle;
  film.querySelector('[data-action=restart]').onclick = () => {
    fraction = 0;
    draw();
    playback(true);
  };
  buttons.forEach((button) => {
    button.onclick = () => select(button.dataset.story);
  });
  range.oninput = () => {
    fraction = Number(range.value) / 100;
    playback(false);
    draw();
  };
  function onPreference(e) {
    if (e.matches) playback(false);
  }
  reduce.addEventListener('change', onPreference);
  select(id);
  return () => {
    closed = true;
    cancelAnimationFrame(frameId);
    reduce.removeEventListener('change', onPreference);
    world?.dispose();
  };
}
