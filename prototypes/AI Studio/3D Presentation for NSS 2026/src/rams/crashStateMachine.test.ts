import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBatteryDividerVoltage,
  calculateLoRaAirtimeSeconds,
  evaluateCrashStateMachine,
  evaluateEdgeAiRisk,
  generateCrashTrace,
  generatePotholeTrace,
  getBeatFromProgress,
  RAMS_CANCEL_WINDOW_SECONDS,
} from './crashStateMachine';
import {
  DEFAULT_PRESENTERS,
  normalizePresenters,
  UI_CAPTURE_SLOTS,
} from './presenterStore';

test('safety veto countdown window matches RamsViewModel 10-second constant', () => {
  assert.equal(RAMS_CANCEL_WINDOW_SECONDS, 10);
});

test('crash trace traverses Freefall -> Impact -> Rest -> LATCHED with smartphone 50 Hz IMU', () => {
  const trace = generateCrashTrace(160);
  const res = evaluateCrashStateMachine(trace);

  assert.equal(res.finalStage, 'LATCHED');
  assert.ok(res.peakG >= 5.5, `Expected peakG >= 5.5, got ${res.peakG}`);
  assert.equal(res.suppressedReason, null);
  assert.ok(res.detectionLatencyMs !== null && res.detectionLatencyMs >= 1500);
});

test('pothole spike reaches >4g yet gets SUPPRESSED because rider GPS speed continues', () => {
  const trace = generatePotholeTrace(160);
  const res = evaluateCrashStateMachine(trace);

  assert.equal(res.finalStage, 'SUPPRESSED');
  assert.ok(res.peakG >= 3.8, `Expected pothole peakG >= 3.8, got ${res.peakG}`);
  assert.ok(res.suppressedReason && res.suppressedReason.length > 0);
});

test('RAMS Edge AI risk scorer assigns >90% to true crash and <15% to pothole spike', () => {
  const crashTrace = generateCrashTrace(160);
  const crashFsm = evaluateCrashStateMachine(crashTrace);
  const crashAi = evaluateEdgeAiRisk(crashTrace, crashFsm);
  assert.equal(crashAi.classification, 'CRITICAL_CRASH_LATCHED');
  assert.ok(crashAi.riskPercent >= 90, `Expected crash risk >= 90%, got ${crashAi.riskPercent}`);

  const potholeTrace = generatePotholeTrace(160);
  const potholeFsm = evaluateCrashStateMachine(potholeTrace);
  const potholeAi = evaluateEdgeAiRisk(potholeTrace, potholeFsm);
  assert.equal(potholeAi.classification, 'ROAD_ANOMALY_SUPPRESSED');
  assert.ok(potholeAi.riskPercent <= 15, `Expected pothole risk <= 15%, got ${potholeAi.riskPercent}`);
});

test('SX1278 LoRa SF9 airtime aligns with 26-byte alert (~0.21s) and 233-byte profile (~1.15s)', () => {
  const alertAir = calculateLoRaAirtimeSeconds(26, 9, 125000, 1, 8, true, true);
  const profileAir = calculateLoRaAirtimeSeconds(233, 9, 125000, 1, 8, true, true);

  assert.ok(alertAir > 0.18 && alertAir < 0.25, `Alert airtime ${alertAir}s out of range`);
  assert.ok(profileAir > 1.05 && profileAir < 1.25, `Profile airtime ${profileAir}s out of range`);
});

test('battery voltage divider outputs 2:1 for THT prototype and 4:1 for GPT6 Astra SMD', () => {
  const tht = calculateBatteryDividerVoltage(4.2, 'tht');
  assert.equal(tht.ratio, 2);
  assert.equal(tht.vAdcVolts, 2.1);

  const smd = calculateBatteryDividerVoltage(4.2, 'smd');
  assert.equal(smd.ratio, 4);
  assert.equal(smd.vAdcVolts, 1.05);
});

test('scroll progress beat interpolation clamps cleanly across all 8 beats', () => {
  const start = getBeatFromProgress(-0.2, 8);
  assert.equal(start.beatIndex, 0);
  assert.equal(start.localT, 0);

  const mid = getBeatFromProgress(0.5, 8);
  assert.equal(mid.beatIndex, 3);
  assert.equal(mid.nextBeatIndex, 4);
  assert.ok(mid.localT > 0.45 && mid.localT < 0.55);

  const end = getBeatFromProgress(1.4, 8);
  assert.equal(end.beatIndex, 7);
  assert.equal(end.nextBeatIndex, 7);
});

test('presenter roster enforces 5 presenter placeholders and safe fallback normalization', () => {
  assert.equal(DEFAULT_PRESENTERS.length, 5);
  const normalized = normalizePresenters([{ name: '  Jan Clyde  ' }, { name: '' }]);
  assert.equal(normalized.length, 5);
  assert.equal(normalized[0].name, 'Jan Clyde');
  assert.equal(normalized[1].name, DEFAULT_PRESENTERS[1].name);
});

test('UI capture slots define Rider Telemetry and 3 Command Center tabs', () => {
  const riderSlots = UI_CAPTURE_SLOTS.filter((s) => s.lens === 'rider');
  const rescuerSlots = UI_CAPTURE_SLOTS.filter((s) => s.lens === 'rescuer');
  assert.equal(riderSlots.length, 1);
  assert.equal(rescuerSlots.length, 3);
});
