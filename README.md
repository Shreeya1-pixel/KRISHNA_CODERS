# SyRA

**Hero demo:** http://127.0.0.1:5174/demo  
**API docs:** http://127.0.0.1:8001/docs  
**Repo:** https://github.com/Shreeya1-pixel/KRISHNA_CODERS

SyRA is a real-time **ALLOW / WARN / BLOCK** decision engine for enterprise inputs
(ERP forms, APIs, chat). It is built so security still works when:

1. **Language is messy** — code-switching, spelling by ear, script-borrowing (AI/ML)
2. **Actors are swarming** — cheap fake multiplicity vs real human stake (Sybil / Web3-shaped)
3. **Humans are outdoors** — compliance logging under glare, heat, exhaustion (Web)

---

## Works with any ERP (or any HTTP client)

SyRA is **platform-agnostic**. It exposes a universal REST API — any system that can
call `POST /v1/scan` can be protected:

| Platform | Integration |
|---|---|
| **Any ERP** (SAP, Oracle, Microsoft Dynamics, NetSuite, …) | Hook before form/save → `POST /v1/scan` |
| Custom internal tools | Direct API call |
| REST APIs / gateways | Middleware |
| WhatsApp / Telegram bots | Message pre-processing |
| Web forms | Backend validation layer |

**For this demo we built Demo ERP** — an in-app testing ERP at `/erp-demo` that
calls SyRA before any “save”. No third-party ERP install. Point the same API at
SAP, Oracle, or your own stack with one API key.

---

## Three themes (this submission)

| # | Domain problem | What SyRA ships |
|---|---|---|
| **01** | Code-switching & spelling by ear | **Hero:** `/demo` + `GET /v1/demo/code-switch` — MultilingualAgent normalises Arabizi / Arabic digits / mixed script **before** Tier-1 patterns |
| **02** | Sybil resistance under agent swarms | **Swarm Guard** — burst detector (`SYBIL_SUSPECT`), stake-gated Bayesian feedback (`role=analyst`), `agent_id` in SHA-256 audit hash |
| **03** | Built for a quiet room, used in the sun | **Glare Mode** toggle — extreme contrast, oversized targets, hold-to-confirm on BLOCK |

**Judge path (5 minutes):** start backend + frontend → open `/demo` → click Arabizi + Arabic-digit samples → toggle **Glare Mode**.

---

## Numbers

| Metric | Value |
|---|---|
| Specialist agents | **5** (Multilingual, Policy, Forensics, Verifier, Remediation) |
| ML scoring tiers | **3** (heuristics → DistilBERT/TF-IDF → optional LLM) |
| Decisions | **ALLOW / WARN / BLOCK** |
| Attack-pattern graph nodes | **15** |
| Remediation playbooks | **12** |
| Bayesian attack classes | **6** (incl. `arabizi`, `arabic_injection`) |
| Adaptive threshold floor / ceiling | **0.45 / 0.90** |
| Code-switch demo samples | **12** |
| Sybil distinct-user threshold | **5** users / **30s** window |
| OpenAI API keys required | **0** |

---

## Tech stack

| Layer | Stack |
|---|---|
| API | FastAPI, Uvicorn, Pydantic |
| Scoring | Keyword/regex, entropy, n-gram similarity, Dempster-Shafer fusion |
| Multilingual | Arabizi / Arabic-digit / intent normalisation (+ optional AraBERT) |
| Agents | Local LangGraph-style state machine |
| Audit | **SHA-256** checkpoint / investigation hash chain |
| Adaptation | **Bayesian** Beta thresholds (SQLite) + **LoRA** fine-tune controller |
| Optional LLM | Any OpenAI-compatible endpoint (vLLM / cloud) — **not required** |
| Frontend | React + Vite |
| ERP demo host | **Demo ERP** in-app testing UI (`/erp-demo`) |

### No OpenAI keys required

Default path runs **fully offline** for Tier 1 (+ local Tier 2 TF-IDF fallback).  
Set `SAFEO_API_KEYS=internal` and scan. Optional LLM is an upgrade, not a dependency.

---

## What works / what does not (honest)

### Works locally (grade this)

| Feature | Status |
|---|---|
| `POST /v1/scan` ALLOW/WARN/BLOCK | ✅ |
| Code-switch demo UI + corpus (`/demo`) | ✅ **hero** |
| Arabizi / Arabic-digit / mixed-script normalisation | ✅ |
| Sybil burst flag + stake-gated `/v1/feedback` | ✅ |
| Glare Mode UI toggle | ✅ |
| SHA-256 `audit_hash` on scans | ✅ |
| Jira escalation from Logs | ✅ when env vars set |
| Workflow Builder UI | ✅ local persistence |
| Visual evidence (Playwright) | ✅ when Chromium deps installed |
| Demo ERP testing environment | ✅ at `/erp-demo` when SyRA API is up |

