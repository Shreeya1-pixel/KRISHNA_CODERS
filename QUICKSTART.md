# SyRA — Demo Quickstart

Full local run instructions (clone, backend, frontend, eval, layout) live in
**[SETUP.md](SETUP.md)**. Product overview and themes: **[README.md](README.md)**.

**Live deployment:** https://syra-shield-1.onrender.com (may sleep / 502 — prefer localhost)

```bash
# Backend
cd backend && source .venv/bin/activate
export PYTHONPATH="$(pwd)"
uvicorn syra_backend.main:app --host 127.0.0.1 --port 8001 --reload

# Frontend (other terminal)
cd frontend/website && npm run dev
```

Open http://127.0.0.1:5174/demo · http://127.0.0.1:5174/erp-demo · http://127.0.0.1:5174/erp-sap-stub
