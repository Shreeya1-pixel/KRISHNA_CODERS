import { useEffect, useState } from "react";

const STORAGE_KEY = "syra_glare_mode";

export function getGlareMode() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function applyGlareMode(on) {
  document.documentElement.dataset.glare = on ? "on" : "off";
  try {
    localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/** Field Mode: glare contrast + heat (no motion / large targets) + exhaustion (pair with hold-to-confirm). */
export default function GlareToggle({ className = "" }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const initial = getGlareMode();
    setOn(initial);
    applyGlareMode(initial);
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    applyGlareMode(next);
  };

  return (
    <button
      type="button"
      className={`glare-toggle ${on ? "active" : ""} ${className}`}
      onClick={toggle}
      title="Field Mode — glare contrast, heat-safe (no motion / large targets), exhaustion-safe BLOCK confirm on /demo"
      aria-pressed={on}
    >
      {on ? "Field ON" : "Field Mode"}
    </button>
  );
}
