Write-Host "Setting COMSPEC environment variable..." -ForegroundColor Yellow
$env:COMSPEC = "C:\Windows\System32\cmd.exe"
Write-Host "COMSPEC set to: $env:COMSPEC" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Set-Location backend
npm run start:dev
