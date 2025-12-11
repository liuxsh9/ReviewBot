#!/bin/bash

# Start Backend
echo "Starting Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
# Run in background, redirect logs
nohup uvicorn app.main:app --host 0.0.0.0 --port 8101 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"
echo $BACKEND_PID > ../backend.pid
cd ..

# Start Frontend
echo "Starting Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
# Run in background, redirect logs
nohup npm run dev -- --port 3101 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"
echo $FRONTEND_PID > ../frontend.pid
cd ..

echo "ReviewBot started!"
echo "Backend: http://localhost:8101"
echo "Frontend: http://localhost:3101"
