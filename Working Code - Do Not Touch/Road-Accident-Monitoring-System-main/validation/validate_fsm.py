"""
Road Accident Monitoring System — FSM Threshold Validation Script
===================================================================
Reads collected CSV data (from data_logger), replays the detection
FSM in software, and derives empirically-tuned thresholds.

This script REPLICATES the exact detection logic from
wearable/detection.cpp — including the Fall FSM state machine,
skid detection, direct impact, and environmental analysis.

Usage:
  python validate_fsm.py --data-dir ./collected_data/
  python validate_fsm.py --file fall_fwd_01.csv --sweep
  python validate_fsm.py --data-dir ./collected_data/ --optimize

Output:
  - Confusion matrix per detection path
  - Suggested threshold values
  - ROC curves for key thresholds (with --sweep)
  - Updated config.h snippet (with --optimize)

GitHub: https://github.com/JanClyde05/Road-Accident-Monitoring-System
"""

import argparse
import csv
import math
import os
import sys
from dataclasses import dataclass, field
from enum import IntEnum
from pathlib import Path
from typing import Optional


# ── FSM States (mirrors detection.h) ────────────────────────────────────────

class FallState(IntEnum):
    IDLE = 0
    FREEFALL = 1
    WAIT_IMPACT = 2
    STILLNESS = 3
    CONFIRMED = 4


class EventType(IntEnum):
    FALL = 0
    SKID = 1
    DIRECT_IMPACT = 2
    GROUND_SHOCK = 3
    WAVE_MOTION = 4


# ── Default Thresholds (from config.h) ───────────────────────────────────────

@dataclass
class Thresholds:
    # Fall FSM
    freefall_g: float = 0.40
    freefall_min_ms: int = 100
    impact_g: float = 3.00
    impact_window_ms: int = 500
    stillness_g: float = 0.15
    stillness_ms: int = 2000

    # Skid
    skid_lateral_g: float = 2.00
    skid_roll_dps: float = 330.0
    skid_min_ms: int = 200

    # Direct impact
    direct_impact_g: float = 4.50
    direct_debounce_ms: int = 5000

    # Environmental
    env_buffer_size: int = 50
    env_interval_ms: int = 1000
    env_ground_shock_accel_std: float = 0.40
    env_ground_shock_orient_std: float = 10.0
    env_wave_accel_std: float = 0.24
    env_wave_orient_std: float = 10.0


# ── Sensor Sample ────────────────────────────────────────────────────────────

@dataclass
class Sample:
    t_ms: int
    ax: float
    ay: float
    az: float
    gx: float
    gy: float
    gz: float
    a_mag: float = 0.0
    roll: float = 0.0
    pitch: float = 0.0
    trial_id: str = ""
    label: str = ""

    def __post_init__(self):
        self.a_mag = math.sqrt(self.ax**2 + self.ay**2 + self.az**2)
        self.roll = math.degrees(math.atan2(self.ay, self.az))
        denom = math.sqrt(self.ay**2 + self.az**2)
        self.pitch = math.degrees(math.atan2(-self.ax, denom)) if denom > 0 else 0.0


# ── Detection Result ─────────────────────────────────────────────────────────

@dataclass
class Detection:
    triggered: bool = False
    event_type: Optional[EventType] = None
    peak_a_mag: float = 0.0
    sample_index: int = 0
    time_ms: int = 0


# ── FSM Simulator (EXACT replica of detection.cpp) ──────────────────────────

