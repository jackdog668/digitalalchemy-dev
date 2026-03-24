"use client";

/**
 * ShimmerLine — 1px decorative horizontal divider with a sweeping shimmer.
 *
 * Driven entirely by the `.shimmer-line` utility class defined in globals.css.
 * Marked aria-hidden because it is purely decorative.
 *
 * Usage:
 *   <ShimmerLine />
 *   <ShimmerLine className="my-8 opacity-60" />
 */

export function ShimmerLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px w-full shimmer-line ${className}`}
      aria-hidden="true"
    />
  );
}
