"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  label: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  label,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          // Animate counting up
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl font-bold text-da-text sm:text-5xl">
        {count}
        <span className="text-da-amber">{suffix}</span>
      </div>
      <div className="mt-1 text-sm text-da-muted uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
