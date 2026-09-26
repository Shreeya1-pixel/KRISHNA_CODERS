# SyRA

**Track:** AI / ML  
**VIDEO DEMO:** https://drive.google.com/file/d/17ZsBSLqrz5cewd28SXtxZfPUBD_TFRZq/view?usp=drive_link  
**Website (localhost):** http://127.0.0.1:5174 · **API:** http://127.0.0.1:8001/docs  
**Repo:** https://github.com/Shreeya1-pixel/KRISHNA_CODERS · **Setup:** [SETUP.md](SETUP.md)

SyRA is a real-time **ALLOW / WARN / BLOCK** decision engine for enterprise inputs
(ERP forms, APIs, chat, URLs, repos). This submission is an **AI/ML** project: security
for **messy language and confusable script** — Arabizi, Arabic digits, mixed script,
IDN/homograph URLs — normalised **before** pattern matching, then scored through a
three-tier ML path with graceful fallback (**no OpenAI key required**).

---

## Problem & market

English-first WAFs and DLP assume clean, monolingual, Latin-script input on a desktop
SOC workflow. Real Gulf/MENA enterprise traffic does not: staff code-switch mid-field,
spell by ear (Arabizi), paste Arabic-Indic digits into SQL-shaped notes, and attackers
use lookalike Unicode domains that humans read as “open-access.” That gap is the product.

