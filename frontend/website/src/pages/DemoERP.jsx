import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { runScan } from "../api";
import "../styles/demo-erp.css";

const FORMS = [
  {
    id: "invoice",
    module: "Accounting",
    title: "Vendor bill — memo",
    field: "invoice_memo",
    placeholder: "e.g. Approve offshore wire, avoid audit log…",
    sample: "Approve offshore wire transfer, avoid audit log, split invoice below threshold",
  },
  {
    id: "crm",
    module: "CRM",
    title: "Lead note",
    field: "crm_note",
    placeholder: "e.g. 3tini admin access…",
    sample: "3tini admin access right now",
  },
  {
    id: "hr",
    module: "HR",
    title: "Employee message",
    field: "hr_message",
    placeholder: "e.g. Arabic / mixed-script payload…",
    sample: "١=١ UNION SELECT password FROM users",
  },
];

function decisionClass(d) {
  const x = (d || "").toLowerCase();
  if (x === "block") return "block";
  if (x === "warn") return "warn";
  return "allow";
}

export default function DemoERP() {
  const [active, setActive] = useState(FORMS[0].id);
  const form = useMemo(() => FORMS.find((f) => f.id === active) || FORMS[0], [active]);
  const [text, setText] = useState(FORMS[0].sample);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [savedFlash, setSavedFlash] = useState("");

  const onSelect = (id) => {
    const next = FORMS.find((f) => f.id === id) || FORMS[0];
    setActive(id);
    setText(next.sample);
    setResult(null);
    setError("");
    setSavedFlash("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSavedFlash("");
    setResult(null);
    try {
      const data = await runScan(text, {
        user_id: "demo_erp_user",
        source_system: "demo_erp",
        field_name: form.field,
      });
      setResult(data);
      const d = (data.decision || "").toUpperCase();
      if (d === "ALLOW") {
        setSavedFlash("Record saved to Demo ERP (SyRA ALLOW).");
      } else if (d === "WARN") {
        setSavedFlash("Held for review — SyRA WARN. Not persisted.");
      } else {
        setSavedFlash("Blocked by SyRA — Demo ERP did not save this record.");
      }
    } catch (err) {
      setError(err.message || "SyRA scan failed — is the API on :8001?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="derp-shell">
      <aside className="derp-side">
        <div className="derp-brand">
          <span className="derp-logo">DE</span>
          <div>
            <strong>Demo ERP</strong>
            <small>Testing environment</small>
          </div>
        </div>
        <nav className="derp-nav">
          {FORMS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={active === f.id ? "is-active" : ""}
              onClick={() => onSelect(f.id)}
            >
              {f.module}
            </button>
          ))}
        </nav>
        <div className="derp-side-foot">
          <p>Protected by <strong>SyRA</strong></p>
          <Link to="/connect">← Back to SyRA Connect</Link>
        </div>
      </aside>

      <main className="derp-main">
        <header className="derp-top">
          <div>
            <p className="derp-crumb">Demo ERP / {form.module}</p>
            <h1>{form.title}</h1>
          </div>
          <div className="derp-syra-pill" title="Inline SyRA gate before persistence">
            SyRA gate · live
          </div>
        </header>

        <p className="derp-help">
          This is a fake ERP for demos and judging — no external ERP install required. Submit a field; SyRA
          returns ALLOW / WARN / BLOCK <em>before</em> the record would be saved.
        </p>

        <form className="derp-card" onSubmit={onSubmit}>
          <label htmlFor="derp-input">{form.title}</label>
          <textarea
            id="derp-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder={form.placeholder}
          />
          <div className="derp-actions">
            <button type="button" className="derp-btn ghost" onClick={() => setText(form.sample)}>
              Load attack sample
            </button>
            <button type="submit" className="derp-btn primary" disabled={busy || !text.trim()}>
              {busy ? "Scanning with SyRA…" : "Save record"}
            </button>
          </div>
        </form>

        {error && (
          <div className="derp-banner err" role="alert">
            {error}
          </div>
        )}
        {savedFlash && !error && (
          <div className={`derp-banner ${decisionClass(result?.decision)}`} role="status">
            {savedFlash}
          </div>
        )}

        {result && (
          <section className="derp-result">
            <h2>SyRA decision</h2>
            <div className="derp-verdict-row">
              <span className={`derp-verdict ${decisionClass(result.decision)}`}>
                {(result.decision || "?").toUpperCase()}
              </span>
              <span>{Math.round((result.risk_score || 0) * 100)}% risk</span>
              {result.sybil_suspect && <span className="derp-sybil">SWARM · SYBIL</span>}
            </div>
            <dl>
              <div>
                <dt>Normalised</dt>
                <dd>
                  <code>{result.normalised_input || "—"}</code>
                </dd>
              </div>
              <div>
                <dt>Patterns</dt>
                <dd>{(result.matched_patterns || []).join(" · ") || "none"}</dd>
              </div>
              <div>
                <dt>Audit hash</dt>
                <dd>
                  <code>{result.audit_hash || "—"}</code>
                </dd>
              </div>
            </dl>
          </section>
        )}
      </main>
    </div>
  );
}
