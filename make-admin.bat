@echo off
echo ========================================
echo Making avimishra8354@gmail.com an ADMIN
echo ========================================
echo.

cd backend
echo Running make-admin script...
echo.

call npm run make-admin

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo Next steps:
echo 1. Login at: http://localhost:3000/auth/login
echo    Email: avimishra8354@gmail.com
echo    Password: Avin@shm01
echo.
echo 2. Access admin panel: http://localhost:3000/admin
echo.
pause
