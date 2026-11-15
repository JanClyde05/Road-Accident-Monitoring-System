#!/usr/bin/env python3
"""
RAMS invariant checker.

Every check encodes a defect that was actually observed in this repository.
Checks are expected to FAIL on the current code base; they must PASS after the
fixes described in docs/agent/CONNECTIVITY_FIX_PLAN.md and
docs/agent/BLE_STABILITY_PLAN.md.

Usage:
    python scripts/verify/check_invariants.py
    python scripts/verify/check_invariants.py --json out.json --md out.md
    python scripts/verify/check_invariants.py --filter FW- AND-
    python scripts/verify/check_invariants.py --strict

Exit codes: 0 = no FAIL, 1 = at least one FAIL, 2 = internal error.
No third-party dependencies.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[2]

FAIL = "FAIL"
WARN = "WARN"
PASS = "PASS"
SKIP = "SKIP"


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------

def read(rel: str) -> str:
    path = ROOT / rel
    if not path.is_file():
        return ""
    return path.read_text(encoding="utf-8", errors="ignore")


def exists(rel: str) -> bool:
    return (ROOT / rel).exists()


def line_of(text: str, needle: str) -> int:
    idx = text.find(needle)
    if idx < 0:
        return 0
    return text.count("\n", 0, idx) + 1


def evidence(rel: str, needle: str | None = None) -> str:
    text = read(rel)
    if needle is None:
        return rel
    line = line_of(text, needle)
    return f"{rel}:{line}" if line else rel


def block_after(text: str, signature: str) -> str:
    """Return the brace-balanced body of the first block after `signature`."""
    start = text.find(signature)
    if start < 0:
        return ""
    open_idx = text.find("{", start)
    if open_idx < 0:
        return ""
    depth = 0
    in_str = False
    esc = False
    for i in range(open_idx, len(text)):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[open_idx + 1:i]
    return text[open_idx + 1:]


PRIVATE_V4 = re.compile(
    r"(?<![\w.])(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}"
    r"|192\.168\.\d{1,3}\.\d{1,3}"
    r"|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?![\w.])"
)

ACTIVE_DEFINE = re.compile(r"^\s*#define\s+(\w+)\s+(.+)$")


def strip_line_comment(value: str) -> str:
    """Drop a trailing // comment without truncating http:// inside a string."""
    in_str = False
    esc = False
    for i, ch in enumerate(value):
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "/" and value[i:i + 2] == "//":
            return value[:i]
    return value


@dataclass
class Result:
    id: str
    title: str
    severity: str
    status: str
    detail: str = ""
    evidence: list[str] = field(default_factory=list)
    fix: str = ""


CHECKS: list[Result] = []


def check(cid: str, title: str, severity: str, fix: str = ""):
    def wrapper(fn):
        def run():
            status, detail, ev = fn()
            CHECKS.append(
                Result(cid, title, severity, status, detail, ev or [], fix)
            )
        run.__name__ = cid
        REGISTRY.append(run)
        return run
    return wrapper


REGISTRY: list = []


# --------------------------------------------------------------------------
# firmware: receiver backend resolution
# --------------------------------------------------------------------------

FW_CONFIG = "firmware/receiver_withDesktop/config.h"
FW_UPLOAD = "firmware/receiver_withDesktop/http_upload.cpp"
FW_NVS = "firmware/receiver_withDesktop/nvs_store.cpp"
FW_PORTAL = "firmware/receiver_withDesktop/wifi_manager.cpp"
FW_RESOLVER = "firmware/receiver_withDesktop/backend_resolver.cpp"


@check("FW-001", "No private IPv4 compiled into receiver BACKEND_URL", FAIL,
       "docs/agent/CONNECTIVITY_FIX_PLAN.md#stage-1")
