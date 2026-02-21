@echo off
echo Starting CTN Application...
echo.

echo Starting Backend Server...
start "CTN Backend" cmd /k "cd backend && npm run start:dev"

timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "CTN Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window (servers will continue running)
pause > nul
