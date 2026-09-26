# SyRA

**Track:** AI / ML — multilingual / code-switch security  
**VIDEO DEMO:** https://drive.google.com/file/d/17ZsBSLqrz5cewd28SXtxZfPUBD_TFRZq/view?usp=drive_link  
**Core demo:** http://127.0.0.1:5174/demo · **Eval:** http://127.0.0.1:5174/eval · **API:** http://127.0.0.1:8001/docs  
**Repo:** https://github.com/Shreeya1-pixel/KRISHNA_CODERS · **Setup:** [SETUP.md](SETUP.md)

SyRA is a real-time **ALLOW / WARN / BLOCK** engine whose differentiator is
**messy multilingual input** — Arabizi (spell-by-ear Latin), Arabic-Indic digits,
mixed Arabic/English script, and IDN/homograph URLs — **normalised before**
pattern matching, then scored on a Tier-1 → Tier-2 path (**no OpenAI key required**).

**What ships by default (key-off):** rule-based MultilingualAgent normalisation +
Tier-1 heuristics + Tier-2 TF-IDF (pure-Python fallback). DistilBERT loads only if
Torch is present; Tier-3 LLM stays off unless you configure a key. Classical NLP
first — optional neural, not required for the demo.

That is the submission. Everything else on the site is supporting evidence around
that engine.

