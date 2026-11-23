"""Print the local finals slide master to a 16:9, self-contained PDF."""
import csv
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"
BENCH = ROOT.parents[2] / "apps/android_app/app/src/main/assets/motion_benchmarks"
TARGET = PUBLIC / "presenters/RAMS InnovateX 2026 National Finals Slides.pdf"


def trace(name, color):
    fixture = json.loads((BENCH / f"benchmark_{name}.json").read_text(encoding="utf-8"))
    samples = fixture["raw_samples"]
    points = " ".join(f"{55 + s['rel_time_ms'] * .59:.2f},{231 - s['svm_g'] * 21.5:.2f}" for s in samples)
    return f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>'


def replay_counts():
    text = (ROOT / "verification/replay-output.tsv").read_text(encoding="utf-8")
    table = list(csv.DictReader(text[text.index("fixture\t"):].splitlines(), delimiter="\t"))
    counts = {}
    for name, flag in [("ACCIDENT", "1"), ("BENIGN", "0")]:
        group = [r for r in table if r["label_alarm"] == flag]
        counts[name] = f"{sum(r['predicted_alarm'] == flag for r in group)}/{len(group)}"
    for prefix, subtype in [("fall", "SEVERE_COLLISION"), ("pothole", "WIND_FLUTTER")]:
        group = [r for r in table if re.fullmatch(f"benchmark_{prefix}(_[0-9]+)?\\.json", r["fixture"])]
        counts[prefix.upper()] = str(sum(subtype in r["predicted_profile"] for r in group))
    counts["TOTAL"] = str(len(table))
    return counts


def main():
    html = (ROOT / "finals_slides.html").read_text(encoding="utf-8")
    values = {
        "PUBLIC": PUBLIC.as_uri(),
        "IMPACT_TRACE": trace("impact", "#ffbd73"),
        "POTHOLE_TRACE": trace("pothole", "#78ddd5"),
        **replay_counts(),
    }
    for key, value in values.items():
        html = html.replace("{{" + key + "}}", value)
    if "{{" in html:
        raise ValueError("Unfilled slide field")
    browsers = [
        os.environ.get("RAMS_CHROME"), shutil.which("google-chrome"), shutil.which("chromium"),
        str(Path(os.environ.get("ProgramFiles", "")) / "Google/Chrome/Application/chrome.exe"),
        str(Path(os.environ.get("ProgramFiles(x86)", "")) / "Microsoft/Edge/Application/msedge.exe"),
    ]
    browser = next((b for b in browsers if b and Path(b).is_file()), None)
    if not browser:
        raise SystemExit("Set RAMS_CHROME to a local Chrome or Edge executable.")
    with tempfile.TemporaryDirectory(prefix="rams-finals-print-") as workspace:
        scratch = Path(workspace)
        page = scratch / "slides.html"
        page.write_text(html, encoding="utf-8")
        printed = scratch / "slides.pdf"
        subprocess.run([browser, "--headless=new", "--disable-extensions", "--disable-gpu",
                        "--no-first-run", "--no-pdf-header-footer", "--allow-file-access-from-files",
                        "--run-all-compositor-stages-before-draw", "--virtual-time-budget=2500",
                        f"--user-data-dir={scratch / 'profile'}", f"--print-to-pdf={printed}",
                        page.as_uri()], check=True, capture_output=True, timeout=100)
        if not printed.exists() or printed.stat().st_size < 100_000:
            raise RuntimeError("Chromium did not produce the finals slide PDF.")
        TARGET.parent.mkdir(exist_ok=True)
        shutil.copyfile(printed, TARGET)
    print(TARGET)


if __name__ == "__main__":
    main()
