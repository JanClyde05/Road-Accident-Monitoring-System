/*
 * Road Accident Monitoring System — Accident Detection Implementation
 * =====================================================================
 * Full detection pipeline: Fall FSM + skid + direct impact + environmental.
 *
 * Architecture:
 *   detectionUpdate() is called once per sensor sample (~100Hz). It runs
 *   four independent detection paths in order of priority:
 *     1. Fall FSM — multi-phase state machine (highest priority)
 *     2. Skid — only checked when FSM is idle
 *     3. Direct impact — only checked when FSM is idle AND no skid active
 *     4. Environmental — checked every ENV_SAMPLE_INTERVAL_MS via rolling buffer
 *
 *   Only one event fires per detection cycle. The FSM must be reset (via
 *   detectionReset or button acknowledge) before new events can fire.
 *
 * IMPORTANT: validate_fsm.py must replicate this exact logic — including
 * the windowed σ computations and the FSM state transitions — for the
 * derived thresholds to transfer correctly back to this firmware.
 */

#include "detection.h"
#include "config.h"
#include <math.h>

// ── Fall FSM State ──────────────────────────────────────────────────────────

static FallState _fallState = FS_IDLE;
static uint32_t  _freefallStart = 0;    // millis() when freefall phase began
static uint32_t  _impactDeadline = 0;   // millis() by which impact must arrive
static uint32_t  _stillnessStart = 0;   // millis() when stillness phase began
static float     _peakImpactG = 0;      // Highest A_m seen during impact window

// ── Stillness σ computation ─────────────────────────────────────────────────
// Ring buffer of A_m samples during the stillness phase. We compute the
// standard deviation over this window to detect post-impact immobility.

#define STILLNESS_BUFFER_SIZE 200  // 2 seconds at 100Hz
static float    _stillBuf[STILLNESS_BUFFER_SIZE];
static uint16_t _stillIdx = 0;
static uint16_t _stillCount = 0;

// ── Skid State ──────────────────────────────────────────────────────────────

static uint32_t _skidStart = 0;
static bool     _skidActive = false;

// ── Direct Impact State ─────────────────────────────────────────────────────

static uint32_t _lastDirectImpactMs = 0;

// ── Environmental Rolling Buffer ────────────────────────────────────────────
// 50-sample ring buffer, analyzed every ENV_SAMPLE_INTERVAL_MS.

static float    _envAMag[ENV_BUFFER_SIZE];
static float    _envRoll[ENV_BUFFER_SIZE];
static float    _envPitch[ENV_BUFFER_SIZE];
static uint16_t _envIdx = 0;
static uint16_t _envCount = 0;
static uint32_t _lastEnvCheck = 0;

// ── Active Alert State ──────────────────────────────────────────────────────

static bool     _alertActive = false;
static uint8_t  _alertEventType = 0;
static float    _alertPeakG = 0;

// ── Helpers ─────────────────────────────────────────────────────────────────

// Compute standard deviation of a float array (up to `count` elements).
static float _computeStdDev(const float* buf, uint16_t count) {
  if (count < 2) return 0.0f;

  float sum = 0;
  for (uint16_t i = 0; i < count; i++) sum += buf[i];
  float mean = sum / count;

  float variance = 0;
  for (uint16_t i = 0; i < count; i++) {
    float diff = buf[i] - mean;
    variance += diff * diff;
  }
  // Population std dev (not sample) — we have the full window, not a sample
  return sqrtf(variance / count);
}

// ── Public API ──────────────────────────────────────────────────────────────

void detectionInit() {
  detectionReset();
  Serial.println(F("[DETECT] Detection engine initialized"));
  Serial.printf("[DETECT] Thresholds: freefall=%.2fg impact=%.2fg stillness_σ=%.2fg\n",
                FREEFALL_THRESHOLD_G, IMPACT_THRESHOLD_G, STILLNESS_THRESHOLD_G);
  Serial.printf("[DETECT] Skid: lat=%.2fg roll=%.1f°/s  Direct: %.2fg\n",
                SKID_LATERAL_G, SKID_ROLL_RATE_DPS, DIRECT_IMPACT_G);
}

void detectionReset() {
  _fallState = FS_IDLE;
  _freefallStart = 0;
  _impactDeadline = 0;
  _stillnessStart = 0;
  _peakImpactG = 0;
  _stillIdx = 0;
  _stillCount = 0;
  _skidStart = 0;
  _skidActive = false;
  _alertActive = false;

  // Clear environmental buffers
  _envIdx = 0;
  _envCount = 0;
  memset(_envAMag, 0, sizeof(_envAMag));
  memset(_envRoll, 0, sizeof(_envRoll));
  memset(_envPitch, 0, sizeof(_envPitch));
  memset(_stillBuf, 0, sizeof(_stillBuf));
}

