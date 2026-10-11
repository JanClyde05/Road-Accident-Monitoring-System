@echo off
setlocal
cd /d "%~dp0..\android_app"
call build_and_install.bat
exit /b %ERRORLEVEL%
