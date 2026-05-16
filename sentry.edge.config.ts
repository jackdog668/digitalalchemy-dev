// Sentry edge-runtime init — used by middleware.ts and any route with
// `export const runtime = "edge"`. Same shape as sentry.server.config.ts.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    sendDefaultPii: false,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA,
  });
}
