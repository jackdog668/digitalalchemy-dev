"use client";

import { useState } from "react";
import type { CustomQuestion } from "@/lib/scheduling-constants";
import type { Slot } from "./types";

interface Props {
  slug: string;
  slot: Slot;
  timezone: string;
  customQuestions: CustomQuestion[];
  onBack: () => void;
  onSuccess: (cancelToken: string) => void;
}

const inputCls =
  "w-full rounded-lg border border-da-border bg-da-dark px-4 py-3 text-da-text outline-none focus:border-da-indigo";

export function BookingForm({
  slug,
  slot,
  timezone,
  customQuestions,
  onBack,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    fetch("/api/scheduling/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        startUtc: slot.startUtc,
        name: name.trim(),
        email: email.trim(),
        notes: notes.trim() || undefined,
        customAnswers,
        timezone,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Booking failed");
        }
        onSuccess(data.cancelToken);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSubmitting(false));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-lg border border-da-indigo/30 bg-da-indigo/5 p-4 text-sm">
        <p className="font-semibold">{slot.startLocal}</p>
        <p className="text-da-muted">Times shown in {timezone}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-da-muted">Your name</label>
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={200}
          autoFocus
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-da-muted">Email</label>
        <input
          className={inputCls}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={254}
        />
      </div>

      {customQuestions.map((q) => {
        const isTextArea = q.type === "long_text";
        return (
          <div key={q.label}>
            <label className="mb-1 block text-sm text-da-muted">
              {q.label}
              {q.required && <span className="text-red-400"> *</span>}
            </label>
            {isTextArea ? (
              <textarea
                className={`${inputCls} min-h-[80px]`}
                required={q.required}
                value={customAnswers[q.label] ?? ""}
                onChange={(e) =>
                  setCustomAnswers((a) => ({
                    ...a,
                    [q.label]: e.target.value,
                  }))
                }
              />
            ) : (
              <input
                className={inputCls}
                type={q.type === "phone" ? "tel" : "text"}
                required={q.required}
                value={customAnswers[q.label] ?? ""}
                onChange={(e) =>
                  setCustomAnswers((a) => ({
                    ...a,
                    [q.label]: e.target.value,
                  }))
                }
              />
            )}
          </div>
        );
      })}

      <div>
        <label className="mb-1 block text-sm text-da-muted">
          Anything else I should know? (optional)
        </label>
        <textarea
          className={`${inputCls} min-h-[80px]`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="text-sm text-da-muted hover:text-da-text disabled:opacity-50"
        >
          ← Pick a different time
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-da-indigo px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Booking..." : "Confirm booking"}
        </button>
      </div>
    </form>
  );
}
