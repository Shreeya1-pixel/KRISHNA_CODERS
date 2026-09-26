# Frontend — Demo UI

Vite + React app on port **5174**, talking to FastAPI on **8001**.

## Structure

```
frontend/
└── website/                  # Vite + React (:5174)
    ├── src/pages/
    │   ├── Landing.jsx       # Hero + themes
    │   ├── DemoERP.jsx       # In-app Demo ERP (/erp-demo)
    │   ├── CodeSwitchDemo.jsx
    │   ├── Dashboard.jsx
    │   └── Connect.jsx
    └── vite.config.js
```

## Run

```bash
cd frontend/website
npm install && npm run dev
```

Open http://localhost:5174

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/demo` | Code-switch hero |
| `/erp-demo` | Demo ERP (Accounting / CRM / HR) |
| `/connect` | System connectors |
| `/dashboard` | Live decisions |

## API URL

Frontend uses `VITE_API_URL` (default `http://127.0.0.1:8001`).  
Vite proxies `/api/*` → backend in dev.
