# SyRA — Architecture

## System diagram

```
┌─────────────────────────────────────────────────────────────┐
│  React website (http://127.0.0.1:5174)                        │
│  • Landing / Demo / Connect / Dashboard                      │
│  • Demo ERP (/erp-demo) → POST /v1/scan or /erp/*            │
│  • Code-switch hero → GET /v1/demo/code-switch               │
└────────────────────────────┬────────────────────────────────┘
                             │  HTTP  (default http://127.0.0.1:8001)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  FastAPI — syra_backend (backend/syra_backend)               │
│  routes/erp.py     — transaction, HR, CRM, finance, summary  │
│  routes/universal.py — /v1/scan, demos                       │
│  routes/waf.py     — legacy /waf/input + shared request log  │
│  core/ml/*         — risk_scorer, entropy, keywords, n-gram  │
│  core/sybil_detector.py — Swarm Guard / SYBIL_SUSPECT        │
│  agents/*          — LangGraph investigation graph           │
└─────────────────────────────────────────────────────────────┘
```

## Backend layout (logical)

| Package / folder | Role |
|------------------|------|
| `routes/` | FastAPI routers (HTTP surface) |
| `core/ml/` | Risk engine: fusion scoring, patterns, optional LLM gate |
| `core/sybil_detector.py` | Multi-actor Swarm Guard |
| `agents/` | Investigation graph (multilingual → policy/forensics → verifier → remediation) |
| `models/` | Pydantic request/response schemas |
| `utils/` | Feedback DB and helpers |

## Data flow (Demo ERP)

1. User submits a form in Demo ERP (`/erp-demo`).
2. Frontend POSTs text to FastAPI `/v1/scan` (or `/erp/*`).
3. Engine returns ALLOW / WARN / BLOCK + score (+ Sybil flags when relevant).
4. Demo ERP shows the decision inline; blocked rows are not “persisted.”
