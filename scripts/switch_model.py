#!/usr/bin/env python3
"""
RAMS Model Switcher for Claude Code, Kilo Code, and CLI
=======================================================
Switches the active OpenRouter model across:
  1. Claude Code CLI (.claude/settings.local.json)
  2. Kilo Code (Antigravity IDE User settings.json)
  3. CLI scripts (ask_glm, ask_pcb, and local_llm_proxy)

Usage:
  python switch_model.py glm
  python switch_model.py qwen
  python switch_model.py gemma
  python switch_model.py gemma-free
  python switch_model.py --status
  python switch_model.py (interactive menu)
"""

import os
import sys
import json
import argparse

OPENROUTER_API_KEY = os.environ.get(
    "OPENROUTER_API_KEY",
    ""
)

ROSTER = {
    "glm": {
        "key": "glm",
        "name": "GLM-5.3-Flash",
        "slug": "z-ai/glm-5.3-flash",
        "desc": "Z-AI GLM-5.3-Flash (Fast reasoning, 128k context, default $100 budget)",
        "aliases": ["glm", "glm5", "glm-5", "glm-flash", "z-ai"]
    },
    "qwen": {
        "key": "qwen",
        "name": "Qwen 3 Coder",
        "slug": "qwen/qwen3-coder",
        "desc": "Alibaba Qwen 3 Coder (Top code generation & tool use, 262k context)",
        "aliases": ["qwen", "qwen3", "qwencoder", "qwen-coder", "coder"]
    },
    "qwen25": {
        "key": "qwen25",
        "name": "Qwen 2.5 Coder 32B",
        "slug": "qwen/qwen-2.5-coder-32b-instruct",
        "desc": "Alibaba Qwen 2.5 Coder 32B (Standard terminal/CLI coding, 32k context)",
        "aliases": ["qwen25", "qwen-2.5", "qwen32b"]
    },
    "gemma": {
        "key": "gemma",
        "name": "Gemma 4 31B",
        "slug": "google/gemma-4-31b-it",
        "desc": "Google Gemma 4 31B Instruct (Full tool-use & agent support, high speed)",
        "aliases": ["gemma", "gemma4", "gemma-4", "gemma31b", "google"]
    },
    "gemma-free": {
        "key": "gemma-free",
        "name": "Gemma 4 26B Free",
        "slug": "google/gemma-4-26b-a4b-it:free",
        "desc": "Google Gemma 4 26B Instruct (100% Free OpenRouter Tier)",
        "aliases": ["gemma-free", "gemma4-free", "free-gemma", "free"]
    }
}

DEFAULT_MODEL_KEY = "glm"

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ACTIVE_MODEL_FILE = os.path.join(REPO_ROOT, ".active_model")
CLAUDE_SETTINGS_DIR = os.path.join(REPO_ROOT, ".claude")
CLAUDE_SETTINGS_FILE = os.path.join(CLAUDE_SETTINGS_DIR, "settings.local.json")
IDE_SETTINGS_FILE = os.path.expanduser(
    r"~\AppData\Roaming\Antigravity IDE\User\settings.json"
)

