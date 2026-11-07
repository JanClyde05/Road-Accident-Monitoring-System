@echo off
setlocal enabledelayedexpansion
title RAMS Desktop AI Rescuer Compiler

echo ===============================================================================
echo   RAMS Standalone Desktop AI Rescuer Application Compiler
echo   Features: Haversine DBSCAN Hotspot Prediction + Local LLM Analyst
echo ===============================================================================
echo.

set "CSC_EXE=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if exist "%CSC_EXE%" goto COMPILE

set "CSC_EXE=C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
if exist "%CSC_EXE%" goto COMPILE

echo [ERROR] Native C# compiler (csc.exe) not found in Windows Microsoft.NET directory.
pause
exit /b 1

:COMPILE
echo [INFO] Found Native Windows Compiler: %CSC_EXE%
echo [INFO] Closing running instances of RAMS_Rescuer_Desktop.exe...
taskkill /f /im RAMS_Rescuer_Desktop.exe >nul 2>&1
ping 127.0.0.1 -n 2 >nul
echo [INFO] Compiling RAMS_Rescuer_Desktop.exe...
echo.

"%CSC_EXE%" /nologo /target:winexe /optimize+ /win32icon:"%~dp0app.ico" /out:"%~dp0RAMS_Rescuer_Desktop.exe" /r:System.dll,System.Core.dll,System.Windows.Forms.dll,System.Drawing.dll "%~dp0Program.cs" "%~dp0HotspotPredictor.cs" "%~dp0DesktopAiReportGenerator.cs"

if errorlevel 1 (
    echo.
    echo [ERROR] Compilation failed!
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo   [SUCCESS] RAMS_Rescuer_Desktop.exe built successfully!
echo   Location: %~dp0RAMS_Rescuer_Desktop.exe
echo ===============================================================================
echo.
if not "%1"=="/nopause" pause
exit /b 0

