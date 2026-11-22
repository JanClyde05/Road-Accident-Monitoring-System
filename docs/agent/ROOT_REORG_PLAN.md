# Root Reorganization Plan

Sorts the repository root by purpose without breaking a single launcher, and
removes the duplicate source trees that make fixes land in the wrong copy.

Status: proposed. Enforced by `DOC-001`, `DOC-002`, `DOC-004`, `DOC-005`,
`REPO-001`, `REPO-002`, `REPO-003` in `scripts/verify/check_invariants.py`.

---

## 1. Inventory

Root today: 7 markdown documents, 5 automation scripts, a hidden model-state
file, a duplicate skills folder, and 14 directories. The rule going forward is:
the root holds navigation documents and directories only.

| Item | Verdict | Destination |
| --- | --- | --- |
| `README.md` | keep | entry point |
| `AGENTS.md`, `GEMINI.md` | keep | agent contracts |
| `DIRECTORY_MAP.md` | keep | navigation index |
| `MEMORY_MAP.md` | keep | knowledge base |
| `DESIGN_RULES.md` | keep | design contract |
| `00_SYSTEM_ARCHITECTURE.md` | keep | architecture |
| `MASTER_SYSTEM_LOG_AND_METHODOLOGY.md` | duplicate | delete, `docs/` copy wins |
| `auto_train_rams.ps1` | move | `scripts/training/` |
| `auto_train_rams.bat` | move | `scripts/training/` |
| `auto_train_and_build_apk.bat` | move | `scripts/training/` |
| `preview_mobile_app.bat` | move | `scripts/launchers/` |
| `open_flowcharts.bat` | move | `scripts/launchers/` |
| `.active_model` | optional | `tools/launchers/state/` |
| `AI Skills/` | exact duplicate | delete, `.agents/skills/` wins |
| `apps/desktop_app/` | duplicate tree | archive after smoke test |
| `apps/new_ai_applications/mobile_ai_app/` | duplicate tree | archive |
| `archive/`, `prototypes/`, `scratch/` | keep | frozen by design |

Evidence for the duplicates:

- `MASTER_SYSTEM_LOG_AND_METHODOLOGY.md` and `docs/MASTER_SYSTEM_LOG_AND_METHODOLOGY.md`
  have SHA256 `2A4F5EF0...` and identical length (64,996 bytes).
- `AI Skills/pcb-design-astra/SKILL.md` and
  `.agents/skills/pcb-design-astra/SKILL.md` have SHA256 `678C0ACE...`; the file
  sets are identical.
- `apps/android_app/app/build.gradle.kts` and
  `apps/new_ai_applications/mobile_ai_app/app/build.gradle.kts` both declare
  `applicationId = "com.aistudio.rams.wkqmzb"`. The canonical tree has 219
  tracked files; the copy has 100 and lacks `rams_distilled_knowledge.jsonl`,
  `voice_wake_patterns.json`, and the capped reconnect loop.
- `apps/desktop_app/Program.cs` (102,041 bytes) and
  `apps/new_ai_applications/desktop_ai_app/Program.cs` (97,422 bytes) expose the
  same 30 entry points. This one needs a smoke test before archiving, because
  size alone does not prove which build is deployed.

<a id="stage-1"></a>
## 2. Stage 1 - Remove exact duplicates

Zero behavioral risk. Do this first so later stages do not have to edit two
copies.

```powershell
git rm MASTER_SYSTEM_LOG_AND_METHODOLOGY.md
git rm -r "AI Skills"
```

Reference updates:

- `DIRECTORY_MAP.md:55` - remove the `AI Skills/` line from the tree.
- `DIRECTORY_MAP.md:148` - retitle the section to `.agents/skills/` only.
- `DIRECTORY_MAP.md:154` - drop the `AI Skills/...` link, keep
  `.agents/skills/pcb-design-astra/`.
- `README.md` - any link to the root log must point at
  `docs/MASTER_SYSTEM_LOG_AND_METHODOLOGY.md`.

