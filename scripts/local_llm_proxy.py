#!/usr/bin/env python3
"""
RAMS Local OpenAI-Compatible LLM Proxy (GLM-5.3-Flash & OpenRouter)
==================================================================
Spins up a local HTTP server providing standard OpenAI API endpoints:
  - GET  /v1/models
  - POST /v1/chat/completions (supports streaming and non-streaming)
  - GET  /health

Routes requests directly to OpenRouter (Default: z-ai/glm-5.3-flash).
Allows any OpenAI-compatible tool, extension (e.g., Kilo Code, Cline, Cursor,
Aider, Continue.dev), or local script to connect using:
  Base URL:  http://127.0.0.1:5000/v1
  API Key:   sk-local (or any string)
  Model:     z-ai/glm-5.3-flash (or glm-5.3-flash)

Zero external dependencies - runs on Python 3 standard library only.
"""

import sys
import os
import json
import argparse
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler

DEFAULT_PORT = 5000
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

DEFAULT_TARGET_MODEL = get_active_model_slug()
OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"

class LocalLlmProxyHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Title, HTTP-Referer")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed_path = self.path.split("?")[0].rstrip("/")

        if parsed_path in ("", "/health", "/v1/health"):
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            resp = {
                "status": "healthy",
                "service": "RAMS Local GLM-5.3-Flash Proxy",
                "default_model": DEFAULT_TARGET_MODEL,
                "endpoints": ["/v1/models", "/v1/chat/completions"]
            }
            self.wfile.write(json.dumps(resp, indent=2).encode("utf-8"))
            return

        if parsed_path in ("/v1/models", "/models"):
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            models_payload = {
                "object": "list",
                "data": [
                    {
                        "id": "z-ai/glm-5.3-flash",
                        "object": "model",
                        "created": 1715000000,
                        "owned_by": "z-ai",
                        "permission": [],
                        "root": "z-ai/glm-5.3-flash",
                        "parent": None
                    },
                    {
                        "id": "glm-5.3-flash",
                        "object": "model",
                        "created": 1715000000,
                        "owned_by": "z-ai",
                        "permission": [],
                        "root": "z-ai/glm-5.3-flash",
                        "parent": None
                    },
                    {
                        "id": "nvidia/nemotron-3.5-lightning:free",
                        "object": "model",
                        "created": 1715000000,
                        "owned_by": "nvidia",
                        "permission": [],
                        "root": "nvidia/nemotron-3.5-lightning:free",
                        "parent": None
                    },
                    {
                        "id": "google/gemma-4-31b-it:free",
                        "object": "model",
                        "created": 1715000000,
                        "owned_by": "google",
                        "permission": [],
                        "root": "google/gemma-4-31b-it:free",
                        "parent": None
                    }
                ]
            }
            self.wfile.write(json.dumps(models_payload).encode("utf-8"))
            return

        self.send_response(404)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": f"Endpoint not found: {self.path}"}).encode("utf-8"))

    def do_POST(self):
        parsed_path = self.path.split("?")[0].rstrip("/")

        if parsed_path not in ("/v1/chat/completions", "/chat/completions"):
            self.send_response(404)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"POST endpoint not found: {self.path}"}).encode("utf-8"))
            return

        content_len = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_len).decode("utf-8", errors="ignore")

        try:
            body = json.loads(raw_body)
        except Exception as e:
            self.send_response(400)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Invalid JSON payload: {e}"}).encode("utf-8"))
            return

        # Normalize model identifier
        req_model = body.get("model", DEFAULT_TARGET_MODEL)
        if req_model in ("glm-5.3-flash", "glm", "default", "gpt-4o", "claude-3-5-sonnet"):
            body["model"] = DEFAULT_TARGET_MODEL
        elif req_model.endswith(":free") and not req_model.startswith("z-ai"):
            pass # Keep as free model
        elif req_model.startswith("z-ai/glm-5.3-flash"):
            body["model"] = "z-ai/glm-5.3-flash"

        # Determine API key
        auth_hdr = self.headers.get("Authorization", "")
        api_key = DEFAULT_API_KEY
        if auth_hdr.startswith("Bearer "):
            in_key = auth_hdr[7:].strip()
            if in_key.startswith("sk-or-"):
                api_key = in_key

        is_streaming = bool(body.get("stream", False))

        # Forward request to OpenRouter
        target_url = f"{OPENROUTER_API_BASE}/chat/completions"
        target_headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://github.com/Antigravity/RAMS",
            "X-Title": "RAMS Antigravity Local Proxy",
            "Content-Type": "application/json"
        }

        req = urllib.request.Request(
            target_url,
            data=json.dumps(body).encode("utf-8"),
            headers=target_headers,
            method="POST"
        )

        try:
            with urllib.request.urlopen(req) as resp:
                self.send_response(200)
                self._send_cors_headers()
                if is_streaming:
                    self.send_header("Content-Type", "text/event-stream")
                    self.send_header("Cache-Control", "no-cache")
                    self.send_header("Connection", "keep-alive")
                    self.end_headers()

                    for chunk in resp:
                        self.wfile.write(chunk)
                        self.wfile.flush()
                else:
                    self.send_header("Content-Type", "application/json")
                    resp_data = resp.read()
                    self.send_header("Content-Length", str(len(resp_data)))
                    self.end_headers()
                    self.wfile.write(resp_data)
        except urllib.error.HTTPError as e:
            err_data = e.read()
            self.send_response(e.code)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(err_data)
        except Exception as e:
            self.send_response(502)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Proxy Gateway Error: {e}"}).encode("utf-8"))

    def log_message(self, format, *args):
        # Concise one-line terminal request logger
        sys.stderr.write(f"[Local Proxy] {self.address_string()} - {format % args}\n")

def main():
    parser = argparse.ArgumentParser(description="RAMS Local OpenAI-Compatible Proxy Server (GLM-5.3-Flash)")
    parser.add_argument("-p", "--port", type=int, default=DEFAULT_PORT, help=f"Port to listen on (Default: {DEFAULT_PORT})")
    parser.add_argument("--key", default=DEFAULT_API_KEY, help="OpenRouter API Key")
    parser.add_argument("--model", default=DEFAULT_TARGET_MODEL, help=f"Default model (Default: {DEFAULT_TARGET_MODEL})")

    args = parser.parse_args()

    server_address = ("127.0.0.1", args.port)
    httpd = HTTPServer(server_address, LocalLlmProxyHandler)

    print("=" * 65)
    print("  RAMS Local OpenAI API Proxy (GLM-5.3-Flash / OpenRouter)")
    print("=" * 65)
    print(f"  Status:       RUNNING")
    print(f"  Base URL:     http://127.0.0.1:{args.port}/v1")
    print(f"  Health Check: http://127.0.0.1:{args.port}/health")
    print(f"  Default Model: {args.model}")
    print(f"  Target API:   OpenRouter ({OPENROUTER_API_BASE})")
    print("=" * 65)
    print("  Compatible with Kilo Code, Cline, Cursor, Continue.dev, and curl.")
    print("  Press Ctrl+C to terminate.")
    print("=" * 65)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Local Proxy] Shutting down cleanly.")
        httpd.server_close()

if __name__ == "__main__":
    main()

