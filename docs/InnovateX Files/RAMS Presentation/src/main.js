import { acts, program, clock, fullProgram } from './program.js';
import presenterCues from './presenter-cues.json';
import { createRoadScene } from './scene.js';
import { icon, paintIcons } from './icons.js';
import { detection, calibration, hardware, relay, validation } from './exhibits.js';
import { team, problem, impact, datasets } from './story.js';
import { scenarios } from './scenarios/index.js';
import { mobile, desktop, assistant } from './app-exhibits/index.js';

const $ = (id) => document.getElementById(id);
const stage = document.querySelector('.stage');
const panel = $('exhibit-panel');
const dialog = $('drawer');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let current = -1,
  road,
  cleanup,
  rain = false,
  paused = reduced.matches,
  opener;
let compact = new URL(location.href).searchParams.get('program') === 'finals';
let chapters = program(compact);
const exhibits = {
  team,
  problem,
  impact,
  datasets,
  detection,
  calibration,
  hardware,
  relay,
  validation,
  mobile,
  desktop,
  assistant,
  pairing: (panel) => scenarios(panel, { initial: 'pairing' }),
  scenarios: (panel) => scenarios(panel, { initial: 'motorcycle' }),
};
const hasTerrain = () => ['overview', 'relay'].includes(chapters[current]?.id);
const title = $('chapter-title');
const overviewTitle = title.innerHTML,
  overviewSummary = $('summary').textContent;
const count = (i) => String(i + 1).padStart(2, '0');
paintIcons();

function chapterButton(chapter, i, full = false) {
  const button = document.createElement('button');
  button.className = full ? 'index-row' : 'chapter-link';
  button.innerHTML = full
    ? '<small>' + count(i) + '</small>' + chapter.title + icon('right')
    : '<span class="num">' + count(i) + '</span><span>' + chapter.title + '</span>';
  button.setAttribute('aria-label', 'Chapter ' + (i + 1) + ', ' + chapter.title);
  button.onclick = () => {
    if (dialog.open) dialog.close();
    go(i);
  };
  return button;
}
function drawRail() {
  $('program').value = compact ? 'finals' : 'full';
  $('total').textContent = '/ ' + String(chapters.length).padStart(2, '0');
  $('chapter-nav').replaceChildren(
    ...acts.map((act, idx) => {
      const first = chapters.findIndex((c) => c.actIndex === idx);
      const button = chapterButton({ title: act.title }, first);
      button.setAttribute('aria-label', 'Section ' + (idx + 1) + ', ' + act.title);
      button.querySelector('.num').textContent = count(idx);
      return button;
    }),
  );
}
drawRail();

