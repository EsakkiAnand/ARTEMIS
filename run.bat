@echo off
echo ==========================================
echo Starting ARTEMIS Attack Simulator...
echo ==========================================

REM Start the backend in a new command window
echo Starting Flask Backend...
start cmd /k "cd /d %~dp0backend && ..\venv\Scripts\python.exe app.py"

REM Start the frontend in a new command window
echo Starting React Frontend...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo ==========================================
echo Services are starting up!
echo Backend should be available at http://localhost:5000
echo Frontend should be available at http://localhost:5173
echo ==========================================
pause
