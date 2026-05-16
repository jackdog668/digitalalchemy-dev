// Next.js instrumentation hook. Runs once per server process at boot
// (Node runtime) or once per cold start (Edge runtime). We use it to
// pick the right Sentry config file for the current runtime.
//
// Sentry is opt-in: if SENTRY_DSN is unset, the config files no-op and
// nothing is reported. Matches the Resend / Telegram / PostHog pattern.

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Required by Sentry's Next.js SDK to surface request-handler errors.
export const onRequestError = Sentry.captureRequestError;
