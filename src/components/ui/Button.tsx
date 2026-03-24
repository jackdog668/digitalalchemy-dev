import Link from "next/link";
import type { ReactNode } from "react";

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
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-da-indigo hover:bg-da-indigo/80 text-white shadow-lg shadow-da-indigo/25 hover:shadow-da-indigo/40",
  secondary:
    "bg-da-purple hover:bg-da-purple/80 text-white shadow-lg shadow-da-purple/25",
  accent:
    "bg-da-amber hover:bg-da-amber/90 text-da-dark font-semibold shadow-lg shadow-da-amber/25",
  outline:
    "border border-da-border hover:border-da-indigo/50 text-da-text hover:bg-da-surface",
  ghost: "text-da-muted hover:text-da-text hover:bg-da-surface/50",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  external = false,
  className = "",
  onClick,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 cursor-pointer";
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={styles}>
      {children}
    </button>
  );
}
