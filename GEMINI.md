# RAMS Workspace Rules & Operating Directives

## 1. Ponytail Decision Ladder (Token Usage Optimization)
Enforce the "lazy senior developer" mindset on every interaction:
1. **YAGNI**: Don't build what wasn't requested. Keep modifications minimal.
2. **Reuse**: Always inspect existing helpers across `shared/`, `desktop_app/`, `android_app/`, `wearable_withApp/`, `receiver_withDesktop/`, and `KiCAD Files/`.
3. **Stdlib / Platform First**: Rely on native APIs before creating custom abstractions.
4. **No New Dependencies**: Use existing dependencies already configured in the repo.
5. **Shortest Working Diff**: Concise, surgical modifications win over rewriting files.
6. **Safety Invariants**: Never compromise hardware timings (LoRa/SPI/GATT), calibration, data validation, or user requirements.
7. **One-Read Concise Output**: Answer directly and cleanly; avoid repeating artifacts or chatty fluff.

## 2. ICM: Interpretable Context Methodology (Jake Van Clief Protocol)
Replace framework orchestration and monolithic prompt stuffing with filesystem-as-context:
1. **Filesystem as Context Router**: Navigate directly to the relevant subsystem directory (`00_SYSTEM_ARCHITECTURE.md`, `shared/`, `wearable_withApp/`, `android_app/`, `desktop_app/`, `KiCAD Files/`).
2. **Local Markdown Contracts**: Consult the local markdown specification before touching code.
3. **Deterministic Local Scripts**: Use local Python, PowerShell, or Bash scripts for repetitive, mechanical, or heavy tasks (e.g., builds, gerber generation, DRC checks, deployments) instead of line-by-line LLM file modifications.
4. **Surgical Context Loading**: Read only the specific lines or files needed for the immediate step.

## 3. RAMS Master System Anchors (Graphify & Obsidian)
- **Memory Map & Graphify Reference**: [MEMORY_MAP.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/MEMORY_MAP.md)
- **Obsidian Memory Map**: [RAMS_OBSIDIAN_MEMORY_MAP.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/MD%20Files/RAMS_OBSIDIAN_MEMORY_MAP.md)
- **System Architecture**: [00_SYSTEM_ARCHITECTURE.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/00_SYSTEM_ARCHITECTURE.md)
- **Design Guidelines (Zero-Emoji)**: [DESIGN_RULES.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/DESIGN_RULES.md)
- **Shared LoRa Packet Protocol**: [protocol.h](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/shared/protocol.h)
- **Hardware & Manufacturing**: [KiCAD Files/Antigravity Build/RAMS - PCB/](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/KiCAD%20Files/Antigravity%20Build/RAMS%20-%20PCB/)

## 4. Multi-Account & Persistent Workspace Enforcement
These instructions are bound directly to this workspace repository. They persist across all user accounts, agent sessions, subagents, and IDE instances.
