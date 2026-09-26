# SyRA

**Track:** AI / ML  
**VIDEO DEMO:** https://drive.google.com/file/d/17ZsBSLqrz5cewd28SXtxZfPUBD_TFRZq/view?usp=drive_link  
**Hero demo:** http://127.0.0.1:5174/demo · **Eval:** http://127.0.0.1:5174/eval · **API:** http://127.0.0.1:8001/docs  
**Repo:** https://github.com/Shreeya1-pixel/KRISHNA_CODERS · **Setup:** [SETUP.md](SETUP.md)

SyRA is a real-time **ALLOW / WARN / BLOCK** decision engine for enterprise inputs
(ERP forms, APIs, chat). This submission is an **AI/ML** project: security for
**code-switching and spell-by-ear** text — Arabizi, Arabic digits, mixed script —
normalised **before** pattern matching, then scored through a three-tier ML path
with graceful fallback (no OpenAI key required).

English-first WAFs assume clean, monolingual input. SyRA is built for Gulf/MENA
enterprise text and form-plane attacks that don't meet that assumption.

**Market:** Global WAF is commonly estimated ~USD 6–9B (2024–25); DLP and CASB each add
low-single-billions — together a **low-tens-of-billions** category, still built for
anglophone, desktop-first stacks. The form plane is already live attack surface:
SuiteCRM SQLi (e.g. [CVE-2023-5350](https://nvd.nist.gov/vuln/detail/CVE-2023-5350)) and
Salesforce Web-to-Lead → Agentforce prompt injection
([Zenity / The Register, 2026](https://www.theregister.com/security/2026/09/24/salesforce-agentforce-vulns-allowed-0-click-crm-data-theft-anonymous-phishing/5298958)).

<small>Sources (approx.): WAF ~$5.8B (2024, [EMR](https://www.researchandmarkets.com/reports/6112911/web-application-firewall-market-report-forecast)) / ~$8.6–9.4B (2025, [Fortune](https://www.fortunebusinessinsights.com/web-application-firewall-market-108841), [Mordor](https://www.mordorintelligence.com/industry-reports/web-application-firewall-market)); DLP ~$4.3B (2024, [Stratview](https://www.stratviewresearch.com/market-reports/data-loss-prevention-market.html)); CASB ~$4.9B (2024, [Grand View](https://www.grandviewresearch.com/horizon/statistics/cloud-security-market/solution/casb/global)). Cite the range, not a single invented TAM.</small>

**What to look at first:** normalisation on `/demo` → live precision/recall/FPR on `/eval`
(n=30, misses kept) → `audit_hash` is **per-scan**; investigation trail is a separate
`prev_hash` **chain**.

---

## Tech stack

| Layer | Stack |
|---|---|
| API | FastAPI · Uvicorn · Pydantic |
| Scoring | Heuristics → TF-IDF / DistilBERT → optional LLM (graceful fallback) |
| Multilingual | Arabizi / Arabic-digit / mixed-script normalisation |
| Agents | Local LangGraph-style graph (5 specialists) |
| Audit | Per-scan SHA-256 `audit_hash` · investigation `prev_hash` chain |
| Adaptation | Bayesian thresholds (SQLite) · LoRA controller |
| Frontend | React · Vite |
| ERP demos | Demo ERP (`/erp-demo`) · SAP webhook stub (`/erp-sap-stub`) |

## Setup

**Requirements:** Python 3.11 · Node 18+. Full steps: **[SETUP.md](SETUP.md)**.

```bash
# Backend (:8001)
cd backend && python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cp ../.env.example .env
export PYTHONPATH="$(pwd)"
uvicorn syra_backend.main:app --host 127.0.0.1 --port 8001 --reload

# Frontend (:5174) — other terminal
cd frontend/website && npm install && npm run dev
```

Open http://127.0.0.1:5174/demo · Auth: `Authorization: Bearer internal`.  
Walkthrough: `/demo` → `/eval` → `/erp-demo` (optional). Prefer localhost if a public deploy 502s.

---

## AI/ML problem — code-switching & spelling by ear

Language tools learn one clean official version of a language. People switch tongues
mid-sentence, spell by ear, and write one language in another's script. That mess is
SyRA's **primary attack surface**, not an edge case.

```text
3tini admin access     → Arabizi “give me” + privilege → BLOCK
١=١ UNION SELECT       → Arabic digits inside SQL → BLOCK
إسقاط جدول users       → Arabic “drop” + English noun → BLOCK
https://ọpen-ạccess…   → IDN / script-borrow → BLOCK
شكرا على المساعدة…     → clean Arabic business text → ALLOW
```

**Pipeline:** MultilingualAgent normalises → Tier-1 heuristics → Tier-2 TF-IDF
(DistilBERT when Torch is present) → optional Tier-3 LLM. Every scan returns
`tier_used` / `tier2_backend` so the live path is visible.

### Eval — *not* a production benchmark

Re-run in UI at `/eval` or `GET /v1/eval/code-switch` (Bearer `internal`).

| Set | n | Exact match | Precision | Recall | FPR |
|---|---|---|---|---|---|
| Hero click-path | **12** | **10/12 (83.3%)** | **1.00** | **0.90** | **0.00** |
| Extended labeled set | **30** | **23/30 (76.7%)** | **1.00** | **0.78** | **0.00** |

7 misses cluster in two patterns: rare homograph substitutions (Cyrillic/Latin
lookalikes) and low-frequency Arabizi spellings not seen in Tier-1 patterns — both
are Tier-2/LLM-tier problems, not normalization failures. Misses stay in the set.

```text
edini db dump 3shan audit          → Arabizi edge (often ALLOW without Tier-2)
حذف كل السجلات WHERE id > 0        → Arabic destructive + SQL → usually BLOCK
1; DROP TABLE vendors;--           → classic SQLi → BLOCK
Meeting notes: ship Q3 forecast    → should stay ALLOW
```

---

## Also shipped (not submitted tracks)

**Swarm Guard** — burst fingerprint (≥5 `user_id`s / 30s → `SYBIL_SUSPECT`) plus
`role=analyst` gating on feedback. Extra decision-plane hardening; not a Web3/blockchain claim.

**Field Mode** — high-contrast outdoor UI (≥56px targets, WCAG 2.5.5; hold-to-confirm on
BLOCK). Ops convenience on `/demo`; not the AI/ML pitch.

---

## ERP harnesses (same API)

| Target | Path | Status |
|---|---|---|
| Demo ERP | `/erp-demo` → `/v1/scan` | ✅ testing harness |
| SAP webhook stub | `/erp-sap-stub` → `POST /v1/adapters/sap/webhook` | ✅ second HTTP shape |
| Certified SAP / Oracle / Dynamics | middleware → `/v1/scan` | Aspirational |

---

## What works / what does not

### Works locally

| Feature | Status |
|---|---|
| `POST /v1/scan` ALLOW/WARN/BLOCK | ✅ |
| Code-switch demo + corpus (`/demo`) | ✅ **hero** |
| Arabizi / Arabic-digit / mixed-script normalisation | ✅ |
| Tier-2 live (TF-IDF / pure-Python; DistilBERT if Torch) | ✅ |
| Live eval UI (`/eval`) + labeled n=30 harness | ✅ |
| Per-scan `audit_hash` · investigation `prev_hash` chain | ✅ |
| LoRA controller gate (no GPU required for the gate) | ✅ |
| Demo ERP · SAP webhook stub | ✅ |
| Swarm Guard · Field Mode | ✅ (extensions) |

### Partial / not claimed

| Item | Reality |
|---|---|
| Tier-3 LLM | Optional OpenAI-compatible endpoint |
| DistilBERT weights / LoRA *training* | Optional GPU; default path does not need them |
| Certified ERP connectors | Not shipped — harnesses only |
| General MT / blockchain / token product | Not claimed |

---

## Core API

| Method | Path | Purpose |
|---|---|---|
| POST | `/v1/scan` | Score one input |
| GET | `/v1/demo/code-switch` | Hero corpus |
| GET | `/v1/eval/code-switch` | Labeled eval + precision/recall/FPR |
| POST | `/v1/adapters/sap/webhook` | SAP-shaped stub |
| GET | `/v1/health` | Live path (tiers, Swarm Guard, LoRA gate) |

Auth: `Authorization: Bearer internal` (or `SYRA_API_KEYS`).

---

## Pitch

SyRA is an AI/ML decision engine for **messy enterprise language** — code-switch and
spell-by-ear payloads that English-first scanners miss — with a live eval harness that
reports precision, recall, FPR, and kept misses.

**Next:** grow the labeled set past 30 with adversarial Arabizi mining; optional sandboxed
SAP Event Mesh subscription behind the existing stub.
