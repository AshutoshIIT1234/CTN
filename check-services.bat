@echo off
echo Checking CTN Application Services...
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js is installed
    node --version
) else (
    echo ✗ Node.js is NOT installed
    echo Please install Node.js from https://nodejs.org/
)
echo.

echo [2/4] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ npm is installed
    npm --version
) else (
    echo ✗ npm is NOT installed
)
echo.

echo [3/4] Checking if ports 3000 and 3001 are available...
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠ Port 3000 is already in use
) else (
    echo ✓ Port 3000 is available
)

netstat -ano | findstr ":3001" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠ Port 3001 is already in use
) else (
    echo ✓ Port 3001 is available
)
echo.

echo [4/4] Checking Redis (optional)...
redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Redis is running
) else (
    echo ⚠ Redis is not running (optional - app will work without it)
)
echo.

echo ========================================
echo Service Check Complete!
echo ========================================
echo.
echo To start the application, run: start-dev.bat
echo.
pause
