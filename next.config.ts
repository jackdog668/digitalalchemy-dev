import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Tree-shake heavy named-export libraries so unused exports don't ship.
  // framer-motion is the big one — it's imported in 14 files including
  // foundational components (Button, Card, SectionHeading), so even pages
  // that only use one or two animations were paying the full bundle cost.
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.microlink.io",
      },
    ],
  },
  async headers() {
    return [
      // Default hardened headers for everything EXCEPT /embed/*.
      // Using a negative-lookahead regex on the source so we don't clobber
      // the more permissive rule below.
      {
        source: "/((?!embed).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Cross-origin isolation — defense-in-depth against Spectre-style
          // cross-origin leaks. `same-origin` is strict but compatible with
          // our existing setup (no third-party windows opening us back).
          // Iframe-embedded PayPal popup is unaffected because it opens a
          // NEW window, not embeds us.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          {
            // Content Security Policy — locks down what the browser is
            // allowed to load and execute. Removed 'unsafe-eval' (was a
            // notable hole; allowed any script to call eval/new Function).
            // 'unsafe-inline' for scripts is still here because Next.js
            // injects inline bootstrap scripts and switching to nonces is
            // a bigger refactor — revisit if/when targeted. PostHog and
            // jsdelivr stay whitelisted for analytics + the unicornstudio
            // CDN-loaded WebGL hero scene.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Removed unpkg.com when the ElevenLabs ConvaiWidget was retired
              // (the floating "Chat with an Alchemist" button never worked).
              // Smaller script-src allowlist = smaller XSS footprint.
              "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://*.posthog.com https://www.paypal.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https: data:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https:",
              // Luma (lu.ma + luma.com, plus wildcards for their CDN subdomains)
              // is whitelisted for the /events page's embedded calendar iframe.
              // Without these the iframe loads but the browser silently refuses
              // to render it — symptom is a blank gray box, no user-visible error
              // (the CSP violation only surfaces in DevTools Console).
              "frame-src https://www.paypal.com https://www.sandbox.paypal.com https://lu.ma https://*.lu.ma https://luma.com https://*.luma.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // /embed/* is explicitly iframe-friendly (that's the whole point of
      // the BookingWidget). We drop X-Frame-Options here and rely on
      // Content-Security-Policy: frame-ancestors * to allow embedding on
      // any marketing site. Tighten later if needed (e.g. whitelist specific
      // partner origins).
      {
        source: "/embed/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

// Wrap with Sentry's plugin ONLY when SENTRY_DSN is configured. Without
// the wrap the SDK's runtime init still no-ops cleanly — wrapping when
// unconfigured would just log a noisy "no auth token" warning every build.
const finalConfig: NextConfig = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      // Source map upload — only runs in CI when SENTRY_AUTH_TOKEN is set,
      // otherwise the plugin silently skips it.
      silent: !process.env.CI,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // Source-map handling: delete the .map files from the client bundle
      // after upload so the DSN / org / project triple isn't leaked in
      // production. (Sentry v10 renamed `hideSourceMaps` to nested
      // `sourcemaps.deleteSourcemapsAfterUpload`.)
      sourcemaps: { deleteSourcemapsAfterUpload: true },
      // Tree-shake unused Sentry SDK code — saves ~30KB on the client bundle
      // because we don't use Sentry.logger.debug() etc.
      disableLogger: true,
    })
  : nextConfig;

export default finalConfig;
