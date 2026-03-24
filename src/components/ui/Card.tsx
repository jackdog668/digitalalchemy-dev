"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Usage examples:
// <Card variant="glow"><p>Feature content</p></Card>
// <Card variant="feature" hover={false}>Static content</Card>
// <Card className="col-span-2">Wide card</Card>

type Variant = "default" | "glow" | "feature";

interface CardProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  // Set hover=false to opt out of lift animation (e.g. for static info panels)
  hover?: boolean;
}

const variantStyles: Record<Variant, string> = {
  default:
    "bg-da-surface border border-da-border hover:border-da-surface-light",
  glow: "bg-da-surface border border-da-indigo/20 hover:border-da-indigo/50 shadow-[0_0_0px_rgba(99,102,241,0)] hover:shadow-[0_0_30px_rgba(99,102,241,0.1),0_0_60px_rgba(99,102,241,0.05)]",
  feature:
    "bg-gradient-to-br from-da-surface to-da-dark border border-da-border hover:border-da-purple/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]",
};

export function Card({
  children,
  variant = "default",
  className = "",
  hover = true,
}: CardProps) {
  return (
    <motion.div
      className={`rounded-xl p-6 transition-[border-color,box-shadow] duration-500 ${variantStyles[variant]} ${className}`}
      // Lift + slight scale gives depth without feeling floaty
      whileHover={
        hover
          ? {
              y: -4,
              scale: 1.01,
            }
          : undefined
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
}
