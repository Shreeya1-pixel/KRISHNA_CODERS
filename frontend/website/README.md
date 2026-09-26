# SyRA website

Standalone demo dashboard at **http://localhost:5174** — connects to the FastAPI backend on port **8001**.

```bash
cd frontend/website
npm install
npm run dev
```

## What you get

1. Landing + three themes (code-switch, Swarm Guard, Glare Mode)
2. **Demo ERP** at `/erp-demo` — fake Accounting / CRM / HR forms gated by SyRA
3. Connect / Dashboard / Logs against the same API

## Requirements

- SyRA backend on `127.0.0.1:8001` (`uvicorn syra_backend.main:app`)

Vite proxies `/api/*` → backend to avoid CORS in dev.
