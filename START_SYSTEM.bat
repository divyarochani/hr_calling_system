@echo off
echo ============================================================
echo AIRA SYSTEM STARTUP
echo ============================================================
echo.
echo This will start both Backend and Frontend
echo.
echo Prerequisites:
echo - Python installed
echo - Node.js installed
echo - MongoDB running
echo.
pause

echo.
echo Starting Backend...
start "AIRA Backend" cmd /k "cd AIRA_BACKEND_NEW && python run.py"

timeout /t 5

echo.
echo Starting Frontend...
start "AIRA Frontend" cmd /k "cd AIRA_FRONTEND && npm start"

echo.
echo ============================================================
echo SYSTEM STARTED!
echo ============================================================
echo.
echo Backend: http://localhost:8001
echo Frontend: http://localhost:3000
echo.
echo Check the opened terminal windows for logs
echo.
pause
