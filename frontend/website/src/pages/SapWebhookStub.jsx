import { useState } from "react";
import { Link } from "react-router-dom";
import { postSapWebhook } from "../api";
import "../styles/demo-erp.css";

const SAMPLES = [
  {
    id: "clean",
    label: "Clean BP note",
    note: "Please update ship-to address for customer 1000234 before Friday.",
  },
  {
    id: "arabizi",
    label: "Arabizi privilege",
    note: "3tini admin access right now",
  },
  {
    id: "sql",
    label: "Arabic-digit SQLi",
    note: "١=١ UNION SELECT password FROM users",
  },
];

/**
 * Second live ERP target — SAP Event Mesh / Gateway shaped webhook stub.
 * Proves any-HTTP-ERP beyond Demo ERP; not a certified SAP connector.
 */
export default function SapWebhookStub() {
  const [note, setNote] = useState(SAMPLES[1].note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const fire = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const data = await postSapWebhook({
        eventType: "BusinessPartner.Changed",
        sapSystemId: "S4HANA-DEMO",
        userId: "SAP_BP_SERVICE",
        businessObject: "BusinessPartner",
        note,
        payload: { LONG_TEXT: note },
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "SAP stub call failed — is SyRA on :8001?");
    } finally {
      setBusy(false);
    }
  };

  const syra = result?.syra || {};
  const decision = (syra.decision || "").toUpperCase();

  return (
    <div className="derp-shell">
      <aside className="derp-side">
        <div className="derp-brand">
          <span className="derp-logo">SAP</span>
          <div>
            <strong>SAP webhook stub</strong>
            <small>Second ERP target</small>
          </div>
        </div>
        <nav className="derp-nav">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={note === s.note ? "is-active" : ""}
              onClick={() => {
                setNote(s.note);
                setResult(null);
                setError("");
              }}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="derp-side-foot">
          <p>
            Live adapter: <code>POST /v1/adapters/sap/webhook</code>
          </p>
          <Link to="/connect">← Connect</Link>
        </div>
      </aside>

      <main className="derp-main">
        <header className="derp-top">
          <div>
            <p className="derp-crumb">Adapters · SAP Event Mesh shape</p>
            <h1>BusinessPartner long text → SyRA</h1>
          </div>
          <div className="derp-syra-pill" title="Second ERP HTTP shape">
            source_system: sap_webhook_stub
          </div>
        </header>

        <p className="derp-help">
          Stub only — proves a second HTTP ERP shape against SyRA. Not a certified SAP connector.
        </p>

        <form className="derp-card" onSubmit={fire}>
          <label htmlFor="sap-note">SAP long text / note</label>
          <textarea
            id="sap-note"
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Paste BP note…"
          />
          <div className="derp-actions">
            <button type="submit" className="derp-btn primary" disabled={busy || !note.trim()}>
              {busy ? "Calling adapter…" : "POST SAP webhook stub"}
            </button>
          </div>
        </form>

        {error && (
          <div className="derp-banner err" role="alert">
            {error}
          </div>
        )}

        {result && (
          <div className="derp-result">
            <div className="derp-verdict-row">
              <span className={`derp-verdict ${decision.toLowerCase() || "allow"}`}>
                {decision || "—"}
              </span>
              <span className="derp-sybil">ERP action: {result.erp_action}</span>
              {syra.sybil_suspect && <span className="derp-sybil">SWARM · SYBIL</span>}
            </div>
            <p className="derp-help">{result.note}</p>
            <dl>
              <div>
                <dt>Extracted text</dt>
                <dd>
                  <code>{result.extracted_text}</code>
                </dd>
              </div>
              <div>
                <dt>scan_id</dt>
                <dd>
                  <code>{syra.scan_id || "—"}</code>
                </dd>
              </div>
              <div>
                <dt>audit_hash (per-scan)</dt>
                <dd>
                  <code>{syra.audit_hash || "—"}</code>
                </dd>
              </div>
            </dl>
          </div>
        )}
      </main>
    </div>
  );
}
