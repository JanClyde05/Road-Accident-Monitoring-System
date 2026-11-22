@echo off
setlocal enabledelayedexpansion
title RAMS Mobile AI - Build & USB Install

echo ===============================================================================
echo   RAMS Mobile AI - Automated USB Deployer
echo ===============================================================================
echo.

set "ADB_BIN="
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set "ADB_BIN=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
) else (
    where.exe adb >nul 2>nul
    if not errorlevel 1 set "ADB_BIN=adb"
)

if "%ADB_BIN%"=="" (
    echo [WARNING] ADB not found in path. Proceeding with APK compilation only...
) else (
    echo [OK] ADB detected: %ADB_BIN%
)

cd /d "%~dp0"
echo [INFO] Compiling Debug APK...
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

set "APK_PATH=%~dp0app\build\outputs\apk\debug\app-debug.apk"

if not "%ADB_BIN%"=="" (
    echo [INFO] Installing APK to connected USB Android device...
    "%ADB_BIN%" install -r "%APK_PATH%"
    if not errorlevel 1 (
        echo [SUCCESS] APK successfully installed on connected phone!
        echo [INFO] Launching RAMS app on phone...
        "%ADB_BIN%" shell am start -n com.aistudio.rams.wkqmzb/com.example.SplashActivity
    ) else (
        echo [NOTICE] No device connected or authorized. APK is ready at:
        echo %APK_PATH%
    )
) else (
    echo [INFO] APK ready at: %APK_PATH%
)

echo.
pause
exit /b 0

