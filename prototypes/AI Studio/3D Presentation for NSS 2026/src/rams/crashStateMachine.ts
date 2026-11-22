export type CrashStage = 'ARMED' | 'FREEFALL' | 'IMPACT' | 'REST_CHECK' | 'LATCHED' | 'SUPPRESSED';

export interface ImuSample {
  tMs: number;
  accelG: number;
  speedKmh: number;
}

export interface StateMachineResult {
  finalStage: CrashStage;
  peakG: number;
  suppressedReason: string | null;
  stageTimeline: { tMs: number; stage: CrashStage; accelG: number }[];
  detectionLatencyMs: number | null;
}

export const RAMS_CANCEL_WINDOW_SECONDS = 10;

export interface BeatInterpolation {
  beatIndex: number;
  nextBeatIndex: number;
  localT: number;
  easedT: number;
}

/**
 * Evaluates a 50 Hz smartphone IMU + GPS sample stream through the RAMS
 * two-stage crash state machine and false-alarm suppression rules.
 * Note: Motion (50 Hz IMU) and GPS originate exclusively from smartphone
 * sensor integration; the ESP32-S3 SuperMini wearable carries no onboard IMU.
 */
export function evaluateCrashStateMachine(samples: ImuSample[]): StateMachineResult {
  let stage: CrashStage = 'ARMED';
  let peakG = 0;
  let impactTimeMs: number | null = null;
  let restStartMs: number | null = null;
  let freefallSeen = false;
  let suppressedReason: string | null = null;
  let detectionLatencyMs: number | null = null;

  const stageTimeline: { tMs: number; stage: CrashStage; accelG: number }[] = [];

  for (const sample of samples) {
    if (sample.accelG > peakG) {
      peakG = sample.accelG;
    }

    if (stage === 'LATCHED') {
      stageTimeline.push({ tMs: sample.tMs, stage, accelG: sample.accelG });
      continue;
    }

    if (stage === 'ARMED') {
      if (sample.accelG < 0.45) {
        stage = 'FREEFALL';
        freefallSeen = true;
      } else if (sample.accelG >= 3.5) {
        stage = 'IMPACT';
        impactTimeMs = sample.tMs;
      }
    } else if (stage === 'FREEFALL') {
      if (sample.accelG >= 3.5) {
        stage = 'IMPACT';
        impactTimeMs = sample.tMs;
      } else if (sample.accelG > 0.75 && sample.accelG < 1.35) {
        // Brief drop or hop without impact
        stage = 'ARMED';
        freefallSeen = false;
      }
    } else if (stage === 'IMPACT') {
      if (sample.accelG <= 1.35 && sample.accelG >= 0.75) {
        stage = 'REST_CHECK';
        restStartMs = sample.tMs;
      } else if (impactTimeMs !== null && sample.tMs - impactTimeMs > 1200 && sample.speedKmh > 12) {
        stage = 'SUPPRESSED';
        suppressedReason = freefallSeen
          ? 'Transient shock — rider velocity sustained'
          : 'Pothole spike rejected — continuous riding motion';
      }
    } else if (stage === 'REST_CHECK') {
      const stillMoving = sample.speedKmh > 4.0;
      const disturbed = sample.accelG > 1.75;

      if (stillMoving || disturbed) {
        stage = 'SUPPRESSED';
        suppressedReason = stillMoving
          ? 'Road bump / pothole suppressed — GPS speed remained > 4 km/h'
          : 'Pocket tremor / walking motion suppressed — no post-impact stillness';
      } else if (restStartMs !== null && sample.tMs - restStartMs >= 1500) {
        stage = 'LATCHED';
        if (impactTimeMs !== null) {
          detectionLatencyMs = sample.tMs - impactTimeMs;
        }
      }
    } else if (stage === 'SUPPRESSED') {
      // Hold suppressed read for downstream telemetry inspection
    }

    stageTimeline.push({ tMs: sample.tMs, stage, accelG: sample.accelG });
  }

  return {
    finalStage: stage,
    peakG: Number(peakG.toFixed(2)),
    suppressedReason,
    stageTimeline,
    detectionLatencyMs,
  };
}