function moveMarker(x, y) {
  const terrain = $('road'),
    tag = $('beacon');
  tag.style.left = terrain.offsetLeft + x * terrain.offsetWidth + 'px';
  tag.style.top = terrain.offsetTop + y * terrain.offsetHeight + 'px';
  tag.classList.add('visible');
}
function sceneControls() {
  $('rain').setAttribute('aria-pressed', rain);
  $('motion').innerHTML = icon(paused ? 'play' : 'pause');
  $('motion').setAttribute('aria-label', paused ? 'Resume scene motion' : 'Pause scene motion');
  $('motion').title = $('motion').getAttribute('aria-label');
  $('motion').setAttribute('aria-pressed', paused);
}
function initTerrain() {
  if (road || $('road').dataset.static) return;
  try {
    road = createRoadScene($('road'), { onMarker: moveMarker });
    $('road').classList.add('has-gl');
    road.setPaused(paused);
  } catch {
    $('road').dataset.static = 'true';
    $('road').querySelector('canvas')?.remove();
    document.querySelector('.scene-tools').hidden = true;
    document.querySelector('.orbit-hint').textContent = 'Terrain illustration';
  }
}
function render(i) {
  if (i === current) return;
  cleanup?.();
  cleanup = null;
  const c = chapters[i],
    first = i === 0,
    route = c.id === 'relay';
  current = i;
  stage.dataset.chapter = c.id;
  stage.classList.toggle('detail', !first);
  stage.classList.toggle('relay-stage', route);
  $('road').hidden = !first && !route;
  $('road-ui').hidden = !first;
  panel.hidden = first;
  panel.replaceChildren();
  $('category').textContent = 'INNOVATEX 2026';
  $('sub-category').textContent = first ? 'SYSTEM OVERVIEW' : c.title.toUpperCase();
  if (first) title.innerHTML = overviewTitle;
  else title.textContent = c.headline;
  $('summary').textContent = first ? overviewSummary : c.summary;
  $('primary').innerHTML = first
    ? icon('play') + 'Begin presentation'
    : i === chapters.length - 1
      ? icon('reset') + 'Return to overview'
      : 'Next chapter ' + icon('right');
  $('primary').classList.toggle('advance', !first);
  $('notes').querySelector('span').textContent = 'Field notes';
  $('current').textContent = count(i);
  $('chapter-name').textContent = c.title;
  $('back').disabled = first;
  $('next').disabled = i === chapters.length - 1;
  [...$('chapter-nav').children].forEach((btn, k) => {
    if (k === c.actIndex) btn.setAttribute('aria-current', 'step');
    else btn.removeAttribute('aria-current');
  });
  if (first || route) initTerrain();
  road?.setPaused(paused || (!first && !route));
  if (first || route) road?.setStage(route ? 4 : 0);
  if (!first) {
    cleanup = exhibits[c.id](panel, road);
  }
  const intro = document.querySelector('.intro');
  intro.classList.remove('enter');
  panel.classList.remove('enter');
  void intro.offsetWidth;
  intro.classList.add('enter');
  panel.classList.add('enter');
  document.title = c.title + ' · RAMS - Road Accident Monitoring System';
  $('announcement').textContent = 'Chapter ' + (i + 1) + ' of ' + chapters.length + '. ' + c.title;
}
function fromHash() {
  const nextCompact = new URL(location.href).searchParams.get('program') === 'finals';
  if (nextCompact !== compact) {
    compact = nextCompact;
    chapters = program(compact);
    current = -1;
    drawRail();
  }
  const i = chapters.findIndex((c) => c.id === location.hash.slice(1));
  render(i < 0 ? 0 : i);
}
$('program').onchange = () => {
  const selectedId = chapters[current].id;
  const wantCompact = $('program').value === 'finals';
  const available = program(wantCompact);
  let target = available.find((c) => c.id === selectedId);
  if (!target) {
    const previousIds = fullProgram
      .slice(
        0,
        fullProgram.findIndex((c) => c.id === selectedId),
      )
      .map((c) => c.id);
    target = available.filter((c) => previousIds.includes(c.id)).at(-1) || available[0];
  }
  const url = new URL(location.href);
  if (wantCompact) url.searchParams.set('program', 'finals');
  else url.searchParams.delete('program');
  url.hash = target.id;
  history.pushState(null, '', url);
  fromHash();
};
function go(i) {
  if (i < 0 || i >= chapters.length) return;
  if (location.hash !== '#' + chapters[i].id) location.hash = chapters[i].id;
  render(i);
  if (matchMedia('(max-width:720px)').matches && window.scrollY > 0)
    window.scrollTo({ top: 0, behavior: 'instant' });
}
function scriptLines(cues) {
  return cues.map(([action, line]) => {
    const entry = document.createElement('p');
    const direction = document.createElement('strong');
    direction.textContent = action;
    entry.append(direction, document.createElement('br'), line);
    return entry;
  });
}

