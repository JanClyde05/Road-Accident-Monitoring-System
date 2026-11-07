# System Logging Directive & Architectural Registry Protocol

## 1. Directive Overview
Any architectural creation, machine learning specification, training dataset modification, hardware correction, or critical bug fix must always be persistently logged into the codebase documentation. Never leave key model identities, parameters, or dataset structures solely inside runtime memory or ephemeral chat contexts.

## 2. Mandatory Logging Checklist
Whenever modifying or introducing system capabilities:
1. **AI / ML Models**:
   - Model Name (e.g. `RAMS-1.8B-Edge`)
   - Model Version (e.g. `v2.5-Edge`)
   - Parameter Count (e.g. `1.8 Billion / 1.8B`)
   - Architecture (e.g. `Transformer Decoder-Only with GQA, RoPE & SwiGLU`)
   - Quantization (e.g. `4-bit AWQ / Int4 Quantized`)
   - Context Window (e.g. `4096 tokens`)
   - Domain & Modality (e.g. `Vehicle Kinematics, Crash Cognition, Voice AI`)
   - Target Hardware (e.g. `Android On-Device NPU / CPU`)
2. **Datasets & Voice Patterns**:
   - Training sample count (e.g. `528 acoustic samples`)
   - Language / Dialect coverage (e.g. `en-US`, `en-PH`, `fil-PH`, `tl-PH`)
   - Homophone matrices and regex patterns
   - Cancel / Abort vocabulary and audio ducking parameters
3. **Primary Logging Targets**:
   - `MEMORY_MAP.md` (Repository root master reference)
   - `docs/MD Files/RAMS_OBSIDIAN_MEMORY_MAP.md` (Obsidian knowledge graph)
   - `docs/MD Files/RAMS_AI_LLM_SPECIFICATION.md` (Formal model specification)
   - Subsystem `README.md` or local markdown contracts

