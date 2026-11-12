@echo off
setlocal
if "%1"=="glm" (
    call "%~dp0switch_model.bat" glm
    shift
) else if "%1"=="qwen" (
    call "%~dp0switch_model.bat" qwen
    shift
) else if "%1"=="gemma" (
    call "%~dp0switch_model.bat" gemma
    shift
) else if "%1"=="gemma-free" (
    call "%~dp0switch_model.bat" gemma-free
    shift
)

claude %1 %2 %3 %4 %5 %6 %7 %8 %9


