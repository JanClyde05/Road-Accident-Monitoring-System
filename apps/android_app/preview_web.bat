@echo off
setlocal
cd /d "%~dp0.."
call preview_mobile_app.bat
exit /b %ERRORLEVEL%
