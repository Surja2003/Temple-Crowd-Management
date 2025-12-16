#!/bin/bash

echo "==================================="
echo "Temple Crowd Management System"
echo "==================================="
echo ""
echo "Starting Backend Server..."
echo ""

cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "Starting FastAPI server on http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

sleep 3

cd ../frontend
echo ""
echo "Starting Frontend Development Server..."
echo ""
npm run dev &

echo ""
echo "==================================="
echo "Both servers are starting!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "==================================="
