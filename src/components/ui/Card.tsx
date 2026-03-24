import type { ReactNode } from "react";

type Variant = "default" | "glow" | "feature";

interface CardProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  default:
    "bg-da-surface border border-da-border hover:border-da-surface-light",
  glow: "bg-da-surface border border-da-indigo/30 hover:border-da-indigo/60 shadow-lg shadow-da-indigo/5 hover:shadow-da-indigo/15",
  feature:
    "bg-gradient-to-br from-da-surface to-da-dark border border-da-border hover:border-da-purple/40",
};

export function Card({
  children,
  variant = "default",
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 transition-all duration-300 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
