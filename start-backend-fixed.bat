@echo off
echo Fixing COMSPEC environment variable...
set COMSPEC=C:\Windows\System32\cmd.exe
echo COMSPEC set to: %COMSPEC%
echo.
echo Starting Backend Server...
cd backend
npm run start:dev