class FSMSimulator:
    """Replicates the detection engine from wearable/detection.cpp."""

    def __init__(self, thresholds: Thresholds):
        self.th = thresholds
        self.detections: list[Detection] = []
        self.reset()

    def reset(self):
        # Fall FSM
        self.fall_state = FallState.IDLE
        self.freefall_start = 0
        self.impact_deadline = 0
        self.stillness_start = 0
        self.peak_impact_g = 0.0

        # Stillness buffer
        self.still_buf: list[float] = []

        # Skid
        self.skid_start = 0
        self.skid_active = False

        # Direct impact
        self.last_direct_ms = 0

        # Environmental
        self.env_a_mag: list[float] = []
        self.env_roll: list[float] = []
        self.env_pitch: list[float] = []
        self.last_env_check = 0

        # Alert
        self.alert_active = False

    def _std_dev(self, values: list[float]) -> float:
        if len(values) < 2:
            return 0.0
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / len(values)
        return math.sqrt(variance)

    def update(self, sample: Sample, index: int) -> Optional[Detection]:
        """Run one detection cycle. Returns Detection if triggered."""
        now = sample.t_ms
        data = sample

        if self.alert_active:
            return None

        # ── 1. Fall FSM ──────────────────────────────────────────────────
        if self.fall_state == FallState.IDLE:
            if data.a_mag < self.th.freefall_g:
                self.fall_state = FallState.FREEFALL
                self.freefall_start = now

        elif self.fall_state == FallState.FREEFALL:
            if data.a_mag >= self.th.freefall_g:
                self.fall_state = FallState.IDLE
            elif now - self.freefall_start >= self.th.freefall_min_ms:
                self.fall_state = FallState.WAIT_IMPACT
                self.impact_deadline = now + self.th.impact_window_ms
                self.peak_impact_g = 0.0

        elif self.fall_state == FallState.WAIT_IMPACT:
            if data.a_mag > self.peak_impact_g:
                self.peak_impact_g = data.a_mag
            if data.a_mag > self.th.impact_g:
                self.fall_state = FallState.STILLNESS
                self.stillness_start = now
                self.still_buf = []
            elif now > self.impact_deadline:
                self.fall_state = FallState.IDLE

        elif self.fall_state == FallState.STILLNESS:
            self.still_buf.append(data.a_mag)
            if len(self.still_buf) > 200:
                self.still_buf.pop(0)

            sigma = self._std_dev(self.still_buf)

            if sigma >= self.th.stillness_g:
                self.stillness_start = now
                self.still_buf = []

            if (now - self.stillness_start >= self.th.stillness_ms and
                    sigma < self.th.stillness_g):
                self.fall_state = FallState.CONFIRMED
                self.alert_active = True
                det = Detection(True, EventType.FALL, self.peak_impact_g, index, now)
                self.detections.append(det)
                return det

            if now - self.stillness_start > self.th.stillness_ms * 3:
                self.fall_state = FallState.IDLE

        # If fall FSM fired, don't check other paths
        if self.alert_active:
            return None

        # ── 2. Skid Detection ────────────────────────────────────────────
        if self.fall_state == FallState.IDLE:
            skid_cond = (abs(data.ay) > self.th.skid_lateral_g and
                         abs(data.gx) > self.th.skid_roll_dps)
            if skid_cond:
                if not self.skid_active:
                    self.skid_active = True
                    self.skid_start = now
                elif now - self.skid_start >= self.th.skid_min_ms:
                    self.alert_active = True
                    self.skid_active = False
                    det = Detection(True, EventType.SKID, abs(data.ay), index, now)
                    self.detections.append(det)
                    return det
            else:
                self.skid_active = False

        # ── 3. Direct Impact ─────────────────────────────────────────────
        if self.fall_state == FallState.IDLE and not self.skid_active:
            if data.a_mag > self.th.direct_impact_g:
                if now - self.last_direct_ms > self.th.direct_debounce_ms:
                    self.last_direct_ms = now
                    self.alert_active = True
                    det = Detection(True, EventType.DIRECT_IMPACT, data.a_mag, index, now)
                    self.detections.append(det)
                    return det

        # ── 4. Environmental ─────────────────────────────────────────────
        self.env_a_mag.append(data.a_mag)
        self.env_roll.append(data.roll)
        self.env_pitch.append(data.pitch)
        if len(self.env_a_mag) > self.th.env_buffer_size:
            self.env_a_mag.pop(0)
            self.env_roll.pop(0)
            self.env_pitch.pop(0)

        if (len(self.env_a_mag) >= self.th.env_buffer_size and
                now - self.last_env_check >= self.th.env_interval_ms):
            self.last_env_check = now
            sigma_a = self._std_dev(self.env_a_mag)
            sigma_r = self._std_dev(self.env_roll)
            sigma_p = self._std_dev(self.env_pitch)

            if (sigma_a >= self.th.env_ground_shock_accel_std and
                    sigma_r < self.th.env_ground_shock_orient_std and
                    sigma_p < self.th.env_ground_shock_orient_std):
                self.alert_active = True
                det = Detection(True, EventType.GROUND_SHOCK, sigma_a, index, now)
                self.detections.append(det)
                return det

            if (sigma_a >= self.th.env_wave_accel_std and
                    (sigma_r >= self.th.env_wave_orient_std or
                     sigma_p >= self.th.env_wave_orient_std)):
                self.alert_active = True
                det = Detection(True, EventType.WAVE_MOTION, sigma_a, index, now)
                self.detections.append(det)
                return det

        return None


