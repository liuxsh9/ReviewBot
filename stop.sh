#!/bin/bash

if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    echo "Stopping Backend (PID $BACKEND_PID)..."
    kill $BACKEND_PID
    rm backend.pid
else
    echo "Backend PID file not found."
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    echo "Stopping Frontend (PID $FRONTEND_PID)..."
    kill $FRONTEND_PID
    rm frontend.pid
else
    echo "Frontend PID file not found."
fi

echo "ReviewBot stopped."