Do not touch `docs/MASTER_SYSTEM_LOG_AND_METHODOLOGY.md`; it is the canonical
incident history and becomes the archive that `INCIDENT_LEDGER.md` summarizes.

<a id="stage-2"></a>
## 3. Stage 2 - Move automation out of the root

Two subfolders, one purpose each:

- `scripts/training/` - dataset synthesis and APK rebuild.
- `scripts/launchers/` - human entry points that open an app or a preview.

`tools/launchers/` already exists for AI model switching (`ask_glm`,
`switch_model`). Keep it separate: model tooling is not a project entry point.

```powershell
git mv auto_train_rams.ps1          scripts/training/
git mv auto_train_rams.bat          scripts/training/
git mv auto_train_and_build_apk.bat scripts/training/
git mv preview_mobile_app.bat       scripts/launchers/
git mv open_flowcharts.bat          scripts/launchers/
```

### Required path fixes

These are not optional. Each script resolves paths from its own location, so a
move silently breaks it.

`scripts/training/auto_train_rams.ps1`

```powershell
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot  = Split-Path -Parent (Split-Path -Parent $scriptDir)
...
python "$repoRoot\scripts\train_rams_ai.py"
...
Set-Location "$repoRoot\apps\android_app"
```

`scripts/training/auto_train_rams.bat`

```bat
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto_train_rams.ps1" %*
```

`scripts/training/auto_train_and_build_apk.bat`

```bat
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto_train_rams.ps1" -Compile
```

`scripts/launchers/preview_mobile_app.bat`

```bat
set "PREVIEW_DIR=%~dp0..\..\prototypes\AI Studio\UI Fix"
```

`apps/Preview_Mobile_App_Web.bat`

```bat
call "%~dp0..\scripts\launchers\preview_mobile_app.bat"
```

`apps/android_app/preview_web.bat` currently does `cd /d "%~dp0.."` and then calls
`preview_mobile_app.bat`, which resolves to `apps\preview_mobile_app.bat` and does
not exist. Replace the body with an explicit call:

```bat
call "%~dp0..\..\scripts\launchers\preview_mobile_app.bat"
```

### Reference updates after the move

| File | Line | Change |
| --- | --- | --- |
| `DIRECTORY_MAP.md` | 67 | `scripts/launchers/preview_mobile_app.bat` |
| `DIRECTORY_MAP.md` | 68 | `scripts/launchers/open_flowcharts.bat` |
| `DIRECTORY_MAP.md` | 100 | `scripts/training/auto_train_rams.bat` |
| `MEMORY_MAP.md` | 428-429 | same two paths |
| `00_SYSTEM_ARCHITECTURE.md` | 125 | preview launcher path |
| `README.md` | 174 | preview launcher path |
| `auto_train_rams.ps1` | 11-12, 55 | rebase to `$repoRoot` |

### Optional: `.active_model`

It is written by `scripts/switch_model.py:70` and read by
`scripts/openrouter_glm.py:30`, both as `<repo>/.active_model`. Moving it means
changing two constants to `os.path.join(REPO_ROOT, "tools", "launchers", "state",
".active_model")` and creating the directory. Low value; do it only if the hidden
file bothers you. It is not part of the invariant gate.

<a id="stage-3"></a>
## 4. Stage 3 - Resolve duplicate application trees

This is the highest-risk item and the one that matters most. Today a fix applied
to `apps/new_ai_applications/mobile_ai_app` compiles, looks correct, and ships
nothing, because the phone runs `apps/android_app` (or the reverse, depending on
which APK was last installed). The same ambiguity exists for the desktop.

### Android

Decision: `apps/android_app` is canonical.

Why: 219 tracked files against 100, it carries the distilled knowledge and voice
wake assets that the training pipeline produces, and its sync engine has the
capped reconnect loop and ping benchmark that the copy lacks.

```powershell
git mv apps/new_ai_applications/mobile_ai_app archive/duplicates/mobile_ai_app_2026-11
```

Then update `apps/new_ai_applications/README.md` and `DIRECTORY_MAP.md` so the
tree shows one Android app.

