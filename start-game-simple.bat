@echo off
cls
echo ================================
echo MAZE GAME ONLINE SERVER LAUNCHER
echo ================================
echo.

echo Step 1: Installing required tools...
call npm install -g localtunnel

echo.
echo Step 2: Starting game server...
start cmd /k "node server.js"

echo.
echo Step 3: Waiting for server to start...
timeout /t 5 /nobreak > nul

echo.
echo Step 4: Creating online access...
echo -------------------------------
echo When the URL appears, share it with other players!
echo The URL will look like: https://xxxxxx.loca.lt
echo.
call lt --port 3000

pause
