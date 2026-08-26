@echo off
echo ======================================================================
echo             HEALTHFLOW AI - 1-CLICK PRODUCTION LAUNCHER
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Verifying Python and Virtual Environment...
if not exist "venv\Scripts\python.exe" (
    echo Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r backend\requirements.txt
) else (
    call venv\Scripts\activate
)

echo.
echo [2/3] Building Production Frontend Assets...
cd frontend
call npm run build
cd ..

echo.
echo [3/3] Launching HealthFlow AI Backend and Frontend Services...
start "HealthFlow Backend API" cmd /k "cd backend && python run.py"
start "HealthFlow Frontend Service" cmd /k "cd frontend && npm run preview"

echo.
echo ======================================================================
echo HealthFlow AI is starting up!
echo   * Web Application: http://localhost:4173 (or http://localhost:5173 in dev)
echo   * Backend API:     http://localhost:8000
echo   * API Docs:        http://localhost:8000/docs
echo ======================================================================
echo.
pause