def _fw001():
    text = read(FW_CONFIG)
    if not text:
        return SKIP, "config.h not found", []
    hits = []
    for raw in text.splitlines():
        line = raw.strip()
        if line.startswith("//"):
            continue
        m = ACTIVE_DEFINE.match(raw)
        if not m or m.group(1) != "BACKEND_URL":
            continue
        ip = PRIVATE_V4.search(strip_line_comment(m.group(2)))
        if ip:
            hits.append(f"{FW_CONFIG}:{line_of(text, raw)}  {ip.group(0)}")
    if hits:
        return FAIL, "Receiver firmware bakes in a LAN address; moving the desktop host forces a reflash.", hits
    return PASS, "Backend host is not a compiled private address.", []


@check("FW-002", "Upload path uses the runtime resolver, not BACKEND_URL", FAIL,
       "docs/agent/CONNECTIVITY_FIX_PLAN.md#stage-3")
def _fw002():
    text = read(FW_UPLOAD)
    if not text:
        return SKIP, "http_upload.cpp not found", []
    bad = [f"{FW_UPLOAD}:{i}" for i, l in enumerate(text.splitlines(), 1)
           if "String(BACKEND_URL)" in l or "BACKEND_URL +" in l]
    if bad:
        return FAIL, "Upload URL is assembled from the compile-time constant.", bad
    return PASS, "Upload URL comes from backendBaseUrl().", []


@check("FW-003", "Receiver persists the last good backend host in NVS", FAIL,
       "docs/agent/CONNECTIVITY_FIX_PLAN.md#stage-2")
def _fw003():
    text = read(FW_NVS)
    if not text:
        return SKIP, "nvs_store.cpp not found", []
    if "backend_host" in text and "backend_port" in text:
        return PASS, "NVS carries backend_host and backend_port.", []
    return FAIL, "No backend host cache, so every boot depends on discovery.", [FW_NVS]


@check("FW-004", "Captive portal accepts a manual backend host", FAIL,
       "docs/agent/CONNECTIVITY_FIX_PLAN.md#stage-4")
def _fw004():
    text = read(FW_PORTAL)
    if not text:
        return SKIP, "wifi_manager.cpp not found", []
    body = block_after(text, '_server.on("/connect"')
    if 'getParam("server"' in body or "getParam(\"host\"" in body:
        return PASS, "Portal form exposes the backend host.", []
    return FAIL, "Portal can set Wi-Fi credentials only; a misconfigured field unit needs a reflash.", \
        [evidence(FW_PORTAL, '_server.on("/connect"')]


@check("FW-005", "Receiver discovers the desktop over UDP", FAIL,
       "docs/agent/CONNECTIVITY_FIX_PLAN.md#stage-1")
def _fw005():
    text = read(FW_RESOLVER) if exists(FW_RESOLVER) else ""
    if not text:
        return FAIL, "backend_resolver.cpp does not exist.", [FW_RESOLVER]
    missing = [k for k in ("RAMS_DISCOVER_V1", "8889", "backendBaseUrl") if k not in text]
    if missing:
        return FAIL, "Resolver exists but is incomplete: " + ", ".join(missing), [FW_RESOLVER]
    return PASS, "Resolver implements discovery, port carry, and cached URL.", [FW_RESOLVER]


# --------------------------------------------------------------------------
# firmware: wearable BLE
# --------------------------------------------------------------------------

FW_BT = "firmware/wearable_withApp/bt_service.cpp"


@check("FW-006", "Wearable advertises on disconnect", FAIL,
       "docs/agent/BLE_STABILITY_PLAN.md#cause-5")
def _fw006():
    text = read(FW_BT)
    if not text:
        return SKIP, "bt_service.cpp not found", []
    if "advertiseOnDisconnect" in text:
        return PASS, "Advertising is re-armed by the BLE stack.", []
    return FAIL, "Advertising restart depends on the main loop polling a flag; a busy loop leaves the wearable invisible.", \
        [evidence(FW_BT, "_oldDeviceConnected")] if "_oldDeviceConnected" in text else [FW_BT]


@check("FW-007", "Firmware MTU preference is 247, not 512", WARN,
       "docs/agent/BLE_STABILITY_PLAN.md#cause-3")
