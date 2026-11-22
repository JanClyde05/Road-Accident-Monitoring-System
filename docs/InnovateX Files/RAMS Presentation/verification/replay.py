"""Rebuild the Android classifier and print a reproducible synthetic feature replay.

From the repository root, run
python "docs/InnovateX Files/RAMS Presentation/verification/replay.py"
Requires Python 3.11+, the project's Android SDK, Gradle dependencies and JDK.
"""

import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
from tempfile import TemporaryDirectory
import tomllib


HERE = Path(__file__).resolve().parent
ANDROID = HERE.parents[3] / "apps/android_app"
APP = ANDROID / "app"
SOURCE = APP / "src/main/java/com/example/ai/SensorAiInferenceEngine.kt"
CLASSES = APP / "build/intermediates/built_in_kotlinc/debug/compileDebugKotlin/classes"
ENGINE = CLASSES / "com/example/ai/SensorAiInferenceEngine.class"
FIXTURES = APP / "src/main/assets/motion_benchmarks"

# Field order and defaults mirror the Android runFullBenchmarkEvaluation reader.
DEFAULTS = {
    "mean_svm_g": 1, "max_svm_g": 1, "min_svm_g": 1, "std_svm_g": 0, "rms_svm_g": 1,
    "max_gyro_mag": 0, "mean_gyro_mag": 0, "std_gyro_mag": 0, "max_jerk": 0, "mean_jerk": 0,
    "tilt_delta_deg": 0, "signal_magnitude_area": 1, "energy_svm": 1, "zero_crossing_rate": 0,
}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replay():
    source_hash = sha(SOURCE)
    gradle = ANDROID / ("gradlew.bat" if os.name == "nt" else "gradlew")
    subprocess.run([str(gradle), ":app:compileDebugKotlin", "--rerun", "--no-build-cache",
                    "-Pkotlin.incremental=false", "--console=plain"], cwd=ANDROID, check=True, stdout=sys.stderr)
    if sha(SOURCE) != source_hash:
        raise RuntimeError("Kotlin source changed during compilation.")

    versions = tomllib.loads((ANDROID / "gradle/libs.versions.toml").read_text())["versions"]
    libraries = Path(os.getenv("GRADLE_USER_HOME", Path.home() / ".gradle")) / "caches/modules-2/files-2.1"
    sdk = os.getenv("ANDROID_HOME") or os.getenv("ANDROID_SDK_ROOT")
    if sdk is None and os.name == "nt":
        sdk = Path(os.environ["LOCALAPPDATA"]) / "Android/Sdk"
    if sdk is None:
        raise RuntimeError("Set ANDROID_HOME to the Android SDK used by this project.")
    jars = [Path(sdk) / "platforms/android-36/android.jar"]
    for group, name, version in [
        ("org.jetbrains.kotlin", "kotlin-stdlib", versions["kotlin"]),
        ("org.jetbrains.kotlinx", "kotlinx-coroutines-core-jvm", versions["kotlinxCoroutinesCore"]),
    ]:
        jars.append(next((libraries / group / name / version).glob(f"*/{name}-{version}.jar")))

    rows = []
    fixture_hash = hashlib.sha256()
    for path in sorted(FIXTURES.glob("*.json")):
        record = json.loads(path.read_bytes())
        fixture_hash.update(f"{path.name}\t{sha(path)}\n".encode())
        fields = [record["features"].get(key, default) for key, default in DEFAULTS.items()]
        rows.append("\t".join(map(str, [path.name, record["is_accident"], record["metadata"]["pre_event_speed_kmh"], *fields])))
    if not rows:
        raise RuntimeError(f"No fixture records in {FIXTURES}")

    with TemporaryDirectory(prefix="rams_replay_") as temp:
        work = Path(temp)
        # The engine reads Android's filesDir on startup. An empty temporary directory
        # supplies that path and leaves the learned-pattern collection empty.
        context = work / "android/content/Context.java"
        context.parent.mkdir(parents=True)
        context.write_text("package android.content; public class Context { "
                           'public java.io.File getFilesDir() { return new java.io.File(System.getProperty("user.dir")); } }')
        classpath = os.pathsep.join(map(str, [work, CLASSES, *jars]))
        java_home = os.getenv("JAVA_HOME")
        java_bin = Path(java_home) / "bin" if java_home else Path(shutil.which("java")).parent
        subprocess.run([str(java_bin / "javac"), "-cp", classpath, "-d", str(work),
                        str(context), str(HERE / "Replay.java")], cwd=work, check=True)
        java = [str(java_bin / "java")]
        run = subprocess.run([*java, "-cp", classpath, "Replay"], cwd=work, input="\n".join(rows) + "\n",
                             capture_output=True, text=True, check=True)
        java_version = subprocess.check_output([*java, "--version"], text=True).splitlines()[0]

    results = [line.split("\t") for line in run.stdout.splitlines()]
    if len(results) != len(rows):
        raise RuntimeError("The JVM did not return a result for every fixture.")
    print("RAMS synthetic motion replay | runTier1Inference | precomputed features | empty learned profile")
    print(f"Toolchain: {java_version}, Kotlin {versions['kotlin']}, kotlinx-coroutines {versions['kotlinxCoroutinesCore']}")
    print(f"Kotlin source SHA-256: {source_hash}")
    print(f"Compiled engine class SHA-256: {sha(ENGINE)}")
    print(f"SHA-256 of sorted fixture-name / SHA-256 list: {fixture_hash.hexdigest()}")
    for label, name in [("1", "Accident labels"), ("0", "Benign labels")]:
        cohort = [r for r in results if r[1] == label]
        print(f"{name} matched: {sum(r[1] == r[2] for r in cohort)}/{len(cohort)}")
    print("\nfixture\tlabel_alarm\tpredicted_alarm\tpredicted_profile")
    print(run.stdout, end="")


if __name__ == "__main__":
    replay()
