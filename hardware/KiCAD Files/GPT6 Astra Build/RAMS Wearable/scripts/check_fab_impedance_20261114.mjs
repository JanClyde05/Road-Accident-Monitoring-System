// Query JLC's public calculator for generic cross-sections, never upload CAD.
// Node 24 built-ins only. Read-only toward active CAD; records its own evidence.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'reports/fab_impedance_20261114');
mkdirSync(out, { recursive: true });
const sha = data => createHash('sha256').update(data).digest('hex');
const api = 'https://jlcpcb.com/api/jlcTools/impedance/';
async function post(endpoint, body) {
  const r = await fetch(api + endpoint, { method: 'POST',
    headers: { 'Content-Type': 'application/json', langType: 'en' }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw Error(`${endpoint}: HTTP ${r.status}`);
  return r.json();
}
const [pictures, templates, coverlay, copper] = await Promise.all([
  post('selectPageImpedancePicture', { layerNumber: 1, pageNum: 1, pageSize: 999, usePurpose: 1 }),
  post('selectPageImpedanceDefaultTemplate', { pageNum: 1, pageSize: 99999,
    plateLayerNumber: 4, plateThickness: 1.6, cuprumThickness: 1,
    innerCopperThickness: .5, boardType: 1, usePurpose: 1 }),
  post('impedance-config/coverlay/list', {}),
  post('impedance-config/copper-trace-width/list', {}),
]);
if (pictures.result !== 'success' || templates.result !== 'success'
  || coverlay.code !== 200 || copper.code !== 200) throw Error('JLC metadata unavailable');
const stack = templates.body.list.find(t => t.appointName === 'JLC04161H-3313');
if (!stack) throw Error('Selected stackup absent');
const coating = coverlay.data.find(v => v.layerType === 1 && v.systemCopperThickness === 1 && v.baseCopperThickness === .5);
const trace = copper.data.find(v => v.layerType === 1 && v.systemCopperThickness === 1 && v.baseCopperThickness === .5);
if (!coating || !trace) throw Error('Selected process data absent');
const prepreg = stack.basicDataList.find(v => v.material === 'Prepreg');
const report = {
  date: '2026-11-14', retrieved_utc: new Date().toISOString(),
  method: 'JLCPCB public calculator API and WebSocket, generic dimensions only; no CAD uploaded',
  board_sha256: sha(readFileSync(resolve(root, 'RAMS_JLC_S3.kicad_pcb'))),
  script_sha256: sha(readFileSync(fileURLToPath(import.meta.url))),
  stackup: { name: stack.appointName, display_name: stack.receptionDisplayName,
    layers: stack.basicDataList.map(v => Object.fromEntries(['material','materialName','layerName',
      'dielectricThick','dielectricConstant','topConductorThick','botConductorThick','brandType','supplierType']
      .map(k => [k, v[k]]))) },
  process_config: { coating, trace }, cases: [],
};
const sensitivityOnly = process.argv.includes('--sensitivity');
const save = () => writeFileSync(resolve(out, sensitivityOnly ? 'jlc_calculator_sensitivity.json' : 'jlc_calculator_results.json'), JSON.stringify(report, null, 2) + '\n');
save();
const uuid = randomUUID();
const ws = new WebSocket('wss://tools.jlc.com/jlcTools/webSocket/' + uuid);
const pending = new Map();
ws.addEventListener('message', e => {
  const result = JSON.parse(e.data);
  const waiter = pending.get(result.accessId);
  if (waiter) { clearTimeout(waiter.timer); pending.delete(result.accessId); waiter.resolve(result); }
});
await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(Error('WebSocket open timeout')), 30000);
  ws.addEventListener('open', () => { clearTimeout(timeout); resolve(); }, { once: true });
  ws.addEventListener('error', () => { clearTimeout(timeout); reject(Error('WebSocket error')); }, { once: true });
});
async function calc(name, model, width, pairGap, groundGap, overrides = {}) {
  const picture = pictures.body.list.find(p => p.impedanceType === model);
  if (!picture) throw Error('Unknown model: ' + model);
  const a = Object.fromEntries(picture.parameterList.map(p => [p.paramName, Number(p.defaultValue) || 0]));
  Object.assign(a, { H1: prepreg.dielectricThick / .0254, Er1: prepreg.dielectricConstant,
    W1: width / .0254, W2: Number((width / .0254 - trace.traceWidthDelta).toFixed(2)),
    T1: trace.traceCopperThickness, C1: coating.coatingAboveSubstrate,
    C2: coating.coatingAboveTrace, C3: coating.coatingBetweenTraces, CEr: 3.8,
    dCalculateMode: 3, isLinkComputingMode: false, W2LinkW1Incr: trace.traceWidthDelta, ZoTol: .5 });
  if (pairGap !== null) a.S1 = pairGap / .0254;
  if (groundGap !== null) a.D1 = groundGap / .0254;
  Object.assign(a, overrides);
  const accessId = randomUUID();
  const response = new Promise((resolve, reject) => {
    pending.set(accessId, { resolve, timer: setTimeout(() => { pending.delete(accessId); reject(Error(name + ': result timeout')); }, 55000) });
  });
  const request = { accessId, impedance_calc_mark: model,
    paramMd5: createHash('md5').update(JSON.stringify(a)).digest('hex'), impedance_calc_arg: a, uuid };
  const ack = await post('calc', request);
  if (ack.result !== 'success') throw Error(JSON.stringify(ack));
  const result = await response;
  const row = { name, model, width_mm: width, pair_gap_mm: pairGap, ground_gap_mm: groundGap,
    request, acknowledgement: ack, response: result };
  report.cases.push(row); save();
  if (result.impedance_calc_status !== 0 || !result.impedance_calc_result?.dResultValid) throw Error(JSON.stringify(result));
  console.log(name, result.impedance_calc_result.dImpedance.toFixed(4), 'ohm');
}
const rf = 'CoatedCoplanarWaveguideWithLowerGnd1B';
const se = 'CoatedMicrostrip1B';
const dp = 'DiffCoatedCoplanarWaveguideWithLowerGnd1B';
const differential = pictures.body.list.find(p => p.pictureName === 'Differential Pair (Non coplanar)').impedanceType;
try {
  if (sensitivityOnly) {
    await calc('RF_W0.15_older_guide_mask_and_trapezoid', rf, .15, null, .15,
      { W2: .15/.0254-.7, C1:1.2,C3:1.2,W2LinkW1Incr:.7 });
    await calc('USB_W0.15_S0.15_G0.15_older_guide_mask_and_trapezoid', dp, .15, .15, .15,
      { W2: .15/.0254-.7, C1:1.2,C3:1.2,W2LinkW1Incr:.7 });
    for (const factor of [.9,1.1]) await calc(`RF_W0.15_Hx${factor}`,rf,.15,null,.15,{H1:prepreg.dielectricThick/.0254*factor});
    for (const er of [3.9,4.3]) {
      await calc(`RF_W0.15_Er${er}`,rf,.15,null,.15,{Er1:er});
      await calc(`USB_W0.15_S0.15_G0.15_Er${er}`,dp,.15,.15,.15,{Er1:er});
    }
  } else {
  for (const w of [.18,.17,.165,.16,.155,.15]) await calc(`RF_W${w}_G0.15`, rf, w, null, .15);
  for (const w of [.18,.16,.15]) await calc(`SE_W${w}_no_coplanar`, se, w, null, null);
  for (const g of [.15,.20,.25,.30,.50]) await calc(`USB_W0.15_S0.15_G${g}`, dp, .15, .15, g);
  await calc('USB_W0.15_S0.15_no_coplanar', differential, .15, .15, null);
  await calc('RF_W0.18_older_guide_mask_and_trapezoid', rf, .18, null, .15,
    { W2: .18/.0254-.7, C1:1.2,C3:1.2,W2LinkW1Incr:.7 });
  for (const factor of [.9,1.1]) {
    await calc(`RF_W0.16_Hx${factor}`,rf,.16,null,.15,{H1:prepreg.dielectricThick/.0254*factor});
    await calc(`USB_W0.15_S0.15_G0.15_Hx${factor}`,dp,.15,.15,.15,{H1:prepreg.dielectricThick/.0254*factor});
  }
  }
} finally { ws.close(); }
// Some server connections do not acknowledge close; all results are saved above.
setTimeout(() => process.exit(0), 1000);
