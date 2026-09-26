# SyRA — Demo Quickstart

**Live deployment:** https://syra-shield-1.onrender.com

Run from the **repo root**. Main folders: `backend/` · `frontend/`

---

## Section 1 — AMD GPU setup (optional, run once)

```bash
bash backend/amd_setup/install_rocm.sh
python backend/amd_setup/check_gpu.py
```

---

## Section 2 — Start local LLM on AMD GPU (optional)

```bash
bash backend/amd_setup/start_vllm.sh
```

Wait until: `Uvicorn running on http://0.0.0.0:8000`

---

## Hero demo (after backend + frontend are up)

- UI: http://127.0.0.1:5174/demo
- API: `GET /v1/demo/code-switch` then `POST /v1/scan` (Bearer `internal`)
- Backend port **8001**, frontend port **5174**

## Section 3 — Start FastAPI backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env          # API keys, optional Fireworks/vLLM settings
export PYTHONPATH="$(pwd)"
uvicorn syra_backend.main:app --host 127.0.0.1 --port 8001 --reload
```

Or: `backend/scripts/run_all.sh`

---

## Section 4 — Demo ERP + website

```bash
cd frontend/website && npm install && npm run dev
```

Open:

| URL | Purpose |
|-----|---------|
| http://localhost:5174 | Landing |
| http://localhost:5174/demo | Code-switch hero |
| http://localhost:5174/erp-demo | Demo ERP (Accounting / CRM / HR) |
| http://localhost:5174/connect | Connectors |

Demo ERP talks to SyRA on port **8001** (`source_system: demo_erp`).

---

## Section 5 — Local agent graph

SyRA uses an in-process LangGraph-style investigation graph:

```
Multilingual -> Policy + Forensics in parallel -> Verifier -> Remediation
```

No external Band setup is required. Optional Fireworks agent calls can be enabled
with `SYRA_ENABLE_AGENT_LLM=true` and `SYRA_AGENT_LLM_API_KEY`.

---

## Smoke tests

```bash
curl -s -X POST http://127.0.0.1:8001/v1/scan \
  -H "Authorization: Bearer internal" \
  -H "Content-Type: application/json" \
  -d '{"input": "1 OR 1=1; DROP TABLE users;--", "context": {"user_id": "demo"}}' \
  | python3 -m json.tool
```

Expected: `"decision": "BLOCK"`, non-empty `scan_id`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Demo ERP disabled | Start SyRA API on port 8001 |
| `401` on `/v1/*` | `Authorization: Bearer internal` |
| Agent logs missing | Check `/ws/investigation/{scan_id}` and investigation detail endpoint |
| Dashboard offline | Confirm `VITE_API_URL` / backend health |