/**
 * Generates a deterministic 50 Hz smartphone IMU + GPS trace for a true motorcycle crash:
 * normal ride -> brief freefall -> 5.8g impact -> post-impact immobility.
 */
export function generateCrashTrace(sampleCount = 160): ImuSample[] {
  const samples: ImuSample[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const tMs = i * 20; // 50 Hz = 20 ms per sample
    let accelG = 1.0 + Math.sin(i * 0.35) * 0.08;
    let speedKmh = 54;

    if (i >= 28 && i <= 34) {
      // Brief freefall / airborne separation
      accelG = 0.28 + Math.abs(Math.sin(i)) * 0.08;
      speedKmh = 51;
    } else if (i >= 35 && i <= 42) {
      // High-G impact spike
      const peakShape = Math.sin(((i - 35) / 7) * Math.PI);
      accelG = 1.4 + peakShape * 4.4; // peaks at 5.8g
      speedKmh = Math.max(0, 48 - (i - 35) * 6.5);
    } else if (i > 42) {
      // Post-impact stillness on asphalt
      accelG = 0.99 + Math.sin(i * 0.2) * 0.02;
      speedKmh = 0.4;
    }

    samples.push({
      tMs,
      accelG: Number(accelG.toFixed(3)),
      speedKmh: Number(speedKmh.toFixed(1)),
    });
  }
  return samples;
}

/**
 * Generates a deterministic 50 Hz smartphone IMU + GPS trace for a sharp pothole hit:
 * sharp 4.1g impulse followed immediately by normal cruising speed.
 */
export function generatePotholeTrace(sampleCount = 160): ImuSample[] {
  const samples: ImuSample[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const tMs = i * 20;
    let accelG = 1.02 + Math.sin(i * 0.42) * 0.11;
    const speedKmh = 46 + Math.sin(i * 0.1) * 1.5;

    if (i >= 34 && i <= 39) {
      const peakShape = Math.sin(((i - 34) / 5) * Math.PI);
      accelG = 1.2 + peakShape * 2.95; // 4.15g sharp spike
    } else if (i > 39 && i <= 60) {
      // Suspension rebound + vibration, still riding
      accelG = 1.15 + Math.sin(i * 1.1) * 0.45;
    }

    samples.push({
      tMs,
      accelG: Number(accelG.toFixed(3)),
      speedKmh: Number(speedKmh.toFixed(1)),
    });
  }
  return samples;
}

/**
 * Semtech SX1278 (LoRa Ra-02) Time-on-Air calculation (seconds).
 * Defaults: SF9, 125 kHz BW, CR 4/5, CRC on, explicit header, 8-symbol preamble.
 */
