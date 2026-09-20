@echo off
setlocal
title RAMS Receiver Firmware Flasher
echo ===============================================================================
echo   RAMS ESP32-S3 LoRa Receiver Firmware Flasher
echo ===============================================================================
echo.

set "CLI=C:\Program Files\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe"
if not exist "%CLI%" (
    echo [INFO] Arduino CLI not found in default path. Please flash via Arduino IDE:
    echo   1. Open receiver_withDesktop.ino in Arduino IDE
    echo   2. Tools -> Board: ESP32S3 Dev Module
    echo   3. Tools -> USB CDC On Boot: Enabled
    echo   4. Click Upload
    pause
    exit /b 1
)

set "PORT=%~1"
if "%PORT%"=="" set "PORT=COM11"

echo [1/2] Compiling receiver_withDesktop with USB CDC enabled...
"%CLI%" compile --fqbn esp32:esp32:esp32s3:CDCOnBoot=cdc "%~dp0."
if errorlevel 1 (
    echo.
    echo [ERROR] Compilation failed.
    pause
    exit /b 1
)

echo.
echo [2/2] Uploading to %PORT%...
echo (If access denied, please close the Arduino Serial Monitor first!)
echo.
"%CLI%" upload -p %PORT% --fqbn esp32:esp32:esp32s3:CDCOnBoot=cdc "%~dp0."
if errorlevel 1 (
    echo.
    echo [ERROR] Upload failed on %PORT%.
    echo If your receiver is on another COM port, run:
    echo   flash_receiver.bat COMx
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo   SUCCESS: RAMS Receiver base station is successfully flashed and ready!
echo ===============================================================================
pause
exit /b 0
