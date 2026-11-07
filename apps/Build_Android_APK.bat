@echo off
setlocal
title RAMS Android APK Builder
echo ===============================================================================
echo   RAMS Android APK Builder (Dual-Tier Edge AI + Offline Voice Canceler)
echo ===============================================================================
echo.
cd /d "%~dp0android_app"
echo [INFO] Assembling Debug APK via Gradle...
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo.
    echo [ERROR] Gradle build failed!
    pause
    exit /b 1
)
echo.
echo ===============================================================================
echo   [SUCCESS] APK built successfully!
echo   Location: %~dp0android_app\app\build\outputs\apk\debug\app-debug.apk
echo ===============================================================================
echo.
pause
exit /b 0

