---
name: openrouter-glm
description: >
  Local and terminal generative AI assistant powered by OpenRouter (GLM-5.3-Flash, Qwen 3 Coder, Gemma 4).
  Provides a multi-model fallback roster with one-click switching across Claude Code, Kilo Code,
  and local PCB/schematic design CLI tools.
argument-hint: "[glm|qwen|gemma|gemma-free|--status|--chat]"
license: MIT
---

# Multi-Model OpenRouter Suite (GLM-5.3-Flash, Qwen, Gemma 4)

This skill manages the local AI model roster across **Claude Code**, **Kilo Code** (Antigravity IDE), and **local terminal CLI tools** (`ask_pcb`, `ask_glm`, and local proxy), powered by OpenRouter.

> [!IMPORTANT]
> All models are scoped exclusively to the desktop development environment, Claude Code agent sessions, and PCB/schematics analysis. No models are deployed to the RAMS mobile app or firmware.

---

## 1. Supported Model Roster

| Key | Model Name | OpenRouter Slug | Context | Best Used For |
| :--- | :--- | :--- | :--- | :--- |
| **`glm`** | GLM-5.3-Flash | `z-ai/glm-5.3-flash` | 128k | High-speed general reasoning, PCB layout, fast analysis (Default $100 budget) |
| **`qwen`** | Qwen 3 Coder | `qwen/qwen3-coder` | 262k | Complex code refactoring, full tool-use agent sessions with Claude Code |
| **`qwen25`**| Qwen 2.5 Coder 32B | `qwen/qwen-2.5-coder-32b-instruct` | 32k | Fast terminal coding queries, scripts, algorithm analysis |
| **`gemma`** | Gemma 4 31B | `google/gemma-4-31b-it` | 128k | Google reasoning model, multi-turn technical documentation, architecture audits |
| **`gemma-free`**| Gemma 4 26B Free | `google/gemma-4-26b-a4b-it:free` | 128k | 100% Free OpenRouter Tier fallback |

---

## 2. Instant Model Switching (`switch_model`)

Switch the active model across **Claude Code**, **Kilo Code**, and **all CLI tools** with a single command:

```cmd
:: Switch to Qwen 3 Coder
switch_model qwen

:: Switch to Google Gemma 4 31B
switch_model gemma

:: Switch to GLM-5.3-Flash
switch_model glm

:: Switch to Free Tier Gemma
switch_model gemma-free

:: Check currently active model
switch_model --status

:: Interactive numbered menu
switch_model
```

### What `switch_model` updates automatically:
1. **Claude Code**: Updates `.claude/settings.local.json` environment variables (`ANTHROPIC_DEFAULT_*_MODEL`, `CLAUDE_CODE_SUBAGENT_MODEL`).
2. **Kilo Code**: Updates Antigravity IDE `settings.json` (`kilo-code.new.model.modelID` and `kilo-code.new.claudeCodeCompat: true`).
3. **Workspace State**: Updates `.active_model` so `ask_glm`, `ask_pcb`, and `local_llm_proxy.py` inherit the active model instantly.

---

## 3. Claude Code Integration

Claude Code is globally installed (`@anthropic-ai/claude-code`) and automatically routes through OpenRouter using `.claude/settings.local.json`.

### Launching Claude Code:
```cmd
:: Launch interactive Claude Code session with the current active model
claude-or

:: Or launch directly with a specific model on the fly
claude-or qwen
claude-or gemma
claude-or glm

:: Standard claude command also works directly in this workspace
claude
```

---

## 4. Hardware & KiCad PCB Design Tools

```cmd
:: Ask hardware design / layout questions using active model with PCB persona
ask_pcb "What is the recommended fanout strategy for 0.4mm pitch QFN-48 MCU pads?"

:: Feed a circuit spec, netlist, or schematic to audit
ask_pcb -f "hardware/KiCAD Files/DeepSeek Build/RAMS Wearable/circuit_spec.json" "Audit the power rail and BMS protection"

:: Review KiCad DRC or ERC error logs
ask_pcb -f "hardware/KiCAD Files/DeepSeek Build/RAMS Wearable/verification/deepseek_final/drc.json" "Explain why these 5 nets failed to route"
```

---

## 5. Local OpenAI-Compatible Proxy Server

Launch the local proxy on `http://127.0.0.1:5000/v1` for any other tool:

```cmd
start_local_glm_proxy.bat
```
- **Base URL**: `http://127.0.0.1:5000/v1`
- **API Key**: `sk-local`
- Automatically routes to the currently active model in `.active_model`.