### Desktop

Decision: `apps/new_ai_applications/desktop_ai_app` is canonical, pending a smoke
test.

Why: it is the tree named by the connectivity work, it has `Build_Desktop_Exe.bat`,
and its `Program.cs` is the smaller of the two while exposing the same 30 entry
points. Size is not proof, so run both before archiving:

```powershell
# build the candidate to a scratch path, launch, ingest one packet on 8888
powershell scripts/verify/verify_all.ps1 -Build desktop
# then launch apps/desktop_app/RAMS_Debug.exe and repeat the ingest
```

Only after both ingest correctly:

```powershell
git mv apps/desktop_app archive/duplicates/desktop_app_2026-11
```

If the legacy build has a feature the candidate lacks, port it first, then
archive. Do not delete either tree until the packet ingest test passes twice.

### What not to move

- `firmware/`, `hardware/`, `manufacturing/`, `validation/` - toolchain paths are
  referenced by build scripts and KiCad projects.
- `docs/Datasheets`, `docs/Pictures`, `docs/RAMS` - binary assets with relative
  references.
- `archive/`, `prototypes/`, `scratch/` - already the correct dumping ground.

<a id="stage-4"></a>
## 5. Stage 4 - Repair references

Run the checker first; it lists the exact broken links.

```powershell
python scripts/verify/check_invariants.py --filter DOC-003
```

Known items at the time of writing:

1. `README.md:78` points at `apps/desktop_app/RescuerForm.cs`, a file that does
   not exist in either tree. Replace the row with the canonical desktop tree and
   its real files (`Program.cs`, `HotspotPredictor.cs`, `DesktopAiReportGenerator.cs`).
2. `docs/MASTER_SYSTEM_LOG_AND_METHODOLOGY.md` carries one stale link to the same
   missing file. Historical documents are allowed to rot (`DOC-005` is a WARN),
   but fix it while you are there.
3. Every absolute `file://` link assumes the repository lives at
   `D:\Antigravity\Projects\Road Accident Monitoring System`. On a worktree or a second
   machine they all break. Convert navigation documents to repository-relative
   links; keep absolute links only in historical notes.

Relative link form:

```markdown
[`Esp32SyncEngine.kt`](../../apps/android_app/app/src/main/java/com/example/sync/Esp32SyncEngine.kt)
```

<a id="stage-5"></a>
## 6. Stage 5 - Untracked copies and the verification gate

The main checkout has an untracked `Working Code - Do Not Touch/` at the root that
duplicates `archive/Working Code - Do Not Touch/`. The worktree does not.
Before porting these changes back:

```powershell
# in the main checkout, not the worktree
git status --short
# if the untracked copy is byte-identical, remove it; otherwise move it under archive/
```

Gate for the whole reorganization:

```powershell
python scripts/verify/check_invariants.py --filter DOC- REPO-
powershell scripts/verify/verify_all.ps1 -Build desktop
```

`DOC-001`, `DOC-002`, `DOC-004`, `REPO-002`, `REPO-003` must pass. `DOC-003` must
pass for navigation documents. `DOC-005` may remain a WARN for the historical log.

## 7. Execution order and rollback

1. Stage 1 (deletions) - one commit.
2. Stage 2 (moves plus reference fixes) - one commit. Run the preview launcher
   and the training script with `-Compile` skipped before committing.
3. Stage 3 (archive duplicates) - one commit per app tree, after the smoke test.
4. Stage 4 (links) - one commit.
5. Stage 5 (main checkout cleanup) - separate, outside the worktree.

Every stage is a `git mv` plus text edits, so `git revert <sha>` restores the
previous layout. No stage deletes a tree that has not been built and exercised in
the same session.

## 8. Definition of done

- Root contains only the seven canonical documents, `.gitignore`, and
  directories.
- `python scripts/verify/check_invariants.py` reports no FAIL outside the
  connectivity and BLE checks that are still being implemented.
- One Android tree, one desktop tree, one copy of each document.
- Every launcher in `DIRECTORY_MAP.md` opens its target from a clean shell.
