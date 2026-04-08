import type { Metadata } from "next";

// Nested layout for /embed/* — the root layout still renders above this
// (it always does in App Router), but ChromeHider inside the page injects
// global CSS that hides the Navbar/Footer/GrainOverlay/ConvaiWidget so the
// iframe content looks borderless.
//
// Noindex: we don't want Google indexing the embed variants.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="embed-root">{children}</div>;
}
