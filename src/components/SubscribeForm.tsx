"use client";

import { useState } from "react";

// Newsletter signup form — POSTs to /api/subscribe.
// Shows a success state after submission (the actual confirmation happens
// via email click-through, per double opt-in).
export function SubscribeForm({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setStatus("sent");
        setEmail("");
      } else if (res.status === 429) {
        setStatus("error");
        setMsg("Too many requests. Try again in a minute.");
      } else {
        setStatus("error");
        setMsg("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <p className="text-sm text-da-cyan">
        Check your inbox — confirm to finish subscribing.
      </p>
    );
  }

  const isCompact = variant === "compact";
  return (
    <form
      onSubmit={onSubmit}
      className={
        isCompact
          ? "flex w-full max-w-sm gap-2"
          : "mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row"
      }
    >
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
        className="flex-1 rounded-lg border border-da-border bg-da-surface px-4 py-3 text-sm text-da-text outline-none focus:border-da-indigo"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-da-indigo px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "..." : "Subscribe"}
      </button>
      {msg && (
        <p className="text-xs text-red-400" role="alert">
          {msg}
        </p>
      )}
    </form>
  );
}
