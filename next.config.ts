import type { NextConfig } from "next";

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
              "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://*.posthog.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https: data:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https:",
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

export default nextConfig;
