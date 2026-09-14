@echo off
setlocal
cd /d "%~dp0"
title MeMeMe Final Map Preview 0.1.50
echo.
echo ========================================
echo   MeMeMe FINAL MAP PREVIEW 0.1.50
echo ========================================
echo.
echo Dang mo ban test map 44 o + Jail/Hospital + Lottery...
echo KHONG mo index.html truc tiep bang file:// nhe.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-playtest.ps1" -FinalMapPreview
if errorlevel 1 (
  echo.
  echo Khong khoi dong duoc Final Map Preview.
  echo Vui long chup man hinh cua so nay va gui lai de debug.
  pause
)
endlocal
