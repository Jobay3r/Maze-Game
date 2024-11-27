@echo off
cls
echo ===================================
echo NGROK SETUP AND GAME SERVER LAUNCHER
echo ===================================
echo.

echo Step 1: Installing ngrok if not already installed...
call npm install -g ngrok

echo.
echo Step 2: Ngrok Authentication Setup
echo -------------------------------
echo IMPORTANT: You need a free ngrok account and authtoken!
echo 1. Sign up at https://ngrok.com/signup
echo 2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
echo.
set /p authtoken="Please enter your ngrok authtoken: "
echo.
echo Configuring ngrok with your authtoken...
call ngrok config add-authtoken %authtoken%

echo.
echo Step 3: Starting Game Server
echo ------------------------
echo Starting Cooperative Maze Escape Server...
start cmd /k "node server.js"

echo.
echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo.
echo Step 4: Creating Online Tunnel
echo -------------------------
echo Creating tunnel for online play...
echo When the ngrok window appears, look for the "Forwarding" line
echo The URL will look like: https://something.ngrok.io
echo Share this URL with other players!
echo.
ngrok http 3000

pause
