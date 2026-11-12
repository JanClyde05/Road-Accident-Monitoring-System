#!/usr/bin/env python3
"""
RAMS Master AI Training & Knowledge Distillation Synthesizer (v3.2)
Target: Edge AI Cognition Suite for RAMS V2 Android App
Generates:
  1. apps/android_app/app/src/main/assets/rams_distilled_knowledge.jsonl (1,500+ canonical Q&A pairs)
  2. apps/android_app/app/src/main/assets/voice_wake_patterns.json (1,000+ acoustic & semantic intents)
  3. apps/android_app/app/src/main/assets/motion_benchmarks/ (100 synthetic 50Hz IMU benchmark sessions)
Zero-Emoji rule strictly enforced.
"""

import json
import os
import re
import sys
import math
import time
import random
from datetime import datetime

FILLER_WORDS = {
    "a", "an", "the", "is", "are", "was", "were", "what", "who", "where",
    "when", "why", "how", "can", "could", "do", "does", "did", "will",
    "would", "shall", "should", "may", "might", "must", "me", "my",
    "you", "your", "i", "we", "he", "she", "it", "they", "this", "that",
    "in", "on", "at", "to", "for", "of", "with", "by", "from", "up",
    "about", "into", "over", "after", "please", "tell"
}

def normalize_query_key(query: str) -> str:
    clean = re.sub(r'[^a-z0-9\s]', '', query.lower())
    tokens = [t for t in clean.split() if len(t) > 1 and t not in FILLER_WORDS]
    tokens.sort()
    return " ".join(tokens)

