"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useSound } from "@/hooks/useSound";

// Usage examples:
// <Button variant="primary" size="lg" href="/join">Get Started</Button>
// <Button variant="accent" onClick={handleClick}>Join Now</Button>
// <Button variant="outline" href="https://x.com" external>Follow Us</Button>

type Variant = "primary" | "secondary" | "accent" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  external?: boolean;
  className?: string;
  onClick?: () => void;
  /** Enable/disable sound. Defaults: on for primary/secondary/accent, off for outline/ghost */
  sound?: boolean;
}

// Arcane palette CTA styles. Sharp 4px corners, neon-green primary,
// glow shadows instead of traditional elevation. Per DA brand bible:
// "Primary actions are neon green. Never another color for primary."
const variantStyles: Record<Variant, string> = {
  primary:
    "bg-neon-green text-[#0A0B0D] font-semibold shadow-[0_0_18px_rgba(64,255,120,0.35)] hover:shadow-[0_0_32px_rgba(64,255,120,0.55)] hover:bg-neon-green/95",
  secondary:
    "bg-mystic-purple text-ink font-semibold shadow-[0_0_18px_rgba(122,48,255,0.35)] hover:shadow-[0_0_32px_rgba(122,48,255,0.55)] hover:bg-mystic-purple/95",
  accent:
    "bg-electro-gold text-[#0A0B0D] font-semibold shadow-[0_0_18px_rgba(255,219,64,0.35)] hover:shadow-[0_0_32px_rgba(255,219,64,0.55)] hover:bg-electro-gold/95",
  outline:
    "border border-hairline text-ink hover:border-neon-green hover:text-neon-green hover:shadow-[0_0_18px_rgba(64,255,120,0.2)]",
  ghost: "text-ink-muted hover:text-ink",
};

// Which variants have sound enabled by default
const soundDefaults: Record<Variant, boolean> = {
  primary: true,
  secondary: true,
  accent: true,
  outline: false,
  ghost: false,
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

// Spring config for snappy but natural feel
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 17,
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  external = false,
  className = "",
  onClick,
  sound,
}: ButtonProps) {
  const { play } = useSound();
  const hasSound = sound ?? soundDefaults[variant];

  // Sharp 4px corners (rounded-da-sm) — DA brand bible: max 8px ever,
  // buttons specifically use --r-sm. Glow-button keeps the sweep on hover.
  const baseStyles =
    "relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-da-sm font-medium transition-all duration-200 cursor-pointer glow-button";
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  // Sound handlers
  const handleHover = hasSound ? () => play("hover") : undefined;
  const handleMouseDown = hasSound
    ? () => play(variant === "accent" ? "activate" : "click")
    : undefined;

  // Brand bible: "translateY(-2px) on buttons. No bounces. No spring
  // physics. Technical, snappy, over fast." Swapped scale → y lift.
  const motionProps = {
    whileHover: { y: -2 },
    whileTap: { y: 0 },
    transition: springTransition,
    onMouseEnter: handleHover,
    onMouseDown: handleMouseDown,
  };

  // External link — motion.a handles the anchor directly
  if (href && external) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles}
        {...motionProps}
      >
        {children}
      </motion.a>
    );
  }

  // Internal link — motion.div wraps Next.js Link since motion can't
  // extend Link without losing its prefetch/navigation behavior
  if (href) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        transition={springTransition}
        onMouseEnter={handleHover}
        onMouseDown={handleMouseDown}
        className="inline-block"
      >
        <Link href={href} className={styles}>
          {children}
        </Link>
      </motion.div>
    );
  }

  // Default button element
  return (
    <motion.button onClick={onClick} className={styles} {...motionProps}>
      {children}
    </motion.button>
  );
}
