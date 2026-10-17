# Interpretable Context Methodology (ICM) - Jake Van Clief Protocol

## Core Principle: Folder Structure as Agentic Architecture
ICM replaces bulky framework orchestration and monolithic context stuffing with clean filesystem architecture:
1. **Filesystem as Context Router**: The agent navigates directory trees surgically. Context is localized to the active subsystem directory (`wearable_withApp/`, `android_app/`, `desktop_app/`, `KiCAD Files/`, `shared/`).
2. **Plain Markdown Contracts**: Every subsystem must provide or reference a markdown anchor (`README.md`, memory map, or system architecture doc) describing inputs, outputs, and invariants.
3. **Deterministic Local Scripts**: All repetitive, mechanical, or calculation-heavy tasks (builds, gerber exports, DRC checks, deployments) are delegated to local Python/PowerShell/Bash scripts rather than burning tokens simulating execution.
4. **Unix Philosophy**: One component, one job. Universal plain-text interfaces (JSON, CSV, Markdown, S-expressions).
5. **Token Discipline**: Load only the specific markdown anchor needed for the task at hand. Never dump unneeded subsystem files into working context.

## Integration with RAMS
- **Stage 0 (Architecture & Rules)**: `00_SYSTEM_ARCHITECTURE.md`, `AGENTS.md`, `DESIGN_RULES.md`
- **Stage 1 (Hardware & Schematic)**: `KiCAD Files/Antigravity Build/RAMS - PCB/`
- **Stage 2 (Protocol Invariants)**: `shared/protocol.h`
- **Stage 3 (Wearable Relay Firmware)**: `wearable_withApp/`
- **Stage 4 (Receiver Base Station)**: `receiver_withDesktop/`
- **Stage 5 (Companion Smartphone Station)**: `android_app/`
- **Stage 6 (Operations Command Center)**: `desktop_app/`
- **Stage 7 (Analysis & Calibration)**: `RAMS IMU Studio Application/`
