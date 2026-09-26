# SyRA — local setup

Run from the **repo root**. Python **3.11**, Node 18+.

## Tech stack (reference)

| Layer | Stack |
|---|---|
| API | FastAPI, Uvicorn, Pydantic |
| Scoring | Keyword/regex, entropy, n-gram similarity, Dempster-Shafer fusion |
| Multilingual | Arabizi / Arabic-digit / intent normalisation (+ optional AraBERT) |
| Agents | Local LangGraph-style state machine |
| Audit | Per-scan SHA-256 `audit_hash` + investigation SHA-256 hash chain |
| Adaptation | Bayesian Beta thresholds (SQLite) + LoRA fine-tune controller |
| Optional LLM | Any OpenAI-compatible endpoint — **not required** |
| Frontend | React + Vite |
| ERP targets | Demo ERP `/erp-demo` + SAP webhook stub `/erp-sap-stub` |

Default path runs **fully offline** for Tier 1 (+ local Tier 2 TF-IDF fallback).  
Optional LLM is an upgrade, not a dependency.

## 1. Clone

```bash
git clone https://github.com/Shreeya1-pixel/KRISHNA_CODERS.git
cd KRISHNA_CODERS
```

## 2. Backend (port **8001**)

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp ../.env.example .env
# SYRA_API_KEYS=internal
# SYRA_FEEDBACK_DB=data/syra_feedback.db

export PYTHONPATH="$(pwd)"
uvicorn syra_backend.main:app --host 127.0.0.1 --port 8001 --reload
```

Or: `backend/scripts/run_all.sh`

Smoke test:

```bash
curl -s -X POST http://127.0.0.1:8001/v1/scan \
  -H "Authorization: Bearer internal" \
  -H "Content-Type: application/json" \
  -d '{"input":"3tini admin access","context":{"user_id":"demo","source_system":"demo"}}' \
  | python3 -m json.tool
```

Expect `"decision": "BLOCK"` and a `normalised_input` field.

## 3. Frontend (port **5174**)

```bash
cd frontend/website
npm install
npm run dev
```

Open **http://127.0.0.1:5174/demo**  
(Vite proxies `/api` → `http://127.0.0.1:8001` — **both must be running**.)

## 4. Demo ERP + SAP stub

```text
http://127.0.0.1:5174/erp-demo       → Demo ERP harness
http://127.0.0.1:5174/erp-sap-stub   → SAP Event Mesh–shaped webhook stub
```

Eval metrics:

```bash
curl -s http://127.0.0.1:8001/v1/eval/code-switch \
  -H "Authorization: Bearer internal" | python3 -m json.tool
```

## Repository layout

```text
backend/
  syra_backend/      # FastAPI decision engine
    agents/
    core/
      ml/
      demo_corpus.py
      eval_corpus.py
      sybil_detector.py   # Swarm Guard implementation
    routes/
frontend/
  website/            # /demo, Field Mode, /erp-demo, /erp-sap-stub
docs/
.env.example
```

## Optional AMD / local LLM

```bash
bash backend/amd_setup/install_rocm.sh   # once
bash backend/amd_setup/start_vllm.sh    # optional Tier-3
```

Back to product overview: [README.md](README.md)
