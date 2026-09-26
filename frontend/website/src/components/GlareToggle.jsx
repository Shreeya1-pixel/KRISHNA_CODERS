import { useEffect, useState } from "react";

const STORAGE_KEY = "safeo_glare_mode";

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

/** Global Field / Glare Mode toggle (Theme 03). Works even if backend is down. */
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
      title="Field / Glare Mode — extreme contrast for outdoor use"
      aria-pressed={on}
    >
      {on ? "Glare ON" : "Glare Mode"}
    </button>
  );
}
