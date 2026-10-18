"use client";

import { useEffect, useState } from "react";

const START = 9;

// Arcade "CONTINUE?" screen: counts 9 → 0 once, then asks for a coin.
// It never navigates on its own; the link next to it is the way out.
export function ContinueCountdown() {
  const [n, setN] = useState(START);

  useEffect(() => {
    if (n === 0) return;
    const t = setTimeout(() => setN(n - 1), 1000);
    return () => clearTimeout(t);
  }, [n]);

  if (n === 0) {
    return (
      <p className="pixel text-sm text-yellow motion-safe:animate-[blink_1.2s_steps(1,end)_infinite]">
        INSERTA UNA MONEDA
      </p>
    );
  }

  return (
    <p className="pixel flex items-baseline justify-center gap-4 text-sm text-ink-dim">
      CONTINUE?
      <span
        key={n}
        aria-live="off"
        className="neon-yellow text-3xl motion-safe:animate-[blink_1s_steps(1,end)_1]"
      >
        {n}
      </span>
    </p>
  );
}