def _fw007():
    text = read(FW_BT)
    if "setMTU(512)" in text:
        return WARN, "MTU 512 is above the practical ceiling; Android negotiates 247 and the extra request invites retries.", \
            [evidence(FW_BT, "setMTU(512)")]
    return PASS, "MTU preference is within the practical range.", []


@check("FW-008", "RX buffer overflow is observable", WARN,
       "docs/agent/BLE_STABILITY_PLAN.md#cause-6")
def _fw008():
    text = read(FW_BT)
    if "_rxBuffer.length() > 2048" in text and "drop" not in text.lower():
        return WARN, "Oversized frames are dropped silently; field diagnosis needs a counter.", \
            [evidence(FW_BT, "_rxBuffer.length() > 2048")]
    return PASS, "RX overflow accounting present.", []


@check("FW-009", "Receiver build reserves flash headroom", WARN,
       "docs/agent/CONNECTIVITY_FIX_PLAN.md#build-budget")
def _fw009():
    text = read("firmware/receiver_withDesktop/flash_receiver.bat")
    if not text:
        return SKIP, "flash_receiver.bat not found", []
    if "PartitionScheme=huge_app" in text:
        return PASS, "Flasher selects the 3 MB application partition.", []
    return WARN, "Default partition leaves about 6 KB after the current build; the discovery module will not fit.", \
        [evidence("firmware/receiver_withDesktop/flash_receiver.bat", "compile --fqbn")]


# --------------------------------------------------------------------------
# android: BLE client
# --------------------------------------------------------------------------

KT_SYNC = "apps/android_app/app/src/main/java/com/example/sync/Esp32SyncEngine.kt"
KT_SPP = "apps/android_app/app/src/main/java/com/example/connectivity/Esp32ConnectionManager.kt"
KT_VM = "apps/android_app/app/src/main/java/com/example/viewmodel/RamsViewModel.kt"
KT_MANIFEST = "apps/android_app/app/src/main/AndroidManifest.xml"


@check("AND-001", "Android requests MTU 247", WARN,
       "docs/agent/BLE_STABILITY_PLAN.md#cause-3")
def _and001():
    text = read(KT_SYNC)
    if "requestMtu(512)" in text:
        return WARN, "512 is requested, 247 is negotiated; the gap hides truncation assumptions.", \
            [evidence(KT_SYNC, "requestMtu(512)")]
    return PASS, "MTU request matches the negotiated ceiling.", []


@check("AND-002", "GATT writes are flow-controlled", FAIL,
       "docs/agent/BLE_STABILITY_PLAN.md#cause-2")
def _and002():
    text = read(KT_SYNC)
    if not text:
        return SKIP, "Esp32SyncEngine.kt not found", []
    no_resp = "WRITE_TYPE_NO_RESPONSE" in text
    gated = "onCharacteristicWrite" in text
    if no_resp and not gated:
        return FAIL, "Fire-and-forget writes at 10 Hz overflow the controller buffer; this is the direct disconnect trigger.", \
            [evidence(KT_SYNC, "WRITE_TYPE_NO_RESPONSE")]
    if no_resp and gated:
        return WARN, "NO_RESPONSE is still used for the bulk path; confirm the gate covers it.", \
            [evidence(KT_SYNC, "WRITE_TYPE_NO_RESPONSE")]
    return PASS, "Writes wait for completion.", []


@check("AND-003", "Telemetry frame excludes the rider profile", FAIL,
       "docs/agent/BLE_STABILITY_PLAN.md#cause-1")
def _and003():
    text = read(KT_SYNC)
    if not text:
        return SKIP, "Esp32SyncEngine.kt not found", []
    body = block_after(text, "private fun buildTelemetryPacket")
    fields = len(re.findall(r"\bprofile\.", body))
    if fields:
        return FAIL, f"{fields} profile fields are serialized into every 10 Hz frame.", \
            [evidence(KT_SYNC, "private fun buildTelemetryPacket")]
    return PASS, "Telemetry frame carries sensor data only.", []


