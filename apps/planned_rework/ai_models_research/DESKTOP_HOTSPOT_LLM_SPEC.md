# Desktop Command Center AI & Hotspot Prediction Specification

**Road Accident Monitoring System (RAMS)**  
*Target: Windows Desktop Rescuer Application (`apps/desktop_app/`)*  
*Role: Municipal Emergency Dispatch & Road Safety Analytics*  
*Standard: Zero-Emoji Technical Architecture & Evaluation Matrix*

---

## 1. Operational Requirements for the Command Center

The RAMS Desktop Application operates inside emergency command and dispatch facilities (such as the Tuguegarao City Disaster Risk Reduction and Management Office - CDRRMO, or PNP Highway Patrol Group).

The system continuously logs emergency incidents received over USB Serial from the LoRa Base Station (`receiver_withDesktop`) and HTTP/TCP cloud fallbacks into `incidents.json`.

In accordance with the IECEP Nationals AI requirements, the reworked desktop system introduces two complementary AI capabilities:
1. **Deterministic Spatial Hotspot Prediction Engine**: Analyzes accumulated incident coordinates, speeds, impact forces, and timestamps to cluster accident zones, predict emerging high-danger road corridors, and identify accident-prone road segments (e.g. Balzain Highway, Buntun Bridge, Caggay Junction).
2. **Local Command Center LLM (Emergency Intelligence Analyst)**: An offline, local language model running directly on the dispatch PC to evaluate clustered incident patterns, predict peak danger hours, and automatically draft structured municipal incident reports and hazard mitigation advisories.

---

## 2. Spatial Hotspot Clustering & Risk Scoring Algorithm

Rather than hallucinating coordinates with an LLM, spatial clustering must use a rigorous, deterministic mathematical algorithm:

### Haversine DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
DBSCAN is ideal for road accidents because:
- It does not require specifying the number of clusters in advance (unlike K-Means).
- It handles arbitrary road geometries (linear highway corridors, intersections, roundabouts).
- It automatically isolates isolated one-off anomalies as noise while identifying high-density blackspots.

### Mathematical Formulation
Given two incident points $P_1 = (\phi_1, \lambda_1)$ and $P_2 = (\phi_2, \lambda_2)$:

$$d(P_1, P_2) = 2 R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos \phi_1 \cos \phi_2 \sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)$$

Where $R = 6371000\text{ meters}$ (Earth mean radius).

### Hyperparameters for Urban Accident Corridors
- **Epsilon ($\epsilon$)**: $150\text{ meters}$ (radius of neighborhood around an intersection or road segment).
- **MinPoints ($MinPts$)**: $3\text{ incidents}$ within $\epsilon$ radius to qualify as an active Accident Hotspot.

### Hotspot Danger Index (HDI) Formula
For each identified cluster $C_k$, the system calculates an aggregate danger index:

$$\text{HDI}_k = \sum_{i \in C_k} \left( 1.0 + 0.25 \cdot \text{PeakG}_i + 0.15 \cdot \frac{\text{SpeedKmh}_i}{10} + w_{\text{unresponsive}} \right)$$

Where:
- $\text{PeakG}_i$: Deceleration impact magnitude recorded by wearable MPU-6050.
- $\text{SpeedKmh}_i$: GPS velocity at point of collision.
- $w_{\text{unresponsive}} = 2.5$ if the rider was confirmed unresponsive post-collision.

---

## 3. Desktop Local LLM Benchmark & Architecture Selection

The emergency command center PC operates in isolated municipal networks without high-end cloud dependencies. The model must run locally on Windows with zero cloud API keys or external data leakage.

