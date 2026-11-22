# RAMS Agent Operating Guidelines & Master System Architecture

## 0. Project Name Authority (Binding)

This project is **RAMS - Road Accident Monitoring System**.

- Canonical folder: `D:\Antigravity\Projects\Road Accident Monitoring System`
- Canonical title: `RAMS - Road Accident Monitoring System`
- **Retired names.** `Danger Monitoring System`, `Danger Monitoring System V2`
  and `DMS V2` are obsolete. Do not use them in new code, docs, UI strings,
  commit messages, file names or folder names. If an existing file still
  carries one of the retired names, replace it when you next touch that file.
- Historical artifacts (build logs, `evidence/`, `reports/`, `verification/`,
  `docs/agent/verification-log.jsonl`) are immutable records. Leave retired
  names inside them untouched; rewriting a log would falsify the record.
- The workspace is bound by path, not by name. If the folder is renamed again,
  update this section first so every agent inherits the new path.


## 1. Ponytail Decision Ladder (Token Optimization)
Follow the "lazy senior developer" mindset on every interaction to minimize token burn and eliminate code bloat:
1. **YAGNI (You Ain't Gonna Need It)**: Don't build what wasn't requested. Keep solutions minimal.
2. **Reuse**: Always inspect existing helpers across `firmware/shared/`, `apps/desktop_app/`, `apps/android_app/`, `firmware/wearable_withApp/`, `firmware/receiver_withDesktop/`, and `hardware/KiCAD Files/`.
3. **Stdlib / Platform First**: Rely on native APIs (standard library, Android OS, Windows .NET, KiCad Python) before creating custom abstractions.
4. **No New Dependencies**: Use existing dependencies already configured in the repo.
5. **Shortest Working Diff**: Concise, surgical modifications win over rewriting files.
6. **Safety Invariants**: Never compromise hardware timings (LoRa/SPI/GATT), calibration, data validation, or user requirements.
7. **One-Read Concise Output**: Format responses so a busy human understands the outcome immediately without repetitive summaries.

## 2. ICM: Interpretable Context Methodology (Jake Van Clief Protocol)
Replace complex framework orchestration and massive prompt stuffing with filesystem-as-context:
1. **Filesystem as Context Router**: Navigate directory stages directly (`DIRECTORY_MAP.md`, `00_SYSTEM_ARCHITECTURE.md`, `firmware/`, `apps/`, `hardware/KiCAD Files/`, `docs/`).
2. **Local Markdown Contracts**: Consult the local markdown specification (`README.md`, memory map, or header) before touching code.
3. **Deterministic Local Scripts**: Always use local Python, PowerShell, or Bash scripts for repetitive, mechanical, or heavy tasks (e.g., builds, gerber generation, DRC checks, deployments) instead of executing line-by-line manual file edits.
4. **Surgical Context Loading**: Read only the specific file or lines needed for the current step. Never dump unneeded subsystem trees into context.

## 3. RAMS Master System Anchors (Graphify & Obsidian)
- **Execution Plan (start here)**: [docs/agent/EXECUTION_PLAN.md](docs/agent/EXECUTION_PLAN.md)
- **Directory Map & Navigation Index**: [DIRECTORY_MAP.md](file:///d:/Antigravity/Projects/Road%20Accident%20Monitoring%20System/DIRECTORY_MAP.md)
- **Memory Map & Graphify Reference**: [MEMORY_MAP.md](file:///d:/Antigravity/Projects/Road%20Accident%20Monitoring%20System/MEMORY_MAP.md)
- **Obsidian Memory Map**: [RAMS_OBSIDIAN_MEMORY_MAP.md](file:///d:/Antigravity/Projects/Road%20Accident%20Monitoring%20System/docs/MD%20Files/RAMS_OBSIDIAN_MEMORY_MAP.md)
- **System Architecture**: [00_SYSTEM_ARCHITECTURE.md](file:///d:/Antigravity/Projects/Road%20Accident%20Monitoring%20System/00_SYSTEM_ARCHITECTURE.md)
- **Design Guidelines (Zero-Emoji)**: [DESIGN_RULES.md](file:///d:/Antigravity/Projects/Road%20Accident%20Monitoring%20System/DESIGN_RULES.md)
- **Shared LoRa Packet Protocol**: [protocol.h](file:///d:/Antigravity/Projects/Road%20Accident%20Monitoring%20System/firmware/shared/protocol.h)
- **Hardware & Manufacturing**: [hardware/KiCAD Files/Antigravity Build/RAMS - PCB - Rev C/](file:///d:/Antigravity/Projects/Road%20Accident%20Monitoring%20System/hardware/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB%20-%20Rev%20C/)

## 4. Multi-Account & Persistent Workspace Enforcement
These instructions and rules are bound directly to the workspace repository root (`AGENTS.md`, `GEMINI.md`, and `.agents/rules/`). They persist across all user accounts, agent sessions, subagents, and IDE instances. The agent must enforce them unconditionally.

## 5. Mandatory Technical Logging Directive
All significant architectural additions, model specifications, training datasets, and engineering decisions must ALWAYS be logged to persistent system records:
1. **Model & Algorithm Specifications**: Log model name, version, parameter count (e.g., 1.8B), architecture (e.g., Decoder-Only SwiGLU GQA/RoPE), quantization (e.g., Int4 AWQ), and inference constraints directly in `MEMORY_MAP.md` and `docs/`.
2. **Acoustic & Sensor Datasets**: Log training corpus details, phonetic homophone matrices, sample counts, and threshold calibrations.
3. **Hardware, Bug Fixes & Timings**: Log critical bug fixes (e.g., binder crashes, watchdog timers, touch interception, PCB footprints) in `MEMORY_MAP.md` and relevant subsystem markdown contracts before completing tasks.

## 6. Verification Gate (Mandatory Before Claiming a Fix)
The agent engineering system lives in `docs/agent/` (plans, incident ledger, lessons) and `scripts/verify/` (executable gates). Claims of a fix must be backed by a run, not by inspection alone.

1. **Static invariants**: `python scripts/verify/check_invariants.py` must report zero FAIL for the touched area. Every check maps to an `INC-` entry in `docs/agent/INCIDENT_LEDGER.md`.
2. **Builds**: `powershell scripts/verify/verify_all.ps1 -Build all` must pass, or the skipped target must be named with a reason.
3. **Records**: append the outcome via the harness (it writes `docs/agent/verification-log.jsonl`), and add a lesson to `docs/agent/LESSONS.md` for any new defect class.
4. **Rules**: `.agents/rules/00-rams-invariants.md` carries the machine-checked constraints. Do not weaken a check to make a run green; fix the code or record an accepted risk in the ledger.


