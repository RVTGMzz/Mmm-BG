@echo off
setlocal
cd /d "%~dp0"
title MeMeMe Playtest Launcher
echo.
echo ========================================
echo   MeMeMe MVP 0.1.16 - PLAYTEST LAUNCHER
echo ========================================
echo.
echo Dang mo local web server...
echo KHONG mo index.html truc tiep bang file:// nhe.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-playtest.ps1"
if errorlevel 1 (
  echo.
  echo Khong khoi dong duoc playtest server.
  echo Vui long chup man hinh cua so nay va gui lai de debug.
  pause
)
endlocal
