@echo off
echo Installing localtunnel if not already installed...
call npm install -g localtunnel

echo.
echo Starting Cooperative Maze Escape Server...
start cmd /k "node server.js"

echo.
echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo.
echo Creating tunnel for online play...
echo Other players will be able to join using the URL that will be displayed...
echo The URL will look like: https://something.loca.lt
echo.
call lt --port 3000 --local-host 127.0.0.1

pause
