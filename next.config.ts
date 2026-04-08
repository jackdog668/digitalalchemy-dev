import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
