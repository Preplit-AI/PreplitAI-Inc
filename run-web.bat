@echo off
title Junbee Web (port 8080)
cd /d "%~dp0"
echo.
echo Starting Vite dev server on http://localhost:8080
echo.
call npm run dev
pause
