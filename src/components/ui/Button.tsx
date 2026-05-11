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

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-da-indigo text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] hover:bg-da-indigo/90",
  secondary:
    "bg-da-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:bg-da-purple/90",
  accent:
    "bg-da-cyan text-da-dark font-semibold shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_35px_rgba(0,212,255,0.6)] hover:bg-da-cyan/90",
  outline:
    "border border-da-border text-da-text hover:border-da-indigo/60 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:bg-da-indigo/5",
  ghost: "text-da-muted hover:text-da-text hover:bg-da-surface/50",
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

  const baseStyles =
    "relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 cursor-pointer glow-button";
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  // Sound handlers
  const handleHover = hasSound ? () => play("hover") : undefined;
  const handleMouseDown = hasSound
    ? () => play(variant === "accent" ? "activate" : "click")
    : undefined;

  const motionProps = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
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
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
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