@check("AND-004", "BLE streaming rate matches frame size", WARN,
       "docs/agent/BLE_STABILITY_PLAN.md#cause-1")
def _and004():
    text = read(KT_SYNC)
    body = block_after(text, "private suspend fun runBleStreamingLoop")
    if "delay(100L)" in body:
        return WARN, "10 Hz with multi-chunk frames leaves no headroom for retransmission.", \
            [evidence(KT_SYNC, "delay(100L)")]
    return PASS, "Streaming interval is sized to the frame.", []


@check("AND-005", "Legacy SPP transport is removed", FAIL,
       "docs/agent/BLE_STABILITY_PLAN.md#cause-7")
def _and005():
    text = read(KT_SPP)
    if not text:
        return SKIP, "Esp32ConnectionManager.kt not found", []
    spp_uuid = "00001101-0000-1000-8000-00805f9b34fb"
    if "connectBluetooth" in text or spp_uuid.lower() in text.lower():
        return FAIL, "A second, incompatible transport still compiles and can be invoked by simulation paths.", \
            [evidence(KT_SPP, "connectBluetooth")]
    return PASS, "Only the GATT transport remains.", []


@check("AND-006", "BLE session outlives the ViewModel", WARN,
       "docs/agent/BLE_STABILITY_PLAN.md#cause-4")
def _and006():
    vm = read(KT_VM)
    app_scoped = exists("apps/android_app/app/src/main/java/com/example/RamsApplication.kt")
    owns = "Esp32SyncEngine(" in vm
    if owns and not app_scoped:
        return FAIL, "Streaming is owned by RamsViewModel; navigation or process trimming tears the link down.", \
            [evidence(KT_VM, "Esp32SyncEngine(")]
    if owns:
        return WARN, "A ViewModel still constructs the engine; confirm it delegates to the application session.", \
            [evidence(KT_VM, "Esp32SyncEngine(")]
    return PASS, "BLE is owned below the UI layer.", []


@check("AND-007", "Classic discovery never overlaps BLE", FAIL,
       "docs/agent/BLE_STABILITY_PLAN.md#cause-6")
def _and007():
    vm = read(KT_VM)
    body = block_after(vm, "fun startBluetoothDiscovery")
    classic = "startDiscovery(" in body
    ble = "startScan(" in body
    if classic and ble:
        return FAIL, "Classic inquiry and BLE scan run in the same pass; inquiry starves the LE controller and drops the link.", \
            [evidence(KT_VM, "val startedDiscovery = bluetoothAdapter?.startDiscovery()")]
    return PASS, "Scanning is single-transport.", []


@check("AND-008", "Application class declares the BLE service owner", WARN,
       "docs/agent/BLE_STABILITY_PLAN.md#cause-4")
def _and008():
    man = read(KT_MANIFEST)
    if not man:
        return SKIP, "AndroidManifest.xml not found", []
    m = re.search(r"<application[^>]*android:name=", man, re.S)
    if not m:
        return WARN, "No custom Application class; there is no process-level place to own the GATT session.", [KT_MANIFEST]
    return PASS, "Manifest declares an Application class.", [KT_MANIFEST]


# --------------------------------------------------------------------------
# repository hygiene
# --------------------------------------------------------------------------

ROOT_DOC_ALLOW = {
    "README.md", "AGENTS.md", "GEMINI.md", "DIRECTORY_MAP.md",
    "MEMORY_MAP.md", "DESIGN_RULES.md", "00_SYSTEM_ARCHITECTURE.md",
}

LINK_RE = re.compile(r"file:///([A-Za-z]:/[^\s\)\]\"'<>#]+)")


@check("DOC-001", "No duplicate canonical documents", FAIL,
       "docs/agent/ROOT_REORG_PLAN.md#stage-1")
