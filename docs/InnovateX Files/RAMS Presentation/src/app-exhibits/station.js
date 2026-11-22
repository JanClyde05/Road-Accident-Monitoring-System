import people from './station-fixtures.json' with { type: 'json' };

// Pin centers in the fixed crop of the shipping dashboard's Leaflet map.
const pinPosition = { lina: [18.8, 27.8], ivo: [69.33, 65.63], mara: [81.07, 39.58] };
const sections = { map: 'Incident map', people: 'Registered profiles', diagnostics: 'Diagnostics' };
const date = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function station(panel, showDiagnostics) {
  panel.innerHTML = `<section class="plate station-exhibit">
    <div class="plate-head"><strong>Windows console</strong><span class="tiny">Fictional demo records</span></div>
    <div class="app-tabs station-tabs" aria-label="Windows console views"></div>
    <div class="station-body"></div></section>`;
  const nav = panel.querySelector('.station-tabs');
  const body = panel.querySelector('.station-body');
  let selected;
  let cleanup;

  function navigate(view, focus = false) {
    cleanup?.();
    cleanup = null;
    const section = view === 'profile' || view === 'history' ? 'people' : view;
    for (const button of nav.children)
      button.setAttribute('aria-pressed', button.dataset.station === section);
    body.replaceChildren();
    if (view === 'map') renderMap();
    else if (view === 'people') renderRegister();
    else if (view === 'diagnostics') cleanup = showDiagnostics(body);
    else renderPerson(view);
    if (focus) body.querySelector('[tabindex="-1"]')?.focus({ preventScroll: true });
  }
  for (const [key, label] of Object.entries(sections)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.station = key;
    button.textContent = label;
    button.onclick = () => navigate(key);
    nav.append(button);
  }

  function renderMap() {
    body.innerHTML = `<div class="station-map">
      <img src="public/apps/station-map.webp" alt="Windows station map of Carig, Tuguegarao City, with red, amber and green device pins">
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a>
    </div><div class="station-brief"><div aria-live="polite"><strong></strong><p></p></div>
      <button class="small-button" data-station="profile">Open rider profile</button></div>`;
    const map = body.querySelector('.station-map');
    function select(person) {
      selected = person;
      for (const pin of map.querySelectorAll('button'))
        pin.setAttribute('aria-pressed', person.id === pin.dataset.pin);
      body.querySelector('.station-brief strong').textContent = person.name + ' · ' + person.status;
      body.querySelector('.station-brief p').textContent = person.location + ' · ' + person.token;
      body.querySelector('[data-station="profile"]').disabled = false;
    }
    for (const person of people) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.pin = person.id;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', person.name + ' pin, ' + person.status);
      button.title = person.name + ' · ' + person.status;
      const [x, y] = pinPosition[person.id];
      button.style.left = x + '%';
      button.style.top = y + '%';
      button.onclick = () => select(person);
      map.append(button);
    }
    body.querySelector('[data-station="profile"]').onclick = () => navigate('profile', true);
    if (selected) select(selected);
    else {
      body.querySelector('.station-brief strong').textContent = 'Three registered wearables';
      body.querySelector('.station-brief p').textContent = 'Select a pin to inspect its report.';
      body.querySelector('[data-station="profile"]').disabled = true;
    }
  }

  function renderRegister() {
    body.innerHTML =
      '<div class="station-register"><h3 tabindex="-1">Registered wearable units</h3><div class="station-roster"></div></div>';
    const list = body.querySelector('.station-roster');
    for (const person of people) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.person = person.id;
      button.style.setProperty('--signal', person.color);
      button.innerHTML = `<span><strong>${person.name}</strong><small>${person.token} · ${person.vehicle}</small></span><span class="station-state">${person.status}</span>`;
      button.onclick = () => {
        selected = person;
        navigate('profile', true);
      };
      list.append(button);
    }
  }

  function renderPerson(view) {
    const history = view === 'history';
    const person = selected;
    const alt = history
      ? person.events
          .map((e) => date.format(new Date(e.time)) + ', ' + e.title + ', ' + e.g.toFixed(2) + ' g')
          .join('. ')
      : person.name + ', ' + person.role + ', ' + person.vehicle + ', ' + person.status;
    body.innerHTML = `<div class="station-record"><div class="station-record-head"><h3 tabindex="-1">${person.name}</h3><span>${person.token}</span></div>
      <div class="station-record-art ${history ? 'history' : ''}"><img src="public/apps/station-${person.id}-${view}.webp" alt="${alt}"></div>
      <div class="station-brief"><div><strong>${history ? person.events.length + ' events · newest first' : 'Registered rider'}</strong>
      <p>${history ? 'Recorded time · Philippine Standard Time' : person.vehicle + ' · ' + person.location}</p></div>
      <button class="small-button" data-station="${history ? 'profile' : 'history'}">${history ? 'Rider profile' : 'Incident history'}</button></div></div>`;
    body.querySelector('.station-brief button').onclick = () =>
      navigate(history ? 'profile' : 'history', true);
  }
  navigate('map');
  return () => cleanup?.();
}
