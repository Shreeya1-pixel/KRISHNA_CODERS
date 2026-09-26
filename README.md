# SafeO

**Hero demo (judges start here):** Code-switch / spell-by-ear scan → `http://127.0.0.1:5174/demo`  
**API docs:** `http://127.0.0.1:8001/docs`  
**Repo:** https://github.com/Shreeya1-pixel/KRISHNA_CODERS

SafeO is a real-time **ALLOW / WARN / BLOCK** decision engine for enterprise inputs
(ERP forms, APIs, chat). It is built so security still works when:

1. **Language is messy** — code-switching, spelling by ear, script-borrowing (AI/ML)
2. **Actors are swarming** — cheap fake multiplicity vs real human stake (Sybil / Web3-shaped)
3. **Humans are outdoors** — compliance logging under glare, heat, exhaustion (Web)

Odoo is the **demo host**, not the product boundary. Anything that can `POST /v1/scan` is in scope.

---

## Three themes (this submission)

| # | Domain problem | What SafeO ships |
|---|---|---|
| **01** | Code-switching & spelling by ear | **Hero:** `/demo` + `GET /v1/demo/code-switch` — MultilingualAgent normalises Arabizi / Arabic digits / mixed script **before** Tier-1 patterns |
| **02** | Sybil resistance under agent swarms | Burst detector (`SYBIL_SUSPECT`), stake-gated Bayesian feedback (`role=analyst`), `agent_id` in SHA-256 audit hash |
| **03** | Built for a quiet room, used in the sun | **Glare Mode** toggle — extreme contrast, oversized targets, hold-to-confirm on BLOCK |

**Judge path (5 minutes):** start backend → open `/demo` → click Arabizi + Arabic-digit samples → toggle **Glare Mode** → optionally flood same payload with different `user_id`s to see `SYBIL_SUSPECT`.

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
| Sybil distinct-user threshold | **5** users / **30s** window (same payload fingerprint) |
| OpenAI API keys required | **0** |

---

## Tech stack

| Layer | Stack |
|---|---|
| API | FastAPI, Uvicorn, Pydantic |
| Scoring | Keyword/regex, entropy, n-gram similarity, Dempster-Shafer fusion |
| Multilingual | Custom Arabizi / digit / intent normalisation + optional AraBERT path |
| Agents | Local LangGraph-style state machine |
| Audit | **SHA-256** checkpoint / investigation hash chain |
| Adaptation | **Bayesian** Beta thresholds (SQLite) + **LoRA** fine-tune controller (bf16 / ROCm-ready) |
| Optional LLM | Fireworks AI on AMD Instinct (Gemma / Llama / DeepSeek) — **not required** |
| Frontend | React + Vite |
| ERP demo | Odoo module (`frontend/odoo_module/`) |

### No OpenAI keys

Default path runs **fully offline** for Tier 1 (+ local Tier 2 fallback).  
Set `SAFEO_API_KEYS=internal` and scan. Fireworks / vLLM are optional upgrades.

---

## What works / what does not (honest)

### Works locally (this is what judges should grade)

| Feature | Status |
|---|---|
| `POST /v1/scan` ALLOW/WARN/BLOCK | ✅ |
| Code-switch demo UI + corpus | ✅ **hero** |
| Arabizi / Arabic-digit / mixed-script normalisation | ✅ |
| Sybil burst flag + stake-gated `/v1/feedback` | ✅ |
| Glare Mode UI toggle | ✅ (no backend needed) |
| SHA-256 `audit_hash` on scans | ✅ |
| Jira escalation from Logs | ✅ when env vars set |
| Workflow Builder UI | ✅ UI persists locally |
| Visual evidence (Playwright) | ✅ when Chromium deps installed |

### Partial / needs config

| Feature | Reality |
|---|---|
| Fireworks / Gemma agent LLM | Needs `FIREWORKS_API_KEY` / agent LLM env — otherwise deterministic agents |
| Tier-2 DistilBERT GPU | Needs Torch + model weights; TF-IDF fallback used otherwise |
| LoRA training on AMD | Controller + bf16 config present; needs AMD GPU / ROCm to actually train |
| Odoo live inject | Needs Odoo running + module installed |
| Public Render deploy | Free-tier may sleep; Assistant/scan may 502 when cold — **prefer localhost** |

