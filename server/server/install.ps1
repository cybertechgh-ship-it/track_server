# Vehicle Dashboard - Dependency Installer
# Run this from PowerShell: .\install.ps1

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vehicle Dashboard - Dependency Setup  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ---- Kill any running node/vite processes ----
Write-Host "`n[1/6] Killing any running Node/Vite processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "Done." -ForegroundColor Green

# ---- Clean client node_modules and cache ----
Write-Host "`n[2/6] Cleaning client node_modules and cache..." -ForegroundColor Yellow
$clientPath = "C:\Users\TGNE\Desktop\dasboard\client"

if (Test-Path "$clientPath\node_modules") {
    Remove-Item -Recurse -Force "$clientPath\node_modules" -ErrorAction SilentlyContinue
}
if (Test-Path "$clientPath\.vite") {
    Remove-Item -Recurse -Force "$clientPath\.vite" -ErrorAction SilentlyContinue
}
if (Test-Path "$clientPath\node_modules\.cache") {
    Remove-Item -Recurse -Force "$clientPath\node_modules\.cache" -ErrorAction SilentlyContinue
}

# Clear npm cache
npm cache clean --force 2>$null
Write-Host "Done." -ForegroundColor Green

# ---- Install client dependencies ----
Write-Host "`n[3/6] Installing CLIENT dependencies (this may take 3-5 minutes)..." -ForegroundColor Yellow
Set-Location $clientPath

$env:npm_config_fetch_timeout = "300000"
$env:npm_config_fetch_retry_mintimeout = "20000"
$env:npm_config_fetch_retry_maxtimeout = "120000"

npm install --prefer-offline --no-audit --no-fund --loglevel warn

if ($LASTEXITCODE -ne 0) {
    Write-Host "First attempt failed. Trying with legacy peer deps..." -ForegroundColor Yellow
    npm install --legacy-peer-deps --prefer-offline --no-audit --no-fund --loglevel warn
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Client npm install failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Client dependencies installed!" -ForegroundColor Green

# ---- Clean server node_modules ----
Write-Host "`n[4/6] Setting up SERVER dependencies..." -ForegroundColor Yellow
$serverPath = "C:\Users\TGNE\Desktop\dasboard\server"
Set-Location $serverPath

if (-not (Test-Path "$serverPath\node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    npm install --prefer-offline --no-audit --no-fund --loglevel warn
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Server npm install had issues (may still work)" -ForegroundColor Yellow
    } else {
        Write-Host "Server dependencies installed!" -ForegroundColor Green
    }
} else {
    Write-Host "Server node_modules already exists, skipping." -ForegroundColor Green
}

# ---- Verify client ----
Write-Host "`n[5/6] Verifying installation..." -ForegroundColor Yellow
$clientModules = "$clientPath\node_modules"
if (Test-Path "$clientModules\vite") {
    Write-Host "  [OK] vite" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] vite" -ForegroundColor Red
}
if (Test-Path "$clientModules\react") {
    Write-Host "  [OK] react" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] react" -ForegroundColor Red
}
if (Test-Path "$clientModules\recharts") {
    Write-Host "  [OK] recharts" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] recharts" -ForegroundColor Red
}
if (Test-Path "$clientModules\@mui") {
    Write-Host "  [OK] @mui" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] @mui" -ForegroundColor Red
}
if (Test-Path "$clientModules\axios") {
    Write-Host "  [OK] axios" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] axios" -ForegroundColor Red
}
if (Test-Path "$clientModules\leaflet") {
    Write-Host "  [OK] leaflet" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] leaflet" -ForegroundColor Red
}

# ---- Done ----
Write-Host "`n[6/6] Setup complete!" -ForegroundColor Cyan
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  HOW TO START THE APP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Terminal 1 - Start Backend:" -ForegroundColor White
Write-Host "    cd C:\Users\TGNE\Desktop\dasboard\server" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Terminal 2 - Start Frontend:" -ForegroundColor White
Write-Host "    cd C:\Users\TGNE\Desktop\dasboard\client" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Then open: http://localhost:9041" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
