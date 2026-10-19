"use client";

import { useEffect, useRef, useState } from "react";

// Wraps a Home section: it starts hidden (.reveal) and gets .in the first
// time it enters the viewport.
export function Reveal({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`reveal ${className}${shown ? " in" : ""}`.trim()}
    >
      {children}
    </section>
  );
}
