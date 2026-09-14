@echo off
setlocal
cd /d "%~dp0"
title MeMeMe Draft D Full Map Review 0.1.53
echo.
echo ========================================
echo   MeMeMe DRAFT D FULL MAP REVIEW 0.1.53
echo ========================================
echo.
echo Dang mo TOAN BO map Draft D fit trong man hinh de review 3 nga re...
echo KHONG mo index.html truc tiep bang file:// nhe.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-playtest.ps1" -DraftDFullMap
if errorlevel 1 (
  echo.
  echo Khong khoi dong duoc Draft D Full Map Review.
  echo Vui long chup man hinh cua so nay va gui lai de debug.
  pause
)
endlocal
