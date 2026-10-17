# RAMS Agent Operating Guidelines & Master System Architecture

## 1. Ponytail Decision Ladder (Token Optimization)
Follow the "lazy senior developer" mindset on every interaction to minimize token burn and eliminate code bloat:
1. **YAGNI (You Ain't Gonna Need It)**: Don't build what wasn't requested. Keep solutions minimal.
2. **Reuse**: Always inspect existing helpers across `shared/`, `desktop_app/`, `android_app/`, `wearable_withApp/`, `receiver_withDesktop/`, and `KiCAD Files/`.
3. **Stdlib / Platform First**: Rely on native APIs (standard library, Android OS, Windows .NET, KiCad Python) before creating custom abstractions.
4. **No New Dependencies**: Use existing dependencies already configured in the repo.
5. **Shortest Working Diff**: Concise, surgical modifications win over rewriting files.
6. **Safety Invariants**: Never compromise hardware timings (LoRa/SPI/GATT), calibration, data validation, or user requirements.
7. **One-Read Concise Output**: Format responses so a busy human understands the outcome immediately without repetitive summaries.

## 2. ICM: Interpretable Context Methodology (Jake Van Clief Protocol)
Replace complex framework orchestration and massive prompt stuffing with filesystem-as-context:
1. **Filesystem as Context Router**: Navigate directory stages directly (`00_SYSTEM_ARCHITECTURE.md`, `shared/`, `wearable_withApp/`, `android_app/`, `desktop_app/`, `KiCAD Files/`).
2. **Local Markdown Contracts**: Consult the local markdown specification (`README.md`, memory map, or header) before touching code.
3. **Deterministic Local Scripts**: Always use local Python, PowerShell, or Bash scripts for repetitive, mechanical, or heavy tasks (e.g., builds, gerber generation, DRC checks, deployments) instead of executing line-by-line manual file edits.
4. **Surgical Context Loading**: Read only the specific file or lines needed for the current step. Never dump unneeded subsystem trees into context.

## 3. RAMS Master System Anchors (Graphify & Obsidian)
- **Memory Map & Graphify Reference**: [MEMORY_MAP.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/MEMORY_MAP.md)
- **Obsidian Memory Map**: [RAMS_OBSIDIAN_MEMORY_MAP.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/MD%20Files/RAMS_OBSIDIAN_MEMORY_MAP.md)
- **System Architecture**: [00_SYSTEM_ARCHITECTURE.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/00_SYSTEM_ARCHITECTURE.md)
- **Design Guidelines (Zero-Emoji)**: [DESIGN_RULES.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/DESIGN_RULES.md)
- **Shared LoRa Packet Protocol**: [protocol.h](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/shared/protocol.h)
- **Hardware & Manufacturing**: [KiCAD Files/Antigravity Build/RAMS - PCB/](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB/)

## 4. Multi-Account & Persistent Workspace Enforcement
These instructions and rules are bound directly to the workspace repository root (`AGENTS.md`, `GEMINI.md`, and `.agents/rules/`). They persist across all user accounts, agent sessions, subagents, and IDE instances. The agent must enforce them unconditionally.
