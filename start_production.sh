#!/usr/bin/env bash
set -e

echo "======================================================================"
echo "            HEALTHFLOW AI - 1-CLICK PRODUCTION LAUNCHER"
echo "======================================================================"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "[1/3] Setting up Python Environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r backend/requirements.txt
else
    source venv/bin/activate
fi

echo "[2/3] Building Production Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "[3/3] Launching Services..."
python backend/run.py &
cd frontend && npm run preview &

echo "======================================================================"
echo "HealthFlow AI is running!"
echo "  * Frontend UI: http://localhost:4173"
echo "  * Backend API: http://localhost:8000"
echo "  * API Docs:    http://localhost:8000/docs"
echo "======================================================================"
wait