# ============================================================================
# 1. GENERATE DISTILLED KNOWLEDGE JSONL (1,500+ Canonical Q&A Pairs)
# ============================================================================
def generate_distilled_knowledge():
    print("\n[1/3] Generating Distilled Knowledge Dataset (rams_distilled_knowledge.jsonl)...")
    
    domain_templates = [
        # Domain 1: Crash Analysis & Biomechanics
        (
            [
                "what happens in a crash", "how does rams detect a fall", "how is crash detected",
                "crash detection mechanism", "fall detection threshold", "what g force is dangerous",
                "is 5g dangerous", "how many g is a motorcycle crash", "what is high side crash",
                "explain low side crash", "what is a frontal collision", "how does accelerometer detect collision",
                "what is jerk in crash analysis", "why is jerk important", "what is tilt threshold for fall",
                "how many degrees of tilt is a fall", "post crash stillness", "why check for stillness after impact",
                "concussion g force", "how much impact causes concussion", "helmet safety rating",
                "difference between dot and ece helmet", "how does helmet protect head", "whiplash injury in crash",
                "what happens during high speed slide", "what is motorcycle tank slapper", "how to recover from wobble",
                "how to survive a motorcycle crash", "what to do when falling off bike", "how to tuck and roll",
                "why do riders break collarbones", "is protective gear worth it", "does airbag vest help"
            ],
            [
                "In a motorcycle crash, RAMS evaluates a dual-tier kinematic pipeline: Tier 1 analyzes 50 Hertz acceleration magnitude and tilt delta, while Tier 2 SLM diagnostic reasoning verifies momentum cessation.",
                "RAMS detects a fall by identifying a sudden drop below 0.5 G (freefall/spill) followed by an impact spike exceeding 3.0 G and a persistent frame tilt delta exceeding 60 degrees.",
                "Crash detection combines linear acceleration from the accelerometer, angular rate from the gyroscope, and jerk rate exceeding 200 G per second.",
                "Human tolerance for lateral impacts is significantly lower than vertical impacts; accelerations exceeding 4.0 G on a motorcycle indicate severe physical collision.",
                "A 5G shock is dangerous; typical severe road collisions register between 4.0 G and 8.0 G, sufficient to cause structural helmet deformation and acute head trauma.",
                "Motorcycle crashes typically register between 3.5 G and 12.0 G depending on whether the incident is a low-side slide or a high-side launch.",
                "A high-side crash occurs when the rear tire loses traction, slides out, and abruptly regains grip, violently flipping the bike and rider over the high side.",
                "A low-side crash occurs when tires lose lateral grip through excessive lean or slick pavement, causing the motorcycle to slide out from under the rider onto its side.",
                "A frontal collision generates an instantaneous deceleration impulse along the longitudinal axis with extreme jerk exceeding 250 G per second.",
                "Accelerometers measure instantaneous specific force in three orthogonal axes; vector magnitude combined with angular tilt delta reveals sudden impact orientation.",
                "Jerk is the first time-derivative of acceleration (dG/dt). A sudden transition from 1.0 G to 5.0 G within 20 milliseconds produces extreme jerk characteristic of collision.",
                "Jerk differentiates real collisions from normal braking; hard emergency braking rarely exceeds 40 G/s, whereas physical collisions exceed 200 G/s.",
                "The tilt threshold for a motorcycle fall in RAMS is calibrated at 55 to 65 degrees from vertical, sustained over a 500 millisecond evaluation window.",
                "A tilt angle greater than 60 degrees while vehicle speed abruptly drops toward 0 km/h is classified as an unrecovered spill or fall.",
                "Post-crash stillness analysis observes whether kinematic movement drops below 0.05 G variance after impact, indicating an unconscious or immobilized rider.",
                "Evaluating stillness helps emergency dispatch gauge rider responsiveness and immediately elevate medical triage urgency.",
                "Concussions can occur at rotational accelerations above 3,000 rad/s squared or linear impacts exceeding 60 G at the skull interior.",
                "Even at moderate speeds (30 to 40 km/h), direct head impact against pavement without a certified helmet generates over 150 G of localized cranial force.",
                "ECE 22.06 and DOT FMVSS 218 are safety standards; ECE 22.06 includes rigorous multi-point impact and oblique rotational acceleration tests.",
                "ECE certified helmets undergo stricter testing than basic DOT certifications, incorporating multi-directional impact testing at varying energy levels.",
                "Helmets protect via an outer polycarbonate or composite shell that disperses point energy and an expanded polystyrene (EPS) liner that crushes to absorb deceleration.",
                "Whiplash occurs when severe rapid deceleration violently hyperextends and hyperflexes the cervical spine; maintaining posture and neck stabilization is critical.",
                "During a slide, keep your limbs close to your body to prevent flailing fractures and allow abrasion-resistant gear to dissipate kinetic friction smoothly.",
                "A tank slapper is a rapid, violent oscillation of the handlebars caused by front wheel misalignment; do not fight the bars, relax grip, and ease off throttle.",
                "To recover from speed wobble, relax your upper body, grip the tank firmly with your knees, maintain throttle neutrality, and avoid grabbing the front brake.",
                "If separation from the motorcycle is unavoidable, push away from the machine to avoid being trapped beneath hot engine parts or spinning wheels.",
                "When sliding, slide on your back or buttocks with boots pointed downstream to absorb secondary impacts and avoid rolling over repeatedly.",
                "Tucking your chin into your chest protects your cervical spine and prevents your helmet from catching on tarmac imperfections.",
                "Collarbone fractures frequently occur when riders brace falls with outstretched hands (FOOSH injury); impact force transmits up the arm to the clavicle.",
                "Certified protective gear with CE Level 2 armor reduces trauma severity by over 60 percent and virtually eliminates pavement abrasive degloving.",
                "Motorcycle airbag vests deploy within 25 milliseconds of collision detection, stabilizing the cervical spine, ribs, and thoracic vertebrae."
            ]
        ),
        # Domain 2: Sensor & Kinematics Telemetry
        (
            [
                "what is svm", "explain signal vector magnitude", "how to read g force",
                "what is baseline gravity", "why is stationary reading 1g", "what is zero crossing rate",
                "how does zero crossing detect walking", "what is gyro magnitude", "how does gyro measure tilt",
                "what is 50hz sampling", "why 50hz for imu", "what is imu calibration",
                "how to calibrate phone sensor", "what causes accelerometer drift", "how to eliminate false alarms",
                "what is pothole bounce", "how does rams know it is a pothole", "what is speed bump signature",
                "difference between speed bump and crash", "what is pocket shaking", "why phone shaking is not crash",
                "what is phone drop", "difference between dropped phone and crash", "what is sensor fusion",
                "how do accelerometer and gyroscope work together", "what is complementary filter",
                "what is kalman filter in kinematics", "how does gps speed assist imu", "why gps alone is insufficient"
            ],
            [
                "Signal Vector Magnitude (SVM) is the Euclidean norm of tri-axial acceleration: square root of ax squared plus ay squared plus az squared, normalized in G.",
                "SVM computes total instantaneous acceleration regardless of phone mounting orientation, allowing invariant kinematic analysis whether phone is mounted or in pocket.",
                "Baseline gravity is 1.0 G (9.81 m/s squared) directed toward Earth's center; when stationary upright, the vertical axis measures exactly 1.0 G.",
                "A stationary sensor reads 1.0 G because Earth's gravitational pull exerts 1.0 G upward normal force against the internal MEMS proof mass.",
                "Zero-crossing rate measures how frequently acceleration oscillates across the 1.0 G baseline, serving as a primary metric for human cyclic gait frequency.",
                "Walking produces rhythmic zero-crossing rates between 1.2 Hz and 2.2 Hz as each footstep alternately loads and unloads body weight.",
                "Gyroscope magnitude is the Euclidean norm of angular velocity across pitch, roll, and yaw axes in degrees per second.",
                "Integrating three-axis angular rates over time with an accelerometer gravity vector complementary filter yields absolute roll and pitch orientation angles.",
                "50 Hertz sampling captures sensor telemetry every 20 milliseconds, providing high temporal resolution without excessive battery drain or processor thermal throttling.",
                "50 Hertz satisfies the Nyquist criterion for vehicular dynamics and human biomechanics, whose frequency components rarely exceed 20 Hertz.",
                "IMU calibration establishes the static zero-offset bias of gyroscope axes and normalizes the accelerometer 1.0 G gravity vector at rest.",
                "To calibrate, place your phone on a flat, stable surface in Settings > IMU Calibration and tap Calibrate Baseline while stationary for 3 seconds.",
                "MEMS sensor drift is caused by microscopic thermal fluctuations, mechanical package stress, and cumulative numerical integration errors.",
                "RAMS eliminates drift by relying on windowed differential metrics (tilt delta, jerk, SVM standard deviation) rather than open-loop position integration.",
                "A pothole bounce produces a sharp vertical shock (2.5 to 5.0 G) lasting under 60 milliseconds, with zero persistent tilt angle change and continuous forward speed.",
                "RAMS suppresses pothole alarms because frame posture remains upright (<8 degrees tilt delta) and vehicle speed does not drop to zero.",
                "Speed bumps produce smooth, symmetrical sinusoidal vertical deflection between 1.6 G and 3.4 G without high-frequency shock or frame roll.",
                "Speed bumps lack the high jerk (>200 G/s) and severe angular tipping characteristic of real accidents; forward motion continues immediately.",
                "Pocket shaking generates high angular rates (>120 deg/s) but low linear acceleration variance (<0.7 G) with zero vehicular displacement speed.",
                "Phone shaking in hand or pocket is suppressed by verifying vehicular momentum; at 0 km/h, hand turbulence is classified as everyday activity.",
                "A dropped phone exhibits a zero-G freefall phase (<0.2 G) followed by a brief acoustic slap (2.0 to 4.5 G) while stationary at 0 km/h.",
                "RAMS suppresses dropped phone alarms by confirming zero vehicular speed prior to impact and absence of sustained post-impact deceleration.",
                "Sensor fusion merges linear data from the accelerometer with rotational rates from the gyroscope to maintain drift-free attitude and heading estimation.",
                "Accelerometers provide long-term gravitational reference while gyroscopes provide rapid transient responsiveness without linear shock sensitivity.",
                "A complementary filter applies a high-pass filter to the integrated gyroscope angle and a low-pass filter to accelerometer gravity, blending both cleanly.",
                "Kalman filters dynamically estimate state uncertainties, weighting high-frequency gyro agility against low-frequency accelerometer orientation.",
                "GPS speed provides independent pre-crash momentum context; an impact occurring above 25 km/h followed by 0 km/h indicates a catastrophic vehicular stop.",
                "GPS alone is insufficient because 1 Hz updates cannot capture 20ms crash impulses, and satellite reception is blocked in tunnels, canyons, or urban corridors."
            ]
        ),
        # Domain 3: First Aid & Emergency Protocols
        (
            [
                "first aid crash", "what to do when rider crashes", "should i remove helmet after accident",
                "how to remove helmet safely", "when to remove helmet", "how to stop heavy bleeding",
                "how to use a tourniquet", "where to apply tourniquet", "cpr on motorcycle rider",
                "cpr ratio", "how many chest compressions", "what is recovery position",
                "when to use recovery position", "signs of internal bleeding", "signs of concussion",
                "what is shock in trauma", "how to treat shock", "broken arm first aid",
                "road rash treatment", "how to clean road rash", "emergency hotline tuguegarao",
                "call ambulance tuguegarao", "pnp hotline tuguegarao", "cvmc emergency number",
                "how to treat burns from exhaust", "first degree exhaust burn", "deep puncture wound first aid",
                "rider impaled by object", "how to handle seizure after crash", "treating ocular injury helmet visor"
            ],
            [
                "In a crash: first secure the scene to prevent secondary collisions, call emergency 911 or local rescue, check rider responsiveness, and never move the neck.",
                "NEVER remove an injured rider's helmet unless their airway is blocked or they are not breathing, to prevent irreversible cervical spinal cord severance.",
                "If helmet removal is strictly necessary due to airway obstruction, it requires two responders: one stabilizing the cervical spine while the other carefully expands the helmet sides.",
                "Only remove a helmet if the patient is in respiratory arrest or vomiting inside the visor, using strict manual in-line spinal stabilization.",
                "To stop heavy arterial bleeding, apply firm, continuous direct pressure with a clean sterile cloth; if bleeding persists on a limb, apply a commercial tourniquet.",
                "Apply a tourniquet 2 to 3 inches above the bleeding wound on a single-bone limb section (upper arm or thigh), never directly over a joint.",
                "Tighten the tourniquet windlass until arterial bleeding stops and the distal pulse disappears, then note the exact application time on the patient's forehead.",
                "Perform CPR if the rider is unresponsive and not breathing normally: 30 chest compressions followed by 2 rescue breaths at a rate of 100 to 120 per minute.",
                "The adult CPR ratio is 30 chest compressions to 2 rescue breaths; push hard and fast in the center of the chest to a depth of 2 inches (5 cm).",
                "Compress the chest at 100 to 120 beats per minute, allowing complete chest recoil between each compression.",
                "The recovery position places an unconscious breathing patient on their side to maintain an open airway and prevent choking on vomit or fluids.",
                "Use the recovery position only if there is NO suspected cervical spine injury and the patient is breathing independently.",
                "Signs of internal bleeding include a rigid abdominal wall, rapid weak pulse, cold clammy skin, dizziness, and bruising over the flanks or abdomen.",
                "Concussion signs include dizziness, confusion, unequal pupil dilation, nausea, retrograde amnesia, ringing in the ears, and sensitivity to light.",
                "Trauma shock is acute hypoperfusion where tissues receive insufficient oxygen; signs include rapid breathing, pale skin, blue lips, and altered consciousness.",
                "Treat shock by laying the patient flat with legs elevated 12 inches (if no spine or pelvic fracture), keeping them warm with a blanket, and giving no food or water.",
                "For a suspected fracture: immobilize the joint above and below the injury using a splint, apply cold packs wrapped in cloth, and do not attempt to realign the bone.",
                "Road rash is an abrasive friction burn: flush thoroughly with clean water or sterile saline to remove grit, apply antibiotic ointment, and cover with a non-adherent dressing.",
                "Clean road rash gently with mild soap and lots of clean running water; do not scrub aggressively with harsh alcohol as this destroys regenerating tissue.",
                "Tuguegarao City Rescue emergency dispatch hotline is (078) 304-1111 or mobile 0917-573-0911 for 24/7 medical response.",
                "For ambulance in Tuguegarao, call City Disaster Risk Reduction Management Office (CDRRMO) at (078) 304-1111 or PNP Emergency 911.",
                "Tuguegarao PNP Police Station hotline is 0917-573-0911 or (078) 844-1234 for immediate law enforcement assistance.",
                "Cagayan Valley Medical Center (CVMC) Emergency Room is located on Carig Sur highway, reachable at (078) 304-1410 or (078) 304-3789.",
                "Cool exhaust pipe burns immediately under cool running tap water for 10 to 15 minutes; do not apply ice, butter, or toothpaste.",
                "Cover first-degree thermal burns with sterile non-stick petroleum gauze; seek medical attention if blistering exceeds 2 inches across.",
                "For deep puncture wounds, do NOT remove any impaled object as it serves as a mechanical plug preventing fatal internal hemorrhaging.",
                "Stabilize an impaled object in place using bulky rolled dressings around the base until professional trauma surgical intervention is reached.",
                "If a post-crash seizure occurs, protect the rider's head from hard surfaces, do not restrain limbs, do not place anything in their mouth, and time the duration.",
                "For eye injuries from shattered visors or road debris, cover both eyes loosely with a rigid eye shield to prevent sympathetic eye movement damage."
            ]
        ),
        # Domain 4: Philippine Traffic Law & Compliance
        (
            [
                "what is ra 10054", "motorcycle helmet act", "is helmet required for passenger",
                "helmet fine philippines", "what is icc mark on helmet", "what is ps mark",
                "what is ra 10666", "children on motorcycle act", "can child ride motorcycle philippines",
                "what age can child ride motorcycle", "what is ra 10913", "anti distracted driving act",
                "can i use phone while driving", "is phone mount legal", "what is ra 10586",
                "drunk driving law philippines", "blood alcohol limit philippines", "what is ra 4136",
                "speed limit city street philippines", "speed limit highway philippines", "lto license code for motorcycle",
                "lto code for car", "penalty for driving without license", "penalty for expired registration",
                "is loud exhaust illegal philippines", "decibel limit motorcycle exhaust", "lto modified parts rules",
                "is lane splitting legal in philippines", "penalty for counterflow", "can mmda confiscate license"
            ],
            [
                "Republic Act 10054 is the Motorcycle Helmet Act of 2009, mandating standard protective motorcycle helmets for all drivers and backriders at all times.",
                "Under RA 10054, both the driver and passenger must wear compliant helmets; failure to wear a helmet incurs a fine of ₱1,500 for the first offense.",
                "Passengers are strictly required by law to wear standard helmets; carrying an unhelmeted passenger is a direct violation of RA 10054.",
                "Fines under RA 10054: ₱1,500 for 1st offense, ₱3,000 for 2nd offense, ₱5,000 for 3rd offense, and ₱10,000 plus license revocation for 4th offense.",
                "The Import Commodity Clearance (ICC) sticker certifies that an imported helmet passed DTI mechanical and penetration impact testing.",
                "The Philippine Standard (PS) mark certifies that a locally manufactured helmet complies with Bureau of Product Standards safety guidelines.",
                "Republic Act 10666 is the Children's Safety on Motorcycles Act of 2015, regulating the transport of children on two-wheeled motor vehicles.",
                "Under RA 10666, it is unlawful to transport a child on a motorcycle on public roads where speed exceeds 60 km/h or heavy traffic exists.",
                "A child may only ride a motorcycle if their feet can comfortably reach the foot pegs, their arms can reach around the driver's waist, and they wear an ICC helmet.",
                "There is no strict minimum age in RA 10666, but the physical requirement requires reaching foot pegs and holding the driver's waist securely.",
                "Republic Act 10913 is the Anti-Distracted Driving Act, prohibiting mobile phone usage and electronic devices while a motor vehicle is in motion or stopped at a red light.",
                "Under RA 10913, holding a phone to text or call while driving is illegal; hands-free calls using earphones or Bluetooth are permitted.",
                "Phone mounts are legal provided the device is mounted within the vehicle's safe zone (below the dash line) and does not obstruct the driver's direct field of view.",
                "Using a mounted phone for navigation is allowed if the destination is set before moving; interacting with the screen while driving is prohibited.",
                "Republic Act 10586 is the Anti-Drunk and Drugged Driving Act of 2013, criminalizing driving under the influence of alcohol or dangerous drugs.",
                "Under RA 10586, professional drivers and motorcycle riders have a zero blood alcohol tolerance (0.00% BAC); non-professionals have a 0.05% BAC limit.",
                "Penalties under RA 10586 range from ₱20,000 to ₱500,000 plus imprisonment if the offense results in physical injuries or homicide.",
                "Republic Act 4136 is the Land Transportation and Traffic Code of the Philippines, establishing the fundamental rules of the road and registration.",
                "Under RA 4136, speed limits on city and municipal streets are typically 30 km/h, crowded school zones are 20 km/h, and open highways are 80 km/h.",
                "The maximum legal speed on open rural highways for passenger cars and motorcycles is 80 km/h; trucks and buses are limited to 50 km/h.",
                "The LTO Driver's License code for two-wheeled motorcycles is Code A (formerly Restriction Code 1); tricycles require Code A1.",
                "The LTO Driver's License code for passenger cars and light vehicles up to 5,000 kg GVW is Code B (formerly Restriction Code 2).",
                "Driving without a valid driver's license carries a fine of ₱3,000 under LTO Joint Administrative Order No. 2014-01.",
                "Operating an unregistered or expired vehicle registration carries a fine of ₱10,000 plus vehicle impoundment until registration fees are settled.",
                "Under LTO rules and local ordinances, open or modified exhaust mufflers exceeding 99 decibels measured at 0.5 meters are strictly illegal.",
                "The maximum legal sound emission limit for motorcycle exhaust pipes under LTO guidelines is 99 decibels at half of rated engine RPM.",
                "Handlebar and chassis modifications that compromise structural rigidity or exceed standard width guidelines without LTO inspection are non-compliant.",
                "Lane splitting or lane filtering between moving traffic lanes is officially prohibited under LTO Administrative Order AHS-2008-015.",
                "Counterflowing (driving against the designated traffic flow) carries fines up to ₱2,000 under LTO rules plus driver's license suspension.",
                "Traffic enforcers cannot confiscate your physical driver's license unless authorized under specific local ordinances or LTO-deputized violations."
            ]
        ),
        # Domain 5: Tuguegarao Tricycle Ordinance & Anti-Overcharge
        (
            [
                "tricycle fare tuguegarao", "how much is tricycle fare in tuguegarao", "what is base fare for tricycle",
                "tricycle fare per kilometer", "student discount tricycle tuguegarao", "senior citizen fare tricycle",
                "pwd fare tricycle", "what is ordinance 50 09 2022", "is special trip required",
                "can tricycle driver charge 50 pesos", "driver asking 100 pesos for tricycle", "what is capacity scam",
                "how to report overcharging tricycle", "poso tuguegarao hotline", "tricycle fare to sm tuguegarao",
                "tricycle fare to cvmc", "tricycle fare to airport", "tricycle fare to csu carig",
                "can driver refuse passenger", "is colorum tricycle illegal", "what is yellow plate tricycle",
                "penalty for overcharging tricycle driver", "can tricycle enter maharlika highway",
                "are tricycles allowed on national highways", "operating hours for tricycles tuguegarao"
            ],
            [
                "Under Tuguegarao City Ordinance No. 50-09-2022, regular tricycle base fare is ₱12.00 for the first 2.0 kilometers, plus ₱2.00 for each succeeding kilometer.",
                "The legal tricycle fare in Tuguegarao City is ₱12.00 base for regular passengers and ₱10.00 for students, seniors, and PWDs within the first 2 km.",
                "Base fare covers the first 2.0 kilometers from pickup point; distances beyond 2.0 km incur an additional ₱2.00 per kilometer.",
                "Students with valid school ID are entitled to a 20 percent discount, making the base fare ₱10.00 instead of ₱12.00.",
                "Senior citizens and PWDs with valid identification are legally entitled to 20 percent statutory discount: ₱10.00 base fare plus ₱1.60 per succeeding kilometer.",
                "City Ordinance No. 50-09-2022 is the enacted tricycle fare structure governing all public utility tricycles operating within Tuguegarao City.",
                "Special trips (chartered) are NOT mandatory for solo passengers along regular routes; drivers cannot force a commuter into a special fare.",
                "Demanding ₱50 or ₱100 for a regular commuter ride is an overcharge violation under City Ordinance 50-09-2022 unless it is an explicitly agreed out-of-boundary chartered trip.",
                "The capacity scam occurs when a driver demands solo commuters pay for the entire sidecar capacity (4 seats). This is strictly illegal under City Ordinance 50-09-2022.",
                "If a tricycle driver attempts to overcharge, note their 4-digit body number and report them to POSO or the City Mayor's Office.",
                "Report overcharging drivers to Public Order and Safety Office (POSO) Tuguegarao at (078) 304-1111 or file a formal complaint at City Hall.",
                "Regular fare from Centro to SM City Tuguegarao (approx. 2.5 km) is legally ₱13.00 for regular passengers (₱12 base plus ₱1 succeeding fraction).",
                "Fare from Centro to CVMC Hospital (approx. 5.0 km) is legally ₱18.00 regular (₱12 base for 2km plus ₱6 for 3 succeeding km).",
                "Fare from Centro to Tuguegarao Airport (approx. 4.0 km) is legally ₱16.00 regular (₱12 base plus ₱4 for 2 succeeding km).",
                "Fare from Centro to CSU Carig Campus (approx. 5.5 km) is legally ₱19.00 regular, or ₱15.00 for students presenting their ID.",
                "Refusing passengers along regular route lines is a franchise violation subject to fine and possible suspension by the Sangguniang Panlungsod.",
                "Colorum (unregistered/unfranchised) tricycles without valid MTOP are illegal and subject to impoundment and a ₱2,500 fine.",
                "Legitimate Tuguegarao public tricycles carry official city body numbers stenciled on the sidecar and display an official MTOP seal.",
                "Overcharging tricycle drivers face a fine of ₱1,000 for the first offense, ₱2,000 for the second offense, and franchise cancellation for the third offense.",
                "Under DILG Memorandum Circular 2020-036, tricycles are prohibited on national highways unless no alternative bypass or local route exists.",
                "Tricycles along Maharlika Highway must use designated outer service lanes where provided by local city traffic management.",
                "Public tricycles in Tuguegarao operate 24 hours, but night trips along remote barangays may have mutually agreed fare arrangements."
            ]
        ),
        # Domain 6: Tuguegarao Spatial Landmarks & Navigation
        (
            [
                "where is sm city tuguegarao", "how to get to sm city", "where is robinsons tuguegarao",
                "how to get to robinsons", "where is csu carig", "where is csu andrews",
                "where is buntun bridge", "what is longest river bridge", "where is tuguegarao airport",
                "where is cagayan valley medical center", "where is saint peter cathedral", "where is provincial capitol",
                "where is uslt", "university of saint louis tuguegarao", "where is tuguegarao public market",
                "where is brickstone mall", "where is mall of the valley", "distance from centro to carig",
                "distance from centro to sm", "distance from airport to centro", "where is san jacinto church",
                "where is dost regional office", "where is dpwh regional office 02", "where is cagayan national high school"
            ],
            [
                "SM City Tuguegarao is located along Bagay Road in Barangay Caritan Norte, approximately 2.5 kilometers northwest of Centro.",
                "To reach SM City Tuguegarao from Centro, head north along Rizal Avenue, turn left onto Bagay Road, and proceed 1.5 km west.",
                "Robinsons Place Tuguegarao is located along Maharlika Highway in Barangay Tanza, approximately 3.0 kilometers southeast of Centro.",
                "To reach Robinsons Place from Centro, follow Maharlika Highway southbound toward San Gabriel and Tanza.",
                "Cagayan State University Carig Campus is situated along the regional government center corridor in Barangay Carig Sur, 5.5 km north of Centro.",
                "CSU Andrews Campus is the historic urban campus located in Barangay Centro 08 along Caritan highway near Luna Street.",
                "Buntun Bridge spans the Cagayan River connecting Tuguegarao City to Solana, located 4.2 km west along the Santiago-Tuguegarao road.",
                "Buntun Bridge is the second-longest bridge in the Philippines at 1,124 meters, offering panoramic views of the Cagayan River basin.",
                "Tuguegarao Domestic Airport (TUG) is located in Barangay Pengue-Ruyu, approximately 4.0 kilometers east of Centro via Airport Road.",
                "Cagayan Valley Medical Center (CVMC) is the regional tertiary hospital located along Maharlika Highway in Barangay Carig Sur, 5.0 km north.",
                "Saint Peter and Paul Metropolitan Cathedral is the historic 18th-century brick church situated at Rizal Avenue corner Gomez Street in Centro.",
                "The Provincial Capitol of Cagayan is located inside the regional government center complex in Barangay Carig Sur.",
                "University of Saint Louis Tuguegarao (USLT) is located in Barangay Ugac Norte along Mabini Street, 1.8 km southwest of Centro.",
                "Tuguegarao City Public Market and Commercial Center is located in Centro 05 bounded by Luna, Bonifacio, and Gomez streets.",
                "Brickstone Mall is located along Pengue-Ruyu road near the Tuguegarao City Hall annex, 2.8 km east of Centro.",
                "Mall of the Valley is an urban shopping hub located in Centro along Balzain Highway near the Buntun intersection.",
                "The road distance from Centro (Cathedral) to Carig Government Center is approximately 5.5 kilometers via Maharlika Highway.",
                "The road distance from Centro to SM City Tuguegarao along Bagay Road is approximately 2.5 kilometers.",
                "The distance from Tuguegarao Airport to Centro is approximately 4.0 kilometers, taking roughly 12 to 15 minutes by vehicle.",
                "San Jacinto Ermita Church is a historic chapel built in 1604, located in Barangay San Jacinto along Mabini Street.",
                "DOST Regional Office No. 02 is located inside the regional government center in Barangay Carig Sur near the Provincial Capitol.",
                "DPWH Regional Office 02 is situated along the main Maharlika Highway corridor in Carig Sur, 5.2 km north of Centro.",
                "Cagayan National High School (CNHS) is located in Barangay San Gabriel along Bagay Road, 1.5 km west of Centro."
            ]
        ),
        # Domain 7: Mode Switching & Kinematic Classification
        (
            [
                "change to pedestrian", "switch to walk", "i want to walk",
                "change to car mode", "switch to car", "i will drive car",
                "change to motorcycle", "switch to motor", "ride my motorcycle",
                "change to bike mode", "switch to bicycle", "ride my bike",
                "what category am i in", "how does auto category work", "what is red light hold",
                "why did category not change", "can i manually set mode", "which mode is safest",
                "how does rams detect car", "difference between car and motorcycle detection",
                "can rams detect bicycle automatically", "why does bicycle mode need low speed"
            ],
            [
                "Switched to Pedestrian mode. Fall thresholds and motion classification are calibrated for walking and jogging.",
                "Pedestrian mode activated. Road hazard sensitivity adjusted for sidewalk and crosswalk vulnerability.",
                "Switched to Car Driver mode. Kinematic filters calibrated for automobile suspension and enclosed cabin dynamics.",
                "Car Driver mode active. G-force spike tolerances adjusted for automobile braking, cornering, and anti-roll stiffness.",
                "Switched to Motorcycle Rider mode. 50 Hertz lean angle analysis, high-G crash detection, and tilt sensing armed.",
                "Motorcycle Rider mode active. Lean angle thresholds set to 55 degrees; dual-tier impact and slide cognition fully armed.",
                "Switched to Bicycle mode. Kinematic filters calibrated for pedal cadence, bike lane vibration, and low-speed balance.",
                "Bicycle mode active. Pothole bounce and pedal oscillation filters enabled with 15 km/h nominal cruising baseline.",
                "You can verify your active category at any time by asking 'What mode am I in?' or checking the Profile banner.",
                "Automatic category classification analyzes 15 seconds of sustained kinematics: walking cadence activates Pedestrian; smooth >20 km/h cruising activates Car Driver.",
                "Red Light Hold prevents the AI from switching away from vehicle mode when stopped at intersections (<3 km/h), preserving your driving state.",
                "The AI will not auto-switch for 5 minutes after you manually adjust your category, honoring your explicit command.",
                "You can manually set mode anytime via voice ('RAMS I will walk', 'use my car') or through the user profile dropdown.",
                "Motorcycle Rider mode features the most aggressive crash detection thresholds due to exposed rider dynamics and lean angle kinematics.",
                "Car mode is detected when speed exceeds 20 km/h while lateral tilt delta remains under 6 degrees with low engine cabin vibration.",
                "Motorcycles exhibit dynamic roll leaning (15 to 45 degrees in turns) and higher road vibration variance, whereas cars remain flat upright.",
                "Bicycle detection identifies low cruising speeds (8 to 25 km/h) combined with cyclic pedaling frequencies (0.8 to 1.8 Hz zero crossings).",
                "Bicycle mode emphasizes lower speed thresholds because bicycle falls often occur at 10 to 20 km/h without high collision momentum."
            ]
        ),
        # Domain 8: Vehicle Dynamics & Maintenance
        (
            [
                "tire pressure for motorcycle", "what psi for motorcycle tire", "front tire pressure motorcycle",
                "rear tire pressure motorcycle", "how often to change motorcycle oil", "best oil for motorcycle",
                "how to check motorcycle chain", "motorcycle chain slack", "how often to lube chain",
                "brake pad thickness", "how to bleed motorcycle brakes", "when to replace motorcycle battery",
                "car tire pressure", "what is hydroplaning", "how to avoid hydroplaning",
                "following distance in car", "motorcycle braking technique", "front vs rear brake motorcycle",
                "what causes engine overheating", "how to check coolant level", "how to inspect spark plug",
                "signs of bad clutch", "symptoms of worn fork seals", "how to check tire tread depth"
            ],
            [
                "Standard motorcycle tire pressures are typically 28 to 30 PSI for the front tire and 32 to 36 PSI for the rear tire when measured cold.",
                "Under-inflated tires cause sluggish steering, rim damage, and overheating; over-inflated tires reduce the contact patch and grip.",
                "Front tire pressure should be checked weekly; cold pressure of 28 to 32 PSI ensures responsive turn-in and predictable front-end grip.",
                "Rear tire carries passenger and cargo weight; maintain 32 to 36 PSI to prevent uneven tire squaring and excessive heat buildup.",
                "Change motorcycle engine oil every 2,000 to 3,000 kilometers for mineral oils, or 4,000 to 5,000 km for full synthetic oils with filter replacement.",
                "Use JASO MA or MA2 certified 4-stroke oil for wet-clutch motorcycles (e.g. 10W-40); avoid automotive oils with friction modifiers that cause clutch slipping.",
                "Inspect chain tension weekly; proper drive chain slack is 20 to 30 millimeters measured at the midpoint between front and rear sprockets.",
                "Excessive chain slack can cause the chain to derail and lock the rear wheel; too tight slack strains transmission countershaft bearings.",
                "Clean and lubricate the motorcycle chain every 500 kilometers, or immediately after riding in heavy rain or mud, using dedicated O-ring chain lube.",
                "Replace brake pads when friction material thickness drops below 2.0 millimeters; never let pads wear down to the steel backing plate.",
                "Bleed brakes using DOT 3 or DOT 4 fluid as specified on the reservoir cap; ensure no air bubbles remain in the hydraulic caliper line.",
                "Motorcycle AGM batteries typically last 2 to 3 years; replace if terminal voltage drops below 12.4 Volts at rest or cranks sluggishly.",
                "Standard passenger car tire pressure is typically 32 to 35 PSI cold; check the placard on the driver-side door jamb for exact OEM specs.",
                "Hydroplaning occurs when a tire cannot disperse standing water faster than forward speed, causing it to ride on a water film with zero traction.",
                "Prevent hydroplaning by slowing down below 60 km/h in standing water, maintaining at least 3mm tire tread depth, and avoiding sudden steering inputs.",
                "Maintain a 3-second following distance behind vehicles in dry conditions; increase to 5 to 6 seconds on wet or gravel pavement.",
                "Use approximately 70 percent front brake and 30 percent rear brake on dry pavement; front brake does most stopping due to dynamic weight transfer.",
                "Apply front brake smoothly before squeezing firmly; never grab the front brake abruptly while leaned over in a corner to avoid front-end tuck.",
                "Engine overheating is caused by low engine oil, blocked radiator cooling fins, malfunctioning thermostat, or prolonged idle in extreme ambient heat.",
                "Check coolant level in the translucent expansion reservoir when the engine is completely cold; fluid should sit between Min and Max lines.",
                "Inspect spark plug insulator color: light tan or gray indicates optimal combustion, black carbon indicates rich fuel, and white blistered indicates lean running.",
                "A slipping clutch causes engine RPM to flare under throttle roll-on without corresponding vehicle acceleration, especially in higher gears.",
                "Leaking fork seals leave oily streaks on the chrome stanchions, contaminating front brake pads and severely compromising suspension damping.",
                "Check tire tread depth using the molded wear bar indicators (TWI); replace tires when remaining tread drops below 1.6 millimeters."
            ]
        ),
        # Domain 9: Weather & Environmental Hazards
        (
            [
                "is it safe to ride in the rain", "riding motorcycle in rain tips", "typhoon signal 1 motorcycle",
                "typhoon signal 2 rules", "riding on wet road", "how to handle paint markings in rain",
                "how to cross railroad tracks on motorcycle", "gravel on road safety", "riding in extreme heat",
                "dehydration symptoms while riding", "riding at night safety", "how to avoid glare at night",
                "riding in dense fog", "how to prevent helmet visor fogging", "crosswinds on bridges safety"
            ],
            [
                "Riding in the rain requires reducing speed by 25 to 30 percent, doubling following distance, and wearing certified waterproof gear with reflective strips.",
                "In rain, braking distances increase dramatically; apply brakes progressively, avoid sudden throttle roll-on, and keep the bike as upright as possible.",
                "Under PAGASA Typhoon Signal 1, winds reach 39 to 61 km/h; two-wheel riders should exercise extreme caution against sudden lateral crosswind gusts.",
                "Under Typhoon Signal 2 (winds 62 to 88 km/h), riding motorcycles or lightweight tricycles is extremely hazardous and should be postponed.",
                "Road pavement is most slippery during the first 15 minutes of rainfall as water mixes with accumulated engine oil and grease on the road surface.",
                "Avoid painted road lines and metal utility covers in the rain; wet thermoplastic paint has nearly zero friction coefficient compared to asphalt.",
                "Cross railroad tracks and road seams at a 90-degree perpendicular angle to prevent your front tire from catching in the track groove and sliding out.",
                "When encountering loose gravel, keep the motorcycle upright, maintain steady throttle without accelerating or braking, and look ahead through the patch.",
                "In Philippine tropical heat (>36°C), wear ventilated mesh riding jackets and drink 500ml of electrolyte-rich water every hour to prevent heatstroke.",
                "Dehydration causes cognitive fatigue, slow reaction time, and tunnel vision; stop in the shade immediately if you experience dry mouth or headache.",
                "Night riding reduces hazard recognition by 70 percent; ensure your LED headlight is aimed correctly and wear clear, un-tinted visors after dusk.",
                "To counter oncoming high-beam glare at night, look slightly toward the white fog line on the right shoulder rather than staring into oncoming lights.",
                "In dense fog, use low-beam yellow fog lights, reduce speed to visual reaction distance, and avoid using high beams that reflect off water droplets.",
                "Prevent visor fogging by installing a Pinlock anti-fog insert, cracking the visor bottom open slightly, or applying surfactant anti-fog spray.",
                "When crossing long exposed bridges like Buntun Bridge, lean slightly into the windward crosswind direction and keep a relaxed grip on the bars."
            ]
        ),
        # Domain 10: System Telemetry Diagnostics
        (
            [
                "show me my speed", "what is my current speed", "how fast am i moving",
                "what is my live g force", "show live telemetry", "is wearable connected",
                "what is wearable battery", "is gps locked", "how accurate is gps",
                "is crash detection armed", "run diagnostics", "system health check",
                "what is ping latency", "how does lora ping work", "what is the firmware version"
            ],
            [
                "Your current vehicle speed is monitored via GNSS at 1.5-second updates. View live telemetry on the Dashboard screen.",
                "Live speed telemetry is streaming from your GPS receiver; speed readings feed directly into Tier 1 crash momentum analysis.",
                "Live G-force is calculated at 50 Hertz from the tri-axial accelerometer vector magnitude; baseline resting gravity is 1.00 G.",
                "Telemetry displays live acceleration, tilt angle, angular velocity, and GPS speed updated continuously on-device.",
                "Wearable connectivity status is shown on the Wearable tab; pairing via BLE GATT provides dual-axis fall verification.",
                "Wearable battery percentage is transmitted via BLE telemetry packet; rechargeable via USB Type-C on the wristband module.",
                "GPS lock quality depends on line-of-sight satellite reception; high accuracy requires tracking at least 6 satellites.",
                "GPS accuracy is within 3 meters under open sky; emergency dispatch coordinates are continuously cached.",
                "All crash detection tiers are fully armed and monitoring 50 Hertz IMU kinematics on-device.",
                "System diagnostics show MEMS sensor streams active at 50 Hertz, GNSS position tracking nominal, and alarm sirens disarmed.",
                "Ping latency measures round-trip propagation time to the RAMS desktop gateway over 433 MHz LoRa radio or WebSocket sync.",
                "LoRa ping packet (PKT_PING = 7) benchmarks packet transit time and signal RSSI across long-distance telemetry propagation.",
                "Current wearable client firmware is RAMS-SAFETY-CLIENT v3.2 running on ESP32-S3 with FreeRTOS 50Hz sensor tasks."
            ]
        ),
        # Domain 11: Conversational Small Talk & Greetings
        (
            [
                "hello", "hi", "hey rams", "good morning", "good afternoon", "good evening",
                "kamusta", "kumusta ka", "salamat", "thank you", "bye", "goodbye",
                "who are you", "what is rams", "who made you", "what can you do",
                "are you an ai", "how smart are you", "do you need internet"
            ],
            [
                "Hello. RAMS edge intelligence is active and monitoring your kinematics. How can I assist your trip?",
                "Hi there. All safety tiers are operational. Ask me about road rules, fares, speed, or emergency protocols.",
                "Good day. I am tracking your telemetry in real time. Drive safely and let me know if you need assistance.",
                "Good morning. Visibility is clear. Check your tire pressure and mirrors before setting off.",
                "Good afternoon. Stay hydrated and keep a safe following distance in afternoon traffic.",
                "Good evening. Night visibility is reduced; ensure your headlights and reflective gear are active.",
                "Kumusta. Handa na ang RAMS safety system para sa iyong biyahe. Mag-ingat sa kalsada.",
                "Maayos ang aking system. Lahat ng sensors ay aktibo sa 50 Hertz. Ano ang maitutulong ko sa iyo?",
                "Walang anuman. Ang iyong kaligtasan sa kalsada ang aking prayoridad. Mag-ingat sa pagmamaneho.",
                "You are welcome. RAMS remains armed on-device for your protection. Have a safe journey.",
                "Goodbye. Drive safely, follow speed limits, and always wear your certified helmet.",
                "Paalam. Patuloy na susubaybayan ng RAMS ang iyong kaligtasan tuwing ikaw ay nasa kalsada.",
                "I am RAMS, the Road Accident Monitoring System, an offline-first on-device AI safety intelligence platform.",
                "RAMS is an embedded edge AI system designed to detect motorcycle accidents and protect commuters across Region 02.",
                "RAMS was developed by researchers for Tuguegarao City road safety, combining hardware IMU sensing with neural edge cognition.",
                "I can monitor crash kinematics at 50 Hertz, compute Tuguegarao tricycle fares, switch user modes, and provide emergency medical protocols.",
                "Yes, I operate using on-device edge neural models and distilled spatial heuristics optimized for zero-latency crash detection.",
                "My neural architecture processes 50Hz kinematic tensors locally and cross-references regulatory databases without external servers.",
                "No internet is required for core crash detection, telemetry monitoring, fare calculations, or emergency first aid cognition."
            ]
        ),
        # Domain 12: Negative Rejection & Guardrails
        (
            [
                "tell me a joke", "sing a song", "write an essay", "who will win the election",
                "how to hack", "can i ride without helmet", "is it okay to speed", "can i beat the red light",
                "can i ride while drunk", "where to buy drugs", "can i text while driving"
            ],
            [
                "I am specialized exclusively in road safety, telemetry, and commuter navigation. I do not generate jokes.",
                "My neural cognition is dedicated to crash detection and passenger protection. I cannot sing or play music.",
                "I am an edge safety intelligence engine focused on vehicular telemetry and first aid, not long-form text generation.",
                "I do not follow political opinions. My focus is strictly on road safety, kinematics, and legal compliance.",
                "I cannot assist with hacking or bypassing security systems. I am engineered exclusively for rider protection.",
                "No. Riding without a helmet violates Republic Act 10054 and dramatically increases your risk of fatal head trauma in a spill.",
                "No. Exceeding speed limits severely degrades your braking distance and maneuverability. Always obey posted speed limits.",
                "No. Beating a red light is a major cause of fatal intersection collisions. Come to a full, controlled stop on amber.",
                "No. Operating a vehicle under the influence of alcohol violates RA 10586 and exponentially increases crash probability.",
                "I cannot assist with illegal substances. I am strictly dedicated to road safety and medical emergency response.",
                "No. Texting while driving is strictly illegal under RA 10913 and takes your eyes off the road during critical hazard windows."
            ]
        )
    ]

    samples = []
    sample_id = 1
    now = int(time.time() * 1000)

    prefixes = [
        "", "can you tell me ", "please tell me ", "what is ", "explain ",
        "ano ang ", "paano ang ", "sabihin mo nga ", "paki explain ", "how do i "
    ]
    
    for domain_idx, (queries, answers) in enumerate(domain_templates):
        for q_idx, query in enumerate(queries):
            ans = answers[q_idx % len(answers)]
            key = normalize_query_key(query)
            if key:
                samples.append({
                    "query": query,
                    "normalizedKey": key,
                    "response": ans,
                    "timestamp": now - (sample_id * 1000),
                    "speedKmh": 0.0,
                    "userRole": "Motorcycle Rider",
                    "vehicleModel": "Standard Motorcycle",
                    "source": "RAMS-AutoTrain-Corpus-v3.2"
                })
                sample_id += 1

            for p in prefixes:
                if not p: continue
                var_q = f"{p}{query}".strip()
                var_key = normalize_query_key(var_q)
                if var_key and var_key != key:
                    samples.append({
                        "query": var_q,
                        "normalizedKey": var_key,
                        "response": ans,
                        "timestamp": now - (sample_id * 1000),
                        "speedKmh": 0.0,
                        "userRole": "Motorcycle Rider",
                        "vehicleModel": "Standard Motorcycle",
                        "source": "RAMS-AutoTrain-Corpus-v3.2"
                    })
                    sample_id += 1

    unique_samples = {}
    for s in samples:
        k = s["normalizedKey"]
        if k not in unique_samples:
            unique_samples[k] = s

    out_list = list(unique_samples.values())
    print(f"  Generated {len(out_list)} unique canonical Q&A pairs across 12 safety domains.")

    out_path = 'apps/android_app/app/src/main/assets/rams_distilled_knowledge.jsonl'
    with open(out_path, 'w', encoding='utf-8') as f:
        for s in out_list:
            f.write(json.dumps(s, ensure_ascii=False) + '\n')
    print(f"  Saved to {out_path} ({os.path.getsize(out_path) / 1024:.1f} KB)")
    return len(out_list)

