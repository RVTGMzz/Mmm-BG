@echo off
setlocal
cd /d "%~dp0"
title MeMeMe Draft D Preview 0.1.53
echo.
echo ========================================
echo   MeMeMe DRAFT D PREVIEW 0.1.53
echo ========================================
echo.
echo Dang mo ban test map re trai/phai + camera gan + UI co dinh...
echo KHONG mo index.html truc tiep bang file:// nhe.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-playtest.ps1" -DraftDPreview
if errorlevel 1 (
  echo.
  echo Khong khoi dong duoc Draft D Preview.
  echo Vui long chup man hinh cua so nay va gui lai de debug.
  pause
)
endlocal