def _doc001():
    dups = []
    for f in ROOT.glob("*.md"):
        twin = ROOT / "docs" / f.name
        if twin.is_file():
            a = hashlib.sha256(f.read_bytes()).hexdigest()
            b = hashlib.sha256(twin.read_bytes()).hexdigest()
            if a == b:
                dups.append(f"{f.name} == docs/{f.name}")
            else:
                dups.append(f"{f.name} conflicts with docs/{f.name} (different content)")
    if dups:
        return FAIL, "Two copies of the same document drift apart; agents read the stale one.", dups
    return PASS, "One canonical copy per document.", []


@check("DOC-002", "Root holds no loose automation scripts", WARN,
       "docs/agent/ROOT_REORG_PLAN.md#stage-2")
def _doc002():
    scripts = sorted(p.name for p in ROOT.iterdir()
                     if p.is_file() and p.suffix.lower() in (".bat", ".ps1", ".cmd", ".sh"))
    if len(scripts) > 2:
        return WARN, f"{len(scripts)} scripts at root; launchers are hard to discover and break when moved.", scripts
    return PASS, "Root scripts are limited to entry points.", scripts


@check("DOC-003", "Navigation links resolve", FAIL,
       "docs/agent/ROOT_REORG_PLAN.md#stage-4")
def _doc003():
    nav = [
        "README.md", "AGENTS.md", "GEMINI.md", "DIRECTORY_MAP.md",
        "MEMORY_MAP.md", "DESIGN_RULES.md", "00_SYSTEM_ARCHITECTURE.md",
    ]
    docs_dir = ROOT / "docs"
    if docs_dir.is_dir():
        nav += [str(p.relative_to(ROOT)) for p in docs_dir.glob("*.md")]
        nav += [str(p.relative_to(ROOT)) for p in (docs_dir / "agent").glob("*.md")] \
            if (docs_dir / "agent").is_dir() else []
    nav = sorted(set(nav))
    broken = []
    for rel in nav:
        text = read(rel)
        for raw in LINK_RE.findall(text):
            if not Path(unquote(raw)).exists():
                broken.append(f"{rel} -> {raw}")
    if broken:
        return FAIL, f"{len(broken)} links in navigation documents point at paths that no longer exist.", broken[:10]
    return PASS, f"All links in {len(nav)} navigation documents resolve.", []


@check("DOC-005", "Historical documents keep acceptable link rot", WARN,
       "docs/agent/ROOT_REORG_PLAN.md#stage-4")
def _doc005():
    historical = ["docs/MASTER_SYSTEM_LOG_AND_METHODOLOGY.md"]
    broken = 0
    total = 0
    for rel in historical:
        text = read(rel)
        for raw in LINK_RE.findall(text):
            total += 1
            if not Path(unquote(raw)).exists():
                broken += 1
    if broken:
        return WARN, f"{broken} of {total} links in the historical log are stale; fix opportunistically, not as a gate.", historical
    return PASS, "Historical log links resolve.", []


@check("DOC-004", "Root markdown is limited to canonical documents", WARN,
       "docs/agent/ROOT_REORG_PLAN.md#stage-1")
def _doc004():
    extra = sorted(p.name for p in ROOT.glob("*.md") if p.name not in ROOT_DOC_ALLOW)
    if extra:
        return WARN, "Unclassified root documents compete with the navigation index.", extra
    return PASS, "Root markdown matches the allowlist.", []


@check("REPO-001", "No duplicate working tree at root", WARN,
       "docs/agent/ROOT_REORG_PLAN.md#stage-5")
def _repo001():
    stray = [d.name for d in ROOT.iterdir()
             if d.is_dir() and d.name.lower().startswith("working code")]
    if stray:
        return WARN, "A second copy of the working tree exists at root and is not tracked consistently.", stray
    return PASS, "No stray working-tree copy.", []


@check("REPO-002", "One Android application tree owns the applicationId", FAIL,
       "docs/agent/ROOT_REORG_PLAN.md#stage-3")
