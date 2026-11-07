@echo off
setlocal
cd /d "%~dp0mobile_ai_app"
call Build_APK.bat
exit /b %ERRORLEVEL%

