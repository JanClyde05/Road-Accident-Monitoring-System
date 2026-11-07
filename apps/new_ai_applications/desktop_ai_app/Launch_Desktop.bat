@echo off
setlocal
title RAMS AI Rescuer Desktop Launcher

echo ===============================================================================
echo   RAMS Emergency Operations Center - Desktop AI Command Dashboard
echo ===============================================================================
echo.

if not exist "%~dp0RAMS_Rescuer_Desktop.exe" (
    echo [INFO] Executable not found. Compiling first...
    call "%~dp0Build_Desktop_Exe.bat"
    if errorlevel 1 (
        echo [ERROR] Build failed. Cannot launch.
        pause
        exit /b 1
    )
)

echo [INFO] Launching RAMS Rescuer Operations Center Desktop App...
start "" "%~dp0RAMS_Rescuer_Desktop.exe"
exit /b 0

