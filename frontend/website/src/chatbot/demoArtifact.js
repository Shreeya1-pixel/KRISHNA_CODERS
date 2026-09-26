/**
 * Prepared foil — generic LLM-style reply vs live SyRA Tier-1+2 scan.
 * Not a live ChatGPT call and not a "we beat ChatGPT" claim: ChatGPT is not a
 * security product. The point is that generic LLMs need a purpose-built
 * pre-processing / detection layer for confusable Unicode.
 */
export const HOMOGRAPH_DEMO_URL = "https://ọpen-ạccess.com/login";

export const CHATGPT_DEMO_RESPONSE = {
  title: "Generic LLM (prepared foil)",
  subtitle: "Not a security product — often treats confusable Unicode as “normal” text",
  verdict: "Looks safe",
  verdictClass: "safe",
  body: [
    "This appears to be a legitimate domain for an open-access login page.",
    "The hostname reads like \"open-access.com\" — a normal academic publishing site.",
    "I don't see obvious malware indicators in the URL structure.",
    "Recommendation: proceed if you were expecting this link.",
  ],
  footnote:
    "Prepared artifact only — illustrates why generic LLMs need a purpose-built pre-processing layer for IDN/homographs. Not a live ChatGPT call or a horse race.",
};

export function buildSyraDemoSummary(scan) {
  if (!scan) return null;
  const url = scan.url_analysis || {};
  return {
    title: "SyRA (Tier-1 + Tier-2)",
    subtitle: "Live scan — purpose-built normalisation + detection (no Tier-3 LLM)",
    verdict: scan.decision === "BLOCK" ? "UNSAFE" : scan.decision === "WARN" ? "CAUTION" : "SAFE",
    verdictClass: scan.decision === "BLOCK" ? "unsafe" : scan.decision === "WARN" ? "warn" : "safe",
    risk_score: scan.risk_score,
    uncertainty_score: scan.uncertainty_score,
    audit_hash: scan.audit_hash,
    mitre: scan.graph_evidence?.mitre_techniques || ["T1566.002"],
    flagged_chars: url.flagged_chars || [],
    host: url.host,
    patterns: scan.matched_patterns || [],
    explanations: scan.explanations || [],
  };
}
