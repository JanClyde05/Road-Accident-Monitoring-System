@echo off
setlocal enabledelayedexpansion
title RAMS Mobile App - Live Web Preview

echo ===============================================================================
echo   Road Accident Monitoring System (RAMS) - Live Web Application Preview
echo ===============================================================================
echo.

set "PREVIEW_DIR=%~dp0AI Studio\UI Fix"
set "TARGET_PORT=3000"
set "PREVIEW_URL=http://localhost:%TARGET_PORT%/#wearable_ui"

if not exist "%PREVIEW_DIR%\package.json" (
    echo [ERROR] Preview directory not found at: %PREVIEW_DIR%
    pause
    exit /b 1
)

echo [INFO] Checking if local preview server is already active on port %TARGET_PORT%...

powershell -NoProfile -Command "try { $client = New-Object System.Net.Sockets.TcpClient('127.0.0.1', %TARGET_PORT%); $client.Close(); exit 0 } catch { exit 1 }" >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo [OK] Preview server is already running on port %TARGET_PORT%!
    goto LAUNCH_BROWSER
)

echo [INFO] Starting local preview server via Node.js Vite...
cd /d "%PREVIEW_DIR%"
start "RAMS Preview Server (Port %TARGET_PORT%)" /min cmd.exe /c "npm run dev"

echo [INFO] Waiting for server to initialize...
set /a ATTEMPTS=0

:WAIT_LOOP
set /a ATTEMPTS+=1
powershell -NoProfile -Command "try { $client = New-Object System.Net.Sockets.TcpClient('127.0.0.1', %TARGET_PORT%); $client.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% EQU 0 goto SERVER_READY
if !ATTEMPTS! GEQ 15 goto SERVER_TIMEOUT
timeout /t 1 /nobreak >nul
goto WAIT_LOOP

:SERVER_TIMEOUT
echo [WARN] Server start took longer than expected. Attempting to open browser anyway...
goto LAUNCH_BROWSER

:SERVER_READY
echo [OK] Preview server is ONLINE and responding at http://localhost:%TARGET_PORT%/

:LAUNCH_BROWSER
echo.
echo ===============================================================================
echo   [ACTIVE] Mobile Phone and Wearable Interactive Showcase
echo ===============================================================================
echo   URL: %PREVIEW_URL%
echo.
echo   Interactive Test Features in this Preview:
echo    [1] Rider Registration and Category Switcher (Pedestrian, Cyclist, Car, Moto)
echo    [2] Deterministic RAMS-XXXX FNV-1a Hash Token Generation
echo    [3] Real-time 100Hz IMU Acceleration and Angular Velocity Waveforms
echo    [4] Tuguegarao City Vector Road Map with Strict GPS Fix Pin Logic
echo    [5] High-G Impact Collision and 3.0s Emergency Countdown FSM Simulation
echo    [6] Full-Duplex WebSocket Protocol Terminal (Port 81)
echo.
echo   Direct Quick Links:
echo    - Mobile App Showcase:   http://localhost:%TARGET_PORT%/#wearable_ui
echo    - Receiver Wi-Fi Portal: http://localhost:%TARGET_PORT%/#receiver_ui
echo    - FSM Motion Simulator:  http://localhost:%TARGET_PORT%/#simulator
echo    - System Architecture:   http://localhost:%TARGET_PORT%/#architecture
echo ===============================================================================
echo.
echo [INFO] Opening default web browser...
start "" "%PREVIEW_URL%"

echo.
echo You can keep this window open or close it at any time.
echo The local server runs in the background.
echo.
exit /b 0
