// GrainOverlay — fixed full-viewport film grain texture.
//
// Static — the previous version animated this rect at 0.5s linear infinite,
// which forced the browser to recompute an SVG `feTurbulence` filter across
// the entire viewport every frame. Crushed mobile FPS for a barely-perceptible
// shimmer. Static grain reads identical to the eye and costs zero per-frame.
//
// No client behavior — server component (no `"use client"`) so zero JS ships.
// Accessibility: pointer-events-none + aria-hidden — fully inert.

export function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
      style={{ opacity: 0.035 }}
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
