"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

// Dynamically import to avoid SSR issues with WebGL.
// We also gate on viewport width — WebGL on mobile melts batteries and
// torches LCP. Mobile users get the static gradient overlay instead, which
// is already rendered as the fallback below the WebGL layer.
const UnicornScene = dynamic(() => import("unicornstudio-react/next"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-da-darker" aria-hidden="true" />
  ),
});

// Stricter gate: real desktop only.
//   - min-width 1024px excludes phones AND most tablets
//   - pointer: fine excludes ALL touch devices (iPad, touch laptops in tablet mode)
// Mobile/tablet users get the static gradient overlay below — no WebGL,
// no SDK download, no battery drain, no LCP regression.
const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";

// Subscribing to matchMedia via useSyncExternalStore avoids the
// React 19 "set-state-in-effect" cascade and gives us a stable SSR
// snapshot (mobile-first default — no WebGL until we confirm desktop).
function subscribeToMedia(onChange: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getMediaSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getServerMediaSnapshot() {
  return false;
}

export function UnicornHero() {
  const isDesktop = useSyncExternalStore(
    subscribeToMedia,
    getMediaSnapshot,
    getServerMediaSnapshot,
  );

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      {isDesktop && (
        <UnicornScene
          projectId="MVkjffIpWmaJtF0iIv18"
          sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.5/dist/unicornStudio.umd.js"
          width="100%"
          height="100%"
          lazyLoad={true}
          dpi={1}
          scale={1}
          fps={30}
        />
      )}
      {/* Dark gradient overlay — also doubles as the mobile fallback so the
          hero never looks empty when WebGL is gated off. */}
      <div className="absolute inset-0 bg-gradient-to-b from-da-dark/40 via-da-dark/60 to-da-dark" />
    </div>
  );
}
