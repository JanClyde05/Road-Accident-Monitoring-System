@echo off
title RAMS Local GLM-5.3-Flash Proxy Server
echo Starting RAMS Local OpenAI-Compatible Proxy on http://127.0.0.1:5000/v1 ...
python "%~dp0..\..\scripts\local_llm_proxy.py" %*
pause


