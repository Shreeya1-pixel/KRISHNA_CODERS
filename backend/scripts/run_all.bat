@echo off
REM SyRA — start FastAPI on Windows (Demo ERP is in the React website).
cd /d "%~dp0..\backend"
if not exist ".venv\Scripts\python.exe" (
  echo Create venv: python -m venv .venv ^& .venv\Scripts\pip install -r requirements.txt
  exit /b 1
)
set PYTHONPATH=%~dp0..\backend
echo Starting http://127.0.0.1:8001
.venv\Scripts\python.exe -m uvicorn syra_backend.main:app --host 127.0.0.1 --port 8001 --reload
