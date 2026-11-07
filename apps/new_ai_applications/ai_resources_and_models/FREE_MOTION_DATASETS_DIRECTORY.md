# RAMS Open-Source Motion Datasets Directory & AI Benchmark Contract

**Road Accident Monitoring System (RAMS)**  
*Subsystem: Edge AI Training, Kinematic Data Collection, & Model Calibration*  
*Standard: Zero-Emoji Technical Architecture Dossier (IECEP Nationals)*

---

## 1. Executive Summary & Parameter Contract

To train, validate, and demonstrate the RAMS Edge AI dual-tier architecture (LiteRT 1D-CNN + SmolLM2 SLM reasoner), the system requires high-rate (50Hz–200Hz) tri-axial accelerometer and gyroscope motion data. 

The core challenge in motorcycle accident detection is **eliminating false positives caused by Activities of Daily Living (ADL)** such as road potholes, speed bumps, pavement cracks, walking, and dropped smartphones, while maintaining 100% sensitivity to genuine falls, high-speed impacts, and skidding spills.

All benchmark datasets in RAMS are mapped into the canonical **14-parameter feature vector contract** matching `imu_studio_app` and `com.example.model.FeatureVector`:

| Feature # | Canonical Parameter | Mathematical Formula | Physical Significance for Crash vs False Positive |
|---|---|---|---|
| 1 | `mean_svm_g` | $\frac{1}{N} \sum \sqrt{a_x^2 + a_y^2 + a_z^2}$ | Baseline gravitational and propulsion loading |
| 2 | `max_svm_g` | $\max(\text{SVM})$ | Peak shockwave impulse (Impact > 5.0G; Pothole ~ 3.5G-4.5G) |
| 3 | `min_svm_g` | $\min(\text{SVM})$ | Freefall detection (< 0.3G indicates drop or airborne flight) |
| 4 | `std_svm_g` | $\sqrt{\text{Var}(\text{SVM})}$ | Motion turbulence & roughness dispersion |
| 5 | `rms_svm_g` | $\sqrt{\frac{1}{N} \sum \text{SVM}^2}$ | Continuous kinetic energy expenditure |
| 6 | `max_gyro_mag` | $\max(\sqrt{\omega_x^2 + \omega_y^2 + \omega_z^2})$ | Peak angular tumbling velocity (deg/s) |
| 7 | `mean_gyro_mag` | $\frac{1}{N} \sum \|\vec{\omega}\|$ | Sustained angular motion during event window |
| 8 | `std_gyro_mag` | $\sqrt{\text{Var}(\|\vec{\omega}\|)}$ | Rotational instability index |
| 9 | `max_jerk` | $\max(\|\Delta \text{SVM}\| \times f_s)$ | Peak rate of shock application ($G/s$) |
| 10 | `mean_jerk` | $\frac{1}{N-1} \sum \|\Delta \text{SVM}\| \times f_s$ | Mechanical shock severity gradient |
| 11 | `tilt_delta_deg` | $\|\Delta \text{Pitch}\| + \|\Delta \text{Roll}\|$ | **Key Discriminator**: Crashes rest at >45°; Potholes return to 0° |
| 12 | `signal_magnitude_area` | $\frac{1}{N} \sum (\|a_x\| + \|a_y\| + \|a_z\|)$ | Normalized physical activity intensity |
| 13 | `energy_svm` | $\frac{1}{N} \sum \text{SVM}^2$ | Spectral energy dissipation |
| 14 | `zero_crossing_rate` | $\frac{\text{Crossings}(1.0G)}{\text{Window Duration (s)}}$ | High in engine vibration/shaking; low in steady slide |

---

## 2. Directory of Free & Open-Source Benchmark Motion Datasets

The following public datasets provide raw, research-grade, open-access IMU sensor data that can be used directly for training, fine-tuning, and benchmarking RAMS:

