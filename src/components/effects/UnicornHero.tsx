"use client";

import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues with WebGL
const UnicornScene = dynamic(() => import("unicornstudio-react/next"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-da-darker" aria-hidden="true" />
  ),
});

export function UnicornHero() {
  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <UnicornScene
        projectId="ujYM8acC6p2g3clIqwE6"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.5/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={false}
        dpi={1.5}
        scale={1}
        fps={60}
      />
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-da-dark/40 via-da-dark/60 to-da-dark" />
    </div>
  );
}
