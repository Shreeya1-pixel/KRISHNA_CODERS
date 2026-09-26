/*
 * Connect Demo ERP → opens in-app testing ERP at /erp-demo (SyRA-gated forms).
 * No third-party ERP install required.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Drawer from "../components/Drawer";
import { useToast } from "../components/Toast";
import { fetchBackendHealth, fetchFullStats, testEndpoint } from "../api";
import { getApiKey, markErpConnected, loadConnections } from "../utils/connections";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

function ErpCard({ icon, name, status, statusClass, children, primary, secondary }) {
  return (
    <div className="syra-erp-card">
      <div className="syra-erp-card-top">
        <div className="syra-erp-icon">{icon}</div>
        <div>
          <h3>{name}</h3>
          <span className={`syra-status-badge ${statusClass}`}>{status}</span>
        </div>
      </div>
      <div className="syra-erp-card-body">{children}</div>
      <div className="syra-erp-card-actions">
        {primary}
        {secondary}
      </div>
    </div>
  );
}

export default function Connect() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [syraUp, setSyraUp] = useState(false);
  const [demoMetrics, setDemoMetrics] = useState({ lastScan: null, blockedToday: 0 });
  const [drawer, setDrawer] = useState(null);
  const [testUrl, setTestUrl] = useState("");
  const [testResult, setTestResult] = useState(null);
  const apiKey = getApiKey();

  useEffect(() => {
    const poll = async () => {
      try {
        await fetchBackendHealth();
        setSyraUp(true);
        markErpConnected("demo_erp", { url: "/erp-demo", status: "connected" });
      } catch {
        setSyraUp(false);
      }
      try {
        const stats = await fetchFullStats();
        const rows = (stats?.recent_decisions || []).filter((r) => {
          const s = (r.source_system || "").toLowerCase();
          return s === "demo_erp" || s.includes("demo");
        });
        const today = new Date().toISOString().slice(0, 10);
        setDemoMetrics({
          lastScan: rows[0]?.time || null,
          blockedToday: rows.filter(
            (r) => r.decision === "BLOCK" && String(r.time || "").startsWith(today)
          ).length,
        });
      } catch {
        /* optional */
      }
    };
    poll();
    const t = setInterval(poll, 8000);
    return () => clearInterval(t);
  }, []);

  const openDemoErp = () => {
    showToast("Opening Demo ERP (SyRA-gated)…");
    navigate("/erp-demo");
  };

  const closeDrawer = () => {
    setDrawer(null);
    setTestUrl("");
    setTestResult(null);
  };

  const runTest = async (erpId) => {
    if (!testUrl.trim()) {
      setTestResult({ ok: false, msg: "Enter an endpoint URL" });
      return;
    }
    const ok = await testEndpoint(testUrl.trim());
    setTestResult({ ok, msg: ok ? "Connection successful" : "Could not reach endpoint" });
    if (ok) markErpConnected(erpId, { endpoint: testUrl.trim() });
  };

  const copyKey = () => {
    navigator.clipboard?.writeText(apiKey);
    showToast("API key copied");
  };

  return (
    <div className="syra-page">
      <div className="syra-page-header">
        <h2>Connect to Your ERP System</h2>
        <p>
          SyRA works as a security layer in front of any ERP. Use <strong>Demo ERP</strong> for
          live demos and testing — no external ERP install required.
        </p>
      </div>

      <div className="syra-erp-grid">
        <ErpCard
          icon="DE"
          name="Demo ERP"
          status={syraUp ? "● Connected to SyRA" : "○ SyRA offline"}
          statusClass={syraUp ? "connected" : "idle"}
          primary={
            <button type="button" className="sim-run-btn" onClick={openDemoErp} disabled={!syraUp}>
              Open Demo ERP →
            </button>
          }
          secondary={
            <Link to="/logs?source=demo_erp" className="syra-btn-muted">
              View Demo ERP logs
            </Link>
          }
        >
          {syraUp ? (
            <>
              <p>Last scan: {formatTime(demoMetrics.lastScan)}</p>
              <p>Blocked today: {demoMetrics.blockedToday}</p>
              <p className="syra-muted">In-app testing ERP · Accounting / CRM / HR forms</p>
            </>
          ) : (
            <p className="syra-muted">Start SyRA API on port 8001 to enable Demo ERP</p>
          )}
        </ErpCard>

        <ErpCard
          icon="SAP"
          name="SAP"
          status="○ Not connected"
          statusClass="idle"
          primary={
            <button type="button" className="sim-run-btn" onClick={() => setDrawer("sap")}>
              Connect via REST API
            </button>
          }
        >
          <p className="syra-muted">Enterprise SAP integration via SyRA REST API</p>
        </ErpCard>

        <ErpCard
          icon="SF"
          name="Salesforce"
          status="○ Not connected"
          statusClass="idle"
          primary={
            <button type="button" className="sim-run-btn" onClick={() => setDrawer("salesforce")}>
              Connect via Apex
            </button>
          }
        >
          <p className="syra-muted">Salesforce Apex trigger integration</p>
        </ErpCard>

        <ErpCard
          icon="{ }"
          name="Custom ERP"
          status="○ Not connected"
          statusClass="idle"
          primary={
            <button type="button" className="sim-run-btn" onClick={() => setDrawer("custom")}>
              Connect via Python SDK
            </button>
          }
        >
          <p className="syra-muted">Any system using the SyRA Python SDK</p>
        </ErpCard>

        <ErpCard
          icon="↯"
          name="Webhook (Any System)"
          status="○ Not connected"
          statusClass="idle"
          primary={
            <button type="button" className="sim-run-btn" onClick={() => setDrawer("webhook")}>
              Connect via Webhook
            </button>
          }
        >
          <p className="syra-muted">Forward payloads to SyRA from any HTTP client</p>
        </ErpCard>
      </div>

      <Drawer open={drawer === "sap"} title="Connect SAP to SyRA" onClose={closeDrawer}>
        <p><strong>Step 1:</strong> Copy your API key</p>
        <div className="syra-key-row">
          <code>{apiKey}</code>
          <button type="button" className="syra-refresh-btn" onClick={copyKey}>Copy</button>
        </div>
        <p><strong>Step 2:</strong> Add this to your SAP system</p>
        <pre className="syra-code">{`curl -X POST ${BACKEND_URL}/v1/scan \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"input":"{{payload}}","context":{"source_system":"sap","user_id":"{{user}}"}}'`}</pre>
        <p><strong>Step 3:</strong> Test connection</p>
        <input
          className="syra-input"
          placeholder="https://your-sap-gateway/health"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
        />
        <button type="button" className="sim-run-btn" onClick={() => runTest("sap")}>Test</button>
        {testResult && <p className={testResult.ok ? "syra-ok" : "syra-err"}>{testResult.msg}</p>}
      </Drawer>

      <Drawer open={drawer === "salesforce"} title="Connect Salesforce to SyRA" onClose={closeDrawer}>
        <p><strong>Step 1:</strong> Copy your API key</p>
        <div className="syra-key-row">
          <code>{apiKey}</code>
          <button type="button" className="syra-refresh-btn" onClick={copyKey}>Copy</button>
        </div>
        <p><strong>Step 2:</strong> Apex trigger snippet</p>
        <pre className="syra-code">{`HttpRequest req = new HttpRequest();
req.setEndpoint('${BACKEND_URL}/v1/scan');
req.setMethod('POST');
req.setHeader('Authorization', 'Bearer ${apiKey}');
req.setHeader('Content-Type', 'application/json');
req.setBody('{"input":"' + input + '","context":{"source_system":"salesforce"}}');
HttpResponse res = new Http().send(req);`}</pre>
        <p><strong>Step 3:</strong> Test connection</p>
        <input className="syra-input" placeholder="Salesforce endpoint URL" value={testUrl} onChange={(e) => setTestUrl(e.target.value)} />
        <button type="button" className="sim-run-btn" onClick={() => runTest("salesforce")}>Test</button>
        {testResult && <p className={testResult.ok ? "syra-ok" : "syra-err"}>{testResult.msg}</p>}
      </Drawer>

      <Drawer open={drawer === "custom"} title="Connect Custom ERP to SyRA" onClose={closeDrawer}>
        <p><strong>Step 1:</strong> Copy your API key</p>
        <div className="syra-key-row">
          <code>{apiKey}</code>
          <button type="button" className="syra-refresh-btn" onClick={copyKey}>Copy</button>
        </div>
        <p><strong>Step 2:</strong> Python SDK</p>
        <pre className="syra-code">{`from syra_sdk import SyRAClient

client = SyRAClient(api_key="${apiKey}", base_url="${BACKEND_URL}")
result = client.scan("user input", source_system="custom_erp")
print(result.decision, result.risk_score)`}</pre>
        <p><strong>Step 3:</strong> Test connection</p>
        <input className="syra-input" placeholder="http://your-erp/health" value={testUrl} onChange={(e) => setTestUrl(e.target.value)} />
        <button type="button" className="sim-run-btn" onClick={() => runTest("custom")}>Test</button>
        {testResult && <p className={testResult.ok ? "syra-ok" : "syra-err"}>{testResult.msg}</p>}
      </Drawer>

      <Drawer open={drawer === "webhook"} title="Connect via Webhook" onClose={closeDrawer}>
        <p><strong>Step 1:</strong> Copy your API key</p>
        <div className="syra-key-row">
          <code>{apiKey}</code>
          <button type="button" className="syra-refresh-btn" onClick={copyKey}>Copy</button>
        </div>
        <p><strong>Step 2:</strong> Webhook curl</p>
        <pre className="syra-code">{`curl -X POST ${BACKEND_URL}/v1/scan \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"input":"PAYLOAD_FROM_YOUR_SYSTEM","context":{"source_system":"webhook"}}'`}</pre>
        <p><strong>Step 3:</strong> Test connection</p>
        <input className="syra-input" placeholder="Webhook receiver URL" value={testUrl} onChange={(e) => setTestUrl(e.target.value)} />
        <button type="button" className="sim-run-btn" onClick={() => runTest("webhook")}>Test</button>
        {testResult && <p className={testResult.ok ? "syra-ok" : "syra-err"}>{testResult.msg}</p>}
      </Drawer>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}
