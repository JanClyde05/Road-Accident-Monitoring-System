@echo off
setlocal enabledelayedexpansion
title RAMS V2 Auto-Trainer

:: Ensure we run in project root
cd /d "%~dp0"

echo ======================================================================
echo           RAMS V2 AUTOMATED ONE-CLICK AI TRAINING PIPELINE
echo ======================================================================
echo [INFO] Bypassing PowerShell execution policies and running auto-trainer...
echo ======================================================================

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto_train_rams.ps1" %*

echo.
echo Press any key to close this window...
pause >nul
