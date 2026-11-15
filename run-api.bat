@echo off
title Preplit AI API (port 5000)
cd /d "%~dp0server"
if not exist "node_modules" (
  echo Installing backend dependencies, this may take a few minutes...
  call npm install
)
echo.
echo Starting API on http://localhost:5000
echo.
call npm run dev
pause