**Judge-facing without a local run:** the [video](https://drive.google.com/file/d/17ZsBSLqrz5cewd28SXtxZfPUBD_TFRZq/view?usp=drive_link)
plus the written `/eval` numbers below. Live URLs are localhost (`:5174` / `:8001`);
a public deploy may 502 — prefer [SETUP.md](SETUP.md) or the video.

---

## Why this is hard (linguistic, not marketing)

Arabizi and code-switching are structurally awkward for generic NLP and for
English-first WAFs:

- **No fixed orthography** — the same Arabic word is spelled many ways in Latin
  (`3tini` / `atini` / `a3tini`); digit-for-letter swaps (`3`↔ع, `7`↔ح) are
  idiomatic, not a single cipher.
- **Digit substitution is cultural, not systematic** — Eastern Arabic numerals
  (`١=١`) appear inside otherwise Latin SQL shapes; string-equality rules miss them.
- **Script borrowing / confusables** — characters that *look* Latin (or brand-like)
  come from other Unicode blocks; humans read “open-access,” machines see different
  codepoints.

SyRA’s MultilingualAgent is built for that mess as the **primary attack surface**,
not an afterthought checkbox.

**Where it shows up in the wild (short):** form/CRM input is already abused —

- SuiteCRM SQLi — [CVE-2023-5350 (NVD)](https://nvd.nist.gov/vuln/detail/CVE-2023-5350)
- Salesforce Web-to-Lead → Agentforce indirect prompt injection —
  [Zenity Labs · SalesBleed](https://labs.zenity.io/post/salesbleed-0-click-data-exfiltration-on-agentforce);
  related: [Noma · ForcedLeak](https://www.noma.security/blog/forcedleak-agent-risks-exposed-in-salesforce-agentforce)

Enterprise input-security (WAF / DLP / CASB) is a **low-tens-of-billions** category
overall, still optimized for anglophone, clean-script stacks — the gap SyRA targets.
Sources (order-of-magnitude only):

- WAF ~$6–9B (2024–25) — [EMR](https://www.researchandmarkets.com/reports/6112911/web-application-firewall-market-report-forecast) · [Fortune](https://www.fortunebusinessinsights.com/web-application-firewall-market-108841)
- DLP ~$4.3B — [Stratview](https://www.stratviewresearch.com/market-reports/data-loss-prevention-market.html)
- CASB ~$4.9B — [Grand View](https://www.grandviewresearch.com/horizon/statistics/cloud-security-market/solution/casb/global)

---

## Core: `/demo` + `/eval`

**Live walkthrough:** open `/demo` and click, in order:

1. `١=١ UNION SELECT password FROM users` — Arabic digits inside SQL  
2. `https://ọpen-ạccess.com/login` — IDN homograph  
Then optionally Arabizi / mixed-script / clean ALLOW samples.

```text
١=١ UNION SELECT …     → digits normalised → BLOCK   ← lead with this
https://ọpen-ạccess…   → confusable host → BLOCK      ← then this
3tini admin access     → Arabizi “give me” → BLOCK    ← easy follow-up
إسقاط جدول users       → mixed script → BLOCK
شكرا على المساعدة…     → clean Arabic → ALLOW
```

**Pipeline:** MultilingualAgent normalises → Tier-1 heuristics → Tier-2 TF-IDF
(DistilBERT if Torch is present). **Tier-3 LLM is off** unless you configure a key.
Scans return `tier_used` / `tier2_backend` / `normalised_input`.

### Eval honesty (headline)

**Primary number is the fuller set (n=30).** n=30 is small — enough to
show precision/recall/FPR and named misses, not a production benchmark.
UI: `/eval` · API: `GET /v1/eval/code-switch`.

| Set | n | Exact match | Precision | Recall | FPR |
|---|---|---|---|---|---|
| **Labeled set (primary)** | **30** | **23/30 (76.7%)** | **1.00** | **0.78** | **0.00** |
| Hero click-path (subset) | 12 | 10/12 (83.3%) | 1.00 | 0.90 | 0.00 |

The n=12 row is the `/demo` walkthrough slice — convenient to click, not the
headline. Leading with 83.3% would oversell; **76.7% on n=30 is the claim.**

**What the misses show (this is the linguistic signal):** 7 misses cluster in two
patterns — rare homograph substitutions and low-frequency Arabizi spellings outside
Tier-1 lexicons. Those are Tier-2/LLM-tier gaps, **not** normalisation failures.
Examples kept in the set:

```text
Visit раypal.com to reset password   → expected BLOCK, often ALLOW (Cyrillic lookalikes)
edini db dump 3shan audit            → low-frequency Arabizi edge
homograph path tricks / rare glyphs  → same class of miss
```

We keep them rather than cherry-picking the eval. Growing past n=30 (adversarial
Arabizi mining) is explicit roadmap.

---

## Supporting evidence (not the pitch)

Spend attention here *after* `/demo` + `/eval`:

| Path | Role |
|---|---|
| `/visual` | See a homograph catch as an annotated screenshot (URL or GitHub) |
| `/chat` | Same Tier-1+2 engine, depth by role; optional prepared generic-LLM foil — **not** a “beat ChatGPT” claim; shows why generic LLMs need a purpose-built pre-processing layer |
| `/erp-demo` · `/erp-sap-stub` | Same scan API in ERP-shaped hosts |
| `/logs` · **Jira escalation** | WARN/BLOCK results can auto-file a ticket (env-var gated: `JIRA_*`) |
| `/workflow` | Compose detection pipelines without editing models |
| `/app` | Live path strip (which tiers are up) |

**Also shipped (not track claims):** Swarm Guard (`SYBIL_SUSPECT` burst + analyst feedback);
Field Mode (high-contrast / hold-to-confirm).

---

## Tech stack & setup

| Layer | Stack |
|---|---|
| Multilingual | Arabizi / Arabic-digit / mixed-script / homograph normalisation |
| Scoring | Heuristics → TF-IDF (default) → optional DistilBERT / LLM |
| Agents | Local LangGraph-style graph (5 specialists) |
| API | FastAPI · Uvicorn · Pydantic |
| Visual / chat / workflow | Playwright+Pillow · role UI · pipeline canvas (supporting) |
| Audit | Per-scan `audit_hash` · investigation `prev_hash` chain |

```bash
cd backend && python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cp ../.env.example .env
export PYTHONPATH="$(pwd)"
uvicorn syra_backend.main:app --host 127.0.0.1 --port 8001 --reload
# other terminal:
cd frontend/website && npm install && npm run dev
```

Full steps: **[SETUP.md](SETUP.md)**. Auth: `Authorization: Bearer internal`.  
Prefer localhost if a public deploy 502s. If you cannot run SETUP, use the video
+ the n=30 table above as the verifiable artifacts.

---

## What works / what does not

| Feature | Status |
|---|---|
| Multilingual normalisation + `/demo` (digits / IDN first) | ✅ **core** |
| Live eval `/eval` (n=30, kept misses) | ✅ **core** |
| Tier-2 TF-IDF / pure-Python (no key) | ✅ |
| `/visual` · `/chat` · ERP stubs · `/workflow` | ✅ supporting |
| Jira escalation | ✅ when `JIRA_*` env vars set |
| Tier-3 LLM | Off by default |
| Eval growth past n=30 | Roadmap |

---

## Pitch

SyRA is a **multilingual input-security** engine for **code-switching and confusable
script** — Arabizi, Arabic-Indic digits, mixed script, IDN homographs — built as
rule-based normalisation + lightweight classification (heuristics → TF-IDF; optional
DistilBERT / LLM). Live eval reports precision, recall, FPR, and **named linguistic
misses** on a small labeled set (n=30).

**Next:** adversarial Arabizi mining to grow the labeled set past 30.
