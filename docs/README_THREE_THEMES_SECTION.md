## Three Failure Modes SyRA Is Built Against

SyRA is not a generic scanner with a multilingual checkbox. It is engineered
against three failure modes that show up the moment real people, real agents,
and real field conditions enter the system.

### 01 — Code-switching and spelling by ear (AI / ML)

Language tools learn one clean official version of a language. People do not
write that way. They switch tongues mid-sentence, spell by ear, and write one
language in another's script.

SyRA's `MultilingualAgent` treats that mess as the **primary attack surface**,
not an edge case:

```text
3tini admin access     → Arabizi / phonetic intent ("give me admin")
١=١ UNION SELECT       → Arabic digits inside SQL structure
إسقاط جدول users       → Arabic destructive intent + English noun
ọpen-ạccess.com        → script-borrowing / IDN homograph
```

Normalization runs **before** pattern matching. English-first WAFs miss these;
SyRA is built so they cannot.

### 02 — Sybil resistance under agent swarms (trust / Web3-shaped)

Networks assume each participant is a separate someone with something to lose —
exactly when acting as ten thousand costs almost nothing and looks ordinary.

SyRA applies that threat model to the **security decision plane**:

| Swarm abuse | SyRA counter |
|---|---|
| Flood of automated scans / fake identities | Burst + fingerprint clustering → `SYBIL_SUSPECT`, raised thresholds |
| Fake "analyst" feedback poisoning thresholds | Stake-gated feedback — only authenticated human analyst roles move Bayesian priors |
| Forged agent investigation steps | Each agent transition is attested into the SHA-256 checkpoint chain (`agent_id` + model + state hash) |

Cheap multiplicity can generate traffic. It cannot cheaply forge **human stake**
or rewrite a **tamper-evident investigation chain**.

### 03 — Built for a quiet room, used in the sun (Web / ops UI)

Operational UIs are designed for climate-controlled desktops. Emergency and
workplace compliance logging happens under solar glare, heat, and exhaustion.

SyRA ships a **Field / Glare Mode** for phones and tablets at the incident site:

- Extreme contrast (sun-readable); no thin gray-on-gray
- Oversized ALLOW / WARN / BLOCK targets for gloved or fatigued hands
- One-sentence verdict first; forensic JSON only behind Details
- Hold-to-confirm on BLOCK to prevent mis-taps under stress

The SOC monitor is optional. The parking-lot logger is first-class.

### How the three lock together

```text
Messy human language  →  Multilingual / phonetic layer catches real payloads
Cheap agent swarms    →  Stake + attestation keeps the decision plane honest
Hostile field UI      →  Glare Mode lets exhausted humans still log correctly
```

One product. Three domains. Same ALLOW / WARN / BLOCK spine.

**Demo integration:** A demo ERP host is wired for the live demo — not the product
boundary. Any platform that can call `POST /v1/scan` is in scope.
