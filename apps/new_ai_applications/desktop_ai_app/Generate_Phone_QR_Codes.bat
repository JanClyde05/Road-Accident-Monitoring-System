@echo off
setlocal
title RAMS Emergency Phone QR Code Generator
echo ===============================================================================
echo   RAMS Standalone Emergency Phone QR Code Generator
echo   Creates fast-dialing QR codes (tel:...) for all registered riders & contacts
echo ===============================================================================
echo.

python "%~dp0tools\generate_phone_qrcodes.py"
if errorlevel 1 (
    echo.
    echo [ERROR] QR Code generation failed.
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo   [SUCCESS] QR Codes generated!
echo   Opening Rescuer Emergency Contact Directory in your browser...
echo ===============================================================================
start "" "%~dp0www\phone_qr_directory.html"
exit /b 0
