"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";

// Usage example:
// <AnimatedCounter value={500} suffix="+" label="Students Enrolled" />

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  label: string;
}

// easeOutExpo gives a fast start that decelerates to a precise stop —
// feels snappy and intentional vs a linear or ease-in-out counter.
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedCounter({
  value,
  suffix = "",
  label,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // useInView from framer-motion — fires once when 50px of the element
  // enters the viewport. Cleaner than a manual IntersectionObserver.
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const animate = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);

    const duration = 2000; // ms
    const startTime = performance.now();

    // requestAnimationFrame runs at the display refresh rate (typically 60fps),
    // giving smooth interpolation vs setInterval's fixed ~16ms tick that can
    // drift and cause visual stuttering.
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      setCount(Math.floor(easedProgress * value));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Clamp to exact target value at animation end
        setCount(value);
      }
    }

    requestAnimationFrame(tick);
  }, [value, hasAnimated]);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      animate();
    }
  }, [isInView, hasAnimated, animate]);

  return (
    <div ref={ref} className="text-center">
      <motion.div
        className="font-display text-4xl font-bold text-da-text sm:text-5xl"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        {count}
        <span className="text-da-cyan">{suffix}</span>
      </motion.div>
      <div className="mt-1 text-sm text-da-muted uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