function openDialog(kind) {
  if (dialog.open) return;
  opener = document.activeElement;
  const c = chapters[current],
    body = $('drawer-body');
  $('drawer-label').textContent =
    kind === 'index'
      ? 'INNOVATEX 2026'
      : 'CHAPTER ' + count(current) + ' / ' + String(chapters.length).padStart(2, '0');
  $('drawer-title').textContent = kind === 'index' ? 'Chapter index' : c.title + ' field notes';
  body.replaceChildren();
  if (kind === 'index') {
    acts.forEach((act, k) => {
      const heading = document.createElement('h3');
      heading.className = 'index-part';
      heading.textContent = act.title + ' · ' + act.speaker;
      body.append(heading);
      chapters.forEach((chapter, i) => {
        if (chapter.actIndex === k) body.append(chapterButton(chapter, i, true));
      });
    });
  } else {
    const timing = document.createElement('p');
    timing.textContent =
      acts[c.actIndex].speaker +
      ' · Suggested timing ' +
      c.timing +
      ' of ' +
      clock(chapters.reduce((s, v) => s + v.duration, 0));
    body.append(timing);
    const cues = presenterCues.chapters[c.id];
    const script = document.createElement('details');
    script.className = 'presenter-script';
    const scriptTitle = document.createElement('summary');
    scriptTitle.textContent = 'Presenter script';
    script.append(scriptTitle, ...scriptLines(compact ? cues.finals : cues.full));
    if (cues.more.length && !compact) {
      const extra = document.createElement('details');
      const label = document.createElement('summary');
      label.textContent = 'Other controls and questions';
      extra.append(label, ...scriptLines(cues.more));
      script.append(extra);
    }
    const resources = document.createElement('p');
    for (const [extension, label] of [['pdf', 'Print script (PDF)'], ['docx', 'Edit script (Word)']]) {
      const link = document.createElement('a');
      link.href = 'public/presenters/RAMS Presenter Script.' + extension;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = label;
      if (resources.childNodes.length) resources.append(' · ');
      resources.append(link);
    }
    script.append(resources);
    body.append(script);
    if (current === chapters.findIndex((chapter) => chapter.actIndex === c.actIndex)) {
      const cue = document.createElement('p');
      cue.textContent = acts[c.actIndex].cue;
      body.append(cue);
    }
    c.notes.forEach((note) => {
      const heading = document.createElement('h3'),
        p = document.createElement('p');
      heading.textContent = note.title;
      p.textContent = note.text;
      body.append(heading, p);
    });
    const refs = document.createElement('details'),
      summary = document.createElement('summary');
    summary.textContent = 'Inspect source records (' + c.sources.length + ')';
    refs.append(summary);
    const list = document.createElement('ul');
    list.className = 'source-list';
    for (const source of c.sources) {
      const li = document.createElement('li'),
        code = document.createElement('code');
      const prefix = 'docs/InnovateX Files/RAMS Presentation/';
      const repoCopy =
        location.protocol === 'file:' && decodeURIComponent(location.pathname).includes('/' + prefix);
      const href = /^https:\/\//.test(source.path)
        ? source.path
        : source.path.startsWith(prefix)
          ? source.path.slice(prefix.length)
          : repoCopy
            ? '../../../' + source.path
            : '';
      if (href) {
        const link = document.createElement('a');
        link.textContent = source.label;
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener';
        li.append(link);
      } else li.append(source.label);
      code.textContent = source.displayPath || source.path;
      li.append(code);
      list.append(li);
    }
    refs.append(list);
    body.append(refs);
  }
  dialog.showModal();
  road?.setPaused(true);
  $('close').focus();
}
dialog.addEventListener('close', () => {
  road?.setPaused(paused || !hasTerrain());
  if (opener?.isConnected) opener.focus({ preventScroll: true });
});
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
      dialog.close();
  }
});
$('open-index').onclick = () => openDialog('index');
$('notes').onclick = () => openDialog('notes');
$('close').onclick = () => dialog.close();
$('back').onclick = () => go(current - 1);
$('next').onclick = () => go(current + 1);
$('primary').onclick = () => go((current + 1) % chapters.length);
$('scan').onclick = () => road?.scan();
$('rain').onclick = () => {
  rain = !rain;
  road?.setRain(rain);
  sceneControls();
};
$('motion').onclick = () => {
  paused = !paused;
  road?.setPaused(paused);
  sceneControls();
};
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    $('announcement').textContent = 'Fullscreen is unavailable in this browser panel.';
  }
}
if (!document.fullscreenEnabled) $('full').hidden = true;
$('full').onclick = fullscreen;
document.addEventListener('fullscreenchange', () => {
  const active = !!document.fullscreenElement;
  $('full').innerHTML = icon(active ? 'exit' : 'full');
  $('full').setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
  $('full').title = $('full').getAttribute('aria-label') + ' (F)';
});
document.addEventListener('keydown', (e) => {
  if (
    e.defaultPrevented ||
    e.altKey ||
    e.ctrlKey ||
    e.metaKey ||
    document.querySelector('dialog[open]') ||
    e.target.matches('input,textarea,select,[contenteditable=true]')
  )
    return;
  const k = e.key;
  if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.target.closest('button,a'))) {
    e.preventDefault();
    go(current + 1);
  } else if (k === 'ArrowLeft' || k === 'PageUp') {
    e.preventDefault();
    go(current - 1);
  } else if (k === 'Home') {
    e.preventDefault();
    go(0);
  } else if (k === 'End') {
    e.preventDefault();
    go(chapters.length - 1);
  } else if (k.toLowerCase() === 'f' && document.fullscreenEnabled) fullscreen();
  else if (k.toLowerCase() === 'n') openDialog('notes');
  else if (k.toLowerCase() === 'i') openDialog('index');
});
window.addEventListener('hashchange', fromHash);
window.addEventListener('popstate', fromHash);
document.querySelector('.skip').addEventListener('click', (event) => {
  event.preventDefault();
  title.focus();
});
reduced.addEventListener('change', (e) => {
  paused = e.matches;
  road?.setPaused(paused || dialog.open || !hasTerrain());
  sceneControls();
});
sceneControls();
fromHash();
