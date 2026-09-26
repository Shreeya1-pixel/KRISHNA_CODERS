import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchBackendHealth } from "../api";
import GemmaBadge from "./GemmaBadge";
import GlareToggle from "./GlareToggle";

export default function Layout({ children }) {
  const location = useLocation();
  const [backendOk, setBackendOk] = useState(false);

  useEffect(() => {
    const check = () => {
      fetchBackendHealth()
        .then(() => setBackendOk(true))
        .catch(() => setBackendOk(false));
    };
    check();
    const t = setInterval(check, 12000);
    return () => clearInterval(t);
  }, []);

  const navLink = (to, label) => (
    <Link to={to} className={location.pathname === to ? "syra-nav-link active" : "syra-nav-link"}>
      {label}
    </Link>
  );

  return (
    <div className="syra-app">
      <header className="syra-header">
        <Link to="/" className="syra-brand" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="syra-brand-mark">Sy</div>
          <div className="syra-brand-text">
            <h1>SyRA</h1>
            <span>Security decision layer</span>
          </div>
        </Link>
        <nav className="syra-nav">
          {navLink("/demo", "Code-Switch")}
          {navLink("/eval", "Eval")}
          {navLink("/erp-demo", "Demo ERP")}
          {navLink("/app", "Dashboard")}
          {navLink("/connect", "Connect ERP")}
          {navLink("/logs", "Logs")}
          {navLink("/workflow", "Workflow")}
          {navLink("/chat", "Assistant")}
          {navLink("/visual", "Visual")}
        </nav>
        <div className="syra-header-right">
          <GlareToggle />
          <span className={`syra-engine-dot ${backendOk ? "ok" : "off"}`} title={backendOk ? "Engine online" : "Engine offline"} />
          <span className="syra-engine-label">{backendOk ? "Engine online" : "Engine offline"}</span>
          <Link to="/connect" className="sim-run-btn syra-nav-cta">
            Connect to Your ERP →
          </Link>
        </div>
      </header>
      <main className={`syra-main${location.pathname === "/workflow" ? " wf-main-full" : ""}`}>{children}</main>
      <GemmaBadge />
    </div>
  );
}
