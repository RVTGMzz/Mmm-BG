@echo off
setlocal
cd /d "%~dp0"
title MeMeMe Draft D Preview 0.1.54
echo.
echo ========================================
echo   MeMeMe DRAFT D PREVIEW 0.1.54
echo ========================================
echo.
echo AUTO BRANCH mac dinh: game tu chon Re Trai / Re Phai theo seed co dinh.
echo Trong game co the bam NHANH: AUTO de doi sang THU CONG khi can test rieng.
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
