import { useCallback, useEffect, useRef, useState } from "react";
import { getApiKey } from "../utils/connections";
import "../styles/codeswitch.css";

const API = import.meta.env.VITE_API_URL || "/api";

/** Local fallback so sample buttons render even if the API is cold. */
const FALLBACK_SAMPLES = [
  {
    id: "arabizi_priv_1",
    label: "arabizi",
    expected_decision: "BLOCK",
    input: "3tini admin access right now",
    note: "Arabizi phonetic: 3tini → give me + privilege abuse",
  },
  {
    id: "arabizi_priv_2",
    label: "arabizi",
    expected_decision: "BLOCK",
    input: "edini root password bypass 2fa",
    note: "Spell-by-ear privilege + MFA disable intent",
  },
  {
    id: "arabic_digits_1",
    label: "arabic_digits",
    expected_decision: "BLOCK",
    input: "١=١ UNION SELECT password FROM users",
    note: "Eastern Arabic digits inside SQL structure",
  },
  {
    id: "mixed_script_1",
    label: "mixed_script",
    expected_decision: "BLOCK",
    input: "إسقاط جدول users",
    note: "Arabic destructive verb + English table noun",
  },
  {
    id: "homograph_1",
    label: "homograph",
    expected_decision: "BLOCK",
    input: "https://ọpen-ạccess.com/login",
    note: "IDN / script-borrowing lookalike domain",
  },
  {
    id: "clean_1",
    label: "clean",
    expected_decision: "ALLOW",
    input: "Please schedule the Q3 vendor meeting for Tuesday.",
    note: "Clean English business note",
  },
];

async function fetchCorpus() {
  const res = await fetch(`${API}/v1/demo/code-switch`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });
  if (!res.ok) throw new Error("Could not load demo corpus — is the backend on :8001?");
  return res.json();
}

async function scanSample(input, userId = "judge_demo") {
  const res = await fetch(`${API}/v1/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      input,
      context: {
        user_id: userId,
        source_system: "code_switch_demo",
        field_name: "memo",
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.detail === "string"
        ? err.detail
        : "Scan failed — start backend: cd backend && uvicorn syra_backend.main:app --port 8001"
    );
  }
  return res.json();
}

function DecisionBadge({ decision }) {
  const d = (decision || "?").toUpperCase();
  return <span className={`cs-decision cs-decision--${d.toLowerCase()}`}>{d}</span>;
}

export default function CodeSwitchDemo() {
  const [samples, setSamples] = useState(FALLBACK_SAMPLES);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [result, setResult] = useState(null);
  const [active, setActive] = useState(null);
  const [blockArmed, setBlockArmed] = useState(false);
  const [backendOk, setBackendOk] = useState(null);
  const holdTimer = useRef(null);

  useEffect(() => {
    fetchCorpus()
      .then((data) => {
        if (data.samples?.length) setSamples(data.samples);
        setBackendOk(true);
        setError("");
      })
      .catch((e) => {
        setBackendOk(false);
        setSamples(FALLBACK_SAMPLES);
        setError(
          `${e.message} Using local sample list — start the API on port 8001, then click a payload.`
        );
      });
  }, []);

  const run = useCallback(async (sample) => {
    setError("");
    setLoadingId(sample.id);
    setActive(sample);
    setBlockArmed(false);
    try {
      const data = await scanSample(sample.input);
      setResult(data);
      setBackendOk(true);
    } catch (e) {
      setError(e.message);
      setResult(null);
      setBackendOk(false);
    } finally {
      setLoadingId(null);
    }
  }, []);

  const onHoldStart = () => {
    if ((result?.decision || "").toUpperCase() !== "BLOCK") return;
    holdTimer.current = setTimeout(() => setBlockArmed(true), 700);
  };
  const onHoldEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  return (
    <div className="cs-page">
      <header className="cs-hero">
        <p className="cs-eyebrow">Theme 01 · Hero feature</p>
        <h2>Code-switch &amp; spell-by-ear security demo</h2>
        <p>
          Language tools learn one clean official version of a language. People switch tongues mid-sentence,
          spell by ear, and write one language in another&apos;s script. Click a sample — SyRA normalises,
          scores, and returns ALLOW / WARN / BLOCK.
        </p>
        {backendOk === false && (
          <p className="cs-backend-hint">
            Backend offline. In another terminal:{" "}
            <code>
              cd backend && source .venv/bin/activate && PYTHONPATH=. uvicorn syra_backend.main:app --port
              8001
            </code>
          </p>
        )}
        {backendOk === true && <p className="cs-backend-ok">Engine online — click a payload.</p>}
      </header>

      {error && (
        <div className="cs-error" role="alert">
          {error}
        </div>
      )}

      <div className="cs-layout">
        <section className="cs-samples" aria-label="Demo payloads">
          <h3>One-click payloads</h3>
          <ul>
            {samples.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`cs-sample${active?.id === s.id ? " is-active" : ""}`}
                  onClick={() => run(s)}
                  disabled={loadingId === s.id}
                >
                  <span className="cs-sample-label">{s.label}</span>
                  <span className="cs-sample-input">{s.input}</span>
                  <span className="cs-sample-note">{s.note}</span>
                  <span className="cs-sample-expect">expect {s.expected_decision}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="cs-result" aria-live="polite">
          <h3>Scan result</h3>
          {!result && !loadingId && (
            <p className="cs-empty">Pick a payload. Start with Arabizi or Arabic digits.</p>
          )}
          {loadingId && <p className="cs-empty">Scanning…</p>}
          {result && (
            <div className="cs-card">
              <div className="cs-verdict-row">
                <DecisionBadge decision={result.decision} />
                <span className="cs-score">{Math.round((result.risk_score || 0) * 100)}% risk</span>
                {result.sybil_suspect && <span className="cs-sybil">SWARM · SYBIL</span>}
              </div>

              {(result.decision || "").toUpperCase() === "BLOCK" && (
                <button
                  type="button"
                  className={`cs-hold-block${blockArmed ? " is-armed" : ""}`}
                  onMouseDown={onHoldStart}
                  onMouseUp={onHoldEnd}
                  onMouseLeave={onHoldEnd}
                  onTouchStart={onHoldStart}
                  onTouchEnd={onHoldEnd}
                >
                  {blockArmed ? "BLOCK confirmed (field-safe)" : "Hold to confirm BLOCK"}
                </button>
              )}

              <dl className="cs-dl">
                <div>
                  <dt>Raw input</dt>
                  <dd>
                    <code>{result.input || active?.input}</code>
                  </dd>
                </div>
                <div>
                  <dt>Normalised</dt>
                  <dd>
                    <code>{result.normalised_input || "—"}</code>
                  </dd>
                </div>
                <div>
                  <dt>Script</dt>
                  <dd>{result.script_detected || "—"}</dd>
                </div>
                <div>
                  <dt>Attack class</dt>
                  <dd>{result.attack_class || "—"}</dd>
                </div>
                <div>
                  <dt>Patterns</dt>
                  <dd>
                    {(result.matched_patterns || []).length
                      ? result.matched_patterns.join(" · ")
                      : "none"}
                  </dd>
                </div>
                <div>
                  <dt>Audit hash (per-scan)</dt>
                  <dd>
                    <code className="cs-hash">{result.audit_hash || "—"}</code>
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
