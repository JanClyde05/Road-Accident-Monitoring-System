@echo off
setlocal
title RAMS AI Applications - Master Build Suite

echo ===============================================================================
echo   RAMS NEXT-GEN AI APPLICATIONS - MASTER BUILD SUITE
echo ===============================================================================
echo.

echo [1/2] Compiling Desktop Rescuer Application (DBSCAN + Local LLM)...
call "%~dp0desktop_ai_app\Build_Desktop_Exe.bat" /nopause
if errorlevel 1 (
    echo [ERROR] Desktop App build failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Compiling Mobile Android APK (LiteRT + Sherpa-ONNX + Dev Training)...
call "%~dp0mobile_ai_app\Build_APK.bat" /nopause
if errorlevel 1 (
    echo [ERROR] Mobile App build failed!
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo   [ALL BUILDS COMPLETE] Both RAMS AI Applications Built Successfully!
echo.
echo   Desktop Application: %~dp0desktop_ai_app\RAMS_Rescuer_Desktop.exe
echo   Mobile APK Package:  %~dp0mobile_ai_app\prebuilt_apk\RAMS_Mobile_AI_v2.5.apk
echo ===============================================================================
echo.
pause
exit /b 0

