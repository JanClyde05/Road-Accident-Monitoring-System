import { build } from 'esbuild';
import { readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';
process.chdir(fileURLToPath(new URL('.', import.meta.url)));

// Keep the plotted arrays in sync with the exact fixture files used for the talk.
const motionDir = '../../../apps/android_app/app/src/main/assets/motion_benchmarks';
const traces = {};
const examples = {};
const motionFamilies = [];
const fixtures = await readdir(motionDir);
for (const file of fixtures.filter((name) => /^benchmark_[a-z_]+\.json$/.test(name)).sort()) {
  const stem = file.slice(0, -5);
  const trace = JSON.parse(await readFile(resolve(motionDir, file), 'utf8'));
  const variants = fixtures.filter(
    (name) => name === file || new RegExp('^' + stem + '_\\d+\\.json$').test(name),
  );
  motionFamilies.push({
    name: stem.replace('benchmark_', ''),
    positive: !!trace.is_accident,
    count: variants.length,
    peak: trace.features.max_svm_g,
    tilt: trace.features.tilt_delta_deg,
    samples: trace.raw_samples.map((row) => row.svm_g),
  });
}
for (const name of ['pothole', 'phone_falling', 'normal_vehicle_ride', 'impact', 'fall', 'skidding']) {
  const source = JSON.parse(await readFile(resolve(motionDir, 'benchmark_' + name + '.json'), 'utf8'));
  examples[name] = { accident: source.is_accident === 1, peak: source.features.max_svm_g };
}
for (const name of ['pothole', 'impact', 'walking', 'phone_falling', 'fall']) {
  const trace = JSON.parse(await readFile(resolve(motionDir, 'benchmark_' + name + '.json'), 'utf8'));
  traces[name] = {
    samples: trace.raw_samples.map((s) => [s.rel_time_ms, s.svm_g, s.pitch_deg, s.roll_deg]),
    peak: trace.features.max_svm_g,
    tilt: trace.features.tilt_delta_deg,
    speed: trace.metadata.pre_event_speed_kmh,
  };
}
await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2022',
  outfile: 'assets/presentation.js',
  legalComments: 'eof',
  define: {
    __TRACE_DATA__: JSON.stringify(traces),
    __EXAMPLE_DATA__: JSON.stringify(examples),
    __MOTION_FAMILIES__: JSON.stringify(motionFamilies),
  },
});
await copyFile('node_modules/three/LICENSE', 'assets/three-license.txt');
// Embedding the local font bytes also works under file:// with strict browser CORS.
const faces = [];
for (const [family, weight] of [
  ['Jakarta', '400 800'],
  ['Plex', '400'],
]) {
  const font = await readFile('public/fonts/' + family.toLowerCase() + '.woff2');
  faces.push(
    '@font-face{font-family:' +
      family +
      ';font-weight:' +
      weight +
      ';font-display:swap;src:url(data:font/woff2;base64,' +
      font.toString('base64') +
      ') format("woff2")}',
  );
}
await writeFile('assets/fonts.css', faces.join('\n'));
for (const name of ['prototype', 'custom-smd']) {
  const glb = await readFile('public/hardware/' + name + '.glb');
  const packed = gzipSync(glb, { level: 9 }).toString('base64');
  await writeFile(
    'assets/' + name + '.js',
    '(window.ramsBoards ||= {})[' + JSON.stringify(name) + '] = "' + packed + '";\n',
  );
}
console.log('Built the presentation and both offline CAD models.');
