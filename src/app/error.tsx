"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

// Page-level error boundary. Catches uncaught errors thrown during render
// or in client components below the root layout. The root layout keeps
// rendering (nav, footer, fonts) — only the page swap fails over.
//
// For errors thrown in the root layout itself, see global-error.tsx.

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PageError({ error, reset }: Props) {
  useEffect(() => {
    // Vercel captures stdout; this lands in deployment logs. When Sentry is
    // wired (WS6), this will also auto-report via the Next SDK instrumentation.
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-6xl font-bold text-da-indigo">
        Hmm.
      </h1>
      <p className="mt-4 text-2xl font-semibold text-da-text">
        Something on our end tripped up.
      </p>
      <p className="mt-2 max-w-md text-da-muted">
        We&apos;ve been notified. Try again — usually it&apos;s a hiccup, not a
        haunting. If it keeps happening,{" "}
        <a
          href="mailto:hello@digitalalchemy.dev"
          className="text-da-indigo underline decoration-da-indigo/40 underline-offset-4 hover:decoration-da-indigo"
        >
          email Desi
        </a>
        .
      </p>

      {error.digest && (
        <p className="mt-4 text-xs text-da-muted">
          Error reference: <code className="text-da-muted">{error.digest}</code>
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset} variant="primary" size="lg">
          Try again
        </Button>
        <Button href="/" variant="ghost" size="lg">
          Back home
        </Button>
      </div>
    </div>
  );
}
