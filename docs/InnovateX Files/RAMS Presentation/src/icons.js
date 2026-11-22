// A compact, shared set of outline controls remains legible on a projector.
const shapes = {
  index:
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  full: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  exit: '<path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/>',
  play: '<path fill="currentColor" stroke="none" d="m6 3 15 9-15 9z"/>',
  book: '<path d="M3 4.5C6 4 9 4.5 12 6c3-1.5 6-2 9-1.5v14c-3-.6-6-.2-9 1.5-3-1.7-6-2.1-9-1.5zm9 1.5v14"/>',
  focus: '<path d="M3 9V4h5m8 0h5v5m0 6v5h-5m-8 0H3v-5"/><circle cx="12" cy="12" r="2"/>',
  orbit:
    '<ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(-28 12 12)"/><circle cx="12" cy="12" r="2"/><path d="m18 3 3 1-1 3"/>',
  scan: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M2 12h20"/>',
  rain: '<path d="M5 14a4 4 0 0 1 0-8 6 6 0 0 1 11.6-.5A4.5 4.5 0 0 1 19 14M7 16l-2 4m8-4-2 4m8-4-2 4"/>',
  pause: '<path stroke-width="3" d="M8 4v16m8-16v16"/>',
  left: '<path d="m14 5-7 7 7 7"/>',
  right: '<path d="m9 5 7 7-7 7"/>',
  close: '<path d="m5 5 14 14m0-14L5 19"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 5h4m-3 14h2"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
  radio:
    '<circle cx="12" cy="9" r="2"/><path d="m8 22 4-10 4 10m-9-8a7 7 0 0 1 0-10m10 0a7 7 0 0 1 0 10M4 17a11 11 0 0 1 0-16m16 0a11 11 0 0 1 0 16"/>',
  desk: '<rect x="2" y="3" width="20" height="14" rx="1"/><path d="M12 17v4m-5 0h10"/>',
  reset: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>',
  evidence: '<path d="M6 2h9l4 4v16H6zM14 2v5h5M9 12h7m-7 4h5"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
};
export function icon(name) {
  return (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (shapes[name] || '') +
    '</svg>'
  );
}
export function paintIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
}
