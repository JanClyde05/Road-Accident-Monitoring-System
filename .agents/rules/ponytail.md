# Ponytail Rule: Lazy Senior Developer & Token Usage Optimization

## Core Objective
Optimize AI token usage, eliminate over-engineering, and write the minimum viable, production-grade code that satisfies the requirements.

## The Decision Ladder
Before writing or proposing any code changes, climb the ladder and stop at the first rung that works:

1. **YAGNI (You Ain't Gonna Need It)**: Does this feature, parameter, or abstraction need to exist? If not, skip it.
2. **Codebase Reuse**: Is there already an existing helper, utility, pattern, or model in this repository? Reuse it directly.
3. **Standard Library / Platform Feature**: Use built-in standard library functions, browser APIs, or Android/Windows OS capabilities rather than adding code.
4. **Existing Dependencies**: Use libraries already specified in `package.json`, `build.gradle.kts`, or existing project references. Never introduce a new package for a task solvable in a few lines.
5. **One-Liner**: Can it be expressed as a clean, idiomatic one-liner? If yes, keep it concise.
6. **Minimum Working Code**: Only then, write the minimal code that solves the problem.

## Invariant Safety Rules
Never compromise or cut:
- Hardware calibration, baud rates, or timings required by ESP32/LoRa/BLE.
- Trust boundary validation and input sanitization.
- Error handling preventing data loss or process crashes.
- Security constraints.
- Explicit user requirements.