### A. SisFall: A Benchmark Dataset for Fall Detection and ADL
* **Institution**: Universidad de Antioquia, Medellín, Colombia.
* **Access**: Free Open Access (Zenodo / GitHub).
* **Repository**: `https://zenodo.org/record/57233`
* **Sensor Hardware**: Two 3-axis accelerometers (ADXL345, MMA8451Q) and one 3-axis gyroscope (ITG3200) sampled at **200 Hz**.
* **Subject Pool**: 38 participants (23 young adults, 15 elderly adults).
* **Dataset Volume**: 4,510 recorded trials.
* **Applicable Classes for RAMS**:
  - **Falls (Accidents)**: 15 types including forward falls (F01), backward falls (F02), lateral falls (F03), slip while walking (F04), trip while jogging (F06), fainting (F14).
  - **ADL (False Alarms)**: 19 types including walking, jogging, sitting, crouching, stumbling, stair ascent/descent.
* **Utility for RAMS**: Serves as the gold standard for fall kinematics and post-fall immobility verification.

---

### B. MobiFall & MobiAct Dataset
* **Institution**: Biomedical Informatics & eHealth Laboratory (BMI-Lab), University of Crete, Greece.
* **Access**: Free Academic Access.
* **Repository**: `https://www.bmi.hmu.gr/the-mobiact-dataset/`
* **Sensor Hardware**: Smartphone embedded 3D Accelerometer, 3D Gyroscope, and 3D Orientation sensor sampled at **87 Hz** placed in trouser pockets.
* **Subject Pool**: 67 participants performing 3,200 trials.
* **Applicable Classes for RAMS**:
  - **Falls**: Forward slips, backward falls, lateral spills.
  - **ADLs**: Standing, walking, jogging, jumping, stairs, car transfers.
* **Utility for RAMS**: Captures genuine smartphone dynamics inside clothing/pockets, accurately modeling rider phone movement.

---

### C. UP-Fall Detection Dataset
* **Institution**: Universidad Panamericana, Campus Aguascalientes, Mexico.
* **Access**: Open Access (Zenodo / UP Repository).
* **Repository**: `https://zenodo.org/record/3739768`
* **Sensor Hardware**: 5 Wearable IMUs (Waist, Wrist, Neck, Right Thigh, Left Ankle) sampled at **100 Hz** + Ambient context.
* **Dataset Volume**: 11 distinct activity scenarios across multiple subject trials.
* **Utility for RAMS**: Provides dual-perspective validation comparing waist/pocket phone placement against wrist/helmet wearable placement matching our ESP32-S3 base station.

---

### D. IEEE DataPort: Smartphone Road Pothole & Speed Bump Dataset
* **Access**: Open Access (IEEE DataPort).
* **Repository**: `https://ieee-dataport.org/open-access/road-pothole-and-bump-dataset`
* **Sensor Hardware**: Tri-axial accelerometer & gyroscope sampled at **50 Hz** mounted on two-wheelers and passenger vehicles.
* **Applicable Classes for RAMS**:
  - Potholes (deep asphalt depressions producing single-peak vertical shock > 4G).
  - Speed bumps / Speed humps (compression followed by rebound).
  - Rumble strips and gravel road vibrations.
* **Utility for RAMS**: **Critical for False-Positive Suppression**. Provides real-world road anomalies that trick naïve threshold algorithms into firing false emergency dispatches.

---

### E. UCI Human Activity Recognition (HAR) Smartphone Dataset
* **Institution**: Center for Machine Learning and Intelligent Systems, University of California, Irvine.
* **Access**: Free Public Domain.
* **Repository**: `https://archive.ics.uci.edu/dataset/240/human+activity+recognition+using+smartphones`
* **Sensor Hardware**: Samsung Galaxy S II waist-mounted accelerometer and angular velocity gyroscope sampled at **50 Hz**.
* **Subject Pool**: 30 volunteers aged 19–48.
* **Dataset Volume**: 10,299 instances labeled across 6 activities.
* **Utility for RAMS**: Provides pristine baseline data for normal human movement (Walking, Walking Upstairs, Walking Downstairs, Sitting, Standing, Laying down) ensuring normal rider movement never triggers alarms.

---

