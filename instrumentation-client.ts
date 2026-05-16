// Sentry client-side init. Runs once per page load in the browser.
// In Sentry SDK v10+, the client config lives in instrumentation-client.ts
// (root of the project) rather than the older sentry.client.config.ts.
// No-op when NEXT_PUBLIC_SENTRY_DSN is unset.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // No replay / no session tracking by default — keeps bundle slim and
    // avoids quota burn. Turn on later via { integrations: [...] } if needed.
    integrations: [],
    sendDefaultPii: false,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
  });
}

// Required by Next.js client instrumentation hook; Sentry exports this for us.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
