"use client";

/**
 * MagneticWrapper — subtle magnetic pull effect on mouse proximity.
 *
 * The element translates toward the cursor while it hovers, then
 * springs back to its resting position on mouse leave.
 * Uses framer-motion springs so the return feels physical, not instant.
 *
 * Usage:
 *   <MagneticWrapper>
 *     <button className="glow-button ...">Get Started</button>
 *   </MagneticWrapper>
 *
 *   // Stronger pull
 *   <MagneticWrapper strength={0.5}>
 *     <IconButton />
 *   </MagneticWrapper>
 */

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode } from "react";
import { useCallback, useRef } from "react";

interface MagneticWrapperProps {
  children: ReactNode;
  className?: string;
  /**
   * Fraction of the cursor offset that is applied as translate.
   * 0.3 = 30% of the distance to cursor centre.
   * Keep below 0.6 to avoid feeling unstable.
   */
  strength?: number;
}

export function MagneticWrapper({
  children,
  className = "",
  strength = 0.3,
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring config: responsive enough to track the cursor, but with enough
  // damping that the element doesn't oscillate on mouse leave.
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  // Throttle mousemove to ~60fps via rAF to avoid layout thrashing
  const rafId = useRef<number>(0);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        if (!ref.current) {
          rafId.current = 0;
          return;
        }
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * strength);
        y.set((e.clientY - centerY) * strength);
        rafId.current = 0;
      });
    },
    [strength, x, y],
  );

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
