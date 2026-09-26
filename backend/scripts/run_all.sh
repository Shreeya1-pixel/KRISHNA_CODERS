#!/usr/bin/env bash
# SyRA — start the FastAPI decision engine (required for Demo ERP + demos).

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d .venv ]]; then
  echo "No .venv found. Create one and install deps:"
  echo "  cd backend && python3.11 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

export PYTHONPATH="${ROOT}${PYTHONPATH:+:$PYTHONPATH}"
if [[ -f "${ROOT}/../.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT}/../.env"
  set +a
fi
echo "Starting SyRA API on http://127.0.0.1:8001 (Swagger: /docs)"
echo "In another terminal: cd frontend/website && npm run dev  →  http://127.0.0.1:5174/erp-demo"
exec .venv/bin/python -m uvicorn syra_backend.main:app --host 127.0.0.1 --port 8001 --reload
