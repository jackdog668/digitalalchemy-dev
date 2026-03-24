"use client";

interface GlowOrbProps {
  color?: "indigo" | "purple" | "amber";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorMap = {
  indigo: "bg-da-indigo/20",
  purple: "bg-da-purple/20",
  amber: "bg-da-amber/20",
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
    <div
      className={`absolute rounded-full blur-3xl animate-float ${colorMap[color]} ${sizeMap[size]} ${className}`}
      aria-hidden="true"
    />
  );
}
