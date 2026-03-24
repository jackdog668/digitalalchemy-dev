"use client";

/**
 * GlowOrb — ambient background glow sphere.
 *
 * Replaces the static CSS `animate-float` class with a framer-motion
 * keyframe sequence. The multi-axis movement (y, x, scale, opacity)
 * produces an organic, breathing quality that a single-axis CSS
 * animation cannot achieve.
 *
 * Usage:
 *   // Basic indigo orb, medium size
 *   <GlowOrb />
 *
 *   // Custom positioning
 *   <GlowOrb color="purple" size="lg" className="-top-32 -right-32" />
 *   <GlowOrb color="amber"  size="sm" className="bottom-0 left-1/2" />
 *
 * Accessibility: always aria-hidden — purely decorative.
 */

import { motion } from "framer-motion";

interface GlowOrbProps {
  color?: "indigo" | "purple" | "amber";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorMap = {
  indigo: "bg-da-indigo/20",
  purple: "bg-da-purple/20",
  amber:  "bg-da-amber/15",
};

const sizeMap = {
  sm: "w-48 h-48",
  md: "w-72 h-72",
  lg: "w-96 h-96",
};

export function GlowOrb({
  color = "indigo",
  size = "md",
  className = "",
}: GlowOrbProps) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${colorMap[color]} ${sizeMap[size]} ${className}`}
      aria-hidden="true"
      animate={{
        // Multi-axis keyframe sequence for an organic, alive feel
        y:       [0, -15,   5, -10,  0],
        x:       [0,   8,  -5,  10,  0],
        scale:   [1, 1.05, 0.98, 1.03, 1],
        opacity: [0.2, 0.3, 0.18, 0.25, 0.2],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
