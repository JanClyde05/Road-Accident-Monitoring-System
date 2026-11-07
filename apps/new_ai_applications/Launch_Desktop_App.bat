@echo off
setlocal
cd /d "%~dp0desktop_ai_app"
call Launch_Desktop.bat
exit /b %ERRORLEVEL%

