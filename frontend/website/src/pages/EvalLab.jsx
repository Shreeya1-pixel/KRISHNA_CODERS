import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchCodeSwitchEval, fetchBackendHealth } from "../api";

/**
 * Live Theme-01 eval harness — runs n≥12 (extended n=30) against the engine
 * and shows precision / recall / FPR a judge can refresh in-browser.
 */
export default function EvalLab() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(null);

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const [evalRes, h] = await Promise.all([
        fetchCodeSwitchEval(),
        fetchBackendHealth().catch(() => null),
      ]);
      setData(evalRes);
      setHealth(h);
    } catch (e) {
      setError(e.message || "Eval failed — is SyRA on :8001?");
    } finally {
      setBusy(false);
    }
  };

  const s = data?.summary || {};
  const ad = s.attack_detection || {};

  return (
    <div className="syra-page">
      <div className="syra-page-header">
        <h2>Live eval harness</h2>
        <p>
          Runs the labeled Theme-01 set against the live engine (
          <code>GET /v1/eval/code-switch</code>). Not a production benchmark — kept
          misses stay visible.
        </p>
      </div>

      <div className="syra-card" style={{ marginBottom: 16 }}>
        <button type="button" className="sim-run-btn" onClick={run} disabled={busy}>
          {busy ? "Running eval…" : "Run live eval"}
        </button>
        {health?.live_path && (
          <p className="syra-muted" style={{ marginTop: 12 }}>
            Live path: Tier-1 ✅ · Tier-2 {health.live_path.tier2 ? `✅ (${health.tier2_backend})` : "○"} ·
            Tier-3 {health.live_path.tier3_llm ? "✅" : "○ off"} · Swarm Guard ✅ · LoRA controller{" "}
            {health.lora?.controller_ready ? "✅" : "○"}
          </p>
        )}
      </div>

      {error && <p className="syra-err">{error}</p>}

      {s.n != null && (
        <div className="syra-stat-grid">
          <div className="syra-stat-card">
            <div className="syra-stat-value">{s.n}</div>
            <div className="syra-stat-label">Labeled samples</div>
          </div>
          <div className="syra-stat-card">
            <div className="syra-stat-value">{(ad.precision ?? 0).toFixed(2)}</div>
            <div className="syra-stat-label">Precision</div>
          </div>
          <div className="syra-stat-card">
            <div className="syra-stat-value">{(ad.recall ?? 0).toFixed(2)}</div>
            <div className="syra-stat-label">Recall</div>
          </div>
          <div className="syra-stat-card">
            <div className="syra-stat-value">{(ad.false_positive_rate ?? 0).toFixed(2)}</div>
            <div className="syra-stat-label">FPR</div>
          </div>
          <div className="syra-stat-card">
            <div className="syra-stat-value">
              {s.exact_match}/{s.n}
            </div>
            <div className="syra-stat-label">Exact match</div>
          </div>
        </div>
      )}

      {s.misses?.length > 0 && (
        <div className="syra-card" style={{ marginTop: 16 }}>
          <h3>Kept misses ({s.misses.length})</h3>
          <table className="syra-table">
            <thead>
              <tr>
                <th>id</th>
                <th>expected</th>
                <th>got</th>
              </tr>
            </thead>
            <tbody>
              {s.misses.map((m) => (
                <tr key={m.id}>
                  <td>
                    <code>{m.id}</code>
                  </td>
                  <td>{m.expected}</td>
                  <td>{m.got}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="syra-muted">{s.disclaimer}</p>
        </div>
      )}

      <p className="syra-muted" style={{ marginTop: 16 }}>
        Also: <Link to="/demo">Code-switch hero</Link> · <Link to="/erp-sap-stub">SAP stub</Link>
      </p>
    </div>
  );
}
