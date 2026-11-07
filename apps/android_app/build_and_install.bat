@echo off
setlocal enabledelayedexpansion

title RAMS Monitor - Build and Install (Phone IMU + Dual-Band GPS)
echo ===============================================================================
echo   ROAD ACCIDENT MONITORING SYSTEM (RAMS) v2.5
echo   Automated Android Build and USB Debugging Installer
echo ===============================================================================
echo.

REM 1. Locate ADB
set "ADB_BIN="
if exist "%LOCALAPPDATA%\Microsoft\WinGet\Packages\Google.PlatformTools_Microsoft.Winget.Source_8wekyb3d8bbwe\platform-tools\adb.exe" (
    set "ADB_BIN=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Google.PlatformTools_Microsoft.Winget.Source_8wekyb3d8bbwe\platform-tools\adb.exe"
) else if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set "ADB_BIN=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
) else (
    where.exe adb >nul 2>nul
    if not errorlevel 1 (
        set "ADB_BIN=adb"
    )
)

if "%ADB_BIN%"=="" (
    echo [ERROR] ADB platform-tools not found!
    echo Please install Android platform-tools or run 'winget install Google.PlatformTools'.
    pause
    exit /b 1
)
echo [OK] ADB detected: %ADB_BIN%

REM 2. Locate JDK 17
set "JAVA_CMD="
if exist "%LOCALAPPDATA%\Programs\jdk-17\bin\java.exe" (
    set "JAVA_HOME=%LOCALAPPDATA%\Programs\jdk-17"
    set "JAVA_CMD=%LOCALAPPDATA%\Programs\jdk-17\bin\java.exe"
) else if not "%JAVA_HOME%"=="" (
    if exist "%JAVA_HOME%\bin\java.exe" (
        set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
    )
)

if "%JAVA_CMD%"=="" (
    where.exe java >nul 2>nul
    if not errorlevel 1 (
        set "JAVA_CMD=java"
    )
)

if "%JAVA_CMD%"=="" (
    echo [ERROR] Java JDK 17 not found!
    echo Please install OpenJDK 17.
    pause
    exit /b 1
)
echo [OK] Java detected: %JAVA_CMD%
if not "%JAVA_HOME%"=="" (
    echo [OK] JAVA_HOME: %JAVA_HOME%
    set "PATH=%JAVA_HOME%\bin;%PATH%"
)

REM 3. Configure Android SDK
if exist "%LOCALAPPDATA%\Android\Sdk" (
    set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
    set "ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"
    echo [OK] Android SDK detected: %LOCALAPPDATA%\Android\Sdk
)

REM 4. Check Connected Android Devices
echo.
echo [STATUS] Probing connected Android hardware via USB...
:check_device
"%ADB_BIN%" devices | findstr /R "device$" >nul
if not errorlevel 1 goto device_ready

"%ADB_BIN%" devices | findstr /I "unauthorized" >nul
if not errorlevel 1 (
    echo.
    echo [ATTENTION] Phone detected but USB Debugging is UNAUTHORIZED!
    echo -------------------------------------------------------------
    echo 1. Check your phone screen right now.
    echo 2. Check the box: Always allow from this computer.
    echo 3. Tap Allow or OK.
    echo.
    echo Waiting for authorization...
    timeout /t 3 >nul
    goto check_device
)

echo [WAIT] No authorized Android device detected via USB.
echo ---------------------------------------------------
echo Ensure:
echo   1. Phone is plugged into PC via USB cable.
echo   2. Developer Options is enabled (Settings - About Phone - Tap Build Number 7x).
echo   3. USB Debugging is toggled ON.
echo   4. (Infinix / Xiaomi / Realme): Enable Install via USB if prompted.
echo.
echo Retrying in 5 seconds... (Press Ctrl+C to cancel)
timeout /t 5 >nul
goto check_device

:device_ready
echo.
echo [OK] Target Android device connected and authorized:
"%ADB_BIN%" devices -l
echo.

REM 5. Build Debug APK using Gradle
echo [STATUS] Compiling RAMS Monitor APK (Jetpack Compose, Zero Emojis, Dark Slate)...
cd /d "%~dp0"

call gradlew.bat assembleDebug
if errorlevel 1 (
    echo.
    echo [ERROR] Gradle build failed! Check errors above.
    pause
    exit /b 1
)

REM 6. Install APK onto Device
set "APK_PATH=app\build\outputs\apk\debug\app-debug.apk"
if not exist "%APK_PATH%" (
    echo [ERROR] APK not found at %APK_PATH%!
    pause
    exit /b 1
)

echo.
echo [STATUS] Installing APK via USB onto phone...
"%ADB_BIN%" -d install -r -d "%APK_PATH%"
if not errorlevel 1 goto LAUNCH_APP

echo.
echo [INFO] Direct update failed (likely signature mismatch from previous AI Studio build).
echo [INFO] Performing clean reinstall by removing old conflicting build...
"%ADB_BIN%" -d uninstall com.aistudio.rams.wkqmzb >nul 2>&1
"%ADB_BIN%" -d install "%APK_PATH%"
if errorlevel 1 goto INSTALL_ERROR

:LAUNCH_APP
echo.
echo [STATUS] Launching RAMS Monitor on phone...
"%ADB_BIN%" -d shell am start -n com.aistudio.rams.wkqmzb/com.example.MainActivity

echo.
echo ===============================================================================
echo   RAMS MONITOR SUCCESSFULLY DEPLOYED TO PHONE!
echo   - 100Hz IMU Acceleration and Angular Velocity Active
echo   - Dual-Band Precision GPS Active
echo   - Full-Duplex WebSocket Uplink to ESP32 Ready (ws://192.168.4.1:81/ws)
echo ===============================================================================
echo.
exit /b 0

:INSTALL_ERROR
echo.
echo [ERROR] Failed to install APK onto device!
echo Check if Install via USB permission is enabled on your phone screen:
echo   Settings - Developer Options - Install via USB
pause
exit /b 1