### Partial / needs config

| Feature | Reality |
|---|---|
| Optional agent LLM | Needs an OpenAI-compatible URL + key; otherwise deterministic agents |
| Tier-2 DistilBERT | Needs Torch + weights; TF-IDF fallback otherwise |
| LoRA training run | Controller present; needs a GPU host to actually train |
| Production ERP inject | Wire any ERP to `POST /v1/scan` |
| Public free-tier deploy | May sleep / 502 — **prefer localhost for judging** |

### Not claimed

- Not a full blockchain / token product (Sybil logic is decision-plane stake + attestation)
- Not a general machine-translation system — security-oriented normalisation only

---

## Quick start (local)

**Requirements:** Python **3.11**, Node 18+.

### 1. Clone

```bash
git clone https://github.com/Shreeya1-pixel/KRISHNA_CODERS.git
cd KRISHNA_CODERS
```

### 2. Backend (port **8001**) — required for `/demo` scans

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp ../.env.example .env
# SAFEO_API_KEYS=internal
# SAFEO_FEEDBACK_DB=data/safeo_feedback.db

export PYTHONPATH="$(pwd)"
uvicorn safeo_backend.main:app --host 127.0.0.1 --port 8001 --reload
```

Smoke test:

```bash
curl -s -X POST http://127.0.0.1:8001/v1/scan \
  -H "Authorization: Bearer internal" \
  -H "Content-Type: application/json" \
  -d '{"input":"3tini admin access","context":{"user_id":"judge","source_system":"demo"}}' \
  | python3 -m json.tool
```

Expect `"decision": "BLOCK"` and a `normalised_input` field.

### 3. Frontend (port **5174**)

```bash
cd frontend/website
npm install
npm run dev
```

Open **http://127.0.0.1:5174/demo**  
(Vite proxies `/api` → `http://127.0.0.1:8001` — **both must be running**.)

### 4. Demo ERP (testing environment)

With backend + frontend running, open **http://127.0.0.1:5174/erp-demo**
or **Connect → Open Demo ERP**. Accounting / CRM / HR forms call SyRA before save.

---

## Repository layout

```text
backend/
  safeo_backend/      # API package path (unchanged); product name is SyRA
    agents/
    core/
      ml/
      demo_corpus.py
      sybil_detector.py
    routes/
frontend/
  website/            # SyRA React UI (/demo, Glare, chat, visual, workflow)
  # Demo ERP lives in website at /erp-demo (no external ERP)
docs/
.env.example
```

---

## Multilingual / code-switch (Theme 01)

```text
3tini admin access     → phonetic “give me” + privilege → BLOCK
١=١ UNION SELECT       → Arabic digits → ASCII SQLi → BLOCK
إسقاط جدول users       → Arabic “drop” + table → BLOCK
https://ọpen-ạccess…   → IDN / script-borrow → BLOCK
شكرا على المساعدة…     → clean Arabic business text → ALLOW
```

---

## Swarm Guard — Sybil resistance (Theme 02)

**Name:** A **Sybil attack** means one actor pretending to be many. SyRA’s product
name for the countermeasure is **Swarm Guard**; the API flag stays `SYBIL_SUSPECT`.

- Same payload from ≥5 distinct `user_id`s in 30s → `sybil_suspect: true`
- Anonymous feedback is quarantined; `role=analyst` updates Bayesian priors
- `audit_hash` includes `agent_id`

---

## Field / Glare Mode (Theme 03)

Header **Glare** toggle → extreme contrast, large targets, hold-to-confirm on BLOCK.

---

## Core API

| Method | Path | Purpose |
|---|---|---|
| POST | `/v1/scan` | Score one input |
| GET | `/v1/demo/code-switch` | Hero corpus |
| GET | `/v1/sybil/stats` | Swarm Guard / Sybil detector stats |
| POST | `/v1/feedback` | Stake-gated human feedback |
| GET | `/v1/health` | Health |

Auth: `Authorization: Bearer internal` (or any key in `SAFEO_API_KEYS`).

---

## One-line pitch

SyRA blocks malicious enterprise input when language is messy, actors are swarming, and the human logging the decision is standing in the sun — and it plugs into **any ERP**; this build ships **Demo ERP** for testing.