# ============================================================================
# 2. EXPAND VOICE WAKE PATTERNS DATASET (1,000+ Acoustic/Intent Samples)
# ============================================================================
def expand_voice_wake_dataset():
    print("\n[2/3] Expanding Voice Wake & Semantic Intent Dataset (voice_wake_patterns.json)...")
    path = 'apps/android_app/app/src/main/assets/voice_wake_patterns.json'
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    vtd = data.get('voice_training_dataset', {})

    vtd['first_aid_extended'] = [
        "first aid for bleeding", "how to stop hemorrhage", "apply pressure to wound",
        "neck stabilization", "do not move helmet", "unconscious rider on road",
        "cpr chest compression rate", "mouth to mouth on rider", "splinting a broken limb",
        "treating road rash abrasions", "cooling road burns", "signs of internal trauma",
        "pupil dilation check", "hypovolemic shock treatment", "elevation of feet in shock",
        "calling ambulance immediately", "cervical collar alternative", "emergency blanket usage",
        "recovery position technique", "airway clearance maneuver"
    ]

    vtd['philippine_traffic_law_extended'] = [
        "ra 10054 fine amount", "penalty for no helmet passenger", "icc sticker verification",
        "dti approved motorcycle helmets", "ra 10666 child foot peg rule", "can child ride on gas tank",
        "ra 10913 mobile phone mount zone", "hands free calling while driving", "ra 10586 breathalyzer test",
        "legal blood alcohol concentration", "driving under influence of shabu", "penalty for drunk driving death",
        "ra 4136 speed limit rural highway", "speed limit municipal streets", "speed limit school zone 20kmh",
        "lto code a vs code a1", "lto restriction code 2 car", "driving without valid license fine",
        "driving unregistered motorcycle penalty", "impound rules for colorum"
    ]

    vtd['tuguegarao_landmarks_extended'] = [
        "sm city tuguegarao bagay road", "robinsons place tanza highway", "csu carig regional government center",
        "csu andrews campus caritan", "buntun bridge cagayan river", "cagayan valley medical center carig",
        "st peter and paul cathedral centro", "tuguegarao domestic airport pengue ruyu", "cagayan provincial capitol",
        "university of saint louis tuguegarao ugac", "cagayan national high school", "tuguegarao commercial center palengke",
        "brickstone mall pengue", "mall of the valley balzain", "san jacinto ermita church mabini",
        "dost regional office 02 carig", "dpwh regional office carig", "poso tuguegarao city hall",
        "city disaster risk reduction office", "balzain highway intersection"
    ]

    vtd['anti_overcharge_extended'] = [
        "ordinance 50 09 2022 regular fare 12 pesos", "succeeding kilometer rate 2 pesos",
        "student discount 10 pesos base fare", "senior citizen discount tricycle fare",
        "pwd passenger 20 percent discount", "capacity scam sidecar overcharge",
        "refusing passenger along route penalty", "charging 50 pesos for solo passenger illegal",
        "chartered special trip not mandatory", "reporting tricycle body number to poso",
        "poso traffic hotline 078 304 1111", "city mayor office tricycle complaint",
        "official tricycle fare matrix card", "four passenger capacity limit sidecar"
    ]

    vtd['kinematic_diagnostics_extended'] = [
        "svm 1g baseline upright", "zero crossing rate walking cadence", "gyro magnitude angular turn rate",
        "50 hertz imu sampling rate", "jerk rate collision indicator", "tilt delta 60 degrees fall threshold",
        "pothole bounce vertical spike", "speed bump sinusoidal deflection", "phone drop freefall signature",
        "pocket tremor high frequency agitation", "motorcycle lean angle limits", "emergency braking deceleration"
    ]

    vtd['maintenance_and_inspection'] = [
        "check front tire psi 28", "rear tire pressure 34 psi", "chain slack 25mm check",
        "change oil jaso ma2 10w40", "brake pad thickness 2mm", "coolant level check",
        "fork seal leak oil on chrome", "battery resting voltage 12v", "spark plug tan color",
        "clutch slip under acceleration", "hydroplaning over 60kmh", "twi tire wear indicator"
    ]

    data['voice_training_dataset'] = vtd

    total_entries = 0
    for key, val in data.items():
        if isinstance(val, dict):
            for subkey, subval in val.items():
                if isinstance(subval, list):
                    total_entries += len(subval)
        elif isinstance(val, list):
            total_entries += len(val)

    data['metadata'] = {
        "total_acoustic_samples": total_entries,
        "training_corpus_version": "3.2-Production",
        "last_updated": datetime.now().strftime("%Y-%m-%d"),
        "languages": ["English", "Tagalog", "Ilocano", "Taglish"],
        "intent_categories": len(vtd),
        "noise_rejection_samples": len(vtd.get('noise_rejection_samples', [])),
        "spatial_landmarks": len(data.get('tuguegarao_spatial_corpus', {}).get('landmarks', [])),
        "category_switch_commands": sum(
            len(v) for v in data.get('category_switch_commands', {}).values() if isinstance(v, list)
        )
    }

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"  voice_wake_patterns.json expanded to {total_entries} acoustic & semantic intent entries.")
    return total_entries

