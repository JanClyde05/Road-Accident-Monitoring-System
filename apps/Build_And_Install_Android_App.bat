@echo off
setlocal
cd /d "%~dp0android_app"
call build_and_install.bat
exit /b %ERRORLEVEL%
