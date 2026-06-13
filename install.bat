@echo off
echo ================================================
echo   cyTrack - Quick Start
echo ================================================
echo.

REM Kill existing node processes
echo [1] Stopping existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Install client dependencies
echo [2] Installing client dependencies...
cd /d C:\Users\TGNE\Desktop\cytrack\client
call npm install --loglevel warn
if errorlevel 1 (
    echo Retrying with legacy-peer-deps...
    call npm install --legacy-peer-deps --loglevel warn
)

echo.
echo ================================================
echo   Installation complete!
echo.
echo   Now open TWO terminal windows:
echo.
echo   TERMINAL 1 (Backend):
echo     cd C:\Users\TGNE\Desktop\cytrack
echo     npm run dev
echo.
echo   TERMINAL 2 (Frontend):
echo     cd C:\Users\TGNE\Desktop\cytrack\client
echo     npm run dev
echo.
echo   Open browser: http://localhost:9041
echo ================================================
pause
