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

Normalization runs **before** pattern matching. The click-path corpus is **13**
samples (`GET /v1/demo/code-switch`). Demo-corpus eval (n=13): attack-detection
precision **1.00**, recall **0.82**, FPR **0.00**, exact match **76.9%** — label
these as corpus numbers, not a production benchmark. Keep off-corpus strings
ready to type live (see README). Full labeled set is **n=31 / 74.2%** exact.

### 02 — Sybil resistance under agent swarms (trust / Web3-shaped)

A Sybil attack means **one actor pretending to be many**. Blockchain stake is
one cost model for multiplicity — SyRA is **not** a chain/token product. It
applies the same threat model to the **security decision plane**:

| Swarm abuse | SyRA counter (honest) |
|---|---|
| Flood of automated scans / fake identities | Burst + fingerprint (≥5 `user_id`s / 30s) → `SYBIL_SUSPECT` |
| Fake "analyst" feedback poisoning thresholds | RBAC: only `role=analyst` moves Bayesian priors |
| Forged agent steps | Per-scan `audit_hash` includes `agent_id`; **investigation** records form a SHA-256 `prev_hash` **chain** |

Cheap multiplicity can generate traffic. Raising the cost of *trusted* feedback
still requires a real analyst role — that is why we use the Sybil label without
claiming on-chain stake.

### 03 — Built for a quiet room, used in the sun (Web / ops UI)

Operational UIs are designed for climate-controlled desktops. Emergency and
workplace compliance logging happens under solar glare, heat, and exhaustion.

SyRA **Field Mode** maps each stressor to a UI mechanism:

- **Glare** — extreme black/yellow contrast; no thin gray-on-gray
- **Heat** — animations off; oversized (≥56px) targets and wider tap gaps
- **Exhaustion** — hold-to-confirm (~700ms) on BLOCK in `/demo`; one-word verdict first

The SOC monitor is optional. The parking-lot logger is first-class.

### How the three lock together

```text
Messy human language  →  Multilingual / phonetic layer catches real payloads
Cheap agent swarms    →  Burst + analyst RBAC keeps the decision plane honest
Hostile field UI      →  Field Mode lets exhausted humans still log correctly
```

One product. Three domains. Same ALLOW / WARN / BLOCK spine.

**Demo integration:** Demo ERP (`/erp-demo`) is a **testing harness** — not a
production ERP inject. Any platform that can call `POST /v1/scan` is in scope
to wire later. Prefer localhost if a public deploy 502s; keep a short `/demo`
recording as fallback.
