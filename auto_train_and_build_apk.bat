@echo off
setlocal enabledelayedexpansion
title RAMS V2 Auto-Trainer + APK Compiler

cd /d "%~dp0"

echo ======================================================================
echo       RAMS V2 ONE-CLICK: TRAIN ALL AI DATASETS + BUILD ANDROID APK
echo ======================================================================
echo [INFO] Training 2,500+ parameters and compiling production debug APK...
echo ======================================================================

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto_train_rams.ps1" -Compile

echo.
echo Press any key to close this window...
pause >nul

