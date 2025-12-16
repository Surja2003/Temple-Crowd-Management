@echo off
echo ===================================
echo Temple Crowd Management System
echo ===================================
echo.
echo Starting Backend Server...
echo.

cd backend
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting FastAPI server on http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
start cmd /k "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3

cd ..\frontend
echo.
echo Starting Frontend Development Server...
echo.
start cmd /k "npm run dev"

echo.
echo ===================================
echo Both servers are starting!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ===================================