def get_current_active():
    if os.path.exists(ACTIVE_MODEL_FILE):
        try:
            with open(ACTIVE_MODEL_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("slug", ROSTER[DEFAULT_MODEL_KEY]["slug"]), data.get("name", "Unknown")
        except Exception:
            pass
    return ROSTER[DEFAULT_MODEL_KEY]["slug"], ROSTER[DEFAULT_MODEL_KEY]["name"]

def update_claude_settings(model_slug):
    os.makedirs(CLAUDE_SETTINGS_DIR, exist_ok=True)
    payload = {
        "env": {
            "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
            "ANTHROPIC_AUTH_TOKEN": OPENROUTER_API_KEY,
            "ANTHROPIC_API_KEY": "",
            "ANTHROPIC_DEFAULT_SONNET_MODEL": model_slug,
            "ANTHROPIC_DEFAULT_OPUS_MODEL": model_slug,
            "ANTHROPIC_DEFAULT_HAIKU_MODEL": model_slug,
            "CLAUDE_CODE_SUBAGENT_MODEL": model_slug
        }
    }
    with open(CLAUDE_SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

def update_kilo_settings(model_slug):
    if not os.path.exists(IDE_SETTINGS_FILE):
        return False
    try:
        with open(IDE_SETTINGS_FILE, "r", encoding="utf-8") as f:
            settings = json.load(f)
        settings["kilo-code.new.model.providerID"] = "openrouter"
        settings["kilo-code.new.model.modelID"] = model_slug
        settings["kilo-code.new.claudeCodeCompat"] = True
        with open(IDE_SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(settings, f, indent=4)
        return True
    except Exception as e:
        sys.stderr.write(f"Warning: Failed to update IDE settings: {e}\n")
        return False

def set_active_model(item):
    slug = item["slug"]
    name = item["name"]

    # 1. Write .active_model
    with open(ACTIVE_MODEL_FILE, "w", encoding="utf-8") as f:
        json.dump({"key": item["key"], "name": name, "slug": slug}, f, indent=2)

    # 2. Update Claude Code settings
    update_claude_settings(slug)

    # 3. Update Kilo Code IDE settings
    kilo_ok = update_kilo_settings(slug)

    print("=" * 65)
    print(f"  ACTIVE MODEL SWITCHED TO: {name}")
    print("=" * 65)
    print(f"  Model Slug:    {slug}")
    print(f"  Claude Code:   Configured via .claude/settings.local.json")
    print(f"  Kilo Code:     {'Updated in IDE settings.json' if kilo_ok else 'Manual update required'}")
    print(f"  CLI Tools:     Updated (ask_glm, ask_pcb, local proxy)")
    print("=" * 65)
    print(f"  Run 'claude' or 'claude-or' to launch Claude Code with {name}!")
    print("=" * 65)

def print_status():
    slug, name = get_current_active()
    print("=" * 65)
    print(f"  CURRENT ACTIVE MODEL: {name}")
    print(f"  OpenRouter Slug:      {slug}")
    print("=" * 65)
    print("  Available Roster:")
    for k, v in ROSTER.items():
        marker = "-> [ACTIVE]" if v["slug"] == slug else "  "
        print(f"  {marker} [{k}] {v['name']}: {v['slug']}")
    print("=" * 65)

def match_model(arg):
    clean = arg.strip().lower()
    for k, v in ROSTER.items():
        if clean == k or clean == v["slug"].lower() or clean in v["aliases"]:
            return v
    return None

def interactive_menu():
    slug, name = get_current_active()
    print("=" * 65)
    print("  RAMS Model Selector (Claude Code + Kilo Code + CLI)")
    print("=" * 65)
    print(f"  Currently Active: {name} ({slug})")
    print("-" * 65)
    items = list(ROSTER.values())
    for idx, item in enumerate(items, 1):
        marker = "*" if item["slug"] == slug else " "
        print(f"  [{idx}] {marker} {item['name']:<18} ({item['slug']})")
        print(f"       {item['desc']}")
    print("=" * 65)

    try:
        choice = input("Select model [1-5] (or Enter to keep current): ").strip()
    except (KeyboardInterrupt, EOFError):
        print("\nCancelled.")
        return

    if not choice:
        print("No change made.")
        return

    try:
        num = int(choice)
        if 1 <= num <= len(items):
            set_active_model(items[num - 1])
        else:
            print("Invalid selection.")
    except ValueError:
        matched = match_model(choice)
        if matched:
            set_active_model(matched)
        else:
            print(f"Unrecognized model or key: '{choice}'")

def main():
    parser = argparse.ArgumentParser(description="Switch OpenRouter model across Claude Code, Kilo Code, and CLI tools")
    parser.add_argument("model", nargs="?", help="Model key or alias: glm, qwen, gemma, gemma-free")
    parser.add_argument("--status", action="store_true", help="Display current active model status")
    parser.add_argument("--list", action="store_true", help="List available models")

    args = parser.parse_args()

    if args.status or args.list:
        print_status()
        return

    if not args.model:
        interactive_menu()
        return

    matched = match_model(args.model)
    if matched:
        set_active_model(matched)
    else:
        print(f"Error: Unknown model '{args.model}'.")
        print("Available models: " + ", ".join(ROSTER.keys()))
        sys.exit(1)

if __name__ == "__main__":
    main()

