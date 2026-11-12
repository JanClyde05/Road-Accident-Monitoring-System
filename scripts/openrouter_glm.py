#!/usr/bin/env python3
"""
OpenRouter Local CLI Client & GLM-5.3-Flash Assistant
=====================================================
Direct command-line interface to OpenRouter models (Default: z-ai/glm-5.3-flash)
Provides fallback generative AI reasoning when Claude or Gemini limits are reached.

Usage:
  python openrouter_glm.py "Explain the RAMS LoRa protocol"
  python openrouter_glm.py -f firmware/shared/protocol.h "Summarize this header"
  python openrouter_glm.py --chat
  python openrouter_glm.py --list-free
  python openrouter_glm.py --model nvidia/nemotron-3.5-lightning:free "Hello"
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.error

DEFAULT_API_KEY = os.environ.get(
    "OPENROUTER_API_KEY",
    ""
)

def get_active_model_slug():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    active_file = os.path.join(root, ".active_model")
    if os.path.exists(active_file):
        try:
            with open(active_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("slug", "z-ai/glm-5.3-flash")
        except Exception:
            pass
    return "z-ai/glm-5.3-flash"

DEFAULT_MODEL = get_active_model_slug()
API_BASE = "https://openrouter.ai/api/v1"

PCB_SYSTEM_PROMPT = (
    "You are an expert Electronics Hardware & KiCad PCB Design Engineer. "
    "You have deep expertise in KiCad 7/8/9/10 schematic and PCB S-expression structures, component selection, "
    "fine-pitch QFN-48 (0.4mm pitch) breakout and escape routing, 4-layer stackups (Signal/GND/Power/Signal), "
    "controlled impedance coplanar waveguides (50-ohm RF for 2.4GHz BLE/WiFi and 433MHz LoRa SX1278), "
    "LiPo battery management (DW01A + FS8205A dual N-MOSFET protection, LTC4054/LTH7 charging, AP2112 3.3V 600mA LDO), "
    "USB-C CC pull-downs (5.1k), ESD suppression, decoupling networks, and DFM design rules for JLCPCB and DOST-ASTI EPDC. "
    "Provide concise, precise, mathematically sound engineering guidance, pinout audits, and layout recommendations."
)

def call_openrouter(messages, model=DEFAULT_MODEL, stream=True, temperature=0.7, max_tokens=2048, api_key=DEFAULT_API_KEY):
    url = f"{API_BASE}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "HTTP-Referer": "https://github.com/Antigravity/RAMS",
        "X-Title": "RAMS Antigravity CLI",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": stream
    }

    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            if not stream:
                data = json.loads(resp.read().decode("utf-8"))
                return data["choices"][0]["message"]["content"]

            full_text = []
            for line in resp:
                decoded = line.decode("utf-8").strip()
                if not decoded.startswith("data:"):
                    continue
                data_part = decoded[5:].strip()
                if data_part == "[DONE]":
                    break
                try:
                    chunk = json.loads(data_part)
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        sys.stdout.write(content)
                        sys.stdout.flush()
                        full_text.append(content)
                except Exception:
                    continue
            print()
            return "".join(full_text)
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        sys.stderr.write(f"\n[OpenRouter Error {e.code}]: {err_msg}\n")
        return None
    except Exception as e:
        sys.stderr.write(f"\n[Network Error]: {e}\n")
        return None

def list_free_models():
    url = f"{API_BASE}/models"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            free = [m for m in data.get("data", []) if ":free" in m.get("id", "")]
            print(f"Available Free Models ({len(free)} total):")
            for m in sorted(free, key=lambda x: x["id"]):
                print(f"  - {m['id']} (Context: {m.get('context_length', 'N/A')})")
    except Exception as e:
        print("Failed to fetch models:", e)

def interactive_chat(model=DEFAULT_MODEL, system_prompt=None, api_key=DEFAULT_API_KEY):
    print("=" * 60)
    print(f"  RAMS Local AI Terminal: {model}")
    print("  Type 'exit', 'quit', or 'q' to end the session.")
    print("  Type 'clear' to reset conversation memory.")
    print("=" * 60)

    history = []
    if system_prompt:
        history.append({"role": "system", "content": system_prompt})

    while True:
        try:
            user_input = input("\nYou > ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting session.")
            break

        if not user_input:
            continue
        if user_input.lower() in ("exit", "quit", "q"):
            print("Session ended.")
            break
        if user_input.lower() == "clear":
            history = []
            if system_prompt:
                history.append({"role": "system", "content": system_prompt})
            print("[Conversation memory cleared]")
            continue

        history.append({"role": "user", "content": user_input})
        sys.stdout.write(f"\n{model} > ")
        sys.stdout.flush()

        response = call_openrouter(history, model=model, stream=True, api_key=api_key)
        if response:
            history.append({"role": "assistant", "content": response})

def main():
    parser = argparse.ArgumentParser(description="Query OpenRouter (GLM-5.3-Flash / Free Models) from Terminal")
    parser.add_argument("prompt", nargs="*", help="Prompt text to send")
    parser.add_argument("-m", "--model", default=DEFAULT_MODEL, help=f"Model identifier (Default: {DEFAULT_MODEL})")
    parser.add_argument("-f", "--file", help="Path to a file to inject into prompt context")
    parser.add_argument("-s", "--system", help="System prompt / instructions")
    parser.add_argument("-i", "--chat", action="store_true", help="Launch interactive multi-turn chat session")
    parser.add_argument("--list-free", action="store_true", help="List all currently available free models on OpenRouter")
    parser.add_argument("--key", default=DEFAULT_API_KEY, help="Custom OpenRouter API key override")
    parser.add_argument("--no-stream", action="store_true", help="Disable streaming output")
    parser.add_argument("--stdin", action="store_true", help="Read prompt from standard input")
    parser.add_argument("--pcb", action="store_true", help="Activate Hardware & KiCad PCB Design specialist persona")

    args = parser.parse_args()

    if args.pcb and not args.system:
        args.system = PCB_SYSTEM_PROMPT

    if args.list_free:
        list_free_models()
        return

    if args.chat:
        interactive_chat(model=args.model, system_prompt=args.system, api_key=args.key)
        return

    file_context = ""
    if args.file:
        if os.path.exists(args.file):
            with open(args.file, "r", encoding="utf-8", errors="ignore") as fp:
                file_context = f"\n\n[File Content: {args.file}]:\n" + fp.read()
        else:
            sys.stderr.write(f"Warning: File not found: {args.file}\n")

    stdin_input = ""
    if args.stdin:
        try:
            stdin_input = sys.stdin.read()
        except Exception:
            pass

    prompt_parts = []
    if stdin_input:
        prompt_parts.append(stdin_input.strip())
    if args.prompt:
        prompt_parts.append(" ".join(args.prompt).strip())
    if file_context:
        prompt_parts.append(file_context)

    full_prompt = "\n".join(prompt_parts).strip()

    if not full_prompt:
        interactive_chat(model=args.model, system_prompt=args.system, api_key=args.key)
        return

    messages = []
    if args.system:
        messages.append({"role": "system", "content": args.system})
    messages.append({"role": "user", "content": full_prompt})

    if args.no_stream:
        res = call_openrouter(messages, model=args.model, stream=False, api_key=args.key)
        if res:
            print(res)
    else:
        call_openrouter(messages, model=args.model, stream=True, api_key=args.key)

if __name__ == "__main__":
    main()