# ── CSV Loading ──────────────────────────────────────────────────────────────

def load_csv(filepath: str) -> list[Sample]:
    """Load a CSV file from the data collection tool."""
    samples = []
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                s = Sample(
                    t_ms=int(row.get('t_ms', 0)),
                    ax=float(row.get('ax', 0)),
                    ay=float(row.get('ay', 0)),
                    az=float(row.get('az', 0)),
                    gx=float(row.get('gx', 0)),
                    gy=float(row.get('gy', 0)),
                    gz=float(row.get('gz', 0)),
                    trial_id=row.get('trial_id', ''),
                    label=row.get('label', ''),
                )
                samples.append(s)
            except (ValueError, KeyError) as e:
                continue
    return samples


def load_data_dir(data_dir: str) -> dict[str, list[Sample]]:
    """Load all CSVs from a directory, keyed by filename."""
    trials = {}
    for f in sorted(Path(data_dir).glob('*.csv')):
        samples = load_csv(str(f))
        if samples:
            trials[f.stem] = samples
            print(f"  Loaded {f.name}: {len(samples)} samples")
    return trials


# ── Classification ───────────────────────────────────────────────────────────

POSITIVE_LABELS = {'fall_forward', 'fall_backward', 'fall_lateral',
                   'direct_impact', 'skid_slide', 'ground_shock', 'wave_motion'}
NEGATIVE_LABELS = {'walking', 'running', 'jumping', 'vehicle_ride', 'normal'}


def classify_trial(samples: list[Sample], thresholds: Thresholds) -> dict:
    """Run the FSM simulator on a trial and return classification results."""
    sim = FSMSimulator(thresholds)
    label = samples[0].label if samples else 'unknown'
    is_positive = label in POSITIVE_LABELS
    trial_id = samples[0].trial_id if samples else 'unknown'

    for i, s in enumerate(samples):
        sim.update(s, i)

    detected = len(sim.detections) > 0
    detection_types = [d.event_type.name for d in sim.detections] if sim.detections else []

    # Classification
    if is_positive and detected:
        classification = 'TP'  # True Positive
    elif is_positive and not detected:
        classification = 'FN'  # False Negative (missed accident)
    elif not is_positive and detected:
        classification = 'FP'  # False Positive (false alarm)
    else:
        classification = 'TN'  # True Negative

    return {
        'trial_id': trial_id,
        'label': label,
        'is_positive': is_positive,
        'detected': detected,
        'classification': classification,
        'detection_types': detection_types,
        'num_detections': len(sim.detections),
        'num_samples': len(samples),
    }


# ── Threshold Sweep ─────────────────────────────────────────────────────────

