import { useEffect, useRef, useState } from "react";

/**
 * Exhaustion-safe BLOCK confirm for Glare / Field Mode.
 * ALLOW is one tap elsewhere; BLOCK requires a sustained press.
 */
export default function HoldToConfirm({
  label = "Hold to confirm BLOCK",
  holdMs = 900,
  onConfirm,
  disabled = false,
}) {
  const [progress, setProgress] = useState(0);
  const raf = useRef(null);
  const start = useRef(0);
  const done = useRef(false);

  const clear = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    start.current = 0;
    if (!done.current) setProgress(0);
  };

  const tick = (ts) => {
    if (!start.current) start.current = ts;
    const p = Math.min(1, (ts - start.current) / holdMs);
    setProgress(p);
    if (p >= 1) {
      done.current = true;
      onConfirm?.();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };

  const begin = (e) => {
    if (disabled) return;
    e.preventDefault();
    done.current = false;
    start.current = 0;
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => clear(), []);

  return (
    <button
      type="button"
      className={`cs-action block hold-confirm ${disabled ? "done" : ""}`}
      disabled={disabled}
      onPointerDown={begin}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
      aria-label={label}
    >
      <span className="hold-fill" style={{ transform: `scaleX(${progress})` }} />
      <span className="hold-label">{label}</span>
    </button>
  );
}