### Not claimed

- Not a full blockchain / token product (Sybil logic is **decision-plane** stake + attestation)
- AMD AI Developer Cloud credits were applied for but not approved in time; Fireworks AMD-hosted path is the active AMD link
- Perfect Arabic NLP — we ship **security-oriented normalisation**, not a general MT system

---

## Quick start (local)

**Requirements:** Python **3.11**, Node 18+, ~2 GB disk for venv.

### 1. Clone

```bash
git clone https://github.com/Shreeya1-pixel/KRISHNA_CODERS.git
cd KRISHNA_CODERS
```

### 2. Backend (port **8001**)

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp ../.env.example .env     # or backend/.env.example if present
# Minimum:
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

Expect `"decision": "BLOCK"` (or WARN) and a `normalised_input` field.

Corpus:

```bash
curl -s http://127.0.0.1:8001/v1/demo/code-switch \
  -H "Authorization: Bearer internal" | python3 -m json.tool
```

### 3. Frontend (port **5174**)

```bash
cd frontend/website
npm install
npm run dev
```

Open:

- Hero: http://127.0.0.1:5174/demo  
- Landing: http://127.0.0.1:5174/  
- Toggle **Glare Mode** in the header

Vite proxies `/api` → `http://127.0.0.1:8001`.

---

## Repository layout

```text
backend/
  safeo_backend/
    agents/          # 5-agent graph, multilingual, forensics, …
    core/
      ml/            # risk_scorer, bayesian, LoRA, securec_language
      demo_corpus.py # code-switch samples
      sybil_detector.py
    routes/          # /v1/scan, feedback, logs, visual, …
    utils/           # writable feedback DB path
  requirements.txt
frontend/
  website/           # React judge UI (/demo, Glare, chat, visual, workflow)
  odoo_module/       # Odoo ERP demo integration
docs/                # optional deep dives
.env.example         # keys — never commit real secrets
```

---

## Multilingual / code-switch (Theme 01)

Before pattern matching, SafeO normalises:

```text
3tini admin access     → phonetic “give me” + privilege patterns → BLOCK
١=١ UNION SELECT       → Arabic digits → ASCII → SQLi → BLOCK
إسقاط جدول users       → Arabic “drop” gloss + table → BLOCK
https://ọpen-ạccess…   → IDN / script-borrow → BLOCK
شكرا على المساعدة…     → clean Arabic business text → ALLOW
```

Implementation: `core/ml/securec_language.py` + `agents/multilingual_agent.py` + keyword categories `erp_privilege_abuse` / `code_switch_injection`.

---

## Sybil / stake (Theme 02)

- Same payload fingerprint from ≥5 distinct `user_id`s in 30s → `sybil_suspect: true` and score pressure
- `POST /v1/feedback` with `role=anonymous` → **quarantined** (stored, Bayesian **not** updated)
- `role=analyst` (or reviewer `analyst:…`) → Bayesian priors update
- Scan `audit_hash` includes `agent_id` so forged swarm steps without identity are detectable in the chain story

This is **Sybil resistance for the security plane**, not a crypto wallet.

---

## Field / Glare Mode (Theme 03)

Header toggle → `html[data-glare=on]`: black/yellow extreme contrast, large touch targets, hold-to-confirm on BLOCK in `/demo`. Designed for outdoor / warehouse logging — not a SOC dark theme.

---

## Core API

| Method | Path | Purpose |
|---|---|---|
| POST | `/v1/scan` | Score one input |
| GET | `/v1/demo/code-switch` | Hero corpus |
| GET | `/v1/sybil/stats` | Swarm detector stats |
| POST | `/v1/feedback` | Stake-gated human feedback |
| GET | `/v1/health` | Health + sybil stats |
| GET | `/investigations/audit-chain` | SHA-256 chain check |

Auth: `Authorization: Bearer <key>` where key ∈ `SAFEO_API_KEYS` (default demo: `internal`).

---

## AMD note

Optional agent LLM calls route through **Fireworks AI** (AMD Instinct fleet). Codebase is **ROCm / bf16 LoRA ready**. AMD Cloud credit approval did not arrive before submission; Fireworks is the active AMD-hosted path.

---

## One-line pitch

SafeO blocks malicious enterprise input when language is messy, actors are swarming, and the human logging the decision is standing in the sun.