### F. UMAFall Dataset
* **Institution**: University of Malaga, Spain.
* **Access**: Free Open Access.
* **Repository**: `http://www.lcc.uma.es/~ejordonez/UMAFall/`
* **Sensor Hardware**: Smartphone and wearable wireless sensor nodes (5 nodes) recording at **50 Hz**.
* **Utility for RAMS**: Validates multi-point sensor fusion between wearable modules and phone units.

---

## 3. Pre-Packaged Benchmark Datasets Included in RAMS

To eliminate manual data formatting, 10 canonical benchmark datasets conforming to the RAMS schema are pre-compiled and shipped directly inside the project:

* **Source Script**: [`scripts/generate_benchmark_motion_datasets.py`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/scripts/generate_benchmark_motion_datasets.py)
* **App Asset Storage**: [`apps/android_app/app/src/main/assets/motion_benchmarks/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/android_app/app/src/main/assets/motion_benchmarks/)
* **Standalone Storage**: [`apps/new_ai_applications/ai_resources_and_models/benchmark_datasets/`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/apps/new_ai_applications/ai_resources_and_models/benchmark_datasets/)
* **Target Mobile Device Location**: `/sdcard/Android/data/com.aistudio.rams.wkqmzb/files/RAMS_Training_Datasets/`

### Benchmark Profile Matrix

| Benchmark File | Ground Truth | Peak SVM ($G$) | Tilt Delta ($^\circ$) | Pre-Speed | AI Model Ruling |
|---|---|---|---|---|---|
| `benchmark_fall.json` | ACCIDENT | 6.99 G | 157.5° | 42 km/h | **CRITICAL CRASH CONFIRMED** |
| `benchmark_impact.json` | ACCIDENT | 8.50 G | 154.5° | 55 km/h | **SEVERE IMPACT CONFIRMED** |
| `benchmark_skidding.json` | ACCIDENT | 2.01 G | 134.0° | 48 km/h | **LOWSIDE SPILL CONFIRMED** |
| `benchmark_pothole.json` | FALSE ALARM | 4.18 G | 0.2° | 38 km/h | **SUPPRESSED: ROAD POTHOLE** |
| `benchmark_speed_bump.json` | FALSE ALARM | 2.61 G | 0.2° | 25 km/h | **SUPPRESSED: SPEED BUMP** |
| `benchmark_phone_falling.json` | FALSE ALARM | 3.71 G | 91.0° | 0 km/h | **SUPPRESSED: STATIONARY DROP** |
| `benchmark_phone_shaking.json` | FALSE ALARM | 2.45 G | 0.0° | 0 km/h | **SUPPRESSED: POCKET VIBRATION** |
| `benchmark_normal_vehicle_ride.json` | NORMAL RIDE | 1.03 G | 0.0° | 60 km/h | **NOMINAL HIGHWAY CRUISING** |
| `benchmark_walking.json` | NORMAL ADL | 1.35 G | 0.0° | 4.5 km/h | **NORMAL PEDESTRIAN GAIT** |
| `benchmark_running.json` | NORMAL ADL | 1.95 G | 0.0° | 12 km/h | **DYNAMIC SPRINT CADENCE** |

---

## 4. How to Ingest Additional External Datasets

To import custom raw CSV data from SisFall, MobiFall, or your own test rides:

1. **Format CSV Input Columns**:
   `timestamp,ax,ay,az,gx,gy,gz,pitch,roll` (where acceleration is in $G$ or $m/s^2$ normalized to $1.0G = 9.80665 m/s^2$, and gyro is in $\text{deg}/s$).
2. **Execute Ingestion Pipeline**:
   Run the local deterministic script to generate canonical JSON files:
   ```bash
   python scripts/generate_benchmark_motion_datasets.py
   ```
3. **Push to Phone via ADB**:
   ```bash
   adb push apps/android_app/app/src/main/assets/motion_benchmarks/. /sdcard/Android/data/com.aistudio.rams.wkqmzb/files/RAMS_Training_Datasets/
   ```
4. **Inspect in App**:
   Open the **`EDGE AI`** tab in the RAMS mobile app or open the Developer Training Suite to inspect, label, and train the model.