export function calculateLoRaAirtimeSeconds(
  payloadBytes: number,
  sf = 9,
  bwHz = 125000,
  codingRate = 1, // 1 => 4/5
  preambleSymbols = 8,
  crcOn = true,
  explicitHeader = true
): number {
  const tSym = Math.pow(2, sf) / bwHz;
  const tPreamble = (preambleSymbols + 4.25) * tSym;
  const lowDataRateOptimize = sf >= 11 && bwHz <= 125000 ? 1 : 0;

  const numerator =
    8 * payloadBytes - 4 * sf + 28 + (crcOn ? 16 : 0) - (explicitHeader ? 0 : 20);
  const denominator = 4 * (sf - 2 * lowDataRateOptimize);
  const payloadSymbNb =
    8 + Math.max(Math.ceil(numerator / denominator) * (codingRate + 4), 0);

  const tPayload = payloadSymbNb * tSym;
  return Number((tPreamble + tPayload).toFixed(3));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function getBeatFromProgress(progress: number, beatCount: number): BeatInterpolation {
  const clamped = Math.max(0, Math.min(1, progress));
  if (beatCount <= 1) {
    return { beatIndex: 0, nextBeatIndex: 0, localT: 0, easedT: 0 };
  }
  const scaled = clamped * (beatCount - 1);
  const beatIndex = Math.min(beatCount - 1, Math.floor(scaled));
  const nextBeatIndex = Math.min(beatCount - 1, beatIndex + 1);
  const localT = scaled - beatIndex;
  const easedT = localT * localT * (3 - 2 * localT);
  return { beatIndex, nextBeatIndex, localT, easedT };
}

export interface AiRiskAssessment {
  riskPercent: number;
  classification: 'NOMINAL' | 'ROAD_ANOMALY_SUPPRESSED' | 'CRITICAL_CRASH_LATCHED';
  summary: string;
}

/**
 * Computes an explainable RAMS Edge AI confidence score from smartphone 50 Hz IMU + GPS
 * features and the two-stage FSM outcome (distinguishing potholes from true crashes).
 */
export function evaluateEdgeAiRisk(
  samples: ImuSample[],
  fsmResult: StateMachineResult
): AiRiskAssessment {
  if (samples.length === 0) {
    return {
      riskPercent: 0,
      classification: 'NOMINAL',
      summary: 'Awaiting 50 Hz smartphone sensor stream',
    };
  }

  const freefallCount = samples.filter((s) => s.accelG < 0.45).length;
  const tailSamples = samples.slice(Math.max(0, samples.length - 30));
  const tailMeanSpeed =
    tailSamples.reduce((acc, s) => acc + s.speedKmh, 0) / Math.max(1, tailSamples.length);

  if (fsmResult.finalStage === 'LATCHED') {
    const gScore = Math.min(48, Math.max(25, (fsmResult.peakG - 2.0) * 13));
    const freefallBonus = freefallCount >= 3 ? 22 : 10;
    const stillnessBonus = tailMeanSpeed < 2.0 ? 26.4 : 8;
    const raw = Math.min(99.2, Number((gScore + freefallBonus + stillnessBonus).toFixed(1)));
    return {
      riskPercent: raw,
      classification: 'CRITICAL_CRASH_LATCHED',
      summary: `Freefall + ${fsmResult.peakG}g impact + post-impact stillness verified`,
    };
  }

  if (fsmResult.finalStage === 'SUPPRESSED') {
    const speedRetentionPenalty = tailMeanSpeed > 15 ? 8.4 : 16.5;
    return {
      riskPercent: speedRetentionPenalty,
      classification: 'ROAD_ANOMALY_SUPPRESSED',
      summary: fsmResult.suppressedReason ?? 'Transient impulse suppressed by Edge AI gate',
    };
  }

  return {
    riskPercent: 1.4,
    classification: 'NOMINAL',
    summary: 'Steady riding kinematics · Edge AI monitor armed',
  };
}

export type HardwareRevision = 'tht' | 'smd';

export interface BatteryDividerRead {
  revision: HardwareRevision;
  vbatVolts: number;
  vAdcVolts: number;
  ratio: number;
  rTopOhms: number;
  rBottomOhms: number;
  specLabel: string;
}

/**
 * Pure ADC voltage divider calculation for the ESP32-S3 wearable GPIO2 sense path:
 * - THT Prototype: 2:1 resistive divider (100k / 100k) routed via PCB copper traces (zero wires)
 * - GPT6 Astra SMD (RAMS J2): 4:1 DMN2056U Q4-gated divider (R15 30k / R16 10k + C29 1nF)
 */
export function calculateBatteryDividerVoltage(
  vbatVolts: number,
  revision: HardwareRevision
): BatteryDividerRead {
  const clampedVbat = Math.max(0, Math.min(5.0, vbatVolts));
  if (revision === 'smd') {
    const rTopOhms = 30000;
    const rBottomOhms = 10000;
    const ratio = (rTopOhms + rBottomOhms) / rBottomOhms; // 4.0x
    return {
      revision,
      vbatVolts: Number(clampedVbat.toFixed(2)),
      vAdcVolts: Number((clampedVbat / ratio).toFixed(3)),
      ratio,
      rTopOhms,
      rBottomOhms,
      specLabel: 'R15 30kΩ / R16 10kΩ · Q4 DMN2056U',
    };
  }

  const rTopOhms = 100000;
  const rBottomOhms = 100000;
  const ratio = (rTopOhms + rBottomOhms) / rBottomOhms; // 2.0x
  return {
    revision,
    vbatVolts: Number(clampedVbat.toFixed(2)),
    vAdcVolts: Number((clampedVbat / ratio).toFixed(3)),
    ratio,
    rTopOhms,
    rBottomOhms,
    specLabel: '2× 100kΩ Axial THT · GPIO2 Copper Trace',
  };
}


