import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBackendHealth, fetchFullStats } from "../api";
import { countReachableConnections, loadConnections, markErpConnected } from "../utils/connections";

function StatCard({ label, value, accent }) {
  return (
    <div className={`syra-stat-card${accent ? ` accent-${accent}` : ""}`}>
      <div className="syra-stat-value">{value}</div>
      <div className="syra-stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [syraUp, setSyraUp] = useState(false);
  const [connectedCount, setConnectedCount] = useState(0);

  useEffect(() => {
    const refresh = async () => {
      let up = false;
      try {
        await fetchBackendHealth();
        up = true;
        setSyraUp(true);
        markErpConnected("demo_erp", { url: "/erp-demo" });
      } catch {
        setSyraUp(false);
      }
      try {
        const full = await fetchFullStats();
        setStats(full);
      } catch {
        setStats(null);
      }
      const conns = loadConnections();
      setConnectedCount(countReachableConnections(up, conns));
    };
    refresh();
    const t = setInterval(refresh, 8000);
    return () => clearInterval(t);
  }, []);

  const summary = stats?.summary || {};

  return (
    <div className="syra-page">
      <div className="syra-page-header">
        <h2>Business Risk Dashboard</h2>
        <p>
          Real-time business risk decisions. Use{" "}
          <Link to="/erp-demo">Demo ERP</Link> for the live testing environment.
        </p>
      </div>

      <div className="syra-stat-grid">
        <StatCard label="Total Scans" value={summary.total_scans ?? "—"} />
        <StatCard label="Blocked" value={summary.blocked ?? "—"} accent="danger" />
        <StatCard label="LLM Calls Saved" value={`${summary.llm_calls_saved_pct ?? 0}%`} />
        <StatCard label="Avg Risk Score" value={summary.avg_score ?? "—"} />
        <StatCard label="Open Investigations" value={summary.active_investigations ?? 0} />
      </div>

      <Link to="/connect" className="syra-erp-banner">
        <span>
          SyRA is connected to <strong>{connectedCount}</strong> ERP system
          {connectedCount === 1 ? "" : "s"}
        </span>
        <span className="syra-erp-banner-cta">Manage Connections →</span>
      </Link>

      <div className="syra-card">
        <h3>Recent Decisions</h3>
        {!stats?.recent_decisions?.length ? (
          <p className="syra-muted">
            No decisions yet. Run a scan from /demo or open{" "}
            <Link to="/erp-demo">Demo ERP</Link>.
          </p>
        ) : (
          <table className="syra-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Source</th>
                <th>Risk</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_decisions.slice(0, 8).map((row) => (
                <tr key={row.request_id || row.time}>
                  <td>{formatTime(row.time)}</td>
                  <td>{row.source_system || "—"}</td>
                  <td>{Math.round((row.risk_score || 0) * 100)}%</td>
                  <td>
                    <span className={`decision-badge ${decisionClass(row.decision)}`}>
                      {row.decision}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="syra-dashboard-footer">
        <div className="syra-status-strip">
          <span>SyRA API: {syraUp ? "Connected" : "Offline"}</span>
          <span>Demo ERP: {syraUp ? "Ready" : "Needs SyRA"}</span>
        </div>
      </div>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString();
  } catch {
    return "—";
  }
}

function decisionClass(d) {
  const x = (d || "").toLowerCase();
  if (x === "block") return "block";
  if (x === "warn") return "warn";
  return "allow";
}