def sweep_threshold(trials: dict[str, list[Sample]], param_name: str,
                    values: list[float], base_thresholds: Thresholds) -> list[dict]:
    """Sweep a single threshold parameter across values, report metrics."""
    results = []
    for val in values:
        th = Thresholds(**{k: v for k, v in base_thresholds.__dict__.items()})
        setattr(th, param_name, val)

        tp = fp = fn = tn = 0
        for trial_name, samples in trials.items():
            r = classify_trial(samples, th)
            if r['classification'] == 'TP': tp += 1
            elif r['classification'] == 'FP': fp += 1
            elif r['classification'] == 'FN': fn += 1
            elif r['classification'] == 'TN': tn += 1

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        accuracy = (tp + tn) / (tp + fp + fn + tn) if (tp + fp + fn + tn) > 0 else 0

        results.append({
            'param': param_name,
            'value': val,
            'TP': tp, 'FP': fp, 'FN': fn, 'TN': tn,
            'precision': precision, 'recall': recall,
            'f1': f1, 'accuracy': accuracy,
        })

    return results


# ── Output ───────────────────────────────────────────────────────────────────

def print_confusion_matrix(results: list[dict]):
    """Print a confusion matrix summary."""
    tp = sum(1 for r in results if r['classification'] == 'TP')
    fp = sum(1 for r in results if r['classification'] == 'FP')
    fn = sum(1 for r in results if r['classification'] == 'FN')
    tn = sum(1 for r in results if r['classification'] == 'TN')
    total = len(results)

    print(f"\n{'═'*50}")
    print(f"  CONFUSION MATRIX ({total} trials)")
    print(f"{'═'*50}")
    print(f"               Predicted +   Predicted -")
    print(f"  Actual +     TP = {tp:>4}     FN = {fn:>4}")
    print(f"  Actual -     FP = {fp:>4}     TN = {tn:>4}")
    print(f"{'─'*50}")

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    accuracy = (tp + tn) / total if total > 0 else 0

    print(f"  Precision:  {precision:.3f}")
    print(f"  Recall:     {recall:.3f}")
    print(f"  F1 Score:   {f1:.3f}")
    print(f"  Accuracy:   {accuracy:.3f}")
    print()


