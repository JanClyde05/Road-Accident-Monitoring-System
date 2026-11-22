// Generates public/RAMS_Research_Paper.pdf  (run: node scripts/build-paper.mjs)
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "..", "public", "RAMS_Research_Paper.pdf");
const font = (n) => path.join(here, "fonts", n);

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 62, bottom: 62, left: 62, right: 62 },
  bufferPages: true,
  info: {
    Title: "RAMS: AI-Enabled Road Accident Monitoring and Rapid Rescue Dispatch (IMRAD draft)",
    Author: "[Authors]",
    Subject: "IECEP InnovateX 2026 research paper draft",
  },
});
doc.registerFont("body", font("DejaVuSerif.ttf"));
doc.registerFont("bold", font("DejaVuSerif-Bold.ttf"));
doc.registerFont("sans", font("DejaVuSans.ttf"));
doc.registerFont("sansBold", font("DejaVuSans-Bold.ttf"));
doc.registerFont("mono", font("DejaVuSansMono.ttf"));
doc.pipe(fs.createWriteStream(out));

const L = 62;
const W = doc.page.width - 124;
const INK = "#111111";
const PH = /(\[(?:INSERT|VERIFY)[^\]]*\])/g;
const isPH = (s) => /\[(?:INSERT|VERIFY)/.test(s);

function ensure(h) {
  if (doc.y + h > doc.page.height - doc.page.margins.bottom) doc.addPage();
}

function rich(text, o = {}) {
  const size = o.size ?? 9.3;
  const fnt = o.font ?? "body";
  const align = o.align ?? "justify";
  const x = o.x ?? L;
  const width = o.width ?? W;
  const parts = text.split(PH).filter(Boolean);
  ensure(size * 3);
  parts.forEach((p, i) => {
    const ph = isPH(p);
    doc.font(ph ? "sansBold" : fnt).fontSize(ph ? size - 0.9 : size).fillColor(ph ? "#9a5b00" : o.color ?? INK);
    const last = i === parts.length - 1;
    if (i === 0) doc.text(p, x, doc.y, { width, align, continued: !last, lineGap: 1.6 });
    else doc.text(p, { align, continued: !last, lineGap: 1.6 });
  });
  doc.fillColor(INK);
  doc.x = L;
  doc.moveDown(o.gap ?? 0.45);
}

const p = (t, o) => rich(t, o);

function h1(t) {
  ensure(50);
  doc.moveDown(0.7);
  doc.font("sansBold").fontSize(11.5).fillColor("#0a2a4a").text(t.toUpperCase(), L, doc.y, { width: W });
  const y = doc.y + 2;
  doc.moveTo(L, y).lineTo(L + W, y).lineWidth(0.8).strokeColor("#0a2a4a").stroke();
  doc.fillColor(INK);
  doc.moveDown(0.5);
  doc.x = L;
}
function h2(t) {
  ensure(36);
  doc.moveDown(0.3);
  doc.font("sansBold").fontSize(10).fillColor("#0a2a4a").text(t, L, doc.y, { width: W });
  doc.fillColor(INK);
  doc.moveDown(0.3);
  doc.x = L;
}
function h3(t) {
  ensure(28);
  doc.font("sansBold").fontSize(9).fillColor("#333").text(t, L, doc.y, { width: W });
  doc.fillColor(INK);
  doc.moveDown(0.2);
  doc.x = L;
}
function eq(t, label = "") {
  ensure(26);
  doc.font("mono").fontSize(8.8).fillColor("#0b1d33");
  const y = doc.y;
  doc.text(t, L + 20, y, { width: W - 70, align: "center" });
  if (label) doc.font("sans").fontSize(8.5).text(label, L + W - 40, y, { width: 40, align: "right" });
  doc.fillColor(INK);
  doc.x = L;
  doc.moveDown(0.5);
}
function bullets(items, o = {}) {
  const size = o.size ?? 9.3;
  items.forEach((t, i) => {
    ensure(size * 2.6);
    const y = doc.y;
    doc.font("sans").fontSize(size).fillColor("#0a2a4a").text(o.numbered ? `${i + 1}.` : "•", L + 6, y, { width: 16 });
    doc.y = y;
    rich(t, { x: L + 24, width: W - 24, size, gap: 0.2, align: "left" });
  });
  doc.moveDown(0.25);
}
function caption(t) {
  ensure(34);
  doc.font("sansBold").fontSize(8.4).fillColor("#0a2a4a").text(t, L, doc.y, { width: W });
  doc.fillColor(INK);
  doc.moveDown(0.25);
  doc.x = L;
}
function table(head, rows, widths, o = {}) {
  const size = o.size ?? 8;
  const pad = 4;
  const total = widths.reduce((a, b) => a + b, 0);
  const ws = widths.map((w) => (w / total) * W);
  const rowH = (cells, bold) =>
    Math.max(
      ...cells.map((c, i) => {
        doc.font(bold ? "sansBold" : "sans").fontSize(size);
        return doc.heightOfString(String(c), { width: ws[i] - pad * 2 }) + pad * 2;
      }),
    );
  const draw = (cells, bold, fill) => {
    const h = rowH(cells, bold);
    ensure(h + 2);
    const y = doc.y;
    let x = L;
    cells.forEach((c, i) => {
      if (fill) doc.rect(x, y, ws[i], h).fill(fill);
      doc.rect(x, y, ws[i], h).lineWidth(0.5).strokeColor("#9aa7b8").stroke();
      const ph = isPH(String(c));
      doc.font(bold ? "sansBold" : ph ? "sansBold" : "sans").fontSize(size).fillColor(bold ? "#ffffff" : ph ? "#9a5b00" : INK);
      doc.text(String(c), x + pad, y + pad, { width: ws[i] - pad * 2, lineGap: 0 });
      x += ws[i];
    });
    doc.y = y + h;
    doc.x = L;
  };
  draw(head, true, "#0a2a4a");
  rows.forEach((r, i) => draw(r, false, i % 2 ? "#f3f6fa" : null));
  doc.fillColor(INK);
  doc.moveDown(0.7);
}

/* ------------------------------------------------------------ title block */
doc.font("sansBold").fontSize(8).fillColor("#9a5b00").text("DRAFT FOR AUTHOR VERIFICATION · amber [INSERT]/[VERIFY] items must be replaced with your own measured data or confirmed facts", L, 62, { width: W, align: "center" });
doc.moveDown(0.8);
doc.font("sansBold").fontSize(16).fillColor("#0a2a4a").text(
  "RAMS: An AI-Enabled Road Accident Monitoring and Rapid Rescue Dispatch System Using Edge Sensor Fusion and Long-Range LoRa Telemetry",
  L,
  doc.y,
  { width: W, align: "center", lineGap: 2 },
);
doc.moveDown(0.7);
doc.font("sans").fontSize(9.5).fillColor(INK);
doc.text("[Presenter 1 Name]¹*, [Presenter 2 Name]¹, [Presenter 3 Name]¹, [Presenter 4 Name]¹, [Presenter 5 Name]¹", L, doc.y, { width: W, align: "center" });
doc.moveDown(0.2);
doc.text("Adviser: Engr. [Adviser Name], PECE²", L, doc.y, { width: W, align: "center" });
doc.moveDown(0.5);
doc.font("sans").fontSize(8).fillColor("#444");
doc.text("¹Student Researchers, Department of Electronics Engineering, College of Engineering, Cagayan State University – Carig Campus, Tuguegarao City, Cagayan, Philippines", L, doc.y, { width: W, align: "center" });
doc.text("²Faculty Research Adviser, same department and campus", L, doc.y, { width: W, align: "center" });
doc.text("*Corresponding author: [email]  ·  Repository: https://github.com/JanClyde05/Road-Accident-Monitoring-System", L, doc.y, { width: W, align: "center" });
doc.fillColor(INK);
doc.moveDown(0.8);

/* --------------------------------------------------------------- abstract */
h1("Abstract");
p(
  "Road traffic crashes kill about 1.19 million people each year worldwide [1], and the time between a crash and the arrival of rescuers is a modifiable part of the outcome, especially on rural roads with weak cellular coverage. Impact detectors built on a single fixed acceleration threshold are also prone to false alarms on potholes and speed bumps. This paper presents RAMS, a three-tier system for detecting road crashes and alerting rescuers. A wearable relay node built on a custom printed circuit board (PCB) combines an ESP32-S3FH4R2 microcontroller, an MPU-6050 inertial measurement unit sampled at 100 Hz, a GNSS receiver and a 433 MHz SX1278 LoRa radio, and runs a freefall–impact–rest–latch state machine with a 30-second cancellation window. An Android companion app classifies 50 Hz six-axis motion windows using 14 kinematic features and a dual-tier edge model (a 1D convolutional neural network feature extractor and a small language-model reasoner), with explicit rules that suppress potholes, stationary drops, pocket vibration and pedestrian gait. Alerts travel by LoRa to a base station with store-and-forward storage and then to a Windows command center with a live map, accident hotspot clustering and an offline-capable incident brief. Hardware progressed from a self-fabricated Alpha board to a Rev C PCB designed to DOST-ASTI EPDC manufacturing rules. On the held-out test set the classifier achieved an accuracy of [INSERT %] and a macro F1-score of [INSERT], and reduced false alarms by [INSERT %] relative to a fixed-threshold baseline over [INSERT N] rough-road trials. End-to-end alert latency was [INSERT s ± s] and LoRa packet delivery was [INSERT %] at [INSERT m].",
);
doc.font("sansBold").fontSize(8.6).text("Keywords: ", L, doc.y, { continued: true, width: W });
doc.font("sans").text("road accident detection; edge AI; sensor fusion; IMU; LoRa; custom PCB design; emergency dispatch", { width: W });
doc.moveDown(0.4);

/* ----------------------------------------------------------- introduction */
h1("I. Introduction");
h2("1.1 Problem and research objectives");
p(
  "According to the World Health Organization, road traffic injuries cause approximately 1.19 million deaths annually and are the leading cause of death among people aged 5–29 years; the large majority of these deaths occur in low- and middle-income countries [1] [VERIFY exact low- and middle-income share quoted in the 2023 report]. For the Philippines, [INSERT verified national road-death figure, year and source from PSA or WHO; do not quote a number without its source] [2], and [INSERT verified statistic on motorcycle-rider casualties, with source].",
);
p(
  "Faster notification is a plausible way to reduce harm after a crash. The “golden hour” idea attributed to Cowley [3] is often used to motivate rapid response, but its evidence base has been questioned [4]. This paper therefore frames its motivation as shortening the detection-to-notification interval, not as a fixed survival cliff at 60 minutes. A rider who is unconscious, alone, at night or beyond cellular coverage may not be reported until a passer-by arrives.",
);
p(
  "Smartphone and IoT crash-notification systems have been studied for over a decade [5]–[9]. These studies describe accelerometer, gyroscope and GPS sensing, cloud notification, and, in later work, machine-learning classification. A recurring weakness of simple designs is the use of fixed thresholds that cannot separate a violent but harmless event, such as a pothole or a dropped device, from a real crash. A second weakness is dependence on mobile data for the alert path.",
);
p("The objectives of this study are to:", { gap: 0.2 });
bullets(
  [
    "design and fabricate a compact wearable relay node, progressing from a self-fabricated Alpha board to a Rev C production PCB;",
    "develop an edge classifier that separates crashes, falls and skids from potholes, bumps, drops and daily activity using inertial features;",
    "build an off-grid alert path (BLE to phone, LoRa to base station, USB or Wi-Fi to a command center) with a human cancellation option; and",
    "validate the system in terms of classification metrics, false-alarm reduction against a fixed-threshold baseline, LoRa delivery, location quality and end-to-end latency.",
  ],
  { numbered: true },
);
h2("1.2 Proposed solution and innovation");
p("RAMS (repository: JanClyde05/Road-Accident-Monitoring-System) connects four tiers: a rider-worn relay, a rider phone, a LoRa base station and a rescuer command center. The contributions are:", { gap: 0.2 });
bullets([
  "Dual-tier edge intelligence. A deterministic motion state machine on the wearable runs alongside a 1D-CNN and language-model reasoner on the phone, with explicit false-alarm suppression rules and three-window hysteresis.",
  "Off-grid alert path. A 433 MHz LoRa link with a LittleFS store-and-forward queue at the base station, plus an SMS and cloud fallback from the phone.",
  "Human-in-the-loop safeguards. A 30-second warning with a physical cancel button and an offline “Hey RAMS” voice cancel.",
  "Operational command center. Serial auto-detection, audible alerts, a Leaflet radar map, DBSCAN accident-hotspot zones and an incident brief that falls back to deterministic analysis when the local language model is offline.",
  "Documented hardware iteration from a self-fabricated Alpha prototype to a KiCad Rev C PCB built to DOST-ASTI EPDC rules.",
]);

/* ------------------------------------------------------------ methodology */
h1("II. Methodology");
h2("2.1 AI integration");
h3("A. Why AI instead of a single threshold");
p(
  "A pothole or speed bump can produce a short vertical acceleration spike of several g, which overlaps the peak of a low-energy crash. What differs is the pattern: after a pothole the vehicle recovers to an upright attitude quickly, while after a real crash the rider usually comes to rest at a large tilt with propulsion stopped. Features that capture shape, rotation and post-event posture can therefore separate the cases where a peak-only rule cannot.",
);
h3("B. Inputs and feature engineering");
p(
  "The phone samples the fused six-axis IMU at 50 Hz and processes sliding windows of 50 samples (1000 ms; 200 ms overlap as documented in the repository [VERIFY overlap and stride in code]). The wearable MPU-6050 runs its state machine at 100 Hz. For each window the pipeline computes 14 features: the mean, peak, minimum, standard deviation and RMS of the signal vector magnitude (SVM); the peak, mean and standard deviation of gyroscope magnitude; maximum and mean jerk; tilt delta; signal magnitude area; spectral energy; and zero-crossing rate. The key quantities are:",
  { gap: 0.2 },
);
eq("SVM_i = √( ax_i² + ay_i² + az_i² )", "(1)");
eq("Jerk_max = max_i ( |SVM_i − SVM_(i−1)| × f_s )", "(2)");
eq("Tilt Δ = |ΔPitch| + |ΔRoll|,  φ = atan2(ay, az),  θ = atan2(−ax, √(ay²+az²))", "(3)");
eq("SMA = (1/N) Σ_i ( |ax_i| + |ay_i| + |az_i| )", "(4)");
h3("C. Classification logic");
p(
  "A 1D-CNN kinematic feature extractor and a small language-model (SLM) reasoner form the two inference tiers on the phone [VERIFY layer sizes, parameter count, quantization and the exact role of the SLM in the code]. Their output is mapped to the taxonomy used by the firmware and command center: fall, skid, direct impact (severe collision), ground shock (rollover) and speed wobble. Table 1 lists the suppression rules documented in the repository. A state change needs three consecutive matching windows, while a verified crash latches immediately.",
);
caption("Table 1. False-alarm suppression rules (as documented in the repository)");
table(
  ["Case", "Condition", "Outcome"],
  [
    ["Pothole / speed bump", "Vertical spike up to 4.5 g, tilt Δ < 10°, immediate recovery", "Suppressed"],
    ["Stationary drop", "Drop shock up to 3.5 g at 0 km/h pre-event speed", "Suppressed"],
    ["Pocket tremor / hand shake", "High-frequency gyro tremor without vehicular speed", "Suppressed"],
    ["Pedestrian gait", "Cyclic ZCR 1.2–3.0 Hz with a 1.0 g baseline", "Suppressed"],
    ["Crash", "Peak above [VERIFY 4.5 g or 5.0 g: the repository text uses both] then rest at tilt > 45°", "Alert"],
  ],
  [24, 60, 16],
);
h3("D. Datasets and training protocol");
p(
  "Public datasets calibrate freefall, impact and rest signatures and supply negative examples: SisFall (4,510 trials, 38 subjects, 200 Hz) [10], MobiAct (3,200 trials, 67 participants) [11], UP-Fall [12], UCI HAR [13] and the IEEE DataPort road pothole and bump set [14]. These sets mostly record human falls and daily activity or road anomalies, not real crashes, so they are used for calibration and for negative classes only. The authors’ own dataset consists of [INSERT number of labelled windows per class, devices, riders and conditions]. The data were split [INSERT train/validation/test ratio and whether the split is by subject or session to prevent leakage], and [INSERT cross-validation scheme] was used. Hyperparameters and the training environment are [INSERT].",
);
h2("2.2 System development");
h3("A. Architecture");
table(
  ["Tier", "Hardware / software", "Role"],
  [
    ["Wearable relay", "Custom Rev C PCB: ESP32-S3FH4R2, MPU-6050 (100 Hz), ATGM336H GNSS, SX1278 LoRa, WS2812B LED, TP4054 charger, DW01A/FS8205A battery protection, cancel button", "Detect with freefall–impact–rest–latch state machine; 30 s warning; BLE to phone; LoRa uplink"],
    ["Rider phone", "Android (Kotlin, Jetpack Compose); BLE GATT 0xFFE0/0xFFE1; on-device speech recognizer", "Edge AI, GNSS, voice cancel, SMS and cloud fallback"],
    ["Base station", "ESP32-S3 + SX1278; USB serial (115200) and Wi-Fi TCP (port 8888); LittleFS queue", "Receive LoRa, store-and-forward, forward to command center"],
    ["Command center", "Windows app (C# .NET WebView2, React 19, Leaflet); Netlify web mirror", "Triage, alarms, map, hotspots, incident brief"],
  ],
  [17, 50, 33],
);
h3("B. Communication");
p(
  "The LoRa link uses 433 MHz, spreading factor 9, 125 kHz bandwidth, coding rate 4/5 and +17 dBm output power. Datasheet-level link budgets exceed 148 dB [16], [17], but these are manufacturer figures, not measurements of this system; measured range is reported in Section III. Alert and telemetry packets are packed binary structures defined in a shared C header so that wearable and base station stay consistent. If the local language model is unavailable, the desktop app falls back after a 2.0 s timeout to a deterministic rule-based incident brief.",
);
h3("C. Two-stage PCB evolution");
caption("Table 2. Hardware iterations");
table(
  ["Parameter", "Alpha (self-fabricated)", "Rev C (production)"],
  [
    ["Fabrication", "[VERIFY: in-house etching or milling method]", "KiCad design checked against DOST-ASTI EPDC rules; [VERIFY fabricator: the repository documents EPDC rules]"],
    ["Design rules", "[VERIFY]", "0.30 mm minimum track, 0.254 mm clearance, 0.40 mm drill, 0.95 mm via"],
    ["Packaging", "[VERIFY: module headers or breakout boards]", "Integrated ESP32-S3FH4R2; SMD parts"],
    ["Power", "[VERIFY]", "TP4054 charger; DW01A + FS8205A protection"],
    ["Layers", "[VERIFY]", "[VERIFY layer count from the KiCad file]"],
    ["Board size", "[INSERT mm × mm]", "[INSERT mm × mm]; reduction [INSERT %]"],
  ],
  [18, 38, 44],
);
h3("D. Experimental validation protocol");
p(
  "No test places a person in a destructive crash. The planned and recorded tests are: (i) bench impact, drop and tilt trials on a rig, [INSERT rig description, impact range in g, repetitions]; (ii) road trials with cruising, hard braking, cornering, speed bumps and potholes at [INSERT locations, vehicle type, speeds, number of trials]; (iii) a LoRa range test at [INSERT distances, line-of-sight conditions, packets sent]; (iv) latency measurement from synchronized timestamps at the wearable, base station and command center [INSERT method]; and (v) functional checks of the phone and command-center software recorded in the repository test log.",
);

/* ---------------------------------------------------------------- results */
h1("III. Results and Discussion");
h2("3.1 Results and validation");
p(
  "This draft intentionally contains no measured values for the experiments above, because none are recorded in the public repository. Replace each bracket with figures traceable to your logs. Metrics follow standard definitions:",
  { gap: 0.2 },
);
eq("Precision = TP/(TP+FP);  Recall = TP/(TP+FN);  F1 = 2·P·R/(P+R);  FPR = FP/(FP+TN)", "(5)");
caption("Table 3. Classification performance on the held-out test set");
table(
  ["Class", "Precision", "Recall", "F1", "Support"],
  [
    ["Normal / suppressed (daily motion, pothole, bump, drop)", "[INSERT]", "[INSERT]", "[INSERT]", "[INSERT]"],
    ["Fall", "[INSERT]", "[INSERT]", "[INSERT]", "[INSERT]"],
    ["Skid", "[INSERT]", "[INSERT]", "[INSERT]", "[INSERT]"],
    ["Collision", "[INSERT]", "[INSERT]", "[INSERT]", "[INSERT]"],
    ["Rollover", "[INSERT]", "[INSERT]", "[INSERT]", "[INSERT]"],
    ["Speed wobble", "[INSERT]", "[INSERT]", "[INSERT]", "[INSERT]"],
    ["Macro average / accuracy", "[INSERT]", "[INSERT]", "[INSERT]", "[INSERT total]"],
  ],
  [40, 15, 15, 15, 15],
);
p("A full confusion matrix should accompany Table 3 as a figure: [INSERT confusion matrix from test logs].");
caption("Table 4. False alarms: fixed-threshold baseline versus proposed classifier");
table(
  ["Method", "Rough-road trials", "False alarms", "FPR", "Inference time"],
  [
    ["Fixed G threshold ([INSERT threshold])", "[INSERT N]", "[INSERT]", "[INSERT]", "[INSERT]"],
    ["Proposed dual-tier classifier", "[INSERT N]", "[INSERT]", "[INSERT]", "[INSERT]"],
  ],
  [34, 18, 16, 14, 18],
);
caption("Table 5. Communication, location and latency");
table(
  ["Measure", "Result", "Conditions"],
  [
    ["LoRa packet delivery vs distance", "[INSERT % at each distance]", "[INSERT environment, antenna, power]"],
    ["Wearable to base-station latency", "[INSERT s ± s]", "[INSERT n]"],
    ["Alert to command-center map latency", "[INSERT s ± s]", "[INSERT n]"],
    ["GNSS time to first fix / position error", "[INSERT]", "[INSERT]"],
  ],
  [38, 28, 34],
);
p(
  "Functional checks recorded in the repository test log, all marked PASS there, include summoning the voice assistant from the home screen, rendering red hotspot zones with no pin markers on the radar map, showing a rider’s chronological incident history, and generating the offline deterministic incident brief in 0.18 s [VERIFY these are logged results from your own test run and cite the log file and date]. They show that features work. They are not accuracy evidence.",
);
h2("3.2 Impact, limitations and sustainability");
p(
  "RAMS addresses UN Sustainable Development Goals 3.6 (halve road-traffic deaths and injuries) and 11.2 (safe, affordable transport systems) [19]. A LoRa path can extend alert coverage where mobile data is unreliable, and accumulated incidents can feed hotspot analysis for local road-safety planning. Estimated unit cost is [INSERT bill-of-materials total, quantity and date] and sustainability depends on battery life of [INSERT h].",
);
h3("Limitations");
bullets([
  "LoRa range depends on terrain and line of sight; measured range is [INSERT m].",
  "Public datasets record falls, daily activity and road anomalies, not real crashes, so real-crash behavior is extrapolated [10]–[14].",
  "The wearable’s position on the body changes the signal; tested placements were [INSERT].",
  "Language-model outputs can be wrong. [VERIFY whether the SLM or LLM output can influence an alert decision; if so, describe the guard rails. The desktop incident brief should be advisory.]",
  "No destructive human-subject crash testing was performed.",
]);
h3("Ethics and privacy");
p(
  "Rider medical profiles and live location are personal and sensitive information under the Data Privacy Act of 2012 (Republic Act No. 10173) [18]. The system should collect only what is needed for dispatch, obtain informed consent, restrict access and protect stored profiles. The authors’ current implementation of these measures is [VERIFY: encryption, retention period, consent flow and access control actually implemented]. The 30-second warning with button and voice cancel gives the rider control over false alerts.",
);

/* ------------------------------------------------------------- conclusion */
h1("IV. Conclusion");
p(
  "RAMS combines a purpose-built wearable PCB, an edge classifier with explicit false-alarm rules, an off-grid LoRa alert path and a rescuer command center. The documented design addresses two weaknesses of simple crash detectors: false alarms from road anomalies and dependence on mobile data. The performance claims of this paper rest on the measurements entered in Tables 3 to 5 [INSERT one-sentence summary of the key measured results]. Future work includes collecting on-road data from real riding conditions, measuring range across terrain types and evaluating deployment with a local disaster-response office.",
);

/* ------------------------------------------------------------- references */
h1("V. References");
const refs = [
  "World Health Organization, Global Status Report on Road Safety 2023. Geneva, Switzerland: WHO, 2023. [Online]. Available: https://www.who.int/publications/i/item/9789240086517",
  "Philippine Statistics Authority, [VERIFY exact report title, table and year used for Philippine road-death statistics]. [Online]. Available: https://psa.gov.ph",
  "R. A. Cowley, “A total emergency medical system for the State of Maryland,” Maryland State Medical Journal, vol. 24, no. 7, pp. 37–45, Jul. 1975. [VERIFY on PubMed]",
  "E. B. Lerner and R. M. Moscati, “The golden hour: Scientific fact or medical ‘urban legend’?,” Academic Emergency Medicine, vol. 8, no. 7, pp. 758–760, Jul. 2001, doi: 10.1111/j.1553-2712.2001.tb00201.x.",
  "J. White, C. Thompson, H. Turner, B. Dougherty, and D. C. Schmidt, “WreckWatch: Automatic traffic accident detection and notification with smartphones,” Mobile Networks and Applications, vol. 16, no. 3, pp. 285–303, 2011, doi: 10.1007/s11036-011-0304-8.",
  "F. Bhatti, M. A. Shah, C. Maple, and S. U. Islam, “A novel Internet of Things-enabled accident detection and reporting system for smart city environments,” Sensors, vol. 19, no. 9, Art. no. 2071, May 2019, doi: 10.3390/s19092071.",
  "U. Alvi, M. A. K. Khattak, B. Shabir, A. W. Malik, and S. R. Muhammad, “A comprehensive study on IoT based accident detection systems for smart vehicles,” IEEE Access, vol. 8, pp. 122480–122497, 2020, doi: 10.1109/ACCESS.2020.3006887.",
  "M. Balfaqih, S. A. Alharbi, M. Alzain, F. Alqurashi, and S. Almilad, “An accident detection and classification system using Internet of Things and machine learning towards smart city,” Sustainability, vol. 14, no. 1, Art. no. 210, Dec. 2021, doi: 10.3390/su14010210.",
  "N. Kumar, D. Acharya, and D. Lohani, “An IoT-based vehicle accident detection and classification system using sensor fusion,” IEEE Internet of Things Journal, vol. 8, no. 2, pp. 869–880, Jan. 2021, doi: 10.1109/JIOT.2020.3008896.",
  "A. Sucerquia, J. D. López, and J. F. Vargas-Bonilla, “SisFall: A fall and movement dataset,” Sensors, vol. 17, no. 1, Art. no. 198, Jan. 2017, doi: 10.3390/s17010198.",
  "G. Vavoulas, C. Chatzaki, T. Malliotakis, M. Pediaditis, and M. Tsiknakis, “The MobiAct dataset: Recognition of activities of daily living using smartphones,” in Proc. ICT4AWE, 2016, pp. 143–151, doi: 10.5220/0005792401430151.",
  "L. Martínez-Villaseñor, H. Ponce, J. Brieva, E. Moya-Albor, J. Núñez-Martínez, and C. Peñafort-Asturiano, “UP-Fall detection dataset: A multimodal approach,” Sensors, vol. 19, no. 9, Art. no. 1988, Apr. 2019, doi: 10.3390/s19091988.",
  "D. Anguita, A. Ghio, L. Oneto, X. Parra, and J. L. Reyes-Ortiz, “A public domain dataset for human activity recognition using smartphones,” in Proc. ESANN, 2013. [VERIFY pages]",
  "IEEE DataPort, “Road pothole and bump dataset.” [VERIFY exact title, authors and DOI]. [Online]. Available: https://ieee-dataport.org/open-access/road-pothole-and-bump-dataset",
  "S. Kiranyaz, O. Avci, O. Abdeljaber, T. Ince, M. Gabbouj, and D. J. Inman, “1D convolutional neural networks and applications: A survey,” Mechanical Systems and Signal Processing, vol. 151, Art. no. 107398, Apr. 2021, doi: 10.1016/j.ymssp.2020.107398.",
  "A. Augustin, J. Yi, T. Clausen, and W. M. Townsley, “A study of LoRa: Long range & low power networks for the Internet of Things,” Sensors, vol. 16, no. 9, Art. no. 1466, Sep. 2016, doi: 10.3390/s16091466.",
  "InvenSense, MPU-6000/MPU-6050 Product Specification; Semtech, SX1276/77/78/79 Datasheet; Espressif Systems, ESP32-S3 Series Datasheet. [VERIFY document revisions and dates used]",
  "Republic of the Philippines, Republic Act No. 10173, “Data Privacy Act of 2012.” [VERIFY citation form, e.g., Official Gazette]",
  "United Nations General Assembly, Transforming our world: The 2030 Agenda for Sustainable Development, A/RES/70/1, 2015.",
  "[Authors], RAMS: Road Accident Monitoring System (source code and documentation). [Online]. Available: https://github.com/JanClyde05/Road-Accident-Monitoring-System [VERIFY access date and release/commit used]",
];
refs.forEach((r, i) => {
  ensure(26);
  const y = doc.y;
  doc.font("sans").fontSize(8).fillColor("#0a2a4a").text(`[${i + 1}]`, L, y, { width: 26 });
  doc.y = y;
  rich(r, { x: L + 28, width: W - 28, size: 8, align: "left", gap: 0.25 });
});

/* ------------------------------------------------------------- disclosure */
h1("VI. AI Use Disclosure");
p(
  "In line with the competition guideline on responsible use of generative AI [VERIFY section number against the official InnovateX 2026 guidelines], the authors disclose: (a) tools used: [INSERT every AI tool and version used, including any assistant used for this draft and for the presentation]; (b) purpose: [INSERT, e.g., outlining, language editing, code assistance for the presentation deck]; (c) extent: [INSERT]. The authors confirm that hardware design, firmware, data collection, experiments and all reported measurements are their own work, and that every reference and number was checked against its source before submission [confirm this statement only when it is true].",
);

/* --------------------------------------------------------------- appendix */
doc.addPage();
doc.font("sansBold").fontSize(12).fillColor("#9a1b1b").text("APPENDIX A · PRE-SUBMISSION CHECKLIST (REMOVE THIS PAGE BEFORE SUBMISSION)", L, 62, { width: W });
doc.fillColor(INK);
doc.moveDown(0.6);
p("This page lists what changed from the earlier draft and what only you can confirm. It is not part of the paper.", { gap: 0.4 });
h3("Corrections made to the earlier draft after reading the repository");
bullets([
  "Architecture. The earlier draft assumed ESP32 + GSM/LTE + Firebase and an in-vehicle node. The repository describes an ESP32-S3 wearable, BLE to an Android app, 433 MHz LoRa to a base station, and a C#/React desktop command center. The paper now follows the repository.",
  "Fabricator. The earlier draft said JLCPCB. The repository documents DOST-ASTI EPDC design rules for Rev C and does not mention JLCPCB. Table 2 flags this for you to confirm.",
  "Example metrics (for instance 96.4 % accuracy) were removed. The repository contains no measured accuracy figures, so every result is a placeholder.",
  "Reference [7] (Alvi et al.) had a wrong DOI in the earlier draft. The one used now, 10.1109/ACCESS.2020.3006887, was checked against Crossref.",
  "The YOLO reference was removed because no vision pipeline appears in the repository README.",
  "The unsourced claim of “over 11,000” Philippine road deaths per year was removed until you cite an exact source.",
  "The Cowley PMID from the earlier draft could not be confirmed and was dropped; the golden-hour caveat [4] was added.",
]);
h3("Items only you can confirm");
bullets([
  "Threshold: the repository text uses both 4.5 g and 5.0 g for crash peaks. State the value in the code.",
  "Model details: layer sizes, parameter counts, the SLM’s role and whether it can affect alerts.",
  "Window overlap and stride; whether wearable thresholds match the phone’s.",
  "Alpha board construction method; Rev C layer count, fabricator and board sizes.",
  "All results in Tables 3 to 5, with the number of trials behind each percentage.",
  "WHO low- and middle-income share and every Philippine statistic, against the primary source.",
  "Guideline section numbers cited for the competition (this tool could not open the IECEP document).",
  "DOIs and bibliographic details for the items marked [VERIFY] in the reference list.",
]);

/* ----------------------------------------------------------- footers */
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  const bottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc.font("sans").fontSize(7.5).fillColor("#667").text(
    `RAMS · IECEP InnovateX 2026 · CSU-Carig · DRAFT        Page ${i + 1} of ${range.count}`,
    L,
    doc.page.height - 40,
    { width: W, align: "center", lineBreak: false },
  );
  doc.page.margins.bottom = bottom;
}
doc.end();
console.log("wrote", out);
