<#
.SYNOPSIS
    Automated AI Training & Knowledge Distillation Pipeline for RAMS V2.
.DESCRIPTION
    Synthesizes and updates:
      1. apps/android_app/app/src/main/assets/rams_distilled_knowledge.jsonl
      2. apps/android_app/app/src/main/assets/voice_wake_patterns.json
      3. apps/android_app/app/src/main/assets/motion_benchmarks/*.json
    Optionally compiles the Android APK with the newly generated assets.
.EXAMPLE
    .\auto_train_rams.ps1
    .\auto_train_rams.ps1 -Compile
#>

param(
    [switch]$Compile
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          RAMS V2 AUTOMATED AI TRAINING & DATASET PIPELINE            " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "[INFO] Training on-device models across all parameters:"
Write-Host "  - 14-parameter IMU Kinematics & 50Hz Time-Series Scenarios"
Write-Host "  - Acoustic Wake-Word & Semantic Speech Intent Recognition"
Write-Host "  - Tuguegarao Spatial Landmarks, Ordinances & Tricycle Fares"
Write-Host "  - Philippine Traffic Laws (RA 10054, RA 10666, RA 10913, RA 10586)"
Write-Host "  - First Aid Trauma Triage & Emergency Dispatch Protocols"
Write-Host "  - Multilingual Voice Category Switching & Kinematic State Machine"
Write-Host "======================================================================" -ForegroundColor Cyan

python "$scriptDir\scripts\train_rams_ai.py"
if ($LASTEXITCODE -ne 0) {
    Write-Error "AI dataset training failed with exit code $LASTEXITCODE."
    exit $LASTEXITCODE
}

if ($Compile) {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Yellow
    Write-Host "[BUILD] Recompiling Android APK with newly baked AI training assets..." -ForegroundColor Yellow
    Write-Host "======================================================================" -ForegroundColor Yellow
    Set-Location "$scriptDir\apps\android_app"
    .\gradlew.bat assembleDebug
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Gradle compilation failed."
        exit $LASTEXITCODE
    }
    Write-Host ""
    Write-Host "[SUCCESS] Debug APK generated with updated AI assets:" -ForegroundColor Green
    Write-Host "  apps\android_app\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[TIP] Run '.\auto_train_rams.ps1 -Compile' to re-bake and assemble the APK!" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "[DONE] RAMS AI training suite completed successfully." -ForegroundColor Green

