"use client";

/**
 * GrainOverlay — fixed full-viewport film grain texture.
 *
 * Key improvements over the previous version:
 *   - Removed `steps()` timing: was producing visible frame-skip jumps
 *   - Duration reduced to 0.5s with `linear` for a smooth, continuous noise loop
 *   - `translate3d()` in the grain keyframe forces GPU compositing (willChange)
 *   - SVG inline approach keeps the grain filter crisp at all viewport sizes
 *   - Opacity lowered to 0.035 — visible enough for texture, invisible enough
 *     to never compete with content
 *
 * Accessibility: pointer-events-none + aria-hidden — fully inert to users.
 *
 * Usage:
 *   // Place once at the top of your layout, outside all content wrappers
 *   <GrainOverlay />
 */

export function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
      style={{ opacity: 0.035 }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="200%"
          height="200%"
          filter="url(#grain)"
          style={{
            // 0.5s linear — no steps(), no frame skipping
            animation: "grain 0.5s linear infinite",
            // Tells the browser to promote this element to its own GPU layer
            willChange: "transform",
          }}
        />
      </svg>
    </div>
  );
}
