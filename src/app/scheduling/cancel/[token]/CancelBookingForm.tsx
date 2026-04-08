"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  token: string;
  alreadyCancelled: boolean;
}

export function CancelBookingForm({ token, alreadyCancelled }: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(alreadyCancelled);
  const [error, setError] = useState("");

  function onCancel() {
    setError("");
    setSubmitting(true);
    fetch("/api/scheduling/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, reason: reason.trim() || undefined }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Cancel failed");
        setDone(true);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSubmitting(false));
  }

  if (done) {
    return (
      <div className="rounded-lg border border-da-indigo/30 bg-da-indigo/5 p-4 text-sm">
        <p className="font-semibold">This booking is cancelled.</p>
        <p className="mt-1 text-da-muted">
          Both you and the host have been notified.
        </p>
        <Link
          href="/book"
          className="mt-4 inline-block text-sm text-da-indigo hover:text-da-cyan"
        >
          Pick a new time →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-da-muted">
        Reason (optional)
      </label>
      <textarea
        className="w-full rounded-lg border border-da-border bg-da-dark px-4 py-3 text-da-text outline-none focus:border-da-indigo"
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={2000}
        placeholder="Anything you'd like to share?"
      />
      {error && (
        <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg bg-red-500/20 px-5 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-50"
        >
          {submitting ? "Cancelling..." : "Cancel this booking"}
        </button>
        <Link
          href="/"
          className="text-sm text-da-muted hover:text-da-text"
        >
          Keep it
        </Link>
      </div>
    </div>
  );
}
