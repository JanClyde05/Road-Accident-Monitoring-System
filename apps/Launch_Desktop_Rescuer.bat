@echo off
setlocal
cd /d "%~dp0..\desktop_app"
call launch_desktop.bat
exit /b %ERRORLEVEL%
