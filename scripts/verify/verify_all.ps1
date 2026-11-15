<#
.SYNOPSIS
    One verification run: invariants, optional builds, append-only log.

.DESCRIPTION
    The invariant checker is always run. Builds are opt-in because a firmware
    compile takes about 40 seconds and an Android debug build can take minutes.

    Build outputs go to a temporary directory. Nothing tracked is overwritten:
    the desktop executable in apps/new_ai_applications/desktop_ai_app is left
    alone, and arduino-cli compiles into a temp build path.

    Results append to docs/agent/verification-log.jsonl, one JSON object per run,
    so regressions are visible as a sequence rather than a single snapshot.

.PARAMETER Build
    none, desktop, wearable, receiver, android, or all.

.PARAMETER Strict
    Treat invariant WARN results as failures.

.EXAMPLE
    powershell scripts/verify/verify_all.ps1
    powershell scripts/verify/verify_all.ps1 -Build all
    powershell scripts/verify/verify_all.ps1 -Build desktop,receiver -Strict
#>
[CmdletBinding()]
param(
    [string[]]$Build = @("none"),

    [switch]$Strict,

    [string]$Log = "docs/agent/verification-log.jsonl"
)

$ErrorActionPreference = "Continue"

# -File passes "-Build desktop,receiver" as one string; split it here so the
# documented comma form works from cmd, PowerShell, and CI.
$Build = @($Build | ForEach-Object { $_ -split "," } | ForEach-Object { $_.Trim().ToLower() } | Where-Object { $_ })
$validTargets = @("none", "desktop", "wearable", "receiver", "android", "all")
foreach ($b in $Build) {
    if ($validTargets -notcontains $b) {
        Write-Host "unknown build target '$b'. valid: $($validTargets -join ', ')" -ForegroundColor Red
        exit 2
    }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot  = Split-Path -Parent (Split-Path -Parent $scriptDir)
Set-Location $repoRoot

$artifacts = Join-Path $env:TEMP "rams_verify"
New-Item -ItemType Directory -Path $artifacts -Force | Out-Null

$failures = @()
$results = @()

function Add-Result([string]$Target, [bool]$Ok, [double]$Seconds, [string]$Detail) {
    $script:results += [pscustomobject]@{
        target  = $Target
        ok      = $Ok
        seconds = [math]::Round($Seconds, 1)
        detail  = $Detail
    }
    if (-not $Ok) { $script:failures += "${Target}: $Detail" }
}

function Resolve-ArduinoCli {
    $onPath = Get-Command arduino-cli -ErrorAction SilentlyContinue
    if ($onPath) { return $onPath.Source }
    $candidates = @(
        "C:\Program Files\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe",
        "$env:LOCALAPPDATA\Arduino15\arduino-cli.exe"
    )
    foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
    return $null
}

Write-Host "======================================================================"
Write-Host "  RAMS VERIFICATION"
Write-Host "======================================================================"
Write-Host "  repo:  $repoRoot"
Write-Host "  build: $($Build -join ', ')"
Write-Host "  strict: $Strict"
Write-Host ""

# --------------------------------------------------------------------------
# 1. Invariants
# --------------------------------------------------------------------------
Write-Host "[1] Invariants"
$jsonPath = Join-Path $artifacts "invariants.json"
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$checkArgs = @("scripts/verify/check_invariants.py", "--json", $jsonPath)
if ($Strict) { $checkArgs += "--strict" }
& python @checkArgs | Out-Host
$invariantExit = $LASTEXITCODE
$sw.Stop()

$counts = @{ FAIL = -1; WARN = -1; PASS = -1; SKIP = -1 }
if (Test-Path $jsonPath) {
    try {
        $report = Get-Content $jsonPath -Raw | ConvertFrom-Json
        $counts.FAIL = [int]$report.counts.FAIL
        $counts.WARN = [int]$report.counts.WARN
        $counts.PASS = [int]$report.counts.PASS
        $counts.SKIP = [int]$report.counts.SKIP
    } catch {
        Write-Warning "could not parse $jsonPath"
    }
}

Add-Result "invariants" ($invariantExit -eq 0) $sw.Elapsed.TotalSeconds `
    ("FAIL={0} WARN={1} PASS={2} SKIP={3}" -f $counts.FAIL, $counts.WARN, $counts.PASS, $counts.SKIP)
Write-Host ""

# --------------------------------------------------------------------------
# 2. Builds
# --------------------------------------------------------------------------
$buildSet = @()
if ($Build -contains "all") { $buildSet = @("desktop", "wearable", "receiver", "android") }
else { $buildSet = @($Build | Where-Object { $_ -ne "none" }) }

if ($buildSet.Count -eq 0) {
    Write-Host "[2] Builds - skipped"
} else {
    Write-Host "[2] Builds"
}

foreach ($target in $buildSet) {
    $targetSw = [System.Diagnostics.Stopwatch]::StartNew()
    switch ($target) {

        "desktop" {
            $src = "apps/new_ai_applications/desktop_ai_app"
            $csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
            if (-not (Test-Path $csc)) { $csc = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe" }
            $out = Join-Path $artifacts "desktop\RAMS_Rescuer_Desktop.exe"
            New-Item -ItemType Directory -Path (Split-Path -Parent $out) -Force | Out-Null
            if (-not (Test-Path $csc)) {
                Add-Result "desktop" $false 0 "csc.exe not found"
            } else {
                $cscArgs = @(
                    "/nologo", "/target:winexe", "/optimize+",
                    "/win32icon:$src\app.ico",
                    "/out:$out",
                    "/r:System.dll,System.Core.dll,System.Windows.Forms.dll,System.Drawing.dll",
                    "$src\Program.cs", "$src\HotspotPredictor.cs", "$src\DesktopAiReportGenerator.cs"
                )
                & $csc @cscArgs | Out-Host
                $ok = ($LASTEXITCODE -eq 0) -and (Test-Path $out)
                Add-Result "desktop" $ok $targetSw.Elapsed.TotalSeconds $out
            }
        }

        "wearable" {
            $cli = Resolve-ArduinoCli
            if (-not $cli) {
                Add-Result "wearable" $false 0 "arduino-cli not found"
            } else {
                # No --build-path: arduino-cli's default build dir (gitignored) is
                # incremental. Redirected build paths hang on this toolchain.
                & $cli compile --fqbn esp32:esp32:esp32s3 firmware\wearable_withApp 2>&1 |
                    Select-Object -Last 6 | Out-Host
                Add-Result "wearable" ($LASTEXITCODE -eq 0) $targetSw.Elapsed.TotalSeconds "esp32:esp32:esp32s3"
            }
        }

        "receiver" {
            $cli = Resolve-ArduinoCli
            if (-not $cli) {
                Add-Result "receiver" $false 0 "arduino-cli not found"
            } else {
                # Keep this FQBN identical to firmware/receiver_withDesktop/flash_receiver.bat.
                # A build that does not match the flasher is not a flashable build.
                & $cli compile --fqbn esp32:esp32:esp32s3 firmware\receiver_withDesktop 2>&1 |
                    Select-Object -Last 6 | Out-Host
                Add-Result "receiver" ($LASTEXITCODE -eq 0) $targetSw.Elapsed.TotalSeconds "esp32:esp32:esp32s3; watch 99 percent flash"
            }
        }

        "android" {
            $gradlew = "apps/android_app/gradlew.bat"
            if (-not (Test-Path $gradlew)) {
                Add-Result "android" $false 0 "gradlew.bat not found"
            } else {
                Push-Location "apps/android_app"
                try {
                    & .\gradlew.bat --no-daemon assembleDebug 2>&1 | Select-Object -Last 10 | Out-Host
                    $ok = $LASTEXITCODE -eq 0
                } finally {
                    Pop-Location
                }
                Add-Result "android" $ok $targetSw.Elapsed.TotalSeconds "assembleDebug"
                if (-not $ok) {
                    Write-Host "  [note] a debug build requires ANDROID_HOME and a connected SDK; see apps/android_app/local.properties" -ForegroundColor DarkGray
                }
            }
        }
    }
}

# --------------------------------------------------------------------------
# 3. Append log
# --------------------------------------------------------------------------
Write-Host ""
if ($results.Count -gt 0) {
    foreach ($r in $results) {
        $mark = "ok  "
        if (-not $r.ok) { $mark = "FAIL" }
        Write-Host ("  [{0}] {1,-9} {2,6}s  {3}" -f $mark, $r.target, $r.seconds, $r.detail)
    }
    Write-Host ""
}
Write-Host "[3] Log"
$head = (& git rev-parse --short HEAD 2>$null)
$record = [ordered]@{
    timestamp  = (Get-Date).ToUniversalTime().ToString("o")
    git_head   = "$head"
    strict     = [bool]$Strict
    invariants = @{
        exit   = $invariantExit
        counts = $counts
    }
    builds     = @($results | Where-Object { $_.target -ne "invariants" })
    outcome    = $(if ($failures.Count -eq 0) { "pass" } else { "fail" })
}

$logPath = Join-Path $repoRoot $Log
$logDir = Split-Path -Parent $logPath
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
($record | ConvertTo-Json -Depth 6 -Compress) | Add-Content -LiteralPath $logPath -Encoding UTF8
Write-Host "  appended to $logPath"

# --------------------------------------------------------------------------
# 4. Verdict
# --------------------------------------------------------------------------
Write-Host ""
Write-Host "======================================================================"
if ($failures.Count -eq 0) {
    Write-Host "  PASS"
} else {
    Write-Host "  FAIL"
    foreach ($f in $failures) { Write-Host "  - $f" -ForegroundColor Red }
}
Write-Host "======================================================================"

if ($failures.Count -gt 0) { exit 1 }
exit 0