| Model Candidate | Parameter Count | Quantization | RAM Footprint | Inference Speed (CPU) | Command Center Suitability |
|---|---|---|---|---|---|
| **Llama-3.2-3B-Instruct** | 3.2 Billion | Q4_K_M GGUF | **2.05 GB** | 18 - 28 tok/s | **RECOMMENDED PRIMARY**: Exceptional multi-step spatial reasoning, concise incident summarization, strict JSON formatting. |
| **Qwen2.5-3B-Instruct** | 3.1 Billion | Q4_K_M GGUF | **2.15 GB** | 16 - 25 tok/s | **ALTERNATIVE PRIMARY**: Outstanding numerical correlation, time-series aggregation, and structured reporting. |
| **Phi-3.5-mini-instruct** | 3.8 Billion | Q4_K_M GGUF | 2.45 GB | 14 - 22 tok/s | Strong technical writing, slightly higher CPU load. |
| **Qwen2.5-1.5B-Instruct** | 1.5 Billion | Q4_K_M GGUF | **1.10 GB** | 32 - 45 tok/s | **BUDGET FALLBACK**: Ideal for older rescue laptops with only 8GB total system RAM. |
| **Llama-3.1-8B-Instruct** | 8.0 Billion | Q4_K_M GGUF | 4.90 GB | 6 - 10 tok/s | High RAM pressure; risk of freezing UI thread on dispatch machines without discrete GPUs. |

### Selected Execution Architecture: Local Ollama / LlamaSharp C# Engine
- **Runtime Option A (Standalone API)**: Local **Ollama** running as a Windows background service (`http://127.0.0.1:11434`), serving `llama3.2:3b-instruct-q4_K_M`.
- **Runtime Option B (Direct In-Process C#)**: **LlamaSharp** (`LLamaSharp.Backend.Cpu`), linking directly into `RAMS_Rescuer_Desktop.exe` for single-binary zero-setup deployment.

---

## 4. Local LLM Analytics Prompting & Incident Report Generation

The C# desktop application executes the DBSCAN algorithm over `incidents.json`. Once clusters are extracted, it prompts the local LLM:

### Prompt Payload Provided to Local LLM
```
You are the RAMS Emergency Dispatch Safety Analyst at the Command Center.
Review the following aggregated accident cluster telemetry for Tuguegarao City:

Cluster ID: HOTSPOT-01
Location: Intersection of Maharlika Hwy & Balzain Rd (17.6184, 121.7241)
Incidents Count: 6 events in the past 14 days
Peak Impact Force: 7.4G (Mean: 5.2G)
Pre-crash Mean Velocity: 52.4 km/h
Temporal Clustering: 5 out of 6 incidents occurred between 19:30 and 22:30 on wet pavement
Unresponsive Casualties: 2 riders

Generate a formal Emergency Operations Center (EOC) Intelligence Brief including:
1. Executive Hazard Assessment
2. Probable Infrastructure / Behavioral Risk Factors
3. Actionable Mitigation Directives for PNP Highway Patrol and City Engineering
```

### Generated Intelligence Output
```markdown
# RAMS COMMAND CENTER INCIDENT INTELLIGENCE BRIEF
**Reference ID**: EOC-HS-2026-001  
**Target Sector**: Balzain Highway Corridor (Lat 17.6184, Lon 121.7241)  
**Risk Level**: CRITICAL (Hotspot Danger Index: 28.4)

### 1. Executive Hazard Assessment
A dangerous high-impact collision cluster has emerged along the Balzain-Maharlika intersection, characterized by 6 motorcycle incidents within 14 days. Deceleration peaks averaging 5.2G and speeds above 50 km/h indicate high-energy broadside or low-side skid impacts occurring immediately prior to traffic signaling transitions.

### 2. Risk Factors Identified
- Nighttime visibility degradation combined with ungrooved wet asphalt between 19:30 and 22:30.
- High-speed approach velocity from the north bypass converging into slow turning traffic.

### 3. Immediate Action Directives
- **CDRRMO Dispatch**: Station emergency medical response unit Patrol-02 on standby at Balzain Junction during peak risk hours (19:00 - 23:00).
- **PNP Highway Patrol**: Enforce speed radar checkpoints along the northbound Maharlika straightaway.
- **City Engineering**: Inspect road surface for oil accumulation and improve intersection floodlighting.
```

