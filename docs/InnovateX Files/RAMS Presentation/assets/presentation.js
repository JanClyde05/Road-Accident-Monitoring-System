(()=>{var pt={pothole:{accident:!1,peak:4.18},phone_falling:{accident:!1,peak:3.7121},normal_vehicle_ride:{accident:!1,peak:1.0339},impact:{accident:!0,peak:8.4994},fall:{accident:!0,peak:6.9921},skidding:{accident:!0,peak:2.0107}};var mt=[{name:"fall",positive:!0,count:11,peak:6.9921,tilt:157.5,samples:[.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.1879,.1879,.1879,.1879,.1879,.1879,6.9921,6.9921,6.9921,6.9921,.979,.979,.979,.979,.979,.979,.979,.979,.979,.979,.979,.979,.979,.979,.979,.979,.979,.979,.979,.979]},{name:"impact",positive:!0,count:11,peak:8.4994,tilt:154.5,samples:[.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,.9807,8.4994,8.4994,8.4994,8.4994,8.4994,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845,.9845]},{name:"motorcycle_wind_flutter",positive:!1,count:11,peak:3.0149,tilt:8.71,samples:[2.6557,1.6293,.9823,.8631,2.2468,1.1984,1.1324,1.4371,2.3447,.8235,.7686,1.504,2.6902,1.0083,.6953,1.3895,2.9746,1.0874,.5819,1.1017,2.9429,1.5003,.5878,.794,2.5819,1.5405,.9124,.9664,2.2634,1.2333,1.1607,1.376,2.3278,.7646,.8086,1.6479,2.8095,.8503,.3023,1.269,3.0149,1.3306,.7378,.954,2.845,1.4747,.6843,.94,2.5063,1.4835]},{name:"normal_vehicle_ride",positive:!1,count:11,peak:1.0339,tilt:0,samples:[.9813,1.0337,.9886,.9322,.967,1.0306,1.0027,.937,.954,1.0234,1.0152,.9453,.9433,1.0129,1.0251,.9565,.9357,.9999,1.0315,.9698,.9317,.9856,1.0339,.9842,.9315,.9711,1.0319,.9986,.9352,.9577,1.0259,1.0117,.9425,.9462,1.0163,1.0225,.9529,.9376,1.0039,1.03,.9657,.9325,.9899,1.0336,.9799,.9311,.9754,1.033,.9944,.9337]},{name:"phone_falling",positive:!1,count:11,peak:3.7121,tilt:91,samples:[.9801,.9801,.9801,.9801,.9801,.9801,.9801,.9801,.9801,.9801,.9801,.9801,.086,.086,.086,.086,.086,.086,.086,.086,.086,.086,.086,.086,3.7121,3.7121,3.7121,3.7121,3.7121,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815,.9815]},{name:"phone_shaking",positive:!1,count:11,peak:2.4501,tilt:0,samples:[1.7089,1.8395,2.1537,1.869,1.3717,2.2014,2.1864,1.0611,1.9956,2.4088,1.2589,1.6767,2.3979,1.6912,1.5235,2.1392,1.9954,1.7312,1.7424,2.0291,2.1125,1.4617,1.7836,2.398,1.5517,1.3772,2.4501,1.8757,1.1248,2.258,2.1271,1.3539,1.9329,2.1364,1.8136,1.7098,1.8683,2.165,1.8001,1.4092,2.2657,2.1015,1.0322,2.1059,2.3512,1.1574,1.7983,2.383,1.6032,1.5924]},{name:"pothole",positive:!1,count:11,peak:4.18,tilt:.2,samples:[.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,.9913,4.18,4.18,4.18,4.18,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014,1.0014]},{name:"running",positive:!1,count:11,peak:1.9522,tilt:0,samples:[1.1987,1.7212,1.9522,1.7849,1.2971,.6971,.1836,.4182,.997,1.5696,1.9178,1.8839,1.4837,.8958,.3327,.2531,.7956,1.3925,1.8394,1.9407,1.6491,1.0983,.5078,.137,.601,1.1987,1.7212,1.9522,1.7849,1.2971,.6971,.1836,.4182,.997,1.5696,1.9178,1.8839,1.4837,.8958,.3327,.2531,.7956,1.3925,1.8394,1.9407,1.6491,1.0983,.5078,.137,.601]},{name:"skidding",positive:!0,count:11,peak:2.0107,tilt:134,samples:[.9926,.9926,.9926,.9926,.9926,.9926,.9926,.9926,.9926,.9926,.9926,.9926,.9926,.9926,.9926,.9014,1.3585,1.9045,1.9711,1.5135,.9365,1.2029,1.8094,2.0069,1.6575,1.0322,1.0616,1.6892,2.0107,1.7829,1.1674,.9544,1.549,1.9825,1.8844,.9823,.9823,.9823,.9823,.9823,.9823,.9823,.9823,.9823,.9823,.9823,.9823,.9823,.9823,.9823]},{name:"speed_bump",positive:!1,count:11,peak:2.6062,tilt:.2,samples:[.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,1.0161,1.6223,2.139,2.4848,2.6062,2.4848,2.139,1.6223,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907,.9907]},{name:"walking",positive:!1,count:11,peak:1.3503,tilt:0,samples:[1.032,1.1721,1.2806,1.3414,1.3455,1.2925,1.19,1.0532,.903,.7659,.6734,.6554,.7188,.8409,.989,1.1345,1.2539,1.3296,1.3503,1.3132,1.2236,1.0947,.9458,.802,.6934,.6519,.6934,.802,.9458,1.0947,1.2236,1.3132,1.3503,1.3296,1.2539,1.1345,.989,.8409,.7188,.6554,.6734,.7659,.903,1.0532,1.19,1.2925,1.3455,1.3414,1.2806,1.1721]}];var gt={pothole:{samples:[[0,.9913,2.2,1.1],[20,.9913,2.2,1.1],[40,.9913,2.2,1.1],[60,.9913,2.2,1.1],[80,.9913,2.2,1.1],[100,.9913,2.2,1.1],[120,.9913,2.2,1.1],[140,.9913,2.2,1.1],[160,.9913,2.2,1.1],[180,.9913,2.2,1.1],[200,.9913,2.2,1.1],[220,.9913,2.2,1.1],[240,.9913,2.2,1.1],[260,.9913,2.2,1.1],[280,.9913,2.2,1.1],[300,.9913,2.2,1.1],[320,.9913,2.2,1.1],[340,.9913,2.2,1.1],[360,.9913,2.2,1.1],[380,.9913,2.2,1.1],[400,.9913,2.2,1.1],[420,.9913,2.2,1.1],[440,4.18,4.5,2],[460,4.18,4.5,2],[480,4.18,4.5,2],[500,4.18,4.5,2],[520,1.0014,2.1,1],[540,1.0014,2.1,1],[560,1.0014,2.1,1],[580,1.0014,2.1,1],[600,1.0014,2.1,1],[620,1.0014,2.1,1],[640,1.0014,2.1,1],[660,1.0014,2.1,1],[680,1.0014,2.1,1],[700,1.0014,2.1,1],[720,1.0014,2.1,1],[740,1.0014,2.1,1],[760,1.0014,2.1,1],[780,1.0014,2.1,1],[800,1.0014,2.1,1],[820,1.0014,2.1,1],[840,1.0014,2.1,1],[860,1.0014,2.1,1],[880,1.0014,2.1,1],[900,1.0014,2.1,1],[920,1.0014,2.1,1],[940,1.0014,2.1,1],[960,1.0014,2.1,1],[980,1.0014,2.1,1]],peak:4.18,tilt:.2,speed:38},impact:{samples:[[0,.9807,3,1.5],[20,.9807,3,1.5],[40,.9807,3,1.5],[60,.9807,3,1.5],[80,.9807,3,1.5],[100,.9807,3,1.5],[120,.9807,3,1.5],[140,.9807,3,1.5],[160,.9807,3,1.5],[180,.9807,3,1.5],[200,.9807,3,1.5],[220,.9807,3,1.5],[240,.9807,3,1.5],[260,.9807,3,1.5],[280,.9807,3,1.5],[300,.9807,3,1.5],[320,.9807,3,1.5],[340,.9807,3,1.5],[360,.9807,3,1.5],[380,.9807,3,1.5],[400,.9807,3,1.5],[420,.9807,3,1.5],[440,8.4994,68,55],[460,8.4994,68,55],[480,8.4994,68,55],[500,8.4994,68,55],[520,8.4994,68,55],[540,.9845,85,74],[560,.9845,85,74],[580,.9845,85,74],[600,.9845,85,74],[620,.9845,85,74],[640,.9845,85,74],[660,.9845,85,74],[680,.9845,85,74],[700,.9845,85,74],[720,.9845,85,74],[740,.9845,85,74],[760,.9845,85,74],[780,.9845,85,74],[800,.9845,85,74],[820,.9845,85,74],[840,.9845,85,74],[860,.9845,85,74],[880,.9845,85,74],[900,.9845,85,74],[920,.9845,85,74],[940,.9845,85,74],[960,.9845,85,74],[980,.9845,85,74]],peak:8.4994,tilt:154.5,speed:55},walking:{samples:[[0,1.032,2.5,1.5],[20,1.1721,2.5,1.5],[40,1.2806,2.5,1.5],[60,1.3414,2.5,1.5],[80,1.3455,2.5,1.5],[100,1.2925,2.5,1.5],[120,1.19,2.5,1.5],[140,1.0532,2.5,1.5],[160,.903,2.5,1.5],[180,.7659,2.5,1.5],[200,.6734,2.5,1.5],[220,.6554,2.5,1.5],[240,.7188,2.5,1.5],[260,.8409,2.5,1.5],[280,.989,2.5,1.5],[300,1.1345,2.5,1.5],[320,1.2539,2.5,1.5],[340,1.3296,2.5,1.5],[360,1.3503,2.5,1.5],[380,1.3132,2.5,1.5],[400,1.2236,2.5,1.5],[420,1.0947,2.5,1.5],[440,.9458,2.5,1.5],[460,.802,2.5,1.5],[480,.6934,2.5,1.5],[500,.6519,2.5,1.5],[520,.6934,2.5,1.5],[540,.802,2.5,1.5],[560,.9458,2.5,1.5],[580,1.0947,2.5,1.5],[600,1.2236,2.5,1.5],[620,1.3132,2.5,1.5],[640,1.3503,2.5,1.5],[660,1.3296,2.5,1.5],[680,1.2539,2.5,1.5],[700,1.1345,2.5,1.5],[720,.989,2.5,1.5],[740,.8409,2.5,1.5],[760,.7188,2.5,1.5],[780,.6554,2.5,1.5],[800,.6734,2.5,1.5],[820,.7659,2.5,1.5],[840,.903,2.5,1.5],[860,1.0532,2.5,1.5],[880,1.19,2.5,1.5],[900,1.2925,2.5,1.5],[920,1.3455,2.5,1.5],[940,1.3414,2.5,1.5],[960,1.2806,2.5,1.5],[980,1.1721,2.5,1.5]],peak:1.3503,tilt:0,speed:4.5},phone_falling:{samples:[[0,.9801,0,0],[20,.9801,0,0],[40,.9801,0,0],[60,.9801,0,0],[80,.9801,0,0],[100,.9801,0,0],[120,.9801,0,0],[140,.9801,0,0],[160,.9801,0,0],[180,.9801,0,0],[200,.9801,0,0],[220,.9801,0,0],[240,.086,35,25],[260,.086,35,25],[280,.086,35,25],[300,.086,35,25],[320,.086,35,25],[340,.086,35,25],[360,.086,35,25],[380,.086,35,25],[400,.086,35,25],[420,.086,35,25],[440,.086,35,25],[460,.086,35,25],[480,3.7121,85,45],[500,3.7121,85,45],[520,3.7121,85,45],[540,3.7121,85,45],[560,3.7121,85,45],[580,.9815,89,2],[600,.9815,89,2],[620,.9815,89,2],[640,.9815,89,2],[660,.9815,89,2],[680,.9815,89,2],[700,.9815,89,2],[720,.9815,89,2],[740,.9815,89,2],[760,.9815,89,2],[780,.9815,89,2],[800,.9815,89,2],[820,.9815,89,2],[840,.9815,89,2],[860,.9815,89,2],[880,.9815,89,2],[900,.9815,89,2],[920,.9815,89,2],[940,.9815,89,2],[960,.9815,89,2],[980,.9815,89,2]],peak:3.7121,tilt:91,speed:0},fall:{samples:[[0,.9845,2,1],[20,.9845,2,1],[40,.9845,2,1],[60,.9845,2,1],[80,.9845,2,1],[100,.9845,2,1],[120,.9845,2,1],[140,.9845,2,1],[160,.9845,2,1],[180,.9845,2,1],[200,.9845,2,1],[220,.9845,2,1],[240,.9845,2,1],[260,.9845,2,1],[280,.9845,2,1],[300,.9845,2,1],[320,.9845,2,1],[340,.9845,2,1],[360,.9845,2,1],[380,.9845,2,1],[400,.1879,30,25],[420,.1879,30,25],[440,.1879,30,25],[460,.1879,30,25],[480,.1879,30,25],[500,.1879,30,25],[520,6.9921,75,45],[540,6.9921,75,45],[560,6.9921,75,45],[580,6.9921,75,45],[600,.979,78.5,82],[620,.979,78.5,82],[640,.979,78.5,82],[660,.979,78.5,82],[680,.979,78.5,82],[700,.979,78.5,82],[720,.979,78.5,82],[740,.979,78.5,82],[760,.979,78.5,82],[780,.979,78.5,82],[800,.979,78.5,82],[820,.979,78.5,82],[840,.979,78.5,82],[860,.979,78.5,82],[880,.979,78.5,82],[900,.979,78.5,82],[920,.979,78.5,82],[940,.979,78.5,82],[960,.979,78.5,82],[980,.979,78.5,82]],peak:6.9921,tilt:157.5,speed:42}};var ts="apps/android_app/app/src/main/java/com/example",Kl="apps/android_app/app/src/main/assets/motion_benchmarks",ws="docs/InnovateX Files",Mu=ws+"/Real Research Paper for InnovateX/RAMS_InnovateX_2026_Research_Paper_Working_Draft.docx",wu="hardware/KiCAD Files/GPT6 Astra Build/RAMS Wearable",Tu=[{id:"overview",title:"Overview",kicker:"The research question",headline:"When a rider cannot call for help",summary:"Can a phone recognize crash-like motion, and can a wearable carry that report to a nearby station when cellular service is unavailable?",notes:[{title:"Start with the rider",text:"Picture a rider hitting a pothole. The phone feels a sharp jolt, but the rider keeps moving. Now picture a fall on the same road. We need to decide which motion deserves an alert and give that alert a way out."},{title:"Follow one report",text:"The phone supplies motion and location. A paired wearable carries the event over radio. At the receiving station, an operator can open the incident. We will follow those steps and show which parts we can test with the evidence in hand."},{title:"State the objectives",text:"The research asks whether the motion rules distinguish accident-like events from ordinary activity, and whether a paired wearable can deliver the resulting report to a receiver. The potential benefit is a second reporting route for a rider who cannot make a call."},{title:"Use of generative AI",text:"Google Gemini in Antigravity helped develop the Android motion rules, benchmark runner, radio firmware and station software. Antigravity sessions wrote and ran the scripts for synthetic motion fixtures, written voice-command variants and template-based Q&A. Claude prepared the PCB handoff and ChatGPT assisted with the custom four-layer design. The team built the physical SuperMini carrier by hand. Claude Sonnet and Google AI Studio helped explore earlier presentation designs. OpenAI Codex helped check the project evidence and create this exhibit, the slides and the script. The reported counts come from executing the compiled classifier."}],sources:[{label:"InnovateX research working paper",path:Mu},{label:"Phone-assisted wearable configuration",path:"firmware/wearable_withApp/config.h"},{label:"PCB handoff brief and authorship",path:"hardware/KiCAD Files/RAMS MD Files/RAMS PCB Handoff Brief for ChatGPT 6-Astra v0.1.md"},{label:"Compiled classifier replay record",path:ws+"/RAMS Presentation/verification/replay-output.tsv"},{label:"AI Use Disclosure Statement (PDF)",path:ws+"/RAMS Presentation/public/presenters/RAMS AI Use Disclosure.pdf"}]},{id:"detection",title:"Detection",kicker:"Reading the motion",headline:"A pothole can produce a 4.18 g shock",summary:"In the scripted pothole, the phone finishes almost level. In the impact example, its orientation changes sharply. Acceleration alone misses that distinction.",notes:[{title:"Read the traces",text:"Both examples cover 50 samples at 20 ms intervals. The pothole reaches 4.18 g with 0.2\xB0 of combined pitch and roll change. The impact reaches 8.50 g with 154.5\xB0 of combined change. Those angles describe the change in sensor orientation from the first sample to the last."},{title:"Explain the decision",text:"On Android, accelerometer, gyroscope and location readings give the classifier a rolling window of motion and an estimate of speed. Its rules look for combinations of shock, rotation and tilt. The 50 Hz timing shown here belongs to the synthetic files. Actual handset timing depends on the sensor callbacks."},{title:"Read the fall example in context",text:"The packaged Fall trace models a rider going over the handlebars at a scripted 42 km/h. The base trace reaches 6.99 g and changes orientation by 157.5\xB0. All eleven fall-labeled fixtures raised the replay\u2019s alarm flag, but the earlier severe-collision rule won. The replay contains no measured roadside drop, manhole or cliff fall."},{title:"What the fall rule checks",text:"After the saved-profile and severe-collision checks, Fall & Slide requires speed \u22655 km/h, a peak \u22653.2 g and a combined pitch-and-roll change \u226550\xB0. It also needs either a minimum below 0.25 g or a tilt change \u226560\xB0. These are features of one sensor window. The rule neither measures drop height nor reconstructs the order of the movements. Live reporting also depends on how the app processes the event and on connectivity."}],sources:[{label:"Scripted pothole trace",path:Kl+"/benchmark_pothole.json"},{label:"Scripted impact trace",path:Kl+"/benchmark_impact.json"},{label:"Scripted fall trace",path:Kl+"/benchmark_fall.json"},{label:"Android motion classifier",path:ts+"/ai/SensorAiInferenceEngine.kt"},{label:"Phone sensor input",path:ts+"/sensor/PhoneSensorEngine.kt"}]},{id:"calibration",title:"Calibration",kicker:"Data and adaptation",headline:"Why the phone uses calibrated rules",summary:"The phone checks acceleration, rotation, tilt and available speed using rules that work offline. Labeled sessions can tune the thresholds. Our scripts generated 121 traces across 11 scenarios.",notes:[{title:"Where the traces came from",text:"Public datasets such as SisFall and MobiFall appear in the research directory as references. The files bundled with the current Android app contain locally generated motion profiles. Each scenario has 11 examples. Together they contain 33 accident-labeled and 88 benign traces, with 6,050 sample rows."},{title:"What calibration does",text:"The app can record and label a phone session, export it and import labeled feature data. For a CSV import it compares peaks by session. When the lowest accident peak exceeds the highest benign peak, their midpoint becomes the acceleration threshold. Overlapping ranges use the lowest accident peak. The rules can run without a network connection, and a reviewer can trace which conditions raised an alarm."},{title:"Where the other training assets fit",text:"The build script also generates assistant questions and answers from text templates and expands written variants of voice commands. The bundled knowledge file contains 1,655 entries. Motion detection uses calibrated thresholds and kinematic rules, so the size of the text collection says nothing about crash-detection accuracy."}],sources:[{label:"Motion profile generator",path:"scripts/generate_benchmark_motion_datasets.py"},{label:"Synthetic variation and text generator",path:"scripts/train_rams_ai.py"},{label:"Labeled session import and calibration",path:ts+"/sensor/ImuCalibrationManager.kt"},{label:"Recording and export",path:ts+"/ai/DeveloperTrainingSuite.kt"},{label:"Rider dismissal and cancel-message handler",path:ts+"/viewmodel/RamsViewModel.kt"},{label:"Saved motion profiles and matching limits",path:ts+"/ai/SensorAiInferenceEngine.kt"},{label:"Public dataset reference directory",path:"docs/FREE_MOTION_DATASETS_DIRECTORY.md"}]},{id:"hardware",title:"Hardware",kicker:"Two generations of the wearable",headline:"One wearable, two board designs",summary:"The fabricated prototype carries an ESP32-S3 SuperMini module. The RAMS Wearable places an ESP32-S3 chip directly on a 42 \xD7 32 mm, four-layer PCB.",notes:[{title:"Show the fabricated prototype",text:"Identify the SuperMini development module on the hand-built board, then the Ra-02 radio and buzzer. The phone supplies the motion and location data over Bluetooth Low Energy. The wearable gives the rider a physical cancel button and the system a radio link."},{title:"Show the custom SMD design",text:"The RAMS Wearable integrates the ESP32-S3FH4R2, an AP2112 linear regulator and battery measurement. The Ra-02 radio sits on the underside. The project contains the routed KiCad board, assembly drawings and first-prototype fabrication files. Electrical operation of this revision awaits an assembled first article."}],sources:[{label:"SuperMini prototype netlist review",path:"docs/agent/HARDWARE_REVISION_PLAN.md"},{label:"RAMS Wearable design and manufacturing status",path:wu+"/README.md",displayPath:"RAMS Wearable / README.md"},{label:"Custom SMD board layout",path:wu+"/RAMS_JLC_S3.kicad_pcb",displayPath:"RAMS Wearable / RAMS_JLC_S3.kicad_pcb"},{label:"Exhibit geometry, component photographs and model sources",path:ws+"/RAMS Presentation/public/hardware/sources.md"}]},{id:"relay",title:"Alert relay",kicker:"The radio path",headline:"What travels in 26 bytes",summary:"The wearable sends a compact alert over 433 MHz LoRa. A receiver within radio reach can pass the event to the Windows station over USB.",notes:[{title:"Follow the handoff",text:"First, the Android app sends its classified event and location to the SuperMini over BLE. The wearable transmits through the Ra-02. The receiver decodes the radio message and forwards it to the station. This local route can operate without a cellular connection."},{title:"Read the payload",text:"The packed alert contains the packet type, device token, send-time counter, coordinates, event type and peak acceleration. Rider details travel in a separate profile packet. The station can also receive a false-alarm message when the rider cancels. The alert payload is 26 bytes before radio overhead."},{title:"Explain the radio settings",text:"The default firmware configuration uses spreading factor 9, 125 kHz bandwidth and coding rate 4/5. The illustrated mast represents a receiver in range. Its position and the road geometry are illustrative. Actual coverage depends on the installation."}],sources:[{label:"Packed alert and radio settings",path:"firmware/shared/protocol.h"},{label:"Wearable radio transmitter",path:"firmware/wearable_withApp/lora_tx.cpp"},{label:"Station radio receiver",path:"firmware/receiver_withDesktop/lora_rx.cpp"},{label:"Windows station USB serial ingestion",path:"apps/new_ai_applications/desktop_ai_app/Program.cs"}]},{id:"validation",title:"Validation",kicker:"Evidence and next tests",headline:"Take the next test off the screen",summary:"The Android classifier matched the alarm flag on every generated example. It mislabeled every pothole and fall subtype. Performance on real trips and time to the station still need measurement.",notes:[{title:"State what the replay tests",text:"We ran the compiled Android classification function on a desktop JVM, using the stored features from all 121 fixtures and an empty learned profile. Its alarm decision agreed with all 33 accident labels and all 88 benign labels. All 11 potholes received the wind-flutter subtype. All 11 variants of the over-the-handlebars fall received severe collision. The tested function uses fixed motion rules. CSV calibration supplies a threshold to the live phone sensor engine. This replay starts after feature extraction. It does not test sensing, radio delivery or accuracy on real trips."},{title:"Describe the next trial",text:"Label safe, controlled motions and keep complete trials together. Tune on development trials, freeze the settings, then count missed events and false alarms on held-out trials. For the radio test, count messages sent and received at each marked position and measure elapsed time from phone event to station receipt with synchronized clocks."},{title:"Hand over to the demonstration",text:"The finals schedule allows six minutes for the research talk, four for the prototype and five for questions. Pair the phone and wearable, show a clearly identified test event, and follow it to the receiving station. Use the defense to discuss the traces, the board and the evidence still needed."}],sources:[{label:"Research objectives and evaluation plan",path:Mu},{label:"JVM replay results for every fixture",path:ws+"/RAMS Presentation/verification/replay-output.tsv"},{label:"Runtime benchmark evaluation",path:ts+"/ai/SensorAiInferenceEngine.kt"},{label:"Field sweep status",path:"docs/agent/EXECUTION_PLAN.md"},{label:"InnovateX competition guidelines, page 9",path:ws+"/Competition Guidelines/ESAC-2026_Competition-Guidelines_InnovateX.pdf"}]}];var Zl=[{id:"lina",name:"Lina Cruz",token:"DEMO-041",role:"Motorcycle rider",vehicle:"Commuter motorcycle",location:"Enrile Boulevard",lat:17.6542287,lon:121.7445909,status:"Active alert",color:"#ff758c",events:[{type:"alert",title:"Crash alert received",time:"2026-11-12T14:06:00+08:00",g:7.2},{type:"false_alarm",title:"Rider cancelled an earlier alert",time:"2026-11-10T08:21:00+08:00",g:2.9},{type:"telemetry",title:"Wearable registration",time:"2026-11-08T09:12:00+08:00",g:1}]},{id:"ivo",name:"Ivo Reyes",token:"DEMO-052",role:"Bicycle rider",vehicle:"City bicycle",location:"Dalan na Paccorofun",lat:17.6519906,lon:121.7527109,status:"Test signal",color:"#ffbf63",events:[{type:"test",title:"Test signal received",time:"2026-11-12T14:02:00+08:00",g:1.1},{type:"telemetry",title:"Wearable registration",time:"2026-11-09T10:10:00+08:00",g:1}]},{id:"mara",name:"Mara Lim",token:"DEMO-063",role:"Pedestrian",vehicle:"On foot",location:"Carig road network",lat:17.6535369,lon:121.7545992,status:"Cleared",color:"#69e0bd",events:[{type:"alert",status:"RESCUED",title:"Incident marked rescued",time:"2026-11-12T13:47:00+08:00",g:5.2},{type:"telemetry",title:"Wearable registration",time:"2026-11-08T10:28:00+08:00",g:1}]}];var Bp={lina:[18.8,27.8],ivo:[69.33,65.63],mara:[81.07,39.58]},kp={map:"Incident map",people:"Registered profiles",diagnostics:"Diagnostics"},zp=new Intl.DateTimeFormat("en-PH",{timeZone:"Asia/Manila",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",hour12:!1});function Eu(i,e){i.innerHTML=`<section class="plate station-exhibit">
    <div class="plate-head"><strong>Windows console</strong><span class="tiny">Fictional demo records</span></div>
    <div class="app-tabs station-tabs" aria-label="Windows console views"></div>
    <div class="station-body"></div></section>`;let t=i.querySelector(".station-tabs"),n=i.querySelector(".station-body"),s,r;function a(h,u=!1){r?.(),r=null;let d=h==="profile"||h==="history"?"people":h;for(let f of t.children)f.setAttribute("aria-pressed",f.dataset.station===d);n.replaceChildren(),h==="map"?o():h==="people"?c():h==="diagnostics"?r=e(n):l(h),u&&n.querySelector('[tabindex="-1"]')?.focus({preventScroll:!0})}for(let[h,u]of Object.entries(kp)){let d=document.createElement("button");d.type="button",d.dataset.station=h,d.textContent=u,d.onclick=()=>a(h),t.append(d)}function o(){n.innerHTML=`<div class="station-map">
      <img src="public/apps/station-map.webp" alt="Windows station map of Carig, Tuguegarao City, with red, amber and green device pins">
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">\xA9 OpenStreetMap contributors</a>
    </div><div class="station-brief"><div aria-live="polite"><strong></strong><p></p></div>
      <button class="small-button" data-station="profile">Open rider profile</button></div>`;let h=n.querySelector(".station-map");function u(d){s=d;for(let f of h.querySelectorAll("button"))f.setAttribute("aria-pressed",d.id===f.dataset.pin);n.querySelector(".station-brief strong").textContent=d.name+" \xB7 "+d.status,n.querySelector(".station-brief p").textContent=d.location+" \xB7 "+d.token,n.querySelector('[data-station="profile"]').disabled=!1}for(let d of Zl){let f=document.createElement("button");f.type="button",f.dataset.pin=d.id,f.setAttribute("aria-pressed","false"),f.setAttribute("aria-label",d.name+" pin, "+d.status),f.title=d.name+" \xB7 "+d.status;let[g,x]=Bp[d.id];f.style.left=g+"%",f.style.top=x+"%",f.onclick=()=>u(d),h.append(f)}n.querySelector('[data-station="profile"]').onclick=()=>a("profile",!0),s?u(s):(n.querySelector(".station-brief strong").textContent="Three registered wearables",n.querySelector(".station-brief p").textContent="Select a pin to inspect its report.",n.querySelector('[data-station="profile"]').disabled=!0)}function c(){n.innerHTML='<div class="station-register"><h3 tabindex="-1">Registered wearable units</h3><div class="station-roster"></div></div>';let h=n.querySelector(".station-roster");for(let u of Zl){let d=document.createElement("button");d.type="button",d.dataset.person=u.id,d.style.setProperty("--signal",u.color),d.innerHTML=`<span><strong>${u.name}</strong><small>${u.token} \xB7 ${u.vehicle}</small></span><span class="station-state">${u.status}</span>`,d.onclick=()=>{s=u,a("profile",!0)},h.append(d)}}function l(h){let u=h==="history",d=s,f=u?d.events.map(g=>zp.format(new Date(g.time))+", "+g.title+", "+g.g.toFixed(2)+" g").join(". "):d.name+", "+d.role+", "+d.vehicle+", "+d.status;n.innerHTML=`<div class="station-record"><div class="station-record-head"><h3 tabindex="-1">${d.name}</h3><span>${d.token}</span></div>
      <div class="station-record-art ${u?"history":""}"><img src="public/apps/station-${d.id}-${h}.webp" alt="${f}"></div>
      <div class="station-brief"><div><strong>${u?d.events.length+" events \xB7 newest first":"Registered rider"}</strong>
      <p>${u?"Recorded time \xB7 Philippine Standard Time":d.vehicle+" \xB7 "+d.location}</p></div>
      <button class="small-button" data-station="${u?"profile":"history"}">${u?"Rider profile":"Incident history"}</button></div></div>`,n.querySelector(".station-brief button").onclick=()=>a(u?"profile":"history",!0)}return a("map"),()=>r?.()}var $l="apps/android_app/app/src/main",br=$l+"/java/com/example",Sr="apps/new_ai_applications/desktop_ai_app",Hp="archive/duplicates/mobile_ai_app_2026-11/rams_live_screen.png",Au="docs/InnovateX Files/RAMS Presentation/public/apps/sources.md",Cu=[{id:"mobile",title:"Mobile app",kicker:"The rider\u2019s interface",headline:"What the rider sees",summary:"The Android companion reads the phone\u2019s movement and location. The rider can check the wireless link, inspect a jolt and use a spoken command while the phone stays in a pocket.",notes:[{title:"Pair the hardware",text:"The Wearable screen lists discovered and bonded devices and offers controls for connecting, sending an SOS and cancelling a false alarm. A BLE connection links the phone to the physical radio carrier."},{title:"Read the motion",text:"The Telemetry screen displays acceleration magnitude and the session peak. Its diagnostics reveal individual sensor axes. The plotted value is an observation; the classification pipeline uses additional features and the rider\u2019s speed context."},{title:"Use the companion",text:"The archive contains an earlier capture of the hands-free wake overlay. The current recognizer and command router are documented in the RAMS AI chapter. The application uses the handset\u2019s speech service and can speak the result with text-to-speech."}],sources:[{label:"Android app navigation",path:br+"/MainActivity.kt"},{label:"Wearable pairing screen",path:br+"/ui/screens/WearableScreen.kt"},{label:"Phone telemetry screen",path:br+"/ui/screens/TelemetryScreen.kt"},{label:"Archived Android voice overlay capture",path:Hp},{label:"App capture notes",path:Au}]},{id:"assistant",title:"RAMS AI",kicker:"Voice and personal assistance",headline:"What happens after \u201CHey RAMS\u201D?",summary:"RAMS listens for a wake phrase in the phone\u2019s speech transcript. It can change a rider setting, answer from the device\u2019s current state or recall a saved answer.",notes:[{title:"Where the voice data came from",text:"The packaged JSON describes 32 wake prefixes, 55 written variants of RAMS, 30 slurred forms and 78 base cancel phrases. The loader builds spaced and joined prefix/name combinations. Android produces candidate text; RAMS applies phrase rules and fuzzy comparisons. These counts describe text entries. The historical methodology also describes recording conditions, but the APK\u2019s text resources cannot establish a recorded-audio trial size or voice accuracy."},{title:"How RAMS gets a personal answer",text:"Device-state queries read current values such as wearable connectivity, role or speed. The phrase \u201Clakad ako\u201D contains the walking keyword and can select the Pedestrian category. A recognized cancel instruction has its own safety action. These guarded actions have a direct path through app code."},{title:"What Gemini contributes",text:"The shipped Q&A file has 1,655 distinct normalized keys. Every packaged row carries the RAMS-AutoTrain-Corpus-v3.2 source label, matching the local template generator. For eligible unanswered queries the Android app can request a Gemini answer when a network connection and configured service are available. Successfully returned answers can be saved on the phone and recalled offline by normalized query key. Local response rules handle further cases."},{title:"Inspect one stored record",text:"The packaged question \u201Cwhat is sensor fusion\u201D is stored under \u201Cfusion sensor\u201D. Its response describes the accelerometer\u2019s gravitational reference and the gyroscope\u2019s responsiveness. The language resource can repeat that answer from storage. Corpus size counts available answers; it does not measure their correctness."},{title:"What the training evidence supports",text:"The motion classifier, speech recognizer and knowledge cache perform different jobs. The repository contains model specification labels, including RAMS-1.8B-Edge. The demonstrated assistant path uses stored text, live context, app actions and optional remote answers. The checked Android assets contain no independently verified 1.8B weight checkpoint or acoustic-training run."}],sources:[{label:"Voice patterns and command resources",path:$l+"/assets/voice_wake_patterns.json"},{label:"Android speech recognition and command dispatch",path:br+"/ai/VoiceAlarmCanceler.kt"},{label:"Assistant routing, Gemini requests and local cache",path:br+"/ai/RamsAiAssistantEngine.kt"},{label:"Bundled Q&A records",path:$l+"/assets/rams_distilled_knowledge.jsonl"},{label:"Corpus generator",path:"scripts/train_rams_ai.py"},{label:"Historical Gemini-era voice methodology",path:"docs/MD Files/RAMS_AI_TRAINING_METHODOLOGY.md"}]},{id:"desktop",title:"Rescuer desk",kicker:"The operator\u2019s interface",headline:"What reaches the rescue desk",summary:"Select a map pin at the Windows station, open its registered rider and read their incident history. The three fictional records show how an operator can follow an alert from a location to a person.",notes:[{title:"Open the station view",text:"Select Lina\u2019s red pin, open her rider profile and choose Incident history. The station groups events by device, prioritizes an unresolved alert for its pin and looks up the rider\u2019s matching records. The timeline includes a crash alert, an earlier cancellation and registration. These captures use three fictional people and seven scripted events."},{title:"Inspect radio diagnostics",text:"The separate ping window exposes station configuration, reception history and CSV export for field sampling. Its airtime estimate is a calculated model. Measured delivery and end-to-end delay need timestamped samples."},{title:"Review incident patterns",text:"The Windows spatial analysis uses Haversine distances and DBSCAN on incident coordinates. The default neighborhood is 150 metres with a three-point density criterion. A cluster describes recorded incidents. It does not predict an individual rider\u2019s next crash. The reporting code also provides an optional local Ollama path and a structured fallback."}],sources:[{label:"Windows USB serial and event ingestion",path:Sr+"/Program.cs"},{label:"Shipping rescuer dashboard",path:Sr+"/www/index.html"},{label:"One station pin per wearable",path:"apps/backend/src/components/RAMSMapView.tsx"},{label:"Rider profile and chronological event history",path:"apps/backend/src/components/RAMSWearableProfileOverlay.tsx"},{label:"Station and field diagnostics",path:Sr+"/www/ping.html"},{label:"Spatial clustering implementation",path:Sr+"/HotspotPredictor.cs"},{label:"Report generator and fallback",path:Sr+"/DesktopAiReportGenerator.cs"},{label:"App capture notes",path:Au}]}],Gp=[{tab:"Wearable",image:"android-wearable",title:"Pair the carrier",text:"The Wearable screen shows the link state. The rider scans for the carrier, selects it and can later check whether the two devices are connected.",credit:"Android Compose \xB7 disconnected fixture"},{tab:"Telemetry",image:"android-telemetry",title:"Inspect the movement",text:"The rider sees the current acceleration magnitude and the peak for the session. Advanced diagnostics expose the underlying acceleration and rotation axes.",credit:"Android Compose \xB7 empty session"},{tab:"Voice",image:"android-voice",title:"Use a hands-free command",text:"This earlier phone capture shows the wake overlay and its simulator buttons. The current voice route can interpret a transcript and pass the selected action to the app.",credit:"Archived handset capture \xB7 voice overlay crop"}],Vp=[{tab:"Reception",image:"desktop-station",title:"Inspect the receiver link",text:"The station window brings packet reception, propagation measurements and CSV export into one place. The airtime figure on screen is a model estimate.",credit:"Windows station UI \xB7 empty fixture"},{tab:"Unit registry",image:"station-registry",title:"Find a wearable or an alert",text:"The incident dashboard groups the seven demo events into three registered units. Each row shows the device identity, current status and number of events.",credit:"Windows dashboard \xB7 fictional units"},{tab:"Hotspots",image:"desktop-hotspots",title:"Review recurring locations",text:"The spatial analysis groups historical incident coordinates. Its default DBSCAN settings use a 150 m neighborhood and three points.",credit:"Windows AI suite \xB7 empty incident history"}];function Jl(){if(document.getElementById("app-exhibits-style"))return;let i=document.createElement("link");i.id="app-exhibits-style",i.rel="stylesheet",i.href="public/apps/exhibits.css",document.head.append(i)}function Pu(i,e,t){Jl(),i.innerHTML=`<div class="plate app-exhibit"><div class="plate-head"><strong>${t?"Android companion":"Windows console"}</strong><span class="tiny">${t?"Rider":"Operator"} view</span></div>
    <div class="app-tabs" aria-label="Choose a screen"></div>
    <div class="app-gallery ${t?"app-mobile":"app-desktop"}"><button class="app-capture" title="Enlarge screen capture"><img alt=""></button><div class="app-caption"><span class="eyebrow"></span><h3></h3><p></p><button class="small-button app-enlarge">Enlarge capture</button></div></div></div>`;let n=i.querySelector(".app-tabs"),s=i.querySelector(".app-capture img"),r=i.querySelector(".app-caption"),a=e[0],o,c=h=>{a=e[h],[...n.children].forEach((u,d)=>u.setAttribute("aria-pressed",d===h)),s.src="public/apps/"+a.image+".webp",s.alt=a.title+" \u2014 "+a.credit,r.querySelector(".eyebrow").textContent=a.credit,r.querySelector("h3").textContent=a.title,r.querySelector("p").textContent=a.text,i.querySelector(".app-capture").classList.toggle("voice-crop",a.image==="android-voice")};e.forEach((h,u)=>{let d=document.createElement("button");d.type="button",d.textContent=h.tab,d.onclick=()=>c(u),n.append(d)});function l(){if(o?.open)return;let h=document.activeElement;o=document.createElement("dialog"),o.className="screen-zoom",o.setAttribute("aria-label",a.title),o.innerHTML='<header><strong></strong><button class="small-button">Close</button></header><img alt=""><p></p>',o.querySelector("strong").textContent=a.title,o.querySelector("img").src=s.src,o.querySelector("img").alt=s.alt,o.querySelector("p").textContent=a.credit,o.querySelector("button").onclick=()=>o.close(),o.addEventListener("keydown",u=>u.stopPropagation()),o.addEventListener("close",()=>{o.remove(),h?.isConnected&&h.focus({preventScroll:!0})}),document.body.append(o),o.showModal()}return i.querySelector(".app-capture").onclick=l,i.querySelector(".app-enlarge").onclick=l,c(0),()=>{o?.open&&o.close()}}var Iu=i=>Pu(i,Gp,!0),Lu=i=>(Jl(),Eu(i,e=>Pu(e,Vp,!1))),Ru=[{tab:"Wake word",prompt:"\u201CHey rhams\u201D",nodes:["Speech","Pattern","Wake"],action:"The wake phrase opens the command window.",hint:"Android supplies candidate text. RAMS combines 32 prefixes with 55 written name variants, including \u201Crhams.\u201D The matcher also accepts joined forms and close spellings."},{tab:"App action",prompt:"\u201CLakad ako\u201D",nodes:["Transcript","Walking","Profile"],action:"The app switches the user category to Pedestrian.",hint:"The command router recognizes \u201Clakad\u201D as a walking intent. It hands a category change to the app and prepares spoken confirmation."},{tab:"Personal reply",prompt:"\u201CIs my wearable connected?\u201D",nodes:["Question","BLE state","Answer"],action:"The response uses the current connection state.",hint:"For a connected wearable the Android handler includes its reported battery percentage. For a disconnected wearable it gives pairing instructions."},{tab:"Gemini cache",prompt:"An unanswered question",nodes:["Cache miss","Gemini","Save key"],action:"A successful online answer can be recalled later.",hint:"The app normalizes a question and checks stored answers. An eligible miss can reach Gemini online. The phone saves the returned answer under its key for offline lookup."}];function Du(i){Jl(),i.innerHTML=`<div class="plate app-exhibit ai-exhibit"><div class="plate-head"><strong>RAMS AI</strong><span class="tiny">Command walkthrough</span></div><div class="app-tabs" aria-label="Choose an assistant route"></div><div class="ai-case">
    <div class="ai-words"><div class="ai-orb" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div><span class="eyebrow">Example input</span><h3></h3></div></div>
    <div class="ai-route" aria-label="Processing stages"></div><h4></h4><p></p><div class="ai-example"></div></div><div class="plate-foot"><span class="tiny">Bundled knowledge</span><span>1,655 distinct Q&amp;A keys</span></div></div>`;let e=i.querySelector(".app-tabs");function t(n){let s=Ru[n],r=i.querySelector(".ai-case");[...e.children].forEach((c,l)=>c.setAttribute("aria-pressed",n===l)),r.querySelector("h3").textContent=s.prompt,r.querySelector("h4").textContent=s.action,r.querySelector("p").textContent=s.hint;let a=r.querySelector(".ai-route");a.replaceChildren(),s.nodes.forEach((c,l)=>{let h=document.createElement("span");h.textContent=c,h.style.setProperty("--step",l),a.append(h)});let o=r.querySelector(".ai-example");if(o.replaceChildren(),n===2){o.innerHTML='<label>Example link state <select aria-label="Example wearable connection"><option>Disconnected</option><option>Connected</option></select></label><output></output>';let c=o.querySelector("select"),l=o.querySelector("output"),h=()=>{l.textContent=c.selectedIndex?"The phone reports an active BLE link and reads the wearable battery field.":"The phone reports a disconnected link and directs the rider to the Wearable tab."};c.onchange=h,h()}n===3&&(o.innerHTML="<details><summary>Inspect one packaged Q&amp;A key</summary><p><b>what is sensor fusion</b><br>Stored under <code>fusion sensor</code>. The source answer describes accelerometer and gyroscope behavior.</p></details>")}Ru.forEach((n,s)=>{let r=document.createElement("button");r.textContent=n.tab,r.onclick=()=>t(s),e.append(r)}),t(0)}var Ea="docs/InnovateX Files/",Wp=Ea+"Draft/ResQTrack_-A-Smartphone-Paired-Wearable-Accident-Detection-and-LoRa-Alert-System-for-Vulnerable-Road-Users-1.pdf",Xp=Ea+"Real Research Paper for InnovateX/RAMS_InnovateX_2026_Research_Paper_Working_Draft.docx",jl="https://www.who.int/philippines/news/detail/31-05-2023-department-of-transportation--world-health-organization-launch-philippine-road-safety-action-plan-2023-2028",qp="apps/android_app/app/src/main/assets/motion_benchmarks/",sn={paper:{label:"InnovateX working research paper",path:Xp},team:{label:"Five researchers and institution, manuscript cover",path:Wp},who:{label:"WHO Philippines and DOTr, 31 May 2023, citing PSA",path:jl},motion:{label:"Android motion rules",path:"apps/android_app/app/src/main/java/com/example/ai/SensorAiInferenceEngine.kt"},catalog:{label:"RAMS public motion dataset directory",path:"docs/FREE_MOTION_DATASETS_DIRECTORY.md"},collector:{label:"IMU Studio raw-window and feature export",path:"apps/imu_studio_app/app/src/main/java/com/example/data/export/DatasetExporter.kt"},generator:{label:"Canonical motion waveform generator",path:"scripts/generate_benchmark_motion_datasets.py"},variations:{label:"Fixture variations and language asset generation",path:"scripts/train_rams_ai.py"},wearable:{label:"Phone-assisted wearable firmware",path:"firmware/wearable_withApp/wearable_withApp.ino"},protocol:{label:"Wearable and receiver packet contract",path:"firmware/shared/protocol.h"}},Ii=[{title:"Research brief",speaker:"Ernest John Galace",cue:"Introduce the people, the reporting gap and the research question.",ids:["overview","team","problem"]},{title:"On the road",speaker:"Precious Nina Garcia",cue:"Follow a road user from pairing to the first possible event.",ids:["pairing","scenarios","mobile"]},{title:"Motion evidence",speaker:"April Ann Palattao",cue:"Show how the team represents motion, builds fixtures and calibrates thresholds.",ids:["detection","datasets","calibration"]},{title:"Field system",speaker:"Stephanie Ranjo",cue:"Demonstrate RAMS AI, compare the boards and follow the radio packet.",ids:["assistant","hardware","relay"]},{title:"Station response",speaker:"Jan Clyde Talosig",cue:"Inspect the station, evaluate the evidence and close with the field trial.",ids:["desktop","validation","impact"]}],Yp=[{id:"team",title:"Presenters",headline:"The five researchers behind RAMS",summary:"The InnovateX manuscript credits five Electronics Engineering researchers from Cagayan State University, Carig Campus. Each presenter takes one part of the journey from road user to receiving station.",notes:[{title:"Introduce the group",text:"Read the five names in manuscript order. The speaking parts shown here are suggested assignments for rehearsal. They describe the presentation sequence."},{title:"Set the question",text:"Ask the audience to imagine an unwitnessed fall. Who can report it if the rider cannot reach the phone?"}],sources:[sn.team,sn.paper]},{id:"problem",title:"Reporting gap",headline:"Who calls when the rider cannot?",summary:"An injured rider may be unable to call or give a location. Can a phone recognize crash-like motion, and can a wearable relay that report to a staffed station when cellular coverage is poor?",notes:[{title:"Put the numbers in context",text:"The Philippine Statistics Authority recorded 7,938 road traffic deaths in 2011 and 11,096 in 2021, according to WHO Philippines and DOTr. These are national totals across all road users. They do not identify how many events involved delayed reporting."},{title:"Name the engineering problem",text:"Our engineering contribution connects a local motion decision and rider correction to a compact LoRa report and an operator\u2019s incident history. Test the two questions separately: count detection errors on held-out phone sessions, then measure delivery and elapsed time to a receiver in range."},{title:"Hand off to the road user",text:"The next presenter follows the same phone and wearable before, during and after an illustrated incident."}],sources:[sn.who,sn.paper,{label:"Public-domain coastline geometry \xB7 Natural Earth 1:50m",path:"https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/"}]},{id:"pairing",title:"Pair the wearable",headline:"The rider carries two parts of one system",summary:"Before setting out, the rider pairs the Android phone with the wearable over Bluetooth Low Energy. The phone supplies motion and location. The wearable gives that report a radio path.",notes:[{title:"Guide the pairing scene",text:"The figure and device placement illustrate use. The detailed circuit boards are in the Hardware chapter. Explain which components the rider carries and which device supplies the sensor data."},{title:"Distinguish the two links",text:"Pairing establishes a short-range link between phone and wearable. LoRa is the separate link from wearable to the station receiver. A receiver in radio range is still necessary."}],sources:[sn.wearable,{label:"Android BLE session manager",path:"apps/android_app/app/src/main/java/com/example/connectivity/Esp32ConnectionManager.kt"},sn.protocol]},{id:"scenarios",title:"Road incidents",headline:"Four incidents on the same road",summary:"Follow a motorcycle slide, a junction collision, a pedestrian strike and a fall while walking. Pause at contact. For each person, ask what a phone in their pocket could actually sense.",notes:[{title:"Compare the four reconstructions",text:"Watch how the wearer changes orientation after the motorcycle slide and how their motion changes at the crossing. In the fourth scene, the wearer loses their footing on level ground. Compare what their phone could sense with the separate dropped-phone fixture in Detection."},{title:"Keep the evidence clear",text:"These scenes are illustrative. Their animation timing is for explanation. The 121 synthetic fixtures evaluate alarm flags on stored features and provide no measured detection rate for these incident types."},{title:"Move into the app",text:"Show the Android interface next. It is the connection between an incident on the road and the information available to the wearable."}],sources:[sn.paper,sn.motion,sn.wearable,{label:"Illustrated road sequences and model credits",path:Ea+"RAMS Presentation/public/scenarios/sources.md"}]},{id:"datasets",title:"Data origins",headline:"Where the motion data came from",summary:"The project contains a public research catalog, locally generated benchmark traces and software for collecting labeled phone sessions. Each serves a different part of development.",notes:[{title:"Start with the catalog",text:"The project directory names SisFall, MobiFall and MobiAct, UP-Fall, a pothole and speed-bump dataset, UCI smartphone activity recognition and UMAFall. They describe useful falls, ordinary activities and road disturbances. A filename or dataset-origin tag alone cannot establish that a particular recording was imported."},{title:"Inspect the files actually used",text:"The Android app bundles 121 generated JSON traces, eleven per scenario family. Each base trace uses a local waveform generator. The training script creates variations. The small charts use the 50 acceleration values in each base file."},{title:"Explain how measured sessions enter",text:"IMU Studio can label a session and export both time-stamped inertial readings and windowed features. Android accepts labeled CSV or supported JSON for calibration. A field evaluation needs identifiable sessions with a collection protocol and a held-out split."}],sources:[sn.catalog,sn.generator,sn.variations,sn.collector,{label:"Labeled calibration import",path:"apps/android_app/app/src/main/java/com/example/sensor/ImuCalibrationManager.kt"},{label:"Base walking fixture",path:qp+"benchmark_walking.json"}]},{id:"impact",title:"Impact",headline:"Give the station a report it can act on",summary:"For the rider, the aim is a way to report an incident when calling is difficult. For the station, it is a location and event record to review. The next trial must measure how often that handoff succeeds.",notes:[{title:"Close the reporting gap",text:"Return to the original question. A phone can identify a candidate event, a paired wearable can relay it and an operator can review it. Radio reach, a valid fix and a staffed receiving workflow all matter."},{title:"Define a credible impact study",text:"With participant consent, restrict access to identifiable routes and profiles and use coded records in the study. Measure false alerts, missed events, event-to-station time and hours per charge. Record receiver uptime and staffing before estimating whether a station can sustain the service."},{title:"Hand off to the four-minute prototype demonstration",text:"Show the paired phone and fabricated carrier. Trigger a clearly identified test event and observe what the receiver and station actually receive. Keep the synthetic replay and staged scenes available during the five-minute defense."}],sources:[sn.paper,sn.protocol,{label:"Connectivity and field sweep plan",path:"docs/agent/CONNECTIVITY_FIX_PLAN.md"},{label:"InnovateX finals presentation and defense, page 9",path:Ea+"Competition Guidelines/ESAC-2026_Competition-Guidelines_InnovateX.pdf"}]}],Nu=new Map([...Tu,...Yp,...Cu].map(i=>[i.id,i])),Ra=Ii.flatMap((i,e)=>i.ids.map(t=>{if(!Nu.has(t))throw new Error("Missing presentation chapter "+t);return{...Nu.get(t),actIndex:e}})),Kp=[30,45,75,50,120,70,70,80,70,80,80,70,75,75,60],Zp={overview:15,team:15,problem:35,scenarios:35,calibration:55,assistant:35,hardware:35,relay:45,desktop:30,validation:40,impact:20};function Aa(i){return Math.floor(i/60)+":"+String(i%60).padStart(2,"0")}function Ca(i){let e=0;return Ra.flatMap((t,n)=>{let s=i?Zp[t.id]:Kp[n];if(!s)return[];let r=e;return e+=s,[{...t,timing:Aa(r)+"\u2013"+Aa(e),duration:s}]})}var Uu={navigation:[["Choose Full exhibit or Finals talk before starting.","We will follow the report from the road to the operator. The full exhibit gives us time to inspect the evidence at each step."],["Press F or use Enter fullscreen. Press F again to leave.","Let me give the road the full screen so everyone can follow the route."],["Use Next chapter, the right arrow or a clicker. Use the left arrow to return.","Let\u2019s follow what happens next. If we move back one step, we can see where that information came from."],["Open Chapter index with I. Choose a chapter, or click a section along the bottom.","We can go straight to the part you asked about. Each section follows one presenter\u2019s part of the same report."],["Open Field notes with N. Expand Inspect source records. Close with Esc.","Here is the source for this step. The notes identify the project file or published record behind the claim."],["Open Presenter script inside Field notes, or use the PDF on another screen.","These cues follow the controls in the order we are demonstrating them. Let\u2019s return to the exhibit."],["If WebGL is unavailable, point to the local stills or use the film controls.","The same equipment and incident stages are visible here. I\u2019ll use the pictures to show the component or phase we are discussing."]],chapters:{overview:{full:[["Face the audience. Leave the road moving.","Two riders reach this bend. One hits a pothole and rides on. The other falls and cannot reach the phone. Both phones feel a jolt. Which one should raise an alarm?"],["Drag slowly along the corridor. Click Sweep terrain.","Follow the amber road. If nobody sees the fall, how does the report leave this bend?"],["Click Begin presentation.","That is the question behind our Road Accident Monitoring System."]],finals:[["Hold the opening view. Click Begin presentation.","A pothole and a fall can both jolt a phone. Which one needs a report, and how does it reach a station? That is the question behind RAMS."]],more:[["Click Lens rain, then click again to clear it.","Look at how little of the bend you can see through a wet lens. A witness is one way an incident gets reported. On a quiet road there may be none."],["Pause scene motion, then resume.","Hold the view here. The amber line is the route we will follow from rider to receiving station."]]},team:{full:[["Point to each name in order.","I\u2019m Ernest John Galace. With me are Precious Nina Garcia, April Ann Palattao, Stephanie Ranjo and Jan Clyde Talosig. We are Electronics Engineering researchers from Cagayan State University, Carig Campus."],["Indicate the five speaking parts. Click Next chapter.","Precious will take us onto the road. April will show us what the phone measures. Stephanie will open the wearable and follow the radio signal. Jan will meet it at the desk. First, why does that handoff matter?"]],finals:[["Indicate the names. Advance.","I\u2019m Ernest John Galace. With Precious Nina Garcia, April Ann Palattao, Stephanie Ranjo and Jan Clyde Talosig, we built this project at Cagayan State University, Carig Campus."]],more:[]},problem:{full:[["Indicate 2011, then 2021.","The Philippine Statistics Authority recorded 7,938 road traffic deaths in 2011 and 11,096 in 2021. WHO Philippines and the Department of Transportation reported those figures. Each number is a national total across road users."],["Hold on the coastline.","Those totals cannot tell us how long any one person waited for help. Our question is narrower. If an injured person cannot call or give directions, what useful information could reach an operator?"],["Advance and hand over to Precious.","Precious, take us to the rider before the trip. What has to be working before an alert can leave the road?"]],finals:[["Compare the two years. Advance to Road incidents.","The Philippines recorded 11,096 road traffic deaths in 2021. When a rider cannot call or describe a location, who makes the first report? We linked a phone\u2019s motion detector to a wearable radio and a receiving station. We asked two questions. Can the phone distinguish crash-like motion from ordinary movement? Can a report reach an operator when cellular coverage is poor?"]],more:[["Open Source during questions. Return to the exhibit tab.","This is the dated WHO and Department of Transportation release citing the Philippine Statistics Authority. It supplies the national context for our question."]]},pairing:{full:[["Let Prepare play. Point to the phone.","Watch the two devices the wearer carries. The phone senses motion and supplies a location when it has a fix. The paired wearable carries the radio."],["Pause when the Bluetooth link appears.","This short connection is Bluetooth Low Energy. It joins the phone to the wearable I\u2019m carrying. The wearable contains the radio that can reach a receiver farther away."],["Resume to Monitor. Advance.","With those two devices paired, follow what happens when ordinary travel is interrupted."]],finals:[],more:[["Drag the timeline back to Prepare. Click Replay scenario.","Watch the order once more. The phone and wearable first establish a local connection. A station enters the picture later."]]},scenarios:{full:[["Let Motorcycle play into the slide; pause it.","Look at the rider as the bike leans over. The initial jolt is brief, but the rider\u2019s orientation can stay changed after the slide. A phone carried on the body can register part of that sequence."],["Click Car. Watch the junction contact; scrub just past it.","Now watch the two vehicles meet. The bodywork deforms and the vehicles lose speed. The phone measures its own motion. It cannot tell us how much damage either vehicle sustained."],["Click Pedestrian. Pause at the crossing.","Here the person carrying the phone is on foot. Watch the motion before contact and then the change as the person loses balance. We have changed who carries the sensor."],["Click Fall. Play Walking, pause at Loss of footing, then resume to Ground contact.","Watch the wearer lose their footing while walking. Their phone could register the impact when they land. A phone that slips from their hand could also register an impact. That is why a single peak is hard to interpret."],["Click Next chapter.","These are illustrated incidents. Let\u2019s see what the actual phone app makes available to its rider."]],finals:[["Select Fall. Let the wearer walk, lose their footing and land. Advance to Calibration.","Watch the wearer lose their footing. Their phone could register an impact when they land. A dropped phone can register one too. The phone senses how it moves. It cannot tell what the person fell from, and a slow fall may escape detection. April will show how we tested that distinction."]],more:[["Select any scenario and click Replay scenario.","Watch the seconds before contact this time. Ordinary motion gives us the context that a single peak cannot."],["Drag the timeline backwards. Then press the right arrow while the slider has focus.","We can inspect the same instant again. These are staged motions for explanation. Their timing does not measure performance on real people."]]},mobile:{full:[["Select Wearable and Enlarge capture. Close it.","This is the Android Wearable screen in a disconnected session. The rider can scan, choose a wearable and check the link state here. A disconnected screen is useful because it makes a missing link visible before travel."],["Select Telemetry. Enlarge it, point to the axes and close it.","The phone shows acceleration and rotation. This capture has an empty sensor history. On a trip, readings come from the phone\u2019s sensors."],["Select Voice. Advance to Detection and hand over to April.","This earlier handset capture shows the voice overlay. A rider can issue a supported command without navigating the screen. April, which readings help distinguish a fall from an ordinary jolt?"]],finals:[],more:[]},detection:{full:[["Start on Pothole. Click Play trace.","This pothole reaches 4.18 g. Watch the cursor pass the peak. The plot covers just under one second, and playback is slowed so we can follow it."],["Click Pause trace or drag the sample slider.","Each point is one sample. The readout tells us the time and acceleration at that instant. The phone ends almost level in this fixture."],["Select Walking, then Phone drop.","Walking gives a repeating pattern. A loose phone can produce a sharp shock all by itself. A high reading needs context."],["Select Fall, then Impact. Advance.","This Fall trace models a rider going over the handlebars at 42 kilometers per hour. It is a separate synthetic example from the pedestrian animation. The impact example peaks at 8.50 g. Let\u2019s look at where the data came from."]],finals:[],more:[]},datasets:{full:[["Start on Packaged traces. Select Fall, then Pothole.","The small charts share a scale. Select a family and you can read its base peak, change in tilt and file count. There are eleven files per family. The public research catalog and these generated files have different origins."],["Click Source catalog.","SisFall and MobiFall are among the research datasets our project names. They document falls and ordinary activities. We can trace the 121 files shipped in our app to our local generator and its variations."],["Click Field collection. Return to Packaged traces and advance.","For measured evidence, IMU Studio can record a labeled phone session and export readings and features. We would keep entire sessions aside for evaluation so the same trip does not appear on both sides of the test."]],finals:[],more:[["Select Fall.","This synthetic over-the-handlebars fall ends with a large change of orientation. It represents a moving rider."],["Select Impact.","Here the short shock reaches 8.50 g. Read the peak beside the tilt."],["Select Skid.","A skid can have a smaller peak and still finish at a different angle."],["Select Normal ride.","This is the baseline of a moving vehicle in the generator."],["Select Phone drop.","The handset can hit the ground while its owner stays upright."],["Select Phone shake.","Repetitive shaking gives the classifier another ordinary disturbance to recognize."],["Select Pothole.","A pothole can produce a strong shock while the phone finishes almost level."],["Select Running.","The repeating peaks come from the modeled running cadence."],["Select Speed bump.","Here the motion is spread across a rise and fall as the vehicle passes a bump."],["Select Walking.","A regular walking rhythm gives us another comparison with a sudden fall."],["Select Wind flutter.","Small rapid oscillations represent the disturbance of riding in the wind."],["Open a linked dataset title. Return to the exhibit.","This is the publisher\u2019s record for the selected collection. The traces we plotted come from the packaged Android fixtures."]]},calibration:{full:[["Start on Dataset, then select Threshold.","Here are 33 accident-labeled and 88 benign fixtures. To see what calibration does, take the default pothole and impact sessions. Their peaks leave a gap. The CSV import rule places the example threshold halfway between them."],["Set Benign session to Dropped phone.","Dropping the phone changes the benign peak. Watch the threshold move as the example changes."],["Set Accident-labeled session to Skid.","The benign peak now exceeds the skid peak. The import uses the accident peak in this case. A single cutoff cannot separate the two."],["Click Rider feedback. Let the room read the three steps.","If I dismiss a false alarm, the phone stops the alarm, records the dismissal and requests a cancellation through the wearable. That tap does not store a new motion pattern. The classifier has a separate saved-pattern matcher for peaks below six g."],["Select Language. Advance and hand over to Stephanie.","Voice uses a different resource. The app has written name variants, wake prefixes and a generated question-and-answer file. Stephanie will show how a spoken request becomes an app action."]],finals:[["Show the generated corpus. Select Threshold and point to the midpoint.","We chose rules that run on the phone without internet. We can inspect why a jolt triggered an alert. The rules consider acceleration, rotation, tilt and speed when available. Our scripts generated 121 traces across eleven scenarios. Public fall datasets were research references. Here, labeled sessions set a threshold halfway between the highest benign peak and lowest accident peak when there is a gap."],["Select Rider feedback. Advance to RAMS AI.","When a rider cancels, the app stops the alarm, records the dismissal and requests a correction. That button alone does not teach the detector a new motion. Stephanie will show where voice fits."]],more:[["Set Normal ride under Benign session.","A smoother benign example moves the comparison point. We are using that selected session\u2019s peak."],["Set Fall under Accident-labeled session.","A fall gives us another labeled accident to compare with that ordinary ride."],["Restore Pothole and Impact.","Real CSV calibration considers all labeled sessions in the file. These two fixtures let us see the arithmetic."]]},assistant:{full:[["Click Wake word. Follow Speech, Pattern, Wake.","Say \u201CHey RAMS.\u201D Android transcribes the sound. RAMS compares candidate text with its written wake patterns. That is why a spelling such as \u201Crhams\u201D can still open the command window."],["Click App action.","\u201CLakad ako\u201D gives the app a walking intent. It can switch the user category to Pedestrian and prepare a spoken confirmation."],["Click Personal reply. Select Connected, then Disconnected.","Ask, \u201CIs my wearable connected?\u201D With a link, the app can use the current state and reported battery. Without it, the useful answer is where to pair. The same question can need two different answers."],["Click Gemini cache. Open the packaged Q&A key, then close it. Advance.","A successful answer to an eligible online query can be cached under a normalized key. The example here comes from the separate bundled collection. \u201CWhat is sensor fusion?\u201D maps to \u201Cfusion sensor.\u201D The app ships 1,655 generated Q&A entries."]],finals:[["Select App action, then Personal reply. Choose Connected. Advance to Hardware.","The phrase on screen means \u201CI\u2019m walking.\u201D Android transcribes it, and RAMS uses the words to select the pedestrian profile. Ask if the wearable is connected and RAMS checks the device state. Its personal assistant also has 1,655 generated question-and-answer entries. Those words help with replies. The phone makes its motion decision separately."]],more:[]},hardware:{full:[["Start on Prototype. Drag to orbit, then zoom in.","This is a reconstruction of our fabricated 50 by 43 millimeter carrier. Look for the SuperMini development module, the separate Ra-02 radio breakout and the buzzer. The board layout and manuscript guided this view."],["Click Flip board. Click Reset board view.","This side shows how the carrier brings the module connections onto one board. Returning to the top gives us the same starting angle for a fair comparison."],["Select Custom SMD. Drag to orbit the RAMS Wearable.","Our four-layer RAMS Wearable is 42 by 32 millimeters. Its ESP32-S3 mounts directly to the board, freeing the space occupied by the plug-in module on the prototype."],["Click Flip board; hold on the underside.","There is the Ra-02 radio on the underside. Putting it here changes how the parts share the board area. This is the CAD assembly. Electrical operation of an assembled first article still needs verification."],["Click Reset board view, then Next chapter.","We have seen where the radio sits. Now follow the actual information it needs to send."]],finals:[["Select Prototype, then Custom SMD.","We hand-built the carrier with a SuperMini and an Ra-02 radio. Claude helped with the engineering brief, and ChatGPT helped design the custom four-layer board. The processor mounts directly on that board."],["Click Flip board. Hold, then advance.","Turn it over to see the Ra-02 underneath. That is the CAD design. We will demonstrate the SuperMini carrier."]],more:[["Scroll or pinch to zoom out. Click Prototype again.","At this scale the difference is easier to see. Both designs serve the wearable radio role. They package its components differently."]]},relay:{full:[["Select Phone. Follow the camera in.","The handset assesses motion and supplies coordinates when it has a location fix."],["Click Follow the signal to Wearable.","Bluetooth carries the event to the wearable. The wearable prepares the radio packet."],["Click Follow the signal to Receiver. Hold through the camera move.","Watch the camera pull back. The 433 megahertz LoRa hop ends at a receiver in range. Actual range needs field measurements."],["Select Header.","Thirteen bytes identify the message type, device token and sender\u2019s uptime counter."],["Select Latitude.","Four bytes carry the latitude of the available fix."],["Select Longitude.","Four more carry longitude. Together these values locate the report."],["Select Event.","One byte carries the event code."],["Select Peak g.","Four bytes carry peak acceleration. That brings us to 26. The registered profile travels separately."],["Select Station; click Replay handoff. Advance and hand over to Jan.","USB takes the decoded report to Windows. Jan, show us what the operator can open."]],finals:[["Select Wearable, then Receiver. Point to the byte groups.","Bluetooth carries the phone\u2019s event to the wearable. LoRa carries a 26-byte packet to a receiver in range. Thirteen bytes are the header. Coordinates take eight, the event code takes one, and peak acceleration takes four."],["Select Station. Advance to the rescue desk.","The receiver forwards the report over USB. Profile details and cancellations travel separately. Jan will show what the operator sees."]],more:[["Click a previous node or select the same node again.","Let\u2019s follow that boundary again. The radio path connects wearable to receiver. The desk gets the decoded report over a different link."]]},desktop:{full:[["Open Incident map. Point to the pins.","This station view uses fictional demonstration records. Each marker represents a wearable. A location gives the operator a starting point. It does not by itself identify a person or explain their condition."],["Select the red Lina pin. Open rider profile.","This pin brings up Lina Cruz. We can read the identity associated with this device and compare it with the incident we selected. The token helps connect a radio report to information registered separately."],["Select Incident history. Point to the newest entry, then the earlier cancellation.","Here is Lina\u2019s current alert. There is a prior cancellation and an earlier registration in the same person\u2019s history. The earlier cancellation belongs to its own event. It does not clear today\u2019s alert."],["Open Registered profiles. Choose another person, then return to the map.","This is a second way into the records. Change the rider and the linked history changes too. An operator can check the right person before coordinating a response."],["Click Next chapter.","We have followed a report to a human decision. Now let\u2019s ask which parts of that chain we have actually measured."]],finals:[["Select Lina\u2019s red pin. Open rider profile, then Incident history. Advance.","These records are fictional. Lina\u2019s pin opens her profile. Her history shows today\u2019s alert and an earlier cancellation. An operator reviews the report and decides whom to contact. In a field trial, we would obtain consent, restrict access to identifiable locations and use coded records for analysis."]],more:[["Choose the Ivo pin.","Ivo\u2019s record is a test. The operator can recognize a test transmission before treating it as an active alert."],["Choose the Mara pin.","Mara\u2019s record is cleared. A cleared state belongs to that particular record."],["Open Diagnostics. Select Reception, then Enlarge capture. Close.","This is the project\u2019s receiver diagnostics screen. The modeled airtime on that screen is an estimate. Field latency requires timestamps from the sender and receiver."],["Select Unit registry, then Hotspots. Enlarge a capture and close it.","The registry capture shows the dashboard\u2019s empty state. The hotspot screen groups stored coordinates. Three nearby historical points can meet its default clustering threshold. That is a different question from one person\u2019s incident history."]]},validation:{full:[["Indicate 33 / 33, then 88 / 88.","We replayed stored features from 121 generated fixtures through the compiled Android classifier on a desktop JVM. All 33 accident flags and all 88 benign flags matched. This run began after feature extraction."],["Point to Subtype errors.","The binary answer hid a mistake. All eleven potholes received the wind-flutter subtype. Both suppress the alarm. The eleven fall fixtures were labeled as severe collisions. They still raised an alert, but that description of the motion was wrong."],["Advance.","The next evidence has to come from separate measured trips, packet delivery tests and synchronized timing through to the station."]],finals:[["Point to both counts and the two subtype errors. Advance.","We replayed stored features through the compiled Android classifier. It flagged all 33 accident examples and suppressed all 88 benign ones. But all eleven potholes were called wind flutter, and all eleven over-the-handlebars examples were called severe collisions. We started after feature extraction, using generated examples. Their scores tell us how the rules behaved in this replay. Accuracy on real trips and time to the station still need testing."]],more:[["Open Field notes, then Inspect source records. Open JVM replay results. Return and close notes.","This file gives one result per fixture and identifies the code and inputs used. A judge can inspect the individual errors behind the totals."]]},impact:{full:[["Select Road user.","For the rider, the benefit we want is a second way to report an incident. In trials, we would count both missed events and false alerts per labeled trip."],["Select Receiving station.","For the station, measure how many packets arrive, whether the location is usable, and how long the report takes to reach the desk."],["Select Response team. Face the audience.","For the person answering, the test is whether the record supports a timely decision. Could the operator acknowledge it, identify the right rider and act on the location? Those are outcomes we can measure."],["Hand over to the prototype demonstration.","We began with a rider who might be unable to call. We can now show the next step in person, with a clearly identified test event and the equipment in front of us."]],finals:[["Select Response team. Hand over to the four-minute prototype demonstration.","In a field pilot we would measure missed alerts, delivery time and hours per charge. We would also check who can keep the receiver staffed and powered. Now we\u2019ll demonstrate the prototype."]],more:[["Click Return to overview when the demonstration ends.","We are back at the road where the report began. We can revisit the circuit board, motion data or receiving station for your questions."]]}}};var Xi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},qi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Td=0,Bc=1,Ed=2;var sa=1,Ad=2,ir=3,Qn=0,Yt=1,Dt=2,Ai=0,sr=1,kc=2,zc=3,Hc=4,Rd=5;var _s=100,Cd=101,Pd=102,Id=103,Ld=104,Dd=200,Nd=201,Ud=202,Fd=203,Gc=204,Vc=205,Od=206,Bd=207,kd=208,zd=209,Hd=210,Gd=211,Vd=212,Wd=213,Xd=214,io=0,so=1,ro=2,zs=3,ao=4,oo=5,lo=6,co=7,Fo=0,qd=1,Yd=2,ei=0,Wc=1,Xc=2,qc=3,ra=4,Yc=5,Kc=6,Zc=7,Ec="attached",Kd="detached",$c=300,xs=301,rr=302,Oo=303,Bo=304,ki=1e3,wn=1001,Hs=1002,bt=1003,ko=1004;var ys=1005;var St=1006,ar=1007;var An=1008;var dn=1009,Jc=1010,jc=1011,or=1012,zo=1013,zn=1014,_n=1015,Hn=1016,Ho=1017,Go=1018,vs=1020,Qc=35902,eh=35899,th=1021,nh=1022,Rn=1023,fi=1026,Ri=1027,Vo=1028,Wo=1029,Yi=1030,Xo=1031;var qo=1033,aa=33776,oa=33777,la=33778,ca=33779,Yo=35840,Ko=35841,Zo=35842,$o=35843,Jo=36196,jo=37492,Qo=37496,el=37488,tl=37489,ha=37490,nl=37491,il=37808,sl=37809,rl=37810,al=37811,ol=37812,ll=37813,cl=37814,hl=37815,ul=37816,dl=37817,fl=37818,pl=37819,ml=37820,gl=37821,_l=36492,xl=36494,yl=36495,vl=36283,bl=36284,ua=36285,Sl=36286;var os=2300,ls=2301,to=2302,Ac=2303,Rc=2400,Cc=2401,Pc=2402,Zd=2500;var ih=0,da=1,lr=2,$d=3200;var fa=0,Jd=1,Gn="",Ct="srgb",It="srgb-linear",Fr="linear",nt="srgb";var no=7680;var jd=519,Qd=512,ef=513,tf=514,sh=515,nf=516,sf=517,rh=518,ah=519,oh=35044;var lh="300 es",Tn=2e3,Gs=2001;function Jp(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function jp(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Vs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function rf(){let i=Vs("canvas");return i.style.display="block",i}var Fu={},Ws=null;function Or(...i){let e="THREE."+i.shift();Ws?Ws("log",e,...i):console.log(e,...i)}function af(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Ae(...i){i=af(i);let e="THREE."+i.shift();if(Ws)Ws("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Fe(...i){i=af(i);let e="THREE."+i.shift();if(Ws)Ws("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function as(...i){let e=i.join(" ");e in Fu||(Fu[e]=!0,Ae(...i))}function of(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var lf={[io]:io,[ro]:lo,[ao]:ao,[zs]:oo,[so]:so,[lo]:ro,[co]:co,[oo]:zs},Fn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},$t=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ou=1234567,Lr=Math.PI/180,cs=180/Math.PI;function ti(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return($t[i&255]+$t[i>>8&255]+$t[i>>16&255]+$t[i>>24&255]+"-"+$t[e&255]+$t[e>>8&255]+"-"+$t[e>>16&15|64]+$t[e>>24&255]+"-"+$t[t&63|128]+$t[t>>8&255]+"-"+$t[t>>16&255]+$t[t>>24&255]+$t[n&255]+$t[n>>8&255]+$t[n>>16&255]+$t[n>>24&255]).toLowerCase()}function Ge(i,e,t){return Math.max(e,Math.min(t,i))}function ch(i,e){return(i%e+e)%e}function Qp(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function em(i,e,t){return i!==e?(t-i)/(e-i):0}function Dr(i,e,t){return(1-t)*i+t*e}function tm(i,e,t,n){return Dr(i,e,1-Math.exp(-t*n))}function nm(i,e=1){return e-Math.abs(ch(i,e*2)-e)}function im(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function sm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function rm(i,e){return i+Math.floor(Math.random()*(e-i+1))}function am(i,e){return i+Math.random()*(e-i)}function om(i){return i*(.5-Math.random())}function lm(i){i!==void 0&&(Ou=i);let e=Ou+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function cm(i){return i*Lr}function hm(i){return i*cs}function um(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function dm(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function hh(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function fm(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),d=a((e-n)/2),f=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*h,c*u,c*d,o*l);break;case"YZY":i.set(c*d,o*h,c*u,o*l);break;case"ZXZ":i.set(c*u,c*d,o*h,o*l);break;case"XZX":i.set(o*h,c*g,c*f,o*l);break;case"YXY":i.set(c*f,o*h,c*g,o*l);break;case"ZYZ":i.set(c*g,c*f,o*h,o*l);break;default:Ae("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Ml(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function uh(i,e){if(e.constructor===Float32Array)return i;let t=Ml(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function dh(i,e){if(e.constructor===Float32Array)return i;let t=Ml(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}var ht={DEG2RAD:Lr,RAD2DEG:cs,generateUUID:ti,clamp:Ge,euclideanModulo:ch,mapLinear:Qp,inverseLerp:em,lerp:Dr,damp:tm,pingpong:nm,smoothstep:im,smootherstep:sm,randInt:rm,randFloat:am,randFloatSpread:om,seededRandom:lm,degToRad:cm,radToDeg:hm,isPowerOfTwo:um,ceilPowerOfTwo:dm,floorPowerOfTwo:hh,setQuaternionFromProperEuler:fm,normalize:dh,denormalize:uh},_e=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ge(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ge(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},jt=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let c=n[s+0],l=n[s+1],h=n[s+2],u=n[s+3],d=r[a+0],f=r[a+1],g=r[a+2],x=r[a+3];if(u!==x||c!==d||l!==f||h!==g){let m=c*d+l*f+h*g+u*x;m<0&&(d=-d,f=-f,g=-g,x=-x,m=-m);let p=1-o;if(m<.9995){let y=Math.acos(m),M=Math.sin(y);p=Math.sin(p*y)/M,o=Math.sin(o*y)/M,c=c*p+d*o,l=l*p+f*o,h=h*p+g*o,u=u*p+x*o}else{c=c*p+d*o,l=l*p+f*o,h=h*p+g*o,u=u*p+x*o;let y=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=y,l*=y,h*=y,u*=y}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],c=n[s+1],l=n[s+2],h=n[s+3],u=r[a],d=r[a+1],f=r[a+2],g=r[a+3];return e[t]=o*g+h*u+c*f-l*d,e[t+1]=c*g+h*d+l*u-o*f,e[t+2]=l*g+h*f+o*d-c*u,e[t+3]=h*g-o*u-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),h=o(s/2),u=o(r/2),d=c(n/2),f=c(s/2),g=c(r/2);switch(a){case"XYZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"YZX":this._x=d*h*u+l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u-d*f*g;break;case"XZY":this._x=d*h*u-l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u+d*f*g;break;default:Ae("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(a-s)*f}else if(n>o&&n>u){let f=2*Math.sqrt(1+n-o-u);this._w=(h-c)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+l)/f}else if(o>u){let f=2*Math.sqrt(1+o-n-u);this._w=(r-l)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(c+h)/f}else{let f=2*Math.sqrt(1+u-n-o);this._w=(a-s)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ge(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+a*o+s*l-r*c,this._y=s*h+a*c+r*o-n*l,this._z=r*h+a*l+n*c-s*o,this._w=a*h-n*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){let l=Math.acos(o),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Bu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Bu.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*n),h=2*(o*t-r*s),u=2*(r*n-a*t);return this.x=t+c*l+a*u-o*h,this.y=n+c*h+o*l-r*u,this.z=s+c*u+r*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this.z=Ge(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this.z=Ge(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ge(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ql.copy(this).projectOnVector(e),this.sub(Ql)}reflect(e){return this.sub(Ql.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ge(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ql=new P,Bu=new jt,Oe=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,s,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l)}set(e,t,n,s,r,a,o,c,l){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],x=s[0],m=s[3],p=s[6],y=s[1],M=s[4],v=s[7],E=s[2],T=s[5],_=s[8];return r[0]=a*x+o*y+c*E,r[3]=a*m+o*M+c*T,r[6]=a*p+o*v+c*_,r[1]=l*x+h*y+u*E,r[4]=l*m+h*M+u*T,r[7]=l*p+h*v+u*_,r[2]=d*x+f*y+g*E,r[5]=d*m+f*M+g*T,r[8]=d*p+f*v+g*_,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-n*r*h+n*o*c+s*r*l-s*a*c}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=h*a-o*l,d=o*c-h*r,f=l*r-a*c,g=t*u+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=u*x,e[1]=(s*l-h*n)*x,e[2]=(o*n-s*a)*x,e[3]=d*x,e[4]=(h*t-s*c)*x,e[5]=(s*r-o*t)*x,e[6]=f*x,e[7]=(n*c-l*t)*x,e[8]=(a*t-n*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return as("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ec.makeScale(e,t)),this}rotate(e){return as("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ec.makeRotation(-e)),this}translate(e,t){return as("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ec.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},ec=new Oe,ku=new Oe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),zu=new Oe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function pm(){let i={enabled:!0,workingColorSpace:It,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===nt&&(s.r=di(s.r),s.g=di(s.g),s.b=di(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===nt&&(s.r=ks(s.r),s.g=ks(s.g),s.b=ks(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Gn?Fr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[It]:{primaries:e,whitePoint:n,transfer:Fr,toXYZ:ku,fromXYZ:zu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ct},outputColorSpaceConfig:{drawingBufferColorSpace:Ct}},[Ct]:{primaries:e,whitePoint:n,transfer:nt,toXYZ:ku,fromXYZ:zu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ct}}}),i}var Xe=pm();function di(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ks(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ts,ho=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ts===void 0&&(Ts=Vs("canvas")),Ts.width=e.width,Ts.height=e.height;let s=Ts.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Ts}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Vs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=di(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(di(t[n]/255)*255):t[n]=di(t[n]);return{data:t,width:e.width,height:e.height}}else return Ae("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},mm=0,Xs=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:mm++}),this.uuid=ti(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(tc(s[a].image)):r.push(tc(s[a]))}else r=tc(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function tc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ho.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Ae("Texture: Unable to serialize Texture."),{})}var gm=0,nc=new P,Lt=class i extends Fn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=wn,s=wn,r=St,a=An,o=Rn,c=dn,l=i.DEFAULT_ANISOTROPY,h=Gn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:gm++}),this.uuid=ti(),this.name="",this.source=new Xs(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new _e(0,0),this.repeat=new _e(1,1),this.center=new _e(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Oe,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(nc).x}get height(){return this.source.getSize(nc).y}get depth(){return this.source.getSize(nc).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Ae(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Ae(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==$c)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ki:e.x=e.x-Math.floor(e.x);break;case wn:e.x=e.x<0?0:1;break;case Hs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ki:e.y=e.y-Math.floor(e.y);break;case wn:e.y=e.y<0?0:1;break;case Hs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Lt.DEFAULT_IMAGE=null;Lt.DEFAULT_MAPPING=$c;Lt.DEFAULT_ANISOTROPY=1;var rt=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,c=e.elements,l=c[0],h=c[4],u=c[8],d=c[1],f=c[5],g=c[9],x=c[2],m=c[6],p=c[10];if(Math.abs(h-d)<.01&&Math.abs(u-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+x)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let M=(l+1)/2,v=(f+1)/2,E=(p+1)/2,T=(h+d)/4,_=(u+x)/4,b=(g+m)/4;return M>v&&M>E?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=T/n,r=_/n):v>E?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=T/s,r=b/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=_/r,s=b/r),this.set(n,s,r,t),this}let y=Math.sqrt((m-g)*(m-g)+(u-x)*(u-x)+(d-h)*(d-h));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(u-x)/y,this.z=(d-h)/y,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this.z=Ge(this.z,e.z,t.z),this.w=Ge(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this.z=Ge(this.z,e,t),this.w=Ge(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ge(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},uo=class extends Fn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:St,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new rt(0,0,e,t),this.scissorTest=!1,this.viewport=new rt(0,0,e,t),this.textures=[];let s=n.count;for(let r=0;r<s;r++)this.textures[r]=new Lt({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:St,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Xs(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Qt=class extends uo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Br=class extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=bt,this.minFilter=bt,this.wrapR=wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var fo=class extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=bt,this.minFilter=bt,this.wrapR=wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var ze=class i{static{this.prototype.isMatrix4=!0}constructor(e,t,n,s,r,a,o,c,l,h,u,d,f,g,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l,h,u,d,f,g,x,m)}set(e,t,n,s,r,a,o,c,l,h,u,d,f,g,x,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=c,p[2]=l,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=g,p[11]=x,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Es.setFromMatrixColumn(e,0).length(),r=1/Es.setFromMatrixColumn(e,1).length(),a=1/Es.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=a*h,f=a*u,g=o*h,x=o*u;t[0]=c*h,t[4]=-c*u,t[8]=l,t[1]=f+g*l,t[5]=d-x*l,t[9]=-o*c,t[2]=x-d*l,t[6]=g+f*l,t[10]=a*c}else if(e.order==="YXZ"){let d=c*h,f=c*u,g=l*h,x=l*u;t[0]=d+x*o,t[4]=g*o-f,t[8]=a*l,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=f*o-g,t[6]=x+d*o,t[10]=a*c}else if(e.order==="ZXY"){let d=c*h,f=c*u,g=l*h,x=l*u;t[0]=d-x*o,t[4]=-a*u,t[8]=g+f*o,t[1]=f+g*o,t[5]=a*h,t[9]=x-d*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let d=a*h,f=a*u,g=o*h,x=o*u;t[0]=c*h,t[4]=g*l-f,t[8]=d*l+x,t[1]=c*u,t[5]=x*l+d,t[9]=f*l-g,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let d=a*c,f=a*l,g=o*c,x=o*l;t[0]=c*h,t[4]=x-d*u,t[8]=g*u+f,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=f*u+g,t[10]=d-x*u}else if(e.order==="XZY"){let d=a*c,f=a*l,g=o*c,x=o*l;t[0]=c*h,t[4]=-u,t[8]=l*h,t[1]=d*u+x,t[5]=a*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=o*h,t[10]=x*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(_m,e,xm)}lookAt(e,t,n){let s=this.elements;return pn.subVectors(e,t),pn.lengthSq()===0&&(pn.z=1),pn.normalize(),Li.crossVectors(n,pn),Li.lengthSq()===0&&(Math.abs(n.z)===1?pn.x+=1e-4:pn.z+=1e-4,pn.normalize(),Li.crossVectors(n,pn)),Li.normalize(),Pa.crossVectors(pn,Li),s[0]=Li.x,s[4]=Pa.x,s[8]=pn.x,s[1]=Li.y,s[5]=Pa.y,s[9]=pn.y,s[2]=Li.z,s[6]=Pa.z,s[10]=pn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],x=n[6],m=n[10],p=n[14],y=n[3],M=n[7],v=n[11],E=n[15],T=s[0],_=s[4],b=s[8],L=s[12],A=s[1],N=s[5],F=s[9],B=s[13],I=s[2],k=s[6],V=s[10],z=s[14],j=s[3],C=s[7],H=s[11],Y=s[15];return r[0]=a*T+o*A+c*I+l*j,r[4]=a*_+o*N+c*k+l*C,r[8]=a*b+o*F+c*V+l*H,r[12]=a*L+o*B+c*z+l*Y,r[1]=h*T+u*A+d*I+f*j,r[5]=h*_+u*N+d*k+f*C,r[9]=h*b+u*F+d*V+f*H,r[13]=h*L+u*B+d*z+f*Y,r[2]=g*T+x*A+m*I+p*j,r[6]=g*_+x*N+m*k+p*C,r[10]=g*b+x*F+m*V+p*H,r[14]=g*L+x*B+m*z+p*Y,r[3]=y*T+M*A+v*I+E*j,r[7]=y*_+M*N+v*k+E*C,r[11]=y*b+M*F+v*V+E*H,r[15]=y*L+M*B+v*z+E*Y,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],u=e[6],d=e[10],f=e[14],g=e[3],x=e[7],m=e[11],p=e[15],y=c*f-l*d,M=o*f-l*u,v=o*d-c*u,E=a*f-l*h,T=a*d-c*h,_=a*u-o*h;return t*(x*y-m*M+p*v)-n*(g*y-m*E+p*T)+s*(g*M-x*E+p*_)-r*(g*v-x*T+m*_)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],c=e[2],l=e[6],h=e[10];return t*(a*h-o*l)-n*(r*h-o*c)+s*(r*l-a*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=e[9],d=e[10],f=e[11],g=e[12],x=e[13],m=e[14],p=e[15],y=t*o-n*a,M=t*c-s*a,v=t*l-r*a,E=n*c-s*o,T=n*l-r*o,_=s*l-r*c,b=h*x-u*g,L=h*m-d*g,A=h*p-f*g,N=u*m-d*x,F=u*p-f*x,B=d*p-f*m,I=y*B-M*F+v*N+E*A-T*L+_*b;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/I;return e[0]=(o*B-c*F+l*N)*k,e[1]=(s*F-n*B-r*N)*k,e[2]=(x*_-m*T+p*E)*k,e[3]=(d*T-u*_-f*E)*k,e[4]=(c*A-a*B-l*L)*k,e[5]=(t*B-s*A+r*L)*k,e[6]=(m*v-g*_-p*M)*k,e[7]=(h*_-d*v+f*M)*k,e[8]=(a*F-o*A+l*b)*k,e[9]=(n*A-t*F-r*b)*k,e[10]=(g*T-x*v+p*y)*k,e[11]=(u*v-h*T-f*y)*k,e[12]=(o*L-a*N-c*b)*k,e[13]=(t*N-n*L+s*b)*k,e[14]=(x*M-g*E-m*y)*k,e[15]=(h*E-u*M+d*y)*k,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,h=r*o;return this.set(l*a+n,l*o-s*c,l*c+s*o,0,l*o+s*c,h*o+n,h*c-s*a,0,l*c-s*o,h*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,h=a+a,u=o+o,d=r*l,f=r*h,g=r*u,x=a*h,m=a*u,p=o*u,y=c*l,M=c*h,v=c*u,E=n.x,T=n.y,_=n.z;return s[0]=(1-(x+p))*E,s[1]=(f+v)*E,s[2]=(g-M)*E,s[3]=0,s[4]=(f-v)*T,s[5]=(1-(d+p))*T,s[6]=(m+y)*T,s[7]=0,s[8]=(g+M)*_,s[9]=(m-y)*_,s[10]=(1-(d+x))*_,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Es.set(s[0],s[1],s[2]).length(),o=Es.set(s[4],s[5],s[6]).length(),c=Es.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Dn.copy(this);let l=1/a,h=1/o,u=1/c;return Dn.elements[0]*=l,Dn.elements[1]*=l,Dn.elements[2]*=l,Dn.elements[4]*=h,Dn.elements[5]*=h,Dn.elements[6]*=h,Dn.elements[8]*=u,Dn.elements[9]*=u,Dn.elements[10]*=u,t.setFromRotationMatrix(Dn),n.x=a,n.y=o,n.z=c,this}makePerspective(e,t,n,s,r,a,o=Tn,c=!1){let l=this.elements,h=2*r/(t-e),u=2*r/(n-s),d=(t+e)/(t-e),f=(n+s)/(n-s),g,x;if(c)g=r/(a-r),x=a*r/(a-r);else if(o===Tn)g=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===Gs)g=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Tn,c=!1){let l=this.elements,h=2/(t-e),u=2/(n-s),d=-(t+e)/(t-e),f=-(n+s)/(n-s),g,x;if(c)g=1/(a-r),x=a/(a-r);else if(o===Tn)g=-2/(a-r),x=-(a+r)/(a-r);else if(o===Gs)g=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=u,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Es=new P,Dn=new ze,_m=new P(0,0,0),xm=new P(1,1,1),Li=new P,Pa=new P,pn=new P,Hu=new ze,Gu=new jt,Kn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Ge(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Ge(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ge(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Ge(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Ge(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Ge(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Ae("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Hu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Hu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Gu.setFromEuler(this),this.setFromQuaternion(Gu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Kn.DEFAULT_ORDER="XYZ";var kr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},ym=0,Vu=new P,As=new jt,ai=new ze,Ia=new P,Mr=new P,vm=new P,bm=new jt,Wu=new P(1,0,0),Xu=new P(0,1,0),qu=new P(0,0,1),Yu={type:"added"},Sm={type:"removed"},Rs={type:"childadded",child:null},ic={type:"childremoved",child:null},at=class i extends Fn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ym++}),this.uuid=ti(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new P,t=new Kn,n=new jt,s=new P(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ze},normalMatrix:{value:new Oe}}),this.matrix=new ze,this.matrixWorld=new ze,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new kr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return As.setFromAxisAngle(e,t),this.quaternion.multiply(As),this}rotateOnWorldAxis(e,t){return As.setFromAxisAngle(e,t),this.quaternion.premultiply(As),this}rotateX(e){return this.rotateOnAxis(Wu,e)}rotateY(e){return this.rotateOnAxis(Xu,e)}rotateZ(e){return this.rotateOnAxis(qu,e)}translateOnAxis(e,t){return Vu.copy(e).applyQuaternion(this.quaternion),this.position.add(Vu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Wu,e)}translateY(e){return this.translateOnAxis(Xu,e)}translateZ(e){return this.translateOnAxis(qu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ai.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ia.copy(e):Ia.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Mr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ai.lookAt(Mr,Ia,this.up):ai.lookAt(Ia,Mr,this.up),this.quaternion.setFromRotationMatrix(ai),s&&(ai.extractRotation(s.matrixWorld),As.setFromRotationMatrix(ai),this.quaternion.premultiply(As.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Fe("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Yu),Rs.child=e,this.dispatchEvent(Rs),Rs.child=null):Fe("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Sm),ic.child=e,this.dispatchEvent(ic),ic.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ai.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ai.multiply(e.parent.matrixWorld)),e.applyMatrix4(ai),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Yu),Rs.child=e,this.dispatchEvent(Rs),Rs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Mr,e,vm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Mr,bm,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let u=c[l];r(e.shapes,u)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),f=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){let c=[];for(let l in o){let h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};at.DEFAULT_UP=new P(0,1,0);at.DEFAULT_MATRIX_AUTO_UPDATE=!0;at.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ct=class extends at{constructor(){super(),this.isGroup=!0,this.type="Group"}},Mm={type:"move"},qs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ct,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ct,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ct,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,n),p=this._getHandJoint(l,x);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.quaternion,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;l.inputState.pinching&&d>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.quaternion,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Mm)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new ct;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},cf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Di={h:0,s:0,l:0},La={h:0,s:0,l:0};function sc(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ce=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ct){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Xe.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Xe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Xe.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Xe.workingColorSpace){if(e=ch(e,1),t=Ge(t,0,1),n=Ge(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=sc(a,r,e+1/3),this.g=sc(a,r,e),this.b=sc(a,r,e-1/3)}return Xe.colorSpaceToWorking(this,s),this}setStyle(e,t=Ct){function n(r){r!==void 0&&parseFloat(r)<1&&Ae("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ae("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Ae("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ct){let n=cf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Ae("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=di(e.r),this.g=di(e.g),this.b=di(e.b),this}copyLinearToSRGB(e){return this.r=ks(e.r),this.g=ks(e.g),this.b=ks(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ct){return Xe.workingToColorSpace(Jt.copy(this),e),Math.round(Ge(Jt.r*255,0,255))*65536+Math.round(Ge(Jt.g*255,0,255))*256+Math.round(Ge(Jt.b*255,0,255))}getHexString(e=Ct){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Xe.workingColorSpace){Xe.workingToColorSpace(Jt.copy(this),t);let n=Jt.r,s=Jt.g,r=Jt.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,l,h=(o+a)/2;if(o===a)c=0,l=0;else{let u=a-o;switch(l=h<=.5?u/(a+o):u/(2-a-o),a){case n:c=(s-r)/u+(s<r?6:0);break;case s:c=(r-n)/u+2;break;case r:c=(n-s)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=Xe.workingColorSpace){return Xe.workingToColorSpace(Jt.copy(this),t),e.r=Jt.r,e.g=Jt.g,e.b=Jt.b,e}getStyle(e=Ct){Xe.workingToColorSpace(Jt.copy(this),e);let t=Jt.r,n=Jt.g,s=Jt.b;return e!==Ct?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Di),this.setHSL(Di.h+e,Di.s+t,Di.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Di),e.getHSL(La);let n=Dr(Di.h,La.h,t),s=Dr(Di.s,La.s,t),r=Dr(Di.l,La.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Jt=new Ce;Ce.NAMES=cf;var On=class extends at{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Kn,this.environmentIntensity=1,this.environmentRotation=new Kn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Nn=new P,oi=new P,rc=new P,li=new P,Cs=new P,Ps=new P,Ku=new P,ac=new P,oc=new P,lc=new P,cc=new rt,hc=new rt,uc=new rt,Bi=class i{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Nn.subVectors(e,t),s.cross(Nn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Nn.subVectors(s,t),oi.subVectors(n,t),rc.subVectors(e,t);let a=Nn.dot(Nn),o=Nn.dot(oi),c=Nn.dot(rc),l=oi.dot(oi),h=oi.dot(rc),u=a*l-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(l*c-o*h)*d,g=(a*h-o*c)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,li)===null?!1:li.x>=0&&li.y>=0&&li.x+li.y<=1}static getInterpolation(e,t,n,s,r,a,o,c){return this.getBarycoord(e,t,n,s,li)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,li.x),c.addScaledVector(a,li.y),c.addScaledVector(o,li.z),c)}static getInterpolatedAttribute(e,t,n,s,r,a){return cc.setScalar(0),hc.setScalar(0),uc.setScalar(0),cc.fromBufferAttribute(e,t),hc.fromBufferAttribute(e,n),uc.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(cc,r.x),a.addScaledVector(hc,r.y),a.addScaledVector(uc,r.z),a}static isFrontFacing(e,t,n,s){return Nn.subVectors(n,t),oi.subVectors(e,t),Nn.cross(oi).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Nn.subVectors(this.c,this.b),oi.subVectors(this.a,this.b),Nn.cross(oi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;Cs.subVectors(s,n),Ps.subVectors(r,n),ac.subVectors(e,n);let c=Cs.dot(ac),l=Ps.dot(ac);if(c<=0&&l<=0)return t.copy(n);oc.subVectors(e,s);let h=Cs.dot(oc),u=Ps.dot(oc);if(h>=0&&u<=h)return t.copy(s);let d=c*u-h*l;if(d<=0&&c>=0&&h<=0&&c-h>0)return a=c/(c-h),t.copy(n).addScaledVector(Cs,a);lc.subVectors(e,r);let f=Cs.dot(lc),g=Ps.dot(lc);if(g>=0&&f<=g)return t.copy(r);let x=f*l-c*g;if(x<=0&&l>=0&&g<=0)return o=l/(l-g),t.copy(n).addScaledVector(Ps,o);let m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return Ku.subVectors(r,s),o=(u-h)/(u-h+(f-g)),t.copy(s).addScaledVector(Ku,o);let p=1/(m+x+d);return a=x*p,o=d*p,t.copy(n).addScaledVector(Cs,a).addScaledVector(Ps,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Xt=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Un.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Un.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Un.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Un):Un.fromBufferAttribute(r,a),Un.applyMatrix4(e.matrixWorld),this.expandByPoint(Un);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Da.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Da.copy(n.boundingBox)),Da.applyMatrix4(e.matrixWorld),this.union(Da)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Un),Un.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(wr),Na.subVectors(this.max,wr),Is.subVectors(e.a,wr),Ls.subVectors(e.b,wr),Ds.subVectors(e.c,wr),Ni.subVectors(Ls,Is),Ui.subVectors(Ds,Ls),ns.subVectors(Is,Ds);let t=[0,-Ni.z,Ni.y,0,-Ui.z,Ui.y,0,-ns.z,ns.y,Ni.z,0,-Ni.x,Ui.z,0,-Ui.x,ns.z,0,-ns.x,-Ni.y,Ni.x,0,-Ui.y,Ui.x,0,-ns.y,ns.x,0];return!dc(t,Is,Ls,Ds,Na)||(t=[1,0,0,0,1,0,0,0,1],!dc(t,Is,Ls,Ds,Na))?!1:(Ua.crossVectors(Ni,Ui),t=[Ua.x,Ua.y,Ua.z],dc(t,Is,Ls,Ds,Na))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Un).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Un).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ci[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ci[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ci[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ci[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ci[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ci[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ci[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ci[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ci),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},ci=[new P,new P,new P,new P,new P,new P,new P,new P],Un=new P,Da=new Xt,Is=new P,Ls=new P,Ds=new P,Ni=new P,Ui=new P,ns=new P,wr=new P,Na=new P,Ua=new P,is=new P;function dc(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){is.fromArray(i,r);let o=s.x*Math.abs(is.x)+s.y*Math.abs(is.y)+s.z*Math.abs(is.z),c=e.dot(is),l=t.dot(is),h=n.dot(is);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}var Tt=new P,Fa=new _e,wm=0,Wt=class extends Fn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:wm++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=oh,this.updateRanges=[],this.gpuType=_n,this.version=0,this._normalizationScale=e!==void 0?Ml(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Fa.fromBufferAttribute(this,t),Fa.applyMatrix3(e),this.setXY(t,Fa.x,Fa.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyMatrix3(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyMatrix4(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyNormalMatrix(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.transformDirection(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):uh(e,this.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):dh(e,this.array)}};var zr=class extends Wt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Hr=class extends Wt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Ue=class extends Wt{constructor(e,t,n){super(new Float32Array(e),t,n)}},Tm=new Xt,Tr=new P,fc=new P,cn=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Tm.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Tr.subVectors(e,this.center);let t=Tr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Tr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(fc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Tr.copy(e.center).add(fc)),this.expandByPoint(Tr.copy(e.center).sub(fc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Em=0,Mn=new ze,pc=new at,Ns=new P,mn=new Xt,Er=new Xt,Ht=new P,Qe=class i extends Fn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Em++}),this.uuid=ti(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Jp(e)?Hr:zr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Oe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Mn.makeRotationFromQuaternion(e),this.applyMatrix4(Mn),this}rotateX(e){return Mn.makeRotationX(e),this.applyMatrix4(Mn),this}rotateY(e){return Mn.makeRotationY(e),this.applyMatrix4(Mn),this}rotateZ(e){return Mn.makeRotationZ(e),this.applyMatrix4(Mn),this}translate(e,t,n){return Mn.makeTranslation(e,t,n),this.applyMatrix4(Mn),this}scale(e,t,n){return Mn.makeScale(e,t,n),this.applyMatrix4(Mn),this}lookAt(e){return pc.lookAt(e),pc.updateMatrix(),this.applyMatrix4(pc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ns).negate(),this.translate(Ns.x,Ns.y,Ns.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ue(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ae("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Xt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Fe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];mn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ht.addVectors(this.boundingBox.min,mn.min),this.boundingBox.expandByPoint(Ht),Ht.addVectors(this.boundingBox.max,mn.max),this.boundingBox.expandByPoint(Ht)):(this.boundingBox.expandByPoint(mn.min),this.boundingBox.expandByPoint(mn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Fe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new cn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Fe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){let n=this.boundingSphere.center;if(mn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Er.setFromBufferAttribute(o),this.morphTargetsRelative?(Ht.addVectors(mn.min,Er.min),mn.expandByPoint(Ht),Ht.addVectors(mn.max,Er.max),mn.expandByPoint(Ht)):(mn.expandByPoint(Er.min),mn.expandByPoint(Er.max))}mn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Ht.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Ht));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)Ht.fromBufferAttribute(o,l),c&&(Ns.fromBufferAttribute(e,l),Ht.add(Ns)),s=Math.max(s,n.distanceToSquared(Ht))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Fe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Fe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Wt(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],c=[],l=new Uint8Array(n.count);for(let L=0;L<n.count;L++)o[L]=new P,c[L]=new P;let h=new P,u=new P,d=new P,f=new _e,g=new _e,x=new _e,m=new P,p=new P;function y(L,A,N){l[L]=l[A]=l[N]=1,h.fromBufferAttribute(n,L),u.fromBufferAttribute(n,A),d.fromBufferAttribute(n,N),f.fromBufferAttribute(r,L),g.fromBufferAttribute(r,A),x.fromBufferAttribute(r,N),u.sub(h),d.sub(h),g.sub(f),x.sub(f);let F=1/(g.x*x.y-x.x*g.y);isFinite(F)&&(m.copy(u).multiplyScalar(x.y).addScaledVector(d,-g.y).multiplyScalar(F),p.copy(d).multiplyScalar(g.x).addScaledVector(u,-x.x).multiplyScalar(F),o[L].add(m),o[A].add(m),o[N].add(m),c[L].add(p),c[A].add(p),c[N].add(p))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let L=0,A=M.length;L<A;++L){let N=M[L],F=N.start,B=N.count;for(let I=F,k=F+B;I<k;I+=3)y(e.getX(I+0),e.getX(I+1),e.getX(I+2))}let v=new P,E=new P,T=new P,_=new P;function b(L){T.fromBufferAttribute(s,L),_.copy(T);let A=o[L];v.copy(A),v.sub(T.multiplyScalar(T.dot(A))).normalize(),E.crossVectors(_,A);let F=E.dot(c[L])<0?-1:1;a.setXYZW(L,v.x,v.y,v.z,F)}for(let L=0,A=n.count;L<A;++L)l[L]&&b(L);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Wt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let s=new P,r=new P,a=new P,o=new P,c=new P,l=new P,h=new P,u=new P;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),x=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),c.fromBufferAttribute(n,x),l.fromBufferAttribute(n,m),o.add(h),c.add(h),l.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ht.fromBufferAttribute(e,t),Ht.normalize(),e.setXYZ(t,Ht.x,Ht.y,Ht.z)}toNonIndexed(){function e(o,c){let l=o.array,h=o.itemSize,u=o.normalized,d=new l.constructor(c.length*h),f=0,g=0;for(let x=0,m=c.length;x<m;x++){o.isInterleavedBufferAttribute?f=c[x]*o.data.stride+o.offset:f=c[x]*h;for(let p=0;p<h;p++)d[g++]=l[f++]}return new Wt(d,h,u)}if(this.index===null)return Ae("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=e(c,n);t.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let h=0,u=l.length;h<u;h++){let d=l[h],f=e(d,n);c.push(f)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let l=n[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let u=0,d=l.length;u<d;u++){let f=l[u];h.push(f.toJSON(e.data))}h.length>0&&(s[c]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let l in s){let h=s[l];this.setAttribute(l,h.clone(t))}let r=e.morphAttributes;for(let l in r){let h=[],u=r[l];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let l=0,h=a.length;l<h;l++){let u=a[l];this.addGroup(u.start,u.count,u.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ys=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=oh,this.updateRanges=[],this.version=0,this.uuid=ti()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Zu(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[t]),s=new this.constructor(n,this.stride);return s.setUsage(this.usage),s}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Zu(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function Zu(i){return i.buffer._uuid===void 0&&(i.buffer._uuid=ti()),i.byteOffset===0&&i.byteLength===i.buffer.byteLength?i.buffer._uuid:i.buffer._uuid+":"+i.byteOffset+":"+i.byteLength}var rn=new P,Ks=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s,this._normalizationScale=e!==void 0?Ml(e.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)rn.fromBufferAttribute(this,t),rn.applyMatrix4(e),this.setXYZ(t,rn.x,rn.y,rn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)rn.fromBufferAttribute(this,t),rn.applyNormalMatrix(e),this.setXYZ(t,rn.x,rn.y,rn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)rn.fromBufferAttribute(this,t),rn.transformDirection(e),this.setXYZ(t,rn.x,rn.y,rn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Or("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Wt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Or("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):uh(e,this.data.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):dh(e,this.data.array)}},mc=new P,Am=new P,Rm=new Oe,gn=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=mc.subVectors(n,t).cross(Am.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(mc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Rm.getNormalMatrix(e),s=this.coplanarPoint(mc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Cm=0,an=class extends Fn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Cm++}),this.uuid=ti(),this.name="",this.type="Material",this.blending=sr,this.side=Qn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Gc,this.blendDst=Vc,this.blendEquation=_s,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ce(0,0,0),this.blendAlpha=0,this.depthFunc=zs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=jd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=no,this.stencilZFail=no,this.stencilZPass=no,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Ae(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Ae(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ce().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new gn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new _e().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new _e().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var hi=new P,gc=new P,Oa=new P,Ba=new P,pi=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,hi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=hi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(hi.copy(this.origin).addScaledVector(this.direction,t),hi.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){gc.copy(e).add(t).multiplyScalar(.5),Oa.copy(t).sub(e).normalize(),Ba.copy(this.origin).sub(gc);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Oa),o=Ba.dot(this.direction),c=-Ba.dot(Oa),l=Ba.lengthSq(),h=Math.abs(1-a*a),u,d,f,g;if(h>0)if(u=a*c-o,d=a*o-c,g=r*h,u>=0)if(d>=-g)if(d<=g){let x=1/h;u*=x,d*=x,f=u*(u+a*d+2*o)+d*(a*u+d+2*c)+l}else d=r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;else d=-r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;else d<=-g?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l):d<=g?(u=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(gc).addScaledVector(Oa,d),f}intersectSphere(e,t){if(e.radius<0)return null;hi.subVectors(e.center,this.origin);let n=hi.dot(this.direction),s=hi.dot(hi)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,c,l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return l>=0?(n=(e.min.x-d.x)*l,s=(e.max.x-d.x)*l):(n=(e.max.x-d.x)*l,s=(e.min.x-d.x)*l),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-d.z)*u,c=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,c=(e.min.z-d.z)*u),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,hi)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,c=o.x,l=o.y,h=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,g=t.x-a.x,x=t.y-a.y,m=t.z-a.z,p=n.x-a.x,y=n.y-a.y,M=n.z-a.z,v=Math.abs(c),E=Math.abs(l),T=Math.abs(h),_,b,L,A,N,F,B,I,k,V,z,j;if(v>=E&&v>=T?(L=c,F=u,k=g,j=p,c>=0?(_=l,b=h,A=d,N=f,B=x,I=m,V=y,z=M):(_=h,b=l,A=f,N=d,B=m,I=x,V=M,z=y)):E>=T?(L=l,F=d,k=x,j=y,l>=0?(_=h,b=c,A=f,N=u,B=m,I=g,V=M,z=p):(_=c,b=h,A=u,N=f,B=g,I=m,V=p,z=M)):(L=h,F=f,k=m,j=M,h>=0?(_=c,b=l,A=u,N=d,B=g,I=x,V=p,z=y):(_=l,b=c,A=d,N=u,B=x,I=g,V=y,z=p)),L===0)return null;let C=_/L,H=b/L,Y=1/L,ie=A-C*F,we=N-H*F,Z=B-C*k,ae=I-H*k,le=V-C*j,te=z-H*j,re=le*ae-te*Z,Te=ie*te-we*le,Ke=Z*we-ae*ie;if(s){if(re<0||Te<0||Ke<0)return null}else if((re<0||Te<0||Ke<0)&&(re>0||Te>0||Ke>0))return null;let Ie=re+Te+Ke;if(Ie===0)return null;let je=Y*(re*F+Te*k+Ke*j);return(Ie>0?je<0:je>0)?null:this.at(je/Ie,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},_t=class extends an{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.combine=Fo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},$u=new ze,ss=new pi,ka=new cn,Ju=new P,za=new P,Ha=new P,Ga=new P,_c=new P,Va=new P,ju=new P,Wa=new P,Ne=class extends at{constructor(e=new Qe,t=new _t){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Va.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=o[c],u=r[c];h!==0&&(_c.fromBufferAttribute(u,e),a?Va.addScaledVector(_c,h):Va.addScaledVector(_c.sub(t),h))}t.add(Va)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ka.copy(n.boundingSphere),ka.applyMatrix4(r),ss.copy(e.ray).recast(e.near),!(ka.containsPoint(ss.origin)===!1&&(ss.intersectSphere(ka,Ju)===null||ss.origin.distanceToSquared(Ju)>(e.far-e.near)**2))&&($u.copy(r).invert(),ss.copy(e.ray).applyMatrix4($u),!(n.boundingBox!==null&&ss.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ss)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,x=d.length;g<x;g++){let m=d[g],p=a[m.materialIndex],y=Math.max(m.start,f.start),M=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,E=M;v<E;v+=3){let T=o.getX(v),_=o.getX(v+1),b=o.getX(v+2);s=Xa(this,p,e,n,l,h,u,T,_,b),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),x=Math.min(o.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){let y=o.getX(m),M=o.getX(m+1),v=o.getX(m+2);s=Xa(this,a,e,n,l,h,u,y,M,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let g=0,x=d.length;g<x;g++){let m=d[g],p=a[m.materialIndex],y=Math.max(m.start,f.start),M=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,E=M;v<E;v+=3){let T=v,_=v+1,b=v+2;s=Xa(this,p,e,n,l,h,u,T,_,b),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),x=Math.min(c.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){let y=m,M=m+1,v=m+2;s=Xa(this,a,e,n,l,h,u,y,M,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function Pm(i,e,t,n,s,r,a,o){let c;if(e.side===Yt?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,e.side===Qn,o),c===null)return null;Wa.copy(o),Wa.applyMatrix4(i.matrixWorld);let l=t.ray.origin.distanceTo(Wa);return l<t.near||l>t.far?null:{distance:l,point:Wa.clone(),object:i}}function Xa(i,e,t,n,s,r,a,o,c,l){i.getVertexPosition(o,za),i.getVertexPosition(c,Ha),i.getVertexPosition(l,Ga);let h=Pm(i,e,t,n,za,Ha,Ga,ju);if(h){let u=new P;Bi.getBarycoord(ju,za,Ha,Ga,u),s&&(h.uv=Bi.getInterpolatedAttribute(s,o,c,l,u,new _e)),r&&(h.uv1=Bi.getInterpolatedAttribute(r,o,c,l,u,new _e)),a&&(h.normal=Bi.getInterpolatedAttribute(a,o,c,l,u,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:c,c:l,normal:new P,materialIndex:0};Bi.getNormal(za,Ha,Ga,d.normal),h.face=d,h.barycoord=u}return h}var Ar=new rt,Qu=new rt,ed=new rt,Im=new rt,td=new ze,qa=new P,xc=new cn,nd=new ze,yc=new pi,Gr=class extends Ne{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Ec,this.bindMatrix=new ze,this.bindMatrixInverse=new ze,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Xt),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,qa),this.boundingBox.expandByPoint(qa)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new cn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,qa),this.boundingSphere.expandByPoint(qa)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xc.copy(this.boundingSphere),xc.applyMatrix4(s),e.ray.intersectsSphere(xc)!==!1&&(nd.copy(s).invert(),yc.copy(e.ray).applyMatrix4(nd),!(this.boundingBox!==null&&yc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,yc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new rt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Ec?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Kd?this.bindMatrixInverse.copy(this.bindMatrix).invert():Ae("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;Qu.fromBufferAttribute(s.attributes.skinIndex,e),ed.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(Ar.copy(t),t.set(0,0,0,0)):(Ar.set(t.x,t.y,t.z,1),t.set(0,0,0)),Ar.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let a=ed.getComponent(r);if(a!==0){let o=Qu.getComponent(r);td.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(Im.copy(Ar).applyMatrix4(td),a)}}return t.isVector4&&(t.w=Ar.w),t.applyMatrix4(this.bindMatrixInverse)}},Zs=class extends at{constructor(){super(),this.isBone=!0,this.type="Bone"}},$s=class extends Lt{constructor(e=null,t=1,n=1,s,r,a,o,c,l=bt,h=bt,u,d){super(null,a,o,c,l,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},id=new ze,Lm=new ze,Vr=class i{constructor(e=[],t=[]){this.uuid=ti(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Ae("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new ze)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new ze;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,a=e.length;r<a;r++){let o=e[r]?e[r].matrixWorld:Lm;id.multiplyMatrices(o,t[r]),id.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new $s(t,e,e,Rn,_n);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null),this.previousBoneTexture!==null&&(this.previousBoneTexture.dispose(),this.previousBoneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],a=t[r];a===void 0&&(Ae("Skeleton: No bone found with UUID:",r),a=new Zs),this.bones.push(a),this.boneInverses.push(new ze().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let a=t[s];e.bones.push(a.uuid);let o=n[s];e.boneInverses.push(o.toArray())}return e}},mi=class extends Wt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Us=new ze,sd=new ze,Ya=[],rd=new Xt,Dm=new ze,Rr=new Ne,Cr=new cn,gi=class extends Ne{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new mi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Dm)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Xt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Us),rd.copy(e.boundingBox).applyMatrix4(Us),this.boundingBox.union(rd)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new cn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Us),Cr.copy(e.boundingSphere).applyMatrix4(Us),this.boundingSphere.union(Cr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture!==null?e.morphTexture.clone():null,this.instanceColor=e.instanceColor!==null?e.instanceColor.clone():null,this.count=e.count,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Rr.geometry=this.geometry,Rr.material=this.material,Rr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Cr.copy(this.boundingSphere),Cr.applyMatrix4(n),e.ray.intersectsSphere(Cr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Us),sd.multiplyMatrices(n,Us),Rr.matrixWorld=sd,Rr.raycast(e,Ya);for(let a=0,o=Ya.length;a<o;a++){let c=Ya[a];c.instanceId=r,c.object=this,t.push(c)}Ya.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new mi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new $s(new Float32Array(s*this.count),s,this.count,Vo,_n));let r=this.morphTexture.source.data.data,a=0;for(let l=0;l<n.length;l++)a+=n[l];let o=this.geometry.morphTargetsRelative?1:1-a,c=s*e;return r[c]=o,r.set(n,c+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},rs=new cn,Nm=new _e(.5,.5),Ka=new P,zi=class{constructor(e=new gn,t=new gn,n=new gn,s=new gn,r=new gn,a=new gn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Tn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],h=r[4],u=r[5],d=r[6],f=r[7],g=r[8],x=r[9],m=r[10],p=r[11],y=r[12],M=r[13],v=r[14],E=r[15];if(s[0].setComponents(l-a,f-h,p-g,E-y).normalize(),s[1].setComponents(l+a,f+h,p+g,E+y).normalize(),s[2].setComponents(l+o,f+u,p+x,E+M).normalize(),s[3].setComponents(l-o,f-u,p-x,E-M).normalize(),n)s[4].setComponents(c,d,m,v).normalize(),s[5].setComponents(l-c,f-d,p-m,E-v).normalize();else if(s[4].setComponents(l-c,f-d,p-m,E-v).normalize(),t===Tn)s[5].setComponents(l+c,f+d,p+m,E+v).normalize();else if(t===Gs)s[5].setComponents(c,d,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),rs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),rs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(rs)}intersectsSprite(e){rs.center.set(0,0,0);let t=Nm.distanceTo(e.center);return rs.radius=.7071067811865476+t,rs.applyMatrix4(e.matrixWorld),this.intersectsSphere(rs)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Ka.x=s.normal.x>0?e.max.x:e.min.x,Ka.y=s.normal.y>0?e.max.y:e.min.y,Ka.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ka)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},ad=new ze,po=class i{constructor(){this.coordinateSystem=Tn,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){let r=t[s];ad.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new zi),n[s].setFromProjectionMatrix(ad,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new zi),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new i().copy(this)}};var Bn=class extends an{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ce(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},mo=new P,go=new P,od=new ze,Pr=new pi,Za=new cn,vc=new P,ld=new P,kn=class extends at{constructor(e=new Qe,t=new Bn){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)mo.fromBufferAttribute(t,s-1),go.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=mo.distanceTo(go);e.setAttribute("lineDistance",new Ue(n,1))}else Ae("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Za.copy(n.boundingSphere),Za.applyMatrix4(s),Za.radius+=r,e.ray.intersectsSphere(Za)===!1)return;od.copy(s).invert(),Pr.copy(e.ray).applyMatrix4(od);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){let f=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let x=f,m=g-1;x<m;x+=l){let p=h.getX(x),y=h.getX(x+1),M=$a(this,e,Pr,c,p,y,x);M&&t.push(M)}if(this.isLineLoop){let x=h.getX(g-1),m=h.getX(f),p=$a(this,e,Pr,c,x,m,g-1);p&&t.push(p)}}else{let f=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let x=f,m=g-1;x<m;x+=l){let p=$a(this,e,Pr,c,x,x+1,x);p&&t.push(p)}if(this.isLineLoop){let x=$a(this,e,Pr,c,g-1,f,g-1);x&&t.push(x)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function $a(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(mo.fromBufferAttribute(o,s),go.fromBufferAttribute(o,r),t.distanceSqToSegment(mo,go,vc,ld)>n)return;vc.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(vc);if(!(l<e.near||l>e.far))return{distance:l,point:ld.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var cd=new P,hd=new P,_i=class extends kn{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)cd.fromBufferAttribute(t,s),hd.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+cd.distanceTo(hd);e.setAttribute("lineDistance",new Ue(n,1))}else Ae("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Wr=class extends kn{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Js=class extends an{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ce(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ud=new ze,Ic=new pi,Ja=new cn,ja=new P,hs=class extends at{constructor(e=new Qe,t=new Js){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ja.copy(n.boundingSphere),Ja.applyMatrix4(s),Ja.radius+=r,e.ray.intersectsSphere(Ja)===!1)return;ud.copy(s).invert(),Ic.copy(e.ray).applyMatrix4(ud);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,u=n.attributes.position;if(l!==null){let d=Math.max(0,a.start),f=Math.min(l.count,a.start+a.count);for(let g=d,x=f;g<x;g++){let m=l.getX(g);ja.fromBufferAttribute(u,m),dd(ja,m,c,s,e,t,this)}}else{let d=Math.max(0,a.start),f=Math.min(u.count,a.start+a.count);for(let g=d,x=f;g<x;g++)ja.fromBufferAttribute(u,g),dd(ja,g,c,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function dd(i,e,t,n,s,r,a){let o=Ic.distanceSqToPoint(i);if(o<t){let c=new P;Ic.closestPointToPoint(i,c),c.applyMatrix4(n);let l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Xr=class extends Lt{constructor(e=[],t=xs,n,s,r,a,o,c,l,h){super(e,t,n,s,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},qr=class extends Lt{constructor(e,t,n,s,r,a,o,c,l){super(e,t,n,s,r,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var xi=class extends Lt{constructor(e,t,n=zn,s,r,a,o=bt,c=bt,l,h=fi,u=1){if(h!==fi&&h!==Ri)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,s,r,a,o,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Xs(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Yr=class extends xi{constructor(e,t=zn,n=xs,s,r,a=bt,o=bt,c,l=fi){let h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,n,s,r,a,o,c,l),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Kr=class extends Lt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},hn=class i extends Qe{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],h=[],u=[],d=0,f=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new Ue(l,3)),this.setAttribute("normal",new Ue(h,3)),this.setAttribute("uv",new Ue(u,2));function g(x,m,p,y,M,v,E,T,_,b,L){let A=v/_,N=E/b,F=v/2,B=E/2,I=T/2,k=_+1,V=b+1,z=0,j=0,C=new P;for(let H=0;H<V;H++){let Y=H*N-B;for(let ie=0;ie<k;ie++){let we=ie*A-F;C[x]=we*y,C[m]=Y*M,C[p]=I,l.push(C.x,C.y,C.z),C[x]=0,C[m]=0,C[p]=T>0?1:-1,h.push(C.x,C.y,C.z),u.push(ie/_),u.push(1-H/b),z+=1}}for(let H=0;H<b;H++)for(let Y=0;Y<_;Y++){let ie=d+Y+k*H,we=d+Y+k*(H+1),Z=d+(Y+1)+k*(H+1),ae=d+(Y+1)+k*H;c.push(ie,we,ae),c.push(we,Z,ae),j+=6}o.addGroup(f,j,L),f+=j,d+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var js=class i extends Qe{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],a=[],o=[],c=[],l=new P,h=new _e;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){let f=n+u/t*s;l.x=e*Math.cos(f),l.y=e*Math.sin(f),a.push(l.x,l.y,l.z),o.push(0,0,1),h.x=(a[d]/e+1)/2,h.y=(a[d+1]/e+1)/2,c.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Ue(a,3)),this.setAttribute("normal",new Ue(o,3)),this.setAttribute("uv",new Ue(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Zn=class i extends Qe{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],f=[],g=0,x=[],m=n/2,p=0;y(),a===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new Ue(u,3)),this.setAttribute("normal",new Ue(d,3)),this.setAttribute("uv",new Ue(f,2));function y(){let v=new P,E=new P,T=0,_=(t-e)/n;for(let b=0;b<=r;b++){let L=[],A=b/r,N=A*(t-e)+e;for(let F=0;F<=s;F++){let B=F/s,I=B*c+o,k=Math.sin(I),V=Math.cos(I);E.x=N*k,E.y=-A*n+m,E.z=N*V,u.push(E.x,E.y,E.z),v.set(k,_,V).normalize(),d.push(v.x,v.y,v.z),f.push(B,1-A),L.push(g++)}x.push(L)}for(let b=0;b<s;b++)for(let L=0;L<r;L++){let A=x[L][b],N=x[L+1][b],F=x[L+1][b+1],B=x[L][b+1];(e>0||L!==0)&&(h.push(A,N,B),T+=3),(t>0||L!==r-1)&&(h.push(N,F,B),T+=3)}l.addGroup(p,T,0),p+=T}function M(v){let E=g,T=new _e,_=new P,b=0,L=v===!0?e:t,A=v===!0?1:-1;for(let F=1;F<=s;F++)u.push(0,m*A,0),d.push(0,A,0),f.push(.5,.5),g++;let N=g;for(let F=0;F<=s;F++){let I=F/s*c+o,k=Math.cos(I),V=Math.sin(I);_.x=L*V,_.y=m*A,_.z=L*k,u.push(_.x,_.y,_.z),d.push(0,A,0),T.x=k*.5+.5,T.y=V*.5*A+.5,f.push(T.x,T.y),g++}for(let F=0;F<s;F++){let B=E+F,I=N+F;v===!0?h.push(I,I+1,B):h.push(I+1,I,B),b+=3}l.addGroup(p,b,v===!0?1:2),p+=b}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var _o=class i extends Qe{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};let r=[],a=[];o(s),l(n),h(),this.setAttribute("position",new Ue(r,3)),this.setAttribute("normal",new Ue(r.slice(),3)),this.setAttribute("uv",new Ue(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(y){let M=new P,v=new P,E=new P;for(let T=0;T<t.length;T+=3)f(t[T+0],M),f(t[T+1],v),f(t[T+2],E),c(M,v,E,y)}function c(y,M,v,E){let T=E+1,_=[];for(let b=0;b<=T;b++){_[b]=[];let L=y.clone().lerp(v,b/T),A=M.clone().lerp(v,b/T),N=T-b;for(let F=0;F<=N;F++)F===0&&b===T?_[b][F]=L:_[b][F]=L.clone().lerp(A,F/N)}for(let b=0;b<T;b++)for(let L=0;L<2*(T-b)-1;L++){let A=Math.floor(L/2);L%2===0?(d(_[b][A+1]),d(_[b+1][A]),d(_[b][A])):(d(_[b][A+1]),d(_[b+1][A+1]),d(_[b+1][A]))}}function l(y){let M=new P;for(let v=0;v<r.length;v+=3)M.x=r[v+0],M.y=r[v+1],M.z=r[v+2],M.normalize().multiplyScalar(y),r[v+0]=M.x,r[v+1]=M.y,r[v+2]=M.z}function h(){let y=new P;for(let M=0;M<r.length;M+=3){y.x=r[M+0],y.y=r[M+1],y.z=r[M+2];let v=m(y)/2/Math.PI+.5,E=p(y)/Math.PI+.5;a.push(v,1-E)}g(),u()}function u(){for(let y=0;y<a.length;y+=6){let M=a[y+0],v=a[y+2],E=a[y+4],T=Math.max(M,v,E),_=Math.min(M,v,E);T>.9&&_<.1&&(M<.2&&(a[y+0]+=1),v<.2&&(a[y+2]+=1),E<.2&&(a[y+4]+=1))}}function d(y){r.push(y.x,y.y,y.z)}function f(y,M){let v=y*3;M.x=e[v+0],M.y=e[v+1],M.z=e[v+2]}function g(){let y=new P,M=new P,v=new P,E=new P,T=new _e,_=new _e,b=new _e;for(let L=0,A=0;L<r.length;L+=9,A+=6){y.set(r[L+0],r[L+1],r[L+2]),M.set(r[L+3],r[L+4],r[L+5]),v.set(r[L+6],r[L+7],r[L+8]),T.set(a[A+0],a[A+1]),_.set(a[A+2],a[A+3]),b.set(a[A+4],a[A+5]),E.copy(y).add(M).add(v).divideScalar(3);let N=m(E);x(T,A+0,y,N),x(_,A+2,M,N),x(b,A+4,v,N)}}function x(y,M,v,E){E<0&&y.x===1&&(a[M]=y.x-1),v.x===0&&v.z===0&&(a[M]=E/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function p(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.detail)}};var En=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Ae("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,c=r-1,l;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),l=n[s]-a,l<0)o=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===a)return s/(r-1);let h=n[s],d=n[s+1]-h,f=(a-h)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),c=t||(a.isVector2?new _e:new P);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new P,s=[],r=[],a=[],o=new P,c=new ze;for(let f=0;f<=e;f++){let g=f/e;s[f]=this.getTangentAt(g,new P)}r[0]=new P,a[0]=new P;let l=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=l&&(l=h,n.set(1,0,0)),u<=l&&(l=u,n.set(0,1,0)),d<=l&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Ge(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(o,g))}a[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(Ge(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(c.makeRotationAxis(s[g],f*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}},Zr=class extends En{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new _e){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=c-this.aX,f=l-this.aY;c=d*h-f*u+this.aX,l=d*u+f*h+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},xo=class extends Zr{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function fh(){let i=0,e=0,t=0,n=0;function s(r,a,o,c){i=r,e=o,t=-3*r+3*a-2*o-c,n=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,l){s(a,o,l*(o-r),l*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,l,h,u){let d=(a-r)/l-(o-r)/(l+h)+(o-a)/h,f=(o-a)/h-(c-a)/(h+u)+(c-o)/u;d*=h,f*=h,s(a,o,d,f)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var fd=new P,pd=new P,bc=new fh,Sc=new fh,Mc=new fh,Qs=class extends En{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new P){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let l,h;this.closed||o>0?l=s[(o-1)%r]:(pd.subVectors(s[0],s[1]).add(s[0]),l=pd);let u=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(fd.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=fd),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(l.distanceToSquared(u),f),x=Math.pow(u.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(h),f);x<1e-4&&(x=1),g<1e-4&&(g=x),m<1e-4&&(m=x),bc.initNonuniformCatmullRom(l.x,u.x,d.x,h.x,g,x,m),Sc.initNonuniformCatmullRom(l.y,u.y,d.y,h.y,g,x,m),Mc.initNonuniformCatmullRom(l.z,u.z,d.z,h.z,g,x,m)}else this.curveType==="catmullrom"&&(bc.initCatmullRom(l.x,u.x,d.x,h.x,this.tension),Sc.initCatmullRom(l.y,u.y,d.y,h.y,this.tension),Mc.initCatmullRom(l.z,u.z,d.z,h.z,this.tension));return n.set(bc.calc(c),Sc.calc(c),Mc.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new P().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function md(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,c=i*o;return(2*t-2*n+r+a)*c+(-3*t+3*n-2*r-a)*o+r*i+t}function Um(i,e){let t=1-i;return t*t*e}function Fm(i,e){return 2*(1-i)*i*e}function Om(i,e){return i*i*e}function Nr(i,e,t,n){return Um(i,e)+Fm(i,t)+Om(i,n)}function Bm(i,e){let t=1-i;return t*t*t*e}function km(i,e){let t=1-i;return 3*t*t*i*e}function zm(i,e){return 3*(1-i)*i*i*e}function Hm(i,e){return i*i*i*e}function Ur(i,e,t,n,s){return Bm(i,e)+km(i,t)+zm(i,n)+Hm(i,s)}var yo=class extends En{constructor(e=new _e,t=new _e,n=new _e,s=new _e){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new _e){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ur(e,s.x,r.x,a.x,o.x),Ur(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},vo=class extends En{constructor(e=new P,t=new P,n=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new P){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ur(e,s.x,r.x,a.x,o.x),Ur(e,s.y,r.y,a.y,o.y),Ur(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},bo=class extends En{constructor(e=new _e,t=new _e){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new _e){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new _e){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},So=class extends En{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Mo=class extends En{constructor(e=new _e,t=new _e,n=new _e){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new _e){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Nr(e,s.x,r.x,a.x),Nr(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Hi=class extends En{constructor(e=new P,t=new P,n=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new P){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Nr(e,s.x,r.x,a.x),Nr(e,s.y,r.y,a.y),Nr(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},wo=class extends En{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new _e){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,c=s[a===0?a:a-1],l=s[a],h=s[a>s.length-2?s.length-1:a+1],u=s[a>s.length-3?s.length-1:a+2];return n.set(md(o,c.x,l.x,h.x,u.x),md(o,c.y,l.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new _e().fromArray(s))}return this}},Gm=Object.freeze({__proto__:null,ArcCurve:xo,CatmullRomCurve3:Qs,CubicBezierCurve:yo,CubicBezierCurve3:vo,EllipseCurve:Zr,LineCurve:bo,LineCurve3:So,QuadraticBezierCurve:Mo,QuadraticBezierCurve3:Hi,SplineCurve:wo});var us=class i extends _o{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},yi=class i extends Qe{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(s),l=o+1,h=c+1,u=e/o,d=t/c,f=[],g=[],x=[],m=[];for(let p=0;p<h;p++){let y=p*d-a;for(let M=0;M<l;M++){let v=M*u-r;g.push(v,-y,0),x.push(0,0,1),m.push(M/o),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let y=0;y<o;y++){let M=y+l*p,v=y+l*(p+1),E=y+1+l*(p+1),T=y+1+l*p;f.push(M,v,T),f.push(v,E,T)}this.setIndex(f),this.setAttribute("position",new Ue(g,3)),this.setAttribute("normal",new Ue(x,3)),this.setAttribute("uv",new Ue(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},ds=class i extends Qe{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],c=[],l=[],h=[],u=e,d=(t-e)/s,f=new P,g=new _e;for(let x=0;x<=s;x++){for(let m=0;m<=n;m++){let p=r+m/n*a;f.x=u*Math.cos(p),f.y=u*Math.sin(p),c.push(f.x,f.y,f.z),l.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}u+=d}for(let x=0;x<s;x++){let m=x*(n+1);for(let p=0;p<n;p++){let y=p+m,M=y,v=y+n+1,E=y+n+2,T=y+1;o.push(M,v,T),o.push(v,E,T)}}this.setIndex(o),this.setAttribute("position",new Ue(c,3)),this.setAttribute("normal",new Ue(l,3)),this.setAttribute("uv",new Ue(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var Gi=class i extends Qe{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(a+o,Math.PI),l=0,h=[],u=new P,d=new P,f=[],g=[],x=[],m=[];for(let p=0;p<=n;p++){let y=[],M=p/n,v=a+M*o,E=e*Math.cos(v),T=Math.sqrt(e*e-E*E),_=0;p===0&&a===0?_=.5/t:p===n&&c===Math.PI&&(_=-.5/t);for(let b=0;b<=t;b++){let L=b/t,A=s+L*r;u.x=-T*Math.cos(A),u.y=E,u.z=T*Math.sin(A),g.push(u.x,u.y,u.z),d.copy(u).normalize(),x.push(d.x,d.y,d.z),m.push(L+_,1-M),y.push(l++)}h.push(y)}for(let p=0;p<n;p++)for(let y=0;y<t;y++){let M=h[p][y+1],v=h[p][y],E=h[p+1][y],T=h[p+1][y+1];(p!==0||a>0)&&f.push(M,v,T),(p!==n-1||c<Math.PI)&&f.push(v,E,T)}this.setIndex(f),this.setAttribute("position",new Ue(g,3)),this.setAttribute("normal",new Ue(x,3)),this.setAttribute("uv",new Ue(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Vi=class i extends Qe{constructor(e=new Hi(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new P,c=new P,l=new _e,h=new P,u=[],d=[],f=[],g=[];x(),this.setIndex(g),this.setAttribute("position",new Ue(u,3)),this.setAttribute("normal",new Ue(d,3)),this.setAttribute("uv",new Ue(f,2));function x(){for(let M=0;M<t;M++)m(M);m(r===!1?t:0),y(),p()}function m(M){h=e.getPointAt(M/t,h);let v=a.normals[M],E=a.binormals[M];for(let T=0;T<=s;T++){let _=T/s*Math.PI*2,b=Math.sin(_),L=-Math.cos(_);c.x=L*v.x+b*E.x,c.y=L*v.y+b*E.y,c.z=L*v.z+b*E.z,c.normalize(),d.push(c.x,c.y,c.z),o.x=h.x+n*c.x,o.y=h.y+n*c.y,o.z=h.z+n*c.z,u.push(o.x,o.y,o.z)}}function p(){for(let M=1;M<=t;M++)for(let v=1;v<=s;v++){let E=(s+1)*(M-1)+(v-1),T=(s+1)*M+(v-1),_=(s+1)*M+v,b=(s+1)*(M-1)+v;g.push(E,T,b),g.push(T,_,b)}}function y(){for(let M=0;M<=t;M++)for(let v=0;v<=s;v++)l.x=M/t,l.y=v/s,f.push(l.x,l.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new Gm[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};function bs(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(gd(s))s.isRenderTargetTexture?(Ae("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(gd(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function en(i){let e={};for(let t=0;t<i.length;t++){let n=bs(i[t]);for(let s in n)e[s]=n[s]}return e}function gd(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Vm(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function ph(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Xe.workingColorSpace}var hf={clone:bs,merge:en},Wm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Xm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Mt=class extends an{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Wm,this.fragmentShader=Xm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=bs(e.uniforms),this.uniformsGroups=Vm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ce().setHex(s.value);break;case"v2":this.uniforms[n].value=new _e().fromArray(s.value);break;case"v3":this.uniforms[n].value=new P().fromArray(s.value);break;case"v4":this.uniforms[n].value=new rt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Oe().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ze().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},To=class extends Mt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},qt=class extends an{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ce(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=fa,this.normalScale=new _e(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},on=class extends qt{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new _e(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ge(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new Ce(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ce(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ce(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(e){this._diffuseRoughness>0!=e>0&&this.version++,this._diffuseRoughness=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}get iridescenceThicknessRange(){return as('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(e){as('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=e[0],this.iridescenceThicknessMaximum=e[1]}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.diffuseRoughness=e.diffuseRoughness,this.diffuseRoughnessMap=e.diffuseRoughnessMap,this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum,this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var $r=class extends an{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=fa,this.normalScale=new _e(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.combine=Fo,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Eo=class extends an{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=$d,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ao=class extends an{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};var Jr=class extends Bn{constructor(e){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}};function Oi(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Ir(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}function qm(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function _d(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,a=0;a!==n;++r){let o=t[r]*e;for(let c=0;c!==e;++c)s[a++]=i[o+c]}return s}function Ym(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=i[s++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=i[s++];while(r!==void 0)}var $n=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Ro=class extends $n{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Rc,endingEnd:Rc}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Cc:r=e,o=2*t-n;break;case Pc:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Cc:a=e,c=2*n-t;break;case Pc:a=1,c=n+s[1]-s[0];break;default:a=e-1,c=t}let l=(n-t)*.5,h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(s-t),x=g*g,m=x*g,p=-d*m+2*d*x-d*g,y=(1+d)*m+(-1.5-2*d)*x+(-.5+d)*g+1,M=(-1-f)*m+(1.5+f)*x+.5*g,v=f*m-f*x;for(let E=0;E!==o;++E)r[E]=p*a[h+E]+y*a[l+E]+M*a[c+E]+v*a[u+E];return r}},Co=class extends $n{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(n-t)/(s-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[l+d]*u+a[c+d]*h;return r}},Po=class extends $n{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Io=class extends $n{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this.inTangents,u=this.outTangents;if(!h||!u){let g=(n-t)/(s-t),x=1-g;for(let m=0;m!==o;++m)r[m]=a[l+m]*x+a[c+m]*g;return r}let d=o*2,f=e-1;for(let g=0;g!==o;++g){let x=a[l+g],m=a[c+g],p=f*d+g*2,y=u[p],M=u[p+1],v=e*d+g*2,E=h[v],T=h[v+1],_=Zm(n,t,y,E,s);r[g]=uf(_,x,M,T,m)}return r}};function uf(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function Km(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function Zm(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=uf(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let c=Km(r,e,t,n,s);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-o/c))}return r}var un=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Oi(t,this.TimeBufferType),this.values=Oi(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Oi(e.times,Array),values:Oi(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),Ir(e.settings)&&(n.settings={inTangents:Oi(e.settings.inTangents,Array),outTangents:Oi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Po(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Co(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ro(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Io(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case os:t=this.InterpolantFactoryMethodDiscrete;break;case ls:t=this.InterpolantFactoryMethodLinear;break;case to:t=this.InterpolantFactoryMethodSmooth;break;case Ac:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Ae("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return os;case this.InterpolantFactoryMethodLinear:return ls;case this.InterpolantFactoryMethodSmooth:return to;case this.InterpolantFactoryMethodBezier:return Ac}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e;Ir(this.settings)&&(xd(this.settings.inTangents,e),xd(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;Ir(this.settings)&&(yd(this.settings.inTangents,e),yd(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Fe("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Fe("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){Fe("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){Fe("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&jp(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){Fe("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===to,r=e.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=e[o],h=e[o+1];if(l!==h&&(o!==1||l!==e[0]))if(s)c=!0;else{let u=o*n,d=u-n,f=u+n;for(let g=0;g!==n;++g){let x=t[u+g];if(x!==t[d+g]||x!==t[f+g]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let u=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,Ir(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function xd(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]+=e}function yd(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}un.prototype.ValueTypeName="";un.prototype.TimeBufferType=Float32Array;un.prototype.ValueBufferType=Float32Array;un.prototype.DefaultInterpolation=ls;var vi=class extends un{constructor(e,t,n){super(e,t,n)}};vi.prototype.ValueTypeName="bool";vi.prototype.ValueBufferType=Array;vi.prototype.DefaultInterpolation=os;vi.prototype.InterpolantFactoryMethodLinear=void 0;vi.prototype.InterpolantFactoryMethodSmooth=void 0;var jr=class extends un{constructor(e,t,n,s){super(e,t,n,s)}};jr.prototype.ValueTypeName="color";var bi=class extends un{constructor(e,t,n,s){super(e,t,n,s)}};bi.prototype.ValueTypeName="number";var Lo=class extends $n{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(s-t),l=e*o;for(let h=l+o;l!==h;l+=4)jt.slerpFlat(r,0,a,l-o,a,l,c);return r}},Si=class extends un{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Lo(this.times,this.values,this.getValueSize(),e)}};Si.prototype.ValueTypeName="quaternion";Si.prototype.InterpolantFactoryMethodSmooth=void 0;var Mi=class extends un{constructor(e,t,n){super(e,t,n)}};Mi.prototype.ValueTypeName="string";Mi.prototype.ValueBufferType=Array;Mi.prototype.DefaultInterpolation=os;Mi.prototype.InterpolantFactoryMethodLinear=void 0;Mi.prototype.InterpolantFactoryMethodSmooth=void 0;var Wi=class extends un{constructor(e,t,n,s){super(e,t,n,s)}};Wi.prototype.ValueTypeName="vector";var Qr=class{constructor(e="",t=-1,n=[],s=Zd){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=ti(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(Jm(n[a]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(un.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,a=[];for(let o=0;o<r;o++){let c=[],l=[];c.push((o+r-1)%r,o,(o+1)%r),l.push(0,1,0);let h=qm(c);c=_d(c,1,h),l=_d(l,1,h),!s&&c[0]===0&&(c.push(r),l.push(l[0])),a.push(new bi(".morphTargetInfluences["+t[o].name+"]",c,l).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,c=e.length;o<c;o++){let l=e[o],h=l.name.match(r);if(h&&h.length>1){let u=h[1],d=s[u];d||(s[u]=d=[]),d.push(l)}}let a=[];for(let o in s)a.push(this.CreateFromMorphTargetSequence(o,s[o],t,n));return a}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function $m(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return bi;case"vector":case"vector2":case"vector3":case"vector4":return Wi;case"color":return jr;case"quaternion":return Si;case"bool":case"boolean":return vi;case"string":return Mi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Jm(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=$m(i.type);if(i.times===void 0){let n=[],s=[];Ym(i.keys,n,s,"value"),i.times=n,i.values=s}let t;return e.parse!==void 0?t=e.parse(i):t=new e(i.name,i.times,i.values,i.interpolation),Ir(i.settings)&&(t.settings={inTangents:Oi(i.settings.inTangents,Float32Array),outTangents:Oi(i.settings.outTangents,Float32Array)}),t}var Yn={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(vd(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!vd(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function vd(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var Do=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){let u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=l.length;u<d;u+=2){let f=l[u],g=l[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},df=new Do,Jn=class{constructor(e){this.manager=e!==void 0?e:df,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};Jn.DEFAULT_MATERIAL_NAME="__DEFAULT";var ui={},Lc=class extends Error{constructor(e,t){super(e),this.response=t}},er=class extends Jn{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=Yn.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(ui[e]!==void 0){ui[e].push({onLoad:t,onProgress:n,onError:s});return}ui[e]=[],ui[e].push({onLoad:t,onProgress:n,onError:s});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,c=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&Ae("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let h=ui[e],u=l.body.getReader(),d=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0,x=0,m=new ReadableStream({start(p){y();function y(){u.read().then(({done:M,value:v})=>{if(M)p.close();else{x+=v.byteLength;let E=new ProgressEvent("progress",{lengthComputable:g,loaded:x,total:f});for(let T=0,_=h.length;T<_;T++){let b=h[T];b.onProgress&&b.onProgress(E)}p.enqueue(v),y()}},M=>{p.error(M)})}}});return new Response(m)}else throw new Lc(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return l.json();default:if(o==="")return l.text();{let u=/charset="?([^;"\s]*)"?/i.exec(o),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return l.arrayBuffer().then(g=>f.decode(g))}}}).then(l=>{Yn.add(`file:${e}`,l);let h=ui[e];delete ui[e];for(let u=0,d=h.length;u<d;u++){let f=h[u];f.onLoad&&f.onLoad(l)}}).catch(l=>{let h=ui[e];if(h===void 0)throw this.manager.itemError(e),l;delete ui[e];for(let u=0,d=h.length;u<d;u++){let f=h[u];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Fs=new WeakMap,No=class extends Jn{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=Yn.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let u=Fs.get(a);u===void 0&&(u=[],Fs.set(a,u)),u.push({onLoad:t,onError:s})}return a}let o=Vs("img");function c(){h(),t&&t(this);let u=Fs.get(this)||[];for(let d=0;d<u.length;d++){let f=u[d];f.onLoad&&f.onLoad(this)}Fs.delete(this),r.manager.itemEnd(e)}function l(u){h(),s&&s(u),Yn.remove(`image:${e}`);let d=Fs.get(this)||[];for(let f=0;f<d.length;f++){let g=d[f];g.onError&&g.onError(u)}Fs.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",c,!1),o.removeEventListener("error",l,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Yn.add(`image:${e}`,o),r.manager.itemStart(e),o.fetchPriority=this.priority,o.src=e,o}};var ea=class extends Jn{constructor(e){super(e)}load(e,t,n,s){let r=new Lt,a=new No(this.manager);return a.setPriority(this.priority),a.setCache(this.cache),a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},fs=class extends at{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ce(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ps=class extends fs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(at.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ce(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},wc=new ze,bd=new P,Sd=new P,tr=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new _e(512,512),this.mapType=dn,this.map=null,this.mapPass=null,this.matrix=new ze,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new zi,this._frameExtents=new _e(1,1),this._viewportCount=1,this._viewports=[new rt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;bd.setFromMatrixPosition(e.matrixWorld),t.position.copy(bd),Sd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Sd),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){wc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(wc,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,c=s?s.x/r.x:0,l=s?s.y/r.y:0;e.coordinateSystem===Gs||e.reversedDepth?t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,.5,.5,0,0,0,1),t.multiply(wc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Qa=new P,eo=new jt,qn=new P,ms=class extends at{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ze,this.projectionMatrix=new ze,this.projectionMatrixInverse=new ze,this.coordinateSystem=Tn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Qa,eo,qn),qn.x===1&&qn.y===1&&qn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Qa,eo,qn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Qa,eo,qn),qn.x===1&&qn.y===1&&qn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Qa,eo,qn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Fi=new P,Md=new _e,wd=new _e,Pt=class extends ms{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=cs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Lr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return cs*2*Math.atan(Math.tan(Lr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Fi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Fi.x,Fi.y).multiplyScalar(-e/Fi.z),Fi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Fi.x,Fi.y).multiplyScalar(-e/Fi.z)}getViewSize(e,t){return this.getViewBounds(e,Md,wd),t.subVectors(wd,Md)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Lr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*n/l,s*=a.width/c,n*=a.height/l}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Dc=class extends tr{constructor(){super(new Pt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=cs*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},ta=class extends fs{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(at.DEFAULT_UP),this.updateMatrix(),this.target=new at,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Dc}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},Nc=class extends tr{constructor(){super(new Pt(90,1,.5,500)),this.isPointLightShadow=!0}},gs=class extends fs{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Nc}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},wi=class extends ms{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Uc=class extends tr{constructor(){super(new wi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ti=class extends fs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(at.DEFAULT_UP),this.updateMatrix(),this.target=new at,this.shadow=new Uc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Ei=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Tc=new WeakMap,na=class extends Jn{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&Ae("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&Ae("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=Yn.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(l=>{Tc.has(a)===!0?(s&&s(Tc.get(a)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(l),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);return}let o={};o.credentials=this.withCredentials||this.crossOrigin!=="anonymous"?"include":"same-origin",o.headers=this.requestHeader,o.priority=this.priority,o.cache=this.cache,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let c=fetch(e,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(l){return Yn.add(`image-bitmap:${e}`,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){s&&s(l),Tc.set(c,l),Yn.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});Yn.add(`image-bitmap:${e}`,c),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Os=-90,Bs=1,nr=class extends at{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Pt(Os,Bs,e,t);s.layers=this.layers,this.add(s);let r=new Pt(Os,Bs,e,t);r.layers=this.layers,this.add(r);let a=new Pt(Os,Bs,e,t);a.layers=this.layers,this.add(a);let o=new Pt(Os,Bs,e,t);o.layers=this.layers,this.add(o);let c=new Pt(Os,Bs,e,t);c.layers=this.layers,this.add(c);let l=new Pt(Os,Bs,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,c]=t;for(let l of t)this.remove(l);if(e===Tn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Gs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),n.texture.mipmapsAutoUpdate=x,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Uo=class extends Pt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}};var mh="\\[\\]\\.:\\/",jm=new RegExp("["+mh+"]","g"),gh="[^"+mh+"]",Qm="[^"+mh.replace("\\.","")+"]",eg=/((?:WC+[\/:])*)/.source.replace("WC",gh),tg=/(WCOD+)?/.source.replace("WCOD",Qm),ng=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",gh),ig=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",gh),sg=new RegExp("^"+eg+tg+ng+ig+"$"),rg=["material","materials","bones","map"],Fc=class{constructor(e,t,n){let s=n||lt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},lt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(jm,"")}static parseTrackName(e){let t=sg.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);rg.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let c=n(o.children);if(c)return c}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Ae("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){Fe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Fe("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Fe("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Fe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Fe("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Fe("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){Fe("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let a=e[s];if(a===void 0){let l=t.nodeName;Fe("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Fe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Fe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};lt.Composite=Fc;lt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};lt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};lt.prototype.GetterByBindingType=[lt.prototype._getValue_direct,lt.prototype._getValue_array,lt.prototype._getValue_arrayElement,lt.prototype._getValue_toArray];lt.prototype.SetterByBindingTypeAndVersioning=[[lt.prototype._setValue_direct,lt.prototype._setValue_direct_setNeedsUpdate,lt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_array,lt.prototype._setValue_array_setNeedsUpdate,lt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_arrayElement,lt.prototype._setValue_arrayElement_setNeedsUpdate,lt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_fromArray,lt.prototype._setValue_fromArray_setNeedsUpdate,lt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var cb=new Float32Array(1);var jn=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Ge(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(Ge(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Oc=class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};var ia=class extends Fn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function _h(i,e,t,n){let s=ag(n);switch(t){case th:return i*e;case Vo:return i*e/s.components*s.byteLength;case Wo:return i*e/s.components*s.byteLength;case Yi:return i*e*2/s.components*s.byteLength;case Xo:return i*e*2/s.components*s.byteLength;case nh:return i*e*3/s.components*s.byteLength;case Rn:return i*e*4/s.components*s.byteLength;case qo:return i*e*4/s.components*s.byteLength;case aa:case oa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case la:case ca:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ko:case $o:return Math.max(i,16)*Math.max(e,8)/4;case Yo:case Zo:return Math.max(i,8)*Math.max(e,8)/2;case Jo:case jo:case el:case tl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Qo:case ha:case nl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case il:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case sl:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case rl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case al:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case ol:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ll:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case cl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case hl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case ul:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case dl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case fl:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case pl:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case ml:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case gl:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case _l:case xl:case yl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case vl:case bl:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ua:case Sl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ag(i){switch(i){case dn:case Jc:return{byteLength:1,components:1};case or:case jc:case Hn:return{byteLength:2,components:1};case Ho:case Go:return{byteLength:2,components:4};case zn:case zo:case _n:return{byteLength:4,components:1};case Qc:case eh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?Ae("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function Nf(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function lg(i){let e=new WeakMap;function t(o,c){let l=o.array,h=o.usage,u=l.byteLength,d=i.createBuffer();i.bindBuffer(c,d),i.bufferData(c,l,h),o.onUploadCallback();let f;if(l instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=i.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=i.SHORT;else if(l instanceof Uint32Array)f=i.UNSIGNED_INT;else if(l instanceof Int32Array)f=i.INT;else if(l instanceof Int8Array)f=i.BYTE;else if(l instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,c,l){let h=c.array,u=c.updateRanges;if(i.bindBuffer(l,o),u.length===0)i.bufferSubData(l,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){let g=u[d],x=u[f];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++d,u[d]=x)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){let x=u[f];i.bufferSubData(l,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=e.get(o);c&&(i.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var cg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,hg=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ug=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,dg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,fg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,pg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,mg=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,gg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,_g=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,xg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,yg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,vg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bg=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Sg=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Mg=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,wg=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Tg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Eg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ag=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Rg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Cg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Pg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Ig=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Lg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Dg=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Ng=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ug=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Fg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Og=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Bg="gl_FragColor = linearToOutputTexel( gl_FragColor );",kg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,zg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Hg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Gg=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Vg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Wg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Xg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,qg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Yg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Kg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Zg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,$g=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Jg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,jg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Qg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,e0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,t0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,n0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,i0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,s0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,r0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,a0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,o0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,l0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,c0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,h0=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,u0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,d0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,f0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,p0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,m0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,g0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,_0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,x0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,y0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,v0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,b0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,S0=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,M0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,w0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,T0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,E0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,A0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,R0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,C0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,P0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,I0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,L0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,D0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,N0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,U0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,F0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,O0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,B0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,k0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,z0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,H0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,G0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,V0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,W0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,X0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,q0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Y0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,K0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Z0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,$0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,J0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,j0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Q0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,e_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,t_=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,n_=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,i_=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,s_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,r_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,a_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,o_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,l_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,c_=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,h_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,u_=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,d_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,f_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,p_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,m_=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,g_=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,__=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,x_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,y_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,v_=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,b_=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,S_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,M_=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,w_=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,T_=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,E_=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,A_=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,R_=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,C_=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,P_=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,I_=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,L_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,D_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,N_=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,U_=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,F_=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,O_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,B_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,k_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,z_=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,H_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,We={alphahash_fragment:cg,alphahash_pars_fragment:hg,alphamap_fragment:ug,alphamap_pars_fragment:dg,alphatest_fragment:fg,alphatest_pars_fragment:pg,aomap_fragment:mg,aomap_pars_fragment:gg,batching_pars_vertex:_g,batching_vertex:xg,begin_vertex:yg,beginnormal_vertex:vg,bsdfs:bg,iridescence_fragment:Sg,bumpmap_pars_fragment:Mg,clipping_planes_fragment:wg,clipping_planes_pars_fragment:Tg,clipping_planes_pars_vertex:Eg,clipping_planes_vertex:Ag,color_fragment:Rg,color_pars_fragment:Cg,color_pars_vertex:Pg,color_vertex:Ig,common:Lg,defaultnormal_vertex:Dg,displacementmap_pars_vertex:Ng,displacementmap_vertex:Ug,emissivemap_fragment:Fg,emissivemap_pars_fragment:Og,colorspace_fragment:Bg,colorspace_pars_fragment:kg,envmap_fragment:zg,envmap_common_pars_fragment:Hg,envmap_pars_fragment:Gg,envmap_pars_vertex:Vg,envmap_physical_pars_fragment:e0,envmap_vertex:Wg,fog_vertex:Xg,fog_pars_vertex:qg,fog_fragment:Yg,fog_pars_fragment:Kg,gradientmap_pars_fragment:Zg,lightmap_pars_fragment:$g,lights_lambert_fragment:Jg,lights_lambert_pars_fragment:jg,lights_pars_begin:Qg,lights_toon_fragment:t0,lights_toon_pars_fragment:n0,lights_phong_fragment:i0,lights_phong_pars_fragment:s0,lights_physical_fragment:r0,lights_physical_pars_fragment:a0,lights_fragment_begin:o0,lights_fragment_maps:l0,lights_fragment_end:c0,lightprobes_pars_fragment:h0,logdepthbuf_fragment:u0,logdepthbuf_pars_fragment:d0,logdepthbuf_pars_vertex:f0,logdepthbuf_vertex:p0,map_fragment:m0,map_pars_fragment:g0,map_particle_fragment:_0,map_particle_pars_fragment:x0,metalnessmap_fragment:y0,metalnessmap_pars_fragment:v0,morphinstance_vertex:b0,morphcolor_vertex:S0,morphnormal_vertex:M0,morphtarget_pars_vertex:w0,morphtarget_vertex:T0,normal_fragment_begin:E0,normal_fragment_maps:A0,normal_pars_fragment:R0,normal_pars_vertex:C0,normal_vertex:P0,normalmap_pars_fragment:I0,clearcoat_normal_fragment_begin:L0,clearcoat_normal_fragment_maps:D0,clearcoat_pars_fragment:N0,iridescence_pars_fragment:U0,opaque_fragment:F0,packing:O0,premultiplied_alpha_fragment:B0,project_vertex:k0,dithering_fragment:z0,dithering_pars_fragment:H0,roughnessmap_fragment:G0,roughnessmap_pars_fragment:V0,shadowmap_pars_fragment:W0,shadowmap_pars_vertex:X0,shadowmap_vertex:q0,shadowmask_pars_fragment:Y0,skinbase_vertex:K0,skinning_pars_vertex:Z0,skinning_vertex:$0,skinnormal_vertex:J0,specularmap_fragment:j0,specularmap_pars_fragment:Q0,tonemapping_fragment:e_,tonemapping_pars_fragment:t_,transmission_fragment:n_,transmission_pars_fragment:i_,uv_pars_fragment:s_,uv_pars_vertex:r_,uv_vertex:a_,worldpos_vertex:o_,background_vert:l_,background_frag:c_,backgroundCube_vert:h_,backgroundCube_frag:u_,cube_vert:d_,cube_frag:f_,depth_vert:p_,depth_frag:m_,distance_vert:g_,distance_frag:__,equirect_vert:x_,equirect_frag:y_,linedashed_vert:v_,linedashed_frag:b_,meshbasic_vert:S_,meshbasic_frag:M_,meshlambert_vert:w_,meshlambert_frag:T_,meshmatcap_vert:E_,meshmatcap_frag:A_,meshnormal_vert:R_,meshnormal_frag:C_,meshphong_vert:P_,meshphong_frag:I_,meshphysical_vert:L_,meshphysical_frag:D_,meshtoon_vert:N_,meshtoon_frag:U_,points_vert:F_,points_frag:O_,shadow_vert:B_,shadow_frag:k_,sprite_vert:z_,sprite_frag:H_},ye={common:{diffuse:{value:new Ce(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Oe}},envmap:{envMap:{value:null},envMapRotation:{value:new Oe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Oe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Oe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Oe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Oe},normalScale:{value:new _e(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Oe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Oe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Oe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Oe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ce(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Ce(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0},uvTransform:{value:new Oe}},sprite:{diffuse:{value:new Ce(16777215)},opacity:{value:1},center:{value:new _e(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}}},ii={basic:{uniforms:en([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.fog]),vertexShader:We.meshbasic_vert,fragmentShader:We.meshbasic_frag},lambert:{uniforms:en([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,ye.lights,{emissive:{value:new Ce(0)},envMapIntensity:{value:1}}]),vertexShader:We.meshlambert_vert,fragmentShader:We.meshlambert_frag},phong:{uniforms:en([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,ye.lights,{emissive:{value:new Ce(0)},specular:{value:new Ce(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:We.meshphong_vert,fragmentShader:We.meshphong_frag},standard:{uniforms:en([ye.common,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.roughnessmap,ye.metalnessmap,ye.fog,ye.lights,{emissive:{value:new Ce(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag},toon:{uniforms:en([ye.common,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.gradientmap,ye.fog,ye.lights,{emissive:{value:new Ce(0)}}]),vertexShader:We.meshtoon_vert,fragmentShader:We.meshtoon_frag},matcap:{uniforms:en([ye.common,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,{matcap:{value:null}}]),vertexShader:We.meshmatcap_vert,fragmentShader:We.meshmatcap_frag},points:{uniforms:en([ye.points,ye.fog]),vertexShader:We.points_vert,fragmentShader:We.points_frag},dashed:{uniforms:en([ye.common,ye.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:We.linedashed_vert,fragmentShader:We.linedashed_frag},depth:{uniforms:en([ye.common,ye.displacementmap]),vertexShader:We.depth_vert,fragmentShader:We.depth_frag},normal:{uniforms:en([ye.common,ye.bumpmap,ye.normalmap,ye.displacementmap,{opacity:{value:1}}]),vertexShader:We.meshnormal_vert,fragmentShader:We.meshnormal_frag},sprite:{uniforms:en([ye.sprite,ye.fog]),vertexShader:We.sprite_vert,fragmentShader:We.sprite_frag},background:{uniforms:{uvTransform:{value:new Oe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:We.background_vert,fragmentShader:We.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Oe}},vertexShader:We.backgroundCube_vert,fragmentShader:We.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:We.cube_vert,fragmentShader:We.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:We.equirect_vert,fragmentShader:We.equirect_frag},distance:{uniforms:en([ye.common,ye.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:We.distance_vert,fragmentShader:We.distance_frag},shadow:{uniforms:en([ye.lights,ye.fog,{color:{value:new Ce(0)},opacity:{value:1}}]),vertexShader:We.shadow_vert,fragmentShader:We.shadow_frag}};ii.physical={uniforms:en([ii.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Oe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Oe},clearcoatNormalScale:{value:new _e(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Oe},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Oe},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Oe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Oe},sheen:{value:0},sheenColor:{value:new Ce(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Oe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Oe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Oe},transmissionSamplerSize:{value:new _e},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Oe},attenuationDistance:{value:0},attenuationColor:{value:new Ce(0)},specularColor:{value:new Ce(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Oe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Oe},anisotropyVector:{value:new _e},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Oe}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag};var wl={r:0,b:0,g:0},G_=new ze,Uf=new Oe;Uf.set(-1,0,0,0,1,0,0,0,1);function V_(i,e,t,n,s,r){let a=new Ce(0),o=s===!0?0:1,c,l,h=null,u=0,d=null;function f(y){let M=y.isScene===!0?y.background:null;if(M&&M.isTexture){let v=y.backgroundBlurriness>0;M=e.get(M,v)}return M}function g(y){let M=!1,v=f(y);v===null?m(a,o):v&&v.isColor&&(m(v,1),M=!0);let E=i.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||M)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function x(y,M){let v=f(M);v&&v.isCubeTexture?(l===void 0&&(l=new Ne(new hn(1,1,1),new Mt({name:"BackgroundCubeMaterial",uniforms:bs(ii.backgroundCube.uniforms),vertexShader:ii.backgroundCube.vertexShader,fragmentShader:ii.backgroundCube.fragmentShader,side:Yt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(E,T,_){this.matrixWorld.copyPosition(_.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=v,l.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(G_.makeRotationFromEuler(M.backgroundRotation)).transpose(),v.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Uf),l.material.toneMapped=Xe.getTransfer(v.colorSpace)!==nt,(h!==v||u!==v.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=v,u=v.version,d=i.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new Ne(new yi(2,2),new Mt({name:"BackgroundMaterial",uniforms:bs(ii.background.uniforms),vertexShader:ii.background.vertexShader,fragmentShader:ii.background.fragmentShader,side:Qn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=Xe.getTransfer(v.colorSpace)!==nt,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||u!==v.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=v,u=v.version,d=i.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function m(y,M){y.getRGB(wl,ph(i)),t.buffers.color.setClear(wl.r,wl.g,wl.b,M,r)}function p(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(y,M=1){a.set(y),o=M,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(y){o=y,m(a,o)},render:g,addToRenderList:x,dispose:p}}function W_(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,a=!1;function o(N,F,B,I,k){let V=!1,z=u(N,I,B,F);r!==z&&(r=z,l(r.object)),V=f(N,I,B,k),V&&g(N,I,B,k),k!==null&&e.update(k,i.ELEMENT_ARRAY_BUFFER),(V||a)&&(a=!1,v(N,F,B,I),k!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function c(){return i.createVertexArray()}function l(N){return i.bindVertexArray(N)}function h(N){return i.deleteVertexArray(N)}function u(N,F,B,I){let k=I.wireframe===!0,V=n[F.id];V===void 0&&(V={},n[F.id]=V);let z=N.isInstancedMesh===!0?N.id:0,j=V[z];j===void 0&&(j={},V[z]=j);let C=j[B.id];C===void 0&&(C={},j[B.id]=C);let H=C[k];return H===void 0&&(H=d(c()),C[k]=H),H}function d(N){let F=[],B=[],I=[];for(let k=0;k<t;k++)F[k]=0,B[k]=0,I[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:B,attributeDivisors:I,object:N,attributes:{},index:null}}function f(N,F,B,I){let k=r.attributes,V=F.attributes,z=0,j=B.getAttributes();for(let C in j)if(j[C].location>=0){let Y=k[C],ie=V[C];if(ie===void 0&&(C==="instanceMatrix"&&N.instanceMatrix&&(ie=N.instanceMatrix),C==="instanceColor"&&N.instanceColor&&(ie=N.instanceColor)),Y===void 0||Y.attribute!==ie||ie&&Y.data!==ie.data)return!0;z++}return r.attributesNum!==z||r.index!==I}function g(N,F,B,I){let k={},V=F.attributes,z=0,j=B.getAttributes();for(let C in j)if(j[C].location>=0){let Y=V[C];Y===void 0&&(C==="instanceMatrix"&&N.instanceMatrix&&(Y=N.instanceMatrix),C==="instanceColor"&&N.instanceColor&&(Y=N.instanceColor));let ie={};ie.attribute=Y,Y&&Y.data&&(ie.data=Y.data),k[C]=ie,z++}r.attributes=k,r.attributesNum=z,r.index=I}function x(){let N=r.newAttributes;for(let F=0,B=N.length;F<B;F++)N[F]=0}function m(N){p(N,0)}function p(N,F){let B=r.newAttributes,I=r.enabledAttributes,k=r.attributeDivisors;B[N]=1,I[N]===0&&(i.enableVertexAttribArray(N),I[N]=1),k[N]!==F&&(i.vertexAttribDivisor(N,F),k[N]=F)}function y(){let N=r.newAttributes,F=r.enabledAttributes;for(let B=0,I=F.length;B<I;B++)F[B]!==N[B]&&(i.disableVertexAttribArray(B),F[B]=0)}function M(N,F,B,I,k,V,z){z===!0?i.vertexAttribIPointer(N,F,B,k,V):i.vertexAttribPointer(N,F,B,I,k,V)}function v(N,F,B,I){x();let k=I.attributes,V=B.getAttributes(),z=F.defaultAttributeValues;for(let j in V){let C=V[j];if(C.location>=0){let H=k[j];if(H===void 0&&(j==="instanceMatrix"&&N.instanceMatrix&&(H=N.instanceMatrix),j==="instanceColor"&&N.instanceColor&&(H=N.instanceColor)),H!==void 0){let Y=H.normalized,ie=H.itemSize,we=e.get(H);if(we===void 0)continue;let Z=we.buffer,ae=we.type,le=we.bytesPerElement,te=ae===i.INT||ae===i.UNSIGNED_INT||H.gpuType===zo;if(H.isInterleavedBufferAttribute){let re=H.data,Te=re.isInterleavedBuffer===!0?re.stride:re.itemSize,Ke=H.offset;if(re.isInstancedInterleavedBuffer||re.isInstancedBufferAttribute){for(let Ie=0;Ie<C.locationSize;Ie++)p(C.location+Ie,re.meshPerAttribute);N.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let Ie=0;Ie<C.locationSize;Ie++)m(C.location+Ie);i.bindBuffer(i.ARRAY_BUFFER,Z);for(let Ie=0;Ie<C.locationSize;Ie++)M(C.location+Ie,ie/C.locationSize,ae,Y,Te*le,(Ke+ie/C.locationSize*Ie)*le,te)}else{if(H.isInstancedBufferAttribute){for(let re=0;re<C.locationSize;re++)p(C.location+re,H.meshPerAttribute);N.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=H.meshPerAttribute*H.count)}else for(let re=0;re<C.locationSize;re++)m(C.location+re);i.bindBuffer(i.ARRAY_BUFFER,Z);for(let re=0;re<C.locationSize;re++)M(C.location+re,ie/C.locationSize,ae,Y,ie*le,ie/C.locationSize*re*le,te)}}else if(z!==void 0){let Y=z[j];if(Y!==void 0)switch(Y.length){case 2:i.vertexAttrib2fv(C.location,Y);break;case 3:i.vertexAttrib3fv(C.location,Y);break;case 4:i.vertexAttrib4fv(C.location,Y);break;default:i.vertexAttrib1fv(C.location,Y)}}}}y()}function E(){L();for(let N in n){let F=n[N];for(let B in F){let I=F[B];for(let k in I){let V=I[k];for(let z in V)h(V[z].object),delete V[z];delete I[k]}}delete n[N]}}function T(N){if(n[N.id]===void 0)return;let F=n[N.id];for(let B in F){let I=F[B];for(let k in I){let V=I[k];for(let z in V)h(V[z].object),delete V[z];delete I[k]}}delete n[N.id]}function _(N){for(let F in n){let B=n[F];for(let I in B){let k=B[I];if(k[N.id]===void 0)continue;let V=k[N.id];for(let z in V)h(V[z].object),delete V[z];delete k[N.id]}}}function b(N){for(let F in n){let B=n[F],I=N.isInstancedMesh===!0?N.id:0,k=B[I];if(k!==void 0){for(let V in k){let z=k[V];for(let j in z)h(z[j].object),delete z[j];delete k[V]}delete B[I],Object.keys(B).length===0&&delete n[F]}}}function L(){A(),a=!0,r!==s&&(r=s,l(r.object))}function A(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:L,resetDefaultState:A,dispose:E,releaseStatesOfGeometry:T,releaseStatesOfObject:b,releaseStatesOfProgram:_,initAttributes:x,enableAttribute:m,disableUnusedAttributes:y}}function X_(i,e,t){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),t.update(l,n,1)}function a(c,l,h){h!==0&&(i.drawArraysInstanced(n,c,l,h),t.update(l,n,h))}function o(c,l,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,h);let d=0;for(let f=0;f<h;f++)d+=l[f];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function q_(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let _=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(_.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(_){return!(_!==Rn&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(_){let b=_===Hn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(_!==dn&&_!==_n&&!b&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function c(_){if(_==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";_="mediump"}return _==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",h=c(l);h!==l&&(Ae("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=t.logarithmicDepthBuffer===!0&&u===!1;t.reversedDepthBuffer===!0&&u===!1&&Ae("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&u===!0&&Ae("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),y=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),T=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:y,maxVaryings:M,maxFragmentUniforms:v,maxSamples:E,samples:T}}function Y_(i){let e=this,t=null,n=0,s=!1,r=!1,a=new gn,o=new Oe,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||s;return s=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){let g=u.clippingPlanes,x=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):l();else{let y=r?0:n,M=y*4,v=p.clippingState||null;c.value=v,v=h(g,d,M,f);for(let E=0;E!==M;++E)v[E]=t[E];p.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=y}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,g){let x=u!==null?u.length:0,m=null;if(x!==0){if(m=c.value,g!==!0||m===null){let p=f+x*4,y=d.matrixWorldInverse;o.getNormalMatrix(y),(m===null||m.length<p)&&(m=new Float32Array(p));for(let M=0,v=f;M!==x;++M,v+=4)a.copy(u[M]).applyMatrix4(y,o),a.normal.toArray(m,v),m[v+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}var ga=class extends Qt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Xr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new hn(5,5,5),r=new Mt({name:"CubemapFromEquirect",uniforms:bs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Yt,blending:Ai});r.uniforms.tEquirect.value=t;let a=new Ne(s,r),o=t.minFilter;return t.minFilter===An&&(t.minFilter=St),new nr(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}},ff=256,K_=3,Z_=20,Ff=256,Of=16,$_=3,J_=new P,j_=new Ce,hr=class i{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new nr(1,10,null),this._boxMesh=new Ne(new hn(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=J_}=r,c=this._renderer;this._setSize(a);let l=this._allocateTarget(),h=this._getSourceTarget(!0);t>0&&(h.texture.mipmapsAutoUpdate=!1);let u=c.autoClear,d=c.autoClearColor,f=c.autoClearDepth,g=c.autoClearStencil,x=e.background;c.autoClear=!0,c.autoClearColor=!0,c.autoClearDepth=!0,c.autoClearStencil=!0,x===null&&(e.background=c.getClearColor(j_));let m=new nr(n,s,h);return m.position.copy(o),m.update(c,e),c.autoClear=u,c.autoClearColor=d,c.autoClearDepth=f,c.autoClearStencil=g,e.background=x,t>0&&(h.texture.mipmapsAutoUpdate=!0,this._blur(l,t)),this._applyPMREM(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=gf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=mf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(ff,hh(e))}_fromTexture(e,t){e.mapping===xs||e.mapping===rr?this._setSize(e.image.length===0?ff:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=pf(e,!1,!1),n=Math.log2(e)-K_;for(let s=0;s<=n;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=pf(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=e,r.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===xs||e.mapping===rr?(this._cubemapMaterial===null&&(this._cubemapMaterial=gf()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=mf()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=Q_(),this._integrationMaterial=ex());let t=this._cubeSize,n=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/Of);for(let a=0;a<=n;a++){let o=i.lodToRoughness(a,n);if(a>n-$_)r.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{let c=o>0?Math.log2(t)+.5*Math.log2(6/(Ff*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=c,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=tx());let n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,n),s.envMap.value=e.texture,this._renderCube(r,0,n)}};function pf(i,e,t){return new ga(i,{minFilter:An,generateMipmaps:e,type:Hn,colorSpace:It,depthBuffer:t})}function _a(i,e,t){return new Mt({name:i,uniforms:e,vertexShader:We.cube_vert,fragmentShader:t,side:Yt,blending:Ai,depthTest:!1,depthWrite:!1})}function Q_(){return _a("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Ff}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function ex(){return _a("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Of}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function tx(){return _a("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Z_}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function mf(){return _a("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function gf(){return _a("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function nx(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,f=!1){return d==null?null:f?a(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===Oo||f===Bo)if(e.has(d)){let g=e.get(d).texture;return o(g,d.mapping)}else{let g=d.image;if(g&&g.height>0){let x=new ga(g.height);return x.fromEquirectangularTexture(i,d),e.set(d,x),d.addEventListener("dispose",l),o(x.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture&&d.isPMREMTexture!==!0){let f=d.mapping,g=f===Oo||f===Bo,x=f===xs||f===rr;if(g||x){let m=t.get(d),p=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return n===null&&(n=new hr(i)),m=g?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{let y=d.image;return g&&y&&y.height>0||x&&y&&c(y)?(n===null&&(n=new hr(i)),m=g?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",h),m.texture):null}}}return d}function o(d,f){return f===Oo?d.mapping=xs:f===Bo&&(d.mapping=rr),d}function c(d){let f=0,g=6;for(let x=0;x<g;x++)d[x]!==void 0&&f++;return f===g}function l(d){let f=d.target;f.removeEventListener("dispose",l);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function u(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function ix(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&as("WebGLRenderer: "+n+" extension not supported."),s}}}function sx(i,e,t,n){let s={},r=new WeakMap,a=new FinalizationRegistry(g=>delete s[g]);function o(g){c(g.target)}function c(g){g.index!==null&&e.remove(g.index);for(let m in g.attributes)e.remove(g.attributes[m]);g.removeEventListener("dispose",o),delete s[g.id],a.unregister(g);let x=r.get(g);x&&(e.remove(x),r.delete(g)),n.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,t.memory.geometries--}function l(g,x){return s[x.id]!==void 0||(x.addEventListener("dispose",o),s[x.id]=new WeakRef(x),a.register(x,x.id,x),t.memory.geometries++),x}function h(g){let x=g.attributes;for(let m in x)e.update(x[m],i.ARRAY_BUFFER)}function u(g){let x=g.index,m=g.attributes.position,p=0;if(m===void 0)return;let y=x!==null?x.array.length:m.array.length/3-1,M=m.count>=65535?Hr:zr,v=new M(Math.ceil(y/3)*6,1),E=v.array;if(x!==null){let _=x.array;p=x.version;for(let b=0,L=0;b<y;b+=3){let A=_[b+0],N=_[b+1],F=_[b+2];E[L++]=A,E[L++]=N,E[L++]=N,E[L++]=F,E[L++]=F,E[L++]=A}}else{p=m.version;for(let _=0,b=0;_<y;_+=3){let L=_+0,A=_+1,N=_+2;E[b++]=L,E[b++]=A,E[b++]=A,E[b++]=N,E[b++]=N,E[b++]=L}}v.version=p;let T=r.get(g);T&&e.remove(T),r.set(g,v)}function d(g){let x=r.get(g);if(x){let m=g.index;m!==null&&x.version<m.version&&u(g)}else u(g);return r.get(g)}function f(){for(let g in s){let x=s[g].deref();x!==void 0&&c(x)}}return{get:l,update:h,getWireframeAttribute:d,dispose:f}}function rx(i,e,t){let n;function s(u){n=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function c(u,d){i.drawElements(n,d,r,u*a),t.update(d,n,1)}function l(u,d,f){f!==0&&(i.drawElementsInstanced(n,d,r,u*a,f),t.update(d,n,f))}function h(u,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,f);let x=0;for(let m=0;m<f;m++)x+=d[m];t.update(x,n,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function ax(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Fe("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function ox(i,e,t){let n=new WeakMap,s=new rt;function r(a,o,c){let l=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(o);if(d===void 0||d.count!==u){let L=function(){_.dispose(),n.delete(o),o.removeEventListener("dispose",L)};d!==void 0&&d.texture.dispose();let f=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],y=o.morphAttributes.color||[],M=0;f===!0&&(M=1),g===!0&&(M=2),x===!0&&(M=3);let v=o.attributes.position.count*M,E=1;v>e.maxTextureSize&&(E=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let T=new Float32Array(v*E*4*u),_=new Br(T,v,E,u);_.type=_n,_.needsUpdate=!0;let b=M*4;for(let A=0;A<u;A++){let N=m[A],F=p[A],B=y[A],I=v*E*4*A;for(let k=0;k<N.count;k++){let V=k*b;f===!0&&(s.fromBufferAttribute(N,k),T[I+V+0]=s.x,T[I+V+1]=s.y,T[I+V+2]=s.z,T[I+V+3]=0),g===!0&&(s.fromBufferAttribute(F,k),T[I+V+4]=s.x,T[I+V+5]=s.y,T[I+V+6]=s.z,T[I+V+7]=0),x===!0&&(s.fromBufferAttribute(B,k),T[I+V+8]=s.x,T[I+V+9]=s.y,T[I+V+10]=s.z,T[I+V+11]=B.itemSize===4?s.w:1)}}d={count:u,texture:_,size:new _e(v,E)},n.set(o,d),o.addEventListener("dispose",L)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let x=0;x<l.length;x++)f+=l[x];let g=o.morphTargetsRelative?1:1-f;c.getUniforms().setValue(i,"morphTargetBaseInfluence",g),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function lx(i,e,t,n,s){let r=new WeakMap;function a(l){let h=s.render.frame,u=l.geometry,d=e.get(l,u);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==h&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,h))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function o(){r=new WeakMap}function c(l){let h=l.target;h.removeEventListener("dispose",c),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var cx={[Wc]:"LINEAR_TONE_MAPPING",[Xc]:"REINHARD_TONE_MAPPING",[qc]:"CINEON_TONE_MAPPING",[ra]:"ACES_FILMIC_TONE_MAPPING",[Kc]:"AGX_TONE_MAPPING",[Zc]:"NEUTRAL_TONE_MAPPING",[Yc]:"CUSTOM_TONE_MAPPING"};function hx(i,e,t,n,s,r){let a=new Qt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,c=null,l=null,h=new Qe;h.setAttribute("position",new Ue([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new Ue([0,2,0,0,2,0],2));let u=new To({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Ne(h,u),f=new wi(-1,1,1,-1,0,1),g=null,x=null,m=!1,p,y=null,M=[],v=!1;this.setSize=function(E,T){a.setSize(E,T),o!==null&&o.setSize(E,T),c!==null&&c.setSize(E,T);for(let _=0;_<M.length;_++){let b=M[_];b.setSize&&b.setSize(E,T)}},this.setEffects=function(E){M=E,v=M.length>0&&M[0].isRenderPass===!0;let T=a.width,_=a.height;M.length>0&&o===null&&(o=new Qt(T,_,{type:Hn,depthBuffer:!1,stencilBuffer:!1}),c=new Qt(T,_,{type:Hn,depthBuffer:!1,stencilBuffer:!1}));let b=s===!0&&M.some(L=>L.needsDepthTexture===!0);b!==(a.depthTexture!==null)&&(b===!0&&l===null&&(l=new xi(T,_),r===!0&&(l.format=Ri,l.type=vs)),a.dispose(),a.depthTexture=b?l:null,a.resolveDepthBuffer=b,a.storeMultisampledDepthBuffer=b);for(let L=0;L<M.length;L++){let A=M[L];A.setSize&&A.setSize(T,_),b&&A.needsDepthTexture===!0&&A.setDepthTexture&&A.setDepthTexture(l)}},this.begin=function(E,T){if(m||E.toneMapping===ei&&M.length===0)return!1;if(y=T,T!==null){let _=T.width,b=T.height;(a.width!==_||a.height!==b)&&this.setSize(_,b)}return v===!1&&E.setRenderTarget(a),p=E.toneMapping,E.toneMapping=ei,!0},this.hasRenderPass=function(){return v},this.end=function(E,T){E.toneMapping=p,m=!0;let _=a,b=o;for(let L=0;L<M.length;L++){let A=M[L];A.enabled!==!1&&(A.render(E,b,_,T),A.needsSwap!==!1&&(_=b,b=b===o?c:o))}if(g!==E.outputColorSpace||x!==E.toneMapping){g=E.outputColorSpace,x=E.toneMapping,u.defines={},Xe.getTransfer(g)===nt&&(u.defines.SRGB_TRANSFER="");let L=cx[x];L&&(u.defines[L]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=_.texture,E.setRenderTarget(y),E.render(d,f),y=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),h.dispose(),u.dispose()}}var Bf=new Lt,kf=new xi(1,1),zf=new Yr(1),Hf=new Br,Gf=new fo,Vf=new Xr,_f=[],xf=[],yf=new Float32Array(16),vf=new Float32Array(9),bf=new Float32Array(4);function dr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=_f[s];if(r===void 0&&(r=new Float32Array(s),_f[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Nt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Ut(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function El(i,e){let t=xf[e];t===void 0&&(t=new Int32Array(e),xf[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function ux(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function dx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;i.uniform2fv(this.addr,e),Ut(t,e)}}function fx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Nt(t,e))return;i.uniform3fv(this.addr,e),Ut(t,e)}}function px(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;i.uniform4fv(this.addr,e),Ut(t,e)}}function mx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Nt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Ut(t,e)}else{if(Nt(t,n))return;bf.set(n),i.uniformMatrix2fv(this.addr,!1,bf),Ut(t,n)}}function gx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Nt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Ut(t,e)}else{if(Nt(t,n))return;vf.set(n),i.uniformMatrix3fv(this.addr,!1,vf),Ut(t,n)}}function _x(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Nt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Ut(t,e)}else{if(Nt(t,n))return;yf.set(n),i.uniformMatrix4fv(this.addr,!1,yf),Ut(t,n)}}function xx(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function yx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;i.uniform2iv(this.addr,e),Ut(t,e)}}function vx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Nt(t,e))return;i.uniform3iv(this.addr,e),Ut(t,e)}}function bx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;i.uniform4iv(this.addr,e),Ut(t,e)}}function Sx(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Mx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;i.uniform2uiv(this.addr,e),Ut(t,e)}}function wx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Nt(t,e))return;i.uniform3uiv(this.addr,e),Ut(t,e)}}function Tx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;i.uniform4uiv(this.addr,e),Ut(t,e)}}function Al(i){return i.version===0&&(i.compareFunction=ah,i.needsUpdate=!0),i}function Ex(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=Al(kf):r=Bf,t.setTexture2D(e||r,s)}function Ax(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Gf,s)}function Rx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=Al(zf):r=Vf,t.setTextureCube(e||r,s)}function Cx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Hf,s)}function Px(i){switch(i){case 5126:return ux;case 35664:return dx;case 35665:return fx;case 35666:return px;case 35674:return mx;case 35675:return gx;case 35676:return _x;case 5124:case 35670:return xx;case 35667:case 35671:return yx;case 35668:case 35672:return vx;case 35669:case 35673:return bx;case 5125:return Sx;case 36294:return Mx;case 36295:return wx;case 36296:return Tx;case 35678:case 36198:case 36298:case 36306:case 35682:return Ex;case 35679:case 36299:case 36307:return Ax;case 35680:case 36300:case 36308:case 36293:return Rx;case 36289:case 36303:case 36311:case 36292:return Cx}}function Ix(i,e){i.uniform1fv(this.addr,e)}function Lx(i,e){let t=dr(e,this.size,2);i.uniform2fv(this.addr,t)}function Dx(i,e){let t=dr(e,this.size,3);i.uniform3fv(this.addr,t)}function Nx(i,e){let t=dr(e,this.size,4);i.uniform4fv(this.addr,t)}function Ux(i,e){let t=dr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Fx(i,e){let t=dr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Ox(i,e){let t=dr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Bx(i,e){i.uniform1iv(this.addr,e)}function kx(i,e){i.uniform2iv(this.addr,e)}function zx(i,e){i.uniform3iv(this.addr,e)}function Hx(i,e){i.uniform4iv(this.addr,e)}function Gx(i,e){i.uniform1uiv(this.addr,e)}function Vx(i,e){i.uniform2uiv(this.addr,e)}function Wx(i,e){i.uniform3uiv(this.addr,e)}function Xx(i,e){i.uniform4uiv(this.addr,e)}function qx(i,e,t){let n=this.cache,s=e.length,r=El(t,s);Nt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Al(kf):a=Bf;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Yx(i,e,t){let n=this.cache,s=e.length,r=El(t,s);Nt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Gf,r[a])}function Kx(i,e,t){let n=this.cache,s=e.length,r=El(t,s);Nt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=Al(zf):a=Vf;for(let o=0;o!==s;++o)t.setTextureCube(e[o]||a,r[o])}function Zx(i,e,t){let n=this.cache,s=e.length,r=El(t,s);Nt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Hf,r[a])}function $x(i){switch(i){case 5126:return Ix;case 35664:return Lx;case 35665:return Dx;case 35666:return Nx;case 35674:return Ux;case 35675:return Fx;case 35676:return Ox;case 5124:case 35670:return Bx;case 35667:case 35671:return kx;case 35668:case 35672:return zx;case 35669:case 35673:return Hx;case 5125:return Gx;case 36294:return Vx;case 36295:return Wx;case 36296:return Xx;case 35678:case 36198:case 36298:case 36306:case 35682:return qx;case 35679:case 36299:case 36307:return Yx;case 35680:case 36300:case 36308:case 36293:return Kx;case 36289:case 36303:case 36311:case 36292:return Zx}}var vh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Px(t.type)}},bh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=$x(t.type)}},Sh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},xh=/(\w+)(\])?(\[|\.)?/g;function Sf(i,e){i.seq.push(e),i.map[e.id]=e}function Jx(i,e,t){let n=i.name,s=n.length;for(xh.lastIndex=0;;){let r=xh.exec(n),a=xh.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){Sf(t,l===void 0?new vh(o,i,e):new bh(o,i,e));break}else{let u=t.map[o];u===void 0&&(u=new Sh(o),Sf(t,u)),t=u}}}var cr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);Jx(o,c,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Mf(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var jx=37297,Qx=0;function ey(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var wf=new Oe;function ty(i){Xe._getMatrix(wf,Xe.workingColorSpace,i);let e=`mat3( ${wf.elements.map(t=>t.toFixed(4))} )`;switch(Xe.getTransfer(i)){case Fr:return[e,"LinearTransferOETF"];case nt:return[e,"sRGBTransferOETF"];default:return Ae("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Tf(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+ey(i.getShaderSource(e),o)}else return r}function ny(i,e){let t=ty(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var iy={[Wc]:"Linear",[Xc]:"Reinhard",[qc]:"Cineon",[ra]:"ACESFilmic",[Kc]:"AgX",[Zc]:"Neutral",[Yc]:"Custom"};function sy(i,e){let t=iy[e];return t===void 0?(Ae("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Tl=new P;function ry(){Xe.getLuminanceCoefficients(Tl);let i=Tl.x.toFixed(4),e=Tl.y.toFixed(4),t=Tl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ay(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ma).join(`
`)}function oy(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function ly(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function ma(i){return i!==""}function Ef(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function Af(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var cy=/^[ \t]*#include +<([\w\d./]+)>/gm;function Mh(i){return i.replace(cy,hy)}function hy(i,e){let t=We[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return Mh(t)}var uy=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Rf(i){return i.replace(uy,dy)}function dy(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Cf(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var fy={[sa]:"SHADOWMAP_TYPE_PCF",[ir]:"SHADOWMAP_TYPE_VSM"};function py(i){return fy[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var my={[rr]:"ENVMAP_MODE_REFRACTION"};function gy(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":my[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var _y={[Fo]:"ENVMAP_BLENDING_MULTIPLY",[qd]:"ENVMAP_BLENDING_MIX",[Yd]:"ENVMAP_BLENDING_ADD"};function xy(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":_y[i.combine]||"ENVMAP_BLENDING_NONE"}function yy(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,c=py(t),l=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",h=gy(t),u=xy(t),d=ay(t),f=oy(r),g=s.createProgram(),x,m,p=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(x=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(ma).join(`
`),x.length>0&&(x+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(ma).join(`
`),m.length>0&&(m+=`
`)):(x=[Cf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ma).join(`
`),m=[Cf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ei?"#define TONE_MAPPING":"",t.toneMapping!==ei?We.tonemapping_pars_fragment:"",t.toneMapping!==ei?sy("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",We.colorspace_pars_fragment,ny("linearToOutputTexel",t.outputColorSpace),ry(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ma).join(`
`)),a=Mh(a),a=Ef(a,t),a=Af(a,t),o=Mh(o),o=Ef(o,t),o=Af(o,t),a=Rf(a),o=Rf(o),t.isRawShaderMaterial!==!0&&(p=`#version 300 es
`,x=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,m=["#define varying in",t.glslVersion===lh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===lh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let y=p+x+a,M=p+m+o,v=Mf(s,s.VERTEX_SHADER,y),E=Mf(s,s.FRAGMENT_SHADER,M);s.attachShader(g,v),s.attachShader(g,E),t.index0AttributeName!==void 0?s.bindAttribLocation(g,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(g,0,"position"),s.linkProgram(g);function T(A){if(i.debug.checkShaderErrors){let N=s.getProgramInfoLog(g)||"",F=s.getShaderInfoLog(v)||"",B=s.getShaderInfoLog(E)||"",I=N.trim(),k=F.trim(),V=B.trim(),z=!0,j=!0;if(s.getProgramParameter(g,s.LINK_STATUS)===!1)if(z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,g,v,E);else{let C=Tf(s,v,"vertex"),H=Tf(s,E,"fragment");Fe("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(g,s.VALIDATE_STATUS)+`

Material Name: `+A.name+`
Material Type: `+A.type+`

Program Info Log: `+I+`
`+C+`
`+H)}else I!==""?Ae("WebGLProgram: Program Info Log:",I):(k===""||V==="")&&(j=!1);j&&(A.diagnostics={runnable:z,programLog:I,vertexShader:{log:k,prefix:x},fragmentShader:{log:V,prefix:m}})}s.deleteShader(v),s.deleteShader(E),_=new cr(s,g),b=ly(s,g)}let _;this.getUniforms=function(){return _===void 0&&T(this),_};let b;this.getAttributes=function(){return b===void 0&&T(this),b};let L=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return L===!1&&(L=s.getProgramParameter(g,jx)),L},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Qx++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=v,this.fragmentShader=E,this}var vy=0,wh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Th(e),t.set(e,n)),n}},Th=class{constructor(e){this.id=vy++,this.code=e,this.usedTimes=0}};function by(i){return i===Yi||i===ha||i===ua}function Sy(i,e,t,n,s,r){let a=new kr,o=new wh,c=new Set,l=[],h=new Map,u=n.logarithmicDepthBuffer,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(_){return c.add(_),_===0?"uv":`uv${_}`}function g(_,b,L,A,N,F){let B=A.fog,I=N.geometry,k=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?A.environment:null,V=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,z=e.get(_.envMap||k,V),j=d[_.type],C=n.precision;_.precision!==null&&(C=n.getMaxPrecision(_.precision),C!==_.precision&&Ae("WebGLProgram.getParameters:",_.precision,"not supported, using",C,"instead."));let H=I.morphAttributes.position||I.morphAttributes.normal||I.morphAttributes.color,Y=H!==void 0?H.length:0,ie=0;I.morphAttributes.position!==void 0&&(ie=1),I.morphAttributes.normal!==void 0&&(ie=2),I.morphAttributes.color!==void 0&&(ie=3);let we,Z,ae,le;if(j){let xe=ii[j];we=xe.vertexShader,Z=xe.fragmentShader}else{we=_.vertexShader,Z=_.fragmentShader;let xe=o.getVertexShaderStage(_),st=o.getFragmentShaderStage(_);o.update(_,xe,st),ae=xe.id,le=st.id}let te=i.getRenderTarget(),re=i.state.buffers.depth.getReversed(),Te=N.isInstancedMesh===!0,Ke=N.isBatchedMesh===!0,Ie=!!_.map,je=!!_.matcap,it=!!z,Ye=it&&z.isPMREMTexture===!0,Gt=!!_.aoMap,At=!!_.lightMap,ln=!!_.bumpMap&&_.wireframe===!1,xt=!!_.normalMap,Xn=!!_.displacementMap,Bt=!!_.emissiveMap,yn=!!_.metalnessMap,vn=!!_.roughnessMap,bn=_.anisotropy>0,O=_.clearcoat>0,Sn=_.diffuseRoughness>0,dt=_.dispersion>0,ft=_.retroreflectivity>0,ge=_.iridescence>0,Rt=_.sheen>0,De=_.transmission>0,Be=bn&&!!_.anisotropyMap,R=O&&!!_.clearcoatMap,S=O&&!!_.clearcoatNormalMap,W=O&&!!_.clearcoatRoughnessMap,ne=Sn&&!!_.diffuseRoughnessMap,ee=ge&&!!_.iridescenceMap,ce=ge&&!!_.iridescenceThicknessMap,pe=Rt&&!!_.sheenColorMap,$=Rt&&!!_.sheenRoughnessMap,J=!!_.specularMap,ue=!!_.specularColorMap,D=!!_.specularIntensityMap,Q=De&&!!_.transmissionMap,K=De&&!!_.thicknessMap,de=!!_.gradientMap,oe=!!_.alphaMap,he=_.alphaTest>0,Re=!!_.alphaHash,Ve=!!_.extensions,se=ei;_.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(se=i.toneMapping);let Le=Ye?z.isCompressedCubeTexture?z.image[0].mipmaps:z.mipmaps:null,He={shaderID:j,shaderType:_.type,shaderName:_.name,vertexShader:we,fragmentShader:Z,defines:_.defines,customVertexShaderID:ae,customFragmentShaderID:le,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:C,batching:Ke,batchingColor:Ke&&N._colorsTexture!==null,instancing:Te,instancingColor:Te&&N.instanceColor!==null,instancingMorph:Te&&N.morphTexture!==null,outputColorSpace:te===null?i.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Xe.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Ie,matcap:je,envMap:it,envMapMode:it&&z.mapping,envMapPMREM:Ye,envMapMaxLod:Ye?Le.length-1:null,envMapSize:Ye?Le[0].width:null,aoMap:Gt,lightMap:At,bumpMap:ln,normalMap:xt,displacementMap:Xn,emissiveMap:Bt,normalMapObjectSpace:xt&&_.normalMapType===Jd,normalMapTangentSpace:xt&&_.normalMapType===fa,packedNormalMap:xt&&_.normalMapType===fa&&by(_.normalMap.format),metalnessMap:yn,roughnessMap:vn,anisotropy:bn,anisotropyMap:Be,clearcoat:O,clearcoatMap:R,clearcoatNormalMap:S,clearcoatRoughnessMap:W,diffuseRoughness:Sn,diffuseRoughnessMap:ne,dispersion:dt,retroreflection:ft,iridescence:ge,iridescenceMap:ee,iridescenceThicknessMap:ce,sheen:Rt,sheenColorMap:pe,sheenRoughnessMap:$,specularMap:J,specularColorMap:ue,specularIntensityMap:D,transmission:De,transmissionMap:Q,thicknessMap:K,gradientMap:de,opaque:_.transparent===!1&&_.blending===sr&&_.alphaToCoverage===!1,alphaMap:oe,alphaTest:he,alphaHash:Re,combine:_.combine,mapUv:Ie&&f(_.map.channel),aoMapUv:Gt&&f(_.aoMap.channel),lightMapUv:At&&f(_.lightMap.channel),bumpMapUv:ln&&f(_.bumpMap.channel),normalMapUv:xt&&f(_.normalMap.channel),displacementMapUv:Xn&&f(_.displacementMap.channel),emissiveMapUv:Bt&&f(_.emissiveMap.channel),metalnessMapUv:yn&&f(_.metalnessMap.channel),roughnessMapUv:vn&&f(_.roughnessMap.channel),anisotropyMapUv:Be&&f(_.anisotropyMap.channel),clearcoatMapUv:R&&f(_.clearcoatMap.channel),clearcoatNormalMapUv:S&&f(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:W&&f(_.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:ne&&f(_.diffuseRoughnessMap.channel),iridescenceMapUv:ee&&f(_.iridescenceMap.channel),iridescenceThicknessMapUv:ce&&f(_.iridescenceThicknessMap.channel),sheenColorMapUv:pe&&f(_.sheenColorMap.channel),sheenRoughnessMapUv:$&&f(_.sheenRoughnessMap.channel),specularMapUv:J&&f(_.specularMap.channel),specularColorMapUv:ue&&f(_.specularColorMap.channel),specularIntensityMapUv:D&&f(_.specularIntensityMap.channel),transmissionMapUv:Q&&f(_.transmissionMap.channel),thicknessMapUv:K&&f(_.thicknessMap.channel),alphaMapUv:oe&&f(_.alphaMap.channel),vertexTangents:!!I.attributes.tangent&&(xt||bn),vertexNormals:!!I.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!I.attributes.color&&I.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!I.attributes.uv&&(Ie||oe),fog:!!B,useFog:_.fog===!0,fogExp2:!!B&&B.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||I.attributes.normal===void 0&&xt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:re,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:I.attributes.position!==void 0,morphTargets:I.morphAttributes.position!==void 0,morphNormals:I.morphAttributes.normal!==void 0,morphColors:I.morphAttributes.color!==void 0,morphTargetsCount:Y,morphTextureStride:ie,numSunLights:b.sun.length,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numSunLightShadows:b.sunShadowMap.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:F.filter(xe=>xe.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:se,decodeVideoTexture:Ie&&_.map.isVideoTexture===!0&&Xe.getTransfer(_.map.colorSpace)===nt,decodeVideoTextureEmissive:Bt&&_.emissiveMap.isVideoTexture===!0&&Xe.getTransfer(_.emissiveMap.colorSpace)===nt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Dt,flipSided:_.side===Yt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Ve&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ve&&_.extensions.multiDraw===!0||Ke)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return He.vertexUv1s=c.has(1),He.vertexUv2s=c.has(2),He.vertexUv3s=c.has(3),c.clear(),He}function x(_){let b=[];if(_.shaderID?b.push(_.shaderID):(b.push(_.customVertexShaderID),b.push(_.customFragmentShaderID)),_.defines!==void 0)for(let L in _.defines)b.push(L),b.push(_.defines[L]);return _.isRawShaderMaterial===!1&&(m(b,_),p(b,_),b.push(i.outputColorSpace)),b.push(_.customProgramCacheKey),b.join()}function m(_,b){_.push(b.precision),_.push(b.outputColorSpace),_.push(b.envMapMode),_.push(b.envMapPMREM),_.push(b.envMapMaxLod),_.push(b.envMapSize),_.push(b.mapUv),_.push(b.alphaMapUv),_.push(b.lightMapUv),_.push(b.aoMapUv),_.push(b.bumpMapUv),_.push(b.normalMapUv),_.push(b.displacementMapUv),_.push(b.emissiveMapUv),_.push(b.metalnessMapUv),_.push(b.roughnessMapUv),_.push(b.anisotropyMapUv),_.push(b.clearcoatMapUv),_.push(b.clearcoatNormalMapUv),_.push(b.clearcoatRoughnessMapUv),_.push(b.diffuseRoughnessMapUv),_.push(b.iridescenceMapUv),_.push(b.iridescenceThicknessMapUv),_.push(b.sheenColorMapUv),_.push(b.sheenRoughnessMapUv),_.push(b.specularMapUv),_.push(b.specularColorMapUv),_.push(b.specularIntensityMapUv),_.push(b.transmissionMapUv),_.push(b.thicknessMapUv),_.push(b.combine),_.push(b.fogExp2),_.push(b.sizeAttenuation),_.push(b.morphTargetsCount),_.push(b.numSunLights),_.push(b.numDirLights),_.push(b.numPointLights),_.push(b.numSpotLights),_.push(b.numSpotLightMaps),_.push(b.numHemiLights),_.push(b.numRectAreaLights),_.push(b.numSunLightShadows),_.push(b.numDirLightShadows),_.push(b.numPointLightShadows),_.push(b.numSpotLightShadows),_.push(b.numSpotLightShadowsWithMaps),_.push(b.numLightProbes),_.push(b.numLightProbeGrids),_.push(b.shadowMapType),_.push(b.toneMapping),_.push(b.numClippingPlanes),_.push(b.numClipIntersection),_.push(b.depthPacking)}function p(_,b){a.disableAll(),b.instancing&&a.enable(0),b.instancingColor&&a.enable(1),b.instancingMorph&&a.enable(2),b.matcap&&a.enable(3),b.envMap&&a.enable(4),b.normalMapObjectSpace&&a.enable(5),b.normalMapTangentSpace&&a.enable(6),b.clearcoat&&a.enable(7),b.iridescence&&a.enable(8),b.alphaTest&&a.enable(9),b.vertexColors&&a.enable(10),b.vertexAlphas&&a.enable(11),b.vertexUv1s&&a.enable(12),b.vertexUv2s&&a.enable(13),b.vertexUv3s&&a.enable(14),b.vertexTangents&&a.enable(15),b.anisotropy&&a.enable(16),b.alphaHash&&a.enable(17),b.batching&&a.enable(18),b.dispersion&&a.enable(19),b.retroreflection&&a.enable(24),b.diffuseRoughness&&a.enable(25),b.batchingColor&&a.enable(20),b.gradientMap&&a.enable(21),b.packedNormalMap&&a.enable(22),b.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reversedDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),b.numLightProbeGrids>0&&a.enable(22),b.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function y(_){let b=d[_.type],L;if(b){let A=ii[b];L=hf.clone(A.uniforms)}else L=_.uniforms;return L}function M(_,b){let L=h.get(b);return L!==void 0?++L.usedTimes:(L=new yy(i,b,_,s),l.push(L),h.set(b,L)),L}function v(_){if(--_.usedTimes===0){let b=l.indexOf(_);l[b]=l[l.length-1],l.pop(),h.delete(_.cacheKey),_.destroy()}}function E(_){o.remove(_)}function T(){o.dispose()}return{getParameters:g,getProgramCacheKey:x,getUniforms:y,acquireProgram:M,releaseProgram:v,releaseShaderCache:E,programs:l,dispose:T}}function My(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function wy(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Pf(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function If(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function o(d,f,g,x,m,p){let y=i[e];return y===void 0?(y={id:d.id,object:d,geometry:f,material:g,materialVariant:a(d),groupOrder:x,renderOrder:d.renderOrder,z:m,group:p},i[e]=y):(y.id=d.id,y.object=d,y.geometry=f,y.material=g,y.materialVariant=a(d),y.groupOrder=x,y.renderOrder=d.renderOrder,y.z=m,y.group=p),e++,y}function c(d,f,g,x,m,p,y){y.reversedDepth===!0&&(m=-m);let M=o(d,f,g,x,m,p);g.transmission>0?n.push(M):g.transparent===!0?s.push(M):t.push(M)}function l(d,f,g,x,m,p){let y=o(d,f,g,x,m,p);g.transmission>0?n.unshift(y):g.transparent===!0?s.unshift(y):t.unshift(y)}function h(d,f){t.length>1&&t.sort(d||wy),n.length>1&&n.sort(f||Pf),s.length>1&&s.sort(f||Pf)}function u(){for(let d=e,f=i.length;d<f;d++){let g=i[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:u,sort:h}}function Ty(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new If,i.set(n,[a])):s>=r.length?(a=new If,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Ey(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new P,color:new Ce};break;case"SpotLight":t={position:new P,direction:new P,color:new Ce,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ce,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ce,groundColor:new Ce};break;case"RectAreaLight":t={color:new Ce,position:new P,halfWidth:new P,halfHeight:new P};break}return i[e.id]=t,t}}}function Ay(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Ry=0;function Cy(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Py(i){let e=new Ey,t=Ay(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new P);let s=new P,r=new ze,a=new ze;function o(l){let h=0,u=0,d=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let f=0,g=0,x=0,m=0,p=0,y=0,M=0,v=0,E=0,T=0,_=0,b=0,L=0,A=0;l.sort(Cy);for(let F=0,B=l.length;F<B;F++){let I=l[F],k=I.color,V=I.intensity,z=I.distance,j=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===Yi?j=I.shadow.map.texture:j=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=k.r*V,u+=k.g*V,d+=k.b*V;else if(I.isLightProbe){for(let C=0;C<9;C++)n.probe[C].addScaledVector(I.sh.coefficients[C],V);A++}else if(I.isSunLight){let C=e.get(I);if(C.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let H=I.shadow,Y=t.get(I);Y.shadowIntensity=H.intensity,Y.shadowBias=H.bias,Y.shadowNormalBias=H.normalBias,Y.shadowRadius=H.radius,Y.shadowMapSize.copy(H.mapSize).multiply(H.getFrameExtents()),n.sunShadow[g]=Y,n.sunShadowMap[g]=j;let ie=H.getViewportCount();for(let we=0;we<ie;we++)n.sunShadowMatrix[x+we]=H.getMatrix(we),n.sunShadowCascade[x+we]=H._cascadeData[we];x+=ie,g++}n.sun[f]=C,f++}else if(I.isDirectionalLight){let C=e.get(I);if(C.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let H=I.shadow,Y=t.get(I);Y.shadowIntensity=H.intensity,Y.shadowBias=H.bias,Y.shadowNormalBias=H.normalBias,Y.shadowRadius=H.radius,Y.shadowMapSize=H.mapSize,n.directionalShadow[m]=Y,n.directionalShadowMap[m]=j,n.directionalShadowMatrix[m]=I.shadow.matrix,E++}n.directional[m]=C,m++}else if(I.isSpotLight){let C=e.get(I);C.position.setFromMatrixPosition(I.matrixWorld),C.color.copy(k).multiplyScalar(V),C.distance=z,C.coneCos=Math.cos(I.angle),C.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),C.decay=I.decay,n.spot[y]=C;let H=I.shadow;if(I.map&&(n.spotLightMap[b]=I.map,b++,H.updateMatrices(I),I.castShadow&&L++),n.spotLightMatrix[y]=H.matrix,I.castShadow){let Y=t.get(I);Y.shadowIntensity=H.intensity,Y.shadowBias=H.bias,Y.shadowNormalBias=H.normalBias,Y.shadowRadius=H.radius,Y.shadowMapSize=H.mapSize,n.spotShadow[y]=Y,n.spotShadowMap[y]=j,_++}y++}else if(I.isRectAreaLight){let C=e.get(I);C.color.copy(k).multiplyScalar(V),C.halfWidth.set(I.width*.5,0,0),C.halfHeight.set(0,I.height*.5,0),n.rectArea[M]=C,M++}else if(I.isPointLight){let C=e.get(I);if(C.color.copy(I.color).multiplyScalar(I.intensity),C.distance=I.distance,C.decay=I.decay,I.castShadow){let H=I.shadow,Y=t.get(I);Y.shadowIntensity=H.intensity,Y.shadowBias=H.bias,Y.shadowNormalBias=H.normalBias,Y.shadowRadius=H.radius,Y.shadowMapSize=H.mapSize,Y.shadowCameraNear=H.camera.near,Y.shadowCameraFar=H.camera.far,n.pointShadow[p]=Y,n.pointShadowMap[p]=j,n.pointShadowMatrix[p]=I.shadow.matrix,T++}n.point[p]=C,p++}else if(I.isHemisphereLight){let C=e.get(I);C.skyColor.copy(I.color).multiplyScalar(V),C.groundColor.copy(I.groundColor).multiplyScalar(V),n.hemi[v]=C,v++}}M>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ye.LTC_FLOAT_1,n.rectAreaLTC2=ye.LTC_FLOAT_2):(n.rectAreaLTC1=ye.LTC_HALF_1,n.rectAreaLTC2=ye.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let N=n.hash;(N.sunLength!==f||N.directionalLength!==m||N.pointLength!==p||N.spotLength!==y||N.rectAreaLength!==M||N.hemiLength!==v||N.numSunShadows!==g||N.numDirectionalShadows!==E||N.numPointShadows!==T||N.numSpotShadows!==_||N.numSpotMaps!==b||N.numLightProbes!==A)&&(n.sun.length=f,n.directional.length=m,n.spot.length=y,n.rectArea.length=M,n.point.length=p,n.hemi.length=v,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=x,n.sunShadowCascade.length=x,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.directionalShadowMatrix.length=E,n.pointShadow.length=T,n.pointShadowMap.length=T,n.pointShadowMatrix.length=T,n.spotShadow.length=_,n.spotShadowMap.length=_,n.spotLightMatrix.length=_+b-L,n.spotLightMap.length=b,n.numSpotLightShadowsWithMaps=L,n.numLightProbes=A,N.sunLength=f,N.directionalLength=m,N.pointLength=p,N.spotLength=y,N.rectAreaLength=M,N.hemiLength=v,N.numSunShadows=g,N.numDirectionalShadows=E,N.numPointShadows=T,N.numSpotShadows=_,N.numSpotMaps=b,N.numLightProbes=A,n.version=Ry++)}function c(l,h){let u=0,d=0,f=0,g=0,x=0,m=0,p=h.matrixWorldInverse;for(let y=0,M=l.length;y<M;y++){let v=l[y];if(v.isSunLight){let E=n.sun[u];E.direction.setFromMatrixPosition(v.matrixWorld),E.direction.transformDirection(p),u++}else if(v.isDirectionalLight){let E=n.directional[d];E.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),d++}else if(v.isSpotLight){let E=n.spot[g];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),g++}else if(v.isRectAreaLight){let E=n.rectArea[x];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(p),a.identity(),r.copy(v.matrixWorld),r.premultiply(p),a.extractRotation(r),E.halfWidth.set(v.width*.5,0,0),E.halfHeight.set(0,v.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),x++}else if(v.isPointLight){let E=n.point[f];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(p),f++}else if(v.isHemisphereLight){let E=n.hemi[m];E.direction.setFromMatrixPosition(v.matrixWorld),E.direction.transformDirection(p),m++}}}return{setup:o,setupView:c,state:n}}function Lf(i){let e=new Py(i),t=[],n=[],s=[];function r(u){h.camera=u,t.length=0,n.length=0,s.length=0}function a(u){u.isLightProbeGrid?s.push(u):t.push(u)}function o(u){n.push(u)}function c(){e.setup(t),s.sort((u,d)=>u.priority-d.priority||u.id-d.id)}function l(u){e.setupView(t,u)}let h={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:c,setupLightsView:l,pushLight:a,pushShadow:o}}function Iy(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new Lf(i),e.set(s,[o])):r>=a.length?(o=new Lf(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Ly=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Dy=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Ny=[new P(1,0,0),new P(-1,0,0),new P(0,1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1)],Uy=[new P(0,-1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1),new P(0,-1,0),new P(0,-1,0)],Df=new ze,pa=new P,yh=new P;function Fy(i,e,t){let n=new zi,s=new _e,r=new _e,a=new rt,o=new Eo,c=new Ao,l={},h=t.maxTextureSize,u={[Qn]:Yt,[Yt]:Qn,[Dt]:Dt},d=new Mt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new _e},radius:{value:4}},vertexShader:Ly,fragmentShader:Dy}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new Qe;g.setAttribute("position",new Wt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Ne(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=sa;let p=this.type;this.render=function(T,_,b){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===Ad&&(Ae("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=sa);let L=i.getRenderTarget(),A=i.getActiveCubeFace(),N=i.getActiveMipmapLevel(),F=i.state;F.setBlending(Ai),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let B=p!==this.type;B&&_.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(k=>k.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,k=T.length;I<k;I++){let V=T[I],z=V.shadow;if(z===void 0){Ae("WebGLShadowMap:",V,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);let j=z.getFrameExtents();s.multiply(j),r.copy(z.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/j.x),s.x=r.x*j.x,z.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/j.y),s.y=r.y*j.y,z.mapSize.y=r.y));let C=i.state.buffers.depth.getReversed();if(z.camera._reversedDepth=C,z.map===null||B===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===ir){if(V.isPointLight){Ae("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new Qt(s.x,s.y,{format:Yi,type:Hn,minFilter:St,magFilter:St,generateMipmaps:!1}),z.map.texture.name=V.name+".shadowMap",z.map.depthTexture=new xi(s.x,s.y,_n),z.map.depthTexture.name=V.name+".shadowMapDepth",z.map.depthTexture.format=fi,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=bt,z.map.depthTexture.magFilter=bt}else V.isPointLight?(z.map=new ga(s.x),z.map.depthTexture=new Yr(s.x,zn)):(z.map=new Qt(s.x,s.y),z.map.depthTexture=new xi(s.x,s.y,zn)),z.map.depthTexture.name=V.name+".shadowMap",z.map.depthTexture.format=fi,this.type===sa?(z.map.depthTexture.compareFunction=C?rh:sh,z.map.depthTexture.minFilter=St,z.map.depthTexture.magFilter=St):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=bt,z.map.depthTexture.magFilter=bt);z.camera.updateProjectionMatrix()}z.map.isWebGLCubeRenderTarget!==!0&&(z.map.width!==s.x||z.map.height!==s.y)&&z.map.setSize(s.x,s.y);let H=z.map.isWebGLCubeRenderTarget?6:z.getViewportCount();V.isPointLight!==!0&&z.updateMatrices(V,b);let Y=(z.camera.layers.mask&4294967294)!==0?z.camera.layers:b.layers;for(let ie=0;ie<H;ie++){let we=z.getCamera(ie);if(V.isPointLight){let Z=z.camera,ae=z.matrix,le=V.distance||Z.far;le!==Z.far&&(Z.far=le,Z.updateProjectionMatrix()),pa.setFromMatrixPosition(V.matrixWorld),Z.position.copy(pa),yh.copy(Z.position),yh.add(Ny[ie]),Z.up.copy(Uy[ie]),Z.lookAt(yh),Z.updateMatrixWorld(),ae.makeTranslation(-pa.x,-pa.y,-pa.z),Df.multiplyMatrices(Z.projectionMatrix,Z.matrixWorldInverse),z._frustum.setFromProjectionMatrix(Df,Z.coordinateSystem,Z.reversedDepth)}if(z.map.isWebGLCubeRenderTarget)i.setRenderTarget(z.map,ie),i.clear();else{ie===0&&(i.setRenderTarget(z.map),i.clear());let Z=z.getViewport(ie);a.set(r.x*Z.x,r.y*Z.y,r.x*Z.z,r.y*Z.w),F.viewport(a)}n=z.getFrustum(ie),v(_,b,we,V,Y,this.type)}z.isPointLightShadow!==!0&&this.type===ir&&y(z,b),z.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(L,A,N)};function y(T,_){let b=e.update(x);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null?T.mapPass=new Qt(s.x,s.y,{format:Yi,type:Hn}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),d.uniforms.shadow_pass.value=T.map.depthTexture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(_,null,b,d,x,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value.set(T.map.width,T.map.height),f.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(_,null,b,f,x,null)}function M(T,_,b,L){let A=null,N=b.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(N!==void 0)A=N;else if(A=b.isPointLight===!0?c:o,i.localClippingEnabled&&_.clipShadows===!0&&Array.isArray(_.clippingPlanes)&&_.clippingPlanes.length!==0||_.displacementMap&&_.displacementScale!==0||_.alphaMap&&_.alphaTest>0||_.map&&_.alphaTest>0||_.alphaToCoverage===!0){let F=A.uuid,B=_.uuid,I=l[F];I===void 0&&(I={},l[F]=I);let k=I[B];k===void 0&&(k=A.clone(),I[B]=k,_.addEventListener("dispose",E)),A=k}if(A.visible=_.visible,A.wireframe=_.wireframe,L===ir?A.side=_.shadowSide!==null?_.shadowSide:_.side:A.side=_.shadowSide!==null?_.shadowSide:u[_.side],A.alphaMap=_.alphaMap,A.alphaTest=_.alphaToCoverage===!0?.5:_.alphaTest,A.map=_.map,A.clipShadows=_.clipShadows,A.clippingPlanes=_.clippingPlanes,A.clipIntersection=_.clipIntersection,A.displacementMap=_.displacementMap,A.displacementScale=_.displacementScale,A.displacementBias=_.displacementBias,A.wireframeLinewidth=_.wireframeLinewidth,A.linewidth=_.linewidth,b.isPointLight===!0&&A.isMeshDistanceMaterial===!0){let F=i.properties.get(A);F.light=b}return A}function v(T,_,b,L,A,N){if(T.visible===!1)return;if(T.layers.test(A)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&N===ir)&&(!T.frustumCulled||T.intersectsFrustum(n))){T.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,T.matrixWorld);let I=e.update(T),k=T.material;if(Array.isArray(k)){let V=I.groups;for(let z=0,j=V.length;z<j;z++){let C=V[z],H=k[C.materialIndex];if(H&&H.visible){let Y=M(T,H,L,N);T.onBeforeShadow(i,T,_,b,I,Y,C),i.renderBufferDirect(b,null,I,Y,T,C),T.onAfterShadow(i,T,_,b,I,Y,C)}}}else if(k.visible){let V=M(T,k,L,N);T.onBeforeShadow(i,T,_,b,I,V,null),i.renderBufferDirect(b,null,I,V,T,null),T.onAfterShadow(i,T,_,b,I,V,null)}}let B=T.children;for(let I=0,k=B.length;I<k;I++)v(B[I],_,b,L,A,N)}function E(T){T.target.removeEventListener("dispose",E);for(let b in l){let L=l[b],A=T.target.uuid;A in L&&(L[A].dispose(),delete L[A])}}}function Oy(i,e){function t(){let D=!1,Q=new rt,K=null,de=new rt(0,0,0,0);return{setMask:function(oe){K!==oe&&!D&&(i.colorMask(oe,oe,oe,oe),K=oe)},setLocked:function(oe){D=oe},setClear:function(oe,he,Re,Ve,se){se===!0&&(oe*=Ve,he*=Ve,Re*=Ve),Q.set(oe,he,Re,Ve),de.equals(Q)===!1&&(i.clearColor(oe,he,Re,Ve),de.copy(Q))},reset:function(){D=!1,K=null,de.set(-1,0,0,0)}}}function n(){let D=!1,Q=!1,K=null,de=null,oe=null;return{setReversed:function(he){if(Q!==he){let Re=e.get("EXT_clip_control");he?Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.ZERO_TO_ONE_EXT):Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.NEGATIVE_ONE_TO_ONE_EXT),Q=he;let Ve=oe;oe=null,this.setClear(Ve)}},getReversed:function(){return Q},setTest:function(he){he?re(i.DEPTH_TEST):Te(i.DEPTH_TEST)},setMask:function(he){K!==he&&!D&&(i.depthMask(he),K=he)},setFunc:function(he){if(Q&&(he=lf[he]),de!==he){switch(he){case io:i.depthFunc(i.NEVER);break;case so:i.depthFunc(i.ALWAYS);break;case ro:i.depthFunc(i.LESS);break;case zs:i.depthFunc(i.LEQUAL);break;case ao:i.depthFunc(i.EQUAL);break;case oo:i.depthFunc(i.GEQUAL);break;case lo:i.depthFunc(i.GREATER);break;case co:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}de=he}},setLocked:function(he){D=he},setClear:function(he){oe!==he&&(oe=he,Q&&(he=1-he),i.clearDepth(he))},reset:function(){D=!1,K=null,de=null,oe=null,Q=!1}}}function s(){let D=!1,Q=null,K=null,de=null,oe=null,he=null,Re=null,Ve=null,se=null;return{setTest:function(Le){D||(Le?re(i.STENCIL_TEST):Te(i.STENCIL_TEST))},setMask:function(Le){Q!==Le&&!D&&(i.stencilMask(Le),Q=Le)},setFunc:function(Le,He,xe){(K!==Le||de!==He||oe!==xe)&&(i.stencilFunc(Le,He,xe),K=Le,de=He,oe=xe)},setOp:function(Le,He,xe){(he!==Le||Re!==He||Ve!==xe)&&(i.stencilOp(Le,He,xe),he=Le,Re=He,Ve=xe)},setLocked:function(Le){D=Le},setClear:function(Le){se!==Le&&(i.clearStencil(Le),se=Le)},reset:function(){D=!1,Q=null,K=null,de=null,oe=null,he=null,Re=null,Ve=null,se=null}}}let r=new t,a=new n,o=new s,c={},l=new WeakMap,h={},u={},d={},f=new WeakMap,g=[],x=null,m=!1,p=null,y=null,M=null,v=null,E=null,T=null,_=null,b=new Ce(0,0,0),L=0,A=!1,N=null,F=null,B=null,I=null,k=null,V=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,j=0,C=i.getParameter(i.VERSION);C.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(C)[1]),z=j>=1):C.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(C)[1]),z=j>=2);let H=null,Y={},ie=i.getParameter(i.SCISSOR_BOX),we=i.getParameter(i.VIEWPORT),Z=new rt().fromArray(ie),ae=new rt().fromArray(we);function le(D,Q,K,de){let oe=new Uint8Array(4),he=i.createTexture();i.bindTexture(D,he),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Re=0;Re<K;Re++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(Q,0,i.RGBA,1,1,de,0,i.RGBA,i.UNSIGNED_BYTE,oe):i.texImage2D(Q+Re,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,oe);return he}let te={};te[i.TEXTURE_2D]=le(i.TEXTURE_2D,i.TEXTURE_2D,1),te[i.TEXTURE_CUBE_MAP]=le(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),te[i.TEXTURE_2D_ARRAY]=le(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),te[i.TEXTURE_3D]=le(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),re(i.DEPTH_TEST),a.setFunc(zs),ln(!1),xt(Bc),re(i.CULL_FACE),Gt(Ai);function re(D){h[D]!==!0&&(i.enable(D),h[D]=!0)}function Te(D){h[D]!==!1&&(i.disable(D),h[D]=!1)}function Ke(D,Q){return d[D]!==Q?(i.bindFramebuffer(D,Q),d[D]=Q,D===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=Q),D===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=Q),!0):!1}function Ie(D,Q){let K=g,de=!1;if(D){K=f.get(Q),K===void 0&&(K=[],f.set(Q,K));let oe=D.textures;if(K.length!==oe.length||K[0]!==i.COLOR_ATTACHMENT0){for(let he=0,Re=oe.length;he<Re;he++)K[he]=i.COLOR_ATTACHMENT0+he;K.length=oe.length,de=!0}}else K[0]!==i.BACK&&(K[0]=i.BACK,de=!0);de&&i.drawBuffers(K)}function je(D){return x!==D?(i.useProgram(D),x=D,!0):!1}let it={[_s]:i.FUNC_ADD,[Cd]:i.FUNC_SUBTRACT,[Pd]:i.FUNC_REVERSE_SUBTRACT};it[Id]=i.MIN,it[Ld]=i.MAX;let Ye={[Dd]:i.ZERO,[Nd]:i.ONE,[Ud]:i.SRC_COLOR,[Gc]:i.SRC_ALPHA,[Hd]:i.SRC_ALPHA_SATURATE,[kd]:i.DST_COLOR,[Od]:i.DST_ALPHA,[Fd]:i.ONE_MINUS_SRC_COLOR,[Vc]:i.ONE_MINUS_SRC_ALPHA,[zd]:i.ONE_MINUS_DST_COLOR,[Bd]:i.ONE_MINUS_DST_ALPHA,[Gd]:i.CONSTANT_COLOR,[Vd]:i.ONE_MINUS_CONSTANT_COLOR,[Wd]:i.CONSTANT_ALPHA,[Xd]:i.ONE_MINUS_CONSTANT_ALPHA};function Gt(D,Q,K,de,oe,he,Re,Ve,se,Le){if(D===Ai){m===!0&&(Te(i.BLEND),m=!1);return}if(m===!1&&(re(i.BLEND),m=!0),D!==Rd){if(D!==p||Le!==A){if((y!==_s||E!==_s)&&(i.blendEquation(i.FUNC_ADD),y=_s,E=_s),Le)switch(D){case sr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case kc:i.blendFunc(i.ONE,i.ONE);break;case zc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Hc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Fe("WebGLState: Invalid blending: ",D);break}else switch(D){case sr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case kc:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case zc:Fe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Hc:Fe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Fe("WebGLState: Invalid blending: ",D);break}M=null,v=null,T=null,_=null,b.set(0,0,0),L=0,p=D,A=Le}return}oe=oe||Q,he=he||K,Re=Re||de,(Q!==y||oe!==E)&&(i.blendEquationSeparate(it[Q],it[oe]),y=Q,E=oe),(K!==M||de!==v||he!==T||Re!==_)&&(i.blendFuncSeparate(Ye[K],Ye[de],Ye[he],Ye[Re]),M=K,v=de,T=he,_=Re),(Ve.equals(b)===!1||se!==L)&&(i.blendColor(Ve.r,Ve.g,Ve.b,se),b.copy(Ve),L=se),p=D,A=!1}function At(D,Q){D.side===Dt?Te(i.CULL_FACE):re(i.CULL_FACE);let K=D.side===Yt;Q&&(K=!K),ln(K),D.blending===sr&&D.transparent===!1?Gt(Ai):Gt(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);let de=D.stencilWrite;o.setTest(de),de&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Bt(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?re(i.SAMPLE_ALPHA_TO_COVERAGE):Te(i.SAMPLE_ALPHA_TO_COVERAGE)}function ln(D){N!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),N=D)}function xt(D){D!==Td?(re(i.CULL_FACE),D!==F&&(D===Bc?i.cullFace(i.BACK):D===Ed?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Te(i.CULL_FACE),F=D}function Xn(D){D!==B&&(z&&i.lineWidth(D),B=D)}function Bt(D,Q,K){D?(re(i.POLYGON_OFFSET_FILL),(I!==Q||k!==K)&&(I=Q,k=K,a.getReversed()&&(Q=-Q,K=-K),i.polygonOffset(Q,K))):Te(i.POLYGON_OFFSET_FILL)}function yn(D){D?re(i.SCISSOR_TEST):Te(i.SCISSOR_TEST)}function vn(D){D===void 0&&(D=i.TEXTURE0+V-1),H!==D&&(i.activeTexture(D),H=D)}function bn(D,Q,K){K===void 0&&(H===null?K=i.TEXTURE0+V-1:K=H);let de=Y[K];de===void 0&&(de={type:void 0,texture:void 0},Y[K]=de),(de.type!==D||de.texture!==Q)&&(H!==K&&(i.activeTexture(K),H=K),i.bindTexture(D,Q||te[D]),de.type=D,de.texture=Q)}function O(){let D=Y[H];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function Sn(){try{i.compressedTexImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function dt(){try{i.compressedTexImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function ft(){try{i.texSubImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function ge(){try{i.texSubImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function Rt(){try{i.compressedTexSubImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function De(){try{i.compressedTexSubImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function Be(){try{i.texStorage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function R(){try{i.texStorage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function S(){try{i.texImage2D(...arguments)}catch(D){Fe("WebGLState:",D)}}function W(){try{i.texImage3D(...arguments)}catch(D){Fe("WebGLState:",D)}}function ne(D){return u[D]!==void 0?u[D]:i.getParameter(D)}function ee(D,Q){u[D]!==Q&&(i.pixelStorei(D,Q),u[D]=Q)}function ce(D){Z.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),Z.copy(D))}function pe(D){ae.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),ae.copy(D))}function $(D,Q){let K=l.get(Q);K===void 0&&(K=new WeakMap,l.set(Q,K));let de=K.get(D);de===void 0&&(de=i.getUniformBlockIndex(Q,D.name),i.uniformBlockBinding(Q,de,de),K.set(D,de))}function J(D,Q,K){let oe=l.get(Q).get(D);c[oe]!==K&&(i.bindBufferBase(i.UNIFORM_BUFFER,oe,K),c[oe]=K)}function ue(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},u={},H=null,Y={},d={},c={},f=new WeakMap,g=[],x=null,m=!1,p=null,y=null,M=null,v=null,E=null,T=null,_=null,b=new Ce(0,0,0),L=0,A=!1,N=null,F=null,B=null,I=null,k=null,Z.set(0,0,i.canvas.width,i.canvas.height),ae.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:re,disable:Te,bindFramebuffer:Ke,drawBuffers:Ie,useProgram:je,setBlending:Gt,setMaterial:At,setFlipSided:ln,setCullFace:xt,setLineWidth:Xn,setPolygonOffset:Bt,setScissorTest:yn,activeTexture:vn,bindTexture:bn,unbindTexture:O,compressedTexImage2D:Sn,compressedTexImage3D:dt,texImage2D:S,texImage3D:W,pixelStorei:ee,getParameter:ne,updateUBOMapping:$,uniformBlockBinding:J,texStorage2D:Be,texStorage3D:R,texSubImage2D:ft,texSubImage3D:ge,compressedTexSubImage2D:Rt,compressedTexSubImage3D:De,scissor:ce,viewport:pe,reset:ue}}function By(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new _e,h=new WeakMap,u=new Set,d,f=new WeakMap,g=new Set,x=new FinalizationRegistry(R=>g.delete(R)),m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function p(R,S){return m?new OffscreenCanvas(R,S):Vs("canvas")}function y(R,S,W){let ne=1,ee=Be(R);if((ee.width>W||ee.height>W)&&(ne=W/Math.max(ee.width,ee.height)),ne<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let ce=Math.floor(ne*ee.width),pe=Math.floor(ne*ee.height);d===void 0&&(d=p(ce,pe));let $=S?p(ce,pe):d;return $.width=ce,$.height=pe,$.getContext("2d").drawImage(R,0,0,ce,pe),Ae("WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+ce+"x"+pe+")."),$}else return"data"in R&&Ae("WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),R;return R}function M(R){return R.generateMipmaps}function v(R){i.generateMipmap(R)}function E(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function T(R,S,W,ne,ee,ce=!1){if(R!==null){if(i[R]!==void 0)return i[R];Ae("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let pe;ne&&(pe=e.get("EXT_texture_norm16"),pe||Ae("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let $=S;if(S===i.RED&&(W===i.FLOAT&&($=i.R32F),W===i.HALF_FLOAT&&($=i.R16F),W===i.UNSIGNED_BYTE&&($=i.R8),W===i.UNSIGNED_SHORT&&pe&&($=pe.R16_EXT),W===i.SHORT&&pe&&($=pe.R16_SNORM_EXT)),S===i.RED_INTEGER&&(W===i.UNSIGNED_BYTE&&($=i.R8UI),W===i.UNSIGNED_SHORT&&($=i.R16UI),W===i.UNSIGNED_INT&&($=i.R32UI),W===i.BYTE&&($=i.R8I),W===i.SHORT&&($=i.R16I),W===i.INT&&($=i.R32I)),S===i.RG&&(W===i.FLOAT&&($=i.RG32F),W===i.HALF_FLOAT&&($=i.RG16F),W===i.UNSIGNED_BYTE&&($=i.RG8),W===i.UNSIGNED_SHORT&&pe&&($=pe.RG16_EXT),W===i.SHORT&&pe&&($=pe.RG16_SNORM_EXT)),S===i.RG_INTEGER&&(W===i.UNSIGNED_BYTE&&($=i.RG8UI),W===i.UNSIGNED_SHORT&&($=i.RG16UI),W===i.UNSIGNED_INT&&($=i.RG32UI),W===i.BYTE&&($=i.RG8I),W===i.SHORT&&($=i.RG16I),W===i.INT&&($=i.RG32I)),S===i.RGB_INTEGER&&(W===i.UNSIGNED_BYTE&&($=i.RGB8UI),W===i.UNSIGNED_SHORT&&($=i.RGB16UI),W===i.UNSIGNED_INT&&($=i.RGB32UI),W===i.BYTE&&($=i.RGB8I),W===i.SHORT&&($=i.RGB16I),W===i.INT&&($=i.RGB32I)),S===i.RGBA_INTEGER&&(W===i.UNSIGNED_BYTE&&($=i.RGBA8UI),W===i.UNSIGNED_SHORT&&($=i.RGBA16UI),W===i.UNSIGNED_INT&&($=i.RGBA32UI),W===i.BYTE&&($=i.RGBA8I),W===i.SHORT&&($=i.RGBA16I),W===i.INT&&($=i.RGBA32I)),S===i.RGB&&(W===i.UNSIGNED_SHORT&&pe&&($=pe.RGB16_EXT),W===i.SHORT&&pe&&($=pe.RGB16_SNORM_EXT),W===i.UNSIGNED_INT_5_9_9_9_REV&&($=i.RGB9_E5),W===i.UNSIGNED_INT_10F_11F_11F_REV&&($=i.R11F_G11F_B10F)),S===i.RGBA){let J=ce?Fr:Xe.getTransfer(ee);W===i.FLOAT&&($=i.RGBA32F),W===i.HALF_FLOAT&&($=i.RGBA16F),W===i.UNSIGNED_BYTE&&($=J===nt?i.SRGB8_ALPHA8:i.RGBA8),W===i.UNSIGNED_SHORT&&pe&&($=pe.RGBA16_EXT),W===i.SHORT&&pe&&($=pe.RGBA16_SNORM_EXT),W===i.UNSIGNED_SHORT_4_4_4_4&&($=i.RGBA4),W===i.UNSIGNED_SHORT_5_5_5_1&&($=i.RGB5_A1)}return($===i.R16F||$===i.R32F||$===i.RG16F||$===i.RG32F||$===i.RGBA16F||$===i.RGBA32F)&&e.get("EXT_color_buffer_float"),$}function _(R,S){let W;return R?S===null||S===zn||S===vs?W=i.DEPTH24_STENCIL8:S===_n?W=i.DEPTH32F_STENCIL8:S===or&&(W=i.DEPTH24_STENCIL8,Ae("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===zn||S===vs?W=i.DEPTH_COMPONENT24:S===_n?W=i.DEPTH_COMPONENT32F:S===or&&(W=i.DEPTH_COMPONENT16),W}function b(R,S){return M(R)===!0||R.isFramebufferTexture&&R.minFilter!==bt&&R.minFilter!==St?Math.log2(Math.max(S.width,S.height))+1:R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?S.mipmaps.length:1}function L(R){let S=new WeakRef(R);n.get(R).__ref=S,g.add(S),x.register(R,S,S)}function A(R){let S=n.get(R).__ref;S!==void 0&&(g.delete(S),x.unregister(S))}function N(R){B(R.target)}function F(R){I(R.target)}function B(R){R.removeEventListener("dispose",N),A(R),V(R),R.isVideoTexture&&h.delete(R),R.isHTMLTexture&&u.delete(R)}function I(R){R.removeEventListener("dispose",F),A(R),j(R)}function k(){for(let R of g){let S=R.deref();S!==void 0&&(S.isRenderTarget===!0?I(S):B(S))}g.clear(),u.clear()}function V(R){let S=n.get(R);if(S.__webglInit===void 0)return;let W=R.source,ne=f.get(W);if(ne){let ee=ne[S.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&z(R),Object.keys(ne).length===0&&f.delete(W)}n.remove(R)}function z(R){let S=n.get(R);i.deleteTexture(S.__webglTexture);let W=R.source,ne=f.get(W);delete ne[S.__cacheKey],a.memory.textures--}function j(R){let S=n.get(R);S.__depthDisposeCallback&&S.__depthDisposeCallback();let W=R.depthTexture;if(W&&W.renderTarget===R&&B(W),R.isWebGLCubeRenderTarget)for(let ee=0;ee<6;ee++){if(Array.isArray(S.__webglFramebuffer[ee]))for(let ce=0;ce<S.__webglFramebuffer[ee].length;ce++)i.deleteFramebuffer(S.__webglFramebuffer[ee][ce]);else i.deleteFramebuffer(S.__webglFramebuffer[ee]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[ee])}else{if(Array.isArray(S.__webglFramebuffer))for(let ee=0;ee<S.__webglFramebuffer.length;ee++)i.deleteFramebuffer(S.__webglFramebuffer[ee]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let ee=0;ee<S.__webglColorRenderbuffer.length;ee++)S.__webglColorRenderbuffer[ee]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[ee]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}let ne=R.textures;for(let ee=0,ce=ne.length;ee<ce;ee++){let pe=n.get(ne[ee]);pe.__webglTexture&&(i.deleteTexture(pe.__webglTexture),a.memory.textures--),n.remove(ne[ee])}n.remove(R)}let C=0;function H(){C=0}function Y(){return C}function ie(R){C=R}function we(){let R=C;return R>=s.maxTextures&&Ae("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+s.maxTextures),C+=1,R}function Z(R){let S=[];return S.push(R.wrapS),S.push(R.wrapT),S.push(R.wrapR||0),S.push(R.magFilter),S.push(R.minFilter),S.push(R.anisotropy),S.push(R.internalFormat),S.push(R.format),S.push(R.type),S.push(R.generateMipmaps),S.push(R.mipmapsAutoUpdate),S.push(R.premultiplyAlpha),S.push(R.flipY),S.push(R.unpackAlignment),S.push(R.colorSpace),S.join()}function ae(R,S){let W=n.get(R);if(R.isVideoTexture&&Rt(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&W.__version!==R.version){let ne=R.image;if(ne===null)Ae("WebGLRenderer: Texture marked for update but no image data found.");else if(ne.complete===!1)Ae("WebGLRenderer: Texture marked for update but image is incomplete");else{At(W,R,S);return}}else R.isExternalTexture&&(W.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,W.__webglTexture,i.TEXTURE0+S)}function le(R,S){let W=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&W.__version!==R.version){At(W,R,S);return}else R.isExternalTexture&&(W.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,W.__webglTexture,i.TEXTURE0+S)}function te(R,S){let W=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&W.__version!==R.version){At(W,R,S);return}t.bindTexture(i.TEXTURE_3D,W.__webglTexture,i.TEXTURE0+S)}function re(R,S){let W=n.get(R);if(R.version>0&&W.__version!==R.version){ln(W,R,S);return}t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture,i.TEXTURE0+S)}let Te={[ki]:i.REPEAT,[wn]:i.CLAMP_TO_EDGE,[Hs]:i.MIRRORED_REPEAT},Ke={[bt]:i.NEAREST,[ko]:i.NEAREST_MIPMAP_NEAREST,[ys]:i.NEAREST_MIPMAP_LINEAR,[St]:i.LINEAR,[ar]:i.LINEAR_MIPMAP_NEAREST,[An]:i.LINEAR_MIPMAP_LINEAR},Ie={[Qd]:i.NEVER,[ah]:i.ALWAYS,[ef]:i.LESS,[sh]:i.LEQUAL,[tf]:i.EQUAL,[rh]:i.GEQUAL,[nf]:i.GREATER,[sf]:i.NOTEQUAL};function je(R,S){if(S.type===_n&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===St||S.magFilter===ar||S.magFilter===ys||S.magFilter===An||S.minFilter===St||S.minFilter===ar||S.minFilter===ys||S.minFilter===An)&&Ae("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,Te[S.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,Te[S.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,Te[S.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,Ke[S.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,Ke[S.minFilter]),S.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,Ie[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===bt||S.minFilter!==ys&&S.minFilter!==An||S.type===_n&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){let W=e.get("EXT_texture_filter_anisotropic");i.texParameterf(R,W.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function it(R,S){let W=!1;R.__webglInit===void 0&&(R.__webglInit=!0,S.addEventListener("dispose",N),L(S));let ne=S.source,ee=f.get(ne);ee===void 0&&(ee={},f.set(ne,ee));let ce=Z(S);if(ce!==R.__cacheKey){ee[ce]===void 0&&(ee[ce]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,W=!0),ee[ce].usedTimes++;let pe=ee[R.__cacheKey];pe!==void 0&&(ee[R.__cacheKey].usedTimes--,pe.usedTimes===0&&z(S)),R.__cacheKey=ce,R.__webglTexture=ee[ce].texture}return W}function Ye(R,S,W){return Math.floor(Math.floor(R/W)/S)}function Gt(R,S,W,ne){let ce=R.updateRanges;if(ce.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,S.width,S.height,W,ne,S.data);else{ce.sort((D,Q)=>D.start-Q.start);let pe=0;for(let D=1;D<ce.length;D++){let Q=ce[pe],K=ce[D],de=Q.start+Q.count,oe=Ye(K.start,S.width,4),he=Ye(Q.start,S.width,4);K.start<=de+1&&oe===he&&Ye(K.start+K.count-1,S.width,4)===oe?Q.count=Math.max(Q.count,K.start+K.count-Q.start):(++pe,ce[pe]=K)}ce.length=pe+1;let $=t.getParameter(i.UNPACK_ROW_LENGTH),J=t.getParameter(i.UNPACK_SKIP_PIXELS),ue=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,S.width);for(let D=0,Q=ce.length;D<Q;D++){let K=ce[D],de=Math.floor(K.start/4),oe=Math.ceil(K.count/4),he=de%S.width,Re=Math.floor(de/S.width),Ve=oe,se=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,he),t.pixelStorei(i.UNPACK_SKIP_ROWS,Re),t.texSubImage2D(i.TEXTURE_2D,0,he,Re,Ve,se,W,ne,S.data)}R.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,$),t.pixelStorei(i.UNPACK_SKIP_PIXELS,J),t.pixelStorei(i.UNPACK_SKIP_ROWS,ue)}}function At(R,S,W){let ne=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(ne=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(ne=i.TEXTURE_3D);let ee=it(R,S),ce=S.source;t.bindTexture(ne,R.__webglTexture,i.TEXTURE0+W);let pe=n.get(ce);if(ce.version!==pe.__version||ee===!0){if(t.activeTexture(i.TEXTURE0+W),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){let se=Xe.getPrimaries(Xe.workingColorSpace),Le=S.colorSpace===Gn?null:Xe.getPrimaries(S.colorSpace),He=S.colorSpace===Gn||se===Le?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,He)}t.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment);let J=y(S.image,!1,s.maxTextureSize);J=De(S,J);let ue=r.convert(S.format,S.colorSpace),D=r.convert(S.type),Q=T(S.internalFormat,ue,D,S.normalized,S.colorSpace,S.isVideoTexture);je(ne,S);let K,de=S.mipmaps,oe=S.isVideoTexture!==!0,he=pe.__version===void 0||ee===!0,Re=ce.dataReady,Ve=b(S,J);if(S.isDepthTexture)Q=_(S.format===Ri,S.type),he&&(oe?t.texStorage2D(i.TEXTURE_2D,1,Q,J.width,J.height):t.texImage2D(i.TEXTURE_2D,0,Q,J.width,J.height,0,ue,D,null));else if(S.isDataTexture)if(de.length>0){oe&&he&&t.texStorage2D(i.TEXTURE_2D,Ve,Q,de[0].width,de[0].height);for(let se=0,Le=de.length;se<Le;se++)K=de[se],oe?Re&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,K.width,K.height,ue,D,K.data):t.texImage2D(i.TEXTURE_2D,se,Q,K.width,K.height,0,ue,D,K.data);S.generateMipmaps=!1}else oe?(he&&t.texStorage2D(i.TEXTURE_2D,Ve,Q,J.width,J.height),Re&&Gt(S,J,ue,D)):t.texImage2D(i.TEXTURE_2D,0,Q,J.width,J.height,0,ue,D,J.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){oe&&he&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ve,Q,de[0].width,de[0].height,J.depth);for(let se=0,Le=de.length;se<Le;se++)if(K=de[se],S.format!==Rn)if(ue!==null)if(oe){if(Re)if(S.layerUpdates.size>0){let He=_h(K.width,K.height,S.format,S.type);for(let xe of S.layerUpdates){let st=K.data.subarray(xe*He/K.data.BYTES_PER_ELEMENT,(xe+1)*He/K.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,xe,K.width,K.height,1,ue,st)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,K.width,K.height,J.depth,ue,K.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,se,Q,K.width,K.height,J.depth,0,K.data,0,0);else Ae("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else oe?Re&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,K.width,K.height,J.depth,ue,D,K.data):t.texImage3D(i.TEXTURE_2D_ARRAY,se,Q,K.width,K.height,J.depth,0,ue,D,K.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{oe&&he&&t.texStorage2D(i.TEXTURE_2D,Ve,Q,de[0].width,de[0].height);for(let se=0,Le=de.length;se<Le;se++)K=de[se],S.format!==Rn?ue!==null?oe?Re&&t.compressedTexSubImage2D(i.TEXTURE_2D,se,0,0,K.width,K.height,ue,K.data):t.compressedTexImage2D(i.TEXTURE_2D,se,Q,K.width,K.height,0,K.data):Ae("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):oe?Re&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,K.width,K.height,ue,D,K.data):t.texImage2D(i.TEXTURE_2D,se,Q,K.width,K.height,0,ue,D,K.data)}else if(S.isDataArrayTexture)if(oe){if(he&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ve,Q,J.width,J.height,J.depth),Re)if(S.layerUpdates.size>0){let se=_h(J.width,J.height,S.format,S.type);for(let Le of S.layerUpdates){let He=J.data.subarray(Le*se/J.data.BYTES_PER_ELEMENT,(Le+1)*se/J.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Le,J.width,J.height,1,ue,D,He)}S.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,ue,D,J.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Q,J.width,J.height,J.depth,0,ue,D,J.data);else if(S.isData3DTexture)oe?(he&&t.texStorage3D(i.TEXTURE_3D,Ve,Q,J.width,J.height,J.depth),Re&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,ue,D,J.data)):t.texImage3D(i.TEXTURE_3D,0,Q,J.width,J.height,J.depth,0,ue,D,J.data);else if(S.isFramebufferTexture){if(he)if(oe)t.texStorage2D(i.TEXTURE_2D,Ve,Q,J.width,J.height);else{let se=J.width,Le=J.height;for(let He=0;He<Ve;He++)t.texImage2D(i.TEXTURE_2D,He,Q,se,Le,0,ue,D,null),se>>=1,Le>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in i){let se=i.canvas;if(se.hasAttribute("layoutsubtree")||se.setAttribute("layoutsubtree","true"),J.parentNode!==se){se.appendChild(J),u.add(S),se.onpaint=Le=>{let He=Le.changedElements;for(let xe of u)He.includes(xe.image)&&(xe.needsUpdate=!0)},se.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,J);else{let He=i.RGBA,xe=i.RGBA,st=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,He,xe,st,J)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(de.length>0){if(oe&&he){let se=Be(de[0]);t.texStorage2D(i.TEXTURE_2D,Ve,Q,se.width,se.height)}for(let se=0,Le=de.length;se<Le;se++)K=de[se],oe?Re&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,ue,D,K):t.texImage2D(i.TEXTURE_2D,se,Q,ue,D,K);S.generateMipmaps=!1}else if(oe){if(he){let se=Be(J);t.texStorage2D(i.TEXTURE_2D,Ve,Q,se.width,se.height)}Re&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ue,D,J)}else t.texImage2D(i.TEXTURE_2D,0,Q,ue,D,J);M(S)&&S.mipmapsAutoUpdate===!0&&v(ne),pe.__version=ce.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function ln(R,S,W){if(S.image.length!==6)return;let ne=it(R,S),ee=S.source;t.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+W);let ce=n.get(ee);if(ee.version!==ce.__version||ne===!0){t.activeTexture(i.TEXTURE0+W);let pe=Xe.getPrimaries(Xe.workingColorSpace),$=S.colorSpace===Gn?null:Xe.getPrimaries(S.colorSpace),J=S.colorSpace===Gn||pe===$?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,J);let ue=S.isCompressedTexture||S.image[0].isCompressedTexture,D=S.image[0]&&S.image[0].isDataTexture,Q=[];for(let xe=0;xe<6;xe++)!ue&&!D?Q[xe]=y(S.image[xe],!0,s.maxCubemapSize):Q[xe]=D?S.image[xe].image:S.image[xe],Q[xe]=De(S,Q[xe]);let K=Q[0],de=r.convert(S.format,S.colorSpace),oe=r.convert(S.type),he=T(S.internalFormat,de,oe,S.normalized,S.colorSpace),Re=S.isVideoTexture!==!0,Ve=ce.__version===void 0||ne===!0,se=ee.dataReady,Le=b(S,K);je(i.TEXTURE_CUBE_MAP,S);let He;if(S.isDepthTexture){if(he=_(S.format===Ri,S.type),Ve)if(Re)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,he,K.width,K.height);else for(let xe=0;xe<6;xe++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,he,K.width,K.height,0,de,oe,null)}else if(ue){Re&&Ve&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Le,he,K.width,K.height);for(let xe=0;xe<6;xe++){He=Q[xe].mipmaps;for(let st=0;st<He.length;st++){let kt=He[st];S.format!==Rn?de!==null?Re?se&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,st,0,0,kt.width,kt.height,de,kt.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,st,he,kt.width,kt.height,0,kt.data):Ae("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Re?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,st,0,0,kt.width,kt.height,de,oe,kt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,st,he,kt.width,kt.height,0,de,oe,kt.data)}}}else{if(He=S.mipmaps,Re&&Ve){He.length>0&&Le++;let xe=Be(Q[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Le,he,xe.width,xe.height)}for(let xe=0;xe<6;xe++)if(D){Re?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,0,0,Q[xe].width,Q[xe].height,de,oe,Q[xe].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,he,Q[xe].width,Q[xe].height,0,de,oe,Q[xe].data);for(let st=0;st<He.length;st++){let Ci=He[st].image[xe].image;Re?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,st+1,0,0,Ci.width,Ci.height,de,oe,Ci.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,st+1,he,Ci.width,Ci.height,0,de,oe,Ci.data)}}else{Re?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,0,0,de,oe,Q[xe]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,he,de,oe,Q[xe]);for(let st=0;st<He.length;st++){let kt=He[st];Re?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,st+1,0,0,de,oe,kt.image[xe]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,st+1,he,de,oe,kt.image[xe])}}}M(S)&&S.mipmapsAutoUpdate===!0&&v(i.TEXTURE_CUBE_MAP),ce.__version=ee.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function xt(R,S,W,ne,ee,ce){let pe=r.convert(W.format,W.colorSpace),$=r.convert(W.type),J=T(W.internalFormat,pe,$,W.normalized,W.colorSpace),ue=n.get(S),D=n.get(W);if(D.__renderTarget=S,!ue.__hasExternalTextures){let Q=Math.max(1,S.width>>ce),K=Math.max(1,S.height>>ce);ee===i.TEXTURE_3D||ee===i.TEXTURE_2D_ARRAY?t.texImage3D(ee,ce,J,Q,K,S.depth,0,pe,$,null):t.texImage2D(ee,ce,J,Q,K,0,pe,$,null)}t.bindFramebuffer(i.FRAMEBUFFER,R),ge(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,ee,D.__webglTexture,0,ft(S)):(ee===i.TEXTURE_2D||ee>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,ne,ee,D.__webglTexture,ce),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Xn(R,S,W){if(i.bindRenderbuffer(i.RENDERBUFFER,R),S.depthBuffer){let ne=S.depthTexture,ee=ne&&ne.isDepthTexture?ne.type:null,ce=_(S.stencilBuffer,ee),pe=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;ge(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft(S),ce,S.width,S.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft(S),ce,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,ce,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,pe,i.RENDERBUFFER,R)}else{let ne=S.textures;for(let ee=0;ee<ne.length;ee++){let ce=ne[ee],pe=r.convert(ce.format,ce.colorSpace),$=r.convert(ce.type),J=T(ce.internalFormat,pe,$,ce.normalized,ce.colorSpace);ge(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft(S),J,S.width,S.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft(S),J,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,J,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Bt(R,S,W){let ne=S.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,R),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ee=n.get(S.depthTexture);ee.__renderTarget=S;let ce=ne?S.depthTexture.image[0]:S.depthTexture.image;(!ee.__webglTexture||ce.width!==S.width||ce.height!==S.height)&&(ce.width=S.width,ce.height=S.height,S.depthTexture.needsUpdate=!0),ne?re(S.depthTexture,0):ae(S.depthTexture,0);let pe=ee.__webglTexture,$=ft(S),J=ne?i.TEXTURE_CUBE_MAP_POSITIVE_X+W:i.TEXTURE_2D,ue=S.depthTexture.format===Ri?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(S.depthTexture.format===fi)ge(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ue,J,pe,0,$):i.framebufferTexture2D(i.FRAMEBUFFER,ue,J,pe,0);else if(S.depthTexture.format===Ri)ge(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ue,J,pe,0,$):i.framebufferTexture2D(i.FRAMEBUFFER,ue,J,pe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function yn(R){let S=n.get(R),W=R.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==R.depthTexture){let ne=R.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),ne){let ee=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,ne.removeEventListener("dispose",ee)};ne.addEventListener("dispose",ee),S.__depthDisposeCallback=ee}S.__boundDepthTexture=ne}if(R.depthTexture&&!S.__autoAllocateDepthBuffer)if(W)for(let ne=0;ne<6;ne++)Bt(S.__webglFramebuffer[ne],R,ne);else R.texture.mipmaps.length>0?Bt(S.__webglFramebuffer[0],R,0):Bt(S.__webglFramebuffer,R,0);else if(W){S.__webglDepthbuffer=[];for(let ne=0;ne<6;ne++)if(t.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[ne]),S.__webglDepthbuffer[ne]===void 0)S.__webglDepthbuffer[ne]=i.createRenderbuffer(),Xn(S.__webglDepthbuffer[ne],R,!1);else{let ee=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=S.__webglDepthbuffer[ne];i.bindRenderbuffer(i.RENDERBUFFER,ce),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,ce)}}else if(R.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),Xn(S.__webglDepthbuffer,R,!1);else{let ee=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ce),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,ce)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function vn(R,S,W){let ne=n.get(R);S!==void 0&&xt(ne.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),W!==void 0&&yn(R)}function bn(R){let S=R.texture,W=n.get(R),ne=n.get(S);R.addEventListener("dispose",F),L(R);let ee=R.textures,ce=R.isWebGLCubeRenderTarget===!0,pe=ee.length>1;if(pe||(ne.__webglTexture===void 0&&(ne.__webglTexture=i.createTexture()),ne.__version=S.version,a.memory.textures++),ce){W.__webglFramebuffer=[];for(let $=0;$<6;$++)if(S.mipmaps.length>0){W.__webglFramebuffer[$]=[];for(let J=0;J<S.mipmaps.length;J++)W.__webglFramebuffer[$][J]=i.createFramebuffer()}else W.__webglFramebuffer[$]=i.createFramebuffer()}else{if(S.mipmaps.length>0){W.__webglFramebuffer=[];for(let $=0;$<S.mipmaps.length;$++)W.__webglFramebuffer[$]=i.createFramebuffer()}else W.__webglFramebuffer=i.createFramebuffer();if(pe)for(let $=0,J=ee.length;$<J;$++){let ue=n.get(ee[$]);ue.__webglTexture===void 0&&(ue.__webglTexture=i.createTexture(),a.memory.textures++)}if(R.samples>0&&ge(R)===!1){W.__webglMultisampledFramebuffer=i.createFramebuffer(),W.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,W.__webglMultisampledFramebuffer);for(let $=0;$<ee.length;$++){let J=ee[$];W.__webglColorRenderbuffer[$]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,W.__webglColorRenderbuffer[$]);let ue=r.convert(J.format,J.colorSpace),D=r.convert(J.type),Q=T(J.internalFormat,ue,D,J.normalized,J.colorSpace,R.isXRRenderTarget===!0),K=ft(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,K,Q,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+$,i.RENDERBUFFER,W.__webglColorRenderbuffer[$])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(W.__webglDepthRenderbuffer=i.createRenderbuffer(),Xn(W.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ce){t.bindTexture(i.TEXTURE_CUBE_MAP,ne.__webglTexture),je(i.TEXTURE_CUBE_MAP,S);for(let $=0;$<6;$++)if(S.mipmaps.length>0)for(let J=0;J<S.mipmaps.length;J++)xt(W.__webglFramebuffer[$][J],R,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+$,J);else xt(W.__webglFramebuffer[$],R,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0);M(S)?v(i.TEXTURE_CUBE_MAP):S.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),t.unbindTexture()}else if(pe){for(let $=0,J=ee.length;$<J;$++){let ue=ee[$],D=n.get(ue),Q=i.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Q=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Q,D.__webglTexture),je(Q,ue),xt(W.__webglFramebuffer,R,ue,i.COLOR_ATTACHMENT0+$,Q,0),M(ue)&&v(Q)}t.unbindTexture()}else{let $=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&($=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture($,ne.__webglTexture),je($,S),S.mipmaps.length>0)for(let J=0;J<S.mipmaps.length;J++)xt(W.__webglFramebuffer[J],R,S,i.COLOR_ATTACHMENT0,$,J);else xt(W.__webglFramebuffer,R,S,i.COLOR_ATTACHMENT0,$,0);M(S)?v($):S.mipmaps.length>0&&i.texParameteri($,i.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),t.unbindTexture()}R.depthBuffer&&yn(R)}function O(R){let S=R.textures;for(let W=0,ne=S.length;W<ne;W++){let ee=S[W];if(M(ee)&&ee.mipmapsAutoUpdate===!0){let ce=E(R),pe=n.get(ee).__webglTexture;t.bindTexture(ce,pe),v(ce),t.unbindTexture()}}}let Sn=[];function dt(R){if(R.samples>0){if(ge(R)===!1){let S=R.textures,W=R.width,ne=R.height,ee=i.COLOR_BUFFER_BIT,ce=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,pe=n.get(R),$=S.length>1;if($)for(let ue=0;ue<S.length;ue++)t.bindFramebuffer(i.FRAMEBUFFER,pe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,pe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,pe.__webglMultisampledFramebuffer),R.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,pe.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,pe.__webglFramebuffer);for(let ue=0;ue<S.length;ue++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(ee|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(ee|=i.STENCIL_BUFFER_BIT)),$){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,pe.__webglColorRenderbuffer[ue]);let D=n.get(S[ue]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,D,0)}i.blitFramebuffer(0,0,W,ne,0,0,W,ne,ee,i.NEAREST),c===!0&&(Sn.length=0,Sn.push(i.COLOR_ATTACHMENT0+ue),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&Sn.push(ce),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Sn))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),$)for(let ue=0;ue<S.length;ue++){t.bindFramebuffer(i.FRAMEBUFFER,pe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,pe.__webglColorRenderbuffer[ue]);let D=n.get(S[ue]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,pe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,D,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,pe.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&c){let S=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function ft(R){return Math.min(s.maxSamples,R.samples)}function ge(R){let S=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Rt(R){let S=a.render.frame;h.get(R)!==S&&(h.set(R,S),R.update())}function De(R,S){let W=R.colorSpace,ne=R.format,ee=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||W!==It&&W!==Gn&&(Xe.getTransfer(W)===nt?(ne!==Rn||ee!==dn)&&Ae("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Fe("WebGLTextures: Unsupported texture color space:",W)),S}function Be(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=we,this.resetTextureUnits=H,this.getTextureUnits=Y,this.setTextureUnits=ie,this.setTexture2D=ae,this.setTexture2DArray=le,this.setTexture3D=te,this.setTextureCube=re,this.rebindTextures=vn,this.setupRenderTarget=bn,this.updateRenderTargetMipmap=O,this.updateMultisampleRenderTarget=dt,this.setupDepthRenderbuffer=yn,this.setupFrameBufferTexture=xt,this.useMultisampledRTT=ge,this.dispose=k}function ky(i,e){function t(n,s=Gn){let r,a=Xe.getTransfer(s);if(n===dn)return i.UNSIGNED_BYTE;if(n===Ho)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Go)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Qc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===eh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Jc)return i.BYTE;if(n===jc)return i.SHORT;if(n===or)return i.UNSIGNED_SHORT;if(n===zo)return i.INT;if(n===zn)return i.UNSIGNED_INT;if(n===_n)return i.FLOAT;if(n===Hn)return i.HALF_FLOAT;if(n===th)return i.ALPHA;if(n===nh)return i.RGB;if(n===Rn)return i.RGBA;if(n===fi)return i.DEPTH_COMPONENT;if(n===Ri)return i.DEPTH_STENCIL;if(n===Vo)return i.RED;if(n===Wo)return i.RED_INTEGER;if(n===Yi)return i.RG;if(n===Xo)return i.RG_INTEGER;if(n===qo)return i.RGBA_INTEGER;if(n===aa||n===oa||n===la||n===ca)if(a===nt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===aa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===oa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===la)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ca)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===aa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===oa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===la)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ca)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Yo||n===Ko||n===Zo||n===$o)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Yo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ko)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Zo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===$o)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Jo||n===jo||n===Qo||n===el||n===tl||n===ha||n===nl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Jo||n===jo)return a===nt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Qo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===el)return r.COMPRESSED_R11_EAC;if(n===tl)return r.COMPRESSED_SIGNED_R11_EAC;if(n===ha)return r.COMPRESSED_RG11_EAC;if(n===nl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===il||n===sl||n===rl||n===al||n===ol||n===ll||n===cl||n===hl||n===ul||n===dl||n===fl||n===pl||n===ml||n===gl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===il)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===sl)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===rl)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===al)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ol)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ll)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===cl)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===hl)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ul)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===dl)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===fl)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===pl)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ml)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===gl)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===_l||n===xl||n===yl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===_l)return a===nt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===xl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===yl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===vl||n===bl||n===ua||n===Sl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===vl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===bl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ua)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Sl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===vs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var zy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Hy=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Eh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Kr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Mt({vertexShader:zy,fragmentShader:Hy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ne(new yi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Ah=class extends Fn{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,u=null,d=null,f=null,g=null,x=typeof XRWebGLBinding<"u",m=new Eh,p={},y=t.getContextAttributes(),M=null,v=null,E=[],T=[],_=new _e,b=null,L=null,A=new Pt;A.viewport=new rt;let N=new Pt;N.viewport=new rt;let F=[A,N],B=new Uo,I=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let ae=E[Z];return ae===void 0&&(ae=new qs,E[Z]=ae),ae.getTargetRaySpace()},this.getControllerGrip=function(Z){let ae=E[Z];return ae===void 0&&(ae=new qs,E[Z]=ae),ae.getGripSpace()},this.getHand=function(Z){let ae=E[Z];return ae===void 0&&(ae=new qs,E[Z]=ae),ae.getHandSpace()};function V(Z){let ae=T.indexOf(Z.inputSource);if(ae===-1)return;let le=E[ae];le!==void 0&&(le.update(Z.inputSource,Z.frame,l||a),le.dispatchEvent({type:Z.type,data:Z.inputSource}))}function z(){s.removeEventListener("select",V),s.removeEventListener("selectstart",V),s.removeEventListener("selectend",V),s.removeEventListener("squeeze",V),s.removeEventListener("squeezestart",V),s.removeEventListener("squeezeend",V),s.removeEventListener("end",z),s.removeEventListener("inputsourceschange",j);for(let Z=0;Z<E.length;Z++){let ae=T[Z];ae!==null&&(T[Z]=null,E[Z].disconnect(ae))}I=null,k=null,m.reset();for(let Z in p)delete p[Z];if(e.setRenderTarget(M),f=null,d=null,u=null,s=null,v=null,we.stop(),n.isPresenting=!1,e.setPixelRatio(b),e.setSize(_.width,_.height,!1),L!==null){let Z=L.camera;Z.fov=L.fov,Z.zoom=L.zoom,Z.updateProjectionMatrix(),L=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,n.isPresenting===!0&&Ae("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,n.isPresenting===!0&&Ae("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(Z){l=Z},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&x&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(M=e.getRenderTarget(),s.addEventListener("select",V),s.addEventListener("selectstart",V),s.addEventListener("selectend",V),s.addEventListener("squeeze",V),s.addEventListener("squeezestart",V),s.addEventListener("squeezeend",V),s.addEventListener("end",z),s.addEventListener("inputsourceschange",j),y.xrCompatible!==!0&&await t.makeXRCompatible(),b=e.getPixelRatio(),e.getSize(_),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let le=null,te=null,re=null;y.depth&&(re=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=y.stencil?Ri:fi,te=y.stencil?vs:zn);let Te={colorFormat:t.RGBA8,depthFormat:re,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Te),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),v=new Qt(d.textureWidth,d.textureHeight,{format:Rn,type:dn,depthTexture:new xi(d.textureWidth,d.textureHeight,te,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let le={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,le),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new Qt(f.framebufferWidth,f.framebufferHeight,{format:Rn,type:dn,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),we.setContext(s),we.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function j(Z){for(let ae=0;ae<Z.removed.length;ae++){let le=Z.removed[ae],te=T.indexOf(le);te>=0&&(T[te]=null,E[te].disconnect(le))}for(let ae=0;ae<Z.added.length;ae++){let le=Z.added[ae],te=T.indexOf(le);if(te===-1){for(let Te=0;Te<E.length;Te++)if(Te>=T.length){T.push(le),te=Te;break}else if(T[Te]===null){T[Te]=le,te=Te;break}if(te===-1)break}let re=E[te];re&&re.connect(le)}}function C(Z,ae){ae===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(ae.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let ae=Z.near,le=Z.far;m.texture!==null&&(m.depthNear>0&&(ae=m.depthNear),m.depthFar>0&&(le=m.depthFar)),B.near=N.near=A.near=ae,B.far=N.far=A.far=le,(I!==B.near||k!==B.far)&&(s.updateRenderState({depthNear:B.near,depthFar:B.far}),I=B.near,k=B.far),B.layers.mask=Z.layers.mask|6,A.layers.mask=B.layers.mask&-5,N.layers.mask=B.layers.mask&-3;let te=Z.parent,re=B.cameras;C(B,te);for(let Te=0;Te<re.length;Te++)C(re[Te],te);B.projectionMatrix.copy(A.projectionMatrix),B.projectionMatrixInverse.copy(A.projectionMatrixInverse),L===null&&Z.isPerspectiveCamera&&(L={camera:Z,fov:Z.fov,zoom:Z.zoom}),H(Z,B,te)};function H(Z,ae,le){le===null?Z.matrix.copy(ae.matrixWorld):(Z.matrix.copy(le.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(ae.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(ae.projectionMatrix),Z.projectionMatrixInverse.copy(ae.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=cs*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(Z){c=Z,d!==null&&(d.fixedFoveation=Z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(B)},this.getCameraTexture=function(Z){return p[Z]};let Y=null;function ie(Z,ae){if(h=ae.getViewerPose(l||a),g=ae,h!==null){let le=h.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let te=!1;le.length!==B.cameras.length&&(B.cameras.length=0,te=!0);for(let Ie=0;Ie<le.length;Ie++){let je=le[Ie],it=null;if(f!==null)it=f.getViewport(je);else{let Gt=u.getViewSubImage(d,je);it=Gt.viewport,Ie===0&&(e.setRenderTargetTextures(v,Gt.colorTexture,Gt.depthStencilTexture),e.setRenderTarget(v))}let Ye=F[Ie];Ye===void 0&&(Ye=new Pt,Ye.layers.enable(Ie),Ye.viewport=new rt,F[Ie]=Ye),Ye.matrix.fromArray(je.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(je.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(it.x,it.y,it.width,it.height),Ie===0&&(B.matrix.copy(Ye.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),te===!0&&B.cameras.push(Ye)}let re=s.enabledFeatures;if(re&&re.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){u=n.getBinding();let Ie=u.getDepthInformation(le[0]);Ie&&Ie.isValid&&Ie.texture&&m.init(Ie,s.renderState)}if(re&&re.includes("camera-access")&&x){e.state.unbindTexture(),u=n.getBinding();for(let Ie=0;Ie<le.length;Ie++){let je=le[Ie].camera;if(je){let it=p[je];it||(it=new Kr,p[je]=it);let Ye=u.getCameraImage(je);it.sourceTexture=Ye}}}}for(let le=0;le<E.length;le++){let te=T[le],re=E[le];te!==null&&re!==void 0&&re.update(te,ae,l||a)}Y&&Y(Z,ae),ae.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ae}),g=null}let we=new Nf;we.setAnimationLoop(ie),this.setAnimationLoop=function(Z){Y=Z},this.dispose=function(){}}},Gy=new ze,Wf=new Oe;Wf.set(-1,0,0,0,1,0,0,0,1);function Vy(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,ph(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,y,M,v){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),x(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?c(m,p,y,M):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Yt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Yt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let y=e.get(p),M=y.envMap,v=y.envMapRotation;M&&(m.envMap.value=M,m.envMapRotation.value.setFromMatrix4(Gy.makeRotationFromEuler(v)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Wf),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,y,M){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*y,m.scale.value=M*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,y){m.ior.value=p.ior,p.diffuseRoughness>0&&(m.diffuseRoughness.value=p.diffuseRoughness,p.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=p.diffuseRoughnessMap,t(p.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Yt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=p.iridescenceThicknessMaximum,p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function x(m,p){let y=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Wy(i,e,t,n){let s={},r={};function a(y,M){let v=M.program;n.uniformBlockBinding(y,v,s[y.id])}function o(y,M){let v=s[y.id];v===void 0&&(g(y),v=c(y),s[y.id]=v,y.addEventListener("dispose",m));let E=M.program;n.updateUBOMapping(y,E);let T=e.render.frame;r[y.id]!==T&&(l(y),r[y.id]=T)}function c(y){let M=i.createBuffer(),v=y.__size,E=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,v,E),i.bindBuffer(i.UNIFORM_BUFFER,null),M}function l(y){let M=s[y.id],v=y.uniforms,E=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let T=0,_=v.length;T<_;T++){let b=v[T];if(Array.isArray(b))for(let L=0,A=b.length;L<A;L++)h(b[L],T,L,E);else h(b,T,0,E)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function h(y,M,v,E){if(d(y,M,v,E)===!0){let T=y.__offset,_=y.value;if(Array.isArray(_)){let b=0;for(let L=0;L<_.length;L++){let A=_[L],N=x(A,!0);u(A,y.__data,b),b+=N.storage/Float32Array.BYTES_PER_ELEMENT}}else u(_,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,T,y.__data)}}function u(y,M,v){typeof y=="number"||typeof y=="boolean"?M[v]=y:y.isMatrix3?(M[v]=y.elements[0],M[v+1]=y.elements[1],M[v+2]=y.elements[2],M[v+3]=0,M[v+4]=y.elements[3],M[v+5]=y.elements[4],M[v+6]=y.elements[5],M[v+7]=0,M[v+8]=y.elements[6],M[v+9]=y.elements[7],M[v+10]=y.elements[8],M[v+11]=0):ArrayBuffer.isView(y)?M.set(y.subarray(0,M.length-v),v):y.toArray(M,v)}function d(y,M,v,E){let T=y.value,_=M+"_"+v;if(Array.isArray(T)){E[_]===void 0&&(E[_]=[]);let b=E[_],L=!1;for(let A=0;A<T.length;A++)f(T[A],b,A)===!0&&(L=!0);return L}return f(T,E,_)}function f(y,M,v){if(M[v]===void 0)return typeof y=="number"||typeof y=="boolean"?M[v]=y:ArrayBuffer.isView(y)?M[v]=y.slice():M[v]=y.clone(),!0;{let E=M[v];if(typeof y=="number"||typeof y=="boolean"){if(E!==y)return M[v]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(E.equals(y)===!1)return E.copy(y),!0}}return!1}function g(y){let M=y.uniforms,v=0,E=16;for(let _=0,b=M.length;_<b;_++){let L=Array.isArray(M[_])?M[_]:[M[_]];for(let A=0,N=L.length;A<N;A++){let F=L[A],B=Array.isArray(F.value)?F.value:[F.value],I=Array.isArray(M[_])||Array.isArray(F.value),k=v;for(let z=0,j=B.length;z<j;z++){let C=B[z],H=x(C,I),Y=v%E,ie=Y%H.boundary,we=Y+ie;v+=ie,we!==0&&E-we<H.storage&&(v+=E-we),z===0&&(k=v),v+=H.storage}let V=F.type==="int"?Int32Array:F.type==="uint"?Uint32Array:Float32Array;F.__data=new V((v-k)/Float32Array.BYTES_PER_ELEMENT),F.__offset=k}}let T=v%E;return T>0&&(v+=E-T),y.__size=v,y.__cache={},this}function x(y,M){let v={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(v.boundary=4,v.storage=4):y.isVector2?(v.boundary=8,v.storage=8):y.isVector3||y.isColor?(v.boundary=16,v.storage=12):y.isVector4?(v.boundary=16,v.storage=16):y.isMatrix3?(v.boundary=16,v.storage=48):y.isMatrix4?(v.boundary=16,v.storage=64):y.isTexture?Ae("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(v.boundary=16,v.storage=y.byteLength):Ae("WebGLRenderer: Unsupported uniform value type.",y),M===!0&&(v.boundary=16,v.storage=Math.ceil(v.storage/16)*16),v}function m(y){let M=y.target;M.removeEventListener("dispose",m),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function p(){for(let y in s)i.deleteBuffer(s[y]);s={},r={}}return{bind:a,update:o,dispose:p}}var Xy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ni=null;function qy(){return ni===null&&(ni=new $s(Xy,16,16,Yi,Hn),ni.name="DFG_LUT",ni.minFilter=St,ni.magFilter=St,ni.wrapS=wn,ni.wrapT=wn,ni.generateMipmaps=!1,ni.needsUpdate=!0),ni}var ur=class{constructor(e={}){let{canvas:t=rf(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=dn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;let x=f,m=new Set([qo,Xo,Wo]),p=new Set([dn,zn,or,vs,Ho,Go]),y=new Uint32Array(4),M=new Int32Array(4),v={textures:[],min:[],max:[],resolution:[]},E=null,T=null,_=[],b=[],L=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ei,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let A=this,N=!1,F=null,B=null,I=null,k=null;this._outputColorSpace=Ct;let V=0,z=0,j=null,C=-1,H=null,Y=new rt,ie=new rt,we=null,Z=new Ce(0),ae=0,le=t.width,te=t.height,re=1,Te=null,Ke=null,Ie=new rt(0,0,le,te),je=new rt(0,0,le,te),it=!1,Ye=new zi,Gt=new po,At=!1,ln=!1,xt=new ze,Xn=new P,Bt=new rt,yn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},vn=!1;function bn(){return j===null?re:1}let O=n;function Sn(w,U){return t.getContext(w,U)}let dt,ft,ge,Rt,De,Be,R,S,W,ne,ee,ce,pe,$,J,ue,D,Q,K,de,oe,he,Re;try{let w={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"187"}`),t.addEventListener("webglcontextlost",Le,!1),t.addEventListener("webglcontextrestored",He,!1),t.addEventListener("webglcontextcreationerror",xe,!1),O===null){let U="webgl2";if(O=Sn(U,w),O===null)throw Sn(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ve()}catch(w){throw t.removeEventListener("webglcontextlost",Le,!1),t.removeEventListener("webglcontextrestored",He,!1),t.removeEventListener("webglcontextcreationerror",xe,!1),Fe("WebGLRenderer: "+w.message),w}function Ve(){dt=new ix(O),dt.init(),oe=new ky(O,dt),ft=new q_(O,dt,e,oe),ge=new Oy(O,dt),ft.reversedDepthBuffer&&d&&ge.buffers.depth.setReversed(!0),B=O.createFramebuffer(),I=O.createFramebuffer(),k=O.createFramebuffer(),Rt=new ax(O),De=new My,Be=new By(O,dt,ge,De,ft,oe,Rt),R=new nx(A),S=new lg(O),he=new W_(O,S),W=new sx(O,S,Rt,he),ne=new lx(O,W,S,he,Rt),Q=new ox(O,ft,Be),J=new Y_(De),ee=new Sy(A,R,dt,ft,he,J),ce=new Vy(A,De),pe=new Ty,$=new Iy(dt),D=new V_(A,R,ge,ne,g,c),ue=new Fy(A,ne,ft),Re=new Wy(O,Rt,ft,ge),K=new X_(O,dt,Rt),de=new rx(O,dt,Rt),Rt.programs=ee.programs,A.capabilities=ft,A.extensions=dt,A.properties=De,A.renderLists=pe,A.shadowMap=ue,A.state=ge,A.info=Rt}x!==dn&&(L=new hx(x,t.width,t.height,o,s,r));let se=new Ah(A,O);this.xr=se,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let w=dt.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=dt.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return re},this.setPixelRatio=function(w){w!==void 0&&(re=w,this.setSize(le,te,!1))},this.getSize=function(w){return w.set(le,te)},this.setSize=function(w,U,q=!0){if(se.isPresenting){Ae("WebGLRenderer: Can't change size while VR device is presenting.");return}le=w,te=U,t.width=Math.floor(w*re),t.height=Math.floor(U*re),q===!0&&(t.style.width=w+"px",t.style.height=U+"px"),L!==null&&L.setSize(t.width,t.height),this.setViewport(0,0,w,U)},this.getDrawingBufferSize=function(w){return w.set(le*re,te*re).floor()},this.setDrawingBufferSize=function(w,U,q){le=w,te=U,re=q,t.width=Math.floor(w*q),t.height=Math.floor(U*q),this.setViewport(0,0,w,U)},this.setEffects=function(w){if(x===dn){Fe("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let U=0;U<w.length;U++)if(w[U].isOutputPass===!0){Ae("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}L.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(Y)},this.getViewport=function(w){return w.copy(Ie)},this.setViewport=function(w,U,q,G){w.isVector4?Ie.set(w.x,w.y,w.z,w.w):Ie.set(w,U,q,G),ge.viewport(Y.copy(Ie).multiplyScalar(bn()).round())},this.getScissor=function(w){return w.copy(je)},this.setScissor=function(w,U,q,G){w.isVector4?je.set(w.x,w.y,w.z,w.w):je.set(w,U,q,G),ge.scissor(ie.copy(je).multiplyScalar(bn()).round())},this.getScissorTest=function(){return it},this.setScissorTest=function(w){ge.setScissorTest(it=w)},this.setOpaqueSort=function(w){Te=w},this.setTransparentSort=function(w){Ke=w},this.getClearColor=function(w){return w.copy(D.getClearColor())},this.setClearColor=function(){D.setClearColor(...arguments)},this.getClearAlpha=function(){return D.getClearAlpha()},this.setClearAlpha=function(){D.setClearAlpha(...arguments)},this.clear=function(w=!0,U=!0,q=!0){let G=0;if(w){let X=!1;if(j!==null){let me=j.texture.format;X=m.has(me)}if(X){let me=j.texture.type,be=p.has(me),fe=D.getClearColor(),ve=D.getClearAlpha(),Ee=fe.r,ke=fe.g,Ze=fe.b;be?(y[0]=Ee,y[1]=ke,y[2]=Ze,y[3]=ve,O.clearBufferuiv(O.COLOR,0,y)):(M[0]=Ee,M[1]=ke,M[2]=Ze,M[3]=ve,O.clearBufferiv(O.COLOR,0,M))}else G|=O.COLOR_BUFFER_BIT}U&&(G|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(G|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&O.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),F=w},this.dispose=function(){t.removeEventListener("webglcontextlost",Le,!1),t.removeEventListener("webglcontextrestored",He,!1),t.removeEventListener("webglcontextcreationerror",xe,!1),D.dispose(),pe.dispose(),$.dispose(),Be.dispose(),De.dispose(),R.dispose(),ne.dispose(),W.dispose(),he.dispose(),Re.dispose(),ee.dispose(),se.dispose(),se.removeEventListener("sessionstart",fu),se.removeEventListener("sessionend",pu),ji.stop()};function Le(w){w.preventDefault(),Or("WebGLRenderer: Context Lost."),N=!0}function He(){Or("WebGLRenderer: Context Restored."),N=!1;let w=Rt.autoReset,U=ue.enabled,q=ue.autoUpdate,G=ue.needsUpdate,X=ue.type;Ve(),Rt.autoReset=w,ue.enabled=U,ue.autoUpdate=q,ue.needsUpdate=G,ue.type=X}function xe(w){Fe("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function st(w){let U=w.target;U.removeEventListener("dispose",st),kt(U)}function kt(w){Ci(w),De.remove(w)}function Ci(w){let U=De.get(w).programs;U!==void 0&&(U.forEach(function(q){ee.releaseProgram(q)}),w.isShaderMaterial&&ee.releaseShaderCache(w))}this.renderBufferDirect=function(w,U,q,G,X,me){U===null&&(U=yn);let be=X.isMesh&&X.matrixWorld.determinantAffine()<0,fe=Ip(w,U,q,G,X);ge.setMaterial(G,be);let ve=q.index,Ee=1;if(G.wireframe===!0){if(ve=W.getWireframeAttribute(q),ve===void 0)return;Ee=2}let ke=q.drawRange,Ze=q.attributes.position,Se=ke.start*Ee,$e=(ke.start+ke.count)*Ee;me!==null&&(Se=Math.max(Se,me.start*Ee),$e=Math.min($e,(me.start+me.count)*Ee)),ve!==null?(Se=Math.max(Se,0),$e=Math.min($e,ve.count)):Ze!=null&&(Se=Math.max(Se,0),$e=Math.min($e,Ze.count));let wt=$e-Se;if(wt<0||wt===1/0)return;he.setup(X,G,fe,q,ve);let ut,ot=K;if(ve!==null&&(ut=S.get(ve),ot=de,ot.setIndex(ut)),X.isMesh)G.wireframe===!0?(ge.setLineWidth(G.wireframeLinewidth*bn()),ot.setMode(O.LINES)):ot.setMode(O.TRIANGLES);else if(X.isLine){let Kt=G.linewidth;Kt===void 0&&(Kt=1),ge.setLineWidth(Kt*bn()),X.isLineSegments?ot.setMode(O.LINES):X.isLineLoop?ot.setMode(O.LINE_LOOP):ot.setMode(O.LINE_STRIP)}else X.isPoints?ot.setMode(O.POINTS):X.isSprite&&ot.setMode(O.TRIANGLES);if(X.isBatchedMesh)if(dt.get("WEBGL_multi_draw"))ot.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let Kt=X._multiDrawStarts,Me=X._multiDrawCounts,nn=X._multiDrawCount,et=ve?S.get(ve).bytesPerElement:1,Qi=De.get(G).currentProgram.getUniforms();for(let Zt=0;Zt<nn;Zt++)Qi.setValue(O,"_gl_DrawID",Zt),ot.render(Kt[Zt]/et,Me[Zt])}else if(X.isInstancedMesh)ot.renderInstances(Se,wt,X.count);else if(q.isInstancedBufferGeometry){let Kt=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,Me=Math.min(q.instanceCount,Kt);ot.renderInstances(Se,wt,Me)}else ot.render(Se,wt)};function du(w,U,q,G){F!==null&&w.isNodeMaterial&&F.setObject(G,w),At===!0&&J.setState(w,q,!1),w.transparent===!0&&w.side===Dt&&w.forceSinglePass===!1?(w.side=Yt,w.needsUpdate=!0,vr(w,U,G),w.side=Qn,w.needsUpdate=!0,vr(w,U,G),w.side=Dt):vr(w,U,G)}this.compile=function(w,U,q=null){q===null&&(q=w),F!==null&&F.renderStart(w,U,q),T=$.get(q),T.init(U),b.push(T),q.traverseVisible(function(X){X.isLight&&X.layers.test(U.layers)&&(T.pushLight(X),X.castShadow&&T.pushShadow(X))}),w!==q&&w.traverseVisible(function(X){X.isLight&&X.layers.test(U.layers)&&(T.pushLight(X),X.castShadow&&T.pushShadow(X))}),T.setupLights(),F!==null&&F.updateLights(T.state.lightsArray),ln=this.localClippingEnabled,At=J.init(this.clippingPlanes,ln),At===!0&&J.setGlobalState(this.clippingPlanes,U),F!==null&&ue.render(T.state.shadowsArray,q,U);let G=new Set;return w.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let me=X.material;if(me)if(Array.isArray(me))for(let be=0;be<me.length;be++){let fe=me[be];du(fe,q,U,X),G.add(fe)}else du(me,q,U,X),G.add(me)}),T=b.pop(),F!==null&&F.renderEnd(),G},this.compileAsync=function(w,U,q=null){let G=this.compile(w,U,q);return new Promise(X=>{function me(){if(G.forEach(function(be){let ve=De.get(be).currentProgram;(ve===void 0||ve.isReady())&&G.delete(be)}),G.size===0){X(w);return}setTimeout(me,10)}dt.get("KHR_parallel_shader_compile")!==null?me():setTimeout(me,10)})};let ql=null;function Cp(w){ql&&ql(w)}function fu(){ji.stop()}function pu(){ji.start()}let ji=new Nf;ji.setAnimationLoop(Cp),typeof self<"u"&&ji.setContext(self),this.setAnimationLoop=function(w){ql=w,se.setAnimationLoop(w),w===null?ji.stop():ji.start()},se.addEventListener("sessionstart",fu),se.addEventListener("sessionend",pu),this.render=function(w,U){if(U!==void 0&&U.isCamera!==!0){Fe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;F!==null&&F.renderStart(w,U);let q=se.enabled===!0&&se.isPresenting===!0,G=L!==null&&(j===null||q)&&L.begin(A,j);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),se.enabled===!0&&se.isPresenting===!0&&(L===null||L.isCompositing()===!1)&&(se.cameraAutoUpdate===!0&&se.updateCamera(U),U=se.getCamera()),w.isScene===!0&&w.onBeforeRender(A,w,U,j),T=$.get(w,b.length),T.init(U),T.state.textureUnits=Be.getTextureUnits(),b.push(T),xt.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),U.isArrayCamera?Gt.setFromArrayCamera(U):Ye.setFromProjectionMatrix(xt,Tn,U.reversedDepth),ln=this.localClippingEnabled,At=J.init(this.clippingPlanes,ln),E=pe.get(w,_.length),E.init(),_.push(E),this.info.render.frame++,se.enabled===!0&&se.isPresenting===!0){let be=A.xr.getDepthSensingMesh();be!==null&&Yl(be,U,-1/0,A.sortObjects)}Yl(w,U,0,A.sortObjects),E.finish(),F!==null&&F.updateLights(T.state.lightsArray),A.sortObjects===!0&&E.sort(Te,Ke),vn=se.enabled===!1||se.isPresenting===!1||se.hasDepthSensing()===!1,vn&&D.addToRenderList(E,w),this.info.autoReset===!0&&this.info.reset(),At===!0&&J.beginShadows();let X=T.state.shadowsArray;if(ue.render(X,w,U),At===!0&&J.endShadows(),(G&&L.hasRenderPass())===!1){let be=E.opaque,fe=E.transmissive;if(T.setupLights(),U.isArrayCamera){let ve=U.cameras;if(fe.length>0)for(let Ee=0,ke=ve.length;Ee<ke;Ee++){let Ze=ve[Ee];gu(be,fe,w,Ze)}vn&&D.render(w);for(let Ee=0,ke=ve.length;Ee<ke;Ee++){let Ze=ve[Ee];mu(E,w,Ze,Ze.viewport)}}else fe.length>0&&gu(be,fe,w,U),vn&&D.render(w),mu(E,w,U)}j!==null&&z===0&&(Be.updateMultisampleRenderTarget(j),Be.updateRenderTargetMipmap(j)),G&&L.end(A),w.isScene===!0&&w.onAfterRender(A,w,U),he.resetDefaultState(),C=-1,H=null,b.pop(),b.length>0?(T=b[b.length-1],Be.setTextureUnits(T.state.textureUnits),At===!0&&J.setGlobalState(A.clippingPlanes,T.state.camera)):T=null,_.pop(),_.length>0?E=_[_.length-1]:E=null,F!==null&&F.renderEnd()};function Yl(w,U,q,G){if(w.visible===!1)return;if(w.layers.test(U.layers)){if(w.isGroup)q=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(U);else if(w.isLight)T.pushLight(w),w.castShadow&&T.pushShadow(w);else if(w.isSprite){let be=U.isArrayCamera?Gt:Ye;if(!w.frustumCulled||w.intersectsFrustum(be)){G&&Bt.setFromMatrixPosition(w.matrixWorld).applyMatrix4(xt);let fe=ne.update(w),ve=w.material;ve.visible&&E.push(w,fe,ve,q,Bt.z,null,U)}}else if(w.isMesh||w.isLine||w.isPoints){let be=U.isArrayCamera?Gt:Ye;if(!w.frustumCulled||w.intersectsFrustum(be)){let fe=ne.update(w),ve=w.material;if(G&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Bt.copy(w.boundingSphere.center)):(fe.boundingSphere===null&&fe.computeBoundingSphere(),Bt.copy(fe.boundingSphere.center)),Bt.applyMatrix4(w.matrixWorld).applyMatrix4(xt)),Array.isArray(ve)){let Ee=fe.groups;for(let ke=0,Ze=Ee.length;ke<Ze;ke++){let Se=Ee[ke],$e=ve[Se.materialIndex];$e&&$e.visible&&E.push(w,fe,$e,q,Bt.z,Se,U)}}else ve.visible&&E.push(w,fe,ve,q,Bt.z,null,U)}}}let me=w.children;for(let be=0,fe=me.length;be<fe;be++)Yl(me[be],U,q,G)}function mu(w,U,q,G){let{opaque:X,transmissive:me,transparent:be}=w;T.setupLightsView(q),At===!0&&J.setGlobalState(A.clippingPlanes,q),G&&ge.viewport(Y.copy(G)),X.length>0&&wa(X,U,q),me.length>0&&wa(me,U,q),be.length>0&&wa(be,U,q),ge.buffers.depth.setTest(!0),ge.buffers.depth.setMask(!0),ge.buffers.color.setMask(!0),ge.setPolygonOffset(!1)}function gu(w,U,q,G){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[G.id]===void 0){let Se=dt.has("EXT_color_buffer_half_float")||dt.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[G.id]=new Qt(1,1,{generateMipmaps:!0,type:Se?Hn:dn,minFilter:An,samples:Math.max(4,ft.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Xe.workingColorSpace})}let me=T.state.transmissionRenderTarget[G.id],be=G.viewport||Y;me.setSize(be.z*A.transmissionResolutionScale,be.w*A.transmissionResolutionScale);let fe=A.getRenderTarget(),ve=A.getActiveCubeFace(),Ee=A.getActiveMipmapLevel();A.setRenderTarget(me),A.getClearColor(Z),ae=A.getClearAlpha(),ae<1&&A.setClearColor(16777215,.5),A.clear(),vn&&D.render(q);let ke=A.toneMapping;A.toneMapping=ei;let Ze=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),T.setupLightsView(G),At===!0&&J.setGlobalState(A.clippingPlanes,G),wa(w,q,G),Be.updateMultisampleRenderTarget(me),Be.updateRenderTargetMipmap(me),dt.has("WEBGL_multisampled_render_to_texture")===!1){let Se=!1;for(let $e=0,wt=U.length;$e<wt;$e++){let ut=U[$e],{object:ot,geometry:Kt,material:Me,group:nn}=ut;if(Me.side===Dt&&ot.layers.test(G.layers)){let et=Me.side;Me.side=Yt,Me.needsUpdate=!0,_u(ot,q,G,Kt,Me,nn),Me.side=et,Me.needsUpdate=!0,Se=!0}}Se===!0&&(Be.updateMultisampleRenderTarget(me),Be.updateRenderTargetMipmap(me))}A.setRenderTarget(fe,ve,Ee),A.setClearColor(Z,ae),Ze!==void 0&&(G.viewport=Ze),A.toneMapping=ke}function wa(w,U,q){let G=U.isScene===!0?U.overrideMaterial:null;for(let X=0,me=w.length;X<me;X++){let be=w[X],{object:fe,geometry:ve,group:Ee}=be,ke=be.material;ke.allowOverride===!0&&G!==null&&(ke=G),fe.layers.test(q.layers)&&_u(fe,U,q,ve,ke,Ee)}}function _u(w,U,q,G,X,me){F!==null&&X.isNodeMaterial&&F.setObject(w,X),w.onBeforeRender(A,U,q,G,X,me),w.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),X.onBeforeRender(A,U,q,G,w,me),X.transparent===!0&&X.side===Dt&&X.forceSinglePass===!1?(X.side=Yt,X.needsUpdate=!0,A.renderBufferDirect(q,U,G,X,w,me),X.side=Qn,X.needsUpdate=!0,A.renderBufferDirect(q,U,G,X,w,me),X.side=Dt):A.renderBufferDirect(q,U,G,X,w,me),w.onAfterRender(A,U,q,G,X,me)}function xu(w){let U=0;for(let q of w)q.texture!==null&&U++;return U}function vr(w,U,q){U.isScene!==!0&&(U=yn);let G=De.get(w),X=T.state.lights,me=T.state.shadowsArray,be=X.state.version,fe=ee.getParameters(w,X.state,me,U,q,T.state.lightProbeGridArray),ve=ee.getProgramCacheKey(fe),Ee=G.programs;G.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?U.environment:null,G.fog=U.fog;let ke=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;G.envMap=R.get(w.envMap||G.environment,ke),G.envMapRotation=G.environment!==null&&w.envMap===null?U.environmentRotation:w.envMapRotation,Ee===void 0&&(w.addEventListener("dispose",st),Ee=new Map,G.programs=Ee,G.programVariants=new Map);let Ze=Ee.get(ve);if(Ze!==void 0){if(G.currentProgram===Ze&&G.lightsStateVersion===be)return vu(w,fe),Ze}else fe.uniforms=ee.getUniforms(w),F!==null&&w.isNodeMaterial&&F.build(w,q,fe),w.onBeforeCompile(fe,A),Ze=ee.acquireProgram(fe,ve),Ee.set(ve,Ze),G.uniforms=fe.uniforms;let Se=G.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Se.clippingPlanes=J.uniform),vu(w,fe),G.needsLights=Dp(w),G.lightsStateVersion=be,G.needsLights&&(Se.ambientLightColor.value=X.state.ambient,Se.lightProbe.value=X.state.probe,Se.sunLights.value=X.state.sun,Se.sunLightShadows.value=X.state.sunShadow,Se.directionalLights.value=X.state.directional,Se.directionalLightShadows.value=X.state.directionalShadow,Se.spotLights.value=X.state.spot,Se.spotLightShadows.value=X.state.spotShadow,Se.rectAreaLights.value=X.state.rectArea,Se.ltc_1.value=X.state.rectAreaLTC1,Se.ltc_2.value=X.state.rectAreaLTC2,Se.pointLights.value=X.state.point,Se.pointLightShadows.value=X.state.pointShadow,Se.hemisphereLights.value=X.state.hemi,Se.sunShadowMatrix.value=X.state.sunShadowMatrix,Se.sunShadowCascade.value=X.state.sunShadowCascade,Se.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Se.spotLightMatrix.value=X.state.spotLightMatrix,Se.spotLightMap.value=X.state.spotLightMap,Se.pointShadowMatrix.value=X.state.pointShadowMatrix),G.numLightProbeGrids=xu(T.state.lightProbeGridArray),G.currentProgram=Ze,G.uniformsList=null,Ze}function Pp(w,U,q,G,X){let me=De.get(w),be=me.currentProgram.id+","+G+","+X,fe=me.programVariants.get(be);return fe===void 0?(fe=vr(w,U,q),me.programVariants.set(be,fe)):(me.currentProgram=fe,me.uniformsList=null,me.outputColorSpace=G,me.toneMapping=X),fe}function yu(w){if(w.uniformsList===null){let U=w.currentProgram.getUniforms();w.uniformsList=cr.seqWithValue(U.seq,w.uniforms)}return w.uniformsList}function vu(w,U){let q=De.get(w);q.outputColorSpace=U.outputColorSpace,q.batching=U.batching,q.batchingColor=U.batchingColor,q.instancing=U.instancing,q.instancingColor=U.instancingColor,q.instancingMorph=U.instancingMorph,q.skinning=U.skinning,q.morphTargets=U.morphTargets,q.morphNormals=U.morphNormals,q.morphColors=U.morphColors,q.morphTargetsCount=U.morphTargetsCount,q.numClippingPlanes=U.numClippingPlanes,q.numIntersection=U.numClipIntersection,q.vertexAlphas=U.vertexAlphas,q.vertexTangents=U.vertexTangents,q.toneMapping=U.toneMapping}function Ip(w,U,q,G,X){U.isScene!==!0&&(U=yn),Be.resetTextureUnits();let me=U.fog,be=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?U.environment:null,fe=j===null?A.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Xe.workingColorSpace,ve=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Ee=R.get(G.envMap||be,ve),ke=G.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,Ze=!!q.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Se=!!q.morphAttributes.position,$e=!!q.morphAttributes.normal,wt=!!q.morphAttributes.color,ut=ei;G.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(ut=A.toneMapping);let ot=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,Kt=ot!==void 0?ot.length:0,Me=De.get(G),nn=T.state.lights;if(At===!0&&(ln===!0||w!==H)){let yt=w===H&&G.id===C;J.setState(G,w,yt)}let et=!1,Qi=!1;G.version===Me.__version?Me.needsLights&&Me.lightsStateVersion!==nn.state.version||X.isBatchedMesh&&Me.batching===!1||!X.isBatchedMesh&&Me.batching===!0||X.isBatchedMesh&&Me.batchingColor===!0&&X._colorsTexture===null||X.isBatchedMesh&&Me.batchingColor===!1&&X._colorsTexture!==null||X.isInstancedMesh&&Me.instancing===!1||!X.isInstancedMesh&&Me.instancing===!0||X.isSkinnedMesh&&Me.skinning===!1||!X.isSkinnedMesh&&Me.skinning===!0||X.isInstancedMesh&&Me.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Me.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Me.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Me.instancingMorph===!1&&X.morphTexture!==null||Me.envMap!==Ee||G.fog===!0&&Me.fog!==me||Me.numClippingPlanes!==void 0&&(Me.numClippingPlanes!==J.numPlanes||Me.numIntersection!==J.numIntersection)||Me.vertexAlphas!==ke||Me.vertexTangents!==Ze||Me.morphTargets!==Se||Me.morphNormals!==$e||Me.morphColors!==wt||Me.morphTargetsCount!==Kt||Me.numLightProbeGrids!==xu(T.state.lightProbeGridArray)?et=!0:(Me.outputColorSpace!==fe||Me.toneMapping!==ut)&&(Qi=!0):(et=!0,Me.__version=G.version);let Zt=Me.currentProgram;(et===!0||Qi===!0)&&(Zt=Qi===!0?Pp(G,U,X,fe,ut):vr(G,U,X),F&&G.isNodeMaterial&&F.onUpdateProgram(G,Zt,Me));let Ta=!1,Pi=!1,es=!1,Je=Zt.getUniforms(),Vt=Me.uniforms;if(ge.useProgram(Zt.program)&&(Ta=!0,Pi=!0,es=!0),G.id!==C&&(C=G.id,Pi=!0),Ta||H!==w){ge.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),Je.setValue(O,"projectionMatrix",w.projectionMatrix),Je.setValue(O,"viewMatrix",w.matrixWorldInverse);let zt=Je.map.cameraPosition;zt!==void 0&&zt.setValue(O,Xn.setFromMatrixPosition(w.matrixWorld)),ft.logarithmicDepthBuffer&&Je.setValue(O,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&Je.setValue(O,"isOrthographic",w.isOrthographicCamera===!0),H!==w&&(H=w,Pi=!0,es=!0)}if(Me.needsLights&&(nn.state.sunShadowMap.length>0&&Je.setValue(O,"sunShadowMap",nn.state.sunShadowMap,Be),nn.state.directionalShadowMap.length>0&&Je.setValue(O,"directionalShadowMap",nn.state.directionalShadowMap,Be),nn.state.spotShadowMap.length>0&&Je.setValue(O,"spotShadowMap",nn.state.spotShadowMap,Be),nn.state.pointShadowMap.length>0&&Je.setValue(O,"pointShadowMap",nn.state.pointShadowMap,Be)),X.isSkinnedMesh){Je.setOptional(O,X,"bindMatrix"),Je.setOptional(O,X,"bindMatrixInverse");let yt=X.skeleton;yt&&(yt.boneTexture===null&&yt.computeBoneTexture(),Je.setValue(O,"boneTexture",yt.boneTexture,Be))}X.isBatchedMesh&&(Je.setOptional(O,X,"batchingTexture"),Je.setValue(O,"batchingTexture",X._matricesTexture,Be),Je.setOptional(O,X,"batchingIdTexture"),Je.setValue(O,"batchingIdTexture",X._indirectTexture,Be),Je.setOptional(O,X,"batchingColorTexture"),X._colorsTexture!==null&&Je.setValue(O,"batchingColorTexture",X._colorsTexture,Be));let Ln=q.morphAttributes;if((Ln.position!==void 0||Ln.normal!==void 0||Ln.color!==void 0)&&Q.update(X,q,Zt),(Pi||Me.receiveShadow!==X.receiveShadow)&&(Me.receiveShadow=X.receiveShadow,Je.setValue(O,"receiveShadow",X.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&U.environment!==null&&(Vt.envMapIntensity.value=U.environmentIntensity),Vt.dfgLUT!==void 0&&(Vt.dfgLUT.value=qy()),Pi){if(Je.setValue(O,"toneMappingExposure",A.toneMappingExposure),Me.needsLights&&Lp(Vt,es),me&&G.fog===!0&&ce.refreshFogUniforms(Vt,me),ce.refreshMaterialUniforms(Vt,G,re,te,T.state.transmissionRenderTarget[w.id]),Me.needsLights&&Me.numLightProbeGrids>0){let yt=v,zt=0;for(let ri of T.state.lightProbeGridArray)ri.texture!==null&&(yt.textures[zt]=ri.texture,yt.min[zt]=ri.boundingBox.min,yt.max[zt]=ri.boundingBox.max,yt.resolution[zt]=ri.resolution,zt++);for(let ri in yt)yt[ri].length=zt;Vt.probesSH.value=yt.textures,Vt.probesMin.value=yt.min,Vt.probesMax.value=yt.max,Vt.probesResolution.value=yt.resolution}cr.upload(O,yu(Me),Vt,Be)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(cr.upload(O,yu(Me),Vt,Be),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&Je.setValue(O,"center",X.center),Je.setValue(O,"modelViewMatrix",X.modelViewMatrix),Je.setValue(O,"normalMatrix",X.normalMatrix),Je.setValue(O,"modelMatrix",X.matrixWorld),G.uniformsGroups!==void 0){let yt=G.uniformsGroups;for(let zt=0,ri=yt.length;zt<ri;zt++){let Su=yt[zt];Re.update(Su,Zt),Re.bind(Su,Zt)}}return Zt}function Lp(w,U){w.ambientLightColor.needsUpdate=U,w.lightProbe.needsUpdate=U,w.sunLights.needsUpdate=U,w.sunLightShadows.needsUpdate=U,w.directionalLights.needsUpdate=U,w.directionalLightShadows.needsUpdate=U,w.pointLights.needsUpdate=U,w.pointLightShadows.needsUpdate=U,w.spotLights.needsUpdate=U,w.spotLightShadows.needsUpdate=U,w.rectAreaLights.needsUpdate=U,w.hemisphereLights.needsUpdate=U}function Dp(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return V},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return j},this.setRenderTargetTextures=function(w,U,q){let G=De.get(w);G.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),De.get(w.texture).__webglTexture=U,De.get(w.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:q,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,U){let q=De.get(w);q.__webglFramebuffer=U,q.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(w,U=0,q=0){j=w,V=U,z=q;let G=null,X=!1,me=!1;if(w){let fe=De.get(w);if(fe.__useDefaultFramebuffer!==void 0){ge.bindFramebuffer(O.FRAMEBUFFER,fe.__webglFramebuffer),Y.copy(w.viewport),ie.copy(w.scissor),we=w.scissorTest,ge.viewport(Y),ge.scissor(ie),ge.setScissorTest(we),C=-1;return}else if(fe.__webglFramebuffer===void 0)Be.setupRenderTarget(w);else if(fe.__hasExternalTextures)Be.rebindTextures(w,De.get(w.texture).__webglTexture,De.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){let ke=w.depthTexture;if(fe.__boundDepthTexture!==ke){if(ke!==null&&De.has(ke)&&(w.width!==ke.image.width||w.height!==ke.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Be.setupDepthRenderbuffer(w)}}let ve=w.texture;(ve.isData3DTexture||ve.isDataArrayTexture||ve.isCompressedArrayTexture)&&(me=!0);let Ee=De.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Ee[U])?G=Ee[U][q]:G=Ee[U],X=!0):w.samples>0&&Be.useMultisampledRTT(w)===!1?G=De.get(w).__webglMultisampledFramebuffer:Array.isArray(Ee)?G=Ee[q]:G=Ee,Y.copy(w.viewport),ie.copy(w.scissor),we=w.scissorTest}else Y.copy(Ie).multiplyScalar(re).floor(),ie.copy(je).multiplyScalar(re).floor(),we=it;if(q!==0&&(G=B),ge.bindFramebuffer(O.FRAMEBUFFER,G)&&ge.drawBuffers(w,G),ge.viewport(Y),ge.scissor(ie),ge.setScissorTest(we),X){let fe=De.get(w.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+U,fe.__webglTexture,q)}else if(me){let fe=U;for(let ve=0;ve<w.textures.length;ve++){let Ee=De.get(w.textures[ve]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+ve,Ee.__webglTexture,q,fe)}}else if(w!==null&&q!==0){let fe=De.get(w.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,fe.__webglTexture,q)}C=-1};function bu(w){let U=De.get(w);return(U.__readFormat!==w.format||U.__readType!==w.type)&&(U.__readFormat=w.format,U.__readType=w.type,U.__formatReadable=ft.textureFormatReadable(w.format),U.__typeReadable=ft.textureTypeReadable(w.type)),U}this.readRenderTargetPixels=function(w,U,q,G,X,me,be,fe=0){if(!(w&&w.isWebGLRenderTarget)){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ve=De.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&be!==void 0&&(ve=ve[be],Array.isArray(ve)&&(ve=ve[0])),ve){ge.bindFramebuffer(O.FRAMEBUFFER,ve);try{let Ee=w.textures[fe],ke=Ee.format,Ze=Ee.type;w.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+fe);let Se=bu(Ee);if(Se.__formatReadable===!1){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Se.__typeReadable===!1){Fe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=w.width-G&&q>=0&&q<=w.height-X&&O.readPixels(U,q,G,X,oe.convert(ke),oe.convert(Ze),me)}finally{let Ee=j!==null?De.get(j).__webglFramebuffer:null;ge.bindFramebuffer(O.FRAMEBUFFER,Ee)}}},this.readRenderTargetPixelsAsync=async function(w,U,q,G,X,me,be,fe=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ve=De.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&be!==void 0&&(ve=ve[be],Array.isArray(ve)&&(ve=ve[0])),ve)if(U>=0&&U<=w.width-G&&q>=0&&q<=w.height-X){ge.bindFramebuffer(O.FRAMEBUFFER,ve);let Ee=w.textures[fe],ke=Ee.format,Ze=Ee.type;w.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+fe);let Se=bu(Ee);if(Se.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Se.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let $e=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,$e),O.bufferData(O.PIXEL_PACK_BUFFER,me.byteLength,O.STREAM_READ),O.readPixels(U,q,G,X,oe.convert(ke),oe.convert(Ze),0),O.bindBuffer(O.PIXEL_PACK_BUFFER,null);let wt=j!==null?De.get(j).__webglFramebuffer:null;ge.bindFramebuffer(O.FRAMEBUFFER,wt);let ut=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await of(O,ut,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,$e),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,me),O.bindBuffer(O.PIXEL_PACK_BUFFER,null),O.deleteBuffer($e),O.deleteSync(ut),me}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,U=null,q=0){let G=Math.pow(2,-q),X=Math.floor(w.image.width*G),me=Math.floor(w.image.height*G),be=U!==null?U.x:0,fe=U!==null?U.y:0;Be.setTexture2D(w,0),O.copyTexSubImage2D(O.TEXTURE_2D,q,0,0,be,fe,X,me),ge.unbindTexture()},this.copyTextureToTexture=function(w,U,q=null,G=null,X=0,me=0){let be,fe,ve,Ee,ke,Ze,Se,$e,wt,ut=w.isCompressedTexture?w.mipmaps[me]:w.image;if(q!==null)be=q.max.x-q.min.x,fe=q.max.y-q.min.y,ve=q.isBox3?q.max.z-q.min.z:1,Ee=q.min.x,ke=q.min.y,Ze=q.isBox3?q.min.z:0;else{let Je=Math.pow(2,-X);be=Math.floor(ut.width*Je),fe=Math.floor(ut.height*Je),w.isDataArrayTexture?ve=ut.depth:w.isData3DTexture?ve=Math.floor(ut.depth*Je):ve=1,Ee=0,ke=0,Ze=0}G!==null?(Se=G.x,$e=G.y,wt=G.z):(Se=0,$e=0,wt=0);let ot=oe.convert(U.format),Kt=oe.convert(U.type),Me;U.isData3DTexture?(Be.setTexture3D(U,0),Me=O.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(Be.setTexture2DArray(U,0),Me=O.TEXTURE_2D_ARRAY):(Be.setTexture2D(U,0),Me=O.TEXTURE_2D),ge.activeTexture(O.TEXTURE0),ge.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,U.flipY),ge.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),ge.pixelStorei(O.UNPACK_ALIGNMENT,U.unpackAlignment);let nn=ge.getParameter(O.UNPACK_ROW_LENGTH),et=ge.getParameter(O.UNPACK_IMAGE_HEIGHT),Qi=ge.getParameter(O.UNPACK_SKIP_PIXELS),Zt=ge.getParameter(O.UNPACK_SKIP_ROWS),Ta=ge.getParameter(O.UNPACK_SKIP_IMAGES);ge.pixelStorei(O.UNPACK_ROW_LENGTH,ut.width),ge.pixelStorei(O.UNPACK_IMAGE_HEIGHT,ut.height),ge.pixelStorei(O.UNPACK_SKIP_PIXELS,Ee),ge.pixelStorei(O.UNPACK_SKIP_ROWS,ke),ge.pixelStorei(O.UNPACK_SKIP_IMAGES,Ze);let Pi=w.isDataArrayTexture||w.isData3DTexture,es=U.isDataArrayTexture||U.isData3DTexture;if(w.isDepthTexture){let Je=De.get(w),Vt=De.get(U),Ln=De.get(Je.__renderTarget),yt=De.get(Vt.__renderTarget);ge.bindFramebuffer(O.READ_FRAMEBUFFER,Ln.__webglFramebuffer),ge.bindFramebuffer(O.DRAW_FRAMEBUFFER,yt.__webglFramebuffer);for(let zt=0;zt<ve;zt++)Pi&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,De.get(w).__webglTexture,X,Ze+zt),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,De.get(U).__webglTexture,me,wt+zt)),O.blitFramebuffer(Ee,ke,Ee+be,ke+fe,Se,$e,Se+be,$e+fe,O.DEPTH_BUFFER_BIT,O.NEAREST);ge.bindFramebuffer(O.READ_FRAMEBUFFER,null),ge.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(X!==0||w.isRenderTargetTexture||De.has(w)){let Je=De.get(w),Vt=De.get(U);ge.bindFramebuffer(O.READ_FRAMEBUFFER,I),ge.bindFramebuffer(O.DRAW_FRAMEBUFFER,k);for(let Ln=0;Ln<ve;Ln++)Pi?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Je.__webglTexture,X,Ze+Ln):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Je.__webglTexture,X),es?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Vt.__webglTexture,me,wt+Ln):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Vt.__webglTexture,me),X!==0?O.blitFramebuffer(Ee,ke,Ee+be,ke+fe,Se,$e,Se+be,$e+fe,O.COLOR_BUFFER_BIT,O.NEAREST):es?O.copyTexSubImage3D(Me,me,Se,$e,wt+Ln,Ee,ke,be,fe):O.copyTexSubImage2D(Me,me,Se,$e,Ee,ke,be,fe);ge.bindFramebuffer(O.READ_FRAMEBUFFER,null),ge.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else es?w.isDataTexture||w.isData3DTexture?O.texSubImage3D(Me,me,Se,$e,wt,be,fe,ve,ot,Kt,ut.data):U.isCompressedArrayTexture?O.compressedTexSubImage3D(Me,me,Se,$e,wt,be,fe,ve,ot,ut.data):O.texSubImage3D(Me,me,Se,$e,wt,be,fe,ve,ot,Kt,ut):w.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,me,Se,$e,be,fe,ot,Kt,ut.data):w.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,me,Se,$e,ut.width,ut.height,ot,ut.data):O.texSubImage2D(O.TEXTURE_2D,me,Se,$e,be,fe,ot,Kt,ut);ge.pixelStorei(O.UNPACK_ROW_LENGTH,nn),ge.pixelStorei(O.UNPACK_IMAGE_HEIGHT,et),ge.pixelStorei(O.UNPACK_SKIP_PIXELS,Qi),ge.pixelStorei(O.UNPACK_SKIP_ROWS,Zt),ge.pixelStorei(O.UNPACK_SKIP_IMAGES,Ta),me===0&&U.generateMipmaps===!0&&U.mipmapsAutoUpdate===!0&&O.generateMipmap(Me),ge.unbindTexture()},this.initRenderTarget=function(w){De.get(w).__webglFramebuffer===void 0&&Be.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?Be.setTextureCube(w,0):w.isData3DTexture?Be.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?Be.setTexture2DArray(w,0):Be.setTexture2D(w,0),ge.unbindTexture()},this.resetState=function(){V=0,z=0,j=null,ge.reset(),he.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Tn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Xe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Xe._getUnpackColorSpace()}};var Yy=Math.PI*2,qf=ht.clamp,Pl=ht.smoothstep,mr=3.55;function tn(i,e){let t=Math.sin(i*127.1+e*311.7)*43758.5453;return t-Math.floor(t)}function pr(i,e){let t=Math.floor(i),n=Math.floor(e),s=Pl(i-t,0,1),r=Pl(e-n,0,1);return ht.lerp(ht.lerp(tn(t,n),tn(t+1,n),s),ht.lerp(tn(t,n+1),tn(t+1,n+1),s),r)}var Rh=i=>4-i*.18+10*Math.sin(i*.069+.5)+4.5*Math.sin(i*.115-.2),xa=i=>1.6+i*.018+1.3*Math.sin(i*.073-.2),Yf=i=>-.18+.69*Math.cos(i*.069+.5)+.5175*Math.cos(i*.115-.2),Rl=(i,e)=>(e-Rh(i))/Math.hypot(1,Yf(i));function Xf(i,e){let t=Math.hypot(i/79,e/44);return qf((1.12-t+(pr(i*.075,e*.075)-.5)*.17)*5,0,1)}function Cl(i,e){let t=Rl(i,e),n=Pl(Math.abs(t),mr,mr+20),s=Math.exp(-(((i+15)/24)**2+((e+25)/12)**2))*19+Math.exp(-(((i-36)/30)**2+((e+29)/17)**2))*15+Math.exp(-(((i+48)/22)**2+((e+9)/17)**2))*13+Math.exp(-(((i-9)/19)**2+((e-33)/11)**2))*5.5,r=pr(i*.09,e*.09)*4.8+pr(i*.23,e*.23)*1.8+Math.abs(pr(i*.16,e*.16)-.5)*3.5+pr(i*.65,e*.65)*.7;return xa(i)+n*(s+r-2.5)}var Ki=new P(6.2,xa(6.2)+.33,Rh(6.2)+.3),gr=new P(42,Cl(42,-19),-19),Ll=`
  uniform float radius;
  uniform vec2 origin;
  float pulse(vec2 p) {
    float d = radius - distance(p, origin);
    return smoothstep(-1.1, 0.0, d) * (1.0 - smoothstep(0.0, 4.5, d));
  }
`,Ky=`
  attribute float edge;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vEdge;
  void main() {
    vPosition = position;
    vNormal = normal;
    vEdge = edge;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;function Zy(i,e){return new Ne(i,new Mt({uniforms:e,vertexShader:Ky,transparent:!0,polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1,fragmentShader:Ll+`
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vEdge;
      void main() {
        if (vEdge < 0.075) discard;
        float light = clamp(dot(normalize(vNormal), normalize(vec3(-0.57, 0.66, -0.58))), 0.0, 1.0);
        float elevation = smoothstep(5.0, 23.0, vPosition.y);
        vec3 base = mix(vec3(0.030, 0.075, 0.099), vec3(0.082, 0.202, 0.220), pow(light, 1.7));
        base += vec3(0.028, 0.056, 0.071) * elevation;
        float fresnel = pow(1.0 - max(0.0, dot(normalize(cameraPosition - vPosition), normalize(vNormal))), 2.1);
        base += vec3(0.032, 0.087, 0.082) * fresnel * elevation;
        float level = (vPosition.y + 0.15) / 1.48;
        float width = fwidth(level);
        float contour = 1.0 - smoothstep(0.0, max(0.008, min(0.48, width * 0.85)), abs(fract(level + 0.5) - 0.5));
        float hills = smoothstep(1.8, 7.0, vPosition.y);
        base += vec3(0.051, 0.159, 0.17) * contour * hills;
        base += vec3(0.032, 0.11, 0.11) * pulse(vPosition.xz);
        gl_FragColor = vec4(base, smoothstep(0.04, 0.68, vEdge));
      }
    `}))}function $y(i,e,t,n){let s=new Qe;s.setAttribute("position",new Ue(i,3)),s.setAttribute("color",new Ue(e,3)),s.setAttribute("size",new Ue(t,1));let r=new Mt({uniforms:n,vertexColors:!0,transparent:!0,depthWrite:!1,vertexShader:Ll+`
      uniform float pixelScale;
      attribute float size;
      varying vec3 tint;
      void main() {
        float scan = pulse(position.xz);
        tint = color + vec3(0.24, 0.63, 0.64) * scan;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(pixelScale * (size + scan * 0.45), 0.85, 4.5);
      }
    `,fragmentShader:`
      varying vec3 tint;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        if (r > 0.5) discard;
        gl_FragColor = vec4(tint, (1.0 - smoothstep(0.18, 0.51, r)) * 0.94);
      }
    `});return new hs(s,r)}function Il(i,e,t,n){let s=new Qe;s.setAttribute("position",new Ue(i,3));let r=new Mt({uniforms:{...n,tint:{value:new P(...e)},opacity:{value:t}},transparent:!0,depthWrite:!1,vertexShader:Ll+`
      varying float light;
      void main() {
        light = pulse(position.xz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 tint;
      uniform float opacity;
      varying float light;
      void main() { gl_FragColor = vec4(tint + vec3(0.12, 0.28, 0.30) * light, opacity); }
    `});return new _i(s,r)}function Jy(i){let e=[],t=[],n=[],s=[],r=[],a=null;for(let l=0;l<=550;l++){let h=-78+l*156/550,u=Rh(h),d=xa(h)+.18,f=Yf(h),g=Math.hypot(1,f);for(let x of[-1,1]){let m=x*mr,p=h-m*f/g;if(e.push(p,xa(p)+.22,u+m/g),t.push(m,h),l%17===2&&Math.abs(h)<73){let y=h-(m+x*.4)*f/g,M=u+(m+x*.4)/g;s.push(y,d+.18,M,y,d+.9,M)}if(x===1){let y=h>17&&h<41||h>-43&&h<-32,M=m+.8,v=h-M*f/g,E=u+M/g,T=[v,xa(v)+1.06,E];y&&a&&r.push(...a,...T),y&&l%8===0&&s.push(v,T[1]-.67,E,...T),a=y?T:null}}if(l){let x=l*2;n.push(x-2,x-1,x,x,x-1,x+1)}}let o=new Qe;o.setAttribute("position",new Ue(e,3)),o.setAttribute("uv",new Ue(t,2)),o.setIndex(n);let c=new Mt({uniforms:i,side:Dt,transparent:!0,vertexShader:`
      varying vec2 road;
      varying vec2 ground;
      void main() {
        road = uv; ground = position.xz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Ll+`
      varying vec2 road;
      varying vec2 ground;
      float line(float value, float width) {
        float aa = max(fwidth(value) * 0.65, 0.015);
        return 1.0 - smoothstep(max(0.0, width - aa), width + aa, abs(value));
      }
      void main() {
        float d = abs(road.x);
        float end = 1.0 - smoothstep(66.0, 78.0, abs(road.y));
        float shoulder = line(d - 3.04, 0.115);
        float gutter = line(d - 3.46, 0.055);
        float median = line(d - 0.15, 0.065);
        float dash = smoothstep(0.20, 0.24, fract(road.y / 7.0));
        float grain = fract(sin(dot(floor(ground * 13.0), vec2(13.713, 58.37))) * 16272.43);
        vec3 c = mix(vec3(0.055, 0.081, 0.096), vec3(0.14, 0.14, 0.14), exp(-d * 1.25)) + vec3(0.015 * grain);
        c += vec3(0.63, 0.79, 0.76) * shoulder * 0.93 + vec3(0.15, 0.51, 0.52) * gutter;
        c += vec3(1.0, 0.57, 0.12) * median * (0.4 + 0.6 * dash) + vec3(0.1, 0.04, 0.0) * exp(-d * 1.4);
        c += vec3(0.06, 0.20, 0.18) * pulse(ground);
        gl_FragColor = vec4(c, end);
      }
    `});return[new Ne(o,c),Il(s,[.58,.81,.8],.65,i),Il(r,[.53,.72,.73],.94,i)]}function Kf(i){let e=[],t=[],n=[],s=[],r=[],a=[],o=[],c=[],u=(x,m,p,y,M,v,E)=>{s.push(x,m,p),r.push(y,M,v),a.push(E)};for(let x=0;x<=157;x++)for(let m=0;m<=260;m++){let p=(m/260-.5)*171+(tn(m,x)-.5)*.32,y=(x/157-.5)*100+(tn(x,m+25)-.5)*.32,M=Cl(p,y),v=Xf(p,y),E=tn(m+3,x+18);if(e.push(p,M,y),t.push(v),m<260&&x<157&&v>.02){let L=m+x*261;n.push(L,L+260+1,L+1,L+1,L+260+1,L+260+2)}if(v<E*.92||Math.abs(Rl(p,y))<mr+.13)continue;let T=qf(.65+(Cl(p+.4,y+.4)-M)*1.4,.1,1.16),_=(.25+.75*E*E)*T*Math.min(v+.15,1),b=Pl(M,5,20)*(.4+E*.6);u(p,M+.07,y,.14+_*.48+b*.12,.29+_*.66+b*.17,.34+_*.62+b*.18,.71+E*.76)}for(let x=0;x<640;x++){let m=(tn(x,167)-.5)*157,p=(tn(x,170)-.5)*82,y=Xf(m,p),M=Math.abs(Rl(m,p));if(y<.37||M<mr+2.8||pr(m*.1,p*.1)<.35)continue;let v=Cl(m,p),E=1.8+tn(x,173)**1.25*5.6,T=v<12&&tn(x,190)<.52,_=E*(.2+tn(x,177)*.13);o.push(m,v,p,m,v+E*.91,p);let b=Math.round(22+E*8);for(let L=0;L<b;L++){let A=.13+tn(x*11,L+9)*.87,N=tn(x*17,L+31)*Yy,F=A*5.6%1,B=T?Math.sin(Math.max(0,A-.3)/.7*Math.PI)**.72:(1-A)**.81,I=_*B*(T?1.2:.35+.65*(1-F))*(.62+.38*tn(x+30,L)),k=(.35+.65*Math.max(0,-Math.cos(N-.7)))*(.55+.45*tn(x,L+62));u(m+Math.cos(N)*I,v+A*E,p+Math.sin(N)*I,.13+k*.6,.27+k*.65,.28+k*.57,.85+k*1.1)}}let d=new Qe;d.setAttribute("position",new Ue(e,3)),d.setAttribute("edge",new Ue(t,1)),d.setIndex(n),d.computeVertexNormals();for(let x=0;x<n.length;x+=6){let m=n[x],p=m%261,y=Math.floor(m/261);if(!(t[m]<.2||Math.abs(Rl(e[m*3],e[m*3+2]))<mr+.3))for(let M of[p%7===0?n[x+1]:-1,y%7===0?n[x+2]:-1])M<0||c.push(e[m*3],e[m*3+1]+.065,e[m*3+2],e[M*3],e[M*3+1]+.065,e[M*3+2])}let f=Il(c,[.25,.69,.71],.36,i);f.material.fragmentShader=`
    varying float light;
    void main() {
      if (light < 0.015) discard;
      gl_FragColor = vec4(0.31, 0.70, 0.73, light * 0.36);
    }
  `;let g=new ct;return g.add(Zy(d,i),f,Il(o,[.18,.4,.4],.6,i),...Jy(i),$y(s,r,a,i)),g}var jy=`
  varying vec2 screenUv;
  void main() {
    screenUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,Qy=`
  varying vec2 screenUv;
  uniform float aspect, phase, wetness, fieldStep;
  float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * vec3(0.1071, 0.1137, 0.1031));
    q += dot(q, q.yzx + 19.73);
    return fract((q.x + q.z) * q.y);
  }
  float layer(vec2 p, float cells, float speed) {
    vec2 grid = p * cells;
    float column = floor(grid.x);
    grid.y += hash(vec2(column, 7.0)) * 14.0;
    grid.y += phase * speed * (0.62 + 0.74 * hash(vec2(column, 2.4)));
    vec2 id = floor(grid);
    float seed = hash(id);
    float chance = smoothstep(seed, seed + 0.1, wetness * 0.8);
    vec2 d = fract(grid) - vec2(0.21 + hash(id + 8.12) * 0.58, 0.27 + 0.28 * hash(id + 1.5));
    float r = 0.09 + 0.11 * hash(id + 9.3);
    float runner = step(0.01, speed);
    d.x += runner * sin(d.y * 7.3 + seed * 5.0) * 0.025;
    vec2 bulb = d / vec2(r, r * (1.0 + 0.43 * runner));
    float dome = pow(max(0.0, 1.0 - dot(bulb, bulb)), 1.45);
    float t = clamp(d.y / 0.55, 0.0, 1.0);
    float tail = runner * 0.25 * smoothstep(0.0, 0.09, d.y) * (1.0 - t)
      * (1.0 - smoothstep(0.0, r * mix(0.34, 0.05, t), abs(d.x)));
    return chance * max(dome, tail);
  }
  float water(vec2 p) {
    return max(0.72 * layer(p, 33.0, 0.0), layer(p + vec2(0.1, 0.28), 12.0, 0.39));
  }
  void main() {
    vec2 p = screenUv * vec2(aspect, 1.0);
    vec2 e = vec2(fieldStep, 0.0);
    vec2 normal = vec2(water(p + e) - water(p - e), water(p + e.yx) - water(p - e.yx));
    normal = clamp(normal / (fieldStep * 220.0), -1.0, 1.0);
    gl_FragColor = vec4((128.0 + normal * 127.0) / 255.0, water(p), 1.0);
  }
`,ev=`
  varying vec2 screenUv;
  uniform sampler2D dryScene, dropField;
  uniform float aspect, amount;
  void main() {
    vec3 field = texture2D(dropField, screenUv).rgb;
    vec2 slope = (field.rg * 255.0 - 128.0) / 127.0;
    vec2 shift = slope * vec2(1.0 / aspect, 1.0) * (0.012 * amount);
    vec4 under = texture2D(dryScene, clamp(screenUv + shift, 0.0, 1.0));
    float edge = field.b * max(0.0, dot(slope, vec2(-0.60, 0.80))) * amount;
    gl_FragColor = vec4(under.rgb * (1.0 + 0.16 * edge) + vec3(0.05, 0.09, 0.10) * edge,
                        max(under.a, edge * 0.30));
  }
`;function Zf(i){let e=new Qt(1,1,{samples:Math.min(4,i.capabilities.maxSamples)}),t=new Qt(1,1,{depthBuffer:!1});for(let u of[e,t])u.texture.colorSpace=Gn,u.texture.generateMipmaps=!1,u.texture.minFilter=u.texture.magFilter=St;let n={dryScene:{value:e.texture},dropField:{value:t.texture},aspect:{value:1},phase:{value:0},wetness:{value:0},fieldStep:{value:1},amount:{value:0}},s=u=>new Mt({uniforms:n,vertexShader:jy,fragmentShader:u,blending:Ai,depthTest:!1,depthWrite:!1,toneMapped:!1}),r=s(Qy),a=s(ev),o=new Qe;o.setAttribute("position",new Ue([-1,-1,0,3,-1,0,-1,3,0],3));let c=new Ne(o,r);c.frustumCulled=!1;let l=new On,h=new ms;return l.add(c),{resize(u,d){let f=Math.max(1,Math.floor(d/2));e.setSize(u,d),t.setSize(Math.max(1,Math.floor(u/2)),f),n.aspect.value=u/d,n.fieldStep.value=1/f},paint(u,d,f,g){n.phase.value=f,n.wetness.value=g,n.amount.value=Math.min(1,g*5),i.setRenderTarget(e),i.render(u,d),c.material=r,i.setRenderTarget(t),i.render(l,h),c.material=a,i.setRenderTarget(null),i.render(l,h)},dispose(){e.dispose(),t.dispose(),r.dispose(),a.dispose(),o.dispose()}}}var ya=new P;function Cn(i,e,t,n,s,r){let a=2*Math.PI*s/4,o=Math.max(r-2*s,0),c=Math.PI/4;ya.copy(e),ya[n]=0,ya.normalize();let l=.5*a/(a+o),h=1-ya.angleTo(i)/c;return Math.sign(ya[t])===1?h*l:o/(a+o)+l+l*(1-h)}var Dl=class i extends hn{constructor(e=1,t=1,n=1,s=2,r=.1){let a=s*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:s,radius:r},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let c=new P,l=new P,h=new P(e,t,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,g=u.length/6,x=new P,m=.5/a;for(let p=0,y=0;p<u.length;p+=3,y+=2)switch(c.fromArray(u,p),l.copy(c),l.x-=Math.sign(l.x)*m,l.y-=Math.sign(l.y)*m,l.z-=Math.sign(l.z)*m,l.normalize(),u[p+0]=h.x*Math.sign(c.x)+l.x*r,u[p+1]=h.y*Math.sign(c.y)+l.y*r,u[p+2]=h.z*Math.sign(c.z)+l.z*r,d[p+0]=l.x,d[p+1]=l.y,d[p+2]=l.z,Math.floor(p/g)){case 0:x.set(1,0,0),f[y+0]=Cn(x,l,"z","y",r,n),f[y+1]=1-Cn(x,l,"y","z",r,t);break;case 1:x.set(-1,0,0),f[y+0]=1-Cn(x,l,"z","y",r,n),f[y+1]=1-Cn(x,l,"y","z",r,t);break;case 2:x.set(0,1,0),f[y+0]=1-Cn(x,l,"x","z",r,e),f[y+1]=Cn(x,l,"z","x",r,n);break;case 3:x.set(0,-1,0),f[y+0]=1-Cn(x,l,"x","z",r,e),f[y+1]=1-Cn(x,l,"z","x",r,n);break;case 4:x.set(0,0,1),f[y+0]=1-Cn(x,l,"x","y",r,e),f[y+1]=1-Cn(x,l,"y","x",r,t);break;case 5:x.set(0,0,-1),f[y+0]=Cn(x,l,"x","y",r,e),f[y+1]=1-Cn(x,l,"y","x",r,t);break}}static fromJSON(e){return new i(e.width,e.height,e.depth,e.segments,e.radius)}};function Ch(i,e){if(e===ih)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===lr||e===da){let t=i.getIndex();if(t===null){let r=[],a=i.getAttribute("position");if(a!==void 0){for(let o=0;o<a.count;o++)r.push(o);i.setIndex(r),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===lr)for(let r=1;r<=n;r++)s.push(t.getX(0)),s.push(t.getX(r)),s.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(s.push(t.getX(r)),s.push(t.getX(r+1)),s.push(t.getX(r+2))):(s.push(t.getX(r+2)),s.push(t.getX(r+1)),s.push(t.getX(r)));return s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),i.setIndex(s),i.clearGroups(),i}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}function $f(i){let e=new Map,t=new Map,n=i.clone();return Jf(i,n,function(s,r){e.set(r,s),t.set(s,r)}),n.traverse(function(s){if(!s.isSkinnedMesh)return;let r=s,a=e.get(s),o=a.skeleton.bones;r.skeleton=a.skeleton.clone(),r.bindMatrix.copy(a.bindMatrix),r.skeleton.bones=o.map(function(c){return t.get(c)}),r.bind(r.skeleton,r.bindMatrix)}),n}function Jf(i,e,t){t(i,e);for(let n=0;n<i.children.length;n++)Jf(i.children[n],e.children[n],t)}var Nl=class extends Jn{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Fh(t)}),this.register(function(t){return new Oh(t)}),this.register(function(t){return new Bh(t)}),this.register(function(t){return new Yh(t)}),this.register(function(t){return new Kh(t)}),this.register(function(t){return new Zh(t)}),this.register(function(t){return new zh(t)}),this.register(function(t){return new Hh(t)}),this.register(function(t){return new Gh(t)}),this.register(function(t){return new Vh(t)}),this.register(function(t){return new Uh(t)}),this.register(function(t){return new Wh(t)}),this.register(function(t){return new kh(t)}),this.register(function(t){return new qh(t)}),this.register(function(t){return new Xh(t)}),this.register(function(t){return new Dh(t)}),this.register(function(t){return new Ul(t,qe.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new Ul(t,qe.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new $h(t)})}load(e,t,n,s){let r=this,a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){let l=Ei.extractUrlBase(e);a=Ei.resolveURL(l,this.path)}else a=Ei.extractUrlBase(e);this.manager.itemStart(e);let o=function(l){s?s(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new er(this.manager);c.setPriority(this.priority),c.setCache(this.cache),c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,a,function(h){t(h),r.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,a={},o={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===np){try{a[qe.KHR_BINARY_GLTF]=new Jh(e)}catch(u){s&&s(u);return}r=JSON.parse(a[qe.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new su(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,priority:this.priority,cache:this.cache,withCredentials:this.withCredentials,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){let u=this.pluginCallbacks[h](l);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){let u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case qe.KHR_MATERIALS_UNLIT:a[u]=new Nh;break;case qe.KHR_DRACO_MESH_COMPRESSION:a[u]=new jh(r,this.dracoLoader);break;case qe.KHR_TEXTURE_TRANSFORM:a[u]=new Qh;break;case qe.KHR_MESH_QUANTIZATION:a[u]=new eu;break;default:d.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}l.setExtensions(a),l.setPlugins(o),l.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function tv(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}function vt(i,e,t){let n=i.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}var qe={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DIFFUSE_ROUGHNESS:"KHR_materials_diffuse_roughness",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Dh=class{constructor(e){this.parser=e,this.name=qe.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],l,h=new Ce(16777215);c.color!==void 0&&h.setRGB(c.color[0],c.color[1],c.color[2],It);let u=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new Ti(h),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new gs(h),l.distance=u;break;case"spot":l=new ta(h),l.distance=u,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),si(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),s=Promise.resolve(l),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(c){return n._getNodeRef(t.cache,o,c)})}},Nh=class{constructor(){this.name=qe.KHR_MATERIALS_UNLIT}getMaterialType(){return _t}extendParams(e,t,n){let s=[];e.color=new Ce(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],It),e.opacity=a[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,Ct))}return Promise.all(s)}},Uh=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},Fh=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return vt(this.parser,e,this.name)!==null?on:null}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(s.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new _e(r,r)}return Promise.all(s)}},Oh=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_DIFFUSE_ROUGHNESS}getMaterialType(e){return vt(this.parser,e,this.name)!==null?on:null}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return t.diffuseRoughness=n.diffuseRoughnessFactor!==void 0?n.diffuseRoughnessFactor:0,n.diffuseRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"diffuseRoughnessMap",n.diffuseRoughnessTexture)),Promise.all(s)}},Bh=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_DISPERSION}getMaterialType(e){return vt(this.parser,e,this.name)!==null?on:null}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}},kh=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return vt(this.parser,e,this.name)!==null?on:null}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessMinimum=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessMaximum=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(s)}},zh=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_SHEEN}getMaterialType(e){return vt(this.parser,e,this.name)!==null?on:null}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(t.sheenColor=new Ce(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],It)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,Ct)),n.sheenRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(s)}},Hh=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return vt(this.parser,e,this.name)!==null?on:null}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&s.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(s)}},Gh=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_VOLUME}getMaterialType(e){return vt(this.parser,e,this.name)!==null?on:null}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let r=n.attenuationColor||[1,1,1];return t.attenuationColor=new Ce().setRGB(r[0],r[1],r[2],It),Promise.all(s)}},Vh=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_IOR}getMaterialType(e){return vt(this.parser,e,this.name)!==null?on:null}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},Wh=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_SPECULAR}getMaterialType(e){return vt(this.parser,e,this.name)!==null?on:null}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));let r=n.specularColorFactor||[1,1,1];return t.specularColor=new Ce().setRGB(r[0],r[1],r[2],It),n.specularColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,Ct)),Promise.all(s)}},Xh=class{constructor(e){this.parser=e,this.name=qe.EXT_MATERIALS_BUMP}getMaterialType(e){return vt(this.parser,e,this.name)!==null?on:null}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&s.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(s)}},qh=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return vt(this.parser,e,this.name)!==null?on:null}extendMaterialParams(e,t){let n=vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&s.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(s)}},Yh=class{constructor(e){this.parser=e,this.name=qe.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}},Kh=class{constructor(e){this.parser=e,this.name=qe.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],c=n.textureLoader;if(o.uri){let l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}},Zh=class{constructor(e){this.parser=e,this.name=qe.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],c=n.textureLoader;if(o.uri){let l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}},Ul=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){let c=s.byteOffset||0,l=s.byteLength||0,h=s.count,u=s.byteStride,d=new Uint8Array(o,c,l);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,d,s.mode,s.filter).then(function(f){return f.buffer}):a.ready.then(function(){let f=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(f),h,u,d,s.mode,s.filter),f})})}else return null}},$h=class{constructor(e){this.name=qe.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let l of s.primitives)if(l.mode!==Pn.TRIANGLES&&l.mode!==Pn.TRIANGLE_STRIP&&l.mode!==Pn.TRIANGLE_FAN&&l.mode!==void 0)return null;let a=n.extensions[this.name].attributes,o=[],c={};for(let l in a)o.push(this.parser.getDependency("accessor",a[l]).then(h=>(c[l]=h,c[l])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(l=>{let h=l.pop(),u=h.isGroup?h.children:[h],d=l[0].count,f=[];for(let g of u){let x=new ze,m=new P,p=new jt,y=new P(1,1,1),M=new gi(g.geometry,g.material,d);for(let E=0;E<d;E++)c.TRANSLATION&&m.fromBufferAttribute(c.TRANSLATION,E),c.ROTATION&&p.fromBufferAttribute(c.ROTATION,E),c.SCALE&&y.fromBufferAttribute(c.SCALE,E),M.setMatrixAt(E,x.compose(m,p,y));let v=null;for(let E in c)if(E==="_COLOR_0"){let T=c[E];M.instanceColor=new mi(T.array,T.itemSize,T.normalized)}else if(E!=="TRANSLATION"&&E!=="ROTATION"&&E!=="SCALE"){if(v===null){let _=M.geometry;v=new Qe,v.name=_.name;for(let b in _.attributes)v.setAttribute(b,_.attributes[b]);for(let b in _.morphAttributes)v.morphAttributes[b]=_.morphAttributes[b];_.index!==null&&v.setIndex(_.index),v.morphTargetsRelative=_.morphTargetsRelative;for(let b of _.groups)v.addGroup(b.start,b.count,b.materialIndex);_.boundingBox!==null&&(v.boundingBox=_.boundingBox.clone()),_.boundingSphere!==null&&(v.boundingSphere=_.boundingSphere.clone()),v.drawRange.start=_.drawRange.start,v.drawRange.count=_.drawRange.count,v.userData=Object.assign({},_.userData),M.geometry=v}let T=c[E];v.setAttribute(E,new mi(T.array,T.itemSize,T.normalized))}at.prototype.copy.call(M,g),this.parser.assignFinalMaterial(M),f.push(M)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}},np="glTF",va=12,jf={JSON:1313821514,BIN:5130562},Jh=class{constructor(e){this.name=qe.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,va),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==np)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-va,r=new DataView(e,va),a=0;for(;a<s;){let o=r.getUint32(a,!0);a+=4;let c=r.getUint32(a,!0);if(a+=4,c===jf.JSON){let l=new Uint8Array(e,va+a,o);this.content=n.decode(l)}else if(c===jf.BIN){let l=va+a;this.body=e.slice(l,l+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},jh=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=qe.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},c={},l={};for(let h in a){let u=nu[h]||h.toLowerCase();o[u]=a[h]}for(let h in e.attributes){let u=nu[h]||h.toLowerCase();if(a[h]!==void 0){let d=n.accessors[e.attributes[h]],f=_r[d.componentType];l[u]=f.name,c[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){s.decodeDracoFile(h,function(f){for(let g in f.attributes){let x=f.attributes[g],m=c[g];m!==void 0&&(x.normalized=m)}u(f)},o,l,It,d)})})}},Qh=class{constructor(){this.name=qe.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let n=Math.cos(e.rotation),s=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*s,e.offset.x,-e.repeat.x*s,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},eu=class{constructor(){this.name=qe.KHR_MESH_QUANTIZATION}},Fl=class extends $n{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let a=0;a!==s;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=o*2,l=o*3,h=s-t,u=(n-t)/h,d=u*u,f=d*u,g=e*l,x=g-l,m=-2*f+3*d,p=f-d,y=1-m,M=p-d+u;for(let v=0;v!==o;v++){let E=a[x+v+o],T=a[x+v+c]*h,_=a[g+v+o],b=a[g+v]*h;r[v]=y*E+M*T+m*_+p*b}return r}},nv=new jt,tu=class extends Fl{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return nv.fromArray(r).normalize().toArray(r),r}},Pn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},_r={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Qf={9728:bt,9729:St,9984:ko,9985:ar,9986:ys,9987:An},ep={33071:wn,33648:Hs,10497:ki},Ph={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},nu={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Zi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},iv={CUBICSPLINE:void 0,LINEAR:ls,STEP:os},Ih={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function sv(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new qt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Qn})),i.DefaultMaterial}function Ss(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function si(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function rv(i,e,t){let n=!1,s=!1,r=!1;for(let l=0,h=e.length;l<h;l++){let u=e[l];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(s=!0),u.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let a=[],o=[],c=[];for(let l=0,h=e.length;l<h;l++){let u=e[l];if(n){let d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):i.attributes.position;a.push(d)}if(s){let d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):i.attributes.normal;o.push(d)}if(r){let d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):i.attributes.color;c.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c)]).then(function(l){let h=l[0],u=l[1],d=l[2];return n&&(i.morphAttributes.position=h),s&&(i.morphAttributes.normal=u),r&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function av(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function ov(i){let e,t=i.extensions&&i.extensions[qe.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Lh(t.attributes):e=i.indices+":"+Lh(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Lh(i.targets[n]);return e}function Lh(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function iu(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function lv(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var cv=new ze,su=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new tv,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,a=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){let o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;let c=o.match(/Version\/(\d+)/);s=n&&c?parseInt(c[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&a<98?(this.textureLoader=new ea(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)):(this.textureLoader=new na(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setWithCredentials(this.options.withCredentials),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new er(this.options.manager),this.fileLoader.setPriority(this.options.priority),this.fileLoader.setCache(this.options.cache),this.fileLoader.setResponseType("arraybuffer"),(this.options.withCredentials||this.options.crossOrigin==="use-credentials")&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){let o={scene:a[0][s.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:s.asset,parser:n,userData:{}};return Ss(r,o,s),si(o,s),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(o)})).then(function(){for(let c of o.scenes)c.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let a=t[s].joints;for(let o=0,c=a.length;o<c;o++)e[a[o]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let a=e[s];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(a,o)=>{let c=this.associations.get(a);c!=null&&this.associations.set(o,c);for(let[l,h]of a.children.entries())r(h,o.children[l])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[qe.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,a){n.load(Ei.resolveURL(t.uri,s.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let a=Ph[s.type],o=_r[s.componentType],c=s.normalized===!0,l=new o(s.count*a);return Promise.resolve(new Wt(l,a,c))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(a){let o=a[0],c=Ph[s.type],l=_r[s.componentType],h=l.BYTES_PER_ELEMENT,u=h*c,d=s.byteOffset||0,f=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0,x,m;if(f&&f!==u){let p=Math.floor(d/f),y="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+p+":"+s.count,M=t.cache.get(y);M||(x=new l(o,p*f,s.count*f/h),M=new Ys(x,f/h),t.cache.add(y,M)),m=new Ks(M,c,d%f/h,g)}else o===null?x=new l(s.count*c):x=new l(o,d,s.count*c),m=new Wt(x,c,g);if(s.sparse!==void 0){let p=Ph.SCALAR,y=_r[s.sparse.indices.componentType],M=s.sparse.indices.byteOffset||0,v=s.sparse.values.byteOffset||0,E=new y(a[1],M,s.sparse.count*p),T=new l(a[2],v,s.sparse.count*c);o!==null&&(m=new Wt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let _=0,b=E.length;_<b;_++){let L=E[_];if(m.setX(L,T[_*c]),c>=2&&m.setY(L,T[_*c+1]),c>=3&&m.setZ(L,T[_*c+2]),c>=4&&m.setW(L,T[_*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r],o=this.textureLoader;if(a.uri){let c=n.manager.getHandler(a.uri);c!==null&&(o=c)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){let s=this,r=this.json,a=r.textures[e],o=r.images[t],c=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[c])return this.textureCache[c];let l=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);let d=(r.samplers||{})[a.sampler]||{};return h.magFilter=Qf[d.magFilter]||St,h.minFilter=Qf[d.minFilter]||An,h.wrapS=ep[d.wrapS]||ki,h.wrapT=ep[d.wrapT]||ki,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==bt&&h.minFilter!==St,s.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(d=>d.clone());let a=s.images[e],o=self.URL||self.webkitURL,c=a.uri||"",l=!1,h;if(t.isKTX2Loader===!0&&a.bufferView!==void 0)h=n.getDependency("bufferView",a.bufferView).then(function(d){return new Promise(function(f,g){t.parse(d,f,g)})});else{if(a.bufferView!==void 0)c=n.getDependency("bufferView",a.bufferView).then(function(d){l=!0;let f=new Blob([d],{type:a.mimeType});return c=o.createObjectURL(f),c});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");h=Promise.resolve(c).then(function(d){return new Promise(function(f,g){let x=f;t.isImageBitmapLoader===!0&&(x=function(m){let p=new Lt(m);p.needsUpdate=!0,f(p)}),t.load(Ei.resolveURL(d,r.path),x,void 0,g)})})}let u=h.then(function(d){return l===!0&&o.revokeObjectURL(c),si(d,a),d.userData.mimeType=a.mimeType||lv(a.uri),d}).catch(function(d){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),d});return this.sourceCache[e]=u,u}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[qe.KHR_TEXTURE_TRANSFORM]){let o=n.extensions!==void 0?n.extensions[qe.KHR_TEXTURE_TRANSFORM]:void 0;if(o){let c=r.associations.get(a);a=r.extensions[qe.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,c)}}return s!==void 0&&(a.colorSpace=s),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let o="PointsMaterial:"+n.uuid,c=this.cache.get(o);c||(c=new Js,an.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(o,c)),n=c}else if(e.isLine){let o="LineBasicMaterial:"+n.uuid,c=this.cache.get(o);c||(c=new Bn,an.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(o,c)),n=c}if(s||r||a){let o="ClonedMaterial:"+n.uuid+":";s&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let c=this.cache.get(o);c||(c=n.clone(),r&&(c.vertexColors=!0),a&&(c.flatShading=!0),s&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(o,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return qt}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],a,o={},c=r.extensions||{},l=[];if(c[qe.KHR_MATERIALS_UNLIT]){let u=s[qe.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),l.push(u.extendParams(o,r,t))}else{let u=r.pbrMetallicRoughness||{};if(o.color=new Ce(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){let d=u.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],It),o.opacity=d[3]}u.baseColorTexture!==void 0&&l.push(t.assignTexture(o,"map",u.baseColorTexture,Ct)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),l.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=Dt);let h=r.alphaMode||Ih.OPAQUE;if(h===Ih.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===Ih.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==_t&&(l.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new _e(1,1),r.normalTexture.scale!==void 0)){let u=r.normalTexture.scale;o.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&a!==_t&&(l.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==_t){let u=r.emissiveFactor;o.emissive=new Ce().setRGB(u[0],u[1],u[2],It)}return r.emissiveTexture!==void 0&&a!==_t&&l.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,Ct)),Promise.all(l).then(function(){let u=new a(o);return r.name&&(u.name=r.name),si(u,r),t.associations.set(u,{materials:e}),r.extensions&&Ss(s,u,r),u})}createUniqueName(e){let t=lt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(o){return n[qe.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(c){return tp(c,o,t)})}let a=[];for(let o=0,c=e.length;o<c;o++){let l=e[o],h=ov(l),u=s[h];if(u)a.push(u.promise);else{let d;l.extensions&&l.extensions[qe.KHR_DRACO_MESH_COMPRESSION]?d=r(l):d=tp(new Qe,l,t),l.mode===Pn.TRIANGLE_STRIP?d=d.then(f=>Ch(f,da)):l.mode===Pn.TRIANGLE_FAN&&(d=d.then(f=>Ch(f,lr))),s[h]={primitive:l,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let c=0,l=a.length;c<l;c++){let h=a[c].material===void 0?sv(this.cache):this.getDependency("material",a[c].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(async function(c){let l=c.slice(0,c.length-1),h=c[c.length-1],u=[];for(let f=0,g=h.length;f<g;f++){let x=h[f],m=a[f],p,y=l[f];if(m.mode===Pn.TRIANGLES||m.mode===Pn.TRIANGLE_STRIP||m.mode===Pn.TRIANGLE_FAN||m.mode===void 0){let M=r.isSkinnedMesh===!0,v=x.hasAttribute("skinIndex")&&x.hasAttribute("skinWeight");M&&v===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),p=M&&v?new Gr(x,y):new Ne(x,y),p.isSkinnedMesh===!0&&p.normalizeSkinWeights()}else if(m.mode===Pn.LINES)p=new _i(x,y);else if(m.mode===Pn.LINE_STRIP)p=new kn(x,y);else if(m.mode===Pn.LINE_LOOP)p=new Wr(x,y);else if(m.mode===Pn.POINTS)p=new hs(x,y);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&av(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),si(p,r),m.extensions&&Ss(s,p,m),t.assignFinalMaterial(p),u.push(p)}for(let f=0,g=u.length;f<g;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&Ss(s,u[0],r),u[0];let d=new ct;r.extensions&&Ss(s,d,r),t.associations.set(d,{meshes:e});for(let f=0,g=u.length;f<g;f++)d.add(u[f]);return d})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Pt(ht.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new wi(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),si(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),a=s,o=[],c=[];for(let l=0,h=a.length;l<h;l++){let u=a[l];if(u){o.push(u);let d=new ze;r!==null&&d.fromArray(r.array,l*16),c.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Vr(o,c)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,a=[],o=[],c=[],l=[],h=[];for(let u=0,d=s.channels.length;u<d;u++){let f=s.channels[u],g=s.samplers[f.sampler],x=f.target,m=x.node,p=s.parameters!==void 0?s.parameters[g.input]:g.input,y=s.parameters!==void 0?s.parameters[g.output]:g.output;x.node!==void 0&&(a.push(this.getDependency("node",m)),o.push(this.getDependency("accessor",p)),c.push(this.getDependency("accessor",y)),l.push(g),h.push(x))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c),Promise.all(l),Promise.all(h)]).then(function(u){let d=u[0],f=u[1],g=u[2],x=u[3],m=u[4],p=[];for(let M=0,v=d.length;M<v;M++){let E=d[M],T=f[M],_=g[M],b=x[M],L=m[M];if(E===void 0)continue;E.updateMatrix&&E.updateMatrix();let A=n._createAnimationTracks(E,T,_,b,L);if(A)for(let N=0;N<A.length;N++)p.push(A[N])}let y=new Qr(r,void 0,p);return si(y,s),y})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let a=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let c=0,l=s.weights.length;c<l;c++)o.morphTargetInfluences[c]=s.weights[c]}),a})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=s.children||[];for(let l=0,h=o.length;l<h;l++)a.push(n.getDependency("node",o[l]));let c=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(a),c]).then(function(l){let h=l[0],u=l[1],d=l[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,cv)});for(let f=0,g=u.length;f<g;f++)h.add(u[f]);if(h.userData.pivot!==void 0&&u.length>0){let f=h.userData.pivot,g=u[0];h.pivot=new P().fromArray(f),h.position.x-=f[0],h.position.y-=f[1],h.position.z-=f[2],g.position.set(0,0,0),delete h.userData.pivot}return h})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],a=r.name?s.createUniqueName(r.name):"",o=[],c=s._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&o.push(c),r.camera!==void 0&&o.push(s.getDependency("camera",r.camera).then(function(l){return s._getNodeRef(s.cameraCache,r.camera,l)})),s._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){o.push(l)}),this.nodeCache[e]=Promise.all(o).then(function(l){let h;if(r.isBone===!0?h=new Zs:l.length>1?h=new ct:l.length===1?h=l[0]:h=new at,h!==l[0])for(let u=0,d=l.length;u<d;u++)h.add(l[u]);if(r.name&&(h.userData.name=r.name,h.name=a),si(h,r),r.extensions&&Ss(n,h,r),r.matrix!==void 0){let u=new ze;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!s.associations.has(h))s.associations.set(h,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){let u=s.associations.get(h);s.associations.set(h,{...u})}return s.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new ct;n.name&&(r.name=s.createUniqueName(n.name)),si(r,n),n.extensions&&Ss(t,r,n);let a=n.nodes||[],o=[];for(let c=0,l=a.length;c<l;c++)o.push(s.getDependency("node",a[c]));return Promise.all(o).then(function(c){for(let h=0,u=c.length;h<u;h++){let d=c[h];d.parent!==null?r.add($f(d)):r.add(d)}let l=h=>{let u=new Map;for(let[d,f]of s.associations)(d instanceof an||d instanceof Lt)&&u.set(d,f);return h.traverse(d=>{let f=s.associations.get(d);f!=null&&u.set(d,f)}),u};return s.associations=l(r),r})}_createAnimationTracks(e,t,n,s,r){let a=[],o=e.name?e.name:e.uuid,c=[];function l(f){f.morphTargetInfluences&&c.push(f.name?f.name:f.uuid)}Zi[r.path]===Zi.weights?(l(e),e.isGroup&&e.children.forEach(l)):c.push(o);let h;switch(Zi[r.path]){case Zi.weights:h=bi;break;case Zi.rotation:h=Si;break;case Zi.translation:case Zi.scale:h=Wi;break;default:switch(n.itemSize){case 1:h=bi;break;case 2:case 3:default:h=Wi;break}break}let u=s.interpolation!==void 0?iv[s.interpolation]:ls,d=this._getArrayFromAccessor(n);for(let f=0,g=c.length;f<g;f++){let x=new h(c[f]+"."+Zi[r.path],t.array,d,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(x),a.push(x)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=iu(t.constructor),s=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof Si?tu:Fl;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function hv(i,e,t){let n=e.attributes,s=new Xt;if(n.POSITION!==void 0){let o=t.json.accessors[n.POSITION],c=o.min,l=o.max;if(c!==void 0&&l!==void 0){if(s.set(new P(c[0],c[1],c[2]),new P(l[0],l[1],l[2])),o.normalized){let h=iu(_r[o.componentType]);s.min.multiplyScalar(h),s.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let o=new P,c=new P;for(let l=0,h=r.length;l<h;l++){let u=r[l];if(u.POSITION!==void 0){let d=t.json.accessors[u.POSITION],f=d.min,g=d.max;if(f!==void 0&&g!==void 0){if(c.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),c.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),c.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),d.normalized){let x=iu(_r[d.componentType]);c.multiplyScalar(x)}o.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(o)}i.boundingBox=s;let a=new cn;s.getCenter(a.center),a.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=a}function tp(i,e,t){let n=e.attributes,s=[];function r(a,o){return t.getDependency("accessor",a).then(function(c){i.setAttribute(o,c)})}for(let a in n){let o=nu[a]||a.toLowerCase();o in i.attributes||s.push(r(n[a],o))}if(e.indices!==void 0&&!i.index){let a=t.getDependency("accessor",e.indices).then(function(o){i.setIndex(o)});s.push(a)}return Xe.workingColorSpace!==It&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Xe.workingColorSpace}" not supported.`),si(i,e),hv(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?rv(i,e.targets,t):i})}var ip={type:"change"},au={type:"start"},rp={type:"end"},Ol=new pi,sp=new gn,uv=Math.cos(70*ht.DEG2RAD),Ft=new P,fn=2*Math.PI,tt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},ru=1e-6,Bl=class extends ia{constructor(e,t=null){super(e,t),this.state=tt.NONE,this.target=new P,this.cursor=new P,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Xi.ROTATE,MIDDLE:Xi.DOLLY,RIGHT:Xi.PAN},this.touches={ONE:qi.ROTATE,TWO:qi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new P,this._lastQuaternion=new jt,this._lastTargetPosition=new P,this._quat=new jt().setFromUnitVectors(e.up,new P(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new jn,this._sphericalDelta=new jn,this._scale=1,this._panOffset=new P,this._rotateStart=new _e,this._rotateEnd=new _e,this._rotateDelta=new _e,this._panStart=new _e,this._panEnd=new _e,this._panDelta=new _e,this._dollyStart=new _e,this._dollyEnd=new _e,this._dollyDelta=new _e,this._dollyDirection=new P,this._mouse=new _e,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=fv.bind(this),this._onPointerDown=dv.bind(this),this._onPointerUp=pv.bind(this),this._onContextMenu=bv.bind(this),this._onMouseWheel=_v.bind(this),this._onKeyDown=xv.bind(this),this._onTouchStart=yv.bind(this),this._onTouchMove=vv.bind(this),this._onMouseDown=mv.bind(this),this._onMouseMove=gv.bind(this),this._interceptControlDown=Sv.bind(this),this._interceptControlUp=Mv.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=tt.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(ip),this.update(),this.state=tt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Ft.copy(t).sub(this.target),Ft.applyQuaternion(this._quat),this._spherical.setFromVector3(Ft),this.autoRotate&&this.state===tt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=fn:n>Math.PI&&(n-=fn),s<-Math.PI?s+=fn:s>Math.PI&&(s-=fn),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Ft.setFromSpherical(this._spherical),Ft.applyQuaternion(this._quatInverse),t.copy(this.target).add(Ft),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Ft.length();a=this._clampDistance(o*this._scale);let c=o-a;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){let o=new P(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;let l=new P(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(o),this.object.updateMatrixWorld(),a=Ft.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Ol.origin.copy(this.object.position),Ol.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ol.direction))<uv?this.object.lookAt(this.target):(sp.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ol.intersectPlane(sp,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>ru||8*(1-this._lastQuaternion.dot(this.object.quaternion))>ru||this._lastTargetPosition.distanceToSquared(this.target)>ru?(this.dispatchEvent(ip),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?fn/60*this.autoRotateSpeed*e:fn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Ft.setFromMatrixColumn(t,0),Ft.multiplyScalar(-e),this._panOffset.add(Ft)}_panUp(e,t){this.screenSpacePanning===!0?Ft.setFromMatrixColumn(t,1):(Ft.setFromMatrixColumn(t,0),Ft.crossVectors(this.object.up,Ft)),Ft.multiplyScalar(e),this._panOffset.add(Ft)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Ft.copy(s).sub(this.target);let r=Ft.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientY),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(fn*this._rotateDelta.x/t.clientHeight),this._rotateUp(fn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(fn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-fn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(fn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-fn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(fn*this._rotateDelta.x/t.clientHeight),this._rotateUp(fn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new _e,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function dv(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function fv(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function pv(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(rp),this.state=tt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function mv(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Xi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=tt.DOLLY;break;case Xi.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=tt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=tt.ROTATE}break;case Xi.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=tt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=tt.PAN}break;default:this.state=tt.NONE}this.state!==tt.NONE&&this.dispatchEvent(au)}function gv(i){switch(this.state){case tt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case tt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case tt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function _v(i){this.enabled===!1||this.enableZoom===!1||this.state!==tt.NONE||(i.preventDefault(),this.dispatchEvent(au),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(rp))}function xv(i){this.enabled!==!1&&this._handleKeyDown(i)}function yv(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case qi.ROTATE:if(this.enableRotate===!1){this.state=tt.NONE;break}this._handleTouchStartRotate(i),this.state=tt.TOUCH_ROTATE;break;case qi.PAN:if(this.enablePan===!1){this.state=tt.NONE;break}this._handleTouchStartPan(i),this.state=tt.TOUCH_PAN;break;default:this.state=tt.NONE}break;case 2:switch(this.touches.TWO){case qi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=tt.TOUCH_DOLLY_PAN;break;case qi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=tt.TOUCH_DOLLY_ROTATE;break;default:this.state=tt.NONE}break;default:this.state=tt.NONE}this.state!==tt.NONE&&this.dispatchEvent(au)}function vv(i){switch(this._trackPointer(i),this.state){case tt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case tt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case tt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case tt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=tt.NONE}}function bv(i){this.enabled!==!1&&i.preventDefault()}function Sv(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Mv(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var kl=class extends On{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new hn;e.deleteAttribute("uv");let t=new qt({side:Yt}),n=new qt,s=new gs(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Ne(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let a=new gi(e,n,6),o=new at;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let c=new Ne(e,xr(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);let l=new Ne(e,xr(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let h=new Ne(e,xr(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new Ne(e,xr(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new Ne(e,xr(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new Ne(e,xr(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function xr(i){return new $r({color:0,emissive:16777215,emissiveIntensity:i})}async function ou(i){let e=new Nl;if(location.protocol!=="file:")return e.loadAsync("public/hardware/"+i+".glb");window.ramsBoards?.[i]||await new Promise((s,r)=>{let a=document.createElement("script");a.src="assets/"+i+".js",a.onload=s,a.onerror=r,document.head.append(a)});let t=Uint8Array.from(atob(window.ramsBoards[i]),s=>s.charCodeAt(0)),n=new Blob([t]).stream().pipeThrough(new DecompressionStream("gzip"));return e.parseAsync(await new Response(n).arrayBuffer(),"")}function ap(i,e,t){let n=new ur({alpha:!0,antialias:!0,powerPreference:"low-power"}),s=new On,r=new Pt(32,1,.01,100),a=new Bl(r,n.domElement);a.enablePan=!1,a.minDistance=2.2,a.maxDistance=8,n.setPixelRatio(Math.min(devicePixelRatio||1,1.8)),n.setClearColor(0,0),n.toneMapping=ra,n.toneMappingExposure=.96,n.domElement.setAttribute("aria-label","Rotatable CAD model"),n.domElement.style.visibility="hidden",i.append(n.domElement);let o=new hr(n),c=new kl,l=o.fromScene(c,.04,.1,100,{size:64});s.environment=l.texture,s.environmentIntensity=.85,c.dispose(),o.dispose(),s.add(new ps(15793407,10203575,.92));let h=new Ti(16773338,1.65);h.position.set(3,5,2),s.add(h);let u=!1,d=!1,f=0,g=matchMedia("(prefers-reduced-motion: reduce)"),x=()=>{u||n.render(s,r)};function m(){cancelAnimationFrame(f),f=0}function p(T=!1,_=!0){m(),d=T;let b=4.8*Math.max(1,1.1/r.aspect);a.target.set(0,0,0);let L=new P(.46,T?-1.14:1.14,.78).normalize().multiplyScalar(b);if(!_||g.matches){r.position.copy(L),a.update(),x();return}let A=new jn().setFromVector3(r.position),N=new jn().setFromVector3(L),F=ht.euclideanModulo(N.theta-A.theta+Math.PI,2*Math.PI)-Math.PI,B=performance.now();function I(k){let V=Math.min(1,(k-B)/620),z=V*V*(3-2*V);r.position.setFromSphericalCoords(ht.lerp(A.radius,N.radius,z),ht.lerp(A.phi,N.phi,z),A.theta+F*z),a.update(),x(),V<1&&(f=requestAnimationFrame(I))}f=requestAnimationFrame(I)}function y(){let T=i.getBoundingClientRect();T.width<1||T.height<1||(n.setSize(T.width,T.height,!1),r.aspect=T.width/T.height,r.updateProjectionMatrix(),x())}function M(T){let _=new Set,b=new Set,L=new Set;T.traverse(A=>{A.geometry&&_.add(A.geometry);for(let N of[].concat(A.material||[])){b.add(N);for(let F of Object.values(N))F?.isTexture&&L.add(F)}});for(let A of[..._,...b,...L])A.dispose()}let v=new ResizeObserver(y);v.observe(i),a.addEventListener("change",x),a.addEventListener("start",m),y(),p(!1,!1);let E;return ou(e).then(T=>{if(u){M(T.scene);return}E=T.scene;let _=new Xt().setFromObject(E),b=_.getSize(new P),L=_.getCenter(new P),A=new ct;if(A.add(E),E.position.sub(L),A.scale.setScalar(2/Math.max(b.x,b.y,b.z)),s.add(A),x(),n.domElement.style.visibility="",i.querySelector("img").hidden=!0,!g.matches){let N=new jn().setFromVector3(r.position);N.theta-=.35,N.phi-=.14,r.position.setFromSpherical(N),a.update(),p()}t("Drag to orbit \xB7 scroll to zoom",!0)}).catch(()=>{u||t("CAD still \xB7 interactive model unavailable",!1)}),{flip:()=>p(!d),reset:()=>p(!1),dispose(){u=!0,m(),v.disconnect(),a.dispose(),E&&M(E),l.dispose(),n.dispose(),n.forceContextLoss(),n.domElement.remove()}}}function op(){let i=new qt({color:5928578,metalness:.82,roughness:.28}),e=new qt({color:1911089,metalness:.88,roughness:.22}),t=new qt({color:2241855,roughness:.45,metalness:.35}),n=new qt({color:1318694,roughness:.42}),s=new qt({color:2255714,roughness:.48}),r=new qt({color:15710568,metalness:.75,roughness:.3}),a=new _t({color:7595480}),o=new _t({color:16757575}),c=new Gi(1,14,10);function l(B,I,k,V,z=0){let j=z?new Dl(...V,2,z):new hn(...V),C=new Ne(j,I);return C.position.set(...k),B.add(C),C}function h(B,I,k,V,z=a,j=.14){let C=new Ne(c,z);return C.position.set(I,k,V),C.scale.setScalar(j),B.add(C),C}function u(B,I,k,V,z){let j=document.createElement("canvas");j.width=B==="phone"?440:880,j.height=B==="phone"?760:495;let C=j.getContext("2d"),H=j.width,Y=j.height;C.fillStyle="#0a161d",C.fillRect(0,0,H,Y);let ie=(ae,le,te,re=18,Te="#c0e7e9",Ke=!0)=>{C.fillStyle=Te,C.font=(Ke?"600 ":"400 ")+re+"px sans-serif",C.fillText(ae,le,te)};if(B==="phone"){C.fillStyle="#102732",C.fillRect(0,0,H,56),ie("RAMS \xB7 ACTIVE",20,36,20,"#75e6d8"),ie("94% \xB7 5G",H-100,36,17,"#88a8b1",!1),C.fillStyle="#0f2029",C.beginPath(),C.roundRect(16,74,H-32,290,12),C.fill(),C.strokeStyle="#1d3947",C.lineWidth=1,C.stroke(),ie("50 Hz ACCELEROMETER STREAM",32,106,15,"#7ee4d8"),ie("SVM: 7.2G (CRASH SPIKE)",H-210,106,14,"#ffb84d"),C.strokeStyle="#17313d",C.lineWidth=1;for(let le=32;le<H-32;le+=36)C.beginPath(),C.moveTo(le,124),C.lineTo(le,340),C.stroke();for(let le=130;le<340;le+=42)C.beginPath(),C.moveTo(32,le),C.lineTo(H-32,le),C.stroke();C.strokeStyle="#5de4d7",C.lineWidth=3.5,C.beginPath();let ae=[.98,1.02,.99,1.01,.97,1.04,.99,1.01,.98,1.05,1.12,1.45,.22,.18,7.21,6.95,4.12,1.88,1.25,1.05,1.01,.99,1,.99,1.01];ae.forEach((le,te)=>{let re=32+te*(H-64)/(ae.length-1),Te=295-le/8*160;te===0?C.moveTo(re,Te):C.lineTo(re,Te)}),C.stroke(),C.fillStyle="#0f2029",C.beginPath(),C.roundRect(16,380,H-32,180,12),C.fill(),C.strokeStyle="#1d3947",C.stroke(),ie("GNSS POSITION & BLE RELAY",32,412,15,"#7ee4d8"),ie("17.6542287\xB0 N, 121.7445909\xB0 E",32,446,20,"#d1f4f0"),ie("Enrile Boulevard \xB7 Fix Accuracy: 2.1 m",32,474,15,"#88a8b1",!1),C.fillStyle="#183c48",C.beginPath(),C.roundRect(32,498,160,36,6),C.fill(),ie("BLE NUS: 247 MTU",44,522,14,"#7ee4d8"),C.fillStyle="#3a2e1c",C.beginPath(),C.roundRect(204,498,200,36,6),C.fill(),ie("STATUS: BROADCASTING",214,522,14,"#ffb84d"),C.fillStyle="#173642",C.beginPath(),C.roundRect(16,576,H-32,150,12),C.fill(),C.strokeStyle="#ffb347",C.lineWidth=2,C.stroke(),C.fillStyle="#ffb84d",C.fillRect(16,576,10,150),ie("ACCIDENT EVENT CONFIRMED",42,616,20,"#ffe8ba"),ie("LiteRT 1D-CNN + G-Threshold Triggered",42,646,15,"#d3ba92",!1),ie("Relayed 26-Byte Packet to Wearable LoRa TX",42,680,15,"#7ee4d8")}else C.fillStyle="#0f242e",C.fillRect(0,0,H,58),ie("RAMS EMERGENCY OPERATIONS CENTER",24,38,22,"#7ee4d8"),ie("STATION-01 \xB7 COM3: 115200 8N1 \xB7 RSSI: -84 dBm \xB7 CRC: OK",H-460,38,15,"#88a8b1",!1),C.fillStyle="#08171f",C.beginPath(),C.roundRect(20,76,490,396,10),C.fill(),C.strokeStyle="#183441",C.lineWidth=1,C.stroke(),ie("TOPOLOGICAL INCIDENT MAP",38,108,15,"#7ee4d8"),ie("Tuguegarao City Sector 3",38,130,13,"#6e8f99",!1),C.strokeStyle="#224656",C.lineWidth=14,C.beginPath(),C.moveTo(38,380),C.bezierCurveTo(150,380,190,220,310,240),C.bezierCurveTo(410,260,440,160,480,150),C.stroke(),C.strokeStyle="#2c596d",C.lineWidth=2,C.stroke(),C.strokeStyle="#224656",C.lineWidth=10,C.beginPath(),C.moveTo(250,430),C.lineTo(250,110),C.stroke(),C.fillStyle="#6fe2d7",C.beginPath(),C.arc(100,220,8,0,Math.PI*2),C.fill(),ie("STATION TOWER",116,226,14,"#6fe2d7"),C.strokeStyle="#f3bd74",C.lineWidth=2.5,C.setLineDash([6,6]),C.beginPath(),C.moveTo(100,220),C.lineTo(320,242),C.stroke(),C.setLineDash([]),ie("LoRa 433 MHz (1.42 km)",170,218,13,"#f3bd74"),C.fillStyle="#ff5e5e",C.beginPath(),C.arc(320,242,9,0,Math.PI*2),C.fill(),C.strokeStyle="#ffb347",C.lineWidth=2,C.beginPath(),C.arc(320,242,18,0,Math.PI*2),C.stroke(),ie("INCIDENT BEACON",344,247,14,"#ffb347"),C.fillStyle="#08171f",C.beginPath(),C.roundRect(526,76,334,396,10),C.fill(),C.strokeStyle="#183441",C.stroke(),ie("26-BYTE PAYLOAD INSPECTOR",544,108,15,"#7ee4d8"),[["PACKET TYPE","0x01 (ACCIDENT_ALERT)"],["DEVICE TOKEN","DEMO-041 (LINA CRUZ)"],["VEHICLE / ROLE","COMMUTER MOTORCYCLE"],["PEAK FORCE","7.21 G-FORCE (IMPACT)"],["TILT ANGLE","64.2\xB0 DEVIATION"],["COORDINATES","17.6542287, 121.7445909"],["TIMESTAMP","14:06:00 UTC+8"]].forEach(([le,te],re)=>{let Te=142+re*34;C.fillStyle="#10232d",C.fillRect(544,Te-18,298,28),ie(le,552,Te,12,"#699aa7",!1),ie(te,660,Te,13,re===3?"#ffb84d":"#cef5f1")}),C.fillStyle="#0b1b22",C.fillRect(544,384,298,72),ie("RAW SERIAL FRAME [USB-CDC]:",552,404,11,"#537d8a",!1),ie("AA 01 29 00 11 0E 00 00 A4 78 ... [CRC:OK]",552,426,12,"#6fe2d7"),ie("DISPATCH: EMERGENCY SERVICES NOTIFIED",552,446,12,"#ffb84d");let we=new qr(j);we.colorSpace=It;let Z=new Ne(new yi(I,k),new _t({map:we}));return Z.position.z=V,z.add(Z),we}let d=new ct;l(d,e,[0,0,0],[4.15,8.1,.42],.38),l(d,t,[0,0,-.21],[3.95,7.9,.04],.32);let f=l(d,e,[-1.05,2.75,-.26],[1.45,1.85,.12],.15);for(let B of[.45,-.45]){let I=new Ne(new Zn(.38,.38,.08,24),i);I.rotation.x=Math.PI/2,I.position.set(0,B,-.06),f.add(I);let k=new Ne(new js(.24,20),n);k.position.set(0,B,-.11),f.add(k)}l(d,i,[2.1,1.6,0],[.08,.85,.16],.03),l(d,i,[-2.1,2.1,0],[.08,.65,.16],.03),l(d,i,[-2.1,1.3,0],[.08,.65,.16],.03),l(d,n,[0,0,.2],[3.85,7.8,.04],.28);let g=u("phone",3.65,7.42,.23,d),x=new Ne(new js(.08,16),n);x.position.set(0,3.48,.235),d.add(x),d.rotation.set(-.11,-.42,-.035);let m=new ct,p=new ct;l(p,s,[0,0,0],[5.6,4.47,.29],.14),l(p,n,[-1.38,.23,.26],[1.95,3.14,.29],.12),l(p,i,[-1.38,1.88,.48],[1.12,.63,.55],.12),l(p,i,[1.16,.4,.37],[1.9,2.17,.55],.15),l(p,r,[2.59,.68,.13],[.41,.43,.43],.09);let y=new Ne(new Zn(.38,.38,.35,20),n);y.position.set(1.9,-1.58,.33),y.rotation.x=Math.PI/2,p.add(y),m.add(p);let M=h(m,-1.33,-1.49,.42,a,.16);ou("prototype").then(B=>{let I=B.scene;I.traverse(C=>{C.isMesh&&(C.castShadow=!0,C.receiveShadow=!0)});let k=new Xt().setFromObject(I),V=k.getSize(new P),z=k.getCenter(new P);I.position.sub(z);let j=new ct;j.add(I),j.rotation.x=-Math.PI/2,j.scale.setScalar(5.5/Math.max(V.x,V.z)),j.position.set(0,0,.16),p.visible=!1,m.add(j)}).catch(()=>{}),m.rotation.set(-.53,-.28,-.08);let v=new ct,E=l(v,e,[0,-3.42,.3],[5.2,.24,3.2],.12),T=l(v,i,[0,-2.1,-.15],[.85,2.6,.42],.08);T.rotation.x=.12;let _=l(v,e,[-1.75,-3.05,.55],[2.1,.58,1.6],.08);l(_,n,[0,.22,.12],[1.7,.14,1.1],.04);let b=new Ne(new Zn(.08,.065,3.1,16),n);b.position.set(-.68,1.6,.45),_.add(b);let L=new Ne(new Zn(.12,.12,.28,12),r);L.position.set(-.68,.15,.45),_.add(L),h(_,.35,.32,.55,a,.08),h(_,.65,.32,.55,o,.08);let A=new Qs([new P(-1.1,-3.05,.55),new P(-.6,-2.9,.1),new P(-.15,-2.3,-.1),new P(0,-1.2,-.2)]),N=new Ne(new Vi(A,20,.045,6,!1),n);v.add(N),l(v,e,[0,0,0],[9.8,5.8,.32],.18),l(v,n,[0,0,.15],[9.6,5.6,.06],.1);let F=u("desk",9.35,5.35,.19,v);return h(v,4.25,-2.62,.18,a,.09),v.rotation.y=-.28,{phone:d,wearable:m,desk:v,wearableLed:M,textures:[g,F]}}var $i=(i,e,t)=>new Ce().setRGB(i,e,t);function wv(){let i=new ct;i.position.copy(gr);let e=[],t=[],n=(g,x)=>{let m=Math.PI*2*g/3+.3,p=1.1-x*.21;return[Math.cos(m)*p,x*2,Math.sin(m)*p]};for(let g=0;g<3;g++){for(let m=0;m<4;m++){let p=n(g,m),y=n(g+1,m);e.push(...p,...n(g,m+1),...p,...y,...y,...n(g,m+1))}let x=g*Math.PI*2/3+.56;t.push(0,6.2,0,3.55*Math.cos(x),0,3.55*Math.sin(x))}e.push(0,8,0,0,11.4,0,-.88,8.15,0,.88,8.15,0);let s=(g,x,m)=>new _i(new Qe().setAttribute("position",new Ue(g,3)),new Bn({color:x,transparent:!0,opacity:m,depthWrite:!1})),r=new gi(new Zn(1,1,1,5),new _t({color:$i(.46,.74,.73)}),e.length/6),a=new P,o=new P,c=new P(0,1,0),l=new at;for(let g=0;g<e.length;g+=6){a.fromArray(e,g),o.fromArray(e,g+3),l.position.copy(a).lerp(o,.5);let x=o.sub(a).length();l.quaternion.setFromUnitVectors(c,o.normalize()),l.scale.set(.065,x,.065),l.updateMatrix(),r.setMatrixAt(g/6,l.matrix)}let h=s(t,$i(.39,.68,.64),.55);r.renderOrder=h.renderOrder=12,i.add(r,h);let u=new Ne(new hn(1.22,1.85,.82),new _t({color:$i(.27,.46,.46)}));u.position.set(.63,1.66,.35),i.add(u);let d=new Ne(new us(.53),new _t({color:$i(.58,.97,.94)}));d.position.y=11.4,i.add(d);let f=new Ne(new ds(2.23,2.42,64),new _t({color:$i(.32,.9,.88),side:Dt,transparent:!0,opacity:.9}));return f.rotation.x=-Math.PI/2,f.position.y=.38,i.add(f),i}function lp(){let i=new ct,e=op();e.phone.position.copy(Ki).add(new P(-6.6,6.1,.7)),e.wearable.position.copy(Ki).add(new P(3.2,5.3,-.4)),e.desk.position.copy(gr).add(new P(7.4,6.4,4.2));let t=e.wearable.position.clone().add(new P(2.4,.8,0)),n=gr.clone().add(new P(0,11.4,0)),s=t.clone().lerp(n,.53);s.y=Math.max(t.y,n.y)+15;let r=new Hi(t,s,n),a={value:0},o={value:.15},c=(B,I)=>new Ne(new Vi(r,88,B,8,!1),new Mt({uniforms:{stage:a,progress:o,glow:{value:I}},transparent:!0,depthWrite:!1,vertexShader:`
        varying float along;
        void main() { along = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,fragmentShader:`
        varying float along; uniform float stage, progress, glow;
        void main() {
          vec3 tint = mix(vec3(1.0, 0.63, 0.19), vec3(0.29, 0.92, 0.92), smoothstep(0.20, 0.73, along));
          float dash = smoothstep(0.18, 0.36, fract(along * 22.0));
          float opacity = (0.05 + dash * 0.32) * (0.65 + stage * 0.15);
          if (stage > 1.5) opacity = 0.51 + 0.41 * (1.0 - smoothstep(progress, progress + 0.025, along));
          if (stage > 2.5) opacity = 0.94;
          gl_FragColor = vec4(tint, opacity * glow);
        }
      `})),l=new ct;l.add(new Ne(new Gi(.68,12,8),new _t({color:$i(1,.98,.8)}))),l.add(new Ne(new Gi(1.12,16,8),new _t({color:$i(.85,.98,.86),transparent:!0,opacity:.16,depthWrite:!1})));let h=c(.52,.16),u=c(.15,1);h.renderOrder=9,u.renderOrder=10,l.renderOrder=11;let d=(B,I,k)=>{let V=B.clone().lerp(I,.5);return V.y+=k,new Hi(B,V,I)},f=d(e.phone.position.clone().add(new P(1.8,0,.1)),e.wearable.position.clone().add(new P(-2.2,0,.4)),1.5),g=d(gr.clone().add(new P(.7,1.25,.75)),e.desk.position.clone().add(new P(-3.4,-1.7,0)),-1.7),x=(B,I)=>new Ne(new Vi(B,24,.105,5,!1),new _t({color:I})),m=new kn(new Qe().setFromPoints(f.getPoints(56)),new Jr({color:$i(.41,.94,.83),dashSize:.43,gapSize:.23}));m.computeLineDistances(),m.renderOrder=12;let p=x(g,14592886),y=new Ti(16768941,2.9);y.position.set(-24,57,43);let M=new ps(13625579,3359565,1.85),v=wv();i.add(v,h,u,l,m,p,e.phone,e.wearable,e.desk,y,M);let E=t.clone().lerp(n,.51);E.y+=4;let T=gr.clone().add(new P(0,6.3,0)),_=e.phone.position.clone().add(new P(1.7,0,0)),b=e.wearable.position.clone().add(new P(-1.55,0,0)),L=e.desk.position.clone().add(new P(-1.55,-.35,0)),A={focus:new P,span:16,azimuth:-.4,elevation:.32,settled:!1},N=ht.smoothstep,F=0;return{root:i,setStep(B,I){F=I,a.value=B,h.visible=u.visible=B===2,m.visible=B===1,p.visible=B===3},update(B,I){let k=I?12:Math.max(0,B-F),V=a.value,z=V===2?N(k,.75,2.9):N(k,.28,1.45);if(A.settled=k>(V===2?4.9:3.1),l.visible=V>0&&z>0&&z<1,l.scale.setScalar(V===2?1:.47),e.wearableLed.scale.setScalar(.14+(V===1?.15*Math.sin(Math.PI*z):0)),V===0)A.focus.copy(_),A.span=15.6,A.azimuth=-.32,A.elevation=.28;else if(V===1)f.getPoint(z,l.position),A.focus.copy(b),A.span=14.4,A.azimuth=-.36,A.elevation=.43;else if(V===2){r.getPointAt(z,l.position),o.value=z;let j=N(k,2.18,3.65);A.focus.copy(E).lerp(T,j),A.span=ht.lerp(43,24,j),A.azimuth=ht.lerp(-.66,-.42,j),A.elevation=ht.lerp(.48,.37,j)}else g.getPoint(z,l.position),A.focus.copy(L),A.span=15.6,A.azimuth=-.33,A.elevation=.31;return V!==2&&(A.span+=2.6*(1-N(k,.2,1.45))),A},dispose(){e.textures.forEach(B=>B.dispose())}}}function Tv(){let i=new ct;i.position.copy(Ki);let e=new Ce().setRGB(1,.64,.22),t=new _t({color:e,transparent:!0,opacity:.85,depthWrite:!1,side:Dt}),n=new Ne(new yi(16,16),new Mt({transparent:!0,depthWrite:!1,side:Dt,vertexShader:"varying vec2 st; void main(){st=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:"varying vec2 st; void main(){float d=length(st-0.5)*2.0;gl_FragColor=vec4(1.0,0.51,0.11,0.30*exp(-d*d*6.3)*(1.0-smoothstep(0.65,1.0,d)));}"}));n.rotation.x=-Math.PI/2,n.position.y=.2,n.renderOrder=6,i.add(n);for(let[o,c,l]of[[2.78,2.96,.85],[4.88,4.95,.65],[7.8,7.86,.25]]){let h=t.clone();h.opacity=l;let u=new Ne(new ds(o,c,96),h);u.rotation.x=-Math.PI/2,u.position.y=c*.04,u.renderOrder=7,i.add(u)}let s=new Ue([0,.35,0,0,5.1,0],3),r=new Qe().setAttribute("position",s);i.add(new kn(r,new Bn({color:e,transparent:!0,opacity:.82})));let a=new Ne(new us(.78),t);return a.position.y=5.6,i.add(a),i}function cp(i,{onMarker:e}={}){let t=new ur({alpha:!0,antialias:!0,premultipliedAlpha:!1,powerPreference:"high-performance"});t.outputColorSpace=It,t.setClearColor(0,0);let n=t.domElement;n.setAttribute("aria-hidden","true"),Object.assign(n.style,{position:"absolute",inset:"0",width:"100%",height:"100%",display:"block",touchAction:"pan-y",cursor:"grab"}),i.prepend(n);let s=new On,r=new wi(-80,80,55,-55,.5,460),a={radius:{value:27},origin:{value:new _e(Ki.x,Ki.z)},pixelScale:{value:1}},o=Kf(a);o.children.forEach((te,re)=>{te.renderOrder=re});let c=Tv();s.add(o,c);let l=window.matchMedia("(prefers-reduced-motion: reduce)"),h=new P(0,5.35,-.4),u=h.clone(),d=new P,f=-.65,g=.51,x=f,m=g,p=0,y=0,M=2.4,v=0,E=!1,T=!1,_=!0,b=0,L=0,A=0,N=0,F=!1,B=null,I=null,k=null,V=0,z=[-.65,-.51,-.76,-.57,-.7,-.42];function j(){if(b=Math.round(i.clientWidth),L=Math.round(i.clientHeight),!b||!L)return;let te=Math.min(window.devicePixelRatio||1,1.75),re=b/L,Te=Math.max(77,154/re);r.left=-Te*re*.5,r.right=-r.left,r.top=Te*.5,r.bottom=-r.top,r.updateProjectionMatrix(),t.setPixelRatio(te),t.setSize(b,L,!1),a.pixelScale.value=te*ht.clamp(b/650,.79,1.25),B?.resize(n.width,n.height),H()}function C(te){if(A=0,F||!_||!b||!L||document.hidden){N=0;return}let re=Math.min(p===4?.25:.065,Math.max(0,(te-(N||te))/1e3));N=te;let Te=!T;Te&&(y+=re,M=(M+re)%11);let Ke=p===4?k.update(y,T||l.matches):null,Ie=Te&&!Ke?.settled?1-Math.exp(-re*(Ke?4.4:12)):1;if(Ke){x=Ke.azimuth,m=Ke.elevation,u.lerp(Ke.focus,Ie);let Ye=Math.max(Ke.span,Ke.span*1.54/(b/L));r.zoom=ht.lerp(r.zoom,(r.top-r.bottom)/Ye,Ie),r.updateProjectionMatrix()}f+=(x-f)*Ie,g+=(m-g)*Ie;let je=f+(Ke?0:Math.sin(y*.16)*.013);r.position.set(u.x+Math.sin(je)*Math.cos(g)*163,u.y+Math.sin(g)*163,u.z+Math.cos(je)*Math.cos(g)*163),r.lookAt(u),r.updateMatrixWorld(),a.radius.value=2+M*10.5,!Ke&&e&&(d.copy(Ki),d.y+=5.6,d.project(r),e((d.x+1)/2,(1-d.y)/2));let it=E&&!Ke?.83:0;Ke&&(v=0),v+=(it-v)*(Te?1-Math.exp(-re*(E?2.4:1.8)):1),v<.004&&(v=0),v?(B||(B=Zf(t),B.resize(n.width,n.height)),B.paint(s,r,y,v)):t.render(s,r),Te&&!Ke?.settled?H():N=0}function H(){!A&&!F&&_&&!document.hidden&&(A=requestAnimationFrame(C))}function Y(te){p===4||te.button!==0||!te.isPrimary||(I={id:te.pointerId,x:te.clientX,y:te.clientY,azimuth:x,elevation:m},n.setPointerCapture(te.pointerId),n.style.cursor="grabbing")}function ie(te){I?.id===te.pointerId&&(x=I.azimuth-(te.clientX-I.x)*.0048,m=ht.clamp(I.elevation+(te.clientY-I.y)*.003,.22,1.11),H())}function we(te){I?.id===te.pointerId&&(I=null,n.style.cursor="grab")}function Z(){N=0,document.hidden?(cancelAnimationFrame(A),A=0):H()}n.addEventListener("pointerdown",Y),n.addEventListener("pointermove",ie),n.addEventListener("pointerup",we),n.addEventListener("lostpointercapture",we),document.addEventListener("visibilitychange",Z),l.addEventListener("change",H);let ae=new ResizeObserver(j);ae.observe(i);let le=new IntersectionObserver(([te])=>{_=te.isIntersecting,N=0,_?H():(cancelAnimationFrame(A),A=0)});return le.observe(i),j(),{setStage(te){p=Number.isInteger(te)?ht.clamp(te,0,z.length-1):0,p===4&&!k&&(k=lp(),s.add(k.root)),k&&(k.root.visible=p===4,p===4&&k.setStep(V,y)),c.visible=p!==4,p!==4&&(u.copy(h),r.zoom=1,r.updateProjectionMatrix()),x=z[p],m=p===1?.62:.51,H()},setRelayStep(te){V=Number.isInteger(te)?ht.clamp(te,0,3):0,N=0,k?.setStep(V,y),H()},setRain(te){E=!!te,H()},setPaused(te){T=!!te,N=0,H()},scan(){M=l.matches||T?3.6:.05,H()},dispose(){F=!0,cancelAnimationFrame(A),le.disconnect(),ae.disconnect(),document.removeEventListener("visibilitychange",Z),l.removeEventListener("change",H),n.removeEventListener("pointerdown",Y),n.removeEventListener("pointermove",ie),n.removeEventListener("pointerup",we),n.removeEventListener("lostpointercapture",we),s.traverse(te=>{te.geometry?.dispose(),te.material?.dispose()}),B?.dispose(),k?.dispose(),t.dispose(),n.remove()}}}var Ev={index:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',full:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',exit:'<path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/>',play:'<path fill="currentColor" stroke="none" d="m6 3 15 9-15 9z"/>',book:'<path d="M3 4.5C6 4 9 4.5 12 6c3-1.5 6-2 9-1.5v14c-3-.6-6-.2-9 1.5-3-1.7-6-2.1-9-1.5zm9 1.5v14"/>',focus:'<path d="M3 9V4h5m8 0h5v5m0 6v5h-5m-8 0H3v-5"/><circle cx="12" cy="12" r="2"/>',orbit:'<ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(-28 12 12)"/><circle cx="12" cy="12" r="2"/><path d="m18 3 3 1-1 3"/>',scan:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M2 12h20"/>',rain:'<path d="M5 14a4 4 0 0 1 0-8 6 6 0 0 1 11.6-.5A4.5 4.5 0 0 1 19 14M7 16l-2 4m8-4-2 4m8-4-2 4"/>',pause:'<path stroke-width="3" d="M8 4v16m8-16v16"/>',left:'<path d="m14 5-7 7 7 7"/>',right:'<path d="m9 5 7 7-7 7"/>',close:'<path d="m5 5 14 14m0-14L5 19"/>',phone:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 5h4m-3 14h2"/>',chip:'<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',radio:'<circle cx="12" cy="9" r="2"/><path d="m8 22 4-10 4 10m-9-8a7 7 0 0 1 0-10m10 0a7 7 0 0 1 0 10M4 17a11 11 0 0 1 0-16m16 0a11 11 0 0 1 0 16"/>',desk:'<rect x="2" y="3" width="20" height="14" rx="1"/><path d="M12 17v4m-5 0h10"/>',reset:'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>',evidence:'<path d="M6 2h9l4 4v16H6zM14 2v5h5M9 12h7m-7 4h5"/>',check:'<path d="m4 12 5 5L20 6"/>'};function Ot(i){return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(Ev[i]||"")+"</svg>"}function hp(i=document){i.querySelectorAll("[data-icon]").forEach(e=>{e.innerHTML=Ot(e.dataset.icon)})}var Av=gt,Rv={prototype:{name:"SuperMini carrier",label:"Fabricated prototype",description:"50 \xD7 43 mm carrier with an ESP32-S3 SuperMini and a separate Ra-02 radio breakout.",credit:"CAD reconstruction with module photographs"},"custom-smd":{name:"RAMS Wearable",label:"Custom SMD design",description:"42 \xD7 32 mm, four copper layers and a directly mounted ESP32-S3FH4R2. Flip the board to inspect the underside radio.",credit:"Fabrication CAD \xB7 first article pending"}};function dp(i){let e="pothole",t=0,n={walking:"Walking",pothole:"Pothole",phone_falling:"Phone drop",impact:"Impact",fall:"Fall"};function s(r){cancelAnimationFrame(t),t=0,e=r;let{samples:a,peak:o,tilt:c,speed:l}=Av[e],h=y=>43+y*480/49,u=y=>161-y*13.4,d=a.map((y,M)=>h(M).toFixed(1)+","+u(y[1]).toFixed(1)).join(" "),f=a.findIndex(y=>y[1]===Math.max(...a.map(M=>M[1])));i.innerHTML=`<div class="plate">
      <div class="plate-head trace-head"><strong>Motion trace</strong><div class="segment" aria-label="Select trace">${Object.keys(n).map(y=>'<button data-trace="'+y+'" aria-pressed="'+(y===r)+'">'+n[y]+"</button>").join("")}</div></div>
      <div class="plot-wrap"><div class="plot-label"><span class="tiny">Acceleration magnitude (g)</span><span class="trace-key">Synthetic fixture</span></div>
      <svg viewBox="0 0 548 193" role="img" aria-label="${r} acceleration over 980 milliseconds, peak ${o.toFixed(2)} g">
        <defs><linearGradient id="trace-fill" x2="0" y2="1"><stop stop-color="#6fe5dc" stop-opacity=".3"/><stop offset="1" stop-color="#6fe5dc" stop-opacity=".02"/></linearGradient></defs>
        ${[0,2,4,6,8,10].map(y=>'<path stroke="#33434d" stroke-dasharray="2 4" d="M43 '+u(y)+'h480"/><text x="31" y="'+(u(y)+4)+'" text-anchor="end">'+y+"</text>").join("")}
        ${[0,250,500,750,980].map(y=>'<text x="'+(43+480*y/980)+'" y="184" text-anchor="middle">'+y+" ms</text>").join("")}
        <polygon points="43,161 ${d} 523,161" fill="url(#trace-fill)"/>
        <polyline points="${d}" fill="none" stroke="#83ede3" stroke-width="2.6" stroke-linejoin="round"/>
        <line id="cursor" y1="19" y2="161" stroke="#ffbd78" stroke-dasharray="3 4"/><circle id="sample-dot" r="4" fill="#ffc47f" stroke="#16212a" stroke-width="2"/>
      </svg></div>
      <div class="scrub"><button class="small-button" id="trace-play" title="Replay the trace at one quarter speed">Play trace</button><input type="range" min="0" max="49" value="${f}" aria-label="Inspect motion sample"><output></output></div>
      <div class="stats">${[[o.toFixed(2)+" g","Peak acceleration"],[c.toFixed(1)+"\xB0","Tilt change"],[l+" km/h","Scripted speed"]].map(([y,M])=>'<div class="stat"><b>'+y+"</b><small>"+M+"</small></div>").join("")}</div>
      <div class="plate-foot"><span class="tiny">50 samples \xB7 50 Hz</span><span>${r==="fall"?"Synthetic over-the-handlebars fall":"Android benchmark fixture"}</span></div></div>`;let g=i.querySelector("input");function x(){let y=Number(g.value),M=a[y],v=i.querySelector("#sample-dot"),E=i.querySelector("#cursor");v.setAttribute("cx",h(y)),v.setAttribute("cy",u(M[1])),E.setAttribute("x1",h(y)),E.setAttribute("x2",h(y)),i.querySelector("output").textContent=M[0]+" ms \xB7 "+M[1].toFixed(2)+" g",g.setAttribute("aria-valuetext",M[0]+" milliseconds, "+M[1].toFixed(2)+" g")}let m=i.querySelector("#trace-play");function p(){cancelAnimationFrame(t),t=0,m.textContent="Play trace"}g.oninput=()=>{p(),x()},m.onclick=()=>{if(t){p();return}let y=performance.now();m.textContent="Pause trace";function M(v){g.value=String(Math.min(49,Math.floor((v-y)/80))),x(),Number(g.value)<49?t=requestAnimationFrame(M):p()}t=requestAnimationFrame(M)},x(),i.querySelectorAll("[data-trace]").forEach(y=>{y.onclick=()=>{s(y.dataset.trace),i.querySelector('[aria-pressed="true"]').focus({preventScroll:!0})}})}return s(e),()=>cancelAnimationFrame(t)}function fp(i){let e={corpus:"Dataset",threshold:"Threshold",feedback:"Rider feedback",language:"Language"},t=pt,n={pothole:"Pothole",phone_falling:"Dropped phone",normal_vehicle_ride:"Normal ride",impact:"Impact",fall:"Fall",skidding:"Skid"};i.innerHTML=`<div class="plate"><div class="plate-head"><strong>Calibration lab</strong><div class="segment" aria-label="Calibration exhibits">${Object.entries(e).map(([a,o])=>'<button data-lab="'+a+'">'+o+"</button>").join("")}</div></div><div id="lab-body"></div></div>`;let s=i.querySelector("#lab-body");function r(a){if(i.querySelectorAll("[data-lab]").forEach(o=>o.setAttribute("aria-pressed",o.dataset.lab===a)),a==="corpus"&&(s.innerHTML=`
    <div class="corpus-body"><div class="corpus-intro"><b>121</b><span>generated traces</span></div><div class="dataset-bars" aria-label="3 accident and 8 benign scenario families">${Array.from({length:11},(o,c)=>'<span class="'+(c<3?"pos":"")+'"></span>').join("")}</div><div class="legend"><span>33 accident-labeled</span><span>88 benign</span></div>
    <ul class="pipeline"><li><b>Research</b><span>SisFall, MobiFall and other public datasets informed the project\u2019s reference catalog.</span></li><li><b>Generate</b><span>Local Python scripts produced 11 scenario families and their variants for the Android app.</span></li><li><b>Extract</b><span>Each trace carries 14 summary features covering acceleration, rotation, jerk and tilt.</span></li></ul>
    </div><div class="plate-foot"><span class="tiny">11 scenarios</span><span>6,050 sample rows</span></div>`),a==="feedback"&&(s.innerHTML='<div class="corpus-body"><div class="corpus-intro"><span class="eyebrow">After a rider cancels</span></div><ul class="pipeline"><li><b>Dismiss</b><span>Android stops the alarm and countdown and records a dismissal reason and count.</span></li><li><b>Correct</b><span>The app updates the local event and requests a separate cancel message through the paired wearable.</span></li><li><b>Saved profiles</b><span>A separate matcher can recognize saved motion below 6 g. Canceling alone does not add a profile.</span></li></ul></div><div class="plate-foot"><span class="tiny">Android implementation</span><span>Local feedback path</span></div>'),a==="language"&&(s.innerHTML='<div class="corpus-body"><div class="corpus-intro"><b>1,655</b><span>bundled Q&amp;A records</span></div><ul class="pipeline"><li><b>Generate</b><span>The training script expands question and answer templates into an offline knowledge file.</span></li><li><b>Voice</b><span>The command resource lists 32 wake prefixes and 55 written phonetic variants of \u201CRAMS.\u201D</span></li><li><b>Evidence</b><span>These assets document text generation and phrase matching. The motion decision comes from the separate Android classifier.</span></li></ul></div><div class="plate-foot"><span class="tiny">Assistant resources</span><span>Text templates and variants</span></div>'),a==="threshold"){let o=l=>Object.keys(t).filter(h=>t[h].accident===l).map(h=>'<option value="'+h+'">'+n[h]+"</option>").join("");s.innerHTML=`<div class="corpus-body"><div class="example-pair"><label>Benign session<select id="benign">${o(!1)}</select></label><label>Accident-labeled session<select id="positive">${o(!0)}</select></label></div><div class="calculation"><span class="eyebrow">Illustrative import result</span><div class="corpus-intro"><b id="threshold-g"></b><span>acceleration threshold</span></div><p id="threshold-equation"></p></div><p class="lab-note">This example uses the peaks of two packaged sessions. An actual CSV import considers every labeled session in the file.</p></div><div class="plate-foot"><span class="tiny">Android CSV calibration rule</span><span>Two-fixture example</span></div>`;let c=()=>{let l=t[s.querySelector("#benign").value].peak,h=t[s.querySelector("#positive").value].peak,u=h>l;s.querySelector("#threshold-g").textContent=(u?(h+l)/2:h).toFixed(2)+" g",s.querySelector("#threshold-equation").textContent=u?"("+l.toFixed(2)+" g + "+h.toFixed(2)+" g) \xF7 2. The two peaks leave a gap.":"The benign peak ("+l.toFixed(2)+" g) meets or exceeds the accident peak ("+h.toFixed(2)+" g). The import uses the accident peak."};s.querySelectorAll("select").forEach(l=>{l.onchange=c}),c()}}i.querySelectorAll("[data-lab]").forEach(a=>{a.onclick=()=>r(a.dataset.lab)}),r("corpus")}function pp(i){let e,t;function n(s){e?.dispose(),e=null,t=s;let r=Rv[s];i.innerHTML=`<div class="plate"><div class="plate-head"><strong>Board inspection</strong><div class="board-switch" aria-label="Choose board"><button data-board="prototype" aria-pressed="${s==="prototype"}">Prototype</button><button data-board="custom-smd" aria-pressed="${s==="custom-smd"}">Custom SMD</button></div></div>
    <div class="board-canvas"><img src="public/hardware/${s}.webp" alt="${r.name}, ${r.credit}"></div>
    <div class="board-caption"><span class="eyebrow">${r.label}</span><h3>${r.name}</h3><p>${r.description}</p><small>${r.credit}</small></div>
    <div class="plate-foot"><span id="board-report" aria-live="polite">Loading CAD model\u2026</span><div class="board-actions"><button id="flip" class="small-button" disabled>Flip board</button><button id="reset-board" class="small-button" aria-label="Reset board view" disabled>${Ot("reset")}</button></div></div></div>`,i.querySelectorAll("[data-board]").forEach(o=>{o.onclick=()=>{o.dataset.board!==t&&(n(o.dataset.board),i.querySelector('[aria-pressed="true"]').focus({preventScroll:!0}))}});let a=(o,c)=>{i.querySelector("#board-report").textContent=o,i.querySelector("#flip").disabled=!c,i.querySelector("#reset-board").disabled=!c};try{e=ap(i.querySelector(".board-canvas"),s,a),i.querySelector("#flip").onclick=()=>e.flip(),i.querySelector("#reset-board").onclick=()=>e.reset()}catch{a("CAD still \xB7 interactive model unavailable",!1)}}return n("prototype"),()=>e?.dispose()}var zl=[["phone","Phone","The phone supplies motion and position","Android classifies the motion window using acceleration, rotation and speed context. A usable phone location lets the station place the event on a map."],["chip","Wearable","Bluetooth hands the event to the wearable","The paired device receives the event and phone coordinates over BLE. Its firmware starts the local alarm and gives the packed alert to the Ra-02 radio."],["radio","Receiver","Inside the 26-byte LoRa alert","A receiver in range reads the alert type and checks its length before decoding the fields."],["desk","Station","The receiver reports over USB","The receiver writes a LORA_ALERT record to USB serial with the decoded fields and measured signal quality. The Windows operator can review the event."]],up=[["Header",13,"The first 13 bytes hold the packet type (1), device token (8) and wearable send-time counter (4). The counter measures milliseconds since boot."],["Latitude",4,"Bytes 14\u201317 carry the latitude as a 32-bit floating-point value in degrees. The paired phone supplies the location."],["Longitude",4,"Bytes 18\u201321 carry longitude in degrees. A usable pair of coordinates lets the station plot a pin."],["Event",1,"Byte 22 carries the event subtype. The protocol includes fall, skid and direct impact. A cancellation has its own packet type."],["Peak g",4,"Bytes 23\u201326 carry peak acceleration magnitude in g. Rider details travel separately in a profile packet."]];function mp(i,e){i.innerHTML=`<div class="plate relay-plate"><div class="relay-top"><span class="eyebrow">Illustrated handoff</span><span class="tiny" id="relay-shot"></span></div><div class="relay-spacer"><img class="relay-still" alt="" hidden></div><div class="relay-nodes" aria-label="Explore the four handoffs">${zl.map(([h,u],d)=>(d?'<span class="connector"><b>'+["","BLE","LoRa","USB"][d]+"</b></span>":"")+'<button class="relay-node" data-step="'+d+'"><span class="glyph">'+Ot(h)+"</span>"+u+"</button>").join("")}</div><div class="step-detail"><h3></h3><p aria-live="polite"></p></div><div class="plate-foot"><span id="step-n" class="tiny"></span><button id="handoff" class="small-button"></button></div></div>`;let t=i.querySelector(".relay-spacer"),n=document.getElementById("road"),s=n.parentNode,r=n.nextSibling,a=n.getAttribute("aria-label"),o=i.querySelector(".relay-still");e?t.prepend(n):(o.hidden=!1,n.hidden=!0);let c=0;function l(h){c=h,e?.setRelayStep?.(h);let u=zl[h][2];if(i.querySelector("#relay-shot").textContent=["Android motion","BLE \xB7 local","LoRa \xB7 433 MHz","USB \xB7 serial"][h],e?n.setAttribute("aria-label",u+". Enlarged schematic devices in an illustrative landscape."):(o.src="public/relay/"+["phone","wearable","receiver","station"][h]+".webp",o.alt=u),i.querySelector("#step-n").textContent="Handoff 0"+(h+1)+" / 04",i.querySelector(".step-detail h3").textContent=zl[h][2],i.querySelector(".step-detail p").textContent=zl[h][3],i.querySelector(".packet-layout")?.remove(),h===2){let f=function(g){i.querySelector(".step-detail p").textContent=up[g][2],d.querySelectorAll("button").forEach((x,m)=>x.setAttribute("aria-pressed",g===m))},d=document.createElement("dl");d.className="packet-layout",d.setAttribute("aria-label","Inspect alert fields in wire order");for(let[g,[x,m]]of up.entries()){let p=document.createElement("div"),y=document.createElement("dt"),M=document.createElement("dd"),v=document.createElement("button");v.textContent=x,v.dataset.field=g,v.setAttribute("aria-label",x+", "+m+(m===1?" byte":" bytes")),v.onclick=()=>f(g),y.append(v),M.textContent=m+" B",p.append(y,M),d.append(p)}i.querySelector(".step-detail").append(d),f(0)}i.querySelector("#handoff").textContent=h===3?"Replay handoff":"Follow the signal",i.querySelectorAll(".relay-node").forEach(d=>{let f=Number(d.dataset.step)===h;d.classList.toggle("active",f),d.setAttribute("aria-pressed",f)})}return i.querySelectorAll("[data-step]").forEach(h=>{h.onclick=()=>l(Number(h.dataset.step))}),i.querySelector("#handoff").onclick=()=>l((c+1)%4),l(0),()=>{e?(s.insertBefore(n,r),n.setAttribute("aria-label",a)):n.hidden=!1}}function gp(i){i.innerHTML=`<div class="plate"><div class="plate-head"><strong>Validation record</strong><span class="tiny">Synthetic replay</span></div><div class="stats proof-stats"><div class="stat"><b>33 / 33</b><small>Accident flags matched</small></div><div class="stat"><b>88 / 88</b><small>Benign flags matched</small></div></div>
    <div class="proof-list"><article>${Ot("check")}<div><h3>Binary alarm decision</h3><p>The compiled Android classifier replayed the stored feature vectors on a desktop JVM.</p></div></article>
    <article class="pending">${Ot("focus")}<div><h3>Subtype errors</h3><p>All 11 potholes were called wind flutter. All 11 simulated falls over the handlebars were called severe collisions.</p></div></article><article class="pending">${Ot("radio")}<div><h3>Next field measurements</h3><p>Held-out motion trials, packet delivery at measured distances and end-to-end alert latency.</p></div></article></div>
    <div class="plate-foot"><span class="tiny">Next \xB7 prototype demonstration</span><span>4 min</span></div></div>`}function xp(i){i.innerHTML=`<section class="people-exhibit"><header><span class="eyebrow">Cagayan State University</span><span class="tiny">Carig Campus</span></header>
  <ul class="people-list">${Ii.map((e,t)=>`<li style="--delay:${t*60}ms"><span class="speaker-index">${String(t+1).padStart(2,"0")}</span><div><strong>${e.speaker}</strong><span>${e.title}</span></div></li>`).join("")}</ul>
  <div class="people-meta"><span>BS Electronics Engineering</span><span>Suggested speaking parts</span></div></section>`}function yp(i){i.innerHTML=`<figure class="national-exhibit"><div class="national-facts">
  <span class="eyebrow">Philippines \xB7 2021</span><strong class="national-number">11,096</strong><p>road traffic deaths recorded nationally</p>
  <div class="death-chart" role="img" aria-label="Registered road traffic deaths, 7,938 in 2011 and 11,096 in 2021">
  <div><span>2011</span><i style="--length:71.54%"></i><b>7,938</b></div><div><span>2021</span><i style="--length:100%"></i><b>11,096</b></div></div>
  <p class="national-note">RAMS addresses the gap between a crash on the road and the first report reaching someone who can act.</p></div>
  <img src="public/philippines.svg" alt="Coastline map of the Philippines">
  <figcaption>Registered deaths \xB7 PSA figures reported by WHO Philippines and DOTr, May 2023. <a href="${jl}" target="_blank" rel="noopener">Source</a></figcaption></figure>`}var ba={fall:"Fall",impact:"Impact",skidding:"Skid",motorcycle_wind_flutter:"Wind flutter",normal_vehicle_ride:"Normal ride",phone_falling:"Phone drop",phone_shaking:"Phone shake",pothole:"Pothole",running:"Running",speed_bump:"Speed bump",walking:"Walking"},Cv=[["SisFall","Falls and activities of daily living.","https://www.mdpi.com/1424-8220/17/1/198"],["MobiFall / MobiAct","Phone movements during falls and daily activities.","https://bmi.hmu.gr/el/the-mobifall-and-mobiact-datasets/"],["UP-Fall","Multimodal recordings of falls and ordinary movements.","https://doi.org/10.3390/s19091988"],["Road anomalies","Potholes and speed bumps listed in the RAMS research catalog.",""],["UCI smartphone HAR","Daily activities recorded with a waist-mounted phone.","https://archive.ics.uci.edu/dataset/240/human+activity+recognition+using+smartphones"],["UMAFall","Wearable and smartphone traces for fall research.","https://doi.org/10.6084/m9.figshare.4214283"]];function Pv(i){return`<svg viewBox="0 0 112 32" preserveAspectRatio="none" aria-hidden="true"><path d="M0 29h112" stroke="currentColor" opacity=".15"/><polyline points="${i.map((r,a)=>[(a*112/(i.length-1)).toFixed(1),(30-Math.min(10,r)*28/10).toFixed(1)].join(",")).join(" ")}" fill="none" stroke="currentColor" stroke-width="1.7" vector-effect="non-scaling-stroke"/></svg>`}function vp(i){let e={fixtures:"Packaged traces",references:"Source catalog",capture:"Field collection"};i.innerHTML=`<section class="plate source-atlas"><div class="plate-head"><strong>Motion data atlas</strong><span class="tiny">Provenance</span></div><nav class="atlas-tabs" aria-label="Dataset provenance">${Object.entries(e).map(([r,a])=>'<button data-atlas="'+r+'">'+a+"</button>").join("")}</nav><div class="atlas-content"></div></section>`;let t=i.querySelector(".atlas-content"),n=mt;function s(r){if(i.querySelectorAll("[data-atlas]").forEach(a=>a.setAttribute("aria-pressed",a.dataset.atlas===r)),r==="fixtures"){let o=function(c){let l=n.find(h=>h.name===c);t.querySelectorAll(".family").forEach(h=>h.setAttribute("aria-pressed",h.dataset.family===c)),t.querySelector(".family-details").innerHTML=`<div><b>${ba[c]}</b><span>${l.positive?"Accident-labeled":"Benign"} \xB7 ${l.count} files</span></div><div><b>${l.peak.toFixed(2)} g</b><span>Base peak</span></div><div><b>${l.tilt.toFixed(1)}\xB0</b><span>Base tilt change</span></div>`},a=[...n].sort((c,l)=>Number(l.positive)-Number(c.positive)||ba[c.name].localeCompare(ba[l.name]));t.innerHTML=`<div class="family-grid">${a.map(c=>`<button data-family="${c.name}" class="family ${c.positive?"positive":""}" title="Inspect ${ba[c.name]}"><span>${ba[c.name]}</span>${Pv(c.samples)}</button>`).join("")}</div><div class="family-details" aria-live="polite"></div>`,t.querySelectorAll("[data-family]").forEach(c=>{c.onclick=()=>o(c.dataset.family)}),o("walking")}else r==="references"?t.innerHTML=`<p class="atlas-caption">Research references named by the project. The packaged trial files are generated locally.</p><ul class="catalog-list">${Cv.map(([a,o,c])=>`<li><strong>${c?'<a href="'+c+'" target="_blank" rel="noopener">'+a+"</a>":a}</strong><span>${o}</span></li>`).join("")}</ul>`:t.innerHTML='<ol class="capture-list"><li><b>Record a session</b><p>IMU Studio captures timestamped accelerometer and gyroscope samples on the phone.</p></li><li><b>Apply the label</b><p>Keep the activity, session ID and accident flag together so a whole trial can be held out.</p></li><li><b>Export and calibrate</b><p>Export raw rows or windowed features, then import labeled sessions into the calibration manager.</p></li><li><b>Evaluate separately</b><p>Freeze the settings and count missed events and false alarms on different sessions.</p></li></ol>'}i.querySelectorAll("[data-atlas]").forEach(r=>{r.onclick=()=>s(r.dataset.atlas)}),s("fixtures")}var _p=[{label:"Road user",symbol:"phone",title:"A second way to raise an alert",text:"A paired phone and wearable can originate an incident report. The rider can correct a false alarm if able.",measure:"Missed alerts, false alarms per trip and hours per charge."},{label:"Receiving station",symbol:"radio",title:"A report with a device identity",text:"Within radio reach, the receiver can pass an event, available coordinates and peak acceleration to the Windows station.",measure:"Packet delivery, alert latency and receiver uptime."},{label:"Response team",symbol:"desk",title:"Information for a human decision",text:"An operator reviews the alert and decides whom to contact. A field pilot would need rider consent and restricted access to identifiable routes and profiles.",measure:"Time to acknowledgement and hours of staffed coverage."}];function bp(i){i.innerHTML=`<section class="impact-exhibit"><header><span class="eyebrow">Intended impact</span><span class="tiny">From event to review</span></header><div class="impact-route">${_p.map((t,n)=>`<button data-person="${n}"><i>${Ot(t.symbol)}</i><span>${t.label}</span></button>`).join("")}</div><div class="consequence" aria-live="polite"></div></section>`;function e(t){let n=_p[t];i.querySelectorAll("[data-person]").forEach(s=>s.setAttribute("aria-pressed",Number(s.dataset.person)===t)),i.querySelector(".consequence").innerHTML=`<h3>${n.title}</h3><p>${n.text}</p><div><span class="eyebrow">Field measure</span><strong>${n.measure}</strong></div>`}i.querySelectorAll("[data-person]").forEach(t=>{t.onclick=()=>e(Number(t.dataset.person))}),e(0)}var yr={pairing:{label:"Pairing",title:"Before the trip",duration:10,phases:[[0,"Prepare","The wearer opens the Android companion with the wearable nearby."],[.31,"Connect","The phone connects to the wearable over Bluetooth Low Energy."],[.69,"Monitor","The phone supplies motion and location. The wearable provides the LoRa link."]]},motorcycle:{label:"Motorcycle",title:"Motorcycle slide",duration:9,phases:[[0,"Approach","A rider travels along the corridor with a paired phone and wearable."],[.48,"Loss of balance","The motorcycle leans, falls and slides. The rider\u2019s orientation changes with it."],[.76,"After the slide","The bike settles. A candidate event can be assessed from the phone\u2019s motion and speed context."]]},car:{label:"Car",title:"Junction collision",duration:9,phases:[[0,"Approach","Two vehicles enter the junction from different directions."],[.5,"Contact","The vehicles meet at the junction and change course abruptly."],[.72,"After contact","The cars slow to a stop. The person carrying the phone may be unable to make a call."]]},pedestrian:{label:"Pedestrian",title:"Pedestrian crossing",duration:9,phases:[[0,"Approach","A pedestrian is crossing while a car approaches the marked lane."],[.5,"Contact","The vehicle reaches the pedestrian, who loses balance."],[.74,"After the fall","The pedestrian\u2019s phone moves with them. The request for help depends on the sensed event and a working link."]]},fall:{label:"Fall",title:"A fall while walking",duration:9,phases:[[0,"Walking","The wearer is on foot. There is no vehicle contact in this sequence."],[.45,"Loss of footing","A step slips and the wearer reaches out to brace. The phone changes orientation with the body."],[.71,"Ground contact","The wearer comes to rest on their side. A phone moving with the body can record the impact and the resulting change in orientation."]]}},Iv=`
.story-film{--frame-line:#344a54;overflow:hidden}.story-tabs{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end}.story-tabs button,.story-player button{font:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#c4d4da;border:1px solid var(--frame-line);background:#101f28;border-radius:4px;min-height:32px;padding:4px 9px;font-size:12px}.story-tabs button[aria-pressed=true]{color:#95f0e4;background:#193d40;border-color:#547c7c}.story-tabs button:hover,.story-player button:hover{border-color:#78bbb6}.story-cinema{position:relative;isolation:isolate;width:100%;height:clamp(190px,32vh,395px);overflow:hidden;background:#0b171e}.story-cinema video,.story-cinema img{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.story-cinema video[hidden],.story-cinema img[hidden],.story-label[hidden]{display:none}.story-anchor,.story-tag{font:10px var(--mono,monospace);text-transform:uppercase;color:#cce4e7;letter-spacing:.055em;line-height:1.3}.story-tag{position:absolute;top:12px;left:14px;z-index:1;background:#0a151edb;padding:5px 8px;border-left:2px solid #81ded5}.story-label{position:absolute;z-index:1;pointer-events:none;transform:translate(1px,-100%);display:flex;align-items:flex-start;color:#9cf2e3}.story-label i{height:19px;width:20px;transform:skewX(-32deg);border-left:1px solid currentColor;border-top:1px solid currentColor;transform-origin:bottom}.story-label b{display:block;position:relative;top:-7px;margin-left:9px;padding:2px 5px;background:#12272bdd;color:#a6f5e8;font:9px var(--mono,monospace);text-transform:uppercase}.story-copy{padding:12px 18px 11px;border-top:1px solid var(--frame-line);min-height:80px}.story-copy h3{font-size:17px;margin:0 0 4px;letter-spacing:-.035em}.story-copy p{font-size:13px;line-height:1.45;color:#b1c4ce;margin:0}.story-player{display:flex;align-items:center;gap:9px;border-top:1px solid var(--frame-line);padding:8px 14px;color:#b5c6cf}.story-player button{min-width:33px;width:33px;min-height:32px;height:32px;padding:7px}.story-player svg{width:15px;height:15px}.story-player input{min-width:45px;flex:1;accent-color:#79e2d7;cursor:pointer}.story-player output{font:11px var(--mono,monospace);white-space:nowrap}.story-film .plate-head{padding:12px 16px}.story-film .plate-head strong{white-space:nowrap}.story-static{padding:0 14px 8px;color:#a2bac7;font:10px var(--mono,monospace)}
@media(max-width:780px){.story-cinema{height:clamp(195px,60vw,285px)}.story-film .plate-head{padding:10px 12px;gap:8px;flex-wrap:wrap}.story-tabs{gap:3px}.story-tabs button{min-height:32px;font-size:11px;padding:4px 7px}.story-copy{min-height:80px;padding:10px 13px}.story-player{padding:6px 10px}.story-tag{font-size:9px;top:9px;left:9px}}
@media(min-width:781px) and (max-height:760px){.story-cinema{height:clamp(175px,30vh,230px)}.story-copy{min-height:66px;padding:8px 15px}.story-film .plate-head{padding:9px 14px}}
`;function Lv(){if(document.getElementById("rams-scenario-style"))return;let i=document.createElement("style");i.id="rams-scenario-style",i.textContent=Iv,document.head.append(i)}function lu(i,{initial:e}={}){Lv();let t=e==="pairing"?["pairing"]:["motorcycle","car","pedestrian","fall"],n=matchMedia("(prefers-reduced-motion: reduce)");i.innerHTML=`<div class="plate story-film"><div class="plate-head"><strong>${e==="pairing"?"Wearer setup":"Road scenarios"}</strong>${t.length===1?'<span class="tiny">Bluetooth Low Energy</span>':'<div class="story-tabs" aria-label="Choose a scenario">'+t.map(H=>'<button data-story="'+H+'">'+yr[H].label+"</button>").join("")+"</div>"}</div>
    <div class="story-cinema" role="img"><img alt=""><div class="story-tag">Illustrative sequence</div></div>
    <div class="story-copy"><h3></h3><p></p></div><div class="story-player">
    <button data-action="play" aria-label="Play scenario"></button>
    <button data-action="restart" aria-label="Replay scenario" title="Replay scenario">${Ot("reset")}</button>
    <input aria-label="Scenario timeline" type="range" min="0" max="100" step="1" value="0"><output></output></div></div>`;let s=i.querySelector(".story-film"),r=s.querySelector(".story-cinema"),a=r.querySelector("img"),o=r.querySelector(".story-tag"),c=s.querySelector("[data-action=play]"),l=s.querySelector("input"),h,u,d=!1,f=!1,g=!1,x=0,m=0,p=0,y=-1,M=-1,v=!1,E=H=>"0:"+String(Math.floor(H)).padStart(2,"0"),T=()=>document.hidden||!!document.querySelector("dialog[open]");function _(){let{duration:H,phases:Y,title:ie}=yr[h],we=Y.findLastIndex(([le])=>p+1e-6>=le);we!==y&&(y=we,s.querySelector(".story-copy h3").textContent=Y[we][1],s.querySelector(".story-copy p").textContent=Y[we][2],r.setAttribute("aria-label",ie+". "+Y[we][2]),a.src="public/scenarios/"+h+"-"+we+".webp");let Z=Math.round(p*100);Number(l.value)!==Z&&(l.value=Z);let ae=Math.floor(p*H);ae!==M&&(M=ae,s.querySelector("output").textContent=E(ae)+" / "+E(H),l.setAttribute("aria-valuetext",Y[we][1]+", "+E(ae)))}function b(){let H=f?"Pause scenario":p>=1?"Replay scenario from start":"Play scenario";c.setAttribute("aria-label",H),c.title=H,c.innerHTML=Ot(f?"pause":p>=1?"reset":"play")}function L(){f=!1,v=!1,cancelAnimationFrame(x),m=0,u?.pause(),b()}function A(H){if(!(g||!f)){if(T()?(v||(u?.pause(),v=!0),m=0):(v&&(v=!1,d||N(u)),d&&m&&(p=Math.min(1,p+(H-m)/1e3/yr[h].duration)),m=H,_()),p>=1){L();return}d&&(x=requestAnimationFrame(A))}}async function N(H){try{await H.play()}catch(Y){if(g||H!==u||Y.name==="AbortError")return;if(Y.name==="NotAllowedError"){L();return}I()}}function F(){p>=1&&B(0),f=!0,b(),m=0,cancelAnimationFrame(x),d?x=requestAnimationFrame(A):T()||N(u)}function B(H){p=H,_(),!d&&u?.readyState>=1&&(u.currentTime=Math.min(H*yr[h].duration,u.duration||yr[h].duration)),b()}function I(){d=!0,u.pause(),u.hidden=!0,a.hidden=!1,o.textContent="Illustrated storyboard",m=0,cancelAnimationFrame(x),f&&(x=requestAnimationFrame(A)),_()}function k(){u&&(u.onerror=u.onloadedmetadata=u.onloadeddata=u.onended=u.ontimeupdate=null,u.pause(),u.removeAttribute("src"),u.load(),u.remove())}function V(H){L(),k(),h=H,p=0,y=M=-1,d=!1,s.querySelectorAll("[data-story]").forEach(ie=>ie.setAttribute("aria-pressed",ie.dataset.story===h)),o.textContent="Illustrative sequence",a.hidden=!1,_(),b();let Y=document.createElement("video");if(u=Y,Y.muted=!0,Y.playsInline=!0,Y.preload="auto",Y.disablePictureInPicture=!0,Y.setAttribute("aria-hidden","true"),Y.poster=a.src,r.prepend(Y),Y.onerror=()=>{Y===u&&!g&&I()},Y.onloadedmetadata=()=>{Y===u&&!d&&p>0&&B(p)},Y.onloadeddata=()=>{Y===u&&!d&&(a.hidden=!0)},Y.ontimeupdate=()=>{Y===u&&f&&!d&&!Y.seeking&&(p=Math.min(1,Y.currentTime/yr[h].duration),_())},Y.onended=()=>{Y===u&&(p=1,_(),L())},!Y.canPlayType("video/mp4")){I();return}Y.src="public/scenarios/"+h+".mp4",n.matches||F()}c.onclick=()=>f?L():F(),s.querySelector("[data-action=restart]").onclick=()=>{L(),B(0),F()},s.querySelectorAll("[data-story]").forEach(H=>{H.onclick=()=>V(H.dataset.story)}),l.oninput=()=>{L(),B(Number(l.value)/100)};function z(H){H.matches&&L()}function j(){f&&(T()?(u?.pause(),v=!0,m=0):v&&(v=!1,d||N(u)))}let C=new MutationObserver(j);return C.observe(document.body,{subtree:!0,attributes:!0,attributeFilter:["open"]}),document.addEventListener("visibilitychange",j),n.addEventListener("change",z),V(t.includes(e)?e:t[0]),()=>{g=!0,L(),k(),C.disconnect(),document.removeEventListener("visibilitychange",j),n.removeEventListener("change",z)}}var Pe=i=>document.getElementById(i),cu=document.querySelector(".stage"),Sa=Pe("exhibit-panel"),Vn=Pe("drawer"),Mp=matchMedia("(prefers-reduced-motion: reduce)"),xn=-1,In,hu,Hl=!1,Wn=Mp.matches,uu,Ms=new URL(location.href).searchParams.get("program")==="finals",Et=Ca(Ms),Dv={team:xp,problem:yp,impact:bp,datasets:vp,detection:dp,calibration:fp,hardware:pp,relay:mp,validation:gp,mobile:Iu,desktop:Lu,assistant:Du,pairing:i=>lu(i,{initial:"pairing"}),scenarios:i=>{let e=new URLSearchParams(location.search).get("incident");return lu(i,{initial:["car","pedestrian","fall"].includes(e)?e:"motorcycle"})}},wp=()=>["overview","relay"].includes(Et[xn]?.id),Gl=Pe("chapter-title"),Nv=Gl.innerHTML,Uv=Pe("summary").textContent,Ma=i=>String(i+1).padStart(2,"0");hp();function Tp(i,e,t=!1){let n=document.createElement("button");return n.className=t?"index-row":"chapter-link",n.innerHTML=t?"<small>"+Ma(e)+"</small>"+i.title+Ot("right"):'<span class="num">'+Ma(e)+"</span><span>"+i.title+"</span>",n.setAttribute("aria-label","Chapter "+(e+1)+", "+i.title),n.onclick=()=>{Vn.open&&Vn.close(),Ji(e)},n}function Ep(){Pe("program").value=Ms?"finals":"full",Pe("total").textContent="/ "+String(Et.length).padStart(2,"0"),Pe("chapter-nav").replaceChildren(...Ii.map((i,e)=>{let t=Et.findIndex(s=>s.actIndex===e),n=Tp({title:i.title},t);return n.setAttribute("aria-label","Section "+(e+1)+", "+i.title),n.querySelector(".num").textContent=Ma(e),n}))}Ep();function Fv(i,e){let t=Pe("road"),n=Pe("beacon");n.style.left=t.offsetLeft+i*t.offsetWidth+"px",n.style.top=t.offsetTop+e*t.offsetHeight+"px",n.classList.add("visible")}function Wl(){Pe("rain").setAttribute("aria-pressed",Hl),Pe("motion").innerHTML=Ot(Wn?"play":"pause"),Pe("motion").setAttribute("aria-label",Wn?"Resume scene motion":"Pause scene motion"),Pe("motion").title=Pe("motion").getAttribute("aria-label"),Pe("motion").setAttribute("aria-pressed",Wn)}function Ov(){if(!(In||Pe("road").dataset.static))try{In=cp(Pe("road"),{onMarker:Fv}),Pe("road").classList.add("has-gl"),In.setPaused(Wn)}catch{Pe("road").dataset.static="true",Pe("road").querySelector("canvas")?.remove(),document.querySelector(".scene-tools").hidden=!0,document.querySelector(".orbit-hint").textContent="Terrain illustration"}}function Ap(i){if(i===xn)return;hu?.(),hu=null;let e=Et[i],t=i===0,n=e.id==="relay";xn=i,cu.dataset.chapter=e.id,cu.classList.toggle("detail",!t),cu.classList.toggle("relay-stage",n),Pe("road").hidden=!t&&!n,Pe("road-ui").hidden=!t,Sa.hidden=t,Sa.replaceChildren(),Pe("category").textContent="INNOVATEX 2026",Pe("sub-category").textContent=t?"SYSTEM OVERVIEW":e.title.toUpperCase(),t?Gl.innerHTML=Nv:Gl.textContent=e.headline,Pe("summary").textContent=t?Uv:e.summary,Pe("primary").innerHTML=t?Ot("play")+"Begin presentation":i===Et.length-1?Ot("reset")+"Return to overview":"Next chapter "+Ot("right"),Pe("primary").classList.toggle("advance",!t),Pe("notes").querySelector("span").textContent="Field notes",Pe("current").textContent=Ma(i),Pe("chapter-name").textContent=e.title,Pe("back").disabled=t,Pe("next").disabled=i===Et.length-1,[...Pe("chapter-nav").children].forEach((r,a)=>{a===e.actIndex?r.setAttribute("aria-current","step"):r.removeAttribute("aria-current")}),(t||n)&&Ov(),In?.setPaused(Wn||!t&&!n),(t||n)&&In?.setStage(n?4:0),t||(hu=Dv[e.id](Sa,In));let s=document.querySelector(".intro");s.classList.remove("enter"),Sa.classList.remove("enter"),s.offsetWidth,s.classList.add("enter"),Sa.classList.add("enter"),document.title=e.title+" \xB7 RAMS - Road Accident Monitoring System",Pe("announcement").textContent="Chapter "+(i+1)+" of "+Et.length+". "+e.title}function Xl(){let i=new URL(location.href).searchParams.get("program")==="finals";i!==Ms&&(Ms=i,Et=Ca(Ms),xn=-1,Ep());let e=Et.findIndex(t=>t.id===location.hash.slice(1));Ap(e<0?0:e)}Pe("program").onchange=()=>{let i=Et[xn].id,e=Pe("program").value==="finals",t=Ca(e),n=t.find(r=>r.id===i);if(!n){let r=Ra.slice(0,Ra.findIndex(a=>a.id===i)).map(a=>a.id);n=t.filter(a=>r.includes(a.id)).at(-1)||t[0]}let s=new URL(location.href);e?s.searchParams.set("program","finals"):s.searchParams.delete("program"),s.hash=n.id,history.pushState(null,"",s),Xl()};function Ji(i){i<0||i>=Et.length||(location.hash!=="#"+Et[i].id&&(location.hash=Et[i].id),Ap(i),matchMedia("(max-width:720px)").matches&&window.scrollY>0&&window.scrollTo({top:0,behavior:"instant"}))}function Sp(i){return i.map(([e,t])=>{let n=document.createElement("p"),s=document.createElement("strong");return s.textContent=e,n.append(s,document.createElement("br"),t),n})}function Vl(i){if(Vn.open)return;uu=document.activeElement;let e=Et[xn],t=Pe("drawer-body");if(Pe("drawer-label").textContent=i==="index"?"INNOVATEX 2026":"CHAPTER "+Ma(xn)+" / "+String(Et.length).padStart(2,"0"),Pe("drawer-title").textContent=i==="index"?"Chapter index":e.title+" field notes",t.replaceChildren(),i==="index")Ii.forEach((n,s)=>{let r=document.createElement("h3");r.className="index-part",r.textContent=n.title+" \xB7 "+n.speaker,t.append(r),Et.forEach((a,o)=>{a.actIndex===s&&t.append(Tp(a,o,!0))})});else{let n=document.createElement("p");n.textContent=Ii[e.actIndex].speaker+" \xB7 Suggested timing "+e.timing+" of "+Aa(Et.reduce((u,d)=>u+d.duration,0)),t.append(n);let s=Uu.chapters[e.id],r=document.createElement("details");r.className="presenter-script";let a=document.createElement("summary");if(a.textContent="Presenter script",r.append(a,...Sp(Ms?s.finals:s.full)),s.more.length&&!Ms){let u=document.createElement("details"),d=document.createElement("summary");d.textContent="Other controls and questions",u.append(d,...Sp(s.more)),r.append(u)}let o=document.createElement("p");for(let[u,d]of[["RAMS InnovateX 2026 National Finals Slides.pdf","Finals slides (PDF)"],["RAMS Presenter Script.pdf","Print script (PDF)"],["RAMS Presenter Script.docx","Edit script (Word)"]]){let f=document.createElement("a");f.href="public/presenters/"+u,f.target="_blank",f.rel="noopener",f.textContent=d,o.childNodes.length&&o.append(" \xB7 "),o.append(f)}if(r.append(o),t.append(r),xn===Et.findIndex(u=>u.actIndex===e.actIndex)){let u=document.createElement("p");u.textContent=Ii[e.actIndex].cue,t.append(u)}e.notes.forEach(u=>{let d=document.createElement("h3"),f=document.createElement("p");d.textContent=u.title,f.textContent=u.text,t.append(d,f)});let c=document.createElement("details"),l=document.createElement("summary");l.textContent="Inspect source records ("+e.sources.length+")",c.append(l);let h=document.createElement("ul");h.className="source-list";for(let u of e.sources){let d=document.createElement("li"),f=document.createElement("code"),g="docs/InnovateX Files/RAMS Presentation/",x=location.protocol==="file:"&&decodeURIComponent(location.pathname).includes("/"+g),m=/^https:\/\//.test(u.path)?u.path:u.path.startsWith(g)?u.path.slice(g.length):x?"../../../"+u.path:"";if(m){let p=document.createElement("a");p.textContent=u.label,p.href=m,p.target="_blank",p.rel="noopener",d.append(p)}else d.append(u.label);f.textContent=u.displayPath||u.path,d.append(f),h.append(d)}c.append(h),t.append(c)}Vn.showModal(),In?.setPaused(!0),Pe("close").focus()}Vn.addEventListener("close",()=>{In?.setPaused(Wn||!wp()),uu?.isConnected&&uu.focus({preventScroll:!0})});Vn.addEventListener("click",i=>{if(i.target===Vn){let e=Vn.getBoundingClientRect();(i.clientX<e.left||i.clientX>e.right||i.clientY<e.top||i.clientY>e.bottom)&&Vn.close()}});Pe("open-index").onclick=()=>Vl("index");Pe("notes").onclick=()=>Vl("notes");Pe("close").onclick=()=>Vn.close();Pe("back").onclick=()=>Ji(xn-1);Pe("next").onclick=()=>Ji(xn+1);Pe("primary").onclick=()=>Ji((xn+1)%Et.length);Pe("scan").onclick=()=>In?.scan();Pe("rain").onclick=()=>{Hl=!Hl,In?.setRain(Hl),Wl()};Pe("motion").onclick=()=>{Wn=!Wn,In?.setPaused(Wn),Wl()};async function Rp(){try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch{Pe("announcement").textContent="Fullscreen is unavailable in this browser panel."}}document.fullscreenEnabled||(Pe("full").hidden=!0);Pe("full").onclick=Rp;document.addEventListener("fullscreenchange",()=>{let i=!!document.fullscreenElement;Pe("full").innerHTML=Ot(i?"exit":"full"),Pe("full").setAttribute("aria-label",i?"Exit fullscreen":"Enter fullscreen"),Pe("full").title=Pe("full").getAttribute("aria-label")+" (F)"});document.addEventListener("keydown",i=>{if(i.defaultPrevented||i.altKey||i.ctrlKey||i.metaKey||document.querySelector("dialog[open]")||i.target.matches("input,textarea,select,[contenteditable=true]"))return;let e=i.key;e==="ArrowRight"||e==="PageDown"||e===" "&&!i.target.closest("button,a")?(i.preventDefault(),Ji(xn+1)):e==="ArrowLeft"||e==="PageUp"?(i.preventDefault(),Ji(xn-1)):e==="Home"?(i.preventDefault(),Ji(0)):e==="End"?(i.preventDefault(),Ji(Et.length-1)):e.toLowerCase()==="f"&&document.fullscreenEnabled?Rp():e.toLowerCase()==="n"?Vl("notes"):e.toLowerCase()==="i"&&Vl("index")});window.addEventListener("hashchange",Xl);window.addEventListener("popstate",Xl);document.querySelector(".skip").addEventListener("click",i=>{i.preventDefault(),Gl.focus()});Mp.addEventListener("change",i=>{Wn=i.matches,In?.setPaused(Wn||Vn.open||!wp()),Wl()});Wl();Xl();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