# ============================================================================
# 3. GENERATE MOTION BENCHMARK TIME-SERIES (100 Synthetic 50Hz Sessions)
# ============================================================================
def generate_motion_benchmarks():
    print("\n[3/3] Synthesizing 50Hz IMU Motion Benchmark Suite (motion_benchmarks/)...")
    out_dir = 'apps/android_app/app/src/main/assets/motion_benchmarks'
    os.makedirs(out_dir, exist_ok=True)

    scenarios = [
        ("FALL", 1, "POSITIVE", 42.0, 10),
        ("IMPACT", 1, "POSITIVE", 55.0, 10),
        ("SKIDDING", 1, "POSITIVE", 38.0, 10),
        ("POTHOLE", 0, "NEGATIVE", 35.0, 10),
        ("SPEED_BUMP", 0, "NEGATIVE", 20.0, 10),
        ("PHONE_FALLING", 0, "NEGATIVE", 0.0, 10),
        ("PHONE_SHAKING", 0, "NEGATIVE", 0.0, 10),
        ("WALKING", 0, "NEGATIVE", 4.5, 10),
        ("RUNNING", 0, "NEGATIVE", 10.5, 10),
        ("NORMAL_VEHICLE_RIDE", 0, "NEGATIVE", 45.0, 10)
    ]

    total_files = 0
    now_ms = int(time.time() * 1000)

    for class_type, is_accident, category, speed, num_files in scenarios:
        for i in range(1, num_files + 1):
            session_id = f"BM-{class_type}-{i:02d}"
            file_name = f"benchmark_{class_type.lower()}_{i:02d}.json"
            file_path = os.path.join(out_dir, file_name)

            raw_samples = []
            sum_svm = 0.0
            sum_svm_sq = 0.0
            max_svm = 0.0
            min_svm = 999.0
            max_gyro = 0.0
            sum_gyro = 0.0
            max_jerk = 0.0
            sum_jerk = 0.0
            prev_svm = -1.0
            zero_crossings = 0

            for s_idx in range(50):
                rel_time = s_idx * 20
                t_sec = rel_time / 1000.0

                if class_type == "FALL":
                    if s_idx < 15:
                        ax, ay, az = 0.05 + random.uniform(-0.02, 0.02), 0.08, 0.98
                        gx, gy, gz = random.uniform(-1, 1), random.uniform(-1, 1), 0.5
                    elif s_idx < 22:
                        ax, ay, az = 0.1, 0.1, 0.25 + random.uniform(-0.05, 0.05)
                        gx, gy, gz = 120.0 + i * 2.0, 80.0, 45.0
                    elif s_idx < 28:
                        ax, ay, az = 2.5, 3.2, 5.5 + random.uniform(-0.5, 1.2)
                        gx, gy, gz = 350.0 + i * 5.0, 220.0, 180.0
                    else:
                        ax, ay, az = 0.95, 0.1, 0.12
                        gx, gy, gz = 0.1, 0.1, 0.0

                elif class_type == "IMPACT":
                    if s_idx < 20:
                        ax, ay, az = 0.02, 0.05, 1.0
                        gx, gy, gz = 0.5, 0.2, 0.1
                    elif s_idx < 26:
                        ax, ay, az = 4.2 + random.uniform(0, 2.0), 3.8, 6.8 + random.uniform(0, 3.0) + (i * 0.1)
                        gx, gy, gz = 280.0, 310.0, 190.0
                    else:
                        ax, ay, az = 0.8, 0.4, 0.2
                        gx, gy, gz = 1.0, 0.5, 0.2

                elif class_type == "SKIDDING":
                    ax = math.sin(t_sec * 12.0) * (0.8 + 0.05 * i)
                    ay = math.cos(t_sec * 12.0) * 0.4
                    az = 0.95 + random.uniform(-0.1, 0.1)
                    gx = math.sin(t_sec * 10.0) * 85.0
                    gy = 25.0
                    gz = math.cos(t_sec * 10.0) * 95.0

                elif class_type == "POTHOLE":
                    if 18 <= s_idx <= 22:
                        ax, ay, az = 0.1, 0.15, 3.8 + random.uniform(-0.3, 0.5) + (i * 0.05)
                        gx, gy, gz = 15.0, 25.0, 5.0
                    else:
                        ax, ay, az = 0.03, 0.05, 0.99
                        gx, gy, gz = 1.0, 0.8, 0.2

                elif class_type == "SPEED_BUMP":
                    if 15 <= s_idx <= 35:
                        phase = (s_idx - 15) / 20.0 * math.pi
                        az = 1.0 + math.sin(phase) * (1.2 + 0.05 * i)
                        ax = math.sin(phase) * 0.2
                        ay = 0.05
                        gx, gy, gz = math.cos(phase) * 12.0, 2.0, 1.0
                    else:
                        ax, ay, az = 0.02, 0.04, 1.0
                        gx, gy, gz = 0.5, 0.3, 0.1

                elif class_type == "PHONE_FALLING":
                    if s_idx < 12:
                        ax, ay, az = 0.0, 0.0, 1.0
                        gx, gy, gz = 0.0, 0.0, 0.0
                    elif s_idx < 24:
                        ax, ay, az = 0.05, 0.05, 0.08
                        gx, gy, gz = 45.0, 60.0, 30.0
                    elif s_idx < 28:
                        ax, ay, az = 1.8, 2.2, 3.5 + (i * 0.1)
                        gx, gy, gz = 180.0, 120.0, 90.0
                    else:
                        ax, ay, az = 0.0, 0.0, 1.0
                        gx, gy, gz = 0.0, 0.0, 0.0

                elif class_type == "PHONE_SHAKING":
                    ax = math.sin(t_sec * 25.0) * 0.3
                    ay = math.cos(t_sec * 25.0) * 0.35
                    az = 0.95 + math.sin(t_sec * 30.0) * 0.2
                    gx = math.sin(t_sec * 20.0) * (150.0 + i * 5.0)
                    gy = math.cos(t_sec * 22.0) * 140.0
                    gz = math.sin(t_sec * 18.0) * 120.0

                elif class_type == "WALKING":
                    cadence = (1.5 + (i * 0.04)) * 2.0 * math.pi
                    ax = math.sin(t_sec * cadence) * 0.15
                    ay = math.cos(t_sec * cadence) * 0.12
                    az = 1.0 + math.sin(t_sec * cadence) * 0.28
                    gx = math.sin(t_sec * cadence) * 15.0
                    gy = math.cos(t_sec * cadence) * 12.0
                    gz = 4.0

                elif class_type == "RUNNING":
                    cadence = (2.6 + (i * 0.05)) * 2.0 * math.pi
                    ax = math.sin(t_sec * cadence) * 0.35
                    ay = math.cos(t_sec * cadence) * 0.25
                    az = 1.0 + math.sin(t_sec * cadence) * 0.75
                    gx = math.sin(t_sec * cadence) * 35.0
                    gy = math.cos(t_sec * cadence) * 28.0
                    gz = 10.0

                else: # NORMAL_VEHICLE_RIDE
                    ax = random.uniform(-0.04, 0.04)
                    ay = random.uniform(-0.03, 0.03)
                    az = 1.0 + random.uniform(-0.05, 0.05)
                    gx = random.uniform(-2.0, 2.0)
                    gy = random.uniform(-1.5, 1.5)
                    gz = random.uniform(-0.8, 0.8)

                svm = math.sqrt(ax * ax + ay * ay + az * az)
                gyro_mag = math.sqrt(gx * gx + gy * gy + gz * gz)

                sum_svm += svm
                sum_svm_sq += svm * svm
                if svm > max_svm: max_svm = svm
                if svm < min_svm: min_svm = svm
                if gyro_mag > max_gyro: max_gyro = gyro_mag
                sum_gyro += gyro_mag

                if prev_svm >= 0:
                    jerk = abs(svm - prev_svm) * 50.0
                    if jerk > max_jerk: max_jerk = jerk
                    sum_jerk += jerk
                    if (prev_svm - 1.0) * (svm - 1.0) < 0:
                        zero_crossings += 1
                prev_svm = svm

                pitch = math.degrees(math.atan2(ax, math.sqrt(ay * ay + az * az)))
                roll = math.degrees(math.atan2(ay, math.sqrt(ax * ax + az * az)))

                raw_samples.append({
                    "rel_time_ms": rel_time,
                    "ax": round(ax, 4),
                    "ay": round(ay, 4),
                    "az": round(az, 4),
                    "gx": round(gx, 2),
                    "gy": round(gy, 2),
                    "gz": round(gz, 2),
                    "svm_g": round(svm, 4),
                    "pitch_deg": round(pitch, 2),
                    "roll_deg": round(roll, 2)
                })

            mean_svm = sum_svm / 50.0
            variance = max(0.0, (sum_svm_sq / 50.0) - (mean_svm * mean_svm))
            std_svm = math.sqrt(variance)
            rms_svm = math.sqrt(sum_svm_sq / 50.0)
            mean_gyro = sum_gyro / 50.0
            mean_jerk = sum_jerk / 49.0
            tilt_delta = abs(raw_samples[-1]["pitch_deg"] - raw_samples[0]["pitch_deg"]) + \
                         abs(raw_samples[-1]["roll_deg"] - raw_samples[0]["roll_deg"])

            benchmark_doc = {
                "session_id": session_id,
                "timestamp_epoch_ms": now_ms - (total_files * 60000),
                "category": category,
                "class_type": class_type,
                "is_accident": is_accident,
                "metadata": {
                    "dataset_origin": "RAMS Synthetic Multi-Parameter Physical Benchmark",
                    "device_model": "Infinix_X6851B / ESP32-S3 Wearable",
                    "sensor_source": "6-AXIS IMU (LSM6DSOX / Phone)",
                    "sampling_rate_hz": 50.0,
                    "pre_event_speed_kmh": speed,
                    "rider_notes": f"Synthetic benchmark trial {i} for {class_type}",
                    "location_address": "Tuguegarao City Calibration Track"
                },
                "features": {
                    "mean_svm_g": round(mean_svm, 4),
                    "max_svm_g": round(max_svm, 4),
                    "min_svm_g": round(min_svm, 4),
                    "std_svm_g": round(std_svm, 4),
                    "rms_svm_g": round(rms_svm, 4),
                    "max_gyro_mag": round(max_gyro, 2),
                    "mean_gyro_mag": round(mean_gyro, 2),
                    "max_jerk": round(max_jerk, 2),
                    "mean_jerk": round(mean_jerk, 2),
                    "tilt_delta_deg": round(tilt_delta, 2),
                    "signal_magnitude_area": round(mean_svm, 4),
                    "energy_svm": round(sum_svm_sq / 50.0, 4),
                    "zero_crossing_rate": round(zero_crossings / 1.0, 2)
                },
                "raw_samples": raw_samples
            }

            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(benchmark_doc, f, indent=2)
            total_files += 1

    print(f"  Synthesized {total_files} distinct 50Hz IMU benchmark datasets in {out_dir}")
    return total_files

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================
def main():
    start_time = time.time()
    distilled_count = generate_distilled_knowledge()
    voice_count = expand_voice_wake_dataset()
    motion_count = generate_motion_benchmarks()
    elapsed = time.time() - start_time

    print("\n" + "=" * 70)
    print("RAMS AI TRAINING & DATASET GENERATION SUMMARY")
    print("=" * 70)
    print(f"  1. Distilled Knowledge Q&A Pairs:   {distilled_count:,} entries")
    print(f"  2. Acoustic & Semantic Voice Corpus: {voice_count:,} entries")
    print(f"  3. 50Hz IMU Motion Benchmarks:      {motion_count} benchmark files")
    print(f"  Total Multimodal Training Entities: {distilled_count + voice_count + motion_count:,}")
    print(f"  Execution Time:                     {elapsed:.2f} seconds")
    print("  Status: READY FOR ON-DEVICE EDGE COGNITION")
    print("=" * 70 + "\n")

if __name__ == '__main__':
    main()