**Market:** Global WAF is commonly estimated ~USD 6–9B (2024–25); DLP and CASB each add
low-single-billions — together a **low-tens-of-billions** category still optimized for
anglophone stacks. The *form and URL plane* is already live attack surface: SuiteCRM SQLi
([CVE-2023-5350](https://nvd.nist.gov/vuln/detail/CVE-2023-5350)), Salesforce Web-to-Lead →
Agentforce prompt injection
([Zenity / The Register, 2026](https://www.theregister.com/security/2026/09/24/salesforce-agentforce-vulns-allowed-0-click-crm-data-theft-anonymous-phishing/5298958)),
and homograph / IDN phishing that bypasses string-equality checks. SyRA sits **before
persistence** as an API any ERP or chat client can call.

<small>Sources (approx.): WAF ~$5.8B (2024, [EMR](https://www.researchandmarkets.com/reports/6112911/web-application-firewall-market-report-forecast)) / ~$8.6–9.4B (2025, [Fortune](https://www.fortunebusinessinsights.com/web-application-firewall-market-108841), [Mordor](https://www.mordorintelligence.com/industry-reports/web-application-firewall-market)); DLP ~$4.3B (2024, [Stratview](https://www.stratviewresearch.com/market-reports/data-loss-prevention-market.html)); CASB ~$4.9B (2024, [Grand View](https://www.grandviewresearch.com/horizon/statistics/cloud-security-market/solution/casb/global)). Cite the range, not a single invented TAM.</small>

**Look at first:** `/demo` (normalisation) → `/eval` (precision/recall/FPR, misses kept) →
`/visual` (GitHub or URL → annotated screenshot) → `/chat` (role-adaptive views).  
Default live path is **Tier-1 + Tier-2 only** — no API key, no Tier-3 LLM.

---

## Website demo map

| Path | What it shows |
|---|---|
| `/demo` | **Hero** — one-click code-switch / Arabizi / Arabic-digit payloads → ALLOW/WARN/BLOCK + normalised text + tier path |
| `/eval` | **Live eval harness** — labeled n=30 set, precision / recall / FPR, kept misses |
| `/chat` | **Role-adaptive chat UI** — same Tier-1+2 engine, depth by role; optional homograph panel (see framing below) |
| `/visual` | **Visual evidence** — paste a **URL** or **GitHub repo**; Playwright + Pillow return annotated screenshots |
| `/erp-demo` · `/erp-sap-stub` | ERP harnesses gated by the same scan API |
| `/app` | Dashboard + live engine path (which tiers are up) |
| `/workflow` | Pipeline builder for composing detection steps without editing models — product tooling, not the ML hero |

Field Mode and Swarm Guard remain available as extras (not separate track claims).

**`/chat` homograph panel (not a ChatGPT horse race):** a *prepared* generic-LLM-style
reply is shown beside a live SyRA Tier-1+2 scan of the same IDN URL. ChatGPT is not a
security product and was not designed for confusable Unicode — the point is only that
**generic LLMs need a purpose-built pre-processing / detection layer** for this class of
input. It is not a claim that we “beat” ChatGPT.

**`/workflow` one-liner (if asked how it serves AI/ML):** lets non-technical staff compose
detection pipelines without touching the model layer; the models stay behind `/v1/scan`.

---

## Tech stack

| Layer | Stack |
|---|---|
| API | FastAPI · Uvicorn · Pydantic |
| Scoring | Heuristics → TF-IDF (live default) → optional DistilBERT / LLM |
| Multilingual | Arabizi / Arabic-digit / mixed-script / homograph normalisation |
| Agents | Local LangGraph-style graph (5 specialists) |
| Visual | Playwright (Chromium) · Pillow annotations · GitHub file render |
| Chat UI | Role-conditioned views over `/v1/scan` (Tier-1+2; not Tier-3) |
| Workflow | Optional pipeline composer — wraps the same scan API |
| Audit | Per-scan SHA-256 `audit_hash` · investigation `prev_hash` chain |
| Adaptation | Bayesian thresholds (SQLite) · LoRA controller |
| Frontend | React · Vite |
| ERP demos | Demo ERP · SAP webhook stub |

## Setup

**Requirements:** Python 3.11 · Node 18+. Full steps: **[SETUP.md](SETUP.md)**.  
For `/visual` screenshots: `playwright install chromium` once after `pip install`.

```bash
# Backend (:8001)
cd backend && python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cp ../.env.example .env
playwright install chromium   # needed for /visual
export PYTHONPATH="$(pwd)"
uvicorn syra_backend.main:app --host 127.0.0.1 --port 8001 --reload

# Frontend (:5174) — other terminal
cd frontend/website && npm install && npm run dev
```

Open http://127.0.0.1:5174/demo · Auth: `Authorization: Bearer internal`.  
Prefer localhost if a public deploy 502s (video link above as fallback).

---

## AI/ML — code-switching, spell-by-ear, confusable script

```text
3tini admin access     → Arabizi “give me” + privilege → BLOCK
١=١ UNION SELECT       → Arabic digits inside SQL → BLOCK
إسقاط جدول users       → Arabic “drop” + English noun → BLOCK
https://ọpen-ạccess…   → IDN / script-borrow → BLOCK (+ /visual screenshot)
شكرا على المساعدة…     → clean Arabic business text → ALLOW
```

**Pipeline (what the demo runs):** MultilingualAgent normalises → Tier-1 heuristics →
Tier-2 TF-IDF (or DistilBERT if Torch is installed). **Tier-3 LLM is off unless you
configure an OpenAI-compatible endpoint** — `/chat` and `/demo` do not imply Tier-3.
Every scan returns `tier_used` / `tier2_backend`. Homograph / GitHub inputs can use
`POST /v1/scan/visual` for annotated evidence images.

### Eval — *not* a production benchmark

UI: `/eval` · API: `GET /v1/eval/code-switch`

This submission ships a fixed labeled set (**n=30**). Numbers below are intentional and
unchanged for this round — growth is roadmap, not silent cherry-picking.

| Set | n | Exact match | Precision | Recall | FPR |
|---|---|---|---|---|---|
| Hero click-path | **12** | **10/12 (83.3%)** | **1.00** | **0.90** | **0.00** |
| Extended labeled set | **30** | **23/30 (76.7%)** | **1.00** | **0.78** | **0.00** |

7 misses cluster in rare homographs and low-frequency Arabizi not in Tier-1 patterns —
Tier-2/LLM-tier gaps, not normalisation failures. Misses stay in the set.

---

## Also shipped (not submitted tracks)

**Swarm Guard** — ≥5 distinct `user_id`s / 30s → `SYBIL_SUSPECT` + analyst-gated feedback.  
**Field Mode** — ≥56px targets (WCAG 2.5.5), hold-to-confirm on BLOCK.

---

## What works / what does not

### Works locally

| Feature | Status |
|---|---|
| Code-switch hero `/demo` + normalisation | ✅ |
| Live eval `/eval` (n=30, kept misses) | ✅ |
| Role-adaptive `/chat` (Tier-1+2; prepared LLM-style foil for pre-processing point) | ✅ |
| Visual evidence `/visual` (URL + GitHub → annotated screenshots) | ✅ when Chromium installed |
| Workflow builder `/workflow` (compose pipelines; models untouched) | ✅ |
| Tier-2 live (TF-IDF / pure-Python) | ✅ |
| Demo ERP · SAP webhook stub | ✅ |
| Swarm Guard · Field Mode | ✅ (extensions) |

### Partial / not claimed

| Item | Reality |
|---|---|
| Visual capture without Playwright/Chromium | Falls back to text-only scan |
| Tier-3 LLM | **Off by default** — needs OpenAI-compatible URL + key |
| DistilBERT / LoRA *train* | Optional GPU |
| “We beat ChatGPT” | **Not claimed** — `/chat` foil shows need for a purpose-built layer |
| Certified ERP connectors | Harnesses only |
| Eval set growth past n=30 | Roadmap (adversarial Arabizi mining) |

---

## Core API

| Method | Path | Purpose |
|---|---|---|
| POST | `/v1/scan` | Score one input |
| POST | `/v1/scan/visual` | Scan + screenshot / GitHub code highlight |
| GET | `/v1/demo/code-switch` | Hero corpus |
| GET | `/v1/eval/code-switch` | Labeled eval metrics |
| POST | `/workflows/run` | Execute a saved pipeline |
| POST | `/v1/adapters/sap/webhook` | SAP-shaped stub |
| GET | `/v1/health` | Live path flags |

Auth: `Authorization: Bearer internal` (or `SYRA_API_KEYS`).

---

## Pitch

SyRA is an AI/ML engine for **messy enterprise language and confusable script** —
code-switch payloads, Arabizi, Arabic digits, homograph URLs — running on **Tier-1+2
with no API key**, with a live eval harness that reports precision, recall, FPR, and
kept misses.

**Next:** grow the labeled set past 30 with adversarial Arabizi mining; deepen GitHub
visual rulesets on the existing Playwright path.
