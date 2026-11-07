@echo off
setlocal
title RAMS Mobile AI - APK Builder

echo ===============================================================================
echo   RAMS Mobile AI APK Builder
echo   Features: Dual-Tier Edge AI + Offline Sherpa-ONNX Voice + Dev Training
echo ===============================================================================
echo.

cd /d "%~dp0"
echo [INFO] Compiling Debug APK via Gradle...
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo.
    echo [ERROR] Gradle build failed!
    pause
    exit /b 1
)

if not exist "%~dp0prebuilt_apk" mkdir "%~dp0prebuilt_apk"
copy /y "%~dp0app\build\outputs\apk\debug\app-debug.apk" "%~dp0prebuilt_apk\RAMS_Mobile_AI_v2.5.apk" >nul

echo.
echo ===============================================================================
echo   [SUCCESS] APK built successfully!
echo   Location: %~dp0prebuilt_apk\RAMS_Mobile_AI_v2.5.apk
echo ===============================================================================
echo.
if not "%1"=="/nopause" pause
exit /b 0

