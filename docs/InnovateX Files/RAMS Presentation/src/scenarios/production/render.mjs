// Rebuild the five native presentation clips from the Three.js production scene.
// Serve the presentation root on loopback first. See public/scenarios/sources.md.
import { createRequire } from 'node:module';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.RAMS_PLAYWRIGHT || 'playwright-core');
const ffmpeg = process.env.RAMS_FFMPEG || 'ffmpeg';
const here = dirname(fileURLToPath(import.meta.url));
const dest = resolve(here, '../../../public/scenarios');
const cuts = {
  pairing: [10, 0.12, 0.57, 0.84],
  motorcycle: [9, 0.22, 0.59, 0.84],
  car: [9, 0.24, 0.54, 0.83],
  pedestrian: [9, 0.24, 0.58, 0.83],
  fall: [9, 0.24, 0.56, 0.85],
};
const width = 960,
  height = 416,
  fps = 24;
const hash = createHash('sha256');
for (const f of ['render.mjs', 'film.js', 'subjects.js', 'street.js', 'assets/city.jpg', 'assets/miku-rigged.glb'])
  hash.update(await readFile(join(here, f)));
const cache = join(tmpdir(), 'rams-cinema-' + hash.digest('hex').slice(0, 12));
const browser = await chromium.launch({
  executablePath: process.env.RAMS_CHROME || undefined,
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--disable-gpu-watchdog'],
});
function encode(args) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    encoding: 'utf8',
  });
  if (result.status !== 0) throw Error(result.stderr || String(result.error));
}
try {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', (error) => console.error(error.message));
  await page.goto(
    (process.env.RAMS_STUDIO_ORIGIN || 'http://127.0.0.1:8765') +
      '/src/scenarios/production/studio.html?width=' +
      width +
      '&height=' +
      height,
  );
  await page.waitForFunction(() => window.ready || window.failure, null, { timeout: 120000 });
  const failure = await page.evaluate(() => window.failure);
  if (failure) throw Error(failure);
  for (const [id, [duration, ...posters]] of Object.entries(cuts)) {
    if (process.argv[2] && !process.argv.slice(2).includes(id)) continue;
    const frames = duration * fps,
      folder = join(cache, id);
    await mkdir(folder, { recursive: true });
    await mkdir(dest, { recursive: true });
    const file = (i) => join(folder, 'frame-' + String(i).padStart(4, '0') + '.jpg');
    for (let i = 0; i < frames; i++) {
      if (existsSync(file(i))) continue;
      const uri = await page.evaluate(([story, t]) => window.still(story, t), [id, i / (frames - 1)]);
      await writeFile(file(i), Buffer.from(uri.split(',')[1], 'base64'));
    }
    const temp = join(folder, id + '.mp4');
    encode([
      '-framerate',
      String(fps),
      '-i',
      join(folder, 'frame-%04d.jpg'),
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '19',
      '-pix_fmt',
      'yuv420p',
      '-g',
      String(fps),
      '-keyint_min',
      String(fps),
      '-movflags',
      '+faststart',
      temp,
    ]);
    await writeFile(join(dest, id + '.mp4.tmp'), await readFile(temp));
    await rename(join(dest, id + '.mp4.tmp'), join(dest, id + '.mp4'));
    posters.forEach((t, i) =>
      encode([
        '-i',
        file(Math.round(t * (frames - 1))),
        '-frames:v',
        '1',
        '-c:v',
        'libwebp',
        '-quality',
        '90',
        join(dest, id + '-' + i + '.webp'),
      ]),
    );
    console.log(id + ': ' + frames + ' frames, three matching stills');
  }
} finally {
  await browser.close();
}
