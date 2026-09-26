import { createPortal } from "react-dom";

const BADGE_LABEL = "\u26A1 Powered by Gemma on AMD";

export function GemmaBadgeMarkup({ inline = false }) {
  return (
    <div
      className={`syra-gemma-badge syra-gemma-badge--default${
        inline ? " syra-gemma-badge--inline" : ""
      }`}
      title="Gemma on AMD via Fireworks"
      role="status"
      aria-live="polite"
    >
      <span className="syra-gemma-badge-dot" aria-hidden="true" />
      <span className="syra-gemma-badge-text">{BADGE_LABEL}</span>
    </div>
  );
}

export default function GemmaBadge() {
  return createPortal(<GemmaBadgeMarkup />, document.body);
}
