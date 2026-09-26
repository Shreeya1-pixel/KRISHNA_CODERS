# SyRA

**Hero demo (prefer localhost):** http://127.0.0.1:5174/demo  
**API docs:** http://127.0.0.1:8001/docs  
**Repo:** https://github.com/Shreeya1-pixel/KRISHNA_CODERS

SyRA is a real-time **ALLOW / WARN / BLOCK** decision engine for enterprise inputs
(ERP forms, APIs, chat). It is built so security still works when:

1. **Language is messy** — code-switching, spelling by ear, script-borrowing (AI/ML)
2. **Actors are swarming** — cheap fake multiplicity on the decision plane (Sybil-shaped / Web3 threat model)
3. **Humans are outdoors** — logging under glare, heat, and exhaustion (Web / field UI)

---

## Live pitch — lead with these two (judges notice)

1. **Sybil without a blockchain** — Theme 2 is decision-plane Sybil resistance:
   burst fingerprint + `role=analyst` RBAC, not Proof-of-Stake. The table under
   [Swarm Guard](#swarm-guard--sybil-resistance-theme-02) preempts the knock-down question.
2. **`audit_hash` vs investigation chain** — per-scan fingerprint is **not** chained;
   WARN/BLOCK investigations use a `prev_hash` chain. See [Audit hashing](#audit-hashing--two-different-things-do-not-conflate).

---

## Works with any HTTP ERP shape (proven locally)

SyRA is **platform-agnostic**. Anything that can `POST /v1/scan` (or our adapters) can be protected.

| Target | What we ship | Status |
|---|---|---|
| **Demo ERP** | In-app testing UI `/erp-demo` → `/v1/scan` | ✅ live-tested harness |
| **SAP webhook stub** | `/erp-sap-stub` → `POST /v1/adapters/sap/webhook` (Event Mesh–shaped) | ✅ **second live ERP target** |
| Production SAP / Oracle / Dynamics | Same HTTP pattern via middleware | Aspirational — not a certified connector |

**Pitch discipline:** Demo ERP + SAP stub prove *two HTTP shapes*. Do not imply a
certified SAP product or a production ERP inject beyond those stubs.

---

## Three themes (this submission)

| # | Domain problem | What SyRA ships |
|---|---|---|
| **01** | Code-switching & spelling by ear | **Hero:** `/demo` + `GET /v1/demo/code-switch` — MultilingualAgent normalises Arabizi / Arabic digits / mixed script **before** Tier-1 patterns |
| **02** | Sybil resistance under agent swarms | **Swarm Guard** — burst detector (`SYBIL_SUSPECT`: ≥5 distinct `user_id`s / 30s), `role=analyst` gating on `/v1/feedback`, `agent_id` in per-scan `audit_hash` |
| **03** | Built for a quiet room, used in the sun | **Field Mode** (UI toggle) — glare contrast + heat (no motion / large targets) + exhaustion (hold-to-confirm on BLOCK) |

**Judge path (5 minutes):** backend + frontend → `/demo` (Arabizi + Arabic digits) → **Field Mode** → `/erp-sap-stub` (second ERP).  
If a public deploy **502s**, use localhost (or a short recorded fallback clip of `/demo`).

---

## Numbers

### Product surface

| Metric | Value |
|---|---|
| Specialist agents | **5** (Multilingual, Policy, Forensics, Verifier, Remediation) |
| ML scoring tiers | **3** (heuristics → DistilBERT/TF-IDF → optional LLM) |
| Decisions | **ALLOW / WARN / BLOCK** |
| Attack-pattern graph nodes | **15** |
| Remediation playbooks | **12** |
| Bayesian attack classes | **6** (incl. `arabizi`, `arabic_injection`) |
| Adaptive threshold floor / ceiling | **0.45 / 0.90** |
| Hero click-path samples | **12** |
| Extended labeled eval set | **30** (hero + extended; `GET /v1/eval/code-switch`) |
| Sybil distinct-user threshold | **5** users / **30s** window |
| Live ERP HTTP shapes | **2** (Demo ERP + SAP webhook stub) |
| OpenAI API keys required | **0** |

### Theme 01 eval — *not* a production benchmark

Re-run: `GET /v1/eval/code-switch` (Bearer `internal`) against the live engine.

| Set | n | Exact match | Precision | Recall | FPR |
|---|---|---|---|---|---|
| Hero click-path only | **12** | **10/12 (83.3%)** | **1.00** | **0.90** | **0.00** |
| Extended labeled set | **30** | **23/30 (76.7%)** | **1.00** | **0.78** | **0.00** |

Attack detection treats non-ALLOW as the positive class. Extended-set misses include hard
homographs and some Arabizi edge strings (documented in the eval `misses` array) — we keep
them rather than cherry-picking the set.

**Live strings beyond the 12 buttons** (also in the n=30 set):

```text
edini db dump 3shan audit          → may miss (Arabizi edge) — show honesty
حذف كل السجلات WHERE id > 0        → Arabic destructive + SQL → usually BLOCK
1; DROP TABLE vendors;--           → classic SQLi → BLOCK
Meeting notes: ship Q3 forecast    → should stay ALLOW
```

---

## Tech stack

| Layer | Stack |
|---|---|
| API | FastAPI, Uvicorn, Pydantic |
| Scoring | Keyword/regex, entropy, n-gram similarity, Dempster-Shafer fusion |
| Multilingual | Arabizi / Arabic-digit / intent normalisation (+ optional AraBERT) |
| Agents | Local LangGraph-style state machine |
| Audit | **Per-scan** SHA-256 `audit_hash` + **separate** investigation SHA-256 hash **chain** |
| Adaptation | **Bayesian** Beta thresholds (SQLite) + **LoRA** fine-tune controller |
| Optional LLM | Any OpenAI-compatible endpoint (vLLM / cloud) — **not required** |
| Frontend | React + Vite |
| ERP targets | **Demo ERP** `/erp-demo` + **SAP webhook stub** `/erp-sap-stub` |

### No OpenAI keys required

Default path runs **fully offline** for Tier 1 (+ local Tier 2 TF-IDF fallback).  
Set `SYRA_API_KEYS=internal` and scan. Optional LLM is an upgrade, not a dependency.

---

## What works / what does not (honest)

### Works locally (grade this)

| Feature | Status |
|---|---|
| `POST /v1/scan` ALLOW/WARN/BLOCK | ✅ |
| Code-switch demo UI + corpus (`/demo`) | ✅ **hero** |
| Arabizi / Arabic-digit / mixed-script normalisation | ✅ |
| Sybil burst flag + analyst-gated `/v1/feedback` | ✅ |
| Field / Glare Mode UI toggle | ✅ |
| Per-scan SHA-256 `audit_hash` | ✅ |
| Investigation SHA-256 hash **chain** (`prev_hash`) | ✅ on WARN/BLOCK investigations |
| Jira escalation from Logs | ✅ when env vars set |
| Workflow Builder UI | ✅ local persistence |
| Visual evidence (Playwright) | ✅ when Chromium deps installed |
| Demo ERP testing environment | ✅ `/erp-demo` when SyRA API is up |
| SAP webhook stub (2nd ERP shape) | ✅ `/erp-sap-stub` → `/v1/adapters/sap/webhook` |
| Extended Theme-01 eval API | ✅ `GET /v1/eval/code-switch` (`n=30`) |

### Partial / needs config

| Feature | Reality |
|---|---|
| Optional agent LLM | Needs an OpenAI-compatible URL + key; otherwise deterministic agents |
| Tier-2 DistilBERT | Needs Torch + weights; TF-IDF fallback otherwise |
| LoRA training run | Controller present; needs a GPU host to actually train |
| Certified SAP / Oracle / Dynamics inject | **Not shipped** — only Demo ERP + SAP-shaped webhook stub |
| Public free-tier deploy | May sleep / **502** — **prefer localhost**; keep a short `/demo` screen recording as fallback |

### Not claimed

- Not a blockchain / token / stake-on-chain product
- Not a general machine-translation system — security-oriented normalisation only
- Demo ERP ≠ production SAP/Oracle/Dynamics connector
- SAP webhook stub ≠ certified SAP product

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
# SYRA_API_KEYS=internal
# SYRA_FEEDBACK_DB=data/syra_feedback.db

export PYTHONPATH="$(pwd)"
uvicorn syra_backend.main:app --host 127.0.0.1 --port 8001 --reload
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

### 4. Demo ERP + SAP stub (two live HTTP shapes)

```text
http://127.0.0.1:5174/erp-demo       → Demo ERP harness
http://127.0.0.1:5174/erp-sap-stub   → SAP Event Mesh–shaped webhook stub
```

Or from **Connect**. Both call SyRA before “persist”.

Eval metrics:

```bash
curl -s http://127.0.0.1:8001/v1/eval/code-switch \
  -H "Authorization: Bearer internal" | python3 -m json.tool
```

---

## Repository layout

```text
backend/
  syra_backend/      # FastAPI decision engine package
    agents/
    core/
      ml/
      demo_corpus.py
      sybil_detector.py
    routes/
frontend/
  website/            # SyRA React UI (/demo, Field Mode, chat, visual, workflow)
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

The **12** one-click samples are the full demonstrated Theme-1 corpus. Keep the
off-corpus lines above ready for live typing.

---

## Swarm Guard — Sybil resistance (Theme 02)

**Why call it Sybil (without a blockchain)?**  
A Sybil attack is **one actor pretending to be many**. Blockchain stake is one way
to raise the cost of multiplicity; it is not the only way. SyRA applies the same
*threat model* to the **security decision plane**:

| Mechanism | What it actually is | What it is not |
|---|---|---|
| Burst fingerprint (`SYBIL_SUSPECT`) | Same payload from ≥5 distinct `user_id`s in 30s → flag + slight risk bump | Not Proof-of-Stake / token economics |
| Analyst-gated feedback | Only `role=analyst` updates Bayesian priors; anonymous feedback is quarantined | Not on-chain stake — **RBAC + human cost** |
| `agent_id` in `audit_hash` | Binds the scan attestation to a declared agent identity | Not a wallet signature |

**Product name:** Swarm Guard. **API flag:** `SYBIL_SUSPECT`.  
Honest pitch: *rate + RBAC against cheap fake multiplicity* — not a Web3 product.

---

## Audit hashing — two different things (do not conflate)

| Artifact | Scope | Linked to prior hash? |
|---|---|---|
| **`audit_hash`** on `POST /v1/scan` | **Per-scan** SHA-256 of `scan_id\|agent_id\|input\|decision\|score` | **No** — integrity fingerprint for that response, not a chain |
| **Investigation hash chain** | WARN/BLOCK investigations (`prev_hash` → next record) | **Yes** — tamper-evident across investigation records; verify via investigation APIs |

If a judge asks “is the audit hash chained?”: **scan `audit_hash` = per-record; investigation trail = chained.**

---

## Field Mode — glare, heat, exhaustion (Theme 03)

Header toggle (**Field / Glare Mode**). Stated mechanisms:

| Stressor | UI mechanism |
|---|---|
| **Glare** (sun on screen) | Extreme black/yellow contrast, no gray-on-gray |
| **Heat** (sweaty / outdoor) | Animations disabled; oversized ≥56px targets; wider tap gaps |
| **Exhaustion** (fatigue / stress) | Hold-to-confirm (~700ms) before accepting a BLOCK on `/demo`; one-word verdict first |

This is an **ops UI** adaptation, not a climate sensor. Toggle works even if the API is down.

---

## Core API

| Method | Path | Purpose |
|---|---|---|
| POST | `/v1/scan` | Score one input |
| GET | `/v1/demo/code-switch` | Hero corpus (n=12) |
| GET | `/v1/eval/code-switch` | Extended labeled eval (n=30) + precision/recall/FPR |
| POST | `/v1/adapters/sap/webhook` | SAP-shaped second ERP stub |
| GET | `/v1/sybil/stats` | Swarm Guard / Sybil detector stats |
| POST | `/v1/feedback` | Analyst-gated human feedback |
| GET | `/v1/health` | Health |

Auth: `Authorization: Bearer internal` (or any key in `SYRA_API_KEYS`).

---

## One-line pitch

SyRA blocks malicious enterprise input when language is messy, actors are swarming, and the human logging the decision is standing in the sun — proven on **two live HTTP ERP shapes** (Demo ERP + SAP webhook stub), with certified connectors left as the same `POST /v1/scan` pattern.
