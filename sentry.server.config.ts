// Sentry server-side init (Node + Edge runtimes pick this up via
// instrumentation.ts). No-op when SENTRY_DSN is unset, matching the
// optional-integration pattern used for Resend / Telegram / PostHog.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Free tier has tight quotas — sample 10% of transactions in prod,
    // 100% locally where volume is low. Errors are always sent regardless
    // of tracesSampleRate.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Strip query strings from URLs so we don't accidentally log tokens
    // (e.g. ?token= on /api/unsubscribe). Headers + body still flow.
    sendDefaultPii: false,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA,
  });
}
