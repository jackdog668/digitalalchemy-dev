"use client";

import { useEffect } from "react";

// Last-resort error boundary. Catches errors thrown inside the root layout
// (layout.tsx) itself — e.g. font loader failing, providers blowing up.
// Renders its OWN <html><body> because the root layout's <html> never
// rendered. Keep this file FRAMEWORK-LESS: no fonts, no providers, no
// brand components that might also be broken. Inline styles only.

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[global-error-boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#0A0B0D",
          color: "#E8E8E8",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 700,
              margin: 0,
              color: "#6366F1",
            }}
          >
            Site is having a moment.
          </h1>
          <p style={{ marginTop: "1rem", color: "#A1A1AA" }}>
            Something low-level broke before the page could even render. Try
            refreshing in a few seconds. If this sticks around, email{" "}
            <a
              href="mailto:hello@digitalalchemy.dev"
              style={{ color: "#6366F1" }}
            >
              hello@digitalalchemy.dev
            </a>
            .
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.75rem",
                color: "#71717A",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#6366F1",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
