// Server Component (no "use client") — just renders a <style> tag with
// a fully static CSS string. No user input, no interpolation, no XSS
// surface. We avoid dangerouslySetInnerHTML and rely on React's normal
// text-node rendering inside <style>.
//
// Why this exists: App Router always renders the root layout for every
// page, including /embed/[slug]. That means Navbar, Footer, GrainOverlay,
// and ConvaiWidget are ALWAYS in the DOM. Rather than refactor the root
// layout into a route group (big blast radius), we inject this <style>
// block on embed pages that globally hides those chrome elements.
//
// Selectors target what we confirmed exists in the Phase 4 exploration:
//   - <header> (framer-motion wraps Navbar in a <motion.header>)
//   - <footer> (Footer.tsx)
//   - <div aria-hidden="true" class="pointer-events-none fixed inset-0 ...">
//       (GrainOverlay.tsx — targeted via [aria-hidden])
//   - ConvaiWidget injects an <elevenlabs-convai> web component
//
// Also zeroes out the root <main> padding and makes the background
// transparent so the iframe host page's background shows through.

const EMBED_CSS = `
  header:has(nav),
  footer,
  div[aria-hidden="true"].fixed.inset-0,
  elevenlabs-convai,
  [class*="convai" i] { display: none !important; }
  body > main { min-height: 0 !important; }
  html, body { background: transparent !important; }
`;

export function ChromeHider() {
  return <style>{EMBED_CSS}</style>;
}