def print_config_snippet(thresholds: Thresholds):
    """Print a config.h-compatible threshold block."""
    print(f"\n// ── Derived Thresholds (from validate_fsm.py) ───────────────────")
    print(f"#define FREEFALL_THRESHOLD_G    {thresholds.freefall_g:.2f}f")
    print(f"#define FREEFALL_MIN_DURATION_MS {thresholds.freefall_min_ms}")
    print(f"#define IMPACT_THRESHOLD_G      {thresholds.impact_g:.2f}f")
    print(f"#define IMPACT_WINDOW_MS        {thresholds.impact_window_ms}")
    print(f"#define STILLNESS_THRESHOLD_G   {thresholds.stillness_g:.2f}f")
    print(f"#define STILLNESS_DURATION_MS   {thresholds.stillness_ms}")
    print(f"#define SKID_LATERAL_G          {thresholds.skid_lateral_g:.2f}f")
    print(f"#define SKID_ROLL_RATE_DPS      {thresholds.skid_roll_dps:.1f}f")
    print(f"#define SKID_MIN_DURATION_MS    {thresholds.skid_min_ms}")
    print(f"#define DIRECT_IMPACT_G         {thresholds.direct_impact_g:.2f}f")
    print(f"#define ENV_GROUND_SHOCK_ACCEL_STD  {thresholds.env_ground_shock_accel_std:.2f}f")
    print(f"#define ENV_WAVE_MOTION_ACCEL_STD   {thresholds.env_wave_accel_std:.2f}f")
    print()


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='RAMS FSM Threshold Validation & Optimization',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument('--data-dir', type=str, default='./collected_data',
                        help='Directory containing CSV files from data_logger')
    parser.add_argument('--file', type=str, help='Single CSV file to analyze')
    parser.add_argument('--sweep', action='store_true',
                        help='Run threshold sweep and print ROC-like tables')
    parser.add_argument('--optimize', action='store_true',
                        help='Find best F1-score thresholds and print config.h snippet')
    args = parser.parse_args()

    print("╔══════════════════════════════════════════════╗")
    print("║  RAMS — FSM Threshold Validation Script      ║")
    print("╚══════════════════════════════════════════════╝")

    # Load data
    if args.file:
        samples = load_csv(args.file)
        if not samples:
            print(f"Error: No samples loaded from {args.file}")
            sys.exit(1)
        trials = {Path(args.file).stem: samples}
    else:
        data_dir = args.data_dir
        if not os.path.isdir(data_dir):
            print(f"Error: Data directory not found: {data_dir}")
            print(f"Create it and add CSV files from the data collection tool.")
            print(f"\nUsage: python validate_fsm.py --data-dir ./collected_data/")
            sys.exit(1)
        print(f"\nLoading data from {data_dir}...")
        trials = load_data_dir(data_dir)
        if not trials:
            print("No CSV files found!")
            sys.exit(1)

    print(f"\nLoaded {len(trials)} trials, {sum(len(s) for s in trials.values())} total samples")

    # Run baseline classification
    th = Thresholds()
    print(f"\n{'─'*50}")
    print(f"  BASELINE THRESHOLDS (from literature)")
    print(f"{'─'*50}")

    results = []
    for trial_name, samples in trials.items():
        r = classify_trial(samples, th)
        results.append(r)
        status = '✓' if r['classification'] in ('TP', 'TN') else '✗'
        det_str = ', '.join(r['detection_types']) if r['detection_types'] else 'none'
        print(f"  {status} {trial_name:30s} label={r['label']:15s} → {r['classification']} "
              f"(detected: {det_str})")

    print_confusion_matrix(results)

    # Threshold sweep
    if args.sweep:
        print(f"\n{'═'*50}")
        print(f"  THRESHOLD SWEEP")
        print(f"{'═'*50}")

        sweeps = [
            ('freefall_g', [0.20, 0.30, 0.40, 0.50, 0.60, 0.70]),
            ('impact_g', [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0]),
            ('stillness_g', [0.05, 0.10, 0.15, 0.20, 0.25, 0.30]),
            ('direct_impact_g', [2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0]),
        ]

        for param, values in sweeps:
            print(f"\n  Sweeping {param}:")
            print(f"  {'Value':>8s} {'TP':>4s} {'FP':>4s} {'FN':>4s} {'TN':>4s} "
                  f"{'Prec':>6s} {'Rec':>6s} {'F1':>6s}")
            sweep_results = sweep_threshold(trials, param, values, th)
            for sr in sweep_results:
                print(f"  {sr['value']:8.2f} {sr['TP']:4d} {sr['FP']:4d} "
                      f"{sr['FN']:4d} {sr['TN']:4d} {sr['precision']:6.3f} "
                      f"{sr['recall']:6.3f} {sr['f1']:6.3f}")

    # Optimize
    if args.optimize:
        print(f"\n{'═'*50}")
        print(f"  OPTIMIZATION (maximize F1)")
        print(f"{'═'*50}")

        best_th = Thresholds()
        best_f1 = 0.0

        # Grid search over key parameters
        for ff in [0.30, 0.35, 0.40, 0.45, 0.50]:
            for imp in [2.0, 2.5, 3.0, 3.5, 4.0]:
                for still in [0.10, 0.15, 0.20, 0.25]:
                    th_test = Thresholds(freefall_g=ff, impact_g=imp, stillness_g=still)
                    tp = fp = fn = tn = 0
                    for trial_name, samples in trials.items():
                        r = classify_trial(samples, th_test)
                        if r['classification'] == 'TP': tp += 1
                        elif r['classification'] == 'FP': fp += 1
                        elif r['classification'] == 'FN': fn += 1
                        elif r['classification'] == 'TN': tn += 1

                    prec = tp / (tp + fp) if (tp + fp) > 0 else 0
                    rec = tp / (tp + fn) if (tp + fn) > 0 else 0
                    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0

                    if f1 > best_f1:
                        best_f1 = f1
                        best_th = th_test

        print(f"\n  Best F1 = {best_f1:.3f}")
        print_config_snippet(best_th)

    print("Done.")


if __name__ == '__main__':
    main()