DetectionResult detectionUpdate(const SensorData& data) {
  DetectionResult result = { false, 0, 0.0f };
  uint32_t now = millis();

  // If an alert is already active and unacknowledged, don't fire another
  if (_alertActive) return result;

  // ────────────────────────────────────────────────────────────────────────
  // 1. FALL FSM — highest priority, runs through its state machine
  // ────────────────────────────────────────────────────────────────────────

  switch (_fallState) {
    case FS_IDLE:
      // Watch for freefall: acceleration magnitude drops below threshold
      // (object in free fall experiences near-zero apparent acceleration)
      if (data.aMag < FREEFALL_THRESHOLD_G) {
        _fallState = FS_FREEFALL;
        _freefallStart = now;
      }
      break;

    case FS_FREEFALL:
      if (data.aMag >= FREEFALL_THRESHOLD_G) {
        // Freefall ended prematurely (e.g., brief sensor glitch)
        _fallState = FS_IDLE;
      } else if (now - _freefallStart >= FREEFALL_MIN_DURATION_MS) {
        // Freefall sustained long enough — advance to waiting for impact
        _fallState = FS_WAIT_IMPACT;
        _impactDeadline = now + IMPACT_WINDOW_MS;
        _peakImpactG = 0;
        Serial.println(F("[DETECT] Freefall confirmed, waiting for impact..."));
      }
      break;

    case FS_WAIT_IMPACT:
      // Track peak acceleration during the impact window
      if (data.aMag > _peakImpactG) _peakImpactG = data.aMag;

      if (data.aMag > IMPACT_THRESHOLD_G) {
        // Impact spike detected — advance to stillness monitoring
        _fallState = FS_STILLNESS;
        _stillnessStart = now;
        _stillIdx = 0;
        _stillCount = 0;
        Serial.printf("[DETECT] Impact detected (%.2fg), monitoring stillness...\n", _peakImpactG);
      } else if (now > _impactDeadline) {
        // Impact window expired without a qualifying spike — reset
        _fallState = FS_IDLE;
        Serial.println(F("[DETECT] Impact window expired, resetting FSM"));
      }
      break;

    case FS_STILLNESS: {
      // Accumulate A_m samples into the ring buffer
      _stillBuf[_stillIdx] = data.aMag;
      _stillIdx = (_stillIdx + 1) % STILLNESS_BUFFER_SIZE;
      if (_stillCount < STILLNESS_BUFFER_SIZE) _stillCount++;

      // Compute running standard deviation of acceleration magnitude.
      // Low σ = the person isn't moving = post-fall immobility.
      float sigma = _computeStdDev(_stillBuf, _stillCount);

      if (sigma >= STILLNESS_THRESHOLD_G) {
        // Movement detected during stillness window — person is moving,
        // probably not incapacitated. Reset the stillness timer.
        _stillnessStart = now;
        _stillIdx = 0;
        _stillCount = 0;
      }

      if (now - _stillnessStart >= STILLNESS_DURATION_MS && sigma < STILLNESS_THRESHOLD_G) {
        // Sustained stillness confirmed — this is a real fall
        _fallState = FS_CONFIRMED;
        _alertActive = true;
        _alertEventType = EVT_FALL;
        _alertPeakG = _peakImpactG;
        result.triggered = true;
        result.eventType = EVT_FALL;
        result.peakAMag = _peakImpactG;
        Serial.printf("[DETECT] ⚠ FALL CONFIRMED (peak=%.2fg, σ=%.3fg)\n", _peakImpactG, sigma);
      }

      // Timeout: if stillness phase runs too long without confirming
      // (person started moving again), reset entirely
      if (now - _stillnessStart > STILLNESS_DURATION_MS * 3) {
        _fallState = FS_IDLE;
        Serial.println(F("[DETECT] Stillness timeout, resetting FSM"));
      }
      break;
    }

    case FS_CONFIRMED:
      // Stay in confirmed state until externally reset (button press)
      break;
  }

  // If the fall FSM fired, return immediately — don't double-trigger
  if (result.triggered) return result;

  // ────────────────────────────────────────────────────────────────────────
  // 2. SKID DETECTION — only when FSM is idle
  // ────────────────────────────────────────────────────────────────────────

  if (_fallState == FS_IDLE) {
    // Skid signature: high lateral acceleration + high roll rate,
    // sustained for a minimum duration. This captures the sideways
    // sliding motion of a motorcycle/bicycle skid or a person sliding
    // on the ground after a fall.
    bool skidCondition = (fabsf(data.ay) > SKID_LATERAL_G) &&
                         (fabsf(data.gx) > SKID_ROLL_RATE_DPS);

    if (skidCondition) {
      if (!_skidActive) {
        _skidActive = true;
        _skidStart = now;
      } else if (now - _skidStart >= SKID_MIN_DURATION_MS) {
        // Sustained skid confirmed
        _alertActive = true;
        _alertEventType = EVT_SKID;
        _alertPeakG = fabsf(data.ay);
        result.triggered = true;
        result.eventType = EVT_SKID;
        result.peakAMag = fabsf(data.ay);
        _skidActive = false;
        Serial.printf("[DETECT] ⚠ SKID DETECTED (ay=%.2fg, gx=%.1f°/s)\n",
                      data.ay, data.gx);
        return result;
      }
    } else {
      _skidActive = false;
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // 3. DIRECT IMPACT — FSM idle AND no active skid
  // ────────────────────────────────────────────────────────────────────────

  if (_fallState == FS_IDLE && !_skidActive) {
    // Single high-g spike without the freefall→impact→stillness sequence.
    // This catches sudden impacts that don't involve a fall (e.g., being
    // struck by a vehicle while standing).
    if (data.aMag > DIRECT_IMPACT_G) {
      // Debounce: don't re-trigger within the cooldown period
      if (now - _lastDirectImpactMs > DIRECT_IMPACT_DEBOUNCE_MS) {
        _lastDirectImpactMs = now;
        _alertActive = true;
        _alertEventType = EVT_DIRECT_IMPACT;
        _alertPeakG = data.aMag;
        result.triggered = true;
        result.eventType = EVT_DIRECT_IMPACT;
        result.peakAMag = data.aMag;
        Serial.printf("[DETECT] ⚠ DIRECT IMPACT (%.2fg)\n", data.aMag);
        return result;
      }
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // 4. ENVIRONMENTAL DETECTION — rolling buffer, checked periodically
  // ────────────────────────────────────────────────────────────────────────

  // Always accumulate into the rolling buffer regardless of FSM state
  _envAMag[_envIdx]  = data.aMag;
  _envRoll[_envIdx]  = data.roll;
  _envPitch[_envIdx] = data.pitch;
  _envIdx = (_envIdx + 1) % ENV_BUFFER_SIZE;
  if (_envCount < ENV_BUFFER_SIZE) _envCount++;

  // Only analyze when the buffer is full and enough time has passed
  if (_envCount >= ENV_BUFFER_SIZE && now - _lastEnvCheck >= ENV_SAMPLE_INTERVAL_MS) {
    _lastEnvCheck = now;

    float sigmaA     = _computeStdDev(_envAMag, _envCount);
    float sigmaRoll  = _computeStdDev(_envRoll, _envCount);
    float sigmaPitch = _computeStdDev(_envPitch, _envCount);

    // Ground shock: high acceleration variance BUT low orientation change.
    // This pattern matches seismic-like events where the ground shakes
    // but the device doesn't rotate (earthquake, nearby explosion, etc.)
    if (sigmaA >= ENV_GROUND_SHOCK_ACCEL_STD &&
        sigmaRoll < ENV_GROUND_SHOCK_ORIENT_STD &&
        sigmaPitch < ENV_GROUND_SHOCK_ORIENT_STD) {
      _alertActive = true;
      _alertEventType = EVT_GROUND_SHOCK;
      _alertPeakG = sigmaA;
      result.triggered = true;
      result.eventType = EVT_GROUND_SHOCK;
      result.peakAMag = sigmaA;
      Serial.printf("[DETECT] ⚠ GROUND SHOCK (σA=%.3f, σR=%.1f, σP=%.1f)\n",
                    sigmaA, sigmaRoll, sigmaPitch);
      return result;
    }

    // Wave motion: moderate acceleration variance WITH orientation drift.
    // This pattern matches being caught in water current, mudslide, or
    // similar environmental hazard where the body is being moved.
    if (sigmaA >= ENV_WAVE_MOTION_ACCEL_STD &&
        (sigmaRoll >= ENV_WAVE_MOTION_ORIENT_STD ||
         sigmaPitch >= ENV_WAVE_MOTION_ORIENT_STD)) {
      _alertActive = true;
      _alertEventType = EVT_WAVE_MOTION;
      _alertPeakG = sigmaA;
      result.triggered = true;
      result.eventType = EVT_WAVE_MOTION;
      result.peakAMag = sigmaA;
      Serial.printf("[DETECT] ⚠ WAVE MOTION (σA=%.3f, σR=%.1f, σP=%.1f)\n",
                    sigmaA, sigmaRoll, sigmaPitch);
      return result;
    }
  }

  return result;
}

FallState detectionGetFallState() {
  return _fallState;
}

bool detectionHasActiveAlert() {
  return _alertActive;
}

void detectionAcknowledgeAlert() {
  _alertActive = false;
  _fallState = FS_IDLE;
  _skidActive = false;
  _stillIdx = 0;
  _stillCount = 0;
  Serial.println(F("[DETECT] Alert acknowledged, detection reset"));
}