def _repo002():
    apps = {}
    for path in ROOT.glob("**/app/build.gradle.kts"):
        if any(part in {".git", "node_modules", "build", "archive"} for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        m = re.search(r'applicationId\s*=\s*"([^"]+)"', text)
        if m:
            apps.setdefault(m.group(1), []).append(str(path.relative_to(ROOT)))
    dup = {k: v for k, v in apps.items() if len(v) > 1}
    if dup:
        flat = [f"{k}: {', '.join(v)}" for k, v in dup.items()]
        return FAIL, "Two trees build the same app; a fix in one ships from the other.", flat
    return PASS, "Each applicationId has a single source tree.", []


@check("REPO-003", "One desktop ingestion entry point", WARN,
       "docs/agent/ROOT_REORG_PLAN.md#stage-3")
def _repo003():
    hits = []
    for path in ROOT.glob("**/Program.cs"):
        if any(part in {".git", "node_modules", "build", "archive", "bin", "obj"} for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if "StartLanReceiverBridge" in text:
            hits.append(str(path.relative_to(ROOT)))
    if len(hits) > 1:
        return WARN, "Two desktop programs bind the same ingestion port; only one can win at runtime.", hits
    return PASS, "A single desktop ingestion program.", hits


@check("DOC-006", "Agent document cross-references resolve", FAIL,
       "docs/agent/README.md")
def _doc006():
    md_link = re.compile(r"\[[^\]]+\]\(([^)\s]+)\)")
    broken = []
    for path in sorted((ROOT / "docs" / "agent").glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        for target in md_link.findall(text):
            if "://" in target or target.startswith("#"):
                continue
            clean = unquote(target.split("#")[0])
            if clean and not (path.parent / clean).exists():
                broken.append(f"{path.name} -> {target}")
    if broken:
        return FAIL, "A plan references a document that does not exist.", broken[:10]
    return PASS, "All agent documents resolve their relative links.", []


# --------------------------------------------------------------------------
# secrets
# --------------------------------------------------------------------------

@check("SEC-001", "No committed API keys", FAIL,
       "docs/agent/AI_TOOLING_MATRIX.md#secrets")
def _sec001():
    pattern = re.compile(r"sk-or-v1-[0-9a-f]{32,}|sk-ant-api03-[A-Za-z0-9_\-]{20,}")
    hits = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in {
            ".md", ".json", ".ps1", ".bat", ".py", ".kt", ".cs", ".toml", ".yaml", ".yml", ".txt"
        }:
            continue
        if any(part in {".git", "node_modules", "build", "bin", "obj"} for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if pattern.search(text):
            hits.append(str(path.relative_to(ROOT)))
    if hits:
        return FAIL, "A provider key is stored in a tracked file.", hits[:10]
    return PASS, "No provider keys found in tracked text files.", []


# --------------------------------------------------------------------------
# runner
# --------------------------------------------------------------------------

def anchor_index() -> set[str]:
    """Anchors available in docs/agent: explicit <a id> plus heading slugs."""
    anchors = set()
    for path in (ROOT / "docs" / "agent").glob("*.md"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        anchors.update(re.findall(r'<a id="([^"]+)"', text))
        for line in text.splitlines():
            if line.startswith("#"):
                slug = re.sub(r"[^a-z0-9\s-]", "", line.lstrip("# ").lower())
                anchors.add(slug.strip().replace(" ", "-"))
    return anchors


def validate_fix_anchors(results: list[Result]) -> list[str]:
    anchors = anchor_index()
    broken = []
    for c in results:
        if "#" not in c.fix:
            continue
        doc, anchor = c.fix.split("#", 1)
        if not (ROOT / doc).is_file():
            broken.append(f"{c.id}: missing document {doc}")
        elif anchor not in anchors:
            broken.append(f"{c.id}: missing anchor {doc}#{anchor}")
    return broken


def run(filters: list[str] | None) -> list[Result]:
    for fn in REGISTRY:
        fn()
    if not filters:
        return CHECKS
    return [c for c in CHECKS if any(c.id.startswith(f) for f in filters)]


def emit_text(results: list[Result]) -> None:
    width = max((len(c.id) for c in results), default=6)
    print("=" * 100)
    print("RAMS INVARIANT CHECK")
    print(f"root: {ROOT}")
    print(f"time: {datetime.now(timezone.utc).astimezone().isoformat(timespec='seconds')}")
    print("=" * 100)
    for c in results:
        print(f"[{c.status:4}] {c.id:<{width}}  {c.title}")
        if c.detail:
            print(f"         {c.detail}")
        for ev in c.evidence[:6]:
            print(f"         - {ev}")
        if c.fix and c.status in (FAIL, WARN):
            print(f"         fix: {c.fix}")
    counts = {s: sum(1 for c in results if c.status == s) for s in (FAIL, WARN, PASS, SKIP)}
    print("-" * 100)
    print(f"FAIL {counts[FAIL]}   WARN {counts[WARN]}   PASS {counts[PASS]}   SKIP {counts[SKIP]}")
    print("-" * 100)
    if counts[FAIL]:
        print("Verdict: NOT READY. Fix the FAIL items or update the incident ledger with a reason.")
    elif counts[WARN]:
        print("Verdict: PASS WITH RISK. WARN items are accepted debt; record them in the ledger.")
    else:
        print("Verdict: PASS. All invariants hold.")


def emit_md(results: list[Result], path: Path) -> None:
    counts = {s: sum(1 for c in results if c.status == s) for s in (FAIL, WARN, PASS, SKIP)}
    lines = [
        "# RAMS Verification Log",
        "",
        "Generated by `scripts/verify/check_invariants.py --md`. Do not edit by hand.",
        "",
        f"- Timestamp: {datetime.now(timezone.utc).astimezone().isoformat(timespec='seconds')}",
        f"- Root: `{ROOT}`",
        f"- Result: {counts[FAIL]} FAIL, {counts[WARN]} WARN, {counts[PASS]} PASS, {counts[SKIP]} SKIP",
        "",
        "| Result | ID | Check | Evidence |",
        "| --- | --- | --- | --- |",
    ]
    for c in results:
        ev = "<br>".join(f"`{e}`" for e in c.evidence[:4]) or "-"
        lines.append(f"| {c.status} | {c.id} | {c.title} | {ev} |")
    lines += [
        "",
        "## How to read this",
        "",
        "A FAIL is a defect that costs field time, not a lint nit. The expected",
        "baseline for the pre-fix tree is documented in `docs/agent/LESSONS.md`.",
        "",
        "Regenerate with:",
        "",
        "```powershell",
        "python scripts/verify/check_invariants.py --md docs/agent/VERIFICATION_LOG.md",
        "```",
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description="RAMS invariant checker")
    ap.add_argument("--json", metavar="PATH", help="write machine-readable results")
    ap.add_argument("--md", metavar="PATH", help="write a markdown report")
    ap.add_argument("--filter", nargs="*", help="only run checks with these id prefixes")
    ap.add_argument("--strict", action="store_true", help="treat WARN as failure")
    args = ap.parse_args(argv)

    results = run(args.filter)
    emit_text(results)

    anchor_problems = validate_fix_anchors(results)
    if anchor_problems:
        print("")
        print("Documentation anchors:")
        for problem in anchor_problems:
            print(f"  - {problem}")

    payload = {
        "root": str(ROOT),
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "counts": {s: sum(1 for c in results if c.status == s) for s in (FAIL, WARN, PASS, SKIP)},
        "anchor_problems": anchor_problems,
        "checks": [asdict(c) for c in results],
    }
    if args.json:
        Path(args.json).write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"\njson: {args.json}")
    if args.md:
        md_path = Path(args.md)
        md_path.parent.mkdir(parents=True, exist_ok=True)
        emit_md(results, md_path)
        print(f"md:   {args.md}")

    if any(c.status == FAIL for c in results):
        return 1
    if args.strict and any(c.status == WARN for c in results):
        return 1
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except Exception as exc:  # pragma: no cover
        print(f"checker error: {exc}", file=sys.stderr)
        raise
