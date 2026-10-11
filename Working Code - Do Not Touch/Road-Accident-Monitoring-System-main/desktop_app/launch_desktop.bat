@echo off
setlocal
title RAMS Rescuer Desktop Operations Launcher

echo ===============================================================================
echo   Road Accident Monitoring System (RAMS) - Standalone Rescuer Desktop
echo ===============================================================================
echo.

if not exist "%~dp0RAMS_Rescuer_Desktop.exe" (
    echo [INFO] Executable not found. Compiling first...
    call "%~dp0build_exe.bat"
    if errorlevel 1 (
        echo [ERROR] Build failed. Cannot launch.
        pause
        exit /b 1
    )
)

echo [INFO] Launching RAMS Rescuer Operations Center Desktop App...
start "" "%~dp0RAMS_Rescuer_Desktop.exe"
exit /b 0
