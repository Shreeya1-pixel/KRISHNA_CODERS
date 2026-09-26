# SyRA × Three Secret Problems — Framing & Features

These three problems are yours alone. SyRA already owns #1. #2 and #3 need
deliberate product framing (and a few high-leverage features) so judges see one
coherent system answering all three — not three bolted-on demos.

---

## How to read the problems (the actual point)

| # | Domain | Surface reading | Deeper reading (build for this) |
|---|---|---|---|
| 01 | AI / ML | Multilingual NLP | Models trained on clean official language fail when people **code-switch, spell by ear, and write one language in another's script** |
| 02 | Blockchain / Web3 | Sybil / identity | Rules assume **one human, one stake** — but agent swarms make **10,000 fake participants cheap and indistinguishable** |
| 03 | Web | Responsive UI | Ops UIs are designed for **quiet, climate-controlled desktops** — but compliance logging happens in **glare, heat, exhaustion** |

SyRA's through-line for judges:

> **Security decisions must work when language is messy, when actors are swarming, and when the human logging the decision can barely see the screen.**

---

## 01 — Code-switching & spelling by ear (AI/ML)

### What you already have (own this loudly)
- MultilingualAgent + Arabizi / Arabic digit / mixed-script normalization
- Homograph / Unicode codepoint detection
- Role-adaptive Assistant that still runs the full forensic engine

### Framing change (README + pitch)
Stop saying "Arabic support." Say:

> SyRA is built for **language as people actually write it** — not as textbooks print it. Code-switching, phonetic spelling, and script-borrowing are not edge cases; they are the attack surface.

### Features to add (pick 2–3 for demo)
1. **Phonetic / Arabizi normalizer panel** — show input → normalized form → matched threat side-by-side (`3tini admin` → `give me admin` → privilege abuse).
2. **Code-switch attack corpus** — 20 canned demo strings mixing EN/AR/Arabizi/digits; one-click to scan.
3. **Spell-by-ear fuzzy matcher** — edit-distance / soundex-style bridge from informal spelling to known attack lexemes (without requiring perfect Arabic orthography).
4. **Script-borrow detector** — flag Latin letters that look Arabic, Arabic digits in SQL, Homoglyph IDN — already partial; label it as "script borrowing."

### Demo line for judges
> "English-first tools train on clean Arabic. Attackers write like WhatsApp. SyRA reads WhatsApp."

---

## 02 — Sybil resistance under agent swarms (Blockchain/Web3)

### Honest mapping (do not fake a blockchain unless you ship one)
You are not building Ethereum. You are answering the **same trust problem**:

> When creating 10,000 "participants" is free, how do you know a scan / vote / alert / agent action came from a **real stake**, not a swarm?

**Why “Sybil resistance” is still the right label:** Sybil = one actor pretending
to be many. SyRA’s countermeasures are burst detection + analyst RBAC — not
on-chain stake. Say that out loud before a judge asks.

SyRA's existing assets that map cleanly:
- Per-scan SHA-256 `audit_hash` (not chained) + investigation `prev_hash` **chain**
- Bayesian thresholds from **human** analyst feedback (`role=analyst` = human cost)
- VerifierAgent as false-positive meta-judge
- API keys / bearer auth (too weak alone — say so)

### Framing change
> SyRA treats automated agent swarms as a Sybil threat against the security plane itself: flood-scans, feedback poisoning, and fake "analyst" approvals that look like ordinary traffic.

### Features to add (high leverage, still on-brand)
1. **Stake-weighted feedback** — only authenticated analyst roles update Bayesian priors; anonymous / API-key-only feedback is quarantined. (Human stake = Sybil cost.)
2. **Swarm / burst detector** — rate + fingerprint cluster: same payload shape from N identities in T seconds → `SYBIL_SUSPECT`, escalate threshold, require step-up (MFA / human approve).
3. **Agent attestation on investigation graph** — each agent node signs its state transition into the existing hash chain (`agent_id + model_id + checkpoint_hash`). Swarm of fake agents without keys cannot forge the chain.
4. **Optional light Web3 hook (only if time)** — publish investigation root hash to a public chain / or store Merkle root of daily audit chain. One tx/day is enough for the story: "cheap swarm cannot rewrite yesterday's evidence."

### Demo line for judges
> "Acting as ten thousand scanners costs almost nothing. Poisoning SyRA's thresholds still costs a real analyst — and the audit chain makes forged swarm approvals detectable."

### What NOT to do
- Don't rename SyRA a "blockchain product."
- Don't add a tokenomics slide.
- Do say: **Sybil resistance for the decision layer**, using stake + attestation + rate reality.

---

## 03 — Built for a quiet room, used in the sun (Web)

### Honest mapping
Your dashboard is a dark desktop UI. The problem asks for **field ops**: glare, heat, exhaustion — emergency / workplace compliance logging.

### Framing change
> Security and compliance logging does not happen in a quiet office. SyRA's **Field Mode** is an operational UI for phones and tablets used outdoors — glare, heat, and exhaustion each map to a concrete UI knob.

### Shipped Field Mode mechanisms
1. **Glare** — extreme black/yellow contrast; no gray-on-gray
2. **Heat** — CSS animations/transitions forced off; ≥56px targets; wider tap gaps
3. **Exhaustion** — hold-to-confirm (~700ms) on BLOCK in `/demo`

Optional later: offline sync queue, voice targets.

### Demo line for judges
> "WAFs are designed for SOC monitors. Incidents are logged in parking lots. SyRA's field UI is built for the parking lot."

---

## Single product narrative (use this in README + pitch)

**SyRA** is a real-time ALLOW / WARN / BLOCK engine for enterprise inputs.

It is specifically engineered against three failure modes of modern systems:

1. **Messy language** — code-switching, spelling by ear, script-borrowing (AI/ML problem).
2. **Cheap multiplicity** — agent swarms that look like many humans (Sybil / Web3 problem).
3. **Hostile environments** — compliance UIs used in glare, heat, and fatigue (Web problem).

A demo ERP is the sample host. The product is the decision plane.

---

## Build priority for a Google-level hackathon (48h realism)

| Priority | Item | Theme | Effort | Judge impact |
|---|---|---|---|---|
| P0 | README + pitch reframed to 3 themes | all | 1h | Critical |
| P0 | Glare / Field Mode UI toggle | 03 | 3–6h | Very high (visible) |
| P0 | Phonetic / code-switch demo panel + corpus | 01 | 2–4h | High (you already have engine) |
| P1 | Swarm burst detector + stake-gated feedback | 02 | 4–8h | High |
| P1 | Agent attestation into existing hash chain | 02 | 3–5h | High (technical depth) |
| P2 | Daily Merkle root / optional chain publish | 02 | 4h+ | Nice if time |
| P2 | Offline queue stub | 03 | 2–3h | Nice |

Do **not** rebuild the core engine. Reframe hard, ship Glare Mode, ship swarm stake gating, amplify code-switch demos.

---

## README section (paste under intro)

See `README_THREE_THEMES_SECTION.md` for the drop-in markdown.
